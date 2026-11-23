import type { Scenario } from './types';

export const SCENARIO_IDS = ['EXP-02', 'EXP-04', 'EXP-06'] as const;

export const scenarios: Record<string, Scenario> = {
  'EXP-02': {
    id: 'EXP-02',
    title: 'Two ways to hold something',
    objective: 'Separate direct share ownership from a pooled mutual fund unit.',
    context: 'This is a hypothetical structure example using plain language. No company, fund, price or return is being suggested.',
    dimensions: ['products', 'fundamentals'],
    sourceIds: ['direct-shares', 'pooled-fund'],
    steps: [
      {
        id: 'what-differs',
        kind: 'choice',
        dimension: 'products',
        sourceIds: ['direct-shares', 'pooled-fund'],
        misconceptionIds: ['same-thing', 'guaranteed-return', 'fund-cannot-move'],
        prompt: 'What is the main structural difference between a company share and a mutual fund unit?',
        help: 'Think about what each one represents, not about which one is better.',
        options: [
          { id: 'direct-pool', label: 'A share is direct ownership in one company; a fund unit represents a share in a pool.' },
          { id: 'same-thing', label: 'They are the same thing with two different names.' },
          { id: 'guaranteed-return', label: 'A share guarantees a fixed return; a fund unit does not.' },
          { id: 'fund-cannot-move', label: 'A share can change value; a fund unit cannot.' }
        ],
        correctOptionIds: ['direct-pool'],
        feedback: {
          'direct-pool': 'Yes. A share is a direct ownership interest; a fund unit represents a proportion of a pooled portfolio.',
          'same-thing': 'They are related but not identical: one is a direct holding, the other is a unit in a pool.',
          'guaranteed-return': 'Neither route promises a fixed return. A guarantee is not part of either structure.',
          'fund-cannot-move': 'A fund unit can change value as the pool changes value.'
        },
        successFeedback: 'That is the structural distinction.',
        fallbackFeedback: 'Look at what each instrument represents rather than at outcomes.'
      },
      {
        id: 'pooling-effect',
        kind: 'choice',
        dimension: 'products',
        sourceIds: ['pooled-fund', 'volatility-risk'],
        misconceptionIds: ['risk-removed', 'guaranteed-return', 'no-diversification'],
        prompt: 'A fund holds many companies. What does that change in this example?',
        help: 'Separate company-specific risk from risk that affects the whole market.',
        options: [
          { id: 'spread', label: 'It spreads company-specific exposure, but market-wide risk remains.' },
          { id: 'risk-removed', label: 'It removes all risk.' },
          { id: 'guaranteed-return', label: 'It guarantees the original amount.' },
          { id: 'no-diversification', label: 'It has no effect on concentration.' }
        ],
        correctOptionIds: ['spread'],
        feedback: {
          spread: 'Correct: pooling can reduce dependence on one company, but it does not remove market-wide risk.',
          'risk-removed': 'Pooling reduces company-specific concentration; it does not remove every kind of risk.',
          'guaranteed-return': 'No structure in this scenario guarantees the original amount.',
          'no-diversification': 'Holding a portfolio does change concentration compared with holding one company only.'
        },
        successFeedback: 'You separated the two kinds of risk.',
        fallbackFeedback: 'Company-specific and market-wide risk are different ideas.'
      },
      {
        id: 'explain-difference',
        kind: 'reflection',
        dimension: 'products',
        sourceIds: ['direct-shares', 'pooled-fund'],
        misconceptionIds: ['same-thing', 'risk-removed', 'guaranteed-return'],
        prompt: 'In one sentence, what is different about owning a share and holding a fund unit?',
        help: 'Use your own words. No product names, amounts or predictions are needed.',
        minLength: 24,
        requiredConcepts: [
          ['share', 'stock', 'company', 'direct', 'ownership', 'owner'],
          ['fund', 'pool', 'portfolio', 'many', 'unit', 'combined']
        ],
        successFeedback: 'That captures the structural difference.',
        fallbackFeedback: 'A complete answer names both the direct holding and the pooled holding.'
      }
    ]
  },
  'EXP-04': {
    id: 'EXP-04',
    title: 'A hypothetical value path',
    objective: 'Explore volatility as movement in both directions, using invented numbers only.',
    context: 'The values in this scenario are invented for learning. They are not live prices, NAVs, forecasts or returns.',
    dimensions: ['risk', 'decisions'],
    sourceIds: ['volatility-risk'],
    steps: [
      {
        id: 'read-path',
        kind: 'choice',
        dimension: 'risk',
        sourceIds: ['volatility-risk'],
        misconceptionIds: ['only-up', 'guaranteed-return'],
        prompt: 'A pretend learning value moves 100 → 92 → 105. What does the path show?',
        help: 'Read only the movement shown; do not extend it into the future.',
        options: [
          { id: 'both-directions', label: 'It shows a fall followed by a rise in an invented example.' },
          { id: 'only-up', label: 'It proves values only go up over time.' },
          { id: 'guaranteed-return', label: 'It guarantees a gain for anything that starts at 100.' }
        ],
        correctOptionIds: ['both-directions'],
        feedback: {
          'both-directions': 'Yes. This invented path includes a fall and a later rise.',
          'only-up': 'The path includes a fall, so it cannot show movement in only one direction.',
          'guaranteed-return': 'One invented path says nothing about a guaranteed outcome.'
        },
        successFeedback: 'You read the example without adding a prediction.',
        fallbackFeedback: 'Describe only what the invented path actually shows.'
      },
      {
        id: 'what-volatility-means',
        kind: 'choice',
        dimension: 'risk',
        sourceIds: ['volatility-risk'],
        misconceptionIds: ['risk-removed', 'guaranteed-return', 'only-up'],
        prompt: 'What does volatility describe in this explanation?',
        help: 'Think about movement, not about a promise.',
        options: [
          { id: 'two-sided', label: 'The size of short-term movement in both directions, with loss possible.' },
          { id: 'risk-removed', label: 'A way to remove all uncertainty.' },
          { id: 'only-up', label: 'A pattern that always ends higher.' }
        ],
        correctOptionIds: ['two-sided'],
        feedback: {
          'two-sided': 'That is the neutral definition used here: movement can be in either direction.',
          'risk-removed': 'Volatility describes movement; it does not remove uncertainty.',
          'only-up': 'Movement is not described as one-directional.'
        },
        successFeedback: 'You used the two-sided meaning.',
        fallbackFeedback: 'Volatility is about movement in both directions.'
      },
      {
        id: 'diversification-limit',
        kind: 'choice',
        dimension: 'risk',
        sourceIds: ['volatility-risk', 'pooled-fund'],
        misconceptionIds: ['risk-removed', 'no-diversification'],
        prompt: 'Which statement stays within the source explanation about diversification?',
        help: 'One kind of risk can be reduced; another cannot.',
        options: [
          { id: 'company-only', label: 'It can reduce company-specific risk, but not market-wide risk.' },
          { id: 'risk-removed', label: 'It removes every kind of risk.' },
          { id: 'no-diversification', label: 'It has no effect on company-specific risk.' }
        ],
        correctOptionIds: ['company-only'],
        feedback: {
          'company-only': 'Correct: the source separates company-specific risk from market-wide risk.',
          'risk-removed': 'Market-wide risk remains even when a holding is spread across companies.',
          'no-diversification': 'Spreading exposure is precisely what changes company-specific concentration.'
        },
        successFeedback: 'You kept the limit of the idea.',
        fallbackFeedback: 'Diversification has a boundary; name it.'
      }
    ]
  },
  'EXP-06': {
    id: 'EXP-06',
    title: 'A hypothetical order condition',
    objective: 'Understand what an order condition means, without placing or describing a real transaction.',
    context: 'The quote and limit values here are invented. Nothing is sent to a broker or exchange.',
    dimensions: ['tradingMechanics', 'platform'],
    sourceIds: ['order-mechanics', 'brokerage-flow'],
    steps: [
      {
        id: 'limit-condition',
        kind: 'choice',
        dimension: 'tradingMechanics',
        sourceIds: ['order-mechanics'],
        misconceptionIds: ['execution-guarantee', 'displayed-price-guarantee', 'same-orders'],
        prompt: 'What does a limit condition set in the SEBI order-mechanics explanation?',
        help: 'Focus on the condition, not on whether it will be met.',
        options: [
          { id: 'price-condition', label: 'A price condition; execution is not guaranteed.' },
          { id: 'execution-guarantee', label: 'A guarantee that the order will execute.' },
          { id: 'displayed-price-guarantee', label: 'A promise of the price shown on screen.' },
          { id: 'same-orders', label: 'No difference from a market order.' }
        ],
        correctOptionIds: ['price-condition'],
        feedback: {
          'price-condition': 'Yes. A limit condition sets a boundary; it does not guarantee execution.',
          'execution-guarantee': 'The condition may not be met, so execution is not guaranteed.',
          'displayed-price-guarantee': 'A displayed value is not a promise about execution price.',
          'same-orders': 'A market order and a limit order carry different instructions.'
        },
        successFeedback: 'You identified the price condition.',
        fallbackFeedback: 'A limit condition is a boundary, not a guarantee.'
      },
      {
        id: 'set-condition',
        kind: 'condition',
        dimension: 'tradingMechanics',
        sourceIds: ['order-mechanics'],
        misconceptionIds: ['execution-guarantee', 'displayed-price-guarantee'],
        prompt: 'Set an invented maximum acceptable price below the invented quote of 100.',
        help: 'Use the slider. Then consider a case where the lowest available price in this pretend example stays at 100.',
        baseValue: 100,
        min: 94,
        max: 106,
        step: 1,
        unit: 'hypothetical units',
        targetMax: 99,
        successFeedback: 'A condition below 100 is not met if the available price stays at 100.',
        fallbackFeedback: 'Check whether your chosen condition is below the quote of 100.'
      },
      {
        id: 'market-order',
        kind: 'choice',
        dimension: 'tradingMechanics',
        sourceIds: ['order-mechanics'],
        misconceptionIds: ['displayed-price-guarantee', 'same-orders'],
        prompt: 'In the same invented example, what does a market order seek?',
        help: 'This is about order mechanics, not about what to do.',
        options: [
          { id: 'best-available', label: 'Execution at the best available price, not a guarantee of the displayed price.' },
          { id: 'displayed-price-guarantee', label: 'A guaranteed price equal to the number on screen.' },
          { id: 'same-orders', label: 'The same instruction as a limit condition.' }
        ],
        correctOptionIds: ['best-available'],
        feedback: {
          'best-available': 'Correct. The SEBI explanation describes a market order by execution at the best available price.',
          'displayed-price-guarantee': 'The displayed price is not a guarantee in this explanation.',
          'same-orders': 'A market order and a limit condition are different instructions.'
        },
        successFeedback: 'You kept the execution wording precise.',
        fallbackFeedback: 'Separate execution priority from a price promise.'
      }
    ]
  }
};

export function getScenario(id: string | null | undefined): Scenario | null {
  if (!id || !(id in scenarios)) return null;
  return scenarios[id];
}

export function getStep(scenarioId: string, stepId: string) {
  const scenario = getScenario(scenarioId);
  if (!scenario) return null;
  return scenario.steps.find((step) => step.id === stepId) ?? null;
}
