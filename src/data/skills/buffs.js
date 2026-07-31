// ═══════════════════════════════════════════
// SKILLS — Buffs & Harmonies (Self-Buff, Party-Buff, Warcry)
// ═══════════════════════════════════════════

export const BUFF_SKILLS = {
  fighter_will: {
    id: "fighter_will",
    name: "Fighter's Will",
    type: "buff",
    rarity: "1★",
    cost: 5,
    max: 5,
    reqLvl: 1,
    tier: 0,
    icon: "⚔️✨",
    effect: "warcry",
    baseCd: 60000,
    info: "+15% P.Atk, +10% Atk Speed e +15 Velocidade de Movimento (20 min)."
  },
  mage_will: {
    id: "mage_will",
    name: "Mage's Will",
    type: "buff",
    rarity: "1★",
    cost: 5,
    max: 5,
    reqLvl: 1,
    tier: 0,
    icon: "🔮✨",
    effect: "warcry",
    baseCd: 60000,
    info: "+15% M.Atk, +10% Cast Speed e +50 MP Máximo (20 min)."
  },
  war_cry: {
    id: "war_cry",
    name: "War Cry",
    type: "buff",
    rarity: "2★",
    cost: 25,
    max: 5,
    reqLvl: 40,
    tier: 2,
    icon: "📯",
    effect: "warcry",
    baseCd: 60000,
    info: "+20% P.Atk temporário durante 60 segundos."
  },
  battle_roar: {
    id: "battle_roar",
    name: "Battle Roar",
    type: "buff",
    rarity: "2★",
    cost: 20,
    max: 5,
    reqLvl: 40,
    tier: 1,
    icon: "📯💥",
    effect: "warcry",
    baseCd: 60000,
    info: "Restaura 20% de HP e aumenta Max HP temporariamente."
  },
  gladiators_harmony: {
    id: "gladiators_harmony",
    name: "Gladiator's Harmony",
    type: "buff",
    rarity: "2★",
    cost: 10,
    max: 5,
    reqLvl: 40,
    tier: 1,
    icon: "⚔️⚔️✨",
    effect: "warcry",
    baseCd: 60000,
    info: "P.Atk Duplo +25%, Crit Dmg +20%, Atk Speed +15% (20 min)."
  },
  paladins_harmony: {
    id: "paladins_harmony",
    name: "Paladin's Harmony",
    type: "buff",
    rarity: "2★",
    cost: 10,
    max: 5,
    reqLvl: 40,
    tier: 1,
    icon: "🛡️✨",
    effect: "warcry",
    baseCd: 60000,
    info: "P.Def +30%, M.Def +30%, Shield Block +40%, Max HP +25% (20 min)."
  },
  haste_buff: {
    id: "haste_buff",
    name: "Haste",
    type: "buff",
    rarity: "2★",
    cost: 15,
    max: 5,
    reqLvl: 40,
    tier: 1,
    icon: "⚡",
    effect: "warcry",
    baseCd: 600000,
    info: "Aumenta a velocidade de ataque da party em +30% por 10 min."
  },
  might_buff: {
    id: "might_buff",
    name: "Might",
    type: "buff",
    rarity: "2★",
    cost: 15,
    max: 5,
    reqLvl: 40,
    tier: 1,
    icon: "💪",
    effect: "warcry",
    baseCd: 600000,
    info: "Aumenta o P.Atk da party em +20% por 10 min."
  }
};
