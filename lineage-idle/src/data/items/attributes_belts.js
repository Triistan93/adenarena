/**
 * attributes_belts.js — Atributos Elementais, Síntese de Cintos (PvE) e Augmentation por Life Stones
 */

export const ELEMENT_OPPOSITES = {
  fire: 'water',
  water: 'fire',
  earth: 'wind',
  wind: 'earth',
  dark: 'holy',
  holy: 'dark'
};

export const ELEMENTAL_STONES = {
  fire_stone: { id: 'fire_stone', name: 'Pedra de Fogo 🔥', element: 'fire', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/fire_reagent.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Fogo.' },
  water_stone: { id: 'water_stone', name: 'Pedra de Água 💧', element: 'water', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/water_reagent.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Água.' },
  earth_stone: { id: 'earth_stone', name: 'Pedra de Terra 🌍', element: 'earth', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/compressed_stone.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Terra.' },
  wind_stone: { id: 'wind_stone', name: 'Pedra de Vento 🌪️', element: 'wind', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/white_gemstone.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Vento.' },
  dark_stone: { id: 'dark_stone', name: 'Pedra das Trevas 🌑', element: 'dark', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/dark_seed.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Trevas.' },
  holy_stone: { id: 'holy_stone', name: 'Pedra Sagrada ✨', element: 'holy', slot: 'material', type: 'elemental_stone', tier: 4, rarity: 'epic', price: 25000, icon: 'materials/holy_water.png', desc: 'Incuta em armas (+20) e armaduras (+6) para atributo Sagrado.' }
};

export const LIFE_STONE_ITEMS = {
  lifestone_common: { id: 'lifestone_common', name: 'Life Stone Comum 💎', grade: 'common', slot: 'material', type: 'lifestone', tier: 3, rarity: 'rare', price: 50000, icon: 'materials/crystal_blue_d.png', desc: 'Life Stone básica para Augmentation de armas.' },
  lifestone_mid: { id: 'lifestone_mid', name: 'Mid-Grade Life Stone 💎', grade: 'mid', slot: 'material', type: 'lifestone', tier: 4, rarity: 'epic', price: 150000, icon: 'materials/bluem_gemstone.png', desc: 'Mid-Grade Life Stone para Augmentation com maior chance de atributos.' },
  lifestone_high: { id: 'lifestone_high', name: 'High-Grade Life Stone 💎', grade: 'high', slot: 'material', type: 'lifestone', tier: 5, rarity: 'legendary', price: 400000, icon: 'materials/crystal_red_b.png', desc: 'High-Grade Life Stone com alta chance de Item Skills.' },
  lifestone_top: { id: 'lifestone_top', name: 'Top-Grade Life Stone 💎', grade: 'top', slot: 'material', type: 'lifestone', tier: 6, rarity: 'sovereign', price: 1000000, icon: 'materials/crystal_gold_s.png', desc: 'Top-Grade Life Stone suprema com 40% de Brilho e 25% de Item Skills Épicas.' }
};

export const BELT_ITEMS = {
  belt_cloth: { id: 'belt_cloth', name: 'Cinto de Pano [No-Grade]', slot: 'belt', tier: 1, rarity: 'common', price: 5000, icon: 'nograde/armors/armor_adventurer_belt.png', desc: 'Cinto simples de tecido. +500 Limite de Peso.' },
  belt_leather: { id: 'belt_leather', name: 'Cinto de Couro [D-Grade]', slot: 'belt', tier: 2, rarity: 'rare', price: 25000, icon: 'graded/armors/armor_brigandine_belt.png', desc: 'Cinto reforçado de couro. +1000 Limite de Peso, +10 P.Def.' },
  belt_iron: { id: 'belt_iron', name: 'Cinto de Ferro [C-Grade]', slot: 'belt', tier: 3, rarity: 'epic', price: 75000, icon: 'gradec/armors/armor_full_plate_belt.png', desc: 'Cinto cravado em ferro. +1500 Limite de Peso, +20 P.Def.' },
  belt_mithril: { id: 'belt_mithril', name: 'Cinto de Mithril [B-Grade]', slot: 'belt', tier: 4, rarity: 'epic', price: 200000, icon: 'gradeb/armors/armor_blue_wolf_belt.png', desc: 'Cinto encantado de Mithril. +2000 Limite de Peso, +35 P.Def.' },
  belt_blessed_top: { id: 'belt_blessed_top', name: 'Blessed Top-Grade Magic Ornament Belt [S]', slot: 'belt', tier: 6, rarity: 'legendary', price: 1000000, icon: 'gradespecial/armors/armor_nobless_belt.png', desc: 'Cinto Sagrado Supremo: +7.2% Defesa Geral (PvE), +6% Dano Físico e Skills.' }
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
  1: { rate: 0.30, label: 'Síntese de Cinto (30% Sucesso)' }
};

export const SUPERIOR_LIFE_STONE_AUGMENTS = [
  { id: 'might', name: 'Item Skill: Might', desc: 'P.Atk +8% (PvE Geral)', pAtkMult: 0.08 },
  { id: 'empower', name: 'Item Skill: Empower', desc: 'M.Atk +15% (PvE Geral)', mAtkMult: 0.15 },
  { id: 'shield', name: 'Item Skill: Shield', desc: 'P.Def +10% (PvE Geral)', pDefMult: 0.10 },
  { id: 'magicBarrier', name: 'Item Skill: Magic Barrier', desc: 'M.Def +12% (PvE Geral)', mDefMult: 0.12 },
  { id: 'focus', name: 'Item Skill: Focus', desc: 'P.Crit.Rate +50 pt.', critRateAdd: 50 },
  { id: 'wildMagic', name: 'Item Skill: Wild Magic', desc: 'M.Crit.Rate +4 pt.', mCritAdd: 4 },
  { id: 'vampiricRage', name: 'Item Skill: Vampiric Rage', desc: 'Vampiric Rage +6%', lifestealAdd: 0.06 }
];