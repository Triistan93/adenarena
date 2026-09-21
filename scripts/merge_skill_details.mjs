import fs from 'fs';
import path from 'path';

const outDetailedPath = path.resolve('scraped_data_wiki/passives_detailed.json');
const rawDir = path.resolve('scraped_data_wiki/raw_passives');

const allDetailed = [];
for (let i = 0; i < 4; i++) {
  const p = path.join(rawDir, `skill_details_chunk_${i}.json`);
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(`Chunk ${i}: loaded ${data.length} skills`);
    allDetailed.push(...data);
  } else {
    console.log(`Chunk ${i}: not found yet`);
  }
}

console.log(`Total detailed passives loaded: ${allDetailed.length}`);
fs.writeFileSync(outDetailedPath, JSON.stringify(allDetailed, null, 2));
console.log(`Saved to ${outDetailedPath}`);
