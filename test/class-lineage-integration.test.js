/**
 * class-lineage-integration.test.js — 49 Lineages End-to-End Progression Test Suite
 * 
 * Verifies full 4-stage progression lifecycle for every single one of the 49 canonical lineages.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';
import { ClassProgressionEngine } from '../lineage-idle/src/engine/ClassProgressionEngine.js';
import { SeasonAvailabilityService } from '../lineage-idle/src/services/SeasonAvailabilityService.js';

test('Lineage Integration Suite: 49 Canonical Lineages Full Promotion Lifecycle', async (t) => {
  const rawJson = fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8');
  const treeData = JSON.parse(rawJson);

  const branches = [];
  for (const r of treeData) {
    for (const b of (r.branches || [])) {
      branches.push({ race: r.race, ...b });
    }
  }

  await t.test('1. Branch Count: Exactly 49 canonical branches', () => {
    assert.equal(branches.length, 49);
  });

  await t.test('2. Path Progression: Stage 0 -> Stage 1 -> Stage 2 -> Stage 3', () => {
    for (const b of branches) {
      const { base, first, second, third, race, lineageName } = b;

      // Base -> First
      const baseNode = CanonicalClassGraph.getClassNode(base);
      assert.ok(baseNode, `Base node ${base} must exist (${lineageName})`);
      const baseSuccessors = CanonicalClassGraph.getSuccessors(base).map(n => n.id);
      assert.ok(baseSuccessors.includes(first), `${base} must transition to ${first}`);

      // First -> Second
      const firstNode = CanonicalClassGraph.getClassNode(first);
      assert.ok(firstNode, `First node ${first} must exist (${lineageName})`);
      const firstSuccessors = CanonicalClassGraph.getSuccessors(first).map(n => n.id);
      assert.ok(firstSuccessors.includes(second), `${first} must transition to ${second}`);

      // Second -> Third
      const secondNode = CanonicalClassGraph.getClassNode(second);
      assert.ok(secondNode, `Second node ${second} must exist (${lineageName})`);
      const secondSuccessors = CanonicalClassGraph.getSuccessors(second).map(n => n.id);
      assert.ok(secondSuccessors.includes(third), `${second} must transition to ${third}`);

      // Third is terminal
      const thirdNode = CanonicalClassGraph.getClassNode(third);
      assert.ok(thirdNode, `Third node ${third} must exist (${lineageName})`);
      const thirdSuccessors = CanonicalClassGraph.getSuccessors(third);
      assert.equal(thirdSuccessors.length, 0, `Third node ${third} must be terminal`);
    }
  });

  await t.test('3. ClassProgressionEngine & Season Gating across progression breakpoints', () => {
    for (const b of branches) {
      const { base, first, second, third, race } = b;

      // At level 19: Base cannot promote to 1st
      const optsLvl19 = ClassProgressionEngine.getPromotionOptions(base, 19, race, 1);
      const targetFirst19 = optsLvl19.find(o => o.targetClass.id === first);
      assert.ok(targetFirst19);
      assert.equal(targetFirst19.isEligible, false, 'Level 19 must not be eligible for 1st class');

      // At level 20: Base CAN promote to 1st
      const optsLvl20 = ClassProgressionEngine.getPromotionOptions(base, 20, race, 1);
      const targetFirst20 = optsLvl20.find(o => o.targetClass.id === first);
      assert.ok(targetFirst20);
      assert.equal(targetFirst20.isEligible, true, `Level 20 must be eligible for ${first}`);

      // At level 40: 1st CAN promote to 2nd
      const optsLvl40 = ClassProgressionEngine.getPromotionOptions(first, 40, race, 1);
      const targetSecond40 = optsLvl40.find(o => o.targetClass.id === second);
      assert.ok(targetSecond40);
      assert.equal(targetSecond40.isEligible, true, `Level 40 must be eligible for ${second}`);

      // At level 76 Season 1: 2nd CANNOT promote to 3rd because Season 1 cap is Lv 40 (Season Gated)
      const optsLvl76S1 = ClassProgressionEngine.getPromotionOptions(second, 76, race, 1);
      const targetThird76S1 = optsLvl76S1.find(o => o.targetClass.id === third);
      assert.ok(targetThird76S1);
      assert.equal(targetThird76S1.isEligible, false, `Third class ${third} must be gated in Season 1`);
      assert.equal(targetThird76S1.isSeasonGated, true);

      // At level 76 Season 3: 3rd class IS eligible
      const optsLvl76S3 = ClassProgressionEngine.getPromotionOptions(second, 76, race, 3);
      const targetThird76S3 = optsLvl76S3.find(o => o.targetClass.id === third);
      assert.ok(targetThird76S3);
      assert.equal(targetThird76S3.isEligible, true, `Third class ${third} must be eligible in Season 3`);
    }
  });
});
