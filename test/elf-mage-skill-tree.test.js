/**
 * test/elf-mage-skill-tree.test.js — Formal Test Suite for Elf Mage Skill Tree Recovery & Elven Class Aliases
 * 
 * Verifies:
 * 1. Canonical source synchronization: skill-registry.json and elf_mage.json have exact 6 canonical skills.
 * 2. Canonical class alias resolution for elf_mage, elfMage, elven_mage, elvenMage, elven_wizard, elvenWizard.
 * 3. Exact 6-slot mapping in CLASS_SKILLS_ECHO with tiers 0 through 5 and corresponding spellbooks.
 * 4. 2x3 grid coordinates in SKILL_TREE_LAYOUT_ECHO for all 6 slots.
 * 5. Non-regression for elf_fighter and elf_death_knight.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure mock EchoData environment for node test runner
if (typeof window === 'undefined') {
  global.window = {};
}

// Dynamically import echo-adapter
await import('../lineage-idle/data/echo-adapter.js');

test('1. Canonical Source Registry: elf_mage has exact 6 skills', () => {
  const registryPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  const elfMageReg = registry.classes.find(c => c.classId === 'elf_mage');
  assert.ok(elfMageReg, 'elf_mage must exist in skill-registry.json classes');
  assert.equal(elfMageReg.skillsCount, 6, 'elf_mage skillsCount must equal 6');
  assert.deepEqual(
    elfMageReg.skills,
    ['hydro_blast', 'blizzard', 'healing_wave', 'tidal_surge', 'glacial_cataclysm', 'master_glacial_cataclysm'],
    'elf_mage must contain exact canonical skills in order'
  );

  const elfMageJsonPath = path.join(rootDir, 'lineage-idle', 'src', 'data', 'skills', 'elf', 'elf_mage.json');
  const elfMageClass = JSON.parse(fs.readFileSync(elfMageJsonPath, 'utf8'));
  assert.equal(elfMageClass.skills.length, 6, 'elf_mage.json must contain 6 skills');
  assert.deepEqual(
    elfMageClass.skills.map(s => s.identity.id),
    ['hydro_blast', 'blizzard', 'healing_wave', 'tidal_surge', 'glacial_cataclysm', 'master_glacial_cataclysm'],
    'skills in elf_mage.json must match canonical order'
  );
});

test('2. Canonical Alias Resolution: Elven Mage aliases resolve accurately', () => {
  const aliases = ['elf_mage', 'elfmage', 'elfMage', 'elven_mage', 'elvenmage', 'elvenMage', 'elven_wizard', 'elvenwizard', 'elvenWizard'];
  for (const alias of aliases) {
    const resolved = resolveCanonicalClassId(alias);
    assert.equal(resolved, 'elfMage', `Alias "${alias}" must resolve to "elfMage"`);
  }
});

test('3. CLASS_SKILLS_ECHO: elf_mage and elfMage contain exactly the 6 canonical skills', () => {
  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  assert.ok(classSkills, 'CLASS_SKILLS_ECHO must exist');

  const elfSkills = classSkills['elf_mage'] || classSkills['elfMage'];
  assert.ok(elfSkills, 'elf_mage skills must exist in CLASS_SKILLS_ECHO');
  assert.equal(elfSkills.length, 6, 'elf_mage must have exactly 6 skills in CLASS_SKILLS_ECHO');

  const expectedSkills = ['hydro_blast', 'blizzard', 'healing_wave', 'tidal_surge', 'glacial_cataclysm', 'master_glacial_cataclysm'];
  assert.deepEqual(elfSkills, expectedSkills, 'CLASS_SKILLS_ECHO[elf_mage] must match canonical list');

  const defs = window.EchoData.SKILL_DEFS_ECHO;
  assert.ok(defs, 'SKILL_DEFS_ECHO must exist');

  // Slot 1: hydro_blast (Core 1, no book)
  assert.ok(defs['hydro_blast'].tier <= 1);
  assert.equal(defs['hydro_blast'].requiredItemToUnlock, null);

  // Slot 2: blizzard (Core 2, book_1star)
  assert.equal(defs['blizzard'].requiredItemToUnlock, 'book_1star');

  // Slot 3: healing_wave (Spec 1, book_2star)
  assert.equal(defs['healing_wave'].requiredItemToUnlock, 'book_2star');

  // Slot 4: tidal_surge (Spec 2, book_3star)
  assert.equal(defs['tidal_surge'].requiredItemToUnlock, 'book_3star');

  // Slot 5: glacial_cataclysm (Ultimate, Tier 4, book_4star)
  assert.equal(defs['glacial_cataclysm'].tier, 4);
  assert.equal(defs['glacial_cataclysm'].starRank, 4);
  assert.equal(defs['glacial_cataclysm'].requiredItemToUnlock, 'book_4star');

  // Slot 6: master_glacial_cataclysm (Master Ultimate, Tier 5, book_5star)
  assert.equal(defs['master_glacial_cataclysm'].tier, 5);
  assert.equal(defs['master_glacial_cataclysm'].starRank, 5);
  assert.equal(defs['master_glacial_cataclysm'].requiredItemToUnlock, 'book_5star');
});

test('4. SKILL_TREE_LAYOUT_ECHO: exact 2x3 layout positions for elf_mage skills', () => {
  const layout = window.EchoData.SKILL_TREE_LAYOUT_ECHO;
  assert.ok(layout, 'SKILL_TREE_LAYOUT_ECHO must exist');

  assert.deepEqual(layout['hydro_blast'], { col: 0, row: 0 });
  assert.deepEqual(layout['blizzard'], { col: 1, row: 0 });
  assert.deepEqual(layout['healing_wave'], { col: 0, row: 1 });
  assert.deepEqual(layout['tidal_surge'], { col: 1, row: 1 });
  assert.deepEqual(layout['glacial_cataclysm'], { col: 0, row: 2 });
  assert.deepEqual(layout['master_glacial_cataclysm'], { col: 1, row: 2 });
});

test('5. Non-regression: elf_fighter and elf_death_knight preserve their canonical identities', () => {
  assert.equal(resolveCanonicalClassId('elf_fighter'), 'elfFighter');
  assert.equal(resolveCanonicalClassId('elven_fighter'), 'elfFighter');
  assert.equal(resolveCanonicalClassId('elvenfighter'), 'elfFighter');

  assert.equal(resolveCanonicalClassId('elf_death_knight'), 'deathPilgrim');
  assert.equal(resolveCanonicalClassId('elvendeathknight'), 'deathPilgrim');

  const classSkills = window.EchoData.CLASS_SKILLS_ECHO;
  const fighterSkills = classSkills['elf_fighter'] || classSkills['elfFighter'];
  assert.ok(fighterSkills, 'elf_fighter must exist');
  assert.equal(fighterSkills.length, 6, 'elf_fighter must have exactly 6 skills');
});
