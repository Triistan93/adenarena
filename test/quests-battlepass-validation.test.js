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
  checkQuestResets,
  getAvailableDailyQuests,
  hasClaimableQuests
} from '../lineage-idle/src/services/QuestService.js';
import { isFeatureUnlocked } from '../lineage-idle/src/core/SeasonConfig.js';

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
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 2 };
    try {
      const state = DEFAULT_STATE();
      state.level = 40;

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
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
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

  it('6. Battle Pass craft-point rewards are credited on both free and premium tracks', () => {
    const state = DEFAULT_STATE();
    state.battlePass = { xp: 500, claimedFree: [], claimedPremium: [], unlockedPremium: true };
    state.craftXp = 7;

    claimPassReward(state, 3, 'free');
    assert.equal(state.craftXp, 27);
    assert.ok(state.battlePass.claimedFree.includes(3));

    state.battlePass.xp = 1750;
    claimPassReward(state, 7, 'premium');
    assert.equal(state.craftXp, 127);
    assert.ok(state.battlePass.claimedPremium.includes(7));
  });

  it('7. Quest progress accepts only finite positive amounts and never stores progress above its target', () => {
    const state = DEFAULT_STATE();
    triggerQuestEvent(state, 'kill', -4);
    triggerQuestEvent(state, 'kill', Infinity);
    triggerQuestEvent(state, 'kill', '3');
    triggerQuestEvent(state, 'kill', 1.5);
    assert.equal(state.quests.progress.d_kills, undefined);

    triggerQuestEvent(state, 'kill', 500);
    assert.equal(state.quests.progress.d_kills, QUEST_DEFS.daily.find(q => q.id === 'd_kills').target);
    assert.equal(state.quests.progress.w_kills, QUEST_DEFS.weekly.find(q => q.id === 'w_kills').target);
  });

  it('8. Daily completion chest excludes the level-40 Tower quest while the Tower is season-locked', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 1 };
    try {
      const state = DEFAULT_STATE();
      state.level = 40;
      triggerQuestEvent(state, 'tower');
      assert.equal(state.quests.progress.d_tower, undefined,
        'evento da Torre bloqueada não deve progredir a missão');
      state.quests.progress.d_tower = 1;
      assert.equal(claimQuestReward(state, 'd_tower'), false,
        'save legado não pode resgatar missão da Torre bloqueada');
      state.quests.claimed = (QUEST_DEFS.daily || [])
        .filter(quest => quest.id !== 'd_tower')
        .map(quest => quest.id);

      const activeDaily = getAvailableDailyQuests(state);
      assert.equal(activeDaily.some(quest => quest.id === 'd_tower'), false);
      assert.equal(activeDaily.length, 4);
      assert.equal(hasClaimableQuests(state), true,
        'o badge deve refletir o baú pronto, sem permitir resgate da diária bloqueada');
      assert.equal(claimDailyBonusChest(state), true,
        'baú deve continuar resgatável após todas as diárias realmente disponíveis');
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('9. Daily Tower quest becomes active in Season 2 when the Tower feature unlocks', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __serverSeason: 2 };
    try {
      const state = DEFAULT_STATE();
      state.level = 40;
      assert.equal(getAvailableDailyQuests(state).some(quest => quest.id === 'd_tower'), true);
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });

  it('10. Daily completion chest keeps the quest badge visible after the last daily claim', () => {
    const state = DEFAULT_STATE();
    state.level = 40;
    state.quests.claimed = getAvailableDailyQuests(state).map(quest => quest.id);
    state.quests.dailyBonusClaimed = false;

    assert.equal(hasClaimableQuests(state), true,
      'o baú diário pronto também deve contar como recompensa resgatável para o badge');
  });

  it('11. Quest badge includes unclaimed rewards on unlocked Battle Pass tiers', () => {
    const state = DEFAULT_STATE();
    state.battlePass = { xp: 100, claimedFree: [], claimedPremium: [], unlockedPremium: false };

    assert.equal(hasClaimableQuests(state), true,
      'uma recompensa gratuita pronta no Passe também deve sinalizar a aba Missões');

    claimPassReward(state, 1, 'free');
    assert.equal(hasClaimableQuests(state), false,
      'o indicador deve sumir quando a única recompensa disponível já foi resgatada');

    unlockPremiumPass(state);
    assert.equal(hasClaimableQuests(state), true,
      'desbloquear Premium deve sinalizar recompensas Premium já liberadas por XP');

    claimPassReward(state, 1, 'premium');
    assert.equal(hasClaimableQuests(state), false,
      'o indicador deve sumir quando as trilhas elegíveis estiverem resgatadas');
  });

  it('12. Season 1 unblocks Codex tab and allows Lv. 1 d_codex progression and daily completion chest', () => {
    assert.equal(isFeatureUnlocked('codex'), true, 'Codex deve estar liberado na Temporada 1 para coleções No-Grade e D-Grade');

    const state = DEFAULT_STATE();
    state.level = 1;

    const availableQuests = getAvailableDailyQuests(state);
    assert.ok(availableQuests.some(q => q.id === 'd_codex'), 'd_codex deve estar disponível no nível 1');

    // Simula registro de item no codex
    triggerQuestEvent(state, 'codex', 1);
    assert.equal(state.quests.progress['d_codex'], 1, 'progresso de d_codex deve ser registrado');

    const claimResult = claimQuestReward(state, 'd_codex');
    assert.equal(claimResult, true, 'recompensa de d_codex deve ser resgatada');
    assert.ok(state.quests.claimed.includes('d_codex'));

    // Completa as demais missões disponíveis do nível 1
    for (const q of availableQuests) {
      if (!state.quests.claimed.includes(q.id)) {
        triggerQuestEvent(state, q.type, q.target);
        claimQuestReward(state, q.id);
      }
    }

    // Com todas as diárias do Lv. 1 resgatadas, o Baú Diário fica liberado
    assert.equal(claimDailyBonusChest(state), true, 'Baú Diário da Guilda deve ser resgatado com sucesso no Lv. 1 na Temporada 1');
    assert.equal(state.quests.dailyBonusClaimed, true);
  });
});
