import { WEAPONS } from './weapons.js';

const ARCHETYPES = [
  { key: 'sword', source: 'weapon_frost_lord_sword', title: 'Sword', infinity: 'weapon_infinity_blade', dragonIconType: 'sword' },
  { key: 'dagger', source: 'weapon_frost_lord_dagger', title: 'Dagger', infinity: 'weapon_infinity_dagger', dragonIconType: 'dagger' },
  { key: 'fists', source: 'weapon_frost_lord_dualfist', title: 'Fists', dragonIconType: 'dualfist', suffixes: ['Fists of Water', 'Fists of Stone', 'Fists of Hurricane', 'Lava Fists'] },
  { key: 'bow', source: 'weapon_frost_lord_bow', title: 'Bow', infinity: 'weapon_infinity_bow', dragonIconType: 'bow' },
  { key: 'ancient_sword', source: 'weapon_frost_lord_ancientsword', title: 'Ancient Sword', infinity: 'weapon_infinity_blade', dragonIconType: 'ancientsword' },
  { key: 'staff', source: 'weapon_frost_lord_staff', title: 'Staff', infinity: 'weapon_infinity_rod' },
  { key: 'two_hand_sword', source: 'weapon_frost_lord_two_hand_sword', title: 'Two-handed Sword', infinity: 'weapon_infinity_cleaver', dragonIconType: 'twohand_sword' },
  { key: 'spear', source: 'weapon_frost_lord_spear', title: 'Spear', infinity: 'weapon_infinity_spear', dragonIconType: 'pole' },
  { key: 'axe', source: 'weapon_frost_lord_axe', title: 'Axe', infinity: 'weapon_infinity_axe', dragonIconType: 'blunt' },
  { key: 'magic_blunt', source: 'weapon_frost_lord_magic_blunt', title: 'Magic Blunt Weapon', infinity: 'weapon_infinity_rod', dragonIconType: 'staff' },
  { key: 'dual_sword', source: 'weapon_frost_lord_dual_sword', title: 'Dual Swords', infinity: 'weapon_infinity_duals', dragonIconType: 'dual', names: ['Fafurion Dual Swords', 'Antharas Dual Swords', "Lindvior's Dual Swords", "Valakas' Dual Swords"] },
  { key: 'pistols', source: 'weapon_frost_lord_pistol', title: 'Pistols', dragonIconType: 'shooter' },
  { key: 'rapier', source: 'weapon_frost_lord_rapier', title: 'Rapier', infinity: 'weapon_infinity_blade', dragonIconType: 'rapier' }
];

const DRAGONS = [
  { key: 'fafurion', name: "Fafurion's", element: 'water', core: 'dragon_core_fafurion', statScale: 1.02, req: 100, enchant: 1 },
  { key: 'antharas', name: "Antharas'", element: 'earth', core: 'dragon_core_antharas', statScale: 1.07, req: 105, enchant: 1.08 },
  { key: 'lindvior', name: "Lindvior's", element: 'wind', core: 'dragon_core_lindvior', statScale: 1.12, req: 110, enchant: 1.16 },
  { key: 'valakas', name: "Valakas'", element: 'fire', core: 'dragon_core_valakas', statScale: 1.18, req: 115, enchant: 1.24 }
];

const CORE_STATS = {
  weapon_infinity_blade: { atk: 280, matk: 190, crit: 12 },
  weapon_infinity_dagger: { atk: 255, matk: 190, crit: 22, eva: 18 },
  weapon_infinity_bow: { atk: 395, matk: 190, crit: 18 },
  weapon_infinity_rod: { atk: 175, matk: 360, crit: 8 },
  weapon_infinity_cleaver: { atk: 345, matk: 190, crit: 15 },
  weapon_infinity_spear: { atk: 384, matk: 190, crit: 12 },
  weapon_infinity_axe: { atk: 280, matk: 190, crit: 10 },
  weapon_infinity_duals: { atk: 340, matk: 190, crit: 16 }
};

function getDragonWeaponName(dragon, archetype, dragonIndex) {
  if (archetype.names?.[dragonIndex]) return archetype.names[dragonIndex];
  const form = archetype.suffixes?.[dragonIndex] || archetype.title;
  return `${dragon.name} ${form}`;
}

function getDragonWeaponIcon(dragon, archetype, sourceIcon) {
  if (!archetype.dragonIconType) return sourceIcon || null;
  const dragonKey = dragon.key === 'antharas' ? 'antaras' : dragon.key;
  return `https://l2wiki.com/upload/images/icon/dragon_wp_${dragonKey}_${archetype.dragonIconType}_i00.png`;
}

export const DRAGON_WEAPONS = {};
for (let dragonIndex = 0; dragonIndex < DRAGONS.length; dragonIndex += 1) {
  const dragon = DRAGONS[dragonIndex];
  for (const archetype of ARCHETYPES) {
    const source = WEAPONS[archetype.source];
    if (!source) continue;
    const core = archetype.infinity ? CORE_STATS[archetype.infinity] : null;
    const sourceAtk = Math.max(Number(source.atk) || 0, Math.round((core?.atk || 0) * 1.08));
    const sourceMatk = Math.max(Number(source.matk) || 0, Math.round((core?.matk || 0) * 1.08));
    const physical = Math.round(sourceAtk * dragon.statScale);
    const magical = Math.round(sourceMatk * dragon.statScale);
    const id = `weapon_dragon_${dragon.key}_${archetype.key}`;
    const elementalBonus = dragon.key === 'valakas'
      ? { critDmg: 0.08, pveDamagePercent: 0.04 }
      : dragon.key === 'lindvior'
        ? { crit: 10, eva: 8 }
        : dragon.key === 'antharas'
          ? { hp: 350, def: 20 }
          : { mdef: 25, mp: 200 };

    DRAGON_WEAPONS[id] = {
      ...source,
      ...elementalBonus,
      id,
      name: getDragonWeaponName(dragon, archetype, dragonIndex),
      icon: getDragonWeaponIcon(dragon, archetype, source.icon),
      slot: 'weapon',
      tier: 7,
      grade: 's',
      rarity: 'legendary',
      atk: physical,
      matk: magical,
      crit: Math.max(Number(source.crit) || 0, Number(core?.crit) || 0),
      eva: Math.max(Number(source.eva) || 0, Number(core?.eva) || 0),
      req: { ...(source.req || {}), level: dragon.req },
      price: Math.round((source.price || 100000) * 8 * dragon.statScale),
      dragonWeapon: true,
      dragon: dragon.key,
      element: dragon.element,
      maxEnchant: 16,
      craftLevel: 10,
      craftTier: 'dragon_weapon',
      fixedCraftRarity: 'legendary',
      noCriticalCraft: true,
      craftGold: 3500000 + dragonIndex * 1500000,
      craftMaterials: [
        { id: dragon.core, count: 1 },
        { id: 'dragon_bone', count: 120 + dragonIndex * 20 },
        { id: 'primordial_essence', count: 18 + dragonIndex * 4 },
        { id: 'adamantite', count: 80 + dragonIndex * 20 },
        { id: 'oriharukon_ore', count: 60 + dragonIndex * 15 },
        { id: 'fish_oil', count: 60 + dragonIndex * 15 }
      ],
      desc: `Arma Dragon de ${dragon.element}. Arma de maior poder do jogo; progressão final entre os níveis ${dragon.req}–120.`
    };
  }
}

export const DRAGON_WEAPON_ARCHETYPES = ARCHETYPES;
export const DRAGON_WEAPON_CORES = DRAGONS.map(({ key, core, req }) => ({ dragon: key, itemId: core, req }));
