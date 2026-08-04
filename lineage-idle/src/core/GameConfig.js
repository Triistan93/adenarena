/**
 * GameConfig — Constantes globais de configuração do jogo.
 * Centraliza valores que antes estavam espalhados pelo main.js.
 */

/** Chave de salvamento no localStorage */
export const SAVE_KEY = 'lineageIdleSave_v2';

/** Lazy accessor para window.GameData (definido pelo items.js via side-effects) */
export const D = () => window.GameData;

/** Nomes dos tiers da árvore de skills (índice = tier 0..4) */
export const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];

/** Slots de equipamento válidos */
export const ALL_EQUIP_SLOTS = ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'earring', 'necklace', 'cape', 'belt'];

/** Raridades consideradas "high value" (não vendidas automaticamente no batch sell) */
export const HIGH_RARITIES = ['epic', 'legendary'];

/** Referências rápidas para classes especiais (usadas em lógicas de check de raça) */
export const DWARF_CLASS_ID = 'artisan';
export const KAMAEL_CLASS_ID = 'soulbreaker';

/** Dimensões dos nós na árvore de skills (usadas em updateSkillUI) */
export const TREE_NODE_W = 90;
export const TREE_NODE_H = 90;
export const TREE_NODE_PAD = 20;

/** Constante de eficiência do progresso offline (30% da hunt online) */
export const OFFLINE_EFFICIENCY = 0.30;

/** Máximo de minutos de progresso offline computados de uma vez */
export const OFFLINE_MAX_MINUTES = 480;
