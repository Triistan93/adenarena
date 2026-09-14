// fishing.js — Catálogo de Dados do Sistema de Pesca de Aden (Lineage II Style)

export const FISHING_ZONES = {
  zone_talking_island: {
    id: "zone_talking_island",
    name: "Costa de Talking Island",
    icon: "🌊",
    minLevel: 15,
    difficulty: 1,
    description: "Águas calmas ideais para iniciantes. Cardumes abundantes de peixes comuns.",
    availableFish: ["fish_carp", "fish_goby", "fish_starfish", "fish_talking_squid"],
    requiredBait: null,
    baseCatchTime: 3000
  },
  zone_gludin: {
    id: "zone_gludin",
    name: "Porto de Gludin",
    icon: "⛵",
    minLevel: 18,
    difficulty: 2,
    description: "Um porto movimentado onde peixes se alimentam dos restos de carga e navios mercantes.",
    availableFish: ["fish_carp", "fish_gludin_puffer", "fish_octopus", "fish_ray", "fish_gludin_shark"],
    requiredBait: "bait_worm",
    baseCatchTime: 3500
  },
  zone_elven_village: {
    id: "zone_elven_village",
    name: "Lago de Elven Village",
    icon: "🏞️",
    minLevel: 22,
    difficulty: 3,
    description: "Águas cristalinas abençoadas pela Deusa Eva. Lar de espécies mágicas.",
    availableFish: ["fish_elven_trout", "fish_crystal_salmon", "fish_silver_bass", "fish_elven_goldfish"],
    requiredBait: "bait_lure",
    baseCatchTime: 4000
  },
  zone_dion: {
    id: "zone_dion",
    name: "Rio de Dion",
    icon: "🦆",
    minLevel: 26,
    difficulty: 4,
    description: "Correntes fortes que exigem técnica apurada. Peixes rápidos e robustos vivem aqui.",
    availableFish: ["fish_dion_eel", "fish_mud_catfish", "fish_dion_pike", "fish_river_crab", "fish_mandragora_fish"],
    requiredBait: "bait_golden",
    baseCatchTime: 4500
  },
  zone_giran: {
    id: "zone_giran",
    name: "Costa de Giran",
    icon: "🌅",
    minLevel: 32,
    difficulty: 5,
    description: "Mar aberto com grande profundidade. Lar de peixes valiosos, carnívoros e ferozes.",
    availableFish: ["fish_giran_dragonfish", "fish_swordfish", "fish_tuna", "fish_giran_manta", "fish_kraken_tentacle"],
    requiredBait: "bait_golden",
    baseCatchTime: 5000
  },
  zone_innadril: {
    id: "zone_innadril",
    name: "Lago Innadril",
    icon: "🏰",
    minLevel: 38,
    difficulty: 6,
    description: "O majestoso lago de águas esmeraldas que cerca a cidade de Heine. Esconde lendas ancestrais.",
    availableFish: ["fish_innadril_sunfish", "fish_rainbow_trout", "fish_abyssal_angler", "fish_siren_scale", "fish_water_dragon_fry"],
    requiredBait: "bait_crystal",
    baseCatchTime: 6000
  }
};

export function getFishingZonesList() {
  return Object.values(FISHING_ZONES);
}

export const FISH_CATALOG = {
  // Comum (50%)
  fish_carp: {
    id: "fish_carp", name: "Carpa-Cruzeiro", icon: "🐟", rarity: "common",
    baseWeight: { min: 0.5, max: 2.0 }, xpReward: 5, sellPrice: 20,
    exchangeRate: 5, materialReward: "stem", materialName: "Stem",
    zones: ["zone_talking_island", "zone_gludin"]
  },
  fish_goby: {
    id: "fish_goby", name: "Góbio Comum", icon: "🐠", rarity: "common",
    baseWeight: { min: 0.2, max: 0.8 }, xpReward: 5, sellPrice: 15,
    exchangeRate: 5, materialReward: "animal_skin", materialName: "Animal Skin",
    zones: ["zone_talking_island"]
  },
  fish_starfish: {
    id: "fish_starfish", name: "Estrela-do-Mar", icon: "⭐", rarity: "common",
    baseWeight: { min: 0.1, max: 0.5 }, xpReward: 6, sellPrice: 25,
    exchangeRate: 5, materialReward: "thread", materialName: "Thread",
    zones: ["zone_talking_island"]
  },
  fish_mud_catfish: {
    id: "fish_mud_catfish", name: "Bagre da Lama", icon: "🐟", rarity: "common",
    baseWeight: { min: 2.0, max: 5.0 }, xpReward: 10, sellPrice: 40,
    exchangeRate: 5, materialReward: "animal_bone", materialName: "Animal Bone",
    zones: ["zone_dion"]
  },
  fish_tuna: {
    id: "fish_tuna", name: "Atum Prateado", icon: "🐟", rarity: "common",
    baseWeight: { min: 5.0, max: 15.0 }, xpReward: 12, sellPrice: 60,
    exchangeRate: 5, materialReward: "coal", materialName: "Coal",
    zones: ["zone_giran"]
  },
  fish_silver_bass: {
    id: "fish_silver_bass", name: "Robalo Prateado", icon: "🐟", rarity: "common",
    baseWeight: { min: 1.0, max: 3.5 }, xpReward: 8, sellPrice: 35,
    exchangeRate: 5, materialReward: "charcoal", materialName: "Charcoal",
    zones: ["zone_elven_village"]
  },

  // Incomum (25%)
  fish_talking_squid: {
    id: "fish_talking_squid", name: "Lula de Talking", icon: "🦑", rarity: "uncommon",
    baseWeight: { min: 0.5, max: 1.5 }, xpReward: 10, sellPrice: 50,
    exchangeRate: 3, materialReward: "varnish", materialName: "Varnish",
    zones: ["zone_talking_island"]
  },
  fish_gludin_puffer: {
    id: "fish_gludin_puffer", name: "Baiacu de Gludin", icon: "🐡", rarity: "uncommon",
    baseWeight: { min: 1.0, max: 2.5 }, xpReward: 15, sellPrice: 70,
    exchangeRate: 3, materialReward: "suede", materialName: "Suede",
    zones: ["zone_gludin"]
  },
  fish_elven_trout: {
    id: "fish_elven_trout", name: "Truta Élfica", icon: "🐠", rarity: "uncommon",
    baseWeight: { min: 1.5, max: 3.0 }, xpReward: 18, sellPrice: 90,
    exchangeRate: 3, materialReward: "iron_ore", materialName: "Iron Ore",
    zones: ["zone_elven_village"]
  },
  fish_river_crab: {
    id: "fish_river_crab", name: "Caranguejo de Rio", icon: "🦀", rarity: "uncommon",
    baseWeight: { min: 0.3, max: 1.2 }, xpReward: 20, sellPrice: 110,
    exchangeRate: 3, materialReward: "crafted_leather", materialName: "Crafted Leather",
    zones: ["zone_dion"]
  },
  fish_swordfish: {
    id: "fish_swordfish", name: "Peixe-Espada", icon: "🗡️", rarity: "uncommon",
    baseWeight: { min: 20.0, max: 45.0 }, xpReward: 25, sellPrice: 150,
    exchangeRate: 3, materialReward: "silver_nugget", materialName: "Silver Nugget",
    zones: ["zone_giran"]
  },
  fish_rainbow_trout: {
    id: "fish_rainbow_trout", name: "Truta Arco-íris", icon: "🐠", rarity: "uncommon",
    baseWeight: { min: 2.0, max: 6.0 }, xpReward: 30, sellPrice: 200,
    exchangeRate: 3, materialReward: "steel", materialName: "Steel",
    zones: ["zone_innadril"]
  },

  // Raro (15%)
  fish_octopus: {
    id: "fish_octopus", name: "Polvo das Sombras", icon: "🐙", rarity: "rare",
    baseWeight: { min: 3.0, max: 8.0 }, xpReward: 25, sellPrice: 120,
    exchangeRate: 2, materialReward: "mithril_ore", materialName: "Mithril Ore",
    zones: ["zone_gludin"]
  },
  fish_crystal_salmon: {
    id: "fish_crystal_salmon", name: "Salmão de Cristal", icon: "🐟", rarity: "rare",
    baseWeight: { min: 5.0, max: 12.0 }, xpReward: 35, sellPrice: 180,
    exchangeRate: 2, materialReward: "cokes", materialName: "Cokes",
    zones: ["zone_elven_village"]
  },
  fish_dion_eel: {
    id: "fish_dion_eel", name: "Enguia de Dion", icon: "🐍", rarity: "rare",
    baseWeight: { min: 1.5, max: 4.5 }, xpReward: 40, sellPrice: 220,
    exchangeRate: 2, materialReward: "braided_hemp", materialName: "Braided Hemp",
    zones: ["zone_dion"]
  },
  fish_giran_manta: {
    id: "fish_giran_manta", name: "Jamanta de Giran", icon: "🦇", rarity: "rare",
    baseWeight: { min: 50.0, max: 120.0 }, xpReward: 50, sellPrice: 350,
    exchangeRate: 2, materialReward: "steel_mold", materialName: "Steel Mold",
    zones: ["zone_giran"]
  },
  fish_abyssal_angler: {
    id: "fish_abyssal_angler", name: "Pescador Abissal", icon: "🏮", rarity: "rare",
    baseWeight: { min: 8.0, max: 18.0 }, xpReward: 60, sellPrice: 450,
    exchangeRate: 2, materialReward: "mithril_alloy", materialName: "Mithril Alloy",
    zones: ["zone_innadril"]
  },

  // Épico (8%)
  fish_ray: {
    id: "fish_ray", name: "Arraia Elétrica", icon: "⚡", rarity: "epic",
    baseWeight: { min: 15.0, max: 35.0 }, xpReward: 50, sellPrice: 300,
    exchangeRate: 1, materialReward: "enria", materialName: "Enria",
    zones: ["zone_gludin", "zone_giran"]
  },
  fish_elven_goldfish: {
    id: "fish_elven_goldfish", name: "Peixe-Dourado Élfico", icon: "🪙", rarity: "epic",
    baseWeight: { min: 0.5, max: 1.5 }, xpReward: 65, sellPrice: 400,
    exchangeRate: 1, materialReward: "metallic_thread", materialName: "Metallic Thread",
    zones: ["zone_elven_village"]
  },
  fish_mandragora_fish: {
    id: "fish_mandragora_fish", name: "Peixe-Mandrágora", icon: "🌱", rarity: "epic",
    baseWeight: { min: 2.0, max: 5.0 }, xpReward: 80, sellPrice: 550,
    exchangeRate: 1, materialReward: "var_of_purity", materialName: "Varnish of Purity",
    zones: ["zone_dion"]
  },
  fish_giran_dragonfish: {
    id: "fish_giran_dragonfish", name: "Peixe-Dragão de Giran", icon: "🐉", rarity: "epic",
    baseWeight: { min: 30.0, max: 80.0 }, xpReward: 100, sellPrice: 800,
    exchangeRate: 1, materialReward: "asofe", materialName: "Asofe",
    zones: ["zone_giran"]
  },

  // Lendário (2%)
  fish_gludin_shark: {
    id: "fish_gludin_shark", name: "Tubarão Branco de Gludin", icon: "🦈", rarity: "legendary",
    baseWeight: { min: 100.0, max: 300.0 }, xpReward: 150, sellPrice: 1500,
    exchangeRate: 1, materialReward: "oriharukon_ore", materialName: "Oriharukon Ore",
    zones: ["zone_gludin"]
  },
  fish_dion_pike: {
    id: "fish_dion_pike", name: "Pique Escamas-de-Aço", icon: "⚜️", rarity: "legendary",
    baseWeight: { min: 25.0, max: 60.0 }, xpReward: 200, sellPrice: 2000,
    exchangeRate: 1, materialReward: "durable_metal_plate", materialName: "Durable Metal Plate",
    zones: ["zone_dion"]
  },
  fish_kraken_tentacle: {
    id: "fish_kraken_tentacle", name: "Tentáculo do Kraken", icon: "🦑", rarity: "legendary",
    baseWeight: { min: 50.0, max: 150.0 }, xpReward: 300, sellPrice: 4000,
    exchangeRate: 1, materialReward: "craftsman_mold", materialName: "Craftsman Mold",
    zones: ["zone_giran"]
  },
  fish_innadril_sunfish: {
    id: "fish_innadril_sunfish", name: "Peixe-Lua de Innadril", icon: "☀️", rarity: "legendary",
    baseWeight: { min: 400.0, max: 1000.0 }, xpReward: 400, sellPrice: 6000,
    exchangeRate: 1, materialReward: "thons", materialName: "Thons",
    zones: ["zone_innadril"]
  },
  fish_siren_scale: {
    id: "fish_siren_scale", name: "Escama de Sirene", icon: "🧜‍♀️", rarity: "legendary",
    baseWeight: { min: 0.1, max: 0.5 }, xpReward: 450, sellPrice: 8000,
    exchangeRate: 1, materialReward: "mold_lubricant", materialName: "Mold Lubricant",
    zones: ["zone_innadril"]
  },
  fish_water_dragon_fry: {
    id: "fish_water_dragon_fry", name: "Filhote do Dragão da Água", icon: "🐲", rarity: "legendary",
    baseWeight: { min: 10.0, max: 30.0 }, xpReward: 500, sellPrice: 10000,
    exchangeRate: 1, materialReward: "adamantite", materialName: "Adamantite",
    zones: ["zone_innadril"]
  }
};

export const RODS_CATALOG = {
  rod_none: {
    id: "rod_none", name: "Vara de Bambu (Iniciante)", icon: "🎣", grade: "none", minFishingLevel: 1,
    catchBonus: 1.0, durability: 50, repairCost: 50, buyPrice: 0
  },
  rod_d: {
    id: "rod_d", name: "Vara de Aprendiz (D-Grade)", icon: "🎣", grade: "d", minFishingLevel: 3,
    catchBonus: 1.15, durability: 100, repairCost: 250, buyPrice: 5000
  },
  rod_c: {
    id: "rod_c", name: "Vara Reforçada (C-Grade)", icon: "🎣", grade: "c", minFishingLevel: 8,
    catchBonus: 1.30, durability: 200, repairCost: 750, buyPrice: 25000
  },
  rod_b: {
    id: "rod_b", name: "Vara de Mestre (B-Grade)", icon: "🎣", grade: "b", minFishingLevel: 15,
    catchBonus: 1.50, durability: 400, repairCost: 2500, buyPrice: 120000
  },
  rod_a: {
    id: "rod_a", name: "Vara Imperial (A-Grade)", icon: "🔱", grade: "a", minFishingLevel: 25,
    catchBonus: 1.80, durability: 800, repairCost: 7500, buyPrice: 500000
  }
};

export const BAIT_CATALOG = {
  bait_worm: {
    id: "bait_worm", name: "Minhoca Fresca", icon: "🪱", buyPrice: 10,
    effectDescription: "Isca básica e acessível. Eficácia padrão.",
    catchBonus: 1.0, rarityBoost: 0.0
  },
  bait_lure: {
    id: "bait_lure", name: "Larva Luminescente", icon: "🐛", buyPrice: 50,
    effectDescription: "Brilha nas águas profundas. +20% chance de captura e +5% chance de raros.",
    catchBonus: 1.2, rarityBoost: 0.05
  },
  bait_golden: {
    id: "bait_golden", name: "Isca Dourada de Giran", icon: "✨", buyPrice: 200,
    effectDescription: "Reflete luz com perfeição. +50% chance de captura e +15% chance de raros.",
    catchBonus: 1.5, rarityBoost: 0.15
  },
  bait_crystal: {
    id: "bait_crystal", name: "Isca Cristalina Abissal", icon: "💎", buyPrice: 1000,
    effectDescription: "Imbuída com cristais de mana. Dobra a chance de captura e +30% chance de épicos/lendários.",
    catchBonus: 2.0, rarityBoost: 0.30
  }
};

export function getFishingXpForLevel(level) {
  return Math.floor(level * level * 50);
}

export const FISH_EXCHANGE_TIERS = {
  common: { name: "Tier 1: Comum", description: "5 Peixes → 1 Material Básico", exchangeRate: 5 },
  uncommon: { name: "Tier 2: Incomum", description: "3 Peixes → 1 Material Refinado", exchangeRate: 3 },
  rare: { name: "Tier 3: Raro", description: "2 Peixes → 1 Material Especial", exchangeRate: 2 },
  epic: { name: "Tier 4: Épico", description: "1 Peixe → 1 Material Raro", exchangeRate: 1 },
  legendary: { name: "Tier 5: Lendário", description: "1 Peixe → 1 Material Nobre", exchangeRate: 1 }
};
