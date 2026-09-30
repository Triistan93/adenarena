import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateCharacterSave, calculateHistoricalSpSpent } from '../lineage-idle/src/services/SkillMigrationService.js';

test('Ertheia synthetic skills refund once and are removed from production loadout references', () => {
  const fixture = {
    race: 'ertheia',
    class: 'marauderBase',
    level: 1,
    sp: 100,
    skillSystemVersion: 2,
    skills: { iron_punch: 3, light_armor_mastery: 2, eminent_light_armor_mastery: 1 },
    skillLoadout: { basic: 'iron_punch', core: 'eminent_light_armor_mastery' },
    hotbar: ['iron_punch', 'eminent_light_armor_mastery'],
    skillAutoCast: { iron_punch: true, eminent_light_armor_mastery: false },
    selectedSkill: 'iron_punch'
  };
  const expectedRefund = calculateHistoricalSpSpent(5, 3) + calculateHistoricalSpSpent(5, 2);

  migrateCharacterSave(fixture);

  assert.deepEqual(fixture.skills, { eminent_light_armor_mastery: 1 });
  assert.equal(fixture.sp, 100 + expectedRefund);
  assert.equal(fixture.skillLoadout.basic, null);
  assert.equal(fixture.skillLoadout.core, 'eminent_light_armor_mastery');
  assert.deepEqual(fixture.hotbar, [null, 'eminent_light_armor_mastery']);
  assert.deepEqual(fixture.skillAutoCast, { eminent_light_armor_mastery: false });
  assert.equal(fixture.selectedSkill, null);
  assert.equal(fixture.migrationLedger.ertheiaRoster.totalSpRefunded, expectedRefund);

  migrateCharacterSave(fixture);
  assert.equal(fixture.sp, 100 + expectedRefund, 'reloading cannot refund twice');
});

test('Ertheia branch migration preserves exact roster skills on an evolved class', () => {
  const fixture = {
    race: 'ertheia', class: 'marauder', level: 20, skillSystemVersion: 2, sp: 0,
    skills: { eminent_light_armor_mastery: 1, eminent_ability_marauder: 1, hydro_attack: 1 }
  };

  migrateCharacterSave(fixture);

  assert.equal(fixture.skills.eminent_light_armor_mastery, 1, 'valid ancestor skill remains learned');
  assert.equal(fixture.skills.eminent_ability_marauder, 1, 'current-class skill remains learned');
  assert.equal(fixture.skills.hydro_attack, undefined, 'other branch skill is not grandfathered into the fighter lineage');
});
