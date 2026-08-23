// DyeService.js — Gerenciamento do Symbol Maker & Tatuagens de Henna
import { DYES_CATALOG } from '../data/dyes.js';

export const DyeService = {
  getDyeSlots(state) {
    const lvl = state.level || 1;
    return [
      { index: 0, requiredLvl: 20, name: '1º Símbolo (1ª Classe)', unlocked: lvl >= 20, tattoo: state.tattoos?.[0] || null },
      { index: 1, requiredLvl: 40, name: '2º Símbolo (2ª Classe)', unlocked: lvl >= 40, tattoo: state.tattoos?.[1] || null },
      { index: 2, requiredLvl: 76, name: '3º Símbolo (3ª Classe)', unlocked: lvl >= 76, tattoo: state.tattoos?.[2] || null }
    ];
  },

  calculateNetDyeBonuses(state) {
    const net = { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
    if (!state.tattoos || !Array.isArray(state.tattoos)) return net;

    for (const t of state.tattoos) {
      if (!t) continue;
      if (t.plusStat && net[t.plusStat] !== undefined) net[t.plusStat] += (t.plusVal || 0);
      if (t.minusStat && net[t.minusStat] !== undefined) net[t.minusStat] -= (t.minusVal || 0);
    }

    // Teto canônico de no máximo +5 de aumento por atributo
    for (const k of Object.keys(net)) {
      net[k] = Math.min(5, net[k]);
    }
    return net;
  },

  drawDye(state, slotIndex, dyeId, callbacks = {}) {
    const dyeDef = DYES_CATALOG[dyeId];
    if (!dyeDef) {
      if (callbacks.log) callbacks.log('Tinta de Henna inválida.', 'warning');
      return { success: false, reason: 'invalid_dye' };
    }

    const slots = this.getDyeSlots(state);
    const slot = slots[slotIndex];
    if (!slot || !slot.unlocked) {
      if (callbacks.log) callbacks.log(`Este slot de tatuagem exige Nível ${slot?.requiredLvl || 20}+!`, 'warning');
      return { success: false, reason: 'slot_locked' };
    }

    const costAdena = dyeDef.fee || 50000;
    if ((state.gold || 0) < costAdena) {
      if (callbacks.log) callbacks.log(`Adena insuficiente! O Gravador de Símbolos cobra ${costAdena.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    const requiredItems = dyeDef.requiredCount || 10;
    const invIdx = (state.inventory || []).findIndex(i => i.itemId === dyeId);
    const hasItems = invIdx >= 0 && (state.inventory[invIdx].count || 1) >= requiredItems;

    if (!hasItems) {
      if (callbacks.log) callbacks.log(`Você precisa de ${requiredItems}x ${dyeDef.name} para gravar este símbolo!`, 'warning');
      return { success: false, reason: 'insufficient_items' };
    }

    // Consome Adena e Tintas
    state.gold -= costAdena;
    if (state.inventory[invIdx].count > requiredItems) {
      state.inventory[invIdx].count -= requiredItems;
    } else {
      state.inventory.splice(invIdx, 1);
    }

    state.tattoos = state.tattoos || [null, null, null];
    state.tattoos[slotIndex] = {
      id: dyeId,
      name: dyeDef.name,
      shortName: dyeDef.shortName,
      icon: dyeDef.icon,
      plusStat: dyeDef.plusStat,
      plusVal: dyeDef.plusVal,
      minusStat: dyeDef.minusStat,
      minusVal: dyeDef.minusVal,
      engravedAt: Date.now()
    };

    if (callbacks.log) {
      callbacks.log(`🎭 Símbolo Sagrado Gravado! **${dyeDef.shortName}** no slot ${slotIndex + 1}.`, 'rarity-epic');
    }
    if (callbacks.floatText) {
      callbacks.floatText(`🎭 TATUAGEM GRAVADA! (${dyeDef.shortName})`, 'float-jackpot');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  removeDye(state, slotIndex, callbacks = {}) {
    state.tattoos = state.tattoos || [null, null, null];
    const existing = state.tattoos[slotIndex];
    if (!existing) {
      if (callbacks.log) callbacks.log('Nenhum símbolo gravado neste slot.', 'warning');
      return { success: false, reason: 'empty_slot' };
    }

    const removalFee = 10000;
    if ((state.gold || 0) < removalFee) {
      if (callbacks.log) callbacks.log(`Taxa de remoção insuficiente! Custo: ${removalFee.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    state.gold -= removalFee;
    const refundedItemId = existing.id;
    const refundedCount = 5; // Reembolsa 50% das tintas

    // Devolve as tintas para o inventário
    const invIdx = (state.inventory || []).findIndex(i => i.itemId === refundedItemId);
    if (invIdx >= 0) {
      state.inventory[invIdx].count = (state.inventory[invIdx].count || 1) + refundedCount;
    } else {
      state.inventory = state.inventory || [];
      state.inventory.push({
        uid: 'dye_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        itemId: refundedItemId,
        count: refundedCount,
        equipped: false
      });
    }

    state.tattoos[slotIndex] = null;

    if (callbacks.log) {
      callbacks.log(`🧹 Símbolo **${existing.shortName}** removido! Recuperadas ${refundedCount}x tintas de Henna.`, 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  }
};
