import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import services and data
import { resolveCanonicalClassId, resolveCanonicalDagClassId } from '../lineage-idle/src/data/classes/class_aliases.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import {
  resolveV2ClassContext,
  getVisibleSkillsForCharacter,
  isSkillAvailableForCharacter,
  isSkillInProgressionPath
} from '../lineage-idle/src/services/SkillEligibility.js';
import { getSkillTreeViewModel } from '../lineage-idle/src/services/SkillTreeViewModel.js';
import { getSkillIcon } from '../lineage-idle/src/services/SkillIconRegistry.js';
import { getLoadout, autoEquipLoadout, equipSkill, getEquippedSkillIds } from '../lineage-idle/src/services/SkillLoadoutService.js';

test('1. Diagnostic 5 Classes — Exact 5 Skills and Correct Identity at Lv 1', (t) => {
  // 1.1 dark_fighter (Dark Elf Fighter) -> Expected exactly 5 skills
  const expectedDarkFighter = ['power_strike', 'mortal_blow', 'power_shot', 'weapon_mastery', 'armor_mastery'];
  const charDF = { class: 'dark_fighter', race: 'darkelf', level: 1, skills: {}, sp: 100 };
  const vmDF = getSkillTreeViewModel(charDF);
  const skillsDF = vmDF.allVisibleSkills.map(s => s.skillId).sort();
  assert.equal(skillsDF.length, 5, `dark_fighter expected 5 skills, got ${skillsDF.length}: ${JSON.stringify(skillsDF)}`);
  assert.deepEqual(skillsDF, [...expectedDarkFighter].sort(), 'dark_fighter must have exact canonical skills');

  // 1.2 dark_mage (Dark Elf Mystic) -> Expected exactly 5 skills
  const expectedDarkMage = ['twister', 'fireball', 'self_heal', 'magic_mastery', 'robe_mastery'];
  const charDM = { class: 'dark_mage', race: 'darkelf', level: 1, skills: {}, sp: 100 };
  const vmDM = getSkillTreeViewModel(charDM);
  const skillsDM = vmDM.allVisibleSkills.map(s => s.skillId).sort();
  assert.equal(skillsDM.length, 5, `dark_mage expected 5 skills, got ${skillsDM.length}: ${JSON.stringify(skillsDM)}`);
  assert.deepEqual(skillsDM, [...expectedDarkMage].sort(), 'dark_mage must have exact canonical skills');

  // 1.3 orc_mage (Orc Mystic) -> Expected exactly 5 skills
  const expectedOrcMage = ['inferno_strike', 'vortex_of_fire', 'dreaming_spirit', 'magic_mastery', 'robe_mastery'];
  const charOM = { class: 'orc_mage', race: 'orc', level: 1, skills: {}, sp: 100 };
  const vmOM = getSkillTreeViewModel(charOM);
  const skillsOM = vmOM.allVisibleSkills.map(s => s.skillId).sort();
  assert.equal(skillsOM.length, 5, `orc_mage expected 5 skills, got ${skillsOM.length}: ${JSON.stringify(skillsOM)}`);
  assert.deepEqual(skillsOM, [...expectedOrcMage].sort(), 'orc_mage must have exact canonical skills');

  // 1.4 elven_fighter (Elven Fighter) -> Expected exactly 5 skills
  const expectedElfFighter = ['power_strike', 'mortal_blow', 'bandage', 'weapon_mastery', 'armor_mastery'];
  const charEF = { class: 'elven_fighter', race: 'elf', level: 1, skills: {}, sp: 100 };
  const vmEF = getSkillTreeViewModel(charEF);
  const skillsEF = vmEF.allVisibleSkills.map(s => s.skillId).sort();
  assert.equal(skillsEF.length, 5, `elven_fighter expected 5 skills, got ${skillsEF.length}: ${JSON.stringify(skillsEF)}`);
  assert.deepEqual(skillsEF, [...expectedElfFighter].sort(), 'elven_fighter must have exact canonical skills');

  // 1.5 elven_mage (Elven Mystic) -> Expected exactly 5 skills (NOT shared generic skills)
  const expectedElfMage = ['ice_bolt', 'wind_strike', 'self_heal', 'magic_mastery', 'robe_mastery'];
  const charEM = { class: 'elven_mage', race: 'elf', level: 1, skills: {}, sp: 100 };
  const vmEM = getSkillTreeViewModel(charEM);
  const skillsEM = vmEM.allVisibleSkills.map(s => s.skillId).sort();
  assert.equal(skillsEM.length, 5, `elven_mage expected 5 skills, got ${skillsEM.length}: ${JSON.stringify(skillsEM)}`);
  assert.deepEqual(skillsEM, [...expectedElfMage].sort(), 'elven_mage must have exact canonical skills');
});

test('2. Sylph Identity Contract & Dedicated V2 Context Resolution', (t) => {
  // Contract: General canonical resolver must preserve Graph 159 identity 'sylphid'
  const resolvedGeneral = resolveCanonicalClassId('sylphid');
  assert.equal(resolvedGeneral, 'sylphid', `resolveCanonicalClassId('sylphid') must preserve 'sylphid', got: '${resolvedGeneral}'`);

  // Prefix stripping bug check: 'sylphid' should NEVER become 'id'
  assert.notEqual(resolvedGeneral, 'id', `'sylphid' must never be stripped to 'id'`);

  // Dedicated V2 context resolver resolves to 'sylphGunner' with 5 skills
  const v2Context = resolveV2ClassContext('sylphid', 'sylph');
  assert.equal(v2Context.status, 'RESOLVED');
  assert.equal(v2Context.originalClassId, 'sylphid');
  assert.equal(v2Context.race, 'sylph');
  assert.equal(v2Context.v2ClassId, 'sylphGunner');
  assert.ok(v2Context.v2ClassDef, 'v2ClassDef must exist for sylphGunner');
  
  const expectedSylphSkills = ['dual_blow', 'elemental_care', 'elemental_haste', 'bow_mastery', 'light_armor_mastery'];
  assert.deepEqual(v2Context.authorizedSkillIds.slice().sort(), expectedSylphSkills.slice().sort());

  // ViewModel at Lv 1 gives exactly these 5 skills
  const charSylph = { class: 'sylphid', race: 'sylph', level: 1, skills: {}, sp: 100 };
  const vmSylph = getSkillTreeViewModel(charSylph);
  const skillsSylph = vmSylph.allVisibleSkills.map(s => s.skillId).sort();
  assert.deepEqual(skillsSylph, expectedSylphSkills.slice().sort());
});

test('3. Spurious Parentage & Autonomous Lineages Isolation', (t) => {
  // 3.1 warg.parentClass must be strictly null
  assert.equal(CANONICAL_CLASS_REGISTRY_V2['warg'].parentClass, null, 'warg.parentClass must be null');

  // 3.2 shineMakerS1.parentClass must NOT be highElfBase
  assert.notEqual(CANONICAL_CLASS_REGISTRY_V2['shineMakerS1']?.parentClass, 'highElfBase', 'shineMakerS1 must not inherit highElfBase');

  // 3.3 Autonomous classes must NEVER have 'fighter' as ancestor
  const autonomousClasses = [
    'samuraiBase', 'sylphGunner', 'bloodRoseBase', 'rider', 'highElfBase', 'deathPilgrim', 'assassinS0'
  ];

  for (const cId of autonomousClasses) {
    let curr = CANONICAL_CLASS_REGISTRY_V2[cId];
    const visited = new Set();
    while (curr?.parentClass && CANONICAL_CLASS_REGISTRY_V2[curr.parentClass] && !visited.has(curr.parentClass)) {
      visited.add(curr.parentClass);
      assert.notEqual(curr.parentClass, 'fighter', `${cId} must never have fighter in its ancestor chain`);
      curr = CANONICAL_CLASS_REGISTRY_V2[curr.parentClass];
    }
  }
});

test('4. CONTENT_GAP Handling — No Fallbacks, v2ClassId null on Stage 0 Gaps, Playable & Equipable', (t) => {
  // 4.1 werewolf_0: Stage 0 CONTENT_GAP -> v2ClassId MUST BE NULL (warg is Stage 3 Lv 76+)
  const ctxWarg = resolveV2ClassContext('werewolf_0', 'human');
  assert.equal(ctxWarg.status, 'CONTENT_GAP');
  assert.equal(ctxWarg.v2ClassId, null, 'werewolf_0 has no Stage 0 node in V2, v2ClassId must be null');
  assert.deepEqual(ctxWarg.authorizedSkillIds, ['direct_strike'], 'werewolf_0 must authorize direct_strike');

  // ViewModel at Lv 1 only shows direct_strike, ZERO generic fighter skills
  const charWarg = { class: 'werewolf_0', race: 'human', level: 1, skills: {}, sp: 100 };
  const vmWarg = getSkillTreeViewModel(charWarg);
  const skillsWarg = vmWarg.allVisibleSkills.map(s => s.skillId);
  assert.deepEqual(skillsWarg, ['direct_strike'], 'werewolf_0 ViewModel must contain strictly direct_strike');

  // werewolf_0 can learn direct_strike and equip in loadout
  charWarg.skills['direct_strike'] = 1;
  const loadout = getLoadout(charWarg);
  const equipRes = equipSkill(charWarg, 'basic', 'direct_strike');
  assert.equal(equipRes.success, true, 'direct_strike must be equipable in loadout');
  assert.equal(loadout.basic, 'direct_strike');

  // 4.2 spirit_0: Stage 0 CONTENT_GAP -> v2ClassId MUST BE NULL (elementWeaverS1 is Stage 1 Lv 20+)
  const ctxSpirit = resolveV2ClassContext('spirit_0', 'highelf');
  assert.equal(ctxSpirit.status, 'CONTENT_GAP');
  assert.equal(ctxSpirit.v2ClassId, null, 'spirit_0 has no Stage 0 node in V2, v2ClassId must be null');
  assert.deepEqual(ctxSpirit.authorizedSkillIds.slice().sort(), ['fire_sphere', 'ice_sphere'].sort());

  // 4.3 shineMakerBase: Stage 0 CONTENT_GAP -> v2ClassId MUST BE NULL, authorizedSkillIds empty
  const ctxShine = resolveV2ClassContext('shineMakerBase', 'dwarf');
  assert.equal(ctxShine.status, 'CONTENT_GAP');
  assert.equal(ctxShine.v2ClassId, null);
  assert.deepEqual(ctxShine.authorizedSkillIds, []);

  // 4.4 Ertheia (marauderBase, sayhaMageBase) -> Stage 0 CONTENT_GAP without arbitrary Kamael / Mage skills
  const ctxMarauder = resolveV2ClassContext('marauderBase', 'ertheia');
  assert.equal(ctxMarauder.status, 'CONTENT_GAP');
  assert.equal(ctxMarauder.v2ClassId, null);
  assert.equal(ctxMarauder.authorizedSkillIds.includes('kamael_s_dignity'), false, 'Kamael dignity must NOT be authorized for Ertheia');
  assert.equal(ctxMarauder.authorizedSkillIds.includes('death_mark'), false, 'Kamael death mark must NOT be authorized for Ertheia');

  const ctxSayha = resolveV2ClassContext('sayhaMageBase', 'ertheia');
  assert.equal(ctxSayha.status, 'CONTENT_GAP');
  assert.equal(ctxSayha.v2ClassId, null);
});

test('5. Uniform Resolution Object Schema for All 25 Creator Starter Classes', (t) => {
  const STARTER_CLASSES = [
    { id: 'fighter', race: 'human' },
    { id: 'mage', race: 'human' },
    { id: 'human_deathknight_0', race: 'human' },
    { id: 'werewolf_0', race: 'human' },
    { id: 'secret_assassin_male_0', race: 'human' },
    { id: 'elven_fighter', race: 'elf' },
    { id: 'elven_mage', race: 'elf' },
    { id: 'elf_deathknight_0', race: 'elf' },
    { id: 'dark_fighter', race: 'darkelf' },
    { id: 'dark_mage', race: 'darkelf' },
    { id: 'delf_deathknight_0', race: 'darkelf' },
    { id: 'secret_assassin_female_0', race: 'darkelf' },
    { id: 'rose_vain_0', race: 'darkelf' },
    { id: 'orc_fighter', race: 'orc' },
    { id: 'orc_mage', race: 'orc' },
    { id: 'orc_rider_0', race: 'orc' },
    { id: 'dwarven_fighter', race: 'dwarf' },
    { id: 'shineMakerBase', race: 'dwarf' },
    { id: 'jin_kamael_soldier', race: 'kamael' },
    { id: 'crow_0', race: 'kamael' },
    { id: 'sylphid', race: 'sylph' },
    { id: 'sacred_templar_0', race: 'highelf' },
    { id: 'spirit_0', race: 'highelf' },
    { id: 'marauderBase', race: 'ertheia' },
    { id: 'sayhaMageBase', race: 'ertheia' }
  ];

  assert.equal(STARTER_CLASSES.length, 25);

  for (const starter of STARTER_CLASSES) {
    const ctx = resolveV2ClassContext(starter.id, starter.race);
    assert.ok(ctx, `Resolution context must exist for ${starter.id}`);
    assert.ok(['RESOLVED', 'CONTENT_GAP', 'UNRESOLVED'].includes(ctx.status), `Invalid status ${ctx.status} for ${starter.id}`);
    assert.equal(ctx.originalClassId, starter.id);
    assert.equal(ctx.race, starter.race);
    assert.ok(Array.isArray(ctx.authorizedSkillIds), `authorizedSkillIds must be array for ${starter.id}`);

    if (ctx.status === 'RESOLVED') {
      assert.equal(ctx.authorizedSkillIds.length, 5, `RESOLVED class ${starter.id} must have exactly 5 Stage 0 skills`);
      assert.ok(ctx.v2ClassId, `RESOLVED class ${starter.id} must have v2ClassId`);
      assert.ok(ctx.v2ClassDef, `RESOLVED class ${starter.id} must have v2ClassDef`);
    } else if (ctx.status === 'CONTENT_GAP') {
      assert.ok(ctx.contentGapReason, `CONTENT_GAP class ${starter.id} must document contentGapReason`);
    }
  }
});

test('6. Shared Authorization Contract & Combat Gating', (t) => {
  // If a skill is not authorized for the character, isSkillInProgressionPath must return false
  assert.equal(isSkillInProgressionPath('dark_fighter', 'flame_strike'), false);
  assert.equal(isSkillInProgressionPath('dark_fighter', 'twister'), false);
  assert.equal(isSkillInProgressionPath('dark_fighter', 'power_strike'), true);

  // Cross-racial check: Dark Elf Fighter cannot learn Elf Fighter's bandage
  assert.equal(isSkillInProgressionPath('dark_fighter', 'bandage'), false);
  // Elf Fighter cannot learn Dark Elf Knight's drain_hp
  assert.equal(isSkillInProgressionPath('elven_fighter', 'drain_hp'), false);
});

test('7. Loadout Icon Rendering & Path Verification (No [object Object], No Masking)', (t) => {
  // Test icon extraction
  const iconData = getSkillIcon('power_strike');
  assert.ok(typeof iconData === 'object', 'getSkillIcon returns object');
  assert.ok(iconData.iconPath, 'getSkillIcon must contain iconPath property');
  assert.equal(typeof iconData.iconPath, 'string');

  // Verify that passing this through formatting does NOT generate [object Object]
  const rawPath = iconData?.iconPath || (typeof iconData === 'string' ? iconData : null);
  assert.ok(rawPath && !rawPath.includes('[object Object]'), `Icon path must be string without [object Object]: ${rawPath}`);

  // Test physical existence of key icon assets
  const publicIconsDir = path.resolve('public/icons');
  const publicAssetsDir = path.resolve('public/assets/skills/icons');
  assert.ok(fs.existsSync(publicIconsDir), 'public/icons directory must exist');
  assert.ok(fs.existsSync(publicAssetsDir), 'public/assets/skills/icons directory must exist');
});

test('8. Promotion Progression & Racial Branch Isolation', (t) => {
  // Palus Knight (Lv 20 dark elf) inherits darkElfFighter skills + acquires 5 Palus Knight skills
  const charPK = { class: 'palusKnight', race: 'darkelf', level: 20, skills: {}, sp: 500 };
  const vmPK = getSkillTreeViewModel(charPK);
  const pkSkills = vmPK.allVisibleSkills.map(s => s.skillId);
  // Must include base skills: power_strike, mortal_blow, power_shot, weapon_mastery, armor_mastery
  assert.ok(pkSkills.includes('power_strike'));
  assert.ok(pkSkills.includes('power_shot'));
  // Must include stage 1 skills: drain_hp, shield_strike, confusion, sword_blunt_mastery, heavy_armor_mastery
  assert.ok(pkSkills.includes('drain_hp'));
  assert.ok(pkSkills.includes('shield_strike'));
  assert.ok(pkSkills.includes('confusion'));
  assert.equal(pkSkills.length, 10, 'Palus Knight Lv 20 must have 10 skills (5 stage 0 + 5 stage 1)');

  // Death Knight Elf vs Human vs Dark Elf: racial identity preservation in DAG
  assert.equal(resolveCanonicalDagClassId('human_deathknight_0', 'human'), 'human_deathknight_0');
  assert.equal(resolveCanonicalDagClassId('elf_deathknight_0', 'elf'), 'elf_deathknight_0');
  assert.equal(resolveCanonicalDagClassId('delf_deathknight_0', 'darkelf'), 'delf_deathknight_0');
});

test('9. Save Migration & UNRESOLVED Preservation Without Invalidation or Extra SP', (t) => {
  // A character with learned skills preserves them in state.skills even if some are legacy
  const savedChar = {
    class: 'dark_fighter',
    race: 'darkelf',
    level: 1,
    skills: {
      power_strike: 1,
      legacy_strike: 1 // unknown/unresolved skill
    },
    sp: 250
  };

  const vm = getSkillTreeViewModel(savedChar);
  // ViewModel should NOT crash
  assert.ok(vm);
  // legacy_strike remains preserved on state.skills (no destructive wipe)
  assert.equal(savedChar.skills['legacy_strike'], 1);
  // But legacy_strike is NOT in authorized progression or loadout
  assert.equal(isSkillInProgressionPath(savedChar.class, 'legacy_strike'), false);
});
