// Aden Arena adaptation of Lineage II's Manor cycle: buy seeds, sow while hunting,
// harvest crops, then exchange them for crafting materials.
export const MANOR_PROVINCES = {
  gludio: { id: 'gludio', name: 'Feudo de Gludio', minLvl: 1, maxLvl: 30, icon: '🌾', seedIds: ['dark_coda', 'red_coda', 'chilly_coda', 'blue_coda'] },
  dion: { id: 'dion', name: 'Feudo de Dion', minLvl: 30, maxLvl: 50, icon: '🎃', seedIds: ['red_cobol', 'chilly_cobol'] },
  giran: { id: 'giran', name: 'Feudo de Giran', minLvl: 50, maxLvl: 75, icon: '🍇', seedIds: ['twin_codran'] },
  aden: { id: 'aden', name: 'Feudo de Aden', minLvl: 76, maxLvl: 120, icon: '👑', seedIds: ['king_coba'] }
};

export const MANOR_SEEDS = {
  dark_coda: { id: 'dark_coda', provinceId: 'gludio', name: 'Dark Coda', cropName: 'Dark Coda', level: 10, price: 100, reward1: 'stem', reward2: 'braided_hemp', ratio1: 5, ratio2: 2 },
  red_coda: { id: 'red_coda', provinceId: 'gludio', name: 'Red Coda', cropName: 'Red Coda', level: 13, price: 200, reward1: 'varnish', reward2: 'cokes', ratio1: 5, ratio2: 2 },
  chilly_coda: { id: 'chilly_coda', provinceId: 'gludio', name: 'Chilly Coda', cropName: 'Chilly Coda', level: 16, price: 350, reward1: 'suede', reward2: 'oriharukon_ore', ratio1: 5, ratio2: 2 },
  blue_coda: { id: 'blue_coda', provinceId: 'gludio', name: 'Blue Coda', cropName: 'Blue Coda', level: 19, price: 500, reward1: 'animal_skin', reward2: 'crafted_leather', ratio1: 5, ratio2: 2 },
  red_cobol: { id: 'red_cobol', provinceId: 'dion', name: 'Red Cobol', cropName: 'Red Cobol', level: 31, price: 1000, reward1: 'charcoal', reward2: 'enria', ratio1: 10, ratio2: 2 },
  chilly_cobol: { id: 'chilly_cobol', provinceId: 'dion', name: 'Chilly Cobol', cropName: 'Chilly Cobol', level: 34, price: 1500, reward1: 'animal_bone', reward2: 'steel', ratio1: 10, ratio2: 3 },
  twin_codran: { id: 'twin_codran', provinceId: 'giran', name: 'Twin Codran', cropName: 'Twin Codran', level: 58, price: 3000, reward1: 'charcoal', reward2: 'mold_lubricant', ratio1: 15, ratio2: 3 },
  king_coba: { id: 'king_coba', provinceId: 'aden', name: 'King Coba', cropName: 'King Coba', level: 85, price: 10000, reward1: 'metallic_thread', reward2: 'durable_metal_plate', ratio1: 20, ratio2: 5 }
};
