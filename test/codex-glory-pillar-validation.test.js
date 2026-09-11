import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CardCodexService, MONSTER_CARDS } from '../lineage-idle/src/services/CardCodexService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 7: Monster Card Codex (Codex de Cartas)', () => {
  it('1. Card Absorption: Consumes card item from inventory and adds to codex album', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { id: 'card_queen_ant', itemId: 'card_queen_ant', name: 'Carta Rainha Formiga', count: 5 }
    ];
    state.codex = {};

    const absorbRes = CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', 3);
    assert.equal(absorbRes.success, true);
    assert.equal(state.codex['card_queen_ant'].count, 3);
    assert.equal(state.inventory[0].count, 2);
  });

  it('2. Rank Mastery Progression: Scales ranks based on absorption count', () => {
    assert.equal(CardCodexService.getRankFromCount(1), 1);   // Rank I
    assert.equal(CardCodexService.getRankFromCount(3), 2);   // Rank II
    assert.equal(CardCodexService.getRankFromCount(6), 3);   // Rank III
    assert.equal(CardCodexService.getRankFromCount(10), 4);  // Rank IV
    assert.equal(CardCodexService.getRankFromCount(15), 5);  // Rank V
  });

  it('3. Rank Multipliers: Scales passive stats proportionally with rank', () => {
    assert.equal(CardCodexService.getRankMultiplier(1), 1.0);
    assert.equal(CardCodexService.getRankMultiplier(2), 1.50);
    assert.equal(CardCodexService.getRankMultiplier(3), 1.80);
    assert.equal(CardCodexService.getRankMultiplier(4), 2.00);
    assert.equal(CardCodexService.getRankMultiplier(5), 2.15);
  });

  it('4. Codex Passive Bonus Aggregation: Aggregates stats across all collected cards', () => {
    const state = DEFAULT_STATE();
    state.codex = {
      card_queen_ant: { count: 10, rank: 3 },
      card_zaken: { count: 3, rank: 2 }
    };

    const bonuses = CardCodexService.getCodexPassiveBonuses(state);
    assert.ok(bonuses.pAtk > 0);
    assert.ok(bonuses.maxHp > 0);
  });

  it('5. StatsEngine Integration: Reflects codex bonuses in final character stats', () => {
    const state0 = DEFAULT_STATE();
    state0.race = 'human';
    state0.class = 'fighter';
    state0.codex = {};
    const stats0 = getStats(state0);

    const stateWithCodex = DEFAULT_STATE();
    stateWithCodex.race = 'human';
    stateWithCodex.class = 'fighter';
    stateWithCodex.codex = {
      card_queen_ant: { count: 50, rank: 5 }
    };
    const statsWithCodex = getStats(stateWithCodex);

    assert.ok(statsWithCodex.atk > stats0.atk);
    assert.ok(statsWithCodex.maxHp > stats0.maxHp);
  });

  it('6. Save/Load Persistence: Full codex collection and card counts survive JSON cycle', () => {
    const state = DEFAULT_STATE();
    state.codex = {
      card_queen_ant: { count: 25, rank: 4 },
      card_baium: { count: 10, rank: 3 }
    };

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.deepEqual(reloaded.codex, state.codex);
  });
});
