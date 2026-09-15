import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve('scraped_data_bandit');
const IMAGES_DIR = path.join(BASE_DIR, 'images');
const ICON_BASE_URL = 'https://l2bandit.camp/icons';

fs.mkdirSync(IMAGES_DIR, { recursive: true });

function collectIcons(obj, iconSet = new Set()) {
  if (!obj) return iconSet;
  if (typeof obj === 'string') {
    if (obj.endsWith('.webp') || obj.endsWith('.png') || obj.endsWith('.jpg')) {
      const fileName = path.basename(obj);
      if (fileName && fileName.length > 3) {
        iconSet.add(fileName);
      }
    }
  } else if (Array.isArray(obj)) {
    for (const item of obj) {
      collectIcons(item, iconSet);
    }
  } else if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      collectIcons(obj[k], iconSet);
    }
  }
  return iconSet;
}

function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'images') {
        findJsonFiles(fullPath, fileList);
      }
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

export async function runImageDownload() {
  console.log('[Images] Scanning scraped JSON files for icons...');
  const jsonFiles = findJsonFiles(BASE_DIR);
  console.log(`[Images] Found ${jsonFiles.length} JSON files to inspect.`);

  const allIcons = new Set();
  for (const f of jsonFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      collectIcons(data, allIcons);
    } catch (e) {
      console.warn(`  Warning reading ${f}:`, e.message);
    }
  }

  console.log(`[Images] Found ${allIcons.size} unique icons.`);
  if (allIcons.size === 0) {
    console.log('[Images] No icons found to download yet.');
    return;
  }

  const queue = Array.from(allIcons);
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;

  const CONCURRENCY = 15;
  async function worker() {
    while (queue.length > 0) {
      const fileName = queue.shift();
      if (!fileName) continue;

      const dest = path.join(IMAGES_DIR, fileName);
      if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
        skipped++;
        continue;
      }

      const url = `${ICON_BASE_URL}/${fileName}`;
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(dest, buf);
          downloaded++;
        } else {
          errors++;
        }
      } catch (e) {
        errors++;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`[Images] Finished: ${downloaded} downloaded, ${skipped} skipped (already cached), ${errors} errors/not found.`);
}

if (process.argv[1]?.includes('download_bandit_icons')) {
  runImageDownload().catch(console.error);
}
