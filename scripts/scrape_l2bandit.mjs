import { spawn } from 'child_process';
import path from 'path';
import { runImageDownload } from './download_bandit_icons.mjs';
import { consolidate } from './consolidate_bandit.mjs';

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`\n>>> Executing ${scriptPath}...`);
    const proc = spawn('node', [scriptPath], { stdio: 'inherit' });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptPath} failed with exit code ${code}`));
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('STARTING COMPLETE SCRAPING PIPELINE FOR L2BANDIT.CAMP');
  console.log('================================================================');

  // Step 1: Run equipment worker
  await runScript(path.resolve('scripts/worker_equipment.mjs'));

  // Step 2: Run entities worker
  await runScript(path.resolve('scripts/worker_entities.mjs'));

  // Step 3: Run icon downloader
  await runImageDownload();

  // Step 4: Consolidate JSONs, CSVs, and HTML catalog
  consolidate();

  console.log('\n================================================================');
  console.log('ALL L2BANDIT SCRAPING COMPLETED SUCCESSFULLY!');
  console.log('Output directory: scraped_data_bandit/');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
