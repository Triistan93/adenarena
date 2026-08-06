import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { el, mkEl } from '../core/DomHelpers.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, getSelectedSet } from '../services/InventoryService.js';
import { resolveEquipSlot, migrateEquipmentSlots } from '../services/EquipmentService.js';
import { showItemTooltip, hideItemTooltip, getItemIcon } from './TooltipUI.js';

function invRoot(){ return document.getElementById('idle-host')?.shadowRoot || document; }
function findElement(id){ return invRoot().querySelector(`#${id}`) || document.getElementById(id); }
function escapeHTML(v){ return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;"); }
function getItemDef(itemId){
  const data=D(); if(!data?.ALL_ITEMS||!itemId) return null;
  if(data.ALL_ITEMS[itemId]) return data.ALL_ITEMS[itemId];
  const raw=String(itemId); const vars=[raw,raw.toLowerCase(),raw.replace(/\s+/g,''),raw.replace(/[-_]/g,'').toLowerCase()];
  for(const v of vars) if(data.ALL_ITEMS[v]) return data.ALL_ITEMS[v];
  const n=raw.toLowerCase().replace(/\s+/g,''); return Object.values(data.ALL_ITEMS).find(i=>i.name?.toLowerCase().replace(/\s+/g,'')===n)||null;
}
const EMOJI_BY_SLOT={weapon:'⚔️',shield:'🛡️',armor:'🦺',helmet:'🪖',gloves:'🧤',legs:'👖',boots:'👢',cloak:'🧥',belt:'🎗️',necklace:'📿',earring:'💎',earring1:'💎',earring2:'💎',ring:'💍',ring2:'💍',hair:'👑',hair2:'🎭',agathion:'👼',talisman:'🧿',consumable:'🧪',potion:'🧪',scroll:'📜',material:'💠',gem:'💠',quest:'📯'};
function renderItemIcon(item,def){
  let icon=''; try{ icon=getItemIcon(def||item)||'';}catch(e){}
  if(icon instanceof HTMLElement) return icon.outerHTML;
  const value=String(icon).trim(); const fallback=EMOJI_BY_SLOT[(def?.slot||'').toLowerCase()]||'📦';
  if(!value) return `<span class="inventory-item-emoji">${fallback}</span>`;
  if(value.startsWith('<')) return value;
  const isImg=/^(?:https?:|data:image|blob:|\/|\.{1,2}\/|img\/)/i.test(value)||/\.(?:png|webp|jpe?g|gif|svg)(?:\?.*)?$/i.test(value);
  if(isImg) return `<img class="inventory-item-image" src="${escapeHTML(value)}" alt="${escapeHTML(def?.name||item?.itemId||'Item')}" draggable="false" loading="lazy" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='inline-block');" /><span class="inventory-item-emoji" style="display:none;">${fallback}</span>`;
  return `<span class="inventory-item-emoji">${escapeHTML(value)}</span>`;
}
const SLOT_LABELS={weapon:'Arma',shield:'Escudo',armor:'Armadura',helmet:'Elmo',gloves:'Luvas',legs:'Calças',boots:'Botas',cloak:'Capa',belt:'Cinto',necklace:'Colar',earring1:'Brinco',earring2:'Brinco',ring:'Anel',ring2:'Anel',hair:'Cabelo',hair2:'Cabelo2',agathion:'Agathion',talisman:'Talismã'};
const SLOT_ICONS={weapon:'⚔️',shield:'🛡️',armor:'🦺',helmet:'🪖',gloves:'🧤',legs:'👖',boots:'👢',cloak:'🧥',belt:'🎗️',necklace:'📿',earring1:'💎',earring2:'💎',ring:'💍',ring2:'💍',hair:'👑',hair2:'🎭',agathion:'👼',talisman:'🧿'};
const EQUIPMENT_SLOT_ALIASES={weapon:['weapon'],shield:['shield','offhand'],armor:['armor'],helmet:['helmet'],gloves:['gloves'],legs:['legs','pants'],boots:['boots'],cloak:['cloak','cape'],belt:['belt'],necklace:['necklace'],earring1:['earring1','earring'],earring2:['earring2'],ring:['ring','ring1'],ring2:['ring2'],hair:['hair'],hair2:['hair2','mask'],agathion:['agathion'],talisman:['talisman']};
const _warnedMissingSlots=new Set();
function findEquipmentSlot(slot){
  const root=invRoot(); const aliases=EQUIPMENT_SLOT_ALIASES[slot]||[slot];
  for(const alias of aliases){ for(const sel of [`#equip-slot-${alias}`,`[data-slot="${alias}"]`,`[data-equip-slot="${alias}"]`]){ try{ const f=root.querySelector(sel); if(f) return f;}catch{} } }
  return null;
}
function ensurePaperdollLayout(){
  const root=invRoot();
  const anySlot=findEquipmentSlot('weapon')||findEquipmentSlot('helmet'); if(!anySlot) return null;
  const panel=anySlot.closest('.l2inv-doll-col')||anySlot.parentElement; if(!panel) return null;
  let grid=root.querySelector('#paperdoll-grid');
  if(!grid){ grid=document.createElement('div'); grid.id='paperdoll-grid'; panel.insertBefore(grid,panel.firstChild); }
  // ordena na ordem lógica para ficar igual o print
  const order=['helmet','hair','hair2','armor','legs','gloves','boots','weapon','shield','necklace','earring1','earring2','ring','ring2','cloak','belt','talisman','agathion'];
  for(const slot of order){
    const el=findEquipmentSlot(slot); if(el && el.parentElement!==grid) grid.appendChild(el);
  }
  for(const slot of ALL_EQUIP_SLOTS){
    const el=findEquipmentSlot(slot); if(el && !grid.contains(el)) grid.appendChild(el);
  }
  return grid;
}
function createEquipmentSlotDynamically(slot){
  const grid=ensurePaperdollLayout(); if(!grid) return null;
  const el=document.createElement('div'); el.id=`equip-slot-${slot}`; el.className='equip-slot empty'; el.dataset.slot=slot; grid.appendChild(el); return el;
}
export function updateInventoryUI(state, callbacks = {}){
  ensureInventoryStyles(); updateEquipmentUI(state, callbacks);
  const grid=findElement('inventory-grid'); if(!grid) return; grid.innerHTML='';
  const data=D(); if(!data?.ALL_ITEMS){ grid.innerHTML='<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Dados não carregados</div>'; return; }
  const selectedSet=getSelectedSet(state);
  const filter=state.inventoryFilter||state.filter||'all';
  const rarityFilter=state.rarityFilter||'all'; const equipFilter=state.equipFilter||'all';
  const searchInput=findElement('inv-search-input'); const searchTerm=(searchInput?.value||'').trim().toLowerCase();
  const GEAR_SLOTS=['weapon','shield','armor','helmet','gloves','legs','boots','cloak','belt','necklace','earring','ring','hair','hair2','agathion','talisman'];
  const CONSUMABLE_SLOTS=['consumable','potion','scroll','food','powerup']; const MATERIAL_SLOTS=['material','gem','ore','craft'];
  const sorted=[...(state.inventory||[])].filter(i=>i?.itemId).sort((a,b)=>{ const da=getItemDef(a.itemId),db=getItemDef(b.itemId); if(!da||!db) return 0; return (db.tier||0)-(da.tier||0); });
  for(const item of sorted){
    const def=getItemDef(item.itemId); if(!def) continue;
    if(searchTerm && !def.name.toLowerCase().includes(searchTerm)) continue;
    const defSlot=(def.slot||'').toLowerCase();
    if(filter!=='all'){ const f=filter.toLowerCase(); if((f==='gear'||f==='equip')&&!GEAR_SLOTS.includes(defSlot)) continue; if((f==='consumable'||f==='supplies')&&!CONSUMABLE_SLOTS.includes(defSlot)) continue; if((f==='material'||f==='crafting')&&!MATERIAL_SLOTS.includes(defSlot)) continue; }
    const rarity=item.rarity||'common'; if(rarityFilter!=='all'&&rarity!==rarityFilter) continue; if(equipFilter==='equipped'&&!item.equipped) continue; if(equipFilter==='bag'&&item.equipped) continue;
    const isSelected=selectedSet.has(item.uid);
    const qty=(item.count||1)>1?`<span class="qty">${item.count}</span>`:''; const equippedTag=item.equipped?`<span class="equipped-badge">E</span>`:''; const check=`<span class="inv-check">${isSelected?'✓':''}</span>`;
    const slotEl=mkEl('div'); slotEl.className=`inv-slot rarity-${rarity}`+(item.equipped?' is-equipped':'')+(isSelected?' is-selected':''); slotEl.dataset.uid=item.uid;
    // IGUAL AO PRINT: só ícone, sem nome dentro do slot. Nome vai no tooltip
    slotEl.innerHTML=`${check}<span class="item-icon">${renderItemIcon(item,def)}</span>${qty}${equippedTag}`;
    slotEl.title=def.name;
    slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
    slotEl.onclick=(e)=>{ e.stopPropagation(); if(callbacks.toggleSelectItem){ callbacks.toggleSelectItem(item.uid); updateInventoryUI(state,callbacks); }};
    slotEl.oncontextmenu=(e)=>{ e.preventDefault(); e.stopPropagation(); if(item.equipped){ if(callbacks.unequipItem) callbacks.unequipItem(state,item.equippedSlot||resolveEquipSlot(def.slot,state.equipment),callbacks); } else if(callbacks.equipItem) callbacks.equipItem(state,item.uid,callbacks); };
    slotEl.ondblclick=(e)=>{ e.stopPropagation(); if(CONSUMABLE_SLOTS.includes(defSlot)&&callbacks.useItem) callbacks.useItem(item.uid); };
    grid.appendChild(slotEl);
  }
  const cnt=findElement('inv-count'); const maxSlots=getMaxInventorySlots(state); if(cnt) cnt.textContent=`${state.inventory?.length||0} / ${maxSlots}`;
  // atualiza contador do header (144/181 do print)
  const headerCnt=invRoot().querySelector('.l2inv-count, #inv-header-count');
  if(headerCnt) headerCnt.textContent=`(${state.inventory?.length||0}/${maxSlots})`;
}
export function updateWarehouseUI(state, callbacks = {}){
  ensureInventoryStyles(); const container=findElement('warehouse-grid'); const countEl=findElement('warehouse-slot-count'); if(!container) return;
  state.warehouse=state.warehouse||[]; const maxSlots=getMaxWarehouseSlots(); if(countEl) countEl.textContent=`${state.warehouse.length} / ${maxSlots}`;
  container.innerHTML='';
  for(const item of state.warehouse){
    const def=getItemDef(item.itemId); if(!def) continue;
    const slotEl=mkEl('div'); const rarity=item.rarity||'common'; slotEl.className=`inv-slot rarity-${rarity}`; slotEl.dataset.uid=item.uid;
    const countBadge=(item.count&&item.count>1)?`<span class="qty">${item.count}</span>`:'';
    slotEl.innerHTML=`<span class="item-icon">${renderItemIcon(item,def)}</span>${countBadge}`;
    slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
    slotEl.onclick=()=>{ if(callbacks.withdrawFromWarehouse) callbacks.withdrawFromWarehouse(item.uid); };
    container.appendChild(slotEl);
  }
}
export function updateEquipmentUI(state, callbacks = {}){
  if(!state) return; state.equipment=state.equipment||{}; ensureInventoryStyles(); migrateEquipmentSlots(state); ensurePaperdollLayout();
  for(const slot of ALL_EQUIP_SLOTS){
    let slotEl=findEquipmentSlot(slot); if(!slotEl) slotEl=createEquipmentSlotDynamically(slot);
    if(!slotEl){ if(!_warnedMissingSlots.has(slot)){ _warnedMissingSlots.add(slot);} continue; }
    const uid=state.equipment[slot]; const item=uid?(state.inventory||[]).find(i=>i.uid===uid):null; const def=item?getItemDef(item.itemId):null;
    if(item&&def){
      const rarity=item.rarity||'common'; slotEl.className=`equip-slot active rarity-${rarity}`; slotEl.dataset.uid=uid; slotEl.dataset.slot=slot;
      slotEl.innerHTML=`<span class="equip-icon">${renderItemIcon(item,def)}</span><span class="equip-label">${SLOT_LABELS[slot]||slot}</span>`;
      slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
      slotEl.onclick=()=>{ if(callbacks.unequipItem) callbacks.unequipItem(state,slot,callbacks); };
      item.equipped=true; item.equippedSlot=slot;
    } else {
      slotEl.className='equip-slot empty'; slotEl.dataset.slot=slot; delete slotEl.dataset.uid;
      slotEl.innerHTML=`<span class="equip-placeholder">${SLOT_ICONS[slot]||'📦'}</span><span class="equip-label">${SLOT_LABELS[slot]||slot}</span>`;
      slotEl.onmouseenter=null; slotEl.onmouseleave=null; slotEl.onclick=null;
    }
  }
}
const STYLE_ID='inventory-ui-styles-final';
export function ensureInventoryStyles(){
  const host=document.getElementById('idle-host'); const target=host?.shadowRoot||document.head; if(!target) return;
  for(const oldId of ['inventory-ui-styles','inventory-ui-styles-v2','inventory-ui-styles-v3',STYLE_ID]){ const old=target.querySelector(`#${oldId}`); if(old&&oldId!==STYLE_ID) old.remove(); }
  if(target.querySelector(`#${STYLE_ID}`)) return;
  const style=document.createElement('style'); style.id=STYLE_ID; style.textContent=INVENTORY_CSS; target.appendChild(style);
}
const INVENTORY_CSS=`
/* Janela igual ao print - fundo marrom escuro borda dourada */
:host, #inventory-panel, .l2inv-wrap { background: #1b160e !important; }
/* PAPERDOLL 3 COLUNAS - IGUAL AO PRINT */
#paperdoll-grid{ display:grid !important; grid-template-columns:repeat(3,48px) !important; gap:6px !important; justify-content:center !important; padding:10px 6px !important; background:#0f0c07 !important; border:1px solid #3d2e14 !important; border-radius:4px !important; }
.equip-slot{ position:relative !important; width:48px !important; height:48px !important; border:1px solid #3d2e14 !important; border-radius:3px !important; background:#1a150e !important; display:flex !important; flex-direction:column !important; align-items:center !important; justify-content:center !important; cursor:pointer !important; overflow:hidden !important; box-sizing:border-box !important; }
.equip-slot.empty{ opacity:.9 !important; } .equip-slot.empty .equip-placeholder{ opacity:.45 !important; filter:grayscale(1) !important; }
.equip-slot.active{ border-color:#c9a227 !important; background:#221c0f !important; box-shadow:inset 0 0 6px rgba(201,162,39,.25) !important; }
.equip-slot.active:hover{ border-color:#f0c040 !important; }
.equip-slot.rarity-uncommon{border-color:#3cb043 !important} .equip-slot.rarity-rare{border-color:#3b82f6 !important} .equip-slot.rarity-epic{border-color:#a855f7 !important} .equip-slot.rarity-legendary{border-color:#f59e0b !important}
.equip-icon{ width:32px !important; height:32px !important; display:flex !important; align-items:center !important; justify-content:center !important; } .equip-icon .inventory-item-image{ width:32px !important; height:32px !important; object-fit:contain !important; }
.equip-placeholder{ font-size:18px !important; line-height:1 !important; } .equip-label{ display:none !important; }
/* GRID DA MOCHILA - 8 COLUNAS IGUAL AO PRINT */
#inventory-grid{ display:grid !important; grid-template-columns:repeat(8,44px) !important; gap:3px !important; justify-content:start !important; align-content:start !important; padding:6px !important; background:#0f0c07 !important; border:1px solid #3d2e14 !important; min-height:340px !important; }
.inv-slot{ position:relative !important; width:44px !important; height:44px !important; border:1px solid #2a2112 !important; border-radius:2px !important; background:#1e1910 !important; display:flex !important; align-items:center !important; justify-content:center !important; cursor:pointer !important; overflow:hidden !important; box-sizing:border-box !important; }
.inv-slot:hover{ border-color:#8a6a1a !important; background:#2a2112 !important; }
.inv-slot.is-selected{ border-color:#4a90d9 !important; box-shadow:0 0 4px rgba(74,144,217,.6) !important; }
.inv-slot.rarity-uncommon{border-color:#2d5a2d !important} .inv-slot.rarity-rare{border-color:#2a4a7a !important} .inv-slot.rarity-epic{border-color:#4a2d6a !important} .inv-slot.rarity-legendary{border-color:#6a4a14 !important}
.item-icon{ width:34px !important; height:34px !important; display:flex !important; align-items:center !important; justify-content:center !important; } .inventory-item-image{ width:34px !important; height:34px !important; object-fit:contain !important; image-rendering:pixelated !important; } .inventory-item-emoji{ font-size:20px !important; }
.item-name{ display:none !important; } /* nome só no tooltip, igual ao print */
.qty{ position:absolute !important; bottom:0 !important; right:2px !important; font-size:9px !important; color:#fff !important; font-weight:700 !important; text-shadow:1px 1px 0 #000, -1px -1px 0 #000 !important; line-height:1 !important; } 
.equipped-badge{ position:absolute !important; top:1px !important; right:1px !important; width:8px !important; height:8px !important; font-size:7px !important; background:#4a90d9 !important; color:#fff !important; border-radius:2px !important; display:flex !important; align-items:center !important; justify-content:center !important; }
.inv-check{ position:absolute !important; top:1px !important; left:1px !important; width:10px !important; height:10px !important; background:#4a90d9 !important; color:#fff !important; font-size:8px !important; border-radius:2px !important; display:flex !important; align-items:center !important; justify-content:center !important; line-height:1 !important; }
.inv-slot:not(.is-selected) .inv-check{ display:none !important; }
/* corrige coluna da esquerda que estava esticando */
.l2inv-doll-col{ width:170px !important; min-width:170px !important; max-width:170px !important; flex:0 0 170px !important; }
`;
