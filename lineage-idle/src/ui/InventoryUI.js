/**
 * InventoryUI.js — Renderização de Mochila, Baú e Equipamentos no Lineage Idle.
 *
 * Responsável por desenhar os grids de itens da mochila e do baú (Warehouse),
 * atualizar slots de equipamentos ativos e gerenciar estados visuais de seleção.
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, qs, qsa, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';

/**
 * Atualiza a interface da Mochila (Inventário) e contador de slots.
 * @param {Object} state
 * @param {Object} [callbacks] — { equipItem, sellItem, salvageItem, useItem, toggleSelectItem, depositToWarehouse }
 */
export function updateInventoryUI(state, callbacks = {}) {
  updateEquipmentUI(state, callbacks);
  const grid = el('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const selectedSet = getSelectedSet(state);
  const filter = state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter = state.equipFilter || 'all';

  const autoSellSel = el('auto-sell-rarity-select');
  if (autoSellSel) {
    autoSellSel.value = state.autoSellRarity || 'off';
    autoSellSel.onchange = (e) => {
      state.autoSellRarity = e.target.value;
      if (callbacks.log) callbacks.log(`⚙️ Auto-Venda configurado para: ${e.target.value.toUpperCase()}`, 'system');
      if (callbacks.save) callbacks.save();
    };
  }

  const searchInput = el('inv-search-input');
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();

  const sorted = [...state.inventory]
    .filter(i => i && i.itemId && D()?.ALL_ITEMS?.[i.itemId])
    .sort((a, b) => {
      const da = D().ALL_ITEMS[a.itemId], db = D().ALL_ITEMS[b.itemId];
      if (!da || !db) return 0;
      return (db.tier || 0) - (da.tier || 0);
    });

  let shown = 0;
  for (const item of sorted) {
    const def = D()?.ALL_ITEMS?.[item.itemId];
    if (!def) continue;
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    if (filter !== 'all') {
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring'].includes(def.slot)) continue;
      else if (filter === 'consumable' && !['consumable', 'potion', 'scroll', 'powerup'].includes(def.slot)) continue;
      else if (filter === 'material' && !['material', 'gem', 'craft'].includes(def.slot)) continue;
      else if (filter === 'scroll' && !['scroll', 'quest'].includes(def.slot)) continue;
      else if (!['gear', 'consumable', 'material', 'scroll'].includes(filter) && def.slot !== filter) continue;
    }

    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    const slot = mkEl('div');
    slot.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const tag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const enchantStr = item.enchant ? `+${item.enchant} ` : '';
    const checkHtml = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;

    slot.innerHTML = `${checkHtml}<span style="font-size:18px">${getItemIcon(item)}</span><span class="name">${enchantStr}${def.name}</span>${qty}${tag}`;

    slot.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slot.onmouseleave = () => hideItemTooltip();

    slot.onclick = (e) => {
      e.stopPropagation();
      if (callbacks.toggleSelectItem) callbacks.toggleSelectItem(item.uid);
      updateInventoryUI(state, callbacks);
    };

    grid.appendChild(slot);
    shown++;
  }

  const cnt = el('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory.length} / ${maxSlots} slots`;
}

/**
 * Atualiza a interface do Baú (Warehouse).
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function updateWarehouseUI(state, callbacks = {}) {
  const container = el('warehouse-grid');
  const countEl = el('warehouse-slot-count');
  if (!container) return;

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();
  if (countEl) countEl.textContent = `${state.warehouse.length} / ${maxSlots}`;

  container.innerHTML = '';

  for (const item of state.warehouse) {
    const def = D()?.ALL_ITEMS?.[item.itemId];
    if (!def) continue;

    const slotEl = mkEl('div');
    const rarity = item.rarity || 'common';

    slotEl.className = `inv-slot rarity-${rarity}`;
    slotEl.dataset.uid = item.uid;

    const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';

    slotEl.innerHTML = `
      <span style="font-size:18px">${getItemIcon(item)}</span>
      <span class="name">${def.name}</span>
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

/**
 * Atualiza a interface de Equipamentos ativos do personagem.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function updateEquipmentUI(state, callbacks = {}) {
  for (const slot of ALL_EQUIP_SLOTS) {
    const slotEl = el(`equip-slot-${slot}`);
    if (!slotEl) continue;

    const uid = state.equipment[slot];
    const item = uid ? state.inventory.find(i => i.uid === uid) : null;
    const def = item ? D()?.ALL_ITEMS?.[item.itemId] : null;

    if (item && def) {
      slotEl.className = `equip-slot active rarity-${item.rarity || 'common'}`;
      slotEl.innerHTML = `<span class="equip-icon">${getItemIcon(item)}</span>`;
      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => {
        if (callbacks.unequipItem) callbacks.unequipItem(slot);
      };
    } else {
      slotEl.className = 'equip-slot empty';
      slotEl.innerHTML = `<span class="equip-placeholder">${slot.substring(0, 3).toUpperCase()}</span>`;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}

