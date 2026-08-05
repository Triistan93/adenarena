/**
 * InventoryUI.js — Renderização de Mochila, Baú e Equipamentos.
 * VERSÃO CORRIGIDA:装备系统修复 + 图标修复 + 属性计算修复
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, qs, qsa, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot, equipItemToSlot } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';
import { calculateStats } from '../engine/StatsEngine.js';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Obtém definição do item com fallback seguro
═══════════════════════════════════════════════════════════════════════════ */

function getItemDef(itemId) {
  const data = D();
  if (!data || !data.ALL_ITEMS) {
    console.warn('[InventoryUI] D() ou ALL_ITEMS não disponível');
    return null;
  }
  return data.ALL_ITEMS[itemId] || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Ícone do item (prioridade: icon > sprite > fallback)
═══════════════════════════════════════════════════════════════════════════ */

function resolveItemIcon(item, def) {
  if (!item || !def) return '📦';

  // 1. Ícone explícito na definição
  if (def.icon) return def.icon;

  // 2. Ícone por tipo/slot
  const iconMap = {
    weapon: '️',
    sword: '🗡️',
    bow: '',
    staff: '',
    armor: '',
    chest: '',
    helmet: '',
    gloves: '',
    boots: '',
    shield: '️',
    ring: '💍',
    necklace: '📿',
    earring: '🎧',
    belt: '🎗️',
    cloak: '🧥',
    consumable: '🧪',
    potion: '🍶',
    scroll: '📜',
    material: '',
    gem: '',
    craft: '⚙️',
    quest: '📯'
  };

  const slot = (def.slot || '').toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (slot.includes(key)) return icon;
  }

  // 3. Fallback por raridade
  const rarityIcons = {
    legendary: '',
    epic: '',
    rare: '🟢',
    uncommon: '🟡',
    common: '⚪'
  };
  return rarityIcons[item.rarity] || '📦';
}

/* ══════════════════════════════════════════════════════════════════════════
   HELPER: Formata nome com enchant e raridade
═══════════════════════════════════════════════════════════════════════════ */

function formatItemName(item, def) {
  const enchant = item.enchant ? `+${item.enchant} ` : '';
  const prefix = {
    legendary: '【LEG】',
    epic: '【EPIC】',
    rare: '【RARE】',
    uncommon: '【UNCOMMON】'
  }[item.rarity] || '';

  return `${enchant}${prefix}${def.name}`.trim();
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVENTÁRIO PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

export function updateInventoryUI(state, callbacks = {}) {
  // Atualiza equipamentos primeiro (para stats)
  updateEquipmentUI(state, callbacks);

  const grid = el('inventory-grid');
  if (!grid) {
    console.error('[InventoryUI] Grid do inventário não encontrado');
    return;
  }

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
  const autoSellSel = el('auto-sell-rarity-select');
  if (autoSellSel) {
    autoSellSel.value = state.autoSellRarity || 'off';
    autoSellSel.onchange = (e) => {
      state.autoSellRarity = e.target.value;
      if (callbacks.log) callbacks.log(`⚙️ Auto-Venda: ${e.target.value.toUpperCase()}`, 'system');
      if (callbacks.save) callbacks.save();
    };
  }

  // Busca
  const searchInput = el('inv-search-input');
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();

  // Ordena por tier/raridade
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
    if (!def) {
      console.warn('[InventoryUI] Item sem definição:', item.itemId);
      continue;
    }

    // Filtro de busca
    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    // Filtro por tipo
    if (filter !== 'all') {
      const slot = (def.slot || '').toLowerCase();
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'necklace', 'shield'].includes(slot)) continue;
      if (filter === 'consumable' && !['consumable', 'potion', 'scroll', 'food'].includes(slot)) continue;
      if (filter === 'material' && !['material', 'gem', 'ore', 'craft'].includes(slot)) continue;
      if (filter === 'scroll' && !['scroll', 'enchant', 'quest'].includes(slot)) continue;
    }

    // Filtro por raridade
    const rarity = item.rarity || 'common';
    if (rarityFilter !== 'all' && rarity !== rarityFilter) continue;

    // Filtro por equipado
    if (equipFilter === 'equipped' && !item.equipped) continue;
    if (equipFilter === 'bag' && item.equipped) continue;

    const isSelected = selectedSet.has(item.uid);
    const icon = resolveItemIcon(item, def);
    const name = formatItemName(item, def);
    const qty = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? `<span class="equipped-badge">E</span>` : '';
    const checkbox = `<div class="slot-select-checkbox">${isSelected ? '✓' : ''}</div>`;

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;
    slotEl.dataset.itemId = item.itemId;

    slotEl.innerHTML = `
      ${checkbox}
      <span class="item-icon" style="font-size:24px">${icon}</span>
      <span class="item-name">${name}</span>
      ${qty}
      ${equippedTag}
    `;

    // Tooltip
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

    // Clique direito / Context menu: equipar
    slotEl.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (item.equipped) {
        // Já equipado → desequipar
        if (callbacks.unequipItem) {
          const slot = resolveEquipSlot(def);
          callbacks.unequipItem(slot);
        }
      } else {
        // Não equipado → tentar equipar
        const targetSlot = resolveEquipSlot(def);
        if (targetSlot && callbacks.equipItem) {
          callbacks.equipItem(item.uid, targetSlot);
        } else {
          console.warn('[InventoryUI] Slot inválido para:', def.slot);
        }
      }
    };

    // Duplo clique: usar (consumíveis)
    slotEl.ondblclick = (e) => {
      e.stopPropagation();
      if (['consumable', 'potion', 'scroll', 'food'].includes((def.slot || '').toLowerCase())) {
        if (callbacks.useItem) callbacks.useItem(item.uid);
      }
    };

    grid.appendChild(slotEl);
    shown++;
  }

  // Contador de slots
  const cnt = el('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;

  // Atualiza stats após renderizar
  if (callbacks.updateStats) callbacks.updateStats();
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAÚ (WAREHOUSE)
═══════════════════════════════════════════════════════════════════════════ */

export function updateWarehouseUI(state, callbacks = {}) {
  const container = el('warehouse-grid');
  const countEl = el('warehouse-slot-count');

  if (!container) {
    console.warn('[InventoryUI] Container do baú não encontrado');
    return;
  }

  state.warehouse = state.warehouse || [];
  const maxSlots = getMaxWarehouseSlots();

  if (countEl) countEl.textContent = `${state.warehouse.length} / ${maxSlots}`;

  container.innerHTML = '';

  for (const item of state.warehouse) {
    const def = getItemDef(item.itemId);
    if (!def) continue;

    const slotEl = mkEl('div');
    const rarity = item.rarity || 'common';
    const icon = resolveItemIcon(item, def);

    slotEl.className = `inv-slot rarity-${rarity}`;
    slotEl.dataset.uid = item.uid;

    const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';

    slotEl.innerHTML = `
      <span class="item-icon" style="font-size:24px">${icon}</span>
      <span class="item-name">${def.name}</span>
      ${countBadge}
    `;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();

    slotEl.onclick = () => {
      if (callbacks.withdrawFromWarehouse) {
        callbacks.withdrawFromWarehouse(item.uid);
      }
    };

    container.appendChild(slotEl);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   EQUIPAMENTOS ATIVOS
═══════════════════════════════════════════════════════════════════════════ */

export function updateEquipmentUI(state, callbacks = {}) {
  if (!state) return;

  // Garante que equipment existe no state
  state.equipment = state.equipment || {};

  for (const slot of ALL_EQUIP_SLOTS) {
    const slotEl = el(`equip-slot-${slot}`);
    if (!slotEl) {
      console.warn(`[InventoryUI] Slot não encontrado: equip-slot-${slot}`);
      continue;
    }

    const uid = state.equipment[slot];
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def = item ? getItemDef(item.itemId) : null;

    if (item && def) {
      const rarity = item.rarity || 'common';
      const icon = resolveItemIcon(item, def);

      slotEl.className = `equip-slot active rarity-${rarity}`;
      slotEl.dataset.uid = uid;
      slotEl.dataset.slot = slot;

      slotEl.innerHTML = `
        <span class="equip-icon" style="font-size:28px">${icon}</span>
        <span class="equip-slot-label">${getSlotLabel(slot)}</span>
      `;

      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();

      slotEl.onclick = () => {
        if (callbacks.unequipItem) {
          callbacks.unequipItem(slot);
        }
      };

      // Marca como equipado no inventário
      item.equipped = true;
      item.equippedSlot = slot;
    } else {
      slotEl.className = 'equip-slot empty';
      slotEl.dataset.slot = slot;
      slotEl.innerHTML = `
        <span class="equip-placeholder">${getSlotIcon(slot)}</span>
        <span class="equip-slot-label">${getSlotLabel(slot)}</span>
      `;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }

  // Recalcula stats após atualizar equipamentos
  if (state && callbacks.recalcStats) {
    callbacks.recalcStats(state);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS DE SLOT
═══════════════════════════════════════════════════════════════════════════ */

function getSlotLabel(slot) {
  const labels = {
    weapon: 'Arma',
    armor: 'Armadura',
    helmet: 'Elmo',
    gloves: 'Luvas',
    boots: 'Botas',
    shield: 'Escudo',
    ring: 'Anel',
    necklace: 'Colar',
    earring: 'Brinco',
    belt: 'Cinto',
    cloak: 'Capa'
  };
  return labels[slot] || slot.toUpperCase();
}

function getSlotIcon(slot) {
  const icons = {
    weapon: '⚔️',
    armor: '🦺',
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
  return icons[slot] || '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   CSS DINÂMICO (injeta se não existir)
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

/* Raridades */
.rarity-common { border-color: #9ca3af; }
.rarity-uncommon { border-color: #22c55e; }
.rarity-rare { border-color: #3b82f6; }
.rarity-epic { border-color: #a855f7; }
.rarity-legendary { border-color: #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.4); }

.item-icon {
  font-size: 28px;
  z-index: 2;
}

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

/* Equipamento */
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

.equip-icon {
  font-size: 28px;
}

.equip-slot-label {
  font-size: 7px;
  color: #9ca3af;
  text-transform: uppercase;
  margin-top: 2px;
}

.equip-placeholder {
  font-size: 24px;
  opacity: 0.4;
}
`;
