import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyMonsterSkillStatus,
  clearPlayerCombatDebuffs,
  getActiveSkillDebuffStats,
  isMonsterActionDisabled,
  processMonsterSkillStatus
} from '../lineage-idle/src/services/SkillEffectService.js';

test('monster skill status chance respects resistance and applies timed control or damage', () => {
  const player = { hp: 10_000, maxHp: 10_000 };
  const boss = { id: 'test_boss', name: 'Test Boss', boss: true };

  assert.equal(applyMonsterSkillStatus(player, boss, 'stun', 1000, 0.4, 0.5).applied, false, 'resistance lowers the status proc chance');
  assert.equal(applyMonsterSkillStatus(player, boss, 'stun', 1000, 0, 0).applied, true);
  assert.equal(isMonsterActionDisabled(player, 1001), true);
  assert.equal(isMonsterActionDisabled(player, 2501), false, 'stun expires after its configured duration');

  assert.equal(applyMonsterSkillStatus(player, boss, 'root', 3000, 0, 0).applied, true);
  assert.equal(getActiveSkillDebuffStats(player, 3001).pAtkPercent, -0.25);
  assert.ok(clearPlayerCombatDebuffs(player, 3002).length > 0);
  assert.equal(getActiveSkillDebuffStats(player, 3002).pAtkPercent, undefined);

  assert.equal(applyMonsterSkillStatus(player, boss, 'poison', 4000, 0, 0).applied, true);
  assert.deepEqual(processMonsterSkillStatus(player, 4999), null);
  const tick = processMonsterSkillStatus(player, 5000);
  assert.equal(tick.damage, 180);
  assert.equal(player.hp, 9820);
  assert.ok(clearPlayerCombatDebuffs(player, 5001).includes('monster_skill_dot'));
  assert.equal(processMonsterSkillStatus(player, 5002), null);
});
