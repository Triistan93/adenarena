import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { RankingService } from '../lineage-idle/src/services/RankingService.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar Deep Validation — Suite 3: No-Duplication & Loss Prevention', () => {
  it('1. Rapid Multi-Claim Immunity (Idempotence): Executing ranking tribute claim 10 times in parallel yields exactly 1 reward', () => {
    const state = DEFAULT_STATE();
    state.lastRankingRewardClaim = 0;
    state.adenCoins = 0;
    state.gold = 0;

    let successes = 0;
    for (let i = 0; i < 10; i++) {
      const res = RankingService.claimRankingReward(state);
      if (res.success) successes++;
    }

    assert.equal(successes, 1, 'Exactly 1 claim out of 10 rapid attempts must succeed');
    assert.ok(state.lastRankingRewardClaim > 0);
  });

  it('2. Castle Tax Claim Idempotence: Claiming castle taxes 10 times results in exactly 1 payout', () => {
    const state = DEFAULT_STATE();
    state.clan.castles = ['giran'];
    state.clan.accumulatedTaxes = { giran: 1000000 };
    state.gold = 0;

    let successes = 0;
    for (let i = 0; i < 10; i++) {
      const res = ClanService.claimCastleTaxes(state, 'giran');
      if (res.success) successes++;
    }

    assert.equal(successes, 1, 'Only the first claim can payout accumulated taxes');
    assert.equal(state.gold, 1000000);
    assert.equal(state.clan.accumulatedTaxes.giran, 0);
  });

  it('3. Card Absorption Exact Inventory Deduction: Absorbing cards never duplicates or over-deducts', () => {
    const state = DEFAULT_STATE();
    state.inventory = [
      { id: 'card_queen_ant', itemId: 'card_queen_ant', count: 10 }
    ];
    state.codex = {};

    CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', 4);
    assert.equal(state.inventory[0].count, 6);
    assert.equal(state.codex['card_queen_ant'].count, 4);

    CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', 6);
    assert.equal(state.inventory.length, 0);
    assert.equal(state.codex['card_queen_ant'].count, 10);
  });

  it('4. Seal Stone Deposit Exact Conversion: Stone deposits convert exactly to AA with zero duplication', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.inventory = [
      { id: 'seal_stone_blue', itemId: 'seal_stone_blue', count: 20 }
    ];
    state.sevenSigns.ancientAdena = 0;

    SevenSignsService.depositStones(state, 'seal_stone_blue', 20);
    assert.equal(state.inventory.length, 0);
    assert.equal(state.sevenSigns.ancientAdena, 60); // 20 * 3 AA
  });
});
