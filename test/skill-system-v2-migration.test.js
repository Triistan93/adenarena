/**
 * test/skill-system-v2-migration.test.js — Formal Test Suite for Skill System Major Version Update (V2)
 * 
 * Lineage II Essence — Celestial Destiny (Patch 3629, 29/07/2026)
 * 
 * Validates:
 * 1. Catalog Integrity: 46 Lineages, 142 Classes, 825 Semantic Skills, 0 Silent Gaps.
 * 2. Save Migration: Deterministic translation, 100% historical SP refund, audit ledger emission.
 * 3. Progression Gating: Strict 4-tier lifecycle (Base Lv 1-19, First Lv 20-39, Second Lv 40-75, Third Lv 76+).
 * 4. Sibling Branch Isolation: Cross-branch skill access is strictly blocked.
 * 5. Combat & Passive Parity: V2 passives and toggles calculate accurately.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Mock browser global for Node.js test environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Ingest echo-adapter
await import('../lineage-idle/data/echo-adapter.js');

import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { SkillSystemV2Validator } from '../lineage-idle/src/validators/SkillSystemV2Validator.js';
import { migrateCharacterSave, calculateHistoricalSpSpent } from '../lineage-idle/src/services/SkillMigrationService.js';
import { isSkillInProgressionPath, resolveSkillDef, isMageClass, areSiblingBranches } from '../lineage-idle/src/services/SkillEligibility.js';
import { isSkillAllowedForClass } from '../lineage-idle/src/services/CharacterService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

test('1. V2 Catalog Integrity: 46 Lineages, 142 Classes, 825 Skills, 0 Silent Gaps', () => {
  const report = SkillSystemV2Validator.validateCanonicalCatalog();
  assert.equal(report.valid, true, `Catalog audit failed: ${report.errors.join('; ')}`);
  assert.equal(report.metrics.totalSkills, 825, 'Must contain exactly 825 unique canonical skills');
  assert.equal(report.metrics.totalClasses, 142, 'Must contain 142 canonical classes across 4 stages');
  assert.equal(report.metrics.totalLineages, 46, 'Must contain all 46 official lineages');

  // Verify stage distribution
  assert.equal(report.metrics.stageCounts.BASE, 19, 'Must have 19 Base classes');
  assert.equal(report.metrics.stageCounts.FIRST_CLASS, 32, 'Must have 32 1st classes');
  assert.equal(report.metrics.stageCounts.SECOND_CLASS, 45, 'Must have 45 2nd classes');
  assert.equal(report.metrics.stageCounts.THIRD_CLASS, 46, 'Must have 46 3rd classes');

  // Verify zero silent gaps
  for (const [sId, s] of Object.entries(CANONICAL_SKILL_REGISTRY_V2)) {
    assert.notEqual(s.iconGap, undefined, `Skill ${sId} has undefined iconGap`);
    assert.notEqual(s.vfxGap, undefined, `Skill ${sId} has undefined vfxGap`);
    assert.notEqual(s.sfxGap, undefined, `Skill ${sId} has undefined sfxGap`);
    if (s.iconGap === true) {
      assert.ok(s.iconGapReason, `Skill ${sId} is iconGap=true but has no iconGapReason`);
    }
  }
});

test('2. Save Migration Pipeline: Deterministic remapping and 100% SP refund ledger', () => {
  const legacySave = {
    class: 'human_sorcerer',
    level: 76,
    sp: 100,
    skills: {
      'fireball': 3,               // Mapped -> prominence rank 3
      'cinderblade': 2,            // Mapped -> death_raid rank 2
      'obsolete_ancient_curse': 4  // Removed skill -> 100% SP refund
    },
    hotbar: ['fireball', 'obsolete_ancient_curse', null],
    skillAutoCast: { 'fireball': true, 'obsolete_ancient_curse': false }
  };

  const originalSp = legacySave.sp;
  const expectedRefund = calculateHistoricalSpSpent(5, 4); // Rank 4 refund: 5 + 7 + 9 + 13 = 34 SP

  const ledger = migrateCharacterSave(legacySave);

  assert.equal(legacySave.skillSystemVersion, 2, 'Must set skillSystemVersion to 2');
  assert.equal(legacySave.skills['prominence'], 3, 'fireball must be translated to prominence rank 3');
  assert.equal(legacySave.skills['death_raid'], 2, 'cinderblade must be translated to death_raid rank 2');
  assert.equal(legacySave.skills['obsolete_ancient_curse'], undefined, 'Obsolete skill must be removed');

  assert.equal(ledger.totalSpRefunded, expectedRefund, `Refund must match historical calculation (${expectedRefund})`);
  assert.equal(legacySave.sp, originalSp + expectedRefund, 'Player SP must be incremented by exact refund');

  // Verify ledger structure
  assert.ok(legacySave.migrationLedger, 'State must persist migrationLedger');
  assert.equal(legacySave.migrationLedger.refunds.length, 1);
  assert.equal(legacySave.migrationLedger.refunds[0].oldSkillId, 'obsolete_ancient_curse');
  assert.equal(legacySave.migrationLedger.refunds[0].spRefunded, expectedRefund);

  // Verify hotbar cleanup
  assert.equal(legacySave.hotbar[0], 'prominence', 'Hotbar mapped skill must update');
  assert.equal(legacySave.hotbar[1], null, 'Hotbar obsolete skill must be nullified');

  // Verify idempotency
  const secondRunLedger = migrateCharacterSave(legacySave);
  assert.equal(secondRunLedger, legacySave.migrationLedger, 'Subsequent runs must be no-ops');
});

test('3. Historical SP Calculation Formula: Strict mathematical adherence', () => {
  // Formula: sum(floor(baseCost * 1.4^l))
  // Rank 1: floor(5 * 1.4^0) = 5
  // Rank 2: 5 + floor(5 * 1.4^1) = 5 + 7 = 12
  // Rank 3: 12 + floor(5 * 1.4^2) = 12 + 9 = 21
  // Rank 4: 21 + floor(5 * 1.4^3) = 21 + 13 = 34
  // Rank 5: 34 + floor(5 * 1.4^4) = 34 + 19 = 53
  assert.equal(calculateHistoricalSpSpent(5, 1), 5);
  assert.equal(calculateHistoricalSpSpent(5, 2), 12);
  assert.equal(calculateHistoricalSpSpent(5, 3), 21);
  assert.equal(calculateHistoricalSpSpent(5, 4), 34);
  assert.equal(calculateHistoricalSpSpent(5, 5), 53);
});

test('4. V2 Progression Gating: Gladiator Lv 40 progression path vs sibling and future classes', () => {
  const gladiator = { class: 'gladiator', level: 40, race: 'human' };

  // Base and 1st class skills must be in progression path (ancestors)
  assert.ok(isSkillInProgressionPath(gladiator, 'power_strike'), 'Gladiator inherits Base Fighter power_strike');
  assert.ok(isSkillInProgressionPath(gladiator, 'power_smash'), 'Gladiator inherits 1st Class Warrior power_smash');

  // 2nd class current skills must be in progression path
  assert.ok(isSkillInProgressionPath(gladiator, 'triple_slash'), 'Gladiator owns 2nd class triple_slash');
  assert.ok(isSkillInProgressionPath(gladiator, 'sonic_blaster'), 'Gladiator owns 2nd class sonic_blaster');

  // 3rd class future skills must be in progression path (descendants)
  assert.ok(isSkillInProgressionPath(gladiator, 'sonic_focus'), 'Gladiator has 3rd class Duelist sonic_focus in future path');

  // Sibling branch skills (Knight / Paladin) must be strictly rejected
  assert.equal(isSkillInProgressionPath(gladiator, 'shield_stun'), false, 'Gladiator cannot access Knight shield_stun');
  assert.equal(isSkillInProgressionPath(gladiator, 'holy_blessing'), false, 'Gladiator cannot access Paladin holy_blessing');

  // Opposite archetype (Mage) must be strictly rejected
  assert.equal(isSkillInProgressionPath(gladiator, 'prominence'), false, 'Gladiator cannot access Mage prominence');
  assert.equal(isSkillInProgressionPath(gladiator, 'hydro_blast'), false, 'Gladiator cannot access Mage hydro_blast');
});

test('5. V2 Combat & Passive Engine Parity: Stat calculations reflect V2 canonical passives', () => {
  const dummyState = {
    level: 76,
    base: { atk: 100, def: 100, matk: 100, mdef: 100, eva: 20 },
    skills: {
      'dual_weapon_mastery': 5, // +25 P.Atk
      'heavy_armor_mastery': 5, // +60 P.Def
      'anti_magic': 5,          // +90 M.Def
      'focus': 5,               // +25 Crit
      'critical_power': 5       // +25% Crit Dmg
    },
    equipment: {},
    buffs: {}
  };

  const calculated = getStats(dummyState);
  assert.ok(calculated.atk > 100, 'P.Atk must be augmented by dual_weapon_mastery');
  assert.ok(calculated.def > 100, 'P.Def must be augmented by heavy_armor_mastery');
  assert.ok(calculated.mdef > 100, 'M.Def must be augmented by anti_magic');
  assert.ok(calculated.crit > 0, 'Crit must be augmented by focus');
});

test('6. Sibling Branch DAG Isolation: areSiblingBranches verifies lineage divergence', () => {
  // Dark Elf Wizard vs Shillien Oracle
  assert.ok(areSiblingBranches('dark_wizard', 'shillien_oracle'), 'dark_wizard and shillien_oracle are sibling branches');

  // Orc Raider vs Monk
  assert.ok(areSiblingBranches('orc_raider', 'monk'), 'orc_raider and monk are sibling branches');

  // Gladiator vs Paladin
  assert.ok(areSiblingBranches('gladiator', 'paladin'), 'gladiator and paladin are sibling branches');
});

test('7. Advanced Lineages Progression Gating: Grand Vanguard, Death Knight, ShineMaker, Archmage', () => {
  // 1. Grand Vanguard (3rd class) inherits from 2nd, 1st, and Base
  assert.ok(isSkillAllowedForClass('grandVanguard', 'dragons_breath'), 'Grand Vanguard has native 3rd class dragons_breath');
  assert.ok(isSkillAllowedForClass('grandVanguard', 'devastating_charge'), 'Grand Vanguard inherits 2nd class vanguardRider devastating_charge');
  assert.ok(isSkillAllowedForClass('grandVanguard', 'trample'), 'Grand Vanguard inherits 1st class dragoon trample');
  assert.ok(isSkillAllowedForClass('grandVanguard', 'lance_charge'), 'Grand Vanguard inherits Base rider lance_charge');

  // Rejects foreign lineage skills
  assert.equal(isSkillAllowedForClass('grandVanguard', 'death_storm'), false, 'Grand Vanguard cannot access Death Knight death_storm');
  assert.equal(isSkillAllowedForClass('grandVanguard', 'triple_slash'), false, 'Grand Vanguard cannot access Duelist triple_slash');

  // 2. Death Knight (3rd class)
  assert.ok(isSkillAllowedForClass('deathKnight', 'death_storm'), 'Death Knight has native death_storm');
  assert.ok(isSkillAllowedForClass('deathKnight', 'death_raid'), 'Death Knight inherits death_raid');
  assert.equal(isSkillAllowedForClass('deathKnight', 'dragons_breath'), false, 'Death Knight cannot access Grand Vanguard dragons_breath');

  // 3. ShineMaker (3rd class)
  assert.ok(isSkillAllowedForClass('shinemaker', 'star_fall'), 'ShineMaker has native star_fall');
  assert.ok(isSkillAllowedForClass('shinemaker', 'holy_light'), 'ShineMaker inherits High Elf holy_light');
  assert.equal(isSkillAllowedForClass('shinemaker', 'sonic_blaster'), false, 'ShineMaker cannot access Duelist sonic_blaster');

  // 4. Archmage (3rd class)
  assert.ok(isSkillAllowedForClass('archmage', 'hell_inferno'), 'Archmage has native hell_inferno');
  assert.ok(isSkillAllowedForClass('archmage', 'prominence'), 'Archmage inherits Sorcerer prominence');
  assert.equal(isSkillAllowedForClass('archmage', 'aqua_splash'), false, 'Archmage cannot access Mystic Muse aqua_splash');
});

test('8. AutoCast & Hotbar Combat Execution Parity with V2 Skills', () => {
  const SKILL_DEFS = window.EchoData.SKILL_DEFS_ECHO;
  assert.ok(SKILL_DEFS, 'SKILL_DEFS_ECHO must exist');

  const playerState = {
    class: 'duelist',
    level: 76,
    sp: 5000,
    skills: {
      'triple_slash': 3,
      'sonic_blaster': 2,
      'sonic_focus': 1,
      'dual_weapon_mastery': 5
    },
    hotbar: ['triple_slash', 'sonic_blaster', 'sonic_focus'],
    skillAutoCast: { 'triple_slash': true, 'sonic_blaster': true, 'sonic_focus': false }
  };

  const autoCastSettings = playerState.skillAutoCast || {};
  const activeSkills = [];

  for (const [sId, lvl] of Object.entries(playerState.skills)) {
    const def = SKILL_DEFS[sId];
    if (lvl > 0 && def) {
      const isPassive = def.type === 'passive' || def.type === 'stat';
      if (!isPassive) {
        if (autoCastSettings[sId] === false) continue;
        const belongsToClass = isSkillAllowedForClass(playerState.class, sId) && (Number(def.requiredLevel || def.reqLvl) || 1) <= playerState.level;
        if (belongsToClass) {
          activeSkills.push({ id: sId, lvl, def });
        }
      }
    }
  }

  // Verify queued skills
  assert.equal(activeSkills.length, 2, 'Exactly 2 active skills must be queued for autoCast');
  assert.equal(activeSkills[0].id, 'triple_slash');
  assert.equal(activeSkills[0].lvl, 3);
  assert.equal(activeSkills[1].id, 'sonic_blaster');
  assert.equal(activeSkills[1].lvl, 2);

  // sonic_focus was false in autoCast
  assert.ok(!activeSkills.some(s => s.id === 'sonic_focus'), 'sonic_focus must be skipped due to autoCast: false');
  // dual_weapon_mastery is passive
  assert.ok(!activeSkills.some(s => s.id === 'dual_weapon_mastery'), 'dual_weapon_mastery must be excluded as passive');
});

test('9. Deterministic Multi-Skill SP Refund & Save Idempotency', () => {
  const complexSave = {
    class: 'grandVanguard',
    level: 76,
    sp: 1000,
    skills: {
      'dragons_breath': 2,               // Native V2 match
      'obsolete_ancient_charge': 3,       // Removed skill: rank 3 -> 5 + 7 + 9 = 21 SP
      'obsolete_old_banner': 5            // Removed skill: rank 5 -> 5 + 7 + 9 + 13 + 19 = 53 SP
    },
    hotbar: ['dragons_breath', 'obsolete_ancient_charge', 'obsolete_old_banner'],
    skillAutoCast: { 'dragons_breath': true, 'obsolete_ancient_charge': true }
  };

  const expectedTotalRefund = calculateHistoricalSpSpent(5, 3) + calculateHistoricalSpSpent(5, 5); // 21 + 53 = 74 SP
  const ledger = migrateCharacterSave(complexSave);

  assert.equal(complexSave.skillSystemVersion, 2);
  assert.equal(ledger.totalSpRefunded, 74);
  assert.equal(complexSave.sp, 1000 + 74);
  assert.equal(ledger.refunds.length, 2);

  // Both obsolete skills removed from skills object
  assert.equal(complexSave.skills['obsolete_ancient_charge'], undefined);
  assert.equal(complexSave.skills['obsolete_old_banner'], undefined);
  assert.equal(complexSave.skills['dragons_breath'], 2);

  // Hotbar cleaned
  assert.equal(complexSave.hotbar[0], 'dragons_breath');
  assert.equal(complexSave.hotbar[1], null);
  assert.equal(complexSave.hotbar[2], null);

  // Idempotency: re-running does not double-refund or alter state
  const prevSp = complexSave.sp;
  const reRunLedger = migrateCharacterSave(complexSave);
  assert.equal(reRunLedger, ledger);
  assert.equal(complexSave.sp, prevSp);
});
