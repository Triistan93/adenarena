// ========================================
// Special Affixes Database - Lineage Idle
// ========================================

// ─── Pool Geral (fallback) ──────────────────────────────────────────────────
export const AFFIX_POOL = [
  { id: 'crit_boost',      name: '+{value}% Crítico',           type: 'stat', stat: 'crit',      min: 3,  max: 8  },
  { id: 'eva_boost',       name: '+{value}% Evasão',            type: 'stat', stat: 'eva',       min: 3,  max: 8  },
  { id: 'lifesteal_boost', name: '+{value}% Roubo de Vida',     type: 'stat', stat: 'lifesteal', min: 2,  max: 6  },
  { id: 'atk_boost',       name: '+{value}% Ataque',            type: 'stat', stat: 'atk',       min: 5,  max: 15 },
  { id: 'speed_boost',     name: '+{value}% Vel. de Ataque',    type: 'stat', stat: 'speed',     min: 4,  max: 10 },
  { id: 'def_boost',       name: '+{value}% Defesa Física',     type: 'stat', stat: 'def',       min: 5,  max: 15 },
  { id: 'matk_boost',      name: '+{value}% Ataque Mágico',     type: 'stat', stat: 'matk',      min: 5,  max: 15 },
  { id: 'mdef_boost',      name: '+{value}% Defesa Mágica',     type: 'stat', stat: 'mdef',      min: 5,  max: 15 },
  { id: 'hp_boost',        name: '+{value}% HP Máximo',         type: 'stat', stat: 'hp',        min: 5,  max: 20 },
  { id: 'mp_boost',        name: '+{value}% MP Máximo',         type: 'stat', stat: 'mp',        min: 5,  max: 20 },
  { id: 'boss_dmg',        name: '+{value}% Dano vs Chefes',    type: 'proc', proc: 'boss_dmg',     min: 8,  max: 25 },
  { id: 'on_kill_heal',    name: '+{value}% Cura ao Matar',     type: 'proc', proc: 'on_kill_heal', min: 3,  max: 10 },
  { id: 'stun_chance',     name: '{value}% Chance de Stun',     type: 'proc', proc: 'stun_chance',  min: 3,  max: 8  },
  { id: 'undead_dmg',      name: '+{value}% Dano vs Mortos-Vivos', type: 'proc', proc: 'type_dmg', category: 'undead',   min: 10, max: 30 },
  { id: 'dragon_dmg',      name: '+{value}% Dano vs Dragões',   type: 'proc', proc: 'type_dmg', category: 'dragon',    min: 10, max: 30 },
  { id: 'beast_dmg',       name: '+{value}% Dano vs Bestas',    type: 'proc', proc: 'type_dmg', category: 'beast',     min: 10, max: 30 },
  { id: 'demon_dmg',       name: '+{value}% Dano vs Demônios',  type: 'proc', proc: 'type_dmg', category: 'demon',     min: 10, max: 30 },
  { id: 'humanoid_dmg',    name: '+{value}% Dano vs Humanoides',type: 'proc', proc: 'type_dmg', category: 'humanoid',  min: 10, max: 30 },
];

// ─── Pools Temáticos por Tipo de Item ──────────────────────────────────────
// Garantidos = sempre aparecem (primeiro slot temático)
// Extras = preenchem slots adicionais aleatoriamente

export const AFFIX_POOLS_THEMED = {
  // Armaduras
  robe: {
    guaranteed: ['matk_boost', 'mp_boost'],
    extra:      ['mdef_boost', 'speed_boost', 'on_kill_heal'],
  },
  light: {
    guaranteed: ['crit_boost', 'eva_boost'],
    extra:      ['atk_boost', 'speed_boost', 'lifesteal_boost'],
  },
  heavy: {
    guaranteed: ['def_boost', 'hp_boost'],
    extra:      ['mdef_boost', 'atk_boost', 'stun_chance'],
  },
  // Armas
  bow: {
    guaranteed: ['crit_boost', 'eva_boost'],
    extra:      ['atk_boost', 'speed_boost', 'boss_dmg'],
  },
  staff: {
    guaranteed: ['matk_boost', 'mp_boost'],
    extra:      ['mdef_boost', 'speed_boost', 'on_kill_heal'],
  },
  dagger: {
    guaranteed: ['crit_boost', 'lifesteal_boost'],
    extra:      ['eva_boost', 'atk_boost', 'speed_boost'],
  },
  melee: {
    guaranteed: ['atk_boost'],
    extra:      ['crit_boost', 'speed_boost', 'lifesteal_boost', 'stun_chance'],
  },
  blunt: {
    guaranteed: ['atk_boost', 'stun_chance'],
    extra:      ['def_boost', 'hp_boost', 'speed_boost'],
  },
  spear: {
    guaranteed: ['atk_boost'],
    extra:      ['def_boost', 'hp_boost', 'stun_chance', 'speed_boost'],
  },
};

export const AFFIX_MAP = Object.fromEntries(AFFIX_POOL.map(a => [a.id, a]));

export function getAffixCountForRarity(rarity) {
  const r = String(rarity || 'common').toLowerCase();
  const rand = Math.random();
  if (r === 'uncommon')  return rand < 0.50 ? 1 : 0;
  if (r === 'rare')      return rand < 0.30 ? 2 : 1;
  if (r === 'epic')      return rand < 0.20 ? 3 : 2;
  if (r === 'legendary' || r === 'mythic' || r === 's') {
    if (rand < 0.10) return 4;
    if (rand < 0.40) return 3;
    return 2;
  }
  return 0;
}

/**
 * Rola afixos genéricos (sem tema).
 */
export function rollAffixes(rarity) {
  const count = getAffixCountForRarity(rarity);
  if (count <= 0) return [];
  const pool = [...AFFIX_POOL];
  const rolled = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const affixDef = pool.splice(idx, 1)[0];
    const val = affixDef.min + Math.floor(Math.random() * (affixDef.max - affixDef.min + 1));
    rolled.push({ id: affixDef.id, value: val });
  }
  return rolled;
}

/**
 * Rola afixos temáticos para um tipo de item.
 * Garante que o primeiro afixo seja sempre relevante ao tipo.
 *
 * @param {string} rarity  — 'common'|'uncommon'|'rare'|'epic'|'legendary'
 * @param {string} [itemType] — 'robe'|'light'|'heavy'|'bow'|'staff'|'dagger'|'melee'|'blunt'|'spear'
 * @returns {{ id: string, value: number }[]}
 */
export function rollAffixesForItem(rarity, itemType) {
  const count = getAffixCountForRarity(rarity);
  if (count <= 0) return [];

  const theme = AFFIX_POOLS_THEMED[itemType];
  if (!theme) return rollAffixes(rarity); // fallback genérico

  const used = new Set();
  const rolled = [];

  // Slot 1: sempre um afixo garantido do tema
  const guaranteed = theme.guaranteed[Math.floor(Math.random() * theme.guaranteed.length)];
  const gDef = AFFIX_MAP[guaranteed];
  if (gDef) {
    used.add(gDef.id);
    const val = gDef.min + Math.floor(Math.random() * (gDef.max - gDef.min + 1));
    rolled.push({ id: gDef.id, value: val });
  }

  // Slots adicionais: mistura de extra temáticos + pool geral
  const remainingTheme = theme.extra.filter(id => !used.has(id));
  const general = AFFIX_POOL.filter(a => !used.has(a.id));

  // 60% chance de cada slot adicional ser temático, 40% geral
  for (let i = 1; i < count; i++) {
    const useTheme = Math.random() < 0.6 && remainingTheme.length > 0;
    if (useTheme) {
      const idx = Math.floor(Math.random() * remainingTheme.length);
      const id = remainingTheme.splice(idx, 1)[0];
      const def = AFFIX_MAP[id];
      if (def) {
        used.add(id);
        general.splice(general.findIndex(a => a.id === id), 1);
        const val = def.min + Math.floor(Math.random() * (def.max - def.min + 1));
        rolled.push({ id: def.id, value: val });
      }
    } else if (general.length > 0) {
      const idx = Math.floor(Math.random() * general.length);
      const def = general.splice(idx, 1)[0];
      used.add(def.id);
      const val = def.min + Math.floor(Math.random() * (def.max - def.min + 1));
      rolled.push({ id: def.id, value: val });
    }
  }

  return rolled;
}

if (typeof window !== 'undefined') {
  window.GameData = window.GameData || {};
  window.GameData.AFFIX_POOL        = AFFIX_POOL;
  window.GameData.AFFIX_MAP         = AFFIX_MAP;
  window.GameData.AFFIX_POOLS_THEMED = AFFIX_POOLS_THEMED;
  window.GameData.rollAffixes        = rollAffixes;
  window.GameData.rollAffixesForItem = rollAffixesForItem;
  window.GameData.getAffixCountForRarity = getAffixCountForRarity;
}

