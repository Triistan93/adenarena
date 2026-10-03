import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterUICallbacks, updateCharacterUI } from '../lineage-idle/src/ui/GameUI.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { NextActionAdvisor } from '../lineage-idle/src/services/NextActionAdvisor.js';

describe('NextActionAdvisor na ficha do herói', () => {
  it('atualiza a interface e salva ao executar autoequip pela recomendação', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let updateCalls = 0;
    const saveCalls = [];
    const advisor = {
      style: {},
      set innerHTML(_html) {
        actionButton = { onclick: null };
      },
      querySelector(selector) {
        return selector === '#advisor-action-btn' ? actionButton : null;
      }
    };
    const root = {
      querySelector(selector) {
        return selector === '#next-action-advisor-char' ? advisor : null;
      },
      querySelectorAll(selector) {
        return selector === '.tab-btn[data-tab]' ? [zoneTab] : [];
      }
    };
    const zoneTab = { dataset: { tab: 'zones' }, click() { this.clicked = true; } };

    const gameItems = {
      ...ALL_ITEMS,
      short_sword: { id: 'short_sword', slot: 'weapon', type: 'sword', atk: 5000, req: { level: 1 }, grade: 'NG' },
      wooden_breastplate: { id: 'wooden_breastplate', slot: 'armor', type: 'light', def: 5000, req: { level: 1 }, grade: 'NG' }
    };
    globalThis.window = { GameData: { ALL_ITEMS: gameItems } };
    globalThis.document = {
      getElementById(id) {
        return id === 'idle-host' ? { shadowRoot: root } : null;
      }
    };

    try {
      const state = DEFAULT_STATE();
      state.class = 'fighter';
      state.level = 10;
      state.base = { atk: 5000, def: 5000, matk: 0, mdef: 0, eva: 0 };
      state.equipment = {};
      state.inventory = [
        { uid: 'advisor-test-sword', itemId: 'short_sword', slot: 'weapon', atk: 5000, count: 1 },
        { uid: 'advisor-test-armor', itemId: 'wooden_breastplate', slot: 'armor', def: 5000, count: 1 }
      ];
      const callbacks = createCharacterUICallbacks({
        root,
        updateAllUI: () => { updateCalls += 1; },
        save: (...args) => saveCalls.push(args)
      });

      updateCharacterUI(state, callbacks);
      assert.equal(typeof actionButton?.onclick, 'function', 'a recomendação deve expor sua ação');
      actionButton.onclick({ preventDefault() {} });

      assert.ok(state.equipment.weapon, 'o item recomendado deve ser equipado');
      assert.equal(updateCalls, 1, 'a interface deve ser atualizada uma única vez após o autoequip');
      assert.deepEqual(saveCalls, [[true, true]], 'o autoequip deve pedir salvamento imediato');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('leva a próxima meta para a aba real de zonas', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(_html) { actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const zoneTab = {
      dataset: { tab: 'zones' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [zoneTab] : []; }
    };
    globalThis.window = { GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'AdenRookie', race: 'human', class: 'fighter', level: 1,
        equipment: { weapon: 'starter_wpn', armor: 'starter_chest' },
        inventory: [
          { uid: 'starter_wpn', itemId: 'short_sword', slot: 'weapon', atk: 18, count: 1, equipped: true },
          { uid: 'starter_chest', itemId: 'wooden_breastplate', slot: 'armor', def: 12, count: 1, equipped: true }
        ]
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);
      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'zones');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('leva o aviso do cap para Missões Disponíveis pela aba real de missões', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let renderedMarkup = '';
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const questsTab = {
      dataset: { tab: 'quests' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [questsTab] : []; }
    };
    globalThis.window = { GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'SeasonCappedHero', race: 'human', class: 'duelist', level: 40,
        serverMaxLevel: 40, serverCap: 40, levelCap: 40,
        equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(renderedMarkup, /Limite da Temporada Alcançado/);
      assert.match(renderedMarkup, /caçar mais XP não vai liberar/);
      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'quests');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('mostra uma transferência já disponível e leva à ficha do Herói antes do aviso de cap', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let renderedMarkup = '';
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const characterTab = {
      dataset: { tab: 'character' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [characterTab] : []; }
    };
    globalThis.window = { GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'SeasonCappedWarrior', race: 'human', class: 'warrior', level: 40,
        serverMaxLevel: 40, serverCap: 40, levelCap: 40,
        equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(renderedMarkup, /2ª Troca de Classe Disponível/);
      assert.doesNotMatch(renderedMarkup, /Limite da Temporada Alcançado/);
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'character');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('abre o modal de evolução ao executar a CTA de transferência de classe', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let modalOpenCount = 0;
    const advisor = {
      style: {},
      set innerHTML(markup) { actionButton = { onclick: null }; this.markup = markup; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll() { return []; }
    };
    globalThis.window = { GameData: { ALL_ITEMS }, openClassTransferModal() { modalOpenCount += 1; } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'EligibleWarrior', race: 'human', class: 'fighter', level: 20,
        serverMaxLevel: 40, equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(advisor.markup, /Escolher Evolução/);
      actionButton.onclick({ preventDefault() {} });
      assert.equal(modalOpenCount, 1, 'a CTA deve abrir o modal canônico de transferência');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('ao concluir a Torre, leva o jogador para Raids quando a temporada libera essa área', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let renderedMarkup = '';
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const raidsTab = {
      dataset: { tab: 'raids' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [raidsTab] : []; }
    };
    globalThis.window = { __serverSeason: 4, GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'TowerConqueror', race: 'human', class: 'duelist', level: 120,
        serverMaxLevel: 120, tower: { highestFloor: 100, currentFloor: 100 },
        equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(renderedMarkup, /Torre da Insolência Conquistada/);
      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'raids');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('em save legado acima do cap, explica a temporada e encaminha para Missões', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let renderedMarkup = '';
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const questsTab = {
      dataset: { tab: 'quests' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [questsTab] : []; }
    };
    globalThis.window = { __serverSeason: 1, GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        charName: 'LegacyOverCapHero', race: 'human', class: 'gladiator', level: 76,
        serverMaxLevel: 40, serverCap: 40,
        tower: { highestFloor: 0, currentFloor: 1 }, equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(renderedMarkup, /Próximo conteúdo ainda bloqueado/);
      assert.match(renderedMarkup, /temporadas futuras/);
      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'quests');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('ao recomendar uma receita pronta, abre a aba real da Forja', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let renderedMarkup = '';
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(markup) { renderedMarkup = markup; actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const craftTab = {
      dataset: { tab: 'craft' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [craftTab] : []; }
    };
    globalThis.window = {
      __serverSeason: 1,
      GameData: {
        ALL_ITEMS: {
          novice_sword: { id: 'novice_sword', name: 'Novice Sword', slot: 'weapon', req: { level: 1 }, grade: 'NG' },
          iron_ore: { id: 'iron_ore', name: 'Iron Ore', slot: 'material' }
        },
        CRAFTING_RECIPES: {
          novice_sword_recipe: {
            id: 'novice_sword_recipe', itemId: 'novice_sword', minPlayerLevel: 1,
            craftLevel: 1, gold: 100, materials: [{ matId: 'iron_ore', qty: 2 }]
          }
        }
      }
    };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        level: 10, class: 'fighter', race: 'human', accountForgeLevel: 1,
        gold: 500, equipment: {},
        inventory: [{ uid: 'iron-ore-stack', itemId: 'iron_ore', count: 2 }]
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.match(renderedMarkup, /Forja Imperial: Criação Pronta/);
      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'craft');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('ao recomendar encantamento, abre o modal com o equipamento e pergaminho corretos', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let enchantRequest = null;
    const advisor = {
      style: {},
      set innerHTML(_markup) { actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll() { return []; }
    };
    globalThis.window = {
      GameData: { ALL_ITEMS },
      openEnchantFlowModal: (targetUid, scrollUid, state) => {
        enchantRequest = { targetUid, scrollUid, state };
      }
    };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        level: 45, class: 'gladiator', race: 'human',
        equipment: { weapon: 'wpn-tsurugi' },
        inventory: [
          { uid: 'wpn-tsurugi', itemId: 'tsurugi', slot: 'weapon', grade: 'C', atk: 130, count: 1, equipped: true, enchant: 0 },
          { uid: 'scrl-c', itemId: 'scroll_enchant_weapon_c', slot: 'scroll', count: 3 }
        ]
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.deepEqual(enchantRequest, { targetUid: 'wpn-tsurugi', scrollUid: 'scrl-c', state });
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('com a classe elegível e a Torre liberada, abre o painel da Torre como próxima meta', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    let actionButton;
    let clickedTab = null;
    const advisor = {
      style: {},
      set innerHTML(_markup) { actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const towerTab = {
      dataset: { tab: 'tower' },
      click() { clickedTab = this.dataset.tab; }
    };
    const root = {
      querySelector(selector) { return selector === '#next-action-advisor-char' ? advisor : null; },
      querySelectorAll(selector) { return selector === '.tab-btn[data-tab]' ? [towerTab] : []; }
    };
    globalThis.window = { __serverSeason: 3, GameData: { ALL_ITEMS } };
    globalThis.document = { getElementById: id => id === 'idle-host' ? { shadowRoot: root } : null };

    try {
      const state = {
        level: 76, class: 'duelist', race: 'human', serverMaxLevel: 85,
        tower: { highestFloor: 0, currentFloor: 1 }, equipment: {}, inventory: []
      };
      const callbacks = createCharacterUICallbacks({ root, updateAllUI() {}, save() {} });
      updateCharacterUI(state, callbacks);

      assert.equal(typeof actionButton?.onclick, 'function');
      actionButton.onclick({ preventDefault() {} });
      assert.equal(clickedTab, 'tower');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
      if (previousDocument === undefined) delete globalThis.document;
      else globalThis.document = previousDocument;
    }
  });

  it('ao recomendar uma receita pronta, navega à Forja e abre o item recomendado', () => {
    const previousWindow = globalThis.window;
    const events = [];
    let actionButton;
    const recipe = {
      id: 'advisor_sword_recipe', itemId: 'advisor_sword', level: 1, craftLevel: 1,
      minPlayerLevel: 1, gold: 100, materials: [{ matId: 'iron_ore', qty: 2 }]
    };
    const gameData = {
      ALL_ITEMS: {
        equipped_sword: { id: 'equipped_sword', name: 'Equipped Sword', slot: 'weapon', atk: 10000, req: { level: 1 }, grade: 'NG' },
        advisor_sword: { id: 'advisor_sword', name: 'Advisor Sword', slot: 'weapon', atk: 12000, req: { level: 1 }, grade: 'NG' },
        iron_ore: { id: 'iron_ore', name: 'Iron Ore', slot: 'material' }
      },
      CRAFTING_RECIPES: { advisor_sword_recipe: recipe }
    };
    globalThis.window = {
      GameData: gameData,
      openCraftModal: itemId => events.push(`modal:${itemId}`)
    };

    const container = {
      style: {},
      set innerHTML(_markup) { actionButton = { onclick: null }; },
      querySelector(selector) { return selector === '#advisor-action-btn' ? actionButton : null; }
    };
    const state = {
      level: 10, class: 'fighter', race: 'human', gold: 1000,
      accountForgeLevel: 1, craftLevel: 1,
      equipment: { weapon: 'equipped_sword' },
      inventory: [
        { uid: 'equipped_sword', itemId: 'equipped_sword', slot: 'weapon', count: 1, equipped: true },
        { uid: 'ore-stack', itemId: 'iron_ore', count: 2 }
      ]
    };

    try {
      const advice = NextActionAdvisor.getAdvice(state);
      assert.equal(advice.category, 'FORGE');
      assert.equal(advice.actionPayload.itemId, 'advisor_sword');

      NextActionAdvisor.render(state, container, {
        switchTab: tab => events.push(`tab:${tab}`)
      });
      actionButton.onclick({ preventDefault() {} });

      assert.deepEqual(events, ['tab:craft', 'modal:advisor_sword']);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
