// ═══════════════════════════════════════════
// CLASSES — Ertheia (Marauder, Sayha Seer & Blood Rose)
// ═══════════════════════════════════════════

export const ERTHEIA_CLASSES = {
  bloodRoseBase: {
    id: 'bloodRoseBase',
    name: 'Ertheia Blood Rose Base',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 0,
    desc: 'Lutadora mística Ertheia em sintonia com os ventos e espinhos.',
    base: { atk: 12, def: 8, hp: 95, mp: 50, eva: 10, crit: 6, matk: 14, mdef: 8 },
    skillTree: 'bloodRose'
  },
  marauder: {
    id: 'marauder',
    name: 'Marauder',
    parent: 'bloodRoseBase',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 1,
    desc: 'Saqueadora Ertheia com punhos do vento e golpes ágeis.',
    base: { atk: 26, def: 10, hp: 160, mp: 60, eva: 16, crit: 10, matk: 20, mdef: 10 },
    skillTree: 'eviscerator'
  },
  ertheiaWarrior: {
    id: 'ertheiaWarrior',
    name: 'Eviscerator',
    parent: 'marauder',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 2,
    desc: 'Evisceradora de combate físico corporal e combos acelerados.',
    base: { atk: 62, def: 22, hp: 320, mp: 90, eva: 28, crit: 18, matk: 30, mdef: 20 },
    skillTree: 'eviscerator'
  },
  eviscerator: {
    id: 'eviscerator',
    name: 'Eviscerator Master',
    parent: 'ertheiaWarrior',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 3,
    desc: 'Evisceradora suprema com combos de tempestade de vento e socos gravitacionais.',
    base: { atk: 125, def: 45, hp: 580, mp: 160, eva: 48, crit: 35, matk: 50, mdef: 40 },
    skillTree: 'eviscerator'
  },
  sayhaSeer: {
    id: 'sayhaSeer',
    name: 'Sayha Seeker',
    parent: 'bloodRoseBase',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 1,
    desc: 'Vidente de Sayha especialista em magias do vento e ilusão.',
    base: { atk: 10, def: 8, hp: 110, mp: 170, eva: 12, crit: 6, matk: 40, mdef: 22 },
    skillTree: 'sayhaSeeker'
  },
  windRiderErth: {
    id: 'windRiderErth',
    name: 'Sayha Seeker',
    parent: 'sayhaSeer',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 2,
    desc: 'Buscador de Sayha com tempestades de vento e distorção espacial.',
    base: { atk: 18, def: 14, hp: 220, mp: 340, eva: 18, crit: 10, matk: 88, mdef: 45 },
    skillTree: 'sayhaSeeker'
  },
  sayhaSeeker: {
    id: 'sayhaSeeker',
    name: 'Sayha Seeker',
    parent: 'windRiderErth',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 3,
    desc: 'Buscador supremo de Sayha com rajadas aéreas e voo ilusório.',
    base: { atk: 30, def: 28, hp: 440, mp: 640, eva: 32, crit: 16, matk: 170, mdef: 88 },
    skillTree: 'sayhaSeeker'
  },
  // --- SPECIAL ESSENCE ERTHEIA ---
  bloodRoseS1: {
    id: 'bloodRoseS1',
    name: 'Blood Rose',
    parent: 'bloodRoseBase',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 1,
    desc: 'Rosa Sangrenta com ataques híbridos de espinhos e dreno de vida.',
    base: { atk: 18, def: 12, hp: 150, mp: 100, eva: 14, crit: 10, matk: 32, mdef: 18 },
    skillTree: 'bloodRose'
  },
  bloodRoseS2: {
    id: 'bloodRoseS2',
    name: 'Blood Rose',
    parent: 'bloodRoseS1',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 2,
    desc: 'Rosa Sangrenta avançada com chicotes de rosas e lifesteal elevado.',
    base: { atk: 40, def: 24, hp: 280, mp: 220, eva: 22, crit: 16, matk: 72, mdef: 38 },
    skillTree: 'bloodRose'
  },
  bloodRose: {
    id: 'bloodRose',
    name: 'Blood Rose',
    parent: 'bloodRoseS2',
    race: 'ertheia',
    archetype: 'ertheia',
    stage: 3,
    desc: 'Mística Ertheia com chicotes de espinhos, tempestades sangrentas e cura vampírica.',
    base: { atk: 85, def: 48, hp: 520, mp: 420, eva: 38, crit: 28, matk: 152, mdef: 72 },
    skillTree: 'bloodRose'
  }
};
