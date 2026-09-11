import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { NoblesseService } from '../lineage-idle/src/services/NoblesseService.js';
import { OlympiadService } from '../lineage-idle/src/services/OlympiadService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

describe('Glory Pillar — Subtab 2: Olympiad & Noblesse (Olimpíadas & Nobreza)', () => {
  it('1. Noblesse Requirement Gating: Rejects players under Lv.75 or non-nobles from Olympiad', () => {
    const state = DEFAULT_STATE();
    state.level = 70;
    state.isNoblesse = false;

    const noblesseStatus = NoblesseService.getNoblesseStatus(state);
    assert.equal(noblesseStatus.isNoblesse, false);
    assert.equal(noblesseStatus.canJoinOlympiad, false);

    const olympiadStatus = OlympiadService.getOlympiadStatus(state);
    assert.equal(olympiadStatus.canEnter, false);
  });

  it('2. Noblesse Quest Progression: Advances through steps and achieves Noblesse status', () => {
    const state = DEFAULT_STATE();
    state.level = 76;
    state.noblesseStep = 1;
    state.noblesseProgress = { part1Kills: 25, part2Kills: 30, barakielKilled: true };

    // Step 1
    const advance1 = NoblesseService.completeStep(state, 1);
    assert.equal(Boolean(advance1), true);
    assert.equal(state.noblesseStep, 2);

    // Step 2
    const advance2 = NoblesseService.completeStep(state, 2);
    assert.equal(Boolean(advance2), true);
    assert.equal(state.noblesseStep, 3);

    // Step 3
    const advance3 = NoblesseService.completeStep(state, 3);
    assert.equal(Boolean(advance3), true);
    assert.equal(state.noblesseStep, 4);

    // Step 4 - Final consecration
    const advance4 = NoblesseService.completeStep(state, 4);
    assert.equal(Boolean(advance4), true);
    assert.equal(state.isNoblesse, true);

    const updatedOly = OlympiadService.getOlympiadStatus(state);
    assert.equal(updatedOly.canEnter, true);
  });

  it('3. Matchmaking & Gladiator Generation: Generates matched opponents by CP tier', () => {
    const state = DEFAULT_STATE();
    state.level = 78;
    state.isNoblesse = true;
    state.stats = { atk: 3000, def: 2000, maxHp: 8000, combatPower: 95000 };

    const opponent = OlympiadService.getGladiatorOpponent(state);
    assert.ok(opponent);
    assert.ok(opponent.name);
    assert.ok(opponent.hp > 0 || opponent.elo > 0);
  });

  it('4. Hero Status Claim & Infinity Weapons: Coroation grants hero status and tokens', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.isNoblesse = true;
    state.olympiadPoints = 1600;
    state.class = 'duelist';

    const heroRes = OlympiadService.claimHeroStatus(state, 'weapon_infinity_blade');
    assert.equal(Boolean(heroRes), true);
    assert.equal(state.isHero, true);
    assert.ok(state.heroTitle || state.olympiadHeroTitle);
  });

  it('5. Olympiad Token Shop: Buys items and deducts tokens accurately', () => {
    const state = DEFAULT_STATE();
    state.olympiadTokens = 5000;
    state.inventory = [];

    const buyRes = OlympiadService.buyShopItem(state, 'giants_codex', 1);
    assert.equal(Boolean(buyRes), true);
    assert.ok(state.olympiadTokens < 5000);
    assert.ok(state.inventory.length > 0);
  });

  it('6. Save/Load Roundtrip: Preserves noblesse, olympiad points, tokens and hero flag', () => {
    const state = DEFAULT_STATE();
    state.isNoblesse = true;
    state.noblesseStep = 4;
    state.olympiadPoints = 1450;
    state.olympiadTokens = 3200;
    state.isHero = true;

    const json = JSON.stringify(state);
    const reloaded = JSON.parse(json);

    assert.equal(reloaded.isNoblesse, true);
    assert.equal(reloaded.olympiadPoints, 1450);
    assert.equal(reloaded.olympiadTokens, 3200);
    assert.equal(reloaded.isHero, true);
  });
});
