import type { Metadata } from 'next';
import Link from 'next/link';
import PrivacyActions from '../../components/PrivacyActions';
import { GROWW_URL, JOURNEY_STORAGE_KEY } from '../../lib/constants';

export const metadata: Metadata = {
  title: 'Privacy & independence — Growerr',
  description: 'How Growerr keeps your adaptive learning journey in the browser, when AI is used, and why it is independent from Groww.'
};

const journeyNotes = [
  ['Your own words', 'To find the learning objective you actually stated, not to judge your circumstances.'],
  ['One short clarification', 'To resolve an ambiguous goal only when more than one path could help.'],
  ['Scenario answers', 'To see which concepts you can explain and where another explanation may help.'],
  ['Progress and review flags', 'To choose the next scenario, revisit an idea, or stop when the journey is complete.']
];

export default function AboutPage() {
  return (
    <div className="page narrow article about-page">
      <span className="eyebrow">Privacy &amp; independence</span>
      <h1>A private learning journey, with no strings.</h1>
      <p className="lead">
        Growerr is a free, independent educational tool. You begin in your own words, work through short hypothetical
        scenarios, and get a learning summary. There is no account and no product recommendation.
      </p>

      <div className="about-callout">
        <div><strong>Independent</strong><span>Not affiliated with Groww.</span></div>
        <div><strong>Journey is browser-only</strong><span>Your profile, progress and summary stay in this browser.</span></div>
        <div><strong>Not advice</strong><span>Education, not a suitability score.</span></div>
      </div>

      <h2>What Growerr is</h2>
      <p>
        A calm way to explore investing and market concepts. It reflects what you say, asks one short optional question
        at a time, then uses interactive scenarios to check understanding. It is not a broker, an investment adviser, or
        a place to buy financial products. It does not open an account, place an order, or collect contact details.
      </p>

      <h2>What you share — and why</h2>
      <div className="question-notes">
        {journeyNotes.map(([label, reason]) => (
          <div key={label}><strong>{label}</strong><span>{reason}</span></div>
        ))}
      </div>
      <p>
        You can answer “Not sure”, “Skip”, or “Prefer not to say” at any discovery step. You can also pause, skip a
        scenario, revisit it later, or start again. A wrong answer only changes the explanation and the next learning
        step; it never becomes a score about you.
      </p>

      <h2>What we never ask for or infer</h2>
      <p>
        No name, email address, phone number, PAN, Aadhaar, bank or card details, OTPs, passwords, broker login, exact
        holdings, income, age, account status, financial readiness, or risk tolerance. Brief answers are not used to
        infer any of those things. If you paste private details, the browser blocks obvious ones before they are sent,
        the text is not used, and you are asked not to repeat it.
      </p>

      <h2>Where your journey lives</h2>
      <p>
        Your discovery conversation, learner profile, scenario progress, review flags and summary are saved under the
        versioned key <code>{JOURNEY_STORAGE_KEY}</code> in this browser&apos;s local storage so you can resume. They are
        not stored by Growerr on a server, are not sent to Groww, and are not visible from another browser or device.
        Clearing this browser&apos;s data removes them.
      </p>
      <PrivacyActions />

      <h2>When AI is used</h2>
      <p>
        Discovery replies and own-words scenario checks are posted to Growerr&apos;s journey API. If the AI service is
        configured, those specific messages and a short recent conversation window are sent to Gemini to produce a
        structured reply; the request asks for no provider-side storage for later retrieval. Your profile, progress,
        summary and saved browser data are not sent to the AI provider.
      </p>
      <p>
        If the service is missing, fails, or returns something unsafe or invalid, the page says so and uses a clearly
        labelled built-in educational path. It never invents a model response. Model output is checked against fixed
        schemas, approved education notes and approved scenario IDs; generated code is never executed.
      </p>
      <p>
        The <Link href="/coach">Guide</Link> is a separate optional Q&amp;A page. It does not receive your journey
        profile or summary. It uses the same fixed SEBI and AMFI education notes and the same honest static fallback.
      </p>

      <h2>Limits of the journey</h2>
      <p>
        All prices and paths in scenarios are invented for learning and are labelled hypothetical. They are not live
        market data, predictions, or returns. Growerr does not recommend, rank or compare securities, funds, ETFs or
        allocations, and it gives no buy, sell or hold calls, suitability labels, forecasts or guarantees. If you ask
        for personalised advice, it explains the boundary, names neutral factors to discuss, and points you to a
        SEBI-registered Investment Adviser.
      </p>

      <h2>Independence</h2>
      <p>
        Growerr is an independent educational project. It is not owned by, operated by, endorsed by, or affiliated with
        Groww. The optional link opens <a href={GROWW_URL} target="_blank" rel="noopener noreferrer">groww.in</a> in a
        new tab. Groww is a separate platform with its own terms and privacy policy. Growerr does not earn a commission
        from that link and does not transfer answers or open accounts.
      </p>

      <h2>Not investment advice</h2>
      <p>
        The journey, summary and explanations are general education. Investments can fall as well as rise, and you may
        get back less than you put in. For advice about your own situation, speak to a SEBI-registered Investment
        Adviser.
      </p>

      <p className="fine-print">Last updated 23 November 2026.</p>
    </div>
  );
}
