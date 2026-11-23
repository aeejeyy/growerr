/**
 * Evaluator (Module 5) — deterministic part.
 *
 * Choice, sort and slider checks are always evaluated deterministically.
 * Explain-in-your-own-words checks use the AI evaluator when available, with
 * this concept-and-misconception check as the validated fallback.
 */
import { MISCONCEPTIONS } from './experiences';
import type { Check, Evaluation } from './types';

export type Answer = string | number | Record<string, string>;

export function detectMisconceptions(text: string, allowed?: string[]): string[] {
  const ids = allowed ?? Object.keys(MISCONCEPTIONS);
  return ids.filter((id) => {
    const m = MISCONCEPTIONS[id];
    return m?.patterns.some((p) => {
      try {
        return new RegExp(p, 'i').test(text);
      } catch {
        return false;
      }
    });
  });
}

export function conceptsCovered(text: string, groups: string[][]): { met: number; total: number } {
  const lower = text.toLowerCase();
  const met = groups.filter((group) => group.some((term) => lower.includes(term.toLowerCase()))).length;
  return { met, total: groups.length };
}

export function isAnswerShapeValid(check: Check, answer: unknown): answer is Answer {
  switch (check.kind) {
    case 'choice':
      return typeof answer === 'string' && check.options.some((o) => o.id === answer);
    case 'slider':
      return typeof answer === 'number' && Number.isFinite(answer);
    case 'explain':
      return typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 1200;
    case 'sort':
      return (
        Boolean(answer) &&
        typeof answer === 'object' &&
        !Array.isArray(answer) &&
        Object.entries(answer as Record<string, unknown>).every(
          ([k, v]) => check.items.some((i) => i.id === k) && typeof v === 'string' && check.buckets.some((b) => b.id === v)
        )
      );
  }
}

export function staticEvaluate(check: Check, answer: Answer): Evaluation {
  switch (check.kind) {
    case 'choice': {
      const selected = String(answer);
      const correct = selected === check.correctOptionId;
      const misconception = check.optionMisconception[selected];
      return {
        correct,
        feedback: correct ? check.successFeedback : check.optionFeedback[selected] ?? check.retryFeedback,
        misconceptionIds: !correct && misconception ? [misconception] : [],
        source: 'static'
      };
    }
    case 'slider': {
      const value = Number(answer);
      const correct = value >= check.accept.min && value <= check.accept.max;
      return {
        correct,
        feedback: correct ? check.successFeedback : check.retryFeedback,
        misconceptionIds: correct ? [] : check.misconceptionIds.slice(0, 1),
        source: 'static'
      };
    }
    case 'sort': {
      const placed = answer as Record<string, string>;
      const wrong = check.items.filter((item) => placed[item.id] !== item.bucketId);
      const correct = wrong.length === 0;
      const bucket = (id: string) => check.buckets.find((b) => b.id === id)?.label ?? id;
      return {
        correct,
        feedback: correct
          ? check.successFeedback
          : `${wrong.length} of ${check.items.length} need another look — for example, “${wrong[0].label}” belongs under “${bucket(wrong[0].bucketId)}”. ${check.retryFeedback}`,
        misconceptionIds: correct ? [] : check.misconceptionIds.slice(0, 1),
        source: 'static'
      };
    }
    case 'explain': {
      const text = String(answer).trim();
      const detected = detectMisconceptions(text, check.misconceptionIds);
      const { met, total } = conceptsCovered(text, check.requiredConcepts);
      const correct = text.length >= check.minLength && met === total && detected.length === 0;
      let feedback = check.successFeedback;
      if (!correct) {
        if (detected.length > 0) feedback = MISCONCEPTIONS[detected[0]].correction;
        else if (text.length < check.minLength) feedback = 'Could you say a little more? A full sentence in your own words is perfect.';
        else feedback = check.retryFeedback;
      }
      return { correct, feedback, misconceptionIds: detected, source: 'static' };
    }
  }
}
