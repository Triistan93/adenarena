import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getMaxInventorySlots } from '../lineage-idle/src/services/InventoryService.js';
import { RefineryService } from '../lineage-idle/src/services/lifeActivities/RefineryService.js';

describe('Forja Imperial — Refinery with disposable inventory', () => {
  it('does not consume ingredients or Adena when the output cannot fit in a full inventory', () => {
    const state = DEFAULT_STATE();
    const maxSlots = getMaxInventorySlots(state);
    state.inventory = Array.from({ length: maxSlots }, (_, index) => ({ uid: `refinery-filler-${index}`, itemId: `filler_${index}`, count: 1 }));
    state.inventory[0] = { uid: 'refinery-branch', itemId: 'branch', count: 10 };
    state.inventory[1] = { uid: 'refinery-charcoal', itemId: 'charcoal', count: 4 };
    state.gold = 1_000;
    const before = JSON.stringify({ inventory: state.inventory, gold: state.gold, accountForgeExp: state.accountForgeExp });

    const result = RefineryService.refine(state, 'refine_compressed_wood', 1);

    assert.equal(result.success, false);
    assert.equal(result.reason, 'inventory_full');
    assert.equal(JSON.stringify({ inventory: state.inventory, gold: state.gold, accountForgeExp: state.accountForgeExp }), before);
  });

  it('applies all earned Forge levels and carries the remaining XP through tier thresholds', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { uid: 'refinery-stem', itemId: 'stem', count: 160 },
      { uid: 'refinery-cord', itemId: 'cord', count: 80 }
    ];
    state.gold = 20_000;
    state.accountForgeLevel = 1;
    state.accountForgeExp = 0;

    const result = RefineryService.refine(state, 'refine_braided_hemp', 40);

    assert.equal(result.success, true);
    assert.equal(state.accountForgeLevel, 3);
    assert.equal(state.craftLevel, 3);
    assert.equal(state.accountForgeExp, 20);
  });
});
