import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function makeStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

test('cloud hydration replaces the canonical StateManager snapshot without detaching its object', async () => {
  globalThis.localStorage = makeStorage();
  const { DEFAULT_STATE, getState, replaceStateSnapshot, saveState } = await import(`../lineage-idle/src/core/StateManager.js?cloud-hydration-${Date.now()}`);
  const canonicalState = getState();
  const cloudSnapshot = { ...DEFAULT_STATE(), level: 42, gold: 987654, charName: 'Cloud Hero' };

  const hydrated = replaceStateSnapshot(cloudSnapshot);

  assert.equal(hydrated, canonicalState);
  assert.equal(getState(), canonicalState);
  assert.equal(canonicalState.level, 42);
  assert.equal(canonicalState.gold, 987654);
  assert.equal(canonicalState.charName, 'Cloud Hero');

  saveState();
  const saved = JSON.parse(localStorage.getItem('lineageIdleSave_v2'));
  assert.equal(saved.level, 42);
  assert.equal(saved.gold, 987654);
  assert.equal(saved.charName, 'Cloud Hero');
});

test('the cloud load path hydrates StateManager instead of replacing its state object', () => {
  const main = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
  const start = main.indexOf('window.loadGameState = (cloudData) => {');
  const end = main.indexOf('window.toggleMuteAudio =', start);
  const loader = main.slice(start, end);

  assert.ok(start >= 0 && end > start, 'cloud loader boundaries exist');
  assert.match(loader, /managerReplaceStateSnapshot\(\{\s*\.\.\.def,\s*\.\.\.cloudData\s*\}\)/);
  assert.doesNotMatch(loader, /state\s*=\s*\{\s*\.\.\.def,\s*\.\.\.cloudData\s*\}/);
});
