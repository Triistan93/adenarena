// ═══════════════════════════════════════════
// CLASSES — Elf (Elven Knight, Scout, Spellsinger & Evas Templar)
// ═══════════════════════════════════════════

export const ELF_CLASSES = {
  elvenKnight: {
    id: 'elvenKnight',
    name: 'Elven Knight',
    parent: 'fighter',
    race: 'elf',
    archetype: 'fighter',
    stage: 1,
    desc: 'Cavaleiro elfo gracioso com alta velocidade e magia de água.',
    base: { atk: 22, def: 25, hp: 200, mp: 50, eva: 12, crit: 6, mdef: 18 },
    skillTree: 'elvenKnight'
  },
  templeKnight: {
    id: 'templeKnight',
    name: 'Temple Knight',
    parent: 'elvenKnight',
    race: 'elf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Guardião do templo com escudos de água e alta evasão.',
    base: { atk: 40, def: 58, hp: 460, mp: 110, eva: 20, crit: 8, mdef: 38 },
    skillTree: 'templeKnight'
  },
  evasTemplar: {
    id: 'evasTemplar',
    name: "Eva's Templar",
    parent: 'templeKnight',
    race: 'elf',
    archetype: 'fighter',
    stage: 3,
    desc: "Templário supremo de Eva com Aegis divina e invulnerabilidade.",
    base: { atk: 75, def: 105, hp: 850, mp: 200, eva: 32, crit: 12, mdef: 75 },
    skillTree: 'evasTemplar'
  },
  swordsinger: {
    id: 'swordsinger',
    name: 'Sword Singer',
    parent: 'elvenKnight',
    race: 'elf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Cantor da lâmina que concede canções de defesa e ataque.',
    base: { atk: 48, def: 42, hp: 420, mp: 100, eva: 16, crit: 10, mdef: 32 },
    skillTree: 'swordsinger'
  },
  swordMuse: {
    id: 'swordMuse',
    name: 'Sword Muse',
    parent: 'swordsinger',
    race: 'elf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Musa da espada com sinfonias de guerra e amplificação de party.',
    base: { atk: 92, def: 80, hp: 750, mp: 190, eva: 24, crit: 16, mdef: 60 },
    skillTree: 'swordMuse'
  },
  elvenScout: {
    id: 'elvenScout',
    name: 'Elven Scout',
    parent: 'fighter',
    race: 'elf',
    archetype: 'fighter',
    stage: 1,
    desc: 'Batedor elfo ágil especialista em adagas e arcos rápidos.',
    base: { atk: 26, def: 10, hp: 140, mp: 40, eva: 18, crit: 16, mdef: 8 },
    skillTree: 'elvenScout'
  },
  plainsWalker: {
    id: 'plainsWalker',
    name: 'Plains Walker',
    parent: 'elvenScout',
    race: 'elf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Assassino dos campos com velocidade imbatível e golpes triplos.',
    base: { atk: 54, def: 16, hp: 300, mp: 80, eva: 32, crit: 28, mdef: 14 },
    skillTree: 'plainsWalker'
  },
  windRiderElven: {
    id: 'windRiderElven',
    name: 'Wind Rider',
    parent: 'plainsWalker',
    race: 'elf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Cavaleiro do vento elfo com rajadas de adaga e Mirage.',
    base: { atk: 106, def: 32, hp: 580, mp: 150, eva: 60, crit: 42, mdef: 28 },
    skillTree: 'windRiderElven'
  },
  silverRanger: {
    id: 'silverRanger',
    name: 'Silver Ranger',
    parent: 'elvenScout',
    race: 'elf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Arqueiro prateado de altíssima velocidade de disparo.',
    base: { atk: 62, def: 14, hp: 290, mp: 85, eva: 24, crit: 24, mdef: 12 },
    skillTree: 'silverRanger'
  },
  moonlightSentinel: {
    id: 'moonlightSentinel',
    name: 'Moonlight Sentinel',
    parent: 'silverRanger',
    race: 'elf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Sentinela do luar com rajadas rápidas de arco e longo alcance.',
    base: { atk: 120, def: 28, hp: 550, mp: 160, eva: 42, crit: 38, mdef: 24 },
    skillTree: 'moonlightSentinel'
  },
  elvenWizard: {
    id: 'elvenWizard',
    name: 'Elven Wizard',
    parent: 'mage',
    race: 'elf',
    archetype: 'mage',
    stage: 1,
    desc: 'Mago elfo gracioso de elemento água e luz.',
    base: { atk: 8, def: 8, hp: 110, mp: 180, eva: 8, crit: 4, matk: 42, mdef: 24 },
    skillTree: 'elvenWizard'
  },
  spellsinger: {
    id: 'spellsinger',
    name: 'Spellsinger',
    parent: 'elvenWizard',
    race: 'elf',
    archetype: 'mage',
    stage: 2,
    desc: 'Cantor de feitiços de gelo e água com cast speed incomparável.',
    base: { atk: 15, def: 14, hp: 230, mp: 360, eva: 12, crit: 8, matk: 90, mdef: 48 },
    skillTree: 'spellsinger'
  },
  mysticMuse: {
    id: 'mysticMuse',
    name: 'Mystic Muse',
    parent: 'spellsinger',
    race: 'elf',
    archetype: 'mage',
    stage: 3,
    desc: 'Musa mística com tempestades de gelo e Hydro Blast.',
    base: { atk: 26, def: 28, hp: 450, mp: 680, eva: 18, crit: 12, matk: 172, mdef: 95 },
    skillTree: 'mysticMuse'
  },
  oracle: {
    id: 'oracle',
    name: 'Elven Oracle',
    parent: 'mage',
    race: 'elf',
    archetype: 'mage',
    stage: 1,
    desc: 'Oráculo elfo de restauração de MP e suporte de água.',
    base: { atk: 8, def: 12, hp: 130, mp: 170, eva: 7, crit: 3, matk: 34, mdef: 28 },
    skillTree: 'oracle'
  },
  elder: {
    id: 'elder',
    name: 'Elven Elder',
    parent: 'oracle',
    race: 'elf',
    archetype: 'mage',
    stage: 2,
    desc: 'Ancião elfo mestre em recarga de mana e proteção de água.',
    base: { atk: 14, def: 22, hp: 280, mp: 400, eva: 10, crit: 4, matk: 62, mdef: 62 },
    skillTree: 'elder'
  },
  evasSaint: {
    id: 'evasSaint',
    name: "Eva's Saint",
    parent: 'elder',
    race: 'elf',
    archetype: 'mage',
    stage: 3,
    desc: "Santa de Eva com bênção de purificação e cura divina.",
    base: { atk: 24, def: 40, hp: 520, mp: 720, eva: 16, crit: 6, matk: 112, mdef: 120 },
    skillTree: 'evasSaint'
  }
};
