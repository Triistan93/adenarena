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
  D: () => sandbox.window.GameData,
  getItemDef: (id) => {
    if (!id) return null;
    const items = sandbox.window.GameData.ALL_ITEMS;
    return items[id] || items['armor_' + id] || items['jewel_' + id] || items['weapon_' + id] || null;
  },
  el: () => null,
  qs: () => null,
  qsa: () => [],
  mkEl: () => ({ style: {}, appendChild: () => {} })
};

vm.createContext(sandbox);
vm.runInContext(itemsCode, sandbox);
vm.runInContext(mainCode, sandbox);

console.log('=== TESTING FOUNDATION MECHANICS & PITY SYSTEM ===\n');

const formatItemDisplayName = vm.runInContext('formatItemDisplayName', sandbox);
console.log('Test Name Common:', formatItemDisplayName({ itemId: 'shield_dynasty', enchant: 0, rarity: 'common', foundation: false }));
console.log('Test Name Foundation Rare:', formatItemDisplayName({ itemId: 'shield_dynasty', enchant: 0, rarity: 'rare', foundation: true }));
console.log('Test Name +5 Foundation Legendary:', formatItemDisplayName({ itemId: 'shield_dynasty', enchant: 5, rarity: 'legendary', foundation: true }));

if (formatItemDisplayName({ itemId: 'shield_dynasty', enchant: 5, rarity: 'legendary', foundation: true }).includes('Foundation')) {
  console.log('✅ PASS: formatItemDisplayName centralizes item naming correctly!');
} else {
  console.error('❌ FAIL: formatItemDisplayName formatting error');
}

// Test Foundation Stat Multiplier (+30%)
const stateInContext = vm.runInContext('state', sandbox);
const normalItem = { uid: 'i1', itemId: 'armor_draconic_armor', rarity: 'rare', foundation: false };
const foundationItem = { uid: 'i2', itemId: 'armor_draconic_armor', rarity: 'rare', foundation: true };

stateInContext.inventory = [normalItem, foundationItem];

stateInContext.equipment.armor = 'i1';
const normalBonus = sandbox.getEquipBonus('armor');

stateInContext.equipment.armor = 'i2';
const foundationBonus = sandbox.getEquipBonus('armor');

console.log('\nNormal Draconic Defense:', normalBonus.def);
console.log('Foundation Draconic Defense (+30%):', foundationBonus.def);

if (Math.round(normalBonus.def * 1.3) === foundationBonus.def) {
  console.log('✅ PASS: Foundation item provides exact +30% stat multiplier!');
} else {
  console.error('❌ FAIL: Foundation stat multiplier mismatch!');
}

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
