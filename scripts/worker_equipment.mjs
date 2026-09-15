/**
 * scripts/worker_equipment.mjs
 *
 * Equipment & Multicraft Scraper for L2Bandit.camp
 * Scrapes:
 *  1. Multicraft: craft_book.json, armor_sets.json, jewelry_sets.json
 *  2. Weapons: 11 subtypes + consolidated weapons.json
 *  3. Armors: 8 subtypes + consolidated armors.json
 *  4. Accessories: 3 subtypes + consolidated accessories.json
 *  5. Other: shots.json, resources.json
 */

import fs from 'fs';
import path from 'path';

const BUILD_ID = 'sRbEmMLJYOB77GXDn39Xw';
const BASE_URL = `https://l2bandit.camp/_next/data/${BUILD_ID}`;
const BASE_DIR = path.resolve('scraped_data_bandit');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*'
};

// Concurrency helper
async function mapConcurrent(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// Fetch with retry & timeout
async function fetchJsonWithRetry(url, retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        headers: HEADERS,
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        console.error(`  [ERROR] Failed to fetch ${url} after ${retries} attempts: ${err.message}`);
        throw err;
      }
      console.warn(`  [WARN] Attempt ${attempt} failed for ${url} (${err.message}). Retrying in ${delayMs}ms...`);
      await new Promise(r => setTimeout(r, delayMs));
      delayMs *= 1.5;
    }
  }
}

function saveJson(relPath, data) {
  const fullPath = path.join(BASE_DIR, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
}

function formatUnitItem(rawItem, category, subtype) {
  const stats = rawItem.stats || {};
  const formatted = {
    ...rawItem,
    category,
    subtype,
    type: rawItem.type || subtype
  };

  if (stats.pAtk !== undefined) formatted.pAtk = stats.pAtk;
  if (stats.mAtk !== undefined) formatted.mAtk = stats.mAtk;
  if (stats.pDef !== undefined) formatted.pDef = stats.pDef;
  if (stats.mDef !== undefined) formatted.mDef = stats.mDef;
  if (stats.mp !== undefined) formatted.mp = stats.mp;

  return formatted;
}

/**
 * Fetch all pages for a unit type until list is empty
 */
async function fetchAllUnitPages(type, category) {
  const allItems = [];
  let page = 1;
  let totalCount = null;
  let limitPerPage = 50;

  // First page fetch
  const url1 = `${BASE_URL}/units.json?type=${type}&page=${page}`;
  const json1 = await fetchJsonWithRetry(url1);
  const data1 = json1.pageProps?.data || {};
  const list1 = data1.list || [];
  totalCount = json1.pageProps?.totalUnitsCount ?? list1.length;
  limitPerPage = json1.pageProps?.limitPerPage ?? 50;

  for (const it of list1) {
    allItems.push(formatUnitItem(it, category, type));
  }

  const totalPages = Math.ceil(totalCount / limitPerPage);

  if (totalPages > 1) {
    const remainingPages = [];
    for (let p = 2; p <= totalPages; p++) {
      remainingPages.push(p);
    }

    const remainingResults = await mapConcurrent(remainingPages, 4, async (p) => {
      const url = `${BASE_URL}/units.json?type=${type}&page=${p}`;
      const json = await fetchJsonWithRetry(url);
      return json.pageProps?.data?.list || [];
    });

    for (const pageList of remainingResults) {
      for (const it of pageList) {
        allItems.push(formatUnitItem(it, category, type));
      }
    }
  }

  return allItems;
}

async function main() {
  console.log('====================================================');
  console.log('Starting Equipment & Multicraft Scraper (L2Bandit)');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Base Dir: ${BASE_DIR}`);
  console.log('====================================================\n');

  const summary = {
    multicraft: {},
    weapons: {},
    armors: {},
    accessories: {},
    other: {}
  };

  // 1. Multicraft
  console.log('--- [1/5] Scraping Multicraft Data ---');

  // 1.1 Craft book (pages 1 to 15)
  console.log('Scraping Craft Book (15 pages)...');
  const craftPages = Array.from({ length: 15 }, (_, i) => i + 1);
  const craftResults = await mapConcurrent(craftPages, 5, async (p) => {
    const url = `${BASE_URL}/craft-calculator.json?page=${p}`;
    const json = await fetchJsonWithRetry(url);
    const list = json.pageProps?.list || [];
    console.log(`  Craft Book Page ${p}/15: fetched ${list.length} recipes`);
    return list;
  });

  const allCraftBook = craftResults.flat();
  saveJson('multicraft/craft_book.json', allCraftBook);
  summary.multicraft['Craft Book (craft_book.json)'] = allCraftBook.length;
  console.log(`[OK] Saved ${allCraftBook.length} recipes to multicraft/craft_book.json\n`);

  // 1.2 Armor Sets
  console.log('Scraping Armor Sets...');
  const armorSetsUrl = `${BASE_URL}/armor-sets.json`;
  const armorSetsJson = await fetchJsonWithRetry(armorSetsUrl);
  const armorSets = armorSetsJson.pageProps?.armorSets || [];
  saveJson('multicraft/armor_sets.json', armorSets);
  summary.multicraft['Armor Sets (armor_sets.json)'] = armorSets.length;
  console.log(`[OK] Saved ${armorSets.length} armor sets to multicraft/armor_sets.json\n`);

  // 1.3 Jewelry Sets
  console.log('Scraping Jewelry Sets...');
  const jewelrySetsUrl = `${BASE_URL}/jewelry-sets.json`;
  const jewelrySetsJson = await fetchJsonWithRetry(jewelrySetsUrl);
  const jewelrySets = jewelrySetsJson.pageProps?.jewelrySets || [];
  saveJson('multicraft/jewelry_sets.json', jewelrySets);
  summary.multicraft['Jewelry Sets (jewelry_sets.json)'] = jewelrySets.length;
  console.log(`[OK] Saved ${jewelrySets.length} jewelry sets to multicraft/jewelry_sets.json\n`);

  // 2. Weapons
  console.log('--- [2/5] Scraping Weapons ---');
  const weaponTypes = [
    'dagger',
    'sword',
    'two_hand_sword',
    'bow',
    'blunt',
    'two_hand_blunt',
    'spear',
    'fist',
    'one_hand_magic',
    'two_hand_magic',
    'dual_swords'
  ];

  const consolidatedWeapons = [];
  for (const type of weaponTypes) {
    process.stdout.write(`Fetching weapons: ${type}... `);
    const items = await fetchAllUnitPages(type, 'weapons');
    saveJson(`weapons/${type}.json`, items);
    consolidatedWeapons.push(...items);
    summary.weapons[type] = items.length;
    console.log(`saved ${items.length} items`);
  }
  saveJson('weapons/weapons.json', consolidatedWeapons);
  summary.weapons['TOTAL (weapons.json)'] = consolidatedWeapons.length;
  console.log(`[OK] Consolidated ${consolidatedWeapons.length} weapons to weapons/weapons.json\n`);

  // 3. Armors
  console.log('--- [3/5] Scraping Armors ---');
  const armorTypes = [
    'heavy_armor',
    'light_armor',
    'magic_armor',
    'gloves',
    'boots',
    'helmet',
    'shield',
    'sigil'
  ];

  const consolidatedArmors = [];
  for (const type of armorTypes) {
    process.stdout.write(`Fetching armors: ${type}... `);
    const items = await fetchAllUnitPages(type, 'armors');
    saveJson(`armors/${type}.json`, items);
    consolidatedArmors.push(...items);
    summary.armors[type] = items.length;
    console.log(`saved ${items.length} items`);
  }
  saveJson('armors/armors.json', consolidatedArmors);
  summary.armors['TOTAL (armors.json)'] = consolidatedArmors.length;
  console.log(`[OK] Consolidated ${consolidatedArmors.length} armors to armors/armors.json\n`);

  // 4. Accessories
  console.log('--- [4/5] Scraping Accessories ---');
  const accessoryTypes = [
    'necklace',
    'earring',
    'ring'
  ];

  const consolidatedAccessories = [];
  for (const type of accessoryTypes) {
    process.stdout.write(`Fetching accessories: ${type}... `);
    const items = await fetchAllUnitPages(type, 'accessories');
    saveJson(`accessories/${type}.json`, items);
    consolidatedAccessories.push(...items);
    summary.accessories[type] = items.length;
    console.log(`saved ${items.length} items`);
  }
  saveJson('accessories/accessories.json', consolidatedAccessories);
  summary.accessories['TOTAL (accessories.json)'] = consolidatedAccessories.length;
  console.log(`[OK] Consolidated ${consolidatedAccessories.length} accessories to accessories/accessories.json\n`);

  // 5. Other items
  console.log('--- [5/5] Scraping Other Items ---');
  // Shots
  process.stdout.write('Fetching shots (soulshot)... ');
  const shots = await fetchAllUnitPages('soulshot', 'other');
  saveJson('other/shots.json', shots);
  summary.other['Shots (shots.json)'] = shots.length;
  console.log(`saved ${shots.length} items`);

  // Resources
  process.stdout.write('Fetching resources (resource)... ');
  const resources = await fetchAllUnitPages('resource', 'other');
  saveJson('other/resources.json', resources);
  summary.other['Resources (resources.json)'] = resources.length;
  console.log(`saved ${resources.length} items`);

  console.log('\n====================================================');
  console.log('SCRAPING COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(JSON.stringify(summary, null, 2));

  return summary;
}

main().catch((err) => {
  console.error('\nFatal Error in Equipment Scraper:', err);
  process.exit(1);
});
