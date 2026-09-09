/**
 * WeaponRegistry.js
 * 
 * Formal weapon profile declarations for the 8 playable classes.
 * Direct implementation of Section 26.
 */

export const WEAPON_PROFILES = {
  sword: {
    id: 'sword',
    name: 'Espada de Aço Real',
    category: 'one_handed_blade',
    anchor: 'weapon',
    visualTrail: 'steel_arc',
    impactType: 'slash'
  },
  staff: {
    id: 'staff',
    name: 'Cajado de Conjurador Arcana',
    category: 'magic_catalyst',
    anchor: 'castPoint',
    visualTrail: 'magic_flare',
    impactType: 'arcane'
  },
  light_blade: {
    id: 'light_blade',
    name: 'Lâminas Ágeis / Adagas Gêmeas',
    category: 'dual_light_blade',
    anchor: 'weapon',
    visualTrail: 'shadow_flicker',
    impactType: 'pierce'
  },
  heavy_weapon: {
    id: 'heavy_weapon',
    name: 'Machado / Montante Brutal Orc',
    category: 'two_handed_heavy',
    anchor: 'weapon',
    visualTrail: 'savage_cleave',
    impactType: 'blunt_crush'
  },
  ritual_staff: {
    id: 'ritual_staff',
    name: 'Bastão Ritualístico Xamânico',
    category: 'totemic_catalyst',
    anchor: 'castPoint',
    visualTrail: 'totem_smoke',
    impactType: 'ritual'
  }
};

export const CLASS_WEAPON_MAP = {
  human_fighter: 'sword',
  human_sorcerer: 'staff',
  elf_fighter: 'light_blade',
  elf_mage: 'staff',
  dark_elf_fighter: 'light_blade',
  dark_elf_mage: 'staff',
  orc_fighter: 'heavy_weapon',
  orc_shaman: 'ritual_staff'
};

export function getWeaponProfile(weaponId) {
  if (!weaponId) return null;
  return WEAPON_PROFILES[weaponId] || null;
}

export function getClassWeaponProfile(classId) {
  const weaponId = CLASS_WEAPON_MAP[classId];
  return getWeaponProfile(weaponId);
}
