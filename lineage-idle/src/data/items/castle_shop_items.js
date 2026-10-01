export const CASTLE_SHOP_ITEMS = {
  crown_of_lord: {
    id: 'crown_of_lord',
    name: 'Coroa do Lorde do Castelo',
    slot: 'helmet',
    tier: 6,
    req: { level: 80 },
    str: 5, dex: 5, con: 5, int: 5, wit: 5, men: 5,
    hpPercent: 0.15,
    cpPercent: 0.15,
    price: 10_000_000,
    icon: 'gradespecial/jewels/jewel_ring_queen_ant.png',
    desc: 'Coroa de Senhor do Castelo: +5 em todos os atributos primários e +15% de HP/CP máximos.'
  },
  castle_cloak: {
    id: 'castle_cloak',
    name: 'Manto do Lorde do Castelo',
    slot: 'cloak',
    tier: 6,
    req: { level: 80 },
    def: 180,
    mdef: 180,
    price: 5_000_000,
    icon: 'gradespecial/scrolls/scroll_blessed_armor_s.png',
    desc: 'Manto do Lorde do Castelo: +180 P.Def e +180 M.Def.'
  },
  castle_lord_cp_elixir: {
    id: 'castle_lord_cp_elixir',
    name: 'Elixir Real de CP',
    slot: 'consumable',
    type: 'cp',
    amount: 3500,
    stack: 999,
    price: 250_000,
    icon: 'gradespecial/potions/potion_health_xl.png',
    desc: 'Restaura até 3.500 CP instantaneamente.'
  }
};
