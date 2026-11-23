'use client';

import { useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { LabProps } from './types';
import { SimBadge, Segmented, Callout, cx } from '../ui';

type Approach = 'investing' | 'trading';

const PROFILES: Record<Approach, { span: [number, number]; spanLabel: string; activities: string[]; attention: string; frequency: string }> = {
  investing: {
    span: [55, 100],
    spanLabel: 'Usually months to many years',
    activities: ['Holding assets over a long period', 'Adding money at regular intervals', 'Reviewing occasionally'],
    attention: 'Long-term goals, the business or fund itself, costs over time',
    frequency: 'Fewer decisions, spread out over time'
  },
  trading: {
    span: [0, 45],
    spanLabel: 'Usually minutes to weeks',
    activities: ['Buying and selling within short periods', 'Watching price movements closely', 'Placing many orders'],
    attention: 'Short-term price moves, order types, timing, transaction costs',
    frequency: 'Many decisions, often in a short time'
  }
};

const MARKS = ['Minutes', 'Days', 'Weeks', 'Months', 'Years'];

const CHIPS: { id: string; label: string; fits: Approach }[] = [
  { id: 'c1', label: 'Holds for several years', fits: 'investing' },
  { id: 'c2', label: 'Buys and sells the same day', fits: 'trading' },
  { id: 'c3', label: 'Adds a fixed amount every month', fits: 'investing' },
  { id: 'c4', label: 'Checks prices many times a day', fits: 'trading' }
];

export default function InvestVsTradeLab({ onExplored, explored }: LabProps) {
  const [tab, setTab] = useState<Approach>('investing');
  const [placed, setPlaced] = useState<Record<string, Approach>>({});
  const seenTabs = useRef(new Set<Approach>(['investing']));
  const fired = useRef(explored);

  const check = (tabs: Set<Approach>, count: number) => {
    if (!fired.current && tabs.size === 2 && count >= 2) {
      fired.current = true;
      onExplored();
    }
  };

  const p = PROFILES[tab];
  const placedCount = Object.keys(placed).length;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">Two different activities</h3>
        <SimBadge>Illustration · general descriptions</SimBadge>
      </div>

      <Segmented<Approach>
        label="Choose an approach to view"
        value={tab}
        onChange={(v) => {
          setTab(v);
          seenTabs.current.add(v);
          check(seenTabs.current, placedCount);
        }}
        options={[
          { value: 'investing', label: 'Investing' },
          { value: 'trading', label: 'Trading' }
        ]}
      />

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-ink-muted">Typical time horizon: <span className="text-ink">{p.spanLabel}</span></p>
        <div className="relative h-3 rounded-full bg-line" aria-hidden="true">
          <div
            className={cx('absolute h-full rounded-full transition-all duration-500', tab === 'investing' ? 'bg-brand-500' : 'bg-accent')}
            style={{ left: `${p.span[0]}%`, width: `${p.span[1] - p.span[0]}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-ink-muted" aria-hidden="true">
          {MARKS.map((m) => <span key={m}>{m}</span>)}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-canvas p-4">
          <dt className="text-xs font-medium text-ink-muted">Typical activities</dt>
          <dd className="mt-1 text-sm text-ink">
            <ul className="list-disc space-y-0.5 pl-4">{p.activities.map((a) => <li key={a}>{a}</li>)}</ul>
          </dd>
        </div>
        <div className="rounded-xl bg-canvas p-4">
          <dt className="text-xs font-medium text-ink-muted">Pays attention to</dt>
          <dd className="mt-1 text-sm text-ink">{p.attention}</dd>
        </div>
        <div className="rounded-xl bg-canvas p-4">
          <dt className="text-xs font-medium text-ink-muted">Decision frequency</dt>
          <dd className="mt-1 text-sm text-ink">{p.frequency}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <p className="text-sm font-semibold text-ink">Place each activity</p>
        <p className="mb-3 text-xs text-ink-muted">Tap “Investing” or “Trading” for each one.</p>
        <ul className="space-y-2">
          {CHIPS.map((chip) => {
            const choice = placed[chip.id];
            const right = choice === chip.fits;
            return (
              <li key={chip.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
                <span className="text-sm text-ink">{chip.label}</span>
                <span className="flex items-center gap-1.5">
                  {(['investing', 'trading'] as Approach[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      aria-pressed={choice === a}
                      onClick={() => {
                        const next = { ...placed, [chip.id]: a };
                        setPlaced(next);
                        check(seenTabs.current, Object.keys(next).length);
                      }}
                      className={cx(
                        'min-h-[36px] rounded-lg border px-3 text-xs font-semibold capitalize transition',
                        choice === a ? (right ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-loss bg-loss-50 text-loss-700') : 'border-line text-ink-soft hover:bg-canvas'
                      )}
                    >
                      {a}
                    </button>
                  ))}
                  <span className="w-5" aria-live="polite">
                    {choice && (right ? <Check size={16} className="text-brand-700" aria-label="Fits" /> : <X size={16} className="text-loss-700" aria-label="Not a typical fit" />)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4">
        <Callout tone="brand" title="What this shows">
          Investing and trading differ in purpose, time horizon and how often decisions are made. Neither is described here as better —
          and both carry risk.
        </Callout>
      </div>
    </div>
  );
}
