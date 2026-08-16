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
  if (!recipeId) return null;
  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  let recipesData = gData?.CRAFTING_RECIPES;
  if (!recipesData && gData?.generateAllCraftingRecipes) {
    recipesData = gData.generateAllCraftingRecipes(allItems);
  }
  if (!recipesData) return null;

  const raw = String(recipeId);
  const altKeys = [
    raw,
    'weapon_' + raw,
    'armor_' + raw,
    'jewel_' + raw,
    raw.replace(/^(weapon_|armor_|jewel_|shield_|wepoan_)/, '')
  ];

  if (Array.isArray(recipesData)) {
    const found = recipesData.find(r => altKeys.includes(r.id) || altKeys.includes(r.itemId));
    if (found) return found;
  }

  if (typeof recipesData === 'object') {
    for (const k of altKeys) {
      if (recipesData[k]) return recipesData[k];
    }
    const found = Object.values(recipesData).find(r => altKeys.includes(r.id) || altKeys.includes(r.itemId));
    if (found) return found;
  }

  return null;
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
export function canCraft(state, recipeId, qty = 1) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe) return false;

  const currentCraftLvl = state.craftLevel || state.level || state.player?.level || 1;
  const reqLvl = recipe.craftLevel || (recipe.level ? getCraftLevelReq(recipe.level) : 1);
  if (reqLvl > currentCraftLvl) return false;

  const count = Math.max(1, parseInt(qty, 10) || 1);
  const totalGold = (recipe.gold || 250) * count;
  if ((state.gold || 0) < totalGold) return false;

  const mats = getRecipeMaterials(recipe);
  if (mats.length === 0) return false;
  for (const { matId, qty: baseQty } of mats) {
    if (getInventoryCount(state, matId) < (baseQty * count)) return false;
  }
  return true;
}

export function canCraftRecipe(state, id, qty = 1) {
  return canCraft(state, id, qty);
}

export function craftSingleItem(state, recipeId, callbacks = {}) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe) return false;

  const costGold = recipe.gold || 250;
  if ((state.gold || 0) < costGold) return false;
  state.gold -= costGold;

  const mats = getRecipeMaterials(recipe);
  for (const { matId, qty } of mats) {
    let remaining = qty;
    for (let i = state.inventory.length - 1; i >= 0 && remaining > 0; i--) {
      const it = state.inventory[i];
      if (it.itemId === matId && !it.equipped) {
        const take = Math.min(it.count || 1, remaining);
        if ((it.count || 1) > take) {
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

  const itemDef = callbacks.getItemDef ? callbacks.getItemDef(recipeId) : gData?.ALL_ITEMS?.[recipeId];
  const isConsumable = itemDef && ['potion', 'consumable', 'scroll', 'soulshot', 'spiritshot'].includes(itemDef.slot);
  const yieldAmount = (isConsumable && (recipeId.includes('shot') || recipeId.includes('potion'))) ? 50 : 1;

  addToInventory(state, recipeId, yieldAmount, rarity, isFoundation, callbacks, true);

  const formattedName = callbacks.formatItemDisplayName
    ? callbacks.formatItemDisplayName({ itemId: recipeId, rarity, foundation: isFoundation }, itemDef)
    : (itemDef?.name || recipeId);

  if (isFoundation) {
    if (callbacks.log) callbacks.log(`✨ FOUNDATION! Você forjou ${yieldAmount}x ${formattedName}!`, 'rarity-foundation');
    if (callbacks.floatText) callbacks.floatText('✨ FOUNDATION!', 'float-jackpot');
  } else {
    if (callbacks.log) callbacks.log(`Forjou ${yieldAmount}x ${formattedName}!`, 'rarity-' + rarity);
  }

  state.craftXp = (state.craftXp || 0) + 10 + (itemDef?.tier || 1) * 5;
  state.craftLevel = state.craftLevel || 1;

  const nextReq = state.craftLevel * 100;
  if (state.craftXp >= nextReq) {
    state.craftLevel += 1;
    state.craftXp -= nextReq;
    if (callbacks.log) callbacks.log(`🎉 PARABÉNS! Nível de Forja subiu para Lv.${state.craftLevel}!`, 'rarity-epic');
  }

  return true;
}

export function craftItem(state, recipeId, qty = 1, callbacks = {}) {
  const countToCraft = Math.max(1, parseInt(qty, 10) || 1);
  let successCount = 0;

  for (let i = 0; i < countToCraft; i++) {
    if (!canCraft(state, recipeId, 1)) break;
    const ok = craftSingleItem(state, recipeId, callbacks);
    if (ok) successCount++;
  }

  if (successCount > 0) {
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
  }

  return successCount > 0;
}

/**
 * Validação de Barreira de Forja da Conta (Anti-Bot & Gatekeeper de Mercado).
 * @param {Object} state
 * @param {number} requiredForgeLevel
 * @returns {{ allowed: boolean, error?: string }}
 */
export function checkAccountForgeLevel(state, requiredForgeLevel = 10) {
  const currentForgeLevel = state.accountForgeLevel || state.craftLevel || 1;
  if (currentForgeLevel < requiredForgeLevel) {
    return {
      allowed: false,
      error: `Barreira de Forja: Nível de Forja da Conta Lv.${requiredForgeLevel} necessário (Atual: Lv.${currentForgeLevel}). Destrua itens na forja para avançar.`
    };
  }
  return { allowed: true };
}

/**
 * Item Sink Massivo: Destrói permanentemente lotes de itens de baixo nível para forjar relíquias supremas.
 * @param {Object} state
 * @param {string} targetItemId
 * @param {Array<{itemId: string, count: number}>} sacrificeList
 * @param {Object} callbacks
 * @returns {{ success: boolean, message: string }}
 */
export function executeMassiveItemSink(state, targetItemId, sacrificeList = [], callbacks = {}) {
  // Valida Nível de Forja (Lv. 10+ para forjas massivas)
  const check = checkAccountForgeLevel(state, 10);
  if (!check.allowed) {
    return { success: false, message: check.error };
  }

  const inv = state.inventory || [];
  let totalDestroyed = 0;

  // 1. Validação de Estoque
  for (const req of sacrificeList) {
    const item = inv.find(i => (i.id === req.itemId || i.itemId === req.itemId));
    const available = item ? (item.count || item.quantity || 1) : 0;
    if (available < req.count) {
      return { success: false, message: `Quantidade insuficiente de ${req.itemId} (Requer: ${req.count}, Disponível: ${available}).` };
    }
  }

  // 2. Destruição Atômica de Itens (Item Sink)
  for (const req of sacrificeList) {
    const itemIndex = inv.findIndex(i => (i.id === req.itemId || i.itemId === req.itemId));
    if (itemIndex !== -1) {
      const item = inv[itemIndex];
      const cur = item.count || item.quantity || 1;
      if (cur > req.count) {
        if (item.count) item.count -= req.count;
        if (item.quantity) item.quantity -= req.count;
      } else {
        inv.splice(itemIndex, 1);
      }
      totalDestroyed += req.count;
    }
  }

  // 3. Criação do Item Forjado
  const added = addToInventory(state, targetItemId, 1);
  if (!added) {
    state.inventory.push({
      uid: 'forge_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      id: targetItemId,
      itemId: targetItemId,
      name: targetItemId,
      count: 1,
      quantity: 1,
      rarity: 'sovereign',
      isEquipped: false
    });
  }

  // 4. Progressão de Nível de Forja da Conta
  const expGained = totalDestroyed * 10;
  state.accountForgeExp = (state.accountForgeExp || 0) + expGained;
  state.accountForgeLevel = state.accountForgeLevel || state.craftLevel || 1;

  while (state.accountForgeExp >= state.accountForgeLevel * 250) {
    state.accountForgeExp -= state.accountForgeLevel * 250;
    state.accountForgeLevel += 1;
    if (callbacks.log) callbacks.log(`🎉 NÍVEL DE FORJA DA CONTA EVOLUIU PARA Lv.${state.accountForgeLevel}!`, 'rarity-legendary');
  }

  if (callbacks.log) {
    callbacks.log(`🔥 ITEM SINK MASSIVO: ${totalDestroyed}x itens foram destruídos na forja sagrada! Criado: [${targetItemId}]!`, 'rarity-sovereign');
  }
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();

  return { success: true, message: `Forja concluída com sucesso! +${expGained} EXP de Forja obtidos.` };
}

