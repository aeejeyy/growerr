import type { CSSProperties } from 'react';

/** Inline style for a staggered scroll reveal (`data-reveal` elements). */
export const delay = (ms: number): CSSProperties => ({ ['--reveal-delay' as string]: `${ms}ms` }) as CSSProperties;
