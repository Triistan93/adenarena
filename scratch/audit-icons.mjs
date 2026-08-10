import fs from 'fs';
import path from 'path';

const iconIndexRaw = fs.readFileSync('./public/img/icons/icon_index.json', 'utf8');
const iconIndex = JSON.parse(iconIndexRaw);

const itemsJs = fs.readFileSync('./lineage-idle/data/items.js', 'utf8');

// Simple regex matching all `"id": { ... "name": "Name" ... }` or `id: { ... name: 'Name' ... }`
const nameRegex = /['"]?([a-zA-Z0-9_\.\s\-]+)['"]?\s*:\s*\{[^{}]*?['"]?name['"]?\s*:\s*['"]([^'"]+)['"]/g;
let match;
const allItemsMap = new Map();

while ((match = nameRegex.exec(itemsJs)) !== null) {
  const id = match[1].trim();
  const name = match[2].trim();
  if (['ICON_MAP', 'RARITY', 'SLOT', 'MONSTER_DROPS', 'CRAFTING_RECIPES', 'ALL_EXTRA_L2_ITEMS'].includes(id)) continue;
  allItemsMap.set(id, name);
}

console.log(`Total unique item definitions parsed in items.js: ${allItemsMap.size}`);

let validCount = 0;
let missingCount = 0;

for (const [id, name] of allItemsMap.entries()) {
  const indexed = iconIndex[id];
  if (indexed) {
    const fullPath = path.join('./public/img/icons', indexed);
    if (fs.existsSync(fullPath)) validCount++;
    else missingCount++;
  } else {
    missingCount++;
  }
}

console.log(`\n✅ Total de itens cadastrados no jogo com ícone PNG 100% funcional: ${validCount}`);
console.log(`❌ Itens sem ícone: ${missingCount}`);
