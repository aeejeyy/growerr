import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SiteFooter, SiteHeader } from '../../components/site/SiteChrome';
import ClearData from '../../components/site/ClearData';

export const metadata: Metadata = {
  title: 'About & safety — Growerr',
  description: 'How Growerr adapts to you, what it will never do, and how your data is handled.'
};

const ENGINE = [
  ['Intent analyser', 'Understands whether you lean towards investing, trading, exploring or learning an app — and notices when that changes.'],
  ['Knowledge diagnostician', 'Maps what you say across six areas and flags common misunderstandings, keeping “said” separate from “shown”.'],
  ['Journey planner', 'Ranks the experience library against your goal and gaps, adds foundations you need, and tells you why each step is there.'],
  ['Evaluator', 'Checks choices, sorting tasks, simulations and your own-words explanations. AI grading is validated before it counts.'],
  ['Adaptation engine', 'After a wrong answer: a different explanation and a fresh example. If an idea still doesn’t land, a new experience is added to your plan.'],
  ['Safety layer', 'Detects requests for personalised advice and private details, and validates every AI output against approved schemas before showing it.']
];

const NEVER = [
  'Recommend specific stocks, funds or other securities',
  'Tell you to buy, sell or hold, or how much to invest',
  'Promise returns or present simulations as predictions',
  'Label your risk appetite or suitability',
  'Show live prices or claim real market data',
  'Open accounts, place orders or move money',
  'Share your information with Groww or anyone else',
  'Pressure you to start investing or trading'
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-20">
        <p className="eyebrow text-brand-700">About Growerr</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink sm:text-5xl">A companion between curiosity and your first brokerage app.</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Many people want to start investing but don’t know what the products are, how orders work, or what the screens in a broker app mean.
          Growerr starts from your own questions and builds hands-on experiences around the specific things you don’t yet understand.
        </p>

        <section className="mt-14" aria-labelledby="engine">
          <h2 id="engine" className="text-2xl font-bold text-ink">How the adaptive engine works</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2">
            {ENGINE.map(([title, text], i) => (
              <li key={title} className="card p-5">
                <p className="text-xs font-semibold tabular-nums text-ink-faint">0{i + 1}</p>
                <h3 className="mt-1 font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink-muted">
            When the AI service is unavailable, a built-in rule-based guide takes over so the journey always works. All learning content is written
            and reviewed in advance — the AI chooses and evaluates; it doesn’t invent financial facts.
          </p>
        </section>

        <section className="mt-14" aria-labelledby="never">
          <h2 id="never" className="text-2xl font-bold text-ink">What Growerr will never do</h2>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {NEVER.map((n) => (
              <li key={n} className="flex gap-2.5 rounded-xl bg-canvas px-4 py-3 text-[14.5px] text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-loss" aria-hidden="true" /> {n}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Growerr is an educational prototype, not a broker or a SEBI-registered investment adviser. For advice about your own situation, consult a
            SEBI-registered investment adviser. Any commercial use would require appropriate Indian regulatory and legal review.
          </p>
        </section>

        <section id="privacy" className="mt-14 scroll-mt-20" aria-labelledby="privacy-title">
          <h2 id="privacy-title" className="text-2xl font-bold text-ink">Privacy</h2>
          <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-ink-soft">
            <p>There’s no account and no sign-up. Your conversation, profile and progress are stored only in this browser’s local storage so you can pause and resume.</p>
            <p>
              To understand your messages and grade written answers, the text you type is sent from our server to Google’s Gemini API. API keys stay on
              the server. Messages that look like PAN, Aadhaar, bank or card numbers, OTPs or passwords are blocked and never sent.
            </p>
            <p>Groww is an independent company. Following the optional link to Groww opens their website; nothing from Growerr is passed to them.</p>
          </div>
          <div className="mt-6">
            <ClearData />
          </div>
        </section>

        <div className="mt-16 rounded-3xl bg-brand-50 p-8 text-center ring-1 ring-brand-100">
          <h2 className="text-2xl font-bold text-ink">Ready to try it?</h2>
          <p className="mt-2 text-ink-soft">It starts with one sentence about what you want to understand.</p>
          <Link href="/start" className="btn-primary mt-5">Start your journey <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
