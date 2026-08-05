/**
 * InventoryUI.js — Renderização de Mochila, Baú e Equipamentos.
 * VERSÃO CORRIGIDA: Slots + Ícones + Tooltip
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, qs, qsa, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip } from './TooltipUI.js';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Ícone do item (EMOJI, não path de arquivo!)
═══════════════════════════════════════════════════════════════════════════ */

function getItemIcon(item, def) {
  if (!def) return '📦';

  // Se já for emoji, retorna
  if (def.icon && def.icon.length <= 2) return def.icon;

  // Mapeamento por slot/tipo
  const slot = (def.slot || '').toLowerCase();
  
  if (slot.includes('weapon') || slot.includes('sword') || slot.includes('bow') || slot.includes('staff')) {
    if (slot.includes('bow')) return '🏹';
    if (slot.includes('staff')) return '';
    if (slot.includes('sword')) return '🗡️';
    return '️';
  }
  
  if (slot.includes('armor') || slot.includes('chest') || slot.includes('breastplate')) return '';
  if (slot.includes('helmet') || slot.includes('head') || slot.includes('cap')) return '🪖';
  if (slot.includes('gloves') || slot.includes('hand')) return '🧤';
  if (slot.includes('boots') || slot.includes('shoes') || slot.includes('feet')) return '';
  if (slot.includes('shield')) return '🛡️';
  if (slot.includes('ring')) return '💍';
  if (slot.includes('necklace') || slot.includes('pendant')) return '📿';
  if (slot.includes('earring')) return '🎧';
  if (slot.includes('belt') || slot.includes('waist')) return '🎗️';
  if (slot.includes('cloak') || slot.includes('cape')) return '🧥';
  
  if (slot.includes('potion') || slot.includes('consumable')) return '🧪';
  if (slot.includes('scroll')) return '📜';
  if (slot.includes('material') || slot.includes('ore') || slot.includes('gem')) return '';
  if (slot.includes('quest')) return '📯';
  
  // Fallback por raridade
  const rarityIcons = {
    legendary: '',
    epic: '',
    rare: '🔵',
    uncommon: '🟢',
    common: '⚪'
  };
  return rarityIcons[item.rarity] || '📦';
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Definição do item com fallback
═══════════════════════════════════════════════════════════════════════════ */

function getItemDef(itemId) {
  const data = D();
  if (!data?.ALL_ITEMS) return null;
  return data.ALL_ITEMS[itemId] || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Busca elemento (Shadow DOM + Document)
═══════════════════════════════════════════════════════════════════════════ */

function findElement(id) {
  const host = document.getElementById('idle-host');
  const shadow = host?.shadowRoot;
  
  // Tenta no Shadow DOM primeiro
  if (shadow) {
    const el = shadow.querySelector(`#${id}`);
    if (el) return el;
  }
  
  // Tenta no document global
  return document.getElementById(id);
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVENTÁRIO PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

export function updateInventoryUI(state, callbacks = {}) {
  updateEquipmentUI(state, callbacks);

  const grid = findElement('inventory-grid');
  if (!grid) {
    console.warn('[InventoryUI] Grid do inventário não encontrado');
    return;
  }

  grid.innerHTML = '';

  const data = D();
  if (!data?.ALL_ITEMS) {
    grid.innerHTML = '<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Carregando itens...</div>';
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

  let shown = 0;
  for (const item of sorted) {
    const def = getItemDef(item.itemId);
    if (!def) continue;

    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    if (filter !== 'all') {
      const slot = (def.slot || '').toLowerCase();
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'necklace', 'shield'].includes(slot)) continue;
      if (filter === 'consumable' && !['consumable', 'potion', 'scroll', 'food'].includes(slot)) continue;
      if (filter === 'material' && !['material', 'gem', 'ore', 'craft'].includes(slot)) continue;
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    const icon = getItemIcon(item, def);
    const enchant = item.enchant ? `+${item.enchant} ` : '';
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const checkbox = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;

    slotEl.innerHTML = `
      ${checkbox}
      <span class="item-icon">${icon}</span>
      <span class="item-name">${enchant}${def.name}</span>
      ${qty}
      ${equippedTag}
    `;

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
        if (callbacks.unequipItem) callbacks.unequipItem(resolveEquipSlot(def.slot));
      } else {
        if (callbacks.equipItem) callbacks.equipItem(state, item.uid, callbacks);
      }
    };

    grid.appendChild(slotEl);
    shown++;
  }

  const cnt = findElement('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAÚ (WAREHOUSE)
═══════════════════════════════════════════════════════════════════════════ */

export function updateWarehouseUI(state, callbacks = {}) {
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
    const icon = getItemIcon(item, def);

    slotEl.className = `inv-slot rarity-${rarity}`;
    slotEl.dataset.uid = item.uid;

    const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';

    slotEl.innerHTML = `
      <span class="item-icon">${icon}</span>
      <span class="item-name">${def.name}</span>
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
   EQUIPAMENTOS ATIVOS
═══════════════════════════════════════════════════════════════════════════ */

export function updateEquipmentUI(state, callbacks = {}) {
  if (!state) return;
  state.equipment = state.equipment || {};

  const slotLabels = {
    weapon: 'Arma',
    armor: 'Armadura',
    helmet: 'Elmo',
    gloves: 'Luvas',
    boots: 'Botas',
    shield: 'Escudo',
    ring: 'Anel',
    ring2: 'Anel 2',
    necklace: 'Colar',
    earring: 'Brinco',
    earring2: 'Brinco 2',
    belt: 'Cinto',
    cloak: 'Capa'
  };

  const slotIcons = {
    weapon: '⚔️',
    armor: '',
    helmet: '',
    gloves: '🧤',
    boots: '👢',
    shield: '🛡️',
    ring: '💍',
    necklace: '📿',
    earring: '🎧',
    belt: '🎗️',
    cloak: '🧥'
  };

  for (const slot of ALL_EQUIP_SLOTS) {
    // Tenta múltiplos padrões de ID
    const slotEl = 
      findElement(`equip-slot-${slot}`) ||
      findElement(`equipment-${slot}`) ||
      findElement(`equip-${slot}`) ||
      findElement(`slot-${slot}`);

    if (!slotEl) {
      // Silencioso - não spammar console se o slot não existir ainda
      continue;
    }

    const uid = state.equipment[slot];
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def = item ? getItemDef(item.itemId) : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      const icon = getItemIcon(item, def);

      slotEl.className = `equip-slot active rarity-${rarity}`;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;

      slotEl.innerHTML = `
        <span class="equip-icon">${icon}</span>
        <span class="equip-label">${slotLabels[slot] || slot}</span>
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
      slotEl.innerHTML = `
        <span class="equip-placeholder">${slotIcons[slot] || '📦'}</span>
        <span class="equip-label">${slotLabels[slot] || slot}</span>
      `;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════════════ */

const STYLE_ID = 'inventory-ui-styles';

export function ensureInventoryStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;
  if (target.querySelector(`#${STYLE_ID}`)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = INVENTORY_CSS;
  target.appendChild(style);
}

const INVENTORY_CSS = `
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
  transition: all 0.15s;
  overflow: hidden;
}

.inv-slot:hover {
  border-color: #f59e0b;
  transform: scale(1.05);
}

.inv-slot.is-equipped {
  border-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.inv-slot.is-selected {
  border-color: #3b82f6;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
}

.rarity-common { border-color: #9ca3af; }
.rarity-uncommon { border-color: #22c55e; }
.rarity-rare { border-color: #3b82f6; }
.rarity-epic { border-color: #a855f7; }
.rarity-legendary { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }

.item-icon { font-size: 28px; z-index: 2; }

.item-name {
  font-size: 8px;
  color: #e5e7eb;
  text-align: center;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
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
  background: rgba(0,0,0,0.6);
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

.equip-slot {
  width: 56px;
  height: 56px;
  border: 2px solid #444;
  border-radius: 6px;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.equip-slot.active {
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}

.equip-slot.empty {
  opacity: 0.5;
  cursor: default;
}

.equip-icon { font-size: 28px; }
.equip-label { font-size: 7px; color: #9ca3af; margin-top: 2px; }
.equip-placeholder { font-size: 24px; opacity: 0.4; }
`;
