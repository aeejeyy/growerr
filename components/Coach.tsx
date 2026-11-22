'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  Info,
  Lock,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import {
  buildStaticReply,
  coachSources,
  detectSensitive,
  type CoachReply,
  type CoachTurn
} from '../lib/education';
import { GROWW_URL } from '../lib/onboarding';

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'guide'; reply: CoachReply; source: 'ai' | 'static' };

const openingPrompts = [
  'I am new to investing',
  'What is a SIP?',
  'I want to save for a goal',
  'Why do fund values move?'
];

const safeReplies = ['Not sure', 'Skip', 'Prefer not to say'];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [status, setStatus] = useState('');
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function send(override?: string) {
    if (loading) return;
    const text = (override ?? draft).trim();
    if (!text) return;

    if (detectSensitive(text)) {
      setWarning('Private details are not accepted here. The text was cleared and was not sent; do not paste it again.');
      setDraft('');
      inputRef.current?.focus();
      return;
    }

    const history: CoachTurn[] = messages.map((message) =>
      message.role === 'user'
        ? { role: 'user', text: message.text }
        : { role: 'guide', text: `${message.reply.reflection} ${message.reply.question}` }
    );

    const userId = nextId.current++;
    setWarning('');
    setDraft('');
    setMessages((current) => [...current, { id: userId, role: 'user', text }]);
    setLoading(true);
    setStatus('The guide is thinking…');

    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      const data = (await response.json()) as { mode?: string; reason?: string; reply?: CoachReply; error?: string };

      if (data.reason === 'sensitive') {
        setMessages((current) => current.filter((message) => message.id !== userId));
        if (data.reply) {
          const reply = data.reply;
          setMessages((current) => [
            ...current,
            { id: nextId.current++, role: 'guide', reply, source: 'static' }
          ]);
        }
        setWarning('Private details were not sent. The text was cleared; do not paste it again.');
        return;
      }

      if (!data.reply) {
        throw new Error('Missing coach reply');
      }

      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'guide',
          reply: data.reply as CoachReply,
          source: data.mode === 'ai' ? 'ai' : 'static'
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          role: 'guide',
          reply: buildStaticReply(text, 'network_error'),
          source: 'static'
        }
      ]);
    } finally {
      setLoading(false);
      setStatus('');
      inputRef.current?.focus();
      window.setTimeout(() => endRef.current?.scrollIntoView({ block: 'nearest' }), 30);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }

  function clearConversation() {
    setMessages([]);
    setDraft('');
    setWarning('');
    setStatus('');
    inputRef.current?.focus();
  }

  return (
    <div className="coach-page">
      <section className="coach-intro">
        <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> Educational orientation guide</span>
        <h1>Talk it through, one question at a time.</h1>
        <p className="lead">
          Say what is on your mind in plain language. The guide reflects your words, explains general ideas from
          approved education sources, and names what is still unknown. It never tells you what to buy, sell or hold.
        </p>
        <div className="coach-boundaries" aria-label="What the guide will and will not do">
          <div><ShieldCheck size={18} aria-hidden="true" /><strong>No recommendations</strong><span>No products, rankings, forecasts or suitability labels.</span></div>
          <div><Info size={18} aria-hidden="true" /><strong>Clear sources</strong><span>General explanations only, with the source shown.</span></div>
          <div><Lock size={18} aria-hidden="true" /><strong>No account access</strong><span>No prices, holdings, fees or broker systems.</span></div>
        </div>
      </section>

      <div className="coach-grid">
        <section className="chat-panel" aria-labelledby="chat-title">
          <div className="chat-header">
            <div>
              <h2 id="chat-title">Your conversation</h2>
              <p>Not sure? “Not sure”, “Skip” and “Prefer not to say” are all fine answers.</p>
            </div>
            <button type="button" className="text-button" onClick={clearConversation} disabled={messages.length === 0}>
              <RotateCcw size={14} aria-hidden="true" /> Clear conversation
            </button>
          </div>

          <div className="chat-transcript" role="log" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <span className="empty-icon" aria-hidden="true"><Sparkles size={22} /></span>
                <h3>Start with one sentence.</h3>
                <p>Pick a prompt or write your own. There is no right way to begin.</p>
                <div className="prompt-grid">
                  {openingPrompts.map((prompt) => (
                    <button key={prompt} type="button" className="prompt-chip" onClick={() => void send(prompt)} disabled={loading}>
                      {prompt} <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.role === 'user' ? (
                  <div className="user-message" key={message.id}>
                    <span className="message-label">You</span>
                    <p>{message.text}</p>
                  </div>
                ) : (
                  <article className="guide-message" key={message.id}>
                    <div className="guide-head">
                      <span className="guide-avatar" aria-hidden="true"><Sparkles size={17} /></span>
                      <div>
                        <strong>Growerr guide</strong>
                        <span className={`source-badge ${message.source}`}>
                          {message.source === 'ai' ? 'AI guide' : 'Static guide'}
                        </span>
                      </div>
                    </div>

                    {message.reply.notice && <p className="reply-notice">{message.reply.notice}</p>}

                    <div className="reply-section">
                      <h4>What I heard</h4>
                      <p>{message.reply.reflection}</p>
                    </div>

                    {message.reply.explanations.length > 0 && (
                      <div className="reply-section">
                        <h4>General education</h4>
                        <div className="explanation-list">
                          {message.reply.explanations.map((explanation) => (
                            <div className="explanation" key={`${explanation.title}-${explanation.sourceUrl}`}>
                              <strong>{explanation.title}</strong>
                              <p>{explanation.text}</p>
                              <a href={explanation.sourceUrl} target="_blank" rel="noopener noreferrer">
                                {explanation.sourceName} <ExternalLink size={12} aria-hidden="true" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="reply-section">
                      <h4>Still unknown</h4>
                      <ul>{message.reply.unknowns.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>

                    <div className="next-question">
                      <h4>Optional next question</h4>
                      <p>{message.reply.question}</p>
                    </div>
                  </article>
                )
              )
            )}
            {loading && (
              <div className="typing-row" aria-live="polite">
                <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>{status || 'Thinking…'}</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {warning && <p className="chat-warning" role="alert">{warning}</p>}

          <form className="chat-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="coach-message">Your message to the guide</label>
            <textarea
              id="coach-message"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="For example: I am new to this and want to understand SIPs."
              rows={2}
              maxLength={1200}
              disabled={loading}
            />
            <button type="submit" className="button primary" disabled={loading || !draft.trim()}>
              Send <Send size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="safe-replies" aria-label="Quick answers">
            <span>Quick answers:</span>
            {safeReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => void send(reply)} disabled={loading}>{reply}</button>
            ))}
          </div>
        </section>

        <aside className="coach-aside">
          <section className="aside-card privacy-card">
            <span className="kicker"><Lock size={14} aria-hidden="true" /> Privacy</span>
            <h2>What gets sent</h2>
            <p>
              Each message and the last few turns go to Growerr&apos;s coach API. If the AI guide is configured, they
              are then sent to the AI provider for that reply. Your six onboarding answers are never included, and the
              conversation is not saved after you leave the page.
            </p>
            <p className="caption">Never paste PAN, Aadhaar, bank or card numbers, OTPs, passwords, or exact holdings.</p>
          </section>

          <section className="aside-card">
            <span className="kicker"><Info size={14} aria-hidden="true" /> Approved sources</span>
            <h2>Where explanations come from</h2>
            <ul className="source-list">
              {coachSources.slice(0, 4).map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.name} <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="caption">The guide uses a small, fixed set of education notes. It does not browse live product pages.</p>
          </section>

          <section className="aside-card groww-aside">
            <span className="kicker">Optional next step</span>
            <h2>Explore Groww yourself</h2>
            <p>When you are ready, Groww is one place to explore account options and beginner guides.</p>
            <a className="button secondary" href={GROWW_URL} target="_blank" rel="noopener noreferrer">
              Open groww.in <ExternalLink size={15} aria-hidden="true" />
            </a>
            <p className="caption">Not a partnership or recommendation. Growerr does not send your answers there or earn a commission.</p>
          </section>

          <Link href="/start" className="aside-link">
            Or take the six-question starting point <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
