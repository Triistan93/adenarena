import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const args = process.argv.slice(2);
const chunkIndex = parseInt(args.find(a => a.startsWith('--chunk='))?.split('=')[1] ?? '0', 10);
const concurrency = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] ?? '3', 10);

const targetListPath = path.resolve('scraped_data_wiki/raw_passives/classes_target_list.json');
const allClasses = JSON.parse(fs.readFileSync(targetListPath, 'utf8'));

const chunkSize = 50;
const startIdx = chunkIndex * chunkSize;
const endIdx = Math.min(startIdx + chunkSize, allClasses.length);
const targetClasses = allClasses.slice(startIdx, endIdx);

const outputFile = path.resolve(`scraped_data_wiki/raw_passives/passives_chunk_${chunkIndex}.json`);

// Load existing progress if available
let results = [];
if (fs.existsSync(outputFile)) {
  try {
    results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    console.log(`[Chunk ${chunkIndex}] Loaded ${results.length} existing completed classes.`);
  } catch (e) {
    results = [];
  }
}

const completedSlugs = new Set(results.map(r => r.slug));
const remainingClasses = targetClasses.filter(c => !completedSlugs.has(c.slug));

console.log(`[Chunk ${chunkIndex}] Target: ${targetClasses.length} total classes. Already done: ${results.length}. Remaining to scrape: ${remainingClasses.length}`);

function fetchClassPassives(classItem) {
  const url = `https://l2wiki.com/essence/skills/${classItem.slug}/?mode=type&type=passive`;
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
        console.warn(`[WATCHDOG TIMEOUT] Class ${classItem.slug} timed out after 16s`);
        resolve({
          slug: classItem.slug,
          name: classItem.name,
          race: classItem.race,
          raceName: classItem.raceName,
          status: 'timeout',
          sections: [],
          skillsCount: 0,
          skills: []
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
          slug: classItem.slug,
          name: classItem.name,
          race: classItem.race,
          raceName: classItem.raceName,
          status: 'empty_dom',
          sections: [],
          skillsCount: 0,
          skills: []
        });
        return;
      }

      const $ = cheerio.load(stdout);
      const sections = [];
      const allSkills = [];

      $('.spoiler-wrapper').each((i, el) => {
        const sectionTitle = $(el).find('.spoiler-title span').text().trim();
        const sectionSkills = [];
        $(el).find('a.icon').each((j, a) => {
          const href = $(a).attr('href') || '';
          const img = $(a).find('img').attr('src') || '';
          const match = href.match(/\/skills\/([^\/]+)\/(\d+)_(\d+)_(\d+)\.html/);
          if (match) {
            const skillObj = {
              wikiSkillId: parseInt(match[2], 10),
              rank: parseInt(match[3], 10),
              subrank: parseInt(match[4], 10),
              href,
              url: `https://l2wiki.com${href}`,
              icon: img.startsWith('http') ? img : `https://l2wiki.com${img}`,
              iconFile: img.split('/').pop(),
              category: sectionTitle
            };
            sectionSkills.push(skillObj);
            allSkills.push(skillObj);
          }
        });
        if (sectionSkills.length > 0) {
          sections.push({
            name: sectionTitle,
            count: sectionSkills.length,
            skills: sectionSkills
          });
        }
      });

      resolve({
        slug: classItem.slug,
        name: classItem.name,
        race: classItem.race,
        raceName: classItem.raceName,
        status: 'ok',
        sections,
        skillsCount: allSkills.length,
        skills: allSkills
      });
    });

    proc.on('error', (err) => {
      if (isSettled) return;
      isSettled = true;
      clearTimeout(timer);
      resolve({
        slug: classItem.slug,
        name: classItem.name,
        race: classItem.race,
        raceName: classItem.raceName,
        status: 'proc_error',
        error: err.message,
        sections: [],
        skillsCount: 0,
        skills: []
      });
    });
  });
}

async function fetchWithRetry(classItem, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await fetchClassPassives(classItem);
    if (res.status === 'ok') {
      return res;
    }
    console.warn(`[WARN] Chunk ${chunkIndex} - Retry ${attempt}/${maxRetries} for ${classItem.slug} (status: ${res.status})`);
    await new Promise(r => setTimeout(r, 1000));
  }
  return fetchClassPassives(classItem);
}

async function run() {
  if (remainingClasses.length === 0) {
    console.log(`[Chunk ${chunkIndex}] All ${targetClasses.length} classes already completed!`);
    return;
  }

  const t0 = Date.now();
  let done = results.length;

  for (let i = 0; i < remainingClasses.length; i += concurrency) {
    const batch = remainingClasses.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fetchWithRetry));
    results.push(...batchResults);
    done += batchResults.length;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[Chunk ${chunkIndex}] Progress: ${done}/${targetClasses.length} done (${elapsed}s elapsed)`);
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  }

  console.log(`[Chunk ${chunkIndex}] FINISHED all ${results.length} classes!`);
}

run().catch(console.error);
