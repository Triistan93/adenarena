// test-heirloom-tooltip-stats.mjs
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let failed = 0;
function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FALHA: ${name}`);
    failed++;
  }
}

// Mock DOM & window
let lastTooltipHtml = '';
const mockTooltipEl = {
  style: {},
  set innerHTML(html) { lastTooltipHtml = html; },
  get innerHTML() { return lastTooltipHtml; },
  querySelectorAll: () => [],
  addEventListener: () => {}
};

globalThis.window = globalThis;
globalThis.document = {
  getElementById: (id) => id === 'item-tooltip' ? mockTooltipEl : null,
  querySelector: (sel) => sel === '#item-tooltip' ? mockTooltipEl : null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} } })
};
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');
await import('../lineage-idle/src/data/items/index.js');
const { HEIRLOOM_ITEMS } = await import('../lineage-idle/src/data/items/heirloom_items.js');
const { showItemTooltip, getItemIconUrl, getItemIcon } = await import('../lineage-idle/src/ui/GameUI.js');

console.log('🧪 TESTANDO RENDERIZAÇÃO DO TOOLTIP COM ATRIBUTOS DETALHADOS DE HERANÇA...\n');

// 1. Testando no Nível 14 (Fase 1)
const stateLv14 = {
  level: 14,
  inventory: [{ uid: 'test_chest', itemId: 'armor_heirloom_chest_heavy', isHeirloom: true }],
  equipment: {}
};

showItemTooltip(null, stateLv14.inventory[0], stateLv14);
console.log('HTML gerado:\n', lastTooltipHtml);

assert(lastTooltipHtml.includes('Item de Herança Dinâmico'), 'Tooltip contém título de Item de Herança');
assert(lastTooltipHtml.includes('Lv. 14/40'), 'Tooltip exibe nível do herói 14/40');
assert(lastTooltipHtml.includes('Fase 1 (Lv. 1–19): +50% superior a No-Grade'), 'Tooltip exibe texto da Fase 1');
assert(lastTooltipHtml.includes('Próxima Evolução: Nível 20'), 'Tooltip exibe previsão da próxima evolução');
assert(lastTooltipHtml.includes('P.DEF') && lastTooltipHtml.includes('+28'), 'Tooltip exibe P.DEF +28 na Fase 1');
assert(lastTooltipHtml.includes('HP Máximo') && lastTooltipHtml.includes('+70'), 'Tooltip exibe HP Máximo +70 na Fase 1');
assert(lastTooltipHtml.includes('M.DEF') && lastTooltipHtml.includes('+10'), 'Tooltip exibe M.DEF +10 na Fase 1');
assert(lastTooltipHtml.includes('Capacidade de Carga') && lastTooltipHtml.includes('+500'), 'Tooltip exibe Carga +500 na Fase 1');

// 2. Testando no Nível 25 (Fase 2)
const stateLv25 = {
  level: 25,
  inventory: [{ uid: 'test_chest', itemId: 'armor_heirloom_chest_heavy', isHeirloom: true }],
  equipment: {}
};

showItemTooltip(null, stateLv25.inventory[0], stateLv25);

assert(lastTooltipHtml.includes('Lv. 25/40'), 'Tooltip exibe nível do herói 25/40');
assert(lastTooltipHtml.includes('Fase 2 (Lv. 20–39): +50% superior a D-Grade'), 'Tooltip exibe texto da Fase 2');
assert(lastTooltipHtml.includes('P.DEF') && lastTooltipHtml.includes('+60'), 'Tooltip escala para P.DEF +60 na Fase 2');
assert(lastTooltipHtml.includes('HP Máximo') && lastTooltipHtml.includes('+160'), 'Tooltip escala para HP Máximo +160 na Fase 2');

// 3. Testando no Nível 40 (Fase 3)
const stateLv40 = {
  level: 40,
  inventory: [{ uid: 'test_chest', itemId: 'armor_heirloom_chest_heavy', isHeirloom: true }],
  equipment: {}
};

showItemTooltip(null, stateLv40.inventory[0], stateLv40);

assert(lastTooltipHtml.includes('Lv. 40/40'), 'Tooltip exibe nível do herói 40/40');
assert(lastTooltipHtml.includes('Fase 3 (Lv. 40+): Maturidade C-Grade Pleno'), 'Tooltip exibe texto da Fase 3');
assert(lastTooltipHtml.includes('P.DEF') && lastTooltipHtml.includes('+98'), 'Tooltip escala para P.DEF +98 no ápice');
assert(lastTooltipHtml.includes('HP Máximo') && lastTooltipHtml.includes('+280'), 'Tooltip escala para HP Máximo +280 no ápice');

// 4. Testando ícones
const chestIcon = getItemIconUrl({ itemId: 'armor_heirloom_chest_heavy' });
assert(chestIcon.includes('gradec/armors/armor_full_plate_heavy_armor.png'), 'Ícone da armadura de placas aponta para Grade C');

const aliasChestIcon = getItemIconUrl({ itemId: 'armor_heirloom_chest' });
assert(aliasChestIcon.includes('gradec/armors/armor_full_plate_heavy_armor.png'), 'Alias de armadura aponta para Grade C');

console.log(`\n========================================`);
console.log(`RESULTADO: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
