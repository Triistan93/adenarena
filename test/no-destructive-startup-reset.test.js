import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const entrypoint = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('app startup never deletes player saves or Firestore offline data to refresh assets', () => {
  assert.doesNotMatch(entrypoint, /localStorage\.clear\s*\(/);
  assert.doesNotMatch(entrypoint, /localStorage\.removeItem\s*\(/);
  assert.doesNotMatch(entrypoint, /sessionStorage\.clear\s*\(/);
  assert.doesNotMatch(entrypoint, /indexedDB\.deleteDatabase\s*\(/);
  assert.doesNotMatch(entrypoint, /aden_pending_char_creation.*['"]1['"]/);
});
