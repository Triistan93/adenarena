import { test } from 'node:test';
import assert from 'node:assert/strict';

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    snapshot() { return Object.fromEntries(values); }
  };
}

test('invalid local save is rejected without replacing or overwriting preserved save data', async () => {
  const corruptPrimary = JSON.stringify({ level: 0, gold: 'invalid', charName: 'Damaged' });
  const corruptBackup = '{damaged backup';
  globalThis.localStorage = makeStorage({
    lineageIdleSave_v2: corruptPrimary,
    lineageIdleSave_v2_backup: corruptBackup
  });
  const { loadState } = await import(`../lineage-idle/src/core/StateManager.js?corrupt-save-${Date.now()}`);

  assert.equal(loadState(), false);
  assert.equal(localStorage.getItem('lineageIdleSave_v2'), corruptPrimary);
  assert.equal(localStorage.getItem('lineageIdleSave_v2_backup'), corruptBackup);
});

test('malformed primary save restores a valid backup without rewriting either file', async () => {
  const malformedPrimary = '{incomplete primary';
  const validBackup = JSON.stringify({ level: 12, xp: 5500, gold: 42000, charName: 'Recovered Hero' });
  globalThis.localStorage = makeStorage({
    lineageIdleSave_v2: malformedPrimary,
    lineageIdleSave_v2_backup: validBackup
  });
  const { getState, loadState } = await import(`../lineage-idle/src/core/StateManager.js?valid-backup-${Date.now()}`);

  assert.equal(loadState(), true);
  assert.equal(getState().level, 12);
  assert.equal(getState().gold, 42000);
  assert.equal(getState().charName, 'Recovered Hero');
  assert.equal(localStorage.getItem('lineageIdleSave_v2'), malformedPrimary);
  assert.equal(localStorage.getItem('lineageIdleSave_v2_backup'), validBackup);
});

test('autosave after a failed corrupt-save load preserves both originals and never syncs a default snapshot', async () => {
  const corruptPrimary = '{damaged primary';
  const corruptBackup = JSON.stringify({ level: 0, gold: 'not-gold', charName: 'Damaged Hero' });
  globalThis.localStorage = makeStorage({
    lineageIdleSave_v2: corruptPrimary,
    lineageIdleSave_v2_backup: corruptBackup
  });
  let cloudWrites = 0;
  globalThis.window = { saveCloudNow: () => { cloudWrites += 1; } };
  const { loadState, saveState } = await import(`../lineage-idle/src/core/StateManager.js?corrupt-autosave-${Date.now()}`);

  assert.equal(loadState(), false);
  saveState(true, true);

  assert.equal(localStorage.getItem('lineageIdleSave_v2'), corruptPrimary);
  assert.equal(localStorage.getItem('lineageIdleSave_v2_backup'), corruptBackup);
  assert.equal(cloudWrites, 0);
});
