import fs from 'fs';

const iconIndexRaw = fs.readFileSync('./public/img/icons/icon_index.json', 'utf8');
const iconIndex = JSON.parse(iconIndexRaw);

const itemsJs = fs.readFileSync('./lineage-idle/data/items.js', 'utf8');

const itemRegex = /([a-z0-9_]+)\s*:\s*\{[^}]*name\s*:\s*['"]([^'"]+)['"]/g;
let match;
const definedItemIds = new Set();
while ((match = itemRegex.exec(itemsJs)) !== null) {
  definedItemIds.add(match[1]);
}

const unmapped = [];
for (const [key, iconPath] of Object.entries(iconIndex)) {
  if (!definedItemIds.has(key)) {
    unmapped.push({ id: key, path: iconPath });
  }
}

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
  return name;
}

function determineGradeAndLevel(id, path) {
  const p = path.toLowerCase();
  const i = id.toLowerCase();
  if (p.includes('grades') || i.includes('dynast') || i.includes('vesper') || i.includes('elegia') || i.includes('draconic') || i.includes('imperial') || i.includes('arcana') || i.includes('orfen') || i.includes('core') || i.includes('queen_ant') || i.includes('baium') || i.includes('zaken') || i.includes('antharas') || i.includes('valakas')) {
    return { grade: 'S Grade', level: 76, tier: 5, mult: 3.2 };
  }
  if (p.includes('gradea') || i.includes('dark_crystal') || i.includes('tallum') || i.includes('nightmare') || i.includes('majestic') || i.includes('sirra') || i.includes('sovh')) {
    return { grade: 'A Grade', level: 61, tier: 4.5, mult: 2.4 };
  }
  if (p.includes('gradeb') || i.includes('avadon') || i.includes('blue_wolf') || i.includes('doom') || i.includes('zwei') || i.includes('kris')) {
    return { grade: 'B Grade', level: 52, tier: 4, mult: 1.8 };
  }
  if (p.includes('gradec') || i.includes('karmian') || i.includes('demon') || i.includes('plated') || i.includes('full_plate') || i.includes('samurai') || i.includes('akamanah')) {
    return { grade: 'C Grade', level: 40, tier: 3, mult: 1.4 };
  }
  if (p.includes('graded') || i.includes('mithril') || i.includes('brigandine') || i.includes('manticore') || i.includes('bastard') || i.includes('elven')) {
    return { grade: 'D Grade', level: 20, tier: 2, mult: 1.2 };
  }
  return { grade: 'No Grade', level: 1, tier: 1, mult: 1.0 };
}

function determineSlotAndStats(id, path, gl) {
  const i = id.toLowerCase();
  const p = path.toLowerCase();
  const name = formatName(id);
  const lvl = gl.level;

  if (p.includes('weapon') || i.includes('sword') || i.includes('bow') || i.includes('dagger') || i.includes('staff') || i.includes('mace') || i.includes('cutter') || i.includes('blade') || i.includes('hammer') || i.includes('duals') || i.includes('spear') || i.includes('pole')) {
    const isMage = i.includes('staff') || i.includes('mace') || i.includes('wand');
    const isBow = i.includes('bow');
    const isDagger = i.includes('dagger');
    const atk = isMage ? Math.floor(lvl * 0.3 + 10) : Math.floor(lvl * 1.8 + 25);
    const matk = isMage ? Math.floor(lvl * 2.2 + 30) : 0;
    const crit = isBow || isDagger ? 12 : 5;
    const eva = isDagger ? 8 : 0;
    return {
      slot: 'weapon',
      def: { name, slot: 'weapon', tier: gl.tier, atk, matk, crit, eva, req: { level: lvl }, price: Math.floor(lvl * 250 + 500), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('shield')) {
    return {
      slot: 'shield',
      def: { name, slot: 'shield', tier: gl.tier, def: Math.floor(lvl * 0.8 + 15), mdef: Math.floor(lvl * 0.4 + 10), hp: Math.floor(lvl * 2 + 20), req: { level: lvl }, price: Math.floor(lvl * 120 + 300), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('earring') || i.includes('earing')) {
    return {
      slot: 'earring',
      def: { name, slot: 'earring', tier: gl.tier, mdef: Math.floor(lvl * 0.7 + 12), eva: 3, hp: Math.floor(lvl * 1.2 + 20), req: { level: lvl }, price: Math.floor(lvl * 150 + 400), desc: `Brinco místico ${name} (${gl.grade}).` }
    };
  }

  if (i.includes('ring')) {
    return {
      slot: 'ring',
      def: { name, slot: 'ring', tier: gl.tier, mdef: Math.floor(lvl * 0.6 + 10), crit: 4, matk: Math.floor(lvl * 0.3 + 5), req: { level: lvl }, price: Math.floor(lvl * 150 + 400), desc: `Anel místico ${name} (${gl.grade}).` }
    };
  }

  if (i.includes('necklace')) {
    return {
      slot: 'necklace',
      def: { name, slot: 'necklace', tier: gl.tier, mdef: Math.floor(lvl * 1.0 + 15), mp: Math.floor(lvl * 2 + 30), matk: Math.floor(lvl * 0.5 + 8), req: { level: lvl }, price: Math.floor(lvl * 200 + 500), desc: `Colar místico ${name} (${gl.grade}).` }
    };
  }

  if (i.includes('helmet') || i.includes('helm') || i.includes('cap') || i.includes('hood') || i.includes('circlet') || i.includes('hat') || i.includes('goggle') || i.includes('mask') || i.includes('crown') || i.includes('ears') || i.includes('chaperon') || i.includes('feeler') || i.includes('cornu')) {
    const isAcc = i.includes('hat') || i.includes('goggle') || i.includes('mask') || i.includes('crown') || i.includes('ears') || i.includes('circlet') || i.includes('chaperon') || i.includes('feeler') || i.includes('cornu');
    const slot = isAcc ? 'hair' : 'helmet';
    return {
      slot,
      def: { name, slot, tier: gl.tier, def: Math.floor(lvl * 0.5 + 8), mdef: Math.floor(lvl * 0.4 + 6), eva: isAcc ? 5 : 0, req: { level: lvl }, price: Math.floor(lvl * 100 + 200), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('boots') || i.includes('shoes') || i.includes('sandals')) {
    return {
      slot: 'boots',
      def: { name, slot: 'boots', tier: gl.tier, def: Math.floor(lvl * 0.4 + 6), mdef: Math.floor(lvl * 0.3 + 5), speed: 3, req: { level: lvl }, price: Math.floor(lvl * 80 + 150), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('gloves') || i.includes('gauntlets')) {
    return {
      slot: 'gloves',
      def: { name, slot: 'gloves', tier: gl.tier, def: Math.floor(lvl * 0.4 + 6), mdef: Math.floor(lvl * 0.3 + 5), speed: 2, req: { level: lvl }, price: Math.floor(lvl * 80 + 150), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('pants') || i.includes('gaiters') || i.includes('hose')) {
    return {
      slot: 'legs',
      def: { name, slot: 'legs', tier: gl.tier, def: Math.floor(lvl * 0.7 + 10), mdef: Math.floor(lvl * 0.5 + 8), hp: Math.floor(lvl * 1.5 + 15), req: { level: lvl }, price: Math.floor(lvl * 120 + 250), desc: `${name} (${gl.grade}).` }
    };
  }

  if (i.includes('belt')) {
    return {
      slot: 'belt',
      def: { name, slot: 'belt', tier: gl.tier, def: Math.floor(lvl * 0.5 + 5), hp: Math.floor(lvl * 3 + 40), req: { level: lvl }, price: Math.floor(lvl * 100 + 300), desc: `Cinto de carga ${name} (${gl.grade}).` }
    };
  }

  if (i.includes('cloak') || i.includes('capa') || i.includes('capared') || i.includes('capawhite')) {
    return {
      slot: 'cloak',
      def: { name, slot: 'cloak', tier: gl.tier, def: Math.floor(lvl * 0.4 + 5), mdef: Math.floor(lvl * 0.6 + 8), eva: 5, req: { level: lvl }, price: Math.floor(lvl * 120 + 350), desc: `Manto ${name} (${gl.grade}).` }
    };
  }

  if (p.includes('armor') || i.includes('armor') || i.includes('vest') || i.includes('tunic') || i.includes('robe') || i.includes('breastplate') || i.includes('garb')) {
    const isRobe = i.includes('robe') || i.includes('tunic');
    const isLight = i.includes('leather') || i.includes('light');
    const defVal = isRobe ? Math.floor(lvl * 0.6 + 10) : (isLight ? Math.floor(lvl * 1.0 + 18) : Math.floor(lvl * 1.5 + 25));
    const mdefVal = isRobe ? Math.floor(lvl * 1.5 + 25) : Math.floor(lvl * 0.7 + 12);
    const matkVal = isRobe ? Math.floor(lvl * 0.6 + 10) : 0;
    const hpVal = isRobe ? 0 : Math.floor(lvl * 2 + 30);
    return {
      slot: 'armor',
      def: { name, slot: 'armor', tier: gl.tier, def: defVal, mdef: mdefVal, matk: matkVal, hp: hpVal, req: { level: lvl }, price: Math.floor(lvl * 200 + 400), desc: `Armadura ${name} (${gl.grade}).` }
    };
  }

  if (p.includes('materials') || i.includes('ore') || i.includes('pouch') || i.includes('suede') || i.includes('leather') || i.includes('fiber') || i.includes('coal') || i.includes('gem') || i.includes('bone') || i.includes('lump') || i.includes('oil') || i.includes('recipe')) {
    return {
      slot: 'material',
      def: { name, slot: 'material', stack: 999, price: Math.floor(lvl * 15 + 20), desc: `Material de craft de Lineage II (${name}).` }
    };
  }

  return {
    slot: 'consumable',
    def: { name, slot: 'consumable', stack: 99, price: Math.floor(lvl * 20 + 50), desc: `Item de Lineage II (${name}).` }
  };
}

const generatedDefs = {};
for (const u of unmapped) {
  const gl = determineGradeAndLevel(u.id, u.path);
  const { slot, def } = determineSlotAndStats(u.id, u.path, gl);
  generatedDefs[u.id] = def;
}

let codeToAppend = '\n// ========================================\n// LINEAGE II EXTRA ITEMS (ALL UNMAPPED ICONS)\n// ========================================\nconst ALL_EXTRA_L2_ITEMS = {\n';
for (const [id, def] of Object.entries(generatedDefs)) {
  codeToAppend += `  ${id}: ${JSON.stringify(def)},\n`;
}
codeToAppend += '};\n';

const targetPattern = `const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...LEGS, ...HELMETS, ...BOOTS, ...GLOVES,
  ...SHIELDS, ...NECKLACES, ...EARRINGS, ...BELTS, ...CLOAKS, ...TALISMANS,
  ...HAIR, ...HAIR2, ...RINGS, ...CONSUMABLES, ...MATERIALS, ...AGATHIONS,
  ...NEW_ARMORS
};`;

const replacementPattern = `${codeToAppend}
const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...LEGS, ...HELMETS, ...BOOTS, ...GLOVES,
  ...SHIELDS, ...NECKLACES, ...EARRINGS, ...BELTS, ...CLOAKS, ...TALISMANS,
  ...HAIR, ...HAIR2, ...RINGS, ...CONSUMABLES, ...MATERIALS, ...AGATHIONS,
  ...NEW_ARMORS, ...ALL_EXTRA_L2_ITEMS
};`;

if (!itemsJs.includes(targetPattern)) {
  console.error('Target pattern for ALL_ITEMS not found in items.js!');
  process.exit(1);
}

let newItemsJs = itemsJs.replace(targetPattern, replacementPattern);
fs.writeFileSync('./lineage-idle/data/items.js', newItemsJs, 'utf8');
console.log(`Successfully added ${Object.keys(generatedDefs).length} new Lineage II items to items.js!`);
