import { ArrowRight, Check, MessageCircle, RotateCcw, Sparkles, X } from 'lucide-react';
import ExperienceArt from '../art/ExperienceArt';
import { GoalArt, LevelArt } from '../art/GoalArt';

/** Small, static product vignettes used in "How it works". Decorative only. */

export function PickVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex items-center gap-2.5 rounded-xl border border-brand-500 bg-white p-2 shadow-glow">
        <div className="scale-[0.7]"><GoalArt id="grow" /></div>
        <span className="flex-1 text-[12.5px] font-semibold text-ink">Grow my money over time</span>
        <span className="mr-1 grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white"><Check size={11} /></span>
      </div>
      <div className="flex gap-2">
        {(['none', 'some', 'experienced'] as const).map((l, i) => (
          <div key={l} className={`flex flex-1 flex-col items-center gap-1 rounded-xl border bg-white p-2 ${i === 0 ? 'border-brand-500' : 'border-line'}`}>
            <div className="scale-[0.75]"><LevelArt id={l} /></div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11.5px] text-ink-muted ring-1 ring-line">
        <MessageCircle size={12} className="text-brand-600" /> …or ask in your own words
      </div>
    </div>
  );
}

export function PlanVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {(
        [
          ['EXP-05', 'Market orders'],
          ['EXP-06', 'Limit orders'],
          ['EXP-07', 'When orders wait']
        ] as const
      ).map(([id, title], i) => (
        <div key={id} className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-1.5">
          <span className="w-14 shrink-0 overflow-hidden rounded-md"><ExperienceArt id={id} /></span>
          <span className="flex-1 text-[12.5px] font-semibold text-ink">{title}</span>
          {i === 0 && <span className="chip mr-1 bg-brand-50 px-2 py-0.5 text-[10px] text-brand-800">First</span>}
        </div>
      ))}
    </div>
  );
}

export function TryVisual() {
  return (
    <div className="rounded-xl border border-line bg-white p-3" aria-hidden="true">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-ink">Practice market</span>
        <span className="chip bg-warn-50 px-2 py-0.5 text-[10px] text-warn-700">Simulated</span>
      </div>
      <svg viewBox="0 0 220 70" className="mt-2 w-full">
        <path d="M0 50 L20 42 L40 46 L60 30 L80 38 L100 22 L120 34 L140 26 L160 40 L180 20 L200 28 L220 14" fill="none" stroke="#5367FF" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M0 50 L20 42 L40 46 L60 30 L80 38 L100 22 L120 34 L140 26 L160 40 L180 20 L200 28 L220 14 V70 H0 Z" fill="#5367FF" opacity="0.07" />
      </svg>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10.5px] text-ink-muted">Quantity</span>
        <span className="relative h-1.5 flex-1 rounded-full bg-line">
          <span className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-brand-500" />
          <span className="absolute left-3/5 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 shadow" style={{ left: '60%' }} />
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-ink">6</span>
      </div>
    </div>
  );
}

export function AdaptVisual() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="flex items-center gap-2 rounded-xl border border-loss/30 bg-loss-50 px-3 py-2 text-[12px] text-loss-700">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-loss text-white"><X size={11} /></span>
        Not quite — an order isn’t a holding yet
      </div>
      <div className="flex justify-center text-ink-faint"><ArrowRight size={14} className="rotate-90" /></div>
      <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-50 px-3 py-2 text-[12px] text-accent-700">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white"><RotateCcw size={11} /></span>
        Explained another way + a fresh example
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[12px] font-medium text-brand-900">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white"><Sparkles size={11} /></span>
        Got it — understanding demonstrated
      </div>
    </div>
  );
}
