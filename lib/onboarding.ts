export const GROWW_URL = 'https://groww.in/';
export const STORAGE_KEY = 'growerr:onboarding:v1';

export type QuestionKey =
  | 'goal'
  | 'horizon'
  | 'risk'
  | 'budget'
  | 'experience'
  | 'priority';

export type IconName =
  | 'trend-up'
  | 'target'
  | 'graduation'
  | 'compass'
  | 'clock'
  | 'calendar'
  | 'help'
  | 'trend-down'
  | 'pause'
  | 'chat'
  | 'wallet'
  | 'coins'
  | 'banknote'
  | 'lock'
  | 'sprout'
  | 'book'
  | 'shield'
  | 'activity';

export type Answers = {
  goal: 'grow' | 'goal' | 'learn' | 'explore';
  horizon: 'short' | 'medium' | 'long' | 'unsure';
  risk: 'sell' | 'hold' | 'buy' | 'advice';
  budget: 'under500' | '500to5k' | '5kto25k' | 'over25k' | 'private';
  experience: 'new' | 'some' | 'confident';
  priority: 'safety' | 'steady' | 'growth' | 'learn';
};

export type QuestionOption = {
  value: string;
  label: string;
  hint: string;
  icon: IconName;
};

export type Question = {
  key: QuestionKey;
  eyebrow: string;
  title: string;
  help: string;
  options: QuestionOption[];
};

export const questions: Question[] = [
  {
    key: 'goal',
    eyebrow: 'Your reason',
    title: 'What brings you to investing?',
    help: 'There is no wrong answer. Pick what feels closest today.',
    options: [
      { value: 'grow', label: 'Grow my money', hint: 'I want my savings to have a chance to grow over time.', icon: 'trend-up' },
      { value: 'goal', label: 'Save for a goal', hint: 'A trip, a course, a home — something specific.', icon: 'target' },
      { value: 'learn', label: 'Learn by doing', hint: 'I want to understand investing before going bigger.', icon: 'graduation' },
      { value: 'explore', label: 'Just exploring', hint: 'I am curious and not ready to decide anything yet.', icon: 'compass' }
    ]
  },
  {
    key: 'horizon',
    eyebrow: 'Your timeline',
    title: 'When might you need this money?',
    help: 'A rough sense of time helps separate short-term savings from long-term investing.',
    options: [
      { value: 'short', label: 'Less than 3 years', hint: 'I may need this money soon.', icon: 'clock' },
      { value: 'medium', label: '3 to 7 years', hint: 'I can leave it alone for a while.', icon: 'calendar' },
      { value: 'long', label: '7 years or more', hint: 'I am thinking long term.', icon: 'sprout' },
      { value: 'unsure', label: 'I am not sure yet', hint: 'I would like to think it through.', icon: 'help' }
    ]
  },
  {
    key: 'risk',
    eyebrow: 'Ups and downs',
    title: 'Your investment drops 20% in a month. What feels most like you?',
    help: 'Markets move. Being honest here is more useful than sounding brave.',
    options: [
      { value: 'sell', label: 'I would sell and step back', hint: 'I would rather stop the loss than wait.', icon: 'trend-down' },
      { value: 'hold', label: 'I would worry, but hold', hint: 'I would stay put and watch for a while.', icon: 'pause' },
      { value: 'buy', label: 'I would see an opportunity', hint: 'I would consider adding more.', icon: 'trend-up' },
      { value: 'advice', label: 'I would want to talk to someone', hint: 'I would look for guidance before acting.', icon: 'chat' }
    ]
  },
  {
    key: 'budget',
    eyebrow: 'Starting amount',
    title: 'Roughly how much could you start with?',
    help: 'An estimate is enough. We never ask for bank details, and this stays in your browser.',
    options: [
      { value: 'under500', label: 'Under ₹500', hint: 'I would like to start small.', icon: 'coins' },
      { value: '500to5k', label: '₹500 – ₹5,000', hint: 'A comfortable first step.', icon: 'wallet' },
      { value: '5kto25k', label: '₹5,000 – ₹25,000', hint: 'I have some room to begin.', icon: 'banknote' },
      { value: 'over25k', label: 'Over ₹25,000', hint: 'I can start with more.', icon: 'trend-up' },
      { value: 'private', label: 'Prefer not to say', hint: 'Skip this one — it will not change the next step.', icon: 'lock' }
    ]
  },
  {
    key: 'experience',
    eyebrow: 'Your experience',
    title: 'How familiar does investing feel?',
    help: 'This only changes the words we suggest you start with — not what you can access.',
    options: [
      { value: 'new', label: 'Complete beginner', hint: 'I am starting from zero.', icon: 'sprout' },
      { value: 'some', label: 'I know the basics', hint: 'I have read a little or tried a little.', icon: 'book' },
      { value: 'confident', label: 'Fairly confident', hint: 'I understand markets and common products.', icon: 'trend-up' }
    ]
  },
  {
    key: 'priority',
    eyebrow: 'What matters most',
    title: 'What would make you feel good about your first investment?',
    help: 'Pick the one that matters most right now. You can change your mind later.',
    options: [
      { value: 'safety', label: 'Keeping risk low', hint: 'I would like to protect what I put in.', icon: 'shield' },
      { value: 'steady', label: 'Steady, predictable growth', hint: 'Slow and boring sounds fine to me.', icon: 'activity' },
      { value: 'growth', label: 'Higher growth potential', hint: 'I can accept bigger swings along the way.', icon: 'trend-up' },
      { value: 'learn', label: 'Understanding as I go', hint: 'I want to learn before I chase returns.', icon: 'book' }
    ]
  }
];

const optionLabels: Record<QuestionKey, Record<string, string>> = Object.fromEntries(
  questions.map((question) => [
    question.key,
    Object.fromEntries(question.options.map((option) => [option.value, option.label]))
  ])
) as Record<QuestionKey, Record<string, string>>;

export function optionLabel(key: QuestionKey, value: string): string {
  return optionLabels[key][value] ?? value;
}

export function isCompleteAnswers(value: unknown): value is Answers {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return questions.every((question) => {
    const answer = record[question.key];
    return typeof answer === 'string' && question.options.some((option) => option.value === answer);
  });
}

export function sanitizeAnswers(value: unknown): Partial<Answers> {
  const result: Partial<Answers> = {};
  if (!value || typeof value !== 'object') return result;
  const record = value as Record<string, unknown>;
  for (const question of questions) {
    const answer = record[question.key];
    if (typeof answer === 'string' && question.options.some((option) => option.value === answer)) {
      (result as Record<string, string>)[question.key] = answer;
    }
  }
  return result;
}

export function answeredCount(value: Partial<Answers>): number {
  return questions.filter((question) => Boolean(value[question.key])).length;
}

export function progressPercent(stepIndex: number): number {
  return Math.round(((stepIndex + 1) / questions.length) * 100);
}

export type SummaryRow = {
  key: QuestionKey;
  label: string;
  value: string;
};

const riskDescriptions: Record<Answers['risk'], string> = {
  sell: 'You would rather step back than wait out a fall.',
  hold: 'You would hold on, even if a fall felt uncomfortable.',
  buy: 'You would see a fall as a possible opportunity.',
  advice: 'You would look for guidance before acting on a fall.'
};

export function summaryRows(answers: Answers): SummaryRow[] {
  return [
    { key: 'goal', label: 'Your reason', value: optionLabel('goal', answers.goal) },
    { key: 'horizon', label: 'Your timeline', value: optionLabel('horizon', answers.horizon) },
    { key: 'risk', label: 'When markets dip', value: riskDescriptions[answers.risk] },
    {
      key: 'budget',
      label: 'Starting amount',
      value: answers.budget === 'private' ? 'Prefer not to say' : optionLabel('budget', answers.budget)
    },
    { key: 'experience', label: 'Your experience', value: optionLabel('experience', answers.experience) },
    { key: 'priority', label: 'What matters most', value: optionLabel('priority', answers.priority) }
  ];
}

const priorityTopics: Record<Answers['priority'], string[]> = {
  safety: ['How risk and diversification work', 'What makes a fund lower or higher risk'],
  steady: ['Index funds and how SIPs smooth entry', 'What a diversified portfolio looks like'],
  growth: ['How equity funds work and why they rise and fall', 'Matching risk to a timeline you can live with'],
  learn: ['A plain-language investing glossary', 'How to read a fund fact sheet']
};

export function suggestedTopics(answers: Answers): string[] {
  const topics = [...priorityTopics[answers.priority]];

  if (answers.experience === 'new') {
    topics.unshift('Investing basics and common account types');
  }
  if (answers.horizon === 'short') {
    topics.push('Why short timelines need extra care with market risk');
  }
  if (answers.goal === 'goal') {
    topics.push('Matching investments to a goal date');
  }
  if (answers.risk === 'sell' || answers.risk === 'advice') {
    topics.push('Staying calm when prices fall');
  }

  return [...new Set(topics)].slice(0, 3);
}

export function summaryText(answers: Answers): string {
  return [
    'My Growerr starting point',
    '',
    ...summaryRows(answers).map((row) => `${row.label}: ${row.value}`),
    '',
    'What to explore first on Groww:',
    ...suggestedTopics(answers).map((topic) => `- ${topic}`),
    '',
    'Growerr is an independent educational tool, not affiliated with Groww. This is not investment advice.'
  ].join('\n');
}
