import fs from 'fs';
import { CLASS_ALIASES } from '../lineage-idle/src/data/classes/class_aliases.js';

const canonicalTree = JSON.parse(fs.readFileSync('scraped_data_wiki/classes_tree_canonical.json', 'utf8'));

// Build canonical set
const canonicalIds = new Set();
for (const race of canonicalTree) {
  for (const b of race.branches) {
    canonicalIds.add(b.base);
    canonicalIds.add(b.first);
    canonicalIds.add(b.second);
    canonicalIds.add(b.third);
  }
}

console.log('Total Canonical IDs:', canonicalIds.size);

const migrationTable = [];
const conflicts = [];

// For each alias in CLASS_ALIASES, find where it maps
for (const [legacyId, target] of Object.entries(CLASS_ALIASES)) {
  // If target is already canonical
  if (canonicalIds.has(target)) {
    migrationTable.push({
      legacyId,
      canonicalId: target,
      confidence: 'EXACT',
      reason: 'Direct match to canonical ID'
    });
  } else {
    // Check if target has a snake_case equivalent or direct match
    const snake = target.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (canonicalIds.has(snake)) {
      migrationTable.push({
        legacyId,
        canonicalId: snake,
        confidence: 'HIGH',
        reason: `CamelCase ${target} maps to canonical ${snake}`
      });
    } else {
      conflicts.push({ legacyId, target });
    }
  }
}

console.log('Mapped Aliases:', migrationTable.length);
console.log('Unmapped / Conflicts:', conflicts.length);
if (conflicts.length > 0) {
  console.log('Conflicts:', conflicts.slice(0, 20));
}
