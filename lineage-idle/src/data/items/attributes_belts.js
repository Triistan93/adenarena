/**
 * M├│dulo de Atributos Elementais, S├¡ntese de Cintos (PvE) e Augmentation por Life Stones
 */

export const ELEMENT_OPPOSITES = {
  fire: 'water',
  water: 'fire',
  earth: 'wind',
  wind: 'earth',
  dark: 'divine',
  divine: 'dark'
};

export const ELEMENTAL_STONES = {
  fire_stone: { id: 'fire_stone', name: 'Fire Stone', element: 'fire', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 },
  water_stone: { id: 'water_stone', name: 'Water Stone', element: 'water', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 },
  earth_stone: { id: 'earth_stone', name: 'Earth Stone', element: 'earth', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 },
  wind_stone: { id: 'wind_stone', name: 'Wind Stone', element: 'wind', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 },
  dark_stone: { id: 'dark_stone', name: 'Dark Stone', element: 'dark', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 },
  divine_stone: { id: 'divine_stone', name: 'Divine Stone', element: 'divine', type: 'stone', bonusWpn: 5, firstWpn: 20, bonusArmor: 6 }
};

export function getAttributeDamageBonus(attackerAttr = 0, targetAttrDef = 0) {
  const diff = Math.max(0, attackerAttr - targetAttrDef);
  if (diff < 20) return 1.0;
  if (diff < 50) return 1.08 + (diff - 20) * (0.12 / 30);
  if (diff < 150) return 1.20;
  if (diff < 300) return 1.40;
  return 1.70;
}

export const BELT_COMPOUND_RATES = {
  1: { rate: 0.70, label: 'N├¡vel 1 (70% Sucesso)' },
  2: { rate: 0.25, label: 'N├¡vel 2 (25% Sucesso)' },
  3: { rate: 0.15, label: 'N├¡vel 3 (15% Sucesso)' }
};

export const BELT_GRADES = {
  blessed_top_belt: {
    id: 'blessed_top_belt',
    name: 'Blessed Top-Grade Magic Ornament Belt [S]',
    defBonus: 0.072,
    atkBonus: 0.060,
    skillDmgBonus: 0.060,
    desc: 'Cinto Sagrado: +7.2% Defesa Geral (PvE) & +6% Dano de Ataque F├¡sico e Skills'
  }
};

export const SUPERIOR_LIFE_STONE_AUGMENTS = [
  { id: 'might', name: 'Item Skill: Might', icon: 'ÔÜö´©Å', desc: 'P.Atk +8% (PvE Geral)', pAtkMult: 0.08 },
  { id: 'empower', name: 'Item Skill: Empower', icon: '­ƒö«', desc: 'M.Atk +15% (PvE Geral)', mAtkMult: 0.15 },
  { id: 'shield', name: 'Item Skill: Shield', icon: '­ƒøí´©Å', desc: 'P.Def +10% (PvE Geral)', pDefMult: 0.10 },
  { id: 'magicBarrier', name: 'Item Skill: Magic Barrier', icon: 'Ô£¿', desc: 'M.Def +12% (PvE Geral)', mDefMult: 0.12 },
  { id: 'focus', name: 'Item Skill: Focus', icon: '­ƒÄ»', desc: 'P.Crit.Rate +50 pt.', critRateAdd: 50 },
  { id: 'wildMagic', name: 'Item Skill: Wild Magic', icon: 'ÔÜí', desc: 'M.Crit.Rate +4 pt.', mCritAdd: 4 },
  { id: 'vampiricRage', name: 'Item Skill: Vampiric Rage', icon: '­ƒ®©', desc: 'Vampiric Rage +6% (Dano Convertido em HP)', lifestealAdd: 0.06 },
  { id: 'celestialShield', name: 'Item Skill: Lesser Celestial Shield', icon: '­ƒîƒ', desc: 'Invencibilidade Tempor├íria por 7s', celestial: true }
];