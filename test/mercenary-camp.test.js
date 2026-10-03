import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MercenaryCampService } from '../lineage-idle/src/services/MercenaryCampService.js';
import { MercenaryService } from '../lineage-idle/src/services/MercenaryService.js';
import { renderExpeditionsUI } from '../lineage-idle/src/ui/GameUI.js';

function createState(overrides = {}) {
  return {
    level: 1,
    gold: 100_000,
    inventory: [
      { uid: 'iron', itemId: 'iron_ore', count: 40 },
      { uid: 'coal', itemId: 'coal', count: 20 }
    ],
    mercenaries: {
      owned: [
        { uid: 'camp-worker-1', name: 'Batedor', spec: 'tracker', rarity: 'rare', level: 1, xp: 0, trust: 50, basePower: 100 }
      ],
      tavernPool: []
    },
    expeditions: [],
    ...overrides
  };
}

test('acampamento inicia com uma vaga de trabalho e migra com segurança o save antigo', () => {
  const state = { mercenaries: { owned: [], tavernPool: [] } };
  const camp = MercenaryCampService.getCampState(state);

  assert.equal(camp.level, 1);
  assert.deepEqual(camp.assignments, []);
  assert.equal(MercenaryCampService.getWorkSlotLimit(state), 1);
});

test('falha ao despachar uma ordem explica o motivo e não altera o estado', () => {
  const state = createState({ gold: 0 });
  const entries = [];
  const beforeCamp = structuredClone(MercenaryCampService.getCampState(state));
  const result = MercenaryCampService.assignWork(state, 'training', 'camp-worker-1', {
    log: (message, category) => entries.push({ message, category })
  });

  assert.equal(result.reason, 'insufficient_gold');
  assert.equal(entries.length, 1);
  assert.equal(entries[0].category, 'warning');
  assert.match(entries[0].message, /Adena insuficiente/i);
  assert.deepEqual(MercenaryCampService.getCampState(state), beforeCamp);
  assert.equal(state.gold, 0);
});

test('contratos usam catálogos reais e não deixam um mercenário trabalhar em dois lugares', () => {
  const state = createState();
  const assignment = MercenaryCampService.assignWork(state, 'hunting', 'camp-worker-1');

  assert.equal(assignment.success, true);
  assert.equal(assignment.assignment.activityId, 'hunting');
  assert.ok(assignment.assignment.rewards.every(reward => reward.itemId));
  assert.equal(MercenaryCampService.isMercenaryWorking(state, 'camp-worker-1'), true);
  assert.equal(MercenaryCampService.assignWork(state, 'mining', 'camp-worker-1').reason, 'mercenary_busy');
  assert.equal(state.gold, 99_750);
});

test('trabalhador do acampamento fica indisponível também para expedições e dispensa', () => {
  const state = createState();
  MercenaryCampService.assignWork(state, 'hunting', 'camp-worker-1');

  assert.equal(MercenaryService.isMercenaryBusy(state, 'camp-worker-1'), true);
  assert.equal(MercenaryService.dismissMercenary(state, 'camp-worker-1'), false);
});

test('ordem concluída paga materiais, Adena, XP e vínculo; saque não pode ser coletado cedo nem duas vezes', () => {
  const state = createState();
  const { assignment } = MercenaryCampService.assignWork(state, 'mining', 'camp-worker-1');
  const tooEarly = MercenaryCampService.claimWork(state, assignment.id, { now: assignment.startTime + assignment.durationMs - 1 });
  assert.equal(tooEarly.reason, 'in_progress');

  const result = MercenaryCampService.claimWork(state, assignment.id, { now: assignment.startTime + assignment.durationMs });
  assert.equal(result.success, true);
  assert.ok(state.gold > 99_650);
  assert.ok(state.inventory.some(item => item.itemId === assignment.rewards[0].itemId));
  assert.equal(state.mercenaries.owned[0].level, 2);
  assert.equal(state.mercenaries.owned[0].xp, 5);
  assert.equal(state.mercenaries.owned[0].trust, 52);
  assert.equal(state.mercenaries.camp.renown, 2);
  assert.equal(MercenaryCampService.claimWork(state, assignment.id).reason, 'not_found');
});

test('ordem ativa permanece exclusiva e resgatável após a serialização de um save', () => {
  const original = createState();
  const { assignment } = MercenaryCampService.assignWork(original, 'training', 'camp-worker-1');
  const resumed = JSON.parse(JSON.stringify(original));

  assert.equal(MercenaryService.isMercenaryBusy(resumed, 'camp-worker-1'), true);
  assert.equal(MercenaryCampService.claimWork(resumed, assignment.id, { now: assignment.startTime + assignment.durationMs - 1 }).reason, 'in_progress');
  const claimed = MercenaryCampService.claimWork(resumed, assignment.id, { now: assignment.startTime + assignment.durationMs });
  assert.equal(claimed.success, true);
  assert.equal(MercenaryService.isMercenaryBusy(resumed, 'camp-worker-1'), false);
  assert.equal(MercenaryCampService.claimWork(resumed, assignment.id, { now: assignment.startTime + assignment.durationMs }).reason, 'not_found');
});

test('melhorar o acampamento consome custo uma vez e libera uma equipe adicional', () => {
  const state = createState();
  state.mercenaries.camp = { level: 1, renown: 5, assignments: [] };
  const result = MercenaryCampService.upgradeCamp(state);

  assert.equal(result.success, true);
  assert.equal(result.level, 2);
  assert.equal(state.gold, 50_000);
  assert.equal(MercenaryCampService.getWorkSlotLimit(state), 2);
  assert.equal(state.inventory.find(item => item.itemId === 'iron_ore')?.count, undefined);
});

test('melhoria sem recursos falha sem consumir Adena ou materiais', () => {
  const state = createState({ gold: 1, inventory: [] });
  const result = MercenaryCampService.upgradeCamp(state);

  assert.equal(result.reason, 'insufficient_gold');
  assert.equal(state.gold, 1);
  assert.deepEqual(state.inventory, []);
});

test('reputação insuficiente impede a evolução sem alterar a carteira ou o estoque', () => {
  const state = createState();
  const beforeInventory = structuredClone(state.inventory);
  const result = MercenaryCampService.upgradeCamp(state);

  assert.equal(result.reason, 'insufficient_renown');
  assert.equal(state.gold, 100_000);
  assert.deepEqual(state.inventory, beforeInventory);
});

test('mochila cheia deixa a ordem pronta para resgate e não duplica pagamento', () => {
  const inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `filler-${index}`, itemId: `filler_item_${index}`, count: 1 }));
  const state = createState({ inventory });
  const { assignment } = MercenaryCampService.assignWork(state, 'fishing', 'camp-worker-1');
  const beforeGold = state.gold;
  const beforeXp = state.mercenaries.owned[0].xp;
  const beforeInventory = structuredClone(state.inventory);

  const result = MercenaryCampService.claimWork(state, assignment.id, { now: assignment.startTime + assignment.durationMs });

  assert.equal(result.reason, 'inventory_full');
  assert.equal(state.mercenaries.camp.assignments.length, 1);
  assert.equal(state.gold, beforeGold);
  assert.equal(state.mercenaries.camp.renown, 0);
  assert.equal(state.mercenaries.owned[0].xp, beforeXp);
  assert.deepEqual(state.inventory, beforeInventory);

  while (state.inventory.length > 145) state.inventory.pop();
  const claimed = MercenaryCampService.claimWork(state, assignment.id, { now: assignment.startTime + assignment.durationMs });
  assert.equal(claimed.success, true);
  assert.equal(state.mercenaries.camp.assignments.length, 0);
  assert.ok(state.gold > beforeGold);
  assert.equal(MercenaryCampService.claimWork(state, assignment.id, { now: assignment.startTime + assignment.durationMs }).reason, 'not_found');
  for (const reward of assignment.rewards) {
    const total = state.inventory.filter(item => item.itemId === reward.itemId).reduce((sum, item) => sum + item.count, 0);
    assert.equal(total, reward.count);
  }
});

test('Mural exibe tempo restante durante o trabalho e botão Resgatar após conclusão', () => {
  const oldDocument = globalThis.document;
  const oldWindow = globalThis.window;
  const container = { innerHTML: '' };
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#tab-expeditions, .tab-expeditions' ? container : null
  };
  globalThis.window = {};

  try {
    const state = createState();
    const { assignment } = MercenaryCampService.assignWork(state, 'hunting', 'camp-worker-1');

    // Simula renderização durante o trabalho
    renderExpeditionsUI(state);
    assert.match(container.innerHTML, /min restantes/);
    assert.doesNotMatch(container.innerHTML, new RegExp(`window\\.claimMercenaryWork\\('${assignment.id}'\\)`));

    // Simula passagem do tempo
    assignment.startTime = Date.now() - assignment.durationMs - 1000;
    renderExpeditionsUI(state);
    assert.match(container.innerHTML, /Retorno no acampamento/);
    assert.match(container.innerHTML, new RegExp(`window\\.claimMercenaryWork\\('${assignment.id}'\\)`));
    assert.match(container.innerHTML, /Resgatar/);
  } finally {
    globalThis.document = oldDocument;
    globalThis.window = oldWindow;
  }
});
