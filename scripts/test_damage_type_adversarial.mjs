/**
 * scripts/test_damage_type_adversarial.mjs
 * Teste adversarial de tipo de dano (Bug 03):
 * 3 skills físicas (power_strike, mortal_blow, blade_strike)
 * 3 skills mágicas (wind_strike, hydro_blast, prominence)
 * Executadas sob P.Atk > M.Atk e M.Atk > P.Atk.
 */

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
server.middlewares.use('/__damage_audit', (_req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><html><body><main id="audit"></main></body></html>'); });

let browser;
try {
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext();
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const page = await context.newPage();
  await page.goto(`${origin}/__damage_audit`);

  const results = await page.evaluate(async () => {
    await import('/lineage-idle/src/data/items/index.js');
    await import('/lineage-idle/src/data/classes/index.js');
    await import('/lineage-idle/data/echo-adapter.js');
    const { attackMonster, setRoot, isMagicSkillDef } = await import('/lineage-idle/main.js');
    const { getState, DEFAULT_STATE } = await import('/lineage-idle/src/core/StateManager.js');
    const { getStats } = await import('/lineage-idle/src/engine/StatsEngine.js');
    const { equipSkill } = await import('/lineage-idle/src/services/SkillLoadoutService.js');
    const { combatEvents, CombatEventType } = await import('/lineage-idle/src/vfx/CombatEvent.js');

    setRoot(document);

    const testCases = [
      // 3 Físicas
      { skillId: 'power_strike', classId: 'fighter', declaredFamily: 'PHYSICAL_DAMAGE', isMagicExpected: false },
      { skillId: 'mortal_blow',  classId: 'rogue',   declaredFamily: 'PHYSICAL_DAMAGE', isMagicExpected: false },
      { skillId: 'blade_strike', classId: 'warrior', declaredFamily: 'PHYSICAL_DAMAGE', isMagicExpected: false },
      // 3 Mágicas
      { skillId: 'wind_strike',  classId: 'mage',        declaredFamily: 'MAGICAL_DAMAGE', isMagicExpected: true },
      { skillId: 'hydro_blast',  classId: 'spellsinger', declaredFamily: 'MAGICAL_DAMAGE', isMagicExpected: true },
      { skillId: 'prominence',   classId: 'sorcerer',    declaredFamily: 'MAGICAL_DAMAGE', isMagicExpected: true },
    ];

    const outcomes = [];

    for (const tc of testCases) {
      for (const scenario of ['high_patk', 'high_matk']) {
        const state = getState();
        for (const k of Object.keys(state)) delete state[k];
        Object.assign(state, DEFAULT_STATE(), {
          class: tc.classId,
          race: 'human',
          level: 40,
          sp: 10000,
          skills: { [tc.skillId]: 1 },
          skillLoadout: { core1: tc.skillId },
          isCombatActive: true,
          zone: null,
          isRaidActive: true,
          target: 'audit_target',
          activeMonster: { id: 'audit_target', name: 'Audit Target', hp: 100000, maxHp: 100000, atk: 1, def: 10, mdef: 10, level: 1, atkSpd: 0.001 },
          equipment: {},
          inventory: []
        });

        // Configurar arma para forçar P.Atk > M.Atk ou M.Atk > P.Atk
        if (scenario === 'high_patk') {
          state.inventory.push({ uid: 'wpn_phys', itemId: 'wpn_phys', slot: 'weapon', atk: 500, matk: 10, count: 1 });
          state.equipment.weapon = 'wpn_phys';
        } else {
          state.inventory.push({ uid: 'wpn_mag', itemId: 'wpn_mag', slot: 'weapon', atk: 10, matk: 500, count: 1 });
          state.equipment.weapon = 'wpn_mag';
        }

        const stats = getStats(state);
        state.maxHp = stats.maxHp; state.hp = stats.maxHp;
        state.maxMp = stats.maxMp; state.mp = stats.maxMp;
        state._cds = {};

        const emitted = [];
        const listener = ev => emitted.push(ev);
        combatEvents.on(CombatEventType.SKILL_DAMAGE, listener);

        try {
          attackMonster();
        } catch (e) {
          // ignore
        } finally {
          combatEvents.off(CombatEventType.SKILL_DAMAGE, listener);
        }

        const def = window.EchoData.SKILL_DEFS_ECHO[tc.skillId];
        const isMagicDispatched = isMagicSkillDef(def, tc.skillId);
        const oldBugCondition = stats.matk > stats.atk;
        outcomes.push({
          skillId: tc.skillId,
          declaredFamily: tc.declaredFamily,
          scenario,
          patk: stats.atk,
          matk: stats.matk,
          oldBugConditionWouldInvert: tc.isMagicExpected !== oldBugCondition,
          isMagicExpected: tc.isMagicExpected,
          dispatcherResult: isMagicDispatched,
          dispatchPass: isMagicDispatched === tc.isMagicExpected
        });
      }
    }
    return outcomes;
  });

  console.log('=== RESULTADOS DO TESTE ADVERSARIAL DE DAMAGE TYPE ===');
  console.table(results);
} finally {
  if (browser) await browser.close();
  await server.close();
}
