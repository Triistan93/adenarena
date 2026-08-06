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
  const raw=String(itemId);
  const vars=[raw, raw.toLowerCase(), raw.replace(/\s+/g,''), raw.replace(/[-_]/g,'').toLowerCase()];
  for(const v of vars){ if(data.ALL_ITEMS[v]) return data.ALL_ITEMS[v]; }
  const norm=raw.toLowerCase().replace(/\s+/g,'');
  return Object.values(data.ALL_ITEMS).find(i=>i.name?.toLowerCase().replace(/\s+/g,'')===norm)||null;
}
const EMOJI_BY_SLOT={weapon:'⚔️', shield:'🛡️', armor:'🦺', helmet:'🪖', gloves:'🧤', legs:'👖', boots:'👢', cloak:'🧥', belt:'🎗️', necklace:'📿', earring:'💎', earring1:'💎', earring2:'💎', ring:'💍', ring2:'💍', hair:'👑', hair2:'🎭', agathion:'👼', talisman:'🧿', consumable:'🧪', potion:'🧪', scroll:'📜', material:'💠', gem:'💠'};
function renderItemIcon(item, def){
  let icon=''; try{ icon=getItemIcon(def||item)||''; }catch{}
  if(icon instanceof HTMLElement) return icon.outerHTML;
  const value=String(icon).trim();
  const fallback=EMOJI_BY_SLOT[(def?.slot||'').toLowerCase()]||'📦';
  if(!value) return `<span class="inventory-item-emoji">${fallback}</span>`;
  if(value.startsWith('<')) return value;
  const isImg=/^(https?:|data:image|blob:|\/|\.{1,2}\/|img\/)/i.test(value)||/\.(png|webp|jpe?g|gif|svg)/i.test(value);
  if(isImg){
    return `<img class="inventory-item-image" src="${escapeHTML(value)}" alt="${escapeHTML(def?.name||item?.itemId||'')}" draggable="false" loading="lazy" onerror="this.style.display='none';this.nextElementSibling&&(this.nextElementSibling.style.display='inline-block');"/><span class="inventory-item-emoji" style="display:none;">${fallback}</span>`;
  }
  return `<span class="inventory-item-emoji">${escapeHTML(value)}</span>`;
}

/* PAPERDOLL - GRID 3x6 = 18 SLOTS */
const PAPERDOLL_AREAS={
  helmet:'helmet', necklace:'necklace', hair:'hair',
  armor:'armor', earring1:'earring1', hair2:'hair2',
  legs:'legs', earring2:'earring2', cloak:'cloak',
  gloves:'gloves', ring:'ring', belt:'belt',
  boots:'boots', ring2:'ring2', talisman:'talisman',
  weapon:'weapon', shield:'shield', agathion:'agathion'
};
const SLOT_LABELS={weapon:'Arma', shield:'Escudo', armor:'Armadura', helmet:'Elmo', gloves:'Luvas', legs:'Calça', boots:'Bota', cloak:'Capa', belt:'Cinto', necklace:'Colar', earring1:'Brinco', earring2:'Brinco 2', ring:'Anel', ring2:'Anel 2', hair:'Cabelo', hair2:'Máscara', agathion:'Agathion', talisman:'Talismã'};
const SLOT_ICONS={weapon:'⚔️', shield:'🛡️', armor:'🦺', helmet:'🪖', gloves:'🧤', legs:'👖', boots:'👢', cloak:'🧥', belt:'🎗️', necklace:'📿', earring1:'💎', earring2:'💎', ring:'💍', ring2:'💍', hair:'👑', hair2:'🎭', agathion:'👼', talisman:'🧿'};
const ALIASES={
  weapon:['weapon'], shield:['shield','offhand','sigil'], armor:['armor','chest'], helmet:['helmet'], gloves:['gloves'], legs:['legs','pants'], boots:['boots'], cloak:['cloak','cape'], belt:['belt'], necklace:['necklace','neck'], earring1:['earring1','earring'], earring2:['earring2'], ring:['ring','ring1'], ring2:['ring2'], hair:['hair'], hair2:['hair2'], agathion:['agathion'], talisman:['talisman']
};
function findEquipmentSlot(slot){
  const root=invRoot(); const aliases=ALIASES[slot]||[slot];
  for(const alias of aliases){
    const sels=[`#${alias}`,`#equip-slot-${alias}`,`[data-slot="${alias}"]`,`[data-equip-slot="${alias}"]`];
    for(const sel of sels){ try{ const f=root.querySelector(sel); if(f) return f; }catch{} }
  }
  return null;
}
function ensurePaperdollLayout(){
  const root=invRoot();
  const any=findEquipmentSlot('weapon')||findEquipmentSlot('helmet')||findEquipmentSlot('armor');
  if(!any) return null;
  const panel=any.closest('.l2inv-doll-col')||any.parentElement; if(!panel) return null;
  let grid=root.querySelector('#paperdoll-grid');
  if(!grid){
    grid=document.createElement('div'); grid.id='paperdoll-grid';
    panel.insertBefore(grid, panel.firstChild);
  }
  // MOVE os 18 slots REAIS (id="weapon", id="helmet" etc.) para dentro do grid
  for(const slot of ALL_EQUIP_SLOTS){
    const el=findEquipmentSlot(slot);
    if(el && el.parentElement!==grid){
      grid.appendChild(el);
    }
  }
  // posiciona com grid-area
  for(const slot of ALL_EQUIP_SLOTS){
    const el=findEquipmentSlot(slot);
    if(el && PAPERDOLL_AREAS[slot]){ el.style.gridArea=PAPERDOLL_AREAS[slot]; el.style.display=''; }
  }
  return grid;
}
function createEquipmentSlotDynamically(slot){
  const grid=ensurePaperdollLayout(); if(!grid) return null;
  const el=document.createElement('div'); el.id=slot; el.dataset.slot=slot; el.className='equip-slot empty'; el.style.gridArea=PAPERDOLL_AREAS[slot]||'auto';
  grid.appendChild(el); return el;
}

export function updateInventoryUI(state, callbacks={}){
  ensureInventoryStyles(); updateEquipmentUI(state, callbacks);
  const grid=findElement('inventory-grid'); if(!grid) return; grid.innerHTML='';
  const data=D(); if(!data?.ALL_ITEMS){ grid.innerHTML='<div style="padding:20px;color:#f59e0b;text-align:center;">⚠️ Carregando...</div>'; return; }
  const selectedSet=getSelectedSet(state);
  const filter=(state.inventoryFilter||state.filter||'all').toLowerCase();
  const search=findElement('inv-search-input')?.value?.trim().toLowerCase()||'';
  const GEAR=['weapon','shield','armor','helmet','gloves','legs','boots','cloak','belt','necklace','earring','earring1','earring2','ring','ring2','hair','hair2','agathion','talisman'];
  const CONSUM=['consumable','potion','scroll','food','powerup'];
  const MAT=['material','gem','ore','craft','charcoal','suede'];
  const sorted=[...(state.inventory||[])].filter(i=>i?.itemId).sort((a,b)=>{ const da=getItemDef(a.itemId); const db=getItemDef(b.itemId); return (db?.tier||0)-(da?.tier||0); });
  for(const item of sorted){
    const def=getItemDef(item.itemId); if(!def) continue;
    if(search && !def.name.toLowerCase().includes(search)) continue;
    const slot=(def.slot||'').toLowerCase();
    if(filter!=='all'){
      if((filter==='gear'||filter==='equip') && !GEAR.includes(slot)) continue;
      if((filter==='consumable'||filter==='supplies') && !CONSUM.includes(slot)) continue;
      if((filter==='material'||filter==='crafting') && !MAT.includes(slot)) continue;
    }
    const rarity=item.rarity||'common';
    const isSel=selectedSet.has(item.uid);
    const slotEl=mkEl('div'); slotEl.className=`inv-slot rarity-${rarity}`+(item.equipped?' is-equipped':'')+(isSel?' is-selected':'');
    slotEl.dataset.uid=item.uid;
    slotEl.innerHTML=`<div class="slot-select-checkbox">${isSel?'✓':''}</div><span class="item-icon">${renderItemIcon(item,def)}</span><span class="item-name" title="${escapeHTML(def.name)}">${item.enchant?`+${item.enchant} `:''}${escapeHTML(def.name)}</span>${(item.count||1)>1?`<span class="qty">${item.count}</span>`:''}${item.equipped?'<span class="equipped-badge">E</span>':''}`;
    slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
    slotEl.onclick=(e)=>{ e.stopPropagation(); callbacks.toggleSelectItem&&callbacks.toggleSelectItem(item.uid); updateInventoryUI(state,callbacks); };
    slotEl.oncontextmenu=(e)=>{ e.preventDefault(); e.stopPropagation(); if(item.equipped){ callbacks.unequipItem&&callbacks.unequipItem(state,item.equippedSlot||resolveEquipSlot(def.slot,state.equipment),callbacks); }else{ callbacks.equipItem&&callbacks.equipItem(state,item.uid,callbacks); } };
    slotEl.ondblclick=(e)=>{ e.stopPropagation(); if(CONSUM.includes(slot)&&callbacks.useItem) callbacks.useItem(item.uid); };
    grid.appendChild(slotEl);
  }
  const cnt=findElement('inv-count'); if(cnt) cnt.textContent=`${state.inventory?.length||0} / ${getMaxInventorySlots(state)}`;
}
export function updateWarehouseUI(state, callbacks={}){ ensureInventoryStyles(); const container=findElement('warehouse-grid'); const countEl=findElement('warehouse-slot-count'); if(!container) return; state.warehouse=state.warehouse||[]; if(countEl) countEl.textContent=`${state.warehouse.length} / ${getMaxWarehouseSlots()}`; container.innerHTML=''; for(const item of state.warehouse){ const def=getItemDef(item.itemId); if(!def) continue; const slotEl=mkEl('div'); slotEl.className=`inv-slot rarity-${item.rarity||'common'}`; slotEl.innerHTML=`<span class="item-icon">${renderItemIcon(item,def)}</span><span class="item-name" title="${escapeHTML(def.name)}">${escapeHTML(def.name)}</span>${(item.count||1)>1?`<span class="qty">${item.count}</span>`:''}`; slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip(); slotEl.onclick=()=>callbacks.withdrawFromWarehouse&&callbacks.withdrawFromWarehouse(item.uid); container.appendChild(slotEl);} }
export function updateEquipmentUI(state, callbacks={}){
  if(!state) return; state.equipment=state.equipment||{}; ensureInventoryStyles(); migrateEquipmentSlots(state); ensurePaperdollLayout();
  for(const slot of ALL_EQUIP_SLOTS){
    let slotEl=findEquipmentSlot(slot); if(!slotEl) slotEl=createEquipmentSlotDynamically(slot); if(!slotEl) continue;
    const uid=state.equipment[slot]; const item=uid?(state.inventory||[]).find(i=>i.uid===uid):null; const def=item?getItemDef(item.itemId):null;
    if(item&&def){
      slotEl.className=`equip-slot active rarity-${item.rarity||'common'}`; slotEl.dataset.slot=slot; slotEl.dataset.uid=uid;
      slotEl.innerHTML=`<span class="equip-icon">${renderItemIcon(item,def)}</span><span class="equip-label">${SLOT_LABELS[slot]||slot}</span>`;
      slotEl.onmouseenter=(e)=>showItemTooltip(e,item,state,callbacks); slotEl.onmouseleave=()=>hideItemTooltip();
      slotEl.onclick=()=>callbacks.unequipItem&&callbacks.unequipItem(state,slot,callbacks);
      item.equipped=true; item.equippedSlot=slot;
    }else{
      slotEl.className='equip-slot empty'; slotEl.dataset.slot=slot; delete slotEl.dataset.uid;
      slotEl.innerHTML=`<span class="equip-placeholder">${SLOT_ICONS[slot]||'📦'}</span><span class="equip-label">${SLOT_LABELS[slot]||slot}</span>`;
      slotEl.onmouseenter=null; slotEl.onmouseleave=null; slotEl.onclick=null;
    }
  }
}
const STYLE_ID='inventory-ui-styles-final';
export function ensureInventoryStyles(){
  const host=document.getElementById('idle-host'); const target=host?.shadowRoot||document.head; if(!target) return;
  for(const oldId of ['inventory-ui-styles','inventory-ui-styles-v2','inventory-ui-styles-v3','inventory-ui-styles-final']){ const o=target.querySelector(`#${oldId}`); if(o&&oldId!==STYLE_ID) o.remove(); }
  if(target.querySelector(`#${STYLE_ID}`)) return;
  const style=document.createElement('style'); style.id=STYLE_ID; style.textContent=INVENTORY_CSS; target.appendChild(style);
}
const INVENTORY_CSS=`
/* DOLL COL LARGA O SUFICIENTE PRO PAPERDOLL */
.l2inv-doll-col{width:230px!important; min-width:220px!important; flex:0 0 230px!important; display:flex!important; flex-direction:column!important; align-items:center!important; gap:8px!important;}
/* PAPERDOLL GRID 3x6 */
#paperdoll-grid{
  display:grid!important;
  grid-template-columns:repeat(3, 62px)!important;
  grid-template-rows:repeat(6, 62px)!important;
  gap:8px!important;
  justify-content:center!important;
  padding:12px!important;
  background:rgba(0,0,0,0.25)!important;
  border:1px solid rgba(212,175,55,0.18)!important;
  border-radius:10px!important;
  grid-template-areas:
    "helmet necklace hair"
    "armor earring1 hair2"
    "legs earring2 cloak"
    "gloves ring belt"
    "boots ring2 talisman"
    "weapon shield agathion"!important;
  width:fit-content!important;
  margin:0 auto!important;
}
.equip-slot{position:relative!important; width:62px!important; height:62px!important; border:2px solid #3a3a4a!important; border-radius:8px!important; background:linear-gradient(180deg,#1e1e30,#14141f)!important; display:flex!important; flex-direction:column!important; align-items:center!important; justify-content:center!important; cursor:pointer!important; overflow:hidden!important; box-sizing:border-box!important;}
.equip-slot.empty{opacity:.75!important;}
.equip-slot.active{border-color:#c9a227!important; box-shadow:0 0 10px rgba(201,162,39,.35)!important; opacity:1!important;}
.equip-slot.active:hover{transform:scale(1.06)!important; border-color:#f59e0b!important;}
.equip-slot.rarity-rare{border-color:#3b82f6!important;} .equip-slot.rarity-epic{border-color:#a855f7!important;} .equip-slot.rarity-legendary{border-color:#f59e0b!important;}
.equip-icon{font-size:26px!important; line-height:1!important;} .equip-icon .inventory-item-image,.equip-icon img{width:38px!important; height:38px!important; object-fit:contain!important;}
.equip-placeholder{font-size:22px!important; opacity:.35!important;}
.equip-label{position:absolute!important; bottom:2px!important; left:0!important; right:0!important; font-size:7px!important; color:#8b93a7!important; text-transform:uppercase!important; text-align:center!important; line-height:1!important; pointer-events:none!important;}
.equip-slot.active .equip-label{color:#c9a227!important;}
/* MOCHILA */
.inv-slot{position:relative!important; width:64px!important; height:64px!important; border:2px solid #444!important; border-radius:6px!important; background:#1a1a2e!important; display:flex!important; flex-direction:column!important; align-items:center!important; justify-content:center!important; cursor:pointer!important; overflow:hidden!important; box-sizing:border-box!important;}
.inv-slot:hover{border-color:#f59e0b!important; transform:scale(1.05)!important;}
.inv-slot.is-equipped{border-color:#22c55e!important;}
.inv-slot.is-selected{border-color:#3b82f6!important;}
.inv-slot.rarity-rare{border-color:#3b82f6!important;} .inv-slot.rarity-epic{border-color:#a855f7!important;} .inv-slot.rarity-legendary{border-color:#f59e0b!important;}
.item-icon{display:flex!important; align-items:center!important; justify-content:center!important;} .inventory-item-image{width:34px!important; height:34px!important; object-fit:contain!important;} .inventory-item-emoji{font-size:26px!important; line-height:1!important;}
.item-name{font-size:7px!important; color:#e5e7eb!important; max-width:95%!important; white-space:nowrap!important; overflow:hidden!important; text-overflow:ellipsis!important; text-transform:uppercase!important; margin-top:3px!important;}
.qty{position:absolute!important; bottom:2px!important; right:4px!important; font-size:10px!important; color:#fbbf24!important; font-weight:bold!important; text-shadow:1px 1px 2px #000!important;}
.equipped-badge{position:absolute!important; top:2px!important; right:2px!important; font-size:9px!important; background:rgba(0,0,0,.6)!important; color:#22c55e!important; padding:1px 3px!important; border-radius:3px!important;}
.slot-select-checkbox{position:absolute!important; top:2px!important; left:2px!important; font-size:12px!important; color:#3b82f6!important;}
`;
