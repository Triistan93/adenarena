import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { canCastSkill } from '../lineage-idle/src/data/balance/skillBalance.js';
import { AugmentationService, getAugmentationGemstoneGrade, getAugmentationRequirements, getAugmentationSkillPool, getAugmentationStunChancePercent, processAugmentationCombatTick } from '../lineage-idle/src/services/AugmentationService.js';
import { LIFE_STONES } from '../lineage-idle/src/data/augmentation.js';

function stateWithAugmentation(classId, itemSkill) {
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = classId;
  state.level = 80;
  state.inventory = [{
    uid: 'augmented-weapon', itemId: 'runtime_test_weapon', slot: 'weapon', atk: 100,
    augmentation: { itemSkill }
  }];
  state.equipment = { ...state.equipment, weapon: 'augmented-weapon' };
  return state;
}

describe('Augmentation item skills on class and combat runtime paths', () => {
  it('offers physical Item Skills to warriors and magical Item Skills to mages', () => {
    const warriorSkillIds = getAugmentationSkillPool('gladiator').map(skill => skill.id);
    const mageSkillIds = getAugmentationSkillPool('spellsinger').map(skill => skill.id);

    assert.ok(warriorSkillIds.includes('item_skill_active_might'));
    assert.ok(warriorSkillIds.includes('item_skill_chance_stun'));
    assert.ok(!warriorSkillIds.includes('item_skill_active_wild_magic'));
    assert.ok(mageSkillIds.includes('item_skill_active_wild_magic'));
    assert.ok(mageSkillIds.includes('item_skill_passive_clarity'));
    assert.ok(!mageSkillIds.includes('item_skill_active_might'));
    assert.ok(warriorSkillIds.includes('item_skill_passive_fortitude'));
    assert.ok(mageSkillIds.includes('item_skill_passive_arcane_insight'));
  });

  it('does not open every archetype pool when the class cannot be resolved', () => {
    assert.deepEqual(getAugmentationSkillPool('not_a_canonical_class'), []);
  });

  it('maps Life Stone levels to the required gemstone grade across every boundary', () => {
    assert.deepEqual(
      [1, 39, 40, 51, 52, 61, 62, 75, 76, 86].map(getAugmentationGemstoneGrade),
      ['D', 'D', 'C', 'C', 'B', 'B', 'A', 'A', 'S', 'S']
    );
  });

  it('defines a progressively more expensive reroll cost for every Life Stone', () => {
    const requirements = Object.values(LIFE_STONES).map(stone => getAugmentationRequirements(stone));
    assert.deepEqual(requirements.map(({ gemstoneGrade, gemstonesNeeded }) => [gemstoneGrade, gemstonesNeeded]), [
      ['D', 5], ['D', 8], ['C', 10], ['S', 25], ['S', 36], ['S', 50]
    ]);
    assert.deepEqual(requirements.map(({ adena }) => adena), [25_000, 50_000, 120_000, 2_000_000, 5_000_000, 12_000_000]);
  });

  it('rolls a stronger copy of the same random item skill from a higher-grade stone', () => {
    const originalRandom = Math.random;
    const roll = stoneId => {
      const state = DEFAULT_STATE();
      state.class = 'gladiator';
      state.gold = 20_000_000;
      const weapon = { uid: `weapon-${stoneId}`, itemId: 'weapon_test', slot: 'weapon' };
      state.inventory = [
        weapon,
        { uid: `stone-${stoneId}`, itemId: stoneId, count: 1 },
        { uid: `crystal-${stoneId}`, itemId: 'crystal_d', count: 500 },
        { uid: `crystal-a-${stoneId}`, itemId: 'crystal_a', count: 500 },
        { uid: `crystal-s-${stoneId}`, itemId: 'crystal_s', count: 500 }
      ];
      Math.random = () => 0;
      try {
        return AugmentationService.augmentWeapon(state, weapon, stoneId, { log: () => {} }).augmentation.itemSkill;
      } finally {
        Math.random = originalRandom;
      }
    };

    const normal = roll('life_stone_28');
    const top = roll('life_stone_top_76');
    assert.equal(normal.id, top.id);
    const scale = LIFE_STONES.life_stone_top_76.statMultiplier / LIFE_STONES.life_stone_28.statMultiplier;
    assert.ok(Object.keys(normal.stats).length > 0);
    for (const [key, baseValue] of Object.entries(normal.stats)) {
      const expected = /percent|chance/i.test(key)
        ? Math.round(baseValue * scale * 10000) / 10000
        : Math.round(baseValue * scale);
      assert.equal(top.stats[key], expected, `${key} should scale with the selected Life Stone`);
    }
  });

  it('requires the gemstone grade and quantity selected by a level 76 Life Stone', () => {
    const state = DEFAULT_STATE();
    state.class = 'gladiator';
    state.gold = 20_000_000;
    const weapon = { uid: 'stone-cost-weapon', itemId: 'weapon_test', slot: 'weapon' };
    const stone = { uid: 'stone-cost-life', itemId: 'life_stone_top_76', count: 1 };
    const lowGrade = { uid: 'stone-cost-low', itemId: 'crystal_d', count: 500 };
    const highGrade = { uid: 'stone-cost-high', itemId: 'gemstone_s', count: 49 };
    state.inventory = [weapon, stone, lowGrade, highGrade];

    const insufficient = AugmentationService.augmentWeapon(state, weapon, 'life_stone_top_76', { log: () => {} });
    assert.equal(insufficient.reason, 'insufficient_gemstones');
    assert.equal(state.gold, 20_000_000);
    assert.equal(stone.count, 1);

    highGrade.count += 1;
    const augmented = AugmentationService.augmentWeapon(state, weapon, 'life_stone_top_76', { log: () => {} });
    assert.equal(augmented.success, true);
    assert.equal(state.inventory.includes(highGrade), false, 'the required S-grade gemstone stack is consumed');
    assert.equal(lowGrade.count, 500, 'a lower-grade crystal cannot pay the requirement');
    assert.equal(state.gold, 8_000_000, 'the Adena fee is charged once');
  });

  it('applies passive Focus from the equipped augmented weapon to effective crit', () => {
    const plain = stateWithAugmentation('gladiator', null);
    const augmented = stateWithAugmentation('gladiator', {
      id: 'item_skill_passive_focus', type: 'passive', stats: { critBonus: 30 }
    });

    assert.ok(getStats(augmented).crit > getStats(plain).crit);
  });

  it('applies rolled Max HP and Max CP as flat attributes while preserving legacy hpBonus', () => {
    const plain = stateWithAugmentation('gladiator', null);
    const rolled = stateWithAugmentation('gladiator', null);
    rolled.inventory[0].augmentation = { stats: { hp: 200, cp: 250 } };
    const legacy = stateWithAugmentation('gladiator', null);
    legacy.inventory[0].augmentation = { hpBonus: 200 };

    assert.equal(getStats(rolled).maxHp - getStats(plain).maxHp, 200);
    assert.equal(getStats(rolled).maxCp - getStats(plain).maxCp, 250 + Math.floor(200 * 0.60));
    assert.notEqual(getStats(legacy).maxHp, getStats(plain).maxHp);
    assert.notEqual(getStats(legacy).maxCp, getStats(plain).maxCp);
  });

  it('applies role-appropriate passive attack, defense, and critical damage effects', () => {
    const fighter = stateWithAugmentation('gladiator', {
      id: 'item_skill_passive_fortitude', type: 'passive', stats: { pDefPercent: 0.05, mDefPercent: 0.05 }
    });
    const fighterWithout = stateWithAugmentation('gladiator', null);
    const mage = stateWithAugmentation('spellsinger', {
      id: 'item_skill_passive_arcane_insight', type: 'passive', stats: { mAtkPercent: 0.05 }
    });
    const mageWithout = stateWithAugmentation('spellsinger', null);

    assert.ok(getStats(fighter).def > getStats(fighterWithout).def);
    assert.ok(getStats(fighter).mdef > getStats(fighterWithout).mdef);
    assert.ok(getStats(mage).matk > getStats(mageWithout).matk);
  });

  it('applies passive Clarity to the MP cost checked and consumed by SkillEngine', () => {
    const state = stateWithAugmentation('spellsinger', {
      id: 'item_skill_passive_clarity', type: 'passive', stats: { mpReductionPercent: 0.15 }
    });
    state.stats = getStats(state);
    state.mp = 100;
    const skill = { id: 'augment_mp_test', type: 'active', gameplay: { mpCost: 20 }, baseCd: 5000 };

    const result = canCastSkill(state, skill, 10_000, {});

    assert.equal(result.mpCost, 17);
  });

  it('activates a fighter augment skill in combat and applies its timed attack effect', () => {
    const state = stateWithAugmentation('gladiator', {
      id: 'item_skill_active_might', type: 'active', durationMs: 15000, cooldownMs: 60000,
      stats: { pAtkPercent: 0.15 }
    });
    const before = getStats(state).atk;

    const now = Date.now();
    const activated = processAugmentationCombatTick(state, now);

    assert.equal(activated[0].id, 'item_skill_active_might');
    assert.ok(getStats(state).atk > before);
    assert.deepEqual(processAugmentationCombatTick(state, now + 1000), []);
  });

  it('activates fighter defense and mage critical augmentation skills through combat ticks', () => {
    const fighter = stateWithAugmentation('gladiator', {
      id: 'item_skill_active_shield', type: 'active', durationMs: 15000, cooldownMs: 60000,
      stats: { pDefPercent: 0.15 }
    });
    fighter.isCombatActive = true;
    const fighterDef = getStats(fighter).def;
    const now = Date.now();
    assert.equal(processAugmentationCombatTick(fighter, now)[0].id, 'item_skill_active_shield');
    assert.ok(getStats(fighter).def > fighterDef);

    const mage = stateWithAugmentation('spellsinger', {
      id: 'item_skill_active_wild_magic', type: 'active', durationMs: 15000, cooldownMs: 60000,
      stats: { critBonus: 25 }
    });
    mage.isCombatActive = true;
    const mageCrit = getStats(mage).crit;
    assert.equal(processAugmentationCombatTick(mage, now)[0].id, 'item_skill_active_wild_magic');
    assert.ok(getStats(mage).crit > mageCrit);
  });

  it('uses the equipped augment heal only when injured and observes its cooldown', () => {
    const state = stateWithAugmentation('spellsinger', {
      id: 'item_skill_active_heal', type: 'active', cooldownMs: 60000,
      stats: { instantHeal: 3000 }
    });
    state.maxHp = 5000;
    state.hp = 1000;

    const [activation] = processAugmentationCombatTick(state, 20_000);

    assert.equal(activation.healed, 3000);
    assert.equal(state.hp, 4000);
    assert.deepEqual(processAugmentationCombatTick(state, 21_000), []);
  });

  it('converts the catalogued 0.15 stun rate into the intended 15 percent combat chance', () => {
    const state = stateWithAugmentation('gladiator', {
      id: 'item_skill_chance_stun', type: 'chance', stats: { stunChance: 0.15 }
    });

    assert.equal(getAugmentationStunChancePercent(state), 15);
  });
});
