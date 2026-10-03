import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ManorService } from '../lineage-idle/src/services/ManorService.js';
import { MANOR_SEEDS } from '../lineage-idle/src/data/manor.js';
import { addToInventory } from '../lineage-idle/src/services/InventoryService.js';

test('Manor purchases, active planting, level matching, harvest and exchange share one persisted state', (t) => {
  t.mock.method(Math, 'random', () => 0);
  const state = { level: 15, gold: 100_000, inventory: [] };
  const bought = ManorService.buySeeds(state, 'red_coda', 2);
  assert.equal(bought.success, true);
  assert.equal(state.manorData.seeds.red_coda, 2);
  assert.equal(ManorService.selectSeed(state, 'red_coda').success, true);

  const offLevel = ManorService.processHarvest(state, { level: 40 });
  assert.equal(offLevel.success, false);
  assert.equal(state.manorData.seeds.red_coda, 2);

  const harvest = ManorService.processHarvest(state, { level: 13 });
  assert.equal(harvest.success, true);
  assert.equal(state.manorData.seeds.red_coda, 1);
  assert.equal(state.manorData.crops.red_coda, 1);

  state.manorData.crops.red_coda = 5;
  const exchange = ManorService.exchangeCrops(state, 'red_coda', 1);
  assert.equal(exchange.success, true);
  assert.equal(state.manorData.crops.red_coda, 0);
  assert.equal(state.inventory.find(item => item.itemId === 'varnish')?.count, 1);
});

test('level 120 characters can harvest every Manor seed from a target at the seed level', (t) => {
  t.mock.method(Math, 'random', () => 0);
  for (const seed of Object.values(MANOR_SEEDS)) {
    const state = { level: 120, gold: 100_000, inventory: [] };
    assert.equal(ManorService.buySeeds(state, seed.id, 1).success, true, seed.id);
    const harvest = ManorService.processHarvest(state, { level: seed.level, name: `${seed.provinceId} target` });
    assert.equal(harvest.success, true, seed.id);
    assert.equal(state.manorData.seeds[seed.id], 0, seed.id);
    assert.equal(state.manorData.crops[seed.id], 1, seed.id);
  }
});

test('legacy Manor seed and crop saves remain available after the unified state is initialized', () => {
  const state = {
    level: 15,
    gold: 0,
    manorSeeds: { red_coda: 3 },
    manorCrops: { red_coda: 4 }
  };
  const manor = ManorService.getManorState(state);
  assert.equal(manor.seeds.red_coda, 3);
  assert.equal(manor.crops.red_coda, 4);
  assert.equal(state.manorSeeds.red_coda, 3);
  assert.equal(state.manorCrops.red_coda, 4);
});

test('legacy crop balances migrate once and cannot reappear after a market exchange', () => {
  const state = { level: 15, manorSeeds: {}, manorCrops: { red_coda: 5 }, inventory: [] };
  assert.equal(ManorService.getManorState(state).crops.red_coda, 5);
  const result = ManorService.exchangeCrops(state, 'red_coda', 1, { addToInventory: () => true });
  assert.equal(result.success, true);
  assert.equal(ManorService.getManorState(state).crops.red_coda, 0);
});

test('Manor preserves crops when inventory delivery fails, then exchanges exactly once after space is freed', () => {
  const state = {
    level: 15,
    gold: 0,
    inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 })),
    manorData: { seeds: {}, crops: { red_coda: 5 }, legacyMigrated: true }
  };
  const deliver = (itemId, amount) => addToInventory(state, itemId, amount);

  const full = ManorService.exchangeCrops(state, 'red_coda', 1, { addToInventory: deliver });
  assert.equal(full.reason, 'inventory_full');
  assert.equal(state.manorData.crops.red_coda, 5);
  assert.equal(state.inventory.length, 150);

  state.inventory.pop();
  const exchanged = ManorService.exchangeCrops(state, 'red_coda', 1, { addToInventory: deliver });
  assert.equal(exchanged.success, true);
  assert.equal(state.manorData.crops.red_coda, 0);
  assert.equal(state.inventory.filter(item => item.itemId === 'varnish').reduce((sum, item) => sum + item.count, 0), 1);

  assert.equal(ManorService.exchangeCrops(state, 'red_coda', 1, { addToInventory: deliver }).reason, 'insufficient_crops');
  assert.equal(state.inventory.filter(item => item.itemId === 'varnish').reduce((sum, item) => sum + item.count, 0), 1);
});

test('Manor never bypasses inventory capacity when exchange is called without injected delivery callback', () => {
  const state = {
    level: 15,
    gold: 0,
    inventory: Array.from({ length: 150 }, (_, index) => ({ uid: `full-${index}`, itemId: `filler_${index}`, count: 1 })),
    manorData: { seeds: {}, crops: { red_coda: 5 }, legacyMigrated: true }
  };

  const result = ManorService.exchangeCrops(state, 'red_coda', 1);

  assert.equal(result.reason, 'inventory_full');
  assert.equal(state.manorData.crops.red_coda, 5);
  assert.equal(state.inventory.length, 150);
  assert.equal(state.inventory.some(item => item.itemId === 'varnish'), false);
});

test('Company hub separates mercenary areas and keeps a Manor shortcut without solo castle ownership', () => {
  const ui = readFileSync(new URL('../lineage-idle/src/ui/GameUI.js', import.meta.url), 'utf8');
  const start = ui.indexOf('export function renderExpeditionsUI(state)');
  const end = ui.indexOf('/* ═', start + 1);
  const screen = ui.slice(start, end);
  assert.ok(start >= 0 && end > start, 'expedition renderer boundaries are present');
  assert.match(screen, /Companhia de Aden/);
  assert.match(screen, /role="tablist"/);
  assert.match(screen, /label: 'Mural'/);
  assert.match(screen, /label: 'Quartel'/);
  assert.match(screen, /label: 'Recrutamento'/);
  assert.match(screen, /label: 'Expedições'/);
  assert.match(screen, /Taverna de Aden/);
  assert.match(screen, /Atlas de Aden/);
  assert.match(screen, /window\.openManorModal\(\)/);
  assert.match(screen, /makeHubPanel\('overview', overviewHtml\)/);
  assert.match(screen, /makeHubPanel\('operations', operationsPanelHtml\)/);
  assert.doesNotMatch(screen, /DOMINAR|Impostos Passivos|conquerCastle|claimCastleTaxes|CASTLES_DEFS/);
});

test('Manor crop exchange stacks into existing inventory slot when backpack is at max capacity', () => {
  const inventory = Array.from({ length: 149 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_${index}`, count: 1 }));
  inventory.push({ uid: 'existing-varnish', itemId: 'varnish', count: 3 });

  const state = {
    level: 15,
    gold: 0,
    inventory,
    manorData: { seeds: {}, crops: { red_coda: 10 }, legacyMigrated: true }
  };

  assert.equal(state.inventory.length, 150);
  const result = ManorService.exchangeCrops(state, 'red_coda', 1);

  assert.equal(result.success, true);
  assert.equal(result.count, 2); // 10 crops / 5 ratio = 2 packages
  assert.equal(state.manorData.crops.red_coda, 0);
  assert.equal(state.inventory.length, 150); // Did not exceed 150 slots
  const varnishItem = state.inventory.find(item => item.itemId === 'varnish');
  assert.equal(varnishItem.count, 5); // 3 + 2 = 5
});

test('Manor state survives full JSON serialization and resumes active planting and crop counts intact', () => {
  const original = {
    level: 32,
    gold: 50_000,
    inventory: [],
    manorData: {
      activeProvince: 'dion',
      activeSeedId: 'red_cobol',
      seeds: { red_cobol: 15 },
      crops: { red_cobol: 8 },
      totalHarvested: 8,
      legacyMigrated: true
    }
  };

  const serialized = JSON.stringify(original);
  const resumed = JSON.parse(serialized);

  const mState = ManorService.getManorState(resumed);
  assert.equal(mState.activeProvince, 'dion');
  assert.equal(mState.activeSeedId, 'red_cobol');
  assert.equal(mState.seeds.red_cobol, 15);
  assert.equal(mState.crops.red_cobol, 8);
  assert.equal(mState.totalHarvested, 8);

  // Can harvest directly in resumed state
  const harvest = ManorService.processHarvest(resumed, { level: 31, name: 'Dion Target' });
  assert.equal(harvest.success, true);
  assert.equal(resumed.manorData.seeds.red_cobol, 14);
  assert.ok(resumed.manorData.crops.red_cobol >= 9);
});
