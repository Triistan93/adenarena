import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';

export function resolveEquipSlot(rawSlot, equipmentState = {}) {
  const slot = String(rawSlot || '').trim().toLowerCase();
  const firstEmpty = (...candidates) => {
    const valid = candidates.filter(c => ALL_EQUIP_SLOTS.includes(c));
    return valid.find(c => !equipmentState?.[c]) || valid[0] || candidates[0];
  };
  if (slot === 'earring' || slot === 'earrings') return firstEmpty('earring1', 'earring2');
  if (slot === 'ring') return firstEmpty('ring', 'ring2');
  if (slot === 'ring1') return 'ring';
  const ALIAS = {
    sword: 'weapon', bow: 'weapon', dagger: 'weapon', blunt: 'weapon', staff: 'weapon',
    chest: 'armor', body: 'armor', breastplate: 'armor', robe: 'armor',
    helm: 'helmet', head: 'helmet', glove: 'gloves', hands: 'gloves',
    boot: 'boots', feet: 'boots', pants: 'legs', gaiters: 'legs',
    offhand: 'shield', sigil: 'shield', cape: 'cloak', back: 'cloak',
    waist: 'belt', neck: 'necklace', headgear: 'hair', mask: 'hair2'
  };
  const mapped = ALIAS[slot] || slot;
  return ALL_EQUIP_SLOTS.includes(mapped) ? mapped : slot;
}
export function migrateEquipmentSlots(state) {
  if (!state?.equipment) return;
  if (state.equipment.earring && !state.equipment.earring1) state.equipment.earring1 = state.equipment.earring;
  if (state.equipment.cape && !state.equipment.cloak) state.equipment.cloak = state.equipment.cape;
  delete state.equipment.earring;
  delete state.equipment.cape;
}
export function equipItem(state, uid, callbacks = {}) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const def = D()?.ALL_ITEMS?.[item.itemId];
  if (!def) return;
  migrateEquipmentSlots(state);
  const targetSlot = resolveEquipSlot(def.slot, state.equipment);
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
