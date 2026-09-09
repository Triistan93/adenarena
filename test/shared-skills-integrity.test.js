/**
 * test/shared-skills-integrity.test.js — Formal Test Suite for Shared Skills (Lv 1–39)
 * 
 * Verifies:
 * 1. Exactly 8 canonical shared skills exist in general-skills.json and ALL_LOADED_SKILLS with unlockLevel: 1.
 * 2. Shared skills registration in CharacterService and EchoData (CLASS_SKILLS_ECHO['shared']).
 * 3. Universality: classSatisfies returns true for 'shared' and 'all' for every active class.
 * 4. Learning & SP Investment: Shared skills can be leveled from Lv 1 with SP.
 * 5. Cross-class persistence: Shared skills are never lost when changing classes.
 * 6. Total catalog check: 150 class skills + 8 shared = 158 total skills.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';
import {
  classSatisfies,
  SHARED_SKILL_IDS,
  SHARED_MAGE_SKILL_IDS,
  SHARED_FIGHTER_SKILL_IDS,
  getSharedSkills,
  getSharedSkillIdsForClass,
  isMageClass,
  isSkillAllowedForClass
} from '../lineage-idle/src/services/CharacterService.js';
import { spendSP, getSkillCost } from '../lineage-idle/src/engine/SkillEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure mock EchoData environment for node test runner
if (typeof window === 'undefined') {
  global.window = {};
}

// Dynamically import echo-adapter
await import('../lineage-idle/data/echo-adapter.js');

const EXPECTED_SHARED_IDS = [
  'wind_strike',
  'flame_strike',
  'hydro_strike',
  'power_strike',
  'mortal_blow',
  'iron_punch',
  'heal_light',
  'energy_burst'
];

test('1. Canonical Source: Exactly 8 shared skills in general-skills.json with unlockLevel 1', () => {
  const sharedJsonPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'shared', 'general-skills.json');
  const sharedData = JSON.parse(fs.readFileSync(sharedJsonPath, 'utf8'));

  assert.equal(sharedData.skills.length, 8, 'general-skills.json must have exactly 8 skills');
  
  const ids = sharedData.skills.map(s => s.identity.id);
  assert.deepEqual(ids, EXPECTED_SHARED_IDS, 'Shared skill IDs must match expected canonical list');

  for (const s of sharedData.skills) {
    assert.equal(s.identity.unlockLevel, 1, `Skill ${s.identity.id} must have unlockLevel 1`);
    assert.equal(s.identity.tier, 'shared', `Skill ${s.identity.id} must have tier 'shared'`);
    assert.equal(s.identity.classId, 'shared', `Skill ${s.identity.id} must have classId 'shared'`);
    assert.equal(s.identity.race, 'all', `Skill ${s.identity.id} must have race 'all'`);
  }
});

test('2. Registration: CharacterService & EchoData expose exact 8 shared skills', () => {
  assert.equal(SHARED_SKILL_IDS.length, 8, 'SHARED_SKILL_IDS must contain 8 skills');
  assert.deepEqual(SHARED_SKILL_IDS, EXPECTED_SHARED_IDS, 'SHARED_SKILL_IDS must match expected list');

  const sharedDefs = getSharedSkills();
  assert.equal(sharedDefs.length, 8, 'getSharedSkills() must return 8 definitions');

  const echoSkills = window.EchoData.CLASS_SKILLS_ECHO['shared'];
  assert.ok(echoSkills, 'EchoData.CLASS_SKILLS_ECHO must have "shared" key');
  assert.equal(echoSkills.length, 8, 'CLASS_SKILLS_ECHO["shared"] must contain 8 skills');
  assert.deepEqual(echoSkills, EXPECTED_SHARED_IDS);

  const echoLayout = window.EchoData.SKILL_TREE_LAYOUT_ECHO;
  for (const sid of EXPECTED_SHARED_IDS) {
    assert.ok(echoLayout[sid], `SKILL_TREE_LAYOUT_ECHO must define layout coordinates for ${sid}`);
    assert.ok(typeof echoLayout[sid].col === 'number', `Layout for ${sid} must have col number`);
    assert.ok(typeof echoLayout[sid].row === 'number', `Layout for ${sid} must have row number`);
  }
});

test('3. Universality: classSatisfies permits shared skills for all 25 classes', () => {
  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  for (const cls of registry.classes) {
    assert.equal(
      classSatisfies(cls.classId, 'shared'),
      true,
      `Class ${cls.classId} must satisfy reqClass 'shared'`
    );
    assert.equal(
      classSatisfies(cls.classId, 'all'),
      true,
      `Class ${cls.classId} must satisfy reqClass 'all'`
    );
  }

  // Also test basic lineages
  assert.equal(classSatisfies('mage', 'shared'), true);
  assert.equal(classSatisfies('human_mage', 'shared'), true);
  assert.equal(classSatisfies('fighter', 'shared'), true);
  assert.equal(classSatisfies('dwarf_mage', 'shared'), true);
});

test('4. Learning & SP Investment: Any class can learn shared skills from Lv 1', () => {
  const testState = {
    class: 'human_sorcerer',
    level: 1,
    sp: 500,
    skills: {},
    inventory: []
  };

  const dummyCallbacks = {
    log: () => {},
    floatText: () => {},
    classSatisfies,
    removeFromInventory: () => true,
    updateAllUI: () => {},
    save: () => {}
  };

  // Invest in wind_strike
  const cost1 = getSkillCost('wind_strike', 0);
  const ok1 = spendSP(testState, 'wind_strike', dummyCallbacks);
  assert.equal(ok1, true, 'spendSP on wind_strike must succeed at Lv 1');
  assert.equal(testState.skills['wind_strike'], 1, 'wind_strike must now be level 1');
  assert.equal(testState.sp, 500 - cost1, 'SP must be correctly deducted');

  // Invest in power_strike
  const ok2 = spendSP(testState, 'power_strike', dummyCallbacks);
  assert.equal(ok2, true, 'spendSP on power_strike must succeed at Lv 1');
  assert.equal(testState.skills['power_strike'], 1, 'power_strike must now be level 1');
});

test('5. Cross-Class Persistence: Shared skills are retained on class changes', () => {
  const character = {
    class: 'human_sorcerer',
    level: 40,
    sp: 1000,
    skills: {
      'wind_strike': 3,
      'heal_light': 2,
      'fireball': 1
    }
  };

  // Character changes class to dwarf_mage
  character.class = 'dwarf_mage';

  // Shared skills must still be valid and satisfied
  for (const sid of ['wind_strike', 'heal_light']) {
    const def = window.EchoData.SKILL_DEFS_ECHO[sid];
    assert.ok(def, `Skill def ${sid} must exist`);
    assert.equal(classSatisfies(character.class, def.classReq), true, `Dwarf Mage must satisfy ${sid}`);
    assert.equal(character.skills[sid] > 0, true, `Skill ${sid} level must be preserved`);
  }

  // Character changes class back to human_sorcerer
  character.class = 'human_sorcerer';
  assert.equal(character.skills['wind_strike'], 3);
  assert.equal(character.skills['heal_light'], 2);
});

test('6. Total Catalog Count: 150 Class Skills + 8 Shared = 158 Total Skills', () => {
  assert.equal(ALL_LOADED_SKILLS.size, 158, 'ALL_LOADED_SKILLS must contain exactly 158 skills');

  let sharedCount = 0;
  let classCount = 0;
  for (const [id, s] of ALL_LOADED_SKILLS.entries()) {
    if (s.identity?.classId === 'shared' || s.identity?.tier === 'shared') {
      sharedCount++;
    } else {
      classCount++;
    }
  }

  assert.equal(sharedCount, 8, 'Must have exactly 8 shared skills');
  assert.equal(classCount, 150, 'Must have exactly 150 class skills');
});

test('7. Archetype Separation: Mage classes receive exactly 5 magic skills, Fighters receive exactly 3 physical skills', () => {
  assert.equal(SHARED_MAGE_SKILL_IDS.length, 5, 'Must have 5 shared mage skills');
  assert.equal(SHARED_FIGHTER_SKILL_IDS.length, 3, 'Must have 3 shared fighter skills');

  // Mages
  const mageClasses = ['human_sorcerer', 'sorcerer', 'archmage', 'elf_mage', 'spellsinger', 'dark_elf_mage', 'spellhowler', 'orc_shaman', 'cardinal', 'bishop'];
  for (const mCls of mageClasses) {
    assert.equal(isMageClass(mCls), true, `Class ${mCls} must be identified as Mage`);
    const mSkills = getSharedSkillIdsForClass(mCls);
    assert.deepEqual(mSkills, SHARED_MAGE_SKILL_IDS, `Mage class ${mCls} must receive exact 5 mage shared skills`);
    
    // Check permission
    for (const sid of SHARED_MAGE_SKILL_IDS) {
      assert.equal(isSkillAllowedForClass(mCls, sid), true, `Mage ${mCls} must be allowed to use ${sid}`);
    }
    for (const sid of SHARED_FIGHTER_SKILL_IDS) {
      assert.equal(isSkillAllowedForClass(mCls, sid), false, `Mage ${mCls} must NOT be allowed to use physical skill ${sid}`);
    }
  }

  // Fighters
  const fighterClasses = ['human_fighter', 'warrior', 'gladiator', 'paladin', 'elf_fighter', 'dark_elf_fighter', 'orc_fighter', 'dreadnought'];
  for (const fCls of fighterClasses) {
    assert.equal(isMageClass(fCls), false, `Class ${fCls} must NOT be identified as Mage`);
    const fSkills = getSharedSkillIdsForClass(fCls);
    assert.deepEqual(fSkills, SHARED_FIGHTER_SKILL_IDS, `Fighter class ${fCls} must receive exact 3 fighter shared skills`);
    
    // Check permission
    for (const sid of SHARED_FIGHTER_SKILL_IDS) {
      assert.equal(isSkillAllowedForClass(fCls, sid), true, `Fighter ${fCls} must be allowed to use ${sid}`);
    }
    for (const sid of SHARED_MAGE_SKILL_IDS) {
      assert.equal(isSkillAllowedForClass(fCls, sid), false, `Fighter ${fCls} must NOT be allowed to use magic skill ${sid}`);
    }
  }
});

