// ═══════════════════════════════════════════
// CLASSES — Sylph (Sharpshooter, Wind Sniper & Storm Blaster)
// ═══════════════════════════════════════════

export const SYLPH_CLASSES = {
  sylphGunner: {
    id: 'sylphGunner',
    name: 'Sylph Gunner',
    race: 'sylph',
    archetype: 'fighter',
    stage: 0,
    desc: 'Atirador elemental Sylph com pistolas de vento.',
    base: { atk: 14, def: 8, hp: 90, mp: 40, eva: 12, crit: 8, matk: 10, mdef: 6 },
    skillTree: 'stormBlaster'
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    parent: 'sylphGunner',
    race: 'sylph',
    archetype: 'fighter',
    stage: 1,
    desc: 'Atirador de precisão elemental com armas de fogo do vento.',
    base: { atk: 28, def: 12, hp: 160, mp: 65, eva: 18, crit: 14, matk: 18, mdef: 12 },
    skillTree: 'stormBlaster'
  },
  windSniper: {
    id: 'windSniper',
    name: 'Wind Sniper',
    parent: 'sharpshooter',
    race: 'sylph',
    archetype: 'fighter',
    stage: 2,
    desc: 'Sniper do vento com rajadas elementais e esquiva flutuante.',
    base: { atk: 66, def: 20, hp: 300, mp: 110, eva: 28, crit: 24, matk: 35, mdef: 22 },
    skillTree: 'stormBlaster'
  },
  stormBlaster: {
    id: 'stormBlaster',
    name: 'Storm Blaster',
    parent: 'windSniper',
    race: 'sylph',
    archetype: 'fighter',
    stage: 3,
    desc: 'Atirador supremo Sylph com Storm Shot e projéteis tempestuosos.',
    base: { atk: 140, def: 38, hp: 550, mp: 200, eva: 50, crit: 40, matk: 70, mdef: 45 },
    skillTree: 'stormBlaster'
  }
};
