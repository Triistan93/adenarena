/**
 * Colosseum & PvP Duels System Data
 * Duelos amistosos 1v1 com apostas de Adena, Modo Sobrevivência em 10 Ondas e Loja de Badges do Coliseu.
 */

export const DUEL_BET_TIERS = [
  { id: 'bet_100k', name: 'Duelo de Aprendiz', bet: 100000, rewardAA: 500, label: '100,000 Adena' },
  { id: 'bet_500k', name: 'Duelo de Gladiador', bet: 500000, rewardAA: 2500, label: '500,000 Adena' },
  { id: 'bet_2m5', name: 'Duelo de Campeão', bet: 2500000, rewardAA: 12500, label: '2,500,000 Adena' },
  { id: 'bet_10m', name: 'Duelo de Lenda de Aden', bet: 10000000, rewardAA: 50000, label: '10,000,000 Adena' }
];

export const DUEL_OPPONENT_ARCHETYPES = [
  {
    type: 'duelist',
    name: 'Gladiador de Giran ⚔️',
    title: 'Mestre das Espadas Duplas',
    icon: '⚔️',
    hpMult: 1.2,
    pAtkMult: 1.1,
    pDefMult: 1.2
  },
  {
    type: 'archer',
    name: 'Arqueiro Fantasma 🏹',
    title: 'Tirador de Elite de Silver Ranger',
    icon: '🏹',
    hpMult: 0.9,
    pAtkMult: 1.3,
    critMult: 1.5
  },
  {
    type: 'nuker',
    name: 'Feiticeiro Arcano 🔮',
    title: 'Arcanista de Prominence',
    icon: '🔮',
    hpMult: 0.8,
    mAtkMult: 1.4,
    mDefMult: 1.3
  },
  {
    type: 'dagger',
    name: 'Assassino das Sombras 🗡️',
    title: 'Abyss Walker Letal',
    icon: '🗡️',
    hpMult: 0.85,
    pAtkMult: 1.25,
    critMult: 1.8
  },
  {
    type: 'tank',
    name: 'Paladino Imperial 🛡️',
    title: 'Muralha de Phoenix Knight',
    icon: '🛡️',
    hpMult: 1.6,
    pDefMult: 1.5,
    mDefMult: 1.4
  }
];

export const SURVIVAL_WAVES = [
  { wave: 1, name: 'Feras do Coliseu (Lobos & Ursos)', hp: 40000, pAtk: 600, pDef: 500, badges: 5 },
  { wave: 2, name: 'Gladiadores Novatos de Dion', hp: 75000, pAtk: 900, pDef: 750, badges: 10 },
  { wave: 3, name: 'Bando de Bandidos de Floran', hp: 120000, pAtk: 1200, pDef: 950, badges: 15 },
  { wave: 4, name: 'Magos Renegados de Ivory Tower', hp: 180000, pAtk: 1600, pDef: 1100, badges: 20 },
  { wave: 5, name: 'Gárgulas da Torre Insolência', hp: 260000, pAtk: 2000, pDef: 1400, badges: 30 },
  { wave: 6, name: 'Veteranos do Sepulcro Imperial', hp: 350000, pAtk: 2400, pDef: 1700, badges: 40 },
  { wave: 7, name: 'Campeões Mortos-Vivos de Shilen', hp: 480000, pAtk: 2800, pDef: 2000, badges: 50 },
  { wave: 8, name: 'Cavaleiros do Abismo Negro', hp: 650000, pAtk: 3300, pDef: 2300, badges: 70 },
  { wave: 9, name: 'Generais da Guarda Real de Aden', hp: 850000, pAtk: 3800, pDef: 2600, badges: 100 },
  { wave: 10, name: 'Lorde Supremo do Coliseu 👑', hp: 1200000, pAtk: 4500, pDef: 3000, badges: 200 }
];

export const COLOSSEUM_SHOP_CATALOG = [
  {
    id: 'gladiator_circlet',
    name: 'Gladiator Champion Circlet 👑',
    costBadges: 250,
    icon: '👑',
    desc: 'Tiara do campeão supremo do coliseu (+100 P.Def, +100 M.Def e +5% Dano PvP).'
  },
  {
    id: 'potion_heroic_cp',
    name: 'Grande Poção Heroica de CP (x20) 🧪',
    costBadges: 50,
    icon: '🧪',
    desc: 'Poções de combate de alta densidade que regeneram 2.000 CP instantaneamente.'
  },
  {
    id: 'giants_codex_mastery',
    name: "Giant's Codex - Mastery 🌟",
    costBadges: 400,
    icon: '🌟',
    desc: 'Tomo dos Gigantes para encanto seguro de habilidades.'
  },
  {
    id: 'scroll_enchant_weapon_s',
    name: 'Scroll: Enchant Weapon (S-Grade) 📜',
    costBadges: 300,
    icon: '📜',
    desc: 'Pergaminho sagrado de encantamento de armas S-Grade.'
  }
];
