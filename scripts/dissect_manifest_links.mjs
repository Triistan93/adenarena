import fs from 'fs';
import { CANONICAL_CLASS_REGISTRY } from '../lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';

const manifest = JSON.parse(fs.readFileSync('./docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json', 'utf8'));
const links = manifest.classSkillLinks;

console.log('Total links in manifest:', links.length);

// Count links per class
const linksByClass = {};
for (const link of links) {
  linksByClass[link.classId] = linksByClass[link.classId] || [];
  linksByClass[link.classId].push(link);
}

console.log('Classes with links in manifest:', Object.keys(linksByClass).length);

// Check classes in CANONICAL_CLASS_REGISTRY (159 total)
const allClasses = Object.keys(CANONICAL_CLASS_REGISTRY);
console.log('Total classes in CANONICAL_CLASS_REGISTRY:', allClasses.length);

const zeroLinks = [];
const partialLinks = [];
const fiveLinks = [];
const otherLinks = [];

for (const id of allClasses) {
  const count = linksByClass[id]?.length || 0;
  if (count === 0) zeroLinks.push(id);
  else if (count === 5) fiveLinks.push(id);
  else if (count < 5) partialLinks.push({ id, count });
  else otherLinks.push({ id, count });
}

console.log(`Classes with 0 links (${zeroLinks.length}):`, zeroLinks);
console.log(`Classes with partial links (${partialLinks.length}):`, partialLinks);
console.log(`Classes with 5 links (${fiveLinks.length}):`, fiveLinks.length);
console.log(`Classes with >5 links (${otherLinks.length}):`, otherLinks);

// Let's check how many total links in fiveLinks:
console.log('Total links from 5-link classes:', fiveLinks.length * 5);
// Plus partial links:
const partialSum = partialLinks.reduce((acc, p) => acc + p.count, 0);
console.log('Total links from partial classes:', partialSum);
console.log('Sum =', fiveLinks.length * 5 + partialSum);
