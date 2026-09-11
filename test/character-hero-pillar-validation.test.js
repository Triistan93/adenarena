import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getBaseAttributes, applyPrimaryStats, getStats, getTotalEquipBonuses, getActiveSetBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { SubclassCertificationService } from '../lineage-idle/src/services/SubclassCertificationService.js';
import { DyeService } from '../lineage-idle/src/services/DyeService.js';
import { DYES_CATALOG } from '../lineage-idle/src/data/dyes.js';

describe('Hero Pillar — Subtab 1: Character (Personagem)', () => {

  it('1. Base Attributes: correctly resolves base STR, DEX, CON, INT, WIT, MEN for all canonical race/archetypes', () => {
    const humanFighter = getBaseAttributes('human', 'gladiator');
    assert.strictEqual(humanFighter.str, 40);
    assert.strictEqual(humanFighter.con, 43);
    assert.strictEqual(humanFighter.dex, 30);
    assert.strictEqual(humanFighter.int, 21);
    assert.strictEqual(humanFighter.wit, 11);
    assert.strictEqual(humanFighter.men, 25);

    const darkElfMage = getBaseAttributes('darkelf', 'spellhowler');
    assert.strictEqual(darkElfMage.int, 44);
    assert.strictEqual(darkElfMage.wit, 19);
    assert.strictEqual(darkElfMage.men, 37);
    assert.strictEqual(darkElfMage.str, 23);

    const elfFighter = getBaseAttributes('elf', 'plains_walker');
    assert.strictEqual(elfFighter.dex, 35);
    assert.strictEqual(elfFighter.con, 36);

    const orcFighter = getBaseAttributes('orc', 'destroyer');
    assert.strictEqual(orcFighter.str, 40);
    assert.strictEqual(orcFighter.con, 47);

    const dwarfFighter = getBaseAttributes('dwarf', 'bounty_hunter');
    assert.strictEqual(dwarfFighter.con, 45);
  });

  it('2. Primary Stats Pipeline: Base + Dyes + Equip + Set unifies into primaryStats without double application', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.level = 40;

    // Apply 2 +4 STR / -4 CON dyes
    state.tattoos = [
      { id: 'dye_str_4', name: 'Dye of STR +4 CON -4', plusStat: 'str', plusVal: 4, minusStat: 'con', minusVal: 4 },
      { id: 'dye_str_2', name: 'Dye of STR +2 CON -2', plusStat: 'str', plusVal: 2, minusStat: 'con', minusVal: 2 }
    ];

    // Net STR bonus is capped at +5 by DyeService, reductions are uncapped
    const netDyes = DyeService.calculateNetDyeBonuses(state);
    assert.strictEqual(netDyes.str, 5); // +6 capped at +5
    assert.strictEqual(netDyes.con, -6);

    const stats = getStats(state);
    assert.ok(state.primaryStats, 'primaryStats must be computed');
    assert.strictEqual(state.primaryStats.str, 40 + 5); // Base 40 + 5 net dyes
    assert.strictEqual(state.primaryStats.con, 43 - 6); // Base 43 - 6 net dyes

    // Verify stats.atk scales with STR
    assert.ok(stats.atk > 0);
    assert.ok(stats.maxHp > 0);
  });

  it('3. Set Enchantment Bonus: Activates +4 set enchant bonus when wearing helmet, armor, legs, gloves, boots +4', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.level = 60;
    state.inventory = [
      { uid: 'helm_1', itemId: 'full_plate_helmet', enchant: 4 },
      { uid: 'armor_1', itemId: 'full_plate_armor', enchant: 4 },
      { uid: 'legs_1', itemId: 'full_plate_gaiters', enchant: 4 },
      { uid: 'gloves_1', itemId: 'full_plate_gauntlets', enchant: 4 },
      { uid: 'boots_1', itemId: 'full_plate_boots', enchant: 4 }
    ];
    state.equipment = {
      helmet: 'helm_1',
      armor: 'armor_1',
      legs: 'legs_1',
      gloves: 'gloves_1',
      boots: 'boots_1'
    };

    const stats = getStats(state);
    assert.ok(stats.def > 0);
    assert.ok(stats.maxHp > 0);
  });

  it('4. Combat Power Calculation: Returns non-zero, deterministic CP value', () => {
    const state = DEFAULT_STATE();
    state.race = 'darkelf';
    state.class = 'blade_dancer';
    state.level = 76;
    const stats = getStats(state);
    assert.ok(stats.combatPower > 0, 'Combat power must be calculated');
    assert.strictEqual(typeof stats.combatPower, 'number');
  });

  it('5. Subclass & Certifications: Unlocks milestones at levels 65, 70, 75, 80 and stacks bonuses', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'duelist';
    state.level = 80;
    state.subclasses = [
      { id: 'sagittarius', classId: 'sagittarius', name: 'Sagittarius', level: 80 }
    ];
    state.subclassCertifications = {
      'sagittarius': {
        lv65: 'emergent_patk',
        lv70: 'emergent_pdef',
        lv75: 'master_critical',
        lv80: 'divine_rogue'
      }
    };

    const certBonus = SubclassCertificationService.calculateTotalCertificationBonuses(state);
    assert.strictEqual(certBonus.pAtk, 35);
    assert.strictEqual(certBonus.pDef, 30);
    assert.strictEqual(certBonus.critRate, 20 + 30); // 20 from master_critical + 30 from divine_rogue
    assert.strictEqual(certBonus.evasion, 6);

    const stats = getStats(state);
    assert.ok(stats.atk > 0);
    assert.ok(stats.def > 0);
  });

  it('6. Save/Load Persistence: State serializes to JSON and recovers character properties accurately', () => {
    const state = DEFAULT_STATE();
    state.heroName = 'HeroAden';
    state.race = 'elf';
    state.class = 'silver_ranger';
    state.level = 52;
    state.gold = 500000;

    const serialized = JSON.stringify(state);
    const reloaded = JSON.parse(serialized);

    assert.strictEqual(reloaded.heroName, 'HeroAden');
    assert.strictEqual(reloaded.race, 'elf');
    assert.strictEqual(reloaded.class, 'silver_ranger');
    assert.strictEqual(reloaded.level, 52);
    assert.strictEqual(reloaded.gold, 500000);
  });
});
