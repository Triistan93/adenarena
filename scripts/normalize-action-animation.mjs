import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Normalize generated poses by their connected silhouettes, not an assumed grid:
// long weapons can cross the generator's nominal cell boundaries.
const [source, name] = process.argv.slice(2);
if (!source || !/^[a-z-]+$/.test(name)) throw new Error('Usage: node scripts/normalize-action-animation.mjs SOURCE NAME');
const { data, info: { width, height } } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const labels = new Int32Array(width * height);
const stack = new Int32Array(width * height);
const parts = [];
let id = 0;
for (let p = 0; p < labels.length; p++) {
  if (labels[p] || data[p * 4 + 3] < 32) continue;
  id++;
  let n = 1, count = 0, left = width, right = 0, top = height, bottom = 0;
  stack[0] = p; labels[p] = id;
  while (n) {
    const q = stack[--n], x = q % width, y = Math.floor(q / width);
    count++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    for (const [xx, yy] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      if (xx < 0 || xx >= width || yy < 0 || yy >= height) continue;
      const next = yy * width + xx;
      if (!labels[next] && data[next * 4 + 3] >= 32) { labels[next] = id; stack[n++] = next; }
    }
  }
  if (count > 1500) parts.push({ id, count, left, right, top, bottom });
}
if (parts.length !== 8 && parts.length !== 12) throw new Error(`Expected 8 or 12 separate poses; found ${parts.length}. Inspect source before importing.`);
parts.sort((a,b) => a.bottom - b.bottom);
const rows = parts.length / 4;
const frames = Array.from({length: rows}, (_, row) => parts.slice(row*4,row*4+4).sort((a,b) => a.left-b.left)).flat();
for (const f of frames) {
  let footLeft = width, footRight = 0;
  for (let y = f.bottom - 20; y <= f.bottom; y++) for (let x = f.left; x <= f.right; x++) {
    if (labels[y * width + x] === f.id) { footLeft = Math.min(footLeft,x); footRight = Math.max(footRight,x); }
  }
  f.anchor = (footLeft + footRight) / 2;
}
const cellW = 384, cellH = 288, anchorX = 156, baseline = 276;
const heights = frames.map(f => f.bottom-f.top+1).sort((a,b)=>a-b);
const median = heights[Math.floor(heights.length/2)];
const scale = Math.min(230/median, ...frames.map(f => Math.min(
  (anchorX-12)/(f.anchor-f.left+3), (cellW-anchorX-12)/(f.right-f.anchor+3),
  (baseline-12)/(f.bottom-f.top+5)
)));
const overlays = [];
for (let index=0; index<frames.length; index++) {
  const f=frames[index], l=Math.max(0,f.left-2), t=Math.max(0,f.top-2);
  const w=Math.min(width-1,f.right+2)-l+1, h=Math.min(height-1,f.bottom+2)-t+1;
  const pixels=Buffer.alloc(w*h*4);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const sourceIndex=(y+t)*width+x+l;
    let belongs=labels[sourceIndex]===f.id;
    if(!belongs && data[sourceIndex*4+3]>0 && data[sourceIndex*4+3]<32) {
      for(let yy=Math.max(0,y+t-2);yy<=Math.min(height-1,y+t+2)&&!belongs;yy++)
        for(let xx=Math.max(0,x+l-2);xx<=Math.min(width-1,x+l+2);xx++) if(labels[yy*width+xx]===f.id){belongs=true;break;}
    }
    if(belongs) data.copy(pixels,(y*w+x)*4,sourceIndex*4,sourceIndex*4+4);
  }
  const resized=await sharp(pixels,{raw:{width:w,height:h,channels:4}}).resize(Math.round(w*scale),Math.round(h*scale)).png().toBuffer();
  overlays.push({input:resized,left:(index%4)*cellW+Math.round(anchorX-(f.anchor-l)*scale),top:Math.floor(index/4)*cellH+Math.round(baseline-(f.bottom-t)*scale)});
}
const out=path.resolve('public/action-prototype/animations');
await mkdir(out,{recursive:true});
await sharp({create:{width:cellW*4,height:cellH*rows,channels:4,background:'#00000000'}}).composite(overlays).webp({quality:88,alphaQuality:100}).toFile(path.join(out,`${name}.webp`));
await writeFile(path.join(out,`${name}.json`),JSON.stringify({source:path.basename(source),tool:'built-in ImageGen',columns:4,rows,cellW,cellH,anchorX,baseline,scale,frames},null,2));
console.log(`${name}: ${frames.length} poses normalized, scale ${scale.toFixed(3)}, ${cellW*4}x${cellH*rows}`);
