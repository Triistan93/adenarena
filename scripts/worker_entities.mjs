import fs from 'fs';
import path from 'path';

const BUILD_ID = 'sRbEmMLJYOB77GXDn39Xw';
const BASE_URL = `https://l2bandit.camp/_next/data/${BUILD_ID}`;
const OUTPUT_DIR = path.resolve('scraped_data_bandit');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json'
};

const CONCURRENCY = 8;

async function fetchWithRetry(url, retries = 4, delay = 500) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        throw new Error(`Failed to fetch ${url} after ${retries} attempts: ${err.message}`);
      }
      const backoff = delay * Math.pow(1.5, attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
}

async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveJson(relPath, data) {
  const fullPath = path.join(OUTPUT_DIR, relPath);
  ensureDir(fullPath);
  const jsonStr = JSON.stringify(data, null, 2);
  fs.writeFileSync(fullPath, jsonStr, 'utf8');
  const stat = fs.statSync(fullPath);
  return { path: fullPath, size: stat.size };
}

async function scrapeClasses() {
  console.log('\n[Classes] Fetching class trees...');
  const url = `${BASE_URL}/classes.json`;
  const json = await fetchWithRetry(url);
  const classes = json.pageProps?.classes || [];
  const info = saveJson('other/classes.json', classes);
  console.log(`[Classes] Saved ${classes.length} classes to ${info.path} (${(info.size / 1024).toFixed(1)} KB)`);
  return { category: 'Classes', count: classes.length, path: 'scraped_data_bandit/other/classes.json', size: info.size };
}

async function scrapeLocations() {
  console.log('\n[Locations] Fetching territories & locations...');
  const url = `${BASE_URL}/locations.json`;
  const json = await fetchWithRetry(url);
  const territories = json.pageProps?.territories || [];
  const info = saveJson('other/locations.json', territories);
  console.log(`[Locations] Saved ${territories.length} territories to ${info.path} (${(info.size / 1024).toFixed(1)} KB)`);
  return { category: 'Locations', count: territories.length, path: 'scraped_data_bandit/other/locations.json', size: info.size };
}

async function scrapeSkills() {
  const totalPages = 51;
  console.log(`\n[Skills] Fetching ${totalPages} pages (concurrency: ${CONCURRENCY})...`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  let completed = 0;
  const pageData = await mapConcurrent(pages, CONCURRENCY, async (page) => {
    const url = `${BASE_URL}/skills.json?page=${page}`;
    const json = await fetchWithRetry(url);
    completed++;
    if (completed % 10 === 0 || completed === totalPages) {
      console.log(`[Skills] Progress: ${completed}/${totalPages} pages fetched`);
    }
    return json.pageProps?.skills || [];
  });

  const allSkills = pageData.flat();
  const info = saveJson('other/skills.json', allSkills);
  console.log(`[Skills] Saved ${allSkills.length} skills to ${info.path} (${(info.size / (1024 * 1024)).toFixed(2)} MB)`);
  return { category: 'Skills', count: allSkills.length, path: 'scraped_data_bandit/other/skills.json', size: info.size };
}

async function scrapeBosses() {
  const totalPages = 5;
  console.log(`\n[Bosses] Fetching ${totalPages} pages...`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const pageData = await mapConcurrent(pages, CONCURRENCY, async (page) => {
    const url = `${BASE_URL}/bosses.json?page=${page}`;
    const json = await fetchWithRetry(url);
    console.log(`[Bosses] Fetched page ${page}/${totalPages} (${json.pageProps?.bosses?.length || 0} bosses)`);
    return json.pageProps?.bosses || [];
  });

  const allBosses = pageData.flat();
  const info = saveJson('npc/bosses.json', allBosses);
  console.log(`[Bosses] Saved ${allBosses.length} bosses to ${info.path} (${(info.size / (1024 * 1024)).toFixed(2)} MB)`);
  return { category: 'Bosses', count: allBosses.length, path: 'scraped_data_bandit/npc/bosses.json', size: info.size };
}

async function scrapeMammons() {
  console.log('\n[Mammons] Fetching Merchant & Blacksmith of Mammon...');
  const urls = [
    `${BASE_URL}/citizens/merchant_of_mammon.json`,
    `${BASE_URL}/citizens/blacksmith_of_mammon.json`
  ];

  const mammons = await Promise.all(
    urls.map(async (url) => {
      const json = await fetchWithRetry(url);
      return json.pageProps?.citizen;
    })
  );

  const info = saveJson('npc/mammons.json', mammons);
  console.log(`[Mammons] Saved ${mammons.length} mammons to ${info.path} (${(info.size / 1024).toFixed(1)} KB)`);
  return { category: 'Mammons', count: mammons.length, path: 'scraped_data_bandit/npc/mammons.json', size: info.size };
}

async function scrapeMonsters() {
  const totalPages = 58;
  console.log(`\n[Monsters] Fetching ${totalPages} pages (concurrency: ${CONCURRENCY})...`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  let completed = 0;
  const pageData = await mapConcurrent(pages, CONCURRENCY, async (page) => {
    const url = `${BASE_URL}/monsters.json?page=${page}`;
    const json = await fetchWithRetry(url);
    completed++;
    if (completed % 10 === 0 || completed === totalPages) {
      console.log(`[Monsters] Progress: ${completed}/${totalPages} pages fetched`);
    }
    return json.pageProps?.monsters || [];
  });

  const allMonsters = pageData.flat();
  const info = saveJson('npc/monsters.json', allMonsters);
  console.log(`[Monsters] Saved ${allMonsters.length} monsters to ${info.path} (${(info.size / (1024 * 1024)).toFixed(2)} MB)`);
  return { category: 'Monsters', count: allMonsters.length, path: 'scraped_data_bandit/npc/monsters.json', size: info.size };
}

async function scrapeCitizens() {
  const totalPages = 38;
  console.log(`\n[Citizens] Fetching ${totalPages} pages (concurrency: ${CONCURRENCY})...`);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  let completed = 0;
  const pageData = await mapConcurrent(pages, CONCURRENCY, async (page) => {
    const url = `${BASE_URL}/citizens.json?page=${page}`;
    const json = await fetchWithRetry(url);
    completed++;
    if (completed % 10 === 0 || completed === totalPages) {
      console.log(`[Citizens] Progress: ${completed}/${totalPages} pages fetched`);
    }
    return json.pageProps?.citizens || [];
  });

  const allCitizens = pageData.flat();
  const info = saveJson('npc/citizens.json', allCitizens);
  console.log(`[Citizens] Saved ${allCitizens.length} citizens to ${info.path} (${(info.size / (1024 * 1024)).toFixed(2)} MB)`);
  return { category: 'Citizens', count: allCitizens.length, path: 'scraped_data_bandit/npc/citizens.json', size: info.size };
}

async function main() {
  console.log('=====================================================');
  console.log('  L2Bandit.camp World & Entities Scraper Starting    ');
  console.log('=====================================================');
  const startTime = Date.now();

  const results = [];
  try {
    results.push(await scrapeClasses());
    results.push(await scrapeLocations());
    results.push(await scrapeSkills());
    results.push(await scrapeBosses());
    results.push(await scrapeMammons());
    results.push(await scrapeMonsters());
    results.push(await scrapeCitizens());

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n=====================================================');
    console.log(`  Scraping Completed Successfully in ${elapsed}s!   `);
    console.log('=====================================================');
    console.table(results.map(r => ({
      Category: r.category,
      Count: r.count,
      'File Size': `${(r.size / 1024).toFixed(1)} KB`,
      Path: r.path
    })));

    const totalCount = results.reduce((sum, r) => sum + r.count, 0);
    console.log(`Total Entities Scraped: ${totalCount}`);
  } catch (err) {
    console.error('\nFatal Scraping Error:', err);
    process.exit(1);
  }
}

main();
