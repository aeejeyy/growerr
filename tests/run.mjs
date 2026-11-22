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
    fileURLToPath(new URL('../lib/education.ts', import.meta.url)),
    '--target', 'ES2020',
    '--module', 'Node16',
    '--moduleResolution', 'node16',
    '--skipLibCheck',
    '--outDir', dir
  ], { stdio: 'pipe', cwd: dir });

  const onboarding = await import(pathToFileURL(join(dir, 'onboarding.js')));
  const education = await import(pathToFileURL(join(dir, 'education.js')));

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

  assert.equal(education.GEMINI_ENDPOINT_V1, 'https://generativelanguage.googleapis.com/v1/interactions');
  checks++;
  assert.equal(education.GEMINI_MODEL, 'gemini-4-hydrogen');
  checks++;
  assert.equal(new Set(education.educationItems.map((item) => item.id)).size, education.educationItems.length);
  checks++;
  for (const item of education.educationItems) {
    assert.match(item.source.url, /^https:\/\//, item.id + ' source must use HTTPS');
    assert.ok(item.source.name.length > 3, item.id + ' needs a source name');
    assert.ok(item.text.length > 30, item.id + ' needs an explanation');
    checks += 3;
  }
  assert.ok(education.coachSources.length >= 4);
  assert.equal(new Set(education.coachSources.map((source) => source.url)).size, education.coachSources.length);
  checks += 2;

  const sipNotes = education.relevantEducation('What is a SIP?');
  assert.equal(sipNotes[0].id, 'sip');
  checks++;
  assert.ok(sipNotes.length <= 2);
  checks++;
  assert.equal(education.relevantEducation('hello')[0].id, 'beginner');
  checks++;

  assert.equal(education.detectSensitive('my PAN is ABCDE1234F'), true);
  checks++;
  assert.equal(education.detectSensitive('my Aadhaar is 1234 5678 9012'), true);
  checks++;
  assert.equal(education.detectSensitive('What is a SIP?'), false);
  checks++;
  assert.equal(education.isAdviceRequest('Which fund should I buy?'), true);
  checks++;
  assert.equal(education.isAdviceRequest('What is a SIP?'), false);
  checks++;

  const adviceReply = education.buildAdviceReply();
  assert.match(adviceReply.notice, /SEBI-registered Investment Adviser/);
  checks++;
  const sensitiveReply = education.buildSensitiveReply();
  assert.match(sensitiveReply.notice, /will not use these details/);
  checks++;

  const staticReply = education.buildStaticReply('What is a SIP?', 'missing_key');
  assert.equal(staticReply.explanations[0].sourceUrl, 'https://www.mutualfundssahihai.com/en/what-is-sip');
  checks++;
  assert.match(staticReply.notice, /not configured/);
  checks++;
  assert.match(staticReply.reflection, /What is a SIP/);
  checks++;
  assert.match(education.buildStaticReply('Not sure').reflection, /leave that open/i);
  checks++;

  const sip = education.educationItems.find((item) => item.id === 'sip');
  const validModelReply = {
    reflection: 'You asked about SIPs.',
    explanations: [{
      title: sip.title,
      text: sip.text,
      sourceName: sip.source.name,
      sourceUrl: sip.source.url
    }],
    unknowns: ['Whether you have used one before.'],
    question: 'Would you like the plain-language definition?',
    unsure: false
  };
  const accepted = education.normaliseModelReply(validModelReply, 'What is a SIP?');
  assert.ok(accepted);
  checks++;
  assert.equal(accepted.explanations[0].sourceUrl, sip.source.url);
  checks++;
  assert.equal(education.normaliseModelReply({ ...validModelReply, unsure: true }, 'What is a SIP?'), null);
  checks++;
  assert.equal(education.normaliseModelReply({
    ...validModelReply,
    reflection: 'Based on your income, you should buy this fund.'
  }, 'What is a SIP?'), null);
  checks++;
  assert.equal(education.normaliseModelReply({
    ...validModelReply,
    question: 'What is your age? Would you like the definition?'
  }, 'What is a SIP?'), null);
  checks++;
  assert.equal(education.normaliseModelReply({
    ...validModelReply,
    reflection: 'The current price is ₹100.'
  }, 'What is a SIP?'), null);
  checks++;
  assert.equal(education.normaliseModelReply({
    ...validModelReply,
    question: 'See https://example.com for details?'
  }, 'What is a SIP?'), null);
  checks++;
  const replaced = education.normaliseModelReply({
    ...validModelReply,
    explanations: [{
      title: 'Not approved',
      text: 'This invented note was not in the approved list.',
      sourceName: 'Random page',
      sourceUrl: 'https://example.com/random'
    }]
  }, 'What is a SIP?');
  assert.ok(replaced);
  checks++;
  assert.equal(replaced.explanations[0].sourceUrl, sip.source.url);
  checks++;

  const longHistory = Array.from({ length: 10 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'guide',
    text: `oldest message ${index}`
  }));
  const geminiRequest = education.buildGeminiRequest('What is a SIP?', longHistory, 'test-model');
  assert.equal(geminiRequest.model, 'test-model');
  checks++;
  assert.equal(geminiRequest.store, false);
  checks++;
  assert.equal(geminiRequest.system_instruction, education.COACH_SYSTEM_PROMPT);
  checks++;
  assert.match(geminiRequest.input, /Latest user message.*What is a SIP/);
  checks++;
  assert.equal(geminiRequest.input.includes('oldest message 0'), false);
  checks++;
  assert.equal(geminiRequest.response_format.type, 'text');
  checks++;
  assert.equal(geminiRequest.response_format.mime_type, 'application/json');
  checks++;
  assert.ok(geminiRequest.response_format.schema.properties.reflection);
  checks++;
  assert.ok(geminiRequest.generation_config.max_output_tokens > 0);
  checks++;

  const structuredPayload = {
    reflection: 'You asked about SIPs.',
    explanations: [],
    unknowns: [],
    question: 'Would you like more?',
    unsure: false
  };
  assert.equal(education.isCompletedInteraction({ status: 'completed' }), true);
  checks++;
  assert.equal(education.isCompletedInteraction({ status: 'failed' }), false);
  checks++;
  assert.equal(education.isCompletedInteraction({}), true);
  checks++;
  assert.equal(education.extractGeminiText({ output_text: JSON.stringify(structuredPayload) }), JSON.stringify(structuredPayload));
  checks++;
  assert.ok(education.extractGeminiText(structuredPayload));
  checks++;
  assert.equal(
    education.extractGeminiText({ steps: [{ type: 'model_output', content: [{ type: 'text', text: '{"ok":true}' }] }] }),
    '{"ok":true}'
  );
  checks++;

  console.log(`PASS: onboarding model and education/coach safety model (${checks} checks)`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

function requireResolveTsc() {
  return createRequire(import.meta.url).resolve('typescript/lib/tsc.js', { paths: [process.cwd(), '/home/user'] });
}
