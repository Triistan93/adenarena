import test from 'node:test';
import assert from 'node:assert/strict';

import { MONSTERS } from '../lineage-idle/src/data/monsters.js';

test('all 177 catalog monsters carry an actionable, named combat skill', () => {
  const monsters = Object.entries(MONSTERS);
  assert.equal(monsters.length, 177);

  for (const [id, monster] of monsters) {
    assert.ok(monster.skill, `${id} has a skill`);
    assert.equal(typeof monster.skill.name, 'string');
    assert.ok(monster.skill.name.trim().length > 0, `${id} has a readable skill name`);
    assert.ok(['physical', 'magical'].includes(monster.skill.type), `${id} skill has a supported damage type`);
    assert.ok(monster.skill.mult > 1, `${id} skill deals more than a base attack`);
    assert.ok(monster.skill.cd > 0, `${id} skill has a cooldown`);
    if (monster.skill.effect) assert.ok(['stun', 'root', 'bleed', 'poison'].includes(monster.skill.effect), `${id} skill status is supported by combat feedback`);
    if (monster.boss || monster.elite) {
      assert.notEqual(monster.skill.name, monster.name, `${id} special monster has a distinct skill name`);
    }
  }
});
