import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { getMaxInventorySlots, getMaxWarehouseSlots, depositToWarehouse, withdrawFromWarehouse } from '../lineage-idle/src/services/InventoryService.js';

function withGameData(run) {
  const previousWindow = globalThis.window;
  globalThis.window = { GameData: { ALL_ITEMS } };
  try { return run(); }
  finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
}

describe('Baú privado — transferências de pilhas descartáveis', () => {
  it('rejeita depósito parcial em baú cheio sem duplicar ou alterar a pilha de origem', () => withGameData(() => {
    const state = DEFAULT_STATE();
    const max = getMaxWarehouseSlots();
    state.inventory = [{ uid: 'inventory-stone', itemId: 'boss_summon_stone', count: 10 }];
    state.warehouse = Array.from({ length: max }, (_, i) => ({ uid: `warehouse-${i}`, itemId: `filler-${i}`, count: 1 }));
    state.warehouse[0] = { uid: 'warehouse-partial', itemId: 'boss_summon_stone', count: 998 };
    const before = JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse });

    assert.equal(depositToWarehouse(state, 'inventory-stone', 10), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse }), before);
  }));

  it('rejeita saque parcial em mochila cheia sem alterar o baú nem a pilha de destino', () => withGameData(() => {
    const state = DEFAULT_STATE();
    const max = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: max }, (_, i) => ({ uid: `inventory-${i}`, itemId: `filler-${i}`, count: 1 }));
    state.inventory[0] = { uid: 'inventory-partial', itemId: 'boss_summon_stone', count: 998 };
    state.warehouse = [{ uid: 'warehouse-stone', itemId: 'boss_summon_stone', count: 10 }];
    const before = JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse });

    assert.equal(withdrawFromWarehouse(state, 'warehouse-stone', 10), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse }), before);
  }));

  it('rejeita quantidade zero, negativa, fracionária ou não numérica sem mutação', () => withGameData(() => {
    for (const amount of [0, -2, 1.5, NaN, '2']) {
      const state = DEFAULT_STATE();
      state.inventory = [{ uid: 'invalid-amount', itemId: 'boss_summon_stone', count: 10 }];
      state.warehouse = [];
      const before = JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse });
      assert.equal(depositToWarehouse(state, 'invalid-amount', amount), false, `amount=${String(amount)}`);
      assert.equal(JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse }), before);
    }
  }));

  it('mantém quantidades corretas ao depositar e sacar parcialmente pilhas compatíveis', () => withGameData(() => {
    const state = DEFAULT_STATE();
    state.inventory = [{ uid: 'source', itemId: 'boss_summon_stone', count: 10 }];
    state.warehouse = [{ uid: 'destination', itemId: 'boss_summon_stone', count: 990 }];

    assert.equal(depositToWarehouse(state, 'source', 4), true);
    assert.equal(state.inventory[0].count, 6);
    assert.equal(state.warehouse[0].count, 994);

    assert.equal(withdrawFromWarehouse(state, 'destination', 3), true);
    assert.equal(state.inventory[0].count, 9);
    assert.equal(state.warehouse[0].count, 991);
  }));

  it('normaliza contagens legadas numéricas antes de combinar pilhas no depósito e saque', () => withGameData(() => {
    const deposit = DEFAULT_STATE();
    deposit.inventory = [{ uid: 'source', itemId: 'boss_summon_stone', count: 4 }];
    deposit.warehouse = [{ uid: 'destination', itemId: 'boss_summon_stone', count: '990' }];
    assert.equal(depositToWarehouse(deposit, 'source', 4), true);
    assert.equal(deposit.warehouse[0].count, 994);
    assert.equal(typeof deposit.warehouse[0].count, 'number');

    const withdraw = DEFAULT_STATE();
    withdraw.inventory = [{ uid: 'destination', itemId: 'boss_summon_stone', count: '990' }];
    withdraw.warehouse = [{ uid: 'source', itemId: 'boss_summon_stone', count: 4 }];
    assert.equal(withdrawFromWarehouse(withdraw, 'source', 4), true);
    assert.equal(withdraw.inventory[0].count, 994);
    assert.equal(typeof withdraw.inventory[0].count, 'number');
  }));

  it('não deposita item cujo UID ainda esteja referenciado por um slot equipado', () => withGameData(() => {
    const state = DEFAULT_STATE();
    state.equipment.weapon = 'stale-equipped';
    state.inventory = [{ uid: 'stale-equipped', itemId: 'weapon_frost_lord_sword', count: 1 }];
    state.warehouse = [];
    const before = JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse });

    assert.equal(depositToWarehouse(state, 'stale-equipped', 1), false);
    assert.equal(JSON.stringify({ inventory: state.inventory, warehouse: state.warehouse }), before);
  }));
});
