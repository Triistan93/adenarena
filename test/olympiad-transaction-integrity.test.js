import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { OlympiadService } from '../lineage-idle/src/services/OlympiadService.js';
import { OLYMPIAD_SHOP_CATALOG } from '../lineage-idle/src/data/olympiad.js';

function withGameData(run) {
  const previousWindow = globalThis.window;
  globalThis.window = { GameData: { ALL_ITEMS } };
  try { return run(); }
  finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

describe('Olimpíadas — transações descartáveis', () => {
  it('não permite reivindicar a coroa do Herói repetidamente para duplicar armas e habilidades', () => withGameData(() => {
    const state = DEFAULT_STATE();
    state.isNoblesse = true;
    state.olympiadPoints = 1600;

    assert.equal(OlympiadService.claimHeroStatus(state, 'weapon_infinity_blade'), true);
    const before = JSON.stringify({ inventory: state.inventory, skills: state.skills, heroTitle: state.heroTitle });

    assert.equal(OlympiadService.claimHeroStatus(state, 'weapon_infinity_cleaver'), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, skills: state.skills, heroTitle: state.heroTitle }), before);
  }));

  it('não concede status ou habilidades de Herói se a mochila cheia impedir a arma Infinity', () => withGameData(() => {
    const state = DEFAULT_STATE();
    state.olympiadPoints = 1600;
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `hero-full-${index}`, itemId: `filler-${index}`, count: 1 }));
    const before = JSON.stringify({ inventory: state.inventory, skills: state.skills, isHero: state.isHero, heroTitle: state.heroTitle });

    assert.equal(OlympiadService.claimHeroStatus(state, 'weapon_infinity_blade'), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, skills: state.skills, isHero: state.isHero, heroTitle: state.heroTitle }), before);
  }));

  it('não cobra Tokens se a mochila cheia impedir receber o item comprado', () => withGameData(() => {
    const state = DEFAULT_STATE();
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `olympiad-${index}`, itemId: `filler-${index}`, count: 1 }));
    state.olympiadTokens = 5000;
    const before = JSON.stringify({ inventory: state.inventory, tokens: state.olympiadTokens });

    const result = OlympiadService.buyShopItem(state, 'scroll_blessed_universal');

    assert.equal(result, false);
    assert.equal(JSON.stringify({ inventory: state.inventory, tokens: state.olympiadTokens }), before);
  }));

  it('a bolsa de Olimpíada entrega o consumível CP descrito, não uma poção de HP', () => {
    const bundle = OLYMPIAD_SHOP_CATALOG.find(item => item.id === 'hero_cp_potion_bundle');
    assert.equal(bundle.reward.itemId, 'potion_heroic_cp');
    assert.equal(bundle.reward.count, 100);
    assert.equal(ALL_ITEMS[bundle.reward.itemId]?.type, 'cp');
  });

  it('serializa duelos concorrentes para o mesmo save e concede apenas uma recompensa', async () => {
    const previousWindow = globalThis.window;
    let markEntered;
    let releaseFetch;
    const entered = new Promise(resolve => { markEntered = resolve; });
    const gate = new Promise(resolve => { releaseFetch = resolve; });
    globalThis.window = { FirebaseBridge: { fetchLeaderboard: async () => { markEntered(); await gate; return []; } } };
    try {
      const state = DEFAULT_STATE();
      state.level = 80;
      state.isNoblesse = true;
      state.atk = 10_000_000;
      state.maxHp = 10_000_000;
      const firstMatch = OlympiadService.startOlympiadMatch(state);
      await entered;
      const secondMatch = await OlympiadService.startOlympiadMatch(state);
      releaseFetch();
      const firstResult = await firstMatch;

      assert.equal(firstResult.result, 'victory');
      assert.equal(secondMatch.ok, false);
      assert.equal(state.olympiadWins, 1);
      assert.equal(state.olympiadTokens, 200);
    } finally {
      releaseFetch?.();
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('applies the loss score and consolation tokens exactly once in an offline match', async () => {
    const previousWindow = globalThis.window;
    const previousRandom = Math.random;
    globalThis.window = {};
    Math.random = () => 0.5;
    try {
      const state = DEFAULT_STATE();
      state.level = 80;
      state.isNoblesse = true;
      state.maxHp = 1;
      state.atk = 200;
      state.matk = 150;
      state.def = 150;
      state.mdef = 150;
      state.olympiadPoints = 1000;
      state.olympiadTokens = 0;

      const result = await OlympiadService.startOlympiadMatch(state);

      assert.equal(result.ok, true);
      assert.equal(result.result, 'defeat');
      assert.equal(result.pointsLost, 15);
      assert.equal(result.tokensGained, 50);
      assert.equal(state.olympiadPoints, 985);
      assert.equal(state.olympiadTokens, 50);
      assert.equal(state.olympiadLosses, 1);
      assert.equal(state.olympiadWins || 0, 0);
    } finally {
      Math.random = previousRandom;
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
