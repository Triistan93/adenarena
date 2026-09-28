import assert from 'node:assert/strict';
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

const server = await createServer({ root, server: { host: '127.0.0.1', port: 0, strictPort: false }, logLevel: 'error' });
server.middlewares.use('/__armor_care_test', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.end('<!doctype html><html><body><main></main></body></html>');
});

let browser;
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(`${origin}/__armor_care_test`);

  const results = await page.evaluate(async () => {
    const audit = await import('/scripts/lib/functional-browser.mjs');
    const cases = [
      { rank: 0, roll: 0.005, expectedCrit: false },
      { rank: 1, roll: 0.005, expectedCrit: true },
      { rank: 2, roll: 0.029, expectedCrit: true },
      { rank: 2, roll: 0.03, expectedCrit: false }
    ];
    return cases.map(({ rank, roll, expectedCrit }) => {
      const skillId = 'templar_s_rush';
      const def = window.EchoData.SKILL_DEFS_ECHO[skillId];
      const state = audit.prepare('evas_templar', 84, def, skillId);
      state.skills.armor_care = rank;
      const originalRandom = Math.random;
      let row;
      try {
        Math.random = () => roll;
        row = audit.exercise('evas_templar', skillId, null, null, 84, state);
      } finally {
        Math.random = originalRandom;
      }
      const hit = row.observed?.events?.find(event => event.skillId === skillId);
      return { rank, roll, expectedCrit, castPassed: row.checks.some(check => check.name === 'productionCast' && check.pass), isCrit: hit?.isCrit, damage: hit?.damage };
    });
  });

  for (const result of results) {
    assert.equal(result.castPassed, true, `Templar's Rush should cast for Armor Care rank ${result.rank}`);
    assert.equal(result.isCrit, result.expectedCrit, `rank ${result.rank} with roll ${result.roll} should resolve the expected skill critical`);
  }
  assert.ok(results[1].damage > results[0].damage, 'rank 1 critical should increase physical skill damage in the production combat path');
  assert.ok(results[2].damage > results[1].damage, 'rank 2 critical should exceed rank 1 critical damage in the production combat path');
  console.log('Armor Care physical skill criticals passed through main.attackMonster for ranks 0, 1, and 2.');
} finally {
  if (browser) await browser.close();
  await server.close();
}
