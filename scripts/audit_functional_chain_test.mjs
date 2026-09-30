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
  const runtimeErrorLocations = [];
  await page.exposeFunction('__functionalAuditCaptureError', detail => runtimeErrorLocations.push(detail));
  await page.addInitScript(() => {
    window.addEventListener('error', event => {
      window.__functionalAuditCaptureError({
        message: event.message,
        source: event.filename || '',
        line: event.lineno,
        column: event.colno
      });
    });
  });
  page.on('pageerror', error => browserErrors.push({ message: error.message, stack: error.stack }));
  await page.goto(`${origin}/__functional_audit`);

  const results = await page.evaluate(async () => {
    const audit = await import('/scripts/lib/functional-browser.mjs');
    const classes = audit.runMatrix();
    return {
      classes,
      mutations: audit.mutationChecks(),
      detectWeaknessDamage: audit.detectWeaknessDamageProof(),
      provokeDamage: audit.provokeDamageProof(),
      vampiricRageLifesteal: audit.vampiricRageLifestealProof(),
      longShotBowDamage: audit.longShotBowDamageProof(),
      roarOfDeathCombat: audit.roarOfDeathIncomingDamageProof(),
      ultimateEvasionCombat: audit.ultimateEvasionCombatProof(),
      lionheartPveDamage: audit.lionheartPveDamageProof(),
      deathWhisperCriticalDamage: audit.deathWhisperCriticalDamageProof(),
      clarityMpCost: audit.clarityMpCostProof(),
      potionMastery: audit.potionMasteryUseItemProof(),
      continuity: audit.deathKnightContinuity(),
      promotions: audit.promotionMatrix(),
      provenance: audit.auditIndependentProvenance(),
      effectCoverage: audit.auditEffectContractsCoverage(classes),
      blockedClassSkillEffects: audit.runUnrepresentedBlockedSkillEffects(classes),
      creationRootsUI: audit.auditAllCreationRootsUI(),
      creationScreenUI: await (await import('/scripts/character_creation_ui.browser.mjs')).run(),
      promotionViewModels: audit.auditAllPromotionsUI(),
      promotionModalUI: audit.auditActualPromotionModalUI(),
      subclassTransitions: audit.auditAllSubclassTransitions()
    };
  });

  // Render the production skill window component for every class and each of
  // its tabs. This checks emitted DOM cards, not only the backing ViewModels.
  const skillWindowRendering = await page.evaluate(async (classFixtures) => {
    await import('/lineage-idle/src/data/items/index.js');
    await import('/lineage-idle/src/data/classes/index.js');
    await import('/lineage-idle/data/echo-adapter.js');
    const [gameUI, dom, stateManager, viewModelModule, classRegistry] = await Promise.all([
      import('/lineage-idle/src/ui/GameUI.js'),
      import('/lineage-idle/src/core/DomHelpers.js'),
      import('/lineage-idle/src/core/StateManager.js'),
      import('/lineage-idle/src/services/SkillTreeViewModel.js'),
      import('/lineage-idle/src/data/classes/CanonicalClassRegistryV2.js')
    ]);
    document.body.innerHTML = '<main><span id="sp-available"></span><div id="shared-skills-container"></div><div id="legacy-passives-container"></div><div id="skill-tree"></div><div id="skill-info-panel"></div></main>';
    dom.setRoot(document);
    const tabs = ['active', 'passive', 'ultimate'];
    const summaries = [];
    const failures = [];

    for (const fixture of classFixtures) {
      const def = classRegistry.CANONICAL_CLASS_REGISTRY_V2[fixture.classId];
      const level = Number(def?.minLevel) || (fixture.stage >= 3 ? 80 : fixture.stage === 2 ? 40 : fixture.stage === 1 ? 20 : 1);
      const state = stateManager.DEFAULT_STATE();
      Object.assign(state, { class: fixture.classId, race: fixture.race || def?.race || 'human', level, sp: 1000000000, skills: {}, selectedSkill: null });

      for (const tab of tabs) {
        state.activeSkillTab = tab;
        const vm = viewModelModule.getSkillTreeViewModel(state, { activeTab: tab });
        const modelTab = vm.tabs[tab];
        const expected = tab === 'active'
          ? modelTab.categories.flatMap(category => category.skills).map(skill => skill.skillId)
          : tab === 'passive'
            ? modelTab.categories.flatMap(category => category.skills).map(skill => skill.skillId)
            : modelTab.skills.map(skill => skill.skillId);

        try {
          gameUI.updateSkillUI(state);
          const rendered = [...document.querySelectorAll('#skill-tree .skill-card[data-skill-id]')].map(card => card.dataset.skillId);
          const expectedSet = [...new Set(expected)].sort();
          const renderedSet = [...new Set(rendered)].sort();
          const duplicates = rendered.length !== renderedSet.length;
          const pass = JSON.stringify(expectedSet) === JSON.stringify(renderedSet) && !duplicates &&
            Boolean(document.querySelector('#skill-tree .skill-window'));
          if (!pass) failures.push({ classId: fixture.classId, tab, expected: expectedSet, rendered: renderedSet, duplicates });
          summaries.push({ classId: fixture.classId, tab, expectedCount: expectedSet.length, renderedCount: renderedSet.length, pass });
        } catch (error) {
          failures.push({ classId: fixture.classId, tab, error: error.message });
          summaries.push({ classId: fixture.classId, tab, expectedCount: expected.length, renderedCount: 0, pass: false });
        }
      }
    }

    return {
      name: 'productionSkillWindowRendering',
      classCount: classFixtures.length,
      tabCount: tabs.length,
      expectedRenders: classFixtures.length * tabs.length,
      renderedCount: summaries.length,
      passedCount: summaries.filter(row => row.pass).length,
      pass: failures.length === 0 && summaries.length === classFixtures.length * tabs.length,
      failures,
      samples: summaries.slice(0, 12)
    };
  }, results.classes.map(({ classId, race, stage }) => ({ classId, race, stage })));

  // Exercise the real idle-game bootstrap and StateManager save/load path in
  // this disposable browser profile. The user's normal browser profile is not
  // connected to this context, and no cloud endpoint is allowed by the route.
  const productionSaveSeed = await page.evaluate(async () => {
    await import('/lineage-idle/src/data/items/index.js');
    await import('/lineage-idle/src/data/classes/index.js');
    await import('/lineage-idle/data/echo-adapter.js');
    const [{ IDLE_MARKUP }, stateManager, gameBootstrap, gameMain] = await Promise.all([
      import('/src/idle/markup.ts'),
      import('/lineage-idle/src/core/StateManager.js'),
      import('/lineage-idle/src/core/GameBootstrap.js'),
      import('/lineage-idle/main.js')
    ]);
    document.body.innerHTML = IDLE_MARKUP;
    gameMain.setRoot(document);
    localStorage.removeItem('aden_pending_char_creation');
    const state = stateManager.DEFAULT_STATE();
    Object.assign(state, { race: 'human', class: 'fighter', charName: 'Functional Audit Save', level: 39, gold: 987654 });
    state.skills = { ...state.skills, power_strike: 1, weapon_mastery: 2 };
    state.skillLoadout = { core1: 'power_strike' };
    stateManager.setState(state);
    stateManager.saveState(true);
    const rawSeed = JSON.parse(localStorage.getItem('lineageIdleSave_v2'));
    const directLoadResult = stateManager.loadState();
    const directLoad = stateManager.getState();
    await gameBootstrap.bootstrap(document);
    gameMain.init();
    const live = stateManager.getState();
    return {
      savePresent: Boolean(localStorage.getItem('lineageIdleSave_v2')),
      pendingCreation: localStorage.getItem('aden_pending_char_creation'),
      rawSeed: { level: rawSeed.level, class: rawSeed.class, race: rawSeed.race, gold: rawSeed.gold, skills: rawSeed.skills, skillLoadout: rawSeed.skillLoadout },
      directLoadResult,
      directLoad: { level: directLoad.level, class: directLoad.class, race: directLoad.race, gold: directLoad.gold, skills: directLoad.skills, skillLoadout: directLoad.skillLoadout },
      loaded: live.class === 'fighter' && live.race === 'human' && live.charName === 'Functional Audit Save' &&
        live.level === 39 && live.gold === 987654 && live.skills?.power_strike === 1 &&
        live.skills?.weapon_mastery === 2 && live.skillLoadout?.core1 === 'power_strike',
      observed: { class: live.class, race: live.race, charName: live.charName, level: live.level, gold: live.gold, skills: live.skills, loadout: live.skillLoadout }
    };
  });
  await page.reload();
  const productionSaveReload = await page.evaluate(async () => {
    await import('/lineage-idle/src/data/items/index.js');
    await import('/lineage-idle/src/data/classes/index.js');
    await import('/lineage-idle/data/echo-adapter.js');
    const [{ IDLE_MARKUP }, stateManager, gameBootstrap, gameMain] = await Promise.all([
      import('/src/idle/markup.ts'),
      import('/lineage-idle/src/core/StateManager.js'),
      import('/lineage-idle/src/core/GameBootstrap.js'),
      import('/lineage-idle/main.js')
    ]);
    document.body.innerHTML = IDLE_MARKUP;
    gameMain.setRoot(document);
    await gameBootstrap.bootstrap(document);
    gameMain.init();
    const live = stateManager.getState();
    return {
      savePresent: Boolean(localStorage.getItem('lineageIdleSave_v2')),
      restored: live.class === 'fighter' && live.race === 'human' && live.charName === 'Functional Audit Save' &&
        live.level === 39 && live.gold === 987654 && live.skills?.power_strike === 1 &&
        live.skills?.weapon_mastery === 2 && live.skillLoadout?.core1 === 'power_strike',
      observed: { class: live.class, race: live.race, charName: live.charName, level: live.level, gold: live.gold, skills: live.skills, loadout: live.skillLoadout }
    };
  });
  const realApplicationSaveReloadPass = productionSaveSeed.savePresent && productionSaveSeed.loaded &&
    productionSaveReload.savePresent && productionSaveReload.restored;

  const after = snapshot();
  const unchanged = JSON.stringify(before.hashes) === JSON.stringify(after.hashes) && before.head === after.head;
  const proofs = [
    ...results.mutations,
    results.detectWeaknessDamage,
    results.provokeDamage,
    results.vampiricRageLifesteal,
    results.longShotBowDamage,
    results.roarOfDeathCombat,
    results.ultimateEvasionCombat,
    results.lionheartPveDamage,
    results.deathWhisperCriticalDamage,
    results.clarityMpCost,
    results.potionMastery,
    ...results.blockedClassSkillEffects,
    ...results.continuity,
    ...results.promotions,
    { name: 'productionPromotionModalRendering', pass: results.promotionModalUI.pass, evidence: results.promotionModalUI },
    { name: 'actualCharacterCreationScreenAudit', pass: results.creationScreenUI.failures.length === 0, evidence: results.creationScreenUI },
    { name: 'productionSkillWindowRendering', pass: skillWindowRendering.pass, evidence: skillWindowRendering },
    { name: 'realGameBootstrapSaveReload', pass: realApplicationSaveReloadPass, evidence: { productionSaveSeed, productionSaveReload, productionConsumer: 'GameBootstrap.bootstrap -> StateManager.loadState -> main.init' } },
    { name: 'snapshotUnchangedDuringRun', pass: unchanged },
    { name: 'unhandledBrowserErrors', pass: browserErrors.length === 0, errors: browserErrors, locations: runtimeErrorLocations }
  ];
  const coverage = [
    {
      name: 'independentProvenance',
      expectedCount: results.provenance.totalClasses,
      executedCount: results.provenance.totalClasses,
      passedCount: 0,
      blockedCount: results.provenance.contentGapCount + results.provenance.unprovenProvenanceCount,
      notValidatedCount: results.provenance.notValidatedCount,
      failedCount: results.provenance.status === 'FAIL' ? 1 : 0,
      executed: true,
      complete: false,
      pass: results.provenance.pass,
      details: results.provenance
    },
    {
      name: 'effectContractForEverySkill',
      expectedCount: results.effectCoverage.totalUniqueSkills,
      executedCount: results.effectCoverage.totalUniqueSkills,
      passedCount: results.effectCoverage.implementedContracts,
      blockedCount: results.effectCoverage.unimplementedSkills.length,
      notValidatedCount: results.effectCoverage.unmappedSkills.length,
      failedCount: 0,
      executed: true,
      complete: results.effectCoverage.pass,
      pass: results.effectCoverage.pass,
      details: results.effectCoverage
    },
    {
      name: 'creationRootSkillTreeViewModels',
      expectedCount: results.creationRootsUI.rootsCount,
      executedCount: results.creationRootsUI.results.length,
      passedCount: results.creationRootsUI.results.filter(r => !r.isGap && r.pass).length,
      blockedCount: results.creationRootsUI.contentGapRoots,
      notValidatedCount: 0,
      failedCount: results.creationRootsUI.results.filter(r => !r.pass).length,
      executed: true,
      complete: results.creationRootsUI.pass && results.creationRootsUI.contentGapRoots === 0,
      pass: results.creationRootsUI.pass,
      details: results.creationRootsUI
    },
    {
      name: 'promotionServiceAndSkillTreeViewModels',
      expectedCount: results.promotionViewModels.promotionsCount,
      executedCount: results.promotionViewModels.resultsCount,
      passedCount: results.promotionViewModels.pass ? results.promotionViewModels.resultsCount : 0,
      blockedCount: 0,
      notValidatedCount: 0,
      failedCount: results.promotionViewModels.pass ? 0 : 1,
      executed: true,
      complete: results.promotionViewModels.pass && results.promotionViewModels.resultsCount === results.promotionViewModels.promotionsCount,
      pass: results.promotionViewModels.pass,
      details: results.promotionViewModels
    },
    {
      name: 'creationRootUIRendering',
      expectedCount: results.creationRootsUI.rootsCount,
      executedCount: results.creationScreenUI.classOptionCount,
      passedCount: Math.max(0, results.creationScreenUI.activeClassCount - results.creationScreenUI.failures.filter(f => f.issue?.includes('portrait')).length),
      blockedCount: results.creationRootsUI.contentGapRoots,
      notValidatedCount: Math.max(0, results.creationRootsUI.rootsCount - results.creationScreenUI.classOptionCount),
      failedCount: results.creationScreenUI.failures.filter(f => f.issue?.includes('portrait')).length,
      executed: true,
      complete: results.creationScreenUI.failures.length === 0 && results.creationScreenUI.activeClassCount === results.creationRootsUI.activeRoots,
      pass: results.creationScreenUI.failures.length === 0 && results.creationScreenUI.activeClassCount === results.creationRootsUI.activeRoots,
      details: results.creationScreenUI
    },
    {
      name: 'promotionUIRendering',
      expectedCount: results.promotionModalUI.promotionsCount,
      executedCount: results.promotionModalUI.results.length,
      passedCount: results.promotionModalUI.renderedCount,
      blockedCount: 0,
      notValidatedCount: Math.max(0, results.promotionModalUI.promotionsCount - results.promotionModalUI.results.length),
      failedCount: results.promotionModalUI.failedCount,
      executed: true,
      complete: results.promotionModalUI.pass,
      pass: results.promotionModalUI.pass,
      details: results.promotionModalUI
    },
    {
      name: 'allSubclassActivationSwitches',
      expectedCount: results.subclassTransitions.destinationsExpected,
      executedCount: results.subclassTransitions.destinationsTested,
      passedCount: results.subclassTransitions.results.filter(r => r.pass).length,
      blockedCount: 0,
      notValidatedCount: 0,
      failedCount: results.subclassTransitions.results.filter(r => !r.pass).length,
      executed: true,
      complete: results.subclassTransitions.pass,
      pass: results.subclassTransitions.pass,
      details: results.subclassTransitions
    },
    {
      name: 'realApplicationSaveReload',
      expectedCount: 1,
      executedCount: 1,
      passedCount: realApplicationSaveReloadPass ? 1 : 0,
      blockedCount: 0,
      notValidatedCount: 0,
      failedCount: realApplicationSaveReloadPass ? 0 : 1,
      executed: true,
      complete: realApplicationSaveReloadPass,
      pass: realApplicationSaveReloadPass,
      details: { productionSaveSeed, productionSaveReload, productionConsumer: 'GameBootstrap.bootstrap -> StateManager.loadState -> main.init', isolatedBrowserProfile: true }
    },
    {
      name: 'productionSkillWindowRendering',
      expectedCount: skillWindowRendering.expectedRenders,
      executedCount: skillWindowRendering.renderedCount,
      passedCount: skillWindowRendering.passedCount,
      blockedCount: 0,
      notValidatedCount: Math.max(0, skillWindowRendering.expectedRenders - skillWindowRendering.renderedCount),
      failedCount: skillWindowRendering.failures.length,
      executed: true,
      complete: skillWindowRendering.pass,
      pass: skillWindowRendering.pass,
      details: skillWindowRendering
    },
    {
      name: 'effectsForSkillsOnlyPresentInBlockedClasses',
      expectedCount: results.blockedClassSkillEffects.length,
      executedCount: results.blockedClassSkillEffects.length,
      passedCount: results.blockedClassSkillEffects.filter(proof => proof.pass).length,
      blockedCount: 0,
      notValidatedCount: 0,
      failedCount: results.blockedClassSkillEffects.filter(proof => !proof.pass).length,
      executed: true,
      complete: results.blockedClassSkillEffects.every(proof => proof.pass),
      pass: results.blockedClassSkillEffects.every(proof => proof.pass),
      details: results.blockedClassSkillEffects.map(({ name, pass, classAssignmentValidated }) => ({ name, pass, classAssignmentValidated }))
    }
  ];

  const report = {
    meta: {
      generatedAt: new Date().toISOString(),
      environment: { browser: await browser.version(), node: process.version, isolatedProfile: true, network: 'local-only', bootstrap: 'production GameBootstrap and main.init; save reload in disposable profile' },
      snapshot: before,
      snapshotUnchanged: unchanged,
      ...summarizeAudit(results.classes, proofs, coverage)
    },
    proofs,
    results: results.classes
  };

  const reportPath = path.join(root, 'scripts/functional_chain_test_report.json');
  const reportTempPath = `${reportPath}.${process.pid}.tmp`;
  fs.writeFileSync(reportTempPath, JSON.stringify(report, null, 2));
  fs.renameSync(reportTempPath, reportPath);
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
