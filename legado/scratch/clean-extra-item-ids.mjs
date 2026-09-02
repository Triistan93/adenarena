import fs from 'fs';
import path from 'path';

const itemsJsPath = path.join(process.cwd(), 'lineage-idle/data/items.js');
let content = fs.readFileSync(itemsJsPath, 'utf8');

// Replace any "foo.png": { "name": "Foo.Png", ... } with "foo": { "name": "Foo", ... }
let updated = content.replace(/"([a-zA-Z0-9_\-]+)\.png"\s*:\s*\{"name":"([^"]+)\.Png"/g, (match, id, name) => {
  return `"${id}": {"name":"${name}"`;
});

// Also fix icon property if present
updated = updated.replace(/"icon":"([a-zA-Z0-9_\-]+)\.png"/g, (match, iconId) => {
  return `"icon":"${iconId}"`;
});

fs.writeFileSync(itemsJsPath, updated, 'utf8');
console.log('Cleaned item IDs and names in items.js!');
