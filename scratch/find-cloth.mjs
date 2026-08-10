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
const clothFiles = allPngs.filter(p => p.toLowerCase().includes('cloth') || p.toLowerCase().includes('tunic') || p.toLowerCase().includes('shirt') || p.toLowerCase().includes('cotton') || p.toLowerCase().includes('apparel') || p.toLowerCase().includes('gaiters') || p.toLowerCase().includes('hose') || p.toLowerCase().includes('leather') || p.toLowerCase().includes('pants'));

console.log('Cloth/Robe/Armor candidates:', clothFiles);
