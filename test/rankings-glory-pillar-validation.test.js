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

  it('2. Empty remote result: Does not invent leaderboard rows or castle lords', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'NotRankedDisposable';
    state.level = 75;
    state.stats = { combatPower: 88000 };

    const boards = RankingService.getLeaderboards(state);
    assert.equal(boards.cp.some(profile => profile.charName === state.heroName), false);
    assert.deepEqual(boards.level, []);
    assert.deepEqual(boards.olympiad, []);
    assert.deepEqual(boards.wealth, []);
    assert.deepEqual(boards.clans, []);
    assert.deepEqual(boards.castles, [], 'não apresenta donos fictícios quando não há ranking remoto');
  });

  it('3. Daily Tribute Claim: Awards tribute according to rank standing', async () => {
    const state = DEFAULT_STATE();
    state.heroName = 'TopRankDisposable';
    state.lastRankingRewardClaim = 0;
    state.adenCoins = 0;
    state.gold = 0;
    state.inventory = [];
    const previousWindow = globalThis.window;
    globalThis.window = {
      FirebaseBridge: {
        getCurrentUserId: () => 'top-rank-disposable-user',
        fetchLeaderboard: async category => category === 'cp' ? [
          { userId: 'top-rank-disposable-user', charName: 'TopRankDisposable', combatPower: 999999 }
        ] : []
      }
    };
    try {
      await RankingService.getLeaderboard('cp', state, { forceRefresh: true });
      const claimRes = RankingService.claimRankingReward(state, { log() {}, floatText() {} });
      assert.equal(claimRes.success, true);
      assert.equal(claimRes.rank, 1);
      assert.equal(claimRes.scrolls, 5);
      assert.ok(state.adenCoins > 0);
      assert.ok(state.gold > 0);
      assert.ok(state.lastRankingRewardClaim > 0);
      const scroll = state.inventory.find(item => item.itemId === 'scroll_enchant_weapon_b');
      assert.equal(scroll?.count, 5);
      assert.equal(state.inventory.some(item => item.itemId === 'scrl_enchant_wp_b'), false);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('3.1 Não concede tributo de topo sem posição em ranking remoto autenticado', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'UnrankedDisposable';
    state.lastRankingRewardClaim = 0;
    state.adenCoins = 0;
    state.gold = 0;
    state.inventory = [];
    const previousWindow = globalThis.window;
    globalThis.window = { FirebaseBridge: { getCurrentUserId: () => 'disposable-user' } };

    try {
      const result = RankingService.claimRankingReward(state, { log() {}, floatText() {} });
      assert.equal(result.success, false);
      assert.equal(result.reason, 'ranking_unavailable');
      assert.equal(state.adenCoins, 0);
      assert.equal(state.gold, 0);
      assert.equal(state.lastRankingRewardClaim, 0);
      assert.equal(state.inventory.length, 0);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('3.2 Calcula o tributo pela posição remota do usuário, sem inserir o perfil local no ranking premiado', async () => {
    const state = DEFAULT_STATE();
    state.heroName = 'RankedDisposable';
    state.lastRankingRewardClaim = 0;
    state.adenCoins = 0;
    state.gold = 0;
    state.inventory = [];
    const previousWindow = globalThis.window;
    globalThis.window = {
      FirebaseBridge: {
        getCurrentUserId: () => 'ranked-disposable-user',
        fetchLeaderboard: async category => category === 'cp' ? [
          { userId: 'other-user', charName: 'HigherRank', combatPower: 999999 },
          { userId: 'ranked-disposable-user', charName: 'RankedDisposable', combatPower: 1 }
        ] : []
      }
    };

    try {
      await RankingService.getLeaderboard('cp', state, { forceRefresh: true });
      const result = RankingService.claimRankingReward(state, { log() {}, floatText() {} });
      assert.equal(result.success, true);
      assert.equal(result.rank, 2);
      assert.equal(result.coins, 250);
      assert.equal(result.adena, 2_500_000);
      assert.equal(result.scrolls, 3);
      const scroll = state.inventory.find(item => item.itemId === 'scroll_enchant_weapon_b');
      assert.equal(scroll?.count, 3);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('4. 24h Cooldown Protection: Blocks claim attempts before 24h boundary', () => {
    const state = DEFAULT_STATE();
    state.lastRankingRewardClaim = Date.now() - (1000 * 60 * 60 * 12); // 12 hours ago

    const claimRes = RankingService.claimRankingReward(state);
    assert.equal(claimRes.success, false);
    assert.equal(claimRes.reason, 'cooldown');
    assert.ok(claimRes.remainingHours > 0);
  });

  it('5. 24h Time Boundary Precision: Proves boundary at 23:59:59 vs 24:00:00', async () => {
    const state = DEFAULT_STATE();
    state.heroName = 'BoundaryDisposable';
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const previousWindow = globalThis.window;
    globalThis.window = {
      FirebaseBridge: {
        getCurrentUserId: () => 'boundary-disposable-user',
        fetchLeaderboard: async category => category === 'cp' ? [
          { userId: 'boundary-disposable-user', charName: 'BoundaryDisposable', combatPower: 999999 }
        ] : []
      }
    };
    try {
      await RankingService.getLeaderboard('cp', state, { forceRefresh: true });
      // 23 hours, 59 minutes, 59 seconds ago -> must reject
      state.lastRankingRewardClaim = now - (dayMs - 1000);
      const rejectRes = RankingService.claimRankingReward(state);
      assert.equal(rejectRes.success, false);
      assert.equal(rejectRes.reason, 'cooldown');

      // 24 hours, 1 second ago -> must succeed
      state.lastRankingRewardClaim = now - (dayMs + 1000);
      const acceptRes = RankingService.claimRankingReward(state);
      assert.equal(acceptRes.success, true);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('5.1 Bolsa cheia aborta o tributo sem creditar moedas nem iniciar o cooldown', async () => {
    const state = DEFAULT_STATE();
    state.heroName = 'FullBagDisposable';
    state.inventory = Array.from({ length: 150 }, (_, index) => ({ uid: `full-${index}`, itemId: 'junk_test', count: 1 }));
    state.adenCoins = 0;
    state.gold = 0;
    state.lastRankingRewardClaim = 0;
    const previousWindow = globalThis.window;
    globalThis.window = {
      FirebaseBridge: {
        getCurrentUserId: () => 'full-bag-disposable-user',
        fetchLeaderboard: async category => category === 'cp' ? [
          { userId: 'full-bag-disposable-user', charName: 'FullBagDisposable', combatPower: 999999 }
        ] : []
      }
    };
    try {
      await RankingService.getLeaderboard('cp', state, { forceRefresh: true });
      const result = RankingService.claimRankingReward(state, { log() {}, floatText() {} });
      assert.equal(result.success, false);
      assert.equal(result.reason, 'inventory_full');
      assert.equal(state.adenCoins, 0);
      assert.equal(state.gold, 0);
      assert.equal(state.lastRankingRewardClaim, 0);
      assert.equal(state.inventory.length, 150);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
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
