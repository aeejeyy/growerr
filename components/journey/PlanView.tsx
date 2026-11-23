'use client';

import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock, Layers, MessageCircle, Plus, RotateCcw, Route, SkipForward, Sparkles } from 'lucide-react';
import { EXPERIENCES, EXPERIENCE_IDS } from '../../lib/journey/experiences';
import type { ExperienceId, JourneyState, PlanItem } from '../../lib/journey/types';
import { cx } from '../ui';
import ExperienceArt from '../art/ExperienceArt';

const STATUS: Record<PlanItem['status'], { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Up next', className: 'bg-brand-50 text-brand-800', icon: null },
  active: { label: 'In progress', className: 'bg-accent-50 text-accent-700', icon: null },
  demonstrated: { label: 'Demonstrated', className: 'bg-brand-50 text-brand-800', icon: <Check size={11} strokeWidth={3} /> },
  'needs-review': { label: 'Revisit', className: 'bg-warn-50 text-warn-700', icon: <RotateCcw size={11} /> },
  skipped: { label: 'Skipped', className: 'bg-canvas text-ink-muted', icon: <SkipForward size={11} /> }
};

export function PlanList({
  state,
  onOpen,
  compact = false
}: {
  state: JourneyState;
  onOpen?: (id: ExperienceId) => void;
  compact?: boolean;
}) {
  const firstPending = state.plan.some((p) => p.status === 'active') ? null : state.plan.find((p) => p.status === 'pending')?.id;
  return (
    <ol className="space-y-2">
      {state.plan.map((item, i) => {
        const exp = EXPERIENCES[item.id];
        const status = STATUS[item.status];
        const current = state.currentId === item.id;
        // Only label pending items that matter: the next one to start.
        const label = item.status === 'pending' ? (item.id === firstPending ? 'Start here' : '') : current && item.status === 'active' ? 'Now' : status.label;
        return (
          <li key={item.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
            <button
              type="button"
              onClick={() => onOpen?.(item.id)}
              disabled={!onOpen}
              className={cx(
                'group flex w-full items-start gap-3 rounded-xl border text-left transition duration-200',
                compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
                current ? 'border-brand-500 bg-brand-50/60' : 'border-line bg-white hover:border-line-strong',
                !compact && onOpen && 'hover:-translate-y-0.5 hover:shadow-lift',
                !onOpen && 'cursor-default'
              )}
            >
              {!compact && (
                <span className="relative hidden w-24 shrink-0 overflow-hidden rounded-lg sm:block" aria-hidden="true">
                  <ExperienceArt id={item.id} />
                </span>
              )}
              <span
                aria-hidden="true"
                className={cx(
                  'grid shrink-0 place-items-center rounded-full text-xs font-semibold',
                  compact ? 'h-6 w-6' : 'h-7 w-7 sm:hidden',
                  item.status === 'demonstrated' ? 'bg-brand-600 text-white' : current ? 'bg-ink text-white' : 'bg-canvas text-ink-soft ring-1 ring-line'
                )}
              >
                {item.status === 'demonstrated' ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  {!compact && <span className="hidden text-xs font-semibold tabular-nums text-ink-faint sm:inline">{String(i + 1).padStart(2, '0')}</span>}
                  <span className={cx('font-semibold text-ink', compact ? 'text-[13px]' : 'text-[15px]')}>{exp.title}</span>
                  {item.addedBy === 'adaptation' && (
                    <span className="chip bg-accent-50 px-2 py-0.5 text-[10px] text-accent-700">
                      <Sparkles size={10} aria-hidden="true" /> Adapted
                    </span>
                  )}
                </span>
                {!compact && <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{item.reason}</span>}
                {compact && label && (
                  <span className={cx('chip mt-1 px-2 py-0.5 text-[10px]', status.className)}>
                    {status.icon}
                    {label}
                  </span>
                )}
              </span>
              {!compact && (
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  {label && (
                    <span className={cx('chip text-[11px]', status.className)}>
                      {status.icon}
                      {label}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
                    <Clock size={11} aria-hidden="true" />~{exp.minutes}m
                  </span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function PlanView({
  state,
  onStart,
  onAdd,
  onBackToChat,
  onOpen
}: {
  state: JourneyState;
  onStart: () => void;
  onAdd: (id: ExperienceId) => void;
  onBackToChat: () => void;
  onOpen: (id: ExperienceId) => void;
}) {
  const [showLibrary, setShowLibrary] = useState(false);
  const others = EXPERIENCE_IDS.filter((id) => !state.plan.some((p) => p.id === id));
  const minutes = state.plan.reduce((t, p) => t + EXPERIENCES[p.id].minutes, 0);

  return (
    <div className="space-y-5">
      <section className="card animate-scale-in overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-white px-5 py-6 sm:px-7">
          <span className="chip bg-white text-brand-800 ring-1 ring-brand-100">
            <Sparkles size={12} aria-hidden="true" /> Built from your answers
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">Your personalised journey</h1>
          {state.objective && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">Your goal:</span> {state.objective}
            </p>
          )}
          <ul className="mt-4 flex flex-wrap gap-2 text-[13px] font-medium text-ink-soft">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line"><Layers size={13} className="text-brand-600" aria-hidden="true" />{state.plan.length} hands-on experiences</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line"><Clock size={13} className="text-brand-600" aria-hidden="true" />About {minutes} minutes</li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line"><Route size={13} className="text-brand-600" aria-hidden="true" />Adapts to your answers</li>
          </ul>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100/60 blur-2xl" aria-hidden="true" />
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-7">
          <PlanList state={state} onOpen={onOpen} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="btn-ghost" onClick={onBackToChat}>
              <MessageCircle size={16} aria-hidden="true" /> Change direction
            </button>
            <button type="button" className="btn-primary whitespace-normal text-center" onClick={onStart}>
              Start with “{EXPERIENCES[state.plan.find((p) => p.status === 'pending' || p.status === 'active')?.id ?? state.plan[0].id].title}”
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="card">
          <button
            type="button"
            className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-7"
            aria-expanded={showLibrary}
            onClick={() => setShowLibrary((v) => !v)}
          >
            <span>
              <span className="block font-semibold text-ink">Explore the rest of the library</span>
              <span className="block text-sm text-ink-muted">{others.length} more experiences you can add any time</span>
            </span>
            <ChevronDown size={18} className={cx('text-ink-muted transition', showLibrary && 'rotate-180')} aria-hidden="true" />
          </button>
          {showLibrary && (
            <ul className="grid gap-2 border-t border-line px-5 py-4 sm:grid-cols-2 sm:px-7">
              {others.map((id) => (
                <li key={id} className="group flex animate-fade-up items-start gap-3 rounded-xl border border-line p-3.5">
                  <span className="w-16 shrink-0 overflow-hidden rounded-lg" aria-hidden="true"><ExperienceArt id={id} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-ink">{EXPERIENCES[id].title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{EXPERIENCES[id].short}</span>
                  </span>
                  <button type="button" className="btn-secondary btn-sm shrink-0" onClick={() => onAdd(id)} aria-label={`Add ${EXPERIENCES[id].title} to plan`}>
                    <Plus size={14} aria-hidden="true" /> Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
