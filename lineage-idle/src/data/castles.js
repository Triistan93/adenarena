/**
 * castles.js — Definições dos Castelos de Aden e Mecânicas de Cerco (Castle Sieges).
 *
 * Contém os 5 Castelos canônicos de Aden, suas taxas de Adena,
 * stats das fases de cerco e itens exclusivos da Loja do Lorde.
 */

export const CASTLES = {
  gludio: {
    id: 'gludio',
    name: 'Castelo de Gludio 🏰',
    title: 'Fortaleza Ocidental de Aden',
    reqCharLevel: 40,
    reqClanLevel: 5,
    taxRatePercent: 5,
    adenaPerMinute: 25000,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_d.png',
    bg: 'dungeon_wastelands',
    desc: 'O primeiro grande bastião ocidental. Controla as rotas comerciais de Gludin e Gludio.',
    siege: {
      gateHp: 150000,
      gateDef: 120,
      guardsHp: 200000,
      guardsAtk: 450,
      guardsDef: 140,
      castRoundsRequired: 3
    }
  },

  dion: {
    id: 'dion',
    name: 'Castelo de Dion 🏰',
    title: 'Cidadela dos Campos Férteis',
    reqCharLevel: 52,
    reqClanLevel: 5,
    taxRatePercent: 8,
    adenaPerMinute: 60000,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_c.png',
    bg: 'dungeon_cruma',
    desc: 'Cercado por colinas férteis e próximo à misteriosa Torre Cruma.',
    siege: {
      gateHp: 350000,
      gateDef: 180,
      guardsHp: 500000,
      guardsAtk: 750,
      guardsDef: 220,
      castRoundsRequired: 3
    }
  },

  giran: {
    id: 'giran',
    name: 'Castelo de Giran 👑',
    title: 'Coração Comercial & Porto Real de Aden',
    reqCharLevel: 65,
    reqClanLevel: 5,
    taxRatePercent: 12,
    adenaPerMinute: 150000,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_b.png',
    bg: 'dungeon_spores',
    desc: 'O maior centro comercial de todo o continente. Riquezas infindáveis provenientes do comércio mundial.',
    siege: {
      gateHp: 750000,
      gateDef: 280,
      guardsHp: 1100000,
      guardsAtk: 1200,
      guardsDef: 340,
      castRoundsRequired: 4
    }
  },

  goddard: {
    id: 'goddard',
    name: 'Castelo de Goddard ❄️',
    title: 'Bastião Nevado do Norte',
    reqCharLevel: 76,
    reqClanLevel: 5,
    taxRatePercent: 15,
    adenaPerMinute: 250000,
    icon: 'gradespecial/scrolls/scroll_enchant_armor_a.png',
    bg: 'dungeon_goddard',
    desc: 'Fortaleza erguida nas montanhas geladas do norte, guardando as passagens para Wall of Argos e Varka.',
    siege: {
      gateHp: 1500000,
      gateDef: 380,
      guardsHp: 2200000,
      guardsAtk: 1850,
      guardsDef: 460,
      castRoundsRequired: 4
    }
  },

  aden: {
    id: 'aden',
    name: 'Castelo Imperial de Aden 👑✨',
    title: 'O Trono Supremo de Todos os Reis',
    reqCharLevel: 80,
    reqClanLevel: 5,
    taxRatePercent: 20,
    adenaPerMinute: 500000,
    icon: 'gradespecial/scrolls/scroll_blessed_weapon_s.png',
    bg: 'dungeon_imperial_tomb',
    desc: 'O mais magnífico castelo de Aden. Quem reina aqui comanda o destino de todas as nações e recebe tributos colossais.',
    siege: {
      gateHp: 3000000,
      gateDef: 550,
      guardsHp: 4500000,
      guardsAtk: 2600,
      guardsDef: 650,
      castRoundsRequired: 5
    }
  }
};

export const CASTLE_SHOP_CATALOG = [
  {
    id: 'crown_of_lord',
    name: 'Crown of the Lord 👑',
    priceAdena: 10000000,
    priceAc: 0,
    reqCastle: true,
    slot: 'head',
    icon: 'gradespecial/jewels/jewel_ring_queen_ant.png',
    desc: 'Coroa sagrada usada apenas pelos Lordes de Castelo de Aden. Concede +5 em Todos os Atributos (STR/DEX/INT/WIT/CON/MEN) e +15% Max HP/CP.',
    stats: { allStats: 5, hpPercent: 0.15, cpPercent: 0.15 }
  },
  {
    id: 'castle_cloak',
    name: 'Castle Lord Cloak 🛡️',
    priceAdena: 5000000,
    priceAc: 0,
    reqCastle: true,
    slot: 'cloak',
    icon: 'gradespecial/scrolls/scroll_blessed_armor_s.png',
    desc: 'Manto bordado com fios de ouro puro do reino. Concede +180 P.Def e +180 M.Def.',
    stats: { pDef: 180, mDef: 180 }
  },
  {
    id: 'elixir_lord_cp_10x',
    name: '10x Elixir Real de CP 🧪',
    priceAdena: 250000,
    priceAc: 0,
    reqCastle: true,
    icon: 'gradespecial/potions/potion_health_xl.png',
    desc: 'Restaura instantaneamente +3.500 pontos de CP em combate.'
  },
  {
    id: 'giant_codex_castle_pack',
    name: 'Pacote de 3x Giant\'s Codex 📜',
    priceAdena: 3000000,
    priceAc: 0,
    reqCastle: true,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    desc: 'Livros ancestrais para Encantamento de Habilidades (+1 a +30).'
  }
];
