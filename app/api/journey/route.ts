import { NextResponse } from 'next/server';
import { detectSensitive, isAdviceRequest, safeEcho } from '../../../lib/education';
import { AiError, aiConfigured, coolingModels, discoverModels, generateJson } from '../../../lib/ai/gemini';
import { EVALUATION_SCHEMA, EVALUATION_SYSTEM, evaluationPrompt, validateEvaluation } from '../../../lib/journey/ai-evaluator';
import {
  DISCOVERY_SCHEMA,
  adviceBoundary,
  discoveryPrompt,
  discoverySystemPrompt,
  staticDiscovery,
  validateDiscovery
} from '../../../lib/journey/discovery';
import { isAnswerShapeValid, staticEvaluate } from '../../../lib/journey/evaluation';
import { findCheck, isExperienceId } from '../../../lib/journey/experiences';
import { createInitialState } from '../../../lib/journey/storage';
import type { ExperienceLevel, HistoryTurn, Intent, JourneyState } from '../../../lib/journey/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'no-store' };
const isRecord = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

function history(value: unknown): HistoryTurn[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((t) => ({ role: t.role === 'guide' ? ('guide' as const) : ('user' as const), text: safeEcho(str(t.text, 800), 800) }))
    .filter((t) => t.text && !detectSensitive(t.text))
    .slice(-10);
}

/** Rebuild a minimal, sanitised state from the client's context (never trusted for anything else). */
function contextState(value: unknown, userTurns: number): JourneyState {
  const base = createInitialState();
  if (!isRecord(value)) return base;
  const intents: Intent[] = ['investing', 'trading', 'exploring', 'platform', 'unclear'];
  const levels: ExperienceLevel[] = ['none', 'some', 'experienced', 'unknown'];
  return {
    ...base,
    intent: intents.includes(value.intent as Intent) ? (value.intent as Intent) : 'unclear',
    objective: safeEcho(str(value.objective, 160), 160),
    motivation: safeEcho(str(value.motivation, 160), 160),
    concerns: Array.isArray(value.concerns) ? value.concerns.map((c) => safeEcho(str(c, 140), 140)).filter(Boolean).slice(0, 4) : [],
    experience: levels.includes(value.experience as ExperienceLevel) ? (value.experience as ExperienceLevel) : 'unknown',
    appFamiliarity: levels.includes(value.appFamiliarity as ExperienceLevel) ? (value.appFamiliarity as ExperienceLevel) : 'unknown',
    messages: Array.from({ length: Math.min(Math.max(userTurns, 0), 20) }, (_, i) => ({ id: `u${i}`, role: 'user' as const, text: '-', at: base.startedAt }))
  };
}

const SENSITIVE_REPLY =
  "I've ignored that part — please don't share PAN, Aadhaar, bank or card numbers, OTPs, passwords or exact holdings here. I never need them. What would you like to understand?";

export async function GET(request: Request) {
  const base = { ok: true, ai: aiConfigured() ? 'configured' : 'not-configured' };
  if (!aiConfigured() || new URL(request.url).searchParams.get('probe') !== '1') return json(base);
  // Diagnostic: a tiny structured call reporting which model answered and how fast.
  const started = Date.now();
  try {
    const { model } = await generateJson({
      system: 'Return JSON only.',
      prompt: 'Return {"ok": true}.',
      schema: { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] },
      maxOutputTokens: 50
    });
    return json({ ...base, probe: 'ok', model, ms: Date.now() - started, available: await discoverModels(), cooling: coolingModels() });
  } catch (error) {
    return json({ ...base, probe: 'failed', error: error instanceof Error ? error.message : 'unknown', ms: Date.now() - started, available: await discoverModels(), cooling: coolingModels() });
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (!isRecord(parsed)) throw new Error();
    body = parsed;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  /* ---------------- Discovery ---------------- */
  if (body.stage === 'discover') {
    const message = str(body.message, 1200);
    if (!message) return json({ error: 'A message is required.' }, 400);
    const userTurns = typeof body.userTurns === 'number' ? body.userTurns : 0;
    const state = contextState(body.context, userTurns);

    if (detectSensitive(message)) {
      const analysis = { ...adviceBoundary(state), reply: SENSITIVE_REPLY, followUp: '', adviceRequest: false };
      return json({ mode: 'safety', reason: 'sensitive', analysis });
    }
    if (isAdviceRequest(message)) {
      return json({ mode: 'safety', reason: 'advice', analysis: adviceBoundary(state) });
    }
    if (!aiConfigured()) return json({ mode: 'static', reason: 'missing_key', analysis: staticDiscovery(message, state) });

    try {
      const { data, model } = await generateJson({
        system: discoverySystemPrompt(),
        prompt: discoveryPrompt(message, history(body.history), state),
        schema: DISCOVERY_SCHEMA,
        maxOutputTokens: 2048,
        temperature: 0.4
      });
      const analysis = validateDiscovery(data);
      if (!analysis) return json({ mode: 'static', reason: 'invalid_response', analysis: staticDiscovery(message, state) });
      if (userTurns + 1 >= 3 && analysis.intent !== 'unclear') {
        analysis.readyToPlan = true;
        analysis.followUp = '';
      }
      return json({ mode: 'ai', model, analysis });
    } catch (error) {
      const reason = error instanceof AiError ? error.code : 'api_error';
      if (error instanceof AiError) console.error('discovery ai fallback:', error.message);
      return json({ mode: 'static', reason, detail: error instanceof Error ? error.message.slice(0, 600) : undefined, analysis: staticDiscovery(message, state) });
    }
  }

  /* ---------------- Evaluation ---------------- */
  if (body.stage === 'evaluate') {
    const experienceId = body.experienceId;
    const checkId = str(body.checkId, 60);
    if (!isExperienceId(experienceId)) return json({ error: 'Unknown experience.' }, 400);
    const found = findCheck(experienceId, checkId);
    if (!found) return json({ error: 'Unknown check.' }, 400);
    const { check } = found;
    const answer = body.answer;
    if (!isAnswerShapeValid(check, answer)) return json({ error: 'Invalid answer.' }, 400);

    if (check.kind !== 'explain') return json({ mode: 'static', evaluation: staticEvaluate(check, answer) });

    const text = String(answer);
    if (detectSensitive(text) || isAdviceRequest(text)) {
      return json({
        mode: 'safety',
        evaluation: {
          correct: false,
          feedback: 'Please keep personal details and advice requests out of answers — just explain the idea in your own words.',
          misconceptionIds: [],
          source: 'static'
        }
      });
    }
    if (!aiConfigured()) return json({ mode: 'static', reason: 'missing_key', evaluation: staticEvaluate(check, text) });

    try {
      const { data, model } = await generateJson({
        system: EVALUATION_SYSTEM,
        prompt: evaluationPrompt(check, text),
        schema: EVALUATION_SCHEMA,
        maxOutputTokens: 1024,
        temperature: 0.1
      });
      const evaluation = validateEvaluation(data, check, text);
      if (!evaluation) return json({ mode: 'static', reason: 'invalid_response', evaluation: staticEvaluate(check, text) });
      return json({ mode: 'ai', model, evaluation });
    } catch (error) {
      if (error instanceof AiError) console.error('evaluation ai fallback:', error.message);
      return json({ mode: 'static', reason: error instanceof AiError ? error.code : 'api_error', evaluation: staticEvaluate(check, text) });
    }
  }

  return json({ error: 'Unknown stage.' }, 400);
}
