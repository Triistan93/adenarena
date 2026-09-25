/**
 * GameUI.js — Módulo unificado de interface gráfica do Lineage Idle.
 * Consolida TooltipUI, InventoryUI, StageUI, SkillsUI, ShopUI e AppLayout.
 */

import { D, ALL_EQUIP_SLOTS, TIER_NAMES } from '../core/GameConfig.js';
import { getSellValue } from '../data/economy/economyBalance.js';
import { ALL_ITEMS } from '../data/items/index.js';
import { getState } from '../core/StateManager.js';
import { el, qsa, mkEl, mkNS, updateBar } from '../core/DomHelpers.js';
import {
  getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet,
  toggleSelectItem, selectItemsByFilter, clearItemSelection, getInventoryCount,
  calculateInventoryPressure, organizeInventory, sortInventoryItems,
  getBatchSellPreview, getBatchSalvagePreview, getCrystallizationPreview,
  isItemProtected, isEquipmentItem, addToInventory, removeFromInventory
} from '../services/InventoryService.js';
import {
  resolveEquipSlot, migrateEquipmentSlots, equipItem, unequipItem,
  generateAutoEquipProposal, isTwoHandedWeapon, calculateEquipmentRecommendationScore,
  commitAutoEquipProposal
} from '../services/EquipmentService.js';
import { getCraftLevelReq, getRecipeMaterials, canCraft, getRecipeDef, calculateMaxCraftableQty } from '../services/CraftService.js';
import { rollMysticStock } from '../services/ShopService.js';
import { getArmorType, getWeaponType } from '../data/items/item_class_rules.js';
import { classSatisfies, getClassSkills, checkClassAdvancement, SHARED_SKILL_IDS, getSharedSkills, isMageClass, getSharedSkillIdsForClass, getVisibleSkillsForCharacter, getSkillVisibility, SKILL_VISIBILITY_STATES, getCharacterProgressionState, isSkillAvailableForCharacter, isSkillAllowedForClass } from '../services/CharacterService.js';
import { getClass, getStats, getActiveSetBonuses, getBaseAttributes } from '../engine/StatsEngine.js';
import { CP_WEIGHTS } from '../data/balance/cpBalance.js';
import { getSkillCost } from '../engine/SkillEngine.js';
import { getSkillTreeViewModel, SKILL_TABS, SKILL_CATEGORIES } from '../services/SkillTreeViewModel.js';
import { getSkillIcon, getSkillSemanticData } from '../services/SkillIconRegistry.js';
import { getLoadout, equipSkill, unequipSkill, isSkillEquipped, getEquippedSkillIds, autoEquipLoadout, getSkillSlot, getSkillCondition, setSkillCondition, clearSkillCondition, getConditionBadgeText } from '../services/SkillLoadoutService.js';
import { getUnlockedSlots, getSlotUnlockLevel, getProgressionLabel, ALL_SLOT_NAMES } from '../data/balance/SkillUnlockSchedule.js';
import { getSkillSlotCategory, getSlotLabel, isPurgedSkill } from '../services/SkillTagService.js';
import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { getZoneProgression } from '../data/balance/progressionBalance.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { ZONE_CONSUMABLES, MONSTER_DROPS, getZoneDropTier } from '../data/items/recipes_drops.js';
import { RAID_BOSSES } from '../data/raids.js';
import { getRaidStatus } from '../services/RaidService.js';
import { INFINITY_WEAPONS, HEROIC_SKILLS, OLYMPIAD_GLADIATORS, OLYMPIAD_SHOP_CATALOG } from '../data/olympiad.js';
import { NOBLESSE_QUEST_DEFS } from '../data/quests.js';
import { NoblesseService } from '../services/NoblesseService.js';
import { OlympiadService } from '../services/OlympiadService.js';
import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../data/clan.js';
import { CASTLES, CASTLE_SHOP_CATALOG } from '../data/castles.js';
import { ClanService, CLAN_HALL_BUFFS } from '../services/ClanService.js';
import { ENCHANT_ROUTES, getEnchantLevelData, ENCHANT_ITEMS } from '../data/skill_enchant.js';
import { SkillEnchantService } from '../services/SkillEnchantService.js';
import { LIFE_STONES, ITEM_SKILLS } from '../data/augmentation.js';
import { AugmentationService } from '../services/AugmentationService.js';
import { FACTIONS, SEAL_STONES, SEVEN_SIGNS_BOSSES, MAMMON_BLACKSMITH_SERVICES, MAMMON_MERCHANT_CATALOG } from '../data/seven_signs.js';
import { SevenSignsService } from '../services/SevenSignsService.js';
import { FORTRESSES } from '../data/fortresses.js';
import { BRACELETS, TALISMANS } from '../data/talismans.js';
import { FortressService } from '../services/FortressService.js';
import { DUEL_BET_TIERS, DUEL_OPPONENT_ARCHETYPES, SURVIVAL_WAVES, COLOSSEUM_SHOP_CATALOG } from '../data/colosseum.js';
import { ColosseumService } from '../services/ColosseumService.js';
import { CombatPowerService } from '../services/CombatPowerService.js';
import { EnchantmentService } from '../services/EnchantmentService.js';
import { NextActionAdvisor } from '../services/NextActionAdvisor.js';
import { parseEnchantScroll, isItemCompatibleWithScroll, isEquippableItem } from '../services/ItemClassificationService.js';
import { renderRankingTab, setActiveRankingTab } from './RankingUI.js';
import { renderMarketTab, setActiveMarketTab } from './MarketUI.js';
import { CommunityCapService } from '../services/CommunityCapService.js';
import { AURAS_CATALOG, ITEM_FRAMES_CATALOG, TITLES_CATALOG, CosmeticService } from '../services/CosmeticService.js';
import { AchievementService, ACHIEVEMENTS } from '../services/AchievementService.js';
import { SynthesisService, SYNTHESIS_CONFIG } from '../services/SynthesisService.js';
import { ElementalService, ELEMENT_DEFINITIONS, ELEMENTAL_GRADE_GATING, SOUL_CRYSTAL_GRADE_GATING, getElementalGating, getItemGrade as getElementalItemGrade } from '../services/ElementalService.js';
import { MonsterAIEngine, ARCHETYPE_INFO, HUNTING_DIFFICULTIES } from '../engine/MonsterAIEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';
import { AFFIX_MAP } from '../../data/affixes.js';
import { MercenaryService } from '../services/MercenaryService.js';
import { MERCENARY_RARITIES, MERCENARY_SPECIALIZATIONS, MERCENARY_TRAITS, calculateMercenaryPower, getMercenaryXpForLevel } from '../data/mercenaries.js';
import { EXPEDITION_DESTINATIONS, ExpeditionService } from '../services/ExpeditionService.js';
import { renderForgeRefinery, setRefineryCategory } from './RefineryUI.js';

/* ═══════════════════════════════════════════════════════════════════════════
   1. DOM ROOT & HELPERS
═══════════════════════════════════════════════════════════════════════════ */
export function getRoot() {
  if (typeof document === 'undefined') return null;
  return document.getElementById?.('idle-host')?.shadowRoot || document;
}

export function findElement(id) {
  const root = getRoot();
  return root?.querySelector?.('#' + id) || (typeof document !== 'undefined' ? document.getElementById?.(id) : null);
}

export function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function getItemDef(itemId) {
  const data = D();
  if (!data?.ALL_ITEMS || !itemId) return null;
  if (data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];
  const raw = String(itemId);
  const keys = [
    raw, raw.toLowerCase(),
    raw.replace(/\s+/g, ''), raw.replace(/[-_]/g, '').toLowerCase(),
    raw.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    raw.replace(/_([a-z])/g, (m, c) => c.toUpperCase())
  ];
  for (const k of keys) {
    if (data.ALL_ITEMS[k]) return data.ALL_ITEMS[k];
  }
  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  return Object.values(data.ALL_ITEMS).find(i => i.name?.toLowerCase().replace(/\s+/g, '') === normalized) || null;
}

export function getItemGradeCode(itemDef) {
  if (!itemDef) return 'ng';
  const explicit = String(itemDef.grade || itemDef.tierGrade || '').toLowerCase();
  if (['none', 'no grade', 'nograde', 'ng'].includes(explicit)) return 'ng';
  if (['d', 'c', 'b', 'a', 's'].includes(explicit)) return explicit;
  if (['boss', 'special'].includes(explicit)) return 'boss';
  if (['frostlord', 'frost'].includes(explicit)) return 'frostlord';

  const desc = String(itemDef.desc || itemDef.info || itemDef.name || '').toLowerCase();
  const icon = String(itemDef.icon || '').toLowerCase();

  if (desc.includes('no grade') || desc.includes('(no grade)') || icon.includes('nograde/')) return 'ng';
  if (desc.includes('frost lord') || icon.includes('frost_lord')) return 'frostlord';
  if (desc.includes('(special') || desc.includes('(boss') || icon.includes('gradespecial/')) return 'boss';
  if (desc.includes('(s grade)') || icon.includes('grades/')) return 's';
  if (desc.includes('(a grade)') || icon.includes('gradea/')) return 'a';
  if (desc.includes('(b grade)') || icon.includes('gradeb/')) return 'b';
  if (desc.includes('(c grade)') || icon.includes('gradec/')) return 'c';
  if (desc.includes('(d grade)') || icon.includes('graded/')) return 'd';

  const tier = Number(itemDef.tier) || 0;
  const reqLvl = Number(itemDef.req?.level || itemDef.reqLvl || 0);

  if (tier === 1 || reqLvl < 20) return 'ng';
  if (tier === 2 || (reqLvl >= 20 && reqLvl < 40)) return 'd';
  if (tier === 3 || (reqLvl >= 40 && reqLvl < 52)) return 'c';
  if (tier === 4 || (reqLvl >= 52 && reqLvl < 61)) return 'b';
  if (tier === 5 || (reqLvl >= 61 && reqLvl < 76)) return 'a';
  if (tier === 6 || (reqLvl >= 76 && reqLvl < 80)) return 's';
  if (tier >= 7 || reqLvl >= 80) return 'frostlord';

  return 'ng';
}

export function getItemGrade(itemDef) {
  const code = getItemGradeCode(itemDef);
  switch (code) {
    case 'd':
      return { code: 'd', label: 'D-Grade', color: '#60a5fa' };
    case 'c':
      return { code: 'c', label: 'C-Grade', color: '#4ade80' };
    case 'b':
      return { code: 'b', label: 'B-Grade', color: '#f59e0b' };
    case 'a':
      return { code: 'a', label: 'A-Grade', color: '#a855f7' };
    case 's':
      return { code: 's', label: 'S-Grade', color: '#ef4444' };
    case 'boss':
      return { code: 'boss', label: 'Boss/Épico', color: '#ec4899' };
    case 'frostlord':
      return { code: 'frostlord', label: 'Frost Lord', color: '#38bdf8' };
    case 'ng':
    default:
      return { code: 'ng', label: 'No-Grade', color: '#9ca3af' };
  }
}

export { calculateMaxCraftableQty };
if (typeof window !== 'undefined') {
  window.calculateMaxCraftableQty = calculateMaxCraftableQty;
  window.getItemGrade = getItemGrade;
  window.getItemGradeCode = getItemGradeCode;
}

/* ═══════════════════════════════════════════════════════════════════════════
   2. TOOLTIP & ICON HELPERS
═══════════════════════════════════════════════════════════════════════════ */
export function getAssetUrl(p) {
  if (!p) return '';
  p = String(p).replace(/\\/g, '/');
  if (p.includes('water_wave.jpg')) p = '/assets/2d/icons/shields-amulets/PNG/Background/Icon15.png';
  else if (p.includes('fire_strike.jpg')) p = '/assets/skills/icons/flame_strike.png';
  else if (p.includes('wind_blade.jpg')) p = '/assets/skills/icons/tornado_vortex.png';
  else if (p.includes('holy_shield.jpg')) p = '/assets/skills/icons/shield_of_light.png';
  else if (p.includes('vampiric_blood.jpg')) p = '/assets/skills/icons/vampiric_pulse.png';

  if (!p.includes('/') && (p.endsWith('.png') || p.endsWith('.jpg'))) {
    p = `/assets/skills/icons/${p}`;
  }

  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) return p;
  const cleanPath = p.replace(/^\//, '');
  let baseUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  } else if (typeof window !== 'undefined' && window.__BASE_URL__) {
    baseUrl = window.__BASE_URL__;
  }
  if (baseUrl) {
    if (!baseUrl.endsWith('/')) baseUrl += '/';
    return baseUrl + cleanPath;
  }
  return '/' + cleanPath;
}

const HEIRLOOM_ICON_MAP = {
  weapon_heirloom_sword: 'gradec/weapons/weapon_samurai_longsword.png',
  weapon_heirloom_spear: 'gradec/weapons/weapon_spiked_spear.png',
  weapon_heirloom_dagger: 'gradec/weapons/weapon_darkelven_dagger.png',
  weapon_heirloom_bow: 'gradec/weapons/weapon_eminence_bow.png',
  weapon_heirloom_staff: 'gradec/weapons/weapon_crystal_staff.png',
  weapon_heirloom_duals: 'gradec/weapons/weapon_dual_revolution_sword.png',
  weapon_heirloom_blunt: 'gradec/weapons/weapon_big_hammer.png',
  armor_heirloom_chest_heavy: 'gradec/armors/armor_full_plate_heavy_armor.png',
  armor_heirloom_legs_heavy: 'gradec/armors/armor_plated_leather_light_pants.png',
  armor_heirloom_helmet_heavy: 'gradec/armors/armor_full_plate_heavy_helmet.png',
  armor_heirloom_gloves_heavy: 'gradec/armors/armor_full_plate_heavy_gloves.png',
  armor_heirloom_boots_heavy: 'gradec/armors/armor_full_plate_heavy_boots.png',
  armor_heirloom_chest_light: 'gradec/armors/armor_theca_light_armor.png',
  armor_heirloom_legs_light: 'gradec/armors/armor_theca_light_pants.png',
  armor_heirloom_helmet_light: 'gradec/armors/armor_theca_light_helmet.png',
  armor_heirloom_gloves_light: 'gradec/armors/armor_theca_light_gloves.png',
  armor_heirloom_boots_light: 'gradec/armors/armor_theca_light_boots.png',
  armor_heirloom_chest_robe: 'gradec/armors/armor_karmian_robe_armor.png',
  armor_heirloom_legs_robe: 'gradec/armors/armor_karmian_robe_pants.png',
  armor_heirloom_helmet_robe: 'gradec/armors/armor_karmian_helmet.png',
  armor_heirloom_gloves_robe: 'gradec/armors/armor_karmian_robe_gloves.png',
  armor_heirloom_boots_robe: 'gradec/armors/armor_karmian_robe_boots.png',
  armor_heirloom_chest: 'gradec/armors/armor_full_plate_heavy_armor.png',
  armor_heirloom_legs: 'gradec/armors/armor_plated_leather_light_pants.png',
  armor_heirloom_helmet: 'gradec/armors/armor_full_plate_heavy_helmet.png',
  armor_heirloom_gloves: 'gradec/armors/armor_full_plate_heavy_gloves.png',
  armor_heirloom_boots: 'gradec/armors/armor_full_plate_heavy_boots.png',
  shield_heirloom_aegis: 'gradec/armors/armor_full_plate_shield.png',
  jewelry_heirloom_necklace: 'gradec/jewels/jewel_blessed_necklace.png',
  jewelry_heirloom_earring_1: 'gradec/jewels/jewel_blessed_earing.png',
  jewelry_heirloom_earring_2: 'gradec/jewels/jewel_blessed_earing.png',
  jewelry_heirloom_ring_1: 'gradec/jewels/jewel_blessed_ring.png',
  jewelry_heirloom_ring_2: 'gradec/jewels/jewel_blessed_ring.png',
  cloak_heirloom_royal: 'gradec/armors/armor_full_plate_cloack.png',
  belt_heirloom_champion: 'gradec/armors/armor_full_plate_belt.png',
  hair_heirloom_crown: 'acessories/noble_gold_crown.png',
  book_1star: 'spellbooks/spellbook_1star.png',
  book_2star: 'spellbooks/spellbook_2star.png',
  book_3star: 'spellbooks/spellbook_3star.png',
  book_4star: 'spellbooks/spellbook_4star.png',
  spellbook_1star: 'spellbooks/spellbook_1star.png',
  spellbook_2star: 'spellbooks/spellbook_2star.png',
  spellbook_3star: 'spellbooks/spellbook_3star.png',
  spellbook_4star: 'spellbooks/spellbook_4star.png',
  crystal_d: 'materials/crystal_blue_d.png',
  crystal_c: 'materials/crystal_green_c.png',
  crystal_b: 'materials/crystal_red_b.png',
  crystal_a: 'materials/crystal_silver_a.png',
  crystal_s: 'materials/crystal_gold_s.png',
  scroll_of_resurrection: 'scrolls/scroll_of_resurrection.png',
  scroll_of_rebirth: 'scrolls/scroll_of_rebirth.png',
  enchant_weapon_scroll: 'scrolls/scroll_of_enchant_weapon_.png',
  enchant_armor_scroll: 'scrolls/scroll_of_enchant_armor.png',
  scroll_of_enchant_weapon_: 'scrolls/scroll_of_enchant_weapon_.png',
  scroll_of_enchant_weapon: 'scrolls/scroll_of_enchant_weapon_.png',
  scroll_of_enchant_armor: 'scrolls/scroll_of_enchant_armor.png',
  teleport_scroll: 'scrolls/teleport_scroll.png'
};

export function isEmojiIcon(icon) {
  if (!icon || typeof icon !== 'string') return false;
  if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(icon) || icon.includes('/')) return false;
  return /\p{Extended_Pictographic}/u.test(icon) || !/[a-zA-Z0-9]/.test(icon);
}

export function getItemIconUrl(itemOrDef, defParam) {
  if (!itemOrDef && !defParam) return null;
  const gData = D();
  const all = gData?.ALL_ITEMS || {};
  let def = defParam;
  let itemId = '';

  if (typeof itemOrDef === 'string') {
    itemId = itemOrDef;
    if (!def) def = all[itemId];
  } else if (itemOrDef) {
    itemId = itemOrDef.itemId || itemOrDef.id || '';
    if (!def) def = all[itemId] || itemOrDef;
  }

  // Prioridade 1: Mapeamento de Herança e Livros de Habilidade resiliente
  if (HEIRLOOM_ICON_MAP[itemId] || HEIRLOOM_ICON_MAP[def?.id]) {
    const matchedPath = HEIRLOOM_ICON_MAP[itemId] || HEIRLOOM_ICON_MAP[def?.id];
    return getAssetUrl(`img/icons/${matchedPath}`);
  }

  const iconIndex = (typeof window !== 'undefined' && window.IconIndex)
    ? window.IconIndex
    : (gData?.ICON_MAP || {});

  let rawPath = def?.icon || '';

  if (rawPath && isEmojiIcon(rawPath)) {
    rawPath = '';
  }

  if (!rawPath && itemId) {
    const cleanId = String(itemId).trim();
    rawPath = iconIndex[cleanId]
      || iconIndex[`weapon_${cleanId}`]
      || iconIndex[`armor_${cleanId}`]
      || iconIndex[`jewel_${cleanId}`]
      || iconIndex[`shield_${cleanId}`]
      || iconIndex[cleanId.replace(/^(weapon_|armor_|jewel_|shield_|consumable_|material_|scroll_)/, '')]
      || '';
  }

  if (rawPath && isEmojiIcon(rawPath)) {
    rawPath = '';
  }

  // Se o item define emoji ou não possui ícone registrado, nunca crie URLs 404 para emojis
  if (!rawPath && def?.icon && isEmojiIcon(def.icon)) {
    return null;
  }

  if (!rawPath && itemId) {
    const clean = String(itemId).trim().toLowerCase();
    if (clean.includes('resurrection')) rawPath = 'scrolls/scroll_of_resurrection.png';
    else if (clean.includes('enchant_weapon')) rawPath = 'scrolls/scroll_of_enchant_weapon_.png';
    else if (clean.includes('enchant_armor')) rawPath = 'scrolls/scroll_of_enchant_armor.png';
    else if (clean.includes('teleport')) rawPath = 'scrolls/teleport_scroll.png';
    else if (clean.includes('rebirth')) rawPath = 'scrolls/scroll_of_rebirth.png';
    else {
      return null;
    }
  }

  if (rawPath) {
    let p = String(rawPath).replace(/\\/g, '/').replace(/^\//, '');
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
      return p;
    }
    if (!p.endsWith('.png') && !p.endsWith('.jpg') && !p.endsWith('.webp') && !p.endsWith('.svg')) {
      p += '.png';
    }
    if (!p.startsWith('img/icons/') && !p.startsWith('img/') && !p.startsWith('assets/') && !p.startsWith('icons/')) {
      p = `img/icons/${p}`;
    }
    return getAssetUrl(p);
  }

  return null;
}

export function getItemIcon(defOrId) {
  if (!defOrId) return '📦';
  const gData = D();
  const all = gData?.ALL_ITEMS || {};
  const def = (typeof defOrId === 'string') ? (all[defOrId] || null) : (defOrId.itemId ? all[defOrId.itemId] : defOrId);
  const slot = def?.slot || (typeof defOrId === 'object' ? defOrId.slot : '') || '';
  const fallbackIcons = {
    weapon: '⚔️', armor: '🛡️', helmet: '🪖', gloves: '🧤', boots: '👢',
    ring: '💍', earring: '💎', necklace: '📿', consumable: '🧪', material: '💎',
    scroll: '📜', cloak: '🧣', cape: '🧣', belt: '🎗️', hair: '👑', agathion: '👼',
    crystal: '🔮'
  };
  const emoji = (def?.icon && isEmojiIcon(def.icon)) ? def.icon : (fallbackIcons[slot] || '📦');

  const iconUrl = getItemIconUrl(defOrId, def);
  if (!iconUrl) {
    return `<span class="inventory-item-emoji" style="display:inline-block; font-size:16px; line-height:1; vertical-align:middle;">${emoji}</span>`;
  }

  return `<img src="${iconUrl}" alt="${def?.name || ''}" class="inventory-item-image" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:24px; height:24px; object-fit:contain; vertical-align:middle; pointer-events:none;" /><span class="inventory-item-emoji" style="display:none; font-size:16px;">${emoji}</span>`;
}

export function formatItemDisplayName(item, def) {
  if (!item) return '';
  const itemObj = (typeof item === 'string') ? { itemId: item } : item;
  const gData = D();
  const itemDef = def || (gData?.ALL_ITEMS ? gData.ALL_ITEMS[itemObj.itemId || itemObj.id] : null);
  const baseName = itemDef ? itemDef.name : (itemObj.itemId || itemObj.id || 'Item');

  const enchant = Number(itemObj.enchant) || 0;
  const enchantStr = enchant > 0 ? `+${enchant} ` : '';
  const foundationStr = itemObj.foundation ? ' Foundation' : '';
  const rarity = itemObj.rarity;
  let rarityStr = '';
  if (rarity && rarity !== 'common' && gData?.RARITY && gData.RARITY[rarity]) {
    rarityStr = ` [${gData.RARITY[rarity].name}]`;
  }

  return `${enchantStr}${baseName}${foundationStr}${rarityStr}`;
}

export function showItemTooltip(arg1, arg2, state, callbacks = {}) {
  let e = null;
  let item = null;

  if (arg1 && (arg1 instanceof Event || arg1.clientX !== undefined || arg1.pageX !== undefined || arg1.target !== undefined)) {
    e = arg1;
    item = arg2;
  } else if (arg2 && (arg2 instanceof Event || arg2.clientX !== undefined || arg2.pageX !== undefined || arg2.target !== undefined)) {
    e = arg2;
    item = arg1;
  } else {
    item = arg1 || arg2;
  }

  const tooltip = findElement('item-tooltip');
  if (!tooltip || !item) return;

  if (typeof item === 'string') {
    item = { itemId: item, rarity: 'common' };
  }

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  const displayName = formatItemDisplayName(item, def);
  const rarity = item.rarity || 'common';
  const rarityDef = gData?.RARITY?.[rarity] || {};
  const rarityName = rarityDef.name || rarity;
  const rarityColor = rarityDef.color || '#c8a84e';
  const mult = rarityDef.mult || 1;

  const RARITY_GLOW = {
    common:    'none',
    uncommon:  '0 0 8px rgba(16,185,129,0.5)',
    rare:      '0 0 10px rgba(59,130,246,0.5)',
    epic:      '0 0 12px rgba(168,85,247,0.6)',
    legendary: '0 0 16px rgba(245,158,11,0.7)',
  };
  const RARITY_BG = {
    common:    'rgba(30,25,20,0.95)',
    uncommon:  'rgba(16,40,30,0.95)',
    rare:      'rgba(15,25,50,0.95)',
    epic:      'rgba(30,15,50,0.95)',
    legendary: 'rgba(45,30,5,0.97)',
  };

  // ─── Stats base diretos com Comparativo Delta ────────────────────────────
  const STAT_KEYS = [
    'atk', 'def', 'matk', 'mdef', 'hp', 'mp', 'eva', 'crit', 'speed', 'lifesteal',
    'hit', 'atkSpeed', 'castSpeed', 'weightBonus', 'invSlots', 'xpBoost',
    'stunChance', 'stunResist', 'blockRate', 'hpRegen', 'mpRegen', 'critDmg', 'aoeTargets'
  ];
  const STAT_LABEL = {
    atk: 'P.ATK', def: 'P.DEF', matk: 'M.ATK', mdef: 'M.DEF', hp: 'HP Máximo', mp: 'MP Máximo',
    eva: 'Evasão', crit: 'Taxa Crítica', speed: 'Velocidade', lifesteal: 'Roubo de Vida',
    hit: 'Precisão', atkSpeed: 'Atk Speed', castSpeed: 'Cast Speed', weightBonus: 'Capacidade de Carga',
    invSlots: 'Slots de Mochila', xpBoost: 'Bônus de XP', stunChance: 'Chance de Stun',
    stunResist: 'Resistência a Stun', blockRate: 'Taxa de Bloqueio', hpRegen: 'Regen HP/s',
    mpRegen: 'Regen MP/s', critDmg: 'Dano Crítico', aoeTargets: 'Alvos em Área'
  };

  if (!state || typeof state !== 'object') {
    state = (typeof window !== 'undefined' && window.state) ? window.state : {};
  }
  if (!callbacks.unequipItem && typeof window !== 'undefined' && typeof window.unequipItem === 'function') {
    callbacks.unequipItem = window.unequipItem;
  }
  if (!callbacks.equipItem && typeof window !== 'undefined' && typeof window.equipItem === 'function') {
    callbacks.equipItem = window.equipItem;
  }

  const enchant = item.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.12 : (0.36 + (enchant - 3) * 0.15));
  const foundationMult = item.foundation ? 1.3 : 1;
  const currentLvl = state?.level || 1;
  const isHeirloom = !!(def.isHeirloom || item.isHeirloom);

  // Calcula atributos ativos (com suporte dinâmico a Herança e múltiplos formatos de dados)
  let activeItemStats = {
    ...(def.base || {}),
    ...(def.stats || {}),
    ...(def.bonuses || {}),
    ...def
  };
  if (isHeirloom) {
    if (def.heirloomScaling) {
      if (currentLvl <= 19 && def.heirloomScaling.phase1) {
        activeItemStats = { ...activeItemStats, ...(def.heirloomScaling.phase1.stats || {}) };
      } else if (currentLvl <= 39 && def.heirloomScaling.phase2) {
        activeItemStats = { ...activeItemStats, ...(def.heirloomScaling.phase2.stats || {}) };
      } else {
        activeItemStats = { ...activeItemStats, ...(def.heirloomScaling.phase3?.stats || def.base || {}) };
      }
    } else if (def.base) {
      activeItemStats = { ...activeItemStats, ...def.base };
    }
  }

  // Comparativo contra o item atualmente equipado
  let equippedStats = null;
  if (!item.equipped && state && state.equipment && def.slot) {
    const { resolveEquipSlot } = (typeof window !== 'undefined' && window.GameData) ? window.GameData : {};
    const targetSlot = resolveEquipSlot ? resolveEquipSlot(def.slot, state.equipment) : def.slot;
    const eqUid = state.equipment[targetSlot];
    if (eqUid) {
      const eqItem = state.inventory?.find(i => i.uid === eqUid);
      const eqDef = eqItem ? gData?.ALL_ITEMS?.[eqItem.itemId] : null;
      if (eqDef) {
        const eqMult = eqItem.rarity ? (gData?.RARITY?.[eqItem.rarity]?.mult || 1) : 1;
        const eqEnc = eqItem.enchant || 0;
        const eqEncMult = 1 + (eqEnc <= 3 ? eqEnc * 0.12 : (0.36 + (eqEnc - 3) * 0.15));
        const eqFoundMult = eqItem.foundation ? 1.3 : 1;
        let eqActiveStats = { ...eqDef };
        if (eqDef.isHeirloom || eqItem.isHeirloom) {
          if (eqDef.heirloomScaling) {
            if (currentLvl <= 19 && eqDef.heirloomScaling.phase1) {
              eqActiveStats = { ...eqActiveStats, ...(eqDef.heirloomScaling.phase1.stats || {}) };
            } else if (currentLvl <= 39 && eqDef.heirloomScaling.phase2) {
              eqActiveStats = { ...eqActiveStats, ...(eqDef.heirloomScaling.phase2.stats || {}) };
            } else {
              eqActiveStats = { ...eqActiveStats, ...(eqDef.heirloomScaling.phase3?.stats || eqDef.base || {}) };
            }
          } else if (eqDef.base) {
            eqActiveStats = { ...eqActiveStats, ...eqDef.base };
          }
        }
        equippedStats = {};
        for (const s of STAT_KEYS) {
          if (eqActiveStats[s] !== undefined && eqActiveStats[s] !== null) {
            equippedStats[s] = Math.floor(Number(eqActiveStats[s]) * eqMult * eqEncMult * eqFoundMult);
          }
        }
      }
    }
  }

  let statsHtml = '';
  for (const s of STAT_KEYS) {
    if (activeItemStats[s] !== undefined && activeItemStats[s] !== null && activeItemStats[s] !== 0) {
      const isPercent = s === 'crit' || s === 'stunChance' || s === 'stunResist' || s === 'blockRate' || s === 'xpBoost' || s === 'critDmg';
      const rawVal = Number(activeItemStats[s]);
      let v = rawVal;
      if (!isPercent) {
        v = Math.floor(rawVal * mult * enchantMult * foundationMult);
      } else {
        v = rawVal <= 1 ? Math.round(rawVal * 100) : rawVal;
      }
      const suffix = isPercent ? '%' : '';
      let deltaHtml = '';
      if (equippedStats !== null) {
        const eqV = equippedStats[s] || 0;
        const diff = v - eqV;
        if (diff > 0) deltaHtml = `<span style="color:#4ade80;font-size:10px;font-weight:bold;margin-left:5px;">(+${diff}${suffix})</span>`;
        else if (diff < 0) deltaHtml = `<span style="color:#ef4444;font-size:10px;font-weight:bold;margin-left:5px;">(${diff}${suffix})</span>`;
      }
      statsHtml += `<div style="display:flex;justify-content:space-between;font-size:11px;margin:2px 0;">`
        + `<span style="color:#cbd5e1;">${STAT_LABEL[s] || s.toUpperCase()}</span>`
        + `<div><span style="color:#fcd34d;font-weight:700;">+${v}${suffix}</span>${deltaHtml}</div>`
        + `</div>`;
    }
  }
  const statsStr = statsHtml
    ? `<div style="margin:8px 0 4px;padding:6px 0;border-top:1px solid rgba(255,255,255,0.12);border-bottom:1px solid rgba(255,255,255,0.08);">${statsHtml}</div>`
    : '';

  // ─── Set Bonus Preview (Visualização de Bônus de Conjunto) ───────────────
  let setBonusStr = '';
  const armorSets = gData?.ARMOR_SETS || {};
  for (const [setKey, setDef] of Object.entries(armorSets)) {
    if (!setDef) continue;
    let isSetPiece = false;
    if (setDef.pieces && Object.values(setDef.pieces).includes(def.id)) isSetPiece = true;
    if (!isSetPiece && setDef.variantPieces) {
      for (const list of Object.values(setDef.variantPieces)) {
        if (Array.isArray(list) && list.includes(def.id)) { isSetPiece = true; break; }
      }
    }
    if (!isSetPiece && setDef.shieldPiece && setDef.shieldPiece === def.id) isSetPiece = true;

    if (isSetPiece) {
      let equippedCount = 0;
      let hasShield = false;
      const totalReq = setDef.fullPieceCount || 5;

      if (state && state.equipment && state.inventory) {
        const slots = ['armor', 'helmet', 'boots', 'gloves', 'legs'];
        for (const slot of slots) {
          const uid = state.equipment[slot];
          if (!uid) continue;
          const eqItem = state.inventory.find(i => i.uid === uid);
          if (!eqItem) continue;
          const eqDef = gData?.ALL_ITEMS?.[eqItem.itemId];
          if (!eqDef) continue;
          const id = eqDef.id;
          let matched = false;
          if (setDef.pieces && Object.values(setDef.pieces).includes(id)) matched = true;
          if (!matched && setDef.variantPieces) {
            for (const list of Object.values(setDef.variantPieces)) {
              if (Array.isArray(list) && list.includes(id)) { matched = true; break; }
            }
          }
          if (matched) equippedCount++;
        }
        if (setDef.shieldPiece && state.equipment.shield) {
          const shItem = state.inventory.find(i => i.uid === state.equipment.shield);
          if (shItem && gData?.ALL_ITEMS?.[shItem.itemId]?.id === setDef.shieldPiece) hasShield = true;
        }
      }

      let bonusLines = [];
      if (setDef.bonuses) {
        for (const [reqP, bObj] of Object.entries(setDef.bonuses)) {
          const isReqActive = (equippedCount >= Number(reqP)) || (reqP === String(totalReq + 1) && hasShield && equippedCount >= totalReq);
          const color = isReqActive ? '#4ade80' : '#888888';
          const parts = [];
          if (bObj.xpBoost) parts.push(`+${Math.round(bObj.xpBoost * 100)}% XP`);
          if (bObj.goldBoost || bObj.adenaBoost) parts.push(`+${Math.round((bObj.goldBoost || bObj.adenaBoost) * 100)}% Adena`);
          if (bObj.atk) parts.push(`+${bObj.atk} P.Atk`);
          if (bObj.def) parts.push(`+${bObj.def} P.Def`);
          if (bObj.matk) parts.push(`+${bObj.matk} M.Atk`);
          if (bObj.mdef) parts.push(`+${bObj.mdef} M.Def`);
          if (bObj.hp) parts.push(`+${bObj.hp} HP`);
          if (bObj.mp) parts.push(`+${bObj.mp} MP`);
          if (bObj.eva) parts.push(`+${bObj.eva} Eva`);
          if (bObj.crit) parts.push(`+${bObj.crit}% Crit`);
          if (bObj.speed) parts.push(`+${bObj.speed} Spd`);
          if (bObj.primary) {
            for (const [pk, pv] of Object.entries(bObj.primary)) {
              parts.push(`+${pv} ${pk.toUpperCase()}`);
            }
          }
          bonusLines.push(`<div style="color:${color}; font-size:10px; margin:1px 0;">• (${reqP} pçs): ${parts.join(', ')}</div>`);
        }
      }

      setBonusStr = `<div style="margin-top:6px; padding-top:4px; border-top:1px dashed rgba(212,167,68,0.4);">
        <div style="font-size:11px; font-weight:bold; color:#f4d58a; display:flex; justify-content:space-between; margin-bottom:2px;">
          <span>🛡️ Set ${setDef.name}</span>
          <span style="color:${equippedCount >= 2 ? '#4ade80' : '#d4a744'}; font-size:10px;">(${equippedCount}/${totalReq} equipados)</span>
        </div>
        ${bonusLines.join('')}
      </div>`;
      break;
    }
  }

  // ─── Afixos especiais ─────────────────────────────────────────────────────
  let affixesStr = '';
  if (item.affixes && item.affixes.length > 0) {
    const affixLines = item.affixes.map(a => {
      const affDef = (typeof AFFIX_MAP !== 'undefined' ? AFFIX_MAP[a.id] : null) || (gData?.AFFIX_MAP || {})[a.id] || (typeof window !== 'undefined' && window.GameData?.AFFIX_MAP?.[a.id]);
      if (affDef && affDef.name) {
        const label = affDef.name.replace('{value}', a.value ?? a.val ?? '');
        return `<div style="color:#f0cd7e;font-size:11px;font-weight:600;margin:1px 0;">✦ ${label}</div>`;
      } else if (a.name) {
        return `<div style="color:#f0cd7e;font-size:11px;font-weight:600;margin:1px 0;">✦ ${a.name}: +${a.value}</div>`;
      }
      return '';
    }).filter(Boolean);
    if (affixLines.length > 0) {
      affixesStr = `<div style="margin-top:6px;padding-top:4px;border-top:1px dashed ${rarityColor}50;">`
        + `<div style="font-size:9px;font-weight:bold;color:${rarityColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">✦ Afixos Especiais</div>`
        + affixLines.join('')
        + `</div>`;
    }
  }

  // ─── Botões de ação (Somente para itens do inventário com UID) ──────────────
  const isInventoryItem = !!item.uid && !item.isForgePreview && !item.inForge;
  let actionsHtml = '';

  if (isInventoryItem) {
    actionsHtml = `<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap;">`;
    const isEquipSlot = ['weapon','armor','helmet','gloves','boots','ring','ring1','ring2','legs','shield',
      'cloak','belt','necklace','earring','earring1','earring2','hair','hair1','hair2','agathion','agathion_bracelet',
      'brooch','talisman_bracelet','talisman','jewel','sigil'].includes(def?.slot);
    const isWeapon = def?.slot === 'weapon' || /weapon|sword|bow|dagger|blunt|staff|spear|dual|twohand/.test(String(def?.slot || ''));
    const isConsumable = ['consumable', 'scroll', 'powerup', 'potion', 'food', 'crystal'].includes(def?.slot);

    let equippedSlot = item.equippedSlot;
    if (!equippedSlot && state?.equipment) {
      for (const [s, u] of Object.entries(state.equipment)) {
        if (u === item.uid) {
          equippedSlot = s;
          item.equippedSlot = s;
          break;
        }
      }
    }
    const isItemEquipped = !!(item.equipped || equippedSlot || (state?.equipment && Object.values(state.equipment).includes(item.uid)));

    if (isEquipSlot || isItemEquipped) {
      if (isItemEquipped) {
        const slotLabel = equippedSlot === 'weapon2' ? 'Slot 2' : (equippedSlot === 'weapon' ? 'Slot 1' : (equippedSlot || 'Item'));
        actionsHtml += `<button data-tt-action="unequip" data-uid="${item.uid}" data-slot="${equippedSlot || def?.slot || ''}"
          style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#5a4020,#2a1a08);border:1px solid #a07030;
          border-radius:4px;color:#e8c870;font-size:11px;cursor:pointer;font-weight:600;">⬆ Desequipar (${slotLabel})</button>`;
      } else if (isWeapon) {
        actionsHtml += `<button data-tt-action="equip" data-slot-target="weapon" data-uid="${item.uid}"
          style="flex:1;padding:5px 6px;background:linear-gradient(180deg,#1a3a5a,#0a1a2a);border:1px solid #3a7ab0;
          border-radius:4px;color:#70c8f8;font-size:10.5px;cursor:pointer;font-weight:600;" title="Equipar no Slot de Arma 1">⚔ Slot 1</button>`;
        actionsHtml += `<button data-tt-action="equip" data-slot-target="weapon2" data-uid="${item.uid}"
          style="flex:1;padding:5px 6px;background:linear-gradient(180deg,#3a1a5a,#1a0a2a);border:1px solid #7a3ab0;
          border-radius:4px;color:#c870f8;font-size:10.5px;cursor:pointer;font-weight:600;" title="Equipar no Slot de Arma 2">🗡 Slot 2</button>`;
      } else {
        actionsHtml += `<button data-tt-action="equip" data-uid="${item.uid}"
          style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#1a3a5a,#0a1a2a);border:1px solid #3a7ab0;
          border-radius:4px;color:#70c8f8;font-size:11px;cursor:pointer;font-weight:600;">🛡 Equipar</button>`;
      }
    }
    const sMeta = parseEnchantScroll(def);
    if (sMeta && sMeta.isScroll) {
      actionsHtml += `<button data-tt-action="enchant-flow" data-uid="${item.uid}"
        style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#7e22ce,#4c1d95);border:1px solid #c084fc;
        border-radius:4px;color:#f3e8ff;font-size:11px;cursor:pointer;font-weight:600;">✨ Encantar</button>`;
    } else if (isConsumable) {
      actionsHtml += `<button data-tt-action="use" data-uid="${item.uid}"
        style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#1a4a2a,#0a2010);border:1px solid #3ab070;
        border-radius:4px;color:#70e898;font-size:11px;cursor:pointer;font-weight:600;">▶ Usar</button>`;
    }
    if (!isItemEquipped) {
      const sellPrice = Math.floor((def.price || 10) * 0.4 * mult);
      actionsHtml += `<button data-tt-action="salvage" data-uid="${item.uid}"
        style="padding:5px 8px;background:linear-gradient(180deg,#4a2a1a,#200a0a);border:1px solid #b04a3a;
        border-radius:4px;color:#f88870;font-size:11px;cursor:pointer;font-weight:600;">🔨 Desmontar</button>`;
      actionsHtml += `<button data-tt-action="sell" data-uid="${item.uid}"
        style="padding:5px 8px;background:linear-gradient(180deg,#4a4a1a,#20200a);border:1px solid #b0b03a;
        border-radius:4px;color:#f8f870;font-size:11px;cursor:pointer;font-weight:600;">💰 Vender (${sellPrice}g)</button>`;
    }
    actionsHtml += `</div>`;
  }

  tooltip.style.background = RARITY_BG[rarity] || RARITY_BG.common;
  tooltip.style.boxShadow  = `${RARITY_GLOW[rarity] || 'none'}, 0 4px 20px rgba(0,0,0,0.8)`;
  tooltip.style.borderColor = rarityColor + '60';

  const tierNum = def.tier || 0;
  const GRADE_MAP = { 0: '', 1: 'No Grade', 2: 'D Grade', 3: 'C Grade', 4: 'B Grade', 5: 'S Grade', 6: 'Frost Lord Grade' };
  const GRADE_COLOR = { 0: '#888', 1: '#9e9e9e', 2: '#4fc3f7', 3: '#81c784', 4: '#7986cb', 5: '#ffd54f', 6: '#80deea' };
  const gradeLabel = GRADE_MAP[tierNum] || '';
  const gradeColor = GRADE_COLOR[tierNum] || '#888';
  const gradeHtml = gradeLabel
    ? `<span style="color:${gradeColor};font-size:10px;font-weight:700;border:1px solid ${gradeColor}40;padding:1px 6px;border-radius:3px;background:rgba(0,0,0,0.3);margin-left:6px;">${gradeLabel}</span>`
    : '';

  const penaltyCheck = (typeof window !== 'undefined' && window.BalanceEngine)
    ? window.BalanceEngine.checkGradePenalty(state?.level || 1, def)
    : { hasPenalty: false };

  const penaltyWarningHtml = penaltyCheck.hasPenalty
    ? `<div style="color:#ef4444; font-size:10px; font-weight:bold; margin-top:4px; padding:3px 6px; background:rgba(239,68,68,0.18); border:1px solid #ef4444; border-radius:3px; box-shadow:0 0 6px rgba(239,68,68,0.3);">⚠️ ${penaltyCheck.reason}</div>`
    : '';

  const PROTECTED_SLOTS = ['consumable', 'material', 'scroll', 'powerup', 'potion', 'food', 'spellbook', 'talisman', 'pendant', 'coin'];
  const isProtected = PROTECTED_SLOTS.includes((def.slot || '').toLowerCase()) || !!def.stack;
  const protectionBadge = isProtected
    ? `<div style="color:#60a5fa;font-size:9px;font-weight:700;margin-top:4px;display:flex;align-items:center;gap:3px;"><span style="font-size:10px;">🛡️</span> Protegido contra Venda Automática</div>`
    : '';

  const currentHeroLvl = state?.level || 1;
  let heirloomPhaseText = '';
  let heirloomNextEvolution = '';
  if (currentHeroLvl <= 19) {
    heirloomPhaseText = '✦ Fase 1 (Lv. 1–19): +50% superior a No-Grade';
    heirloomNextEvolution = '✦ Próxima Evolução: Nível 20 (+50% D-Grade)';
  } else if (currentHeroLvl <= 39) {
    heirloomPhaseText = '✦ Fase 2 (Lv. 20–39): +50% superior a D-Grade';
    heirloomNextEvolution = '✦ Próxima Evolução: Nível 40 (C-Grade Pleno +4 Glow)';
  } else {
    heirloomPhaseText = '✦ Fase 3 (Lv. 40+): Maturidade C-Grade Pleno (+4 Glow)';
    heirloomNextEvolution = '✦ Nível Máximo de Herança Atingido!';
  }

  let heirloomCount = 0;
  if (state?.equipment) {
    const allSlots = ['weapon', 'armor', 'legs', 'helmet', 'gloves', 'boots', 'shield', 'necklace', 'earring1', 'earring2', 'ring1', 'ring2', 'cloak', 'belt', 'hair'];
    for (const slotKey of allSlots) {
      const uid = state.equipment[slotKey];
      if (!uid) continue;
      const invItem = state.inventory?.find(i => i.uid === uid);
      if (!invItem) continue;
      const d = gData?.ALL_ITEMS?.[invItem.itemId];
      if (invItem.isHeirloom || d?.isHeirloom || invItem.itemId?.includes('heirloom')) {
        heirloomCount++;
      }
    }
  }

  let heirloomSetBonusText = '';
  if (heirloomCount >= 12) {
    heirloomSetBonusText = '<span style="color:#4ade80;">👑 Set Soberano (12/12 Full):</span> +60% XP/Adena, +20% Stats, +25% HP';
  } else if (heirloomCount >= 8) {
    heirloomSetBonusText = '<span style="color:#4ade80;">👑 Bônus Soberano (8/12):</span> +45% XP/Adena, +10% Stats';
  } else if (heirloomCount >= 5) {
    heirloomSetBonusText = '<span style="color:#4ade80;">🛡️ Set Armadura (5/5):</span> +25% XP/Adena, +60 Atk/Matk, +80 Def/Mdef';
  } else {
    heirloomSetBonusText = `<span style="color:#fde047;">👑 Set Soberano:</span> ${heirloomCount}/12 equipadas (Equipe 5+ para bônus de XP/Adena)`;
  }

  const heirloomHtml = isHeirloom
    ? `
      <div style="background:linear-gradient(135deg, rgba(255,215,0,0.18), rgba(168,85,247,0.18)); border:1px solid #ffd700; border-radius:6px; padding:8px 10px; margin:8px 0; box-shadow:0 0 12px rgba(255,215,0,0.25);">
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:bold; color:#ffd700;">
          <span style="display:flex;align-items:center;gap:4px;">⚔️ <span>Item de Herança Dinâmico</span></span>
          <span style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,215,0,0.5); padding:1px 6px; border-radius:4px; font-size:10px; color:#fde047;">Lv. ${currentHeroLvl}/40</span>
        </div>
        <div style="font-size:10px; color:#f8fafc; font-weight:600; margin-top:4px;">
          ${heirloomPhaseText}
        </div>
        <div style="font-size:9.5px; color:#a78bfa; margin-top:2px; font-style:italic;">
          ${heirloomNextEvolution}
        </div>
        <div style="font-size:9.5px; margin-top:6px; padding-top:4px; border-top:1px dashed rgba(255,215,0,0.3); color:#e2e8f0;">
          ${heirloomSetBonusText}
        </div>
      </div>
    `
    : '';

  tooltip.innerHTML = `
    <div style="margin-bottom:4px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
      <span style="color:${rarityColor};font-weight:bold;font-size:13px;text-shadow:0 0 8px ${rarityColor}60;">${escapeHTML(displayName)}</span>
      ${gradeHtml}
    </div>
    <div style="color:${rarityColor};font-size:11px;font-weight:600;margin-bottom:2px;">${rarityName}</div>
    <div style="color:#888;font-size:10px;text-transform:uppercase;margin-bottom:4px;">${def.slot ? def.slot.toUpperCase() : 'ITEM'}${def.req?.level ? ` · Req Lv.${def.req.level}` : ''}</div>
    ${heirloomHtml}
    ${penaltyWarningHtml}
    ${statsStr}
    ${affixesStr}
    ${setBonusStr}
    <div style="color:#777;font-size:10px;margin-top:4px;font-style:italic;">${escapeHTML(def.desc || '')}</div>
    <div style="color:#aaa;font-size:10px;margin-top:4px;">💰 Valor: <span style="color:#e8c870;font-weight:600;">${(def.price || 0).toLocaleString()}g</span></div>
    ${protectionBadge}
    ${actionsHtml}
  `;

  // Delegação de eventos para os botões do tooltip
  tooltip.querySelectorAll('[data-tt-action]').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const action = btn.dataset.ttAction;
      const uid = btn.dataset.uid;
      const slotTarget = btn.dataset.slotTarget || null;
      if (action === 'equip') {
        const equipFn = callbacks.equipItem || (typeof window !== 'undefined' ? window.equipItem : null);
        if (equipFn) equipFn(uid, slotTarget, state);
      }
      if (action === 'unequip') {
        const slot = btn.dataset.slot;
        const uid = btn.dataset.uid;
        const unequipFn = callbacks.unequipItem || (typeof window !== 'undefined' ? window.unequipItem : null);
        if (unequipFn) unequipFn(slot || uid, state);
      }
      if (action === 'sell') {
        const sellFn = callbacks.sellItem || (typeof window !== 'undefined' ? window.sellItem : null);
        if (sellFn) sellFn(uid);
      }
      if (action === 'salvage') {
        const salvageFn = callbacks.salvageItem || (typeof window !== 'undefined' ? window.salvageItem : null);
        if (salvageFn) salvageFn(uid);
      }
      if (action === 'enchant-flow') {
        const liveState = (typeof getState === 'function' ? getState() : null) || state;
        openEnchantFlowModal(null, uid, liveState, callbacks);
      }
      if (action === 'use') {
        const useFn = callbacks.useItem || (typeof window !== 'undefined' ? window.useItem : null);
        if (useFn) useFn(uid);
      }
      hideItemTooltip();
    };
  });

  tooltip.style.display = 'block';
  tooltip.style.position = 'fixed';
  tooltip.style.top = '0px';
  tooltip.style.left = '0px';
  tooltip.style.zIndex = '999999';
  tooltip.style.pointerEvents = 'auto';

  const clientX = e?.clientX ?? (e?.pageX || 100);
  const clientY = e?.clientY ?? (e?.pageY || 100);

  const rect = tooltip.getBoundingClientRect();
  const tipW = rect.width || 270;
  const tipH = rect.height || 280;

  let posX = clientX + 16;
  let posY = clientY + 12;

  if (posX + tipW > window.innerWidth - 12) {
    posX = Math.max(10, clientX - tipW - 14);
  }
  if (posY + tipH > window.innerHeight - 12) {
    posY = Math.max(10, window.innerHeight - tipH - 12);
  }

  tooltip.style.transform = `translate3d(${Math.round(posX)}px, ${Math.round(posY)}px, 0)`;

  tooltip.onmouseleave = (ev) => {
    const rel = ev?.relatedTarget;
    if (rel && (rel.classList?.contains('equip-slot') || rel.classList?.contains('inv-slot') || rel.closest?.('.equip-slot') || rel.closest?.('.inv-slot'))) {
      return;
    }
    hideItemTooltip();
  };
}

export function hideItemTooltip() {
  const tooltip = findElement('item-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

// Inicializa o auto-hide do tooltip ao mover mouse para fora dele
let _tooltipInitialized = false;
export function initTooltipEvents() {
  if (_tooltipInitialized) return;
  _tooltipInitialized = true;
  const tooltip = findElement('item-tooltip');
  if (!tooltip) return;
  tooltip.addEventListener('mouseleave', () => hideItemTooltip());
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. INVENTORY & PAPERDOLL (6 LINHAS x 3 COLUNAS)
═══════════════════════════════════════════════════════════════════════════ */
const GEAR_SLOTS = ['weapon', 'weapon2', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'necklace', 'earring', 'ring', 'hair', 'hair2', 'agathion', 'talisman'];
const CONSUMABLE_SLOTS = ['consumable', 'potion', 'scroll', 'food', 'powerup', 'crystal'];
const MATERIAL_SLOTS = ['material', 'gem', 'ore', 'craft', 'crystal'];

const SLOT_ICONS = {
  hair1: '👒', hair2: '🎭', helmet: '🪖',
  earring1: '💎', armor: '🛡️', chest: '🛡️', earring2: '💎',
  necklace: '📿', legs: '👖', cloak: '🧥',
  weapon: '⚔️', weapon2: '🗡️', gloves: '🧤', shield: '🛡️',
  ring1: '💍', boots: '👢', ring2: '💍',
  brooch: '❇️', agathion_bracelet: '🧚‍♂️', talisman_bracelet: '🔮', belt: '🪢'
};

function findEquipmentSlot(slot) {
  let el = findElement(`equip-slot-${slot}`) || getRoot().querySelector(`[data-slot="${slot}"]`);
  if (!el && (slot === 'chest' || slot === 'armor')) {
    el = findElement('equip-slot-chest') || findElement('equip-slot-armor') ||
         getRoot().querySelector('[data-slot="chest"]') || getRoot().querySelector('[data-slot="armor"]') ||
         getRoot().querySelector('[data-slot-alias="armor"]');
  }
  return el;
}

function createEquipmentSlotDynamically(slot) {
  const grid = findElement('paperdoll-grid') || findElement('equipment-grid');
  if (!grid) return null;
  const slotEl = mkEl('div');
  slotEl.className = 'equip-slot empty';
  slotEl.id = `equip-slot-${slot}`;
  slotEl.dataset.slot = slot;
  grid.appendChild(slotEl);
  return slotEl;
}

const INJECTED_GAMEUI_CSS = `
/* === CONFINAMENTO DO PAPERDOLL (175px FIXOS) === */
#tab-inventory .l2inv-left-paperdoll,
.l2inv-left-paperdoll {
  width: 175px;
  min-width: 175px;
  max-width: 175px;
  flex: 0 0 175px;
  padding: 6px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid #3c2e1e;
}

#tab-inventory .l2inv-paperdoll-grid,
.l2inv-paperdoll-grid {
  display: flex;
  flex-direction: row;
  gap: 4px;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

#tab-inventory .l2inv-doll-col,
.l2inv-doll-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  flex: 0 0 50px;
}

/* === PAPERDOLL / EQUIP SLOTS (fixed overflow) === */
#tab-inventory .equip-slot,
.l2inv-pd-slot,
.equip-slot {
  width: 50px;
  height: 50px;
  min-width: 50px;
  max-width: 50px;
  min-height: 50px;
  max-height: 50px;
  box-sizing: border-box;
  background: #1a1611;
  border: 1px solid #4a3a2a;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.equip-slot.active {
  background: linear-gradient(135deg, #2a2218 0%, #1a1611 100%);
}

.equip-slot .equip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.equip-slot .equip-icon img,
.equip-slot .equip-icon .inventory-item-image {
  width: 32px !important;
  height: 32px !important;
  max-width: 32px !important;
  max-height: 32px !important;
  object-fit: contain !important;
}

.equip-placeholder {
  font-size: 18px;
  opacity: 0.3;
}

/* === DESATIVAR RESIZE MANUAL === */
#inventory-panel, .inventory-panel, #inventory-window, #tab-inventory, .l2inv-header-frame {
  resize: none;
  user-select: none;
}

/* === GRID RESPONSIVO E SIMÉTRICO COM BORDAS DEFINIDAS E SCROLLBAR VERTICAL === */
#tab-inventory #inventory-grid,
#tab-inventory .inventory-grid,
#tab-inventory .l2inv-grid,
#inventory-grid,
.inventory-grid,
.l2inv-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(42px, 1fr)) !important;
  grid-auto-rows: 42px !important;
  gap: 3px !important;
  padding: 6px !important;
  background: rgba(10, 7, 4, 0.85) !important;
  border: 2px solid #3c2e1e !important;
  border-radius: 4px !important;
  height: 337px !important;
  max-height: 337px !important;
  overflow-y: scroll !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
  align-content: start !important;
  scrollbar-width: thin !important;
  scrollbar-color: #5a452a #120d08 !important;
}

/* ESTILIZAÇÃO DA SIDEBAR DE ROLAGEM */
#inventory-grid::-webkit-scrollbar,
.inventory-grid::-webkit-scrollbar {
  width: 8px !important;
}
#inventory-grid::-webkit-scrollbar-track,
.inventory-grid::-webkit-scrollbar-track {
  background: #120d08 !important;
  border-radius: 4px !important;
}
#inventory-grid::-webkit-scrollbar-thumb,
.inventory-grid::-webkit-scrollbar-thumb {
  background: #5a452a !important;
  border-radius: 4px !important;
  border: 1px solid #7a5c38 !important;
}

/* === SLOTS DO INVENTÁRIO (Adaptativos) === */
/* NOTE: border is NOT set here with !important — rarity styles from style.css will apply */
#tab-inventory .inv-slot,
.inv-slot,
.l2inv-slot {
  width: 100% !important;
  height: 100% !important;
  min-width: 0 !important;
  max-width: none !important;
  aspect-ratio: 1 !important;
  background: #241e16 !important;
  border-radius: 3px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  transition: transform 0.12s ease, box-shadow 0.2s ease !important;
  cursor: pointer;
}

/* Default border for slots without rarity class */
.inv-slot:not([class*="rarity-"]) {
  border: 1px solid #5a452a !important;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.8) !important;
}

#tab-inventory .inv-slot.empty,
.inv-slot.empty {
  background: rgba(14, 10, 6, 0.6) !important;
  border: 1px solid #2e2216 !important;
  opacity: 0.6 !important;
  cursor: default !important;
}

/* === PREMIUM RARITY BACKGROUNDS (gradient tints) === */
.inv-slot.rarity-common {
  background: linear-gradient(135deg, #241e16 0%, #1c1812 100%) !important;
}
.inv-slot.rarity-uncommon {
  background: linear-gradient(135deg, #1a2618 0%, #162014 100%) !important;
}
.inv-slot.rarity-rare {
  background: linear-gradient(135deg, #161e2e 0%, #121828 100%) !important;
}
.inv-slot.rarity-epic {
  background: linear-gradient(135deg, #221630 0%, #1a1028 100%) !important;
  animation: epic-shimmer 3s ease-in-out infinite alternate !important;
}
.inv-slot.rarity-legendary {
  background: linear-gradient(135deg, #2e2210 0%, #261c08 100%) !important;
}

/* Same for equip slots */
.equip-slot.rarity-common   { background: linear-gradient(135deg, #241e16 0%, #1c1812 100%); }
.equip-slot.rarity-uncommon { background: linear-gradient(135deg, #1a2618 0%, #162014 100%); border-color: #22c55e !important; }
.equip-slot.rarity-rare     { background: linear-gradient(135deg, #161e2e 0%, #121828 100%); border-color: #3b82f6 !important; }
.equip-slot.rarity-epic     { background: linear-gradient(135deg, #221630 0%, #1a1028 100%); border-color: #a855f7 !important; box-shadow: 0 0 8px rgba(168,85,247,0.4); }
.equip-slot.rarity-legendary { background: linear-gradient(135deg, #2e2210 0%, #261c08 100%); border-color: #f59e0b !important; box-shadow: 0 0 10px rgba(245,158,11,0.5); animation: legendary-glow 2.5s ease-in-out infinite alternate; }

/* === RARITY ANIMATIONS === */
@keyframes epic-shimmer {
  0%   { box-shadow: 0 0 6px rgba(168, 85, 247, 0.3), inset 0 0 6px rgba(168, 85, 247, 0.2); }
  100% { box-shadow: 0 0 10px rgba(168, 85, 247, 0.55), inset 0 0 10px rgba(168, 85, 247, 0.35); }
}

@keyframes legendary-glow {
  0%   { box-shadow: 0 0 8px rgba(245, 158, 11, 0.4), inset 0 0 6px rgba(245, 158, 11, 0.25); }
  100% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.7), inset 0 0 12px rgba(245, 158, 11, 0.45); }
}

/* Hover lift effect for items (not empty slots) */
.inv-slot:not(.empty):hover {
  transform: translateY(-2px) scale(1.05) !important;
  z-index: 10 !important;
}

/* Equipped badge */
.equipped-badge {
  position: absolute;
  top: 1px;
  left: 1px;
  font-size: 8px;
  font-weight: 800;
  color: #70c8f8;
  background: rgba(10, 26, 42, 0.85);
  border: 1px solid rgba(58, 122, 176, 0.6);
  border-radius: 2px;
  padding: 0 2px;
  line-height: 10px;
  z-index: 3;
}

/* === TIER GRADE BADGE === */
.tier-badge {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 7px;
  font-weight: 900;
  letter-spacing: 0.3px;
  border-radius: 2px;
  padding: 0px 2px;
  line-height: 10px;
  z-index: 3;
  text-shadow: 0 1px 1px rgba(0,0,0,0.8);
}
.tier-badge.tier-1 { color: #9e9e9e; background: rgba(30,28,24,0.8); border: 1px solid #555; }
.tier-badge.tier-2 { color: #4fc3f7; background: rgba(15,30,40,0.85); border: 1px solid #4fc3f7; }
.tier-badge.tier-3 { color: #81c784; background: rgba(15,35,20,0.85); border: 1px solid #81c784; }
.tier-badge.tier-4 { color: #7986cb; background: rgba(20,20,40,0.85); border: 1px solid #7986cb; }
.tier-badge.tier-5 { color: #ffd54f; background: rgba(35,28,10,0.85); border: 1px solid #ffd54f; text-shadow: 0 0 4px rgba(255,213,79,0.5); }
.tier-badge.tier-6 { color: #e0f7fa; background: rgba(10,30,40,0.9); border: 1px solid #80deea; text-shadow: 0 0 6px rgba(128,222,234,0.7); animation: frostlord-badge 2s ease-in-out infinite alternate; }

@keyframes frostlord-badge {
  0%   { border-color: #80deea; box-shadow: 0 0 3px rgba(128,222,234,0.4); }
  100% { border-color: #b2ebf2; box-shadow: 0 0 6px rgba(178,235,242,0.7); }
}

/* Selection check mark */
.inv-check {
  position: absolute;
  top: 1px;
  right: 1px;
  font-size: 9px;
  color: #4ade80;
  z-index: 4;
  pointer-events: none;
}

/* Quantity badge */
.qty {
  position: absolute;
  bottom: 1px;
  left: 1px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.9);
  z-index: 3;
}

/* Is-equipped overlay stripe */
.inv-slot.is-equipped {
  outline: 1px solid rgba(112, 200, 248, 0.3);
  outline-offset: -1px;
}

/* Is-selected highlight */
.inv-slot.is-selected {
  outline: 2px solid #4ade80 !important;
  outline-offset: -2px;
}

/* ÍCONES REDUZIDOS (24px) */
.inventory-item-image {
  width: 24px !important;
  height: 24px !important;
  max-width: 24px !important;
  max-height: 24px !important;
  object-fit: contain !important;
}

.inventory-item-emoji {
  font-size: 15px !important;
}

/* === BATCH ACTION BAR (AÇÕES EM LOTE) === */
.inv-action-bar {
  display: flex !important;
  gap: 6px !important;
  margin: 6px 0 !important;
  flex-wrap: wrap !important;
  align-items: center !important;
}
.inv-action-btn {
  padding: 5px 10px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  transition: transform 0.1s ease, background 0.15s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
}
.inv-action-btn:hover {
  transform: translateY(-1px) !important;
}
.inv-action-btn.sell {
  background: linear-gradient(180deg, #5a3810, #2a1505) !important;
  border: 1px solid #a06020 !important;
  color: #f8b070 !important;
}
.inv-action-btn.salvage {
  background: linear-gradient(180deg, #3a1a4a, #1a0a28) !important;
  border: 1px solid #8040a0 !important;
  color: #d890f8 !important;
}
.inv-action-btn.select-junk {
  background: linear-gradient(180deg, #1a3a2a, #0a1a10) !important;
  border: 1px solid #3ab070 !important;
  color: #70e898 !important;
}
.inv-action-btn.clear-sel {
  background: linear-gradient(180deg, #3a1a1a, #1a0a0a) !important;
  border: 1px solid #a03a3a !important;
  color: #f87070 !important;
}

/* === MAPA DE ZONAS & DIORAMA DE COMBATE ESTILOS === */
.saga-map-block {
  padding: 12px 14px;
  margin-bottom: 14px;
  border: 1px solid rgba(212, 175, 55, .28);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(28, 34, 48, .82), rgba(16, 20, 30, .82));
}
.saga-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(212, 175, 55, .2);
}
.saga-title {
  color: #e8c37a;
  font-size: 15px;
  font-weight: 700;
  font-family: "Cinzel", serif;
}
.saga-req {
  padding: 2px 10px;
  color: #8b93a7;
  font-size: 11px;
  border: 1px solid rgba(139, 147, 167, .3);
  border-radius: 999px;
}
.saga-zones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.zone-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #131824;
  border: 1px solid rgba(212, 175, 55, .3);
  border-radius: 10px;
  cursor: pointer;
  transition: transform .16s, border-color .16s, box-shadow .16s;
}
.zone-card:hover:not(.locked):not(.active) {
  transform: translateY(-3px);
  border-color: rgba(232, 195, 122, .8);
  box-shadow: 0 6px 18px rgba(0,0,0,.6);
}
.zone-card.active {
  border-color: #e8c37a;
  box-shadow: 0 0 0 1px rgba(232, 195, 122, .5), 0 0 20px rgba(232, 195, 122, .25);
}
.zone-card-thumb {
  position: relative;
  height: 80px;
  background-color: #0d1018;
  background-position: center;
  background-size: cover;
}
.zone-card-thumb::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 30%, rgba(10, 13, 20, .95));
}
.zone-flag {
  position: absolute;
  top: 6px;
  z-index: 2;
  padding: 3px 8px;
  font-size: 10px;
  border-radius: 999px;
}
.zone-flag.town { left: 6px; color: #7fd4a8; background: rgba(8,10,16,.85); border: 1px solid rgba(127,212,168,.4); }
.zone-flag.here { right: 6px; color: #0d1018; font-weight: 800; background: #e8c37a; }
.zone-card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
}
.zone-card-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.zone-card-title {
  color: #e6e9f2;
  font-size: 13px;
  font-weight: 700;
  font-family: "Cinzel", serif;
}
.zone-card-lvl {
  color: #e8c37a;
  font-size: 11px;
}
.zone-card-desc {
  color: #8b93a7;
  font-size: 11px;
}
.select-zone-btn {
  width: 100%;
  padding: 8px;
  color: #e8c37a;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  background: rgba(212, 175, 55, .12);
  border: 1px solid rgba(212, 175, 55, .5);
  border-radius: 6px;
  cursor: pointer;
}
.select-zone-btn:hover:not(:disabled) {
  color: #12161f;
  background: #e8c37a;
}

/* === STAGGER & BREAK BAR STYLES === */
.stage-stagger-bar {
  position: relative;
  width: 100%;
  height: 10px;
  background: rgba(15, 10, 6, 0.9);
  border: 1px solid #78350f;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.8);
}
.stage-stagger-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #f59e0b, #d97706);
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
  transition: width 0.2s ease;
}
.stage-stagger-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 2px #000;
  white-space: nowrap;
  pointer-events: none;
}
.stage-stagger-bar.stage-stagger-break {
  border-color: #ef4444;
  animation: stagger-pulse 0.6s infinite alternate;
}
.stage-stagger-bar.stage-stagger-break .stage-stagger-fill {
  background: linear-gradient(90deg, #ef4444, #f59e0b, #ef4444);
  background-size: 200% 100%;
  animation: stagger-shimmer 1s linear infinite;
}
.stage-stagger-bar.stage-stagger-fatal {
  border-color: #dc2626;
  animation: fatal-channel-pulse 0.4s infinite alternate;
}
.stage-stagger-bar.stage-stagger-fatal .stage-stagger-fill {
  background: linear-gradient(90deg, #b91c1c, #f87171, #b91c1c);
  background-size: 200% 100%;
  animation: stagger-shimmer 0.7s linear infinite;
}
@keyframes stagger-pulse {
  from { box-shadow: 0 0 4px #ef4444; }
  to { box-shadow: 0 0 12px #ef4444; }
}
@keyframes fatal-channel-pulse {
  from { box-shadow: 0 0 6px #dc2626; }
  to { box-shadow: 0 0 16px #ef4444, 0 0 24px rgba(239, 68, 68, 0.6); }
}
@keyframes stagger-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* === WEAPON RESONANCE BADGE === */
.weapon-resonance-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(180deg, rgba(22, 27, 42, 0.95), rgba(12, 16, 26, 0.98));
  border: 1px solid rgba(212, 167, 68, 0.45);
  border-radius: 8px;
  padding: 8px 14px;
  margin: 6px 0 10px 0;
  box-shadow: 0 4px 14px rgba(0,0,0,0.6), inset 0 0 12px rgba(212, 167, 68, 0.08);
  transition: all 0.25s ease;
}
.weapon-resonance-badge .res-icon {
  font-size: 22px;
  filter: drop-shadow(0 0 6px rgba(255,255,255,0.4));
  flex-shrink: 0;
}
.weapon-resonance-badge .res-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.weapon-resonance-badge .res-title {
  font-size: 12px;
  font-weight: 700;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.06em;
}
.weapon-resonance-badge .res-desc {
  font-size: 10.5px;
  color: #cbd5e1;
  line-height: 1.35;
  margin-top: 2px;
}
`;

export function ensureInventoryStyles() {
  const root = getRoot();
  const targets = [root, document.head].filter(Boolean);

  for (const t of targets) {
    if (!t.querySelector('#gameui-styles-direct')) {
      const style = document.createElement('style');
      style.id = 'gameui-styles-direct';
      style.textContent = INJECTED_GAMEUI_CSS;
      t.appendChild(style);
    }
  }
}

export function updateInventoryUI(state, callbacks = {}) {
  if (!state || typeof state !== 'object') {
    state = (typeof window !== 'undefined' && window.state) ? window.state : {};
  }
  ensureInventoryStyles();
  updateEquipmentUI(state, callbacks);

  // 1. Atualiza Indicador e Pressão de Capacidade da Mochila
  const pressure = calculateInventoryPressure(state);
  const pressBar = findElement('inv-capacity-pressure-bar');
  const pressLabel = findElement('inv-capacity-pressure-label');
  const fullBanner = findElement('inv-full-alert-banner');
  if (pressBar) {
    pressBar.style.width = `${Math.min(100, pressure.pct)}%`;
    pressBar.style.backgroundColor = pressure.color;
  }
  if (pressLabel) {
    pressLabel.textContent = `${pressure.count}/${pressure.max} (${pressure.pct}%) ${pressure.label}`;
    pressLabel.style.color = pressure.color;
  }
  if (fullBanner) {
    fullBanner.style.display = pressure.isFull ? 'block' : 'none';
  }

  // 1.1 Atalho Direto para a Forja Imperial & NextActionAdvisor na Mochila
  const forgeBtn = findElement('btn-inv-open-forge');
  if (forgeBtn && !forgeBtn.dataset.bound) {
    forgeBtn.dataset.bound = 'true';
    forgeBtn.onclick = (e) => {
      e.preventDefault();
      if (callbacks.switchTab) callbacks.switchTab('craft');
      else if (typeof window !== 'undefined' && typeof window.switchTab === 'function') window.switchTab('craft');
    };
  }

  const advisorInv = findElement('next-action-advisor-inv');
  if (advisorInv) {
    NextActionAdvisor.render(state, advisorInv, callbacks);
  }

  const grid = findElement('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const data = D();
  if (!data?.ALL_ITEMS) {
    grid.innerHTML = '<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Dados não carregados</div>';
    return;
  }

  const selectedSet = getSelectedSet(state);
  const filter = state.inventoryFilter || state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter = state.equipFilter || 'all';
  const gradeFilter = (typeof window !== 'undefined' && window.currentGradeFilter) || state.gradeFilter || 'all';

  const searchInput = findElement('inv-search-input');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => {
      updateInventoryUI(state, callbacks);
    });
  }
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();

  const sortSelect = findElement('inv-sort-select');
  if (sortSelect) {
    if (state.inventorySortCriteria) {
      sortSelect.value = state.inventorySortCriteria;
    }
    if (!sortSelect.dataset.bound) {
      sortSelect.dataset.bound = 'true';
      sortSelect.addEventListener('change', (e) => {
        state.inventorySortCriteria = e.target.value;
        updateInventoryUI(state, callbacks);
      });
    }
  }

  const sorted = sortInventoryItems([...(state.inventory || [])].filter(i => i?.itemId), state.inventorySortCriteria || 'recommended', state);

  for (const item of sorted) {
    const def = getItemDef(item.itemId);
    if (!def) continue;
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    const defSlot = (def.slot || '').toLowerCase();
    if (filter !== 'all') {
      const f = filter.toLowerCase();
      if ((f === 'gear' || f === 'equip') && !GEAR_SLOTS.includes(defSlot)) continue;
      if ((f === 'consumable' || f === 'supplies') && !CONSUMABLE_SLOTS.includes(defSlot)) continue;
      if ((f === 'material' || f === 'crafting') && !MATERIAL_SLOTS.includes(defSlot)) continue;
      if ((f === 'scroll' || f === 'quest') && !(defSlot === 'quest' || defSlot === 'scroll' || (def.id && def.id.includes('quest')) || def.type === 'quest')) continue;
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    if (gradeFilter !== 'all') {
      const reqLvl = def.req ? def.req.level : 1;
      let itemGrade = (def.grade || '').toLowerCase();
      if (!itemGrade) {
        if (def.tier === 1) itemGrade = 'ng';
        else if (def.tier === 2) itemGrade = 'd';
        else if (def.tier === 3) itemGrade = 'c';
        else if (def.tier === 4) itemGrade = 'b';
        else if (def.tier === 4.5) itemGrade = 'a';
        else if (def.tier === 5 || def.tier === 6) itemGrade = 's';
        else {
          if (reqLvl < 20) itemGrade = 'ng';
          else if (reqLvl < 40) itemGrade = 'd';
          else if (reqLvl < 52) itemGrade = 'c';
          else if (reqLvl < 61) itemGrade = 'b';
          else if (reqLvl < 76) itemGrade = 'a';
          else itemGrade = 's';
        }
      }
      if (!itemGrade.includes(gradeFilter.toLowerCase())) continue;
    }

    const isSelected = selectedSet.has(item.uid);
    const isInspected = window._inspectedItemUid === item.uid;
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const check = `<span class="inv-check">${isSelected ? '✓' : ''}</span>`;
    const favTag = (item.isFavorite || item.favorite) ? `<span class="fav-badge" style="position:absolute; top:2px; left:2px; font-size:9px; z-index:5;">⭐</span>` : '';

    const tierNum = def.tier || 0;
    const GRADE_LABELS = { 0: '', 1: 'NG', 2: 'D', 3: 'C', 4: 'B', 5: 'S', 6: 'FL' };
    const gradeLabel = GRADE_LABELS[tierNum] || '';
    const tierBadge = (gradeLabel && GEAR_SLOTS.includes(defSlot))
      ? `<span class="tier-badge tier-${tierNum}">${gradeLabel}</span>` : '';

    const enchantLevel = item.enchant || item.enchantLevel || 0;
    let invSlotClasses = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '') + (isInspected ? ' is-inspected' : '');
    if (enchantLevel >= 16) invSlotClasses += ' enchant-halo-16';
    else if (enchantLevel >= 10) invSlotClasses += ' enchant-halo-10';
    else if (enchantLevel >= 4) invSlotClasses += ' enchant-halo-4';

    const enchantBadge = enchantLevel > 0 
      ? `<span class="enchant-level-badge" style="position:absolute; bottom:2px; left:2px; background:rgba(0,0,0,0.85); color:${enchantLevel >= 16 ? '#d8b4fe' : enchantLevel >= 10 ? '#fca5a5' : '#7dd3fc'}; font-size:9px; font-weight:900; padding:1px 3px; border-radius:3px; border:1px solid currentColor; line-height:1; z-index:5;">+${enchantLevel}</span>`
      : '';

    const slotEl = mkEl('div');
    slotEl.className = invSlotClasses;
    slotEl.dataset.uid = item.uid;

    slotEl.innerHTML = `
      ${check}
      ${favTag}
      <span class="item-icon">${getItemIcon(def || item)}</span>
      ${enchantBadge}
      ${qty}
      ${equippedTag}
      ${tierBadge}
    `;

    slotEl.title = def.name;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = (ev) => {
      const tip = findElement('item-tooltip');
      const rel = ev.relatedTarget;
      if (tip && (tip === rel || tip.contains(rel))) return;
      hideItemTooltip();
    };

    slotEl.onclick = (e) => {
      e.stopPropagation();
      window._inspectedItemUid = item.uid;
      if (e.target.closest('.inv-check') && callbacks.toggleSelectItem) {
        callbacks.toggleSelectItem(item.uid);
      }
      renderItemDetailAndComparison(item, state, callbacks);
      updateInventoryUI(state, callbacks);
    };

    slotEl.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isEquipped = !!(item.equipped || (state.equipment && Object.values(state.equipment).includes(item.uid)));
      if (isEquipped) {
        const unequipFn = callbacks.unequipItem || (typeof window !== 'undefined' ? window.unequipItem : null);
        if (unequipFn) unequipFn(item.uid || item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), state);
      } else {
        const equipFn = callbacks.equipItem || (typeof window !== 'undefined' ? window.equipItem : null);
        if (equipFn) equipFn(item.uid, state);
      }
    };

    slotEl.ondblclick = (e) => {
      e.stopPropagation();
      const isEquipped = !!(item.equipped || (state.equipment && Object.values(state.equipment).includes(item.uid)));
      if (isEquipped) {
        const unequipFn = callbacks.unequipItem || (typeof window !== 'undefined' ? window.unequipItem : null);
        if (unequipFn) unequipFn(item.uid || item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), state);
      } else if (CONSUMABLE_SLOTS.includes(defSlot) && callbacks.useItem) {
        callbacks.useItem(item.uid);
      } else if (GEAR_SLOTS.includes(defSlot)) {
        const equipFn = callbacks.equipItem || (typeof window !== 'undefined' ? window.equipItem : null);
        if (equipFn) equipFn(item.uid, state);
      }
    };

    grid.appendChild(slotEl);
  }

  // Preenche os espaços vazios completando as linhas de forma perfeitamente simétrica
  const renderedCount = grid.children.length;
  const maxSlots = getMaxInventorySlots(state) || 80;
  
  let cols = 8;
  try {
    const comp = window.getComputedStyle(grid).gridTemplateColumns;
    if (comp) {
      const parts = comp.trim().split(/\s+/);
      if (parts.length > 0 && !parts[0].includes('%')) cols = parts.length;
    }
  } catch (e) {
    if (grid.clientWidth > 0) {
      cols = Math.max(1, Math.floor((grid.clientWidth - 12) / 46));
    }
  }

  const minRows = 4;
  const targetSlots = Math.max(cols * minRows, Math.ceil(renderedCount / cols) * cols);

  for (let i = renderedCount; i < targetSlots; i++) {
    const emptySlotEl = mkEl('div');
    emptySlotEl.className = 'inv-slot empty';
    grid.appendChild(emptySlotEl);
  }

  // Renderiza a barra de ações em lote (Batch Action Bar)
  let actionBar = findElement('inv-action-bar');
  if (!actionBar) {
    const parent = grid.parentElement;
    if (parent) {
      actionBar = mkEl('div');
      actionBar.id = 'inv-action-bar';
      actionBar.className = 'inv-action-bar';
      parent.insertBefore(actionBar, grid.nextSibling);
    }
  }

  if (actionBar) {
    const selSize = selectedSet.size || 0;
    actionBar.innerHTML = `
      <button class="inv-action-btn sell" id="btn-sell-selected" title="Vender itens selecionados">💰 Vender (${selSize})</button>
      <button class="inv-action-btn salvage" id="btn-salvage-selected" title="Desmontar equipamentos selecionados em cristais/materiais">🔨 Desmontar (${selSize})</button>
      <button class="inv-action-btn select-junk" id="btn-select-junk" title="Selecionar todos os itens Comuns e Incomuns">🧹 Selecionar Lixo</button>
      ${selSize > 0 ? `<button class="inv-action-btn clear-sel" id="btn-clear-sel" title="Limpar seleção atual">❌ Limpar (${selSize})</button>` : ''}
    `;

    const btnSell = actionBar.querySelector('#btn-sell-selected');
    if (btnSell) btnSell.onclick = () => openBatchSellModal(state, callbacks);

    const btnSalvage = actionBar.querySelector('#btn-salvage-selected');
    if (btnSalvage) btnSalvage.onclick = () => openBatchSalvageModal(state, callbacks);

    const btnJunk = actionBar.querySelector('#btn-select-junk');
    if (btnJunk) btnJunk.onclick = () => { if (callbacks.selectJunkItems) callbacks.selectJunkItems(); };

    const btnClear = actionBar.querySelector('#btn-clear-sel');
    if (btnClear) btnClear.onclick = () => { if (callbacks.clearItemSelection) callbacks.clearItemSelection(); };
  }

  // Vincula botões da barra inferior e botões de lote
  const organizeBtn = findElement('organize-inv-btn');
  if (organizeBtn && !organizeBtn.dataset.bound) {
    organizeBtn.dataset.bound = 'true';
    organizeBtn.onclick = () => {
      const res = organizeInventory(state, state.inventorySortCriteria || 'recommended');
      if (callbacks.log) callbacks.log(`🧹 Mochila organizada: ${res.freedSlots} espaço(s) liberado(s)!`, 'loot');
      updateInventoryUI(state, callbacks);
      if (callbacks.save) callbacks.save();
    };
  }

  const autoEquipBtn = findElement('auto-equip-btn');
  if (autoEquipBtn && !autoEquipBtn.dataset.bound) {
    autoEquipBtn.dataset.bound = 'true';
    autoEquipBtn.onclick = () => {
      openAutoEquipPreviewModal(state, callbacks);
    };
  }

  const sellSelBtn = findElement('sell-selected-btn');
  if (sellSelBtn && !sellSelBtn.dataset.boundPreview) {
    sellSelBtn.dataset.boundPreview = 'true';
    sellSelBtn.onclick = () => openBatchSellModal(state, callbacks);
  }

  const salvSelBtn = findElement('salvage-selected-btn');
  if (salvSelBtn && !salvSelBtn.dataset.boundPreview) {
    salvSelBtn.dataset.boundPreview = 'true';
    salvSelBtn.onclick = () => openBatchSalvageModal(state, callbacks);
  }

  const crystSelBtn = findElement('crystallize-selected-btn');
  if (crystSelBtn && !crystSelBtn.dataset.boundPreview) {
    crystSelBtn.dataset.boundPreview = 'true';
    crystSelBtn.onclick = () => openBatchCrystallizeModal(state, callbacks);
  }

  const cnt = findElement('inv-count') || findElement('inv-slots');
  if (cnt) cnt.textContent = `${state.inventory?.length || 0}/${maxSlots}`;
  const l2cnt = findElement('l2inv-counter');
  if (l2cnt) l2cnt.textContent = `(${state.inventory?.length || 0}/${maxSlots})`;
}

function getRarityColor(rarity) {
  const r = String(rarity || 'common').toLowerCase();
  const colors = {
    common: '#cbd5e1',
    uncommon: '#4ade80',
    rare: '#38bdf8',
    epic: '#c084fc',
    legendary: '#f59e0b',
    mythic: '#ef4444'
  };
  return colors[r] || '#cbd5e1';
}

function renderItemStatsTable(item, def) {
  const mult = (1 + (Number(item?.enchant) || 0) * 0.1);
  const rows = [
    { label: 'P.Atk', val: def?.atk ? Math.floor(def.atk * mult) : 0 },
    { label: 'M.Atk', val: def?.matk ? Math.floor(def.matk * mult) : 0 },
    { label: 'P.Def', val: def?.def ? Math.floor(def.def * mult) : 0 },
    { label: 'M.Def', val: def?.mdef ? Math.floor(def.mdef * mult) : 0 },
    { label: 'HP', val: def?.hp ? Math.floor(def.hp * mult) : 0 },
    { label: 'MP', val: def?.mp ? Math.floor(def.mp * mult) : 0 },
    { label: 'Crítico', val: def?.crit || 0 },
  ].filter(r => r.val > 0);

  if (rows.length === 0) return '<div style="font-size:10px; color:#64748b;">Sem atributos base adicionais</div>';

  return `
    <table class="stat-comparison-table">
      ${rows.map(r => `
        <tr>
          <td class="stat-label">${r.label}</td>
          <td class="stat-cand-val" style="text-align:right;">+${r.val.toLocaleString()}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

function renderComparisonStatsTable(curItem, curDef, candItem, candDef) {
  const curMult = (1 + (Number(curItem?.enchant) || 0) * 0.1);
  const candMult = (1 + (Number(candItem?.enchant) || 0) * 0.1);

  const statsList = [
    { label: 'P.Atk', cur: Math.floor((curDef?.atk || 0) * curMult), cand: Math.floor((candDef?.atk || 0) * candMult) },
    { label: 'M.Atk', cur: Math.floor((curDef?.matk || 0) * curMult), cand: Math.floor((candDef?.matk || 0) * candMult) },
    { label: 'P.Def', cur: Math.floor((curDef?.def || 0) * curMult), cand: Math.floor((candDef?.def || 0) * candMult) },
    { label: 'M.Def', cur: Math.floor((curDef?.mdef || 0) * curMult), cand: Math.floor((candDef?.mdef || 0) * candMult) },
    { label: 'HP', cur: Math.floor((curDef?.hp || 0) * curMult), cand: Math.floor((candDef?.hp || 0) * candMult) },
    { label: 'MP', cur: Math.floor((curDef?.mp || 0) * curMult), cand: Math.floor((candDef?.mp || 0) * candMult) },
    { label: 'Crítico', cur: curDef?.crit || 0, cand: candDef?.crit || 0 },
  ].filter(s => s.cur > 0 || s.cand > 0);

  if (statsList.length === 0) return '<div style="font-size:10px; color:#64748b;">Sem atributos para comparar</div>';

  return `
    <table class="stat-comparison-table">
      ${statsList.map(s => {
        const delta = s.cand - s.cur;
        let deltaHtml = '';
        if (delta > 0) {
          deltaHtml = `<span class="delta-tag delta-positive">+${delta.toLocaleString()}</span>`;
        } else if (delta < 0) {
          deltaHtml = `<span class="delta-tag delta-negative">${delta.toLocaleString()}</span>`;
        } else {
          deltaHtml = `<span class="delta-tag delta-neutral">=</span>`;
        }
        return `
          <tr>
            <td class="stat-label">${s.label}</td>
            <td class="stat-cand-val">${s.cand.toLocaleString()} ${deltaHtml}</td>
          </tr>
        `;
      }).join('')}
    </table>
  `;
}

/**
 * Renderiza o Dock de Comparação e Inspeção Inteligente (#l2inv-detail-panel)
 */
export function renderItemDetailAndComparison(item, state, callbacks = {}) {
  const dock = findElement('l2inv-detail-panel');
  if (!dock) return;
  if (!item) {
    dock.style.display = 'none';
    return;
  }

  const def = getItemDef(item.itemId) || item;
  if (!def) {
    dock.style.display = 'none';
    return;
  }

  dock.style.display = 'flex';

  const isGear = isEquipmentItem(def);
  const targetSlot = isGear ? resolveEquipSlot(def.slot, state?.equipment || {}) : null;
  const currentEquippedUid = (isGear && targetSlot) ? state?.equipment?.[targetSlot] : null;
  const currentEquippedItem = currentEquippedUid ? (state?.inventory || []).find(i => i.uid === currentEquippedUid) : null;
  const currentEquippedDef = currentEquippedItem ? (getItemDef(currentEquippedItem.itemId) || currentEquippedItem) : null;

  const isCurrentItemEquipped = item.equipped || (currentEquippedUid === item.uid);
  const isComparing = isGear && !isCurrentItemEquipped && currentEquippedItem;

  // Cálculo de Real Combat Impact & CP Delta
  let cpDelta = 0;
  let cpPct = '0.0';
  let impactClass = 'impact-neutral';
  let impactLabel = '◆ EQUIVALENTE';

  if (isComparing) {
    const curCp = CombatPowerService.calculateCombatPower(state);
    const simEquip = { ...(state.equipment || {}), [targetSlot]: item.uid };
    if (isTwoHandedWeapon(def)) {
      if (simEquip.shield) simEquip.shield = null;
      if (simEquip.weapon2) simEquip.weapon2 = null;
    }
    const simCp = CombatPowerService.calculateCombatPower({ ...state, equipment: simEquip });
    cpDelta = simCp - curCp;
    cpPct = curCp > 0 ? ((cpDelta / curCp) * 100).toFixed(1) : '0.0';

    if (cpDelta > 0) {
      impactClass = 'impact-upgrade';
      impactLabel = `▲ UPGRADE RECOMENDADO (+${cpDelta.toLocaleString()} CP / +${cpPct}% Impacto Real)`;
    } else if (cpDelta < 0) {
      impactClass = 'impact-downgrade';
      impactLabel = `▼ REDUÇÃO DE PODER (${cpDelta.toLocaleString()} CP / ${cpPct}% Impacto Real)`;
    }
  } else if (isGear && !isCurrentItemEquipped && !currentEquippedItem) {
    const curCp = CombatPowerService.calculateCombatPower(state);
    const simEquip = { ...(state.equipment || {}), [targetSlot]: item.uid };
    if (isTwoHandedWeapon(def)) {
      if (simEquip.shield) simEquip.shield = null;
      if (simEquip.weapon2) simEquip.weapon2 = null;
    }
    const simCp = CombatPowerService.calculateCombatPower({ ...state, equipment: simEquip });
    cpDelta = simCp - curCp;
    cpPct = curCp > 0 ? ((cpDelta / curCp) * 100).toFixed(1) : '0.0';
    impactClass = 'impact-upgrade';
    impactLabel = `▲ SLOT VAZIO: GANHO DIRETO (+${cpDelta.toLocaleString()} CP / +${cpPct}% Impacto Real)`;
  }

  let html = `
    <div class="detail-dock-header">
      <div class="detail-dock-title">
        <span>🔎</span>
        <span>${isComparing ? 'Comparação Inteligente de Equipamentos' : 'Detalhes do Item'}</span>
        ${targetSlot ? `<span style="font-size:10px; color:#94a3b8; font-weight:normal;">[Slot: ${targetSlot}]</span>` : ''}
      </div>
      <button class="detail-dock-close-btn" id="dock-close-btn" title="Fechar painel de detalhes">✕</button>
    </div>
  `;

  if (isComparing) {
    html += `
      <div class="detail-comparison-grid">
        <!-- Card 1: Equipado Atualmente -->
        <div class="detail-card current">
          <div class="detail-card-badge-row">
            <span class="detail-card-role equipped">🛡️ Atual (Equipado)</span>
            <span class="tier-badge">${(currentEquippedDef.grade || 'NG').toUpperCase()}</span>
          </div>
          <div class="detail-item-identity">
            <div class="detail-item-icon-box rarity-${currentEquippedItem.rarity || 'common'}">
              ${getItemIcon(currentEquippedDef)}
            </div>
            <div class="detail-item-info">
              <div class="detail-item-name" style="color:${getRarityColor(currentEquippedItem.rarity)}">
                ${(currentEquippedItem.enchant ? `+${currentEquippedItem.enchant} ` : '') + currentEquippedDef.name}
              </div>
              <div class="detail-item-submeta">
                <span>${currentEquippedItem.rarity ? currentEquippedItem.rarity.toUpperCase() : 'COMUM'}</span>
                <span>• Nível ${currentEquippedDef.req?.level || currentEquippedDef.level || 1}</span>
              </div>
            </div>
          </div>
          ${renderItemStatsTable(currentEquippedItem, currentEquippedDef)}
        </div>

        <!-- Card 2: Item Selecionado / Proposto -->
        <div class="detail-card candidate">
          <div class="detail-card-badge-row">
            <span class="detail-card-role selected">⚡ Proposta / Selecionado</span>
            <span class="tier-badge">${(def.grade || 'NG').toUpperCase()}</span>
          </div>
          <div class="detail-item-identity">
            <div class="detail-item-icon-box rarity-${item.rarity || 'common'}">
              ${getItemIcon(def)}
            </div>
            <div class="detail-item-info">
              <div class="detail-item-name" style="color:${getRarityColor(item.rarity)}">
                ${(item.enchant ? `+${item.enchant} ` : '') + def.name}
              </div>
              <div class="detail-item-submeta">
                <span>${item.rarity ? item.rarity.toUpperCase() : 'COMUM'}</span>
                <span>• Nível ${def.req?.level || def.level || 1}</span>
              </div>
            </div>
          </div>
          ${renderComparisonStatsTable(currentEquippedItem, currentEquippedDef, item, def)}
        </div>
      </div>

      <div class="impact-decision-banner ${impactClass}">
        <span>${impactLabel}</span>
        <span>ΔCP: ${cpDelta >= 0 ? '+' : ''}${cpDelta.toLocaleString()}</span>
      </div>
    `;
  } else {
    html += `
      <div class="detail-card candidate" style="max-width:100%;">
        <div class="detail-card-badge-row">
          <span class="detail-card-role ${isCurrentItemEquipped ? 'equipped' : 'selected'}">
            ${isCurrentItemEquipped ? '🛡️ Equipado' : '🎒 Na Mochila'}
          </span>
          ${def.grade ? `<span class="tier-badge">${def.grade.toUpperCase()}</span>` : ''}
        </div>
        <div class="detail-item-identity">
          <div class="detail-item-icon-box rarity-${item.rarity || 'common'}">
            ${getItemIcon(def)}
          </div>
          <div class="detail-item-info">
            <div class="detail-item-name" style="color:${getRarityColor(item.rarity)}">
              ${(item.enchant ? `+${item.enchant} ` : '') + def.name}
            </div>
            <div class="detail-item-submeta">
              <span>${item.rarity ? item.rarity.toUpperCase() : 'COMUM'}</span>
              <span>• Qtd: ${item.count || 1}</span>
              ${def.req?.level ? `<span>• Nível ${def.req.level}</span>` : ''}
            </div>
          </div>
        </div>
        ${isGear ? renderItemStatsTable(item, def) : `<div style="font-size:11px; color:#94a3b8; font-style:italic;">${def.desc || 'Consumível ou material de Aden.'}</div>`}
      </div>
      ${isGear && !isCurrentItemEquipped ? `
        <div class="impact-decision-banner ${impactClass}">
          <span>${impactLabel}</span>
          <span>ΔCP: +${cpDelta.toLocaleString()}</span>
        </div>
      ` : ''}
    `;
  }

  const isFav = !!(item.isFavorite || item.favorite);
  const reqLvl = def.req ? (def.req.level || 1) : (def.level || 1);
  const canCrystallize = isGear && !isCurrentItemEquipped && (reqLvl >= 20 || (def.tier || 1) >= 2);
  const isConsumable = ['consumable', 'potion', 'scroll', 'powerup', 'food'].includes(String(def.slot || '').toLowerCase());

  const sMeta = parseEnchantScroll(def);
  const isEnchantScrollItem = sMeta && sMeta.isScroll;
  const hasCompatibleEnchantScroll = isGear && (state.inventory || []).some(i => {
    const sDef = getItemDef(i.itemId) || i;
    const meta = parseEnchantScroll(sDef);
    return meta && meta.isScroll && isItemCompatibleWithScroll(def, sDef).ok;
  });

  html += `
    <div class="detail-actions-row">
      ${isGear && !isCurrentItemEquipped ? `
        <button class="detail-action-btn equip" id="dock-btn-equip">⚡ Equipar Agora</button>
      ` : ''}
      ${isCurrentItemEquipped ? `
        <button class="detail-action-btn unequip" id="dock-btn-unequip">❌ Desequipar</button>
      ` : ''}
      ${isEnchantScrollItem ? `
        <button class="detail-action-btn equip" id="dock-btn-enchant-scroll" style="background:linear-gradient(135deg, #7e22ce, #b45309); color:#fff; border:1px solid #f59e0b; font-weight:bold;">✨ Encantar Equipamento</button>
      ` : (isConsumable ? `
        <button class="detail-action-btn equip" id="dock-btn-use">🧪 Usar Consumível</button>
      ` : '')}
      ${hasCompatibleEnchantScroll ? `
        <button class="detail-action-btn enchant" id="dock-btn-enchant" style="background:linear-gradient(135deg, #0284c7, #2563eb); color:#fff; border:1px solid #38bdf8; font-weight:bold;">✨ Encantar</button>
      ` : ''}
      <button class="detail-action-btn favorite ${isFav ? 'active' : ''}" id="dock-btn-favorite" title="${isFav ? 'Remover favorito' : 'Proteger contra venda/desmanche'}">
        ${isFav ? '⭐ Favorito (Protegido)' : '☆ Favoritar'}
      </button>
      ${!isCurrentItemEquipped && isGear ? `
        <button class="detail-action-btn salvage" id="dock-btn-salvage" title="Desmanchar em materiais">🔨 Desmanchar</button>
      ` : ''}
      ${canCrystallize ? `
        <button class="detail-action-btn crystallize" id="dock-btn-crystallize" title="Cristalizar em cristais elementares">💎 Cristalizar</button>
      ` : ''}
      ${!isCurrentItemEquipped ? `
        <button class="detail-action-btn sell" id="dock-btn-sell" title="Vender por Adena">💰 Vender</button>
      ` : ''}
    </div>
  `;

  dock.innerHTML = html;

  const closeBtn = dock.querySelector('#dock-close-btn');
  if (closeBtn) closeBtn.onclick = () => {
    dock.style.display = 'none';
    window._inspectedItemUid = null;
    updateInventoryUI(state, callbacks);
  };

  const btnEquip = dock.querySelector('#dock-btn-equip');
  if (btnEquip) btnEquip.onclick = () => {
    const equipFn = callbacks.equipItem || (typeof window !== 'undefined' ? window.equipItem : null);
    if (equipFn) equipFn(item.uid, state);
    dock.style.display = 'none';
    window._inspectedItemUid = null;
  };

  const btnUnequip = dock.querySelector('#dock-btn-unequip');
  if (btnUnequip) btnUnequip.onclick = () => {
    const unequipFn = callbacks.unequipItem || (typeof window !== 'undefined' ? window.unequipItem : null);
    if (unequipFn) unequipFn(item.equippedSlot || targetSlot, state);
    dock.style.display = 'none';
    window._inspectedItemUid = null;
  };

  const btnUse = dock.querySelector('#dock-btn-use');
  if (btnUse) btnUse.onclick = () => {
    if (callbacks.useItem) callbacks.useItem(item.uid);
    else if (window.useItem) window.useItem(item.uid);
  };

  const btnEnchantScroll = dock.querySelector('#dock-btn-enchant-scroll');
  if (btnEnchantScroll) btnEnchantScroll.onclick = () => {
    openEnchantFlowModal(null, item.uid, state, callbacks);
    dock.style.display = 'none';
  };

  const btnEnchant = dock.querySelector('#dock-btn-enchant');
  if (btnEnchant) btnEnchant.onclick = () => {
    openEnchantFlowModal(item.uid, null, state, callbacks);
    dock.style.display = 'none';
  };

  const btnFav = dock.querySelector('#dock-btn-favorite');
  if (btnFav) btnFav.onclick = () => {
    item.isFavorite = !item.isFavorite;
    item.favorite = item.isFavorite;
    if (callbacks.log) {
      callbacks.log(item.isFavorite ? `⭐ "${def.name}" marcado como Favorito (Protegido).` : `☆ "${def.name}" desmarcado de Favorito.`, 'system');
    }
    renderItemDetailAndComparison(item, state, callbacks);
    updateInventoryUI(state, callbacks);
    if (callbacks.save) callbacks.save();
  };

  const btnSalvage = dock.querySelector('#dock-btn-salvage');
  if (btnSalvage) btnSalvage.onclick = () => {
    openBatchSalvageModal(state, callbacks, [item.uid]);
  };

  const btnCryst = dock.querySelector('#dock-btn-crystallize');
  if (btnCryst) btnCryst.onclick = () => {
    openBatchCrystallizeModal(state, callbacks, [item.uid]);
  };

  const btnSell = dock.querySelector('#dock-btn-sell');
  if (btnSell) btnSell.onclick = () => {
    openBatchSellModal(state, callbacks, [item.uid]);
  };
}

export function closeInventoryPreviewModal() {
  const overlay = findElement('inv-preview-modal-overlay');
  if (overlay) overlay.style.display = 'none';
}

export function openAutoEquipPreviewModal(state, callbacks = {}) {
  const proposal = generateAutoEquipProposal(state);
  if (!proposal || proposal.changes.length === 0) {
    if (callbacks.log) {
      callbacks.log('✨ Seus equipamentos já estão perfeitamente otimizados pelo algoritmo ERS!', 'system');
    }
    alert('✨ Seus equipamentos já estão perfeitamente otimizados para sua classe e build!');
    return;
  }

  const overlay = findElement('inv-preview-modal-overlay');
  const title = findElement('inv-modal-title');
  const body = findElement('inv-modal-body');
  const confirmBtn = findElement('inv-modal-confirm-btn');
  const cancelBtn = findElement('inv-modal-cancel-btn');
  const closeBtn = findElement('inv-modal-close-btn');

  if (!overlay || !body) return;

  if (title) title.innerHTML = '⚡ Proposta de Otimização de Equipamentos (ERS)';

  const allItems = D()?.ALL_ITEMS || {};
  const d = proposal.deltas;
  const cpGain = proposal.proposedCp - proposal.currentCp;

  let bodyHtml = `
    <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:6px; padding:10px; margin-bottom:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:bold; color:var(--gilt-bright);">Poder de Combate (CP):</span>
        <span style="font-family:'IBM Plex Mono',monospace; font-size:13px; font-weight:bold;">
          ${proposal.currentCp.toLocaleString()} → <span style="color:#4ade80;">${proposal.proposedCp.toLocaleString()}</span>
          <span style="color:#4ade80; margin-left:6px;">(+${cpGain.toLocaleString()} CP)</span>
        </span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; font-size:10px;">
        <div>P.Atk: <strong style="color:${d.atkDelta >= 0 ? '#4ade80' : '#f87171'}">${d.atkDelta >= 0 ? '+' : ''}${d.atkDelta}</strong></div>
        <div>M.Atk: <strong style="color:${d.matkDelta >= 0 ? '#4ade80' : '#f87171'}">${d.matkDelta >= 0 ? '+' : ''}${d.matkDelta}</strong></div>
        <div>P.Def: <strong style="color:${d.defDelta >= 0 ? '#4ade80' : '#f87171'}">${d.defDelta >= 0 ? '+' : ''}${d.defDelta}</strong></div>
        <div>M.Def: <strong style="color:${d.mdefDelta >= 0 ? '#4ade80' : '#f87171'}">${d.mdefDelta >= 0 ? '+' : ''}${d.mdefDelta}</strong></div>
        <div>Max HP: <strong style="color:${d.hpDelta >= 0 ? '#4ade80' : '#f87171'}">${d.hpDelta >= 0 ? '+' : ''}${d.hpDelta}</strong></div>
        <div>Crítico: <strong style="color:${d.critDelta >= 0 ? '#4ade80' : '#f87171'}">${d.critDelta >= 0 ? '+' : ''}${d.critDelta}%</strong></div>
      </div>
    </div>

    <div style="font-weight:bold; color:#cbd5e1; margin-bottom:6px;">Alterações Propostas (${proposal.changes.length}):</div>
    <div style="display:flex; flex-direction:column; gap:6px;">
  `;

  for (const chg of proposal.changes) {
    const curDef = chg.currentItem ? (allItems[chg.currentItem.itemId] || chg.currentItem) : null;
    const propDef = chg.proposedItem ? (allItems[chg.proposedItem.itemId] || chg.proposedItem) : null;

    bodyHtml += `
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:6px 10px; display:flex; align-items:center; justify-content:space-between; font-size:11px;">
        <span style="font-weight:bold; color:var(--gilt); text-transform:uppercase; font-size:10px; min-width:80px;">${chg.slot}:</span>
        <span style="color:#94a3b8; flex:1; text-align:right; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${curDef ? curDef.name : '<span style="color:#64748b;">(Vazio)</span>'}
        </span>
        <span style="margin:0 8px; color:var(--gilt-bright);">➔</span>
        <span style="color:#86efac; font-weight:600; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${propDef ? propDef.name : `<span style="color:#f87171;">${chg.reason || 'Desequipado'}</span>`}
        </span>
      </div>
    `;
  }

  bodyHtml += `</div>`;
  body.innerHTML = bodyHtml;

  overlay.style.display = 'flex';

  confirmBtn.textContent = '⚡ Confirmar Otimização';
  confirmBtn.onclick = () => {
    const res = commitAutoEquipProposal(state, proposal, callbacks);
    closeInventoryPreviewModal();
    if (res && res.success) {
      if (callbacks.log) {
        callbacks.log(`⚡ Equipamentos otimizados com sucesso! (+${cpGain.toLocaleString()} CP)`, 'rarity-legendary');
      }
      updateInventoryUI(state, callbacks);
      if (callbacks.save) callbacks.save();
    }
  };

  cancelBtn.onclick = closeInventoryPreviewModal;
  if (closeBtn) closeBtn.onclick = closeInventoryPreviewModal;
}

export function openBatchSellModal(state, callbacks = {}, uids) {
  const uidsToUse = uids || getSelectedSet(state);
  const preview = getBatchSellPreview(state, uidsToUse);

  if (preview.items.length === 0) {
    if (preview.protectedCount > 0) {
      alert(`🛡️ Todos os itens selecionados (${preview.protectedCount}) estão protegidos (equipados, favoritos ou missões) e não podem ser vendidos.`);
    } else {
      alert('Nenhum item selecionado para venda.');
    }
    return;
  }

  const overlay = findElement('inv-preview-modal-overlay');
  const title = findElement('inv-modal-title');
  const body = findElement('inv-modal-body');
  const confirmBtn = findElement('inv-modal-confirm-btn');
  const cancelBtn = findElement('inv-modal-cancel-btn');
  const closeBtn = findElement('inv-modal-close-btn');

  if (!overlay || !body) return;

  if (title) title.innerHTML = `💰 Venda em Lote (${preview.totalCount} itens)`;

  let bodyHtml = '';

  if (preview.hasHighValue) {
    bodyHtml += `
      <div class="preview-high-value-warning">
        <span>⚠️</span>
        <span>ATENÇÃO: A seleção inclui itens de alta raridade (Raro ou superior)! Deseja realmente vendê-los?</span>
      </div>
    `;
  }

  bodyHtml += `
    <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:6px; padding:10px; margin-bottom:12px; display:flex; align-items:center; justify-content:space-between;">
      <span style="font-size:12px; color:#cbd5e1;">Ouro Total a Receber:</span>
      <span style="font-size:14px; font-weight:bold; color:var(--gilt-bright);">🪙 ${preview.totalGold.toLocaleString()} Adena</span>
    </div>
  `;

  if (preview.protectedCount > 0) {
    bodyHtml += `
      <div style="font-size:10px; color:#38bdf8; margin-bottom:8px;">
        🛡️ ${preview.protectedCount} item(ns) protegidos foram automaticamente preservados.
      </div>
    `;
  }

  bodyHtml += `
    <div style="max-height:220px; overflow-y:auto; border:1px solid rgba(255,255,255,0.08); border-radius:4px;">
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:rgba(0,0,0,0.4); border-bottom:1px solid rgba(212,167,68,0.2);">
            <th style="padding:6px; text-align:left;">Item</th>
            <th style="padding:6px; text-align:center;">Qtd</th>
            <th style="padding:6px; text-align:right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${preview.items.map(it => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:6px; color:${getRarityColor(it.rarity)};">
                ${it.enchant ? `+${it.enchant} ` : ''}${it.name}
              </td>
              <td style="padding:6px; text-align:center; color:#94a3b8;">${it.count}</td>
              <td style="padding:6px; text-align:right; color:#fde047;">🪙 ${it.gold.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  body.innerHTML = bodyHtml;
  overlay.style.display = 'flex';

  confirmBtn.textContent = `💰 Confirmar Venda (+${preview.totalGold.toLocaleString()}g)`;
  confirmBtn.onclick = () => {
    for (const uid of preview.uidsToSell) {
      removeFromInventory(state, uid);
    }
    state.gold = (Number(state.gold) || 0) + preview.totalGold;
    clearItemSelection(state);
    closeInventoryPreviewModal();
    if (callbacks.log) {
      callbacks.log(`💰 Vendeu ${preview.totalCount} itens por ${preview.totalGold.toLocaleString()} Adena!`, 'loot');
    }
    updateInventoryUI(state, callbacks);
    if (callbacks.save) callbacks.save();
  };

  cancelBtn.onclick = closeInventoryPreviewModal;
  if (closeBtn) closeBtn.onclick = closeInventoryPreviewModal;
}

export function openBatchSalvageModal(state, callbacks = {}, uids) {
  const uidsToUse = uids || getSelectedSet(state);
  const preview = getBatchSalvagePreview(state, uidsToUse);

  if (preview.items.length === 0) {
    if (preview.protectedCount > 0) {
      alert(`🛡️ Todos os itens selecionados (${preview.protectedCount}) estão protegidos e não podem ser desmontados.`);
    } else {
      alert('Nenhum equipamento selecionado para desmontar.');
    }
    return;
  }

  const overlay = findElement('inv-preview-modal-overlay');
  const title = findElement('inv-modal-title');
  const body = findElement('inv-modal-body');
  const confirmBtn = findElement('inv-modal-confirm-btn');
  const cancelBtn = findElement('inv-modal-cancel-btn');
  const closeBtn = findElement('inv-modal-close-btn');

  if (!overlay || !body) return;

  if (title) title.innerHTML = `🔨 Desmanche em Lote (${preview.totalCount} equipamentos)`;

  let bodyHtml = '';

  if (preview.hasHighValue) {
    bodyHtml += `
      <div class="preview-high-value-warning">
        <span>⚠️</span>
        <span>ATENÇÃO: A seleção inclui itens de alta raridade (Raro ou superior)! Deseja realmente desmontá-los?</span>
      </div>
    `;
  }

  const allItems = D()?.ALL_ITEMS || {};
  bodyHtml += `
    <div style="margin-bottom:12px;">
      <div style="font-weight:bold; color:var(--gilt-bright); margin-bottom:6px;">Rendimento Estimado de Materiais:</div>
      <div class="preview-yield-pills">
        ${Object.entries(preview.yieldSummary).map(([matId, amt]) => `
          <div class="preview-yield-pill">
            <span>📦</span>
            <span>+${amt}x ${allItems[matId]?.name || matId}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="max-height:200px; overflow-y:auto; border:1px solid rgba(255,255,255,0.08); border-radius:4px;">
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:rgba(0,0,0,0.4); border-bottom:1px solid rgba(212,167,68,0.2);">
            <th style="padding:6px; text-align:left;">Equipamento</th>
            <th style="padding:6px; text-align:right;">Material Gerado</th>
          </tr>
        </thead>
        <tbody>
          ${preview.items.map(it => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:6px; color:${getRarityColor(it.rarity)};">
                ${it.enchant ? `+${it.enchant} ` : ''}${it.name}
              </td>
              <td style="padding:6px; text-align:right; color:#93c5fd;">
                +${it.amount}x ${allItems[it.matId]?.name || it.matId}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  body.innerHTML = bodyHtml;
  overlay.style.display = 'flex';

  confirmBtn.textContent = `🔨 Confirmar Desmanche (${preview.totalCount} itens)`;
  confirmBtn.onclick = () => {
    for (const uid of preview.uidsToSalvage) {
      removeFromInventory(state, uid);
    }
    for (const [matId, amt] of Object.entries(preview.yieldSummary)) {
      addToInventory(state, matId, amt);
    }
    clearItemSelection(state);
    closeInventoryPreviewModal();
    if (callbacks.log) {
      callbacks.log(`🔨 Desmontou ${preview.totalCount} equipamento(s) e obteve materiais!`, 'loot');
    }
    updateInventoryUI(state, callbacks);
    if (callbacks.save) callbacks.save();
  };

  cancelBtn.onclick = closeInventoryPreviewModal;
  if (closeBtn) closeBtn.onclick = closeInventoryPreviewModal;
}

export function openBatchCrystallizeModal(state, callbacks = {}, uids) {
  const uidsToUse = uids || getSelectedSet(state);
  const preview = getCrystallizationPreview(state, uidsToUse);

  if (preview.items.length === 0) {
    if (preview.protectedCount > 0) {
      alert(`🛡️ Todos os itens selecionados (${preview.protectedCount}) estão protegidos e não podem ser cristalizados.`);
    } else {
      alert('Nenhum equipamento de Grau D a S disponível para cristalização.');
    }
    return;
  }

  const overlay = findElement('inv-preview-modal-overlay');
  const title = findElement('inv-modal-title');
  const body = findElement('inv-modal-body');
  const confirmBtn = findElement('inv-modal-confirm-btn');
  const cancelBtn = findElement('inv-modal-cancel-btn');
  const closeBtn = findElement('inv-modal-close-btn');

  if (!overlay || !body) return;

  if (title) title.innerHTML = `💎 Cristalização em Lote (${preview.totalCount} equipamentos)`;

  let bodyHtml = '';

  if (preview.hasHighValue) {
    bodyHtml += `
      <div class="preview-high-value-warning">
        <span>⚠️</span>
        <span>ATENÇÃO: A seleção inclui equipamentos de alta raridade (Raro ou superior)! Deseja realmente cristalizá-los?</span>
      </div>
    `;
  }

  const allItems = D()?.ALL_ITEMS || {};
  bodyHtml += `
    <div style="margin-bottom:12px;">
      <div style="font-weight:bold; color:var(--gilt-bright); margin-bottom:6px;">Cristais Elementares Gerados:</div>
      <div class="preview-yield-pills">
        ${Object.entries(preview.yieldSummary).map(([cId, amt]) => `
          <div class="preview-yield-pill" style="border-color:#60a5fa; color:#93c5fd;">
            <span>💎</span>
            <span>+${amt}x ${allItems[cId]?.name || cId}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="max-height:200px; overflow-y:auto; border:1px solid rgba(255,255,255,0.08); border-radius:4px;">
      <table style="width:100%; border-collapse:collapse; font-size:11px;">
        <thead>
          <tr style="background:rgba(0,0,0,0.4); border-bottom:1px solid rgba(212,167,68,0.2);">
            <th style="padding:6px; text-align:left;">Equipamento</th>
            <th style="padding:6px; text-align:right;">Cristais Gerados</th>
          </tr>
        </thead>
        <tbody>
          ${preview.items.map(it => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
              <td style="padding:6px; color:${getRarityColor(it.rarity)};">
                ${it.enchant ? `+${it.enchant} ` : ''}${it.name}
              </td>
              <td style="padding:6px; text-align:right; color:#60a5fa; font-weight:bold;">
                +${it.amount}x ${allItems[it.crystalId]?.name || it.crystalId}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  body.innerHTML = bodyHtml;
  overlay.style.display = 'flex';

  confirmBtn.textContent = `💎 Confirmar Cristalização (${preview.totalCount} itens)`;
  confirmBtn.onclick = () => {
    for (const uid of preview.uidsToCrystallize) {
      removeFromInventory(state, uid);
    }
    for (const [cId, amt] of Object.entries(preview.yieldSummary)) {
      addToInventory(state, cId, amt);
    }
    clearItemSelection(state);
    closeInventoryPreviewModal();
    if (callbacks.log) {
      callbacks.log(`💎 Cristalizou ${preview.totalCount} equipamento(s) com sucesso!`, 'rarity-legendary');
    }
    updateInventoryUI(state, callbacks);
    if (callbacks.save) callbacks.save();
  };

  cancelBtn.onclick = closeInventoryPreviewModal;
  if (closeBtn) closeBtn.onclick = closeInventoryPreviewModal;
}

if (typeof window !== 'undefined') {
  window.openAutoEquipPreviewModal = openAutoEquipPreviewModal;
  window.openBatchSellModal = openBatchSellModal;
  window.openBatchSalvageModal = openBatchSalvageModal;
  window.openBatchCrystallizeModal = openBatchCrystallizeModal;
  window.closeInventoryPreviewModal = closeInventoryPreviewModal;
  window.renderItemDetailAndComparison = renderItemDetailAndComparison;
}

export function updateWarehouseUI(state, callbacks = {}) {
  if (!state || typeof state !== 'object') {
    state = (typeof window !== 'undefined' && window.state) ? window.state : {};
  }
  updateImperialEconomyHeader(state);
  ensureInventoryStyles();
  const whStorageGrid = findElement('wh-storage-grid') || findElement('warehouse-grid');
  const whInvGrid = findElement('wh-inventory-grid');
  const storageCountEl = findElement('wh-storage-count') || findElement('warehouse-slot-count');
  const invCountEl = findElement('wh-inv-count');

  if (!whStorageGrid && !whInvGrid) return;

  state.warehouse = state.warehouse || [];
  const maxWhSlots = getMaxWarehouseSlots();
  const maxInvSlots = getMaxInventorySlots(state);

  if (storageCountEl) storageCountEl.textContent = `${state.warehouse.length} / ${maxWhSlots} slots`;
  if (invCountEl) invCountEl.textContent = `${state.inventory?.length || 0} / ${maxInvSlots} slots`;

  const invGaugeFill = findElement('wh-inv-gauge-fill');
  const storageGaugeFill = findElement('wh-storage-gauge-fill');
  if (invGaugeFill) {
    const invPct = Math.min(100, Math.round(((state.inventory?.length || 0) / (maxInvSlots || 1)) * 100));
    invGaugeFill.style.width = `${invPct}%`;
  }
  if (storageGaugeFill) {
    const stPct = Math.min(100, Math.round(((state.warehouse?.length || 0) / (maxWhSlots || 1)) * 100));
    storageGaugeFill.style.width = `${stPct}%`;
  }

  // 1. Render Right Side: Warehouse Items
  if (whStorageGrid) {
    whStorageGrid.innerHTML = '';
    for (const item of state.warehouse) {
      const def = getItemDef(item.itemId);
      if (!def) continue;

      const slotEl = mkEl('div');
      const rarity = item.rarity || 'common';
      slotEl.className = `inv-slot rarity-${rarity}`;
      slotEl.dataset.uid = item.uid;

      const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';
      slotEl.innerHTML = `<span class="item-icon">${getItemIcon(def || item)}</span>${countBadge}`;
      slotEl.title = def.name;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => {
        if (callbacks.withdrawFromWarehouse) callbacks.withdrawFromWarehouse(item.uid);
        else if (window.withdrawFromWarehouse) window.withdrawFromWarehouse(item.uid);
      };

      whStorageGrid.appendChild(slotEl);
    }
  }

  // 2. Render Left Side: Inventory Items for Warehouse view
  if (whInvGrid) {
    whInvGrid.innerHTML = '';
    const unequipped = (state.inventory || []).filter(i => i && i.itemId && !i.equipped);
    for (const item of unequipped) {
      const def = getItemDef(item.itemId);
      if (!def) continue;

      const slotEl = mkEl('div');
      const rarity = item.rarity || 'common';
      slotEl.className = `inv-slot rarity-${rarity}`;
      slotEl.dataset.uid = item.uid;

      const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';
      slotEl.innerHTML = `<span class="item-icon">${getItemIcon(def || item)}</span>${countBadge}`;
      slotEl.title = def.name;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => {
        if (callbacks.depositToWarehouse) callbacks.depositToWarehouse(item.uid, item.count || 1);
        else if (window.depositToWarehouse) window.depositToWarehouse(item.uid, item.count || 1);
      };

      whInvGrid.appendChild(slotEl);
    }
  }
}

export function updateEquipmentUI(state, callbacks = {}) {
  if (!state || typeof state !== 'object') {
    state = (typeof window !== 'undefined' && window.state) ? window.state : {};
  }
  if (!state) return;
  state.equipment = state.equipment || {};
  ensureInventoryStyles();
  migrateEquipmentSlots(state);

  for (const slot of ALL_EQUIP_SLOTS) {
    if (slot === 'armor') continue; // chest é o slot canônico do paperdoll
    let slotEl = findEquipmentSlot(slot);
    if (!slotEl) slotEl = createEquipmentSlotDynamically(slot);
    if (!slotEl) continue;

    const uid = state.equipment[slot] || (slot === 'chest' ? state.equipment.armor : null);
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def = item ? getItemDef(item.itemId) : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      const penaltyCheck = (typeof window !== 'undefined' && window.BalanceEngine) ? window.BalanceEngine.checkGradePenalty(state.level || 1, def || item) : { hasPenalty: false };
      const enchantLevel = item.enchant || item.enchantLevel || 0;

      let slotClasses = `l2inv-pd-slot equip-slot has-item active rarity-${rarity}`;
      if (penaltyCheck.hasPenalty) slotClasses += ' has-grade-penalty';
      if (enchantLevel >= 16) slotClasses += ' enchant-halo-16';
      else if (enchantLevel >= 10) slotClasses += ' enchant-halo-10';
      else if (enchantLevel >= 4) slotClasses += ' enchant-halo-4';
      if (state.cosmetics?.activeFrame && state.cosmetics.activeFrame !== 'frame_default') {
        const frameClass = ITEM_FRAMES_CATALOG[state.cosmetics.activeFrame]?.cssClass || state.cosmetics.activeFrame;
        slotClasses += ` ${frameClass}`;
      }

      slotEl.className = slotClasses;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;
      slotEl.removeAttribute('title'); // Remove native title so it doesn't block rich custom tooltip

      const penaltyBadge = penaltyCheck.hasPenalty ? `<span class="grade-penalty-badge" style="position:absolute; top:-3px; right:-3px; background:#dc2626; color:#fff; font-size:8px; padding:1px 2px; border-radius:2px; font-weight:bold; box-shadow:0 0 4px #000;" title="${penaltyCheck.reason}">⚠️</span>` : '';
      const enchantBadge = enchantLevel > 0 
        ? `<span class="enchant-level-badge" style="position:absolute; bottom:2px; left:2px; background:rgba(0,0,0,0.85); color:${enchantLevel >= 16 ? '#d8b4fe' : enchantLevel >= 10 ? '#fca5a5' : '#7dd3fc'}; font-size:9px; font-weight:900; padding:1px 3px; border-radius:3px; border:1px solid currentColor; line-height:1; z-index:5;">+${enchantLevel}</span>`
        : '';

      slotEl.innerHTML = `${penaltyBadge}${enchantBadge}<span class="equip-icon">${getItemIcon(def || item)}</span>`;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = (ev) => {
        const tip = findElement('item-tooltip');
        const rel = ev?.relatedTarget;
        if (tip && (tip === rel || tip.contains(rel))) return;
        hideItemTooltip();
      };

      const handleInspect = (e) => {
        if (e) e.stopPropagation();
        window._inspectedItemUid = item.uid;
        renderItemDetailAndComparison(item, state, callbacks);
        updateInventoryUI(state, callbacks);
      };

      const handleUnequip = (e) => {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        hideItemTooltip();
        const unequipFn = callbacks.unequipItem || (typeof window !== 'undefined' ? window.unequipItem : null);
        if (unequipFn) {
          unequipFn(slot, state);
        }
      };

      slotEl.onclick = handleInspect;
      slotEl.oncontextmenu = handleUnequip;
      slotEl.ondblclick = handleUnequip;

      item.equipped = true;
      item.equippedSlot = slot;
    } else {
      slotEl.className = 'l2inv-pd-slot equip-slot empty';
      slotEl.dataset.slot = slot;
      delete slotEl.dataset.uid;

      slotEl.innerHTML = `<span class="equip-placeholder">${SLOT_ICONS[slot] || '📦'}</span>`;

      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
      slotEl.oncontextmenu = null;
      slotEl.ondblclick = null;
    }
  }

  // Renderiza o Badge de Ressonância Ativa do Dual Arsenal (estritamente dentro da Mochila)
  const root = getRoot();
  const activeRes = (typeof window !== 'undefined' && window.WeaponResonanceService)
    ? window.WeaponResonanceService.getActiveResonance(state)
    : null;

  // Limpa qualquer badge órfão inserido fora de tab-inventory
  const rogueBadges = root.querySelectorAll('.tab-content > #weapon-resonance-badge, #center-panel > #weapon-resonance-badge');
  rogueBadges.forEach(b => b.remove());

  const invTab = root.querySelector('#tab-inventory');
  if (invTab) {
    let resBadge = invTab.querySelector('#weapon-resonance-badge');
    if (!resBadge) {
      resBadge = mkEl('div');
      resBadge.id = 'weapon-resonance-badge';
      resBadge.className = 'weapon-resonance-badge';
      const anchor = invTab.querySelector('.l2inv-main-container') || invTab.firstChild;
      invTab.insertBefore(resBadge, anchor);
    }
    if (activeRes) {
      resBadge.style.display = 'flex';
      resBadge.style.borderColor = activeRes.color || '#eab308';
      resBadge.style.boxShadow = `0 4px 14px rgba(0,0,0,0.6), 0 0 10px ${(activeRes.color || '#eab308')}33`;
      resBadge.innerHTML = `
        <span class="res-icon">${activeRes.icon || '⚔️'}</span>
        <div class="res-info">
          <div class="res-title" style="color:${activeRes.color || '#eab308'}">RESSONÂNCIA: ${activeRes.name.toUpperCase()}</div>
          <div class="res-desc"><strong style="color:#f8fafc;">${activeRes.pairName}</strong> — ${activeRes.desc}</div>
        </div>
        <button onclick="window.openTabGuideModal && window.openTabGuideModal('resonance')" title="Ver catálogo de todas as 27 Ressonâncias no Guia" style="background: rgba(212,167,68,0.18); border: 1px solid rgba(212,167,68,0.45); color: #ffd877; font-family: 'Cinzel', serif; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 6px; cursor: pointer; white-space: nowrap; transition: all 0.2s; margin-left: 8px; display: inline-flex; align-items: center; gap: 4px; flex-shrink: 0;">
          📖 Guia
        </button>
      `;
    } else {
      resBadge.style.display = 'none';
    }
  }

  // Remove qualquer resquício do antigo container comprimido acima dos itens equipados
  const oldDualContainer = root.querySelector('#dual-resonance-hud-container');
  if (oldDualContainer) {
    oldDualContainer.remove();
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   4. STAGE & ZONE MAP (RESTAURAÇÃO COMPLETA DO DIORAMA E ZONAS)
═══════════════════════════════════════════════════════════════════════════ */
export function ensureStageStyles() {}

function ensureHeroStructure() {
  const root = getRoot();
  const heroCard = root.querySelector('#stage-hero, .stage-hero');
  if (!heroCard) return null;

  let name = heroCard.querySelector('#hero-name, .stage-hero-name');
  let level = heroCard.querySelector('#hero-level, .stage-hero-level');
  let hpBar = heroCard.querySelector('#hero-hp-bar, .stage-hp-bar-hero');
  let mpBar = heroCard.querySelector('#hero-mp-bar, .stage-mp-bar-hero');
  let sprite = heroCard.querySelector('#hero-sprite-container, .hero-sprite-host');

  if (!name || !level || !hpBar || !mpBar || !sprite) {
    heroCard.innerHTML = `
      <div id="hero-name" class="stage-entity-name stage-hero-name">—</div>
      <div id="hero-level" class="stage-entity-level stage-hero-level">Level 1</div>
      <div id="hero-hp-bar" class="stage-hp-bar stage-hp-bar-hero">
        <div id="hero-hp-fill" class="stage-hp-fill stage-hp-fill-hero"></div>
        <span id="hero-hp-text" class="stage-hp-text stage-hp-text-hero">HP: 0 / 0</span>
      </div>
      <div id="hero-mp-bar" class="stage-mp-bar stage-mp-bar-hero">
        <div id="hero-mp-fill" class="stage-mp-fill stage-mp-fill-hero"></div>
        <span id="hero-mp-text" class="stage-mp-text stage-mp-text-hero">MP: 0 / 0</span>
      </div>
      <div id="hero-sprite-container" class="hero-sprite-host"></div>
    `;
    name = heroCard.querySelector('#hero-name');
    level = heroCard.querySelector('#hero-level');
    hpBar = heroCard.querySelector('#hero-hp-bar');
    mpBar = heroCard.querySelector('#hero-mp-bar');
    sprite = heroCard.querySelector('#hero-sprite-container');
  }

  return { card: heroCard, name, level, hpBar, mpBar, sprite };
}

function ensureMonsterStructure() {
  const root = getRoot();
  const monsterCard = root.querySelector('#stage-monster, .stage-monster');
  if (!monsterCard) return null;

  let name = monsterCard.querySelector('#monster-name, .stage-entity-name');
  let level = monsterCard.querySelector('#monster-level, .stage-monster-level');
  let hpBar = monsterCard.querySelector('#monster-hp-bar, .stage-hp-bar');
  let staggerBar = monsterCard.querySelector('#monster-stagger-bar, .stage-stagger-bar');
  let sprite = monsterCard.querySelector('#monster-sprite-container, .monster-sprite-host');

  if (!name || !level || !hpBar || !sprite || !staggerBar) {
    monsterCard.innerHTML = `
      <div id="monster-name" class="stage-entity-name">—</div>
      <div id="monster-level" class="stage-entity-level stage-monster-level">Level 1</div>
      <div id="monster-hp-bar" class="stage-hp-bar">
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">HP: 0 / 0</span>
      </div>
      <div id="monster-stagger-bar" class="stage-stagger-bar" style="display:none;">
        <div id="monster-stagger-fill" class="stage-stagger-fill"></div>
        <span id="monster-stagger-text" class="stage-stagger-text">POSTURA: 100%</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;
    name = monsterCard.querySelector('#monster-name');
    level = monsterCard.querySelector('#monster-level');
    hpBar = monsterCard.querySelector('#monster-hp-bar');
    staggerBar = monsterCard.querySelector('#monster-stagger-bar');
    sprite = monsterCard.querySelector('#monster-sprite-container');
  }

  return { card: monsterCard, name, level, hpBar, staggerBar, sprite };
}

export function renderStageHero(state) {
  if (!state) return;
  const structure = ensureHeroStructure();
  if (!structure?.card) return;

  const heroName = state.charName || state.heroName || state.playerName || state.name || 'Tristan';
  const heroLevel = state.level || 1;

  if (structure.name) {
    structure.name.textContent = heroName;
  }

  if (structure.level) {
    structure.level.textContent = `Level ${heroLevel}`;
  }

  if (state.hp !== undefined && state.hp <= 0 && state.maxHp > 0 && (!state.activeMonster || state.activeMonster.hp <= 0)) {
    state.hp = state.maxHp;
  }

  const curHp = Math.round(state.hp !== undefined ? Math.max(0, state.hp) : 100);
  const maxHp = Math.round(state.maxHp || curHp || 100);
  const curMp = Math.round(state.mp !== undefined ? Math.max(0, state.mp) : 50);
  const maxMp = Math.round(state.maxMp || curMp || 50);

  updateBar('hero-hp-fill', curHp, maxHp);
  updateBar('hero-hp-bar', curHp, maxHp);
  updateBar('hero-mp-fill', curMp, maxMp);
  updateBar('hero-mp-bar', curMp, maxMp);

  const heroHpText = structure.card.querySelector('#hero-hp-text, .stage-hp-text-hero');
  if (heroHpText) heroHpText.textContent = `HP: ${curHp} / ${maxHp}`;

  const heroMpText = structure.card.querySelector('#hero-mp-text, .stage-mp-text-hero');
  if (heroMpText) heroMpText.textContent = `MP: ${curMp} / ${maxMp}`;

  const vitHpText = el('hero-vital-hp');
  if (vitHpText) vitHpText.textContent = `${curHp.toLocaleString()} / ${maxHp.toLocaleString()}`;
  const vitHpBar = el('hero-vital-bar-hp');
  if (vitHpBar) vitHpBar.style.width = `${Math.max(0, Math.min(100, (curHp / maxHp) * 100))}%`;

  const vitMpText = el('hero-vital-mp');
  if (vitMpText) vitMpText.textContent = `${curMp.toLocaleString()} / ${maxMp.toLocaleString()}`;
  const vitMpBar = el('hero-vital-bar-mp');
  if (vitMpBar) vitMpBar.style.width = `${Math.max(0, Math.min(100, (curMp / maxMp) * 100))}%`;

  const maxCp = Math.round(state.maxCp || Math.floor(maxHp * 0.6) || 60);
  const curCp = Math.round(state.cp !== undefined ? Math.max(0, state.cp) : maxCp);
  const vitCpText = root.querySelector('#hero-vital-cp');
  if (vitCpText) vitCpText.textContent = `${curCp.toLocaleString()} / ${maxCp.toLocaleString()}`;
  const vitCpBar = root.querySelector('#hero-vital-bar-cp');
  if (vitCpBar) vitCpBar.style.width = `${Math.max(0, Math.min(100, (curCp / maxCp) * 100))}%`;

  if (structure.sprite && typeof heroSVG === 'function') {
    structure.sprite.innerHTML = heroSVG(state);
  }
}

export function renderStageMonster(state) {
  if (!state) return;
  const structure = ensureMonsterStructure();
  if (!structure?.card) return;

  let m = state.activeMonster;
  if (!m && state.target && MONSTERS[state.target]) {
    m = MONSTERS[state.target];
  }

  if (!m) {
    if (structure.name) structure.name.textContent = 'Procurando Inimigo...';
    if (structure.level) structure.level.textContent = '';
    if (structure.sprite) structure.sprite.innerHTML = '';
    updateBar('monster-hp-fill', 0, 1);
    updateBar('monster-hp-bar', 0, 1);
    const mHpText = structure.card.querySelector('#monster-hp-text, .stage-hp-text');
    if (mHpText) mHpText.textContent = 'HP: 0';
    if (structure.staggerBar) structure.staggerBar.style.display = 'none';
    const emptyMiniNames = document.querySelectorAll('.mini-target-name');
    const emptyMiniFills = document.querySelectorAll('.mini-target-bar-fill');
    if (emptyMiniNames.length > 0) {
      emptyMiniNames.forEach(el => el.textContent = '⚔️ Procurando Inimigo...');
      emptyMiniFills.forEach(el => el.style.width = '0%');
    }
    return;
  }

  const isBoss = !!(m.isBoss || m.boss);
  const isElite = !!(m.isElite || m.elite);
  structure.card.classList.add('frame-relic');
  structure.card.classList.toggle('frame-relic-boss', isBoss);
  structure.card.classList.toggle('frame-relic-elite', !isBoss && isElite);
  structure.card.classList.toggle('frame-relic-monster', !isBoss && !isElite);

  if (structure.name) {
    const badge = m.boss ? ' ★' : (m.isElite || m.elite ? ' ⚔' : '');
    structure.name.textContent = `${m.name || 'Monstro'}${badge}`;
  }

  if (structure.level) {
    const mLvl = m.level || m.lvl || (ZONES[state?.zone]?.level || 1);
    const archKey = m.archetype || MonsterAIEngine.getMonsterArchetype(m);
    const arch = ARCHETYPE_INFO[archKey] || ARCHETYPE_INFO.berserker;
    const diff = MonsterAIEngine.getDifficulty(state);
    const diffText = (diff && diff.id !== 'normal') ? ` · <span style="color:${diff.color}; font-weight:700;">${diff.icon} ${diff.name}</span>` : '';
    structure.level.innerHTML = `Lv.${mLvl} · <span style="color:${arch.color}; font-weight:bold;">${arch.icon} ${arch.label}</span>${diffText}`;
  }

  const curHp = Math.round(m.hp !== undefined ? m.hp : (m._maxHp || m.maxHp || 100));
  const maxHp = Math.round(m._maxHp || m.maxHp || curHp || 100);

  updateBar('monster-hp-fill', curHp, maxHp);
  updateBar('monster-hp-bar', curHp, maxHp);

  const monsterHpText = structure.card.querySelector('#monster-hp-text, .stage-hp-text');
  if (monsterHpText) monsterHpText.textContent = `HP: ${curHp} / ${maxHp}`;

  const liveMiniNames = document.querySelectorAll('.mini-target-name');
  const liveMiniFills = document.querySelectorAll('.mini-target-bar-fill');
  if (liveMiniNames.length > 0) {
    const hpPct = Math.max(0, Math.min(100, Math.round((curHp / (maxHp || 1)) * 100)));
    const badge = isBoss ? '👑 ' : (isElite ? '★ ' : '');
    const displayName = `${badge}${m.name || 'Monstro'} (${hpPct}%)`;
    liveMiniNames.forEach(el => el.textContent = `⚔️ ${displayName}`);
    liveMiniFills.forEach(el => el.style.width = `${hpPct}%`);
  }

  // Atualização da Barra de Postura (Stagger Bar) dos Chefes e Elites
  const sBar = structure.staggerBar || structure.card.querySelector('#monster-stagger-bar');
  if (sBar) {
    if (m.staggerMax && m.staggerMax > 0) {
      sBar.style.display = 'block';
      const sFill = sBar.querySelector('#monster-stagger-fill, .stage-stagger-fill');
      const sText = sBar.querySelector('#monster-stagger-text, .stage-stagger-text');
      const realNow = Date.now();
      const isBreak = m.breakUntil && m.breakUntil > realNow;
      const isFatal = m.isChannelingFatal && m.fatalCastUntil && m.fatalCastUntil > realNow;

      if (isBreak) {
        sBar.classList.add('stage-stagger-break');
        sBar.classList.remove('stage-stagger-fatal');
        structure.card.classList.add('stage-break-active');
        structure.card.classList.remove('stage-fatal-active');
        const diffMs = Math.max(0, m.breakUntil - realNow);
        const timeLeft = (diffMs / 1000).toFixed(1);
        if (sFill) {
          sFill.style.width = '100%';
          sFill.style.background = '';
        }
        if (sText) sText.textContent = `💥 VULNERÁVEL [${timeLeft}s] (2.0x DANO)`;
      } else if (isFatal) {
        sBar.classList.remove('stage-stagger-break');
        sBar.classList.add('stage-stagger-fatal');
        structure.card.classList.remove('stage-break-active');
        structure.card.classList.add('stage-fatal-active');
        const diffMs = Math.max(0, m.fatalCastUntil - realNow);
        const timeLeft = (diffMs / 1000).toFixed(1);
        const pct = Math.max(0, Math.min(100, Math.round(((m.staggerCurrent ?? m.staggerMax) / m.staggerMax) * 100)));
        if (sFill) {
          sFill.style.width = `${pct}%`;
          sFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
        if (sText) sText.textContent = `⚠️ INTERROMPA: POSTURA [${pct}%] [${timeLeft}s]`;
      } else {
        sBar.classList.remove('stage-stagger-break');
        sBar.classList.remove('stage-stagger-fatal');
        structure.card.classList.remove('stage-break-active');
        structure.card.classList.remove('stage-fatal-active');
        const pct = Math.max(0, Math.min(100, Math.round(((m.staggerCurrent ?? m.staggerMax) / m.staggerMax) * 100)));
        if (sFill) {
          sFill.style.width = `${pct}%`;
          sFill.style.background = '';
        }
        if (sText) sText.textContent = `POSTURA: ${pct}%`;
      }
    } else {
      sBar.style.display = 'none';
    }
  }

  if (structure.sprite && typeof monsterSVG === 'function') {
    const mId = m.id || m.monsterId || m.key || m.name || 'goblin';
    const opts = { crown: !!(m.isBoss || m.boss) };
    structure.sprite.innerHTML = monsterSVG(mId, opts);
  }
}

export function updateCharacterUI(state) {
  if (!state) return;
  const root = getRoot();

  const charName = state.charName || state.heroName || state.playerName || state.name || 'Tristan';
  const level = state.level || 1;
  const race = state.race || 'human';
  const cls = state.class || 'fighter';

  const clsObj = getClass(cls);
  const gData = typeof window !== 'undefined' ? (window.EchoData || window.GameData) : null;
  const raceDef = (typeof RACES !== 'undefined' && RACES[race]) || (gData && gData.RACES_ECHO && gData.RACES_ECHO[race]) || { name: race.toUpperCase() };

  const raceName = raceDef.name || race.toUpperCase();
  const className = clsObj ? clsObj.name : ((gData && gData.CLASSES_ECHO && gData.CLASSES_ECHO[cls])?.name || cls.toUpperCase());

  // 1. Nome do Herói
  const portraitName = root.querySelector('#portrait-name, .portrait-name');
  if (portraitName) portraitName.textContent = charName;

  // 2. Selo de Nível
  const levelSeal = root.querySelector('#hero-sheet-level');
  if (levelSeal) levelSeal.textContent = level;

  // 3. Linhagem e Ordem (Raça e Classe)
  const raceClassDisp = root.querySelector('#hero-race-class-display');
  if (raceClassDisp) raceClassDisp.textContent = `${raceName} · ${className}`;

  // NextActionAdvisor no topo da ficha do personagem
  const advisorChar = root.querySelector('#next-action-advisor-char');
  if (advisorChar) {
    NextActionAdvisor.render(state, advisorChar);
  }

  const raceText = root.querySelector('#race-text');
  if (raceText) raceText.textContent = raceName;

  const classText = root.querySelector('#class-text');
  if (classText) classText.textContent = className;

  // 4. Badge de Patente / Tier
  const tierBadge = root.querySelector('#hero-tier-badge');
  if (tierBadge) {
    let tierText = 'Tier 0 · Noviço';
    if (level >= 76) tierText = 'Tier 3 · Nobless';
    else if (level >= 40) tierText = 'Tier 2 · Veterano';
    else if (level >= 20) tierText = 'Tier 1 · Aspirante';
    tierBadge.textContent = tierText;
  }

  // 5. Poder de Combate (CP) Canônico & Detalhamento Auditado
  const detailedCp = CombatPowerService.calculateDetailedCombatPower(state);
  const cp = detailedCp.totalCp;
  const cpTier = CombatPowerService.getCombatPowerTier(cp);

  const heroCpVal = root.querySelector('#hero-cp-val');
  if (heroCpVal) {
    heroCpVal.textContent = CombatPowerService.formatCombatPower(cp);
  }

  const portraitSub = root.querySelector('#portrait-sub, .portrait-sub');
  if (portraitSub) {
    portraitSub.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:1.1rem;">${cpTier.badge}</span>
        <span style="font-size:0.75rem; font-weight:700; padding:2px 6px; border-radius:4px; background:rgba(56,189,248,0.15); color:${cpTier.color}; border:1px solid rgba(56,189,248,0.3); font-family:'Cinzel',serif;">${cpTier.name}</span>
      </div>
    `;
  }

  // 5.1 Barra Proporcional de Power Breakdown
  const comps = detailedCp.components || {};
  const totalCpVal = Math.max(1, cp);
  const equipTotalCp = (comps.equipmentCp || 0) + (comps.enchantCp || 0) + (comps.jewelryCp || 0) + (comps.accessoryCp || 0) + (comps.beltCp || 0) + (comps.agathionCp || 0) + (comps.braceletCp || 0) + (comps.talismanCp || 0);
  const attrsCp = comps.baseCp || 0;
  const skillsCp = (comps.skillCp || 0) + (comps.passiveCp || 0);
  const specialsCp = (comps.artifactCp || 0) + (comps.specialEffectCp || 0) + (comps.setBonusCp || 0);

  const equipPct = Math.round((equipTotalCp / totalCpVal) * 100);
  const attrsPct = Math.round((attrsCp / totalCpVal) * 100);
  const skillsPct = Math.round((skillsCp / totalCpVal) * 100);
  const specialsPct = Math.max(0, 100 - equipPct - attrsPct - skillsPct);

  const barEquip = root.querySelector('#hero-cp-bar-equip');
  if (barEquip) barEquip.style.width = `${equipPct}%`;
  const barAttrs = root.querySelector('#hero-cp-bar-attrs');
  if (barAttrs) barAttrs.style.width = `${attrsPct}%`;
  const barSkills = root.querySelector('#hero-cp-bar-skills');
  if (barSkills) barSkills.style.width = `${skillsPct}%`;
  const barSpecials = root.querySelector('#hero-cp-bar-specials');
  if (barSpecials) barSpecials.style.width = `${specialsPct}%`;

  const legendContainer = root.querySelector('#hero-cp-breakdown-legend');
  if (legendContainer) {
    legendContainer.innerHTML = `
      <div class="l2-legend-item"><span class="l2-legend-dot" style="background:#f59e0b;"></span><span>Equipamentos: <strong>${equipPct}%</strong></span></div>
      <div class="l2-legend-item"><span class="l2-legend-dot" style="background:#38bdf8;"></span><span>Atributos: <strong>${attrsPct}%</strong></span></div>
      <div class="l2-legend-item"><span class="l2-legend-dot" style="background:#c084fc;"></span><span>Habilidades: <strong>${skillsPct}%</strong></span></div>
      <div class="l2-legend-item"><span class="l2-legend-dot" style="background:#34d399;"></span><span>Especiais: <strong>${specialsPct}%</strong></span></div>
    `;
  }

  // 6. Retrato Real em Alta Resolução (Modo Portrait HD)
  const portraitArt = root.querySelector('#portrait-art, .portrait-art');
  if (portraitArt && typeof heroSVG === 'function') {
    portraitArt.innerHTML = heroSVG({ ...state, mode: 'portrait' });
  }

  // 7. Medidores Vitais Reais (HP & MP apenas — CP é indicador de poder)
  const stats = getStats(state);
  const curHp = Math.round(state.hp !== undefined ? Math.max(0, state.hp) : (stats.maxHp || 100));
  const maxHp = Math.round(state.maxHp || stats.maxHp || curHp || 100);
  const curMp = Math.round(state.mp !== undefined ? Math.max(0, state.mp) : (stats.maxMp || 50));
  const maxMp = Math.round(state.maxMp || stats.maxMp || curMp || 50);

  const hpValEl = root.querySelector('#hero-vital-hp');
  if (hpValEl) hpValEl.textContent = `${curHp.toLocaleString()} / ${maxHp.toLocaleString()}`;
  const hpBarEl = root.querySelector('#hero-vital-bar-hp');
  if (hpBarEl) hpBarEl.style.width = `${Math.max(0, Math.min(100, (curHp / maxHp) * 100))}%`;

  const mpValEl = root.querySelector('#hero-vital-mp');
  if (mpValEl) mpValEl.textContent = `${curMp.toLocaleString()} / ${maxMp.toLocaleString()}`;
  const mpBarEl = root.querySelector('#hero-vital-bar-mp');
  if (mpBarEl) mpBarEl.style.width = `${Math.max(0, Math.min(100, (curMp / maxMp) * 100))}%`;

  // 8. Desempenho em Combate & Sumário de Poder (Métricas Reais Canônicas)
  const perf = CombatPowerService.getPerformanceMetrics(state, stats);
  const dpsEl = root.querySelector('#perf-dps-sustained');
  if (dpsEl) dpsEl.textContent = perf.sustainedDps.toLocaleString();
  const burstEl = root.querySelector('#perf-dps-burst');
  if (burstEl) burstEl.textContent = perf.burstDps.toLocaleString();
  const ehpEl = root.querySelector('#perf-ehp');
  if (ehpEl) ehpEl.textContent = perf.ehp.toLocaleString();
  const hpsEl = root.querySelector('#perf-hps');
  if (hpsEl) hpsEl.textContent = `+${perf.hps}/s`;
  const mpsEl = root.querySelector('#perf-mp-sustain');
  if (mpsEl) mpsEl.textContent = `+${perf.mpRegen}/s`;
  const evaEl = root.querySelector('#perf-dodge-rate');
  if (evaEl) evaEl.textContent = `${perf.evasionDodgePct}%`;

  // 9. Verificação de Avanço de Classe
  try {
    checkClassAdvancement(state, {
      el: (id) => root.querySelector('#' + id) || document.getElementById(id),
      openClassTransferModal: () => {
        if (typeof window !== 'undefined' && window.openClassTransferModal) {
          window.openClassTransferModal();
        }
      }
    });
  } catch (e) {
    console.warn('checkClassAdvancement error:', e);
  }

  // 10. Cálculo de Atributos Primários Sagrados (Base + Bônus = Final)
  const setRes = typeof getActiveSetBonuses === 'function' ? getActiveSetBonuses(state) : { primaryStats: {} };
  const setPrim = setRes.primaryStats || {};
  const baseAttrs = getBaseAttributes ? getBaseAttributes(race, cls) : { str: 40, dex: 30, con: 43, int: 21, wit: 11, men: 25 };

  let tatStr = 0, tatDex = 0, tatCon = 0, tatInt = 0, tatWit = 0, tatMen = 0;
  const tattoos = state.tattoos || [];
  for (const t of tattoos) {
    if (!t) continue;
    if (t.plusStat === 'str') tatStr += t.plusVal;
    if (t.plusStat === 'dex') tatDex += t.plusVal;
    if (t.plusStat === 'con') tatCon += t.plusVal;
    if (t.plusStat === 'int') tatInt += t.plusVal;
    if (t.plusStat === 'wit') tatWit += t.plusVal;
    if (t.plusStat === 'men') tatMen += t.plusVal;

    if (t.minusStat === 'str') tatStr -= t.minusVal;
    if (t.minusStat === 'dex') tatDex -= t.minusVal;
    if (t.minusStat === 'con') tatCon -= t.minusVal;
    if (t.minusStat === 'int') tatInt -= t.minusVal;
    if (t.minusStat === 'wit') tatWit -= t.minusVal;
    if (t.minusStat === 'men') tatMen -= t.minusVal;
  }

  // Renderizar os 6 Pilares Raciais Primários em #char-primary-stats-grid
  const primContainer = root.querySelector('#char-primary-stats-grid');
  if (primContainer) {
    const renderTablet = (code, name, baseVal, finalVal, setVal, dyeVal, desc) => {
      const bonusVal = finalVal - baseVal;
      const bonusStr = bonusVal >= 0 ? `+${bonusVal}` : `${bonusVal}`;
      const badges = [];
      if (setVal) badges.push(`<span class="l2-stat-chip-set">Set +${setVal}</span>`);
      if (dyeVal) badges.push(dyeVal > 0 ? `<span class="l2-stat-chip-pos">Dye +${dyeVal}</span>` : `<span class="l2-stat-chip-neg">Dye ${dyeVal}</span>`);
      const badgesHtml = badges.length > 0 ? `<div class="l2-stat-badges">${badges.join('')}</div>` : '';
      return `
        <div class="l2-stat-tablet" title="${desc}">
          <div class="l2-tablet-code">${code}</div>
          <div class="l2-tablet-name">${name}</div>
          <div class="l2-tablet-val">${finalVal}</div>
          <div class="l2-tablet-breakdown">
            <span class="l2-tablet-base">${baseVal}</span>
            <span class="l2-tablet-bonus">${bonusStr}</span>
          </div>
          ${badgesHtml}
        </div>
      `;
    };

    primContainer.innerHTML = `
      ${renderTablet('STR', 'Força', baseAttrs.str || 40, state.primaryStats?.str || 40, setPrim.str || 0, tatStr, 'STR: Aumenta o P.Atk em +0.5% por ponto e escalonamento de habilidades físicas')}
      ${renderTablet('DEX', 'Destreza', baseAttrs.dex || 30, state.primaryStats?.dex || 30, setPrim.dex || 0, tatDex, 'DEX: Aumenta Velocidade de Ataque, Taxa Crítica Física e Esquiva')}
      ${renderTablet('CON', 'Vigor', baseAttrs.con || 43, state.primaryStats?.con || 43, setPrim.con || 0, tatCon, 'CON: Aumenta Max HP em +1.0% por ponto e regeneração de vida')}
      ${renderTablet('INT', 'Mágica', baseAttrs.int || 21, state.primaryStats?.int || 21, setPrim.int || 0, tatInt, 'INT: Aumenta o M.Atk em +0.5% por ponto e dano de feitiços')}
      ${renderTablet('WIT', 'Astúcia', baseAttrs.wit || 11, state.primaryStats?.wit || 11, setPrim.wit || 0, tatWit, 'WIT: Aumenta Velocidade de Conjuração e Taxa Crítica Mágica')}
      ${renderTablet('MEN', 'Espírito', baseAttrs.men || 25, state.primaryStats?.men || 25, setPrim.men || 0, tatMen, 'MEN: Aumenta M.Def em +0.5% por ponto, Max MP em +0.2% e resistências')}
    `;
  }

  // 11. Renderizar Matriz Tática de Combate em #char-tab-stats-summary
  const charStatsContainer = root.querySelector('#char-tab-stats-summary');
  if (charStatsContainer) {
    const wpnUid = state.equipment?.weapon;
    const socket = (wpnUid && state.weaponSockets) ? state.weaponSockets[wpnUid] : null;

    let tattoosHtml = '';
    if (tattoos.length > 0) {
      tattoosHtml = tattoos.map(t => `<div class="l2-tatt-badge">🖋️ Tatuagem: +${t.plusVal} ${t.plusStat.toUpperCase()} / -${t.minusVal} ${t.minusStat.toUpperCase()}</div>`).join('');
    } else {
      tattoosHtml = '<div class="l2-tatt-empty">Nenhuma tatuagem gravada. (Adquira Dyes e grave no Mestre da Forja)</div>';
    }

    charStatsContainer.innerHTML = `
      <!-- Coluna 1: Potência Ofensiva -->
      <div class="l2-matrix-pillar offensive">
        <div class="l2-pillar-title">
          <span class="l2-pillar-icon">⚔️</span>
          <span>Potência Ofensiva</span>
        </div>
        <div class="l2-pillar-rows">
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">⚔️ P.Atk (Ataque Físico)</span>
            <span class="l2-row-val val-patk">${(stats.atk || 0).toLocaleString()}</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🔮 M.Atk (Ataque Mágico)</span>
            <span class="l2-row-val val-matk">${(stats.matk || 0).toLocaleString()}</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">⚡ Taxa Crítica</span>
            <span class="l2-row-val val-crit">${stats.crit || 0}%</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">💥 Multiplicador Crítico</span>
            <span class="l2-row-val val-crit">${stats.critDmg ? stats.critDmg.toFixed(2) : '1.50'}x</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🏹 Velocidade de Ação</span>
            <span class="l2-row-val val-spd">${stats.spd || 100}</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🎯 Precisão de Golpe</span>
            <span class="l2-row-val val-acc">${stats.accuracy || (stats.eva ? stats.eva + 5 : 105)}</span>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Baluarte Defensivo & Sustentação -->
      <div class="l2-matrix-pillar defensive">
        <div class="l2-pillar-title">
          <span class="l2-pillar-icon">🛡️</span>
          <span>Baluarte Defensivo &amp; Sustentação</span>
        </div>
        <div class="l2-pillar-rows">
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🛡️ P.Def (Defesa Física)</span>
            <span class="l2-row-val val-pdef">${(stats.def || 0).toLocaleString()}</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">✨ M.Def (Defesa Mágica)</span>
            <span class="l2-row-val val-mdef">${(stats.mdef || 0).toLocaleString()}</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">👟 Evasão / Esquiva</span>
            <span class="l2-row-val val-eva">${stats.eva || 0}%</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🛡️ Bloqueio com Escudo</span>
            <span class="l2-row-val val-pdef">${stats.block || 0}%</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🩸 Drenagem de Vida</span>
            <span class="l2-row-val val-drain">${Math.round((stats.lifeDrain || 0) * 100)}%</span>
          </div>
          <div class="l2-matrix-row">
            <span class="l2-row-lbl">🌿 Regeneração de HP</span>
            <span class="l2-row-val val-regen">+${stats.regenHp ? Math.round(stats.regenHp * 100) : 1}% / tick</span>
          </div>
        </div>
      </div>

      <!-- Card Místico: Refinamentos, Tatuagens & Soul Crystal (SA) -->
      <div class="l2-mystic-card">
        <div class="l2-mystic-header">
          <span class="l2-mystic-icon">🔮</span>
          <span class="l2-mystic-title">Refinamentos Místicos, Tatuagens &amp; Soul Crystal</span>
        </div>
        <div class="l2-mystic-content">
          <div class="l2-mystic-dyes">
            ${tattoosHtml}
          </div>
          <div class="l2-mystic-sa">
            ${socket ? `🔮 SA da Arma: <strong style="color:#38bdf8;">${socket.effect.toUpperCase()} (Stage ${socket.stage})</strong>` : '🔮 SA da Arma: Nenhum Soul Crystal engastado.'}
          </div>
        </div>
      </div>
    `;
  }

  // 12. Renderizar Equipment Power Section (#char-equipped-power-list)
  const equipContainer = root.querySelector('#char-equipped-power-list');
  if (equipContainer && state.equipment) {
    const slotNames = {
      weapon: { label: 'Arma Principal', icon: '⚔️' },
      weapon2: { label: 'Arma Secundária', icon: '🗡️' },
      shield: { label: 'Escudo / Sigil', icon: '🛡️' },
      helmet: { label: 'Capacete', icon: '🪖' },
      armor: { label: 'Peitoral', icon: '🛡️' },
      legs: { label: 'Perneiras', icon: '👖' },
      gloves: { label: 'Luvas', icon: '🧤' },
      boots: { label: 'Botas', icon: '👢' },
      necklace: { label: 'Colar', icon: '📿' },
      earring1: { label: 'Brinco 1', icon: '💎' },
      earring2: { label: 'Brinco 2', icon: '💎' },
      ring1: { label: 'Anel 1', icon: '💍' },
      ring2: { label: 'Anel 2', icon: '💍' },
      cloak: { label: 'Capa', icon: '🧥' },
      belt: { label: 'Cinto', icon: '🪢' }
    };

    const equipCards = [];
    const allItems = (D && D().ALL_ITEMS) || {};

    for (const [slotKey, meta] of Object.entries(slotNames)) {
      const uid = state.equipment[slotKey];
      if (!uid) continue;
      const invItem = state.inventory?.find(i => i.uid === uid || i.id === uid) || (typeof uid === 'object' ? uid : null);
      if (!invItem) continue;
      const def = allItems[invItem.itemId || invItem.id] || invItem;

      const tier = Number(def.tier || invItem.tier) || 1;
      const tierBase = (CP_WEIGHTS && CP_WEIGHTS.equipmentTierBase && CP_WEIGHTS.equipmentTierBase[tier]) || 60;
      const enc = Number(invItem.enchant || invItem.enchantLevel) || 0;
      const encCp = enc > 0 ? Math.floor(tierBase * (Math.pow(enc, 1.4) * 0.14)) : 0;
      let specCp = 0;
      if (invItem.sa || invItem.soulCrystal) specCp += (CP_WEIGHTS?.specialBonuses?.soulCrystal || 300);
      if (invItem.augmentation?.stats) specCp += (CP_WEIGHTS?.specialBonuses?.augmentationStats || 350);
      if (invItem.isEpic || def.isEpic) specCp += (CP_WEIGHTS?.specialBonuses?.epicJewel || 1000);

      const itemCp = tierBase + encCp + specCp;
      const grade = def.grade || (tier === 6 ? 'S' : tier === 5 ? 'A' : tier === 4 ? 'B' : tier === 3 ? 'C' : tier === 2 ? 'D' : 'NG');
      const encPrefix = enc > 0 ? `+${enc} ` : '';

      equipCards.push(`
        <div class="l2-equip-power-card">
          <div class="l2-ep-slot-icon">${meta.icon}</div>
          <div class="l2-ep-info">
            <div class="l2-ep-name">${encPrefix}${def.name || invItem.name || slotKey}</div>
            <div class="l2-ep-stats">${meta.label} · Grau ${grade.toUpperCase()}</div>
          </div>
          <div class="l2-ep-cp-chip">+${itemCp.toLocaleString()} CP</div>
        </div>
      `);
    }

    equipContainer.innerHTML = equipCards.length > 0 
      ? equipCards.join('') 
      : '<div style="font-size:11px; color:#94a3b8; font-style:italic; padding:10px;">Nenhum equipamento empunhado no momento. Equipe itens no inventário para ampliar seu CP.</div>';

    // Bônus de Set Ativos
    const setContainer = root.querySelector('#char-set-bonuses-container');
    if (setContainer) {
      if (setRes && setRes.name) {
        setContainer.innerHTML = `
          <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-family:'Cinzel',serif; font-size:11px; font-weight:bold; color:#4ade80;">✨ Conjunto Ativo: ${setRes.name}</span>
              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${setRes.desc || 'Bônus integral de armadura ativado com sucesso.'}</div>
            </div>
            <span style="font-size:10px; color:#4ade80; font-weight:bold; background:rgba(34,197,94,0.2); padding:2px 6px; border-radius:4px;">SET COMPLETO</span>
          </div>
        `;
      } else {
        setContainer.innerHTML = '';
      }
    }
  }

  // 13. Renderizar Power Insights (#char-power-insights-list)
  const insightsContainer = root.querySelector('#char-power-insights-list');
  if (insightsContainer) {
    const insights = CombatPowerService.getPowerInsights(state, stats, detailedCp);
    insightsContainer.innerHTML = insights.map(i => `
      <div class="l2-insight-card type-${i.type}">
        <span class="l2-insight-icon">${i.icon}</span>
        <div class="l2-insight-body">
          <div class="l2-insight-title">${i.title}</div>
          <div class="l2-insight-desc">${i.desc}</div>
        </div>
      </div>
    `).join('');
  }

  // 14. Renderizar Progression Milestone (#char-next-milestone-card)
  const milestoneContainer = root.querySelector('#char-next-milestone-card');
  if (milestoneContainer) {
    const m = CombatPowerService.getNextMilestone(cp);
    milestoneContainer.innerHTML = `
      <div class="l2-milestone-head">
        <span class="l2-milestone-title">Próximo Marco: ${CombatPowerService.formatCombatPower(m.nextMilestone)}</span>
        <span class="l2-milestone-delta">Faltam ${m.remainingCp.toLocaleString()} CP</span>
      </div>
      <div class="l2-milestone-bar-wrap">
        <div class="l2-milestone-bar" style="width: ${m.progressPct}%;"></div>
      </div>
      <div class="l2-milestone-footer">
        <span>Progresso: <strong>${m.progressPct}%</strong></span>
        <span>Meta: <strong>${CombatPowerService.formatCombatPower(m.nextMilestone)}</strong></span>
      </div>
    `;
  }

  // 15. Atualizar Subclasses e Certificações se a função estiver disponível
  if (typeof window !== 'undefined' && typeof window.renderSubclassesUI === 'function') {
    try { window.renderSubclassesUI(); } catch (e) {}
  }
}

export function updateZoneUI(state, callbacks = {}) {
  const currentZoneKey = state?.zone || state?.currentZone || 'talkingIsland';
  const zDef = ZONES ? ZONES[currentZoneKey] : null;

  const zoneNameEl = findElement('zone-name');
  if (zoneNameEl && zDef) {
    zoneNameEl.textContent = zDef.name;
  }

  const stageZoneEl = findElement('stage-zone');
  if (stageZoneEl && zDef) {
    stageZoneEl.textContent = zDef.name.toUpperCase() + (zDef.town ? ' · TOWN' : '');
  }

  const stageEl = findElement('stage');
  if (stageEl && currentZoneKey) {
    const bgUrl = (ZONE_BACKGROUNDS && ZONE_BACKGROUNDS[currentZoneKey]) || zDef?.background;
    if (bgUrl) {
      stageEl.style.backgroundImage = `url('${getAssetUrl(bgUrl)}')`;
      stageEl.style.backgroundSize = 'cover';
      stageEl.style.backgroundPosition = 'center';
    }
  }
}

export function renderZoneMap(state, callbacks = {}) {
  const container = findElement('zone-map-container') || findElement('zone-list');
  if (!container) return;

  container.innerHTML = '';
  container.classList.add('zone-map-root');

  // Renderiza a Meta Comunitária de CAP Global no topo do Mapa
  const capWidget = document.createElement('div');
  capWidget.className = 'community-cap-banner-wrap';
  CommunityCapService.renderWidget(capWidget);
  container.appendChild(capWidget);

  // Seletor de Dificuldade de Caça Progressiva (NÍVEL 15.4 / 15.5)
  const currentDiff = MonsterAIEngine.getDifficulty(state) || { id: 'normal', name: 'Normal', icon: '🟢', color: '#10b981', xpMult: 1, dropMult: 1, minLvl: 1 };
  const diffBar = document.createElement('div');
  diffBar.className = 'hunting-difficulty-banner-wrap';
  diffBar.style.cssText = 'margin: 10px 0 14px 0; padding: 10px 14px; background: rgba(0,0,0,0.45); border: 1px solid rgba(212,167,68,0.3); border-radius: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;';
  
  const diffButtonsHtml = Object.values(HUNTING_DIFFICULTIES || {}).map(d => {
    if (!d || !d.id) return '';
    const isSelected = currentDiff?.id === d.id;
    const isLocked = ((state?.level) || 1) < (d.minLvl || 1);
    const activeBorder = isSelected ? `2px solid ${d.color || '#ffd877'}` : (isLocked ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.25)');
    const activeBg = isSelected ? `linear-gradient(180deg, rgba(212,167,68,0.25), rgba(30,20,10,0.7))` : 'rgba(0,0,0,0.3)';
    return `
      <button class="diff-choice-btn ${isSelected ? 'active' : ''}"
              data-diff="${d.id}"
              ${isLocked ? 'disabled' : ''}
              onclick="window.setHuntingDifficulty && window.setHuntingDifficulty('${d.id}')"
              style="background:${activeBg}; border:${activeBorder}; color:${isLocked ? '#64748b' : (isSelected ? '#fff' : (d.color || '#fff'))}; padding: 5px 12px; border-radius: 6px; font-size: 11px; font-family: 'Cinzel', serif; font-weight: bold; cursor: ${isLocked ? 'not-allowed' : 'pointer'}; display: inline-flex; align-items: center; gap: 5px; box-shadow: ${isSelected ? `0 0 10px ${d.color || '#ffd877'}44` : 'none'}; transition: all 0.2s;"
              title="${isLocked ? `Requer Nível ${d.minLvl || 1}+` : (d.desc || '')}">
        <span>${d.icon || '⚔️'}</span>
        <span>${d.name || d.id}</span>
        <span style="font-size: 10px; opacity: 0.85;">${isLocked ? `🔒 (Lv.${d.minLvl || 1})` : `(${d.xpMult || 1}x)`}</span>
      </button>
    `;
  }).filter(Boolean).join('');

  diffBar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-family: 'Cinzel', serif; font-size: 12px; font-weight: 800; color: #ffd877; letter-spacing: 0.05em;">⚡ Dificuldade de Caça:</span>
      <span style="font-size: 11px; color: ${currentDiff.color || '#10b981'}; font-weight: bold;">${currentDiff.icon || '🟢'} ${currentDiff.name || 'Normal'} (${currentDiff.xpMult || 1}x XP/Gold, ${currentDiff.dropMult || 1}x Drops)</span>
    </div>
    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
      ${diffButtonsHtml}
    </div>
  `;
  container.appendChild(diffBar);

  const sagasData = SAGAS || [
    { name: 'Interlude', unlocksAt: 1, zones: ['talking_island', 'elven_village', 'dark_elven_village', 'gludin', 'gludio'] }
  ];

  const sagaList = Array.isArray(sagasData) ? sagasData : Object.values(sagasData);

  for (const saga of sagaList) {
    if (!saga || typeof saga !== 'object') continue;

    const block = document.createElement('div');
    block.className = 'saga-map-block';

    const zonesList = Array.isArray(saga.zones) ? saga.zones : [];
    const validCards = zonesList.map(zId => {
      const zDef = ZONES && ZONES[zId];
      if (!zDef || !zDef.name) return '';

      const isCurrent = (state.zone || state.currentZone) === zId;
      const reqLvl = zDef.level ?? zDef.minLevel ?? zDef.reqLvl ?? 1;
      const zoneProg = getZoneProgression(zId);
      const playerCp = state.stats?.combatPower || state.combatPower || 0;
      const isLvlLocked = (state.level || 1) < reqLvl;
      const isCpLocked = zId !== 'talkingIsland' && playerCp < (zoneProg?.minCp || 0);
      const isLocked = isLvlLocked || isCpLocked;
      const bgUrl = (ZONE_BACKGROUNDS && ZONE_BACKGROUNDS[zId]) || zDef.background || '';
      const thumbStyle = bgUrl ? `style="background-image:url('${getAssetUrl(bgUrl)}')"` : '';

      const monsterCount = zDef.monsters?.length || zDef.monsterTypes?.length || 4;
      const bossName = zDef.boss || zDef.bossName || 'Chefão';
      const cpText = (zoneProg?.minCp) ? ` · ⚔️ ${zoneProg.minCp.toLocaleString()} CP` : '';

      return `
        <div class="zone-card ${isCurrent ? 'active' : ''} ${isLocked ? 'locked' : ''}" data-zone="${zId}" data-locked="${isLocked}" data-current="${isCurrent}">
          <div class="zone-card-thumb" ${thumbStyle}>
            ${zDef.isTown ? '<span class="zone-flag town">🏡 Vila</span>' : ''}
            ${isLocked ? '<span class="zone-flag lock">🔒</span>' : ''}
            ${isCurrent ? '<span class="zone-flag here">★</span>' : ''}
          </div>
          <div class="zone-card-body">
            <div class="zone-card-header">
              <span class="zone-card-title">${zDef.name}</span>
              <span class="zone-card-lvl ${isCpLocked ? 'cp-warning' : ''}">Lv.${reqLvl}+${cpText}</span>
            </div>
            <div class="zone-card-desc">
              ${monsterCount} espécie${monsterCount === 1 ? '' : 's'} · 👑 ${bossName}
            </div>
            <button class="select-zone-btn" ${isLocked || isCurrent ? 'disabled' : ''}>
              ${isCurrent ? '★ Caçando Aqui' : isLvlLocked ? `🔒 Requer Lv.${reqLvl}` : isCpLocked ? `🔒 Requer ${(zoneProg?.minCp || 0).toLocaleString()} CP` : 'Caçar nesta Área'}
            </button>
          </div>
        </div>
      `;
    }).filter(Boolean);

    if (validCards.length === 0) continue;

    const sagaName = saga.name || saga.id || 'Capítulo';
    const sagaReq = saga.unlocksAt || saga.reqLvl || 1;

    block.innerHTML = `
      <div class="saga-header">
        <span class="saga-title">🗺️ ${sagaName}</span>
        <span class="saga-req">Lv. ${sagaReq}+</span>
      </div>
      <div class="saga-zones-grid">${validCards.join('')}</div>
    `;

    container.appendChild(block);
  }

  container.onclick = (event) => {
    const card = event.target.closest?.('.zone-card');
    if (!card) return;
    if (card.dataset.locked === 'true' || card.dataset.current === 'true') return;
    const zId = card.dataset.zone;
    if (callbacks.selectZone) callbacks.selectZone(zId);
    else if (typeof window.setZone === 'function') window.setZone(zId);
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. SKILLS
═══════════════════════════════════════════════════════════════════════════ */

/* ─── 5.0 Loadout Bar ─────────────────────────────────────────────────── */

const SKILL_LOADOUT_SLOT_ICONS = { basic: '⚔️', core1: '🔥', core2: '🔥', special1: '💠', special2: '💠', signature: '✨', ultimate: '🌟' };
const SKILL_LOADOUT_SLOT_LABELS = { basic: 'Basic', core1: 'Core 1', core2: 'Core 2', special1: 'Spec 1', special2: 'Spec 2', signature: 'Signat.', ultimate: 'Ultim.' };

export const NEUTRAL_SKILL_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%231e293b' stroke='%23334155' stroke-width='2'/%3E%3Ctext x='24' y='30' font-size='20' text-anchor='middle' fill='%2394a3b8'%3E⚔%EF%B8%8E%3C/text%3E%3C/svg%3E";

function renderLoadoutBar(state) {
  const loadout = getLoadout(state);
  const unlockedSlots = getUnlockedSlots(state.level || 1);
  const echoData = typeof window !== 'undefined' ? window.EchoData : null;
  const SKILL_DEFS = echoData?.SKILL_DEFS_ECHO || D()?.SKILL_DEFS || {};
  const progressLabel = getProgressionLabel(state.level || 1);

  const slotsHtml = ALL_SLOT_NAMES.map(slotName => {
    const isUnlocked = unlockedSlots.includes(slotName);
    const skillId = loadout[slotName];
    const def = skillId ? SKILL_DEFS[skillId] : null;
    const unlockLvl = getSlotUnlockLevel(slotName);
    const slotLabel = SKILL_LOADOUT_SLOT_LABELS[slotName] || slotName;
    const slotIcon = SKILL_LOADOUT_SLOT_ICONS[slotName] || '⚔️';

    if (!isUnlocked) {
      return `
        <div class="loadout-slot is-locked" data-slot="${slotName}" title="${slotLabel} — Desbloqueia no Nível ${unlockLvl}">
          <div class="loadout-slot-frame">
            <span class="loadout-lock-icon">🔒</span>
          </div>
          <span class="loadout-slot-label">${slotLabel}</span>
          <span class="loadout-unlock-lvl">Lv.${unlockLvl}</span>
        </div>
      `;
    }

    if (!skillId || !def) {
      return `
        <div class="loadout-slot is-empty" data-slot="${slotName}" title="${slotLabel} — Vazio (arraste uma habilidade ou selecione abaixo)">
          <div class="loadout-slot-frame">
            <span class="loadout-empty-icon">${slotIcon}</span>
          </div>
          <span class="loadout-slot-label">${slotLabel}</span>
          <span class="loadout-slot-hint">Vazio</span>
        </div>
      `;
    }

    const iconData = getSkillIcon(skillId, def);
    const rawPath = iconData?.iconPath || (typeof iconData === 'string' ? iconData : null) || def.icon || '';
    const iconUrl = rawPath ? getAssetUrl(rawPath) : NEUTRAL_SKILL_PLACEHOLDER;
    const skillLevel = state.skills[skillId] || 0;
    const cond = getSkillCondition(state, slotName);
    const condBadge = getConditionBadgeText(cond);
    const condBadgeHtml = condBadge
      ? `<span class="loadout-condition-badge" title="Tática Ativa: ${condBadge}">⚙️ ${condBadge}</span>`
      : '';

    return `
      <div class="loadout-slot is-equipped" data-slot="${slotName}" data-skill-id="${skillId}" title="${def.name} (${slotLabel}) — Clique para ver detalhes e configurar táticas">
        <div class="loadout-slot-frame">
          <img src="${iconUrl}" class="loadout-skill-icon" alt="${def.name}" onerror="this.onerror=null; this.src='${NEUTRAL_SKILL_PLACEHOLDER}'; this.style.opacity='0.4';" />
          ${skillLevel > 1 ? `<span class="loadout-skill-lvl">${skillLevel}</span>` : ''}
          <button class="loadout-slot-unequip-btn" data-slot="${slotName}" title="Desequipar ${def.name}">×</button>
        </div>
        <span class="loadout-slot-label">${slotLabel}</span>
        ${condBadgeHtml}
      </div>
    `;
  }).join('');

  return `
    <div class="loadout-bar">
      <div class="loadout-header">
        <div class="loadout-header-left">
          <span class="loadout-title">⚔️ Loadout de Combate</span>
          <span class="loadout-progress">${progressLabel} · ${unlockedSlots.length}/7 Slots</span>
        </div>
        <div class="loadout-header-actions">
          <button class="loadout-btn-action loadout-btn-auto" type="button" title="Auto-equipa as melhores habilidades aprendidas nos slots disponíveis">⚡ Auto-Equipar</button>
          <button class="loadout-btn-action loadout-btn-clear" type="button" title="Desequipa todas as habilidades do loadout">✕ Limpar</button>
        </div>
      </div>
      <div class="loadout-slots">
        ${slotsHtml}
      </div>
    </div>
  `;
}

// ─── Renderização do Card de Habilidade (Skill Card) ──────────────────────────

function renderSkillCard(skill, state, activeLoadoutSlot = null) {
  const isLearned = skill.isLearned;
  const isLocked = skill.isLocked ?? (skill.state === 'LOCKED');
  const isAvailable = skill.isAvailable ?? (skill.state === 'AVAILABLE');
  const isBookLocked = skill.isBookLocked ?? skill.cost?.isBookLocked ?? false;
  const isMaxed = skill.isMaxed ?? (typeof skill.rank === 'object' ? skill.rank?.isMaxed : false);
  const cost = skill.cost || { sp: 0, adena: 0 };
  const canAfford = (state.sp || 0) >= cost.sp;
  const isEquipped = !!skill.equippedSlot;
  const equippedSlot = skill.equippedSlot;
  const isCanAfford = canAfford && !isMaxed && !isLocked && !isBookLocked;
  const isSelected = state.selectedSkill === skill.skillId;
  const isDraggable = isLearned;
  const cardClasses = ['skill-node-card', 'skill-card'];
  if (isLearned) cardClasses.push('is-learned');
  if (isAvailable) cardClasses.push('is-available');
  if (isLocked) cardClasses.push('is-locked');
  if (isBookLocked) cardClasses.push('book-locked', 'is-book-locked');
  if (isEquipped) cardClasses.push('is-equipped');
  if (isMaxed) cardClasses.push('is-maxed');
  if (isCanAfford) cardClasses.push('can-afford', 'can-buy');
  if (isSelected) cardClasses.push('is-selected');
  if (skill.ultimate) cardClasses.push('is-ultimate');
  if (activeLoadoutSlot && isLearned) cardClasses.push('is-selectable-for-slot');

  const starPill = skill.starRank
    ? `<span class="skill-star-pill star-${skill.starRank}">${'★'.repeat(Math.min(skill.starRank, 5))}</span>`
    : '';

  // P0 FIX: skill.rank is an object { current, max, isMaxed } from SkillTreeViewModel.
  // Extracting scalar values prevents [object Object] from appearing in the DOM.
  const currentRank = typeof skill.rank === 'object' ? (skill.rank?.current || 0) : (Number(skill.rank) || 0);
  const maxRank = typeof skill.rank === 'object' ? (skill.rank?.max || 5) : 5;
  const rankBadge = currentRank > 0
    ? `<span class="skill-rank-badge">Lv.${currentRank}/${maxRank}</span>`
    : '';

  const slotPill = equippedSlot
    ? `<span class="skill-slot-pill" title="Equipado no slot ${SKILL_LOADOUT_SLOT_LABELS[equippedSlot] || equippedSlot}">
         ${SKILL_LOADOUT_SLOT_ICONS[equippedSlot] || '⚔️'} ${SKILL_LOADOUT_SLOT_LABELS[equippedSlot] || equippedSlot}
       </span>`
    : '';

  const elemClass = `element-${String(skill.element || 'physical').toLowerCase()}`;
  let costBadge = '';
  if (isMaxed) {
    costBadge = `<span class="skill-cost-badge cost-maxed">MAX</span>`;
  } else if (isLocked) {
    if (skill.primaryLockReason === 'CLASS_STAGE_LOCKED') {
      costBadge = `<span class="skill-cost-badge cost-locked" title="Requer avanço de classe">🔒 Troca de Classe</span>`;
    } else if (skill.primaryLockReason === 'LEVEL_LOCKED') {
      costBadge = `<span class="skill-cost-badge cost-locked" title="Nível ${skill.requiredLevel} necessário">🔒 Lv.${skill.requiredLevel}</span>`;
    } else if (isBookLocked) {
      costBadge = `<span class="skill-cost-badge cost-book" title="Livro necessário">🔒 Livro ${skill.starRank || 4}★</span>`;
    } else {
      costBadge = `<span class="skill-cost-badge cost-locked">🔒 Bloqueada</span>`;
    }
  } else if (isBookLocked) {
    costBadge = `<span class="skill-cost-badge cost-book">🔒 Livro ${skill.starRank || 4}★</span>`;
  } else {
    costBadge = `<span class="skill-cost-badge ${canAfford ? 'cost-affordable' : 'cost-expensive'}">✦ ${cost.sp} SP</span>`;
  }

  const rawSkillPath = skill.iconPath || skill.icon || '';
  const iconUrl = rawSkillPath ? getAssetUrl(rawSkillPath) : NEUTRAL_SKILL_PLACEHOLDER;

  return `
    <div class="${cardClasses.join(' ')}"
         data-skill-id="${skill.skillId}"
         role="button"
         tabindex="0"
         draggable="${isDraggable ? 'true' : 'false'}"
         title="${skill.name} (${skill.element})${equippedSlot ? ` — Equipado no Loadout: ${SKILL_LOADOUT_SLOT_LABELS[equippedSlot] || equippedSlot}` : ''}">
      <div class="skill-icon-frame-48">
        <img src="${iconUrl}" class="skill-icon-img" alt="${skill.name}" onerror="this.onerror=null; this.src='${NEUTRAL_SKILL_PLACEHOLDER}'; this.style.opacity='0.4';" />
        ${starPill}
        ${rankBadge}
        ${slotPill}
      </div>
      <div class="skill-card-body">
        <div class="skill-card-title">${skill.name}</div>
        <div class="skill-card-tags">
          <span class="skill-grade-tag grade-${String(skill.grade || 'common').toLowerCase()}">${skill.grade || 'COMMON'}</span>
          <span class="skill-element-tag ${elemClass}">${skill.element}</span>
          <span class="skill-role-tag">${skill.role}</span>
        </div>
        <div class="skill-card-footer">
          ${costBadge}
        </div>
      </div>
    </div>
  `;
}

export function updateSkillUI(state, callbacks = {}) {
  const wrap = findElement('skill-tree');
  if (!wrap) return;

  // 1. Cleanly suppress visual islands (shared container & legacy container outside window)
  const sharedContainer = findElement('shared-skills-container');
  if (sharedContainer) {
    sharedContainer.style.display = 'none';
    sharedContainer.innerHTML = '';
  }

  const legacyContainer = findElement('legacy-passives-container');
  if (legacyContainer) {
    legacyContainer.style.display = 'none';
    legacyContainer.innerHTML = '';
  }

  // 2. Sync SP counter in skills-head
  const spAvailableEl = findElement('sp-available');
  if (spAvailableEl) {
    spAvailableEl.textContent = (state.sp || 0).toLocaleString();
  }

  // 3. Obtain authoritative ViewModel
  const activeTab = state.activeSkillTab || SKILL_TABS.ACTIVE;
  const viewModel = getSkillTreeViewModel(state, {
    activeTab,
    selectedSkillId: state.selectedSkill
  });

  if (!state.selectedSkill && viewModel.selectedSkillId) {
    state.selectedSkill = viewModel.selectedSkillId;
  }

  // 4. Ensure container styling for full-width responsive window
  wrap.style.width = '100%';
  wrap.style.height = 'auto';

  // 5. Generate content according to active tab
  let contentHtml = '';

  if (activeTab === SKILL_TABS.ACTIVE) {
    const categories = viewModel.tabs[SKILL_TABS.ACTIVE].categories || [];
    if (categories.length > 0) {
      contentHtml = categories.map(cat => `
        <div class="skill-category-block">
          <div class="skill-category-header">
            <span class="category-icon">✦</span>
            <h4 class="category-title">${cat.title}</h4>
            <span class="category-count">${cat.skills.length}</span>
          </div>
          <div class="skill-grid-dense">
            ${cat.skills.map(s => renderSkillCard(s, state)).join('')}
          </div>
        </div>
      `).join('');
    } else {
      contentHtml = `
        <div class="skill-empty-panel">
          <span class="empty-icon">📜</span>
          <p>Nenhuma habilidade ativa disponível para o estágio atual.</p>
        </div>
      `;
    }
  } else if (activeTab === SKILL_TABS.PASSIVE) {
    const categories = viewModel.tabs[SKILL_TABS.PASSIVE].categories || [];
    const passiveSkills = viewModel.tabs[SKILL_TABS.PASSIVE].skills || [];
    const legacyPassives = viewModel.tabs[SKILL_TABS.PASSIVE].legacyPassives || [];

    const passiveBlocks = [];
    if (categories.length > 0) {
      for (const cat of categories) {
        passiveBlocks.push(`
          <div class="skill-category-block">
            <div class="skill-category-header">
              <span class="category-icon">${cat.icon || '🛡️'}</span>
              <h4 class="category-title">${cat.title}</h4>
              <span class="category-count">${cat.skills.length}</span>
            </div>
            <div class="skill-grid-dense">
              ${cat.skills.map(s => renderSkillCard(s, state)).join('')}
            </div>
          </div>
        `);
      }
    } else if (passiveSkills.length > 0) {
      passiveBlocks.push(`
        <div class="skill-category-block">
          <div class="skill-category-header">
            <span class="category-icon">🛡️</span>
            <h4 class="category-title">Habilidades Passivas da Classe</h4>
            <span class="category-count">${passiveSkills.length}</span>
          </div>
          <div class="skill-grid-dense">
            ${passiveSkills.map(s => renderSkillCard(s, state)).join('')}
          </div>
        </div>
      `);
    }
    if (legacyPassives.length > 0) {
      passiveBlocks.push(`
        <div class="skill-category-block legacy-passives-block">
          <div class="skill-category-header">
            <span class="category-icon">🧬</span>
            <h4 class="category-title">Passivas de Linhagem Herdadas (20% Eficácia)</h4>
            <span class="category-count">${legacyPassives.length}</span>
          </div>
          <div class="legacy-passives-dense-grid">
            ${legacyPassives.map(p => `
              <div class="legacy-passive-node">
                <span class="legacy-passive-icon">✦</span>
                <div class="legacy-passive-body">
                  <div class="legacy-passive-name">${p.name || p.originalSkill}</div>
                  <div class="legacy-passive-effect">${p.desc || `+${((p.val || 0) * 100).toFixed(1)}% ${p.stat?.toUpperCase() || ''}`}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `);
    }

    if (passiveBlocks.length > 0) {
      contentHtml = passiveBlocks.join('');
    } else {
      contentHtml = `
        <div class="skill-empty-panel">
          <span class="empty-icon">🛡️</span>
          <p>Nenhuma habilidade passiva desbloqueada no estágio atual.</p>
        </div>
      `;
    }
  } else if (activeTab === SKILL_TABS.ULTIMATE) {
    const ultTab = viewModel.tabs[SKILL_TABS.ULTIMATE];
    if (!ultTab.isUnlocked) {
      const pct = Math.min(100, Math.round(((state.level || 1) / 80) * 100));
      contentHtml = `
        <div class="skill-locked-panel">
          <div class="locked-icon-large">🌟</div>
          <h4 class="locked-title">Habilidades Supremas &amp; Transcendentais</h4>
          <p class="locked-desc">
            O despertar transcendental é concedido aos guerreiros que alcançam o <strong>Nível 80</strong> (Estágio 4 — Despertar Supremo) e <strong>Nível 90</strong> (Estágio 5 — Mestre Supremo).
          </p>
          <div class="locked-progress-wrap">
            <div class="locked-progress-bar">
              <div class="locked-progress-fill" style="width: ${pct}%;"></div>
            </div>
            <div class="locked-progress-labels">
              <span>Nível Atual: <strong>Lv. ${state.level || 1}</strong></span>
              <span>Requisito: <strong>Lv. 80</strong></span>
            </div>
          </div>
        </div>
      `;
    } else {
      const ultSkills = ultTab.skills || [];
      if (ultSkills.length > 0) {
        contentHtml = `
          <div class="skill-category-block">
            <div class="skill-category-header">
              <span class="category-icon">🌟</span>
              <h4 class="category-title">Habilidades Supremas Desbloqueadas</h4>
              <span class="category-count">${ultSkills.length}</span>
            </div>
            <div class="skill-grid-dense">
              ${ultSkills.map(s => renderSkillCard(s, state)).join('')}
            </div>
          </div>
        `;
      } else {
        contentHtml = `
          <div class="skill-empty-panel">
            <span class="empty-icon">🌟</span>
            <p>Nenhuma habilidade suprema disponível para esta classe no momento.</p>
          </div>
        `;
      }
    }
  }

  // 6. Build unified SkillWindow DOM
  wrap.innerHTML = `
    <div class="skill-window" style="--element-accent: ${viewModel.header.accentColor}; --element-glow: ${viewModel.header.bgGlow};">
      <div class="skill-window-header">
        <div class="skill-header-crest">
          <span class="crest-icon">${viewModel.header.icon}</span>
        </div>
        <div class="skill-header-info">
          <div class="skill-header-title-row">
            <h3 class="skill-header-class">${viewModel.header.race} ${viewModel.header.className}</h3>
            <span class="skill-header-badge level-badge">Lv. ${viewModel.header.level}</span>
            <span class="skill-header-badge theme-badge" style="border-color:${viewModel.header.accentColor}; color:${viewModel.header.accentColor};">
              ${viewModel.header.elementalTheme}
            </span>
          </div>
          <div class="skill-header-sub-row">
            <span class="skill-header-stage">${viewModel.header.stageTitle}</span>
            <span class="skill-header-sp">✦ <strong>${(state.sp || 0).toLocaleString()}</strong> SP</span>
          </div>
        </div>
      </div>

      ${renderLoadoutBar(state)}

      <div class="skill-window-tabs">
        <button class="skill-subtab-btn ${activeTab === SKILL_TABS.ACTIVE ? 'active' : ''}" data-tab="${SKILL_TABS.ACTIVE}">
          <span class="tab-icon">⚔️</span>
          <span class="tab-label">ATIVAS</span>
          <span class="tab-count">(${viewModel.tabs[SKILL_TABS.ACTIVE].count})</span>
        </button>
        <button class="skill-subtab-btn ${activeTab === SKILL_TABS.PASSIVE ? 'active' : ''}" data-tab="${SKILL_TABS.PASSIVE}">
          <span class="tab-icon">🛡️</span>
          <span class="tab-label">PASSIVAS</span>
          <span class="tab-count">(${viewModel.tabs[SKILL_TABS.PASSIVE].count})</span>
        </button>
        <button class="skill-subtab-btn ${activeTab === SKILL_TABS.ULTIMATE ? 'active' : ''} ${!viewModel.tabs[SKILL_TABS.ULTIMATE].isUnlocked ? 'tab-locked' : ''}" data-tab="${SKILL_TABS.ULTIMATE}">
          <span class="tab-icon">🌟</span>
          <span class="tab-label">ULTIMATE</span>
          <span class="tab-count">(${viewModel.tabs[SKILL_TABS.ULTIMATE].count})</span>
          ${!viewModel.tabs[SKILL_TABS.ULTIMATE].isUnlocked ? '<span class="tab-lock-pill">Lv.80</span>' : ''}
        </button>
      </div>

      <div class="skill-window-content">
        ${contentHtml}
      </div>
    </div>
  `;

  // 7. Wire Sub-tabs
  wrap.querySelectorAll('.skill-subtab-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.preventDefault();
      const targetTab = btn.dataset.tab;
      if (targetTab && targetTab !== state.activeSkillTab) {
        state.activeSkillTab = targetTab;
        updateSkillUI(state, callbacks);
      }
    };
  });

  // 7.1 Wire Loadout Bar (Drag-and-Drop, Auto-Equip, Clear, Unequip, Selection)
  const echoDataDefs = (typeof window !== 'undefined' ? window.EchoData?.SKILL_DEFS_ECHO : null) || D()?.SKILL_DEFS || {};

  const autoBtn = wrap.querySelector('.loadout-btn-auto');
  if (autoBtn) {
    autoBtn.onclick = (e) => {
      e.preventDefault();
      autoEquipLoadout(state, echoDataDefs, isSkillAllowedForClass);
      updateSkillUI(state, callbacks);
      updateSkillInfoPanel(state, callbacks);
      if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
        window.floatText('⚡ Loadout Auto-Equipado!', 'float-epic');
      }
    };
  }

  const clearBtn = wrap.querySelector('.loadout-btn-clear');
  if (clearBtn) {
    clearBtn.onclick = (e) => {
      e.preventDefault();
      for (const slotName of ALL_SLOT_NAMES) {
        unequipSkill(state, slotName);
      }
      updateSkillUI(state, callbacks);
      updateSkillInfoPanel(state, callbacks);
      if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
        window.floatText('Loadout Limpo', 'float-neutral');
      }
    };
  }

  wrap.querySelectorAll('.loadout-slot-unequip-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const slotName = btn.dataset.slot;
      if (slotName) {
        unequipSkill(state, slotName);
        updateSkillUI(state, callbacks);
        updateSkillInfoPanel(state, callbacks);
      }
    };
  });

  wrap.querySelectorAll('.loadout-slot').forEach(slotEl => {
    const slotName = slotEl.dataset.slot;
    if (!slotName || slotEl.classList.contains('is-locked')) return;

    // Drag-over and drop support
    slotEl.ondragover = (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    };
    slotEl.ondragenter = (e) => {
      e.preventDefault();
      slotEl.classList.add('drag-over');
    };
    slotEl.ondragleave = () => {
      slotEl.classList.remove('drag-over');
    };
    slotEl.ondrop = (e) => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      const draggedSkillId = e.dataTransfer ? e.dataTransfer.getData('text/skill-id') : null;
      if (draggedSkillId) {
        const res = equipSkill(state, slotName, draggedSkillId, echoDataDefs);
        if (res.success) {
          state.selectedSkill = draggedSkillId;
          updateSkillUI(state, callbacks);
          updateSkillInfoPanel(state, callbacks);
          if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
            const slotLabel = SKILL_LOADOUT_SLOT_LABELS[slotName] || slotName;
            window.floatText(`Equipado em [${slotLabel}]!`, 'sf-heal');
          }
        } else if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
          window.floatText(res.error || 'Não pode equipar', 'float-warning');
        }
      }
    };

    // Click on slot selects skill if equipped
    slotEl.onclick = (e) => {
      if (e.target.closest('.loadout-slot-unequip-btn')) return;
      const sId = slotEl.dataset.skillId;
      if (sId) {
        state.selectedSkill = sId;
        updateSkillUI(state, callbacks);
        updateSkillInfoPanel(state, callbacks);
      }
    };
  });

  // 8. Wire Skill Cards
  wrap.querySelectorAll('.skill-node-card, .skill-card').forEach(card => {
    const sId = card.dataset.skillId;
    if (!sId) return;

    if (card.getAttribute('draggable') === 'true') {
      card.ondragstart = (e) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/skill-id', sId);
          e.dataTransfer.effectAllowed = 'copyMove';
        }
        card.classList.add('is-dragging');
      };
      card.ondragend = () => {
        card.classList.remove('is-dragging');
      };
    }

    if (callbacks.showSkillTooltip) {
      card.onmouseenter = (e) => callbacks.showSkillTooltip(sId, e);
    }
    if (callbacks.hideSkillTooltip) {
      card.onmouseleave = callbacks.hideSkillTooltip;
    }

    card.onclick = () => {
      state.selectedSkill = sId;
      wrap.querySelectorAll('.skill-node-card, .skill-card').forEach(c => {
        c.classList.toggle('is-selected', c.dataset.skillId === sId);
      });

      const isMax = card.classList.contains('is-maxed');
      const isBookReq = card.classList.contains('book-locked') || card.classList.contains('is-book-locked');
      const canAfford = card.classList.contains('can-afford') || card.classList.contains('can-buy');

      if (callbacks.spendSP && canAfford && !isMax && !isBookReq) {
        callbacks.spendSP(sId);
      }

      updateSkillUI(state, callbacks);
      updateSkillInfoPanel(state, callbacks);
    };
  });

  // 9. Update info panel
  updateSkillInfoPanel(state, callbacks);
}

export function updateSkillInfoPanel(state, callbacks = {}) {
  const panel = findElement('skill-info-panel');
  if (!panel) return;

  const echoData = typeof window !== 'undefined' ? window.EchoData : null;
  const SKILL_DEFS = echoData?.SKILL_DEFS_ECHO || D()?.SKILL_DEFS || {};
  const SKILL_REQS = echoData?.SKILL_REQS_ECHO || D()?.SKILL_REQS || {};

  let id = state.selectedSkill;
  if (!id || !SKILL_DEFS[id]) {
    const firstApplicable = Object.keys(SKILL_DEFS).find(sid =>
      isSkillAllowedForClass(state.class, sid) && (state.skills[sid] || 0) > 0
    ) || Object.keys(SKILL_DEFS).find(sid =>
      isSkillAllowedForClass(state.class, sid)
    );
    id = firstApplicable || null;
  }

  const def = id ? SKILL_DEFS[id] : null;
  if (!def) {
    panel.innerHTML = '<p style="color:var(--text-muted);padding:12px">Select a skill to view details.</p>';
    return;
  }

  const lvl = state.skills[id] || 0;
  const max = def.max || def.maxLevel || 5;
  const maxed = lvl >= max;
  const cost = getSkillCost(id, lvl);
  const reqs = SKILL_REQS[id];
  const meetsReqs = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || s === 'reqLvl' || (state.skills[s] || 0) >= v);
  const lvlOk = state.level >= (def.reqLvl || 1);
  const canAfford = state.sp >= cost && !maxed;

  let reqHtml = (reqs && Object.keys(reqs).filter(s => s !== 'level' && s !== 'sp' && s !== 'reqLvl').length > 0)
    ? Object.entries(reqs).filter(([s]) => s !== 'level' && s !== 'sp' && s !== 'reqLvl').map(([s, v]) => {
        const ok = (state.skills[s] || 0) >= v;
        return `<span class="req ${ok ? 'ok' : 'no'}">${SKILL_DEFS[s]?.name || s} ${v}</span>`;
      }).join('')
    : '';
  reqHtml += `<span class="req ${lvlOk ? 'ok' : 'no'}">Level ${def.reqLvl || 1}</span>`;

  const tier = TIER_NAMES[def.tier || 0] || '';
  const effectText = (typeof window !== 'undefined' && window.SkillScaling)
    ? window.SkillScaling.buildSkillEffectText(def, lvl)
    : (def.info || def.desc || '');

  let legacySectionHtml = '';
  if (state.legacyPassives && Object.keys(state.legacyPassives).length > 0) {
    const listHtml = Object.values(state.legacyPassives).map(p => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); border:1px solid rgba(255,215,0,0.25); border-radius:4px; padding:4px 8px; margin-top:4px; font-size:11px;">
        <span style="color:#ffd700; font-weight:bold;">🧬 ${p.name || p.originalSkill}</span>
        <span style="color:#34d399; font-weight:bold;">+${(p.val * 100).toFixed(1)}% ${p.stat.toUpperCase()}</span>
      </div>
    `).join('');

    legacySectionHtml = `
      <div class="si-legacy-section" style="margin-top:14px; padding-top:10px; border-top:1px dashed rgba(255,215,0,0.25);">
        <h4 style="color:#ffd700; font-size:11px; margin-bottom:4px; display:flex; align-items:center; gap:4px;">
          <span>🧬 Memória de Linhagem</span>
          <span style="font-size:9px; color:var(--text-muted); font-weight:normal;">(20% Eficácia Passiva)</span>
        </h4>
        <div class="legacy-passives-list">
          ${listHtml}
        </div>
      </div>
    `;
  }

  const reqBookId = def.requiredItemToUnlock || (def.starRank === 5 ? 'book_5star' : (def.starRank === 4 ? 'book_4star' : null));
  const requiresBookNow = !!reqBookId && lvl === 0;
  const hasRequiredBook = reqBookId ? (state.inventory?.some(i => (i.itemId === reqBookId || (reqBookId === 'book_4star' && i.itemId === 'spellbook_4star')) && (i.count || 1) > 0)) : true;

  const bookNames = {
    'book_1star': 'Tomo 1★ (Comum)',
    'book_2star': 'Tomo 2★ (Raro)',
    'book_3star': 'Tomo 3★ (Épico)',
    'book_4star': 'Tomo 4★ (Lendário)',
    'book_5star': 'Tomo 5★ (Transcendente)'
  };
  const bName = reqBookId ? (bookNames[reqBookId] || 'Livro de Magia') : '';

  // Moveset / Restrição de Arma
  let weaponReqBadge = '';
  const weaponReq = def.weaponType || def.requiredWeapon;
  if (weaponReq && weaponReq !== 'any') {
    const wpnCheck = (typeof canCastSkillWeapon === 'function')
      ? canCastSkillWeapon(state, def)
      : { ok: true };
    const isWepMatch = wpnCheck.ok;
    const reqLabels = {
      bow: 'Arco', dagger: 'Adaga', staff: 'Cajado', sword: 'Espada',
      dual: 'Dual', spear: 'Lança', twohand: '2-Mãos', fist: 'Manopla',
      ancientsword: 'Espada Anciã', blunt: 'Maça'
    };
    const reqDisplay = reqLabels[weaponReq.toLowerCase()] || weaponReq.toUpperCase();
    weaponReqBadge = `
      <div style="display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:3px 8px; border-radius:4px; margin-bottom:6px; background:${isWepMatch ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; border:1px solid ${isWepMatch ? '#10b981' : '#ef4444'}; color:${isWepMatch ? '#6ee7b7' : '#fca5a5'}; font-weight:bold;">
        ${isWepMatch ? '⚔️' : '⚠️'} Exige: ${reqDisplay} ${isWepMatch ? '(Equipada)' : '(Não Equipada)'}
      </div>
    `;
  }

  // Spellbook Requirement Box (1★ a 4★)
  let star4BoxHtml = '';
  if (requiresBookNow) {
    star4BoxHtml = `
      <div style="background:rgba(245,158,11,0.1); border:1px solid #f59e0b; border-radius:6px; padding:8px; margin:8px 0; font-size:11px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:#fbbf24; font-weight:bold;">📖 Requisito: ${bName}</span>
          <span style="background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px; color:${hasRequiredBook ? '#34d399' : '#f87171'}; font-weight:bold;">
            ${hasRequiredBook ? '✓ Disponível na Mochila' : '✗ Falta na Mochila'}
          </span>
        </div>
        <p style="margin:4px 0 0 0; color:var(--text-muted);">Desbloquear esta habilidade consumirá 1x <strong>${bName}</strong> da sua mochila. (Encontre em caçadas/bosses ou compre no Mercado Global!)</p>
      </div>
    `;
  }

  const visibility = getSkillVisibility(state, def);
  const isLocked = visibility === SKILL_VISIBILITY_STATES.LOCKED;
  const canLearn = !isLocked && canAfford && meetsReqs && lvlOk && (!requiresBookNow || hasRequiredBook);

  let btnLabel = maxed ? '✦ MAXED' : `Invest ${cost.toLocaleString()} SP`;
  if (isLocked) {
    const minLvl = Number(def.requiredLevel || def.reqLvl) || 1;
    btnLabel = `🔒 [LOCKED — Lv. ${minLvl}]`;
  } else if (!maxed && requiresBookNow) {
    btnLabel = hasRequiredBook ? `📖 Consumir ${bName} & Aprender (${cost.toLocaleString()} SP)` : `🔒 Falta ${bName}`;
  }

  const iconData = getSkillIcon(id, def);
  const semantic = getSkillSemanticData(id);
  const siIconVal = iconData?.iconPath || def.icon || '✦';
  const isSiIconImg = siIconVal.endsWith('.jpg') || siIconVal.endsWith('.png') || siIconVal.includes('/');
  const siIconHtml = isSiIconImg
    ? `<img src="${getAssetUrl(siIconVal)}" class="skill-icon-img" alt="${def.name}" style="width:36px; height:36px; object-fit:cover; border-radius:6px; border:1px solid rgba(255,255,255,0.2); vertical-align:middle;" onerror="this.style.display='none'" />`
    : `<span class="si-icon">${siIconVal}</span>`;

  const elemClass = `element-${String(semantic.element || def.element || 'physical').toLowerCase()}`;
  const elemTag = `<span class="skill-element-tag ${elemClass}" style="margin-left:4px;">${semantic.element || def.element || 'Physical'}</span>`;
  const roleTag = `<span class="skill-role-tag" style="margin-left:4px;">${semantic.role || def.type || 'Skill'}</span>`;

  let loadoutSectionHtml = '';
  const isPassive = def.type === 'passive' || def.type === 'stat';
  if (lvl > 0 && !isPassive && !isPurgedSkill(id)) {
    const curSlot = getSkillSlot(state, id);
    const unlocked = getUnlockedSlots(state.level || 1);

    if (curSlot) {
      const cond = getSkillCondition(state, curSlot);
      loadoutSectionHtml = `
        <div class="si-loadout-panel" style="margin-top:12px; padding:10px; background:rgba(15,23,42,0.7); border:1px solid rgba(212,167,68,0.4); border-radius:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="color:#d4a744; font-size:12px; font-weight:bold;">⚡ Equipado no Loadout: <strong style="color:#34d399;">${SKILL_LOADOUT_SLOT_LABELS[curSlot] || curSlot}</strong></span>
            <button class="si-btn-unequip" data-slot="${curSlot}" style="padding:3px 10px; font-size:11px; background:#ef4444; border:none; border-radius:4px; color:#fff; cursor:pointer; font-weight:bold;">Desequipar</button>
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px; font-weight:bold;">⚙️ Condições de Auto-Battle:</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px;">
            <div>
              <label style="color:#cbd5e1; font-size:10px; display:block; margin-bottom:2px;">Gatilho de HP:</label>
              <select class="si-cond-select" data-slot="${curSlot}" data-field="hpTrigger" style="width:100%; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:4px; padding:4px;">
                <option value="none" ${cond.hpTrigger === 'none' ? 'selected' : ''}>Sempre (Cooldown)</option>
                <option value="self_below_75" ${cond.hpTrigger === 'self_below_75' ? 'selected' : ''}>Meu HP < 75%</option>
                <option value="self_below_50" ${cond.hpTrigger === 'self_below_50' ? 'selected' : ''}>Meu HP < 50%</option>
                <option value="self_below_30" ${cond.hpTrigger === 'self_below_30' ? 'selected' : ''}>Meu HP < 30% (Pânico)</option>
                <option value="target_below_30" ${cond.hpTrigger === 'target_below_30' ? 'selected' : ''}>HP Inimigo < 30% (Execução)</option>
                <option value="target_below_50" ${cond.hpTrigger === 'target_below_50' ? 'selected' : ''}>HP Inimigo < 50%</option>
              </select>
            </div>
            <div>
              <label style="color:#cbd5e1; font-size:10px; display:block; margin-bottom:2px;">Tipo de Alvo:</label>
              <select class="si-cond-select" data-slot="${curSlot}" data-field="bossTarget" style="width:100%; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:4px; padding:4px;">
                <option value="any" ${cond.bossTarget === 'any' ? 'selected' : ''}>Qualquer Monstro</option>
                <option value="boss_only" ${cond.bossTarget === 'boss_only' ? 'selected' : ''}>Apenas Bosses / Raids</option>
                <option value="normal_only" ${cond.bossTarget === 'normal_only' ? 'selected' : ''}>Apenas Monstros Comuns</option>
              </select>
            </div>
            <div style="grid-column: span 2;">
              <label style="color:#cbd5e1; font-size:10px; display:block; margin-bottom:2px;">Inimigos Mínimos (Tática AoE):</label>
              <select class="si-cond-select" data-slot="${curSlot}" data-field="minEnemies" style="width:100%; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:4px; padding:4px;">
                <option value="1" ${Number(cond.minEnemies) === 1 ? 'selected' : ''}>1+ Inimigo (Padrão)</option>
                <option value="2" ${Number(cond.minEnemies) === 2 ? 'selected' : ''}>2+ Inimigos (Foco em Grupo)</option>
                <option value="3" ${Number(cond.minEnemies) === 3 ? 'selected' : ''}>3+ Inimigos (Horda)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else {
      const slotOptions = unlocked.map(s => `<option value="${s}">${SKILL_LOADOUT_SLOT_LABELS[s] || s}</option>`).join('');
      loadoutSectionHtml = `
        <div class="si-loadout-panel" style="margin-top:12px; padding:10px; background:rgba(15,23,42,0.7); border:1px dashed rgba(212,167,68,0.4); border-radius:6px;">
          <div style="color:#d4a744; font-size:12px; font-weight:bold; margin-bottom:6px;">⚡ Equipar no Loadout de Combate:</div>
          <div style="display:flex; gap:6px; align-items:center;">
            <select class="si-equip-slot-choice" style="flex:1; background:#1e293b; color:#f8fafc; border:1px solid #475569; border-radius:4px; padding:4px 8px; font-size:12px;">
              ${slotOptions}
            </select>
            <button class="si-btn-do-equip" data-skill="${id}" style="padding:4px 12px; font-size:12px; background:linear-gradient(180deg,#10b981,#059669); color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Equipar</button>
          </div>
        </div>
      `;
    }
  }

  const rawDesc = (def.desc || def.note || '').trim();
  const descHtml = (rawDesc && (!effectText || !effectText.includes(rawDesc)))
    ? `<p class="si-desc">${rawDesc}</p>`
    : '';

  panel.innerHTML = `
    <div class="si-head">${siIconHtml}<div class="si-title"><h3>${def.name}</h3><div style="display:flex; align-items:center; gap:4px; margin-top:2px;"><p class="si-tier">${tier} · Lv.${lvl}/${max}</p>${elemTag}${roleTag}</div></div></div>
    ${weaponReqBadge}
    ${star4BoxHtml}
    ${descHtml}<div class="si-effect">${effectText}</div>
    <div class="si-reqs"><span class="si-label">Requires</span>${reqHtml}</div>
    <button class="si-btn" data-skillup="${id}" ${!canLearn ? 'disabled' : ''} style="${requiresBookNow && hasRequiredBook ? 'background:linear-gradient(180deg,#f59e0b,#b45309); color:#fff; font-weight:bold;' : ''}">${btnLabel}</button>
    <p class="si-sp">SP available: <strong>${(state.sp || 0).toLocaleString()}</strong></p>
    ${loadoutSectionHtml}
    ${legacySectionHtml}
  `;

  const btn = panel.querySelector('[data-skillup]');
  if (btn) {
    btn.onclick = () => {
      if (callbacks.spendSP) callbacks.spendSP(btn.dataset.skillup);
    };
  }

  const unequipBtn = panel.querySelector('.si-btn-unequip');
  if (unequipBtn) {
    unequipBtn.onclick = () => {
      unequipSkill(state, unequipBtn.dataset.slot);
      updateSkillUI(state, callbacks);
      updateSkillInfoPanel(state, callbacks);
    };
  }

  const equipBtn = panel.querySelector('.si-btn-do-equip');
  if (equipBtn) {
    equipBtn.onclick = () => {
      const choiceSelect = panel.querySelector('.si-equip-slot-choice');
      const targetSlot = choiceSelect ? choiceSelect.value : 'basic';
      const echoData = typeof window !== 'undefined' ? window.EchoData : null;
      const defs = echoData?.SKILL_DEFS_ECHO || D()?.SKILL_DEFS || {};
      const res = equipSkill(state, targetSlot, equipBtn.dataset.skill, defs);
      if (res.success) {
        updateSkillUI(state, callbacks);
        updateSkillInfoPanel(state, callbacks);
        if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
          const slotLabel = SKILL_LOADOUT_SLOT_LABELS[targetSlot] || targetSlot;
          window.floatText(`Equipado em [${slotLabel}]!`, 'sf-heal');
        }
      } else if (typeof window !== 'undefined' && typeof window.floatText === 'function') {
        window.floatText(res.error || 'Erro ao equipar', 'float-warning');
      }
    };
  }

  panel.querySelectorAll('.si-cond-select').forEach(sel => {
    sel.onchange = () => {
      const slot = sel.dataset.slot;
      const field = sel.dataset.field;
      let val = sel.value;
      if (field === 'minEnemies') val = Number(val) || 1;
      setSkillCondition(state, slot, { [field]: val });
      updateSkillUI(state, callbacks);
    };
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. SHOP & CRAFTING
═══════════════════════════════════════════════════════════════════════════ */
let currentShopTab = 'gear';
let currentShopGrade = 'all';
let currentShopSlot = 'all';
let currentShopQty = 1;
let currentShopSearch = '';

// Estados do Sistema de Comércio Autêntico Lineage 2
let _shopViewMode = 'dialogue'; // 'dialogue' (Imagem 1) | 'store' (Imagem 2)
let _dialogueCategory = 'main'; // 'main' | 'weapons' | 'armors' | 'accessories' | 'consumables' | 'others'
let _activeStoreCategory = 'weapons'; // 'weapons' | 'armors' | 'accessories' | 'consumables' | 'others'
let _activeStoreSubcategory = 'all';
let _activeStoreTab = 'buy'; // 'buy' | 'sell' | 'refund'
let _purchaseCart = []; // [{ id, name, icon, slot, unitPrice, qty, rarity, def }]

// Estados da Forja Imperial Autêntica (Imagem 5 e Imagem 2/3)
let _forgeViewMode = 'dialogue'; // 'dialogue' (Wilbert Imagem 5) | 'workspace'
let _forgeWilbertTopic = 'main'; // 'main' | 'taxes'

export const SHOP_CATEGORY_TREE = {
  weapons: {
    id: 'weapons',
    name: 'Comprar Armas',
    icon: '⚔️',
    dialoguePrompt: 'Qual tipo de armamento você procura para as suas caçadas em Aden?',
    subcategories: [
      { id: 'all', name: 'Todas as Armas', icon: '⚔️' },
      { id: 'bows', name: 'Arcos & Bestas', icon: '🏹' },
      { id: 'swords', name: 'Espadas & Duals', icon: '🗡️' },
      { id: 'staves', name: 'Cajados & Cetros Mágicos', icon: '🪄' },
      { id: 'daggers', name: 'Adagas & Facas', icon: '🗡' },
      { id: 'blunts', name: 'Maças, Martelos & Machados', icon: '🔨' },
      { id: 'polearms', name: 'Lanças & Armas de Haste', icon: '🔱' },
      { id: 'fists', name: 'Punhos & Garras', icon: '🥊' }
    ]
  },
  armors: {
    id: 'armors',
    name: 'Comprar Armaduras',
    icon: '🛡️',
    dialoguePrompt: 'Uma boa armadura faz a diferença entre a glória e a morte. O que procura?',
    subcategories: [
      { id: 'all', name: 'Todas as Armaduras', icon: '🛡️' },
      { id: 'heavy', name: 'Armaduras Pesadas (Heavy)', icon: '🛡️' },
      { id: 'light', name: 'Armaduras Leves (Light)', icon: '🥋' },
      { id: 'robe', name: 'Túnicas & Robes Mágicos', icon: '👘' },
      { id: 'shields', name: 'Escudos & Sigilos', icon: '🔰' },
      { id: 'parts', name: 'Elmos, Luvas & Botas', icon: '🪖' }
    ]
  },
  accessories: {
    id: 'accessories',
    name: 'Comprar Acessórios',
    icon: '📿',
    dialoguePrompt: 'Joias encantadas e relíquias de nobreza aumentam seu poder arcano.',
    subcategories: [
      { id: 'all', name: 'Todos os Acessórios', icon: '📿' },
      { id: 'jewels', name: 'Joias (Colares, Brincos, Anéis)', icon: '💎' },
      { id: 'cloaks', name: 'Capas & Mantos', icon: '🧣' },
      { id: 'belts', name: 'Cintos Místicos (Belts)', icon: '🪢' },
      { id: 'special', name: 'Broches, Talismãs & Agathions', icon: '❇️' }
    ]
  },
  consumables: {
    id: 'consumables',
    name: 'Comprar Consumíveis',
    icon: '🧪',
    dialoguePrompt: 'Suprimentos essenciais: SoulShots, poções e pergaminhos sagrados.',
    subcategories: [
      { id: 'all', name: 'Todos os Consumíveis', icon: '🧪' },
      { id: 'shots', name: 'SoulShots & SpiritShots', icon: '✨' },
      { id: 'potions', name: 'Poções de Cura, Mana & Buffs', icon: '🍷' },
      { id: 'scrolls', name: 'Pergaminhos de Encanto & Teleporte', icon: '📜' },
      { id: 'books', name: 'Livros & Tomos Sagrados', icon: '📖' }
    ]
  },
  others: {
    id: 'others',
    name: 'Mercadorias Místicas & Forja',
    icon: '🌟',
    dialoguePrompt: 'Relíquias raras do Empório, cristais e minérios nobres para a forja.',
    subcategories: [
      { id: 'mystic', name: 'Empório Místico Ancestral', icon: '🔮' },
      { id: 'materials', name: 'Minérios & Cristais de Forja (D-S)', icon: '💎' },
      { id: 'dyes', name: 'Tinturas & Dyes (Henna)', icon: '🖊️' }
    ]
  }
};

/**
 * Valida se um item pertence à categoria e subcategoria selecionadas.
 */
export function matchesShopCategory(def, category, subcat) {
  if (!def) return false;
  const id = (def.id || '').toLowerCase();
  const name = (def.name || '').toLowerCase();
  const slot = (def.slot || '').toLowerCase();
  const desc = (def.desc || '').toLowerCase();
  const text = `${id} ${name} ${desc}`;

  // 1. Armas
  if (category === 'weapons') {
    if (slot !== 'weapon') return false;
    if (!subcat || subcat === 'all') return true;
    if (subcat === 'bows') return /bow|crossbow/.test(id) || /bow|crossbow/.test(name);
    if (subcat === 'staves') return /staff|wand|scepter|magicblunt|crucifix|homunkulus|tear/.test(id) || /staff|wand|scepter/.test(name) || (/mace/.test(name) && (def.matk > (def.atk || 0)));
    if (subcat === 'daggers') return /dagger|knife|sword_breaker/.test(id) || /dagger|knife/.test(name);
    if (subcat === 'blunts') return (/mace|hammer|axe|blunt|morning_star|yaksa|elysian|basalt/.test(id) || /mace|hammer|axe/.test(name)) && !/magicblunt/.test(id) && !(def.matk > (def.atk || 0));
    if (subcat === 'polearms') return /spear|lance|halberd|glaive|pike/.test(id) || /spear|lance|halberd|glaive/.test(name);
    if (subcat === 'fists') return /fist|claw|knuckle|cestus/.test(id) || /fist|claw|knuckle/.test(name);
    if (subcat === 'swords') {
      const isOther = /bow|crossbow|staff|wand|scepter|magicblunt|crucifix|homunkulus|tear|dagger|knife|sword_breaker|mace|hammer|axe|spear|lance|halberd|glaive|fist|claw|knuckle/.test(id);
      return !isOther;
    }
    return true;
  }

  // 2. Armaduras
  if (category === 'armors') {
    const isArmorSlot = ['armor', 'chest', 'legs', 'helmet', 'gloves', 'boots', 'shield'].includes(slot);
    if (!isArmorSlot) return false;
    if (!subcat || subcat === 'all') return true;
    if (subcat === 'shields') return slot === 'shield' || /shield|sigil/.test(id);
    if (subcat === 'parts') return ['helmet', 'gloves', 'boots', 'legs'].includes(slot);
    if (subcat === 'heavy') return getArmorType(id, name) === 'heavy' || (/heavy|plate|breast|protection/.test(text) && !/light|robe/.test(text));
    if (subcat === 'light') return getArmorType(id, name) === 'light' || (/light|leather|manticore|theca|draconic/.test(text) && !/heavy|robe/.test(text));
    if (subcat === 'robe') return getArmorType(id, name) === 'robe' || (/robe|tunic|arcana|karmian|devotion/.test(text) && !/heavy|light/.test(text));
    return true;
  }

  // 3. Acessórios
  if (category === 'accessories') {
    const isAccSlot = ['ring', 'necklace', 'earring', 'belt', 'cloak', 'brooch', 'talisman', 'bracelet', 'hair'].includes(slot);
    if (!isAccSlot && !/ring|necklace|earring|belt|cloak|brooch|talisman|bracelet/.test(id)) return false;
    if (!subcat || subcat === 'all') return true;
    if (subcat === 'jewels') return ['ring', 'necklace', 'earring'].includes(slot) || /ring|necklace|earring/.test(id);
    if (subcat === 'cloaks') return slot === 'cloak' || /cloak|cape/.test(id);
    if (subcat === 'belts') return slot === 'belt' || /belt/.test(id);
    if (subcat === 'special') return ['brooch', 'talisman', 'bracelet', 'hair'].includes(slot) || /brooch|talisman|bracelet|agathion/.test(id);
    return true;
  }

  // 4. Consumíveis
  if (category === 'consumables') {
    const isConsumable = ['potion', 'consumable', 'scroll', 'powerup', 'spellbook'].includes(slot) ||
      /potion|elixir|tea|soulshot|spiritshot|scroll|teleport|resurrection|rebirth|spellbook|tome_|book_|codex/.test(id);
    if (!isConsumable) return false;
    if (!subcat || subcat === 'all') return true;
    if (subcat === 'shots') return /soulshot|spiritshot/.test(id);
    if (subcat === 'potions') return (slot === 'potion' || /potion|elixir|tea|draught/.test(id)) && !/soulshot|spiritshot/.test(id);
    if (subcat === 'scrolls') return (/scroll|teleport|resurrection|rebirth/.test(id) || slot === 'scroll') && !/spellbook/.test(id);
    if (subcat === 'books') return slot === 'spellbook' || /spellbook|book_|codex|tome_/.test(id) || (def.desc && def.desc.toLowerCase().includes('aprender'));
    return true;
  }

  // 5. Outros (Empório & Materiais)
  if (category === 'others') {
    if (subcat === 'mystic') return false; // Mystic utiliza state.mysticShopInventory
    if (subcat === 'materials') {
      return /crystal_[dcbpas]|iron_ore|suede|varnish|charcoal|coal|silver_nugget|oriharukon|mithril|stone/.test(id) || slot === 'material';
    }
    if (subcat === 'dyes') {
      return /dye|henna|tattoo/.test(id) || slot === 'dye';
    }
    return /crystal_[dcbpas]|iron_ore|suede|varnish|charcoal|coal|silver_nugget|oriharukon|mithril|stone|dye|henna|tattoo/.test(id);
  }

  return true;
}

/**
 * Atualiza os contadores da Barra de Recursos Contextual do Império (Header).
 */
export function updateImperialEconomyHeader(state) {
  if (!state) return;
  const root = getRoot();
  if (!root) return;

  const goldEl = root.querySelector('#imp-res-gold');
  if (goldEl) goldEl.textContent = (state.gold || 0).toLocaleString();

  const acEl = root.querySelector('#imp-res-ac');
  if (acEl) acEl.textContent = (state.adenCoins || 0).toLocaleString();

  const aaEl = root.querySelector('#imp-res-aa');
  if (aaEl) aaEl.textContent = ((state.sevenSigns && state.sevenSigns.ancientAdena) || 0).toLocaleString();

  const spEl = root.querySelector('#imp-res-sp');
  if (spEl) spEl.textContent = (state.sp || 0).toLocaleString();

  const forgeEl = root.querySelector('#imp-res-forge');
  if (forgeEl) {
    const forgeLvl = state.accountForgeLevel || state.craftLevel || 1;
    forgeEl.textContent = `Lv. ${forgeLvl}`;
  }

  const chargesEl = root.querySelector('#imp-res-charges');
  if (chargesEl) {
    const rc = state.randomCraft || {};
    const charges = Number(rc.charge ?? state.craftCharges ?? 0);
    const points = Number(rc.points ?? state.randomCraftCharge ?? state.craftPoints ?? 0);
    chargesEl.textContent = `${charges} Carga${charges !== 1 ? 's' : ''} (${points}/100)`;
  }
}

/**
 * Ponto de entrada central para renderizar a Guia Mercador.
 * Alterna suavemente entre o Estágio 1 (Diálogo NPC) e o Estágio 2 (Store Clássica L2).
 */
export function updateShopUI(state, callbacks = {}) {
  const root = getRoot();
  updateImperialEconomyHeader(state);

  const goldEl = findElement('gold-count') || findElement('shop-gold');
  if (goldEl) goldEl.textContent = (state.gold || 0).toLocaleString();

  // Timer do Mercador Místico (3 horas)
  const now = Date.now();
  const THREE_HOURS = 3 * 3600 * 1000;
  if (!state.mysticShopLastReset || (now - state.mysticShopLastReset >= THREE_HOURS)) {
    state.mysticShopLastReset = now;
    state.mysticShopInventory = rollMysticStock();
  }

  const mysticTimerEl = root.querySelector('#mystic-shop-timer');
  const mysticCountdown = root.querySelector('#mystic-timer-countdown');
  if (mysticTimerEl) {
    mysticTimerEl.style.display = (_shopViewMode === 'store' && _activeStoreCategory === 'others' && _activeStoreSubcategory === 'mystic') ? 'inline-flex' : 'none';
    if (mysticCountdown) {
      const remainingMs = Math.max(0, THREE_HOURS - (now - state.mysticShopLastReset));
      const hours = Math.floor(remainingMs / (3600 * 1000));
      const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
      mysticCountdown.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  if (_shopViewMode === 'dialogue') {
    renderDialogueView(state, callbacks);
  } else {
    renderStoreView(state, callbacks);
  }
}

/**
 * Renderiza o Estágio 1: Janela de Diálogo / Chat NPC (Imagem 1 de Referência).
 */
function renderDialogueView(state, callbacks) {
  const root = getRoot();
  const dialogueView = root.querySelector('#shop-dialogue-view');
  const storeView = root.querySelector('#shop-store-view');
  if (dialogueView) dialogueView.style.display = 'flex';
  if (storeView) storeView.style.display = 'none';

  const npcNameEl = root.querySelector('#shop-npc-name');
  const npcTextEl = root.querySelector('#shop-npc-text');
  const optionsEl = root.querySelector('#shop-dialogue-options');
  if (!optionsEl) return;

  if (_dialogueCategory === 'main') {
    if (npcNameEl) npcNameEl.textContent = 'Trader Woodrow:';
    if (npcTextEl) npcTextEl.textContent = 'Can I show you anything in particular? We are sure to have something for everyone.';

    optionsEl.innerHTML = `
      <button class="l2chat-option-btn" data-dialogue-cat="weapons">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Comprar Armas</div>
          <div class="l2chat-option-hint">Arcos, Espadas, Cajados, Adagas, Maças, Lanças, Punhos</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-cat="armors">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Comprar Armaduras</div>
          <div class="l2chat-option-hint">Heavy, Light, Robe, Escudos e Peças de Proteção</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-cat="accessories">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Comprar Acessórios</div>
          <div class="l2chat-option-hint">Joias Ancestrais, Capas, Cintos, Broches e Talismãs</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-cat="consumables">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Comprar Consumíveis</div>
          <div class="l2chat-option-hint">SoulShots, SpiritShots, Poções, Pergaminhos e Livros de Magia</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-cat="others">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Mercadorias Místicas &amp; Forja (Outros)</div>
          <div class="l2chat-option-hint">Empório Místico com Reroll, Minérios, Cristais D-S e Tinturas</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-action="sell" style="border-color:rgba(239,68,68,0.35);">
        <span class="l2chat-bubble-icon" style="color:#f87171;">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#fca5a5;">Vender Itens da Mochila</div>
          <div class="l2chat-option-hint">Venda itens comuns pelo valor de 50% de Adena</div>
        </div>
        <span style="color:#fca5a5; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-dialogue-action="refund" style="border-color:rgba(245,158,11,0.35);">
        <span class="l2chat-bubble-icon" style="color:#fbbf24;">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#fde68a;">Recompra de Itens</div>
          <div class="l2chat-option-hint">Recuperar itens vendidos recentemente</div>
        </div>
        <span style="color:#fde68a; font-size:12px;">➔</span>
      </button>
    `;
  } else {
    const catData = SHOP_CATEGORY_TREE[_dialogueCategory] || SHOP_CATEGORY_TREE.weapons;
    if (npcNameEl) npcNameEl.textContent = 'Trader Woodrow:';
    if (npcTextEl) npcTextEl.textContent = catData.dialoguePrompt;

    let subHtml = catData.subcategories.map(sub => `
      <button class="l2chat-option-btn" data-dialogue-open-store="${catData.id}" data-dialogue-subcat="${sub.id}">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div class="l2chat-option-text">${sub.icon} ${sub.name}</div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>
    `).join('');

    subHtml += `
      <button class="l2chat-option-btn l2chat-back-btn" data-dialogue-back="true">
        <span style="font-size:14px;">↩️</span>
        <div class="l2chat-option-text" style="color:#ffd877;">Voltar ao Menu Principal</div>
      </button>
    `;

    optionsEl.innerHTML = subHtml;
  }

  optionsEl.onclick = (e) => {
    const catBtn = e.target.closest('[data-dialogue-cat]');
    if (catBtn) {
      _dialogueCategory = catBtn.dataset.dialogueCat;
      renderDialogueView(state, callbacks);
      return;
    }

    const backBtn = e.target.closest('[data-dialogue-back]');
    if (backBtn) {
      _dialogueCategory = 'main';
      renderDialogueView(state, callbacks);
      return;
    }

    const openStoreBtn = e.target.closest('[data-dialogue-open-store]');
    if (openStoreBtn) {
      _activeStoreCategory = openStoreBtn.dataset.dialogueOpenStore;
      _activeStoreSubcategory = openStoreBtn.dataset.dialogueSubcat || 'all';
      _activeStoreTab = 'buy';
      _shopViewMode = 'store';
      updateShopUI(state, callbacks);
      return;
    }

    const actionBtn = e.target.closest('[data-dialogue-action]');
    if (actionBtn) {
      const act = actionBtn.dataset.dialogueAction;
      _activeStoreTab = act;
      _shopViewMode = 'store';
      updateShopUI(state, callbacks);
      return;
    }
  };
}

/**
 * Renderiza o Estágio 2: Janela Store Clássica do Lineage 2 (Imagem 2 de Referência).
 */
function renderStoreView(state, callbacks) {
  const root = getRoot();
  const dialogueView = root.querySelector('#shop-dialogue-view');
  const storeView = root.querySelector('#shop-store-view');
  if (dialogueView) dialogueView.style.display = 'none';
  if (storeView) storeView.style.display = 'flex';

  // 1. Botões de Voltar ao Diálogo e Fechar
  const backBtn = root.querySelector('#shop-back-to-dialogue-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      _shopViewMode = 'dialogue';
      _dialogueCategory = 'main';
      updateShopUI(state, callbacks);
    };
  }
  const closeBtn = root.querySelector('#shop-store-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      _shopViewMode = 'dialogue';
      _dialogueCategory = 'main';
      updateShopUI(state, callbacks);
    };
  }

  // 2. Título da Janela Store com Categoria Ativa
  const winTitle = root.querySelector('#shop-window-title');
  if (winTitle) {
    const catName = SHOP_CATEGORY_TREE[_activeStoreCategory]?.name || 'Loja';
    winTitle.textContent = `Store — ${catName}`;
  }

  // 3. Abas Principais (Buy, Sell, Refund)
  root.querySelectorAll('.l2store-tab').forEach(tab => {
    const t = tab.dataset.shoptab;
    tab.classList.toggle('active', t === _activeStoreTab);
    tab.onclick = (e) => {
      e.preventDefault();
      _activeStoreTab = t;
      updateShopUI(state, callbacks);
    };
  });

  // 4. Medidor de Capacidade da Mochila
  const inv = state.inventory || [];
  const maxSlots = getMaxInventorySlots ? getMaxInventorySlots(state) : (state.maxInventorySlots || 150);
  const usedSlotsEl = root.querySelector('#shop-inv-used');
  const maxSlotsEl = root.querySelector('#shop-inv-max');
  if (usedSlotsEl) usedSlotsEl.textContent = inv.length;
  if (maxSlotsEl) maxSlotsEl.textContent = maxSlots;

  // 5. Barra de Busca em Tempo Real
  const searchInput = root.querySelector('#shop-search-input');
  const clearSearchBtn = root.querySelector('#shop-clear-search-btn');
  if (searchInput && !searchInput._bound) {
    searchInput._bound = true;
    searchInput.oninput = (e) => {
      currentShopSearch = (e.target.value || '').trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.style.display = currentShopSearch ? 'inline-block' : 'none';
      updateShopUI(state, callbacks);
    };
  }
  if (clearSearchBtn && !clearSearchBtn._bound) {
    clearSearchBtn._bound = true;
    clearSearchBtn.onclick = () => {
      if (searchInput) searchInput.value = '';
      currentShopSearch = '';
      clearSearchBtn.style.display = 'none';
      updateShopUI(state, callbacks);
    };
  }

  // 6. Subcategorias & Graus (visíveis na aba Buy)
  const filterToolbar = root.querySelector('#shop-filter-toolbar');
  if (filterToolbar) {
    filterToolbar.style.display = (_activeStoreTab === 'buy') ? 'flex' : 'none';
  }

  const subcatStrip = root.querySelector('#shop-subcat-strip');
  if (subcatStrip && _activeStoreTab === 'buy') {
    const currentCatObj = SHOP_CATEGORY_TREE[_activeStoreCategory] || SHOP_CATEGORY_TREE.weapons;
    subcatStrip.innerHTML = currentCatObj.subcategories.map(sub => `
      <button class="l2store-subcat-btn ${sub.id === _activeStoreSubcategory ? 'active' : ''}" data-subcat-id="${sub.id}">
        ${sub.icon} ${sub.name}
      </button>
    `).join('');

    subcatStrip.querySelectorAll('.l2store-subcat-btn').forEach(btn => {
      btn.onclick = () => {
        _activeStoreSubcategory = btn.dataset.subcatId;
        updateShopUI(state, callbacks);
      };
    });
  }

  // 7. Botões de Grau (NG, D, C, B, A, S)
  root.querySelectorAll('#shop-grade-strip .l2store-grade-btn').forEach(btn => {
    const grade = btn.dataset.shopgrade;
    btn.classList.toggle('active', grade === currentShopGrade);
    btn.onclick = () => {
      currentShopGrade = grade;
      updateShopUI(state, callbacks);
    };
  });

  // 8. Banner do Empório Místico
  const mysticBanner = root.querySelector('#shop-mystic-banner');
  if (mysticBanner) {
    const isMysticSub = (_activeStoreCategory === 'others' && _activeStoreSubcategory === 'mystic');
    if (isMysticSub && _activeStoreTab === 'buy') {
      mysticBanner.style.display = 'block';
      mysticBanner.innerHTML = `
        <div style="background:linear-gradient(135deg, rgba(35,15,55,0.9), rgba(18,10,28,0.95)); border:1px solid rgba(168,85,247,0.5); border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="color:#e9d5ff; font-family:'Cinzel',serif; font-weight:700; font-size:13px;">🔮 Empório Místico Ancestral</div>
            <div style="font-size:11px; color:#cbd5e1;">Relíquias raras sorteadas a cada 3 horas. Você pode forçar novos itens.</div>
          </div>
          <button class="l2store-action-btn primary" data-reroll-mystic="true" style="padding:4px 12px; font-size:11px;">
            Forçar Restoque (50.000g)
          </button>
        </div>
      `;
      const rerollBtn = mysticBanner.querySelector('[data-reroll-mystic]');
      if (rerollBtn) {
        rerollBtn.onclick = () => {
          if (callbacks.rerollMysticStock) callbacks.rerollMysticStock(rollMysticStock);
          else if (typeof window !== 'undefined' && window.rerollMysticStock) window.rerollMysticStock(rollMysticStock);
          updateShopUI(state, callbacks);
        };
      }
    } else {
      mysticBanner.style.display = 'none';
    }
  }

  // 9. RENDERIZAÇÃO DO CONTEÚDO DAS COLUNAS
  if (_activeStoreTab === 'sell') {
    renderStoreSellTab(state, callbacks);
  } else if (_activeStoreTab === 'refund') {
    renderStoreRefundTab(state, callbacks);
  } else {
    renderStoreBuyTab(state, callbacks);
  }
}

/**
 * Renderiza o Catálogo de Compras da Store (Buy Tab).
 */
function renderStoreBuyTab(state, callbacks) {
  const root = getRoot();
  const leftColTitle = root.querySelector('#shop-left-col-title');
  const leftCountBadge = root.querySelector('#shop-left-count-badge');
  const itemsContainer = root.querySelector('#shop-items-container');
  const rightColTitle = root.querySelector('#shop-right-col-title');
  const purchaseListContainer = root.querySelector('#shop-purchase-list');
  const clearCartBtn = root.querySelector('#shop-clear-cart-btn');

  if (leftColTitle) leftColTitle.textContent = 'Shop List';
  if (rightColTitle) rightColTitle.textContent = 'Purchase List';
  if (clearCartBtn) {
    clearCartBtn.style.display = 'inline-block';
    clearCartBtn.onclick = () => {
      _purchaseCart = [];
      renderStoreBuyTab(state, callbacks);
    };
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const charLvl = state.level || 1;
  const maxTier = getMaxVisibleGradeTier(charLvl);

  let itemsToDisplay = [];
  const isMystic = (_activeStoreCategory === 'others' && _activeStoreSubcategory === 'mystic');

  if (isMystic) {
    itemsToDisplay = (state.mysticShopInventory || []).map(item => {
      let id = item.itemId || item.id;
      if (id === 'enchant_weapon_scroll') id = 'scroll_of_enchant_weapon_';
      if (id === 'enchant_armor_scroll') id = 'scroll_of_enchant_armor';
      const def = allItems[id] || (item.name ? item : null);
      return { def, rarity: item.rarity || 'rare' };
    }).filter(entry => entry.def && entry.def.name && entry.def.name !== 'undefined');
  } else {
    itemsToDisplay = Object.values(allItems).filter(def => {
      if (!def || !def.id) return false;
      if (!matchesShopCategory(def, _activeStoreCategory, _activeStoreSubcategory)) return false;
      if (getItemTierNum(def) > maxTier) return false;
      return true;
    }).map(def => ({ def, rarity: 'common' }));
  }

  // Deduplicação por ID
  const seenIds = new Set();
  itemsToDisplay = itemsToDisplay.filter(({ def }) => {
    if (!def || !def.id) return false;
    if (seenIds.has(def.id)) return false;
    seenIds.add(def.id);
    return true;
  });

  // Filtro de Grau
  if (currentShopGrade !== 'all') {
    itemsToDisplay = itemsToDisplay.filter(({ def }) => getItemGradeCode(def) === currentShopGrade);
  }

  // Filtro de Busca
  if (currentShopSearch) {
    itemsToDisplay = itemsToDisplay.filter(({ def }) => {
      const name = (def.name || '').toLowerCase();
      const desc = (def.desc || '').toLowerCase();
      const slot = (def.slot || '').toLowerCase();
      const id = (def.id || '').toLowerCase();
      return name.includes(currentShopSearch) || desc.includes(currentShopSearch) || slot.includes(currentShopSearch) || id.includes(currentShopSearch);
    });
  }

  if (leftCountBadge) leftCountBadge.textContent = `${itemsToDisplay.length} itens`;

  // Renderizar a Coluna Esquerda: Shop List
  if (!itemsContainer) return;
  if (itemsToDisplay.length === 0) {
    itemsContainer.innerHTML = `
      <div style="padding:40px 10px; text-align:center; color:#64748b; font-size:11px; grid-column:1/-1;">
        Nenhum item encontrado nesta categoria para o filtro selecionado.
      </div>
    `;
  } else {
    itemsContainer.innerHTML = itemsToDisplay.map(({ def, rarity }) => {
      const gradeInfo = getItemGrade(def);
      const reqLvl = def.req?.level || def.reqLvl || 1;
      const isLvlOk = charLvl >= reqLvl;
      const price = isMystic ? Math.floor((def.price || 500) * (gData?.RARITY?.[rarity]?.mult || 1) * 2) : (def.price || 100);
      const stats = buildShopStatsSummary(def);
      const tooltip = `${def.name} [${gradeInfo.label}]\n${stats ? stats + '\n' : ''}Preço: ${price.toLocaleString()} Adena${!isLvlOk ? `\n🔒 Requer Lv. ${reqLvl}` : ''}`;

      return `
        <div class="l2store-slot ${!isLvlOk ? 'locked' : ''}" data-add-cart="${def.id}" data-rarity="${rarity}" title="${tooltip}">
          <span class="l2store-slot-grade grade-${gradeInfo.code}">${gradeInfo.code.toUpperCase()}</span>
          ${getItemIcon(def)}
          ${!isLvlOk ? `<div style="position:absolute; inset:0; background:rgba(0,0,0,0.65); display:flex; align-items:center; justify-content:center; font-size:9px; color:#f87171; font-weight:bold; font-family:'IBM Plex Mono',monospace;">Lv.${reqLvl}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // Ação de clique no slot para adicionar ao carrinho
  itemsContainer.onclick = (e) => {
    const slotEl = e.target.closest('[data-add-cart]');
    if (!slotEl || slotEl.classList.contains('locked')) return;
    const itemId = slotEl.dataset.addCart;
    const rarity = slotEl.dataset.rarity || 'common';
    const def = allItems[itemId];
    if (!def) return;

    const basePrice = isMystic ? Math.floor((def.price || 500) * (gData?.RARITY?.[rarity]?.mult || 1) * 2) : (def.price || 100);
    const existing = _purchaseCart.find(item => item.id === itemId && item.rarity === rarity);
    if (existing) {
      existing.qty += 1;
    } else {
      _purchaseCart.push({
        id: itemId,
        name: def.name,
        slot: def.slot,
        unitPrice: basePrice,
        qty: 1,
        rarity,
        def
      });
    }
    renderStoreBuyTab(state, callbacks);
  };

  // Renderizar a Coluna Direita: Purchase List (Carrinho)
  if (!purchaseListContainer) return;
  if (_purchaseCart.length === 0) {
    purchaseListContainer.innerHTML = `
      <div style="padding:40px 10px; text-align:center; color:#64748b; font-size:11px; grid-column:1/-1;">
        Clique nos itens da <strong>Shop List</strong> à esquerda para adicionar à lista de compra.
      </div>
    `;
  } else {
    purchaseListContainer.innerHTML = _purchaseCart.map(cartItem => {
      const subtotal = cartItem.unitPrice * cartItem.qty;
      return `
        <div class="l2store-cart-item">
          <div class="l2store-cart-item-info">
            <div style="width:30px; height:30px; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.5); border-radius:4px; flex-shrink:0;">
              ${getItemIcon(cartItem.def || cartItem)}
            </div>
            <div style="min-width:0; flex:1;">
              <div class="l2store-cart-item-name" title="${cartItem.name}">${cartItem.name}</div>
              <div class="l2store-cart-item-price">🪙 ${subtotal.toLocaleString()} (${cartItem.unitPrice.toLocaleString()}g un)</div>
            </div>
          </div>
          <div class="l2store-cart-controls">
            <button class="l2store-cart-btn" data-cart-minus="${cartItem.id}">-</button>
            <span class="l2store-cart-qty">${cartItem.qty}</span>
            <button class="l2store-cart-btn" data-cart-plus="${cartItem.id}">+</button>
            <button class="l2store-cart-btn" data-cart-max="${cartItem.id}" title="Comprar Máximo Possível" style="width:auto; padding:0 4px; font-size:9px;">Máx</button>
            <button class="l2store-cart-btn remove" data-cart-remove="${cartItem.id}" title="Remover da lista">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Delegação de controles do carrinho
  purchaseListContainer.onclick = (e) => {
    const minusBtn = e.target.closest('[data-cart-minus]');
    if (minusBtn) {
      const id = minusBtn.dataset.cartMinus;
      const it = _purchaseCart.find(c => c.id === id);
      if (it) {
        it.qty -= 1;
        if (it.qty <= 0) _purchaseCart = _purchaseCart.filter(c => c.id !== id);
        renderStoreBuyTab(state, callbacks);
      }
      return;
    }

    const plusBtn = e.target.closest('[data-cart-plus]');
    if (plusBtn) {
      const id = plusBtn.dataset.cartPlus;
      const it = _purchaseCart.find(c => c.id === id);
      if (it) {
        it.qty += 1;
        renderStoreBuyTab(state, callbacks);
      }
      return;
    }

    const maxBtn = e.target.closest('[data-cart-max]');
    if (maxBtn) {
      const id = maxBtn.dataset.cartMax;
      const it = _purchaseCart.find(c => c.id === id);
      if (it) {
        const affordable = Math.max(1, Math.floor((state.gold || 0) / it.unitPrice));
        it.qty = affordable;
        renderStoreBuyTab(state, callbacks);
      }
      return;
    }

    const removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      const id = removeBtn.dataset.cartRemove;
      _purchaseCart = _purchaseCart.filter(c => c.id !== id);
      renderStoreBuyTab(state, callbacks);
      return;
    }
  };

  // Barra Inferior de Status (Adena, Weight, Price e Botões Buy/Cancel)
  const totalPrice = _purchaseCart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
  const totalCartCount = _purchaseCart.reduce((sum, item) => sum + item.qty, 0);

  const bottomAdena = root.querySelector('#shop-bottom-adena');
  const bottomPrice = root.querySelector('#shop-bottom-price');
  const weightBar = root.querySelector('#shop-bottom-weight-bar');
  const weightText = root.querySelector('#shop-bottom-weight-text');
  const confirmBtn = root.querySelector('#shop-action-confirm-btn');
  const cancelBtn = root.querySelector('#shop-action-cancel-btn');

  if (bottomAdena) bottomAdena.textContent = (state.gold || 0).toLocaleString();
  if (bottomPrice) bottomPrice.textContent = totalPrice.toLocaleString();

  const invCount = (state.inventory || []).length;
  const maxSlots = getMaxInventorySlots ? getMaxInventorySlots(state) : (state.maxInventorySlots || 150);
  const weightPct = Math.min(100, Math.round((invCount / maxSlots) * 100));
  if (weightBar) weightBar.style.width = `${weightPct}%`;
  if (weightText) weightText.textContent = `${(weightPct * 0.78).toFixed(2).replace('.', ',')}%`;

  if (confirmBtn) {
    confirmBtn.textContent = totalCartCount > 0 ? `Buy (${totalCartCount})` : 'Buy';
    confirmBtn.disabled = _purchaseCart.length === 0 || (state.gold || 0) < totalPrice;
    confirmBtn.onclick = () => {
      if (_purchaseCart.length === 0) return;
      if ((state.gold || 0) < totalPrice) return;

      for (const item of _purchaseCart) {
        if (item.rarity !== 'common' && callbacks.buyMysticItem) {
          callbacks.buyMysticItem(item.id, item.rarity);
        } else if (callbacks.buyItem) {
          callbacks.buyItem(item.id, item.qty, item.rarity);
        } else if (typeof window !== 'undefined' && window.buyItem) {
          window.buyItem(item.id, item.qty, item.rarity);
        }
      }
      _purchaseCart = [];
      updateShopUI(state, callbacks);
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      _purchaseCart = [];
      renderStoreBuyTab(state, callbacks);
    };
  }
}

/**
 * Renderiza a Aba de Venda de Itens (Sell Tab).
 */
function renderStoreSellTab(state, callbacks) {
  const root = getRoot();
  const leftColTitle = root.querySelector('#shop-left-col-title');
  const leftCountBadge = root.querySelector('#shop-left-count-badge');
  const itemsContainer = root.querySelector('#shop-items-container');
  const rightColTitle = root.querySelector('#shop-right-col-title');
  const purchaseListContainer = root.querySelector('#shop-purchase-list');
  const clearCartBtn = root.querySelector('#shop-clear-cart-btn');

  if (leftColTitle) leftColTitle.textContent = 'Itens na Mochila';
  if (rightColTitle) rightColTitle.textContent = 'Ações de Venda & Descarte';
  if (clearCartBtn) clearCartBtn.style.display = 'none';

  const inv = state.inventory || [];
  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const selectedSet = getSelectedSet ? getSelectedSet(state) : new Set();

  if (leftCountBadge) leftCountBadge.textContent = `${inv.length} itens`;

  if (!itemsContainer) return;
  if (inv.length === 0) {
    itemsContainer.innerHTML = `
      <div style="padding:40px 10px; text-align:center; color:#64748b; font-size:11px; grid-column:1/-1;">
        Sua mochila está vazia.
      </div>
    `;
  } else {
    itemsContainer.innerHTML = inv.map(item => {
      const def = allItems[item.itemId || item.id] || item;
      const gradeInfo = getItemGrade(def);
      const sellUnit = getSellValue(item);
      const count = item.count || 1;
      const isEquipped = Boolean(item.equipped);
      const isLocked = selectedSet.has(item.uid);

      return `
        <div class="l2store-slot ${isEquipped || isLocked ? 'locked' : ''}" data-sell-item="${item.uid}" title="${item.enchant > 0 ? `+${item.enchant} ` : ''}${def.name}\nValor de Venda: ${sellUnit.toLocaleString()}g">
          <span class="l2store-slot-grade grade-${gradeInfo.code}">${gradeInfo.code.toUpperCase()}</span>
          ${getItemIcon(def)}
          ${count > 1 ? `<span class="l2store-slot-qty">${count}</span>` : ''}
          ${isEquipped ? `<div style="position:absolute; inset:0; background:rgba(16,185,129,0.5); display:flex; align-items:center; justify-content:center; font-size:8px; color:#fff; font-weight:bold;">EQUIP</div>` : ''}
          ${isLocked ? `<div style="position:absolute; inset:0; background:rgba(245,158,11,0.5); display:flex; align-items:center; justify-content:center; font-size:10px;">🔒</div>` : ''}
        </div>
      `;
    }).join('');
  }

  // Painel Direito: Ações de Venda Rápida
  if (purchaseListContainer) {
    purchaseListContainer.innerHTML = `
      <div style="grid-column:1/-1; display:flex; flex-direction:column; gap:10px; padding:8px;">
        <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px;">
          <h5 style="margin:0 0 4px 0; color:#fca5a5; font-family:'Cinzel',serif;">🧹 Venda de Lixo (Junk Sell)</h5>
          <p style="margin:0 0 8px 0; font-size:11px; color:#cbd5e1;">Venda instantaneamente todos os itens comuns não bloqueados da mochila pelo valor de 50% de Adena.</p>
          <button class="l2store-action-btn primary" data-sell-junk="true" style="width:100%; background:linear-gradient(180deg,#ef4444,#991b1b); border-color:#f87171; color:#fff;">
            🧹 Vender Todos os Comuns
          </button>
        </div>

        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:10px; font-size:11px; color:#94a3b8;">
          <strong style="color:#ffd877;">Dica de Mercador:</strong> Clique diretamente em qualquer item na coluna à esquerda para vendê-lo individualmente. Itens equipados e protegidos por trava (🔒) não podem ser vendidos.
        </div>
      </div>
    `;

    const junkBtn = purchaseListContainer.querySelector('[data-sell-junk]');
    if (junkBtn) {
      junkBtn.onclick = () => {
        if (callbacks.sellAllJunk) callbacks.sellAllJunk();
        else if (typeof window !== 'undefined' && window.sellAllJunk) window.sellAllJunk();
        updateShopUI(state, callbacks);
      };
    }
  }

  itemsContainer.onclick = (e) => {
    const slotEl = e.target.closest('[data-sell-item]');
    if (!slotEl || slotEl.classList.contains('locked')) return;
    const uid = slotEl.dataset.sellItem;
    if (callbacks.sellItem) callbacks.sellItem(uid, 1);
    else if (typeof window !== 'undefined' && window.sellItem) window.sellItem(uid, 1);
    updateShopUI(state, callbacks);
  };

  // Barra Inferior
  const bottomAdena = root.querySelector('#shop-bottom-adena');
  const bottomPrice = root.querySelector('#shop-bottom-price');
  const confirmBtn = root.querySelector('#shop-action-confirm-btn');
  const cancelBtn = root.querySelector('#shop-action-cancel-btn');

  if (bottomAdena) bottomAdena.textContent = (state.gold || 0).toLocaleString();
  if (bottomPrice) bottomPrice.textContent = '0';
  if (confirmBtn) {
    confirmBtn.textContent = 'Sell';
    confirmBtn.disabled = true;
  }
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      _shopViewMode = 'dialogue';
      updateShopUI(state, callbacks);
    };
  }
}

/**
 * Renderiza a Aba de Recompra (Refund Tab).
 */
function renderStoreRefundTab(state, callbacks) {
  const root = getRoot();
  const leftColTitle = root.querySelector('#shop-left-col-title');
  const leftCountBadge = root.querySelector('#shop-left-count-badge');
  const itemsContainer = root.querySelector('#shop-items-container');
  const rightColTitle = root.querySelector('#shop-right-col-title');
  const purchaseListContainer = root.querySelector('#shop-purchase-list');
  const clearCartBtn = root.querySelector('#shop-clear-cart-btn');

  if (leftColTitle) leftColTitle.textContent = 'Fila de Recompra (Últimos 10)';
  if (rightColTitle) rightColTitle.textContent = 'Informações de Recompra';
  if (clearCartBtn) clearCartBtn.style.display = 'none';

  const buyback = state.buybackQueue || [];
  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};

  if (leftCountBadge) leftCountBadge.textContent = `${buyback.length} itens`;

  if (!itemsContainer) return;
  if (buyback.length === 0) {
    itemsContainer.innerHTML = `
      <div style="padding:40px 10px; text-align:center; color:#64748b; font-size:11px; grid-column:1/-1;">
        Nenhum item vendido recentemente para recompra.
      </div>
    `;
  } else {
    itemsContainer.innerHTML = buyback.map((entry, idx) => {
      const item = entry.itemCopy;
      const def = allItems[item.itemId || item.id] || item;
      const gradeInfo = getItemGrade(def);
      return `
        <div class="l2store-slot" data-buyback-idx="${idx}" title="${def.name}\nRecomprar por: ${entry.sellPrice.toLocaleString()}g">
          <span class="l2store-slot-grade grade-${gradeInfo.code}">${gradeInfo.code.toUpperCase()}</span>
          ${getItemIcon(def)}
          ${item.count > 1 ? `<span class="l2store-slot-qty">${item.count}</span>` : ''}
        </div>
      `;
    }).join('');

    itemsContainer.onclick = (e) => {
      const slotEl = e.target.closest('[data-buyback-idx]');
      if (!slotEl) return;
      const idx = parseInt(slotEl.dataset.buybackIdx, 10);
      if (callbacks.buybackItem) callbacks.buybackItem(idx);
      else if (typeof window !== 'undefined' && window.buybackItem) window.buybackItem(idx);
      updateShopUI(state, callbacks);
    };
  }

  if (purchaseListContainer) {
    purchaseListContainer.innerHTML = `
      <div style="grid-column:1/-1; padding:12px; font-size:11px; color:#cbd5e1; line-height:1.5;">
        <h5 style="margin:0 0 6px 0; color:#ffd877; font-family:'Cinzel',serif;">↩️ Como funciona a Recompra?</h5>
        <p style="margin:0 0 8px 0;">O Mercador de Aden mantém em estoque os últimos 10 itens que você vendeu. Você pode recomprá-los exatamente pelo mesmo valor recebido.</p>
        <p style="margin:0; color:#94a3b8;">Clique em qualquer item na coluna à esquerda para resgatá-lo de volta para a sua mochila.</p>
      </div>
    `;
  }

  const bottomAdena = root.querySelector('#shop-bottom-adena');
  const bottomPrice = root.querySelector('#shop-bottom-price');
  const confirmBtn = root.querySelector('#shop-action-confirm-btn');
  const cancelBtn = root.querySelector('#shop-action-cancel-btn');

  if (bottomAdena) bottomAdena.textContent = (state.gold || 0).toLocaleString();
  if (bottomPrice) bottomPrice.textContent = '0';
  if (confirmBtn) {
    confirmBtn.textContent = 'Refund';
    confirmBtn.disabled = true;
  }
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      _shopViewMode = 'dialogue';
      updateShopUI(state, callbacks);
    };
  }
}

/**
 * Formata um resumo conciso dos atributos de um item para exibição em cards de loja e forja.
 * @param {Object} def
 * @returns {string}
 */
export function buildShopStatsSummary(def) {
  if (!def) return '';
  const parts = [];
  if (def.atk != null && def.atk > 0) parts.push(`⚔️ ${def.atk} P.Atk`);
  if (def.matk != null && def.matk > 0) parts.push(`🪄 ${def.matk} M.Atk`);
  if (def.pAtk != null && def.pAtk > 0 && def.atk == null) parts.push(`⚔️ ${def.pAtk} P.Atk`);
  if (def.mAtk != null && def.mAtk > 0 && def.matk == null) parts.push(`🪄 ${def.mAtk} M.Atk`);
  if (def.def != null && def.def > 0) parts.push(`🛡️ ${def.def} P.Def`);
  if (def.mdef != null && def.mdef > 0) parts.push(`🔮 ${def.mdef} M.Def`);
  if (def.pDef != null && def.pDef > 0 && def.def == null) parts.push(`🛡️ ${def.pDef} P.Def`);
  if (def.mDef != null && def.mDef > 0 && def.mdef == null) parts.push(`🔮 ${def.mDef} M.Def`);
  if (def.critRate != null && def.critRate > 0) parts.push(`🎯 +${def.critRate} Crit`);
  if (def.crit != null && def.crit > 0 && def.critRate == null) parts.push(`🎯 +${def.crit} Crit`);
  if (def.hp != null && def.hp > 0) parts.push(`❤️ +${def.hp} HP`);
  if (def.mp != null && def.mp > 0) parts.push(`💙 +${def.mp} MP`);
  if (def.castSpeed != null && def.castSpeed > 0) parts.push(`⚡ +${def.castSpeed}% Cast`);
  if (def.atkSpeed != null && def.atkSpeed > 0) parts.push(`💨 +${def.atkSpeed}% AtkSpd`);
  if (def.effect) parts.push(`✨ ${def.effect}`);
  if (def.healAmount) parts.push(`🧪 Recupera ${def.healAmount} HP`);
  if (def.bonus) parts.push(`✨ ${def.bonus}`);

  return parts.join(' · ');
}

/**
 * Compara atributos de um item da loja com o item atualmente equipado no mesmo slot.
 * Exibe P.Atk, M.Atk, P.Def, M.Def, HP, MP, Crit, Speed, Element
 * com indicadores: ↑ improvement, ↓ downgrade, = neutral (cor e símbolo simultâneos).
 */
function buildShopComparisonDelta(def, state) {
  if (!def || !def.slot || !state || !state.equipment) return '';
  const isEquip = ['weapon', 'armor', 'chest', 'legs', 'helmet', 'gloves', 'boots', 'shield', 'ring', 'ring1', 'ring2', 'necklace', 'earring', 'earring1', 'earring2'].includes(def.slot);
  if (!isEquip) return '';

  let equipSlotKey = def.slot;
  if (def.slot === 'weapon' || def.slot === 'bow' || def.slot === 'dagger' || def.slot === 'staff' || def.slot === 'blunt' || def.slot === 'dual') equipSlotKey = 'weapon';
  else if (def.slot === 'armor' || def.slot === 'chest') equipSlotKey = 'chest';
  else if (def.slot === 'head' || def.slot === 'helmet') equipSlotKey = 'helmet';
  else if (def.slot === 'ring') equipSlotKey = 'ring1';
  else if (def.slot === 'earring') equipSlotKey = 'earring1';

  const equippedUid = state.equipment[equipSlotKey];
  if (!equippedUid) {
    return `<div class="imp-comparison-box"><span style="color:#10b981; font-weight:bold;">✨ [Slot Vazio no Herói]</span></div>`;
  }

  const equippedItem = (state.inventory || []).find(i => i.uid === equippedUid || i.id === equippedUid);
  if (!equippedItem) return '';

  const gData = D();
  const eqDef = gData?.ALL_ITEMS?.[equippedItem.itemId || equippedItem.id] || equippedItem;
  if (!eqDef) return '';

  const diffs = [];
  const formatDelta = (statLabel, icon, newStat, oldStat) => {
    const n = Number(newStat) || 0;
    const o = Number(oldStat) || 0;
    if (n === 0 && o === 0) return;
    const delta = n - o;
    if (delta > 0) {
      diffs.push(`<span class="stat-delta stat-delta--up" title="${statLabel}">${icon} ${statLabel} +${delta} ↑</span>`);
    } else if (delta < 0) {
      diffs.push(`<span class="stat-delta stat-delta--down" title="${statLabel}">${icon} ${statLabel} ${delta} ↓</span>`);
    } else {
      diffs.push(`<span class="stat-delta stat-delta--same" title="${statLabel}">${icon} ${statLabel} =</span>`);
    }
  };

  formatDelta('P.Atk', '⚔', def.atk, eqDef.atk);
  formatDelta('M.Atk', '✦', def.matk, eqDef.matk);
  formatDelta('P.Def', '🛡', def.def, eqDef.def);
  formatDelta('M.Def', '🔷', def.mdef, eqDef.mdef);
  formatDelta('HP', '❤', def.hp, eqDef.hp);
  formatDelta('MP', '💧', def.mp, eqDef.mp);
  formatDelta('Crit', '💥', def.crit, eqDef.crit);
  formatDelta('Speed', '⚡', def.speed, eqDef.speed);

  // Elemental comparison
  const newElem = def.element || def.elemType || null;
  const oldElem = eqDef.element || eqDef.elemType || null;
  if (newElem || oldElem) {
    if (newElem && !oldElem) {
      diffs.push(`<span class="stat-delta stat-delta--up" title="Elemento">🔮 ${newElem} ↑</span>`);
    } else if (!newElem && oldElem) {
      diffs.push(`<span class="stat-delta stat-delta--down" title="Elemento">🔮 Sem Elem ↓</span>`);
    } else if (newElem !== oldElem) {
      diffs.push(`<span class="stat-delta stat-delta--same" title="Elemento">🔮 ${oldElem} ➔ ${newElem}</span>`);
    }
  }

  if (diffs.length === 0) return '';
  return `
    <div class="imp-comparison-box">
      <span style="color:var(--imp-text-muted); font-size:10px; font-weight:bold; margin-right:4px;">VS EQUIPADO:</span>
      ${diffs.join(' ')}
    </div>
  `;
}

function isItemInCraftCategory(itemId, def, cat) {
  if (!cat || cat === 'all') return true;

  const slot = (def.slot || '').toLowerCase();
  const type = (def.type || '').toLowerCase();
  const id = itemId.toLowerCase();
  const name = (def.name || '').toLowerCase();

  if (cat === 'weapon') {
    return type === 'weapon' ||
      ['weapon', 'sword', 'two_hand_sword', 'bow', 'dagger', 'dualfist', 'staff', 'blunt', 'spear', 'rapier', 'pistol', 'ancientsword', 'dual_sword', 'magic_blunt'].includes(slot) ||
      id.startsWith('weapon_') || id.includes('sword') || id.includes('bow') || id.includes('dagger') || id.includes('staff') || id.includes('spear') || id.includes('axe') || id.includes('blunt') || id.includes('rapier') || id.includes('pistol');
  }

  if (cat === 'armor') {
    return type === 'armor' ||
      ['armor', 'heavy', 'light', 'robe', 'helmet', 'boots', 'gloves', 'legs', 'shield', 'sigil'].includes(slot) ||
      id.startsWith('armor_') || id.startsWith('helmet_') || id.startsWith('boots_') || id.startsWith('gloves_') || id.startsWith('legs_') || id.startsWith('shield_') || id.startsWith('sigil_') ||
      name.includes('armor') || name.includes('helmet') || name.includes('boots') || name.includes('gloves') || name.includes('gaiters') || name.includes('shield');
  }

  if (cat === 'jewel') {
    return ['ring', 'earring', 'necklace'].includes(slot) ||
      id.startsWith('ring_') || id.startsWith('earring_') || id.startsWith('necklace_') ||
      name.includes('ring') || name.includes('earring') || name.includes('necklace');
  }

  if (cat === 'relic') {
    return ['agathion', 'cloak', 'belt', 'talisman', 'hair', 'pendant'].includes(slot) ||
      id.includes('doll') || id.includes('talisman') || id.includes('pendant') || id.includes('cloak') || id.includes('belt') || id.includes('agathion');
  }

  if (cat === 'consumable') {
    return ['potion', 'consumable', 'scroll', 'material', 'powerup', 'food'].includes(slot) ||
      id.includes('potion') || id.includes('scroll') || id.includes('soulshot') || id.includes('spiritshot') || id.includes('shot');
  }

  return true;
}

function matchesSlotFilter(def, filterKey) {
  if (!def || !filterKey || filterKey === 'all') return true;
  const slot = (def.slot || '').toLowerCase();
  const id = (def.id || '').toLowerCase();
  const name = (def.name || '').toLowerCase();
  const desc = (def.desc || '').toLowerCase();
  const text = `${id} ${name} ${desc}`;

  if (filterKey === 'weapon') {
    return slot === 'weapon' && (def.atk > 0 && (!def.matk || def.matk <= 0));
  }
  if (filterKey === 'mweapon') {
    return slot === 'weapon' && (def.matk > 0);
  }
  if (filterKey === 'heavy') {
    if (['armor', 'helmet', 'gloves', 'boots', 'legs', 'shield'].includes(slot)) {
      return text.includes('heavy') || text.includes('plate') || text.includes('breastplate') || text.includes('shield') || text.includes('bronze') || text.includes('bone') || text.includes('iron') || text.includes('imperial') || text.includes('flame') || text.includes('icy');
    }
    return false;
  }
  if (filterKey === 'light') {
    if (['armor', 'helmet', 'gloves', 'boots', 'legs'].includes(slot)) {
      return text.includes('light') || text.includes('leather') || text.includes('manticore') || text.includes('theca') || text.includes('plated') || text.includes('draconic') || text.includes('doom') || text.includes('evasion') || text.includes('lightning');
    }
    return false;
  }
  if (filterKey === 'robe') {
    if (['armor', 'helmet', 'gloves', 'boots', 'legs'].includes(slot)) {
      return text.includes('robe') || text.includes('tunic') || text.includes('devotion') || text.includes('mithril') || text.includes('karmian') || text.includes('arcana') || text.includes('mana') || text.includes('seers');
    }
    return false;
  }
  if (filterKey === 'helmet') return slot === 'helmet';
  if (filterKey === 'gloves') return slot === 'gloves';
  if (filterKey === 'boots') return slot === 'boots';
  if (filterKey === 'legs') return slot === 'legs';
  if (filterKey === 'shield') return slot === 'shield' || slot === 'sigil';
  if (filterKey === 'jewel') return ['ring', 'necklace', 'earring', 'belt', 'cloak', 'hair', 'agathion'].includes(slot);

  return true;
}

export function getMaxAllowedReqLevel(pLvl) {
  const lvl = Number(pLvl) || 1;
  if (lvl < 20) return 39;  // Lv 1-19: No-Grade e D-Grade (1 a 39)
  if (lvl < 40) return 51;  // Lv 20-39: No-Grade, D-Grade e C-Grade (1 a 51)
  if (lvl < 52) return 61;  // Lv 40-51: Até B-Grade (1 a 61)
  if (lvl < 62) return 75;  // Lv 52-61: Até A-Grade (1 a 75)
  if (lvl < 76) return 84;  // Lv 62-75: Até S-Grade (1 a 84)
  return 999;               // Lv 76+: Frost Lord e todos os itens
}

export function getMaxVisibleGradeTier(pLvl) {
  const lvl = Number(pLvl) || 1;
  if (lvl < 20) return 2; // Lv 1-19: No Grade + Grade D (Tier 1 & 2)
  if (lvl < 40) return 3; // Lv 20-39: Até Grade C (Tier 3)
  if (lvl < 52) return 4; // Lv 40-51: Até Grade B (Tier 4)
  if (lvl < 62) return 5; // Lv 52-61: Até Grade A (Tier 5)
  if (lvl < 76) return 6; // Lv 62-75: Até Grade S (Tier 6)
  return 7;               // Lv 76+: Todas as grades (até Tier 7 - Frost Lord/Apex)
}

export function getItemTierNum(def) {
  if (!def) return 1;
  if (def.tier != null) return Number(def.tier) || 1;
  const reqLvl = def.req?.level || def.level || 1;
  if (reqLvl < 20) return 1;
  if (reqLvl < 40) return 2;
  if (reqLvl < 52) return 3;
  if (reqLvl < 62) return 4;
  if (reqLvl < 76) return 5;
  if (reqLvl < 85) return 6;
  return 7;
}

export const SUBCATEGORIES_BY_CAT = {
  all: [
    { id: 'all', label: '🌟 Todas' },
    { id: 'staff', label: '🪄 Cajados (Staff)' },
    { id: 'sword', label: '⚔️ Espadas 1-Mão' },
    { id: 'bow', label: '🏹 Arcos (Bow)' },
    { id: 'dagger', label: '🗡️ Adagas (Dagger)' },
    { id: 'dual', label: '⚔️⚔️ Duplas (Dual)' },
    { id: 'heavy', label: '🛡️ Pesada (Heavy)' },
    { id: 'light', label: '🦺 Leve (Light)' },
    { id: 'robe', label: '🧙 Túnica (Robe)' },
    { id: 'necklace', label: '📿 Colares' },
    { id: 'ring', label: '💍 Anéis' },
    { id: 'earring', label: '👂 Brincos' },
    { id: 'potion', label: '🧪 Poções' },
    { id: 'shot', label: '⚡ Soulshots' },
    { id: 'material', label: '🧱 Materiais' }
  ],
  weapon: [
    { id: 'all', label: '⚔️ Todas' },
    { id: 'staff', label: '🪄 Cajados (Staff)' },
    { id: 'bow', label: '🏹 Arcos (Bow)' },
    { id: 'dagger', label: '🗡️ Adagas (Dagger)' },
    { id: 'sword', label: '⚔️ Espadas 1-Mão' },
    { id: 'dual', label: '⚔️⚔️ Duplas (Dual)' },
    { id: 'spear', label: '🔱 Lanças (Spear)' },
    { id: 'twohand', label: '🔨 2-Mãos (Two-Hand)' },
    { id: 'blunt', label: '🪓 Maças (Blunt)' },
    { id: 'fist', label: '🥊 Manoplas (Fist)' }
  ],
  armor: [
    { id: 'all', label: '🛡️ Todas' },
    { id: 'heavy', label: '🛡️ Pesada (Heavy)' },
    { id: 'light', label: '🦺 Leve (Light)' },
    { id: 'robe', label: '🧙 Túnica (Robe)' },
    { id: 'shield', label: '🛡️ Escudos' },
    { id: 'helmet', label: '🪖 Elmos' },
    { id: 'gloves', label: '🧤 Luvas' },
    { id: 'boots', label: '👢 Botas' }
  ],
  jewel: [
    { id: 'all', label: '💎 Todas' },
    { id: 'necklace', label: '📿 Colares' },
    { id: 'earring', label: '👂 Brincos' },
    { id: 'ring', label: '💍 Anéis' }
  ],
  relic: [
    { id: 'all', label: '🌟 Todas' },
    { id: 'agathion', label: '🧚 Agathions' },
    { id: 'cloak', label: '🧥 Capas' },
    { id: 'belt', label: '🎗️ Cintos' },
    { id: 'talisman', label: '🧿 Talismãs' }
  ],
  consumable: [
    { id: 'all', label: '🧪 Todos' },
    { id: 'potion', label: '🧪 Poções' },
    { id: 'shot', label: '⚡ Soulshots' },
    { id: 'scroll', label: '📜 Pergaminhos' },
    { id: 'material', label: '🧱 Materiais' }
  ]
};

export function matchesCraftSubcategory(itemId, def, subcat) {
  if (!subcat || subcat === 'all') return true;
  const s = `${itemId} ${def.name || ''} ${def.slot || ''} ${def.type || ''} ${def.weaponType || ''} ${def.armorType || ''} ${def.desc || ''}`.toLowerCase();

  switch (subcat) {
    case 'staff':
      return /staff|wand|scepter|magicblunt|magic_sword|crucifix/.test(s) || (def.slot === 'weapon' && def.matk > 0 && def.atk < def.matk);
    case 'bow':
      return /bow|crossbow/.test(s);
    case 'dagger':
      return /dagger|knife/.test(s);
    case 'sword':
      return (/sword|blade|katana|falchion|saber|rapier/.test(s)) && !/dual|twohand|great_sword|magic_sword/.test(s);
    case 'dual':
      return /dual/.test(s);
    case 'spear':
      return /spear|lance|pike|halberd/.test(s);
    case 'twohand':
      return /twohand|great_sword|great_axe|big_hammer|ancientsword/.test(s);
    case 'blunt':
      return (/hammer|blunt|mace|axe/.test(s)) && !/magicblunt|staff/.test(s);
    case 'fist':
      return /fist|knuckle|claw/.test(s);

    case 'heavy':
      return /heavy|breastplate|gaiters_heavy|plate/.test(s) || (s.includes('heavy') && !s.includes('light'));
    case 'light':
      return /light|leather/.test(s) || (s.includes('light') && !s.includes('heavy'));
    case 'robe':
      return /robe|tunic|devotion|magic/.test(s);
    case 'shield':
      return /shield|sigil/.test(s);
    case 'helmet':
      return /helmet|circlet|cap|crown/.test(s) || def.slot === 'helmet';
    case 'gloves':
      return /glove|gauntlet/.test(s) || def.slot === 'gloves';
    case 'boots':
      return /boot|shoes/.test(s) || def.slot === 'boots';

    case 'necklace':
      return /necklace/.test(s) || def.slot === 'necklace';
    case 'earring':
      return /earring/.test(s) || def.slot === 'earring';
    case 'ring':
      return /ring/.test(s) || def.slot === 'ring';

    case 'agathion':
      return /agathion|doll/.test(s) || def.slot === 'agathion';
    case 'cloak':
      return /cloak|cloack/.test(s) || def.slot === 'cloak';
    case 'belt':
      return /belt/.test(s) || def.slot === 'belt';
    case 'talisman':
      return /talisman|pendant|bracelet/.test(s) || def.slot === 'talisman';

    case 'potion':
      return /potion|draught|elixir|buff/.test(s) || def.slot === 'potion';
    case 'shot':
      return /soulshot|spiritshot|shot/.test(s);
    case 'scroll':
      return /scroll|enchant|resurrection|teleport|spellbook/.test(s) || def.slot === 'scroll';
    case 'material':
      return /ore|bone|stone|powder|suede|leather|crystal|varnish|stem|thread|adamantite|steel|ingot/.test(s) || def.slot === 'material';

    default:
      return true;
  }
}

/**
 * Renderiza o Estágio 1 da Forja Imperial: Diálogo NPC com Blacksmith Wilbert (Imagem 5).
 */
export function renderForgeDialogueView(state, callbacks = {}) {
  const root = getRoot();
  if (!root) return;
  const dialogueView = root.querySelector('#forge-dialogue-view');
  const workspaceView = root.querySelector('#forge-workspace-view');
  if (dialogueView) dialogueView.style.display = 'flex';
  if (workspaceView) workspaceView.style.display = 'none';

  const npcNameEl = root.querySelector('#forge-npc-name');
  const npcTextEl = root.querySelector('#forge-npc-text');
  const optionsEl = root.querySelector('#forge-dialogue-options');
  const closeBtn = root.querySelector('#forge-dialogue-close-btn');

  if (closeBtn && !closeBtn._bound) {
    closeBtn._bound = true;
    closeBtn.onclick = () => {
      // Abre a criação geral como padrão se fechar
      _forgeViewMode = 'workspace';
      updateCraftUI(state, callbacks);
    };
  }

  if (!optionsEl) return;

  if (_forgeWilbertTopic === 'main') {
    if (npcNameEl) npcNameEl.textContent = 'Blacksmith Wilbert:';
    if (npcTextEl) {
      npcTextEl.innerHTML = `
        Haha! Blacksmiths do so much more than just craft armor, spears, axes and the like. The town of Aden wouldn't even exist without our Black Anvil Guild.<br><br>
        Oh, by the way, it's only rumors, but... I've heard that golems which were used to banish humans from our lands were constructed by our guild too. Who else could have invented such outstanding technology?
      `;
    }

    optionsEl.innerHTML = `
      <button class="l2chat-option-btn" data-forge-target="soulcrystal">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Imbue a weapon/armor with Soul Crystal Effect or change SA</div>
          <div class="l2chat-option-hint">Despertar Focus, Acumen, Health ou Might na arma</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="soulcrystal" style="border-color:rgba(239,68,68,0.35);">
        <span class="l2chat-bubble-icon" style="color:#f87171;">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#fca5a5;">Revoke the Soul Crystal Effect from a weapon/armor</div>
          <div class="l2chat-option-hint">Remover e purificar o efeito de Soul Crystal da arma</div>
        </div>
        <span style="color:#fca5a5; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="lifestones">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Augment (Life Stones)</div>
          <div class="l2chat-option-hint">Altar de Augmentation com Life Stones e Gemstones</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="masterwork">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Upgrade items of R-grade or higher (Masterwork &amp; Troca)</div>
          <div class="l2chat-option-hint">Restauração Pushkin, Masterwork e troca de armas de mesmo grau</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="elemental">
        <span class="l2chat-bubble-icon" style="color:#fdba74;">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#fed7aa;">Atributos Elementais (Fire, Water, Wind, Earth, Holy, Dark)</div>
          <div class="l2chat-option-hint">Engastes de pedras elementais em armas e armaduras</div>
        </div>
        <span style="color:#fdba74; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="synthesis">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Síntese Imperial (Compounding)</div>
          <div class="l2chat-option-hint">Altar arcano de fusão para elevar o Rank de equipamentos e artefatos</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="craft">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Craft items (Criação Geral de Receitas)</div>
          <div class="l2chat-option-hint">Forjar armas, armaduras, joias e consumíveis ancestrais</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="refinery" style="border-color:rgba(52,211,153,0.35);">
        <span class="l2chat-bubble-icon" style="color:#6ee7b7;">⚗️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#a7f3d0;">Bancada de Refino (Life Activities Refinery)</div>
          <div class="l2chat-option-hint">Processar madeira, couros, minérios e ervas em materiais nobres de forja</div>
        </div>
        <span style="color:#6ee7b7; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-target="tattoos">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text">Tatuagens &amp; Dyes (Henna)</div>
          <div class="l2chat-option-hint">Gravar símbolos arcanos com Dyes para alterar atributos base</div>
        </div>
        <span style="color:#ffd877; font-size:12px;">➔</span>
      </button>

      <button class="l2chat-option-btn" data-forge-action="taxes" style="border-color:rgba(212,167,68,0.25);">
        <span class="l2chat-bubble-icon">🗨️</span>
        <div style="flex:1;">
          <div class="l2chat-option-text" style="color:#cbd5e1;">Ask about local governor and taxes</div>
          <div class="l2chat-option-hint">Saber sobre o Lorde do Castelo e as taxas da guilda</div>
        </div>
        <span style="color:#94a3b8; font-size:12px;">➔</span>
      </button>
    `;
  } else if (_forgeWilbertTopic === 'taxes') {
    if (npcNameEl) npcNameEl.textContent = 'Blacksmith Wilbert:';
    if (npcTextEl) {
      npcTextEl.innerHTML = `
        Taxes? Hmph! The Lord of Aden Castle and Giran Castle enforce a reasonable tribute of 5% on trade and market transactions.<br><br>
        Thanks to our Black Anvil Guild treaty, the imperial forge operates independently. Every hero who swings an anvil here keeps their crafted spoils free from imperial excise!
      `;
    }

    optionsEl.innerHTML = `
      <button class="l2chat-option-btn l2chat-back-btn" data-forge-action="back">
        <span style="font-size:14px;">↩️</span>
        <div class="l2chat-option-text" style="color:#ffd877;">Voltar às Opções do Ferreiro</div>
      </button>
    `;
  }

  optionsEl.onclick = (e) => {
    const targetBtn = e.target.closest('[data-forge-target]');
    if (targetBtn) {
      const tab = targetBtn.dataset.forgeTarget;
      _forgeViewMode = 'workspace';
      if (typeof window !== 'undefined' && typeof window.setForgeSubTab === 'function') {
        window.setForgeSubTab(tab);
      } else {
        window._forgeSubTab = tab;
        updateCraftUI(state, callbacks);
      }
      return;
    }

    const actionBtn = e.target.closest('[data-forge-action]');
    if (actionBtn) {
      const act = actionBtn.dataset.forgeAction;
      if (act === 'taxes') {
        _forgeWilbertTopic = 'taxes';
        renderForgeDialogueView(state, callbacks);
      } else if (act === 'back') {
        _forgeWilbertTopic = 'main';
        renderForgeDialogueView(state, callbacks);
      }
    }
  };
}

export function updateCraftUI(state, callbacks = {}) {
  updateImperialEconomyHeader(state);
  const root = getRoot();
  if (!root) return;

  const dialogueView = root.querySelector('#forge-dialogue-view');
  const workspaceView = root.querySelector('#forge-workspace-view');

  // Configurar botões de navegação e retorno
  const backToDialogueBtn = root.querySelector('#forge-back-to-dialogue-btn');
  if (backToDialogueBtn && !backToDialogueBtn._bound) {
    backToDialogueBtn._bound = true;
    backToDialogueBtn.onclick = () => {
      _forgeViewMode = 'dialogue';
      _forgeWilbertTopic = 'main';
      updateCraftUI(state, callbacks);
    };
  }

  const workspaceCloseBtn = root.querySelector('#forge-workspace-close-btn');
  if (workspaceCloseBtn && !workspaceCloseBtn._bound) {
    workspaceCloseBtn._bound = true;
    workspaceCloseBtn.onclick = () => {
      _forgeViewMode = 'dialogue';
      _forgeWilbertTopic = 'main';
      updateCraftUI(state, callbacks);
    };
  }

  if (_forgeViewMode === 'dialogue') {
    if (dialogueView) dialogueView.style.display = 'flex';
    if (workspaceView) workspaceView.style.display = 'none';
    renderForgeDialogueView(state, callbacks);
    return;
  }

  if (dialogueView) dialogueView.style.display = 'none';
  if (workspaceView) workspaceView.style.display = 'flex';

  const forgeLvl = state.accountForgeLevel || state.craftLevel || 1;
  const forgeExp = state.accountForgeExp || 0;
  const reqExpForNext = forgeLvl * 100;
  const pct = Math.min(100, Math.floor((forgeExp / reqExpForNext) * 100));

  const craftLvlEl = findElement('craft-level-num') || findElement('craft-level');
  if (craftLvlEl) craftLvlEl.textContent = `${forgeLvl} (${pct}%)`;

  const expBarEl = findElement('craft-forge-exp-bar');
  if (expBarEl) expBarEl.style.width = `${pct}%`;

  const marketBadge = findElement('market-status-badge');
  if (marketBadge) {
    if (forgeLvl >= 10) {
      marketBadge.style.background = 'rgba(16,185,129,0.15)';
      marketBadge.style.borderColor = '#10b981';
      marketBadge.style.color = '#6ee7b7';
      marketBadge.innerHTML = '🔓 Mercado Global: Liberado';
    } else {
      marketBadge.style.background = 'rgba(239,68,68,0.15)';
      marketBadge.style.borderColor = '#ef4444';
      marketBadge.style.color = '#fca5a5';
      marketBadge.innerHTML = `🔒 Mercado: Requer Forja Lv. 10 (Atual: Lv. ${forgeLvl})`;
    }
  }

  const subTab = window._forgeSubTab || 'craft';

  root.querySelectorAll('#forge-subtab-buttons [data-forge-tab], .forge-subtab-btn').forEach(btn => {
    const isActive = (btn.dataset.forgeTab === subTab);
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(252,211,77,0.1)';
    btn.style.color = isActive ? '#000' : '#ffd877';
    btn.style.borderColor = isActive ? '#ffe699' : 'rgba(212,167,68,0.3)';
    btn.onclick = (e) => {
      e.preventDefault();
      const targetTab = btn.dataset.forgeTab;
      _forgeViewMode = 'workspace';
      if (typeof window !== 'undefined' && typeof window.setForgeSubTab === 'function') {
        window.setForgeSubTab(targetTab);
      } else {
        window._forgeSubTab = targetTab;
        updateCraftUI(state, callbacks);
      }
    };
  });

  const filtersBar = findElement('craft-filters-bar');
  let subfiltersBar = findElement('craft-subcategory-filters');
  if (!subfiltersBar && filtersBar && filtersBar.parentNode) {
    subfiltersBar = document.createElement('div');
    subfiltersBar.id = 'craft-subcategory-filters';
    subfiltersBar.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; padding:6px 10px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.05);';
    filtersBar.parentNode.insertBefore(subfiltersBar, filtersBar.nextSibling);
  }

  if (filtersBar) {
    filtersBar.style.display = (subTab === 'craft') ? 'flex' : 'none';
  }
  if (subfiltersBar && subTab !== 'craft') {
    subfiltersBar.style.display = 'none';
  }

  const container = findElement('craft-recipes-container') || findElement('craft-list');
  if (!container) return;

  if (subTab === 'refinery') {
    renderForgeRefinery(container, state, callbacks);
    return;
  }
  if (subTab === 'soulcrystal') {
    renderForgeSoulCrystals(container, state);
    return;
  }
  if (subTab === 'masterwork') {
    renderForgeMasterwork(container, state);
    return;
  }
  if (subTab === 'tattoos') {
    renderForgeTattoos(container, state);
    return;
  }
  if (subTab === 'elemental') {
    renderForgeElemental(container, state);
    return;
  }
  if (subTab === 'synthesis' || subTab === 'belts') {
    renderForgeSynthesis(container, state);
    return;
  }
  if (subTab === 'lifestones') {
    renderForgeLifestones(container, state);
    return;
  }
  if (subTab === 'randomcraft') {
    renderForgeRandomCraft(container, state, callbacks);
    return;
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  let recipes = gData?.CRAFTING_RECIPES || {};

  // Mapa de inventário pré-agregado O(1) para evitar milhares de buscas no array de inventário
  const invMap = new Map();
  for (const item of (state.inventory || [])) {
    if (item && item.itemId && !item.equipped) {
      invMap.set(item.itemId, (invMap.get(item.itemId) || 0) + (item.count || 1));
      if (item.id && item.id !== item.itemId) {
        invMap.set(item.id, (invMap.get(item.id) || 0) + (item.count || 1));
      }
    }
  }

  const seenNames = new Set();
  const rawList = Object.values(recipes).filter(Boolean);
  const recipeList = [];

  for (const r of rawList) {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    if (!def || !def.name) continue;

    // Itens de herança são EXCLUSIVOS dos Starter Packs do Cash Shop
    const isHeirloom = def.isHeirloom || itemId.includes('heirloom') || (def.name && (def.name.toLowerCase().includes('herança') || def.name.toLowerCase().includes('heirloom')));
    if (isHeirloom) continue;

    const normName = def.name.toLowerCase().trim();
    if (seenNames.has(normName)) continue;
    seenNames.add(normName);
    recipeList.push(r);
  }

  const playerLvl = state.level || state.player?.level || 1;
  const maxGradeTier = getMaxVisibleGradeTier(playerLvl);

  const activeCat = window._craftSelectedCategory || 'all';
  const activeSubcat = window._craftSelectedSubcategory || 'all';

  // Renderiza botões de subcategoria dinamicamente
  if (subfiltersBar && subTab === 'craft') {
    const subcats = SUBCATEGORIES_BY_CAT[activeCat];
    if (subcats && subcats.length > 0) {
      subfiltersBar.style.display = 'flex';
      subfiltersBar.innerHTML = subcats.map(sub => {
        const isSubActive = (sub.id === activeSubcat);
        return `
          <button class="inv-batch-btn ${isSubActive ? 'active' : ''}" data-craft-subcat="${sub.id}" style="padding:4px 10px; font-size:11px; border-radius:4px; cursor:pointer; transition:all 0.15s; ${isSubActive ? 'background:linear-gradient(180deg,#d4a744,#8a641c); color:#000; font-weight:bold; border:1px solid #ffe699; box-shadow:0 0 8px rgba(212,167,68,0.4);' : 'background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.1);'}">
            ${sub.label}
          </button>
        `;
      }).join('');

      subfiltersBar.querySelectorAll('[data-craft-subcat]').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const targetSub = btn.dataset.craftSubcat;
          window._craftSelectedSubcategory = targetSub;
          updateCraftUI(state, callbacks);
        };
      });
    } else {
      subfiltersBar.style.display = 'none';
    }
  }

  // Conecta leitores para barra de busca e categorias (uma única vez com debounce)
  const searchInput = findElement('craft-search-input');
  if (searchInput && !searchInput._bound) {
    searchInput._bound = true;
    searchInput.oninput = (e) => {
      window._craftSearchTerm = e.target.value;
      updateCraftUI(state, callbacks);
    };
  }

  const catButtons = root.querySelectorAll('#craft-category-filters [data-craft-cat]');
  catButtons.forEach(btn => {
    const isThisActive = btn.dataset.craftCat === activeCat;
    btn.classList.toggle('active', isThisActive);
    btn.onclick = (e) => {
      e.preventDefault();
      const selected = btn.dataset.craftCat;
      window._craftSelectedCategory = selected;
      window._craftSelectedSubcategory = 'all'; // Reseta subfiltro ao mudar de categoria
      catButtons.forEach(b => b.classList.toggle('active', b.dataset.craftCat === selected));
      updateCraftUI(state, callbacks);
    };
  });

  const searchTerm = (window._craftSearchTerm || '').toLowerCase().trim();

  const filtered = recipeList.filter(r => {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    if (!def) return false;

    // 1. Regra de Grau (Nível do Jogador + 1 Grau à frente)
    const itemTier = getItemTierNum(def);
    if (itemTier > maxGradeTier) {
      return false;
    }

    // 2. Filtro por Categoria Principal
    if (!isItemInCraftCategory(itemId, def, activeCat)) {
      return false;
    }

    // 3. Filtro por Subcategoria (ex: Arma > Staff, Armadura > Robe, etc.)
    if (!matchesCraftSubcategory(itemId, def, activeSubcat)) {
      return false;
    }

    // 4. Filtro por Busca de Nome
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted); width:100%;">
        <p style="font-size: 16px; margin-bottom: 8px;">🔍 Nenhuma receita encontrada para os filtros selecionados.</p>
        <p style="font-size: 13px;">Tente alterar a categoria ou o termo de busca digitado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(r => {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    const itemReqLevel = def.req?.level || def.level || r.level || 1;
    const reqForgeLvl = r.craftLevel || (r.level ? getCraftLevelReq(r.level) : 1);
    const gradeInfo = getItemGrade(def);
    const statsSummary = buildShopStatsSummary(def);
    const baseAdena = r.gold || 250;

    const mats = getRecipeMaterials(r);
    let hasAllMats = (state.gold || 0) >= baseAdena;

    const matsHtml = mats.map(m => {
      const matDef = allItems[m.matId];
      const count = invMap.get(m.matId) || 0;
      const isOk = count >= m.qty;
      if (!isOk) hasAllMats = false;
      const matName = matDef ? matDef.name : m.matId;

      return `
        <div class="l2-mat-slot ${isOk ? 'is-satisfied' : 'is-lacking'}" data-open-locator="${m.matId}" title="${matName}: ${count}/${m.qty} (Clique p/ ver onde cai)">
          <div class="l2-mat-icon-wrap">${getItemIcon(matDef || m.matId)}</div>
          <div class="l2-mat-badge ${isOk ? 'badge-ok' : 'badge-lacking'}">${count}/${m.qty}</div>
          <div class="l2-mat-name-tooltip">${matName}</div>
        </div>
      `;
    }).join('');

    const isLvlOk = playerLvl >= itemReqLevel;
    const isForgeLvlOk = forgeLvl >= reqForgeLvl;
    const craftable = hasAllMats && isForgeLvlOk;

    let buttonText = '🔨 Forjar Item';
    if (!isForgeLvlOk) buttonText = `🔒 Requer Forja Lv.${reqForgeLvl}`;
    else if (!isLvlOk) buttonText = `⚠️ Requer Lv.${itemReqLevel} p/ Usar`;

    return `
      <div class="l2-blueprint-card ${craftable ? 'craftable' : ''}" data-open-craft="${itemId}">
        <div class="l2-blueprint-header">
          <div class="l2-blueprint-socket" style="border-color:${gradeInfo.color};">
            ${getItemIcon(def)}
          </div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <div class="l2-blueprint-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${def.name}</div>
              <span class="shop-grade-badge" style="background:${gradeInfo.color}; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold; color:#fff; flex-shrink:0;">${gradeInfo.label}</span>
            </div>
            <div class="l2-blueprint-meta">
              <span>⚒️ Forja Lv.${reqForgeLvl}</span>
              <span>·</span>
              <span style="color:#ffd877; font-weight:bold;">🪙 ${baseAdena.toLocaleString()} Adena</span>
            </div>
          </div>
        </div>
        ${statsSummary ? `
          <div class="l2-blueprint-stats">
            <span style="font-size:10px; color:#94a3b8; margin-right:4px;">📊 Atributos:</span>
            <span class="l2-stat-pill">${statsSummary}</span>
          </div>
        ` : ''}
        <div style="margin-bottom:4px; font-size:10px; color:#94a3b8; font-family:'Cinzel',serif; text-transform:uppercase; letter-spacing:0.05em;">📦 Materiais da Receita:</div>
        <div class="l2-mat-matrix">${matsHtml}</div>
        <button class="l2-forge-action-btn ${craftable ? 'is-ready' : 'is-disabled'}" data-open-craft="${itemId}">
          ${buttonText}
        </button>
      </div>
    `;
  }).join('');

  // Event Delegation centralizado no container para desempenho ultra rápido sem gargalo de memória
  container.onclick = (e) => {
    const locBtn = e.target.closest('[data-open-locator]');
    if (locBtn) {
      e.stopPropagation();
      showDropLocatorModal(locBtn.dataset.openLocator);
      return;
    }
    const craftCard = e.target.closest('[data-open-craft]');
    if (craftCard) {
      openCraftModal(craftCard.dataset.openCraft, state, callbacks);
      return;
    }
  };
}

/**
 * Abre o Modal de Forja de um item específico.
 */
export function openCraftModal(itemId, state, callbacks = {}) {
  const modal = findElement('craft-modal');
  const body = findElement('craft-modal-body');
  if (!modal || !body) return;

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  const def = allItems[itemId];
  if (!def) return;

  const r = getRecipeDef(itemId) || { id: itemId, gold: 250, reqs: [{ id: 'iron_ore', count: 10 }] };
  let currentQty = 1;
  const gradeInfo = getItemGrade(def);
  const reqForgeLvl = r.craftLevel || (r.level ? getCraftLevelReq(r.level) : 1);
  const statsSummary = buildShopStatsSummary(def);

  function renderModalContent() {
    const totalAdena = (r.gold || 250) * currentQty;
    const mats = getRecipeMaterials(r);
    const maxCraftable = Math.max(1, calculateMaxCraftableQty(state, itemId));

    const matsHtml = mats.map(m => {
      const matDef = allItems[m.matId];
      const count = getInventoryCount(state, m.matId);
      const needed = m.qty * currentQty;
      const isOk = count >= needed;

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:6px; margin-bottom:6px; font-size:13px; border:1px solid ${isOk ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'};">
          <span style="color:#ddd; display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">${getItemIcon(matDef)}</span> <strong>${matDef ? matDef.name : m.matId}</strong>
          </span>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:${isOk ? '#4ade80' : '#ef4444'}; font-weight:bold;">
              ${isOk ? '✓' : '✗'} ${count} / ${needed}
            </span>
            ${!isOk ? `<button onclick="window.showDropLocator('${m.matId}')" style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5; border-radius:4px; font-size:10px; padding:2px 6px; cursor:pointer;" title="Onde Obter">🔍 Onde Cai</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const forgeLvl = state.accountForgeLevel || state.craftLevel || 1;
    const isForgeLvlOk = forgeLvl >= reqForgeLvl;
    const craftable = isForgeLvlOk && canCraft(state, itemId, currentQty);

    body.innerHTML = `
      <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid rgba(212,175,55,0.3);">
        <div style="width:54px; height:54px; min-width:54px; background:rgba(0,0,0,0.6); border:2px solid ${gradeInfo.color}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 0 12px ${gradeInfo.color}40;">
          ${getItemIcon(def)}
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0; font-family:'Cinzel',serif; color:#f3c669; font-size:18px;">${def.name}</h3>
            <span style="background:${gradeInfo.color}; color:#fff; font-size:11px; font-weight:bold; padding:2px 8px; border-radius:4px;">${gradeInfo.label}</span>
          </div>
          <div style="font-size:12px; color:#aaa; margin-top:2px;">Requer Forja Lv.${reqForgeLvl} · Slot: ${def.slot || 'Geral'}</div>
        </div>
      </div>

      ${statsSummary ? `
        <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:6px; padding:10px 12px; margin-bottom:12px; font-size:12px;">
          <div style="font-weight:bold; color:var(--gilt); margin-bottom:4px;">📊 Atributos e Bônus Base:</div>
          <div>${statsSummary}</div>
          ${def.desc ? `<div style="font-size:11px; color:#888; margin-top:6px; font-style:italic;">"${def.desc}"</div>` : ''}
        </div>
      ` : ''}

      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:bold; color:var(--text-muted); margin-bottom:6px;">📋 Materiais Necessários:</div>
        ${matsHtml}
      </div>

      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,175,55,0.2); border-radius:8px; padding:12px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; color:var(--text-muted);">Qtd. a Forjar:</span>
          <span style="font-size:14px; font-weight:bold; color:#fff;">🪙 Custo: <strong style="color:var(--gilt);">${totalAdena.toLocaleString()} Adena</strong></span>
        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap;" id="craft-modal-qty-picker">
          <button class="inv-batch-btn ${currentQty === 1 ? 'active' : ''}" data-modal-qty="1">1x</button>
          <button class="inv-batch-btn ${currentQty === 5 ? 'active' : ''}" data-modal-qty="5">5x</button>
          <button class="inv-batch-btn ${currentQty === 10 ? 'active' : ''}" data-modal-qty="10">10x</button>
          <button class="inv-batch-btn ${currentQty === 50 ? 'active' : ''}" data-modal-qty="50">50x</button>
          <button class="inv-batch-btn ${currentQty === 100 ? 'active' : ''}" data-modal-qty="100">100x</button>
          <button class="inv-batch-btn ${currentQty === maxCraftable ? 'active' : ''}" data-modal-qty="${maxCraftable}">MÁX (${maxCraftable}x)</button>
        </div>
      </div>

      <div style="display:flex; gap:8px;">
        <button id="craft-modal-submit" ${!craftable ? 'disabled' : ''} style="flex:1; padding:12px; font-family:'Cinzel',serif; font-weight:bold; font-size:14px; background:${craftable ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${craftable ? '#ffe699' : 'rgba(100,80,60,0.3)'}; color:${craftable ? '#000' : '#777'}; border-radius:6px; cursor:${craftable ? 'pointer' : 'not-allowed'}; box-shadow:${craftable ? '0 4px 12px rgba(212,175,55,0.3)' : 'none'};">
          🔨 FORJAR ITEM ${currentQty > 1 ? `(${currentQty}x)` : ''}
        </button>
      </div>
    `;

    // Conectar eventos do modal
    const picker = body.querySelector('#craft-modal-qty-picker');
    if (picker) {
      picker.querySelectorAll('[data-modal-qty]').forEach(btn => {
        btn.onclick = () => {
          currentQty = parseInt(btn.dataset.modalQty, 10) || 1;
          renderModalContent();
        };
      });
    }

    const submitBtn = body.querySelector('#craft-modal-submit');
    if (submitBtn) {
      submitBtn.onclick = () => {
        let ok = false;
        if (callbacks.craftItem) ok = callbacks.craftItem(itemId, currentQty);
        else if (typeof window !== 'undefined' && typeof window.craftItem === 'function') ok = window.craftItem(itemId, currentQty);
        closeCraftModal();
        updateCraftUI(state, callbacks);
        if (callbacks.updateAllUI) callbacks.updateAllUI();
        else if (typeof window !== 'undefined' && typeof window.updateAllUI === 'function') window.updateAllUI();
      };
    }
  }

  renderModalContent();
  modal.style.display = 'flex';

  const closeBtn = findElement('craft-modal-close');
  if (closeBtn) closeBtn.onclick = closeCraftModal;
  modal.onclick = (e) => {
    if (e.target === modal) closeCraftModal();
  };
}

export function closeCraftModal() {
  const modal = findElement('craft-modal');
  if (modal) modal.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════════════════
   18. ALCHEMY & SOUL CRUCIBLE UI RENDERER
═══════════════════════════════════════════════════════════════════════════ */
export function renderAlchemyUI(state) {
  if (!state) return;
  if (typeof window !== 'undefined') {
    window.renderAlchemyUI = renderAlchemyUI;
    window._lastState = state;
  }
  updateImperialEconomyHeader(state);
  const root = getRoot();
  const container = root.querySelector('#tab-alchemy, .tab-alchemy');
  if (!container) return;

  const essences = state.essences || { fire: 0, earth: 0, wind: 0, astral: 0 };
  const activeElixirs = state.activeElixirs || {};
  const now = Date.now();

  const recipes = (typeof window !== 'undefined' && window.ALCHEMY_RECIPES) ? window.ALCHEMY_RECIPES : {};

  let activeBuffsHtml = '';
  for (const [rId, expiry] of Object.entries(activeElixirs)) {
    if (typeof expiry === 'number' && expiry > now) {
      const recipe = recipes[rId];
      const secondsLeft = Math.ceil((expiry - now) / 1000);
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      const timeStr = mins > 60
        ? `${(mins / 60).toFixed(1)}h`
        : `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

      activeBuffsHtml += `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(212,167,68,0.12); border:1px solid var(--imp-border-accent, rgba(212,167,68,0.4)); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:22px; filter:drop-shadow(0 0 6px rgba(212,167,68,0.4));">${recipe?.icon || '🧪'}</span>
            <div>
              <div style="font-family:'Cinzel',serif; font-weight:700; color:#ffd877; font-size:13px;">${recipe?.name || rId}</div>
              <div style="font-size:11px; color:#cbd5e1;">${recipe?.desc || ''}</div>
            </div>
          </div>
          <span style="font-family:'IBM Plex Mono',monospace; font-weight:bold; color:#34d399; font-size:12px; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:4px; border:1px solid rgba(52,211,153,0.3);">⏱️ ${timeStr}</span>
        </div>
      `;
    }
  }

  // Quantidade de Pedras de Invocação do Caos
  const chaosStoneCount = getInventoryCount(state, 'boss_summon_stone');

  let recipesHtml = '';
  for (const [rId, rec] of Object.entries(recipes)) {
    let canAfford = (state.gold || 0) >= rec.gold;
    let costHtml = '';
    for (const [type, amt] of Object.entries(rec.cost)) {
      const owned = essences[type] || 0;
      const hasEnough = owned >= amt;
      if (!hasEnough) canAfford = false;
      const typeIcons = { fire: '🔥', earth: '🛡️', wind: '🍃', astral: '✨' };
      costHtml += `<span style="color:${hasEnough ? '#4ade80' : '#ef4444'}; font-weight:600; margin-right:8px;">${typeIcons[type] || ''} ${owned}/${amt}</span>`;
    }

    recipesHtml += `
      <div class="imp-shop-card" style="margin-bottom:10px;">
        <div class="imp-shop-card-main" style="align-items:center;">
          <div class="imp-item-frame" style="border-color:rgba(212,167,68,0.4); font-size:24px;">
            ${rec.icon}
          </div>
          <div class="imp-item-meta">
            <div class="imp-item-header">
              <span class="imp-item-name">${rec.name}</span>
              <span class="imp-item-grade-tag" style="background:rgba(168,85,247,0.25); border:1px solid rgba(168,85,247,0.5); color:#c084fc;">ELIXIR</span>
            </div>
            <p style="margin:2px 0 4px 0; font-size:11px; color:#94a3b8;">${rec.desc}</p>
            <div style="font-size:11px; font-family:'IBM Plex Mono',monospace;">
              ${costHtml}
              <span style="color:${(state.gold || 0) >= rec.gold ? '#ffd877' : '#ef4444'}; font-weight:700;">🪙 ${rec.gold.toLocaleString()} Adena</span>
            </div>
          </div>
          <div>
            <button
              class="imp-btn-primary"
              onclick="window.craftElixir('${rId}', 1)"
              ${!canAfford ? 'disabled' : ''}
              style="min-width:100px; white-space:nowrap;"
            >
              🧪 TRANSMUTAR
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Cadinho de Almas — Módulo de Seleção e Preview de Dissolução
  const inventoryItems = (state.inventory || []).filter(i => {
    if (!i || !i.itemId || i.equipped) return false;
    const def = getItemDef(i.itemId);
    if (!def) return false;
    const slot = (def.slot || '').toLowerCase();
    const type = (def.type || '').toLowerCase();
    if (def.stack || def.isQuestItem || type === 'material' || type === 'quest' || type === 'consumable') return false;
    return ['weapon', 'armor', 'shield', 'helmet', 'gloves', 'boots', 'legs', 'ring', 'necklace', 'earring', 'belt', 'cloak', 'sigil'].includes(slot);
  });

  let crucibleSelectHtml = '';
  if (inventoryItems.length === 0) {
    crucibleSelectHtml = `
      <div class="imp-crucible-box" style="text-align:center; color:#94a3b8; font-size:12px; padding:20px;">
        📦 Nenhum equipamento desequipado na mochila para desintegrar no Cadinho.
      </div>
    `;
  } else {
    const selectedUid = window._selectedCrucibleUid || inventoryItems[0].uid;
    const selectedItem = inventoryItems.find(i => i.uid === selectedUid) || inventoryItems[0];
    const selectedDef = getItemDef(selectedItem.itemId);

    const grade = getItemGradeCode(selectedDef);
    const yields = {
      ng: { fire: 1, earth: 1, wind: 1, water: 0, fee: 50 },
      d:  { fire: 3, earth: 3, wind: 3, water: 1, fee: 150 },
      c:  { fire: 8, earth: 8, wind: 8, water: 2, fee: 400 },
      b:  { fire: 20, earth: 20, wind: 20, water: 5, fee: 1000 },
      a:  { fire: 50, earth: 50, wind: 50, water: 15, fee: 2500 },
      s:  { fire: 120, earth: 120, wind: 120, water: 40, fee: 6000 }
    }[grade] || { fire: 1, earth: 1, wind: 1, water: 0, fee: 50 };

    const optionsHtml = inventoryItems.map(item => {
      const def = getItemDef(item.itemId);
      const rName = def?.name || item.itemId;
      const gCode = getItemGradeCode(def).toUpperCase();
      return `<option value="${item.uid}" ${item.uid === selectedItem.uid ? 'selected' : ''}>[${gCode}] ${rName} (x${item.count || 1})</option>`;
    }).join('');

    crucibleSelectHtml = `
      <div class="imp-crucible-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#c084fc; font-size:14px; display:flex; align-items:center; gap:8px;">
            🔮 Cadinho de Almas — Inspeção &amp; Preview
          </h4>
          <span style="font-size:10px; background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.4); padding:2px 8px; border-radius:10px; color:#e9d5ff; font-weight:700; font-family:'IBM Plex Mono',monospace;">${inventoryItems.length} EQUIPAMENTOS DISPONÍVEIS</span>
        </div>

        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <select id="crucible-item-select" style="flex:1; min-width:220px; padding:8px 12px; background:rgba(10,12,20,0.8); border:1px solid rgba(168,85,247,0.5); color:#fff; border-radius:6px; font-size:12px;" onchange="window._selectedCrucibleUid = this.value; if (window.renderAlchemyUI) window.renderAlchemyUI(window._lastState);">
            ${optionsHtml}
          </select>
          <button
            class="imp-btn-primary"
            onclick="if (window.dissolveItem) window.dissolveItem('${selectedItem.uid}');"
            style="background:linear-gradient(180deg, #a855f7, #6b21a8); border-color:#c084fc; color:#fff;"
          >
            🔥 Dissolver Item
          </button>
        </div>

        <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="imp-item-frame grade-${grade}" style="width:42px; height:42px; min-width:42px; font-size:22px;">
              ${getItemIcon(selectedDef)}
            </div>
            <div>
              <div style="font-weight:700; color:#f4d58a; font-size:13px; font-family:'Cinzel',serif;">${selectedDef?.name || 'Item'}</div>
              <div style="font-size:11px; color:#94a3b8;">Rendimento estimado ao dissolver no Cadinho (Taxa: 🪙 ${yields.fee}g):</div>
            </div>
          </div>
          <div style="display:flex; gap:10px; font-size:12px; font-weight:700; font-family:'IBM Plex Mono',monospace;">
            <span style="color:#fca5a5;">🔥 +${yields.fire}</span>
            <span style="color:#86efac;">🛡️ +${yields.earth}</span>
            <span style="color:#7dd3fc;">🍃 +${yields.wind}</span>
            <span style="color:#38bdf8;">💧 +${yields.water ?? yields.astral ?? 0}</span>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Essence Dashboard -->
      <div class="imp-alchemy-dashboard">
        <div class="imp-essence-orb orb-fire">
          <div style="font-size:22px; filter: drop-shadow(0 0 6px rgba(239,68,68,0.5));">🔥</div>
          <div style="font-size:10px; text-transform:uppercase; color:#fca5a5; font-weight:700; font-family:'Cinzel',serif;">Fogo</div>
          <div style="font-size:18px; font-weight:700; color:#fff; font-family:'IBM Plex Mono',monospace;">${(essences.fire || 0).toLocaleString()}</div>
        </div>
        <div class="imp-essence-orb orb-earth">
          <div style="font-size:22px; filter: drop-shadow(0 0 6px rgba(34,197,94,0.5));">🛡️</div>
          <div style="font-size:10px; text-transform:uppercase; color:#86efac; font-weight:700; font-family:'Cinzel',serif;">Terra</div>
          <div style="font-size:18px; font-weight:700; color:#fff; font-family:'IBM Plex Mono',monospace;">${(essences.earth || 0).toLocaleString()}</div>
        </div>
        <div class="imp-essence-orb orb-wind">
          <div style="font-size:22px; filter: drop-shadow(0 0 6px rgba(56,189,248,0.5));">🍃</div>
          <div style="font-size:10px; text-transform:uppercase; color:#7dd3fc; font-weight:700; font-family:'Cinzel',serif;">Vento</div>
          <div style="font-size:18px; font-weight:700; color:#fff; font-family:'IBM Plex Mono',monospace;">${(essences.wind || 0).toLocaleString()}</div>
        </div>
        <div class="imp-essence-orb orb-water">
          <div style="font-size:22px; filter: drop-shadow(0 0 6px rgba(14,165,233,0.5));">💧</div>
          <div style="font-size:10px; text-transform:uppercase; color:#38bdf8; font-weight:700; font-family:'Cinzel',serif;">Água</div>
          <div style="font-size:18px; font-weight:700; color:#fff; font-family:'IBM Plex Mono',monospace;">${((essences.water ?? essences.astral) || 0).toLocaleString()}</div>
        </div>
      </div>

      <!-- Active Elixirs Banner -->
      ${activeBuffsHtml ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">✨ Elixires Ativos</h4>
          ${activeBuffsHtml}
        </div>
      ` : ''}

      <!-- Chaos Boss Summoning Portal -->
      <div style="background:linear-gradient(135deg, rgba(50,15,25,0.92), rgba(20,8,16,0.95)); border:1px solid rgba(239,68,68,0.5); border-radius:10px; padding:14px; margin-bottom:16px; box-shadow:0 4px 18px rgba(239,68,68,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#fca5a5; font-size:15px; display:flex; align-items:center; gap:8px;">
            🌀 Fenda do Caos — Invocação de Boss Abissal
          </h4>
          <span style="font-size:10px; background:rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.45); padding:3px 10px; border-radius:12px; color:#fecaca; font-weight:700; font-family:'IBM Plex Mono',monospace;">
            PEDRAS: ${chaosStoneCount}x
          </span>
        </div>
        <p style="margin:0 0 12px 0; font-size:12px; color:#cbd5e1; line-height:1.4;">
          Rasgue o tecido do espaço no combate idle para convocar uma versão <strong>[CHAOS]</strong> de um Boss Épico. Chefes do Caos possuem stats aumentados e concedem <strong>Drops Especiais e +100 Pontos para a Forja Imperial (Random Craft)</strong>!
        </p>
        <button
          onclick="if (window.useChaosBossSummonStoneAction) window.useChaosBossSummonStoneAction();"
          ${chaosStoneCount <= 0 ? 'disabled' : ''}
          class="imp-btn-primary"
          style="width:100%; padding:10px 16px; font-size:13px; background:${chaosStoneCount > 0 ? 'linear-gradient(180deg, #ef4444, #991b1b)' : 'rgba(80,40,40,0.5)'}; border-color:${chaosStoneCount > 0 ? '#fca5a5' : 'rgba(120,60,60,0.4)'}; color:#fff; display:flex; align-items:center; justify-content:center; gap:8px;"
        >
          🌀 INVOCAÇÃO ABISSAL: ABRIR FENDA DO CAOS
        </button>
      </div>

      <!-- Single Item Crucible Inspection & Yield Preview -->
      ${crucibleSelectHtml}

      <!-- Fast Dissolve Controls -->
      <div style="background:var(--imp-surface-panel, rgba(15,20,32,0.85)); border:1px solid var(--imp-border-subtle, rgba(255,255,255,0.08)); border-radius:10px; padding:12px; margin-bottom:16px;">
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px; display:flex; align-items:center; gap:6px;">
          🔥 Dissolução em Lote no Cadinho de Almas
        </h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
          <button
            onclick="if (window.dissolveItemsByFilter) window.dissolveItemsByFilter('nograde');"
            class="imp-forge-subtab-btn"
            style="color:#e2e8f0; border-color:rgba(148,163,184,0.4);"
          >
            🔥 No-Grade
          </button>
          <button
            onclick="if (window.dissolveItemsByFilter) window.dissolveItemsByFilter('d');"
            class="imp-forge-subtab-btn"
            style="color:#93c5fd; border-color:rgba(59,130,246,0.4);"
          >
            🔥 D-Grade
          </button>
          <button
            onclick="if (window.dissolveItemsByFilter) window.dissolveItemsByFilter('c');"
            class="imp-forge-subtab-btn"
            style="color:#86efac; border-color:rgba(34,197,94,0.4);"
          >
            🔥 C-Grade
          </button>
          <button
            onclick="if (window.dissolveItemsByFilter) window.dissolveItemsByFilter('b');"
            class="imp-forge-subtab-btn"
            style="color:#d8b4fe; border-color:rgba(168,85,247,0.4);"
          >
            🔥 B-Grade
          </button>
          <button
            onclick="if (window.dissolveAllJunkAction) window.dissolveAllJunkAction();"
            class="imp-forge-subtab-btn"
            style="color:#fca5a5; border-color:rgba(239,68,68,0.5); background:rgba(239,68,68,0.15);"
          >
            🔥 Lixo Geral (NG/D/C)
          </button>
        </div>
      </div>

      <!-- Recipes List -->
      <div>
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">
          ⚗️ Receitas de Alquimia &amp; Transmutação
        </h4>
        ${recipesHtml}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   19. ASTRAL MASTERY & PRESTIGE REINCARNATION UI RENDERER
═══════════════════════════════════════════════════════════════════════════ */
export function renderAstralMasteryUI(state) {
  if (!state) return;
  const root = getRoot();
  const container = root.querySelector('#tab-astral, .tab-astral');
  if (!container) return;

  const prestigeLvl = state.prestigeLevel || 0;
  const astralShards = state.astralShards || 0;
  const astralMastery = state.astralMastery || {};
  const currentLvl = state.level || 1;

  const isReborn = prestigeLvl > 0;
  const titles = [
    'Sem Prestígio (Mortal)',
    'Aventureiro Renascido',
    'Mestre da Constelação',
    'Senhor da Reencarnação',
    'Deus Ancestral de Aden'
  ];
  const currentTitle = isReborn ? titles[Math.min(prestigeLvl, titles.length - 1)] : titles[0];

  const nodes = (typeof window !== 'undefined' && window.ASTRAL_NODES) ? window.ASTRAL_NODES : {};

  const constellations = {
    dragon: { name: '🐉 Constelação do Dragão (Combate)', desc: 'Poder físico, mágico e letalidade de acertos críticos' },
    phoenix: { name: '🦅 Constelação da Fênix (Resistência)', desc: 'Vitalidade, mana, regeneração acelerada e defesas' },
    midas: { name: '💰 Constelação de Midas (Economia)', desc: 'Prosperidade em Adena, chance de saque e experiência' },
  };

  let constellationsHtml = '';
  for (const [constKey, constDef] of Object.entries(constellations)) {
    const constNodes = Object.values(nodes).filter(n => n.const === constKey);

    let nodesHtml = '';
    for (const node of constNodes) {
      const nodeLvl = astralMastery[node.id] || 0;
      const isMax = nodeLvl >= node.max;
      const canUpgrade = isReborn && !isMax && astralShards >= node.cost;

      nodesHtml += `
        <div style="background:rgba(18,24,38,0.85); border:1px solid ${isMax ? 'rgba(52,211,153,0.5)' : (canUpgrade ? 'rgba(212,167,68,0.4)' : 'rgba(255,255,255,0.08)')}; border-radius:10px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; background:rgba(0,0,0,0.6); border:1px solid ${isMax ? '#34d399' : 'rgba(212,167,68,0.3)'}; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:24px;">
              ${node.icon}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${node.name}</h4>
                <span style="font-size:10px; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:4px; color:${isMax ? '#34d399' : '#ffd877'}; font-weight:bold;">${nodeLvl}/${node.max}</span>
              </div>
              <p style="margin:2px 0 0 0; font-size:11px; color:#aaa;">${node.desc}</p>
            </div>
          </div>

          <button
            onclick="window.upgradeAstralNode('${node.id}')"
            ${!canUpgrade ? 'disabled' : ''}
            title="${!isReborn ? 'Requer realizar a 1ª Reencarnação (Reborn no Nível 75+)' : (!canUpgrade ? 'Cacos Astrais Insuficientes' : 'Melhorar Nó Astral')}"
            style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:${isMax ? 'rgba(52,211,153,0.15)' : (canUpgrade ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)')}; border:1px solid ${isMax ? '#34d399' : (canUpgrade ? '#ffe699' : 'rgba(100,80,60,0.3)')}; color:${isMax ? '#34d399' : (canUpgrade ? '#000' : '#777')}; border-radius:6px; cursor:${canUpgrade ? 'pointer' : 'default'}; min-width:90px;"
          >
            ${!isReborn ? '🔒 REBORN REQUERIDO' : (isMax ? '✓ MÁX' : `🌟 MELHORAR (${node.cost})`)}
          </button>
        </div>
      `;
    }

    constellationsHtml += `
      <div style="margin-bottom:18px;">
        <h4 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">${constDef.name}</h4>
        <p style="margin:0 0 10px 0; font-size:11px; color:#aaa;">${constDef.desc}</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${nodesHtml}
        </div>
      </div>
    `;
  }

  const canReincarnate = currentLvl >= 75;
  const estimatedShards = Math.max(10, (currentLvl - 74) * 10 + Math.floor((state.totalPlaytime || 0) / 3600000) * 2 + Math.floor((state.gold || 0) / 2500000));

  const lockNoticeBanner = !isReborn ? `
    <div style="background:linear-gradient(135deg, rgba(239,68,68,0.18), rgba(185,28,28,0.28)); border:1px solid rgba(239,68,68,0.6); border-radius:10px; padding:12px 16px; margin-bottom:16px; display:flex; align-items:center; gap:12px; color:#fca5a5; box-shadow:0 4px 12px rgba(239,68,68,0.2);">
      <span style="font-size:24px;">🔒</span>
      <div>
        <h4 style="margin:0; font-family:'Cinzel',serif; color:#f87171; font-size:14px;">MAESTRIA ASTRAL BLOQUEADA</h4>
        <p style="margin:2px 0 0 0; font-size:11px; color:#e2e8f0;">Você precisa alcançar o Nível 75+ e realizar a sua <strong>1ª Reencarnação (Reborn)</strong> para utilizar os Cacos Astrais e despertar os bônus da Constelação!</p>
      </div>
    </div>
  ` : '';

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      ${lockNoticeBanner}
      <!-- Header Banner -->
      <div style="background:linear-gradient(180deg, rgba(26,18,48,0.95), rgba(12,8,26,0.95)); border:1px solid rgba(168,85,247,0.4); border-radius:12px; padding:16px; margin-bottom:18px; box-shadow:0 4px 20px rgba(168,85,247,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <span style="font-size:11px; text-transform:uppercase; color:#c084fc; font-weight:bold; letter-spacing:1px;">✨ Sistema de Prestígio Ancestral</span>
            <h3 style="margin:2px 0 0 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:20px; display:flex; align-items:center; gap:8px;">
              🌟 Árvore de Maestria Astral
            </h3>
            <div style="font-size:12px; color:#ddd; margin-top:4px;">
              Título Atual: <strong style="color:#a855f7;">${currentTitle}</strong> (Prestígio Nível <strong>${prestigeLvl}</strong>)
            </div>
          </div>

          <div style="background:rgba(0,0,0,0.6); border:1px solid rgba(168,85,247,0.5); padding:8px 16px; border-radius:10px; text-align:right;">
            <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Saldo de Fragmentos</div>
            <div style="font-size:20px; font-weight:bold; color:#d8b4fe; display:flex; align-items:center; justify-content:flex-end; gap:6px;">
              ✨ <span>${astralShards.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reincarnation Ritual Panel -->
      <div style="background:linear-gradient(180deg, rgba(40,20,20,0.85), rgba(20,10,10,0.85)); border:1px solid ${canReincarnate ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}; border-radius:12px; padding:14px; margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h4 style="margin:0; font-family:'Cinzel',serif; color:#fca5a5; font-size:16px; display:flex; align-items:center; gap:6px;">
              🔥 Ritual da Reencarnação Ancestral
            </h4>
            <p style="margin:4px 0 0 0; font-size:11px; color:#aaa; max-width:480px;">
              Reencarne para reiniciar ao Nível 1. Seus Equipamentos, Baú, Alquimia, Dolls e Pontos Astrais <strong>são preservados</strong>!
            </p>
          </div>

          <button
            onclick="window.reincarnateHero()"
            ${!canReincarnate ? 'disabled' : ''}
            style="padding:10px 18px; font-family:'Cinzel',serif; font-weight:bold; font-size:13px; background:${canReincarnate ? 'linear-gradient(180deg,#ef4444,#991b1b)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canReincarnate ? '#fca5a5' : 'rgba(100,80,60,0.3)'}; color:${canReincarnate ? '#fff' : '#777'}; border-radius:8px; cursor:${canReincarnate ? 'pointer' : 'not-allowed'}; box-shadow:${canReincarnate ? '0 4px 14px rgba(239,68,68,0.4)' : 'none'};"
          >
            ${canReincarnate ? `✨ REENCARNAR (+${estimatedShards} Fragmentos)` : '🔒 Requer Nível 75+'}
          </button>
        </div>
      </div>

      <!-- Constellations Tree -->
      ${constellationsHtml}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   20. EXPEDITIONS, CASTLES & MANOR UI RENDERER
═══════════════════════════════════════════════════════════════════════════ */
export function renderExpeditionsUI(state) {
  if (!state) return;
  const root = getRoot();
  const container = root.querySelector('#tab-expeditions, .tab-expeditions');
  if (!container) return;

  const now = Date.now();
  const dests = (typeof window !== 'undefined' && window.EXPEDITION_DESTINATIONS) ? window.EXPEDITION_DESTINATIONS : EXPEDITION_DESTINATIONS;
  const castles = (typeof window !== 'undefined' && window.CASTLES_DEFS) ? window.CASTLES_DEFS : {};
  const seeds = (typeof window !== 'undefined' && window.MANOR_SEEDS) ? window.MANOR_SEEDS : {};

  const activeExpeditions = state.expeditions || [];
  const playerCastles = state.castles || {};
  const ownedCrops = state.manorCrops || {};
  const currentLvl = state.level || 1;

  // Estado dos Mercenários
  const mState = MercenaryService.getMercenariesState(state);
  if (mState.tavernPool.length === 0) {
    MercenaryService.refreshTavern(state);
  }

  if (typeof window !== 'undefined' && !window._expeditionSquadSelections) {
    window._expeditionSquadSelections = {};
  }

  // 1. TAVERNA DE MERCENÁRIOS (RECRUTAMENTO)
  let tavernHtml = '';
  for (const cand of mState.tavernPool) {
    const rarityDef = MERCENARY_RARITIES[cand.rarity] || MERCENARY_RARITIES.common;
    const specDef = MERCENARY_SPECIALIZATIONS[cand.spec] || { name: cand.spec, icon: '⚔️', synergyDesc: '' };
    const canAfford = (state.gold || 0) >= cand.hireCost;

    tavernHtml += `
      <div style="
        flex: 1 1 210px;
        min-width: 200px;
        background: rgba(18, 22, 34, 0.85);
        border: 1px solid ${rarityDef.border};
        border-radius: 8px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      ">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:10px; background:${rarityDef.bgBadge}; color:${rarityDef.color}; border:1px solid ${rarityDef.border}; padding:1px 6px; border-radius:4px; font-weight:bold;">
              ${rarityDef.name.toUpperCase()}
            </span>
            <span style="font-size:11px; color:#ffd877; font-weight:bold;">Poder: ${cand.basePower}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin:4px 0;">
            <div style="font-size:24px;">${cand.icon || '⚔️'}</div>
            <div>
              <strong style="font-size:13px; color:#f4d58a; font-family:'Cinzel',serif;">${cand.name}</strong>
              <div style="font-size:10px; color:#94a3b8;">${cand.title}</div>
            </div>
          </div>
          <div style="font-size:10px; background:rgba(0,0,0,0.4); border-radius:4px; padding:4px 6px; margin:6px 0; color:#cbd5e1;">
            <strong style="color:#6ee7b7;">${specDef.icon} ${specDef.name}:</strong> ${specDef.synergyDesc}
          </div>
          ${cand.trait && MERCENARY_TRAITS[cand.trait] ? `
            <div style="font-size:10px; color:${MERCENARY_TRAITS[cand.trait].color}; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.1); border-radius:4px; padding:3px 6px; margin-bottom:6px;">
              ${MERCENARY_TRAITS[cand.trait].icon} <strong>Traço: ${MERCENARY_TRAITS[cand.trait].name}</strong> — ${MERCENARY_TRAITS[cand.trait].desc}
            </div>
          ` : ''}
          <p style="font-size:10px; color:#888; font-style:italic; margin:0 0 8px 0; line-height:1.2;">
            "${cand.quote}"
          </p>
        </div>
        <button
          onclick="window.recruitMercenary('${cand.uid}')"
          ${!canAfford ? 'disabled' : ''}
          style="
            width: 100%;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: bold;
            background: ${canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(50,50,50,0.4)'};
            border: 1px solid ${canAfford ? '#ffe699' : '#555'};
            color: ${canAfford ? '#000' : '#777'};
            border-radius: 6px;
            cursor: ${canAfford ? 'pointer' : 'not-allowed'};
          "
        >
          CONTRATAR (${(cand.hireCost / 1000).toFixed(0)}k Adena)
        </button>
      </div>
    `;
  }

  // 2. QUARTEL DOS MERCENÁRIOS CONTRATADOS
  let rosterHtml = '';
  if (mState.owned.length === 0) {
    rosterHtml = `
      <div style="background:rgba(18,22,34,0.6); border:1px dashed rgba(212,167,68,0.3); border-radius:8px; padding:16px; text-align:center; color:#94a3b8; font-size:12px;">
        🛡️ Seu Quartel está vazio. Visite a Taverna acima para recrutar mercenários e compor seu esquadrão de expedição!
      </div>
    `;
  } else {
    rosterHtml = `<div style="display:flex; gap:10px; flex-wrap:wrap;">`;
    for (const merc of mState.owned) {
      const isBusy = MercenaryService.isMercenaryBusy(state, merc.uid);
      const rarityDef = MERCENARY_RARITIES[merc.rarity] || MERCENARY_RARITIES.common;
      const specDef = MERCENARY_SPECIALIZATIONS[merc.spec] || { name: merc.spec, icon: '⚔️' };
      const mercPower = calculateMercenaryPower(merc);
      const neededXp = getMercenaryXpForLevel(merc.level || 1);
      const xpPct = Math.min(100, Math.floor(((merc.xp || 0) / neededXp) * 100));

      rosterHtml += `
        <div style="
          flex: 1 1 180px;
          min-width: 170px;
          background: rgba(18, 22, 34, 0.85);
          border: 1px solid ${rarityDef.border};
          border-radius: 8px;
          padding: 8px 10px;
          position: relative;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:9px; background:${rarityDef.bgBadge}; color:${rarityDef.color}; padding:1px 5px; border-radius:3px; font-weight:bold;">
              Nv. ${merc.level || 1}
            </span>
            <span style="font-size:10px; color:${isBusy ? '#fbbf24' : '#34d399'}; font-weight:bold;">
              ${isBusy ? '🧭 EM MARCHA' : '✓ PRONTO'}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin:4px 0;">
            <span style="font-size:20px;">${merc.icon || '⚔️'}</span>
            <div>
              <strong style="font-size:12px; color:#f4d58a;">${merc.name}</strong>
              <div style="font-size:10px; color:#cbd5e1;">${specDef.icon} ${specDef.name} | Poder: ${mercPower}</div>
            </div>
          </div>
          <!-- Barra de XP -->
          <div style="width:100%; height:4px; background:rgba(0,0,0,0.6); border-radius:2px; overflow:hidden; margin:4px 0;">
            <div style="width:${xpPct}%; height:100%; background:#3b82f6;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:9px; margin:3px 0;">
            <span style="color:${(merc.loyalty ?? 50) >= 80 ? '#34d399' : ((merc.loyalty ?? 50) >= 50 ? '#60a5fa' : '#f87171')}; font-weight:bold;">
              🤝 Lealdade: ${merc.loyalty ?? 50}%
            </span>
            ${merc.trait && MERCENARY_TRAITS[merc.trait] ? `
              <span style="color:${MERCENARY_TRAITS[merc.trait].color};" title="${MERCENARY_TRAITS[merc.trait].desc}">
                ${MERCENARY_TRAITS[merc.trait].icon} ${MERCENARY_TRAITS[merc.trait].name}
              </span>
            ` : ''}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:9px; color:#888;">XP: ${merc.xp || 0}/${neededXp}</span>
            <button
              onclick="window.dismissMercenary('${merc.uid}')"
              ${isBusy ? 'disabled' : ''}
              style="padding:2px 6px; font-size:9px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); color:#fca5a5; border-radius:3px; cursor:${isBusy ? 'not-allowed' : 'pointer'};"
            >
              Dispensar
            </button>
          </div>
        </div>
      `;
    }
    rosterHtml += `</div>`;
  }

  // 3. EXPEDIÇÕES ESTRATÉGICAS
  let expHtml = '';
  for (const [dId, dDef] of Object.entries(dests)) {
    const active = activeExpeditions.find(e => e.destId === dId);
    let statusBtn = '';
    const isUnlocked = currentLvl >= (dDef.minLevel || 20);

    if (active) {
      const finishTime = active.startTime + active.duration;
      if (now >= finishTime) {
        statusBtn = `
          <button
            onclick="window.claimExpeditionReward('${active.id}')"
            style="padding:10px 16px; font-weight:bold; font-size:12px; background:linear-gradient(180deg,#34d399,#059669); border:1px solid #6ee7b7; color:#000; border-radius:6px; cursor:pointer; box-shadow:0 0 12px rgba(52,211,153,0.5);"
          >
            🎁 COLETAR SAQUE
          </button>
        `;
      } else {
        const secondsLeft = Math.ceil((finishTime - now) / 1000);
        const hours = Math.floor(secondsLeft / 3600);
        const mins = Math.floor((secondsLeft % 3600) / 60);
        const secs = secondsLeft % 60;
        const timeStr = `${hours}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

        statusBtn = `
          <span style="font-family:monospace; font-weight:bold; color:#fbbf24; background:rgba(0,0,0,0.6); padding:8px 14px; border-radius:6px; border:1px solid rgba(251,191,36,0.4); font-size:12px;">
            ⏱️ ${timeStr}
          </span>
        `;
      }
    } else {
      const canAfford = (state.gold || 0) >= dDef.cost;
      statusBtn = `
        <button
          onclick="window.startStrategicExpedition('${dId}')"
          ${(!isUnlocked || !canAfford) ? 'disabled' : ''}
          style="
            padding:10px 16px;
            font-family:'Cinzel',serif;
            font-weight:bold;
            font-size:12px;
            background:${isUnlocked && canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'};
            border:1px solid ${isUnlocked && canAfford ? '#ffe699' : 'rgba(100,80,60,0.3)'};
            color:${isUnlocked && canAfford ? '#000' : '#777'};
            border-radius:6px;
            cursor:${isUnlocked && canAfford ? 'pointer' : 'not-allowed'};
          "
        >
          ${!isUnlocked ? `🔒 Nv. ${dDef.minLevel}+` : `🧭 ENVIAR (${(dDef.cost / 1000).toFixed(0)}k)`}
        </button>
      `;
    }

    // Seletor de esquadrão para esta expedição
    const selectedUids = (window._expeditionSquadSelections && window._expeditionSquadSelections[dId]) || [];
    const selectedMercs = selectedUids.map(uid => MercenaryService.getMercenaryByUid(state, uid)).filter(Boolean);
    const synergies = ExpeditionService.calculateSquadSynergies(dId, selectedMercs);

    let squadSelectorHtml = '';
    if (!active && isUnlocked) {
      if (mState.owned.length > 0) {
        squadSelectorHtml = `
          <div style="margin-top:8px; padding-top:8px; border-top:1px solid rgba(212,167,68,0.2);">
            <div style="font-size:11px; color:#f4d58a; margin-bottom:4px; display:flex; justify-content:space-between;">
              <span>Escalar Mercenários (${selectedUids.length}/3):</span>
              <span style="color:#6ee7b7; font-weight:bold;">Poder do Esquadrão: ${synergies.totalSquadPower}</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
        `;

        for (const merc of mState.owned) {
          const isSelected = selectedUids.includes(merc.uid);
          const isBusyOther = !isSelected && MercenaryService.isMercenaryBusy(state, merc.uid);
          const specDef = MERCENARY_SPECIALIZATIONS[merc.spec] || { icon: '⚔️' };

          squadSelectorHtml += `
            <button
              onclick="window.toggleMercenaryInExpeditionSquad('${dId}', '${merc.uid}')"
              ${isBusyOther ? 'disabled' : ''}
              style="
                padding: 4px 8px;
                font-size: 10px;
                font-weight: bold;
                background: ${isSelected ? 'rgba(52,211,153,0.3)' : isBusyOther ? 'rgba(40,40,40,0.4)' : 'rgba(20,25,35,0.8)'};
                border: 1px solid ${isSelected ? '#34d399' : isBusyOther ? '#444' : 'rgba(212,167,68,0.3)'};
                color: ${isSelected ? '#6ee7b7' : isBusyOther ? '#666' : '#cbd5e1'};
                border-radius: 4px;
                cursor: ${isBusyOther ? 'not-allowed' : 'pointer'};
                box-shadow: ${isSelected ? '0 0 6px rgba(52,211,153,0.4)' : 'none'};
              "
            >
              ${specDef.icon} ${merc.name} (Nv. ${merc.level || 1}) ${isSelected ? '✓' : ''}
            </button>
          `;
        }

        squadSelectorHtml += `</div>`;

        if (synergies.activePerks.length > 0) {
          squadSelectorHtml += `
            <div style="margin-top:6px; font-size:10px; color:#6ee7b7; background:rgba(52,211,153,0.1); border:1px solid rgba(52,211,153,0.25); border-radius:4px; padding:3px 6px;">
              ⚡ Sinergias: ${synergies.activePerks.join(' | ')}
            </div>
          `;
        }
        squadSelectorHtml += `</div>`;
      } else {
        squadSelectorHtml = `
          <div style="margin-top:6px; font-size:10px; color:#94a3b8; font-style:italic;">
            💡 Contrate mercenários na Taverna para reduzir o tempo da expedição em até 20% e liberar baús bônus!
          </div>
        `;
      }
    } else if (active && Array.isArray(active.squad) && active.squad.length > 0) {
      const activeMercs = active.squad.map(uid => MercenaryService.getMercenaryByUid(state, uid)).filter(Boolean);
      squadSelectorHtml = `
        <div style="margin-top:8px; font-size:10px; color:#94a3b8; border-top:1px solid rgba(212,167,68,0.15); padding-top:6px;">
          Mercenários na vanguarda: <strong style="color:#6ee7b7;">${activeMercs.map(m => m.name).join(', ')}</strong>
          ${active.synergies?.activePerks?.length ? `<span style="color:#ffd877; margin-left:6px;">(${active.synergies.activePerks.join(', ')})</span>` : ''}
        </div>
      `;
    }

    const minG = dDef.minGold ? (dDef.minGold / 1000).toFixed(0) + 'k' : '20k';
    const maxG = dDef.maxGold ? (dDef.maxGold / 1000).toFixed(0) + 'k' : '30k';
    const shards = dDef.shards || 3;
    const chestName = dDef.rewardDesc || 'Baú de Espólios';

    let phasesHtml = '';
    if (active) {
      const elapsed = Math.min(active.duration, now - active.startTime);
      const progress = Math.min(1, elapsed / active.duration);
      phasesHtml = `
        <div style="margin-top:8px; background:rgba(0,0,0,0.4); border-radius:6px; padding:8px 10px; border:1px solid rgba(212,167,68,0.2);">
          <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:bold; margin-bottom:4px;">
            <span style="color:${progress >= 0.33 ? '#34d399' : '#94a3b8'};">1. Infiltração ${progress >= 0.33 ? '✓' : '⏳'}</span>
            <span style="color:${progress >= 0.66 ? '#34d399' : (progress >= 0.33 ? '#fbbf24' : '#94a3b8')};">2. Perigo & Combate ${progress >= 0.66 ? '✓' : (progress >= 0.33 ? '⚡' : '⏳')}</span>
            <span style="color:${progress >= 1.0 ? '#34d399' : (progress >= 0.66 ? '#fbbf24' : '#94a3b8')};">3. Câmara do Tesouro ${progress >= 1.0 ? '✓' : (progress >= 0.66 ? '🗝️' : '⏳')}</span>
          </div>
          <div style="width:100%; height:5px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
            <div style="width:${Math.floor(progress * 100)}%; height:100%; background:linear-gradient(90deg,#38bdf8,#34d399);"></div>
          </div>
        </div>
      `;
    }

    let directiveHtml = '';
    if (!active && isUnlocked) {
      const currentDir = (window._selectedExpeditionDirective && window._selectedExpeditionDirective[dId]) || 'balanced';
      const dirs = [
        { id: 'cautious', icon: '🛡️', name: 'Cautelosa' },
        { id: 'balanced', icon: '⚖️', name: 'Equilibrada' },
        { id: 'reckless', icon: '🔥', name: 'Audaciosa' }
      ];
      directiveHtml = `
        <div style="margin-top:12px; padding-top:8px; border-top:1px solid rgba(212,167,68,0.2);">
          <div style="font-size:11px; color:#f4d58a; margin-bottom:6px;">Diretriz de Risco:</div>
          <div style="display:flex; gap:8px;">
            ${dirs.map(d => `
              <button 
                onclick="window.setExpeditionDirective('${dId}', '${d.id}')"
                style="flex:1; padding:6px; font-family:'Cinzel',serif; font-size:10px; font-weight:bold; background:${currentDir === d.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${currentDir === d.id ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; color:${currentDir === d.id ? '#fbbf24' : '#cbd5e1'}; border-radius:4px; cursor:pointer;"
              >
                ${d.icon} ${d.name}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    let dilemmaHtml = '';
    if (active && active.activeDilemmaId && !active.dilemmaResolved) {
      // Need to dynamically import or reference EXPEDITION_DILEMMAS
      const dDef = window.GameData?.EXPEDITION_DILEMMAS ? window.GameData.EXPEDITION_DILEMMAS[active.activeDilemmaId] : null;
      if (dDef) {
        dilemmaHtml = `
          <div style="margin-top:12px; padding:10px; background:radial-gradient(circle, rgba(50,20,10,0.85) 0%, rgba(20,10,5,0.95) 100%); border:1px solid #ef4444; border-radius:8px; box-shadow:0 0 10px rgba(239,68,68,0.3);">
            <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#fca5a5; margin-bottom:4px;">
              ⚠️ Dilema de Marcha: ${dDef.name}
            </div>
            <p style="font-size:10px; color:#aaa; margin:0 0 8px 0;">${dDef.desc}</p>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${Object.entries(dDef.options).map(([k, o]) => `
                <button 
                  onclick="window.resolveExpeditionDilemma('${dId}', '${k}')"
                  style="flex:1; padding:6px; font-size:10px; font-weight:bold; background:rgba(0,0,0,0.5); border:1px solid #f87171; color:#fecaca; border-radius:4px; cursor:pointer;"
                >
                  ${o.name}<br/><span style="font-size:8px; color:#fca5a5; font-weight:normal;">${o.desc}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    expHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:14px; margin-bottom:12px; box-shadow:0 2px 10px rgba(0,0,0,0.4);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap;">
          <div style="flex:1; min-width:220px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">${dDef.name}</h4>
              <span style="font-size:10px; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:4px; color:#ffd877; font-weight:bold;">Lv. ${dDef.minLevel || 20}+</span>
            </div>
            <p style="margin:4px 0 6px 0; font-size:11px; color:#aaa; line-height:1.3;">${dDef.desc}</p>
            <div style="font-size:10px; color:#fca5a5; margin-bottom:6px;">
              <strong>⚠️ Ameaça:</strong> ${dDef.threat || 'Perigos Ancestrais'}
              <span style="color:#94a3b8; margin-left:6px;">(Recomendados: ${dDef.recommendedSpecs?.map(s => MERCENARY_SPECIALIZATIONS[s]?.name || s).join(', ') || 'Qualquer'})</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <span style="font-size:10px; background:rgba(212,167,68,0.15); border:1px solid rgba(212,167,68,0.3); padding:2px 8px; border-radius:6px; color:#ffd877; font-weight:bold;">🪙 ${minG}-${maxG} Adena</span>
              <span style="font-size:10px; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.3); padding:2px 8px; border-radius:6px; color:#d8b4fe; font-weight:bold;">✨ +${shards} Cacos Astrais</span>
              <span style="font-size:10px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:6px; color:#93c5fd; font-weight:bold;">📦 ${chestName}</span>
            </div>
          </div>
          <div>
            ${statusBtn}
          </div>
        </div>
        ${squadSelectorHtml}
        ${directiveHtml}
        ${phasesHtml}
        ${dilemmaHtml}
      </div>
    `;
  }

  // 4. CASTELOS DE ADEN
  let castlesHtml = '';
  for (const [cId, cDef] of Object.entries(castles)) {
    const cData = playerCastles[cId];
    const isConquered = !!cData?.conquered;

    let actionBtn = '';
    if (isConquered) {
      const lastClaim = cData.lastTaxClaim || now;
      const hoursPassed = (now - lastClaim) / 3600000;
      const canClaim = hoursPassed >= 1;
      const accumGold = Math.floor(Math.min(24, hoursPassed) * cDef.taxPerHour);

      actionBtn = `
        <button
          onclick="window.claimCastleTaxes('${cId}')"
          ${!canClaim ? 'disabled' : ''}
          style="padding:8px 14px; font-weight:bold; font-size:11px; background:${canClaim ? 'linear-gradient(180deg,#fbbf24,#b45309)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canClaim ? '#fde047' : 'rgba(100,80,60,0.3)'}; color:${canClaim ? '#000' : '#777'}; border-radius:6px; cursor:${canClaim ? 'pointer' : 'not-allowed'};"
        >
          🪙 IMPOSTOS (+${accumGold.toLocaleString()}g)
        </button>
      `;
    } else {
      const canChallenge = currentLvl >= cDef.reqLevel;
      actionBtn = `
        <button
          onclick="window.conquerCastle('${cId}')"
          ${!canChallenge ? 'disabled' : ''}
          style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:${canChallenge ? 'linear-gradient(180deg,#ef4444,#991b1b)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canChallenge ? '#fca5a5' : 'rgba(100,80,60,0.3)'}; color:${canChallenge ? '#fff' : '#777'}; border-radius:6px; cursor:${canChallenge ? 'pointer' : 'not-allowed'};"
        >
          ${canChallenge ? '⚔️ DOMINAR' : `🔒 Lv. ${cDef.reqLevel}+`}
        </button>
      `;
    }

    castlesHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid ${isConquered ? 'rgba(52,211,153,0.5)' : 'rgba(212,167,68,0.2)'}; border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <h4 style="margin:0; font-family:'Cinzel',serif; color:${isConquered ? '#34d399' : '#f4d58a'}; font-size:14px;">🏰 ${cDef.name}</h4>
            <span style="font-size:10px; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:4px; color:${isConquered ? '#34d399' : '#fca5a5'}; font-weight:bold;">${isConquered ? '✓ SEU DOMÍNIO' : 'GUARDA INIMIGA'}</span>
          </div>
          <p style="margin:2px 0 0 0; font-size:11px; color:#aaa;">${cDef.desc}</p>
        </div>
        ${actionBtn}
      </div>
    `;
  }

  // 5. MANOR FARMING
  let manorHtml = '';
  for (const [sId, sDef] of Object.entries(seeds)) {
    const cropsCount = ownedCrops[sId] || 0;
    const canExchange1 = cropsCount >= sDef.ratio1;
    const canExchange2 = cropsCount >= sDef.ratio2;

    manorHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div>
            <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">🌾 ${sDef.name} (Lv. ${sDef.level})</h4>
            <div style="font-size:11px; color:#aaa;">Colheita Acumulada: <strong style="color:#34d399;">${cropsCount}x Crops</strong></div>
          </div>
          <button
            onclick="window.buyManorSeed('${sId}', 10)"
            style="padding:6px 12px; font-weight:bold; font-size:11px; background:rgba(212,167,68,0.2); border:1px solid rgba(212,167,68,0.4); color:#ffd877; border-radius:6px; cursor:pointer;"
          >
            🛒 Comprar 10x Sementes (${(sDef.price * 10).toLocaleString()}g)
          </button>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button
            onclick="window.exchangeManorCrop('${sId}', 1)"
            ${!canExchange1 ? 'disabled' : ''}
            style="flex:1; padding:6px; font-size:11px; font-weight:bold; background:${canExchange1 ? 'rgba(52,211,153,0.2)' : 'rgba(50,50,50,0.3)'}; border:1px solid ${canExchange1 ? '#34d399' : '#555'}; color:${canExchange1 ? '#6ee7b7' : '#777'}; border-radius:6px; cursor:${canExchange1 ? 'pointer' : 'not-allowed'};"
          >
            🔄 Trocar ${sDef.ratio1}x Crops ➔ +1 ${sDef.reward1.toUpperCase()}
          </button>
          <button
            onclick="window.exchangeManorCrop('${sId}', 2)"
            ${!canExchange2 ? 'disabled' : ''}
            style="flex:1; padding:6px; font-size:11px; font-weight:bold; background:${canExchange2 ? 'rgba(168,85,247,0.2)' : 'rgba(50,50,50,0.3)'}; border:1px solid ${canExchange2 ? '#a855f7' : '#555'}; color:${canExchange2 ? '#d8b4fe' : '#777'}; border-radius:6px; cursor:${canExchange2 ? 'pointer' : 'not-allowed'};"
          >
            🔄 Trocar ${sDef.ratio2}x Crops ➔ +1 ${sDef.reward2.toUpperCase()}
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(180deg, rgba(20,26,42,0.95), rgba(10,14,24,0.95)); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:16px; margin-bottom:18px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:20px; display:flex; align-items:center; gap:8px;">
          🏰 Salão dos Mercenários & Expedições de Aden
        </h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Contrate mercenários especializados na Taverna, treine seu esquadrão e envie-os em expedições estratégicas com sinergias táticas!
        </p>
      </div>

      <!-- 1. Taverna de Mercenários -->
      <div style="margin-bottom:22px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:6px;">
            🍺 Taverna dos Mercenários (Contratos Disponíveis)
          </h4>
          <button
            onclick="window.refreshMercenaryTavern()"
            style="padding:5px 12px; font-size:11px; font-weight:bold; background:rgba(212,167,68,0.15); border:1px solid rgba(212,167,68,0.4); color:#ffd877; border-radius:6px; cursor:pointer;"
          >
            🔄 Renovar Contratos (10.000g)
          </button>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${tavernHtml}
        </div>
      </div>

      <!-- 2. Quartel dos Mercenários -->
      <div style="margin-bottom:22px;">
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:15px; display:flex; align-items:center; gap:6px;">
          🛡️ Seu Quartel de Mercenários (${mState.owned.length}/12)
        </h4>
        ${rosterHtml}
      </div>

      <!-- 3. Expedições Estratégicas -->
      <div style="margin-bottom:22px;">
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:6px;">
          🧭 Missões de Expedição Estratégicas
        </h4>
        ${expHtml}
      </div>

      <!-- 4. Domínio dos Castelos -->
      <div style="margin-bottom:22px;">
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🏰 Domínio dos Castelos de Aden (Impostos Passivos)
        </h4>
        ${castlesHtml}
      </div>

      <!-- 5. Manor Farming -->
      <div>
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🌾 Manor Manager & Mercado de Colheita
        </h4>
        ${manorHtml}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   21. FORGE HUB SUB-PANELS: SOUL CRYSTALS, PUSHKIN, TATTOOS, ELEMENTAL, BELTS, AUGMENT, RANDOM CRAFT
═══════════════════════════════════════════════════════════════════════════ */

export function renderForgeSoulCrystals(container, state) {
  const inv = state.inventory || [];
  
  // Coleta armas disponíveis (Primária, Secundária/Arsenal e mochila)
  const candidateWeapons = [];
  const w1Uid = state.equipment?.weapon;
  const w2Uid = state.equipment?.weapon2;

  if (w1Uid) {
    const it = inv.find(i => i.uid === w1Uid);
    if (it) candidateWeapons.push({ ...it, equipSlotLabel: '⚔️ Arma Primária (Slot 1)' });
  }
  if (w2Uid && w2Uid !== w1Uid) {
    const it = inv.find(i => i.uid === w2Uid);
    if (it) candidateWeapons.push({ ...it, equipSlotLabel: '🗡️ Arma Secundária (Slot 2)' });
  }
  inv.forEach(i => {
    const s = getItemDef(i.itemId)?.slot || i.slot;
    if ((s === 'weapon' || s === 'weapon2') && i.uid !== w1Uid && i.uid !== w2Uid) {
      candidateWeapons.push({ ...i, equipSlotLabel: 'Mochila' });
    }
  });

  if (!window._selectedSAWeaponUid || !candidateWeapons.some(w => w.uid === window._selectedSAWeaponUid)) {
    window._selectedSAWeaponUid = candidateWeapons[0]?.uid || null;
  }

  const selectedWpn = candidateWeapons.find(w => w.uid === window._selectedSAWeaponUid) || candidateWeapons[0];
  const wpnDef = selectedWpn ? (getItemDef(selectedWpn.itemId) || selectedWpn) : null;
  const grade = selectedWpn ? getElementalItemGrade(selectedWpn) : 'none';
  const gating = SOUL_CRYSTAL_GRADE_GATING[grade] || SOUL_CRYSTAL_GRADE_GATING.d;
  const playerLvl = Number(state.level || 1);
  const isLvlReady = playerLvl >= gating.minLevel;

  // Busca cristal no inventário
  const crystal = inv.find(i => (i.itemId?.startsWith('soul_crystal_') || i.isSoulCrystal) && !i.equipped);
  const crystalStage = crystal ? (crystal.stage || crystal.crystalLevel || 1) : 0;
  const absorbedSouls = crystal ? (crystal.absorbedSouls || 0) : 0;
  const reqSouls = crystalStage < 10 ? crystalStage * 10 : crystalStage * 20;

  // Renderiza seletor de armas
  const weaponSelectorTabs = candidateWeapons.map(w => {
    const isSel = (w.uid === window._selectedSAWeaponUid);
    const def = getItemDef(w.itemId) || w;
    const saLabel = w.soulCrystal ? ` [SA: ${w.soulCrystal.name}]` : '';
    return `
      <button onclick="window._selectedSAWeaponUid = '${w.uid}'; renderForgeSoulCrystals(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.getGameState ? window.getGameState() : null);"
        class="inv-batch-btn"
        style="padding:5px 10px; font-size:11px; font-family:'Cinzel',serif; font-weight:700; border-radius:4px; ${isSel ? 'background:linear-gradient(180deg,#8b5cf6,#6d28d9); color:#fff; border-color:#c4b5fd;' : 'background:rgba(255,255,255,0.05); color:#c4b5fd; border-color:rgba(139,92,246,0.3);'}">
        ${w.equipSlotLabel}: ${def.name || def.itemId}${saLabel}
      </button>
    `;
  }).join('');

  container.innerHTML = `
    <div class="l2-workshop-panel">
      <!-- Altar de Ressonância de Almas -->
      <div class="l2-workshop-altar">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 class="l2-workshop-title">🔮 Câmara de Ressonância de Soul Crystals (SA)</h3>
            <p class="l2-workshop-subtitle">
              Mantenha o cristal na bolsa durante as caçadas para absorver almas e evoluir do Estágio 1 ao 15.
              Permite imbuir Habilidade Especial (SA) em Armas Primárias e Secundárias (Dual Arsenal).
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; color:#94a3b8; font-family:'Cinzel',serif; text-transform:uppercase;">Cristal na Mochila:</div>
            <strong style="color:${crystalStage === 15 ? '#fbbf24' : '#c084fc'}; font-size:14px; font-family:'Cinzel',serif;">
              ${crystal ? `Estágio ${crystalStage} ${crystalStage === 15 ? '👑 (MÁXIMO)' : ''}` : '❌ Nenhum Cristal'}
            </strong>
          </div>
        </div>

        ${crystal && crystalStage < 14 ? `
          <div style="margin-top:12px; background:rgba(8,11,16,0.85); padding:10px 12px; border-radius:6px; border:1px solid rgba(168,85,247,0.3);">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:5px;">
              <span>Almas Absorvidas: <strong style="color:#d8b4fe;">${absorbedSouls} / ${reqSouls}</strong></span>
              <span style="color:#94a3b8;">Progresso p/ Estágio ${crystalStage + 1}</span>
            </div>
            <div style="width:100%; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden; border:1px solid rgba(168,85,247,0.2);">
              <div style="height:100%; width:${Math.min(100, Math.floor((absorbedSouls / reqSouls) * 100))}%; background:linear-gradient(90deg,#a855f7,#ec4899);"></div>
            </div>
          </div>
        ` : ''}

        ${crystalStage === 14 ? `
          <div style="margin-top:12px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); padding:10px 14px; border-radius:6px; font-size:11px; color:#fca5a5;">
            ⚔️ <strong>DESAFIO ÉPICO (ESTÁGIO 14 ➔ 15):</strong> Derrote um <strong>Epic Boss</strong> (Valakas, Antharas, Baium) com o cristal na mochila para a ressonância final (50% de chance canônica)!
          </div>
        ` : ''}

        ${!crystal ? `
          <div style="margin-top:12px;">
            <button onclick="window.buyInitialSoulCrystal()" class="l2-forge-action-btn is-ready" style="max-width:320px;">
              🛒 Adquirir Soul Crystal Inicial (50.000 Adena)
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Seletor de Arma Alvo -->
      <div style="margin:14px 0 10px 0;">
        <div style="font-size:11px; color:#c4b5fd; font-family:'Cinzel',serif; font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.5px;">
          🎯 Selecione a Arma para Engaste (Primária ou Secundária):
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${weaponSelectorTabs || '<span style="font-size:11px; color:#64748b;">Nenhuma arma disponível na mochila ou equipada.</span>'}
        </div>
      </div>

      <!-- Bancada de Engaste de Habilidade Especial (SA) -->
      <div class="l2-workshop-altar">
        <h4 class="l2-workshop-title">🗡️ Bigorna de Engaste de Habilidade Especial (SA)</h4>
        
        <div style="display:flex; align-items:center; gap:12px; background:rgba(8,11,16,0.85); border:1px solid rgba(212,167,68,0.2); border-radius:6px; padding:10px 14px; margin-bottom:12px; flex-wrap:wrap;">
          <div class="l2-anvil-slot">
            ${wpnDef ? getItemIcon(wpnDef) : '⚔️'}
          </div>
          <div style="flex:1; min-width:200px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:13px; font-weight:700; color:#ffd877; font-family:'Cinzel',serif;">${wpnDef ? (selectedWpn.name || wpnDef.name) : 'Nenhuma Arma Selecionada'}</span>
              <span class="l2-stat-pill" style="font-size:10px; color:#fde047;">${gating.label}</span>
              <span style="font-size:10px; color:#94a3b8;">${selectedWpn?.equipSlotLabel || ''}</span>
            </div>
            <div style="font-size:11px; color:#94a3b8; margin-top:3px;">
              ${selectedWpn?.soulCrystal
                ? `<span style="color:#34d399; font-weight:bold;">[SA Ativo: ${selectedWpn.soulCrystal.name} (Lv.${selectedWpn.soulCrystal.level || 1})]</span> <span style="color:#a7f3d0;">${selectedWpn.soulCrystal.desc}</span>`
                : 'Nenhuma Habilidade Especial engastada nesta arma.'}
            </div>
            <div style="font-size:10px; color:#cbd5e1; margin-top:4px;">
              Requisito de Nível: <strong style="color:${isLvlReady ? '#34d399' : '#f87171'};">Lv. ${gating.minLevel}+</strong> | Taxa de Engaste: <strong style="color:#fde047;">${gating.adenaCost.toLocaleString()} Adena</strong>
            </div>
          </div>
          ${selectedWpn?.soulCrystal ? `
            <button onclick="window.removeSAAction('${selectedWpn.uid}')" class="inv-batch-btn" style="padding:6px 10px; font-size:10px; color:#fca5a5; border-color:#ef4444; font-weight:700;">
              🧹 Extrair SA (20.000 Adena)
            </button>
          ` : ''}
        </div>

        ${!isLvlReady ? `
          <div style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); border-radius:6px; padding:8px 12px; margin-bottom:12px; font-size:11px; color:#fca5a5;">
            🔒 Nível Insuficiente: Seu personagem é Nível ${playerLvl}. Itens de ${gating.label} requerem Nível ${gating.minLevel} para receber Special Ability (SA).
          </div>
        ` : ''}

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px;">
          <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:6px; padding:10px;">
            <strong style="color:#fca5a5; font-size:12px; font-family:'Cinzel',serif;">🔴 Runa Rubra (Focus / Might)</strong>
            <div style="font-size:10px; color:#94a3b8; margin:3px 0 8px 0;">Crítico e Ataque Físico.</div>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('red', 'focus', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; margin-bottom:4px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Focus (+Crit)</button>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('red', 'might', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Might (+P.Atk)</button>
          </div>

          <div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.25); border-radius:6px; padding:10px;">
            <strong style="color:#86efac; font-size:12px; font-family:'Cinzel',serif;">🟢 Runa Esmeralda (Acumen / Health)</strong>
            <div style="font-size:10px; color:#94a3b8; margin:3px 0 8px 0;">Velocidade de Conjuração e Vida.</div>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('green', 'acumen', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; margin-bottom:4px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Acumen (+CastSpd)</button>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('green', 'health', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Health (+Max HP)</button>
          </div>

          <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:6px; padding:10px;">
            <strong style="color:#7dd3fc; font-size:12px; font-family:'Cinzel',serif;">🔵 Runa Safira (Empower / Guidance)</strong>
            <div style="font-size:10px; color:#94a3b8; margin:3px 0 8px 0;">Poder Mágico e Precisão.</div>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('blue', 'empower', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; margin-bottom:4px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Empower (+M.Atk)</button>
            <button ${!isLvlReady || !selectedWpn ? 'disabled' : ''} onclick="window.applySAAction('blue', 'guidance', '${selectedWpn?.uid}')" class="inv-batch-btn" style="width:100%; padding:6px; font-size:11px; font-weight:700; ${!isLvlReady ? 'opacity:0.4; cursor:not-allowed;' : ''}">Engastar Guidance (+Precisão)</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderForgeMasterwork(container, state) {
  const inv = state.inventory || [];
  const sealedItems = inv.filter(i => i.sealed || getItemDef(i.itemId)?.sealed);
  const foundationItems = inv.filter(i => i.foundation && !i.isMasterwork);
  const weapons = inv.filter(i => (getItemDef(i.itemId)?.slot || i.slot) === 'weapon');

  let sealedHtml = sealedItems.map(item => {
    const def = getItemDef(item.itemId) || item;
    return `
      <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(212,167,68,0.25); border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="l2-blueprint-socket" style="width:38px; height:38px; min-width:38px;">${getItemIcon(def)}</div>
          <div>
            <strong style="color:#ffd877; font-family:'Cinzel',serif; font-size:13px;">🔒 ${item.name || item.itemId}</strong>
            <div style="font-size:10px; color:#94a3b8;">Taxa do Ferreiro: 25.000 Adena</div>
          </div>
        </div>
        <button onclick="window.unsealItemAction('${item.uid}')" class="inv-batch-btn" style="padding:6px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; color:#ffd877; border-color:#d4a744;">
          🔓 Quebrar Selo
        </button>
      </div>
    `;
  }).join('');

  let foundationHtml = foundationItems.map(item => {
    const def = getItemDef(item.itemId) || item;
    return `
      <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(168,85,247,0.3); border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="l2-blueprint-socket" style="width:38px; height:38px; min-width:38px; border-color:#c084fc;">${getItemIcon(def)}</div>
          <div>
            <strong style="color:#d8b4fe; font-family:'Cinzel',serif; font-size:13px;">✨ ${item.name || item.itemId} (Alma Ancestral)</strong>
            <div style="font-size:10px; color:#94a3b8;">Custo de Polimento: 100.000 Adena</div>
          </div>
        </div>
        <button onclick="window.polishMasterworkAction('${item.uid}')" class="inv-batch-btn" style="padding:6px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; color:#e9d5ff; border-color:#a855f7;">
          👑 Polir p/ Masterwork
        </button>
      </div>
    `;
  }).join('');

  const eligibleWeapons = weapons.filter(w => !w.equipped);
  const allItems = D()?.ALL_ITEMS || {};

  let swapHtml = eligibleWeapons.map(w => {
    const curDef = getItemDef(w.itemId) || w;
    const gCode = getItemGradeCode(curDef);
    const gInfo = getItemGrade(curDef);
    const wName = curDef.name || w.name || w.itemId;
    const enchantText = (w.enchant && w.enchant > 0) ? `+${w.enchant} ` : '';

    const targets = Object.values(allItems).filter(target => {
      if (target.slot !== 'weapon') return false;
      if (getItemGradeCode(target) !== gCode) return false;
      const tid = target.id || target.itemId;
      const curId = curDef.id || w.itemId;
      return tid !== curId && target.name !== curDef.name;
    });

    const uniqueTargets = [];
    const seen = new Set();
    for (const t of targets) {
      const tid = t.id || t.itemId;
      if (tid && !seen.has(tid) && !seen.has(t.name)) {
        seen.add(tid);
        seen.add(t.name);
        uniqueTargets.push(t);
      }
    }
    uniqueTargets.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    const options = uniqueTargets.map(t => `<option value="${t.id || t.itemId}">${t.name}</option>`).join('');

    return `
      <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(59,130,246,0.3); border-radius:6px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="l2-blueprint-socket" style="width:38px; height:38px; min-width:38px; border-color:${gInfo.color};">${getItemIcon(curDef)}</div>
          <div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:9px; padding:1px 5px; border-radius:3px; background:${gInfo.color || '#888'}22; border:1px solid ${gInfo.color || '#888'}66; color:${gInfo.color || '#fff'}; font-weight:bold;">${gInfo.label || gCode.toUpperCase()}</span>
              <strong style="color:#93c5fd; font-family:'Cinzel',serif; font-size:13px;">${enchantText}${wName}</strong>
            </div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Custo de Troca: 150.000 Adena</div>
          </div>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          ${uniqueTargets.length > 0 ? `
            <select id="swap-select-${w.uid}" style="background:#0c1017; border:1px solid rgba(59,130,246,0.4); color:#ece4d3; padding:5px 8px; border-radius:4px; font-size:11px; max-width:180px;">
              ${options}
            </select>
            <button onclick="const sel = document.getElementById('swap-select-${w.uid}'); if (sel && sel.value) { window.swapWeaponSameGradeAction('${w.uid}', sel.value); }" class="inv-batch-btn" style="padding:5px 12px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; color:#93c5fd; border-color:#3b82f6;">
              🔄 Trocar
            </button>
          ` : `
            <span style="font-size:10px; color:#64748b;">Sem armas deste grau</span>
          `}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="l2-workshop-panel">
      <!-- Banner Pushkin -->
      <div class="l2-workshop-altar">
        <h3 class="l2-workshop-title">⚒️ Bigorna do Ferreiro Imperial Pushkin (Giran)</h3>
        <p class="l2-workshop-subtitle">
          Mestre da metalurgia de Aden: quebra de selos de armaduras B/A/S, polimento de peças Foundation em Masterwork e troca de armas de mesmo grau.
        </p>
      </div>

      <!-- Unseal Section -->
      <div style="margin-bottom:14px;">
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">🔒 Deslacrar Equipamentos Selados (Unseal)</h4>
        ${sealedHtml || '<div style="font-size:11px; color:#64748b; background:rgba(8,11,16,0.85); padding:10px 12px; border-radius:6px; border:1px dashed rgba(255,255,255,0.1);">Nenhum equipamento selado na mochila.</div>'}
      </div>

      <!-- Masterwork Section -->
      <div style="margin-bottom:14px;">
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">👑 Polimento Masterwork (Peças Foundation)</h4>
        ${foundationHtml || '<div style="font-size:11px; color:#64748b; background:rgba(8,11,16,0.85); padding:10px 12px; border-radius:6px; border:1px dashed rgba(255,255,255,0.1);">Nenhuma peça Foundation na mochila. Forje itens na aba Criação Geral para obter peças Foundation!</div>'}
      </div>

      <!-- Blacksmith Weapon Swap Section -->
      <div>
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">🔄 Troca de Armas de Mesmo Grau (Blacksmith Swap)</h4>
        ${swapHtml || '<div style="font-size:11px; color:#64748b; background:rgba(8,11,16,0.85); padding:10px 12px; border-radius:6px; border:1px dashed rgba(255,255,255,0.1);">Nenhuma arma desequipada na mochila disponível para troca.</div>'}
      </div>
    </div>
  `;
}

export function renderForgeTattoos(container, state) {
  const dyes = state.dyeSymbols || [null, null, null];

  let slotsHtml = dyes.map((d, idx) => {
    if (d) {
      const canUpgrade = d.stage < 5;
      const plusStat = Object.keys(d.plus || {})[0] || 'str';
      const plusVal = d.plus ? d.plus[plusStat] : 1;
      const minusStat = Object.keys(d.minus || {})[0] || 'con';
      const minusVal = d.minus ? d.minus[minusStat] : 1;

      return `
        <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(168,85,247,0.4); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <strong style="color:#d8b4fe; font-size:12px; font-family:'Cinzel',serif;">Nó ${idx + 1}: ${d.name} (Nv. ${d.stage}/5)</strong>
            <div class="l2-stat-chip-row">
              <span class="l2-stat-chip-pos">+${plusVal} ${plusStat.toUpperCase()}</span>
              <span class="l2-stat-chip-neg">-${minusVal} ${minusStat.toUpperCase()}</span>
            </div>
          </div>
          <div style="display:flex; gap:5px;">
            ${canUpgrade ? `
              <button onclick="window.upgradeDyeAction(${idx})" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#34d399; border-color:#10b981; font-weight:bold;">
                ⚡ Nv. ${d.stage + 1}
              </button>
            ` : '<span style="font-size:10px; color:#ffd877; font-weight:bold; padding:2px 6px;">👑 Máximo</span>'}
            <button onclick="window.removeDyeAction(${idx})" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#fca5a5; border-color:#ef4444;">
              🗑️
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="background:rgba(8,11,16,0.6); border:1px dashed rgba(212,167,68,0.25); border-radius:6px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="color:#94a3b8; font-size:12px; font-family:'Cinzel',serif;">Nó ${idx + 1}: [Vazio]</span>
          <span style="font-size:10px; color:#64748b;">Grave uma tinta sagrada abaixo</span>
        </div>
      `;
    }
  }).join('');

  const catalog = [
    { key: 'dye_str_con', name: 'Dye do Guerreiro (+STR / -CON)', stat: 'str' },
    { key: 'dye_dex_con', name: 'Dye do Assassino (+DEX / -CON)', stat: 'dex' },
    { key: 'dye_con_str', name: 'Dye do Guardião (+CON / -STR)', stat: 'con' },
    { key: 'dye_wit_men', name: 'Dye da Conjuração (+WIT / -MEN)', stat: 'wit' },
    { key: 'dye_int_men', name: 'Dye do Mago (+INT / -MEN)', stat: 'int' },
    { key: 'dye_men_int', name: 'Dye da Sabedoria (+MEN / -INT)', stat: 'men' }
  ];

  const catalogHtml = catalog.map(c => `
    <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(212,167,68,0.2); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong style="color:#f5df93; font-size:12px; font-family:'Cinzel',serif;">${c.name}</strong>
        <div style="font-size:10px; color:#94a3b8;">Estágio 1 (+1 / -1) · Custo: 10.000 Adena</div>
      </div>
      <button onclick="window.applyInitialDyeAction('${c.key}')" class="inv-batch-btn" style="padding:5px 10px; font-size:10px; font-weight:bold; color:#d8b4fe; border-color:#a855f7;">
        🖊️ Gravar
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="l2-workshop-panel">
      <div class="l2-workshop-altar">
        <h3 class="l2-workshop-title">🖊️ Altar de Tatuagens Sagradas (Symbol Maker)</h3>
        <p class="l2-workshop-subtitle">
          Grave até 3 símbolos rúnicos de Henna. Inicie no Estágio 1 (+1/-1) e aprimore até o Estágio 5 (+5/-5). Teto estrito de +5 por atributo líquido!
        </p>
      </div>

      <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">✨ Nós Rúnicos do Herói (Máx 3)</h4>
      <div style="margin-bottom:14px;">${slotsHtml}</div>

      <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">🛍️ Tintas Sagradas de Aden</h4>
      <div style="display:flex; flex-direction:column; gap:6px;">${catalogHtml}</div>
    </div>
  `;
}

export function renderForgeElemental(container, state) {
  const inv = state.inventory || [];
  window._elementalForgeCategory = window._elementalForgeCategory || 'weapons';

  const isWeaponsTab = window._elementalForgeCategory === 'weapons';
  const equips = inv.filter(i => {
    const s = getItemDef(i.itemId)?.slot || i.slot;
    if (isWeaponsTab) return s === 'weapon' || s === 'weapon2';
    return ['armor', 'chest', 'legs', 'head', 'helmet', 'gloves', 'boots', 'shield'].includes(s);
  });

  const playerLvl = Number(state.level || 1);

  let equipsHtml = equips.map(item => {
    const elem = item.elementalAttribute || { element: 'none', val: 0 };
    const def = getItemDef(item.itemId) || item;
    const gating = getElementalGating(item);
    const isWpn = gating.isWeapon;
    const cap = gating.maxCap;
    const isLvlReady = playerLvl >= gating.minLevel;
    const isAtCap = elem.val >= cap && cap > 0;
    const isOverCap = elem.val > cap && cap > 0; // Regra 17.4
    const elemColor = ELEMENT_DEFINITIONS[elem.element]?.color || '#38bdf8';
    const elemName = ELEMENT_DEFINITIONS[elem.element]?.name || 'Nenhum';
    const elemIcon = ELEMENT_DEFINITIONS[elem.element]?.icon || '⚪';

    let equippedBadge = '';
    if (state.equipment?.weapon === item.uid) {
      equippedBadge = '<span style="color:#ffd877; font-size:10px; margin-left:6px; font-weight:bold; background:rgba(212,167,68,0.2); padding:2px 6px; border-radius:4px;">[⚔️ Slot 1]</span>';
    } else if (state.equipment?.weapon2 === item.uid) {
      equippedBadge = '<span style="color:#c084fc; font-size:10px; margin-left:6px; font-weight:bold; background:rgba(192,132,252,0.2); padding:2px 6px; border-radius:4px;">[🗡️ Slot 2]</span>';
    } else if (item.equipped) {
      equippedBadge = '<span style="color:#38bdf8; font-size:10px; margin-left:6px; font-weight:bold; background:rgba(56,189,248,0.2); padding:2px 6px; border-radius:4px;">[🛡️ Equipado]</span>';
    }

    const pct = (cap > 0) ? Math.min(100, Math.floor((elem.val / cap) * 100)) : 0;
    const stepLabel = isWpn ? '+20' : '+6';

    return `
      <div style="background:rgba(18,24,34,0.9); border:1px solid rgba(212,167,68,0.25); border-radius:6px; padding:12px; margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="l2-blueprint-socket" style="width:42px; height:42px; min-width:42px;">${getItemIcon(def)}</div>
            <div>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                <strong style="color:#ffd877; font-size:13px; font-family:'Cinzel',serif;">${item.name || def.name}</strong>
                <span class="l2-stat-pill" style="font-size:10px; color:#fde047;">${gating.label}</span>
                ${equippedBadge}
              </div>
              <div style="font-size:11px; color:#94a3b8; margin-top:2px;">
                Atributo: <strong style="color:${elemColor};">${elemIcon} ${elemName.toUpperCase()} +${elem.val}</strong> / <span style="color:#e2e8f0;">+${cap}</span>
                ${isOverCap ? '<span style="color:#f59e0b; font-size:10px; margin-left:4px; font-weight:bold;">(⚠️ Teto Excedido Preservado)</span>' : ''}
              </div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; color:#94a3b8;">Requisito: <strong style="color:${isLvlReady ? '#34d399' : '#f87171'};">Lv. ${gating.minLevel}+</strong></div>
            <div style="font-size:10px; color:#cbd5e1;">Taxa: <strong style="color:#fde047;">${gating.stoneCost.toLocaleString()} Adena</strong></div>
          </div>
        </div>

        <!-- Barra de Progresso Elemental em Relação ao Teto -->
        <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); margin-bottom:10px;">
          <div style="height:100%; width:${pct}%; background:${elem.val > 0 ? elemColor : 'transparent'};"></div>
        </div>

        ${!gating.eligible ? `
          <div style="font-size:11px; color:#f87171; background:rgba(239,68,68,0.1); padding:6px 10px; border-radius:4px;">
            ⚠️ Este item não suporta infusão elemental. Requer equipamento de Grau C, B, A ou S.
          </div>
        ` : (!isLvlReady ? `
          <div style="font-size:11px; color:#f87171; background:rgba(239,68,68,0.1); padding:6px 10px; border-radius:4px;">
            🔒 Nível insuficiente! Requer Nível ${gating.minLevel}+ para imbuir atributos em itens de ${gating.label}.
          </div>
        ` : (isAtCap ? `
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(234,179,8,0.12); padding:6px 10px; border-radius:4px;">
            <span style="font-size:11px; color:#fde047; font-weight:bold;">👑 Teto Elemental Atingido (+${cap})</span>
            <button onclick="window.removeElementalAction('${item.uid}')" class="inv-batch-btn" style="padding:3px 8px; font-size:10px; color:#fca5a5; border-color:#ef4444;">
              🌊 Purificar
            </button>
          </div>
        ` : `
          <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button onclick="window.applyElementalAction('${item.uid}', 'fire')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#fca5a5; border-color:#ef4444;">🔥 Fogo (${stepLabel})</button>
              <button onclick="window.applyElementalAction('${item.uid}', 'water')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#93c5fd; border-color:#3b82f6;">💧 Água (${stepLabel})</button>
              <button onclick="window.applyElementalAction('${item.uid}', 'wind')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#86efac; border-color:#22c55e;">🌪️ Vento (${stepLabel})</button>
              <button onclick="window.applyElementalAction('${item.uid}', 'earth')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#fde68a; border-color:#d97706;">🌍 Terra (${stepLabel})</button>
              <button onclick="window.applyElementalAction('${item.uid}', 'holy')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#fef08a; border-color:#eab308;">✨ Sagrado (${stepLabel})</button>
              <button onclick="window.applyElementalAction('${item.uid}', 'dark')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#d8b4fe; border-color:#a855f7;">🌑 Trevas (${stepLabel})</button>
            </div>
            ${elem.val > 0 ? `
              <button onclick="window.removeElementalAction('${item.uid}')" class="inv-batch-btn" style="padding:4px 8px; font-size:10px; color:#fca5a5; border-color:rgba(239,68,68,0.5);">
                🌊 Purificar
              </button>
            ` : ''}
          </div>
        `))}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="l2-workshop-panel">
      <!-- Elemental Guide & Roda Canônica -->
      <div class="l2-workshop-altar">
        <h3 class="l2-workshop-title">🔥 Altar dos 6 Elementos Ancestrais</h3>
        <p class="l2-workshop-subtitle">
          Incuta atributos em armas (até +300 no Grau S) e armaduras (até +120 no Grau S).
          Ataques com elemento oposto causam <strong>+20% de dano amplificado</strong> e armas Sagradas causam <strong>+30% contra Mortos-Vivos/Demônios</strong>!
        </p>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <span class="l2-stat-pill">🔥 Fogo ↔ Água 💧 (+20%)</span>
          <span class="l2-stat-pill">🌪️ Vento ↔ Terra 🌍 (+20%)</span>
          <span class="l2-stat-pill">✨ Sagrado ↔ Trevas 🌑 (+30% vs Undead)</span>
        </div>
        <div style="font-size:10px; color:#94a3b8; margin-top:8px; display:flex; gap:12px; flex-wrap:wrap;">
          <span>• <strong>Grau C/B:</strong> Lv.40+ (Teto +60)</span>
          <span>• <strong>Grau A:</strong> Lv.61+ (Teto +150)</span>
          <span>• <strong>Grau S:</strong> Lv.76+ (Teto +300 Arma / +120 Armadura)</span>
        </div>
      </div>

      <!-- Filtro de Categorias -->
      <div style="display:flex; gap:8px; margin-bottom:12px;">
        <button onclick="window._elementalForgeCategory='weapons'; renderForgeElemental(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.getGameState ? window.getGameState() : null);"
          class="inv-batch-btn"
          style="padding:6px 14px; font-family:'Cinzel',serif; font-weight:700; font-size:11px; ${isWeaponsTab ? 'background:linear-gradient(180deg,#ea580c,#c2410c); color:#fff; border-color:#fdba74;' : 'background:rgba(255,255,255,0.05); color:#fdba74; border-color:rgba(234,88,12,0.3);'}">
          ⚔️ Armas (Primária & Arsenal Slot 2)
        </button>
        <button onclick="window._elementalForgeCategory='armors'; renderForgeElemental(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.getGameState ? window.getGameState() : null);"
          class="inv-batch-btn"
          style="padding:6px 14px; font-family:'Cinzel',serif; font-weight:700; font-size:11px; ${!isWeaponsTab ? 'background:linear-gradient(180deg,#2563eb,#1d4ed8); color:#fff; border-color:#93c5fd;' : 'background:rgba(255,255,255,0.05); color:#93c5fd; border-color:rgba(37,99,235,0.3);'}">
          🛡️ Armaduras & Escudos
        </button>
      </div>

      <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f5df93; font-size:13px; font-weight:700;">
        ${isWeaponsTab ? '🗡️ Armas Disponíveis' : '🛡️ Armaduras e Escudos Disponíveis'}
      </h4>
      ${equipsHtml || `<div style="font-size:11px; color:#64748b; background:rgba(8,11,16,0.85); padding:10px 12px; border-radius:6px;">Nenhuma ${isWeaponsTab ? 'arma' : 'armadura ou escudo'} encontrada na mochila ou equipamento.</div>`}
    </div>
  `;
}

export function renderForgeBelts(container, state) {
  return renderForgeSynthesis(container, state);
}

export function renderForgeSynthesis(container, state) {
  const inv = state.inventory || [];
  const forgeLvl = Number(state.craftLevel) || 1;
  const isMasterSmith = forgeLvl >= 10;

  // Filtrar itens elegíveis da mochila para Síntese
  const eligibleItems = inv.filter(i => {
    const s = getItemDef(i.itemId)?.slot || i.slot || '';
    const id = (i.itemId || i.id || '').toLowerCase();
    const isGear = ['weapon', 'armor', 'chest', 'legs', 'head', 'helmet', 'gloves', 'boots', 'shield'].includes(s);
    const isArtifact = s === 'belt' || s === 'cloak' || id.includes('belt') || id.includes('talisman') || id.includes('jewel') || id.includes('ruby') || id.includes('sapphire') || id.includes('emerald') || id.includes('opal') || id.includes('diamond') || id.includes('agathion') || id.includes('brooch') || id.includes('bracelet');
    return isGear || isArtifact;
  });

  // Agrupar itens com cópias duplicadas disponíveis
  const itemsWithDupes = eligibleItems.map(item => {
    const dupes = SynthesisService.getCompatibleIngredients(state, item);
    return { item, dupes, hasDupe: dupes.length > 0 };
  });

  // Auto-selecionar o primeiro com duplicata se nada foi selecionado
  if (!window._synthesisTargetUid || !eligibleItems.some(i => i.uid === window._synthesisTargetUid)) {
    const firstWithDupe = itemsWithDupes.find(x => x.hasDupe);
    window._synthesisTargetUid = firstWithDupe ? firstWithDupe.item.uid : (eligibleItems[0]?.uid || null);
  }

  const selectedTargetItem = inv.find(i => i.uid === window._synthesisTargetUid) || null;
  const compatibleIngredients = selectedTargetItem ? SynthesisService.getCompatibleIngredients(state, selectedTargetItem) : [];

  if (!window._synthesisIngredientUid || !compatibleIngredients.some(i => i.uid === window._synthesisIngredientUid)) {
    window._synthesisIngredientUid = compatibleIngredients[0]?.uid || null;
  }

  const selectedIngredientItem = inv.find(i => i.uid === window._synthesisIngredientUid) || null;

  const curRank = selectedTargetItem ? SynthesisService.getItemSynthesisRank(selectedTargetItem) : 0;
  const targetRank = curRank + 1;
  const cfg = SYNTHESIS_CONFIG[targetRank] || SYNTHESIS_CONFIG[1];

  const targetDef = selectedTargetItem ? getItemDef(selectedTargetItem.itemId || selectedTargetItem.id) : null;
  const targetGrade = getItemGrade(targetDef?.req?.level || 1);
  const reqGradeForge = SynthesisService.getReqForgeLevelForGrade(targetGrade);
  const finalReqForge = Math.max(cfg.reqForgeLvl, reqGradeForge);
  const isForgeOk = forgeLvl >= finalReqForge;

  const baseRatePct = Math.round((cfg.successRate + (isMasterSmith ? 0.10 : 0)) * 100);
  const costAdena = cfg.costAdena;
  const canAfford = (state.gold || 0) >= costAdena;
  const isMaxRank = curRank >= 5;
  const canSynthesize = selectedTargetItem && selectedIngredientItem && isForgeOk && canAfford && !isMaxRank;

  window.synthesisSelectAllPairs = () => {
    const pair = itemsWithDupes.find(x => x.hasDupe);
    if (pair) {
      window._synthesisTargetUid = pair.item.uid;
      window._synthesisIngredientUid = pair.dupes[0].uid;
      renderForgeSynthesis(container, state);
    }
  };

  // Montar 49 slots da grade 7x7
  const TOTAL_GRID_SLOTS = 49;
  let materialsGridHtml = '';
  for (let idx = 0; idx < TOTAL_GRID_SLOTS; idx++) {
    const itemEntry = eligibleItems[idx];
    if (itemEntry) {
      const def = getItemDef(itemEntry.itemId || itemEntry.id);
      const isTarget = itemEntry.uid === window._synthesisTargetUid;
      const isIng = itemEntry.uid === window._synthesisIngredientUid;
      const rank = SynthesisService.getItemSynthesisRank(itemEntry);

      materialsGridHtml += `
        <div
          class="l2comp-mat-slot ${isTarget ? 'active-selected' : ''}"
          style="${isIng ? 'border-color:#34d399;' : ''}"
          onclick="
            if (window._synthesisTargetUid === '${itemEntry.uid}') {
              window._synthesisTargetUid = null;
              window._synthesisIngredientUid = null;
            } else if (!window._synthesisTargetUid) {
              window._synthesisTargetUid = '${itemEntry.uid}';
              window._synthesisIngredientUid = null;
            } else if (window._synthesisTargetUid !== '${itemEntry.uid}') {
              window._synthesisIngredientUid = '${itemEntry.uid}';
            }
            renderForgeSynthesis(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.state);
          "
          title="${def?.name || itemEntry.name || itemEntry.itemId} (Clique para selecionar)"
        >
          <div class="equip-icon" style="font-size:22px;">${getItemIcon(def || itemEntry)}</div>
          ${itemEntry.count && itemEntry.count > 1 ? `<span class="l2comp-mat-count">${itemEntry.count}</span>` : ''}
          ${rank > 0 ? `<span class="l2comp-mat-lvl">Lv.${rank}</span>` : ''}
        </div>
      `;
    } else {
      materialsGridHtml += `<div class="l2comp-mat-slot"></div>`;
    }
  }

  container.innerHTML = `
    <div class="l2comp-container">
      <!-- Coluna 1: Altar de Síntese (Imagem 2) -->
      <div class="l2comp-panel">
        <div class="l2comp-header">
          <div class="l2comp-header-title">Compounding</div>
          <div class="l2comp-header-controls">
            <button class="l2comp-icon-btn" title="Ajuda sobre Síntese">?</button>
            <button class="l2comp-icon-btn close" onclick="_forgeViewMode='dialogue'; window.updateCraftUI && window.updateCraftUI(window.state);" title="Fechar Síntese">✕</button>
          </div>
        </div>

        <div class="l2comp-subtitle">Common compounding</div>

        <!-- Círculo Arcano Central com Dual Anvil Slots e Arcos Elétricos -->
        <div class="l2comp-stage">
          <div class="l2comp-arcane-ring"></div>
          <div class="l2comp-arcane-ring-inner"></div>
          <div class="l2comp-vortex-center"></div>
          ${selectedTargetItem && selectedIngredientItem ? '<div class="l2comp-lightning"></div>' : ''}

          <div class="l2comp-slots-row">
            <!-- Slot 1: Base Target Item -->
            <div class="l2comp-slot-wrap">
              <div class="l2comp-slot-pointer">▼</div>
              <div class="l2comp-anvil-slot ${!selectedTargetItem ? 'empty' : ''}" id="comp-slot-base" title="${targetDef?.name || 'Selecione o Item Base na grade de materiais'}">
                ${selectedTargetItem ? `<div class="equip-icon" style="font-size:28px;">${getItemIcon(targetDef || selectedTargetItem)}</div>` : ''}
              </div>
            </div>

            <!-- Slot 2: Catalyst/Sacrificial Item -->
            <div class="l2comp-slot-wrap">
              <div style="height:15px;"></div>
              <div class="l2comp-anvil-slot ${!selectedIngredientItem ? 'empty' : ''}" id="comp-slot-ingredient" title="${selectedIngredientItem ? (targetDef?.name || 'Item de sacrifício selecionado') : 'Selecione a duplicata para sacrifício'}">
                ${selectedIngredientItem ? `<div class="equip-icon" style="font-size:28px;">${getItemIcon(targetDef || selectedIngredientItem)}</div>` : ''}
              </div>
            </div>
          </div>

          <div class="l2comp-status-text">
            ${!selectedTargetItem ? 'Select items for compounding.' : !selectedIngredientItem ? 'Select a duplicate item for compounding.' : `Progress: Rank ${curRank} ➔ Rank ${targetRank} (${baseRatePct}% Success Rate)`}
          </div>
        </div>

        <!-- Barra de Progresso Dourada de Taxa de Sucesso -->
        <div class="l2comp-progress-wrap">
          <div class="l2comp-progress-track">
            <div class="l2comp-progress-fill" style="width:${selectedTargetItem && selectedIngredientItem ? baseRatePct : 0}%;"></div>
          </div>
        </div>

        <!-- Faixa de Autocompounding -->
        <div class="l2comp-auto-bar">
          <button class="l2comp-auto-btn" id="comp-auto-toggle-btn" onclick="window.synthesisSelectAllPairs && window.synthesisSelectAllPairs();">
            <span>🔄</span> Autocompounding
          </button>
          <button class="l2comp-reset-btn" onclick="window._synthesisTargetUid=null; window._synthesisIngredientUid=null; renderForgeSynthesis(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.state);">Reset</button>
        </div>

        <!-- Rodapé com Fee, Checkbox e Botões de Ação -->
        <div class="l2comp-bottom-area">
          <div class="l2comp-fee-row">
            <span class="l2comp-fee-label">Fee</span>
            <div class="l2comp-fee-val-box">
              <span>🪙</span>
              <span>${selectedTargetItem ? costAdena.toLocaleString() : '0'}</span>
            </div>
          </div>

          <div class="l2comp-actions-row">
            <label class="l2comp-checkbox-wrap">
              <input type="checkbox" id="comp-no-vfx" ${window._synthesisNoVfx ? 'checked' : ''} onchange="window._synthesisNoVfx=this.checked;" />
              <span>No visual effect</span>
            </label>
            <div class="l2comp-btn-group">
              <button
                class="l2comp-btn primary"
                ${!canSynthesize ? 'disabled' : ''}
                onclick="window.executeSynthesisAction('${selectedTargetItem ? selectedTargetItem.uid : ''}', '${selectedIngredientItem ? selectedIngredientItem.uid : ''}')"
              >
                Compound
              </button>
              <button
                class="l2comp-btn"
                onclick="window._synthesisTargetUid=null; window._synthesisIngredientUid=null; renderForgeSynthesis(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.state);"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Painel de Materiais (Grade 7x7) -->
      <div class="l2comp-panel">
        <div class="l2comp-header">
          <div class="l2comp-header-title">
            <span style="font-size:15px;">🎒</span> Materials (${eligibleItems.length})
          </div>
          <button class="l2comp-icon-btn" title="Itens elegíveis para Síntese na mochila">?</button>
        </div>

        <div class="l2comp-materials-grid">
          ${materialsGridHtml}
        </div>

        <div style="padding: 10px;">
          <button class="l2comp-select-all-btn" onclick="window.synthesisSelectAllPairs && window.synthesisSelectAllPairs();">
            <span style="color:#34d399; font-size:14px;">🔄</span> Select all
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderForgeLifestones(container, state) {
  const inv = state.inventory || [];
  const weapons = inv.filter(i => {
    const s = getItemDef(i.itemId)?.slot || i.slot;
    return s === 'weapon';
  });

  // Auto-selecionar a primeira arma se nenhuma estiver selecionada
  if (!window._enhanceTargetUid || !weapons.some(w => w.uid === window._enhanceTargetUid)) {
    window._enhanceTargetUid = weapons[0]?.uid || null;
  }

  const selectedWeapon = weapons.find(w => w.uid === window._enhanceTargetUid) || null;
  const def = selectedWeapon ? (getItemDef(selectedWeapon.itemId) || selectedWeapon) : null;
  const aug = selectedWeapon?.augmentation || null;

  // 49 slots para a grade 7x7 de materiais / equipamentos
  const TOTAL_GRID_SLOTS = 49;
  let materialsGridHtml = '';
  for (let idx = 0; idx < TOTAL_GRID_SLOTS; idx++) {
    const w = weapons[idx];
    if (w) {
      const itemDef = getItemDef(w.itemId) || w;
      const isSelected = w.uid === window._enhanceTargetUid;
      materialsGridHtml += `
        <div
          class="l2comp-mat-slot ${isSelected ? 'active-selected' : ''}"
          onclick="
            window._enhanceTargetUid = '${w.uid}';
            renderForgeLifestones(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.state);
          "
          title="${w.name || w.itemId} ${w.enchant ? `+${w.enchant}` : ''} ${w.equipped ? '[Equipada]' : ''}"
        >
          <div class="equip-icon" style="font-size:24px;">${getItemIcon(itemDef)}</div>
          ${w.enchant ? `<span class="l2comp-mat-lvl">+${w.enchant}</span>` : ''}
          ${w.equipped ? '<span style="position:absolute; top:2px; left:2px; font-size:8px; color:#38bdf8; font-weight:bold;">EQ</span>' : ''}
        </div>
      `;
    } else {
      materialsGridHtml += `<div class="l2comp-mat-slot"></div>`;
    }
  }

  container.innerHTML = `
    <div class="l2enh-container">
      <!-- Coluna 1: Altar Triquetra de Aprimoramento / Augment (Imagem 3) -->
      <div class="l2comp-panel">
        <div class="l2comp-header">
          <div class="l2comp-header-title">Enhance Artifact / Equipment</div>
          <button class="l2comp-icon-btn close" onclick="_forgeViewMode='dialogue'; window.updateCraftUI && window.updateCraftUI(window.state);" title="Fechar Aprimoramento">✕</button>
        </div>

        <!-- Palco do Altar com Triquetra Celta em Pedra e Slots Catalisadores -->
        <div class="l2enh-stage">
          <svg class="l2enh-triquetra-bg" viewBox="0 0 100 100" fill="none" stroke="#d4a744" stroke-width="2.5">
            <path d="M50 14 A 32 32 0 0 1 78 62 A 32 32 0 0 1 22 62 A 32 32 0 0 1 50 14 Z" />
            <circle cx="50" cy="50" r="28" stroke="#d4a744" stroke-width="1.8" stroke-dasharray="4 2" />
          </svg>

          <!-- Slot Central: Equipamento / Artefato com Ponteiro Dourado -->
          <div class="l2comp-slot-wrap" style="position:relative; z-index:3;">
            <div class="l2comp-slot-pointer">▼</div>
            <div
              class="l2enh-center-slot"
              id="enh-center-slot"
              title="${def?.name || 'Selecione uma arma no painel de materiais à direita'}"
            >
              ${selectedWeapon ? `<div class="equip-icon" style="font-size:32px;">${getItemIcon(def)}</div>` : '<span style="font-size:26px; opacity:0.35;">🗡️</span>'}
            </div>
          </div>

          <!-- Catalisador 1 (Top-Left): Life Stone Top-Grade -->
          <div class="l2enh-catalyst-slot l2enh-cat-top-left" title="Catalisador Primário: Life Stone Top-Grade">
            <span style="font-size:22px;">💎</span>
          </div>

          <!-- Catalisador 2 (Top-Right): Gemstones -->
          <div class="l2enh-catalyst-slot l2enh-cat-top-right" title="Catalisador Secundário: Gemstones">
            <span style="font-size:22px;">🔮</span>
          </div>

          <!-- Catalisador 3 (Bottom): Essência Ancestral -->
          <div class="l2enh-catalyst-slot l2enh-cat-bottom" title="Catalisador Místico: Essência da Forja">
            <span style="font-size:22px;">✨</span>
          </div>

          <div class="l2comp-status-text">
            ${!selectedWeapon ? 'Add an item to upgrade.' : aug ? `Augment: +${aug.atkBonus || 0} P.Atk, +${aug.critBonus || 0} Crit ${aug.skill ? `[${aug.skill.name}]` : ''}` : `${def?.name || selectedWeapon.itemId} pronto para Despertar Life Stone`}
          </div>
        </div>

        <!-- Barra de Progresso Dourada -->
        <div class="l2comp-progress-wrap">
          <div class="l2comp-progress-track">
            <div class="l2comp-progress-fill" style="width:${selectedWeapon ? 100 : 0}%;"></div>
          </div>
        </div>

        <!-- Botões de Ação Inferiores (Imagem 3) -->
        <div class="l2comp-bottom-area">
          <div class="l2comp-actions-row">
            <button
              class="l2comp-btn"
              onclick="window._enhanceTargetUid=null; renderForgeLifestones(document.getElementById('craft-recipes-container') || document.getElementById('craft-list'), window.state);"
            >
              Reset
            </button>
            <div class="l2comp-btn-group">
              <button
                class="l2comp-btn primary"
                ${!selectedWeapon ? 'disabled' : ''}
                onclick="window.applyAugmentAction('${selectedWeapon?.uid}', 'top')"
              >
                Enhancement
              </button>
              ${aug ? `
                <button
                  class="l2comp-btn"
                  style="border-color:#ef4444; color:#fca5a5;"
                  onclick="window.removeAugmentAction('${selectedWeapon.uid}')"
                  title="Remover Augmentation"
                >
                  Cleanse
                </button>
              ` : ''}
              <button
                class="l2comp-btn"
                onclick="_forgeViewMode='dialogue'; window.updateCraftUI && window.updateCraftUI(window.state);"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Painel de Materiais / Equipamentos (Grade 7x7) -->
      <div class="l2comp-panel">
        <div class="l2comp-header">
          <div class="l2comp-header-title">
            <span style="font-size:15px;">🗡️</span> Artifact / Equipment (${weapons.length})
          </div>
          <button class="l2comp-icon-btn" title="Armas elegíveis para Encanto e Augment">?</button>
        </div>

        <div class="l2comp-materials-grid">
          ${materialsGridHtml}
        </div>
      </div>
    </div>
  `;
}

export function renderForgeRandomCraft(container, state, callbacks = {}) {
  updateImperialEconomyHeader(state);

  const rc = (state.randomCraft && typeof state.randomCraft === 'object') ? state.randomCraft : {};
  const points = Number(rc.points ?? state.randomCraftCharge ?? state.craftPoints ?? 0);
  const charges = Number(rc.charge ?? state.craftCharges ?? 0);
  const slots = (Array.isArray(rc.slots) && rc.slots.length > 0) ? rc.slots : (state.randomCraftSlots || []);
  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};

  let slotsHtml = '';
  if (slots.length > 0) {
    slotsHtml = `
      <div class="imp-rc-reel" id="imp-rc-reel">
        ${slots.map((s, idx) => {
          const def = allItems[s.itemId] || { name: s.itemId, slot: 'relic' };
          const gradeInfo = getItemGrade(def);
          const isSPlus = gradeInfo.code === 's' || gradeInfo.code === 'boss' || gradeInfo.code === 'frostlord';
          return `
            <div class="imp-rc-pedestal ${isSPlus ? 'is-splus' : ''}" data-rc-slot="${idx}">
              <div class="imp-rc-slot-number">Slot ${idx + 1}</div>
              <div class="imp-item-frame grade-${gradeInfo.code}" style="margin-top:8px;">
                ${getItemIcon(def)}
              </div>
              <div style="flex:1; display:flex; flex-direction:column; justify-content:center; gap:2px; width:100%;">
                <div style="font-weight:700; font-size:11px; color:#f5df93; font-family:'Cinzel',serif; min-height:28px; display:flex; align-items:center; justify-content:center; line-height:1.2;">
                  ${def.name} ${s.count > 1 ? `(${s.count}x)` : ''}
                </div>
                <div style="display:flex; align-items:center; justify-content:center; gap:4px;">
                  <span class="imp-item-grade-tag" style="background:${gradeInfo.color}; font-size:9px;">
                    ${gradeInfo.label}
                  </span>
                  ${isSPlus ? '<span style="color:#fde047; font-size:10px; font-weight:bold;">★ S+</span>' : ''}
                </div>
              </div>
              <div style="font-size:9px; color:#38bdf8; background:rgba(56,189,248,0.1); padding:2px 8px; border-radius:4px; border:1px solid rgba(56,189,248,0.25); font-family:'IBM Plex Mono',monospace;">
                Sorteio: 20%
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    slotsHtml = `
      <div style="background:rgba(8,11,16,0.85); border:1px dashed rgba(168,85,247,0.3); border-radius:8px; padding:24px; text-align:center; margin:16px 0;">
        <div style="font-size:32px; margin-bottom:8px;">🎲</div>
        <div style="font-size:14px; font-weight:bold; color:#e9d5ff; margin-bottom:4px; font-family:'Cinzel',serif;">Nenhum Slot Carregado</div>
        <div style="font-size:11px; color:#94a3b8; max-width:460px; margin:0 auto 14px auto;">
          Clique em Atualizar para invocar 5 novas relíquias da Forja Imperial!
        </div>
      </div>
    `;
  }

  const canSpin = charges >= 1;

  container.innerHTML = `
    <div class="l2-workshop-panel imp-forge-container">
      <!-- Banner -->
      <div class="imp-forge-altar">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h3 class="l2-workshop-title" style="margin:0; font-family:'Cinzel',serif; color:#f5df93; font-size:16px; font-weight:800; display:flex; align-items:center; gap:8px;">
              🎲 Roleta Imperial de Criação Anã (Random Craft)
            </h3>
            <p class="l2-workshop-subtitle" style="margin:4px 0 0 0; font-size:11px; color:#94a3b8;">
              Acumule 100 pontos para gerar 1 Carga Imperial. Ao girar a roleta, 1 dos 5 itens é forjado aleatoriamente (20% por slot)!
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px; font-weight:bold; color:#ffd877; font-family:'Cinzel',serif;">
              Cargas: <strong style="color:#22c55e; font-size:16px;">${charges}</strong>
            </div>
            <div style="font-size:10px; color:#94a3b8; font-family:'IBM Plex Mono',monospace;">
              Próxima: <strong style="color:#a855f7;">${points}/100 Pts</strong>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div style="width:100%; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; margin-top:12px; overflow:hidden; border:1px solid rgba(168,85,247,0.3);">
          <div style="height:100%; width:${Math.min(100, points)}%; background:linear-gradient(90deg,#a855f7,#ec4899); transition:width 0.4s;"></div>
        </div>
      </div>

      ${slotsHtml}

      <!-- Controles de Ação Canônicos -->
      <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap; margin-top:16px; padding-top:14px; border-top:1px solid rgba(212,167,68,0.2);">
        <button
          onclick="window.spinRandomCraftAction()"
          class="l2-forge-action-btn imp-btn-primary ${canSpin ? 'is-ready' : ''}"
          style="min-width:240px; font-size:12px; font-weight:bold; padding:9px 18px; ${canSpin ? 'background:linear-gradient(135deg,#7c3aed,#db2777); border-color:#f472b6; color:#fff;' : ''}"
          ${!canSpin ? 'disabled' : ''}
        >
          🎲 GIRAR ROLETA IMPERIAL ${canSpin ? `(${charges} Disponíveis)` : '(Requer 1 Carga)'}
        </button>

        <button
          onclick="window.refreshRandomCraftSlotsAction()"
          class="imp-forge-subtab-btn"
          style="min-width:180px; font-size:11px; padding:8px 12px; background:rgba(30,41,59,0.85); border:1px solid rgba(148,163,184,0.3); color:#cbd5e1;"
        >
          🔄 Atualizar Slots (50.000 Adena)
        </button>

        <button
          onclick="window.chargeRandomCraftWithAdenaAction()"
          class="imp-forge-subtab-btn"
          style="min-width:180px; font-size:11px; padding:8px 12px; background:rgba(180,83,9,0.25); border:1px solid rgba(245,158,11,0.4); color:#fde047;"
        >
          🪙 Comprar Carga (+20 Pts - 200k)
        </button>
      </div>
    </div>
  `;
}

/**
 * Exibe modal com as fontes territoriais e monstros de um determinado material.
 */
export function showDropLocatorModal(matId) {
  let modal = document.getElementById('drop-locator-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'drop-locator-modal';
    modal.className = 'modal-overlay active';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:999999; display:flex; align-items:center; justify-content:center; padding:15px;';
    document.body.appendChild(modal);
  }

  const gData = D();
  const eData = (typeof window !== 'undefined' && window.EchoData) ? window.EchoData : {};
  const allItems = gData?.ALL_ITEMS || eData?.ALL_ITEMS || {};
  const matDef = allItems[matId] || { name: matId };

  const zones = gData?.ZONES || ZONES || {};
  const monsters = gData?.MONSTERS || MONSTERS || {};
  const zoneConsumables = gData?.ZONE_CONSUMABLES || ZONE_CONSUMABLES || {};
  const monsterDrops = gData?.MONSTER_DROPS || MONSTER_DROPS || {};

  const sources = [];

  // 1. Localiza Zonas onde o item dropa diretamente ou através do tier
  for (const [zoneKey, zDef] of Object.entries(zones)) {
    if (!zDef || zDef.town) continue;
    const tier = (typeof getZoneDropTier === 'function') ? getZoneDropTier(zDef.level || 1) : null;
    const directMats = zoneConsumables[zoneKey] || [];
    const tierMats = tier ? (zoneConsumables[tier] || []) : [];
    const directEquips = monsterDrops[zoneKey] || [];
    const tierEquips = tier ? (monsterDrops[tier] || []) : [];

    const hasInZone = directMats.includes(matId) || tierMats.includes(matId) || directEquips.includes(matId) || tierEquips.includes(matId);
    if (hasInZone) {
      const monsterNames = (zDef.monsters || [])
        .map(mId => (monsters[mId]?.name || mId))
        .filter(Boolean);
      const bossName = zDef.boss ? (monsters[zDef.boss]?.name || zDef.boss) : null;

      let monsterDisplay = monsterNames.slice(0, 3).join(', ');
      if (bossName) monsterDisplay += ` & ${bossName}`;

      sources.push({
        zoneKey,
        zoneName: zDef.name || zoneKey,
        minLvl: zDef.level || 1,
        type: zDef.boss ? 'Drop & Boss' : 'Drop Comum',
        monster: monsterDisplay || 'Monstros da Zona'
      });
    }
  }

  // 2. Raid Bosses que dropam este item
  const raidList = gData?.RAID_BOSSES || RAID_BOSSES || {};
  for (const [rId, rDef] of Object.entries(raidList)) {
    if (rDef.drops && rDef.drops.some(d => d.itemId === matId || d.id === matId)) {
      sources.push({
        zoneKey: rId,
        zoneName: `Raid Boss: ${rDef.name}`,
        minLvl: rDef.level || 50,
        type: 'Raid Épico',
        monster: rDef.name
      });
    }
  }

  // Ordena fontes por nível
  sources.sort((a, b) => a.minLvl - b.minLvl);

  modal.innerHTML = `
    <div style="background:#121622; border:2px solid #d4a744; border-radius:12px; max-width:520px; width:100%; padding:20px; color:#fff; box-shadow:0 8px 30px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(212,167,68,0.3); padding-bottom:8px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#ffd877; font-size:16px;">🔍 Onde Obter: ${matDef.name}</h3>
        <button onclick="document.getElementById('drop-locator-modal').style.display='none'" style="background:none; border:none; color:#aaa; font-size:18px; cursor:pointer;">✕</button>
      </div>

      <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
        Zonas de caça e monstros do jogo onde este item realmente dropa nas tabelas ativas:
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; max-height:290px; overflow-y:auto;">
        ${sources.length > 0 ? sources.map(s => `
          <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div style="flex:1;">
              <div style="font-weight:bold; font-size:13px; color:#fff;">📍 ${s.zoneName} <span style="font-size:11px; color:#94a3b8;">(Lv.${s.minLvl}+)</span></div>
              <div style="font-size:11px; color:#aaa; margin-top:2px;">Monstros: <strong style="color:#ffd877;">${s.monster}</strong></div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="background:rgba(34,197,94,0.15); border:1px solid #22c55e; color:#86efac; padding:3px 8px; border-radius:4px; font-size:10px; font-weight:bold; white-space:nowrap;">${s.type}</span>
              <button onclick="window.travelToZoneFromLocator('${s.zoneKey}')" class="inv-batch-btn" style="background:linear-gradient(180deg,#d4a744,#8a641c); border:1px solid #ffe699; color:#000; padding:4px 8px; border-radius:4px; font-size:10px; font-weight:bold; cursor:pointer; white-space:nowrap;" title="Viajar e iniciar caçada nesta zona imediatamente">
                ⚔️ Caçar Aqui
              </button>
            </div>
          </div>
        `).join('') : `
          <div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">
            Este item é obtido via <strong>Alquimia, Quests, Cash Shop ou Eventos</strong>.
          </div>
        `}
      </div>

      <div style="margin-top:16px; text-align:right;">
        <button onclick="document.getElementById('drop-locator-modal').style.display='none'" style="padding:8px 16px; font-family:'Cinzel',serif; font-weight:bold; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:6px; cursor:pointer;">
          Fechar Localizador
        </button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

if (typeof window !== 'undefined') {
  window.travelToZoneFromLocator = function(zoneKey) {
    const modal = document.getElementById('drop-locator-modal');
    if (modal) modal.style.display = 'none';

    if (zoneKey && (zoneKey.startsWith('raid_') || zoneKey === 'queen_ant' || zoneKey === 'zaken' || zoneKey === 'baium' || zoneKey === 'antharas' || zoneKey === 'valakas' || zoneKey === 'frintezza' || zoneKey === 'barakiel')) {
      const root = getRoot();
      const raidBtn = root.querySelector('[data-tab="raids"]') || document.querySelector('[data-tab="raids"]');
      if (raidBtn) raidBtn.click();
      return;
    }

    if (typeof window.selectZone === 'function') {
      window.selectZone(zoneKey);
    }
  };
}

export function openAutoRecycleModal(state, callbacks = {}) {
  let modal = document.getElementById('auto-recycle-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'auto-recycle-modal';
    modal.className = 'modal-overlay active';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; padding:15px;';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  renderAutoRecycleModal(modal, state || window.getGameState?.() || window._state, callbacks);
}

export function closeAutoRecycleModal() {
  const modal = document.getElementById('auto-recycle-modal');
  if (modal) modal.style.display = 'none';
}

export function renderAutoRecycleModal(container, state, callbacks = {}) {
  const st = state || window.getGameState?.() || window._state || {};
  if (!st.autoRecycle) {
    st.autoRecycle = {
      enabled: false,
      mode: 'sell',
      maxRarity: 'common',
      grades: { ng: true, d: false, c: false, b: false, a: false, s: false }
    };
  }
  const ar = st.autoRecycle;
  const isEnabled = !!ar.enabled;
  const mode = ar.mode || 'sell';
  const maxRarity = ar.maxRarity || 'common';
  const grades = ar.grades || { ng: true, d: false, c: false, b: false, a: false, s: false };

  const content = container.querySelector('#auto-recycle-modal-body') || container;

  content.innerHTML = `
    <div style="font-family:'Cinzel',serif; color:#f8fafc; max-height:85vh; overflow-y:auto; padding-right:4px;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,167,68,0.3); padding-bottom:12px; margin-bottom:16px;">
        <div>
          <h3 style="margin:0; font-size:18px; color:#ffd877;">⚙️ Filtro de Loot AFK &amp; Auto-Recycle</h3>
          <div style="font-size:11px; color:#94a3b8; font-family:sans-serif; margin-top:2px;">
            Gerencie e recicle automaticamente equipamentos comuns descartáveis durante a caçada AFK.
          </div>
        </div>
      </div>

      <!-- Master Switch -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid ${isEnabled ? '#22c55e' : 'rgba(255,255,255,0.1)'}; border-radius:10px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:bold; font-size:14px; color:${isEnabled ? '#86efac' : '#cbd5e1'};">
            ${isEnabled ? '🟢 Auto-Recycle ATIVADO' : '⚪ Auto-Recycle DESATIVADO'}
          </div>
          <div style="font-size:11px; color:#94a3b8; font-family:sans-serif; margin-top:2px;">
            ${isEnabled ? 'Equipamentos comuns que atendem aos filtros são processados no momento do drop.' : 'Todos os itens dropados irão direto para a sua mochila normalmente.'}
          </div>
        </div>
        <button id="toggle-auto-recycle-btn" class="inv-batch-btn" style="padding:6px 14px; font-size:12px; font-weight:bold; cursor:pointer; border-radius:6px; background:${isEnabled ? 'linear-gradient(180deg,#ef4444,#991b1b)' : 'linear-gradient(180deg,#22c55e,#15803d)'}; border:1px solid ${isEnabled ? '#fca5a5' : '#86efac'}; color:#fff;">
          ${isEnabled ? 'Desativar' : 'Ativar Agora'}
        </button>
      </div>

      <!-- Modo de Conversão -->
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(212,167,68,0.2); border-radius:10px; padding:14px; margin-bottom:14px;">
        <div style="font-size:13px; font-weight:bold; color:#ffd877; margin-bottom:8px;">Modo de Conversão:</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <button id="ar-mode-sell" style="padding:10px; border-radius:8px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; display:flex; flex-direction:column; align-items:center; gap:4px; ${mode === 'sell' ? 'background:linear-gradient(180deg,#d4a744,#8a641c); border:1px solid #ffe699; color:#000;' : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1;'}">
            <span>🪙 Auto-Venda (Adena)</span>
            <span style="font-size:10px; font-family:sans-serif; font-weight:normal; opacity:0.9;">Converte drops em Ouro</span>
          </button>
          <button id="ar-mode-dismantle" style="padding:10px; border-radius:8px; cursor:pointer; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; display:flex; flex-direction:column; align-items:center; gap:4px; ${mode === 'dismantle' ? 'background:linear-gradient(180deg,#a855f7,#6b21a8); border:1px solid #e9d5ff; color:#fff;' : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:#cbd5e1;'}">
            <span>🔨 Desmanche (Cristais)</span>
            <span style="font-size:10px; font-family:sans-serif; font-weight:normal; opacity:0.9;">Converte em Cristais e Insumos</span>
          </button>
        </div>
      </div>

      <!-- Filtro de Graus -->
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(212,167,68,0.2); border-radius:10px; padding:14px; margin-bottom:14px;">
        <div style="font-size:13px; font-weight:bold; color:#ffd877; margin-bottom:8px;">Graus de Equipamento Elegíveis:</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(110px, 1fr)); gap:8px; font-family:sans-serif; font-size:12px;">
          <label style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; cursor:pointer;">
            <input type="checkbox" id="ar-grade-ng" ${grades.ng ? 'checked' : ''} style="cursor:pointer;" />
            <span>⚪ No-Grade</span>
          </label>
          <label style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; cursor:pointer;">
            <input type="checkbox" id="ar-grade-d" ${grades.d ? 'checked' : ''} style="cursor:pointer;" />
            <span style="color:#60a5fa;">🔵 Grade D</span>
          </label>
          <label style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; cursor:pointer;">
            <input type="checkbox" id="ar-grade-c" ${grades.c ? 'checked' : ''} style="cursor:pointer;" />
            <span style="color:#4ade80;">🟢 Grade C</span>
          </label>
          <label style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); padding:8px; border-radius:6px; cursor:pointer;">
            <input type="checkbox" id="ar-grade-b" ${grades.b ? 'checked' : ''} style="cursor:pointer;" />
            <span style="color:#f59e0b;">🟡 Grade B</span>
          </label>
          <div style="display:flex; align-items:center; gap:6px; background:rgba(239,68,68,0.1); border:1px dashed rgba(239,68,68,0.3); padding:8px; border-radius:6px; color:#fca5a5; font-size:11px;" title="Graus nobres são permanentemente protegidos contra reciclagem">
            🔒 Grade A &amp; S (Protegidos)
          </div>
        </div>
      </div>

      <!-- Filtro de Raridade Máxima -->
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(212,167,68,0.2); border-radius:10px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="font-size:13px; font-weight:bold; color:#ffd877;">Raridade Máxima:</div>
        <select id="ar-rarity-select" style="background:#090b10; color:#fff; border:1px solid rgba(212,167,68,0.4); border-radius:6px; padding:6px 10px; font-size:12px; font-family:sans-serif; cursor:pointer;">
          <option value="common" ${maxRarity === 'common' ? 'selected' : ''}>Apenas Comum (Branco)</option>
          <option value="uncommon" ${maxRarity === 'uncommon' ? 'selected' : ''}>Até Incomum (Verde)</option>
          <option value="rare" ${maxRarity === 'rare' ? 'selected' : ''}>Até Raro (Azul)</option>
        </select>
      </div>

      <!-- Card de Blindagem e Proteção Inviolável -->
      <div style="background:rgba(22,101,52,0.15); border:1px solid #16a34a; border-radius:10px; padding:12px; font-family:sans-serif; font-size:11px; color:#bbf7d0; margin-bottom:16px;">
        <div style="font-weight:bold; font-size:12px; color:#86efac; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
          🛡️ BLINDAGEM DE RECURSOS ATIVA:
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 12px; margin-top:6px;">
          <div>✓ 🧱 <strong>Materiais &amp; Minérios:</strong> 100% Protegidos</div>
          <div>✓ 🧪 <strong>Poções &amp; Comidas:</strong> 100% Protegidas</div>
          <div>✓ ⚡ <strong>Soulshots &amp; Shots:</strong> 100% Protegidos</div>
          <div>✓ 📜 <strong>Pergaminhos &amp; Livros:</strong> 100% Protegidos</div>
          <div>✓ 👑 <strong>Itens de Herança:</strong> 100% Protegidos</div>
          <div>✓ ✨ <strong>Itens com Enchant / SA:</strong> 100% Protegidos</div>
        </div>
      </div>

      <!-- Footer Button -->
      <div style="text-align:right;">
        <button id="save-close-auto-recycle-btn" style="padding:10px 22px; font-family:'Cinzel',serif; font-weight:bold; font-size:13px; background:linear-gradient(180deg,#d4a744,#8a641c); border:1px solid #ffe699; color:#000; border-radius:6px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
          💾 Salvar e Fechar
        </button>
      </div>
    </div>
  `;

  // Bind Events
  const toggleBtn = content.querySelector('#toggle-auto-recycle-btn');
  if (toggleBtn) {
    toggleBtn.onclick = () => {
      st.autoRecycle.enabled = !st.autoRecycle.enabled;
      if (callbacks.save) callbacks.save();
      renderAutoRecycleModal(container, st, callbacks);
    };
  }

  const modeSellBtn = content.querySelector('#ar-mode-sell');
  const modeDismantleBtn = content.querySelector('#ar-mode-dismantle');
  if (modeSellBtn) {
    modeSellBtn.onclick = () => {
      st.autoRecycle.mode = 'sell';
      if (callbacks.save) callbacks.save();
      renderAutoRecycleModal(container, st, callbacks);
    };
  }
  if (modeDismantleBtn) {
    modeDismantleBtn.onclick = () => {
      st.autoRecycle.mode = 'dismantle';
      if (callbacks.save) callbacks.save();
      renderAutoRecycleModal(container, st, callbacks);
    };
  }

  const chkNg = content.querySelector('#ar-grade-ng');
  const chkD = content.querySelector('#ar-grade-d');
  const chkC = content.querySelector('#ar-grade-c');
  const chkB = content.querySelector('#ar-grade-b');
  const selRarity = content.querySelector('#ar-rarity-select');

  const saveSettings = () => {
    st.autoRecycle.grades = {
      ng: chkNg ? chkNg.checked : true,
      d: chkD ? chkD.checked : false,
      c: chkC ? chkC.checked : false,
      b: chkB ? chkB.checked : false,
      a: false,
      s: false
    };
    if (selRarity) st.autoRecycle.maxRarity = selRarity.value;
    if (callbacks.save) callbacks.save();
  };

  if (chkNg) chkNg.onchange = saveSettings;
  if (chkD) chkD.onchange = saveSettings;
  if (chkC) chkC.onchange = saveSettings;
  if (chkB) chkB.onchange = saveSettings;
  if (selRarity) selRarity.onchange = saveSettings;

  const saveCloseBtn = content.querySelector('#save-close-auto-recycle-btn');
  if (saveCloseBtn) {
    saveCloseBtn.onclick = () => {
      saveSettings();
      closeAutoRecycleModal();
      if (callbacks.log) {
        callbacks.log(`⚙️ Filtro AFK salvo: ${st.autoRecycle.enabled ? 'Ativado (' + (st.autoRecycle.mode === 'sell' ? 'Auto-Venda' : 'Desmanche') + ')' : 'Desativado'}`, 'system');
      }
    };
  }
}

if (typeof window !== 'undefined') {
  window.openAutoRecycleModal = function(state, callbacks) {
    openAutoRecycleModal(state || window.getGameState?.() || window._state, callbacks);
  };
}

export function openCompoundModal(state) {
  let modal = document.getElementById('compound-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compound-modal';
    modal.className = 'modal-overlay active';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:99999; display:flex; align-items:center; justify-content:center; padding:15px;';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  renderCompoundModal(modal, state || window.getGameState?.() || window._state);
}

export function closeCompoundModal() {
  const modal = document.getElementById('compound-modal');
  if (modal) modal.style.display = 'none';
}

export function renderCompoundModal(container, state) {
  const st = state || window.getGameState?.() || window._state || {};
  const inv = st.inventory || [];
  
  const targetItems = inv.filter(i => {
    const countSame = inv.filter(other => other.itemId === i.itemId).reduce((acc, o) => acc + (o.count || 1), 0);
    return countSame >= 2;
  });

  const selectedTargetUid = window._compoundTargetUid || (targetItems[0]?.uid || null);
  const targetItem = inv.find(i => i.uid === selectedTargetUid);
  
  const ingredientItems = targetItem ? inv.filter(i => i.itemId === targetItem.itemId && (i.uid !== targetItem.uid || (i.count || 1) >= 2)) : [];
  const selectedIngredientUid = window._compoundIngredientUid || (ingredientItems[0]?.uid || null);

  const curLv = targetItem ? (targetItem.compoundLevel || 1) : 1;
  const cost = 100000 * Math.pow(2, Math.min(8, curLv - 1));
  const rates = [75, 65, 50, 40, 30, 25, 20, 15, 10];
  const rate = rates[Math.min(rates.length - 1, curLv - 1)] || 50;

  let targetOptionsHtml = '';
  for (const t of targetItems) {
    const isSel = t.uid === selectedTargetUid;
    const def = getItemDef(t.itemId);
    targetOptionsHtml += `
      <div onclick="window._compoundTargetUid='${t.uid}'; window._compoundIngredientUid=null; window.renderCompoundModal(document.getElementById('compound-modal'))"
        style="padding:10px; border-radius:8px; background:${isSel ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)'}; border:1px solid ${isSel ? '#a855f7' : 'rgba(255,255,255,0.15)'}; cursor:pointer; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#f4d58a; font-size:13px;">${t.name || def?.name || 'Item'}</strong>
          <div style="font-size:11px; color:#aaa;">Nível Atual: Lv.${t.compoundLevel || 1}</div>
        </div>
        <span style="font-size:11px; color:#34d399;">Qtd: ${t.count || 1}x</span>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="background:linear-gradient(180deg, rgba(20,16,32,0.98), rgba(10,8,16,0.98)); border:1px solid rgba(168,85,247,0.5); border-radius:14px; max-width:550px; width:100%; padding:20px; color:#fff; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.8);">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(168,85,247,0.3); padding-bottom:12px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">🧪 Sistema de Compound (L2 Essence)</h3>
        <button onclick="window.closeCompoundModal()" style="background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;">✕</button>
      </div>

      <p style="font-size:12px; color:#aaa; margin-top:0;">
        Combine dois equipamentos idênticos para evoluir para o próximo nível. Em caso de falha, o item principal permanece intacto e o ingrediente é consumido.
      </p>

      <div style="display:flex; gap:12px; margin-bottom:16px;">
        <div style="flex:1;">
          <h4 style="margin:0 0 6px 0; font-size:12px; color:#ffd877;">1. Item Base (Elegíveis)</h4>
          <div style="max-height:180px; overflow-y:auto;">
            ${targetOptionsHtml || '<div style="font-size:11px; color:#777;">Nenhum par de itens idênticos no inventário.</div>'}
          </div>
        </div>

        <div style="flex:1; background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h4 style="margin:0 0 8px 0; font-size:13px; color:#f4d58a;">🔮 Prévia de Evolução</h4>
            ${targetItem ? `
              <div style="font-size:12px; color:#fff; margin-bottom:4px;"><strong>${targetItem.name || 'Item'}</strong></div>
              <div style="font-size:11px; color:#34d399;">Lv.${curLv} ➔ <strong style="color:#ffd877;">Lv.${curLv + 1}</strong> (+15% Atributos)</div>
              <div style="font-size:11px; color:#a855f7; margin-top:6px;">Taxa de Sucesso: <strong>${rate}%</strong></div>
              <div style="font-size:11px; color:#fbbf24; margin-top:2px;">Custo em Adena: <strong>${cost.toLocaleString()}g</strong></div>
            ` : '<div style="font-size:11px; color:#777;">Selecione um item base.</div>'}
          </div>

          <button
            onclick="window.executeCompoundAction('${selectedTargetUid}', '${selectedIngredientUid || selectedTargetUid}'); window.renderCompoundModal(document.getElementById('compound-modal'))"
            ${(!targetItem || (st.gold || 0) < cost) ? 'disabled' : ''}
            style="width:100%; margin-top:12px; padding:10px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:${targetItem ? 'linear-gradient(180deg,#a855f7,#6b21a8)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${targetItem ? '#c084fc' : 'rgba(100,80,60,0.3)'}; color:${targetItem ? '#fff' : '#777'}; border-radius:6px; cursor:${targetItem ? 'pointer' : 'not-allowed'};"
          >
            ⚡ EXECUTAR COMPOUND
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   15. LOJA COMERCIAL DE ADEN (CASH SHOP & 5 ABAS)
═══════════════════════════════════════════════════════════════════════════ */
let currentCashShopTab = 'starter_packs';

export function openCashShopModal() {
  let modal = document.getElementById('cash-shop-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cash-shop-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '99999';
    modal.style.backdropFilter = 'blur(6px)';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  renderCashShopModal(modal);
}

export function closeCashShopModal() {
  const modal = document.getElementById('cash-shop-modal');
  if (modal) modal.style.display = 'none';
}

if (typeof window !== 'undefined') {
  window.openCashShopModal = openCashShopModal;
  window.closeCashShopModal = closeCashShopModal;
  window.setCashShopTab = (tab) => {
    currentCashShopTab = tab;
    const modal = document.getElementById('cash-shop-modal');
    if (modal) renderCashShopModal(modal);
  };
}

export function renderCashShopModal(container) {
  if (!container) return;
  const state = (typeof window !== 'undefined' && window.__GAME_STATE__) ? window.__GAME_STATE__ : (window.gameState || {});
  const { CASH_SHOP_CATALOG } = (typeof window !== 'undefined' && window.EchoData?.CASH_SHOP_CATALOG) ? window.EchoData : { CASH_SHOP_CATALOG: {} };
  const catalog = CASH_SHOP_CATALOG || {};

  const balanceAC = Number(state.adenCoins) || 0;

  // Render Tabs Header
  const tabs = [
    { id: 'starter_packs', name: '⭐ Starter Packs' },
    { id: 'costumes_and_skins', name: '🎨 Trajes & Skins' },
    { id: 'titles_and_effects', name: '🏷️ Títulos & Efeitos' },
    { id: 'utility_and_passes', name: '🧪 Utilitários & Passes' },
    { id: 'donation_tiers', name: '🪙 Obter Aden Coins' }
  ];

  const tabsHtml = tabs.map(t => `
    <button
      onclick="window.setCashShopTab('${t.id}')"
      style="padding:8px 14px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; cursor:pointer; border-radius:6px 6px 0 0; border:1px solid ${currentCashShopTab === t.id ? '#ffd700' : 'rgba(255,255,255,0.1)'}; border-bottom:none; background:${currentCashShopTab === t.id ? 'linear-gradient(180deg,#2a2210,#181408)' : 'rgba(20,20,25,0.6)'}; color:${currentCashShopTab === t.id ? '#ffd700' : '#aaa'}; transition:all 0.2s;"
    >
      ${t.name}
    </button>
  `).join('');

  // Render Tab Content
  let contentHtml = '';

  // 1. Starter Packs
  if (currentCashShopTab === 'starter_packs') {
    const packs = catalog.starter_packs || [];
    contentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-top:10px;">
        ${packs.map(p => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid ${p.id === 'starter_pack_tier3' ? '#ffd700' : 'rgba(255,215,0,0.3)'}; border-radius:10px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; position:relative; box-shadow:${p.id === 'starter_pack_tier3' ? '0 0 15px rgba(255,215,0,0.25)' : 'none'};">
            ${p.badge ? `<span style="position:absolute; top:-10px; right:12px; background:${p.id === 'starter_pack_tier3' ? '#ffd700' : '#38bdf8'}; color:#000; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px;">${p.badge}</span>` : ''}
            <div>
              <h4 style="margin:0 0 6px 0; color:#ffd700; font-size:14px; font-family:'Cinzel',serif;">${p.name}</h4>
              <div style="font-size:11px; color:#38bdf8; font-weight:bold; margin-bottom:8px;">${p.brlEquivalent} · <span style="color:#ffd700;">🪙 ${p.priceAC} AC</span></div>
              <p style="font-size:11px; color:#ccc; line-height:1.4; margin:0 0 10px 0;">${p.desc}</p>
            </div>
            <button
              onclick="window.executeCashShopBuy('starter_pack', '${p.id}')"
              style="width:100%; padding:10px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:linear-gradient(180deg,#ffd700,#b45309); border:1px solid #fef08a; border-radius:6px; color:#000; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.5);"
            >
              🪙 ADQUIRIR (${p.priceAC} AC)
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 2. Trajes & Skins
  else if (currentCashShopTab === 'costumes_and_skins') {
    const skins = catalog.costumes_and_skins || [];
    contentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:10px;">
        ${skins.map(s => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(168,85,247,0.4); border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 4px 0; color:#c084fc; font-size:13px; font-family:'Cinzel',serif;">${s.name}</h4>
              <div style="font-size:11px; color:#ffd700; font-weight:bold; margin-bottom:6px;">🪙 ${s.priceAC} AC</div>
              <p style="font-size:11px; color:#bbb; line-height:1.3; margin:0 0 8px 0;">${s.desc}</p>
            </div>
            <button
              onclick="window.executeCashShopBuy('cosmetic', '${s.id}')"
              style="width:100%; padding:8px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:linear-gradient(180deg,#a855f7,#6b21a8); border:1px solid #c084fc; border-radius:4px; color:#fff; cursor:pointer;"
            >
              🎨 EQUIPAR SKIN (${s.priceAC} AC)
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 3. Títulos & Efeitos
  else if (currentCashShopTab === 'titles_and_effects') {
    const titles = catalog.titles_and_effects || [];
    contentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-top:10px;">
        ${titles.map(t => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,215,0,0.3); border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 4px 0; color:${t.color || '#ffd700'}; font-size:13px; font-family:'Cinzel',serif;">${t.name}</h4>
              <div style="font-size:11px; color:#ffd700; font-weight:bold; margin-bottom:6px;">🪙 ${t.priceAC} AC</div>
              <p style="font-size:11px; color:#bbb; line-height:1.3; margin:0 0 8px 0;">${t.desc}</p>
            </div>
            <button
              onclick="window.executeCashShopBuy('title', '${t.id}')"
              style="width:100%; padding:8px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:linear-gradient(180deg,#eab308,#a16207); border:1px solid #fde047; border-radius:4px; color:#000; cursor:pointer;"
            >
              🏷️ DESBLOQUEAR (${t.priceAC} AC)
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 4. Utilitários & Passes
  else if (currentCashShopTab === 'utility_and_passes') {
    const utils = catalog.utility_and_passes || [];
    contentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:10px;">
        ${utils.map(u => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <h4 style="margin:0 0 4px 0; color:#38bdf8; font-size:13px; font-family:'Cinzel',serif;">${u.name}</h4>
              <div style="font-size:11px; color:#ffd700; font-weight:bold; margin-bottom:6px;">🪙 ${u.priceAC} AC</div>
              <p style="font-size:11px; color:#bbb; line-height:1.3; margin:0 0 8px 0;">${u.desc}</p>
            </div>
            <button
              onclick="window.executeCashShopBuy('utility', '${u.id}')"
              style="width:100%; padding:8px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:linear-gradient(180deg,#0284c7,#0369a1); border:1px solid #38bdf8; border-radius:4px; color:#fff; cursor:pointer;"
            >
              🧪 COMPRAR (${u.priceAC} AC)
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 5. Obter Aden Coins (Doação Pix)
  else if (currentCashShopTab === 'donation_tiers') {
    const tiers = catalog.donation_tiers || [];
    contentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-top:10px;">
        ${tiers.map(d => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid ${d.popular ? '#ffd700' : 'rgba(255,215,0,0.3)'}; border-radius:10px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
            ${d.popular ? `<span style="position:absolute; top:-10px; right:12px; background:#ffd700; color:#000; font-weight:bold; font-size:10px; padding:2px 8px; border-radius:10px;">MAIS VENDIDO</span>` : ''}
            <div>
              <h4 style="margin:0 0 4px 0; color:#ffd700; font-size:15px; font-family:'Cinzel',serif;">🪙 ${d.totalAC || d.amountAC} AC</h4>
              <div style="font-size:12px; color:#34d399; font-weight:bold; margin-bottom:6px;">${d.priceBRL}</div>
              <p style="font-size:11px; color:#bbb; line-height:1.3; margin:0 0 8px 0;">${d.desc}</p>
            </div>
            <button
              onclick="window.openPixCheckoutModal('${d.id}')"
              style="width:100%; padding:10px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:linear-gradient(180deg,#10b981,#047857); border:1px solid #34d399; border-radius:6px; color:#fff; cursor:pointer;"
            >
              💳 RECARREGAR PIX (${d.priceBRL})
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div style="background:linear-gradient(180deg, rgba(20,16,10,0.98), rgba(10,8,6,0.98)); border:1px solid #ffd700; border-radius:14px; max-width:850px; width:92vw; max-height:85vh; padding:20px; color:#fff; font-family:sans-serif; box-shadow:0 0 40px rgba(255,215,0,0.25); display:flex; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,215,0,0.3); padding-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <h3 style="margin:0; font-family:'Cinzel',serif; color:#ffd700; font-size:20px;">🪙 Loja Comercial de Aden</h3>
          <span style="background:rgba(0,0,0,0.5); border:1px solid #ffd700; padding:3px 10px; border-radius:20px; font-size:12px; color:#ffd700; font-weight:bold;">
            Saldo: ${balanceAC.toLocaleString()} AC
          </span>
        </div>
        <button onclick="window.closeCashShopModal()" style="background:none; border:none; color:#aaa; font-size:22px; cursor:pointer;">✕</button>
      </div>

      <div style="display:flex; gap:6px; border-bottom:1px solid rgba(255,215,0,0.2); margin-top:12px; overflow-x:auto;">
        ${tabsHtml}
      </div>

      <div style="flex:1; overflow-y:auto; padding:10px 4px 4px 4px;">
        ${contentHtml}
      </div>
    </div>
  `;
}

export function uiOpenPixCheckoutModal(tierId, state) {
  const catalog = (typeof window !== 'undefined' && window.EchoData?.CASH_SHOP_CATALOG) ? window.EchoData.CASH_SHOP_CATALOG : {};
  const tiers = catalog.donation_tiers || [];
  const tier = tiers.find(t => t.id === tierId) || tiers[0];
  if (!tier) return;

  let modal = document.getElementById('pix-checkout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pix-checkout-modal';
    modal.className = 'modal-backdrop';
    document.body.appendChild(modal);
  }

  const s = state || (typeof window !== 'undefined' ? (window.__GAME_STATE__ || window.gameState) : {});
  const playerName = s?.name || s?.charName || 'Guerreiro';
  const totalAC = tier.totalAC || tier.amountAC;
  const pixKey = 'pix@adenarena.com';

  modal.innerHTML = `
    <div style="background:linear-gradient(180deg, rgba(20,16,10,0.98), rgba(10,8,6,0.98)); border:2px solid #ffd700; border-radius:14px; max-width:520px; width:92vw; padding:24px; color:#fff; font-family:sans-serif; box-shadow:0 0 40px rgba(255,215,0,0.3); position:relative;">
      <button onclick="document.getElementById('pix-checkout-modal').classList.remove('active')" style="position:absolute; top:14px; right:16px; background:none; border:none; color:#aaa; font-size:22px; cursor:pointer;">✕</button>
      
      <div style="text-align:center; margin-bottom:16px;">
        <span style="font-size:32px;">⚜️</span>
        <h3 style="margin:6px 0 2px 0; font-family:'Cinzel',serif; color:#ffd700; font-size:20px;">Doação Pix · Aden Arena</h3>
        <p style="margin:0; font-size:12px; color:#94a3b8;">Recarga rápida com segurança e liberação ágil</p>
      </div>

      <div style="background:rgba(0,0,0,0.6); border:1px solid rgba(255,215,0,0.3); border-radius:8px; padding:12px 16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:13px; color:#cbd5e1; font-weight:600;">Pacote Selecionado:</span>
          <span style="font-family:'Cinzel',serif; color:#ffd700; font-weight:bold; font-size:15px;">🪙 ${totalAC.toLocaleString()} AC</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:13px; color:#cbd5e1; font-weight:600;">Valor da Doação:</span>
          <span style="color:#34d399; font-weight:bold; font-size:16px;">${tier.priceBRL}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; color:#94a3b8;">Personagem Destino:</span>
          <span style="color:#60a5fa; font-weight:bold; font-size:13px;">${playerName}</span>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:11px; font-weight:bold; color:#ffd877; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">Chave Pix Oficial (E-mail):</label>
        <div style="display:flex; gap:8px;">
          <input id="pix-key-input" type="text" readonly value="${pixKey}" style="flex:1; background:#0f172a; border:1px solid #334155; border-radius:6px; padding:8px 12px; color:#38bdf8; font-family:monospace; font-size:13px; font-weight:bold; outline:none;" />
          <button id="pix-copy-btn" onclick="navigator.clipboard.writeText('${pixKey}').then(() => { const b = document.getElementById('pix-copy-btn'); b.textContent = '✅ Copiado!'; b.style.background = '#10b981'; setTimeout(() => { b.textContent = '📋 Copiar'; b.style.background = '#d97706'; }, 3000); })" style="padding:8px 16px; background:#d97706; border:1px solid #f59e0b; border-radius:6px; color:#fff; font-weight:bold; font-size:12px; cursor:pointer; font-family:'Cinzel',serif; white-space:nowrap; transition:background 0.2s;">
            📋 Copiar
          </button>
        </div>
      </div>

      <div style="background:rgba(30,41,59,0.5); border:1px solid rgba(148,163,184,0.2); border-radius:8px; padding:12px; font-size:11px; color:#cbd5e1; line-height:1.5; margin-bottom:16px;">
        <div style="font-weight:bold; color:#fde047; margin-bottom:4px;">📌 Instruções de Ativação:</div>
        1. Copie a chave Pix acima e faça o pagamento no valor de <strong>${tier.priceBRL}</strong>.<br/>
        2. No campo de descrição/mensagem do Pix, coloque: <strong>${playerName}</strong>.<br/>
        3. Envie o comprovante em nosso canal oficial no Discord na sala <strong>#recargas-pix</strong> para aprovação em minutos!
      </div>

      <div style="display:flex; gap:10px;">
        <a href="https://discord.gg/R7rwB5uCc" target="_blank" rel="noopener noreferrer" style="flex:1; text-decoration:none; padding:10px; background:linear-gradient(180deg,#5865F2,#4752c4); border:1px solid #5865F2; border-radius:6px; color:#fff; font-weight:bold; font-size:12px; font-family:'Cinzel',serif; text-align:center; display:flex; align-items:center; justify-content:center; gap:6px;">
          💬 Enviar no Discord
        </a>
        <button onclick="document.getElementById('pix-checkout-modal').classList.remove('active')" style="padding:10px 18px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:6px; color:#ddd; font-weight:bold; font-size:12px; cursor:pointer;">
          Fechar
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

let _contactsActiveTab = 'friends'; // 'friends' | 'block' | 'mentorship'
let _contactsSelectedFriendName = null;

function getContactsUiRoot() {
  if (typeof document === 'undefined') return null;
  const host = document.getElementById('idle-host') || document.querySelector('#idle-host') || document.querySelector('[id*="idle"]');
  return host?.shadowRoot || (typeof window !== 'undefined' && window.__SHADOW_ROOT__) || (typeof ROOT !== 'undefined' && ROOT) || document;
}

export function closeContactsModal() {
  const root = getContactsUiRoot() || document;
  const modal = (root.getElementById ? root.getElementById('referral-modal') : null) || (root.querySelector ? root.querySelector('#referral-modal') : null) || document.getElementById('referral-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

export function uiOpenReferralModal(state, defaultTab) {
  const root = getContactsUiRoot() || document;
  let modal = (root.getElementById ? root.getElementById('referral-modal') : null) || (root.querySelector ? root.querySelector('#referral-modal') : null) || document.getElementById('referral-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'referral-modal';
    modal.className = 'modal';
    if (root && root.appendChild) {
      root.appendChild(modal);
    } else {
      document.body.appendChild(modal);
    }
  }

  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0, 0, 0, 0.85)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '999999';
  modal.style.backdropFilter = 'blur(6px)';
  modal.style.padding = '16px';
  modal.classList.add('active');

  modal.onclick = (e) => {
    if (e.target === modal) {
      closeContactsModal();
    }
  };

  if (defaultTab && ['friends', 'block', 'mentorship'].includes(defaultTab)) {
    _contactsActiveTab = defaultTab;
  }

  const s = state || (typeof window !== 'undefined' ? (window.__GAME_STATE__ || window.gameState) : {});
  const heroNick = s?.name || s?.charName || 'Aventureiro';
  const refCode = heroNick;
  const baseUrl = (typeof window !== 'undefined') ? (window.location.origin + window.location.pathname) : 'https://adenarena.com';
  const refUrl = `${baseUrl}?ref=${encodeURIComponent(refCode)}`;
  const whatsappText = encodeURIComponent(`⚔️ Venha jogar comigo no Aden Arena: Idle Chronicles! Jogo épico direto no navegador, sem downloads. Crie seu herói com bônus de novato: ${refUrl}`);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappText}`;

  const countInvited = s?.referralsCount || 0;
  const rewardsClaimed = s?.referralRewardsClaimed || 0;
  const referredBy = s?.referredBy || (typeof localStorage !== 'undefined' ? localStorage.getItem('aden_referred_by') : null) || null;

  if (!Array.isArray(s.friends)) {
    s.friends = [];
  } else {
    // Gate 10 Purge: remove any legacy ghost friends permanently
    s.friends = s.friends.filter(f => !['vaelin', 'elwen', 'sirgalahad'].includes(String(f?.name || f || '').toLowerCase()));
  }
  if (!Array.isArray(s.blocked)) {
    s.blocked = [];
  }

  let contentHtml = '';

  if (_contactsActiveTab === 'friends') {
    contentHtml = `
      <!-- Subbar: Friend List Counter + Top Action Buttons -->
      <div class="l2contacts-subbar">
        <div class="l2contacts-counter">
          Lista de Amigos (${s.friends.length}/128)
        </div>
        <div class="l2contacts-top-actions">
          <button id="btn-contact-add-friend" class="l2contacts-add-btn">
            + Adicionar
          </button>
          <button id="btn-contact-del-friend" class="l2contacts-del-btn">
            - Remover
          </button>
        </div>
      </div>

      <!-- Friends Table -->
      <div style="max-height: 280px; overflow-y: auto; background: #080a0f;">
        <table class="l2contacts-table">
          <thead>
            <tr>
              <th style="width: 32%;">Nome</th>
              <th style="width: 12%; text-align: center;">Nv.</th>
              <th style="width: 26%;">Classe</th>
              <th style="width: 16%;">Status</th>
              <th style="width: 7%; text-align: center;" title="Mensagem Privada">Msg</th>
              <th style="width: 7%; text-align: center;" title="Enviar Correio">Mail</th>
            </tr>
          </thead>
          <tbody>
            ${s.friends.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 40px 14px; color: #94a3b8; font-size: 11px;">
                  Nenhum amigo registrado na lista.<br />
                  <span style="color: #64748b; font-size: 10px;">Clique no botão <strong style="color:#60a5fa;">'+ Adicionar'</strong> acima para adicionar um amigo pelo nome!</span>
                </td>
              </tr>
            ` : s.friends.map(f => {
              const isSelected = _contactsSelectedFriendName === f.name;
              return `
                <tr class="contact-friend-row" data-name="${f.name}" style="cursor: pointer; ${isSelected ? 'background: rgba(212,167,68,0.2) !important; outline: 1px solid rgba(212,167,68,0.4);' : ''}">
                  <td style="font-weight: bold; color: ${isSelected ? '#ffd877' : '#f1f5f9'};">
                    ${f.name}
                  </td>
                  <td style="text-align: center; font-family: 'IBM Plex Mono', monospace; color: #94a3b8;">
                    ${f.level}
                  </td>
                  <td style="color: #cbd5e1; font-size: 10.5px;">
                    ${f.classTitle || 'Adventurer'}
                  </td>
                  <td>
                    ${f.online ? '<span style="color: #22c55e; font-size: 10px; font-weight: bold;">● Online</span>' : '<span style="color: #64748b; font-size: 10px;">○ Offline</span>'}
                  </td>
                  <td style="text-align: center;">
                    <button class="btn-friend-msg" data-name="${f.name}" style="background: none; border: none; cursor: pointer; color: #38bdf8; font-size: 12px;" title="Enviar mensagem privada">💬</button>
                  </td>
                  <td style="text-align: center;">
                    <button class="btn-friend-mail" data-name="${f.name}" style="background: none; border: none; cursor: pointer; color: #ffd877; font-size: 12px;" title="Enviar correio">✉️</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Bottom Actions Bar -->
      <div class="l2contacts-bottom-bar">
        <button id="btn-friend-party-invite" class="l2contacts-action-btn" title="Convidar amigo selecionado para o Grupo">
          📢 Convidar Grupo
        </button>
        <button id="btn-friend-clan-invite" class="l2contacts-action-btn" title="Convidar amigo selecionado para o Clã">
          ⚑ Convidar Clã
        </button>
        <button id="btn-friend-detailed-info" class="l2contacts-action-btn" title="Ver ficha e detalhes do amigo">
          🗎 Detalhes
        </button>
        <button id="btn-friend-make-mentor" class="l2contacts-action-btn" style="border-color: rgba(52,211,153,0.4); color: #6ee7b7;" title="Vincular este amigo como seu Mentor (até Nv. 20)">
          🎓 Tornar Mentor
        </button>
      </div>
    `;
  } else if (_contactsActiveTab === 'block') {
    contentHtml = `
      <div class="l2contacts-subbar">
        <div class="l2contacts-counter">
          Lista de Bloqueados (${s.blocked.length}/64)
        </div>
        <div class="l2contacts-top-actions">
          <button id="btn-contact-add-block" class="l2contacts-add-btn">
            + Bloquear
          </button>
        </div>
      </div>

      <div style="min-height: 220px; max-height: 280px; overflow-y: auto; background: #080a0f;">
        <table class="l2contacts-table">
          <thead>
            <tr>
              <th style="width: 50%;">Nome</th>
              <th style="width: 30%;">Status</th>
              <th style="width: 20%; text-align: center;">Ação</th>
            </tr>
          </thead>
          <tbody>
            ${s.blocked.length === 0 ? `
              <tr>
                <td colspan="3" style="text-align: center; padding: 40px 14px; color: #94a3b8; font-size: 11px;">
                  Nenhum jogador na lista de bloqueio.
                </td>
              </tr>
            ` : s.blocked.map(bName => `
              <tr>
                <td style="color: #fca5a5; font-weight: bold;">${bName}</td>
                <td style="color: #64748b; font-size: 10px;">Bloqueado</td>
                <td style="text-align: center;">
                  <button class="btn-unblock-player" data-name="${bName}" style="background: rgba(239,68,68,0.2); border: 1px solid #ef4444; color: #fca5a5; border-radius: 4px; padding: 2px 8px; font-size: 10px; cursor: pointer;">
                    Desbloquear
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (_contactsActiveTab === 'mentorship') {
    contentHtml = `
      <div style="padding: 16px; background: #080a0f;">
        <!-- Header Info Banner -->
        <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(6,78,59,0.25) 100%); border: 1px solid rgba(52,211,153,0.35); border-radius: 8px; padding: 12px; margin-bottom: 14px;">
          <div style="font-family: 'Cinzel', serif; font-size: 13px; font-weight: bold; color: #a7f3d0; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
            <span>🎓</span> Programa de Mentoria de Aden
          </div>
          <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
            Jogadores veteranos guiam novos aventureiros até a 2ª classe. Ambos recebem bônus e tesouros lendários!
          </div>
        </div>

        ${referredBy ? `
          <div style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.5); border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 11px; color: #6ee7b7; display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">✨</span>
            <div>
              <div>Mentor Vinculado: <strong style="color:#ffd877; font-size: 12px;">${referredBy}</strong></div>
              <div style="font-size: 10px; color: #a7f3d0; margin-top: 2px;">Bônus ativo: <strong>+10% EXP permanente</strong> e Pacote de Boas-Vindas concedido.</div>
            </div>
          </div>
        ` : ((s.level || 1) <= 20 ? `
          <div style="background: rgba(20,26,38,0.9); border: 1px solid rgba(52,211,153,0.4); border-radius: 8px; padding: 12px; margin-bottom: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
            <div style="font-size: 11px; font-weight: bold; color: #6ee7b7; margin-bottom: 4px; text-transform: uppercase; font-family: 'Cinzel', serif;">
              🎯 Vincular seu Mentor (Disponível até Nível 20):
            </div>
            <div style="font-size: 10.5px; color: #94a3b8; margin-bottom: 8px; line-height: 1.4;">
              Ao vincular um mentor, você ganha imediatamente <strong style="color:#6ee7b7;">+10% EXP permanente</strong>, <strong>1.000 Soulshots</strong> e <strong>10 Poções de Vida</strong>! No Nível 40, ambos ganham <strong>50 AC</strong> e <strong>5x Blessed Scrolls</strong>.
            </div>
            <div style="display: flex; gap: 8px;">
              <input id="ref-friend-code-input" type="text" placeholder="Digite o nome do seu mentor..." style="flex: 1; background: #0b0d13; border: 1px solid #334155; border-radius: 4px; padding: 7px 10px; color: #fff; font-size: 11px;" />
              <button onclick="window.submitReferralCodeAction && window.submitReferralCodeAction()" style="padding: 7px 16px; background: linear-gradient(180deg, #10b981, #059669); border: 1px solid #34d399; border-radius: 4px; color: #052e16; font-weight: bold; font-size: 11px; cursor: pointer; font-family: 'Cinzel', serif; box-shadow: 0 2px 8px rgba(16,185,129,0.3);">
                Vincular
              </button>
            </div>
          </div>
        ` : `
          <div style="background: rgba(30,41,59,0.4); border: 1px solid rgba(148,163,184,0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 11px; color: #cbd5e1; display: flex; align-items: center; gap: 8px;">
            <span>🛡️</span>
            <span>Você já atingiu o Nível ${s.level || 1}! Compartilhe seu código abaixo para ser o <strong>Mentor</strong> de novos aventureiros e receber recompensas quando eles chegarem ao Nível 40.</span>
          </div>
        `)}

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-size: 10.5px; font-weight: bold; color: #6ee7b7; margin-bottom: 6px; text-transform: uppercase; font-family: 'Cinzel', serif;">
            Seu Código / Link de Indicação &amp; Mentoria:
          </label>
          <div style="display: flex; gap: 8px;">
            <input id="ref-link-input" type="text" readonly value="${refUrl}" style="flex: 1; background: #0b0d13; border: 1px solid #059669; border-radius: 4px; padding: 7px 10px; color: #34d399; font-family: monospace; font-size: 11px; font-weight: bold;" />
            <button id="ref-copy-btn" onclick="navigator.clipboard.writeText('${refUrl}').then(() => { const b = document.getElementById('ref-copy-btn'); b.textContent = '✅ Copiado!'; setTimeout(() => { b.textContent = '📋 Copiar'; }, 2500); })" style="padding: 7px 14px; background: #10b981; border: 1px solid #34d399; border-radius: 4px; color: #052e16; font-weight: bold; font-size: 11px; cursor: pointer; font-family: 'Cinzel', serif;">
              📋 Copiar
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="background: rgba(14,18,26,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; font-family: 'Cinzel', serif;">Pupilos &amp; Amigos Indicados</div>
            <div style="font-size: 18px; font-weight: bold; color: #34d399; font-family: 'Cinzel', serif; margin-top: 2px;">${countInvited}</div>
          </div>
          <div style="background: rgba(14,18,26,0.8); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 10px; text-align: center;">
            <div style="font-size: 10px; color: #94a3b8; font-family: 'Cinzel', serif;">Recompensas Resgatadas</div>
            <div style="font-size: 18px; font-weight: bold; color: #ffd700; font-family: 'Cinzel', serif; margin-top: 2px;">${rewardsClaimed}</div>
          </div>
        </div>

        <div style="margin-bottom: 10px;">
          <button id="ref-check-rewards-btn" onclick="window.claimReferralRewardsAction && window.claimReferralRewardsAction()" style="width: 100%; padding: 9px 14px; background: linear-gradient(180deg, #059669, #047857); border: 1px solid #34d399; border-radius: 6px; color: #fff; font-weight: bold; font-size: 11px; cursor: pointer; font-family: 'Cinzel', serif; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 0 12px rgba(16,185,129,0.25);">
            🔄 Verificar &amp; Resgatar Recompensas (50 AC + 5 Scrolls por pupilo Lv. 40)
          </button>
        </div>

        <div style="display: flex; gap: 8px;">
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-decoration: none; padding: 8px; background: linear-gradient(180deg, #25D366, #128C7E); border: 1px solid #25D366; border-radius: 4px; color: #fff; font-weight: bold; font-size: 11px; font-family: 'Cinzel', serif; text-align: center; display: flex; align-items: center; justify-content: center; gap: 6px;">
            📲 Convidar Amigos no WhatsApp
          </a>
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="l2contacts-window-frame" style="max-width: 580px; width: 94vw; position: relative;">
      <!-- Title Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: linear-gradient(180deg, #181d2a 0%, #0d1017 100%); border-bottom: 1px solid rgba(212,167,68,0.35);">
        <div style="font-family: 'Cinzel', serif; font-size: 14px; font-weight: bold; color: #f5df93; display: flex; align-items: center; gap: 8px;">
          👥 Contatos, Amigos &amp; Mentoria
        </div>
        <button id="close-referral-modal-btn" onclick="window.closeContactsModal ? window.closeContactsModal() : window.closeReferralModal()" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 2px 6px; line-height: 1;" title="Fechar">✕</button>
      </div>

      <!-- Tabs Bar -->
      <div class="l2contacts-tabs-bar">
        <button class="l2contacts-tab ${_contactsActiveTab === 'friends' ? 'active' : ''}" data-ctab="friends">
          👥 Amigos (${s.friends.length}/128)
        </button>
        <button class="l2contacts-tab ${_contactsActiveTab === 'block' ? 'active' : ''}" data-ctab="block">
          🚫 Bloqueados (${s.blocked.length}/64)
        </button>
        <button class="l2contacts-tab ${_contactsActiveTab === 'mentorship' ? 'active' : ''}" data-ctab="mentorship">
          🎓 Mentoria &amp; Indicação
        </button>
      </div>

      ${contentHtml}
    </div>
  `;

  // Attach Event Handlers
  modal.querySelectorAll('.l2contacts-tab').forEach(tBtn => {
    tBtn.onclick = () => {
      _contactsActiveTab = tBtn.dataset.ctab;
      uiOpenReferralModal(s);
    };
  });

  const closeBtn = modal.querySelector('#close-referral-modal-btn');
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeContactsModal();
    };
  }

  modal.querySelectorAll('.contact-friend-row').forEach(row => {
    row.onclick = (e) => {
      if (e.target.closest('button')) return;
      _contactsSelectedFriendName = row.dataset.name;
      uiOpenReferralModal(s);
    };
  });

  const addFriendBtn = modal.querySelector('#btn-contact-add-friend');
  if (addFriendBtn) {
    addFriendBtn.onclick = async () => {
      const name = prompt('Digite o nome do personagem para adicionar aos amigos:');
      if (name && name.trim()) {
        const cleanName = name.trim();
        if (s.friends.some(f => f.name.toLowerCase() === cleanName.toLowerCase())) {
          if (window.showMarketToast) window.showMarketToast('Este amigo já está na sua lista!', 'warning');
          return;
        }
        const myName = (s.name || s.charName || s.heroName || '').trim();
        if (cleanName.toLowerCase() === myName.toLowerCase()) {
          if (window.showMarketToast) window.showMarketToast('Você não pode adicionar a si mesmo!', 'warning');
          return;
        }

        try {
          addFriendBtn.disabled = true;
          let newFriend = null;

          if (typeof window !== 'undefined' && window.FirebaseBridge?.addFriend) {
            const myId = s.characterId || `char_${(window.FirebaseBridge?.getCurrentUserId?.() || 'me').slice(0, 16)}`;
            newFriend = await window.FirebaseBridge.addFriend(myId, cleanName);
          } else {
            throw new Error('Serviço de busca de aventureiros indisponível no momento.');
          }

          if (newFriend) {
            s.friends.push(newFriend);
            if (typeof window.saveGameState === 'function') window.saveGameState();
            if (window.showMarketToast) window.showMarketToast(`Amigo ${newFriend.name} adicionado com sucesso!`, 'success');
            uiOpenReferralModal(s);
          }
        } catch (err) {
          const msg = err?.code === 'PLAYER_NOT_FOUND' 
            ? `O aventureiro "${cleanName}" não existe no mundo de Aden.`
            : (err?.message || 'Não foi possível adicionar o aventureiro.');
          if (window.showMarketToast) window.showMarketToast(msg, 'error');
        } finally {
          addFriendBtn.disabled = false;
        }
      }
    };
  }

  const delFriendBtn = modal.querySelector('#btn-contact-del-friend');
  if (delFriendBtn) {
    delFriendBtn.onclick = async () => {
      if (!_contactsSelectedFriendName) {
        if (window.showMarketToast) window.showMarketToast('Selecione um amigo na tabela para remover.', 'warning');
        return;
      }
      const targetFriend = s.friends.find(f => f.name === _contactsSelectedFriendName);
      s.friends = s.friends.filter(f => f.name !== _contactsSelectedFriendName);
      
      if (typeof window !== 'undefined' && window.FirebaseBridge?.removeFriend && targetFriend?.characterId) {
        try {
          const myId = s.characterId || `char_${(window.FirebaseBridge?.getCurrentUserId?.() || 'me').slice(0, 16)}`;
          await window.FirebaseBridge.removeFriend(myId, targetFriend.characterId);
        } catch (e) {}
      }

      if (window.showMarketToast) window.showMarketToast(`Amigo ${_contactsSelectedFriendName} removido da lista.`, 'info');
      _contactsSelectedFriendName = null;
      if (typeof window.saveGameState === 'function') window.saveGameState();
      uiOpenReferralModal(s);
    };
  }

  const partyInviteBtn = modal.querySelector('#btn-friend-party-invite');
  if (partyInviteBtn) {
    partyInviteBtn.onclick = () => {
      const target = _contactsSelectedFriendName || (s.friends[0] && s.friends[0].name);
      if (!target) {
        if (window.showMarketToast) window.showMarketToast('Adicione ou selecione um amigo para convidar!', 'warning');
        return;
      }
      if (window.showMarketToast) window.showMarketToast(`📢 Convite de grupo enviado para ${target}!`, 'success');
    };
  }

  const clanInviteBtn = modal.querySelector('#btn-friend-clan-invite');
  if (clanInviteBtn) {
    clanInviteBtn.onclick = () => {
      const target = _contactsSelectedFriendName || (s.friends[0] && s.friends[0].name);
      if (!target) {
        if (window.showMarketToast) window.showMarketToast('Adicione ou selecione um amigo para convidar!', 'warning');
        return;
      }
      if (window.showMarketToast) window.showMarketToast(`⚑ Convite de clã enviado para ${target}!`, 'success');
    };
  }

  const detailedInfoBtn = modal.querySelector('#btn-friend-detailed-info');
  if (detailedInfoBtn) {
    detailedInfoBtn.onclick = () => {
      const friend = s.friends.find(f => f.name === _contactsSelectedFriendName) || s.friends[0];
      if (!friend) {
        if (window.showMarketToast) window.showMarketToast('Selecione um amigo para ver informações detalhadas.', 'warning');
        return;
      }
      if (window.showMarketToast) window.showMarketToast(`🗎 [${friend.name}] Nv. ${friend.level} · Classe: ${friend.classTitle} · ${friend.online ? 'Online' : 'Offline'}`, 'info');
    };
  }

  const makeMentorBtn = modal.querySelector('#btn-friend-make-mentor');
  if (makeMentorBtn) {
    makeMentorBtn.onclick = () => {
      const friend = s.friends.find(f => f.name === _contactsSelectedFriendName) || s.friends[0];
      if (!friend) {
        if (window.showMarketToast) window.showMarketToast('Selecione um amigo na lista para tornar seu mentor.', 'warning');
        return;
      }
      if ((s.level || 1) > 20) {
        if (window.showMarketToast) window.showMarketToast('Apenas heróis até o Nível 20 podem vincular um Mentor. Você já é experiente!', 'warning');
        return;
      }
      if (s.referredBy) {
        if (window.showMarketToast) window.showMarketToast(`Você já possui o mentor [${s.referredBy}] vinculado!`, 'warning');
        return;
      }
      _contactsActiveTab = 'mentorship';
      uiOpenReferralModal(s);
      setTimeout(() => {
        const inp = document.getElementById('ref-friend-code-input');
        if (inp) {
          inp.value = friend.name;
          inp.focus();
        }
      }, 50);
    };
  }

  modal.querySelectorAll('.btn-friend-msg').forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      const n = b.dataset.name;
      if (window.showMarketToast) window.showMarketToast(`💬 Sussurro enviado para ${n}: "Olá companheiro!"`, 'info');
    };
  });

  modal.querySelectorAll('.btn-friend-mail').forEach(b => {
    b.onclick = (e) => {
      e.stopPropagation();
      const n = b.dataset.name;
      if (window.showMarketToast) window.showMarketToast(`✉️ Correio expresso enviado para ${n}!`, 'gold');
    };
  });

  const addBlockBtn = modal.querySelector('#btn-contact-add-block');
  if (addBlockBtn) {
    addBlockBtn.onclick = () => {
      const name = prompt('Digite o nome do jogador para bloquear:');
      if (name && name.trim()) {
        const cleanName = name.trim();
        if (!s.blocked.includes(cleanName)) {
          s.blocked.push(cleanName);
          if (typeof window.saveGameState === 'function') window.saveGameState();
          if (window.showMarketToast) window.showMarketToast(`Jogador ${cleanName} bloqueado.`, 'info');
          uiOpenReferralModal(s);
        }
      }
    };
  }

  modal.querySelectorAll('.btn-unblock-player').forEach(b => {
    b.onclick = () => {
      const name = b.dataset.name;
      s.blocked = s.blocked.filter(n => n !== name);
      if (typeof window.saveGameState === 'function') window.saveGameState();
      if (window.showMarketToast) window.showMarketToast(`Jogador ${name} desbloqueado.`, 'success');
      uiOpenReferralModal(s);
    };
  });
}

if (typeof window !== 'undefined') {
  window.closeContactsModal = closeContactsModal;
  window.closeReferralModal = closeContactsModal;
  window.openContactsModal = (tab) => uiOpenReferralModal(undefined, tab);
  window.openReferralModal = (tab) => uiOpenReferralModal(undefined, tab);
}

/* ═══════════════════════════════════════════════════════════════════════════
   16. ABA DE MASMORRAS DIÁRIAS & EPIC RAID BOSSES
═══════════════════════════════════════════════════════════════════════════ */
export function renderRaidsTab(container, state) {
  if (!container || !state) return;

  const raidBosses = RAID_BOSSES || (D() && D().RAID_BOSSES) || {};
  const status = typeof getRaidStatus === 'function' ? getRaidStatus(state) : {
    tickets: state.dailyRaidTickets ?? 3,
    maxTickets: 3,
    clears: state.dailyRaidClears || {},
    totalKills: state.totalRaidKills || 0
  };

  const currentHeroLvl = state.level || 1;

  const cardsHtml = Object.entries(raidBosses).map(([id, boss]) => {
    const isLocked = currentHeroLvl < (boss.reqLvl || 1);
    const inCombat = state.isRaidActive && state.activeRaidId === id;
    const timesCleared = status.clears[id] || 0;
    const hasTickets = (status.tickets || 0) > 0;

    let diffBadge = '⭐ Normal';
    let diffColor = '#60a5fa';
    if (boss.lvl >= 100) { diffBadge = '👑 SUPREMO'; diffColor = '#ffd700'; }
    else if (boss.lvl >= 90) { diffBadge = '⭐⭐⭐⭐⭐ Lendário'; diffColor = '#f59e0b'; }
    else if (boss.lvl >= 75) { diffBadge = '⭐⭐⭐⭐ Mítico'; diffColor = '#c084fc'; }
    else if (boss.lvl >= 60) { diffBadge = '⭐⭐⭐ Épico'; diffColor = '#f43f5e'; }
    else if (boss.lvl >= 50) { diffBadge = '⭐⭐ Desafiador'; diffColor = '#34d399'; }

    let actionBtnHtml = '';
    if (inCombat) {
      actionBtnHtml = `<button disabled style="width:100%; padding:10px; font-weight:bold; font-size:12px; background:linear-gradient(180deg,#16a34a,#15803d); border:1px solid #4ade80; color:#fff; border-radius:6px; cursor:default; animation:pulse 1.5s infinite;">⚔️ EM COMBATE ATIVO</button>`;
    } else if (isLocked) {
      actionBtnHtml = `<button disabled style="width:100%; padding:10px; font-weight:bold; font-size:12px; background:#27272a; border:1px solid #3f3f46; color:#71717a; border-radius:6px; cursor:not-allowed;">🔒 Bloqueado (Requer Lv. ${boss.reqLvl})</button>`;
    } else if (!hasTickets) {
      actionBtnHtml = `<button disabled style="width:100%; padding:10px; font-weight:bold; font-size:12px; background:#450a0a; border:1px solid #7f1d1d; color:#fca5a5; border-radius:6px; cursor:not-allowed;">🎟️ Sem Ingressos Diários</button>`;
    } else {
      actionBtnHtml = `
        <button
          onclick="window.startRaidBossAction('${id}')"
          style="width:100%; padding:10px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:linear-gradient(180deg,#dc2626,#991b1b); border:1px solid #f87171; color:#fff; border-radius:6px; cursor:pointer; box-shadow:0 0 10px rgba(220,38,38,0.4); transition:all 0.2s;"
          onmouseover="this.style.filter='brightness(1.15)'"
          onmouseout="this.style.filter='none'"
        >
          ⚔️ DESAFIAR RAID (1 🎟️)
        </button>
      `;
    }

    const mechanicsHtml = (boss.mechanics || []).map(m => `
      <span style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); border-radius:4px; padding:2px 6px; font-size:10px; color:#e2e8f0;">
        ⚡ ${m.name}
      </span>
    `).join('');

    const dropsPreviewHtml = (boss.drops || []).map(d => {
      const isEpic = d.isEpicJewel;
      const isAC = d.itemId === 'adena_coins';
      const borderCol = isEpic ? '#ffd700' : (isAC ? '#38bdf8' : '#a855f7');
      const bgCol = isEpic ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.4)';
      return `
        <div style="display:flex; align-items:center; gap:4px; background:${bgCol}; border:1px solid ${borderCol}; border-radius:4px; padding:2px 6px; font-size:10px; color:${isEpic ? '#ffd700' : '#f8fafc'}; font-weight:${isEpic ? 'bold' : 'normal'};">
          <span>${isEpic ? '👑' : (isAC ? '🪙' : '🎁')}</span>
          <span>${d.name}</span>
          <span style="color:#94a3b8; font-size:9px;">(${Math.round(d.chance * 100)}%)</span>
        </div>
      `;
    }).join('');

    return `
      <div style="background:linear-gradient(145deg, rgba(24,18,14,0.95), rgba(12,9,7,0.98)); border:1px solid ${inCombat ? '#22c55e' : (isLocked ? 'rgba(80,60,40,0.3)' : 'rgba(212,175,55,0.4)')}; border-radius:10px; padding:14px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 4px 15px rgba(0,0,0,0.6); position:relative;">
        <div>
          <!-- Header do Card -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <div>
              <div style="font-family:'Cinzel',serif; font-size:15px; font-weight:bold; color:#fef08a;">${boss.name}</div>
              <div style="font-size:11px; color:#94a3b8; font-style:italic;">${boss.title || 'Chefe de Raid'}</div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
              <span style="background:rgba(0,0,0,0.6); border:1px solid ${diffColor}; color:${diffColor}; font-size:10px; font-weight:bold; padding:2px 8px; border-radius:10px;">
                ${diffBadge}
              </span>
              <span style="font-size:10px; color:#cbd5e1;">Req. Lv. ${boss.reqLvl}</span>
            </div>
          </div>

          <!-- Status do Boss -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.06); border-radius:6px; padding:8px; margin-bottom:8px; font-size:11px;">
            <div>❤️ HP: <strong style="color:#ef4444;">${boss.hp.toLocaleString()}</strong></div>
            <div>⚔️ P.ATK: <strong style="color:#f87171;">${boss.atk}</strong></div>
            <div>🛡️ P.DEF: <strong style="color:#60a5fa;">${boss.def}</strong></div>
            <div>🔮 M.DEF: <strong style="color:#c084fc;">${boss.mdef}</strong></div>
          </div>

          <!-- Descrição -->
          <p style="font-size:11px; color:#94a3b8; line-height:1.35; margin:0 0 8px 0;">${boss.desc}</p>

          <!-- Mecânicas -->
          <div style="margin-bottom:8px;">
            <div style="font-size:10px; font-weight:bold; color:#d4af37; text-transform:uppercase; margin-bottom:4px;">Mecânicas Especiais:</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">${mechanicsHtml}</div>
          </div>

          <!-- Drops Épicos -->
          <div style="margin-bottom:12px;">
            <div style="font-size:10px; font-weight:bold; color:#ffd700; text-transform:uppercase; margin-bottom:4px;">Drops Notáveis:</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">${dropsPreviewHtml}</div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:#cbd5e1; margin-bottom:6px; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
            <span>Conclusões Hoje:</span>
            <strong style="color:${timesCleared > 0 ? '#4ade80' : '#e2e8f0'};">${timesCleared}x derrotado</strong>
          </div>
          ${actionBtnHtml}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="padding:14px; max-width:980px; margin:0 auto; font-family:'IBM Plex Sans',sans-serif; color:#f8fafc;">
      <!-- Banner Superior -->
      <div style="background:linear-gradient(135deg, rgba(212,175,55,0.18), rgba(220,38,38,0.18)); border:1px solid #ffd700; border-radius:12px; padding:16px; margin-bottom:16px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h2 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#ffd700; font-size:20px; display:flex; align-items:center; gap:8px;">
              <span>🐉 Masmorras Diárias &amp; Epic Raid Bosses</span>
            </h2>
            <p style="margin:0; font-size:12px; color:#cbd5e1; line-height:1.4;">
              Enfrente as lendas de Lineage II para conquistar <strong>Joias de Chefe Lendárias</strong> (+Crit Dmg, +Lifesteal, +Stats), <strong>Blessed Scrolls</strong> e <strong>Adena</strong>!
            </p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <div style="background:rgba(0,0,0,0.55); border:1px solid #ffd700; border-radius:8px; padding:8px 14px; text-align:center;">
              <div style="font-size:10px; color:#cbd5e1; text-transform:uppercase;">Ingressos Diários</div>
              <div style="font-size:18px; font-weight:bold; color:#fde047;">🎟️ ${status.tickets}/${status.maxTickets}</div>
            </div>
            <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:8px 14px; text-align:center;">
              <div style="font-size:10px; color:#cbd5e1; text-transform:uppercase;">Abates Épicos</div>
              <div style="font-size:18px; font-weight:bold; color:#4ade80;">💀 ${status.totalKills}</div>
            </div>
          </div>
        </div>
      </div>

      ${currentHeroLvl < 30 ? `
        <div style="background:linear-gradient(135deg, rgba(35,25,12,0.95), rgba(20,15,5,0.98)); border:1px solid #eab308; border-radius:10px; padding:14px 18px; margin-bottom:16px; display:flex; align-items:center; gap:14px; box-shadow:0 4px 15px rgba(0,0,0,0.4);">
          <div style="font-size:32px; background:rgba(0,0,0,0.4); border-radius:8px; padding:6px 10px; border:1px solid rgba(234,179,8,0.3);">👑</div>
          <div>
            <div style="font-family:'Cinzel',serif; font-weight:bold; color:#fde047; font-size:14px;">Primeira Raid Desbloqueia no Nível 30!</div>
            <div style="font-size:12px; color:#cbd5e1; margin-top:3px; line-height:1.4;">
              As Raids Mundiais foram reveladas na sua jornada no Nível 20. Sua primeira batalha colossal será contra a <strong>Rainha Formiga (Queen Ant)</strong>, disponível no <strong>Nível 30</strong>. Continue evoluindo seu personagem pelas zonas de caça e fortalecendo seus equipamentos para encarar o desafio!
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Grid de Bosses -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:14px;">
        ${cardsHtml}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   17. ABA DE GRAND OLYMPIAD GAMES & HERÓIS DE CLASSE
═══════════════════════════════════════════════════════════════════════════ */
export function renderOlympiadTab(container, state) {
  if (!container || !state) return;

  const olyStatus = OlympiadService.getOlympiadStatus(state);
  const activeSubTab = window._activeOlympiadSubTab || 'arena';

  window.setOlympiadSubTab = (subTab) => {
    window._activeOlympiadSubTab = subTab;
    if (typeof window.updateOlympiadUI === 'function') {
      window.updateOlympiadUI();
    } else {
      renderOlympiadTab(container, state);
    }
  };

  // 1. Sub-aba: Arena de Duelos 1v1
  let subContentHtml = '';
  if (activeSubTab === 'arena') {
    const gladiator = OlympiadService.getGladiatorOpponent(state);
    const heroHpMax = state.maxHp || 15000;
    const heroAtk = Math.max(state.atk || 450, 200);
    const heroMatk = Math.max(state.matk || 400, 150);
    const heroDef = Math.max(state.def || 350, 150);
    const heroMdef = Math.max(state.mdef || 300, 150);

    let fightBtnHtml = '';
    if (!olyStatus.canEnter) {
      fightBtnHtml = `
        <button disabled style="width:100%; padding:14px; font-weight:bold; font-size:13px; background:#27272a; border:1px solid #3f3f46; color:#a1a1aa; border-radius:8px; cursor:not-allowed;">
          🔒 ${olyStatus.reason}
        </button>
      `;
    } else {
      fightBtnHtml = `
        <button
          onclick="window.startOlympiadMatchAction()"
          style="width:100%; padding:14px; font-family:'Cinzel',serif; font-weight:bold; font-size:14px; background:linear-gradient(180deg,#eab308,#ca8a04); border:1px solid #fde047; color:#000; border-radius:8px; cursor:pointer; box-shadow:0 0 15px rgba(234,179,8,0.5); transition:all 0.2s;"
          onmouseover="this.style.filter='brightness(1.15)'"
          onmouseout="this.style.filter='none'"
        >
          ⚔️ ENFILEIRAR DUELO RANQUEADO (1v1)
        </button>
      `;
    }

    subContentHtml = `
      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,215,0,0.25); border-radius:10px; padding:16px; margin-bottom:16px;">
        <div style="text-align:center; margin-bottom:16px;">
          <h3 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#fde047; font-size:18px;">🏟️ Coliseu Imperial de Aden</h3>
          <p style="margin:0; font-size:12px; color:#cbd5e1;">Enfrente gladiadores do seu nível de pontuação em combate 1v1. Vitórias concedem pontos de ELO e <strong>Olympiad Tokens</strong>!</p>
        </div>

        <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:12px; align-items:center; margin-bottom:16px;">
          <!-- Seu Herói -->
          <div style="background:rgba(0,0,0,0.5); border:1px solid #3b82f6; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#93c5fd; text-transform:uppercase; font-weight:bold;">Seu Personagem</div>
            <div style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#fff; margin:4px 0;">${state.heroName || 'Você'}</div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:8px;">Lv. ${olyStatus.level} • ${olyStatus.tierName}</div>
            <div style="font-size:11px; text-align:left; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; line-height:1.4;">
              <div>❤️ HP Máx: <strong style="color:#ef4444;">${heroHpMax.toLocaleString()}</strong></div>
              <div>⚔️ P.Atk: <strong style="color:#f87171;">${heroAtk}</strong></div>
              <div>🔮 M.Atk: <strong style="color:#c084fc;">${heroMatk}</strong></div>
              <div>🛡️ P.Def: <strong style="color:#60a5fa;">${heroDef}</strong> | M.Def: <strong style="color:#818cf8;">${heroMdef}</strong></div>
            </div>
          </div>

          <!-- VS -->
          <div style="text-align:center; font-family:'Cinzel',serif; font-size:22px; font-weight:bold; color:#ffd700; text-shadow:0 0 10px rgba(255,215,0,0.6);">
            VS
          </div>

          <!-- Oponente -->
          <div style="background:rgba(0,0,0,0.5); border:1px solid #ef4444; border-radius:8px; padding:12px; text-align:center;">
            <div style="font-size:11px; color:#fca5a5; text-transform:uppercase; font-weight:bold;">Gladiador da Arena</div>
            <div style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#f87171; margin:4px 0;">${gladiator.name}</div>
            <div style="font-size:11px; color:#cbd5e1; margin-bottom:8px;">Lv. ${gladiator.lvl} • ${gladiator.title}</div>
            <div style="font-size:11px; text-align:left; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; line-height:1.4;">
              <div>❤️ HP Máx: <strong style="color:#ef4444;">${gladiator.hp.toLocaleString()}</strong></div>
              <div>⚔️ P.Atk: <strong style="color:#f87171;">${gladiator.atk}</strong></div>
              <div>🛡️ P.Def: <strong style="color:#60a5fa;">${gladiator.def}</strong></div>
              <div>🔮 M.Def: <strong style="color:#c084fc;">${gladiator.mdef}</strong></div>
            </div>
          </div>
        </div>

        ${fightBtnHtml}
      </div>
    `;
  }
  // 2. Sub-aba: Saga de Noblesse (Possessor of a Precious Soul)
  else if (activeSubTab === 'noblesse') {
    const nobStatus = NoblesseService.getNoblesseStatus(state);
    const prog = nobStatus.progress || {};

    const steps = [
      {
        num: 1,
        title: 'Parte 1: O Legado de Eva & Talien',
        npc: '👤 Talien (Giran)',
        dialog: '"Nobre guerreiro, para comprovar o valor de sua alma, recupere as 25 Páginas do Poema de Eva caídas com as criaturas de Valley of Saints."',
        desc: 'Investigue o legado dos heróis antigos com Talien em Giran. Recupere as 25 Páginas do Poema de Eva em Valley of Saints.',
        progressText: `${prog.part1Kills || 0}/25 monstros em Valley of Saints`,
        travelBtn: (state.level || 1) >= 72
          ? `<button onclick="window.teleportToQuestZone('valleyOfSaints')" style="padding:4px 10px; font-size:10.5px; font-weight:bold; background:#1e3a8a; border:1px solid #60a5fa; color:#93c5fd; border-radius:4px; cursor:pointer; margin-top:4px;">🗺️ Ir para Valley of Saints</button>`
          : `<span style="display:inline-block; margin-top:4px; padding:3px 8px; font-size:10.5px; font-weight:bold; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); color:#fca5a5; border-radius:4px;">🔒 Requer Nível 72+ (Seu Nv: ${state.level || 1})</span>`,
        isDone: nobStatus.isNoblesse || (state.noblesseStep || 1) > 1,
        isCurrent: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 1,
        canComplete: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 1 && (prog.part1Kills || 0) >= 25,
        btnText: '💬 Entregar a Talien (Giran)'
      },
      {
        num: 2,
        title: 'Parte 2: Ritual de Virgil em Rune',
        npc: '👤 Virgil (Rune Township)',
        dialog: '"As almas do Pântano dos Gritos anseiam por libertação. Purifique 30 espíritos corrompidos em Swamp of Screams para consagrar a essência."',
        desc: 'Leve a carta sagrada a Virgil em Rune Township e purifique 30 espíritos no pântano sombrio de Swamp of Screams.',
        progressText: `${prog.part2Kills || 0}/30 almas em Swamp of Screams`,
        travelBtn: (state.level || 1) >= 74
          ? `<button onclick="window.teleportToQuestZone('swampOfScreams')" style="padding:4px 10px; font-size:10.5px; font-weight:bold; background:#1e3a8a; border:1px solid #60a5fa; color:#93c5fd; border-radius:4px; cursor:pointer; margin-top:4px;">🗺️ Ir para Swamp of Screams</button>`
          : `<span style="display:inline-block; margin-top:4px; padding:3px 8px; font-size:10.5px; font-weight:bold; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); color:#fca5a5; border-radius:4px;">🔒 Requer Nível 74+ (Seu Nv: ${state.level || 1})</span>`,
        isDone: nobStatus.isNoblesse || (state.noblesseStep || 1) > 2,
        isCurrent: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 2,
        canComplete: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 2 && (prog.part2Kills || 0) >= 30,
        btnText: '💬 Falar com Virgil (Rune)'
      },
      {
        num: 3,
        title: 'Parte 3: O Julgamento de Barakiel',
        npc: '👤 Caradine (Goddard)',
        dialog: '"O Cajado Sagrado da Deusa está nas mãos do temível Flame of Splendor Barakiel em Wall of Argos. Derrote-o em combate épico para recuperá-lo!"',
        desc: 'Ajude Caradine em Wall of Argos e derrote o lendário Raid Boss Flame of Splendor Barakiel para recuperar o Cajado da Deusa.',
        progressText: prog.barakielKilled ? '✓ Barakiel Derrotado' : 'Derrotar Raid Boss Barakiel',
        travelBtn: `<button onclick="window.startRaidBossAction('barakiel')" style="padding:4px 10px; font-size:10.5px; font-weight:bold; background:#7f1d1d; border:1px solid #f87171; color:#fca5a5; border-radius:4px; cursor:pointer; margin-top:4px;">⚔️ Desafiar Raid Barakiel</button>`,
        isDone: nobStatus.isNoblesse || (state.noblesseStep || 1) > 3,
        isCurrent: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 3,
        canComplete: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 3 && Boolean(prog.barakielKilled),
        btnText: '💬 Entregar Cajado a Caradine'
      },
      {
        num: 4,
        title: 'Parte 4: Consagração da Deusa Eva',
        npc: '👑 Lady of the Lake (Obelisco Sagrado)',
        dialog: '"Sua alma é pura e valorosa. Apresente o cajado consagrado da Deusa Eva e receba a sagração eterna como Noblesse de Aden!"',
        desc: 'Apresente o cajado sagrado à Lady of the Lake. Receba a Bênção Sagrada, a Noblesse Tiara e a sagração como Nobre de Aden!',
        progressText: nobStatus.isNoblesse ? '✓ Noblesse Consagrado' : 'Apresentar à Lady of the Lake',
        travelBtn: '',
        isDone: nobStatus.isNoblesse,
        isCurrent: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 4,
        canComplete: !nobStatus.isNoblesse && (state.noblesseStep || 1) === 4,
        btnText: '👑 Falar com Lady of the Lake (Consagração)'
      }
    ];

    const stepsHtml = steps.map(s => {
      let statusBadge = `<span style="color:#94a3b8; font-size:11px;">🔒 Bloqueado</span>`;
      let btnHtml = '';

      if (s.isDone) {
        statusBadge = `<span style="color:#4ade80; font-size:11px; font-weight:bold;">✓ Concluído</span>`;
      } else if (s.isCurrent) {
        statusBadge = `<span style="color:#fde047; font-size:11px; font-weight:bold;">⚡ Em Andamento (${s.progressText})</span>`;
        if (s.canComplete) {
          btnHtml = `
            <button
              onclick="window.completeNoblesseStepAction(${s.num})"
              style="padding:8px 16px; font-weight:bold; font-size:11.5px; background:linear-gradient(180deg,#16a34a,#15803d); border:1px solid #4ade80; color:#fff; border-radius:6px; cursor:pointer; box-shadow:0 0 10px rgba(74,222,128,0.4);"
            >
              ${s.btnText}
            </button>
          `;
        } else {
          btnHtml = `
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
              ${s.travelBtn}
              <button disabled style="padding:6px 12px; font-size:10.5px; background:#27272a; border:1px solid #3f3f46; color:#71717a; border-radius:6px; cursor:not-allowed;">
                Progresso Pendente
              </button>
            </div>
          `;
        }
      }

      return `
        <div style="background:rgba(0,0,0,0.45); border:1px solid ${s.isDone ? 'rgba(74,222,128,0.3)' : (s.isCurrent ? 'rgba(253,224,71,0.5)' : 'rgba(255,255,255,0.08)')}; border-radius:8px; padding:14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-family:'Cinzel',serif; font-size:13.5px; font-weight:bold; color:${s.isDone ? '#4ade80' : (s.isCurrent ? '#fde047' : '#e2e8f0')};">${s.title}</span>
              ${statusBadge}
            </div>
            <div style="font-size:11px; color:#fef08a; font-style:italic; margin-bottom:4px;">${s.npc}: ${s.dialog}</div>
            <p style="margin:0; font-size:11px; color:#cbd5e1; line-height:1.35;">${s.desc}</p>
          </div>
          <div>${btnHtml}</div>
        </div>
      `;
    }).join('');

    subContentHtml = `
      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,215,0,0.25); border-radius:10px; padding:16px; margin-bottom:16px;">
        <div style="margin-bottom:14px;">
          <h3 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#fde047; font-size:17px;">📜 Saga de Noblesse: Possessor of a Precious Soul</h3>
          <p style="margin:0; font-size:12px; color:#cbd5e1;">Requisito canônico para acessar a <strong>Grand Olympiad (Lv. 76+)</strong>. Conclua as 4 partes da saga para receber a <strong>Noblesse Tiara</strong> e o título permanente de Nobreza!</p>
        </div>
        ${stepsHtml}
      </div>
    `;
  }
  // 3. Sub-aba: Monumento dos Heróis & Armas Infinity
  else if (activeSubTab === 'monument') {
    const weaponsListHtml = Object.values(INFINITY_WEAPONS).map(w => `
      <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,215,0,0.3); border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:#ffd700; margin-bottom:4px;">${w.name}</div>
          <p style="font-size:11px; color:#cbd5e1; line-height:1.35; margin:0 0 8px 0;">${w.desc}</p>
        </div>
        <div style="font-size:10px; color:#93c5fd; background:rgba(0,0,0,0.4); padding:4px 8px; border-radius:4px;">
          Requer: Lv. 76+ &amp; Status de Herói Ativo
        </div>
      </div>
    `).join('');

    const heroSkillsHtml = Object.values(HEROIC_SKILLS).map(s => `
      <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(192,132,252,0.3); border-radius:8px; padding:10px;">
        <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#c084fc; margin-bottom:4px;">${s.name}</div>
        <p style="font-size:11px; color:#cbd5e1; margin:0; line-height:1.35;">${s.desc}</p>
      </div>
    `).join('');

    let claimBtnHtml = '';
    if (state.isHero) {
      claimBtnHtml = `<div style="text-align:center; padding:12px; background:rgba(234,179,8,0.2); border:1px solid #ffd700; border-radius:8px; color:#fde047; font-weight:bold; font-size:14px;">👑 VOCÊ É UM HERÓI DE CLASSE SUPREMO DE ADEN!</div>`;
    } else if (olyStatus.points >= 1500) {
      claimBtnHtml = `
        <button
          onclick="window.claimHeroStatusAction('weapon_infinity_blade')"
          style="width:100%; padding:14px; font-family:'Cinzel',serif; font-weight:bold; font-size:14px; background:linear-gradient(180deg,#ffd700,#b45309); border:1px solid #fef08a; color:#000; border-radius:8px; cursor:pointer; box-shadow:0 0 20px rgba(255,215,0,0.7); animation:pulse 1.5s infinite;"
        >
          👑 REIVINDICAR COROA DE HERÓI (Desbloquear Aura &amp; Armas Infinity)
        </button>
      `;
    } else {
      claimBtnHtml = `
        <div style="text-align:center; padding:10px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1); border-radius:8px; color:#94a3b8; font-size:12px;">
          Alcance <strong>1.500 Pontos de Olimpíada</strong> para ser consagrado Herói da sua Classe! (Atual: ${olyStatus.points} pts)
        </div>
      `;
    }

    subContentHtml = `
      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,215,0,0.25); border-radius:10px; padding:16px; margin-bottom:16px;">
        <div style="margin-bottom:14px;">
          <h3 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#fde047; font-size:17px;">👑 Monumento dos Heróis da Grand Olympiad</h3>
          <p style="margin:0; font-size:12px; color:#cbd5e1;">Os campeões absolutos de cada classe recebem a <strong>Aura Dourada Cintilante</strong>, as <strong>Armas Infinity</strong> e as 4 <strong>Habilidades Míticas de Herói</strong>.</p>
        </div>

        <div style="margin-bottom:16px;">${claimBtnHtml}</div>

        <div style="margin-bottom:16px;">
          <div style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:#ffd700; margin-bottom:8px;">⚔️ Arsenal de Armas Infinity de Herói:</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:10px;">
            ${weaponsListHtml}
          </div>
        </div>

        <div>
          <div style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:#c084fc; margin-bottom:8px;">🌟 Habilidades Heroicas Míticas:</div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:8px;">
            ${heroSkillsHtml}
          </div>
        </div>
      </div>
    `;
  }
  // 4. Sub-aba: Loja de Tokens de Olimpíada
  else if (activeSubTab === 'shop') {
    const shopCardsHtml = OLYMPIAD_SHOP_CATALOG.map(item => {
      const canAfford = (olyStatus.tokens || 0) >= item.priceTokens;
      return `
        <div style="background:rgba(0,0,0,0.5); border:1px solid ${canAfford ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:12px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="font-family:'Cinzel',serif; font-size:13.5px; font-weight:bold; color:#38bdf8; margin-bottom:4px;">${item.name}</div>
            <p style="font-size:11px; color:#cbd5e1; line-height:1.35; margin:0 0 10px 0;">${item.desc}</p>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.08); padding-top:8px;">
            <div style="font-weight:bold; font-size:12px; color:#fde047;">🪙 ${item.priceTokens} Tokens</div>
            <button
              ${canAfford ? '' : 'disabled'}
              onclick="window.buyOlympiadItemAction('${item.id}')"
              style="padding:6px 14px; font-weight:bold; font-size:11px; background:${canAfford ? 'linear-gradient(180deg,#0284c7,#0369a1)' : '#27272a'}; border:1px solid ${canAfford ? '#38bdf8' : '#3f3f46'}; color:${canAfford ? '#fff' : '#71717a'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
            >
              Comprar
            </button>
          </div>
        </div>
      `;
    }).join('');

    subContentHtml = `
      <div style="background:rgba(15,23,42,0.6); border:1px solid rgba(255,215,0,0.25); border-radius:10px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <div>
            <h3 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#fde047; font-size:17px;">🛍️ Loja de Tokens de Olimpíada (Noblesse Gate Pass)</h3>
            <p style="margin:0; font-size:12px; color:#cbd5e1;">Adquira Giant's Codex, Blessed Scrolls S-Grade e suprimentos raros com seus tokens.</p>
          </div>
          <div style="background:rgba(0,0,0,0.6); border:1px solid #fde047; border-radius:8px; padding:6px 14px; font-weight:bold; color:#fde047; font-size:13px;">
            🪙 Saldo: ${olyStatus.tokens.toLocaleString()} Tokens
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(270px, 1fr)); gap:12px;">
          ${shopCardsHtml}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:14px; max-width:980px; margin:0 auto; font-family:'IBM Plex Sans',sans-serif; color:#f8fafc;">
      <!-- Header Banner Superior -->
      <div style="background:linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.2)); border:1px solid #ffd700; border-radius:12px; padding:16px; margin-bottom:14px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <div>
            <h2 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#ffd700; font-size:20px; display:flex; align-items:center; gap:8px;">
              <span>🏆 Grand Olympiad Games &amp; Heróis de Classe</span>
            </h2>
            <p style="margin:0; font-size:12px; color:#cbd5e1; line-height:1.4;">
              Duelos ranqueados 1v1 para Nobres (<strong>Lv. 76+ &amp; Noblesse</strong>). Conquiste a coroa de <strong>HERO</strong>, a <strong>Aura Dourada</strong> e as <strong>Armas Infinity</strong>!
            </p>
          </div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <div style="background:rgba(0,0,0,0.55); border:1px solid ${olyStatus.isNoblesse ? '#4ade80' : '#ef4444'}; border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:9.5px; color:#cbd5e1; text-transform:uppercase;">Status</div>
              <div style="font-size:12px; font-weight:bold; color:${olyStatus.isNoblesse ? '#4ade80' : '#f87171'};">
                ${olyStatus.isNoblesse ? '👑 Noblesse' : '🔒 Não-Noblesse'}
              </div>
            </div>
            <div style="background:rgba(0,0,0,0.55); border:1px solid #ffd700; border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:9.5px; color:#cbd5e1; text-transform:uppercase;">Pontuação ELO</div>
              <div style="font-size:13px; font-weight:bold; color:#fde047;">🏆 ${olyStatus.points} pts</div>
            </div>
            <div style="background:rgba(0,0,0,0.55); border:1px solid #38bdf8; border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:9.5px; color:#cbd5e1; text-transform:uppercase;">Tokens</div>
              <div style="font-size:13px; font-weight:bold; color:#38bdf8;">🪙 ${olyStatus.tokens}</div>
            </div>
            <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:9.5px; color:#cbd5e1; text-transform:uppercase;">Cartel</div>
              <div style="font-size:12px; font-weight:bold; color:#a3e635;">${olyStatus.wins}V - ${olyStatus.losses}D</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navegação por Sub-Abas -->
      <div style="display:flex; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; flex-wrap:wrap;">
        <button
          onclick="window.setOlympiadSubTab('arena')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'arena' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'arena' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'arena' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          ⚔️ Arena 1v1
        </button>
        <button
          onclick="window.setOlympiadSubTab('noblesse')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'noblesse' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'noblesse' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'noblesse' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          📜 Saga de Noblesse
        </button>
        <button
          onclick="window.setOlympiadSubTab('monument')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'monument' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'monument' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'monument' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          👑 Monumento dos Heróis &amp; Armas Infinity
        </button>
        <button
          onclick="window.setOlympiadSubTab('shop')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'shop' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'shop' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'shop' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🛍️ Loja de Tokens
        </button>
      </div>

      <!-- Conteúdo da Sub-aba Ativa -->
      ${subContentHtml}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   15. CLAN & CASTLE SIEGES TAB (🏰 Clãs, Castelos & Sieges)
═══════════════════════════════════════════════════════════════════════════ */
export function renderClanTab(container, state) {
  if (!container || !state) return;
  const root = getRoot();
  const activeSubTab = window._activeClanSubTab || 'skills';

  // Atualizar geração passiva de impostos
  ClanService.updateTaxesTick(state);
  const clanStatus = ClanService.getClanStatus(state);
  const clan = clanStatus.clan;
  const lvlData = clanStatus.levelData;
  const nextLvl = clanStatus.nextLevelData;

  let subContentHtml = '';

  // 1. Sub-aba: Habilidades de Clã
  if (activeSubTab === 'skills') {
    const skillsHtml = Object.values(CLAN_SKILLS).map(sk => {
      const isUnlocked = clan.level >= sk.levelReq;
      const statusBadge = isUnlocked
        ? `<span style="color:#4ade80; font-size:11px; font-weight:bold;">✓ Ativa</span>`
        : `<span style="color:#94a3b8; font-size:11px;">🔒 Requer Clã Lv. ${sk.levelReq}</span>`;

      return `
        <div style="background:rgba(0,0,0,0.45); border:1px solid ${isUnlocked ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:12px; display:flex; align-items:center; gap:12px;">
          <div style="width:40px; height:40px; border-radius:6px; background:#18181b; border:1px solid ${isUnlocked ? '#4ade80' : '#3f3f46'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <img src="${getAssetUrl(sk.icon.startsWith('img/') || sk.icon.startsWith('assets/') || sk.icon.startsWith('/') ? sk.icon : 'img/icons/' + sk.icon)}" style="width:32px; height:32px; object-fit:contain; filter:${isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)'};" onerror="this.style.display='none'" />
          </div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
              <span style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:${isUnlocked ? '#fef08a' : '#94a3b8'};">${sk.name}</span>
              ${statusBadge}
            </div>
            <div style="font-size:11px; color:#cbd5e1; line-height:1.35;">${sk.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    subContentHtml = `
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:10px;">
        ${skillsHtml}
      </div>
    `;
  }
  // 2. Sub-aba: Castelos & Tributos de Aden
  else if (activeSubTab === 'castles') {
    const castlesHtml = Object.values(CASTLES).map(c => {
      const isOwned = clan.castles?.includes(c.id);
      const accTax = clan.accumulatedTaxes?.[c.id] || 0;

      return `
        <div style="background:rgba(0,0,0,0.45); border:1px solid ${isOwned ? 'rgba(234,179,8,0.5)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:${isOwned ? '#fde047' : '#e2e8f0'};">${c.name}</span>
              ${isOwned ? '<span style="background:rgba(234,179,8,0.2); border:1px solid #eab308; color:#fde047; font-size:10.5px; padding:2px 8px; border-radius:10px; font-weight:bold;">👑 Sob Seu Comando</span>' : '<span style="color:#94a3b8; font-size:11px;">Sem Senhor / Neutro</span>'}
            </div>
            <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:6px;">${c.desc}</div>
            <div style="font-size:11px; color:#94a3b8; display:flex; gap:14px; flex-wrap:wrap;">
              <span>📊 Taxa de Comércio: <strong style="color:#fde047;">${c.taxRatePercent}%</strong></span>
              <span>💰 Renda: <strong style="color:#a3e635;">${c.adenaPerMinute.toLocaleString()} Adena/min</strong></span>
              <span>⚔️ Nível Recomendado: <strong>Lv. ${c.reqCharLevel}+</strong></span>
            </div>
            ${isOwned ? `
              <div style="margin-top:8px; font-size:11.5px; color:#fef08a;">
                Tesouro do Castelo Acumulado: <strong style="color:#a3e635; font-size:13px;">${accTax.toLocaleString()} Adena</strong>
              </div>
            ` : ''}
          </div>
          <div>
            ${isOwned ? `
              <button
                onclick="window.claimCastleTaxesAction('${c.id}')"
                style="padding:8px 16px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#16a34a,#15803d); border:1px solid #4ade80; color:#fff; border-radius:6px; cursor:pointer;"
              >
                💰 Recolher Tributos
              </button>
            ` : `
              <button
                onclick="window.startCastleSiegeAction('${c.id}')"
                style="padding:8px 16px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#b91c1c,#991b1b); border:1px solid #ef4444; color:#fff; border-radius:6px; cursor:pointer;"
              >
                ⚔️ Declarar Cerco
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    subContentHtml = `<div>${castlesHtml}</div>`;
  }
  // 3. Sub-aba: Guerra de Cerco (Siege Arena)
  else if (activeSubTab === 'siege') {
    const siege = state.activeSiege;

    if (!siege || siege.isCompleted) {
      subContentHtml = `
        <div style="text-align:center; padding:30px; background:rgba(0,0,0,0.3); border-radius:8px; border:1px dashed rgba(255,255,255,0.1);">
          <div style="font-size:36px; margin-bottom:8px;">🏰</div>
          <div style="font-family:'Cinzel',serif; font-size:15px; color:#e2e8f0; margin-bottom:6px;">Nenhum Cerco Ativo no Momento</div>
          <div style="font-size:12px; color:#94a3b8; margin-bottom:14px;">Vá até a aba "Castelos &amp; Tributos" e declare guerra a um dos 5 castelos de Aden!</div>
          <button
            onclick="window.setClanSubTab('castles')"
            style="padding:8px 16px; font-size:11.5px; font-weight:bold; background:linear-gradient(180deg,#ca8a04,#a16207); border:1px solid #fde047; color:#fff; border-radius:6px; cursor:pointer;"
          >
            Ver Castelos Disponíveis
          </button>
        </div>
      `;
    } else {
      const phaseNames = {
        1: 'Fase 1: Destruição dos Portões Exteriores',
        2: 'Fase 2: Confronto com a Guarda Real do Castelo',
        3: 'Fase 3: Sala do Trono — Canalização do Seal of Ruler'
      };

      const hpCurrent = siege.phase === 1 ? siege.gateHp : (siege.phase === 2 ? siege.guardsHp : siege.castRounds);
      const hpMax = siege.phase === 1 ? siege.maxGateHp : (siege.phase === 2 ? siege.maxGuardsHp : siege.reqCastRounds);
      const hpPercent = Math.min(100, Math.max(0, Math.round((hpCurrent / hpMax) * 100)));

      subContentHtml = `
        <div style="background:rgba(0,0,0,0.5); border:1px solid #ef4444; border-radius:8px; padding:16px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <div>
              <div style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#f87171;">⚔️ CERCO ATIVO: ${siege.castleName}</div>
              <div style="font-size:12px; color:#fde047; font-weight:bold;">${phaseNames[siege.phase]}</div>
            </div>
            <button
              onclick="window.executeSiegeTurnAction()"
              style="padding:10px 20px; font-family:'Cinzel',serif; font-size:13px; font-weight:bold; background:linear-gradient(180deg,#dc2626,#b91c1c); border:1px solid #f87171; color:#fff; border-radius:6px; cursor:pointer; box-shadow:0 0 12px rgba(239,68,68,0.5);"
            >
              ${siege.phase === 3 ? '✨ Canalizar Seal of Ruler' : '⚔️ Desferir Ataque do Clã'}
            </button>
          </div>

          <!-- Barra de Progresso da Fase -->
          <div style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; font-size:11px; color:#cbd5e1; margin-bottom:4px;">
              <span>${siege.phase === 3 ? 'Progresso do Selo Sagrado' : 'HP do Alvo'}</span>
              <span>${hpCurrent.toLocaleString()} / ${hpMax.toLocaleString()} (${hpPercent}%)</span>
            </div>
            <div style="width:100%; height:12px; background:#18181b; border-radius:6px; overflow:hidden; border:1px solid #3f3f46;">
              <div style="width:${hpPercent}%; height:100%; background:${siege.phase === 3 ? 'linear-gradient(90deg,#eab308,#fde047)' : 'linear-gradient(90deg,#ef4444,#dc2626)'}; transition:width 0.3s ease;"></div>
            </div>
          </div>

          <!-- Log do Cerco -->
          <div style="background:#09090b; border:1px solid #27272a; border-radius:6px; padding:10px; max-height:140px; overflow-y:auto; font-family:monospace; font-size:11px; color:#cbd5e1;">
            ${(siege.logs || []).map(l => `<div style="margin-bottom:3px;">${l}</div>`).join('')}
          </div>
        </div>
      `;
    }
  }
  // 4. Sub-aba: Loja do Castelo
  else if (activeSubTab === 'shop') {
    const shopHtml = CASTLE_SHOP_CATALOG.map(item => `
      <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(234,179,8,0.3); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="width:40px; height:40px; border-radius:6px; background:#18181b; border:1px solid #eab308; display:flex; align-items:center; justify-content:center;">
            <img src="${getAssetUrl(item.icon.startsWith('img/') || item.icon.startsWith('assets/') || item.icon.startsWith('/') ? item.icon : 'img/icons/' + item.icon)}" style="width:32px; height:32px; object-fit:contain;" onerror="this.style.display='none'" />
          </div>
          <div>
            <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#fde047;">${item.name}</div>
            <div style="font-size:11px; color:#cbd5e1;">${item.desc}</div>
            <div style="font-size:11px; color:#a3e635; font-weight:bold; margin-top:2px;">Preço: ${item.priceAdena.toLocaleString()} Adena</div>
          </div>
        </div>
        <button
          onclick="window.buyCastleShopItemAction('${item.id}')"
          style="padding:6px 14px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#ca8a04,#a16207); border:1px solid #fde047; color:#fff; border-radius:6px; cursor:pointer;"
        >
          Comprar
        </button>
      </div>
    `).join('');

    subContentHtml = `<div>${shopHtml}</div>`;
  }
  // 5. Sub-aba: Membros & Doações
  else if (activeSubTab === 'roster') {
    const roster = ClanService.getClanRoster(state);
    const motto = clan.motto || 'Pela Glória e Honra de Aden!';
    const rep = clan.reputation || 100;
    const adenaDonated = clan.donationsAdena || 0;
    const spDonated = clan.donationsSp || 0;

    const rosterRows = roster.map(m => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06); font-size:12px;">
        <td style="padding:10px 8px; font-weight:bold; color:${m.isPlayer ? '#fde047' : '#e2e8f0'}; display:flex; align-items:center; gap:6px;">
          ${m.isPlayer ? '👑 ' : ''}${m.name} ${m.isPlayer ? '<span style="font-size:10px; background:rgba(234,179,8,0.25); color:#fde047; padding:1px 5px; border-radius:4px;">Você</span>' : ''}
        </td>
        <td style="padding:10px 8px; color:#cbd5e1;">${m.rank}</td>
        <td style="padding:10px 8px; color:#94a3b8;">Lv. ${m.level} (${m.className})</td>
        <td style="padding:10px 8px; text-align:right; font-weight:bold; color:#a3e635;">${m.contribution.toLocaleString()}</td>
      </tr>
    `).join('');

    subContentHtml = `
      <!-- Motto & Renomear Clã Card -->
      <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(234,179,8,0.25); border-radius:8px; padding:14px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <div style="font-family:'Cinzel',serif; font-size:13.5px; font-weight:bold; color:#fde047; margin-bottom:4px;">
            📜 Lema do Clã: <span style="font-style:italic; color:#e2e8f0;">"${motto}"</span>
          </div>
          <div style="font-size:11.5px; color:#94a3b8; display:flex; gap:16px; flex-wrap:wrap;">
            <span>🛡️ Reputação de Clã: <strong style="color:#fde047;">${rep.toLocaleString()} CRP</strong></span>
            <span>💰 Doação Total de Adena: <strong style="color:#a3e635;">${adenaDonated.toLocaleString()}</strong></span>
            <span>✨ Doação Total de SP: <strong style="color:#38bdf8;">${spDonated.toLocaleString()}</strong></span>
          </div>
        </div>
        <button
          onclick="const n = prompt('Novo lema do clã:', '${motto}'); if (n) window.createOrEditClanAction('${clan.name}', n);"
          style="padding:6px 14px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#ca8a04,#a16207); border:1px solid #fde047; color:#fff; border-radius:6px; cursor:pointer;"
        >
          ✏️ Editar Lema
        </button>
      </div>

      <!-- Doações Rápidas -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px; margin-bottom:14px;">
        <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#fde047; margin-bottom:8px;">
          🤝 Fundo do Clã &amp; Doações
        </div>
        <div style="font-size:11.5px; color:#94a3b8; margin-bottom:10px;">
          Doe Adena e Pontos de SP para aumentar a Reputação do Clã e financiar melhorias e bênçãos do Clan Hall.
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button
            onclick="window.donateToClanAction(50000, 0)"
            style="padding:6px 12px; font-size:11px; background:rgba(34,197,94,0.15); border:1px solid #22c55e; color:#4ade80; border-radius:6px; cursor:pointer;"
          >
            💰 Doar 50.000 Adena (+10 Rep)
          </button>
          <button
            onclick="window.donateToClanAction(250000, 0)"
            style="padding:6px 12px; font-size:11px; background:rgba(34,197,94,0.2); border:1px solid #22c55e; color:#4ade80; border-radius:6px; cursor:pointer;"
          >
            💰 Doar 250.000 Adena (+50 Rep)
          </button>
          <button
            onclick="window.donateToClanAction(1000000, 0)"
            style="padding:6px 12px; font-size:11px; background:rgba(34,197,94,0.3); border:1px solid #22c55e; color:#86efac; border-radius:6px; cursor:pointer; font-weight:bold;"
          >
            💰 Doar 1.000.000 Adena (+200 Rep)
          </button>
          <button
            onclick="window.donateToClanAction(0, 5000)"
            style="padding:6px 12px; font-size:11px; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; color:#38bdf8; border-radius:6px; cursor:pointer;"
          >
            ✨ Doar 5.000 SP (+50 Rep)
          </button>
          <button
            onclick="window.donateToClanAction(0, 20000)"
            style="padding:6px 12px; font-size:11px; background:rgba(56,189,248,0.25); border:1px solid #38bdf8; color:#7dd3fc; border-radius:6px; cursor:pointer; font-weight:bold;"
          >
            ✨ Doar 20.000 SP (+200 Rep)
          </button>
        </div>
      </div>

      <!-- Tabela de Membros -->
      <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.08); border-radius:8px; overflow:hidden;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:rgba(255,255,255,0.04); border-bottom:1px solid rgba(255,255,255,0.1); font-size:11px; color:#94a3b8;">
              <th style="padding:8px;">Membro</th>
              <th style="padding:8px;">Cargo</th>
              <th style="padding:8px;">Classe &amp; Nível</th>
              <th style="padding:8px; text-align:right;">Contribuição Total</th>
            </tr>
          </thead>
          <tbody>
            ${rosterRows}
          </tbody>
        </table>
      </div>
    `;
  }
  // 6. Sub-aba: Clan Hall & Bênçãos Mágicas
  else if (activeSubTab === 'hall') {
    const buffsHtml = Object.values(CLAN_HALL_BUFFS).map(b => {
      const activeBuff = state.buffs && state.buffs['clan_hall_' + b.id];
      const isBuffActive = activeBuff && (activeBuff.until || 0) > Date.now();
      const remainingMin = isBuffActive ? Math.ceil((activeBuff.until - Date.now()) / 60000) : 0;

      return `
        <div style="background:rgba(0,0,0,0.45); border:1px solid ${isBuffActive ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.08)'}; border-radius:8px; padding:14px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:44px; height:44px; border-radius:8px; background:#18181b; border:1px solid ${isBuffActive ? '#4ade80' : '#3f3f46'}; display:flex; align-items:center; justify-content:center; font-size:24px;">
              ${b.icon}
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:${isBuffActive ? '#86efac' : '#fde047'};">${b.name}</span>
                ${isBuffActive ? `<span style="background:rgba(74,222,128,0.2); border:1px solid #4ade80; color:#86efac; font-size:10.5px; padding:1px 6px; border-radius:8px; font-weight:bold;">⏳ Ativo (${remainingMin}m)</span>` : ''}
              </div>
              <div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">${b.desc}</div>
              <div style="font-size:11px; color:#a3e635; margin-top:2px;">Custo: <strong>${b.costAdena.toLocaleString()} Adena</strong> (Duração: 60 min)</div>
            </div>
          </div>
          <div>
            <button
              onclick="window.activateClanHallBuffAction('${b.id}')"
              style="padding:8px 16px; font-size:11px; font-weight:bold; background:${isBuffActive ? 'linear-gradient(180deg,#059669,#047857)' : 'linear-gradient(180deg,#ca8a04,#a16207)'}; border:1px solid ${isBuffActive ? '#34d399' : '#fde047'}; color:#fff; border-radius:6px; cursor:pointer;"
            >
              ${isBuffActive ? '🔄 Renovar Bênção' : '✨ Ativar Bênção'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    subContentHtml = `
      <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(234,179,8,0.2); border-radius:8px; padding:14px; margin-bottom:14px;">
        <div style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:#fde047; margin-bottom:4px;">
          🏛️ Salão Comunal do Clã (Clan Hall Privado)
        </div>
        <div style="font-size:11.5px; color:#cbd5e1;">
          Os membros do clã podem canalizar bênçãos ancestrais no salão comunal. Os bônus são aplicados a todas as atividades do seu guerreiro!
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:12px;">
        ${buffsHtml}
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:14px; color:#e2e8f0;">
      <!-- Header do Clã -->
      <div style="background:linear-gradient(135deg,rgba(161,98,7,0.25),rgba(0,0,0,0.6)); border:1px solid rgba(234,179,8,0.4); border-radius:10px; padding:16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:14px;">
          <div style="font-size:40px; filter:drop-shadow(0 0 10px rgba(234,179,8,0.5));">🛡️</div>
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-family:'Cinzel',serif; font-size:18px; font-weight:bold; color:#fde047;">${clan.name}</span>
              <span style="background:#ca8a04; color:#fff; font-size:11px; font-weight:bold; padding:2px 8px; border-radius:10px;">Nível ${clan.level} (${lvlData.title})</span>
            </div>
            <div style="font-size:11.5px; color:#cbd5e1; margin-top:2px;">${lvlData.desc}</div>
            <div style="font-size:11px; color:#94a3b8; margin-top:4px;">Capacidade: <strong>${lvlData.maxMembers} membros</strong> | Castelos Governados: <strong style="color:#fde047;">${(clan.castles || []).length}</strong></div>
          </div>
        </div>

        <div>
          ${nextLvl ? `
            <button
              onclick="window.upgradeClanAction()"
              style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:linear-gradient(180deg,#16a34a,#15803d); border:1px solid #4ade80; color:#fff; border-radius:6px; cursor:pointer;"
            >
              ⬆️ Elevar Clã para Lv. ${nextLvl.level} (${nextLvl.costAdena.toLocaleString()} Adena / ${nextLvl.costSp.toLocaleString()} SP)
            </button>
          ` : `
            <span style="color:#fde047; font-weight:bold; font-size:12px;">👑 Nível Máximo do Clã</span>
          `}
        </div>
      </div>

      <!-- Sub-Abas -->
      <div style="display:flex; gap:8px; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; flex-wrap:wrap;">
        <button
          onclick="window.setClanSubTab('skills')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'skills' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'skills' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'skills' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🛡️ Habilidades
        </button>
        <button
          onclick="window.setClanSubTab('roster')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'roster' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'roster' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'roster' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          👥 Membros &amp; Doações
        </button>
        <button
          onclick="window.setClanSubTab('hall')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'hall' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'hall' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'hall' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🏛️ Clan Hall
        </button>
        <button
          onclick="window.setClanSubTab('castles')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'castles' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'castles' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'castles' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🏰 Castelos &amp; Tributos
        </button>
        <button
          onclick="window.setClanSubTab('siege')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'siege' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'siege' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'siege' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          ⚔️ Guerra de Cerco
        </button>
        <button
          onclick="window.setClanSubTab('shop')"
          style="padding:8px 14px; font-family:'Cinzel',serif; font-size:11.5px; font-weight:bold; background:${activeSubTab === 'shop' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'shop' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'shop' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🛍️ Loja do Castelo
        </button>
      </div>

      <!-- Conteúdo da Sub-Aba -->
      ${subContentHtml}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   16. SKILL ENCHANTMENT MODAL (🔮 Encantamento de Habilidades)
═══════════════════════════════════════════════════════════════════════════ */
export function openSkillEnchantModal(skillId, skillName = 'Habilidade', state) {
  const root = getRoot();
  let modal = root.querySelector('#skill-enchant-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'skill-enchant-modal';
    root.appendChild(modal);
  }

  const current = SkillEnchantService.getSkillEnchant(state, skillId);
  const nextLvl = current.level + 1;
  const costData = getEnchantLevelData(nextLvl);
  const activeRoute = current.route || 'power';

  modal.style.display = 'flex';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.75)';
  modal.style.zIndex = '10000';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.backdropFilter = 'blur(4px)';

  modal.innerHTML = `
    <div style="background:#18181b; border:1px solid #a855f7; border-radius:12px; width:92%; max-width:480px; padding:20px; color:#e2e8f0; box-shadow:0 0 25px rgba(168,85,247,0.4);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">🔮</span>
          <span style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#c084fc;">Encantamento de Habilidade</span>
        </div>
        <button onclick="document.querySelector('#idle-host')?.shadowRoot?.querySelector('#skill-enchant-modal')?.remove()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>

      <div style="text-align:center; margin-bottom:16px;">
        <div style="font-family:'Cinzel',serif; font-size:18px; font-weight:bold; color:#fde047;">${skillName} <span style="color:#a855f7;">+${current.level}</span></div>
        <div style="font-size:12px; color:#cbd5e1; margin-top:2px;">Próximo Nível: <strong style="color:#4ade80;">+${nextLvl}</strong> | Chance de Sucesso: <strong style="color:#fde047;">${costData.successRatePercent}%</strong></div>
      </div>

      <!-- Seleção de Rota -->
      <div style="margin-bottom:14px;">
        <label style="font-size:11.5px; color:#94a3b8; display:block; margin-bottom:6px;">Escolha a Rota de Encantamento:</label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          ${Object.values(ENCHANT_ROUTES).map(r => `
            <button
              onclick="window._selectedEnchantRoute = '${r.id}'; openSkillEnchantModal('${skillId}', '${skillName}', window.getGameState ? window.getGameState() : {})"
              style="padding:8px; font-size:11px; font-weight:bold; text-align:left; background:${(window._selectedEnchantRoute || activeRoute) === r.id ? '#581c87' : '#27272a'}; border:1px solid ${(window._selectedEnchantRoute || activeRoute) === r.id ? '#c084fc' : '#3f3f46'}; color:#fff; border-radius:6px; cursor:pointer;"
            >
              ${r.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Custos -->
      <div style="background:#09090b; border:1px solid #27272a; border-radius:8px; padding:12px; margin-bottom:16px; font-size:11.5px; color:#cbd5e1;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Custo de SP:</span>
          <strong style="color:#60a5fa;">${costData.spCost.toLocaleString()} SP</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>Custo de Adena:</span>
          <strong style="color:#a3e635;">${costData.adenaCost.toLocaleString()} Adena</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Requisito de Item:</span>
          <strong style="color:#fde047;">1x Giant's Codex</strong>
        </div>
      </div>

      <!-- Botões de Ação -->
      <div style="display:flex; gap:8px;">
        <button
          onclick="window.enchantSkillAction('${skillId}', '${skillName}', '${window._selectedEnchantRoute || activeRoute}', false)"
          style="flex:1; padding:10px; font-size:11.5px; font-weight:bold; background:linear-gradient(180deg,#7e22ce,#6b21a8); border:1px solid #a855f7; color:#fff; border-radius:6px; cursor:pointer;"
        >
          📜 Encantar Normal
        </button>
        <button
          onclick="window.enchantSkillAction('${skillId}', '${skillName}', '${window._selectedEnchantRoute || activeRoute}', true)"
          style="flex:1; padding:10px; font-size:11.5px; font-weight:bold; background:linear-gradient(180deg,#ca8a04,#a16207); border:1px solid #fde047; color:#fff; border-radius:6px; cursor:pointer;"
        >
          🌟 Encanto Seguro (Mastery)
        </button>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   17. WEAPON AUGMENTATION MODAL (💎 Augmentação com Life Stones)
═══════════════════════════════════════════════════════════════════════════ */
export function openAugmentModal(state) {
  const root = getRoot();
  let modal = root.querySelector('#augment-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'augment-modal';
    root.appendChild(modal);
  }

  const weapon = state.equipment?.weapon;

  modal.style.display = 'flex';
  modal.style.position = 'fixed';
  modal.style.inset = '0';
  modal.style.background = 'rgba(0,0,0,0.75)';
  modal.style.zIndex = '10000';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.backdropFilter = 'blur(4px)';

  if (!weapon) {
    modal.innerHTML = `
      <div style="background:#18181b; border:1px solid #ef4444; border-radius:12px; padding:20px; text-align:center; color:#e2e8f0; max-width:380px;">
        <div style="font-size:32px; margin-bottom:8px;">⚠️</div>
        <div style="font-family:'Cinzel',serif; font-size:15px; margin-bottom:6px;">Nenhuma Arma Equipada</div>
        <div style="font-size:11.5px; color:#cbd5e1; margin-bottom:14px;">Equipe uma arma no seu personagem antes de visitar o Ferreiro de Augmentação.</div>
        <button onclick="document.querySelector('#idle-host')?.shadowRoot?.querySelector('#augment-modal')?.remove()" style="padding:6px 14px; background:#27272a; border:1px solid #3f3f46; color:#fff; border-radius:6px; cursor:pointer;">Fechar</button>
      </div>
    `;
    return;
  }

  const currentAug = weapon.augmentation;
  const activeStoneId = window._selectedLifeStoneId || 'life_stone_top_76';

  modal.innerHTML = `
    <div style="background:#18181b; border:1px solid #06b6d4; border-radius:12px; width:92%; max-width:500px; padding:20px; color:#e2e8f0; box-shadow:0 0 25px rgba(6,182,212,0.4);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:20px;">💎</span>
          <span style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#67e8f9;">Ferreiro de Augmentação de Armas</span>
        </div>
        <button onclick="document.querySelector('#idle-host')?.shadowRoot?.querySelector('#augment-modal')?.remove()" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
      </div>

      <div style="text-align:center; margin-bottom:16px;">
        <div style="font-family:'Cinzel',serif; font-size:16px; font-weight:bold; color:#fde047;">${weapon.name || 'Arma Equipada'}</div>
        ${currentAug ? `
          <div style="margin-top:6px; background:#083344; border:1px solid #06b6d4; border-radius:6px; padding:8px; font-size:11.5px; color:#a5f3fc;">
            <div>✨ Augmentação Ativa: <strong>${currentAug.lifeStoneName}</strong></div>
            <div style="margin-top:2px;">Atributos: <strong>${Object.entries(currentAug.stats || {}).map(([k,v]) => `+${v} ${k.toUpperCase()}`).join(', ')}</strong></div>
            ${currentAug.itemSkill ? `<div style="color:#fde047; font-weight:bold; margin-top:2px;">Habilidade: ${currentAug.itemSkill.name}</div>` : ''}
          </div>
        ` : `
          <div style="font-size:11.5px; color:#94a3b8; margin-top:4px;">Nenhuma Pedra da Vida infundida nesta arma ainda.</div>
        `}
      </div>

      <!-- Seleção de Life Stone -->
      <div style="margin-bottom:14px;">
        <label style="font-size:11.5px; color:#94a3b8; display:block; margin-bottom:6px;">Escolha a Life Stone para Infundir:</label>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${Object.values(LIFE_STONES).map(s => `
            <button
              onclick="window._selectedLifeStoneId = '${s.id}'; openAugmentModal(window.getGameState ? window.getGameState() : {})"
              style="padding:10px; font-size:11px; text-align:left; background:${activeStoneId === s.id ? '#164e63' : '#27272a'}; border:1px solid ${activeStoneId === s.id ? '#22d3ee' : '#3f3f46'}; color:#fff; border-radius:6px; cursor:pointer;"
            >
              <div style="font-weight:bold; color:#67e8f9;">${s.name}</div>
              <div style="font-size:10px; color:#cbd5e1;">${s.desc} | Preço: ${s.priceAdena.toLocaleString()} Adena</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Botões de Ação -->
      <div style="display:flex; gap:8px;">
        <button
          onclick="window.augmentWeaponAction('${activeStoneId}')"
          style="flex:1; padding:10px; font-size:12px; font-weight:bold; background:linear-gradient(180deg,#0891b2,#0e7490); border:1px solid #22d3ee; color:#fff; border-radius:6px; cursor:pointer; box-shadow:0 0 10px rgba(34,211,238,0.4);"
        >
          💎 Infundir Life Stone
        </button>
        ${currentAug ? `
          <button
            onclick="window.removeAugmentAction()"
            style="padding:10px 16px; font-size:11px; font-weight:bold; background:#7f1d1d; border:1px solid #ef4444; color:#fca5a5; border-radius:6px; cursor:pointer;"
          >
            🔨 Remover (100k)
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   23. SEVEN SIGNS (SETE SELOS & MAMMON) UI
═══════════════════════════════════════════════════════════════════════════ */
export function renderSevenSignsTab(container, state) {
  if (!container) return;
  const ss = SevenSignsService.ensureState(state);
  const activeSubTab = window._activeSevenSignsSubTab || 'status';

  container.innerHTML = `
    <div class="sevensigns-container" style="display:flex; flex-direction:column; gap:14px;">
      <!-- Header & Scoreboard Banner -->
      <div style="background:linear-gradient(135deg, rgba(20,15,35,0.95), rgba(10,5,20,0.98)); border:1px solid rgba(168,85,247,0.4); border-radius:10px; padding:16px; box-shadow:0 6px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-family:'Cinzel',serif; color:#e9d5ff; font-size:20px; display:flex; align-items:center; gap:8px;">
              🏛️ Seven Signs — Guerra dos Sete Selos
            </h2>
            <div style="font-size:12px; color:#c084fc; margin-top:4px;">
              Facção Atual: <strong>${ss.faction ? FACTIONS[ss.faction].name : 'Nenhuma (Escolha sua facção)'}</strong> | Ancient Adena: <strong style="color:#fef08a;">${(ss.ancientAdena || 0).toLocaleString()} AA</strong>
            </div>
          </div>
          <div style="display:flex; gap:12px; align-items:center;">
            <div style="background:rgba(234,179,8,0.15); border:1px solid #eab308; border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:10px; color:#fde047; font-weight:bold;">DAWN</div>
              <div style="font-size:13px; font-weight:bold; color:#fef08a;">${(ss.dawnScore || 0).toLocaleString()}</div>
            </div>
            <span style="font-size:16px; font-weight:bold; color:#a855f7;">VS</span>
            <div style="background:rgba(168,85,247,0.15); border:1px solid #a855f7; border-radius:8px; padding:6px 12px; text-align:center;">
              <div style="font-size:10px; color:#d8b4fe; font-weight:bold;">DUSK</div>
              <div style="font-size:13px; font-weight:bold; color:#e9d5ff;">${(ss.duskScore || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <!-- Sub-Tabs Navigation -->
        <div style="display:flex; gap:8px; margin-top:14px; border-top:1px solid rgba(168,85,247,0.2); padding-top:12px; flex-wrap:wrap;">
          <button onclick="window.setSevenSignsSubTab('status')" style="padding:6px 14px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:bold; ${activeSubTab === 'status' ? 'background:#9333ea; color:#fff; border:1px solid #c084fc;' : 'background:rgba(0,0,0,0.4); color:#c084fc; border:1px solid rgba(168,85,247,0.3);'}">
            📜 Facções & Pedras
          </button>
          <button onclick="window.setSevenSignsSubTab('bosses')" style="padding:6px 14px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:bold; ${activeSubTab === 'bosses' ? 'background:#9333ea; color:#fff; border:1px solid #c084fc;' : 'background:rgba(0,0,0,0.4); color:#c084fc; border:1px solid rgba(168,85,247,0.3);'}">
            👑 Lilith & Anakim
          </button>
          <button onclick="window.setSevenSignsSubTab('mammon')" style="padding:6px 14px; font-size:12px; border-radius:6px; cursor:pointer; font-weight:bold; ${activeSubTab === 'mammon' ? 'background:#9333ea; color:#fff; border:1px solid #c084fc;' : 'background:rgba(0,0,0,0.4); color:#c084fc; border:1px solid rgba(168,85,247,0.3);'}">
            🧙‍♂️ Mercadores de Mammon
          </button>
        </div>
      </div>

      <!-- Tab Body -->
      ${activeSubTab === 'status' ? renderSevenSignsStatusView(ss, state) : ''}
      ${activeSubTab === 'bosses' ? renderSevenSignsBossesView(ss, state) : ''}
      ${activeSubTab === 'mammon' ? renderSevenSignsMammonView(ss, state) : ''}
    </div>
  `;
}

function renderSevenSignsStatusView(ss, state) {
  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
      <!-- Facções -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:14px;">
        <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">Escolha de Facção</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${Object.values(FACTIONS).map(fac => `
            <div style="background:rgba(0,0,0,0.5); border:1px solid ${ss.faction === fac.id ? '#a855f7' : 'rgba(255,255,255,0.1)'}; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:bold; color:#f3e8ff; font-size:13px;">${fac.name}</div>
                <div style="font-size:11px; color:#9ca3af; margin-top:2px;">${fac.desc}</div>
                <div style="font-size:11px; color:#4ade80; margin-top:2px; font-weight:bold;">${fac.bonusDesc}</div>
              </div>
              <button
                onclick="window.joinFactionAction('${fac.id}')"
                style="padding:6px 12px; font-size:11px; font-weight:bold; border-radius:6px; cursor:pointer; ${ss.faction === fac.id ? 'background:#22c55e; color:#fff; border:none;' : 'background:#6b21a8; color:#fff; border:1px solid #a855f7;'}"
              >
                ${ss.faction === fac.id ? '✓ Membro' : 'Alistar-se'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Depósito de Seal Stones -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:14px;">
        <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">Entregar Seal Stones</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${Object.values(SEAL_STONES).map(st => {
            const invItem = state.inventory?.find(i => (i.id === st.id || i.itemId === st.id));
            const count = invItem ? (invItem.count || 1) : 0;
            return `
              <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:bold; color:#f3e8ff; font-size:13px;">${st.name}</div>
                  <div style="font-size:11px; color:#c084fc;">No Inventário: <strong>${count}x</strong> (Vale ${st.aaValue} AA/un)</div>
                </div>
                <button
                  onclick="window.depositSealStonesAction('${st.id}', ${count > 0 ? count : 1})"
                  ${count === 0 ? 'disabled style="opacity:0.4; cursor:not-allowed; padding:6px 12px; font-size:11px; border-radius:6px;"' : 'style="padding:6px 12px; font-size:11px; font-weight:bold; background:#9333ea; border:1px solid #c084fc; color:#fff; border-radius:6px; cursor:pointer;"'}
                >
                  Entregar Todas
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSevenSignsBossesView(ss, state) {
  const activeFight = ss.activeBossFight;

  return `
    <div style="display:flex; flex-direction:column; gap:14px;">
      ${activeFight ? `
        <!-- Batalha Ativa contra Lilith/Anakim -->
        <div style="background:linear-gradient(135deg, rgba(40,10,20,0.95), rgba(20,5,10,0.98)); border:2px solid #ef4444; border-radius:10px; padding:16px; box-shadow:0 0 20px rgba(239,68,68,0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; color:#fca5a5; font-family:'Cinzel',serif; font-size:18px;">🔥 Confronto: ${activeFight.bossName}</h3>
              <div style="font-size:12px; color:#f87171;">Turno: ${activeFight.turn}</div>
            </div>
            <button
              onclick="window.executeSevenSignsBossTurnAction()"
              style="padding:10px 24px; font-size:13px; font-weight:bold; background:#dc2626; border:1px solid #ef4444; color:#fff; border-radius:8px; cursor:pointer;"
            >
              ⚔️ Desferir Ataque Supremo!
            </button>
          </div>
          <!-- Barra de HP do Chefe -->
          <div style="margin-top:14px; background:rgba(0,0,0,0.6); border:1px solid #ef4444; border-radius:8px; height:20px; position:relative; overflow:hidden;">
            <div style="width:${Math.max(0, Math.min(100, (activeFight.bossHp / activeFight.maxHp) * 100))}%; height:100%; background:linear-gradient(90deg, #dc2626, #f87171); transition:width 0.3s ease;"></div>
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; color:#fff;">
              ${activeFight.bossHp.toLocaleString()} / ${activeFight.maxHp.toLocaleString()} HP
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Lista de Chefes de Selo -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
        ${Object.values(SEVEN_SIGNS_BOSSES).map(boss => `
          <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:16px; display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                  <h3 style="margin:0; color:#fef08a; font-family:'Cinzel',serif; font-size:16px;">${boss.name}</h3>
                  <div style="font-size:11px; color:#c084fc;">${boss.title} (Lv. ${boss.level})</div>
                </div>
                <span style="font-size:11px; font-weight:bold; padding:2px 8px; border-radius:10px; background:rgba(168,85,247,0.2); color:#e9d5ff; border:1px solid #a855f7;">
                  Derrotas: ${ss.bossDefeats?.[boss.id] || 0}
                </span>
              </div>
              <p style="font-size:12px; color:#9ca3af; margin:8px 0;">${boss.desc}</p>
              <div style="font-size:11px; color:#fde047;">Custo de Abertura: <strong>${boss.reqAA.toLocaleString()} AA</strong></div>
            </div>
            <button
              onclick="window.startSevenSignsBossFightAction('${boss.id}')"
              style="padding:8px 16px; font-size:12px; font-weight:bold; background:#7e22ce; border:1px solid #a855f7; color:#fff; border-radius:6px; cursor:pointer;"
            >
              🚪 Abrir Portal & Desafiar
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSevenSignsMammonView(ss, state) {
  const accessCheck = SevenSignsService.canAccessExclusiveBlacksmith(state);
  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
      <!-- Exclusivity Status Banner -->
      ${accessCheck.allowed ? `
        <div style="grid-column:1/-1; background:rgba(34,197,94,0.15); border:1px solid #22c55e; border-radius:8px; padding:10px 14px; font-size:12px; color:#86efac; display:flex; align-items:center; gap:8px;">
          <span>✅</span>
          <div><strong>Bênção dos Selos Ativa:</strong> Sua facção [${(ss.winnerFaction || ss.faction || 'DAWN').toUpperCase()}] domina o ciclo semanal! Blacksmith of Mammon liberado para SA e deselamento de armaduras.</div>
        </div>
      ` : `
        <div style="grid-column:1/-1; background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:8px; padding:10px 14px; font-size:12px; color:#fca5a5; display:flex; align-items:center; gap:8px;">
          <span>🔒</span>
          <div><strong>Acesso Exclusivo Bloqueado:</strong> ${accessCheck.message}</div>
        </div>
      `}

      <!-- Blacksmith of Mammon -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:14px;">
        <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">⚒️ Blacksmith of Mammon</h3>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${MAMMON_BLACKSMITH_SERVICES.map(srv => `
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:bold; color:#f3e8ff; font-size:12px;">${srv.name}</div>
                <div style="font-size:10px; color:#9ca3af; margin-top:2px;">${srv.desc}</div>
                <div style="font-size:11px; color:#fde047; font-weight:bold; margin-top:2px;">${srv.costAA.toLocaleString()} AA</div>
              </div>
              <button
                ${accessCheck.allowed ? 'onclick="window.unsealArmorAction()"' : 'disabled'}
                style="padding:6px 12px; font-size:11px; font-weight:bold; ${accessCheck.allowed ? 'background:#9333ea; border:1px solid #c084fc; color:#fff; cursor:pointer;' : 'background:#4b5563; border:1px solid #6b7280; color:#9ca3af; cursor:not-allowed; opacity:0.6;'} border-radius:6px;"
              >
                ${accessCheck.allowed ? 'Utilizar' : '🔒 Bloqueado'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Merchant of Mammon -->
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:14px;">
        <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">🛒 Merchant of Mammon</h3>
        <div style="display:flex; flex-direction:column; gap:10px; max-height:400px; overflow-y:auto;">
          ${MAMMON_MERCHANT_CATALOG.map(it => `
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:bold; color:#f3e8ff; font-size:12px;">${it.name}</div>
                <div style="font-size:10px; color:#9ca3af; margin-top:2px;">${it.desc}</div>
                <div style="font-size:11px; color:#fde047; font-weight:bold; margin-top:2px;">${it.costAA.toLocaleString()} AA</div>
              </div>
              <button
                onclick="window.buyMammonItemAction('${it.id}')"
                style="padding:6px 12px; font-size:11px; font-weight:bold; background:#9333ea; border:1px solid #c084fc; color:#fff; border-radius:6px; cursor:pointer;"
              >
                Comprar
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   24. FORTRESS SIEGES & TALISMANS UI
═══════════════════════════════════════════════════════════════════════════ */
export function renderFortressTab(container, state) {
  if (!container) return;
  const fState = FortressService.ensureState(state);
  const bracelet = BRACELETS[fState.equippedBracelet] || BRACELETS['bracelet_steel'];
  const activeSiege = fState.activeSiege;

  container.innerHTML = `
    <div class="fortress-container" style="display:flex; flex-direction:column; gap:14px;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(135deg, rgba(25,20,15,0.95), rgba(15,10,5,0.98)); border:1px solid rgba(212,167,68,0.4); border-radius:10px; padding:16px; box-shadow:0 6px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-family:'Cinzel',serif; color:#fef08a; font-size:20px; display:flex; align-items:center; gap:8px;">
              ⚔️ Fortalezas & Braceletes com Talismãs
            </h2>
            <div style="font-size:12px; color:#d1d5db; margin-top:4px;">
              Fortalezas Conquistadas: <strong>${fState.owned?.length || 0}/5</strong> | Knight's Epaulettes: <strong style="color:#f59e0b;">${(fState.epaulettes || 0).toLocaleString()} 🎖️</strong>
            </div>
          </div>
          <div style="background:rgba(0,0,0,0.5); border:1px solid #d4a744; border-radius:8px; padding:8px 14px; text-align:center;">
            <div style="font-size:10px; color:#9ca3af; text-transform:uppercase;">Bracelete Equipado</div>
            <div style="font-size:13px; font-weight:bold; color:#fef08a;">${bracelet.name} (${fState.equippedTalismans.length}/${bracelet.slots} Talismãs)</div>
          </div>
        </div>
      </div>

      ${activeSiege ? `
        <!-- Cerco à Fortaleza em Andamento -->
        <div style="background:linear-gradient(135deg, rgba(40,25,10,0.95), rgba(20,10,5,0.98)); border:2px solid #f59e0b; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; color:#fde047; font-family:'Cinzel',serif; font-size:18px;">🔥 Cerco Ativo: ${activeSiege.fortName}</h3>
              <div style="font-size:12px; color:#fbbf24;">
                ${activeSiege.generatorsRemaining > 0 ? `⚡ Geradores Restantes: ${activeSiege.generatorsRemaining}` : `⚔️ Capitão da Fortaleza Enfrentando seu Herói!`}
              </div>
            </div>
            <button
              onclick="window.executeFortressTurnAction()"
              style="padding:10px 24px; font-size:13px; font-weight:bold; background:#d97706; border:1px solid #f59e0b; color:#fff; border-radius:8px; cursor:pointer;"
            >
              ⚔️ Atacar Fortaleza!
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Grid Principal: Fortalezas e Loadout de Talismãs -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
        <!-- Lista de Fortalezas -->
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:14px;">
          <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">Territórios de Fortaleza</h3>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${Object.values(FORTRESSES).map(fort => {
              const isOwned = fState.owned?.includes(fort.id);
              return `
                <div style="background:rgba(0,0,0,0.5); border:1px solid ${isOwned ? '#22c55e' : 'rgba(255,255,255,0.1)'}; border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:bold; color:#fef08a; font-size:13px;">${fort.name} (Lv. ${fort.level})</div>
                    <div style="font-size:11px; color:#9ca3af;">${fort.region} | Produção: +${fort.epauletteRate} Epaulettes/min</div>
                    <div style="font-size:11px; color:#4ade80; font-weight:bold;">${fort.buff.label}</div>
                  </div>
                  <button
                    onclick="window.startFortressSiegeAction('${fort.id}')"
                    style="padding:6px 12px; font-size:11px; font-weight:bold; border-radius:6px; cursor:pointer; ${isOwned ? 'background:#15803d; color:#fff; border:none;' : 'background:#b45309; color:#fff; border:1px solid #f59e0b;'}"
                  >
                    ${isOwned ? '✓ Conquistada' : '⚔️ Declarar Cerco'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Loja & Montagem de Talismãs -->
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:14px;">
          <h3 style="margin:0 0 10px 0; color:#fef08a; font-family:'Cinzel',serif; font-size:15px;">📿 Braceletes & Talismãs Equipados</h3>
          
          <!-- Seleção de Bracelete -->
          <div style="margin-bottom:12px; display:flex; gap:6px; flex-wrap:wrap;">
            ${Object.values(BRACELETS).map(b => `
              <button
                onclick="window.buyBraceletAction('${b.id}')"
                style="padding:4px 8px; font-size:10px; border-radius:4px; font-weight:bold; cursor:pointer; ${fState.equippedBracelet === b.id ? 'background:#eab308; color:#000; border:none;' : 'background:rgba(0,0,0,0.5); color:#d1d5db; border:1px solid #d4a744;'}"
              >
                ${b.name} (${b.costEpaulettes} 🎖️)
              </button>
            `).join('')}
          </div>

          <!-- Talismãs Disponíveis -->
          <div style="display:flex; flex-direction:column; gap:8px; max-height:280px; overflow-y:auto;">
            ${Object.values(TALISMANS).map(tal => {
              const isEquipped = fState.equippedTalismans?.includes(tal.id);
              return `
                <div style="background:rgba(0,0,0,0.5); border:1px solid ${isEquipped ? '#3b82f6' : 'rgba(255,255,255,0.1)'}; border-radius:6px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:bold; color:#f3f4f6; font-size:12px;">${tal.name}</div>
                    <div style="font-size:10px; color:#9ca3af;">${tal.desc} | Custo: ${tal.costEpaulettes} 🎖️</div>
                  </div>
                  <button
                    onclick="${isEquipped ? `window.unequipTalismanAction('${tal.id}')` : `window.equipTalismanAction('${tal.id}')`}"
                    style="padding:4px 10px; font-size:11px; font-weight:bold; border-radius:4px; cursor:pointer; ${isEquipped ? 'background:#ef4444; color:#fff; border:none;' : 'background:#2563eb; color:#fff; border:1px solid #60a5fa;'}"
                  >
                    ${isEquipped ? '✕ Remover' : 'Equipar'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   25. COLOSSEUM & DUELS UI
═══════════════════════════════════════════════════════════════════════════ */
export function renderColosseumTab(container, state) {
  if (!container) return;
  const colState = ColosseumService.ensureState(state);
  const activeDuel = colState.activeDuel;
  const activeSurvival = colState.activeSurvival;

  container.innerHTML = `
    <div class="colosseum-container" style="display:flex; flex-direction:column; gap:14px;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(135deg, rgba(30,15,10,0.95), rgba(15,8,5,0.98)); border:1px solid rgba(239,68,68,0.4); border-radius:10px; padding:16px; box-shadow:0 6px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div>
            <h2 style="margin:0; font-family:'Cinzel',serif; color:#fca5a5; font-size:20px; display:flex; align-items:center; gap:8px;">
              🎭 Coliseu & Duelos Livres de Aden
            </h2>
            <div style="font-size:12px; color:#d1d5db; margin-top:4px;">
              Vitórias em Duelo: <strong>${colState.duelWins || 0}</strong> | Onda Máxima no Coliseu: <strong>${colState.highestWave || 0}/10</strong> | Badges do Coliseu: <strong style="color:#fde047;">${colState.badges || 0} 🎖️</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Duelo Ativo -->
      ${activeDuel ? `
        <div style="background:linear-gradient(135deg, rgba(40,15,15,0.95), rgba(20,5,5,0.98)); border:2px solid #ef4444; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="margin:0; color:#fca5a5; font-family:'Cinzel',serif; font-size:18px;">⚔️ Duelo 1v1: ${activeDuel.opponentName}</h3>
              <div style="font-size:12px; color:#f87171;">${activeDuel.opponentTitle} | Aposta: ${(activeDuel.bet * 2).toLocaleString()}g em jogo!</div>
            </div>
            <button
              onclick="window.executeDuelTurnAction()"
              style="padding:10px 24px; font-size:13px; font-weight:bold; background:#dc2626; border:1px solid #ef4444; color:#fff; border-radius:8px; cursor:pointer;"
            >
              ⚔️ Desferir Golpe de Duelo!
            </button>
          </div>
          <div style="margin-top:12px; background:rgba(0,0,0,0.6); border:1px solid #ef4444; border-radius:8px; height:18px; position:relative; overflow:hidden;">
            <div style="width:${Math.max(0, Math.min(100, (activeDuel.hp / activeDuel.maxHp) * 100))}%; height:100%; background:linear-gradient(90deg, #dc2626, #f87171);"></div>
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#fff;">
              ${activeDuel.hp.toLocaleString()} / ${activeDuel.maxHp.toLocaleString()} HP
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Sobrevivência Ativa -->
      ${activeSurvival ? `
        <div style="background:linear-gradient(135deg, rgba(40,20,5,0.95), rgba(20,10,2,0.98)); border:2px solid #f59e0b; border-radius:10px; padding:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="margin:0; color:#fde047; font-family:'Cinzel',serif; font-size:18px;">🔥 Onda ${activeSurvival.waveIndex + 1}/10: ${activeSurvival.waveData.name}</h3>
              <div style="font-size:12px; color:#fbbf24;">Badges Acumulados no Desafio: +${activeSurvival.totalBadgesAccumulated} 🎖️</div>
            </div>
            <button
              onclick="window.executeSurvivalTurnAction()"
              style="padding:10px 24px; font-size:13px; font-weight:bold; background:#d97706; border:1px solid #f59e0b; color:#fff; border-radius:8px; cursor:pointer;"
            >
              ⚔️ Atacar Onda do Coliseu!
            </button>
          </div>
          <div style="margin-top:12px; background:rgba(0,0,0,0.6); border:1px solid #f59e0b; border-radius:8px; height:18px; position:relative; overflow:hidden;">
            <div style="width:${Math.max(0, Math.min(100, (activeSurvival.currentHp / activeSurvival.maxHp) * 100))}%; height:100%; background:linear-gradient(90deg, #d97706, #fde047);"></div>
            <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:bold; color:#fff;">
              ${activeSurvival.currentHp.toLocaleString()} / ${activeSurvival.maxHp.toLocaleString()} HP
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Modos de Jogo -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
        <!-- Duelos com Apostas -->
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:14px;">
          <h3 style="margin:0 0 10px 0; color:#fca5a5; font-family:'Cinzel',serif; font-size:15px;">⚔️ Duelos 1v1 com Apostas</h3>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${DUEL_BET_TIERS.map(tier => `
              <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.1); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <div style="font-weight:bold; color:#fee2e2; font-size:13px;">${tier.name}</div>
                  <div style="font-size:11px; color:#fca5a5;">Aposta: ${tier.label} (Prêmio 2x: ${(tier.bet * 2).toLocaleString()}g)</div>
                </div>
                <button
                  onclick="window.startColosseumDuelAction('${tier.id}')"
                  style="padding:6px 14px; font-size:11px; font-weight:bold; background:#b91c1c; border:1px solid #ef4444; color:#fff; border-radius:6px; cursor:pointer;"
                >
                  Desafiar
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Desafio de Sobrevivência & Loja de Badges -->
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:14px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h3 style="margin:0 0 10px 0; color:#fde047; font-family:'Cinzel',serif; font-size:15px;">🏆 Desafio das 10 Ondas</h3>
            <p style="font-size:12px; color:#9ca3af; margin:0 0 12px 0;">Enfrente 10 ondas consecutivas de gladiadores e chefes do coliseu sem descanso para conquistar glória e Badges!</p>
            <button
              onclick="window.startColosseumSurvivalAction()"
              style="width:100%; padding:10px; font-size:13px; font-weight:bold; background:#d97706; border:1px solid #f59e0b; color:#fff; border-radius:8px; cursor:pointer;"
            >
              🔥 Iniciar Desafio das 10 Ondas
            </button>
          </div>

          <!-- Loja de Badges do Coliseu -->
          <div style="margin-top:16px; border-top:1px solid rgba(245,158,11,0.2); padding-top:12px;">
            <h4 style="margin:0 0 8px 0; color:#fde047; font-size:13px;">Loja de Badges do Coliseu</h4>
            <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">
              ${COLOSSEUM_SHOP_CATALOG.map(it => `
                <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-weight:bold; color:#fef3c7; font-size:11px;">${it.name}</div>
                    <div style="font-size:10px; color:#f59e0b;">${it.costBadges} Badges</div>
                  </div>
                  <button
                    onclick="window.buyColosseumShopItemAction('${it.id}')"
                    style="padding:4px 8px; font-size:10px; font-weight:bold; background:#b45309; border:1px solid #f59e0b; color:#fff; border-radius:4px; cursor:pointer;"
                  >
                    Comprar
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   5. SISTEMA DE COSMÉTICOS VFX — 100% VISUAL / IDLE (NÍVEL 5)
═══════════════════════════════════════════════════════════════════════════ */
export function renderCosmeticsTab(container, state) {
  if (!container || !state) return;
  CosmeticService.ensureState(state);

  const activeSubTab = window._activeCosmeticsSubTab || 'auras';

  window.setCosmeticsSubTab = (subTab) => {
    window._activeCosmeticsSubTab = subTab;
    if (typeof window.updateCosmeticsUI === 'function') {
      window.updateCosmeticsUI();
    } else {
      renderCosmeticsTab(container, state);
    }
  };

  const auras = Object.values(AURAS_CATALOG);
  const frames = Object.values(ITEM_FRAMES_CATALOG);
  const titles = Object.values(TITLES_CATALOG);

  const curAura = CosmeticService.getActiveAura(state);
  const curFrame = CosmeticService.getActiveFrame(state);
  const curTitle = CosmeticService.getActiveTitle(state);

  let contentHtml = '';


  const achStatus = AchievementService.getAchievementsStatus(state);

  if (activeSubTab === 'achievements') {
    contentHtml = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:12px 16px; margin-bottom:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:bold; color:#fef08a; font-size:14px; font-family:'Cinzel',serif;">Progresso das Conquistas:</span>
            <span style="font-weight:bold; color:#38bdf8; font-size:13px;">${achStatus.claimedCount} / ${achStatus.total} Resgatadas (${Math.round((achStatus.claimedCount / achStatus.total) * 100)}%)</span>
          </div>
          <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
            <div style="width:${Math.round((achStatus.claimedCount / achStatus.total) * 100)}%; height:100%; background:linear-gradient(90deg, #eab308, #22c55e); transition:width 0.3s;"></div>
          </div>
        </div>

        <div class="cosmetics-grid">
          ${achStatus.achievements.map(ach => {
            const isDone = ach.isCompleted;
            const isClaimed = ach.isClaimed;
            const canClaim = ach.canClaim;
            const pct = Math.min(100, Math.round((ach.currentProgress / ach.target) * 100));

            return `
              <div class="cosmetic-card ${isClaimed ? 'equipped' : ''}" style="border: 1px solid ${canClaim ? '#22c55e' : isClaimed ? 'rgba(255,255,255,0.15)' : 'rgba(212,167,68,0.25)'};">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:48px; height:48px; border-radius:8px; border:2px solid ${canClaim ? '#22c55e' : '#d4a744'}; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; font-size:24px;">
                    ${ach.icon}
                  </div>
                  <div style="flex:1;">
                    <div style="font-size:13px; font-weight:bold; color:#fef08a; display:flex; align-items:center; gap:6px;">
                      ${ach.title}
                      ${isClaimed ? '<span style="font-size:9px; background:#22c55e; color:#000; padding:1px 4px; border-radius:3px; font-weight:bold;">CONCLUÍDO</span>' : ''}
                    </div>
                    <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${ach.desc}</div>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                      <div style="flex:1; max-width:140px; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden;">
                        <div style="width:${pct}%; height:100%; background:${isDone ? '#22c55e' : '#eab308'};"></div>
                      </div>
                      <span style="font-size:10px; color:#cbd5e1; font-weight:bold;">${ach.currentProgress} / ${ach.target}</span>
                    </div>
                    <div style="font-size:10px; color:#facc15; font-weight:bold; margin-top:4px;">🎁 ${ach.rewardText}</div>
                  </div>
                </div>

                <div style="margin-top:8px;">
                  ${isClaimed ? `
                    <button disabled style="width:100%; padding:6px; font-size:11px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); color:#9ca3af; border-radius:4px; font-weight:bold;">
                      ✓ Resgatado
                    </button>
                  ` : canClaim ? `
                    <button onclick="window.claimAchievementAction('${ach.id}')" style="width:100%; padding:6px; font-size:11px; background:linear-gradient(180deg,#22c55e,#16a34a); border:1px solid #4ade80; color:#fff; border-radius:4px; font-weight:bold; cursor:pointer; box-shadow:0 0 10px rgba(34,197,94,0.4);">
                      🎁 Resgatar Conquista
                    </button>
                  ` : `
                    <button disabled style="width:100%; padding:6px; font-size:11px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.08); color:#64748b; border-radius:4px;">
                      Em Progresso (${pct}%)
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  if (activeSubTab === 'auras') {
    contentHtml = `
      <div class="cosmetics-grid">
        ${auras.map(a => {
          const isUnlocked = state.cosmetics.unlockedAuras.includes(a.id);
          const isEquipped = state.cosmetics.activeAura === a.id || (a.id === 'aura_hero_golden' && state.isHero && state.cosmetics.activeAura === 'aura_none');
          const isHeroLocked = a.reqHero && !state.isHero && !state.heroStatus?.isHero;
          const canAfford = (state.gold || 0) >= a.costAdena;

          return `
            <div class="cosmetic-card ${isEquipped ? 'equipped' : ''}" style="border: 1px solid ${isEquipped ? '#ffd700' : 'rgba(212,167,68,0.25)'};">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:48px; height:48px; border-radius:8px; border:2px solid ${a.color || '#fff'}; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; font-size:24px; position:relative;" class="${a.cssClass}">
                  ${a.icon}
                </div>
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:bold; color:#fef08a; display:flex; align-items:center; gap:6px;">
                    ${a.name}
                    ${isEquipped ? '<span style="font-size:9px; background:#ffd700; color:#000; padding:1px 4px; border-radius:3px; font-weight:bold;">ATIVO</span>' : ''}
                  </div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${a.desc}</div>
                  ${!isUnlocked && a.costAdena > 0 ? `<div style="font-size:11px; color:#f59e0b; font-weight:bold; margin-top:4px;">💰 ${a.costAdena.toLocaleString()} Adena</div>` : ''}
                </div>
              </div>

              <div style="margin-top:6px;">
                ${isEquipped ? `
                  <button disabled style="width:100%; padding:6px; font-size:11px; background:#1e293b; border:1px solid #ffd700; color:#ffd700; border-radius:4px; font-weight:bold;">
                    ✓ Equipada
                  </button>
                ` : isUnlocked ? `
                  <button onclick="window.equipCosmeticAction('aura', '${a.id}')" style="width:100%; padding:6px; font-size:11px; background:#065f46; border:1px solid #10b981; color:#fff; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Equipar Aura
                  </button>
                ` : isHeroLocked ? `
                  <button disabled style="width:100%; padding:6px; font-size:11px; background:#27272a; border:1px solid #3f3f46; color:#a1a1aa; border-radius:4px;">
                    🔒 Exclusivo das Olimpíadas
                  </button>
                ` : `
                  <button onclick="window.buyCosmeticAction('aura', '${a.id}')" ${!canAfford ? 'disabled' : ''} style="width:100%; padding:6px; font-size:11px; background:${canAfford ? 'linear-gradient(180deg,#d97706,#b45309)' : '#27272a'}; border:1px solid ${canAfford ? '#f59e0b' : '#3f3f46'}; color:${canAfford ? '#fff' : '#71717a'}; border-radius:4px; font-weight:bold; cursor:${canAfford ? 'pointer' : 'not-allowed'};">
                    Desbloquear (${a.costAdena.toLocaleString()} Adena)
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (activeSubTab === 'frames') {
    contentHtml = `
      <div class="cosmetics-grid">
        ${frames.map(f => {
          const isUnlocked = state.cosmetics.unlockedFrames.includes(f.id);
          const isEquipped = state.cosmetics.activeFrame === f.id;
          const canAfford = (state.gold || 0) >= f.costAdena;

          return `
            <div class="cosmetic-card ${isEquipped ? 'equipped' : ''}" style="border: 1px solid ${isEquipped ? '#ffd700' : 'rgba(212,167,68,0.25)'};">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="width:48px; height:48px; border-radius:6px; border:2px solid rgba(255,255,255,0.2); background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; font-size:24px;" class="${f.cssClass}">
                  ${f.icon}
                </div>
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:bold; color:#fef08a; display:flex; align-items:center; gap:6px;">
                    ${f.name}
                    ${isEquipped ? '<span style="font-size:9px; background:#ffd700; color:#000; padding:1px 4px; border-radius:3px; font-weight:bold;">ATIVO</span>' : ''}
                  </div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${f.desc}</div>
                  ${!isUnlocked && f.costAdena > 0 ? `<div style="font-size:11px; color:#f59e0b; font-weight:bold; margin-top:4px;">💰 ${f.costAdena.toLocaleString()} Adena</div>` : ''}
                </div>
              </div>

              <div style="margin-top:6px;">
                ${isEquipped ? `
                  <button disabled style="width:100%; padding:6px; font-size:11px; background:#1e293b; border:1px solid #ffd700; color:#ffd700; border-radius:4px; font-weight:bold;">
                    ✓ Ativa nos Equipamentos
                  </button>
                ` : isUnlocked ? `
                  <button onclick="window.equipCosmeticAction('frame', '${f.id}')" style="width:100%; padding:6px; font-size:11px; background:#065f46; border:1px solid #10b981; color:#fff; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Aplicar Moldura
                  </button>
                ` : `
                  <button onclick="window.buyCosmeticAction('frame', '${f.id}')" ${!canAfford ? 'disabled' : ''} style="width:100%; padding:6px; font-size:11px; background:${canAfford ? 'linear-gradient(180deg,#d97706,#b45309)' : '#27272a'}; border:1px solid ${canAfford ? '#f59e0b' : '#3f3f46'}; color:${canAfford ? '#fff' : '#71717a'}; border-radius:4px; font-weight:bold; cursor:${canAfford ? 'pointer' : 'not-allowed'};">
                    Desbloquear (${f.costAdena.toLocaleString()} Adena)
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else if (activeSubTab === 'titles') {
    contentHtml = `
      <div class="cosmetics-grid">
        ${titles.map(t => {
          const isUnlocked = state.cosmetics.unlockedTitles.includes(t.id);
          const isEquipped = state.cosmetics.activeTitle === t.id;
          const canAfford = (state.gold || 0) >= t.costAdena;

          return `
            <div class="cosmetic-card ${isEquipped ? 'equipped' : ''}" style="border: 1px solid ${isEquipped ? '#ffd700' : 'rgba(212,167,68,0.25)'};">
              <div style="display:flex; align-items:center; gap:10px;">
                <div style="min-width:70px; height:40px; border-radius:4px; background:rgba(0,0,0,0.7); border:1px solid ${t.color || '#94a3b8'}; display:flex; align-items:center; justify-content:center; padding:0 8px; font-size:11px; font-weight:bold; color:${t.color || '#94a3b8'};">
                  ${t.titleText || '—'}
                </div>
                <div style="flex:1;">
                  <div style="font-size:13px; font-weight:bold; color:#fef08a; display:flex; align-items:center; gap:6px;">
                    ${t.name}
                    ${isEquipped ? '<span style="font-size:9px; background:#ffd700; color:#000; padding:1px 4px; border-radius:3px; font-weight:bold;">ATIVO</span>' : ''}
                  </div>
                  <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${t.desc}</div>
                  ${!isUnlocked && t.costAdena > 0 ? `<div style="font-size:11px; color:#f59e0b; font-weight:bold; margin-top:4px;">💰 ${t.costAdena.toLocaleString()} Adena</div>` : ''}
                </div>
              </div>

              <div style="margin-top:6px;">
                ${isEquipped ? `
                  <button disabled style="width:100%; padding:6px; font-size:11px; background:#1e293b; border:1px solid #ffd700; color:#ffd700; border-radius:4px; font-weight:bold;">
                    ✓ Título em Exibição
                  </button>
                ` : isUnlocked ? `
                  <button onclick="window.equipCosmeticAction('title', '${t.id}')" style="width:100%; padding:6px; font-size:11px; background:#065f46; border:1px solid #10b981; color:#fff; border-radius:4px; font-weight:bold; cursor:pointer;">
                    Exibir Título
                  </button>
                ` : `
                  <button onclick="window.buyCosmeticAction('title', '${t.id}')" ${!canAfford ? 'disabled' : ''} style="width:100%; padding:6px; font-size:11px; background:${canAfford ? 'linear-gradient(180deg,#d97706,#b45309)' : '#27272a'}; border:1px solid ${canAfford ? '#f59e0b' : '#3f3f46'}; color:${canAfford ? '#fff' : '#71717a'}; border-radius:4px; font-weight:bold; cursor:${canAfford ? 'pointer' : 'not-allowed'};">
                    Desbloquear (${t.costAdena.toLocaleString()} Adena)
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="cosmetics-panel-container">
      <!-- Header do Santuário de Cosméticos -->
      <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="margin:0; font-size:16px; color:#ffd700; letter-spacing:0.08em; display:flex; align-items:center; gap:8px;">
            ✨ Guarda-Roupa &amp; Efeitos Visuais
          </h3>
          <p style="margin:4px 0 0 0; font-size:11px; color:#94a3b8;">
            Personalize a aura mística, as molduras de inventário e os títulos de honra do seu campeão.
          </p>
        </div>
        <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(255,215,0,0.4); padding:6px 12px; border-radius:6px; text-align:right;">
          <div style="font-size:10px; color:#cbd5e1;">AURA ATIVA: <span style="color:#ffd700; font-weight:bold;">${curAura.name}</span></div>
          <div style="font-size:10px; color:#cbd5e1;">MOLDURA: <span style="color:#67e8f9; font-weight:bold;">${curFrame.name}</span></div>
          <div style="font-size:10px; color:#cbd5e1;">TÍTULO: <span style="color:${curTitle.color || '#ffd700'}; font-weight:bold;">${curTitle.titleText || 'Nenhum'}</span></div>
        </div>
      </div>

      <!-- Aviso de Regra Canônica Sem Status -->
      <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.3); border-radius:6px; padding:8px 12px; font-size:11px; color:#93c5fd; display:flex; align-items:center; gap:8px;">
        <span>ℹ️</span>
        <span><strong>100% Cosmético:</strong> Nenhum item deste guarda-roupa altera status, dano ou sobrevivência de combate.</span>
      </div>

      <!-- Navegação por Categorias -->
      <div class="cosmetic-category-nav">
        <button class="cosmetic-nav-btn ${activeSubTab === 'auras' ? 'active' : ''}" onclick="window.setCosmeticsSubTab('auras')">
          👑 Auras Místicas (${state.cosmetics.unlockedAuras.length}/${auras.length})
        </button>
        <button class="cosmetic-nav-btn ${activeSubTab === 'frames' ? 'active' : ''}" onclick="window.setCosmeticsSubTab('frames')">
          🔲 Molduras de Equipamento (${state.cosmetics.unlockedFrames.length}/${frames.length})
        </button>
        <button class="cosmetic-nav-btn ${activeSubTab === 'titles' ? 'active' : ''}" onclick="window.setCosmeticsSubTab('titles')">
          📜 Títulos Honoríficos (${state.cosmetics.unlockedTitles.length}/${titles.length})
        </button>
      </div>

      <!-- Grid de Itens da Categoria Ativa -->
      <div style="max-height:540px; overflow-y:auto; padding-right:4px;">
        ${contentHtml}
      </div>
    </div>
  `;
}

/**
 * Modal Canônico de Encantamento de Equipamento (#enchant-flow-modal).
 * Implementa o contrato sagrado: Scroll → Modal → Target → Preview → Atomic Enchant → Stats → CP
 * @param {string|null} initialTargetUid
 * @param {string|null} initialScrollUid
 * @param {Object|null} state
 * @param {Object} callbacks
 */
export function openEnchantFlowModal(initialTargetUid = null, initialScrollUid = null, state = null, callbacks = {}) {
  const root = getRoot();
  const modal = root.querySelector('#enchant-flow-modal');
  if (!modal) return;
  const body = modal.querySelector('#enchant-modal-body');
  if (!body) return;

  const closeBtn = modal.querySelector('#enchant-modal-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = 'none';
      if (callbacks.updateAllUI) callbacks.updateAllUI();
    };
  }

  let gState = state;
  if (!gState || !Array.isArray(gState.inventory) || gState.inventory.length === 0) {
    gState = (typeof getState === 'function' ? getState() : null) || (typeof window !== 'undefined' ? (window.getGameState ? window.getGameState() : window.state) : null);
  }
  if (!gState) return;

  let selectedScrollUid = initialScrollUid;
  let selectedTargetUid = initialTargetUid;

  const renderModalContent = () => {
    const allItems = D()?.ALL_ITEMS || ALL_ITEMS || (typeof window !== 'undefined' ? window.ALL_ITEMS : {}) || {};
    const inventory = gState.inventory || [];

    // Localiza todos os scrolls disponíveis
    const scrolls = inventory.filter(i => {
      if (!i || (i.count || 1) <= 0) return false;
      const def = allItems[i.itemId] || getItemDef(i.itemId) || i;
      const meta = parseEnchantScroll(def);
      return meta && meta.isScroll;
    });

    // Se nenhum scroll estiver explicitamente selecionado mas temos target, encontra o primeiro compatível
    let scrollItem = selectedScrollUid ? inventory.find(i => i.uid === selectedScrollUid) : null;
    if (!scrollItem && selectedScrollUid) {
      scrollItem = inventory.find(i => i.itemId === selectedScrollUid && (parseEnchantScroll(allItems[i.itemId] || getItemDef(i.itemId) || i)).isScroll) || null;
      if (scrollItem) selectedScrollUid = scrollItem.uid;
    }
    if (!scrollItem && scrolls.length > 0 && !selectedScrollUid) {
      if (selectedTargetUid) {
        const tItem = inventory.find(i => i.uid === selectedTargetUid) || (gState.equipment && gState.equipment[selectedTargetUid] ? inventory.find(i => i.uid === gState.equipment[selectedTargetUid]) : null);
        const tDef = tItem ? (allItems[tItem.itemId] || getItemDef(tItem.itemId) || tItem) : null;
        if (tDef) {
          scrollItem = scrolls.find(s => {
            const sDef = allItems[s.itemId] || getItemDef(s.itemId) || s;
            return isItemCompatibleWithScroll(tDef, sDef).ok;
          }) || null;
          if (scrollItem) selectedScrollUid = scrollItem.uid;
        }
      }
      if (!scrollItem && scrolls.length === 1) {
        scrollItem = scrolls[0];
        selectedScrollUid = scrollItem.uid;
      }
    }

    const scrollDef = scrollItem ? (allItems[scrollItem.itemId] || getItemDef(scrollItem.itemId) || scrollItem) : null;

    // Alvos elegíveis
    let eligibleTargets = [];
    if (scrollItem) {
      eligibleTargets = EnchantmentService.getEnchantableItems(gState, scrollItem.uid);
    } else {
      eligibleTargets = inventory.filter(i => isEquippableItem(allItems[i.itemId] || getItemDef(i.itemId) || i));
    }

    // Se temos um target selecionado, valida compatibilidade
    let targetItem = selectedTargetUid ? (inventory.find(i => i.uid === selectedTargetUid) || (gState.equipment && gState.equipment[selectedTargetUid] ? inventory.find(i => i.uid === gState.equipment[selectedTargetUid]) : null)) : null;
    if (targetItem && scrollDef) {
      const tDef = allItems[targetItem.itemId] || getItemDef(targetItem.itemId) || targetItem;
      if (!isItemCompatibleWithScroll(tDef, scrollDef).ok) {
        targetItem = null;
        selectedTargetUid = null;
      }
    }
    if (!targetItem && eligibleTargets.length > 0 && !selectedTargetUid) {
      const eqTarget = eligibleTargets.find(t => t.equipped);
      targetItem = eqTarget || eligibleTargets[0];
      selectedTargetUid = targetItem.uid;
    }

    const targetDef = targetItem ? (allItems[targetItem.itemId] || targetItem) : null;

    let html = '';

    // 1. SCROLL SELECTION BAR
    html += `
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.25); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <div style="font-size:11px; font-weight:bold; color:#ffd700; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span>📜 Pergaminho de Encantamento</span>
          <span>${scrolls.length} tipos na mochila</span>
        </div>
    `;

    if (scrolls.length === 0) {
      html += `
        <div style="font-size:11px; color:#f87171; padding:6px 0;">
          ❌ Nenhum pergaminho de encantamento encontrado na sua mochila.
        </div>
      `;
    } else {
      html += '<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">';
      for (const s of scrolls) {
        const sDef = allItems[s.itemId] || s;
        const sInfo = parseEnchantScroll(sDef);
        const isSelected = (s.uid === selectedScrollUid);
        html += `
          <div class="enchant-scroll-pill ${isSelected ? 'selected' : ''}" data-select-scroll="${s.uid}" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:6px; cursor:pointer; min-width:max-content; transition:all 0.15s; ${isSelected ? 'background:linear-gradient(135deg, rgba(212,167,68,0.35), rgba(212,167,68,0.15)); border:1px solid #ffd700; box-shadow:0 0 10px rgba(255,215,0,0.3);' : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);'}">
            <span style="font-size:14px;">📜</span>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:11px; font-weight:bold; color:${isSelected ? '#ffd700' : '#e2e8f0'};">${sDef.name}</span>
              <span style="font-size:9.5px; color:#94a3b8;">Grau: ${sInfo.grade || 'NG'} · Qtd: ${s.count || 1} ${sInfo.isBlessed ? '· ✨ Blessed' : ''}</span>
            </div>
          </div>
        `;
      }
      html += '</div>';
    }
    html += '</div>';

    // 2. TARGET SELECTION LIST
    html += `
      <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.25); border-radius:8px; padding:10px 12px; margin-bottom:12px;">
        <div style="font-size:11px; font-weight:bold; color:#ffd700; margin-bottom:6px; display:flex; justify-content:space-between;">
          <span>🎯 Equipamento Alvo (${eligibleTargets.length} compatíveis)</span>
          ${targetItem?.equipped ? '<span style="color:#6ee7b7; font-size:10px;">⚡ Equipado Atualmente</span>' : ''}
        </div>
    `;

    if (eligibleTargets.length === 0) {
      html += `
        <div style="font-size:11px; color:#94a3b8; padding:6px 0;">
          Nenhum equipamento compatível com este pergaminho foi encontrado na sua mochila ou corpo.
        </div>
      `;
    } else {
      html += '<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">';
      for (const t of eligibleTargets) {
        const tDef = allItems[t.itemId] || t;
        const isSelected = (t.uid === selectedTargetUid);
        const encLevel = Number(t.enchant || t.enchantLevel) || 0;
        html += `
          <div class="enchant-target-pill ${isSelected ? 'selected' : ''}" data-select-target="${t.uid}" style="display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:6px; cursor:pointer; min-width:max-content; transition:all 0.15s; ${isSelected ? 'background:linear-gradient(135deg, rgba(56,189,248,0.3), rgba(14,165,233,0.1)); border:1px solid #38bdf8; box-shadow:0 0 10px rgba(56,189,248,0.3);' : 'background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);'}">
            <span style="font-size:14px;">${tDef.slot === 'weapon' ? '⚔️' : '🛡️'}</span>
            <div style="display:flex; flex-direction:column;">
              <span style="font-size:11px; font-weight:bold; color:${isSelected ? '#38bdf8' : '#e2e8f0'};">${encLevel > 0 ? '+' + encLevel + ' ' : ''}${tDef.name}</span>
              <span style="font-size:9.5px; color:#94a3b8;">${(tDef.grade || 'NG').toUpperCase()}-Grade ${t.equipped ? '· ⚡ Equipado' : ''}</span>
            </div>
          </div>
        `;
      }
      html += '</div>';
    }
    html += '</div>';

    // 3. CANONICAL PREVIEW
    if (scrollItem && targetItem) {
      const preview = EnchantmentService.getEnchantPreview(gState, targetItem.uid, scrollItem.uid);
      if (preview && (preview.ok || preview.valid)) {
        const curEnc = preview.currentEnchant ?? preview.targetItem?.currentEnchant ?? 0;
        const nxtEnc = preview.targetEnchant ?? preview.targetItem?.targetEnchant ?? (curEnc + 1);
        const chancePct = Math.round((preview.successChance ?? 1) * 100);
        const isSafe = preview.isSafe ?? (curEnc < preview.safeLimit);
        const isBlessed = preview.isBlessed ?? preview.scrollItem?.isBlessed;
        const d = preview.statDeltas || preview.deltas || {};

        let riskLabel = '';
        let riskColor = '';
        if (isSafe) {
          riskLabel = '🛡️ Seguro (100% de Sucesso até o Limite Seguro)';
          riskColor = '#10b981';
        } else if (isBlessed) {
          riskLabel = '✨ Blessed Protegido (Em caso de falha, mantém o nível atual)';
          riskColor = '#a855f7';
        } else {
          riskLabel = `⚠️ Risco de Cristalização (Em caso de falha, se estilhaça em cristais)`;
          riskColor = '#ef4444';
        }

        html += `
          <div style="background:linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95)); border:1px solid rgba(212,167,68,0.5); border-radius:8px; padding:14px; margin-bottom:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:20px;">✨</span>
                <div>
                  <div style="font-size:14px; font-weight:bold; color:#ffd700;">
                    +${curEnc} → <span style="color:#38bdf8; font-size:16px;">+${nxtEnc}</span> ${targetDef.name}
                  </div>
                  <div style="font-size:10px; color:#94a3b8;">Grau ${(targetDef.grade || 'NG').toUpperCase()} · Limite Seguro: +${preview.safeLimit}</div>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:18px; font-weight:bold; color:${isSafe ? '#10b981' : (chancePct >= 50 ? '#ffd700' : '#f87171')};">
                  ${chancePct}%
                </div>
                <div style="font-size:9.5px; color:#94a3b8;">Chance de Sucesso</div>
              </div>
            </div>

            <!-- Risk Banner -->
            <div style="background:rgba(0,0,0,0.5); border-left:3px solid ${riskColor}; padding:6px 10px; font-size:10.5px; color:${riskColor}; margin-bottom:10px; border-radius:0 4px 4px 0;">
              ${riskLabel}
            </div>

            <!-- Stats Deltas -->
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; text-align:center; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px; margin-bottom:10px; font-size:11px;">
              <div>
                <div style="color:#94a3b8; font-size:10px;">P.Atk / M.Atk</div>
                <div style="color:#38bdf8; font-weight:bold;">${(d.atk || d.pAtk) > 0 ? '+' + (d.atk || d.pAtk) : ((d.matk || d.mAtk) > 0 ? '+' + (d.matk || d.mAtk) : '--')}</div>
              </div>
              <div>
                <div style="color:#94a3b8; font-size:10px;">P.Def / M.Def</div>
                <div style="color:#38bdf8; font-weight:bold;">${(d.def || d.pDef) > 0 ? '+' + (d.def || d.pDef) : ((d.mdef || d.mDef) > 0 ? '+' + (d.mdef || d.mDef) : '--')}</div>
              </div>
              <div>
                <div style="color:#94a3b8; font-size:10px;">Ganho de CP</div>
                <div style="color:#ffd700; font-weight:bold;">+${(d.cp || 0).toLocaleString()} CP</div>
              </div>
            </div>

            <!-- Action Button -->
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button id="enchant-modal-confirm-btn" style="background:linear-gradient(180deg, #d4a744, #8a641c); color:#000; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; padding:8px 18px; border:1px solid #ffe699; border-radius:6px; cursor:pointer; box-shadow:0 0 12px rgba(212,167,68,0.4); transition:all 0.15s;">
                ✨ Confirmar Encantamento (+${nxtEnc})
              </button>
            </div>
          </div>
        `;
      }
    }

    body.innerHTML = html;

    // Conecta cliques de seleção de scrolls
    body.querySelectorAll('[data-select-scroll]').forEach(btn => {
      btn.onclick = () => {
        selectedScrollUid = btn.dataset.selectScroll;
        renderModalContent();
      };
    });

    // Conecta cliques de seleção de targets
    body.querySelectorAll('[data-select-target]').forEach(btn => {
      btn.onclick = () => {
        selectedTargetUid = btn.dataset.selectTarget;
        renderModalContent();
      };
    });

    // Conecta o botão de confirmação de encantamento atômico
    const confirmBtn = body.querySelector('#enchant-modal-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        confirmBtn.disabled = true;
        confirmBtn.textContent = '⏳ Encantando...';

        const result = EnchantmentService.executeAtomicEnchant(gState, selectedTargetUid, selectedScrollUid, callbacks);
        if (result && (result.success || result.ok)) {
          if (callbacks.updateAllUI) callbacks.updateAllUI();
          if (callbacks.save) callbacks.save(true, true);
          setTimeout(() => {
            renderModalContent();
          }, 300);
        } else {
          confirmBtn.disabled = false;
          confirmBtn.textContent = '✨ Confirmar Encantamento';
        }
      };
    }
  };

  modal.style.display = 'flex';
  renderModalContent();
}

if (typeof window !== 'undefined') {
  window.openEnchantFlowModal = openEnchantFlowModal;
  window.openEnchantModalWithScroll = (scrollUid) => {
    const liveState = (typeof getState === 'function' ? getState() : null) || window.state;
    openEnchantFlowModal(null, scrollUid, liveState, window._callbacks || {});
  };
  window.openEnchantModalForTarget = (targetUid) => {
    const liveState = (typeof getState === 'function' ? getState() : null) || window.state;
    openEnchantFlowModal(targetUid, null, liveState, window._callbacks || {});
  };
}

export { renderRankingTab, setActiveRankingTab, renderMarketTab, setActiveMarketTab };
export { renderFishingUI } from './FishingUI.js';
export { renderHuntingUI } from './HuntingUI.js';
export { renderGatheringUI } from './GatheringUI.js';
export { renderMiningUI } from './MiningUI.js';
