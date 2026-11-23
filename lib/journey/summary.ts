/**
 * Learning summary & broker handoff content (Module 6).
 */
import { educationItems } from '../education';
import { EXPERIENCES, MISCONCEPTIONS, allChecks, getExperience } from './experiences';
import { journeyStats } from './engine';
import { DIMENSIONS, DIMENSION_LABELS, STATE_LABELS, resolvedMisconceptions, unresolvedMisconceptions } from './profile';
import type { ExperienceId, JourneyState } from './types';

const PLATFORM_WORKFLOW: Partial<Record<ExperienceId, string>> = {
  'EXP-05': 'Placed a simulated market order and watched it fill across price levels',
  'EXP-06': 'Set a simulated limit price and saw when it does and doesn’t execute',
  'EXP-07': 'Placed simulated orders against busy and thin order books',
  'EXP-08': 'Toured watchlist, orders, holdings and funds in an example broker app',
  'EXP-09': 'Read a simulated contract note and identified who levies each charge',
  'EXP-10': 'Followed an order from placement to holdings (and one that never filled)'
};

export function buildSummary(state: JourneyState) {
  const stats = journeyStats(state);
  const explored = state.plan.filter((p) => state.progress[p.id]);
  const journey = state.plan.map((p) => ({
    id: p.id,
    title: EXPERIENCES[p.id].title,
    status: p.status,
    addedBy: p.addedBy,
    reason: p.reason
  }));

  const conceptsExplored = new Set<string>();
  const conceptsDemonstrated = new Set<string>();
  for (const p of explored) {
    const exp = getExperience(p.id);
    const progress = state.progress[p.id];
    if (!exp || !progress) continue;
    const checks = allChecks(exp);
    for (const o of progress.outcomes) {
      const check = checks.find((c) => c.id === o.checkId);
      if (!check) continue;
      conceptsExplored.add(check.concept);
      if (o.correct) conceptsDemonstrated.add(check.concept);
    }
  }

  const furtherLearning = [
    ...unresolvedMisconceptions(state.profile).map((m) => ({
      label: MISCONCEPTIONS[m.id]?.correction ?? m.id,
      experience: MISCONCEPTIONS[m.id]?.remedies[0]
    })),
    ...state.plan
      .filter((p) => p.status === 'needs-review' || p.status === 'skipped')
      .map((p) => ({ label: `Revisit “${EXPERIENCES[p.id].title}”`, experience: p.id }))
  ].slice(0, 6);

  const workflows = explored
    .filter((p) => PLATFORM_WORKFLOW[p.id] && state.progress[p.id]?.labExplored)
    .map((p) => PLATFORM_WORKFLOW[p.id] as string);

  const sourceIds = new Set(explored.flatMap((p) => EXPERIENCES[p.id].sourceIds));
  const sources = educationItems
    .filter((item) => sourceIds.has(item.id))
    .map((item) => item.source)
    .filter((s, i, all) => all.findIndex((x) => x.url === s.url) === i)
    .slice(0, 6);

  return {
    objective: state.objective || 'You started by exploring without a fixed question.',
    motivation: state.motivation,
    stats,
    journey,
    conceptsExplored: [...conceptsExplored],
    conceptsDemonstrated: [...conceptsDemonstrated],
    misconceptionsResolved: resolvedMisconceptions(state.profile).map((m) => MISCONCEPTIONS[m.id]?.label ?? m.id),
    furtherLearning,
    workflows,
    sources,
    profile: DIMENSIONS.map((d) => ({ dimension: d, label: DIMENSION_LABELS[d], state: state.profile[d].state, stateLabel: STATE_LABELS[state.profile[d].state] }))
  };
}

export function summaryText(state: JourneyState): string {
  const s = buildSummary(state);
  const lines = [
    'My Growerr learning summary',
    '',
    `What I wanted to understand: ${s.objective}`,
    '',
    `Journey: ${s.stats.done} of ${s.stats.total} experiences demonstrated${s.stats.review ? `, ${s.stats.review} to revisit` : ''}${s.stats.skipped ? `, ${s.stats.skipped} skipped` : ''}.`,
    ...s.journey.map((j) => `- ${j.title}: ${j.status.replace('-', ' ')}`),
    '',
    'Concepts demonstrated:',
    ...(s.conceptsDemonstrated.length ? s.conceptsDemonstrated.map((c) => `- ${c}`) : ['- None yet']),
    '',
    'To keep learning:',
    ...(s.furtherLearning.length ? s.furtherLearning.map((f) => `- ${f.label}`) : ['- Nothing flagged']),
    '',
    'Workflows practised (simulated):',
    ...(s.workflows.length ? s.workflows.map((w) => `- ${w}`) : ['- None']),
    '',
    'Official resources:',
    ...s.sources.map((src) => `- ${src.name}: ${src.url}`),
    '',
    'Educational summary only — not investment advice. Growerr is independent and not affiliated with any broker.'
  ];
  return lines.join('\n');
}
