'use client';

import { useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock, MessageCircle, Plus, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { EXPERIENCES, EXPERIENCE_IDS } from '../../lib/journey/experiences';
import type { ExperienceId, JourneyState, PlanItem } from '../../lib/journey/types';
import { cx } from '../ui';

const STATUS: Record<PlanItem['status'], { label: string; className: string; icon: React.ReactNode }> = {
  pending: { label: 'Up next', className: 'bg-canvas text-ink-soft', icon: null },
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
  return (
    <ol className="space-y-2">
      {state.plan.map((item, i) => {
        const exp = EXPERIENCES[item.id];
        const status = STATUS[item.status];
        const current = state.currentId === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen?.(item.id)}
              disabled={!onOpen}
              className={cx(
                'flex w-full items-start gap-3 rounded-xl border text-left transition',
                compact ? 'px-3 py-2.5' : 'px-4 py-3.5',
                current ? 'border-brand-500 bg-brand-50/60' : 'border-line bg-white hover:border-line-strong',
                !onOpen && 'cursor-default'
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'grid shrink-0 place-items-center rounded-full text-xs font-semibold',
                  compact ? 'h-6 w-6' : 'h-7 w-7',
                  item.status === 'demonstrated' ? 'bg-brand-600 text-white' : current ? 'bg-ink text-white' : 'bg-canvas text-ink-soft ring-1 ring-line'
                )}
              >
                {item.status === 'demonstrated' ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className={cx('font-semibold text-ink', compact ? 'text-[13px]' : 'text-[15px]')}>{exp.title}</span>
                  {item.addedBy === 'adaptation' && (
                    <span className="chip bg-accent-50 px-2 py-0.5 text-[10px] text-accent-700">
                      <Sparkles size={10} aria-hidden="true" /> Adapted
                    </span>
                  )}
                </span>
                {!compact && <span className="mt-0.5 block text-sm leading-snug text-ink-muted">{item.reason}</span>}
                {compact && (
                  <span className={cx('chip mt-1 px-2 py-0.5 text-[10px]', status.className)}>
                    {status.icon}
                    {current && item.status === 'active' ? 'Now' : status.label}
                  </span>
                )}
              </span>
              {!compact && (
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={cx('chip text-[11px]', status.className)}>
                    {status.icon}
                    {status.label}
                  </span>
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
      <section className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 via-white to-white px-5 py-6 sm:px-7">
          <span className="chip bg-white text-brand-800 ring-1 ring-brand-100">
            <Sparkles size={12} aria-hidden="true" /> Built from your conversation
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-[28px]">Your personalised journey</h1>
          {state.objective && (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              <span className="font-medium text-ink">Your goal:</span> {state.objective}
            </p>
          )}
          <p className="mt-2 text-sm text-ink-muted">
            {state.plan.length} interactive experiences · about {minutes} minutes · it adapts as you go
          </p>
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
                <li key={id} className="flex items-start justify-between gap-3 rounded-xl border border-line p-3.5">
                  <span className="min-w-0">
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
