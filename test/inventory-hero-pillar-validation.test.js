import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_EQUIP_SLOTS } from '../lineage-idle/src/core/GameConfig.js';
import { resolveEquipSlot, migrateEquipmentSlots, equipItem } from '../lineage-idle/src/services/EquipmentService.js';
import { isEligibleForAutoRecycle, getMaxInventorySlots, getMaxWarehouseSlots } from '../lineage-idle/src/services/InventoryService.js';

describe('Hero Pillar — Subtab 2: Inventory & Paperdoll (Mochila)', () => {

  it('1. Paperdoll 20 Canonical Slots: ALL_EQUIP_SLOTS defines all primary paperdoll slots and sub-slots', () => {
    const primarySlots = [
      'weapon', 'weapon2', 'shield',
      'helmet', 'armor', 'gloves', 'legs', 'boots',
      'cloak', 'belt', 'necklace',
      'earring1', 'earring2', 'ring1', 'ring2',
      'hair1', 'hair2',
      'brooch', 'agathion_bracelet', 'talisman_bracelet'
    ];
    for (const slot of primarySlots) {
      assert.ok(ALL_EQUIP_SLOTS.includes(slot), `Slot ${slot} must exist in ALL_EQUIP_SLOTS`);
    }
  });

  it('2. Slot Resolution: correctly maps aliases and fills empty secondary slots', () => {
    const emptyState = {};
    assert.strictEqual(resolveEquipSlot('weapon', emptyState), 'weapon');
    assert.strictEqual(resolveEquipSlot('earring', emptyState), 'earring1');
    assert.strictEqual(resolveEquipSlot('ring', emptyState), 'ring1');
    assert.strictEqual(resolveEquipSlot('hair', emptyState), 'hair1');
    assert.strictEqual(resolveEquipSlot('chest', emptyState), 'chest');
    assert.strictEqual(resolveEquipSlot('pants', emptyState), 'legs');
    assert.strictEqual(resolveEquipSlot('cape', emptyState), 'cloak');
    assert.strictEqual(resolveEquipSlot('waist', emptyState), 'belt');

    // When primary slot is occupied, selects secondary
    const occupiedState = { weapon: 'w1', ring1: 'r1', earring1: 'e1', hair1: 'h1' };
    assert.strictEqual(resolveEquipSlot('weapon', occupiedState), 'weapon2');
    assert.strictEqual(resolveEquipSlot('ring', occupiedState), 'ring2');
    assert.strictEqual(resolveEquipSlot('earring', occupiedState), 'earring2');
    assert.strictEqual(resolveEquipSlot('hair', occupiedState), 'hair2');
  });

  it('3. Legacy Migration: migrates old slot keys (hair, ring, cape, talisman, agathion) to canonical keys', () => {
    const state = {
      equipment: {
        hair: 'hair_item_1',
        ring: 'ring_item_1',
        cape: 'cape_item_1',
        talisman: 'talisman_item_1',
        agathion: 'agathion_item_1'
      }
    };
    migrateEquipmentSlots(state);

    assert.strictEqual(state.equipment.hair1, 'hair_item_1');
    assert.strictEqual(state.equipment.ring1, 'ring_item_1');
    assert.strictEqual(state.equipment.cloak, 'cape_item_1');
    assert.strictEqual(state.equipment.talisman_bracelet, 'talisman_item_1');
    assert.strictEqual(state.equipment.agathion_bracelet, 'agathion_item_1');
    assert.strictEqual(state.equipment.hair, undefined);
    assert.strictEqual(state.equipment.ring, undefined);
    assert.strictEqual(state.equipment.cape, undefined);
    assert.strictEqual(state.equipment.talisman, undefined);
    assert.strictEqual(state.equipment.agathion, undefined);
  });

  it('4. Auto-Recycle & Auto-Sell Protection: never recycles equipped or protected Grade A/S items', () => {
    const state = DEFAULT_STATE();
    state.autoRecycle = {
      enabled: true,
      mode: 'sell',
      maxRarity: 'rare',
      grades: { ng: true, d: true, c: true, b: true, a: false, s: false }
    };

    const equippedItem = { uid: 'eq_1', itemId: 'sword_d_01', rarity: 'common', equipped: true };
    const defD = { id: 'sword_d_01', slot: 'weapon', req: { level: 20 } };

    const gradeAItem = { uid: 'a_1', itemId: 'sword_a_01', rarity: 'rare', equipped: false };
    const defA = { id: 'sword_a_01', slot: 'weapon', req: { level: 65 } };

    const gradeSItem = { uid: 's_1', itemId: 'sword_s_01', rarity: 'epic', equipped: false };
    const defS = { id: 'sword_s_01', slot: 'weapon', req: { level: 76 } };

    const eligibleItem = { uid: 'ng_1', itemId: 'short_sword', rarity: 'common', equipped: false };
    const defNG = { id: 'short_sword', slot: 'weapon', req: { level: 1 } };

    assert.strictEqual(isEligibleForAutoRecycle(equippedItem, defD, state), false, 'Equipped item must NOT be eligible');
    assert.strictEqual(isEligibleForAutoRecycle(gradeAItem, defA, state), false, 'Grade A item must NOT be eligible when a=false');
    assert.strictEqual(isEligibleForAutoRecycle(gradeSItem, defS, state), false, 'Grade S item must NOT be eligible when s=false');
    assert.strictEqual(isEligibleForAutoRecycle(eligibleItem, defNG, state), true, 'Unprotected No-Grade item must be eligible');
  });

  it('5. Inventory Capacity: Dwarf has 250 base slots, others have 150 base slots', () => {
    const dwarfState = { race: 'dwarf' };
    const humanState = { race: 'human' };
    assert.strictEqual(getMaxInventorySlots(dwarfState), 250);
    assert.strictEqual(getMaxInventorySlots(humanState), 150);
    assert.strictEqual(getMaxWarehouseSlots(), 300);
  });

  it('6. Inventory Serialization: Full inventory items and equipment state preserve through JSON cycle', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { uid: 'item_101', itemId: 'draconic_bow', enchant: 7, rarity: 'legendary', equipped: true, equippedSlot: 'weapon' }
    ];
    state.equipment.weapon = 'item_101';

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.inventory.length, 1);
    assert.strictEqual(loaded.inventory[0].uid, 'item_101');
    assert.strictEqual(loaded.inventory[0].enchant, 7);
    assert.strictEqual(loaded.equipment.weapon, 'item_101');
  });
});
