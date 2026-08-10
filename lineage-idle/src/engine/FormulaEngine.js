/**
 * FormulaEngine.js ÔÇö F├│rmulas de Dano, Defesa e Combate do Lineage Idle.
 *
 * Centraliza as f├│rmulas de combate (f├¡sico, m├ígico, redu├º├úo de dano por defesa,
 * c├ílculo de cr├¡tico e vari├óncia de dano).
 */

/**
 * Aplica redu├º├úo de dano baseada na DEF ou MDEF do defensor.
 * @param {number} rawDmg ÔÇö Dano bruto antes da defesa
 * @param {number} def    ÔÇö Valor de defesa do alvo
 * @returns {number} Dano l├¡quido (m├¡nimo 1)
 */
export function calcDefenseReduction(rawDmg, def) {
  // F├│rmula cl├íssica L2 Idle: Redu├º├úo mitigada proporcional
  const reduction = def > 0 ? (def / (def + 100)) : 0;
  const netDmg = rawDmg * (1 - reduction * 0.5);
  return Math.max(1, Math.floor(netDmg));
}

/**
 * Calcula dano f├¡sico b├ísico.
 * @param {number} atk       ÔÇö P.Atk do atacante
 * @param {number} def       ÔÇö P.Def do defensor
 * @param {number} [pwr=100] ÔÇö Poder da skill (%)
 * @param {boolean} [isCrit=false] ÔÇö Se foi acerto cr├¡tico
 * @param {number} [critDmgMult=2.0] ÔÇö Multiplicador de dano cr├¡tico
 * @returns {number}
 */
export function calcPhysicalDamage(atk, def, pwr = 100, isCrit = false, critDmgMult = 2.0) {
  let dmg = (atk * (pwr / 100)) - (def * 0.4);
  if (dmg < 1) dmg = 1;
  if (isCrit) dmg *= critDmgMult;

  // Vari├óncia rand├┤mica de ┬▒5%
  const variance = 0.95 + Math.random() * 0.10;
  return Math.max(1, Math.floor(dmg * variance));
}

/**
 * Calcula dano m├ígico b├ísico.
 * @param {number} matk      ÔÇö M.Atk do atacante
 * @param {number} mdef      ÔÇö M.Def do defensor
 * @param {number} [pwr=100] ÔÇö Poder da magia (%)
 * @returns {number}
 */
export function calcMagicDamage(matk, mdef, pwr = 100) {
  let dmg = (matk * (pwr / 100)) - (mdef * 0.3);
  if (dmg < 1) dmg = 1;

  const variance = 0.95 + Math.random() * 0.10;
  return Math.max(1, Math.floor(dmg * variance));
}

/**
 * Determina se um ataque resulta em Acerto Cr├¡tico.
 * @param {number} critRate ÔÇö Taxa de cr├¡tico (%)
 * @returns {boolean}
 */
export function checkCrit(critRate) {
  const chance = Math.min(80, Math.max(1, critRate || 5)) / 100;
  return Math.random() < chance;
}

/**
 * Determina se o alvo esquivou do ataque.
 * @param {number} accuracy ÔÇö Precis├úo do atacante
 * @param {number} evasion  ÔÇö Evas├úo do defensor
 * @returns {boolean} True se esquivou
 */
export function checkEvasion(accuracy, evasion) {
  if (!evasion || evasion <= 0) return false;
  const diff = evasion - (accuracy || 0);
  if (diff <= 0) return false;
  const dodgeChance = Math.min(0.50, diff * 0.015);
  return Math.random() < dodgeChance;
}