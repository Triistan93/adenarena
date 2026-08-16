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
import { addToInventory, removeFromInventory, getSelectedSet } from './InventoryService.js';

const MAX_BUYBACK_ITEMS = 10;
const MYSTIC_REROLL_COST = 50000;

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

  if ((state.gold || 0) < cost) {
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
  if (callbacks.save) callbacks.save();
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

  if ((state.gold || 0) < price) {
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
  if (callbacks.save) callbacks.save();
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

  const itemIndex = state.inventory.findIndex(i => i.uid === uid || i.id === uid);
  if (itemIndex === -1) return false;

  const item = state.inventory[itemIndex];
  if (item.equipped) {
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
  const basePrice = def?.price || 100;
  const sellUnitVal = Math.max(1, Math.floor(basePrice * 0.5));
  const sellCount = Math.min(item.count || 1, Math.max(1, parseInt(qty, 10) || 1));
  const totalAdena = sellUnitVal * sellCount;

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
  if (callbacks.save) callbacks.save();
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

  const selectedSet = getSelectedSet(state);
  const gData = D();
  let totalGold = 0;
  let itemsSold = 0;

  const keptItems = [];
  state.buybackQueue = state.buybackQueue || [];

  for (const item of state.inventory) {
    // Proteger itens equipados
    if (item.equipped) {
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

    const basePrice = def?.price || 100;
    const sellUnitVal = Math.max(1, Math.floor(basePrice * 0.5));
    const count = item.count || 1;
    const itemGold = sellUnitVal * count;

    totalGold += itemGold;
    itemsSold += count;

    // Registra no buyback
    state.buybackQueue.unshift({
      itemCopy: { ...item },
      sellPrice: itemGold,
      soldAt: Date.now()
    });
  }

  while (state.buybackQueue.length > MAX_BUYBACK_ITEMS) {
    state.buybackQueue.pop();
  }

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
  if (callbacks.save) callbacks.save();
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
  state.buybackQueue = state.buybackQueue || [];
  if (buybackIndex < 0 || buybackIndex >= state.buybackQueue.length) return false;

  const entry = state.buybackQueue[buybackIndex];
  if (!entry || !entry.itemCopy) return false;

  if ((state.gold || 0) < entry.sellPrice) {
    if (callbacks.log) callbacks.log(`Ouro insuficiente para recompra! Requer ${entry.sellPrice.toLocaleString()} Adena.`, 'system');
    return false;
  }

  // Tenta adicionar ao inventário
  state.inventory = state.inventory || [];
  state.inventory.push(entry.itemCopy);
  state.gold -= entry.sellPrice;

  state.buybackQueue.splice(buybackIndex, 1);

  if (callbacks.log) {
    callbacks.log(`↩️ Recomprou item por ${entry.sellPrice.toLocaleString()} Adena!`, 'loot');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save();
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
  if ((state.gold || 0) < MYSTIC_REROLL_COST) {
    if (callbacks.log) callbacks.log(`Requer 💰 ${MYSTIC_REROLL_COST.toLocaleString()} Adena para invocar novos itens ancestrais!`, 'system');
    return false;
  }

  state.gold -= MYSTIC_REROLL_COST;
  state.mysticShopLastReset = Date.now();
  if (typeof rollStockFn === 'function') {
    state.mysticShopInventory = rollStockFn();
  }

  if (callbacks.log) {
    callbacks.log(`🔮 O Mercador Místico revelou um novo lote de relíquias ancestrais! (-${MYSTIC_REROLL_COST.toLocaleString()}g)`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save();
  return true;
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
