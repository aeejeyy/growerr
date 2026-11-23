import { detectSensitive } from '../education';
import type {
  KnowledgeDimension,
  KnowledgeState,
  MisconceptionRecord,
  Profile,
  ProfileEntry,
  ProfileSignal
} from './types';

export const KNOWLEDGE_DIMENSIONS: KnowledgeDimension[] = [
  'fundamentals',
  'products',
  'risk',
  'tradingMechanics',
  'platform',
  'decisions'
];

const STATES: KnowledgeState[] = ['not-assessed', 'needs-introduction', 'developing', 'demonstrated'];

function isDimension(value: unknown): value is KnowledgeDimension {
  return typeof value === 'string' && KNOWLEDGE_DIMENSIONS.includes(value as KnowledgeDimension);
}

function isState(value: unknown): value is KnowledgeState {
  return typeof value === 'string' && STATES.includes(value as KnowledgeState);
}

function stateRank(state: KnowledgeState): number {
  return STATES.indexOf(state);
}

export function safeEvidence(value: unknown, maxLength = 160): string {
  if (typeof value !== 'string') return '';
  if (detectSensitive(value)) return '';
  return value
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[link removed]')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[email removed]')
    .replace(/\b\d{5,}\b/g, '[number removed]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function emptyEntry(dimension: KnowledgeDimension): ProfileEntry {
  return { dimension, state: 'not-assessed', claimed: [], demonstrated: [], misconceptions: [] };
}

export function createProfile(): Profile {
  return KNOWLEDGE_DIMENSIONS.reduce((profile, dimension) => {
    profile[dimension] = emptyEntry(dimension);
    return profile;
  }, {} as Profile);
}

function addUnique(list: string[], value: string, limit = 5): string[] {
  if (!value) return list;
  if (list.some((item) => item.toLowerCase() === value.toLowerCase())) return list;
  return [...list, value].slice(-limit);
}

function promote(current: KnowledgeState, incoming: KnowledgeState): KnowledgeState {
  return stateRank(incoming) > stateRank(current) ? incoming : current;
}

function demote(current: KnowledgeState, incoming: KnowledgeState): KnowledgeState {
  return stateRank(incoming) < stateRank(current) ? incoming : current;
}

export function applyDiscoverySignals(profile: Profile, signals: ProfileSignal[]): Profile {
  const next: Profile = structuredCloneSafe(profile);
  for (const signal of signals.slice(0, 3)) {
    if (!isDimension(signal?.dimension) || !isState(signal?.state)) continue;
    const evidence = safeEvidence(signal.evidence);
    if (!evidence) continue;
    const entry = next[signal.dimension];
    // Discovery records what a person says about themselves, not demonstrated understanding.
    const claimedState: KnowledgeState = signal.state === 'demonstrated' ? 'developing' : signal.state;
    entry.claimed = addUnique(entry.claimed, evidence);
    entry.state = promote(entry.state, claimedState);
  }
  return next;
}

export function recordMisconception(
  profile: Profile,
  dimension: KnowledgeDimension,
  id: string,
  note: string
): Profile {
  if (!isDimension(dimension) || !id) return profile;
  const next = structuredCloneSafe(profile);
  const entry = next[dimension];
  const records: MisconceptionRecord[] = entry.misconceptions.filter((item) => item.id !== id);
  records.push({ id, resolved: false, note: safeEvidence(note, 120) || 'Review this idea again.' });
  entry.misconceptions = records.slice(-6);
  entry.state = demote(entry.state, 'needs-introduction');
  return next;
}

export function resolveMisconceptions(profile: Profile, ids: string[]): Profile {
  if (ids.length === 0) return profile;
  const next = structuredCloneSafe(profile);
  for (const dimension of KNOWLEDGE_DIMENSIONS) {
    next[dimension].misconceptions = next[dimension].misconceptions.map((item) =>
      ids.includes(item.id) ? { ...item, resolved: true } : item
    );
  }
  return next;
}

export function resolveMisconceptionsForDimensions(profile: Profile, dimensions: KnowledgeDimension[]): Profile {
  if (dimensions.length === 0) return profile;
  const next = structuredCloneSafe(profile);
  for (const dimension of dimensions) {
    if (!isDimension(dimension)) continue;
    next[dimension].misconceptions = next[dimension].misconceptions.map((item) => ({ ...item, resolved: true }));
  }
  return next;
}

export function applyDemonstration(
  profile: Profile,
  dimension: KnowledgeDimension,
  evidence: string,
  misconceptionIds: string[]
): Profile {
  if (!isDimension(dimension)) return profile;
  let next = structuredCloneSafe(profile);
  const safe = safeEvidence(evidence);
  if (safe) {
    next[dimension].demonstrated = addUnique(next[dimension].demonstrated, safe);
    next[dimension].state = 'demonstrated';
  } else {
    next[dimension].state = promote(next[dimension].state, 'developing');
  }
  next = resolveMisconceptions(next, misconceptionIds);
  return next;
}

export function sanitizeProfile(value: unknown): Profile {
  const profile = createProfile();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return profile;
  const source = value as Record<string, unknown>;

  for (const dimension of KNOWLEDGE_DIMENSIONS) {
    const raw = source[dimension];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const entry = raw as Record<string, unknown>;
    const target = profile[dimension];
    target.state = isState(entry.state) ? entry.state : 'not-assessed';
    target.claimed = Array.isArray(entry.claimed)
      ? entry.claimed.map((item) => safeEvidence(item)).filter(Boolean).slice(0, 5)
      : [];
    target.demonstrated = Array.isArray(entry.demonstrated)
      ? entry.demonstrated.map((item) => safeEvidence(item)).filter(Boolean).slice(0, 5)
      : [];
    target.misconceptions = Array.isArray(entry.misconceptions)
      ? entry.misconceptions
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
          .map((item) => ({
            id: typeof item.id === 'string' ? item.id.slice(0, 60) : '',
            resolved: item.resolved === true,
            note: safeEvidence(item.note, 120)
          }))
          .filter((item) => item.id && item.note)
          .slice(0, 6)
      : [];
  }
  return profile;
}

export function unresolvedMisconceptions(profile: Profile): MisconceptionRecord[] {
  return KNOWLEDGE_DIMENSIONS.flatMap((dimension) =>
    profile[dimension].misconceptions.filter((item) => !item.resolved)
  ).slice(0, 8);
}

function structuredCloneSafe(profile: Profile): Profile {
  return KNOWLEDGE_DIMENSIONS.reduce((next, dimension) => {
    const entry = profile[dimension] ?? emptyEntry(dimension);
    next[dimension] = {
      dimension,
      state: isState(entry.state) ? entry.state : 'not-assessed',
      claimed: [...(entry.claimed ?? [])],
      demonstrated: [...(entry.demonstrated ?? [])],
      misconceptions: (entry.misconceptions ?? []).map((item) => ({ ...item }))
    };
    return next;
  }, {} as Profile);
}
