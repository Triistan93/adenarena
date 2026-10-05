import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS, RARITY } from '../lineage-idle/src/data/items/index.js';
import { buyItem } from '../lineage-idle/src/services/ShopService.js';
import { openStoreQuantityModal, closeStoreQuantityModal } from '../lineage-idle/src/ui/GameUI.js';

function createMockElement(tag = 'div') {
  const el = {
    tagName: tag.toUpperCase(),
    id: '',
    className: '',
    style: {},
    dataset: {},
    innerHTML: '',
    children: [],
    appendChild: function(child) {
      this.children.push(child);
      return child;
    },
    remove: function() {
      this._removed = true;
    },
    querySelector: function(sel) {
      if (sel.startsWith('#')) {
        const targetId = sel.slice(1);
        if (this.id === targetId) return this;
        for (const c of this.children) {
          const found = c.querySelector(sel);
          if (found) return found;
        }
        return createMockElement('div');
      }
      return createMockElement('div');
    },
    querySelectorAll: function() {
      return [];
    },
    focus: function() {}
  };
  return el;
}

function withShopData(run) {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  const mockRegistry = new Map();
  const mockBody = createMockElement('body');
  mockBody.appendChild = function(child) {
    if (child.id) mockRegistry.set(child.id, child);
    this.children.push(child);
    return child;
  };

  globalThis.document = {
    body: mockBody,
    getElementById: (id) => mockRegistry.get(id) || null,
    createElement: (tag) => {
      const el = createMockElement(tag);
      const origRemove = el.remove;
      el.remove = function() {
        if (this.id) mockRegistry.delete(this.id);
        origRemove.call(this);
      };
      return el;
    },
    appendChild: (child) => mockBody.appendChild(child)
  };

  globalThis.window = {
    GameData: { ALL_ITEMS, RARITY },
    document: globalThis.document,
    getGameState: () => DEFAULT_STATE()
  };

  try {
    return run();
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
}

describe('Mercador — Compra Múltipla de Poções e Consumíveis', () => {
  it('1. Compra em massa de poções calcula custo exato e adiciona pilha inteira ao inventário', () => withShopData(() => {
    const state = DEFAULT_STATE();
    const itemId = 'hp_potion_s';
    const def = ALL_ITEMS[itemId];
    assert.ok(def, 'hp_potion_s deve existir no catálogo de itens');
    
    const qty = 50;
    const unitPrice = def.price || 25;
    const expectedCost = unitPrice * qty;
    
    state.gold = 500_000;
    const goldBefore = state.gold;

    const success = buyItem(state, itemId, qty);
    assert.equal(success, true, 'buyItem deve retornar true');
    assert.equal(state.gold, goldBefore - expectedCost, 'Gold deve ser debitado proporcionalmente à quantidade');

    const invItem = state.inventory.find(i => (i.itemId || i.id) === itemId);
    assert.ok(invItem, 'Item deve constar no inventário');
    assert.equal(invItem.count, qty, 'Contagem do item no inventário deve ser 50');
  }));

  it('2. Compra de Soulshots em grande volume (1.000x) calcula débito atômico sem corrupção', () => withShopData(() => {
    const state = DEFAULT_STATE();
    state.level = 20; // Soulshot D-grade requer Lv. 20
    const itemId = 'soulshot_d';
    const def = ALL_ITEMS[itemId];
    assert.ok(def, 'soulshot_d deve existir');

    const qty = 1000;
    const unitPrice = def.price || 15;
    const expectedCost = unitPrice * qty;

    state.gold = 100_000;
    const success = buyItem(state, itemId, qty);
    assert.equal(success, true);
    assert.equal(state.gold, 100_000 - expectedCost);

    const invItem = state.inventory.find(i => (i.itemId || i.id) === itemId);
    assert.ok(invItem);
    assert.equal(invItem.count, 1000);
  }));

  it('3. Rejeita compra em massa se o jogador não possuir Adena suficiente para a quantidade solicitada', () => withShopData(() => {
    const state = DEFAULT_STATE();
    const itemId = 'hp_potion_s';
    const def = ALL_ITEMS[itemId];
    assert.ok(def, 'hp_potion_s deve existir');

    const qty = 100;
    const unitPrice = def.price || 25;
    const requiredCost = unitPrice * qty;

    // Jogador tem menos ouro do que o necessário para 100x
    state.gold = requiredCost - 1;
    const initialGold = state.gold;

    const loggedMessages = [];
    const success = buyItem(state, itemId, qty, 'common', {
      log: (msg) => loggedMessages.push(msg)
    });

    assert.equal(success, false, 'Deve falhar por ouro insuficiente');
    assert.equal(state.gold, initialGold, 'Ouro não deve sofrer alteração');
    const invItem = state.inventory.find(i => (i.itemId || i.id) === itemId);
    assert.equal(invItem, undefined, 'Nenhum item deve ser inserido no inventário');
    assert.ok(loggedMessages.some(m => m.includes('insuficiente')), 'Deve registrar mensagem de ouro insuficiente');
  }));

  it('4. openStoreQuantityModal inicializa sem erros e closeStoreQuantityModal remove modal do DOM', () => withShopData(() => {
    const state = DEFAULT_STATE();
    state.gold = 50_000;

    assert.doesNotThrow(() => {
      openStoreQuantityModal({
        itemId: 'hp_potion_s',
        rarity: 'common',
        isMystic: false,
        basePrice: 25,
        initialQty: 10,
        state,
        callbacks: {}
      });
    }, 'openStoreQuantityModal deve executar sem exceções');

    const modal = globalThis.document.getElementById('shop-quantity-modal');
    assert.ok(modal, 'Modal #shop-quantity-modal deve ter sido criado no DOM');

    assert.doesNotThrow(() => {
      closeStoreQuantityModal();
    }, 'closeStoreQuantityModal deve executar sem erros');

    assert.equal(globalThis.document.getElementById('shop-quantity-modal'), null, 'Modal deve ter sido removido do DOM');
  }));
});
