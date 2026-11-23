import { educationItems, safeEcho } from '../education';
import { journeyProgress } from './engine';
import { unresolvedMisconceptions } from './profile';
import { getScenario } from './scenarios';
import type { JourneyState, KnowledgeDimension } from './types';

const INTENT_LABELS: Record<string, string> = {
  investing: 'Investing',
  trading: 'Trading mechanics',
  exploring: 'Exploring',
  platform: 'Brokerage app familiarity',
  unclear: 'Still open'
};

const DIMENSION_LABELS: Record<KnowledgeDimension, string> = {
  fundamentals: 'Investing fundamentals',
  products: 'Product structures',
  risk: 'Risk and volatility',
  tradingMechanics: 'Order mechanics',
  platform: 'Brokerage workflow',
  decisions: 'Financial decision concepts'
};

const WORKFLOW_LABELS: Record<string, string> = {
  'EXP-02': 'Compared a direct holding with a pooled unit',
  'EXP-04': 'Read an invented value path and separated two kinds of risk',
  'EXP-06': 'Set an invented order condition and compared order instructions'
};

export type JourneySummary = {
  objective: string;
  intentLabel: string;
  planReason: string;
  journeyCompleted: ReturnType<typeof journeyProgress>;
  conceptsExplored: string[];
  conceptsDemonstrated: string[];
  topicsNeedingLearning: string[];
  workflowsPractised: { id: string; title: string; status: string; workflow: string }[];
  sources: { name: string; url: string }[];
  confidenceLabel: string;
};

const CONFIDENCE_LABELS: Record<string, string> = {
  'not-stated': 'Not stated',
  low: 'Still unclear',
  medium: 'Reasonably clear',
  clear: 'Clearly stated'
};

export function buildJourneySummary(state: JourneyState): JourneySummary {
  const exploredIds = [...new Set([...state.visited, ...Object.keys(state.attempts)])];
  const workflowsPractised = exploredIds
    .map((id) => {
      const scenario = getScenario(id);
      const attempt = state.attempts[id];
      if (!scenario) return null;
      const status = attempt?.result === 'demonstrated'
        ? 'Concept demonstrated'
        : attempt?.result === 'needs-review'
          ? 'Worth another look'
          : attempt?.result === 'skipped'
            ? 'Skipped — available to revisit'
            : 'Explored';
      return {
        id,
        title: scenario.title,
        status,
        workflow: WORKFLOW_LABELS[id] ?? scenario.objective
      };
    })
    .filter((entry): entry is { id: string; title: string; status: string; workflow: string } => Boolean(entry));

  const conceptDimensions = new Set<KnowledgeDimension>();
  for (const id of exploredIds) {
    for (const dimension of getScenario(id)?.dimensions ?? []) conceptDimensions.add(dimension);
  }
  const conceptsExplored = [...conceptDimensions].map((dimension) => DIMENSION_LABELS[dimension]);

  const conceptsDemonstrated = Object.entries(state.profile)
    .filter(([, entry]) => entry.state === 'demonstrated')
    .map(([dimension, entry]) => `${DIMENSION_LABELS[dimension as KnowledgeDimension] ?? dimension}: ${entry.demonstrated[0] ?? 'explained in your own words'}`)
    .slice(0, 6);

  const misconceptionNotes = unresolvedMisconceptions(state.profile).map((item) => item.note).filter(Boolean);
  const topicsNeedingLearning = [...new Set([...misconceptionNotes, ...state.unknowns])].slice(0, 5);

  const sourceIds = [...new Set(exploredIds.flatMap((id) => getScenario(id)?.sourceIds ?? []))];
  const sources = sourceIds
    .map((id) => educationItems.find((item) => item.id === id)?.source)
    .filter((source): source is { name: string; url: string } => Boolean(source))
    .slice(0, 6);

  return {
    objective: state.objective || 'You left your starting point open.',
    intentLabel: INTENT_LABELS[state.intent] ?? 'Still open',
    planReason: state.planReason,
    journeyCompleted: journeyProgress(state),
    conceptsExplored,
    conceptsDemonstrated,
    topicsNeedingLearning,
    workflowsPractised,
    sources,
    confidenceLabel: CONFIDENCE_LABELS[state.confidence] ?? 'Not stated'
  };
}

export function journeySummaryText(state: JourneyState): string {
  const summary = buildJourneySummary(state);
  return [
    'My Growerr learning journey',
    '',
    `Original objective: ${summary.objective}`,
    `Learning focus: ${summary.intentLabel}`,
    `Clarity of stated objective: ${summary.confidenceLabel}`,
    `Journey completed: ${summary.journeyCompleted.explored} of ${summary.journeyCompleted.total} scenarios explored; ${summary.journeyCompleted.demonstrated} concept checks demonstrated.`,
    '',
    'Journey taken:',
    ...summary.workflowsPractised.map((item) => `- ${item.title} — ${item.status}`),
    '',
    'Concepts explored:',
    ...summary.conceptsExplored.map((item) => `- ${item}`),
    '',
    'Concepts demonstrated:',
    ...(summary.conceptsDemonstrated.length > 0 ? summary.conceptsDemonstrated.map((item) => `- ${item}`) : ['- None recorded yet.']),
    '',
    'Topics needing further learning:',
    ...(summary.topicsNeedingLearning.length > 0 ? summary.topicsNeedingLearning.map((item) => `- ${item}`) : ['- Nothing flagged.']),
    '',
    'Workflows practised:',
    ...summary.workflowsPractised.map((item) => `- ${item.workflow}`),
    '',
    'Official resources:',
    ...summary.sources.map((source) => `- ${source.name}: ${source.url}`),
    '',
    'General education only. Not investment advice. Growerr is independent and not affiliated with Groww.'
  ].map((line) => safeEcho(line, 500)).join('\n');
}
