import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 4: Seven Signs & Mammon (Sete Selos & Mammon)', () => {
  it('1. Faction Allegiance: Joins Dawn or Dusk faction successfully', () => {
    const state = DEFAULT_STATE();
    const res = SevenSignsService.joinFaction(state, 'dawn');
    assert.equal(res.success, true);
    assert.equal(state.sevenSigns.faction, 'dawn');
  });

  it('2. Seal Stone Deposit & Ancient Adena Conversion: Converts stones to AA and scores points', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.inventory = [
      { id: 'seal_stone_blue', itemId: 'seal_stone_blue', count: 100, name: 'Blue Seal Stone' }
    ];

    const depositRes = SevenSignsService.depositStones(state, 'seal_stone_blue', 50);
    assert.equal(depositRes.success, true);
    assert.equal(depositRes.aaGained, 150); // 50 * 3 AA = 150
    assert.equal(state.sevenSigns.ancientAdena, 150);
    assert.equal(state.inventory[0].count, 50);
  });

  it('3. Lilith / Anakim Epic Boss Fight: Resolves victory and grants canonical reward items', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 100000;
    state.stats = { atk: 500000, def: 2500, maxHp: 10000, combatPower: 120000 };

    const startRes = SevenSignsService.startBossFight(state, 'lilith');
    assert.equal(startRes.success, true);
    assert.ok(state.sevenSigns.activeBossFight);

    const result = SevenSignsService.executeBossTurn(state);
    assert.equal(result.success, true);
    assert.equal(result.isVictory, true);
    assert.equal(state.sevenSigns.activeBossFight, null);
    assert.equal(state.sevenSigns.bossDefeats.lilith, 1);
    for (const rewardId of result.rewards.items) {
      const reward = state.inventory.find(item => item.itemId === rewardId);
      assert.ok(reward, `missing reward ${rewardId}`);
      assert.ok(reward.uid, `reward ${rewardId} must have a UID`);
    }
  });

  it('4. Merchant of Mammon Store: Purchases items with Ancient Adena', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 500000;
    state.inventory = [];

    const buyRes = SevenSignsService.buyMammonItem(state, 'scroll_of_enchant_weapon');
    assert.equal(buyRes.success, true);
    assert.ok(state.sevenSigns.ancientAdena < 500000);
    const scroll = state.inventory.find(item => item.itemId === 'scroll_of_enchant_weapon');
    assert.ok(scroll);
    assert.ok(scroll.uid);
  });

  it('5. Blacksmith of Mammon Unsealing: Removes seal from A-grade armor for winning faction', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.phase = 'seal_validation';
    state.sevenSigns.winnerFaction = 'dawn';
    state.sevenSigns.ancientAdena = 200000;

    const sealedArmor = {
      uid: 'tallum_1',
      itemId: 'armor_draconic_armor',
      name: 'Draconic Armor (Sealed)',
      slot: 'armor',
      isUnsealed: false
    };
    state.inventory = [sealedArmor];

    const unsealRes = SevenSignsService.unsealArmor(state, sealedArmor);
    assert.equal(unsealRes.success, true);
    assert.equal(sealedArmor.isUnsealed, true);
    assert.ok(sealedArmor.name.includes('Unsealed'));
    assert.ok(state.sevenSigns.ancientAdena <= 150000);
  });

  it('6. Save/Load Persistence: Preserves sevenSigns state across JSON cycle', () => {
    const state = DEFAULT_STATE();
    SevenSignsService.joinFaction(state, 'dusk');
    state.sevenSigns.ancientAdena = 75000;
    state.sevenSigns.bossDefeats = { lilith: 3, anakim: 1 };

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.equal(reloaded.sevenSigns.faction, 'dusk');
    assert.equal(reloaded.sevenSigns.ancientAdena, 75000);
    assert.equal(reloaded.sevenSigns.bossDefeats.lilith, 3);
  });
});
