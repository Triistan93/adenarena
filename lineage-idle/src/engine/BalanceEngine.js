/**
 * BalanceEngine.js — Motor Central de Balanceamento, Fórmulas de Combate e Penalidade de Grau.
 *
 * Responsável por:
 *  1. Verificação de Penalidade de Grau (Grade Penalty) por nível de personagem.
 *  2. Fórmulas unificadas de Dano Físico e Mágico com escalamento proporcional.
 *  3. Multiplicadores de Zonas por Grau (No-Grade até S-Grade / Ultimate).
 *  4. Sistema de Monstros Campeões (Azul e Vermelho).
 */

export const GRADE_REQUIREMENTS = {
  ng: 1,
  nograde: 1,
  none: 1,
  d: 20,
  c: 40,
  b: 52,
  a: 62,
  s: 62,
  special: 80,
  boss: 80,
  frostlord: 85,
  frost: 85
};

export const ZONE_GRADE_MULTIPLIERS = {
  ng:       { hp: 1.0,  atk: 1.0,  def: 1.0,  xp: 1.0,  gold: 1.0,  grade: 'NG' },
  d:        { hp: 2.5,  atk: 1.8,  def: 1.8,  xp: 2.0,  gold: 2.2,  grade: 'D' },
  c:        { hp: 5.5,  atk: 3.2,  def: 3.0,  xp: 4.0,  gold: 4.5,  grade: 'C' },
  b:        { hp: 12.0, atk: 6.0,  def: 5.5,  xp: 8.0,  gold: 9.0,  grade: 'B' },
  a:        { hp: 28.0, atk: 12.0, def: 11.0, xp: 16.0, gold: 18.0, grade: 'A' },
  s:        { hp: 65.0, atk: 25.0, def: 22.0, xp: 35.0, gold: 40.0, grade: 'S' },
  frost:    { hp: 120.0,atk: 45.0, def: 40.0, xp: 75.0, gold: 80.0, grade: 'Frost' }
};

/**
 * Identifica o Grau exato de um item de acordo com suas propriedades e descrição.
 * @param {Object} itemDef
 * @returns {string} — 'ng', 'd', 'c', 'b', 'a', 's', 'boss', 'frostlord'
 */
export function getItemGrade(itemDef) {
  if (!itemDef) return 'ng';

  // 1. Grau explícito
  const explicitGrade = String(itemDef.grade || itemDef.tierGrade || '').toLowerCase();
  if (explicitGrade === 'none' || explicitGrade === 'no grade' || explicitGrade === 'nograde' || explicitGrade === 'ng') return 'ng';
  if (explicitGrade === 'd') return 'd';
  if (explicitGrade === 'c') return 'c';
  if (explicitGrade === 'b') return 'b';
  if (explicitGrade === 'a') return 'a';
  if (explicitGrade === 's') return 's';
  if (explicitGrade === 'boss' || explicitGrade === 'special') return 'boss';
  if (explicitGrade === 'frostlord' || explicitGrade === 'frost') return 'frostlord';

  // 2. Inspecção por descrição e ícone
  const desc = String(itemDef.desc || itemDef.info || itemDef.name || '').toLowerCase();
  const icon = String(itemDef.icon || '').toLowerCase();

  if (desc.includes('no grade') || desc.includes('(no grade)') || icon.includes('nograde/')) return 'ng';
  if (desc.includes('frost lord') || icon.includes('frost_lord')) return 'frostlord';
  if (desc.includes('(special') || desc.includes('(boss') || icon.includes('gradespecial/')) return 'boss';
  if (desc.includes('(s grade)') || icon.includes('grades/')) return 's';
  if (desc.includes('(a grade)') || icon.includes('gradea/')) return 'a';
  if (desc.includes('(b grade)') || icon.includes('gradeb/')) return 'b';
  if (desc.includes('(c grade)') || icon.includes('gradec/')) return 'c';
  if (desc.includes('(d grade)') || icon.includes('graded/')) return 'd';

  // 3. Fallback baseado em Tier e Nível Requerido:
  // Tier 1 = No Grade (Lv 1-19)
  // Tier 2 = D Grade (Lv 20-39)
  // Tier 3 = C Grade (Lv 40-51)
  // Tier 4 = B Grade (Lv 52-61)
  // Tier 5 = S Grade (Lv 62-79)
  // Tier 6 = Special / Boss / Frost Lord (Lv 80+)
  const tier = Number(itemDef.tier) || 0;
  const reqLvl = Number(itemDef.req?.level || itemDef.reqLvl || 0);

  if (tier === 1 || reqLvl < 20) return 'ng';
  if (tier === 2 || (reqLvl >= 20 && reqLvl < 40)) return 'd';
  if (tier === 3 || (reqLvl >= 40 && reqLvl < 52)) return 'c';
  if (tier === 4 || (reqLvl >= 52 && reqLvl < 62)) return 'b';
  if (reqLvl >= 80 && reqLvl < 85) return 'boss';
  if (tier >= 6 || reqLvl >= 85) return 'frostlord';
  if (tier === 5 || reqLvl >= 62) return 's';

  return 'ng';
}

/**
 * Verifica se o jogador sofre Penalidade de Grau pelo equipamento equipado.
 * @param {number} playerLevel
 * @param {string|Object} itemOrGrade — 'ng', 'd', 'c', 'b', 's', 'boss', 'frostlord' ou itemDef
 * @returns {{ hasPenalty: boolean, reason?: string, minLvl?: number }}
 */
export function checkGradePenalty(playerLevel, itemOrGrade) {
  let gradeKey = 'ng';
  if (typeof itemOrGrade === 'object' && itemOrGrade !== null) {
    if (itemOrGrade.isHeirloom || itemOrGrade.id?.includes('heirloom') || itemOrGrade.itemId?.includes('heirloom')) {
      return { hasPenalty: false };
    }
    gradeKey = getItemGrade(itemOrGrade);
  } else {
    gradeKey = String(itemOrGrade || 'ng').toLowerCase();
  }

  if (gradeKey === 'ng' || gradeKey === 'nograde' || gradeKey === 'none' || gradeKey === 'heirloom') return { hasPenalty: false };

  const minLvl = GRADE_REQUIREMENTS[gradeKey] || 1;
  if ((playerLevel || 1) < minLvl) {
    return {
      hasPenalty: true,
      minLvl,
      reason: `Exige Nível ${minLvl} para utilizar sem penalidades (-25% Atk.Spd, -35% Acc, +50% MP)`
    };
  }
  return { hasPenalty: false };
}

/**
 * Calcula a Penalidade Total acumulada de todos os equipamentos.
 * @param {Object} state
 * @returns {{ totalPenalties: number, hasAnyPenalty: boolean, penaltyMultiplier: number }}
 */
export function getPlayerTotalGradePenalty(state) {
  if (!state || !state.equipment) return { totalPenalties: 0, hasAnyPenalty: false, penaltyMultiplier: 1.0 };
  
  const allItems = (typeof window !== 'undefined' && window.GameData) ? window.GameData.ALL_ITEMS : {};
  let count = 0;

  for (const slotKey of Object.keys(state.equipment)) {
    const itemUid = state.equipment[slotKey];
    if (!itemUid) continue;
    const invItem = state.inventory?.find(i => i.uid === itemUid);
    if (!invItem) continue;
    const itemDef = allItems[invItem.itemId];
    if (!itemDef) continue;
    const check = checkGradePenalty(state.level || 1, itemDef);
    if (check.hasPenalty) {
      count++;
    }
  }

  const hasAnyPenalty = count > 0;
  // Cada item com penalidade reduz a eficiência geral em 15%
  const penaltyMultiplier = Math.max(0.35, 1.0 - (count * 0.15));

  return { totalPenalties: count, hasAnyPenalty, penaltyMultiplier };
}

/**
 * Calcula o dano físico com base no P.Atk, Skill Power, P.Def do alvo e Crítico.
 */
export function calcPhysicalDamage(pAtk, skillPwr, targetPDef, isCrit = false, elementMult = 1.0) {
  const baseAtk = Math.max(1, pAtk || 1);
  const pwr = skillPwr > 0 ? (skillPwr / 10) : 1.0;
  const def = Math.max(1, targetPDef || 1);
  const crit = isCrit ? 2.0 : 1.0;
  
  const rawDmg = (baseAtk * pwr / def) * 70 * crit * elementMult;
  return Math.max(1, Math.floor(rawDmg));
}

/**
 * Calcula o dano mágico com base no M.Atk, Skill Power, M.Def do alvo.
 */
export function calcMagicDamage(mAtk, skillPwr, targetMDef, isCrit = false, elementMult = 1.0) {
  const baseMAtk = Math.max(1, mAtk || 1);
  const pwr = skillPwr > 0 ? (skillPwr / 10) : 1.0;
  const def = Math.max(1, targetMDef || 1);
  const crit = isCrit ? 1.5 : 1.0;

  const rawDmg = Math.sqrt(baseMAtk) * (pwr * 10 / def) * 80 * crit * elementMult;
  return Math.max(1, Math.floor(rawDmg));
}

/**
 * Sorteia a aparição de Monstros Campeões (Azul ou Vermelho).
 * @returns {{ type: string, hpMult: number, atkMult: number, xpMult: number, goldMult: number, color: string }|null}
 */
export function rollChampionMonster() {
  const rand = Math.random() * 100;
  if (rand <= 2.0) {
    // Campeão Vermelho (2%)
    return {
      type: 'red',
      namePrefix: '🔴 Campeão Vermelho',
      hpMult: 8.0,
      atkMult: 2.2,
      xpMult: 10.0,
      goldMult: 10.0,
      color: '#ef4444'
    };
  } else if (rand <= 7.0) {
    // Campeão Azul (5%)
    return {
      type: 'blue',
      namePrefix: '🔵 Campeão Azul',
      hpMult: 4.0,
      atkMult: 1.5,
      xpMult: 5.0,
      goldMult: 5.0,
      color: '#3b82f6'
    };
  }
  return null;
}

if (typeof window !== 'undefined') {
  window.BalanceEngine = {
    GRADE_REQUIREMENTS,
    ZONE_GRADE_MULTIPLIERS,
    getItemGrade,
    checkGradePenalty,
    getPlayerTotalGradePenalty,
    calcPhysicalDamage,
    calcMagicDamage,
    rollChampionMonster
  };
}
