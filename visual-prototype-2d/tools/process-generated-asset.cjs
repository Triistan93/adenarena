/**
 * process-generated-asset.js
 * 
 * Pipeline tool to convert raw AI-generated assets into game-ready transparent spritesheets.
 * 
 * Usage:
 *   node tools/process-generated-asset.js <classKey> <animKey> <inputImagePath> <frameCount>
 * 
 * Example:
 *   node tools/process-generated-asset.js human/sorcerer attack public/assets/characters/human/sorcerer/raw_attack.jpg 5
 *   node tools/process-generated-asset.js human/sorcerer master public/assets/characters/human/sorcerer/master_v1.jpg 1
 */

const fs = require('fs');
const path = require('path');
const sharp = require('../../node_modules/sharp');

const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: node tools/process-generated-asset.js <classKey> <animKey> <inputPath> <frameCount>');
  process.exit(1);
}

const [classKey, animKey, inputPath, frameCountStr] = args;
const frameCount = parseInt(frameCountStr, 10);
const targetFrameSize = 128;

async function run() {
  const absInput = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(absInput)) {
    console.error('File not found:', absInput);
    process.exit(1);
  }

  console.log(`Processing ${classKey} [${animKey}] with ${frameCount} frames from ${inputPath}...`);

  const { data, info } = await sharp(absInput)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const rgba = Buffer.alloc(width * height * 4);
  const isBg = new Uint8Array(width * height);

  function isCheckerColor(r, g, b) {
    const diffRG = Math.abs(r - g);
    const diffGB = Math.abs(g - b);
    const diffRB = Math.abs(r - b);
    return diffRG <= 12 && diffGB <= 12 && diffRB <= 12 && (r >= 55 && r <= 150);
  }

  const queue = [];
  function pushBorder(x, y) {
    const idx = y * width + x;
    const rIdx = idx * 3;
    if (isCheckerColor(data[rIdx], data[rIdx+1], data[rIdx+2])) {
      isBg[idx] = 1;
      queue.push(idx);
    }
  }

  for (let x = 0; x < width; x++) {
    pushBorder(x, 0);
    pushBorder(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushBorder(0, y);
    pushBorder(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (const n of neighbors) {
      if (n !== -1 && !isBg[n]) {
        const nrIdx = n * 3;
        if (isCheckerColor(data[nrIdx], data[nrIdx+1], data[nrIdx+2])) {
          isBg[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  for (let i = 0; i < width * height; i++) {
    const srcIdx = i * 3;
    const dstIdx = i * 4;
    rgba[dstIdx] = data[srcIdx];
    rgba[dstIdx+1] = data[srcIdx+1];
    rgba[dstIdx+2] = data[srcIdx+2];
    rgba[dstIdx+3] = isBg[i] ? 0 : 255;
  }

  const outDir = path.resolve(process.cwd(), 'public/assets/characters', classKey);
  fs.mkdirSync(outDir, { recursive: true });

  if (animKey === 'master') {
    const outPath = path.join(outDir, 'master.png');
    await sharp(rgba, { raw: { width, height, channels: 4 } })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`Saved Master Sheet: ${outPath}`);
    return;
  }

  // Animation strip processing
  const transparentRaw = await sharp(rgba, { raw: { width, height, channels: 4 } }).png().toBuffer();
  const frameWidth = Math.floor(width / frameCount);
  const croppedFrames = [];

  for (let i = 0; i < frameCount; i++) {
    const left = i * frameWidth;
    const frameBuffer = await sharp(transparentRaw)
      .extract({ left, top: 0, width: frameWidth, height })
      .resize(targetFrameSize, targetFrameSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    croppedFrames.push({
      input: frameBuffer,
      left: i * targetFrameSize,
      top: 0
    });
  }

  const outPath = path.join(outDir, `${animKey}.png`);
  await sharp({
    create: {
      width: targetFrameSize * frameCount,
      height: targetFrameSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite(croppedFrames)
  .png()
  .toFile(outPath);

  console.log(`Saved ${animKey} Strip (${targetFrameSize * frameCount}x${targetFrameSize}, ${frameCount} frames): ${outPath}`);
}

run().catch(console.error);
