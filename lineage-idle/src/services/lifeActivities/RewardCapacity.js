import { D } from '../../core/GameConfig.js';
import { getMaxInventorySlots } from '../InventoryService.js';

/** Checks whether stackable activity rewards fit without mutating the save. */
export function hasRoomForStackRewards(state, rewards) {
  const inventory = Array.isArray(state?.inventory) ? state.inventory : [];
  const itemDefs = D()?.ALL_ITEMS || {};
  const totals = new Map();

  for (const reward of rewards || []) {
    if (!reward?.itemId || !Number.isSafeInteger(reward.count) || reward.count <= 0) continue;
    totals.set(reward.itemId, (totals.get(reward.itemId) || 0) + reward.count);
  }

  let slotsNeeded = 0;
  for (const [itemId, amount] of totals) {
    const def = itemDefs[itemId] || { id: itemId, slot: 'material' };
    const maxStack = Math.max(1, Math.floor(Number(def.stack) || 99999));
    const compatibleSpace = inventory
      .filter(item => (item.itemId === itemId || item.itemId === def.id) && !item.equipped)
      .reduce((space, item) => space + Math.max(0, maxStack - (Number(item.count) || 1)), 0);
    slotsNeeded += Math.ceil(Math.max(0, amount - compatibleSpace) / maxStack);
  }

  return inventory.length + slotsNeeded <= getMaxInventorySlots(state);
}
