// ═══════════════════════════════════════════
// SKILLS INDEX — Unificação Modular de Habilidades
// ═══════════════════════════════════════════

import { ACTIVE_SKILLS } from "./active.js";
import { PASSIVE_SKILLS } from "./passive.js";
import { BUFF_SKILLS } from "./buffs.js";

export const SKILL_DEFS = {
  ...ACTIVE_SKILLS,
  ...PASSIVE_SKILLS,
  ...BUFF_SKILLS
};

export { ACTIVE_SKILLS, PASSIVE_SKILLS, BUFF_SKILLS };
