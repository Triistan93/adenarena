import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window ||= {};
await import('../lineage-idle/data/echo-adapter.js');
const { getSkillTreeViewModel } = await import('../lineage-idle/src/services/SkillTreeViewModel.js');

const { CLASS_SKILLS_ECHO } = window.EchoData;
const { SKILL_DEFS_ECHO } = window.EchoData;

test('ShineMaker runtime tree exposes its authored class skills instead of generic Warrior skills', () => {
  const cases = [
    ['shineMakerS1', [
      'shineMakerS1_light_burst',
      'shineMakerS1_radiant_strike',
      'shineMakerS1_purifying_light',
      'shineMakerS1_shining_barrier'
    ]],
    ['shineMakerS2', [
      'shineMakerS2_prismatic_ray',
      'shineMakerS2_shining_nova',
      'shineMakerS2_crystal_arrow',
      'shineMakerS2_light_of_creation',
      'shineMakerS2_brilliant_aura',
      'shineMakerS2_shinemaker_harmony_s2'
    ]],
    ['shinemaker', [
      'shinemaker_star_fall',
      'shinemaker_transcendent_star_fall',
      'shinemaker_divine_crystal_aegis',
      'shinemaker_shinemakers_ultimate_harmony'
    ]]
  ];

  for (const [classId, expectedIds] of cases) {
    assert.deepEqual(CLASS_SKILLS_ECHO[classId], expectedIds, `${classId} should use its authored skill set`);
    for (const skillId of expectedIds) {
      const skill = SKILL_DEFS_ECHO[skillId];
      assert.ok(skill, `${skillId} must resolve to a runtime skill definition`);
      if (skill.type === 'active') {
        assert.equal(skill.damageType, 'magic', `${skillId} is a ShineMaker magical attack`);
        assert.equal(skill.isMagic, true, `${skillId} must use the magic combat path`);
      }
    }
  }

  assert.equal(SKILL_DEFS_ECHO.shineMakerS1_purifying_light.effect, 'heal', 'Purifying Light must enter the heal/cleanse production path');
  assert.equal(SKILL_DEFS_ECHO.shinemaker_divine_crystal_aegis.type, 'buff', 'Divine Crystal Aegis must enter the defensive buff path');

  const stageOneTree = getSkillTreeViewModel({ class: 'shineMakerS1', race: 'dwarf', level: 20, skills: {}, sp: 100 });
  const visibleIds = stageOneTree.allVisibleSkills.map(skill => skill.skillId);
  assert.ok(cases[0][1].every(skillId => visibleIds.includes(skillId)), 'the production skill panel must show authored stage-one skills');
  assert.ok(!visibleIds.includes('power_strike'), 'the production skill panel must not show an unrelated Warrior skill');
});
