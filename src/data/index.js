// ═══════════════════════════════════════════
// DATA INDEX — Ponto Único de Entrada Modular
// ═══════════════════════════════════════════

import { RACES } from "./races.js";
import { CANONICAL_CLASS_REGISTRY } from "../../lineage-idle/src/data/classes/CanonicalClassRegistry.js";

// Skills & Icons
import { SKILL_DEFS, ACTIVE_SKILLS, PASSIVE_SKILLS, BUFF_SKILLS } from "./skills/index.js";
import { SKILL_ICONS, getSkillIcon } from "./icons/skillIcons.js";

// Consolidação de todas as classes canônicas
export const CLASSES = CANONICAL_CLASS_REGISTRY;

export {
  RACES,
  CLASSES,
  SKILL_DEFS,
  ACTIVE_SKILLS,
  PASSIVE_SKILLS,
  BUFF_SKILLS,
  SKILL_ICONS,
  getSkillIcon
};

// Global expose para compatibilidade com o jogo vanilla/idle
if (typeof window !== 'undefined') {
  window.GameData = window.GameData || {};
  window.GameData.RACES = { ...(window.GameData.RACES || {}), ...RACES };
  window.GameData.CLASSES = { ...(window.GameData.CLASSES || {}), ...CLASSES };
  window.GameData.SKILL_DEFS = { ...(window.GameData.SKILL_DEFS || {}), ...SKILL_DEFS };
}
