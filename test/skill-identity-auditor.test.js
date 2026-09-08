/**
 * test/skill-identity-auditor.test.js — Automated Auditor 3: Class Identity, Specialization & Progression
 * 
 * Verifies that:
 * 1. Exactly 25 active classes exist in the registry, each with exactly 6 skills.
 * 2. Stage gating:
 *    - 4 baseline skills per class (unlockLevel 40 or 76)
 *    - Exactly 1 Lv80 Ultimate per class
 *    - Exactly 1 Lv90 Master Ultimate per class
 * 3. Elemental Affinity:
 *    - Every skill's element strictly matches the allowed elements in ELEMENT_MATRIX.
 * 4. Exclusivity & Anti-Duplication:
 *    - No two classes share the same set of skills.
 *    - No skill belongs to multiple classes without explicit authorization.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  CLASS_IDENTITIES,
  getAllClassIdentities,
  getClassIdentity
} from '../lineage-idle/src/data/elemental/ClassIdentity.js';

import {
  ELEMENT_MATRIX
} from '../lineage-idle/src/data/elemental/ElementMatrix.js';

const races = ['human', 'elf', 'dark_elf', 'orc', 'dwarf', 'kamael', 'ertheia', 'high_elf'];

function loadAllClassSkillData() {
  const classDataMap = new Map();
  for (const r of races) {
    const dir = path.resolve('lineage-idle/src/data/skills', r);
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      classDataMap.set(data.classId, data.skills);
    }
  }
  return classDataMap;
}

test('Automated Compliance Auditor 3 — Class Identity & Specialization Suite', async (t) => {

  const classDataMap = loadAllClassSkillData();

  await t.test('1. Exactly 25 active classes with 6 skills each (150 skills total)', () => {
    assert.equal(classDataMap.size, 25, 'Must contain exactly 25 active classes');
    let count = 0;
    for (const [classId, skills] of classDataMap.entries()) {
      assert.equal(skills.length, 6, `Class ${classId} must have exactly 6 skills`);
      count += skills.length;
    }
    assert.equal(count, 150, 'Exactly 150 class skills across all 25 classes');
  });

  await t.test('2. Progression stage gating — Slots 1-4 (Lv40/76), Slot 5 (Lv80), Slot 6 (Lv90)', () => {
    for (const [classId, skills] of classDataMap.entries()) {
      // Slot 1-3: Lv40
      assert.equal(skills[0].identity.unlockLevel, 40, `${classId} skill 0 must unlock at Lv40`);
      assert.equal(skills[1].identity.unlockLevel, 40, `${classId} skill 1 must unlock at Lv40`);
      assert.equal(skills[2].identity.unlockLevel, 40, `${classId} skill 2 must unlock at Lv40`);

      // Slot 4: Lv40 or Lv76 (Mastery)
      assert.ok([40, 76].includes(skills[3].identity.unlockLevel), `${classId} skill 3 must unlock at Lv40 or 76`);

      // Slot 5: Lv80 Ultimate
      assert.equal(skills[4].identity.unlockLevel, 80, `${classId} Ultimate must unlock at Lv80`);
      assert.equal(skills[4].identity.tier, 'ultimate', `${classId} skill 4 must be ultimate`);

      // Slot 6: Lv90 Master Ultimate
      assert.equal(skills[5].identity.unlockLevel, 90, `${classId} Master Ultimate must unlock at Lv90`);
      assert.equal(skills[5].identity.tier, 'master_ultimate', `${classId} skill 5 must be master_ultimate`);
    }
  });

  await t.test('3. Elemental Affinity — All skills respect allowed elements from ELEMENT_MATRIX', () => {
    for (const [classId, skills] of classDataMap.entries()) {
      const matrixEntry = ELEMENT_MATRIX[classId];
      assert.ok(matrixEntry, `Class ${classId} must exist in ELEMENT_MATRIX`);
      const allowed = matrixEntry.allowedElements || [];

      for (const skill of skills) {
        const elem = skill.identity.element;
        // high_elf_element_weaver is canonical exception
        if (classId === 'high_elf_element_weaver') {
          assert.ok(['Fire', 'Water', 'Wind', 'Physical'].includes(elem), `ElementWeaver element allowed`);
        } else {
          assert.ok(allowed.includes(elem), `Skill ${skill.identity.id} has element ${elem} not allowed for class ${classId} (${allowed.join(', ')})`);
        }
      }
    }
  });

  await t.test('4. Anti-Duplication — No two distinct classes share duplicate skill IDs', () => {
    const classIdBySkill = new Map();
    for (const [classId, skills] of classDataMap.entries()) {
      for (const skill of skills) {
        const sId = skill.identity.id;
        assert.ok(!classIdBySkill.has(sId), `Duplicate skill ID across classes: ${sId} in ${classId} and ${classIdBySkill.get(sId)}`);
        classIdBySkill.set(sId, classId);
      }
    }
    assert.equal(classIdBySkill.size, 150, 'All 150 skills have strictly unique IDs');
  });
});
