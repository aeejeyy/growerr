/**
 * Server-only Gemini client (generateContent with a JSON response schema).
 *
 * - The API key never leaves the server.
 * - Model choice: GEMINI_MODEL if set, then the newest text "flash" models this key can
 *   actually use (discovered via ListModels and cached), then stable aliases.
 *   Google retires model ids regularly, so nothing here depends on one hard-coded id.
 * - Falls through to the next model on 400/404/429/5xx/timeouts within a time budget.
 * - Returns parsed JSON or throws a coded error; callers fall back to static logic.
 */

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
const MAX_MODELS = 6;

let workingModel: string | null = null;
let discovered: { models: string[]; at: number } | null = null;

export class AiError extends Error {
  constructor(public code: 'missing_key' | 'api_error' | 'timeout' | 'invalid_response', detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
  }
}

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function versionOf(name: string): number {
  const match = name.match(/gemini-(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

/** Text-generation "flash" models available to this key, newest stable first. Cached for 6 hours. */
export async function discoverModels(): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return [];
  if (discovered && Date.now() - discovered.at < 6 * 3600_000) return discovered.models;
  try {
    const response = await fetch(`${BASE}?pageSize=200`, {
      headers: { 'x-goog-api-key': key },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store'
    });
    if (!response.ok) return [];
    const body = (await response.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
    const rank = (n: string) => (/preview/.test(n) ? 2 : 0) + (/lite/.test(n) ? 1 : 0);
    const models = (body.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter((n) => /^gemini-\d+(\.\d+)?-flash/.test(n) && !/(image|tts|audio|live|thinking|exp|embedding|native|computer)/.test(n))
      .sort((a, b) => versionOf(b) - versionOf(a) || rank(a) - rank(b) || a.length - b.length);
    discovered = { models, at: Date.now() };
    return models;
  } catch {
    return [];
  }
}

async function candidateModels(): Promise<string[]> {
  const configured = (process.env.GEMINI_MODEL || '').trim();
  const found = await discoverModels();
  // Alternate full and lite models: when one tier is congested (503), the other often isn't.
  const full = found.filter((m) => !/lite/.test(m));
  const lite = found.filter((m) => /lite/.test(m));
  const interleaved = [full[0], lite[0], full[1], lite[1], full[2]];
  const list = [workingModel, configured, ...interleaved, ...FALLBACK_MODELS].filter((m): m is string => Boolean(m));
  return [...new Set(list)].slice(0, MAX_MODELS);
}

/** Keep latency low: these are short classification / grading tasks. */
function thinkingFor(model: string): Record<string, unknown> | undefined {
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

export async function generateJson(options: GenerateOptions): Promise<{ data: unknown; model: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AiError('missing_key');

  let lastError: AiError = new AiError('api_error');
  const deadline = Date.now() + (options.timeoutMs ?? 18000);
  const tried: string[] = [];

  for (const model of await candidateModels()) {
    // Each model gets one try with a thinking config (if relevant) and one without, if the config is rejected.
    let thinking = thinkingFor(model);
    for (let attempt = 0; attempt < 2; attempt++) {
      const remaining = deadline - Date.now();
      if (remaining < 2500) throw new AiError(lastError.code, `out of time; tried: ${tried.join('; ')}`);
      tried.push(model);
      let response: Response;
      try {
        response = await fetch(`${BASE}/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: options.system }] },
            contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: options.schema,
              temperature: options.temperature ?? 0.3,
              maxOutputTokens: options.maxOutputTokens ?? 2048,
              ...(thinking ? { thinkingConfig: thinking } : {})
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
          }),
          signal: AbortSignal.timeout(Math.min(remaining, 9000)),
          cache: 'no-store'
        });
      } catch (error) {
        const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        tried[tried.length - 1] = `${model}=${timeout ? 'timeout' : 'network'}`;
        lastError = new AiError(timeout ? 'timeout' : 'api_error', `${model} ${timeout ? 'timed out' : 'network error'}`);
        if (workingModel === model) workingModel = null;
        break;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: { message?: string; status?: string } } | null;
        const message = body?.error?.message ?? '';
        tried[tried.length - 1] = `${model}=${response.status} (${`${body?.error?.status ?? ''} ${message.slice(0, 90)}`.trim()})`;
        lastError = new AiError('api_error', `${model} unavailable (${response.status})`);
        if (workingModel === model) workingModel = null;
        // A rejected thinking config: retry the same model without it.
        if (response.status === 400 && thinking && /thinking/i.test(message)) {
          thinking = undefined;
          continue;
        }
        if ([400, 403, 404, 429, 500, 502, 503, 504].includes(response.status)) break;
        throw new AiError('api_error', `${model} status ${response.status}`);
      }

      const payload = (await response.json().catch(() => null)) as {
        candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
      } | null;
      const parts = payload?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
      if (!text) throw new AiError('invalid_response', `${model} ${payload?.candidates?.[0]?.finishReason ?? 'empty'}`);
      try {
        const data = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
        workingModel = model;
        return { data, model };
      } catch {
        throw new AiError('invalid_response', `${model} returned non-JSON`);
      }
    }
  }
  throw new AiError(lastError.code, `tried: ${tried.join('; ')}`);
}
