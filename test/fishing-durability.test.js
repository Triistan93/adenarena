import { test } from 'node:test';
import assert from 'node:assert/strict';

import { FishingService } from '../lineage-idle/src/services/FishingService.js';
import { RODS_CATALOG, FISH_CATALOG } from '../lineage-idle/src/data/fishing.js';
import { FISHING_BALANCE } from '../lineage-idle/src/data/economy/fishingBalance.js';
import { renderFishingUI } from '../lineage-idle/src/ui/FishingUI.js';
import { setRoot } from '../lineage-idle/src/core/DomHelpers.js';

function createFishingState() {
  return {
    level: 40,
    inventory: [],
    gold: 0,
    lifeActivities: {
      fishing: {
        level: 10,
        xp: 0,
        tool: 'rod_none',
        toolDurability: 8,
        maxDurability: 8,
        isWorking: false,
        autoMode: false,
        codexDiscoveries: {}
      }
    },
    fishing: {
      skillLevel: 10,
      skillXp: 0,
      rod: 'rod_none',
      rodDurability: { rod_none: 8 },
      activeBait: 'bait_worm',
      baitInventory: { bait_worm: 20 },
      activeZone: 'zone_talking_island',
      isFishing: false,
      activeFight: null,
      castStartTime: 0,
      totalCaught: 0,
      fishLog: {},
      autoFishing: false,
      lastAutoTick: 0
    }
  };
}

test('manual cast and the canonical activity state consume the same single rod durability point', () => {
  const state = createFishingState();
  const result = FishingService.castLine(state);

  assert.equal(result.success, true);
  assert.equal(state.fishing.rodDurability.rod_none, 7);
  assert.equal(state.lifeActivities.fishing.toolDurability, 7);
});

test('automatic fishing synchronizes rod durability shown by the fishing profession', () => {
  const state = createFishingState();
  state.fishing.autoFishing = true;
  state.fishing.lastAutoTick = Date.now() - FISHING_BALANCE.AUTO_FISH_INTERVAL_MS * 2;

  FishingService.processAutoFish(state);

  assert.equal(state.fishing.rodDurability.rod_none, state.lifeActivities.fishing.toolDurability);
  assert.ok(state.fishing.rodDurability.rod_none < 8);
});

test('offline fishing synchronizes rod durability shown by the fishing profession', () => {
  const state = createFishingState();
  state.fishing.autoFishing = true;

  FishingService.processOfflineFish(state, 2);

  assert.equal(state.fishing.rodDurability.rod_none, state.lifeActivities.fishing.toolDurability);
  assert.ok(state.fishing.rodDurability.rod_none < 8);
});

test('the final durability point still permits one cast and then blocks the next one', () => {
  const state = createFishingState();
  state.fishing.rodDurability.rod_none = 1;
  state.lifeActivities.fishing.toolDurability = 1;

  assert.equal(FishingService.castLine(state).success, true);
  assert.equal(state.fishing.rodDurability.rod_none, 0);
  assert.equal(state.lifeActivities.fishing.toolDurability, 0);
  state.fishing.isFishing = false;
  assert.equal(FishingService.castLine(state).reason, 'broken_tool');
});

test('an escaped fish does not charge durability a second time after the cast', () => {
  const state = createFishingState();
  FishingService.castLine(state);
  state.fishing.activeFight = {
    status: 'fighting', fishId: 'fish_carp', fishDef: { id: 'fish_carp' },
    profile: { tensionRate: 1, burstChance: 0 }, maxStamina: 50,
    fishStamina: 50, lineTension: 20, playerControl: 1, turns: 0
  };

  const originalRandom = Math.random;
  Math.random = () => 0.99;
  try {
    assert.equal(FishingService.actionYield(state).status, 'fish_escaped');
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(state.fishing.rodDurability.rod_none, 7);
  assert.equal(state.lifeActivities.fishing.toolDurability, 7);
});

test('a caught fish does not charge durability again after the cast', () => {
  const state = createFishingState();
  FishingService.castLine(state);
  state.fishing.activeFight = {
    status: 'fighting', fishId: 'fish_carp', fishDef: { id: 'fish_carp', name: 'Carpa', rarity: 'common', xpReward: 1 },
    profile: { tensionRate: 1, burstChance: 0 }, maxStamina: 50,
    fishStamina: 1, lineTension: 20, playerControl: 50, turns: 0
  };

  const originalRandom = Math.random;
  Math.random = () => 0.99;
  try {
    assert.equal(FishingService.actionForce(state).status, 'caught');
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(state.fishing.rodDurability.rod_none, 7);
  assert.equal(state.lifeActivities.fishing.toolDurability, 7);
});

test('automatic fishing spends the last durability point on one final cast only', () => {
  const state = createFishingState();
  state.fishing.autoFishing = true;
  state.fishing.rodDurability.rod_none = 1;
  state.lifeActivities.fishing.toolDurability = 1;
  state.fishing.lastAutoTick = Date.now() - FISHING_BALANCE.AUTO_FISH_INTERVAL_MS * 2;
  const initialBait = state.fishing.baitInventory.bait_worm;
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    FishingService.processAutoFish(state);
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(state.fishing.baitInventory.bait_worm, initialBait - 1);
  assert.equal(state.fishing.rodDurability.rod_none, 0);
  assert.equal(state.lifeActivities.fishing.toolDurability, 0);
  assert.equal(state.fishing.autoFishing, false);
});

test('offline fishing cannot simulate more casts than the remaining rod durability', () => {
  const state = createFishingState();
  state.fishing.autoFishing = true;
  state.fishing.rodDurability.rod_none = 1;
  state.lifeActivities.fishing.toolDurability = 1;
  const initialBait = state.fishing.baitInventory.bait_worm;
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    FishingService.processOfflineFish(state, 30);
  } finally {
    Math.random = originalRandom;
  }

  assert.equal(state.fishing.baitInventory.bait_worm, initialBait - 1);
  assert.equal(state.fishing.rodDurability.rod_none, 0);
  assert.equal(state.lifeActivities.fishing.toolDurability, 0);
  assert.equal(state.fishing.autoFishing, false);
});

test('a zone cannot change during an active cast or fish fight', () => {
  const state = createFishingState();
  FishingService.castLine(state);
  assert.equal(FishingService.selectZone(state, 'zone_gludio'), false);

  state.fishing.isFishing = false;
  state.fishing.activeFight = { status: 'fighting' };
  assert.equal(FishingService.selectZone(state, 'zone_gludio'), false);
});

test('repairing the equipped rod restores both durability records', () => {
  const state = createFishingState();
  state.gold = 100000;
  state.fishing.rodDurability.rod_none = 2;
  state.lifeActivities.fishing.toolDurability = 2;

  assert.equal(FishingService.repairRod(state, 'rod_none'), true);
  assert.equal(state.fishing.rodDurability.rod_none, RODS_CATALOG.rod_none.durability);
  assert.equal(state.lifeActivities.fishing.toolDurability, RODS_CATALOG.rod_none.durability);
});

test('bait purchase rejects invalid quantities without changing currency or stock', () => {
  for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    const state = createFishingState();
    state.gold = 100_000;
    const before = structuredClone(state);

    const result = FishingService.buyBait(state, 'bait_worm', quantity);

    assert.equal(result, false, `quantity=${String(quantity)} must be rejected`);
    assert.deepEqual(state, before, `quantity=${String(quantity)} must not alter saved currency or bait stock`);
  }
});

test('fish exchange rejects invalid package quantities without consuming fish', () => {
  for (const quantity of [0, -1, 1, 4.5, Number.NaN, Number.POSITIVE_INFINITY, '5']) {
    const state = createFishingState();
    state.inventory = [{ uid: 'disposable-fish', itemId: 'fish_carp', count: 10 }];
    const before = structuredClone(state.inventory);

    assert.equal(FishingService.exchangeFish(state, 'fish_carp', quantity).success, false);
    assert.deepEqual(state.inventory, before, `quantity=${String(quantity)} must not remove fish`);
  }
});

test('fish exchange preserves a partial fish stack when its material reward cannot fit', () => {
  const state = createFishingState();
  state.inventory = [
    ...Array.from({ length: 149 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 })),
    { uid: 'disposable-fish', itemId: 'fish_carp', count: 10 }
  ];
  const before = structuredClone(state.inventory);

  assert.equal(FishingService.exchangeFish(state, 'fish_carp', 5).success, false);
  assert.deepEqual(state.inventory, before);
});

test('manual fishing preserves caught fish in a claimable queue when the backpack is full', () => {
  const state = createFishingState();
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  const fish = FISH_CATALOG.fish_carp;
  const result = FishingService._finalizeFightCatch(state, state.fishing, { fishDef: fish });

  assert.equal(result.status, 'caught');
  assert.equal(state.fishing.totalCaught, 1);
  assert.equal(state.fishing.pendingFishRewards.length, 1);
  assert.equal(state.fishing.pendingFishRewards[0].fishId, fish.id);
  assert.equal(state.inventory.length, 150);

  state.inventory = [];
  assert.equal(FishingService.claimPendingFishRewards(state), true);
  assert.equal(state.fishing.pendingFishRewards.length, 0);
  assert.equal(state.inventory.find(item => item.itemId === fish.id)?.count, 1);
});

test('automatic and offline fishing pause with a claimable catch instead of losing it', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;
  try {
    for (const mode of ['auto', 'offline']) {
      const state = createFishingState();
      state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
      state.fishing.autoFishing = true;
      state.fishing.lastAutoTick = Date.now() - FISHING_BALANCE.AUTO_FISH_INTERVAL_MS * 2;
      const beforeBait = state.fishing.baitInventory.bait_worm;
      if (mode === 'auto') FishingService.processAutoFish(state);
      else FishingService.processOfflineFish(state, 30);

      assert.equal(state.fishing.totalCaught, 1, `${mode} should confirm its first deterministic catch`);
      assert.equal(state.fishing.pendingFishRewards.length, 1, `${mode} catch should be claimable`);
      assert.equal(state.fishing.autoFishing, false, `${mode} should pause while a catch is pending`);
      assert.ok(state.fishing.baitInventory.bait_worm < beforeBait);
      assert.equal(state.inventory.length, 150);
    }
  } finally {
    Math.random = originalRandom;
  }
});

test('fishing UI exposes the pending catch action and new casts wait for the claim', () => {
  const state = createFishingState();
  state.fishing.pendingFishRewards = [{ fishId: 'fish_carp', count: 1, rarity: 'common' }];
  const container = { innerHTML: '' };
  setRoot({ getElementById: id => id === 'tab-fishing' ? container : null, querySelector: () => null });
  try {
    renderFishingUI(state);
  } finally {
    setRoot(null);
  }
  assert.match(container.innerHTML, /claimPendingFishingRewards/);
  assert.equal(FishingService.castLine(state).reason, 'pending_rewards');
});

