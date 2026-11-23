'use client';

import { useRef, useState } from 'react';
import { RotateCcw, TrendingDown } from 'lucide-react';
import type { LabProps } from './types';
import { SimBadge, Segmented, Callout, cx, formatUnits } from '../ui';

const START = 10000;
const POOL_SIZE = 10;

type Mode = 'direct' | 'pool';
type Event = 'companyA' | 'market';

function valueAfter(mode: Mode, events: Event[]): number {
  let value = START;
  for (const event of events) {
    if (event === 'companyA') value *= mode === 'direct' ? 0.6 : 1 - 0.4 / POOL_SIZE;
    if (event === 'market') value *= 0.9;
  }
  return value;
}

function Bar({ label, value, highlight }: { label: string; value: number; highlight: boolean }) {
  const pct = (value / START) * 100;
  const change = value - START;
  return (
    <div className={cx('rounded-xl border p-4 transition', highlight ? 'border-brand-200 bg-brand-50/50' : 'border-line bg-white')}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-ink">₹{formatUnits(value, 0)}</p>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className={cx('h-full rounded-full transition-all duration-500', change < 0 ? 'bg-loss' : 'bg-brand-500')} style={{ width: `${pct}%` }} />
      </div>
      <p className={cx('mt-1.5 text-xs font-medium tabular-nums', change < 0 ? 'text-loss-700' : 'text-ink-muted')}>
        {change === 0 ? 'No change from ₹10,000' : `▼ −₹${formatUnits(-change, 0)} (${formatUnits((change / START) * 100, 1)}%)`}
      </p>
    </div>
  );
}

export default function PoolVsDirectLab({ onExplored, explored }: LabProps) {
  const [mode, setMode] = useState<Mode>('direct');
  const [events, setEvents] = useState<Event[]>([]);
  const seen = useRef(new Set<string>());
  const fired = useRef(explored);

  const mark = (key: string) => {
    seen.current.add(key);
    if (!fired.current && seen.current.has('companyA') && seen.current.has('market')) {
      fired.current = true;
      onExplored();
    }
  };

  const trigger = (event: Event) => {
    setEvents((prev) => [...prev, event]);
    mark(event);
  };

  const direct = valueAfter('direct', events);
  const pool = valueAfter('pool', events);
  const last = events[events.length - 1];

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">₹10,000 two ways</h3>
        <SimBadge />
      </div>

      <Segmented<Mode>
        label="Choose which holding to focus on"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'direct', label: 'Own Company A directly' },
          { value: 'pool', label: 'Units in a pool of 10' }
        ]}
      />
      <p className="mt-3 text-sm text-ink-soft">
        {mode === 'direct'
          ? 'All ₹10,000 is in shares of one invented company, Company A.'
          : 'The ₹10,000 buys units of a pool that holds 10 invented companies equally — Company A is one of them (10%).'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-secondary btn-sm" onClick={() => trigger('companyA')}>
          <TrendingDown size={16} aria-hidden="true" /> Company A falls 40%
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={() => trigger('market')}>
          <TrendingDown size={16} aria-hidden="true" /> Whole market dips 10%
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={() => setEvents([])} disabled={events.length === 0}>
          <RotateCcw size={16} aria-hidden="true" /> Reset
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Bar label="Direct: Company A only" value={direct} highlight={mode === 'direct'} />
        <Bar label="Pool of 10 companies" value={pool} highlight={mode === 'pool'} />
      </div>

      <div className="mt-4" aria-live="polite">
        <Callout tone="brand" title="What this shows">
          {!last && 'Try both events. Watch how each holding reacts.'}
          {last === 'companyA' &&
            'A fall in one company hits the direct holding hard, but the pool only feels it through its 10% slice. Pooling spreads company-specific risk.'}
          {last === 'market' &&
            'A market-wide dip affects both. Pooling does not remove market-wide risk — it only spreads risk tied to individual companies.'}
        </Callout>
      </div>
    </div>
  );
}
