import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { QUEST_DEFS, BATTLE_PASS_TIERS } from '../lineage-idle/src/data/quests.js';
import {
  triggerQuestEvent,
  claimQuestReward,
  claimDailyBonusChest,
  claimPassReward,
  unlockPremiumPass,
  checkQuestResets
} from '../lineage-idle/src/services/QuestService.js';

describe('Hero Pillar — Subtab 7: Quests & Battle Pass (Missões & Passe)', () => {

  it('1. Daily Quests: Event triggering advances progress and allows claiming completed quests', () => {
    const state = DEFAULT_STATE();
    state.gold = 0;
    state.sp = 0;

    // Trigger 50 kills (d_kills target is 50)
    triggerQuestEvent(state, 'kill', 50);
    assert.strictEqual(state.quests.progress['d_kills'], 50);

    // Claim reward
    const claimSuccess = claimQuestReward(state, 'd_kills');
    assert.strictEqual(claimSuccess, true);
    assert.ok(state.quests.claimed.includes('d_kills'));
    assert.ok(state.gold > 0, 'Gold must be awarded on quest claim');

    // Double claim rejection
    const duplicateClaim = claimQuestReward(state, 'd_kills');
    assert.strictEqual(duplicateClaim, false);
  });

  it('2. Grand Daily Chest: Gated strictly until all 5 daily quests are completed and claimed', () => {
    const state = DEFAULT_STATE();

    // With only 1 quest claimed, Grand Chest fails
    state.quests.claimed = ['d_kills'];
    const earlyClaim = claimDailyBonusChest(state);
    assert.strictEqual(earlyClaim, false);
    assert.strictEqual(state.quests.dailyBonusClaimed, false);

    // Complete all daily quests
    const allDailyIds = (QUEST_DEFS.daily || []).map(q => q.id);
    state.quests.claimed = [...allDailyIds];

    const grandClaim = claimDailyBonusChest(state);
    assert.strictEqual(grandClaim, true);
    assert.strictEqual(state.quests.dailyBonusClaimed, true);

    // Cannot double claim Grand Chest
    const duplicateGrandClaim = claimDailyBonusChest(state);
    assert.strictEqual(duplicateGrandClaim, false);
  });

  it('3. 24h Reset Boundary: Resets daily quests when timestamp exceeds 24h', () => {
    const state = DEFAULT_STATE();
    state.quests.lastDailyReset = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    state.quests.claimed = ['d_kills'];
    state.quests.dailyBonusClaimed = true;

    checkQuestResets(state);

    assert.strictEqual(state.quests.claimed.includes('d_kills'), false, 'Daily quest claim must reset after 24h');
    assert.strictEqual(state.quests.dailyBonusClaimed, false, 'Grand chest claim must reset after 24h');
  });

  it('4. Battle Pass Free & Premium: Progresses XP, validates tier requirements, unlocks premium, prevents double-claim', () => {
    const state = DEFAULT_STATE();
    state.battlePass = { xp: 500, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    state.gold = 0;

    // Claim tier 1 Free (req: 100 xp)
    claimPassReward(state, 1, 'free');
    assert.ok(state.battlePass.claimedFree.includes(1));
    assert.ok(state.gold > 0);

    const prevGold = state.gold;
    // Attempt double claim free
    claimPassReward(state, 1, 'free');
    assert.strictEqual(state.gold, prevGold, 'Gold must not increase on duplicate free claim');

    // Attempt claim premium before unlock (should fail)
    claimPassReward(state, 1, 'premium');
    assert.strictEqual(state.battlePass.claimedPremium.includes(1), false);

    // Unlock Premium and claim
    unlockPremiumPass(state);
    assert.strictEqual(state.battlePass.unlockedPremium, true);

    claimPassReward(state, 1, 'premium');
    assert.ok(state.battlePass.claimedPremium.includes(1));
  });

  it('5. Quests & BattlePass State Persistence: Survives save/load JSON cycle', () => {
    const state = DEFAULT_STATE();
    state.quests = {
      progress: { d_kills: 30 },
      claimed: ['d_craft'],
      lastDailyReset: 1700000000000,
      dailyBonusClaimed: false
    };
    state.battlePass = {
      xp: 1200,
      claimedFree: [1, 2],
      claimedPremium: [1],
      unlockedPremium: true
    };

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.quests.progress.d_kills, 30);
    assert.strictEqual(loaded.battlePass.xp, 1200);
    assert.strictEqual(loaded.battlePass.unlockedPremium, true);
    assert.strictEqual(loaded.battlePass.claimedFree.length, 2);
  });
});
