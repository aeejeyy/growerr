'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Flag,
  Lock,
  MessageCircle,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  StepForward
} from 'lucide-react';
import { detectSensitive } from '../lib/education';
import { GROWW_URL, JOURNEY_STORAGE_KEY } from '../lib/constants';
import { buildStaticDiscoveryReply } from '../lib/journey/discovery';
import {
  advanceJourney,
  applyStepFeedback,
  journeyProgress,
  pauseJourney,
  resumeJourney,
  revisitScenario,
  skipScenario,
  startJourney
} from '../lib/journey/engine';
import { staticEvaluateStep } from '../lib/journey/evaluation';
import { getScenario } from '../lib/journey/scenarios';
import { applyDiscoveryReply, createInitialState, sanitizeJourneyState } from '../lib/journey/storage';
import { buildJourneySummary, journeySummaryText } from '../lib/journey/summary';
import type { CoachTurn, DiscoveryReply, EvaluationResult, JourneyState } from '../lib/journey/types';

const quickReplies = ['Not sure', 'Skip', 'Prefer not to say'];

function safeDate(at: string): string {
  const date = new Date(at);
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Journey() {
  const [state, setState] = useState<JourneyState | null>(null);
  const [draft, setDraft] = useState('');
  const [answer, setAnswer] = useState<string | number>('');
  const [feedback, setFeedback] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState('');
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState('');
  const loaded = useRef(false);
  const nextId = useRef(2);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let initial = createInitialState();
    try {
      const saved = window.localStorage.getItem(JOURNEY_STORAGE_KEY);
      if (saved) initial = sanitizeJourneyState(JSON.parse(saved)) ?? initial;
    } catch {
      // Browser storage may be unavailable; the journey still works in memory.
    }
    nextId.current = initial.messages.reduce((max, item) => Math.max(max, item.id + 1), 2);
    setState(initial);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!state || !loaded.current) return;
    try {
      window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Progress still works in memory when storage is blocked.
    }
  }, [state]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [state?.phase, state?.currentScenarioId, state?.status]);

  useEffect(() => {
    if (!state) return;
    document.title = state.phase === 'summary'
      ? 'Your learning summary — Growerr'
      : state.phase === 'scenario'
        ? 'Your learning journey — Growerr'
        : 'Start your journey — Growerr';
  }, [state]);

  const scenario = useMemo(() => getScenario(state?.currentScenarioId), [state?.currentScenarioId]);
  const step = scenario?.steps[state?.stepIndex ?? 0] ?? null;
  const progress = state ? journeyProgress(state) : { explored: 0, demonstrated: 0, needsReview: 0, skipped: 0, total: 3, percent: 0 };
  const summary = state ? buildJourneySummary(state) : null;

  useEffect(() => {
    if (!step) return;
    setAnswer(step.kind === 'condition' ? step.baseValue : '');
    setFeedback(null);
  }, [step]);

  function update(mutator: (current: JourneyState) => JourneyState) {
    setState((current) => current ? mutator(current) : current);
  }

  function recordReply(reply: DiscoveryReply) {
    update((current) => applyDiscoveryReply(current, reply));
  }

  async function send(override?: string) {
    if (!state || loading || state.status === 'paused') return;
    const text = (override ?? draft).trim();
    if (!text) return;

    if (detectSensitive(text)) {
      setWarning('Private details are not accepted here. The text was cleared and was not sent; do not paste it again.');
      setDraft('');
      inputRef.current?.focus();
      return;
    }

    const history: CoachTurn[] = state.messages.map((message) => ({
      role: message.role,
      text: message.reply
        ? `${message.reply.reflection} ${message.reply.question}`
        : message.text
    }));
    const userId = nextId.current++;
    setWarning('');
    setDraft('');
    setLoading(true);
    setStatus('The guide is thinking…');
    update((current) => ({
      ...current,
      messages: [...current.messages, { id: userId, role: 'user', text, at: new Date().toISOString() }]
    }));

    try {
      const response = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: 'discovery', message: text, history })
      });
      const data = (await response.json()) as {
        mode?: string;
        reason?: string;
        reply?: DiscoveryReply;
        error?: string;
      };
      if (!data.reply) throw new Error('Missing discovery reply');
      const reply = data.reply;
      if (data.reason === 'sensitive') {
        update((current) => ({
          ...current,
          messages: current.messages.filter((message) => message.id !== userId)
        }));
        setWarning('That text was not used. Please continue without private details.');
        return;
      }
      update((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            id: nextId.current++,
            role: 'guide',
            text: `${reply.reflection} ${reply.question}`,
            source: data.mode === 'ai' ? 'ai' : 'static',
            reply,
            at: new Date().toISOString()
          }
        ]
      }));
      if (data.reason !== 'advice_boundary') recordReply(reply);
    } catch {
      const reply = buildStaticDiscoveryReply(text, 'network_error');
      update((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            id: nextId.current++,
            role: 'guide',
            text: `${reply.reflection} ${reply.question}`,
            source: 'static',
            reply,
            at: new Date().toISOString()
          }
        ]
      }));
      recordReply(reply);
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

  function canStart() {
    return Boolean(state?.messages.some((message) => message.role === 'user'));
  }

  function begin() {
    if (!canStart()) return;
    update((current) => {
      if (current.currentScenarioId) return { ...current, phase: 'scenario', status: 'active' };
      const queued = current.queue[0];
      if (queued) {
        return {
          ...current,
          phase: 'scenario',
          status: 'active',
          currentScenarioId: queued,
          queue: current.queue.slice(1),
          visited: [...new Set([...current.visited, queued])],
          attempts: { ...current.attempts, [queued]: current.attempts[queued] ?? { scenarioId: queued, result: 'in-progress' as const, reviewCount: 0, stepResults: {}, reviewSteps: [], answers: {}, feedback: [], updatedAt: new Date().toISOString() } }
        };
      }
      return startJourney(current);
    });
    setCopied('');
  }

  function chooseAnswer(value: string | number) {
    setAnswer(value);
    setFeedback(null);
    update((current) => ({
      ...current,
      answers: step ? { ...current.answers, [step.id]: value } : current.answers
    }));
  }

  async function checkAnswer() {
    if (!state || !scenario || !step || loading || state.status === 'paused') return;
    if ((step.kind === 'choice' || step.kind === 'reflection') && typeof answer === 'string' && !answer.trim()) return;
    if (detectSensitive(typeof answer === 'string' ? answer : String(answer))) {
      setWarning('Private details are not accepted here. Clear the answer and try again.');
      return;
    }

    setWarning('');
    setLoading(true);
    setStatus('Checking your answer…');
    try {
      const response = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 'evaluate',
          scenarioId: scenario.id,
          stepId: step.id,
          answer
        })
      });
      const data = (await response.json()) as { result?: EvaluationResult; error?: string };
      const result = data.result ?? staticEvaluateStep(step, answer);
      update((current) => applyStepFeedback(current, result));
      setFeedback(result);
    } catch {
      const result = staticEvaluateStep(step, answer);
      update((current) => applyStepFeedback(current, result));
      setFeedback(result);
    } finally {
      setLoading(false);
      setStatus('');
    }
  }

  function continueScenario() {
    if (!state || !scenario || !feedback) return;
    if (state.stepIndex < scenario.steps.length - 1) {
      update((current) => ({ ...current, stepIndex: current.stepIndex + 1, lastEvaluation: feedback }));
      setFeedback(null);
      return;
    }
    update((current) => advanceJourney(current, feedback));
    setFeedback(null);
  }

  function startOver() {
    try {
      window.localStorage.removeItem(JOURNEY_STORAGE_KEY);
    } catch {
      // Nothing to clear when storage is blocked.
    }
    const fresh = createInitialState();
    setState(fresh);
    setDraft('');
    setAnswer('');
    setFeedback(null);
    setWarning('');
    setCopied('');
  }

  async function copySummary() {
    if (!state || state.phase !== 'summary') return;
    try {
      await navigator.clipboard.writeText(journeySummaryText(state));
      setCopied('Your learning summary was copied to the clipboard.');
    } catch {
      setCopied('Copy did not work in this browser. You can still read the summary below.');
    }
  }

  if (!state) {
    return <div className="journey-shell" aria-busy="true" />;
  }

  const phaseLabel = state.phase === 'discovery' ? 'Discovery' : state.phase === 'scenario' ? 'Learning scenarios' : 'Summary';

  return (
    <div className="journey-shell">
      <div className="journey-progress">
        <div className="progress-meta">
          <span>{phaseLabel}</span>
          <span>{progress.explored} of {progress.total} explored</span>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
        {state.status === 'paused' && <p className="paused-note">Paused in this browser. Resume when you are ready.</p>}
        <button
          type="button"
          className="text-button pause-toggle"
          onClick={() => update((current) => current.status === 'paused' ? resumeJourney(current) : pauseJourney(current))}
        >
          {state.status === 'paused' ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {state.status === 'paused' ? 'Resume journey' : 'Pause journey'}
        </button>
      </div>

      {state.phase === 'discovery' && (
        <section className="journey-card" aria-labelledby="journey-title">
          <div className="journey-heading">
            <span className="eyebrow"><Sparkles size={14} aria-hidden="true" /> Conversational discovery</span>
            <h1 id="journey-title" ref={headingRef} tabIndex={-1}>Start with your own words.</h1>
            <p className="lead">
              Tell me what got you interested in investing. You don’t need to know any financial terms. One short
              question at a time, and you can skip anything you do not want to answer.
            </p>
          </div>

          <div className="journey-conversation" role="log" aria-live="polite" aria-relevant="additions">
            {state.messages.map((message) => message.role === 'user' ? (
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
                    <span className={`source-badge ${message.source ?? 'static'}`}>
                      {message.source === 'ai' ? 'AI guide' : 'Static guide'}
                    </span>
                    {safeDate(message.at) && <span className="message-time">{safeDate(message.at)}</span>}
                  </div>
                </div>
                {message.reply ? (
                  <>
                    {message.reply.notice && <p className="reply-notice">{message.reply.notice}</p>}
                    <div className="reply-section"><h4>What I heard</h4><p>{message.reply.reflection}</p></div>
                    {message.reply.explanations.length > 0 && (
                      <div className="reply-section">
                        <h4>General education</h4>
                        <div className="explanation-list">
                          {message.reply.explanations.map((item) => (
                            <div className="explanation" key={`${item.title}-${item.sourceUrl}`}>
                              <strong>{item.title}</strong>
                              <p>{item.text}</p>
                              <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                                {item.sourceName} <ExternalLink size={12} aria-hidden="true" />
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
                    <div className="next-question"><h4>Optional next question</h4><p>{message.reply.question}</p></div>
                  </>
                ) : <p className="opening-message">{message.text}</p>}
              </article>
            ))}
            {loading && (
              <div className="typing-row" aria-live="polite">
                <span className="typing-dots" aria-hidden="true"><i /><i /><i /></span>
                <span>{status || 'Thinking…'}</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {warning && <p className="journey-warning" role="alert">{warning}</p>}

          <form className="journey-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="journey-message">Your message</label>
            <textarea
              id="journey-message"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="For example: I want to understand the difference between stocks and mutual funds."
              rows={3}
              maxLength={1200}
              disabled={loading || state.status === 'paused'}
            />
            <button type="submit" className="button primary" disabled={loading || !draft.trim() || state.status === 'paused'}>
              Send <Send size={16} aria-hidden="true" />
            </button>
          </form>

          <div className="journey-quick" aria-label="Quick answers">
            <span>Quick answers:</span>
            {quickReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => void send(reply)} disabled={loading || state.status === 'paused'}>{reply}</button>
            ))}
          </div>

          <div className="journey-next">
            <p>Ready when you are. You can keep talking or start the first interactive scenario.</p>
            <button type="button" className="button secondary" onClick={begin} disabled={!canStart() || loading || state.status === 'paused'}>
              Build my first scenario <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {state.phase === 'scenario' && scenario && step && (
        <section className="journey-card scenario-card" aria-labelledby="scenario-title">
          <div className="scenario-header">
            <div>
              <span className="eyebrow"><BookOpen size={14} aria-hidden="true" /> {scenario.id} · Hypothetical scenario</span>
              <h1 id="scenario-title" ref={headingRef} tabIndex={-1}>{scenario.title}</h1>
              <p>{scenario.objective}</p>
            </div>
          </div>
          <p className="scenario-context"><ShieldCheck size={14} aria-hidden="true" /> {scenario.context}</p>

          {state.status === 'paused' ? (
            <div className="paused-panel">
              <h2>Take a break.</h2>
              <p>Your answers are saved in this browser. Nothing is sent to a broker, and no account is opened.</p>
              <button type="button" className="button primary" onClick={() => update(resumeJourney)}>
                <Play size={16} aria-hidden="true" /> Resume
              </button>
            </div>
          ) : (
            <>
              <div className="scenario-step" key={step.id}>
                <div className="step-count">Step {state.stepIndex + 1} of {scenario.steps.length}</div>
                <h2>{step.prompt}</h2>
                <p className="step-help">{step.help}</p>

                {step.kind === 'choice' && (
                  <fieldset className="scenario-options">
                    <legend className="sr-only">Choose one answer</legend>
                    {step.options.map((option) => (
                      <label className={`scenario-option${answer === option.id ? ' is-selected' : ''}`} key={option.id}>
                        <input
                          type="radio"
                          name={step.id}
                          value={option.id}
                          checked={answer === option.id}
                          onChange={() => chooseAnswer(option.id)}
                        />
                        <span>{option.label}</span>
                        {answer === option.id && <Check size={15} aria-hidden="true" />}
                      </label>
                    ))}
                  </fieldset>
                )}

                {step.kind === 'reflection' && (
                  <div className="reflection-field">
                    <label className="sr-only" htmlFor="reflection-answer">Your answer in your own words</label>
                    <textarea
                      id="reflection-answer"
                      value={typeof answer === 'string' ? answer : ''}
                      onChange={(event) => chooseAnswer(event.target.value)}
                      rows={4}
                      maxLength={800}
                      placeholder="Write one short sentence."
                    />
                    <span className="caption">No product names, amounts or predictions needed.</span>
                  </div>
                )}

                {step.kind === 'condition' && (
                  <div className="condition-field">
                    <label htmlFor="condition-answer">
                      Invented quote: {step.baseValue} {step.unit}. Set your condition:
                      <strong> {typeof answer === 'number' ? answer : step.baseValue}</strong>
                    </label>
                    <input
                      id="condition-answer"
                      type="range"
                      min={step.min}
                      max={step.max}
                      step={step.step}
                      value={typeof answer === 'number' ? answer : step.baseValue}
                      onChange={(event) => chooseAnswer(Number(event.target.value))}
                    />
                    <p className="caption">This is a learning control only. Nothing is placed with a broker.</p>
                  </div>
                )}

                {!feedback && (
                  <button
                    type="button"
                    className="button primary"
                    onClick={() => void checkAnswer()}
                    disabled={loading || answer === ''}
                  >
                    Check answer <ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
              </div>

              {feedback && (
                <div className={`scenario-feedback${feedback.correct ? ' is-correct' : ''}`} role="status">
                  <h3>{feedback.correct ? 'You captured the idea.' : 'Let’s look again.'}</h3>
                  <ul>{feedback.feedback.map((item) => <li key={item}>{item}</li>)}</ul>
                  {feedback.notice && <p className="caption">{feedback.notice}</p>}
                  <button type="button" className="button secondary" onClick={continueScenario}>
                    {state.stepIndex < scenario.steps.length - 1 ? 'Next step' : 'See what comes next'} <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}

          <div className="scenario-controls">
            <button type="button" className="text-button" onClick={() => update(skipScenario)}>
              <StepForward size={14} aria-hidden="true" /> Skip this scenario
            </button>
            <button type="button" className="text-button" onClick={() => update((current) => ({ ...current, phase: 'discovery' }))}>
              <ArrowLeft size={14} aria-hidden="true" /> Back to conversation
            </button>
          </div>

          {state.visited.length > 0 && (
            <div className="revisit-row" aria-label="Revisit a scenario">
              <span>Revisit:</span>
              {state.visited.map((id) => {
                const item = getScenario(id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className={id === scenario.id ? 'is-current' : ''}
                    onClick={() => update((current) => revisitScenario(current, id))}
                  >
                    {item.title}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {state.phase === 'summary' && summary && (
        <section className="journey-card summary-card" aria-labelledby="summary-title">
          <div className="journey-heading">
            <span className="eyebrow"><Flag size={14} aria-hidden="true" /> Learning summary</span>
            <h1 id="summary-title" ref={headingRef} tabIndex={-1}>Here is what you explored.</h1>
            <p className="lead">This is a record of learning, not a suitability score or a prediction. You can keep going, revisit a topic, or stop here.</p>
            <span className="saved-note"><Lock size={14} aria-hidden="true" /> Saved only in this browser</span>
          </div>

          <div className="summary-facts">
            <div><span>Original objective</span><strong>{summary.objective}</strong></div>
            <div><span>Learning focus</span><strong>{summary.intentLabel}</strong></div>
            <div><span>Clarity of your stated objective</span><strong>{summary.confidenceLabel}</strong></div>
            <div>
              <span>Journey completed</span>
              <strong>
                {summary.journeyCompleted.explored} of {summary.journeyCompleted.total} explored · {summary.journeyCompleted.demonstrated} demonstrated
              </strong>
            </div>
          </div>

          <section className="summary-section">
            <h2>Journey taken</h2>
            <ul className="summary-list">
              {summary.workflowsPractised.map((item) => (
                <li key={item.id}><strong>{item.title}</strong><span>{item.status}</span></li>
              ))}
            </ul>
            {summary.planReason && <p className="caption">{summary.planReason}</p>}
          </section>

          {summary.workflowsPractised.length > 0 && (
            <section className="summary-section" aria-labelledby="summary-revisit-title">
              <h2 id="summary-revisit-title">Revisit a scenario</h2>
              <p>Reviewing a scenario does not erase what you already explored.</p>
              <div className="revisit-row summary-revisit">
                {summary.workflowsPractised.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => update((current) => revisitScenario(current, item.id))}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="summary-section">
            <h2>Concepts explored</h2>
            <ul className="summary-list compact">
              {summary.conceptsExplored.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>

          <section className="summary-section">
            <h2>Concepts demonstrated</h2>
            {summary.conceptsDemonstrated.length > 0 ? (
              <ul className="summary-list compact">{summary.conceptsDemonstrated.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : <p>No concept has been demonstrated yet. You can revisit a scenario whenever you like.</p>}
          </section>

          <section className="summary-section">
            <h2>Topics needing further learning</h2>
            {summary.topicsNeedingLearning.length > 0 ? (
              <ul className="summary-list compact">{summary.topicsNeedingLearning.map((item) => <li key={item}>{item}</li>)}</ul>
            ) : <p>Nothing was flagged for another look.</p>}
          </section>

          <section className="summary-section">
            <h2>Workflows practised</h2>
            <ul className="summary-list compact">
              {summary.workflowsPractised.map((item) => <li key={item.id}>{item.workflow}</li>)}
            </ul>
            <p className="caption">These are hypothetical learning workflows. No order was placed and no account was accessed.</p>
          </section>

          <section className="summary-section">
            <h2>Official education sources</h2>
            <ul className="source-list">
              {summary.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.name} <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="journey-groww" aria-labelledby="journey-groww-title">
            <div>
              <span className="kicker">Optional next step</span>
              <h2 id="journey-groww-title">Explore Groww yourself</h2>
              <p>Groww is a separate platform with its own terms and privacy policy. Nothing you typed here is sent to it.</p>
            </div>
            <a className="button groww-button" href={GROWW_URL} target="_blank" rel="noopener noreferrer">
              Open groww.in <ExternalLink size={16} aria-hidden="true" />
            </a>
          </section>

          <div className="summary-actions">
            <button type="button" className="button secondary" onClick={() => void copySummary()}>
              <Copy size={16} aria-hidden="true" /> Copy my summary
            </button>
            <button type="button" className="text-button" onClick={startOver}>
              <RotateCcw size={15} aria-hidden="true" /> Start over
            </button>
            <p role="status" className="status">{copied}</p>
          </div>

          <p className="fine-print">Growerr is independent, is not affiliated with Groww, is not a broker or registered investment adviser, and provides general education only.</p>
        </section>
      )}

      {warning && state.phase !== 'discovery' && <p className="journey-warning" role="alert">{warning}</p>}

      <p className="journey-exit">
        <Link href="/about"><MessageCircle size={14} aria-hidden="true" /> How this works and what is stored</Link>
      </p>
    </div>
  );
}
