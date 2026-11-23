import { safeEcho } from '../education';
import { applyDiscoverySignals, createProfile, safeEvidence, sanitizeProfile } from './profile';
import { SCENARIO_IDS, getScenario } from './scenarios';
import { JOURNEY_VERSION, type DiscoveryReply, type JourneyMessage, type JourneyState, type ScenarioAttempt } from './types';

const INTENTS = ['investing', 'trading', 'exploring', 'platform', 'unclear'];
const DIMENSIONS = ['fundamentals', 'products', 'risk', 'tradingMechanics', 'platform', 'decisions'];
const STATES = ['not-assessed', 'needs-introduction', 'developing', 'demonstrated'];
const CONFIDENCES = ['not-stated', 'low', 'medium', 'clear'];

function now(): string {
  return new Date().toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitiseAnswerValue(value: unknown): string | number | undefined {
  if (typeof value === 'string') return safeEcho(value, 500);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

function sanitiseAnswers(value: unknown): Record<string, string | number> {
  if (!isRecord(value)) return {};
  const result: Record<string, string | number> = {};
  for (const [key, item] of Object.entries(value).slice(0, 20)) {
    const safe = sanitiseAnswerValue(item);
    if (safe !== undefined) result[key.slice(0, 60)] = safe;
  }
  return result;
}

function sanitiseReply(value: unknown): DiscoveryReply | undefined {
  if (!isRecord(value)) return undefined;
  const reflection = asString(value.reflection);
  const question = asString(value.question);
  if (!reflection || !question) return undefined;
  const intent = asString(value.intent);
  const rawSignals = Array.isArray(value.signals) ? value.signals.slice(0, 3) : [];
  const reply: DiscoveryReply = {
    reflection: safeEcho(reflection, 240),
    explanations: [],
    unknowns: Array.isArray(value.unknowns)
      ? value.unknowns.slice(0, 2).map((item) => safeEcho(asString(item), 160)).filter(Boolean)
      : [],
    question: safeEcho(question, 240),
    unsure: value.unsure === true,
    intent: INTENTS.includes(intent) ? (intent as DiscoveryReply['intent']) : 'unclear',
    objective: safeEcho(asString(value.objective), 160),
    facts: Array.isArray(value.facts)
      ? value.facts.slice(0, 3).map((item) => safeEcho(asString(item), 160)).filter(Boolean)
      : [],
    confidence: CONFIDENCES.includes(asString(value.confidence))
      ? (asString(value.confidence) as DiscoveryReply['confidence'])
      : 'low',
    signals: rawSignals.map((entry) => {
      if (!isRecord(entry)) return null;
      const dimension = asString(entry.dimension);
      const state = asString(entry.state);
      const evidence = safeEvidence(entry.evidence);
      if (!DIMENSIONS.includes(dimension) || !STATES.includes(state) || !evidence) return null;
      return {
        dimension: dimension as DiscoveryReply['signals'][number]['dimension'],
        state: state as DiscoveryReply['signals'][number]['state'],
        evidence
      };
    }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
  };
  if (asString(value.notice)) reply.notice = safeEcho(asString(value.notice), 240);
  const rawExplanations = Array.isArray(value.explanations) ? value.explanations.slice(0, 1) : [];
  reply.explanations = rawExplanations.map((entry) => {
    if (!isRecord(entry)) return null;
    const title = asString(entry.title);
    const text = asString(entry.text);
    const sourceName = asString(entry.sourceName);
    const sourceUrl = asString(entry.sourceUrl);
    if (!/^https:\/\//.test(sourceUrl)) return null;
    return { title, text, sourceName, sourceUrl };
  }).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  return reply;
}

function sanitiseMessages(value: unknown): JourneyMessage[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-40).map((entry) => {
    if (!isRecord(entry)) return null;
    const role = entry.role === 'guide' ? 'guide' : entry.role === 'user' ? 'user' : null;
    const text = safeEcho(asString(entry.text), 1200);
    if (!role || !text) return null;
    const message: JourneyMessage = {
      id: typeof entry.id === 'number' && Number.isFinite(entry.id) ? Math.trunc(entry.id) : Date.now(),
      role,
      text,
      at: asString(entry.at) || now()
    };
    if (entry.source === 'ai' || entry.source === 'static') message.source = entry.source;
    const reply = sanitiseReply(entry.reply);
    if (reply) message.reply = reply;
    return message;
  }).filter((entry): entry is JourneyMessage => Boolean(entry));
}

function sanitiseAttempts(value: unknown): Record<string, ScenarioAttempt> {
  if (!isRecord(value)) return {};
  const attempts: Record<string, ScenarioAttempt> = {};
  for (const [key, raw] of Object.entries(value).slice(0, 10)) {
    if (!getScenario(key) || !isRecord(raw)) continue;
    const result = asString(raw.result);
    const stepResults: Record<string, boolean> = {};
    if (isRecord(raw.stepResults)) {
      for (const [stepKey, passed] of Object.entries(raw.stepResults).slice(0, 10)) {
        if (typeof passed === 'boolean') stepResults[stepKey.slice(0, 60)] = passed;
      }
    }
    attempts[key] = {
      scenarioId: key,
      result: ['in-progress', 'demonstrated', 'needs-review', 'skipped'].includes(result)
        ? (result as ScenarioAttempt['result'])
        : 'in-progress',
      reviewCount: typeof raw.reviewCount === 'number' && Number.isFinite(raw.reviewCount) ? Math.min(Math.max(raw.reviewCount, 0), 3) : 0,
      stepResults,
      reviewSteps: Array.isArray(raw.reviewSteps)
        ? raw.reviewSteps.map(asString).filter(Boolean).slice(0, 10)
        : Object.entries(stepResults).filter(([, passed]) => !passed).map(([stepId]) => stepId),
      answers: sanitiseAnswers(raw.answers),
      feedback: Array.isArray(raw.feedback) ? raw.feedback.slice(0, 3).map((item) => safeEcho(asString(item), 220)).filter(Boolean) : [],
      updatedAt: asString(raw.updatedAt) || now()
    };
  }
  return attempts;
}

export function createInitialState(): JourneyState {
  const timestamp = now();
  return {
    version: JOURNEY_VERSION,
    phase: 'discovery',
    status: 'active',
    intent: 'unclear',
    objective: '',
    facts: [],
    unknowns: [],
    confidence: 'not-stated',
    profile: createProfile(),
    messages: [{
      id: 1,
      role: 'guide',
      text: "Tell me what got you interested in investing. You don't need to know any financial terms. Just tell me what you're trying to understand.",
      source: 'static',
      at: timestamp
    }],
    planReason: '',
    queue: [],
    visited: [],
    currentScenarioId: null,
    stepIndex: 0,
    answers: {},
    attempts: {},
    lastEvaluation: null,
    startedAt: timestamp,
    updatedAt: timestamp
  };
}

export function applyDiscoveryReply(state: JourneyState, reply: DiscoveryReply): JourneyState {
  const openClarification = !reply.objective && Boolean(state.objective);
  return {
    ...state,
    intent: openClarification && state.intent !== 'unclear' ? state.intent : reply.intent,
    objective: reply.objective || state.objective,
    facts: [...state.facts, ...reply.facts].slice(-6),
    unknowns: [...state.unknowns, ...(openClarification ? [] : reply.unknowns)].slice(-6),
    confidence: openClarification && state.confidence !== 'not-stated' ? state.confidence : reply.confidence,
    profile: applyDiscoverySignals(state.profile, reply.signals)
  };
}

export function sanitizeJourneyState(value: unknown): JourneyState | null {
  if (!isRecord(value) || value.version !== JOURNEY_VERSION) return null;
  const phase = asString(value.phase);
  const status = asString(value.status);
  const intent = asString(value.intent);
  const queue = Array.isArray(value.queue)
    ? value.queue.map(asString).filter((id) => (SCENARIO_IDS as readonly string[]).includes(id)).slice(0, 6)
    : [];
  const visited = Array.isArray(value.visited)
    ? [...new Set(value.visited.map(asString).filter((id) => (SCENARIO_IDS as readonly string[]).includes(id)))].slice(0, 6)
    : [];
  const currentScenarioId = asString(value.currentScenarioId);
  const step = getScenario(currentScenarioId)?.steps.length ?? 0;
  const stepIndex = typeof value.stepIndex === 'number' && Number.isFinite(value.stepIndex)
    ? Math.min(Math.max(Math.trunc(value.stepIndex), 0), Math.max(step - 1, 0))
    : 0;
  const nextPhase = phase === 'scenario' || phase === 'summary' ? phase : 'discovery';
  const state: JourneyState = {
    version: JOURNEY_VERSION,
    phase: nextPhase,
    status: status === 'paused' ? 'paused' : 'active',
    intent: INTENTS.includes(intent) ? (intent as JourneyState['intent']) : 'unclear',
    objective: safeEcho(asString(value.objective), 160),
    facts: Array.isArray(value.facts)
      ? value.facts.slice(0, 3).map((item) => safeEcho(asString(item), 160)).filter(Boolean)
      : [],
    unknowns: Array.isArray(value.unknowns)
      ? value.unknowns.slice(0, 4).map((item) => safeEcho(asString(item), 160)).filter(Boolean)
      : [],
    confidence: CONFIDENCES.includes(asString(value.confidence))
      ? (asString(value.confidence) as JourneyState['confidence'])
      : 'not-stated',
    profile: sanitizeProfile(value.profile),
    messages: sanitiseMessages(value.messages),
    planReason: safeEcho(asString(value.planReason), 220),
    queue,
    visited,
    currentScenarioId: getScenario(currentScenarioId) ? currentScenarioId : null,
    stepIndex,
    answers: sanitiseAnswers(value.answers),
    attempts: sanitiseAttempts(value.attempts),
    lastEvaluation: null,
    startedAt: asString(value.startedAt) || now(),
    updatedAt: asString(value.updatedAt) || now()
  };

  if (state.messages.length === 0) return null;
  if (state.phase === 'scenario' && !state.currentScenarioId) state.phase = 'discovery';
  return state;
}
