import test from 'node:test';
import assert from 'node:assert/strict';

import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { getSkillUnlockLevelForClass, isSkillAvailableForCharacter } from '../lineage-idle/src/services/SkillEligibility.js';
import { EFFECT_CONTRACTS } from '../scripts/lib/functional-evidence.mjs';

const EUROPEAN_ERTHEIA_CLASS_SKILLS = Object.freeze({
  marauderBase: ['eminent_light_armor_mastery', 'eminent_fist_weapon_mastery', 'eminent_stability', 'lateral_hit', 'right_sidestep', 'backspin_blow'],
  marauder: ['eminent_ability_marauder', 'eminent_attack_movement', 'air_light', 'fluid_weave', 'left_sidestep', 'chin_strike'],
  ertheiaWarrior: ['eminent_trait_resistance_ripper', 'eminent_attribute_resistance_ripper', 'heavy_punch', 'crushing_air', 'back_step', 'distortion', 'gravity_hit', 'distant_kick'],
  eviscerator: ['reverse_weight', 'heavy_hand', 'steel_mind', 'pressure_punch', 'gravity_barrier', 'warped_space', 'spallation', 'spinning_kick', 'summon_eviscerator_fox'],
  sayhaMageBase: ['hydro_attack', 'hydro_flare', 'wind_blend', 'eminent_blunt_weapon_mastery', 'eminent_robe_mastery', 'eminent_quick_recovery'],
  sayhaSeer: ['hydro_strike', 'air_rush', 'eye_of_the_storm', 'squall', 'eminent_ability_cloud_breaker'],
  windRiderErth: ['hydro_drain', 'mass_compelling_wind', 'threatening_wind', 'deceptive_blink', 'eminent_attribute_resistance_stratomancer', 'eminent_trait_resistance_stratomancer'],
  sayhaSeeker: ['sayhas_seer_aura', 'magic_potential', 'sayhas_word', 'divine_storm', 'sayhas_fury', 'sayhas_blessing', 'storm_rage', 'windy_refuge', 'switch_places', 'wind_illusion', 'summon_sayhas_seer_fox']
});

test('Ertheia uses the complete European class skill roster without changing local promotion milestones', () => {
  const thresholds = {
    marauderBase: [1, 19], marauder: [20, 39], ertheiaWarrior: [40, 75], eviscerator: [76, 120],
    sayhaMageBase: [1, 19], sayhaSeer: [20, 39], windRiderErth: [40, 75], sayhaSeeker: [76, 120]
  };
  const allSkillIds = [];

  for (const [classId, expectedSkillIds] of Object.entries(EUROPEAN_ERTHEIA_CLASS_SKILLS)) {
    const classDef = CANONICAL_CLASS_REGISTRY_V2[classId];
    assert.ok(classDef, `missing class ${classId}`);
    assert.deepEqual(classDef.skillIds, expectedSkillIds, `${classId} source roster must be complete and ordered`);
    assert.deepEqual([classDef.minLevel, classDef.maxLevel], thresholds[classId], `${classId} keeps Aden Arena's local level range`);

    const [min, max] = thresholds[classId];
    const learnedAt = expectedSkillIds.map(skillId => getSkillUnlockLevelForClass(classId, skillId));
    for (const [index, skillId] of expectedSkillIds.entries()) {
      const skill = CANONICAL_SKILL_REGISTRY_V2[skillId];
      assert.ok(skill, `${skillId} must exist in the canonical skill registry`);
      assert.ok(skill.classes?.includes(classId), `${skillId} must be assigned to ${classId}`);
      assert.ok(learnedAt[index] >= min && learnedAt[index] <= max, `${skillId} unlock ${learnedAt[index]} must be inside ${classId}'s stage`);
      assert.equal(
        isSkillAvailableForCharacter({ class: classId, race: 'ertheia', level: learnedAt[index], skills: {} }, skillId),
        true,
        `${skillId} must become available on its configured local unlock level`
      );
      if (learnedAt[index] > min) {
        assert.equal(
          isSkillAvailableForCharacter({ class: classId, race: 'ertheia', level: learnedAt[index] - 1, skills: {} }, skillId),
          false,
          `${skillId} must remain locked until level ${learnedAt[index]}`
        );
      }
      allSkillIds.push(skillId);
    }
    assert.equal(new Set(learnedAt).size, learnedAt.length, `${classId} skills should be distributed across its stage`);
  }

  assert.equal(allSkillIds.length, 57);
  assert.equal(new Set(allSkillIds).size, allSkillIds.length, 'each European Ertheia skill belongs to exactly one class stage');
  for (const skillId of allSkillIds) {
    assert.ok(EFFECT_CONTRACTS[skillId], `${skillId} needs an explicit local effect contract before functional audit approval`);
    assert.match(EFFECT_CONTRACTS[skillId].source, /Aden Arena local adaptation/);
  }
});
