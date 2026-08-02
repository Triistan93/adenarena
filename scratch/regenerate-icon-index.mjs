import fs from 'fs';
import path from 'path';

const iconsDir = path.join(process.cwd(), 'public/img/icons');
const iconIndexPath = path.join(iconsDir, 'icon_index.json');

const files = fs.readdirSync(iconsDir).filter(f => f.toLowerCase().endsWith('.png')).sort((a, b) => a.localeCompare(b));

const newIconIndex = {};
for (const file of files) {
  const key = file.replace(/\.png$/i, '');
  newIconIndex[key] = file;
}

fs.writeFileSync(iconIndexPath, JSON.stringify(newIconIndex, null, 2), 'utf8');

console.log(`✅ [regenerate-icon-index] Successfully regenerated icon_index.json with ${Object.keys(newIconIndex).length} entries directly from flat disk files!`);
