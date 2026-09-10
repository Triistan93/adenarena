/**
 * CombatSimulator.js — Simulador de Combate Headless do Lineage Idle.
 *
 * Executa simulações puras de combate turno-a-turno / tick-a-tick em Node.js ou Browser,
 * sem dependência de DOM, Canvas, React, áudio ou VFX.
 * Permite avaliação matemática e calibração estatística de TTK, TTD, win rate e sustentabilidade
 * em plena conformidade com as matrizes canônicas da FASE 4.
 */

import {
  COMBAT_CONFIG,
  calculatePhysicalDamage,
  calculateMagicDamage,
  calculateHealAmount,
  calculateVampiricHeal
} from '../data/balance/combatBalance.js';

import {
  canCastSkill,
  consumeSkillMp,
  getSkillMpCost
} from '../data/balance/skillBalance.js';

import {
  calculateEffectiveHpBudget,
  calculatePST,
  calculateSurvivalMargin,
  classifyResourcePressure,
  calculateCombatRates
} from '../data/balance/phase4Model.js';

/**
 * Clona profundamente um objeto de estado/entidade de forma segura.
 */
function cloneEntity(obj) {
  if (!obj) return null;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Simula um combate individual completo entre jogador e inimigo até a vitória, derrota, empate ou timeout.
 * @param {Object} options
 * @param {Object} options.player - Estado do jogador
 * @param {Object} options.enemy - Estado do inimigo
 * @param {Object} [options.skills] - Mapa de definições de habilidades { [id]: def }
 * @param {Object} [options.config] - Configurações de simulação
 * @returns {Object} Resultado do combate
 */
export function simulateCombat({
  player: originalPlayer,
  enemy: originalEnemy,
  skills = {},
  config = {}
}) {
  const player = cloneEntity(originalPlayer);
  const enemy = cloneEntity(originalEnemy);

  const tickRateMs = config.tickRateMs || 200;
  const maxDurationMs = (config.maxDurationSec ? config.maxDurationSec * 1000 : null) || config.maxDurationMs || 180000; // 3 minutos timeout
  const potionCooldownMs = config.potionCooldownMs || COMBAT_CONFIG.potionCooldownMs;
  const autoHpThreshold = config.autoHpThreshold || 0.60;
  const autoMpThreshold = config.autoMpThreshold || 0.40;
  const applyVariance = config.applyVariance !== false;

  const stats = player.stats || {};
  player.maxHp = stats.maxHp || player.maxHp || player.hp || 1000;
  player.maxMp = stats.maxMp || player.maxMp || player.mp || 300;
  player.hp = Math.min(player.hp || player.maxHp, player.maxHp);
  player.mp = Math.min(player.mp || player.maxMp, player.maxMp);

  enemy._maxHp = enemy._maxHp || enemy.hp || 5000;
  enemy.hp = enemy._maxHp;

  const cds = {};
  let lastHpPotTime = -potionCooldownMs;
  let lastMpPotTime = -potionCooldownMs;

  let combatTick = 0;
  let totalDamageDealt = 0;
  let autoAttackDamageDealt = 0;
  let skillDamageDealt = 0;
  let totalDamageTaken = 0;
  let totalHealingDone = 0;
  let totalMpSpent = 0;
  let hpPotionsUsed = 0;
  let mpPotionsUsed = 0;
  let criticalHits = 0;
  const skillsUsed = {};

  const triggeredMechanics = new Set();
  const triggeredFatal = new Set();
  let isChannelingFatal = false;
  let fatalCastUntil = 0;
  let fatalDmgPending = 0;

  let winner = null;
  let outcome = null;
  let ttk = null;
  let ttd = null;

  while (combatTick * tickRateMs < maxDurationMs) {
    combatTick++;
    const now = combatTick * tickRateMs;

    // 1. REGENERAÇÃO DE HP & MP
    if (combatTick % 5 === 0) { // a cada 1 segundo (5 * 200ms)
      const mpReg = Math.max(1, Number(stats.mpRegen) || 3);
      player.mp = Math.min(player.maxMp, player.mp + mpReg);
    }
    if (combatTick % 10 === 0) { // a cada 2 segundos
      if (stats.regenHp > 0) {
        const hpReg = Math.max(1, Math.floor(player.maxHp * stats.regenHp));
        player.hp = Math.min(player.maxHp, player.hp + hpReg);
        totalHealingDone += hpReg;
      }
    }

    // 2. AUTO-POÇÃO (com cooldown de 1500ms e estoque estritamente finito)
    if (player.hp < player.maxHp * autoHpThreshold && (now - lastHpPotTime) >= potionCooldownMs) {
      const potIds = ['hp_potion_xl', 'hp_potion_l', 'hp_potion_m', 'hp_potion_s'];
      const potHeals = { hp_potion_xl: 500, hp_potion_l: 300, hp_potion_m: 150, hp_potion_s: 100 };
      for (const pid of potIds) {
        const invItem = player.inventory?.find(i => i.itemId === pid && (typeof i.count === 'number' ? i.count > 0 : (typeof i.qty === 'number' ? i.qty > 0 : true)));
        if (invItem) {
          const heal = potHeals[pid] || 150;
          player.hp = Math.min(player.maxHp, player.hp + heal);
          totalHealingDone += heal;
          if (typeof invItem.count === 'number') invItem.count--;
          else if (typeof invItem.qty === 'number') invItem.qty--;
          hpPotionsUsed++;
          lastHpPotTime = now;
          break;
        }
      }
    }

    if (player.mp < player.maxMp * autoMpThreshold && (now - lastMpPotTime) >= potionCooldownMs) {
      const mpPotIds = ['mp_potion_xl', 'mp_potion_l', 'mp_potion_m', 'mp_potion_s'];
      const potManas = { mp_potion_xl: 300, mp_potion_l: 180, mp_potion_m: 100, mp_potion_s: 50 };
      for (const pid of mpPotIds) {
        const invItem = player.inventory?.find(i => i.itemId === pid && (typeof i.count === 'number' ? i.count > 0 : (typeof i.qty === 'number' ? i.qty > 0 : true)));
        if (invItem) {
          const mana = potManas[pid] || 100;
          player.mp = Math.min(player.maxMp, player.mp + mana);
          if (typeof invItem.count === 'number') invItem.count--;
          else if (typeof invItem.qty === 'number') invItem.qty--;
          mpPotionsUsed++;
          lastMpPotTime = now;
          break;
        }
      }
    }

    // 3. AÇÃO DO JOGADOR
    let castedSkill = false;
    const playerSkills = player.skills || {};

    for (const [sId, lvl] of Object.entries(playerSkills)) {
      if (lvl <= 0) continue;
      const def = skills[sId] || player.skillDefs?.[sId];
      if (!def) continue;

      const isPassive = def.type === 'passive' || def.type === 'stat';
      if (isPassive) continue;

      const canCast = canCastSkill(player, def, now, cds);
      if (!canCast.canCast) continue;

      // Execução atômica
      const consumed = consumeSkillMp(player, def, now, cds);
      if (!consumed.success) continue;

      totalMpSpent += consumed.mpSpent;
      skillsUsed[sId] = (skillsUsed[sId] || 0) + 1;
      castedSkill = true;

      const isHeal = def.type === 'heal' || def.effect === 'heal' || sId.includes('heal') || sId.includes('curation');
      const isBuff = def.type === 'buff' || def.effect === 'warcry' || def.type === 'harmony';

      if (isHeal) {
        const healAmt = calculateHealAmount({
          maxHp: player.maxHp,
          matk: stats.matk || 0,
          skillLvl: lvl,
          pwr: def.pwr || 100
        });
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        totalHealingDone += healAmt;
      } else if (!isBuff) {
        // Habilidade ofensiva
        const isMage = (stats.matk || 0) > (stats.atk || 0);
        const pwrMult = (def.pwr !== undefined && def.pwr <= 50) ? (def.pwr / 10) : ((def.pwr || (def.gameplay?.damageMultiplier ? def.gameplay.damageMultiplier * 100 : 120)) / 100);
        const lvlScaling = 1 + 0.10 * (Math.max(1, lvl) - 1);
        const pwr = Math.round(pwrMult * lvlScaling * 100);
        const critRate = Math.min(50, stats.crit || 5);
        const isCrit = Math.random() < (critRate / 100);
        if (isCrit) criticalHits++;

        let dmg = isMage
          ? calculateMagicDamage({ matk: stats.matk, mdef: enemy.mdef || enemy.def || 50, pwr, isCrit, critDmgMult: stats.critDmg, applyVariance })
          : calculatePhysicalDamage({ atk: stats.atk, def: enemy.def || 50, pwr, isCrit, critDmgMult: stats.critDmg, applyVariance });

        enemy.hp -= dmg;
        totalDamageDealt += dmg;
        skillDamageDealt += dmg;

        const isVampiric = def.effect === 'vampiric' || def.effect === 'drain' || sId.includes('vampir') || sId.includes('drain') || sId.includes('siphon');
        if (isVampiric) {
          const vHeal = calculateVampiricHeal(dmg, player.maxHp, COMBAT_CONFIG.lifestealRatioDefault);
          player.hp = Math.min(player.maxHp, player.hp + vHeal);
          totalHealingDone += vHeal;
        }
      }
      break; // Conjurou 1 habilidade por tick
    }

    // Auto-ataque se nenhuma habilidade foi conjurada neste tick
    if (!castedSkill) {
      const atkInterval = Math.max(200, 1000 - (stats.atkSpd || 0) * 600);
      const atkTicks = Math.max(1, Math.round(atkInterval / tickRateMs));
      if (combatTick % atkTicks === 0) {
        const isMage = (stats.matk || 0) > (stats.atk || 0);
        const critRate = Math.min(50, stats.crit || 5);
        const isCrit = Math.random() < (critRate / 100);
        if (isCrit) criticalHits++;

        const dmg = isMage
          ? calculateMagicDamage({ matk: stats.matk, mdef: enemy.mdef || enemy.def || 50, pwr: 100, isCrit, critDmgMult: stats.critDmg, applyVariance })
          : calculatePhysicalDamage({ atk: stats.atk, def: enemy.def || 50, pwr: 100, isCrit, critDmgMult: stats.critDmg, applyVariance });

        enemy.hp -= dmg;
        totalDamageDealt += dmg;
        autoAttackDamageDealt += dmg;
      }
    }

    // 4. AÇÃO DO INIMIGO (se ainda tiver ações pendentes ou sofrer morte simultânea no mesmo tick)
    if (enemy.hp > 0 || (enemy.hp <= 0 && enemy._pendingTickAction)) {
      const enemyAtkInterval = Math.max(400, Math.round(1500 / (enemy.atkSpd || 1.0)));
      const enemyAtkTicks = Math.max(1, Math.round(enemyAtkInterval / tickRateMs));

      if (combatTick % enemyAtkTicks === 0) {
        // Mecânicas de Raid Boss
        const currentHpRatio = Math.max(0, enemy.hp) / enemy._maxHp;

        // Fase de Enrage (< 30% HP) conforme RaidService.js:233
        if (currentHpRatio <= 0.30 && !enemy._isEnraged && (enemy.boss || enemy.raid)) {
          enemy._isEnraged = true;
          enemy.atk = Math.floor((enemy.atk || 100) * 1.30);
          enemy.atkSpd = (enemy.atkSpd || 1.0) * 1.25;
        }

        // Mecânica Fatal com canalização telegrafada (fiel ao RaidService.js runtime)
        if (enemy.fatalSkill && Array.isArray(enemy.fatalSkill.triggerHps)) {
          for (const trig of enemy.fatalSkill.triggerHps) {
            const key = `fatal_${trig}`;
            if (currentHpRatio <= trig && !triggeredFatal.has(key) && !isChannelingFatal) {
              triggeredFatal.add(key);
              isChannelingFatal = true;
              const fatalDuration = enemy.fatalSkill.duration || 5000;
              fatalCastUntil = now + fatalDuration;
              fatalDmgPending = Math.floor(player.maxHp * (enemy.fatalSkill.damageHeroPercent || 0.35));
              break;
            }
          }
        }

        // Conclusão de canalização da Habilidade Fatal
        if (isChannelingFatal && now >= fatalCastUntil) {
          isChannelingFatal = false;
          // Chance de interrupção / stagger break pelo jogador
          const staggerInterrupted = (player.staggerPower || 0) > 40 || Math.random() < 0.20;
          if (!staggerInterrupted) {
            player.hp -= fatalDmgPending;
            totalDamageTaken += fatalDmgPending;
          }
        }

        // Outras mecânicas (cura / poison)
        if (Array.isArray(enemy.mechanics)) {
          for (let mIdx = 0; mIdx < enemy.mechanics.length; mIdx++) {
            const mech = enemy.mechanics[mIdx];
            const key = `mech_${mIdx}_${mech.triggerHp}`;
            if (currentHpRatio <= mech.triggerHp && !triggeredMechanics.has(key)) {
              triggeredMechanics.add(key);
              if (mech.healPercent) {
                enemy.hp = Math.min(enemy._maxHp, enemy.hp + Math.floor(enemy._maxHp * mech.healPercent));
              }
              if (mech.damagePercent) {
                const mechDmg = Math.floor(player.maxHp * mech.damagePercent);
                player.hp -= mechDmg;
                totalDamageTaken += mechDmg;
              }
            }
          }
        }

        // Ataque regular do inimigo (apenas se não estiver canalizando habilidade fatal)
        if (!isChannelingFatal) {
          const isEvaded = Math.random() < ((stats.eva || 10) / 100);
          if (!isEvaded) {
            const isEnemyMage = enemy.atkType === 'magical' || enemy.isMage === true;
            const enemyCritRate = Math.min(50, enemy.crit || 10);
            const isEnemyCrit = Math.random() < (enemyCritRate / 100);
            const eDmg = isEnemyMage
              ? calculateMagicDamage({ matk: enemy.matk || enemy.atk, mdef: stats.mdef || 20, pwr: 100, isCrit: isEnemyCrit, critDmgMult: 1.8, applyVariance })
              : calculatePhysicalDamage({ atk: enemy.atk, def: stats.def || 20, pwr: 100, isCrit: isEnemyCrit, critDmgMult: 1.8, applyVariance });

            player.hp -= eDmg;
            totalDamageTaken += eDmg;
          }
        }
      }
    }

    // 5. RESOLUÇÃO ATÔMICA DO TICK (Section 40: DRAW / WIN / LOSS)
    if (player.hp <= 0 && enemy.hp <= 0) {
      outcome = 'DRAW';
      winner = 'draw';
      break;
    } else if (player.hp <= 0) {
      outcome = 'LOSS';
      winner = 'enemy';
      ttd = now / 1000;
      break;
    } else if (enemy.hp <= 0) {
      outcome = 'WIN';
      winner = 'player';
      ttk = now / 1000;
      break;
    }
  }

  // 6. VERIFICA TIMEOUT (Section 39, 41)
  if (!outcome) {
    outcome = 'TIMEOUT';
    winner = 'timeout';
  }

  const durationSec = (combatTick * tickRateMs) / 1000;
  const skillContributionPct = totalDamageDealt > 0 ? Math.round((skillDamageDealt / totalDamageDealt) * 1000) / 10 : 0;

  // Cálculo canônico de PST & SM (Seções 30, 31, 32)
  const potHeals = { hp_potion_xl: 500, hp_potion_l: 300, hp_potion_m: 150, hp_potion_s: 100 };
  let totalPotionBudget = 0;
  if (Array.isArray(player.inventory)) {
    for (const item of player.inventory) {
      if (item.itemId && potHeals[item.itemId]) {
        const count = typeof item.count === 'number' ? item.count : (typeof item.qty === 'number' ? item.qty : 0);
        totalPotionBudget += count * potHeals[item.itemId];
      }
    }
  }
  const incomingDps = totalDamageTaken / Math.max(0.1, durationSec);
  const effectiveHpBudget = calculateEffectiveHpBudget(player.maxHp, totalHealingDone, totalPotionBudget);
  const pst = calculatePST(effectiveHpBudget, incomingDps);
  const scenarioTtk = ttk ?? durationSec;
  const survivalMargin = calculateSurvivalMargin(pst, scenarioTtk);

  return {
    outcome,
    winner,
    durationSec,
    ttk: ttk ?? (outcome === 'WIN' ? durationSec : null),
    ttd: ttd ?? (outcome === 'LOSS' ? durationSec : null),
    pst,
    survivalMargin,
    damageDealt: totalDamageDealt,
    autoAttackDamageDealt,
    skillDamageDealt,
    skillContributionPct,
    damageTaken: totalDamageTaken,
    healingDone: totalHealingDone,
    mpSpent: totalMpSpent,
    hpPotionsUsed,
    mpPotionsUsed,
    criticalHits,
    skillsUsed,
    playerFinalHp: Math.max(0, player.hp),
    playerFinalMp: Math.max(0, player.mp),
    enemyFinalHp: Math.max(0, enemy.hp)
  };
}

/**
 * Executa uma bateria de N simulações estatísticas para calcular win rate, médias de TTK/TTD e recursos.
 * @param {Object} options
 * @param {number} [options.runs=100] - Número de simulações
 * @returns {Object} Estatísticas agregadas
 */
export function simulateMany({
  player,
  enemy,
  skills = {},
  runs = 100,
  config = {}
}) {
  let playerWins = 0;
  let enemyWins = 0;
  let draws = 0;
  let timeouts = 0;

  const ttks = [];
  const ttds = [];
  const durations = [];
  let sumDamageDealt = 0;
  let sumAutoAttackDmg = 0;
  let sumSkillDmg = 0;
  let sumDamageTaken = 0;
  let sumHealingDone = 0;
  let sumHpPotions = 0;
  let sumMpPotions = 0;
  let sumMpSpent = 0;
  let sumCrits = 0;

  for (let i = 0; i < runs; i++) {
    const runPlayer = JSON.parse(JSON.stringify(player));
    const runEnemy = JSON.parse(JSON.stringify(enemy));
    const res = simulateCombat({ player: runPlayer, enemy: runEnemy, skills, config });

    if (res.outcome === 'WIN' || res.winner === 'player') {
      playerWins++;
      if (res.ttk !== null) ttks.push(res.ttk);
    } else if (res.outcome === 'LOSS' || res.winner === 'enemy') {
      enemyWins++;
      if (res.ttd !== null) ttds.push(res.ttd);
    } else if (res.outcome === 'DRAW' || res.winner === 'draw') {
      draws++;
    } else if (res.outcome === 'TIMEOUT' || res.winner === 'timeout') {
      timeouts++;
    }

    durations.push(res.durationSec);
    sumDamageDealt += res.damageDealt;
    sumAutoAttackDmg += res.autoAttackDamageDealt;
    sumSkillDmg += res.skillDamageDealt;
    sumDamageTaken += res.damageTaken;
    sumHealingDone += res.healingDone;
    sumHpPotions += res.hpPotionsUsed;
    sumMpPotions += res.mpPotionsUsed;
    sumMpSpent += res.mpSpent;
    sumCrits += res.criticalHits;
  }

  const avg = (arr) => arr.length ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10 : 0;
  const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.floor(sorted.length * p));
    return sorted[idx];
  };

  const meanTTK = avg(ttks);
  const medianTTK = percentile(ttks, 0.5);
  const p95TTK = percentile(ttks, 0.95);
  const meanTTD = avg(ttds);
  const p5TTD = percentile(ttds, 0.05);
  const avgDuration = avg(durations);

  const totalDmg = sumAutoAttackDmg + sumSkillDmg;
  const skillContributionPct = totalDmg > 0 ? Math.round((sumSkillDmg / totalDmg) * 1000) / 10 : 0;

  // Taxas canônicas
  const rates = calculateCombatRates(playerWins, enemyWins, draws, timeouts, runs);

  // PST & Survival Margin Canônicos (Seções 30, 31, 32)
  const potHeals = { hp_potion_xl: 500, hp_potion_l: 300, hp_potion_m: 150, hp_potion_s: 100 };
  let totalPotionBudget = 0;
  if (Array.isArray(player.inventory)) {
    for (const item of player.inventory) {
      if (item.itemId && potHeals[item.itemId]) {
        const count = typeof item.count === 'number' ? item.count : (typeof item.qty === 'number' ? item.qty : 0);
        totalPotionBudget += count * potHeals[item.itemId];
      }
    }
  }
  const incomingDps = (sumDamageTaken / runs) / Math.max(0.1, avgDuration);
  const avgSkillHealing = Math.max(0, (sumHealingDone / runs) - (sumHpPotions / runs) * 200);
  const effectiveHpBudget = calculateEffectiveHpBudget(player.maxHp || 1000, avgSkillHealing, totalPotionBudget);
  const pst = calculatePST(effectiveHpBudget, incomingDps);
  const baselineTtk = medianTTK > 0 ? medianTTK : (meanTTD > 0 ? meanTTD : avgDuration);
  const survivalMargin = calculateSurvivalMargin(pst, baselineTtk);

  // Potion usage %
  const initialPotionStock = player.inventory?.reduce((acc, it) => {
    if (it.itemId?.startsWith('hp_potion')) return acc + (it.count || it.qty || 0);
    return acc;
  }, 0) || 25;
  const avgHpPotionsUsed = Math.round((sumHpPotions / runs) * 10) / 10;
  const potionUsage = initialPotionStock > 0 ? Math.round((avgHpPotionsUsed / initialPotionStock) * 1000) / 10 : 0;
  const resourcePressure = classifyResourcePressure(potionUsage);

  return {
    runs,
    wins: playerWins,
    playerWins,
    losses: enemyWins,
    enemyWins,
    deaths: enemyWins,
    draws,
    timeouts,
    winRate: rates.winRate,
    lossRate: rates.lossRate,
    drawRate: rates.drawRate,
    timeoutRate: rates.timeoutRate,
    isConsistent: rates.isConsistent,
    avgDurationSec: avgDuration,
    avgTTK: meanTTK,
    meanTTK,
    medianTTK,
    minTTK: ttks.length ? Math.min(...ttks) : 0,
    maxTTK: ttks.length ? Math.max(...ttks) : 0,
    p95TTK,
    avgTTD: meanTTD,
    meanTTD,
    p5TTD,
    pst,
    survivalMargin,
    potionUsage,
    resourcePressure,
    avgDamageDealt: Math.round(sumDamageDealt / runs),
    autoAttackDamageDealt: Math.round(sumAutoAttackDmg / runs),
    skillDamageDealt: Math.round(sumSkillDmg / runs),
    skillContributionPct,
    avgDamageTaken: Math.round(sumDamageTaken / runs),
    avgHpPotionsUsed,
    avgMpPotionsUsed: Math.round((sumMpPotions / runs) * 10) / 10,
    avgMpSpent: Math.round(sumMpSpent / runs),
    avgCrits: Math.round((sumCrits / runs) * 10) / 10
  };
}
