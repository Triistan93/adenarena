import fs from 'fs';
import path from 'path';

const baseDir = path.join(process.cwd(), 'public/img/icons');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath));
    } else if (file.toLowerCase().endsWith('.png')) {
      results.push({ fullPath, relPath, fileName: file, inRoot: !relPath.includes('/') });
    }
  });
  return results;
}

const allFiles = getFiles(baseDir);
const rootFiles = allFiles.filter(f => f.inRoot);
const subDirFiles = allFiles.filter(f => !f.inRoot);

console.log(`=== INVENTÁRIO ATUAL DE public/img/icons ===`);
console.log(`Total de arquivos PNG encontrados: ${allFiles.length}`);
console.log(`- Arquivos na raiz de public/img/icons/: ${rootFiles.length}`);
console.log(`- Arquivos em subpastas: ${subDirFiles.length}`);

// Subfolder breakdown
const folderCounts = {};
subDirFiles.forEach(f => {
  const topFolder = f.relPath.split('/')[0];
  folderCounts[topFolder] = (folderCounts[topFolder] || 0) + 1;
});

console.log('\nDetalhamento por subpasta:');
for (const [folder, count] of Object.entries(folderCounts)) {
  console.log(`  - ${folder}/: ${count} arquivos`);
}
