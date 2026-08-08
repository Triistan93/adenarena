import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';

/* ═══════════ HELPERS ═══════════ */

function invRoot(){ return document.getElementById('idle-host')?.shadowRoot || document; }
function findElement(id){ return invRoot().querySelector(`#${id}`) || document.getElementById(id); }
function escapeHTML(v){
  return String(v ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function getItemDef(itemId){
  const data = D();
  if(!data?.ALL_ITEMS || !itemId) return null;
  if(data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];
  const raw = String(itemId);
  const vars = [raw, raw.toLowerCase(), raw.replace(/\s+/g,''), raw.replace(/[-_]/g,'').toLowerCase()];
  for(const v of vars) if(data.ALL_ITEMS[v]) return data.ALL_ITEMS[v];
  const n = raw.toLowerCase().replace(/\s+/g,'');
  return Object.values(data.ALL_ITEMS).find(i => i.name?.toLowerCase().replace(/\s+/g,'') === n) || null;
}

const EMOJI_BY_SLOT = {
  weapon:'⚔️', shield:'🛡️', armor:'🦺', helmet:'🪖', gloves:'🧤', legs:'👖', boots:'👢',
  cloak:'🧥', belt:'🎗️', necklace:'📿', earring:'💎', earring1:'💎', earring2:'💎',
  ring:'💍', ring2:'💍', hair:'👑', hair2:'🎭', agathion:'👼', talisman:'🧿',
  consumable:'🧪', potion:'🧪', scroll:'📜', material:'💠', gem:'💠', quest:'📯'
};

/**
 * Normaliza qualquer retorno de getItemIcon (HTML, URL ou emoji)
 * para markup limpo, sem estilos inline que quebrem o alinhamento.
 */
function renderItemIcon(item, def){
  let icon = '';
  try { icon = getItemIcon(def || item) || ''; } catch {}
  if(icon instanceof HTMLElement) icon = icon.outerHTML;

  const value = String(icon).trim();
  const fallback = EMOJI_BY_SLOT[(def?.slot || '').toLowerCase()] || '📦';

  const imgTag = (src) =>
    `<img class="inventory-item-image" src="${escapeHTML(src)}" alt="${escapeHTML(def?.name || '')}" ` +
    `draggable="false" loading="lazy" ` +
    `onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='inline-flex');"/>` +
    `<span class="inventory-item-emoji" style="display:none;">${fallback}</span>`;

  if(!value) return `<span class="inventory-item-emoji">${fallback}</span>`;

  // Veio HTML pronto: extrai só o src e remonta limpo
  if(value.startsWith('<')){
    const m = value.match(/<img[^>]+src=["']([^"']+)["']/i);
    return (m && m[1]) ? imgTag(m[1]) : `<span class="inventory-item-emoji">${fallback}</span>`;
  }

  const isImg = /^(https?:|data:image|blob:|\/|\.{1,2}\/|img\/)/i.test(value)
             || /\.(png|webp|jpe?g|gif|svg)/i.test(value);
  if(isImg) return imgTag(value);

  return `<span class="inventory-item-emoji">${escapeHTML(value)}</span>`;
}

/* ═══════════ PAPERDOLL ═══════════ */

const SLOT_ICONS = {
  weapon:'⚔️', shield:'🛡️', armor:'🦺', helmet:'🪖', gloves:'🧤', legs:'👖', boots:'👢',
  cloak:'🧥', belt:'🎗️', necklace:'📿', earring1:'💎', earring2:'💎', ring:'💍', ring2:'💍',
  hair:'👑', hair2:'🎭', agathion:'👼', talisman:'🧿'
};

const EQUIPMENT_SLOT_ALIASES = {
  weapon:['weapon'], shield:['shield','offhand'], armor:['armor'], helmet:['helmet'],
  gloves:['gloves'], legs:['legs','pants'], boots:['boots'], cloak:['cloak','cape'],
  belt:['belt'], necklace:['necklace'], earring1:['earring1','earring'], earring2:['earring2'],
  ring:['ring','ring1'], ring2:['ring2'], hair:['hair'], hair2:['hair2','mask'],
  agathion:['agathion'], talisman:['talisman']
};

const PAPERDOLL_ORDER = [
  'earring1','helmet','earring2',
  'necklace','armor','cloak',
  'hair','legs','hair2',
  'weapon','gloves','shield',
  'ring','belt','ring2',
  'boots','talisman','agathion'
];

const _warnedMissingSlots = new Set();

function findEquipmentSlot(slot){
  const root = invRoot();
  const aliases = EQUIPMENT_SLOT_ALIASES[slot] || [slot];
  const scopes = ['#paperdoll-grid ', '.l2inv-doll-col ', ''];

  for(const alias of aliases){
    for(const scope of scopes){
      for(const sel of [
        `${scope}#equip-slot-${alias}`,
        `${scope}[data-slot="${alias}"]`,
        `${scope}[data-equip-slot="${alias}"]`,
        `${scope}#${alias}`
      ]){
        try {
          const f = root.querySelector(sel.trim());
          if(f) return f;
        } catch {}
      }
    }
  }
  return null;
}

function ensurePaperdollLayout(){
  const root = invRoot();
  const anySlot = findEquipmentSlot('weapon') || findEquipmentSlot('helmet') || findEquipmentSlot('armor');
  if(!anySlot) return null;

  const panel = anySlot.closest('.l2inv-doll-col') || anySlot.parentElement;
  if(!panel) return null;

  let grid = root.querySelector('#paperdoll-grid');
  if(!grid){
    grid = document.createElement('div');
    grid.id = 'paperdoll-grid';
    panel.insertBefore(grid, panel.firstChild);
  }

  // Move na ordem visual e garante data-slot (o CSS usa isso para grid-area)
  for(const slot of PAPERDOLL_ORDER){
    const elSlot = findEquipmentSlot(slot);
    if(!elSlot) continue;
    elSlot.dataset.slot = slot;
    if(elSlot.parentElement !== grid) grid.appendChild(elSlot);
  }
  return grid;
}

function createEquipmentSlotDynamically(slot){
  const grid = ensurePaperdollLayout();
  if(!grid) return null;
  const elSlot = document.createElement('div');
  elSlot.id = `equip-slot-${slot}`;
  elSlot.className = 'equip-slot empty';
  elSlot.dataset.slot = slot;
  grid.appendChild(elSlot);
  return elSlot;
}

/* ═══════════ INVENTÁRIO ═══════════ */

export function updateInventoryUI(state, callbacks = {}){
  ensureInventoryStyles();
  updateEquipmentUI(state, callbacks);

  const grid = findElement('inventory-grid');
  if(!grid) return;
  grid.innerHTML = '';

  const data = D();
  if(!data?.ALL_ITEMS){
    grid.innerHTML = '<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Dados não carregados</div>';
    return;
  }

  const selectedSet  = getSelectedSet(state);
  const filter       = state.inventoryFilter || state.filter || 'all';
  const rarityFilter = state.rarityFilter || 'all';
  const equipFilter  = state.equipFilter || 'all';
  const searchTerm   = (findElement('inv-search-input')?.value || '').trim().toLowerCase();

  const GEAR_SLOTS = ['weapon','shield','armor','helmet','gloves','legs','boots','cloak','belt','necklace','earring','ring','hair','hair2','agathion','talisman'];
  const CONSUMABLE_SLOTS = ['consumable','potion','scroll','food','powerup'];
  const MATERIAL_SLOTS = ['material','gem','ore','craft'];

  const sorted = [...(state.inventory || [])]
    .filter(i => i?.itemId)
    .sort((a,b) => {
      const da = getItemDef(a.itemId), db = getItemDef(b.itemId);
      if(!da || !db) return 0;
      return (db.tier || 0) - (da.tier || 0);
    });

  for(const item of sorted){
    const def = getItemDef(item.itemId);
    if(!def) continue;
    if(searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;

    const defSlot = (def.slot || '').toLowerCase();
    if(filter !== 'all'){
      const f = filter.toLowerCase();
      if((f === 'gear' || f === 'equip') && !GEAR_SLOTS.includes(defSlot)) continue;
      if((f === 'consumable' || f === 'supplies') && !CONSUMABLE_SLOTS.includes(defSlot)) continue;
      if((f === 'material' || f === 'crafting') && !MATERIAL_SLOTS.includes(defSlot)) continue;
    }

    const rarity = item.rarity || 'common';
    if(rarityFilter !== 'all' && rarity !== rarityFilter) continue;
    if(equipFilter === 'equipped' && !item.equipped) continue;
    if(equipFilter === 'bag' && item.equipped) continue;

    const isSelected  = selectedSet.has(item.uid);
    const qty         = (item.count || 1) > 1 ? `<span class="qty">${item.count}</span>` : '';
    const equippedTag = item.equipped ? '<span class="equipped-badge">E</span>' : '';
    const check       = isSelected ? '<span class="inv-check">✓</span>' : '';

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${rarity}`
      + (item.equipped ? ' is-equipped' : '')
      + (isSelected ? ' is-selected' : '');
    slotEl.dataset.uid = item.uid;
    slotEl.title = def.name;
    slotEl.innerHTML = `${check}<span class="item-icon">${renderItemIcon(item, def)}</span>${qty}${equippedTag}`;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();

    slotEl.onclick = (e) => {
      e.stopPropagation();
      if(callbacks.toggleSelectItem){
        callbacks.toggleSelectItem(item.uid);
        updateInventoryUI(state, callbacks);
      }
    };

    slotEl.oncontextmenu = (e) => {
      e.preventDefault(); e.stopPropagation();
      if(item.equipped){
        if(callbacks.unequipItem)
          callbacks.unequipItem(state, item.equippedSlot || resolveEquipSlot(def.slot, state.equipment), callbacks);
      } else if(callbacks.equipItem){
        callbacks.equipItem(state, item.uid, callbacks);
      }
    };

    slotEl.ondblclick = (e) => {
      e.stopPropagation();
      if(CONSUMABLE_SLOTS.includes(defSlot) && callbacks.useItem) callbacks.useItem(item.uid);
    };

    grid.appendChild(slotEl);
  }

  const cnt = findElement('inv-count');
  if(cnt) cnt.textContent = `${state.inventory?.length || 0} / ${getMaxInventorySlots(state)}`;
}

/* ═══════════ BAÚ ═══════════ */

export function updateWarehouseUI(state, callbacks = {}){
  ensureInventoryStyles();
  const container = findElement('warehouse-grid');
  const countEl = findElement('warehouse-slot-count');
  if(!container) return;

  state.warehouse = state.warehouse || [];
  if(countEl) countEl.textContent = `${state.warehouse.length} / ${getMaxWarehouseSlots()}`;
  container.innerHTML = '';

  for(const item of state.warehouse){
    const def = getItemDef(item.itemId);
    if(!def) continue;

    const slotEl = mkEl('div');
    slotEl.className = `inv-slot rarity-${item.rarity || 'common'}`;
    slotEl.dataset.uid = item.uid;
    slotEl.title = def.name;
    const countBadge = (item.count && item.count > 1) ? `<span class="qty">${item.count}</span>` : '';
    slotEl.innerHTML = `<span class="item-icon">${renderItemIcon(item, def)}</span>${countBadge}`;

    slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
    slotEl.onmouseleave = () => hideItemTooltip();
    slotEl.onclick = () => { if(callbacks.withdrawFromWarehouse) callbacks.withdrawFromWarehouse(item.uid); };

    container.appendChild(slotEl);
  }
}

/* ═══════════ EQUIPAMENTOS ═══════════ */

export function updateEquipmentUI(state, callbacks = {}){
  if(!state) return;
  state.equipment = state.equipment || {};
  ensureInventoryStyles();
  migrateEquipmentSlots(state);
  ensurePaperdollLayout();

  for(const slot of ALL_EQUIP_SLOTS){
    let slotEl = findEquipmentSlot(slot) || createEquipmentSlotDynamically(slot);
    if(!slotEl){
      if(!_warnedMissingSlots.has(slot)) _warnedMissingSlots.add(slot);
      continue;
    }

    const uid  = state.equipment[slot];
    const item = uid ? (state.inventory || []).find(i => i.uid === uid) : null;
    const def  = item ? getItemDef(item.itemId) : null;

    slotEl.dataset.slot = slot;

    if(item && def){
      slotEl.className = `equip-slot active rarity-${item.rarity || 'common'}`;
      slotEl.dataset.uid = uid;
      slotEl.title = def.name;
      slotEl.innerHTML = `<span class="equip-icon">${renderItemIcon(item, def)}</span>`;
      slotEl.onmouseenter = (e) => showItemTooltip(e, item, state, callbacks);
      slotEl.onmouseleave = () => hideItemTooltip();
      slotEl.onclick = () => { if(callbacks.unequipItem) callbacks.unequipItem(state, slot, callbacks); };
      item.equipped = true;
      item.equippedSlot = slot;
    } else {
      slotEl.className = 'equip-slot empty';
      delete slotEl.dataset.uid;
      slotEl.title = '';
      slotEl.innerHTML = `<span class="equip-placeholder">${SLOT_ICONS[slot] || '📦'}</span>`;
      slotEl.onmouseenter = null;
      slotEl.onmouseleave = null;
      slotEl.onclick = null;
    }
  }
}

/* ═══════════ CSS ═══════════ */

const STYLE_ID = 'inventory-ui-styles-final';

export function ensureInventoryStyles(){
  const host = document.getElementById('idle-host');
  const target = host?.shadowRoot || document.head;
  if(!target) return;

  for(const oldId of ['inventory-ui-styles','inventory-ui-styles-v2','inventory-ui-styles-v3','inventory-ui-styles-l2-final']){
    const old = target.querySelector(`#${oldId}`);
    if(old) old.remove();
  }
  if(target.querySelector(`#${STYLE_ID}`)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = INVENTORY_CSS;
  target.appendChild(style);
}

const INVENTORY_CSS = `
/* ═══════════ PAINEL DOCKADO ═══════════ */
#inventory-panel, .inventory-panel, #inventory-window {
  width: 100% !important; height: 100% !important; max-width: none !important;
  margin: 0 !important; display: flex !important; flex-direction: column !important;
  overflow: hidden !important; box-sizing: border-box !important;
}
.inventory-body, #inventory-body, .l2inv-body {
  flex: 1 !important; display: flex !important; flex-direction: row !important;
  gap: 8px !important; padding: 8px !important; overflow: hidden !important; min-height: 0 !important;
}

/* ═══════════ PAPERDOLL ═══════════ */
.l2inv-doll-col {
  width: 176px !important; min-width: 176px !important; flex: 0 0 176px !important;
  display: flex !important; flex-direction: column !important; gap: 6px !important;
  background: #201a13 !important; border: 1px solid #3a2a1a !important; border-radius: 6px !important;
  padding: 6px !important; box-sizing: border-box !important; overflow-y: auto !important; min-height: 0 !important;
}
#doll-set-switcher { display: flex !important; gap: 4px !important; }
#doll-set-switcher .set-btn {
  flex: 1 !important; height: 24px !important; background: #2a241c !important;
  border: 1px solid #5a4a32 !important; color: #9c8a6a !important;
  font-size: 10px !important; font-weight: bold !important; cursor: pointer !important; border-radius: 3px !important;
}
#doll-set-switcher .set-btn.active { background: #4a3a24 !important; border-color: #c9a227 !important; color: #f5e6c8 !important; }

#paperdoll-grid {
  display: grid !important;
  grid-template-columns: repeat(3, 50px) !important;
  grid-template-rows: repeat(6, 50px) !important;
  gap: 4px !important; justify-content: center !important; padding: 8px 4px !important;
  background: radial-gradient(ellipse at center, #2a241c 0%, #17120e 100%) !important;
  border: 1px solid #3a2a1a !important; border-radius: 6px !important;
  grid-template-areas:
    "earring1 helmet   earring2"
    "necklace armor    cloak"
    "hair     legs     hair2"
    "weapon   gloves   shield"
    "ring     belt     ring2"
    "boots    talisman agathion" !important;
  width: fit-content !important; margin: 0 auto !important;
}
#paperdoll-grid [data-slot="earring1"] { grid-area: earring1 !important; }
#paperdoll-grid [data-slot="helmet"]   { grid-area: helmet !important; }
#paperdoll-grid [data-slot="earring2"] { grid-area: earring2 !important; }
#paperdoll-grid [data-slot="necklace"] { grid-area: necklace !important; }
#paperdoll-grid [data-slot="armor"]    { grid-area: armor !important; }
#paperdoll-grid [data-slot="cloak"]    { grid-area: cloak !important; }
#paperdoll-grid [data-slot="hair"]     { grid-area: hair !important; }
#paperdoll-grid [data-slot="legs"]     { grid-area: legs !important; }
#paperdoll-grid [data-slot="hair2"]    { grid-area: hair2 !important; }
#paperdoll-grid [data-slot="weapon"]   { grid-area: weapon !important; }
#paperdoll-grid [data-slot="gloves"]   { grid-area: gloves !important; }
#paperdoll-grid [data-slot="shield"]   { grid-area: shield !important; }
#paperdoll-grid [data-slot="ring"]     { grid-area: ring !important; }
#paperdoll-grid [data-slot="belt"]     { grid-area: belt !important; }
#paperdoll-grid [data-slot="ring2"]    { grid-area: ring2 !important; }
#paperdoll-grid [data-slot="boots"]    { grid-area: boots !important; }
#paperdoll-grid [data-slot="talisman"] { grid-area: talisman !important; }
#paperdoll-grid [data-slot="agathion"] { grid-area: agathion !important; }

.equip-slot {
  position: relative !important; width: 50px !important; height: 50px !important;
  background: #1a1611 !important; border: 1px solid #4a3a2a !important; border-radius: 3px !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  cursor: pointer !important; box-sizing: border-box !important; overflow: hidden !important;
}
.equip-slot.active { border-color: #c9a227 !important; background: #2a241c !important; }
.equip-slot.rarity-uncommon  { border-color: #22c55e !important; }
.equip-slot.rarity-rare      { border-color: #3b82f6 !important; }
.equip-slot.rarity-epic      { border-color: #a855f7 !important; }
.equip-slot.rarity-legendary { border-color: #f59e0b !important; }
.equip-placeholder { font-size: 18px !important; opacity: .25 !important; }
.equip-label { display: none !important; }

.doll-stats, #doll-stats {
  font-size: 10px !important; padding: 6px !important; background: #17120e !important;
  border: 1px solid #3a2a1a !important; border-radius: 4px !important; color: #b8a88a !important;
}

/* ═══════════ ÁREA DIREITA ═══════════ */
.l2inv-main-col, .inventory-grid-container, #inventory-grid-container {
  flex: 1 !important; display: flex !important; flex-direction: column !important;
  gap: 6px !important; min-width: 0 !important; min-height: 0 !important; overflow: hidden !important;
}
.l2inv-tabs, .inventory-tabs, .l2inv-filters, .inventory-filters {
  display: flex !important; flex-wrap: wrap !important; gap: 4px !important; align-items: center !important;
  padding: 4px 6px !important; background: rgba(0,0,0,.35) !important; border-radius: 4px !important; flex: 0 0 auto !important;
}
.l2inv-tabs button, .inventory-tabs button,
.l2inv-filters button, .inventory-filters button,
.l2inv-filters select, .inventory-filters select {
  height: 22px !important; padding: 0 8px !important; font-size: 10px !important;
  background: #2a241c !important; border: 1px solid #4a3a2a !important; color: #b8a88a !important;
  border-radius: 3px !important; cursor: pointer !important; white-space: nowrap !important;
}
.l2inv-tabs button.active, .inventory-tabs button.active {
  background: #4a3a24 !important; border-color: #c9a227 !important; color: #f5e6c8 !important;
}
.l2inv-filters input, .inventory-filters input, #inv-search-input {
  height: 22px !important; font-size: 10px !important; flex: 1 1 100px !important; min-width: 80px !important;
  background: #1a1611 !important; border: 1px solid #4a3a2a !important; color: #d8c8a8 !important;
  padding: 0 6px !important; border-radius: 3px !important;
}

/* ═══════════ GRID DE ITENS ═══════════ */
#inventory-grid, .inventory-grid, #warehouse-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, 40px) !important;
  grid-auto-rows: 40px !important;
  gap: 3px !important; padding: 6px !important;
  background: #18130e !important; border: 1px solid #3a2a1a !important; border-radius: 4px !important;
  align-content: start !important; justify-content: start !important;
  flex: 1 !important; min-height: 0 !important;
  overflow-y: auto !important; overflow-x: hidden !important;
  scrollbar-width: thin !important; scrollbar-color: #4a3a2a #18130e !important;
}
#inventory-grid::-webkit-scrollbar, #warehouse-grid::-webkit-scrollbar { width: 8px !important; }
#inventory-grid::-webkit-scrollbar-track, #warehouse-grid::-webkit-scrollbar-track { background: #18130e !important; }
#inventory-grid::-webkit-scrollbar-thumb, #warehouse-grid::-webkit-scrollbar-thumb { background: #4a3a2a !important; border-radius: 4px !important; }

.inv-slot {
  position: relative !important; width: 40px !important; height: 40px !important;
  background: #1e1a14 !important; border: 1px solid #3d2e1e !important; border-radius: 2px !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  cursor: pointer !important; box-sizing: border-box !important; overflow: hidden !important;
}
.inv-slot.is-equipped { border-color: #22c55e !important; }
.inv-slot.is-selected { border-color: #3b82f6 !important; background: #1e2a3a !important; }
.inv-slot.rarity-uncommon  { border-color: #22c55e !important; }
.inv-slot.rarity-rare      { border-color: #3b82f6 !important; }
.inv-slot.rarity-epic      { border-color: #a855f7 !important; }
.inv-slot.rarity-legendary { border-color: #f59e0b !important; }
.item-name { display: none !important; }

.qty {
  position: absolute !important; bottom: 0 !important; right: 2px !important;
  font-size: 9px !important; color: #fff !important; font-weight: bold !important;
  line-height: 1 !important; pointer-events: none !important; z-index: 3 !important;
  text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000 !important;
}
.equipped-badge {
  position: absolute !important; top: 1px !important; left: 1px !important; z-index: 3 !important;
  font-size: 8px !important; background: #22c55e !important; color: #000 !important;
  font-weight: bold !important; width: 11px !important; height: 11px !important;
  display: flex !important; align-items: center !important; justify-content: center !important; border-radius: 2px !important;
}
.inv-check, .slot-select-checkbox {
  position: absolute !important; top: 1px !important; right: 1px !important; z-index: 3 !important;
  font-size: 10px !important; color: #3b82f6 !important; pointer-events: none !important; line-height: 1 !important;
}

.inventory-footer, #inventory-footer, .l2inv-footer {
  flex: 0 0 auto !important; display: flex !important; align-items: center !important;
  gap: 8px !important; padding: 6px 8px !important; border-top: 1px solid #3a2a1a !important; font-size: 11px !important;
}

/* ═══════════ NORMALIZAÇÃO DE ÍCONES ═══════════ */
.inv-slot, .equip-slot { position: relative !important; isolation: isolate !important; }

.inv-slot .item-icon, .equip-slot .equip-icon {
  position: static !important; display: flex !important;
  align-items: center !important; justify-content: center !important;
  width: 100% !important; height: 100% !important;
  margin: 0 !important; padding: 0 !important; line-height: 0 !important; overflow: hidden !important;
}
.inv-slot img, .inv-slot .item-icon-img, .inv-slot .inventory-item-image {
  position: static !important;
  width: 32px !important; height: 32px !important;
  max-width: 32px !important; max-height: 32px !important;
  min-width: 0 !important; min-height: 0 !important;
  object-fit: contain !important; object-position: center !important;
  display: block !important; margin: 0 auto !important; padding: 0 !important;
  vertical-align: middle !important; transform: none !important; inset: auto !important; float: none !important;
}
.equip-slot img, .equip-slot .item-icon-img, .equip-slot .inventory-item-image {
  position: static !important;
  width: 34px !important; height: 34px !important;
  max-width: 34px !important; max-height: 34px !important;
  object-fit: contain !important; object-position: center !important;
  display: block !important; margin: 0 auto !important;
  vertical-align: middle !important; transform: none !important; inset: auto !important;
}
.inv-slot .inventory-item-emoji, .inv-slot .item-icon-fallback,
.equip-slot .inventory-item-emoji, .equip-slot .item-icon-fallback {
  position: static !important; display: inline-flex !important;
  align-items: center !important; justify-content: center !important;
  font-size: 20px !important; line-height: 1 !important; margin: 0 !important; transform: none !important;
}

.inv-slot:hover {
  transform: none !important; border-color: #c9a227 !important; background: #2a241c !important;
  box-shadow: inset 0 0 8px rgba(201,162,39,.25) !important;
}
.equip-slot:hover { border-color: #f5d76e !important; }

/* ═══════════ RESPONSIVO ═══════════ */
@media (max-width: 1500px) {
  .l2inv-doll-col { width: 164px !important; min-width: 164px !important; flex: 0 0 164px !important; }
  #paperdoll-grid { grid-template-columns: repeat(3, 46px) !important; grid-template-rows: repeat(6, 46px) !important; }
  .equip-slot { width: 46px !important; height: 46px !important; }
  .equip-slot img, .equip-slot .inventory-item-image { width: 30px !important; height: 30px !important; }
}
@media (max-width: 1250px) {
  .inventory-body, #inventory-body, .l2inv-body { flex-direction: column !important; }
  .l2inv-doll-col { width: 100% !important; min-width: 0 !important; flex: 0 0 auto !important; }
  #paperdoll-grid {
    grid-template-columns: repeat(6, 46px) !important;
    grid-template-rows: repeat(3, 46px) !important;
    grid-template-areas:
      "earring1 helmet   earring2 necklace armor    cloak"
      "hair     legs     hair2    weapon   gloves   shield"
      "ring     belt     ring2    boots    talisman agathion" !important;
  }
}
`;
