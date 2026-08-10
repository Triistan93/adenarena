import fs from 'fs';

const itemsJs = fs.readFileSync('./lineage-idle/data/items.js', 'utf8');

// Replace any property key inside object definition:  key_name: { ... } ->  "key_name": { ... }
const fixedJs = itemsJs.replace(/^  (['"]?[a-zA-Z0-9_\.\s\-]+['"]?)\s*:\s*(\{.*)/gm, (match, key, rest) => {
  let cleanKey = key.trim();
  if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
    return match;
  }
  cleanKey = cleanKey.replace(/^['"]|['"]$/g, '');
  return `  "${cleanKey}": ${rest}`;
});

fs.writeFileSync('./lineage-idle/data/items.js', fixedJs, 'utf8');
console.log('Successfully quoted all keys in items.js!');
