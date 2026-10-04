import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('local preview can disable automatic guest sign-in so an admin test account can log in', async () => {
  const source = await readFile(new URL('../src/firebase.ts', import.meta.url), 'utf8');
  assert.match(source, /VITE_DISABLE_GUEST_AUTH\s*!==\s*'true'/);
});
