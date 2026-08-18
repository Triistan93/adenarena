/**
 * market.js — Configurações, Categorias e Dados da Casa de Leilões / Mercado Livre de Aden.
 */

export const MARKET_CATEGORIES = [
  { id: 'all', name: 'Todos os Itens', icon: '🌐' },
  { id: 'weapons', name: 'Armas & Escudos', icon: '⚔️' },
  { id: 'armors', name: 'Armaduras & Capas', icon: '🛡️' },
  { id: 'jewels', name: 'Joias & Acessórios', icon: '💍' },
  { id: 'materials', name: 'Materiais de Craft', icon: '🧱' },
  { id: 'recipes', name: 'Receitas (Recipes)', icon: '📜' },
  { id: 'consumables', name: 'Consumíveis & Poções', icon: '🧪' },
  { id: 'cards', name: 'Cartas Colecionáveis', icon: '🃏' }
];

export const MARKET_CONFIG = {
  LISTING_FEE_PERCENT: 0.01,
  MIN_LISTING_FEE: 1000,
  SALES_TAX_PERCENT: 0.05,
  MAX_ACTIVE_LISTINGS: 15,
  CURRENCY_ADEN_COIN: 'adenCoin',
  CURRENCY_ADENA: 'adena'
};

export const INITIAL_NPC_LISTINGS = [
  {
    id: 'npc_mkt_1',
    sellerName: 'Dwarf_Blacksmith_Boran',
    sellerType: 'npc',
    itemId: 'cokes',
    name: 'Cokes Refinado',
    category: 'materials',
    grade: 'all',
    rarity: 'uncommon',
    quantity: 50,
    unitPriceAdenCoins: 2,
    unitPriceAdena: 15000,
    currency: 'adenCoin',
    icon: '🧱',
    createdAt: Date.now() - 3600000,
    expiresInHours: 48
  },
  {
    id: 'npc_mkt_2',
    sellerName: 'Artisan_Grom',
    sellerType: 'npc',
    itemId: 'mithril_ore',
    name: 'Minério de Mithril Puro',
    category: 'materials',
    grade: 'all',
    rarity: 'rare',
    quantity: 30,
    unitPriceAdenCoins: 4,
    unitPriceAdena: 35000,
    currency: 'adenCoin',
    icon: '⛏️',
    createdAt: Date.now() - 7200000,
    expiresInHours: 48
  },
  {
    id: 'npc_mkt_3',
    sellerName: 'Lord_Vanguard',
    sellerType: 'npc',
    itemId: 'soulshot_d',
    name: 'Soulshot: Grau D (Pacote x500)',
    category: 'consumables',
    grade: 'D',
    rarity: 'common',
    quantity: 10,
    unitPriceAdenCoins: 8,
    unitPriceAdena: 60000,
    currency: 'adenCoin',
    icon: '✨',
    createdAt: Date.now() - 14400000,
    expiresInHours: 72
  },
  {
    id: 'npc_mkt_4',
    sellerName: 'Lady_Seraphina',
    sellerType: 'npc',
    itemId: 'recipe_homunkulus',
    name: 'Recipe: Homunkulus Sword (60%)',
    category: 'recipes',
    grade: 'C',
    rarity: 'rare',
    quantity: 1,
    unitPriceAdenCoins: 45,
    unitPriceAdena: 750000,
    currency: 'adenCoin',
    icon: '📜',
    createdAt: Date.now() - 21600000,
    expiresInHours: 24
  },
  {
    id: 'npc_mkt_5',
    sellerName: 'Shadow_Stalker_Kael',
    sellerType: 'npc',
    itemId: 'blessed_scroll_ench_wep_b',
    name: 'Blessed Scroll: Enchant Weapon (B-Grade)',
    category: 'consumables',
    grade: 'B',
    rarity: 'epic',
    quantity: 2,
    unitPriceAdenCoins: 120,
    unitPriceAdena: 2500000,
    currency: 'adenCoin',
    icon: '📜',
    createdAt: Date.now() - 10800000,
    expiresInHours: 36
  }
];
