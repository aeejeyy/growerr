'use client';

import { applyDiscovery, staticDiscovery } from './discovery';
import { staticEvaluate, type Answer } from './evaluation';
import { newId } from './storage';
import type { Check, DiscoveryAnalysis, Evaluation, ExperienceId, JourneyState } from './types';

type DiscoverResponse = { mode: 'ai' | 'static' | 'safety'; analysis: DiscoveryAnalysis };

export async function discover(state: JourneyState, message: string): Promise<JourneyState> {
  const at = new Date().toISOString();
  const userTurns = state.messages.filter((m) => m.role === 'user').length;
  let analysis: DiscoveryAnalysis;
  let mode: DiscoverResponse['mode'] = 'static';
  try {
    const response = await fetch('/api/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: 'discover',
        message,
        userTurns,
        history: state.messages.slice(-10).map((m) => ({ role: m.role, text: m.text })),
        context: {
          intent: state.intent,
          objective: state.objective,
          motivation: state.motivation,
          concerns: state.concerns,
          experience: state.experience,
          appFamiliarity: state.appFamiliarity
        }
      })
    });
    if (!response.ok) throw new Error('bad status');
    const data = (await response.json()) as DiscoverResponse;
    if (!data?.analysis?.reply) throw new Error('bad payload');
    analysis = data.analysis;
    mode = data.mode;
  } catch {
    analysis = staticDiscovery(message, state);
  }

  const withUser: JourneyState = {
    ...state,
    messages: [...state.messages, { id: newId(), role: 'user', text: message, at }]
  };
  const next = mode === 'safety' && !analysis.adviceRequest ? withUser : applyDiscovery(withUser, analysis);
  const guide = [
    { id: newId(), role: 'guide' as const, text: analysis.reply, terms: analysis.terms.length ? analysis.terms : undefined, source: mode, at },
    ...(analysis.followUp ? [{ id: newId(), role: 'guide' as const, text: analysis.followUp, source: mode, at }] : [])
  ];
  return {
    ...next,
    messages: [...next.messages, ...guide].slice(-60),
    aiMode: mode === 'ai' ? 'ai' : mode === 'static' ? 'static' : next.aiMode,
    log:
      mode === 'safety'
        ? [...next.log, { at, kind: 'safety' as const, text: analysis.adviceRequest ? 'Explained the advice boundary.' : 'Ignored private details.' }].slice(-40)
        : next.log,
    updatedAt: at
  };
}

export async function evaluate(experienceId: ExperienceId, check: Check, answer: Answer): Promise<Evaluation> {
  if (check.kind !== 'explain') return staticEvaluate(check, answer);
  try {
    const response = await fetch('/api/journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'evaluate', experienceId, checkId: check.id, answer })
    });
    if (!response.ok) throw new Error('bad status');
    const data = (await response.json()) as { evaluation?: Evaluation };
    if (!data.evaluation || typeof data.evaluation.correct !== 'boolean') throw new Error('bad payload');
    return data.evaluation;
  } catch {
    return staticEvaluate(check, answer);
  }
}
