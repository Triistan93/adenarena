import { test } from 'node:test';
import assert from 'node:assert/strict';

import { setCombatSpeed, startCombat, stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';

test('combat speed changes the actual production attack interval and clamps unsupported values', () => {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const intervals = [];
  globalThis.setInterval = (callback, delay) => {
    const handle = { callback, delay, cleared: false };
    intervals.push(handle);
    return handle;
  };
  globalThis.clearInterval = handle => { if (handle) handle.cleared = true; };

  const state = {
    level: 1,
    class: 'duelist',
    race: 'human',
    zone: 'talkingIsland',
    stats: { combatPower: 150 },
    combatPower: 150,
    combatSpeed: 1,
    inventory: [],
    skills: {}
  };
  const callbacks = { attackMonster() {} };

  try {
    startCombat(state, callbacks);
    assert.equal(intervals.at(-1)?.delay, 200, 'normal combat should tick every 200ms');

    setCombatSpeed(state, 2, callbacks);
    assert.equal(state.combatSpeed, 2);
    assert.equal(intervals.at(-2)?.cleared, true, 'changing speed must replace the active timer');
    assert.equal(intervals.at(-1)?.delay, 100, '2x combat should tick every 100ms');

    setCombatSpeed(state, 4, callbacks);
    assert.equal(state.combatSpeed, 1, 'unsupported speeds should normalize to the supported normal speed');
    assert.equal(intervals.at(-1)?.delay, 200);
  } finally {
    stopCombat(state);
    globalThis.setInterval = realSetInterval;
    globalThis.clearInterval = realClearInterval;
  }
});
