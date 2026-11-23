'use client';

import { useMemo, useRef, useState } from 'react';
import { Shuffle } from 'lucide-react';
import type { LabProps } from './types';
import { SimBadge, Slider, Stat, Callout, formatUnits } from '../ui';

const POINTS = 60;
const DRIFT = 0.001; // same small average drift for every level
const LEVELS = ['Very low', 'Low', 'Medium', 'High', 'Very high'];
const SIGMA = [0.004, 0.01, 0.02, 0.035, 0.055];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePath(seed: number, sigma: number): number[] {
  const rand = mulberry32(seed);
  const values = [100];
  for (let i = 1; i < POINTS; i++) {
    // approx normal via sum of uniforms
    const z = (rand() + rand() + rand() + rand() - 2) * Math.sqrt(3);
    values.push(Math.max(1, values[i - 1] * (1 + DRIFT + sigma * z)));
  }
  return values;
}

export default function VolatilityPathLab({ onExplored, explored }: LabProps) {
  const [level, setLevel] = useState(2);
  const [seed, setSeed] = useState(7);
  const touched = useRef({ slider: false, generate: false });
  const fired = useRef(explored);

  const mark = (key: 'slider' | 'generate') => {
    touched.current[key] = true;
    if (!fired.current && touched.current.slider && touched.current.generate) {
      fired.current = true;
      onExplored();
    }
  };

  const path = useMemo(() => makePath(seed, SIGMA[level]), [seed, level]);
  const stats = useMemo(() => {
    let peak = path[0];
    let maxDip = 0;
    for (const v of path) {
      peak = Math.max(peak, v);
      maxDip = Math.max(maxDip, (peak - v) / peak);
    }
    return { low: Math.min(...path), high: Math.max(...path), end: path[path.length - 1], maxDip };
  }, [path]);

  const W = 600;
  const H = 220;
  const yMin = Math.min(60, stats.low);
  const yMax = Math.max(140, stats.high);
  const x = (i: number) => (i / (POINTS - 1)) * W;
  const y = (v: number) => H - ((v - yMin) / (yMax - yMin)) * H;
  const d = path.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">A made-up value path</h3>
        <SimBadge>Random illustration · not a prediction</SimBadge>
      </div>

      <div className="rounded-xl border border-line bg-canvas/60 p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Invented path of ${POINTS} points starting at 100 and ending at ${formatUnits(stats.end, 1)}.`}>
          <line x1="0" x2={W} y1={y(100)} y2={y(100)} stroke="#D5D6DB" strokeDasharray="4 4" />
          <text x="4" y={y(100) - 6} fontSize="12" fill="#6B6E7E">Start 100</text>
          <path d={d} fill="none" stroke={stats.end >= 100 ? '#00A47E' : '#EB5B3C'} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider
          id="vol-level"
          label="Volatility (size of movements)"
          value={level}
          min={0}
          max={4}
          onChange={(v) => {
            setLevel(v);
            mark('slider');
          }}
          format={(v) => LEVELS[v]}
        />
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => {
            setSeed((s) => (s * 48271 + 11) % 2147483647);
            mark('generate');
          }}
        >
          <Shuffle size={16} aria-hidden="true" /> Generate another path
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3" aria-live="polite">
        <Stat label="Lowest point" value={formatUnits(stats.low, 1)} tone={stats.low < 100 ? 'loss' : 'ink'} />
        <Stat label="Biggest dip from a peak" value={`−${formatUnits(stats.maxDip * 100, 1)}%`} tone="loss" />
        <Stat label="End value" value={formatUnits(stats.end, 1)} tone={stats.end >= 100 ? 'brand' : 'loss'} />
      </div>

      <div className="mt-4">
        <Callout tone="warn" title="Read this carefully">
          Every path is randomly generated with the same small average drift — only the size of movements changes. Higher volatility
          means bigger swings in both directions, including deeper falls. These paths say nothing about any real investment.
        </Callout>
      </div>
    </div>
  );
}
