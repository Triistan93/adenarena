/**
 * randomCraftBalance.js — Balanceamento Canônico e Pools da Roleta de Criação Anã (Random Craft).
 *
 * Autoridade: MASTER GAME DATA CONTRACT v1.0 & MASTER PROGRESSION CONTRACT v1.0.
 *
 * Regras Canônicas:
 * 1. 100 Pontos = 1 Carga de Random Craft (state.randomCraft.charge).
 * 2. Geração independente de 5 slots:
 *    - 99% de chance por slot de gerar item de Grau inferior a S (Consumíveis, B/A Grade).
 *    - 1% de chance por slot de gerar item de Grau S ou superior (Armas S, Armaduras S, Joias de Boss).
 *    Probabilidade de pelo menos um item S+ no pool de 5 slots: 1 - 0.99^5 ≈ 4.90%.
 * 3. Seleção final no spin: 20% uniforme por slot (1/5). O jogador não escolhe o slot.
 * 4. Apenas itens existentes e registrados em ALL_ITEMS são elegíveis.
 */

export const RANDOM_CRAFT_POINTS_PER_CHARGE = 100;
export const RANDOM_CRAFT_REROLL_COST = 50000; // 50.000 Adena
export const RANDOM_CRAFT_ADENA_CHARGE_COST = 200000; // 200.000 Adena por +20 Pts
export const RANDOM_CRAFT_ADENA_CHARGE_POINTS = 20;

export const RANDOM_CRAFT_SLOT_COUNT = 5;
export const RANDOM_CRAFT_S_PLUS_SLOT_CHANCE = 0.01; // 1% por slot gerado
export const RANDOM_CRAFT_UNIFORM_SPIN_CHANCE = 0.20; // 20% por slot no sorteio final

/**
 * Pontos de carga obtidos ao reciclar um equipamento por Grau/Tier.
 * No-Grade: +2 pts | D: +5 pts | C: +10 pts | B: +20 pts | A: +35 pts | S+: +60 pts
 */
export const RECYCLE_POINTS_BY_TIER = {
  1: 2,
  2: 5,
  3: 10,
  4: 20,
  5: 35,
  6: 60
};

/**
 * Pool de Itens Elegíveis de Grau Inferior a S (99% chance por slot gerado).
 * Todos verificados e existentes em ALL_ITEMS.
 */
export const RANDOM_CRAFT_POOL_BELOW_S = [
  // Consumíveis e Pergaminhos
  { itemId: 'scroll_of_enchant_weapon_', count: 1, rarity: 'rare' },
  { itemId: 'scroll_of_enchant_armor', count: 2, rarity: 'rare' },
  { itemId: 'exp_scroll', count: 3, rarity: 'rare' },
  { itemId: 'teleport_scroll', count: 5, rarity: 'common' },
  { itemId: 'hp_potion_xl', count: 25, rarity: 'rare' },
  { itemId: 'mp_potion_xl', count: 25, rarity: 'rare' },
  { itemId: 'attack_potion', count: 10, rarity: 'rare' },
  { itemId: 'defense_potion', count: 10, rarity: 'rare' },
  { itemId: 'speed_potion', count: 10, rarity: 'rare' },
  // Cristais e Materiais
  { itemId: 'crystal_blue_d', count: 50, rarity: 'common' },
  { itemId: 'crystal_red_b', count: 20, rarity: 'rare' },
  { itemId: 'crystal_silver_a', count: 10, rarity: 'epic' },
  // Equipamentos B-Grade e A-Grade
  { itemId: 'tallum_blade', count: 1, rarity: 'epic' },
  { itemId: 'tallum_spear', count: 1, rarity: 'epic' },
  { itemId: 'carnage_bow', count: 1, rarity: 'epic' },
  { itemId: 'bloody_orchid_dagger', count: 1, rarity: 'epic' },
  { itemId: 'tallum_heavy_armor', count: 1, rarity: 'epic' },
  { itemId: 'tallum_light_armor', count: 1, rarity: 'epic' },
  { itemId: 'tallum_robe_armor', count: 1, rarity: 'epic' },
  { itemId: 'dark_crystal_heavy_armor', count: 1, rarity: 'epic' },
  { itemId: 'dark_crystal_light_armor', count: 1, rarity: 'epic' },
  { itemId: 'dark_crystal_robe_armor', count: 1, rarity: 'epic' },
  { itemId: 'weapon_sword_of_damascus', count: 1, rarity: 'epic' }
];

/**
 * Pool de Itens Elegíveis de Grau S ou Superior (1% chance por slot gerado).
 * Itens raros/lendários verificados em ALL_ITEMS.
 */
export const RANDOM_CRAFT_POOL_S_PLUS = [
  { itemId: 'draconic_bow', count: 1, rarity: 'legendary' },
  { itemId: 'weapon_dragon_slayer_twohanded_sword', count: 1, rarity: 'legendary' },
  { itemId: 'imperial_staff', count: 1, rarity: 'legendary' },
  { itemId: 'draconic_armor', count: 1, rarity: 'legendary' },
  { itemId: 'imperial_crusader_breastplate', count: 1, rarity: 'legendary' },
  { itemId: 'crystal_gold_s', count: 5, rarity: 'legendary' },
  // Joias Épicas / Boss Jewels
  { itemId: 'ring_core', count: 1, rarity: 'sovereign' },
  { itemId: 'ring_queen_ant', count: 1, rarity: 'sovereign' },
  { itemId: 'ring_of_baium', count: 1, rarity: 'sovereign' },
  { itemId: 'earring_of_zaken', count: 1, rarity: 'sovereign' },
  { itemId: 'earring_of_antharas', count: 1, rarity: 'sovereign' },
  { itemId: 'necklace_of_valakas', count: 1, rarity: 'sovereign' }
];

/**
 * Rola 5 slots de Random Craft com 1% S+ e 99% inferior a S para cada slot.
 * @returns {Array<{itemId: string, count: number, rarity: string}>}
 */
export function rollCanonicalRandomCraftSlots() {
  const slots = [];
  for (let i = 0; i < RANDOM_CRAFT_SLOT_COUNT; i++) {
    const isSPlus = Math.random() < RANDOM_CRAFT_S_PLUS_SLOT_CHANCE;
    const pool = isSPlus ? RANDOM_CRAFT_POOL_S_PLUS : RANDOM_CRAFT_POOL_BELOW_S;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    slots.push({
      itemId: picked.itemId,
      count: picked.count || 1,
      rarity: picked.rarity || (isSPlus ? 'legendary' : 'rare')
    });
  }
  return slots;
}
