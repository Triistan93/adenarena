/**
 * class-golden-dataset.test.js — Golden Dataset Audit Test Suite
 * 
 * Verifies that the runtime CanonicalClassGraph matches classes_tree_canonical.json
 * with mathematical precision (0 diff):
 * - 9 Races
 * - 49 Lineages
 * - 159 Class Nodes (25 Base, 36 1st, 49 2nd, 49 3rd)
 * - 134 Unique Edges
 * - 25 Roots (in-degree 0)
 * - 49 Terminals (out-degree 0)
 * - 0 Cycles (Strict DAG)
 * - baseStats: null, baseStatsStatus: 'CONTENT_GAP'
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import crypto from 'crypto';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_RACES } from '../lineage-idle/src/data/classes/CanonicalRaceRegistry.js';

test('Golden Dataset Authority: CanonicalClassGraph vs classes_tree_canonical.json', async (t) => {
  const rawJson = fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8');
  const normalizedJson = rawJson.replace(/\r\n/g, '\n');
  const sha256 = crypto.createHash('sha256').update(normalizedJson).digest('hex');
  const treeData = JSON.parse(rawJson);

  await t.test('1. SHA-256 Authority Fingerprint', () => {
    assert.equal(sha256, 'c1699e4ea3a67b6f4d0d693b69df55caf15308733422a5fa66628d5131b858f8', 'Canonical JSON hash must match');
  });

  // Calculate ground truth dynamically from JSON
  const expectedRaces = new Set();
  const expectedLineages = new Set();
  const expectedNodes = new Map();
  const expectedEdges = new Set();
  const expectedStageCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

  for (const r of treeData) {
    expectedRaces.add(r.race);
    for (const b of (r.branches || [])) {
      expectedLineages.add(b.third);
      const steps = [
        { id: b.base, stage: 0 },
        { id: b.first, stage: 1 },
        { id: b.second, stage: 2 },
        { id: b.third, stage: 3 }
      ];
      let prev = null;
      for (const step of steps) {
        if (!expectedNodes.has(step.id)) {
          expectedNodes.set(step.id, { id: step.id, race: r.race, stage: step.stage });
          expectedStageCounts[step.stage]++;
        }
        if (prev) {
          expectedEdges.add(`${prev}->${step.id}`);
        }
        prev = step.id;
      }
    }
  }

  await t.test('2. Authority Structural Metrics (Dynamic from JSON)', () => {
    assert.equal(expectedRaces.size, 9, 'Expected 9 canonical races');
    assert.equal(expectedLineages.size, 49, 'Expected 49 canonical lineages');
    assert.equal(expectedNodes.size, 159, 'Expected 159 unique canonical class nodes');
    assert.equal(expectedStageCounts[0], 25, 'Expected 25 Stage 0 base classes');
    assert.equal(expectedStageCounts[1], 36, 'Expected 36 Stage 1 1st classes');
    assert.equal(expectedStageCounts[2], 49, 'Expected 49 Stage 2 2nd classes');
    assert.equal(expectedStageCounts[3], 49, 'Expected 49 Stage 3 3rd classes');
    assert.equal(expectedEdges.size, 134, 'Expected 134 unique directed edges (159 - 25)');
  });

  await t.test('3. Runtime CanonicalClassGraph Node Parity (159 nodes, 0 diff)', () => {
    const runtimeNodes = CanonicalClassGraph.getAllClassNodes();
    assert.equal(runtimeNodes.length, 159, 'Runtime graph must contain exactly 159 nodes');
    assert.equal(Object.keys(CANONICAL_CLASS_REGISTRY).length, 159, 'CanonicalClassRegistry must contain 159 keys');

    for (const [nodeId, expected] of expectedNodes.entries()) {
      const runtimeNode = CanonicalClassGraph.getClassNode(nodeId);
      assert.ok(runtimeNode, `Runtime node ${nodeId} must exist in CanonicalClassGraph`);
      assert.equal(runtimeNode.stage, expected.stage, `Stage mismatch for node ${nodeId}`);
      assert.equal(runtimeNode.race, expected.race, `Race mismatch for node ${nodeId}`);
    }
  });

  await t.test('4. Runtime CanonicalClassGraph Edge Parity (134 edges, 0 diff)', () => {
    const runtimeEdges = CanonicalClassGraph.getAllEdges();
    assert.equal(runtimeEdges.length, 134, 'Runtime graph must contain exactly 134 unique edges');

    const runtimeEdgeSet = new Set(runtimeEdges.map(e => `${e.from}->${e.to}`));
    assert.equal(runtimeEdgeSet.size, 134, 'All runtime edges must be unique');

    for (const expEdge of expectedEdges) {
      assert.ok(runtimeEdgeSet.has(expEdge), `Edge ${expEdge} from JSON must exist in runtime graph`);
    }
  });

  await t.test('5. Graph Topological Integrity & Cycle Invariant', () => {
    const roots = CanonicalClassGraph.getRootClasses();
    assert.equal(roots.length, 25, 'Expected exactly 25 roots (in-degree 0)');

    const terminals = CanonicalClassGraph.getTerminalClasses();
    assert.equal(terminals.length, 49, 'Expected exactly 49 terminals (out-degree 0)');

    const topoSort = CanonicalClassGraph.topologicalSort();
    assert.equal(topoSort.length, 159, 'Topological sort must include all 159 nodes without cycles');
  });

  await t.test('6. Race Registry Parity (9 Races, 25 Base Class Roots)', () => {
    const raceKeys = Object.keys(CANONICAL_RACES);
    assert.equal(raceKeys.length, 9, 'Expected 9 canonical races in registry');

    let totalBaseClassRoots = 0;
    for (const raceId of raceKeys) {
      const r = CANONICAL_RACES[raceId];
      assert.ok(r.baseClassIds.length > 0, `Race ${raceId} must have at least 1 base class`);
      totalBaseClassRoots += r.baseClassIds.length;
    }
    assert.equal(totalBaseClassRoots, 25, 'Sum of base class roots across all races must equal 25');
  });

  await t.test('7. Content Gap Invariant (Zero Invention of baseStats)', () => {
    for (const node of CanonicalClassGraph.getAllClassNodes()) {
      assert.equal(node.baseStats, null, `Class ${node.id} must have baseStats: null`);
      assert.equal(node.baseStatsStatus, 'CONTENT_GAP', `Class ${node.id} must have baseStatsStatus: CONTENT_GAP`);
    }
  });
});
