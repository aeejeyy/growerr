/**
 * Adaptive Experience Engine (Modules 3 & 5).
 *
 *  - Journey planner: ranks the experience library against the person's intent,
 *    knowledge profile, misconceptions and AI-identified focus, and explains why.
 *  - Adaptation engine: reacts to every evaluated answer — inserts an alternative
 *    explanation + new scenario after a wrong answer, schedules a remedial
 *    experience when a misconception persists, and only marks an experience
 *    "demonstrated" when every concept AND the transfer question were answered correctly.
 *
 * All functions are pure: (state, input) -> new state. This keeps every
 * adaptive decision testable (see tests/run.mjs).
 */
import { stripKnownClauses } from './text';
import { EXPERIENCES, EXPERIENCE_IDS, MISCONCEPTIONS, findCheck, getExperience } from './experiences';
import {
  DIMENSION_LABELS,
  applyDemonstration,
  recordMisconception,
  resolveMisconception,
  unresolvedMisconceptions
} from './profile';
import type {
  AdaptationEvent,
  CheckOutcome,
  CheckRef,
  Evaluation,
  Experience,
  ExperienceId,
  ExperienceProgress,
  JourneyState,
  PlanItem
} from './types';

const MAX_PLAN = 5;
const MIN_PLAN = 3;

const now = () => new Date().toISOString();

function log(state: JourneyState, kind: AdaptationEvent['kind'], text: string): AdaptationEvent[] {
  return [...state.log, { at: now(), kind, text }].slice(-40);
}

/* ------------------------------------------------------------------ */
/* Journey planner                                                     */
/* ------------------------------------------------------------------ */

const TOPIC_PATTERNS: Record<ExperienceId, RegExp> = {
  'EXP-01': /\b(stocks?|shares?|equity|own(ing|ership)? (a|part)|company)\b/i,
  'EXP-02': /\b(mutual funds?|sips?|stocks? (vs|versus|or|and) (mutual )?funds?|differen\w* between|pool(ed)?|index funds?|etfs?)\b/i,
  'EXP-03': /\b(trad(e|ing|er)(?! (app|account|platform))|intraday|day trad\w*|invest(ing)? (vs|versus|or) trad\w*|long[- ]term|short[- ]term)\b/i,
  'EXP-04': /\b(risk|volatil\w*|los(e|s|ing)|crash|fall|drop|scared|afraid|nervous|worr\w*|safe|up and down|uncertain\w*)\b/i,
  'EXP-05': /\b(market orders?|buy (a )?share|place (an )?order|how (do i|to) buy|order types?)\b/i,
  'EXP-06': /\b(limit orders?|limit price|set (a|my) price|order types?)\b/i,
  'EXP-07': /\b(not (get(ting)?|being) (executed|filled)|didn'?t (execute|fill)|pending|partial(ly)?|bid|ask|spread|liquidity|stuck)\b/i,
  'EXP-08': /\b(app|apps|platform|groww|broker(age)?|watchlist|holdings|interface|dashboard|demat|screen)\b/i,
  'EXP-09': /\b(charges?|fees?|brokerage|costs?|tax(es)?|stt|commission|hidden)\b/i,
  'EXP-10': /\b(holdings?|order (vs|versus) holding|where (are|is) my (shares?|stocks?)|settle\w*|t\+1|bought but)\b/i
};

const INTENT_BOOST: Record<JourneyState['intent'], ExperienceId[]> = {
  investing: ['EXP-02', 'EXP-01', 'EXP-04', 'EXP-03'],
  trading: ['EXP-05', 'EXP-06', 'EXP-07', 'EXP-03'],
  platform: ['EXP-08', 'EXP-10', 'EXP-05', 'EXP-09'],
  exploring: ['EXP-01', 'EXP-02', 'EXP-03', 'EXP-04'],
  unclear: ['EXP-01', 'EXP-03']
};

/** Plain-language reason used when an experience matches the person's own words. */
const TOPIC_REASON: Record<ExperienceId, string> = {
  'EXP-01': 'you mentioned stocks — this shows what owning a share actually means',
  'EXP-02': 'you asked how stocks and mutual funds differ',
  'EXP-03': 'you mentioned trading — this separates it from investing',
  'EXP-04': 'you mentioned risk or losing money — this shows how and why values move',
  'EXP-05': 'you asked how buying a share actually works',
  'EXP-06': 'you asked about limit orders',
  'EXP-07': 'you asked why orders sometimes don’t go through',
  'EXP-08': 'you mentioned a brokerage app — this walks through its main screens',
  'EXP-09': 'you asked about charges and costs',
  'EXP-10': 'you asked what happens after an order is placed'
};

const INTENT_REASON: Record<JourneyState['intent'], string> = {
  investing: 'it’s a core idea for anyone starting to invest',
  trading: 'it’s a core building block of how trading works',
  platform: 'it’s one of the main things you’ll use in a brokerage app',
  exploring: 'it’s a calm, useful starting point for exploring',
  unclear: 'it’s a calm, useful starting point'
};

type Scored = { id: ExperienceId; score: number; reasons: string[] };

export function scoreExperience(state: JourneyState, id: ExperienceId): Scored {
  const exp = EXPERIENCES[id];
  const result: Scored = { id, score: 0, reasons: [] };
  const weighted: { points: number; reason: string }[] = [];
  const add = (points: number, reason?: string) => {
    result.score += points;
    if (reason && points > 0) weighted.push({ points, reason });
  };

  // Topics the person says they already understand are not "matches".
  const text = stripKnownClauses([state.objective, state.motivation, ...state.questions, ...state.concerns].join('. '));
  const primary = state.profile[exp.dimensions[0]];
  const claimedKnown = primary.state === 'developing' && primary.demonstrated.length === 0 && primary.claimed.length > 0;
  const topicMatch = TOPIC_PATTERNS[id].test(text) && !claimedKnown;
  if (topicMatch) add(6, TOPIC_REASON[id]);

  const focusIndex = state.focus.indexOf(id);
  if (focusIndex === 0) add(9, topicMatch ? `${TOPIC_REASON[id]}` : 'it’s the most direct answer to your main question');
  else if (focusIndex > 0) add(6, topicMatch ? TOPIC_REASON[id] : 'it’s closely related to your question');

  const boost = INTENT_BOOST[state.intent].indexOf(id);
  if (boost >= 0) add(5 - boost, INTENT_REASON[state.intent]);

  for (const m of unresolvedMisconceptions(state.profile)) {
    const remedies = MISCONCEPTIONS[m.id]?.remedies ?? [];
    const at = remedies.indexOf(id);
    if (at === 0) add(10, `it addresses an idea worth re-checking: “${MISCONCEPTIONS[m.id].label}”`);
    else if (at > 0) add(4, `it helps with “${MISCONCEPTIONS[m.id].label}”`);
  }

  if (state.concerns.length > 0 && id === 'EXP-04') add(3, 'you mentioned a concern about uncertainty or loss');
  if (state.appFamiliarity === 'none' && (state.intent === 'platform' || state.intent === 'trading') && id === 'EXP-08') {
    add(3, 'you said brokerage apps are new to you');
  }

  for (const d of exp.dimensions) {
    const entry = state.profile[d];
    if (entry.state === 'needs-introduction') add(2, `${DIMENSION_LABELS[d].toLowerCase()} needs an introduction`);
    if (entry.state === 'developing' && entry.demonstrated.length === 0) add(-4);
    if (entry.state === 'demonstrated') add(-8);
  }

  const progress = state.progress[id];
  if (progress?.result === 'demonstrated') add(-20);
  // Most specific (highest-weighted) reason first.
  result.reasons = weighted.sort((a, b) => b.points - a.points).map((w) => w.reason);
  return result;
}

function prerequisiteNeeded(state: JourneyState, prereq: ExperienceId): boolean {
  const exp = EXPERIENCES[prereq];
  if (state.progress[prereq]?.result === 'demonstrated') return false;
  // If the person already said they understand the prerequisite's area, don't force it.
  return exp.dimensions.some((d) => state.profile[d].state === 'not-assessed' || state.profile[d].state === 'needs-introduction');
}

export function rankExperiences(state: JourneyState): Scored[] {
  return EXPERIENCE_IDS.map((id) => scoreExperience(state, id)).sort(
    (a, b) => b.score - a.score || EXPERIENCE_IDS.indexOf(a.id) - EXPERIENCE_IDS.indexOf(b.id)
  );
}

export function planJourney(state: JourneyState): PlanItem[] {
  const ranked = rankExperiences(state).filter((s) => state.progress[s.id]?.result !== 'demonstrated');
  const floor = Math.max(5, Math.round((ranked[0]?.score ?? 0) * 0.35));
  let chosen = ranked.filter((s) => s.score >= floor).slice(0, MAX_PLAN);
  if (chosen.length < MIN_PLAN) chosen = ranked.slice(0, MIN_PLAN);

  const ids = chosen.map((s) => s.id);
  const reasons = new Map<ExperienceId, string>(chosen.map((s) => [s.id, s.reasons[0] ?? 'it builds a useful foundation']));

  // Insert prerequisites before dependants, when the related area isn't established.
  for (const id of [...ids]) {
    for (const prereq of EXPERIENCES[id].prerequisites) {
      if (!ids.includes(prereq) && prerequisiteNeeded(state, prereq) && ids.length < MAX_PLAN + 1) {
        ids.splice(ids.indexOf(id), 0, prereq);
        reasons.set(prereq, `it gives you the foundation for “${EXPERIENCES[id].title}”`);
      }
    }
  }

  // Order: keep rank order but make sure prerequisites come first.
  const ordered: ExperienceId[] = [];
  const visit = (id: ExperienceId) => {
    if (ordered.includes(id)) return;
    for (const p of EXPERIENCES[id].prerequisites) if (ids.includes(p)) visit(p);
    ordered.push(id);
  };
  ids.forEach(visit);

  // Keep the plan focused: trim the lowest-ranked non-prerequisite items beyond MAX_PLAN.
  while (ordered.length > MAX_PLAN) {
    const needed = new Set(ordered.flatMap((id) => EXPERIENCES[id].prerequisites));
    const drop = [...ordered].reverse().find((id) => !needed.has(id));
    if (!drop) break;
    ordered.splice(ordered.indexOf(drop), 1);
  }

  // A generic reason on an item that's a foundation for a later step → say so instead.
  for (const id of ordered) {
    const dependant = ordered.find((other) => EXPERIENCES[other].prerequisites.includes(id));
    if (dependant && Object.values(INTENT_REASON).includes(reasons.get(id) ?? '')) {
      reasons.set(id, `it gives you the foundation for “${EXPERIENCES[dependant].title}”`);
    }
  }

  return ordered.map((id) => ({
    id,
    reason: capitalise(reasons.get(id) ?? 'it builds a useful foundation'),
    addedBy: 'planner' as const,
    status: 'pending' as const
  }));
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildPlan(state: JourneyState): JourneyState {
  const kept = state.plan.filter((p) => p.status === 'demonstrated');
  const fresh = planJourney(state).filter((p) => !kept.some((k) => k.id === p.id));
  const plan = [...kept, ...fresh];
  return {
    ...state,
    phase: 'plan',
    plan,
    log: log(state, 'plan', `Built a ${fresh.length}-step plan starting with “${EXPERIENCES[fresh[0]?.id ?? plan[0].id].title}”.`),
    updatedAt: now()
  };
}

/* ------------------------------------------------------------------ */
/* Running an experience                                               */
/* ------------------------------------------------------------------ */

function freshProgress(exp: Experience, previous?: ExperienceProgress): ExperienceProgress {
  return {
    id: exp.id,
    stage: 'intro',
    labExplored: previous?.labExplored ?? false,
    queue: exp.checks.map((c) => ({ checkId: c.id, variant: 'core' as const })),
    index: 0,
    outcomes: [],
    runs: (previous?.runs ?? 0) + 1,
    result: 'in-progress'
  };
}

function setPlanStatus(plan: PlanItem[], id: ExperienceId, status: PlanItem['status']): PlanItem[] {
  return plan.map((p) => (p.id === id ? { ...p, status } : p.status === 'active' && status === 'active' ? { ...p, status: 'pending' } : p));
}

export function startExperience(state: JourneyState, id: ExperienceId): JourneyState {
  const exp = getExperience(id);
  if (!exp) return state;
  const inPlan = state.plan.some((p) => p.id === id);
  const plan = inPlan
    ? state.plan
    : [...state.plan, { id, reason: 'You chose to explore this.', addedBy: 'user' as const, status: 'pending' as const }];
  const previous = state.progress[id];
  const revisit = Boolean(previous && previous.result !== 'in-progress');
  return {
    ...state,
    phase: 'experience',
    paused: false,
    currentId: id,
    plan: setPlanStatus(plan, id, 'active'),
    progress: { ...state.progress, [id]: previous && previous.result === 'in-progress' ? previous : freshProgress(exp, previous) },
    log: revisit ? log(state, 'revisit', `Revisiting “${exp.title}”.`) : state.log,
    updatedAt: now()
  };
}

export function setStage(state: JourneyState, stage: ExperienceProgress['stage']): JourneyState {
  const id = state.currentId;
  const progress = id ? state.progress[id] : undefined;
  if (!id || !progress) return state;
  return { ...state, progress: { ...state.progress, [id]: { ...progress, stage } }, updatedAt: now() };
}

export function markLabExplored(state: JourneyState): JourneyState {
  const id = state.currentId;
  const progress = id ? state.progress[id] : undefined;
  if (!id || !progress || progress.labExplored) return state;
  return { ...state, progress: { ...state.progress, [id]: { ...progress, labExplored: true } }, updatedAt: now() };
}

export function currentCheck(state: JourneyState) {
  const id = state.currentId;
  const progress = id ? state.progress[id] : undefined;
  if (!id || !progress) return null;
  const ref = progress.queue[progress.index];
  if (!ref) return null;
  const found = findCheck(id, ref.checkId);
  return found ? { ref, check: found.check, variant: ref.variant } : null;
}

export type AdaptiveDecision =
  | { type: 'continue'; message: string }
  | { type: 'alternative'; message: string; explanation: string }
  | { type: 'remedy'; message: string; remedyId: ExperienceId }
  | { type: 'needs-review'; message: string };

/**
 * Apply an evaluated answer to the current check. Returns the new state and
 * the adaptive decision (what happens next and why) for the UI to explain.
 */
export function applyEvaluation(state: JourneyState, evaluation: Evaluation): { state: JourneyState; decision: AdaptiveDecision } {
  const id = state.currentId;
  const exp = getExperience(id);
  const progress = id ? state.progress[id] : undefined;
  const current = currentCheck(state);
  if (!id || !exp || !progress || !current) return { state, decision: { type: 'continue', message: '' } };

  const { check, ref } = current;
  const allowed = evaluation.misconceptionIds.filter((m) => check.misconceptionIds.includes(m) && MISCONCEPTIONS[m]);
  const outcome: CheckOutcome = {
    checkId: check.id,
    variant: ref.variant,
    correct: evaluation.correct,
    misconceptionIds: evaluation.correct ? [] : allowed,
    answeredAt: now()
  };

  let profile = state.profile;
  let events = state.log;
  let plan = state.plan;
  const queue = [...progress.queue];
  let decision: AdaptiveDecision;

  if (evaluation.correct) {
    profile = applyDemonstration(profile, check.dimension, check.concept, false);
    // A correct answer on a check that tests a previously-detected misconception resolves it.
    for (const m of check.misconceptionIds) {
      const open = profile[MISCONCEPTIONS[m]?.dimension ?? check.dimension]?.misconceptions.some((r) => r.id === m && !r.resolved);
      if (open) {
        profile = resolveMisconception(profile, m);
        events = [...events, { at: now(), kind: 'demonstrated' as const, text: `Resolved: “${MISCONCEPTIONS[m].label}”.` }];
      }
    }
    decision = { type: 'continue', message: 'Understanding shown — moving on.' };
  } else {
    for (const m of allowed) {
      profile = recordMisconception(profile, MISCONCEPTIONS[m].dimension, m, 'check');
      events = [...events, { at: now(), kind: 'misconception' as const, text: `Detected: “${MISCONCEPTIONS[m].label}”.` }];
    }

    const alternative = ref.variant === 'core' ? exp.alternatives[check.id] : undefined;
    const alreadyQueued = queue.some((q) => q.variant === 'alternative' && q.checkId === alternative?.check.id);
    if (alternative && !alreadyQueued) {
      queue.splice(progress.index + 1, 0, { checkId: alternative.check.id, variant: 'alternative' });
      events = [...events, { at: now(), kind: 'alternative' as const, text: `Added a different example for “${check.concept}”.` }];
      decision = {
        type: 'alternative',
        message: 'Let’s look at this from another angle, then try a fresh example.',
        explanation: alternative.explanation
      };
    } else {
      // Second miss on the same concept: schedule a remedial experience if one exists.
      const remedyId = pickRemedy(state, allowed, id);
      if (remedyId) {
        const index = plan.findIndex((p) => p.id === id);
        const item: PlanItem = {
          id: remedyId,
          reason: `Added because “${MISCONCEPTIONS[allowed[0]]?.label ?? check.concept}” needs a different experience.`,
          addedBy: 'adaptation',
          status: 'pending'
        };
        plan = plan.some((p) => p.id === remedyId)
          ? plan.map((p) => (p.id === remedyId && p.status !== 'demonstrated' ? { ...p, status: 'pending' } : p))
          : [...plan.slice(0, index + 1), item, ...plan.slice(index + 1)];
        events = [...events, { at: now(), kind: 'remedy' as const, text: `Scheduled “${EXPERIENCES[remedyId].title}” next to address this.` }];
        decision = {
          type: 'remedy',
          message: `I’ve added “${EXPERIENCES[remedyId].title}” to your plan — it tackles this idea differently.`,
          remedyId
        };
      } else {
        decision = { type: 'needs-review', message: 'This concept is flagged to revisit. You can continue and come back to it.' };
      }
    }
  }

  const nextProgress: ExperienceProgress = { ...progress, queue, outcomes: [...progress.outcomes, outcome] };
  return {
    state: {
      ...state,
      profile,
      plan,
      log: events.slice(-40),
      progress: { ...state.progress, [id]: nextProgress },
      updatedAt: now()
    },
    decision
  };
}

function pickRemedy(state: JourneyState, misconceptionIds: string[], currentId: ExperienceId): ExperienceId | null {
  for (const m of misconceptionIds) {
    for (const r of MISCONCEPTIONS[m]?.remedies ?? []) {
      if (r !== currentId && state.progress[r]?.result !== 'demonstrated') return r;
    }
  }
  return null;
}

/** Was the concept behind a core check eventually shown (core or its alternative)? */
function conceptShown(exp: Experience, outcomes: CheckOutcome[], coreId: string): boolean {
  const altId = exp.alternatives[coreId]?.check.id;
  return outcomes.some((o) => o.correct && (o.checkId === coreId || (altId && o.checkId === altId)));
}

/** Move to the next check; appends the transfer check, then finishes the experience. */
export function advanceCheck(state: JourneyState): JourneyState {
  const id = state.currentId;
  const exp = getExperience(id);
  const progress = id ? state.progress[id] : undefined;
  if (!id || !exp || !progress) return state;

  let queue = progress.queue;
  const nextIndex = progress.index + 1;
  if (nextIndex >= queue.length && !queue.some((q) => q.variant === 'transfer')) {
    queue = [...queue, { checkId: exp.transfer.id, variant: 'transfer' }];
  }
  if (nextIndex < queue.length) {
    return { ...state, progress: { ...state.progress, [id]: { ...progress, queue, index: nextIndex } }, updatedAt: now() };
  }
  return finishExperience(state);
}

export function experienceResult(exp: Experience, outcomes: CheckOutcome[]): 'demonstrated' | 'needs-review' {
  const coresShown = exp.checks.every((c) => conceptShown(exp, outcomes, c.id));
  const transferShown = outcomes.some((o) => o.variant === 'transfer' && o.correct);
  return coresShown && transferShown ? 'demonstrated' : 'needs-review';
}

function finishExperience(state: JourneyState): JourneyState {
  const id = state.currentId;
  const exp = getExperience(id);
  const progress = id ? state.progress[id] : undefined;
  if (!id || !exp || !progress) return state;

  const result = experienceResult(exp, progress.outcomes);
  let profile = state.profile;
  if (result === 'demonstrated') {
    // Only areas actually tested by checks count as demonstrated.
    const dims = new Set([...exp.checks.map((c) => c.dimension), exp.transfer.dimension]);
    for (const d of dims) profile = applyDemonstration(profile, d, exp.outcome, true);
  }

  return {
    ...state,
    profile,
    plan: state.plan.map((p) => (p.id === id ? { ...p, status: result } : p)),
    progress: { ...state.progress, [id]: { ...progress, stage: 'done', result } },
    log: log(
      state,
      result === 'demonstrated' ? 'demonstrated' : 'misconception',
      result === 'demonstrated' ? `Demonstrated understanding in “${exp.title}”.` : `“${exp.title}” is marked to revisit.`
    ),
    updatedAt: now()
  };
}

/** The next pending item in the plan (adaptation-inserted items sit right after their trigger). */
export function nextPlanItem(state: JourneyState): ExperienceId | null {
  return state.plan.find((p) => p.status === 'pending')?.id ?? null;
}

export function continueJourney(state: JourneyState): JourneyState {
  const next = nextPlanItem(state);
  if (next) return startExperience(state, next);
  return { ...state, phase: 'summary', currentId: null, updatedAt: now() };
}

export function skipExperience(state: JourneyState): JourneyState {
  const id = state.currentId;
  if (!id) return state;
  const progress = state.progress[id];
  const skipped: JourneyState = {
    ...state,
    plan: state.plan.map((p) => (p.id === id ? { ...p, status: 'skipped' } : p)),
    progress: progress ? { ...state.progress, [id]: { ...progress, result: 'skipped', stage: 'done' } } : state.progress,
    log: log(state, 'skip', `Skipped “${EXPERIENCES[id].title}” — it stays available.`),
    currentId: null
  };
  return continueJourney(skipped);
}

export function addToPlan(state: JourneyState, id: ExperienceId): JourneyState {
  if (state.plan.some((p) => p.id === id && p.status !== 'skipped')) return state;
  const plan = state.plan.some((p) => p.id === id)
    ? state.plan.map((p) => (p.id === id ? { ...p, status: 'pending' as const, addedBy: 'user' as const } : p))
    : [...state.plan, { id, reason: 'You added this yourself.', addedBy: 'user' as const, status: 'pending' as const }];
  return { ...state, plan, log: log(state, 'plan', `Added “${EXPERIENCES[id].title}” to the plan.`), updatedAt: now() };
}

export function goToSummary(state: JourneyState): JourneyState {
  return {
    ...state,
    phase: 'summary',
    currentId: null,
    plan: state.plan.map((p) => (p.status === 'active' ? { ...p, status: 'pending' as const } : p)),
    updatedAt: now()
  };
}

export function journeyStats(state: JourneyState) {
  const items = state.plan;
  const done = items.filter((p) => p.status === 'demonstrated').length;
  const review = items.filter((p) => p.status === 'needs-review').length;
  const skipped = items.filter((p) => p.status === 'skipped').length;
  const finished = done + review + skipped;
  return {
    total: items.length,
    done,
    review,
    skipped,
    finished,
    percent: items.length === 0 ? 0 : Math.round((finished / items.length) * 100)
  };
}

export type { CheckRef };
