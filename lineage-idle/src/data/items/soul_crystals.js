/**
 * soul_crystals.js — Catálogo de Itens de Soul Crystals (Estágios 1 a 15).
 */

export const SOUL_CRYSTAL_ITEMS = {};

const colors = [
  { key: 'red', name: 'Vermelho', icon: 'gradespecial/jewels/jewel_necklace_of_valakas.png' },
  { key: 'green', name: 'Verde', icon: 'gradespecial/jewels/jewel_ring_of_queen_ant.png' },
  { key: 'blue', name: 'Azul', icon: 'gradespecial/jewels/jewel_ring_of_core.png' }
];

for (const c of colors) {
  for (let st = 1; st <= 15; st++) {
    const itemId = `soul_crystal_${c.key}_stage${st}`;
    SOUL_CRYSTAL_ITEMS[itemId] = {
      id: itemId,
      name: `Soul Crystal ${c.name} - Estágio ${st}${st === 15 ? ' (Lendário)' : ''}`,
      slot: 'crystal',
      type: 'soul_crystal',
      isSoulCrystal: true,
      stage: st,
      crystalLevel: st,
      color: c.key,
      tier: st >= 14 ? 6 : st >= 10 ? 5 : st >= 5 ? 4 : 3,
      rarity: st === 15 ? 'sovereign' : st === 14 ? 'primordial' : st >= 10 ? 'legendary' : st >= 5 ? 'epic' : 'rare',
      price: st * 50000,
      icon: c.icon,
      desc: `Soul Crystal ${c.name} Nível ${st}. Absorva almas de monstros para evoluir até o Estágio 15 e engaste em sua arma para liberar a Habilidade Especial (SA)!`
    };
  }
}

// Alias padrão
SOUL_CRYSTAL_ITEMS['soul_crystal_initial'] = SOUL_CRYSTAL_ITEMS['soul_crystal_red_stage1'];
