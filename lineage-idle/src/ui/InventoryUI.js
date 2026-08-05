/**
 * InventoryUI.js — VERSÃO FINAL COM CORREÇÕES
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, qs, qsa, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
<<<<<<< HEAD
import { resolveEquipSlot, equipItem } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip } from './TooltipUI.js';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Ícone do item (APENAS EMOJI - sem paths de arquivo!)
═══════════════════════════════════════════════════════════════════════════ */

function getItemIcon(item, def) {
  if (!def) return '📦';

  // NUNCA retorna path de arquivo - apenas emoji
  const slot = (def.slot || '').toLowerCase();
  
  if (slot.includes('bow')) return '🏹';
  if (slot.includes('sword') || slot.includes('blade')) return '🗡️';
  if (slot.includes('staff') || slot.includes('wand')) return '';
  if (slot.includes('dagger')) return '🗡️';
  if (slot.includes('weapon')) return '⚔️';
  if (slot.includes('armor') || slot.includes('chest') || slot.includes('breastplate')) return '🦺';
  if (slot.includes('helmet') || slot.includes('head') || slot.includes('cap')) return '🪖';
  if (slot.includes('gloves') || slot.includes('hand')) return '🧤';
  if (slot.includes('boots') || slot.includes('shoes') || slot.includes('feet')) return '👢';
  if (slot.includes('shield')) return '🛡️';
  if (slot.includes('ring')) return '💍';
  if (slot.includes('necklace') || slot.includes('pendant')) return '';
  if (slot.includes('earring')) return '🎧';
  if (slot.includes('belt') || slot.includes('waist')) return '🎗️';
  if (slot.includes('cloak') || slot.includes('cape')) return '';
  if (slot.includes('potion')) return '🧪';
  if (slot.includes('scroll')) return '📜';
  if (slot.includes('material') || slot.includes('ore') || slot.includes('gem')) return '💎';
  if (slot.includes('quest')) return '📯';
  if (slot.includes('hair') || slot.includes('headgear')) return '👑';
  
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
   HELPER: Busca definição do item (MÚLTIPLAS VARIAÇÕES DE ID)
═══════════════════════════════════════════════════════════════════════════ */

function getItemDef(itemId) {
  const data = D();
  if (!data?.ALL_ITEMS) return null;
  
  // Tenta ID exato primeiro
  if (data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];
  
  // Gera variações do ID
  const variations = [
    itemId,
    itemId.toLowerCase(),
    itemId.replace(/\s+/g, ''),
    itemId.replace(/[-_]/g, '').toLowerCase(),
    itemId.replace(/^mon_/, '').toLowerCase(),
    // CamelCase para lowercase
    itemId.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''),
    // lowercase para CamelCase
    itemId.replace(/_([a-z])/g, (m, c) => c.toUpperCase())
  ];
  
  for (const v of variations) {
    if (data.ALL_ITEMS[v]) return data.ALL_ITEMS[v];
  }
  
  // Busca por nome se tudo falhar
  const byName = Object.values(data.ALL_ITEMS).find(
    i => i.name?.toLowerCase().replace(/\s+/g, '') === itemId.toLowerCase().replace(/\s+/g, '')
  );
  
  return byName || null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER: Busca elemento (Shadow DOM + Document + Múltiplos IDs)
═══════════════════════════════════════════════════════════════════════════ */

function findElement(id) {
  const host = document.getElementById('idle-host');
  const shadow = host?.shadowRoot;
  
  if (shadow) {
    const el = shadow.querySelector(`#${id}`);
    if (el) return el;
  }
  
  return document.getElementById(id);
}

function findEquipmentSlot(slot) {
  const host = document.getElementById('idle-host');
  const shadow = host?.shadowRoot;
  const root = shadow || document;
  
  // Tenta múltiplos padrões de ID
  const patterns = [
    `equip-slot-${slot}`,
    `equipment-${slot}`,
    `equip-${slot}`,
    `slot-${slot}`,
    `eq-${slot}`,
    slot
  ];
  
  for (const pattern of patterns) {
    const el = root.querySelector(`#${pattern}`) || root.querySelector(`.${pattern}`);
    if (el) return el;
  }
  
  // Tenta por data attribute
  const byData = root.querySelector(`[data-slot="${slot}"]`) || 
                 root.querySelector(`[data-equip-slot="${slot}"]`);
  if (byData) return byData;
  
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVENTÁRIO PRINCIPAL
═══════════════════════════════════════════════════════════════════════════ */

export function updateInventoryUI(state, callbacks = {}) {
  const data = D();
  
  if (!data?.ALL_ITEMS) {
    console.error('[InventoryUI] ALL_ITEMS não carregado!');
    const grid = findElement('inventory-grid');
    if (grid) {
      grid.innerHTML = '<div style="padding:20px;color:#ef4444;text-align:center;">⚠️ Erro: Dados de itens não carregados</div>';
    }
    return;
  }

  updateEquipmentUI(state, callbacks);

  const grid = findElement('inventory-grid');
  if (!grid) {
    console.error('[InventoryUI] Grid não encontrado');
    return;
  }

=======
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
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
  grid.innerHTML = '';

  const selectedSet = getSelectedSet(state);
  const filter = state.inventoryFilter || state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter = state.equipFilter || 'all';

  const searchInput = findElement('inv-search-input');
  const searchTerm = (searchInput?.value || '').trim().toLowerCase();

  // Debug: conta itens sem definição
  let missingDefs = 0;
  let totalItems = 0;
  
  const sorted = [...(state.inventory || [])]
    .filter(i => i?.itemId)
    .sort((a, b) => {
      const da = getItemDef(a.itemId);
      const db = getItemDef(b.itemId);
      if (!da || !db) return 0;
      return (db.tier || 0) - (da.tier || 0);
    });

  for (const item of sorted) {
    totalItems++;
    const def = getItemDef(item.itemId);
    
    if (!def) {
      missingDefs++;
      if (missingDefs <= 5) {
        console.warn('[InventoryUI] Item sem definição:', item.itemId);
      }
      continue;
    }

    if (searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    if (filter !== 'all') {
<<<<<<< HEAD
      const slot = (def.slot || '').toLowerCase();
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'necklace', 'shield'].includes(slot)) continue;
      if (filter === 'consumable' && !['consumable', 'potion', 'scroll', 'food'].includes(slot)) continue;
      if (filter === 'material' && !['material', 'gem', 'ore', 'craft'].includes(slot)) continue;
=======
      if (filter === 'gear' && !['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'earring', 'necklace', 'cloak', 'belt'].includes(def.slot)) continue;
      else if (filter === 'consumable' && !['consumable', 'potion', 'scroll', 'powerup'].includes(def.slot)) continue;
      else if (filter === 'material' && !['material', 'gem', 'craft'].includes(def.slot)) continue;
      else if (filter === 'scroll' && !['scroll', 'quest'].includes(def.slot)) continue;
      else if (!['gear', 'consumable', 'material', 'scroll'].includes(filter) && def.slot !== filter) continue;
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
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

<<<<<<< HEAD
    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}` + (item.equipped ? ' is-equipped' : '') + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;
=======
    slot.innerHTML = `${checkHtml}${getItemIcon(item)}<span class="name">${enchantStr}${def.name}</span>${qty}${tag}`;
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)

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

<<<<<<< HEAD
    slotEl.oncontextmenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.equipped) {
        if (callbacks.unequipItem) callbacks.unequipItem(state, resolveEquipSlot(def.slot), callbacks);
      } else {
        if (callbacks.equipItem) callbacks.equipItem(state, item.uid, callbacks);
      }
    };

    grid.appendChild(slotEl);
  }

  if (missingDefs > 0) {
    console.warn(`[InventoryUI] ${missingDefs}/${totalItems} itens sem definição`);
  }

  const cnt = findElement('inv-count');
  const maxSlots = getMaxInventorySlots(state);
  if (cnt) cnt.textContent = `${state.inventory?.length || 0} / ${maxSlots}`;
=======
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
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
}

/* ═══════════════════════════════════════════════════════════════════════════
   BAÚ
═══════════════════════════════════════════════════════════════════════════ */

export function updateWarehouseUI(state, callbacks = {}) {
<<<<<<< HEAD
  const container = findElement('warehouse-grid');
  const countEl = findElement('warehouse-slot-count');

=======
  ensureInventoryStyles();
  const container = el('warehouse-grid');
  const countEl = el('warehouse-slot-count');
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
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
<<<<<<< HEAD
      <span class="item-icon">${icon}</span>
      <span class="item-name">${def.name}</span>
=======
      ${getItemIcon(item)}
      <span class="name">${def.name}</span>
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
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
   EQUIPAMENTOS
═══════════════════════════════════════════════════════════════════════════ */

export function updateEquipmentUI(state, callbacks = {}) {
<<<<<<< HEAD
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
    cloak: 'Capa',
    cape: 'Capa',
    agathion: 'Agathion'
  };

  const slotIcons = {
    weapon: '⚔️',
    armor: '🦺',
    helmet: '🪖',
    gloves: '🧤',
    boots: '👢',
    shield: '️',
    ring: '',
    necklace: '📿',
    earring: '🎧',
    belt: '🎗️',
    cloak: '🧥',
    agathion: '👼'
  };

  let foundSlots = 0;
  let missingSlots = [];

  for (const slot of ALL_EQUIP_SLOTS) {
    const slotEl = findEquipmentSlot(slot);

    if (!slotEl) {
      missingSlots.push(slot);
      continue;
    }

    foundSlots++;

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
=======
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
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
      };

      item.equipped = true;
      item.equippedSlot = slot;
    } else {
      const emoji = defaultSlotIcons[slot] || '📦';
      slotEl.className = 'equip-slot empty';
<<<<<<< HEAD
      slotEl.dataset.slot = slot;
      slotEl.innerHTML = `
        <span class="equip-placeholder">${slotIcons[slot] || '📦'}</span>
        <span class="equip-label">${slotLabels[slot] || slot}</span>
=======
      slotEl.title = `${slot} (vazio)`;
      slotEl.innerHTML = `
        <span class="equip-placeholder-icon">${emoji}</span>
        <span class="equip-placeholder-label">${slot.toUpperCase()}</span>
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
      `;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }

  if (missingSlots.length > 0) {
    console.log(`[InventoryUI] Slots encontrados: ${foundSlots}/${ALL_EQUIP_SLOTS.length}`);
    console.log(`[InventoryUI] Slots faltando:`, missingSlots);
  }
}
<<<<<<< HEAD

/* ═══════════════════════════════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════════════════════════════ */

const STYLE_ID = 'inventory-ui-styles-v3';

export function ensureInventoryStyles() {
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if (!target) return;
  
  // Remove versões antigas
  ['inventory-ui-styles', 'inventory-ui-styles-v2', 'inventory-ui-styles-v3'].forEach(id => {
    const old = target.querySelector(`#${id}`);
    if (old && id !== STYLE_ID) old.remove();
  });
  
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

.item-icon {
  font-size: 28px;
  z-index: 2;
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
  margin-top: 2px;
  line-height: 1.1;
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

.equip-icon { font-size: 24px; line-height: 1; }
.equip-label { font-size: 6px; color: #9ca3af; margin-top: 2px; text-transform: uppercase; }
.equip-placeholder { font-size: 20px; opacity: 0.4; }
`;
=======
>>>>>>> dbaf659 (fix: resolve inventory layout, item PNG icons resolution, 2-column paperdoll equipment slots, right-click equip and unequip)
