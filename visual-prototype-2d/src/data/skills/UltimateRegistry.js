/**
 * UltimateRegistry.js
 * 
 * Formal Matrix of 8 Class-Exclusive Ultimates (Lv80) and 8 Master Ultimates (Lv90).
 * Direct implementation of Section 31, 32, 33, 34, 35, 36.
 */

export const ULTIMATE_MATRIX = {
  human_fighter: {
    ultimateId: 'titanbreaker',
    masterUltimateId: 'master_titanbreaker',
    name: 'Titanbreaker',
    masterName: 'Master: Titanbreaker',
    element: 'Physical',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  human_sorcerer: {
    ultimateId: 'meteor',
    masterUltimateId: 'master_meteor',
    name: 'Meteor',
    masterName: 'Master: Meteor',
    element: 'Fire',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  elf_fighter: {
    ultimateId: 'tidal_ascension',
    masterUltimateId: 'master_tidal_ascension',
    name: 'Tidal Ascension',
    masterName: 'Master: Tidal Ascension',
    element: 'Water',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  elf_mage: {
    ultimateId: 'glacial_cataclysm',
    masterUltimateId: 'master_glacial_cataclysm',
    name: 'Glacial Cataclysm',
    masterName: 'Master: Glacial Cataclysm',
    element: 'Ice',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  dark_elf_fighter: {
    ultimateId: 'abyssal_rupture',
    masterUltimateId: 'master_abyssal_rupture',
    name: 'Abyssal Rupture',
    masterName: 'Master: Abyssal Rupture',
    element: 'Dark',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  dark_elf_mage: {
    ultimateId: 'tempest_of_the_abyss',
    masterUltimateId: 'master_tempest_of_the_abyss',
    name: 'Tempest of the Abyss',
    masterName: 'Master: Tempest of the Abyss',
    element: 'Lightning',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  orc_fighter: {
    ultimateId: 'worldbreaker_roar',
    masterUltimateId: 'master_worldbreaker_roar',
    name: 'Worldbreaker Roar',
    masterName: 'Master: Worldbreaker Roar',
    element: 'Fire',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  },

  orc_shaman: {
    ultimateId: 'apocalypse_totem',
    masterUltimateId: 'master_apocalypse_totem',
    name: 'Apocalypse Totem',
    masterName: 'Master: Apocalypse Totem',
    element: 'Fire',
    requiredLevel: 80,
    masterLevel: 90,
    bookRequirement: 'ULTIMATE_BOOK_4',
    rarity: 4,
    masterRarity: 5
  }
};

export function getClassUltimate(classId) {
  if (!classId) return null;
  return ULTIMATE_MATRIX[classId] || null;
}

export function isUltimateSkill(skillId) {
  return Object.values(ULTIMATE_MATRIX).some(u => u.ultimateId === skillId || u.masterUltimateId === skillId);
}
