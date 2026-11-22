import { NextResponse } from 'next/server';
import {
  GEMINI_ENDPOINT_V1,
  GEMINI_MODEL,
  buildAdviceReply,
  buildGeminiRequest,
  buildSensitiveReply,
  buildStaticReply,
  detectSensitive,
  extractGeminiText,
  isAdviceRequest,
  isCompletedInteraction,
  normaliseModelReply,
  type CoachTurn
} from '../../../lib/education';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

type CoachRequestBody = {
  message?: unknown;
  history?: unknown;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normaliseHistory(value: unknown): CoachTurn[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => ({
      role: entry.role === 'guide' ? ('guide' as const) : ('user' as const),
      text: asString(entry.text).slice(0, 800)
    }))
    .filter((turn) => turn.text.length > 0)
    .slice(-6);
}

function parseJsonText(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(trimmed);
}

function staticResponse(reason: string, reply = buildStaticReply('', reason)) {
  return NextResponse.json({ mode: 'static', reason, reply }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  let body: CoachRequestBody;
  try {
    body = (await request.json()) as CoachRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers: NO_STORE });
  }

  const message = asString(body.message).slice(0, 1200);
  if (!message) {
    return NextResponse.json({ error: 'A message is required.' }, { status: 400, headers: NO_STORE });
  }

  if (detectSensitive(message)) {
    return NextResponse.json(
      { mode: 'static', reason: 'sensitive', reply: buildSensitiveReply() },
      { headers: NO_STORE }
    );
  }

  if (isAdviceRequest(message)) {
    return NextResponse.json(
      { mode: 'static', reason: 'advice_boundary', reply: buildAdviceReply() },
      { headers: NO_STORE }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return staticResponse('missing_key', buildStaticReply(message, 'missing_key'));

  const endpoint = process.env.GEMINI_ENDPOINT || GEMINI_ENDPOINT_V1;
  const model = process.env.GEMINI_MODEL || GEMINI_MODEL;
  const history = normaliseHistory(body.history);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(buildGeminiRequest(message, history, model)),
      signal: AbortSignal.timeout(15000),
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Gemini coach request was rejected by the provider.');
      return staticResponse('api_error', buildStaticReply(message, 'api_error'));
    }

    const payload: unknown = await response.json();
    if (!isCompletedInteraction(payload)) {
      return staticResponse('invalid_model_response', buildStaticReply(message, 'invalid_model_response'));
    }

    const text = extractGeminiText(payload);
    if (!text) {
      return staticResponse('invalid_model_response', buildStaticReply(message, 'invalid_model_response'));
    }

    let parsed: unknown;
    try {
      parsed = parseJsonText(text);
    } catch {
      return staticResponse('invalid_model_response', buildStaticReply(message, 'invalid_model_response'));
    }

    const reply = normaliseModelReply(parsed, message);
    if (!reply) {
      return staticResponse('invalid_model_response', buildStaticReply(message, 'invalid_model_response'));
    }

    return NextResponse.json({ mode: 'ai', reply }, { headers: NO_STORE });
  } catch {
    console.error('Gemini coach request failed before a response was received.');
    return staticResponse('api_error', buildStaticReply(message, 'api_error'));
  }
}
