'use client';

import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LabProps } from './types';
import { Callout, SimBadge, cx } from '../ui';

type Row = { id: string; name: string; who: string; what: string };

const ROWS: Row[] = [
  { id: 'brokerage', name: 'Brokerage', who: 'Your broker', what: 'The broker’s fee for executing your order. It varies by broker and plan, and some brokers charge zero for certain delivery trades.' },
  { id: 'stt', name: 'Securities Transaction Tax (STT)', who: 'Government of India', what: 'A tax on buying and selling securities on an exchange. The broker collects it and passes it on.' },
  { id: 'exchange', name: 'Exchange transaction charges', who: 'Stock exchange', what: 'A fee the exchange charges for using its trading system, based on the trade value.' },
  { id: 'sebi', name: 'SEBI turnover fee', who: 'SEBI (market regulator)', what: 'A small regulatory fee on trade turnover.' },
  { id: 'stamp', name: 'Stamp duty', who: 'State government (collected centrally)', what: 'A duty on the transfer of securities, charged on the buy side.' },
  { id: 'gst', name: 'GST', who: 'Government (Goods and Services Tax)', what: 'Applies to services: charged on brokerage and on exchange and SEBI charges — not on the trade value itself.' },
  { id: 'dp', name: 'DP charges (on sell)', who: 'Depository participant (via your broker)', what: 'Charged when shares are debited from your demat account, i.e. when you sell delivery holdings. Not on this buy.' }
];

export default function ChargesExplorerLab({ onExplored }: LabProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const reported = useRef(false);

  function toggle(id: string) {
    setOpen(open === id ? null : id);
    const next = new Set(seen).add(id);
    setSeen(next);
    if (!reported.current && next.size >= 3) {
      reported.current = true;
      onExplored();
    }
  }

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Read a contract note</h3>
        <SimBadge>Simulated contract note</SimBadge>
      </div>

      <div className="rounded-xl border border-line">
        <div className="border-b border-line bg-canvas px-4 py-3 text-sm">
          <p className="font-semibold text-ink">Hypothetical delivery buy · Company A</p>
          <p className="text-xs text-ink-muted">Invented trade. Tap each charge to see who levies it. {seen.size} of {ROWS.length} opened.</p>
        </div>
        <ul className="divide-y divide-line">
          {ROWS.map((row) => {
            const isOpen = open === row.id;
            return (
              <li key={row.id}>
                <button type="button" aria-expanded={isOpen} onClick={() => toggle(row.id)}
                  className="flex min-h-[44px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-canvas">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', seen.has(row.id) ? 'bg-brand-500' : 'bg-line-strong')} aria-hidden="true" />
                    <span className="min-w-0 font-medium text-ink">{row.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 tabular-nums text-ink-muted">
                    —<ChevronDown size={16} aria-hidden="true" className={cx('transition', isOpen && 'rotate-180')} />
                  </span>
                </button>
                {isOpen && (
                  <div className="animate-fade-up space-y-1 px-4 pb-3 text-sm" aria-live="polite">
                    <p><span className="font-semibold text-ink">Levied by:</span> <span className="text-ink-soft">{row.who}</span></p>
                    <p className="text-ink-soft">{row.what}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className="border-t border-line px-4 py-3 text-xs text-ink-muted">Amounts shown as “—” on purpose: real amounts depend on your broker, the segment and the trade value, and rates change.</p>
      </div>

      <Callout tone="accent" title="Where to verify">
        Check your broker’s official pricing or charges page before you trade, and read the contract note you receive after every trade — it lists each charge actually applied.
      </Callout>
    </div>
  );
}
