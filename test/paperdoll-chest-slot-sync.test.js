import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_EQUIP_SLOTS, CANONICAL_PAPERDOLL_20_SLOTS } from '../lineage-idle/src/core/GameConfig.js';
import {
  equipItem,
  unequipItem,
  migrateEquipmentSlots,
  generateAutoEquipProposal
} from '../lineage-idle/src/services/EquipmentService.js';
import { NextActionAdvisor } from '../lineage-idle/src/services/NextActionAdvisor.js';
import { getStats, getTotalEquipBonuses } from '../lineage-idle/src/engine/StatsEngine.js';

// Setup GameData mock
globalThis.GameData = globalThis.GameData || {};
globalThis.GameData.ALL_ITEMS = globalThis.GameData.ALL_ITEMS || {};
globalThis.GameData.ALL_ITEMS['composite_armor'] = {
  id: 'composite_armor',
  name: 'Composite Armor',
  slot: 'armor',
  pDef: 120,
  req: { level: 40 }
};
globalThis.GameData.ALL_ITEMS['wooden_breastplate'] = {
  id: 'wooden_breastplate',
  name: 'Wooden Breastplate',
  slot: 'chest',
  pDef: 30,
  req: { level: 1 }
};

describe('Paperdoll Chest Slot & Auto-Equip Advisor Sync', () => {

  it('1. Markup & Config: Canonical slot is chest and markup has data-slot="chest"', () => {
    assert.ok(CANONICAL_PAPERDOLL_20_SLOTS.includes('chest'), 'CANONICAL_PAPERDOLL_20_SLOTS must contain chest');
    assert.ok(ALL_EQUIP_SLOTS.includes('chest'), 'ALL_EQUIP_SLOTS must contain chest');

    const markupPath = path.resolve('src/idle/markup.ts');
    const markupContent = fs.readFileSync(markupPath, 'utf8');
    assert.ok(markupContent.includes('data-slot="chest"'), 'markup.ts must have data-slot="chest"');
    assert.ok(markupContent.includes('id="pd-item-chest"'), 'markup.ts must have id="pd-item-chest"');
  });

  it('2. Equip & Legacy Migration: equipping armor populates chest and keeps armor in sync', () => {
    const state = DEFAULT_STATE();
    state.level = 45;
    state.inventory.push({
      uid: 'uid_comp_armor',
      itemId: 'composite_armor',
      equipped: false
    });

    equipItem(state, 'uid_comp_armor');

    assert.strictEqual(state.equipment.chest, 'uid_comp_armor', 'state.equipment.chest must hold item UID');
    assert.strictEqual(state.equipment.armor, 'uid_comp_armor', 'state.equipment.armor must mirror chest');
    const invItem = state.inventory.find(i => i.uid === 'uid_comp_armor');
    assert.strictEqual(invItem.equipped, true, 'Item must be marked equipped');
  });

  it('3. Auto-Equip Evaluator: occupied chest slot eliminates false-positive pending equip prompt', () => {
    const state = DEFAULT_STATE();
    state.level = 45;
    state.inventory.push({
      uid: 'uid_comp_armor',
      itemId: 'composite_armor',
      equipped: false
    });

    // Equip the armor
    equipItem(state, 'uid_comp_armor');

    // Generate proposal
    const proposal = generateAutoEquipProposal(state);

    // There should be no proposed changes for the chest slot because the best item is already equipped
    const chestChange = proposal.changes.find(c => c.slot === 'chest' || c.slot === 'armor');
    assert.strictEqual(chestChange, undefined, 'There must be no pending proposal for chest/armor');

    // NextActionAdvisor must NOT report "⚡ Equipamento Pendente Detectado"
    const advice = NextActionAdvisor.getAdvice(state);
    if (advice && advice.category === 'AUTO_EQUIP') {
      assert.notStrictEqual(advice.title, '⚡ Equipamento Pendente Detectado');
    }
  });

  it('4. Unequip Item: unequipping clears both chest and armor slots and resets stats', () => {
    const state = DEFAULT_STATE();
    state.level = 45;
    state.inventory.push({
      uid: 'uid_comp_armor',
      itemId: 'composite_armor',
      equipped: false
    });

    equipItem(state, 'uid_comp_armor');
    assert.strictEqual(state.equipment.chest, 'uid_comp_armor');

    unequipItem(state, 'chest');
    assert.strictEqual(state.equipment.chest, null);
    assert.strictEqual(state.equipment.armor, null);
    assert.strictEqual(state.inventory.find(i => i.uid === 'uid_comp_armor').equipped, false);
  });

  it('5. StatsEngine: zero duplicate stat drift between chest and armor slots', () => {
    const state = DEFAULT_STATE();
    state.level = 45;
    state.inventory.push({
      uid: 'uid_comp_armor',
      itemId: 'composite_armor',
      equipped: false
    });

    equipItem(state, 'uid_comp_armor');
    assert.strictEqual(state.equipment.chest, 'uid_comp_armor');
    assert.strictEqual(state.equipment.armor, 'uid_comp_armor');

    const equipBonus = getTotalEquipBonuses(state);
    // Composite armor provides 120 pDef; it must NOT be counted twice (240)
    assert.strictEqual(equipBonus.def, 120, 'Equip bonus must be exactly 120 pDef without double counting');
  });

  it('6. Backward Compatibility: migrating legacy save with only equipment.armor initializes chest', () => {
    const legacyState = {
      equipment: {
        armor: 'legacy_armor_uid'
      }
    };

    migrateEquipmentSlots(legacyState);
    assert.strictEqual(legacyState.equipment.chest, 'legacy_armor_uid');
    assert.strictEqual(legacyState.equipment.armor, 'legacy_armor_uid');
  });
});
