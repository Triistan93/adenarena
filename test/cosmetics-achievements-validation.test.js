import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { CosmeticService, AURAS_CATALOG, ITEM_FRAMES_CATALOG, TITLES_CATALOG } from '../lineage-idle/src/services/CosmeticService.js';
import { AchievementService, ACHIEVEMENTS } from '../lineage-idle/src/services/AchievementService.js';

describe('Hero Pillar — Subtab 6: Cosmetics & Achievements (Cosméticos & Conquistas)', () => {

  it('1. Cosmetic Invariant: Auras, Frames, and Titles provide zero combat stats (purely visual)', () => {
    for (const [id, aura] of Object.entries(AURAS_CATALOG)) {
      assert.strictEqual(aura.atk, undefined, `Aura ${id} must not have atk`);
      assert.strictEqual(aura.def, undefined, `Aura ${id} must not have def`);
      assert.strictEqual(aura.hp, undefined, `Aura ${id} must not have hp`);
    }

    for (const [id, frame] of Object.entries(ITEM_FRAMES_CATALOG)) {
      assert.strictEqual(frame.atk, undefined, `Frame ${id} must not have atk`);
      assert.strictEqual(frame.def, undefined, `Frame ${id} must not have def`);
    }
  });

  it('2. Achievement Progress: Correctly maps progress and status', () => {
    const state = DEFAULT_STATE();
    state.stats = { monstersKilled: 150 };

    const status = AchievementService.getAchievementsStatus(state);
    const firstBlood = status.achievements.find(a => a.id === 'ach_first_blood');

    assert.ok(firstBlood, 'First blood achievement must exist');
    assert.strictEqual(firstBlood.isCompleted, true);
    assert.strictEqual(firstBlood.isClaimed, false);
    assert.strictEqual(firstBlood.canClaim, true);
  });

  it('3. Double-Claim Protection: Strict idempotence preventing multi-claim exploits', () => {
    const state = DEFAULT_STATE();
    state.stats = { monstersKilled: 150 };
    state.gold = 0;

    // First claim: Success
    const firstClaim = AchievementService.claimAchievement(state, 'ach_first_blood');
    assert.strictEqual(firstClaim.success, true);
    assert.strictEqual(state.gold, 25000);
    assert.ok(state.achievements.claimed.includes('ach_first_blood'));

    // Second claim: Strict rejection
    const secondClaim = AchievementService.claimAchievement(state, 'ach_first_blood');
    assert.strictEqual(secondClaim.success, false);
    assert.strictEqual(secondClaim.reason, 'already_claimed');
    assert.strictEqual(state.gold, 25000, 'Gold must NOT be awarded twice');
  });

  it('4. Unearned Achievement Rejection: Cannot claim incomplete achievement', () => {
    const state = DEFAULT_STATE();
    state.stats = { monstersKilled: 10 }; // Target is 100

    const claimResult = AchievementService.claimAchievement(state, 'ach_first_blood');
    assert.strictEqual(claimResult.success, false);
    assert.strictEqual(claimResult.reason, 'incomplete');
  });

  it('5. Cosmetics & Achievements Persistence: State serializes and reloads cleanly', () => {
    const state = DEFAULT_STATE();
    state.cosmetics = {
      activeAura: 'aura_crimson_warlord',
      activeFrame: 'frame_gold',
      activeTitle: 'title_ceifador',
      unlockedAuras: ['aura_none', 'aura_crimson_warlord'],
      unlockedFrames: ['frame_default', 'frame_gold'],
      unlockedTitles: ['title_none', 'title_ceifador']
    };
    state.achievements = {
      claimed: ['ach_first_blood', 'ach_carnage']
    };

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.cosmetics.activeAura, 'aura_crimson_warlord');
    assert.strictEqual(loaded.cosmetics.activeTitle, 'title_ceifador');
    assert.strictEqual(loaded.achievements.claimed.length, 2);
    assert.ok(loaded.achievements.claimed.includes('ach_first_blood'));
  });
});
