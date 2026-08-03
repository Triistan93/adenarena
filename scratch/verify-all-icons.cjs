const fs = require('fs');
const path = require('path');

const data = fs.readFileSync('lineage-idle/data/items.js', 'utf8');

// Extract ALL icon paths from ICON_MAP
const iconMapSection = data.match(/const ICON_MAP = \{([\s\S]*?)\};/);
if (!iconMapSection) { console.error('ICON_MAP not found!'); process.exit(1); }

const lines = iconMapSection[1].trim().split('\n');
let ok = 0, missing = 0;
const missingList = [];

for (const line of lines) {
  const m = line.match(/"([^"]+)":\s*"([^"]+)"/);
  if (!m) continue;
  const [, id, iconPath] = m;
  const fullPath = path.join('public', 'img', 'icons', iconPath);
  if (fs.existsSync(fullPath)) {
    ok++;
  } else {
    missing++;
    missingList.push(`${id} => ${fullPath}`);
  }
}

console.log(`Total checked: ${ok + missing}`);
console.log(`OK: ${ok}`);
console.log(`Missing: ${missing}`);
if (missingList.length > 0) {
  console.log('\nMissing files:');
  missingList.forEach(l => console.log('  ' + l));
}
