'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Hourglass,
  Layers,
  MessageCircle,
  PackageCheck,
  PieChart,
  Receipt,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Target,
  type LucideIcon
} from 'lucide-react';
import { GOALS, LEVELS, SUGGESTED_TOPICS, TOPICS, type GoalId, type LevelId, type QuickPicks, type TopicId } from '../../lib/journey/quickstart';
import { GoalArt, LevelArt } from '../art/GoalArt';
import { cx } from '../ui';

const TOPIC_ICONS: Record<TopicId, LucideIcon> = {
  'what-is-share': PieChart,
  'stocks-vs-funds': Layers,
  'invest-vs-trade': Clock3,
  'price-moves': Activity,
  'losing-money': ShieldAlert,
  'order-types': Target,
  'order-not-filled': Hourglass,
  'app-screens': Smartphone,
  charges: Receipt,
  'order-to-holding': PackageCheck
};

const MAX_TOPICS = 4;
const BUILD_STEPS = ['Matching your goal', 'Choosing hands-on experiences', 'Putting them in the right order'];

export default function QuickStart({
  onComplete,
  onChat,
  onPicksChange
}: {
  onComplete: (picks: QuickPicks) => void;
  onChat: () => void;
  onPicksChange?: (picks: Partial<QuickPicks>) => void;
}) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [level, setLevel] = useState<LevelId | null>(null);
  const [topics, setTopics] = useState<TopicId[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [building, setBuilding] = useState(-1);

  useEffect(() => {
    onPicksChange?.({ goal: goal ?? undefined, level: level ?? undefined, topics });
  }, [goal, level, topics, onPicksChange]);

  // "Building your plan" sequence, then hand over.
  useEffect(() => {
    if (building < 0) return;
    if (building >= BUILD_STEPS.length) {
      onComplete({ goal: goal ?? 'curious', level: level ?? 'none', topics });
      return;
    }
    const t = window.setTimeout(() => setBuilding((b) => b + 1), 520);
    return () => window.clearTimeout(t);
  }, [building, goal, level, topics, onComplete]);

  const pickGoal = (id: GoalId) => {
    setGoal(id);
    if (id !== goal) setTopics([]);
    window.setTimeout(() => setStep(1), 220);
  };
  const pickLevel = (id: LevelId) => {
    setLevel(id);
    window.setTimeout(() => setStep(2), 220);
  };
  const toggleTopic = (id: TopicId) =>
    setTopics((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length >= MAX_TOPICS ? t : [...t, id]));

  const suggested = goal ? SUGGESTED_TOPICS[goal] : [];
  const visibleTopics = showAll ? [...suggested, ...TOPICS.map((t) => t.id).filter((id) => !suggested.includes(id))] : suggested;

  if (building >= 0) {
    return (
      <section className="card grid min-h-[480px] place-items-center px-6 py-14 text-center" aria-live="polite">
        <div className="w-full max-w-xs">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/60" aria-hidden="true" />
            <span className="relative grid h-20 w-20 place-items-center rounded-full bg-brand-500 text-white shadow-lift" aria-hidden="true">
              <Sparkles size={28} />
            </span>
          </div>
          <h2 className="mt-6 text-xl font-bold text-ink">Building your plan</h2>
          <ul className="mt-5 space-y-2.5 text-left">
            {BUILD_STEPS.map((label, i) => (
              <li key={label} className={cx('flex items-center gap-3 text-[14.5px] transition-colors duration-300', i < building ? 'text-ink' : i === building ? 'text-ink-soft' : 'text-ink-faint')}>
                <span
                  className={cx(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full transition-all duration-300',
                    i < building ? 'bg-brand-500 text-white' : 'bg-line text-transparent'
                  )}
                  aria-hidden="true"
                >
                  {i < building ? <Check size={14} className="animate-pop" /> : i === building ? <span className="h-2 w-2 animate-pulse rounded-full bg-ink-faint" /> : null}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden" aria-label="Quick start">
      {/* Progress */}
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6">
        <button
          type="button"
          className={cx('btn-ghost btn-sm -ml-2', step === 0 && 'invisible')}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          aria-label="Back to the previous question"
        >
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </button>
        <div className="flex items-center gap-1.5" aria-label={`Question ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={cx('h-1.5 rounded-full transition-all duration-500', i === step ? 'w-7 bg-brand-500' : i < step ? 'w-3 bg-brand-300' : 'w-3 bg-line')} />
          ))}
        </div>
        <span className="w-[68px] text-right text-xs font-semibold tabular-nums text-ink-muted">{step + 1} of 3</span>
      </div>

      <div className="px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
        {step === 0 && (
          <div key="goal" className="animate-slide-in">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">What brings you here?</h2>
            <p className="mt-1 text-[15px] text-ink-muted">Pick the closest one — you can change it later.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {GOALS.map((g, i) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => pickGoal(g.id)}
                  aria-pressed={goal === g.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={cx(
                    'group flex animate-fade-up items-center gap-4 rounded-2xl border bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lift',
                    goal === g.id ? 'border-brand-500 shadow-glow' : 'border-line hover:border-brand-200'
                  )}
                >
                  <GoalArt id={g.id} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] font-semibold text-ink">{g.title}</span>
                    <span className="mt-0.5 block text-[13.5px] text-ink-muted">{g.text}</span>
                  </span>
                  <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full border transition', goal === g.id ? 'border-brand-500 bg-brand-500 text-white' : 'border-line-strong text-transparent')} aria-hidden="true">
                    <Check size={14} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div key="level" className="animate-slide-in">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">How much have you done before?</h2>
            <p className="mt-1 text-[15px] text-ink-muted">There’s no wrong answer — it just sets the starting point.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {LEVELS.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => pickLevel(l.id)}
                  aria-pressed={level === l.id}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={cx(
                    'group flex animate-fade-up items-center gap-4 rounded-2xl border bg-white p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:flex-col sm:items-start sm:gap-3 sm:p-5',
                    level === l.id ? 'border-brand-500 shadow-glow' : 'border-line hover:border-brand-200'
                  )}
                >
                  <LevelArt id={l.id} />
                  <span>
                    <span className="block text-[15.5px] font-semibold text-ink">{l.title}</span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-muted">{l.text}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="topics" className="animate-slide-in">
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">What would you like to make sense of?</h2>
            <p className="mt-1 text-[15px] text-ink-muted">Choose up to {MAX_TOPICS}. Not sure? Skip this and we’ll start with the basics.</p>
            <div className="mt-6 flex flex-wrap gap-2.5" role="group" aria-label="Topics">
              {visibleTopics.map((id, i) => {
                const topic = TOPICS.find((t) => t.id === id)!;
                const Icon = TOPIC_ICONS[id];
                const on = topics.includes(id);
                const full = !on && topics.length >= MAX_TOPICS;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleTopic(id)}
                    aria-pressed={on}
                    disabled={full}
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    className={cx(
                      'inline-flex min-h-[44px] animate-scale-in items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition duration-200',
                      on ? 'border-brand-500 bg-brand-50 text-brand-900' : 'border-line-strong bg-white text-ink-soft hover:border-brand-300 hover:text-ink',
                      full && 'opacity-40'
                    )}
                  >
                    <span className={cx('grid h-6 w-6 place-items-center rounded-full transition', on ? 'bg-brand-500 text-white' : 'bg-canvas text-ink-muted')} aria-hidden="true">
                      {on ? <Check size={13} /> : <Icon size={13} />}
                    </span>
                    {topic.label}
                  </button>
                );
              })}
              {!showAll && (
                <button type="button" className="inline-flex min-h-[44px] items-center rounded-full px-3 text-[14px] font-semibold text-brand-700 hover:bg-brand-50" onClick={() => setShowAll(true)}>
                  More topics
                </button>
              )}
            </div>
            <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-xs text-ink-muted sm:text-left">{topics.length ? `${topics.length} selected` : 'Nothing selected yet'}</p>
              <button type="button" className="btn-primary h-12 px-6" onClick={() => setBuilding(0)}>
                {topics.length ? 'Build my plan' : 'Start with the basics'} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t border-line bg-canvas/60 px-5 py-3.5 text-center sm:flex-row sm:px-8 sm:text-left">
        <p className="text-[13px] text-ink-muted">Have a specific question in mind?</p>
        <button type="button" className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-700 hover:text-brand-800" onClick={onChat}>
          <MessageCircle size={15} aria-hidden="true" /> Ask the guide in your own words
        </button>
      </div>
    </section>
  );
}
