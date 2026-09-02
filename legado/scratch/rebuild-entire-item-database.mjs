import fs from 'fs';
import path from 'path';

const iconsDir = path.join(process.cwd(), 'public/img/icons');
const itemsJsPath = path.join(process.cwd(), 'lineage-idle/data/items.js');
const iconIndexPath = path.join(iconsDir, 'icon_index.json');

// 1. Scan all PNG files in public/img/icons
const pngFiles = fs.readdirSync(iconsDir).filter(f => f.toLowerCase().endsWith('.png')).sort((a, b) => a.localeCompare(b));

console.log(`Scanned ${pngFiles.length} PNG files in public/img/icons/`);

// 2. Build icon_index.json
const iconIndex = {};
for (const file of pngFiles) {
  const key = file.replace(/\.png$/i, '');
  iconIndex[key] = file;
}
fs.writeFileSync(iconIndexPath, JSON.stringify(iconIndex, null, 2), 'utf8');

function formatName(id) {
  let name = id
    .replace(/^imgi_\d+_/i, '')
    .replace(/^accessory_/i, '')
    .replace(/^etc_/i, '')
    .replace(/^bm_/i, '')
    .replace(/^g_/i, '')
    .replace(/_i\d+$/i, '')
    .replace(/_0$/i, '')
    .replace(/_/g, ' ');

  name = name.replace(/\b\w/g, l => l.toUpperCase());
  return name.trim();
}

function determineGradeAndLevel(id) {
  const i = id.toLowerCase();
  if (i.includes('dynast') || i.includes('vesper') || i.includes('elegia') || i.includes('draconic') || i.includes('imperial') || i.includes('arcana') || i.includes('orfen') || i.includes('core') || i.includes('queen_ant') || i.includes('baium') || i.includes('zaken') || i.includes('antharas') || i.includes('valakas') || i.includes('angel_slayer') || i.includes('dragon_slayer') || i.includes('arcana_mace') || i.includes('beleth') || i.includes('anakim') || i.includes('anais')) {
    return { grade: 'S Grade', level: 76, tier: 5, mult: 3.2 };
  }
  if (i.includes('dark_crystal') || i.includes('tallum') || i.includes('nightmare') || i.includes('majestic') || i.includes('sirra') || i.includes('sovh') || i.includes('silence') || i.includes('divine_sword') || i.includes('eternity')) {
    return { grade: 'A Grade', level: 61, tier: 4.5, mult: 2.4 };
  }
  if (i.includes('avadon') || i.includes('blue_wolf') || i.includes('doom') || i.includes('zwei') || i.includes('kris') || i.includes('dragon_bow') || i.includes('soul_seeker') || i.includes('staff_of_magic') || i.includes('titan_hammer')) {
    return { grade: 'B Grade', level: 52, tier: 4, mult: 1.8 };
  }
  if (i.includes('karmian') || i.includes('demon') || i.includes('plated') || i.includes('full_plate') || i.includes('samurai') || i.includes('akamanah') || i.includes('archmage') || i.includes('assassins') || i.includes('dark_katana') || i.includes('elven_bow') || i.includes('knight_sword') || i.includes('warhammer')) {
    return { grade: 'C Grade', level: 40, tier: 3, mult: 1.4 };
  }
  if (i.includes('mithril') || i.includes('brigandine') || i.includes('manticore') || i.includes('bastard') || i.includes('elven') || i.includes('composite') || i.includes('crystal_staff') || i.includes('iron_sword') || i.includes('orcish_axe') || i.includes('steel_dagger') || i.includes('war_mace')) {
    return { grade: 'D Grade', level: 20, tier: 2, mult: 1.2 };
  }
  return { grade: 'No Grade', level: 1, tier: 1, mult: 1.0 };
}

function classifyItem(id) {
  const i = id.toLowerCase();
  const name = formatName(id);
  const gl = determineGradeAndLevel(id);
  const lvl = gl.level;

  // Explicit Materials & Consumables Check FIRST
  const knownMaterials = ['leather', 'crafted_leather', 'suede', 'ironore', 'coal', 'charcoal', 'adamantite', 'oriharukon_ore', 'silver_nugget', 'silver_thread', 'cotton_thread', 'braided_hemp', 'gold_branch', 'metallic_fiber', 'compressed_coal', 'compressed_stone', 'compressed_wood', 'bone', 'bone_powder', 'dark_seed', 'blood_gem', 'orange_gemstone', 'white_gemstone', 'bluem_gemstone', 'fire_reagent', 'water_reagent', 'liquid_gold', 'powder_white', 'material_pouch', 'yellow_pouch', 'etc_recipe', 'recipe'];
  if (knownMaterials.includes(i) || i.endsWith('_ore') || i.includes('material') || i.includes('reagent')) {
    return {
      category: 'MATERIALS',
      def: { id, name, slot: 'material', stack: 999, price: Math.floor(lvl * 15 + 20), icon: id, desc: `Material de craft (${name}).` }
    };
  }

  // Cloaks FIRST before cap/helmet check (capared, capawhite, cloak, cloack, capa)
  if (i.includes('cloak') || i.includes('cloack') || i.includes('capa') || i.startsWith('capa')) {
    return {
      category: 'CLOAKS',
      def: { id, name, slot: 'cloak', tier: gl.tier, def: Math.floor(lvl * 0.4 + 5), mdef: Math.floor(lvl * 0.6 + 8), eva: 5, req: { level: lvl }, price: Math.floor(lvl * 120 + 350), icon: id, desc: `Manto / Capa ${name} (${gl.grade}).` }
    };
  }

  // Agathions
  if (i.includes('agathion')) {
    return {
      category: 'AGATHIONS',
      def: { id, name, slot: 'agathion', tier: 5, price: 50000, icon: id, desc: `Companheiro Místico ${name}.` }
    };
  }

  // Weapons
  if (i.includes('sword') || i.includes('bow') || i.includes('dagger') || i.includes('staff') || i.includes('mace') || i.includes('cutter') || i.includes('blade') || i.includes('hammer') || i.includes('dual') || i.includes('spear') || i.includes('pole') || i.includes('axe') || i.includes('rapier') || i.includes('blunt') || i.includes('first') || i.includes('pistol') || i.includes('reaver')) {
    const isMage = i.includes('staff') || i.includes('mace') || i.includes('wand');
    const isBow = i.includes('bow');
    const isDagger = i.includes('dagger') || i.includes('rapier');
    const atk = isMage ? Math.floor(lvl * 0.3 + 10) : Math.floor(lvl * 1.8 + 25);
    const matk = isMage ? Math.floor(lvl * 2.2 + 30) : 0;
    const crit = isBow || isDagger ? 12 : 5;
    const eva = isDagger ? 8 : 0;
    return {
      category: 'WEAPONS',
      def: { id, name, slot: 'weapon', tier: gl.tier, atk, matk, crit, eva, req: { level: lvl }, price: Math.floor(lvl * 250 + 500), icon: id, desc: `${name} (${gl.grade}).` }
    };
  }

  // Shields
  if (i.includes('shield') || i.includes('shiedl')) {
    return {
      category: 'SHIELDS',
      def: { id, name, slot: 'shield', tier: gl.tier, def: Math.floor(lvl * 0.8 + 15), mdef: Math.floor(lvl * 0.4 + 10), hp: Math.floor(lvl * 2 + 20), req: { level: lvl }, price: Math.floor(lvl * 120 + 300), icon: id, desc: `Escudo ${name} (${gl.grade}).` }
    };
  }

  // Earrings
  if (i.includes('earring') || i.includes('earing')) {
    return {
      category: 'EARRINGS',
      def: { id, name, slot: 'earring', tier: gl.tier, mdef: Math.floor(lvl * 0.7 + 12), eva: 3, hp: Math.floor(lvl * 1.2 + 20), req: { level: lvl }, price: Math.floor(lvl * 150 + 400), icon: id, desc: `Brinco místico ${name} (${gl.grade}).` }
    };
  }

  // Rings
  if (i.includes('ring')) {
    return {
      category: 'RINGS',
      def: { id, name, slot: 'ring', tier: gl.tier, mdef: Math.floor(lvl * 0.6 + 10), crit: 4, matk: Math.floor(lvl * 0.3 + 5), req: { level: lvl }, price: Math.floor(lvl * 150 + 400), icon: id, desc: `Anel místico ${name} (${gl.grade}).` }
    };
  }

  // Necklaces
  if (i.includes('necklace') || i.includes('pendant')) {
    return {
      category: 'NECKLACES',
      def: { id, name, slot: 'necklace', tier: gl.tier, mdef: Math.floor(lvl * 1.0 + 15), mp: Math.floor(lvl * 2 + 30), matk: Math.floor(lvl * 0.5 + 8), req: { level: lvl }, price: Math.floor(lvl * 200 + 500), icon: id, desc: `Colar místico ${name} (${gl.grade}).` }
    };
  }

  // Helmets / Hair
  if (i.includes('helmet') || i.includes('helm') || i.includes('cap') || i.includes('hood') || i.includes('circlet') || i.includes('hat') || i.includes('goggle') || i.includes('mask') || i.includes('crown') || i.includes('ears') || i.includes('chaperon') || i.includes('feeler') || i.includes('cornu')) {
    const isHair = i.includes('hat') || i.includes('goggle') || i.includes('mask') || i.includes('crown') || i.includes('ears') || i.includes('circlet') || i.includes('chaperon') || i.includes('feeler') || i.includes('cornu');
    const category = isHair ? 'HAIR' : 'HELMETS';
    const slot = isHair ? 'hair' : 'helmet';
    return {
      category,
      def: { id, name, slot, tier: gl.tier, def: Math.floor(lvl * 0.5 + 8), mdef: Math.floor(lvl * 0.4 + 6), eva: isHair ? 5 : 0, req: { level: lvl }, price: Math.floor(lvl * 100 + 200), icon: id, desc: `${name} (${gl.grade}).` }
    };
  }

  // Boots
  if (i.includes('boots') || i.includes('shoes') || i.includes('sandals')) {
    return {
      category: 'BOOTS',
      def: { id, name, slot: 'boots', tier: gl.tier, def: Math.floor(lvl * 0.4 + 6), mdef: Math.floor(lvl * 0.3 + 5), speed: 3, req: { level: lvl }, price: Math.floor(lvl * 80 + 150), icon: id, desc: `Botas ${name} (${gl.grade}).` }
    };
  }

  // Gloves
  if (i.includes('gloves') || i.includes('gauntlets')) {
    return {
      category: 'GLOVES',
      def: { id, name, slot: 'gloves', tier: gl.tier, def: Math.floor(lvl * 0.4 + 6), mdef: Math.floor(lvl * 0.3 + 5), speed: 2, req: { level: lvl }, price: Math.floor(lvl * 80 + 150), icon: id, desc: `Luvas ${name} (${gl.grade}).` }
    };
  }

  // Legs
  if (i.includes('pants') || i.includes('gaiters') || i.includes('hose')) {
    return {
      category: 'LEGS',
      def: { id, name, slot: 'legs', tier: gl.tier, def: Math.floor(lvl * 0.7 + 10), mdef: Math.floor(lvl * 0.5 + 8), hp: Math.floor(lvl * 1.5 + 15), req: { level: lvl }, price: Math.floor(lvl * 120 + 250), icon: id, desc: `Calça ${name} (${gl.grade}).` }
    };
  }

  // Belts
  if (i.includes('belt')) {
    return {
      category: 'BELTS',
      def: { id, name, slot: 'belt', tier: gl.tier, def: Math.floor(lvl * 0.5 + 5), hp: Math.floor(lvl * 3 + 40), req: { level: lvl }, price: Math.floor(lvl * 100 + 300), icon: id, desc: `Cinto de carga ${name} (${gl.grade}).` }
    };
  }

  // Armors
  if (i.includes('armor') || i.includes('vest') || i.includes('tunic') || i.includes('robe') || i.includes('breastplate') || i.includes('garb') || (i.includes('leather') && i !== 'leather' && i !== 'crafted_leather')) {
    const isRobe = i.includes('robe') || i.includes('tunic');
    const isLight = i.includes('leather') || i.includes('light');
    const defVal = isRobe ? Math.floor(lvl * 0.6 + 10) : (isLight ? Math.floor(lvl * 1.0 + 18) : Math.floor(lvl * 1.5 + 25));
    const mdefVal = isRobe ? Math.floor(lvl * 1.5 + 25) : Math.floor(lvl * 0.7 + 12);
    const matkVal = isRobe ? Math.floor(lvl * 0.6 + 10) : 0;
    const hpVal = isRobe ? 0 : Math.floor(lvl * 2 + 30);
    return {
      category: 'ARMORS',
      def: { id, name, slot: 'armor', tier: gl.tier, def: defVal, mdef: mdefVal, matk: matkVal, hp: hpVal, req: { level: lvl }, price: Math.floor(lvl * 200 + 400), icon: id, desc: `Armadura ${name} (${gl.grade}).` }
    };
  }

  // General Materials Fallback
  if (i.includes('ore') || i.includes('pouch') || i.includes('suede') || i.includes('fiber') || i.includes('coal') || i.includes('gem') || i.includes('bone') || i.includes('lump') || i.includes('oil') || i.includes('recipe') || i.includes('crystal_') || i.includes('wood') || i.includes('silver') || i.includes('branch') || i.includes('powder') || i.includes('hemp') || i.includes('iron') || i.includes('stone') || i.includes('fang') || i.includes('feather') || i.includes('scale') || i.includes('claw') || i.includes('heart') || i.includes('blood') || i.includes('dust') || i.includes('horn') || i.includes('shell')) {
    return {
      category: 'MATERIALS',
      def: { id, name, slot: 'material', stack: 999, price: Math.floor(lvl * 15 + 20), icon: id, desc: `Material de craft (${name}).` }
    };
  }

  // Consumables
  return {
    category: 'CONSUMABLES',
    def: { id, name, slot: 'consumable', stack: 99, price: Math.floor(lvl * 20 + 50), icon: id, desc: `Consumível / Item (${name}).` }
  };
}

const categorized = {
  WEAPONS: {}, ARMORS: {}, HELMETS: {}, BOOTS: {}, GLOVES: {},
  RINGS: {}, LEGS: {}, SHIELDS: {}, NECKLACES: {}, EARRINGS: {},
  BELTS: {}, CLOAKS: {}, HAIR: {}, AGATHIONS: {}, CONSUMABLES: {}, MATERIALS: {}
};

for (const id of Object.keys(iconIndex)) {
  const { category, def } = classifyItem(id);
  categorized[category][id] = def;
}

let jsContent = `// items.js - System Data & Complete Item Catalog (Generated 100% from public/img/icons/)
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
  hair: 'Acessório', agathion: 'Agathion', consumable: 'Consumível', material: 'Material'
};\n\n`;

for (const [cat, itemObj] of Object.entries(categorized)) {
  jsContent += `const ${cat} = {\n`;
  for (const [id, def] of Object.entries(itemObj)) {
    jsContent += `  "${id}": ${JSON.stringify(def)},\n`;
  }
  jsContent += `};\n\n`;
}

jsContent += `const ALL_ITEMS = {\n`;
jsContent += `  ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...RINGS,\n`;
jsContent += `  ...LEGS, ...SHIELDS, ...NECKLACES, ...EARRINGS, ...BELTS, ...CLOAKS,\n`;
jsContent += `  ...HAIR, ...AGATHIONS, ...CONSUMABLES, ...MATERIALS\n`;
jsContent += `};\n\n`;

// Generate ICON_MAP block
jsContent += `const ICON_MAP = {\n`;
const sortedKeys = Object.keys(iconIndex).sort((a, b) => a.localeCompare(b));
for (const key of sortedKeys) {
  jsContent += `  "${key}": "${iconIndex[key]}",\n`;
}
jsContent += `};\n\n`;

// Drop tables, recipes, shop
jsContent += `const MONSTER_DROPS = {
  zone1: ['wooden_sword', 'short_bow', 'training_dagger', 'leather_vest', 'leather_boots', 'hp_potion_small'],
  zone2: ['iron_sword', 'composite_bow', 'steel_dagger', 'brigandine_armor', 'mithril_boots', 'hp_potion_medium'],
  zone3: ['knight_sword', 'elven_bow', 'assassins_blade', 'full_plate_armor', 'karmian_boots', 'hp_potion_large'],
  zone4: ['blade_of_doom', 'dragon_bow', 'kris', 'blue_wolf_heavy_armor', 'avadon_boots', 'mp_potion_small'],
  zone5: ['divine_sword', 'bow_of_silence', 'dark_crystal_armor', 'tallum_boots', 'mp_potion_large'],
  zone6: ['dragon_slayer', 'draconic_bow', 'angel_slayer', 'arcana_mace', 'major_arcana_robe', 'imperial_crusader_armor']
};

const CRAFTING_RECIPES = [
  { id: 'iron_sword', reqs: [{ id: 'ironore', count: 10 }, { id: 'suede', count: 5 }], gold: 500 },
  { id: 'full_plate_armor', reqs: [{ id: 'ironore', count: 50 }, { id: 'crafted_leather', count: 20 }], gold: 5000 },
  { id: 'dragon_slayer', reqs: [{ id: 'oriharukon_ore', count: 100 }, { id: 'adamantite', count: 50 }], gold: 50000 }
];

const SHOP_INVENTORY = [
  'hp_potion_small', 'hp_potion_medium', 'hp_potion_large',
  'mp_potion_small', 'mp_potion_large', 'soulshot_no_grade',
  'wooden_sword', 'short_bow', 'training_dagger', 'leather_vest'
];

const ZONE_GOLD_MULT = { zone1: 1.0, zone2: 1.5, zone3: 2.2, zone4: 3.5, zone5: 5.5, zone6: 9.0 };
const MYSTIC_POOL = ['dragon_slayer', 'angel_slayer', 'draconic_bow', 'arcana_mace', 'ring_of_valakas', 'ring_of_baium'];

function rollRarity(bonus = 0) {
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
    LEGS, SHIELDS, NECKLACES, EARRINGS, BELTS, CLOAKS, HAIR, AGATHIONS,
    CONSUMABLES, MATERIALS, ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL, rollRarity, rollDrop, getMysticRotation, rollItemWithRarity
  };
}
`;

fs.writeFileSync(itemsJsPath, jsContent, 'utf8');
console.log('Fixed classification rules and updated items.js!');
