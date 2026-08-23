// manor.js — Sistema Manor de Sementes, Colheita Agrícola & Troca de Materiais
export const MANOR_PROVINCES = {
  gludio: {
    id: 'gludio',
    name: 'Província de Gludio',
    minLvl: 1,
    maxLvl: 30,
    icon: '🌾🏰',
    seed: {
      id: 'seed_gludio',
      name: 'Semente de Trigo Gélido (Gludio)',
      cost: 150,
      cropId: 'crop_gludio',
      cropName: 'Trigo Gélido Colhido',
      rewardItem: 'var_of_purity',
      rewardItemName: 'Varnish of Purity',
      exchangeRate: 5 // 5 colheitas = 1 Varnish of Purity
    }
  },
  dion: {
    id: 'dion',
    name: 'Província de Dion',
    minLvl: 30,
    maxLvl: 50,
    icon: '🎃🏰',
    seed: {
      id: 'seed_dion',
      name: 'Semente de Abóbora de Dion',
      cost: 350,
      cropId: 'crop_dion',
      cropName: 'Abóbora Encantada Colhida',
      rewardItem: 'mithril_alloy',
      rewardItemName: 'Mithril Alloy',
      exchangeRate: 6 // 6 colheitas = 1 Mithril Alloy
    }
  },
  giran: {
    id: 'giran',
    name: 'Província de Giran',
    minLvl: 50,
    maxLvl: 70,
    icon: '🍇🏰',
    seed: {
      id: 'seed_giran',
      name: 'Semente de Uva Dourada (Giran)',
      cost: 750,
      cropId: 'crop_giran',
      cropName: 'Uva Dourada Colhida',
      rewardItem: 'enria',
      rewardItemName: 'Enria',
      exchangeRate: 8 // 8 colheitas = 1 Enria
    }
  }
};
