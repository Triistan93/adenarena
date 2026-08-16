/**
 * classes_echo.js — Ponte de Compatibilidade do Lineage 2 Essence Echo of Elements
 * 
 * Re-exporta as definições canônicas de RACES_ECHO, CLASSES_ECHO, CLASS_ALIASES
 * e resolveCanonicalClassId a partir do módulo central src/data/classes/index.js.
 */

import { RACES_ECHO, CLASSES_ECHO, CLASS_ALIASES, resolveCanonicalClassId } from '../src/data/classes/index.js';

if (typeof window !== 'undefined') {
  window.EchoData = window.EchoData || {};
  window.EchoData.RACES_ECHO = RACES_ECHO;
  window.EchoData.CLASSES_ECHO = CLASSES_ECHO;
  window.EchoData.CLASS_ALIASES = CLASS_ALIASES;
  window.EchoData.resolveCanonicalClassId = resolveCanonicalClassId;

  window.GameData = window.GameData || {};
  window.GameData.RACES_ECHO = RACES_ECHO;
  window.GameData.CLASSES_ECHO = CLASSES_ECHO;
  window.GameData.CLASS_ALIASES = CLASS_ALIASES;
  window.GameData.resolveCanonicalClassId = resolveCanonicalClassId;
}

export { RACES_ECHO, CLASSES_ECHO, CLASS_ALIASES, resolveCanonicalClassId };
