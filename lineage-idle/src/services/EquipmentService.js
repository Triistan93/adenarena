/**
 * EquipmentService.js — Gestão de Equipamentos do Lineage Idle.
 *
 * Responsável por resolver slots de equipamento (anéis, brincos, escudos),
 * equipar/desequipar itens e migrar saves antigos para o paperdoll de 18 slots.
 */

import { D, ALL_EQUIP_SLOTS } from '../core/GameConfig.js';
import { getStats } from '../engine/StatsEngine.js';

/**
 * Resolve o slot real de equipamento com base no paperdoll de 18 slots.
 * Anéis e brincos usam o primeiro slot vazio do par.
 *
 * @param {string} rawSlot — Slot declarado no item (ex: 'earring', 'cape', 'breastplate')
 * @param {Object} [equipmentState] — Estado atual dos equipamentos (para desempate)
 * @returns {string}
 */
export function resolveEquipSlot(rawSlot, equipmentState = {}) {
  const slot = String(rawSlot || '').trim().toLowerCase();

  const firstEmpty = (...candidates) => {
    const valid = candidates.filter(c => ALL_EQUIP_SLOTS.includes(c));
    return valid.find(c => !equipmentState?.[c]) || valid[0] || candidates[0];
  };

  // Pares dinâmicos
  if (slot === 'earring' || slot === 'earrings') return firstEmpty('earring1', 'earring2');
  if (slot === 'ring') return firstEmpty('ring', 'ring2');
  if (slot === 'ring1') return 'ring';

  const ALIAS = {
    // Armas → weapon
    sword: 'weapon', bow: 'weapon', dagger: 'weapon', blunt: 'weapon',
    staff: 'weapon', spear: 'weapon', fist: 'weapon', crossbow: 'weapon',
    // Corpo
    chest: 'armor', body: 'armor', breastplate: 'armor', robe: 'armor',
    helm: 'helmet', head: 'helmet',
    glove: 'gloves', hands: 'gloves',
    boot: 'boots', feet: 'boots', shoes: 'boots',
    pants: 'legs', gaiters: 'legs', leggings: 'legs',
    offhand: 'shield', sigil: 'shield',
    // Extras
    cape: 'cloak', back: 'cloak',
    waist: 'belt',
    neck: 'necklace', pendant: 'necklace', amulet: 'necklace',
    headgear: 'hair', hair1: 'hair',
    mask: 'hair2'
  };

  const mapped = ALIAS[slot] || slot;
  return ALL_EQUIP_SLOTS.includes(mapped) ? mapped : slot;
}

/**
 * Migra saves antigos (earring → earring1, cape → cloak).
 * Idempotente — pode ser chamada a qualquer momento.
 * @param {Object} state
 */
export function migrateEquipmentSlots(state) {
  if (!state?.equipment) return;
  const eq = state.equipment;

  if (eq.earring && !eq.earring1) eq.earring1 = eq.earring;
  delete eq.earring;

  if (eq.cape && !eq.cloak) eq.cloak = eq.cape;
  delete eq.cape;
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

  migrateEquipmentSlots(state);

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
  item.equippedSlot = targetSlot;

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
  migrateEquipmentSlots(state);

  const uid = state.equipment[slot];
  if (!uid) return;
  const item = state.inventory.find(i => i.uid === uid);
  if (item) {
    item.equipped = false;
    delete item.equippedSlot;
  }
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

// Alias de compatibilidade
export { equipItem as equipItemToSlot };
