import { test } from 'node:test';
import assert from 'node:assert/strict';

import { GatheringService } from '../lineage-idle/src/services/lifeActivities/GatheringService.js';

test('the final durability point completes its harvest before the sickle breaks', () => {
  const state = {
    level: 40,
    gold: 0,
    hp: 1000,
    maxHp: 1000,
    inventory: [],
    gathering: {
      skillLevel: 1,
      skillXp: 0,
      sickle: 'sickle_none',
      selectedTactic: 'standard',
      activeTactic: 'standard',
      activePouch: null,
      activeZone: 'zone_gludio_fields',
      isGathering: true,
      harvestStartTime: Date.now() - 10_000,
      targetedNodeId: 'node_wild_branch',
      targetedNodePurity: 100,
      targetedNodeHazard: 'none',
      targetedNodeSignal: 'Clear',
      inspected: false,
      harvestDuration: 3000,
      totalHarvested: 0,
      gatheringLog: {},
      autoGathering: false,
      sickleDurability: { sickle_none: 1 },
      pouchInventory: {}
    }
  };

  const completed = GatheringService.finishHarvest(state);

  assert.equal(completed, true, 'one remaining durability should still produce the final harvest');
  assert.equal(state.gathering.sickleDurability.sickle_none, 0);
  assert.equal(state.gathering.totalHarvested, 1);
  assert.ok(state.inventory.length > 0, 'the harvest reward must be granted');
});

test('offline gathering consumes the saved in-progress harvest instead of leaving it to pay twice', () => {
  const state = {
    level: 40,
    inventory: [],
    gathering: {
      skillLevel: 1,
      skillXp: 0,
      sickle: 'sickle_none',
      activeZone: 'zone_gludio_fields',
      isGathering: true,
      harvestStartTime: Date.now() - 600_000,
      targetedNodeId: 'node_wild_branch',
      autoGathering: true,
      sickleDurability: { sickle_none: 50 },
      gatheringLog: {},
      pouchInventory: {}
    }
  };

  const result = GatheringService.processOfflineGathering(state, 10);

  assert.ok(result.actualHarvests > 0 && result.actualHarvests <= 50);
  assert.equal(state.gathering.sickleDurability.sickle_none, 50 - result.actualHarvests);
  assert.equal(state.gathering.totalHarvested, result.actualHarvests);
  assert.equal(state.gathering.isGathering, false);
  assert.equal(state.gathering.targetedNodeId, null);
  const durabilityAfterOffline = state.gathering.sickleDurability.sickle_none;
  assert.equal(GatheringService.processOfflineGathering(state, 0), null);
  assert.equal(state.gathering.sickleDurability.sickle_none, durabilityAfterOffline, 'the saved cycle must not pay twice');
});

test('a second start request cannot replace a live harvest or consume another pouch', () => {
  const state = {
    level: 40,
    inventory: [],
    gathering: {
      skillLevel: 1,
      skillXp: 0,
      sickle: 'sickle_none',
      selectedTactic: 'standard',
      activePouch: 'pouch_dew',
      activeZone: 'zone_gludio_fields',
      isGathering: false,
      sickleDurability: { sickle_none: 10 },
      pouchInventory: { pouch_dew: 2 }
    }
  };

  assert.equal(GatheringService.startHarvest(state).success, true);
  const originalNode = state.gathering.targetedNodeId;
  const originalStart = state.gathering.harvestStartTime;
  const pouchStock = state.gathering.pouchInventory.pouch_dew;

  const duplicateStart = GatheringService.startHarvest(state);

  assert.equal(duplicateStart.success, false);
  assert.equal(state.gathering.targetedNodeId, originalNode);
  assert.equal(state.gathering.harvestStartTime, originalStart);
  assert.equal(state.gathering.pouchInventory.pouch_dew, pouchStock);
});

test('pouch purchase rejects invalid quantities without corrupting Adena or inventory', () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    const state = {
      level: 40,
      gold: 1_000_000,
      gathering: {
        skillLevel: 1,
        sickle: 'sickle_none',
        sickleDurability: { sickle_none: 50 },
        pouchInventory: {},
        activePouch: null
      }
    };
    const before = structuredClone(state);

    const result = GatheringService.buyPouch(state, 'pouch_dew', qty);

    assert.equal(result, false, `qty=${String(qty)} must be rejected`);
    assert.deepEqual(state, before, `qty=${String(qty)} must not mutate Adena or pouch inventory`);
  }
});

test('skip-node cannot cancel or replace a harvest already in progress', () => {
  const state = {
    level: 40,
    gathering: {
      skillLevel: 1,
      sickle: 'sickle_none',
      sickleDurability: { sickle_none: 10 },
      activeZone: 'zone_gludio_fields',
      activePouch: null,
      isGathering: true,
      harvestStartTime: Date.now() - 500,
      harvestDuration: 3_000,
      targetedNodeId: 'node_wild_branch',
      targetedNodePurity: 70,
      targetedNodeHazard: 'thorn',
      targetedNodeSignal: 'visible thorn',
      inspected: true
    }
  };
  const before = structuredClone(state.gathering);

  assert.equal(GatheringService.skipNode(state), false);
  for (const key of ['isGathering', 'harvestStartTime', 'harvestDuration', 'targetedNodeId', 'targetedNodePurity', 'targetedNodeHazard', 'targetedNodeSignal', 'inspected']) {
    assert.deepEqual(state.gathering[key], before[key], `refusing to skip must preserve ${key}`);
  }
  assert.deepEqual(state.gathering.sickleDurability, before.sickleDurability);
});

test('a full backpack preserves the in-progress harvest and tool durability', () => {
  const state = {
    race: 'human',
    level: 40,
    hp: 1000,
    maxHp: 1000,
    inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 })),
    gathering: {
      skillLevel: 1,
      skillXp: 0,
      sickle: 'sickle_none',
      selectedTactic: 'standard',
      activeTactic: 'standard',
      activeZone: 'zone_gludio_fields',
      isGathering: true,
      harvestStartTime: Date.now() - 10_000,
      harvestDuration: 3_000,
      targetedNodeId: 'node_wild_branch',
      targetedNodePurity: 100,
      targetedNodeHazard: 'none',
      inspected: false,
      sickleDurability: { sickle_none: 5 },
      pouchInventory: {},
      gatheringLog: {},
      totalHarvested: 0
    }
  };

  let saves = 0;
  let warnings = 0;
  const callbacks = { save: () => saves++, log: () => warnings++ };
  const completed = GatheringService.finishHarvest(state, callbacks);

  assert.equal(completed, false, 'the harvest should remain available until materials can be stored');
  assert.equal(state.inventory.length, 150);
  assert.equal(state.gathering.sickleDurability.sickle_none, 5);
  assert.equal(state.gathering.isGathering, true);
  assert.equal(state.gathering.targetedNodeId, 'node_wild_branch');
  assert.equal(state.gathering.totalHarvested, 0);
  const pendingReward = structuredClone(state.gathering.pendingHarvestReward);
  assert.equal(GatheringService.finishHarvest(state, callbacks), false);
  assert.equal(saves, 1, 'blocked automatic retry should not save every UI tick');
  assert.equal(warnings, 1, 'blocked automatic retry should not repeat the warning');

  state.inventory.splice(-2);
  assert.equal(GatheringService.finishHarvest(state, callbacks), true, 'the saved reward completes after the player makes room');
  assert.equal(state.inventory.find(item => item.itemId === 'branch')?.count, pendingReward.primaryQty);
  assert.equal(state.inventory.find(item => item.itemId === 'charcoal')?.count, pendingReward.secQty);
  assert.equal(state.gathering.sickleDurability.sickle_none, 4);
  assert.equal(state.gathering.isGathering, false);
  assert.equal(state.gathering.pendingHarvestReward, null);
});

