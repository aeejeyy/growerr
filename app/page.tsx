import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  Lock,
  MessageCircle,
  Sparkles,
  Sprout
} from 'lucide-react';

export default function Home() {
  return (
    <div className="home">
      <section className="hero-wrap">
        <div className="hero-copy">
          <span className="pill"><span className="pill-dot" aria-hidden="true" /> Independent · Free · Browser-only</span>
          <h1>Investing makes more sense when you learn by <em>doing</em>.</h1>
          <p className="lead">
            Tell Growerr what you are trying to understand. Short, hypothetical scenarios adapt to what you know — no jargon, no pressure, no account.
          </p>
          <div className="actions">
            <Link href="/start" className="button primary button-large">
              Start my journey <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/coach" className="button ghost">
              Ask the guide <MessageCircle size={17} aria-hidden="true" />
            </Link>
            <a href="#how" className="inline-link">See how it works</a>
          </div>
          <ul className="trust-list">
            <li><Lock size={15} aria-hidden="true" /> No account or email</li>
            <li><Check size={15} aria-hidden="true" /> Your journey stays in your browser</li>
            <li><Clock size={15} aria-hidden="true" /> Pause, skip or revisit anytime</li>
          </ul>
          <p className="hero-coach-note">
            Want to talk it through first? The separate educational guide asks one question at a time and never recommends a product.
          </p>
        </div>

        <div className="hero-visual-wrap">
          <p className="sr-only">
            Preview of Growerr: a conversation about what you want to understand, followed by short hypothetical scenarios that adapt as you go.
          </p>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-glow" />
            <div className="phone-card">
              <div className="phone-top">
                <span className="phone-brand"><Sprout size={16} /> Growerr</span>
                <span className="phone-step">Adaptive path</span>
              </div>
              <div className="mini-progress"><span /></div>
              <p className="mini-eyebrow">In your words</p>
              <p className="mini-question">“I want to understand shares and funds.”</p>
              <div className="mini-option is-picked">
                <span className="mini-icon"><MessageCircle size={17} /></span>
                <span><strong>What I heard</strong><small>You are comparing two structures.</small></span>
                <span className="mini-check"><Check size={13} /></span>
              </div>
              <div className="mini-option">
                <span className="mini-icon"><BookOpen size={17} /></span>
                <span><strong>Next scenario</strong><small>Two ways to hold something.</small></span>
              </div>
              <div className="mini-option">
                <span className="mini-icon"><Sparkles size={17} /></span>
                <span><strong>Adapts as you go</strong><small>Wrong answers change the path.</small></span>
              </div>
              <div className="mini-footer">
                <span>Hypothetical examples</span>
                <span className="mini-button">Start <ArrowRight size={13} /></span>
              </div>
            </div>
            <div className="float-card">
              <span className="float-icon"><Lock size={17} /></span>
              <span><strong>Private by design</strong><small>Saved only in this browser.</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="section how" id="how">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>Three small steps. No pressure.</h2>
          <p>You do not need to know the difference between a share and a fund before you begin. That is what the journey is for.</p>
        </div>
        <div className="how-grid">
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><MessageCircle size={20} aria-hidden="true" /></span><span className="how-number">01</span></div>
            <h3>Tell me in your words</h3>
            <p>One short, optional question at a time. “Not sure”, “Skip” and “Prefer not to say” are all fine.</p>
          </article>
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><BookOpen size={20} aria-hidden="true" /></span><span className="how-number">02</span></div>
            <h3>Try a short scenario</h3>
            <p>Make choices, set an invented condition, or explain an idea. Every number is imaginary and labelled as such.</p>
          </article>
          <article className="how-card">
            <div className="how-top"><span className="how-icon"><Sparkles size={20} aria-hidden="true" /></span><span className="how-number">03</span></div>
            <h3>See what you explored</h3>
            <p>Get a learning summary: concepts demonstrated, ideas worth another look, and official education sources.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="benefits-panel">
          <div className="benefits-copy">
            <span className="eyebrow">Built to be calm</span>
            <h2>Less jargon. More clarity.</h2>
            <p>Most investing tools ask you to know the answers before you start. Growerr begins with what you want to understand and checks it with invented examples.</p>
            <ul className="benefit-list">
              <li><span><Check size={15} aria-hidden="true" /></span><div><strong>One question at a time</strong><small>No long forms, no timers, no pressure.</small></div></li>
              <li><span><BookOpen size={15} aria-hidden="true" /></span><div><strong>A wrong answer helps</strong><small>It changes the explanation and the next learning step.</small></div></li>
              <li><span><Lock size={15} aria-hidden="true" /></span><div><strong>Your journey stays local</strong><small>No account, no email, and no answers sent to Groww.</small></div></li>
            </ul>
          </div>

          <div className="summary-mock" aria-hidden="true">
            <div className="summary-mock-top">
              <span className="kicker"><Sparkles size={14} /> Your learning summary</span>
              <span className="mock-badge">Private</span>
            </div>
            <div className="mock-row"><span>Starting objective</span><strong>Shares vs funds</strong></div>
            <div className="mock-row"><span>Journey completed</span><strong>3 of 3 explored</strong></div>
            <div className="mock-row"><span>Concepts demonstrated</span><strong>2</strong></div>
            <div className="mock-topics">
              <span>Worth another look</span>
              <p>Risk and volatility</p>
            </div>
            <div className="mock-cta">Optional: open groww.in <ExternalLink size={14} /></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cta-band">
          <div>
            <span className="eyebrow eyebrow-light">Ready when you are</span>
            <h2>Your first step can be a small one.</h2>
            <p>One conversation, three short scenarios, and a summary you can keep.</p>
          </div>
          <Link href="/start" className="button light button-large">
            Start my journey <ArrowRight size={18} aria-hidden="true" />
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
