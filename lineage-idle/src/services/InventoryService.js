/**
 * InventoryService.js — Gestão de Inventário, Mochila, Baú e Seleção de Itens.
 *
 * Responsável por adições/remoções no inventário, limites de mochila/baú,
 * depósito/saque de warehouse, uso de consumíveis/buffs, venda e desmanche (salvage).
 */

import { D, HIGH_RARITIES, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';


/**
 * Retorna o número máximo de slots na mochila do personagem (250 para Dwarf, 150 para demais).
 * @param {Object} state
 * @returns {number}
 */
export function getMaxInventorySlots(state) {
  return (state.race === 'dwarf') ? 250 : 150;
}

/**
 * Retorna o número máximo de slots no Baú (Warehouse).
 * @returns {number}
 */
export function getMaxWarehouseSlots() {
  return 100;
}

/**
 * Verifica se um item possui alta raridade e exige confirmação prévia para venda/desmanche.
 * @param {Object} item
 * @returns {boolean}
 */
export function isHighValueItem(item) {
  if (!item || !item.rarity) return false;
  return HIGH_RARITIES.includes(item.rarity.toLowerCase());
}

/**
 * Retorna o Grade do item baseado no nível requerido.
 * @param {number} lvl
 * @returns {string}
 */
export function getItemGrade(lvl) {
  if (!lvl || lvl < 20) return 'No Grade';
  if (lvl < 40) return 'D Grade';
  if (lvl < 52) return 'C Grade';
  if (lvl < 62) return 'B Grade';
  if (lvl < 76) return 'A Grade';
  return 'S Grade';
}

/**
 * Retorna a contagem total de um determinado itemId no inventário.
 * @param {Object} state
 * @param {string} itemId
 * @returns {number}
 */
export function getInventoryCount(state, itemId) {
  if (!state.inventory || !Array.isArray(state.inventory)) return 0;
  return state.inventory
    .filter(i => i.itemId === itemId)
    .reduce((acc, i) => acc + (i.count || 1), 0);
}

/**
 * Adiciona um item ao inventário.
 * @param {Object} state
 * @param {string} itemId
 * @param {number} [amount=1]
 * @param {string|null} [rarity=null]
 * @param {boolean} [foundation=false]
 * @param {Object} [callbacks] — { log }
 * @returns {boolean} True se adicionado com sucesso
 */
export function addToInventory(state, itemId, amount = 1, rarity = null, foundation = false, callbacks = {}) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def) return false;

  const maxSlots = getMaxInventorySlots(state);

  // Empilhamento automático para consumíveis/materiais/scrolls sem raridade
  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !rarity) {
    let remaining = amount;
    while (remaining > 0) {
      const existing = state.inventory.find(i => i.itemId === itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= maxSlots) {
          if (callbacks.log) callbacks.log('Inventory full!', 'system');
          return false;
        }
        const add = Math.min(def.stack, remaining);
        state.inventory.push({
          uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          itemId, count: add, rarity: null, equipped: false, foundation: false
        });
        remaining -= add;
      }
    }
    return true;
  }

  // Sistema de Auto-Sell por raridade
  const RARITY_RANK = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'mythic': 6, 's': 7 };
  if (rarity && !foundation && state.autoSellRarity && state.autoSellRarity !== 'off') {
    const itemRarity = rarity.toLowerCase();
    const targetRank = RARITY_RANK[state.autoSellRarity.toLowerCase()] || 0;
    const itemRank = RARITY_RANK[itemRarity] || 1;
    if (itemRank <= targetRank) {
      const mult = gData?.RARITY?.[itemRarity] ? gData.RARITY[itemRarity].mult : 1;
      const price = Math.max(1, Math.floor((def.price || 10) * 0.4 * mult)) * amount;
      state.gold = (state.gold || 0) + price;
      if (callbacks.log) {
        callbacks.log(`🪙 [Auto-Sell] ${amount}x ${def.name} [${itemRarity.toUpperCase()}] vendido por +${price.toLocaleString()}g`, 'loot');
      }
      return true;
    }
  }

  for (let i = 0; i < amount; i++) {
    if (state.inventory.length >= maxSlots) {
      if (callbacks.log) callbacks.log('Inventory full!', 'system');
      return false;
    }
    const isEquip = def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup';
    const affixes = isEquip ? (gData?.rollAffixes ? gData.rollAffixes(rarity || 'common') : []) : [];
    state.inventory.push({
      uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      itemId, count: 1, rarity, affixes, equipped: false, foundation: !!foundation
    });
  }
  return true;
}

/**
 * Remove um item do inventário pelo seu UID.
 * @param {Object} state
 * @param {string} uid
 * @param {number} [amount=1]
 * @returns {boolean}
 */
export function removeFromInventory(state, uid, amount = 1) {
  const idx = state.inventory.findIndex(i => i.uid === uid);
  if (idx < 0) return false;
  const item = state.inventory[idx];
  if (item.count > amount) {
    item.count -= amount;
    return true;
  }
  state.inventory.splice(idx, 1);
  return true;
}

/**
 * Remove itens do inventário filtrados por itemId.
 * @param {Object} state
 * @param {string} itemId
 * @param {number} count
 * @returns {boolean}
 */
export function removeFromInventoryByItemId(state, itemId, count) {
  let remaining = count;
  for (let i = state.inventory.length - 1; i >= 0; i--) {
    const item = state.inventory[i];
    if (item.itemId === itemId && !item.equipped) {
      const take = Math.min(remaining, item.count || 1);
      if ((item.count || 1) > take) {
        item.count -= take;
      } else {
        state.inventory.splice(i, 1);
      }
      remaining -= take;
      if (remaining <= 0) break;
    }
  }
  return remaining <= 0;
}

/**
 * Retorna o Set de UIDs selecionados no inventário.
 * @param {Object} state
 * @returns {Set<string>}
 */
export function getSelectedSet(state) {
  if (!(state.selectedUids instanceof Set)) {
    if (Array.isArray(state.selectedUids)) {
      state.selectedUids = new Set(state.selectedUids);
    } else {
      state.selectedUids = new Set();
    }
  }
  return state.selectedUids;
}

/** Alterna a seleção de um item no inventário */
export function toggleSelectItem(state, uid) {
  const set = getSelectedSet(state);
  if (set.has(uid)) set.delete(uid);
  else set.add(uid);
}

/** Seleciona todos os itens não equipados que passem na função de filtro */
export function selectItemsByFilter(state, filterFn) {
  const set = getSelectedSet(state);
  for (const item of state.inventory) {
    if (item && !item.equipped && filterFn(item)) {
      set.add(item.uid);
    }
  }
}

/** Limpa toda a seleção do inventário */
export function clearItemSelection(state) {
  const set = getSelectedSet(state);
  set.clear();
}
