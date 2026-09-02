// Teste de Verificação dos Ícones dos Itens de Herança (Heirloom) e Grade C

import fs from 'node:fs';
import path from 'node:path';

globalThis.window = globalThis;
globalThis.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} } })
};
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const { HEIRLOOM_ITEMS } = await import('../lineage-idle/src/data/items/heirloom_items.js');
const { getItemIconUrl } = await import('../lineage-idle/src/ui/GameUI.js');

console.log('🧪 TESTANDO RESOLUÇÃO E EXISTÊNCIA FÍSICA DOS ÍCONES DE HERANÇA (GRADE C)...\n');

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

const iconsBaseDir = path.resolve('public/img/icons');

for (const [id, def] of Object.entries(HEIRLOOM_ITEMS)) {
  assert(def.icon && def.icon.length > 0, `[${id}] possui propriedade 'icon' definida (${def.icon})`);
  
  const iconRelPath = def.icon;
  const fullDiskPath = path.join(iconsBaseDir, iconRelPath);
  const existsOnDisk = fs.existsSync(fullDiskPath);
  assert(existsOnDisk, `[${id}] arquivo físico existe em: ${iconRelPath}`);

  // Verifica getItemIconUrl
  const resolvedUrl = getItemIconUrl(def, def);
  assert(resolvedUrl && !resolvedUrl.includes('.png.png') && resolvedUrl.includes(iconRelPath.replace('.png', '')), `[${id}] getItemIconUrl gerou URL válida: ${resolvedUrl}`);
}

console.log(`\n========================================`);
console.log(`RESULTADO: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);
