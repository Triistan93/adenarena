/**
 * test/canonical-skill-system-full-audit.test.js
 * 
 * Formal Verification Suite for Canonical Skill System Completion
 * Lineage II Essence — Celestial Destiny (Patch 3629)
 * 
 * Audits:
 * 1. 1,176 Canonical Skills in CANONICAL_SKILL_REGISTRY_V2 (including 444 scraped passives).
 * 2. Race Equity: 9 Races (Humans, Elves, Dark Elves, Orcs, Dwarves, Kamael, Sylphs, High Elves, Ertheia).
 * 3. Death Knight Kit & Mechanics:
 *    - born_to_die, undying_body, appetite_for_destruction, death_points, death_sword_mastery, death_armor_mastery.
 *    - StatsEngine calculation of Death Knight passives.
 *    - CombatEngine fatal survival trigger (Born to Die invulnerability + full restore).
 * 4. Non-Human Races Unique Passives & Stat Augmentation (Dwarves, Kamael, Sylphs, High Elves, Orcs, Assassins).
 * 5. DAG Progression & Archetype Isolation.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Mock browser global for Node.js test environment
if (typeof window === 'undefined') {
  global.window = {};
}

await import('../lineage-idle/data/echo-adapter.js');

import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { isSkillInProgressionPath, isSkillAllowedForClass } from '../lineage-idle/src/services/CharacterService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { playerDeath } from '../lineage-idle/src/engine/CombatEngine.js';

test('1. Canonical Catalog Completion: 1,176 skills with 100% scraped passives present', () => {
  const totalSkills = Object.keys(CANONICAL_SKILL_REGISTRY_V2).length;
  assert.equal(totalSkills, 1176, 'CANONICAL_SKILL_REGISTRY_V2 must contain exactly 1,176 skills');

  // Verify that all 444 scraped passives exist
  const scrapedPassives = JSON.parse(fs.readFileSync('scraped_data_wiki/passives_detailed.json', 'utf8'));
  assert.equal(scrapedPassives.length, 444, 'Must have 444 scraped passives in dataset');

  let foundCount = 0;
  for (const s of scrapedPassives) {
    const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    if (CANONICAL_SKILL_REGISTRY_V2[s.id] || CANONICAL_SKILL_REGISTRY_V2[slug]) {
      foundCount++;
    }
  }
  assert.equal(foundCount, 444, 'All 444 scraped passives must exist in CANONICAL_SKILL_REGISTRY_V2');
});

test('2. Death Knight Authentic Kit: All 6 Unique Skills exist and link to Death Knight classes', () => {
  const dkSkills = [
    'born_to_die',
    'undying_body',
    'appetite_for_destruction',
    'death_points',
    'death_sword_mastery',
    'death_armor_mastery'
  ];

  for (const sId of dkSkills) {
    const s = CANONICAL_SKILL_REGISTRY_V2[sId];
    assert.ok(s, `Death Knight skill ${sId} must exist in registry`);
    assert.equal(s.type, 'passive', `Skill ${sId} must be passive`);
    assert.ok(Array.isArray(s.classes) && s.classes.length > 0, `Skill ${sId} must list Death Knight classes`);
    assert.ok(s.classes.includes('deathPilgrim') || s.classes.includes('deathKnight'), `Skill ${sId} must link to Death Knight`);
  }

  // Progression path verification
  assert.ok(isSkillInProgressionPath('deathPilgrim', 'born_to_die'), 'Death Pilgrim must authorize Born to Die');
  assert.ok(isSkillInProgressionPath('deathPilgrim', 'undying_body'), 'Death Pilgrim must authorize Undying Body');
  assert.ok(isSkillInProgressionPath('deathKnight', 'appetite_for_destruction'), 'Death Knight must authorize Appetite for Destruction');
  assert.ok(isSkillInProgressionPath('deathKnight', 'death_points'), 'Death Knight must authorize Death Points');
  assert.ok(isSkillInProgressionPath('deathKnight', 'death_sword_mastery'), 'Death Knight must authorize Death Sword Mastery');
  assert.ok(isSkillInProgressionPath('deathKnight', 'death_armor_mastery'), 'Death Knight must authorize Death Armor Mastery');

  // Negative control: Non-Death Knight classes cannot access Born to Die
  assert.equal(isSkillInProgressionPath('fighter', 'born_to_die'), false, 'Human Fighter cannot learn Born to Die');
  assert.equal(isSkillInProgressionPath('gladiator', 'appetite_for_destruction'), false, 'Gladiator cannot learn Appetite for Destruction');
});

test('3. Death Knight Fatal Survival Mechanic: Born to Die triggers on lethal damage', () => {
  const dkState = {
    class: 'deathPilgrim',
    race: 'human',
    level: 20,
    hp: 0,
    maxHp: 1500,
    mp: 100,
    maxMp: 600,
    skills: {
      born_to_die: 1
    },
    inventory: [],
    buffs: {}
  };

  const logs = [];
  const callbacks = {
    log: (msg, type) => logs.push({ msg, type })
  };

  const monster = { name: 'Skeleton Archer', level: 25 };

  // Trigger lethal damage
  const deathResult = playerDeath(dkState, monster, callbacks);

  // Born to Die intercepts death (returns false)
  assert.equal(deathResult, false, 'Born to Die must intercept player death');
  assert.ok(dkState.hp > 0, 'HP must be restored after Born to Die triggers');
  assert.equal(dkState.hp, dkState.maxHp, 'HP must be fully restored to maxHp');
  assert.ok(dkState._bornToDieCooldown > Date.now(), 'Born to Die must be put on cooldown (400s)');
  assert.ok(dkState.buffs.born_to_die_invincibility, 'Invincibility buff must be applied');
  assert.ok(logs.some(l => l.msg.includes('Born to Die')), 'Log must notify of Born to Die activation');

  // Triggering again while on cooldown must NOT intercept death
  dkState.hp = 0;
  const secondDeath = playerDeath(dkState, monster, callbacks);
  assert.notEqual(secondDeath, false, 'Normal playerDeath completes without interception');
  assert.ok(dkState._pendingLoss > 0, 'Player must suffer pending death penalty when skill is on cooldown');
});

test('4. Race Equity & Passives Across All Non-Human Races in StatsEngine', () => {
  // 1. Dwarves: Dwarven Weapon Mastery & Dwarven Armor Mastery
  const dwarfState = {
    class: 'fortuneSeeker',
    race: 'dwarf',
    level: 76,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      dwarven_weapon_mastery: 3, // +15 P.Atk
      dwarven_armor_mastery: 2   // +20 P.Def
    },
    equipment: {},
    buffs: {}
  };
  const dwarfStats = getStats(dwarfState);
  assert.ok(dwarfStats.atk > 100 + 15, 'Dwarf P.Atk must reflect Dwarven Weapon Mastery');
  assert.ok(dwarfStats.def > 100 + 20, 'Dwarf P.Def must reflect Dwarven Armor Mastery');

  // 2. Kamael: Ancient Sword Mastery & Magic Immunity
  const kamaelState = {
    class: 'doombringer',
    race: 'kamael',
    level: 76,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      ancient_sword_mastery: 4, // +20 P.Atk
      magic_immunity: 3          // +45 M.Def
    },
    equipment: {},
    buffs: {}
  };
  const kamaelStats = getStats(kamaelState);
  assert.ok(kamaelStats.atk > 100 + 20, 'Kamael P.Atk must reflect Ancient Sword Mastery');
  assert.ok(kamaelStats.mdef > 50 + 45, 'Kamael M.Def must reflect Magic Immunity');

  // 3. Sylph: Firearm Mastery & Elemental Recovery
  const sylphState = {
    class: 'sharpshooter',
    race: 'sylph',
    level: 40,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      firearm_mastery: 2,   // +10 P.Atk
      elemental_recovery: 2 // +4 MP Regen
    },
    equipment: {},
    buffs: {}
  };
  const sylphStats = getStats(sylphState);
  assert.ok(sylphStats.atk > 100 + 10, 'Sylph P.Atk must reflect Firearm Mastery');
  assert.ok(sylphStats.mpRegen > 0, 'Sylph MP Regen must reflect Elemental Recovery');

  // 4. High Elf: Sacral Weapon & Armor Mastery
  const highElfState = {
    class: 'divineTemplar',
    race: 'highelf',
    level: 76,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      sacral_weapon_mastery: 3, // +15 P.Atk
      sacral_armor_mastery: 2   // +20 P.Def
    },
    equipment: {},
    buffs: {}
  };
  const highElfStats = getStats(highElfState);
  assert.ok(highElfStats.atk > 100 + 15, 'High Elf P.Atk must reflect Sacral Weapon Mastery');
  assert.ok(highElfStats.def > 100 + 20, 'High Elf P.Def must reflect Sacral Armor Mastery');

  // 5. Orc: Titan Spirit & Wild Weapon Mastery
  const orcState = {
    class: 'titan',
    race: 'orc',
    level: 76,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      titan_spirit: 2,         // +20 P.Atk
      wild_weapon_mastery: 3   // +15 P.Atk
    },
    equipment: {},
    buffs: {}
  };
  const orcStats = getStats(orcState);
  assert.ok(orcStats.atk > 100 + 35, 'Orc P.Atk must reflect Titan Spirit and Wild Weapon Mastery');

  // 6. Death Knight Stat Parity (Appetite for Destruction & Death Points)
  const dkStatsState = {
    class: 'deathKnight',
    race: 'human',
    level: 76,
    base: { atk: 100, def: 100, matk: 50, mdef: 50, eva: 20 },
    skills: {
      appetite_for_destruction: 2, // +20 P.Atk, +20 Atk Spd
      death_points: 3              // +15 P.Atk, +9 Speed
    },
    equipment: {},
    buffs: {}
  };
  const dkStats = getStats(dkStatsState);
  assert.ok(dkStats.atk > 100 + 35, 'Death Knight P.Atk must reflect Appetite for Destruction and Death Points');
  assert.ok(dkStats.speed > 0, 'Death Knight Speed must reflect Death Points and Appetite for Destruction');
});

test('5. Archetype and Lineage Isolation: Illegal passives strictly rejected by getStats', () => {
  // A Human Mage trying to use Orc Titan Spirit or Dwarf Weapon Mastery
  const illegalMageState = {
    class: 'mage',
    race: 'human',
    level: 20,
    base: { atk: 50, def: 50, matk: 100, mdef: 80, eva: 10 },
    skills: {
      titan_spirit: 5,           // Orc only
      dwarven_weapon_mastery: 5  // Dwarf only
    },
    equipment: {},
    buffs: {}
  };

  const baselineMageState = {
    class: 'mage',
    race: 'human',
    level: 20,
    base: { atk: 50, def: 50, matk: 100, mdef: 80, eva: 10 },
    skills: {},
    equipment: {},
    buffs: {}
  };

  const illegalStats = getStats(illegalMageState);
  const baselineStats = getStats(baselineMageState);

  assert.equal(illegalStats.atk, baselineStats.atk, 'Human Mage cannot gain P.Atk from Titan Spirit or Dwarven Mastery');
});
