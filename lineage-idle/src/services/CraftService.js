/**
 * CraftService.js — Motor de Criação, Forja e Roleta de Crafting do Lineage Idle.
 *
 * Responsável por verificação de materiais, execução de craft de receitas regulares/especiais
 * e controle do sistema de Random Craft (Roleta Mística de Aden).
 */

import { D } from '../core/GameConfig.js';
import { addToInventory, getInventoryCount } from './InventoryService.js';

/**
 * Retorna o nível de personagem necessário para cada nível de receita de craft.
 * @param {number} recipeLevel
 * @returns {number}
 */
export function getCraftLevelReq(recipeLevel) {
  return Math.max(1, Math.floor(recipeLevel / 10) + 1);
}

/**
 * Retorna a definição da receita de craft pelo ID.
 * @param {string} recipeId
 * @returns {Object|null}
 */
export function getRecipeDef(recipeId) {
  const recipesData = D()?.CRAFTING_RECIPES;
  if (!recipesData) return null;
  if (Array.isArray(recipesData)) {
    return recipesData.find(r => r.id === recipeId || r.itemId === recipeId) || null;
  }
  return recipesData[recipeId] || null;
}

/**
 * Retorna a lista normalizada de materiais necessários para uma receita.
 * @param {Object} recipe
 * @returns {Array<{matId: string, qty: number}>}
 */
export function getRecipeMaterials(recipe) {
  if (!recipe) return [];
  if (Array.isArray(recipe.materials)) {
    return recipe.materials.map(r => ({ matId: r.itemId || r.id, qty: r.count || r.qty || 1 }));
  }
  if (Array.isArray(recipe.reqs)) {
    return recipe.reqs.map(r => ({ matId: r.id || r.itemId, qty: r.count || r.qty || 1 }));
  }
  if (recipe.materials && typeof recipe.materials === 'object') {
    return Object.entries(recipe.materials).map(([matId, qty]) => ({ matId, qty: Number(qty) || 1 }));
  }
  if (recipe.reqs && typeof recipe.reqs === 'object') {
    return Object.entries(recipe.reqs).map(([matId, qty]) => ({ matId, qty: Number(qty) || 1 }));
  }
  return [];
}

/**
 * Verifica se o jogador tem os materiais e nível de craft necessários para criar a receita.
 * @param {Object} state
 * @param {string} recipeId
 * @returns {boolean}
 */
export function canCraft(state, recipeId) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe) return false;
  if (recipe.level && getCraftLevelReq(recipe.level) > (state.craftLevel || 1)) return false;

  const mats = getRecipeMaterials(recipe);
  if (mats.length === 0) return false;
  for (const { matId, qty } of mats) {
    if (getInventoryCount(state, matId) < qty) return false;
  }
  return true;
}

export function canCraftRecipe(state, id) {
  return canCraft(state, id);
}

/**
 * Executa a criação de um item via receita de Crafting.
 * @param {Object} state
 * @param {string} recipeId
 * @param {Object} [callbacks] — { log, floatText, getItemDef, formatItemDisplayName, updateAllUI, save }
 * @returns {boolean}
 */
export function craftItem(state, recipeId, callbacks = {}) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe || !canCraft(state, recipeId)) {
    if (callbacks.log) callbacks.log('Missing materials or craft level too low.', 'system');
    return false;
  }

  const mats = getRecipeMaterials(recipe);
  for (const { matId, qty } of mats) {
    let remaining = qty;
    for (let i = state.inventory.length - 1; i >= 0 && remaining > 0; i--) {
      const it = state.inventory[i];
      if (it.itemId === matId && !it.equipped && !it.rarity) {
        const take = Math.min(it.count || 1, remaining);
        if (it.count > take) {
          it.count -= take;
          remaining = 0;
        } else {
          state.inventory.splice(i, 1);
          remaining -= take;
        }
      }
    }
  }

  const gData = D();
  const rarityBoost = state.race === 'dwarf' ? 1 : 0;
  const rarity = gData?.rollRarity ? gData.rollRarity(rarityBoost) : 'common';

  const pityBonus = (state.craftFoundationPity || 0) * 0.001;
  const foundationChance = 0.05 + pityBonus;
  const isFoundation = Math.random() < foundationChance;

  if (isFoundation) {
    state.craftFoundationPity = 0;
  } else {
    state.craftFoundationPity = (state.craftFoundationPity || 0) + 1;
  }

  addToInventory(state, recipeId, 1, rarity, isFoundation, callbacks);

  const itemDef = callbacks.getItemDef ? callbacks.getItemDef(recipeId) : gData?.ALL_ITEMS?.[recipeId];
  const formattedName = callbacks.formatItemDisplayName
    ? callbacks.formatItemDisplayName({ itemId: recipeId, rarity, foundation: isFoundation }, itemDef)
    : (itemDef?.name || recipeId);

  if (isFoundation) {
    if (callbacks.log) callbacks.log(`✨ FOUNDATION! Você forjou um ${formattedName}!`, 'rarity-foundation');
    if (callbacks.floatText) callbacks.floatText('✨ FOUNDATION!', 'float-jackpot');
  } else {
    if (callbacks.log) callbacks.log(`Crafted ${formattedName}!`, 'rarity-' + rarity);
  }

  state.craftXp = (state.craftXp || 0) + 10 + (itemDef?.tier || 1) * 5;
  state.craftLevel = state.craftLevel || 1;
  while (state.craftXp >= state.craftLevel * 50) {
    state.craftXp -= state.craftLevel * 50;
    state.craftLevel++;
    if (callbacks.log) callbacks.log(`Crafting Level Up! Now Lv.${state.craftLevel}`, 'xp');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}
