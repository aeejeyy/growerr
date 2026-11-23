import type { CoachExplanation } from '../education';

export const JOURNEY_VERSION = 1;

export type JourneyPhase = 'discovery' | 'scenario' | 'summary';
export type JourneyStatus = 'active' | 'paused';

export type KnowledgeDimension =
  | 'fundamentals'
  | 'products'
  | 'risk'
  | 'tradingMechanics'
  | 'platform'
  | 'decisions';

export type KnowledgeState = 'not-assessed' | 'needs-introduction' | 'developing' | 'demonstrated';

export type Confidence = 'not-stated' | 'low' | 'medium' | 'clear';

export type Intent = 'investing' | 'trading' | 'exploring' | 'platform' | 'unclear';

export type ProfileSignal = {
  dimension: KnowledgeDimension;
  state: KnowledgeState;
  evidence: string;
};

export type MisconceptionRecord = {
  id: string;
  resolved: boolean;
  note: string;
};

export type ProfileEntry = {
  dimension: KnowledgeDimension;
  state: KnowledgeState;
  claimed: string[];
  demonstrated: string[];
  misconceptions: MisconceptionRecord[];
};

export type Profile = Record<KnowledgeDimension, ProfileEntry>;

export type DiscoveryReply = {
  reflection: string;
  explanations: CoachExplanation[];
  unknowns: string[];
  question: string;
  unsure: boolean;
  notice?: string;
  intent: Intent;
  objective: string;
  facts: string[];
  confidence: Confidence;
  signals: ProfileSignal[];
};

export type EvaluationResult = {
  correct: boolean;
  feedback: string[];
  misconceptionIds: string[];
  demonstrated: boolean;
  evidence: string[];
  source: 'ai' | 'static';
  notice?: string;
};

export type JourneyMessage = {
  id: number;
  role: 'user' | 'guide';
  text: string;
  source?: 'ai' | 'static';
  reply?: DiscoveryReply;
  at: string;
};

export type ScenarioAttempt = {
  scenarioId: string;
  result: 'in-progress' | 'demonstrated' | 'needs-review' | 'skipped';
  reviewCount: number;
  stepResults: Record<string, boolean>;
  reviewSteps: string[];
  answers: Record<string, string | number>;
  feedback: string[];
  updatedAt: string;
};

export type JourneyState = {
  version: typeof JOURNEY_VERSION;
  phase: JourneyPhase;
  status: JourneyStatus;
  intent: Intent;
  objective: string;
  facts: string[];
  unknowns: string[];
  confidence: Confidence;
  profile: Profile;
  messages: JourneyMessage[];
  planReason: string;
  queue: string[];
  visited: string[];
  currentScenarioId: string | null;
  stepIndex: number;
  answers: Record<string, string | number>;
  attempts: Record<string, ScenarioAttempt>;
  lastEvaluation: EvaluationResult | null;
  startedAt: string;
  updatedAt: string;
};

export type ScenarioOption = {
  id: string;
  label: string;
};

type ScenarioStepBase = {
  id: string;
  prompt: string;
  help: string;
  dimension: KnowledgeDimension;
  sourceIds: string[];
  misconceptionIds: string[];
  successFeedback: string;
  fallbackFeedback: string;
};

export type ChoiceStep = ScenarioStepBase & {
  kind: 'choice';
  options: ScenarioOption[];
  correctOptionIds: string[];
  feedback: Record<string, string>;
};

export type ReflectionStep = ScenarioStepBase & {
  kind: 'reflection';
  minLength: number;
  requiredConcepts: string[][];
};

export type ConditionStep = ScenarioStepBase & {
  kind: 'condition';
  baseValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  targetMax: number;
};

export type ScenarioStep = ChoiceStep | ReflectionStep | ConditionStep;

export type Scenario = {
  id: string;
  title: string;
  objective: string;
  context: string;
  dimensions: KnowledgeDimension[];
  sourceIds: string[];
  steps: ScenarioStep[];
};

export type CoachTurn = {
  role: 'user' | 'guide';
  text: string;
};
