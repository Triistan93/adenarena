/**
 * index.js ÔÇö Ponto de entrada centralizado para todos os dados do Lineage Idle.
 *
 * Em vez de acessar window.GameData diretamente pelo c├│digo, use D() daqui.
 * Todos os m├│dulos de dados s├úo re-exportados para facilitar imports centralizados.
 */

// ÔöÇÔöÇÔöÇ Core config ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export { D, SAVE_KEY, TIER_NAMES, ALL_EQUIP_SLOTS, HIGH_RARITIES, OFFLINE_EFFICIENCY, OFFLINE_MAX_MINUTES } from '../core/GameConfig.js';

// ÔöÇÔöÇÔöÇ Races & Classes (bridge EchoData) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export { RACES, CLASSES, RACE_BASE_ATTRIBUTES, DWARF_CLASS, KAMAEL_CLASS } from './races.js';

// ÔöÇÔöÇÔöÇ Skill data (bridge EchoData via echo-adapter.js) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
/** Defini├º├Áes de skills (geradas por echo-adapter.js a partir de classes_echo.js) */
export const SKILL_DEFS        = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO        : {};
export const SKILL_REQS        = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_REQS_ECHO        : {};
export const SKILL_TREE_LAYOUT = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_TREE_LAYOUT_ECHO : {};
export const CLASS_SKILLS      = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.CLASS_SKILLS_ECHO      : {};

// ÔöÇÔöÇÔöÇ World data ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export { SAGAS, ZONES, ZONE_BACKGROUNDS } from './zones.js';
export { MONSTERS }                        from './monsters.js';
export { RAID_BOSSES }                     from './raids.js';

// ÔöÇÔöÇÔöÇ Game progression ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export { QUEST_DEFS, BATTLE_PASS_TIERS, PASS_DEFS } from './quests.js';

// ÔöÇÔöÇÔöÇ Collections ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export { CODEX_SETS, BOSS_DOLLS } from './codex.js';

// ÔöÇÔöÇÔöÇ Items (via window.GameData, set by items.js side-effects) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
/** Lazy accessor para window.GameData ÔÇö deve ser lido AP├ôS todos os imports avaliados */
export const GameData = () => window.GameData;