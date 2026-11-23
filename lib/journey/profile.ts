/**
 * User Understanding Profile (Module 2).
 *
 * Keeps CLAIMED knowledge (what someone says) strictly separate from
 * DEMONSTRATED knowledge (what they showed in a check). Discovery can only
 * move a dimension to "needs-introduction" or "developing"; only a correct
 * check answer can move it to "demonstrated".
 */
import { detectSensitive } from '../education';
import type { Dimension, KnowledgeState, Profile, ProfileEntry } from './types';

export const DIMENSIONS: Dimension[] = ['fundamentals', 'products', 'risk', 'tradingMechanics', 'platform', 'decisions'];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  fundamentals: 'Investment fundamentals',
  products: 'Financial products',
  risk: 'Risk & volatility',
  tradingMechanics: 'Trading mechanics',
  platform: 'Brokerage app familiarity',
  decisions: 'Financial decision concepts'
};

export const STATE_LABELS: Record<KnowledgeState, string> = {
  'not-assessed': 'Not assessed',
  'needs-introduction': 'Needs introduction',
  developing: 'Developing',
  demonstrated: 'Demonstrated'
};

export const STATES: KnowledgeState[] = ['not-assessed', 'needs-introduction', 'developing', 'demonstrated'];

export function isDimension(value: unknown): value is Dimension {
  return typeof value === 'string' && (DIMENSIONS as string[]).includes(value);
}

export function isState(value: unknown): value is KnowledgeState {
  return typeof value === 'string' && (STATES as string[]).includes(value);
}

export function safeEvidence(value: unknown, maxLength = 140): string {
  if (typeof value !== 'string') return '';
  if (detectSensitive(value)) return '';
  const cleaned = value
    .replace(/https?:\/\/\S+|www\.\S+/gi, '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '')
    .replace(/\b\d{6,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1).trimEnd()}…` : cleaned;
}

function emptyEntry(dimension: Dimension): ProfileEntry {
  return { dimension, state: 'not-assessed', claimed: [], demonstrated: [], misconceptions: [] };
}

export function createProfile(): Profile {
  return Object.fromEntries(DIMENSIONS.map((d) => [d, emptyEntry(d)])) as Profile;
}

function clone(profile: Profile): Profile {
  return Object.fromEntries(
    DIMENSIONS.map((d) => {
      const e = profile[d] ?? emptyEntry(d);
      return [d, { ...e, claimed: [...e.claimed], demonstrated: [...e.demonstrated], misconceptions: e.misconceptions.map((m) => ({ ...m })) }];
    })
  ) as Profile;
}

function addUnique(list: string[], value: string, limit = 4): string[] {
  if (!value || list.some((item) => item.toLowerCase() === value.toLowerCase())) return list;
  return [...list, value].slice(-limit);
}

/** Apply something the person SAID. Never produces "demonstrated". */
export function applyClaim(profile: Profile, dimension: Dimension, state: KnowledgeState, evidence: string): Profile {
  if (!isDimension(dimension)) return profile;
  const next = clone(profile);
  const entry = next[dimension];
  const safe = safeEvidence(evidence);
  if (safe) entry.claimed = addUnique(entry.claimed, safe);
  const claimed: KnowledgeState = state === 'demonstrated' ? 'developing' : state;
  // Claims only move state when nothing has been demonstrated yet.
  if (entry.state === 'not-assessed' || (entry.state === 'needs-introduction' && claimed === 'developing')) {
    if (claimed !== 'not-assessed') entry.state = claimed;
  }
  return next;
}

export function recordMisconception(profile: Profile, dimension: Dimension, id: string, source: 'discovery' | 'check'): Profile {
  if (!isDimension(dimension) || !id) return profile;
  const next = clone(profile);
  const entry = next[dimension];
  const existing = entry.misconceptions.find((m) => m.id === id);
  if (existing) {
    existing.resolved = false;
    existing.resolvedAt = undefined;
  } else {
    entry.misconceptions = [...entry.misconceptions, { id, source, resolved: false, detectedAt: new Date().toISOString() }].slice(-8);
  }
  // A misconception means the dimension is not yet understood.
  entry.state = entry.state === 'demonstrated' ? 'developing' : 'needs-introduction';
  return next;
}

export function resolveMisconception(profile: Profile, id: string): Profile {
  const next = clone(profile);
  for (const d of DIMENSIONS) {
    for (const m of next[d].misconceptions) {
      if (m.id === id && !m.resolved) {
        m.resolved = true;
        m.resolvedAt = new Date().toISOString();
      }
    }
  }
  return next;
}

/** A correct check answer. Moves the dimension forward based on evidence. */
export function applyDemonstration(profile: Profile, dimension: Dimension, evidence: string, fullyDemonstrated: boolean): Profile {
  if (!isDimension(dimension)) return profile;
  const next = clone(profile);
  const entry = next[dimension];
  entry.demonstrated = addUnique(entry.demonstrated, safeEvidence(evidence, 120), 6);
  const open = entry.misconceptions.some((m) => !m.resolved);
  entry.state = fullyDemonstrated && !open ? 'demonstrated' : entry.state === 'demonstrated' ? 'demonstrated' : 'developing';
  return next;
}

export function unresolvedMisconceptions(profile: Profile) {
  return DIMENSIONS.flatMap((d) => profile[d].misconceptions.filter((m) => !m.resolved).map((m) => ({ ...m, dimension: d })));
}

export function resolvedMisconceptions(profile: Profile) {
  return DIMENSIONS.flatMap((d) => profile[d].misconceptions.filter((m) => m.resolved).map((m) => ({ ...m, dimension: d })));
}

export function sanitizeProfile(value: unknown): Profile {
  const profile = createProfile();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return profile;
  const source = value as Record<string, unknown>;
  for (const d of DIMENSIONS) {
    const raw = source[d];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const e = raw as Record<string, unknown>;
    const strings = (v: unknown, n: number) =>
      Array.isArray(v) ? v.map((item) => safeEvidence(item)).filter(Boolean).slice(-n) : [];
    profile[d] = {
      dimension: d,
      state: isState(e.state) ? e.state : 'not-assessed',
      claimed: strings(e.claimed, 4),
      demonstrated: strings(e.demonstrated, 6),
      misconceptions: Array.isArray(e.misconceptions)
        ? e.misconceptions
            .filter((m): m is Record<string, unknown> => Boolean(m) && typeof m === 'object')
            .map((m) => ({
              id: typeof m.id === 'string' ? m.id.slice(0, 60) : '',
              source: m.source === 'discovery' ? ('discovery' as const) : ('check' as const),
              resolved: m.resolved === true,
              detectedAt: typeof m.detectedAt === 'string' ? m.detectedAt : new Date().toISOString(),
              resolvedAt: typeof m.resolvedAt === 'string' ? m.resolvedAt : undefined
            }))
            .filter((m) => m.id)
            .slice(-8)
        : []
    };
  }
  return profile;
}
