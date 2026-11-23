import type { Intent } from '../../lib/journey/types';

export const INTENT_LABELS: Record<Intent, string> = {
  investing: 'Investing',
  trading: 'Trading',
  exploring: 'Exploring',
  platform: 'Using a brokerage app',
  unclear: 'Still open'
};
