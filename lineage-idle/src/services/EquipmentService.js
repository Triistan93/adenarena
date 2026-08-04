/**
 * EquipmentService.js — Gestão de Equipamentos e Encantamento do Lineage Idle.
 *
 * Responsável por resolver slots de equipamento (anéis, brincos, escudos),
 * equipar/desequipar itens, auto-equipar melhor item e sistema de enchant.
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';

/**
 * Mapeia o slot do item (ou apelido) para o slot real da armadura.
 * @param {string} slot
 * @param {Object} [equipmentState] — Estado atual dos equipamentos para desempate de aneis/brincos
 * @returns {string}
 */
export function resolveEquipSlot(slot, equipmentState = {}) {
  if (slot === 'agathion') return 'agathion';
  if (['shield', 'offhand', 'sigil'].includes(slot)) return 'shield';
  if (['legs', 'gaiters', 'pants'].includes(slot)) return 'legs';
  if (['hair', 'headgear'].includes(slot)) return 'hair';
  if (['hair2', 'mask'].includes(slot)) return 'hair2';
  if (slot === 'earring') {
    if (!equipmentState.earring1) return 'earring1';
    if (!equipmentState.earring2) return 'earring2';
    return 'earring1';
  }
  if (slot === 'ring') {
    if (!equipmentState.ring) return 'ring';
    if (!equipmentState.ring2) return 'ring2';
    return 'ring';
  }
  if (slot === 'ring1') return 'ring';
  return slot;
}

/**
 * Equipa um item do inventário.
 * @param {Object} state — Estado mutável do jogo
 * @param {string} uid — UID do item na mochila
 * @param {Object} [callbacks] — { log, updateAllUI, save, classSatisfies, getClass }
 */
export function equipItem(state, uid, callbacks = {}) {
  const item = state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const gData = D();
  const def = gData?.ALL_ITEMS?.[item.itemId];
  if (!def) return;

  const targetSlot = resolveEquipSlot(def.slot, state.equipment);
  if (!ALL_EQUIP_SLOTS.includes(targetSlot)) {
    if (callbacks.log) callbacks.log(`${def.name} não pode ser equipado.`, 'system');
    return;
  }
  if (def.req && def.req.level > state.level) {
    if (callbacks.log) callbacks.log(`Nível ${def.req.level} necessário para equipar ${def.name}`, 'system');
    return;
  }
  if (def.classReq && callbacks.classSatisfies && !callbacks.classSatisfies(state.class, def.classReq)) {
    const reqClassName = callbacks.getClass ? callbacks.getClass(def.classReq)?.name : def.classReq;
    if (callbacks.log) callbacks.log(`${def.name} exige a classe: ${reqClassName}`, 'system');
    return;
  }

  const currentUid = state.equipment[targetSlot];
  if (currentUid) {
    const current = state.inventory.find(i => i.uid === currentUid);
    if (current) current.equipped = false;
  }
  state.equipment[targetSlot] = uid;
  item.equipped = true;

  if (callbacks.log) callbacks.log(`Equipou ${def.name}`, 'loot');

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp);
  state.mp = Math.min(state.mp, state.maxMp);

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}

/**
 * Desequipa um item de um slot específico.
 * @param {Object} state
 * @param {string} slot
 * @param {Object} [callbacks]
 */
export function unequipItem(state, slot, callbacks = {}) {
  const uid = state.equipment[slot];
  if (!uid) return;
  const item = state.inventory.find(i => i.uid === uid);
  if (item) item.equipped = false;
  state.equipment[slot] = null;

  const stats = getStats(state);
  state.maxHp = stats.maxHp;
  state.maxMp = stats.maxMp;
  state.hp = Math.min(state.hp, state.maxHp);
  state.mp = Math.min(state.mp, state.maxMp);

  const gData = D();
  const itemName = gData?.ALL_ITEMS?.[item ? item.itemId : '']?.name || slot;
  if (callbacks.log) callbacks.log(`Unequipped ${itemName}`, 'system');

  if (callbacks.updateAllUI) callbacks.updateAllUI();
  if (callbacks.save) callbacks.save();
}
