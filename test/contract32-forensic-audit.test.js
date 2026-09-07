/**
 * test/contract32-forensic-audit.test.js — Formal Test Suite for Contract 3.2.1 Forensic Audit
 * 
 * Verifies that Contract 3.2.1 data layer satisfies all forensic invariants:
 * - 159 Raw Class Nodes
 * - 25 Active Classes
 * - 73 Historical Canonical Classes
 * - 98 Canonical Class Entities (159 != 98 != 73)
 * - 274 Class Aliases
 * - 1,315 Raw / Historical Skill Instances
 * - 100 Active Skill Slots
 * - 942 Unique Skill Definitions (Derived)
 * - 72 Lineage Relations / Edges
 * - 100 VFX Registrations (STRUCTURAL_ONLY)
 * - orc_mage PROVEN_CANONICAL
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runForensicAudit } from '../lineage-idle/src/data/elemental/Contract32ForensicAudit.js';
import { getVfxArchitecture, getVfxStats, VFX_VISUAL_IMPLEMENTATION } from '../lineage-idle/src/data/vfx/SkillVfxRegistry.js';
import { getPredecessor, getSuccessors, getLineage, getClassEntity } from '../lineage-idle/src/data/elemental/ClassLineage.js';

test('Game Data Contract 3.2.1 — Forensic Audit Integrity Suite', async (t) => {
  const audit = runForensicAudit();

  await t.test('1. Active Classes: Exactly 25 verified active classes', () => {
    assert.equal(audit.activeClassesCount, 25, 'Expected exactly 25 active classes');
    assert.equal(new Set(audit.activeClasses.map(c => c.id)).size, 25, 'All active class IDs must be unique');
  });

  await t.test('2. Active Skill Slots: Exactly 100 active skill slots without duplicates or orphans', () => {
    assert.equal(audit.activeSkillSlotsCount, 100, 'Expected exactly 100 active skill slots');
    assert.equal(audit.elementViolations.length, 0, 'No element violations across active skills');
  });

  await t.test('3. Historical Classes: Exactly 73 canonical historical classes with orc_mage promoted', () => {
    const humanCount = audit.historicalByRace.Human.length;
    const elfCount = audit.historicalByRace.Elf.length;
    const deCount = audit.historicalByRace.DarkElf.length;
    const orcCount = audit.historicalByRace.Orc.length;

    assert.equal(humanCount, 27, 'Human historical classes must equal 27');
    assert.equal(elfCount, 18, 'Elf historical classes must equal 18');
    assert.equal(deCount, 17, 'Dark Elf historical classes must equal 17');
    assert.equal(orcCount, 11, 'Orc historical classes with canonical orc_mage must equal 11');
    assert.equal(humanCount + elfCount + deCount + orcCount, 73, 'Sum of classified historical entities is 73');
    
    assert.equal(audit.historicalClassesCount, 73, 'Historical classes array length is 73');
    assert.equal(new Set(audit.historicalClasses.map(c => c.id)).size, 73, 'All historical class IDs are unique');
  });

  await t.test('4. Architectural Invariant: 159 != 98 != 73 distinct concepts proven', () => {
    assert.equal(audit.rawClassNodesCount, 159, 'Raw echo nodes in codebase equals 159');
    assert.equal(audit.totalCanonicalEntitiesCount, 98, 'Total canonical entities (25 active + 73 historical) equals 98');
    assert.equal(audit.historicalClassesCount, 73, 'Historical canonical classes equals 73');
    assert.notEqual(audit.rawClassNodesCount, audit.totalCanonicalEntitiesCount, '159 raw nodes != 98 canonical entities');
    assert.notEqual(audit.totalCanonicalEntitiesCount, audit.historicalClassesCount, '98 canonical entities != 73 historical classes');
  });

  await t.test('5. orc_mage Canonical Promotion: Base Stage 0 entity with progression to orc_shaman', () => {
    assert.equal(audit.orcMageAnalysis.verdict, 'PROVEN_CANONICAL', 'orc_mage must be PROVEN_CANONICAL');
    assert.equal(audit.orcMageAnalysis.evidenceStatus, 'VERIFIED', 'orc_mage evidence must be VERIFIED');
    assert.equal(audit.orcMageAnalysis.isCanonicalHistoricalEntity, true, 'orc_mage is in HISTORICAL_CLASSES');

    // Progression: orc_mage -> orc_shaman -> orc_overlord -> orc_dominator
    assert.deepEqual(getSuccessors('orc_mage'), ['orc_shaman'], 'orc_mage succeeds directly to orc_shaman');
    assert.equal(getPredecessor('orc_shaman'), 'orc_mage', 'orc_shaman predecessor is orc_mage');
    
    const dominatorLineage = getLineage('orc_dominator');
    assert.deepEqual(dominatorLineage, ['orc_mage', 'orc_shaman', 'orc_overlord', 'orc_dominator'], 'Lineage correctly includes orc_mage at root');

    const shamanEntity = getClassEntity('orc_shaman');
    assert.equal(shamanEntity.requiredLevel, 20, 'orc_shaman requires level 20 in lineage');
    assert.equal(shamanEntity.lineageType, 'FIRST_CLASS_TRANSFER', 'orc_shaman is FIRST_CLASS_TRANSFER from orc_mage');
  });

  await t.test('6. Lineage Graph: Exactly 72 edges and strictly acyclic DAG', () => {
    assert.equal(audit.lineageEdgesCount, 72, 'Expected exactly 72 lineage edges in the progression DAG');
    assert.equal(audit.lineageRelationsCountFromDag, 72, 'ClassLineage.getLineageRelationsCount() must return 72');
    assert.equal(audit.danglingPredecessors.length, 0, 'No dangling predecessors in progression');
    assert.equal(audit.danglingSuccessors.length, 0, 'No dangling successors in progression');
    assert.equal(audit.isDAG, true, 'Lineage graph must be a strictly acyclic directed graph (DAG)');
  });

  await t.test('7. Derived Skill Metrics: 1315 instances and 942 derived unique definitions', () => {
    assert.equal(audit.rawSkillEntriesCount, 1315, 'Expected 1315 raw skills in CLASSES_ECHO');
    assert.equal(audit.activeSkillSlotsCount, 100, 'Expected 100 active skill slots');
    assert.equal(audit.uniqueHistoricalSkillNamesCount, 847, 'Expected 847 unique historical skill names');
    assert.equal(audit.sharedSkillIds.length, 5, 'Expected exactly 5 shared skills between active and historical');
    assert.equal(audit.uniqueSkillDefinitionsCount, 942, 'Derived unique definitions (100 + 847 - 5) must equal 942');
  });

  await t.test('8. VFX Catalog: 100 unique identities, STRUCTURAL_ONLY, and 4-layer abstraction', () => {
    assert.equal(audit.vfxCount, 100, 'Expected 100 unique VFX IDs');
    assert.equal(audit.missingVfx.length, 0, 'No missing VFX bindings');
    assert.equal(audit.vfxVisualStatus, 'STRUCTURAL_ONLY');

    const vfxStats = getVfxStats();
    assert.equal(vfxStats.totalIdentities, 100);
    assert.equal(vfxStats.distinctVfxIds, 100);
    assert.equal(vfxStats.implementationStatus, VFX_VISUAL_IMPLEMENTATION);

    const fireballArch = getVfxArchitecture('fireball');
    assert.ok(fireballArch.identity, 'VFX identity must exist');
    assert.ok(fireballArch.profile, 'VFX profile must exist');
    assert.equal(fireballArch.renderFamily, 'projectile', 'VFX renderFamily must be classified');
    assert.equal(fireballArch.renderImplementation, 'STRUCTURAL_ONLY');
  });

  await t.test('9. Aliases: 274 aliases and verified normalizations', () => {
    assert.equal(audit.aliasesCount, 274, 'Expected 274 class aliases');
    const added = audit.contractAddedAliases.find(a => a.alias === 'ertheia_vanguard_rider');
    assert.ok(added, 'ertheia_vanguard_rider must be mapped in aliases');
    assert.equal(added.target, 'orc_vanguard_rider');
  });

  await t.test('10. Final Gate Verdict: READY_FOR_AUDITOR_FIXER', () => {
    assert.equal(audit.finalVerdict, 'READY_FOR_AUDITOR_FIXER', 'Audit verdict must be READY_FOR_AUDITOR_FIXER');
  });
});
