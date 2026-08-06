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
  const order=['helmet','hair','hair2','armor','legs','gloves','boots','weapon','shield','necklace','earring1','earring2','ring','ring2','cloak','belt','talisman','agathion'];
  for(const slot of order){ const el=findEquipmentSlot(slot); if(el && el.parentElement!==grid) grid.appendChild(el); }
  for(const slot of ALL_EQUIP_SLOTS){ const el=findEquipmentSlot(slot); if(el && !grid.contains(el)) grid.appendChild(el); }
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
    slotEl.innerHTML=`${check}<span class="item-icon">${renderItemIcon(item,def)}</span>${qty}${equippedTag}`;
    slotEl.title=def.name;
    slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
    slotEl.onclick=(e)=>{ e.stopPropagation(); if(callbacks.toggleSelectItem){ callbacks.toggleSelectItem(item.uid); updateInventoryUI(state,callbacks); }};
    slotEl.oncontextmenu=(e)=>{ e.preventDefault(); e.stopPropagation(); if(item.equipped){ if(callbacks.unequipItem) callbacks.unequipItem(state,item.equippedSlot||resolveEquipSlot(def.slot,state.equipment),callbacks); } else if(callbacks.equipItem) callbacks.equipItem(state,item.uid,callbacks); };
    slotEl.ondblclick=(e)=>{ e.stopPropagation(); if(CONSUMABLE_SLOTS.includes(defSlot)&&callbacks.useItem) callbacks.useItem(item.uid); };
    grid.appendChild(slotEl);
  }
  const cnt=findElement('inv-count'); const maxSlots=getMaxInventorySlots(state); if(cnt) cnt.textContent=`${state.inventory?.length||0} / ${maxSlots}`;
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
      slotEl.innerHTML=`<span class="equip-icon">${renderItemIcon(item,def)}</span>`;
      slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
      slotEl.onclick=()=>{ if(callbacks.unequipItem) callbacks.unequipItem(state,slot,callbacks); };
      item.equipped=true; item.equippedSlot=slot;
    } else {
      slotEl.className='equip-slot empty'; slotEl.dataset.slot=slot; delete slotEl.dataset.uid;
      slotEl.innerHTML=`<span class="equip-placeholder">${SLOT_ICONS[slot]||'📦'}</span>`;
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
const INVENTORY_CSS = `
/* PAINEL DO INVENTÁRIO DOCKADO NA COLUNA DIREITA - NÃO É MAIS MODAL */
#inventory-panel, .inventory-panel, #inventory-window {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  margin: 0 !important;
  background: linear-gradient(180deg, #2a241c 0%, #1a1611 100%) !important;
  border: 2px solid #4a3a2a !important;
  border-radius: 8px !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  box-shadow: 0 0 20px rgba(0,0,0,0.6) !important;
}
.inventory-body, #inventory-body {
  flex: 1 !important;
  display: flex !important;
  flex-direction: row !important;
  overflow: hidden !important;
  padding: 8px !important;
  gap: 10px !important;
  min-height: 0 !important;
}
.l2inv-doll-col {
  width: 220px !important; min-width: 220px !important; flex: 0 0 220px !important;
  display: flex !important; flex-direction: column !important; gap: 6px !important;
  background: radial-gradient(ellipse at center, #2a241c 0%, #17120e 100%) !important;
  border: 1px solid #3a2a1a !important; border-radius: 6px !important;
  padding: 6px !important; box-sizing: border-box !important;
}
#paperdoll-grid{
  display:grid!important; grid-template-columns:repeat(3, 64px)!important;
  grid-template-rows:repeat(6, 64px)!important; gap:6px!important;
  justify-content:center!important; padding:10px!important;
  background:radial-gradient(ellipse at center, #2a241c 0%, #17120e 100%)!important;
  border:1px solid #3a2a1a!important; border-radius:6px!important;
  grid-template-areas: "earring1 helmet earring2" "necklace armor cloak" "hair legs hair2" "weapon gloves shield" "ring belt ring2" "boots talisman agathion"!important;
  width:fit-content!important; margin:0 auto!important;
}
.equip-slot{width:64px!important; height:64px!important; background:#1a1611!important; border:1px solid #4a3a2a!important; border-radius:3px!important;}
.equip-slot.active{border-color:#c9a227!important;}
/* GRID DA DIREITA - AGORA PREENCHE A COLUNA */
#inventory-grid, .inventory-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fill, 42px) !important;
  grid-auto-rows: 42px !important;
  gap: 3px !important;
  padding: 10px !important;
  background: rgba(0,0,0,0.4) !important;
  border: 1px solid #3a2a1a !important;
  border-radius: 4px !important;
  overflow-y: auto !important;
  align-content: start !important;
  flex: 1 !important;
}
.inv-slot{width:42px!important; height:42px!important; background:#241e16!important; border:1px solid #3d2e1e!important;}
.inventory-item-image{width:32px!important; height:32px!important;}
.item-name{display:none!important;}
.qty{font-size:9px!important; bottom:1px!important; right:2px!important;}
`;
