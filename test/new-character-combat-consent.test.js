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
