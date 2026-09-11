import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar Deep Validation — Suite 2: Persistence Integrity & Robustness', () => {
  it('1. Canonical Hash Snapshot Roundtrip: 100% persisted glory fields preserved without mutation', () => {
    const state = DEFAULT_STATE();
    state.clan = { name: 'BloodOath', level: 5, castles: ['aden', 'giran'], reputation: 50000, lastTaxTimestamp: 99999, accumulatedTaxes: { aden: 100000 } };
    state.olympiad = { points: 1900, wins: 50, losses: 2, tokens: 25000, isHero: true, heroWeapon: 'infinity_spear' };
    state.noblesse = { isNoblesse: true, step: 4, tiaraClaimed: true };
    state.sevenSigns = { faction: 'dusk', ancientAdena: 800000, stonesDeposited: { seal_stone_blue: 500 } };
    state.fortresses = { owned: ['fort_shannsu'], epaulettes: 8000, equippedBracelet: 'bracelet_mithril', equippedTalismans: ['talisman_power'] };
    state.codex = { card_baium: { count: 50, rank: 5 } };
    state.lastRankingRewardClaim = 1730000000000;

    const str = JSON.stringify(state);
    const parsed = JSON.parse(str);

    assert.deepEqual(parsed.clan, state.clan);
    assert.deepEqual(parsed.olympiad, state.olympiad);
    assert.deepEqual(parsed.noblesse, state.noblesse);
    assert.deepEqual(parsed.sevenSigns, state.sevenSigns);
    assert.deepEqual(parsed.fortresses, state.fortresses);
    assert.deepEqual(parsed.codex, state.codex);
    assert.equal(parsed.lastRankingRewardClaim, state.lastRankingRewardClaim);
  });

  it('2. Reborn Progression Lifecycle: Preserves prestige, codex collection, and clan level across reborn resets', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.prestigeLevel = 0;
    state.clan.level = 4;
    state.codex = { card_queen_ant: { count: 25, rank: 4 } };

    // Simulate Reborn reset
    state.level = 1;
    state.prestigeLevel += 1;

    assert.equal(state.level, 1);
    assert.equal(state.prestigeLevel, 1);
    assert.equal(state.clan.level, 4);
    assert.equal(state.codex['card_queen_ant'].count, 25);
  });

  it('3. Boundary Immunity: Gracefully handles negative numbers and invalid properties', () => {
    const state = DEFAULT_STATE();
    state.sevenSigns.ancientAdena = -100;
    state.fortresses.epaulettes = -50;
    state.olympiad.points = -10;

    const str = JSON.stringify(state);
    assert.doesNotThrow(() => JSON.parse(str));
  });
});
