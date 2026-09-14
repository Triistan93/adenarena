/**
 * Balanceamento da economia de pesca - Aden Arena Idle
 * Regra principal: renda da pesca <= 60% da renda de combate no mesmo nível
 */

export const FISHING_BALANCE = {
  // --- Temporização ---
  MANUAL_CAST_TIME_MS: 5000,        // 5s por arremesso manual
  AUTO_FISH_INTERVAL_MS: 8000,      // 8s por ciclo de pesca automática
  OFFLINE_FISH_INTERVAL_MS: 15000,  // 15s efetivos por peixe offline
  OFFLINE_MAX_MINUTES: 480,         // 8h máximo offline (igual ao combate)
  OFFLINE_EFFICIENCY: 0.25,         // 25% da taxa online (combate é 30%)

  // --- Taxas de Captura ---
  BASE_CATCH_CHANCE: 0.70,          // 70% de chance base de captura
  MISS_PENALTY_CHANCE: 0.05,        // 5% de chance de perder a isca ao errar
  PERFECT_CATCH_BONUS: 1.5,         // 50% mais XP com tempo perfeito
  
  // --- Pesos de Raridade ---
  RARITY_WEIGHTS: {
    common: 50,
    uncommon: 25,
    rare: 15,
    epic: 8,
    legendary: 2,
  },

  // --- Limites da Economia ---
  MAX_SELL_ADENA_PER_HOUR_RATIO: 0.60,  // vs combate
  BAIT_COST_RATIO: 0.10,               // isca custa ~10% do valor esperado do peixe
  ROD_REPAIR_RATIO: 0.05,              // reparo custa ~5% do valor do peixe ganho
  
  // --- Escalonamento de Habilidade ---
  CATCH_BONUS_PER_LEVEL: 0.02,         // +2% de chance de captura por nível de pesca
  XP_BONUS_PER_LEVEL: 0.01,            // +1% de bônus de XP por nível
  MAX_FISHING_LEVEL: 30,
  
  // --- Modo AFK ---
  AUTO_FISH_UNLOCK_LEVEL: 5,            // Nível 5 de pesca para desbloquear AFK
  AUTO_FISH_EFFICIENCY: 0.80,           // 80% da taxa manual
  AUTO_FISH_RARITY_PENALTY: 0.50,       // 50% de chance para raro+ no modo AFK
  
  // --- Durabilidade ---
  ROD_USES_PER_DURABILITY: 1,           // 1 durabilidade por arremesso
  BROKEN_ROD_CATCH_PENALTY: 0.50,       // 50% na taxa de captura com vara quebrada
};

/**
 * Calcula o valor em Adena do peixe com base na raridade e peso
 * @param {Object} fish - Objeto do peixe contendo a raridade
 * @param {number} weight - Peso do peixe
 * @returns {number} Valor em Adena
 */
export function calculateFishValue(fish, weight) {
  const baseValues = {
    common: 10,
    uncommon: 25,
    rare: 100,
    epic: 500,
    legendary: 2500
  };
  
  const baseValue = baseValues[fish.rarity] || baseValues.common;
  // O valor escala com o peso, multiplicador simples
  return Math.floor(baseValue * weight);
}

/**
 * Calcula a probabilidade final de captura
 * @param {number} fishingLevel - Nível de pesca do jogador
 * @param {number} rodBonus - Bônus concedido pela vara de pescar (ex: 0.05)
 * @param {number} baitBonus - Bônus concedido pela isca (ex: 0.1)
 * @param {number} zoneDifficulty - Modificador de dificuldade da zona (ex: -0.2)
 * @returns {number} Probabilidade de captura (0.0 a 1.0)
 */
export function calculateCatchChance(fishingLevel, rodBonus = 0, baitBonus = 0, zoneDifficulty = 0) {
  let chance = FISHING_BALANCE.BASE_CATCH_CHANCE;
  chance += (fishingLevel * FISHING_BALANCE.CATCH_BONUS_PER_LEVEL);
  chance += rodBonus;
  chance += baitBonus;
  chance += zoneDifficulty;
  
  return Math.max(0.05, Math.min(1.0, chance));
}

/**
 * Rola a raridade do peixe usando seleção aleatória ponderada
 * @param {number} fishingLevel - Nível de pesca do jogador
 * @param {number} baitRarityBoost - Bônus de raridade da isca
 * @param {boolean} isAutoFish - Se está usando pesca automática
 * @returns {string} Raridade do peixe
 */
export function rollFishRarity(fishingLevel, baitRarityBoost = 0, isAutoFish = false) {
  const weights = { ...FISHING_BALANCE.RARITY_WEIGHTS };
  
  // Bônus do nível e isca afetam apenas de raro para cima
  const bonusMultiplier = 1 + (fishingLevel * 0.01) + baitRarityBoost;
  
  weights.rare *= bonusMultiplier;
  weights.epic *= bonusMultiplier;
  weights.legendary *= bonusMultiplier;
  
  if (isAutoFish) {
    weights.rare *= FISHING_BALANCE.AUTO_FISH_RARITY_PENALTY;
    weights.epic *= FISHING_BALANCE.AUTO_FISH_RARITY_PENALTY;
    weights.legendary *= FISHING_BALANCE.AUTO_FISH_RARITY_PENALTY;
  }
  
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  
  for (const [rarity, weight] of Object.entries(weights)) {
    if (roll < weight) {
      return rarity;
    }
    roll -= weight;
  }
  
  return 'common'; // Fallback seguro
}

/**
 * Calcula quantos peixes foram pegos offline
 * @param {number} minutesOffline - Minutos que o jogador passou offline
 * @param {number} fishingLevel - Nível de pesca do jogador
 * @param {number} rodBonus - Bônus da vara de pescar (reduz tempo do intervalo)
 * @returns {number} Quantidade de peixes capturados
 */
export function calculateOfflineFishCount(minutesOffline, fishingLevel, rodBonus = 0) {
  const effectiveMinutes = Math.min(minutesOffline, FISHING_BALANCE.OFFLINE_MAX_MINUTES);
  const msOffline = effectiveMinutes * 60 * 1000;
  
  // Nível e bônus da vara podem reduzir o intervalo levemente (max 20% redução)
  const reductionFactor = Math.min(0.2, (fishingLevel * 0.005) + (rodBonus / 2));
  const effectiveInterval = FISHING_BALANCE.OFFLINE_FISH_INTERVAL_MS * (1 - reductionFactor);
  
  const maxPossibleCasts = Math.floor(msOffline / effectiveInterval);
  const efficientCasts = Math.floor(maxPossibleCasts * FISHING_BALANCE.OFFLINE_EFFICIENCY);
  
  // Assume que alguns escapam (simplificado offline)
  const catchChance = calculateCatchChance(fishingLevel, rodBonus, 0, 0);
  
  return Math.floor(efficientCasts * catchChance);
}
