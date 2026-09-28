/**
 * Exercises the actual React character-creation screen in an isolated browser.
 * It never loads application saves or permits requests outside the local Vite server.
 */
import path from 'node:path';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  const bundled = process.env.ADEN_PLAYWRIGHT_PATH || path.join(
    process.env.USERPROFILE || '',
    '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
  );
  ({ chromium } = require(bundled));
}

const server = await createServer({
  root,
  server: { host: '127.0.0.1', port: 0, strictPort: false, open: false },
  logLevel: 'error'
});
let browser;
try {
  server.middlewares.use('/__character_creation_audit', (_req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><main id="audit-root"></main></body></html>');
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/__character_creation_audit`);

  const audit = await page.evaluate(async () => (await import('/scripts/character_creation_ui.browser.mjs')).run());
  const screenshotPath = path.join(process.env.TEMP || process.env.TMPDIR || root, 'aden-character-creation-audit.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const viewportChecks = [];
  for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => document.querySelector('#audit-root input')?.focus());
    await page.keyboard.press('Tab');
    const geometry = await page.evaluate(() => {
      const host = document.querySelector('#audit-root');
      const modal = host?.querySelector('.fixed.inset-0 > div');
      return {
        mounted: Boolean(host && modal),
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        modalWidth: modal ? Math.round(modal.getBoundingClientRect().width) : 0,
        modalHeight: modal ? Math.round(modal.getBoundingClientRect().height) : 0,
        modalClientWidth: modal?.clientWidth || 0,
        modalScrollWidth: modal?.scrollWidth || 0,
        horizontalOverflow: Boolean(modal && modal.scrollWidth > modal.clientWidth),
        tabFocusStayedInCreation: Boolean(host?.contains(document.activeElement))
      };
    });
    viewportChecks.push({ ...viewport, ...geometry });
  }

  const { conciseRows, rows: _rows, productionInitializations: _productionInitializations, ...auditSummary } = audit;
  const viewportPass = viewportChecks.every(check =>
    check.mounted && !check.horizontalOverflow && check.documentWidth <= check.viewportWidth && check.tabFocusStayedInCreation
  );
  const report = {
    name: 'actualCharacterCreationScreenAudit',
    renderedInProductionReactComponent: true,
    browserProfile: 'disposable, empty localStorage; only local Vite requests allowed',
    ...auditSummary,
    classOptionsByRace: conciseRows,
    screenshotForVisualReview: screenshotPath,
    viewportChecks,
    browserErrors: errors,
    viewportPass,
    pass: audit.failures.length === 0 && audit.raceCount === 9 && audit.classOptionCount === 25 &&
      audit.productionInitializationCount === 25 && audit.activeClassCount === 22 && audit.blockedContentGapCount === 3 &&
      audit.confirmation?.passedSelection === true && viewportPass && errors.length === 0
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await server.close();
}
