import fs from 'fs';
import path from 'path';

const iconsDir = 'c:/Users/duuha/Downloads/adenarena-main/adenarena-main/public/img/icons';
const outputJson = 'c:/Users/duuha/Downloads/adenarena-main/adenarena-main/scratch/disk-inventory.json';

const inventory = {};

function scanDir(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      const relDir = path.relative(iconsDir, currentDir).replace(/\\/g, '/');
      if (!inventory[relDir]) {
        inventory[relDir] = [];
      }
      inventory[relDir].push(entry.name);
    }
  }
}

scanDir(iconsDir);

const sortedInventory = {};
const sortedKeys = Object.keys(inventory).sort();
for (const key of sortedKeys) {
  sortedInventory[key] = inventory[key].sort();
}

fs.mkdirSync(path.dirname(outputJson), { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify(sortedInventory, null, 2), 'utf-8');
console.log(`Inventory saved to ${outputJson}`);
