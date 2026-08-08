/**
 * ShopService.js — Gestão de Loja Regular e Compras Místicas do Lineage Idle.
 *
 * Responsável pelas compras de itens na loja convencional e compras de gear místico com ouro.
 */

import { D } from '../core/GameConfig.js';
import { addToInventory } from './InventoryService.js';

/**
 * Realiza a compra de um item regular da loja.
 * @param {Object} state
 * @param {string} itemId
 * @param {number} [qty=1]
 * @param {Object} [callbacks] — { log, updateAllUI, save, classSatisfies }
 */
export function buyItem(state, itemId, qty = 1, rarity = 'common', callbacks = {}) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def) return;

  const basePrice = def.price || 100;
  const cost = basePrice * qty;

  if (state.gold < cost) {
    if (callbacks.log) callbacks.log('Ouro insuficiente para realizar a compra!', 'system');
    return;
  }
  const reqLvl = def.req?.level || def.reqLvl || 1;
  if (reqLvl > state.level) {
    if (callbacks.log) callbacks.log('Nível insuficiente para comprar este item.', 'system');
    return;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    if (callbacks.log) callbacks.log('Sua classe não pode utilizar este item.', 'system');
    return;
  }

  if (!addToInventory(state, itemId, qty, rarity, false, callbacks)) return;

  state.gold -= cost;
  if (callbacks.log) callbacks.log(`🎁 Comprou ${qty}x ${def.name} por 💰 ${cost.toLocaleString()} Gold!`, 'loot');

  if (callbacks.updateAllUI) callbacks.updateAllUI(state);
  if (callbacks.save) callbacks.save();
}

/**
 * Realiza a compra mística de um item com raridade sorteada.
 * @param {Object} state
 * @param {string} itemId
 * @param {string} rarity
 * @param {Object} [callbacks]
 */
export function buyMysticItem(state, itemId, rarity, callbacks = {}) {
  const gData = D();
  const def = gData?.ALL_ITEMS?.[itemId];
  if (!def) return;

  const rarityMult = gData?.RARITY?.[rarity]?.mult || 1;
  const price = Math.floor((def.price || 500) * rarityMult * 2);

  if (state.gold < price) {
    if (callbacks.log) callbacks.log('Not enough gold!', 'system');
    return;
  }
  if (def.req && def.req.level > state.level) {
    if (callbacks.log) callbacks.log('Level too low.', 'system');
    return;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    if (callbacks.log) callbacks.log('Wrong class for this item.', 'system');
    return;
  }

  if (!addToInventory(state, itemId, 1, rarity, false, callbacks)) return;

  state.gold -= price;
  const rarityName = gData?.RARITY?.[rarity]?.name || rarity;
  if (callbacks.log) callbacks.log(`Mystic purchase: ${def.name} [${rarityName}] for ${price.toLocaleString()}g`, 'rarity-' + rarity);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
