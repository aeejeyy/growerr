'use client';

import { Activity, AlertCircle, Check, CircleDashed, MessageSquareQuote } from 'lucide-react';
import { MISCONCEPTIONS } from '../../lib/journey/experiences';
import { DIMENSIONS, DIMENSION_LABELS, STATE_LABELS } from '../../lib/journey/profile';
import type { JourneyState, KnowledgeState } from '../../lib/journey/types';
import { cx } from '../ui';

const STATE_STYLE: Record<KnowledgeState, { bar: number; className: string; dot: string }> = {
  'not-assessed': { bar: 0, className: 'text-ink-faint', dot: 'bg-line-strong' },
  'needs-introduction': { bar: 1, className: 'text-warn-700', dot: 'bg-warn' },
  developing: { bar: 2, className: 'text-accent-700', dot: 'bg-accent' },
  demonstrated: { bar: 3, className: 'text-brand-700', dot: 'bg-brand-500' }
};

export function ProfilePanel({ state }: { state: JourneyState }) {
  const open = DIMENSIONS.flatMap((d) => state.profile[d].misconceptions.filter((m) => !m.resolved));
  const resolved = DIMENSIONS.flatMap((d) => state.profile[d].misconceptions.filter((m) => m.resolved));

  return (
    <section aria-labelledby="profile-title" className="space-y-4">
      <div>
        <h2 id="profile-title" className="text-sm font-semibold text-ink">Your understanding profile</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">
          Updates as you talk and practise. <span className="font-medium text-ink-soft">Said</span> = what you told me;{' '}
          <span className="font-medium text-ink-soft">shown</span> = what you demonstrated. Not a score.
        </p>
      </div>
      <ul className="space-y-3">
        {DIMENSIONS.map((d) => {
          const entry = state.profile[d];
          const style = STATE_STYLE[entry.state];
          return (
            <li key={d}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium text-ink">{DIMENSION_LABELS[d]}</span>
                <span className={cx('text-[11px] font-semibold', style.className)}>{STATE_LABELS[entry.state]}</span>
              </div>
              <div className="mt-1.5 grid grid-cols-3 gap-1" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={cx('h-1.5 rounded-full transition-colors duration-500', n <= style.bar ? style.dot : 'bg-line')} />
                ))}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ink-muted">
                {entry.claimed.length > 0 && (
                  <span className="inline-flex items-center gap-1" title={entry.claimed.join(' · ')}>
                    <MessageSquareQuote size={11} aria-hidden="true" /> Said
                  </span>
                )}
                {entry.demonstrated.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-brand-700" title={entry.demonstrated.join(' · ')}>
                    <Check size={11} aria-hidden="true" /> Shown ×{entry.demonstrated.length}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {(open.length > 0 || resolved.length > 0) && (
        <div className="space-y-2 border-t border-line pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Ideas being worked on</h3>
          <ul className="space-y-1.5">
            {open.map((m) => (
              <li key={m.id} className="flex gap-2 text-[13px] leading-snug text-ink-soft">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
                <span>
                  <span className="sr-only">Open: </span>“{MISCONCEPTIONS[m.id]?.label ?? m.id}”
                </span>
              </li>
            ))}
            {resolved.map((m) => (
              <li key={m.id} className="flex gap-2 text-[13px] leading-snug text-ink-muted line-through decoration-ink-faint">
                <Check size={14} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                <span>
                  <span className="sr-only">Resolved: </span>“{MISCONCEPTIONS[m.id]?.label ?? m.id}”
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function AdaptationLog({ state }: { state: JourneyState }) {
  const items = [...state.log].reverse().slice(0, 6);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="log-title" className="space-y-2 border-t border-line pt-4">
      <h2 id="log-title" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-muted">
        <Activity size={12} aria-hidden="true" /> How your journey adapted
      </h2>
      <ol className="space-y-1.5">
        {items.map((e, i) => (
          <li key={`${e.at}-${i}`} className="flex gap-2 text-[12.5px] leading-snug text-ink-soft">
            <CircleDashed size={12} className="mt-0.5 shrink-0 text-ink-faint" aria-hidden="true" />
            {e.text}
          </li>
        ))}
      </ol>
    </section>
  );
}
