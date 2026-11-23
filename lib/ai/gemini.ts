/**
 * Server-only Gemini client tuned for the free tier.
 *
 * - The API key never leaves the server.
 * - Free-tier quotas are per model, so requests are spread across every free text model the key
 *   can use (discovered via ListModels, cached): lite Gemini models first (highest free limits,
 *   least congested), then full flash models, then Gemma models (very generous free limits).
 * - Requests are hedged: two different models are asked at once and the first valid answer wins,
 *   which cuts waiting time when one model is overloaded (503) or out of quota (429).
 * - Models that return 429/503/404 or time out are cooled down for a while so later requests
 *   skip them instead of waiting on them again.
 * - Returns parsed JSON or throws a coded error; callers fall back to static logic.
 */

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const FALLBACK_MODELS = ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemma-3-27b-it'];
const MAX_MODELS = 10;
const PARALLEL = 2;
const ATTEMPT_MS = 12000;

let workingModel: string | null = null;
let discovered: { models: string[]; at: number } | null = null;
const coolUntil = new Map<string, number>();

export class AiError extends Error {
  constructor(public code: 'missing_key' | 'api_error' | 'timeout' | 'invalid_response', detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
  }
}

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const isGemma = (name: string) => /^gemma-/.test(name);
const isLite = (name: string) => /lite/.test(name);

function versionOf(name: string): number {
  const match = name.match(/^(?:gemini|gemma)-(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function sizeOf(name: string): number {
  const match = name.match(/-(\d+)b\b/);
  return match ? Number(match[1]) : 0;
}

function cool(model: string, ms: number) {
  coolUntil.set(model, Date.now() + ms);
  if (workingModel === model) workingModel = null;
}

const cooling = (model: string) => (coolUntil.get(model) ?? 0) > Date.now();

/** Models currently skipped, with seconds left (for the diagnostic probe). */
export function coolingModels(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [model, until] of coolUntil) {
    const left = Math.round((until - Date.now()) / 1000);
    if (left > 0) out[model] = left;
  }
  return out;
}

/** Free text-generation models this key can use: Gemini flash (lite first) and Gemma. Cached for 6 hours. */
export async function discoverModels(): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return [];
  if (discovered && Date.now() - discovered.at < 6 * 3600_000) return discovered.models;
  try {
    const response = await fetch(`${BASE}?pageSize=300`, {
      headers: { 'x-goog-api-key': key },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store'
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
    const names = (body.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter((n) => !/(image|tts|audio|live|thinking|exp|embedding|native|computer|robotics|vision)/.test(n));

    const preview = (n: string) => (/preview/.test(n) ? 1 : 0);
    const flash = names
      .filter((n) => /^gemini-\d+(\.\d+)?-flash/.test(n))
      .sort((a, b) => preview(a) - preview(b) || versionOf(b) - versionOf(a) || a.length - b.length);
    const lite = flash.filter(isLite);
    const full = flash.filter((n) => !isLite(n));
    const gemma = names
      .filter((n) => /^gemma-\d+(\.\d+)?-/.test(n) && sizeOf(n) >= 12)
      .sort((a, b) => versionOf(b) - versionOf(a) || sizeOf(b) - sizeOf(a));

    // Lite first (best free limits), then full flash, then the larger Gemma models.
    const models = [...lite.slice(0, 3), ...full.slice(0, 3), ...gemma.slice(0, 2)];
    discovered = { models, at: Date.now() };
    return models;
  } catch {
    return [];
  }
}

async function candidateModels(): Promise<string[]> {
  const configured = (process.env.GEMINI_MODEL || '').trim();
  const found = await discoverModels();
  const list = [...new Set([configured, workingModel, ...found, ...FALLBACK_MODELS].filter((m): m is string => Boolean(m)))].slice(0, MAX_MODELS);
  const ready = list.filter((m) => !cooling(m));
  // If everything is cooling down, try the ones that recover soonest rather than giving up.
  return ready.length ? ready : list.sort((a, b) => (coolUntil.get(a) ?? 0) - (coolUntil.get(b) ?? 0));
}

/** Keep latency low: these are short classification / grading tasks. */
function thinkingFor(model: string): Record<string, unknown> | undefined {
  if (isGemma(model)) return undefined;
  if (/2\.5-flash/.test(model)) return { thinkingBudget: 0 };
  if (versionOf(model) >= 3) return { thinkingLevel: 'low' };
  return undefined;
}

type GenerateOptions = {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

class AttemptError extends Error {
  constructor(public code: AiError['code'], public note: string) {
    super(note);
  }
}

function requestBody(model: string, options: GenerateOptions, thinking: Record<string, unknown> | undefined) {
  const generationConfig: Record<string, unknown> = {
    temperature: options.temperature ?? 0.3,
    maxOutputTokens: options.maxOutputTokens ?? 2048
  };
  const safetySettings = [
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
  ];
  if (isGemma(model)) {
    // Gemma on the Gemini API has no system instructions or JSON mode: put both in the prompt.
    const text = `${options.system}\n\nRespond with ONLY one JSON object (no markdown, no commentary) that matches this JSON schema:\n${JSON.stringify(options.schema)}\n\n---\n\n${options.prompt}`;
    return { contents: [{ role: 'user', parts: [{ text }] }], generationConfig, safetySettings };
  }
  return {
    systemInstruction: { parts: [{ text: options.system }] },
    contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
    generationConfig: {
      ...generationConfig,
      responseMimeType: 'application/json',
      responseSchema: options.schema,
      ...(thinking ? { thinkingConfig: thinking } : {})
    },
    safetySettings
  };
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('non-JSON');
  }
}

/** Seconds from a 429 body's RetryInfo, if present. */
function retryDelayMs(body: unknown): number | null {
  const details = (body as { error?: { details?: { retryDelay?: string }[] } } | null)?.error?.details ?? [];
  for (const d of details) {
    const match = typeof d?.retryDelay === 'string' ? d.retryDelay.match(/^(\d+(?:\.\d+)?)s$/) : null;
    if (match) return Math.ceil(Number(match[1]) * 1000);
  }
  return null;
}

async function attempt(model: string, options: GenerateOptions, key: string, timeoutMs: number, outer: AbortSignal): Promise<unknown> {
  let thinking = thinkingFor(model);
  for (let round = 0; round < 2; round++) {
    let response: Response;
    try {
      response = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(requestBody(model, options, thinking)),
        signal: AbortSignal.any([AbortSignal.timeout(timeoutMs), outer]),
        cache: 'no-store'
      });
    } catch (error) {
      if (outer.aborted) throw new AttemptError('timeout', `${model}=cancelled`);
      const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
      cool(model, timeout ? 30_000 : 15_000);
      throw new AttemptError(timeout ? 'timeout' : 'api_error', `${model}=${timeout ? 'timeout' : 'network'}`);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { message?: string; status?: string } } | null;
      const message = body?.error?.message ?? '';
      const note = `${model}=${response.status} (${`${body?.error?.status ?? ''} ${message.slice(0, 80)}`.trim()})`;
      // A rejected thinking config: retry the same model once without it.
      if (response.status === 400 && thinking && /thinking/i.test(message)) {
        thinking = undefined;
        continue;
      }
      if (response.status === 429) cool(model, Math.min(Math.max(retryDelayMs(body) ?? 60_000, 20_000), 10 * 60_000));
      else if (response.status === 404 || response.status === 403) cool(model, 6 * 3600_000);
      else if (response.status === 400) cool(model, 3600_000);
      else cool(model, 20_000);
      throw new AttemptError('api_error', note);
    }

    const payload = (await response.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
    } | null;
    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
    if (!text) throw new AttemptError('invalid_response', `${model}=empty (${payload?.candidates?.[0]?.finishReason ?? 'no text'})`);
    try {
      return parseJson(text);
    } catch {
      throw new AttemptError('invalid_response', `${model}=non-JSON`);
    }
  }
  throw new AttemptError('api_error', `${model}=rejected config`);
}

export async function generateJson(options: GenerateOptions): Promise<{ data: unknown; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError('missing_key');

  const deadline = Date.now() + (options.timeoutMs ?? 24000);
  const queue = await candidateModels();
  const tried: string[] = [];
  let lastCode: AiError['code'] = 'api_error';

  while (queue.length) {
    const remaining = deadline - Date.now();
    if (remaining < 3000) throw new AiError('timeout', `out of time; tried: ${tried.join('; ')}`);
    const wave = queue.splice(0, PARALLEL);
    const controller = new AbortController();
    const perAttempt = Math.min(remaining, ATTEMPT_MS);
    try {
      // Hedge across different models (separate free quotas); first valid answer wins.
      const winner = await Promise.any(
        wave.map((model) =>
          attempt(model, options, key, perAttempt, controller.signal).then((data) => ({ data, model }))
        )
      );
      controller.abort();
      workingModel = winner.model;
      return winner;
    } catch (error) {
      const errors = error instanceof AggregateError ? error.errors : [error];
      for (const e of errors) {
        if (e instanceof AttemptError) {
          tried.push(e.note);
          lastCode = e.code;
        }
      }
    }
  }
  throw new AiError(lastCode, `tried: ${tried.join('; ')}`);
}
