import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import {
  craftElixir,
  dissolveItem,
  dissolveItemsByGrade,
  getDissolveYield,
  getGradeForItem
} from '../lineage-idle/src/services/AlchemyService.js';
import { renderAlchemyUI } from '../lineage-idle/src/ui/GameUI.js';

describe('Alquimia — integridade com estado descartável', () => {
  it('dissolução individual e em lote recusam carteira malformada sem consumir equipamento', () => {
    const item = { uid: 'invalid-wallet-frost', itemId: 'weapon_frost_lord_sword', count: 1 };
    const operations = [
      { run: (state) => dissolveItem(state, item.uid), expected: false },
      { run: (state) => dissolveItemsByGrade(state, 'frostlord'), expected: 0 },
    ];
    for (const operation of operations) {
      const state = DEFAULT_STATE();
      state.gold = 'invalid-wallet';
      state.inventory = [{ ...item }];
      const before = structuredClone(state);

      assert.equal(operation.run(state), operation.expected);
      assert.deepEqual(state, before);
    }
  });

  it('crafting rejects a malformed Adena wallet before adding elixir effects or consuming essences', () => {
    const state = DEFAULT_STATE();
    state.gold = 'invalid-wallet';
    state.essences = { fire: 100, earth: 100, wind: 100, water: 100 };
    const before = structuredClone(state);

    assert.equal(craftElixir(state, 'elixir_berserker', 1), false);
    assert.deepEqual(state, before);
  });

  it('não dissolve equipamento favorito nem quando o estado legado não está marcado como equipado', () => {
    const state = DEFAULT_STATE();
    state.gold = 100_000;
    state.inventory = [{ uid: 'favorite-sword', itemId: 'weapon_frost_lord_sword', count: 1, isFavorite: true }];
    const before = JSON.stringify({ inventory: state.inventory, gold: state.gold, essences: state.essences });

    assert.equal(dissolveItem(state, 'favorite-sword'), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, gold: state.gold, essences: state.essences }), before);
  });

  it('o lote preserva favoritos e itens equipados por UID mesmo se a marca do item estiver desatualizada', () => {
    const state = DEFAULT_STATE();
    state.gold = 100_000;
    state.equipment.weapon = 'stale-equipped-sword';
    state.inventory = [
      { uid: 'favorite-sword', itemId: 'weapon_frost_lord_sword', count: 1, favorite: true },
      { uid: 'stale-equipped-sword', itemId: 'weapon_frost_lord_axe', count: 1 },
      { uid: 'ordinary-sword', itemId: 'weapon_frost_lord_bow', count: 1 }
    ];

    assert.equal(dissolveItemsByGrade(state, 'frostlord'), 1);
    assert.deepEqual(state.inventory.map(item => item.uid), ['favorite-sword', 'stale-equipped-sword']);
    assert.equal(state.essences.fire, 300);
    assert.equal(state.gold, 85_000);
  });

  it('classifica equipamento Frost Lord como grau próprio e usa seu rendimento de 300 essências', () => {
    const inv = { uid: 'frost', itemId: 'weapon_frost_lord_sword' };
    const def = { id: inv.itemId, name: 'Frost Lord Sword', slot: 'weapon', tier: 6, req: { level: 80 } };
    assert.equal(getGradeForItem(def, inv), 'frostlord');
    assert.deepEqual(getDissolveYield(inv, def), {
      grade: 'frostlord', essenceType: 'fire', count: 300, fee: 15_000,
      essences: { fire: 300, earth: 0, wind: 0, water: 0 }
    });
  });

  it('não cobra essências nem Adena quando a mochila cheia impede guardar a Pedra de Convocação', () => {
    const state = DEFAULT_STATE();
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `alchemy-filler-${index}`, itemId: `alchemy_filler_${index}`, count: 1 }));
    state.gold = 50_000;
    state.essences = { fire: 100, earth: 0, wind: 0, water: 100 };
    const before = JSON.stringify({ inventory: state.inventory, gold: state.gold, essences: state.essences });

    assert.equal(craftElixir(state, 'boss_summon_stone'), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, gold: state.gold, essences: state.essences }), before);
  });

  it('rejeita quantidades inválidas sem converter zero ou frações em uma fabricação', () => {
    for (const quantity of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const state = DEFAULT_STATE();
      state.gold = 100_000;
      state.essences = { fire: 100, earth: 100, wind: 100, water: 100 };
      const before = JSON.stringify({ gold: state.gold, essences: state.essences, activeElixirs: state.activeElixirs });

      assert.equal(craftElixir(state, 'elixir_berserker', quantity), false);
      assert.equal(JSON.stringify({ gold: state.gold, essences: state.essences, activeElixirs: state.activeElixirs }), before);
    }
  });

  it('a prévia de produção exibe só o rendimento e a taxa reais para Frost Lord e libera os filtros altos', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    const container = { innerHTML: '' };
    const root = { querySelector: (selector) => selector.includes('tab-alchemy') ? container : null };
    globalThis.window = { GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: (id) => id === 'idle-host' ? { shadowRoot: root } : null };
    try {
      const state = DEFAULT_STATE();
      state.inventory = [{ uid: 'ui-frost', itemId: 'weapon_frost_lord_sword', count: 1 }];
      renderAlchemyUI(state);

      assert.match(container.innerHTML, /300 essência de Fogo/);
      assert.match(container.innerHTML, /15,000g/);
      assert.doesNotMatch(container.innerHTML, /\+120/);
      assert.doesNotMatch(container.innerHTML, /\+300<\/span>[\s\S]*\+300/);
      assert.match(container.innerHTML, /dissolveItemsByFilter\('a'\)/);
      assert.match(container.innerHTML, /dissolveItemsByFilter\('s'\)/);
      assert.match(container.innerHTML, /dissolveItemsByFilter\('frostlord'\)/);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });
});
