/**
 * augmentation.js — Catálogo de Life Stones, Gemstones e Habilidades de Itens (Item Skills).
 *
 * Contém o sistema de refinamento de armas por Ferreiros de Aden.
 */

export const LIFE_STONES = {
  life_stone_28: {
    id: 'life_stone_28',
    name: 'Life Stone - Level 28 (D-Grade)',
    grade: 'normal',
    level: 28,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_d.png',
    priceAdena: 25000,
    glowChance: 0.15,
    skillChance: 0.10,
    statMultiplier: 0.6,
    gemstonesNeeded: 5,
    gemstoneGrade: 'D',
    desc: 'Pedra da Vida de Nível 28 para armas D-Grade. Concede atributos de combate básicos.'
  },
  life_stone_34: {
    id: 'life_stone_34',
    name: 'Mid Life Stone - Level 34 (D-Grade TOP)',
    grade: 'mid',
    level: 34,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_d.png',
    priceAdena: 50000,
    glowChance: 0.30,
    skillChance: 0.20,
    statMultiplier: 0.8,
    gemstonesNeeded: 8,
    gemstoneGrade: 'D',
    desc: 'Pedra da Vida intermediária para armas D-Grade. Boa chance de rolagem de atributos raros.'
  },
  life_stone_40: {
    id: 'life_stone_40',
    name: 'Top Life Stone - Level 40 (C-Grade)',
    grade: 'high',
    level: 40,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_c.png',
    priceAdena: 120000,
    glowChance: 0.50,
    skillChance: 0.35,
    statMultiplier: 1.0,
    gemstonesNeeded: 10,
    gemstoneGrade: 'C',
    desc: 'Pedra da Vida superior de Nível 40 para armas C-Grade. Alta probabilidade de Glow e Habilidades de Item.'
  },
  life_stone_mid_76: {
    id: 'life_stone_mid_76',
    name: 'Mid-Grade Life Stone - Level 76 💠',
    grade: 'mid',
    level: 76,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_a.png',
    priceAdena: 2000000,
    glowChance: 0.35,
    skillChance: 0.20,
    statMultiplier: 1.2,
    desc: 'Pedra da Vida de Grau Médio para armas de Nível 76+. Concede atributos extras e chance de brilho arcano.'
  },
  life_stone_high_76: {
    id: 'life_stone_high_76',
    name: 'High-Grade Life Stone - Level 76 🔮',
    grade: 'high',
    level: 76,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    priceAdena: 5000000,
    glowChance: 0.70,
    skillChance: 0.45,
    statMultiplier: 1.5,
    desc: 'Pedra da Vida de Alto Grau para armas de Nível 76+. Alta probabilidade de Glow de Arma e Item Skill.'
  },
  life_stone_top_76: {
    id: 'life_stone_top_76',
    name: 'Top-Grade Life Stone - Level 76 👑💎',
    grade: 'top',
    level: 76,
    icon: 'gradespecial/scrolls/scroll_blessed_weapon_s.png',
    priceAdena: 12000000,
    glowChance: 1.0,
    skillChance: 0.75,
    statMultiplier: 2.0,
    desc: 'A mais pura e lendária Pedra da Vida de Aden. 100% de garantia de Glow e altíssima chance de Habilidades de Item (Item Skills) raras!'
  }
};

export const ITEM_SKILLS = [
  {
    id: 'item_skill_active_might',
    name: 'Item Skill: Active Might ⚔️',
    type: 'active',
    desc: 'Aumenta o P.Atk físico em +15% temporariamente.',
    stats: { pAtkPercent: 0.15 }
  },
  {
    id: 'item_skill_active_shield',
    name: 'Item Skill: Active Shield 🛡️',
    type: 'active',
    desc: 'Aumenta a P.Def física em +15% temporariamente.',
    stats: { pDefPercent: 0.15 }
  },
  {
    id: 'item_skill_active_wild_magic',
    name: 'Item Skill: Active Wild Magic 🔮',
    type: 'active',
    desc: 'Aumenta a Taxa de Crítico Mágico em +25%.',
    stats: { magicCritPercent: 0.25 }
  },
  {
    id: 'item_skill_active_heal',
    name: 'Item Skill: Active Greater Heal 💚',
    type: 'active',
    desc: 'Recupera instantaneamente +3.000 pontos de HP.',
    stats: { instantHeal: 3000 }
  },
  {
    id: 'item_skill_passive_focus',
    name: 'Item Skill: Passive Focus 🎯',
    type: 'passive',
    desc: 'Aumenta permanentemente a Taxa de Crítico em +30 pontos.',
    stats: { critBonus: 30 }
  },
  {
    id: 'item_skill_passive_clarity',
    name: 'Item Skill: Passive Clarity 💧',
    type: 'passive',
    desc: 'Reduz o consumo de MP de todas as habilidades em -15%.',
    stats: { mpReductionPercent: 0.15 }
  },
  {
    id: 'item_skill_passive_duel',
    name: 'Item Skill: Passive Duel Might 🏆',
    type: 'passive',
    desc: 'Aumenta o dano causado em duelos da Grand Olympiad e PvP em +12%.',
    stats: { pvpDamagePercent: 0.12 }
  },
  {
    id: 'item_skill_chance_stun',
    name: 'Item Skill: Chance Stun ⚡',
    type: 'chance',
    desc: '15% de chance de atordoar o alvo por 2 turnos ao desferir ataques normais.',
    stats: { stunChance: 0.15 }
  }
];

export const STAT_ROLL_POOL = [
  { name: '+P.Atk', key: 'atk', min: 15, max: 45 },
  { name: '+M.Atk', key: 'matk', min: 20, max: 60 },
  { name: '+P.Def', key: 'def', min: 15, max: 40 },
  { name: '+M.Def', key: 'mdef', min: 18, max: 50 },
  { name: '+Max HP', key: 'hp', min: 200, max: 650 },
  { name: '+Max CP', key: 'cp', min: 250, max: 800 },
  { name: '+Critical Rate', key: 'crit', min: 5, max: 18 },
  { name: '+Evasion', key: 'eva', min: 3, max: 8 }
];
