/**
 * economyBalance.js — Constantes e Funções Canônicas de Economia.
 *
 * Autoridade única de dados para taxas de venda, custos de reroll e regras monetárias.
 */

import { D } from '../../core/GameConfig.js';

export const SELL_RATIO = 0.50;
export const MYSTIC_REROLL_COST = 50000;
export const MAX_BUYBACK_ITEMS = 10;
export const MAX_INVENTORY_SLOTS_DEFAULT = 150;
export const MAX_INVENTORY_SLOTS_DWARF = 250;
export const MAX_WAREHOUSE_SLOTS_DEFAULT = 100;

/**
 * Retorna o valor de venda unitário canônico de um item (50% do valor do item, incluindo raridade e encantamento).
 * Fonte única de verdade para precificação de venda em todo o projeto.
 * @param {Object} item
 * @returns {number}
 */
export function getSellValue(item) {
  if (!item) return 0;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const rawPrice = (def.price !== undefined) ? def.price : ((def.gold !== undefined) ? def.gold : def.cost);
  const basePrice = Number(rawPrice) || 10;
  const mult = item.rarity ? (gData?.RARITY?.[item.rarity]?.mult || 1) : 1;
  const enchant = Number(item.enchant) || 0;
  const enchantMult = 1 + enchant * 0.1;
  return Math.max(1, Math.floor(basePrice * mult * enchantMult * SELL_RATIO));
}
