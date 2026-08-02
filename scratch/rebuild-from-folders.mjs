/**
 * rebuild-from-folders.mjs
 * 
 * Scans public/img/icons/ subfolders and generates:
 *   1. lineage-idle/data/items.js  -- full item database + ICON_MAP
 *   2. public/img/icons/icon_index.json -- canonical path map
 *
 * Folder -> Category/Slot mapping:
 *   nograde/weapons      -> WEAPONS, tier 1, No Grade
 *   graded/weapons       -> WEAPONS, tier 2, D Grade
 *   gradec/weapons       -> WEAPONS, tier 3, C Grade
 *   gradeb/weapons       -> WEAPONS, tier 4, B Grade
 *   gradea/weapons       -> WEAPONS, tier 4.5, A Grade
 *   gradespecial/weapons -> WEAPONS, tier 5, S Grade
 *
 *   [grade]/armors       -> slot derived from filename pattern
 *   [grade]/jewels       -> slot derived from filename (ring/earring/necklace)
 *
 *   consumables          -> CONSUMABLES
 *   materials            -> MATERIALS
 *   coins                -> MATERIALS (currency sub-type)
 *   scrolls              -> CONSUMABLES (scroll sub-type)
 *   spellbooks           -> MATERIALS
 *   agathions            -> AGATHIONS
 *   talismans            -> MATERIALS (talisman sub-type)
 *   pendants             -> MATERIALS (pendant sub-type)
 *   acessories           -> HAIR (hair accessories slot)
 */


import { readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, relative, basename } from 'path';

const ROOT = join(import.meta.dirname, '..');
const ICONS_DIR = join(ROOT, 'public', 'img', 'icons');
const ITEMS_OUT = join(ROOT, 'lineage-idle', 'data', 'items.js');
const INDEX_OUT = join(ICONS_DIR, 'icon_index.json');

// ── Grade/Tier config ──
const GRADE_MAP = {
  'nograde': { tier: 1,   grade: 'No Grade', level: 1 },
  'graded':  { tier: 2,   grade: 'D Grade',  level: 20 },
  'gradec':  { tier: 3,   grade: 'C Grade',  level: 40 },
  'gradeb':  { tier: 4,   grade: 'B Grade',  level: 52 },
  'gradea':  { tier: 4.5, grade: 'A Grade',  level: 61 },
  'gradespecial': { tier: 5, grade: 'S Grade', level: 76 },
};

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
  // sword/axe/spear/hammer/dual/etc
  return { atk: baseAtk, matk: 0, crit: 5, eva: 0 };
}

function armorStats(slot, tier, filename) {
  const fn = filename.toLowerCase();
  const isRobe = /robe/.test(fn);
  const isLight = /light/.test(fn);
  // heavy is default
  
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
  // fallback
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

// ── Filename → human-readable name ──
function toDisplayName(filename) {
  let name = filename.replace(/\.png$/i, '');
  // Strip common prefixes
  name = name.replace(/^(armor_|weapon_|jewel_|shield_|wepoan_)/, '');
  // Remove imgi_XX_ prefixes for accessories
  name = name.replace(/^imgi_\d+_/, '');
  // Replace underscores with spaces and capitalize
  return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Filename → item ID (unique key) ──
function toItemId(filename) {
  let id = filename.replace(/\.png$/i, '');
  // Strip common prefixes that are redundant
  id = id.replace(/^(armor_|weapon_|jewel_|shield_|wepoan_)/, '');
  // Remove double .png artifacts
  id = id.replace(/\.png$/, '');
  return id.toLowerCase();
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
  if (/armor|breastplate|vest|tunic|robe(?!_boot|_glove|_helmet|_pants)/.test(fn)) {
    // Only match "robe" if it's specifically an armor piece, not boots/gloves/etc
    if (/robe/.test(fn) && /(boot|glove|helmet|pants|gaiter)/.test(fn)) {
      // Already handled above
    }
    return 'armor';
  }
  // Fallback: if "robe" appears with another slot keyword, that keyword wins
  return 'armor';
}

// ── Detect jewel slot ──
function detectJewelSlot(filename) {
  const fn = filename.toLowerCase();
  if (/ear/.test(fn)) return 'earring';      // must check before "ring" since "earring" contains "ring"
  if (/necklace/.test(fn)) return 'necklace';
  if (/ring/.test(fn)) return 'ring';
  return 'ring'; // fallback
}

// ── Scan directory for PNG files ──
function scanDir(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.png') && !f.endsWith('.png.png'))
    .sort();
}

// ── Main build ──
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

const usedIds = new Set();
function uniqueId(baseId) {
  let id = baseId;
  let n = 2;
  while (usedIds.has(id)) { id = `${baseId}_${n}`; n++; }
  usedIds.add(id);
  return id;
}

// ── Process graded folders (nograde, graded, gradec, gradeb, gradea, gradespecial) ──
for (const [gradeFolder, gradeInfo] of Object.entries(GRADE_MAP)) {
  const gradeDir = join(ICONS_DIR, gradeFolder);
  
  // Weapons
  const weaponsDir = join(gradeDir, 'weapons');
  for (const file of scanDir(weaponsDir)) {
    const id = uniqueId(toItemId(file));
    const stats = weaponStats(id, gradeInfo.tier, file);
    const iconPath = `${gradeFolder}/weapons/${file}`;
    WEAPONS[id] = {
      id, name: toDisplayName(file), slot: 'weapon', tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    ICON_MAP[id] = iconPath;
  }
  
  // Armors
  const armorsDir = join(gradeDir, 'armors');
  for (const file of scanDir(armorsDir)) {
    const slot = detectArmorSlot(file);
    const id = uniqueId(toItemId(file));
    const stats = armorStats(slot, gradeInfo.tier, file);
    const iconPath = `${gradeFolder}/armors/${file}`;
    
    const slotMap = { armor: ARMORS, helmet: HELMETS, boots: BOOTS, gloves: GLOVES, legs: LEGS, shield: SHIELDS, belt: BELTS, cloak: CLOAKS, sigil: SIGILS };
    const target = slotMap[slot] || ARMORS;
    
    target[id] = {
      id, name: toDisplayName(file), slot, tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    ICON_MAP[id] = iconPath;
  }
  
  // Jewels
  const jewelsDir = join(gradeDir, 'jewels');
  for (const file of scanDir(jewelsDir)) {
    const slot = detectJewelSlot(file);
    const id = uniqueId(toItemId(file));
    const stats = jewelStats(slot, gradeInfo.tier);
    const iconPath = `${gradeFolder}/jewels/${file}`;
    
    const target = slot === 'ring' ? RINGS : slot === 'earring' ? EARRINGS : NECKLACES;
    target[id] = {
      id, name: toDisplayName(file), slot, tier: gradeInfo.tier,
      ...stats,
      req: { level: gradeInfo.level }, price: price(gradeInfo.tier),
      icon: iconPath, desc: `${toDisplayName(file)} (${gradeInfo.grade}).`
    };
    ICON_MAP[id] = iconPath;
  }
}

// ── Process accessories (hair slot) ──
for (const file of scanDir(join(ICONS_DIR, 'acessories'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `acessories/${file}`;
  HAIR[id] = {
    id, name: toDisplayName(file), slot: 'hair', tier: 1,
    def: 2, mdef: 5, matk: 0, hp: 0,
    req: { level: 1 }, price: 500,
    icon: iconPath, desc: `Acessório: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process agathions ──
for (const file of scanDir(join(ICONS_DIR, 'agathions'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `agathions/${file}`;
  AGATHIONS[id] = {
    id, name: toDisplayName(file), slot: 'agathion', tier: 1,
    def: 0, mdef: 0, matk: 0, hp: 50, atk: 5,
    req: { level: 1 }, price: 1000,
    icon: iconPath, desc: `Agathion: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process consumables ──
for (const file of scanDir(join(ICONS_DIR, 'consumables'))) {
  const id = uniqueId(toItemId(file));
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
  
  CONSUMABLES[id] = {
    id, name: toDisplayName(file), slot: 'consumable', tier: 1,
    healAmt, stack: 99,
    price: 50, icon: iconPath, desc: effect
  };
  ICON_MAP[id] = iconPath;
}

// ── Process scrolls (as consumables) ──
for (const file of scanDir(join(ICONS_DIR, 'scrolls'))) {
  const id = uniqueId(toItemId(file));
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
  
  CONSUMABLES[id] = {
    id, name: toDisplayName(file), slot: 'consumable', tier: 1,
    healAmt: 0, stack: 99,
    price: 200, icon: iconPath, desc: effect
  };
  ICON_MAP[id] = iconPath;
}

// ── Process materials ──
for (const file of scanDir(join(ICONS_DIR, 'materials'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `materials/${file}`;
  MATERIALS[id] = {
    id, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 10, icon: iconPath, desc: `Material: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process coins (as materials) ──
for (const file of scanDir(join(ICONS_DIR, 'coins'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `coins/${file}`;
  MATERIALS[id] = {
    id, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 0, icon: iconPath, desc: `Moeda: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process spellbooks (as materials) ──
for (const file of scanDir(join(ICONS_DIR, 'spellbooks'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `spellbooks/${file}`;
  MATERIALS[id] = {
    id, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 500, icon: iconPath, desc: `Spellbook: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process talismans (as materials) ──
for (const file of scanDir(join(ICONS_DIR, 'talismans'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `talismans/${file}`;
  MATERIALS[id] = {
    id, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 1000, icon: iconPath, desc: `Talismã: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ── Process pendants (as materials) ──
for (const file of scanDir(join(ICONS_DIR, 'pendants'))) {
  const id = uniqueId(toItemId(file));
  const iconPath = `pendants/${file}`;
  MATERIALS[id] = {
    id, name: toDisplayName(file), slot: 'material', tier: 1,
    stack: 99,
    price: 800, icon: iconPath, desc: `Pingente: ${toDisplayName(file)}.`
  };
  ICON_MAP[id] = iconPath;
}

// ══════════════════════════════════════════════════════════════
// ── Generate ALL_ITEMS ──
const ALL_ITEMS = { ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...LEGS, ...SHIELDS, ...BELTS, ...CLOAKS, ...SIGILS, ...RINGS, ...EARRINGS, ...NECKLACES, ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS };

// ── Generate MONSTER_DROPS (pick representative items per zone) ──
function pickByTier(obj, tier, count = 5) {
  return Object.values(obj).filter(i => i.tier === tier).slice(0, count).map(i => i.id);
}
const MONSTER_DROPS = {
  zone1: [...pickByTier(WEAPONS, 1, 3), ...pickByTier(ARMORS, 1, 2), ...Object.values(CONSUMABLES).slice(0, 1).map(i => i.id)],
  zone2: [...pickByTier(WEAPONS, 2, 3), ...pickByTier(ARMORS, 2, 2), ...Object.values(CONSUMABLES).slice(1, 2).map(i => i.id)],
  zone3: [...pickByTier(WEAPONS, 3, 3), ...pickByTier(ARMORS, 3, 2), ...Object.values(CONSUMABLES).slice(2, 3).map(i => i.id)],
  zone4: [...pickByTier(WEAPONS, 4, 3), ...pickByTier(ARMORS, 4, 2), ...Object.values(CONSUMABLES).slice(3, 4).map(i => i.id)],
  zone5: [...pickByTier(WEAPONS, 4.5, 3), ...pickByTier(ARMORS, 4.5, 2), ...Object.values(CONSUMABLES).slice(4, 5).map(i => i.id)],
  zone6: [...pickByTier(WEAPONS, 5, 3), ...pickByTier(ARMORS, 5, 2), ...Object.values(CONSUMABLES).slice(5, 6).map(i => i.id)],
};

// ── CRAFTING_RECIPES ──
const materialIds = Object.keys(MATERIALS).filter(id => MATERIALS[id].slot === 'material');
const CRAFTING_RECIPES = [];
// Simple recipes using first few materials
const matSample = materialIds.slice(0, 6);
if (matSample.length >= 2) {
  const wep2 = Object.keys(WEAPONS).find(k => WEAPONS[k].tier === 2);
  const wep3 = Object.keys(WEAPONS).find(k => WEAPONS[k].tier === 3);
  const wep5 = Object.keys(WEAPONS).find(k => WEAPONS[k].tier === 5);
  if (wep2) CRAFTING_RECIPES.push({ id: wep2, reqs: [{ id: matSample[0], count: 10 }, { id: matSample[1], count: 5 }], gold: 500 });
  if (wep3) CRAFTING_RECIPES.push({ id: wep3, reqs: [{ id: matSample[2] || matSample[0], count: 50 }, { id: matSample[3] || matSample[1], count: 20 }], gold: 5000 });
  if (wep5) CRAFTING_RECIPES.push({ id: wep5, reqs: [{ id: matSample[4] || matSample[0], count: 100 }, { id: matSample[5] || matSample[1], count: 50 }], gold: 50000 });
}

// ── SHOP_INVENTORY ──
const SHOP_INVENTORY = [
  ...Object.values(CONSUMABLES).slice(0, 6).map(i => i.id),
  ...Object.values(WEAPONS).filter(w => w.tier === 1).slice(0, 3).map(i => i.id),
  ...Object.values(ARMORS).filter(a => a.tier === 1).slice(0, 1).map(i => i.id),
];

// ── MYSTIC_POOL ──
const tier5weapons = Object.values(WEAPONS).filter(w => w.tier === 5).slice(0, 4).map(i => i.id);
const tier5jewels = [...Object.values(RINGS).filter(r => r.tier === 5).slice(0, 1).map(i => i.id), ...Object.values(EARRINGS).filter(e => e.tier === 5).slice(0, 1).map(i => i.id)];
const MYSTIC_POOL = [...tier5weapons, ...tier5jewels];

// ══════════════════════════════════════════════════════════════
// ── Write items.js ──
function serializeObj(obj, indent = 2) {
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

`;

// Write each category
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

js += `const ALL_ITEMS = { ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...LEGS, ...SHIELDS, ...BELTS, ...CLOAKS, ...SIGILS, ...RINGS, ...EARRINGS, ...NECKLACES, ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS };\n\n`;

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
    ICON_MAP, RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    LEGS, SHIELDS, BELTS, CLOAKS, SIGILS, NECKLACES, EARRINGS, HAIR, AGATHIONS,
    CONSUMABLES, MATERIALS, ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL, rollRarity, rollDrop, getMysticRotation, rollItemWithRarity
  };
}
`;

writeFileSync(ITEMS_OUT, js, 'utf8');

// ── Write icon_index.json ──
writeFileSync(INDEX_OUT, JSON.stringify(ICON_MAP, null, 2), 'utf8');

// ── Summary ──
console.log('\n=== REBUILD COMPLETE ===');
console.log(`Weapons:     ${Object.keys(WEAPONS).length}`);
console.log(`Armors:      ${Object.keys(ARMORS).length}`);
console.log(`Helmets:     ${Object.keys(HELMETS).length}`);
console.log(`Boots:       ${Object.keys(BOOTS).length}`);
console.log(`Gloves:      ${Object.keys(GLOVES).length}`);
console.log(`Legs:        ${Object.keys(LEGS).length}`);
console.log(`Shields:     ${Object.keys(SHIELDS).length}`);
console.log(`Belts:       ${Object.keys(BELTS).length}`);
console.log(`Cloaks:      ${Object.keys(CLOAKS).length}`);
console.log(`Sigils:      ${Object.keys(SIGILS).length}`);
console.log(`Rings:       ${Object.keys(RINGS).length}`);
console.log(`Earrings:    ${Object.keys(EARRINGS).length}`);
console.log(`Necklaces:   ${Object.keys(NECKLACES).length}`);
console.log(`Hair/Access: ${Object.keys(HAIR).length}`);
console.log(`Agathions:   ${Object.keys(AGATHIONS).length}`);
console.log(`Consumables: ${Object.keys(CONSUMABLES).length}`);
console.log(`Materials:   ${Object.keys(MATERIALS).length}`);
console.log(`─────────────────────`);
console.log(`TOTAL:       ${Object.keys(ALL_ITEMS).length}`);
console.log(`ICON_MAP:    ${Object.keys(ICON_MAP).length} entries`);
console.log(`\nWritten: ${ITEMS_OUT}`);
console.log(`Written: ${INDEX_OUT}`);
