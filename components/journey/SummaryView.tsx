'use client';

import { useState } from 'react';
import { ArrowUpRight, BookOpen, Check, Copy, Download, ExternalLink, GraduationCap, RotateCcw, ShieldCheck, Target, Workflow, X } from 'lucide-react';
import { GROWW_URL } from '../../lib/constants';
import { EXPERIENCES } from '../../lib/journey/experiences';
import { buildSummary, summaryText } from '../../lib/journey/summary';
import type { ExperienceId, JourneyState } from '../../lib/journey/types';
import { PlanList } from './PlanView';
import { cx } from '../ui';
import ExperienceArt from '../art/ExperienceArt';

export default function SummaryView({
  state,
  onRevisit,
  onRestart
}: {
  state: JourneyState;
  onRevisit: (id: ExperienceId) => void;
  onRestart: () => void;
}) {
  const s = buildSummary(state);
  const [copied, setCopied] = useState(false);
  const [handoff, setHandoff] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(summaryText(state));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob([summaryText(state)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'growerr-learning-summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="card animate-scale-in overflow-hidden">
        <div className="relative overflow-hidden bg-ink px-5 py-7 text-white sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
          <span className="chip bg-white/10 text-brand-200">
            <GraduationCap size={12} aria-hidden="true" /> Learning summary
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Here’s what you’ve built up.</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">
            <span className="text-white/90">You came wanting to understand:</span> {s.objective}
          </p>
          <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
            <Metric label="Demonstrated" value={s.stats.done} />
            <Metric label="To revisit" value={s.stats.review} />
            <Metric label="Concepts shown" value={s.conceptsDemonstrated.length} />
          </dl>
          {state.plan.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-3" aria-label="Your experiences">
              {state.plan.map((item, i) => (
                <li key={item.id} className="relative w-24 animate-pop sm:w-28" style={{ animationDelay: `${200 + i * 90}ms` }} title={EXPERIENCES[item.id].title}>
                  <div className={cx('overflow-hidden rounded-xl ring-2', item.status === 'demonstrated' ? 'ring-brand-400' : 'opacity-50 ring-white/10 grayscale')}>
                    <ExperienceArt id={item.id} />
                  </div>
                  {item.status === 'demonstrated' && (
                    <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand-500 text-white ring-2 ring-ink" aria-hidden="true">
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                  <span className="sr-only">{EXPERIENCES[item.id].title}: {item.status === 'demonstrated' ? 'demonstrated' : 'not yet demonstrated'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel icon={<Target size={16} />} title="Your journey">
          <PlanList state={state} onOpen={onRevisit} compact />
          <p className="mt-2 text-xs text-ink-muted">Tap any experience to revisit it.</p>
        </Panel>

        <Panel icon={<Check size={16} />} title="Concepts you demonstrated">
          {s.conceptsDemonstrated.length > 0 ? (
            <ul className="space-y-1.5">
              {s.conceptsDemonstrated.map((c) => (
                <li key={c} className="flex gap-2 text-[14px] text-ink">
                  <Check size={15} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" /> {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">None yet — answer the checks inside an experience to demonstrate a concept.</p>
          )}
          {s.misconceptionsResolved.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="eyebrow mb-1.5">Misunderstandings you cleared up</p>
              <ul className="space-y-1">
                {s.misconceptionsResolved.map((m) => (
                  <li key={m} className="text-[13px] text-ink-muted line-through decoration-ink-faint">“{m}”</li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel icon={<BookOpen size={16} />} title="Worth learning next">
          {s.furtherLearning.length > 0 ? (
            <ul className="space-y-2">
              {s.furtherLearning.map((f) => (
                <li key={f.label} className="flex items-start justify-between gap-3 text-[14px] text-ink-soft">
                  <span>{f.label}</span>
                  {f.experience && (
                    <button type="button" className="btn-ghost btn-sm shrink-0 px-2 text-brand-700" onClick={() => onRevisit(f.experience as ExperienceId)}>
                      Open
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Nothing flagged. Explore more of the library whenever you like.</p>
          )}
          {s.conceptsExplored.length > s.conceptsDemonstrated.length && (
            <p className="mt-3 text-xs text-ink-muted">Explored but not yet demonstrated: {s.conceptsExplored.filter((c) => !s.conceptsDemonstrated.includes(c)).join(', ')}.</p>
          )}
        </Panel>

        <Panel icon={<Workflow size={16} />} title="Brokerage workflows you practised">
          {s.workflows.length > 0 ? (
            <ul className="space-y-1.5">
              {s.workflows.map((w) => (
                <li key={w} className="flex gap-2 text-[14px] text-ink-soft">
                  <Check size={15} className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" /> {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              None yet. Try “{EXPERIENCES['EXP-08'].title}” or “{EXPERIENCES['EXP-10'].title}” to practise app workflows safely.
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">All practice was simulated with invented numbers — nothing was sent anywhere.</p>
        </Panel>
      </div>

      {s.sources.length > 0 && (
        <Panel icon={<ShieldCheck size={16} />} title="Official educational resources">
          <ul className="grid gap-2 sm:grid-cols-2">
            {s.sources.map((src) => (
              <li key={src.url}>
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 rounded-xl border border-line p-3 text-[13.5px] leading-snug text-ink-soft transition hover:border-brand-300">
                  <ExternalLink size={14} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
                  {src.name}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <section className="card overflow-hidden" aria-labelledby="handoff-title">
        <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Optional next step</p>
            <h2 id="handoff-title" className="mt-1 text-xl font-bold text-ink">Ready to look at a real brokerage app?</h2>
            <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              If and when you want to, you can continue to Groww to explore its app and open an account. There’s no rush —
              you can also stop here, or keep learning.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
            <button type="button" className="btn-primary" onClick={() => setHandoff(true)}>
              Continue to Groww <ArrowUpRight size={16} aria-hidden="true" />
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={copy}>
                <Copy size={15} aria-hidden="true" /> {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={download}>
                <Download size={15} aria-hidden="true" /> Save
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button type="button" className="btn-ghost btn-sm" onClick={onRestart}>
          <RotateCcw size={14} aria-hidden="true" /> Start a new journey
        </button>
      </div>

      {handoff && <HandoffDialog onClose={() => setHandoff(false)} />}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
      <dd className="text-2xl font-bold tabular-nums">{value}</dd>
      <dt className="text-[11px] font-medium text-white/60">{label}</dt>
    </div>
  );
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold text-ink">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-50 text-brand-700" aria-hidden="true">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function HandoffDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="handoff-dialog-title" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="w-full max-w-lg animate-fade-up rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <h2 id="handoff-dialog-title" className="text-lg font-bold text-ink">Before you go to Groww</h2>
          <button type="button" className="btn-ghost btn-sm -mr-2 -mt-1 px-2" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <ul className={cx('mt-4 space-y-3 text-[14.5px] leading-relaxed text-ink-soft')}>
          <li className="flex gap-2.5"><Dot />You’ll open groww.in in a new tab. Growerr is independent and isn’t partnered with or endorsed by Groww.</li>
          <li className="flex gap-2.5"><Dot />Nothing from Growerr — your chat, profile or summary — is shared with Groww.</li>
          <li className="flex gap-2.5"><Dot />Opening a real account involves KYC on their side (typically identity, address and bank verification). Read their terms, charges and privacy policy.</li>
          <li className="flex gap-2.5"><Dot />There’s no need to invest or trade right away. Real orders use real money and can lose value.</li>
        </ul>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose} autoFocus>Stay here</button>
          <a href={GROWW_URL} target="_blank" rel="noopener noreferrer" className="btn-primary" onClick={onClose}>
            Open groww.in <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}

function Dot() {
  return <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />;
}
