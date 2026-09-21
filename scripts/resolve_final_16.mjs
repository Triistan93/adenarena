import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outPath = path.resolve('scraped_data_wiki/passives_detailed.json');
const list = JSON.parse(fs.readFileSync(outPath, 'utf8'));
const map = new Map(list.map(s => [s.wikiSkillId, s]));

// Exact original target list
const targets = [
  { wikiSkillId: 45226, href: "/essence/skills/hell_knight/45226_1_0.html" },
  { wikiSkillId: 45372, href: "/essence/skills/shillien_templar/45372_1_0.html" },
  { wikiSkillId: 47021, href: "/essence/skills/wind_hunter/47021_3_0.html" },
  { wikiSkillId: 47270, href: "/essence/skills/wizard/47270_1_0.html" },
  { wikiSkillId: 47918, href: "/essence/skills/warlock/47918_1_0.html" },
  { wikiSkillId: 87030, href: "/essence/skills/hierophant/87030_1_0.html" },
  { wikiSkillId: 87469, href: "/essence/skills/secret_assassin_male_1/87469_1_0.html" },
  { wikiSkillId: 88055, href: "/essence/skills/shillien_templar/88055_1_0.html" },
  { wikiSkillId: 88082, href: "/essence/skills/secret_assassin_male_3/88082_1_0.html" },
  { wikiSkillId: 88244, href: "/essence/skills/elemental_master/88244_1_0.html" },
  { wikiSkillId: 88245, href: "/essence/skills/elemental_master/88245_1_0.html" },
  { wikiSkillId: 88452, href: "/essence/skills/werewolf_1/88452_1_0.html" },
  { wikiSkillId: 88598, href: "/essence/skills/rose_vain_3/88598_4_0.html" },
  { wikiSkillId: 88603, href: "/essence/skills/rose_vain_3/88603_5_0.html" },
  { wikiSkillId: 89180, href: "/essence/skills/crow_3/89180_1_0.html" },
  { wikiSkillId: 1145081, href: "/essence/skills/warder/1145081_1_0.html" }
];

console.log(`Resolving the final ${targets.length} skills with authentic original URLs...`);

async function fetchOne(target) {
  const url = `https://l2wiki.com${target.href}`;
  const t0 = Date.now();
  return new Promise((resolve) => {
    const proc = spawn(edgePath, [
      '--headless=new',
      '--dump-dom',
      '--virtual-time-budget=2000',
      url
    ]);
    let stdout = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch(e) {}
      console.warn(`[TIMEOUT] ${target.wikiSkillId}`);
      resolve(null);
    }, 25000);

    proc.stdout.on('data', d => stdout += d.toString());
    proc.on('close', () => {
      clearTimeout(timer);
      const $ = cheerio.load(stdout);
      const name = $('.skill-name h1.skill-desc').text().trim();
      const desc = $('.main-skill-info p').text().trim();
      const icon = $('.skill-header .skill-icon img').attr('src');
      let minLevel = 1;
      $('.skill-options .value-row').each((i, el) => {
        const label = $(el).find('span').first().text().trim();
        const val = $(el).find('span').last().text().trim();
        if (label.includes('Character Level')) minLevel = parseInt(val, 10) || 1;
      });
      const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`[${target.wikiSkillId}] ${name || 'NO_NAME'} (${elapsed}s, minLv ${minLevel})`);
      if (name) {
        resolve({
          wikiSkillId: target.wikiSkillId,
          name,
          description: desc,
          icon: icon?.startsWith('http') ? icon : `https://l2wiki.com${icon}`,
          minLevel,
          status: 'ok'
        });
      } else {
        resolve(null);
      }
    });
  });
}

async function run() {
  for (const t of targets) {
    const res = await fetchOne(t);
    if (res) {
      const existing = map.get(res.wikiSkillId) || {};
      map.set(res.wikiSkillId, { ...existing, ...res });
      fs.writeFileSync(outPath, JSON.stringify(Array.from(map.values()), null, 2));
    }
  }
  const okCount = Array.from(map.values()).filter(s => s.status === 'ok').length;
  console.log(`FINAL PROGRESS: ${okCount}/${map.size} OK!`);
}

run().catch(console.error);
