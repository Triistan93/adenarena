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

const unmappedIcons = [];
for (const key of Object.keys(iconIndex)) {
  if (!definedItemIds.has(key)) {
    unmappedIcons.push(key);
  }
}

console.log('Total keys in icon_index.json:', Object.keys(iconIndex).length);
console.log('Total item definitions in items.js:', definedItemIds.size);
console.log('Keys in icon_index.json NOT defined in items.js:', unmappedIcons.length);

console.log('\nSample unmapped set icons (first 30):');
unmappedIcons.slice(0, 30).forEach((k, idx) => console.log(`${idx + 1}. ${k} -> ${iconIndex[k]}`));
