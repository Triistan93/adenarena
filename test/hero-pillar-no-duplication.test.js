import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { equipItem } from '../lineage-idle/src/services/EquipmentService.js';
import { isEligibleForAutoRecycle } from '../lineage-idle/src/services/InventoryService.js';
import { AchievementService } from '../lineage-idle/src/services/AchievementService.js';
import { triggerQuestEvent, claimQuestReward, claimDailyBonusChest, claimPassReward, unlockPremiumPass } from '../lineage-idle/src/services/QuestService.js';
import { PetService } from '../lineage-idle/src/services/PetService.js';
import { WEAPONS } from '../lineage-idle/src/data/items/weapons.js';

// Setup GameData for Node.js test environment
globalThis.GameData = globalThis.GameData || {};
globalThis.GameData.ALL_ITEMS = globalThis.GameData.ALL_ITEMS || { ...WEAPONS };

describe('Hero Pillar Deep Validation — Suite 3: No-Duplication & Loss Prevention', () => {

  it('1. Rapid Multi-Claim Immunity (Idempotence): Executing claim 10 times in parallel results in exactly 1 reward', () => {
    const state = DEFAULT_STATE();
    state.stats = { monstersKilled: 200 };
    state.gold = 0;

    // Simulate 10 rapid clicks on achievement claim
    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(AchievementService.claimAchievement(state, 'ach_first_blood'));
    }

    const successfulClaims = results.filter(r => r.success);
    assert.strictEqual(successfulClaims.length, 1, 'Exactly 1 claim must succeed out of 10 rapid attempts');
    assert.strictEqual(state.gold, 25000, 'Gold must be credited exactly once');
    assert.strictEqual(state.achievements.claimed.filter(id => id === 'ach_first_blood').length, 1);
  });

  it('2. Rapid Quest Multi-Claim Immunity: Executing daily quest claim 10 times results in exactly 1 reward', () => {
    const state = DEFAULT_STATE();
    state.gold = 0;

    triggerQuestEvent(state, 'kill', 50);

    const results = [];
    for (let i = 0; i < 10; i++) {
      results.push(claimQuestReward(state, 'd_kills'));
    }

    const successfulClaims = results.filter(r => r === true);
    assert.strictEqual(successfulClaims.length, 1, 'Exactly 1 quest claim must succeed out of 10 rapid attempts');
    assert.strictEqual(state.quests.claimed.filter(id => id === 'd_kills').length, 1);
  });

  it('3. Rapid Battle Pass Multi-Claim Immunity: Executing tier reward claim 10 times yields exactly 1 reward', () => {
    const state = DEFAULT_STATE();
    state.battlePass = { xp: 500, claimedFree: [], claimedPremium: [], unlockedPremium: false };
    state.gold = 0;

    const initialGold = state.gold;
    for (let i = 0; i < 10; i++) {
      claimPassReward(state, 1, 'free');
    }

    assert.strictEqual(state.battlePass.claimedFree.length, 1);
    assert.strictEqual(state.battlePass.claimedFree[0], 1);
    assert.strictEqual(state.gold, 5000, 'Gold must be credited exactly once for Tier 1 free reward');
  });

  it('4. Inventory Equip/Replace Transaction Atomicity: Replacing equipped items never duplicates or drops items', () => {
    const state = DEFAULT_STATE();
    state.level = 40;
    state.inventory = [
      { uid: 'wpn_1', itemId: 'knight_sword', equipped: false },
      { uid: 'wpn_2', itemId: 'crimson_sword', equipped: false }
    ];

    // Equip Weapon 1
    equipItem(state, 'wpn_1', 'weapon');
    assert.strictEqual(state.equipment.weapon, 'wpn_1');
    assert.strictEqual(state.inventory.find(i => i.uid === 'wpn_1').equipped, true);
    assert.strictEqual(state.inventory.length, 2);

    // Replace with Weapon 2
    equipItem(state, 'wpn_2', 'weapon');
    assert.strictEqual(state.equipment.weapon, 'wpn_2');
    assert.strictEqual(state.inventory.find(i => i.uid === 'wpn_2').equipped, true);
    assert.strictEqual(state.inventory.find(i => i.uid === 'wpn_1').equipped, false);
    assert.strictEqual(state.inventory.length, 2, 'Inventory total item count must remain strictly conserved');
  });

  it('5. Auto-Recycle & Auto-Sell Comprehensive Boundary Matrix: Exhaustive evaluation across all types, grades, and protections', () => {
    const state = DEFAULT_STATE();
    state.autoRecycle = {
      enabled: true,
      mode: 'sell',
      maxRarity: 'rare',
      grades: { ng: true, d: true, c: true, b: true, a: false, s: false }
    };

    // Helper to evaluate eligibility
    const check = (item, def) => isEligibleForAutoRecycle(item, def, state);

    // 1. Non-recyclable slots must ALWAYS be protected (return false)
    const protectedSlots = ['consumable', 'material', 'scroll', 'potion', 'food', 'spellbook', 'talisman', 'cloak', 'hair', 'doll'];
    for (const slot of protectedSlots) {
      assert.strictEqual(check({ itemId: `item_${slot}`, rarity: 'common' }, { id: `item_${slot}`, slot, req: { level: 1 } }), false, `Slot ${slot} must be protected`);
    }

    // 2. Enchanted items (>0) must ALWAYS be protected
    assert.strictEqual(check({ itemId: 's1', enchant: 1, rarity: 'common' }, { id: 's1', slot: 'weapon', req: { level: 1 } }), false);

    // 3. Modified items (augmented, soulCrystal, foundation) must ALWAYS be protected
    assert.strictEqual(check({ itemId: 's2', augmented: true, rarity: 'common' }, { id: 's2', slot: 'weapon', req: { level: 1 } }), false);
    assert.strictEqual(check({ itemId: 's3', soulCrystal: { stat: 'crit' }, rarity: 'common' }, { id: 's3', slot: 'weapon', req: { level: 1 } }), false);
    assert.strictEqual(check({ itemId: 's4', foundation: true, rarity: 'common' }, { id: 's4', slot: 'weapon', req: { level: 1 } }), false);

    // 4. Heirloom / Starter items must ALWAYS be protected
    assert.strictEqual(check({ itemId: 's5', isHeirloom: true, rarity: 'common' }, { id: 's5', slot: 'weapon', req: { level: 1 } }), false);
    assert.strictEqual(check({ itemId: 's6', rarity: 'common' }, { id: 's6', name: 'Espada de Herança', slot: 'weapon', req: { level: 1 } }), false);

    // 5. Equipped and Locked items must ALWAYS be protected
    assert.strictEqual(check({ itemId: 's7', equipped: true, rarity: 'common' }, { id: 's7', slot: 'weapon', req: { level: 1 } }), false);
    assert.strictEqual(check({ itemId: 's8', isProtected: true, rarity: 'common' }, { id: 's8', slot: 'weapon', req: { level: 1 } }), false);

    // 6. Grade A (Lv 62+) and Grade S (Lv 76+) must ALWAYS be protected
    assert.strictEqual(check({ itemId: 's9', rarity: 'common' }, { id: 's9', slot: 'weapon', req: { level: 65 } }), false);
    assert.strictEqual(check({ itemId: 's10', rarity: 'common' }, { id: 's10', slot: 'weapon', req: { level: 76 } }), false);

    // 7. Epic and Legendary rarities must ALWAYS be protected even if grade is low
    assert.strictEqual(check({ itemId: 's11', rarity: 'epic' }, { id: 's11', slot: 'weapon', req: { level: 1 } }), false);
    assert.strictEqual(check({ itemId: 's12', rarity: 'legendary' }, { id: 's12', slot: 'weapon', req: { level: 1 } }), false);

    // 8. Normal unprotected common/uncommon weapon of enabled grade MUST be eligible
    assert.strictEqual(check({ itemId: 's13', rarity: 'common' }, { id: 's13', slot: 'weapon', req: { level: 1 } }), true);
  });
});
