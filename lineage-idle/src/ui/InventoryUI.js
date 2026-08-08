/**
 * InventoryUI.js — Inventário, Baú, Paperdoll e Slots de Equipamento.
 * Corrigido: ícones por emoji, slots não sobrepõem, layout compacto na direita.
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';

/* ═══════════════════════════════════════════════════════════════════════════
   DOM / ROOT HELPER
═══════════════════════════════════════════════════════════════════════════ */
function invRoot() {
  return document.getElementById('idle-host')?.shadowRoot || document;
}

function findElement(id) {
  return invRoot().querySelector(`#${id}`) || document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ═══════════════════════════════════════════════════════════════════════════
   ITEM DEFINITION (com variações de chave)
═══════════════════════════════════════════════════════════════════════════ */
function getItemDef(itemId) {
  const data = D();
  if (!data?.ALL_ITEMS || !itemId) return null;
  if (data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];

  const raw = String(itemId);
  const variations = [
    raw,
    raw.toLowerCase(),
    raw.replace(/\s+/g, ''),
    raw.replace(/[-_]/g, '').toLowerCase(),
    raw.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    raw.replace(/_([a-z])/g, (m, c) => c.toUpperCase())
  ];

  for (const v of variations) {
    if (data.ALL_ITEMS[v]) return data.ALL_ITEMS[v];
  }

  const normalized = raw.toLowerCase().replace(/\s+/g, '');
  return Object.values(data.ALL_ITEMS).find(i => i.name?.toLowerCase().replace(/\s+/g, '') === normalized) || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÍCONE — retorna apenas emoji; nunca retorna path de arquivo como texto visível
═══════════════════════════════════════════════════════════════════════════ */
const EMOJI_BY_SLOT = {
  weapon: '⚔️', shield: '🛡️', armor: '🦺', helmet: '🪖',
  gloves: '🧤', legs: '👖', boots: '👢', cloak: '🧥', belt: '🎗️',
  necklace: '📿', earring: '💎', earring1: '💎', earring2: '💎',
  ring: '💍', ring2: '💍', hair: '👑', hair2: '🎭',
  agathion: '👼', talisman: '🧿',
  consumable: '🧪', potion: '🧪', scroll: '📜',
  material: '💠', gem: '💠', quest: '📯'
};

function resolveItemIcon(item, def) {
  const slot = (def?.slot || '').toLowerCase();
  return EMOJI_BY_SLOT[slot] || '📦';
}

function renderItemIcon(item, def) {
  const emoji = resolveItemIcon(item, def);
  return `<span class="inventory-item-emoji">${emoji}</span>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAPERDOLL
═══════════════════════════════════════════════════════════════════════════ */
const SLOT_LABELS = {
  weapon: 'Arma', shield: 'Escudo', armor: 'Armadura', helmet: 'Elmo',
  gloves: 'Luvas', legs: 'Calças', boots: 'Botas', cloak: 'Capa', belt: 'Cinto',
  necklace: 'Colar', earring1: 'Brinco', earring2: 'Brinco',
  ring: 'Anel', ring2: 'Anel', hair: 'Cabelo', hair2: 'Cabelo 2',
  agathion: 'Agathion', talisman: 'Talismã'
};

const SLOT_ICONS = {
  weapon: '⚔️', shield: '🛡️', armor: '🦺', helmet: '🪖',
  gloves: '🧤', legs: '👖', boots: '👢', cloak: '🧥', belt: '🎗️',
  necklace: '📿', earring1: '💎', earring2: '💎',
  ring: '💍', ring2: '💍', hair: '👑', hair2: '🎭',
  agathion: '👼', talisman: '🧿'
};

const EQUIPMENT_SLOT_ALIASES = {
  weapon: ['weapon'], shield: ['shield', 'offhand'], armor: ['armor'],
  helmet: ['helmet'], gloves: ['gloves'], legs: ['legs', 'pants'],
  boots: ['boots'], cloak: ['cloak', 'cape'], belt: ['belt'],
  necklace: ['necklace'], earring1: ['earring1', 'earring'], earring2: ['earring2'],
  ring: ['ring', 'ring1'], ring2: ['ring2'], hair: ['hair'],
  hair2: ['hair2', 'mask'], agathion: ['agathion'], talisman: ['talisman']
};

const _warnedMissingSlots = new Set();

function findEquipmentSlot(slot) {
  const root = invRoot();
  const aliases = EQUIPMENT_SLOT_ALIASES[slot] || [slot];
  for (const alias of aliases) {
    for (const sel of [`#equip-slot-${alias}`, `[data-slot="${alias}"]`, `[data-equip-slot="${alias}"]`]) {
      try {
        const f = root.querySelector(sel);
        if (f) return f;
      } catch {}
    }
  }
  return null;
}

function ensurePaperdollLayout() {
  const root = invRoot();
  const anySlot = findEquipmentSlot('weapon') || findEquipmentSlot('helmet');
  if (!anySlot) return null;
  const panel = anySlot.closest('.l2inv-doll-col') || anySlot.parentElement;
  if (!panel) return null;
  let grid = root.querySelector('#paperdoll-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'paperdoll-grid';
    panel.insertBefore(grid, panel.firstChild);
  }
  const order = ['helmet', 'hair', 'hair2', 'armor', 'legs', 'gloves', 'boots', 'weapon', 'shield', 'necklace', 'earring1', 'earring2', 'ring', 'ring2', 'cloak', 'belt', 'talisman', 'agathion'];
  for (const slot of order) {
    const el = findEquipmentSlot(slot);
    if (el && el.parentElement !== grid) grid.appendChild(el);
  }
  for (const slot of ALL_EQUIP_SLOTS) {
    const el = findEquipmentSlot(slot);
    if (el && !grid.contains(el)) grid.appendChild(el);
  }
  return grid;
}

function createEquipmentSlotDynamically(slot) {
  const grid = ensurePaperdollLayout();
  if (!grid) return null;
  const el = document.createElement('div');
  el.id = `equip-slot-${slot}`;
  el.className = 'equip-slot empty';
  el.dataset.slot = slot;
  grid.appendChild(el);
  return el;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVENTÁRIO
═══════════════════════════════════════════════════════════════════════════ */
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

  const GEAR_SLOTS = ['weapon', 'shield', 'armor', 'helmet', 'gloves', 'legs', 'boots', 'cloak', 'belt', 'necklace', 'earring', 'ring', 'hair', 'hair2', 'agathion', 'talisman'];
  const CONSUMABLE_SLOTS = ['consumable', 'potion', 'scroll', 'food', 'powerup'];
  const MATERIAL_SLOTS = ['material', 'gem', 'ore', 'craft'];

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

    // Sem nome visível no slot; só ícone + quantidade + badge
    slotEl.innerHTML = `
      ${check}
      <span class="item-icon">${renderItemIcon(item, def)}</span>
      ${qty}
      ${equippedTag}
    `;

    // Tooltip mostra nome e detalhes
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

  const cnt = findElement('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAÚ
═══════════════════════════════════════════════════════════════════════════ */
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

    slotEl.innerHTML = `
      <span class="item-icon">${renderItemIcon(item, def)}</span>
      ${countBadge}
    `;

    slotEl.title = def.name;
    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();
    slotEl.onclick = () => {
      if (callbacks.withdrawFromWarehouse) callbacks.withdrawFromWarehouse(item.uid);
    };

    container.appendChild(slotEl);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPAMENTOS
═══════════════════════════════════════════════════════════════════════════ */
export function updateEquipmentUI(state, callbacks = {}) {
  if (!state) return;
  state.equipment = state.equipment || {};

  ensureInventoryStyles();
  migrateEquipmentSlots(state);
  ensurePaperdollLayout();

  for (const slot of ALL_EQUIP_SLOTS) {
    let slotEl = findEquipmentSlot(slot);
    if (!slotEl) slotEl = createEquipmentSlotDynamically(slot);
    if (!slotEl) {
      if (!_warnedMissingSlots.has(slot)) {
        _warnedMissingSlots.add(slot);
      }
      continue;
    }

    const uid = state.equipment[slot];
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def = item ? getItemDef(item.itemId) : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      slotEl.className = `equip-slot active rarity-${rarity}`;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;

      // Só o ícone, sem texto. Se quiser label, remova display:none abaixo
      slotEl.innerHTML = `
        <span class="equip-icon">${renderItemIcon(item, def)}</span>
      `;

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

      slotEl.innerHTML = `
        <span class="equip-placeholder">${SLOT_ICONS[slot] || '📦'}</span>
      `;

      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS — LAYOUT COMPACTO, SEM OVERLAP, SEM NOME DENTRO DOS SLOTS
═══════════════════════════════════════════════════════════════════════════ */
const STYLE_ID = 'inventory-ui-styles-final';

export function ensureInventoryStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;

  for (const oldId of ['inventory-ui-styles', 'inventory-ui-styles-v2', 'inventory-ui-styles-v3', STYLE_ID]) {
    const old = target.querySelector(`#${oldId}`);
    if (old && oldId !== STYLE_ID) old.remove();
  }

  if (target.querySelector(`#${STYLE_ID}`)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = INVENTORY_CSS;
  target.appendChild(style);
}

const INVENTORY_CSS = `
/* ═══════════════ PAINEL ═══════════════ */
#inventory-panel, .inventory-panel, #inventory-window {
  width: 100% !important; max-width: 100% !important; height: 100% !important; max-height: 100% !important;
  min-height: 0 !important; margin: 0 !important; padding: 0 !important;
  background: linear-gradient(180deg, #251a0e 0%, #1a140e 100%) !important;
  border: 2px solid #6b4c1e !important; border-radius: 8px !important;
  display: flex !important; flex-direction: column !important; overflow: hidden !important;
  box-sizing: border-box !important;
}

.inventory-body, #inventory-body {
  flex: 1 !important; display: flex !important; flex-direction: row !important;
  gap: 8px !important; padding: 8px !important; overflow: hidden !important;
  min-height: 0 !important;
}

/* ═══════════════ PAPERDOLL ═══════════════ */
.l2inv-doll-col {
  width: 168px !important; min-width: 168px !important; flex: 0 0 168px !important;
  display: flex !important; flex-direction: column !important; gap: 6px !important;
  background: #201a13 !important; border: 1px solid #3a2a1a !important;
  border-radius: 6px !important; padding: 6px !important; box-sizing: border-box !important;
  overflow-y: auto !important; min-height: 0 !important;
}

#paperdoll-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 48px) !important;
  grid-template-rows: repeat(6, 48px) !important;
  gap: 5px !important; justify-content: center !important; padding: 6px 4px !important;
  background: radial-gradient(ellipse at center, #241a0e 40%, #14100a 100%) !important;
  border: 1px solid #3d2e14 !important; border-radius: 6px !important;
  grid-template-areas:
    "helmet   hair2 necklace"
    "armor    hair  cloak"
    "gloves   legs  belt"
    "weapon   boots ring"
    "shield   talisman ring2"
    ".        agathion ." !important;
  width: fit-content !important; margin: 0 auto !important;
}

.equip-slot {
  position: relative !important;
  width: 47px !important; height: 47px !important;
  border: 1px solid #3d2e14 !important; border-radius: 3px !important;
  background: linear-gradient(180deg, #221a10, #18140e) !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  overflow: hidden !important; box-sizing: border-box !important; cursor: pointer !important;
}
.equip-slot.empty { opacity: .8 !important; cursor: default !important; }
.equip-slot.active { border-color: #c9a227 !important; background: #2a241c !important; box-shadow: inset 0 0 6px rgba(201,162,39,.3) !important; }
.equip-slot.active:hover { border-color: #f5e6a0 !important; }
.equip-slot.rarity-uncommon { border-color: #22c55e !important; }
.equip-slot.rarity-rare     { border-color: #3b82f6 !important; }
.equip-slot.rarity-epic     { border-color: #a855f7 !important; }
.equip-slot.rarity-legendary{ border-color: #f59e0b !important; }

/* Ícone do equipamento — centralizado, nunca sobreposto */
.equip-icon {
  width: 100% !important; height: 100% !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  overflow: hidden !important; line-height: 1 !important;
}

.equip-icon .inventory-item-image,
.equip-icon img {
  width: 32px !important; height: 32px !important;
  max-width: 32px !important; max-height: 32px !important;
  object-fit: contain !important;
  display: block !important;
  margin: auto !important;
  border: none !important;
  padding: 0 !important;
  position: static !important;
  float: none !important;
  transform: none !important;
  inset: auto !important;
}

.equip-placeholder {
  font-size: 18px !important; opacity: .3 !important;
  filter: grayscale(1) !important; line-height: 1 !important;
}

.equip-label {
  position: absolute !important; bottom: 1px !important; left: 0 !important; right: 0 !important;
  font-size: 6px !important; color: #8a6b2e !important; text-align: center !important;
  text-transform: uppercase !important; pointer-events: none !important; line-height: 1 !important;
}
.equip-slot.active .equip-label { color: #c9a227 !important; }

/* Stats abaixo do paperdoll */
.l2inv-stats, .inv-stats {
  padding: 6px 8px !important; font-size: 9px !important; color: #c8a87a !important;
  background: rgba(0,0,0,.4) !important; border-top: 1px solid #3d2e14 !important;
  text-align: center !important; white-space: nowrap !important;
}

/* ═══════════════ GRID DA MOCHILA ═══════════════ */
#inventory-grid, .inventory-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)) !important;
  grid-auto-rows: 42px !important;
  gap: 3px !important;
  padding: 6px !important;
  background: #0f0a07 !important;
  border-top: 1px solid #3d2e14 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  align-content: start !important;
}

.inv-slot {
  position: relative !important;
  width: 100% !important; height: 42px !important;
  border: 1px solid #2a2112 !important; border-radius: 3px !important;
  background: #1e1910 !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  overflow: hidden !important; box-sizing: border-box !important;
  cursor: pointer !important;
  contain: paint !important;
  isolation: isolate !important;
}

.inv-slot:hover {
  border-color: #8a6a1a !important;
  background: #2a2112 !important;
}

.inv-slot.is-equipped { border-color: #22c55e !important; }
.inv-slot.is-selected { border-color: #3b82f6 !important; background: #1e2a3a !important; }

.rarity-common { border-color: #8a6b2e !important; }
.rarity-uncommon { border-color: #2d5a2d !important; }
.rarity-rare { border-color: #2a4a7a !important; }
.rarity-epic { border-color: #4a2d6a !important; }
.rarity-legendary { border-color: #6a4a14 !important; }

/* Ícone do item no slot — fixo, nunca sobreposto */
.item-icon {
  display: flex !important; align-items: center !important; justify-content: center !important;
  width: 100% !important; height: 100% !important;
  overflow: hidden !important;
  contain: paint !important;
}

.inventory-item-image {
  width: 32px !important; height: 32px !important;
  max-width: 32px !important; max-height: 32px !important;
  object-fit: contain !important;
  border: none !important; display: block !important;
  margin: auto !important; padding: 0 !important;
  float: none !important;
}

.inventory-item-emoji {
  font-size: 20px !important; line-height: 1 !important;
  display: block !important;
}

.qty {
  position: absolute !important; bottom: 1px !important; right: 2px !important;
  font-size: 8px !important; color: #f0c050 !important; font-weight: bold !important;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000 !important;
}

.equipped-badge {
  position: absolute !important; top: 1px !important; right: 1px !important;
  width: 8px !important; height: 8px !important; font-size: 7px !important;
  background: #22c55e !important; color: #000 !important; border-radius: 2px !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
}

.inv-check {
  position: absolute !important; top: 1px !important; left: 1px !important;
  width: 10px !important; height: 10px !important; background: #3b82f6 !important; color: #fff !important;
  border-radius: 2px !important; font-size: 7px !important; display: flex !important;
  align-items: center !important; justify-content: center !important;
}

.inv-slot:not(.is-selected) .inv-check { display: none !important; }

/* ═══════════════ STATS / BARRA BAIXO ═══════════════ */
.l2inv-stats, .inv-stats {
  padding: 6px 8px !important; font-size: 9px !important; color: #c8a87a !important;
  background: rgba(0,0,0,.35) !important; border-top: 1px solid #3d2e14 !important;
  text-align: center !important; white-space: nowrap !important; flex: 0 0 auto !important;
}

.inv-bottom-bar {
  display: flex !important; justify-content: space-between !important; align-items: center !important;
  padding: 6px 8px !important; border-top: 1px solid #3d2e14 !important; background: #1a140e !important;
  flex: 0 0 auto !important;
}
.inv-bottom-bar .gold { color: #f0c050 !important; font-weight: 700 !important; font-size: 12px !important; }
.inv-bottom-actions button {
  padding: 3px 6px !important; font-size: 10px !important; background: #2a1e10 !important;
  border: 1px solid #5a4525 !important; color: #c8a87a !important; border-radius: 3px !important;
}

/* ═══════════════ TOOLTIP ═══════════════ */
#item-tooltip {
  position: fixed !important; z-index: 99999 !important; pointer-events: none !important;
  max-width: 300px !important; background: rgba(30,25,15,.97) !important;
  border: 1px solid #8a6b2e !important; border-radius: 6px !important;
  padding: 8px 10px !important; color: #e8d5a3 !important; font-size: 12px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,.8) !important;
}
.tooltip-header { display: flex; justify-content: space-between; align-items: center; font-weight: 700; color: #f0c050; border-bottom: 1px solid #5a4525; padding-bottom: 3px; margin-bottom: 4px; }
.tooltip-stats { color: #c8a87a; margin-top: 4px; font-size: 11px; }
.tooltip-desc { color: #a08a5a; font-size: 11px; margin-top: 4px; }

/* ═══════════════ HEADER ABAS ═══════════════ */
/* Nada aqui muda — só garante que não estoura */
.l2inv-tabs, .inventory-tabs, .l2inv-filters, .inventory-filters {
  display: flex !important; flex-wrap: wrap !important; gap: 4px !important;
  align-items: center !important; padding: 4px 6px !important;
  background: rgba(0,0,0,.4) !important; border-radius: 4px !important;
  overflow: hidden !important; flex: 0 0 auto !important;
}
.l2inv-tabs button, .inventory-tabs button, .l2inv-filters button, .inventory-filters button, #auto-sell-rarity-select {
  height: 22px !important; padding: 0 8px !important; font-size: 10px !important;
  background: #2a241c !important; border: 1px solid #5a4525 !important; color: #c8a87a !important;
  border-radius: 3px !important; cursor: pointer !important; white-space: nowrap !important;
}
#inv-search-input { height: 22px !important; font-size: 10px !important; background: #1a1611 !important; border: 1px solid #4a3a2a !important; color: #d8c8a8 !important; border-radius: 3px !important; padding: 0 6px !important; flex: 1 1 100px !important; max-width: 160px !important; }

/* ═══════════════ NORMALIZAÇÃO DE ÍCONES ═══════════════ */
.inv-slot, .equip-slot { contain: paint !important; isolation: isolate !important; overflow: hidden !important; position: relative !important; }

.item-icon { position: static !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 100% !important; height: 100% !important; overflow: hidden !important; line-height: 1 !important; }
.inventory-item-image { position: static !important; width: 32px !important; height: 32px !important; max-width: 32px !important; max-height: 32px !important; object-fit: contain !important; border: none !important; padding: 0 !important; float: none !important; transform: none !important; display: block !important; }
.inventory-item-emoji { position: static !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 20px !important; line-height: 1 !important; }

/* Tooltip fixo */
#item-tooltip {
  position: fixed !important; z-index: 99999 !important; pointer-events: none !important;
  max-width: 300px !important; background: rgba(30,25,15,.97) !important;
  border: 1px solid #8a6b2e !important; border-radius: 6px !important;
  padding: 8px 10px !important; color: #e8d5a3 !important; font-size: 12px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,.8) !important;
}
`;
