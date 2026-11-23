import {
  applyDemonstration,
  recordMisconception,
  resolveMisconceptions,
  resolveMisconceptionsForDimensions,
  unresolvedMisconceptions
} from './profile';
import { SCENARIO_IDS, getScenario } from './scenarios';
import type { EvaluationResult, JourneyState, ScenarioAttempt } from './types';

const MISCONCEPTION_SCENARIOS: Record<string, string[]> = {
  'same-thing': ['EXP-02'],
  'guaranteed-return': ['EXP-02', 'EXP-04'],
  'fund-cannot-move': ['EXP-02'],
  'risk-removed': ['EXP-04', 'EXP-02'],
  'no-diversification': ['EXP-04', 'EXP-02'],
  'only-up': ['EXP-04'],
  'execution-guarantee': ['EXP-06'],
  'displayed-price-guarantee': ['EXP-06'],
  'same-orders': ['EXP-06']
};

const KEYWORD_SCENARIOS: { pattern: RegExp; id: string; reason: string }[] = [
  { pattern: /\b(order|limit|market|execute|execution|intraday|brokerage|app|platform|holdings|watchlist)\b/i, id: 'EXP-06', reason: 'your question was about order or app mechanics' },
  { pattern: /\b(risk|volatile|volatility|fall|loss|down|up and down|dip|movement)\b/i, id: 'EXP-04', reason: 'uncertainty or movement came up in your words' },
  { pattern: /\b(share|stock|fund|sip|mutual|product|own|ownership|pool)\b/i, id: 'EXP-02', reason: 'product structure came up in your words' }
];

type Scored = { id: string; score: number; reasons: string[] };

function scoreCandidate(state: JourneyState, id: string): Scored {
  const scenario = getScenario(id);
  const score = { id, score: 0, reasons: [] as string[] };
  if (!scenario) return score;
  const add = (points: number, reason: string) => {
    score.score += points;
    if (points > 0 && !score.reasons.includes(reason)) score.reasons.push(reason);
  };

  const text = [state.objective, ...state.facts, ...state.unknowns].join(' ');
  for (const keyword of KEYWORD_SCENARIOS) {
    if (keyword.id === id && keyword.pattern.test(text)) add(5, keyword.reason);
  }
  if (state.intent === 'trading' && id === 'EXP-06') add(4, 'your stated focus is trading mechanics');
  if (state.intent === 'platform' && id === 'EXP-06') add(4, 'your stated focus is a brokerage workflow');
  if (state.intent === 'investing' && id === 'EXP-02') add(2, 'your stated focus is investing concepts');
  if (state.intent === 'exploring' && id === 'EXP-02') add(2, 'a product-structure example is a calm starting point');

  for (const dimension of scenario.dimensions) {
    const entry = state.profile[dimension];
    if (!entry) continue;
    if (entry.state === 'not-assessed' || entry.state === 'needs-introduction') {
      add(3, `this touches an area marked ${entry.state.replace('-', ' ')}`);
    }
    if (entry.misconceptions.some((item) => !item.resolved)) {
      add(4, `an unresolved idea in ${dimension} needs another look`);
    }
  }

  for (const misconception of unresolvedMisconceptions(state.profile)) {
    const mapped = MISCONCEPTION_SCENARIOS[misconception.id];
    const reviewStep = misconception.id.startsWith('review-') ? misconception.id.slice(7) : '';
    if (mapped?.includes(id) || (reviewStep && scenario.steps.some((step) => step.id === reviewStep))) {
      add(6, 'a previous answer flagged this exact idea');
    }
  }

  const attempt = state.attempts[id];
  if (attempt?.result === 'needs-review') add(4, 'this scenario has an answer worth revisiting');
  if (attempt?.result === 'skipped') add(1, 'this scenario was skipped and stays available');
  if (attempt?.result === 'demonstrated') add(-6, 'this scenario already showed understanding');
  if (!state.visited.includes(id)) add(1, 'this path has not been explored yet');

  return score;
}

function rank(state: JourneyState, candidates: string[]): Scored[] {
  return candidates
    .filter((id, index) => getScenario(id) && candidates.indexOf(id) === index)
    .map((id) => scoreCandidate(state, id))
    .sort((a, b) => b.score - a.score || SCENARIO_IDS.indexOf(a.id as (typeof SCENARIO_IDS)[number]) - SCENARIO_IDS.indexOf(b.id as (typeof SCENARIO_IDS)[number]));
}

export function planJourney(state: JourneyState): { queue: string[]; reason: string } {
  const candidates = [...SCENARIO_IDS];
  const queue: string[] = [];
  let firstReason = '';

  while (candidates.length > 0) {
    const ranked = rank(state, candidates);
    const chosen = ranked[0].id;
    if (queue.length === 0) firstReason = ranked[0].reasons[0] ?? '';
    queue.push(chosen);
    candidates.splice(candidates.indexOf(chosen as (typeof SCENARIO_IDS)[number]), 1);
  }

  const reason = firstReason
    ? `I’ll begin here because ${firstReason}. The next step changes with what you show and what still needs a look.`
    : 'I’ll begin with a short product-structure example, then adapt from what you show and what still needs a look.';
  return { queue, reason };
}

function openAttempt(scenarioId: string, previous?: ScenarioAttempt): ScenarioAttempt {
  return {
    scenarioId,
    result: 'in-progress',
    reviewCount: previous?.reviewCount ?? 0,
    stepResults: {},
    reviewSteps: [],
    answers: {},
    feedback: [],
    updatedAt: new Date().toISOString()
  };
}

function chooseNext(
  state: JourneyState,
  currentId: string | null,
  excludedIds: string[] = []
): { id: string; reason: string; queue: string[] } | null {
  const excluded = new Set(excludedIds);
  const candidates = new Set(
    state.queue.filter(
      (id) => getScenario(id) && state.attempts[id]?.result !== 'demonstrated' && !excluded.has(id)
    )
  );
  if (
    currentId &&
    getScenario(currentId) &&
    state.attempts[currentId]?.result === 'needs-review' &&
    !excluded.has(currentId)
  ) {
    candidates.add(currentId);
  }
  for (const misconception of unresolvedMisconceptions(state.profile)) {
    for (const id of MISCONCEPTION_SCENARIOS[misconception.id] ?? []) {
      if (!excluded.has(id)) candidates.add(id);
    }
  }
  for (const [id, attempt] of Object.entries(state.attempts)) {
    if (attempt.result === 'needs-review' && getScenario(id) && !excluded.has(id)) candidates.add(id);
  }

  const ranked = rank(state, [...candidates]);
  if (ranked.length === 0) return null;
  const chosen = ranked[0];
  return {
    id: chosen.id,
    reason: chosen.reasons[0] ?? 'This is the next useful step in your plan.',
    queue: state.queue.filter((id) => id !== chosen.id)
  };
}

export function startJourney(state: JourneyState): JourneyState {
  const plan = planJourney(state);
  const first = plan.queue[0];
  const timestamp = new Date().toISOString();
  return {
    ...state,
    phase: 'scenario',
    status: 'active',
    planReason: plan.reason,
    queue: plan.queue.slice(1),
    visited: [...new Set([...state.visited, first])],
    currentScenarioId: first,
    stepIndex: 0,
    answers: {},
    lastEvaluation: null,
    attempts: {
      ...state.attempts,
      [first]: openAttempt(first, state.attempts[first])
    },
    updatedAt: timestamp
  };
}

export function applyStepFeedback(state: JourneyState, result: EvaluationResult): JourneyState {
  const currentId = state.currentScenarioId;
  const scenario = getScenario(currentId);
  const step = scenario?.steps[Math.min(state.stepIndex, (scenario?.steps.length ?? 1) - 1)];
  if (!currentId || !scenario || !step) return state;

  const previous = state.attempts[currentId] ?? openAttempt(currentId);
  const stepMisconceptions = result.misconceptionIds.filter((id) => step.misconceptionIds.includes(id));
  let profile = state.profile;
  let queue = [...state.queue];

  if (result.correct) {
    profile = applyDemonstration(profile, step.dimension, result.evidence.join(' '), stepMisconceptions);
    profile = resolveMisconceptions(profile, stepMisconceptions);
  } else {
    const ids = stepMisconceptions.length > 0 ? stepMisconceptions : [`review-${step.id}`];
    profile = ids.reduce(
      (current, id) => recordMisconception(current, step.dimension, id, result.feedback[0] || step.fallbackFeedback),
      profile
    );
    if (!queue.includes(currentId)) queue = [...queue, currentId];
  }

  const stepResults = { ...previous.stepResults, [step.id]: result.correct };
  const reviewSteps = [...new Set([
    ...previous.reviewSteps.filter((id) => stepResults[id] === false),
    ...(result.correct ? [] : [step.id])
  ])];
  const attempt: ScenarioAttempt = {
    ...previous,
    result: reviewSteps.length > 0 ? 'needs-review' : 'in-progress',
    reviewCount: Math.min(reviewSteps.length, 3),
    stepResults,
    reviewSteps,
    answers: state.answers,
    feedback: [...previous.feedback, ...result.feedback].slice(-3),
    updatedAt: new Date().toISOString()
  };

  return {
    ...state,
    profile,
    queue,
    planReason: result.correct
      ? state.planReason
      : `One answer needs another look, so the next experience may offer a different route or revisit this idea.`,
    attempts: { ...state.attempts, [currentId]: attempt },
    lastEvaluation: result,
    updatedAt: new Date().toISOString()
  };
}

export function advanceJourney(state: JourneyState, result: EvaluationResult): JourneyState {
  const currentId = state.currentScenarioId;
  const scenario = getScenario(currentId);
  if (!currentId || !scenario) return state;

  const previous = state.attempts[currentId] ?? openAttempt(currentId);
  const allCorrect = scenario.steps.every((step) => previous.stepResults[step.id] === true);
  let profile = state.profile;
  if (allCorrect) profile = resolveMisconceptionsForDimensions(profile, scenario.dimensions);

  const finalResult: EvaluationResult = {
    ...result,
    correct: allCorrect,
    demonstrated: allCorrect,
    feedback: allCorrect
      ? result.feedback
      : ['You explored every step, but at least one answer still needs another look. It stays available to revisit.'],
    evidence: allCorrect ? result.evidence : []
  };
  const finalAttempt: ScenarioAttempt = {
    ...previous,
    result: allCorrect ? 'demonstrated' : 'needs-review',
    answers: state.answers,
    updatedAt: new Date().toISOString()
  };

  const working = { ...state, profile, attempts: { ...state.attempts, [currentId]: finalAttempt } };
  const next = chooseNext(working, currentId);
  const timestamp = new Date().toISOString();

  if (!next) {
    return {
      ...working,
      phase: 'summary',
      status: 'active',
      planReason: allCorrect ? state.planReason : finalResult.feedback[0],
      queue: [],
      currentScenarioId: null,
      stepIndex: 0,
      answers: {},
      lastEvaluation: finalResult,
      updatedAt: timestamp
    };
  }

  return {
    ...working,
    phase: 'scenario',
    status: 'active',
    planReason: next.reason,
    queue: next.queue,
    visited: [...new Set([...state.visited, next.id])],
    currentScenarioId: next.id,
    stepIndex: 0,
    answers: {},
    attempts: {
      ...working.attempts,
      [next.id]: working.attempts[next.id] ?? openAttempt(next.id)
    },
    lastEvaluation: finalResult,
    updatedAt: timestamp
  };
}

export function skipScenario(state: JourneyState): JourneyState {
  const currentId = state.currentScenarioId;
  if (!currentId) return state;
  const timestamp = new Date().toISOString();
  const attempt: ScenarioAttempt = {
    scenarioId: currentId,
    result: 'skipped',
    reviewCount: state.attempts[currentId]?.reviewCount ?? 0,
    stepResults: {},
    reviewSteps: [],
    answers: state.answers,
    feedback: ['Skipped. It stays available to revisit.'],
    updatedAt: timestamp
  };
  const working = {
    ...state,
    queue: state.queue.filter((id) => id !== currentId),
    attempts: { ...state.attempts, [currentId]: attempt }
  };
  const next = chooseNext(working, null, [currentId]);
  if (!next) {
    return {
      ...working,
      phase: 'summary',
      status: 'active',
      queue: [],
      currentScenarioId: null,
      stepIndex: 0,
      answers: {},
      updatedAt: timestamp
    };
  }
  return {
    ...working,
    planReason: next.reason,
    queue: next.queue,
    visited: [...new Set([...state.visited, next.id])],
    currentScenarioId: next.id,
    stepIndex: 0,
    answers: {},
    attempts: {
      ...working.attempts,
      [next.id]: working.attempts[next.id] ?? openAttempt(next.id)
    },
    updatedAt: timestamp
  };
}

export function revisitScenario(state: JourneyState, scenarioId: string): JourneyState {
  if (!getScenario(scenarioId)) return state;
  const previous = state.attempts[scenarioId];
  return {
    ...state,
    phase: 'scenario',
    status: 'active',
    currentScenarioId: scenarioId,
    stepIndex: 0,
    answers: {},
    visited: [...new Set([...state.visited, scenarioId])],
    attempts: {
      ...state.attempts,
      [scenarioId]: openAttempt(scenarioId, previous)
    },
    updatedAt: new Date().toISOString()
  };
}

export function pauseJourney(state: JourneyState): JourneyState {
  return { ...state, status: 'paused', updatedAt: new Date().toISOString() };
}

export function resumeJourney(state: JourneyState): JourneyState {
  return { ...state, status: 'active', updatedAt: new Date().toISOString() };
}

export function journeyProgress(state: JourneyState) {
  const attempts = Object.values(state.attempts);
  const demonstrated = attempts.filter((item) => item.result === 'demonstrated').length;
  const needsReview = attempts.filter((item) => item.result === 'needs-review').length;
  const skipped = attempts.filter((item) => item.result === 'skipped').length;
  const explored = new Set([...state.visited, ...attempts.map((item) => item.scenarioId)]).size;
  return {
    explored,
    demonstrated,
    needsReview,
    skipped,
    total: SCENARIO_IDS.length,
    percent: Math.round((explored / SCENARIO_IDS.length) * 100)
  };
}
