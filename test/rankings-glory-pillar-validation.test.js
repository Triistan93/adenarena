import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { RankingService } from '../lineage-idle/src/services/RankingService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 3: World Rankings (Rankings Mundiais)', () => {
  it('1. Public Profile Snapshot: Constructs sanitized profile with CP, level, and equipped weapon', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'LordAres';
    state.race = 'human';
    state.class = 'duelist';
    state.level = 78;
    state.gold = 5000000;
    state.inventory = [
      { uid: 'wpn_1', itemId: 'damascus_sword', name: 'Espada de Damasco', slot: 'weapon', enchant: 12, equipped: true }
    ];
    state.equipment.weapon = 'wpn_1';

    const profile = RankingService.buildPublicProfile(state);
    assert.ok(profile);
    assert.equal(profile.charName, 'LordAres');
    assert.equal(profile.level, 78);
    assert.ok(profile.topWeaponName.includes('+12'));
    assert.equal(profile.topWeaponGlow, 'golden-amber');
  });

  it('2. Leaderboard Generation: Generates rankings across CP, Level, Olympiad, Wealth, Clans, Castles', () => {
    const state = DEFAULT_STATE();
    state.level = 75;
    state.stats = { combatPower: 88000 };

    const boards = RankingService.getLeaderboards(state);
    assert.ok(boards.cp && boards.cp.length > 0);
    assert.ok(boards.level && boards.level.length > 0);
    assert.ok(boards.olympiad && boards.olympiad.length > 0);
    assert.ok(boards.wealth && boards.wealth.length > 0);
    assert.ok(boards.clans && boards.clans.length > 0);
    assert.ok(boards.castles && boards.castles.length > 0);
  });

  it('3. Daily Tribute Claim: Awards tribute according to rank standing', () => {
    const state = DEFAULT_STATE();
    state.lastRankingRewardClaim = 0;
    state.adenCoins = 0;
    state.gold = 0;
    state.inventory = [];

    const claimRes = RankingService.claimRankingReward(state);
    assert.equal(claimRes.success, true);
    assert.ok(state.adenCoins > 0);
    assert.ok(state.gold > 0);
    assert.ok(state.lastRankingRewardClaim > 0);
  });

  it('4. 24h Cooldown Protection: Blocks claim attempts before 24h boundary', () => {
    const state = DEFAULT_STATE();
    state.lastRankingRewardClaim = Date.now() - (1000 * 60 * 60 * 12); // 12 hours ago

    const claimRes = RankingService.claimRankingReward(state);
    assert.equal(claimRes.success, false);
    assert.equal(claimRes.reason, 'cooldown');
    assert.ok(claimRes.remainingHours > 0);
  });

  it('5. 24h Time Boundary Precision: Proves boundary at 23:59:59 vs 24:00:00', () => {
    const state = DEFAULT_STATE();
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    // 23 hours, 59 minutes, 59 seconds ago -> must reject
    state.lastRankingRewardClaim = now - (dayMs - 1000);
    const rejectRes = RankingService.claimRankingReward(state);
    assert.equal(rejectRes.success, false);

    // 24 hours, 1 second ago -> must succeed
    state.lastRankingRewardClaim = now - (dayMs + 1000);
    const acceptRes = RankingService.claimRankingReward(state);
    assert.equal(acceptRes.success, true);
  });

  it('6. Save/Load Persistence: Preserves last claim timestamp across JSON cycle', () => {
    const state = DEFAULT_STATE();
    const timestamp = Date.now() - 50000;
    state.lastRankingRewardClaim = timestamp;
    state.adenCoins = 450;

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.equal(reloaded.lastRankingRewardClaim, timestamp);
    assert.equal(reloaded.adenCoins, 450);
  });
});
