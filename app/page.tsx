import Link from 'next/link';
import { nonAdvice } from '../lib/content';
export default function Home() {
  return <div className="page landing"><section className="hero"><div className="eyebrow">A quieter way to think about investing</div>
    <h1>Understand your decision before deciding what comes next.</h1>
    <p className="lead">Untangle unfamiliar terms, examine the advice you have heard, and keep a record of what you know and what you still need to learn.</p>
    <div className="actions"><Link href="/start" className="button primary">Think through a decision</Link><Link href="/journey?demo=1" className="button secondary">Explore a synthetic example</Link></div>
    <p className="supporting">No account. No brokerage connection. Your reflections stay in this browser.</p></section>
    <section className="sample-panel" aria-label="An example decision snapshot"><div className="panel-top"><span>Decision snapshot</span><span className="small-badge">A place to return to</span></div>
      <div className="sample-block"><small>THE QUESTION</small><p>What am I trying to understand?</p></div><div className="sample-block"><small>WHAT I KNOW</small><p>The decision matters to me. I can name what I do and do not know.</p></div><div className="sample-block"><small>WHAT TO REVISIT</small><p>My assumptions, the source of advice, and the next question.</p></div></section>
    <section className="section narrow"><h2>Make room for a second thought.</h2><p>A difficult outcome can leave more questions than answers. Growerr helps you write those questions down without pushing you toward a trade.</p><div className="three-steps"><div><span className="step-number">01</span><h3>Describe the decision</h3><p>Start with your own question. Financial details are optional.</p></div><div><span className="step-number">02</span><h3>Inspect uncertainty</h3><p>Translate terms and separate claims from evidence.</p></div><div><span className="step-number">03</span><h3>Keep your reasoning</h3><p>Save a snapshot and revisit it when something changes.</p></div></div></section>
    <p className="disclaimer narrow" role="note">{nonAdvice}</p></div>;
}
