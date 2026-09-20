import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch {
  const bundled = process.env.ADEN_PLAYWRIGHT_PATH || path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
  ({ chromium } = require(bundled));
}

const server = await createServer({ root, server: { host: '127.0.0.1', port: 0, strictPort: false, open: false }, logLevel: 'error' });
server.middlewares.use('/__functional_audit', (_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><html><body><main id="audit"></main></body></html>'); });

let browser;
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto(`${origin}/__functional_audit`);

  const results = await page.evaluate(async () => {
    const invData = await fetch('/scripts/skill_functional_contract_inventory.json').then(r => r.json());
    const audit = await import('/scripts/lib/functional-browser.mjs');
    const classes = (await import('/lineage-idle/src/data/classes/CanonicalClassRegistry.js')).CANONICAL_CLASS_REGISTRY;
    const defs = window.EchoData.SKILL_DEFS_ECHO;

    // Test exercise on sample of each family
    const familySamples = {};
    for (const item of invData.inventory) {
      if (!item.skillId || !item.effectFamily) continue;
      if (!familySamples[item.effectFamily]) {
        familySamples[item.effectFamily] = [];
      }
      if (familySamples[item.effectFamily].length < 3) {
        familySamples[item.effectFamily].push(item);
      }
    }

    const testRuns = [];
    for (const [fam, items] of Object.entries(familySamples)) {
      for (const it of items) {
        try {
          const res = audit.exercise(it.classId, it.skillId, it.ancestor);
          testRuns.push({
            classId: it.classId,
            skillId: it.skillId,
            family: fam,
            checks: res.checks,
            effect: res.effect,
            error: null
          });
        } catch (e) {
          testRuns.push({
            classId: it.classId,
            skillId: it.skillId,
            family: fam,
            error: e.message
          });
        }
      }
    }
    return { testRuns };
  });

  console.log(`Ran ${results.testRuns.length} sample exercise cases across all families`);
  console.log(`Browser errors: ${browserErrors.length}`);
  const exceptions = results.testRuns.filter(r => r.error);
  console.log(`Exceptions: ${exceptions.length}`);
  if (exceptions.length > 0) {
    console.log('Exceptions:', exceptions);
  }
  const checkFailures = results.testRuns.filter(r => r.checks && r.checks.some(c => c.pass === false));
  console.log(`Check failures: ${checkFailures.length}`);
  if (checkFailures.length > 0) {
    console.log('Check failures sample:', JSON.stringify(checkFailures.slice(0, 5), null, 2));
  }
} finally {
  if (browser) await browser.close();
  await server.close();
}
