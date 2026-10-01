import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';

function withItemCatalog(run) {
  const previousWindow = globalThis.window;
  globalThis.window = { GameData: { ALL_ITEMS } };
  try { return run(); }
  finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

describe('Sete Selos — integridade das transações', () => {
  it('rejeita depósito com quantidade zero, negativa, fracionária ou textual sem alterar recursos', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.inventory = [{ uid: 'blue-seal', itemId: 'seal_stone_blue', count: 5 }];
    for (const amount of [0, -2, 1.5, '2']) {
      const result = SevenSignsService.depositStones(state, 'seal_stone_blue', amount);
      assert.equal(result.success, false, `amount=${amount}`);
      assert.equal(state.inventory[0].count, 5);
      assert.equal(state.sevenSigns.ancientAdena, 0);
      assert.equal(state.sevenSigns.playerScore, 0);
    }
  });

  it('não cobra Ancient Adena se a mochila cheia impedir uma compra de Mammon', () => withItemCatalog(() => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 500_000;
    state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `mammon-full-${index}`, itemId: 'junk_test', count: 1 }));
    const result = SevenSignsService.buyMammonItem(state, 'scroll_blessed_weapon');
    assert.equal(result.success, false);
    assert.equal(result.reason, 'inventory_full');
    assert.equal(state.sevenSigns.ancientAdena, 500_000);
    assert.equal(state.inventory.length, 150);
  }));

  it('não substitui nem cobra um confronto de chefe que já está ativo', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 100_000;
    assert.equal(SevenSignsService.startBossFight(state, 'lilith').success, true);
    const activeFight = { ...state.sevenSigns.activeBossFight };
    const balanceAfterStart = state.sevenSigns.ancientAdena;
    const result = SevenSignsService.startBossFight(state, 'anakim');
    assert.equal(result.success, false);
    assert.equal(result.reason, 'fight_in_progress');
    assert.equal(state.sevenSigns.ancientAdena, balanceAfterStart);
    assert.deepEqual(state.sevenSigns.activeBossFight, activeFight);
  });

  it('não aplica golpe final nem concede XP/Adena se a mochila não comportar o loot do chefe', () => withItemCatalog(() => {
    const state = DEFAULT_STATE();
    state.level = 80;
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 100_000;
    SevenSignsService.startBossFight(state, 'anakim');
    state.sevenSigns.activeBossFight.bossHp = 1;
    state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `boss-full-${index}`, itemId: 'junk_test', count: 1 }));
    const before = {
      xp: state.xp,
      sp: state.sp,
      aa: state.sevenSigns.ancientAdena,
      fight: { ...state.sevenSigns.activeBossFight }
    };
    const result = SevenSignsService.executeBossTurn(state);
    assert.equal(result.success, false);
    assert.equal(result.reason, 'inventory_full');
    assert.equal(state.xp, before.xp);
    assert.equal(state.sp, before.sp);
    assert.equal(state.sevenSigns.ancientAdena, before.aa);
    assert.deepEqual(state.sevenSigns.activeBossFight, before.fight);
    assert.equal(state.inventory.length, 150);
  }));
});
