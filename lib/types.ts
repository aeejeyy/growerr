export type Scenario = 'exploring' | 'considering' | 'revisiting';
export type Intention = 'learn_more' | 'wait' | 'review_existing' | 'unsure';
export type AdviceClaim = { id: string; claim: string; source: string; evidence: string; concerns: string; verified: false };
export type Review = { id: string; createdAt: string; whatChanged: string; whatStillHolds: string; nextQuestion: string; confidence?: number };
export type OriginalReflection = { decisionQuestion: string; motivation: string; knownFacts: string; assumptions: string; lossConcern: string; unansweredQuestions: string[]; adviceClaims: AdviceClaim[]; intention: Intention; reviewTrigger: string };
export type DecisionSnapshot = {
  id: string; schemaVersion: 1; createdAt: string; updatedAt: string;
  scenario: Scenario; title: string; motivation: string; decisionQuestion: string;
  investmentLabel: string; illustrativeAmountINR?: number; illustrationPercent: 10 | 20 | 30;
  unfamiliarTerms: string[]; lossConcern: string; adviceClaims: AdviceClaim[];
  confidence?: number; knownFacts: string; assumptions: string; unansweredQuestions: string[];
  intention: Intention; reviewTrigger: string; reviews: Review[]; isSyntheticDemo: boolean;
  originalQuestion?: string; originalRationale?: string; original?: OriginalReflection;
};
export type Draft = Omit<DecisionSnapshot, 'id' | 'schemaVersion' | 'createdAt' | 'updatedAt' | 'reviews'> & { editingId?: string };
export const scenarioNames: Record<Scenario, string> = {
  exploring: 'I’m exploring', considering: 'I’m considering an investment', revisiting: 'I’m revisiting a difficult experience'
};
export const intentionNames: Record<Intention, string> = {
  learn_more: 'Learn more', wait: 'Wait', review_existing: 'Review an existing decision', unsure: 'Not sure yet'
};
export function blankDraft(scenario: Scenario = 'exploring'): Draft {
  return { scenario, title: '', motivation: '', decisionQuestion: '', investmentLabel: '', illustrationPercent: 10,
    unfamiliarTerms: [], lossConcern: '', adviceClaims: [], knownFacts: '', assumptions: '', unansweredQuestions: [],
    intention: 'unsure', reviewTrigger: '', isSyntheticDemo: false };
}
export function demoDraft(): Draft {
  return { ...blankDraft('revisiting'), title: 'Revisiting my first investment',
    motivation: 'I stopped investing after a loss and want to understand what happened before deciding what to learn next.',
    decisionQuestion: 'What do I need to understand before I revisit this decision?',
    investmentLabel: 'Example Stock', illustrativeAmountINR: 3500, illustrationPercent: 10,
    unfamiliarTerms: ['Volatility', 'Unrealized loss'],
    lossConcern: 'A loss made me worry about money I might need for other plans.',
    adviceClaims: [
      { id: 'demo-claim-a', claim: 'A price drop means the investment is now a bargain.', source: 'A friend', evidence: '', concerns: 'A lower price alone does not explain the underlying value.', verified: false },
      { id: 'demo-claim-b', claim: 'After a loss, it is always best to leave the market.', source: 'An online post', evidence: '', concerns: 'The statement does not account for my goals or the reason for the loss.', verified: false }
    ],
    confidence: 2, knownFacts: 'I noticed a loss and stopped investing for a while.',
    assumptions: 'I may have treated conflicting opinions as facts.',
    unansweredQuestions: ['What changed in the business, if anything?', 'When might I need this money?'],
    intention: 'learn_more', reviewTrigger: 'After I check the original reason for investing and the sources behind each claim.',
    isSyntheticDemo: true };
}
