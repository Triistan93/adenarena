/**
 * ClassIdentity.js
 * 
 * Normative gameplay identities for the 8 playable classes across 4 races.
 * Direct implementation of Section 2, 3, 4 of the Master Specification.
 */

export const ProgressionStage = {
  GENERALIST: 'GENERALIST',
  SPECIALIZATION: 'SPECIALIZATION',
  MASTERY: 'MASTERY',
  ULTIMATE: 'ULTIMATE',
  MASTER_ULTIMATE: 'MASTER_ULTIMATE'
};

export function getProgressionStage(level) {
  const lvl = Number(level) || 1;
  if (lvl < 40) return ProgressionStage.GENERALIST;
  if (lvl < 76) return ProgressionStage.SPECIALIZATION;
  if (lvl < 80) return ProgressionStage.MASTERY;
  if (lvl < 90) return ProgressionStage.ULTIMATE;
  return ProgressionStage.MASTER_ULTIMATE;
}

export const CLASS_IDENTITIES = {
  human_fighter: {
    id: 'human_fighter',
    name: 'Human Fighter',
    race: 'Human',
    primaryRole: 'burst_damage',
    archetype: 'fighter',
    specialization: 'Physical Combat Specialist',
    mastery: 'Physical Mastery',
    allowedElements: {
      GENERALIST: ['Physical'],
      SPECIALIZATION: ['Physical'],
      MASTERY: ['Physical'],
      ULTIMATE: ['Physical'],
      MASTER_ULTIMATE: ['Physical']
    },
    ultimateId: 'titanbreaker',
    masterUltimateId: 'master_titanbreaker',
    ultimateName: 'Titanbreaker',
    masterUltimateName: 'Master: Titanbreaker',
    description: 'Guerrero humano focado em combate físico puro e impacto marcial devastador.'
  },

  human_sorcerer: {
    id: 'human_sorcerer',
    name: 'Human Sorcerer',
    race: 'Human',
    primaryRole: 'burst_damage',
    archetype: 'mage',
    specialization: 'Fire Specialist',
    mastery: 'Fire + Magma Mastery',
    allowedElements: {
      GENERALIST: ['Arcane', 'Fire'],
      SPECIALIZATION: ['Fire'],
      MASTERY: ['Fire', 'Magma'],
      ULTIMATE: ['Fire', 'Magma'],
      MASTER_ULTIMATE: ['Fire', 'Magma']
    },
    ultimateId: 'meteor',
    masterUltimateId: 'master_meteor',
    ultimateName: 'Meteor',
    masterUltimateName: 'Master: Meteor',
    description: 'Mago pirocinético imperial que canaliza chamas solares e erupções de magma.'
  },

  elf_fighter: {
    id: 'elf_fighter',
    name: 'Elf Fighter',
    race: 'Elf',
    primaryRole: 'mobility',
    archetype: 'fighter',
    specialization: 'Tidal Warrior',
    mastery: 'Water + Ice Mastery',
    allowedElements: {
      GENERALIST: ['Physical'],
      SPECIALIZATION: ['Water', 'Physical'],
      MASTERY: ['Water', 'Ice', 'Physical'],
      ULTIMATE: ['Water', 'Ice', 'Physical'],
      MASTER_ULTIMATE: ['Water', 'Ice', 'Physical']
    },
    ultimateId: 'tidal_ascension',
    masterUltimateId: 'master_tidal_ascension',
    ultimateName: 'Tidal Ascension',
    masterUltimateName: 'Master: Tidal Ascension',
    description: 'Combatente gracioso com movimentos fluidos de maré e lâminas congeladas.'
  },

  elf_mage: {
    id: 'elf_mage',
    name: 'Elf Mage',
    race: 'Elf',
    primaryRole: 'aoe_damage',
    archetype: 'mage',
    specialization: 'Water Mage',
    mastery: 'Water + Ice Mastery',
    allowedElements: {
      GENERALIST: ['Arcane', 'Water'],
      SPECIALIZATION: ['Water'],
      MASTERY: ['Water', 'Ice'],
      ULTIMATE: ['Water', 'Ice'],
      MASTER_ULTIMATE: ['Water', 'Ice']
    },
    ultimateId: 'glacial_cataclysm',
    masterUltimateId: 'master_glacial_cataclysm',
    ultimateName: 'Glacial Cataclysm',
    masterUltimateName: 'Master: Glacial Cataclysm',
    description: 'Conjurador élfico das águas puras que cristaliza o campo em tempestades de gelo.'
  },

  dark_elf_fighter: {
    id: 'dark_elf_fighter',
    name: 'Dark Elf Fighter',
    race: 'Dark Elf',
    primaryRole: 'dot',
    archetype: 'fighter',
    specialization: 'Venomous Dark Warrior',
    mastery: 'Dark + Poison Mastery',
    allowedElements: {
      GENERALIST: ['Physical', 'Dark'],
      SPECIALIZATION: ['Dark', 'Poison'],
      MASTERY: ['Dark', 'Poison'],
      ULTIMATE: ['Dark', 'Poison'],
      MASTER_ULTIMATE: ['Dark', 'Poison']
    },
    ultimateId: 'abyssal_rupture',
    masterUltimateId: 'master_abyssal_rupture',
    ultimateName: 'Abyssal Rupture',
    masterUltimateName: 'Master: Abyssal Rupture',
    description: 'Assassino mortal das sombras que empunha venenos virulentos e lâminas amaldiçoadas.'
  },

  dark_elf_mage: {
    id: 'dark_elf_mage',
    name: 'Dark Elf Mage',
    race: 'Dark Elf',
    primaryRole: 'aoe_damage',
    archetype: 'mage',
    specialization: 'Abyssal Storm Mage',
    mastery: 'Wind + Lightning + Dark Mastery',
    allowedElements: {
      GENERALIST: ['Dark', 'Wind'],
      SPECIALIZATION: ['Wind', 'Dark'],
      MASTERY: ['Wind', 'Lightning', 'Dark'],
      ULTIMATE: ['Wind', 'Lightning', 'Dark'],
      MASTER_ULTIMATE: ['Wind', 'Lightning', 'Dark']
    },
    ultimateId: 'tempest_of_the_abyss',
    masterUltimateId: 'master_tempest_of_the_abyss',
    ultimateName: 'Tempest of the Abyss',
    masterUltimateName: 'Master: Tempest of the Abyss',
    description: 'Mago sombrio que convoca tempestades abissais, relâmpagos negros e turbilhões de vento.'
  },

  orc_fighter: {
    id: 'orc_fighter',
    name: 'Orc Fighter',
    race: 'Orc',
    primaryRole: 'finisher',
    archetype: 'fighter',
    specialization: 'Fire Berserker',
    mastery: 'Physical + Fire Mastery',
    allowedElements: {
      GENERALIST: ['Physical'],
      SPECIALIZATION: ['Physical', 'Fire'],
      MASTERY: ['Physical', 'Fire'],
      ULTIMATE: ['Physical', 'Fire'],
      MASTER_ULTIMATE: ['Physical', 'Fire']
    },
    ultimateId: 'worldbreaker_roar',
    masterUltimateId: 'master_worldbreaker_roar',
    ultimateName: 'Worldbreaker Roar',
    masterUltimateName: 'Master: Worldbreaker Roar',
    description: 'Guerreiro orc colossal imbuído pela fúria do fogo e pancadas brutais de execução.'
  },

  orc_shaman: {
    id: 'orc_shaman',
    name: 'Orc Shaman',
    race: 'Orc',
    primaryRole: 'buff_support',
    archetype: 'mage',
    specialization: 'Fire Shaman',
    mastery: 'Fire Mastery',
    allowedElements: {
      GENERALIST: ['Fire', 'Spirit'],
      SPECIALIZATION: ['Fire'],
      MASTERY: ['Fire'],
      ULTIMATE: ['Fire'],
      MASTER_ULTIMATE: ['Fire']
    },
    ultimateId: 'apocalypse_totem',
    masterUltimateId: 'master_apocalypse_totem',
    ultimateName: 'Apocalypse Totem',
    masterUltimateName: 'Master: Apocalypse Totem',
    description: 'Xamã espiritual orc que canaliza totens flamejantes e rituais ancestrais de apocalipse.'
  }
};

export function getClassIdentity(classId) {
  if (!classId || typeof classId !== 'string') return null;
  const normalized = classId.trim().toLowerCase();
  return CLASS_IDENTITIES[normalized] || null;
}

export function getAllClassIds() {
  return Object.keys(CLASS_IDENTITIES);
}

export function getAllowedElements(classId, level) {
  const identity = getClassIdentity(classId);
  if (!identity) return [];
  const stage = getProgressionStage(level);
  return identity.allowedElements[stage] || [];
}
