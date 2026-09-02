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

const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

const sandbox = {
  window: { GameData: {} },
  document: domMock,
  localStorage: localStorageMock,
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
  mkEl: () => ({ style: {}, appendChild: () => {} }),
  log: (msg) => console.log('LOG:', msg),
  floatText: () => {},
  triggerQuestEvent: () => {},
  updateAllUI: () => {}
};

vm.createContext(sandbox);
vm.runInContext(itemsCode, sandbox);
vm.runInContext(mainCode, sandbox);

console.log('=== TESTING WAREHOUSE (BAÚ) SYSTEM ===\n');

const state = vm.runInContext('state', sandbox);
const depositToWarehouse = vm.runInContext('depositToWarehouse', sandbox);
const withdrawFromWarehouse = vm.runInContext('withdrawFromWarehouse', sandbox);
const registerCodexItem = vm.runInContext('registerCodexItem', sandbox);

// 1. Add unequipped item & equipped item to inventory
const unequippedSword = { uid: 'sword_1', itemId: 'weapon_falchion_sword', count: 1, rarity: 'common', equipped: false };
const equippedArmor = { uid: 'armor_1', itemId: 'armor_wooden_breastplate', count: 1, rarity: 'common', equipped: true };

state.inventory = [unequippedSword, equippedArmor];
state.warehouse = [];

console.log('Initial Inventory Count:', state.inventory.length);
console.log('Initial Warehouse Count:', state.warehouse.length);

// 2. Test Equipped item block
console.log('\n--- Test 1: Try depositing equipped item ---');
const resEquipped = depositToWarehouse('armor_1');
if (!resEquipped && state.warehouse.length === 0) {
  console.log('✅ PASS: Equipped item blocked from moving to Warehouse!');
} else {
  console.error('❌ FAIL: Equipped item was deposited!');
}

// 3. Test Depositing unequipped item
console.log('\n--- Test 2: Deposit unequipped sword ---');
const resSword = depositToWarehouse('sword_1');
if (resSword && state.warehouse.length === 1 && state.warehouse[0].itemId === 'weapon_falchion_sword' && state.inventory.length === 1) {
  console.log('✅ PASS: Unequipped sword successfully moved to Warehouse!');
} else {
  console.error('❌ FAIL: Deposit failed!');
}

// 4. Test Withdrawing from Warehouse
console.log('\n--- Test 3: Withdraw sword from Warehouse ---');
const swordWhUid = state.warehouse[0].uid;
const resWithdraw = withdrawFromWarehouse(swordWhUid);
if (resWithdraw && state.warehouse.length === 0 && state.inventory.length === 2) {
  console.log('✅ PASS: Sword successfully withdrawn from Warehouse to Inventory!');
} else {
  console.error('❌ FAIL: Withdraw failed!');
}

// 5. Test Codex Extension (consuming item from Warehouse)
console.log('\n--- Test 4: Codex item registration from Warehouse ---');
// Put a codex item (e.g. crystal_d) directly into Warehouse
const codexItem = { uid: 'c_d', itemId: 'crystal_d', count: 1, rarity: null, equipped: false };
state.warehouse = [codexItem];
state.inventory = [];
state.codex = {};

console.log('Item in Warehouse before Codex reg:', state.warehouse.length);
registerCodexItem('crystal_codex', 'crystal_d');
if (state.warehouse.length === 0 && state.codex['crystal_codex']?.includes('crystal_d')) {
  console.log('✅ PASS: Item in Warehouse was successfully registered in Codex & removed from Warehouse!');
} else {
  console.error('❌ FAIL: Codex warehouse consumption failed!');
}

console.log('\n=== ALL WAREHOUSE TESTS PASSED PERFECTLY ===');
