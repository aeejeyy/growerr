'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUp, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { detectSensitive } from '../../lib/education';
import { INTENT_LABELS } from './labels';
import type { JourneyState } from '../../lib/journey/types';
import { cx } from '../ui';

const STARTERS = [
  'I have ₹5,000 and want to invest, but I don’t understand the difference between stocks and mutual funds.',
  'I understand stocks and mutual funds, but I don’t know how limit orders work.',
  'I downloaded a trading app and I’m lost — what are holdings, orders and funds?',
  'I want to start but I’m scared of losing money.'
];

export default function DiscoveryChat({
  state,
  onSend,
  onBuildPlan,
  busy
}: {
  state: JourneyState;
  onSend: (text: string) => Promise<void>;
  onBuildPlan: () => void;
  busy: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [warning, setWarning] = useState('');
  const [slow, setSlow] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userTurns = state.messages.filter((m) => m.role === 'user').length;
  const canPlan = userTurns > 0 && state.intent !== 'unclear';
  const last = state.messages[state.messages.length - 1];
  const awaitingAnswer = userTurns > 0 && last?.role === 'guide' && last.text.trim().endsWith('?');

  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), 4000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages.length, busy]);

  async function submit(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    if (detectSensitive(value)) {
      setWarning('That looks like a personal or account number. Please remove it — I never need PAN, Aadhaar, bank details, OTPs or passwords.');
      return;
    }
    setWarning('');
    setDraft('');
    await onSend(value);
    inputRef.current?.focus();
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submit(draft);
  }

  return (
    <section className="card flex min-h-[560px] flex-col overflow-hidden" aria-label="Conversation">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-500 text-white" aria-hidden="true">
            <Sparkles size={16} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Growerr guide</p>
            <p className="text-xs text-ink-muted">
              {state.aiMode === 'static' ? 'Built-in guide (AI unavailable right now)' : 'Educational only · never gives advice'}
            </p>
          </div>
        </div>
        {state.intent !== 'unclear' && (
          <span className="chip hidden bg-brand-50 text-brand-800 sm:inline-flex">Focus: {INTENT_LABELS[state.intent]}</span>
        )}
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-live="polite" aria-relevant="additions">
        {state.messages.map((m) => (
          <div key={m.id} className={cx('flex animate-fade-up', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cx('max-w-[88%] sm:max-w-[78%]', m.role === 'user' && 'items-end')}>
              <div
                className={cx(
                  'rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
                  m.role === 'user' ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-canvas text-ink'
                )}
              >
                <span className="sr-only">{m.role === 'user' ? 'You said: ' : 'Guide: '}</span>
                {m.text}
              </div>
              {m.terms && m.terms.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {m.terms.map((t) => (
                    <div key={t.term} className="rounded-xl border border-brand-100 bg-brand-50/60 px-3.5 py-2 text-[13px] leading-snug text-ink-soft">
                      <span className="font-semibold text-brand-800">{t.term}</span> — {t.meaning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start" aria-label="Guide is typing">
            <div className="flex items-center gap-3 rounded-2xl rounded-bl-md bg-canvas px-4 py-3.5">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-pulse-dot rounded-full bg-ink-faint" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              {slow && <span className="text-xs text-ink-muted" aria-live="polite">Thinking it through — this can take a few seconds…</span>}
            </div>
          </div>
        )}

        {userTurns === 0 && !busy && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-ink-muted">Not sure how to put it? Start from one of these:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-xl border border-line bg-white px-3.5 py-3 text-left text-[13.5px] leading-snug text-ink-soft transition hover:border-brand-300 hover:bg-brand-50/40 hover:text-ink"
                  onClick={() => submit(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {canPlan && !busy && (
          <div className={cx('animate-fade-up rounded-2xl border p-4 sm:p-5', state.readyToPlan ? 'border-brand-200 bg-brand-50' : 'border-line bg-white')}>
            <p className="text-sm font-semibold text-ink">{state.readyToPlan ? 'I have a good picture of what you need.' : 'Ready when you are.'}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {state.readyToPlan
                ? 'I’ll turn this into a short, personalised set of interactive experiences. You can keep chatting to refine it.'
                : 'You can keep telling me more, or I can build a first plan now and adapt it as you go.'}
            </p>
            <button type="button" className={cx('mt-3', state.readyToPlan ? 'btn-primary' : 'btn-secondary')} onClick={onBuildPlan}>
              Build my learning plan <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="border-t border-line bg-white px-4 py-3 sm:px-6 sm:py-4">
        {awaitingAnswer && !busy && (
          <div className="mb-2.5 flex flex-wrap gap-1.5" aria-label="Quick replies">
            {['Not sure', 'I’d rather not say'].map((q) => (
              <button key={q} type="button" className="min-h-[32px] rounded-full border border-line-strong bg-white px-3 text-[13px] font-medium text-ink-soft transition hover:border-brand-300 hover:text-ink" onClick={() => submit(q)}>
                {q}
              </button>
            ))}
          </div>
        )}
        {warning && (
          <p role="alert" className="mb-2 flex items-start gap-2 rounded-lg bg-loss-50 px-3 py-2 text-sm text-loss-700">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {warning}
          </p>
        )}
        <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-white p-1.5 pl-4 focus-within:border-brand-500 focus-within:shadow-glow">
          <label htmlFor="discovery-input" className="sr-only">Your message</label>
          <textarea
            id="discovery-input"
            ref={inputRef}
            rows={1}
            value={draft}
            maxLength={1000}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            placeholder={userTurns === 0 ? 'e.g. My friends talk about SIPs and I want to understand…' : 'Type your reply…'}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none"
          />
          <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40" disabled={!draft.trim() || busy} aria-label="Send">
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Lock size={11} aria-hidden="true" /> Saved only in this browser. Don’t share account numbers or passwords.
        </p>
      </form>
    </section>
  );
}
