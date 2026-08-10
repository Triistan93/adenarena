/**
 * FormulaEngine.js — Fórmulas de Dano, Defesa e Combate do Lineage Idle.
 *
 * Centraliza as fórmulas de combate (físico, mágico, redução de dano por defesa,
 * cálculo de crítico e variância de dano).
 */

/**
 * Aplica redução de dano baseada na DEF ou MDEF do defensor.
 * @param {number} rawDmg — Dano bruto antes da defesa
 * @param {number} def    — Valor de defesa do alvo
 * @returns {number} Dano líquido (mínimo 1)
 */
export function calcDefenseReduction(rawDmg, def) {
  // Fórmula clássica L2 Idle: Redução mitigada proporcional
  const reduction = def > 0 ? (def / (def + 100)) : 0;
  const netDmg = rawDmg * (1 - reduction * 0.5);
  return Math.max(1, Math.floor(netDmg));
}

/**
 * Calcula dano físico básico.
 * @param {number} atk       — P.Atk do atacante
 * @param {number} def       — P.Def do defensor
 * @param {number} [pwr=100] — Poder da skill (%)
 * @param {boolean} [isCrit=false] — Se foi acerto crítico
 * @param {number} [critDmgMult=2.0] — Multiplicador de dano crítico
 * @returns {number}
 */
export function calcPhysicalDamage(atk, def, pwr = 100, isCrit = false, critDmgMult = 2.0) {
  let dmg = (atk * (pwr / 100)) - (def * 0.4);
  if (dmg < 1) dmg = 1;
  if (isCrit) dmg *= critDmgMult;

  // Variância randômica de ±5%
  const variance = 0.95 + Math.random() * 0.10;
  return Math.max(1, Math.floor(dmg * variance));
}

/**
 * Calcula dano mágico básico.
 * @param {number} matk      — M.Atk do atacante
 * @param {number} mdef      — M.Def do defensor
 * @param {number} [pwr=100] — Poder da magia (%)
 * @returns {number}
 */
export function calcMagicDamage(matk, mdef, pwr = 100) {
  let dmg = (matk * (pwr / 100)) - (mdef * 0.3);
  if (dmg < 1) dmg = 1;

  const variance = 0.95 + Math.random() * 0.10;
  return Math.max(1, Math.floor(dmg * variance));
}

/**
 * Determina se um ataque resulta em Acerto Crítico.
 * @param {number} critRate — Taxa de crítico (%)
 * @returns {boolean}
 */
export function checkCrit(critRate) {
  const chance = Math.min(80, Math.max(1, critRate || 5)) / 100;
  return Math.random() < chance;
}

/**
 * Determina se o alvo esquivou do ataque.
 * @param {number} accuracy — Precisão do atacante
 * @param {number} evasion  — Evasão do defensor
 * @returns {boolean} True se esquivou
 */
export function checkEvasion(accuracy, evasion) {
  if (!evasion || evasion <= 0) return false;
  const diff = evasion - (accuracy || 0);
  if (diff <= 0) return false;
  const dodgeChance = Math.min(0.50, diff * 0.015);
  return Math.random() < dodgeChance;
}
