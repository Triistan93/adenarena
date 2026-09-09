/**
 * assemble-sprite-strip.js
 *
 * Analyzes an image strip and reports frame metadata for the renderer.
 * Usage: node tools/assemble-sprite-strip.js <input-image> <frameCount> [frameWidth=128]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const [inputFile, frameCountArg, frameWidthArg] = args;

if (!inputFile) {
  console.error('Usage: node tools/assemble-sprite-strip.js <input-image> [frameCount=4] [frameWidth=128]');
  process.exit(1);
}

const frameCount = parseInt(frameCountArg) || 4;
const expectedFrameWidth = parseInt(frameWidthArg) || 128;

const absInput = path.resolve(process.cwd(), inputFile);
if (!fs.existsSync(absInput)) {
  console.error('File not found:', absInput);
  process.exit(1);
}

const buf = fs.readFileSync(absInput);
let width = null, height = null, format = 'UNKNOWN';

if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
  format = 'PNG';
  width = buf.readUInt32BE(16);
  height = buf.readUInt32BE(20);
  const hasAlpha = buf[25]; // Color type: 6=RGBA, 2=RGB
  format = hasAlpha === 6 ? 'PNG-RGBA' : 'PNG-RGB';
} else if (buf[0] === 0xFF && buf[1] === 0xD8) {
  format = 'JPG (no alpha - needs conversion)';
}

const frameW = width ? Math.floor(width / frameCount) : expectedFrameWidth;
const heightOk = height ? height === 128 : null;

const report = {
  file: inputFile,
  format,
  dimensions: width ? ${width}x : 'unknown (JPG)',
  frameCount,
  frameWidth: frameW,
  frameHeight: height || '?',
  heightBaseline128: heightOk === null ? 'unknown' : heightOk ? 'PASS' : FAIL (got ),
  hasAlpha: format.includes('RGBA') ? 'YES' : format.includes('JPG') ? 'NO - needs PNG conversion' : 'NO',
  rendererConfig: {
    frameWidth: frameW,
    frameHeight: height || 128,
    frameCount,
    fps: 8
  }
};

console.log('\n=== Sprite Strip Analysis ===');
console.log(JSON.stringify(report, null, 2));

if (format.includes('JPG')) {
  console.log('\n??  JPG detected — no transparency. To convert:');
  console.log('   Option 1 (ImageMagick): magick "' + absInput + '" -alpha set PNG32:"output.png"');
  console.log('   Option 2: Use remove.bg API or similar to strip background');
  console.log('   Option 3: Open in Photoshop/GIMP and export as PNG-32 with alpha');
}
