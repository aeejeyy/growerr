'use client';

import { useEffect, useState } from 'react';
import { Check, MessageCircle, MousePointerClick, Route, Sparkles } from 'lucide-react';
import ExperienceArt from '../art/ExperienceArt';
import { GoalArt } from '../art/GoalArt';

/** An auto-playing product preview: pick → plan → practise → understood. */
const SCENES = [
  { id: 'pick', label: 'Pick', icon: MessageCircle },
  { id: 'plan', label: 'Plan', icon: Route },
  { id: 'try', label: 'Try', icon: MousePointerClick },
  { id: 'done', label: 'Understand', icon: Check }
] as const;

export default function HeroDemo() {
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setScene((s) => (s + 1) % SCENES.length), 3600);
    return () => window.clearTimeout(t);
  }, [scene, paused]);

  return (
    <div className="relative mx-auto w-full max-w-[440px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute -inset-10 -z-10 rounded-[48px] bg-[radial-gradient(closest-side,#CCF5EB,transparent)] opacity-80 blur-2xl" aria-hidden="true" />

      {/* Floating accents */}
      <div className="absolute -bottom-6 -left-8 z-10 hidden animate-float rounded-2xl bg-white px-3.5 py-2.5 shadow-lift ring-1 ring-line sm:block" aria-hidden="true">
        <p className="text-[11px] font-medium text-ink-muted">Every number is</p>
        <p className="text-[13px] font-semibold text-ink">Simulated · zero risk</p>
      </div>
      <div className="absolute -right-6 -top-6 z-10 hidden animate-float-slow rounded-2xl bg-white px-3.5 py-2.5 shadow-lift ring-1 ring-line sm:block" aria-hidden="true">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <Sparkles size={13} className="text-accent" /> Adapts to you
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-line bg-white shadow-lift">
        {/* Window bar */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </div>
          <div className="flex gap-1" role="tablist" aria-label="Product preview">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === scene}
                onClick={() => setScene(i)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${i === scene ? 'bg-ink text-white' : 'text-ink-muted hover:text-ink'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative h-[360px] overflow-hidden bg-gradient-to-b from-white to-canvas/70" aria-live="off">
          <div key={scene} className="absolute inset-0 animate-fade-up p-5">
            {scene === 0 && <PickScene />}
            {scene === 1 && <PlanScene />}
            {scene === 2 && <TryScene />}
            {scene === 3 && <DoneScene />}
          </div>
        </div>

        {/* Progress */}
        <div className="grid grid-cols-4 gap-1.5 border-t border-line px-5 py-3" aria-hidden="true">
          {SCENES.map((s, i) => (
            <span key={s.id} className="h-1 overflow-hidden rounded-full bg-line">
              <span
                key={`${scene}-${i}`}
                className={`block h-full origin-left rounded-full bg-brand-500 ${i < scene ? 'scale-x-100' : i === scene && !paused ? 'animate-[grow_3600ms_linear_both]' : i === scene ? 'scale-x-100' : 'scale-x-0'}`}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickScene() {
  return (
    <div>
      <p className="text-[15px] font-bold text-ink">What brings you here?</p>
      <p className="text-[12px] text-ink-muted">Three taps — no typing needed</p>
      <div className="mt-4 space-y-2.5">
        {(
          [
            ['grow', 'Grow my money over time', true],
            ['trade', 'Try buying and selling', false],
            ['app', 'Make sense of a broker app', false]
          ] as const
        ).map(([id, label, on], i) => (
          <div
            key={id}
            className={`flex animate-fade-up items-center gap-3 rounded-2xl border bg-white p-2.5 ${on ? 'border-brand-500 shadow-glow' : 'border-line'}`}
            style={{ animationDelay: `${120 + i * 90}ms` }}
          >
            <div className="scale-[0.8]">
              <GoalArt id={id} />
            </div>
            <span className="flex-1 text-[13px] font-semibold text-ink">{label}</span>
            <span className={`mr-1 grid h-5 w-5 place-items-center rounded-full ${on ? 'animate-pop bg-brand-500 text-white' : 'border border-line-strong'}`} style={{ animationDelay: '700ms' }}>
              {on && <Check size={12} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanScene() {
  const items = [
    ['EXP-01', 'What a share really is', 'A foundation for the next step'],
    ['EXP-02', 'Stocks vs mutual funds', 'Matches what you picked'],
    ['EXP-04', 'Understanding volatility', 'You mentioned losing money']
  ] as const;
  return (
    <div>
      <span className="chip bg-brand-50 text-brand-800">
        <Sparkles size={11} /> Built from your answers
      </span>
      <p className="mt-2 text-[15px] font-bold text-ink">Your personalised plan</p>
      <div className="mt-3 space-y-2">
        {items.map(([id, title, why], i) => (
          <div key={id} className="flex animate-slide-in items-center gap-3 rounded-2xl border border-line bg-white p-2" style={{ animationDelay: `${150 + i * 120}ms` }}>
            <span className="w-[72px] shrink-0 overflow-hidden rounded-lg">
              <ExperienceArt id={id} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-ink">{title}</span>
              <span className="block text-[11.5px] text-ink-muted">{why}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TryScene() {
  return (
    <div>
      <p className="text-[15px] font-bold text-ink">Try it: set a limit price</p>
      <p className="text-[12px] text-ink-muted">Invented prices — move the line and watch</p>
      <div className="mt-4 rounded-2xl border border-line bg-white p-3">
        <svg viewBox="0 0 300 140" className="w-full" aria-hidden="true">
          <path d="M0 110 H300" stroke="#E9E9EB" />
          <path
            d="M0 40 L30 52 L60 46 L90 70 L120 62 L150 88 L180 80 L210 96 L240 84 L270 92 L300 86"
            fill="none"
            stroke="#5367FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 400, animation: 'art-draw 1.8s cubic-bezier(.2,.8,.2,1) both' }}
          />
          <g style={{ animation: 'limit-slide 2.6s cubic-bezier(.2,.8,.2,1) both' }}>
            <path d="M0 88 H300" stroke="#00A47E" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="6" y="94" width="82" height="20" rx="10" fill="#00A47E" />
            <text x="47" y="108" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">Limit ₹98</text>
          </g>
          <g style={{ animation: 'fade-in 400ms 2.2s both' }}>
            <circle cx="150" cy="88" r="10" fill="#00D09C" opacity="0.25" />
            <circle cx="150" cy="88" r="5" fill="#00A47E" />
          </g>
        </svg>
        <div className="mt-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-[12px]" style={{ animation: 'fade-up 400ms 2.4s both' }}>
          <span className="font-semibold text-brand-900">Order executed at ₹98</span>
          <Check size={14} className="text-brand-700" />
        </div>
      </div>
    </div>
  );
}

function DoneScene() {
  const rows = [
    ['Investing basics', 100, 'Demonstrated'],
    ['Financial products', 100, 'Demonstrated'],
    ['Risk & volatility', 60, 'Developing']
  ] as const;
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 animate-pop place-items-center rounded-full bg-brand-600 text-white shadow-lift">
          <Check size={22} strokeWidth={3} />
        </span>
        <div>
          <p className="text-[15px] font-bold text-ink">Understanding demonstrated</p>
          <p className="text-[12px] text-ink-muted">Including applying it to a new example</p>
        </div>
      </div>
      <div className="mt-5 space-y-3.5 rounded-2xl border border-line bg-white p-4">
        {rows.map(([label, pct, state], i) => (
          <div key={label}>
            <div className="flex justify-between text-[12px]">
              <span className="font-medium text-ink">{label}</span>
              <span className={pct === 100 ? 'font-semibold text-brand-700' : 'font-semibold text-accent-700'}>{state}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
              <div
                className={`h-full origin-left animate-grow rounded-full ${pct === 100 ? 'bg-brand-500' : 'bg-accent'}`}
                style={{ width: `${pct}%`, animationDelay: `${200 + i * 160}ms` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11.5px] text-ink-muted">Then, only if you want: open a broker app knowing what every button means.</p>
    </div>
  );
}
