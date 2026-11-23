'use client';

import { useState } from 'react';
import { ArrowRight, Check, Clock, FlaskConical, ListChecks, RotateCcw, SkipForward, Target, TrendingUp } from 'lucide-react';
import { LABS } from '../labs';
import CheckCard, { type CheckResult } from './CheckCard';
import { applyEvaluation, advanceCheck, currentCheck, experienceResult, markLabExplored, nextPlanItem, setStage } from '../../lib/journey/engine';
import { EXPERIENCES, allChecks, getExperience } from '../../lib/journey/experiences';
import { evaluate } from '../../lib/journey/client';
import type { Answer } from '../../lib/journey/evaluation';
import type { JourneyState } from '../../lib/journey/types';
import { cx } from '../ui';

type Props = {
  state: JourneyState;
  update: (fn: (s: JourneyState) => JourneyState) => void;
  onContinueJourney: () => void;
  onSkip: () => void;
  onRevisit: (id: JourneyState['currentId']) => void;
};

const STAGES = [
  { id: 'intro', label: 'Context' },
  { id: 'lab', label: 'Explore' },
  { id: 'checks', label: 'Check' },
  { id: 'done', label: 'Result' }
] as const;

export default function ExperienceView({ state, update, onContinueJourney, onSkip, onRevisit }: Props) {
  const exp = getExperience(state.currentId);
  const progress = exp ? state.progress[exp.id] : undefined;
  const [result, setResult] = useState<CheckResult | null>(null);
  if (!exp || !progress) return null;

  const Lab = LABS[exp.lab];
  const stageIndex = STAGES.findIndex((s) => s.id === progress.stage);
  const planItem = state.plan.find((p) => p.id === exp.id);
  const current = currentCheck(state);

  async function submit(answer: Answer) {
    if (!exp || !current) return;
    const evaluation = await evaluate(exp.id, current.check, answer);
    let decision: CheckResult['decision'] = { type: 'continue', message: '' };
    update((s) => {
      const out = applyEvaluation(s, evaluation);
      decision = out.decision;
      return out.state;
    });
    // `update` runs synchronously on the latest state; decision is set by now.
    setResult({ evaluation, decision });
  }

  function next() {
    setResult(null);
    update((s) => advanceCheck(s));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const nextId = nextPlanItem(state);
  const nextItem = nextId ? state.plan.find((p) => p.id === nextId) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 via-white to-white px-5 pb-5 pt-5 sm:px-7 sm:pt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-white text-brand-800 ring-1 ring-brand-100">{exp.id.replace('EXP-', 'Experience ')}</span>
            <span className="chip bg-white text-ink-muted ring-1 ring-line">
              <Clock size={12} aria-hidden="true" /> ~{exp.minutes} min
            </span>
            {planItem?.addedBy === 'adaptation' && <span className="chip bg-accent-50 text-accent-700">Added by adaptation</span>}
            {progress.runs > 1 && <span className="chip bg-canvas text-ink-soft">Attempt {progress.runs}</span>}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">{exp.title}</h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{exp.objective}</p>
          {planItem && (
            <p className="mt-3 text-sm text-ink-muted">
              <span className="font-medium text-ink-soft">Why this is in your plan:</span> {planItem.reason}
            </p>
          )}
        </div>
        <ol className="grid grid-cols-4 border-t border-line text-center text-xs font-medium sm:text-sm" aria-label="Experience progress">
          {STAGES.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === stageIndex ? 'step' : undefined}
              className={cx(
                'relative px-1 py-2.5',
                i < stageIndex && 'text-brand-700',
                i === stageIndex && 'text-ink',
                i > stageIndex && 'text-ink-faint'
              )}
            >
              <span className="inline-flex items-center gap-1">
                {i < stageIndex ? <Check size={13} aria-hidden="true" /> : null}
                {s.label}
              </span>
              <span className={cx('absolute inset-x-0 bottom-0 h-0.5', i <= stageIndex ? 'bg-brand-500' : 'bg-transparent')} />
            </li>
          ))}
        </ol>
      </header>

      {/* Intro */}
      {progress.stage === 'intro' && (
        <section className="card animate-fade-up space-y-5 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-3">
            <Info icon={<FlaskConical size={16} />} title="Starting context">{exp.context}</Info>
            <Info icon={<Target size={16} />} title="What you’ll do">{exp.labPrompt}</Info>
            <Info icon={<TrendingUp size={16} />} title="By the end">{exp.outcome}</Info>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button type="button" className="btn-ghost" onClick={onSkip}>
              <SkipForward size={16} aria-hidden="true" /> Skip this one
            </button>
            <button type="button" className="btn-primary" onClick={() => update((s) => setStage(s, 'lab'))}>
              Start the simulation <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* Lab */}
      {progress.stage === 'lab' && (
        <section className="animate-fade-up space-y-4" aria-label="Interactive simulation">
          <div className="rounded-2xl bg-ink px-5 py-4 text-white sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Try it</p>
            <p className="mt-1 text-[15px] leading-relaxed">{exp.labPrompt}</p>
          </div>
          <Lab explored={progress.labExplored} onExplored={() => update((s) => markLabExplored(s))} />
          <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-muted" aria-live="polite">
              {progress.labExplored ? 'Nice — you’ve explored enough to check your understanding.' : 'Interact with the simulation to unlock the questions.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              disabled={!progress.labExplored}
              onClick={() => update((s) => setStage(s, 'checks'))}
            >
              <ListChecks size={16} aria-hidden="true" /> Check my understanding
            </button>
          </div>
        </section>
      )}

      {/* Checks */}
      {progress.stage === 'checks' && current && (
        <CheckCard
          key={`${current.check.id}-${progress.runs}`}
          check={current.check}
          variant={current.variant}
          position={{ index: progress.index + 1, total: Math.max(progress.queue.length + (progress.queue.some((q) => q.variant === 'transfer') ? 0 : 1), progress.index + 1) }}
          onSubmit={submit}
          onContinue={next}
          result={result}
        />
      )}

      {/* Done */}
      {progress.stage === 'done' && (
        <Result
          state={state}
          onContinueJourney={onContinueJourney}
          onRevisit={() => onRevisit(exp.id)}
          nextTitle={nextItem ? EXPERIENCES[nextItem.id].title : null}
          nextReason={nextItem?.reason ?? null}
        />
      )}

      {progress.stage !== 'intro' && progress.stage !== 'done' && (
        <div className="flex justify-center">
          <button type="button" className="btn-ghost btn-sm" onClick={onSkip}>
            <SkipForward size={14} aria-hidden="true" /> Skip this experience
          </button>
        </div>
      )}
    </div>
  );
}

function Info({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-canvas p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-brand-700" aria-hidden="true">{icon}</span>
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  );
}

function Result({
  state,
  onContinueJourney,
  onRevisit,
  nextTitle,
  nextReason
}: {
  state: JourneyState;
  onContinueJourney: () => void;
  onRevisit: () => void;
  nextTitle: string | null;
  nextReason: string | null;
}) {
  const exp = getExperience(state.currentId);
  const progress = exp ? state.progress[exp.id] : undefined;
  if (!exp || !progress) return null;
  const result = experienceResult(exp, progress.outcomes);
  const checks = allChecks(exp);
  const concepts = [...new Map(progress.outcomes.map((o) => [checks.find((c) => c.id === o.checkId)?.concept ?? o.checkId, o])).entries()];
  const shown = new Set(progress.outcomes.filter((o) => o.correct).map((o) => checks.find((c) => c.id === o.checkId)?.concept));
  const demonstrated = result === 'demonstrated';

  return (
    <section className="card animate-fade-up overflow-hidden" aria-labelledby="result-title">
      <div className={cx('px-5 py-6 sm:px-7', demonstrated ? 'bg-brand-50' : 'bg-warn-50')}>
        <span
          aria-hidden="true"
          className={cx('grid h-11 w-11 place-items-center rounded-full text-white', demonstrated ? 'bg-brand-600' : 'bg-warn')}
        >
          {demonstrated ? <Check size={22} strokeWidth={3} /> : <RotateCcw size={20} />}
        </span>
        <h2 id="result-title" className="mt-3 text-xl font-bold text-ink">
          {demonstrated ? 'Understanding demonstrated' : 'Worth another look'}
        </h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          {demonstrated
            ? `You showed you understand this — including applying it to a new example. ${exp.outcome}`
            : 'Some ideas didn’t land yet. That’s normal — it’s marked to revisit, and your plan has adapted around it.'}
        </p>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-7">
        <ul className="space-y-2">
          {concepts.map(([concept]) => (
            <li key={concept} className="flex items-center gap-2.5 text-[15px]">
              <span
                aria-hidden="true"
                className={cx('grid h-5 w-5 place-items-center rounded-full', shown.has(concept) ? 'bg-brand-100 text-brand-800' : 'bg-warn-50 text-warn-700')}
              >
                {shown.has(concept) ? <Check size={12} strokeWidth={3} /> : <RotateCcw size={11} />}
              </span>
              <span className="text-ink">{concept}</span>
              <span className="sr-only">{shown.has(concept) ? 'demonstrated' : 'to revisit'}</span>
            </li>
          ))}
        </ul>
        {nextTitle && (
          <div className="rounded-xl border border-line p-4">
            <p className="eyebrow">Up next</p>
            <p className="mt-1 font-semibold text-ink">{nextTitle}</p>
            {nextReason && <p className="mt-0.5 text-sm text-ink-muted">{nextReason}</p>}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" className="btn-secondary" onClick={onRevisit}>
            <RotateCcw size={16} aria-hidden="true" /> Try this again
          </button>
          <button type="button" className="btn-primary" onClick={onContinueJourney}>
            {nextTitle ? 'Continue journey' : 'See my learning summary'} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
