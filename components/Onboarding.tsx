'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Banknote,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Coins,
  Compass,
  Copy,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Lock,
  MessageCircle,
  Pause,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  GROWW_URL,
  STORAGE_KEY,
  answeredCount,
  isCompleteAnswers,
  progressPercent,
  questions,
  sanitizeAnswers,
  suggestedTopics,
  summaryRows,
  summaryText,
  type Answers,
  type IconName,
  type QuestionKey
} from '../lib/onboarding';

const icons: Record<IconName, LucideIcon> = {
  'trend-up': TrendingUp,
  target: Target,
  graduation: GraduationCap,
  compass: Compass,
  clock: Clock,
  calendar: Calendar,
  help: HelpCircle,
  'trend-down': TrendingDown,
  pause: Pause,
  chat: MessageCircle,
  wallet: Wallet,
  coins: Coins,
  banknote: Banknote,
  lock: Lock,
  sprout: Sprout,
  book: BookOpen,
  shield: ShieldCheck,
  activity: Activity
};

function readSavedAnswers(): Partial<Answers> {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? sanitizeAnswers(JSON.parse(saved)) : {};
  } catch {
    return {};
  }
}

export default function Onboarding() {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [step, setStep] = useState(0);
  const [view, setView] = useState<'questions' | 'summary'>('questions');
  const [returnToSummary, setReturnToSummary] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const saved = readSavedAnswers();
    setAnswers(saved);
    if (isCompleteAnswers(saved)) setView('summary');
  }, []);

  const question = questions[step];
  const selected = answers[question.key];
  const complete = isCompleteAnswers(answers);
  const showSummary = view === 'summary' && complete;

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, view]);

  useEffect(() => {
    document.title = showSummary ? 'Your starting point — Growerr' : `${question.title} — Growerr`;
  }, [question.title, showSummary]);

  function choose(key: QuestionKey, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setCopied('');
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The flow still works when browser storage is unavailable.
    }
  }

  function next(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (returnToSummary || step === questions.length - 1) {
      setView('summary');
      setReturnToSummary(false);
      return;
    }
    setStep((current) => current + 1);
  }

  function back() {
    if (returnToSummary) {
      setView('summary');
      setReturnToSummary(false);
      return;
    }
    if (step === 0) {
      router.push('/');
      return;
    }
    setStep((current) => current - 1);
  }

  function changeAnswer(key: QuestionKey) {
    const index = questions.findIndex((item) => item.key === key);
    if (index < 0) return;
    setStep(index);
    setView('questions');
    setReturnToSummary(true);
    setCopied('');
  }

  async function copySummary() {
    if (!isCompleteAnswers(answers)) return;
    try {
      await navigator.clipboard.writeText(summaryText(answers));
      setCopied('Your starting point was copied to the clipboard.');
    } catch {
      setCopied('Copy did not work in this browser. You can still read your answers above.');
    }
  }

  function startOver() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear when storage is blocked.
    }
    setAnswers({});
    setStep(0);
    setView('questions');
    setReturnToSummary(false);
    setCopied('');
  }

  if (view === 'summary' && isCompleteAnswers(answers)) {
    const rows = summaryRows(answers);
    const topics = suggestedTopics(answers);

    return (
      <div className="onboarding-shell">
        <div className="onboarding-progress" aria-hidden="true">
          <div className="progress-meta"><span>All done</span><span>6 of 6</span></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: '100%' }} /></div>
        </div>

        <article className="summary-panel">
          <div className="summary-heading">
            <span className="eyebrow">Your starting point</span>
            <h1 ref={headingRef} tabIndex={-1}>Here is where you are starting.</h1>
            <p className="lead">A quick snapshot of what you told us, plus a few things worth exploring first. Keep this page open or copy it before you continue.</p>
            <span className="saved-note"><Lock size={14} aria-hidden="true" /> Saved only in this browser</span>
          </div>

          <div className="profile-grid">
            {rows.map((row) => (
              <div className="profile-card" key={row.key}>
                <span className="profile-label">{row.label}</span>
                <strong>{row.value}</strong>
                <button type="button" className="edit-link" onClick={() => changeAnswer(row.key)} aria-label={`Change answer for ${row.label}`}>
                  <Pencil size={14} aria-hidden="true" /> Change
                </button>
              </div>
            ))}
          </div>

          <section className="topics-card" aria-labelledby="topics-title">
            <span className="kicker"><Sparkles size={15} aria-hidden="true" /> Explore first</span>
            <h2 id="topics-title">Three useful places to begin</h2>
            <ul className="topic-list">
              {topics.map((topic) => <li key={topic}><span className="topic-check" aria-hidden="true"><Check size={14} /></span>{topic}</li>)}
            </ul>
            <p className="caption">These are educational topics, not recommendations or a promise of returns.</p>
          </section>

          <section className="groww-card" aria-labelledby="groww-title">
            <div>
              <span className="kicker">Next step</span>
              <h2 id="groww-title">Continue to Groww</h2>
              <p>Explore account options, SIPs, and beginner guides at your own pace. Groww is a separate platform with its own terms and privacy policy.</p>
            </div>
            <div className="groww-action">
              <a className="button groww-button" href={GROWW_URL} target="_blank" rel="noopener noreferrer">
                Continue to Groww <ExternalLink size={17} aria-hidden="true" />
              </a>
              <span>Opens groww.in in a new tab. Your answers are not sent anywhere.</span>
            </div>
          </section>

          <div className="summary-actions">
            <button type="button" className="button secondary" onClick={copySummary}>
              <Copy size={16} aria-hidden="true" /> Copy my starting point
            </button>
            <button type="button" className="text-button" onClick={startOver}>
              <RotateCcw size={15} aria-hidden="true" /> Start over
            </button>
            <p role="status" className="status">{copied}</p>
          </div>

          <p className="fine-print">Growerr is an independent educational tool. It is not affiliated with Groww and does not provide investment advice.</p>
        </article>
      </div>
    );
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-progress">
        <div className="progress-meta">
          <span>Step {step + 1} of {questions.length}</span>
          <span>{answeredCount(answers)} answered</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Onboarding progress"
          aria-valuemin={1}
          aria-valuemax={questions.length}
          aria-valuenow={step + 1}
        >
          <div className="progress-fill" style={{ width: `${progressPercent(step)}%` }} />
        </div>
      </div>

      <form className="question-panel" onSubmit={next} key={question.key}>
        <span className="eyebrow">{question.eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>{question.title}</h1>
        <p className="question-help">{question.help}</p>

        <fieldset className="option-fieldset">
          <legend className="sr-only">{question.title}</legend>
          <div className="option-grid">
            {question.options.map((option) => {
              const Icon = icons[option.icon];
              const checked = selected === option.value;
              return (
                <label className={`option-card${checked ? ' is-selected' : ''}`} key={option.value}>
                  <input
                    type="radio"
                    name={question.key}
                    value={option.value}
                    checked={checked}
                    onChange={() => choose(question.key, option.value)}
                  />
                  <span className="option-icon" aria-hidden="true"><Icon size={21} /></span>
                  <span className="option-copy"><strong>{option.label}</strong><span>{option.hint}</span></span>
                  <span className="option-check" aria-hidden="true">{checked && <Check size={14} />}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="step-actions">
          <button type="button" className="button ghost" onClick={back}>
            <ArrowLeft size={16} aria-hidden="true" /> Back
          </button>
          <button type="submit" className="button primary" disabled={!selected}>
            {step === questions.length - 1 ? 'See my starting point' : 'Continue'} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <p className="step-note"><Lock size={14} aria-hidden="true" /> No account needed. Your answers stay in this browser.</p>
      </form>

      <p className="onboarding-exit"><Link href="/">Leave onboarding</Link></p>
    </div>
  );
}
