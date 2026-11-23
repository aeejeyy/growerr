'use client';

import { useState } from 'react';
import { ArrowRight, Check, Clock, Info, Lock, MousePointerClick, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
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
  { id: 'lab', label: 'Explore', short: 'Explore' },
  { id: 'checks', label: 'Check understanding', short: 'Check' },
  { id: 'done', label: 'Result', short: 'Result' }
] as const;

export default function ExperienceView({ state, update, onContinueJourney, onSkip, onRevisit }: Props) {
  const exp = getExperience(state.currentId);
  const progress = exp ? state.progress[exp.id] : undefined;
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showContext, setShowContext] = useState(false);
  if (!exp || !progress) return null;

  const Lab = LABS[exp.lab];
  // The starting context now lives inside the Explore stage (one less click).
  const stage = progress.stage === 'intro' ? 'lab' : progress.stage;
  const stageIndex = STAGES.findIndex((s) => s.id === stage);
  const planIndex = state.plan.findIndex((p) => p.id === exp.id);
  const planItem = state.plan[planIndex];
  const current = currentCheck(state);

  // Stable step counter: one step per core concept (a fresh example shares its concept's step) + the final "apply it" step.
  const totalSteps = exp.checks.length + 1;
  let step = totalSteps;
  if (current && current.variant !== 'transfer') {
    const coreIndex = exp.checks.findIndex((c) => c.id === current.check.id || exp.alternatives[c.id]?.check.id === current.check.id);
    step = coreIndex + 1;
  }

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const nextId = nextPlanItem(state);
  const nextItem = nextId ? state.plan.find((p) => p.id === nextId) : null;

  return (
    <div className="space-y-4">
      <header className="card overflow-hidden">
        <div className="px-5 pb-4 pt-5 sm:px-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-ink-muted">
            {planIndex >= 0 && (
              <span className="chip bg-brand-50 text-brand-800">
                Step {planIndex + 1} of {state.plan.length}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden="true" /> About {exp.minutes} min
            </span>
            {planItem?.addedBy === 'adaptation' && (
              <span className="chip bg-accent-50 text-accent-700">
                <Sparkles size={11} aria-hidden="true" /> Added for you
              </span>
            )}
            {progress.runs > 1 && <span className="chip bg-canvas text-ink-soft">Attempt {progress.runs}</span>}
          </div>
          <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-ink sm:text-[26px]">{exp.title}</h1>
          <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{exp.objective}</p>
          {stage === 'lab' && (
            <div className="mt-3">
              <button
                type="button"
                className="inline-flex min-h-[32px] items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
                aria-expanded={showContext}
                onClick={() => setShowContext((v) => !v)}
              >
                <Info size={14} aria-hidden="true" /> {showContext ? 'Hide details' : 'Why this step, and what you’ll get from it'}
              </button>
              {showContext && (
                <dl className="mt-2 grid animate-fade-up gap-3 text-sm sm:grid-cols-3">
                  {planItem && <Detail title="Why it’s in your plan">{planItem.reason}</Detail>}
                  <Detail title="Starting point">{exp.context}</Detail>
                  <Detail title="By the end">{exp.outcome}</Detail>
                </dl>
              )}
            </div>
          )}
        </div>
        <ol className="grid grid-cols-3 border-t border-line text-center text-xs font-medium sm:text-[13px]" aria-label="Progress in this experience">
          {STAGES.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === stageIndex ? 'step' : undefined}
              className={cx('relative px-1 py-2.5', i < stageIndex && 'text-brand-700', i === stageIndex && 'text-ink', i > stageIndex && 'text-ink-faint')}
            >
              <span className="inline-flex items-center gap-1">
                {i < stageIndex ? <Check size={13} aria-hidden="true" /> : null}
                <span className="sm:hidden">{s.short}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </span>
              <span className={cx('absolute inset-x-0 bottom-0 h-0.5', i <= stageIndex ? 'bg-brand-500' : 'bg-transparent')} />
            </li>
          ))}
        </ol>
      </header>

      {stage === 'lab' && (
        <section className="space-y-4" aria-label="Interactive simulation">
          <div className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-3.5 sm:px-5">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500 text-white" aria-hidden="true">
              <MousePointerClick size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Try it yourself</p>
              <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink-soft">{exp.labPrompt}</p>
            </div>
          </div>
          <Lab explored={progress.labExplored} onExplored={() => update((s) => markLabExplored(s))} />
          <ActionBar>
            <p className="flex items-center gap-2 text-sm text-ink-soft" aria-live="polite">
              <span
                aria-hidden="true"
                className={cx(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors',
                  progress.labExplored ? 'bg-brand-600 text-white' : 'bg-line text-ink-muted'
                )}
              >
                {progress.labExplored ? <Check size={12} strokeWidth={3} /> : <Lock size={10} />}
              </span>
              {progress.labExplored ? 'Nicely explored — ready for a few quick questions' : 'Try the simulation to unlock the questions'}
            </p>
            <div className="flex items-center justify-end gap-1.5">
              <button type="button" className="btn-ghost btn-sm" onClick={onSkip}>
                Skip
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={!progress.labExplored}
                onClick={() => {
                  update((s) => setStage(s, 'checks'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Check my understanding <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </ActionBar>
        </section>
      )}

      {stage === 'checks' && current && (
        <>
          <CheckCard
            key={`${current.check.id}-${progress.runs}`}
            check={current.check}
            variant={current.variant}
            position={{ index: step, total: totalSteps }}
            onSubmit={submit}
            onContinue={next}
            result={result}
          />
          <div className="flex justify-center">
            <button type="button" className="btn-ghost btn-sm" onClick={onSkip}>
              <SkipForward size={14} aria-hidden="true" /> Skip this experience
            </button>
          </div>
        </>
      )}

      {stage === 'done' && (
        <Result
          state={state}
          onContinueJourney={onContinueJourney}
          onRevisit={() => onRevisit(exp.id)}
          nextTitle={nextItem ? EXPERIENCES[nextItem.id].title : null}
          nextReason={nextItem?.reason ?? null}
        />
      )}
    </div>
  );
}

function ActionBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-3 z-20">
      <div className="flex flex-col gap-2.5 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {children}
      </div>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-canvas p-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{title}</dt>
      <dd className="mt-1 leading-relaxed text-ink-soft">{children}</dd>
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
  const conceptOf = (id: string) => checks.find((c) => c.id === id)?.concept ?? id;
  const concepts = [...new Set(progress.outcomes.map((o) => conceptOf(o.checkId)))];
  const shown = new Set(progress.outcomes.filter((o) => o.correct).map((o) => conceptOf(o.checkId)));
  const demonstrated = result === 'demonstrated';
  const recovered = progress.outcomes.some((o) => !o.correct) && demonstrated;

  return (
    <section className="card animate-fade-up overflow-hidden" aria-labelledby="result-title">
      <div className={cx('px-5 py-6 sm:px-7', demonstrated ? 'bg-gradient-to-br from-brand-50 to-white' : 'bg-gradient-to-br from-warn-50 to-white')}>
        <span aria-hidden="true" className={cx('grid h-11 w-11 place-items-center rounded-full text-white', demonstrated ? 'bg-brand-600' : 'bg-warn')}>
          {demonstrated ? <Check size={22} strokeWidth={3} /> : <RotateCcw size={20} />}
        </span>
        <h2 id="result-title" className="mt-3 text-xl font-bold text-ink">
          {demonstrated ? 'Understanding demonstrated' : 'Worth another look'}
        </h2>
        <p className="mt-1 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
          {demonstrated
            ? recovered
              ? 'You worked through a tricky idea and got there — including applying it to a brand-new example.'
              : 'You showed you understand this — including applying it to a brand-new example.'
            : 'Some ideas didn’t land yet, which is completely normal. It’s marked to revisit and your plan has adapted around it.'}
        </p>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-7">
        <div>
          <p className="eyebrow mb-2">What you worked on</p>
          <ul className="space-y-2">
            {concepts.map((concept) => (
              <li key={concept} className="flex items-center gap-2.5 text-[15px]">
                <span
                  aria-hidden="true"
                  className={cx('grid h-5 w-5 shrink-0 place-items-center rounded-full', shown.has(concept) ? 'bg-brand-100 text-brand-800' : 'bg-warn-50 text-warn-700')}
                >
                  {shown.has(concept) ? <Check size={12} strokeWidth={3} /> : <RotateCcw size={11} />}
                </span>
                <span className="text-ink">{concept}</span>
                <span className="sr-only">{shown.has(concept) ? 'demonstrated' : 'to revisit'}</span>
              </li>
            ))}
          </ul>
        </div>
        {nextTitle && (
          <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-4">
            <ArrowRight size={16} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Up next</p>
              <p className="mt-0.5 font-semibold text-ink">{nextTitle}</p>
              {nextReason && <p className="mt-0.5 text-sm text-ink-muted">{nextReason}</p>}
            </div>
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button type="button" className={demonstrated ? 'btn-ghost' : 'btn-secondary'} onClick={onRevisit}>
            <RotateCcw size={16} aria-hidden="true" /> {demonstrated ? 'Practise again' : 'Try again now'}
          </button>
          <button type="button" className="btn-primary whitespace-normal text-center" onClick={onContinueJourney}>
            {nextTitle ? `Continue to “${nextTitle}”` : 'See my learning summary'} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
