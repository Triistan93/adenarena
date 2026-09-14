/**
 * ResourceDictionary.js — Dicionário Canônico de Recursos de Aden Arena.
 * 
 * Garante que cada recurso semântico possua exatamente um itemId canônico,
 * metadados formais, ícone comprovado no repositório e função clara na cadeia de refino e forja.
 */

export const RESOURCE_CATEGORIES = {
  RAW_FISH: 'raw_fish',
  RAW_HUNT: 'raw_hunt',
  RAW_FLORA: 'raw_flora',
  RAW_MINERAL: 'raw_mineral',
  PROCESSED_LEATHER: 'processed_leather',
  PROCESSED_METAL: 'processed_metal',
  PROCESSED_TEXTILE: 'processed_textile',
  PROCESSED_BONE: 'processed_bone',
  CRYSTAL: 'crystal',
  SPECIAL_COMPONENT: 'special_component'
};

export const CANONICAL_RESOURCES = {
  // ─── MATÉRIAS-PRIMAS BRUTAS: CAÇA (RAW HUNT) ───
  bone: {
    itemId: 'bone',
    name: 'Osso Animal',
    category: RESOURCE_CATEGORIES.RAW_HUNT,
    grade: 'none',
    icon: 'materials/bone.png',
    price: 15,
    desc: 'Fragmento de osso de fera silvestre. Usado na confecção de pós e armas de haste.'
  },
  pelt: {
    itemId: 'pelt',
    name: 'Pele Animal Bruta',
    category: RESOURCE_CATEGORIES.RAW_HUNT,
    grade: 'none',
    icon: 'materials/suede.png',
    price: 25,
    desc: 'Pele crua retirada de feras caçadas antes do processo de salga e curtume.'
  },
  suede: {
    itemId: 'suede',
    name: 'Camurça Macia',
    category: RESOURCE_CATEGORIES.RAW_HUNT,
    grade: 'none',
    icon: 'materials/suede.png',
    price: 25,
    desc: 'Pele macia e aveludada extraída de carcaças preservadas. Base para calçados e forros.'
  },

  // ─── MATÉRIAS-PRIMAS BRUTAS: COLETA (RAW FLORA) ───
  branch: {
    itemId: 'branch',
    name: 'Galho Silvestre Resistente',
    category: RESOURCE_CATEGORIES.RAW_FLORA,
    grade: 'none',
    icon: 'materials/branch.png',
    price: 12,
    desc: 'Madeira flexível e resistente colhida das árvores anciãs de Gludio e Dion. Usada em cajados e arcos.'
  },
  stem: {
    itemId: 'stem',
    name: 'Caule Silvestre',
    category: RESOURCE_CATEGORIES.RAW_FLORA,
    grade: 'none',
    icon: 'materials/branch.png',
    price: 15,
    desc: 'Haste flexível e rica em seiva colhida de plantas silvestres de Aden.'
  },
  charcoal: {
    itemId: 'charcoal',
    name: 'Carvão Vegetal',
    category: RESOURCE_CATEGORIES.RAW_FLORA,
    grade: 'none',
    icon: 'materials/charcoal.png',
    price: 20,
    desc: 'Carvão vegetal produzido a partir de madeiras colhidas em florestas. Essencial para a combustão de fornos.'
  },
  compressed_wood: {
    itemId: 'compressed_wood',
    name: 'Madeira Prensada Nobre',
    category: RESOURCE_CATEGORIES.RAW_FLORA,
    grade: 'd',
    icon: 'materials/compressed_wood.png',
    price: 80,
    desc: 'Tábuas selecionadas e comprimidas por mestres botânicos. Matéria-prima para cabos de armas de alto impacto.'
  },

  // ─── MATÉRIAS-PRIMAS BRUTAS: MINERAÇÃO (RAW MINERAL) ───
  iron_ore: {
    itemId: 'iron_ore',
    name: 'Minério de Ferro Bruto',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'none',
    icon: 'materials/iron_ore.png',
    price: 30,
    desc: 'Nódulo de ferro extraído diretamente das rochas de Dwarven Mine. O alicerce da metalurgia de Aden.'
  },
  coal: {
    itemId: 'coal',
    name: 'Carvão Mineral Puro',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'none',
    icon: 'materials/coal.png',
    price: 35,
    desc: 'Combustível fóssil denso que gera calor extremo na fundição de ligas pesadas.'
  },
  silver_nugget: {
    itemId: 'silver_nugget',
    name: 'Pepita de Prata Nobre',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'none',
    icon: 'materials/silver_nugget.png',
    price: 55,
    desc: 'Pepita reluzente de prata natural. Conduz éter e energias mágicas em armas de clérigos e magos.'
  },
  mithril_ore: {
    itemId: 'mithril_ore',
    name: 'Minério de Mithril Ancestral',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'd',
    icon: 'materials/mithril_ore.png',
    price: 120,
    desc: 'Metal lendário, leve como pena e duro como diamante. Usado em cotas de malha e adagas leves.'
  },
  oriharukon_ore: {
    itemId: 'oriharukon_ore',
    name: 'Minério de Oriharukon',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'c',
    icon: 'materials/oriharukon_ore.png',
    price: 250,
    desc: 'Mineral dourado raríssimo imbuído de poder celestial. Essencial para armamentos C-Grade.'
  },
  adamantite: {
    itemId: 'adamantite',
    name: 'Bloco de Adamantite',
    category: RESOURCE_CATEGORIES.RAW_MINERAL,
    grade: 'c',
    icon: 'materials/adamantite.png',
    price: 450,
    desc: 'Minério pesado e indestrutível. Suporta o calor de magias de alto nível.'
  },

  // ─── INSUMOS PROCESSADOS & REFINADOS (PROCESSED) ───
  leather: {
    itemId: 'leather',
    name: 'Couro Curtido Firme',
    category: RESOURCE_CATEGORIES.PROCESSED_LEATHER,
    grade: 'none',
    icon: 'materials/leather.png',
    price: 75,
    desc: 'Peles processadas na bancada de curtume com taninos naturais. Base de armaduras leves.'
  },
  crafted_leather: {
    itemId: 'crafted_leather',
    name: 'Couro Trabalhado Reforçado',
    category: RESOURCE_CATEGORIES.PROCESSED_LEATHER,
    grade: 'd',
    icon: 'materials/crafted_leather.png',
    price: 220,
    desc: 'Couro endurecido e costurado com cordões de alta densidade. Usado em sets D-Grade de ponta.'
  },
  bone_powder: {
    itemId: 'bone_powder',
    name: 'Pó de Osso Triturado',
    category: RESOURCE_CATEGORIES.PROCESSED_BONE,
    grade: 'none',
    icon: 'materials/bone_powder.png',
    price: 40,
    desc: 'Ossos moídos finamente em almofariz. Reagente essencial para têmpera e síntese alquímica.'
  },
  coarse_bone_powder: {
    itemId: 'coarse_bone_powder',
    name: 'Pó de Osso Grosso Purificado',
    category: RESOURCE_CATEGORIES.PROCESSED_BONE,
    grade: 'd',
    icon: 'materials/coarse_bone_powder.png',
    price: 140,
    desc: 'Aglutinante ósseo de alta pureza empregado na união de chapas metálicas.'
  },
  cord: {
    itemId: 'cord',
    name: 'Cordão Trançado Reforçado',
    category: RESOURCE_CATEGORIES.PROCESSED_TEXTILE,
    grade: 'none',
    icon: 'materials/cord.png',
    price: 45,
    desc: 'Fibras vegetais entrelaçadas em trança quádrupla. Utilizado em empunhaduras e cordas de arco.'
  },
  braided_hemp: {
    itemId: 'braided_hemp',
    name: 'Cânhamo Trançado Alquímico',
    category: RESOURCE_CATEGORIES.PROCESSED_TEXTILE,
    grade: 'none',
    icon: 'materials/braided_hemp.png',
    price: 60,
    desc: 'Fibras secas de cânhamo de alta tração tratadas com óleo vegetal.'
  },
  cotton_thread: {
    itemId: 'cotton_thread',
    name: 'Linha de Algodão Fina',
    category: RESOURCE_CATEGORIES.PROCESSED_TEXTILE,
    grade: 'none',
    icon: 'materials/cotton_thread.png',
    price: 30,
    desc: 'Fio fiado com precisão para costura de túnicas arcanas e forros de malha.'
  },
  silver_thread: {
    itemId: 'silver_thread',
    name: 'Fio de Prata Iluminado',
    category: RESOURCE_CATEGORIES.PROCESSED_TEXTILE,
    grade: 'd',
    icon: 'materials/silver_thread.png',
    price: 160,
    desc: 'Fios metálicos de prata maleável tecidos com algodão. Repele magias sombrias em mantos mágicos.'
  },
  metallic_fiber: {
    itemId: 'metallic_fiber',
    name: 'Fibra Metálica Entrelaçada',
    category: RESOURCE_CATEGORIES.PROCESSED_TEXTILE,
    grade: 'd',
    icon: 'materials/metallic_fiber.png',
    price: 180,
    desc: 'Filamentos de ferro temperado entrelaçados para reforçar cotas e guantes pesados.'
  },
  steel: {
    itemId: 'steel',
    name: 'Aço Temperado Puro',
    category: RESOURCE_CATEGORIES.PROCESSED_METAL,
    grade: 'd',
    icon: 'materials/steel.png',
    price: 150,
    desc: 'Placa de ferro fundida com carvão mineral em calor intenso. O padrão da forja D-Grade.'
  },
  steel_ingot: {
    itemId: 'steel_ingot',
    name: 'Lingote de Aço Nobre',
    category: RESOURCE_CATEGORIES.PROCESSED_METAL,
    grade: 'c',
    icon: 'materials/steel_ingot.png',
    price: 350,
    desc: 'Bloco fundido de aço purificado com moldes anões. Material base para armas C-Grade.'
  },
  silver_mold: {
    itemId: 'silver_mold',
    name: 'Molde de Fundição de Prata',
    category: RESOURCE_CATEGORIES.SPECIAL_COMPONENT,
    grade: 'd',
    icon: 'materials/silver_mold.png',
    price: 280,
    desc: 'Matriz anã de fundição gravada para anéis, brincos e amuletos de prata.'
  },

  // ─── CRISTAIS CANÔNICOS DE FORJA (CRYSTALS) ───
  crystal_d: {
    itemId: 'crystal_d',
    name: 'Cristal: D-Grade',
    category: RESOURCE_CATEGORIES.CRYSTAL,
    grade: 'd',
    icon: 'materials/crystal_blue_d.png',
    price: 450,
    desc: 'Essência mágica condensada obtida da cristalização de itens D-Grade.'
  },
  crystal_c: {
    itemId: 'crystal_c',
    name: 'Cristal: C-Grade',
    category: RESOURCE_CATEGORIES.CRYSTAL,
    grade: 'c',
    icon: 'materials/crystal_green_c.png',
    price: 1200,
    desc: 'Essência mágica límpida obtida da cristalização de itens C-Grade.'
  },

  // ─── MATERIAIS REFINADOS DE BANCADA (REFINED) ───
  compressed_wood: {
    itemId: 'compressed_wood',
    name: 'Madeira Comprimida',
    category: RESOURCE_CATEGORIES.RAW_FLORA,
    grade: 'none',
    icon: 'materials/compressed_wood.png',
    price: 60,
    desc: 'Madeira tratada com carvão e selante para armações de arco e cajados.'
  },
  varnish: {
    itemId: 'varnish',
    name: 'Verniz Natural',
    category: RESOURCE_CATEGORIES.SPECIAL_COMPONENT,
    grade: 'none',
    icon: 'materials/varnish.png',
    price: 45,
    desc: 'Seiva destilada de hastes botânicas. Impermeabiliza armaduras e ligas metálicas.'
  },
  varnish_of_purity: {
    itemId: 'varnish_of_purity',
    name: 'Verniz da Pureza',
    category: RESOURCE_CATEGORIES.SPECIAL_COMPONENT,
    grade: 'd',
    icon: 'materials/varnish_of_purity.png',
    price: 320,
    desc: 'Verniz alquímico de alta pureza usado na tempera de armas nobres.'
  },
  mithril_alloy: {
    itemId: 'mithril_alloy',
    name: 'Liga de Mithril',
    category: RESOURCE_CATEGORIES.PROCESSED_METAL,
    grade: 'd',
    icon: 'materials/mithril_alloy.png',
    price: 400,
    desc: 'Minério de mithril fundido com verniz. Leveza e condutividade mágica superior.'
  },
  synthetic_cokes: {
    itemId: 'synthetic_cokes',
    name: 'Coque Sintético',
    category: RESOURCE_CATEGORIES.SPECIAL_COMPONENT,
    grade: 'd',
    icon: 'materials/synthetic_cokes.png',
    price: 260,
    desc: 'Carvão refinado de altíssimo ponto de fusão para fundição de aço imperial.'
  },
  enria: {
    itemId: 'enria',
    name: 'Enria Reagente',
    category: RESOURCE_CATEGORIES.SPECIAL_COMPONENT,
    grade: 'c',
    icon: 'materials/enria.png',
    price: 650,
    desc: 'Reagente arcano semissólido para armas e armaduras de Grau C.'
  },
  durable_metal_plate: {
    itemId: 'durable_metal_plate',
    name: 'Placa de Metal Durável',
    category: RESOURCE_CATEGORIES.PROCESSED_METAL,
    grade: 'c',
    icon: 'materials/durable_metal_plate.png',
    price: 800,
    desc: 'Placa blindada de aço e mithril para peitorais e escudos pesados.'
  }
};

/**
 * Mapeador de Aliases Históricos para IDs Canônicos.
 * Elimina duplicações semânticas e fallbacks incorretos.
 */
export const RESOURCE_ALIASES = {
  // Caça
  animal_bone: 'bone',
  animal_skin: 'leather',
  raw_hide: 'leather',
  treated_leather: 'crafted_leather',
  
  // Coleta
  thread: 'cotton_thread',
  wood: 'branch',
  fish_oil: 'varnish',
  
  // Mineração
  iron: 'iron_ore',
  iron_ingot: 'steel',
  silver: 'silver_nugget',
  mithril: 'mithril_ore',
  oriharukon: 'oriharukon_ore',
  
  // Moldes e Ligas
  metallic_thread: 'metallic_fiber',
  steel_mold: 'silver_mold',
  var_of_purity: 'varnish_of_purity'
};

/**
 * Resolve qualquer ID para o ID Canônico oficial.
 * @param {string} itemId 
 * @returns {string} ID Canônico
 */
export function resolveCanonicalResourceId(itemId) {
  if (!itemId) return 'iron_ore';
  if (CANONICAL_RESOURCES[itemId]) return itemId;
  if (RESOURCE_ALIASES[itemId]) return RESOURCE_ALIASES[itemId];
  return itemId;
}

/**
 * Retorna a definição completa de um recurso canônico.
 * @param {string} itemId 
 * @returns {Object}
 */
export function getCanonicalResourceDef(itemId) {
  const canonId = resolveCanonicalResourceId(itemId);
  return CANONICAL_RESOURCES[canonId] || {
    itemId: canonId,
    name: canonId,
    category: 'unknown',
    grade: 'none',
    icon: 'materials/iron_ore.png',
    price: 10,
    desc: 'Recurso material de Aden.'
  };
}

export const RESOURCE_DICTIONARY = CANONICAL_RESOURCES;
