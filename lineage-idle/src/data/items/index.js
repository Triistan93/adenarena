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
  ...BELT_ITEMS
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
