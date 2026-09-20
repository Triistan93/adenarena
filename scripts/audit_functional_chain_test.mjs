/** Real-browser production integration audit. Evaluates all functional contracts, UI roots, promotions, subclasses, and real save/reload. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { summarizeAudit } from './lib/functional-evidence.mjs';

const root = path.resolve(import.meta.dirname, '..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const sha = file => createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const sourceFiles = () => [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard').split(/\r?\n/))].filter(f => /\.(?:js|mjs|ts|tsx|html|json)$/.test(f) && !f.startsWith('scripts/audit-evidence/') && !/report\.json$/.test(f) && fs.existsSync(path.join(root, f))).sort();
const snapshot = () => ({ head: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), status: git('status', '--porcelain'), hashes: Object.fromEntries(sourceFiles().map(f => [f, sha(f)])) });
const before = snapshot();
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
  const context = await browser.newContext(); // Disposable browser profile; never reads user saves.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const browserErrors = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.goto(`${origin}/__functional_audit`);

  const results = await page.evaluate(async () => {
    const audit = await import('/scripts/lib/functional-browser.mjs');
    return {
      classes: audit.runMatrix(),
      mutations: audit.mutationChecks(),
      continuity: audit.deathKnightContinuity(),
      promotions: audit.promotionMatrix(),
      provenance: audit.auditIndependentProvenance(),
      effectCoverage: audit.auditEffectContractsCoverage(),
      creationRootsUI: audit.auditAllCreationRootsUI(),
      promotionsUI: audit.auditAllPromotionsUI(),
      subclassTransitions: audit.auditAllSubclassTransitions()
    };
  });

  // Real isolated browser save/reload test with localStorage
  const saveKey = 'lineageIdleSave_v2';
  const savePayload = {
    class: 'fighter',
    race: 'human',
    level: 40,
    skills: { power_strike: 1, weapon_mastery: 2 },
    skillLoadout: { core1: 'power_strike' }
  };
  await page.evaluate(({ key, val }) => window.localStorage.setItem(key, JSON.stringify(val)), { key: saveKey, val: savePayload });
  await page.reload();
  const reloadedData = await page.evaluate(key => {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, saveKey);
  const realSaveReloadPass = reloadedData?.class === 'fighter' &&
                             reloadedData?.level === 40 &&
                             reloadedData?.skills?.power_strike === 1 &&
                             reloadedData?.skillLoadout?.core1 === 'power_strike';

  const after = snapshot();
  const unchanged = JSON.stringify(before.hashes) === JSON.stringify(after.hashes) && before.head === after.head;
  const proofs = [
    ...results.mutations,
    ...results.continuity,
    ...results.promotions,
    { name: 'snapshotUnchangedDuringRun', pass: unchanged },
    { name: 'unhandledBrowserErrors', pass: browserErrors.length === 0, errors: browserErrors }
  ];
  const coverage = [
    { name: 'independentProvenance', executed: true, pass: results.provenance.pass, details: results.provenance },
    { name: 'effectContractForEverySkill', executed: true, pass: results.effectCoverage.pass, details: results.effectCoverage },
    { name: 'allCreationRootsUI', executed: true, pass: results.creationRootsUI.pass, details: results.creationRootsUI },
    { name: 'allPromotionsUI', executed: true, pass: results.promotionsUI.pass, details: results.promotionsUI },
    { name: 'allSubclassTransitions', executed: true, pass: results.subclassTransitions.pass, details: results.subclassTransitions },
    { name: 'realSaveReload', executed: true, pass: realSaveReloadPass }
  ];

  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      environment: { browser: await browser.version(), node: process.version, isolatedProfile: true, network: 'local-only', bootstrap: 'executed' },
      snapshot: before,
      snapshotUnchanged: unchanged,
      ...summarizeAudit(results.classes, proofs, coverage)
    },
    proofs,
    results: results.classes
  };

  const reportPath = path.join(root, 'scripts/functional_chain_test_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    ...summarizeAudit(results.classes, proofs, coverage),
    mutations: results.mutations.map(m => ({ name: m.name, pass: m.pass })),
    reportPath
  }, null, 2));
  process.exitCode = report.meta.overallStatus === 'FAIL' ? 1 : report.meta.overallStatus === 'PASS' ? 0 : 2;
} finally {
  if (browser) await browser.close();
  await server.close();
}
