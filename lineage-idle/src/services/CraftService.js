/**
 * CraftService.js — Motor de Criação, Metalurgia Imperial e Aprimoramento do Lineage Idle.
 *
 * Módulos Integrados e Balanceados:
 * 1. Forja Universal com Craft em Lote e Cálculo "Máx" O(1).
 * 2. Critical Craft (Double Craft e Foundation / Masterwork).
 * 3. Localizador de Fontes de Drop (Drop & Spoil Locator).
 * 4. Soul Crystals (Níveis 1 a 15, Drenagem de Alma & Epic Boss Stage 15 com 50% de chance).
 * 5. Ferreiro Pushkin (Mestre Armeiro: Unseal, Masterwork e Troca de Armas de Mesmo Grau).
 * 6. Symbol Maker (Dyes & Tatuagens Sagradas em Estágios 1 a 5).
 * 7. Atributos Elementais (Consumo Real de Pedras, Roda de Oposição e Drop Sources).
 * 8. Síntese de Cintos (Compound de Duplicatas com 30% de Sucesso e Rolagem de Stats).
 * 9. Augmentation com Life Stones Transparentes.
 * 10. Random Craft Balanceado (Reciclagem Real de Itens e Pools Proporcionais).
 */

import { D } from '../core/GameConfig.js';
import { addToInventory, getInventoryCount, getSelectedSet } from './InventoryService.js';
import {
  RANDOM_CRAFT_POINTS_PER_CHARGE,
  RANDOM_CRAFT_REROLL_COST,
  RANDOM_CRAFT_ADENA_CHARGE_COST,
  RANDOM_CRAFT_ADENA_CHARGE_POINTS,
  RECYCLE_POINTS_BY_TIER,
  rollCanonicalRandomCraftSlots
} from '../data/economy/randomCraftBalance.js';
import { CRAFTING_RECIPES } from '../data/items/recipes_drops.js';

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

  const costGold = recipe.gold || 250;
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
  const count = Math.max(1, parseInt(qty, 10) || 1);
  const maxPossible = calculateMaxCraftableQty(state, recipeId);
  return maxPossible >= count;
}

export function canCraftRecipe(state, id, qty = 1) {
  return canCraft(state, id, qty);
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

  const countToCraft = Math.max(1, parseInt(qty, 10) || 1);
  const maxPossible = calculateMaxCraftableQty(state, recipeId);
  if (maxPossible < countToCraft) {
    if (callbacks.log) callbacks.log('Materiais ou Adena insuficientes para esta quantidade.', 'system');
    return false;
  }

  const costGold = (recipe.gold || 250) * countToCraft;
  state.gold = (state.gold || 0) - costGold;

  const mats = getRecipeMaterials(recipe);
  for (const { matId, qty: baseQty } of mats) {
    let needed = baseQty * countToCraft;
    for (let i = state.inventory.length - 1; i >= 0 && needed > 0; i--) {
      const it = state.inventory[i];
      if ((it.itemId === matId || it.id === matId) && !it.equipped) {
        const take = Math.min(it.count || 1, needed);
        if ((it.count || 1) > take) {
          it.count -= take;
          needed = 0;
        } else {
          state.inventory.splice(i, 1);
          needed -= take;
        }
      }
    }
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const itemDef = allItems[recipeId] || allItems[recipe.itemId || recipe.id] || recipe;
  const isConsumable = itemDef && ['potion', 'consumable', 'scroll', 'soulshot', 'spiritshot'].includes(itemDef.slot);
  const baseYieldPerUnit = recipe.outputQty || ((isConsumable && (recipeId.includes('shot') || recipeId.includes('potion'))) ? 50 : 1);

  // Cálculo de Critical Craft (Double Craft & Foundation)
  const isDwarf = state.race === 'dwarf' || state.class === 'artisan' || state.class === 'warsmith';
  const forgeLvl = state.accountForgeLevel || state.craftLevel || 1;
  const doubleCraftChance = (isDwarf ? 0.15 : 0.05) + (forgeLvl * 0.005);
  const isDouble = Math.random() < doubleCraftChance;

  const totalYield = (baseYieldPerUnit * countToCraft) * (isDouble ? 2 : 1);

  const pityBonus = (state.craftFoundationPity || 0) * 0.002;
  const foundationChance = 0.06 + (isDwarf ? 0.04 : 0) + pityBonus;
  const isFoundation = !isConsumable && (Math.random() < foundationChance);

  if (isFoundation) {
    state.craftFoundationPity = 0;
  } else {
    state.craftFoundationPity = (state.craftFoundationPity || 0) + countToCraft;
  }

  const rarityBoost = isDwarf ? 1 : 0;
  const rolledRarity = gData?.rollRarity ? gData.rollRarity(rarityBoost) : 'common';

  const targetItemId = recipe?.result || recipeId;
  addToInventory(state, targetItemId, totalYield, rolledRarity, isFoundation, callbacks, true);

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

/**
 * Processa a absorção de almas ao derrotar um monstro ou chefe.
 * @param {Object} state
 * @param {Object} monster
 * @param {Object} callbacks
 */
export function processSoulDrainOnKill(state, monster = {}, callbacks = {}) {
  const crystal = (state.inventory || []).find(i => (i.itemId?.startsWith('soul_crystal_') || i.isSoulCrystal) && !i.equipped);
  if (!crystal) return;

  const currentLevel = crystal.stage || crystal.crystalLevel || 1;
  const isEpicBoss = monster.isEpicBoss || ['valakas', 'antharas', 'baium', 'frintezza', 'barakiel'].includes(monster.id || monster.key);
  const isRaidBoss = monster.isBoss || monster.isRaid || isEpicBoss;

  // Estágio Máximo Lendário: Nível 14 -> 15 Requer Derrotar um Epic Boss com 50% de chance!
  if (currentLevel === 14) {
    if (isEpicBoss) {
      const resonanceSuccess = Math.random() < 0.50; // 50% de chance canônica
      if (resonanceSuccess) {
        crystal.stage = 15;
        crystal.crystalLevel = 15;
        crystal.name = `Soul Crystal - Estágio 15 (Lendário)`;
        if (callbacks.log) {
          callbacks.log(`🌟 RESSONÂNCIA ÉPICA! A alma de ${monster.name || 'Epic Boss'} elevou o Soul Crystal ao Nível 15 (MÁXIMO)!`, 'rarity-sovereign');
        }
        if (callbacks.floatText) callbacks.floatText('🌟 SOUL CRYSTAL STAGE 15!', 'float-jackpot');
      } else {
        if (callbacks.log) {
          callbacks.log(`💨 A alma do Epic Boss escapou... O Soul Crystal Lv.14 não conseguiu ressonar (50% de chance).`, 'system');
        }
      }
      if (callbacks.updateAllUI) callbacks.updateAllUI();
      if (callbacks.save) callbacks.save();
    }
    return;
  }

  if (currentLevel >= 15) return; // Já no teto máximo

  // Progressão de Níveis 1 a 10 (Monstros Comuns / Campeões)
  if (currentLevel < 10) {
    crystal.absorbedSouls = (crystal.absorbedSouls || 0) + 1;
    const reqSouls = currentLevel * 10;
    if (crystal.absorbedSouls >= reqSouls) {
      crystal.absorbedSouls = 0;
      const successChance = 0.70 - (currentLevel * 0.04);
      if (Math.random() < successChance) {
        crystal.stage = currentLevel + 1;
        crystal.crystalLevel = crystal.stage;
        if (callbacks.log) callbacks.log(`🔮 SOUL UPGRADE! Soul Crystal absorveu almas e subiu para o Nível ${crystal.stage}!`, 'rarity-epic');
      } else {
        if (callbacks.log) callbacks.log(`⚠️ Falha na absorção de almas! O cristal manteve o Nível ${currentLevel}.`, 'system');
      }
    }
    return;
  }

  // Progressão de Níveis 10 a 13 (Masmorras e Raids Médios)
  if (currentLevel >= 10 && currentLevel < 14) {
    if (isRaidBoss || monster.level >= 50) {
      crystal.absorbedSouls = (crystal.absorbedSouls || 0) + (isRaidBoss ? 10 : 1);
      const reqSouls = currentLevel * 20;
      if (crystal.absorbedSouls >= reqSouls) {
        crystal.absorbedSouls = 0;
        const successChance = 0.45;
        if (Math.random() < successChance) {
          crystal.stage = currentLevel + 1;
          crystal.crystalLevel = crystal.stage;
          if (callbacks.log) callbacks.log(`🔮 SOUL UPGRADE! Soul Crystal absorveu almas de elite e subiu para o Nível ${crystal.stage}!`, 'rarity-legendary');
        }
      }
    }
  }
}

/**
 * Engasta o Soul Crystal na Arma com bônus proporcional ao nível do cristal (1 a 15).
 */
export function applySoulCrystal(state, weaponUid, color = 'red', saKey = 'focus', callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item) {
    if (callbacks.log) callbacks.log('Arma não encontrada no inventário.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  if (!def || def.slot !== 'weapon') {
    if (callbacks.log) callbacks.log('Soul Crystals só podem ser engastados em Armas!', 'system');
    return false;
  }

  const saGroup = SA_DEFINITIONS[color];
  const saBonus = saGroup?.[saKey] || Object.values(saGroup || {})[0];
  if (!saBonus) return false;

  // Busca cristal no inventário
  const crystalIdx = (state.inventory || []).findIndex(i => (i.itemId?.startsWith('soul_crystal_') || i.isSoulCrystal) && !i.equipped);
  const crystalLevel = crystalIdx !== -1 ? (state.inventory[crystalIdx].stage || state.inventory[crystalIdx].crystalLevel || 1) : 1;

  if (crystalIdx !== -1) {
    state.inventory.splice(crystalIdx, 1); // Consome o cristal utilizado
  }

  // Escala de poder por nível do cristal (Nível 1 = 50%, Nível 10 = 85%, Nível 15 = 120%)
  const powerScale = 0.50 + (crystalLevel * 0.05);
  const finalVal = typeof saBonus.baseVal === 'number' ? (saBonus.baseVal > 1 ? Math.round(saBonus.baseVal * powerScale) : parseFloat((saBonus.baseVal * powerScale).toFixed(3))) : saBonus.baseVal;

  item.soulCrystal = {
    color,
    key: saKey,
    name: saBonus.name,
    level: crystalLevel,
    desc: `${saBonus.desc} (+${typeof finalVal === 'number' && finalVal < 1 ? (finalVal * 100).toFixed(0) + '%' : finalVal})`,
    stat: saBonus.stat,
    val: finalVal
  };

  if (callbacks.log) {
    callbacks.log(`🔮 SPECIAL ABILITY CONCEDIDA (Lv.${crystalLevel}): ${def.name} recebeu [SA: ${saBonus.name}]! (${item.soulCrystal.desc})`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
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
  if ((state.gold || 0) < unsealCost) {
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
  if ((state.gold || 0) < mwCost) {
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

  if (!targetDef || targetDef.slot !== 'weapon') {
    if (callbacks.log) callbacks.log('Arma de destino inválida.', 'system');
    return false;
  }

  const swapFee = 150000;
  if ((state.gold || 0) < swapFee) {
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
  state.dyeSymbols = state.dyeSymbols || [null, null, null];
  const current = state.dyeSymbols[slotIdx];
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

  if ((state.gold || 0) < upgradeCost) {
    if (callbacks.log) callbacks.log(`Adena insuficiente! Requer ${upgradeCost.toLocaleString()} Adena para evoluir a tatuagem.`, 'system');
    return false;
  }

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
  const item = (state.inventory || []).find(i => i.uid === equipUid || i.id === equipUid);
  if (!item) return false;

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  const isWeapon = def?.slot === 'weapon';

  const maxCap = isWeapon ? 300 : 120;
  const currentVal = item.elementalAttribute?.val || 0;

  if (currentVal >= maxCap) {
    if (callbacks.log) callbacks.log(`Este equipamento já atingiu o limite máximo elemental de ${maxCap}!`, 'system');
    return false;
  }

  const step = isWeapon ? 20 : 6;
  const newVal = Math.min(maxCap, currentVal + step);

  item.elementalAttribute = {
    element,
    val: newVal
  };

  const elemInfo = ELEMENT_DEFINITIONS[element] || { name: element };

  if (callbacks.log) {
    callbacks.log(`🔥 INFUSÃO ELEMENTAL: ${def.name} recebeu +${step} de ${elemInfo.name}! (Total: ${newVal}/${maxCap})`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
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
  if ((state.gold || 0) < compoundCost) {
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
      weightBonus: 1000 + (primaryItem.enchant * 500),
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
  if ((state.gold || 0) < feeAdena) {
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
    rc.charge = (rc.charge || 0) + 1;
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
  if ((state.gold || 0) < feeAdena) {
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
  rc.charge -= 1;
  const wonIdx = Math.floor(Math.random() * rc.slots.length);
  const reward = rc.slots[wonIdx];

  const gData = D();
  const def = gData?.ALL_ITEMS?.[reward.itemId] || { name: reward.itemId };

  // Adiciona a recompensa ao inventário
  addToInventory(state, reward.itemId, reward.count || 1, reward.rarity || 'rare', false, callbacks);

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
