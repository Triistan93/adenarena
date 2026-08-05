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
import { showItemTooltip, hideItemTooltip, getItemIcon, getItemIconUrl } from './TooltipUI.js';

const INVENTORY_STYLE_ID = 'inventory-ui-styles';
const reportedMissingSlots = new Set();

function styleTarget() {
  const host = document.getElementById('idle-host');
  return host?.shadowRoot || document.head;
}

export function ensureInventoryStyles() {
  const root = styleTarget();
  if (!root || root.getElementById?.(INVENTORY_STYLE_ID) || root.querySelector?.(`#${INVENTORY_STYLE_ID}`)) return;

  const tag = document.createElement('style');
  tag.id = INVENTORY_STYLE_ID;
  tag.textContent = `
    /* === INVENTORY & EQUIPMENT SHADOW DOM STYLES === */
    #inventory-grid, .inventory-grid, .l2inv-slots-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, 64px) !important;
      grid-auto-rows: 64px !important;
      gap: 6px !important;
      padding: 6px !important;
      box-sizing: border-box !important;
      overflow-y: auto !important;
      max-height: 480px !important;
    }

    .inv-slot {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px !important;
      max-width: 64px !important;
      min-height: 64px !important;
      max-height: 64px !important;
      box-sizing: border-box !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      padding: 3px !important;
      background: linear-gradient(135deg, rgba(28,22,16,0.95), rgba(12,8,5,0.98)) !important;
      border: 1px solid #3c2e1e !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      user-select: none !important;
      transition: border-color 0.15s, box-shadow 0.15s !important;
    }

    .inv-slot:hover {
      border-color: #e8c37a !important;
      box-shadow: 0 0 8px rgba(232, 195, 122, 0.4) !important;
      z-index: 2 !important;
    }

    .inv-slot img, .inv-slot .item-icon-img, .equip-slot img, .equip-slot .item-icon-img {
      width: 30px !important;
      height: 30px !important;
      max-width: 30px !important;
      max-height: 30px !important;
      object-fit: contain !important;
      pointer-events: none !important;
      display: block !important;
      margin: 0 auto !important;
    }

    .inv-slot .item-icon-fallback, .equip-slot .item-icon-fallback {
      font-size: 20px !important;
      line-height: 1 !important;
      pointer-events: none !important;
    }

    .inv-slot .name {
      font-size: 8px !important;
      line-height: 1.1 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      max-width: 58px !important;
      text-align: center !important;
      margin-top: 2px !important;
      color: #d4c096 !important;
      pointer-events: none !important;
      display: block !important;
    }

    .inv-slot .qty {
      position: absolute !important;
      bottom: 2px !important;
      right: 3px !important;
      font-size: 9px !important;
      font-weight: 700 !important;
      color: #f59e0b !important;
      text-shadow: 0 1px 2px #000 !important;
      pointer-events: none !important;
    }

    .inv-slot .equipped-badge, .equip-slot .equipped-badge {
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      background: #f59e0b !important;
      color: #000 !important;
      font-size: 8px !important;
      font-weight: 800 !important;
      padding: 1px 3px !important;
      border-radius: 2px !important;
      line-height: 1 !important;
      pointer-events: none !important;
    }

    .inv-slot .slot-select-checkbox {
      position: absolute !important;
      top: 2px !important;
      left: 2px !important;
      font-size: 9px !important;
      color: #10b981 !important;
      font-weight: bold !important;
      pointer-events: none !important;
    }

    /* Raridades de Borda */
    .inv-slot.rarity-common, .equip-slot.rarity-common { border-color: #4b5563 !important; }
    .inv-slot.rarity-uncommon, .equip-slot.rarity-uncommon { border-color: #10b981 !important; }
    .inv-slot.rarity-rare, .equip-slot.rarity-rare { border-color: #3b82f6 !important; }
    .inv-slot.rarity-epic, .equip-slot.rarity-epic { border-color: #8b5cf6 !important; }
    .inv-slot.rarity-legendary, .equip-slot.rarity-legendary { border-color: #f59e0b !important; box-shadow: 0 0 6px rgba(245, 158, 11, 0.4) !important; }

    .inv-slot.is-equipped {
      border-color: #10b981 !important;
      background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(12,8,5,0.98)) !important;
    }

    .inv-slot.is-selected {
      border-color: #f59e0b !important;
      box-shadow: inset 0 0 0 1px #f59e0b, 0 0 8px rgba(245, 158, 11, 0.5) !important;
    }

    /* Painel de Equipamentos (Paper-doll / Slots) */
    .doll-slots, #equipment-grid, .equipment-grid, .l2inv-paperdoll-grid {
      display: grid !important;
      grid-template-columns: repeat(2, 56px) !important;
      gap: 6px !important;
      justify-content: center !important;
      padding: 4px !important;
    }

    .equip-slot {
      width: 56px !important;
      height: 56px !important;
      min-width: 56px !important;
      max-width: 56px !important;
      min-height: 56px !important;
      max-height: 56px !important;
      box-sizing: border-box !important;
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      padding: 2px !important;
      background: linear-gradient(135deg, rgba(30,22,14,0.9), rgba(10,7,4,0.95)) !important;
      border: 1px solid #3e2e1c !important;
      border-radius: 4px !important;
      cursor: pointer !important;
      transition: all 0.15s !important;
    }

    .equip-slot:hover {
      border-color: #e8c37a !important;
      transform: scale(1.03) !important;
    }

    .equip-slot .equip-placeholder-icon {
      font-size: 18px !important;
      opacity: 0.5 !important;
    }

    .equip-slot .equip-placeholder-label {
      font-size: 7px !important;
      color: #9ca3af !important;
      margin-top: 1px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
    }

    .equip-slot .slot-item-name {
      display: none !important;
    }
  `;
  root.appendChild(tag);
}

function findEquipSlotElement(slot) {
  const root = styleTarget();
  const aliases = [slot];
  if (slot === 'cape') aliases.push('cloak');
  if (slot === 'cloak') aliases.push('cape');
  if (slot === 'earring') aliases.push('earring1', 'earring2');

  for (const s of aliases) {
    const candidates = [
      `#equip-slot-${s}`,
      `#equip-${s}`,
      `#pd-slot-${s}`,
      `[data-slot="${s}"]`,
      `.equip-slot[data-slot="${s}"]`,
      `.l2inv-pd-slot[data-slot="${s}"]`
    ];
    for (const sel of candidates) {
      const found = root.querySelector(sel);
      if (found) return found;
    }
  }

  if (!reportedMissingSlots.has(slot)) {
    reportedMissingSlots.add(slot);
    console.warn(`[InventoryUI] Slot element not found in Shadow DOM for equipment slot: "${slot}"`);
  }
  return null;
}

/**
 * Atualiza a interface da Mochila (Inventário) e contador de slots.
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function updateInventoryUI(state, callbacks = {}) {
  ensureInventoryStyles();
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

  for (const item of sorted) {
    const def = D()?.ALL_ITEMS?.[item.itemId];
    if (!def) continue;
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    if (filter !== 'all') {
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'earring', 'necklace', 'cloak', 'belt'].includes(def.slot)) continue;
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

    slot.innerHTML = `${checkHtml}${getItemIcon(item)}<span class="name">${enchantStr}${def.name}</span>${qty}${tag}`;

    slot.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slot.onmouseleave = () => hideItemTooltip();

    slot.onclick = (e) => {
      e.stopPropagation();
      if (callbacks.toggleSelectItem) callbacks.toggleSelectItem(item.uid);
      updateInventoryUI(state, callbacks);
    };

    slot.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideItemTooltip();

      if (callbacks.equipItem) {
        if (callbacks.equipItem.length >= 2) {
          callbacks.equipItem(state, item.uid, callbacks);
        } else {
          callbacks.equipItem(item.uid);
        }
      } else if (typeof window.equipItem === 'function') {
        window.equipItem(item.uid);
      }
    };

    grid.appendChild(slot);
  }

  const cnt = el('inv-count') || el('inv-slots');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory.length} / ${maxSlots}`;
}

/**
 * Atualiza a interface do Baú (Warehouse).
 * @param {Object} state
 * @param {Object} [callbacks]
 */
export function updateWarehouseUI(state, callbacks = {}) {
  ensureInventoryStyles();
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
      ${getItemIcon(item)}
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
  ensureInventoryStyles();

  const defaultSlotIcons = {
    weapon: '⚔️', armor: '🛡️', helmet: '⛑️', gloves: '🧤', boots: '👢',
    ring: '💍', earring: '💎', necklace: '📿', cape: '🧥', cloak: '🧥', belt: '🪢'
  };

  for (const slot of ALL_EQUIP_SLOTS) {
    const slotEl = findEquipSlotElement(slot);
    if (!slotEl) continue;

    const uid = state.equipment ? state.equipment[slot] : null;
    const item = uid ? state.inventory.find(i => i.uid === uid) : null;
    const def = item ? D()?.ALL_ITEMS?.[item.itemId] : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      const enchantStr = item.enchant ? `+${item.enchant} ` : '';

      slotEl.className = `equip-slot active has-item rarity-${rarity}`;
      slotEl.title = `${enchantStr}${def.name} (${slot})`;
      slotEl.innerHTML = `
        <span class="equip-icon">${getItemIcon(item)}</span>
        <span class="equipped-badge">E</span>
      `;
      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = (e) => {
        e.stopPropagation();
        hideItemTooltip();
        if (callbacks.unequipItem) {
          if (callbacks.unequipItem.length >= 2) {
            callbacks.unequipItem(state, slot, callbacks);
          } else {
            callbacks.unequipItem(slot);
          }
        } else if (typeof window.unequipItem === 'function') {
          window.unequipItem(slot);
        }
      };
    } else {
      const emoji = defaultSlotIcons[slot] || '📦';
      slotEl.className = 'equip-slot empty';
      slotEl.title = `${slot} (vazio)`;
      slotEl.innerHTML = `
        <span class="equip-placeholder-icon">${emoji}</span>
        <span class="equip-placeholder-label">${slot.toUpperCase()}</span>
      `;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}
