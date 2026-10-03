import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { preferLocalPlayerSave } from '../src/idle/SaveConflictPolicy.js';

const userId = 'account-123';

test('newer local save wins only when it belongs to the authenticated account', () => {
  assert.equal(preferLocalPlayerSave({
    localState: { ownerUid: userId, lastSaveTime: 200 },
    cloudState: { ownerUid: userId, lastSaveTime: 100 },
    userId
  }), true);
});

test('older, equal, or unowned local saves defer to the account cloud save', () => {
  assert.equal(preferLocalPlayerSave({ localState: { ownerUid: userId, lastSaveTime: 99 }, cloudState: { ownerUid: userId, lastSaveTime: 100 }, userId }), false);
  assert.equal(preferLocalPlayerSave({ localState: { ownerUid: userId, lastSaveTime: 100 }, cloudState: { ownerUid: userId, lastSaveTime: 100 }, userId }), false);
  assert.equal(preferLocalPlayerSave({ localState: { ownerUid: null, lastSaveTime: 200 }, cloudState: { ownerUid: userId, lastSaveTime: 100 }, userId }), false);
  assert.equal(preferLocalPlayerSave({ localState: { ownerUid: 'other-account', lastSaveTime: 200 }, cloudState: { ownerUid: userId, lastSaveTime: 100 }, userId }), false);
});

test('legacy cloud snapshots without ownerUid are scoped by the authenticated user document', () => {
  assert.equal(preferLocalPlayerSave({
    localState: { ownerUid: userId, lastSaveTime: 200 },
    cloudState: { lastSaveTime: 100 },
    userId
  }), true);
});

test('authentication sync checks same-account freshness before applying cloud state', () => {
  const idleGame = readFileSync(new URL('../src/idle/IdleGame.tsx', import.meta.url), 'utf8');
  assert.match(idleGame, /preferLocalPlayerSave\(/);
  assert.match(idleGame, /getRawState/);
  assert.match(idleGame, /saveGameState\(true, true\)/);
  assert.match(idleGame, /loadGameState\(cloudState\)/);
});
