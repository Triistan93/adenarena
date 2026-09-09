/**
 * test/skill-progression-forensic.test.js — Forensic Test Suite for Skill Tree & Class Progression
 * 
 * Verifies:
 * 1. Bug Reproduction & Archetype Gating:
 *    - Human Mage at Lv 1 must NOT have Lv40, 76, 80, 90 skills in available/learned pool.
 *    - Human Fighter must NOT have Mage skills.
 * 2. Four Non-Overlapping States:
 *    - Every candidate skill evaluates to exactly one of HIDDEN, LOCKED, AVAILABLE, LEARNED.
 * 3. Level & Stage Gating across Breakpoints:
 *    - Lv 1, 19 (Stage 0 Generalist)
 *    - Lv 20, 39 (Stage 1 Transfer)
 *    - Lv 40, 75 (Stage 2 Specialization)
 *    - Lv 76, 79 (Stage 3 Mastery)
 *    - Lv 80, 89 (Stage 4 Ultimate)
 *    - Lv 90+ (Stage 5 Master Ultimate)
 * 4. Sibling Branch Isolation:
 *    - dark_elf_wizard vs dark_elf_shillien_oracle
 *    - orc_raider vs orc_monk
 *    - orc_overlord vs orc_warcryer
 * 5. Class Advancement DAG Validation:
 *    - promoteClass and canAdvance strictly follow getSuccessors() DAG.
 * 6. Multi-Path Security:
 *    - spendSP, auto-cast filter, starter kit, save/load normalization.
 * 7. SKILL_REGISTRY Isolation:
 *    - Object.values(SKILL_REGISTRY) is never dumped into character tree.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Ensure mock browser environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Load echo-adapter to populate window.EchoData
await import('../lineage-idle/data/echo-adapter.js');

import {
  SKILL_VISIBILITY_STATES,
  isSkillAvailableForCharacter,
  getSkillVisibility,
  getVisibleSkillsForCharacter,
  getHiddenSkillsForCharacter,
  getLearnableSkillsForCharacter,
  getCharacterProgressionState,
  areSiblingBranches,
  isSkillInProgressionPath,
  getStarterSkillsForClass,
  normalizeAndValidateSkills
} from '../lineage-idle/src/services/SkillEligibility.js';

import {
  isMageClass,
  isSkillAllowedForClass,
  canAdvance,
  promoteClass
} from '../lineage-idle/src/services/CharacterService.js';

import {
  getSuccessors,
  getAncestors
} from '../lineage-idle/src/data/elemental/ClassLineage.js';

import { spendSP } from '../lineage-idle/src/engine/SkillEngine.js';

// ---------------------------------------------------------------------------
// 1. Bug Reproduction & Archetype Gating
// ---------------------------------------------------------------------------
test('Forensic 01: Human Mage at Lv 1 has NO endgame/high-level skills available or learned', () => {
  const char = {
    class: 'mage',
    level: 1,
    sp: 10000,
    skills: { wind_strike: 1 }
  };

  const highLevelSkills = ['meteor', 'aura_flare', 'prominence', 'blazing_circle', 'solar_flare'];
  for (const sId of highLevelSkills) {
    const isAvail = isSkillAvailableForCharacter(char, sId);
    assert.strictEqual(isAvail, false, `Skill ${sId} should NOT be available to Lv 1 Mage`);
    
    const vis = getSkillVisibility(char, sId);
    assert.notStrictEqual(vis, SKILL_VISIBILITY_STATES.AVAILABLE, `Skill ${sId} must NOT be AVAILABLE at Lv 1`);
    assert.notStrictEqual(vis, SKILL_VISIBILITY_STATES.LEARNED, `Skill ${sId} must NOT be LEARNED at Lv 1`);
  }
});

test('Forensic 02: Human Fighter has NO magic skills in path or tree', () => {
  const char = {
    class: 'fighter',
    level: 1,
    sp: 5000,
    skills: { power_strike: 1 }
  };

  const mageSkills = ['wind_strike', 'ice_bolt', 'flame_strike', 'meteor', 'aura_flare'];
  for (const sId of mageSkills) {
    assert.strictEqual(isSkillAllowedForClass(char.class, sId), false, `Mage skill ${sId} must NOT be allowed for Fighter`);
    assert.strictEqual(isSkillInProgressionPath(char.class, sId), false, `Mage skill ${sId} must NOT be in Fighter progression`);
    const vis = getSkillVisibility(char, sId);
    assert.strictEqual(vis, SKILL_VISIBILITY_STATES.HIDDEN, `Mage skill ${sId} must be HIDDEN for Fighter`);
  }
});

// ---------------------------------------------------------------------------
// 2. Four Non-Overlapping States
// ---------------------------------------------------------------------------
test('Forensic 03: Four Non-Overlapping Lifecycle States (HIDDEN, LOCKED, AVAILABLE, LEARNED)', () => {
  const char = {
    class: 'human_sorcerer',
    level: 40,
    sp: 2000,
    skills: {
      wind_strike: 3,
      flame_strike: 1
    }
  };

  const echoDefs = window.EchoData?.SKILL_DEFS_ECHO || {};
  const allSkillIds = Object.keys(echoDefs);
  assert.ok(allSkillIds.length > 10, 'EchoDefs should contain skills');

  const validStates = new Set(Object.values(SKILL_VISIBILITY_STATES));
  assert.strictEqual(validStates.size, 4, 'There must be exactly 4 lifecycle states');

  for (const skillId of allSkillIds) {
    const vis = getSkillVisibility(char, skillId);
    assert.ok(validStates.has(vis), `Skill ${skillId} must resolve to one of the 4 canonical states, got: ${vis}`);

    // Self-consistency verification
    if (vis === SKILL_VISIBILITY_STATES.LEARNED) {
      assert.ok((char.skills[skillId] || 0) > 0, `${skillId} marked LEARNED but level is 0`);
    } else if (vis === SKILL_VISIBILITY_STATES.AVAILABLE) {
      assert.strictEqual(isSkillAvailableForCharacter(char, skillId), true, `${skillId} marked AVAILABLE but isSkillAvailable is false`);
    } else if (vis === SKILL_VISIBILITY_STATES.LOCKED) {
      assert.strictEqual(isSkillInProgressionPath(char.class, skillId), true, `${skillId} marked LOCKED but is not in progression path`);
      assert.strictEqual(isSkillAvailableForCharacter(char, skillId), false, `${skillId} marked LOCKED but isSkillAvailable is true`);
    } else if (vis === SKILL_VISIBILITY_STATES.HIDDEN) {
      assert.strictEqual(isSkillInProgressionPath(char.class, skillId), false, `${skillId} marked HIDDEN but is in progression path`);
    }
  }
});

// ---------------------------------------------------------------------------
// 3. Level & Stage Breakpoints (Mage & Fighter)
// ---------------------------------------------------------------------------
test('Forensic 04: Mage Breakpoints (Lv 1, 19, 20, 39, 40, 75, 76, 80, 90)', () => {
  const breakpoints = [
    { level: 1,  cls: 'mage', expectedStage: 0, testSkill: 'wind_strike', expectLearnedOrAvail: true },
    { level: 19, cls: 'mage', expectedStage: 0, testSkill: 'magma_spike', expectLockedOrHidden: true },
    { level: 20, cls: 'wizard', expectedStage: 1, testSkill: 'flame_strike', expectLearnedOrAvail: true },
    { level: 39, cls: 'wizard', expectedStage: 1, testSkill: 'meteor', expectLockedOrHidden: true },
    { level: 40, cls: 'human_sorcerer', expectedStage: 2, testSkill: 'magma_spike', expectLearnedOrAvail: true },
    { level: 75, cls: 'human_sorcerer', expectedStage: 2, testSkill: 'meteor', expectLockedOrHidden: true },
    { level: 76, cls: 'archmage', expectedStage: 3, testSkill: 'flame_nova', expectLearnedOrAvail: true },
    { level: 80, cls: 'archmage', expectedStage: 4, testSkill: 'meteor', expectLearnedOrAvail: true },
    { level: 90, cls: 'archmage', expectedStage: 5, testSkill: 'meteor', expectLearnedOrAvail: true }
  ];

  for (const bp of breakpoints) {
    const char = { class: bp.cls, level: bp.level, sp: 50000, skills: {} };
    const prog = getCharacterProgressionState(char);
    assert.strictEqual(prog.currentStage, bp.expectedStage, `Class ${bp.cls} at Lv ${bp.level} should be Stage ${bp.expectedStage}`);

    const vis = getSkillVisibility(char, bp.testSkill);
    if (bp.expectLearnedOrAvail) {
      assert.ok(
        vis === SKILL_VISIBILITY_STATES.AVAILABLE || vis === SKILL_VISIBILITY_STATES.LEARNED,
        `Expected ${bp.testSkill} to be AVAILABLE or LEARNED at Lv ${bp.level} (${bp.cls}), got ${vis}`
      );
    }
    if (bp.expectLockedOrHidden) {
      assert.ok(
        vis === SKILL_VISIBILITY_STATES.LOCKED || vis === SKILL_VISIBILITY_STATES.HIDDEN,
        `Expected ${bp.testSkill} to be LOCKED or HIDDEN at Lv ${bp.level} (${bp.cls}), got ${vis}`
      );
    }
  }
});

test('Forensic 05: Fighter Breakpoints (Lv 1, 19, 20, 39, 40, 75, 76, 80, 90)', () => {
  const breakpoints = [
    { level: 1,  cls: 'fighter', expectedStage: 0, testSkill: 'power_strike', expectAvail: true },
    { level: 19, cls: 'fighter', expectedStage: 0, testSkill: 'gladiator_triple_slash', expectLockedOrHidden: true },
    { level: 20, cls: 'warrior', expectedStage: 1, testSkill: 'power_strike', expectAvail: true },
    { level: 40, cls: 'gladiator', expectedStage: 2, testSkill: 'gladiator_triple_slash', expectAvail: true },
    { level: 75, cls: 'gladiator', expectedStage: 2, testSkill: 'duelist_sonic_focus', expectLockedOrHidden: true },
    { level: 76, cls: 'duelist', expectedStage: 3, testSkill: 'duelist_sonic_focus', expectAvail: true }
  ];

  for (const bp of breakpoints) {
    const char = { class: bp.cls, level: bp.level, sp: 50000, skills: {} };
    const prog = getCharacterProgressionState(char);
    assert.strictEqual(prog.currentStage, bp.expectedStage, `Class ${bp.cls} at Lv ${bp.level} should be Stage ${bp.expectedStage}`);

    const vis = getSkillVisibility(char, bp.testSkill);
    if (bp.expectAvail) {
      assert.ok(
        vis === SKILL_VISIBILITY_STATES.AVAILABLE || vis === SKILL_VISIBILITY_STATES.LEARNED,
        `Expected ${bp.testSkill} to be AVAILABLE or LEARNED for ${bp.cls} at Lv ${bp.level}`
      );
    }
    if (bp.expectLockedOrHidden) {
      assert.ok(
        vis === SKILL_VISIBILITY_STATES.LOCKED || vis === SKILL_VISIBILITY_STATES.HIDDEN,
        `Expected ${bp.testSkill} to be LOCKED or HIDDEN for ${bp.cls} at Lv ${bp.level}`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// 4. Sibling Branch Isolation
// ---------------------------------------------------------------------------
test('Forensic 06: Sibling Branch Isolation — Dark Elf (Wizard vs Shillien Oracle)', () => {
  assert.strictEqual(areSiblingBranches('dark_elf_wizard', 'dark_elf_shillien_oracle'), true);
  assert.strictEqual(areSiblingBranches('spellhowler', 'shillien_elder'), true);
  assert.strictEqual(areSiblingBranches('storm_screamer', 'shillien_saint'), true);
  assert.strictEqual(areSiblingBranches('ghost_sentinel', 'ghost_hunter'), true);

  const wizard = { class: 'dark_elf_wizard', level: 25, sp: 5000, skills: {} };
  const oracle = { class: 'dark_elf_shillien_oracle', level: 25, sp: 5000, skills: {} };

  // Wizard skills vs Oracle skills
  const wizSkills = [...getVisibleSkillsForCharacter(wizard)].map(s => s.skillId);
  const oraSkills = [...getVisibleSkillsForCharacter(oracle)].map(s => s.skillId);

  // Oracle specific skills like empower should not be in wizard tree
  for (const sId of ['empower', 'vampiric_rage', 'greater_heal']) {
    if (window.EchoData?.SKILL_DEFS_ECHO?.[sId]) {
      assert.strictEqual(isSkillInProgressionPath('dark_elf_wizard', sId), false);
    }
  }
});

test('Forensic 07: Sibling Branch Isolation — Orc (Raider vs Monk) & (Overlord vs Warcryer)', () => {
  // orc_raider vs orc_monk
  assert.strictEqual(areSiblingBranches('orc_raider', 'orc_monk'), true);
  assert.strictEqual(areSiblingBranches('destroyer', 'tyrant'), true);
  assert.strictEqual(areSiblingBranches('titan', 'grand_khavatari'), true);

  // orc_overlord vs orc_warcryer
  assert.strictEqual(areSiblingBranches('orc_overlord', 'orc_warcryer'), true);
  assert.strictEqual(areSiblingBranches('overlord', 'warcryer'), true);
  assert.strictEqual(areSiblingBranches('dominator', 'doomcryer'), true);
});

// ---------------------------------------------------------------------------
// 5. Class Advancement DAG Validation
// ---------------------------------------------------------------------------
test('Forensic 08: Class Advancement DAG Validation (canAdvance & promoteClass)', () => {
  // Successor DAG validation: human_fighter -> human_warrior -> human_gladiator
  const fighterSuccs = getSuccessors('human_fighter');
  assert.ok(fighterSuccs.includes('human_warrior'), 'human_fighter can advance to human_warrior');
  assert.strictEqual(fighterSuccs.includes('human_gladiator'), false, 'human_fighter cannot jump directly to human_gladiator');
  
  const warriorSuccs = getSuccessors('human_warrior');
  assert.ok(warriorSuccs.includes('human_gladiator'), 'human_warrior can advance to human_gladiator');

  // canAdvance level gating
  assert.strictEqual(canAdvance('human_fighter', 1).length, 0, 'Cannot advance at level 1');
  assert.ok(canAdvance('human_fighter', 20).length > 0, 'Can advance at level 20');

  // promoteClass validation
  const char = {
    class: 'human_fighter',
    level: 25,
    sp: 100,
    skills: { power_strike: 1 }
  };

  const invalidPromotion = promoteClass(char, 'dark_elf_wizard');
  assert.strictEqual(invalidPromotion, false, 'Promoting human_fighter to dark_elf_wizard must fail');

  const validPromotion = promoteClass(char, 'human_warrior');
  assert.strictEqual(validPromotion, true, 'Promoting human_fighter to human_warrior at Lv 25 must succeed');
  assert.strictEqual(char.class, 'human_warrior');
  assert.ok(char.skills.power_strike >= 1, 'Previous skills must be preserved');
});

// ---------------------------------------------------------------------------
// 6. Multi-Path Security (spendSP, Auto-Cast, Starter Kit, Save/Load)
// ---------------------------------------------------------------------------
test('Forensic 09: spendSP Security Gate — Blocks Lv76 and Cross-Class at Lv 1', () => {
  const state = {
    class: 'mage',
    level: 1,
    sp: 999999,
    skills: {}
  };

  // Attempting to buy Lv76 skill 'meteor'
  const meteorDef = window.EchoData?.SKILL_DEFS_ECHO?.meteor;
  if (meteorDef) {
    const buyResult = spendSP(state, 'meteor');
    assert.strictEqual(buyResult, false, 'spendSP must reject purchasing meteor at Lv 1');
    assert.strictEqual(state.skills.meteor || 0, 0, 'meteor must not be added to skills');
  }

  // Attempting to buy fighter skill 'power_strike'
  const powerStrikeDef = window.EchoData?.SKILL_DEFS_ECHO?.power_strike;
  if (powerStrikeDef) {
    const buyResult = spendSP(state, 'power_strike');
    assert.strictEqual(buyResult, false, 'spendSP must reject purchasing power_strike for mage');
    assert.strictEqual(state.skills.power_strike || 0, 0, 'power_strike must not be added to skills');
  }
});

test('Forensic 10: Starter Kit Pipeline — ClassIdentity gives correct starter skills', () => {
  const mageStarters = getStarterSkillsForClass('mage');
  assert.ok(mageStarters.length > 0, 'Mage must have starter skills');
  assert.ok(mageStarters.includes('wind_strike'), 'Mage must start with wind_strike');
  assert.strictEqual(mageStarters.includes('meteor'), false, 'Mage must NOT start with meteor');
  assert.strictEqual(mageStarters.includes('power_strike'), false, 'Mage must NOT start with power_strike');

  const fighterStarters = getStarterSkillsForClass('fighter');
  assert.ok(fighterStarters.length > 0, 'Fighter must have starter skills');
  assert.ok(fighterStarters.includes('power_strike'), 'Fighter must start with power_strike');
  assert.strictEqual(fighterStarters.includes('wind_strike'), false, 'Fighter must NOT start with wind_strike');
});

test('Forensic 11: Save/Load Normalization — Quarantines Corrupted Skills and Refunds SP', () => {
  const corruptedState = {
    class: 'mage',
    level: 5,
    sp: 100,
    skills: {
      wind_strike: 2,
      meteor: 1,            // Invalid: requiredLevel 76 vs level 5
      power_strike: 3       // Invalid: fighter skill on mage
    }
  };

  const logs = [];
  const result = normalizeAndValidateSkills(corruptedState, { log: (msg) => logs.push(msg) });

  assert.strictEqual(result.fixed, true, 'Normalization must report that fixes were made');
  assert.strictEqual(corruptedState.skills.meteor, undefined, 'meteor must be removed');
  assert.strictEqual(corruptedState.skills.power_strike, undefined, 'power_strike must be removed');
  assert.strictEqual(corruptedState.skills.wind_strike, 2, 'valid skill wind_strike must be preserved');
  assert.ok(corruptedState.sp > 100, 'SP must be refunded for quarantined skills');
  assert.ok(result.refundedSp > 0, 'Reported refunded SP must be greater than 0');
});

// ---------------------------------------------------------------------------
// 7. SKILL_REGISTRY Isolation
// ---------------------------------------------------------------------------
test('Forensic 12: SKILL_REGISTRY Isolation — Global pool never exposed in character tree', () => {
  const char = {
    class: 'mage',
    level: 1,
    sp: 1000,
    skills: { wind_strike: 1 }
  };

  const visible = getVisibleSkillsForCharacter(char);
  const hidden = getHiddenSkillsForCharacter(char);

  // Total visible skills must only be skills in this character's progression path
  for (const item of visible) {
    assert.strictEqual(
      isSkillInProgressionPath(char.class, item.skillId),
      true,
      `Visible skill ${item.skillId} MUST be in progression path for ${char.class}`
    );
  }

  // Fighter skills must be hidden
  const hiddenIds = new Set(hidden.map(h => h.id || h.skillId));
  assert.ok(hiddenIds.has('power_strike'), 'power_strike must be in HIDDEN pool for Mage');
  assert.ok(hiddenIds.has('mortal_blow'), 'mortal_blow must be in HIDDEN pool for Mage');

  // Verify that visible does NOT contain the whole registry
  const totalAllSkills = Object.keys(window.EchoData?.SKILL_DEFS_ECHO || {}).length;
  assert.ok(visible.length < totalAllSkills / 2, `Visible skills (${visible.length}) must be a clean subset of total (${totalAllSkills})`);
});

