'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { LabProps } from './types';
import { Callout, SimBadge, Slider, Stat, cx, formatUnits } from '../ui';

const QUOTE = 100;

/** Fixed, invented price paths. Not real data, not predictions. */
const PATHS: number[][] = [
  [100, 100.5, 101, 100.5, 100, 99.5, 99, 98.5, 99, 99.5, 98, 97.5, 98, 99, 100, 100.5, 101, 101.5, 101, 102],
  [100, 100.5, 101, 101.5, 102, 101.5, 102.5, 103, 102.5, 103, 103.5, 104, 103.5, 104, 104.5, 105, 104.5, 105, 105.5, 106],
  [100, 99.5, 99, 98, 97, 96.5, 96, 95.5, 96, 96.5, 97, 96, 95, 95.5, 96, 97, 98, 98.5, 99, 99.5]
];

export default function LimitOrderSimLab({ onExplored }: LabProps) {
  const [limit, setLimit] = useState(99);
  const [pathIndex, setPathIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const reported = useRef(false);

  const path = PATHS[pathIndex];
  const visible = path.slice(0, Math.max(shown, 1));
  const fillTick = visible.findIndex((price) => price <= limit);
  const executed = fillTick >= 0;
  const fillPrice = executed ? Math.min(visible[fillTick], limit) : null;

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onExplored();
    }
  }, [finished, onExplored]);

  function run(nextPath = pathIndex) {
    if (timer.current) clearInterval(timer.current);
    setPathIndex(nextPath);
    setFinished(false);
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(PATHS[nextPath].length);
      setFinished(true);
      return;
    }
    setRunning(true);
    let count = 1;
    setShown(1);
    timer.current = setInterval(() => {
      count += 1;
      setShown(count);
      if (count >= PATHS[nextPath].length) {
        if (timer.current) clearInterval(timer.current);
        setRunning(false);
        setFinished(true);
      }
    }, 140);
  }

  const W = 300, H = 120, lo = 93, hi = 107;
  const x = (i: number) => (i / (path.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const line = visible.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Hypothetical limit buy order</h3>
        <SimBadge />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Invented quote now" value={formatUnits(QUOTE)} />
        <Stat label="Your limit (max you’d pay)" value={formatUnits(limit)} tone="accent" />
      </div>

      <Slider id="limit-price" label="Set your limit buy price" value={limit} min={94} max={106} step={0.5} onChange={(v) => { setLimit(v); }} format={(v) => formatUnits(v)} />

      <figure className="rounded-xl bg-canvas p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" role="img" aria-label={`Invented price path, ${visible.length} of ${path.length} ticks shown. Limit line at ${limit}.`}>
          <line x1="0" x2={W} y1={y(limit)} y2={y(limit)} stroke="#5367FF" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x={W - 4} y={y(limit) - 4} textAnchor="end" fontSize="9" fill="#3446D6">limit {limit}</text>
          <path d={line} fill="none" stroke="#00A47E" strokeWidth="2" strokeLinejoin="round" />
          {executed && finished && <circle cx={x(fillTick)} cy={y(visible[fillTick])} r="4" fill="#00D09C" stroke="#fff" strokeWidth="1.5" />}
        </svg>
        <figcaption className="mt-1 text-xs text-ink-muted">Session {pathIndex + 1} of {PATHS.length} · invented ticks, not a forecast</figcaption>
      </figure>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary btn-sm" onClick={() => run()} disabled={running}>
          <Play size={14} aria-hidden="true" /> Run simulated session
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={() => run((pathIndex + 1) % PATHS.length)} disabled={running}>
          <RotateCcw size={14} aria-hidden="true" /> Try another session
        </button>
      </div>

      <div aria-live="polite">
        {finished && (
          executed && fillPrice !== null ? (
            <Callout tone="brand" title={`Executed at ${formatUnits(fillPrice)}`}>
              The invented price reached {formatUnits(fillPrice)}, which is at or below your limit of {formatUnits(limit)}, so the order could fill. A limit buy never fills above your limit.
            </Callout>
          ) : (
            <Callout tone="warn" title="Still open — not executed">
              The invented price never came down to {formatUnits(limit)} or lower in this session, so the order stays pending. A limit order controls price, not whether it executes.
            </Callout>
          )
        )}
        {!finished && !running && <p className={cx('text-sm text-ink-muted')}>Pick a limit, then run a session to see what happens.</p>}
      </div>
    </div>
  );
}
