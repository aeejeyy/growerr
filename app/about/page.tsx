import type { Metadata } from 'next';
import Link from 'next/link';
import PrivacyActions from '../../components/PrivacyActions';
import { GROWW_URL } from '../../lib/onboarding';

export const metadata: Metadata = {
  title: 'Privacy & independence — Growerr',
  description: 'What Growerr asks, where your answers live, and why it is independent from Groww.'
};

const questionNotes = [
  ['Your reason', 'To suggest a useful place to begin.'],
  ['Your timeline', 'To separate short-term savings from long-term investing.'],
  ['When markets dip', 'To reflect how much movement you may be comfortable with.'],
  ['Starting amount', 'To keep the suggested topics realistic. You can skip it.'],
  ['Your experience', 'To choose simpler or more detailed language.'],
  ['What matters most', 'To pick three educational topics worth exploring first.']
];

export default function AboutPage() {
  return (
    <div className="page narrow article about-page">
      <span className="eyebrow">Privacy &amp; independence</span>
      <h1>A simple starting point, with no strings.</h1>
      <p className="lead">
        Growerr is a free, independent onboarding tool. It asks six plain-language questions, shows you a summary,
        and then lets you continue to Groww when you are ready.
      </p>

      <div className="about-callout">
        <div><strong>Independent</strong><span>Not affiliated with Groww.</span></div>
        <div><strong>Onboarding is browser-only</strong><span>Your six answers never reach a server.</span></div>
        <div><strong>Not advice</strong><span>Education, not a recommendation.</span></div>
      </div>

      <h2>What Growerr is</h2>
      <p>
        A short, calm way to turn what you already know about yourself into a clearer starting point. It is not a broker,
        an investment adviser, or a place to buy financial products. It does not open an account, execute trades, or
        collect contact details.
      </p>

      <h2>What we ask — and why</h2>
      <div className="question-notes">
        {questionNotes.map(([label, reason]) => (
          <div key={label}><strong>{label}</strong><span>{reason}</span></div>
        ))}
      </div>

      <h2>What we never ask for</h2>
      <p>
        No name, email address, phone number, PAN, Aadhaar, bank details, broker login, holdings, or income details.
        There is no Growerr account and no mailing list. The starting amount is a broad range and is optional.
      </p>

      <h2>Where your answers live</h2>
      <p>
        Your answers are stored in this browser&apos;s local storage so you can come back to your starting point. They are
        not sent to Growerr, Groww, or anyone else. Another browser or device cannot see them. Clearing this browser&apos;s
        data may remove them, and Groww never receives a copy.
      </p>
      <PrivacyActions />

      <h2>The optional educational guide</h2>
      <p>
        The <Link href="/coach">Guide</Link> is separate from onboarding. It never receives your six onboarding answers. When
        you send a message, that message and the last few turns are posted to Growerr&apos;s coach API. If the AI service
        is configured, they are passed to Gemini to produce that reply; Growerr requests no provider-side storage for
        later retrieval. The conversation is not saved in local storage or by Growerr after you leave the page.
      </p>
      <p>
        If the AI service is not configured, fails, or returns something that cannot be checked against the approved
        education notes, the page shows a clearly labelled built-in educational reply instead. It never pretends a model
        response succeeded. The guide uses a fixed set of SEBI and AMFI education notes, does not browse live product
        pages, and does not claim access to prices, fees, holdings, accounts or broker systems.
      </p>
      <p>
        The guide is for general education only. It does not recommend or rank products, give buy/sell/hold calls,
        estimate returns, or tell you what is suitable for you. For advice about your own situation, speak to a
        SEBI-registered Investment Adviser. Do not paste PAN, Aadhaar, bank or card numbers, OTPs, passwords, or exact
        holdings; the guide clears obvious private details locally before they are sent and asks you not to repeat
        them.
      </p>

      <h2>Independence</h2>
      <p>
        Growerr is an independent educational project. It is not owned by, operated by, endorsed by, or affiliated with
        Groww. The “Continue to Groww” link opens <a href={GROWW_URL} target="_blank" rel="noopener noreferrer">groww.in</a> in a
        new tab. Groww is a separate platform with its own terms of use and privacy policy. Growerr does not earn a
        commission from that link.
      </p>

      <h2>Not investment advice</h2>
      <p>
        The summary and suggested topics are educational. They are not a recommendation to buy, sell, or hold any
        product, and they do not promise a return. Investments can fall as well as rise, and you may get back less than
        you put in. For personal advice, speak to a qualified professional who is registered to give it.
      </p>

      <p className="fine-print">Last updated 22 November 2026.</p>
    </div>
  );
}
