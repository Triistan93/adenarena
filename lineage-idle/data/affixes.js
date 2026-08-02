// ========================================
// Special Affixes Database - Lineage Idle
// ========================================

export const AFFIX_POOL = [
  // ── STAT AFFIXES (type: 'stat') ──
  { id: 'crit_boost',      name: '+{value}% Crítico',           type: 'stat', stat: 'crit',      min: 3, max: 8 },
  { id: 'eva_boost',       name: '+{value}% Evasão',            type: 'stat', stat: 'eva',       min: 3, max: 8 },
  { id: 'lifesteal_boost', name: '+{value}% Roubo de Vida',    type: 'stat', stat: 'lifesteal', min: 2, max: 6 },
  { id: 'atk_boost',       name: '+{value}% Ataque',            type: 'stat', stat: 'atk',       min: 5, max: 15 },
  { id: 'speed_boost',     name: '+{value}% Vel. de Ataque',    type: 'stat', stat: 'speed',     min: 4, max: 10 },
  { id: 'def_boost',       name: '+{value}% Defesa Física',     type: 'stat', stat: 'def',       min: 5, max: 15 },
  { id: 'matk_boost',      name: '+{value}% Ataque Mágico',     type: 'stat', stat: 'matk',      min: 5, max: 15 },
  { id: 'mdef_boost',      name: '+{value}% Defesa Mágica',     type: 'stat', stat: 'mdef',      min: 5, max: 15 },
  { id: 'hp_boost',        name: '+{value}% HP Máximo',         type: 'stat', stat: 'hp',        min: 5, max: 20 },
  { id: 'mp_boost',        name: '+{value}% MP Máximo',         type: 'stat', stat: 'mp',        min: 5, max: 20 },

  // ── PROC / CONDITIONAL AFFIXES (type: 'proc') ──
  { id: 'boss_dmg',        name: '+{value}% Dano vs Chefes',    type: 'proc', proc: 'boss_dmg',     min: 8, max: 25 },
  { id: 'on_kill_heal',    name: '+{value}% Cura ao Matar',     type: 'proc', proc: 'on_kill_heal', min: 3, max: 10 },
  { id: 'stun_chance',     name: '{value}% Chance de Stun',     type: 'proc', proc: 'stun_chance',  min: 3, max: 8 },
  { id: 'undead_dmg',      name: '+{value}% Dano vs Mortos-Vivos', type: 'proc', proc: 'type_dmg', category: 'undead', min: 10, max: 30 },
  { id: 'dragon_dmg',      name: '+{value}% Dano vs Dragões',   type: 'proc', proc: 'type_dmg', category: 'dragon', min: 10, max: 30 },
  { id: 'beast_dmg',       name: '+{value}% Dano vs Bestas',    type: 'proc', proc: 'type_dmg', category: 'beast', min: 10, max: 30 },
  { id: 'demon_dmg',       name: '+{value}% Dano vs Demônios',  type: 'proc', proc: 'type_dmg', category: 'demon', min: 10, max: 30 },
  { id: 'humanoid_dmg',    name: '+{value}% Dano vs Humanoides',type: 'proc', proc: 'type_dmg', category: 'humanoid', min: 10, max: 30 }
];

export const AFFIX_MAP = Object.fromEntries(AFFIX_POOL.map(a => [a.id, a]));

export function getAffixCountForRarity(rarity) {
  const r = String(rarity || 'common').toLowerCase();
  const rand = Math.random();
  if (r === 'uncommon') {
    return rand < 0.50 ? 1 : 0;
  }
  if (r === 'rare') {
    return rand < 0.30 ? 2 : 1;
  }
  if (r === 'epic') {
    return rand < 0.20 ? 3 : 2;
  }
  if (r === 'legendary' || r === 'mythic' || r === 's') {
    if (rand < 0.10) return 4;
    if (rand < 0.40) return 3; // 10% 4, 30% 3 -> cumulative 40%
    return 2;
  }
  return 0;
}

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

if (typeof window !== 'undefined') {
  window.GameData = window.GameData || {};
  window.GameData.AFFIX_POOL = AFFIX_POOL;
  window.GameData.AFFIX_MAP = AFFIX_MAP;
  window.GameData.rollAffixes = rollAffixes;
  window.GameData.getAffixCountForRarity = getAffixCountForRarity;
}
