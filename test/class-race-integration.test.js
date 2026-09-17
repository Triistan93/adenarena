/**
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
      assert.ok(raceDef, `Race ${raceId} must exist`);
      const baseClasses = CanonicalClassGraph.getBaseClassesForRace(raceId);
      assert.ok(baseClasses.length > 0, `Race ${raceId} must have base classes`);
      for (const b of baseClasses) {
        assert.equal(b.stage, 0, `Class ${b.id} must be Stage 0`);
        assert.equal(b.race, raceId, `Class ${b.id} must match race ${raceId}`);
      }
    }
  });

  await t.test('3. StateManager applyStarterKit initializes valid state for all 25 Stage 0 base classes', () => {
    const allRoots = CanonicalClassGraph.getRootClasses();
    assert.equal(allRoots.length, 25);

    for (const root of allRoots) {
      const state = DEFAULT_STATE();
      applyStarterKit(state, root.race, root.id, `TestHero_${root.id}`, 'M');

      assert.equal(state.race, root.race, `State race must equal ${root.race}`);
      assert.equal(state.class, root.id, `State class must equal ${root.id}`);
      assert.equal(state.level, 1);
      assert.ok(state.inventory.length >= 2, 'Must have at least weapon and armor in inventory');
      assert.ok(state.equipment.weapon, 'Must have starter weapon equipped');
      assert.ok(state.equipment.armor, 'Must have starter armor equipped');

      const isMage = ClassValidationService.isMageClass(root.id);
      const shotItem = state.inventory.find(i => i.itemId.includes('shot'));
      assert.ok(shotItem, `Class ${root.id} must have starter shots`);
      if (isMage) {
        assert.equal(shotItem.itemId, 'spiritshot_ng', `Mage class ${root.id} must start with spiritshot_ng`);
      } else {
        assert.equal(shotItem.itemId, 'soulshot_ng', `Fighter class ${root.id} must start with soulshot_ng`);
      }
    }
  });
});
