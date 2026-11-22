import { blankDraft, type Draft, type DecisionSnapshot, type Scenario } from './types';
const RECORDS = 'growerr:records:v1';
const DRAFT = 'growerr:draft:v1';
const MAX_RECORDS = 100;
export class StorageProblem extends Error { constructor(message: string) { super(message); this.name = 'StorageProblem'; } }
function available(): Storage { if (typeof window === 'undefined') throw new StorageProblem('Browser storage is not available here.'); return window.localStorage; }
function parse<T>(key: string, fallback: T, valid: (value: unknown) => value is T): T {
  let raw: string | null;
  try { raw = available().getItem(key); } catch { throw new StorageProblem('Could not access browser storage. Check your browser settings.'); }
  if (raw === null) return fallback;
  try { const data: unknown = JSON.parse(raw); if (valid(data)) return data; } catch { /* preserve raw data for recovery */ }
  throw new StorageProblem('Saved data could not be read. You can export the original data or clear it in About. Nothing was changed.');
}
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const scenario = (v: unknown): v is Scenario => v === 'exploring' || v === 'considering' || v === 'revisiting';
const text = (v: unknown) => typeof v === 'string' && v.length <= 5000;
const optionalText = (v: unknown) => v === undefined || text(v);
const claimValid = (v: unknown) => object(v) && text(v.id) && text(v.claim) && text(v.source) && text(v.evidence) && text(v.concerns) && v.verified === false;
const reviewValid = (v: unknown) => object(v) && text(v.id) && text(v.createdAt) && text(v.whatChanged) && text(v.whatStillHolds) && text(v.nextQuestion) && (v.confidence === undefined || (Number.isInteger(v.confidence) && (v.confidence as number) >= 1 && (v.confidence as number) <= 5));
const draftValid = (v: unknown): v is Draft => object(v) && scenario(v.scenario) && text(v.title) && text(v.motivation) && text(v.decisionQuestion) && text(v.investmentLabel) && text(v.lossConcern) && text(v.knownFacts) && text(v.assumptions) && text(v.reviewTrigger) && typeof v.isSyntheticDemo === 'boolean' &&
  (v.illustrativeAmountINR === undefined || (typeof v.illustrativeAmountINR === 'number' && Number.isFinite(v.illustrativeAmountINR) && v.illustrativeAmountINR > 0 && v.illustrativeAmountINR <= 1e9)) &&
  (v.illustrationPercent === 10 || v.illustrationPercent === 20 || v.illustrationPercent === 30) &&
  (v.intention === 'learn_more' || v.intention === 'wait' || v.intention === 'review_existing' || v.intention === 'unsure') &&
  (v.confidence === undefined || (typeof v.confidence === 'number' && Number.isInteger(v.confidence) && v.confidence >= 1 && v.confidence <= 5)) &&
  Array.isArray(v.adviceClaims) && v.adviceClaims.length <= 3 && v.adviceClaims.every(claimValid) &&
  Array.isArray(v.unansweredQuestions) && v.unansweredQuestions.length <= 10 && v.unansweredQuestions.every(text) &&
  Array.isArray(v.unfamiliarTerms) && v.unfamiliarTerms.length <= 50 && v.unfamiliarTerms.every(text) && optionalText(v.editingId);
const originalValid = (v: unknown) => object(v) && text(v.decisionQuestion) && text(v.motivation) && text(v.knownFacts) && text(v.assumptions) && text(v.lossConcern) && text(v.reviewTrigger) && Array.isArray(v.unansweredQuestions) && v.unansweredQuestions.every(text) && Array.isArray(v.adviceClaims) && v.adviceClaims.every(claimValid) && (v.intention === 'learn_more' || v.intention === 'wait' || v.intention === 'review_existing' || v.intention === 'unsure');
const recordValid = (v: unknown): v is DecisionSnapshot => object(v) && v.schemaVersion === 1 && text(v.id) && text(v.createdAt) && text(v.updatedAt) && Array.isArray(v.reviews) && v.reviews.length <= 500 && v.reviews.every(reviewValid) && optionalText(v.originalQuestion) && optionalText(v.originalRationale) && (v.original === undefined || originalValid(v.original)) && draftValid(v);
function save(key: string, data: unknown): void { try { available().setItem(key, JSON.stringify(data)); } catch { throw new StorageProblem('Could not save to this browser. Check storage permissions or available space.'); } }
export function readDraft(): Draft | null { return parse(DRAFT, null as Draft | null, (v): v is Draft | null => v === null || draftValid(v)); }
export function saveDraft(draft: Draft): void { if (!draftValid(draft)) throw new StorageProblem('This draft could not be saved.'); save(DRAFT, draft); }
export function clearDraft(): void { try { available().removeItem(DRAFT); } catch { throw new StorageProblem('Could not clear the draft.'); } }
export function listRecords(): DecisionSnapshot[] { return parse(RECORDS, [] as DecisionSnapshot[], (v): v is DecisionSnapshot[] => Array.isArray(v) && v.length <= MAX_RECORDS && v.every(recordValid)); }
export function getRecord(id: string): DecisionSnapshot | undefined { return listRecords().find(item => item.id === id); }
export function upsertRecord(record: DecisionSnapshot): void {
  if (!recordValid(record)) throw new StorageProblem('This snapshot could not be saved.');
  const existing = listRecords(); const index = existing.findIndex(item => item.id === record.id);
  if (index >= 0) existing[index] = record;
  else { if (existing.length >= MAX_RECORDS) throw new StorageProblem('The local library is full. Export or remove an old snapshot first.'); existing.unshift(record); }
  save(RECORDS, existing);
}
export function removeRecord(id: string): void { save(RECORDS, listRecords().filter(item => item.id !== id)); }
export function clearAll(): void { try { const storage = available(); storage.removeItem(RECORDS); storage.removeItem(DRAFT); } catch { throw new StorageProblem('Could not remove all browser data.'); } }
export function exportData(): string { return JSON.stringify({ app: 'Growerr', schemaVersion: 1, exportedAt: new Date().toISOString(), snapshots: listRecords(), draft: readDraft() }, null, 2); }
export function exportRawData(): string { const storage = available(); return JSON.stringify({ app: 'Growerr', rawRecords: storage.getItem(RECORDS), rawDraft: storage.getItem(DRAFT) }, null, 2); }
export function newDraft(scenarioChoice: Scenario): Draft { return blankDraft(scenarioChoice); }
