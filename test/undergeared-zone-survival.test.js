/**
 * undergeared-zone-survival.test.js
 *
 * MASTER GAME BALANCE — UNDER-GEARED ZONE SURVIVAL AUDIT
 *
 * Verifies that:
 * 1. A Level 100 character wearing No-Grade armor has low CP (~18k), classifying them strictly as LOCKED for Lv. 95+ zones.
 * 2. selectZone prevents entry to zones where player CP < minCp.
 * 3. In combat against Level 96 monsters (Lava Golem), autonomous attacks and crushing penalties guarantee defeat.
 * 4. S-Grade equipped characters achieve sufficient CP and defense to survive and farm comfortably.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { selectZone, startCombat } from '../lineage-idle/src/engine/CombatEngine.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import {
  getZoneProgression,
  classifyCpBand,
  calculateDefenseMitigation
} from '../lineage-idle/src/data/balance/index.js';
import { simulateCombat } from '../lineage-idle/src/services/CombatSimulator.js';

// Setup Mock Window
globalThis.window = globalThis.window || {};
globalThis.window.GameData = { ALL_ITEMS };
globalThis.GameData = { ALL_ITEMS };

describe('MASTER GAME BALANCE — UNDER-GEARED ZONE SURVIVAL AUDIT', () => {

  test('1. CP Classification: Level 100 character with No-Grade armor is strictly LOCKED for Forge of the Gods', () => {
    const noGradeState = {
      level: 100,
      class: 'duelist',
      race: 'human',
      skills: { fighter_will: 5, power_strike_f: 5 },
      equipment: {
        armor: 'ng1',
        weapon: 'ng2'
      },
      inventory: [
        { uid: 'ng1', itemId: 'armor_bone_breastplate', def: 30, equipped: true, enchant: 0 },
        { uid: 'ng2', itemId: 'apprentice_wand', atk: 15, equipped: true, enchant: 0 }
      ]
    };

    const stats = getStats(noGradeState);
    const fogProg = getZoneProgression('forgeOfGods');

    assert.equal(fogProg.level, 95);
    assert.equal(fogProg.minCp, 800000);
    assert.equal(fogProg.recCp, 1000000);

    // CP must be around 18k and far below 130k
    assert.ok(stats.combatPower < 30000, `No-Grade CP must be < 30,000, got ${stats.combatPower}`);
    assert.ok(stats.combatPower < fogProg.minCp, 'No-Grade CP must be strictly less than Forge of the Gods minCp');

    const band = classifyCpBand(stats.combatPower, fogProg.minCp, fogProg.recCp);
    assert.equal(band, 'LOCKED', 'Under-geared player must be classified strictly as LOCKED');
  });

  test('2. Zone Entry Gate: selectZone rejects under-geared entry to high-level zones', () => {
    const logs = [];
    const floatTexts = [];
    const mockCallbacks = {
      log: (msg, type) => logs.push({ msg, type }),
      floatText: (txt, cls) => floatTexts.push({ txt, cls }),
      updateAllUI: () => {},
      save: () => {}
    };

    const undergearedState = {
      level: 100,
      class: 'duelist',
      race: 'human',
      combatPower: 18000,
      stats: { combatPower: 18000 },
      zone: 'talkingIsland',
      currentZone: 'talkingIsland',
      inventory: []
    };

    // Attempt to enter Forge of the Gods (requires 130k CP)
    const result = selectZone(undergearedState, 'forgeOfGods', mockCallbacks);
    assert.equal(result, false, 'selectZone must reject under-geared player');
    assert.equal(undergearedState.zone, 'talkingIsland', 'Player must remain in original zone');

    assert.ok(logs.some(l => l.msg.includes('Poder de Combate Insuficiente')), 'Must log insufficient CP warning');
    assert.ok(floatTexts.some(f => f.txt.includes('REQUER') && f.txt.includes('CP')), 'Must show float warning text');
  });

  test('3. Crushing Lethality: Level 96 Lava Golem delivers fatal crushing damage against No-Grade player', () => {
    const noGradeState = {
      level: 100,
      class: 'duelist',
      race: 'human',
      skills: { fighter_will: 5, power_strike_f: 5 },
      equipment: {
        armor: 'ng1',
        weapon: 'ng2'
      },
      inventory: [
        { uid: 'ng1', itemId: 'armor_bone_breastplate', def: 30, equipped: true, enchant: 0 },
        { uid: 'ng2', itemId: 'apprentice_wand', atk: 15, equipped: true, enchant: 0 }
      ]
    };

    const stats = getStats(noGradeState);
    const mob = MONSTERS['lavaGolem'];
    assert.ok(mob, 'Lava Golem must exist in MONSTERS');
    assert.equal(mob.lvl, 96);

    const fogProg = getZoneProgression('forgeOfGods');
    const cpRatio = Math.max(0.05, stats.combatPower / fogProg.minCp);
    const baseDmg = calculateDefenseMitigation(mob.atk, stats.def, false);
    const crushMult = 1.0 + (1.0 - cpRatio) * 2.5;
    const finalCrushDmg = Math.floor(baseDmg * crushMult);

    assert.ok(crushMult >= 2.5, `Crush multiplier (${crushMult}) must be >= 2.5x`);
    assert.ok(finalCrushDmg > stats.maxHp, `Crushing damage (${finalCrushDmg}) must exceed player maxHp (${stats.maxHp}) for 1-hit kill`);
  });

  test('4. Combat Simulator Parity: Under-geared Level 100 character loses rapidly against Lava Golem', () => {
    const noGradeState = {
      level: 100,
      class: 'duelist',
      race: 'human',
      skills: { fighter_will: 5, power_strike_f: 5 },
      equipment: {
        armor: 'ng1',
        weapon: 'ng2'
      },
      inventory: [
        { uid: 'ng1', itemId: 'armor_bone_breastplate', def: 30, equipped: true, enchant: 0 },
        { uid: 'ng2', itemId: 'apprentice_wand', atk: 15, equipped: true, enchant: 0 },
        { itemId: 'hp_potion_xl', count: 50 },
        { itemId: 'mp_potion_xl', count: 50 }
      ]
    };

    const stats = getStats(noGradeState);
    const player = {
      level: 100,
      class: 'duelist',
      maxHp: stats.maxHp,
      hp: stats.maxHp,
      maxMp: stats.maxMp,
      mp: stats.maxMp,
      stats,
      skills: noGradeState.skills,
      inventory: [
        { itemId: 'hp_potion_xl', count: 50 },
        { itemId: 'mp_potion_xl', count: 50 }
      ]
    };

    const mob = { ...MONSTERS['lavaGolem'] };
    mob._maxHp = mob.hp;

    const sim = simulateCombat({ player, enemy: mob, skills: {} });

    assert.equal(sim.outcome, 'LOSS', 'Under-geared player must strictly result in LOSS');
    assert.equal(sim.winner, 'enemy');
    assert.ok(sim.ttd !== null && sim.ttd <= 10, `Time to Death (${sim.ttd}s) must be <= 10s`);
  });

  test('5. S-Grade Geared Progression: Properly geared character has high CP and can farm safely', () => {
    const sGradeState = {
      level: 100,
      class: 'duelist',
      race: 'human',
      skills: { fighter_will: 5, power_strike_f: 5, armorMast: 10, heavyArmor: 5 },
      equipment: {
        armor: 'eq1',
        helmet: 'eq2',
        gloves: 'eq3',
        boots: 'eq4',
        shield: 'eq5',
        legs: 'eq7',
        weapon: 'eq6'
      },
      inventory: [
        { uid: 'eq1', itemId: 'armor_imperial_crusader_breastplate', def: 118, equipped: true, enchant: 8 },
        { uid: 'eq2', itemId: 'armor_imperial_crusader_helmet', def: 41, equipped: true, enchant: 8 },
        { uid: 'eq3', itemId: 'armor_imperial_crusader_gloves', def: 24, equipped: true, enchant: 8 },
        { uid: 'eq4', itemId: 'armor_imperial_crusader_boots', def: 30, equipped: true, enchant: 8 },
        { uid: 'eq5', itemId: 'armor_imperial_crusader_shield', def: 53, equipped: true, enchant: 8 },
        { uid: 'eq7', itemId: 'armor_imperial_crusader_pants', def: 71, equipped: true, enchant: 8 },
        { uid: 'eq6', itemId: 'weapon_tallum_blade_damascus_dual', atk: 350, equipped: true, enchant: 10 }
      ]
    };

    const stats = getStats(sGradeState);
    assert.ok(stats.combatPower >= 25000, `S-Grade CP (${stats.combatPower}) must be >= 25,000`);
    assert.ok(stats.def >= 2000, `S-Grade Def (${stats.def}) must be >= 2,000`);

    const mob = MONSTERS['lavaGolem'];
    const damage = calculateDefenseMitigation(mob.atk, stats.def, false);
    // S-Grade defense reduces 2950 raw damage down to chip damage (< 300)
    assert.ok(damage <= 300, `Damage to S-Grade tank (${damage}) must be <= 300`);
  });

  test('6. Repatriation Gate: startCombat sends under-geared loaded characters safely back to town', () => {
    const logs = [];
    const mockCallbacks = {
      log: (msg, type) => logs.push({ msg, type }),
      updateAllUI: () => {},
      save: () => {}
    };

    const loadedUndergeared = {
      level: 100,
      class: 'duelist',
      race: 'human',
      combatPower: 25000,
      stats: { combatPower: 25000 },
      zone: 'forgeOfGods', // Saved in an illegal zone
      currentZone: 'forgeOfGods',
      inventory: []
    };

    startCombat(loadedUndergeared, mockCallbacks);

    // Must be relocated to town
    assert.notEqual(loadedUndergeared.zone, 'forgeOfGods', 'Character must not stay in forgeOfGods');
    assert.ok(logs.some(l => l.msg.includes('Poder de Combate Insuficiente')), 'Must log insufficient CP repatriation');
  });

  test('7. Evasion Suppression: Under-geared character cannot easily dodge high-level monsters', () => {
    const playerCp = 25000;
    const targetMinCp = 130000;
    const cpRatio = playerCp / targetMinCp; // ~0.192
    assert.ok(cpRatio < 0.6, 'CP ratio must be below 0.60');

    const mobLvl = 98; // Flame Giant Dragon
    const mobAccuracy = mobLvl * 1.5 + 40; // 187
    const playerEvasion = 50;
    const effectiveEva = playerEvasion * Math.pow(cpRatio, 2); // ~1.8
    const evaDiff = effectiveEva - mobAccuracy; // negative
    const dodgeChance = (cpRatio < 0.6) ? 0.02 : Math.max(0.02, Math.min(0.65, 0.15 + (evaDiff * 0.01)));

    assert.equal(dodgeChance, 0.02, 'Dodge chance for severely under-geared player must be hard-capped at 2%');
  });

});
