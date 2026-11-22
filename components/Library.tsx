'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listRecords } from '../lib/storage';
import { scenarioNames, type DecisionSnapshot } from '../lib/types';
export default function Library() {
  const [records, setRecords] = useState<DecisionSnapshot[] | null>(null); const [error, setError] = useState('');
  function load() { try { setRecords(listRecords().sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Could not load the decisions.'); } }
  useEffect(() => { load(); }, []);
  return <div className="page narrow"><div className="eyebrow">Your decision history</div><h1>My decisions</h1><p className="lead">Return to your reasoning when something changes. These records are saved only in this browser.</p>
    <div className="actions"><Link className="button primary" href="/start">Start a decision</Link></div>
    {error ? <div role="alert" className="error-banner">{error} <button type="button" className="button secondary" onClick={load}>Try again</button> <Link className="text-link" href="/about">Manage browser data</Link></div> : records === null ? <p>Loading saved decisions...</p> : records.length === 0 ? <div className="empty"><p>No decisions saved here yet.</p><Link className="text-link" href="/start">Think through your first decision</Link></div> : <div className="library-list">{records.map(record => <div className="library-item" key={record.id}><div><h2><Link className="text-link" href={`/snapshot/${record.id}`}>{record.title}</Link></h2><p>{scenarioNames[record.scenario]} · Updated {new Date(record.updatedAt).toLocaleDateString('en-IN')} · {record.reviews.length} {record.reviews.length === 1 ? 'review' : 'reviews'}</p>{record.isSyntheticDemo && <span className="synthetic">Synthetic example</span>}</div><Link href={`/snapshot/${record.id}`} className="button secondary" aria-label={`Open ${record.title}`}>Open</Link></div>)}</div>}
  </div>;
}
