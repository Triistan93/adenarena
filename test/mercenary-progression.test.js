import { test } from 'node:test';
import assert from 'node:assert/strict';

import { getMercenaryBondTier, getMercenaryXpForLevel } from '../lineage-idle/src/data/mercenaries.js';
import { MercenaryService } from '../lineage-idle/src/services/MercenaryService.js';
import { ExpeditionService } from '../lineage-idle/src/services/ExpeditionService.js';
import { renderExpeditionsUI } from '../lineage-idle/src/ui/GameUI.js';

test('bond tiers expose clear milestones and progress toward the next rank', () => {
  assert.equal(getMercenaryBondTier(0).name, 'Desconfiado');
  assert.equal(getMercenaryBondTier(49).name, 'Conhecido');
  assert.equal(getMercenaryBondTier(50).name, 'Companheiro');
  assert.equal(getMercenaryBondTier(80).name, 'Confiável');
  assert.equal(getMercenaryBondTier(100).name, 'Juramentado');
  assert.equal(getMercenaryBondTier(50).progressPct, 0);
  assert.equal(getMercenaryBondTier(75).progressPct, 83);
  assert.equal(getMercenaryBondTier(100).progressPct, 100);
});

test('mercenário no nível máximo não exibe uma barra de XP impossível de completar', () => {
  assert.equal(getMercenaryXpForLevel(19), 28_880);
  assert.equal(getMercenaryXpForLevel(20), 0);
});

test('legacy loyalty is migrated to canonical trust without changing its value', () => {
  const merc = { uid: 'legacy-merc', loyalty: 83, level: 4, xp: 90 };
  const state = { mercenaries: { owned: [merc], tavernPool: [] } };

  const result = MercenaryService.getMercenariesState(state).owned[0];

  assert.equal(result.trust, 83);
  assert.equal(result.loyalty, 83);
  assert.equal(result.level, 4);
  assert.equal(result.xp, 90);
});

test('ganho de XP mantém vínculo e lealdade sincronizados no retorno e no save', () => {
  const state = {
    mercenaries: {
      owned: [{ uid: 'xp-merc', level: 1, xp: 0, trust: 50, loyalty: 50 }],
      tavernPool: []
    }
  };

  const progression = MercenaryService.addMercenaryXp(state, 'xp-merc', 10);

  assert.equal(progression.trust, 52);
  assert.equal(state.mercenaries.owned[0].trust, 52);
  assert.equal(state.mercenaries.owned[0].loyalty, 52);
});

test('o vínculo máximo concede bônus extra de materiais na expedição', () => {
  const effects = ExpeditionService.calculateSquadSynergies('unknown_destination', [
    { uid: 'bonded-merc', spec: 'guardian', rarity: 'legendary', level: 20, trust: 100 }
  ]);

  assert.equal(effects.goldBonusPct, 0.20);
  assert.equal(effects.extraXpPct, 0.10);
  assert.equal(effects.extraMaterialChance, 0.05);
  assert.ok(effects.activePerks.some(perk => perk.includes('Juramentado')));
});

test('quartel mostra raridade, nível, vínculo e progresso em linguagem de jogo', () => {
  const oldDocument = globalThis.document;
  const oldWindow = globalThis.window;
  const container = { innerHTML: '' };
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#tab-expeditions, .tab-expeditions' ? container : null
  };
  globalThis.window = {};

  try {
    renderExpeditionsUI({
      level: 100,
      gold: 0,
      expeditions: [],
      mercenaries: {
        owned: [{
          uid: 'visible-merc', name: 'Mercenário de Teste', title: 'Sentinela', icon: '🛡️',
          spec: 'guardian', rarity: 'epic', level: 8, xp: 1000, trust: 85, trait: 'veteran'
        }],
        tavernPool: []
      }
    });

    assert.match(container.innerHTML, /ÉPICO/);
    assert.match(container.innerHTML, /Acampamento da Companhia/);
    assert.match(container.innerHTML, /Mural de contratos e trabalhos/);
    assert.match(container.innerHTML, /role="tablist"/);
    assert.match(container.innerHTML, /OPERAÇÕES/);
    assert.match(container.innerHTML, /aria-selected="true"/);
    assert.match(container.innerHTML, /data-hub-panel="overview"[^>]*display:block/);
    assert.match(container.innerHTML, /data-hub-panel="roster"[^>]*display:none/);
    assert.match(container.innerHTML, /Treinamento de Campo/);
    assert.match(container.innerHTML, /Caçada de Provisões/);
    assert.match(container.innerHTML, /Pesca de Suprimentos/);
    assert.match(container.innerHTML, /Extração de Minério/);
    assert.match(container.innerHTML, /Nv\. 8/);
    assert.match(container.innerHTML, /Confiável/);
    assert.match(container.innerHTML, /Vínculo/);
    assert.match(container.innerHTML, /Próximo vínculo/);

    globalThis.window._mercenaryHubView = 'roster';
    renderExpeditionsUI({ level: 100, gold: 0, expeditions: [], mercenaries: { owned: [], tavernPool: [] } });
    assert.match(container.innerHTML, /id="mercenary-tab-roster" role="tab" aria-selected="true"/);
    assert.match(container.innerHTML, /data-hub-panel="roster"[^>]*display:block/);
    assert.match(container.innerHTML, /data-hub-panel="overview"[^>]*display:none/);
  } finally {
    globalThis.document = oldDocument;
    globalThis.window = oldWindow;
  }
});
