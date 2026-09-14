// expeditions.js — Catálogo de Destinos, Perigos e Fases de Expedição (Exploration 2.0)

export const EXPEDITION_DESTINATIONS = {
  gludio_ruins: {
    id: 'gludio_ruins',
    name: 'Ruínas Desoladas de Gludio',
    minLevel: 15,
    duration: 1800000, // 30 minutos
    cost: 2500,
    minGold: 8000,
    maxGold: 16000,
    shards: 2,
    recommendedSpecs: ['tracker', 'guardian'],
    threat: 'Emboscadas Gnoll e Armadilhas de Fogo',
    rewardDesc: 'Materiais básicos (Couro, Osso), Adena e Scrolls D',
    desc: 'Escombros tomados por bandos de gnolls e saqueadores. Ideal para treinar jovens mercenários.',
    materialRewards: [
      { matId: 'leather', min: 2, max: 6 },
      { matId: 'bone', min: 2, max: 5 },
      { matId: 'iron_ore', min: 2, max: 4 }
    ],
    scrollReward: 'scroll_of_enchant_armor',
    phases: [
      { name: 'Infiltração', desc: 'Batedoria silenciosa pelas muralhas em ruínas.' },
      { name: 'Perigo', desc: 'Vanguarda de guerreiros gnolls patrulhando o portão leste.' },
      { name: 'Tesouro', desc: 'Baú do bando gnoll oculto nas ruínas do armazém.' }
    ]
  },
  branded: {
    id: 'branded',
    name: 'Catacumbas de Branded',
    minLevel: 20,
    duration: 3600000, // 1 hora
    cost: 6000,
    minGold: 22000,
    maxGold: 38000,
    shards: 4,
    recommendedSpecs: ['healer', 'thief'],
    threat: 'Mortos-Vivos & Armadilhas Antigas',
    rewardDesc: 'Pó de Osso Grosso, Scrolls Universais e Cacos Astrais',
    desc: 'Criptas subterrâneas infestadas de mortos-vivos. Ladinos desarmam armadilhas e Curandeiros expurgam maldições.',
    materialRewards: [
      { matId: 'coarse_bone_powder', min: 1, max: 3 },
      { matId: 'cotton_thread', min: 3, max: 8 },
      { matId: 'bone', min: 4, max: 10 }
    ],
    scrollReward: 'scroll_of_enchant_weapon',
    phases: [
      { name: 'Infiltração', desc: 'Descida cautelosa pelas escadarias de pedra cobertas de lodo.' },
      { name: 'Perigo', desc: 'Armadilha mecânica de lâminas ancestrais e espectros vingativos.' },
      { name: 'Tesouro', desc: 'Câmara mortuária lacrada com runas de neomancia.' }
    ]
  },
  dwarven_mines: {
    id: 'dwarven_mines',
    name: 'Minas Esquecidas dos Anões',
    minLevel: 28,
    duration: 7200000, // 2 horas
    cost: 15000,
    minGold: 65000,
    maxGold: 105000,
    shards: 6,
    recommendedSpecs: ['guardian', 'tracker'],
    threat: 'Desmoronamentos e Golens de Pedra',
    rewardDesc: 'Aço, Minério de Mithril, Carvão e Scrolls Universais',
    desc: 'Galerias profundas escavadas há séculos. Golens desgovernados protegem veios ricos de aço e mithril.',
    materialRewards: [
      { matId: 'steel', min: 1, max: 4 },
      { matId: 'mithril_ore', min: 2, max: 6 },
      { matId: 'coal', min: 4, max: 10 }
    ],
    scrollReward: 'scroll_of_enchant_armor',
    phases: [
      { name: 'Infiltração', desc: 'Navegação pelos túneis estreitos e poços de ventilação.' },
      { name: 'Perigo', desc: 'Vibração tectônica e ataque surpresa de golens de basalto.' },
      { name: 'Tesouro', desc: 'Oficina do forjador mestre abandonada com lingotes intactos.' }
    ]
  },
  martyrs: {
    id: 'martyrs',
    name: 'Necrópole dos Martírios',
    minLevel: 32,
    duration: 10800000, // 3 horas
    cost: 30000,
    minGold: 110000,
    maxGold: 175000,
    shards: 9,
    recommendedSpecs: ['healer', 'mage'],
    threat: 'Labirinto das Sombras & Ecos Malditos',
    rewardDesc: 'Couro Refinado, Linha Trançada, Cacos e Scrolls Universais',
    desc: 'Santuário sombrio onde sacerdotes fanáticos foram sacrificados. Requer magia sagrada e arcana.',
    materialRewards: [
      { matId: 'crafted_leather', min: 1, max: 3 },
      { matId: 'braided_hemp', min: 2, max: 6 },
      { matId: 'silver_nugget', min: 3, max: 8 }
    ],
    scrollReward: 'scroll_of_enchant_weapon',
    phases: [
      { name: 'Infiltração', desc: 'Cruzando o labirinto de colunas fúnebres sob névoa profana.' },
      { name: 'Perigo', desc: 'Clamor das almas penadas drenando a energia vital da caravana.' },
      { name: 'Tesouro', desc: 'Altar cerimonial contendo oferendas nobres preservadas.' }
    ]
  },
  dragon_valley: {
    id: 'dragon_valley',
    name: 'Ravina dos Dragões Inferiores',
    minLevel: 38,
    duration: 14400000, // 4 horas
    cost: 60000,
    minGold: 280000,
    maxGold: 420000,
    shards: 14,
    recommendedSpecs: ['mage', 'guardian'],
    threat: 'Dragões de Sangue & Chuva Sulfúrica',
    rewardDesc: 'Enria, Coque Sintético, Cacos Astrais e Scrolls Universais',
    desc: 'Desfiladeiro causticante dominado por crias de Antaras. Guardiões absorvem fogo e Magos quebram escamas.',
    materialRewards: [
      { matId: 'enria', min: 1, max: 3 },
      { matId: 'synthetic_cokes', min: 1, max: 4 },
      { matId: 'iron_ore', min: 6, max: 14 }
    ],
    scrollReward: 'scroll_of_enchant_weapon',
    phases: [
      { name: 'Infiltração', desc: 'Escalada por fendas de enxofre em território aéreo dos dragões.' },
      { name: 'Perigo', desc: 'Baforada de chamas sulfúricas e emboscada de dracos alados.' },
      { name: 'Tesouro', desc: 'Ninho fóssil ancestral repleto de minerais draconianos.' }
    ]
  },
  shilen_temple: {
    id: 'shilen_temple',
    name: 'Santuário Profano de Shilen',
    minLevel: 40,
    duration: 21600000, // 6 horas
    cost: 100000,
    minGold: 650000,
    maxGold: 980000,
    shards: 22,
    recommendedSpecs: ['mage', 'healer', 'thief'],
    threat: 'Magia de Sangue, Demônios Maiores & Barreiras Seladas',
    rewardDesc: 'Fibra Metálica, Enria, Scrolls Abençoados e Relíquias Astrais',
    desc: 'O ápice da exploração da Temporada 1. Fortaleza profana onde se ocultam as maiores relíquias de Aden.',
    materialRewards: [
      { matId: 'metallic_fiber', min: 2, max: 5 },
      { matId: 'enria', min: 2, max: 5 },
      { matId: 'crafted_leather', min: 2, max: 5 }
    ],
    scrollReward: 'scroll_blessed_weapon',
    phases: [
      { name: 'Infiltração', desc: 'Quebra dos três selos arcanos de sangue na entrada do templo.' },
      { name: 'Perigo', desc: 'Manifestação de um Arquidemônio de Shilen em fúria.' },
      { name: 'Tesouro', desc: 'Câmara secreta da Deusa selada por séculos.' }
    ]
  }
};
