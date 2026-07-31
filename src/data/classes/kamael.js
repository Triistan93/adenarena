// ═══════════════════════════════════════════
// CLASSES — Kamael (Trooper, Berserker, Soulhound, Trickster & Samurai)
// ═══════════════════════════════════════════

export const KAMAEL_CLASSES = {
  soulbreaker: {
    id: 'soulbreaker',
    name: 'Kamael Soulbreaker',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 0,
    desc: 'Classe base de combate com absorção de almas e rapieira.',
    base: { atk: 15, def: 8, hp: 95, mp: 40, eva: 8, crit: 8, matk: 12, mdef: 6 },
    skillTree: 'soulHound'
  },
  trooper: {
    id: 'trooper',
    name: 'Trooper',
    parent: 'soulbreaker',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 1,
    desc: 'Soldado Kamael com espada antiga e poderes de almas.',
    base: { atk: 30, def: 14, hp: 170, mp: 60, eva: 12, crit: 12, matk: 20, mdef: 10 },
    skillTree: 'doombringer'
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    parent: 'trooper',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 2,
    desc: 'Guerreiro frenético de espada antiga e arremessos ao alvo.',
    base: { atk: 64, def: 20, hp: 340, mp: 90, eva: 16, crit: 18, mdef: 18 },
    skillTree: 'doombringer'
  },
  doombringer: {
    id: 'doombringer',
    name: 'Doombringer',
    parent: 'berserker',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 3,
    desc: 'Trazedor da ruína com investidas furiadas e corte de asas.',
    base: { atk: 128, def: 40, hp: 620, mp: 160, eva: 32, crit: 32, mdef: 36 },
    skillTree: 'doombringer'
  },
  soulhound: {
    id: 'soulhound',
    name: 'Soulhound',
    parent: 'trooper',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 2,
    desc: 'Caçador de almas híbrido de florete físico e magia negra.',
    base: { atk: 62, def: 18, hp: 320, mp: 140, eva: 20, crit: 20, matk: 55, mdef: 25 },
    skillTree: 'soulHound'
  },
  soulHound: {
    id: 'soulHound',
    name: 'Soul Hound',
    parent: 'soulhound',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 3,
    desc: 'Mestre das almas com Leopold e estocadas mágicas fulminantes.',
    base: { atk: 124, def: 35, hp: 580, mp: 280, eva: 40, crit: 36, matk: 110, mdef: 50 },
    skillTree: 'soulHound'
  },
  warder: {
    id: 'warder',
    name: 'Warder',
    parent: 'soulbreaker',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 1,
    desc: 'Atiradora Kamael com bestas e armadilhas de alma.',
    base: { atk: 28, def: 12, hp: 160, mp: 65, eva: 14, crit: 14, mdef: 12 },
    skillTree: 'trickster'
  },
  arbalester: {
    id: 'arbalester',
    name: 'Arbalester',
    parent: 'warder',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 2,
    desc: 'Especialista em besta de disparo rápido e esquiva sombria.',
    base: { atk: 60, def: 16, hp: 300, mp: 100, eva: 22, crit: 22, mdef: 20 },
    skillTree: 'trickster'
  },
  trickster: {
    id: 'trickster',
    name: 'Trickster',
    parent: 'arbalester',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 3,
    desc: 'Mestre da iludimento com disparos letais de besta e armadilhas.',
    base: { atk: 120, def: 32, hp: 540, mp: 180, eva: 44, crit: 40, mdef: 38 },
    skillTree: 'trickster'
  },
  hatamoto: {
    id: 'hatamoto',
    name: 'Hatamoto',
    parent: 'soulbreaker',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 1,
    desc: 'Guerreiro Kamael ancestral do caminho da katana.',
    base: { atk: 32, def: 12, hp: 175, mp: 50, eva: 14, crit: 16, mdef: 10 },
    skillTree: 'samurai'
  },
  ronin: {
    id: 'ronin',
    name: 'Ronin',
    parent: 'hatamoto',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 2,
    desc: 'Espadachim Kamael do caminho do bushido e cortes rápidos.',
    base: { atk: 65, def: 20, hp: 330, mp: 85, eva: 24, crit: 24, mdef: 20 },
    skillTree: 'samurai'
  },
  samurai: {
    id: 'samurai',
    name: 'Samurai',
    parent: 'ronin',
    race: 'kamael',
    archetype: 'soulbreaker',
    stage: 3,
    desc: 'Mestre Kamael da katana com espírito do corte supremo.',
    base: { atk: 132, def: 40, hp: 600, mp: 150, eva: 45, crit: 42, mdef: 40 },
    skillTree: 'samurai'
  }
};
