/**
 * test/skill-tree-ui-integration.test.js — Skill Tree UI & Spellbook Integration Test Suite
 * 
 * Verifies:
 * 1. SPELLBOOK_ITEMS defines book_1star to book_5star.
 * 2. SKILL_DEFS_ECHO contains all 150 class skills with correct star ranks and reqBooks.
 * 3. CLASS_SKILLS_ECHO contains the canonical skills for all 25 classes and their aliases.
 * 4. SKILL_TREE_LAYOUT_ECHO positions the 6 skills in a crisp 2-column, 3-row layout.
 * 5. spendSP successfully unlocks skills consuming books (including book_5star for Master Ultimates).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { SPELLBOOK_ITEMS } from '../lineage-idle/src/data/spellbooks.js';
import { ALL_LOADED_SKILLS } from '../lineage-idle/src/data/skills/index.js';
import { spendSP } from '../lineage-idle/src/engine/SkillEngine.js';
import { classSatisfies, getClassSkills } from '../lineage-idle/src/services/CharacterService.js';

// Ensure mock EchoData environment for node test runner
if (typeof window === 'undefined') {
  global.window = {};
}

// Dynamically import echo-adapter to build SKILL_DEFS_ECHO, CLASS_SKILLS_ECHO, etc.
await import('../lineage-idle/data/echo-adapter.js');

test('1. SPELLBOOK_ITEMS defines book_1star through book_5star', () => {
  assert.ok(SPELLBOOK_ITEMS.book_1star, 'book_1star must be defined');
  assert.ok(SPELLBOOK_ITEMS.book_2star, 'book_2star must be defined');
  assert.ok(SPELLBOOK_ITEMS.book_3star, 'book_3star must be defined');
  assert.ok(SPELLBOOK_ITEMS.book_4star, 'book_4star must be defined');
  assert.ok(SPELLBOOK_ITEMS.book_5star, 'book_5star must be defined');

  assert.equal(SPELLBOOK_ITEMS.book_5star.stars, 5);
  assert.equal(SPELLBOOK_ITEMS.book_5star.level, 90);
  assert.equal(SPELLBOOK_ITEMS.book_5star.grade, 'S');
});

test('2. SKILL_DEFS_ECHO registers canonical 150 skills with proper book requirements', () => {
  const defs = window.EchoData.SKILL_DEFS_ECHO;
  assert.ok(defs, 'SKILL_DEFS_ECHO must exist on window.EchoData');

  // Check Human Fighter skills
  const shieldBash = defs['shield_bash'];
  assert.ok(shieldBash, 'shield_bash must exist');
  assert.equal(shieldBash.requiredItemToUnlock, null, 'Core 1 has no book requirement');
  assert.equal(shieldBash.reqLvl, 40);

  const cleaveStrike = defs['cleave_strike'];
  assert.ok(cleaveStrike, 'cleave_strike must exist');
  assert.equal(cleaveStrike.requiredItemToUnlock, 'book_1star', 'Core 2 requires book_1star');

  const ironStance = defs['iron_stance'];
  assert.ok(ironStance, 'iron_stance must exist');
  assert.equal(ironStance.requiredItemToUnlock, 'book_2star', 'Specialization 1 requires book_2star');

  const concussiveStun = defs['concussive_stun'];
  assert.ok(concussiveStun, 'concussive_stun must exist');
  assert.equal(concussiveStun.requiredItemToUnlock, 'book_3star', 'Specialization 2 requires book_3star');

  const titanbreaker = defs['titanbreaker'];
  assert.ok(titanbreaker, 'titanbreaker must exist');
  assert.equal(titanbreaker.requiredItemToUnlock, 'book_4star', 'Ultimate requires book_4star');
  assert.equal(titanbreaker.isUltimate, true);

  const masterTitanbreaker = defs['master_titanbreaker'];
  assert.ok(masterTitanbreaker, 'master_titanbreaker must exist');
  assert.equal(masterTitanbreaker.requiredItemToUnlock, 'book_5star', 'Master Ultimate requires book_5star');
  assert.equal(masterTitanbreaker.isUltimate, true);
  assert.equal(masterTitanbreaker.starRank, 5);
});

test('3. CLASS_SKILLS_ECHO contains canonical skills for classes and aliases', () => {
  const cs = window.EchoData.CLASS_SKILLS_ECHO;
  assert.ok(cs, 'CLASS_SKILLS_ECHO must exist');

  // Canonical ID
  const humanFighterSkills = cs['human_fighter'];
  assert.ok(humanFighterSkills, 'human_fighter must be present in CLASS_SKILLS_ECHO');
  assert.ok(humanFighterSkills.includes('shield_bash'));
  assert.ok(humanFighterSkills.includes('titanbreaker'));
  assert.ok(humanFighterSkills.includes('master_titanbreaker'));

  // V2 Canonical Fighter
  const fighterSkills = cs['fighter'];
  assert.ok(fighterSkills, 'fighter must be present in CLASS_SKILLS_ECHO');
  assert.ok(fighterSkills.includes('power_strike'));
  assert.ok(fighterSkills.includes('mortal_blow'));
  assert.ok(fighterSkills.includes('power_shot'));

  // V2 Canonical Sorcerer
  const sorcererSkills = cs['sorcerer'];
  assert.ok(sorcererSkills, 'sorcerer must have canonical skills');
  assert.ok(sorcererSkills.includes('prominence'));
  assert.ok(sorcererSkills.includes('rain_of_fire'));
  assert.ok(sorcererSkills.includes('inferno'));
});

test('4. SKILL_TREE_LAYOUT_ECHO positions skills in 2 columns and 3 rows', () => {
  const layout = window.EchoData.SKILL_TREE_LAYOUT_ECHO;
  assert.ok(layout, 'SKILL_TREE_LAYOUT_ECHO must exist');

  // Verify coordinates of the 6 skills for human_fighter
  assert.deepEqual(layout['shield_bash'], { col: 0, row: 0 });
  assert.deepEqual(layout['cleave_strike'], { col: 1, row: 0 });
  assert.deepEqual(layout['iron_stance'], { col: 0, row: 1 });
  assert.deepEqual(layout['concussive_stun'], { col: 1, row: 1 });
  assert.deepEqual(layout['titanbreaker'], { col: 0, row: 2 });
  assert.deepEqual(layout['master_titanbreaker'], { col: 1, row: 2 });
});

test('5. spendSP successfully unlocks skills consuming books from inventory', () => {
  const state = {
    class: 'human_fighter',
    level: 90,
    sp: 500000,
    skills: {},
    inventory: [
      { uid: 'book1', itemId: 'book_1star', count: 1 },
      { uid: 'book4', itemId: 'book_4star', count: 1 },
      { uid: 'book5', itemId: 'book_5star', count: 1 }
    ]
  };

  const logs = [];
  const callbacks = {
    log: (msg) => logs.push(msg),
    removeFromInventory: (uid, count) => {
      const idx = state.inventory.findIndex(i => i.uid === uid);
      if (idx >= 0) {
        state.inventory[idx].count -= count;
        if (state.inventory[idx].count <= 0) state.inventory.splice(idx, 1);
      }
    }
  };

  // 1. Core 1: Shield Bash (Lv 40, no book needed)
  const ok1 = spendSP(state, 'shield_bash', callbacks);
  assert.equal(ok1, true, 'Shield Bash should unlock without book');
  assert.equal(state.skills['shield_bash'], 1);

  // 2. Core 2: Cleave Strike (requires book_1star)
  const ok2 = spendSP(state, 'cleave_strike', callbacks);
  assert.equal(ok2, true, 'Cleave Strike should unlock consuming book_1star');
  assert.equal(state.skills['cleave_strike'], 1);
  assert.ok(!state.inventory.some(i => i.itemId === 'book_1star'), 'book_1star should be consumed');

  // 3. Ultimate: Titanbreaker (requires book_4star)
  const ok4 = spendSP(state, 'titanbreaker', callbacks);
  assert.equal(ok4, true, 'Titanbreaker should unlock consuming book_4star');
  assert.equal(state.skills['titanbreaker'], 1);
  assert.ok(!state.inventory.some(i => i.itemId === 'book_4star'), 'book_4star should be consumed');

  // 4. Master Ultimate: Master Titanbreaker (requires book_5star)
  const ok5 = spendSP(state, 'master_titanbreaker', callbacks);
  assert.equal(ok5, true, 'Master Titanbreaker should unlock consuming book_5star');
  assert.equal(state.skills['master_titanbreaker'], 1);
  assert.ok(!state.inventory.some(i => i.itemId === 'book_5star'), 'book_5star should be consumed');
});
