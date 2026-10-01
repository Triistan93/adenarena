import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { applyPlayerHealingReceivedBonus } from '../lineage-idle/src/services/SkillEffectService.js';

describe('Codex de cartas — consumo íntegro', () => {
  it('não concede uma carta ao Codex sem consumir carta existente no inventário ou baú', () => {
    const state = { inventory: [], warehouse: [], cardCodex: {} };
    const result = CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant');
    assert.equal(result.success, false);
    assert.equal(state.cardCodex.card_queen_ant, undefined);
  });

  it('rejeita quantidade inválida ou acima do estoque sem mutar o save', () => {
    for (const amount of [0, -1, 1.5, '2', 3]) {
      const state = {
        inventory: [{ uid: `queen-${amount}`, itemId: 'card_queen_ant', count: 2 }],
        warehouse: [],
        cardCodex: {}
      };
      const result = CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', amount);
      assert.equal(result.success, false, `amount=${amount}`);
      assert.equal(state.inventory[0].count, 2);
      assert.equal(state.cardCodex.card_queen_ant, undefined);
    }
  });

  it('consome somente a quantidade solicitada da pilha ou do baú e registra a mesma quantidade', () => {
    const state = {
      inventory: [],
      warehouse: [{ uid: 'queen-warehouse', itemId: 'card_queen_ant', count: 4 }],
      cardCodex: {}
    };
    const result = CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', 3);
    assert.equal(result.success, true);
    assert.equal(result.totalCards, 3);
    assert.equal(state.warehouse[0].count, 1);
    assert.equal(state.cardCodex.card_queen_ant.count, 3);
    assert.equal(state.cardCodex.card_queen_ant.rank, 2);
  });

  it('engasta carta possuída em arma equipada, consome uma cópia e aplica atributos passivos', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.equipment = { weapon: 'weapon-test' };
    state.inventory = [
      { uid: 'weapon-test', itemId: 'test_sword', slot: 'weapon', socketsMax: 2 },
      { uid: 'valakas-card', itemId: 'card_valakas', count: 2 }
    ];
    const before = getStats(state);

    const result = CardCodexService.socketCardToEquipment(state, 'weapon-test', 'card_valakas');
    const after = getStats(state);

    assert.equal(result.success, true);
    assert.deepEqual(state.inventory[0].slottedCards, ['card_valakas']);
    assert.equal(state.inventory[1].count, 1);
    assert.ok(after.atk > before.atk, 'socket P. Atk reaches calculated attack');
    assert.ok(after.matk > before.matk, 'socket M. Atk reaches calculated magic attack');
  });

  it('não consome carta em tentativa de engaste sem posse ou arma equipada', () => {
    const state = {
      inventory: [{ uid: 'card', itemId: 'card_valakas', count: 1 }],
      equipment: {},
      cardCodex: {}
    };

    const result = CardCodexService.socketCardToEquipment(state, 'missing-weapon', 'card_valakas');

    assert.equal(result.success, false);
    assert.equal(state.inventory[0].count, 1);
  });

  it('recusa pilha inválida e arma explicitamente sem slots sem qualquer mutação', () => {
    for (const count of [0, -1, 1.5]) {
      const state = DEFAULT_STATE();
      state.equipment = { weapon: 'weapon-test' };
      state.inventory = [
        { uid: 'weapon-test', itemId: 'test_sword', slot: 'weapon', socketsMax: 2 },
        { uid: 'card-test', itemId: 'card_valakas', count }
      ];
      const result = CardCodexService.socketCardToEquipment(state, 'weapon-test', 'card_valakas');
      assert.equal(result.success, false, `invalid count=${count}`);
      assert.equal(state.inventory[0].slottedCards, undefined);
      assert.equal(state.inventory[1].count, count);
    }

    const noSlots = DEFAULT_STATE();
    noSlots.equipment = { weapon: 'weapon-test' };
    noSlots.inventory = [
      { uid: 'weapon-test', itemId: 'test_sword', slot: 'weapon', socketsMax: 0 },
      { uid: 'card-test', itemId: 'card_valakas', count: 1 }
    ];
    const result = CardCodexService.socketCardToEquipment(noSlots, 'weapon-test', 'card_valakas');
    assert.equal(result.success, false);
    assert.equal(noSlots.inventory[1].count, 1);
    assert.equal(noSlots.inventory[0].slottedCards, undefined);
  });

  it('conecta cast speed, mana e heal power de cartas engastadas ao combate', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'mage';
    state.equipment = { weapon: 'weapon-test' };
    state.inventory = [
      { uid: 'weapon-test', itemId: 'test_staff', slot: 'weapon', socketsMax: 2 },
      { uid: 'core-card', itemId: 'card_core' },
      { uid: 'orfen-card', itemId: 'card_orfen' }
    ];
    const before = getStats(state);

    assert.equal(CardCodexService.socketCardToEquipment(state, 'weapon-test', 'card_core').success, true);
    assert.equal(CardCodexService.socketCardToEquipment(state, 'weapon-test', 'card_orfen').success, true);
    const after = getStats(state);

    assert.equal(after.cdr, before.cdr + 0.10);
    assert.equal(after.healPower, 0.25);
    assert.ok(after.maxMp > before.maxMp, 'socket max MP reaches the derived resource total');
    assert.equal(applyPlayerHealingReceivedBonus(100, after), 125, 'socket healing power reaches actual skill healing');
  });

  it('não soma duas vezes a mesma carta quando save legado contém alias e ID canônico', () => {
    const canonicalOnly = CardCodexService.getCodexPassiveBonuses({
      cardCodex: { card_queen_ant: { rank: 2, count: 3 } }
    });
    const withLegacyAlias = CardCodexService.getCodexPassiveBonuses({
      cardCodex: {
        card_queen_ant: { rank: 2, count: 3 },
        card_ant_queen: { rank: 1, count: 1 }
      }
    });
    assert.deepEqual(withLegacyAlias, canonicalOnly);
  });
});
