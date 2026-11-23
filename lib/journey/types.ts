/**
 * Core domain types for Growerr's Adaptive Experience Engine.
 *
 * Every piece of content (experiences, checks, misconceptions) is authored and
 * approved in code. The AI only classifies, diagnoses and evaluates; it never
 * produces content that is rendered without validation.
 */

export const JOURNEY_VERSION = 2;

/* ------------------------------------------------------------------ */
/* Knowledge model                                                     */
/* ------------------------------------------------------------------ */

export type Dimension =
  | 'fundamentals'
  | 'products'
  | 'risk'
  | 'tradingMechanics'
  | 'platform'
  | 'decisions';

export type KnowledgeState = 'not-assessed' | 'needs-introduction' | 'developing' | 'demonstrated';

export type Intent = 'investing' | 'trading' | 'exploring' | 'platform' | 'unclear';

export type ExperienceLevel = 'none' | 'some' | 'experienced' | 'unknown';

export type MisconceptionRecord = {
  id: string;
  /** Where it was detected: discovery text or a scenario check. */
  source: 'discovery' | 'check';
  resolved: boolean;
  detectedAt: string;
  resolvedAt?: string;
};

export type ProfileEntry = {
  dimension: Dimension;
  state: KnowledgeState;
  /** What the person said about themselves (never counts as demonstrated). */
  claimed: string[];
  /** Evidence from checks that were answered correctly. */
  demonstrated: string[];
  misconceptions: MisconceptionRecord[];
};

export type Profile = Record<Dimension, ProfileEntry>;

/* ------------------------------------------------------------------ */
/* Experience library                                                  */
/* ------------------------------------------------------------------ */

export type ExperienceId =
  | 'EXP-01'
  | 'EXP-02'
  | 'EXP-03'
  | 'EXP-04'
  | 'EXP-05'
  | 'EXP-06'
  | 'EXP-07'
  | 'EXP-08'
  | 'EXP-09'
  | 'EXP-10';

/** Each experience has one interactive "lab" component (components/labs/*). */
export type LabId =
  | 'share-split'
  | 'pool-vs-direct'
  | 'invest-vs-trade'
  | 'volatility-path'
  | 'market-order-book'
  | 'limit-order-sim'
  | 'order-depth'
  | 'broker-app-tour'
  | 'charges-explorer'
  | 'order-lifecycle';

export type Option = { id: string; label: string };

type CheckBase = {
  id: string;
  /** Short label of the concept this check tests, e.g. "Market order execution". */
  concept: string;
  prompt: string;
  /** Optional hint shown under the prompt. */
  help?: string;
  dimension: Dimension;
  /** Misconception ids (from MISCONCEPTIONS) this check can detect. */
  misconceptionIds: string[];
  /** Shown when the answer demonstrates understanding. */
  successFeedback: string;
  /** Shown when the answer is wrong and no option-specific feedback applies. */
  retryFeedback: string;
};

export type ChoiceCheck = CheckBase & {
  kind: 'choice';
  options: Option[];
  correctOptionId: string;
  /** Feedback per option id (should cover every wrong option). */
  optionFeedback: Record<string, string>;
  /** Maps a wrong option id to the misconception it reveals. */
  optionMisconception: Record<string, string>;
};

export type SortCheck = CheckBase & {
  kind: 'sort';
  buckets: Option[];
  items: { id: string; label: string; bucketId: string }[];
};

export type ExplainCheck = CheckBase & {
  kind: 'explain';
  minLength: number;
  /** Each inner array is a concept group; the answer must hit at least one term in every group. */
  requiredConcepts: string[][];
  /** A model answer shown after evaluation. */
  modelAnswer: string;
};

export type SliderCheck = CheckBase & {
  kind: 'slider';
  min: number;
  max: number;
  step: number;
  start: number;
  unit: string;
  /** Accepted inclusive range. */
  accept: { min: number; max: number };
};

export type Check = ChoiceCheck | SortCheck | ExplainCheck | SliderCheck;

export type Experience = {
  id: ExperienceId;
  title: string;
  /** One-line card description. */
  short: string;
  /** Learning objective. */
  objective: string;
  /** Starting context shown before the lab. */
  context: string;
  /** Expected learning outcome. */
  outcome: string;
  minutes: number;
  dimensions: Dimension[];
  lab: LabId;
  /** Instruction shown above the lab. */
  labPrompt: string;
  /** Experiences that should normally come first if the related dimension is not established. */
  prerequisites: ExperienceId[];
  /** Core checks, in order. */
  checks: Check[];
  /**
   * Alternative explanation + a new check (different example, same concept)
   * keyed by core check id. Used when a core check is answered incorrectly.
   */
  alternatives: Record<string, { explanation: string; check: Check }>;
  /** Application to an unfamiliar example; the last step of the experience. */
  transfer: Check;
  /** Education source ids from lib/education.ts. */
  sourceIds: string[];
};

export type Misconception = {
  id: string;
  /** How the misconception sounds, e.g. "A market order guarantees the displayed price". */
  label: string;
  /** What is actually true, one sentence. */
  correction: string;
  dimension: Dimension;
  /** Experiences that address it, best first. */
  remedies: ExperienceId[];
  /** Regexes (source strings, case-insensitive) that detect it in free text. */
  patterns: string[];
};

/* ------------------------------------------------------------------ */
/* Journey state                                                       */
/* ------------------------------------------------------------------ */

export type JourneyPhase = 'discovery' | 'plan' | 'experience' | 'summary';

export type PlanItemStatus = 'pending' | 'active' | 'demonstrated' | 'needs-review' | 'skipped';

export type PlanItem = {
  id: ExperienceId;
  /** Why this was chosen — shown to the user (explainable recommendations). */
  reason: string;
  addedBy: 'planner' | 'adaptation' | 'user';
  status: PlanItemStatus;
};

export type CheckVariant = 'core' | 'alternative' | 'transfer';

export type CheckRef = { checkId: string; variant: CheckVariant };

export type CheckOutcome = {
  checkId: string;
  variant: CheckVariant;
  correct: boolean;
  misconceptionIds: string[];
  answeredAt: string;
};

export type ExperienceProgress = {
  id: ExperienceId;
  stage: 'intro' | 'lab' | 'checks' | 'done';
  labExplored: boolean;
  /** The ordered queue of checks for this run (alternatives are inserted adaptively). */
  queue: CheckRef[];
  index: number;
  outcomes: CheckOutcome[];
  runs: number;
  result: 'in-progress' | 'demonstrated' | 'needs-review' | 'skipped';
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'guide';
  text: string;
  /** Short explanatory chips the guide attaches, e.g. a term definition. */
  terms?: { term: string; meaning: string }[];
  source?: 'ai' | 'static' | 'safety';
  at: string;
};

export type AdaptationEvent = {
  at: string;
  kind: 'profile' | 'plan' | 'misconception' | 'alternative' | 'remedy' | 'demonstrated' | 'skip' | 'revisit' | 'safety';
  text: string;
};

export type JourneyState = {
  version: typeof JOURNEY_VERSION;
  phase: JourneyPhase;
  paused: boolean;
  /* Discovery understanding */
  intent: Intent;
  objective: string;
  motivation: string;
  concerns: string[];
  questions: string[];
  experience: ExperienceLevel;
  appFamiliarity: ExperienceLevel;
  /** Experiences the discovery step thinks are most relevant (validated ids). */
  focus: ExperienceId[];
  readyToPlan: boolean;
  messages: ChatMessage[];
  /* Knowledge */
  profile: Profile;
  /* Journey */
  plan: PlanItem[];
  currentId: ExperienceId | null;
  progress: Partial<Record<ExperienceId, ExperienceProgress>>;
  log: AdaptationEvent[];
  aiMode: 'ai' | 'static' | 'unknown';
  startedAt: string;
  updatedAt: string;
};

/* ------------------------------------------------------------------ */
/* AI contracts (validated server-side before use)                     */
/* ------------------------------------------------------------------ */

export type DiscoveryAnalysis = {
  /** Conversational reply: reflect, explain any term in plain words. 1–3 short sentences. */
  reply: string;
  /** One follow-up question, or empty when ready to plan. */
  followUp: string;
  terms: { term: string; meaning: string }[];
  intent: Intent;
  objective: string;
  motivation: string;
  concerns: string[];
  questions: string[];
  experience: ExperienceLevel;
  appFamiliarity: ExperienceLevel;
  signals: { dimension: Dimension; state: Exclude<KnowledgeState, 'demonstrated'>; evidence: string }[];
  misconceptionIds: string[];
  focus: ExperienceId[];
  /** True when there's enough to build a first plan. */
  readyToPlan: boolean;
  /** True when the user asked for personalised advice; reply then explains the boundary. */
  adviceRequest: boolean;
};

export type Evaluation = {
  correct: boolean;
  feedback: string;
  misconceptionIds: string[];
  source: 'ai' | 'static';
};

export type HistoryTurn = { role: 'user' | 'guide'; text: string };
