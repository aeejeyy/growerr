import { NextResponse } from 'next/server';
import {
  GEMINI_ENDPOINT_V1,
  GEMINI_MODEL,
  buildAdviceReply,
  detectSensitive,
  extractGeminiText,
  isAdviceRequest,
  isCompletedInteraction,
  safeEcho
} from '../../../lib/education';
import {
  buildEvaluationRequest,
  normaliseDiscoveryReply,
  normaliseEvaluationReply
} from '../../../lib/journey/ai';
import {
  buildDiscoveryRequest,
  buildStaticDiscoveryReply
} from '../../../lib/journey/discovery';
import { staticEvaluateStep } from '../../../lib/journey/evaluation';
import { getStep } from '../../../lib/journey/scenarios';
import type { CoachTurn, DiscoveryReply, EvaluationResult } from '../../../lib/journey/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

type JourneyBody = {
  stage?: unknown;
  message?: unknown;
  history?: unknown;
  scenarioId?: unknown;
  stepId?: unknown;
  answer?: unknown;
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normaliseHistory(value: unknown, limit = 40): CoachTurn[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
    .map((entry) => ({
      role: entry.role === 'guide' ? ('guide' as const) : ('user' as const),
      text: safeEcho(asString(entry.text), 800)
    }))
    .filter((turn) => turn.text.length > 0)
    .slice(-limit);
}

function parseJsonText(text: string): unknown {
  return JSON.parse(
    text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
  );
}

async function callGemini(input: object): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('missing_key');
  const endpoint = process.env.GEMINI_ENDPOINT || GEMINI_ENDPOINT_V1;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('api_error');
  const payload: unknown = await response.json();
  if (!isCompletedInteraction(payload)) throw new Error('invalid_model_response');
  const text = extractGeminiText(payload);
  if (!text) throw new Error('invalid_model_response');
  return parseJsonText(text);
}

function discoveryResponse(reply: DiscoveryReply, mode: 'ai' | 'static', reason?: string) {
  return NextResponse.json({ stage: 'discovery', mode, reason, reply }, { headers: NO_STORE });
}

function discoveryStatic(message: string, reason: string) {
  return discoveryResponse(buildStaticDiscoveryReply(message, reason), 'static', reason);
}

function evaluationResponse(result: EvaluationResult, mode: 'ai' | 'static', reason?: string) {
  return NextResponse.json({ stage: 'evaluate', mode, reason, result }, { headers: NO_STORE });
}

function withNotice(reply: DiscoveryReply, reason: string): DiscoveryReply {
  const notices: Record<string, string> = {
    api_error: 'The AI service did not respond, so this is the built-in discovery guide.',
    invalid_model_response: 'The AI response could not be checked safely, so this is the built-in discovery guide.'
  };
  return { ...reply, notice: notices[reason] ?? reply.notice };
}

export async function POST(request: Request) {
  let body: JourneyBody;
  try {
    body = (await request.json()) as JourneyBody;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers: NO_STORE });
  }

  const stage = asString(body.stage);
  if (stage !== 'discovery' && stage !== 'evaluate') {
    return NextResponse.json({ error: 'Unknown journey stage.' }, { status: 400, headers: NO_STORE });
  }

  const fullHistory = normaliseHistory(body.history);
  const historyText = fullHistory.map((turn) => turn.text).join(' ');
  if (detectSensitive(historyText)) {
    const reply = buildStaticDiscoveryReply('', 'invalid_model_response');
    reply.notice = 'Private details in the conversation were not used. Please start again without them.';
    return stage === 'discovery'
      ? discoveryResponse(reply, 'static', 'sensitive')
      : evaluationResponse({
          correct: false,
          feedback: [reply.notice],
          misconceptionIds: [],
          demonstrated: false,
          evidence: [],
          source: 'static'
        }, 'static', 'sensitive');
  }

  if (stage === 'discovery') {
    const message = asString(body.message).slice(0, 1200);
    if (!message) return NextResponse.json({ error: 'A message is required.' }, { status: 400, headers: NO_STORE });
    if (detectSensitive(message)) return discoveryResponse(buildStaticDiscoveryReply('', 'invalid_model_response'), 'static', 'sensitive');
    if (isAdviceRequest(message)) {
      const advice = buildAdviceReply();
      const reply: DiscoveryReply = {
        reflection: advice.reflection,
        explanations: advice.explanations,
        unknowns: advice.unknowns,
        question: advice.question,
        unsure: advice.unsure,
        notice: advice.notice,
        intent: 'unclear',
        objective: '',
        facts: [],
        confidence: 'not-stated',
        signals: []
      };
      return discoveryResponse(reply, 'static', 'advice_boundary');
    }

    if (!process.env.GEMINI_API_KEY) return discoveryStatic(message, 'missing_key');

    try {
      const model = process.env.GEMINI_MODEL || GEMINI_MODEL;
      const parsed = await callGemini(buildDiscoveryRequest(message, fullHistory.slice(-5), model));
      const reply = normaliseDiscoveryReply(parsed, message);
      if (!reply) return discoveryStatic(message, 'invalid_model_response');
      return discoveryResponse(reply, 'ai');
    } catch (error) {
      const reason = error instanceof Error && error.message === 'invalid_model_response' ? 'invalid_model_response' : 'api_error';
      return discoveryResponse(withNotice(buildStaticDiscoveryReply(message, reason), reason), 'static', reason);
    }
  }

  const scenarioId = asString(body.scenarioId);
  const stepId = asString(body.stepId);
  const step = getStep(scenarioId, stepId);
  if (!step) return NextResponse.json({ error: 'Unknown scenario step.' }, { status: 400, headers: NO_STORE });

  const answer = typeof body.answer === 'string' ? body.answer.slice(0, 1200) : body.answer;
  if (typeof answer !== 'string' && !(typeof answer === 'number' && Number.isFinite(answer))) {
    return NextResponse.json({ error: 'An answer is required.' }, { status: 400, headers: NO_STORE });
  }
  const answerText = typeof answer === 'string' ? answer : String(answer);
  if (detectSensitive(answerText) || isAdviceRequest(answerText)) {
    return evaluationResponse({
      correct: false,
      feedback: ['Please keep private details and advice requests out of scenario answers.'],
      misconceptionIds: [],
      demonstrated: false,
      evidence: [],
      source: 'static'
    }, 'static', 'sensitive');
  }

  if (step.kind !== 'reflection' || !process.env.GEMINI_API_KEY) {
    return evaluationResponse(staticEvaluateStep(step, answer), 'static', step.kind === 'reflection' ? 'missing_key' : undefined);
  }

  try {
    const model = process.env.GEMINI_MODEL || GEMINI_MODEL;
    const parsed = await callGemini(buildEvaluationRequest(step, answerText, model));
    const result = normaliseEvaluationReply(parsed, step, answerText);
    if (!result) {
      const fallback = staticEvaluateStep(step, answer);
      fallback.notice = 'The AI evaluation could not be checked safely, so this used the built-in check.';
      return evaluationResponse(fallback, 'static', 'invalid_model_response');
    }
    return evaluationResponse(result, 'ai');
  } catch {
    const fallback = staticEvaluateStep(step, answer);
    fallback.notice = 'The AI service did not respond, so this used the built-in check.';
    return evaluationResponse(fallback, 'static', 'api_error');
  }
}
