import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  challengeTowerFloor,
  completeTowerFloor,
  getTowerFloorDef,
  getTowerFloorMinimumCP
} from '../lineage-idle/src/services/TowerService.js';
import { stopCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

function createTowerState(overrides = {}) {
  return {
    level: 100,
    combatPower: 100000000,
    zone: 'talkingIsland',
    isCombatActive: true,
    inventory: [],
    tower: { highestFloor: 0, currentFloor: 1, lastSweepTime: 0 },
    ...overrides
  };
}

test('tower challenge enforces the configured CP gate through the action service', () => {
  const state = createTowerState({ combatPower: 1 });
  let attackLoopStarted = false;
  const result = challengeTowerFloor(state, {
    getCombatPower: () => state.combatPower,
    attackMonster: () => { attackLoopStarted = true; }
  });

  assert.equal(result?.reason, 'insufficient_cp');
  assert.equal(state.towerCombatActive, undefined);
  assert.equal(attackLoopStarted, false);
});

test('tower encounter cannot replace an already active tower floor', () => {
  const state = createTowerState();
  const callbacks = { getCombatPower: () => state.combatPower, attackMonster: () => {} };
  const first = challengeTowerFloor(state, callbacks);
  const startedAt = state.towerStartTime;
  try {
    const second = challengeTowerFloor(state, callbacks);
    assert.equal(first?.floor, 1);
    assert.equal(second?.reason, 'tower_in_progress');
    assert.equal(state.towerStartTime, startedAt);
    assert.equal(state.activeMonster.towerFloor, 1);
  } finally {
    stopCombat(state);
  }
});

test('tower cannot start during a raid and rejects attempts beyond floor 100', () => {
  const raidState = createTowerState({ isRaidActive: true });
  assert.equal(challengeTowerFloor(raidState, { getCombatPower: () => raidState.combatPower }).reason, 'another_instance_active');

  const completedState = createTowerState({ tower: { highestFloor: 100, currentFloor: 100, lastSweepTime: 0 } });
  assert.equal(challengeTowerFloor(completedState, { getCombatPower: () => completedState.combatPower }).reason, 'tower_complete');
});

test('only the defeated active floor can award first-clear progress, and only once', () => {
  const state = createTowerState({ towerCombatActive: false });
  assert.equal(completeTowerFloor(state, 100), false);
  assert.equal(state.tower.highestFloor, 0);

  state.towerCombatActive = true;
  state.activeMonster = { isTower: true, towerFloor: 1, hp: 0 };
  assert.equal(completeTowerFloor(state, 2), false);
  assert.equal(state.tower.highestFloor, 0);
  assert.equal(completeTowerFloor(state, 1), true);
  assert.equal(state.tower.highestFloor, 1);
  assert.equal(completeTowerFloor(state, 1), false);
  assert.equal(state.tower.highestFloor, 1);
});

test('tower encounter carries complete combat defense stats and valid scaling across all floors', () => {
  for (let floor = 1; floor <= 100; floor++) {
    const def = getTowerFloorDef(floor);
    assert.equal(def.floor, floor);
    assert.ok(def.hp > 0 && def.atk > 0 && def.def > 0 && def.mdef > 0);
    assert.ok(def.reqLvl > 0 && def.reqLvl <= 100);
    assert.ok(getTowerFloorMinimumCP(floor) > 0);
  }
});

test('daily sweep is limited to 100 floors and cannot be claimed twice in 24 hours', async () => {
  const { sweepTowerDaily } = await import('../lineage-idle/src/services/TowerService.js');
  const state = createTowerState({ tower: { highestFloor: 999, currentFloor: 1, lastSweepTime: 0 } });
  const first = sweepTowerDaily(state);
  assert.equal(first.success, true);
  assert.equal(first.highestFloor, 100);
  const goldAfterFirst = state.gold;
  const second = sweepTowerDaily(state);
  assert.equal(second, undefined);
  assert.equal(state.gold, goldAfterFirst);
});

test('first-clear crystal rewards stay claimable when the backpack is full', async () => {
  const { claimPendingTowerRewards } = await import('../lineage-idle/src/services/TowerService.js');
  const previousGameData = globalThis.GameData;
  globalThis.GameData = { ...(previousGameData || {}), ALL_ITEMS };
  const state = createTowerState({
    inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 })),
    towerCombatActive: true,
    activeMonster: { isTower: true, towerFloor: 10, hp: 0 },
    tower: { highestFloor: 9, currentFloor: 10, lastSweepTime: 0 }
  });

  try {
    assert.equal(completeTowerFloor(state, 10), true);
    assert.equal(state.tower.highestFloor, 10);
    assert.equal(state.inventory.length, 150);
    assert.equal(state.tower.pendingFirstClearRewards?.[0]?.itemId, 'crystal_a');
    assert.equal(state.tower.pendingFirstClearRewards?.[0]?.count, 3);

    assert.equal(claimPendingTowerRewards(state), false, 'claim waits until an inventory slot is available');
    state.inventory.pop();
    assert.equal(claimPendingTowerRewards(state), true);
    assert.equal(state.inventory.find(item => item.itemId === 'crystal_a')?.count, 3);
    assert.deepEqual(state.tower.pendingFirstClearRewards, []);
  } finally {
    if (previousGameData === undefined) delete globalThis.GameData;
    else globalThis.GameData = previousGameData;
  }
});

test('tower UI exposes the pending first-clear reward action and binds it to the service handler', () => {
  const markup = readFileSync(new URL('../src/idle/markup.ts', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
  assert.match(markup, /id="tower-claim-pending-btn"/);
  assert.match(main, /claimPendingBtn\.onclick\s*=\s*\(\)\s*=>\s*claimPendingTowerRewards\(\)/);
  assert.match(main, /claimPendingBtn\.style\.display\s*=\s*pendingRewards\.length\s*>\s*0/);
});
