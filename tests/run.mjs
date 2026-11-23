/**
 * Growerr engine test suite.
 * Compiles lib/ with tsc to a temp dir (CommonJS) and exercises the
 * Adaptive Experience Engine, safety layer, validation and persistence.
 * Run: npm test
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dir = mkdtempSync(join(tmpdir(), 'growerr-tests-'));
let checks = 0;
const ok = (v, label) => { assert.ok(v, label); checks++; };
const eq = (a, b, label) => { assert.equal(a, b, label); checks++; };

function section(name) { console.log(`• ${name}`); }

try {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
  const files = ['education.ts', 'constants.ts', 'ai/gemini.ts', ...['text', 'types', 'profile', 'experiences', 'evaluation', 'discovery', 'engine', 'storage', 'summary', 'ai-evaluator'].map((f) => `journey/${f}.ts`)].map((f) => join(root, 'lib', f));
  execFileSync(process.execPath, [tsc, '--outDir', dir, '--rootDir', join(root, 'lib'), '--module', 'commonjs', '--target', 'es2022', '--moduleResolution', 'node', '--esModuleInterop', '--skipLibCheck', '--strict', ...files], { stdio: 'inherit' });
  writeFileSync(join(dir, 'package.json'), '{"type":"commonjs"}');
  const require = createRequire(join(dir, 'x.js'));
  const edu = require('./education.js');
  const X = require('./journey/experiences.js');
  const E = require('./journey/engine.js');
  const D = require('./journey/discovery.js');
  const V = require('./journey/evaluation.js');
  const P = require('./journey/profile.js');
  const S = require('./journey/storage.js');
  const SUM = require('./journey/summary.js');
  const AE = require('./journey/ai-evaluator.js');

  const rightAnswer = (c) => c.kind === 'choice' ? c.correctOptionId : c.kind === 'slider' ? c.accept.min : c.kind === 'sort' ? Object.fromEntries(c.items.map((i) => [i.id, i.bucketId])) : c.modelAnswer;
  const wrongAnswer = (c) => {
    if (c.kind === 'choice') return Object.keys(c.optionMisconception)[0] ?? c.options.find((o) => o.id !== c.correctOptionId).id;
    if (c.kind === 'slider') return c.start;
    if (c.kind === 'sort') return Object.fromEntries(c.items.map((i) => [i.id, c.buckets.find((b) => b.id !== i.bucketId).id]));
    return 'not sure';
  };
  const withDiscovery = (text) => {
    let s = S.createInitialState();
    s = { ...s, messages: [...s.messages, { id: 'u', role: 'user', text, at: '' }] };
    return D.applyDiscovery(s, D.staticDiscovery(text, S.createInitialState()));
  };
  const answer = (s, kind) => {
    const cur = E.currentCheck(s);
    const ans = kind === 'right' ? rightAnswer(cur.check) : wrongAnswer(cur.check);
    const evaln = V.staticEvaluate(cur.check, ans);
    const out = E.applyEvaluation(s, evaln);
    return { state: E.advanceCheck(out.state), decision: out.decision, evaln };
  };

  /* ---------------------------------------------------------------- */
  section('Experience library integrity');
  eq(X.EXPERIENCE_IDS.length, 10, '10 experiences');
  const sourceIds = new Set(edu.educationItems.map((i) => i.id));
  for (const id of X.EXPERIENCE_IDS) {
    const exp = X.EXPERIENCES[id];
    ok(exp.objective && exp.context && exp.outcome && exp.labPrompt, `${id} has objective/context/outcome/lab`);
    ok(exp.checks.length >= 2, `${id} has ≥2 core checks`);
    ok(exp.transfer, `${id} has transfer check`);
    for (const c of exp.checks) ok(exp.alternatives[c.id], `${id}/${c.id} has alternative`);
    const all = X.allChecks(exp);
    eq(new Set(all.map((c) => c.id)).size, all.length, `${id} check ids unique`);
    for (const c of all) {
      for (const m of c.misconceptionIds) ok(X.MISCONCEPTIONS[m], `${id}/${c.id} misconception ${m} exists`);
      eq(V.staticEvaluate(c, rightAnswer(c)).correct, true, `${id}/${c.id} accepts right answer`);
      eq(V.staticEvaluate(c, wrongAnswer(c)).correct, false, `${id}/${c.id} rejects wrong answer`);
      ok(X.findCheck(id, c.id), `${id}/${c.id} findable`);
    }
    for (const s of exp.sourceIds) ok(sourceIds.has(s), `${id} source ${s} exists`);
    for (const p of exp.prerequisites) ok(X.EXPERIENCES[p], `${id} prereq ${p} exists`);
  }
  for (const m of Object.values(X.MISCONCEPTIONS)) for (const r of m.remedies) ok(X.EXPERIENCES[r], `remedy ${r} exists`);

  /* ---------------------------------------------------------------- */
  section('Intent classification (static analyser)');
  const intents = [
    ['I have ₹5,000 and want to invest but don’t understand stocks vs mutual funds', 'investing'],
    ['I want to start a SIP for the long term', 'investing'],
    ['My savings are sitting idle and I want to grow my money', 'investing'],
    ['How do limit orders work?', 'trading'],
    ['I want to learn intraday trading', 'trading'],
    ['Why did my order not execute?', 'trading'],
    ['What is the difference between bid and ask', 'trading'],
    ['I downloaded a broker app and I am lost', 'platform'],
    ['What do watchlist and holdings mean in the app?', 'platform'],
    ['The interface of the trading app confuses me', 'platform'],
    ['I am a complete beginner and just curious', 'exploring'],
    ['Where do I even start? I want to learn the basics', 'exploring'],
    ['hello', 'unclear'],
    ['my friend told me something', 'unclear'],
    ['I want to understand shares and how owning a company works', 'investing'],
    ['I want to buy shares but don’t know what a market order is', 'trading'],
    ['What are mutual funds?', 'investing'],
    ['I am scared of losing money in stocks', 'investing'],
    ['explain the dashboard screen of my brokerage platform', 'platform'],
    ['I want to explore what the stock market is', 'investing']
  ];
  const hits = intents.filter(([t, want]) => D.detectIntent(t) === want).length;
  console.log(`  intent accuracy: ${hits}/${intents.length}`);
  ok(hits / intents.length >= 0.9, 'static intent accuracy ≥ 90%');

  /* ---------------------------------------------------------------- */
  section('Personalised planning (User A vs User B)');
  const a = E.buildPlan(withDiscovery('I have ₹5,000 and want to invest, but I don’t understand the difference between stocks and mutual funds.'));
  const aIds = a.plan.map((p) => p.id);
  console.log('  User A plan:', aIds.join(' → '));
  ok(aIds.includes('EXP-02'), 'User A gets stocks vs mutual funds');
  ok(aIds.indexOf('EXP-01') < aIds.indexOf('EXP-02') || !aIds.includes('EXP-01'), 'prerequisite EXP-01 before EXP-02');
  ok(!aIds.includes('EXP-06'), 'User A does not get limit orders');
  ok(a.plan.every((p) => p.reason.length > 10), 'every plan item explains why');

  const b = E.buildPlan(withDiscovery('I understand stocks and mutual funds, but I don’t know how limit orders work.'));
  const bIds = b.plan.map((p) => p.id);
  console.log('  User B plan:', bIds.join(' → '));
  ok(bIds.includes('EXP-06'), 'User B gets limit orders');
  ok(!bIds.includes('EXP-02'), 'User B skips stocks vs funds');
  ok(bIds.indexOf('EXP-06') <= 1, 'limit orders is first or right after its prerequisite');
  ok(JSON.stringify(aIds) !== JSON.stringify(bIds), 'A and B get different journeys');

  const c = E.buildPlan(withDiscovery('I downloaded a trading app and I don’t understand holdings, orders and funds.'));
  console.log('  Platform user plan:', c.plan.map((p) => p.id).join(' → '));
  ok(c.plan.some((p) => p.id === 'EXP-08'), 'platform beginner gets broker app tour');
  ok(c.plan.length >= 3 && c.plan.length <= 6, 'plan has 3–6 items');

  /* ---------------------------------------------------------------- */
  section('Claimed vs demonstrated knowledge');
  const claimed = withDiscovery('I understand stocks and mutual funds already');
  ok(['developing', 'not-assessed'].includes(claimed.profile.products.state), 'claim never yields demonstrated');
  const sig = P.applyClaim(P.createProfile(), 'risk', 'demonstrated', 'I know risk');
  eq(sig.risk.state, 'developing', 'a claimed "demonstrated" is downgraded to developing');

  /* ---------------------------------------------------------------- */
  section('Adaptation after an incorrect answer');
  let s = E.startExperience(b, 'EXP-06');
  s = E.setStage(E.markLabExplored(s), 'checks');
  const firstCheck = E.currentCheck(s).check;
  const r1 = answer(s, 'wrong');
  eq(r1.decision.type, 'alternative', 'wrong core answer → alternative explanation');
  ok(r1.decision.explanation.length > 20, 'alternative explanation provided');
  eq(E.currentCheck(r1.state).variant, 'alternative', 'next check is a fresh example');
  ok(E.currentCheck(r1.state).check.id !== firstCheck.id, 'fresh example is a different check');
  if (r1.evaln.misconceptionIds.length) {
    const m = r1.evaln.misconceptionIds[0];
    ok(P.unresolvedMisconceptions(r1.state.profile).some((x) => x.id === m), 'misconception recorded in profile');
    const r2 = answer(r1.state, 'right');
    ok(!P.unresolvedMisconceptions(r2.state.profile).some((x) => x.id === m), 'misconception resolved after correct fresh example');
    s = r2.state;
  } else {
    s = answer(r1.state, 'right').state;
  }

  // Second miss on an alternative → remedial experience gets scheduled
  let t = E.startExperience(a, 'EXP-02');
  t = E.setStage(E.markLabExplored(t), 'checks');
  let remedyDecision = null;
  for (let i = 0; i < 12 && t.phase === 'experience' && t.progress['EXP-02'].stage !== 'done'; i++) {
    const out = answer(t, 'wrong');
    if (out.decision.type === 'remedy') remedyDecision = out.decision;
    t = out.state;
  }
  eq(t.progress['EXP-02'].result, 'needs-review', 'all-wrong run is not marked complete');
  eq(t.plan.find((p) => p.id === 'EXP-02').status, 'needs-review', 'plan shows needs-review');
  ok(P.DIMENSIONS.every((d) => t.profile[d].state !== 'demonstrated'), 'no dimension demonstrated by clicking through');
  if (remedyDecision) {
    ok(t.plan.some((p) => p.id === remedyDecision.remedyId && p.status === 'pending'), 'remedy scheduled in plan');
    ok(E.nextPlanItem(t) === remedyDecision.remedyId || t.plan.findIndex((p) => p.id === remedyDecision.remedyId) > -1, 'remedy is reachable next');
    console.log('  remedy scheduled:', remedyDecision.remedyId);
  }
  ok(t.log.some((e) => e.kind === 'alternative'), 'adaptation log explains alternatives');

  /* ---------------------------------------------------------------- */
  section('Demonstrated understanding');
  for (const id of X.EXPERIENCE_IDS) {
    let u = E.startExperience(S.createInitialState(), id);
    u = E.setStage(E.markLabExplored(u), 'checks');
    for (let i = 0; i < 10 && u.progress[id].stage !== 'done'; i++) u = answer(u, 'right').state;
    eq(u.progress[id].result, 'demonstrated', `${id} all-correct (incl. transfer) → demonstrated`);
    ok(u.progress[id].outcomes.some((o) => o.variant === 'transfer'), `${id} includes transfer question`);
    ok([...X.EXPERIENCES[id].checks.map((c) => c.dimension), X.EXPERIENCES[id].transfer.dimension].every((d) => u.profile[d].state === 'demonstrated'), `${id} tested dimensions demonstrated`);
  }
  // Wrong then right on alternative + right transfer still demonstrates
  let w = E.startExperience(S.createInitialState(), 'EXP-05');
  w = E.setStage(E.markLabExplored(w), 'checks');
  w = answer(w, 'wrong').state;
  for (let i = 0; i < 10 && w.progress['EXP-05'].stage !== 'done'; i++) w = answer(w, 'right').state;
  eq(w.progress['EXP-05'].result, 'demonstrated', 'recovering via fresh example still demonstrates');

  /* ---------------------------------------------------------------- */
  section('Journey navigation: skip, revisit, summary');
  let n = E.continueJourney(b);
  const firstId = n.currentId;
  n = E.skipExperience(n);
  eq(n.plan.find((p) => p.id === firstId).status, 'skipped', 'skip marks skipped');
  ok(n.currentId !== firstId, 'skip moves on');
  n = E.startExperience(n, firstId);
  eq(n.currentId, firstId, 'can revisit skipped');
  n = E.addToPlan(n, 'EXP-09');
  ok(n.plan.some((p) => p.id === 'EXP-09' && p.addedBy === 'user'), 'user can add from library');
  n = E.goToSummary(n);
  eq(n.phase, 'summary', 'can finish any time');
  const text = SUM.summaryText(n);
  ok(/not investment advice/i.test(text), 'summary carries disclaimer');
  ok(!edu.ADVICE_PATTERNS.some((p) => p.test(text)), 'summary contains no advice phrasing');

  /* ---------------------------------------------------------------- */
  section('Misconception detection in free text');
  const mc = V.detectMisconceptions('I thought a market order guarantees the price shown on screen');
  ok(mc.length > 0, `detects market-order misconception (${mc.join(',')})`);
  const none = V.detectMisconceptions('A limit order does not guarantee execution; it only fills at my price or better.');
  ok(!none.some((id) => /limit/.test(id) && /guarantee|exec/.test(id)), 'negated statement is not flagged');

  /* ---------------------------------------------------------------- */
  section('Safety layer');
  for (const q of ['Which stock should I buy?', 'What should I invest in?', 'How much should I invest?', 'Recommend me a mutual fund', 'Should I sell my shares?']) {
    ok(edu.isAdviceRequest(q), `advice request detected: ${q}`);
  }
  for (const q of ['My PAN is ABCDE1234F', 'aadhaar 1234 5678 9012', 'my otp is 482910']) ok(edu.detectSensitive(q), `sensitive detected: ${q}`);
  ok(!edu.isAdviceRequest('How do limit orders work?'), 'normal question is not advice');
  const boundary = D.adviceBoundary(S.createInitialState());
  ok(boundary.adviceRequest && /can.t tell you what to buy/i.test(boundary.reply), 'advice boundary reply');

  /* ---------------------------------------------------------------- */
  section('AI output validation');
  const good = { reply: 'That makes sense — lots of people start there.', followUp: 'Have you invested before?', terms: [{ term: 'SIP', meaning: 'A way to invest a fixed amount at regular intervals.' }], intent: 'investing', objective: 'Understand SIPs', motivation: 'Friends talk about it', concerns: [], questions: [], experience: 'none', appFamiliarity: 'unknown', signals: [{ dimension: 'products', state: 'needs-introduction', evidence: 'what is a SIP' }, { dimension: 'risk', state: 'demonstrated', evidence: 'x' }, { dimension: 'bogus', state: 'developing', evidence: 'x' }], misconceptionIds: ['not-a-real-id'], focus: ['EXP-02', 'EXP-99'], readyToPlan: false, adviceRequest: false };
  const vg = D.validateDiscovery(good);
  ok(vg, 'valid AI analysis accepted');
  eq(vg.signals.length, 1, 'invalid/demonstrated signals dropped');
  eq(vg.focus.join(), 'EXP-02', 'unknown experience ids dropped');
  eq(vg.misconceptionIds.length, 0, 'unknown misconception ids dropped');
  eq(D.validateDiscovery({ ...good, reply: 'You should buy Company X now, it will rise.' }), null, 'advice in AI reply rejected');
  eq(D.validateDiscovery({ ...good, reply: 'Guaranteed returns of 12% await.' }), null, 'return promise rejected');
  eq(D.validateDiscovery({ ...good, intent: 'gambling' }), null, 'invalid intent rejected');
  eq(D.validateDiscovery('not an object'), null, 'non-object rejected');

  const explainCheck = X.allChecks(X.EXPERIENCES['EXP-02']).find((ch) => ch.kind === 'explain') ?? X.EXPERIENCE_IDS.flatMap((id) => X.allChecks(X.EXPERIENCES[id])).find((ch) => ch.kind === 'explain');
  const ve = AE.validateEvaluation({ correct: true, feedback: 'Nice work.', misconceptionIds: ['made-up'] }, explainCheck, explainCheck.modelAnswer);
  ok(ve && ve.correct && ve.misconceptionIds.length === 0, 'AI evaluation: unknown misconception ids stripped');
  const lenient = AE.validateEvaluation({ correct: true, feedback: 'Great.', misconceptionIds: [] }, explainCheck, 'ok');
  eq(lenient.correct, false, 'AI evaluation: over-generous grading of a trivial answer is overridden');
  eq(AE.validateEvaluation({ correct: true, feedback: 'You should buy it now.', misconceptionIds: [] }, explainCheck, 'x'), null, 'AI evaluation with advice rejected');

  /* ---------------------------------------------------------------- */
  section('Persistence & sanitisation');
  const saved = JSON.parse(JSON.stringify(w));
  const restored = S.sanitizeState(saved);
  ok(restored && restored.progress['EXP-05'].result === 'demonstrated', 'state round-trips');
  eq(S.sanitizeState({ version: 1 }), null, 'old/foreign versions ignored');
  const tampered = S.sanitizeState({ ...saved, currentId: 'EXP-99', plan: [{ id: 'EXP-77' }, { id: 'EXP-01', status: 'hacked' }], profile: { risk: { state: 'genius' } }, messages: 'x' });
  ok(tampered && tampered.currentId === null, 'tampered currentId dropped');
  eq(tampered.plan.length, 1, 'tampered plan items dropped');
  eq(tampered.plan[0].status, 'pending', 'tampered status normalised');
  eq(tampered.profile.risk.state, 'not-assessed', 'tampered profile normalised');
  ok(tampered.messages.length >= 1, 'messages fall back to opening prompt');

  console.log(`\n✅ ${checks} checks passed`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
