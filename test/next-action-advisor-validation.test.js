import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextActionAdvisor, ADVISOR_PRIORITIES } from '../lineage-idle/src/services/NextActionAdvisor.js';

describe('P1-ADV: NextActionAdvisor & Power Milestone Validation', () => {
  it('4.1 Prioridade 1: Detecta slot vazio com equipamento na mochila e recomenda Auto-Equip', () => {
    const state = {
      level: 10,
      charName: 'NoviceKnight',
      equipment: {}, // Todos os slots vazios!
      inventory: [
        { uid: 'wpn_1', itemId: 'short_sword', slot: 'weapon', atk: 25, count: 1 },
        { uid: 'armor_1', itemId: 'wooden_breastplate', slot: 'armor', def: 15, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.AUTO_EQUIP);
    assert.strictEqual(advice.category, 'AUTO_EQUIP');
    assert.strictEqual(advice.actionType, 'AUTO_EQUIP');
    assert.ok(advice.actionText.includes('Auto-Equipar'));
    assert.strictEqual(advice.actionTab, 'inventory');
  });

  it('4.2 Prioridade 2: Detecta item superior na mochila e recomenda Upgrade', () => {
    const state = {
      level: 40,
      class: 'gladiator',
      equipment: {
        weapon: 'wpn_weak'
      },
      inventory: [
        { uid: 'wpn_weak', itemId: 'sword_d', slot: 'weapon', type: 'sword', atk: 50, count: 1, equipped: true },
        { uid: 'wpn_strong', itemId: 'tsurugi', slot: 'weapon', type: 'sword', atk: 130, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.UPGRADE);
    assert.strictEqual(advice.category, 'UPGRADE');
    assert.ok(advice.actionText.includes('Equipar Melhoria'));
  });

  it('4.3 Prioridade 3: Detecta pergaminho de enchant compatível com item equipado e recomenda Encantar', () => {
    const state = {
      level: 45,
      class: 'gladiator',
      equipment: {
        weapon: 'wpn_tsurugi'
      },
      inventory: [
        { uid: 'wpn_tsurugi', itemId: 'tsurugi', slot: 'weapon', grade: 'C', atk: 130, count: 1, equipped: true, enchant: 0 },
        { uid: 'scrl_c', itemId: 'scroll_enchant_weapon_c', slot: 'scroll', count: 3 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.ENCHANT);
    assert.strictEqual(advice.category, 'ENCHANT');
    assert.strictEqual(advice.actionType, 'ENCHANT');
    assert.ok(advice.actionText.includes('Encantar'));
    assert.strictEqual(advice.actionPayload.scrollUid, 'scrl_c');
    assert.strictEqual(advice.actionPayload.targetUid, 'wpn_tsurugi');
  });

  it('4.4 Prioridade 5: Power Milestone calcula meta de CP e progresso quando nenhum upgrade imediato existe', () => {
    const state = {
      level: 15,
      class: 'fighter',
      equipment: {
        weapon: 'wpn_sword'
      },
      inventory: [
        { uid: 'wpn_sword', itemId: 'sword_ng', slot: 'weapon', atk: 20, equipped: true, count: 1 }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.MILESTONE);
    assert.strictEqual(advice.category, 'MILESTONE');
    assert.ok(advice.targetCp > 0);
    assert.ok(advice.cpRemaining >= 0);
    assert.ok(advice.targetName.includes('1ª'));
  });
});
