'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Map as MapIcon, Pause, Play, RotateCcw, UserRound, X } from 'lucide-react';
import { Logo } from '../site/Logo';
import DiscoveryChat from './DiscoveryChat';
import QuickStart from './QuickStart';
import ExperienceView from './ExperienceView';
import PlanView, { PlanList } from './PlanView';
import SummaryView from './SummaryView';
import { AdaptationLog, ProfilePanel } from './ProfilePanel';
import { addToPlan, buildPlan, continueJourney, goToSummary, journeyStats, skipExperience, startExperience } from '../../lib/journey/engine';
import { discover } from '../../lib/journey/client';
import { applyDiscovery } from '../../lib/journey/discovery';
import { GOALS, LEVELS, TOPICS, picksSentence, quickStartAnalysis, type QuickPicks } from '../../lib/journey/quickstart';
import { newId } from '../../lib/journey/storage';
import { clearState, createInitialState, loadState, saveState } from '../../lib/journey/storage';
import type { ExperienceId, JourneyState } from '../../lib/journey/types';
import { cx } from '../ui';
import { INTENT_LABELS } from './labels';

export default function JourneyApp() {
  const [state, setState] = useState<JourneyState | null>(null);
  const stateRef = useRef<JourneyState | null>(null);
  const [busy, setBusy] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [draftPicks, setDraftPicks] = useState<Partial<QuickPicks>>({});

  useEffect(() => {
    const saved = loadState();
    const initial = saved ?? createInitialState();
    stateRef.current = initial;
    setState(initial);
    if (saved && saved.messages.some((m) => m.role === 'user')) setResumed(true);
  }, []);

  useEffect(() => {
    if (!resumed) return;
    const t = window.setTimeout(() => setResumed(false), 7000);
    return () => window.clearTimeout(t);
  }, [resumed]);

  /** Synchronous updater: applies fn to the latest state immediately and persists it. */
  const update = useCallback((fn: (s: JourneyState) => JourneyState) => {
    if (!stateRef.current) return;
    const next = fn(stateRef.current);
    stateRef.current = next;
    setState(next);
    saveState(next);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /** Tap-only start: turn the picks into a discovery result and go straight to the plan. */
  const completeQuickStart = useCallback(
    (picks: QuickPicks) => {
      const analysis = quickStartAnalysis(picks);
      const at = new Date().toISOString();
      update((s) => {
        const withUser: JourneyState = { ...s, messages: [...s.messages, { id: newId(), role: 'user', text: picksSentence(picks), at }] };
        const next = applyDiscovery(withUser, analysis);
        return buildPlan({
          ...next,
          messages: [...next.messages, { id: newId(), role: 'guide', text: analysis.reply, source: 'static', at }],
          log: [...next.log, { at, kind: 'profile' as const, text: 'Started with the quick picks.' }].slice(-40)
        });
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [update]
  );

  async function send(text: string) {
    if (!stateRef.current) return;
    setBusy(true);
    // Show the user's message immediately.
    const pending = stateRef.current;
    setState({ ...pending, messages: [...pending.messages, { id: 'pending', role: 'user', text, at: new Date().toISOString() }] });
    const next = await discover(pending, text);
    update(() => next);
    setBusy(false);
  }

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas" aria-busy="true">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" aria-label="Loading" />
      </div>
    );
  }

  const stats = journeyStats(state);
  const userTurns = state.messages.filter((m) => m.role === 'user').length;
  const showQuick = state.phase === 'discovery' && userTurns === 0 && !chatMode && !busy;
  const open = (id: ExperienceId) => {
    update((s) => startExperience(s, id));
    setSheet(false);
    scrollTop();
  };

  const sidebar = (
    <div className="space-y-5">
      {state.phase === 'discovery' && <UnderstoodCard state={state} picks={showQuick ? draftPicks : undefined} />}
      {state.plan.length > 0 && state.phase === 'experience' && (
        <section aria-labelledby="plan-side-title" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="plan-side-title" className="text-sm font-semibold text-ink">Your plan</h2>
            <span className="text-xs font-medium tabular-nums text-ink-muted">{stats.finished}/{stats.total}</span>
          </div>
          <PlanList state={state} onOpen={open} compact />
          {stats.finished > 0 && (
            <button type="button" className="btn-ghost btn-sm w-full" onClick={() => { update(goToSummary); setSheet(false); scrollTop(); }}>
              Finish and see my summary
            </button>
          )}
        </section>
      )}
      <div className={cx((state.phase === 'experience' || state.phase === 'discovery') && 'border-t border-line pt-5')}>
        <ProfilePanel state={state} />
      </div>
      <AdaptationLog state={state} />
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      {/* App bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Growerr home" className="shrink-0">
            <Logo />
          </Link>
          {state.plan.length > 0 && (
            <div className="hidden flex-1 items-center gap-3 sm:flex sm:max-w-sm" aria-label={`Journey ${stats.percent}% complete`}>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand-500 transition-all duration-700" style={{ width: `${stats.percent}%` }} />
              </div>
              <span className="whitespace-nowrap text-xs font-semibold tabular-nums text-ink-muted">{stats.finished} of {stats.total} done</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            {state.phase === 'experience' && (
              <button type="button" className="btn-ghost btn-sm" onClick={() => update((s) => ({ ...s, paused: !s.paused }))}>
                {state.paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
                <span className="hidden sm:inline">{state.paused ? 'Resume' : 'Pause'}</span>
              </button>
            )}
            <button type="button" className="btn-ghost btn-sm lg:hidden" onClick={() => setSheet(true)} aria-label="Open your profile and plan">
              {state.plan.length > 0 ? <MapIcon size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}
              <span className="text-[13px]">{state.phase === 'experience' ? 'Plan' : 'Profile'}</span>
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setConfirmReset(true)} aria-label="Start over">
              <RotateCcw size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Start over</span>
            </button>
          </div>
        </div>
        {state.plan.length > 0 && (
          <div className="h-1 bg-line sm:hidden" aria-hidden="true">
            <div className="h-full bg-brand-500 transition-all duration-700" style={{ width: `${stats.percent}%` }} />
          </div>
        )}
      </header>

      <main id="main" className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          {resumed && (
            <div className="flex animate-fade-up items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900" role="status">
              <span><span className="font-semibold">Welcome back.</span> Your journey was saved in this browser — you’re right where you left off.</span>
              <button type="button" className="shrink-0 rounded-md p-1 text-brand-800 hover:bg-brand-100" onClick={() => setResumed(false)} aria-label="Dismiss">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {state.paused ? (
            <section className="card grid place-items-center px-6 py-16 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-canvas text-ink-soft" aria-hidden="true"><Pause size={20} /></span>
              <h1 className="mt-4 text-xl font-bold text-ink">Journey paused</h1>
              <p className="mt-1 max-w-sm text-[15px] text-ink-muted">Your progress is saved in this browser. Come back any time — even after closing the tab.</p>
              <button type="button" className="btn-primary mt-5" onClick={() => update((s) => ({ ...s, paused: false }))}>
                <Play size={16} aria-hidden="true" /> Resume
              </button>
            </section>
          ) : state.phase === 'discovery' ? (
            <>
              <div className="animate-fade-up px-1">
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">Let’s start with you</h1>
                <p className="mt-1 text-[15px] text-ink-muted">
                  {showQuick ? 'Three quick taps and we’ll build a learning plan that fits you.' : 'A short conversation so your journey fits what you actually want to understand.'}
                </p>
              </div>
              {showQuick ? (
                <QuickStart onComplete={completeQuickStart} onChat={() => setChatMode(true)} onPicksChange={setDraftPicks} />
              ) : (
                <div className="animate-fade-up">
                  {userTurns === 0 && (
                    <button type="button" className="btn-ghost btn-sm mb-2 -ml-2" onClick={() => setChatMode(false)}>
                      <ArrowLeft size={15} aria-hidden="true" /> Back to quick picks
                    </button>
                  )}
                  <DiscoveryChat state={state} busy={busy} onSend={send} onBuildPlan={() => { update(buildPlan); scrollTop(); }} />
                </div>
              )}
            </>
          ) : state.phase === 'plan' ? (
            <PlanView
              state={state}
              onStart={() => { update(continueJourney); scrollTop(); }}
              onAdd={(id) => update((s) => addToPlan(s, id))}
              onOpen={open}
              onBackToChat={() => update((s) => ({ ...s, phase: 'discovery', readyToPlan: false }))}
            />
          ) : state.phase === 'experience' ? (
            <ExperienceView
              key={`${state.currentId}-${state.currentId ? state.progress[state.currentId]?.runs : 0}`}
              state={state}
              update={update}
              onContinueJourney={() => { update(continueJourney); scrollTop(); }}
              onSkip={() => { update(skipExperience); scrollTop(); }}
              onRevisit={(id) => id && open(id)}
            />
          ) : (
            <SummaryView state={state} onRevisit={open} onRestart={() => setConfirmReset(true)} />
          )}
        </div>

        <aside className="hidden lg:block" aria-label="Your profile and plan">
          <div className="card sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto p-5">{sidebar}</div>
        </aside>
      </main>

      {/* Mobile sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Your profile and plan">
          <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setSheet(false)} aria-label="Close" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-fade-up overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-lift">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line-strong" aria-hidden="true" />
            <div className="mb-3 flex justify-end">
              <button type="button" className="btn-ghost btn-sm" onClick={() => setSheet(false)}>
                <X size={16} aria-hidden="true" /> Close
              </button>
            </div>
            {sidebar}
          </div>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4" role="alertdialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-desc">
          <div className="w-full max-w-md animate-fade-up rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl">
            <h2 id="reset-title" className="text-lg font-bold text-ink">Start a new journey?</h2>
            <p id="reset-desc" className="mt-1.5 text-[15px] text-ink-soft">This clears your conversation, profile and progress from this browser. It can’t be undone.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setConfirmReset(false)} autoFocus>Cancel</button>
              <button
                type="button"
                className="btn bg-loss text-white hover:bg-loss-700"
                onClick={() => {
                  clearState();
                  const fresh = createInitialState();
                  stateRef.current = fresh;
                  setState(fresh);
                  setConfirmReset(false);
                  setResumed(false);
                  setChatMode(false);
                  scrollTop();
                }}
              >
                Clear and start over
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnderstoodCard({ state, picks }: { state: JourneyState; picks?: Partial<QuickPicks> }) {
  const fromPicks = picks
    ? [
        { label: 'Goal', value: GOALS.find((g) => g.id === picks.goal)?.title ?? '' },
        { label: 'Experience', value: LEVELS.find((l) => l.id === picks.level)?.title ?? '' },
        { label: 'Want to understand', value: TOPICS.filter((t) => picks.topics?.includes(t.id)).map((t) => t.label).join(', ') }
      ]
    : null;
  const rows = fromPicks ?? [
    { label: 'Goal', value: state.objective },
    { label: 'Leaning towards', value: state.intent !== 'unclear' ? INTENT_LABELS[state.intent] : '' },
    { label: 'Experience', value: state.experience === 'none' ? 'First time' : state.experience === 'some' ? 'Some experience' : state.experience === 'experienced' ? 'Experienced' : '' },
    { label: 'On your mind', value: state.concerns[0] ?? '' }
  ];
  const known = rows.filter((r) => r.value);
  return (
    <section aria-labelledby="understood-title" className="space-y-3">
      <div>
        <h2 id="understood-title" className="text-sm font-semibold text-ink">What I’ve understood</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
          {known.length === 0 ? 'This fills in as we talk, so you can see exactly what your plan is based on.' : 'Your plan will be built from this. Correct me any time in the chat.'}
        </p>
      </div>
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{r.label}</dt>
            <dd key={r.value || 'empty'} className={cx('mt-0.5 text-[13px] leading-snug', r.value ? 'animate-fade-up text-ink' : 'text-ink-faint')}>{r.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
