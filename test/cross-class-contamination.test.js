/**
 * test/cross-class-contamination.test.js — Formal Test Suite for Cross-Class Isolation & Ownership
 * 
 * Verifies:
 * 1. human_sorcerer and its aliases (mage, human_mage, sorcerer, wizard, archmage) contain 0 dwarf_mage skills.
 * 2. dwarf_mage contains 0 human_sorcerer skills.
 * 3. Exact 25 Classes x 6 Skills Isolation: 0 cross-class contamination across all 150 class skills.
 * 4. Unique class ownership: Every class skill belongs exclusively to its own class.
 * 5. Class Switching Isolation: Switching classes never inherits the previous class's catalog.
 * 6. ElementalSkillAuditor checkSkillOwnership blocks cross-class skills.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';
import { getClassSkills } from '../lineage-idle/src/services/CharacterService.js';
import { checkSkillOwnership } from '../lineage-idle/src/services/ElementalSkillAuditor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure mock EchoData environment for node test runner
if (typeof window === 'undefined') {
  global.window = {};
}

// Dynamically import echo-adapter
await import('../lineage-idle/data/echo-adapter.js');

const DWARF_MAGE_SKILLS = [
  'terremoto',
  'rochedo',
  'golem_de_metal',
  'garra_metalica',
  'earthforge_cataclysm',
  'master_earthforge_cataclysm'
];

const HUMAN_SORCERER_SKILLS = [
  'fireball',
  'magma_spike',
  'holy_bolt',
  'flame_nova',
  'meteor',
  'master_meteor'
];

test('1. Human Sorcerer / Mage: ZERO Dwarf Mage skills present', () => {
  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  const sorcererAliases = ['human_sorcerer', 'sorcerer', 'archmage'];
  const baseMageAliases = ['mage', 'human_mage'];

  // Sorcerer specialization and awakening: must have the 6 canonical Sorcerer skills
  for (const alias of sorcererAliases) {
    const list = classSkills[alias] || getClassSkills(alias);
    assert.ok(list, `Skills for ${alias} must exist`);
    assert.equal(list.length, 6, `Class ${alias} must have exactly 6 skills`);
    assert.deepEqual(list, HUMAN_SORCERER_SKILLS, `${alias} must have the 6 canonical sorcerer skills`);

    // Verify 0 dwarf_mage skills
    for (const dwarfSkill of DWARF_MAGE_SKILLS) {
      assert.equal(
        list.includes(dwarfSkill),
        false,
        `Contamination detected: ${alias} must NOT contain dwarf skill "${dwarfSkill}"`
      );
    }
  }

  // Base mage classes: must have base mage skills and ZERO dwarf skills
  for (const alias of baseMageAliases) {
    const list = classSkills[alias] || getClassSkills(alias);
    assert.ok(list, `Skills for ${alias} must exist`);
    assert.equal(list.length, 5, `Base class ${alias} must have 5 shared mage skills`);

    for (const dwarfSkill of DWARF_MAGE_SKILLS) {
      assert.equal(
        list.includes(dwarfSkill),
        false,
        `Contamination detected: ${alias} must NOT contain dwarf skill "${dwarfSkill}"`
      );
    }
  }

  // Wizard (Lv20 1st Transfer): has dynamic class skill pool and ZERO dwarf skills
  const wizardList = classSkills['wizard'] || getClassSkills('wizard');
  assert.ok(wizardList && wizardList.length > 0, 'Wizard skills must exist');
  for (const dwarfSkill of DWARF_MAGE_SKILLS) {
    assert.equal(
      wizardList.includes(dwarfSkill),
      false,
      `Contamination detected: wizard must NOT contain dwarf skill "${dwarfSkill}"`
    );
  }
});

test('2. Dwarf Mage: ZERO Human Sorcerer skills present', () => {
  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  const dwarfSkills = classSkills['dwarf_mage'] || getClassSkills('dwarf_mage');

  assert.ok(dwarfSkills, 'dwarf_mage skills must exist');
  assert.equal(dwarfSkills.length, 6, 'dwarf_mage must have exactly 6 skills');
  assert.deepEqual(dwarfSkills, DWARF_MAGE_SKILLS, 'dwarf_mage must have the 6 canonical dwarf mage skills');

  // Verify 0 human_sorcerer skills
  for (const sorcererSkill of HUMAN_SORCERER_SKILLS) {
    assert.equal(
      dwarfSkills.includes(sorcererSkill),
      false,
      `Contamination detected: dwarf_mage must NOT contain sorcerer skill "${sorcererSkill}"`
    );
  }
});

test('3. Universal 25-Class Isolation: Zero cross-class overlap among all 150 class skills', () => {
  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  const seenSkillToClass = new Map();

  for (const cls of registry.classes) {
    const skills = classSkills[cls.classId];
    assert.ok(skills, `Class ${cls.classId} must be mapped in CLASS_SKILLS_ECHO`);
    assert.equal(skills.length, 6, `Class ${cls.classId} must have exactly 6 skills`);

    for (const sid of skills) {
      if (seenSkillToClass.has(sid)) {
        const otherClass = seenSkillToClass.get(sid);
        assert.fail(`Skill ${sid} is duplicated between ${otherClass} and ${cls.classId}!`);
      }
      seenSkillToClass.set(sid, cls.classId);
    }
  }

  assert.equal(seenSkillToClass.size, 150, 'Exactly 150 unique skills must be owned by the 25 classes');
});

test('4. Unique Class Ownership: Each class skill declares exact single class ownership in definition', () => {
  for (const [sid, s] of ALL_LOADED_SKILLS.entries()) {
    if (s.identity?.classId === 'shared' || s.identity?.tier === 'shared') {
      continue; // Shared skills are excluded from single ownership
    }

    assert.ok(s.identity?.classId, `Class skill ${sid} must declare identity.classId`);
    assert.notEqual(s.identity.classId, 'shared');
    assert.ok(s.identity?.race, `Class skill ${sid} must declare identity.race`);
  }
});

test('5. Class Switching Isolation: Switching between classes never retains foreign skills', () => {
  // Simulate character state changing from human_sorcerer to dwarf_mage and back
  let currentClass = 'human_sorcerer';
  let activeSkills = getClassSkills(currentClass);
  assert.deepEqual(activeSkills, HUMAN_SORCERER_SKILLS);

  currentClass = 'dwarf_mage';
  activeSkills = getClassSkills(currentClass);
  assert.deepEqual(activeSkills, DWARF_MAGE_SKILLS);

  currentClass = 'human_sorcerer';
  activeSkills = getClassSkills(currentClass);
  assert.deepEqual(activeSkills, HUMAN_SORCERER_SKILLS);
});

test('6. Auditor Verification: checkSkillOwnership blocks cross-class skill equipping', () => {
  // dwarf_mage skills on human_sorcerer must be rejected
  for (const sid of DWARF_MAGE_SKILLS) {
    const check = checkSkillOwnership(sid, 'human_sorcerer');
    assert.equal(
      check.isAllowed,
      false,
      `Auditor must block dwarf skill "${sid}" from human_sorcerer`
    );
  }

  // human_sorcerer skills on dwarf_mage must be rejected
  for (const sid of HUMAN_SORCERER_SKILLS) {
    const check = checkSkillOwnership(sid, 'dwarf_mage');
    assert.equal(
      check.isAllowed,
      false,
      `Auditor must block sorcerer skill "${sid}" from dwarf_mage`
    );
  }

  // Shared skills must respect archetype boundaries
  const checkMage = checkSkillOwnership('wind_strike', 'human_sorcerer');
  assert.equal(checkMage.isAllowed, true, 'Magic shared skill wind_strike must be allowed on human_sorcerer');
  assert.equal(checkMage.ownershipType, 'SHARED');

  const checkMageDwarf = checkSkillOwnership('wind_strike', 'dwarf_mage');
  assert.equal(checkMageDwarf.isAllowed, true, 'Magic shared skill wind_strike must be allowed on dwarf_mage');
  assert.equal(checkMageDwarf.ownershipType, 'SHARED');

  const checkFighterOnMage = checkSkillOwnership('power_strike', 'human_sorcerer');
  assert.equal(checkFighterOnMage.isAllowed, false, 'Physical shared skill power_strike must NOT be allowed on human_sorcerer');

  const checkFighterOnFighter = checkSkillOwnership('power_strike', 'human_fighter');
  assert.equal(checkFighterOnFighter.isAllowed, true, 'Physical shared skill power_strike must be allowed on human_fighter');
  assert.equal(checkFighterOnFighter.ownershipType, 'SHARED');
});
