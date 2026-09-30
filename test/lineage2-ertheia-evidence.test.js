import test from 'node:test';
import assert from 'node:assert/strict';
import { retrieveErtheiaEvidence } from '../scripts/query_lineage2_evidence.mjs';

test('local Ertheia evidence retrieval returns verifiable provenance and separates adaptation claims', () => {
  const [result] = retrieveErtheiaEvidence('Hydro Attack', { classId: 'sayhaMageBase' });

  assert.ok(result);
  assert.equal(result.classId, 'sayhaMageBase');
  assert.ok(result.skillIds.includes('hydro_attack'));
  assert.equal(result.source.url, 'https://eu.4gameforum.com/threads/23847/');
  assert.equal(result.source.lines, '594-622');
  assert.match(result.officialClaim, /names and class membership only/i);
  assert.match(result.localClaim, /Aden Arena adaptations/i);
  assert.ok(result.rules.localDecisions.some(rule => rule.includes('not official')));
});

test('local evidence retrieval does not invent results for unknown class names', () => {
  assert.deepEqual(retrieveErtheiaEvidence('unknown', { classId: 'not-an-ertheia-class' }), []);
});
