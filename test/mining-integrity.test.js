import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MiningService } from '../lineage-idle/src/services/lifeActivities/MiningService.js';
import { renderMiningUI } from '../lineage-idle/src/ui/MiningUI.js';
import { setRoot } from '../lineage-idle/src/core/DomHelpers.js';
import { MINERAL_NODES_CATALOG, MINING_ZONES } from '../lineage-idle/src/data/mining.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { resolveCanonicalResourceId } from '../lineage-idle/src/services/lifeActivities/ResourceDictionary.js';
import { LifeActivityCore } from '../lineage-idle/src/services/lifeActivities/LifeActivityCore.js';

function createMiningState() {
  return {
    level: 60,
    hp: 100,
    maxHp: 100,
    gold: 0,
    inventory: [],
    lifeActivities: {
      mining: { level: 10, xp: 0, progressionVersion: 1, tool: 'pickaxe_none', toolDurability: 10, maxDurability: 50, isWorking: false, autoMode: false }
    },
    mining: {
      skillLevel: 10,
      skillXp: 0,
      pickaxe: 'pickaxe_none',
      selectedTactic: 'standard',
      activeTactic: 'standard',
      activeLamp: null,
      activeZone: 'zone_abandoned_coal',
      isMining: false,
      mineStartTime: 0,
      targetedNodeId: null,
      mineDuration: 1,
      totalMined: 0,
      miningLog: {},
      autoMining: false,
      lastAutoTick: 0,
      galleryStability: 100,
      veinHazard: 'none',
      veinProbed: false,
      pickaxeDurability: { pickaxe_none: 10 },
      lampInventory: { lamp_oil: 0 }
    }
  };
}

test('the last pickaxe durability point still grants the completed extraction', () => {
  const state = createMiningState();
  state.mining.isMining = true;
  state.mining.targetedNodeId = 'node_coal_deposit';
  state.mining.mineStartTime = Date.now() - 10;
  state.mining.mineDuration = 1;
  state.mining.pickaxeDurability.pickaxe_none = 1;
  state.lifeActivities.mining.toolDurability = 1;

  assert.equal(MiningService.finishMining(state), true);
  assert.equal(state.mining.pickaxeDurability.pickaxe_none, 0);
  assert.equal(state.mining.totalMined, 1);
  assert.ok(state.inventory.length > 0);
});

test('a second mining start cannot replace the active vein or consume another lamp', () => {
  const state = createMiningState();
  state.mining.activeLamp = 'lamp_oil';
  state.mining.lampInventory.lamp_oil = 2;
  assert.equal(MiningService.startMining(state).success, true);
  const originalNode = state.mining.targetedNodeId;
  const originalStart = state.mining.mineStartTime;

  const duplicate = MiningService.startMining(state);

  assert.equal(duplicate.success, false);
  assert.equal(duplicate.reason, 'already_mining');
  assert.equal(state.mining.targetedNodeId, originalNode);
  assert.equal(state.mining.mineStartTime, originalStart);
  assert.equal(state.mining.lampInventory.lamp_oil, 1);
});

test('changing zone or tactic is rejected until the current extraction finishes', () => {
  const state = createMiningState();
  assert.equal(MiningService.startMining(state, 'heavy').success, true);
  const target = state.mining.targetedNodeId;
  const tactic = state.mining.activeTactic;

  assert.equal(MiningService.selectZone(state, 'zone_mithril_mines'), false);
  assert.equal(MiningService.selectTactic(state, 'precision'), false);
  assert.equal(state.mining.targetedNodeId, target);
  assert.equal(state.mining.activeTactic, tactic);
});

test('offline mining clears the saved active vein before crediting offline yields', () => {
  const state = createMiningState();
  state.mining.autoMining = true;
  state.mining.isMining = true;
  state.mining.targetedNodeId = 'node_coal_deposit';
  state.mining.mineStartTime = Date.now() - 10000;

  const result = MiningService.processOfflineMining(state, 10);

  assert.ok(result.actualMines > 0);
  assert.equal(state.mining.isMining, false);
  assert.equal(state.mining.targetedNodeId, null);
});

test('offline mining grants its last available extraction and disables AFK at zero durability', () => {
  const state = createMiningState();
  state.mining.autoMining = true;
  state.mining.pickaxeDurability.pickaxe_none = 1;
  state.lifeActivities.mining.toolDurability = 1;

  const result = MiningService.processOfflineMining(state, 30);

  assert.equal(result.actualMines, 1);
  assert.equal(state.mining.pickaxeDurability.pickaxe_none, 0);
  assert.equal(state.mining.autoMining, false);
  assert.ok(state.inventory.length > 0);
});

test('offline mining grants 30% of active cycles and leaves shared vigor unchanged', () => {
  const state = createMiningState();
  state.level = 40;
  state.lifeActivities.vigor = { current: 100, max: 100, lastRegen: Date.now() };
  state.mining.autoMining = true;
  state.mining.pickaxe = 'pickaxe_c';
  state.mining.activeZone = 'zone_plains_quarry';
  state.mining.pickaxeDurability = { pickaxe_c: 250 };
  state.mining.lampInventory = {};
  state.lifeActivities.mining = { level: 10, xp: 0, progressionVersion: 1, toolDurability: 250, maxDurability: 250 };

  const result = MiningService.processOfflineMining(state, 480);

  assert.equal(result.actualMines, 250);
  assert.equal(state.mining.pickaxeDurability.pickaxe_c, 0);
  assert.equal(LifeActivityCore.getVigorState(state).current, 100);
});

test('gallery stabilization does not consume an equipped branch for free', () => {
  const state = createMiningState();
  state.inventory = [{ id: 'branch', count: 1, equipped: true }];
  state.mining.galleryStability = 30;

  assert.equal(MiningService.shoreUpGallery(state), false);
  assert.equal(state.mining.galleryStability, 30);
  assert.equal(state.inventory[0].count, 1);
});

test('mining yields reference known catalog materials and each zone has a node pool', async () => {
  for (const zone of Object.values(MINING_ZONES)) {
    assert.ok(zone.availableNodes.length > 0, `${zone.id} has no nodes`);
    for (const nodeId of zone.availableNodes) {
      const node = MINERAL_NODES_CATALOG[nodeId];
      assert.ok(node, `${zone.id} references missing node ${nodeId}`);
      assert.ok(node.zones.includes(zone.id), `${nodeId} is not assigned to ${zone.id}`);
      assert.ok(node.yields.primary, `${nodeId} has no primary yield`);
      for (const rawResource of [node.yields.primary, node.yields.secondary].filter(Boolean)) {
        const canonicalId = resolveCanonicalResourceId(rawResource);
        assert.ok(ALL_ITEMS[canonicalId], `${nodeId} yields unknown item ${rawResource} (canonical ${canonicalId})`);
      }
    }
  }
});

test('every configured mineral node executes through the real extraction and reward path', () => {
  const allNodeIds = new Set();
  for (const zone of Object.values(MINING_ZONES)) {
    for (const nodeId of zone.availableNodes) allNodeIds.add(nodeId);
  }
  assert.equal(allNodeIds.size, Object.keys(MINERAL_NODES_CATALOG).length, 'every catalog node must be reachable from a mining zone');

  for (const nodeId of allNodeIds) {
    const state = createMiningState();
    state.mining.isMining = true;
    state.mining.targetedNodeId = nodeId;
    state.mining.mineStartTime = Date.now() - 1000;
    state.mining.mineDuration = 1;
    state.mining.veinHazard = 'none';
    const node = MINERAL_NODES_CATALOG[nodeId];

    assert.equal(MiningService.finishMining(state), true, `${nodeId} failed extraction`);
    for (const rawResource of [node.yields.primary, node.yields.secondary].filter(Boolean)) {
      const resourceId = resolveCanonicalResourceId(rawResource);
      assert.ok(state.inventory.some(item => (item.itemId || item.id) === resourceId), `${nodeId} did not grant ${resourceId}`);
    }
    assert.equal(state.mining.miningLog[nodeId], 1);
    assert.ok(state.lifeActivities.mining.xp > 0);
  }
});

test('each mining zone enforces its level gate and accepts the exact minimum', () => {
  for (const zone of Object.values(MINING_ZONES)) {
    if (zone.minLevel > 1) {
      const underLevel = createMiningState();
      underLevel.level = zone.minLevel - 1;
      underLevel.mining.skillLevel = zone.minSkillLevel;
      assert.equal(MiningService.selectZone(underLevel, zone.id), false, `${zone.id} unlocked below its character-level gate`);
    }

    if ((zone.minSkillLevel || 1) > 1) {
      const underMastery = createMiningState();
      underMastery.level = zone.minLevel;
      underMastery.lifeActivities.mining.level = zone.minSkillLevel - 1;
      assert.equal(MiningService.selectZone(underMastery, zone.id), false, `${zone.id} unlocked below its profession-mastery gate`);
    }

    const eligible = createMiningState();
    eligible.level = zone.minLevel;
    eligible.lifeActivities.mining.level = zone.minSkillLevel;
    assert.equal(MiningService.selectZone(eligible, zone.id), true, `${zone.id} rejected minimum level`);
    assert.equal(eligible.mining.activeZone, zone.id);
  }
});

test('special vein hazards apply their declared stability, yield and tool/HP effects', () => {
  const crystalState = createMiningState();
  crystalState.mining.isMining = true;
  crystalState.mining.targetedNodeId = 'node_coal_deposit';
  crystalState.mining.mineStartTime = Date.now() - 10;
  crystalState.mining.mineDuration = 1;
  crystalState.mining.selectedTactic = 'precision';
  crystalState.mining.activeTactic = 'precision';
  crystalState.mining.veinHazard = 'dense_crystal';
  MiningService.finishMining(crystalState);
  const coal = crystalState.inventory.find(item => (item.itemId || item.id) === 'coal');
  assert.ok((coal?.qty || coal?.count || 0) >= 6);

  const gasState = createMiningState();
  gasState.mining.isMining = true;
  gasState.mining.targetedNodeId = 'node_coal_deposit';
  gasState.mining.mineStartTime = Date.now() - 10;
  gasState.mining.mineDuration = 1;
  gasState.mining.selectedTactic = 'heavy';
  gasState.mining.activeTactic = 'heavy';
  gasState.mining.veinHazard = 'gas_pocket';
  MiningService.finishMining(gasState);
  assert.equal(gasState.hp, 90);
  assert.equal(gasState.mining.pickaxeDurability.pickaxe_none, 7);
});

test('the production mining screen renders zone, vein, tool, lamp and AFK actions', () => {
  const state = createMiningState();
  const container = { innerHTML: '' };
  setRoot({ getElementById: id => id === 'tab-mining' ? container : null, querySelector: () => null });
  try {
    renderMiningUI(state);
  } finally {
    setRoot(null);
  }

  assert.match(container.innerHTML, /Galerias e jazidas/);
  assert.match(container.innerHTML, /window\.selectMiningZone/);
  assert.match(container.innerHTML, /window\.probeMiningVein/);
  assert.match(container.innerHTML, /window\.startMiningHarvest/);
  assert.match(container.innerHTML, /window\.buyMiningLamp/);
  assert.match(container.innerHTML, /window\.toggleAutoMining/);
});

test('lamp purchases reject invalid quantities without changing currency or stock', () => {
  for (const qty of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2']) {
    const state = createMiningState();
    state.gold = 100_000;
    const before = structuredClone(state);

    const result = MiningService.buyLamp(state, 'lamp_oil', qty);

    assert.equal(result, false, `qty=${String(qty)} must be rejected`);
    assert.deepEqual(state, before, `qty=${String(qty)} must not alter saved Adena or lamp stock`);
  }
});

test('a full backpack preserves the active vein, stability and pickaxe until ore can be stored', () => {
  const state = createMiningState();
  state.race = 'human';
  state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  state.mining.isMining = true;
  state.mining.targetedNodeId = 'node_coal_deposit';
  state.mining.mineStartTime = Date.now() - 10_000;
  state.mining.mineDuration = 1;
  state.mining.pickaxeDurability.pickaxe_none = 5;
  state.lifeActivities.mining.toolDurability = 5;
  state.mining.galleryStability = 100;

  let saves = 0;
  let warnings = 0;
  const callbacks = { save: () => saves++, log: () => warnings++ };
  assert.equal(MiningService.finishMining(state, callbacks), false);
  assert.equal(state.inventory.length, 150);
  assert.equal(state.mining.pickaxeDurability.pickaxe_none, 5);
  assert.equal(state.mining.galleryStability, 100);
  assert.equal(state.mining.isMining, true);
  assert.equal(state.mining.targetedNodeId, 'node_coal_deposit');
  const pendingReward = structuredClone(state.mining.pendingMineReward);
  assert.equal(MiningService.finishMining(state, callbacks), false);
  assert.equal(saves, 1, 'blocked automatic retry should not save every UI tick');
  assert.equal(warnings, 1, 'blocked automatic retry should not repeat the warning');

  state.inventory.splice(-2);
  assert.equal(MiningService.finishMining(state, callbacks), true);
  const primaryId = resolveCanonicalResourceId(MINERAL_NODES_CATALOG.node_coal_deposit.yields.primary);
  assert.equal(state.inventory.find(item => item.itemId === primaryId)?.count, pendingReward.primaryQty);
  assert.equal(state.mining.pickaxeDurability.pickaxe_none, 4);
  assert.equal(state.mining.isMining, false);
  assert.equal(state.mining.pendingMineReward, null);
});
