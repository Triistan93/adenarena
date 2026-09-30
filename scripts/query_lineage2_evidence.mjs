import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'knowledge/lineage2/ertheia_european_roster_evidence.json');

export function retrieveErtheiaEvidence(query, { limit = 5, classId = null } = {}) {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const terms = String(query || '').toLowerCase().match(/[a-z0-9']+/g) || [];
  const chunks = classId ? index.chunks.filter(chunk => chunk.classId === classId) : index.chunks;
  const scored = chunks.map(chunk => {
    const searchable = [chunk.classId, chunk.sourceClass, chunk.sourceExcerpt, ...chunk.skillIds].join(' ').toLowerCase();
    const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
    return { score, chunk };
  }).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.chunk.classId.localeCompare(b.chunk.classId));
  return scored.slice(0, Math.max(0, limit)).map(({ score, chunk }) => ({
    score,
    ...chunk,
    source: index.source,
    rules: index.rules
  }));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = retrieveErtheiaEvidence(process.argv.slice(2).join(' '));
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
}
