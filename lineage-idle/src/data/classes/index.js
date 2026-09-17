/**
 * index.js — Módulo central de Classes do Echo of Elements (L2 Essence 547).
 *
 * Exporta RACES_ECHO e CLASSES_ECHO e registra window.EchoData e window.GameData para compatibilidade.
 */

import { RACES_ECHO } from './races_echo.js';
import { CLASSES_ECHO } from './classes_echo_defs.js';
import { CLASS_ALIASES, resolveCanonicalClassId, resolveCanonicalDagClassId, getCanonicalCharacterClass } from './class_aliases.js';
import { CANONICAL_CLASS_REGISTRY } from './CanonicalClassRegistry.js';
import { CanonicalClassGraph } from './CanonicalClassGraph.js';
import { CANONICAL_RACES } from './CanonicalRaceRegistry.js';

if (typeof window !== 'undefined') {
  window.EchoData = window.EchoData || {};
  window.EchoData.CANONICAL_CLASS_REGISTRY = CANONICAL_CLASS_REGISTRY;
  window.EchoData.CanonicalClassGraph = CanonicalClassGraph;
  window.EchoData.CANONICAL_RACES = CANONICAL_RACES;
  window.EchoData.RACES_ECHO = RACES_ECHO;
  window.EchoData.CLASSES_ECHO = CLASSES_ECHO;
  window.EchoData.CLASS_ALIASES = CLASS_ALIASES;
  window.EchoData.resolveCanonicalClassId = resolveCanonicalClassId;
  window.EchoData.resolveCanonicalDagClassId = resolveCanonicalDagClassId;
  window.EchoData.getCanonicalCharacterClass = getCanonicalCharacterClass;

  window.GameData = window.GameData || {};
  window.GameData.CANONICAL_CLASS_REGISTRY = CANONICAL_CLASS_REGISTRY;
  window.GameData.CanonicalClassGraph = CanonicalClassGraph;
  window.GameData.CANONICAL_RACES = CANONICAL_RACES;
  window.GameData.RACES_ECHO = RACES_ECHO;
  window.GameData.CLASSES_ECHO = CLASSES_ECHO;
  window.GameData.CLASS_ALIASES = CLASS_ALIASES;
  window.GameData.resolveCanonicalClassId = resolveCanonicalClassId;
  window.GameData.resolveCanonicalDagClassId = resolveCanonicalDagClassId;
  window.GameData.getCanonicalCharacterClass = getCanonicalCharacterClass;
}

export { 
  CANONICAL_CLASS_REGISTRY,
  CanonicalClassGraph,
  CANONICAL_RACES,
  RACES_ECHO, 
  CLASSES_ECHO, 
  CLASS_ALIASES, 
  resolveCanonicalClassId, 
  resolveCanonicalDagClassId, 
  getCanonicalCharacterClass 
};


