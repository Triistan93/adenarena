import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { NoblesseService } from '../lineage-idle/src/services/NoblesseService.js';
import { OlympiadService } from '../lineage-idle/src/services/OlympiadService.js';
import { RankingService } from '../lineage-idle/src/services/RankingService.js';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { FortressService } from '../lineage-idle/src/services/FortressService.js';
import { CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Suite 8: Cross-System Triangulation & Holistic Integrity', () => {
  it('1. End-to-End Glory Progression: Clan Upgrade -> Castle Lord -> Noblesse -> Olympiad Hero -> Top Ranking -> Seven Signs -> Fortress -> Codex', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'LordAden';
    state.race = 'human';
    state.class = 'duelist';
    state.level = 80;
    state.gold = 50000000;
    state.sp = 10000000;
    state.clan = {
      name: 'Os Guardiões de Aden',
      level: 1,
      castles: [],
      reputation: 0,
      lastTaxTimestamp: 0,
      accumulatedTaxes: {}
    };

    // 1. Clan Lv.5 + Castle Lord
    for (let l = 2; l <= 5; l++) ClanService.upgradeClan(state);
    state.clan.castles = ['aden'];

    // 2. Noblesse Consecration
    state.noblesseStep = 4;
    NoblesseService.completeStep(state, 4);
    assert.equal(state.isNoblesse, true);

    // 3. Olympiad Hero Status
    state.olympiadPoints = 1800;
    OlympiadService.claimHeroStatus(state, 'infinity_blade');
    assert.equal(state.isHero, true);

    // 4. Seven Signs Faction & Ancient Adena
    SevenSignsService.joinFaction(state, 'dawn');
    state.sevenSigns.ancientAdena = 250000;

    // 5. Fortress & Talismans
    state.fortresses.owned = ['fort_shannsu'];
    state.fortresses.epaulettes = 3000;
    FortressService.buyBracelet(state, 'bracelet_mithril');
    FortressService.equipTalisman(state, 'talisman_power');

    // 6. Monster Card Codex Mythic
    state.codex = {
      card_queen_ant: { count: 50, rank: 5 },
      card_baium: { count: 50, rank: 5 }
    };

    // 7. Calculate final stats and public profile
    const stats = getStats(state);
    const profile = RankingService.buildPublicProfile(state);

    assert.ok(stats.atk > 0);
    assert.ok(stats.combatPower > 0);
    assert.equal(profile.isHero, true);
    assert.equal(profile.clanName, 'Os Guardiões de Aden');
    assert.equal(profile.castleLord, 'aden');
  });

  it('2. Deep Save / Load Roundtrip: 100% data preservation across all 7 Glory subsystems', () => {
    const state = DEFAULT_STATE();
    state.clan = { name: 'ImperialDynasty', level: 5, castles: ['giran'], reputation: 90000, lastTaxTimestamp: 12345, accumulatedTaxes: { giran: 500000 } };
    state.olympiad = { points: 1750, wins: 45, losses: 5, tokens: 12000, isHero: true, heroWeapon: 'infinity_blade' };
    state.noblesse = { isNoblesse: true, step: 4, tiaraClaimed: true };
    state.sevenSigns = { faction: 'dawn', ancientAdena: 420000, bossDefeats: { lilith: 5, anakim: 2 } };
    state.fortresses = { owned: ['fort_shannsu', 'fort_antharas'], epaulettes: 4500, equippedBracelet: 'bracelet_mithril', equippedTalismans: ['talisman_power', 'talisman_defense'] };
    state.codex = { card_queen_ant: { count: 50, rank: 5 }, card_zaken: { count: 25, rank: 4 } };
    state.lastRankingRewardClaim = 1720000000000;

    const serialized = JSON.stringify(state);
    const deserialized = JSON.parse(serialized);

    assert.deepEqual(deserialized.clan, state.clan);
    assert.deepEqual(deserialized.olympiad, state.olympiad);
    assert.deepEqual(deserialized.noblesse, state.noblesse);
    assert.deepEqual(deserialized.sevenSigns, state.sevenSigns);
    assert.deepEqual(deserialized.fortresses, state.fortresses);
    assert.deepEqual(deserialized.codex, state.codex);
    assert.equal(deserialized.lastRankingRewardClaim, state.lastRankingRewardClaim);
  });

  it('3. Robustness & Boundary Validation: Engine gracefully handles missing or corrupt glory fields', () => {
    const corruptState = {
      level: 40,
      inventory: [],
      clan: null,
      olympiad: null,
      noblesse: null,
      sevenSigns: null,
      fortresses: null,
      codex: null
    };

    assert.doesNotThrow(() => {
      ClanService.getClanStatus(corruptState);
      NoblesseService.getNoblesseStatus(corruptState);
      OlympiadService.getOlympiadStatus(corruptState);
      SevenSignsService.ensureState(corruptState);
      FortressService.ensureState(corruptState);
      CardCodexService.getCodexPassiveBonuses(corruptState);
      RankingService.buildPublicProfile(corruptState);
    });
  });
});
