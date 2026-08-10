import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const baseDir = path.join(process.cwd(), 'public/img/icons');

function getHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

function getSubfolderFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getSubfolderFiles(fullPath));
    } else if (file.toLowerCase().endsWith('.png')) {
      results.push({ fullPath, fileName: file, relPath: path.relative(baseDir, fullPath) });
    }
  });
  return results;
}

// Find all subdirectories directly inside baseDir
const subDirs = fs.readdirSync(baseDir).filter(name => {
  const fullPath = path.join(baseDir, name);
  return fs.statSync(fullPath).isDirectory();
});

console.log('Subdirectories to process:', subDirs);

let movedCount = 0;
let deletedDupesCount = 0;

for (const subDirName of subDirs) {
  const subDirPath = path.join(baseDir, subDirName);
  const files = getSubfolderFiles(subDirPath);

  for (const f of files) {
    const targetPath = path.join(baseDir, f.fileName);

    if (fs.existsSync(targetPath)) {
      // Check if identical or different
      if (f.fullPath.toLowerCase() !== targetPath.toLowerCase()) {
        const rootHash = getHash(targetPath);
        const subHash = getHash(f.fullPath);
        if (rootHash === subHash) {
          // Identical dupe -> remove subfolder copy safely
          fs.unlinkSync(f.fullPath);
          deletedDupesCount++;
        } else {
          console.warn(`⚠️ Warning: ${f.relPath} and ${f.fileName} in root have different contents! Overwriting target with subfolder version.`);
          fs.unlinkSync(targetPath);
          fs.renameSync(f.fullPath, targetPath);
          movedCount++;
        }
      }
    } else {
      // Move file to root
      fs.renameSync(f.fullPath, targetPath);
      movedCount++;
    }
  }
}

// Remove empty subdirectories recursively
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  if (list.length > 0) {
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        removeEmptyDirs(fullPath);
      }
    });
  }
  const remaining = fs.readdirSync(dir);
  if (remaining.length === 0 && dir !== baseDir) {
    fs.rmdirSync(dir);
    console.log(`Removed empty dir: ${path.relative(baseDir, dir)}`);
  }
}

removeEmptyDirs(baseDir);

const finalFiles = fs.readdirSync(baseDir).filter(f => f.toLowerCase().endsWith('.png'));
const finalDirs = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

console.log('\n=== ENCHATAMENTO DE ÍCONES CONCLUÍDO ===');
console.log(`- Arquivos movidos para a raiz: ${movedCount}`);
console.log(`- Duplicatas idênticas removidas: ${deletedDupesCount}`);
console.log(`- Total final de arquivos PNG na raiz de public/img/icons/: ${finalFiles.length}`);
console.log(`- Subpastas restantes: ${finalDirs.length}`);
