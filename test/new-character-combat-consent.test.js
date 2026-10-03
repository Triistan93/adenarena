import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

import { applyStarterKit, DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { shouldStartCombatAtStartup } from '../lineage-idle/src/core/CombatStartupPolicy.js';

test('a new character starts in a safe zone with auto-combat paused until the player chooses', () => {
  const state = DEFAULT_STATE();

  applyStarterKit(state, 'human', 'fighter', 'ConsentTest', 'M');

  assert.equal(state.zone, 'talkingIsland');
  assert.equal(state.isCombatActive, false);
});

test('startup resumes saved combat but respects an explicit pause', () => {
  assert.equal(shouldStartCombatAtStartup({ zone: 'talkingIsland', isCombatActive: true }), true);
  assert.equal(shouldStartCombatAtStartup({ zone: 'talkingIsland', isCombatActive: false }), false);
  assert.equal(shouldStartCombatAtStartup({ zone: null, isCombatActive: true }), false);
});

// Execute the production boot body with isolated browser/timer adapters. State and
// persistence remain the real StateManager; no browser save or cloud is accessed.
for (const combatActive of [false, true]) {
  test(`bootstrap preserves a saved ${combatActive ? 'active' : 'paused'} combat state`, async (t) => {
    const oldStorage = globalThis.localStorage;
    const values = new Map();
    globalThis.localStorage = {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key)
    };
    t.after(() => {
      if (oldStorage === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = oldStorage;
    });
    const manager = await import(`../lineage-idle/src/core/StateManager.js?boot-consent-${combatActive}-${Date.now()}`);
    const state = manager.getState();
    manager.applyStarterKit(state, 'human', 'fighter', 'SavedConsent', 'M');
    state.isCombatActive = combatActive;
    state.gold = 45678;
    assert.equal(manager.saveState(), true);
    const preserved = values.get('lineageIdleSave_v2');
    let combatStarts = 0;
    let starterApplications = 0;
    const bootSource = readFileSync(new URL('../lineage-idle/src/core/GameBootstrap.js', import.meta.url), 'utf8')
      .replace(/^import .*;\r?$/gm, '')
      .replace(/^export /gm, '');
    const context = vm.createContext({
      console: { log() {}, warn() {}, error(err) { throw err; } },
      localStorage: globalThis.localStorage,
      EventBus: { off() {}, on() {} },
      setDomRoot() {}, setMainRoot() {}, bindEvents() {},
      ...manager,
      applyStarterKit(...args) { starterApplications++; return manager.applyStarterKit(...args); },
      CommunityCapService: { init() {} },
      updateAllUI() {},
      shouldStartCombatAtStartup,
      startCombat() { combatStarts++; }, stopCombat() {},
      _intervals: [],
      setInterval() { return 1; }, setTimeout() { return 1; },
      addTrackedListener() {}, cleanupTracked() {}, el() { return null; }
    });
    vm.runInContext(bootSource, context, { filename: 'GameBootstrap.js' });
    await vm.runInContext('bootstrap(null)', context);
    assert.equal(combatStarts, combatActive ? 1 : 0);
    assert.equal(starterApplications, 0, 'a saved character must not receive a replacement starter kit');
    assert.equal(manager.getState().isCombatActive, combatActive);
    assert.equal(manager.getState().gold, 45678);
    assert.equal(values.get('lineageIdleSave_v2'), preserved, 'boot must not rewrite an existing save');
  });
}

test('bootstrap grava o estado local de forma síncrona ao sair da página', async (t) => {
  const oldStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
  t.after(() => {
    if (oldStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = oldStorage;
  });

  const manager = await import(`../lineage-idle/src/core/StateManager.js?boot-pagehide-${Date.now()}`);
  const listeners = [];
  let cloudFlushes = 0;
  const window = { saveCloudOnUnload() { cloudFlushes++; } };
  const document = { visibilityState: 'visible' };
  const bootSource = readFileSync(new URL('../lineage-idle/src/core/GameBootstrap.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?$/gm, '')
    .replace(/^export /gm, '');
  const context = vm.createContext({
    console: { log() {}, warn() {}, error(err) { throw err; } },
    window,
    document,
    localStorage: globalThis.localStorage,
    EventBus: { off() {}, on() {} },
    setDomRoot() {}, setMainRoot() {}, bindEvents() {},
    ...manager,
    CommunityCapService: { init() {} },
    updateAllUI() {},
    shouldStartCombatAtStartup,
    startCombat() {}, stopCombat() {},
    _intervals: [],
    setInterval() { return 1; }, setTimeout() { return 1; },
    addTrackedListener(target, event, handler) { listeners.push({ target, event, handler }); },
    cleanupTracked() {}, el() { return null; }
  });

  vm.runInContext(bootSource, context, { filename: 'GameBootstrap.js' });
  await vm.runInContext('bootstrap(null)', context);
  const state = manager.getState();
  state.gold = 987654;

  const pageHide = listeners.find(listener => listener.target === window && listener.event === 'pagehide');
  assert.equal(typeof pageHide?.handler, 'function', 'bootstrap deve registrar o salvamento no evento pagehide');
  pageHide.handler();

  const savedState = JSON.parse(values.get('lineageIdleSave_v2'));
  assert.equal(savedState.gold, 987654, 'a gravação local síncrona deve incluir as mudanças mais recentes');
  assert.equal(cloudFlushes, 1, 'o encerramento também deve solicitar a sincronização cloud pendente');
});
