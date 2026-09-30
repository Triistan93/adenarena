import test from 'node:test';
import assert from 'node:assert/strict';
import { applyStarterKit } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { EUROPEAN_ERTHEIA_ROSTER } from '../lineage-idle/src/data/skills/ertheia/european-roster.js';
import { getSkillUnlockLevelForClass } from '../lineage-idle/src/services/SkillEligibility.js';

const ERTHEIA_STAT_SKILLS = Object.entries(EUROPEAN_ERTHEIA_ROSTER)
  .flatMap(([classId, skillIds]) => skillIds
    .map(skillId => ({ classId, skillId, def: CANONICAL_SKILL_REGISTRY_V2[skillId] }))
    .filter(({ def }) => def.type === 'passive'));

function characterWithSkill(classId, skillId = null) {
  const character = {};
  applyStarterKit(character, 'ertheia', classId, 'Passive Audit', 'F');
  character.level = Math.max(character.level || 1, getSkillUnlockLevelForClass(classId, skillId || EUROPEAN_ERTHEIA_ROSTER[classId][0]));
  character.skills = skillId ? { [skillId]: 1 } : {};

  const def = skillId ? CANONICAL_SKILL_REGISTRY_V2[skillId] : null;
  if (def?.requiredWeapon === 'fist' || def?.requiredWeapon === 'blunt') {
    const itemId = `audit_${def.requiredWeapon}_weapon`;
    character.inventory = character.inventory || [];
    character.inventory.push({ uid: itemId, itemId, name: itemId, type: 'weapon', weaponType: def.requiredWeapon, atk: 1 });
    character.equipment = { ...(character.equipment || {}), weapon: itemId };
  }
  if (def?.requiredWeapon === 'light' || def?.requiredWeapon === 'robe') {
    const itemId = `audit_${def.requiredWeapon}_armor`;
    character.inventory = character.inventory || [];
    character.inventory.push({ uid: itemId, itemId, name: itemId, type: 'armor', armorType: def.requiredWeapon, def: 1, mdef: 1 });
    character.equipment = { ...(character.equipment || {}), armor: itemId };
  }
  return character;
}

test('every passive in the researched Ertheia roster changes production StatsEngine output', async t => {
  assert.equal(ERTHEIA_STAT_SKILLS.length, 14);
  for (const { classId, skillId, def } of ERTHEIA_STAT_SKILLS) {
    await t.test(`${classId}/${skillId}`, () => {
      const baseline = getStats(characterWithSkill(classId));
      const learned = getStats(characterWithSkill(classId, skillId));
      const changedStats = Object.keys(learned).filter(key =>
        Number.isFinite(learned[key]) && learned[key] !== baseline[key]
      );
      assert.ok(changedStats.length > 0, `${skillId} must affect calculated production stats`);
      assert.ok(def.effectStats && Object.keys(def.effectStats).length > 0, `${skillId} must declare its local adapted effect`);
    });
  }
});
