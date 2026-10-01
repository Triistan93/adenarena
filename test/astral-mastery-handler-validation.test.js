import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ASTRAL_NODES } from '../lineage-idle/src/engine/StatsEngine.js';

const mainSource = readFileSync(new URL('../lineage-idle/main.js', import.meta.url), 'utf8');
const handlerStart = mainSource.indexOf('function upgradeAstralNode(');
const handlerEnd = mainSource.indexOf('function reincarnateHero(', handlerStart);
assert.ok(handlerStart >= 0 && handlerEnd > handlerStart, 'production astral handler must be present');
const productionHandlerSource = mainSource.slice(handlerStart, handlerEnd);

function invokeProductionHandler(state, nodeId) {
  const createHandler = new Function(
    'state', 'ASTRAL_NODES', 'log', 'window', 'updateAllUI', 'save',
    `${productionHandlerSource}; return upgradeAstralNode;`
  );
  return createHandler(state, ASTRAL_NODES, () => {}, {}, () => {}, () => {})(nodeId);
}

describe('Maestria Astral — compra pelo handler de produção', () => {
  it('recusa chaves herdadas sem cobrar fragmentos nem gravar progresso', () => {
    for (const nodeId of ['__proto__', 'constructor', 'toString']) {
      const state = { prestigeLevel: 1, astralShards: 5, astralMastery: {} };
      const before = structuredClone(state);

      const result = invokeProductionHandler(state, nodeId);

      assert.equal(result, false, `nodeId=${nodeId}`);
      assert.deepEqual(state, before, `nodeId=${nodeId} must not mutate the save`);
    }
  });
});
