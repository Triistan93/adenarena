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
import { rollAffixes, AFFIX_MAP, AFFIX_POOL } from '../../../data/affixes.js';
import {
  ICON_MAP, MONSTER_DROPS, CRAFTING_RECIPES, SHOP_INVENTORY,
  ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES,
  getZoneDropTier, rollRarity, rollDrop, rollDropLegacy, getMysticRotation, rollItemWithRarity
} from './recipes_drops.js';

export const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...RINGS,
  ...LEGS, ...SHIELDS, ...BELTS, ...CLOAKS, ...SIGILS, ...NECKLACES,
  ...EARRINGS, ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS
};

if (typeof window !== 'undefined') {
  window.GameData = {
    ...(window.GameData || {}),
    ARMOR_SETS, ICON_MAP, RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
    CONSUMABLES, MATERIALS, ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES, getZoneDropTier, rollRarity, rollDrop,
    rollDropLegacy, getMysticRotation, rollItemWithRarity, rollAffixes, AFFIX_MAP, AFFIX_POOL
  };

  window.ALL_ITEMS = ALL_ITEMS;
  window.MONSTER_DROPS = MONSTER_DROPS;
}

export {
  RARITY, SLOT, ARMOR_SETS, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
  LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
  CONSUMABLES, MATERIALS, ICON_MAP, MONSTER_DROPS, CRAFTING_RECIPES, SHOP_INVENTORY,
  ZONE_GOLD_MULT, MYSTIC_POOL, ZONE_CONSUMABLES, getZoneDropTier, rollRarity,
  rollDrop, rollDropLegacy, getMysticRotation, rollItemWithRarity, rollAffixes,
  AFFIX_MAP, AFFIX_POOL
};
