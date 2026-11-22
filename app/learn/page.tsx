'use client';
import { useState } from 'react';
import { glossary } from '../../lib/content';
export default function Learn() {
  const [query, setQuery] = useState('');
  const entries = Object.entries(glossary).filter(([term, definition]) => `${term} ${definition}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="page narrow"><div className="eyebrow">Plain-language reference</div><h1>Words worth understanding</h1><p className="lead">Short explanations to support your thinking, not to evaluate an investment.</p>
    <label htmlFor="term-search">Search terms</label><input id="term-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Try volatility or SIP" />
    <dl className="glossary-list">{entries.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl>{entries.length === 0 && <p className="empty">No matching term yet. Try another word.</p>}</div>;
}
