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

  it('6. Cosmetic equip: rejects an unknown category without reporting success or saving', () => {
    const state = DEFAULT_STATE();
    const events = { saves: 0, updates: 0 };

    const result = CosmeticService.equipCosmetic(state, 'unknown', 'aura_crimson_warlord', {
      save: () => events.saves++,
      updateAllUI: () => events.updates++
    });

    assert.deepStrictEqual(result, { success: false, reason: 'invalid_category' });
    assert.strictEqual(state.cosmetics.activeAura, 'aura_none');
    assert.strictEqual(events.saves, 0);
    assert.strictEqual(events.updates, 0);
  });

  it('7. Cosmetic purchase: charges once, unlocks and equips; duplicate purchase is rejected', () => {
    const state = DEFAULT_STATE();
    state.gold = 2_000_000;
    const callbacks = { log: () => {}, save: () => {}, updateAllUI: () => {} };

    const purchase = CosmeticService.buyCosmetic(state, 'aura', 'aura_crimson_warlord', callbacks);
    assert.strictEqual(purchase.success, true);
    assert.strictEqual(state.gold, 1_000_000);
    assert.ok(state.cosmetics.unlockedAuras.includes('aura_crimson_warlord'));
    assert.strictEqual(state.cosmetics.activeAura, 'aura_crimson_warlord');

    const duplicate = CosmeticService.buyCosmetic(state, 'aura', 'aura_crimson_warlord', callbacks);
    assert.strictEqual(duplicate.success, false);
    assert.strictEqual(duplicate.reason, 'already_owned');
    assert.strictEqual(state.gold, 1_000_000);
  });

  it('8. Hero-only aura: blocks ordinary characters and grants the aura to Olympiad heroes', () => {
    const state = DEFAULT_STATE();
    state.gold = 500_000;
    const callbacks = { log: () => {}, save: () => {}, updateAllUI: () => {} };

    const locked = CosmeticService.buyCosmetic(state, 'aura', 'aura_hero_golden', callbacks);
    assert.strictEqual(locked.success, false);
    assert.strictEqual(locked.reason, 'hero_required');
    assert.strictEqual(state.gold, 500_000);

    state.isHero = true;
    const autoAura = CosmeticService.getActiveAura(state);
    assert.strictEqual(autoAura.id, 'aura_hero_golden');
    assert.ok(state.cosmetics.unlockedAuras.includes('aura_hero_golden'));
    const equipped = CosmeticService.equipCosmetic(state, 'aura', 'aura_hero_golden', callbacks);
    assert.strictEqual(equipped.success, true);
    assert.strictEqual(state.gold, 500_000);
    assert.strictEqual(state.cosmetics.activeAura, 'aura_hero_golden');
  });

  it('9. Hero-only aura: rechecks eligibility when equipping a legacy-unlocked aura', () => {
    const state = DEFAULT_STATE();
    state.cosmetics = {
      unlockedAuras: ['aura_none', 'aura_hero_golden'],
      activeAura: 'aura_none',
      unlockedFrames: ['frame_default'], activeFrame: 'frame_default',
      unlockedTitles: ['title_none'], activeTitle: 'title_none'
    };

    const result = CosmeticService.equipCosmetic(state, 'aura', 'aura_hero_golden', {
      log: () => {}, save: () => {}, updateAllUI: () => {}
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, 'hero_required');
    assert.strictEqual(state.cosmetics.activeAura, 'aura_none');
  });

  it('10. Cosmetic state: repairs malformed legacy unlock lists and active ids safely', () => {
    const state = DEFAULT_STATE();
    state.isHero = true;
    state.cosmetics = {
      unlockedAuras: 'aura_none',
      activeAura: 'removed_aura',
      unlockedFrames: { frame_gold: true },
      activeFrame: 'removed_frame',
      unlockedTitles: null,
      activeTitle: 'removed_title'
    };

    assert.doesNotThrow(() => CosmeticService.getActiveAura(state));
    assert.ok(Array.isArray(state.cosmetics.unlockedAuras));
    assert.ok(state.cosmetics.unlockedAuras.includes('aura_none'));
    assert.ok(state.cosmetics.unlockedAuras.includes('aura_hero_golden'));
    assert.deepEqual(state.cosmetics.unlockedFrames, ['frame_default']);
    assert.deepEqual(state.cosmetics.unlockedTitles, ['title_none']);
    assert.equal(state.cosmetics.activeAura, 'aura_none');
    assert.equal(state.cosmetics.activeFrame, 'frame_default');
    assert.equal(state.cosmetics.activeTitle, 'title_none');
  });

  it('11. Cosmetic purchase rejects corrupted Adena without granting the item', () => {
    const state = DEFAULT_STATE();
    state.gold = 'invalid-balance';
    let saves = 0;
    const beforeUnlocked = structuredClone(state.cosmetics?.unlockedAuras);

    const result = CosmeticService.buyCosmetic(state, 'aura', 'aura_crimson_warlord', { save: () => saves++ });

    assert.deepEqual(result, { success: false, reason: 'insufficient_funds' });
    assert.equal(state.gold, 'invalid-balance');
    assert.equal(state.cosmetics.unlockedAuras.includes('aura_crimson_warlord'), false);
    assert.equal(saves, 0);
    if (beforeUnlocked) assert.deepEqual(state.cosmetics.unlockedAuras, beforeUnlocked);
  });
});
