/**
 * Visual quick start: a tap-only alternative to the open-ended first question.
 * Turns three simple picks (goal, experience, topics) into the same DiscoveryAnalysis
 * shape the conversational guide produces, so the planner treats both paths identically.
 */
import { EXPERIENCES } from './experiences';
import type { Dimension, DiscoveryAnalysis, ExperienceId, ExperienceLevel, Intent } from './types';

export type GoalId = 'grow' | 'trade' | 'app' | 'curious';
export type LevelId = 'none' | 'some' | 'experienced';
export type TopicId =
  | 'what-is-share'
  | 'stocks-vs-funds'
  | 'invest-vs-trade'
  | 'price-moves'
  | 'losing-money'
  | 'order-types'
  | 'order-not-filled'
  | 'app-screens'
  | 'charges'
  | 'order-to-holding';

export const GOALS: { id: GoalId; title: string; text: string; intent: Intent }[] = [
  { id: 'grow', title: 'Grow my money over time', text: 'Investing for months or years', intent: 'investing' },
  { id: 'trade', title: 'Try buying and selling', text: 'How trades and orders work', intent: 'trading' },
  { id: 'app', title: 'Make sense of a broker app', text: 'Screens, buttons and costs', intent: 'platform' },
  { id: 'curious', title: 'I’m just curious', text: 'Start with the basics', intent: 'exploring' }
];

export const LEVELS: { id: LevelId; title: string; text: string }[] = [
  { id: 'none', title: 'Completely new', text: 'I haven’t invested or traded before' },
  { id: 'some', title: 'A little', text: 'I know some terms or tried it once' },
  { id: 'experienced', title: 'Quite a bit', text: 'I’ve invested or traded before' }
];

export const TOPICS: { id: TopicId; label: string; experience: ExperienceId; dimension: Dimension }[] = [
  { id: 'what-is-share', label: 'What owning a share means', experience: 'EXP-01', dimension: 'fundamentals' },
  { id: 'stocks-vs-funds', label: 'Stocks vs mutual funds', experience: 'EXP-02', dimension: 'products' },
  { id: 'invest-vs-trade', label: 'Investing vs trading', experience: 'EXP-03', dimension: 'fundamentals' },
  { id: 'price-moves', label: 'Why prices go up and down', experience: 'EXP-04', dimension: 'risk' },
  { id: 'losing-money', label: 'The risk of losing money', experience: 'EXP-04', dimension: 'risk' },
  { id: 'order-types', label: 'Market vs limit orders', experience: 'EXP-05', dimension: 'tradingMechanics' },
  { id: 'order-not-filled', label: 'Why an order doesn’t go through', experience: 'EXP-07', dimension: 'tradingMechanics' },
  { id: 'app-screens', label: 'What the app screens mean', experience: 'EXP-08', dimension: 'platform' },
  { id: 'charges', label: 'Charges and fees', experience: 'EXP-09', dimension: 'platform' },
  { id: 'order-to-holding', label: 'How an order becomes a holding', experience: 'EXP-10', dimension: 'tradingMechanics' }
];

/** Topics shown first for each goal (all topics remain available). */
export const SUGGESTED_TOPICS: Record<GoalId, TopicId[]> = {
  grow: ['stocks-vs-funds', 'what-is-share', 'price-moves', 'losing-money', 'invest-vs-trade'],
  trade: ['order-types', 'order-not-filled', 'order-to-holding', 'invest-vs-trade', 'price-moves'],
  app: ['app-screens', 'charges', 'order-to-holding', 'order-types', 'stocks-vs-funds'],
  curious: ['what-is-share', 'stocks-vs-funds', 'invest-vs-trade', 'price-moves', 'app-screens']
};

/** Basics used when someone picks no topic ("not sure"). */
const DEFAULT_FOCUS: Record<GoalId, ExperienceId[]> = {
  grow: ['EXP-01', 'EXP-02', 'EXP-04'],
  trade: ['EXP-05', 'EXP-06', 'EXP-07'],
  app: ['EXP-08', 'EXP-10', 'EXP-09'],
  curious: ['EXP-01', 'EXP-03', 'EXP-04']
};

export type QuickPicks = { goal: GoalId; level: LevelId; topics: TopicId[] };

export function isGoal(v: unknown): v is GoalId {
  return GOALS.some((g) => g.id === v);
}

/** The user's picks, written as a sentence for the conversation log. */
export function picksSentence(p: QuickPicks): string {
  const goal = GOALS.find((g) => g.id === p.goal)!;
  const level = LEVELS.find((l) => l.id === p.level)!;
  const topics = TOPICS.filter((t) => p.topics.includes(t.id)).map((t) => t.label.toLowerCase());
  const want = topics.length ? `I’d like to understand: ${topics.join(', ')}.` : 'I’m not sure where to start.';
  return `${goal.title}. Experience: ${level.title.toLowerCase()}. ${want}`;
}

export function quickStartAnalysis(p: QuickPicks): DiscoveryAnalysis {
  const goal = GOALS.find((g) => g.id === p.goal) ?? GOALS[3];
  const picked = TOPICS.filter((t) => p.topics.includes(t.id));
  const focus = [...new Set(picked.length ? picked.map((t) => t.experience) : DEFAULT_FOCUS[goal.id])].slice(0, 4);
  const experience: ExperienceLevel = p.level;
  const appFamiliarity: ExperienceLevel = p.level === 'none' ? 'none' : 'unknown';

  const signals: DiscoveryAnalysis['signals'] = [];
  const seen = new Set<Dimension>();
  for (const t of picked) {
    if (seen.has(t.dimension)) continue;
    seen.add(t.dimension);
    signals.push({ dimension: t.dimension, state: 'needs-introduction', evidence: `Picked “${t.label}” as unclear` });
  }
  if (p.level === 'none' && !seen.has('fundamentals')) {
    signals.push({ dimension: 'fundamentals', state: 'needs-introduction', evidence: 'Said they are completely new' });
  }

  const first = EXPERIENCES[focus[0]];
  const objective = picked.length ? `Understand ${picked.slice(0, 2).map((t) => t.label.toLowerCase()).join(' and ')}` : `${goal.title} — starting with the basics`;
  const parts = [`Thanks — that gives me a clear picture. “${first.title}” is a great first step.`];
  if (p.level === 'none') parts.push('Starting from scratch is completely fine; everything is explained in plain words.');
  if (p.topics.includes('losing-money')) parts.push('Being careful about losing money is sensible — every number in the simulations is invented, so nothing is at stake.');

  return {
    reply: parts.join(' '),
    followUp: '',
    terms: [],
    intent: goal.intent,
    objective,
    motivation: goal.title,
    concerns: p.topics.includes('losing-money') ? ['Worried about losing money'] : [],
    questions: picked.map((t) => t.label),
    experience,
    appFamiliarity,
    signals: signals.slice(0, 4),
    misconceptionIds: [],
    focus,
    readyToPlan: true,
    adviceRequest: false
  };
}
