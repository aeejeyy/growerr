'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check as CheckIcon, Lightbulb, Loader2, RotateCcw, Sparkles, X } from 'lucide-react';
import type { AdaptiveDecision } from '../../lib/journey/engine';
import type { Answer } from '../../lib/journey/evaluation';
import type { Check, CheckVariant, Evaluation } from '../../lib/journey/types';
import { Callout, cx } from '../ui';

const VARIANT_LABEL: Record<CheckVariant, { text: string; className: string }> = {
  core: { text: 'Concept check', className: 'bg-canvas text-ink-soft' },
  alternative: { text: 'Fresh example', className: 'bg-accent-50 text-accent-700' },
  transfer: { text: 'Apply it to something new', className: 'bg-brand-50 text-brand-800' }
};

export type CheckResult = { evaluation: Evaluation; decision: AdaptiveDecision };

export default function CheckCard({
  check,
  variant,
  position,
  onSubmit,
  onContinue,
  result
}: {
  check: Check;
  variant: CheckVariant;
  position: { index: number; total: number };
  onSubmit: (answer: Answer) => Promise<void>;
  onContinue: () => void;
  result: CheckResult | null;
}) {
  const [choice, setChoice] = useState('');
  const [text, setText] = useState('');
  const [slider, setSlider] = useState(check.kind === 'slider' ? check.start : 0);
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChoice('');
    setText('');
    setSorted({});
    if (check.kind === 'slider') setSlider(check.start);
    headingRef.current?.focus({ preventScroll: true });
  }, [check]);

  useEffect(() => {
    if (result) feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [result]);

  const ready = useMemo(() => {
    if (check.kind === 'choice') return Boolean(choice);
    if (check.kind === 'explain') return text.trim().length >= 3;
    if (check.kind === 'sort') return check.items.every((i) => sorted[i.id]);
    return true;
  }, [check, choice, text, sorted]);

  const answered = Boolean(result);
  const correct = result?.evaluation.correct;

  async function submit() {
    if (!ready || busy || answered) return;
    setBusy(true);
    const answer: Answer = check.kind === 'choice' ? choice : check.kind === 'explain' ? text.trim() : check.kind === 'slider' ? slider : sorted;
    try {
      await onSubmit(answer);
    } finally {
      setBusy(false);
    }
  }

  const label = VARIANT_LABEL[variant];

  return (
    <section className="card animate-fade-up overflow-hidden" aria-labelledby={`check-${check.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3 sm:px-6">
        <span className={cx('chip', label.className)}>
          {variant === 'transfer' ? <Sparkles size={12} aria-hidden="true" /> : null}
          {label.text}
        </span>
        <span className="text-xs font-medium text-ink-muted">
          Question {position.index} of {position.total}
          <span className="sr-only"> (more questions may be added if a different example would help)</span>
        </span>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
        <div>
          <p className="eyebrow mb-1.5">{check.concept}</p>
          <h3 id={`check-${check.id}`} ref={headingRef} tabIndex={-1} className="text-lg font-semibold leading-snug text-ink outline-none sm:text-xl">
            {check.prompt}
          </h3>
          {check.help && <p className="mt-1.5 text-sm text-ink-muted">{check.help}</p>}
        </div>

        {check.kind === 'choice' && (
          <div role="radiogroup" aria-label={check.prompt} className="grid gap-2.5">
            {check.options.map((option) => {
              const selected = choice === option.id;
              const isRight = answered && option.id === check.correctOptionId;
              const isWrongPick = answered && selected && !isRight;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={answered}
                  onClick={() => setChoice(option.id)}
                  className={cx(
                    'group flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-snug transition',
                    !answered && (selected ? 'border-brand-500 bg-brand-50 shadow-glow' : 'border-line-strong hover:border-ink-faint hover:bg-canvas'),
                    isRight && 'border-brand-500 bg-brand-50',
                    isWrongPick && 'border-loss/50 bg-loss-50',
                    answered && !isRight && !isWrongPick && 'border-line opacity-60'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition',
                      selected || isRight ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong bg-white',
                      isWrongPick && 'border-loss bg-loss'
                    )}
                  >
                    {isRight ? <CheckIcon size={12} strokeWidth={3} /> : isWrongPick ? <X size={12} strokeWidth={3} className="text-white" /> : selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                  </span>
                  <span className="text-ink">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {check.kind === 'explain' && (
          <div>
            <label htmlFor={`explain-${check.id}`} className="sr-only">Your answer</label>
            <textarea
              id={`explain-${check.id}`}
              className="input min-h-[120px] resize-y leading-relaxed"
              placeholder="Explain it in your own words — there's no single right phrasing."
              value={text}
              maxLength={600}
              disabled={answered}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
              }}
            />
            <p className="mt-1.5 text-xs text-ink-muted">Please don’t include personal or account details. {text.length}/600</p>
          </div>
        )}

        {check.kind === 'slider' && (
          <div className="rounded-xl bg-canvas p-4">
            <div className="mb-3 flex items-baseline justify-between">
              <label htmlFor={`slider-${check.id}`} className="text-sm font-medium text-ink-soft">Your value</label>
              <span className="text-2xl font-semibold tabular-nums text-ink">
                {slider} <span className="text-sm font-medium text-ink-muted">{check.unit}</span>
              </span>
            </div>
            <input
              id={`slider-${check.id}`}
              type="range"
              className="range"
              min={check.min}
              max={check.max}
              step={check.step}
              value={slider}
              disabled={answered}
              onChange={(e) => setSlider(Number(e.target.value))}
            />
            <div className="mt-1 flex justify-between text-xs tabular-nums text-ink-muted">
              <span>{check.min}</span>
              <span>{check.max}</span>
            </div>
          </div>
        )}

        {check.kind === 'sort' && (
          <div className="space-y-2.5">
            {check.items.map((item) => {
              const placed = sorted[item.id];
              const wrong = answered && placed !== item.bucketId;
              return (
                <div
                  key={item.id}
                  className={cx(
                    'flex flex-col gap-2.5 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                    answered ? (wrong ? 'border-loss/40 bg-loss-50' : 'border-brand-200 bg-brand-50') : 'border-line'
                  )}
                >
                  <span className="text-[15px] text-ink">{item.label}</span>
                  <div role="radiogroup" aria-label={`Category for: ${item.label}`} className="flex flex-wrap gap-1.5">
                    {check.buckets.map((bucket) => {
                      const active = placed === bucket.id;
                      return (
                        <button
                          key={bucket.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          disabled={answered}
                          onClick={() => setSorted((s) => ({ ...s, [item.id]: bucket.id }))}
                          className={cx(
                            'min-h-[34px] rounded-lg border px-3 text-sm font-medium transition',
                            active ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong bg-white text-ink-soft hover:border-ink-faint'
                          )}
                        >
                          {bucket.label}
                        </button>
                      );
                    })}
                  </div>
                  {wrong && (
                    <span className="text-xs font-medium text-loss-700">
                      Belongs under “{check.buckets.find((b) => b.id === item.bucketId)?.label}”
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!answered && (
          <div className="flex justify-end">
            <button type="button" className="btn-primary w-full sm:w-auto" disabled={!ready || busy} onClick={submit}>
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
              {busy ? 'Checking…' : 'Check my answer'}
            </button>
          </div>
        )}

        <div ref={feedbackRef} aria-live="polite">
          {result && (
            <div className="animate-fade-up space-y-3">
              <div
                className={cx(
                  'flex gap-3 rounded-xl px-4 py-3.5',
                  correct ? 'bg-brand-50 text-brand-900' : 'bg-warn-50 text-ink'
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full', correct ? 'bg-brand-600 text-white' : 'bg-warn text-white')}
                >
                  {correct ? <CheckIcon size={14} strokeWidth={3} /> : <Lightbulb size={14} />}
                </span>
                <div className="min-w-0 text-[15px] leading-relaxed">
                  <p className="font-semibold">{correct ? 'You’ve got it.' : 'Not quite — and that’s useful to know.'}</p>
                  <p className="mt-0.5 text-ink-soft">{result.evaluation.feedback}</p>
                  {check.kind === 'explain' && (
                    <p className="mt-2 text-sm text-ink-muted">
                      <span className="font-medium text-ink-soft">One way to put it:</span> {check.modelAnswer}
                    </p>
                  )}
                </div>
              </div>

              {result.decision.type === 'alternative' && (
                <Callout tone="accent" title="Another way to think about it" icon={<RotateCcw size={16} />}>
                  {result.decision.explanation}
                  <p className="mt-1.5 text-xs font-medium">Next: a fresh example to try the idea again.</p>
                </Callout>
              )}
              {result.decision.type === 'remedy' && (
                <Callout tone="accent" title="Your plan just adapted" icon={<Sparkles size={16} />}>
                  {result.decision.message}
                </Callout>
              )}
              {result.decision.type === 'needs-review' && <Callout tone="neutral">{result.decision.message}</Callout>}

              <div className="flex justify-end">
                <button type="button" className="btn-primary w-full sm:w-auto" onClick={onContinue} autoFocus>
                  Continue <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
