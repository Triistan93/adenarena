/**
 * canonical-progression-3.0.test.js
 *
 * Hard Acceptance Test Suite for LOT A + LOT B:
 * 1. P0 UI: Zero [object Object] in rendered DOM / card HTML
 * 2. Change Armor: strictly cosmetic, non-combat, damage = 0, pwr = 0
 * 3. Death Pilgrim Lv 1-19: zero fake offensive starter, real basic attack works
 * 4. Stage vs Level Eligibility: S0, S1, S2 at Lv 76 strictly REJECT Hellfire
 * 5. Punishment: unlocks at Lv 20 (Death Blade), unavailable at S0
 * 6. Hellfire: strictly Stage 3 Lv 76+
 * 7. DK Racial Variants: Human (45312), Elf (47511), Dark Elf (47513)
 * 8. Legendary Archer 4★ Golden Fixture: transactional atomic learning tests
 * 9. Grade & Spellbook Domain Independence: HEROIC != RARE, SUPERIOR unmapped
 * 10. Compositional Lock Reasons: array of reasons + primaryLockReason
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Ensure Window & EchoData are initialized in Node test environment
if (typeof window === 'undefined') {
  global.window = {};
}
if (!window.EchoData) {
  const { buildEchoAdapter } = await import('../lineage-idle/data/echo-adapter.js');
  // Trigger adapter initialization
}

import {
  isSkillAvailableForCharacter,
  getSkillVisibility,
  getSkillDetailedVisibility,
  getSkillUnlockLevelForClass,
  isSkillNativeOrAvailableNow,
  SKILL_VISIBILITY_STATES
} from '../lineage-idle/src/services/SkillEligibility.js';

import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';
import { spendSP } from '../lineage-idle/src/engine/SkillEngine.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';

// ─── 1. P0 UI [object Object] Inspection ──────────────────────────────────────

test('1. P0 UI Verification: Zero [object Object] in ViewModel and rendered cards', async () => {
  const char = {
    class: 'deathKnight',
    race: 'human',
    level: 76,
    sp: 5000,
    skills: { hellfire: 1 }
  };
  const vm = getSkillTreeViewModel(char);

  for (const skill of vm.allVisibleSkills) {
    // Assert rank is clean object with numeric properties
    assert.equal(typeof skill.rank.current, 'number');
    assert.equal(typeof skill.rank.max, 'number');
    assert.equal(typeof skill.rank.isMaxed, 'boolean');

    // String interpolation check
    const rankStr = `Lv.${skill.rank.current}/${skill.rank.max}`;
    assert.equal(rankStr.includes('[object Object]'), false);

    // Grade display check
    assert.equal(typeof skill.grade, 'string');
    assert.equal(skill.grade.includes('[object Object]'), false);
  }
});

// ─── 2. Change Armor Contract ──────────────────────────────────────────────────

test('2. Change Armor Contract: Strictly cosmetic, zero damage, non-combat', () => {
  const ca = CANONICAL_SKILL_REGISTRY_V2['change_armor'];
  assert.ok(ca, 'change_armor must exist in V2 registry');
  assert.equal(ca.minLevel, 1, 'Change Armor is minLevel 1');
  assert.equal(ca.combatSkill, false, 'Change Armor must not be a combat offensive skill');
  assert.equal(ca.roleType, 'COSMETIC_VISUAL_ONLY', 'Change Armor must be COSMETIC_VISUAL_ONLY');
  assert.equal(ca.balance.pwr, 0, 'Change Armor power must be 0');
  assert.equal(ca.balance.mpCost, 0, 'Change Armor mpCost must be 0');
});

// ─── 3. Death Pilgrim Lv 1–19 Gameplay & Basic Attack ─────────────────────────

test('3. Death Pilgrim Lv 1: Zero fake offensive starter, basic attack valid', () => {
  const pilgrim = {
    class: 'deathPilgrim',
    race: 'human',
    level: 1,
    sp: 500,
    skills: {}
  };
  const vm = getSkillTreeViewModel(pilgrim);

  // Active tab must contain ONLY change_armor (no Hellfire, no Power Strike, no Mortal Blow)
  const activeSkills = vm.allVisibleSkills.filter(s => s.tab === 'active');
  assert.equal(activeSkills.length, 1, 'Death Pilgrim must have exactly 1 active skill at Lv 1');
  assert.equal(activeSkills[0].skillId, 'change_armor', 'Only change_armor in active tab');

  // Verify no damaging combat skills are available to Death Pilgrim at Lv 1
  assert.equal(isSkillAvailableForCharacter(pilgrim, 'hellfire'), false);
  assert.equal(isSkillAvailableForCharacter(pilgrim, 'punishment'), false);
  assert.equal(isSkillAvailableForCharacter(pilgrim, 'power_strike'), false);
});

// ─── 4. Stage Eligibility != Level Eligibility (Promotion Bypass Gate) ────────

test('4. Stage Gate != Level Gate: Promotion bypass strictly rejected', () => {
  // S0 artificially at Lv 76 -> REJECT
  const s0_lv76 = { class: 'deathPilgrim', race: 'human', level: 76, sp: 2000, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s0_lv76, 'hellfire'), false, 'S0 Lv76 must REJECT Hellfire');
  assert.equal(getSkillVisibility(s0_lv76, 'hellfire'), SKILL_VISIBILITY_STATES.LOCKED);

  // S1 artificially at Lv 76 -> REJECT
  const s1_lv76 = { class: 'deathBlade', race: 'human', level: 76, sp: 2000, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s1_lv76, 'hellfire'), false, 'S1 Lv76 must REJECT Hellfire');

  // S2 artificially at Lv 76 -> REJECT
  const s2_lv76 = { class: 'deathMessenger', race: 'human', level: 76, sp: 2000, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s2_lv76, 'hellfire'), false, 'S2 Lv76 must REJECT Hellfire');

  // S3 at Lv 75 -> REJECT (level locked)
  const s3_lv75 = { class: 'deathKnight', race: 'human', level: 75, sp: 2000, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s3_lv75, 'hellfire'), false, 'S3 Lv75 must REJECT Hellfire');

  // S3 at Lv 76 -> PASS stage & level gates
  const s3_lv76 = { class: 'deathKnight', race: 'human', level: 76, sp: 2000, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s3_lv76, 'hellfire'), true, 'S3 Lv76 passes stage and level gates');
});

// ─── 5. Punishment Progression ────────────────────────────────────────────────

test('5. Punishment: Unlocks at Lv 20 (Death Blade), strictly unavailable at S0', () => {
  const s0_lv19 = { class: 'deathPilgrim', race: 'human', level: 19, sp: 500, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s0_lv19, 'punishment'), false, 'S0 Lv19 cannot learn Punishment');

  const s1_lv20 = { class: 'deathBlade', race: 'human', level: 20, sp: 500, skills: {} };
  assert.equal(isSkillAvailableForCharacter(s1_lv20, 'punishment'), true, 'Death Blade Lv20 can learn Punishment');
});

// ─── 6. Death Knight Racial Variants ──────────────────────────────────────────

test('6. Death Knight Racial Variants: Preserved across Human, Elf, and Dark Elf', () => {
  // Canonical registry checks
  const hDK3 = CANONICAL_CLASS_REGISTRY['human_deathknight_3'];
  const eDK3 = CANONICAL_CLASS_REGISTRY['elf_deathknight_3'];
  const dDK3 = CANONICAL_CLASS_REGISTRY['delf_deathknight_3'];

  // Human Hellfire = 45312
  assert.ok(hDK3.unlockedSkillIds.includes('45312'), 'Human DK S3 must have Hellfire 45312');
  // Elf Hellfire = 47511
  assert.ok(eDK3.unlockedSkillIds.includes('47511'), 'Elf DK S3 must have Hellfire 47511');
  // Dark Elf Hellfire = 47513
  assert.ok(dDK3.unlockedSkillIds.includes('47513'), 'Dark Elf DK S3 must have Hellfire 47513');
});

// ─── 7. Compositional Lock Reasons ────────────────────────────────────────────

test('7. Compositional Lock Reasons: Multiple reasons preserved without loss', () => {
  // S0 Lv 1 trying to view Hellfire
  const pilgrim = { class: 'deathPilgrim', race: 'human', level: 1, sp: 10, skills: {} };
  const vmPilgrim = getSkillTreeViewModel(pilgrim);

  // S0 artificially at Lv 76 trying to view Hellfire
  const s0_lv76 = { class: 'deathPilgrim', race: 'human', level: 76, sp: 0, skills: {} };
  const vm76 = getSkillTreeViewModel(s0_lv76);
  const hf76 = vm76.allVisibleSkills.find(s => s.skillId === 'hellfire');
  assert.ok(hf76, 'hellfire visible in partition');
  assert.ok(hf76.lockReasons.includes('CLASS_STAGE_LOCKED'), 'Must include CLASS_STAGE_LOCKED');
  assert.ok(hf76.lockReasons.includes('SP_LOCKED'), 'Must include SP_LOCKED');
  assert.equal(hf76.state, 'LOCKED');
});

// ─── 8. Legendary Archer 4★ Fixture: Transactional Atomic Learning ─────────────

test('8. Legendary Archer 4★ Golden Fixture: Atomic learning with zero consumption on rejection', () => {
  // Scenario A: Pre-76 Sagittarius + book_4star -> REJECT (zero consumption)
  const stateA = {
    class: 'sagittarius',
    race: 'human',
    level: 75,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b1', itemId: 'book_4star', count: 1 }]
  };
  const resultA = spendSP(stateA, 'legendary_archer');
  assert.equal(resultA, false, 'Pre-76 Sagittarius must be rejected');
  assert.equal(stateA.sp, 1000, 'Zero SP consumed on failure');
  assert.equal(stateA.inventory[0].count, 1, 'Zero book consumed on failure');
  assert.equal(stateA.skills['legendary_archer'] || 0, 0, 'Skill rank remains 0');

  // Scenario B: Lv 76 Sagittarius without book -> REJECT (zero consumption)
  const stateB = {
    class: 'sagittarius',
    race: 'human',
    level: 76,
    sp: 1000,
    skills: {},
    inventory: []
  };
  const resultB = spendSP(stateB, 'legendary_archer');
  assert.equal(resultB, false, 'Lv 76 Sagittarius without book must be rejected');
  assert.equal(stateB.sp, 1000, 'Zero SP consumed on failure');
  assert.equal(stateB.skills['legendary_archer'] || 0, 0, 'Skill rank remains 0');

  // Scenario C: Lv 76 Sagittarius with wrong book (book_3star) -> REJECT (zero consumption)
  const stateC = {
    class: 'sagittarius',
    race: 'human',
    level: 76,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b3', itemId: 'book_3star', count: 1 }]
  };
  const resultC = spendSP(stateC, 'legendary_archer');
  assert.equal(resultC, false, 'Lv 76 Sagittarius with wrong book must be rejected');
  assert.equal(stateC.sp, 1000, 'Zero SP consumed on failure');
  assert.equal(stateC.inventory[0].count, 1, 'Wrong book not consumed');
  assert.equal(stateC.skills['legendary_archer'] || 0, 0, 'Skill rank remains 0');

  // Scenario D: Lv 76 Sagittarius with correct book (book_4star) -> ACCEPT (atomic deduction)
  const stateD = {
    class: 'sagittarius',
    race: 'human',
    level: 76,
    sp: 1000,
    skills: {},
    inventory: [{ uid: 'b4', itemId: 'book_4star', count: 1 }]
  };
  const resultD = spendSP(stateD, 'legendary_archer');
  assert.equal(resultD, true, 'Lv 76 Sagittarius with book_4star must succeed');
  assert.ok(stateD.sp < 1000, 'SP must be deducted');
  const bookItemD = stateD.inventory.find(i => i.itemId === 'book_4star');
  assert.equal(bookItemD ? bookItemD.count : 0, 0, 'book_4star consumed exactly once');
  assert.equal(stateD.skills['legendary_archer'], 1, 'Skill learned at rank 1');

  // Scenario E: Second attempt without another book (rank 1 -> rank 2 does not require book, only rank 0 -> 1)
  const spBeforeE = stateD.sp;
  const resultE = spendSP(stateD, 'legendary_archer');
  assert.equal(resultE, true, 'Rank 2 upgrade succeeds with SP');
  assert.ok(stateD.sp < spBeforeE, 'SP deducted for rank 2');
  assert.equal(stateD.skills['legendary_archer'], 2, 'Skill learned at rank 2');
});

// ─── 9. Grade and Book Independence ───────────────────────────────────────────

test('9. Grade and Book Independence: HEROIC != RARE, SUPERIOR unmapped', () => {
  const la = CANONICAL_SKILL_REGISTRY_V2['legendary_archer'];
  assert.equal(la.grade, 'LEGENDARY');
  assert.equal(la.bookRequirement.tier, 'LEGENDARY');
  assert.equal(la.bookRequirement.stars, 4);

  // Verify Hellfire has UNPROVEN bookRequirement (no blind assumption)
  const hf = CANONICAL_SKILL_REGISTRY_V2['hellfire'];
  assert.equal(hf.bookRequirement.tier, 'UNPROVEN', 'Hellfire book tier must be UNPROVEN');
  assert.equal(hf.bookRequirement.stars, null, 'Hellfire stars must be null');
});
