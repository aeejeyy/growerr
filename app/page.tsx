import Link from 'next/link';
import {
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  Lock,
  MessageCircle,
  Pencil,
  Sparkles,
  Sprout,
  Target,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  return (
    <div className="home">
      <section className="hero-wrap">
        <div className="hero-copy">
          <span className="pill"><span className="pill-dot" aria-hidden="true" /> Independent · Free · About 2 minutes</span>
          <h1>Investing makes more sense when it starts with <em>you</em>.</h1>
          <p className="lead">
            Answer six simple questions. Growerr turns them into a clear starting point you can take to Groww — no jargon, no pressure.
          </p>
          <div className="actions">
            <Link href="/start" className="button primary button-large">
              Find my starting point <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <a href="#how" className="button ghost">See how it works</a>
          </div>
          <ul className="trust-list">
            <li><Lock size={15} aria-hidden="true" /> No account or email</li>
            <li><Check size={15} aria-hidden="true" /> Answers stay in your browser</li>
            <li><Clock size={15} aria-hidden="true" /> Takes about 2 minutes</li>
          </ul>
        </div>

        <div className="hero-visual-wrap">
          <p className="sr-only">
            Preview of Growerr onboarding: a simple question, “What brings you to investing?”, with clear answer cards such as “Grow my money”.
          </p>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-glow" />
            <div className="phone-card">
              <div className="phone-top">
                <span className="phone-brand"><Sprout size={16} /> Growerr</span>
                <span className="phone-step">3 of 6</span>
              </div>
              <div className="mini-progress"><span /></div>
              <p className="mini-eyebrow">Your reason</p>
              <p className="mini-question">What brings you to investing?</p>
              <div className="mini-option is-picked">
                <span className="mini-icon"><TrendingUp size={17} /></span>
                <span><strong>Grow my money</strong><small>Over time, with room to learn.</small></span>
                <span className="mini-check"><Check size={13} /></span>
              </div>
              <div className="mini-option">
                <span className="mini-icon"><Target size={17} /></span>
                <span><strong>Save for a goal</strong><small>A trip, a course, a home.</small></span>
              </div>
              <div className="mini-option">
                <span className="mini-icon"><Sprout size={17} /></span>
                <span><strong>Learn by doing</strong><small>Understand before going bigger.</small></span>
              </div>
              <div className="mini-footer">
                <span>Step 3 of 6</span>
                <span className="mini-button">Continue <ArrowRight size={13} /></span>
              </div>
            </div>
            <div className="float-card">
              <span className="float-icon"><Sparkles size={17} /></span>
              <span><strong>Made for beginners</strong><small>Plain language, no jargon.</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="section how" id="how">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Three small steps. No pressure.</h2>
          <p>You do not need to know the difference between a mutual fund and an index fund to begin. That is the point.</p>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><MessageCircle size={20} aria-hidden="true" /></span><span className="how-number">01</span></div>
            <h3>Tell us about you</h3>
            <p>Six one-question screens about your reason, timeline, comfort with risk, experience and what matters most.</p>
          </article>
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><Sparkles size={20} aria-hidden="true" /></span><span className="how-number">02</span></div>
            <h3>See your starting point</h3>
            <p>A plain-language summary of your answers, plus a few educational topics worth exploring first.</p>
          </article>
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><ExternalLink size={20} aria-hidden="true" /></span><span className="how-number">03</span></div>
            <h3>Continue on Groww</h3>
            <p>When you are ready, open Groww to explore account options and beginner guides at your own pace.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="benefits-panel">
          <div className="benefits-copy">
            <span className="eyebrow">Built to be simple</span>
            <h2>Less jargon. More clarity.</h2>
            <p>Most investing products ask you to know the answers before you start. Growerr starts with what you already know.</p>
            <ul className="benefit-list">
              <li><span><Check size={15} aria-hidden="true" /></span><div><strong>One question at a time</strong><small>No long forms, no timers, no pressure.</small></div></li>
              <li><span><Pencil size={15} aria-hidden="true" /></span><div><strong>Change any answer</strong><small>Go back or edit from the summary whenever you like.</small></div></li>
              <li><span><Lock size={15} aria-hidden="true" /></span><div><strong>Nothing leaves your browser</strong><small>No account, no email, and no answers sent to Groww.</small></div></li>
            </ul>
          </div>

          <div className="summary-mock" aria-hidden="true">
            <div className="summary-mock-top">
              <span className="kicker"><Sparkles size={14} /> Your starting point</span>
              <span className="mock-badge">Private</span>
            </div>
            <div className="mock-row"><span>Your reason</span><strong>Learn by doing</strong></div>
            <div className="mock-row"><span>Your timeline</span><strong>7 years or more</strong></div>
            <div className="mock-row"><span>What matters most</span><strong>Understanding as I go</strong></div>
            <div className="mock-topics">
              <span>Explore first</span>
              <p>Investing basics</p>
              <p>How index funds work</p>
              <p>Risk and diversification</p>
            </div>
            <div className="mock-cta">Continue to Groww <ExternalLink size={14} /></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-band">
          <div>
            <span className="eyebrow eyebrow-light">Ready when you are</span>
            <h2>Your first step can be a small one.</h2>
            <p>Six questions, about two minutes, and a starting point you can actually use.</p>
          </div>
          <Link href="/start" className="button light button-large">
            Find my starting point <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <p className="disclaimer">
        Growerr is an independent educational tool. It is not affiliated with Groww and does not provide investment advice.
        Investing carries risk, including the loss of the money you invest.
      </p>
    </div>
  );
}
