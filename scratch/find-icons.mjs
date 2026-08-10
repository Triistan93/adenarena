import fs from 'fs';
import path from 'path';

function findFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(fullPath));
    } else if (file.endsWith('.png')) {
      results.push(path.relative('./public/img/icons', fullPath).replace(/\\/g, '/'));
    }
  });
  return results;
}

const allPngs = findFiles('./public/img/icons');
console.log('Total PNG files in public/img/icons:', allPngs.length);

const queries = ['cloth', 'robe', 'cap', 'ring', 'orfen', 'core', 'earring', 'crown', 'cat', 'shield', 'scroll', 'iron', 'ore'];

for (const q of queries) {
  const matches = allPngs.filter(p => p.toLowerCase().includes(q));
  console.log(`Matches for '${q}' (${matches.length}):`, matches.slice(0, 10));
}
