/**
 * CraftService.js — Motor de Criação, Metalurgia Imperial e Aprimoramento do Lineage Idle.
 *
 * Módulos Integrados e Balanceados:
 * 1. Forja Universal com Craft em Lote e Cálculo "Máx" O(1).
 * 2. Critical Craft (Double Craft e Foundation / Masterwork).
 * 3. Localizador de Fontes de Drop (Drop & Spoil Locator).
 * 4. Soul Crystals (Níveis clássicos 1 a 13, absorção por monstros e progressão de chefes).
 * 5. Ferreiro Pushkin (Mestre Armeiro: Unseal, Masterwork e Troca de Armas de Mesmo Grau).
 * 6. Symbol Maker (Dyes & Tatuagens Sagradas em Estágios 1 a 5).
 * 7. Atributos Elementais (Consumo Real de Pedras, Roda de Oposição e Drop Sources).
 * 8. Síntese de Cintos (Compound de Duplicatas com 30% de Sucesso e Rolagem de Stats).
 * 9. Augmentation com Life Stones Transparentes.
 * 10. Random Craft Balanceado (Reciclagem Real de Itens e Pools Proporcionais).
 */

import { D } from '../core/GameConfig.js';
import { getItemGradeCode } from '../data/items/item_grade.js';
import { addToInventory, getInventoryCount, getSelectedSet, removeFromInventoryByItemId } from './InventoryService.js';
import {
  RANDOM_CRAFT_POINTS_PER_CHARGE,
  RANDOM_CRAFT_REROLL_COST,
  RANDOM_CRAFT_ADENA_CHARGE_COST,
  RANDOM_CRAFT_ADENA_CHARGE_POINTS,
  RECYCLE_POINTS_BY_TIER,
  rollCanonicalRandomCraftSlots
} from '../data/economy/randomCraftBalance.js';
import { CRAFTING_RECIPES } from '../data/items/recipes_drops.js';
import { applyElementalInfusion, applySoulCrystalToWeapon } from './ElementalService.js';

function canAffordAdena(state, cost) {
  return Number.isSafeInteger(state?.gold) && state.gold >= 0
    && Number.isSafeInteger(cost) && cost >= 0 && state.gold >= cost;
}

/**
 * Retorna o nível de personagem necessário para cada nível de receita de craft.
 * @param {number} recipeLevel
 * @returns {number}
 */
export function getCraftLevelReq(recipeLevel) {
  return Math.max(1, Math.floor(recipeLevel / 10) + 1);
}

export function getRecipeForgeLevelRequirement(recipe) {
  if (!recipe) return 1;
  const explicitLevel = Number(recipe.craftLevel);
  if (Number.isSafeInteger(explicitLevel) && explicitLevel > 0) return explicitLevel;
  const recipeLevel = Number(recipe.level);
  return Number.isFinite(recipeLevel) && recipeLevel > 0 ? getCraftLevelReq(recipeLevel) : 1;
}

function getPlayerForgeLevel(state) {
  const level = Number(state?.accountForgeLevel ?? state?.craftLevel ?? 1);
  return Number.isSafeInteger(level) && level > 0 ? level : 1;
}

function getRecipePlayerLevelRequirement(recipe) {
  const level = Number(recipe?.minPlayerLevel);
  return Number.isSafeInteger(level) && level > 0 ? level : 1;
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
  let recipesData = gData?.CRAFTING_RECIPES || CRAFTING_RECIPES;
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
    return recipe.materials.map(r => ({ matId: r.matId || r.itemId || r.id, qty: r.qty || r.count || 1 }));
  }
  if (Array.isArray(recipe.reqs)) {
    return recipe.reqs.map(r => ({ matId: r.matId || r.id || r.itemId, qty: r.qty || r.count || 1 }));
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
 * Calcula a quantidade máxima de repetições possíveis de uma receita com os materiais atuais.
 * @param {Object} state
 * @param {string|Object} recipeOrId
 * @returns {number}
 */
export function calculateMaxCraftableQty(state, recipeOrId) {
  const recipe = (typeof recipeOrId === 'object' && recipeOrId !== null) ? recipeOrId : getRecipeDef(recipeOrId);
  if (!recipe) return 0;
  if (!Number.isSafeInteger(state?.gold) || state.gold < 0) return 0;

  const costGold = recipe.gold || 250;
  if (!Number.isSafeInteger(costGold) || costGold < 0) return 0;
  let maxByGold = costGold > 0 ? Math.floor((state.gold || 0) / costGold) : 999999;
  if (maxByGold <= 0) return 0;

  const mats = getRecipeMaterials(recipe);
  if (mats.length === 0) return maxByGold;

  let maxByMats = 999999;
  for (const { matId, qty } of mats) {
    if (!qty || qty <= 0) continue;
    const count = getInventoryCount(state, matId);
    const possible = Math.floor(count / qty);
    if (possible < maxByMats) {
      maxByMats = possible;
    }
  }

  return Math.max(0, Math.min(maxByGold, maxByMats));
}

/**
 * Verifica se o jogador pode criar a quantidade informada da receita.
 * @param {Object} state
 * @param {string} recipeId
 * @param {number} [qty=1]
 * @returns {boolean}
 */
export function canCraft(state, recipeId, qty = 1) {
  const count = Number(qty);
  if (!Number.isSafeInteger(count) || count <= 0) return false;
  const recipe = getRecipeDef(recipeId);
  if (!recipe
    || getPlayerForgeLevel(state) < getRecipeForgeLevelRequirement(recipe)
    || (Number(state?.level) || 1) < getRecipePlayerLevelRequirement(recipe)) return false;
  const maxPossible = calculateMaxCraftableQty(state, recipeId);
  return maxPossible >= count;
}

export function canCraftRecipe(state, id, qty = 1) {
  return canCraft(state, id, qty);
}

export function hasCraftableRecipe(state) {
  const recipesData = D()?.CRAFTING_RECIPES || CRAFTING_RECIPES;
  const recipes = Array.isArray(recipesData) ? recipesData : Object.values(recipesData || {});
  return recipes.some(recipe => {
    const recipeId = recipe?.id || recipe?.itemId;
    return Boolean(recipeId && canCraft(state, recipeId, 1));
  });
}

/**
 * Executa a criação de um item ou lote de itens com suporte a Critical Craft (Double / Foundation).
 */
export function craftItem(state, recipeId, qty = 1, callbacks = {}) {
  const recipe = getRecipeDef(recipeId);
  if (!recipe) {
    if (callbacks.log) callbacks.log('Receita de forja não encontrada.', 'system');
    return false;
  }

  const requiredForgeLevel = getRecipeForgeLevelRequirement(recipe);
  const playerForgeLevel = getPlayerForgeLevel(state);
  if (playerForgeLevel < requiredForgeLevel) {
    if (callbacks.log) callbacks.log(`🔒 Sua Forja está no nível ${playerForgeLevel}; esta receita requer nível ${requiredForgeLevel}.`, 'warning');
    return false;
  }
  const requiredPlayerLevel = getRecipePlayerLevelRequirement(recipe);
  const playerLevel = Number(state?.level) || 1;
  if (playerLevel < requiredPlayerLevel) {
    if (callbacks.log) callbacks.log(`🔒 Seu personagem está no nível ${playerLevel}; esta receita requer nível ${requiredPlayerLevel}.`, 'warning');
    return false;
  }

  const countToCraft = Number(qty);
  if (!Number.isSafeInteger(countToCraft) || countToCraft <= 0) {
    if (callbacks.log) callbacks.log('A quantidade de craft deve ser um inteiro positivo.', 'system');
    return false;
  }
  const maxPossible = calculateMaxCraftableQty(state, recipeId);
  if (maxPossible < countToCraft) {
    if (callbacks.log) callbacks.log('Materiais ou Adena insuficientes para esta quantidade.', 'system');
    return false;
  }

  const workingState = {
    ...state,
    inventory: (state.inventory || []).map(item => item && ({ ...item })),
    equipment: { ...(state.equipment || {}) }
  };
  const costGold = (recipe.gold || 250) * countToCraft;
  workingState.gold = (workingState.gold || 0) - costGold;

  const mats = getRecipeMaterials(recipe);
  for (const { matId, qty: baseQty } of mats) {
    const needed = baseQty * countToCraft;
    if (!removeFromInventoryByItemId(workingState, matId, needed)) {
      if (callbacks.log) callbacks.log('Materiais ou Adena insuficientes para esta quantidade.', 'system');
      return false;
    }
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const itemDef = allItems[recipeId] || allItems[recipe.itemId || recipe.id] || recipe;
  const isConsumable = itemDef && ['potion', 'consumable', 'scroll', 'soulshot', 'spiritshot'].includes(itemDef.slot);
  const baseYieldPerUnit = recipe.outputQty || ((isConsumable && (recipeId.includes('shot') || recipeId.includes('potion'))) ? 50 : 1);

  // Cálculo de Critical Craft (Double Craft & Foundation)
  const isDwarf = workingState.race === 'dwarf' || workingState.class === 'artisan' || workingState.class === 'warsmith';
  const forgeLvl = workingState.accountForgeLevel || workingState.craftLevel || 1;
  const allowCriticalCraft = !recipe.noCriticalCraft;
  const doubleCraftChance = allowCriticalCraft ? (isDwarf ? 0.15 : 0.05) + (forgeLvl * 0.005) : 0;
  const isDouble = Math.random() < doubleCraftChance;

  const totalYield = (baseYieldPerUnit * countToCraft) * (isDouble ? 2 : 1);

  const pityBonus = (workingState.craftFoundationPity || 0) * 0.002;
  const foundationChance = allowCriticalCraft ? 0.06 + (isDwarf ? 0.04 : 0) + pityBonus : 0;
  const isFoundation = !isConsumable && (Math.random() < foundationChance);

  if (allowCriticalCraft) {
    if (isFoundation) {
      workingState.craftFoundationPity = 0;
    } else {
      workingState.craftFoundationPity = (workingState.craftFoundationPity || 0) + countToCraft;
    }
  }

  const rarityBoost = isDwarf ? 1 : 0;
  const rolledRarity = gData?.rollRarity ? gData.rollRarity(rarityBoost) : 'common';
  const outputRarity = recipe.fixedRarity || rolledRarity;

  const targetItemId = recipe?.result || recipeId;
  if (!addToInventory(workingState, targetItemId, totalYield, outputRarity, isFoundation, callbacks, true)) {
    if (callbacks.log) callbacks.log('Mochila cheia; a forja não consumiu materiais nem Adena.', 'system');
    return false;
  }

  // Commit only after costs and output are all valid on the disposable working state.
  Object.assign(state, workingState);
  callbacks.onCraftSuccess?.(countToCraft);

  // Mensagens e Notificações de Sucesso
  const displayName = itemDef?.name || recipeId;
  if (isDouble && isFoundation) {
    if (callbacks.log) callbacks.log(`🌟 CRITICAL & FOUNDATION! Forjou ${totalYield}x ${displayName} (Em Dobro e Alma Ancestral)!`, 'rarity-legendary');
    if (callbacks.floatText) callbacks.floatText('🌟 DOUBLE & FOUNDATION!', 'float-jackpot');
  } else if (isDouble) {
    if (callbacks.log) callbacks.log(`⚡ DOUBLE CRAFT! A bigorna ressoou e concedeu ${totalYield}x ${displayName} (2x)!`, 'rarity-epic');
  } else if (isFoundation) {
    if (callbacks.log) callbacks.log(`✨ FOUNDATION! Você forjou ${totalYield}x ${displayName} com potencial Masterwork!`, 'rarity-foundation');
  } else {
    if (callbacks.log) callbacks.log(`🔨 Forjou com sucesso ${totalYield}x ${displayName}!`, 'loot');
  }

  // Progressão do Nível de Forja da Conta
  const expPerCraft = 15 + (itemDef?.tier || 1) * 10;
  const totalExpGained = expPerCraft * countToCraft;
  state.accountForgeExp = (state.accountForgeExp || 0) + totalExpGained;
  state.accountForgeLevel = state.accountForgeLevel || state.craftLevel || 1;

  while (state.accountForgeExp >= state.accountForgeLevel * 100) {
    state.accountForgeExp -= state.accountForgeLevel * 100;
    state.accountForgeLevel += 1;
    state.craftLevel = state.accountForgeLevel;
    if (callbacks.log) callbacks.log(`🎉 NÍVEL DE FORJA DA CONTA SUBIU PARA Lv.${state.accountForgeLevel}!`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Retorna as fontes de drop e monstros para um determinado material (Drop & Spoil Locator).
 */
export function getMaterialDropSources(matId) {
  const gData = D();
  const zones = gData?.ZONES || {};
  const sources = [];

  for (const [zoneKey, zone] of Object.entries(zones)) {
    if (!zone) continue;
    const hasDrop = (zone.drops && zone.drops.includes(matId)) || (zone.monsters && zone.monsters.some(m => m.drops && m.drops.includes(matId)));
    if (hasDrop) {
      sources.push({
        zoneKey,
        zoneName: zone.name || zoneKey,
        minLevel: zone.reqLvl || zone.level || 1,
        source: 'Drop / Caça Territorial'
      });
    }
  }

  if (sources.length === 0) {
    sources.push(
      { zoneKey: 'gludio', zoneName: 'Ruínas de Gludio', minLevel: 20, source: 'Monstros Comuns' },
      { zoneKey: 'dion', zoneName: 'Planícies de Dion', minLevel: 30, source: 'Spoil de Anão' },
      { zoneKey: 'giran', zoneName: 'Dragon Valley', minLevel: 45, source: 'Dungeon & Bosses' }
    );
  }

  return sources;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 2: SOUL CRYSTALS (1 a 15, DRENAGEM DE ALMAS & EPIC BOSSES)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const SA_DEFINITIONS = {
  red: {
    focus: { name: 'Focus', desc: 'Taxa de Crítico Físico', stat: 'crit', baseVal: 65 },
    critical_damage: { name: 'Critical Damage', desc: 'Dano Crítico Físico', stat: 'critDmg', baseVal: 280 },
    might: { name: 'Might', desc: 'Dano Físico P.Atk', stat: 'atkPct', baseVal: 0.15 }
  },
  green: {
    acumen: { name: 'Acumen', desc: 'Velocidade de Conjuração Mágica', stat: 'castSpd', baseVal: 0.15 },
    haste: { name: 'Haste', desc: 'Velocidade de Ataque Físico', stat: 'atkSpd', baseVal: 0.10 },
    health: { name: 'Health', desc: 'Vida Máxima (Max HP)', stat: 'hpPct', baseVal: 0.25 }
  },
  blue: {
    empower: { name: 'Empower', desc: 'Poder de Ataque Mágico (M.Atk)', stat: 'matkPct', baseVal: 0.20 },
    guidance: { name: 'Guidance', desc: 'Precisão / Acerto', stat: 'acc', baseVal: 8 },
    anger: { name: 'Anger', desc: 'Dano Físico quando HP < 50%', stat: 'anger', baseVal: 0.25 }
  }
};

const SOUL_CRYSTAL_EPIC_BOSS_IDS = new Set([
  'queen_ant', 'core', 'orfen', 'zaken', 'baium', 'frintezza', 'antharas', 'valakas'
]);

function setSoulCrystalStage(crystal, stage) {
  const itemIdColor = String(crystal.itemId || '').match(/^soul_crystal_(red|green|blue)_stage\d+$/)?.[1];
  const requestedColor = String(crystal.color || itemIdColor || 'red').toLowerCase();
  const color = ['red', 'green', 'blue'].includes(requestedColor) ? requestedColor : 'red';
  crystal.isSoulCrystal = true;
  crystal.color = color;
  crystal.stage = stage;
  crystal.crystalLevel = stage;
  crystal.itemId = `soul_crystal_${color}_stage${stage}`;
  crystal.name = `Soul Crystal ${color} - Estágio ${stage}${stage === 15 ? ' (Lendário)' : ''}`;
}

/**
 * Processa a absorção de almas ao derrotar um monstro ou chefe.
 * @param {Object} state
 * @param {Object} monster
 * @param {Object} callbacks
 */
export function processSoulDrainOnKill(state, monster = {}, callbacks = {}) {
  const crystal = (state.inventory || []).find(i => (i.itemId?.startsWith('soul_crystal_') || i.isSoulCrystal) && !i.equipped);
  if (!crystal) return;

  const itemStage = Number(String(crystal.itemId || '').match(/_stage(\d+)$/)?.[1]);
  const currentLevel = Number(crystal.stage || crystal.crystalLevel || itemStage || 1);
  const monsterId = String(monster.id || monster.key || '').toLowerCase();
  const canonicalMonsterId = monsterId.replace(/_world$/, '');
  const isEpicBoss = monster.isEpicBoss === true || SOUL_CRYSTAL_EPIC_BOSS_IDS.has(monsterId) || SOUL_CRYSTAL_EPIC_BOSS_IDS.has(canonicalMonsterId);
  const isRaidBoss = Boolean(monster.isBoss || monster.boss || monster.isRaid || monster.raid || isEpicBoss);
  const isElite = Boolean(monster.isElite || monster.elite);

  // Conteúdo clássico chega ao estágio 13; Aden Arena acrescenta o desafio final 14 -> 15.
  if (currentLevel === 14) {
    if (isEpicBoss && Math.random() < 0.50) {
      setSoulCrystalStage(crystal, 15);
      if (callbacks.log) callbacks.log(`🌟 RESSONÂNCIA ÉPICA! A alma de ${monster.name || 'Epic Boss'} elevou o Soul Crystal ao Nível 15 (MÁXIMO)!`, 'rarity-sovereign');
      if (callbacks.floatText) callbacks.floatText('🌟 SOUL CRYSTAL STAGE 15!', 'float-jackpot');
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
    }
    return;
  }

  if (currentLevel >= 15) return; // Estágio máximo.

  // Progressão de Níveis 1 a 10 (Monstros Comuns / Campeões)
  if (currentLevel < 10) {
    crystal.absorbedSouls = (crystal.absorbedSouls || 0) + 1;
    const reqSouls = currentLevel * 10;
    if (crystal.absorbedSouls >= reqSouls) {
      crystal.absorbedSouls = 0;
      const successChance = 0.70 - (currentLevel * 0.04);
      if (Math.random() < successChance) {
        setSoulCrystalStage(crystal, currentLevel + 1);
        crystal.soulCheckpointStage = crystal.stage;
        if (callbacks.log) callbacks.log(`🔮 SOUL UPGRADE! Soul Crystal absorveu almas e subiu para o Nível ${crystal.stage}!`, 'rarity-epic');
      } else {
        crystal.absorbedSouls = Math.floor(reqSouls / 2);
        if (callbacks.log) callbacks.log(`⚠️ Falha na absorção. O cristal manteve o estágio e preservou ${crystal.absorbedSouls}/${reqSouls} almas para a próxima tentativa.`, 'system');
      }
    }
    return;
  }

  // Progressão de Níveis 10 a 14 (elites/chefes; estágio 13 exige Epic Boss).
  if (currentLevel >= 10 && currentLevel < 14) {
    if (isRaidBoss || isElite) {
      crystal.absorbedSouls = (crystal.absorbedSouls || 0) + (isRaidBoss ? 10 : 1);
      const reqSouls = currentLevel * 20;
      const epicGateSatisfied = currentLevel !== 12 || isEpicBoss;
      if (crystal.absorbedSouls >= reqSouls && epicGateSatisfied) {
        crystal.absorbedSouls = 0;
        const successChance = 0.45;
        if (Math.random() < successChance) {
          setSoulCrystalStage(crystal, currentLevel + 1);
          crystal.soulCheckpointStage = crystal.stage;
          if (callbacks.log) callbacks.log(`🔮 SOUL UPGRADE! Soul Crystal absorveu almas de elite e subiu para o Nível ${crystal.stage}!`, 'rarity-legendary');
        } else {
          crystal.absorbedSouls = Math.floor(reqSouls / 4);
          if (callbacks.log) callbacks.log(`⚠️ A ressonância falhou. Checkpoint preservou ${crystal.absorbedSouls}/${reqSouls} almas; o cristal segue no Estágio ${currentLevel}.`, 'system');
        }
      }
    }
  }
}

/**
 * Engasta o Soul Crystal na Arma com bônus proporcional ao nível do cristal (1 a 15).
 */
export function applySoulCrystal(state, weaponUid, color = 'red', saKey = 'focus', callbacks = {}) {
  // Keep the historical CraftService API, but enforce the canonical grade,
  // character-level, matching-crystal, cost, and effect validation rules.
  return applySoulCrystalToWeapon(state, weaponUid, color, saKey, callbacks);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 3: FERREIRO PUSHKIN (UNSEAL, MASTERWORK & WEAPON SWAP)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function unsealItem(state, itemUid, callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === itemUid || i.id === itemUid);
  if (!item) return false;

  const unsealCost = 25000;
  if (!canAffordAdena(state, unsealCost)) {
    if (callbacks.log) callbacks.log(`Ferreiro Pushkin requer ${unsealCost.toLocaleString()} Adena para quebrar o selo ancestral.`, 'system');
    return false;
  }

  state.gold -= unsealCost;
  item.sealed = false;

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;

  if (callbacks.log) {
    callbacks.log(`✨ PUSHKIN: O selo de ${def.name} foi quebrado! Bônus de conjunto ativados.`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function polishMasterwork(state, itemUid, callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === itemUid || i.id === itemUid);
  if (!item || !item.foundation) {
    if (callbacks.log) callbacks.log('Apenas itens Foundation com Alma Ancestral podem ser polidos para Masterwork!', 'system');
    return false;
  }

  const mwCost = 100000;
  if (!canAffordAdena(state, mwCost)) {
    if (callbacks.log) callbacks.log(`Requer ${mwCost.toLocaleString()} Adena para o polimento Masterwork.`, 'system');
    return false;
  }

  state.gold -= mwCost;
  item.isMasterwork = true;
  item.masterworkBonus = {
    castSpdPct: 0.05,
    atkSpdPct: 0.04,
    hpBonus: 250,
    mpRegenPct: 0.08
  };

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;

  if (callbacks.log) {
    callbacks.log(`👑 MASTERWORK ATIVADO! ${def.name} tornou-se uma Obra-Prima Imperial (+5% Cast, +4% Atk Spd, +250 HP)!`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * Troca de Armas de Mesmo Grau no Ferreiro Pushkin (Blacksmith Weapon Exchange).
 */
export function swapWeaponSameGrade(state, weaponUid, targetWeaponId, callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item || item.equipped) {
    if (callbacks.log) callbacks.log('Arma não encontrada ou está equipada!', 'system');
    return false;
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const currentDef = allItems[item.itemId || item.id] || item;
  const targetDef = allItems[targetWeaponId];

  if (!targetDef || targetDef.slot !== 'weapon' || currentDef.slot !== 'weapon') {
    if (callbacks.log) callbacks.log('Arma de destino inválida.', 'system');
    return false;
  }

  if (getItemGradeCode(currentDef) !== getItemGradeCode(targetDef)) {
    if (callbacks.log) callbacks.log('A troca exige uma arma de destino do mesmo grau.', 'system');
    return false;
  }

  const swapFee = 150000;
  if (!canAffordAdena(state, swapFee)) {
    if (callbacks.log) callbacks.log(`Ferreiro Pushkin cobra ${swapFee.toLocaleString()} Adena pela troca de armas.`, 'system');
    return false;
  }

  state.gold -= swapFee;
  item.itemId = targetWeaponId;
  item.name = targetDef.name;

  if (callbacks.log) {
    callbacks.log(`🔄 TROCA CONCLUÍDA: ${currentDef.name} foi convertida em [${targetDef.name}]!`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 4: SYMBOL MAKER & TATUAGENS EM ESTÁGIOS (1 a 5)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const DYES_CATALOG = {
  dye_str_con: { key: 'dye_str_con', name: 'Dye of STR/CON', statPlus: 'str', statMinus: 'con' },
  dye_dex_con: { key: 'dye_dex_con', name: 'Dye of DEX/CON', statPlus: 'dex', statMinus: 'con' },
  dye_con_str: { key: 'dye_con_str', name: 'Dye of CON/STR', statPlus: 'con', statMinus: 'str' },
  dye_wit_men: { key: 'dye_wit_men', name: 'Dye of WIT/MEN', statPlus: 'wit', statMinus: 'men' },
  dye_int_men: { key: 'dye_int_men', name: 'Dye of INT/MEN', statPlus: 'int', statMinus: 'men' },
  dye_men_int: { key: 'dye_men_int', name: 'Dye of MEN/INT', statPlus: 'men', statMinus: 'int' }
};

export function applyDyeSymbol(state, slotIdx = 0, dyeKey = 'dye_str_con', stage = 1, callbacks = {}) {
  state.dyeSymbols = state.dyeSymbols || [null, null, null];
  if (slotIdx < 0 || slotIdx > 2) return false;

  const dye = DYES_CATALOG[dyeKey];
  if (!dye) return false;

  const validStage = Math.max(1, Math.min(5, stage));
  const plusObj = { [dye.statPlus]: validStage };
  const minusObj = { [dye.statMinus]: validStage };

  // Validar teto estrito de +5 líquido por atributo base
  const testSymbols = [...state.dyeSymbols];
  testSymbols[slotIdx] = { plus: plusObj, minus: minusObj };

  const netStats = { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
  for (const s of testSymbols) {
    if (!s) continue;
    for (const [k, v] of Object.entries(s.plus || {})) netStats[k] += v;
    for (const [k, v] of Object.entries(s.minus || {})) netStats[k] -= v;
  }

  for (const [k, v] of Object.entries(netStats)) {
    if (v > 5) {
      if (callbacks.log) callbacks.log(`Limite excedido! O saldo de ${k.toUpperCase()} não pode ultrapassar +5.`, 'system');
      return false;
    }
  }

  state.dyeSymbols[slotIdx] = {
    key: dyeKey,
    stage: validStage,
    name: `${dye.name} (Estágio ${validStage}: +${validStage} / -${validStage})`,
    plus: plusObj,
    minus: minusObj
  };

  if (callbacks.log) {
    callbacks.log(`🖊️ SÍMBOLO SAGRADO GRAVADO: Slot ${slotIdx + 1} recebeu [${dye.name} Estágio ${validStage}]!`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function upgradeDyeSymbol(state, slotIdx = 0, callbacks = {}) {
  const dyeSymbols = Array.isArray(state.dyeSymbols) ? state.dyeSymbols : [null, null, null];
  const current = dyeSymbols[slotIdx];
  if (!current) {
    if (callbacks.log) callbacks.log('Nenhum símbolo instalado neste slot.', 'system');
    return false;
  }

  if (current.stage >= 5) {
    if (callbacks.log) callbacks.log('Este símbolo já atingiu o Estágio Máximo (+5 / -5)!', 'system');
    return false;
  }

  const costs = [0, 50000, 150000, 400000, 1000000];
  const upgradeCost = costs[current.stage] || 100000;

  if (!canAffordAdena(state, upgradeCost)) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${upgradeCost.toLocaleString()} Adena para evoluir a tatuagem.`, 'system');
    return false;
  }

  state.dyeSymbols = dyeSymbols;
  state.gold -= upgradeCost;

  const successChances = [0, 0.75, 0.55, 0.40, 0.25];
  const chance = successChances[current.stage] || 0.30;
  const isSuccess = Math.random() < chance;

  if (isSuccess) {
    const nextStage = current.stage + 1;
    return applyDyeSymbol(state, slotIdx, current.key, nextStage, callbacks);
  } else {
    if (callbacks.log) callbacks.log(`💨 A infusão da tinta sagrada falhou! A tatuagem manteve o Estágio ${current.stage}.`, 'system');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return false;
  }
}

export function removeDyeSymbol(state, slotIdx = 0, callbacks = {}) {
  state.dyeSymbols = state.dyeSymbols || [null, null, null];
  if (!state.dyeSymbols[slotIdx]) return false;

  const removed = state.dyeSymbols[slotIdx];
  state.dyeSymbols[slotIdx] = null;

  if (callbacks.log) {
    callbacks.log(`🧹 Símbolo [${removed.name}] removido com sucesso do Slot ${slotIdx + 1}.`, 'system');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 5: ATRIBUTOS ELEMENTAIS (RODA DE OPOSIÇÃO & 150/300)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const ELEMENT_DEFINITIONS = {
  fire: { name: 'Fogo 🔥', opposed: 'water', stoneId: 'fire_stone', dropZone: 'Forge of the Gods (Lv.70+)' },
  water: { name: 'Água 💧', opposed: 'fire', stoneId: 'water_stone', dropZone: 'Garden of Eva (Lv.45+)' },
  wind: { name: 'Vento 🌪️', opposed: 'earth', stoneId: 'wind_stone', dropZone: 'Dragon Valley (Lv.55+)' },
  earth: { name: 'Terra 🌍', opposed: 'wind', stoneId: 'earth_stone', dropZone: 'Mithril Mines (Lv.35+)' },
  holy: { name: 'Sagrado ✨', opposed: 'dark', stoneId: 'holy_stone', dropZone: 'Monastery of Silence (Lv.75+)' },
  dark: { name: 'Trevas 🌑', opposed: 'holy', stoneId: 'dark_stone', dropZone: 'Imperial Tomb / Crypt (Lv.70+)' }
};

export function getElementalDropSources() {
  return Object.entries(ELEMENT_DEFINITIONS).map(([key, elem]) => ({
    element: key,
    name: elem.name,
    stoneId: elem.stoneId,
    dropZone: elem.dropZone
  }));
}

export function applyElementalStone(state, equipUid, element = 'fire', callbacks = {}) {
  return applyElementalInfusion(state, equipUid, element, callbacks);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 6: SÍNTESE DE CINTOS COM CÓPIAS DUPLICADAS (30% DE SUCESSO)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function compoundBeltsWithDuplicates(state, primaryUid, secondaryUid, callbacks = {}) {
  const inv = state.inventory || [];
  const primaryItem = inv.find(i => i.uid === primaryUid || i.id === primaryUid);
  const secondaryItem = inv.find(i => i.uid === secondaryUid || i.id === secondaryUid);

  if (!primaryItem || !secondaryItem || primaryItem === secondaryItem) {
    if (callbacks.log) callbacks.log('Selecione dois cintos distintos para a síntese!', 'system');
    return false;
  }

  const primaryId = primaryItem.itemId || primaryItem.id;
  const secondaryId = secondaryItem.itemId || secondaryItem.id;

  if (primaryId !== secondaryId) {
    if (callbacks.log) callbacks.log('A síntese requer 2 cintos idênticos do mesmo tipo e grau!', 'system');
    return false;
  }

  const compoundCost = 100000;
  if (!canAffordAdena(state, compoundCost)) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${compoundCost.toLocaleString()} Adena para a fusão.`, 'system');
    return false;
  }

  state.gold -= compoundCost;

  // Remove o cinto secundário do inventário
  const secIdx = inv.findIndex(i => (i.uid === secondaryUid || i.id === secondaryUid));
  if (secIdx !== -1) inv.splice(secIdx, 1);

  // 30% de chance canônica
  const isSuccess = Math.random() < 0.30;

  if (isSuccess) {
    primaryItem.enchant = (primaryItem.enchant || 0) + 1;
    primaryItem.beltBonuses = {
      hpBonusPct: 0.03 + (primaryItem.enchant * 0.01),
      pDefBonus: 15 + (primaryItem.enchant * 5),
      invSlots: 1 + Math.floor(primaryItem.enchant / 2),
      pvpDmgPct: 0.02 + (primaryItem.enchant * 0.01)
    };

    if (callbacks.log) {
      callbacks.log(`✨ SÍNTESE DE CINTO BEM SUCEDIDA (+${primaryItem.enchant})! Concedeu +${(primaryItem.beltBonuses.hpBonusPct * 100).toFixed(0)}% Max HP e +${primaryItem.beltBonuses.pDefBonus} P.Def!`, 'rarity-legendary');
    }
  } else {
    if (callbacks.log) {
      callbacks.log(`💥 FALHA NA SÍNTESE! O cinto secundário foi destruído, mas o principal permanece intacto.`, 'system');
    }
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return isSuccess;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 7: AUGMENTATION (LIFE STONES TRANSPARENTES)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function getLifeStoneDropSources() {
  return [
    { grade: 'common', name: 'Life Stone Comum', source: 'Monstros de Caça (1% Glow, 2% Skill)' },
    { grade: 'mid', name: 'Mid-Grade Life Stone', source: 'Monstros Campeões (5% Glow, 5% Skill)' },
    { grade: 'high', name: 'High-Grade Life Stone', source: 'Chefes de Dungeon & Masmorras (15% Glow, 12% Skill)' },
    { grade: 'top', name: 'Top-Grade Life Stone', source: 'Raid Bosses & Epic Bosses (40% Glow, 25% Skill)' }
  ];
}

export function applyLifeStone(state, weaponUid, grade = 'top', callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item) return false;

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  if (def.slot !== 'weapon') {
    if (callbacks.log) callbacks.log('Augmentation só pode ser aplicado em Armas!', 'system');
    return false;
  }

  const fees = { common: 25000, mid: 50000, high: 100000, top: 250000 };
  const fee = fees[grade] || 100000;
  if (!canAffordAdena(state, fee)) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${fee.toLocaleString()} Adena para o ritual de Augmentation.`, 'system');
    return false;
  }

  const stoneCandidates = [`lifestone_${grade}`, `life_stone_${grade}`];
  const stoneItem = (state.inventory || []).find(i => stoneCandidates.includes(i.itemId || i.id) && (i.count || 1) >= 1);
  if (!stoneItem) {
    if (callbacks.log) callbacks.log(`Você não possui uma Life Stone (${grade.toUpperCase()}) no inventário!`, 'system');
    return false;
  }

  // Dedução atômica de insumos
  state.gold -= fee;
  removeFromInventoryByItemId(state, stoneItem.itemId || stoneItem.id, 1);

  const mult = grade === 'top' ? 3 : grade === 'high' ? 2 : 1;
  const atkBonus = Math.floor((15 + Math.random() * 25) * mult);
  const critBonus = Math.floor((5 + Math.random() * 15) * mult);
  const hpBonus = Math.floor((100 + Math.random() * 200) * mult);

  const skills = [
    { name: 'Item Skill: Shield', desc: '+15% Defesa Física' },
    { name: 'Item Skill: Wild Magic', desc: '+20% Taxa de Crítico Mágico' },
    { name: 'Item Skill: Might', desc: '+12% Ataque Físico' },
    { name: 'Item Skill: Heal', desc: 'Recupera 1.500 HP' }
  ];
  const skill = (grade === 'top' || Math.random() < 0.25) ? skills[Math.floor(Math.random() * skills.length)] : null;

  item.augmentation = {
    grade,
    atkBonus,
    critBonus,
    hpBonus,
    skill
  };

  if (callbacks.log) {
    callbacks.log(`💎 AUGMENTATION CONCLUÍDO: ${def.name} recebeu [+${atkBonus} P.Atk, +${critBonus} Crit, +${hpBonus} HP]${skill ? ` e [${skill.name}]` : ''}!`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function removeAugment(state, weaponUid, callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item || !item.augmentation) return false;

  const cleanseFee = 25000;
  if (!canAffordAdena(state, cleanseFee)) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${cleanseFee.toLocaleString()} Adena para purificar a arma.`, 'system');
    return false;
  }

  state.gold -= cleanseFee;
  item.augmentation = null;
  if (callbacks.log) callbacks.log('Augmentation removido com sucesso.', 'system');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 8: RANDOM CRAFT CANÔNICO DA FORJA IMPERIAL
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Normaliza e sincroniza o namespace canônico state.randomCraft.
 * @param {Object} state
 * @returns {{ points: number, charge: number, slots: Array, history: Array }}
 */
export function getNormalizedRandomCraft(state) {
  if (!state.randomCraft || typeof state.randomCraft !== 'object') {
    state.randomCraft = {
      points: Number(state.randomCraftCharge || state.craftPoints) || 0,
      charge: Number(state.craftCharges) || 0,
      slots: Array.isArray(state.randomCraftSlots) ? state.randomCraftSlots : [],
      history: []
    };
  }
  if (state.randomCraft.points === undefined) state.randomCraft.points = Number(state.randomCraftCharge || state.craftPoints) || 0;
  if (state.randomCraft.charge === undefined) state.randomCraft.charge = Number(state.craftCharges) || 0;
  if (!Array.isArray(state.randomCraft.slots)) state.randomCraft.slots = Array.isArray(state.randomCraftSlots) ? state.randomCraftSlots : [];
  if (!Array.isArray(state.randomCraft.history)) state.randomCraft.history = [];

  // Garante que se houver cargas ou slots vazios com carga ativa, 5 slots existam
  if (state.randomCraft.slots.length === 0) {
    state.randomCraft.slots = rollCanonicalRandomCraftSlots();
  }

  // Sincroniza campos legados para backward compatibility
  state.randomCraftCharge = state.randomCraft.points;
  state.randomCraftSlots = state.randomCraft.slots;
  state.craftPoints = state.randomCraft.points;
  state.craftCharges = state.randomCraft.charge;

  return state.randomCraft;
}

export function syncRandomCraftLegacy(state) {
  const rc = getNormalizedRandomCraft(state);
  state.randomCraftCharge = rc.points;
  state.randomCraftSlots = rc.slots;
  state.craftPoints = rc.points;
  state.craftCharges = rc.charge;
}

export function chargeRandomCraftWithItem(state, itemUid, callbacks = {}) {
  const inv = state.inventory || [];
  const itemIdx = inv.findIndex(i => (i.uid === itemUid || i.id === itemUid) && !i.equipped);
  if (itemIdx === -1) {
    if (callbacks.log) callbacks.log('Item não encontrado ou está equipado!', 'system');
    return false;
  }

  const selectedSet = getSelectedSet(state);
  if (selectedSet.has(itemUid)) {
    if (callbacks.log) callbacks.log('Itens bloqueados com 🔒 não podem ser reciclados!', 'system');
    return false;
  }

  const item = inv[itemIdx];
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const tier = Number(def.tier) || 1;

  const chargePoints = RECYCLE_POINTS_BY_TIER[tier] || 2;

  inv.splice(itemIdx, 1);
  return chargeRandomCraft(state, chargePoints, callbacks);
}

export function chargeRandomCraftWithAdena(state, callbacks = {}) {
  const feeAdena = RANDOM_CRAFT_ADENA_CHARGE_COST;
  if (!canAffordAdena(state, feeAdena)) {
    if (callbacks.log) callbacks.log(`Requer ${feeAdena.toLocaleString()} Adena para carregar +${RANDOM_CRAFT_ADENA_CHARGE_POINTS} pontos.`, 'system');
    return false;
  }

  state.gold -= feeAdena;
  return chargeRandomCraft(state, RANDOM_CRAFT_ADENA_CHARGE_POINTS, callbacks);
}

export function chargeRandomCraft(state, pointsToAdd = 20, callbacks = {}) {
  const rc = getNormalizedRandomCraft(state);
  rc.points = (rc.points || 0) + pointsToAdd;

  while (rc.points >= RANDOM_CRAFT_POINTS_PER_CHARGE) {
    rc.points -= RANDOM_CRAFT_POINTS_PER_CHARGE;
    rc.charge = Math.min(100, (rc.charge || 0) + 1);
    if (callbacks.log) {
      callbacks.log(`🛠️ RANDOM CRAFT: +1 Carga Imperial gerada! (Total: ${rc.charge} Cargas)`, 'rarity-legendary');
    }
  }

  if (!rc.slots || rc.slots.length === 0) {
    rc.slots = rollCanonicalRandomCraftSlots();
  }

  syncRandomCraftLegacy(state);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function refreshRandomCraftSlots(state, callbacks = {}) {
  const feeAdena = RANDOM_CRAFT_REROLL_COST;
  if (!canAffordAdena(state, feeAdena)) {
    if (callbacks.log) callbacks.log(`Requer ${feeAdena.toLocaleString()} Adena para atualizar os 5 slots da Roleta.`, 'system');
    return false;
  }

  state.gold -= feeAdena;
  const rc = getNormalizedRandomCraft(state);
  rc.slots = rollCanonicalRandomCraftSlots();
  syncRandomCraftLegacy(state);

  if (callbacks.log) callbacks.log('🎰 Roleta Imperial Random Craft atualizada com 5 novos itens!', 'system');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function rollRandomCraftSlots(state) {
  const rc = getNormalizedRandomCraft(state);
  rc.slots = rollCanonicalRandomCraftSlots();
  syncRandomCraftLegacy(state);
  return rc.slots;
}

export function spinRandomCraft(state, callbacks = {}) {
  const rc = getNormalizedRandomCraft(state);
  if (!rc.charge || rc.charge < 1) {
    if (callbacks.log) callbacks.log('Você não possui Cargas de Random Craft suficientes (requer 1 Carga = 100 Pts)!', 'system');
    return false;
  }

  if (!rc.slots || rc.slots.length === 0) {
    rc.slots = rollCanonicalRandomCraftSlots();
  }

  // Sorteio aleatório uniforme entre os 5 slots (20% para cada item gerado, sem escolha manual do jogador)
  const wonIdx = Math.floor(Math.random() * rc.slots.length);
  const reward = rc.slots[wonIdx];

  const gData = D();
  const def = gData?.ALL_ITEMS?.[reward.itemId] || { name: reward.itemId };

  // Adiciona a recompensa ao inventário
  if (!addToInventory(state, reward.itemId, reward.count || 1, reward.rarity || 'rare', false, callbacks)) {
    if (callbacks.log) callbacks.log('Mochila cheia! Libere espaço antes de girar o Random Craft.', 'system');
    return false;
  }

  rc.charge -= 1;

  rc.history.unshift({
    itemId: reward.itemId,
    count: reward.count || 1,
    rarity: reward.rarity || 'rare',
    timestamp: Date.now()
  });
  if (rc.history.length > 20) rc.history.pop();

  if (callbacks.log) {
    callbacks.log(`🎰 RANDOM CRAFT! A Roleta sorteou o Slot ${wonIdx + 1}: **${def.name}** ${reward.count > 1 ? `(${reward.count}x)` : ''}!`, 'rarity-legendary');
  }

  // Renova automaticamente os 5 slots para o próximo giro
  rc.slots = rollCanonicalRandomCraftSlots();
  syncRandomCraftLegacy(state);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return reward;
}

export function claimRandomCraft(state, slotIdx = 0, callbacks = {}) {
  // Alias compatível: gira a roleta imperial
  return spinRandomCraft(state, callbacks);
}
