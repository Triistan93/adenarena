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
server.middlewares.use('/__blocked_skill_effect_test', (_req, res) => {
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
  await page.goto(`${origin}/__blocked_skill_effect_test`);

  const result = await page.evaluate(async () => {
    const audit = await import('/scripts/lib/functional-browser.mjs');
    const classes = audit.runMatrix();
    const blocked = classes.filter(entry => entry.contentStatus.startsWith('BLOCKED'));
    const relations = blocked.flatMap(entry => entry.skills.map(skill => ({ classId: entry.classId, skillId: skill.skillId })));
    const checked = relations.map(({ classId, skillId }) => {
      const row = audit.exercise(classId, skillId);
      return { classId, skillId, kind: row.effect?.contract?.kind, status: row.effect?.status, dispatch: row.dispatch?.path, checksPass: row.checks.every(check => check.pass === true) };
    });
    return {
      blockedClassIds: blocked.map(entry => entry.classId),
      relationCount: relations.length,
      checked,
      classAssignmentsRemainBlocked: blocked.every(entry => entry.contentStatus.startsWith('BLOCKED'))
    };
  });

  assert.equal(result.classAssignmentsRemainBlocked, true, 'effect execution must not certify blocked class assignments');
  assert.ok(result.relationCount > 0, 'the audit must include the blocked relation set');
  const expectedDispatch = row => ['passive', 'stat'].includes(row.kind) ? row.dispatch === 'StatsEngine.getStats' : row.dispatch === 'main.attackMonster';
  const skipped = result.checked.filter(row => !expectedDispatch(row) || row.status?.startsWith('BLOCKED'));
  assert.deepEqual(skipped, [], `every locally configured blocked-class skill relation must reach production combat; skipped: ${JSON.stringify(skipped)}`);
  const failed = result.checked.filter(row => !row.checksPass || row.status !== 'PASS');
  assert.deepEqual(failed, [], `blocked-class skill effect failures: ${JSON.stringify(failed)}`);
  console.log(`Passed ${result.checked.length} blocked-class skill relation effects; class assignment provenance remains blocked for ${result.blockedClassIds.length} classes.`);
} finally {
  if (browser) await browser.close();
  await server.close();
}
