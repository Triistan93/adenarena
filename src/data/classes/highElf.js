// ═══════════════════════════════════════════
// CLASSES — High Elf (Divine Templar & Element Weaver)
// ═══════════════════════════════════════════

export const HIGHELF_CLASSES = {
  highElfBase: {
    id: 'highElfBase',
    name: 'High Elf Base',
    race: 'highelf',
    archetype: 'highelf',
    stage: 0,
    desc: 'Alto Elfo ancestral com escolhas entre o caminho divino ou mágico.',
    base: { atk: 10, def: 12, hp: 110, mp: 60, eva: 6, crit: 4, matk: 15, mdef: 10 },
    skillTree: 'divineTemplar'
  },
  // --- DIVINE TEMPLAR (TANK) ---
  divineTemplarS1: {
    id: 'divineTemplarS1',
    name: 'Divine Templar',
    parent: 'highElfBase',
    race: 'highelf',
    archetype: 'highelf',
    stage: 1,
    desc: 'Guardião divino High Elf de luz sagrada e escudo inquebrável.',
    base: { atk: 20, def: 30, hp: 220, mp: 80, eva: 8, crit: 6, matk: 10, mdef: 22 },
    skillTree: 'divineTemplar'
  },
  divineTemplarS2: {
    id: 'divineTemplarS2',
    name: 'Divine Templar',
    parent: 'divineTemplarS1',
    race: 'highelf',
    archetype: 'highelf',
    stage: 2,
    desc: 'Templário divino com Aegis Sagrada, provação e barreiras luminosas.',
    base: { atk: 55, def: 70, hp: 460, mp: 130, eva: 12, crit: 10, matk: 22, mdef: 45 },
    skillTree: 'divineTemplar'
  },
  divineTemplar: {
    id: 'divineTemplar',
    name: 'Divine Templar',
    parent: 'divineTemplarS2',
    race: 'highelf',
    archetype: 'highelf',
    stage: 3,
    desc: 'Tanque supremo High Elf com poder divino, Sacred Aegis e julgamento.',
    base: { atk: 95, def: 135, hp: 850, mp: 220, eva: 18, crit: 14, matk: 40, mdef: 95 },
    skillTree: 'divineTemplar'
  },
  // --- ELEMENT WEAVER (MAGE) ---
  elementWeaverS1: {
    id: 'elementWeaverS1',
    name: 'Element Weaver',
    parent: 'highElfBase',
    race: 'highelf',
    archetype: 'highelf',
    stage: 1,
    desc: 'Tecelão elemental High Elf manipulando Fogo, Água e Vento.',
    base: { atk: 10, def: 10, hp: 100, mp: 160, eva: 6, crit: 6, matk: 44, mdef: 25 },
    skillTree: 'elementWeaver'
  },
  elementWeaverS2: {
    id: 'elementWeaverS2',
    name: 'Element Weaver',
    parent: 'elementWeaverS1',
    race: 'highelf',
    archetype: 'highelf',
    stage: 2,
    desc: 'Tecelão elemental avançado combinando rajadas trine-elementais.',
    base: { atk: 18, def: 18, hp: 210, mp: 340, eva: 10, crit: 10, matk: 95, mdef: 50 },
    skillTree: 'elementWeaver'
  },
  elementWeaver: {
    id: 'elementWeaver',
    name: 'Element Weaver',
    parent: 'elementWeaverS2',
    race: 'highelf',
    archetype: 'highelf',
    stage: 3,
    desc: 'Mago elemental supremo High Elf fundindo Fogo, Água e Vento.',
    base: { atk: 30, def: 30, hp: 420, mp: 650, eva: 16, crit: 16, matk: 185, mdef: 100 },
    skillTree: 'elementWeaver'
  }
};
