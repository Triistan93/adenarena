// ═══════════════════════════════════════════
// CLASSES — Dark Elf (Palus Knight, Assassin, Spellhowler & Ghost Sentinel)
// ═══════════════════════════════════════════

export const DARKELF_CLASSES = {
  palusKnight: {
    id: 'palusKnight',
    name: 'Palus Knight',
    parent: 'fighter',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 1,
    desc: 'Cavaleiro sombrio focado em dano físico elevado e magia negra.',
    base: { atk: 26, def: 22, hp: 180, mp: 40, eva: 8, crit: 10, mdef: 14 },
    skillTree: 'palusKnight'
  },
  shillienKnight: {
    id: 'shillienKnight',
    name: 'Shillien Knight',
    parent: 'palusKnight',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Cavaleiro de Shillien com cubos sombrios, dreno de vida e paralisia.',
    base: { atk: 48, def: 52, hp: 430, mp: 90, eva: 12, crit: 14, mdef: 35 },
    skillTree: 'shillienKnight'
  },
  shillienTemplar: {
    id: 'shillienTemplar',
    name: 'Shillien Templar',
    parent: 'shillienKnight',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Templário supremo das sombras com cubos avançados e provocação.',
    base: { atk: 96, def: 98, hp: 790, mp: 170, eva: 18, crit: 20, mdef: 70 },
    skillTree: 'shillienTemplar'
  },
  bladedancer: {
    id: 'bladedancer',
    name: 'Blade Dancer',
    parent: 'palusKnight',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Dançarino das lâminas duplas com danças de ataque e dano crítico.',
    base: { atk: 56, def: 32, hp: 400, mp: 85, eva: 14, crit: 18, mdef: 25 },
    skillTree: 'bladedancer'
  },
  spectralDancer: {
    id: 'spectralDancer',
    name: 'Spectral Dancer',
    parent: 'bladedancer',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Dançarino espectral mestre em danças de fúria e sombras.',
    base: { atk: 112, def: 64, hp: 720, mp: 160, eva: 22, crit: 28, mdef: 50 },
    skillTree: 'spectralDancer'
  },
  deAssassin: {
    id: 'deAssassin',
    name: 'Assassin',
    parent: 'fighter',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 1,
    desc: 'Assassino sombrio com o maior dano crítico base do jogo.',
    base: { atk: 30, def: 8, hp: 130, mp: 35, eva: 14, crit: 20, mdef: 6 },
    skillTree: 'deAssassin'
  },
  abyssWalker: {
    id: 'abyssWalker',
    name: 'Abyss Walker',
    parent: 'deAssassin',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Caminhante do abismo focado em golpes fatais pelas costas.',
    base: { atk: 62, def: 14, hp: 280, mp: 70, eva: 26, crit: 35, mdef: 12 },
    skillTree: 'abyssWalker'
  },
  ghostHunter: {
    id: 'ghostHunter',
    name: 'Ghost Hunter',
    parent: 'abyssWalker',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Caçador de fantasmas supremo com danos críticos devastadores.',
    base: { atk: 124, def: 28, hp: 520, mp: 130, eva: 48, crit: 50, mdef: 22 },
    skillTree: 'ghostHunter'
  },
  phantomRanger: {
    id: 'phantomRanger',
    name: 'Phantom Ranger',
    parent: 'deAssassin',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 2,
    desc: 'Arqueiro fantasma com tiros fatais de altíssimo dano por flecha.',
    base: { atk: 66, def: 12, hp: 270, mp: 75, eva: 20, crit: 30, mdef: 10 },
    skillTree: 'phantomRanger'
  },
  ghostSentinel: {
    id: 'ghostSentinel',
    name: 'Ghost Sentinel',
    parent: 'phantomRanger',
    race: 'darkelf',
    archetype: 'fighter',
    stage: 3,
    desc: 'Sentinela fantasma com disparos sombrios e perfuração mortal.',
    base: { atk: 132, def: 24, hp: 500, mp: 140, eva: 36, crit: 45, mdef: 20 },
    skillTree: 'ghostSentinel'
  },
  darkWizard: {
    id: 'darkWizard',
    name: 'Dark Wizard',
    parent: 'mage',
    race: 'darkelf',
    archetype: 'mage',
    stage: 1,
    desc: 'Mago negro de altíssimo M.Atk e magias de vento/trevas.',
    base: { atk: 10, def: 6, hp: 100, mp: 170, eva: 6, crit: 6, matk: 48, mdef: 20 },
    skillTree: 'darkWizard'
  },
  spellhowler: {
    id: 'spellhowler',
    name: 'Spellhowler',
    parent: 'darkWizard',
    race: 'darkelf',
    archetype: 'mage',
    stage: 2,
    desc: 'Invocador de tempestades negras de vento e sombra.',
    base: { atk: 16, def: 12, hp: 210, mp: 340, eva: 9, crit: 10, matk: 105, mdef: 42 },
    skillTree: 'spellhowler'
  },
  stormScreamer: {
    id: 'stormScreamer',
    name: 'Storm Screamer',
    parent: 'spellhowler',
    race: 'darkelf',
    archetype: 'mage',
    stage: 3,
    desc: 'Gritador da tempestade com o maior M.Atk puro do jogo.',
    base: { atk: 28, def: 24, hp: 420, mp: 650, eva: 15, crit: 16, matk: 195, mdef: 85 },
    skillTree: 'stormScreamer'
  },
  shillienOracle: {
    id: 'shillienOracle',
    name: 'Shillien Oracle',
    parent: 'mage',
    race: 'darkelf',
    archetype: 'mage',
    stage: 1,
    desc: 'Oráculo de Shillien de suporte agressivo e recarga de mana.',
    base: { atk: 9, def: 10, hp: 120, mp: 160, eva: 6, crit: 4, matk: 36, mdef: 26 },
    skillTree: 'shillienOracle'
  },
  shillienElder: {
    id: 'shillienElder',
    name: 'Shillien Elder',
    parent: 'shillienOracle',
    race: 'darkelf',
    archetype: 'mage',
    stage: 2,
    desc: 'Ancião de Shillien com empoderamento mágico e Vampiric Rage.',
    base: { atk: 15, def: 20, hp: 260, mp: 380, eva: 8, crit: 6, matk: 68, mdef: 58 },
    skillTree: 'shillienElder'
  },
  shillienSaint: {
    id: 'shillienSaint',
    name: 'Shillien Saint',
    parent: 'shillienElder',
    race: 'darkelf',
    archetype: 'mage',
    stage: 3,
    desc: 'Santo de Shillien com benção das sombras e lifesteal para party.',
    base: { atk: 25, def: 38, hp: 490, mp: 700, eva: 14, crit: 8, matk: 120, mdef: 110 },
    skillTree: 'shillienSaint'
  }
};
