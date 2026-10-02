import { test } from 'node:test';
import assert from 'node:assert/strict';

import { HuntingService } from '../lineage-idle/src/services/HuntingService.js';
import { HUNTING_ZONES, PREY_CATALOG } from '../lineage-idle/src/data/hunting.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { resolveCanonicalResourceId } from '../lineage-idle/src/services/lifeActivities/ResourceDictionary.js';
import { renderHuntingUI } from '../lineage-idle/src/ui/HuntingUI.js';
import { setRoot } from '../lineage-idle/src/core/DomHelpers.js';

function createHuntingState() {
  return {
    level: 60,
    gold: 0,
    inventory: [],
    lifeActivities: {
      hunting: { level: 10, xp: 0, tool: 'knife_none', toolDurability: 10, maxDurability: 50, isWorking: false, autoMode: false }
    },
    hunting: {
      skillLevel: 10,
      skillXp: 0,
      knife: 'knife_none',
      selectedTactic: 'ambush',
      activeTactic: 'ambush',
      activeLure: null,
      activeZone: 'zone_talking_forest',
      isHunting: false,
      trackStartTime: 0,
      trackedPreyId: null,
      trackDuration: 1,
      alertLevel: 0,
      windDirection: 'crosswind',
      awaitingButchering: false,
      slainPreyData: null,
      totalHunted: 0,
      huntingLog: {},
      autoHunting: false,
      lastAutoTick: 0,
      knifeDurability: { knife_none: 10 },
      lureInventory: { lure_meat: 0 }
    }
  };
}

test('automatic skinning grants the final prey before disabling AFK at zero durability', () => {
  const state = createHuntingState();
  state.hunting.autoHunting = true;
  state.hunting.isHunting = true;
  state.hunting.trackedPreyId = 'prey_hare';
  state.hunting.trackStartTime = Date.now() - 10;
  state.hunting.trackDuration = 1;
  state.hunting.knifeDurability.knife_none = 1;
  state.lifeActivities.hunting.toolDurability = 1;

  assert.equal(HuntingService.finishSkinning(state), true);
  assert.equal(state.hunting.totalHunted, 1);
  assert.equal(state.hunting.knifeDurability.knife_none, 0);
  assert.equal(state.hunting.autoHunting, false);
  assert.ok(state.inventory.length > 0);
});

test('automatic skinning preserves the exact prey reward while the backpack is full', () => {
  const state = createHuntingState();
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  state.hunting.autoHunting = true;
  state.hunting.isHunting = true;
  state.hunting.trackedPreyId = 'prey_hare';
  state.hunting.trackStartTime = Date.now() - 10;
  state.hunting.trackDuration = 1;
  const durability = state.hunting.knifeDurability.knife_none;

  let saves = 0;
  assert.equal(HuntingService.finishSkinning(state, { save: () => saves++ }), false);
  assert.equal(saves, 1, 'pending automatic reward must be persisted');
  assert.equal(HuntingService.finishSkinning(state, { save: () => saves++ }), false);
  assert.equal(saves, 1, 'a blocked retry must not persist repeatedly each UI tick');
  assert.equal(state.hunting.totalHunted, 0);
  assert.equal(state.hunting.knifeDurability.knife_none, durability);
  assert.equal(state.hunting.trackedPreyId, 'prey_hare');
  const resumedState = JSON.parse(JSON.stringify(state));
  const pending = structuredClone(resumedState.hunting.pendingAutoSkinning);
  assert.ok(pending?.rewards?.length);

  resumedState.inventory = [];
  const floatMessages = [];
  assert.equal(HuntingService.finishSkinning(resumedState, { floatText: message => floatMessages.push(message) }), true);
  assert.equal(resumedState.hunting.totalHunted, 1);
  assert.equal(resumedState.hunting.knifeDurability.knife_none, durability - 1);
  assert.equal(resumedState.hunting.pendingAutoSkinning, null);
  assert.ok(floatMessages.length > 0);
});

test('a duplicate tracking action cannot overwrite the current prey or consume another lure', () => {
  const state = createHuntingState();
  state.hunting.activeLure = 'lure_meat';
  state.hunting.lureInventory.lure_meat = 2;
  assert.equal(HuntingService.startTracking(state).success, true);
  const preyId = state.hunting.trackedPreyId;
  const startedAt = state.hunting.trackStartTime;

  const duplicate = HuntingService.startTracking(state);

  assert.equal(duplicate.success, false);
  assert.equal(duplicate.reason, 'already_hunting');
  assert.equal(state.hunting.trackedPreyId, preyId);
  assert.equal(state.hunting.trackStartTime, startedAt);
  assert.equal(state.hunting.lureInventory.lure_meat, 1);
});

test('a zone-required lure is validated before consuming a knife charge', () => {
  const state = createHuntingState();
  state.hunting.activeZone = 'zone_gludio_plains';
  state.hunting.knifeDurability.knife_none = 5;
  const missing = HuntingService.startTracking(state);
  assert.equal(missing.reason, 'required_lure');
  assert.equal(state.hunting.knifeDurability.knife_none, 5);

  state.hunting.activeLure = 'lure_meat';
  state.hunting.lureInventory.lure_meat = 1;
  assert.equal(HuntingService.startTracking(state).success, true);
  assert.equal(state.hunting.lureInventory.lure_meat, 0);
});

test('the lure tactic cannot reduce prey alert without consuming a real lure', () => {
  const state = createHuntingState();
  state.hunting.selectedTactic = 'lure';
  assert.equal(HuntingService.startTracking(state).reason, 'required_lure');
  assert.equal(state.hunting.knifeDurability.knife_none, 10);

  state.hunting.activeLure = 'lure_meat';
  state.hunting.lureInventory.lure_meat = 1;
  assert.equal(HuntingService.startTracking(state).success, true);
  assert.equal(state.hunting.lureInventory.lure_meat, 0);
  assert.equal(state.hunting.windDirection, 'headwind');
});

test('zone and tactic cannot change during a track or while prey awaits field butchering', () => {
  const state = createHuntingState();
  HuntingService.startTracking(state);
  const trackedId = state.hunting.trackedPreyId;
  assert.equal(HuntingService.selectZone(state, 'zone_gludio_plains'), false);
  assert.equal(HuntingService.selectTactic(state, 'precision'), false);
  assert.equal(state.hunting.trackedPreyId, trackedId);

  state.hunting.isHunting = false;
  state.hunting.awaitingButchering = true;
  state.hunting.slainPreyData = { preyId: 'prey_hare', qualityMod: 0, tactic: 'ambush' };
  assert.equal(HuntingService.startTracking(state).success, false);
  assert.equal(HuntingService.selectZone(state, 'zone_gludio_plains'), false);
});

test('offline hunting synchronizes durability and clears the saved in-progress track', () => {
  const state = createHuntingState();
  state.hunting.autoHunting = true;
  state.hunting.isHunting = true;
  state.hunting.trackedPreyId = 'prey_hare';
  state.hunting.knifeDurability.knife_none = 10;
  state.lifeActivities.hunting.toolDurability = 10;

  const result = HuntingService.processOfflineHunting(state, 10);

  assert.ok(result.actualHunts > 0);
  assert.equal(state.hunting.isHunting, false);
  assert.equal(state.hunting.trackedPreyId, null);
  assert.equal(state.hunting.knifeDurability.knife_none, state.lifeActivities.hunting.toolDurability);
  assert.ok(state.hunting.lastAutoTick > 0);
});

test('offline hunting grants the final durability-limited result and stops AFK', () => {
  const state = createHuntingState();
  state.hunting.autoHunting = true;
  state.hunting.knifeDurability.knife_none = 1;
  state.lifeActivities.hunting.toolDurability = 1;

  const result = HuntingService.processOfflineHunting(state, 30);

  assert.equal(result.actualHunts, 1);
  assert.equal(state.hunting.knifeDurability.knife_none, 0);
  assert.equal(state.lifeActivities.hunting.toolDurability, 0);
  assert.equal(state.hunting.autoHunting, false);
});

test('offline hunting preserves its exact report when full inventory blocks rewards', () => {
  const state = createHuntingState();
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  state.hunting.autoHunting = true;
  state.hunting.knifeDurability.knife_none = 5;
  state.lifeActivities.hunting.toolDurability = 5;

  let saves = 0;
  assert.equal(HuntingService.processOfflineHunting(state, 10, { save: () => saves++ }), null);
  assert.equal(saves, 1, 'pending offline report must be persisted');
  assert.equal(state.hunting.totalHunted, 0);
  const resumedState = JSON.parse(JSON.stringify(state));
  const pending = structuredClone(resumedState.hunting.pendingOfflineHunting);
  assert.ok(pending?.actualHunts > 0);
  assert.equal(state.hunting.knifeDurability.knife_none, 5 - pending.attemptedHunts, 'offline attempts wear the knife even while rewards await inventory space');

  resumedState.inventory = [];
  const result = HuntingService.processOfflineHunting(resumedState, 0);
  assert.equal(result.actualHunts, pending.actualHunts);
  assert.deepEqual(result.matsGained, pending.matsGained);
  assert.equal(resumedState.hunting.totalHunted, pending.actualHunts);
  assert.equal(resumedState.hunting.pendingOfflineHunting, null);
  assert.equal(resumedState.hunting.knifeDurability.knife_none, 5 - pending.actualHunts);
});

test('manual field butchering advances the hunting level progression shown in its own panel', () => {
  const state = createHuntingState();
  state.hunting.skillLevel = 1;
  state.hunting.skillXp = 0;
  for (let i = 0; i < 12; i++) {
    state.hunting.awaitingButchering = true;
    state.hunting.slainPreyData = { preyId: 'prey_hare', qualityMod: 0, tactic: 'ambush' };
    assert.equal(HuntingService.executeFieldButchering(state, 'pelt'), true);
  }
  assert.ok(state.hunting.skillLevel > 1);
});

test('every listed prey and zone has valid references and canonical material rewards', () => {
  for (const zone of Object.values(HUNTING_ZONES)) {
    assert.ok(zone.availablePrey.length > 0, `${zone.id} has no prey`);
    for (const preyId of zone.availablePrey) {
      const prey = PREY_CATALOG[preyId];
      assert.ok(prey, `${zone.id} references missing prey ${preyId}`);
      assert.ok(prey.zones.includes(zone.id), `${preyId} is not assigned to ${zone.id}`);
      for (const rawResource of [prey.skinYield.primary, prey.skinYield.secondary, prey.exchangeReward].filter(Boolean)) {
        const resourceId = resolveCanonicalResourceId(rawResource);
        assert.ok(ALL_ITEMS[resourceId], `${preyId} yields unknown ${rawResource} (${resourceId})`);
      }
    }
  }
});

test('both field-butchering choices execute and award every registered prey species', () => {
  for (const prey of Object.values(PREY_CATALOG)) {
    for (const choice of ['pelt', 'trophy']) {
      const state = createHuntingState();
      state.hunting.awaitingButchering = true;
      state.hunting.slainPreyData = { preyId: prey.id, qualityMod: 0, tactic: 'ambush' };
      assert.equal(HuntingService.executeFieldButchering(state, choice), true, `${prey.id}/${choice} failed`);
      assert.equal(state.hunting.huntingLog[prey.id], 1);
      assert.ok(state.inventory.length > 0, `${prey.id}/${choice} granted no materials`);
    }
  }
});

test('the production hunting screen renders zone, tracking, butchering, tool and AFK controls', () => {
  const state = createHuntingState();
  const container = { innerHTML: '' };
  setRoot({ getElementById: id => id === 'tab-hunting' ? container : null, querySelector: () => null });
  try {
    renderHuntingUI(state);
  } finally {
    setRoot(null);
  }

  assert.match(container.innerHTML, /Territórios de caça/);
  assert.match(container.innerHTML, /window\.selectHuntingZone/);
  assert.match(container.innerHTML, /window\.startHuntingTrack/);
  assert.match(container.innerHTML, /window\.repairHuntingKnife/);
  assert.match(container.innerHTML, /window\.toggleAutoHunting/);
});

test('lure purchases reject invalid quantities without charging or changing stock', () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    const state = createHuntingState();
    state.gold = 100_000;
    const before = structuredClone(state);

    assert.equal(HuntingService.buyLure(state, 'lure_meat', qty), false);
    assert.deepEqual(state, before, `qty=${String(qty)} must not mutate currency or lure inventory`);
  }
});

test('pelt exchange rejects invalid quantities without spending bestiary progress', () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    const state = createHuntingState();
    state.hunting.huntingLog.prey_hare = 100;
    const before = structuredClone(state.hunting.huntingLog);

    assert.equal(HuntingService.exchangePelts(state, 'prey_hare', qty), false);
    assert.deepEqual(state.hunting.huntingLog, before, `qty=${String(qty)} must not consume prey progress`);
  }
});

test('pelt exchange preserves prey progress when its reward cannot fit in the backpack', () => {
  const state = createHuntingState();
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  state.hunting.huntingLog.prey_hare = PREY_CATALOG.prey_hare.exchangeRate;

  assert.equal(HuntingService.exchangePelts(state, 'prey_hare', 1), false);
  assert.equal(state.hunting.huntingLog.prey_hare, PREY_CATALOG.prey_hare.exchangeRate);
  assert.equal(state.inventory.length, 150);
});

test('field butchering keeps the slain prey and knife when a full backpack blocks its rewards', () => {
  const state = createHuntingState();
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  state.hunting.awaitingButchering = true;
  state.hunting.slainPreyData = { preyId: 'prey_hare', qualityMod: 0, tactic: 'ambush' };
  const durability = state.hunting.knifeDurability.knife_none;

  let saves = 0;
  assert.equal(HuntingService.executeFieldButchering(state, 'pelt', { save: () => saves++ }), false);
  assert.equal(saves, 1, 'pending field reward must be persisted');
  assert.equal(state.inventory.length, 150);
  assert.equal(state.hunting.knifeDurability.knife_none, durability);
  assert.equal(state.hunting.awaitingButchering, true);
  assert.equal(state.hunting.slainPreyData.preyId, 'prey_hare');
  assert.equal(state.hunting.totalHunted, 0);
  assert.ok(state.hunting.slainPreyData.pendingButchering?.rewards?.length);
  const pending = structuredClone(state.hunting.slainPreyData.pendingButchering);

  state.inventory = [];
  const floatMessages = [];
  assert.equal(HuntingService.executeFieldButchering(state, 'pelt', { floatText: message => floatMessages.push(message) }), true);
  assert.equal(state.hunting.totalHunted, 1);
  assert.equal(state.hunting.knifeDurability.knife_none, durability - 1);
  assert.equal(state.hunting.slainPreyData, null);
  assert.ok(floatMessages.length > 0);
  assert.equal(state.inventory.some(item => pending.rewards.some(reward => item.itemId === reward.itemId)), true);
});
