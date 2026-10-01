import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { FortressService } from '../lineage-idle/src/services/FortressService.js';
import { FORTRESSES } from '../lineage-idle/src/data/fortresses.js';

describe('Fortalezas — ciclo de cerco descartável', () => {
  it('caps offline epaulette production at the same twelve hours allowed by SecurityEngine', () => {
    const state = DEFAULT_STATE();
    const now = 1_800_000_000_000;
    const fortId = 'aaru_fortress';
    const ratePerMinute = FORTRESSES[fortId].epauletteRate;
    state.fortresses.owned = [fortId];
    state.fortresses.epaulettes = 0;
    state.fortresses.lastCollectionTime = now - (24 * 60 * 60 * 1000);
    const originalNow = Date.now;

    try {
      Date.now = () => now;
      FortressService.updateProductionTick(state);
    } finally {
      Date.now = originalNow;
    }

    assert.equal(state.fortresses.epaulettes, ratePerMinute * 12 * 60);
  });

  it('não substitui um cerco ativo ao tentar iniciar outro', () => {
    const state = DEFAULT_STATE();
    state.level = 82;
    assert.equal(FortressService.startFortressSiege(state, 'aaru_fortress').success, true);
    const activeBefore = structuredClone(state.fortresses.activeSiege);

    const next = FortressService.startFortressSiege(state, 'demon_fortress');

    assert.equal(next.success, false);
    assert.equal(next.reason, 'siege_in_progress');
    assert.deepEqual(state.fortresses.activeSiege, activeBefore);
  });

  it('não permite recaptura gratuita de fortaleza já possuída para repetir recompensa', () => {
    const state = DEFAULT_STATE();
    state.level = 82;
    state.fortresses.owned = ['aaru_fortress'];
    state.fortresses.epaulettes = 25;

    const result = FortressService.startFortressSiege(state, 'aaru_fortress');

    assert.equal(result.success, false);
    assert.equal(result.reason, 'already_owned');
    assert.equal(state.fortresses.activeSiege, null);
    assert.equal(state.fortresses.epaulettes, 25);
  });
});
