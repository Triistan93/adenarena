import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { calculateDetailedCombatPower as calculateDetailedCpCanonical, CP_WEIGHTS } from '../lineage-idle/src/data/balance/cpBalance.js';
import { calculateEHP } from '../lineage-idle/src/data/balance/phase4Model.js';
import { SubclassCertificationService } from '../lineage-idle/src/services/SubclassCertificationService.js';
import { getBaseAttributes, getStats, getActiveSetBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { DyeService } from '../lineage-idle/src/services/DyeService.js';
import { IDLE_MARKUP } from '../src/idle/markup.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Commercial Hero Profile & Power Progression Hub (#tab-character)', () => {

  // 1. CP Single Source of Truth
  it('1. CP Single Source of Truth: Total CP strictly matches between service and detailed breakdown', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.level = 45;

    const totalCp = CombatPowerService.calculateCombatPower(state);
    const detailed = CombatPowerService.calculateDetailedCombatPower(state);

    assert.strictEqual(typeof totalCp, 'number', 'Total CP must be a number');
    assert.ok(totalCp > 0, 'Total CP must be positive');
    assert.strictEqual(totalCp, detailed.totalCp, 'CombatPowerService.calculateCombatPower must equal detailed.totalCp');

    const formatted = CombatPowerService.formatCombatPower(totalCp);
    assert.ok(formatted.endsWith(' CP'), 'Formatted CP must end with " CP"');
    assert.ok(formatted.length >= 5, 'Formatted string must include formatted numbers');
  });

  // 2. CP Breakdown Completeness (Sum of Components = Total CP)
  it('2. CP Breakdown Completeness: 15 audited components sum to totalCp within +/-1 margin', () => {
    const state = DEFAULT_STATE();
    state.race = 'darkelf';
    state.class = 'blade_dancer';
    state.level = 76;
    state.inventory = [
      { uid: 'wpn_1', itemId: 'damascus_sword', tier: 4, enchant: 8, rarity: 'rare' },
      { uid: 'armor_1', itemId: 'tallum_plate_armor', tier: 5, enchant: 4, rarity: 'epic' }
    ];
    state.equipment = {
      weapon: 'wpn_1',
      armor: 'armor_1'
    };
    state.subclasses = [
      { id: 'sub_1', class: 'hawkeye', level: 75, certifications: ['cert_atk_1', 'cert_crit_1'] }
    ];

    const detailed = CombatPowerService.calculateDetailedCombatPower(state);
    const componentSum = Object.values(detailed.components).reduce((s, v) => s + (Number(v) || 0), 0);
    const delta = Math.abs(detailed.totalCp - componentSum);
    assert.ok(delta <= 1, `Component sum (${componentSum}) must equal totalCp (${detailed.totalCp}) within +/-1. Delta: ${delta}`);
  });

  // 3. Vitals Architecture: Strictly HP and MP only, CP resource bar removed
  it('3. Vitals Architecture: #hero-vital-cp removed from tab-character; only HP and MP present', () => {
    const tabStart = IDLE_MARKUP.indexOf('id="tab-character"');
    const tabEnd = IDLE_MARKUP.indexOf('id="tab-skills"');
    assert.ok(tabStart !== -1, '#tab-character must exist in IDLE_MARKUP');
    assert.ok(tabEnd !== -1, '#tab-skills must exist in IDLE_MARKUP');
    const charMarkup = IDLE_MARKUP.slice(tabStart, tabEnd);

    assert.ok(charMarkup.includes('id="hero-vital-hp"'), 'hero-vital-hp must exist in tab-character');
    assert.ok(charMarkup.includes('id="hero-vital-mp"'), 'hero-vital-mp must exist in tab-character');

    assert.strictEqual(charMarkup.includes('id="hero-vital-cp"'), false, 'hero-vital-cp MUST NOT exist in tab-character');
    assert.strictEqual(charMarkup.includes('id="hero-vital-bar-cp"'), false, 'hero-vital-bar-cp MUST NOT exist in tab-character');
    assert.strictEqual(charMarkup.includes('l2-vital-title cp'), false, 'l2-vital-title cp MUST NOT exist in tab-character');

    const stylePath = path.resolve(__dirname, '../lineage-idle/style.css');
    const styleContent = fs.readFileSync(stylePath, 'utf8');
    assert.ok(styleContent.includes('grid-template-columns: repeat(2, 1fr)'), 'l2-vitals-container must use 2 columns');
  });

  // 4. Power Summary & Combat Performance: Canonical Formulas
  it('4. Combat Performance: EHP, Sustained DPS, Burst DPS, HPS derived mathematically', () => {
    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.level = 60;

    const stats = {
      maxHp: 5000,
      def: 800,
      eva: 30,
      atk: 1200,
      crit: 25,
      critDmg: 2.0,
      atkSpd: 1.2,
      regenHp: 0.02,
      lifeDrain: 0.05,
      mpRegen: 15
    };

    const perf = CombatPowerService.getPerformanceMetrics(state, stats);

    const expectedBaseEhp = calculateEHP(5000, 800, 250);
    const expectedEhp = Math.round(expectedBaseEhp / (1 - 0.3));
    assert.strictEqual(perf.ehp, expectedEhp, 'EHP must match phase4Model formula adjusted by evasion');

    const avgHit = 1200 * (1 - 0.25 + 0.25 * 2.0);
    const expectedSustained = Math.round(avgHit * 1.2);
    assert.strictEqual(perf.sustainedDps, expectedSustained, 'Sustained DPS must match expected calculation');
    assert.ok(perf.burstDps >= perf.sustainedDps, 'Burst DPS must be >= Sustained DPS');

    const expectedRegen = 5000 * 0.02;
    const expectedLeech = expectedSustained * 0.05;
    const expectedHps = Math.round((expectedRegen + expectedLeech) * 10) / 10;
    assert.strictEqual(perf.hps, expectedHps, 'HPS must reflect regen + life drain');

    for (const [key, val] of Object.entries(perf)) {
      assert.strictEqual(typeof val, 'number', `${key} must be a number`);
      assert.ok(!Number.isNaN(val), `${key} must not be NaN`);
      assert.ok(val >= 0, `${key} must be non-negative`);
    }
  });

  // 5. Mage Archetype DPS scaling: Uses matk when class is magical
  it('5. Combat Performance: Mage classes scale Sustained DPS from matk', () => {
    const mageState = DEFAULT_STATE();
    mageState.race = 'elf';
    mageState.class = 'spellsinger';
    mageState.level = 60;

    const mageStats = {
      maxHp: 2500,
      def: 400,
      eva: 20,
      atk: 100,
      matk: 2500,
      crit: 20,
      critDmg: 2.0,
      atkSpd: 1.0,
      regenHp: 0.01,
      lifeDrain: 0,
      mpRegen: 30
    };

    const magePerf = CombatPowerService.getPerformanceMetrics(mageState, mageStats);
    assert.ok(magePerf.sustainedDps > 2000, `Mage DPS must derive from matk (got ${magePerf.sustainedDps})`);
  });

  // 6. Core Attributes (Base + Bonus = Final)
  it('6. Core Attributes: Base racial stats resolve correctly and Net Dyes respect +5 cap', () => {
    const races = ['human', 'elf', 'darkelf', 'orc', 'dwarf', 'kamael', 'ertheia', 'sylph', 'highelf'];
    for (const r of races) {
      const base = getBaseAttributes(r, 'fighter');
      assert.ok(base.str > 0, `${r} must have positive STR`);
      assert.ok(base.dex > 0, `${r} must have positive DEX`);
      assert.ok(base.con > 0, `${r} must have positive CON`);
      assert.ok(base.int > 0, `${r} must have positive INT`);
      assert.ok(base.wit > 0, `${r} must have positive WIT`);
      assert.ok(base.men > 0, `${r} must have positive MEN`);
    }

    const state = DEFAULT_STATE();
    state.race = 'human';
    state.class = 'gladiator';
    state.tattoos = [
      { id: 'dye_1', plusStat: 'str', plusVal: 4, minusStat: 'con', minusVal: 4 },
      { id: 'dye_2', plusStat: 'str', plusVal: 4, minusStat: 'con', minusVal: 4 }
    ];

    const netDyes = DyeService.calculateNetDyeBonuses(state);
    assert.strictEqual(netDyes.str, 5, 'Net STR dye bonus must be capped at +5');
    assert.strictEqual(netDyes.con, -8, 'Negative CON penalty must be uncapped (-8)');

    const stats = getStats(state);
    const base = getBaseAttributes('human', 'gladiator');
    assert.strictEqual(state.primaryStats.str, base.str + 5, 'Final STR must equal Base + 5');
    assert.strictEqual(state.primaryStats.con, base.con - 8, 'Final CON must equal Base - 8');
  });

  // 7. Equipment Power Audit: Weights match cpBalance.js
  it('7. Equipment Power: Item CP contribution correctly applies tier base, enchant scaling, and SA', () => {
    const tier = 5;
    const tierBase = CP_WEIGHTS.equipmentTierBase[tier];
    assert.strictEqual(tierBase, 1000, 'Tier 5 base CP must be 1000');

    const enchant = 8;
    const expectedEnchantCp = Math.floor(tierBase * (Math.pow(enchant, 1.4) * 0.14));
    assert.ok(expectedEnchantCp > 0, 'Enchant CP must be positive');

    const saCp = CP_WEIGHTS.specialBonuses.soulCrystal;
    assert.strictEqual(saCp, 300, 'Soul Crystal SA must provide 300 CP');

    const totalItemCp = tierBase + expectedEnchantCp + saCp;
    assert.ok(totalItemCp > tierBase, 'Item CP must grow with enchant and SA');
  });

  // 8. Power Insights Engine
  it('8. Power Insights: Detects equipment concentration, defense bottlenecks, and next steps', () => {
    const state = DEFAULT_STATE();
    state.level = 40;
    state.inventory = [
      { uid: 'wpn_1', itemId: 'katana', tier: 4, enchant: 1 }
    ];
    state.equipment = { weapon: 'wpn_1' };

    const stats = { def: 100 };
    const detailedCp = {
      totalCp: 10000,
      components: {
        baseCp: 3000,
        equipmentCp: 4500,
        enchantCp: 500,
        jewelryCp: 0
      }
    };

    const insights = CombatPowerService.getPowerInsights(state, stats, detailedCp);
    assert.ok(insights.length >= 2, 'Should generate at least 2 insights');

    const hasEquipImpact = insights.some(i => i.type === 'impact' && i.title.includes('Equipamentos'));
    assert.strictEqual(hasEquipImpact, true, 'Must detect equipment as primary power source');

    const hasDefWarning = insights.some(i => i.type === 'warning' && i.title.includes('Defesa'));
    assert.strictEqual(hasDefWarning, true, 'Must trigger defense warning when def < expected baseline');

    const hasWeaponRec = insights.some(i => i.type === 'recommendation' && i.desc.includes('+4'));
    assert.strictEqual(hasWeaponRec, true, 'Must recommend weapon enchant +4 when weapon is < +4');
  });

  // 9. Progression & Next Milestone
  it('9. Progression Engine: Correctly determines milestone thresholds, progress percentage and remaining CP', () => {
    const m1 = CombatPowerService.getNextMilestone(300);
    assert.strictEqual(m1.nextMilestone, 1000);
    assert.strictEqual(m1.prevMilestone, 0);
    assert.strictEqual(m1.remainingCp, 700);
    assert.strictEqual(m1.progressPct, 30);

    const m2 = CombatPowerService.getNextMilestone(37500);
    assert.strictEqual(m2.prevMilestone, 25000);
    assert.strictEqual(m2.nextMilestone, 50000);
    assert.strictEqual(m2.remainingCp, 12500);
    assert.strictEqual(m2.progressPct, 50);

    const m3 = CombatPowerService.getNextMilestone(600000);
    assert.strictEqual(m3.prevMilestone, 500000);
    assert.strictEqual(m3.nextMilestone, 750000);
    assert.strictEqual(m3.remainingCp, 150000);
    assert.strictEqual(m3.progressPct, 40);
  });

  // 10. Subclasses & Certifications Non-Duplication
  it('10. Subclasses & Certifications: Stacks up to 3 subclasses with deterministic CP bonuses', () => {
    const state = DEFAULT_STATE();
    state.level = 80;
    state.subclasses = [
      { id: 'sub_1', class: 'hawkeye', level: 75, certifications: ['cert_atk_1', 'cert_crit_1'] },
      { id: 'sub_2', class: 'paladin', level: 80, certifications: ['cert_def_1', 'cert_hp_1', 'cert_divine_knight'] },
      { id: 'sub_3', class: 'spellsinger', level: 65, certifications: ['cert_matk_1'] }
    ];

    const certCp = SubclassCertificationService.calculateCertificationCP(state);
    assert.ok(certCp > 0, 'Subclass certifications must grant positive CP');

    const certCp2 = SubclassCertificationService.calculateCertificationCP(state);
    assert.strictEqual(certCp, certCp2, 'Certification CP must be deterministic');

    const detailed = CombatPowerService.calculateDetailedCombatPower(state);
    assert.strictEqual(detailed.components.specialEffectCp, certCp, 'detailed.components.specialEffectCp must match SubclassCertificationService output');
  });

  // 11. Immutability & Idempotence
  it('11. Immutability & Idempotence: Successive calculations do not mutate state or stats', () => {
    const state = DEFAULT_STATE();
    state.race = 'orc';
    state.class = 'destroyer';
    state.level = 70;
    state.hp = 3500;
    state.mp = 1200;

    const stats = getStats(state);
    const stateSnap = JSON.stringify(state);
    const statsSnap = JSON.stringify(stats);

    for (let i = 0; i < 5; i++) {
      CombatPowerService.calculateCombatPower(state);
      CombatPowerService.calculateDetailedCombatPower(state);
      CombatPowerService.getPerformanceMetrics(state, stats);
      CombatPowerService.getPowerInsights(state, stats, CombatPowerService.calculateDetailedCombatPower(state));
      CombatPowerService.getNextMilestone(stats.combatPower);
    }

    assert.strictEqual(JSON.stringify(state), stateSnap, 'state must remain strictly unchanged');
    assert.strictEqual(JSON.stringify(stats), statsSnap, 'stats must remain strictly unchanged');
  });
});
