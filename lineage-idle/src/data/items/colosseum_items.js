export const COLOSSEUM_ITEMS = {
  gladiator_circlet: {
    id: 'gladiator_circlet',
    name: 'Gladiator Champion Circlet',
    slot: 'hair',
    tier: 5,
    rarity: 'epic',
    def: 100,
    mdef: 100,
    req: { level: 40 },
    price: 0,
    icon: 'acessories/hero_circlet.png',
    desc: 'Acessório do Coliseu: +100 P.Def e +100 M.Def.'
  },
  potion_heroic_cp: {
    id: 'potion_heroic_cp',
    name: 'Grande Poção Heroica de CP',
    slot: 'consumable',
    type: 'cp',
    amount: 2000,
    stack: 99999,
    price: 0,
    icon: '/icons/etc_super_cp_potion_i02.webp',
    desc: 'Recupera 2.000 CP instantaneamente.'
  },
  giants_codex_mastery: {
    id: 'giants_codex_mastery',
    name: "Giant's Codex - Mastery",
    slot: 'material',
    category: 'skill_enchant',
    tier: 5,
    stack: 99999,
    price: 0,
    icon: 'gradespecial/scrolls/scroll_enchant_weapon_s.png',
    desc: 'Tomo dos Gigantes que preserva o encantamento atual se a tentativa falhar.'
  }
};
