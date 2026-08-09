import fs from 'fs';
import path from 'path';

const artPath = path.join(process.cwd(), 'lineage-idle', 'art.js');
let artContent = fs.readFileSync(artPath, 'utf8');

// Replace /img/Monsters/... with /img/... in art.js
artContent = artContent.replace(/\/img\/Monsters\/(?:[^\/]+\/)?([^\s\"\'\`\,\)\;]+)/g, '/img/$1');

fs.writeFileSync(artPath, artContent);
console.log('Successfully updated art.js to use flat /img/ paths for all monsters!');
