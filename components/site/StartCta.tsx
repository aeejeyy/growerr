'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JOURNEY_STORAGE_KEY as STORAGE_KEY } from '../../lib/constants';

/** "Start your journey", or "Continue your journey" when a saved journey exists in this browser. */
export default function StartCta({ className }: { className: string }) {
  const [returning, setReturning] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw && /"role":"user"/.test(raw)) setReturning(true);
    } catch {
      // storage unavailable
    }
  }, []);
  return (
    <Link href="/start" className={className}>
      {returning ? 'Continue your journey' : 'Start your journey'} <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
