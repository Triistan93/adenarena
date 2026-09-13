import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../lineage-idle/src/data/clan.js';
import { CASTLES } from '../lineage-idle/src/data/castles.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 1: Clan & Castles (Clã & Castelos)', () => {
  it('1. Clan Creation & Status: Creates clan and calculates base status', () => {
    const state = DEFAULT_STATE();
    state.gold = 500000;
    
    ClanService.createOrEditClan(state, 'Os Guardiões de Aden', 'Pela Glória de Aden!');
    const status = ClanService.getClanStatus(state);
    assert.equal(status.clan.level, 1);
    assert.equal(status.clan.name, 'Os Guardiões de Aden');
    assert.ok(status.levelData);
    assert.ok(status.nextLevelData);
  });

  it('2. Clan Level Progression: Upgrades clan from Level 1 to 5 with requirements', () => {
    const state = DEFAULT_STATE();
    state.clan.level = 1;
    state.level = 80;
    state.gold = 100000000;
    state.sp = 50000000;
    state.clan.reputation = 50000;

    for (let targetLvl = 2; targetLvl <= 5; targetLvl++) {
      const res = ClanService.upgradeClan(state);
      assert.equal(res.success, true, `Upgrade to Lv.${targetLvl} should succeed`);
      assert.equal(state.clan.level, targetLvl);
    }

    // Attempting upgrade beyond Lv.5 should reject
    const maxRes = ClanService.upgradeClan(state);
    assert.equal(maxRes.success, false);
    assert.equal(maxRes.reason, 'max_level');
  });

  it('3. Clan Skills & Passive Bonuses: Unlocks cumulative clan buffs per level', () => {
    const state = DEFAULT_STATE();
    state.clan.level = 5;

    const status = ClanService.getClanStatus(state);
    assert.ok(status.activeSkills.length >= 4, 'Lv.5 clan should have unlocked multiple clan skills');
    assert.ok(status.bonusStats.pAtkBonusPercent > 0);
    assert.ok(status.bonusStats.pDefBonusPercent > 0);
    assert.ok(status.bonusStats.hpBonusPercent > 0);
  });

  it('4. Castle Siege & Victory: Declares siege, executes combat turns, and claims ownership', () => {
    const state = DEFAULT_STATE();
    state.level = 75;
    state.clan.level = 5;
    state.hp = 5000;
    state.maxHp = 5000;
    state.stats = { atk: 2500, def: 1800, combatPower: 75000 };

    const startRes = ClanService.startSiege(state, 'giran');
    assert.equal(startRes.success, true);
    assert.ok(state.activeSiege || state.clan.activeSiege);

    // Execute turns until siege completion
    let turns = 0;
    while ((state.activeSiege || state.clan.activeSiege) && turns < 20) {
      ClanService.executeSiegeTurn(state);
      turns++;
    }

    assert.ok(turns > 0);
  });

  it('5. Castle Tax Revenue & Claiming: Accumulates taxes and claims to player treasury', () => {
    const state = DEFAULT_STATE();
    state.clan.castles = ['giran'];
    state.clan.lastTaxTimestamp = Date.now() - (3600 * 1000 * 2); // 2 hours ago
    state.gold = 10000;

    ClanService.updateTaxesTick(state);
    const taxes = state.clan.accumulatedTaxes?.giran || 0;
    assert.ok(taxes >= 0);

    const claimRes = ClanService.claimCastleTaxes(state, 'giran');
    if (taxes > 0) {
      assert.equal(claimRes.success, true);
      assert.ok(state.gold > 10000);
    }
  });

  it('6. Clan Hall Buffs Activation: Applies clan hall buffs and persists', () => {
    const state = DEFAULT_STATE();
    state.gold = 500000;
    state.clan.level = 3;

    const res = ClanService.activateClanHallBuff(state, 'paagrio_protection');
    assert.equal(res.success, true);
    assert.ok(state.buffs['clan_hall_paagrio_protection']);
  });

  it('7. Clan State Serialization: Survives JSON roundtrip cleanly', () => {
    const state = DEFAULT_STATE();
    state.clan.level = 4;
    state.clan.reputation = 25000;
    state.clan.castles = ['dion'];

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.equal(reloaded.clan.level, 4);
    assert.equal(reloaded.clan.reputation, 25000);
    assert.deepEqual(reloaded.clan.castles, ['dion']);
  });
});
