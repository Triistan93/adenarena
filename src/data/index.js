// ═══════════════════════════════════════════
// DATA INDEX — Ponto Único de Entrada Modular
// ═══════════════════════════════════════════

import { RACES } from "./races.js";

// Classes por Raça
import { HUMAN_CLASSES } from "./classes/human.js";
import { ELF_CLASSES } from "./classes/elf.js";
import { DARKELF_CLASSES } from "./classes/darkElf.js";
import { ORC_CLASSES } from "./classes/orc.js";
import { DWARF_CLASSES } from "./classes/dwarf.js";
import { KAMAEL_CLASSES } from "./classes/kamael.js";
import { SYLPH_CLASSES } from "./classes/sylph.js";
import { HIGHELF_CLASSES } from "./classes/highElf.js";
import { ERTHEIA_CLASSES } from "./classes/ertheia.js";

// Skills & Icons
import { SKILL_DEFS, ACTIVE_SKILLS, PASSIVE_SKILLS, BUFF_SKILLS } from "./skills/index.js";
import { SKILL_ICONS, getSkillIcon } from "./icons/skillIcons.js";

// Consolidação de todas as classes
export const CLASSES = {
  ...HUMAN_CLASSES,
  ...ELF_CLASSES,
  ...DARKELF_CLASSES,
  ...ORC_CLASSES,
  ...DWARF_CLASSES,
  ...KAMAEL_CLASSES,
  ...SYLPH_CLASSES,
  ...HIGHELF_CLASSES,
  ...ERTHEIA_CLASSES
};

export {
  RACES,
  HUMAN_CLASSES,
  ELF_CLASSES,
  DARKELF_CLASSES,
  ORC_CLASSES,
  DWARF_CLASSES,
  KAMAEL_CLASSES,
  SYLPH_CLASSES,
  HIGHELF_CLASSES,
  ERTHEIA_CLASSES,
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
