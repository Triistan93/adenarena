/**
 * enchantment-runtime-validation.test.js
 *
 * Valida o Contrato 1 de Encantamento:
 * Scroll → Modal → Target → Preview → Atomic Enchant → Stats → CP
 *
 * Cobertura de Testes:
 * - Scroll selection & target filtering (only compatible items, zero materials/potions)
 * - Atomic transaction (validation failure leaves scroll and item untouched)
 * - Success chance & stat/CP recalculation
 * - Blessed preservation (zero level loss on fail)
 * - Normal crystallization over safe limit
 * - Scroll consumption happens exclusively AFTER state mutation
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getEnchantableItems,
  getEnchantPreview,
  executeAtomicEnchant,
  getSafeEnchantLimit,
  getEnchantSuccessChance,
  ENCHANT_STATES
} from '../lineage-idle/src/services/EnchantmentService.js';
import {
  parseEnchantScroll,
  isItemCompatibleWithScroll,
  getItemCategory,
  ITEM_CATEGORIES
} from '../lineage-idle/src/services/ItemClassificationService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';

function createMockState() {
  return {
    charName: 'TestHero',
    level: 40,
    class: 'gladiator',
    inventory: [
      { uid: 'wpn_c', itemId: 'sword_revolution', slot: 'weapon', grade: 'C', atk: 80, count: 1, enchant: 0 },
      { uid: 'arm_c', itemId: 'composite_armor', slot: 'armor', grade: 'C', def: 60, count: 1, enchant: 0 },
      { uid: 'wpn_d', itemId: 'bastard_sword', slot: 'weapon', grade: 'D', atk: 45, count: 1, enchant: 0 },
      { uid: 'pot_hp', itemId: 'hp_potion', slot: 'consumable', count: 50 },
      { uid: 'mat_iron', itemId: 'iron_ore', slot: 'material', count: 100 },
      { uid: 'quest_item', itemId: 'quest_token', slot: 'quest', isQuestItem: true, count: 1 },
      { uid: 'scrl_wpn_c', itemId: 'scroll_enchant_weapon_c', slot: 'scroll', count: 3 },
      { uid: 'scrl_arm_c', itemId: 'scroll_enchant_armor_c', slot: 'scroll', count: 2 },
      { uid: 'scrl_blessed_c', itemId: 'scroll_blessed_weapon_c', slot: 'scroll', count: 1 }
    ],
    equipment: {
      weapon: 'wpn_c',
      armor: 'arm_c'
    },
    serverRates: { enchant: 1 }
  };
}

describe('P0-ENC: Enchantment Runtime & Atomic Transaction Validation', () => {
  it('1.1 parseEnchantScroll decodifica corretamente tipo de alvo, grau e blessed', () => {
    const wpnC = parseEnchantScroll({ itemId: 'scroll_enchant_weapon_c' });
    assert.strictEqual(wpnC.isScroll, true);
    assert.strictEqual(wpnC.targetType, 'WEAPON');
    assert.strictEqual(wpnC.grade, 'C');
    assert.strictEqual(wpnC.isBlessed, false);

    const armC = parseEnchantScroll({ itemId: 'scroll_enchant_armor_c' });
    assert.strictEqual(armC.isScroll, true);
    assert.strictEqual(armC.targetType, 'ARMOR');
    assert.strictEqual(armC.grade, 'C');

    const blessed = parseEnchantScroll({ itemId: 'scroll_blessed_weapon_c' });
    assert.strictEqual(blessed.isBlessed, true);
    assert.strictEqual(blessed.targetType, 'WEAPON');

    const potion = parseEnchantScroll({ itemId: 'hp_potion' });
    assert.strictEqual(potion.isScroll, false);
  });

  it('1.2 Target Filter: Lista estritamente armas/armaduras do mesmo grau e rejeita materiais e consumíveis', () => {
    const state = createMockState();
    const scrollWeaponC = state.inventory.find(i => i.uid === 'scrl_wpn_c');
    const scrollArmorC = state.inventory.find(i => i.uid === 'scrl_arm_c');

    const weaponTargets = getEnchantableItems(state, scrollWeaponC);
    assert.strictEqual(weaponTargets.length, 1);
    assert.strictEqual(weaponTargets[0].uid, 'wpn_c', 'Weapon scroll C só pode listar sword_revolution (C-grade weapon)');

    const armorTargets = getEnchantableItems(state, scrollArmorC);
    assert.strictEqual(armorTargets.length, 1);
    assert.strictEqual(armorTargets[0].uid, 'arm_c', 'Armor scroll C só pode listar composite_armor (C-grade armor)');

    // Verifica que materiais, poções e quest items NUNCA aparecem
    const allTargets = [...weaponTargets, ...armorTargets];
    assert.ok(!allTargets.some(t => t.itemId === 'hp_potion'), 'Poções nunca são alvo');
    assert.ok(!allTargets.some(t => t.itemId === 'iron_ore'), 'Materiais nunca são alvo');
    assert.ok(!allTargets.some(t => t.itemId === 'quest_token'), 'Itens de quest nunca são alvo');
  });

  it('1.3 Preview Canônico calcula deltas e chances sem alterar estado do jogo', () => {
    const state = createMockState();
    const preview = getEnchantPreview(state, 'wpn_c', 'scrl_wpn_c');

    assert.strictEqual(preview.ok, true);
    assert.strictEqual(preview.targetItem.currentEnchant, 0);
    assert.strictEqual(preview.targetItem.targetEnchant, 1);
    assert.strictEqual(preview.successChance, 1.0, 'Safe limit 0->1 must be 100%');
    assert.ok(preview.deltas.pAtk > 0, 'P.Atk delta must be positive');
    assert.ok(preview.deltas.cp > 0, 'CP delta must be positive');

    // Verifica que nada no inventário foi mutado durante a geração de preview
    const weapon = state.inventory.find(i => i.uid === 'wpn_c');
    const scroll = state.inventory.find(i => i.uid === 'scrl_wpn_c');
    assert.strictEqual(weapon.enchant, 0);
    assert.strictEqual(scroll.count, 3);
  });

  it('1.4 Transação Atômica: Falha de validação aborta sem consumir scroll ou alterar item', () => {
    const state = createMockState();
    // Tentativa ilegal: aplicar scroll de Arma em Armadura
    const res = executeAtomicEnchant(state, 'arm_c', 'scrl_wpn_c');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.state, ENCHANT_STATES.INVALID);

    const armor = state.inventory.find(i => i.uid === 'arm_c');
    const scroll = state.inventory.find(i => i.uid === 'scrl_wpn_c');
    assert.strictEqual(armor.enchant, 0, 'Armadura não pode ser alterada');
    assert.strictEqual(scroll.count, 3, 'Scroll não pode ser consumido em validação falha');
  });

  it('1.5 Sucesso Seguro (+0 -> +1): Atualiza enchant, recalcula stats/CP e consome exatamente 1 scroll', () => {
    const state = createMockState();
    const initialCp = CombatPowerService.calculateCombatPower(state);
    const initialStats = getStats(state);

    const res = executeAtomicEnchant(state, 'wpn_c', 'scrl_wpn_c');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.result, 'SUCCESS');

    const weapon = state.inventory.find(i => i.uid === 'wpn_c');
    const scroll = state.inventory.find(i => i.uid === 'scrl_wpn_c');

    assert.strictEqual(weapon.enchant, 1, 'Arma deve estar +1');
    assert.strictEqual(scroll.count, 2, 'Exatamente 1 scroll deve ter sido deduzido (3 -> 2)');

    // Paridade Canônica com StatsEngine e CombatPowerService
    const newStats = getStats(state);
    const newCp = CombatPowerService.calculateCombatPower(state);
    assert.ok(newStats.atk >= initialStats.atk, 'StatsEngine deve refletir o bônus de refino da arma equipada');
    assert.ok(newCp > initialCp, 'CombatPowerService deve subir com o encantamento');
  });

  it('1.6 Falha Blessed preserva nível sem destruir item e consome scroll', () => {
    const state = createMockState();
    const weapon = state.inventory.find(i => i.uid === 'wpn_c');
    weapon.enchant = 7; // Acima do safe limit

    // Forçar Math.random para falhar (> chance de sucesso)
    const originalRandom = Math.random;
    Math.random = () => 0.999;

    try {
      const res = executeAtomicEnchant(state, 'wpn_c', 'scrl_blessed_c');
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.result, 'PROTECTED');
      assert.strictEqual(weapon.enchant, 7, 'Nível deve ser preservado pelo blessed');

      const blessedScroll = state.inventory.find(i => i.uid === 'scrl_blessed_c');
      assert.strictEqual(blessedScroll, undefined, 'Scroll blessed com count 1 deve ter sido consumido');
    } finally {
      Math.random = originalRandom;
    }
  });

  it('1.7 Falha Crítica com Scroll Normal acima do Safe Limit cristaliza item e desequipa', () => {
    const state = createMockState();
    const weapon = state.inventory.find(i => i.uid === 'wpn_c');
    weapon.enchant = 5; // Grau C safe limit é 3; +5 é cristalizável

    const originalRandom = Math.random;
    Math.random = () => 0.999; // Força falha

    try {
      const res = executeAtomicEnchant(state, 'wpn_c', 'scrl_wpn_c');
      assert.strictEqual(res.ok, true);
      assert.strictEqual(res.result, 'CRYSTALLIZED');

      // Verifica que a arma foi removida do equipamento e da mochila
      assert.strictEqual(state.equipment.weapon, null, 'Arma destruída deve ser desequipada');
      assert.ok(!state.inventory.some(i => i.uid === 'wpn_c'), 'Arma destruída é removida do inventário');

      // Verifica que os cristais de Grau C foram concedidos
      const crystals = state.inventory.find(i => i.itemId === 'crystal_c');
      assert.ok(crystals && crystals.count > 0, 'Cristais de Grau C devem ter sido concedidos');
    } finally {
      Math.random = originalRandom;
    }
  });
});
