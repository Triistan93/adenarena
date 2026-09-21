import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const inv = JSON.parse(fs.readFileSync('scraped_data_wiki/unique_passives_inventory.json', 'utf8'));
const allSkills = inv.uniqueSkills;

const outPath = path.resolve('scraped_data_wiki/passives_detailed.json');

let detailedMap = new Map();

// 1. Load any existing ok skills from chunk files
for (let i = 0; i < 4; i++) {
  const p = path.resolve(`scraped_data_wiki/raw_passives/skill_details_chunk_${i}.json`);
  if (fs.existsSync(p)) {
    const list = JSON.parse(fs.readFileSync(p, 'utf8'));
    list.filter(s => s.status === 'ok').forEach(s => detailedMap.set(s.wikiSkillId, s));
  }
}

// 2. Load DK detailed skills
const dkPath = path.resolve('scraped_data_wiki/death_knight_passives_detailed.json');
if (fs.existsSync(dkPath)) {
  const dkList = JSON.parse(fs.readFileSync(dkPath, 'utf8'));
  dkList.forEach(s => detailedMap.set(s.id, {
    wikiSkillId: s.id,
    name: s.name,
    skillType: s.skillType,
    icon: s.icon,
    description: s.description,
    minLevel: s.minLevel,
    status: 'ok'
  }));
}

// 3. Load from outPath if exists
if (fs.existsSync(outPath)) {
  try {
    const existing = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    existing.filter(s => s.status === 'ok').forEach(s => detailedMap.set(s.wikiSkillId, s));
  } catch(e) {}
}

const remaining = allSkills.filter(s => !detailedMap.has(s.wikiSkillId) || detailedMap.get(s.wikiSkillId).status !== 'ok');

console.log(`[Fast Scraper] Total unique skills: ${allSkills.length}. Already OK: ${detailedMap.size}. Remaining: ${remaining.length}`);

function fetchSkill(skillItem) {
  // Use rank 1 URL for canonical page
  const sampleClass = skillItem.classes[0] || skillItem.sampleClass;
  const url = `https://l2wiki.com/essence/skills/${sampleClass}/${skillItem.wikiSkillId}_1_0.html`;

  return new Promise((resolve) => {
    const proc = spawn(edgePath, [
      '--headless=new',
      '--dump-dom',
      '--virtual-time-budget=1000',
      url
    ]);

    let stdout = '';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try { proc.kill('SIGKILL'); } catch(e) {}
        resolve({
          ...skillItem,
          name: `Skill ${skillItem.wikiSkillId}`,
          status: 'timeout'
        });
      }
    }, 20000);

    proc.stdout.on('data', d => stdout += d.toString());

    proc.on('close', () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      if (!stdout || stdout.length < 500) {
        resolve({
          ...skillItem,
          name: `Skill ${skillItem.wikiSkillId}`,
          status: 'empty_dom'
        });
        return;
      }

      const $ = cheerio.load(stdout);
      const name = $('.skill-name h1.skill-desc').text().trim() || `Skill ${skillItem.wikiSkillId}`;
      const skillType = $('.skill-name h3.skill-type').text().trim() || 'Passive';
      const icon = $('.skill-header .skill-icon img').attr('src') || skillItem.icon;
      const description = $('.main-skill-info p').text().trim();

      let minLevel = 1;
      let autoGet = true;

      $('.skill-options .value-row').each((i, el) => {
        const label = $(el).find('span').first().text().trim();
        const val = $(el).find('span').last().text().trim();
        if (label.includes('Character Level')) minLevel = parseInt(val, 10) || 1;
        if (label.includes('Auto get')) autoGet = val.toLowerCase() === 'yes';
      });

      resolve({
        ...skillItem,
        name,
        skillType,
        icon: icon?.startsWith('http') ? icon : `https://l2wiki.com${icon}`,
        description,
        minLevel,
        autoGet,
        status: 'ok'
      });
    });

    proc.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        ...skillItem,
        name: `Skill ${skillItem.wikiSkillId}`,
        status: 'proc_error',
        error: err.message
      });
    });
  });
}

async function run() {
  const concurrency = 4;
  const t0 = Date.now();
  let done = detailedMap.size;

  for (let i = 0; i < remaining.length; i += concurrency) {
    const batch = remaining.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(fetchSkill));
    results.forEach(r => {
      if (r.status === 'ok') detailedMap.set(r.wikiSkillId, r);
    });
    done += batch.length;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[Fast Scraper] ${done}/${allSkills.length} processed (${detailedMap.size} OK so far, ${elapsed}s elapsed)`);

    // Save checkpoint
    const fullList = allSkills.map(s => detailedMap.get(s.wikiSkillId) || s);
    fs.writeFileSync(outPath, JSON.stringify(fullList, null, 2));
  }

  console.log(`[Fast Scraper] FINISHED! Total OK skills: ${detailedMap.size}/${allSkills.length}`);
}

run().catch(console.error);
