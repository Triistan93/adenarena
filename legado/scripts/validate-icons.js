import fs from 'fs';
import path from 'path';

console.log('=== ICON SYSTEM FLAT AUDIT & VALIDATION ===\n');

try {
  const itemsJsPath = path.join(process.cwd(), 'lineage-idle/data/items.js');
  const iconIndexPath = path.join(process.cwd(), 'public/img/icons/icon_index.json');
  const iconsDir = path.join(process.cwd(), 'public/img/icons');

  const iconIndex = JSON.parse(fs.readFileSync(iconIndexPath, 'utf8'));
  const itemsJsContent = fs.readFileSync(itemsJsPath, 'utf8');

  // Extract ICON_MAP from items.js
  const iconMapMatch = itemsJsContent.match(/const ICON_MAP = (\{[\s\S]*?\n\};)/);
  if (!iconMapMatch) {
    console.error('❌ Failed to find ICON_MAP in items.js');
    process.exit(1);
  }

  const iconMap = Function(`"use strict"; return ${iconMapMatch[1].slice(0, -1)};`)();

  console.log(`1. ICON_MAP entries in items.js: ${Object.keys(iconMap).length}`);
  console.log(`2. Entries in icon_index.json: ${Object.keys(iconIndex).length}`);

  let mapMismatch = 0;
  for (const [k, v] of Object.entries(iconIndex)) {
    if (iconMap[k] !== v) mapMismatch++;
  }
  if (mapMismatch === 0) {
    console.log('✅ ICON_MAP matches icon_index.json 100% 1:1!');
  }

  // Extract ALL_ITEMS from items.js
  const allItemsMatch = itemsJsContent.match(/const ALL_ITEMS = (\{[\s\S]*?\n\};)/);
  
  // Parse all JSON property definitions in items.js
  const itemRegex = /"([a-zA-Z0-9_\.\s\-]+)"\s*:\s*\{[^{}]*?"name"\s*:\s*"([^"]+)"/g;
  let match;
  const allItemsMap = new Map();

  while ((match = itemRegex.exec(itemsJsContent)) !== null) {
    const id = match[1].trim();
    const name = match[2].trim();
    if (['ICON_MAP', 'RARITY', 'SLOT', 'MONSTER_DROPS', 'CRAFTING_RECIPES', 'ALL_EXTRA_L2_ITEMS'].includes(id)) continue;
    allItemsMap.set(id, name);
  }

  const unresolvableItems = [];
  const validResolvedItems = [];

  for (const [id, name] of allItemsMap.entries()) {
    const resolvedFileName = iconMap[id];

    if (resolvedFileName) {
      const fullPath = path.join(iconsDir, resolvedFileName);
      if (fs.existsSync(fullPath)) {
        validResolvedItems.push({ id, name, resolvedFileName });
      } else {
        unresolvableItems.push({ id, name, reason: `Arquivo em disco ausente: ${resolvedFileName}` });
      }
    } else {
      unresolvableItems.push({ id, name, reason: `Chave "${id}" não encontrada no ICON_MAP` });
    }
  }

  console.log(`3. Total item definitions parsed: ${allItemsMap.size}`);
  console.log(`4. Valid resolved items: ${validResolvedItems.length}`);
  console.log(`5. Unresolvable / Orphan items count: ${unresolvableItems.length}`);

  if (unresolvableItems.length > 0) {
    console.log('\n❌ LISTA DE ITENS ÓRFÃOS (Chave ou arquivo ausente):');
    unresolvableItems.forEach((it, idx) => {
      console.log(`  ${idx + 1}. [${it.id}] "${it.name}" -> ${it.reason}`);
    });
  } else {
    console.log('✅ 100% dos itens cadastrados no jogo possuem ícone plano válido e existente no disco!');
  }

} catch (err) {
  console.error('❌ Validation error:', err);
  process.exit(1);
}
