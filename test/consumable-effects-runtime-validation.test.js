import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { applyConsumableStatBuff } from '../lineage-idle/src/services/ConsumableService.js';
import { resolvePlayerBasicAttackIntervalMs } from '../lineage-idle/src/services/SkillEffectService.js';
import { simulateCombat } from '../lineage-idle/src/services/CombatSimulator.js';

const now = Date.now();

function createCombatState() {
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = 'fighter';
  state.level = 80;
  return state;
}

function useCombatBuff(itemId) {
  const state = createCombatState();
  const before = getStats(state);
  const item = ALL_ITEMS[itemId];
  assert.ok(item, `missing item definition: ${itemId}`);
  assert.equal(applyConsumableStatBuff(state, item, now), true, `${itemId} must apply through the consumable service`);
  return { before, after: getStats(state), state };
}

describe('Consumable effects through live combat stats', () => {
  it('declares typed buff stats for combat potions instead of ambiguous legacy amounts', () => {
    const expected = {
      attack_potion: { pAtkPercent: 0.20 },
      defense_potion: { pDefPercent: 0.20 },
      speed_potion: { movementSpeedPercent: 0.15 },
      potion_haste: { atkSpdPercent: 0.15, movementSpeedPercent: 0.15 },
      aegis_draught: { pDefPercent: 0.25, mDefPercent: 0.20 },
      berserker_elixir: { pAtkPercent: 0.30, crit: 15 },
      sages_tea: { mpRegen: 5 }
    };

    for (const [itemId, stats] of Object.entries(expected)) {
      assert.deepEqual(ALL_ITEMS[itemId]?.buffStats, stats, `${itemId} declares the combat effect it advertises`);
      assert.ok(ALL_ITEMS[itemId]?.buffDuration > 0, `${itemId} declares its buff duration`);
    }
  });

  it('applies attack and defense potion percentages to the final StatsEngine output', () => {
    const attack = useCombatBuff('attack_potion');
    assert.ok(attack.after.atk >= attack.before.atk * 1.19, `attack potion should add about 20% P.Atk (${attack.before.atk} -> ${attack.after.atk})`);

    const defense = useCombatBuff('defense_potion');
    assert.ok(defense.after.def >= defense.before.def * 1.19, `defense potion should add about 20% P.Def (${defense.before.def} -> ${defense.after.def})`);
  });

  it('routes movement speed to basic attack cadence and attack speed to skill cooldown reduction', () => {
    const speed = useCombatBuff('speed_potion');
    assert.equal(speed.after.movementSpeedPercent, speed.before.movementSpeedPercent + 0.15);
    assert.ok(resolvePlayerBasicAttackIntervalMs(speed.after) < resolvePlayerBasicAttackIntervalMs(speed.before));

    const haste = useCombatBuff('potion_haste');
    assert.equal(haste.after.movementSpeedPercent, haste.before.movementSpeedPercent + 0.15);
    assert.ok(haste.after.cdr >= haste.before.cdr + 0.15);
  });

  it('applies Aegis, Berserker, and Sage potion effects to the matching combat attributes', () => {
    const aegis = useCombatBuff('aegis_draught');
    assert.ok(aegis.after.def >= aegis.before.def * 1.24);
    assert.ok(aegis.after.mdef >= aegis.before.mdef * 1.19);

    const berserker = useCombatBuff('berserker_elixir');
    assert.ok(berserker.after.atk >= berserker.before.atk * 1.29);
    assert.ok(berserker.after.crit >= berserker.before.crit + 14);

    const tea = useCombatBuff('sages_tea');
    assert.equal(tea.after.mpRegen, tea.before.mpRegen + 5);
  });

  it('uses the cataloged MP potion amount in the headless production combat loop', () => {
    const player = {
      hp: 1000,
      maxHp: 1000,
      mp: 1,
      maxMp: 5000,
      stats: { maxHp: 1000, maxMp: 5000, mpRegen: 0, atk: 10, def: 100, mdef: 100, crit: 0, critDmg: 1, cdr: 0 },
      skills: { mana_probe: 1 },
      inventory: [{ itemId: 'mp_potion_xl', count: 1 }]
    };
    const result = simulateCombat({
      player,
      enemy: { hp: 10_000, atk: 1, matk: 1, def: 1000, mdef: 1000 },
      skills: { mana_probe: { id: 'mana_probe', type: 'active', mpCost: 400, baseCd: 100_000, pwr: 100, damage: 10 } },
      config: { maxDurationSec: 0.2, autoMpThreshold: 0.4, applyVariance: false }
    });

    assert.equal(result.mpPotionsUsed, 1);
    assert.equal(result.mpSpent, 400, 'the 500-MP catalog potion must let the 400-MP skill cast');
    assert.equal(result.skillsUsed.mana_probe, 1);
  });
});
