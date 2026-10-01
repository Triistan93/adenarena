import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { selectPortraitSplit } from './lib/portrait-pair-layout.mjs';

const [sourcePath, maleFile, femaleFile, race, classId, className = classId] = process.argv.slice(2);
if (!sourcePath || !maleFile || !femaleFile) {
  throw new Error('Usage: node scripts/normalize_portrait_pair.mjs <transparent side-by-side source> <m_race_class.webp> <f_race_class.webp>');
}
for (const file of [maleFile, femaleFile]) {
  if (path.basename(file) !== file || !/^[mf]_[a-z0-9]+_[a-z0-9_]+\.webp$/i.test(file)) {
    throw new Error(`Portrait output must use the sex_race_class.webp convention: ${file}`);
  }
}

const source = sharp(sourcePath, { failOn: 'error' });
const metadata = await source.metadata();
if (!metadata.width || !metadata.height || metadata.width < 2) {
  throw new Error('The generated pair must have a side-by-side canvas at least two pixels wide.');
}

const sourcePixels = await source.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const opacityByColumn = new Array(metadata.width).fill(0);
for (let y = 0; y < metadata.height; y += 1) {
  for (let x = 0; x < metadata.width; x += 1) {
    if (sourcePixels.data[(y * metadata.width + x) * sourcePixels.info.channels + 3] > 4) {
      opacityByColumn[x] += 1;
    }
  }
}
const splitX = selectPortraitSplit(opacityByColumn);
const splitGutter = Math.max(4, Math.round(metadata.width * 0.005));

function findAlphaBounds({ data, info }) {
  const { width, height, channels } = info;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] <= 4) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < left || bottom < top) throw new Error('A portrait panel is empty.');
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function writePanel(side, outputFile) {
  const panelX = side === 'left' ? 0 : splitX + splitGutter;
  const panelWidth = side === 'left'
    ? splitX - splitGutter
    : metadata.width - panelX;
  const half = sharp(sourcePath)
    .extract({ left: panelX, top: 0, width: panelWidth, height: metadata.height })
    .ensureAlpha();
  const raw = await half.clone().raw().toBuffer({ resolveWithObject: true });
  const bounds = findAlphaBounds(raw);
  const outputPath = path.join('public', 'img', outputFile);
  await sharp(sourcePath)
    .extract({ ...bounds, left: bounds.left + panelX })
    .ensureAlpha()
    .resize(512, 600, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true
    })
    .webp({ quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true })
    .toFile(outputPath);

  const result = await sharp(outputPath).metadata();
  if (result.width !== 512 || result.height !== 600 || !result.hasAlpha) {
    throw new Error(`Output validation failed for ${outputPath}`);
  }
  return { file: outputPath, width: result.width, height: result.height, size: (await fs.stat(outputPath)).size, sourceBounds: bounds };
}

const [male, female] = await Promise.all([
  writePanel('left', maleFile),
  writePanel('right', femaleFile)
]);

if (race && classId) {
  const queuePath = 'scripts/class_portrait_queue.json';
  const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));
  const entry = queue.rows.find(row => row.race === race && row.classId === classId);
  if (!entry || entry.maleFile !== maleFile || entry.femaleFile !== femaleFile) {
    throw new Error(`Portrait pair does not match the registered queue entry: ${race}/${classId}`);
  }
  entry.status = 'generated';
  entry.source = sourcePath;
  entry.generatedAt = new Date().toISOString();
  entry.outputBytes = { male: male.size, female: female.size };
  queue.updatedAt = entry.generatedAt;
  queue.completedClasses = queue.rows.filter(row => row.status === 'generated').length;
  await fs.writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);

  const provenancePath = 'public/img/generated-portrait-provenance.json';
  const provenance = JSON.parse(await fs.readFile(provenancePath, 'utf8'));
  for (const [gender, result] of [['M', male], ['F', female]]) {
    const asset = `/img/${path.basename(result.file)}`;
    if (!provenance.some(row => row.asset === asset)) {
      provenance.push({
        asset,
        race,
        classId,
        className,
        gender,
        source: 'OpenAI image_gen built-in',
        sourceFile: sourcePath,
        format: 'WebP',
        dimensions: '512x600 RGBA',
        sizeBytes: result.size
      });
    }
  }
  await fs.writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
}

console.log(JSON.stringify({ source: sourcePath, male, female }, null, 2));
