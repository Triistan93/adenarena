// ManorService.js — Gerenciador de Sementes, Colheita e Trocas de Manor
import { MANOR_PROVINCES } from '../data/manor.js';

export const ManorService = {
  getManorState(state) {
    if (!state.manorData) {
      state.manorData = {
        activeProvince: 'gludio',
        seeds: {},
        crops: {}
      };
    }
    return state.manorData;
  },

  buySeeds(state, provinceId, amount = 20, callbacks = {}) {
    const prov = MANOR_PROVINCES[provinceId];
    if (!prov) return { success: false, reason: 'invalid_province' };

    const totalCost = (prov.seed.cost || 100) * amount;
    if ((state.gold || 0) < totalCost) {
      if (callbacks.log) callbacks.log(`Adena insuficiente! Custo para ${amount}x sementes: ${totalCost.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    state.gold -= totalCost;
    const mState = this.getManorState(state);
    mState.seeds[prov.seed.id] = (mState.seeds[prov.seed.id] || 0) + amount;
    mState.activeProvince = provinceId;

    if (callbacks.log) callbacks.log(`🌾 Compradas **${amount}x ${prov.seed.name}** por ${totalCost.toLocaleString()} Adena.`, 'gain');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  processHarvest(state, monster, callbacks = {}) {
    const mState = this.getManorState(state);
    const provId = mState.activeProvince || 'gludio';
    const prov = MANOR_PROVINCES[provId];
    if (!prov) return;

    const seedCount = mState.seeds[prov.seed.id] || 0;
    if (seedCount <= 0) return;

    // Consome 1 semente e colhe 1 crop
    mState.seeds[prov.seed.id]--;
    mState.crops[prov.seed.cropId] = (mState.crops[prov.seed.cropId] || 0) + 1;

    if (Math.random() < 0.20 && callbacks.log) {
      callbacks.log(`🌾 Colheita Manor com Sucesso: **1x ${prov.seed.cropName}** (Restam ${mState.seeds[prov.seed.id]} sementes).`, 'system');
    }
  },

  exchangeCrops(state, provinceId, callbacks = {}) {
    const prov = MANOR_PROVINCES[provinceId];
    if (!prov) return { success: false, reason: 'invalid_province' };

    const mState = this.getManorState(state);
    const currentCrops = mState.crops[prov.seed.cropId] || 0;
    const rate = prov.seed.exchangeRate || 5;

    if (currentCrops < rate) {
      if (callbacks.log) callbacks.log(`Você precisa de no mínimo ${rate}x ${prov.seed.cropName} para realizar a troca!`, 'warning');
      return { success: false, reason: 'insufficient_crops' };
    }

    const packages = Math.floor(currentCrops / rate);
    const usedCrops = packages * rate;
    mState.crops[prov.seed.cropId] -= usedCrops;

    const rewardItemId = prov.seed.rewardItem;
    state.inventory = state.inventory || [];
    const existing = state.inventory.find(i => i.itemId === rewardItemId);
    if (existing) {
      existing.count = (existing.count || 1) + packages;
    } else {
      state.inventory.push({
        uid: 'manor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        itemId: rewardItemId,
        count: packages,
        equipped: false
      });
    }

    if (callbacks.log) {
      callbacks.log(`📦 Entregues ${usedCrops}x ${prov.seed.cropName} no Castelo! Recebido: **${packages}x ${prov.seed.rewardItemName}**!`, 'rarity-epic');
    }
    if (callbacks.floatText) {
      callbacks.floatText(`🌾 +${packages}x ${prov.seed.rewardItemName}!`, 'float-epic');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true, count: packages };
  }
};
