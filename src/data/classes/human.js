// ═══════════════════════════════════════════
// CLASSES — Human (Fighter, Mage & Death Knight Line)
// ═══════════════════════════════════════════

export const HUMAN_CLASSES = {
  fighter: {
    id: 'fighter',
    name: 'Human Fighter',
    race: 'human',
    archetype: 'fighter',
    stage: 0,
    desc: 'Classe base de combate humana.',
    base: { atk: 12, def: 10, hp: 100, mp: 30, eva: 5, crit: 5, matk: 0, mdef: 5 },
    skillTree: 'humanFighter'
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    parent: 'fighter',
    race: 'human',
    archetype: 'fighter',
    stage: 1,
    desc: 'Guerreiro corpo-a-corpo especializado em espadas e polearms.',
    base: { atk: 28, def: 18, hp: 180, mp: 45, eva: 6, crit: 8, mdef: 8 },
    skillTree: 'warrior'
  },
  gladiator: {
    id: 'gladiator',
    name: 'Gladiator',
    parent: 'warrior',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Mestre no combate com espadas duplas e sonic wave strikes.',
    base: { atk: 55, def: 25, hp: 350, mp: 90, eva: 8, crit: 12, mdef: 15 },
    skillTree: 'gladiator'
  },
  duelist: {
    id: 'duelist',
    name: 'Duelist',
    parent: 'gladiator',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Espadachim supremo que domina a arte de esgrima dupla e ondas sônicas.',
    base: { atk: 110, def: 45, hp: 650, mp: 160, eva: 12, crit: 20, mdef: 30 },
    skillTree: 'duelist'
  },
  warlord: {
    id: 'warlord',
    name: 'Warlord',
    parent: 'warrior',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Especialista em lança e combate contra múltiplos alvos.',
    base: { atk: 48, def: 35, hp: 420, mp: 70, eva: 4, crit: 6, mdef: 20 },
    skillTree: 'warlord'
  },
  dreadnought: {
    id: 'dreadnought',
    name: 'Dreadnought',
    parent: 'warlord',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Mestre da guerra que domina o campo de batalha com ataques em área.',
    base: { atk: 95, def: 60, hp: 780, mp: 130, eva: 8, crit: 10, mdef: 35 },
    skillTree: 'dreadnought'
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    parent: 'fighter',
    race: 'human',
    archetype: 'fighter',
    stage: 1,
    desc: 'Guerreiro defensivo munido de escudo e forte armadura.',
    base: { atk: 18, def: 28, hp: 220, mp: 40, eva: 3, crit: 4, mdef: 15 },
    skillTree: 'knight'
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    parent: 'knight',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Cavaleiro sagrado com cura, escudos divinos e defesa imbatível.',
    base: { atk: 32, def: 60, hp: 520, mp: 100, eva: 5, crit: 5, mdef: 35 },
    skillTree: 'paladin'
  },
  phoenixKnight: {
    id: 'phoenixKnight',
    name: 'Phoenix Knight',
    parent: 'paladin',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Tanque supremo com poder da Fênix Sagrada e regeneração.',
    base: { atk: 65, def: 110, hp: 950, mp: 180, eva: 8, crit: 8, mdef: 70 },
    skillTree: 'phoenixKnight'
  },
  darkAvenger: {
    id: 'darkAvenger',
    name: 'Dark Avenger',
    parent: 'knight',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Cavaleiro sombrio com pantera negra, reflexão e maldições.',
    base: { atk: 45, def: 50, hp: 480, mp: 90, eva: 6, crit: 8, mdef: 30 },
    skillTree: 'darkAvenger'
  },
  hellKnight: {
    id: 'hellKnight',
    name: 'Hell Knight',
    parent: 'darkAvenger',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Cavaleiro do inferno com lifesteal e chamas das sombras.',
    base: { atk: 90, def: 95, hp: 880, mp: 170, eva: 10, crit: 14, mdef: 60 },
    skillTree: 'hellKnight'
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    parent: 'fighter',
    race: 'human',
    archetype: 'fighter',
    stage: 1,
    desc: 'Atirador ou assassino ágil com adagas e arcos.',
    base: { atk: 24, def: 12, hp: 150, mp: 35, eva: 12, crit: 15, mdef: 6 },
    skillTree: 'rogue'
  },
  treasureHunter: {
    id: 'treasureHunter',
    name: 'Treasure Hunter',
    parent: 'rogue',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Assassino mortal com passos de sombra e ataques por trás.',
    base: { atk: 50, def: 18, hp: 320, mp: 75, eva: 25, crit: 25, mdef: 12 },
    skillTree: 'treasureHunter'
  },
  adventurer: {
    id: 'adventurer',
    name: 'Adventurer',
    parent: 'treasureHunter',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Mestre da esquiva e de golpes letais.',
    base: { atk: 100, def: 35, hp: 600, mp: 140, eva: 48, crit: 35, mdef: 25 },
    skillTree: 'adventurer'
  },
  hawkeye: {
    id: 'hawkeye',
    name: 'Hawkeye',
    parent: 'rogue',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Arqueiro humano com alcance sniper e disparos precisos.',
    base: { atk: 58, def: 15, hp: 300, mp: 80, eva: 18, crit: 22, mdef: 10 },
    skillTree: 'hawkeye'
  },
  sagittarius: {
    id: 'sagittarius',
    name: 'Sagittarius',
    parent: 'hawkeye',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Arqueiro lendário com tiro supremo de sete flechas.',
    base: { atk: 115, def: 30, hp: 580, mp: 150, eva: 32, crit: 32, mdef: 22 },
    skillTree: 'sagittarius'
  },
  // --- MAGE ---
  mage: {
    id: 'mage',
    name: 'Human Mage',
    race: 'human',
    archetype: 'mage',
    stage: 0,
    desc: 'Classe base mágica humana.',
    base: { atk: 6, def: 6, hp: 70, mp: 80, eva: 4, crit: 2, matk: 18, mdef: 12 },
    skillTree: 'humanMage'
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    parent: 'mage',
    race: 'human',
    archetype: 'mage',
    stage: 1,
    desc: 'Mago especialista em magia elemental e das trevas.',
    base: { atk: 10, def: 10, hp: 120, mp: 160, eva: 6, crit: 4, matk: 40, mdef: 22 },
    skillTree: 'wizard'
  },
  sorcerer: {
    id: 'sorcerer',
    name: 'Sorcerer',
    parent: 'wizard',
    race: 'human',
    archetype: 'mage',
    stage: 2,
    desc: 'Mago do fogo supremo com chamas devastadoras.',
    base: { atk: 18, def: 16, hp: 250, mp: 320, eva: 8, crit: 6, matk: 85, mdef: 45 },
    skillTree: 'sorcerer'
  },
  archmage: {
    id: 'archmage',
    name: 'Archmage',
    parent: 'sorcerer',
    race: 'human',
    archetype: 'mage',
    stage: 3,
    desc: 'Arquimago lendário do fogo e tempestade de mana.',
    base: { atk: 30, def: 30, hp: 480, mp: 600, eva: 14, crit: 10, matk: 165, mdef: 90 },
    skillTree: 'archmage'
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    parent: 'wizard',
    race: 'human',
    archetype: 'mage',
    stage: 2,
    desc: 'Mestre da morte, maldições e invocação de esqueletos.',
    base: { atk: 16, def: 18, hp: 280, mp: 290, eva: 7, crit: 5, matk: 78, mdef: 42 },
    skillTree: 'necromancer'
  },
  soultaker: {
    id: 'soultaker',
    name: 'Soultaker',
    parent: 'necromancer',
    race: 'human',
    archetype: 'mage',
    stage: 3,
    desc: 'Ceifador de almas supremo com lifesteal e vortex de sombras.',
    base: { atk: 28, def: 32, hp: 520, mp: 550, eva: 12, crit: 8, matk: 155, mdef: 85 },
    skillTree: 'soultaker'
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    parent: 'mage',
    race: 'human',
    archetype: 'mage',
    stage: 1,
    desc: 'Sacerdote sagrado focado em cura e suporte.',
    base: { atk: 10, def: 14, hp: 140, mp: 150, eva: 5, crit: 3, matk: 32, mdef: 25 },
    skillTree: 'cleric'
  },
  bishop: {
    id: 'bishop',
    name: 'Bishop',
    parent: 'cleric',
    race: 'human',
    archetype: 'mage',
    stage: 2,
    desc: 'Mestre curandeiro com bênçãos divinas e ressuscitar.',
    base: { atk: 15, def: 25, hp: 300, mp: 350, eva: 6, crit: 4, matk: 60, mdef: 60 },
    skillTree: 'bishop'
  },
  cardinal: {
    id: 'cardinal',
    name: 'Cardinal',
    parent: 'bishop',
    race: 'human',
    archetype: 'mage',
    stage: 3,
    desc: 'Bispo sagrado com milagres e restauração em massa.',
    base: { atk: 25, def: 45, hp: 550, mp: 650, eva: 10, crit: 6, matk: 110, mdef: 115 },
    skillTree: 'cardinal'
  },
  prophet: {
    id: 'prophet',
    name: 'Prophet',
    parent: 'cleric',
    race: 'human',
    archetype: 'mage',
    stage: 2,
    desc: 'Profeta de buffs massivos de atributos e velocidade.',
    base: { atk: 20, def: 22, hp: 320, mp: 300, eva: 8, crit: 5, matk: 55, mdef: 50 },
    skillTree: 'prophet'
  },
  hierophant: {
    id: 'hierophant',
    name: 'Hierophant',
    parent: 'prophet',
    race: 'human',
    archetype: 'mage',
    stage: 3,
    desc: 'Supremo encantador de party com Profecia e Bônus Lendários.',
    base: { atk: 35, def: 40, hp: 580, mp: 580, eva: 12, crit: 8, matk: 100, mdef: 95 },
    skillTree: 'hierophant'
  },
  // --- SPECIAL ESSENCE ---
  deathPilgrim: {
    id: 'deathPilgrim',
    name: 'Death Pilgrim',
    race: 'human',
    archetype: 'fighter',
    stage: 0,
    desc: 'Peregrino das trevas, futuro Death Knight.',
    base: { atk: 15, def: 12, hp: 120, mp: 25, eva: 4, crit: 6, matk: 0, mdef: 8 },
    skillTree: 'deathKnight'
  },
  deathBlade: {
    id: 'deathBlade',
    name: 'Death Blade',
    parent: 'deathPilgrim',
    race: 'human',
    archetype: 'fighter',
    stage: 1,
    desc: 'Lâmina da Morte munida de chamas das trevas.',
    base: { atk: 32, def: 22, hp: 220, mp: 40, eva: 6, crit: 10, mdef: 14 },
    skillTree: 'deathKnight'
  },
  deathMessenger: {
    id: 'deathMessenger',
    name: 'Death Messenger',
    parent: 'deathBlade',
    race: 'human',
    archetype: 'fighter',
    stage: 2,
    desc: 'Mensageiro da Morte com Death Points e habilidades das trevas.',
    base: { atk: 68, def: 48, hp: 450, mp: 80, eva: 10, crit: 16, mdef: 30 },
    skillTree: 'deathKnight'
  },
  deathKnight: {
    id: 'deathKnight',
    name: 'Death Knight',
    parent: 'deathMessenger',
    race: 'human',
    archetype: 'fighter',
    stage: 3,
    desc: 'Cavaleiro da Morte supremo com espada flamejante e imunidade.',
    base: { atk: 138, def: 85, hp: 900, mp: 160, eva: 15, crit: 28, mdef: 60 },
    skillTree: 'deathKnight'
  }
};
