import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const dir = mkdtempSync(join(tmpdir(), 'growerr-tests-'));
let checks = 0;

try {
  execFileSync('node', [
    requireResolveTsc(),
    fileURLToPath(new URL('../lib/onboarding.ts', import.meta.url)),
    '--target', 'ES2020',
    '--module', 'Node16',
    '--moduleResolution', 'node16',
    '--skipLibCheck',
    '--outDir', dir
  ], { stdio: 'pipe', cwd: dir });

  const onboarding = await import(pathToFileURL(join(dir, 'onboarding.js')));

  assert.equal(onboarding.questions.length, 6);
  checks++;
  assert.deepEqual(onboarding.questions.map((question) => question.key), ['goal', 'horizon', 'risk', 'budget', 'experience', 'priority']);
  checks++;

  for (const question of onboarding.questions) {
    assert.ok(question.options.length >= 3, question.key + ' should offer real choices');
    assert.equal(new Set(question.options.map((option) => option.value)).size, question.options.length, question.key + ' values must be unique');
    assert.ok(question.title.endsWith('?'), question.key + ' should ask a question');
    checks += 2;
  }

  assert.equal(onboarding.optionLabel('goal', 'grow'), 'Grow my money');
  checks++;
  assert.equal(onboarding.optionLabel('priority', 'missing'), 'missing');
  checks++;

  const sample = {
    goal: 'learn',
    horizon: 'long',
    risk: 'hold',
    budget: '500to5k',
    experience: 'new',
    priority: 'learn'
  };

  assert.equal(onboarding.isCompleteAnswers(sample), true);
  checks++;
  assert.equal(onboarding.isCompleteAnswers({ ...sample, risk: undefined }), false);
  checks++;
  assert.equal(onboarding.isCompleteAnswers({ ...sample, risk: 'yolo' }), false);
  checks++;
  assert.equal(onboarding.isCompleteAnswers('not an object'), false);
  checks++;

  assert.deepEqual(onboarding.sanitizeAnswers({ goal: 'grow', risk: 'yolo', extra: 'ignored' }), { goal: 'grow' });
  checks++;
  assert.deepEqual(onboarding.sanitizeAnswers(null), {});
  checks++;

  const rows = onboarding.summaryRows(sample);
  assert.equal(rows.length, 6);
  checks++;
  assert.equal(rows[0].value, 'Learn by doing');
  checks++;
  assert.match(rows[2].value, /hold on/);
  checks++;

  const privateBudget = onboarding.summaryRows({ ...sample, budget: 'private' });
  assert.equal(privateBudget[3].value, 'Prefer not to say');
  checks++;

  const topics = onboarding.suggestedTopics(sample);
  assert.equal(topics.length, 3);
  checks++;
  assert.ok(topics.includes('Investing basics and common account types'));
  checks++;

  const shortGoal = onboarding.suggestedTopics({ ...sample, goal: 'goal', horizon: 'short', priority: 'safety' });
  assert.ok(shortGoal.length <= 3);
  checks++;

  const text = onboarding.summaryText(sample);
  assert.match(text, /My Growerr starting point/);
  assert.match(text, /Learn by doing/);
  assert.match(text, /not affiliated with Groww/);
  checks += 3;

  assert.equal(onboarding.GROWW_URL, 'https://groww.in/');
  checks++;
  assert.equal(onboarding.progressPercent(0), 17);
  assert.equal(onboarding.progressPercent(5), 100);
  checks += 2;
  assert.equal(onboarding.answeredCount({ goal: 'grow', risk: 'hold' }), 2);
  checks++;

  console.log(`PASS: 6-question model, unique options, validation, sanitising, summary, topics, copy text, Groww URL and progress (${checks} checks)`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

function requireResolveTsc() {
  return createRequire(import.meta.url).resolve('typescript/lib/tsc.js', { paths: [process.cwd(), '/home/user'] });
}
