/**
 * index.js — Módulo central de Classes do Echo of Elements (L2 Essence 547).
 *
 * Exporta RACES_ECHO e CLASSES_ECHO e registra window.EchoData e window.GameData para compatibilidade.
 */

import { RACES_ECHO } from './races_echo.js';
import { CLASSES_ECHO } from './classes_echo_defs.js';

if (typeof window !== 'undefined') {
  window.EchoData = window.EchoData || {};
  window.EchoData.RACES_ECHO = RACES_ECHO;
  window.EchoData.CLASSES_ECHO = CLASSES_ECHO;

  window.GameData = window.GameData || {};
  window.GameData.RACES_ECHO = RACES_ECHO;
  window.GameData.CLASSES_ECHO = CLASSES_ECHO;
}

export { RACES_ECHO, CLASSES_ECHO };
