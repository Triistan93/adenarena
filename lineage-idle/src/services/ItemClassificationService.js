/**
 * ItemClassificationService.js — Taxonomia Formal de Itens em Dois Níveis.
 *
 * Garante padronização semântica de itens em todo o AdenArena:
 * category: EQUIPMENT | CONSUMABLE | MATERIAL | QUEST | SCROLL | CRAFTING | CURRENCY | SPECIAL
 * equipmentType: WEAPON | ARMOR | JEWELRY | ACCESSORY (definido apenas quando category === 'EQUIPMENT')
 */

export const ITEM_CATEGORIES = {
  EQUIPMENT: 'EQUIPMENT',
  CONSUMABLE: 'CONSUMABLE',
  MATERIAL: 'MATERIAL',
  QUEST: 'QUEST',
  SCROLL: 'SCROLL',
  CRAFTING: 'CRAFTING',
  CURRENCY: 'CURRENCY',
  SPECIAL: 'SPECIAL'
};

export const EQUIPMENT_TYPES = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  JEWELRY: 'JEWELRY',
  ACCESSORY: 'ACCESSORY'
};

const WEAPON_SLOTS = new Set([
  'weapon', 'weapon2', 'sword', 'bow', 'dagger', 'blunt', 'staff', 'spear', 'dual', 'twohand'
]);

const ARMOR_SLOTS = new Set([
  'armor', 'chest', 'body', 'breastplate', 'robe', 'legs', 'gaiters',
  'helmet', 'helm', 'head', 'gloves', 'hands', 'boots', 'feet', 'shield', 'offhand', 'sigil', 'cloak', 'cape'
]);

const JEWELRY_SLOTS = new Set([
  'necklace', 'neck', 'earring', 'earring1', 'earring2', 'ring', 'ring1', 'ring2'
]);

const ACCESSORY_SLOTS = new Set([
  'belt', 'waist', 'hair', 'hair1', 'hair2', 'mask', 'brooch',
  'talisman_bracelet', 'agathion_bracelet', 'talisman', 'agathion', 'jewel'
]);

/**
 * Retorna a Categoria Formal do Item (1º Nível).
 * @param {Object} itemDef
 * @returns {string} ITEM_CATEGORIES
 */
export function getItemCategory(itemDef) {
  if (!itemDef) return ITEM_CATEGORIES.SPECIAL;

  if (itemDef.category && Object.values(ITEM_CATEGORIES).includes(itemDef.category)) {
    return itemDef.category;
  }

  const rawSlot = String(itemDef.slot || '').toLowerCase().trim();
  const rawType = String(itemDef.type || '').toLowerCase().trim();
  const itemId = String(itemDef.id || itemDef.itemId || '').toLowerCase();

  // 1. Quests
  if (itemDef.isQuestItem || rawSlot === 'quest' || rawType === 'quest' || itemId.startsWith('quest_')) {
    return ITEM_CATEGORIES.QUEST;
  }

  // 2. Currencies
  if (rawSlot === 'currency' || rawSlot === 'coin' || itemId === 'adena' || itemId === 'ancient_adena' || itemId === 'gold') {
    return ITEM_CATEGORIES.CURRENCY;
  }

  // 3. Materials
  if (rawSlot === 'material' || rawType === 'material' || itemId.startsWith('mat_') || itemId.startsWith('ore_') || itemId.startsWith('iron_') || itemId.startsWith('crystal_') || itemId === 'varnish' || itemId === 'braided_hemp' || itemId === 'charcoal' || itemId === 'coal' || itemId === 'cloth') {
    return ITEM_CATEGORIES.MATERIAL;
  }

  // 4. Crafting (receitas, moldes, partes)
  if (rawSlot === 'recipe' || rawType === 'recipe' || itemId.startsWith('recipe_') || itemId.startsWith('piece_') || itemId.startsWith('blade_')) {
    return ITEM_CATEGORIES.CRAFTING;
  }

  // 5. Scrolls (encantamento, teleporte, ressurreição, buffs em pergaminho)
  if (rawSlot === 'scroll' || rawType === 'scroll' || itemId.includes('scroll') || itemId.startsWith('scrl_')) {
    return ITEM_CATEGORIES.SCROLL;
  }

  // 6. Consumables
  if (rawSlot === 'consumable' || rawSlot === 'potion' || rawType === 'potion' || rawType === 'heal' || rawType === 'mana' || rawType === 'buff' || rawType === 'food' || itemId.includes('potion') || itemId.startsWith('elixir_') || itemId.includes('shot')) {
    return ITEM_CATEGORIES.CONSUMABLE;
  }

  // 7. Equipment
  if (WEAPON_SLOTS.has(rawSlot) || ARMOR_SLOTS.has(rawSlot) || JEWELRY_SLOTS.has(rawSlot) || ACCESSORY_SLOTS.has(rawSlot) || rawType === 'weapon' || rawType === 'armor' || rawType === 'shield') {
    return ITEM_CATEGORIES.EQUIPMENT;
  }

  return ITEM_CATEGORIES.SPECIAL;
}

/**
 * Retorna o Subtipo Formal de Equipamento (2º Nível).
 * @param {Object} itemDef
 * @returns {string|null} EQUIPMENT_TYPES ou null se não for equipamento
 */
export function getEquipmentType(itemDef) {
  if (!itemDef) return null;
  const category = getItemCategory(itemDef);
  if (category !== ITEM_CATEGORIES.EQUIPMENT) return null;

  if (itemDef.equipmentType && Object.values(EQUIPMENT_TYPES).includes(itemDef.equipmentType)) {
    return itemDef.equipmentType;
  }

  const rawSlot = String(itemDef.slot || '').toLowerCase().trim();
  const rawType = String(itemDef.type || '').toLowerCase().trim();

  if (WEAPON_SLOTS.has(rawSlot) || rawType === 'weapon') {
    return EQUIPMENT_TYPES.WEAPON;
  }
  if (ARMOR_SLOTS.has(rawSlot) || rawType === 'armor' || rawType === 'shield') {
    return EQUIPMENT_TYPES.ARMOR;
  }
  if (JEWELRY_SLOTS.has(rawSlot) || rawType === 'jewel') {
    return EQUIPMENT_TYPES.JEWELRY;
  }
  if (ACCESSORY_SLOTS.has(rawSlot) || rawType === 'accessory') {
    return EQUIPMENT_TYPES.ACCESSORY;
  }

  return EQUIPMENT_TYPES.ARMOR;
}

/**
 * Validador estrito de elegibilidade para equipamentos do personagem.
 * Rejeita categoricamente materiais, consumíveis, pergaminhos e itens de missão.
 * @param {Object} itemDef
 * @returns {boolean}
 */
export function isEquippableItem(itemDef) {
  if (!itemDef) return false;
  return getItemCategory(itemDef) === ITEM_CATEGORIES.EQUIPMENT;
}

/**
 * Analisa e decodifica a definição de um Pergaminho de Encantamento.
 * @param {Object} itemOrDef
 * @returns {{ isScroll: boolean, targetType: 'WEAPON'|'ARMOR'|null, grade: string|null, isBlessed: boolean }}
 */
export function parseEnchantScroll(itemOrDef) {
  if (!itemOrDef) return { isScroll: false, targetType: null, grade: null, isBlessed: false };
  const id = String(itemOrDef.id || itemOrDef.itemId || '').toLowerCase();
  const name = String(itemOrDef.name || '').toLowerCase();
  const rawSlot = String(itemOrDef.slot || '').toLowerCase();
  const rawType = String(itemOrDef.type || '').toLowerCase();

  const isScrollId = id.includes('scroll') || id.includes('enchant') || id.includes('scrl_') || rawSlot === 'scroll' || rawType === 'scroll';
  const isEnchantSpecific = id.includes('enchant') || id.includes('blessed') || name.includes('encantar') || name.includes('enchant') || name.includes('blessed');

  if (!isScrollId || !isEnchantSpecific) {
    return { isScroll: false, targetType: null, grade: null, isBlessed: false };
  }

  const isBlessed = id.includes('blessed') || name.includes('abençoado') || name.includes('blessed');
  
  let targetType = null;
  if (id.includes('weapon') || name.includes('arma') || name.includes('weapon')) {
    targetType = EQUIPMENT_TYPES.WEAPON;
  } else if (id.includes('armor') || id.includes('armadura') || name.includes('armadura') || name.includes('armor')) {
    targetType = EQUIPMENT_TYPES.ARMOR;
  }

  let grade = null;
  const gradeMatches = id.match(/_([dcbans])(?:_|$)/) || name.match(/\b([dcbans])-?grade\b/i) || name.match(/grau\s+([dcbans])\b/i);
  if (gradeMatches) {
    grade = gradeMatches[1].toUpperCase();
  } else if (id.includes('crystal_scroll') || id.includes('universal') || name.includes('universal') || id.includes('scroll_blessed') || id.startsWith('scroll_of_enchant_') || id.startsWith('scroll_blessed_')) {
    grade = 'ANY';
  } else if (itemOrDef.tier === 1) {
    grade = 'NG';
  }

  return {
    isScroll: true,
    targetType,
    grade,
    isBlessed
  };
}

/**
 * Valida a compatibilidade atômica entre um Pergaminho de Encantamento e um Item Alvo.
 * @param {Object} targetDef Definição do item que receberá o encantamento
 * @param {Object} scrollDef Definição do pergaminho de encantamento
 * @returns {{ ok: boolean, reason?: string }}
 */
export function isItemCompatibleWithScroll(targetDef, scrollDef) {
  if (!targetDef || !isEquippableItem(targetDef)) {
    return { ok: false, reason: 'O item alvo não é um equipamento elegível para encantamento.' };
  }

  const scrollInfo = parseEnchantScroll(scrollDef);
  if (!scrollInfo.isScroll) {
    return { ok: false, reason: 'O item selecionado não é um pergaminho de encantamento válido.' };
  }

  const eqType = getEquipmentType(targetDef);

  // Validação de Tipo de Equipamento
  if (scrollInfo.targetType === EQUIPMENT_TYPES.WEAPON) {
    if (eqType !== EQUIPMENT_TYPES.WEAPON) {
      return { ok: false, reason: 'Este pergaminho só pode ser aplicado em Armas.' };
    }
  } else if (scrollInfo.targetType === EQUIPMENT_TYPES.ARMOR) {
    if (eqType === EQUIPMENT_TYPES.WEAPON) {
      return { ok: false, reason: 'Este pergaminho só pode ser aplicado em Armaduras, Joias ou Escudos.' };
    }
  }

  // Validação de Grau (Grade)
  const itemGrade = String(targetDef.grade || (targetDef.tier ? ['NG','NG','D','C','B','A','S'][targetDef.tier] : 'NG')).toUpperCase();
  if (scrollInfo.grade && scrollInfo.grade !== 'ANY') {
    if (scrollInfo.grade !== itemGrade) {
      return {
        ok: false,
        reason: `Incompatibilidade de Grau: O pergaminho é Grau ${scrollInfo.grade}, mas o item é Grau ${itemGrade}.`
      };
    }
  }

  return { ok: true };
}
