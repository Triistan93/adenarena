import fs from 'fs';
import path from 'path';

const iconIndexPath = path.join(process.cwd(), 'public/img/icons/icon_index.json');
const itemsJsPath = path.join(process.cwd(), 'lineage-idle/data/items.js');

if (!fs.existsSync(iconIndexPath)) {
  console.error(`Error: ${iconIndexPath} not found.`);
  process.exit(1);
}
if (!fs.existsSync(itemsJsPath)) {
  console.error(`Error: ${itemsJsPath} not found.`);
  process.exit(1);
}

// 1. Read icon_index.json
const iconIndexRaw = fs.readFileSync(iconIndexPath, 'utf8');
const iconIndex = JSON.parse(iconIndexRaw);

// 2. Sort keys alphabetically and build ICON_MAP block
const sortedKeys = Object.keys(iconIndex).sort((a, b) => a.localeCompare(b));
let mapEntries = [];
for (const key of sortedKeys) {
  mapEntries.push(`  ${JSON.stringify(key)}: ${JSON.stringify(iconIndex[key])}`);
}
const newIconMapBlock = `const ICON_MAP = {\n${mapEntries.join(',\n')}\n};`;

// 3. Read items.js
const itemsJsContent = fs.readFileSync(itemsJsPath, 'utf8');

// 4. Locate `const ICON_MAP = {` and find matching `};`
const startMatch = itemsJsContent.indexOf('const ICON_MAP = {');
if (startMatch === -1) {
  console.error('Error: Could not find `const ICON_MAP = {` in items.js');
  process.exit(1);
}

let braceCount = 0;
let endMatch = -1;
let openBraceFound = false;

for (let i = startMatch; i < itemsJsContent.length; i++) {
  const char = itemsJsContent[i];
  if (char === '{') {
    braceCount++;
    openBraceFound = true;
  } else if (char === '}') {
    braceCount--;
    if (openBraceFound && braceCount === 0) {
      // Check if followed by semicolon
      let j = i + 1;
      while (j < itemsJsContent.length && (itemsJsContent[j] === ' ' || itemsJsContent[j] === '\t' || itemsJsContent[j] === '\r' || itemsJsContent[j] === '\n')) {
        j++;
      }
      if (itemsJsContent[j] === ';') {
        endMatch = j + 1;
      } else {
        endMatch = i + 1;
      }
      break;
    }
  }
}

if (endMatch === -1) {
  console.error('Error: Could not find matching closing `};` for ICON_MAP in items.js');
  process.exit(1);
}

// 5. Replace block
const updatedContent = itemsJsContent.slice(0, startMatch) + newIconMapBlock + itemsJsContent.slice(endMatch);

fs.writeFileSync(itemsJsPath, updatedContent, 'utf8');

console.log(`✅ [sync-icons] Successfully synchronized ${sortedKeys.length} icon entries into lineage-idle/data/items.js!`);
