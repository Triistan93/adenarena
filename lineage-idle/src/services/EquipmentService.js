import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';
import { canEquipByType } from '../data/items/item_class_rules.js';

export function resolveEquipSlot(rawSlot, equipmentState = {}) {
  const slot = String(rawSlot || '').trim().toLowerCase();
  const firstEmpty = (...candidates) => {
    const valid = candidates.filter(c => ALL_EQUIP_SLOTS.includes(c));
    return valid.find(c => !equipmentState?.[c]) || valid[0] || candidates[0];
  };

  if (slot === 'earring' || slot === 'earrings') return firstEmpty('earring1', 'earring2');
  if (slot === 'ring' || slot === 'rings') return firstEmpty('ring1', 'ring2');
  if (slot === 'hair' || slot === 'headgear') return firstEmpty('hair1', 'hair2');
  if (slot === 'agathion') return firstEmpty('agathion1', 'agathion2', 'agathion3', 'agathion4', 'agathion5', 'agathion6');
  if (slot === 'jewel') return firstEmpty('jewel1', 'jewel2', 'jewel3', 'jewel4', 'jewel5', 'jewel6');
  if (slot === 'talisman') return firstEmpty('talisman1', 'talisman2', 'talisman3', 'talisman4', 'talisman5', 'talisman6');

  const ALIAS = {
    sword: 'weapon', bow: 'weapon', dagger: 'weapon', blunt: 'weapon', staff: 'weapon',
    chest: 'armor', body: 'armor', breastplate: 'armor', robe: 'armor',
    helm: 'helmet', head: 'helmet', glove: 'gloves', hands: 'gloves',
    boot: 'boots', feet: 'boots', pants: 'legs', gaiters: 'legs',
    offhand: 'shield', sigil: 'shield', cape: 'cloak', back: 'cloak',
    waist: 'belt', neck: 'necklace', ring: 'ring1', ring1: 'ring1', ring2: 'ring2',
    hair: 'hair1', hair1: 'hair1', hair2: 'hair2', mask: 'hair2',
    agathion_bracelet: 'agathion_bracelet', talisman_bracelet: 'talisman_bracelet', brooch: 'brooch'
  };
  const mapped = ALIAS[slot] || slot;
  return ALL_EQUIP_SLOTS.includes(mapped) ? mapped : slot;
}

export function migrateEquipmentSlots(state) {
  if (!state?.equipment) return;
  if (state.equipment.earring && !state.equipment.earring1) state.equipment.earring1 = state.equipment.earring;
  if (state.equipment.ring && !state.equipment.ring1) state.equipment.ring1 = state.equipment.ring;
  if (state.equipment.hair && !state.equipment.hair1) state.equipment.hair1 = state.equipment.hair;
  if (state.equipment.cape && !state.equipment.cloak) state.equipment.cloak = state.equipment.cape;
  delete state.equipment.earring;
  delete state.equipment.ring;
  delete state.equipment.hair;
  delete state.equipment.cape;
}
export function equipItem(state, uid, callbacks = {}) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const def = D()?.ALL_ITEMS?.[item.itemId];
  if (!def) return;
  migrateEquipmentSlots(state);
  const targetSlot = resolveEquipSlot(def.slot, state.equipment);
  // Validate level
  if (def.req?.level && state.level < def.req.level) {
    if (callbacks.log) callbacks.log(`Nível insuficiente para equipar ${def.name}. (Req: Lv.${def.req.level})`, 'system');
    return;
  }
  // Validate class / armor type
  const equipCheck = canEquipByType(state.class, def, callbacks.classSatisfies);
  if (!equipCheck.ok) {
    if (callbacks.log) callbacks.log(`Não pode equipar ${def.name}: ${equipCheck.reason || 'Classe incompatível'}`, 'system');
    return;
  }
  if (!ALL_EQUIP_SLOTS.includes(targetSlot)) {
    if (callbacks.log) callbacks.log(`${def.name} não pode ser equipado.`, 'system');
    return;
  }
  const currentUid = state.equipment[targetSlot];
  if (currentUid) {
    const current = state.inventory.find(i => i.uid === currentUid);
    if (current) current.equipped = false;
  }
  state.equipment[targetSlot] = uid;
  item.equipped = true;
  item.equippedSlot = targetSlot;
  if (callbacks.log) callbacks.log(`Equipou ${def.name}`, 'loot');
  const stats = getStats(state);
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp); state.mp = Math.min(state.mp, state.maxMp);
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
export function unequipItem(state, slot, callbacks = {}) {
  migrateEquipmentSlots(state);
  const uid = state.equipment[slot];
  if (!uid) return;
  const item = state.inventory.find(i => i.uid === uid);
  if (item) { item.equipped = false; delete item.equippedSlot; }
  state.equipment[slot] = null;
  const stats = getStats(state);
  state.maxHp = stats.maxHp; state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp); state.mp = Math.min(state.mp, state.maxMp);
  if (callbacks.log) callbacks.log(`Desequipou ${slot}`, 'system');
  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
export { equipItem as equipItemToSlot };
