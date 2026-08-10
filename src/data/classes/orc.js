// ═══════════════════════════════════════════
// CLASSES — Orc (Raider, Monk, Dragoon, Vanguard Rider & Dominator)
// ═══════════════════════════════════════════

export const ORC_CLASSES = {
  orcRaider: {
    id: 'orcRaider',
    name: 'Orc Raider',
    parent: 'fighter',
    race: 'orc',
    archetype: 'fighter',
    stage: 1,
    desc: 'Invasor orc especializado em espadas de duas mãos e machados.',
    base: { atk: 32, def: 18, hp: 260, mp: 30, eva: 4, crit: 6, mdef: 8 },
    skillTree: 'orcRaider'
  },
  destroyer: {
    id: 'destroyer',
    name: 'Destroyer',
    parent: 'orcRaider',
    race: 'orc',
    archetype: 'fighter',
    stage: 2,
    desc: 'Destruidor orc com Frenzy, Gutts e força avassaladora.',
    base: { atk: 68, def: 35, hp: 580, mp: 60, eva: 6, crit: 10, mdef: 18 },
    skillTree: 'destroyer'
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    parent: 'destroyer',
    race: 'orc',
    archetype: 'fighter',
    stage: 3,
    desc: 'Titã colossal com o maior HP base e dano berserker do jogo.',
    base: { atk: 136, def: 70, hp: 1100, mp: 110, eva: 10, crit: 18, mdef: 35 },
    skillTree: 'titan'
  },
  monk: {
    id: 'monk',
    name: 'Monk',
    parent: 'fighter',
    race: 'orc',
    archetype: 'fighter',
    stage: 1,
    desc: 'Monge orc lutador de garras e totens de batalha.',
    base: { atk: 28, def: 14, hp: 220, mp: 35, eva: 10, crit: 10, mdef: 10 },
    skillTree: 'monk'
  },
  tyrant: {
    id: 'tyrant',
    name: 'Tyrant',
    parent: 'monk',
    race: 'orc',
    archetype: 'fighter',
    stage: 2,
    desc: 'Tirano das garras com tótens de Puma, Ogro e Bisão.',
    base: { atk: 60, def: 28, hp: 480, mp: 75, eva: 18, crit: 18, mdef: 22 },
    skillTree: 'tyrant'
  },
  grandKhavatari: {
    id: 'grandKhavatari',
    name: 'Grand Khavatari',
    parent: 'tyrant',
    race: 'orc',
    archetype: 'fighter',
    stage: 3,
    desc: 'Mestre combatente de garras com socos de energia sônica.',
    base: { atk: 120, def: 56, hp: 920, mp: 130, eva: 28, crit: 28, mdef: 45 },
    skillTree: 'grandKhavatari'
  },
  orcRider: {
    id: 'orcRider',
    name: 'Rider',
    parent: 'fighter',
    race: 'orc',
    archetype: 'fighter',
    stage: 1,
    desc: 'Orc montado especializado em lanças de guerra pesadas.',
    base: { atk: 26, def: 20, hp: 240, mp: 30, eva: 5, crit: 6, mdef: 10 },
    skillTree: 'vanguardRider'
  },
  dragoon: {
    id: 'dragoon',
    name: 'Dragoon',
    parent: 'orcRider',
    race: 'orc',
    archetype: 'fighter',
    stage: 2,
    desc: 'Cavaleiro orc de montaria pesada com atropelo e lanças.',
    base: { atk: 72, def: 40, hp: 520, mp: 65, eva: 8, crit: 10, mdef: 20 },
    skillTree: 'vanguardRider'
  },
  vanguardRider: {
    id: 'vanguardRider',
    name: 'Vanguard Rider',
    parent: 'dragoon',
    race: 'orc',
    archetype: 'fighter',
    stage: 3,
    desc: 'Cavaleiro orc supremo montado com investidas devastadoras.',
    base: { atk: 130, def: 80, hp: 1000, mp: 120, eva: 14, crit: 20, mdef: 40 },
    skillTree: 'vanguardRider'
  },
  orcShaman: {
    id: 'orcShaman',
    name: 'Orc Shaman',
    parent: 'mage',
    race: 'orc',
    archetype: 'mage',
    stage: 1,
    desc: 'Xamã orc híbrido de magia e combate com cânticos.',
    base: { atk: 18, def: 18, hp: 180, mp: 120, eva: 4, crit: 4, matk: 28, mdef: 20 },
    skillTree: 'orcShaman'
  },
  overlord: {
    id: 'overlord',
    name: 'Overlord',
    parent: 'orcShaman',
    race: 'orc',
    archetype: 'mage',
    stage: 2,
    desc: 'Soberano orc mestre em debuffs de clã e paralisia em área.',
    base: { atk: 32, def: 45, hp: 380, mp: 250, eva: 6, crit: 6, matk: 60, mdef: 50 },
    skillTree: 'overlord'
  },
  dominator: {
    id: 'dominator',
    name: 'Dominator',
    parent: 'overlord',
    race: 'orc',
    archetype: 'mage',
    stage: 3,
    desc: 'Dominador supremo com selos de paralisia e cura de aliança.',
    base: { atk: 55, def: 90, hp: 720, mp: 500, eva: 10, crit: 10, matk: 115, mdef: 96 },
    skillTree: 'dominator'
  },
  warcryer: {
    id: 'warcryer',
    name: 'Warcryer',
    parent: 'orcShaman',
    race: 'orc',
    archetype: 'mage',
    stage: 2,
    desc: 'Gritador de guerra com cantos de apoio para toda a party.',
    base: { atk: 30, def: 40, hp: 360, mp: 260, eva: 6, crit: 6, matk: 55, mdef: 45 },
    skillTree: 'warcryer'
  },
  doomcryer: {
    id: 'doomcryer',
    name: 'Doomcryer',
    parent: 'warcryer',
    race: 'orc',
    archetype: 'mage',
    stage: 3,
    desc: 'Gritador da ruína com o Cântico de Victória supremo.',
    base: { atk: 52, def: 80, hp: 680, mp: 520, eva: 10, crit: 10, matk: 105, mdef: 88 },
    skillTree: 'doomcryer'
  }
};
