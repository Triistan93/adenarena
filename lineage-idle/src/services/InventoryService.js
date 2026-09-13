/**
 * InventoryService.js — Gestão de Inventário, Mochila, Baú e Seleção de Itens.
 *
 * Responsável por adições/remoções no inventário, limites de mochila/baú,
 * depósito/saque de warehouse, uso de consumíveis/buffs, venda e desmanche (salvage).
 */

import { D, HIGH_RARITIES, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getSellValue } from '../data/economy/economyBalance.js';

/**
 * Retorna o número máximo de slots na mochila do personagem (250 para Dwarf, 150 para demais).
 * @param {Object} state
 * @returns {number}
 */
export function getMaxInventorySlots(state) {
  const s = state || (typeof window !== 'undefined' ? window.state : null) || {};
  const base = (s.race === 'dwarf') ? 250 : 150;
  return base + (Number(s.bonusInventorySlots) || 0);
}

/**
 * Retorna o número máximo de slots no Baú (Warehouse).
 * @returns {number}
 */
export function getMaxWarehouseSlots() {
  return 300;
}

/**
 * Verifica se um item possui alta raridade (Raro ou superior) e exige confirmação prévia para venda/desmanche/cristalização.
 * @param {Object} item
 * @returns {boolean}
 */
export function isHighValueItem(item) {
  if (!item || !item.rarity) return false;
  const r = String(item.rarity).toLowerCase();
  return ['rare', 'epic', 'legendary', 'mythic'].includes(r) || HIGH_RARITIES.includes(r);
}

/**
 * Avalia com rigor e blindagem se um item dropado é elegível para reciclagem/venda automática AFK.
 * @param {Object} item
 * @param {Object} def
 * @param {Object} state
 * @returns {boolean}
 */
export function isEligibleForAutoRecycle(item, def, state) {
  if (!state || !state.autoRecycle || !state.autoRecycle.enabled) return false;
  if (!def || !item) return false;

  // 1. BLINDAGEM ABSOLUTA: Itens não-recicláveis (Whitelist/Hard Guards)
  const slot = String(def.slot || '').toLowerCase();
  const type = String(def.type || '').toLowerCase();
  const id = String(def.id || item.itemId || '').toLowerCase();
  const name = String(def.name || '').toLowerCase();

  const NEVER_RECYCLE_SLOTS = [
    'consumable', 'material', 'scroll', 'powerup', 'potion',
    'food', 'spellbook', 'talisman', 'pendant', 'coin',
    'quest', 'quest_item', 'recipe', 'key', 'box', 'container', 'essence',
    'agathion', 'cloak', 'hair', 'hair2', 'doll'
  ];
  if (NEVER_RECYCLE_SLOTS.includes(slot) || NEVER_RECYCLE_SLOTS.includes(type)) return false;
  if (def.stack || def.isQuestItem || item.isProtected) return false;

  // 2. Proteção estrita de Itens de Herança & Starter Packs
  if (def.isHeirloom || item.isHeirloom || id.includes('heirloom') || name.includes('herança')) return false;

  // 3. Proteção de Equipamentos Modificados / Encantados / Especiais
  if (item.enchant && item.enchant > 0) return false;
  if (item.augmented || item.soulCrystal || item.foundation) return false;
  if (item.equipped) return false;

  // 4. Deve ser um equipamento desequipável genuíno
  const GEAR_SLOTS = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'necklace', 'earring', 'ring', 'belt'];
  if (!GEAR_SLOTS.includes(slot)) return false;

  // 5. Verificação de Grau (Grade)
  const reqLvl = def.req?.level || def.level || 1;
  let gradeCode = 'ng';
  if (reqLvl >= 76) gradeCode = 's';
  else if (reqLvl >= 62) gradeCode = 'a';
  else if (reqLvl >= 52) gradeCode = 'b';
  else if (reqLvl >= 40) gradeCode = 'c';
  else if (reqLvl >= 20) gradeCode = 'd';
  else gradeCode = 'ng';

  // Grades A e S são permanentemente protegidas contra reciclagem automática
  if (gradeCode === 'a' || gradeCode === 's') return false;

  // Checa se o grau está explicitamente habilitado pelo jogador
  const gradeEnabled = state.autoRecycle.grades?.[gradeCode];
  if (!gradeEnabled) return false;

  // 6. Verificação de Raridade Máxima
  const RARITY_RANK = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'mythic': 6 };
  const itemRarity = String(item.rarity || 'common').toLowerCase();
  const maxRarity = String(state.autoRecycle.maxRarity || 'common').toLowerCase();
  const itemRank = RARITY_RANK[itemRarity] || 1;
  const maxRank = RARITY_RANK[maxRarity] || 1;

  if (itemRank > maxRank) return false;
  if (itemRank >= 4) return false; // Nunca reciclar itens épicos/lendários

  return true;
}

/**
 * Processa a reciclagem de um item elegível convertendo-o em Adena ou Cristais/Insumos.
 * @param {Object} item
 * @param {Object} def
 * @param {Object} state
 * @param {Object} callbacks
 */
export function processAutoRecycleItem(item, def, state, callbacks = {}) {
  const gData = D();
  const mode = state.autoRecycle?.mode || 'sell';
  const reqLvl = def.req?.level || def.level || 1;
  const itemRarity = String(item.rarity || 'common').toLowerCase();
  const mult = gData?.RARITY?.[itemRarity]?.mult || 1;

  if (mode === 'sell') {
    // Modo 1: Auto-Venda por Adena (50% Canônico)
    const goldGain = getSellValue(item);
    state.gold = (state.gold || 0) + goldGain;
    if (callbacks.log) {
      callbacks.log(`🪙 [Auto-Venda AFK] ${def.name} vendido automaticamente por +${goldGain.toLocaleString()} Adena`, 'loot');
    }
    return true;
  } else {
    // Modo 2: Desmanche por Cristais e Materiais
    let gradeCode = 'ng';
    if (reqLvl >= 76) gradeCode = 's';
    else if (reqLvl >= 62) gradeCode = 'a';
    else if (reqLvl >= 52) gradeCode = 'b';
    else if (reqLvl >= 40) gradeCode = 'c';
    else if (reqLvl >= 20) gradeCode = 'd';
    else gradeCode = 'ng';

    let matId = 'iron_ore';
    if (gradeCode === 's') matId = 'crystal_s';
    else if (gradeCode === 'a') matId = 'crystal_a';
    else if (gradeCode === 'b') matId = 'crystal_b';
    else if (gradeCode === 'c') matId = 'crystal_c';
    else if (gradeCode === 'd') matId = 'crystal_d';
    else matId = (def.slot === 'weapon') ? 'iron_ore' : 'suede';

    const matAmount = Math.max(1, Math.floor((reqLvl / 10 + 1) * mult));

    // Adiciona o material de desmanche de forma segura
    if (typeof callbacks.addToInventory === 'function') {
      callbacks.addToInventory(matId, matAmount);
    } else {
      let existing = (state.inventory || []).find(i => i.itemId === matId && !i.rarity && !i.equipped);
      if (existing) {
        existing.count = (existing.count || 1) + matAmount;
      } else {
        state.inventory = state.inventory || [];
        state.inventory.push({
          uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          itemId: matId,
          count: matAmount,
          equipped: false
        });
      }
    }

    const matName = gData?.ALL_ITEMS?.[matId]?.name || matId;
    if (callbacks.log) {
      callbacks.log(`🔨 [Auto-Recycle AFK] ${def.name} desmanchado em +${matAmount}x ${matName}`, 'loot');
    }
    return true;
  }
}

/**
 * Verifica se um item é protegido contra venda e seleção automática
 * (materiais de craft, poções, scrolls, enchants, spellbooks, talismãs).
 * @param {Object} item
 * @param {Object} [def]
 * @returns {boolean} True se for protegido
 */
export function isProtectedFromAutoSell(item, def) {
  if (!def) {
    const gData = D();
    def = gData?.ALL_ITEMS?.[item?.itemId];
  }
  if (!def) return false;
  const slot = String(def.slot || '').toLowerCase();
  const type = String(def.type || '').toLowerCase();
  const PROTECTED_SLOTS = [
    'consumable', 'material', 'scroll', 'powerup', 'potion',
    'food', 'spellbook', 'talisman', 'pendant', 'coin',
    'quest', 'quest_item', 'recipe', 'key', 'box', 'container', 'essence'
  ];
  if (PROTECTED_SLOTS.includes(slot) || PROTECTED_SLOTS.includes(type)) return true;
  if (def.stack || def.isQuestItem || item?.isProtected) return true;
  return false;
}

/**
 * Retorna se a definição de um item corresponde a um Equipamento genuíno desequipável.
 * @param {Object} def
 * @returns {boolean}
 */
export function isEquipmentItem(def) {
  if (!def) return false;
  const slot = String(def.slot || '').toLowerCase();
  const type = String(def.type || '').toLowerCase();
  if (def.stack || def.isQuestItem || type === 'material' || type === 'quest' || type === 'consumable') return false;
  const EQUIP_SLOTS = ['weapon', 'armor', 'shield', 'helmet', 'gloves', 'boots', 'legs', 'ring', 'necklace', 'earring', 'belt', 'cloak'];
  return EQUIP_SLOTS.includes(slot);
}

import { getItemGrade as balanceGetItemGrade } from '../engine/BalanceEngine.js';

/**
 * Retorna o Grade do item baseado na definição do item ou nível.
 * @param {number|Object} itemOrLvl
 * @returns {string} — 'ng', 'd', 'c', 'b', 's', 'boss', 'frostlord'
 */
export function getItemGrade(itemOrLvl) {
  if (typeof itemOrLvl === 'object' && itemOrLvl !== null) {
    return balanceGetItemGrade(itemOrLvl);
  }
  const lvl = Number(itemOrLvl) || 0;
  if (!lvl || lvl < 20) return 'ng';
  if (lvl < 40) return 'd';
  if (lvl < 52) return 'c';
  if (lvl < 62) return 'b';
  if (lvl < 80) return 's';
  if (lvl < 85) return 'boss';
  return 'frostlord';
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
    .filter(i => i.itemId === itemId && !i.equipped)
    .reduce((acc, i) => acc + (i.count || 1), 0);
}

/**
 * Retorna a contagem total de um determinado itemId no Baú (Warehouse).
 * @param {Object} state
 * @param {string} itemId
 * @returns {number}
 */
export function getWarehouseCount(state, itemId) {
  if (!state.warehouse || !Array.isArray(state.warehouse)) return 0;
  return state.warehouse
    .filter(i => i.itemId === itemId)
    .reduce((acc, i) => acc + (i.count || 1), 0);
}

/**
 * Adiciona um item ao inventário.
 * @param {Object} state
 * @param {string} itemId
 * @param {number} [amount=1]
 * @param {string} [rarity=null]
 * @param {boolean} [foundation=false]
 * @param {Object} [callbacks] — { log }
 * @returns {boolean} True se adicionado com sucesso
 */
export function consolidateInventoryStacks(state) {
  if (!state || !Array.isArray(state.inventory)) return;
  const gData = D();
  const newInv = [];
  const stackMap = new Map();

  for (const item of state.inventory) {
    if (!item || !item.itemId) continue;
    const def = gData?.ALL_ITEMS?.[item.itemId];
    const isStackable = def && (!!def.stack || ['consumable', 'material', 'scroll', 'powerup', 'potion', 'food', 'quest'].includes(String(def.slot || '').toLowerCase()) || ['consumable', 'material', 'scroll'].includes(String(def.type || '').toLowerCase()));

    if (isStackable && !item.equipped) {
      const key = def.id || item.itemId;
      if (stackMap.has(key)) {
        const existing = stackMap.get(key);
        existing.count = (existing.count || 1) + (item.count || 1);
      } else {
        item.itemId = key;
        item.count = item.count || 1;
        item.rarity = null;
        item.foundation = false;
        stackMap.set(key, item);
        newInv.push(item);
      }
    } else {
      newInv.push(item);
    }
  }
  state.inventory = newInv;
}

export function addToInventory(state, itemId, amount = 1, rarity = null, foundation = false, callbacks = {}, skipAutoSell = false) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId] || {
    id: itemId,
    name: itemId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    slot: itemId.includes('crystal') ? 'crystal' : (itemId.includes('stone') ? 'material' : (itemId.includes('belt') ? 'belt' : 'consumable')),
    type: itemId.includes('crystal') ? 'soul_crystal' : 'item',
    isSoulCrystal: itemId.includes('crystal'),
    stage: 1,
    tier: 3,
    rarity: 'rare',
    desc: 'Item místico de Aden.'
  };

  const maxSlots = getMaxInventorySlots(state);

  const isStackable = !!def.stack || ['consumable', 'material', 'scroll', 'powerup', 'potion', 'food', 'quest'].includes(String(def.slot || '').toLowerCase()) || ['consumable', 'material', 'scroll'].includes(String(def.type || '').toLowerCase());

  if (isStackable) {
    let remaining = amount;
    const maxStack = def.stack || 99999;
    while (remaining > 0) {
      const existing = state.inventory.find(i => (i.itemId === itemId || i.itemId === def.id) && !i.equipped && (i.count || 1) < maxStack);
      if (existing) {
        const space = maxStack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= maxSlots) {
          if (callbacks.log) callbacks.log('Mochila cheia!', 'system');
          return false;
        }
        const add = Math.min(maxStack, remaining);
        state.inventory.push({
          uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
          itemId: def.id || itemId, count: add, rarity: null, equipped: false, foundation: false
        });
        remaining -= add;
      }
    }
    return true;
  }

  const GEAR_SLOTS = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'necklace', 'earring', 'ring', 'hair', 'hair2', 'agathion', 'talisman'];
  const defSlot = String(def.slot || '').toLowerCase();
  const isGear = GEAR_SLOTS.includes(defSlot);

  // ═══════════════════════════════════════════════════════════════════════════
  // SISTEMA DE FILTRO DE LOOT AFK & AUTO-RECYCLE COM BLINDAGEM ESTREITA
  // ═══════════════════════════════════════════════════════════════════════════
  if (!skipAutoSell && isGear && isEligibleForAutoRecycle({ itemId, rarity, foundation }, def, state)) {
    processAutoRecycleItem({ itemId, rarity, foundation }, def, state, callbacks);
    return true;
  }

  const RARITY_RANK = { 'common': 1, 'uncommon': 2, 'rare': 3, 'epic': 4, 'legendary': 5, 'mythic': 6, 's': 7 };
  if (!skipAutoSell && isGear && rarity && !foundation && state.autoSellRarity && state.autoSellRarity !== 'off') {
    if (!isProtectedFromAutoSell(null, def)) {
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
  }

  for (let i = 0; i < amount; i++) {
    if (state.inventory.length >= maxSlots) {
      if (callbacks.log) callbacks.log('Inventory full!', 'system');
      return false;
    }
    const isEquip = def.slot && def.slot !== 'consumable' && def.slot !== 'material' && def.slot !== 'scroll' && def.slot !== 'powerup';
    // Detecta tipo do item para afixos temáticos (robe/light/heavy/bow/staff/dagger/melee)
    let affixes = [];
    if (isEquip) {
      const rollFn = gData?.rollAffixesForItem || gData?.rollAffixes;
      if (rollFn) {
        const { getArmorType, getWeaponType } = (typeof window !== 'undefined' && window.GameData)
          ? window.GameData
          : {};
        let itemType = null;
        if (def.slot === 'weapon' && getWeaponType) itemType = getWeaponType(def.id || itemId, def.name || '');
        else if (getArmorType) itemType = getArmorType(def.id || itemId, def.name || '');
        affixes = gData?.rollAffixesForItem
          ? gData.rollAffixesForItem(rarity || 'common', itemType)
          : gData.rollAffixes(rarity || 'common');
      }
    }
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
 * Deposita um item do inventário no Baú (Warehouse).
 * @param {Object} state
 * @param {string} uid
 * @param {number} [amount=1]
 * @param {Object} [callbacks]
 */
export function depositToWarehouse(state, uid, amount = 1, callbacks = {}) {
  const invIdx = state.inventory.findIndex(i => i.uid === uid);
  if (invIdx < 0) return false;
  const item = state.inventory[invIdx];
  if (item.equipped) {
    if (callbacks.log) callbacks.log('Desequipe o item antes de guardá-lo no baú.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return false;

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();

  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !item.rarity) {
    let remaining = Math.min(amount, item.count || 1);
    while (remaining > 0) {
      const existing = state.warehouse.find(i => i.itemId === item.itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.warehouse.length >= maxSlots) {
          if (callbacks.log) callbacks.log('Baú cheio!', 'system');
          return false;
        }
        const add = Math.min(def.stack, remaining);
        state.warehouse.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if (item.count > amount) item.count -= amount;
    else state.inventory.splice(invIdx, 1);
  } else {
    if (state.warehouse.length >= maxSlots) {
      if (callbacks.log) callbacks.log('Baú cheio!', 'system');
      return false;
    }
    state.inventory.splice(invIdx, 1);
    state.warehouse.push({ ...item, equipped: false });
  }

  if (callbacks.log) callbacks.log(`📦 Guardou ${def.name} no Baú.`, 'loot');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Retira um item do Baú (Warehouse) para a mochila.
 * @param {Object} state
 * @param {string} uid
 * @param {number} [amount=1]
 * @param {Object} [callbacks]
 */
export function withdrawFromWarehouse(state, uid, amount = 1, callbacks = {}) {
  state.warehouse = state.warehouse || [];
  const whIdx = state.warehouse.findIndex(i => i.uid === uid);
  if (whIdx < 0) return false;
  const item = state.warehouse[whIdx];

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return false;

  const maxInvSlots = getMaxInventorySlots(state);

  if (def.stack && (def.slot === 'consumable' || def.slot === 'material' || def.slot === 'scroll' || def.slot === 'powerup') && !item.rarity) {
    let remaining = Math.min(amount, item.count || 1);
    while (remaining > 0) {
      const existing = state.inventory.find(i => i.itemId === item.itemId && !i.rarity && (i.count || 1) < def.stack);
      if (existing) {
        const space = def.stack - (existing.count || 1);
        const add = Math.min(space, remaining);
        existing.count = (existing.count || 1) + add;
        remaining -= add;
      } else {
        if (state.inventory.length >= maxInvSlots) {
          if (callbacks.log) callbacks.log('Mochila cheia!', 'system');
          return false;
        }
        const add = Math.min(def.stack, remaining);
        state.inventory.push({ ...item, uid: Date.now() + '_' + Math.random().toString(36).slice(2, 8), count: add, equipped: false });
        remaining -= add;
      }
    }
    if (item.count > amount) item.count -= amount;
    else state.warehouse.splice(whIdx, 1);
  } else {
    if (state.inventory.length >= maxInvSlots) {
      if (callbacks.log) callbacks.log('Mochila cheia!', 'system');
      return false;
    }
    state.warehouse.splice(whIdx, 1);
    state.inventory.push({ ...item, equipped: false });
  }

  if (callbacks.log) callbacks.log(`🎒 Retirou ${def.name} do Baú.`, 'loot');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
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

/**
 * Calcula a pressão de capacidade do inventário/mochila.
 * Retorna os dados para renderização da barra de capacidade e banner de alerta.
 * @param {Object} state
 * @returns {{ count: number, max: number, pct: number, status: 'normal'|'warning'|'critical'|'full', label: string, color: string, isFull: boolean }}
 */
export function calculateInventoryPressure(state) {
  const inv = state?.inventory || [];
  const count = inv.length;
  const max = getMaxInventorySlots(state);
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;

  let status = 'normal';
  let label = 'Normal';
  let color = '#c8aa6e';

  if (pct >= 100) {
    status = 'full';
    label = 'Mochila Cheia';
    color = '#ff2a2a';
  } else if (pct >= 90) {
    status = 'critical';
    label = 'Crítico';
    color = '#ef4444';
  } else if (pct >= 75) {
    status = 'warning';
    label = 'Alerta';
    color = '#f59e0b';
  }

  return {
    count,
    max,
    pct,
    status,
    label,
    color,
    isFull: count >= max
  };
}

/**
 * Avalia se um item está protegido contra qualquer ação destrutiva (Venda, Desmanche, Cristalização).
 * Blindagem obrigatória: Itens equipados, favoritos, trancados, protegidos, itens de missão e herança.
 * @param {Object} item
 * @param {Object} [def]
 * @returns {boolean}
 */
export function isItemProtected(item, def) {
  if (!item) return true;
  if (!def) {
    const gData = D();
    def = gData?.ALL_ITEMS?.[item.itemId] || item;
  }

  // 1. Equipado no personagem
  if (item.equipped) return true;

  // 2. Favorito ou Trancado (Travamento de segurança manual do usuário)
  if (item.isFavorite || item.favorite || item.isLocked || item.locked || item.isProtected) return true;

  // 3. Itens de Missão / Quest
  const slot = String(def?.slot || item.slot || '').toLowerCase();
  const type = String(def?.type || item.type || '').toLowerCase();
  const id = String(def?.id || item.itemId || '').toLowerCase();
  const name = String(def?.name || '').toLowerCase();

  if (def?.isQuestItem || item.isQuestItem || slot === 'quest' || slot === 'quest_item' || type === 'quest' || id.startsWith('quest_')) {
    return true;
  }

  // 4. Itens de Herança (Heirloom / Starter)
  if (def?.isHeirloom || item.isHeirloom || id.includes('heirloom') || name.includes('herança')) {
    return true;
  }

  return false;
}

/**
 * Organiza a mochila do jogador:
 * 1. Agrupa consumíveis e materiais idênticos não-encantados em pilhas completas.
 * 2. Ordena os itens contextualmente respeitando a regra comercial (equipados sempre no topo, seguidos por critério).
 * @param {Object} state
 * @param {string} [sortCriteria='recommended']
 * @returns {{ freedSlots: number, originalCount: number, newCount: number }}
 */
export function organizeInventory(state, sortCriteria = 'recommended') {
  if (!state || !Array.isArray(state.inventory)) {
    return { freedSlots: 0, originalCount: 0, newCount: 0 };
  }

  const allItems = D()?.ALL_ITEMS || {};
  const originalCount = state.inventory.length;

  // Fase 1: Fusão de pilhas (Stacking) de itens compatíveis
  const unstacked = [];
  const stackMap = new Map(); // key -> Array<item>

  for (const item of state.inventory) {
    if (!item) continue;
    const def = allItems[item.itemId] || item;
    const slot = String(def.slot || item.slot || '').toLowerCase();
    const type = String(def.type || item.type || '').toLowerCase();
    const isInherentlyStackable = ['consumable', 'material', 'scroll', 'powerup', 'potion', 'coin', 'essence', 'crystal'].includes(slot) ||
      ['consumable', 'material', 'scroll', 'powerup', 'potion', 'coin', 'essence', 'crystal'].includes(type) ||
      def.isStackable === true || def.stackable === true || (Number(item.count) > 1);

    const maxStack = Number(def.stack) || (isInherentlyStackable ? 99999 : 1);
    const canStack = (maxStack > 1 || isInherentlyStackable) &&
      !item.equipped &&
      (!item.enchant || item.enchant === 0) &&
      !item.augmented &&
      !item.soulCrystal &&
      !item.foundation;

    if (canStack) {
      const rarity = String(item.rarity || 'common').toLowerCase();
      const key = `${item.itemId}__${rarity}`;
      if (!stackMap.has(key)) {
        stackMap.set(key, []);
      }
      stackMap.get(key).push(item);
    } else {
      unstacked.push(item);
    }
  }

  const consolidated = [...unstacked];

  for (const [key, items] of stackMap.entries()) {
    const firstItem = items[0];
    const def = allItems[firstItem.itemId] || firstItem;
    const maxStack = Number(def.stack) || 99999;

    let totalCount = items.reduce((acc, it) => acc + (Number(it.count) || 1), 0);

    while (totalCount > 0) {
      const thisBatch = Math.min(totalCount, maxStack);
      consolidated.push({
        ...firstItem,
        uid: items.length === 1 && totalCount === thisBatch ? firstItem.uid : (Date.now() + '_' + Math.random().toString(36).slice(2, 8)),
        count: thisBatch,
        equipped: false
      });
      totalCount -= thisBatch;
    }
  }

  // Fase 2: Ordenação determinística
  state.inventory = sortInventoryItems(consolidated, sortCriteria, state);

  const newCount = state.inventory.length;
  const freedSlots = Math.max(0, originalCount - newCount);

  return { freedSlots, originalCount, newCount };
}

/**
 * Ordena os itens do inventário de acordo com o critério escolhido.
 * @param {Array} items
 * @param {string} criteria
 * @param {Object} state
 * @returns {Array}
 */
export function sortInventoryItems(items, criteria = 'recommended', state = {}) {
  const allItems = D()?.ALL_ITEMS || {};
  const RARITY_VAL = { 'mythic': 6, 'legendary': 5, 'epic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
  const GRADE_VAL = { 's': 6, 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'ng': 1 };

  return [...items].sort((a, b) => {
    // Equipados sempre têm prioridade no topo da mochila
    if (a.equipped && !b.equipped) return -1;
    if (!a.equipped && b.equipped) return 1;

    const da = allItems[a.itemId] || a;
    const db = allItems[b.itemId] || b;

    const ra = RARITY_VAL[String(a.rarity || 'common').toLowerCase()] || 1;
    const rb = RARITY_VAL[String(b.rarity || 'common').toLowerCase()] || 1;

    const ga = GRADE_VAL[String(da.grade || '').toLowerCase()] || (da.tier || 1);
    const gb = GRADE_VAL[String(db.grade || '').toLowerCase()] || (db.tier || 1);

    const ea = Number(a.enchant || a.enchantLevel) || 0;
    const eb = Number(b.enchant || b.enchantLevel) || 0;

    const nameA = String(da.name || a.itemId || '').toLowerCase();
    const nameB = String(db.name || b.itemId || '').toLowerCase();

    switch (criteria) {
      case 'cp': {
        const cpa = (da.atk || 0) * 1.5 + (da.matk || 0) * 1.5 + (da.def || 0) * 1.2 + (da.mdef || 0) * 1.2 + ea * 25 + ra * 50;
        const cpb = (db.atk || 0) * 1.5 + (db.matk || 0) * 1.5 + (db.def || 0) * 1.2 + (db.mdef || 0) * 1.2 + eb * 25 + rb * 50;
        if (cpb !== cpa) return cpb - cpa;
        return nameA.localeCompare(nameB);
      }
      case 'grade': {
        if (gb !== ga) return gb - ga;
        if (rb !== ra) return rb - ra;
        if (eb !== ea) return eb - ea;
        return nameA.localeCompare(nameB);
      }
      case 'rarity': {
        if (rb !== ra) return rb - ra;
        if (gb !== ga) return gb - ga;
        if (eb !== ea) return eb - ea;
        return nameA.localeCompare(nameB);
      }
      case 'enchant': {
        if (eb !== ea) return eb - ea;
        if (gb !== ga) return gb - ga;
        return nameA.localeCompare(nameB);
      }
      case 'name': {
        return nameA.localeCompare(nameB);
      }
      case 'count': {
        const ca = Number(a.count) || 1;
        const cb = Number(b.count) || 1;
        if (cb !== ca) return cb - ca;
        return nameA.localeCompare(nameB);
      }
      case 'recommended':
      default: {
        if (gb !== ga) return gb - ga;
        if (rb !== ra) return rb - ra;
        if (eb !== ea) return eb - ea;
        const la = Number(da.req?.level || da.level) || 0;
        const lb = Number(db.req?.level || db.level) || 0;
        if (lb !== la) return lb - la;
        return nameA.localeCompare(nameB);
      }
    }
  });
}

/**
 * Gera a prévia para venda em lote (Batch Sell Preview)
 * @param {Object} state
 * @param {Array<string>|Set<string>} uids
 * @returns {{ items: Array, totalGold: number, totalCount: number, hasHighValue: boolean, protectedCount: number, uidsToSell: Array<string> }}
 */
export function getBatchSellPreview(state, uids) {
  const uidList = Array.from(uids || []);
  const allItems = D()?.ALL_ITEMS || {};
  const items = [];
  let totalGold = 0;
  let totalCount = 0;
  let hasHighValue = false;
  let protectedCount = 0;
  const uidsToSell = [];

  for (const uid of uidList) {
    const item = state.inventory?.find(i => String(i.uid) === String(uid));
    if (!item) continue;
    const def = allItems[item.itemId] || item;

    if (isItemProtected(item, def) || isProtectedFromAutoSell(item, def)) {
      protectedCount++;
      continue;
    }

    const itemQty = Number(item.count) || 1;
    const unitGold = getSellValue(item);
    const goldEarned = unitGold * itemQty;

    if (isHighValueItem(item)) {
      hasHighValue = true;
    }

    totalGold += goldEarned;
    totalCount += itemQty;
    uidsToSell.push(item.uid);

    items.push({
      uid: item.uid,
      itemId: item.itemId,
      name: def.name || item.itemId,
      count: itemQty,
      enchant,
      rarity: item.rarity || 'common',
      gold: goldEarned,
      icon: def.icon || 'item_default.png'
    });
  }

  return {
    items,
    totalGold,
    totalCount,
    hasHighValue,
    protectedCount,
    uidsToSell
  };
}

/**
 * Gera a prévia para desmanche em lote (Batch Salvage Preview)
 * @param {Object} state
 * @param {Array<string>|Set<string>} uids
 * @returns {{ items: Array, yieldSummary: Record<string, number>, totalCount: number, hasHighValue: boolean, protectedCount: number, uidsToSalvage: Array<string> }}
 */
export function getBatchSalvagePreview(state, uids) {
  const uidList = Array.from(uids || []);
  const allItems = D()?.ALL_ITEMS || {};
  const items = [];
  const yieldSummary = {};
  let totalCount = 0;
  let hasHighValue = false;
  let protectedCount = 0;
  const uidsToSalvage = [];

  for (const uid of uidList) {
    const item = state.inventory?.find(i => String(i.uid) === String(uid));
    if (!item) continue;
    const def = allItems[item.itemId] || item;

    if (isItemProtected(item, def)) {
      protectedCount++;
      continue;
    }

    const slot = String(def.slot || '').toLowerCase();
    const isEquip = slot && !['consumable', 'material', 'scroll', 'powerup', 'quest'].includes(slot);
    if (!isEquip) continue;

    if (isHighValueItem(item)) {
      hasHighValue = true;
    }

    const reqLvl = def.req ? (def.req.level || 1) : (def.level || 1);
    const rarityMult = item.rarity ? (D()?.RARITY?.[item.rarity]?.mult || 1) : 1;

    let matId = 'iron_ore';
    const tier = Number(def.tier) || 1;
    if (tier >= 6 || reqLvl >= 76) matId = 'crystal_s';
    else if (tier === 5 || reqLvl >= 62) matId = 'crystal_a';
    else if (tier === 4 || reqLvl >= 52) matId = 'crystal_b';
    else if (tier === 3 || reqLvl >= 40) matId = 'crystal_c';
    else if (tier === 2 || reqLvl >= 20) matId = 'crystal_d';
    else matId = (slot === 'weapon') ? 'iron_ore' : 'cloth';

    const amount = Math.max(1, Math.floor((reqLvl / 5 + 1) * rarityMult));

    yieldSummary[matId] = (yieldSummary[matId] || 0) + amount;
    totalCount++;
    uidsToSalvage.push(item.uid);

    items.push({
      uid: item.uid,
      itemId: item.itemId,
      name: def.name || item.itemId,
      rarity: item.rarity || 'common',
      enchant: Number(item.enchant) || 0,
      matId,
      amount,
      icon: def.icon || 'item_default.png'
    });
  }

  return {
    items,
    yieldSummary,
    totalCount,
    hasHighValue,
    protectedCount,
    uidsToSalvage
  };
}

/**
 * Gera a prévia para cristalização em lote (Crystallization Preview)
 * @param {Object} state
 * @param {Array<string>|Set<string>} [uids]
 * @returns {{ items: Array, yieldSummary: Record<string, number>, totalCount: number, hasHighValue: boolean, protectedCount: number, uidsToCrystallize: Array<string> }}
 */
export function getCrystallizationPreview(state, uids) {
  let uidList = uids ? Array.from(uids) : [];
  const allItems = D()?.ALL_ITEMS || {};
  const items = [];
  const yieldSummary = {};
  let totalCount = 0;
  let hasHighValue = false;
  let protectedCount = 0;
  const uidsToCrystallize = [];

  // Se nenhum UID fornecido, busca itens de Grau D a S desequipados
  if (uidList.length === 0) {
    uidList = (state.inventory || [])
      .filter(item => {
        if (!item || item.equipped) return false;
        const def = allItems[item.itemId] || item;
        const slot = String(def.slot || '').toLowerCase();
        const isEquip = slot && !['consumable', 'material', 'scroll', 'powerup', 'quest'].includes(slot);
        if (!isEquip) return false;
        const reqLvl = def.req ? (def.req.level || 1) : (def.level || 1);
        const tier = Number(def.tier) || 1;
        return tier >= 2 || reqLvl >= 20; // Grau D ou superior
      })
      .map(i => i.uid);
  }

  for (const uid of uidList) {
    const item = state.inventory?.find(i => String(i.uid) === String(uid));
    if (!item) continue;
    const def = allItems[item.itemId] || item;

    if (isItemProtected(item, def)) {
      protectedCount++;
      continue;
    }

    const slot = String(def.slot || '').toLowerCase();
    const isEquip = slot && !['consumable', 'material', 'scroll', 'powerup', 'quest'].includes(slot);
    if (!isEquip) continue;

    const reqLvl = def.req ? (def.req.level || 1) : (def.level || 1);
    const tier = Number(def.tier) || 1;
    const rarityMult = item.rarity ? (D()?.RARITY?.[item.rarity]?.mult || 1) : 1;
    const enchant = Number(item.enchant) || 0;

    let cId = null;
    let baseCrystals = 15;
    if (tier >= 6 || reqLvl >= 76) { cId = 'crystal_s'; baseCrystals = 70 + enchant * 15; }
    else if (tier === 5 || reqLvl >= 62) { cId = 'crystal_a'; baseCrystals = 45 + enchant * 10; }
    else if (tier === 4 || reqLvl >= 52) { cId = 'crystal_b'; baseCrystals = 30 + enchant * 8; }
    else if (tier === 3 || reqLvl >= 40) { cId = 'crystal_c'; baseCrystals = 20 + enchant * 6; }
    else if (tier === 2 || reqLvl >= 20) { cId = 'crystal_d'; baseCrystals = 15 + enchant * 4; }

    if (!cId) continue;

    if (isHighValueItem(item)) {
      hasHighValue = true;
    }

    const finalAmount = Math.max(5, Math.floor(baseCrystals * rarityMult));
    yieldSummary[cId] = (yieldSummary[cId] || 0) + finalAmount;
    totalCount++;
    uidsToCrystallize.push(item.uid);

    items.push({
      uid: item.uid,
      itemId: item.itemId,
      name: def.name || item.itemId,
      rarity: item.rarity || 'common',
      enchant,
      crystalId: cId,
      amount: finalAmount,
      icon: def.icon || 'item_default.png'
    });
  }

  return {
    items,
    yieldSummary,
    totalCount,
    hasHighValue,
    protectedCount,
    uidsToCrystallize
  };
}
