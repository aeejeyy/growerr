import { safeEcho } from '../education';
import { getStep } from './scenarios';
import type { EvaluationResult, ScenarioStep } from './types';

const MISCONCEPTION_PATTERNS: Record<string, RegExp> = {
  'same-thing': /\b(same thing|identical|no difference)\b/i,
  'guaranteed-return': /\b(guarantee|guaranteed|assured|fixed return|risk[- ]free)\b/i,
  'fund-cannot-move': /\b(fund|unit)s?\s+(can ?not|cannot|does not|don'?t)\s+(move|change|fall|vary)\b/i,
  'risk-removed': /\b(remove|removes|removed|no|zero|without)\s+(all\s+)?risk\b/i,
  'no-diversification': /\b(no effect|does not change|doesn'?t change)\b.{0,30}\b(concentration|company|diversif)/i,
  'only-up': /\b(always|only|guaranteed to)\s+(go|end|move)\s+up\b/i,
  'execution-guarantee': /\b(guarantee|guaranteed)\b.{0,30}\b(execute|execution|fill)\b/i,
  'displayed-price-guarantee': /\b(guarantee|promise|promised)\b.{0,30}\b(displayed|shown|screen|price)\b/i,
  'same-orders': /\b(no difference|same as|same thing as)\b.{0,20}\b(market|limit)\b/i
};

function feedbackFor(step: ScenarioStep, misconceptionIds: string[]): string[] {
  const known = misconceptionIds.find((id) => step.misconceptionIds.includes(id));
  if (known && 'feedback' in step && step.feedback[known]) return [step.feedback[known]];
  return [step.fallbackFeedback];
}

export function staticEvaluateStep(step: ScenarioStep, answer: string | number): EvaluationResult {
  if (step.kind === 'choice') {
    const selected = typeof answer === 'string' ? answer : '';
    const correct = step.correctOptionIds.includes(selected);
    const misconceptionIds = step.misconceptionIds.filter((id) => id === selected && MISCONCEPTION_PATTERNS[id]);
    return {
      correct,
      feedback: correct ? [step.successFeedback] : feedbackFor(step, misconceptionIds),
      misconceptionIds: correct ? [] : misconceptionIds,
      demonstrated: correct,
      evidence: correct ? [safeEcho(step.prompt, 120)] : [],
      source: 'static'
    };
  }

  if (step.kind === 'condition') {
    const value = typeof answer === 'number' ? answer : Number(answer);
    const correct = Number.isFinite(value) && value <= step.targetMax;
    return {
      correct,
      feedback: correct ? [step.successFeedback] : [step.fallbackFeedback],
      misconceptionIds: correct ? [] : step.misconceptionIds.filter((id) => MISCONCEPTION_PATTERNS[id]),
      demonstrated: correct,
      evidence: correct ? [`Set an invented condition of ${value} ${step.unit}.`] : [],
      source: 'static'
    };
  }

  const text = typeof answer === 'string' ? answer.trim() : '';
  const lower = text.toLowerCase();
  const detected = step.misconceptionIds.filter((id) => MISCONCEPTION_PATTERNS[id]?.test(lower));
  const conceptsMet = step.requiredConcepts.every((group) => group.some((term) => lower.includes(term.toLowerCase())));
  const correct = text.length >= step.minLength && conceptsMet && detected.length === 0;

  return {
    correct,
    feedback: correct
      ? [step.successFeedback]
      : detected.length > 0
        ? feedbackFor(step, detected)
        : [step.fallbackFeedback],
    misconceptionIds: correct ? [] : detected,
    demonstrated: correct,
    evidence: correct ? [safeEcho(text, 160)] : [],
    source: 'static'
  };
}

export function evaluateScenarioAnswer(scenarioId: string, stepId: string, answer: string | number): EvaluationResult | null {
  const step = getStep(scenarioId, stepId);
  if (!step) return null;
  return staticEvaluateStep(step, answer);
}
