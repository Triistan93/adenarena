/**
 * GameUI.js — Módulo unificado de interface gráfica do Lineage Idle.
 * Consolida TooltipUI, InventoryUI, StageUI, SkillsUI, ShopUI e AppLayout.
 */

import { D, ALL_EQUIP_SLOTS, TIER_NAMES } from '../core/GameConfig.js';
import { el, qsa, mkEl, mkNS, updateBar } from '../core/DomHelpers.js';
import {
  getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet,
  toggleSelectItem, selectItemsByFilter, clearItemSelection, getInventoryCount
} from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots, equipItem, unequipItem } from '../services/EquipmentService.js';
import { getCraftLevelReq, getRecipeMaterials, canCraft, getRecipeDef } from '../services/CraftService.js';
import { classSatisfies, getClassSkills } from '../services/CharacterService.js';
import { AFFIX_MAP } from '../../data/affixes.js';
import { getClass, getStats, getActiveSetBonuses } from '../engine/StatsEngine.js';
import { getSkillCost } from '../engine/SkillEngine.js';
import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { RAID_BOSSES } from '../data/raids.js';
import { getRaidStatus } from '../services/RaidService.js';
import { INFINITY_WEAPONS, HEROIC_SKILLS, OLYMPIAD_GLADIATORS, OLYMPIAD_SHOP_CATALOG } from '../data/olympiad.js';
import { NOBLESSE_QUEST_DEFS } from '../data/quests.js';
import { NoblesseService } from '../services/NoblesseService.js';
import { OlympiadService } from '../services/OlympiadService.js';
import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../data/clan.js';
import { CASTLES, CASTLE_SHOP_CATALOG } from '../data/castles.js';
import { ClanService } from '../services/ClanService.js';
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
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════════════════════════════════════════════════════════════
   1. DOM ROOT & HELPERS
═══════════════════════════════════════════════════════════════════════════ */
export function getRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

export function findElement(id) {
  return getRoot().querySelector('#' + id) || document.getElementById(id);
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

/* ═══════════════════════════════════════════════════════════════════════════
   2. TOOLTIP & ICON HELPERS
═══════════════════════════════════════════════════════════════════════════ */
export function getAssetUrl(p) {
  if (!p) return '';
  p = String(p).replace(/\\/g, '/');
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
  hair_heirloom_crown: 'acessories/noble_gold_crown.png'
};

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

  // Prioridade 1: Mapeamento de Herança resiliente
  if (HEIRLOOM_ICON_MAP[itemId] || HEIRLOOM_ICON_MAP[def?.id]) {
    const matchedPath = HEIRLOOM_ICON_MAP[itemId] || HEIRLOOM_ICON_MAP[def?.id];
    return getAssetUrl(`img/icons/${matchedPath}`);
  }

  const iconIndex = (typeof window !== 'undefined' && window.IconIndex)
    ? window.IconIndex
    : (gData?.ICON_MAP || {});

  let rawPath = def?.icon || '';

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

  if (!rawPath && itemId) {
    rawPath = `${itemId}.png`;
  }

  if (rawPath) {
    let p = String(rawPath).replace(/\\/g, '/').replace(/^\//, '');
    if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
      return p;
    }
    if (!p.endsWith('.png') && !p.endsWith('.jpg') && !p.endsWith('.webp') && !p.endsWith('.svg')) {
      p += '.png';
    }
    if (!p.startsWith('img/icons/') && !p.startsWith('img/')) {
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
    scroll: '📜', cloak: '🧣', cape: '🧣', belt: '🎗️', hair: '👑', agathion: '👼'
  };
  const emoji = fallbackIcons[slot] || '📦';

  const iconUrl = getItemIconUrl(defOrId, def);
  if (!iconUrl) return emoji;

  return `<img src="${iconUrl}" alt="${def?.name || ''}" class="inventory-item-image" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" style="width:24px; height:24px; object-fit:contain; vertical-align:middle; pointer-events:none;" /><span class="inventory-item-emoji" style="display:none; font-size:15px;">${emoji}</span>`;
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

  const enchant = item.enchant || 0;
  const enchantMult = 1 + (enchant <= 3 ? enchant * 0.12 : (0.36 + (enchant - 3) * 0.15));
  const foundationMult = item.foundation ? 1.3 : 1;
  const currentLvl = state?.level || 1;
  const isHeirloom = !!(def.isHeirloom || item.isHeirloom);

  // Calcula atributos ativos (com suporte dinâmico a Herança)
  let activeItemStats = { ...def };
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
      const affDef = (AFFIX_MAP || {})[a.id] || (gData?.AFFIX_MAP || {})[a.id];
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
      'brooch','talisman_bracelet','talisman','jewel','sigil'].includes(def.slot);
    const isConsumable = ['consumable','scroll','powerup','potion','food'].includes(def.slot);

    if (isEquipSlot) {
      if (item.equipped) {
        actionsHtml += `<button data-tt-action="unequip" data-uid="${item.uid}" data-slot="${item.equippedSlot || def.slot}"
          style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#5a4020,#2a1a08);border:1px solid #a07030;
          border-radius:4px;color:#e8c870;font-size:11px;cursor:pointer;font-weight:600;">⬆ Desequipar</button>`;
      } else {
        actionsHtml += `<button data-tt-action="equip" data-uid="${item.uid}"
          style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#1a3a5a,#0a1a2a);border:1px solid #3a7ab0;
          border-radius:4px;color:#70c8f8;font-size:11px;cursor:pointer;font-weight:600;">⚔ Equipar</button>`;
      }
    }
    if (isConsumable) {
      actionsHtml += `<button data-tt-action="use" data-uid="${item.uid}"
        style="flex:1;padding:5px 8px;background:linear-gradient(180deg,#1a4a2a,#0a2010);border:1px solid #3ab070;
        border-radius:4px;color:#70e898;font-size:11px;cursor:pointer;font-weight:600;">▶ Usar</button>`;
    }
    if (!item.equipped) {
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
      if (action === 'equip'   && callbacks.equipItem)   callbacks.equipItem(uid, state);
      if (action === 'unequip' && callbacks.unequipItem) {
        const slot = btn.dataset.slot;
        callbacks.unequipItem(slot, state);
      }
      if (action === 'sell'    && callbacks.sellItem)    callbacks.sellItem(uid);
      if (action === 'salvage' && callbacks.salvageItem) callbacks.salvageItem(uid);
      if (action === 'use'     && callbacks.useItem)     callbacks.useItem(uid);
      hideItemTooltip();
    };
  });

  tooltip.style.display = 'block';
  const clientX = e?.clientX ?? (e?.pageX || 100);
  const clientY = e?.clientY ?? (e?.pageY || 100);
  const posX = Math.min(window.innerWidth - 260, clientX + 15);
  const posY = Math.max(10, Math.min(window.innerHeight - 250, clientY + 15));
  tooltip.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
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
const GEAR_SLOTS = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'necklace', 'earring', 'ring', 'hair', 'hair2', 'agathion', 'talisman'];
const CONSUMABLE_SLOTS = ['consumable', 'potion', 'scroll', 'food', 'powerup'];
const MATERIAL_SLOTS = ['material', 'gem', 'ore', 'craft'];

const SLOT_ICONS = {
  hair1: '👒', hair2: '🎭', helmet: '🪖',
  earring1: '💎', armor: '🛡️', earring2: '💎',
  necklace: '📿', legs: '👖', cloak: '🧥',
  weapon: '⚔️', gloves: '🧤', shield: '🛡️',
  ring1: '💍', boots: '👢', ring2: '💍',
  brooch: '❇️', agathion_bracelet: '🧚‍♂️', talisman_bracelet: '🔮', belt: '🪢'
};

function findEquipmentSlot(slot) {
  return findElement(`equip-slot-${slot}`) || getRoot().querySelector(`[data-slot="${slot}"]`);
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

/* === GRID FIXO DE 10x8 COM BORDAS DEFINIDAS E SCROLLBAR VERTICAL === */
#tab-inventory #inventory-grid,
#tab-inventory .inventory-grid,
#tab-inventory .l2inv-grid,
#inventory-grid,
.inventory-grid,
.l2inv-grid {
  display: grid !important;
  grid-template-columns: repeat(10, 38px) !important;
  grid-auto-rows: 38px !important;
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
  justify-content: start !important;
  flex: 0 0 auto !important;
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

/* === SLOTS DO INVENTÁRIO (38px x 38px) === */
/* NOTE: border is NOT set here with !important — rarity styles from style.css will apply */
#tab-inventory .inv-slot,
.inv-slot,
.l2inv-slot {
  width: 38px !important;
  height: 38px !important;
  min-width: 38px !important;
  max-width: 38px !important;
  min-height: 38px !important;
  max-height: 38px !important;
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

  const searchInput = findElement('inv-search-input');
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();

  const sorted = [...(state.inventory || [])]
    .filter(i => i?.itemId)
    .sort((a, b) => {
      const da = getItemDef(a.itemId);
      const db = getItemDef(b.itemId);
      if (!da || !db) return 0;
      return (db.tier || 0) - (da.tier || 0);
    });

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

    const isSelected = selectedSet.has(item.uid);
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const check = `<span class="inv-check">${isSelected ? '✓' : ''}</span>`;

    const tierNum = def.tier || 0;
    const GRADE_LABELS = { 0: '', 1: 'NG', 2: 'D', 3: 'C', 4: 'B', 5: 'S', 6: 'FL' };
    const gradeLabel = GRADE_LABELS[tierNum] || '';
    const tierBadge = (gradeLabel && GEAR_SLOTS.includes(defSlot))
      ? `<span class="tier-badge tier-${tierNum}">${gradeLabel}</span>` : '';

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;

    slotEl.innerHTML = `
      ${check}
      <span class="item-icon">${getItemIcon(def || item)}</span>
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
      if (callbacks.toggleSelectItem) {
        callbacks.toggleSelectItem(item.uid);
        updateInventoryUI(state, callbacks);
      }
    };

    slotEl.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.equipped) {
        if (callbacks.unequipItem) callbacks.unequipItem(item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), state);
      } else {
        if (callbacks.equipItem) callbacks.equipItem(item.uid, state);
      }
    };

    slotEl.ondblclick = (e) => {
      e.stopPropagation();
      if (CONSUMABLE_SLOTS.includes(defSlot) && callbacks.useItem) callbacks.useItem(item.uid);
    };

    grid.appendChild(slotEl);
  }

  // Preenche os espaços em preto restantes com molduras de slots vazios até 80 slots (8 linhas x 10 colunas)
  const renderedCount = grid.children.length;
  const maxSlots = getMaxInventorySlots(state) || 80;
  const totalDisplaySlots = Math.max(maxSlots, Math.ceil(renderedCount / 10) * 10, 80);

  for (let i = renderedCount; i < totalDisplaySlots; i++) {
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
    if (btnSell) btnSell.onclick = () => { if (callbacks.sellSelectedItems) callbacks.sellSelectedItems(); };

    const btnSalvage = actionBar.querySelector('#btn-salvage-selected');
    if (btnSalvage) btnSalvage.onclick = () => { if (callbacks.salvageSelectedItems) callbacks.salvageSelectedItems(); };

    const btnJunk = actionBar.querySelector('#btn-select-junk');
    if (btnJunk) btnJunk.onclick = () => { if (callbacks.selectJunkItems) callbacks.selectJunkItems(); };

    const btnClear = actionBar.querySelector('#btn-clear-sel');
    if (btnClear) btnClear.onclick = () => { if (callbacks.clearItemSelection) callbacks.clearItemSelection(); };
  }

  const cnt = findElement('inv-count') || findElement('inv-slots');
  if (cnt) cnt.textContent = `${state.inventory?.length || 0}/${maxSlots}`;
  const l2cnt = findElement('l2inv-counter');
  if (l2cnt) l2cnt.textContent = `(${state.inventory?.length || 0}/${maxSlots})`;
}

export function updateWarehouseUI(state, callbacks = {}) {
  if (!state || typeof state !== 'object') {
    state = (typeof window !== 'undefined' && window.state) ? window.state : {};
  }
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
    let slotEl = findEquipmentSlot(slot);
    if (!slotEl) slotEl = createEquipmentSlotDynamically(slot);
    if (!slotEl) continue;

    const uid = state.equipment[slot];
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def = item ? getItemDef(item.itemId) : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      const penaltyCheck = (typeof window !== 'undefined' && window.BalanceEngine) ? window.BalanceEngine.checkGradePenalty(state.level || 1, def || item) : { hasPenalty: false };

      let slotClasses = `equip-slot active rarity-${rarity}`;
      if (penaltyCheck.hasPenalty) slotClasses += ' has-grade-penalty';

      slotEl.className = slotClasses;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;

      const penaltyBadge = penaltyCheck.hasPenalty ? `<span class="grade-penalty-badge" style="position:absolute; top:-3px; right:-3px; background:#dc2626; color:#fff; font-size:8px; padding:1px 2px; border-radius:2px; font-weight:bold; box-shadow:0 0 4px #000;" title="${penaltyCheck.reason}">⚠️</span>` : '';
      slotEl.innerHTML = `${penaltyBadge}<span class="equip-icon">${getItemIcon(def || item)}</span>`;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => {
        if (callbacks.unequipItem) callbacks.unequipItem(slot, state);
      };

      item.equipped = true;
      item.equippedSlot = slot;
    } else {
      slotEl.className = 'equip-slot empty';
      slotEl.dataset.slot = slot;
      delete slotEl.dataset.uid;

      slotEl.innerHTML = `<span class="equip-placeholder">${SLOT_ICONS[slot] || '📦'}</span>`;

      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
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
  let sprite = monsterCard.querySelector('#monster-sprite-container, .monster-sprite-host');

  if (!name || !level || !hpBar || !sprite) {
    monsterCard.innerHTML = `
      <div id="monster-name" class="stage-entity-name">—</div>
      <div id="monster-level" class="stage-entity-level stage-monster-level">Level 1</div>
      <div id="monster-hp-bar" class="stage-hp-bar">
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">HP: 0 / 0</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;
    name = monsterCard.querySelector('#monster-name');
    level = monsterCard.querySelector('#monster-level');
    hpBar = monsterCard.querySelector('#monster-hp-bar');
    sprite = monsterCard.querySelector('#monster-sprite-container');
  }

  return { card: monsterCard, name, level, hpBar, sprite };
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
    return;
  }

  if (structure.name) {
    const badge = m.boss ? ' ★' : (m.isElite || m.elite ? ' ⚔' : '');
    structure.name.textContent = `${m.name || 'Monstro'}${badge}`;
  }

  if (structure.level) {
    const mLvl = m.level || m.lvl || (ZONES[state?.zone]?.level || 1);
    structure.level.textContent = `Level ${mLvl}`;
  }

  const curHp = Math.round(m.hp !== undefined ? m.hp : (m._maxHp || m.maxHp || 100));
  const maxHp = Math.round(m._maxHp || m.maxHp || curHp || 100);

  updateBar('monster-hp-fill', curHp, maxHp);
  updateBar('monster-hp-bar', curHp, maxHp);

  const monsterHpText = structure.card.querySelector('#monster-hp-text, .stage-hp-text');
  if (monsterHpText) monsterHpText.textContent = `HP: ${curHp} / ${maxHp}`;

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

  const gData = typeof window !== 'undefined' ? (window.EchoData || window.GameData) : null;
  const raceDef = (gData && gData.RACES_ECHO && gData.RACES_ECHO[race]) || { name: race.toUpperCase() };
  const classDef = (gData && gData.CLASSES_ECHO && gData.CLASSES_ECHO[cls]) || { name: cls.toUpperCase() };

  const raceName = raceDef.name || race.toUpperCase();
  const className = classDef.name || cls.toUpperCase();

  const portraitName = root.querySelector('#portrait-name, .portrait-name');
  if (portraitName) portraitName.textContent = charName;

  const portraitSub = root.querySelector('#portrait-sub, .portrait-sub');
  if (portraitSub) portraitSub.textContent = `Level ${level} · ${raceName} ${className}`;

  const raceClassDisp = root.querySelector('#hero-race-class-display');
  if (raceClassDisp) raceClassDisp.textContent = `${raceName} — ${className}`;

  const portraitArt = root.querySelector('#portrait-art, .portrait-art');
  if (portraitArt && typeof heroSVG === 'function') {
    portraitArt.innerHTML = heroSVG(state);
  }

  const charStatsContainer = root.querySelector('#char-tab-stats-summary');
  if (charStatsContainer) {
    const stats = getStats(state);
    const setRes = typeof getActiveSetBonuses === 'function' ? getActiveSetBonuses(state) : { primaryStats: {} };
    const setPrim = setRes.primaryStats || {};

    // Calculate Tattoos Active Stat Deltas
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

    const renderStatBlock = (label, val, setVal, dyeVal) => {
      const badges = [];
      if (setVal) badges.push(`<span style="color:#4ade80; font-size:9px;">Set +${setVal}</span>`);
      if (dyeVal) badges.push(dyeVal > 0 ? `<span style="color:#a78bfa; font-size:9px;">Dye +${dyeVal}</span>` : `<span style="color:#ef4444; font-size:9px;">Dye ${dyeVal}</span>`);
      const badgesHtml = badges.length > 0 ? `<div style="display:flex; justify-content:center; gap:2px; flex-wrap:wrap; margin-top:2px;">${badges.join(' ')}</div>` : '';
      return `
        <div style="background:rgba(0,0,0,0.3); padding:4px 2px; border-radius:4px;">
          <div style="color:#aaa; font-size:10px;">${label}</div>
          <strong style="color:#ffd877; font-size:13px;">${val}</strong>
          ${badgesHtml}
        </div>
      `;
    };

    // Socket SA on Equipped Weapon
    const wpnUid = state.equipment?.weapon;
    const socket = (wpnUid && state.weaponSockets) ? state.weaponSockets[wpnUid] : null;

    let tattoosHtml = '';
    if (tattoos.length > 0) {
      tattoosHtml = tattoos.map(t => `<div style="font-size:11px; color:#d8b4fe;">🖊️ Tatuagem: +${t.plusVal} ${t.plusStat.toUpperCase()} / -${t.minusVal} ${t.minusStat.toUpperCase()}</div>`).join('');
    } else {
      tattoosHtml = '<div style="font-size:11px; color:#aaa;">Nenhuma tatuagem instalada. (Instale na ⚒️ Forja)</div>';
    }

    charStatsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; display:grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom:6px;">
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">⚔️ P.Atk:</span> <strong style="color:#f59e0b; float:right;">${stats.atk || 0}</strong>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">🛡️ P.Def:</span> <strong style="color:#60a5fa; float:right;">${stats.def || 0}</strong>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">👟 Esquiva:</span> <strong style="color:#34d399; float:right;">${stats.eva || 0}</strong>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">🔮 M.Atk:</span> <strong style="color:#a78bfa; float:right;">${stats.matk || 0}</strong>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">✨ M.Def:</span> <strong style="color:#f472b6; float:right;">${stats.mdef || 0}</strong>
        </div>
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); padding:6px 10px; border-radius:6px; font-size:11px;">
          <span style="color:#a8a29e;">⚡ Crítico:</span> <strong style="color:#fbbf24; float:right;">${stats.crit || 0}%</strong>
        </div>
      </div>

      <!-- Primary Stats with Set & Tattoo Influences -->
      <div style="grid-column: 1 / -1; background:rgba(20,26,42,0.6); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:10px; margin-bottom:8px;">
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:12px;">📊 Atributos Primários (Sets, Dyes &amp; L2 Stats)</h4>
        <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:4px; text-align:center; font-size:11px;">
          ${renderStatBlock('STR', state.primaryStats?.str || 40, setPrim.str || 0, tatStr)}
          ${renderStatBlock('DEX', state.primaryStats?.dex || 30, setPrim.dex || 0, tatDex)}
          ${renderStatBlock('CON', state.primaryStats?.con || 43, setPrim.con || 0, tatCon)}
          ${renderStatBlock('INT', state.primaryStats?.int || 21, setPrim.int || 0, tatInt)}
          ${renderStatBlock('WIT', state.primaryStats?.wit || 11, setPrim.wit || 0, tatWit)}
          ${renderStatBlock('MEN', state.primaryStats?.men || 25, setPrim.men || 0, tatMen)}
        </div>
      </div>

      <!-- Active Refinements & Dyes Summary Card -->
      <div style="grid-column: 1 / -1; background:rgba(30,16,48,0.7); border:1px solid rgba(168,85,247,0.4); border-radius:8px; padding:10px;">
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#d8b4fe; font-size:12px; display:flex; align-items:center; gap:6px;">
          🔮 Refinamentos &amp; Dyes Gravados
        </h4>
        ${tattoosHtml}
        <div style="font-size:11px; color:#34d399; margin-top:4px;">
          ${socket ? `🔮 SA Arma: <strong>${socket.effect.toUpperCase()} Stage ${socket.stage}</strong>` : '🔮 SA Arma: Nenhum Soul Crystal engastado.'}
        </div>
      </div>
    `;
  }
}

export function updateZoneUI(state, callbacks = {}) {
  const zoneNameEl = findElement('zone-name') || findElement('stage-zone');
  if (!state?.currentZone) return;

  const zDef = ZONES[state.currentZone];
  if (zDef && zoneNameEl) {
    zoneNameEl.textContent = zDef.name;
  }

  const stageEl = findElement('stage');
  if (stageEl && state.currentZone) {
    const bgUrl = ZONE_BACKGROUNDS[state.currentZone] || zDef?.background;
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

  const sagasData = SAGAS || [
    { name: 'Interlude', unlocksAt: 1, zones: ['talking_island', 'elven_village', 'dark_elven_village', 'gludin', 'gludio'] }
  ];

  const sagaList = Array.isArray(sagasData) ? sagasData : Object.values(sagasData);

  for (const saga of sagaList) {
    if (!saga) continue;

    const block = document.createElement('div');
    block.className = 'saga-map-block';

    const zonesList = saga.zones || [];
    const cardsHtml = zonesList.map(zId => {
      const zDef = ZONES[zId];
      if (!zDef) return '';

      const isCurrent = (state.zone || state.currentZone) === zId;
      const reqLvl = zDef.level ?? zDef.minLevel ?? zDef.reqLvl ?? 1;
      const isLocked = (state.level || 1) < reqLvl;
      const bgUrl = ZONE_BACKGROUNDS[zId] || zDef.background || '';
      const thumbStyle = bgUrl ? `style="background-image:url('${getAssetUrl(bgUrl)}')"` : '';

      const monsterCount = zDef.monsters?.length || zDef.monsterTypes?.length || 4;
      const bossName = zDef.boss || zDef.bossName || 'Chefão';

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
              <span class="zone-card-lvl">Lv.${reqLvl}+</span>
            </div>
            <div class="zone-card-desc">
              ${monsterCount} espécie${monsterCount === 1 ? '' : 's'} · 👑 ${bossName}
            </div>
            <button class="select-zone-btn" ${isLocked || isCurrent ? 'disabled' : ''}>
              ${isCurrent ? '★ Caçando Aqui' : isLocked ? `🔒 Requer Lv.${reqLvl}` : 'Caçar nesta Área'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    block.innerHTML = `
      <div class="saga-header">
        <span class="saga-title">🗺️ ${saga.name}</span>
        <span class="saga-req">Lv. ${saga.unlocksAt || saga.reqLvl || 1}+</span>
      </div>
      <div class="saga-zones-grid">${cardsHtml}</div>
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
const TREE_NODE_W = 110;
const TREE_NODE_H = 78;
const TREE_PAD_X = 14;
const TREE_PAD_Y = 14;

export function updateSkillUI(state, callbacks = {}) {
  const wrap = findElement('skill-tree');
  if (!wrap) return;

  const echoData = typeof window !== 'undefined' ? window.EchoData : null;
  const SKILL_DEFS = echoData?.SKILL_DEFS_ECHO || D()?.SKILL_DEFS || {};
  const SKILL_REQS = echoData?.SKILL_REQS_ECHO || D()?.SKILL_REQS || {};
  const SKILL_TREE_LAYOUT = echoData?.SKILL_TREE_LAYOUT_ECHO || D()?.SKILL_TREE_LAYOUT || {};

  const cols = 5;
  const pos = {};

  const classSkillIds = getClassSkills(state.class);
  let classSkills;
  if (classSkillIds && classSkillIds.length > 0) {
    classSkills = classSkillIds
      .map(id => [id, SKILL_DEFS[id]])
      .filter(([id, def]) => def != null);
  } else {
    classSkills = Object.entries(SKILL_DEFS).filter(([id, def]) => classSatisfies(state.class, def.classReq));
  }

  const skillsByTier = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  for (const [id, def] of classSkills) {
    const t = def.tier !== undefined ? def.tier : 0;
    if (skillsByTier[t]) skillsByTier[t].push([id, def]);
  }

  const usedPositions = new Set();
  for (let c = 0; c < 5; c++) {
    const list = skillsByTier[c] || [];
    list.forEach(([id, def]) => {
      const explicit = SKILL_TREE_LAYOUT[id];
      if (explicit && explicit.col !== undefined && explicit.row !== undefined) {
        const col = explicit.col;
        const row = explicit.row;
        pos[id] = {
          x: TREE_PAD_X + col * TREE_NODE_W + TREE_NODE_W / 2,
          y: TREE_PAD_Y + row * TREE_NODE_H + TREE_NODE_H / 2
        };
        usedPositions.add(`${col},${row}`);
      }
    });
  }

  const colCounters = [0, 0, 0, 0, 0];
  for (let c = 0; c < 5; c++) {
    const list = skillsByTier[c] || [];
    list.forEach(([id, def]) => {
      if (pos[id]) return;
      let row = colCounters[c];
      while (usedPositions.has(`${c},${row}`)) row++;
      colCounters[c] = row + 1;
      usedPositions.add(`${c},${row}`);
      pos[id] = {
        x: TREE_PAD_X + c * TREE_NODE_W + TREE_NODE_W / 2,
        y: TREE_PAD_Y + row * TREE_NODE_H + TREE_NODE_H / 2
      };
    });
  }

  const maxRow = Object.values(pos).reduce((m, p) => {
    const row = Math.round((p.y - TREE_PAD_Y - TREE_NODE_H / 2) / TREE_NODE_H);
    return Math.max(m, row);
  }, 6);
  const rows = maxRow + 2;
  const W = cols * TREE_NODE_W + TREE_PAD_X * 2;
  const H = rows * TREE_NODE_H + TREE_PAD_Y * 2;
  wrap.style.width = W + 'px';
  wrap.style.height = H + 'px';

  let lines = '';
  for (const [id, reqs] of Object.entries(SKILL_REQS)) {
    const childPos = pos[id];
    if (!childPos) continue;
    for (const parentId of Object.keys(reqs)) {
      if (parentId === 'reqLvl' || parentId === 'level' || parentId === 'sp') continue;
      const parentPos = pos[parentId];
      if (!parentPos) continue;
      const parentLevel = state.skills[parentId] || 0;
      const reqLevel = reqs[parentId];
      const owned = parentLevel >= reqLevel;
      const cls = owned ? 'link link-owned' : 'link';

      const midX = (parentPos.x + childPos.x) / 2;
      lines += `<path class="${cls}" d="M ${parentPos.x} ${parentPos.y} C ${midX} ${parentPos.y}, ${midX} ${childPos.y}, ${childPos.x} ${childPos.y}" fill="none" />`;
    }
  }

  let tierLabels = '';
  for (let c = 0; c < cols; c++) {
    const x = TREE_PAD_X + c * TREE_NODE_W + TREE_NODE_W / 2;
    tierLabels += `<text class="tier-label" x="${x}" y="${H - 6}">${TIER_NAMES[c] || ''}</text>`;
  }

  const defsSvg = `
    <defs>
      <linearGradient id="linkGradientOwned" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffd877" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#34d399" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="linkGradientLocked" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#64748b" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#334155" stop-opacity="0.4" />
      </linearGradient>
      <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  `;

  wrap.querySelector('svg')?.remove();
  const svg = mkNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree-svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = defsSvg + lines + tierLabels;
  wrap.insertBefore(svg, wrap.firstChild);

  let nodesLayer = wrap.querySelector('.skill-tree-nodes');
  if (!nodesLayer) {
    nodesLayer = mkEl('div');
    nodesLayer.className = 'skill-tree-nodes';
    wrap.appendChild(nodesLayer);
  }
  nodesLayer.innerHTML = '';

  for (const [id, def] of classSkills) {
    if (!def) continue;
    const p = pos[id];
    if (!p) continue;
    const node = mkEl('div');
    const lvl = state.skills[id] || 0;
    const max = def.max || def.maxLevel || 5;

    // Check weapon restriction
    const wpnCheck = (typeof canCastSkillWeapon === 'function') ? canCastSkillWeapon(state, def) : { ok: true };
    const isWpnBlocked = !wpnCheck.ok;

    // Check 4-Star Ultimate Book Unlock Requirement (Apenas Ultimates 4★ exigem Livro Ancestral)
    const bookReq = (def.starRank === 4 || def.isUltimate) ? 'spellbook_4star' : null;
    const hasBook = bookReq ? state.inventory?.some(i => i.itemId === bookReq && (i.count || 1) > 0) : true;
    const isBookLocked = bookReq && lvl === 0 && !hasBook;

    let nodeClass = `skill-node tier-${def.tier || 0}`;
    if (lvl > 0) nodeClass += ' owned';
    if (lvl === max) nodeClass += ' maxed';
    if (isWpnBlocked) nodeClass += ' weapon-blocked';
    if (def.isUltimate || def.starRank === 4) nodeClass += ' ultimate-4star';
    if (isBookLocked) nodeClass += ' book-locked';
    else if (bookReq && lvl === 0 && hasBook) nodeClass += ' book-ready';

    node.className = nodeClass;
    node.style.left = (p.x - TREE_NODE_W / 2) + 'px';
    node.style.top = (p.y - TREE_NODE_H / 2) + 'px';
    node.style.width = TREE_NODE_W + 'px';
    node.style.height = TREE_NODE_H + 'px';

    const reqs = SKILL_REQS[id];
    const reqOk = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || s === 'reqLvl' || (state.skills[s] || 0) >= v);
    const lvlOk = state.level >= (def.reqLvl || 1);
    const canBuy = reqOk && lvlOk && state.sp >= getSkillCost(id, lvl) && lvl < max && !isBookLocked;
    const btnClass = canBuy ? 'skill-btn can-buy' : 'skill-btn';

    let badgeHtml = '';
    if (isWpnBlocked) {
      badgeHtml = `<span style="position:absolute; top:-6px; right:-4px; background:#dc2626; color:#fff; font-size:9px; padding:1px 3px; border-radius:3px; font-weight:bold; box-shadow:0 0 4px #000;">🚫 ${wpnCheck.reason || 'Arma'}</span>`;
    } else if (isBookLocked) {
      badgeHtml = `<span style="position:absolute; top:-6px; right:-4px; background:#7c3aed; color:#fff; font-size:9px; padding:1px 3px; border-radius:3px; font-weight:bold; box-shadow:0 0 4px #000;">🔒 Livro 4★</span>`;
    } else if (bookReq && lvl === 0 && hasBook) {
      badgeHtml = `<span style="position:absolute; top:-6px; right:-4px; background:#f59e0b; color:#000; font-size:9px; padding:1px 3px; border-radius:3px; font-weight:bold; box-shadow:0 0 6px #f59e0b; animation:pulse 1.2s infinite;">⭐ Livro OK</span>`;
    }

    const iconVal = def.icon || '✦';
    const isIconImg = iconVal.endsWith('.jpg') || iconVal.endsWith('.png') || iconVal.includes('/');
    const iconHtml = isIconImg 
      ? `<img src="${iconVal}" class="skill-icon-img" alt="${def.name}" style="width:24px; height:24px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.2);" />` 
      : `<span class="skill-icon">${iconVal}</span>`;

    node.innerHTML = `
      ${badgeHtml}
      <button class="${btnClass}" data-skill="${id}">
        ${iconHtml}
        <span class="skill-name">${def.name}</span>
        <span class="skill-lvl-num">${lvl}/${max}</span>
      </button>
    `;
    nodesLayer.appendChild(node);
  }

  qsa('.skill-btn').forEach(btn => {
    const sId = btn.dataset.skill;
    const def = SKILL_DEFS[sId];
    if (!def) return;
    if (callbacks.showSkillTooltip) btn.onmouseenter = (e) => callbacks.showSkillTooltip(sId, e);
    if (callbacks.hideSkillTooltip) btn.onmouseleave = callbacks.hideSkillTooltip;
    btn.onclick = () => {
      state.selectedSkill = sId;
      if (callbacks.spendSP) callbacks.spendSP(sId);
      updateSkillUI(state, callbacks);
    };
  });

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
      classSatisfies(state.class, SKILL_DEFS[sid].classReq) && (state.skills[sid] || 0) > 0
    ) || Object.keys(SKILL_DEFS).find(sid =>
      classSatisfies(state.class, SKILL_DEFS[sid].classReq)
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

  panel.innerHTML = `
    <div class="si-head"><span class="si-icon">${def.icon || '✦'}</span><div class="si-title"><h3>${def.name}</h3><p class="si-tier">${tier} · Lv.${lvl}/${max}</p></div></div>
    <p class="si-desc">${def.desc || def.note || ''}</p><div class="si-effect">${effectText}</div>
    <div class="si-reqs"><span class="si-label">Requires</span>${reqHtml}</div>
    <button class="si-btn" data-skillup="${id}" ${(!canAfford || !meetsReqs || !lvlOk) ? 'disabled' : ''}>${maxed ? '✦ MAXED' : `Invest ${cost.toLocaleString()} SP`}</button>
    <p class="si-sp">SP available: <strong>${(state.sp || 0).toLocaleString()}</strong></p>
    ${legacySectionHtml}
  `;

  const btn = panel.querySelector('[data-skillup]');
  if (btn) {
    btn.onclick = () => {
      if (callbacks.spendSP) callbacks.spendSP(btn.dataset.skillup);
    };
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   6. SHOP & CRAFTING
═══════════════════════════════════════════════════════════════════════════ */
let currentShopTab = 'gear';
let currentShopGrade = 'all';
let currentShopSlot = 'all';
let currentShopQty = 1;

export function updateShopUI(state, callbacks = {}) {
  const root = getRoot();
  const goldEl = findElement('gold-count') || findElement('shop-gold');
  if (goldEl) goldEl.textContent = (state.gold || 0).toLocaleString();

  const container = findElement('shop-items-container') || findElement('shop-list');
  if (!container) return;

  // Always re-bind subtabs & filter button listeners to ensure click handlers work on tab switches
  root.querySelectorAll('.shop-subtab').forEach(btn => {
    const tabName = btn.dataset.shoptab || 'gear';
    btn.classList.toggle('active', tabName === currentShopTab);
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentShopTab = tabName;
      updateShopUI(state, callbacks);
    };
  });

  root.querySelectorAll('#shop-grade-filters .shop-filter-btn').forEach(btn => {
    const gradeCode = btn.dataset.shopgrade || 'all';
    btn.classList.toggle('active', gradeCode === currentShopGrade);
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentShopGrade = gradeCode;
      updateShopUI(state, callbacks);
    };
  });

  root.querySelectorAll('#shop-slot-filters .shop-filter-btn').forEach(btn => {
    const slotCode = btn.dataset.shopslot || 'all';
    btn.classList.toggle('active', slotCode === currentShopSlot);
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentShopSlot = slotCode;
      updateShopUI(state, callbacks);
    };
  });

  root.querySelectorAll('#shop-batch-filters .shop-filter-btn').forEach(btn => {
    const qtyVal = parseInt(btn.dataset.shopqty, 10) || 1;
    btn.classList.toggle('active', qtyVal === currentShopQty);
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      currentShopQty = qtyVal;
      updateShopUI(state, callbacks);
    };
  });

  // Toggle batch row visibility based on active subtab
  const batchRow = root.querySelector('#shop-batch-row');
  if (batchRow) {
    batchRow.style.display = (currentShopTab === 'potions') ? 'flex' : 'none';
  }

  // Toggle slot filter row visibility
  const slotRow = root.querySelector('#shop-slot-filter-row');
  if (slotRow) {
    slotRow.style.display = (currentShopTab === 'gear' || currentShopTab === 'mystic') ? 'flex' : 'none';
  }

  // Toggle mystic timer visibility
  const mysticTimerEl = root.querySelector('#mystic-shop-timer');
  const mysticCountdown = root.querySelector('#mystic-timer-countdown');

  const now = Date.now();
  const THREE_HOURS = 3 * 3600 * 1000;

  // Initialize or check Mystic Shop 3-hour rotation reset
  if (!state.mysticShopLastReset || (now - state.mysticShopLastReset >= THREE_HOURS)) {
    state.mysticShopLastReset = now;
    state.mysticShopInventory = rollMysticStock();
  }

  if (mysticTimerEl) {
    mysticTimerEl.style.display = (currentShopTab === 'mystic') ? 'inline-flex' : 'none';
    if (mysticCountdown) {
      const remainingMs = Math.max(0, THREE_HOURS - (now - state.mysticShopLastReset));
      const hours = Math.floor(remainingMs / (3600 * 1000));
      const mins = Math.floor((remainingMs % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
      mysticCountdown.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  let itemsToDisplay = [];

  const charLvl = state.level || 1;

  if (currentShopTab === 'gear') {
    // Mercador Comum — Apenas Equipamentos Comuns (Cinza)
    itemsToDisplay = Object.values(allItems).filter(def => {
      if (!def || !def.id || !def.slot) return false;
      const isEquip = ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'legs', 'shield', 'ring', 'necklace', 'earring', 'belt', 'cloak'].includes(def.slot);
      return isEquip;
    }).map(def => ({ def, rarity: 'common' }));
  } else if (currentShopTab === 'potions') {
    // Consumíveis & Poções (Cinza)
    itemsToDisplay = Object.values(allItems).filter(def => {
      if (!def || !def.id) return false;
      return def.slot === 'potion' || def.slot === 'consumable' || def.slot === 'powerup' || def.slot === 'scroll';
    }).map(def => ({ def, rarity: 'common' }));
  } else if (currentShopTab === 'class') {
    // Aba Classe — Até Azul (Raro)
    itemsToDisplay = Object.values(allItems).filter(def => {
      if (!def || !def.id) return false;
      return def.classReq || def.slot === 'class' || def.id.includes('scroll_of_') || def.id.includes('class_');
    }).map(def => ({ def, rarity: 'rare' }));
  } else if (currentShopTab === 'mystic') {
    // Mercador Místico Ancestral — Estoque Rotação 3h com RNG Raro / Épico (1/1000) / Lendário (1/10000)
    itemsToDisplay = (state.mysticShopInventory || []).map(item => {
      const def = allItems[item.itemId || item.id] || item;
      return { def, rarity: item.rarity || 'rare' };
    });
  }

  // Deduplicate items by def.id to prevent double entries
  const seenIds = new Set();
  itemsToDisplay = itemsToDisplay.filter(({ def }) => {
    if (!def || !def.id) return false;
    if (seenIds.has(def.id)) return false;
    seenIds.add(def.id);
    return true;
  });

  // Filter by Grade / Level
  if (currentShopGrade !== 'all') {
    itemsToDisplay = itemsToDisplay.filter(({ def }) => {
      const grade = getItemGradeCode(def);
      return grade === currentShopGrade;
    });
  }

  // Filter by Slot / Type
  if (currentShopSlot !== 'all') {
    itemsToDisplay = itemsToDisplay.filter(({ def }) => matchesSlotFilter(def, currentShopSlot));
  }

  if (itemsToDisplay.length === 0) {
    container.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:12px;">Nenhum item encontrado para os filtros selecionados.</div>`;
    return;
  }

  const batchQty = (currentShopTab === 'potions') ? currentShopQty : 1;

  container.innerHTML = itemsToDisplay.map(({ def, rarity }) => {
    if (!def) return '';

    const reqLvl = def.req?.level || def.reqLvl || 1;
    const isLevelOk = charLvl >= reqLvl;

    const basePrice = def.price || 100;
    const totalPrice = basePrice * batchQty;
    const canAfford = (state.gold || 0) >= totalPrice;

    const gradeInfo = getItemGrade(def);
    const statsText = buildShopStatsSummary(def);

    let buyText = `Comprar (${batchQty}x)`;
    if (!isLevelOk) buyText = `🔒 Requer Lv. ${reqLvl}`;
    else if (!canAfford) buyText = `💰 Gold Insuficiente`;

    return `
      <div class="shop-item-card grade-${gradeInfo.code} rarity-${rarity}">
        <div class="shop-item-icon-box">
          ${getItemIcon(def)}
        </div>
        <div class="shop-item-meta">
          <div class="shop-item-title-line">
            <span class="shop-item-name">${def.name}</span>
            <span class="shop-grade-badge" style="background:${gradeInfo.color};">${gradeInfo.label}</span>
            ${rarity !== 'common' ? `<span class="tab-tag-rarity tag-${rarity}">${rarity.toUpperCase()}</span>` : ''}
          </div>
          ${statsText ? `<div class="shop-item-stats">${statsText}</div>` : ''}
          <div class="shop-item-desc">${def.desc || ''}</div>
        </div>
        <div class="shop-item-action">
          <div class="shop-item-price-tag">💰 ${totalPrice.toLocaleString()} Gold</div>
          <button class="buy-item-btn" data-buy="${def.id}" data-qty="${batchQty}" data-rarity="${rarity}" ${(!canAfford || !isLevelOk) ? 'disabled' : ''}>
            ${buyText}
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => {
      const qty = parseInt(btn.dataset.qty, 10) || 1;
      const rarity = btn.dataset.rarity || 'common';
      if (callbacks.buyItem) callbacks.buyItem(btn.dataset.buy, qty, rarity);
      else if (typeof window !== 'undefined' && typeof window.buyItem === 'function') window.buyItem(btn.dataset.buy, qty, rarity);
    };
  });
}

function getItemGradeCode(item) {
  const lvl = item.req?.level || item.reqLvl || 1;
  if (lvl >= 76) return 's';
  if (lvl >= 61) return 'a';
  if (lvl >= 52) return 'b';
  if (lvl >= 40) return 'c';
  if (lvl >= 20) return 'd';
  return 'ng';
}

function getItemGrade(item) {
  const lvl = item.req?.level || item.reqLvl || 1;
  if (lvl >= 76) return { code: 's', label: 'S-Grade', color: '#ef4444', minLvl: 76 };
  if (lvl >= 61) return { code: 'a', label: 'A-Grade', color: '#f59e0b', minLvl: 61 };
  if (lvl >= 52) return { code: 'b', label: 'B-Grade', color: '#a855f7', minLvl: 52 };
  if (lvl >= 40) return { code: 'c', label: 'C-Grade', color: '#3b82f6', minLvl: 40 };
  if (lvl >= 20) return { code: 'd', label: 'D-Grade', color: '#22c55e', minLvl: 20 };
  return { code: 'ng', label: 'No-Grade', color: '#9ca3af', minLvl: 1 };
}

function buildShopStatsSummary(def) {
  const parts = [];
  if (def.atk) parts.push(`<span style="color:#f59e0b;">⚔️ +${def.atk} P.Atk</span>`);
  if (def.matk) parts.push(`<span style="color:#a78bfa;">🔮 +${def.matk} M.Atk</span>`);
  if (def.def) parts.push(`<span style="color:#60a5fa;">🛡️ +${def.def} P.Def</span>`);
  if (def.mdef) parts.push(`<span style="color:#f472b6;">✨ +${def.mdef} M.Def</span>`);
  if (def.eva) parts.push(`<span style="color:#34d399;">👟 +${def.eva} Esquiva</span>`);
  if (def.crit) parts.push(`<span style="color:#fbbf24;">⚡ +${def.crit}% Crítico</span>`);
  return parts.join(' · ');
}

function rollMysticStock() {
  const gData = typeof window !== 'undefined' ? (window.EchoData || window.GameData) : null;
  const allItems = gData?.ALL_ITEMS || {};
  const equipIds = Object.keys(allItems).filter(id => {
    const def = allItems[id];
    return def && def.slot && def.slot !== 'potion' && def.slot !== 'material';
  });

  if (equipIds.length === 0) return [];

  const stock = [];
  const count = 6;

  for (let i = 0; i < count; i++) {
    const randomId = equipIds[Math.floor(Math.random() * equipIds.length)];
    const rand = Math.random();
    let rarity = 'rare';

    if (rand <= 0.0001) {
      rarity = 'legendary'; // 1 in 10,000 (0.01%)
    } else if (rand <= 0.001) {
      rarity = 'epic'; // 1 in 1,000 (0.1%)
    } else {
      rarity = 'rare'; // Blue default
    }

    stock.push({ itemId: randomId, rarity });
  }

  return stock;
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

function getMaxAllowedReqLevel(pLvl) {
  const lvl = Number(pLvl) || 1;
  if (lvl < 20) return 19;  // Lv 1-19: Apenas No-Grade (1 a 19)
  if (lvl < 40) return 39;  // Lv 20-39: No-Grade e D-Grade (1 a 39)
  if (lvl < 52) return 51;  // Lv 40-51: Até C-Grade (1 a 51)
  if (lvl < 61) return 60;  // Lv 52-60: Até B-Grade (1 a 60)
  if (lvl < 76) return 75;  // Lv 61-75: Até A-Grade (1 a 75)
  if (lvl < 80) return 79;  // Lv 76-79: Até S-Grade (1 a 79)
  return 999;                // Lv 80+: Frost Lord e todos os itens
}

export function updateCraftUI(state, callbacks = {}) {
  const craftLvlEl = findElement('craft-level-num') || findElement('craft-level');
  if (craftLvlEl) craftLvlEl.textContent = `${state.craftLevel || 1}`;

  const subTab = window._forgeSubTab || 'craft';
  const root = getRoot();

  root.querySelectorAll('#forge-subtab-buttons [data-forge-tab], .forge-subtab-btn').forEach(btn => {
    const isActive = (btn.dataset.forgeTab === subTab);
    btn.classList.toggle('active', isActive);
    btn.style.background = isActive ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(252,211,77,0.1)';
    btn.style.color = isActive ? '#000' : '#ffd877';
    btn.style.borderColor = isActive ? '#ffe699' : 'rgba(212,167,68,0.3)';
    btn.onclick = (e) => {
      e.preventDefault();
      const targetTab = btn.dataset.forgeTab;
      if (typeof window !== 'undefined' && typeof window.setForgeSubTab === 'function') {
        window.setForgeSubTab(targetTab);
      } else {
        window._forgeSubTab = targetTab;
        updateCraftUI(state, callbacks);
      }
    };
  });

  const filtersBar = findElement('craft-filters-bar');
  if (filtersBar) {
    filtersBar.style.display = (subTab === 'craft') ? 'flex' : 'none';
  }

  const container = findElement('craft-recipes-container') || findElement('craft-list');
  if (!container) return;

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
  if (subTab === 'belts') {
    renderForgeBelts(container, state);
    return;
  }
  if (subTab === 'lifestones') {
    renderForgeLifestones(container, state);
    return;
  }

  const gData = D();
  const allItems = gData?.ALL_ITEMS || {};
  let recipes = gData?.CRAFTING_RECIPES;

  if (gData?.generateAllCraftingRecipes) {
    recipes = gData.generateAllCraftingRecipes(allItems);
  } else if (!recipes || Object.keys(recipes).length <= 3) {
    recipes = generateAllCraftingRecipes(allItems);
  }

  const seenNames = new Set();
  const rawList = Object.values(recipes).filter(Boolean);
  const recipeList = [];

  for (const r of rawList) {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    if (!def || !def.name) continue;
    const normName = def.name.toLowerCase().trim();
    if (seenNames.has(normName)) continue;
    seenNames.add(normName);
    recipeList.push(r);
  }

  const activeCat = window._craftSelectedCategory || 'all';

  // Conecta leitores para barra de busca e categorias (garante ligação contínua e destaque ativo)
  const searchInput = findElement('craft-search-input');
  if (searchInput) {
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
      catButtons.forEach(b => b.classList.toggle('active', b.dataset.craftCat === selected));
      updateCraftUI(state, callbacks);
    };
  });

  const searchTerm = (window._craftSearchTerm || '').toLowerCase().trim();
  const playerLevel = state.level || state.player?.level || state.hero?.level || 1;
  const maxReqLvl = getMaxAllowedReqLevel(playerLevel);

  const filtered = recipeList.filter(r => {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    if (!def) return false;

    // Restrição por Nível do Jogador (Nível 1 a 19 só enxerga No-Grade, Nível 20 a 39 enxerga No-Grade e D-Grade, etc.)
    const itemReqLevel = def.req?.level || def.level || r.level || 1;
    if (itemReqLevel > maxReqLvl) {
      return false;
    }

    // Filtro por Categoria
    if (!isItemInCraftCategory(itemId, def, activeCat)) {
      return false;
    }

    // Filtro por Busca de Nome
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) {
      return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
        <p style="font-size: 16px; margin-bottom: 8px;">🔍 Nenhum item encontrado para a busca atual.</p>
        <p style="font-size: 13px;">Tente alterar a categoria ou o termo digitado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(r => {
    const itemId = r.itemId || r.id;
    const def = allItems[itemId];
    const reqLvl = r.craftLevel || (r.level ? getCraftLevelReq(r.level) : 1);
    const gradeInfo = getItemGrade(def);
    const statsSummary = buildShopStatsSummary(def);
    const baseAdena = r.gold || 250;

    const mats = getRecipeMaterials(r);
    const matsHtml = mats.map(m => {
      const matDef = allItems[m.matId];
      const count = getInventoryCount(state, m.matId);
      const isOk = count >= m.qty;
      return `<span style="color:${isOk ? '#4ade80' : '#ef4444'}; font-weight: 500;">${matDef ? matDef.name : m.matId}: ${count}/${m.qty}</span>`;
    }).join(' · ');

    const craftable = canCraft(state, itemId, 1);

    return `
      <div class="craft-recipe-card ${craftable ? 'craftable' : ''}" data-open-craft="${itemId}">
        <div class="craft-recipe-header">
          <div class="craft-recipe-icon-box">
            ${getItemIcon(def)}
          </div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="craft-recipe-title">${def.name}</div>
              <span class="shop-grade-badge" style="background:${gradeInfo.color}; padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold; color:#fff;">${gradeInfo.label}</span>
            </div>
            <div class="craft-recipe-sub">Requer Forja Lv.${reqLvl} · 🪙 ${baseAdena.toLocaleString()} Adena</div>
          </div>
        </div>
        ${statsSummary ? `<div class="craft-recipe-stats">📊 ${statsSummary}</div>` : ''}
        <div class="craft-mats-line">${matsHtml}</div>
        <button class="craft-item-btn" data-open-craft="${itemId}" style="width:100%; padding:10px 14px; font-family:'Cinzel',serif; font-weight:700; font-size:13px; background:linear-gradient(180deg,#d4a744,#8a641c); border:1px solid #ffe699; color:#000; border-radius:6px; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,0.4); margin-top:8px;">
          🔨 Ver &amp; Forjar Item
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-open-craft]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openCraftModal(btn.dataset.openCraft, state, callbacks);
    };
  });

  // Eventos de Tooltip ao passar o mouse sobre a receita na Forja (sem botões de ação de inventário)
  container.querySelectorAll('.craft-recipe-card').forEach(card => {
    const itemId = card.dataset.openCraft;
    card.onmouseenter = (e) => showItemTooltip(e, { itemId, rarity: 'common', isForgePreview: true });
    card.onmousemove = (e) => showItemTooltip(e, { itemId, rarity: 'common', isForgePreview: true });
    card.onmouseleave = () => hideItemTooltip();
  });
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

  let recipes = gData?.CRAFTING_RECIPES;
  if (gData?.generateAllCraftingRecipes) {
    recipes = gData.generateAllCraftingRecipes(allItems);
  }
  const r = getRecipeDef(itemId) || recipes?.[itemId] || { id: itemId, gold: 250, reqs: [{ id: 'iron_ore', count: 10 }] };

  let currentQty = 1;
  const gradeInfo = getItemGrade(def);
  const reqLvl = r.craftLevel || (r.level ? getCraftLevelReq(r.level) : 1);
  const statsSummary = buildShopStatsSummary(def);

  function renderModalContent() {
    const totalAdena = (r.gold || 250) * currentQty;
    const mats = getRecipeMaterials(r);

    let maxCraftable = 9999;
    const matsHtml = mats.map(m => {
      const matDef = allItems[m.matId];
      const count = getInventoryCount(state, m.matId);
      const needed = m.qty * currentQty;
      const isOk = count >= needed;
      const possible = Math.floor(count / m.qty);
      if (possible < maxCraftable) maxCraftable = possible;

      return `
        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:8px 12px; border-radius:6px; margin-bottom:6px; font-size:13px; border:1px solid ${isOk ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'};">
          <span style="color:#ddd; display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">${getItemIcon(matDef)}</span> <strong>${matDef ? matDef.name : m.matId}</strong>
          </span>
          <span style="color:${isOk ? '#4ade80' : '#ef4444'}; font-weight:bold;">
            ${isOk ? '✓' : '✗'} ${count} / ${needed}
          </span>
        </div>
      `;
    }).join('');

    const maxAdenaCraftable = Math.floor((state.gold || 0) / (r.gold || 250));
    if (maxAdenaCraftable < maxCraftable) maxCraftable = maxAdenaCraftable;
    if (maxCraftable < 1) maxCraftable = 1;

    const craftable = canCraft(state, itemId, currentQty);

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
          <div style="font-size:12px; color:#aaa; margin-top:2px;">Requer Forja Lv.${reqLvl} · Slot: ${def.slot || 'Geral'}</div>
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

    body.querySelectorAll('[data-modal-qty]').forEach(btn => {
      btn.onclick = () => {
        currentQty = parseInt(btn.dataset.modalQty, 10) || 1;
        renderModalContent();
      };
    });

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
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(212,167,68,0.15); border:1px solid rgba(212,167,68,0.4); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px;">${recipe?.icon || '🧪'}</span>
            <div>
              <div style="font-weight:bold; color:#ffd877; font-size:13px;">${recipe?.name || rId}</div>
              <div style="font-size:11px; color:#aaa;">${recipe?.desc || ''}</div>
            </div>
          </div>
          <span style="font-family:monospace; font-weight:bold; color:#34d399; font-size:13px; background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:4px;">⏱️ ${timeStr}</span>
        </div>
      `;
    }
  }

  let recipesHtml = '';
  for (const [rId, rec] of Object.entries(recipes)) {
    let canAfford = (state.gold || 0) >= rec.gold;
    let costHtml = '';
    for (const [type, amt] of Object.entries(rec.cost)) {
      const owned = essences[type] || 0;
      const hasEnough = owned >= amt;
      if (!hasEnough) canAfford = false;
      const typeIcons = { fire: '🔥', earth: '🛡️', wind: '🍃', astral: '✨' };
      costHtml += `<span style="color:${hasEnough ? '#4ade80' : '#ef4444'}; font-weight:bold; margin-right:8px;">${typeIcons[type] || ''} ${owned}/${amt}</span>`;
    }

    recipesHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid ${canAfford ? 'rgba(212,167,68,0.4)' : 'rgba(255,255,255,0.08)'}; border-radius:10px; padding:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:46px; height:46px; background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:24px;">
            ${rec.icon}
          </div>
          <div>
            <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">${rec.name}</h4>
            <p style="margin:2px 0 6px 0; font-size:11px; color:#aaa;">${rec.desc}</p>
            <div style="font-size:11px;">${costHtml} <span style="color:${(state.gold || 0) >= rec.gold ? '#ffd877' : '#ef4444'};">🪙 ${rec.gold.toLocaleString()}g</span></div>
          </div>
        </div>
        <button
          onclick="window.craftElixir('${rId}', 1)"
          ${!canAfford ? 'disabled' : ''}
          style="padding:8px 16px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:${canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#ffe699' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#000' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'}; min-width:90px;"
        >
          🧪 CRIAR
        </button>
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
    return ['weapon', 'armor', 'shield', 'helmet', 'gloves', 'boots', 'legs', 'ring', 'necklace', 'earring', 'belt', 'cloak'].includes(slot);
  });

  let crucibleSelectHtml = '';
  if (inventoryItems.length === 0) {
    crucibleSelectHtml = `
      <div style="background:rgba(15,20,32,0.8); border:1px dashed rgba(255,255,255,0.15); border-radius:10px; padding:14px; margin-bottom:16px; text-align:center; color:#aaa; font-size:12px;">
        📦 Nenhum equipamento desequipado na mochila para desintegrar no Cadinho.
      </div>
    `;
  } else {
    const selectedUid = window._selectedCrucibleUid || inventoryItems[0].uid;
    const selectedItem = inventoryItems.find(i => i.uid === selectedUid) || inventoryItems[0];
    const selectedDef = getItemDef(selectedItem.itemId);

    const grade = getItemGradeCode(selectedDef);
    const yields = {
      ng: { fire: 5, earth: 5, wind: 5, astral: 1 },
      d:  { fire: 15, earth: 15, wind: 15, astral: 3 },
      c:  { fire: 35, earth: 35, wind: 35, astral: 8 },
      b:  { fire: 75, earth: 75, wind: 75, astral: 20 },
      a:  { fire: 150, earth: 150, wind: 150, astral: 50 },
      s:  { fire: 350, earth: 350, wind: 350, astral: 120 }
    }[grade] || { fire: 5, earth: 5, wind: 5, astral: 1 };

    const optionsHtml = inventoryItems.map(item => {
      const def = getItemDef(item.itemId);
      const rName = def?.name || item.itemId;
      const gCode = getItemGradeCode(def).toUpperCase();
      return `<option value="${item.uid}" ${item.uid === selectedItem.uid ? 'selected' : ''}>[${gCode}] ${rName} (x${item.count || 1})</option>`;
    }).join('');

    crucibleSelectHtml = `
      <div style="background:linear-gradient(135deg, rgba(30,20,40,0.9), rgba(15,10,24,0.9)); border:1px solid rgba(168,85,247,0.4); border-radius:10px; padding:14px; margin-bottom:16px; box-shadow:0 4px 16px rgba(168,85,247,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#c084fc; font-size:14px; display:flex; align-items:center; gap:6px;">
            🔮 Cadinho de Almas — Inspeção &amp; Preview
          </h4>
          <span style="font-size:10px; background:rgba(168,85,247,0.2); border:1px solid rgba(168,85,247,0.4); padding:2px 8px; border-radius:10px; color:#e9d5ff; font-weight:bold;">${inventoryItems.length} Equipamento(s) Disponível(is)</span>
        </div>

        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
          <select id="crucible-item-select" style="flex:1; min-width:220px; padding:8px 12px; background:rgba(0,0,0,0.6); border:1px solid rgba(168,85,247,0.5); color:#fff; border-radius:6px; font-size:12px;" onchange="window._selectedCrucibleUid = this.value; if (window.renderAlchemyUI) window.renderAlchemyUI(window._lastState);">
            ${optionsHtml}
          </select>
          <button
            onclick="if (window.dissolveItem) window.dissolveItem('${selectedItem.uid}');"
            style="padding:8px 18px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:linear-gradient(180deg, #a855f7, #6b21a8); border:1px solid #c084fc; color:#fff; border-radius:6px; cursor:pointer;"
          >
            🔥 Dissolver Item
          </button>
        </div>

        <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:24px; width:36px; height:36px; background:rgba(0,0,0,0.6); border:1px solid rgba(168,85,247,0.4); border-radius:6px; display:flex; align-items:center; justify-content:center;">
              ${getItemIcon(selectedDef)}
            </div>
            <div>
              <div style="font-weight:bold; color:#f4d58a; font-size:13px;">${selectedDef?.name || 'Item'}</div>
              <div style="font-size:11px; color:#aaa;">Rendimento estimado ao dissolver no Cadinho:</div>
            </div>
          </div>
          <div style="display:flex; gap:10px; font-size:12px; font-weight:bold;">
            <span style="color:#fca5a5;">🔥 +${yields.fire}</span>
            <span style="color:#86efac;">🛡️ +${yields.earth}</span>
            <span style="color:#7dd3fc;">🍃 +${yields.wind}</span>
            <span style="color:#d8b4fe;">✨ +${yields.astral}</span>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Essence Header -->
      <div style="background:linear-gradient(180deg, rgba(20,26,42,0.9), rgba(10,14,24,0.9)); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:14px; margin-bottom:16px; box-shadow:0 4px 20px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px; display:flex; align-items:center; gap:8px;">
            🧪 Cadinho de Almas & Alquimia
          </h3>
          <span style="font-size:12px; color:#aaa;">Extraia essências de itens e fabrique elixires</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; text-align:center;">
          <div style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); border-radius:8px; padding:8px;">
            <div style="font-size:18px;">🔥</div>
            <div style="font-size:10px; text-transform:uppercase; color:#fca5a5; font-weight:bold;">Fogo</div>
            <div style="font-size:16px; font-weight:bold; color:#fff;">${(essences.fire || 0).toLocaleString()}</div>
          </div>
          <div style="background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.3); border-radius:8px; padding:8px;">
            <div style="font-size:18px;">🛡️</div>
            <div style="font-size:10px; text-transform:uppercase; color:#86efac; font-weight:bold;">Terra</div>
            <div style="font-size:16px; font-weight:bold; color:#fff;">${(essences.earth || 0).toLocaleString()}</div>
          </div>
          <div style="background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); border-radius:8px; padding:8px;">
            <div style="font-size:18px;">🍃</div>
            <div style="font-size:10px; text-transform:uppercase; color:#7dd3fc; font-weight:bold;">Vento</div>
            <div style="font-size:16px; font-weight:bold; color:#fff;">${(essences.wind || 0).toLocaleString()}</div>
          </div>
          <div style="background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.3); border-radius:8px; padding:8px;">
            <div style="font-size:18px;">✨</div>
            <div style="font-size:10px; text-transform:uppercase; color:#d8b4fe; font-weight:bold;">Astral</div>
            <div style="font-size:16px; font-weight:bold; color:#fff;">${(essences.astral || 0).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Active Elixirs Banner -->
      ${activeBuffsHtml ? `
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">✨ Elixires Ativos</h4>
          ${activeBuffsHtml}
        </div>
      ` : ''}

      <!-- Single Item Crucible Inspection & Yield Preview -->
      ${crucibleSelectHtml}

      <!-- Fast Dissolve Controls -->
      <div style="background:rgba(15,20,32,0.8); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:12px; margin-bottom:16px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px; display:flex; align-items:center; gap:6px;">
          🔥 Dissolução em Lote no Cadinho
        </h4>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button
            onclick="window.dissolveItemsByFilter('nograde')"
            style="flex:1; padding:10px; font-weight:bold; font-size:12px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.5); color:#fca5a5; border-radius:6px; cursor:pointer;"
          >
            🔥 Dissolver No-Grade
          </button>
          <button
            onclick="window.dissolveItemsByFilter('d')"
            style="flex:1; padding:10px; font-weight:bold; font-size:12px; background:rgba(59,130,246,0.2); border:1px solid rgba(59,130,246,0.5); color:#93c5fd; border-radius:6px; cursor:pointer;"
          >
            🔥 Dissolver D-Grade
          </button>
          <button
            onclick="window.dissolveItemsByFilter('all')"
            style="flex:1; padding:10px; font-weight:bold; font-size:12px; background:rgba(212,167,68,0.2); border:1px solid rgba(212,167,68,0.5); color:#fde047; border-radius:6px; cursor:pointer;"
          >
            🔥 Dissolver Todos Elegíveis
          </button>
        </div>
      </div>

      <!-- Recipes List -->
      <div>
        <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">
          ⚗️ Receitas de Alquimia
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
  const dests = (typeof window !== 'undefined' && window.EXPEDITION_DESTINATIONS) ? window.EXPEDITION_DESTINATIONS : {};
  const castles = (typeof window !== 'undefined' && window.CASTLES_DEFS) ? window.CASTLES_DEFS : {};
  const seeds = (typeof window !== 'undefined' && window.MANOR_SEEDS) ? window.MANOR_SEEDS : {};

  const activeExpeditions = state.expeditions || [];
  const playerCastles = state.castles || {};
  const ownedCrops = state.manorCrops || {};
  const currentLvl = state.level || 1;

  let expHtml = '';
  for (const [dId, dDef] of Object.entries(dests)) {
    const active = activeExpeditions.find(e => e.destId === dId);
    let statusBtn = '';

    if (active) {
      const finishTime = active.startTime + active.duration;
      if (now >= finishTime) {
        statusBtn = `
          <button
            onclick="window.claimExpeditionReward('${active.id}')"
            style="padding:8px 14px; font-weight:bold; font-size:12px; background:linear-gradient(180deg,#34d399,#059669); border:1px solid #6ee7b7; color:#000; border-radius:6px; cursor:pointer; box-shadow:0 0 10px rgba(52,211,153,0.4);"
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
          <span style="font-family:monospace; font-weight:bold; color:#fbbf24; background:rgba(0,0,0,0.5); padding:6px 12px; border-radius:6px; border:1px solid rgba(251,191,36,0.3);">
            ⏱️ ${timeStr}
          </span>
        `;
      }
    } else {
      const canAfford = (state.gold || 0) >= dDef.cost;
      statusBtn = `
        <button
          onclick="window.startExpedition('${dId}')"
          ${!canAfford ? 'disabled' : ''}
          style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:${canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#ffe699' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#000' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
        >
          🧭 ENVIAR (${(dDef.cost / 1000).toFixed(0)}k gold)
        </button>
      `;
    }

    const minG = dDef.minGold ? (dDef.minGold / 1000).toFixed(0) + 'k' : '20k';
    const maxG = dDef.maxGold ? (dDef.maxGold / 1000).toFixed(0) + 'k' : '30k';
    const shards = dDef.shards || (dId === 'branded' ? 2 : dId === 'martyrs' ? 5 : dId === 'dragon_valley' ? 12 : 25);
    const chestName = dId === 'branded' ? 'Scroll de Encantamento D/C' : dId === 'martyrs' ? 'Baú de Equipamento C/B' : dId === 'dragon_valley' ? 'Baú Relíquia A/S' : '👑 Baú Supremo Frost Lord';

    expHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        <div style="flex:1; min-width:220px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${dDef.name}</h4>
          <p style="margin:2px 0 6px 0; font-size:11px; color:#aaa;">${dDef.desc}</p>
          <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
            <span style="font-size:10px; background:rgba(212,167,68,0.15); border:1px solid rgba(212,167,68,0.3); padding:2px 8px; border-radius:6px; color:#ffd877; font-weight:bold;">🪙 ${minG}-${maxG} Gold</span>
            <span style="font-size:10px; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.3); padding:2px 8px; border-radius:6px; color:#d8b4fe; font-weight:bold;">✨ +${shards} Cacos Astrais</span>
            <span style="font-size:10px; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.3); padding:2px 8px; border-radius:6px; color:#93c5fd; font-weight:bold;">📦 ${chestName}</span>
          </div>
        </div>
        <div>
          ${statusBtn}
        </div>
      </div>
    `;
  }

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
          🏰 Expedições de Mercenários, Castelos & Manor
        </h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Envie expedições passivas, conquiste castelos para impostos e negocie colheitas do Manor por materiais nobres de craft!
        </p>
      </div>

      <!-- Expeditions Section -->
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🧭 Expedições Passivas de Mercenários
        </h4>
        ${expHtml}
      </div>

      <!-- Castles Section -->
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🏰 Domínio dos Castelos de Aden (Impostos Passivos)
        </h4>
        ${castlesHtml}
      </div>

      <!-- Manor Farming Section -->
      <div>
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🌾 Manor Manager & Mercado de Colheita
        </h4>
        ${manorHtml}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════════════════════
   21. FORGE HUB SUB-PANELS: SOUL CRYSTALS, MASTERWORK & TATTOOS
═══════════════════════════════════════════════════════════════════════════ */
export function renderForgeSoulCrystals(container, state) {
  const wpnUid = state.equipment?.weapon;
  const wpnItem = wpnUid ? state.inventory?.find(i => i.uid === wpnUid) : null;
  const wpnDef = wpnItem ? getItemDef(wpnItem.itemId) : null;
  const socket = (wpnUid && state.weaponSockets) ? state.weaponSockets[wpnUid] : null;

  const soulCrystals = state.soulCrystals || {};
  let crystalsListHtml = '';
  const colors = ['red', 'green', 'blue'];
  for (const color of colors) {
    for (let st = 1; st <= 13; st++) {
      const key = `${color}_stage${st}`;
      const count = soulCrystals[key] || 0;
      if (count > 0 || st === 1) {
        const canFuse = count >= 2 && st < 13;
        crystalsListHtml += `
          <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
              <strong style="color:${color === 'red' ? '#fca5a5' : (color === 'green' ? '#86efac' : '#7dd3fc')}; font-size:13px;">
                🔮 Soul Crystal ${color.toUpperCase()} (Stage ${st})
              </strong>
              <div style="font-size:11px; color:#aaa;">Possuídos: <strong>${count}x</strong></div>
            </div>
            <div style="display:flex; gap:6px;">
              ${st === 1 ? `<button onclick="window.buySoulCrystal('${color}', 1)" style="padding:4px 10px; font-size:11px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid rgba(212,167,68,0.4); color:#ffd877; border-radius:4px; cursor:pointer;">🛒 Comprar (15k g)</button>` : ''}
              ${canFuse ? `<button onclick="window.fuseSoulCrystals('${color}', ${st})" style="padding:4px 10px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#34d399,#059669); border:1px solid #6ee7b7; color:#000; border-radius:4px; cursor:pointer;">✨ Fundir (2x ➔ St.${st+1})</button>` : ''}
            </div>
          </div>
        `;
      }
    }
  }

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <!-- Socket Header -->
      <div style="background:rgba(26,18,48,0.85); border:1px solid rgba(168,85,247,0.4); border-radius:10px; padding:14px; margin-bottom:16px;">
        <h4 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:16px;">🔮 Soquete SA na Arma Equipada</h4>
        <div style="font-size:12px; color:#aaa; margin-bottom:10px;">
          Arma Equipada: <strong style="color:#ffd877;">${wpnDef ? wpnDef.name : 'Nenhuma Arma Equipada'}</strong>
        </div>
        ${socket ? `
          <div style="background:rgba(52,211,153,0.15); border:1px solid #34d399; padding:8px 12px; border-radius:6px; font-size:12px; color:#34d399; font-weight:bold;">
            ✓ SA Ativo: ${socket.effect.toUpperCase()} (Stage ${socket.stage})
          </div>
        ` : `
          <div style="font-size:12px; color:#fca5a5;">Nenhum Soul Crystal SA engastado. Escolha um efeito abaixo:</div>
        `}

        <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
          <button onclick="window.socketSoulCrystalToWeapon('focus', 1)" style="flex:1; padding:8px; font-weight:bold; font-size:11px; background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5; border-radius:6px; cursor:pointer;">🔴 Engastar SA FOCUS (+Crit)</button>
          <button onclick="window.socketSoulCrystalToWeapon('haste', 1)" style="flex:1; padding:8px; font-weight:bold; font-size:11px; background:rgba(34,197,94,0.2); border:1px solid #22c55e; color:#86efac; border-radius:6px; cursor:pointer;">🟢 Engastar SA HASTE (+AtkSpd)</button>
          <button onclick="window.socketSoulCrystalToWeapon('acumen', 1)" style="flex:1; padding:8px; font-weight:bold; font-size:11px; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#7dd3fc; border-radius:6px; cursor:pointer;">🔵 Engastar SA ACUMEN (+CastSpd)</button>
        </div>
      </div>

      <!-- Crystals Collection & Synthesis -->
      <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">💎 Coleção &amp; Síntese de Soul Crystals (Stage 1 ➔ 13)</h4>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${crystalsListHtml}
      </div>
    </div>
  `;
}

export function renderForgeMasterwork(container, state) {
  const eligibleItems = (state.inventory || []).filter(i => {
    const def = getItemDef(i.itemId);
    return def && (def.tier >= 3) && !i.isMasterwork;
  });

  let itemsHtml = '';
  for (const item of eligibleItems) {
    const def = getItemDef(item.itemId);
    const tier = def.tier || 3;
    const costs = {
      3: { adena: 500000 },
      4: { adena: 1000000 },
      5: { adena: 1500000 },
      6: { adena: 2500000 }
    };
    const req = costs[tier] || costs[3];
    const canAfford = (state.gold || 0) >= req.adena;

    itemsHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${item.name || def.name}</h4>
          <div style="font-size:11px; color:#aaa;">Custo do Mestre Pushkin: <strong style="color:#ffd877;">${req.adena.toLocaleString()} Adena</strong></div>
        </div>
        <button
          onclick="window.upgradeItemToMasterwork('${item.uid}')"
          ${!canAfford ? 'disabled' : ''}
          style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:12px; background:${canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#ffe699' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#000' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
        >
          ✨ FORJAR MASTERWORK RARE
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <!-- Pushkin Header -->
      <div style="background:linear-gradient(180deg, rgba(20,26,42,0.95), rgba(10,14,24,0.95)); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">✨ Mestre Ferreiro Pushkin (Giran Square)</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Transforme seus equipamentos de Grade B, A, S e Dynasty em **MasterWork Foundation (Versões Raras)** com bônus de atributos elevados!
        </p>
      </div>

      <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">🛡️ Equipamentos Elegíveis no Inventário</h4>
      ${itemsHtml || '<div style="font-size:12px; color:#aaa;">Nenhum equipamento elegível de Grade B+ encontrado para upgrade no momento.</div>'}
    </div>
  `;
}

export function renderForgeTattoos(container, state) {
  const tattoos = state.tattoos || [];
  let currentTattoosHtml = '';

  for (let idx = 0; idx < tattoos.length; idx++) {
    const t = tattoos[idx];
    currentTattoosHtml += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(168,85,247,0.15); border:1px solid #a855f7; padding:8px 12px; border-radius:8px; margin-bottom:8px;">
        <div>
          <strong style="color:#d8b4fe; font-size:13px;">🖊️ Tatuagem #${idx + 1}: +${t.plusVal} ${t.plusStat.toUpperCase()} / -${t.minusVal} ${t.minusStat.toUpperCase()}</strong>
        </div>
        <button
          onclick="window.removeTattoo(${idx})"
          style="padding:4px 10px; font-weight:bold; font-size:11px; background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5; border-radius:4px; cursor:pointer;"
        >
          🗑️ Remover
        </button>
      </div>
    `;
  }

  const presets = [
    { plus: 'str', minus: 'con', val: 4, name: '⚔️ Tatuagem do Guerreiro (+4 STR / -4 CON)' },
    { plus: 'wit', minus: 'men', val: 4, name: '✨ Tatuagem do Arquimago (+4 WIT / -4 MEN)' },
    { plus: 'dex', minus: 'str', val: 4, name: '🗡️ Tatuagem do Assassino (+4 DEX / -4 STR)' },
    { plus: 'int', minus: 'men', val: 4, name: '🔥 Tatuagem de Poder Mágico (+4 INT / -4 MEN)' },
    { plus: 'con', minus: 'str', val: 4, name: '🛡️ Tatuagem do Guardião (+4 CON / -4 STR)' },
  ];

  let presetsHtml = '';
  for (const p of presets) {
    const cost = p.val * 50000;
    const canAfford = (state.gold || 0) >= cost;
    const canApply = tattoos.length < 3 && canAfford;

    presetsHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${p.name}</h4>
          <div style="font-size:11px; color:#aaa;">Custo de Instalação: <strong style="color:#ffd877;">${cost.toLocaleString()} Adena</strong></div>
        </div>
        <button
          onclick="window.applyTattoo('${p.plus}', '${p.minus}', ${p.val})"
          ${!canApply ? 'disabled' : ''}
          style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:${canApply ? 'linear-gradient(180deg,#a855f7,#6b21a8)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canApply ? '#c084fc' : 'rgba(100,80,60,0.3)'}; color:${canApply ? '#fff' : '#777'}; border-radius:6px; cursor:${canApply ? 'pointer' : 'not-allowed'};"
        >
          🖊️ APLICAR TATUAGEM
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <!-- Tattoos Banner -->
      <div style="background:linear-gradient(180deg, rgba(30,16,48,0.95), rgba(14,8,26,0.95)); border:1px solid rgba(168,85,247,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">🖊️ Tatuagens &amp; Dyes do Herói (${tattoos.length}/3 Slots)</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Aplique tintas de atributos no Mestre de Tatuagem para otimizar STR, DEX, CON, INT, WIT ou MEN (Cap de +5 por atributo).
        </p>
      </div>

      <!-- Current Tattoos -->
      <div style="margin-bottom:16px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">✨ Tatuagens Ativas no Herói</h4>
        ${currentTattoosHtml || '<div style="font-size:12px; color:#aaa;">Nenhuma tatuagem instalada no momento.</div>'}
      </div>

      <!-- Presets -->
      <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">🛍️ Tintas &amp; Dyes Disponíveis no Mercado</h4>
      ${presetsHtml}
    </div>
  `;
}

export function renderForgeElemental(container, state) {
  const inv = state.inventory || [];
  const itemsWithElem = inv.filter(i => (i.slot === 'weapon' || i.slot === 'chest' || i.slot === 'legs'));

  let itemsHtml = '';
  for (const item of itemsWithElem) {
    const elem = item.elemental || { type: 'fire', val: 0 };
    const cost = 250000;
    const canAfford = (state.gold || 0) >= cost;

    itemsHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(239,68,68,0.3); border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${item.name || 'Equipamento'}</h4>
          <div style="font-size:11px; color:#aaa; margin-top:2px;">
            Atributo Atual: <strong style="color:#ef4444;">${elem.type.toUpperCase()} +${elem.val}</strong> (Cap: +300)
          </div>
          <div style="font-size:11px; color:#777;">Custo de Engaste: 250.000 Adena</div>
        </div>

        <div style="display:flex; gap:6px;">
          <button
            onclick="window.insertAttributeStone('${item.uid}', 'fire')"
            ${!canAfford ? 'disabled' : ''}
            style="padding:6px 10px; font-family:'Cinzel',serif; font-weight:bold; font-size:10px; background:${canAfford ? 'linear-gradient(180deg,#ef4444,#991b1b)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#fca5a5' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#fff' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
          >
            🔥 FOGO (+${elem.val === 0 ? 20 : 5})
          </button>
          <button
            onclick="window.insertAttributeStone('${item.uid}', 'water')"
            ${!canAfford ? 'disabled' : ''}
            style="padding:6px 10px; font-family:'Cinzel',serif; font-weight:bold; font-size:10px; background:${canAfford ? 'linear-gradient(180deg,#3b82f6,#1d4ed8)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#93c5fd' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#fff' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
          >
            💧 ÁGUA (+${elem.val === 0 ? 20 : 5})
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <div style="background:linear-gradient(180deg, rgba(40,16,16,0.95), rgba(20,8,8,0.95)); border:1px solid rgba(239,68,68,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">🔥 Atributos Elementais (PvE Bonus)</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Incuta Pedras Elementais (Fogo, Água, Terra, Vento, Escuridão, Sagrado) em Armas e Armaduras. Concede até +70% de Dano PvE extra contra alvos vulneráveis.
        </p>
      </div>

      <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">🗡️ Equipamentos Elegíveis para Engaste</h4>
      ${itemsHtml || '<div style="font-size:12px; color:#aaa;">Nenhuma arma ou armadura elegível no inventário.</div>'}
    </div>
  `;
}

export function renderForgeLifestones(container, state) {
  const inv = state.inventory || [];
  const epics = inv.filter(i => (i.slot === 'weapon' || i.slot === 'ring' || i.slot === 'earring' || i.slot === 'necklace'));

  let epicsHtml = '';
  for (const item of epics) {
    const aug = item.augmentation;
    const cost = 750000;
    const canAfford = (state.gold || 0) >= cost;

    epicsHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(168,85,247,0.3); border-radius:10px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
        <div>
          <h4 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">${item.name || 'Item Épico'}</h4>
          <div style="font-size:11px; color:#aaa; margin-top:2px;">
            Augmentation Atual: <strong style="color:${aug ? '#c084fc' : '#777'};">${aug ? aug.name : 'Nenhum'}</strong>
          </div>
          <div style="font-size:11px; color:#777;">Custo de Augmentation: 750.000 Adena</div>
        </div>

        <button
          onclick="window.augmentWithLifeStone('${item.uid}')"
          ${!canAfford ? 'disabled' : ''}
          style="padding:8px 14px; font-family:'Cinzel',serif; font-weight:bold; font-size:11px; background:${canAfford ? 'linear-gradient(180deg,#a855f7,#6b21a8)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAfford ? '#c084fc' : 'rgba(100,80,60,0.3)'}; color:${canAfford ? '#fff' : '#777'}; border-radius:6px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
        >
          💎 APLICAR LIFE STONE
        </button>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <div style="background:linear-gradient(180deg, rgba(30,16,48,0.95), rgba(14,8,26,0.95)); border:1px solid rgba(168,85,247,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">💎 Augmentation / Life Stones (Superior LS)</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Utilize Superior Life Stones para encantar Armas e Joias Épicas (Queen Ant, Baium, Valakas, Zaken, Antharas) com Item Skills ativas/passivas.
        </p>
      </div>

      <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">👑 Armas e Joias Épicas no Inventário</h4>
      ${epicsHtml || '<div style="font-size:12px; color:#aaa;">Nenhuma arma ou joia épica no inventário no momento.</div>'}
    </div>
  `;
}

export function renderForgeBelts(container, state) {
  const inv = state.inventory || [];
  const beltsInInv = inv.filter(i => i.slot === 'belt' || (i.itemId || '').includes('belt'));

  let inventoryBeltsHtml = '';
  for (const b of beltsInInv) {
    inventoryBeltsHtml += `
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#ffd877; font-size:13px;">${b.name || 'Cinto'}</strong>
          <div style="font-size:11px; color:#aaa;">Nível de Encaixe: ${b.compoundLevel || 1}</div>
        </div>
        <span style="font-size:11px; color:#34d399;">Disponível</span>
      </div>
    `;
  }

  const cost = 500000;
  const canAffordBelt = (state.gold || 0) >= cost;

  container.innerHTML = `
    <div style="padding:10px; color:#fff; font-family:sans-serif;">
      <!-- Belts Banner -->
      <div style="background:linear-gradient(180deg, rgba(40,30,12,0.95), rgba(20,15,6,0.95)); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:14px; margin-bottom:16px;">
        <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px;">🎗️ Síntese de Cintos [S] (Blessed Top-Grade Belt)</h3>
        <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
          Combine materiais raros e cinto base para fundir o lendário <strong>Blessed Top-Grade Magic Ornament Belt [S]</strong>.
        </p>
      </div>

      <!-- Compound Card -->
      <div style="background:rgba(20,26,42,0.9); border:1px solid rgba(212,167,68,0.4); border-radius:12px; padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h4 style="margin:0; font-family:'Cinzel',serif; color:#ffd877; font-size:16px;">✨ Blessed Top-Grade Magic Ornament Belt [S]</h4>
            <div style="font-size:12px; color:#aaa; margin-top:4px;">
              Bônus Concedido: <strong style="color:#34d399;">+7.2% Defesa Geral (PvE)</strong> &amp; <strong style="color:#f43f5e;">+6.0% Dano de Habilidades e Ataque Físico</strong>
            </div>
          </div>
          <span style="background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffe699; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:bold;">Taxa de Sucesso: 70%</span>
        </div>

        <div style="font-size:12px; color:#ccc; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; margin-bottom:12px;">
          💰 Custo de Síntese: <strong style="color:#ffd877;">500.000 Adena</strong>
        </div>

        <button
          onclick="window.compoundBelts()"
          ${!canAffordBelt ? 'disabled' : ''}
          style="width:100%; padding:12px; font-family:'Cinzel',serif; font-weight:bold; font-size:13px; background:${canAffordBelt ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(60,50,40,0.5)'}; border:1px solid ${canAffordBelt ? '#ffe699' : 'rgba(100,80,60,0.3)'}; color:${canAffordBelt ? '#000' : '#777'}; border-radius:8px; cursor:${canAffordBelt ? 'pointer' : 'not-allowed'}; box-shadow:0 4px 15px rgba(212,167,68,0.2);"
        >
          ✨ SINTETIZAR CINTO SAGRADO [S] (500.000g)
        </button>
      </div>

      <h4 style="margin:0 0 10px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:14px;">🎗️ Cintos no Inventário</h4>
      ${inventoryBeltsHtml || '<div style="font-size:12px; color:#aaa;">Nenhum cinto adicional no inventário no momento.</div>'}
    </div>
  `;
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
              onclick="window.executeDonationPix('${d.id}', ${d.totalAC || d.amountAC})"
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
              Enfrente as lendas de Lineage II para conquistar <strong>Joias de Chefe Lendárias</strong> (+Crit Dmg, +Lifesteal, +Stats), <strong>Blessed Scrolls</strong> e <strong>Aden Coins</strong>!
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
        travelBtn: `<button onclick="window.teleportToQuestZone('valleyOfSaints')" style="padding:4px 10px; font-size:10.5px; font-weight:bold; background:#1e3a8a; border:1px solid #60a5fa; color:#93c5fd; border-radius:4px; cursor:pointer; margin-top:4px;">🗺️ Ir para Valley of Saints</button>`,
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
        travelBtn: `<button onclick="window.teleportToQuestZone('swampOfScreams')" style="padding:4px 10px; font-size:10.5px; font-weight:bold; background:#1e3a8a; border:1px solid #60a5fa; color:#93c5fd; border-radius:4px; cursor:pointer; margin-top:4px;">🗺️ Ir para Swamp of Screams</button>`,
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
            <img src="${sk.icon}" style="width:32px; height:32px; object-fit:contain; filter:${isUnlocked ? 'none' : 'grayscale(100%) opacity(0.5)'};" />
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
            <img src="${item.icon}" style="width:32px; height:32px; object-fit:contain;" />
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
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'skills' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'skills' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'skills' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🛡️ Habilidades de Clã
        </button>
        <button
          onclick="window.setClanSubTab('castles')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'castles' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'castles' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'castles' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          🏰 Castelos &amp; Tributos
        </button>
        <button
          onclick="window.setClanSubTab('siege')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'siege' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'siege' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'siege' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
        >
          ⚔️ Guerra de Cerco (Siege)
        </button>
        <button
          onclick="window.setClanSubTab('shop')"
          style="padding:8px 16px; font-family:'Cinzel',serif; font-size:12px; font-weight:bold; background:${activeSubTab === 'shop' ? 'linear-gradient(180deg,#ca8a04,#a16207)' : 'rgba(0,0,0,0.4)'}; border:1px solid ${activeSubTab === 'shop' ? '#fde047' : 'rgba(255,255,255,0.1)'}; color:${activeSubTab === 'shop' ? '#fff' : '#cbd5e1'}; border-radius:6px; cursor:pointer;"
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
  return `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:14px;">
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
                onclick="window.unsealArmorAction()"
                style="padding:6px 12px; font-size:11px; font-weight:bold; background:#9333ea; border:1px solid #c084fc; color:#fff; border-radius:6px; cursor:pointer;"
              >
                Utilizar
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





