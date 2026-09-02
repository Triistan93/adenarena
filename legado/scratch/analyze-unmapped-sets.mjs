import fs from 'fs';

const iconIndexRaw = fs.readFileSync('./public/img/icons/icon_index.json', 'utf8');
const iconIndex = JSON.parse(iconIndexRaw);

const itemsJs = fs.readFileSync('./lineage-idle/data/items.js', 'utf8');

const itemRegex = /^\s*([a-z0-9_]+)\s*:\s*\{[^}]*name\s*:\s*['"]([^'"]+)['"]/gm;
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

console.log(`Total unmapped icons in icon_index.json: ${unmapped.length}`);
console.log('\nGrouped by path folder / category:');

const categories = {};
for (const u of unmapped) {
  const parts = u.path.split('/');
  const folder = parts.length > 1 ? parts[0] + (parts.length > 2 ? '/' + parts[1] : '') : 'Root';
  categories[folder] = (categories[folder] || []);
  categories[folder].push(u);
}

for (const [cat, list] of Object.entries(categories)) {
  console.log(`\n=== Category: ${cat} (${list.length} icons) ===`);
  list.slice(0, 15).forEach(item => console.log(`  - [${item.id}] -> ${item.path}`));
  if (list.length > 15) console.log(`  ... and ${list.length - 15} more`);
}
