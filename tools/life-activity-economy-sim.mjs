/**
 * Simula uma sessão offline de até 8h pelos serviços reais de Coleta,
 * Mineração, Caça e Pesca, isoladamente. Os níveis 85/120 são níveis de
 * personagem; a maestria de profissão segue o limite atual (40 para Coleta/
 * Mineração e 30 para Caça/Pesca). A venda de recompensas usa somente o preço
 * canônico de itens empilháveis no NPC, sem valorar uso em receitas.
 *
 * Executar: node tools/life-activity-economy-sim.mjs [quantidade-de-rodadas]
 */
import { GatheringService } from '../lineage-idle/src/services/lifeActivities/GatheringService.js';
import { MiningService } from '../lineage-idle/src/services/lifeActivities/MiningService.js';
import { HuntingService } from '../lineage-idle/src/services/HuntingService.js';
import { FishingService } from '../lineage-idle/src/services/FishingService.js';
import { GATHERING_ZONES, SICKLES_CATALOG } from '../lineage-idle/src/data/gathering.js';
import { MINING_ZONES, PICKAXES_CATALOG } from '../lineage-idle/src/data/mining.js';
import { HUNTING_ZONES, KNIVES_CATALOG } from '../lineage-idle/src/data/hunting.js';
import { FISHING_ZONES, RODS_CATALOG } from '../lineage-idle/src/data/fishing.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { getSellValue } from '../lineage-idle/src/data/economy/economyBalance.js';

globalThis.GameData = { ALL_ITEMS, RARITY: {} };

const rounds = Math.max(1, Math.min(1000, Math.floor(Number(process.argv[2]) || 100)));
const profiles = [
  { level: 1, mastery: 1, zoneIndex: 0, toolTier: 'starter' },
  { level: 40, mastery: 10, zoneIndex: 2, toolTier: 'mid' },
  { level: 85, mastery: 25, zoneIndex: 4, toolTier: 'top' },
  { level: 120, mastery: 25, zoneIndex: 5, toolTier: 'top' }
];
const activities = ['gathering', 'mining', 'hunting', 'fishing'];
const consumablePrices = {
  pouch_dew: 100, pouch_herb: 350, pouch_alchemical: 1000, pouch_crystal: 3000,
  lamp_oil: 100, lamp_miner: 350, lamp_alchemical: 1000, lamp_crystal: 3000,
  lure_meat: 100, lure_scent: 350, lure_blood: 1000, lure_crystal: 3000,
  bait_worm: 10, bait_lure: 50, bait_golden: 200, bait_crystal: 1000
};

function seedRandom(seed) {
  let value = seed | 0;
  return () => {
    value = (value + 0x6D2B79F5) | 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeState(level) {
  return {
    level, gold: 1_000_000_000, hp: 100_000, maxHp: 100_000,
    inventory: [], equipment: {},
    lifeActivities: { vigor: { current: 100, max: 100, lastRegen: Date.now() } }
  };
}

function configure(state, activity, profile) {
  const tier = profile.toolTier;
  if (activity === 'gathering') {
    const zone = Object.values(GATHERING_ZONES)[profile.zoneIndex];
    const toolId = tier === 'starter' ? 'sickle_none' : tier === 'mid' ? 'sickle_c' : 'sickle_a';
    const tool = SICKLES_CATALOG[toolId];
    const consumableId = zone.requiredPouch || null;
    state.gathering = {
      skillLevel: profile.mastery, sickle: toolId, selectedTactic: 'standard', activePouch: consumableId,
      activeZone: zone.id, autoGathering: true, sickleDurability: { [toolId]: tool.durabilityMax },
      pouchInventory: consumableId ? { [consumableId]: 1000 } : {}, gatheringLog: {}, totalHarvested: 0
    };
    return { zone, toolId, tool, consumableId, stockKey: 'pouchInventory', durabilityKey: 'sickleDurability',
      run: () => GatheringService.processOfflineGathering(state, 480), actions: result => result?.actualHarvests || 0 };
  }
  if (activity === 'mining') {
    const zone = Object.values(MINING_ZONES)[profile.zoneIndex];
    const toolId = tier === 'starter' ? 'pickaxe_none' : tier === 'mid' ? 'pickaxe_c' : 'pickaxe_a';
    const tool = PICKAXES_CATALOG[toolId];
    const consumableId = zone.requiredLamp || null;
    state.mining = {
      skillLevel: profile.mastery, pickaxe: toolId, selectedTactic: 'standard', activeLamp: consumableId,
      activeZone: zone.id, autoMining: true, pickaxeDurability: { [toolId]: tool.durabilityMax },
      lampInventory: consumableId ? { [consumableId]: 1000 } : {}, miningLog: {}, totalMined: 0,
      galleryStability: 100, veinHazard: 'none'
    };
    return { zone, toolId, tool, consumableId, stockKey: 'lampInventory', durabilityKey: 'pickaxeDurability',
      run: () => MiningService.processOfflineMining(state, 480), actions: result => result?.actualMines || 0 };
  }
  if (activity === 'hunting') {
    const zone = Object.values(HUNTING_ZONES)[profile.zoneIndex];
    const toolId = tier === 'starter' ? 'knife_none' : tier === 'mid' ? 'knife_c' : 'knife_a';
    const tool = KNIVES_CATALOG[toolId];
    const consumableId = zone.requiredLure || null;
    state.hunting = {
      skillLevel: profile.mastery, knife: toolId, selectedTactic: 'ambush', activeLure: consumableId,
      activeZone: zone.id, autoHunting: true, knifeDurability: { [toolId]: tool.durabilityMax },
      lureInventory: consumableId ? { [consumableId]: 1000 } : {}, huntingLog: {}, totalHunted: 0
    };
    return { zone, toolId, tool, consumableId, stockKey: 'lureInventory', durabilityKey: 'knifeDurability',
      run: () => HuntingService.processOfflineHunting(state, 480), actions: (_result, s) => s.hunting.knifeDurability[toolId] === undefined ? 0 : tool.durabilityMax - s.hunting.knifeDurability[toolId] };
  }

  const zone = Object.values(FISHING_ZONES)[profile.zoneIndex];
  const toolId = tier === 'starter' ? 'rod_none' : tier === 'mid' ? 'rod_c' : 'rod_a';
  const tool = RODS_CATALOG[toolId];
  const consumableId = zone.requiredBait || 'bait_worm';
  state.fishing = {
    skillLevel: profile.mastery, rod: toolId, activeBait: consumableId, activeZone: zone.id,
    autoFishing: true, rodDurability: { [toolId]: tool.durability },
    baitInventory: { [consumableId]: 1000 }, fishLog: {}, totalCaught: 0, pendingFishRewards: []
  };
  return { zone, toolId, tool, consumableId, stockKey: 'baitInventory', durabilityKey: 'rodDurability',
    run: () => FishingService.processOfflineFish(state, 480), actions: (_result, s) => tool.durability - s.fishing.rodDurability[toolId] };
}

function getDurability(tool, activity) {
  return activity === 'fishing' ? tool.durability : tool.durabilityMax;
}

function getRepairCost(tool, activity, wear) {
  if (activity === 'fishing') return wear * Math.ceil(tool.repairCost / tool.durability);
  return Math.max(100, Math.floor(tool.repairCost * (wear / tool.durabilityMax)));
}

function summarize(activity, profile, seed) {
  Math.random = seedRandom(seed);
  const state = makeState(profile.level);
  const config = configure(state, activity, profile);
  const result = config.run();
  const materialSale = state.inventory.reduce((sum, item) => sum + getSellValue(item) * (item.count || 1), 0);
  const stockRemaining = config.consumableId ? state[activity][config.stockKey][config.consumableId] || 0 : 0;
  const consumablesUsed = config.consumableId ? 1000 - stockRemaining : 0;
  const consumableSpend = consumablesUsed * (consumablePrices[config.consumableId] || 0);
  const durabilitySpent = getDurability(config.tool, activity) -
    (state[activity][config.durabilityKey][config.toolId] || 0);
  const repairSpend = getRepairCost(config.tool, activity, durabilitySpent);
  const actions = config.actions(result, state);
  return { actions, successes: activity === 'fishing' ? result?.totalCaught || 0 : activity === 'hunting' ? result?.actualHunts || 0 : actions,
    materialSale, consumablesUsed, consumableSpend, durabilitySpent, repairSpend,
    netSaleAfterOperatingCosts: materialSale - consumableSpend - repairSpend };
}

console.log(`Simulação dos serviços reais de profissão — ${rounds} rodadas por cenário; cada rodada representa até 8h offline.`);
console.log('Venda de materiais calculada pelo preço canônico do NPC; valor de uso em receitas e valor de PvE não incluídos.');
for (const profile of profiles) {
  for (const activity of activities) {
    const results = Array.from({ length: rounds }, (_, index) => summarize(activity, profile, 50_000 + index * 7919 + profile.level * 17));
    const avg = key => results.reduce((sum, result) => sum + result[key], 0) / rounds;
    console.log(JSON.stringify({ level: profile.level, mastery: profile.mastery, activity, rounds,
      actionsPer8h: Number(avg('actions').toFixed(1)),
      successfulRewardsPer8h: Number(avg('successes').toFixed(1)),
      npcSaleAdena: Math.round(avg('materialSale')),
      consumableUnits: Number(avg('consumablesUsed').toFixed(1)),
      consumableAdena: Math.round(avg('consumableSpend')),
      toolDurabilitySpent: Number(avg('durabilitySpent').toFixed(1)),
      repairAdena: Math.round(avg('repairSpend')),
      netNpcSaleAfterOperatingCosts: Math.round(avg('netSaleAfterOperatingCosts'))
    }));
  }
}
