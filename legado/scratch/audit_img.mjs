import fs from 'fs';
import path from 'path';

const publicImg = path.join(process.cwd(), 'public', 'img');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allPhysicalFiles = getAllFiles(publicImg).map(p => '/' + path.relative(process.cwd(), p).replace(/\\/g, '/').replace(/^public\//, ''));
console.log('Total physical files in public/img:', allPhysicalFiles.length);

const artContent = fs.readFileSync(path.join(process.cwd(), 'lineage-idle', 'art.js'), 'utf8');
const matches = [...new Set([...artContent.matchAll(/\/img\/[^\s\"\'\`\,\)\;]+/g)].map(m => m[0]))];
console.log('Total unique /img/ references in art.js:', matches.length);

const missingExact = [];
const missingCaseInsensitive = [];

matches.forEach(ref => {
  const exact = allPhysicalFiles.find(p => p === ref);
  if (!exact) {
    const ci = allPhysicalFiles.find(p => p.toLowerCase() === ref.toLowerCase());
    if (ci) {
      missingCaseInsensitive.push({ ref, actual: ci });
    } else {
      missingExact.push(ref);
    }
  }
});

console.log(`\n--- Case mismatch (${missingCaseInsensitive.length}) ---`);
missingCaseInsensitive.forEach(item => console.log(`REF: ${item.ref} -> ACTUAL: ${item.actual}`));

console.log(`\n--- Missing from disk entirely (${missingExact.length}) ---`);
missingExact.forEach(ref => {
  const filename = path.basename(ref);
  const candidate = allPhysicalFiles.find(p => p.toLowerCase().endsWith('/' + filename.toLowerCase()));
  console.log(`REF: ${ref} -> CANDIDATE ON DISK: ${candidate || 'NONE'}`);
});
