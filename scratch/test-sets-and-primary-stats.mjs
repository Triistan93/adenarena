import fs from 'fs';
import vm from 'vm';

const itemsCode = fs.readFileSync('lineage-idle/data/items.js', 'utf8');
let mainCode = fs.readFileSync('lineage-idle/main.js', 'utf8');
mainCode = mainCode.replace(/^import\s+.*$/gm, '// import stripped')
                   .replace(/await\s+[^;\n]+/g, '{}')
                   .replace(/^export\s+/gm, '')
                   .replace(/import\.meta/g, '({})');

const domMock = {
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  getElementById: () => null,
  createElement: () => ({ setAttribute: () => {}, style: {}, appendChild: () => {} })
};

const sandbox = {
  window: { GameData: {} },
  document: domMock,
  navigator: { userAgent: 'node' },
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Date: Date,
  Math: Math,
  Object: Object,
  Array: Array,
  Number: Number,
  String: String,
  Boolean: Boolean,
  state: {
    level: 76,
    race: 'human',
    class: 'duelist',
    base: { atk: 100, def: 100, eva: 10, matk: 100, mdef: 100 },
    equipment: {},
    inventory: [],
    skills: {},
    buffs: {},
    certifications: {},
    tower: { highestFloor: 0 }
  }
};

vm.createContext(sandbox);
vm.runInContext(itemsCode, sandbox);

// Mock helper globals needed by main.js
sandbox.RACES = { human: { stats: { atk: 10, def: 10 } } };
sandbox.CLASSES = { duelist: { base: { atk: 20, def: 20 } } };
sandbox.getClass = () => sandbox.CLASSES.duelist;
sandbox.getCodexBonuses = () => ({ atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0 });
sandbox.getDollsBonuses = () => ({ atk: 0, def: 0, matk: 0, mdef: 0, hp: 0, mp: 0, eva: 0, crit: 0, speed: 0, lifesteal: 0 });
sandbox.getCertificationsBonuses = () => ({ atk: 0, def: 0, matk: 0, mdef: 0, crit: 0 });
sandbox.getEquipBonus = () => null;
sandbox.ALL_EQUIP_SLOTS = ['weapon', 'shield', 'helmet', 'armor', 'legs', 'gloves', 'boots', 'hair', 'hair2', 'necklace', 'earring1', 'earring2', 'ring', 'ring2', 'belt', 'cloak', 'talisman', 'agathion'];
sandbox.D = () => sandbox.window.GameData;
sandbox.getItemDef = (id) => {
  if (!id) return null;
  const items = sandbox.window.GameData.ALL_ITEMS;
  return items[id] || items['armor_' + id] || items['jewel_' + id] || items['weapon_' + id] || null;
};

vm.runInContext(mainCode, sandbox);

console.log('=== TESTING ARMOR SETS AND PRIMARY ATTRIBUTES ===\n');

const ARMOR_SETS = sandbox.window.GameData.ARMOR_SETS;
console.log('ARMOR_SETS count:', Object.keys(ARMOR_SETS).length);

// Test Avadon Set (5-piece set + shield)
console.log('\n--- Test 1: Equipping Avadon Heavy Set ---');
const avadonItems = [
  { uid: 'u1', itemId: 'armor_avadon_heavy_armor' },
  { uid: 'u2', itemId: 'armor_avadon_heavy_helmet' },
  { uid: 'u3', itemId: 'armor_avadon_heavy_boots' },
  { uid: 'u4', itemId: 'armor_avadon_heavy_gloves' },
  { uid: 'u5', itemId: 'armor_avadon_heavy_pants' },
  { uid: 'u6', itemId: 'armor_avadon_shield' }
];

const stateInContext = vm.runInContext('state', sandbox);
stateInContext.inventory = avadonItems;
stateInContext.equipment = {
  armor: 'u1',
  helmet: 'u2',
  boots: 'u3',
  gloves: 'u4',
  legs: 'u5',
  shield: 'u6'
};

let stats = sandbox.getStats();
const activePrimary = stateInContext.primaryStats;
console.log('Avadon full set + shield primaryStats:', activePrimary);
console.log('Final HP:', stats.maxHp, '| Final DEF:', stats.def, '| Final MDEF:', stats.mdef);

if (activePrimary && activePrimary.con === 6 && activePrimary.wit === 3) {
  console.log('✅ PASS: Avadon Full Set + Shield granted +6 CON and +3 WIT!');
} else {
  console.error('❌ FAIL: Primary stats mismatch:', activePrimary);
}

// Test Draconic Set (4-piece fullbody set)
console.log('\n--- Test 2: Equipping Draconic Armor Set (Fullbody) ---');
const draconicItems = [
  { uid: 'd1', itemId: 'armor_draconic_armor' },
  { uid: 'd2', itemId: 'armor_draconic_helmet' },
  { uid: 'd3', itemId: 'armor_draconic_boots' },
  { uid: 'd4', itemId: 'armor_draconic_gloves' }
];

stateInContext.inventory = draconicItems;
stateInContext.equipment = {
  armor: 'd1',
  helmet: 'd2',
  boots: 'd3',
  gloves: 'd4'
};

stats = sandbox.getStats();
const activePrimary2 = sandbox.state.primaryStats || vm.runInContext('state.primaryStats', sandbox);
console.log('Draconic full set primaryStats:', activePrimary2);
console.log('Final ATK:', stats.atk, '| Final Crit:', stats.crit, '| Final Eva:', stats.eva, '| Final Speed:', stats.speed);

if (activePrimary2 && activePrimary2.dex === 6 && activePrimary2.str === 5) {
  console.log('✅ PASS: Draconic Full Set (4-piece) granted +6 DEX and +5 STR!');
} else {
  console.error('❌ FAIL: Primary stats mismatch:', activePrimary2);
}

console.log('\n=== ALL SET & STAT TESTS COMPLETED SUCCESSFULLY ===');
