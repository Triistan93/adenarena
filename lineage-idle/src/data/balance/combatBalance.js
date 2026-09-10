/**
 * combatBalance.js — Configurações e Fórmulas Centrais de Combate do Lineage Idle.
 *
 * Centraliza parâmetros de dano físico, mágico, mitigação de armadura,
 * críticos, variância, cura e cooldowns de consumíveis.
 * Totalmente data-driven e desacoplado de DOM/UI.
 */

export const COMBAT_CONFIG = {
  // Coeficientes base de ataque
  physicalBaseCoefficient: 70,
  magicBaseCoefficient: 80,

  // Constantes de mitigação de defesa (Curva: Dano = Raw * DefConstant / (Def + DefConstant))
  // Com constante 250, 100 DEF reduz ~28%, 250 DEF reduz 50%, 500 DEF reduz 66%.
  // Elimina o estrangulamento da fórmula antiga de 50/(DEF+50) que anulava todo o dano.
  physicalDefenseConstant: 250,
  magicDefenseConstant: 220,

  // Multiplicadores de acerto crítico
  critMultiplierPhysical: 2.0,
  critMultiplierMagic: 1.5,

  // Variância de dano (±5%)
  varianceMin: 0.95,
  varianceMax: 1.05,

  // Dano mínimo absoluto (evita 0 ou valores negativos)
  minimumDamage: 1,

  // Cooldown de poções de combate (GCD de sustain em milissegundos)
  potionCooldownMs: 1500,

  // Sustentação Vampírica (Life Drain / Lifesteal)
  lifestealRatioDefault: 0.20,             // 20% do dano revertido em cura (em vez de 40% desenfreado)
  lifestealMaxPercentOfMaxHp: 0.30,        // Máximo de 30% do Max HP recuperado por golpe vampírico

  // Fórmulas de Cura
  healBaseHpPercent: 0.15,                 // 15% do Max HP como base de cura
  healMatkPowerScaling: 4.5,               // Escalonamento por raiz quadrada do M.Atk
  healSkillLevelBonus: 0.05                // +5% por nível de habilidade investido
};

/**
 * Calcula a redução de dano proporcionada pela defesa.
 * @param {number} rawDmg 
 * @param {number} def 
 * @param {boolean} [isMagic=false]
 * @returns {number} Dano mitigado
 */
export function calculateDefenseMitigation(rawDmg, def, isMagic = false) {
  const k = isMagic ? COMBAT_CONFIG.magicDefenseConstant : COMBAT_CONFIG.physicalDefenseConstant;
  const safeDef = Math.max(0, Number(def) || 0);
  const factor = k / (safeDef + k);
  return Math.max(COMBAT_CONFIG.minimumDamage, Math.floor(rawDmg * factor));
}

/**
 * Calcula o dano físico com base em P.Atk, Skill Power, P.Def do defensor e Crítico.
 * @param {Object} params
 * @param {number} params.atk - P.Atk do atacante
 * @param {number} params.def - P.Def do defensor
 * @param {number} [params.pwr=100] - Poder da skill (100 = 100% dano base)
 * @param {boolean} [params.isCrit=false] - Se foi golpe crítico
 * @param {number} [params.critDmgMult] - Multiplicador de dano crítico do atacante (ex: 2.0)
 * @param {number} [params.elementMult=1.0] - Multiplicador elemental (ex: 1.0 a 1.5)
 * @param {boolean} [params.applyVariance=true] - Se aplica variância aleatória
 * @returns {number}
 */
export function calculatePhysicalDamage({
  atk = 10,
  def = 10,
  pwr = 100,
  isCrit = false,
  critDmgMult = COMBAT_CONFIG.critMultiplierPhysical,
  elementMult = 1.0,
  applyVariance = true
} = {}) {
  const safeAtk = Math.max(1, Number(atk) || 1);
  const safeDef = Math.max(0, Number(def) || 0);
  const skillMult = Math.max(0.1, (Number(pwr) || 100) / 100);
  const crit = isCrit ? Math.max(1.0, Number(critDmgMult) || COMBAT_CONFIG.critMultiplierPhysical) : 1.0;
  const elem = Math.max(0.2, Number(elementMult) || 1.0);

  // Dano bruto
  const rawDmg = safeAtk * skillMult * crit * elem;

  // Mitigação por P.Def
  let netDmg = calculateDefenseMitigation(rawDmg, safeDef, false);

  if (applyVariance) {
    const variance = COMBAT_CONFIG.varianceMin + Math.random() * (COMBAT_CONFIG.varianceMax - COMBAT_CONFIG.varianceMin);
    netDmg = Math.floor(netDmg * variance);
  }

  return Math.max(COMBAT_CONFIG.minimumDamage, netDmg);
}

/**
 * Calcula o dano mágico com base em M.Atk, Skill Power, M.Def do defensor e Crítico Mágico.
 * @param {Object} params
 * @param {number} params.matk - M.Atk do atacante
 * @param {number} params.mdef - M.Def do defensor
 * @param {number} [params.pwr=100] - Poder da magia
 * @param {boolean} [params.isCrit=false] - Se foi crítico mágico
 * @param {number} [params.critDmgMult] - Multiplicador de dano crítico mágico
 * @param {number} [params.elementMult=1.0] - Multiplicador elemental
 * @param {boolean} [params.applyVariance=true]
 * @returns {number}
 */
export function calculateMagicDamage({
  matk = 10,
  mdef = 10,
  pwr = 100,
  isCrit = false,
  critDmgMult = COMBAT_CONFIG.critMultiplierMagic,
  elementMult = 1.0,
  applyVariance = true
} = {}) {
  const safeMatk = Math.max(1, Number(matk) || 1);
  const safeMdef = Math.max(0, Number(mdef) || 0);
  const skillMult = Math.max(0.1, (Number(pwr) || 100) / 100);
  const crit = isCrit ? Math.max(1.0, Number(critDmgMult) || COMBAT_CONFIG.critMultiplierMagic) : 1.0;
  const elem = Math.max(0.2, Number(elementMult) || 1.0);

  // Escalonamento de dano mágico baseado na raiz quadrada clássica de Lineage 2 ponderada
  const rawDmg = (safeMatk * 0.5 + Math.sqrt(safeMatk) * 20) * skillMult * crit * elem;

  let netDmg = calculateDefenseMitigation(rawDmg, safeMdef, true);

  if (applyVariance) {
    const variance = COMBAT_CONFIG.varianceMin + Math.random() * (COMBAT_CONFIG.varianceMax - COMBAT_CONFIG.varianceMin);
    netDmg = Math.floor(netDmg * variance);
  }

  return Math.max(COMBAT_CONFIG.minimumDamage, netDmg);
}

/**
 * Calcula a quantidade de cura de uma habilidade, combinando Max HP do alvo e M.Atk do curandeiro.
 * @param {Object} params
 * @param {number} params.maxHp - Max HP do alvo
 * @param {number} [params.matk=0] - M.Atk do conjurador
 * @param {number} [params.skillLvl=1] - Nível da habilidade
 * @param {number} [params.pwr=100] - Poder base da cura
 * @returns {number} Cura calculada
 */
export function calculateHealAmount({
  maxHp = 100,
  matk = 0,
  skillLvl = 1,
  pwr = 100
} = {}) {
  const safeMaxHp = Math.max(1, Number(maxHp) || 100);
  const safeMatk = Math.max(0, Number(matk) || 0);
  const lvl = Math.max(1, Number(skillLvl) || 1);
  const pwrFactor = Math.max(0.5, (Number(pwr) || 100) / 100);

  // Componente 1: Porcentagem de Max HP (15% base + 5% por nível)
  const hpComponent = safeMaxHp * (COMBAT_CONFIG.healBaseHpPercent + (lvl - 1) * COMBAT_CONFIG.healSkillLevelBonus);

  // Componente 2: Escalonamento com M.Atk do conjurador (permite healers se beneficiarem de cajados e sets)
  const matkComponent = Math.sqrt(safeMatk) * COMBAT_CONFIG.healMatkPowerScaling * (1 + (lvl - 1) * 0.10);

  const totalHeal = (hpComponent + matkComponent) * pwrFactor;
  return Math.max(1, Math.floor(totalHeal));
}

/**
 * Calcula a cura vampírica recebida a partir de dano causado.
 * @param {number} damageDealt - Dano causado ao inimigo
 * @param {number} maxHp - HP máximo do atacante para limitar over-sustain
 * @param {number} [ratio] - Proporção de lifesteal (padrão 20%)
 * @returns {number}
 */
export function calculateVampiricHeal(damageDealt, maxHp, ratio = COMBAT_CONFIG.lifestealRatioDefault) {
  const safeDmg = Math.max(0, Number(damageDealt) || 0);
  const safeMaxHp = Math.max(1, Number(maxHp) || 100);
  const rawHeal = safeDmg * Math.max(0.01, Math.min(1.0, Number(ratio) || COMBAT_CONFIG.lifestealRatioDefault));
  const maxAllowedHeal = safeMaxHp * COMBAT_CONFIG.lifestealMaxPercentOfMaxHp;
  return Math.max(1, Math.floor(Math.min(rawHeal, maxAllowedHeal)));
}
