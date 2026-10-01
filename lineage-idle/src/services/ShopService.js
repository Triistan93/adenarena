/**
 * ShopService.js — Gestão Completa da Guilda dos Mercadores (Lineage Idle).
 *
 * Responsável por:
 * 1. Compras regulares (armamentos, consumíveis, spellbooks).
 * 2. Compras místicas com rotação temporal e reroll de estoque ancestral.
 * 3. Venda individual de itens com cálculo de 50% de valor canônico.
 * 4. Venda em massa de itens comuns/lixo com proteção estrita (Lock 🔒 e Itens Equipados).
 * 5. Sistema de Recompra (Buyback Queue de até 10 itens).
 */

import { D } from '../core/GameConfig.js';
import { addToInventory, removeFromInventory, getSelectedSet, getMaxInventorySlots } from './InventoryService.js';
import { SELL_RATIO, MYSTIC_REROLL_COST, MAX_BUYBACK_ITEMS, getSellValue } from '../data/economy/economyBalance.js';

export { SELL_RATIO, MYSTIC_REROLL_COST, MAX_BUYBACK_ITEMS, getSellValue };

function hasValidWallet(state, cost) {
  return Number.isSafeInteger(state?.gold) && state.gold >= 0
    && Number.isSafeInteger(cost) && cost >= 0;
}

function isEquippedByState(state, item) {
  if (item?.equipped) return true;
  const equippedIds = new Set(Object.values(state?.equipment || {}).filter(Boolean));
  return equippedIds.has(item?.uid) || equippedIds.has(item?.id);
}

function makeUniqueInventoryUid(state, baseUid) {
  const existing = new Set((state.inventory || []).map(item => item.uid).filter(Boolean));
  if (baseUid && !existing.has(baseUid)) return baseUid;
  let uid;
  do {
    uid = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  } while (existing.has(uid));
  return uid;
}

/**
 * Realiza a compra de um item regular da loja.
 * @param {Object} state
 * @param {string} itemId
 * @param {number} [qty=1]
 * @param {string} [rarity='common']
 * @param {Object} [callbacks] — { log, updateAllUI, save, classSatisfies }
 * @returns {boolean}
 */
export function buyItem(state, itemId, qty = 1, rarity = 'common', callbacks = {}) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def) return false;

  const cleanQty = Math.max(1, parseInt(qty, 10) || 1);
  const basePrice = def.price || 100;
  const cost = basePrice * cleanQty;

  if (!hasValidWallet(state, cost)) return false;
  if (state.gold < cost) {
    if (callbacks.log) callbacks.log('Ouro insuficiente para realizar a compra!', 'system');
    return false;
  }
  const reqLvl = def.req?.level || def.reqLvl || 1;
  if (reqLvl > (state.level || 1)) {
    if (callbacks.log) callbacks.log(`Nível insuficiente. Requer Lv. ${reqLvl}.`, 'system');
    return false;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    if (callbacks.log) callbacks.log('Sua classe não pode utilizar este item.', 'system');
    return false;
  }

  if (!addToInventory(state, itemId, cleanQty, rarity, false, callbacks)) {
    if (callbacks.log) callbacks.log('Mochila cheia! Libere espaço no inventário.', 'system');
    return false;
  }

  state.gold -= cost;
  if (callbacks.log) callbacks.log(`🎁 Comprou ${cleanQty}x ${def.name} por 💰 ${cost.toLocaleString()} Gold!`, 'loot');

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Realiza a compra mística de um item com raridade sorteada.
 * @param {Object} state
 * @param {string} itemId
 * @param {string} rarity
 * @param {Object} [callbacks]
 * @returns {boolean}
 */
export function buyMysticItem(state, itemId, rarity, callbacks = {}) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def) return false;

  const rarityMult = gData?.RARITY?.[rarity]?.mult || 1;
  const price = Math.floor((def.price || 500) * rarityMult * 2);

  if (!hasValidWallet(state, price)) return false;
  if (state.gold < price) {
    if (callbacks.log) callbacks.log('Ouro insuficiente para o Mercador Místico!', 'system');
    return false;
  }
  if (def.req && def.req.level > (state.level || 1)) {
    if (callbacks.log) callbacks.log('Nível insuficiente para esta relíquia.', 'system');
    return false;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    if (callbacks.log) callbacks.log('Sua classe não pode utilizar este item.', 'system');
    return false;
  }

  if (!addToInventory(state, itemId, 1, rarity, false, callbacks)) {
    if (callbacks.log) callbacks.log('Mochila cheia! Libere espaço no inventário.', 'system');
    return false;
  }

  state.gold -= price;
  const rarityName = gData?.RARITY?.[rarity]?.name || rarity;
  if (callbacks.log) callbacks.log(`✨ Compra Mística: ${def.name} [${rarityName}] por 💰 ${price.toLocaleString()}g!`, 'rarity-' + rarity);

  // Remove o item comprado do estoque místico atual
  if (Array.isArray(state.mysticShopInventory)) {
    const idx = state.mysticShopInventory.findIndex(i => (i.id === itemId || i.itemId === itemId) && i.rarity === rarity);
    if (idx !== -1) {
      state.mysticShopInventory.splice(idx, 1);
    }
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Vende um item individual do inventário para o mercador (50% do valor de compra).
 * @param {Object} state
 * @param {string} uid - UID do item no inventário
 * @param {number} [qty=1]
 * @param {Object} [callbacks]
 * @returns {boolean}
 */
export function sellItem(state, uid, qty = 1, callbacks = {}) {
  if (!state.inventory || !Array.isArray(state.inventory)) return false;
  if (!hasValidWallet(state, 0)) return false;

  const itemIndex = state.inventory.findIndex(i => i.uid === uid || i.id === uid);
  if (itemIndex === -1) return false;

  const item = state.inventory[itemIndex];
  if (isEquippedByState(state, item)) {
    if (callbacks.log) callbacks.log('Desequipe o item antes de vendê-lo!', 'system');
    return false;
  }

  const selectedSet = getSelectedSet(state);
  if (selectedSet.has(item.uid)) {
    if (callbacks.log) callbacks.log('Item bloqueado 🔒! Desbloqueie-o para vender.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id];
  const sellUnitVal = getSellValue(item);
  const sellCount = Math.min(item.count || 1, Math.max(1, parseInt(qty, 10) || 1));
  const totalAdena = sellUnitVal * sellCount;
  if (!Number.isSafeInteger(totalAdena) || !Number.isSafeInteger(state.gold + totalAdena)) return false;

  // Registrar na fila de Buyback
  state.buybackQueue = state.buybackQueue || [];
  state.buybackQueue.unshift({
    itemCopy: { ...item, count: sellCount },
    sellPrice: totalAdena,
    soldAt: Date.now()
  });
  if (state.buybackQueue.length > MAX_BUYBACK_ITEMS) {
    state.buybackQueue.pop();
  }

  // Deduzir ou remover do inventário
  if ((item.count || 1) > sellCount) {
    item.count -= sellCount;
  } else {
    state.inventory.splice(itemIndex, 1);
  }

  state.gold = (state.gold || 0) + totalAdena;

  if (callbacks.log) {
    callbacks.log(`💰 Vendeu ${sellCount}x ${def?.name || 'Item'} por +${totalAdena.toLocaleString()} Adena!`, 'loot');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Vende em massa todos os itens comuns (cinza) não-equipados e não-favoritados.
 * @param {Object} state
 * @param {Object} [callbacks]
 * @returns {{count: number, goldGained: number}}
 */
export function sellAllJunk(state, callbacks = {}) {
  if (!state.inventory || !Array.isArray(state.inventory)) return { count: 0, goldGained: 0 };
  if (!hasValidWallet(state, 0)) return { count: 0, goldGained: 0 };

  const selectedSet = getSelectedSet(state);
  const gData = D();
  let totalGold = 0;
  let itemsSold = 0;

  const keptItems = [];
  const buybackEntries = [];

  for (const item of state.inventory) {
    // Proteger itens equipados
    if (isEquippedByState(state, item)) {
      keptItems.push(item);
      continue;
    }
    // Proteger itens favoritados (Lock 🔒)
    if (selectedSet.has(item.uid)) {
      keptItems.push(item);
      continue;
    }

    const rarity = item.rarity || 'common';
    // Apenas itens comuns (cinza) ou não-raros
    if (rarity !== 'common') {
      keptItems.push(item);
      continue;
    }

    const def = gData?.ALL_ITEMS?.[item.itemId || item.id];
    // Não vender consumíveis de poções/soulshots essenciais no junk sell
    if (def?.slot === 'potion' || def?.slot === 'consumable' || def?.slot === 'spellbook') {
      keptItems.push(item);
      continue;
    }

    const sellUnitVal = getSellValue(item);
    const count = item.count || 1;
    const itemGold = sellUnitVal * count;

    totalGold += itemGold;
    itemsSold += count;

    // Registra no buyback
    buybackEntries.push({
      itemCopy: { ...item },
      sellPrice: itemGold,
      soldAt: Date.now()
    });
  }

  if (!Number.isSafeInteger(totalGold) || !Number.isSafeInteger(state.gold + totalGold)) {
    return { count: 0, goldGained: 0 };
  }

  state.buybackQueue = [...buybackEntries.reverse(), ...(state.buybackQueue || [])].slice(0, MAX_BUYBACK_ITEMS);

  state.inventory = keptItems;
  state.gold = (state.gold || 0) + totalGold;

  if (itemsSold > 0) {
    if (callbacks.log) {
      callbacks.log(`🧹 Limpeza de Mochila: Vendeu ${itemsSold}x itens comuns por +${totalGold.toLocaleString()} Adena!`, 'loot');
    }
  } else {
    if (callbacks.log) {
      callbacks.log('Nenhum item comum disponível para venda em massa.', 'system');
    }
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save(true, true);
  return { count: itemsSold, goldGained: totalGold };
}

/**
 * Recompra um item vendido anteriormente pelo mesmo preço de venda.
 * @param {Object} state
 * @param {number} buybackIndex
 * @param {Object} [callbacks]
 * @returns {boolean}
 */
export function buybackItem(state, buybackIndex, callbacks = {}) {
  const buybackQueue = Array.isArray(state.buybackQueue) ? state.buybackQueue : [];
  if (buybackIndex < 0 || buybackIndex >= buybackQueue.length) return false;

  const entry = buybackQueue[buybackIndex];
  if (!entry || !entry.itemCopy) return false;

  const inventory = Array.isArray(state.inventory) ? state.inventory : [];
  const restoredItem = { ...entry.itemCopy };
  const matchingStack = inventory.find(item =>
    item.uid === restoredItem.uid && (item.itemId || item.id) === (restoredItem.itemId || restoredItem.id)
  );
  if (!matchingStack && inventory.length >= getMaxInventorySlots(state)) {
    if (callbacks.log) callbacks.log('Mochila cheia! Libere um espaço antes de recomprar.', 'system');
    return false;
  }

  if (!hasValidWallet(state, entry.sellPrice)) return false;
  if (state.gold < entry.sellPrice) {
    if (callbacks.log) callbacks.log(`Ouro insuficiente para recompra! Requer ${entry.sellPrice.toLocaleString()} Adena.`, 'system');
    return false;
  }

  state.inventory = inventory;
  state.buybackQueue = buybackQueue;
  // Tenta adicionar ao inventário
  if (matchingStack) {
    matchingStack.count = (Number(matchingStack.count) || 1) + (Number(restoredItem.count) || 1);
  } else {
    restoredItem.uid = makeUniqueInventoryUid(state, restoredItem.uid);
    state.inventory.push(restoredItem);
  }
  state.gold -= entry.sellPrice;

  buybackQueue.splice(buybackIndex, 1);

  if (callbacks.log) {
    callbacks.log(`↩️ Recomprou item por ${entry.sellPrice.toLocaleString()} Adena!`, 'loot');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Reroll manual do estoque do Mercador Místico pagando taxa de Adena.
 * @param {Object} state
 * @param {Function} rollStockFn
 * @param {Object} [callbacks]
 * @returns {boolean}
 */
export function rerollMysticStock(state, rollStockFn, callbacks = {}) {
  if (!hasValidWallet(state, MYSTIC_REROLL_COST) || typeof rollStockFn !== 'function') return false;
  if (state.gold < MYSTIC_REROLL_COST) {
    if (callbacks.log) callbacks.log(`Requer 💰 ${MYSTIC_REROLL_COST.toLocaleString()} Adena para invocar novos itens ancestrais!`, 'system');
    return false;
  }

  const nextStock = rollStockFn();
  if (!Array.isArray(nextStock) || nextStock.length !== 6) return false;

  state.gold -= MYSTIC_REROLL_COST;
  state.mysticShopLastReset = Date.now();
  state.mysticShopInventory = nextStock;

  if (callbacks.log) {
    callbacks.log(`🔮 O Mercador Místico revelou um novo lote de relíquias ancestrais! (-${MYSTIC_REROLL_COST.toLocaleString()}g)`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save(true, true);
  return true;
}

/**
 * Gera um lote de itens para o estoque do Mercador Místico.
 * @returns {Array<Object>}
 */
export function rollMysticStock(stateOrLevel) {
  const gData = D();
  const level = typeof stateOrLevel === 'number' ? stateOrLevel : (stateOrLevel?.level || 1);
  const rarities = ['rare', 'epic', 'legendary'];

  // Season Gating Canônico para o Estoque Místico:
  // Season 1 (Lv 1-40): No-Grade, D-Grade, C-Grade
  // Season 2 (Lv 41-80): B-Grade (52+), A-Grade (62+), S-Grade (76+)
  // Season 3 (Lv 81+): S80, S84, Top
  let allowedMaxGrade = 'c';
  if (level >= 81) allowedMaxGrade = 's84';
  else if (level >= 76) allowedMaxGrade = 's';
  else if (level >= 62) allowedMaxGrade = 'a';
  else if (level >= 52) allowedMaxGrade = 'b';
  else if (level >= 40) allowedMaxGrade = 'c';
  else if (level >= 20) allowedMaxGrade = 'd';
  else allowedMaxGrade = 'ng';

  const GRADE_ORDER = { ng: 0, d: 1, c: 2, b: 3, a: 4, s: 5, s80: 6, s84: 7 };
  const maxGradeIdx = GRADE_ORDER[allowedMaxGrade] ?? 2;

  const baseConsumables = ['scroll_of_enchant_weapon_', 'scroll_of_enchant_armor', 'scroll_of_resurrection', 'teleport_scroll'];
  const pool = gData?.MYSTIC_POOL || ["weapon_anais_first", "weapon_anakim_pistols", "jewel_ring_core"];

  const filteredPool = pool.filter(id => {
    const itDef = gData?.ALL_ITEMS?.[id];
    if (!itDef) return false;
    const itGrade = String(itDef.grade || 'ng').toLowerCase();
    const gIdx = GRADE_ORDER[itGrade] ?? 0;
    return gIdx <= maxGradeIdx;
  });

  const candidateIds = [...new Set([
    ...filteredPool,
    ...baseConsumables.filter(id => Boolean(gData?.ALL_ITEMS?.[id]))
  ])];
  if (candidateIds.length === 0) return [];
  const stock = [];
  const selectedIds = new Set();
  let attempts = 0;
  const uniqueOfferCount = Math.min(6, candidateIds.length);
  while (selectedIds.size < uniqueOfferCount) {
    const randomId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
    attempts += 1;
    if (selectedIds.has(randomId)) {
      if (attempts < candidateIds.length * 3) continue;
      const fallbackId = candidateIds.find(id => !selectedIds.has(id));
      if (!fallbackId) break;
      selectedIds.add(fallbackId);
    } else {
      selectedIds.add(randomId);
    }
  }
  const selected = [...selectedIds];
  while (selected.length < 6) selected.push(candidateIds[Math.floor(Math.random() * candidateIds.length)]);
  for (const randomId of selected) {
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    stock.push({ id: randomId, itemId: randomId, rarity, amount: 1 });
  }
  return stock;
}

/**
 * Calcula a quantidade máxima de um item que o jogador pode comprar.
 * @param {Object} state
 * @param {string} itemId
 * @returns {number}
 */
export function calculateMaxAffordableQty(state, itemId) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def || !def.price) return 1;

  const gold = state.gold || 0;
  const maxPossible = Math.floor(gold / def.price);
  return Math.max(1, maxPossible);
}
