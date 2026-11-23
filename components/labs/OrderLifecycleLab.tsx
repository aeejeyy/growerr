'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { LabProps } from './types';
import { Callout, Segmented, SimBadge, cx } from '../ui';

type PathId = 'reaches' | 'never';
type Stage = { title: string; text: string; order: string; holdings: string | null };

const PATHS: Record<PathId, Stage[]> = {
  reaches: [
    { title: 'Order placed', text: 'You send a limit buy for Company A. It is an instruction, not ownership.', order: 'Submitted', holdings: null },
    { title: 'Open (pending)', text: 'The order waits in the Orders tab until a seller matches your price.', order: 'Open', holdings: null },
    { title: 'Executed', text: 'The price reached your limit and a trade happened. You now have a trade, still settling.', order: 'Executed', holdings: null },
    { title: 'Settled', text: 'For delivery trades in India, settlement is T+1: shares reach your demat account the next trading day.', order: 'Executed', holdings: 'Company A · Qty 2' },
    { title: 'In Holdings', text: 'Only now does Company A show in Holdings as something you own.', order: 'Executed', holdings: 'Company A · Qty 2' }
  ],
  never: [
    { title: 'Order placed', text: 'You send a limit buy for Company A. It is an instruction, not ownership.', order: 'Submitted', holdings: null },
    { title: 'Open (pending)', text: 'The order waits in the Orders tab until a seller matches your price.', order: 'Open', holdings: null },
    { title: 'Still open at end of day', text: 'The price never came down to your limit, so no trade happened.', order: 'Open', holdings: null },
    { title: 'Cancelled / expired', text: 'Depending on the order’s validity and the broker’s rules, an unexecuted order is cancelled or expires. Any blocked funds are released.', order: 'Cancelled', holdings: null },
    { title: 'Never in Holdings', text: 'No execution means nothing to own. Holdings stay empty.', order: 'Cancelled', holdings: null }
  ]
};

export default function OrderLifecycleLab({ onExplored }: LabProps) {
  const [path, setPath] = useState<PathId>('reaches');
  const [step, setStep] = useState(0);
  const finished = useRef(new Set<PathId>());
  const reported = useRef(false);
  const stages = PATHS[path];
  const stage = stages[step];

  function move(next: number) {
    const clamped = Math.max(0, Math.min(stages.length - 1, next));
    setStep(clamped);
    if (clamped === stages.length - 1) {
      finished.current.add(path);
      if (!reported.current && finished.current.size >= 2) {
        reported.current = true;
        onExplored();
      }
    }
  }

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Follow one order from start to finish</h3>
        <SimBadge />
      </div>

      <Segmented label="Scenario" value={path} onChange={(v) => { setPath(v); setStep(0); }}
        options={[{ value: 'reaches', label: 'Price reaches your limit' }, { value: 'never', label: 'Price never reaches it' }]} />

      <ol className="flex gap-1.5" aria-label="Progress">
        {stages.map((s, i) => (
          <li key={s.title} className={cx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-brand-500' : 'bg-line')}>
            <span className="sr-only">{s.title}{i === step ? ' (current)' : ''}</span>
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="min-h-[88px]">
        <p className="eyebrow">Step {step + 1} of {stages.length}</p>
        <p className="mt-1 text-lg font-semibold text-ink">{stage.title}</p>
        <p className="text-sm text-ink-soft">{stage.text}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line p-3">
          <p className="eyebrow mb-2">Orders</p>
          <p className="text-sm text-ink">Buy · Company A</p>
          <span className={cx('chip mt-1.5', stage.order === 'Executed' ? 'bg-brand-50 text-brand-800' : stage.order === 'Cancelled' ? 'bg-loss-50 text-loss-700' : 'bg-accent-50 text-accent-700')}>
            {stage.order === 'Executed' && <Check size={12} aria-hidden="true" />}{stage.order}
          </span>
        </div>
        <div className="rounded-xl border border-line p-3">
          <p className="eyebrow mb-2">Holdings</p>
          {stage.holdings ? <p className="text-sm font-medium text-ink">{stage.holdings}</p> : <p className="text-sm text-ink-muted">Empty</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn-secondary btn-sm" onClick={() => move(step - 1)} disabled={step === 0}><ArrowLeft size={14} aria-hidden="true" /> Back</button>
        <button type="button" className="btn-primary btn-sm" onClick={() => move(step + 1)} disabled={step === stages.length - 1}>Next <ArrowRight size={14} aria-hidden="true" /></button>
      </div>

      {step === stages.length - 1 && finished.current.size < 2 && (
        <Callout tone="neutral">Now try the other scenario to compare where the order ends up.</Callout>
      )}
    </div>
  );
}
