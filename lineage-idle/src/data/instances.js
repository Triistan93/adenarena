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
  }
};
