import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { getStats, getTotalEquipBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';

describe('Clã e castelos — integridade de estado descartável', () => {
  it('não substitui um cerco ainda em andamento ao tentar declarar outro castelo', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.clan.level = 5;
    assert.equal(ClanService.startSiege(state, 'gludio').success, true);
    const activeSiege = structuredClone(state.activeSiege);

    const second = ClanService.startSiege(state, 'aden');

    assert.equal(second.success, false);
    assert.equal(second.reason, 'siege_in_progress');
    assert.deepEqual(state.activeSiege, activeSiege);
  });

  it('rejeita doações negativas, fracionárias, não finitas ou textuais sem creditar recursos', () => {
    for (const [adena, sp] of [[-100, 100], [1.5, 0], [Infinity, 0], [NaN, 10], ['5000', 0], [0, 0]]) {
      const state = DEFAULT_STATE();
      state.gold = 100_000;
      state.sp = 100_000;
      const before = JSON.stringify({ gold: state.gold, sp: state.sp, clan: state.clan });

      const result = ClanService.donateToClan(state, adena, sp);

      assert.equal(result.success, false, `${String(adena)}, ${String(sp)}`);
      assert.equal(JSON.stringify({ gold: state.gold, sp: state.sp, clan: state.clan }), before);
    }
  });

  it('não cobra compra da Loja do Castelo se a mochila cheia impedir a entrega', () => {
    const state = DEFAULT_STATE();
    state.clan.castles = ['aden'];
    state.gold = 20_000_000;
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `castle-shop-${index}`, itemId: `filler-${index}`, count: 1 }));
    const before = JSON.stringify({ gold: state.gold, inventory: state.inventory });

    const result = ClanService.buyCastleShopItem(state, 'castle_cloak');

    assert.equal(result.success, false);
    assert.equal(result.reason, 'inventory_full');
    assert.equal(JSON.stringify({ gold: state.gold, inventory: state.inventory }), before);
  });

  it('entrega compra com UID/ID canônicos e os produtos da coroa, manto, CP e Codex existem no catálogo', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { GameData: { ALL_ITEMS } };
    try {
      const state = DEFAULT_STATE();
      state.clan.castles = ['aden'];
      state.gold = 20_000_000;
      for (const [shopId, expectedItemId] of [
        ['crown_of_lord', 'crown_of_lord'],
        ['castle_cloak', 'castle_cloak'],
        ['elixir_lord_cp_10x', 'castle_lord_cp_elixir'],
        ['giant_codex_castle_pack', 'giants_codex']
      ]) {
        assert.equal(ClanService.buyCastleShopItem(state, shopId).success, true, shopId);
        assert.ok(state.inventory.some(entry => entry.itemId === expectedItemId), expectedItemId);
      }
      assert.equal(state.inventory.find(entry => entry.itemId === 'castle_lord_cp_elixir').count, 10);
      assert.equal(state.inventory.find(entry => entry.itemId === 'giants_codex').count, 3);
      assert.ok(state.inventory.every(entry => entry.uid));
      for (const itemId of ['crown_of_lord', 'castle_cloak', 'castle_lord_cp_elixir', 'giants_codex']) {
        assert.ok(ALL_ITEMS[itemId], `${itemId} must be usable by the standard item flow`);
      }
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('aplica os bônus de atributos/HP/CP da coroa pelo cálculo de atributos equipado', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { GameData: { ALL_ITEMS } };
    try {
      const state = DEFAULT_STATE();
      state.level = 80;
      const before = getStats(state);
      state.inventory = [{ uid: 'lord-crown', itemId: 'crown_of_lord', count: 1 }];
      state.equipment.helmet = 'lord-crown';
      const after = getStats(state);

      assert.equal(getTotalEquipBonuses(state).str, 5);
      assert.equal(getTotalEquipBonuses(state).dex, 5);
      assert.ok(after.atk > before.atk);
      assert.ok(after.maxHp >= Math.floor(before.maxHp * 1.15));
      assert.ok(after.maxCp >= Math.floor(before.maxCp * 1.15));
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
