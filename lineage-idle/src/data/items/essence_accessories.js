const icon = (path) => `https://l2wiki.com/upload/images/icon/${path}.png`;
const agathionIcon = (path) => path.startsWith('https://') ? path : `agathions/${path}`;
const item = (id, name, slot, tier, reqLevel, stats, iconPath, craft, extra = {}) => ({
  id, itemId: id, name, slot, tier, grade: tier >= 5 ? 's' : tier >= 4 ? 'a' : tier >= 3 ? 'b' : 'c',
  rarity: tier >= 5 ? 'legendary' : tier >= 4 ? 'epic' : 'rare',
  req: { level: reqLevel }, price: Math.max(5000, Math.round((reqLevel ** 2) * 7)),
  ...stats, icon: iconPath, ...craft, ...extra
});

const recipe = (craftLevel, gold, craftMaterials) => ({ craftLevel, craftGold: gold, craftMaterials });

export const DRAGON_CORE_ITEMS = {
  dragon_core_fafurion: { id: 'dragon_core_fafurion', itemId: 'dragon_core_fafurion', name: 'Núcleo Abissal de Fafurion', slot: 'material', tier: 6, stack: 99, price: 220000, icon: 'materials/water_drop.png', desc: 'Recompensa da instância semanal Fafurion’s Nest. Componente obrigatório para as Dragon Weapons de Fafurion.' },
  dragon_core_antharas: { id: 'dragon_core_antharas', itemId: 'dragon_core_antharas', name: 'Núcleo de Pedra de Antharas', slot: 'material', tier: 6, stack: 99, price: 260000, icon: 'materials/dark_seed.png', desc: 'Fragmento do Raid Boss Antharas usado para criar Dragon Weapons.' },
  dragon_core_lindvior: { id: 'dragon_core_lindvior', itemId: 'dragon_core_lindvior', name: 'Núcleo Tempestuoso de Lindvior', slot: 'material', tier: 6, stack: 99, price: 300000, icon: 'materials/white_gemstone.png', desc: 'Fragmento do Raid Boss Lindvior usado para criar Dragon Weapons.' },
  dragon_core_valakas: { id: 'dragon_core_valakas', itemId: 'dragon_core_valakas', name: 'Coração Flamejante de Valakas', slot: 'material', tier: 6, stack: 99, price: 350000, icon: 'materials/fire_reagent.png', desc: 'Fragmento do Raid Boss Valakas usado para criar Dragon Weapons e Agathion Queen Rumiel.' }
};

export const ESSENCE_BRACELETS = {};
for (let level = 1; level <= 5; level += 1) {
  const id = `agathion_bracelet_lv_${level}`;
  const base = level === 1 ? [{ id: 'silver_nugget', count: 30 }, { id: 'magic_powder', count: 12 }, { id: 'fish_oil', count: 8 }] : [
    { id: `agathion_bracelet_lv_${level - 1}`, count: 2 },
    { id: 'silver_nugget', count: 40 + level * 10 },
    { id: 'divine_crystal', count: level + 2 },
    { id: 'primordial_essence', count: Math.max(1, level - 2) }
  ];
  ESSENCE_BRACELETS[id] = item(id, `Agathion Bracelet Lv. ${level}`, 'agathion_bracelet', Math.min(6, level + 1), 20 + (level - 1) * 15,
    { agathionSlots: level <= 3 ? 5 : 6, craftTier: 'essence_accessory' },
    `https://l2wiki.com/upload/images/icon/${level <= 2 ? 'agathion_magmeld_teleport' : 'high_agathion_bracelet_i00'}.png`, recipe(Math.min(10, level + 3), 50000 * level, base),
    { desc: `Desbloqueia o uso de Agathions. Libera até ${level <= 3 ? 5 : 6} espaços entre slot principal e adicionais.` });
}

export const TALISMAN_BRACELETS = {};
for (let level = 1; level <= 10; level += 1) {
  const id = `talisman_bracelet_lv_${level}`;
  const slots = level <= 3 ? 4 : level === 4 ? 5 : 6;
  const craftMaterials = level === 1 ? [
    { id: 'silver_nugget', count: 25 }, { id: 'braided_hemp', count: 12 }, { id: 'fish_oil', count: 8 }
  ] : [
    { id: `talisman_bracelet_lv_${level - 1}`, count: 2 },
    { id: 'silver_nugget', count: 35 + level * 8 },
    { id: 'divine_crystal', count: 2 + Math.floor(level / 2) },
    { id: 'primordial_essence', count: Math.max(1, Math.floor(level / 2)) }
  ];
  TALISMAN_BRACELETS[id] = item(id, `Talisman Bracelet Lv. ${level}`, 'talisman_bracelet', Math.min(6, level), 20 + (level - 1) * 10,
    { talismanSlots: slots, craftTier: 'essence_accessory', def: level * 4, mdef: level * 4 },
    `https://l2wiki.com/upload/images/icon/dimension_bracelet_i${String(Math.min(level - 1, 9)).padStart(2, '0')}.png`, recipe(Math.min(10, level + 2), 60000 * level, craftMaterials),
    { desc: `Libera ${slots} espaços de talismã e concede +${level * 4} P.Def e M.Def.` });
}

export const ESSENCE_BROOCHES = {};
for (let level = 1; level <= 10; level += 1) {
  const id = `essence_brooch_lv_${level}`;
  const jewelSlots = Math.min(6, level + 1);
  const craftMaterials = level === 1 ? [
    { id: 'silver_nugget', count: 30 }, { id: 'gold_branch', count: 8 }, { id: 'fish_oil', count: 8 }
  ] : [
    { id: `essence_brooch_lv_${level - 1}`, count: 2 },
    { id: 'divine_crystal', count: 2 + level },
    { id: 'primordial_essence', count: Math.max(1, Math.floor(level / 2)) },
    { id: 'fish_oil', count: 5 + level }
  ];
  ESSENCE_BROOCHES[id] = item(id, `Brooch Lv. ${level}`, 'brooch', Math.min(6, level), 20 + (level - 1) * 10,
    { jewelSlots, inventorySlots: level === 1 ? 5 : level < 5 ? 9 : 15, craftTier: 'essence_accessory' },
    `https://l2wiki.com/upload/images/icon/etc_bm_brooch_lavianrose_i${String(Math.min(level - 1, 9)).padStart(2, '0')}.png`, recipe(Math.min(10, level + 2), 75000 * level, craftMaterials),
    { desc: `Libera ${jewelSlots} espaços para jewels de brooch e amplia a mochila.` });
}

const ZODIAC = [
  ['aries', 'Aries'], ['taurus', 'Taurus'], ['gemini', 'Gemini'], ['cancer', 'Cancer'],
  ['leo', 'Leo'], ['virgo', 'Virgo'], ['libra', 'Libra'], ['scorpio', 'Scorpio'],
  ['sagittarius', 'Sagittarius'], ['capricorn', 'Capricorn'], ['aquarius', 'Aquarius'], ['pisces', 'Pisces']
];
const ZODIAC_ICONS = {
  aries: 'agathion_joy.png', taurus: 'agathion_taurus.png', gemini: 'agathion_gemini.png', cancer: 'agathion_joy.png',
  leo: 'agathion_leo.png', virgo: 'agathion_virgo.png', libra: 'agathion_libra.png', scorpio: 'agathion_scorpion.png',
  sagittarius: 'agathion_sagitarius.png', capricorn: 'agathion_capricorn.png', aquarius: 'agathion_aquarius.png', pisces: 'agathion_joy.png'
};

export const ESSENCE_AGATHIONS = {};
const putAgathion = (id, name, iconName, reqLevel, stats, craftMaterials, extra = {}) => {
  ESSENCE_AGATHIONS[id] = item(id, name, 'agathion', reqLevel >= 100 ? 6 : 5, reqLevel, stats,
    agathionIcon(iconName), recipe(reqLevel >= 100 ? 10 : 8, reqLevel * 15000, craftMaterials),
    { craftTier: 'essence_accessory', agathionUnique: true, ...extra, desc: `${name}. Agathion adaptado à progressão de Aden; ocupa um espaço liberado pelo Agathion Bracelet.` });
};

const spiritStats = [
  ['agathion_ignis', 'Agathion Ignis', 'agathion_ignis.png', { atk: 24, crit: 3 }],
  ['agathion_nebula', 'Agathion Nebula', 'agathion_nebula.png', { matk: 24, mdef: 12 }],
  ['agathion_procella', 'Agathion Procella', 'agathion_procella.png', { atk: 12, eva: 5, speed: 2 }],
  ['agathion_petram', 'Agathion Petram', 'agathion_petram.png', { def: 16, hp: 180 }],
  ['agathion_joy', 'Agathion Joy', 'agathion_joy.png', { atk: 10, matk: 10, hp: 100 }]
];
for (const [id, name, image, stats] of spiritStats) {
  putAgathion(id, name, image, 60, stats, [
    { id: 'primordial_essence', count: 4 }, { id: 'divine_crystal', count: 8 }, { id: 'fish_oil', count: 20 }
  ]);
}

for (const [key, name] of ZODIAC) {
  const stats = { atk: 8, matk: 8, hp: 80 };
  if (['leo', 'aries'].includes(key)) stats.crit = 3;
  if (['virgo', 'taurus'].includes(key)) stats.def = 6;
  if (['aquarius', 'pisces', 'cancer'].includes(key)) stats.mdef = 6;
  putAgathion(`agathion_${key}`, `Agathion ${name}`, ZODIAC_ICONS[key], 50, stats, [
    { id: 'silver_nugget', count: 50 }, { id: 'magic_powder', count: 25 }, { id: 'fish_oil', count: 15 }
  ]);
}

putAgathion('agathion_valakas', 'Agathion Valakas', 'agathion_valakas.png', 90,
  { atk: 28, matk: 22, crit: 5, hp: 180 },
  [{ id: 'dragon_bone', count: 30 }, { id: 'primordial_essence', count: 8 }, { id: 'dragon_core_valakas', count: 1 }]);
putAgathion('agathion_dragon_egg', 'Agathion Dragon Egg', 'agathion_valakas.png', 85,
  { atk: 20, matk: 18, hp: 160 },
  [{ id: 'dragon_bone', count: 24 }, { id: 'primordial_essence', count: 6 }, { id: 'fish_oil', count: 20 }]);
for (const [id, name] of [
  ['agathion_rudolph', 'Agathion Rudolph'],
  ['agathion_penitent', 'Penitent Agathion'],
  ['agathion_adventurer_griffin', "Adventurer's Agathion Griffin"]
]) {
  putAgathion(id, name, 'agathion_joy.png', 40, { hp: 120, def: 8 }, [
    { id: 'silver_nugget', count: 20 }, { id: 'gold_branch', count: 8 }, { id: 'fish_oil', count: 10 }
  ], { legacyEventItem: true });
}
putAgathion('agathion_light_spirit_queen_rumiel', 'Light Spirit Queen Rumiel', 'https://l2wiki.com/upload/images/icon/agathion_high_shabang.png', 110,
  { atk: 45, matk: 45, crit: 8, hp: 350, pveDamagePercent: 0.03 },
  [{ id: 'agathion_joy', count: 1 }, { id: 'dragon_core_valakas', count: 2 }, { id: 'primordial_essence', count: 25 }]);

const JEWEL_FAMILIES = [
  { key: 'ruby', name: 'Ruby', icon: 'etc_bm_jewel_ruby_i00', stats: level => ({ atk: level * 3, pveDamagePercent: level * 0.002 }) },
  { key: 'sapphire', name: 'Sapphire', icon: 'etc_bm_jewel_sapphire_i00', stats: level => ({ matk: level * 3, mSkillPowerPercent: level * 0.002 }) },
  { key: 'emerald', name: 'Emerald', icon: 'etc_bm_jewel_emerald_i00', stats: level => ({ hp: level * 35, cpPercent: level * 0.002 }) },
  { key: 'aquamarine', name: 'Aquamarine', icon: 'etc_bm_jewel_aquamarine_i00', stats: level => ({ def: level * 3, mdef: level * 3, stunResist: level * 0.002 }) },
  { key: 'opal', name: 'Opal', icon: 'etc_bm_jewel_opal_i00', stats: level => ({ atk: level * 2, matk: level * 2, pSkillPowerPercent: level * 0.002 }) },
  { key: 'amber', name: 'Amber', icon: 'etc_bm_jewel_amber_i00', stats: level => ({ crit: level * 2, eva: level }) },
  { key: 'topaz', name: 'Topaz', icon: 'etc_bm_jewel_topaz_i00', legacyMax: 5, stats: level => ({ atk: level * 2, hp: level * 18 }) },
  { key: 'garnet', name: 'Garnet', icon: 'etc_bm_jewel_garnet_i00', legacyMax: 5, stats: level => ({ crit: level, pveDamagePercent: level * 0.001 }) },
  { key: 'jade', name: 'Jade', icon: 'etc_bm_jewel_jade_i00', legacyMax: 5, stats: level => ({ def: level * 2, mdef: level * 2, hp: level * 16 }) }
];

export const ESSENCE_BROOCH_JEWELS = {};
for (const family of JEWEL_FAMILIES) {
  const maxLevel = family.legacyMax || 10;
  for (let level = 1; level <= maxLevel; level += 1) {
    const id = `essence_jewel_${family.key}_${level}`;
    const craftMaterials = level === 1 ? [
      { id: 'gold_branch', count: 8 }, { id: 'divine_crystal', count: 2 }, { id: 'fish_oil', count: 4 }
    ] : [
      { id: `essence_jewel_${family.key}_${level - 1}`, count: 2 },
      { id: 'divine_crystal', count: 1 + Math.floor(level / 2) },
      { id: 'primordial_essence', count: Math.max(1, Math.floor(level / 3)) }
    ];
    ESSENCE_BROOCH_JEWELS[id] = item(id, `${family.name} Lv. ${level}`, 'jewel', Math.min(6, 2 + Math.floor((level - 1) / 2)), 30 + (level - 1) * 8,
      { ...family.stats(level), jewelType: family.key, jewelLevel: level, craftTier: 'essence_accessory' },
      icon(family.icon), recipe(Math.min(10, 3 + Math.floor((level - 1) / 2)), 18000 * level, craftMaterials),
      { desc: `${family.name} Lv. ${level}. Jewel equipável em um slot de Brooch liberado.` });
  }
}

const TALISMAN_FAMILIES = [
  ['aden', 'Talisman of Aden', { hp: 140, atk: 8 }],
  ['hellbound', 'Talisman of Hellbound', { atk: 12, matk: 12, def: 8 }],
  ['baium', 'Talisman of Baium', { atk: 16, matk: 16, crit: 3 }],
  ['venir', "Venir's Talisman", { hp: 180, mp: 100, def: 10 }],
  ['authority', 'Talisman of Authority', { atk: 15, matk: 15, pveDamagePercent: 0.02 }],
  ['speed', 'Talisman of Speed', { speed: 4, atkSpeed: 4, eva: 4 }],
  ['eva', 'Talisman of Eva', { def: 8, mdef: 8, hp: 180 }],
  ['heavenly', 'Heavenly Talisman', { atk: 18, matk: 18, hp: 220, damageTakenReductionPercent: 0.02 }]
];

export const ESSENCE_TALISMANS = {};
for (let index = 0; index < TALISMAN_FAMILIES.length; index += 1) {
  const [key, name, stats] = TALISMAN_FAMILIES[index];
  const id = `essence_talisman_${key}`;
  const reqLevel = 35 + index * 10;
  ESSENCE_TALISMANS[id] = item(id, name, 'talisman', Math.min(6, 2 + Math.floor(index / 2)), reqLevel,
    { ...stats, talismanFamily: key, craftTier: 'essence_accessory' }, `talismans/talisman_${key}.png`,
    recipe(Math.min(10, 4 + index), reqLevel * 18000, [
      { id: key === 'hellbound' ? 'dragon_bone' : 'divine_crystal', count: 8 + index * 2 },
      { id: 'primordial_essence', count: 3 + index * 2 },
      { id: 'fish_oil', count: 10 + index * 2 }
    ]), { desc: `${name}, equipamento final consolidado por família. Variantes de enchantment e Blessed mantêm esta base.` });
}

ESSENCE_TALISMANS.essence_talisman_hellbound_transcendent = item(
  'essence_talisman_hellbound_transcendent', 'Transcendent Talisman of Hellbound', 'talisman', 7, 110,
  { atk: 34, matk: 34, crit: 8, hp: 500, pveDamagePercent: 0.05, talismanFamily: 'hellbound' },
  'https://l2wiki.com/upload/images/icon/transcend_hellbound_talisman_i00.png',
  recipe(10, 5500000, [
    { id: 'essence_talisman_hellbound', count: 1 }, { id: 'dragon_core_antharas', count: 1 },
    { id: 'primordial_essence', count: 30 }, { id: 'dragon_bone', count: 80 }, { id: 'fish_oil', count: 60 }
  ]), { craftTier: 'essence_accessory', desc: 'Evolução transcendente do Talisman of Hellbound.' }
);
ESSENCE_TALISMANS.essence_talisman_heavenly_blessed = item(
  'essence_talisman_heavenly_blessed', 'Blessed Heavenly Talisman', 'talisman', 7, 105,
  { atk: 30, matk: 30, def: 20, mdef: 20, hp: 420, damageTakenReductionPercent: 0.04, talismanFamily: 'heavenly' },
  'https://l2wiki.com/upload/images/icon/bless_talisman_of_heaven_i00.png',
  recipe(10, 4800000, [
    { id: 'essence_talisman_heavenly', count: 2 }, { id: 'dragon_core_lindvior', count: 1 },
    { id: 'primordial_essence', count: 24 }, { id: 'divine_crystal', count: 30 }
  ]), { craftTier: 'essence_accessory', desc: 'Versão Blessed do Heavenly Talisman.' }
);
ESSENCE_TALISMANS.essence_talisman_venir_transcendent = item(
  'essence_talisman_venir_transcendent', "Venir's Transcendent Talisman", 'talisman', 7, 100,
  { hp: 550, mp: 300, atk: 24, matk: 24, def: 18, mdef: 18, talismanFamily: 'venir' },
  'talismans/talisman_venir.png',
  recipe(10, 4200000, [
    { id: 'essence_talisman_venir', count: 1 }, { id: 'dragon_core_fafurion', count: 1 },
    { id: 'primordial_essence', count: 20 }, { id: 'fish_oil', count: 40 }
  ]), { craftTier: 'essence_accessory', desc: "Evolução transcendente do Venir's Talisman." }
);

export const ESSENCE_ACCESSORY_ITEMS = {
  ...DRAGON_CORE_ITEMS,
  ...ESSENCE_BRACELETS,
  ...TALISMAN_BRACELETS,
  ...ESSENCE_BROOCHES,
  ...ESSENCE_AGATHIONS,
  ...ESSENCE_BROOCH_JEWELS,
  ...ESSENCE_TALISMANS
};
