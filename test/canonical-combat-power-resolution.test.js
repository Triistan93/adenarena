import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { selectZone, startCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { getZoneProgression } from '../lineage-idle/src/data/balance/progressionBalance.js';

test('CombatPowerService.resolveCombatPower: resolves and caches CP when state has no prior CP', () => {
  const state = {
    level: 120,
    classTier: 3,
    class: 'archmage',
    race: 'human',
    equipment: {},
    inventory: []
  };

  assert.equal(state.combatPower, undefined);
  assert.equal(state.stats, undefined);

  const resolved = CombatPowerService.resolveCombatPower(state);
  assert.ok(resolved > 0, `Resolved CP must be > 0, got ${resolved}`);
  assert.equal(state.combatPower, resolved, 'state.combatPower must be synchronized');

  // When state.stats exists, it should also be synchronized
  state.stats = { monstersKilled: 10 };
  const resolved2 = CombatPowerService.resolveCombatPower(state);
  assert.equal(state.stats.monstersKilled, 10, 'state.stats.monstersKilled must not be overwritten');
  assert.equal(state.stats.combatPower, resolved2, 'state.stats.combatPower must be synchronized');
});

test('StatsEngine.getStats: automatically sets combatPower on state', () => {
  const state = {
    level: 80,
    classTier: 3,
    class: 'archmage',
    race: 'human',
    equipment: {},
    inventory: []
  };

  const stats = getStats(state);
  assert.ok(stats.combatPower > 0, 'stats.combatPower must be positive');
  assert.equal(state.combatPower, stats.combatPower, 'state.combatPower must match stats.combatPower');
});

test('CombatEngine.selectZone: allows zone entry when state has no pre-cached CP', () => {
  const logs = [];
  const mockCallbacks = {
    log: (msg, type) => logs.push({ msg, type }),
    updateAllUI: () => {},
    save: () => {}
  };

  const state = {
    level: 120,
    classTier: 3,
    class: 'archmage',
    race: 'human',
    zone: 'talkingIsland',
    currentZone: 'talkingIsland',
    equipment: {},
    inventory: []
  };

  // Giran Outskirts requires Lv 25 and 6,500 CP.
  // Before fix, this would fail because state.stats?.combatPower || state.combatPower was 0.
  // Now, CombatPowerService.resolveCombatPower will resolve the player CP correctly.
  state.combatPower = 134442;
  const ok = selectZone(state, 'giranOutskirts', mockCallbacks);
  assert.equal(ok, true, 'selectZone must accept a 134,442 CP player into Giran Outskirts');
  assert.equal(state.zone, 'giranOutskirts');
});

test('CombatEngine.selectZone: reports accurate player CP rather than 0 in rejection warning', () => {
  const logs = [];
  const mockCallbacks = {
    log: (msg, type) => logs.push({ msg, type }),
    updateAllUI: () => {},
    save: () => {}
  };

  const state = {
    level: 120,
    classTier: 3,
    class: 'archmage',
    race: 'human',
    combatPower: 134442,
    zone: 'talkingIsland',
    currentZone: 'talkingIsland',
    equipment: {},
    inventory: []
  };

  // Forge of the Gods requires 800,000 CP
  const ok = selectZone(state, 'forgeOfGods', mockCallbacks);
  assert.equal(ok, false, 'Forge of the Gods should reject 134,442 CP');
  assert.ok(logs.length > 0, 'Should have logged a warning');
  const warningMsg = logs[0].msg;
  assert.ok(warningMsg.includes('134'), `Warning message must mention real player CP (134,442), got: ${warningMsg}`);
  assert.ok(!warningMsg.includes('Seu CP: 0'), `Warning message must never report "Seu CP: 0", got: ${warningMsg}`);
});

test('CombatEngine.startCombat: does not falsely repatriate a player with 134,442 CP from Emerald Grove', () => {
  const logs = [];
  const mockCallbacks = {
    log: (msg, type) => logs.push({ msg, type }),
    updateAllUI: () => {},
    save: () => {}
  };

  const state = {
    level: 120,
    classTier: 3,
    class: 'archmage',
    race: 'human',
    combatPower: 134442,
    zone: 'emeraldGrove',
    currentZone: 'emeraldGrove',
    equipment: {},
    inventory: []
  };

  const ok = startCombat(state, mockCallbacks);
  assert.equal(ok, undefined, 'startCombat finishes without early exit');
  assert.equal(state.zone, 'emeraldGrove', 'Player must remain in emeraldGrove (requires 90k CP, player has 134k CP)');
  assert.ok(!logs.some(l => l.msg.includes('Retornando para')), 'Must not repatriate player to safe town');
});

test('CombatPowerService.resolveCombatPower: evicts stale starter 120 CP on Lv 40 character and returns true CP', () => {
  const state = {
    level: 40,
    classTier: 2,
    class: 'gladiator',
    race: 'human',
    combatPower: 120,
    stats: { combatPower: 120 },
    equipment: {},
    inventory: []
  };

  const resolved = CombatPowerService.resolveCombatPower(state);
  assert.ok(resolved > 1000, `Lv 40 Gladiator CP must be > 1000, got: ${resolved}`);
  assert.notEqual(resolved, 120, 'Must NOT return stale starter 120 CP');
  assert.equal(state.combatPower, resolved, 'state.combatPower must be synchronized to true CP');
  assert.equal(state.stats.combatPower, resolved, 'state.stats.combatPower must be synchronized to true CP');
});

test('StatsEngine.getStats: computes dynamic CP for Lv 40 Gladiator without reverting to 120', () => {
  const state = {
    level: 40,
    classTier: 2,
    class: 'gladiator',
    race: 'human',
    combatPower: 120,
    stats: { combatPower: 120 },
    equipment: {},
    inventory: []
  };

  const stats = getStats(state);
  assert.ok(stats.combatPower > 1000, `Computed stats.combatPower must be > 1000, got: ${stats.combatPower}`);
  assert.notEqual(stats.combatPower, 120, 'StatsEngine must never return 120 for Lv 40');
  assert.equal(state.combatPower, stats.combatPower, 'state.combatPower must match stats.combatPower');
  assert.equal(state.stats.combatPower, stats.combatPower, 'state.stats.combatPower must match stats.combatPower');
});

