import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessEffect, summarizeAudit } from '../scripts/lib/functional-evidence.mjs';

test('metadata and unrelated damage cannot prove an effect', () => {
  assert.equal(assessEffect({ kind: 'passive', stat: 'crit' }, { before: { crit: 5 }, after: { crit: 5 }, def: { effect: 'stat' } }).pass, false);
  assert.equal(assessEffect({ kind: 'damage' }, { skillId: 'power_strike', hpBefore: 100, hpAfter: 90, events: [] }).pass, false);
  assert.equal(assessEffect(null, { hpBefore: 100, hpAfter: 90 }).status, 'NOT_VALIDATED');
});

test('buff proof requires the expected attribute and expiration, not just a buff field', () => {
  const contract = { kind: 'buff', stat: 'atk' };
  const evidence = { before: { atk: 10 }, after: { atk: 12 }, expired: { atk: 10 }, applied: true, expiresInMs: 60000 };
  assert.equal(assessEffect(contract, evidence).pass, true);
  assert.equal(assessEffect(contract, { ...evidence, after: { atk: 10 } }).pass, false);
  assert.equal(assessEffect(contract, { ...evidence, expired: { atk: 12 } }).pass, false);
});

test('technical failures in content-blocked classes and special proofs fail globally', () => {
  const failed = { classId: 'gap', contentStatus: 'BLOCKED_CONTENT_GAP', checks: [{ pass: false }], skills: [] };
  assert.equal(summarizeAudit([failed], []).overallStatus, 'FAIL');
  assert.equal(summarizeAudit([], [{ pass: false }]).overallStatus, 'FAIL');
  assert.equal(summarizeAudit([{ ...failed, checks: [] }], []).overallStatus, 'APPROVAL_BLOCKED');
  assert.equal(summarizeAudit([{ classId: 'normal', checks: [], skills: [{ effect: { status: 'NOT_VALIDATED' } }] }], []).overallStatus, 'APPROVAL_BLOCKED');
});
