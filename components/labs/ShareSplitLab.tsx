'use client';

import { useEffect, useRef, useState } from 'react';
import type { LabProps } from './types';
import { SimBadge, Slider, Stat, Callout, cx, formatUnits } from '../ui';

const TOTAL_SHARES = 1000;
const COMPANY_VALUE = 10_00_000; // invented: ₹10,00,000 → ₹1,000 per share
const GRID = 100; // each cell = 10 shares

export default function ShareSplitLab({ onExplored, explored }: LabProps) {
  const [held, setHeld] = useState(50);
  const [change, setChange] = useState(0);
  const touched = useRef({ held: false, change: false });
  const fired = useRef(explored);

  useEffect(() => {
    if (!fired.current && touched.current.held && touched.current.change) {
      fired.current = true;
      onExplored();
    }
  }, [held, change, onExplored]);

  const ownership = (held / TOTAL_SHARES) * 100;
  const newCompanyValue = COMPANY_VALUE * (1 + change / 100);
  const pricePerShare = newCompanyValue / TOTAL_SHARES;
  const startValue = (COMPANY_VALUE / TOTAL_SHARES) * held;
  const holdingValue = pricePerShare * held;
  const diff = holdingValue - startValue;
  const filledCells = Math.round((held / TOTAL_SHARES) * GRID);

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">Example Company, split into {TOTAL_SHARES.toLocaleString('en-IN')} shares</h3>
        <SimBadge />
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,220px)_1fr]">
        <div>
          <div
            className="grid grid-cols-10 gap-1"
            role="img"
            aria-label={`${filledCells} of ${GRID} blocks highlighted. Each block is 10 shares.`}
          >
            {Array.from({ length: GRID }, (_, i) => (
              <span
                key={i}
                className={cx('aspect-square rounded-[3px] transition-colors', i < filledCells ? 'bg-brand-500' : 'bg-line')}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-muted">Each block = 10 shares. Green blocks are yours.</p>
        </div>

        <div className="space-y-5">
          <Slider
            id="share-held"
            label="Shares you hold"
            value={held}
            min={10}
            max={500}
            step={10}
            onChange={(v) => {
              touched.current.held = true;
              setHeld(v);
            }}
            format={(v) => `${v} shares`}
          />
          <Slider
            id="company-change"
            label="Hypothetical change in company value"
            value={change}
            min={-40}
            max={40}
            step={5}
            onChange={(v) => {
              touched.current.change = true;
              setChange(v);
            }}
            format={(v) => `${v > 0 ? '+' : ''}${v}%`}
          />
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Your ownership" value={`${formatUnits(ownership, 1)}%`} tone="accent" />
            <Stat label="Price per share" value={`₹${formatUnits(pricePerShare, 0)}`} />
            <Stat
              label="Your holding value"
              value={`₹${formatUnits(holdingValue, 0)}`}
              tone={diff < 0 ? 'loss' : diff > 0 ? 'brand' : 'ink'}
              hint={diff === 0 ? 'Unchanged' : `${diff > 0 ? '▲ +' : '▼ −'}₹${formatUnits(Math.abs(diff), 0)} vs start`}
            />
            <Stat label="Company value" value={`₹${formatUnits(newCompanyValue, 0)}`} />
          </div>
        </div>
      </div>

      <div className="mt-5" aria-live="polite">
        <Callout tone="brand" title="What this shows">
          You own {formatUnits(ownership, 1)}% of the company. If its value changes by {change > 0 ? '+' : ''}
          {change}%, your shares change by the same percentage — up or down. Your ownership share stays the same unless you
          buy or sell shares.
        </Callout>
      </div>
    </div>
  );
}
