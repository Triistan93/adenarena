/**
 * rebuild-from-folders.mjs
 * 
 * Scans public/img/icons/ subfolders and generates:
 *   1. lineage-idle/data/items.js -- full item database + ICON_MAP + ARMOR_SETS
 *   2. public/img/icons/icon_index.json -- canonical path map
 */

import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'img', 'icons');
const ITEMS_OUT = join(ROOT, 'lineage-idle', 'data', 'items.js');
const INDEX_OUT = join(ICONS_DIR, 'icon_index.json');

// ── Grade/Tier config ──
const GRADE_MAP = {
  'nograde':      { tier: 1,   grade: 'No Grade', level: 1 },
  'graded':       { tier: 2,   grade: 'D Grade',  level: 20 },
  'gradec':       { tier: 3,   grade: 'C Grade',  level: 40 },
  'gradeb':       { tier: 4,   grade: 'B Grade',  level: 52 },
  'gradea':       { tier: 4.5, grade: 'A Grade',  level: 61 },
  'gradespecial': { tier: 5,   grade: 'S Grade',  level: 76 },
};

// ── Filename -> exact item ID (without extension) ──
function toExactId(filename) {
  return filename.replace(/\.png$/i, '').replace(/\.png$/i, '').toLowerCase();
}

// ── Stripped alias ID (without armor_/jewel_/weapon_/shield_/wepoan_ prefix) ──
function toStrippedId(filename) {
  let id = toExactId(filename);
  return id.replace(/^(armor_|weapon_|jewel_|shield_|wepoan_)/, '');
}

// ── Detect slot from armor filename ──
function detectArmorSlot(filename) {
  const fn = filename.toLowerCase();
  if (/shield|buckler/.test(fn)) return 'shield';
  if (/sigil/.test(fn)) return 'sigil';
  if (/belt/.test(fn)) return 'belt';
  if (/cloa[ck]k?/.test(fn)) return 'cloak';
  if (/helmet|helm|circlet|hat|cap|mask/.test(fn)) return 'helmet';
  if (/boot/.test(fn)) return 'boots';
  if (/glove/.test(fn)) return 'gloves';
  if (/pants|gaiter/.test(fn)) return 'legs';
  if (/armor|breastplate|vest|tunic|robe/.test(fn)) return 'armor';
  return 'armor';
}

// ── Detect jewel slot ──
function detectJewelSlot(filename) {
  const fn = filename.toLowerCase();
  if (/ear/.test(fn)) return 'earring';
  if (/necklace/.test(fn)) return 'necklace';
  if (/ring/.test(fn)) return 'ring';
  return 'ring';
}

// ── Stat formulas (scale by tier) ──
function weaponStats(id, tier, filename) {
  const fn = filename.toLowerCase();
  const isStaff = /staff|mace|magic|blunt/.test(fn);
  const isBow   = /bow/.test(fn);
  const isDagger = /dagger|rapier/.test(fn);
  
  const baseAtk = Math.round(8 + tier * 26);
  const baseMatk = Math.round(10 + tier * 32);
  
  if (isStaff) {
    return { atk: Math.round(baseAtk * 0.4), matk: baseMatk, crit: 5, eva: 0 };
  }
  if (isBow) {
    return { atk: baseAtk, matk: 0, crit: 12, eva: 0 };
  }
  if (isDagger) {
    return { atk: baseAtk, matk: 0, crit: 12, eva: 8 };
  }
  return { atk: baseAtk, matk: 0, crit: 5, eva: 0 };
}

function armorStats(slot, tier, filename) {
  const fn = filename.toLowerCase();
  const isRobe = /robe/.test(fn);
  const isLight = /light/.test(fn);
  
  const baseDef = Math.round(8 + tier * 22);
  const baseMdef = Math.round(4 + tier * 10);
  const baseHp = Math.round(10 + tier * 28);
  
  if (slot === 'armor') {
    if (isRobe)  return { def: Math.round(baseDef * 0.4), mdef: baseDef, matk: Math.round(baseDef * 0.4), hp: 0 };
    if (isLight) return { def: Math.round(baseDef * 0.68), mdef: baseMdef, matk: 0, hp: baseHp };
    return { def: baseDef, mdef: baseMdef, matk: 0, hp: baseHp }; // heavy
  }
  if (slot === 'helmet') {
    return { def: Math.round(baseDef * 0.35), mdef: Math.round(baseMdef * 0.35), matk: 0, hp: Math.round(baseHp * 0.2) };
  }
  if (slot === 'gloves') {
    return { def: Math.round(baseDef * 0.2), mdef: Math.round(baseMdef * 0.2), matk: isRobe ? Math.round(baseDef * 0.1) : 0, hp: 0 };
  }
  if (slot === 'boots') {
    return { def: Math.round(baseDef * 0.25), mdef: Math.round(baseMdef * 0.25), matk: 0, hp: Math.round(baseHp * 0.15) };
  }
  if (slot === 'legs') {
    return { def: Math.round(baseDef * 0.6), mdef: Math.round(baseMdef * 0.6), matk: isRobe ? Math.round(baseDef * 0.25) : 0, hp: Math.round(baseHp * 0.5) };
  }
  if (slot === 'shield') {
    return { def: Math.round(baseDef * 0.45), mdef: Math.round(baseMdef * 0.3), matk: 0, hp: 0 };
  }
  if (slot === 'belt') {
    return { def: Math.round(baseDef * 0.15), mdef: Math.round(baseMdef * 0.15), matk: 0, hp: Math.round(baseHp * 0.3) };
  }
  if (slot === 'cloak') {
    return { def: Math.round(baseDef * 0.18), mdef: Math.round(baseMdef * 0.25), matk: 0, hp: Math.round(baseHp * 0.2) };
  }
  if (slot === 'sigil') {
    return { def: Math.round(baseDef * 0.1), mdef: Math.round(baseMdef * 0.15), matk: Math.round(baseDef * 0.1), hp: 0 };
  }
  return { def: Math.round(baseDef * 0.3), mdef: Math.round(baseMdef * 0.3), matk: 0, hp: 0 };
}

function jewelStats(slot, tier) {
  const baseMdef = Math.round(5 + tier * 15);
  if (slot === 'ring')     return { def: 0, mdef: baseMdef, matk: Math.round(baseMdef * 0.2), hp: Math.round(tier * 12) };
  if (slot === 'earring')  return { def: 0, mdef: Math.round(baseMdef * 1.1), matk: Math.round(baseMdef * 0.15), hp: Math.round(tier * 10) };
  if (slot === 'necklace') return { def: 0, mdef: Math.round(baseMdef * 1.2), matk: Math.round(baseMdef * 0.25), hp: Math.round(tier * 8) };
  return { def: 0, mdef: baseMdef, matk: 0, hp: 0 };
}

function price(tier) {
  return Math.round(200 + Math.pow(tier, 2.2) * 1200);
}

function toDisplayName(filename) {
  let name = filename.replace(/\.png$/i, '').replace(/\.png$/i, '');
  name = name.replace(/^(armor_|weapon_|jewel_|shield_|wepoan_)/i, '');
  name = name.replace(/^imgi_\d+_/, '');
  return name.split('_').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function scanDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.png') && !f.endsWith('.png.png'))
    .sort();
}

// ── Armor Sets Definition ──
const ARMOR_SETS = {
  devotion_set: {
    name: 'Devotion',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_devotion_armor_robe', helmet: 'armor_devotion_helmet',
      boots: 'armor_devotion_boots', gloves: 'armor_devotion_gloves', legs: 'armor_devotion_pants_robe'
    },
    bonuses: {
      2: { matk: 15, mp: 20 },
      3: { mdef: 15, mp: 30 },
      5: { matk: 35, mdef: 25, mp: 50, primary: { wit: 3, int: 2 } }
    }
  },
  brigandine_set: {
    name: 'Brigandine',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_brigandine_armor_heavy', helmet: 'armor_brigandine_helmet_heavy',
      boots: 'armor_brigandine_boots_heavy', gloves: 'armor_brigandine_gloves_heavy',
      legs: 'armor_brigandine_pants_heavy'
    },
    shieldPiece: 'armor_brigandine_shield',
    bonuses: {
      2: { def: 20, hp: 40 },
      3: { def: 30, hp: 60 },
      5: { def: 50, mdef: 30, hp: 100, primary: { con: 3, str: 2 } },
      6: { def: 25, hp: 50, primary: { con: 1 } }
    }
  },
  manticore_set: {
    name: 'Manticore',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_manticore_armor_light', helmet: 'armor_manticore_helmet_light',
      boots: 'armor_manticore_boots_light', gloves: 'armor_manticore_gloves_light',
      legs: 'armor_manticore_pants_light'
    },
    bonuses: {
      2: { atk: 18, eva: 4 },
      3: { crit: 3, hp: 40 },
      5: { atk: 40, crit: 5, eva: 8, primary: { dex: 3, str: 2 } }
    }
  },
  mithril_set: {
    name: 'Mithril',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_mithril_tunic_robe', helmet: 'armor_mithril_helmet_robe',
      boots: 'armor_mithril_boots_robe', gloves: 'armor_mithril_gloves_robe',
      legs: 'armor_mithril_pants_robe'
    },
    bonuses: {
      2: { matk: 25, mp: 40 },
      3: { mdef: 25, mp: 60 },
      5: { matk: 55, mdef: 45, mp: 100, primary: { wit: 3, men: 2 } }
    }
  },
  karmian_set: {
    name: 'Karmian',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_karmian_robe_armor', helmet: 'armor_karmian_helmet',
      boots: 'armor_karmian_robe_boots', gloves: 'armor_karmian_robe_gloves',
      legs: 'armor_karmian_robe_pants'
    },
    bonuses: {
      2: { matk: 40, mdef: 30 },
      3: { mp: 100, speed: 5 },
      5: { matk: 90, mdef: 70, mp: 150, primary: { wit: 4, int: 3 } }
    }
  },
  theca_set: {
    name: 'Theca',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_theca_light_armor', helmet: 'armor_theca_light_helmet',
      boots: 'armor_theca_light_boots', gloves: 'armor_theca_light_gloves',
      legs: 'armor_theca_light_pants'
    },
    bonuses: {
      2: { def: 35, atk: 30 },
      3: { eva: 6, crit: 4 },
      5: { def: 80, atk: 70, eva: 12, primary: { dex: 4, str: 3 } }
    }
  },
  avadon_set: {
    name: 'Avadon',
    fullPieceCount: 5,
    variantPieces: {
      armor: ['armor_avadon_heavy_armor', 'armor_avadon_light_armor', 'armor_avadon_robe_armor'],
      helmet: ['armor_avadon_heavy_helmet', 'armor_avadon_helmet'],
      boots: ['armor_avadon_heavy_boots', 'armor_avadon_light_boots'],
      gloves: ['armor_avadon_heavy_gloves', 'armor_avadon_light_gloves', 'armor_avadon_robe_gloves']
    },
    pieces: { legs: 'armor_avadon_heavy_pants' },
    shieldPiece: 'armor_avadon_shield',
    bonuses: {
      2: { def: 50, mdef: 40 },
      3: { hp: 150, mp: 100 },
      5: { def: 110, mdef: 90, hp: 250, primary: { con: 4, wit: 3 } },
      6: { def: 40, mdef: 30, primary: { con: 2 } }
    }
  },
  blue_wolf_set: {
    name: 'Blue Wolf',
    fullPieceCount: 5,
    variantPieces: {
      armor: ['armor_blue_wolf_heavy_armor', 'armor_blue_wolf_light_armor', 'armor_blue_wolf_robe_armor'],
      boots: ['armor_blue_wolf_heavy_boots', 'armor_blue_wolf_light_boots', 'armor_blue_wolf_robe_boots'],
      gloves: ['armor_blue_wolf_heavy_gloves', 'armor_blue_wolf_light_gloves', 'armor_blue_wolf_robe_gloves'],
      legs: ['armor_blue_wolf_heavy_pants', 'armor_blue_wolf_robe_pants']
    },
    pieces: { helmet: 'armor_blue_wolf_helmet' },
    shieldPiece: 'armor_blue_wolf_shield',
    bonuses: {
      2: { atk: 50, matk: 50 },
      3: { def: 50, speed: 8 },
      5: { atk: 110, matk: 110, def: 100, primary: { str: 4, int: 3 } },
      6: { def: 45, hp: 150, primary: { str: 2 } }
    }
  },
  dark_crystal_set: {
    name: 'Dark Crystal',
    fullPieceCount: 5,
    variantPieces: {
      armor: ['armor_dark_crystal_heavy_armor', 'armor_dark_crystal_light_armor', 'armor_dark_crystal_robe_armor'],
      helmet: ['armor_dark_crystal_heavy_helmet', 'armor_dark_crystal_light_helmet', 'armor_dark_crystal_robe_helmet'],
      boots: ['armor_dark_crystal_heavy_boots', 'armor_dark_crystal_light_boots', 'armor_dark_crystal_robe_boots'],
      gloves: ['armor_dark_crystal_heavy_glove', 'armor_dark_crystal_light_glove', 'armor_dark_crystal_robe_glove'],
      legs: ['armor_dark_crystal_heavy_pants', 'armor_dark_crystal_light_pants']
    },
    shieldPiece: 'armor_dark_crystal_shield',
    bonuses: {
      2: { matk: 80, atk: 70 },
      3: { mdef: 80, speed: 10 },
      5: { matk: 180, mdef: 150, speed: 15, primary: { wit: 5, int: 4 } },
      6: { mdef: 60, def: 50, primary: { men: 2 } }
    }
  },
  tallum_set: {
    name: 'Tallum',
    fullPieceCount: 5,
    variantPieces: {
      armor: ['armor_tallum_heavy_armor', 'armor_tallum_light_armor', 'armor_tallum_robe_armor'],
      helmet: ['armor_tallum_heavy_helmet', 'armor_tallum_light_helmet', 'armor_tallum_robe_helmet'],
      boots: ['armor_tallum_heavy_boots', 'armor_tallum_light_boots', 'armor_tallum_robe_boots'],
      gloves: ['armor_tallum_heavy_glove', 'armor_tallum_light_glove', 'armor_tallum_robe_glove']
    },
    pieces: { legs: 'armor_tallum_robe_pants' },
    bonuses: {
      2: { atk: 85, def: 75 },
      3: { hp: 300, crit: 6 },
      5: { atk: 190, def: 160, hp: 500, primary: { str: 5, dex: 4 } }
    }
  },
  imperial_crusader_set: {
    name: 'Imperial Crusader',
    fullPieceCount: 5,
    pieces: {
      armor: 'armor_imperial_crusader_breastplate', helmet: 'armor_imperial_crusader_helmet',
      boots: 'armor_imperial_crusader_boots', gloves: 'armor_imperial_crusader_gloves',
      legs: 'armor_imperial_crusader_pants'
    },
    shieldPiece: 'armor_imperial_crusader_shield',
    bonuses: {
      2: { def: 120, mdef: 100 },
      3: { hp: 500, def: 150 },
      5: { def: 320, mdef: 240, hp: 900, primary: { con: 6, str: 5 } },
      6: { def: 100, mdef: 80, primary: { con: 3 } }
    }
  },

  // ---- Formato "fullbody" (4 peças — armor já é peito+perna, sem legs separado) ----
  full_plate_set: {
    name: 'Full Plate',
    fullPieceCount: 4,
    pieces: {
      armor: 'armor_full_plate_heavy_armor', helmet: 'armor_full_plate_heavy_helmet',
      boots: 'armor_full_plate_heavy_boots', gloves: 'armor_full_plate_heavy_gloves'
    },
    shieldPiece: 'armor_full_plate_shield',
    bonuses: {
      2: { def: 40, hp: 100 },
      3: { def: 60, hp: 150 },
      4: { def: 120, mdef: 80, hp: 300, primary: { con: 4, str: 3 } },
      5: { def: 35, hp: 100, primary: { con: 2 } }
    }
  },
  doom_set: {
    name: 'Doom',
    fullPieceCount: 4,
    pieces: {
      armor: 'armor_doom_light_armor', helmet: 'armor_doom_light_helmet',
      boots: 'armor_doom_light_boots', gloves: 'armor_doom_light_gloves'
    },
    shieldPiece: 'armor_doom_shield',
    bonuses: {
      2: { atk: 55, eva: 8 },
      3: { crit: 6, hp: 200 },
      4: { atk: 130, eva: 16, crit: 10, primary: { dex: 4, str: 3 } },
      5: { def: 40, block: 0.05, primary: { dex: 2 } }
    }
  },
  majestic_set: {
    name: 'Majestic',
    fullPieceCount: 4,
    variantPieces: {
      armor: ['armor_majestic_heavy_armor', 'armor_majestic_light_armor', 'armor_majestic_robe_armor'],
      helmet: ['armor_majestic_heavy_helmet', 'armor_majestic_light_helmet', 'armor_majestic_robe_helmet'],
      boots: ['armor_majestic_heavy_boots', 'armor_majestic_light_boots', 'armor_majestic_robe_boots'],
      gloves: ['armor_majestic_heavy_glove', 'armor_majestic_light_glove', 'armor_majestic_robe_glove']
    },
    bonuses: {
      2: { atk: 80, matk: 80 },
      3: { mdef: 90, mp: 250 },
      4: { atk: 180, matk: 180, mdef: 180, primary: { int: 5, str: 4 } }
    }
  },
  nightmare_set: {
    name: 'Nightmare',
    fullPieceCount: 4,
    variantPieces: {
      armor: ['armor_nightmare_heavy_armor', 'armor_nightmare_light_armor', 'armor_nightmare_robe_armor'],
      helmet: ['armor_nightmare_heavy_helmet', 'armor_nightmare_light_helmet', 'armor_nightmare_robe_helmet'],
      boots: ['armor_nightmare_heavy_boots', 'armor_nightmare_light_boots', 'armor_nightmare_robe_boots'],
      gloves: ['armor_nightmare_heavy_glove', 'armor_nightmare_light_glove', 'armor_nightmare_robe_glove']
    },
    shieldPiece: 'armor_nightmare_shield',
    bonuses: {
      2: { def: 90, mdef: 90 },
      3: { hp: 400, lifesteal: 3 },
      4: { def: 200, mdef: 200, hp: 700, primary: { con: 5, wit: 4 } },
      5: { def: 60, mdef: 50, primary: { con: 2 } }
    }
  },
  draconic_set: {
    name: 'Draconic',
    fullPieceCount: 4,
    pieces: {
      armor: 'armor_draconic_armor', helmet: 'armor_draconic_helmet',
      boots: 'armor_draconic_boots', gloves: 'armor_draconic_gloves'
    },
    bonuses: {
      2: { atk: 130, crit: 8 },
      3: { speed: 15, eva: 12 },
      4: { atk: 300, crit: 15, eva: 25, speed: 25, primary: { dex: 6, str: 5 } }
    }
  },
  major_arcana_set: {
    name: 'Major Arcana',
    fullPieceCount: 4,
    pieces: {
      armor: 'armor_major_arcana_robe', helmet: 'armor_major_arcana_robe_helmet',
      boots: 'armor_major_arcana_robe_boots', gloves: 'armor_major_arcana_robe_gloves'
    },
    bonuses: {
      2: { matk: 140, mdef: 120 },
      3: { mp: 500, speed: 12 },
      4: { matk: 320, mdef: 280, mp: 800, primary: { wit: 6, int: 5 } }
    }
  }
};

function getSetIdForItem(filename) {
  const id = toExactId(filename);
  const stripped = toStrippedId(filename);
  for (const [setId, setDef] of Object.entries(ARMOR_SETS)) {
    if (setDef.pieces) {
      for (const pId of Object.values(setDef.pieces)) {
        if (pId === id || pId === 'armor_' + stripped || pId === stripped) return setId;
      }
    }
    if (setDef.variantPieces) {
      for (const varList of Object.values(setDef.variantPieces)) {
        if (varList.includes(id) || varList.includes('armor_' + stripped) || varList.includes(stripped)) return setId;
      }
    }
    if (setDef.shieldPiece && (setDef.shieldPiece === id || setDef.shieldPiece === 'armor_' + stripped || setDef.shieldPiece === stripped)) {
      return setId;
    }
  }
  return null;
}

// Data structures
const WEAPONS = {};
const ARMORS = {};
const HELMETS = {};
const BOOTS = {};
const GLOVES = {};
const LEGS = {};
const SHIELDS = {};
const BELTS = {};
const CLOAKS = {};
const SIGILS = {};
const RINGS = {};
const EARRINGS = {};
const NECKLACES = {};
const HAIR = {};
const AGATHIONS = {};
const CONSUMABLES = {};
const MATERIALS = {};
const ICON_MAP = {};

// Keep track of primary IDs vs alias mappings
const ALIAS_MAP = {};

function registerItem(targetCategory, itemDef, iconPath, filename) {
  const exactId = toExactId(filename);
  const strippedId = toStrippedId(filename);
  const setId = getSetIdForItem(filename);
  if (setId) itemDef.set = setId;
  
  // Set primary item
  targetCategory[exactId] = itemDef;
  ICON_MAP[exactId] = iconPath;
  
  // Also register stripped alias if different
  if (strippedId && strippedId !== exactId && !targetCategory[strippedId]) {
    targetCategory[strippedId] = itemDef;
    ICON_MAP[strippedId] = iconPath;
    ALIAS_MAP[strippedId] = exactId;
  }
  
  // Also register prefixed alias if exactId didn't have prefix
  if (!exactId.startsWith('weapon_') && !exactId.startsWith('armor_') && !exactId.startsWith('jewel_')) {
    let pref = '';
    if (itemDef.slot === 'weapon') pref = 'weapon_' + exactId;
    else if (['armor','helmet','boots','gloves','legs','shield','belt','cloak','sigil'].includes(itemDef.slot)) pref = 'armor_' + exactId;
    else if (['ring','earring','necklace'].includes(itemDef.slot)) pref = 'jewel_' + exactId;
    
    if (pref && !targetCategory[pref]) {
      targetCategory[pref] = itemDef;
      ICON_MAP[pref] = iconPath;
      ALIAS_MAP[pref] = exactId;
    }
  }
}

// ── Process graded folders ──
for (const [gradeFolder, gradeInfo] of Object.entries(GRADE_MAP)) {
  const gradeDir = join(ICONS_DIR, gradeFolder);
  
  // Weapons
  const weaponsDir = join(gradeDir, 'weapons');
  for (const file of scanDir(weaponsDir)) {
    const exactId = toExactId(file);
    const stats = weaponStats(exactId, gradeInfo.tier, file);
    const iconPath = `${gradeFolder}/weapons/${file}`;
    const def = {
      id: exactId, name: toDisplayName(file), slot: 'weapon', tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    registerItem(WEAPONS, def, iconPath, file);
  }
  
  // Armors
  const armorsDir = join(gradeDir, 'armors');
  for (const file of scanDir(armorsDir)) {
    const slot = detectArmorSlot(file);
    const exactId = toExactId(file);
    const stats = armorStats(slot, gradeInfo.tier, file);
    const iconPath = `${gradeFolder}/armors/${file}`;
    
    const slotMap = { armor: ARMORS, helmet: HELMETS, boots: BOOTS, gloves: GLOVES, legs: LEGS, shield: SHIELDS, belt: BELTS, cloak: CLOAKS, sigil: SIGILS };
    const target = slotMap[slot] || ARMORS;
    
    const def = {
      id: exactId, name: toDisplayName(file), slot, tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    registerItem(target, def, iconPath, file);
  }
  
  // Jewels
  const jewelsDir = join(gradeDir, 'jewels');
  for (const file of scanDir(jewelsDir)) {
    const slot = detectJewelSlot(file);
    const exactId = toExactId(file);
    const stats = jewelStats(slot, gradeInfo.tier);
    const iconPath = `${gradeFolder}/jewels/${file}`;
    
    const target = slot === 'ring' ? RINGS : slot === 'earring' ? EARRINGS : NECKLACES;
    const def = {
      id: exactId, name: toDisplayName(file), slot, tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    registerItem(target, def, iconPath, file);
  }
}

// Accessories
for (const file of scanDir(join(ICONS_DIR, 'acessories'))) {
  const exactId = toExactId(file);
  const iconPath = `acessories/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'hair', tier: 1,
    def: 2, mdef: 5, matk: 0, hp: 0,
    req: { level: 1 }, price: 500,
    icon: iconPath, desc: `Acessório: ${toDisplayName(file)}.`
  };
  registerItem(HAIR, def, iconPath, file);
}

// Agathions
for (const file of scanDir(join(ICONS_DIR, 'agathions'))) {
  const exactId = toExactId(file);
  const iconPath = `agathions/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'agathion', tier: 1,
    def: 0, mdef: 0, matk: 0, hp: 50, atk: 5,
    req: { level: 1 }, price: 1000,
    icon: iconPath, desc: `Agathion: ${toDisplayName(file)}.`
  };
  registerItem(AGATHIONS, def, iconPath, file);
}

// Consumables
for (const file of scanDir(join(ICONS_DIR, 'consumables'))) {
  const exactId = toExactId(file);
  const iconPath = `consumables/${file}`;
  const fn = file.toLowerCase();
  let effect = 'Restaura HP.';
  let healAmt = 100;
  if (/mp_/.test(fn)) { effect = 'Restaura MP.'; healAmt = 80; }
  if (/attack/.test(fn)) { effect = 'Aumenta ATK temporariamente.'; healAmt = 0; }
  if (/defense/.test(fn)) { effect = 'Aumenta DEF temporariamente.'; healAmt = 0; }
  if (/speed/.test(fn)) { effect = 'Aumenta velocidade.'; healAmt = 0; }
  if (/berserker/.test(fn)) { effect = 'Aumenta ATK e CRIT massivamente.'; healAmt = 0; }
  if (/aegis/.test(fn)) { effect = 'Aumenta DEF e MDEF.'; healAmt = 0; }
  if (/soulshot/.test(fn)) { effect = 'Soulshot: Aumenta dano físico.'; healAmt = 0; }
  if (/spiritshot/.test(fn)) { effect = 'Spiritshot: Aumenta dano mágico.'; healAmt = 0; }
  if (/antidote/.test(fn)) { effect = 'Remove veneno.'; healAmt = 0; }
  if (/auto_potion/.test(fn)) { effect = 'Cura automática por 1h.'; healAmt = 0; }
  if (/xl/.test(fn)) healAmt = 500;
  else if (/_l\./.test(fn)) healAmt = 300;
  else if (/_m\./.test(fn)) healAmt = 150;
  
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'consumable', tier: 1,
    healAmt, stack: 99,
    price: 50, icon: iconPath, desc: effect
  };
  registerItem(CONSUMABLES, def, iconPath, file);
}

// Scrolls
for (const file of scanDir(join(ICONS_DIR, 'scrolls'))) {
  const exactId = toExactId(file);
  const iconPath = `scrolls/${file}`;
  const fn = file.toLowerCase();
  let effect = 'Pergaminho mágico.';
  if (/enchant_weapon/.test(fn)) effect = 'Encanta uma arma (+1 enchant).';
  if (/enchant_armor/.test(fn)) effect = 'Encanta uma armadura (+1 enchant).';
  if (/xp_boost/.test(fn)) effect = 'Aumenta XP ganho temporariamente.';
  if (/gold_boost/.test(fn)) effect = 'Aumenta Gold ganho temporariamente.';
  if (/luck_boost/.test(fn)) effect = 'Aumenta sorte temporariamente.';
  if (/teleport/.test(fn)) effect = 'Teleporta para uma cidade.';
  if (/exp_scroll/.test(fn)) effect = 'Fornece XP direto ao usar.';
  if (/sages_tea/.test(fn)) effect = 'Restaura MP ao longo do tempo.';
  
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'consumable', tier: 1,
    healAmt: 0, stack: 99,
    price: 200, icon: iconPath, desc: effect
  };
  registerItem(CONSUMABLES, def, iconPath, file);
}

// Materials
for (const file of scanDir(join(ICONS_DIR, 'materials'))) {
  const exactId = toExactId(file);
  const iconPath = `materials/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 10, icon: iconPath, desc: `Material: ${toDisplayName(file)}.`
  };
  registerItem(MATERIALS, def, iconPath, file);
}

// Coins
for (const file of scanDir(join(ICONS_DIR, 'coins'))) {
  const exactId = toExactId(file);
  const iconPath = `coins/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 0, icon: iconPath, desc: `Moeda: ${toDisplayName(file)}.`
  };
  registerItem(MATERIALS, def, iconPath, file);
}

// Spellbooks
for (const file of scanDir(join(ICONS_DIR, 'spellbooks'))) {
  const exactId = toExactId(file);
  const iconPath = `spellbooks/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 500, icon: iconPath, desc: `Spellbook: ${toDisplayName(file)}.`
  };
  registerItem(MATERIALS, def, iconPath, file);
}

// Talismans
for (const file of scanDir(join(ICONS_DIR, 'talismans'))) {
  const exactId = toExactId(file);
  const iconPath = `talismans/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 1000, icon: iconPath, desc: `Talismã: ${toDisplayName(file)}.`
  };
  registerItem(MATERIALS, def, iconPath, file);
}

// Pendants
for (const file of scanDir(join(ICONS_DIR, 'pendants'))) {
  const exactId = toExactId(file);
  const iconPath = `pendants/${file}`;
  const def = {
    id: exactId, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 800, icon: iconPath, desc: `Pingente: ${toDisplayName(file)}.`
  };
  registerItem(MATERIALS, def, iconPath, file);
}

// Combine all items
const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...LEGS,
  ...SHIELDS, ...BELTS, ...CLOAKS, ...SIGILS, ...RINGS, ...EARRINGS,
  ...NECKLACES, ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS
};

// Helper for monster drops
function pickByTier(obj, tier, count = 5) {
  return Object.keys(obj).filter(k => obj[k].tier === tier).slice(0, count);
}

const MONSTER_DROPS = {
  zone1: [...pickByTier(WEAPONS, 1, 3), ...pickByTier(ARMORS, 1, 2), 'hp_potion_s'],
  zone2: [...pickByTier(WEAPONS, 2, 3), ...pickByTier(ARMORS, 2, 2), 'hp_potion_m'],
  zone3: [...pickByTier(WEAPONS, 3, 3), ...pickByTier(ARMORS, 3, 2), 'hp_potion_l'],
  zone4: [...pickByTier(WEAPONS, 4, 3), ...pickByTier(ARMORS, 4, 2), 'mp_potion_s'],
  zone5: [...pickByTier(WEAPONS, 4.5, 3), ...pickByTier(ARMORS, 4.5, 2), 'mp_potion_l'],
  zone6: [...pickByTier(WEAPONS, 5, 3), ...pickByTier(ARMORS, 5, 2), 'hp_potion_xl'],
};

const CRAFTING_RECIPES = [
  { id: 'weapon_composition_bow', reqs: [{ id: 'iron_ore', count: 10 }, { id: 'suede', count: 5 }], gold: 500 },
  { id: 'armor_full_plate_heavy_armor', reqs: [{ id: 'iron_ore', count: 50 }, { id: 'crafted_leather', count: 20 }], gold: 5000 },
  { id: 'armor_draconic_armor', reqs: [{ id: 'oriharukon_ore', count: 100 }, { id: 'adamantite', count: 50 }], gold: 50000 }
];

const SHOP_INVENTORY = [
  'hp_potion_s', 'hp_potion_m', 'hp_potion_l', 'hp_potion_xl',
  'mp_potion_s', 'mp_potion_m', 'mp_potion_l', 'mp_potion_xl',
  'soulshot_ng', 'spiritshot_ng'
];

const tier5weapons = Object.keys(WEAPONS).filter(k => WEAPONS[k].tier === 5).slice(0, 4);
const tier5jewels = Object.keys(RINGS).concat(Object.keys(EARRINGS)).filter(k => (RINGS[k] || EARRINGS[k])?.tier === 5).slice(0, 2);
const MYSTIC_POOL = [...tier5weapons, ...tier5jewels];

// ── Generate JS output ──
function serializeObj(obj) {
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  const lines = entries.map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  return '{\n' + lines.join(',\n') + '\n}';
}

let js = `// items.js - System Data & Complete Item Catalog (Generated 100% from public/img/icons/ subfolders)
// Generated: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Run scratch/rebuild-from-folders.mjs to regenerate

const RARITY = {
  common: { name: 'Comum', mult: 1.0, color: '#9e9e9e', textClass: 'rarity-common', dropWeight: 70 },
  uncommon: { name: 'Incomum', mult: 1.4, color: '#10b981', textClass: 'rarity-uncommon', dropWeight: 20 },
  rare: { name: 'Raro', mult: 1.8, color: '#3b82f6', textClass: 'rarity-rare', dropWeight: 7 },
  epic: { name: 'Épico', mult: 2.4, color: '#a855f7', textClass: 'rarity-epic', dropWeight: 2.5 },
  legendary: { name: 'Lendário', mult: 3.2, color: '#f59e0b', textClass: 'rarity-legendary', dropWeight: 0.5 }
};

const SLOT = {
  weapon: 'Arma', armor: 'Armadura', helmet: 'Capacete', boots: 'Botas',
  gloves: 'Luvas', ring: 'Anel', legs: 'Calça', shield: 'Escudo',
  necklace: 'Colar', earring: 'Brinco', belt: 'Cinto', cloak: 'Manto',
  sigil: 'Sigil', hair: 'Acessório', agathion: 'Agathion', consumable: 'Consumível', material: 'Material'
};

const ARMOR_SETS = ${serializeObj(ARMOR_SETS)};

`;

const categories = [
  ['WEAPONS', WEAPONS], ['ARMORS', ARMORS], ['HELMETS', HELMETS],
  ['BOOTS', BOOTS], ['GLOVES', GLOVES], ['LEGS', LEGS],
  ['SHIELDS', SHIELDS], ['BELTS', BELTS], ['CLOAKS', CLOAKS], ['SIGILS', SIGILS],
  ['RINGS', RINGS], ['EARRINGS', EARRINGS], ['NECKLACES', NECKLACES],
  ['HAIR', HAIR], ['AGATHIONS', AGATHIONS],
  ['CONSUMABLES', CONSUMABLES], ['MATERIALS', MATERIALS],
];

for (const [name, data] of categories) {
  js += `const ${name} = ${serializeObj(data)};\n\n`;
}

js += `const ALL_ITEMS = ${serializeObj(ALL_ITEMS)};\n\n`;
js += `const ICON_MAP = ${serializeObj(ICON_MAP)};\n\n`;
js += `const MONSTER_DROPS = ${JSON.stringify(MONSTER_DROPS, null, 2)};\n\n`;
js += `const CRAFTING_RECIPES = ${JSON.stringify(CRAFTING_RECIPES, null, 2)};\n\n`;
js += `const SHOP_INVENTORY = ${JSON.stringify(SHOP_INVENTORY, null, 2)};\n\n`;
js += `const ZONE_GOLD_MULT = { zone1: 1.0, zone2: 1.5, zone3: 2.2, zone4: 3.5, zone5: 5.5, zone6: 9.0 };\n`;
js += `const MYSTIC_POOL = ${JSON.stringify(MYSTIC_POOL)};\n\n`;

js += `function rollRarity(bonus = 0) {
  const rand = Math.random() * 100 - bonus;
  if (rand <= RARITY.legendary.dropWeight) return 'legendary';
  if (rand <= RARITY.legendary.dropWeight + RARITY.epic.dropWeight) return 'epic';
  if (rand <= RARITY.legendary.dropWeight + RARITY.epic.dropWeight + RARITY.rare.dropWeight) return 'rare';
  if (rand <= RARITY.legendary.dropWeight + RARITY.epic.dropWeight + RARITY.rare.dropWeight + RARITY.uncommon.dropWeight) return 'uncommon';
  return 'common';
}

function rollDrop(zoneId = 'zone1', rarityBonus = 0) {
  const pool = MONSTER_DROPS[zoneId] || MONSTER_DROPS.zone1;
  const itemId = pool[Math.floor(Math.random() * pool.length)];
  const rarity = rollRarity(rarityBonus);
  return { itemId, rarity };
}

function getMysticRotation() {
  return MYSTIC_POOL;
}

function rollItemWithRarity(itemId, bonus = 0) {
  const rarity = rollRarity(bonus);
  return { itemId, rarity };
}

if (typeof window !== 'undefined') {
  window.GameData = {
    ...(window.GameData || {}),
    ARMOR_SETS, ICON_MAP, RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
    CONSUMABLES, MATERIALS, ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL, rollRarity, rollDrop, getMysticRotation, rollItemWithRarity
  };
}
`;

writeFileSync(ITEMS_OUT, js, 'utf8');
writeFileSync(INDEX_OUT, JSON.stringify(ICON_MAP, null, 2), 'utf8');

console.log('\n=== REBUILD COMPLETE ===');
console.log(`ALL_ITEMS total keys: ${Object.keys(ALL_ITEMS).length}`);
console.log(`ARMOR_SETS defined:   ${Object.keys(ARMOR_SETS).length}`);
