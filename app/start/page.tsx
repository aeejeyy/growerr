import Link from 'next/link';
import { scenarioNames } from '../../lib/types';
import { scenarioHints, nonAdvice } from '../../lib/content';
export default function Start() {
  const choices = ['exploring', 'considering', 'revisiting'] as const;
  return <div className="page narrow"><div className="eyebrow">Start with where you are</div><h1>What brings you here?</h1><p className="lead">Choose the situation that feels closest. You can change your mind later.</p>
    <div className="choice-list">{choices.map((key, index) => <Link className="choice" href={`/journey?scenario=${key}`} key={key}><span className="choice-index">0{index + 1}</span><span><strong>{scenarioNames[key]}</strong><span className="choice-note">{scenarioHints[key]}</span></span><span className="choice-arrow" aria-hidden="true">↗</span></Link>)}</div>
    <Link href="/journey?demo=1" className="text-link">Explore a clearly labelled synthetic example</Link><p className="disclaimer" role="note">{nonAdvice}</p></div>;
}
