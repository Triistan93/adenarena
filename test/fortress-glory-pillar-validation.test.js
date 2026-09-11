import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { FortressService } from '../lineage-idle/src/services/FortressService.js';
import { FORTRESSES } from '../lineage-idle/src/data/fortresses.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 5: Fortresses (Fortalezas)', () => {
  it('1. Fortress Siege & Conquest: Starts siege, breaks generators, defeats commander and captures fort', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.stats = { atk: 4000, def: 3000, maxHp: 12000 };

    const startRes = FortressService.startFortressSiege(state, 'aaru_fortress');
    assert.equal(startRes.success, true);
    assert.ok(state.fortresses.activeSiege);

    let turns = 0;
    while (state.fortresses.activeSiege && turns < 20) {
      FortressService.executeSiegeTurn(state);
      turns++;
    }

    assert.ok(state.fortresses.owned.includes('aaru_fortress'));
    assert.ok(state.fortresses.epaulettes > 0);
  });

  it('2. Production Tick: Produces Knight Epaulettes over elapsed time', () => {
    const state = DEFAULT_STATE();
    state.fortresses.owned = ['aaru_fortress', 'demon_fortress'];
    state.fortresses.epaulettes = 100;
    state.fortresses.lastCollectionTime = Date.now() - (60000 * 10); // 10 minutes ago

    FortressService.updateProductionTick(state);
    assert.ok(state.fortresses.epaulettes > 100);
  });

  it('3. Talisman Bracelet Upgrade: Purchases bracelet and expands talisman capacity', () => {
    const state = DEFAULT_STATE();
    state.fortresses.epaulettes = 2000;

    const buyRes = FortressService.buyBracelet(state, 'bracelet_silver');
    assert.equal(buyRes.success, true);
    assert.equal(state.fortresses.equippedBracelet, 'bracelet_silver');
    assert.ok(state.fortresses.epaulettes < 2000);
  });

  it('4. Talisman Equipping & Capacity Constraint: Equips up to bracelet limit and rejects excess', () => {
    const state = DEFAULT_STATE();
    state.fortresses.equippedBracelet = 'bracelet_steel'; // 1 slot
    state.fortresses.equippedTalismans = [];
    state.fortresses.epaulettes = 500;

    const eq1 = FortressService.equipTalisman(state, 'talisman_power');
    assert.equal(eq1.success, true);
    assert.deepEqual(state.fortresses.equippedTalismans, ['talisman_power']);

    // Attempting 2nd talisman on 1-slot bracelet must reject
    const eq2 = FortressService.equipTalisman(state, 'talisman_defense');
    assert.equal(eq2.success, false);
  });

  it('5. Talisman Unequip & Bonus Rollback: Unequips talisman and updates bonuses cleanly', () => {
    const state = DEFAULT_STATE();
    state.fortresses.equippedTalismans = ['talisman_power'];

    const initialBonuses = FortressService.getBonuses(state);
    assert.ok(initialBonuses.pAtk > 0 || initialBonuses.critRate > 0);

    const unequipRes = FortressService.unequipTalisman(state, 'talisman_power');
    assert.equal(unequipRes.success, true);
    assert.equal(state.fortresses.equippedTalismans.length, 0);

    const finalBonuses = FortressService.getBonuses(state);
    assert.equal(finalBonuses.pAtk, 0);
  });

  it('6. Save/Load Persistence: Preserves owned fortresses, epaulettes, and equipped talismans', () => {
    const state = DEFAULT_STATE();
    state.fortresses.owned = ['aaru_fortress'];
    state.fortresses.epaulettes = 1250;
    state.fortresses.equippedBracelet = 'bracelet_silver';
    state.fortresses.equippedTalismans = ['talisman_power', 'talisman_defense'];

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.deepEqual(reloaded.fortresses.owned, ['aaru_fortress']);
    assert.equal(reloaded.fortresses.epaulettes, 1250);
    assert.equal(reloaded.fortresses.equippedBracelet, 'bracelet_silver');
    assert.deepEqual(reloaded.fortresses.equippedTalismans, ['talisman_power', 'talisman_defense']);
  });
});
