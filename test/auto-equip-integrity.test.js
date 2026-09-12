/**
 * auto-equip-integrity.test.js
 *
 * Valida o Contrato 2 de Auto-Equip:
 * Equipment → Compatibility → Auto-Equip → Stats → CP
 *
 * Cobertura de Testes:
 * - Filtro estrito de categoria: apenas EQUIPMENT (com equipmentType) pode ser candidato.
 * - Rejeição absoluta de MATERIAL, CONSUMABLE, POTION, SCROLL, CRAFTING, QUEST.
 * - Nunca permitir alocação em slots incorretos (poção em anel, scroll em elmo, material em arma).
 * - Armas de 2 mãos limpam automaticamente escudo e arma secundária.
 * - Transação atômica do loadout (commit completo ou nenhum).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateAutoEquipProposal,
  commitAutoEquipProposal,
  calculateEquipmentRecommendationScore
} from '../lineage-idle/src/services/EquipmentService.js';
import {
  getItemCategory,
  getEquipmentType,
  isEquippableItem,
  ITEM_CATEGORIES,
  EQUIPMENT_TYPES
} from '../lineage-idle/src/services/ItemClassificationService.js';
import { ALL_EQUIP_SLOTS } from '../lineage-idle/src/core/GameConfig.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

function createMockState() {
  return {
    charName: 'TestPaladin',
    level: 50,
    class: 'paladin',
    inventory: [
      // Equipamentos válidos
      { uid: 'wpn_sword', itemId: 'tsurugi', slot: 'weapon', type: 'sword', atk: 120, grade: 'C', count: 1 },
      { uid: 'wpn_bow_2h', itemId: 'dark_elven_bow', slot: 'weapon', type: 'bow', atk: 180, grade: 'C', count: 1 },
      { uid: 'shield_c', itemId: 'composite_shield', slot: 'shield', def: 55, grade: 'C', count: 1 },
      { uid: 'helm_c', itemId: 'composite_helm', slot: 'helmet', def: 35, grade: 'C', count: 1 },
      { uid: 'armor_c', itemId: 'composite_armor', slot: 'armor', def: 85, grade: 'C', count: 1 },
      { uid: 'ring_c1', itemId: 'moonstone_ring', slot: 'ring', mdef: 25, grade: 'C', count: 1 },
      { uid: 'ring_c2', itemId: 'ring_of_ages', slot: 'ring', mdef: 22, grade: 'C', count: 1 },

      // Itens NÃO-EQUIPAMENTO (devem ser rejeitados categoricamente)
      { uid: 'mat_iron', itemId: 'iron_ore', slot: 'material', count: 200 },
      { uid: 'mat_varnish', itemId: 'varnish', slot: 'material', count: 150 },
      { uid: 'pot_hp', itemId: 'hp_potion', slot: 'consumable', count: 100 },
      { uid: 'pot_mp', itemId: 'mp_potion', slot: 'consumable', count: 50 },
      { uid: 'scrl_wpn', itemId: 'scroll_enchant_weapon_c', slot: 'scroll', count: 10 },
      { uid: 'recipe_sword', itemId: 'recipe_tsurugi', slot: 'recipe', count: 1 },
      { uid: 'quest_token', itemId: 'quest_mark', slot: 'quest', isQuestItem: true, count: 1 }
    ],
    equipment: {},
    serverRates: { enchant: 1 }
  };
}

describe('P0-AE: Auto-Equip Pipeline & Candidate Safety Validation', () => {
  it('2.1 ItemClassificationService categoriza corretamente itens de equipamento e não-equipamento', () => {
    assert.strictEqual(getItemCategory({ slot: 'weapon' }), ITEM_CATEGORIES.EQUIPMENT);
    assert.strictEqual(getItemCategory({ slot: 'helmet' }), ITEM_CATEGORIES.EQUIPMENT);
    assert.strictEqual(getItemCategory({ slot: 'material' }), ITEM_CATEGORIES.MATERIAL);
    assert.strictEqual(getItemCategory({ slot: 'consumable' }), ITEM_CATEGORIES.CONSUMABLE);
    assert.strictEqual(getItemCategory({ slot: 'scroll' }), ITEM_CATEGORIES.SCROLL);
    assert.strictEqual(getItemCategory({ slot: 'recipe' }), ITEM_CATEGORIES.CRAFTING);
    assert.strictEqual(getItemCategory({ slot: 'quest' }), ITEM_CATEGORIES.QUEST);

    assert.strictEqual(getEquipmentType({ slot: 'weapon' }), EQUIPMENT_TYPES.WEAPON);
    assert.strictEqual(getEquipmentType({ slot: 'armor' }), EQUIPMENT_TYPES.ARMOR);
    assert.strictEqual(getEquipmentType({ slot: 'shield' }), EQUIPMENT_TYPES.ARMOR);
    assert.strictEqual(getEquipmentType({ slot: 'ring' }), EQUIPMENT_TYPES.JEWELRY);
    assert.strictEqual(getEquipmentType({ slot: 'belt' }), EQUIPMENT_TYPES.ACCESSORY);
    assert.strictEqual(getEquipmentType({ slot: 'material' }), null);
  });

  it('2.2 calculateEquipmentRecommendationScore rejeita não-equipamentos com pontuação extremamente negativa', () => {
    const state = createMockState();
    const matIron = state.inventory.find(i => i.uid === 'mat_iron');
    const potHp = state.inventory.find(i => i.uid === 'pot_hp');
    const scrl = state.inventory.find(i => i.uid === 'scrl_wpn');

    assert.strictEqual(calculateEquipmentRecommendationScore(state, matIron, 'weapon'), -999999);
    assert.strictEqual(calculateEquipmentRecommendationScore(state, potHp, 'ring1'), -999999);
    assert.strictEqual(calculateEquipmentRecommendationScore(state, scrl, 'helmet'), -999999);
  });

  it('2.3 Auto-Equip Proposal NUNCA seleciona materiais, consumíveis ou scrolls para nenhum slot', () => {
    const state = createMockState();
    const proposal = generateAutoEquipProposal(state);

    const nonEquipUids = new Set(['mat_iron', 'mat_varnish', 'pot_hp', 'pot_mp', 'scrl_wpn', 'recipe_sword', 'quest_token']);

    for (const [slot, uid] of Object.entries(proposal.proposedLoadout)) {
      if (uid) {
        assert.ok(!nonEquipUids.has(uid), `Slot ${slot} recebeu item não-equipamento ilegal: ${uid}`);
        const item = state.inventory.find(i => i.uid === uid);
        assert.ok(isEquippableItem(item), `Item no slot ${slot} deve ser equipamento legítimo`);
      }
    }
  });

  it('2.4 Armas de 2 mãos (Arco) limpam compulsoriamente os slots shield e weapon2', () => {
    const state = createMockState();
    // Equipado atualmente: Espada 1H + Escudo
    state.equipment = {
      weapon: 'wpn_sword',
      shield: 'shield_c'
    };

    // Forçamos classe para Archer para que o Arco seja superior à espada
    state.class = 'hawkeye';

    const proposal = generateAutoEquipProposal(state);
    assert.strictEqual(proposal.proposedLoadout.weapon, 'wpn_bow_2h', 'Arqueiro deve preferir arco');
    assert.strictEqual(proposal.proposedLoadout.shield, null, 'Escudo deve ser compulsoriamente removido');
    assert.strictEqual(proposal.proposedLoadout.weapon2, null, 'Arma secundária deve ser compulsoriamente nula');
  });

  it('2.5 commitAutoEquipProposal aplica atômica e definitivamente o loadout sem vazamento de estado', () => {
    const state = createMockState();
    const proposal = generateAutoEquipProposal(state);

    const commitResult = commitAutoEquipProposal(state, proposal);
    assert.strictEqual(commitResult.success, true);
    assert.ok(commitResult.appliedChanges > 0);

    // Verifica que o paperdoll foi atualizado
    assert.ok(state.equipment.weapon, 'Arma deve estar equipada');
    assert.ok(state.equipment.armor, 'Armadura deve estar equipada');

    // Verifica que nenhum item de material foi marcado como equipado
    for (const item of state.inventory) {
      if (item.slot === 'material' || item.slot === 'consumable' || item.slot === 'scroll') {
        assert.strictEqual(item.equipped, false, `Item não-equipamento ${item.itemId} não pode ter equipped=true`);
      }
    }

    // Recálculo de stats
    const stats = getStats(state);
    assert.ok(stats.atk > 0);
    assert.ok(stats.def > 0);
  });
});
