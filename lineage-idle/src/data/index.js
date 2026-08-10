/**
 * index.js — Ponto de entrada centralizado para todos os dados do Lineage Idle.
 *
 * Em vez de acessar window.GameData diretamente pelo código, use D() daqui.
 * Todos os módulos de dados são re-exportados para facilitar imports centralizados.
 */

// ─── Core config ─────────────────────────────────────────────────────────────
export { D, SAVE_KEY, TIER_NAMES, ALL_EQUIP_SLOTS, HIGH_RARITIES, OFFLINE_EFFICIENCY, OFFLINE_MAX_MINUTES } from '../core/GameConfig.js';

// ─── Races & Classes (bridge EchoData) ───────────────────────────────────────
export { RACES, CLASSES, RACE_BASE_ATTRIBUTES, DWARF_CLASS, KAMAEL_CLASS } from './races.js';

// ─── Skill data (bridge EchoData via echo-adapter.js) ────────────────────────
/** Definições de skills (geradas por echo-adapter.js a partir de classes_echo.js) */
export const SKILL_DEFS        = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_DEFS_ECHO        : {};
export const SKILL_REQS        = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_REQS_ECHO        : {};
export const SKILL_TREE_LAYOUT = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.SKILL_TREE_LAYOUT_ECHO : {};
export const CLASS_SKILLS      = () => (typeof window !== 'undefined' && window.EchoData) ? window.EchoData.CLASS_SKILLS_ECHO      : {};

// ─── World data ───────────────────────────────────────────────────────────────
export { SAGAS, ZONES, ZONE_BACKGROUNDS } from './zones.js';
export { MONSTERS }                        from './monsters.js';
export { RAID_BOSSES }                     from './raids.js';

// ─── Game progression ─────────────────────────────────────────────────────────
export { QUEST_DEFS, BATTLE_PASS_TIERS, PASS_DEFS } from './quests.js';

// ─── Collections ──────────────────────────────────────────────────────────────
export { CODEX_SETS, BOSS_DOLLS } from './codex.js';

// ─── Items (via window.GameData, set by items.js side-effects) ───────────────
/** Lazy accessor para window.GameData — deve ser lido APÓS todos os imports avaliados */
export const GameData = () => window.GameData;
