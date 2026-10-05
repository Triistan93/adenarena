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
  { wave: 1, name: 'Feras do Coliseu (Lobos & Ursos)', hp: 4500, pAtk: 120, pDef: 90, badges: 5 },
  { wave: 2, name: 'Gladiadores Novatos de Dion', hp: 9000, pAtk: 180, pDef: 140, badges: 10 },
  { wave: 3, name: 'Bando de Bandidos de Floran', hp: 18000, pAtk: 260, pDef: 200, badges: 15 },
  { wave: 4, name: 'Magos Renegados de Ivory Tower', hp: 35000, pAtk: 380, pDef: 300, badges: 20 },
  { wave: 5, name: 'Gárgulas da Torre Insolência', hp: 65000, pAtk: 550, pDef: 450, badges: 30 },
  { wave: 6, name: 'Veteranos do Sepulcro Imperial', hp: 110000, pAtk: 800, pDef: 650, badges: 40 },
  { wave: 7, name: 'Campeões Mortos-Vivos de Shilen', hp: 180000, pAtk: 1200, pDef: 900, badges: 50 },
  { wave: 8, name: 'Cavaleiros do Abismo Negro', hp: 280000, pAtk: 1800, pDef: 1300, badges: 70 },
  { wave: 9, name: 'Generais da Guarda Real de Aden', hp: 420000, pAtk: 2600, pDef: 1800, badges: 100 },
  { wave: 10, name: 'Lorde Supremo do Coliseu 👑', hp: 650000, pAtk: 3600, pDef: 2400, badges: 200 }
];

export const COLOSSEUM_SHOP_CATALOG = [
  {
    id: 'gladiator_circlet',
    name: 'Gladiator Champion Circlet 👑',
    costBadges: 250,
    icon: '👑',
    desc: 'Tiara do campeão supremo do Coliseu (+100 P.Def e +100 M.Def).'
  },
  {
    id: 'potion_heroic_cp',
    name: 'Grande Poção Heroica de CP (x20) 🧪',
    costBadges: 50,
    quantity: 20,
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
