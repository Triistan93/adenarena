// ═══════════════════════════════════════════
// CLASSES — Dwarf (Bounty Hunter, Warsmith & ShineMaker)
// ═══════════════════════════════════════════

export const DWARF_CLASSES = {
  artisan: {
    id: 'artisan',
    name: 'Dwarf Artisan',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 0,
    desc: 'Classe base anã de coleta e criação.',
    base: { atk: 12, def: 14, hp: 120, mp: 30, eva: 3, crit: 4, matk: 0, mdef: 6, lootBonus: 0.15 },
    skillTree: 'shinemaker'
  },
  scavenger: {
    id: 'scavenger',
    name: 'Scavenger',
    parent: 'artisan',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 1,
    desc: 'Coletor anão especialista em Spoil e extração de materiais.',
    base: { atk: 22, def: 24, hp: 200, mp: 40, eva: 5, crit: 6, mdef: 12, lootBonus: 0.35 },
    skillTree: 'fortuneSeeker'
  },
  bountyHunter: {
    id: 'bountyHunter',
    name: 'Bounty Hunter',
    parent: 'scavenger',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 2,
    desc: 'Caçador de recompensas com Spoil Crush e alto ganho de loot.',
    base: { atk: 45, def: 48, hp: 400, mp: 80, eva: 8, crit: 10, mdef: 24, lootBonus: 0.60 },
    skillTree: 'fortuneSeeker'
  },
  fortuneSeeker: {
    id: 'fortuneSeeker',
    name: 'Fortune Seeker',
    parent: 'bountyHunter',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 3,
    desc: 'Buscador da fortuna supremo com saque duplo e riqueza lendária.',
    base: { atk: 90, def: 88, hp: 750, mp: 150, eva: 14, crit: 16, mdef: 48, lootBonus: 1.00 },
    skillTree: 'fortuneSeeker'
  },
  artisanClass: {
    id: 'artisanClass',
    name: 'Artisan Master',
    parent: 'artisan',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 1,
    desc: 'Artesão mestre capaz de forjar equipamentos e invocar autômatos.',
    base: { atk: 24, def: 26, hp: 210, mp: 45, eva: 4, crit: 5, mdef: 14, lootBonus: 0.25 },
    skillTree: 'maestro'
  },
  warsmith: {
    id: 'warsmith',
    name: 'Warsmith',
    parent: 'artisanClass',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 2,
    desc: 'Ferreiro de guerra que invoca canhões e autômatos de cerco.',
    base: { atk: 50, def: 52, hp: 420, mp: 90, eva: 6, crit: 8, mdef: 28, lootBonus: 0.40 },
    skillTree: 'maestro'
  },
  maestro: {
    id: 'maestro',
    name: 'Maestro',
    parent: 'warsmith',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 3,
    desc: 'Maestro da forja com golems gigantes e receitas lendárias.',
    base: { atk: 98, def: 96, hp: 800, mp: 160, eva: 12, crit: 14, mdef: 55, lootBonus: 0.70 },
    skillTree: 'maestro'
  },
  // --- SPECIAL ESSENCE DWARF ---
  shinemakerS1: {
    id: 'shinemakerS1',
    name: 'ShineMaker',
    parent: 'artisan',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 1,
    desc: 'Iniciando no caminho da luz cristalina e magia dos minérios.',
    base: { atk: 24, def: 20, hp: 180, mp: 80, eva: 6, crit: 8, matk: 30, mdef: 18 },
    skillTree: 'shinemaker'
  },
  shinemakerS2: {
    id: 'shinemakerS2',
    name: 'ShineMaker',
    parent: 'shinemakerS1',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 2,
    desc: 'Guerreiro anão cristalino de suporte e dano mágico radiante.',
    base: { atk: 55, def: 45, hp: 360, mp: 180, eva: 10, crit: 12, matk: 65, mdef: 35 },
    skillTree: 'shinemaker'
  },
  shinemaker: {
    id: 'shinemaker',
    name: 'ShineMaker',
    parent: 'shinemakerS2',
    race: 'dwarf',
    archetype: 'artisan',
    stage: 3,
    desc: 'Mestre da luz cristalina — DPS/Suporte supremo com martelos brilhantes.',
    base: { atk: 110, def: 78, hp: 680, mp: 350, eva: 16, crit: 20, matk: 135, mdef: 70, lootBonus: 0.80 },
    skillTree: 'shinemaker'
  }
};
