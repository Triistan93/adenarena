// mining.js — Catálogo de Dados da Profissão de Mineração & Veios de Aden (Lineage II Style)

export const MINING_ZONES = {
  zone_abandoned_coal: {
    id: 'zone_abandoned_coal',
    name: 'Galerias de Carvão de Gludio',
    icon: '⛏️',
    minLevel: 15,
    difficulty: 1,
    description: 'Antigas galerias subterrâneas de extração de combustível fóssil e ferro superficial. Ideal para novos mineradores.',
    availableNodes: ['node_coal_deposit', 'node_crude_iron_pocket', 'node_gravel_strata', 'node_pyrite_cluster'],
    requiredLamp: null,
    baseMineTime: 3300
  },
  zone_mithril_mines: {
    id: 'zone_mithril_mines',
    name: 'Minas Ancestrais dos Anões',
    icon: '💎',
    minLevel: 22,
    difficulty: 2,
    description: 'Túneis labirínticos escavados pelos maiores clãs artífices de Aden. Veios abundantes de prata e traços de mithril.',
    availableNodes: ['node_pure_iron_seam', 'node_silver_vein', 'node_dense_coal_pillar', 'node_cokes_rock'],
    requiredLamp: 'lamp_oil',
    baseMineTime: 3800
  },
  zone_plains_quarry: {
    id: 'zone_plains_quarry',
    name: 'Pedreira das Colinas de Dion',
    icon: '🪨',
    minLevel: 28,
    difficulty: 3,
    description: 'Encostas rochosas abertas com rochas metamórficas duras. Ricas em nódulos de ferro pesado e pepitas reluzentes.',
    availableNodes: ['node_heavy_iron_boulder', 'node_rich_silver_pocket', 'node_mithril_crust', 'node_quarry_granite'],
    requiredLamp: 'lamp_miner',
    baseMineTime: 4200
  },
  zone_giran_deep_vein: {
    id: 'zone_giran_deep_vein',
    name: 'Veio Profundo das Gargantas de Giran',
    icon: '✨',
    minLevel: 34,
    difficulty: 4,
    description: 'Fendas tectônicas onde a pressão da terra condensou minerais raros de Mithril Ancestral e ligas nobres.',
    availableNodes: ['node_deep_mithril_lode', 'node_silver_nugget_mother', 'node_cokes_furnace_core', 'node_steel_shale'],
    requiredLamp: 'lamp_miner',
    baseMineTime: 4800
  },
  zone_iron_stronghold: {
    id: 'zone_iron_stronghold',
    name: 'Fosso Glacial de Schuttgart',
    icon: '❄️',
    minLevel: 38,
    difficulty: 5,
    description: 'Poços gelados de alta profundidade. O frio extremo cristalizou veios dourados de Oriharukon sob o permafrost.',
    availableNodes: ['node_oriharukon_frozen_vein', 'node_ancient_mithril_cluster', 'node_iron_bedrock', 'node_dense_mineral_mass'],
    requiredLamp: 'lamp_alchemical',
    baseMineTime: 5400
  },
  zone_forge_of_gods: {
    id: 'zone_forge_of_gods',
    name: 'Forja dos Deuses de Goddard',
    icon: '🌋',
    minLevel: 40,
    difficulty: 6,
    description: 'Câmaras vulcânicas incandescentes próximas ao covil dos dragões de fogo. Único local onde o lendário Adamantite aflora.',
    availableNodes: ['node_adamantite_core_rock', 'node_oriharukon_radiant_geode', 'node_magma_tempered_slag', 'node_primordial_bedrock'],
    requiredLamp: 'lamp_crystal',
    baseMineTime: 6200
  }
};

export function getMiningZonesList() {
  return Object.values(MINING_ZONES);
}

export const MINE_HAZARDS = {
  none: { id: 'none', name: 'Rocha Estável', desc: 'Sem perigos ocultos.' },
  gas_pocket: { id: 'gas_pocket', name: 'Bolsão de Gás', desc: 'Gás inflamável. Golpes pesados causam explosão (10% HP dano, desgaste extra).' },
  seismic_fault: { id: 'seismic_fault', name: 'Falha Sísmica', desc: 'Rocha fraturada. Perda de estabilidade acelerada (2x).' },
  dense_crystal: { id: 'dense_crystal', name: 'Veio Cristalino', desc: 'Cristal puro. Mineração precisa dobra o rendimento.' }
};

export const MINING_TACTICS = {
  precision: {
    id: 'precision',
    name: 'Cinzelamento Preciso',
    icon: '🎯',
    desc: 'Golpes cirúrgicos nas juntas naturais da rocha. +25% chance de Pepita Pura, perda de estabilidade -5%.',
    timeMult: 1.2,
    qualityBonus: 0.25,
    durabilityCost: 1,
    stabilityLoss: 5
  },
  standard: {
    id: 'standard',
    name: 'Mineração Padrão',
    icon: '⛏️',
    desc: 'Ritmo firme e cadenciado de picareta. Rendimento e perda de estabilidade moderados (-12%).',
    timeMult: 1.0,
    qualityBonus: 0.0,
    durabilityCost: 1,
    stabilityLoss: 12
  },
  heavy: {
    id: 'heavy',
    name: 'Golpe Demolidor',
    icon: '💥',
    desc: 'Martelada potente para quebrar a camada externa. -35% no tempo, perda drástica de estabilidade (-28%!). Risco de explosão de gás.',
    timeMult: 0.65,
    qualityBonus: -0.15,
    durabilityCost: 1,
    stabilityLoss: 28
  },
  probe: {
    id: 'probe',
    name: 'Sondagem Acústica',
    icon: '🔍',
    desc: 'Revela perigo do veio sem causar vibração na galeria.',
    timeMult: 0,
    qualityBonus: 0,
    durabilityCost: 0,
    stabilityLoss: 0,
    isInstant: true
  }
};

export const MINERAL_NODES_CATALOG = {
  // Comum
  node_coal_deposit: {
    id: 'node_coal_deposit', name: 'Veio Superficial de Carvão', icon: '⚫', rarity: 'common',
    desc: 'Camadas de carvão mineral fáceis de esfarelar.',
    yields: { primary: 'coal', primaryQty: 3, secondary: 'iron_ore', secondaryQty: 1 },
    baseTime: 3200, xpReward: 6, zones: ['zone_abandoned_coal']
  },
  node_crude_iron_pocket: {
    id: 'node_crude_iron_pocket', name: 'Nódulo de Ferro Rústico', icon: '🪨', rarity: 'common',
    desc: 'Rocha avermelhada rica em óxido de ferro.',
    yields: { primary: 'iron_ore', primaryQty: 3, secondary: 'coal', secondaryQty: 1 },
    baseTime: 3300, xpReward: 8, zones: ['zone_abandoned_coal']
  },
  node_gravel_strata: {
    id: 'node_gravel_strata', name: 'Estrato Arenoso de Cascalho', icon: '⛏️', rarity: 'common',
    desc: 'Depósito misto de sedimentos ricos em minérios.',
    yields: { primary: 'coal', primaryQty: 2, secondary: 'iron_ore', secondaryQty: 2 },
    baseTime: 3100, xpReward: 7, zones: ['zone_abandoned_coal']
  },
  node_pyrite_cluster: {
    id: 'node_pyrite_cluster', name: 'Agregado de Pirita Bruta', icon: '🪙', rarity: 'common',
    desc: 'Cristais dourados que acompanham bolsões de ferro de alta densidade.',
    yields: { primary: 'iron_ore', primaryQty: 4, secondary: 'coal', secondaryQty: 1 },
    baseTime: 3500, xpReward: 10, zones: ['zone_abandoned_coal']
  },

  // Incomum
  node_pure_iron_seam: {
    id: 'node_pure_iron_seam', name: 'Costura de Ferro dos Anões', icon: '⚙️', rarity: 'uncommon',
    desc: 'Veio contínuo e denso escavado nas profundezas das montanhas.',
    yields: { primary: 'iron_ore', primaryQty: 5, secondary: 'cokes', secondaryQty: 1 },
    baseTime: 3800, xpReward: 18, zones: ['zone_mithril_mines']
  },
  node_silver_vein: {
    id: 'node_silver_vein', name: 'Veio Reluzente de Prata', icon: '🥈', rarity: 'uncommon',
    desc: 'Fita prateada brilhando contra as paredes de pedra escura.',
    yields: { primary: 'silver_nugget', primaryQty: 2, secondary: 'iron_ore', secondaryQty: 2 },
    baseTime: 4000, xpReward: 22, zones: ['zone_mithril_mines']
  },
  node_dense_coal_pillar: {
    id: 'node_dense_coal_pillar', name: 'Coluna de Antracito Puro', icon: '🪨', rarity: 'uncommon',
    desc: 'Carvão fóssil de queima limpa e poder calorífico superior.',
    yields: { primary: 'coal', primaryQty: 6, secondary: 'cokes', secondaryQty: 1 },
    baseTime: 3900, xpReward: 20, zones: ['zone_mithril_mines']
  },
  node_cokes_rock: {
    id: 'node_cokes_rock', name: 'Formação Natural de Coque', icon: '🔥', rarity: 'uncommon',
    desc: 'Nódulo de carvão calcinado pela proximidade de fendas térmicas.',
    yields: { primary: 'cokes', primaryQty: 2, secondary: 'iron_ore', secondaryQty: 3 },
    baseTime: 4100, xpReward: 24, zones: ['zone_mithril_mines']
  },

  // Raro
  node_heavy_iron_boulder: {
    id: 'node_heavy_iron_boulder', name: 'Megalito de Hematita de Dion', icon: '🛡️', rarity: 'rare',
    desc: 'Bloco de alta densidade mineral difícil de quebrar.',
    yields: { primary: 'iron_ore', primaryQty: 8, secondary: 'steel', secondaryQty: 1 },
    baseTime: 4400, xpReward: 44, zones: ['zone_plains_quarry']
  },
  node_rich_silver_pocket: {
    id: 'node_rich_silver_pocket', name: 'Bolsão de Prata Nobre', icon: '✨', rarity: 'rare',
    desc: 'Geodo de prata de excepcional pureza cristalina.',
    yields: { primary: 'silver_nugget', primaryQty: 4, secondary: 'iron_ore', secondaryQty: 4 },
    baseTime: 4600, xpReward: 48, zones: ['zone_plains_quarry']
  },
  node_deep_mithril_lode: {
    id: 'node_deep_mithril_lode', name: 'Filão Profundo de Mithril', icon: '💎', rarity: 'rare',
    desc: 'Minério de mithril bruto com tons azulados prateados.',
    yields: { primary: 'mithril_ore', primaryQty: 2, secondary: 'silver_nugget', secondaryQty: 2 },
    baseTime: 4900, xpReward: 55, zones: ['zone_giran_deep_vein']
  },
  node_cokes_furnace_core: {
    id: 'node_cokes_furnace_core', name: 'Cerne de Rocha Calcinada', icon: '🌋', rarity: 'rare',
    desc: 'Mineralização que suporta as temperaturas de forja C-Grade.',
    yields: { primary: 'cokes', primaryQty: 3, secondary: 'steel', secondaryQty: 1 },
    baseTime: 4700, xpReward: 52, zones: ['zone_giran_deep_vein']
  },

  // Épico
  node_oriharukon_frozen_vein: {
    id: 'node_oriharukon_frozen_vein', name: 'Veio Dourado de Oriharukon', icon: '🌟', rarity: 'epic',
    desc: 'Filamentos áureos de metal místico incrustados no granito de Schuttgart.',
    yields: { primary: 'oriharukon_ore', primaryQty: 2, secondary: 'mithril_ore', secondaryQty: 2 },
    baseTime: 5400, xpReward: 95, zones: ['zone_iron_stronghold']
  },
  node_ancient_mithril_cluster: {
    id: 'node_ancient_mithril_cluster', name: 'Ninho de Mithril Ancestral', icon: '🔷', rarity: 'epic',
    desc: 'Cristalizações colossais de mithril com altíssima condutividade mágica.',
    yields: { primary: 'mithril_ore', primaryQty: 4, secondary: 'oriharukon_ore', secondaryQty: 1 },
    baseTime: 5500, xpReward: 105, zones: ['zone_iron_stronghold']
  },

  // Lendário
  node_adamantite_core_rock: {
    id: 'node_adamantite_core_rock', name: 'Monólito de Adamantite Primordial', icon: '⚡', rarity: 'legendary',
    desc: 'Fragmento de meteoro enterrado sob a Forja dos Deuses. Dureza insuperável.',
    yields: { primary: 'adamantite', primaryQty: 2, secondary: 'oriharukon_ore', secondaryQty: 3 },
    baseTime: 6200, xpReward: 260, zones: ['zone_forge_of_gods']
  },
  node_oriharukon_radiant_geode: {
    id: 'node_oriharukon_radiant_geode', name: 'Geodo Radiante de Oriharukon', icon: '👑', rarity: 'legendary',
    desc: 'Geodo vulcânico gigante preenchido de cristais de ouro primordial.',
    yields: { primary: 'oriharukon_ore', primaryQty: 4, secondary: 'adamantite', secondaryQty: 1 },
    baseTime: 6400, xpReward: 300, zones: ['zone_forge_of_gods']
  }
};

export const PICKAXES_CATALOG = {
  pickaxe_none: {
    id: 'pickaxe_none',
    name: 'Picareta Rústica de Cobre',
    grade: 'none',
    icon: '⛏️',
    minMiningLevel: 1,
    durabilityMax: 50,
    repairCost: 500,
    buyPrice: 0,
    qualityBonus: 0.0,
    desc: 'Ferramenta básica com ponta forjada em bronze e cabo de madeira comum.'
  },
  pickaxe_d: {
    id: 'pickaxe_d',
    name: 'Picareta de Ferro dos Anões',
    grade: 'd',
    icon: '⚒️',
    minMiningLevel: 3,
    durabilityMax: 120,
    repairCost: 2500,
    buyPrice: 15000,
    qualityBonus: 0.15,
    desc: 'Forjada com a têmpera dos mestres das minas. +15% de chance de minérios puros.'
  },
  pickaxe_c: {
    id: 'pickaxe_c',
    name: 'Picareta de Aço Reforçado',
    grade: 'c',
    icon: '✨',
    minMiningLevel: 8,
    durabilityMax: 250,
    repairCost: 7500,
    buyPrice: 60000,
    qualityBonus: 0.30,
    desc: 'Lâmina chanfrada que parte o granito sem esfarelar veios raros (+30% pureza).'
  },
  pickaxe_b: {
    id: 'pickaxe_b',
    name: 'Picareta de Mithril de Alta Pressão',
    grade: 'b',
    icon: '💎',
    minMiningLevel: 15,
    durabilityMax: 450,
    repairCost: 20000,
    buyPrice: 200000,
    qualityBonus: 0.50,
    desc: 'Penetra filões profundos de mithril e oriharukon com grande facilidade (+50% pureza).'
  },
  pickaxe_a: {
    id: 'pickaxe_a',
    name: 'Broca Imperial do Titã da Forja',
    grade: 'a',
    icon: '👑',
    minMiningLevel: 25,
    durabilityMax: 800,
    repairCost: 60000,
    buyPrice: 750000,
    qualityBonus: 0.80,
    desc: 'Obra-prima abençoada por Maphr. Capaz de perfurar blocos de adamantite (+80% pureza).'
  }
};

export const LAMPS_CATALOG = {
  lamp_oil: {
    id: 'lamp_oil',
    name: 'Lampião de Óleo Mineral',
    icon: '🏮',
    buyPrice: 100,
    rarityBoost: 'uncommon',
    speedBoost: 1.15,
    desc: 'Ilumina as galerias escuras, aumentando o ritmo dos golpes (+15% velocidade).'
  },
  lamp_miner: {
    id: 'lamp_miner',
    name: 'Lanterna de Carbureto dos Anões',
    icon: '🔦',
    buyPrice: 350,
    rarityBoost: 'rare',
    speedBoost: 1.25,
    desc: 'Chama brilhante que revela o brilho sutil de veios de prata e mithril.'
  },
  lamp_alchemical: {
    id: 'lamp_alchemical',
    name: 'Lâmpada de Fogo Fátuo Alquímico',
    icon: '🧪',
    buyPrice: 1000,
    rarityBoost: 'epic',
    speedBoost: 1.40,
    desc: 'Luz espectral sensível ao magnetismo natural do Oriharukon.'
  },
  lamp_crystal: {
    id: 'lamp_crystal',
    name: 'Cristal da Chama Eterna de Goddard',
    icon: '🔮',
    buyPrice: 3000,
    rarityBoost: 'legendary',
    speedBoost: 1.60,
    desc: 'Chama que nunca se apaga sob os gases da Forja dos Deuses, avistando Adamantite.'
  }
};
