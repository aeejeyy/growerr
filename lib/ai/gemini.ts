/**
 * Server-only Gemini client (generateContent with a JSON response schema).
 *
 * - The API key never leaves the server.
 * - Tries the configured model first, then known-good fallbacks on 404/400 model errors.
 * - Returns parsed JSON or throws a coded error; callers fall back to static logic.
 */

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.0-flash'];

let workingModel: string | null = null;

export class AiError extends Error {
  constructor(public code: 'missing_key' | 'api_error' | 'timeout' | 'invalid_response', detail?: string) {
    super(detail ? `${code}: ${detail}` : code);
  }
}

export function aiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function candidateModels(): string[] {
  const configured = (process.env.GEMINI_MODEL || '').trim();
  const list = [workingModel, configured, ...FALLBACK_MODELS].filter((m): m is string => Boolean(m));
  return [...new Set(list)];
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
  const deadline = Date.now() + (options.timeoutMs ?? 24000);
  const tried: string[] = [];
  for (const model of candidateModels()) {
    const remaining = deadline - Date.now();
    if (remaining < 2500) break;
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
            // Thinking adds many seconds of latency; these are short classification tasks.
            ...(/2\.5-flash/.test(model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            ...(/gemini-3/.test(model) ? { thinkingConfig: { thinkingLevel: 'low' } } : {})
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
          ]
        }),
        signal: AbortSignal.timeout(Math.min(remaining, 12000)),
        cache: 'no-store'
      });
    } catch (error) {
      const timeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
      tried[tried.length - 1] = `${model}=${timeout ? 'timeout' : 'network'}`;
      lastError = new AiError(timeout ? 'timeout' : 'api_error', `${model} ${timeout ? 'timed out' : 'network error'}`);
      if (workingModel === model) workingModel = null;
      continue;
    }

    if ([400, 404, 429, 500, 503].includes(response.status)) {
      // Unknown, unsupported, rate-limited or overloaded model — try the next candidate.
      const body = (await response.json().catch(() => null)) as { error?: { message?: string; status?: string } } | null;
      const reason = `${body?.error?.status ?? ''} ${(body?.error?.message ?? '').slice(0, 90)}`.trim();
      tried[tried.length - 1] = `${model}=${response.status}${reason ? ` (${reason})` : ''}`;
      lastError = new AiError('api_error', `${model} unavailable (${response.status})`);
      if (workingModel === model) workingModel = null;
      continue;
    }
    if (!response.ok) throw new AiError('api_error', `${model} status ${response.status}`);

    const payload = (await response.json().catch(() => null)) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
    } | null;
    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    const text = parts.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
    if (!text) throw new AiError('invalid_response', payload?.candidates?.[0]?.finishReason ?? 'empty');
    try {
      const data = JSON.parse(text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
      workingModel = model;
      return { data, model };
    } catch {
      throw new AiError('invalid_response', 'not json');
    }
  }
  throw new AiError(lastError.code, `tried: ${tried.join('; ')}`);
}
