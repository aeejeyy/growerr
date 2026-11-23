'use client';

import type { ReactNode } from 'react';
import { FlaskConical, Info } from 'lucide-react';

/** Small helper to join class names. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Mandatory label on every simulated / hypothetical visual. */
export function SimBadge({ children = 'Simulation · invented numbers' }: { children?: ReactNode }) {
  return (
    <span className="chip bg-warn-50 text-warn-700" title="These values are made up for learning. They are not live market data or predictions.">
      <FlaskConical size={12} aria-hidden="true" />
      {children}
    </span>
  );
}

export function Callout({
  tone = 'neutral',
  title,
  children,
  icon
}: {
  tone?: 'neutral' | 'brand' | 'loss' | 'warn' | 'accent';
  title?: ReactNode;
  children: ReactNode;
  icon?: ReactNode;
}) {
  const tones = {
    neutral: 'bg-canvas border-line text-ink-soft',
    brand: 'bg-brand-50 border-brand-100 text-brand-900',
    loss: 'bg-loss-50 border-loss/20 text-loss-700',
    warn: 'bg-warn-50 border-warn/30 text-warn-700',
    accent: 'bg-accent-50 border-accent/20 text-accent-700'
  } as const;
  return (
    <div className={cx('flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed', tones[tone])}>
      <span className="mt-0.5 shrink-0" aria-hidden="true">{icon ?? <Info size={16} />}</span>
      <div className="min-w-0">
        {title && <p className="mb-0.5 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/** Segmented control (radio group semantics). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-xl bg-canvas p-1 ring-1 ring-line">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cx(
              'min-h-[36px] rounded-lg px-3.5 text-sm font-semibold transition',
              active ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stat({ label, value, tone = 'ink', hint }: { label: string; value: ReactNode; tone?: 'ink' | 'brand' | 'loss' | 'accent'; hint?: ReactNode }) {
  const tones = { ink: 'text-ink', brand: 'text-brand-700', loss: 'text-loss-700', accent: 'text-accent-700' } as const;
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={cx('mt-0.5 text-lg font-semibold tabular-nums', tones[tone])}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** Labelled range slider with live value. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
  id
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  id: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink-soft">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-ink">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

export const formatUnits = (value: number, digits = 2) =>
  value.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
