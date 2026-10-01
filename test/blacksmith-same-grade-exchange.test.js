import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { swapWeaponSameGrade } from '../lineage-idle/src/services/CraftService.js';

describe('Pushkin weapon exchange grade validation', () => {
  it('rejects an out-of-grade weapon target without charging or mutating the source item', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        weapon_d_source: { id: 'weapon_d_source', name: 'D Source', slot: 'weapon', tier: 2, desc: '(D Grade)' },
        weapon_s_target: { id: 'weapon_s_target', name: 'S Target', slot: 'weapon', tier: 6, desc: '(S Grade)' }
      }
    };
    try {
      const source = { uid: 'source-uid', itemId: 'weapon_d_source', name: 'D Source', equipped: false, enchant: 7 };
      const state = { gold: 200_000, inventory: [source] };
      assert.equal(swapWeaponSameGrade(state, source.uid, 'weapon_s_target'), false);
      assert.equal(state.gold, 200_000);
      assert.equal(source.itemId, 'weapon_d_source');
      assert.equal(source.enchant, 7);
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('allows a valid same-grade exchange and charges once', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        weapon_d_source: { id: 'weapon_d_source', name: 'D Source', slot: 'weapon', tier: 2, desc: '(D Grade)' },
        weapon_d_target: { id: 'weapon_d_target', name: 'D Target', slot: 'weapon', tier: 2, desc: '(D Grade)' }
      }
    };
    try {
      const source = { uid: 'source-uid', itemId: 'weapon_d_source', name: 'D Source', equipped: false, enchant: 3 };
      const state = { gold: 200_000, inventory: [source] };
      assert.equal(swapWeaponSameGrade(state, source.uid, 'weapon_d_target'), true);
      assert.equal(state.gold, 50_000);
      assert.equal(source.itemId, 'weapon_d_target');
      assert.equal(source.name, 'D Target');
      assert.equal(source.enchant, 3);
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });

  it('rejects a malformed Adena wallet before changing a valid source weapon', () => {
    const previousGameData = globalThis.GameData;
    globalThis.GameData = {
      ALL_ITEMS: {
        weapon_d_source: { id: 'weapon_d_source', name: 'D Source', slot: 'weapon', tier: 2, desc: '(D Grade)' },
        weapon_d_target: { id: 'weapon_d_target', name: 'D Target', slot: 'weapon', tier: 2, desc: '(D Grade)' }
      }
    };
    try {
      const source = { uid: 'source-uid', itemId: 'weapon_d_source', name: 'D Source', equipped: false };
      const state = { gold: 'invalid-wallet', inventory: [source] };
      assert.equal(swapWeaponSameGrade(state, source.uid, 'weapon_d_target'), false);
      assert.equal(state.gold, 'invalid-wallet');
      assert.equal(source.itemId, 'weapon_d_source');
      assert.equal(source.name, 'D Source');
    } finally {
      if (previousGameData === undefined) delete globalThis.GameData;
      else globalThis.GameData = previousGameData;
    }
  });
});
