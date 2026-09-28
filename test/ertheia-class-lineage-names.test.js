import test from 'node:test';
import assert from 'node:assert/strict';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';
import { resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';

const expectedNames = {
  marauderBase: 'Ertheia Fighter',
  marauder: 'Marauder',
  ertheiaWarrior: 'Ripper',
  eviscerator: 'Eviscerator',
  sayhaMageBase: 'Ertheia Wizard',
  sayhaSeer: 'Cloud Breaker',
  windRiderErth: 'Stratomancer',
  sayhaSeeker: "Sayha's Seer"
};

const expectedParents = {
  marauderBase: null,
  marauder: 'marauderBase',
  ertheiaWarrior: 'marauder',
  eviscerator: 'ertheiaWarrior',
  sayhaMageBase: null,
  sayhaSeer: 'sayhaMageBase',
  windRiderErth: 'sayhaSeer',
  sayhaSeeker: 'windRiderErth'
};

test('Ertheia display names match their sourced class progression without changing save IDs', () => {
  for (const [id, name] of Object.entries(expectedNames)) {
    assert.equal(CANONICAL_CLASS_REGISTRY_V2[id]?.name, name, `V2 ${id}`);
    assert.equal(CANONICAL_CLASS_REGISTRY[id]?.name, name, `legacy registry ${id}`);
    assert.equal(CLASSES_ECHO[id]?.name, name, `Echo UI ${id}`);
  }
});

test('Ertheia class transfers retain their existing IDs and parent chain', () => {
  for (const [id, parentClass] of Object.entries(expectedParents)) {
    assert.equal(CANONICAL_CLASS_REGISTRY_V2[id]?.id, id);
    assert.equal(CANONICAL_CLASS_REGISTRY_V2[id]?.parentClass ?? null, parentClass, `V2 parent ${id}`);
    assert.equal(CANONICAL_CLASS_REGISTRY[id]?.id, id);
    assert.equal(CANONICAL_CLASS_REGISTRY[id]?.parentClass ?? null, parentClass, `legacy parent ${id}`);
    assert.equal(CLASSES_ECHO[id]?.parent ?? null, parentClass, `Echo parent ${id}`);
  }
});

test('sourced Ertheia class names resolve to the existing persisted class IDs', () => {
  for (const [name, id] of [
    ['Ripper', 'ertheiaWarrior'],
    ['Cloud Breaker', 'sayhaSeer'],
    ['Stratomancer', 'windRiderErth'],
    ["Sayha's Seer", 'sayhaSeeker'],
    ['Eviscerator Apprentice', 'ertheiaWarrior'],
    ['Sayha Seeker Apprentice', 'sayhaSeer'],
    ['Storm Conductor', 'windRiderErth'],
    ['Sayha Mystic', 'sayhaMageBase']
  ]) {
    assert.equal(resolveCanonicalClassId(name, 'ertheia'), id);
  }
});
