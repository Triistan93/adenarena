import test from 'node:test';
import assert from 'node:assert/strict';
import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import CANONICAL_RACES from '../lineage-idle/src/data/classes/CanonicalRaceRegistry.js';
import { ClassProgressionEngine } from '../lineage-idle/src/engine/ClassProgressionEngine.js';
import { isSkillInProgressionPath, resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';

test('ShineMaker promotions stay in the Dwarf lineage rooted at ShineMaker base', () => {
  assert.ok(CANONICAL_RACES.dwarf.baseClassIds.includes('shineMakerBase'));
  assert.equal(CLASSES_ECHO.shineMakerBase.race, 'dwarf');
  assert.equal(CLASSES_ECHO.shineMakerS1.race, 'dwarf');
  assert.equal(CLASSES_ECHO.shineMakerS1.parent, 'shineMakerBase');
  assert.equal(CLASSES_ECHO.shineMakerS2.race, 'dwarf');
  assert.equal(CLASSES_ECHO.shineMakerS3.race, 'dwarf');
  assert.equal(CLASSES_ECHO.shineMakerS2.parent, 'shineMakerS1');
  assert.equal(CLASSES_ECHO.shineMakerS3.parent, 'shineMakerS2');

  const promotions = ClassProgressionEngine.getPromotionOptions('shineMakerBase', 20, 'dwarf');
  assert.ok(promotions.some(option => option.targetClass.id === 'shineMakerS1'));
  const baseContext = resolveV2ClassContext('shineMakerBase', 'dwarf');
  assert.equal(baseContext.status, 'RESOLVED');
  assert.ok(baseContext.authorizedSkillIds.includes('shineMakerBase_light_spark'));
  assert.ok(isSkillInProgressionPath({ class: 'shineMakerBase', race: 'dwarf' }, 'shineMakerBase_light_spark'));
  assert.equal(resolveV2ClassContext('shineMakerBase', 'elf').status, 'UNRESOLVED', 'ShineMaker must remain Dwarf-exclusive');
});
