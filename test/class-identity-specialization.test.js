/**
 * test/class-identity-specialization.test.js — Formal Test Suite for Deploy 3.1
 * 
 * Comprehensive 25-Scenario Verification + Full 25-Class Matrix Validation:
 * 1. Generalist antes do Lv40
 * 2. Especialização Lv40
 * 3. Sorcerer Fire
 * 4. Sorcerer Ice bloqueado
 * 5. Sorcerer Magma antes do 76 bloqueado
 * 6. Sorcerer Magma no 76
 * 7. Sorcerer Ultimate antes do 80 bloqueada
 * 8. Sorcerer Ultimate no 80
 * 9. Book ausente
 * 10. Master Ultimate antes do 90
 * 11. Master Ultimate no 90
 * 12. Exclusividade
 * 13. Herança
 * 14. Shared skills
 * 15. Physical classes
 * 16. Race differentiation
 * 17. Fingerprint sem classId
 * 18. Duplicate detection
 * 19. 25 Ultimates
 * 20. 25 Master Ultimates
 * 21. VFX coverage
 * 22. VFX uniqueness
 * 23. Ultimate anti-substitution
 * 24. Fixer anti-downgrade
 * 25. Audit -> Fix -> Audit
 * + Full 25/25 Matrix Validation
 * + Artwork Semantic Regression (Human Archmage != Fighter)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getProgressionStage,
  PROGRESSION_STAGES,
  STAGE_LEVELS,
  ROLE_REGISTRY,
  normalizeRole,
  validateSkillLifecycle
} from '../lineage-idle/src/data/elemental/SkillProgression.js';

import {
  CLASS_IDENTITIES,
  getAllClassIdentities,
  getClassIdentity,
  getAllowedElements,
  getAllowedElementsByLevel,
  getForbiddenElements,
  getSkillPoolForStage,
  getUltimateSkill,
  getMasterUltimateSkill,
  getSignatureSkills
} from '../lineage-idle/src/data/elemental/ClassIdentity.js';

import {
  ALL_NATIVE_SKILLS,
  ALL_ENDGAME_SKILLS,
  ALL_CANONICAL_ACTIVE_SKILLS,
  ULTIMATE_SKILLS,
  MASTER_ULTIMATE_SKILLS,
  getNativeSkillById,
  getNativeSkillsByClass,
  getAllSkillsForClass,
  isNativeToClass
} from '../lineage-idle/src/data/elemental/NativeSkillTrees.js';

import {
  ACTIVE_CLASSES,
  ELEMENT_MATRIX,
  getActiveClass
} from '../lineage-idle/src/data/elemental/ElementMatrix.js';

import {
  auditCharacterSkills,
  checkSkillOwnership,
  findBestSubstituteSkill
} from '../lineage-idle/src/services/ElementalSkillAuditor.js';

import {
  applySkillFix
} from '../lineage-idle/src/services/ElementalSkillFixer.js';

import {
  computeGameplayIdentityFingerprint,
  computeFullIdentityFingerprint,
  compareClassPair,
  auditClassIdentities
} from '../lineage-idle/src/services/ClassIdentityAuditor.js';

import {
  auditArtworkSemantics,
  auditEntityArtwork
} from '../lineage-idle/src/services/ArtworkSemanticAuditor.js';

import {
  auditVfxVisualUniqueness,
  computeVfxFingerprint
} from '../lineage-idle/src/services/VfxVisualAuditor.js';

import { getSkillVfx, hasSkillVfx } from '../lineage-idle/src/data/vfx/SkillVfxRegistry.js';
import { heroImgPath } from '../lineage-idle/art.js';

test('Deploy 3.1 — Class Identity, Specialization & Ultimate System Test Suite', async (t) => {

  // ─── Scenario 1: Generalist antes do Lv40 ──────────────────────────────────
  await t.test('Scenario 01: Generalist antes do Lv40 (Lv 1–39)', () => {
    assert.equal(getProgressionStage(1), 'GENERALIST');
    assert.equal(getProgressionStage(20), 'GENERALIST');
    assert.equal(getProgressionStage(39), 'GENERALIST');

    const sorcererLv39Identity = getClassIdentity('human_sorcerer');
    const allowedLv39 = getAllowedElementsByLevel('human_sorcerer', 39);
    assert.deepEqual(allowedLv39, ['*magic*'], 'Generalist magic archetype allows *magic* wildcard');

    const char39 = {
      id: 'char_sorc_39',
      class_id: 'human_sorcerer',
      level: 39,
      equippedSkills: ['wind_strike']
    };
    const audit = auditCharacterSkills(char39);
    assert.equal(audit.progressionStage, 'GENERALIST');
    assert.equal(audit.status, 'VALID');
  });

  // ─── Scenario 2: Especialização Lv40 ───────────────────────────────────────
  await t.test('Scenario 02: Especialização Lv40 lock-in', () => {
    assert.equal(getProgressionStage(40), 'SPECIALIZATION');
    assert.equal(getProgressionStage(75), 'SPECIALIZATION');

    const sorcAllowed40 = getAllowedElementsByLevel('human_sorcerer', 40);
    assert.deepEqual(sorcAllowed40, ['Fire'], 'Sorcerer locks strictly into Fire at Lv40');

    const fighterAllowed40 = getAllowedElementsByLevel('human_fighter', 40);
    assert.deepEqual(fighterAllowed40, ['Physical'], 'Fighter locks into Physical');
  });

  // ─── Scenario 3: Sorcerer Fire ──────────────────────────────────────────────
  await t.test('Scenario 03: Sorcerer Lv40 + Fire -> VALID', () => {
    const char = {
      id: 'char_sorc_40_fire',
      class_id: 'human_sorcerer',
      level: 40,
      equippedSkills: ['fireball', 'flame_nova']
    };
    const audit = auditCharacterSkills(char);
    assert.equal(audit.status, 'VALID');
    assert.equal(audit.summary.valid, 2);
    assert.equal(audit.summary.invalid, 0);
  });

  // ─── Scenario 4: Sorcerer Ice bloqueado ──────────────────────────────────────
  await t.test('Scenario 04: Sorcerer Lv40 + Ice -> ELEMENT_MISMATCH', () => {
    const char = {
      id: 'char_sorc_ice',
      class_id: 'human_sorcerer',
      level: 40,
      equippedSkills: ['fireball', 'blizzard'] // Ice skill from elf_mage
    };
    const audit = auditCharacterSkills(char);
    const diag = audit.diagnostics.find(d => d.skillId === 'blizzard' && d.code === 'ELEMENT_MISMATCH');
    assert.ok(diag, 'Must detect ELEMENT_MISMATCH because Ice is never allowed for Sorcerer');
  });

  // ─── Scenario 5: Sorcerer Magma antes do 76 bloqueado ───────────────────────
  await t.test('Scenario 05: Sorcerer Lv40/75 + Magma -> STAGE_REQUIREMENT', () => {
    const char40 = {
      id: 'char_sorc_40_magma',
      class_id: 'human_sorcerer',
      level: 40,
      equippedSkills: ['fireball', 'magma_spike']
    };
    const audit40 = auditCharacterSkills(char40);
    const diag40 = audit40.diagnostics.find(d => d.skillId === 'magma_spike' && d.code === 'STAGE_REQUIREMENT');
    assert.ok(diag40, 'Must detect STAGE_REQUIREMENT at Lv40 because Magma unlocks at Lv76 Mastery');

    const char75 = {
      id: 'char_sorc_75_magma',
      class_id: 'human_sorcerer',
      level: 75,
      equippedSkills: ['fireball', 'magma_spike']
    };
    const audit75 = auditCharacterSkills(char75);
    const diag75 = audit75.diagnostics.find(d => d.skillId === 'magma_spike' && d.code === 'STAGE_REQUIREMENT');
    assert.ok(diag75, 'Must detect STAGE_REQUIREMENT at Lv75');
  });

  // ─── Scenario 6: Sorcerer Magma no 76 ───────────────────────────────────────
  await t.test('Scenario 06: Sorcerer Lv76 + Magma -> VALID', () => {
    const char76 = {
      id: 'char_sorc_76_magma',
      class_id: 'human_sorcerer',
      level: 76,
      equippedSkills: ['fireball', 'magma_spike', 'flame_nova']
    };
    const audit = auditCharacterSkills(char76);
    assert.equal(audit.status, 'VALID');
    assert.equal(audit.summary.invalid, 0);
  });

  // ─── Scenario 7: Sorcerer Ultimate antes do 80 bloqueada ────────────────────
  await t.test('Scenario 07: Sorcerer Ultimate antes do 80 bloqueada (Lv 79) -> STAGE_REQUIREMENT', () => {
    const char79 = {
      id: 'char_sorc_79_ult',
      class_id: 'human_sorcerer',
      level: 79,
      equippedSkills: ['fireball', 'magma_spike', 'meteor']
    };
    const audit = auditCharacterSkills(char79);
    const diag = audit.diagnostics.find(d => d.skillId === 'meteor' && d.code === 'STAGE_REQUIREMENT');
    assert.ok(diag, 'Meteor requires Level 80 (Stage ULTIMATE)');
  });

  // ─── Scenario 8: Sorcerer Ultimate no 80 ────────────────────────────────────
  await t.test('Scenario 08: Sorcerer Ultimate no 80 (Lv 80 + Book) -> VALID', () => {
    const char80 = {
      id: 'char_sorc_80_ult',
      class_id: 'human_sorcerer',
      level: 80,
      equippedSkills: ['fireball', 'magma_spike', 'meteor']
    };
    const audit = auditCharacterSkills(char80, { requireBooks: false });
    assert.equal(audit.status, 'VALID');
    assert.equal(audit.summary.invalid, 0);
  });

  // ─── Scenario 9: Book ausente ───────────────────────────────────────────────
  await t.test('Scenario 09: Sorcerer Lv80 + Meteor sem Book -> REQUIREMENT_UNMET', () => {
    const char80NoBook = {
      id: 'char_sorc_80_nobook',
      class_id: 'human_sorcerer',
      level: 80,
      equippedSkills: ['fireball', 'magma_spike', 'meteor']
    };
    const audit = auditCharacterSkills(char80NoBook, { requireBooks: true, hasBook: false });
    const diag = audit.diagnostics.find(d => d.skillId === 'meteor' && d.code === 'REQUIREMENT_UNMET');
    assert.ok(diag, 'Must detect REQUIREMENT_UNMET when ULTIMATE_BOOK_4 is missing');
  });

  // ─── Scenario 10: Master Ultimate antes do 90 ───────────────────────────────
  await t.test('Scenario 10: Master Ultimate antes do 90 (Lv 89) -> STAGE_REQUIREMENT', () => {
    const char89 = {
      id: 'char_sorc_89_master',
      class_id: 'human_sorcerer',
      level: 89,
      equippedSkills: ['fireball', 'magma_spike', 'meteor', 'master_meteor']
    };
    const audit = auditCharacterSkills(char89);
    const diag = audit.diagnostics.find(d => d.skillId === 'master_meteor' && d.code === 'STAGE_REQUIREMENT');
    assert.ok(diag, 'Master Meteor requires Level 90 (MASTER_ULTIMATE)');
  });

  // ─── Scenario 11: Master Ultimate no 90 ─────────────────────────────────────
  await t.test('Scenario 11: Master Ultimate no 90 (Lv 90) -> VALID', () => {
    const char90 = {
      id: 'char_sorc_90_master',
      class_id: 'human_sorcerer',
      level: 90,
      equippedSkills: ['fireball', 'magma_spike', 'meteor', 'master_meteor']
    };
    const audit = auditCharacterSkills(char90, { requireBooks: false });
    assert.equal(audit.status, 'VALID');
    assert.equal(audit.summary.invalid, 0);
  });

  // ─── Scenario 12: Exclusividade ─────────────────────────────────────────────
  await t.test('Scenario 12: Exclusividade — classes não recebem skills de outras sem regra explícita', () => {
    // Spellsinger skills cannot be equipped by Sorcerer
    const char = {
      id: 'char_isolation',
      class_id: 'human_sorcerer',
      level: 80,
      equippedSkills: ['fireball', 'blizzard'] // elf_mage ultimate
    };
    const audit = auditCharacterSkills(char);
    const diag = audit.diagnostics.find(d => d.skillId === 'blizzard' && (d.code === 'OWNERSHIP_MISMATCH' || d.code === 'AVAILABILITY_MISMATCH'));
    assert.ok(diag, 'Blizzard is exclusive to elf_mage lineage');
  });

  // ─── Scenario 13: Herança ───────────────────────────────────────────────────
  await t.test('Scenario 13: Herança de skills por classes avançadas (human_archmage herda fireball)', () => {
    const fireball = getNativeSkillById('fireball');
    assert.ok(fireball.inheritedBy.includes('human_archmage'), 'Fireball declares inheritedBy human_archmage');
    assert.ok(fireball.availableTo.includes('human_archmage'), 'Fireball declares availableTo human_archmage');
  });

  // ─── Scenario 14: Shared skills ─────────────────────────────────────────────
  await t.test('Scenario 14: Shared skills — autorização explícita e compatibilidade elemental', () => {
    const soulDevastation = getNativeSkillById('soul_devastation');
    assert.ok(soulDevastation.nativeClasses.includes('kamael_soulbreaker'));
    assert.equal(checkSkillOwnership('soul_devastation', 'kamael_soulbreaker').isAllowed, true);
  });

  // ─── Scenario 15: Physical classes ──────────────────────────────────────────
  await t.test('Scenario 15: Physical classes operam estritamente com elemento Physical', () => {
    const fighterIdentity = getClassIdentity('human_fighter');
    assert.deepEqual(fighterIdentity.allowedElementsByLevel[1], ['Physical']);
    assert.deepEqual(fighterIdentity.allowedElementsByLevel[40], ['Physical']);
    assert.deepEqual(fighterIdentity.allowedElementsByLevel[76], ['Physical']);
    assert.deepEqual(fighterIdentity.allowedElementsByLevel[80], ['Physical']);
    assert.deepEqual(fighterIdentity.allowedElementsByLevel[90], ['Physical']);

    const char = {
      id: 'char_fighter',
      class_id: 'human_fighter',
      level: 80,
      equippedSkills: ['shield_bash', 'cleave_strike', 'iron_stance', 'concussive_stun']
    };
    const audit = auditCharacterSkills(char);
    assert.equal(audit.status, 'VALID');
  });

  // ─── Scenario 16: Race differentiation ──────────────────────────────────────
  await t.test('Scenario 16: Race differentiation — Human Fighter vs Elf Fighter vs Orc Fighter', () => {
    const hFp = computeGameplayIdentityFingerprint('human_fighter');
    const eFp = computeGameplayIdentityFingerprint('elf_fighter');
    const oFp = computeGameplayIdentityFingerprint('orc_fighter');

    assert.equal(hFp.race, 'Human');
    assert.equal(eFp.race, 'Elf');
    assert.equal(oFp.race, 'Orc');

    const compHE = compareClassPair('human_fighter', 'elf_fighter');
    const compHO = compareClassPair('human_fighter', 'orc_fighter');
    assert.equal(compHE.classification, 'UNIQUE');
    assert.equal(compHO.classification, 'UNIQUE');
    assert.ok(compHE.similarity < 0.90);
    assert.ok(compHO.similarity < 0.90);
  });

  // ─── Scenario 17: Fingerprint sem classId ───────────────────────────────────
  await t.test('Scenario 17: GameplayIdentityFingerprint exclui rigorosamente classId', () => {
    const fp = computeGameplayIdentityFingerprint('human_sorcerer');
    assert.equal(fp.classId, undefined, 'classId must NOT exist in GameplayIdentityFingerprint');
    assert.ok(fp.race);
    assert.ok(fp.primaryRole);
    assert.ok(fp.lv40Elements);
    assert.ok(fp.lv76Elements);
    assert.ok(fp.signatureSkills);
  });

  // ─── Scenario 18: Duplicate detection ───────────────────────────────────────
  await t.test('Scenario 18: Duplicate detection — All 25 active classes have <90% similarity', () => {
    const report = auditClassIdentities();
    assert.equal(report.isAllUnique, true);
    assert.equal(report.duplicatePairsCount, 0);
    assert.equal(report.reviewPairsCount, 0);
    assert.equal(report.uniquePairsCount, 300); // 25 * 24 / 2
    assert.equal(report.status, 'PASS');
  });

  // ─── Scenario 19: 25 Ultimates ──────────────────────────────────────────────
  await t.test('Scenario 19: Exactly 25 Lv80 Ultimates (★★★★, ULTIMATE_BOOK_4)', () => {
    assert.equal(ULTIMATE_SKILLS.length, 25);
    for (const ult of ULTIMATE_SKILLS) {
      assert.equal(ult.rarity, 4);
      assert.equal(ult.requiredLevel, 80);
      assert.equal(ult.progressionStage, 'ULTIMATE');
      assert.equal(ult.bookRequirement, 'ULTIMATE_BOOK_4');
      assert.ok(ult.vfxId.startsWith('vfx_'));
    }
  });

  // ─── Scenario 20: 25 Master Ultimates ───────────────────────────────────────
  await t.test('Scenario 20: Exactly 25 Lv90 Master Ultimates (★★★★★)', () => {
    assert.equal(MASTER_ULTIMATE_SKILLS.length, 25);
    for (const mu of MASTER_ULTIMATE_SKILLS) {
      assert.equal(mu.rarity, 5);
      assert.equal(mu.requiredLevel, 90);
      assert.equal(mu.progressionStage, 'MASTER_ULTIMATE');
      assert.ok(mu.upgradeOf);
      assert.ok(mu.vfxId.startsWith('vfx_master_'));
    }
  });

  // ─── Scenario 21: VFX coverage ──────────────────────────────────────────────
  await t.test('Scenario 21: VFX coverage — all 150 skills bound to valid registered VFX', () => {
    const vfxReport = auditVfxVisualUniqueness();
    assert.equal(vfxReport.totalSkillsAudited, 150);
    assert.equal(vfxReport.missingVfxCount, 0);
    assert.equal(vfxReport.totalRegisteredVfx, 150);
    assert.equal(vfxReport.status, 'PASS');
  });

  // ─── Scenario 22: VFX uniqueness ────────────────────────────────────────────
  await t.test('Scenario 22: VFX uniqueness & multi-phase implementation across endgame skills', () => {
    const vfxReport = auditVfxVisualUniqueness();
    assert.equal(vfxReport.endgameDuplicatesCount, 0);
    assert.equal(vfxReport.isAllEndgameVfxUnique, true);
    assert.equal(vfxReport.ultimatesWithMultiPhasesCount, 25);
    assert.equal(vfxReport.masterUltimatesWithMultiPhasesCount, 25);
  });

  // ─── Scenario 23: Ultimate anti-substitution ────────────────────────────────
  await t.test('Scenario 23: Ultimate anti-substitution — Fixer never replaces Ultimate with normal skill', () => {
    const charWithBadUlt = {
      id: 'char_bad_ult',
      class_id: 'human_sorcerer',
      level: 80,
      equippedSkills: ['fireball', 'meteor', 'glacial_cataclysm'] // meteor is already equipped; foreign ultimate has no remaining native ultimate substitute
    };
    const audit = auditCharacterSkills(charWithBadUlt, { requireBooks: false });
    // Candidate cannot be found among basic skills, so blocked with CONTENT_GAP
    assert.equal(audit.safety.blockedReason, 'CONTENT_GAP');
    assert.equal(audit.status, 'BLOCKED');

    const fixResult = applySkillFix(charWithBadUlt);
    assert.equal(fixResult.status, 'BLOCKED');
    assert.equal(fixResult.reason, 'CONTENT_GAP');
    assert.equal(fixResult.fixed, false);
  });

  // ─── Scenario 24: Fixer anti-downgrade ───────────────────────────────────────
  await t.test('Scenario 24: Fixer anti-downgrade — Never demote specialist to generic mage or foreign class', () => {
    const char = {
      id: 'char_spec_fix',
      class_id: 'human_sorcerer',
      level: 76,
      equippedSkills: ['fireball', 'shield_bash']
    };
    const fixResult = applySkillFix(char);
    assert.equal(fixResult.success, true);
    assert.equal(fixResult.fixed, true);
    // Replacement must strictly come from human_sorcerer's native pool
    assert.ok(char.equippedSkills.includes('magma_spike') || char.equippedSkills.includes('flame_nova'));
    assert.equal(char.equippedSkills.includes('wind_strike'), false, 'Never replace with generic generalist skill');
  });

  // ─── Scenario 25: Audit -> Fix -> Audit Atomic Cycle ────────────────────────
  await t.test('Scenario 25: Full atomic fix cycle with immediate post-audit certification', () => {
    const character = {
      id: 'char_atomic_cycle',
      class_id: 'human_sorcerer',
      level: 76,
      equippedSkills: ['fireball', 'shield_bash']
    };
    const result = applySkillFix(character);
    assert.equal(result.success, true);
    assert.equal(result.fixed, true);
    assert.equal(result.rolledBack, false);
    assert.equal(result.status, 'SUCCESS');
    assert.equal(result.postAudit.status, 'VALID');
    assert.equal(result.postAudit.summary.invalid, 0);
  });

  // ─── Full 25/25 Class Matrix Validation ─────────────────────────────────────
  await t.test('Matrix: All 25 active classes have complete identities and progressions', () => {
    const identities = getAllClassIdentities();
    assert.equal(identities.length, 25);

    for (const id of identities) {
      assert.ok(id.classId, 'Missing classId');
      assert.ok(id.race, 'Missing race');
      assert.ok(id.primaryRole, 'Missing primaryRole');
      assert.ok(id.lv40Identity, 'Missing lv40Identity');
      assert.ok(id.lv76Identity, 'Missing lv76Identity');
      assert.ok(id.ultimateSkill, 'Missing ultimateSkill');
      assert.ok(id.masterUltimateSkill, 'Missing masterUltimateSkill');
      assert.ok(id.allowedElementsByLevel[40], 'Missing lv40 elements');
      assert.ok(id.allowedElementsByLevel[76], 'Missing lv76 elements');
      assert.ok(id.skillPools[40], 'Missing lv40 skillPool');
    }
  });

  // ─── Artwork Semantic Regression Test (Bug Proof) ───────────────────────────
  await t.test('Artwork Regression: Human Archmage must resolve as Archmage, never Fighter', () => {
    const archmageAudit = auditEntityArtwork({
      canonicalId: 'human_archmage',
      displayName: 'Archmage',
      race: 'Human',
      stage: 'THIRD_CLASS_AWAKENING',
      archetype: 'Mystic'
    });
    assert.equal(archmageAudit.status, 'PASS');
    assert.equal(archmageAudit.violations.length, 0);
    assert.ok(archmageAudit.portraitMale.includes('archmage'), 'Portrait must be archmage');
    assert.equal(archmageAudit.portraitMale.includes('fighter'), false, 'Portrait must NEVER be fighter');
  });

});
