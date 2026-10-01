// instances.js — Instâncias Solo Diárias: Kamaloka & Pailaka
export const SOLO_INSTANCES = {
  kamaloka_25: {
    id: 'kamaloka_25',
    name: 'Kamaloka de Gludio (Hall of the Abyss)',
    type: 'kamaloka',
    minLvl: 25,
    maxLvl: 35,
    icon: '🌀⚔️',
    minimumCP: 3000,
    recommendedCP: 4500,
    bossName: 'Kanore, o Carrasco do Abismo',
    bossHp: 8500,
    bossAtk: 180,
    bossDef: 40,
    bossMdef: 55,
    desc: 'Fenda dimensional em Gludio infestada de sombras. O carrasco Kanore protege joias D-Grade preciosas.',
    rewards: {
      xp: 45000,
      gold: 30000,
      sp: 150,
      items: ['scroll_enchant_weapon_d', 'scroll_enchant_armor_d'],
      guaranteedRewardText: 'Pacote D-Grade + Pergaminhos de Encantamento D'
    }
  },
  pailaka_36: {
    id: 'pailaka_36',
    name: 'Pailaka: Song of Ice and Fire (Forgotten Temple)',
    type: 'pailaka',
    minLvl: 36,
    maxLvl: 48,
    icon: '🔥❄️',
    minimumCP: 6000,
    recommendedCP: 9000,
    bossName: 'Gargoyle Lord & Fire Sprite King',
    bossHp: 22000,
    bossAtk: 350,
    bossDef: 60,
    bossMdef: 80,
    desc: 'O templo esquecido onde elementos colidem. Derrote o Senhor dos Espíritos para libertar o templo.',
    rewards: {
      xp: 120000,
      gold: 60000,
      sp: 300,
      items: ['pailaka_ring', 'magic_lamp'],
      guaranteedRewardText: 'Anel Sagrado de Pailaka + 1x Lâmpada Mágica'
    }
  },
  kamaloka_49: {
    id: 'kamaloka_49',
    name: 'Kamaloka de Dion (Labyrinth of the Abyss)',
    type: 'kamaloka',
    minLvl: 49,
    maxLvl: 57,
    icon: '🌀🐊',
    minimumCP: 12000,
    recommendedCP: 17000,
    bossName: 'White Alligator Lord (Rei dos Pântanos)',
    bossHp: 55000,
    bossAtk: 620,
    bossDef: 90,
    bossMdef: 120,
    desc: 'O labirinto submerso sob os pântanos de Cruma. O crocodilo albino gigante guarda tesouros C-Grade.',
    rewards: {
      xp: 280000,
      gold: 120000,
      sp: 500,
      items: ['scroll_enchant_weapon_c', 'scroll_enchant_armor_c'],
      guaranteedRewardText: 'Joias C-Grade + Pergaminhos de Encantamento C'
    }
  },
  pailaka_58: {
    id: 'pailaka_58',
    name: "Pailaka: Devil's Legacy (Dragon Valley)",
    type: 'pailaka',
    minLvl: 58,
    maxLvl: 65,
    icon: '🐉⚡',
    minimumCP: 22000,
    recommendedCP: 32000,
    bossName: 'Lesser Drake Lord (Lorde Dragão de Fogo)',
    bossHp: 110000,
    bossAtk: 980,
    bossDef: 130,
    bossMdef: 170,
    desc: 'O covil profundo de Dragon Valley. O dragão menor despertou com poderes da fenda demoníaca.',
    rewards: {
      xp: 600000,
      gold: 250000,
      sp: 800,
      items: ['pailaka_bracelet', 'magic_lamp'],
      guaranteedRewardText: 'Bracelete do Dragão de Pailaka + 2x Lâmpadas Mágicas + B-Grade'
    }
  },
  frost_lords_castle: {
    id: 'frost_lords_castle',
    name: "Castelo do Senhor do Gelo (Frost Lord's Castle)",
    type: 'special_zone',
    minLvl: 80,
    minimumCP: 70000,
    recommendedCP: 100000,
    icon: '🏰❄️',
    bossName: 'Reggiesys → Tiron → Glakias',
    bossHp: 220000,
    bossAtk: 1250,
    bossDef: 850,
    bossMdef: 900,
    desc: 'Expedição dimensional em três etapas. O desempenho contra Tiron determina qual forma de Glakias protege o castelo.',
    stages: [
      {
        id: 'reggiesys', name: 'Reggiesys, Sentinela Congelada', hp: 220000, atk: 1250, def: 850, mdef: 900,
        skill: { name: 'Lança de Geada Perfurante', type: 'physical', effect: 'bleed', mult: 1.45, cd: 5 }
      },
      {
        id: 'tiron', name: 'Tiron, Conselheiro Real', hp: 310000, atk: 1550, def: 1050, mdef: 1250,
        skill: { name: 'Prisão do Inverno Eterno', type: 'magical', effect: 'root', mult: 1.55, cd: 5 }
      },
      {
        id: 'glakias', name: 'Glakias, Senhor do Gelo', hp: 520000, atk: 1900, def: 1400, mdef: 1700,
        skill: { name: 'Tempestade Glacial de Glakias', type: 'magical', effect: 'stun', mult: 1.7, cd: 6 },
        alternateName: 'Glakias, Senhor do Gelo Aterrador', alternateHp: 680000, alternateAtk: 2250,
        alternateSkill: { name: 'Eclipse do Inverno Profundo', type: 'magical', effect: 'stun', mult: 1.8, cd: 6 }
      }
    ],
    rewards: {
      xp: 1800000,
      gold: 950000,
      sp: 14000,
      items: ['frost_lord_dark_heart', 'frost_crystal'],
      guaranteedRewardText: 'Coração de Frost Lord + Cristal do Gelo Eterno'
    }
  },
  fafurion_nest: {
    id: 'fafurion_nest',
    name: "Ninho de Fafurion (Fafurion's Nest)",
    type: 'special_zone',
    minLvl: 88,
    minimumCP: 90000,
    recommendedCP: 125000,
    icon: '🌊🐉',
    entryReset: 'weekly',
    bossName: 'Pedra Guardiã → Fafurion, Dragão das Águas',
    bossHp: 380000,
    bossAtk: 1850,
    bossDef: 1500,
    bossMdef: 1800,
    desc: 'Expedição semanal adaptada em duas etapas; as pedras guardiãs protegem a arena antes das três fases de Fafurion.',
    stages: [
      { id: 'guarding_stone', name: 'Pedra Guardiã das Marés', hp: 380000, atk: 1850, def: 1500, mdef: 1800, skill: { name: 'Pulso da Pedra Abissal', type: 'magical', effect: 'root', mult: 1.55, cd: 5 } },
      {
        id: 'fafurion', name: 'Fafurion, Dragão das Águas', hp: 1250000, atk: 2500, def: 2200, mdef: 2600,
        skill: { name: 'Tsunami do Ninho', type: 'magical', effect: 'root', mult: 1.75, cd: 6 },
        phases: [
          { name: 'Maré dos Guardiões', triggerHp: 0.66, atkMultiplier: 1.12, statusEffect: { name: 'Pressão Abissal', durationMs: 4000, intervalMs: 1000, damagePercent: 0.02 }, text: '🌊 Pedras guardiãs despertam e inundam a arena.' },
          { name: 'Ninho Submerso', triggerHp: 0.33, atkMultiplier: 1.20, statusEffect: { name: 'Sufocamento das Profundezas', durationMs: 4000, intervalMs: 1000, damagePercent: 0.03 }, text: '🫧 A arena afunda; Fafurion reúne toda a força do abismo.' }
        ]
      }
    ],
    rewards: { xp: 3400000, gold: 2100000, sp: 26000, items: ['armor_fafurion_cloack', 'frost_crystal'], guaranteedRewardText: 'Manto de Fafurion + Cristal do Gelo Eterno' }
  },
  steel_citadel: {
    id: 'steel_citadel',
    name: 'Cidadela de Aço (Steel Citadel · Hellbound CT 1.5)',
    type: 'special_zone',
    minLvl: 76,
    minimumCP: 85000,
    recommendedCP: 120000,
    icon: '🏰⚙️',
    bossName: 'Demon Prince → Ranku → Darion → Epidos → Beleth',
    bossHp: 300000,
    bossAtk: 1500,
    bossDef: 1200,
    bossMdef: 1250,
    desc: 'Progressão adaptada de Hellbound: Base Tower, Tower of Infinitum, Tully’s Workshop e Tower of Naia.',
    stages: [
      { id: 'demon_prince', name: 'Demon Prince, Senhor da Torre Infinita', hp: 300000, atk: 1500, def: 1200, mdef: 1250, skill: { name: 'Marca do Príncipe Demoníaco', type: 'magical', effect: 'poison', mult: 1.5, cd: 5 } },
      { id: 'ranku', name: 'Ranku, Executor da Cidadela', hp: 360000, atk: 1750, def: 1400, mdef: 1350, skill: { name: 'Ruptura de Ranku', type: 'physical', effect: 'bleed', mult: 1.55, cd: 5 } },
      { id: 'darion', name: 'Darion, Comandante de Tully', hp: 440000, atk: 1950, def: 1600, mdef: 1550, skill: { name: 'Bombardeio de Tully', type: 'magical', effect: 'stun', mult: 1.6, cd: 6 } },
      { id: 'epidos', name: 'Epidos, Guardião da Torre de Naia', hp: 540000, atk: 2200, def: 1850, mdef: 1800, skill: { name: 'Véu de Espinhos de Epidos', type: 'magical', effect: 'root', mult: 1.65, cd: 6 } },
      { id: 'beleth', name: 'Beleth, Senhor da Steel Citadel', hp: 760000, atk: 2600, def: 2200, mdef: 2400, skill: { name: 'Abismo Arcano de Beleth', type: 'magical', effect: 'stun', mult: 1.8, cd: 6 } }
    ],
    rewards: { xp: 2600000, gold: 1400000, sp: 18000, items: ['beleth_staff', 'book_4star'], guaranteedRewardText: 'Beleth Staff + Tomo Sagrado 4★' }
  },
  celestial_tower_event: {
    id: 'celestial_tower_event',
    name: 'Torre Celestial (Evento de Ferion)',
    type: 'special_zone',
    minLvl: 89,
    minimumCP: 130000,
    recommendedCP: 170000,
    icon: '🌌🏰',
    entryReset: 'weekly',
    bossName: 'Praetorian Celestial → Ferion, Imperador Celestial',
    bossHp: 620000,
    bossAtk: 2200,
    bossDef: 1900,
    bossMdef: 2200,
    eventWindow: { weekdayUTC: 5, startHourUTC: 22, endHourUTC: 23 },
    desc: 'Evento semanal adaptado: vença a guarda celestial e alcance Ferion durante a janela de sexta-feira.',
    stages: [
      { id: 'ferion_praetorian', name: 'Praetorian Celestial de Ferion', hp: 620000, atk: 2200, def: 1900, mdef: 2200, skill: { name: 'Lança do Firmamento', type: 'physical', effect: 'stun', mult: 1.65, cd: 6 } },
      { id: 'ferion', name: 'Ferion, Imperador Celestial', hp: 980000, atk: 2850, def: 2500, mdef: 2900, skill: { name: 'Colapso Celestial de Ferion', type: 'magical', effect: 'stun', mult: 1.9, cd: 6 } }
    ],
    rewards: { xp: 3200000, gold: 1800000, sp: 24000, items: ['book_4star', 'scroll_blessed_weapon'], guaranteedRewardText: 'Tomo Sagrado 4★ + Pergaminho Abençoado' }
  }
};
