import Link from 'next/link';
import { ArrowRight, BadgeCheck, Ban, Check, FlaskConical, Lock, Plus, Quote } from 'lucide-react';
import { SiteFooter, SiteHeader } from '../components/site/SiteChrome';
import StartCta from '../components/site/StartCta';
import HeroDemo from '../components/site/HeroDemo';
import { AdaptVisual, PickVisual, PlanVisual, TryVisual } from '../components/site/HowVisuals';
import ExperienceArt from '../components/art/ExperienceArt';
import { RevealObserver } from '../components/motion';
import { delay } from '../components/reveal';
import { EXPERIENCES } from '../lib/journey/experiences';
import type { ExperienceId } from '../lib/journey/types';

const STEPS = [
  {
    title: 'Tell us where you’re starting',
    text: 'Three quick taps: your goal, your experience, and what feels confusing. Prefer typing? Ask the guide in your own words.',
    visual: <PickVisual />
  },
  {
    title: 'Get a plan made for you',
    text: 'A short path of 3–5 hands-on experiences, in the right order, with a reason for each one.',
    visual: <PlanVisual />
  },
  {
    title: 'Learn by trying it',
    text: 'Move sliders, place practice orders, watch prices change. Every number is invented, so nothing is at risk.',
    visual: <TryVisual />
  },
  {
    title: 'It adapts to every answer',
    text: 'Got something wrong? You’ll see it explained another way, with a fresh example, until it clicks.',
    visual: <AdaptVisual />
  }
];

const LIBRARY: { title: string; text: string; ids: ExperienceId[] }[] = [
  { title: 'Foundations', text: 'What you’d actually own, and how it behaves.', ids: ['EXP-01', 'EXP-02', 'EXP-03', 'EXP-04'] },
  { title: 'Placing orders', text: 'What really happens when you press “Buy”.', ids: ['EXP-05', 'EXP-06', 'EXP-07', 'EXP-10'] },
  { title: 'Inside a broker app', text: 'The screens and costs you’ll meet first.', ids: ['EXP-08', 'EXP-09'] }
];

const PRINCIPLES = [
  { icon: Ban, tone: 'bg-loss-50 text-loss-700', title: 'Never advice', text: 'No stock tips, no fund picks, no “how much to invest”. Just how things work, so you decide.' },
  { icon: FlaskConical, tone: 'bg-warn-50 text-warn-700', title: 'Clearly simulated', text: 'Every number is invented and labelled. Nothing is live market data or a prediction.' },
  { icon: Lock, tone: 'bg-accent-50 text-accent-700', title: 'Your data stays with you', text: 'No sign-up. Progress is saved only in your browser and never shared with a broker.' },
  { icon: BadgeCheck, tone: 'bg-brand-50 text-brand-800', title: 'Understanding first', text: 'You can finish without visiting any broker. The link to Groww at the end is optional.' }
];

const FAQ = [
  ['Is Growerr free? Do I need to sign up?', 'Yes, it’s free and there’s no sign-up. Your progress is saved in this browser only, and you can clear it any time.'],
  ['Will it tell me what to invest in?', 'No. Growerr is an educational tool, not an adviser. It explains how investing and trading work so you can make your own decisions, or ask better questions to a SEBI-registered adviser.'],
  ['Are the prices real?', 'No. Every price, chart and charge in the simulations is invented for learning, and labelled as simulated.'],
  ['How long does it take?', 'Most experiences take 3–5 minutes. A typical plan is 3–5 experiences, and you can pause and come back whenever you like.'],
  ['Is Growerr part of Groww?', 'No. Growerr is independent. At the end you can choose to open Groww (or any broker) — that step is entirely optional.']
] as const;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <RevealObserver />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_85%_0%,#E6FAF5_0%,rgba(255,255,255,0)_70%),radial-gradient(40%_40%_at_0%_100%,#EEF0FF_0%,rgba(255,255,255,0)_70%)]" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_1fr]">
            <div className="animate-fade-up">
              <span className="chip bg-white text-ink-soft shadow-card ring-1 ring-line">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" /> Free · No sign-up · No real money
              </span>
              <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[58px]">
                Learn investing by <span className="relative whitespace-nowrap text-brand-600">doing<Underline /></span>, before you spend a rupee.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                Answer three quick questions. Growerr builds you a short, hands-on plan with safe simulations, explains anything confusing in plain words, and adapts as you learn.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <StartCta className="btn-primary h-12 px-6 text-base shadow-lift" />
                <Link href="#how" className="btn-secondary h-12 px-6 text-base">How it works</Link>
              </div>
              <ul className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6">
                {[
                  ['10', 'hands-on experiences'],
                  ['3 taps', 'to your own plan'],
                  ['0', 'investment advice']
                ].map(([n, t]) => (
                  <li key={t}>
                    <p className="text-2xl font-bold tracking-tight text-ink">{n}</p>
                    <p className="text-[13px] leading-snug text-ink-muted">{t}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-scale-in" style={{ animationDelay: '150ms' }}>
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 border-y border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center" data-reveal>
              <p className="eyebrow text-brand-700">How it works</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">From “I’m confused” to “I get it” in four steps.</h2>
              <p className="mt-3 text-lg text-ink-soft">No lectures and no jargon. You learn by trying things in a safe practice space.</p>
            </div>
            <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <li key={step.title} data-reveal style={delay(i * 110)} className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative flex h-[236px] items-center bg-gradient-to-b from-brand-50/70 to-white px-5">
                    <div className="w-full transition duration-500 group-hover:scale-[1.03]">{step.visual}</div>
                  </div>
                  <div className="flex-1 border-t border-line px-6 pb-6 pt-5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                    <h3 className="mt-3 text-[17px] font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Personas */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow text-brand-700">Personal, not generic</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Two people. Two completely different journeys.</h2>
            <p className="mt-3 text-lg text-ink-soft">Growerr starts from what <em>you</em> don’t understand yet — and skips what you already know.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Persona
              initials="A"
              tone="bg-brand-500"
              name="New to investing"
              quote="I have ₹5,000 and want to invest, but I don’t understand the difference between stocks and mutual funds."
              found={['New to investing', 'Unsure how products differ', 'Worried about risk']}
              plan={['EXP-01', 'EXP-02', 'EXP-04']}
              index={0}
            />
            <Persona
              initials="B"
              tone="bg-accent"
              name="Knows the basics"
              quote="I understand stocks and mutual funds, but I don’t know how limit orders work."
              found={['Already knows the products', 'One clear gap: placing orders']}
              plan={['EXP-05', 'EXP-06', 'EXP-07']}
              index={1}
            />
          </div>
        </section>

        {/* Library */}
        <section id="library" className="scroll-mt-16 border-t border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end" data-reveal>
              <div className="max-w-2xl">
                <p className="eyebrow text-brand-700">What you can learn</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">10 short, hands-on experiences.</h2>
                <p className="mt-3 text-lg text-ink-soft">Each one is a quick simulation followed by a few questions that check you’ve really got it.</p>
              </div>
              <Link href="/start" className="btn-secondary shrink-0">Find my starting point <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="mt-12 space-y-12">
              {LIBRARY.map((group) => (
                <div key={group.title}>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1" data-reveal>
                    <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                    <p className="text-sm text-ink-muted">{group.text}</p>
                  </div>
                  <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {group.ids.map((id, i) => {
                      const exp = EXPERIENCES[id];
                      return (
                        <li key={id} data-reveal style={delay(i * 80)} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                          <div className="p-2 pb-0">
                            <ExperienceArt id={id} className="rounded-xl" />
                          </div>
                          <div className="px-4 pb-4 pt-3">
                            <div className="flex items-baseline justify-between gap-2">
                              <h4 className="text-[15px] font-semibold text-ink">{exp.title}</h4>
                              <span className="shrink-0 text-xs text-ink-faint">{exp.minutes} min</span>
                            </div>
                            <p className="mt-1 text-[13.5px] leading-snug text-ink-muted">{exp.short}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow text-brand-700">Built responsibly</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">A learning companion. Nothing more.</h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map(({ icon: Icon, tone, title, text }, i) => (
              <li key={title} data-reveal style={delay(i * 90)} className="rounded-2xl border border-line bg-white p-6 shadow-card">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`} aria-hidden="true">
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="border-t border-line bg-canvas">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1fr_1.6fr]">
            <div data-reveal>
              <p className="eyebrow text-brand-700">Questions</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Good to know</h2>
              <p className="mt-3 text-lg text-ink-soft">
                Anything else? <Link href="/about" className="link">Read more about Growerr</Link>.
              </p>
            </div>
            <div className="space-y-3" data-reveal style={delay(100)}>
              {FAQ.map(([q, a]) => (
                <details key={q} className="faq rounded-2xl border border-line bg-white px-5 shadow-card transition open:shadow-lift">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 text-[15.5px] font-semibold text-ink">
                    {q}
                    <span className="faq-icon grid h-7 w-7 shrink-0 place-items-center rounded-full bg-canvas text-ink-soft transition-transform duration-300" aria-hidden="true">
                      <Plus size={15} />
                    </span>
                  </summary>
                  <div className="pb-5 pr-10 text-[15px] leading-relaxed text-ink-soft">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 md:py-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-center sm:px-12 sm:py-20" data-reveal>
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-float-slow rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 animate-float rounded-full bg-accent/25 blur-3xl" aria-hidden="true" />
            <div className="relative mx-auto mb-8 flex max-w-sm justify-center gap-3" aria-hidden="true">
              {(['EXP-01', 'EXP-06', 'EXP-08'] as ExperienceId[]).map((id, i) => (
                <div key={id} className={`art-live w-24 overflow-hidden rounded-xl ring-4 ring-white/10 sm:w-28 ${i === 1 ? '-translate-y-2' : 'translate-y-1'}`}>
                  <ExperienceArt id={id} />
                </div>
              ))}
            </div>
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-[42px]">Ready when you are.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-lg text-white/70">Three taps to your own plan. No sign-up, no real money, no pressure.</p>
            <StartCta className="btn relative mt-8 h-12 bg-brand-500 px-7 text-base text-ink hover:bg-brand-400" />
            <ul className="relative mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/60">
              {['Free', 'About 3–5 minutes per step', 'Pause any time'].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-brand-400" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Underline() {
  return (
    <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M2 9 C 50 2, 150 2, 198 7"
        fill="none"
        stroke="#00D09C"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ strokeDasharray: 220, animation: 'art-draw 1.1s 450ms cubic-bezier(.2,.8,.2,1) both' }}
      />
    </svg>
  );
}

function Persona({
  initials,
  tone,
  name,
  quote,
  found,
  plan,
  index
}: {
  initials: string;
  tone: string;
  name: string;
  quote: string;
  found: string[];
  plan: ExperienceId[];
  index: number;
}) {
  return (
    <figure data-reveal style={delay(index * 120)} className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      <blockquote className="relative px-6 pb-5 pt-6">
        <Quote size={28} className="absolute right-5 top-5 text-line" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ${tone}`} aria-hidden="true">
            {initials}
          </span>
          <span className="text-sm font-semibold text-ink-soft">{name}</span>
        </div>
        <p className="mt-4 text-[17px] font-medium leading-relaxed text-ink">“{quote}”</p>
      </blockquote>
      <div className="border-t border-line bg-canvas/60 px-6 py-5">
        <p className="eyebrow">What Growerr notices</p>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {found.map((f) => (
            <li key={f} className="rounded-full bg-white px-3 py-1 text-[13px] text-ink-soft ring-1 ring-line">
              {f}
            </li>
          ))}
        </ul>
        <p className="eyebrow mt-5">Their plan</p>
        <ol className="mt-2.5 grid grid-cols-3 gap-2.5">
          {plan.map((id, i) => (
            <li key={id} className="group">
              <div className="relative overflow-hidden rounded-xl ring-1 ring-line">
                <ExperienceArt id={id} />
                <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-ink shadow-card">{i + 1}</span>
              </div>
              <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-ink">{EXPERIENCES[id].title}</p>
            </li>
          ))}
        </ol>
      </div>
    </figure>
  );
}
