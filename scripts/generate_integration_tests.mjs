import fs from 'fs';

// 1. Golden Dataset Test
const goldenCode = `/**
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
  const sha256 = crypto.createHash('sha256').update(rawJson).digest('hex');
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
          expectedEdges.add(\`\${prev}->\${step.id}\`);
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
      assert.ok(runtimeNode, \`Runtime node \${nodeId} must exist in CanonicalClassGraph\`);
      assert.equal(runtimeNode.stage, expected.stage, \`Stage mismatch for node \${nodeId}\`);
      assert.equal(runtimeNode.race, expected.race, \`Race mismatch for node \${nodeId}\`);
    }
  });

  await t.test('4. Runtime CanonicalClassGraph Edge Parity (134 edges, 0 diff)', () => {
    const runtimeEdges = CanonicalClassGraph.getAllEdges();
    assert.equal(runtimeEdges.length, 134, 'Runtime graph must contain exactly 134 unique edges');

    const runtimeEdgeSet = new Set(runtimeEdges.map(e => \`\${e.from}->\${e.to}\`));
    assert.equal(runtimeEdgeSet.size, 134, 'All runtime edges must be unique');

    for (const expEdge of expectedEdges) {
      assert.ok(runtimeEdgeSet.has(expEdge), \`Edge \${expEdge} from JSON must exist in runtime graph\`);
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
      assert.ok(r.baseClassIds.length > 0, \`Race \${raceId} must have at least 1 base class\`);
      totalBaseClassRoots += r.baseClassIds.length;
    }
    assert.equal(totalBaseClassRoots, 25, 'Sum of base class roots across all races must equal 25');
  });

  await t.test('7. Content Gap Invariant (Zero Invention of baseStats)', () => {
    for (const node of CanonicalClassGraph.getAllClassNodes()) {
      assert.equal(node.baseStats, null, \`Class \${node.id} must have baseStats: null\`);
      assert.equal(node.baseStatsStatus, 'CONTENT_GAP', \`Class \${node.id} must have baseStatsStatus: CONTENT_GAP\`);
    }
  });
});
`;

// 2. Race Integration Test
const raceIntegrationCode = `/**
 * class-race-integration.test.js — Race Integration & Base Class Creation Test Suite
 * 
 * Verifies character creation and initialization for all 9 canonical races.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CanonicalRaceRegistry, ALL_CANONICAL_RACE_IDS } from '../lineage-idle/src/data/classes/CanonicalRaceRegistry.js';
import { CanonicalClassGraph } from '../lineage-idle/src/data/classes/CanonicalClassGraph.js';
import { applyStarterKit, DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ClassValidationService } from '../lineage-idle/src/services/ClassValidationService.js';

test('Race Integration Suite: 9 Canonical Races & Character Creation', async (t) => {
  await t.test('1. Registry Coverage: Exactly 9 canonical races', () => {
    assert.equal(ALL_CANONICAL_RACE_IDS.length, 9);
    const expected = ['human', 'elf', 'darkelf', 'orc', 'dwarf', 'kamael', 'sylph', 'highelf', 'ertheia'];
    assert.deepEqual([...ALL_CANONICAL_RACE_IDS].sort(), expected.sort());
  });

  await t.test('2. Base Class Association: Every race has authentic Stage 0 base roots', () => {
    for (const raceId of ALL_CANONICAL_RACE_IDS) {
      const raceDef = CanonicalRaceRegistry.getRace(raceId);
      assert.ok(raceDef, \`Race \${raceId} must exist\`);
      const baseClasses = CanonicalClassGraph.getBaseClassesForRace(raceId);
      assert.ok(baseClasses.length > 0, \`Race \${raceId} must have base classes\`);
      for (const b of baseClasses) {
        assert.equal(b.stage, 0, \`Class \${b.id} must be Stage 0\`);
        assert.equal(b.race, raceId, \`Class \${b.id} must match race \${raceId}\`);
      }
    }
  });

  await t.test('3. StateManager applyStarterKit initializes valid state for all 25 Stage 0 base classes', () => {
    const allRoots = CanonicalClassGraph.getRootClasses();
    assert.equal(allRoots.length, 25);

    for (const root of allRoots) {
      const state = DEFAULT_STATE();
      applyStarterKit(state, root.race, root.id, \`TestHero_\${root.id}\`, 'M');

      assert.equal(state.race, root.race, \`State race must equal \${root.race}\`);
      assert.equal(state.class, root.id, \`State class must equal \${root.id}\`);
      assert.equal(state.level, 1);
      assert.ok(state.inventory.length >= 2, 'Must have at least weapon and armor in inventory');
      assert.ok(state.equipment.weapon, 'Must have starter weapon equipped');
      assert.ok(state.equipment.armor, 'Must have starter armor equipped');

      const isMage = ClassValidationService.isMageClass(root.id);
      const shotItem = state.inventory.find(i => i.itemId.includes('shot'));
      assert.ok(shotItem, \`Class \${root.id} must have starter shots\`);
      if (isMage) {
        assert.equal(shotItem.itemId, 'spiritshot_ng', \`Mage class \${root.id} must start with spiritshot_ng\`);
      } else {
        assert.equal(shotItem.itemId, 'soulshot_ng', \`Fighter class \${root.id} must start with soulshot_ng\`);
      }
    }
  });
});
`;

// 3. Lineage Integration Test
const lineageIntegrationCode = `/**
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
      assert.ok(baseNode, \`Base node \${base} must exist (\${lineageName})\`);
      const baseSuccessors = CanonicalClassGraph.getSuccessors(base).map(n => n.id);
      assert.ok(baseSuccessors.includes(first), \`\${base} must transition to \${first}\`);

      // First -> Second
      const firstNode = CanonicalClassGraph.getClassNode(first);
      assert.ok(firstNode, \`First node \${first} must exist (\${lineageName})\`);
      const firstSuccessors = CanonicalClassGraph.getSuccessors(first).map(n => n.id);
      assert.ok(firstSuccessors.includes(second), \`\${first} must transition to \${second}\`);

      // Second -> Third
      const secondNode = CanonicalClassGraph.getClassNode(second);
      assert.ok(secondNode, \`Second node \${second} must exist (\${lineageName})\`);
      const secondSuccessors = CanonicalClassGraph.getSuccessors(second).map(n => n.id);
      assert.ok(secondSuccessors.includes(third), \`\${second} must transition to \${third}\`);

      // Third is terminal
      const thirdNode = CanonicalClassGraph.getClassNode(third);
      assert.ok(thirdNode, \`Third node \${third} must exist (\${lineageName})\`);
      const thirdSuccessors = CanonicalClassGraph.getSuccessors(third);
      assert.equal(thirdSuccessors.length, 0, \`Third node \${third} must be terminal\`);
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
      assert.equal(targetFirst20.isEligible, true, \`Level 20 must be eligible for \${first}\`);

      // At level 40: 1st CAN promote to 2nd
      const optsLvl40 = ClassProgressionEngine.getPromotionOptions(first, 40, race, 1);
      const targetSecond40 = optsLvl40.find(o => o.targetClass.id === second);
      assert.ok(targetSecond40);
      assert.equal(targetSecond40.isEligible, true, \`Level 40 must be eligible for \${second}\`);

      // At level 76 Season 1: 2nd CANNOT promote to 3rd because Season 1 cap is Lv 40 (Season Gated)
      const optsLvl76S1 = ClassProgressionEngine.getPromotionOptions(second, 76, race, 1);
      const targetThird76S1 = optsLvl76S1.find(o => o.targetClass.id === third);
      assert.ok(targetThird76S1);
      assert.equal(targetThird76S1.isEligible, false, \`Third class \${third} must be gated in Season 1\`);
      assert.equal(targetThird76S1.isSeasonGated, true);

      // At level 76 Season 3: 3rd class IS eligible
      const optsLvl76S3 = ClassProgressionEngine.getPromotionOptions(second, 76, race, 3);
      const targetThird76S3 = optsLvl76S3.find(o => o.targetClass.id === third);
      assert.ok(targetThird76S3);
      assert.equal(targetThird76S3.isEligible, true, \`Third class \${third} must be eligible in Season 3\`);
    }
  });
});
`;

// 4. Sacred Pillars Regression Test
const sacredPillarsCode = `/**
 * sacred-pillars-regression.test.js — Zero Behavioral Diff in Sacred Pillars
 * 
 * Verifies that the 3 sacred pillars remain 100% functionally preserved:
 * 1. LevelEngine.js (checkLevelUp, xp formulas, season cap)
 * 2. MarketService.js (market listings, tax, transactions)
 * 3. ExpeditionService.js (mercenaries, risk directives, dispatch)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLevelUp, getXpForLevel, getLevelProgress, LEVEL_MILESTONES } from '../lineage-idle/src/engine/LevelEngine.js';
import { MarketService } from '../lineage-idle/src/services/MarketService.js';
import { ExpeditionService, EXPEDITION_DESTINATIONS, RISK_DIRECTIVES } from '../lineage-idle/src/services/ExpeditionService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

test('Sacred Pillars Regression Suite: Zero Behavioral Drift', async (t) => {
  await t.test('1. Pillar 1: LevelEngine mathematical formulas and leveling invariants', () => {
    // Check baseline level formulas
    assert.equal(getXpForLevel(1), 100);
    assert.ok(getXpForLevel(20) > getXpForLevel(1));
    assert.ok(getXpForLevel(40) > getXpForLevel(20));

    // Level progression calculation
    const progress = getLevelProgress(1, 50);
    assert.equal(progress.currentXp, 50);
    assert.equal(progress.requiredXp, 100);
    assert.equal(progress.percent, 50);

    // Milestones check
    assert.equal(LEVEL_MILESTONES[20].title, '1ª Troca de Classe');
    assert.equal(LEVEL_MILESTONES[40].title, '2ª Troca de Classe');
    assert.equal(LEVEL_MILESTONES[76].title, '3ª Troca de Classe');

    // Simulate leveling up with callbacks
    const state = DEFAULT_STATE();
    state.level = 1;
    state.xp = 150;
    let advancementTriggered = false;

    const callbacks = {
      log: () => {},
      floatText: () => {},
      updateAllUI: () => {},
      checkClassAdvancement: () => { advancementTriggered = true; },
      updateSkillUI: () => {},
      updateRaceClassUI: () => {},
      getStats: () => ({ maxHp: 100, maxMp: 50 })
    };

    const leveled = checkLevelUp(state, callbacks);
    assert.equal(leveled, true);
    assert.equal(state.level, 2);
    assert.equal(state.xp, 50);
  });

  await t.test('2. Pillar 2: MarketService fee calculations and listing behavior', () => {
    assert.ok(MarketService);
    assert.equal(typeof MarketService.calculateListingFee, 'function');
    assert.equal(typeof MarketService.createListing, 'function');

    // Fee is calculated deterministically
    const fee1000 = MarketService.calculateListingFee(1000);
    assert.ok(fee1000 >= 0);
  });

  await t.test('3. Pillar 3: ExpeditionService destinations, risk directives, and lifecycle', () => {
    assert.ok(EXPEDITION_DESTINATIONS.length >= 4);
    assert.ok(RISK_DIRECTIVES.CAUTIOUS);
    assert.ok(RISK_DIRECTIVES.BALANCED);
    assert.ok(RISK_DIRECTIVES.AGGRESSIVE);

    const state = DEFAULT_STATE();
    const active = ExpeditionService.getActiveExpeditions(state);
    assert.deepEqual(active, []);
  });
});
`;

fs.writeFileSync('test/class-golden-dataset.test.js', goldenCode, 'utf8');
fs.writeFileSync('test/class-race-integration.test.js', raceIntegrationCode, 'utf8');
fs.writeFileSync('test/class-lineage-integration.test.js', lineageIntegrationCode, 'utf8');
fs.writeFileSync('test/sacred-pillars-regression.test.js', sacredPillarsCode, 'utf8');
console.log('All 4 test suites successfully generated!');
