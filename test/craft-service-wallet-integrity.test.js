import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  applyLifeStone,
  calculateMaxCraftableQty,
  chargeRandomCraftWithAdena,
  compoundBeltsWithDuplicates,
  polishMasterwork,
  refreshRandomCraftSlots,
  removeAugment,
  unsealItem,
  upgradeDyeSymbol,
} from '../lineage-idle/src/services/CraftService.js';

describe('Forja — pagamentos exigem carteira Adena válida', () => {
  it('carteira malformada bloqueia os serviços de pagamento sem alterar saldo ou itens', () => {
    const cases = [
      {
        run: state => unsealItem(state, 'unseal'),
        state: { inventory: [{ uid: 'unseal', sealed: true }] },
        assertUnchanged: state => assert.equal(state.inventory[0].sealed, true),
      },
      {
        run: state => polishMasterwork(state, 'foundation'),
        state: { inventory: [{ uid: 'foundation', foundation: { stats: {} } }] },
        assertUnchanged: state => assert.equal(state.inventory[0].isMasterwork, undefined),
      },
      {
        run: state => upgradeDyeSymbol(state, 0),
        state: { dyeSymbols: [{ key: 'str', name: 'STR', stage: 1 }] },
        assertUnchanged: state => assert.equal(state.dyeSymbols[0].stage, 1),
      },
      {
        run: state => compoundBeltsWithDuplicates(state, 'primary', 'secondary'),
        state: { inventory: [{ uid: 'primary', itemId: 'belt' }, { uid: 'secondary', itemId: 'belt' }] },
        assertUnchanged: state => assert.equal(state.inventory.length, 2),
      },
      {
        run: state => chargeRandomCraftWithAdena(state),
        state: { randomCraft: { points: 0, charge: 0, slots: [{ id: 'keep' }] } },
        assertUnchanged: state => assert.equal(state.randomCraft.charge, 0),
      },
      {
        run: state => refreshRandomCraftSlots(state),
        state: { randomCraft: { points: 0, charge: 0, slots: [{ id: 'keep' }] } },
        assertUnchanged: state => assert.deepEqual(state.randomCraft.slots, [{ id: 'keep' }]),
      },
      {
        run: state => applyLifeStone(state, 'wpn-aug', 'top'),
        state: { inventory: [{ uid: 'wpn-aug', slot: 'weapon' }, { uid: 'ls', itemId: 'lifestone_top', count: 1 }] },
        assertUnchanged: state => {
          assert.equal(state.inventory[0].augmentation, undefined);
          assert.equal(state.inventory[1].count, 1);
        },
      },
      {
        run: state => removeAugment(state, 'wpn-cleanse'),
        state: { inventory: [{ uid: 'wpn-cleanse', slot: 'weapon', augmentation: { grade: 'top' } }] },
        assertUnchanged: state => assert.ok(state.inventory[0].augmentation),
      },
    ];

    for (const operation of cases) {
      const state = { ...operation.state, gold: 'invalid-wallet' };
      const before = structuredClone(state);
      assert.equal(operation.run(state), false);
      assert.deepEqual(state, before);
      operation.assertUnchanged(state);
    }
  });

  it('craft preview reports zero payable batches for malformed or unsafe Adena', () => {
    const recipe = { gold: 100, materials: [] };
    assert.equal(calculateMaxCraftableQty({ gold: 'invalid-wallet', inventory: [] }, recipe), 0);
    assert.equal(calculateMaxCraftableQty({ gold: Number.MAX_SAFE_INTEGER + 1, inventory: [] }, recipe), 0);
    assert.equal(calculateMaxCraftableQty({ gold: 250, inventory: [] }, recipe), 2);
  });

  it('empty dye upgrade does not initialize persistent state on a rejected action', () => {
    const state = { gold: 'invalid-wallet' };
    const before = structuredClone(state);
    assert.equal(upgradeDyeSymbol(state, 0), false);
    assert.deepEqual(state, before);
  });
});
