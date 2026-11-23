import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  Clock3,
  FlaskConical,
  Hourglass,
  Layers,
  Lock,
  MessageCircle,
  MousePointerClick,
  PackageCheck,
  PieChart,
  Receipt,
  Route,
  Smartphone,
  Sparkles,
  Target,
  Zap,
  type LucideIcon
} from 'lucide-react';
import { SiteFooter, SiteHeader } from '../components/site/SiteChrome';
import StartCta from '../components/site/StartCta';
import { EXPERIENCES } from '../lib/journey/experiences';
import type { ExperienceId } from '../lib/journey/types';

const LIBRARY_GROUPS: { title: string; text: string; items: { id: ExperienceId; icon: LucideIcon }[] }[] = [
  {
    title: 'Foundations',
    text: 'What you’d actually own, and how it behaves.',
    items: [
      { id: 'EXP-01', icon: PieChart },
      { id: 'EXP-02', icon: Layers },
      { id: 'EXP-03', icon: Clock3 },
      { id: 'EXP-04', icon: Activity }
    ]
  },
  {
    title: 'Placing orders',
    text: 'What really happens when you press “Buy”.',
    items: [
      { id: 'EXP-05', icon: Zap },
      { id: 'EXP-06', icon: Target },
      { id: 'EXP-07', icon: Hourglass },
      { id: 'EXP-10', icon: PackageCheck }
    ]
  },
  {
    title: 'Inside a broker app',
    text: 'The screens and costs you’ll meet first.',
    items: [
      { id: 'EXP-08', icon: Smartphone },
      { id: 'EXP-09', icon: Receipt }
    ]
  }
];

const STEPS = [
  {
    icon: MessageCircle,
    title: 'Tell us what’s on your mind',
    text: 'No forms, no jargon. Describe what got you curious, what confuses you, or what worries you — in your own words.'
  },
  {
    icon: Target,
    title: 'We map what you know',
    text: 'Growerr separates what you say you know from what you show, and spots the ideas that are tripping you up.'
  },
  {
    icon: MousePointerClick,
    title: 'Learn by doing',
    text: 'Interactive simulations — order books, price paths, a practice broker app — with invented numbers and zero risk.'
  },
  {
    icon: Route,
    title: 'It adapts to every answer',
    text: 'Get something wrong? You’ll see it explained differently and try a fresh example. Nothing is “complete” just because you clicked through.'
  }
];

const PRINCIPLES = [
  { icon: Ban, title: 'Never advice', text: 'No stock tips, no fund picks, no “how much to invest”. Growerr explains how things work so you can decide for yourself.' },
  { icon: FlaskConical, title: 'Clearly simulated', text: 'Every number in a simulation is invented and labelled. Nothing is live market data or a prediction.' },
  { icon: Lock, title: 'Your data stays with you', text: 'No sign-up. Your journey is saved only in your browser, and nothing is shared with any broker.' },
  { icon: BadgeCheck, title: 'Understanding over conversion', text: 'You can finish without visiting a broker. The handoff to Groww is optional and never pushed.' }
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_80%_10%,#E6FAF5_0%,rgba(255,255,255,0)_70%)]" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <span className="chip bg-brand-50 text-brand-800 ring-1 ring-brand-100">
                <Sparkles size={12} aria-hidden="true" /> AI-powered adaptive onboarding
              </span>
              <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-tight text-ink sm:text-[56px]">
                Understand investing <span className="text-brand-600">before</span> you put in a rupee.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
                Growerr talks with you about what you want to understand, finds what’s unclear, and builds a personalised set of hands-on
                simulations — so you can open a brokerage app knowing what every button means.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <StartCta className="btn-primary h-12 px-6 text-base" />
                <Link href="#how" className="btn-secondary h-12 px-6 text-base">See how it adapts</Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                {['Free, no sign-up', '10 interactive experiences', 'Never gives investment advice'].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check size={15} className="text-brand-600" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-16 border-y border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow text-brand-700">How it works</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Personalised experiences, not a generic course.</h2>
              <p className="mt-3 text-lg text-ink-soft">The same app, two very different journeys — because it starts from what you actually don’t understand.</p>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="card p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700" aria-hidden="true">
                      <Icon size={19} />
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink-faint">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-14 grid gap-4 lg:grid-cols-2">
              <Persona
                quote="I have ₹5,000 and want to invest, but I don’t understand the difference between stocks and mutual funds."
                found={['New to investing', 'Unsure how products differ', 'May be worried about risk']}
                plan={['EXP-01', 'EXP-02', 'EXP-04']}
              />
              <Persona
                quote="I understand stocks and mutual funds, but I don’t know how limit orders work."
                found={['Knows the products already', 'Specific gap: order execution']}
                plan={['EXP-05', 'EXP-06', 'EXP-07']}
              />
            </div>
          </div>
        </section>

        {/* Library */}
        <section id="library" className="scroll-mt-16">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow text-brand-700">The experience library</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Learn by trying, safely.</h2>
                <p className="mt-3 text-lg text-ink-soft">
                  Each experience is a short simulation followed by questions that check real understanding — including applying it to something new.
                </p>
              </div>
              <Link href="/start" className="btn-secondary shrink-0">Find my starting point <ArrowRight size={16} aria-hidden="true" /></Link>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {LIBRARY_GROUPS.map((group) => (
                <section key={group.title} aria-labelledby={`group-${group.title}`} className="rounded-3xl bg-canvas p-3 ring-1 ring-line">
                  <div className="px-3 pb-3 pt-2">
                    <h3 id={`group-${group.title}`} className="text-[15px] font-semibold text-ink">{group.title}</h3>
                    <p className="text-sm text-ink-muted">{group.text}</p>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map(({ id, icon: Icon }) => {
                      const exp = EXPERIENCES[id];
                      return (
                        <li key={id} className="flex items-start gap-3.5 rounded-2xl bg-white p-4 shadow-card ring-1 ring-line/60">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700" aria-hidden="true">
                            <Icon size={19} />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-baseline justify-between gap-2">
                              <span className="text-[15px] font-semibold text-ink">{exp.title}</span>
                              <span className="shrink-0 text-xs text-ink-faint">{exp.minutes} min</span>
                            </span>
                            <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-muted">{exp.short}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="border-t border-line bg-canvas">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow text-brand-700">Built responsibly</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">An educational companion. Nothing more.</h2>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRINCIPLES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-line">
                  <Icon size={20} className="text-brand-600" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-16 sm:px-6 md:py-24">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
            <h2 className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl">Start with one sentence.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-lg text-white/70">Tell Growerr what you’re trying to understand. It takes it from there.</p>
            <StartCta className="btn relative mt-8 h-12 bg-brand-500 px-7 text-base text-ink hover:bg-brand-400" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Persona({ quote, found, plan }: { quote: string; found: string[]; plan: (keyof typeof EXPERIENCES)[] }) {
  return (
    <figure className="card overflow-hidden">
      <blockquote className="border-b border-line bg-white px-6 py-5">
        <p className="text-[16px] font-medium leading-relaxed text-ink">“{quote}”</p>
      </blockquote>
      <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
        <div>
          <p className="eyebrow">What Growerr notices</p>
          <ul className="mt-2 space-y-1.5">
            {found.map((f) => (
              <li key={f} className="flex gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Their journey</p>
          <ol className="mt-2 space-y-1.5">
            {plan.map((id, i) => (
              <li key={id} className="flex gap-2 text-sm text-ink">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-800" aria-hidden="true">
                  {i + 1}
                </span>
                {EXPERIENCES[id].title}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-brand-100/70 via-white to-accent-50 blur-2xl" />
      <div className="card overflow-hidden shadow-lift">
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-white"><Sparkles size={13} /></span>
          <span className="text-sm font-semibold text-ink">Growerr guide</span>
        </div>
        <div className="space-y-3 px-5 py-5">
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[13.5px] leading-relaxed text-white">
            I placed an order in an app but my shares never showed up?
          </div>
          <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-canvas px-4 py-2.5 text-[13.5px] leading-relaxed text-ink">
            That’s a really common confusion. An order is an instruction — it only becomes a holding once it executes and settles.
          </div>
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 px-3.5 py-2 text-[12.5px] text-ink-soft">
            <span className="font-semibold text-brand-800">Limit order</span> — an order that only executes at your chosen price or better.
          </div>
        </div>
        <div className="border-t border-line bg-canvas/60 px-5 py-4">
          <p className="text-xs font-semibold text-ink">Your plan · adapted to you</p>
          <ul className="mt-2.5 space-y-2">
            {[
              ['Orders vs holdings', 'Matches your question', 'bg-ink text-white'],
              ['Why orders don’t execute', 'Added after your answer', 'bg-accent-50 text-accent-700'],
              ['Inside a broker app', 'You’re new to apps', 'bg-white text-ink-soft ring-1 ring-line']
            ].map(([t, r, c], i) => (
              <li key={t} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 ring-1 ring-line">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${c}`}>{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-ink">{t}</span>
                  <span className="block text-[11.5px] text-ink-muted">{r}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="absolute -right-3 -top-7 hidden rounded-2xl bg-white px-4 py-3 shadow-lift ring-1 ring-line sm:block">
        <p className="text-[11px] font-medium text-ink-muted">Trading mechanics</p>
        <div className="mt-1.5 flex gap-1">
          <span className="h-1.5 w-8 rounded-full bg-brand-500" />
          <span className="h-1.5 w-8 rounded-full bg-brand-500" />
          <span className="h-1.5 w-8 rounded-full bg-line" />
        </div>
        <p className="mt-1 text-[11px] font-semibold text-accent-700">Developing</p>
      </div>
    </div>
  );
}
