// Persistent Manor seed, hunting, harvest and exchange flow.
import { MANOR_PROVINCES, MANOR_SEEDS } from '../data/manor.js';
import { addToInventory } from './InventoryService.js';

const LEGACY_SEED_ALIASES = {
  seed_gludio: 'dark_coda', crop_gludio: 'dark_coda',
  seed_dion: 'red_cobol', crop_dion: 'red_cobol',
  seed_giran: 'twin_codran', crop_giran: 'twin_codran'
};

function mergeLegacyCounts(target, source = {}) {
  for (const [key, value] of Object.entries(source)) {
    const id = LEGACY_SEED_ALIASES[key] || key;
    const count = Math.max(0, Math.floor(Number(value) || 0));
    if (count > 0) target[id] = Math.max(Number(target[id]) || 0, count);
  }
}

function notify(state, callbacks = {}) {
  callbacks.updateAllUI?.();
  callbacks.save?.();
}

export const ManorService = {
  getManorState(state) {
    if (!state.manorData || typeof state.manorData !== 'object') {
      state.manorData = { activeProvince: 'gludio', activeSeedId: null, seeds: {}, crops: {}, totalHarvested: 0, legacyMigrated: false };
    }
    const manor = state.manorData;
    manor.seeds ||= {};
    manor.crops ||= {};
    manor.activeProvince = MANOR_PROVINCES[manor.activeProvince] ? manor.activeProvince : 'gludio';
    if (manor.activeSeedId && !MANOR_SEEDS[manor.activeSeedId]) manor.activeSeedId = null;
    if (!manor.legacyMigrated) {
      mergeLegacyCounts(manor.seeds, state.manorSeeds);
      mergeLegacyCounts(manor.crops, state.manorCrops);
      manor.legacyMigrated = true;
    }
    return manor;
  },

  selectProvince(state, provinceId, callbacks = {}) {
    const province = MANOR_PROVINCES[provinceId];
    if (!province) return { success: false, reason: 'invalid_province' };
    const manor = this.getManorState(state);
    manor.activeProvince = provinceId;
    if (!province.seedIds.includes(manor.activeSeedId)) manor.activeSeedId = null;
    notify(state, callbacks);
    return { success: true, provinceId };
  },

  selectSeed(state, seedId, callbacks = {}) {
    const seed = MANOR_SEEDS[seedId];
    if (!seed) return { success: false, reason: 'invalid_seed' };
    const manor = this.getManorState(state);
    manor.activeProvince = seed.provinceId;
    manor.activeSeedId = seedId;
    notify(state, callbacks);
    return { success: true, seedId };
  },

  buySeeds(state, seedId, amount = 20, callbacks = {}) {
    const seed = MANOR_SEEDS[seedId];
    if (!seed) return { success: false, reason: 'invalid_seed' };
    const quantity = Math.floor(Number(amount));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 100) return { success: false, reason: 'invalid_quantity' };
    const totalCost = seed.price * quantity;
    if ((Number(state.gold) || 0) < totalCost) {
      callbacks.log?.(`Adena insuficiente: são necessárias ${totalCost.toLocaleString()} Adena para ${quantity} sementes.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    const manor = this.getManorState(state);
    state.gold = (Number(state.gold) || 0) - totalCost;
    manor.seeds[seedId] = (Number(manor.seeds[seedId]) || 0) + quantity;
    manor.activeProvince = seed.provinceId;
    manor.activeSeedId = seedId;
    callbacks.log?.(`🌱 Compradas ${quantity} sementes de ${seed.name} por ${totalCost.toLocaleString()} Adena.`, 'gain');
    notify(state, callbacks);
    return { success: true, count: quantity, totalCost };
  },

  processHarvest(state, monster = {}, callbacks = {}) {
    const manor = this.getManorState(state);
    const seed = MANOR_SEEDS[manor.activeSeedId];
    if (!seed || (Number(manor.seeds[seed.id]) || 0) <= 0) return { success: false, reason: 'no_active_seed' };

    const monsterLevel = Math.floor(Number(monster.lvl ?? monster.level) || 0);
    // Manor eligibility follows the seed/target level. High-level characters may
    // still work an appropriate seed in a lower-level hunting area.
    const maxGap = Math.abs(monsterLevel - seed.level);
    if (monsterLevel <= 0 || maxGap > 5) return { success: false, reason: 'level_mismatch', maxGap };

    // Official manor rules favor a close level match; Aden Arena resolves sowing and harvest
    // together on a defeated target so the idle combat loop remains playable.
    const successChance = Math.max(0.5, 1 - maxGap * 0.05);
    manor.seeds[seed.id] -= 1;
    if (Math.random() > successChance) {
      callbacks.log?.(`🌱 A semente de ${seed.name} não vingou nesta criatura.`, 'system');
      return { success: false, reason: 'sowing_failed', seedsRemaining: manor.seeds[seed.id] };
    }

    const cropCount = 1 + Math.floor(Math.random() * 3);
    manor.crops[seed.id] = (Number(manor.crops[seed.id]) || 0) + cropCount;
    manor.totalHarvested = (Number(manor.totalHarvested) || 0) + cropCount;
    callbacks.log?.(`🌾 Colheita de Manor: ${cropCount} ${seed.cropName} obtida(s) em ${monster.name || 'uma criatura'}.`, 'system');
    notify(state, callbacks);
    return { success: true, seedId: seed.id, cropCount, seedsRemaining: manor.seeds[seed.id] };
  },

  exchangeCrops(state, seedId, rewardOption = 1, callbacks = {}) {
    // Retain compatibility with the former (provinceId, callbacks) call shape.
    if (typeof rewardOption === 'object' && rewardOption !== null) {
      callbacks = rewardOption;
      rewardOption = 1;
    }
    const seed = MANOR_SEEDS[seedId];
    if (!seed) return { success: false, reason: 'invalid_seed' };
    const option = Number(rewardOption) === 2 ? 2 : 1;
    const ratio = option === 2 ? seed.ratio2 : seed.ratio1;
    const rewardItemId = option === 2 ? seed.reward2 : seed.reward1;
    const manor = this.getManorState(state);
    const currentCrops = Number(manor.crops[seedId]) || 0;
    const packages = Math.floor(currentCrops / ratio);
    if (packages <= 0) {
      callbacks.log?.(`Colheita insuficiente: são necessárias ${ratio} ${seed.cropName} para esta troca.`, 'warning');
      return { success: false, reason: 'insufficient_crops' };
    }

    const usedCrops = packages * ratio;
    const deliver = callbacks.addToInventory || ((itemId, count) => addToInventory(state, itemId, count));
    if (!deliver(rewardItemId, packages)) return { success: false, reason: 'inventory_full' };
    manor.crops[seedId] -= usedCrops;

    callbacks.log?.(`📦 Trocadas ${usedCrops} ${seed.cropName} por ${packages} ${rewardItemId}.`, 'rarity-epic');
    callbacks.floatText?.(`🌾 +${packages} ${rewardItemId}`, 'float-epic');
    notify(state, callbacks);
    return { success: true, count: packages, usedCrops, rewardItemId };
  }
};
