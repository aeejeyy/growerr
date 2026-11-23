'use client';

import { useRef, useState } from 'react';
import type { LabProps } from './types';
import { Callout, Segmented, SimBadge, cx, formatUnits } from '../ui';

type Level = { price: number; qty: number };
type Book = { bids: Level[]; asks: Level[] };

/** Invented order books. Asks sorted best (lowest) first; bids best (highest) first. */
const BOOKS: Record<'busy' | 'thin', Book> = {
  busy: {
    bids: [{ price: 99.9, qty: 420 }, { price: 99.8, qty: 610 }, { price: 99.7, qty: 900 }],
    asks: [{ price: 100.0, qty: 380 }, { price: 100.1, qty: 540 }, { price: 100.2, qty: 820 }]
  },
  thin: {
    bids: [{ price: 98.5, qty: 12 }, { price: 97.0, qty: 8 }, { price: 95.5, qty: 20 }],
    asks: [{ price: 100.0, qty: 15 }, { price: 101.5, qty: 10 }, { price: 103.0, qty: 25 }]
  }
};

export default function OrderDepthLab({ onExplored }: LabProps) {
  const [mode, setMode] = useState<'busy' | 'thin'>('busy');
  const book = BOOKS[mode];
  const prices = [...book.bids.map((l) => l.price), ...book.asks.map((l) => l.price)].sort((a, b) => a - b);
  const [limit, setLimit] = useState(100.0);
  const [qty, setQty] = useState(50);
  const [placed, setPlaced] = useState(false);
  const tried = useRef(new Set<string>());
  const reported = useRef(false);

  const effectiveLimit = prices.includes(limit) ? limit : book.asks[0].price;
  const bestBid = book.bids[0].price;
  const bestAsk = book.asks[0].price;
  const spread = bestAsk - bestBid;

  let remaining = qty;
  let filled = 0;
  for (const level of book.asks) {
    if (level.price > effectiveLimit || remaining <= 0) break;
    const take = Math.min(level.qty, remaining);
    filled += take;
    remaining -= take;
  }
  const outcome = filled === 0 ? 'none' : remaining > 0 ? 'partial' : 'full';

  function place() {
    setPlaced(true);
    tried.current.add(`${mode}-${outcome}`);
    if (!reported.current && tried.current.size >= 2) {
      reported.current = true;
      onExplored();
    }
  }

  const Row = ({ level, side }: { level: Level; side: 'bid' | 'ask' }) => (
    <li className="flex justify-between rounded-lg px-3 py-1.5 text-sm tabular-nums odd:bg-canvas">
      <span className={side === 'bid' ? 'text-brand-700' : 'text-loss-700'}>{formatUnits(level.price)}</span>
      <span className="text-ink-soft">{level.qty}</span>
    </li>
  );

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Order book: who’s waiting to trade</h3>
        <SimBadge />
      </div>

      <Segmented label="Book type" value={mode} onChange={(v) => { setMode(v); setPlaced(false); setLimit(BOOKS[v].asks[0].price); }} options={[{ value: 'busy', label: 'Busy book' }, { value: 'thin', label: 'Thin book' }]} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="eyebrow mb-1.5">Bids (buyers)</p>
          <ul className="space-y-0.5">{book.bids.map((l) => <Row key={l.price} level={l} side="bid" />)}</ul>
        </div>
        <div>
          <p className="eyebrow mb-1.5">Asks (sellers)</p>
          <ul className="space-y-0.5">{book.asks.map((l) => <Row key={l.price} level={l} side="ask" />)}</ul>
        </div>
      </div>
      <p className="text-sm text-ink-soft">Spread (best ask − best bid): <strong className="tabular-nums text-ink">{formatUnits(spread)}</strong></p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink-soft">
          Limit buy price
          <select className="input mt-1.5" value={effectiveLimit} onChange={(e) => { setLimit(Number(e.target.value)); setPlaced(false); }}>
            {prices.map((p) => <option key={p} value={p}>{formatUnits(p)}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink-soft">
          Quantity
          <input className="input mt-1.5" type="number" min={1} max={2000} value={qty} onChange={(e) => { setQty(Math.max(1, Math.min(2000, Number(e.target.value) || 1))); setPlaced(false); }} />
        </label>
      </div>

      <button type="button" className="btn-primary btn-sm" onClick={place}>Place hypothetical limit buy</button>

      <div aria-live="polite">
        {placed && (
          <Callout tone={outcome === 'full' ? 'brand' : outcome === 'partial' ? 'warn' : 'loss'} title={outcome === 'full' ? `Full fill: ${filled} of ${qty}` : outcome === 'partial' ? `Partial fill: ${filled} filled, ${remaining} still open` : 'No fill: order stays open'}>
            {outcome === 'none'
              ? `Your limit ${formatUnits(effectiveLimit)} is below the best ask ${formatUnits(bestAsk)}. No seller is offering at your price yet.`
              : outcome === 'partial'
                ? 'Sellers at or below your limit didn’t have enough quantity. The rest waits in the book.'
                : 'Enough sellers were offering at or below your limit to fill the whole order.'}
          </Callout>
        )}
      </div>

      <ul className={cx('space-y-1 text-sm text-ink-soft')}>
        <li><strong className="text-ink">Bid:</strong> the highest price a buyer is currently willing to pay.</li>
        <li><strong className="text-ink">Ask:</strong> the lowest price a seller is currently willing to accept.</li>
        <li><strong className="text-ink">Liquidity:</strong> how much quantity is waiting near the current price — thin books fill less, and less predictably.</li>
      </ul>
    </div>
  );
}
