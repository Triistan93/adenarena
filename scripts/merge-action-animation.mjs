import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [name] = process.argv.slice(2);
if (!/^[a-z-]+$/.test(name)) throw new Error('Usage: node scripts/merge-action-animation.mjs warrior|ranger|mage');
const dir = path.resolve('public/action-prototype/animations');
const walkPath = path.join(dir, `${name}.webp`);
const runPath = path.join(dir, `${name}-run.webp`);
const walkMeta = JSON.parse(await readFile(path.join(dir, `${name}.json`), 'utf8'));
const runMeta = JSON.parse(await readFile(path.join(dir, `${name}-run.json`), 'utf8'));
if (walkMeta.rows !== 3 || runMeta.rows !== 2) throw new Error('Expected a 12-frame base and an 8-frame run cycle');
const output = await sharp({ create: { width: 1536, height: 1440, channels: 4, background: '#00000000' } })
  .composite([
    { input: walkPath, left: 0, top: 0 },
    { input: runPath, left: 0, top: 576 },
    { input: await sharp(walkPath).extract({ left: 0, top: 576, width: 1536, height: 288 }).png().toBuffer(), left: 0, top: 1152 },
  ])
  .webp({ quality: 88, alphaQuality: 100 }).toBuffer();
await sharp(output).toFile(walkPath);
await writeFile(path.join(dir, `${name}.json`), JSON.stringify({ ...walkMeta, rows: 5, frameOrder: ['walk:0-7', 'run:8-15', 'attack:16-19'], runSource: runMeta.source }, null, 2));
console.log(`${name}: merged 8 walk, 8 run and 4 attack poses`);
