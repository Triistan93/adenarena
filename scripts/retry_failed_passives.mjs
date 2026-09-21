import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outPath = path.resolve('scraped_data_wiki/passives_detailed.json');

const list = JSON.parse(fs.readFileSync(outPath, 'utf8'));
const map = new Map(list.map(s => [s.wikiSkillId, s]));

const failed = list.filter(s => s.status !== 'ok');
console.log(`Retrying ${failed.length} remaining skills...`);

function fetchSkill(skillItem) {
  // Try alternative classes if available
  const cls = (skillItem.classes && skillItem.classes.length > 1) ? skillItem.classes[1] : (skillItem.sampleClass || skillItem.classes[0]);
  const url = `https://l2wiki.com/essence/skills/${cls}/${skillItem.wikiSkillId}_1_0.html`;

  return new Promise((resolve) => {
    const proc = spawn(edgePath, [
      '--headless=new',
      '--dump-dom',
      '--virtual-time-budget=1200',
      url
    ]);

    let stdout = '';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try { proc.kill('SIGKILL'); } catch(e) {}
        console.warn(`[TIMEOUT] Skill ${skillItem.wikiSkillId}`);
        resolve({ ...skillItem, status: 'retry_timeout' });
      }
    }, 25000);

    proc.stdout.on('data', d => stdout += d.toString());
    proc.on('close', () => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);

      if (!stdout || stdout.length < 500) {
        resolve({ ...skillItem, status: 'empty_dom' });
        return;
      }

      const $ = cheerio.load(stdout);
      const name = $('.skill-name h1.skill-desc').text().trim();
      if (!name) {
        resolve({ ...skillItem, status: 'no_name' });
        return;
      }

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

      console.log(`[OK] ${skillItem.wikiSkillId} -> ${name} (minLv: ${minLevel})`);

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
  });
}

async function run() {
  const concurrency = 2;
  for (let i = 0; i < failed.length; i += concurrency) {
    const batch = failed.slice(i, i + concurrency);
    const results = await Promise.all(batch.map(fetchSkill));
    results.forEach(r => {
      if (r.status === 'ok') map.set(r.wikiSkillId, r);
    });
    // Save
    const updated = Array.from(map.values());
    fs.writeFileSync(outPath, JSON.stringify(updated, null, 2));
  }

  const finalOk = Array.from(map.values()).filter(s => s.status === 'ok').length;
  console.log(`Finished retries! Total OK now: ${finalOk}/${map.size}`);
}

run().catch(console.error);
