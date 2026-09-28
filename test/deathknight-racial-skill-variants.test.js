import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getSkillDetailedVisibility,
  isSkillInProgressionPath,
  resolveV2ClassContext
} from '../lineage-idle/src/services/SkillEligibility.js';

const racialCalls = [
  { race: 'human', expected: 'call_of_flame' },
  { race: 'elf', expected: 'call_of_frost' },
  { race: 'darkelf', expected: 'call_of_lightning' }
];

for (const stage of [2, 3]) {
  test(`Death Knight stage ${stage} authorizes the race-specific Call skill`, () => {
    const expectedCount = stage === 2 ? 14 : 20;
    for (const { race, expected } of racialCalls) {
      const context = resolveV2ClassContext(`${race === 'darkelf' ? 'delf' : race}_deathknight_${stage}`, race);
      assert.equal(context.status, 'RESOLVED');
      assert.ok(context.authorizedSkillIds.includes(expected), `${race} must have ${expected}`);
      assert.ok(Array.isArray(context.classSkillIds), 'context must expose the current stage skill list to auditors');
      if (stage === 2) {
        assert.ok(context.classSkillIds.includes(expected), `${race} stage 2 must declare ${expected} as a current skill`);
      } else {
        assert.ok(!context.classSkillIds.some(skillId => skillId.startsWith('call_of_')), 'stage 3 Call variant must be inherited from stage 2');
      }
      const classId = `${race === 'darkelf' ? 'delf' : race}_deathknight_${stage}`;
      const character = { class: classId, race, level: stage === 2 ? 60 : 76, skills: {} };
      assert.ok(isSkillInProgressionPath(character, expected), `${race} must retain progression access to ${expected}`);
      assert.notEqual(getSkillDetailedVisibility(character, expected), 'HIDDEN_FOREIGN');

      const otherCalls = racialCalls.filter(entry => entry.expected !== expected).map(entry => entry.expected);
      for (const foreignCall of otherCalls) {
        assert.ok(!context.authorizedSkillIds.includes(foreignCall), `${race} must not have ${foreignCall}`);
        assert.equal(isSkillInProgressionPath(character, foreignCall), false, `${race} must reject ${foreignCall} from its progression`);
        assert.equal(getSkillDetailedVisibility(character, foreignCall), 'HIDDEN_FOREIGN', `${race} must hide ${foreignCall}`);
      }

      assert.equal(context.authorizedSkillIds.length, expectedCount, 'race variant replaces the shared skill without adding a slot');
    }
  });
}
