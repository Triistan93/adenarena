/**
 * GameUI.js — Módulo unificado de interface gráfica do Lineage Idle.
 * Consolida TooltipUI, InventoryUI, StageUI, SkillsUI, ShopUI e AppLayout.
 *
 * NOTA IMPORTANTE SOBRE CSS (leia antes de mexer em estilos):
 * O jogo roda dentro de uma Shadow DOM (#idle-host.shadowRoot — ver getRoot()
 * abaixo). Uma folha de estilo externa como GameUI.css NÃO atravessa a
 * fronteira da Shadow DOM sozinha; por isso os estilos deste módulo são
 * injetados como uma tag <style> DIRETAMENTE dentro da shadow root (função
 * ensureGameUIStyles, mais abaixo). GameUI.css é mantido como referência /
 * fonte legível do mesmo conteúdo, mas quem efetivamente estiliza a tela é
 * o bloco injetado aqui. Editar só o .css sem espelhar aqui não terá efeito.
 */

import { D, ALL_EQUIP_SLOTS, TIER_NAMES } from '../core/GameConfig.js';
import { el, qsa, mkEl, mkNS, updateBar } from '../core/DomHelpers.js';
import {
  getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet,
  toggleSelectItem, selectItemsByFilter, clearItemSelection, getInventoryCount
} from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots, equipItem, unequipItem } from '../services/EquipmentService.js';
import { getCraftLevelReq, getRecipeMaterials, canCraft } from '../services/CraftService.js';
import { classSatisfies, getClassSkills } from '../services/CharacterService.js';
import { getClass } from '../engine/StatsEngine.js';
import { getSkillCost } from '../engine/SkillEngine.js';
import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
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

export function showItemTooltip(e, item, state, callbacks = {}) {
  const tooltip = findElement('item-tooltip');
  if (!tooltip || !item) return;

  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  const displayName = formatItemDisplayName(item, def);
  const rarity = item.rarity || 'common';
  const rarityName = gData?.RARITY?.[rarity]?.name || rarity;

  let statsStr = '';
  if (def.stats) {
    const statsList = Object.entries(def.stats).map(([k, v]) => `${k.toUpperCase()}: +${v}`);
    if (statsList.length > 0) statsStr = `<div class="tooltip-stats">${statsList.join(' · ')}</div>`;
  }

  let affixesStr = '';
  if (item.affixes && item.affixes.length > 0) {
    affixesStr = `<div class="tooltip-affixes">${item.affixes.map(a => `✨ ${a.name}: +${a.value}`).join('<br/>')}</div>`;
  }

  tooltip.innerHTML = `
    <div class="tooltip-header rarity-${rarity}">
      <span class="tooltip-title">${escapeHTML(displayName)}</span>
      <span class="tooltip-rarity">${rarityName}</span>
    </div>
    <div class="tooltip-slot">${def.slot ? def.slot.toUpperCase() : 'ITEM'} ${def.req?.level ? `· Req Lv.${def.req.level}` : ''}</div>
    ${statsStr}
    ${affixesStr}
    <div class="tooltip-desc">${escapeHTML(def.desc || '')}</div>
  `;

  tooltip.style.display = 'block';
  tooltip.style.left = `${e.clientX + 15}px`;
  tooltip.style.top = `${e.clientY + 15}px`;
}

export function hideItemTooltip() {
  const tooltip = findElement('item-tooltip');
  if (tooltip) tooltip.style.display = 'none';
}

/* ═══════════════════════════════════════════════════════════════════════════
   3. INVENTORY & PAPERDOLL (6 LINHAS x 3 COLUNAS)
═══════════════════════════════════════════════════════════════════════════ */
const GEAR_SLOTS = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'necklace', 'earring', 'ring', 'hair', 'hair2', 'agathion', 'talisman'];
const CONSUMABLE_SLOTS = ['consumable', 'potion', 'scroll', 'food', 'powerup'];
const MATERIAL_SLOTS = ['material', 'gem', 'ore', 'craft'];

const SLOT_ICONS = {
  hair: '🎭', helmet: '🪖', hair2: '👑',
  earring1: '💎', armor: '🦺', earring2: '💎',
  necklace: '📿', legs: '👖', cloak: '🧥',
  weapon: '⚔️', gloves: '🧤', shield: '🛡️',
  ring1: '💍', boots: '👢', ring2: '💍',
  talisman: '🧿', agathion: '👼', belt: '🎗️'
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

const GAMEUI_CSS = `
/* ═══════════ PAPERDOLL (LARGURA FLUIDA) ═══════════ */
#tab-inventory .l2inv-left-paperdoll,
.l2inv-left-paperdoll {
  width: clamp(150px, 22%, 175px) !important;
  min-width: 150px !important;
  max-width: 175px !important;
  flex: 0 1 175px !important;
  padding: 6px !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
  overflow-y: auto !important;
  border-right: 1px solid #3c2e1e !important;
}

#tab-inventory .l2inv-paperdoll-grid,
.l2inv-paperdoll-grid {
  display: flex !important;
  flex-direction: row !important;
  gap: 4px !important;
  justify-content: center !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

#tab-inventory .l2inv-doll-col,
.l2inv-doll-col {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
  width: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  flex: 0 0 50px !important;
}

#tab-inventory .equip-slot,
.l2inv-pd-slot,
.equip-slot {
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
  max-width: 50px !important;
  min-height: 50px !important;
  max-height: 50px !important;
  box-sizing: border-box !important;
  background: #1a1611 !important;
  border: 1px solid #4a3a2a !important;
  border-radius: 3px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
}
.equip-slot.active { border-color: #c9a227 !important; }

/* === DESATIVAR RESIZE MANUAL === */
#inventory-panel, .inventory-panel, #inventory-window, #tab-inventory, .l2inv-header-frame {
  resize: none !important;
  user-select: none !important;
}

/* ═══════════ GRID FLUIDO DE 10 COLUNAS COM SCROLL VERTICAL ═══════════
   Antigamente 38px fixos: sobrava/faltava espaço dependendo da largura
   real do painel. Agora preenche 100% do container via fr, sempre
   quadrado (aspect-ratio), com no máximo ~8 linhas visíveis antes de
   rolar. */
#tab-inventory #inventory-grid,
#tab-inventory .inventory-grid,
#tab-inventory .l2inv-grid,
#inventory-grid,
.inventory-grid,
.l2inv-grid {
  display: grid !important;
  grid-template-columns: repeat(10, minmax(0, 1fr)) !important;
  grid-auto-rows: minmax(34px, 1fr) !important;
  gap: 3px !important;
  padding: 6px !important;
  width: 100% !important;
  background: rgba(10, 7, 4, 0.85) !important;
  border: 2px solid #3c2e1e !important;
  border-radius: 4px !important;
  max-height: 337px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
  align-content: start !important;
  justify-content: stretch !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  scrollbar-width: thin !important;
  scrollbar-color: #5a452a #120d08 !important;
}

#inventory-grid::-webkit-scrollbar,
.inventory-grid::-webkit-scrollbar { width: 8px !important; }
#inventory-grid::-webkit-scrollbar-track,
.inventory-grid::-webkit-scrollbar-track { background: #120d08 !important; border-radius: 4px !important; }
#inventory-grid::-webkit-scrollbar-thumb,
.inventory-grid::-webkit-scrollbar-thumb { background: #5a452a !important; border-radius: 4px !important; border: 1px solid #7a5c38 !important; }

/* SLOTS DO INVENTÁRIO — SEMPRE QUADRADOS, PREENCHEM A CÉLULA DO GRID */
#tab-inventory .inv-slot,
.inv-slot,
.l2inv-slot {
  width: 100% !important;
  height: 100% !important;
  aspect-ratio: 1 / 1 !important;
  min-width: 0 !important;
  background: #241e16 !important;
  border: 1px solid #5a452a !important;
  border-radius: 3px !important;
  box-sizing: border-box !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 2px !important;
  position: relative !important;
  cursor: pointer !important;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.8) !important;
  transition: border-color .12s, transform .12s !important;
}
#tab-inventory .inv-slot:not(.empty):hover,
.inv-slot:not(.empty):hover {
  border-color: #c9a227 !important;
  transform: translateY(-1px) !important;
}

#tab-inventory .inv-slot.empty,
.inv-slot.empty {
  background: rgba(14, 10, 6, 0.6) !important;
  border: 1px solid #2e2216 !important;
  opacity: 0.6 !important;
  cursor: default !important;
}

/* ÍCONES DO ITEM — SEMPRE VISÍVEIS, PROPORCIONAIS AO SLOT */
.inventory-item-image,
.equip-icon img,
.item-icon img {
  display: inline-block !important;
  width: 70% !important;
  height: 70% !important;
  max-width: 28px !important;
  max-height: 28px !important;
  object-fit: contain !important;
  pointer-events: none !important;
}
.inventory-item-emoji { font-size: 15px !important; }

/* === MAPA DE ZONAS & SAGAS === */
.saga-map-block {
  padding: 12px 14px !important;
  margin-bottom: 14px !important;
  border: 1px solid rgba(212, 175, 55, .28) !important;
  border-radius: 12px !important;
  background: linear-gradient(180deg, rgba(28, 34, 48, .82), rgba(16, 20, 30, .82)) !important;
}
.saga-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding-bottom: 8px !important;
  margin-bottom: 10px !important;
  border-bottom: 1px solid rgba(212, 175, 55, .2) !important;
}
.saga-title {
  color: #e8c37a !important;
  font-size: 15px !important;
  font-weight: 700 !important;
  font-family: "Cinzel", serif !important;
}
.saga-req {
  padding: 2px 10px !important;
  color: #8b93a7 !important;
  font-size: 11px !important;
  border: 1px solid rgba(139, 147, 167, .3) !important;
  border-radius: 999px !important;
}
.saga-zones-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
  gap: 12px !important;
}
.zone-card {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  background: #131824 !important;
  border: 1px solid rgba(212, 175, 55, .3) !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  transition: transform .16s, border-color .16s, box-shadow .16s !important;
}
.zone-card:hover:not(.locked):not(.active) {
  transform: translateY(-3px) !important;
  border-color: rgba(232, 195, 122, .8) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,.6) !important;
}
.zone-card.active {
  border-color: #e8c37a !important;
  box-shadow: 0 0 0 1px rgba(232, 195, 122, .5), 0 0 20px rgba(232, 195, 122, .25) !important;
}
.zone-card-thumb {
  position: relative !important;
  height: 80px !important;
  background-color: #0d1018 !important;
  background-position: center !important;
  background-size: cover !important;
  display: block !important;
}
.zone-card-thumb::after {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(180deg, transparent 30%, rgba(10, 13, 20, .95)) !important;
}
.zone-flag {
  position: absolute !important;
  top: 6px !important;
  z-index: 2 !important;
  padding: 3px 8px !important;
  font-size: 10px !important;
  border-radius: 999px !important;
}
.zone-flag.town { left: 6px !important; color: #7fd4a8 !important; background: rgba(8,10,16,.85) !important; border: 1px solid rgba(127,212,168,.4) !important; }
.zone-flag.here { right: 6px !important; color: #0d1018 !important; font-weight: 800 !important; background: #e8c37a !important; }
.zone-card-body { display: flex !important; flex-direction: column !important; gap: 6px !important; padding: 10px !important; }
.zone-card-header { display: flex !important; align-items: baseline !important; justify-content: space-between !important; }
.zone-card-title { color: #e6e9f2 !important; font-size: 13px !important; font-weight: 700 !important; font-family: "Cinzel", serif !important; }
.zone-card-lvl { color: #e8c37a !important; font-size: 11px !important; }
.zone-card-desc { color: #8b93a7 !important; font-size: 11px !important; }
.select-zone-btn {
  width: 100% !important;
  padding: 8px !important;
  color: #e8c37a !important;
  font-family: inherit !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  background: rgba(212, 175, 55, .12) !important;
  border: 1px solid rgba(212, 175, 55, .5) !important;
  border-radius: 6px !important;
  cursor: pointer !important;
}
.select-zone-btn:hover:not(:disabled) { color: #12161f !important; background: #e8c37a !important; }

/* ═══════════════════════════════════════════════════════════════════
   DIORAMA DE BATALHA — PADRÃO ÚNICO PARA HERÓI E MONSTRO
   Mesma moldura, mesmo posicionamento de nome/barras/arte para os dois;
   só a cor de destaque muda (azul herói, vermelho monstro).
═══════════════════════════════════════════════════════════════════ */
#stage-hero, .stage-hero,
#stage-monster, .stage-monster {
  position: relative !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: flex-end !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 140px !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  box-sizing: border-box !important;
  background: linear-gradient(180deg, rgba(20,16,10,.1) 0%, rgba(8,6,4,.78) 100%) !important;
  border: 1px solid rgba(212, 175, 55, .35) !important;
  box-shadow: inset 0 0 26px rgba(0,0,0,.55), 0 4px 14px rgba(0,0,0,.35) !important;
}

.stage-entity-name {
  position: absolute !important;
  top: 8px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 3 !important;
  max-width: calc(100% - 16px) !important;
  padding: 3px 12px !important;
  font-family: "Cinzel", serif !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  letter-spacing: .2px !important;
  color: #f0d090 !important;
  background: rgba(10,8,6,.82) !important;
  border: 1px solid rgba(212, 175, 55, .45) !important;
  border-radius: 999px !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}
.stage-hero-name { color: #a8d4ff !important; border-color: rgba(96, 165, 250, .45) !important; }

.hero-sprite-host, .monster-sprite-host {
  flex: 1 1 auto !important;
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 30px 8px 34px !important;
  box-sizing: border-box !important;
  pointer-events: none !important;
}
.hero-sprite-host svg, .monster-sprite-host svg {
  max-width: 82% !important;
  max-height: 100% !important;
  filter: drop-shadow(0 10px 12px rgba(0,0,0,.55)) !important;
}

.stage-hp-bar, .stage-mp-bar {
  position: absolute !important;
  left: 8px !important;
  right: 8px !important;
  height: 14px !important;
  z-index: 3 !important;
  border-radius: 7px !important;
  overflow: hidden !important;
  background: rgba(8,6,4,.82) !important;
  border: 1px solid #4a3a2a !important;
  box-shadow: inset 0 1px 3px rgba(0,0,0,.6) !important;
}
.stage-hp-bar { bottom: 8px !important; }
.stage-mp-bar-hero { bottom: 26px !important; }
.stage-hp-fill { height: 100% !important; background: linear-gradient(90deg, #7a1414, #e34747) !important; transition: width .25s ease !important; }
.stage-mp-fill { height: 100% !important; background: linear-gradient(90deg, #14357a, #4778e3) !important; transition: width .25s ease !important; }
.stage-hp-text, .stage-mp-text {
  position: absolute !important;
  inset: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 9px !important;
  font-weight: 700 !important;
  color: #fff !important;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000 !important;
  pointer-events: none !important;
}

.stage-battle-row {
  display: flex !important;
  align-items: stretch !important;
  justify-content: center !important;
  gap: 16px !important;
  width: 100% !important;
  height: 100% !important;
}
.stage-battle-row > * { flex: 1 1 0 !important; min-width: 0 !important; }
`;

/**
 * Injeta o CSS acima diretamente dentro da shadow root do jogo (e também no
 * document.head, como rede de segurança caso a shadow root ainda não exista
 * no momento da chamada). É chamada de forma idempotente — não duplica a
 * tag se já injetada — e é acionada tanto pelas funções de inventário
 * quanto pelas de stage/zonas, para garantir que os estilos existam desde
 * o primeiro render, independente de qual aba o jogador abrir primeiro.
 */
export function ensureGameUIStyles() {
  // IMPORTANTE: nunca usar getRoot() aqui. getRoot() cai para `document`
  // quando #idle-host ainda não existe (ex.: no load inicial do módulo),
  // e appendChild direto em `document` lança HierarchyRequestError
  // ("Only one element on document allowed") porque document só aceita
  // um único elemento filho (a tag <html>). Resolvemos a shadow root nós
  // mesmos e só usamos alvos que são containers válidos: a shadow root
  // (se existir) e document.head.
  const shadowRoot = document.getElementById('idle-host')?.shadowRoot || null;
  const targets = [shadowRoot, document.head].filter(Boolean);

  for (const t of targets) {
    if (!t.querySelector('#gameui-styles-direct')) {
      const style = document.createElement('style');
      style.id = 'gameui-styles-direct';
      style.textContent = GAMEUI_CSS;
      t.appendChild(style);
    }
  }
}

// Mantido por compatibilidade com chamadas existentes ao longo do arquivo.
export function ensureInventoryStyles() {
  ensureGameUIStyles();
}

// Garante que os estilos existam assim que este módulo é carregado, mesmo
// antes de qualquer função de UI ser chamada (corrige o caso em que a
// stage/zonas renderizam antes do inventário).
if (typeof document !== 'undefined') {
  ensureGameUIStyles();
}

export function updateInventoryUI(state, callbacks = {}) {
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
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const check = `<span class="inv-check">${isSelected ? '✓' : ''}</span>`;

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;

    slotEl.innerHTML = `
      ${check}
      <span class="item-icon">${getItemIcon(def || item)}</span>
      ${qty}
      ${equippedTag}
    `;

    slotEl.title = def.name;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();

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
        if (callbacks.unequipItem) callbacks.unequipItem(state, item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), callbacks);
      } else {
        if (callbacks.equipItem) callbacks.equipItem(state, item.uid, callbacks);
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

  const cnt = findElement('inv-count') || findElement('inv-slots') || findElement('inv-slots-count');
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;
}

export function updateWarehouseUI(state, callbacks = {}) {
  ensureInventoryStyles();
  const container = findElement('warehouse-grid');
  const countEl = findElement('warehouse-slot-count');
  if (!container) return;

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();
  if (countEl) countEl.textContent = `${state.warehouse.length} / ${maxSlots}`;

  container.innerHTML = '';

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
    };

    container.appendChild(slotEl);
  }
}

export function updateEquipmentUI(state, callbacks = {}) {
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
      slotEl.className = `equip-slot active rarity-${rarity}`;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;

      slotEl.innerHTML = `<span class="equip-icon">${getItemIcon(def || item)}</span>`;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => {
        if (callbacks.unequipItem) callbacks.unequipItem(state, slot, callbacks);
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
export function ensureStageStyles() { ensureGameUIStyles(); }

function ensureHeroStructure() {
  const root = getRoot();
  const heroCard = root.querySelector('#stage-hero, .stage-hero');
  if (!heroCard) return null;

  let name = heroCard.querySelector('#hero-name');
  let hpBar = heroCard.querySelector('#hero-hp-bar');
  let mpBar = heroCard.querySelector('#hero-mp-bar');
  let sprite = heroCard.querySelector('#hero-sprite-container');

  if (!name || !hpBar || !mpBar || !sprite) {
    heroCard.innerHTML = `
      <div id="hero-name" class="stage-entity-name stage-hero-name">—</div>
      <div id="hero-hp-bar" class="stage-hp-bar stage-hp-bar-hero">
        <div id="hero-hp-fill" class="stage-hp-fill stage-hp-fill-hero"></div>
        <span id="hero-hp-text" class="stage-hp-text stage-hp-text-hero">0 / 0</span>
      </div>
      <div id="hero-mp-bar" class="stage-mp-bar stage-mp-bar-hero">
        <div id="hero-mp-fill" class="stage-mp-fill stage-mp-fill-hero"></div>
        <span id="hero-mp-text" class="stage-mp-text stage-mp-text-hero">0 / 0</span>
      </div>
      <div id="hero-sprite-container" class="hero-sprite-host"></div>
    `;
    name = heroCard.querySelector('#hero-name');
    hpBar = heroCard.querySelector('#hero-hp-bar');
    mpBar = heroCard.querySelector('#hero-mp-bar');
    sprite = heroCard.querySelector('#hero-sprite-container');
  }

  return { card: heroCard, name, hpBar, mpBar, sprite };
}

function ensureMonsterStructure() {
  const root = getRoot();
  const monsterCard = root.querySelector('#stage-monster, .stage-monster');
  if (!monsterCard) return null;

  let name = monsterCard.querySelector('#monster-name, #m-name');
  let hpBar = monsterCard.querySelector('#monster-hp-bar, #m-hp-bar');
  let sprite = monsterCard.querySelector('#monster-sprite-container, #m-art');

  if (!name || !hpBar || !sprite) {
    monsterCard.innerHTML = `
      <div id="monster-name" class="stage-entity-name">—</div>
      <div id="monster-hp-bar" class="stage-hp-bar">
        <div id="monster-hp-fill" class="stage-hp-fill"></div>
        <span id="monster-hp-text" class="stage-hp-text">0 / 0</span>
      </div>
      <div id="monster-sprite-container" class="monster-sprite-host"></div>
    `;
    name = monsterCard.querySelector('#monster-name');
    hpBar = monsterCard.querySelector('#monster-hp-bar');
    sprite = monsterCard.querySelector('#monster-sprite-container');
  }

  return { card: monsterCard, name, hpBar, sprite };
}

export function renderStageHero(state) {
  if (!state) return;
  ensureGameUIStyles();
  const structure = ensureHeroStructure();
  if (!structure?.card) return;

  if (structure.name) {
    const classDef = getClass(state.class);
    const className = classDef?.name || state.class || 'Aventureiro';
    const heroName = state.heroName || state.name || state.playerName || 'Herói';
    structure.name.textContent = `${heroName} (Lv. ${state.level || 1})`;
  }

  updateBar('hero-hp-bar', state.hp || 0, state.maxHp || 1, 'hp');
  updateBar('hero-mp-bar', state.mp || 0, state.maxMp || 1, 'mp');

  if (structure.sprite && typeof heroSVG === 'function') {
    const race = state.race || state.heroRace || state.playerRace || 'human';
    const cls = state.class || state.heroClass || state.playerClass || 'fighter';
    structure.sprite.innerHTML = heroSVG(race, cls);
  }
}

export function renderStageMonster(state) {
  if (!state) return;
  ensureGameUIStyles();
  const structure = ensureMonsterStructure();
  if (!structure?.card) return;

  const m = state.activeMonster;

  if (!m) {
    if (structure.name) structure.name.textContent = 'Procurando Inimigo...';
    if (structure.sprite) structure.sprite.innerHTML = '';
    updateBar('monster-hp-bar', 0, 1, 'hp');
    return;
  }

  if (structure.name) {
    structure.name.textContent = `${m.name || 'Monstro'} (Lv. ${m.level || 1})`;
  }

  updateBar('monster-hp-bar', m.hp || 0, m.maxHp || 1, 'hp');

  if (structure.sprite && typeof monsterSVG === 'function') {
    const mId = m.id || m.monsterId || m.key || m.name || 'goblin';
    const opts = { crown: !!(m.isBoss || m.boss) };
    structure.sprite.innerHTML = monsterSVG(mId, opts);
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
  ensureGameUIStyles();
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

      const isCurrent = state.currentZone === zId;
      const isLocked = (state.level || 1) < (zDef.minLevel || zDef.reqLvl || 1);
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
              <span class="zone-card-lvl">Lv.${zDef.minLevel || zDef.reqLvl || 1}+</span>
            </div>
            <div class="zone-card-desc">
              ${monsterCount} espécie${monsterCount === 1 ? '' : 's'} · 👑 ${bossName}
            </div>
            <button class="select-zone-btn" ${isLocked || isCurrent ? 'disabled' : ''}>
              ${isCurrent ? '★ Caçando Aqui' : isLocked ? `🔒 Requer Lv.${zDef.minLevel || zDef.reqLvl || 1}` : 'Caçar nesta Área'}
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
      const parentPos = pos[parentId];
      if (!parentPos) continue;
      const owned = (state.skills[parentId] || 0) >= reqs[parentId];
      const cls = owned ? 'link link-owned' : 'link';
      if (parentPos.y === childPos.y) {
        const cy = parentPos.y - 26;
        lines += `<path class="${cls}" d="M ${parentPos.x} ${parentPos.y} Q ${(parentPos.x + childPos.x) / 2} ${cy} ${childPos.x} ${childPos.y}" />`;
      } else {
        lines += `<line class="${cls}" x1="${parentPos.x}" y1="${parentPos.y}" x2="${childPos.x}" y2="${childPos.y}" />`;
      }
    }
  }

  let tierLabels = '';
  for (let c = 0; c < cols; c++) {
    const x = TREE_PAD_X + c * TREE_NODE_W + TREE_NODE_W / 2;
    tierLabels += `<text class="tier-label" x="${x}" y="${H - 4}">${TIER_NAMES[c] || ''}</text>`;
  }

  wrap.querySelector('svg')?.remove();
  const svg = mkNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'skill-tree-svg');
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = lines + tierLabels;
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
    const lvl = state.skills[id] || 0;
    const max = def.max || def.maxLevel || 5;
    const node = mkEl('div');
    node.className = `skill-node tier-${def.tier || 0}` + (lvl > 0 ? ' owned' : '') + (lvl === max ? ' maxed' : '');
    node.style.left = (p.x - TREE_NODE_W / 2) + 'px';
    node.style.top = (p.y - TREE_NODE_H / 2) + 'px';
    node.style.width = TREE_NODE_W + 'px';
    node.style.height = TREE_NODE_H + 'px';

    const reqs = SKILL_REQS[id];
    const reqOk = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v);
    const lvlOk = state.level >= (def.reqLvl || 1);
    const canBuy = reqOk && lvlOk && state.sp >= getSkillCost(id, lvl) && lvl < max;
    const btnClass = canBuy ? 'skill-btn can-buy' : 'skill-btn';

    node.innerHTML = `
      <button class="${btnClass}" data-skill="${id}">
        <span class="skill-icon">${def.icon || '✦'}</span>
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
  const meetsReqs = !reqs || Object.entries(reqs).every(([s, v]) => s === 'level' || s === 'sp' || (state.skills[s] || 0) >= v);
  const lvlOk = state.level >= (def.reqLvl || 1);
  const canAfford = state.sp >= cost && !maxed;

  let reqHtml = (reqs && Object.keys(reqs).filter(s => s !== 'level' && s !== 'sp').length > 0)
    ? Object.entries(reqs).filter(([s]) => s !== 'level' && s !== 'sp').map(([s, v]) => {
        const ok = (state.skills[s] || 0) >= v;
        return `<span class="req ${ok ? 'ok' : 'no'}">${SKILL_DEFS[s]?.name || s} ${v}</span>`;
      }).join('')
    : '';
  reqHtml += `<span class="req ${lvlOk ? 'ok' : 'no'}">Level ${def.reqLvl || 1}</span>`;

  const tier = TIER_NAMES[def.tier || 0] || '';
  const effectText = (typeof window !== 'undefined' && window.SkillScaling)
    ? window.SkillScaling.buildSkillEffectText(def, lvl)
    : (def.info || def.desc || '');

  panel.innerHTML = `
    <div class="si-head"><span class="si-icon">${def.icon || '✦'}</span><div class="si-title"><h3>${def.name}</h3><p class="si-tier">${tier} · Lv.${lvl}/${max}</p></div></div>
    <p class="si-desc">${def.desc || def.note || ''}</p><div class="si-effect">${effectText}</div>
    <div class="si-reqs"><span class="si-label">Requires</span>${reqHtml}</div>
    <button class="si-btn" data-skillup="${id}" ${(!canAfford || !meetsReqs || !lvlOk) ? 'disabled' : ''}>${maxed ? '✦ MAXED' : `Invest ${cost.toLocaleString()} SP`}</button>
    <p class="si-sp">SP available: <strong>${(state.sp || 0).toLocaleString()}</strong></p>
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
export function updateShopUI(state, callbacks = {}) {
  const goldEl = findElement('gold-count') || findElement('shop-gold');
  if (goldEl) goldEl.textContent = (state.gold || 0).toLocaleString();

  const container = findElement('shop-items-container') || findElement('shop-list');
  if (!container) return;

  const gData = D();
  const shopItems = gData?.SHOP_ITEMS || [];

  container.innerHTML = shopItems.map(item => {
    const def = gData?.ALL_ITEMS?.[item.itemId || item.id];
    if (!def) return '';

    const price = (def.price || 100) * (item.qty || 1);
    const canAfford = (state.gold || 0) >= price;

    return `
      <div class="shop-item-card">
        <div class="shop-item-icon">${getItemIcon(def || item)}</div>
        <div class="shop-item-details">
          <div class="shop-item-name">${def.name}</div>
          <div class="shop-item-desc">${def.desc || ''}</div>
          <div class="shop-item-price">💰 ${price.toLocaleString()} Gold</div>
        </div>
        <button class="buy-item-btn" data-buy="${def.id || item.itemId}" ${!canAfford ? 'disabled' : ''}>
          Comprar
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-buy]').forEach(btn => {
    btn.onclick = () => {
      if (callbacks.buyItem) callbacks.buyItem(btn.dataset.buy, 1);
      else if (typeof window !== 'undefined' && typeof window.buyItem === 'function') window.buyItem(btn.dataset.buy, 1);
    };
  });
}

export function updateCraftUI(state, callbacks = {}) {
  const craftLvlEl = findElement('craft-level-num') || findElement('craft-level');
  if (craftLvlEl) craftLvlEl.textContent = `Lv. ${state.craftLevel || 1}`;

  const container = findElement('craft-recipes-container') || findElement('craft-list');
  if (!container) return;

  const gData = D();
  const recipes = gData?.CRAFTING_RECIPES || {};
  const recipeList = Array.isArray(recipes) ? recipes : Object.values(recipes);

  container.innerHTML = recipeList.map(r => {
    if (!r) return '';
    const itemId = r.itemId || r.id;
    const def = gData?.ALL_ITEMS?.[itemId];
    if (!def) return '';

    const reqLvl = r.level ? getCraftLevelReq(r.level) : 1;
    const isLevelOk = (state.craftLevel || 1) >= reqLvl;
    const mats = getRecipeMaterials(r);

    const matsHtml = mats.map(m => {
      const matDef = gData?.ALL_ITEMS?.[m.matId];
      const count = getInventoryCount(state, m.matId);
      const isOk = count >= m.qty;
      return `<span style="color:${isOk ? '#4ade80' : '#ef4444'};">${matDef ? matDef.name : m.matId}: ${count}/${m.qty}</span>`;
    }).join(' · ');

    const craftable = canCraft(state, itemId);

    return `
      <div class="craft-recipe-card ${craftable ? 'craftable' : ''}">
        <div class="craft-recipe-header">
          <span class="craft-recipe-icon">${getItemIcon(def)}</span>
          <div>
            <div class="craft-recipe-title">${def.name}</div>
            <div class="craft-recipe-sub">Requer Forja Lv.${reqLvl}</div>
          </div>
        </div>
        <div class="craft-mats-line">${matsHtml}</div>
        <button class="craft-item-btn" data-craft="${itemId}" ${!craftable ? 'disabled' : ''}>
          🔨 Criar Item
        </button>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-craft]').forEach(btn => {
    btn.onclick = () => {
      if (callbacks.craftItem) callbacks.craftItem(btn.dataset.craft);
    };
  });
}
