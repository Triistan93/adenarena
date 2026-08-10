import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
      const buffer = fs.readFileSync(fullPath);
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      results.push({ fullPath, relPath, fileName: file, size: stat.size, hash });
    }
  });
  return results;
}

const allFiles = getFiles(baseDir);

// Map by lowercase filename
const filenameMap = {};
for (const file of allFiles) {
  const lowerName = file.fileName.toLowerCase();
  filenameMap[lowerName] = filenameMap[lowerName] || [];
  filenameMap[lowerName].push(file);
}

const collisions = [];
for (const [name, files] of Object.entries(filenameMap)) {
  if (files.length > 1) {
    const hashes = new Set(files.map(f => f.hash));
    collisions.push({
      fileName: name,
      count: files.length,
      isIdentical: hashes.size === 1,
      files
    });
  }
}

console.log(`=== DETECÇÃO DE COLISÕES DE NOME DE ARQUIVO ===`);
console.log(`Total de nomes colidentes: ${collisions.length}`);

const identicalCollisions = collisions.filter(c => c.isIdentical);
const differentCollisions = collisions.filter(c => !c.isIdentical);

console.log(`- Colisões com arquivos IDÊNTICOS (mesmo hash MD5): ${identicalCollisions.length}`);
console.log(`- Colisões com arquivos DIFERENTES (hash MD5 distinto): ${differentCollisions.length}`);

if (differentCollisions.length > 0) {
  console.log('\n❌ ATENÇÃO: COLISÕES COM CONTEÚDO DIFERENTE:');
  differentCollisions.forEach((c, idx) => {
    console.log(`\nColisão #${idx + 1}: "${c.fileName}" (${c.count} arquivos diferentes)`);
    c.files.forEach(f => {
      console.log(`  - Path: ${f.relPath} (Size: ${f.size} bytes, MD5: ${f.hash})`);
    });
  });
} else {
  console.log('\n✅ NENHUMA colisão com conteúdo diferente encontrada! Todas as colisões são duplicadas 100% idênticas.');
}

if (identicalCollisions.length > 0) {
  console.log('\nResumo de colisões 100% idênticas (podem ser unificadas com segurança):');
  identicalCollisions.forEach((c, idx) => {
    console.log(`  ${idx + 1}. "${c.fileName}" -> ${c.files.map(f => f.relPath).join(' vs ')}`);
  });
}
