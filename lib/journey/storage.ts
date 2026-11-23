/**
 * Session persistence (FR-16). Browser-only; everything is sanitised on load
 * so a tampered or outdated localStorage value can never break the app.
 */
import { safeEcho } from '../education';
import { EXPERIENCE_IDS, findCheck, getExperience, isExperienceId } from './experiences';
import { OPENING_PROMPT } from './discovery';
import { createProfile, safeEvidence, sanitizeProfile } from './profile';
import {
  JOURNEY_VERSION,
  type AdaptationEvent,
  type ChatMessage,
  type CheckVariant,
  type ExperienceId,
  type ExperienceLevel,
  type ExperienceProgress,
  type Intent,
  type JourneyState,
  type PlanItem
} from './types';

export const STORAGE_KEY = 'growerr:journey:v2';

const INTENTS: Intent[] = ['investing', 'trading', 'exploring', 'platform', 'unclear'];
const LEVELS: ExperienceLevel[] = ['none', 'some', 'experienced', 'unknown'];
const now = () => new Date().toISOString();

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createInitialState(): JourneyState {
  const at = now();
  return {
    version: JOURNEY_VERSION,
    phase: 'discovery',
    paused: false,
    intent: 'unclear',
    objective: '',
    motivation: '',
    concerns: [],
    questions: [],
    experience: 'unknown',
    appFamiliarity: 'unknown',
    focus: [],
    readyToPlan: false,
    messages: [{ id: 'm-0', role: 'guide', text: OPENING_PROMPT, source: 'static', at }],
    profile: createProfile(),
    plan: [],
    currentId: null,
    progress: {},
    log: [],
    aiMode: 'unknown',
    startedAt: at,
    updatedAt: at
  };
}

const isRecord = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, n = 160) => (typeof v === 'string' ? safeEcho(v, n) : '');
const strList = (v: unknown, n: number, max = 160) => (Array.isArray(v) ? v.map((i) => str(i, max)).filter(Boolean).slice(-n) : []);

function sanitizeMessages(v: unknown): ChatMessage[] {
  if (!Array.isArray(v)) return [];
  return v
    .slice(-60)
    .map((m): ChatMessage | null => {
      if (!isRecord(m)) return null;
      const role = m.role === 'user' || m.role === 'guide' ? m.role : null;
      const text = str(m.text, 1200);
      if (!role || !text) return null;
      const terms = Array.isArray(m.terms)
        ? m.terms
            .filter(isRecord)
            .map((t) => ({ term: str(t.term, 40), meaning: str(t.meaning, 220) }))
            .filter((t) => t.term && t.meaning)
            .slice(0, 2)
        : undefined;
      return {
        id: str(m.id, 40) || newId(),
        role,
        text,
        terms: terms && terms.length > 0 ? terms : undefined,
        source: m.source === 'ai' || m.source === 'static' || m.source === 'safety' ? m.source : undefined,
        at: str(m.at, 40) || now()
      };
    })
    .filter((m): m is ChatMessage => Boolean(m));
}

function sanitizePlan(v: unknown): PlanItem[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  return v
    .filter(isRecord)
    .map((p): PlanItem | null => {
      if (!isExperienceId(p.id) || seen.has(p.id)) return null;
      seen.add(p.id);
      const status = ['pending', 'active', 'demonstrated', 'needs-review', 'skipped'].includes(p.status as string)
        ? (p.status as PlanItem['status'])
        : 'pending';
      const addedBy = p.addedBy === 'adaptation' || p.addedBy === 'user' ? p.addedBy : 'planner';
      return { id: p.id, reason: str(p.reason, 220) || 'Part of your plan.', addedBy, status };
    })
    .filter((p): p is PlanItem => Boolean(p))
    .slice(0, 10);
}

function sanitizeProgress(v: unknown): JourneyState['progress'] {
  if (!isRecord(v)) return {};
  const out: JourneyState['progress'] = {};
  for (const [key, raw] of Object.entries(v)) {
    if (!isExperienceId(key) || !isRecord(raw)) continue;
    const exp = getExperience(key);
    if (!exp) continue;
    const queue = Array.isArray(raw.queue)
      ? raw.queue
          .filter(isRecord)
          .map((q) => ({
            checkId: str(q.checkId, 60),
            variant: (q.variant === 'alternative' || q.variant === 'transfer' ? q.variant : 'core') as CheckVariant
          }))
          .filter((q) => findCheck(key, q.checkId))
          .slice(0, 12)
      : [];
    const outcomes = Array.isArray(raw.outcomes)
      ? raw.outcomes
          .filter(isRecord)
          .map((o) => ({
            checkId: str(o.checkId, 60),
            variant: (o.variant === 'alternative' || o.variant === 'transfer' ? o.variant : 'core') as CheckVariant,
            correct: o.correct === true,
            misconceptionIds: strList(o.misconceptionIds, 3, 60),
            answeredAt: str(o.answeredAt, 40) || now()
          }))
          .filter((o) => findCheck(key, o.checkId))
          .slice(-30)
      : [];
    const stage = ['intro', 'lab', 'checks', 'done'].includes(raw.stage as string) ? (raw.stage as ExperienceProgress['stage']) : 'intro';
    const result = ['in-progress', 'demonstrated', 'needs-review', 'skipped'].includes(raw.result as string)
      ? (raw.result as ExperienceProgress['result'])
      : 'in-progress';
    const safeQueue = queue.length > 0 ? queue : exp.checks.map((c) => ({ checkId: c.id, variant: 'core' as const }));
    const index = typeof raw.index === 'number' && Number.isFinite(raw.index) ? Math.min(Math.max(Math.trunc(raw.index), 0), safeQueue.length - 1) : 0;
    out[key] = {
      id: key,
      stage,
      labExplored: raw.labExplored === true,
      queue: safeQueue,
      index,
      outcomes,
      runs: typeof raw.runs === 'number' && Number.isFinite(raw.runs) ? Math.min(Math.max(Math.trunc(raw.runs), 1), 50) : 1,
      result
    };
  }
  return out;
}

function sanitizeLog(v: unknown): AdaptationEvent[] {
  if (!Array.isArray(v)) return [];
  const kinds = ['profile', 'plan', 'misconception', 'alternative', 'remedy', 'demonstrated', 'skip', 'revisit', 'safety'];
  return v
    .filter(isRecord)
    .map((e) => ({
      at: str(e.at, 40) || now(),
      kind: (kinds.includes(e.kind as string) ? e.kind : 'plan') as AdaptationEvent['kind'],
      text: str(e.text, 220)
    }))
    .filter((e) => e.text)
    .slice(-40);
}

export function sanitizeState(value: unknown): JourneyState | null {
  if (!isRecord(value) || value.version !== JOURNEY_VERSION) return null;
  const base = createInitialState();
  const messages = sanitizeMessages(value.messages);
  const plan = sanitizePlan(value.plan);
  const progress = sanitizeProgress(value.progress);
  const phase = ['discovery', 'plan', 'experience', 'summary'].includes(value.phase as string) ? (value.phase as JourneyState['phase']) : 'discovery';
  const currentId = isExperienceId(value.currentId) && progress[value.currentId] ? value.currentId : null;
  const state: JourneyState = {
    ...base,
    phase: phase === 'experience' && !currentId ? (plan.length > 0 ? 'plan' : 'discovery') : phase === 'plan' && plan.length === 0 ? 'discovery' : phase,
    paused: value.paused === true,
    intent: INTENTS.includes(value.intent as Intent) ? (value.intent as Intent) : 'unclear',
    objective: str(value.objective),
    motivation: str(value.motivation),
    concerns: strList(value.concerns, 4),
    questions: strList(value.questions, 4),
    experience: LEVELS.includes(value.experience as ExperienceLevel) ? (value.experience as ExperienceLevel) : 'unknown',
    appFamiliarity: LEVELS.includes(value.appFamiliarity as ExperienceLevel) ? (value.appFamiliarity as ExperienceLevel) : 'unknown',
    focus: Array.isArray(value.focus) ? (value.focus.filter(isExperienceId).slice(0, 3) as ExperienceId[]) : [],
    readyToPlan: value.readyToPlan === true,
    messages: messages.length > 0 ? messages : base.messages,
    profile: sanitizeProfile(value.profile),
    plan,
    currentId,
    progress,
    log: sanitizeLog(value.log),
    aiMode: value.aiMode === 'ai' || value.aiMode === 'static' ? value.aiMode : 'unknown',
    startedAt: str(value.startedAt, 40) || base.startedAt,
    updatedAt: str(value.updatedAt, 40) || base.updatedAt
  };
  return state;
}

export function loadState(): JourneyState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveState(state: JourneyState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode). The journey still works in memory.
  }
}

export function clearState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem('growerr:journey:v1');
  } catch {
    // ignore
  }
}

export { EXPERIENCE_IDS, safeEvidence };
