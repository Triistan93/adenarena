/**
 * InventoryUI.js — Renderização de Mochila, Baú e Paperdoll de Equipamentos.
 *
 * Paperdoll de 18 slots alinhado ao template real (.l2inv-doll-col):
 * weapon, shield, helmet, armor, gloves, legs, boots, cloak, belt,
 * necklace, earring1, earring2, ring, ring2, hair, hair2, agathion, talisman
 *
 * Interações:
 *   Clique esquerdo no item  → selecionar
 *   Clique direito no item   → equipar / desequipar
 *   Duplo clique no item     → usar (consumíveis)
 *   Clique no slot equipado  → desequipar
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, qs, qsa, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';

/* ═══════════════════════════════════════════════════════════════════════════
   DOM HELPERS
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
   DEFINIÇÃO DO ITEM (com variações de ID)
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
  return Object.values(data.ALL_ITEMS).find(
    i => i.name?.toLowerCase().replace(/\s+/g, '') === normalized
  ) || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ÍCONE DO ITEM
   Aceita getItemIcon retornando: HTML de <img>, URL/caminho, ou emoji.
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

function renderItemIcon(item, def) {
  let icon = '';

  try {
    icon = getItemIcon(def || item) || '';
  } catch (error) {
    console.warn('[InventoryUI] Erro em getItemIcon:', item?.itemId, error);
  }

  if (icon instanceof HTMLElement) return icon.outerHTML;

  const value = String(icon).trim();
  const fallback = EMOJI_BY_SLOT[(def?.slot || '').toLowerCase()] || '📦';

  if (!value) {
    return `<span class="inventory-item-emoji">${fallback}</span>`;
  }

  // getItemIcon já retornou HTML (<img ...>)
  if (value.startsWith('<')) return value;

  // getItemIcon retornou caminho/URL
  const isImagePath =
    /^(?:https?:|data:image|blob:|\/|\.{1,2}\/|img\/)/i.test(value) ||
    /\.(?:png|webp|jpe?g|gif|svg)(?:\?.*)?$/i.test(value);

  if (isImagePath) {
    const alt = escapeHTML(def?.name || item?.itemId || 'Item');
    return `
      <img class="inventory-item-image" src="${escapeHTML(value)}" alt="${alt}"
           draggable="false" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='inline-block');" />
      <span class="inventory-item-emoji" style="display:none;">${fallback}</span>
    `;
  }

  // Emoji ou texto curto
  return `<span class="inventory-item-emoji">${escapeHTML(value)}</span>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAPERDOLL — mapa dos 18 slots reais do template
═══════════════════════════════════════════════════════════════════════════ */

const PAPERDOLL_AREAS = {
  hair2: 'hair2',     helmet: 'helmet',   necklace: 'necklace', talisman: 'talisman',
  shield: 'shield',   hair: 'hair',       earring1: 'earring1', agathion: 'agathion',
  weapon: 'weapon',   armor: 'armor',     earring2: 'earring2', cloak: 'cloak',
  gloves: 'gloves',   legs: 'legs',       ring: 'ring',         belt: 'belt',
  boots: 'boots',                         ring2: 'ring2'
};

const SLOT_LABELS = {
  weapon: 'Arma', shield: 'Escudo', armor: 'Armadura', helmet: 'Elmo',
  gloves: 'Luvas', legs: 'Calças', boots: 'Botas', cloak: 'Capa', belt: 'Cinto',
  necklace: 'Colar', earring1: 'Brinco', earring2: 'Brinco 2',
  ring: 'Anel', ring2: 'Anel 2',
  hair: 'Cabelo', hair2: 'Máscara', agathion: 'Agathion', talisman: 'Talismã'
};

const SLOT_ICONS = {
  weapon: '⚔️', shield: '🛡️', armor: '🦺', helmet: '🪖',
  gloves: '🧤', legs: '👖', boots: '👢', cloak: '🧥', belt: '🎗️',
  necklace: '📿', earring1: '💎', earring2: '💎', ring: '💍', ring2: '💍',
  hair: '👑', hair2: '🎭', agathion: '👼', talisman: '🧿'
};

const EQUIPMENT_SLOT_ALIASES = {
  weapon:   ['weapon', 'mainhand'],
  shield:   ['shield', 'offhand', 'sigil'],
  armor:    ['armor', 'chest', 'body'],
  helmet:   ['helmet', 'helm', 'head'],
  gloves:   ['gloves', 'glove', 'hands'],
  legs:     ['legs', 'pants', 'gaiters'],
  boots:    ['boots', 'boot', 'feet'],
  cloak:    ['cloak', 'cape', 'back'],
  belt:     ['belt', 'waist'],
  necklace: ['necklace', 'neck', 'pendant'],
  earring1: ['earring1', 'earring'],
  earring2: ['earring2'],
  ring:     ['ring', 'ring1'],
  ring2:    ['ring2'],
  hair:     ['hair', 'headgear'],
  hair2:    ['hair2', 'mask'],
  agathion: ['agathion'],
  talisman: ['talisman']
};

const _warnedMissingSlots = new Set();

function findEquipmentSlot(slot) {
  const root = invRoot();
  const aliases = EQUIPMENT_SLOT_ALIASES[slot] || [slot];

  for (const alias of aliases) {
    const selectors = [
      `#equip-slot-${alias}`,
      `#equipment-slot-${alias}`,
      `#equip-${alias}`,
      `[data-slot="${alias}"]`,
      `[data-equip-slot="${alias}"]`
    ];
    for (const sel of selectors) {
      try {
        const found = root.querySelector(sel);
        if (found) return found;
      } catch { /* seletor inválido */ }
    }
  }
  return null;
}

/**
 * Organiza os slots em grade 4x5 estilo paperdoll dentro de .l2inv-doll-col.
 */
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

  // Move todos os slots soltos do painel para dentro da grade
  const looseSlots = [...panel.querySelectorAll('[data-slot], [id^="equip-slot-"]')]
    .filter(slotEl => slotEl.id !== 'paperdoll-grid' && !slotEl.closest('#paperdoll-grid'));

  for (const slotEl of looseSlots) {
    grid.appendChild(slotEl);
  }

  // Posiciona os 18 gerenciados; esconde qualquer coisa fora da lista
  grid.querySelectorAll('[data-slot], [id^="equip-slot-"]').forEach(slotEl => {
    const slotName = slotEl.dataset.slot || slotEl.id.replace('equip-slot-', '');
    if (PAPERDOLL_AREAS[slotName]) {
      slotEl.style.gridArea = PAPERDOLL_AREAS[slotName];
      slotEl.style.display = '';
    } else {
      slotEl.style.display = 'none';
    }
  });

  return grid;
}

function createEquipmentSlotDynamically(slot) {
  const grid = ensurePaperdollLayout();
  if (!grid) return null;

  const slotEl = document.createElement('div');
  slotEl.id = `equip-slot-${slot}`;
  slotEl.className = 'equip-slot empty';
  slotEl.dataset.slot = slot;
  slotEl.style.gridArea = PAPERDOLL_AREAS[slot] || 'auto';
  grid.appendChild(slotEl);
  return slotEl;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVENTÁRIO PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

export function updateInventoryUI(state, callbacks = {}) {
  ensureInventoryStyles();
  updateEquipmentUI(state, callbacks);

  const grid = findElement('inventory-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const data = D();
  if (!data?.ALL_ITEMS) {
    grid.innerHTML = '<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Dados de itens não carregados</div>';
    return;
  }

  const selectedSet = getSelectedSet(state);
  const filter = state.inventoryFilter || state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter = state.equipFilter || 'all';

  // Auto-venda
  const autoSellSel = findElement('auto-sell-rarity-select');
  if (autoSellSel) {
    autoSellSel.value = state.autoSellRarity || 'off';
    autoSellSel.onchange = (e) => {
      state.autoSellRarity = e.target.value;
      if (callbacks.log) callbacks.log(`⚙️ Auto-Venda: ${e.target.value.toUpperCase()}`, 'system');
      if (callbacks.save) callbacks.save();
    };
  }

  // Busca
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

    // Filtro por categoria (aceita nomes das abas PT e EN)
    const defSlot = (def.slot || '').toLowerCase();
    if (filter !== 'all') {
      const f = filter.toLowerCase();
      if ((f === 'gear' || f === 'equip') && !GEAR_SLOTS.includes(defSlot)) continue;
      if ((f === 'consumable' || f === 'supplies') && !CONSUMABLE_SLOTS.includes(defSlot)) continue;
      if ((f === 'material' || f === 'crafting') && !MATERIAL_SLOTS.includes(defSlot)) continue;
      if (f === 'quest' && defSlot !== 'quest' && defSlot !== 'scroll') continue;
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    const enchant = item.enchant ? `+${item.enchant} ` : '';
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const checkbox = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;
    slotEl.dataset.itemId = item.itemId;

    slotEl.innerHTML = `
      ${checkbox}
      <span class="item-icon">${renderItemIcon(item, def)}</span>
      <span class="item-name" title="${escapeHTML(def.name)}">${enchant}${escapeHTML(def.name)}</span>
      ${qty}
      ${equippedTag}
    `;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();

    // Clique esquerdo: selecionar
    slotEl.onclick = (e) => {
      e.stopPropagation();
      if (callbacks.toggleSelectItem) {
        callbacks.toggleSelectItem(item.uid);
        updateInventoryUI(state, callbacks);
      }
    };

    // Clique direito: equipar / desequipar
    slotEl.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.equipped) {
        if (callbacks.unequipItem) {
          callbacks.unequipItem(state, item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), callbacks);
        }
      } else if (callbacks.equipItem) {
        callbacks.equipItem(state, item.uid, callbacks);
      }
    };

    // Duplo clique: usar consumível
    slotEl.ondblclick = (e) => {
      e.stopPropagation();
      if (CONSUMABLE_SLOTS.includes(defSlot) && callbacks.useItem) {
        callbacks.useItem(item.uid);
      }
    };

    grid.appendChild(slotEl);
  }

  const cnt = findElement('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAÚ (WAREHOUSE)
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
      <span class="item-name" title="${escapeHTML(def.name)}">${escapeHTML(def.name)}</span>
      ${countBadge}
    `;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();
    slotEl.onclick = () => {
      if (callbacks.withdrawFromWarehouse) callbacks.withdrawFromWarehouse(item.uid);
    };

    container.appendChild(slotEl);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   EQUIPAMENTOS (PAPERDOLL)
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
        console.warn(`[InventoryUI] Slot de equipamento não encontrado: ${slot}`);
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

      slotEl.innerHTML = `
        <span class="equip-icon">${renderItemIcon(item, def)}</span>
        <span class="equip-label">${SLOT_LABELS[slot] || slot}</span>
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
        <span class="equip-label">${SLOT_LABELS[slot] || slot}</span>
      `;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════════════ */

const STYLE_ID = 'inventory-ui-styles-final';

export function ensureInventoryStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;

  // Remove versões antigas
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
/* ═══════════════ PAPERDOLL (grade 4x5) ═══════════════ */

#paperdoll-grid {
  display: grid;
  grid-template-columns: repeat(4, 62px);
  grid-template-rows: repeat(5, 62px);
  gap: 8px;
  justify-content: center;
  padding: 12px 8px;
  box-sizing: border-box;
  grid-template-areas:
    "hair2   helmet   necklace  talisman"
    "shield  hair     earring1  agathion"
    "weapon  armor    earring2  cloak"
    "gloves  legs     ring      belt"
    "boots   .        ring2     .";
}

.equip-slot {
  position: relative;
  width: 62px;
  height: 62px;
  border: 2px solid #3a3a4a;
  border-radius: 8px;
  background: linear-gradient(180deg, #1e1e30, #14141f);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  overflow: hidden;
  box-sizing: border-box;
}

.equip-slot.empty {
  cursor: default;
  opacity: .75;
}

.equip-slot.empty:hover {
  border-color: #5a5a6e;
}

.equip-slot.active {
  opacity: 1;
  border-color: #c9a227;
  box-shadow: 0 0 10px rgba(201, 162, 39, .35);
}

.equip-slot.active:hover {
  transform: scale(1.06);
  border-color: #f59e0b;
}

.equip-slot.rarity-uncommon  { border-color: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,.35); }
.equip-slot.rarity-rare      { border-color: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,.35); }
.equip-slot.rarity-epic      { border-color: #a855f7; box-shadow: 0 0 8px rgba(168,85,247,.4); }
.equip-slot.rarity-legendary { border-color: #f59e0b; box-shadow: 0 0 12px rgba(245,158,11,.5); }

.equip-icon {
  font-size: 26px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 3px rgba(0,0,0,.6));
}

.equip-icon .inventory-item-image,
.equip-icon img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.equip-placeholder {
  font-size: 22px;
  opacity: .35;
  filter: grayscale(1);
  line-height: 1;
}

.equip-label {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  font-size: 7px;
  color: #8b93a7;
  text-transform: uppercase;
  text-align: center;
  letter-spacing: .04em;
  pointer-events: none;
  line-height: 1;
}

.equip-slot.active .equip-label {
  color: #c9a227;
}

/* ═══════════════ MOCHILA / BAÚ ═══════════════ */

.inv-slot {
  position: relative;
  width: 64px;
  height: 64px;
  border: 2px solid #444;
  border-radius: 6px;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color .15s, transform .15s, box-shadow .15s;
  overflow: hidden;
  box-sizing: border-box;
}

.inv-slot:hover {
  border-color: #f59e0b;
  transform: scale(1.05);
}

.inv-slot.is-equipped {
  border-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, .4);
}

.inv-slot.is-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 12px rgba(59, 130, 246, .5);
}

.inv-slot.rarity-common    { border-color: #9ca3af; }
.inv-slot.rarity-uncommon  { border-color: #22c55e; }
.inv-slot.rarity-rare      { border-color: #3b82f6; }
.inv-slot.rarity-epic      { border-color: #a855f7; }
.inv-slot.rarity-legendary { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,.4); }

.item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  z-index: 1;
}

.inventory-item-image {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.inventory-item-emoji {
  font-size: 26px;
  line-height: 1;
}

.item-name {
  font-size: 7px;
  color: #e5e7eb;
  text-align: center;
  max-width: 95%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 3px;
  line-height: 1.1;
  text-transform: uppercase;
}

.qty {
  position: absolute;
  bottom: 2px;
  right: 4px;
  font-size: 10px;
  color: #fbbf24;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
}

.equipped-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  color: #22c55e;
  font-weight: bold;
  background: rgba(0,0,0,.6);
  padding: 1px 3px;
  border-radius: 3px;
}

.slot-select-checkbox {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 12px;
  color: #3b82f6;
  font-weight: bold;
}
`;
