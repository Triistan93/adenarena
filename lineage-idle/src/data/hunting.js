// hunting.js — Catálogo de Dados da Profissão de Caça Silvestre & Peles de Aden (Lineage II Style)

export const HUNTING_ZONES = {
  zone_talking_forest: {
    id: 'zone_talking_forest',
    name: 'Bosques de Talking Island',
    icon: '🌲',
    minLevel: 15,
    difficulty: 1,
    description: 'Bosques densos e calmos ao redor da vila inicial. Lar de animais jovens e pequenos predadores.',
    availablePrey: ['prey_hare', 'prey_fox', 'prey_stag', 'prey_young_boar'],
    requiredLure: null,
    baseTrackTime: 3000
  },
  zone_gludio_plains: {
    id: 'zone_gludio_plains',
    name: 'Planícies de Gludio',
    icon: '🌾',
    minLevel: 18,
    difficulty: 2,
    description: 'Campos abertos marcados por guerras antigas. Alcateias de lobos velozes e javalis robustos patrulham as colinas.',
    availablePrey: ['prey_grey_wolf', 'prey_plains_boar', 'prey_wasteland_hyena', 'prey_alpha_wolf'],
    requiredLure: 'lure_meat',
    baseTrackTime: 3500
  },
  zone_dion_hills: {
    id: 'zone_dion_hills',
    name: 'Colinas e Pântanos de Dion',
    icon: '🌿',
    minLevel: 22,
    difficulty: 3,
    description: 'Vegetação exuberante e encostas úmidas. Ursos pardos imponentes e aves de rapina dominam o território.',
    availablePrey: ['prey_brown_bear', 'prey_marsh_panther', 'prey_hunting_hawk', 'prey_swamp_alligator'],
    requiredLure: 'lure_scent',
    baseTrackTime: 4000
  },
  zone_giran_wilderness: {
    id: 'zone_giran_wilderness',
    name: 'Selva Litorânea de Giran',
    icon: '🌴',
    minLevel: 26,
    difficulty: 4,
    description: 'Selva tropical fechada cheia de predadores venenosos, felinos ágeis e serpentes colossais.',
    availablePrey: ['prey_shadow_panther', 'prey_savanna_lion', 'prey_giant_viper', 'prey_giran_gorgon_hound'],
    requiredLure: 'lure_scent',
    baseTrackTime: 4500
  },
  zone_oren_snowlands: {
    id: 'zone_oren_snowlands',
    name: 'Terras Nevadas de Oren',
    icon: '❄️',
    minLevel: 32,
    difficulty: 5,
    description: 'Florestas de pinheiros cobertas de gelo eterno. Feras albas com peles espessas e dentes afiados.',
    availablePrey: ['prey_frost_tiger', 'prey_cave_bear', 'prey_snow_wolf', 'prey_tundra_mammoth'],
    requiredLure: 'lure_blood',
    baseTrackTime: 5000
  },
  zone_goddard_peaks: {
    id: 'zone_goddard_peaks',
    name: 'Picos Rochosos de Goddard',
    icon: '⛰️',
    minLevel: 38,
    difficulty: 6,
    description: 'Penhascos vulcânicos e cumes cortantes. Ninhos de grifos selvagens e quimeras ancestrais de Aden.',
    availablePrey: ['prey_mountain_chimera', 'prey_wild_gryphon', 'prey_young_wyvern', 'prey_phoenix_hawk'],
    requiredLure: 'lure_crystal',
    baseTrackTime: 6000
  }
};

export function getHuntingZonesList() {
  return Object.values(HUNTING_ZONES);
}

export const APPROACH_TACTICS = {
  stalk: {
    id: 'stalk',
    name: 'Aproximação Furtiva',
    icon: '👣',
    desc: 'Move-se contra o vento nas folhagens. +25% chance de Pele Perfeita, tempo +20%.',
    timeMult: 1.2,
    qualityBonus: 0.25,
    durabilityCost: 1
  },
  ambush: {
    id: 'ambush',
    name: 'Emboscada Equilibrada',
    icon: '🎯',
    desc: 'Aguarda o momento exato em ponto cego. Rendimento e tempo balanceados.',
    timeMult: 1.0,
    qualityBonus: 0.0,
    durabilityCost: 1
  },
  rush: {
    id: 'rush',
    name: 'Investida Rápida',
    icon: '⚡',
    desc: 'Dispara com ímpeto para encurralar sem hesitar. -35% de tempo de rastreio, -15% qualidade.',
    timeMult: 0.65,
    qualityBonus: -0.15,
    durabilityCost: 1
  }
};

export const PREY_CATALOG = {
  // Comum (Talking Island & Gludio)
  prey_hare: {
    id: 'prey_hare', name: 'Lebre das Colinas', icon: '🐇', rarity: 'common', behavior: 'elusive',
    weightRange: '1-3 kg', xpReward: 6, sellPrice: 15,
    skinYield: { primary: 'leather', primaryQty: 2, secondary: 'cord', secondaryQty: 1 },
    exchangeRate: 5, exchangeReward: 'leather', exchangeRewardName: 'Couro Curtido',
    zones: ['zone_talking_forest']
  },
  prey_fox: {
    id: 'prey_fox', name: 'Raposa Astuta de Aden', icon: '🦊', rarity: 'common', behavior: 'elusive',
    weightRange: '4-8 kg', xpReward: 8, sellPrice: 25,
    skinYield: { primary: 'leather', primaryQty: 3, secondary: 'cotton_thread', secondaryQty: 2 },
    exchangeRate: 5, exchangeReward: 'leather', exchangeRewardName: 'Couro Curtido',
    zones: ['zone_talking_forest']
  },
  prey_young_boar: {
    id: 'prey_young_boar', name: 'Javali Jovem', icon: '🐗', rarity: 'common', behavior: 'calm',
    weightRange: '15-30 kg', xpReward: 10, sellPrice: 35,
    skinYield: { primary: 'leather', primaryQty: 4, secondary: 'bone', secondaryQty: 2 },
    exchangeRate: 5, exchangeReward: 'bone', exchangeRewardName: 'Osso Animal',
    zones: ['zone_talking_forest']
  },
  prey_grey_wolf: {
    id: 'prey_grey_wolf', name: 'Lobo Cinzento de Gludio', icon: '🐺', rarity: 'common', behavior: 'aggressive',
    weightRange: '20-40 kg', xpReward: 12, sellPrice: 40,
    skinYield: { primary: 'leather', primaryQty: 5, secondary: 'bone', secondaryQty: 3 },
    exchangeRate: 5, exchangeReward: 'bone', exchangeRewardName: 'Osso Animal',
    zones: ['zone_gludio_plains']
  },

  // Incomum
  prey_stag: {
    id: 'prey_stag', name: 'Cervo Nobre de Elven', icon: '🦌', rarity: 'uncommon', behavior: 'elusive',
    weightRange: '50-90 kg', xpReward: 18, sellPrice: 80,
    skinYield: { primary: 'leather', primaryQty: 2, secondary: 'bone', secondaryQty: 3 },
    exchangeRate: 3, exchangeReward: 'leather', exchangeRewardName: 'Couro Curtido',
    zones: ['zone_talking_forest']
  },
  prey_plains_boar: {
    id: 'prey_plains_boar', name: 'Javali Couraçado', icon: '🐗', rarity: 'uncommon', behavior: 'tenacious',
    weightRange: '60-110 kg', xpReward: 20, sellPrice: 95,
    skinYield: { primary: 'leather', primaryQty: 2, secondary: 'cokes', secondaryQty: 1 },
    exchangeRate: 3, exchangeReward: 'leather', exchangeRewardName: 'Couro Curtido',
    zones: ['zone_gludio_plains']
  },
  prey_wasteland_hyena: {
    id: 'prey_wasteland_hyena', name: 'Hiena dos Ermos', icon: '🐕', rarity: 'uncommon', behavior: 'aggressive',
    weightRange: '30-55 kg', xpReward: 22, sellPrice: 110,
    skinYield: { primary: 'leather', primaryQty: 2, secondary: 'braided_hemp', secondaryQty: 2 },
    exchangeRate: 3, exchangeReward: 'suede', exchangeRewardName: 'Camurça',
    zones: ['zone_gludio_plains']
  },
  prey_hunting_hawk: {
    id: 'prey_hunting_hawk', name: 'Falcão Caçador de Dion', icon: '🦅', rarity: 'uncommon', behavior: 'elusive',
    weightRange: '3-6 kg', xpReward: 25, sellPrice: 125,
    skinYield: { primary: 'leather', primaryQty: 2, secondary: 'cord', secondaryQty: 3 },
    exchangeRate: 3, exchangeReward: 'braided_hemp', exchangeRewardName: 'Cânhamo Trançado',
    zones: ['zone_dion_hills']
  },

  // Raro
  prey_alpha_wolf: {
    id: 'prey_alpha_wolf', name: 'Lobo Alfa da Presa Negra', icon: '🐺', rarity: 'rare', behavior: 'aggressive',
    weightRange: '55-80 kg', xpReward: 40, sellPrice: 250,
    skinYield: { primary: 'crafted_leather', primaryQty: 1, secondary: 'bone', secondaryQty: 5 },
    exchangeRate: 2, exchangeReward: 'crafted_leather', exchangeRewardName: 'Couro Trabalhado',
    zones: ['zone_gludio_plains']
  },
  prey_brown_bear: {
    id: 'prey_brown_bear', name: 'Urso Pardo das Colinas', icon: '🐻', rarity: 'rare', behavior: 'tenacious',
    weightRange: '180-320 kg', xpReward: 45, sellPrice: 300,
    skinYield: { primary: 'crafted_leather', primaryQty: 1, secondary: 'cokes', secondaryQty: 2 },
    exchangeRate: 2, exchangeReward: 'crafted_leather', exchangeRewardName: 'Couro Trabalhado',
    zones: ['zone_dion_hills']
  },
  prey_marsh_panther: {
    id: 'prey_marsh_panther', name: 'Pantera do Pântano', icon: '🐆', rarity: 'rare', behavior: 'elusive',
    weightRange: '70-100 kg', xpReward: 50, sellPrice: 350,
    skinYield: { primary: 'crafted_leather', primaryQty: 2, secondary: 'suede', secondaryQty: 4 },
    exchangeRate: 2, exchangeReward: 'crafted_leather', exchangeRewardName: 'Couro Trabalhado',
    zones: ['zone_dion_hills']
  },
  prey_swamp_alligator: {
    id: 'prey_swamp_alligator', name: 'Jacaré Blindado de Dion', icon: '🐊', rarity: 'rare', behavior: 'tenacious',
    weightRange: '120-220 kg', xpReward: 55, sellPrice: 400,
    skinYield: { primary: 'crafted_leather', primaryQty: 2, secondary: 'bone', secondaryQty: 8 },
    exchangeRate: 2, exchangeReward: 'steel', exchangeRewardName: 'Aço Refinado',
    zones: ['zone_dion_hills']
  },
  prey_savanna_lion: {
    id: 'prey_savanna_lion', name: 'Leão Imperial da Savana', icon: '🦁', rarity: 'rare', behavior: 'aggressive',
    weightRange: '150-250 kg', xpReward: 60, sellPrice: 450,
    skinYield: { primary: 'crafted_leather', primaryQty: 2, secondary: 'cord', secondaryQty: 5 },
    exchangeRate: 2, exchangeReward: 'crafted_leather', exchangeRewardName: 'Couro Trabalhado',
    zones: ['zone_giran_wilderness']
  },
  prey_snow_wolf: {
    id: 'prey_snow_wolf', name: 'Lobo Polar das Geleiras', icon: '🐺', rarity: 'rare', behavior: 'aggressive',
    weightRange: '60-90 kg', xpReward: 65, sellPrice: 500,
    skinYield: { primary: 'crafted_leather', primaryQty: 2, secondary: 'varnish', secondaryQty: 5 },
    exchangeRate: 2, exchangeReward: 'mithril_alloy', exchangeRewardName: 'Liga de Mithril',
    zones: ['zone_oren_snowlands']
  },

  // Épico
  prey_shadow_panther: {
    id: 'prey_shadow_panther', name: 'Pantera das Sombras de Giran', icon: '🐈‍⬛', rarity: 'epic', behavior: 'elusive',
    weightRange: '90-140 kg', xpReward: 100, sellPrice: 1000,
    skinYield: { primary: 'crafted_leather', primaryQty: 4, secondary: 'enria', secondaryQty: 1 },
    exchangeRate: 1, exchangeReward: 'enria', exchangeRewardName: 'Enria',
    zones: ['zone_giran_wilderness']
  },
  prey_giant_viper: {
    id: 'prey_giant_viper', name: 'Víbora Titânica da Selva', icon: '🐍', rarity: 'epic', behavior: 'aggressive',
    weightRange: '100-200 kg', xpReward: 110, sellPrice: 1200,
    skinYield: { primary: 'crafted_leather', primaryQty: 4, secondary: 'metallic_thread', secondaryQty: 2 },
    exchangeRate: 1, exchangeReward: 'metallic_thread', exchangeRewardName: 'Fio Metálico',
    zones: ['zone_giran_wilderness']
  },
  prey_frost_tiger: {
    id: 'prey_frost_tiger', name: 'Tigre Dentes-de-Sabre Glacial', icon: '🐅', rarity: 'epic', behavior: 'aggressive',
    weightRange: '180-280 kg', xpReward: 125, sellPrice: 1400,
    skinYield: { primary: 'crafted_leather', primaryQty: 5, secondary: 'mold_lubricant', secondaryQty: 2 },
    exchangeRate: 1, exchangeReward: 'durable_metal_plate', exchangeRewardName: 'Placa de Metal Durável',
    zones: ['zone_oren_snowlands']
  },
  prey_cave_bear: {
    id: 'prey_cave_bear', name: 'Urso Ancião das Cavernas', icon: '🐻‍❄️', rarity: 'epic', behavior: 'tenacious',
    weightRange: '350-550 kg', xpReward: 140, sellPrice: 1600,
    skinYield: { primary: 'crafted_leather', primaryQty: 5, secondary: 'oriharukon_ore', secondaryQty: 2 },
    exchangeRate: 1, exchangeReward: 'oriharukon_ore', exchangeRewardName: 'Minério de Oriharukon',
    zones: ['zone_oren_snowlands']
  },

  // Lendário (Oren & Goddard)
  prey_tundra_mammoth: {
    id: 'prey_tundra_mammoth', name: 'Mamute Colossal da Tundra', icon: '🦣', rarity: 'legendary', behavior: 'tenacious',
    weightRange: '2000-4500 kg', xpReward: 250, sellPrice: 3500,
    skinYield: { primary: 'crafted_leather', primaryQty: 10, secondary: 'durable_metal_plate', secondaryQty: 3 },
    exchangeRate: 1, exchangeReward: 'durable_metal_plate', exchangeRewardName: 'Placa de Metal Durável x2',
    zones: ['zone_oren_snowlands']
  },
  prey_mountain_chimera: {
    id: 'prey_mountain_chimera', name: 'Quimera Real dos Picos', icon: '🦁', rarity: 'legendary', behavior: 'aggressive',
    weightRange: '400-750 kg', xpReward: 300, sellPrice: 4500,
    skinYield: { primary: 'crafted_leather', primaryQty: 12, secondary: 'enria', secondaryQty: 3 },
    exchangeRate: 1, exchangeReward: 'enria', exchangeRewardName: 'Enria x3',
    zones: ['zone_goddard_peaks']
  },
  prey_wild_gryphon: {
    id: 'prey_wild_gryphon', name: 'Grifo Selvagem de Goddard', icon: '🦅', rarity: 'legendary', behavior: 'elusive',
    weightRange: '300-600 kg', xpReward: 320, sellPrice: 5000,
    skinYield: { primary: 'crafted_leather', primaryQty: 15, secondary: 'oriharukon_ore', secondaryQty: 4 },
    exchangeRate: 1, exchangeReward: 'oriharukon_ore', exchangeRewardName: 'Minério de Oriharukon x3',
    zones: ['zone_goddard_peaks']
  },
  prey_young_wyvern: {
    id: 'prey_young_wyvern', name: 'Wyvern Alfa da Cordilheira', icon: '🐉', rarity: 'legendary', behavior: 'aggressive',
    weightRange: '600-1200 kg', xpReward: 400, sellPrice: 7500,
    skinYield: { primary: 'crafted_leather', primaryQty: 20, secondary: 'metallic_thread', secondaryQty: 6 },
    exchangeRate: 1, exchangeReward: 'durable_metal_plate', exchangeRewardName: 'Placa de Metal Durável x4',
    zones: ['zone_goddard_peaks']
  }
};

export const KNIVES_CATALOG = {
  knife_none: {
    id: 'knife_none',
    name: 'Faca Rústica de Caça',
    grade: 'none',
    icon: '🔪',
    minHuntingLevel: 1,
    durabilityMax: 50,
    repairCost: 500,
    buyPrice: 0,
    perfectSkinBonus: 0.0,
    desc: 'Lâmina simples feita de ferro batido. Útil para pequenos animais.'
  },
  knife_d: {
    id: 'knife_d',
    name: 'Faca de Aço de Gludio',
    grade: 'd',
    icon: '🗡️',
    minHuntingLevel: 3,
    durabilityMax: 120,
    repairCost: 2500,
    buyPrice: 15000,
    perfectSkinBonus: 0.15,
    desc: 'Forjada pelos armeiros de Gludio. Fio afiado que aumenta em +15% a chance de peles perfeitas.'
  },
  knife_c: {
    id: 'knife_c',
    name: 'Faca de Mithril Élfico',
    grade: 'c',
    icon: '✨',
    minHuntingLevel: 8,
    durabilityMax: 250,
    repairCost: 7500,
    buyPrice: 60000,
    perfectSkinBonus: 0.30,
    desc: 'Lâmina leve e precisa abençoada pelos elfos. +30% chance de peles perfeitas.'
  },
  knife_b: {
    id: 'knife_b',
    name: 'Faca do Predador de Giran',
    grade: 'b',
    icon: '⚔️',
    minHuntingLevel: 15,
    durabilityMax: 450,
    repairCost: 20000,
    buyPrice: 200000,
    perfectSkinBonus: 0.50,
    desc: 'Usada pelos caçadores de elite da selva de Giran. +50% chance de peles perfeitas.'
  },
  knife_a: {
    id: 'knife_a',
    name: 'Lâmina Imperial do Mestre Caçador',
    grade: 'a',
    icon: '👑',
    minHuntingLevel: 25,
    durabilityMax: 800,
    repairCost: 60000,
    buyPrice: 750000,
    perfectSkinBonus: 0.80,
    desc: 'Obra-prima de aço damasco imperial. Corta couros grossos com maestria (+80% peles perfeitas).'
  }
};

export const LURES_CATALOG = {
  lure_meat: {
    id: 'lure_meat',
    name: 'Carne Fresca',
    icon: '🥩',
    buyPrice: 100,
    rarityBoost: 'uncommon',
    speedBoost: 1.15,
    desc: 'Isca básica que atrai rapidamente herbívoros e predadores comuns (+15% velocidade).'
  },
  lure_scent: {
    id: 'lure_scent',
    name: 'Feromônio Silvestre',
    icon: '🧪',
    buyPrice: 350,
    rarityBoost: 'rare',
    speedBoost: 1.25,
    desc: 'Atrativo aromático refinado. Atrai espécies raras das florestas e montanhas.'
  },
  lure_blood: {
    id: 'lure_blood',
    name: 'Isca de Sangue Alfa',
    icon: '🩸',
    buyPrice: 1000,
    rarityBoost: 'epic',
    speedBoost: 1.40,
    desc: 'Essência de sangue de presa alfa que atrai feras ferozes e épicas.'
  },
  lure_crystal: {
    id: 'lure_crystal',
    name: 'Essência Ancestral da Fera',
    icon: '🔮',
    buyPrice: 3000,
    rarityBoost: 'legendary',
    speedBoost: 1.60,
    desc: 'Frasco infundido com mana da terra. Indispensável para avistar quimeras e wyverns lendários.'
  }
};

export function getHuntingXpForLevel(level) {
  const lvl = Math.max(1, Math.min(30, Math.floor(level)));
  if (lvl >= 30) return 9999999;
  return lvl * lvl * 50;
}
