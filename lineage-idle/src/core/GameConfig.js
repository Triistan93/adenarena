/**
 * GameConfig — Constantes globais de configuração do jogo.
 */

/** Chave de salvamento no localStorage */
export const SAVE_KEY = 'lineageIdleSave_v2';

/** Lazy accessor para window.GameData */
export const D = () => window.GameData;

/** Nomes dos tiers da árvore de skills */
export const TIER_NAMES = ['Foundation', 'Discipline', 'Mastery', 'Ascendancy', 'Legend'];

/**
 * Slots de equipamento válidos - 18 slots do paperdoll real
 */
export const ALL_EQUIP_SLOTS = [
  'weapon', 'shield',
  'helmet', 'armor', 'gloves', 'legs', 'boots',
  'cloak', 'belt',
  'necklace', 'earring1', 'earring2', 'ring', 'ring2',
  'hair', 'hair2', 'agathion', 'talisman'
];

/** Raridades high value */
export const HIGH_RARITIES = ['epic', 'legendary'];

export const DWARF_CLASS_ID = 'artisan';
export const KAMAEL_CLASS_ID = 'soulbreaker';

export const TREE_NODE_W = 90;
export const TREE_NODE_H = 90;
export const TREE_NODE_PAD = 20;

export const OFFLINE_EFFICIENCY = 0.30;
export const OFFLINE_MAX_MINUTES = 480;
