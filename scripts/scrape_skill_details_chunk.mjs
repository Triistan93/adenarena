import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const args = process.argv.slice(2);
const chunkIndex = parseInt(args.find(a => a.startsWith('--chunk='))?.split('=')[1] ?? '0', 10);
const totalChunks = parseInt(args.find(a => a.startsWith('--totalChunks='))?.split('=')[1] ?? '4', 10);
const concurrency = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] ?? '3', 10);

const invPath = path.resolve('scraped_data_wiki/unique_passives_inventory.json');
const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
const allSkills = inv.uniqueSkills;

const chunkSize = Math.ceil(allSkills.length / totalChunks);
const startIdx = chunkIndex * chunkSize;
const endIdx = Math.min(startIdx + chunkSize, allSkills.length);
const targetSkills = allSkills.slice(startIdx, endIdx);

const outputFile = path.resolve(`scraped_data_wiki/raw_passives/skill_details_chunk_${chunkIndex}.json`);

let results = [];
if (fs.existsSync(outputFile)) {
  try {
    results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`[Details Chunk ${chunkIndex}] Loaded ${results.length} existing items.`);
  } catch (e) {
    results = [];
  }
}

const completedIds = new Set(results.map(r => r.wikiSkillId));
const remainingSkills = targetSkills.filter(s => !completedIds.has(s.wikiSkillId));

console.log(`[Details Chunk ${chunkIndex}] Target: ${targetSkills.length} skills (idx ${startIdx} to ${endIdx - 1}). Done: ${results.length}. Remaining: ${remainingSkills.length}`);

function fetchSkillDetail(skillItem) {
  const url = skillItem.url;
  return new Promise((resolve) => {
    const proc = spawn(edgePath, [
      '--headless=new',
      '--dump-dom',
      '--virtual-time-budget=5000',
      url
    ]);

    let stdout = '';
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        try { proc.kill('SIGKILL'); } catch (e) {}
        console.warn(`[WATCHDOG TIMEOUT] Skill ${skillItem.wikiSkillId} timed out`);
        resolve({
          ...skillItem,
          name: `Skill ${skillItem.wikiSkillId}`,
          status: 'timeout'
        });
      }
    }, 16000);

    proc.stdout.on('data', d => { stdout += d.toString(); });

    proc.on('close', (code) => {
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
        if (label.includes('Character Level')) {
          minLevel = parseInt(val, 10) || 1;
        }
        if (label.includes('Auto get')) {
          autoGet = val.toLowerCase() === 'yes';
        }
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
  if (remainingSkills.length === 0) {
    console.log(`[Details Chunk ${chunkIndex}] All ${targetSkills.length} skills already scraped!`);
    return;
  }

  const t0 = Date.now();
  let done = results.length;

  for (let i = 0; i < remainingSkills.length; i += concurrency) {
    const batch = remainingSkills.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fetchSkillDetail));
    results.push(...batchResults);
    done += batchResults.length;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[Details Chunk ${chunkIndex}] Progress: ${done}/${targetSkills.length} (${elapsed}s elapsed)`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }

  console.log(`[Details Chunk ${chunkIndex}] FINISHED all ${results.length} skills!`);
}

run().catch(console.error);
