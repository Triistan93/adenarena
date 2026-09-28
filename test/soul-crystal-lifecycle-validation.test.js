import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { applySoulCrystalToWeapon } from '../lineage-idle/src/services/ElementalService.js';
import { processSoulDrainOnKill } from '../lineage-idle/src/services/CraftService.js';
import { pickRandomMonster } from '../lineage-idle/src/engine/CombatEngine.js';
import { startRaidBoss } from '../lineage-idle/src/services/RaidService.js';

describe('Soul Crystal SA lifecycle validation', () => {
  function createState(crystal = null) {
    return {
      level: 80,
      gold: 2_000_000,
      inventory: [
        { uid: 'weapon-1', itemId: 'runtime_s_grade_sword', slot: 'weapon', grade: 's' },
        ...(crystal ? [{ uid: 'crystal-1', ...crystal }] : [])
      ]
    };
  }

  it('cannot install or charge for an SA when the inventory has no Soul Crystal', () => {
    const state = createState();

    const result = applySoulCrystalToWeapon(state, 'weapon-1', 'red', 'focus');

    assert.equal(result, false);
    assert.equal(state.gold, 2_000_000);
    assert.equal(state.inventory[0].soulCrystal, undefined);
  });

  it('rejects Soul Crystal installation on a weapon with no recognized grade without charging', () => {
    const state = createState({ itemId: 'soul_crystal_red_stage1', isSoulCrystal: true, stage: 1 });
    state.inventory[0] = { uid: 'weapon-1', itemId: 'runtime_ungraded_weapon', slot: 'weapon' };

    const result = applySoulCrystalToWeapon(state, 'weapon-1', 'red', 'focus');

    assert.equal(result, false);
    assert.equal(state.gold, 2_000_000);
    assert.equal(state.inventory.find(item => item.uid === 'crystal-1')?.count, undefined);
    assert.equal(state.inventory[0].soulCrystal, undefined);
  });

  it('rejects an unknown rune effect instead of substituting another effect', () => {
    const state = createState({ itemId: 'soul_crystal_red_stage1', isSoulCrystal: true, stage: 1 });

    const result = applySoulCrystalToWeapon(state, 'weapon-1', 'red', 'unknown');

    assert.equal(result, false);
    assert.equal(state.gold, 2_000_000);
    assert.equal(state.inventory.some(item => item.uid === 'crystal-1'), true);
    assert.equal(state.inventory[0].soulCrystal, undefined);
  });

  it('requires an exact matching-color crystal and consumes only one crystal', () => {
    const state = createState({
      itemId: 'soul_crystal_red_stage1', isSoulCrystal: true, stage: 1, count: 2
    });

    const wrongColorResult = applySoulCrystalToWeapon(state, 'weapon-1', 'green', 'health');
    assert.equal(wrongColorResult, false);
    assert.equal(state.gold, 2_000_000);
    assert.equal(state.inventory.find(item => item.uid === 'crystal-1').count, 2);

    const result = applySoulCrystalToWeapon(state, 'weapon-1', 'red', 'focus');
    assert.equal(result, true);
    assert.equal(state.inventory.find(item => item.uid === 'crystal-1').count, 1);
    assert.equal(state.inventory[0].soulCrystal.color, 'red');
  });

  it('requires elite or boss kills for stage 10+ and an Epic Boss for stage 13', () => {
    const state = { inventory: [{
      uid: 'crystal-1', itemId: 'soul_crystal_red_stage10', isSoulCrystal: true,
      color: 'red', stage: 10, absorbedSouls: 0
    }] };
    const crystal = state.inventory[0];

    processSoulDrainOnKill(state, { id: 'normal_high_level', level: 80 });
    assert.equal(crystal.absorbedSouls, 0, 'A high-level normal monster must not advance a high-stage crystal');

    processSoulDrainOnKill(state, { id: 'elite_1', level: 80, isElite: true });
    assert.equal(crystal.absorbedSouls, 1, 'Elite kills should contribute to high-stage progression');

    crystal.stage = 12;
    crystal.crystalLevel = 12;
    crystal.absorbedSouls = 239;
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      processSoulDrainOnKill(state, { id: 'ordinary_boss', level: 90, isBoss: true });
      assert.equal(crystal.stage, 12, 'A non-Epic boss must not grant stage 13');

      processSoulDrainOnKill(state, { id: 'baium', level: 75, isBoss: true });
      assert.equal(crystal.stage, 13, 'An Epic Boss may grant stage 13 when soul progress is ready');
      assert.equal(crystal.itemId, 'soul_crystal_red_stage13');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('allows stage 13 to advance to stage 14 after boss progression', () => {
    const state = { inventory: [{
      uid: 'crystal-1', itemId: 'soul_crystal_blue_stage13', isSoulCrystal: true,
      color: 'blue', stage: 13, crystalLevel: 13, absorbedSouls: 259
    }] };
    const crystal = state.inventory[0];
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      processSoulDrainOnKill(state, { id: 'valakas', level: 100, isBoss: true });
      assert.equal(crystal.stage, 14);
      assert.equal(crystal.crystalLevel, 14);
      assert.equal(crystal.itemId, 'soul_crystal_blue_stage14');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('requires an Epic Boss for stage 14 to reach stage 15', () => {
    const state = { inventory: [{
      uid: 'crystal-1', itemId: 'soul_crystal_green_stage14', isSoulCrystal: true,
      color: 'green', stage: 14, crystalLevel: 14
    }] };
    const crystal = state.inventory[0];
    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      processSoulDrainOnKill(state, { id: 'barakiel', isBoss: true });
      assert.equal(crystal.stage, 14, 'A non-epic raid boss must not grant stage 15');
      processSoulDrainOnKill(state, { id: 'frintezza', isBoss: true });
      assert.equal(crystal.stage, 15);
      assert.equal(crystal.itemId, 'soul_crystal_green_stage15');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('keeps stage 15 as the maximum without changing legacy crystal data', () => {
    const crystal = {
      uid: 'crystal-1', itemId: 'soul_crystal_red_stage15', isSoulCrystal: true,
      color: 'red', stage: 15, crystalLevel: 15, absorbedSouls: 3
    };
    const before = { ...crystal };

    processSoulDrainOnKill({ inventory: [crystal] }, { id: 'valakas', isBoss: true });

    assert.deepEqual(crystal, before);
  });

  it('preserves the monster identity in real zone and raid encounters for SA progression', () => {
    const zoneState = { zone: 'talkingIsland', zoneKills: { talkingIsland: 50 }, isCombatActive: true };
    pickRandomMonster(zoneState);
    assert.equal(zoneState.activeMonster.id, 'goblinKing');
    assert.equal(zoneState.activeMonster.key, 'goblinKing');

    const state = {
      level: 100,
      stats: { combatPower: 10_000_000 },
      dailyRaidTickets: 3,
      zone: 'talkingIsland',
      inventory: [{
        uid: 'crystal-1', itemId: 'soul_crystal_red_stage14', isSoulCrystal: true,
        color: 'red', stage: 14, crystalLevel: 14
      }]
    };
    assert.equal(startRaidBoss(state, 'valakas'), true);
    assert.equal(state.activeMonster.id, 'valakas');

    const originalRandom = Math.random;
    Math.random = () => 0;
    try {
      processSoulDrainOnKill(state, state.activeMonster);
      assert.equal(state.inventory[0].stage, 15);
    } finally {
      Math.random = originalRandom;
    }
  });
});
