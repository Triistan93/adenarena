/**
 * index.js — Catálogo Centralizado de Itens, Equipamentos e Drops do Lineage Idle.
 *
 * Agrega todos os submódulos de itens em ALL_ITEMS e popula window.GameData para manter
 * compatibilidade transparente em toda a aplicação.
 */

import { RARITY, SLOT, ARMOR_SETS } from './rarity_sets.js';
import { WEAPONS } from './weapons.js';
import { ARMORS, HELMETS, BOOTS, GLOVES, LEGS, SHIELDS, BELTS, CLOAKS, SIGILS } from './armors.js';
import { RINGS, EARRINGS, NECKLACES, HAIR, AGATHIONS } from './jewels.js';
import { CONSUMABLES, MATERIALS } from './consumables.js';
import { HEIRLOOM_ITEMS } from './heirloom_items.js';
import { rollAffixes, rollAffixesForItem, AFFIX_MAP, AFFIX_POOL, AFFIX_POOLS_THEMED } from '../../../data/affixes.js';
import { getArmorType, getWeaponType, canEquipByType, ARMOR_TYPE_LABEL, WEAPON_TYPE_LABEL, ARMOR_TYPE_ARCHETYPES, WEAPON_TYPE_ARCHETYPES } from './item_class_rules.js';
import {
  ICON_MAP, MONSTER_DROPS, CRAFTING_RECIPES, SHOP_INVENTORY,
  ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES,
  getZoneDropTier, rollRarity, rollDrop, rollDropLegacy, getMysticRotation, rollItemWithRarity
} from './recipes_drops.js';
import { ELEMENT_OPPOSITES, ELEMENTAL_STONES, LIFE_STONE_ITEMS, BELT_ITEMS, getAttributeDamageBonus } from './attributes_belts.js';
import { SOUL_CRYSTAL_ITEMS } from './soul_crystals.js';
import { SPELLBOOK_ITEMS, CRYSTAL_ITEMS } from '../spellbooks.js';
import { RAID_BOSSES } from '../raids.js';
import { CANONICAL_RESOURCES } from '../../services/lifeActivities/ResourceDictionary.js';
import { FISH_CATALOG } from '../fishing.js';
import { PREY_CATALOG } from '../hunting.js';

// Normaliza recursos canônicos de Life Activities para o catálogo oficial ALL_ITEMS
const CANONICAL_RESOURCE_ITEMS = {};
if (typeof CANONICAL_RESOURCES === 'object' && CANONICAL_RESOURCES) {
  for (const [id, r] of Object.entries(CANONICAL_RESOURCES)) {
    CANONICAL_RESOURCE_ITEMS[id] = {
      id: r.itemId || id,
      itemId: r.itemId || id,
      name: r.name,
      slot: 'material',
      category: r.category || 'material',
      grade: r.grade || 'none',
      tier: r.grade === 's' ? 5 : r.grade === 'a' ? 4 : r.grade === 'b' ? 3 : r.grade === 'c' ? 2 : 1,
      stack: 99999,
      price: r.price || 50,
      icon: r.icon,
      desc: r.desc || ('Recurso canônico: ' + r.name)
    };
  }
}

const FISH_ITEMS = {};
if (typeof FISH_CATALOG === 'object' && FISH_CATALOG) {
  for (const [id, f] of Object.entries(FISH_CATALOG)) {
    FISH_ITEMS[id] = {
      id: f.id || id,
      itemId: f.id || id,
      name: f.name,
      slot: 'material',
      category: 'fish',
      rarity: f.rarity || 'common',
      grade: f.rarity === 'legendary' ? 's' : f.rarity === 'epic' ? 'a' : f.rarity === 'rare' ? 'b' : f.rarity === 'uncommon' ? 'c' : 'none',
      tier: f.rarity === 'legendary' ? 5 : f.rarity === 'epic' ? 4 : f.rarity === 'rare' ? 3 : f.rarity === 'uncommon' ? 2 : 1,
      stack: 99999,
      price: f.sellPrice || 30,
      icon: f.icon || '🐟',
      desc: `Peixe fresco de águas de Aden. Pode ser trocado na Feira dos Pescadores por insumos de forja ou vendido.`
    };
  }
}

const PREY_ITEMS = {};
if (typeof PREY_CATALOG === 'object' && PREY_CATALOG) {
  for (const [id, p] of Object.entries(PREY_CATALOG)) {
    PREY_ITEMS[id] = {
      id: p.id || id,
      itemId: p.id || id,
      name: p.name,
      slot: 'material',
      category: 'prey',
      rarity: p.rarity || 'common',
      grade: p.rarity === 'legendary' ? 's' : p.rarity === 'epic' ? 'a' : p.rarity === 'rare' ? 'b' : p.rarity === 'uncommon' ? 'c' : 'none',
      tier: p.rarity === 'legendary' ? 5 : p.rarity === 'epic' ? 4 : p.rarity === 'rare' ? 3 : p.rarity === 'uncommon' ? 2 : 1,
      stack: 99999,
      price: p.sellPrice || 35,
      icon: p.icon || '🥩',
      desc: `Carcaça de caça silvestre (${p.weightRange || 'peso variado'}). Pode ser desfeita por esfoladores ou vendida.`
    };
  }
}

export const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...RINGS,
  ...LEGS, ...SHIELDS, ...BELTS, ...CLOAKS, ...SIGILS, ...NECKLACES,
  ...EARRINGS, ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS,
  ...HEIRLOOM_ITEMS,
  ...SOUL_CRYSTAL_ITEMS,
  ...SPELLBOOK_ITEMS,
  ...CRYSTAL_ITEMS,
  ...ELEMENTAL_STONES,
  ...LIFE_STONE_ITEMS,
  ...BELT_ITEMS,
  ...CANONICAL_RESOURCE_ITEMS,
  ...FISH_ITEMS,
  ...PREY_ITEMS
};

if (typeof window !== 'undefined') {
  window.GameData = {
    ...(window.GameData || {}),
    ARMOR_SETS, ICON_MAP, RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
    CONSUMABLES, MATERIALS, ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES, getZoneDropTier, rollRarity, rollDrop,
    rollDropLegacy, getMysticRotation, rollItemWithRarity, rollAffixes, rollAffixesForItem,
    AFFIX_MAP, AFFIX_POOL, AFFIX_POOLS_THEMED,
    getArmorType, getWeaponType, canEquipByType,
    ARMOR_TYPE_LABEL, WEAPON_TYPE_LABEL, ARMOR_TYPE_ARCHETYPES, WEAPON_TYPE_ARCHETYPES,
    ELEMENT_OPPOSITES, ELEMENTAL_STONES, getAttributeDamageBonus,
    RAID_BOSSES
  };

  window.ALL_ITEMS = ALL_ITEMS;
  window.MONSTER_DROPS = MONSTER_DROPS;
}

export {
  RARITY, SLOT, ARMOR_SETS, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
  LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
  CONSUMABLES, MATERIALS, ICON_MAP, MONSTER_DROPS, CRAFTING_RECIPES, SHOP_INVENTORY,
  ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES, getZoneDropTier, rollRarity,
  rollDrop, rollDropLegacy, getMysticRotation, rollItemWithRarity, rollAffixes, rollAffixesForItem,
  AFFIX_MAP, AFFIX_POOL, AFFIX_POOLS_THEMED,
  getArmorType, getWeaponType, canEquipByType,
  ARMOR_TYPE_LABEL, WEAPON_TYPE_LABEL, ARMOR_TYPE_ARCHETYPES, WEAPON_TYPE_ARCHETYPES,
  ELEMENT_OPPOSITES, ELEMENTAL_STONES, getAttributeDamageBonus
};
