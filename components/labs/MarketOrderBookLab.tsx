'use client';

import { useMemo, useRef, useState } from 'react';
import type { LabProps } from './types';
import { SimBadge, Slider, Stat, Callout, cx, formatUnits } from '../ui';

const ASKS = [
  { price: 100.0, qty: 40 },
  { price: 100.5, qty: 60 },
  { price: 101.0, qty: 120 },
  { price: 101.5, qty: 200 }
];
const DISPLAYED = 100.0;

export default function MarketOrderBookLab({ onExplored, explored }: LabProps) {
  const [qty, setQty] = useState(10);
  const moves = useRef(0);
  const fired = useRef(explored);

  const fills = useMemo(() => {
    let left = qty;
    return ASKS.map((level) => {
      const take = Math.min(left, level.qty);
      left -= take;
      return { ...level, take };
    });
  }, [qty]);

  const cost = fills.reduce((sum, f) => sum + f.take * f.price, 0);
  const avg = cost / qty;
  const diff = avg - DISPLAYED;
  const levelsUsed = fills.filter((f) => f.take > 0).length;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">A hypothetical market buy</h3>
        <SimBadge />
      </div>

      <p className="mb-4 text-sm text-ink-soft">
        Last displayed price: <span className="font-semibold tabular-nums text-ink">₹{formatUnits(DISPLAYED)}</span>. Below are the sellers
        waiting (the “asks”), cheapest first.
      </p>

      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">Invented sell orders and how much of each your market order takes</caption>
          <thead className="bg-canvas text-xs text-ink-muted">
            <tr>
              <th scope="col" className="px-3 py-2 text-left font-medium">Ask price</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">Available</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">You take</th>
            </tr>
          </thead>
          <tbody>
            {fills.map((f) => (
              <tr key={f.price} className={cx('border-t border-line transition-colors', f.take > 0 && 'bg-brand-50')}>
                <td className="px-3 py-2.5 font-medium text-ink">₹{formatUnits(f.price)}</td>
                <td className="px-3 py-2.5 text-right text-ink-soft">{f.qty}</td>
                <td className={cx('px-3 py-2.5 text-right font-semibold', f.take > 0 ? 'text-brand-800' : 'text-ink-faint')}>
                  {f.take > 0 ? `${f.take}${f.take === f.qty ? ' (all)' : ''}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <Slider
          id="mkt-qty"
          label="Quantity in your market buy order"
          value={qty}
          min={10}
          max={300}
          step={10}
          onChange={(v) => {
            setQty(v);
            moves.current += 1;
            if (!fired.current && v > ASKS[0].qty && moves.current >= 2) {
              fired.current = true;
              onExplored();
            }
          }}
          format={(v) => `${v} shares`}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Displayed price" value={`₹${formatUnits(DISPLAYED)}`} />
        <Stat label="Your average price" value={`₹${formatUnits(avg)}`} tone={diff > 0 ? 'loss' : 'ink'} />
        <Stat label="Difference" value={`${diff > 0 ? '+' : ''}₹${formatUnits(diff)}`} tone={diff > 0 ? 'loss' : 'ink'} hint="per share" />
      </div>

      <div className="mt-4 space-y-3" aria-live="polite">
        <Callout tone="brand" title="What this shows">
          {levelsUsed === 1
            ? 'A small market order can fill entirely at the best available price.'
            : `Your order used ${levelsUsed} price levels. A market order fills at the best prices available, moving up the list until filled — so the average can differ from the displayed price.`}
        </Callout>
        <p className="text-xs text-ink-muted">
          Simplified illustration. Real markets also involve tick sizes, price bands, other orders arriving and transaction charges.
        </p>
      </div>
    </div>
  );
}
