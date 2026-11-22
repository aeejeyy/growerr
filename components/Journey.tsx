'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { blankDraft, demoDraft, scenarioNames, intentionNames, type Draft, type Scenario, type AdviceClaim, type DecisionSnapshot } from '../lib/types';
import { glossary, scenarioHints, nonAdvice } from '../lib/content';
import { illustrativeDecline, formatINR, type Percent } from '../lib/math';
import { readDraft, saveDraft, clearDraft, getRecord, upsertRecord } from '../lib/storage';
const titles = ['Your context', 'Make sense of the language', 'Consider the impact', 'Examine what you heard', 'Keep a decision snapshot'];
const heading = ['What are you trying to decide?', 'Which terms feel unclear?', 'What would a decline mean for you?', 'What have others told you?', 'What do you want to remember?'];
const validScenario = (s: string | null): s is Scenario => s === 'exploring' || s === 'considering' || s === 'revisiting';
function fromRecord(record: DecisionSnapshot): Draft {
  const { id, schemaVersion, createdAt, updatedAt, reviews, originalQuestion, originalRationale, original, ...content } = record;
  void schemaVersion; void createdAt; void updatedAt; void reviews; void originalQuestion; void originalRationale; void original;
  return { ...content, editingId: id };
}
function Textarea({ id, label, value, onChange, help, optional = true }: { id: string; label: string; value: string; onChange: (value: string) => void; help?: string; optional?: boolean }) {
  return <div><label htmlFor={id}>{label} {optional && <span className="optional">(optional)</span>}</label><textarea id={id} maxLength={1200} value={value} onChange={event => onChange(event.target.value)} aria-describedby={help ? `${id}-help` : undefined} />{help && <p className="field-help" id={`${id}-help`}>{help}</p>}</div>;
}
export default function Journey() {
  const router = useRouter(); const params = useSearchParams();
  const [draft, setDraft] = useState<Draft>(blankDraft()); const [ready, setReady] = useState(false);
  const [resume, setResume] = useState<{ existing: Draft; requested: Draft } | null>(null);
  const [step, setStep] = useState(0); const [amountText, setAmountText] = useState('');
  const [error, setError] = useState(''); const [status, setStatus] = useState(''); const [saving, setSaving] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      const edit = params.get('edit');
      if (edit) { const record = getRecord(edit); if (!record) { setError('That saved decision was not found in this browser.'); return; }
        const restored = fromRecord(record); setDraft(restored); setAmountText(record.illustrativeAmountINR?.toString() ?? ''); setReady(true); return; }
      const existing = readDraft();
      const newDraft = params.get('demo') === '1' ? demoDraft() : blankDraft(validScenario(params.get('scenario')) ? params.get('scenario') as Scenario : 'exploring');
      if (existing && (params.has('scenario') || params.has('demo'))) { setResume({ existing, requested: newDraft }); return; }
      const initial = existing ?? newDraft; setDraft(initial); setAmountText(initial.illustrativeAmountINR?.toString() ?? ''); setReady(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load a draft.'); }
  }, [params]);
  useEffect(() => {
    if (!ready || saving) return;
    const timer = window.setTimeout(() => { try { saveDraft(draft); setStatus('Draft saved in this browser.'); } catch (e) { setStatus(e instanceof Error ? e.message : 'Could not save your draft.'); } }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, ready, saving]);
  useEffect(() => { if (ready) headingRef.current?.focus(); }, [step, ready]);
  function choose(candidate: Draft) { setDraft(candidate); setAmountText(candidate.illustrativeAmountINR?.toString() ?? ''); setResume(null); setReady(true); setStep(0); }
  function change<K extends keyof Draft>(key: K, value: Draft[K]) { setDraft(current => ({ ...current, [key]: value })); setError(''); }
  function next() {
    if (step === 0 && !draft.decisionQuestion.trim()) { setError('Write the question you want to think through before continuing.'); document.getElementById('question')?.focus(); return; }
    if (step === 2 && amountText && (!Number.isFinite(Number(amountText)) || Number(amountText) <= 0 || Number(amountText) > 1000000000)) { setError('Enter an amount above zero and up to ₹1,00,00,00,000, or leave it blank.'); document.getElementById('amount')?.focus(); return; }
    if (step === 3 && draft.adviceClaims.some(c => !c.claim.trim())) { setError('Write a claim or remove the empty claim before continuing.'); return; }
    setError(''); setStep(Math.min(4, step + 1)); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function addClaim() { if (draft.adviceClaims.length < 3) change('adviceClaims', [...draft.adviceClaims, { id: crypto.randomUUID(), claim: '', source: '', evidence: '', concerns: '', verified: false }]); }
  function updateClaim(id: string, key: keyof AdviceClaim, value: string) { change('adviceClaims', draft.adviceClaims.map(c => c.id === id ? { ...c, [key]: value } : c)); }
  function save() {
    if (!draft.decisionQuestion.trim()) { setStep(0); setError('Write a decision question before saving.'); return; }
    if (draft.adviceClaims.some(c => !c.claim.trim())) { setStep(3); setError('Write or remove each empty claim.'); return; }
    setSaving(true); setError('');
    try {
      const prior = draft.editingId ? getRecord(draft.editingId) : undefined;
      if (draft.editingId && !prior) throw new Error('The saved decision you were editing is no longer available.');
      const { editingId, ...content } = draft; void editingId;
      const now = new Date().toISOString();
      const record: DecisionSnapshot = { ...content, title: draft.title.trim() || draft.decisionQuestion.trim().slice(0, 72),
        id: prior?.id ?? crypto.randomUUID(), schemaVersion: 1, createdAt: prior?.createdAt ?? now, updatedAt: now,
        reviews: prior?.reviews ?? [], originalQuestion: prior?.originalQuestion ?? prior?.decisionQuestion ?? draft.decisionQuestion.trim(),
        originalRationale: prior?.originalRationale ?? prior?.motivation ?? draft.motivation.trim(),
        original: prior?.original ?? { decisionQuestion: draft.decisionQuestion.trim(), motivation: draft.motivation.trim(), knownFacts: draft.knownFacts.trim(), assumptions: draft.assumptions.trim(), lossConcern: draft.lossConcern.trim(), unansweredQuestions: [...draft.unansweredQuestions], adviceClaims: draft.adviceClaims.map(claim => ({ ...claim })), intention: draft.intention, reviewTrigger: draft.reviewTrigger.trim() } };
      upsertRecord(record); clearDraft(); setReady(false); router.push(`/snapshot/${record.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save the snapshot.'); setSaving(false); }
  }
  if (resume) return <div className="page narrow"><h1>You have an unfinished decision.</h1><p>Keep working on it, or start the selected journey. Starting over replaces the unfinished draft, but not saved snapshots.</p><div className="actions"><button className="button primary" onClick={() => choose(resume.existing)}>Continue my draft</button><button className="button secondary" onClick={() => choose(resume.requested)}>Start selected journey</button></div></div>;
  if (!ready) return <div className="page narrow"><h1>Decision journey</h1>{error ? <><div className="error-banner" role="alert">{error}</div><div className="actions"><Link className="button secondary" href="/library">Open my decisions</Link><button className="button primary" onClick={() => { setError(''); choose(blankDraft()); }}>Start a new journey</button></div></> : <p>Loading your decision...</p>}</div>;
  const amount = Number(amountText); const validAmount = !!amountText && Number.isFinite(amount) && amount > 0 && amount <= 1000000000;
  const example = validAmount ? illustrativeDecline(amount, draft.illustrationPercent) : null;
  return <div className="page journey-shell"><div className="journey-top"><div className="progress-meta"><span>{draft.editingId ? 'Editing a decision' : scenarioNames[draft.scenario]}</span><span>Step {step + 1} of 5</span></div><div className="progress-track" role="progressbar" aria-label="Journey progress" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={5}><div className="progress-fill" style={{ width: `${(step + 1) * 20}%` }} /></div></div>
    <div className="form-panel"><div className="eyebrow">{titles[step]}</div><h1 tabIndex={-1} ref={headingRef}>{heading[step]}</h1>
      {draft.isSyntheticDemo && <p className="synthetic">Synthetic example — not a real interview or market record</p>}
      {step === 0 && <><p className="lead">{scenarioHints[draft.scenario]}</p><label htmlFor="question">Your decision question</label><textarea id="question" value={draft.decisionQuestion} maxLength={500} required aria-invalid={!!error && !draft.decisionQuestion.trim()} onChange={e => change('decisionQuestion', e.target.value)} placeholder="What do I need to understand before I decide?" /><p className="field-help">This is the only question you need to answer to save a snapshot.</p>
        <Textarea id="motivation" label="Why does this matter now?" value={draft.motivation} onChange={v => change('motivation', v)} />
        <label htmlFor="investment">Investment name <span className="optional">(optional; no ticker needed)</span></label><input id="investment" maxLength={120} value={draft.investmentLabel} onChange={e => change('investmentLabel', e.target.value)} placeholder="You can leave this blank" /></>}
      {step === 1 && <><p className="lead">Select any terms you would like to see in plain language. You can also <Link className="text-link" href="/learn">browse all terms</Link>.</p><div className="check-list">{Object.keys(glossary).map(term => <label key={term} className="check-item"><input type="checkbox" checked={draft.unfamiliarTerms.includes(term)} onChange={e => change('unfamiliarTerms', e.target.checked ? [...draft.unfamiliarTerms, term] : draft.unfamiliarTerms.filter(item => item !== term))} />{term}</label>)}</div>{draft.unfamiliarTerms.map(term => <p className="definition" key={term}><strong>{term}:</strong> {glossary[term]}</p>)}{draft.unfamiliarTerms.length === 0 && <p className="field-help">No selection is required. Continue whenever you are ready.</p>}</>}
      {step === 2 && <><p className="lead">You can explore a simple illustration or skip the numbers. This cannot tell you what will happen.</p><label htmlFor="amount">Hypothetical amount in rupees <span className="optional">(optional)</span></label><input id="amount" type="number" min="0.01" max="1000000000" step="0.01" inputMode="decimal" value={amountText} aria-describedby="amount-help" onChange={e => { const value = e.target.value; setAmountText(value); change('illustrativeAmountINR', value && Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : undefined); }} placeholder="For example, 3500" /><p id="amount-help" className="field-help">Use a made-up amount if you prefer. No exact holdings are required.</p>
        <span className="field-title">Illustrative decline</span><div className="segmented" role="group" aria-label="Illustrative percentage">{([10, 20, 30] as const).map(percent => <button type="button" aria-pressed={draft.illustrationPercent === percent} key={percent} onClick={() => change('illustrationPercent', percent as Percent)}>{percent}%</button>)}</div>
        {example !== null ? <div className="info-box"><span className="kicker">Arithmetic illustration</span><p className="illustration">{formatINR(example)} less</p><p>If {formatINR(amount)} declined by {draft.illustrationPercent}%, the difference would be {formatINR(example)}. This is one possible illustration, not a prediction, expected outcome or the most you could lose. A stock can lose its entire invested value.</p></div> : <div className="info-box"><p>Enter an optional positive amount to see the arithmetic. You can continue without one.</p></div>}
        <Textarea id="impact" label="How might a loss affect your plans or peace of mind?" value={draft.lossConcern} onChange={v => change('lossConcern', v)} help="You can skip this. Growerr does not assess your financial suitability." /></>}
      {step === 3 && <><p className="lead">Separate what you heard from what you can check. Every claim below is unverified by Growerr.</p>
        {draft.adviceClaims.map((claim, index) => <div className="claim-card" key={claim.id}><div className="claim-header"><h3>Unverified claim {index + 1}</h3><button type="button" className="inline-button" onClick={() => change('adviceClaims', draft.adviceClaims.filter(c => c.id !== claim.id))}>Remove claim {index + 1}</button></div>
          <Textarea id={`claim-${claim.id}`} label="What I heard" value={claim.claim} optional={false} onChange={v => updateClaim(claim.id, 'claim', v)} />
          <div className="form-row"><Textarea id={`source-${claim.id}`} label="From whom or where?" value={claim.source} onChange={v => updateClaim(claim.id, 'source', v)} /><Textarea id={`evidence-${claim.id}`} label="Evidence I have" value={claim.evidence} onChange={v => updateClaim(claim.id, 'evidence', v)} /></div>
          <Textarea id={`concerns-${claim.id}`} label="What might be missing or conflicting?" value={claim.concerns} onChange={v => updateClaim(claim.id, 'concerns', v)} />
        </div>)}<button type="button" className="button secondary" disabled={draft.adviceClaims.length >= 3} onClick={addClaim}>Add an unverified claim {draft.adviceClaims.length}/3</button>
        <p className="field-help">Possible checks: source identity, date, evidence, assumptions, relevance to your goal, and what might disprove the claim.</p>
        <Textarea id="facts" label="What do you know for yourself?" value={draft.knownFacts} onChange={v => change('knownFacts', v)} /><Textarea id="assumptions" label="What are you assuming?" value={draft.assumptions} onChange={v => change('assumptions', v)} />
        <Textarea id="questions" label="What questions remain?" value={questionText || draft.unansweredQuestions.join('\n')} onChange={v => { setQuestionText(v); change('unansweredQuestions', v.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 10)); }} help="Write one question per line, up to 10." />
        <label htmlFor="confidence">How confident do you feel in your understanding? <span className="optional">(optional; not a risk score)</span></label><select id="confidence" value={draft.confidence ?? ''} onChange={e => change('confidence', e.target.value ? Number(e.target.value) : undefined)}><option value="">Prefer not to say</option>{[1,2,3,4,5].map(n => <option value={n} key={n}>{n} — {n === 1 ? 'many questions' : n === 5 ? 'clear about my reasoning' : 'some uncertainty'}</option>)}</select></>}
      {step === 4 && <><p className="lead">Capture what you believe today. You can return and add a new reflection later without rewriting this moment.</p>
        <label htmlFor="title">Snapshot title <span className="optional">(optional)</span></label><input id="title" maxLength={100} value={draft.title} onChange={e => change('title', e.target.value)} placeholder="A short name for this decision" />
        <label htmlFor="intention">What would you like to do next?</label><select id="intention" value={draft.intention} onChange={e => change('intention', e.target.value as Draft['intention'])}>{Object.entries(intentionNames).map(([key, text]) => <option value={key} key={key}>{text}</option>)}</select>
        <Textarea id="review-trigger" label="What would prompt you to revisit this?" value={draft.reviewTrigger} onChange={v => change('reviewTrigger', v)} help="For example, when you find a reliable source or your circumstances change." />
        <div className="info-box"><span className="kicker">Your question</span><p>{draft.decisionQuestion || 'You can add a question in the first step.'}</p><span className="kicker">Open questions</span>{draft.unansweredQuestions.length ? <ul>{draft.unansweredQuestions.map((q, index) => <li key={index}>{q}</li>)}</ul> : <p>None recorded yet.</p>}</div>
        <p className="disclaimer" role="note">{nonAdvice} Your snapshot records your reasoning, not a verdict about the investment.</p></>}
      {error && <div role="alert" className="error-banner">{error}</div>}
      <div className="step-actions"><button className="button secondary" type="button" onClick={() => { if (step > 0) { setStep(step - 1); setError(''); } else router.push('/start'); }}>{step > 0 ? 'Back' : 'Change scenario'}</button><button className="button primary" type="button" disabled={saving} onClick={step === 4 ? save : next}>{saving ? 'Saving…' : step === 4 ? (draft.editingId ? 'Save changes' : 'Save my snapshot') : 'Continue'}</button></div>
      <p className="status" role="status">{status}</p>
    </div></div>;
}
