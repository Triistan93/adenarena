/**
 * skillBalance.js — Balanceamento e Validação Atômica de Habilidades do Lineage Idle.
 *
 * Responsável por:
 * 1. Mapeamento de custos de MP padronizados por Tier e Categoria.
 * 2. Validação atômica de MP antes do cast (validate -> consume -> execute).
 * 3. Prevenção estrita de MP negativo e consumo duplicado.
 * 4. Multiplicadores de dano e status effects por papel tático.
 */

export const SKILL_TIER_MP_COSTS = {
  0: { default: 8,  min: 5,  max: 12 },  // Foundation (Lv. 1-19)
  1: { default: 16, min: 10, max: 25 },  // Discipline (Lv. 20-39)
  2: { default: 32, min: 20, max: 45 },  // Mastery (Lv. 40-75)
  3: { default: 60, min: 40, max: 80 },  // Ascendancy 1-3★ (Lv. 76-79)
  4: { default: 95, min: 65, max: 140 }, // Legend 4★ Ultimate (Lv. 80+)
  5: { default: 130, min: 90, max: 180 } // Master Ultimate 5★ (Lv. 90+)
};

export const ROLE_MODIFIERS = {
  burst:    { dmgMult: 1.40, staggerMult: 1.25, cdMin: 4000 },
  damage:   { dmgMult: 1.20, staggerMult: 1.10, cdMin: 3000 },
  area:     { dmgMult: 1.10, staggerMult: 1.30, cdMin: 6000 },
  finisher: { dmgMult: 1.65, staggerMult: 1.50, cdMin: 8000 },
  mobility: { dmgMult: 1.05, staggerMult: 0.90, cdMin: 4000 },
  control:  { dmgMult: 0.90, staggerMult: 1.80, cdMin: 7000 },
  tank:     { dmgMult: 0.85, staggerMult: 1.40, cdMin: 5000 },
  buff:     { dmgMult: 0.00, staggerMult: 0.00, cdMin: 30000 },
  heal:     { dmgMult: 0.00, staggerMult: 0.00, cdMin: 6000 },
  debuff:   { dmgMult: 0.80, staggerMult: 1.10, cdMin: 8000 }
};

/**
 * Retorna o custo de MP normalizado de uma habilidade.
 * Prioriza gameplay.mpCost da definição canônica, fallback para tier.
 * @param {Object} def - Definição da habilidade
 * @returns {number}
 */
export function getSkillMpCost(def) {
  if (!def) return 0;
  if (def.type === 'passive' || def.type === 'stat') return 0;

  // 1. Custo explícito da gameplay canonical
  if (typeof def.gameplay?.mpCost === 'number' && def.gameplay.mpCost > 0) {
    return def.gameplay.mpCost;
  }
  if (typeof def.mpCost === 'number' && def.mpCost > 0) {
    return def.mpCost;
  }

  // 2. Fallback baseado no Tier
  const tier = Number(def.tier) || (def.isUltimate ? 4 : (def.starRank >= 4 ? 4 : 0));
  const tierConfig = SKILL_TIER_MP_COSTS[tier] || SKILL_TIER_MP_COSTS[0];
  return tierConfig.default;
}

/**
 * Validação atômica: verifica se o herói pode conjurar a habilidade.
 * @param {Object} character - Estado do jogador (precisa conter mp, level)
 * @param {Object} def - Definição da habilidade
 * @param {number} [now] - Timestamp atual para verificar cooldown
 * @param {Object} [cds] - Mapa de cooldowns ativos
 * @returns {{ canCast: boolean, reason?: string, mpCost: number }}
 */
export function canCastSkill(character, def, now = Date.now(), cds = {}) {
  if (!character || !def) {
    return { canCast: false, reason: 'Entidade ou habilidade inválida.', mpCost: 0 };
  }

  const isPassive = def.type === 'passive' || def.type === 'stat';
  if (isPassive) {
    return { canCast: false, reason: 'Habilidade passiva não pode ser conjurada ativamente.', mpCost: 0 };
  }

  // 1. Verificação de Cooldown
  const cd = (def.baseCd || def.gameplay?.cooldown || 5000) * (1 - (character.stats?.cdr || character.cdr || 0));
  const lastCast = cds[def.id];
  if (lastCast !== undefined && (now - lastCast < cd)) {
    return { canCast: false, reason: 'Habilidade em recarga (cooldown ativo).', mpCost: 0 };
  }

  // 2. Verificação de Custo de MP
  const mpCost = getSkillMpCost(def);
  const currentMp = Number(character.mp) || 0;
  if (currentMp < mpCost) {
    return { canCast: false, reason: `MP insuficiente (${mpCost} necessário, atual: ${currentMp}).`, mpCost };
  }

  return { canCast: true, mpCost };
}

/**
 * Executa o consumo atômico de MP da habilidade.
 * Garante que o MP nunca fique negativo e registra o timestamp de recarga.
 * @param {Object} character - Estado mutável do jogador
 * @param {Object} def - Definição da habilidade
 * @param {number} [now] - Timestamp do cast
 * @param {Object} [cds] - Mapa mutável de cooldowns
 * @returns {{ success: boolean, mpSpent: number, remainingMp: number }}
 */
export function consumeSkillMp(character, def, now = Date.now(), cds = null) {
  const check = canCastSkill(character, def, now, cds || character._cds || {});
  if (!check.canCast) {
    return { success: false, mpSpent: 0, remainingMp: Number(character.mp) || 0 };
  }

  const cost = check.mpCost;
  character.mp = Math.max(0, (Number(character.mp) || 0) - cost);

  if (cds) {
    cds[def.id] = now;
  } else if (character._cds) {
    character._cds[def.id] = now;
  }

  return { success: true, mpSpent: cost, remainingMp: character.mp };
}
