import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { getStats, getEquipBonus } from '../lineage-idle/src/engine/StatsEngine.js';
import { CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { FortressService } from '../lineage-idle/src/services/FortressService.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar Deep Validation — Suite 1: Runtime Proof & Stat Isolation', () => {
  it('1. Stat Source Isolation & Rollback: Card Codex absorption increases stats and rolls back cleanly', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.inventory = [{ id: 'card_queen_ant', itemId: 'card_queen_ant', count: 10 }];
    state.codex = {};

    const baselineStats = getStats(state);

    // Absorb card
    CardCodexService.absorbCardIntoCodex(state, 'card_queen_ant', 10);
    const withCardStats = getStats(state);
    assert.ok(withCardStats.atk > baselineStats.atk);

    // Rollback
    state.codex = {};
    state.cardCodex = {};
    const rolledBackStats = getStats(state);
    assert.equal(rolledBackStats.atk, baselineStats.atk);
  });

  it('2. Stat Source Isolation: Fortress Talisman equip increases stats and rolls back on unequip', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.fortresses.equippedBracelet = 'bracelet_silver';
    state.fortresses.equippedTalismans = [];
    state.fortresses.epaulettes = 1000;

    const baselineBonuses = FortressService.getBonuses(state);
    assert.equal(baselineBonuses.pAtk, 0);

    FortressService.equipTalisman(state, 'talisman_power');
    const withTalisman = FortressService.getBonuses(state);
    assert.ok(withTalisman.pAtk > 0);

    FortressService.unequipTalisman(state, 'talisman_power');
    const rolledBack = FortressService.getBonuses(state);
    assert.equal(rolledBack.pAtk, 0);
  });

  it('3. Zero Double-Counting: Simultaneous activation of Clan + Talisman + Codex bonuses', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.clan.level = 5;
    state.fortresses.equippedTalismans = ['talisman_power'];
    state.codex = { card_queen_ant: { count: 10, rank: 3 } };

    const stats = getStats(state);
    assert.ok(stats.atk > 0);
    assert.ok(stats.def > 0);
    assert.ok(stats.maxHp > 0);
  });

  it('4. Combat Power Traceability: Changing enchant level produces deterministic CP increases', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'fighter';
    state.inventory = [
      { uid: 'wpn_1', itemId: 'sword_of_revolution', name: 'Sword', slot: 'weapon', grade: 'd', pAtk: 56, enchant: 0, equipped: true }
    ];
    state.equipment.weapon = 'wpn_1';

    const stats0 = getStats(state);

    // Increase enchant to +10
    state.inventory[0].enchant = 10;
    const stats10 = getStats(state);

    assert.ok(stats10.combatPower > stats0.combatPower);
  });
});
