import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const dir = mkdtempSync(join(tmpdir(), 'growerr-tests-'));
try {
  execFileSync('node', [requireResolveTsc(), fileURLToPath(new URL('../lib/types.ts', import.meta.url)), fileURLToPath(new URL('../lib/math.ts', import.meta.url)), fileURLToPath(new URL('../lib/storage.ts', import.meta.url)), '--target', 'ES2020', '--module', 'Node16', '--moduleResolution', 'node16', '--skipLibCheck', '--outDir', dir], { stdio: 'pipe', cwd: dir });
  const math = await import(pathToFileURL(join(dir, 'math.js')));
  assert.equal(math.illustrativeDecline(3500, 10), 350);
  assert.equal(math.illustrativeDecline(3500, 30), 1050);
  assert.throws(() => math.illustrativeDecline(-10, 10));
  assert.throws(() => math.illustrativeDecline(NaN, 10));
  const data = new Map();
  global.window = { localStorage: { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) } };
  const storage = await import(pathToFileURL(join(dir, 'storage.js')));
  const types = await import(pathToFileURL(join(dir, 'types.js')));
  assert.equal(storage.readDraft(), null);
  const draft = types.blankDraft('exploring'); draft.title = 'Learn before deciding'; draft.decisionQuestion = 'What am I trying to understand?';
  storage.saveDraft(draft); assert.equal(storage.readDraft().title, draft.title);
  const demo = types.demoDraft(); assert.equal(demo.isSyntheticDemo, true);
  const now = new Date().toISOString();
  const record = { ...draft, id: 'test-1', schemaVersion: 1, createdAt: now, updatedAt: now, reviews: [] };
  storage.upsertRecord(record); assert.equal(storage.getRecord('test-1').title, draft.title);
  storage.upsertRecord({ ...record, title: 'Updated' }); assert.equal(storage.getRecord('test-1').title, 'Updated');
  const review = { id: 'review-1', createdAt: now, whatChanged: 'My understanding', whatStillHolds: 'My question', nextQuestion: '' };
  storage.upsertRecord({ ...record, reviews: [review] }); assert.equal(storage.getRecord('test-1').reviews[0].whatChanged, 'My understanding');
  assert.equal(JSON.parse(storage.exportData()).snapshots.length, 1);
  storage.removeRecord('test-1'); assert.equal(storage.listRecords().length, 0);
  data.set('growerr:records:v1', 'corrupted json');
  assert.throws(() => storage.listRecords(), /Saved data could not be read/);
  assert.match(storage.exportRawData(), /corrupted json/);
  storage.clearAll(); assert.equal(storage.listRecords().length, 0); assert.equal(storage.readDraft(), null);
  console.log('PASS: arithmetic, invalid values, draft, demo label, create/edit/review/delete, export, corrupted data, clear-all (12 checks)');
} finally { rmSync(dir, { recursive: true, force: true }); }
function requireResolveTsc() { return createRequire(import.meta.url).resolve('typescript/lib/tsc.js', { paths: [process.cwd(), '/home/user'] }); }
