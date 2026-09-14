// gathering.js — Catálogo de Dados da Profissão de Coleta Botânica & Flora de Aden (Lineage II Style)

export const GATHERING_ZONES = {
  zone_gludio_fields: {
    id: 'zone_gludio_fields',
    name: 'Campos e Prados de Gludio',
    icon: '🌾',
    minLevel: 15,
    difficulty: 1,
    description: 'Pastagens abertas ao redor dos moinhos de Gludio. Ricas em galhos caídos, fibras silvestres e ervas medicinais simples.',
    availableNodes: ['node_wild_branch', 'node_reed_stem', 'node_cotton_bush', 'node_medicinal_herb'],
    requiredPouch: null,
    baseGatherTime: 3200
  },
  zone_dion_marsh: {
    id: 'zone_dion_marsh',
    name: 'Pântanos Férteis de Dion',
    icon: '🌿',
    minLevel: 20,
    difficulty: 2,
    description: 'Encostas úmidas e margens alagadas. Berço de musgos ricos em verniz, cânhamo espesso e raízes fibrosas.',
    availableNodes: ['node_hemp_fiber', 'node_marsh_varnish_moss', 'node_swamp_root', 'node_charcoal_bark'],
    requiredPouch: 'pouch_dew',
    baseGatherTime: 3600
  },
  zone_giran_hills: {
    id: 'zone_giran_hills',
    name: 'Colinas e Pomares de Giran',
    icon: '🌳',
    minLevel: 26,
    difficulty: 3,
    description: 'Bosques ensolarados pontilhados de árvores nobres. Fornecem madeiras duras e seivas pegajosas para colas alquímicas.',
    availableNodes: ['node_iron_wood_trunk', 'node_mold_resin_tree', 'node_silver_leaf_herb', 'node_hardened_bark'],
    requiredPouch: 'pouch_herb',
    baseGatherTime: 4000
  },
  zone_oren_woods: {
    id: 'zone_oren_woods',
    name: 'Florestas Gélidas de Oren',
    icon: '❄️',
    minLevel: 32,
    difficulty: 4,
    description: 'Pinheiros ancestrais que resistem a nevascas intensas. Resinas densas de lubrificante vegetal e madeira prensada.',
    availableNodes: ['node_frost_pine_core', 'node_lubricant_sap', 'node_glacier_moss', 'node_compressed_timber'],
    requiredPouch: 'pouch_herb',
    baseGatherTime: 4500
  },
  zone_aden_plateau: {
    id: 'zone_aden_plateau',
    name: 'Planalto Sagrado de Aden',
    icon: '🌸',
    minLevel: 36,
    difficulty: 5,
    description: 'Campinas etéreas banhadas pela luz da Deusa Einhasad. Flores sagradas que destilam éter vegetal e enria botânica.',
    availableNodes: ['node_einhasad_bloom', 'node_enria_spore', 'node_celestial_brier', 'node_golden_branch'],
    requiredPouch: 'pouch_alchemical',
    baseGatherTime: 5000
  },
  zone_goddard_valley: {
    id: 'zone_goddard_valley',
    name: 'Vale Vulcânico de Goddard',
    icon: '🌋',
    minLevel: 40,
    difficulty: 6,
    description: 'Vegetação mineralizada adaptada a solos sulfurosos incandescentes. Produz madeiras fósseis e fibras metálicas vegetais.',
    availableNodes: ['node_phoenix_petrified_log', 'node_volcanic_ash_stalk', 'node_fire_bloom_core', 'node_adamantine_bark'],
    requiredPouch: 'pouch_crystal',
    baseGatherTime: 5800
  }
};

export function getGatheringZonesList() {
  return Object.values(GATHERING_ZONES);
}

export const GATHERING_TACTICS = {
  delicate: {
    id: 'delicate',
    name: 'Poda Cirúrgica',
    icon: '✂️',
    desc: 'Colheita paciente sem danificar as raízes. +25% chance de Qualidade Nobre, ignora perigos de espinhos e toxinas.',
    timeMult: 1.2,
    qualityBonus: 0.25,
    durabilityCost: 1
  },
  standard: {
    id: 'standard',
    name: 'Coleta Padrão',
    icon: '🧺',
    desc: 'Corte tradicional equilibrado entre velocidade e pureza da erva.',
    timeMult: 1.0,
    qualityBonus: 0.0,
    durabilityCost: 1
  },
  cleave: {
    id: 'cleave',
    name: 'Ceifa Rápida',
    icon: '⚡',
    desc: 'Golpe vigoroso para extrair brotos rapidamente. -35% no tempo de poda, -15% na pureza. Perigoso se houver espinhos.',
    timeMult: 0.65,
    qualityBonus: -0.15,
    durabilityCost: 1
  },
  inspect: {
    id: 'inspect',
    name: 'Examinar Broto',
    icon: '🔍',
    desc: 'Revela pureza e perigos. Garante +20% na pureza se colhido depois. Instantâneo.',
    timeMult: 0,
    qualityBonus: 0.2,
    durabilityCost: 0
  }
};

export const BOTANICAL_HAZARDS = {
  none: 'Sem perigo.',
  thorn: 'Espinhos afiados (ao colher descuidadamente com ceifa rápida, causa perda de 5% HP).',
  toxin: 'Esporos venenosos (reduz pureza em 25% e causa debuff temporário).',
  resin: 'Seiva resinosa densa (cola na foice e consome +1 durabilidade se colhido sem cuidado).'
};

export const BOTANICAL_SIGNALS = {
  thorn: 'Pequenos espinhos negros pontilham o caule.',
  toxin: 'Névoa sulfurosa tênue exala das folhas úmidas.',
  resin: 'Gomos densos de seiva âmbar brilham sob o sol.',
  none: 'Gotas cristalinas de orvalho ornam as pétalas perfeitas.'
};

export const FLORA_NODES_CATALOG = {
  // Comum
  node_wild_branch: {
    id: 'node_wild_branch', name: 'Arbusto de Galhos Caídos', icon: '🌿', rarity: 'common',
    desc: 'Galhos flexíveis acumulados nas clareiras ensolaradas.',
    yields: { primary: 'branch', primaryQty: 2, secondary: 'charcoal', secondaryQty: 1 },
    baseTime: 3000, xpReward: 6, zones: ['zone_gludio_fields']
  },
  node_reed_stem: {
    id: 'node_reed_stem', name: 'Juncos das Várzeas', icon: '🌾', rarity: 'common',
    desc: 'Juncos resistentes à beira das nascentes.',
    yields: { primary: 'branch', primaryQty: 3, secondary: 'cord', secondaryQty: 1 },
    baseTime: 3200, xpReward: 8, zones: ['zone_gludio_fields']
  },
  node_cotton_bush: {
    id: 'node_cotton_bush', name: 'Algodoeiro Silvestre', icon: '🌱', rarity: 'common',
    desc: 'Tufos de algodão puro pronto para tecelagem.',
    yields: { primary: 'cotton_thread', primaryQty: 3, secondary: 'cord', secondaryQty: 1 },
    baseTime: 3000, xpReward: 8, zones: ['zone_gludio_fields']
  },
  node_medicinal_herb: {
    id: 'node_medicinal_herb', name: 'Ervas de Cura de Gludio', icon: '☘️', rarity: 'common',
    desc: 'Plantas curativas com alto teor de fibras aromáticas.',
    yields: { primary: 'cotton_thread', primaryQty: 2, secondary: 'charcoal', secondaryQty: 2 },
    baseTime: 3400, xpReward: 10, zones: ['zone_gludio_fields']
  },

  // Incomum
  node_hemp_fiber: {
    id: 'node_hemp_fiber', name: 'Cânhamo dos Pântanos', icon: '🌿', rarity: 'uncommon',
    desc: 'Fibras vegetais de extrema tenacidade encontradas na neblina de Dion.',
    yields: { primary: 'braided_hemp', primaryQty: 2, secondary: 'cord', secondaryQty: 2 },
    baseTime: 3600, xpReward: 18, zones: ['zone_dion_marsh']
  },
  node_marsh_varnish_moss: {
    id: 'node_marsh_varnish_moss', name: 'Musgo Vernizado', icon: '🍃', rarity: 'uncommon',
    desc: 'Musgo gotejante rico em óleos resinosos naturais.',
    yields: { primary: 'varnish', primaryQty: 2, secondary: 'braided_hemp', secondaryQty: 1 },
    baseTime: 3800, xpReward: 20, zones: ['zone_dion_marsh']
  },
  node_swamp_root: {
    id: 'node_swamp_root', name: 'Raiz Fibrosa de Dion', icon: '🪴', rarity: 'uncommon',
    desc: 'Raízes profundas que purificam as águas lamacentas.',
    yields: { primary: 'branch', primaryQty: 4, secondary: 'charcoal', secondaryQty: 2 },
    baseTime: 3600, xpReward: 22, zones: ['zone_dion_marsh']
  },
  node_charcoal_bark: {
    id: 'node_charcoal_bark', name: 'Tronco Queimado Ancestral', icon: '🪵', rarity: 'uncommon',
    desc: 'Cascas carbonizadas de grande poder térmico.',
    yields: { primary: 'charcoal', primaryQty: 4, secondary: 'branch', secondaryQty: 2 },
    baseTime: 4000, xpReward: 24, zones: ['zone_dion_marsh']
  },

  // Raro
  node_iron_wood_trunk: {
    id: 'node_iron_wood_trunk', name: 'Pau-Ferro Imperial', icon: '🌳', rarity: 'rare',
    desc: 'Madeira pesada como liga metálica nativa das florestas de Giran.',
    yields: { primary: 'compressed_wood', primaryQty: 2, secondary: 'varnish', secondaryQty: 3 },
    baseTime: 4200, xpReward: 42, zones: ['zone_giran_hills']
  },
  node_mold_resin_tree: {
    id: 'node_mold_resin_tree', name: 'Gomeiro Alquímico de Giran', icon: '🌲', rarity: 'rare',
    desc: 'Árvore exsudando cola vegetal puríssima para moldes de fundição.',
    yields: { primary: 'mold_glue', primaryQty: 2, secondary: 'varnish', secondaryQty: 2 },
    baseTime: 4500, xpReward: 46, zones: ['zone_giran_hills']
  },
  node_silver_leaf_herb: {
    id: 'node_silver_leaf_herb', name: 'Erva de Folha Prateada', icon: '✨', rarity: 'rare',
    desc: 'Planta luminescente cujas nervuras filtram minerais preciosos do solo.',
    yields: { primary: 'silver_thread', primaryQty: 1, secondary: 'cotton_thread', secondaryQty: 4 },
    baseTime: 4400, xpReward: 50, zones: ['zone_giran_hills']
  },
  node_hardened_bark: {
    id: 'node_hardened_bark', name: 'Casca Escamosa de Giran', icon: '🛡️', rarity: 'rare',
    desc: 'Cascas espessas empregadas no forro interno de escudos.',
    yields: { primary: 'compressed_wood', primaryQty: 2, secondary: 'charcoal', secondaryQty: 4 },
    baseTime: 4300, xpReward: 52, zones: ['zone_giran_hills']
  },

  // Épico
  node_frost_pine_core: {
    id: 'node_frost_pine_core', name: 'Cerne do Pinheiro Glacial', icon: '❄️', rarity: 'epic',
    desc: 'Cerne congelado imune ao apodrecimento colhido na neve de Oren.',
    yields: { primary: 'compressed_wood', primaryQty: 3, secondary: 'mold_lubricant', secondaryQty: 2 },
    baseTime: 4800, xpReward: 85, zones: ['zone_oren_woods']
  },
  node_lubricant_sap: {
    id: 'node_lubricant_sap', name: 'Seiva de Lubrificante de Molde', icon: '🧪', rarity: 'epic',
    desc: 'Composto vegetal viscoso que previne o atrito nas matrizes de armas nobres.',
    yields: { primary: 'mold_lubricant', primaryQty: 2, secondary: 'mold_glue', secondaryQty: 2 },
    baseTime: 5000, xpReward: 95, zones: ['zone_oren_woods']
  },
  node_einhasad_bloom: {
    id: 'node_einhasad_bloom', name: 'Flor de Einhasad de Aden', icon: '🌸', rarity: 'epic',
    desc: 'Pétalas santificadas que brilham como ouro líquido sob o sol de Aden.',
    yields: { primary: 'enria', primaryQty: 1, secondary: 'compressed_wood', secondaryQty: 2 },
    baseTime: 5200, xpReward: 110, zones: ['zone_aden_plateau']
  },
  node_enria_spore: {
    id: 'node_enria_spore', name: 'Esporo de Enria Cristalina', icon: '💎', rarity: 'epic',
    desc: 'Fungos sagrados que condensam energia mística da terra em grânulos de Enria.',
    yields: { primary: 'enria', primaryQty: 2, secondary: 'silver_thread', secondaryQty: 2 },
    baseTime: 5400, xpReward: 120, zones: ['zone_aden_plateau']
  },

  // Lendário
  node_phoenix_petrified_log: {
    id: 'node_phoenix_petrified_log', name: 'Tronco Petrificado da Fênix', icon: '🔥', rarity: 'legendary',
    desc: 'Madeira fóssil que ardeu em chamas primordiais nos picos de Goddard sem jamais virar cinzas.',
    yields: { primary: 'compressed_wood', primaryQty: 6, secondary: 'enria', secondaryQty: 3 },
    baseTime: 6000, xpReward: 250, zones: ['zone_goddard_valley']
  },
  node_adamantine_bark: {
    id: 'node_adamantine_bark', name: 'Casca Mineralizada de Adamantite', icon: '⚡', rarity: 'legendary',
    desc: 'Casca vegetal enriquecida com veios de minério cósmico.',
    yields: { primary: 'enria', primaryQty: 3, secondary: 'compressed_wood', secondaryQty: 4 },
    baseTime: 6200, xpReward: 300, zones: ['zone_goddard_valley']
  }
};

export const SICKLES_CATALOG = {
  sickle_none: {
    id: 'sickle_none',
    name: 'Foice Rústica de Poda',
    grade: 'none',
    icon: '🌾',
    minGatheringLevel: 1,
    durabilityMax: 50,
    repairCost: 500,
    buyPrice: 0,
    qualityBonus: 0.0,
    desc: 'Lâmina curva simples para corte de arbustos e matagais.'
  },
  sickle_d: {
    id: 'sickle_d',
    name: 'Foice Reforçada de Gludio',
    grade: 'd',
    icon: '🌱',
    minGatheringLevel: 3,
    durabilityMax: 120,
    repairCost: 2500,
    buyPrice: 15000,
    qualityBonus: 0.15,
    desc: 'Aço temperado em oficinas rurais. +15% de chance de colheitas puras.'
  },
  sickle_c: {
    id: 'sickle_c',
    name: 'Foice Botânica de Dion',
    grade: 'c',
    icon: '✨',
    minGatheringLevel: 8,
    durabilityMax: 250,
    repairCost: 7500,
    buyPrice: 60000,
    qualityBonus: 0.30,
    desc: 'Fio de mithril com serrilha fina. Não esmaga os caules (+30% de pureza).'
  },
  sickle_b: {
    id: 'sickle_b',
    name: 'Foice do Mestre Herborista',
    grade: 'b',
    icon: '🍃',
    minGatheringLevel: 15,
    durabilityMax: 450,
    repairCost: 20000,
    buyPrice: 200000,
    qualityBonus: 0.50,
    desc: 'Utilizada pelos alquimistas de elite de Giran. +50% de pureza botânica.'
  },
  sickle_a: {
    id: 'sickle_a',
    name: 'Lâmina Imperial da Colheita Sagrada',
    grade: 'a',
    icon: '👑',
    minGatheringLevel: 25,
    durabilityMax: 800,
    repairCost: 60000,
    buyPrice: 750000,
    qualityBonus: 0.80,
    desc: 'Artefato consagrado que preserva integralmente as propriedades do éter (+80% pureza).'
  }
};

export const POUCHES_CATALOG = {
  pouch_dew: {
    id: 'pouch_dew',
    name: 'Bolsa de Orvalho Matinal',
    icon: '💧',
    buyPrice: 100,
    rarityBoost: 'uncommon',
    speedBoost: 1.15,
    desc: 'Mantém as fibras frescas e hidratadas (+15% velocidade).'
  },
  pouch_herb: {
    id: 'pouch_herb',
    name: 'Cesto de Linho Alquímico',
    icon: '🧺',
    buyPrice: 350,
    rarityBoost: 'rare',
    speedBoost: 1.25,
    desc: 'Protege contra a luz solar excessiva, atraindo nós raros de resina.'
  },
  pouch_alchemical: {
    id: 'pouch_alchemical',
    name: 'Frasco de Vácuo Preservante',
    icon: '🧪',
    buyPrice: 1000,
    rarityBoost: 'epic',
    speedBoost: 1.40,
    desc: 'Isola esporos de enria e seivas nobres do contato com o oxigênio.'
  },
  pouch_crystal: {
    id: 'pouch_crystal',
    name: 'Urna de Éter Celestial',
    icon: '🔮',
    buyPrice: 3000,
    rarityBoost: 'legendary',
    speedBoost: 1.60,
    desc: 'Recipiente infundido com bênção divina para acomodar madeiras da Fênix.'
  }
};
