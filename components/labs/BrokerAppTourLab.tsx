'use client';

import { useRef, useState } from 'react';
import { Briefcase, ClipboardList, Eye, Wallet } from 'lucide-react';
import type { LabProps } from './types';
import { SimBadge, cx } from '../ui';

type TabId = 'watchlist' | 'orders' | 'holdings' | 'funds';
type Hotspot = { id: string; label: string; explain: string };

const TABS: { id: TabId; label: string; icon: typeof Eye; rows: [string, string][]; hotspots: Hotspot[] }[] = [
  {
    id: 'watchlist', label: 'Watchlist', icon: Eye,
    rows: [['Company A', '—'], ['Company B', '—'], ['Company C', '—']],
    hotspots: [
      { id: 'w1', label: 'What is this list?', explain: 'A watchlist is just companies you chose to track. Adding one here does not buy anything or cost anything.' },
      { id: 'w2', label: 'Does it mean I own them?', explain: 'No. You own nothing from a watchlist. Ownership only appears in Holdings after an order executes and settles.' }
    ]
  },
  {
    id: 'orders', label: 'Orders', icon: ClipboardList,
    rows: [['Buy · Company A · Limit', 'Open'], ['Buy · Company B · Market', 'Executed'], ['Sell · Company C · Limit', 'Cancelled']],
    hotspots: [
      { id: 'o1', label: 'What is an order?', explain: 'An order is an instruction you send to buy or sell. It is not yet something you own.' },
      { id: 'o2', label: 'Open vs executed', explain: 'Open means the order is still waiting for a matching price. Executed means a trade happened. Cancelled means it will not execute.' },
      { id: 'o3', label: 'Why is one cancelled?', explain: 'Orders can be cancelled by you, or expire per the order’s validity and the broker’s rules if they don’t execute.' }
    ]
  },
  {
    id: 'holdings', label: 'Holdings', icon: Briefcase,
    rows: [['Company B', 'Qty 2 · simulated']],
    hotspots: [
      { id: 'h1', label: 'Why only one here?', explain: 'Holdings show what you own after an order executes and the trade settles. Open or cancelled orders never appear here.' },
      { id: 'h2', label: 'Can the value change?', explain: 'Yes. The value of a holding moves with the market, in both directions.' }
    ]
  },
  {
    id: 'funds', label: 'Funds', icon: Wallet,
    rows: [['Available', '— (simulated)'], ['Blocked for open orders', '— (simulated)']],
    hotspots: [
      { id: 'f1', label: 'Available vs blocked', explain: 'Available is cash you can use for new orders. Blocked is cash set aside for open buy orders until they execute or are cancelled.' },
      { id: 'f2', label: 'Does adding funds invest?', explain: 'No. Adding funds only moves cash into the broker account. Nothing is bought until you place an order and it executes.' }
    ]
  }
];

export default function BrokerAppTourLab({ onExplored }: LabProps) {
  const [tab, setTab] = useState<TabId>('watchlist');
  const [visited, setVisited] = useState<Set<TabId>>(new Set(['watchlist']));
  const [open, setOpen] = useState<string | null>(null);
  const reported = useRef(false);
  const current = TABS.find((t) => t.id === tab)!;

  function go(id: TabId) {
    setTab(id);
    setOpen(null);
    const next = new Set(visited).add(id);
    setVisited(next);
    if (!reported.current && next.size >= 3) {
      reported.current = true;
      onExplored();
    }
  }

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Tour an example broker app</h3>
        <SimBadge />
      </div>
      <p className="text-sm text-ink-muted" aria-live="polite">{visited.size} of 4 tabs explored</p>

      <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[28px] border-[6px] border-ink bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-sm font-semibold">Example broker app</span>
          <span className="text-[10px] font-medium text-ink-muted">not a real app</span>
        </div>
        <div className="min-h-[300px] space-y-3 p-4">
          <p className="text-lg font-semibold">{current.label}</p>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {current.rows.map(([a, b]) => (
              <li key={a} className="flex justify-between gap-2 px-3 py-2.5 text-sm">
                <span className="min-w-0 truncate text-ink">{a}</span>
                <span className="shrink-0 tabular-nums text-ink-muted">{b}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            {current.hotspots.map((h) => (
              <div key={h.id}>
                <button type="button" aria-expanded={open === h.id} onClick={() => setOpen(open === h.id ? null : h.id)}
                  className={cx('flex min-h-[36px] w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition', open === h.id ? 'bg-brand-50 text-brand-800' : 'bg-canvas text-ink-soft hover:bg-brand-50')}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />{h.label}
                </button>
                {open === h.id && <p className="mt-1.5 animate-fade-up px-3 text-sm text-ink-soft">{h.explain}</p>}
              </div>
            ))}
          </div>
        </div>
        <nav className="grid grid-cols-4 border-t border-line" aria-label="Example app tabs">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button key={t.id} type="button" onClick={() => go(t.id)} aria-current={active ? 'page' : undefined}
                className={cx('flex min-h-[52px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold', active ? 'text-brand-700' : 'text-ink-muted')}>
                <Icon size={18} aria-hidden="true" />{t.label}
                {visited.has(t.id) && !active && <span className="sr-only">(visited)</span>}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
