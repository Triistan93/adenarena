/**
 * CraftService.js — Motor de Criação, Metalurgia Imperial e Aprimoramento do Lineage Idle.
 *
 * Responsável por:
 * 1. Forja Universal com Craft em Lote e Cálculo "Máx".
 * 2. Critical Craft (Double Craft e Foundation / Masterwork).
 * 3. Localizador de Fontes de Drop (Drop & Spoil Locator).
 * 4. Soul Crystals & Habilidades Especiais (SA).
 * 5. Ferreiro Pushkin (Unseal de B/A/S e Polimento Masterwork).
 * 6. Symbol Maker (Tatuagens Sagradas +4/-4 com teto de +5).
 * 7. Atributos Elementais (Fogo/Água, Terra/Vento, Sagrado/Trevas - 150/300).
 * 8. Augmentation com Life Stones e Remoção.
 * 9. Roleta de Reciclagem (Random Craft).
 * 10. Progressão de Nível de Forja da Conta (Account Forge System).
 */

import { D } from '../core/GameConfig.js';
import { addToInventory, getInventoryCount, getSelectedSet } from './InventoryService.js';

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
 * Calcula a quantidade máxima de repetições possíveis de uma receita com os materiais atuais.
 * @param {Object} state
 * @param {string} recipeId
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
 * @param {Object} state
 * @param {string} recipeId
 * @param {number} [qty=1]
 * @param {Object} [callbacks]
 * @returns {boolean}
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
  const baseYieldPerUnit = (isConsumable && (recipeId.includes('shot') || recipeId.includes('potion'))) ? 50 : 1;

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

  addToInventory(state, recipeId, totalYield, rolledRarity, isFoundation, callbacks, true);

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
 * @param {string} matId
 * @returns {Array<{zoneName: string, minLevel: number, source: string}>}
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
 * SUBSISTEMA 2: SOUL CRYSTALS & SPECIAL ABILITY (SA)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const SA_DEFINITIONS = {
  red: {
    focus: { name: 'Focus', desc: '+65 Taxa de Crítico Físico', stat: 'crit', val: 65 },
    critical_damage: { name: 'Critical Damage', desc: '+280 Dano Crítico', stat: 'critDmg', val: 280 },
    might: { name: 'Might', desc: '+15% Dano Físico P.Atk', stat: 'atkPct', val: 0.15 }
  },
  green: {
    acumen: { name: 'Acumen', desc: '+15% Velocidade de Conjuração Mágica', stat: 'castSpd', val: 0.15 },
    haste: { name: 'Haste', desc: '+10% Velocidade de Ataque Físico', stat: 'atkSpd', val: 0.10 },
    health: { name: 'Health', desc: '+25% Vida Máxima (Max HP)', stat: 'hpPct', val: 0.25 }
  },
  blue: {
    empower: { name: 'Empower', desc: '+20% Poder de Ataque Mágico (M.Atk)', stat: 'matkPct', val: 0.20 },
    guidance: { name: 'Guidance', desc: '+8 Precisão / Acerto', stat: 'acc', val: 8 },
    anger: { name: 'Anger', desc: '+25% Dano Físico quando HP < 50%', stat: 'anger', val: 0.25 }
  }
};

export function applySoulCrystal(state, weaponUid, color = 'red', saKey = 'focus', callbacks = {}) {
  const item = (state.inventory || []).find(i => i.uid === weaponUid || i.id === weaponUid);
  if (!item) {
    if (callbacks.log) callbacks.log('Arma não encontrada no inventário.', 'system');
    return false;
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId || item.id] || item;
  if (!def || def.slot !== 'weapon') {
    if (callbacks.log) callbacks.log('Soul Crystals só podem ser inseridos em Armas!', 'system');
    return false;
  }

  const saGroup = SA_DEFINITIONS[color];
  const saBonus = saGroup?.[saKey] || Object.values(saGroup || {})[0];
  if (!saBonus) return false;

  item.soulCrystal = {
    color,
    key: saKey,
    name: saBonus.name,
    desc: saBonus.desc,
    stat: saBonus.stat,
    val: saBonus.val
  };

  if (callbacks.log) {
    callbacks.log(`🔮 SPECIAL ABILITY CONCEDIDA: ${def.name} recebeu [SA: ${saBonus.name}]! (${saBonus.desc})`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 3: FERREIRO PUSHKIN (UNSEAL & MASTERWORK)
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
    if (callbacks.log) callbacks.log('Apenas itens Foundation podem ser polidos para Masterwork!', 'system');
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
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 4: SYMBOL MAKER & TATUAGENS SAGRADAS (DYES)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const DYES_CATALOG = {
  dye_str_con: { name: 'Dye of STR (+4 STR / -4 CON)', plus: { str: 4 }, minus: { con: 4 } },
  dye_dex_con: { name: 'Dye of DEX (+4 DEX / -4 CON)', plus: { dex: 4 }, minus: { con: 4 } },
  dye_con_str: { name: 'Dye of CON (+4 CON / -4 STR)', plus: { con: 4 }, minus: { str: 4 } },
  dye_wit_men: { name: 'Dye of WIT (+4 WIT / -4 MEN)', plus: { wit: 4 }, minus: { men: 4 } },
  dye_int_men: { name: 'Dye of INT (+4 INT / -4 MEN)', plus: { int: 4 }, minus: { men: 4 } },
  dye_men_int: { name: 'Dye of MEN (+4 MEN / -4 INT)', plus: { men: 4 }, minus: { int: 4 } }
};

export function applyDyeSymbol(state, slotIdx = 0, dyeKey = 'dye_str_con', callbacks = {}) {
  state.dyeSymbols = state.dyeSymbols || [null, null, null];
  if (slotIdx < 0 || slotIdx > 2) return false;

  const dye = DYES_CATALOG[dyeKey];
  if (!dye) return false;

  // Validar teto de +5 por atributo base
  const testSymbols = [...state.dyeSymbols];
  testSymbols[slotIdx] = dye;

  const netStats = { str: 0, dex: 0, con: 0, int: 0, wit: 0, men: 0 };
  for (const s of testSymbols) {
    if (!s) continue;
    for (const [k, v] of Object.entries(s.plus || {})) netStats[k] += v;
    for (const [k, v] of Object.entries(s.minus || {})) netStats[k] -= v;
  }

  for (const [k, v] of Object.entries(netStats)) {
    if (v > 5) {
      if (callbacks.log) callbacks.log(`Limite excedido! O bônus total de ${k.toUpperCase()} não pode ultrapassar +5.`, 'system');
      return false;
    }
  }

  state.dyeSymbols[slotIdx] = {
    key: dyeKey,
    name: dye.name,
    plus: dye.plus,
    minus: dye.minus
  };

  if (callbacks.log) {
    callbacks.log(`🖊️ SÍMBOLO SAGRADO GRAVADO: Slot ${slotIdx + 1} recebeu [${dye.name}]!`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
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
 * SUBSISTEMA 5: ATRIBUTOS ELEMENTAIS (150 / 300)
 * ═══════════════════════════════════════════════════════════════════════════
 */
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

  const elemNames = { fire: 'Fogo 🔥', water: 'Água 💧', wind: 'Vento 🌪️', earth: 'Terra 🌍', holy: 'Sagrado ✨', dark: 'Trevas 🌑' };

  if (callbacks.log) {
    callbacks.log(`🔥 INFUSÃO ELEMENTAL: ${def.name} recebeu +${step} de ${elemNames[element] || element}! (Total: ${newVal}/${maxCap})`, 'rarity-epic');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SUBSISTEMA 6: AUGMENTATION (LIFE STONES)
 * ═══════════════════════════════════════════════════════════════════════════
 */
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
    { name: 'Item Skill: Shield', desc: '+15% Defesa Física por 2 min' },
    { name: 'Item Skill: Wild Magic', desc: '+20% Taxa de Crítico Mágico' },
    { name: 'Item Skill: Might', desc: '+12% Ataque Físico' },
    { name: 'Item Skill: Heal', desc: 'Cura instantânea de 1.500 HP' }
  ];
  const skill = (grade === 'top' || Math.random() < 0.3) ? skills[Math.floor(Math.random() * skills.length)] : null;

  item.augmentation = {
    grade,
    atkBonus,
    critBonus,
    hpBonus,
    skill
  };

  if (callbacks.log) {
    callbacks.log(`💎 AUGMENTATION CONCLUÍDO: ${def.name} recebeu [+${atkBonus} P.Atk, +${critBonus} Crit, +${hpBonus} HP]${skill ? ` e [Skill: ${skill.name}]` : ''}!`, 'rarity-legendary');
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
 * SUBSISTEMA 7: RANDOM CRAFT (ROLETA MÍSTICA DE ADEN)
 * ═══════════════════════════════════════════════════════════════════════════
 */
export function chargeRandomCraft(state, pointsToAdd = 25, callbacks = {}) {
  state.randomCraftCharge = (state.randomCraftCharge || 0) + pointsToAdd;
  if (state.randomCraftCharge >= 100) {
    state.randomCraftCharge = 100;
    rollRandomCraftSlots(state);
    if (callbacks.log) callbacks.log('🎲 RANDOM CRAFT 100% CARREGADO! 5 relíquias foram invocadas na Roleta Imperial.', 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
}

export function rollRandomCraftSlots(state) {
  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const itemKeys = Object.keys(allItems);

  state.randomCraftSlots = [];
  for (let i = 0; i < 5; i++) {
    const rKey = itemKeys[Math.floor(Math.random() * itemKeys.length)];
    state.randomCraftSlots.push({
      itemId: rKey,
      count: 1,
      rarity: Math.random() < 0.1 ? 'epic' : 'rare'
    });
  }
}

export function claimRandomCraft(state, slotIdx = 0, callbacks = {}) {
  if ((state.randomCraftCharge || 0) < 100 || !state.randomCraftSlots || !state.randomCraftSlots[slotIdx]) {
    if (callbacks.log) callbacks.log('A Roleta precisa estar em 100% de carga para resgatar!', 'system');
    return false;
  }

  const reward = state.randomCraftSlots[slotIdx];
  addToInventory(state, reward.itemId, reward.count || 1, reward.rarity || 'rare', false, callbacks);

  state.randomCraftCharge = 0;
  state.randomCraftSlots = [];

  const gData = D();
  const def = gData?.ALL_ITEMS?.[reward.itemId] || { name: reward.itemId };

  if (callbacks.log) {
    callbacks.log(`🎉 RECOMPENSA DA ROLETA: Você forjou [${def.name}] gratuitamente!`, 'rarity-legendary');
  }

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
  return true;
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
  const check = checkAccountForgeLevel(state, 10);
  if (!check.allowed) {
    return { success: false, message: check.error };
  }

  const inv = state.inventory || [];
  let totalDestroyed = 0;

  for (const req of sacrificeList) {
    const item = inv.find(i => (i.id === req.itemId || i.itemId === req.itemId));
    const available = item ? (item.count || item.quantity || 1) : 0;
    if (available < req.count) {
      return { success: false, message: `Quantidade insuficiente de ${req.itemId} (Requer: ${req.count}, Disponível: ${available}).` };
    }
  }

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

  addToInventory(state, targetItemId, 1);

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
