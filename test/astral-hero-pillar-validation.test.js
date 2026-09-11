import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ASTRAL_NODES, getAstralMasteryBonuses, getStats } from '../lineage-idle/src/engine/StatsEngine.js';

describe('Hero Pillar — Subtab 4: Astral Mastery (Maestria Astral)', () => {

  it('1. Constellation Definition: All 3 canonical constellations (Dragon, Phoenix, Midas) have 4 valid nodes each', () => {
    const dragonNodes = Object.values(ASTRAL_NODES).filter(n => n.const === 'dragon');
    const phoenixNodes = Object.values(ASTRAL_NODES).filter(n => n.const === 'phoenix');
    const midasNodes = Object.values(ASTRAL_NODES).filter(n => n.const === 'midas');

    assert.strictEqual(dragonNodes.length, 4, 'Dragon must have 4 nodes');
    assert.strictEqual(phoenixNodes.length, 4, 'Phoenix must have 4 nodes');
    assert.strictEqual(midasNodes.length, 4, 'Midas must have 4 nodes');
  });

  it('2. Bonus Calculation: Accurately computes cumulative stat multipliers based on node levels', () => {
    const state = DEFAULT_STATE();
    state.astralMastery = {
      dragon_1: 5,  // +15% P.Atk
      dragon_3: 3,  // +6% Crit
      phoenix_1: 4, // +20% HP
      midas_1: 10   // +50% Gold
    };

    const bonuses = getAstralMasteryBonuses(state);
    assert.strictEqual(Math.round(bonuses.patkMult * 100), 15);
    assert.strictEqual(bonuses.crit, 6);
    assert.strictEqual(Math.round(bonuses.hpMult * 100), 20);
    assert.strictEqual(Math.round(bonuses.goldBoost * 100), 50);
  });

  it('3. Stat Integration: Astral bonuses feed into getStats combat power and final stats', () => {
    const baseState = DEFAULT_STATE();
    baseState.level = 76;
    baseState.race = 'human';
    baseState.class = 'gladiator';

    const boostedState = JSON.parse(JSON.stringify(baseState));
    boostedState.astralMastery = {
      dragon_1: 10, // +30% P.Atk
      dragon_4: 10  // +50% Crit Dmg
    };

    const baseStats = getStats(baseState);
    const boostedStats = getStats(boostedState);

    assert.ok(boostedStats.atk > baseStats.atk, 'Astral P.Atk must increase final attack');
    assert.ok(boostedStats.critDmg > baseStats.critDmg, 'Astral Crit Dmg must increase critical damage');
    assert.ok(boostedStats.combatPower > baseStats.combatPower, 'Astral bonuses must increase CP');
  });

  it('4. Astral State Persistence: astralShards and astralMastery survive save/load JSON cycle', () => {
    const state = DEFAULT_STATE();
    state.astralShards = 42;
    state.astralMastery = { dragon_1: 10, phoenix_4: 8, midas_3: 5 };

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.astralShards, 42);
    assert.strictEqual(loaded.astralMastery.dragon_1, 10);
    assert.strictEqual(loaded.astralMastery.phoenix_4, 8);
    assert.strictEqual(loaded.astralMastery.midas_3, 5);
  });
});
