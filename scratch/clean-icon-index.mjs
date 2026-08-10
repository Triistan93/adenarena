import fs from 'fs';

const iconIndexPath = './public/img/icons/icon_index.json';
const iconIndex = JSON.parse(fs.readFileSync(iconIndexPath, 'utf8'));

const cleanedIndex = {};

for (let [key, val] of Object.entries(iconIndex)) {
  // 1. Clean double extension .png.png in key and val
  let cleanKey = key.replace(/\.png\.png$/i, '').replace(/\.png$/i, '');
  let cleanVal = val.replace(/\.png\.png$/i, '.png');

  // 2. Clean spaces in key name -> convert to underscore
  cleanKey = cleanKey.replace(/\s+/g, '_');

  // Check if target file exists on disk
  cleanedIndex[cleanKey] = cleanVal;
}

fs.writeFileSync(iconIndexPath, JSON.stringify(cleanedIndex, null, 2), 'utf8');
console.log(`Cleaned icon_index.json: ${Object.keys(cleanedIndex).length} clean entries.`);
