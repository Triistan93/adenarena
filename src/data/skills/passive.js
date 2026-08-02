// ═══════════════════════════════════════════
// SKILLS — Passive Mastery & Stat Boost Skills
// ═══════════════════════════════════════════

export const PASSIVE_SKILLS = {
  weapon_mastery_f: {
    id: "weapon_mastery_f",
    name: "Weapon Mastery",
    type: "passive",
    rarity: "1★",
    cost: 5,
    max: 10,
    reqLvl: 1,
    tier: 0,
    icon: "🗡️",
    desc: "Aumenta o P.Atk base em +2.5 por nível.",
    // NOVO: Valores reais para o motor calcular
    bonuses: { atk: 2.5 } 
  },
  light_armor_f: {
    id: "light_armor_f",
    name: "Light Armor Mastery",
    type: "passive",
    rarity: "1★",
    cost: 10,
    max: 5,
    reqLvl: 20,
    tier: 1,
    icon: "🥋",
    desc: "Aumenta a P.Def e Esquiva com armadura leve.",
    bonuses: { def: 2.0, eva: 1.0 }
  },
  heavy_armor_f: {
    id: "heavy_armor_f",
    name: "Heavy Armor Mastery",
    type: "passive",
    rarity: "1★",
    cost: 10,
    max: 5,
    reqLvl: 20,
    tier: 1,
    icon: "🛡️",
    desc: "Aumenta a P.Def em +2.5 por nível ao usar armadura pesada.",
    bonuses: { def: 2.5 }
  },
  boost_hp_f: {
    id: "boost_hp_f",
    name: "Boost HP",
    type: "passive",
    rarity: "1★",
    cost: 10,
    max: 5,
    reqLvl: 20,
    tier: 1,
    icon: "❤️",
    desc: "Aumenta o HP Máximo em +40 por nível.",
    bonuses: { hp: 40 }
  },
  weapon_mastery_m: {
    id: "weapon_mastery_m",
    name: "Magical Weapon Mastery",
    type: "passive",
    rarity: "1★",
    cost: 5,
    max: 10,
    reqLvl: 1,
    tier: 0,
    icon: "🔮",
    desc: "Aumenta o M.Atk em +2.5 por nível.",
    bonuses: { matk: 2.5 }
  },
  robe_mast_m: {
    id: "robe_mast_m",
    name: "Robe Mastery",
    type: "passive",
    rarity: "1★",
    cost: 10,
    max: 5,
    reqLvl: 1,
    tier: 0,
    icon: "👘",
    desc: "Aumenta a P.Def em robes e acelera regeneração de MP.",
    bonuses: { def: 1.5, mpRegen: 2.0 }
  },
  boost_mana_m: {
    id: "boost_mana_m",
    name: "Boost Mana",
    type: "passive",
    rarity: "1★",
    cost: 10,
    max: 5,
    reqLvl: 20,
    tier: 1,
    icon: "🌊",
    desc: "Aumenta o MP Máximo em +40 por nível.",
    bonuses: { mp: 40 }
  },
  anti_magic_m: {
    id: "anti_magic_m",
    name: "Anti Magic",
    type: "passive",
    rarity: "1★",
    cost: 15,
    max: 5,
    reqLvl: 20,
    tier: 1,
    icon: "🛡️✨",
    desc: "Aumenta a M.Def em +18 e resistência mágica.",
    bonuses: { mdef: 18 }
  },
  dual_weapon_mast: {
    id: "dual_weapon_mast",
    name: "Dual Weapon Mastery",
    type: "passive",
    rarity: "2★",
    cost: 20,
    max: 5,
    reqLvl: 40,
    tier: 2,
    icon: "⚔️",
    desc: "Aumenta em +15% o P.Atk ao empunhar espadas duplas.",
    bonuses: { atkPct: 15 } // Porcentagem
  }
};
