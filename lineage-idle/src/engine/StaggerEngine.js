/**
 * StaggerEngine.js — Motor de Quebra de Postura (Stagger / Break System) para Chefes e Elites.
 *
 * Adiciona profundidade tática ao combate 1:1:
 * - Chefes de Zona, Elites, Bosses de Torre e Raids possuem uma Barra de Postura.
 * - Ataques e habilidades de impacto (Maças, 2H, Lanças, Escudo) causam alto dano de postura.
 * - Ao zerar a postura, o Chefe entra no estado BREAK por 5s: fica paralisado e recebe 2.0x de dano global!
 */

export class StaggerEngine {
  /**
   * Inicializa a Barra de Postura em monstros relevantes (Chefes, Elites, Raids, Torre).
   * @param {Object} monster
   * @returns {Object}
   */
  static initMonsterStagger(monster) {
    if (!monster || typeof monster !== 'object') return monster;
    const isBossOrElite = monster.boss || monster.isElite || monster.isRaid || monster.isTower || monster.isChaosBoss;
    if (!isBossOrElite) {
      monster.staggerMax = 0;
      monster.staggerCurrent = 0;
      monster.isBreak = false;
      monster.breakUntil = 0;
      return monster;
    }

    const baseHp = monster._maxHp || monster.hp || 1000;
    // Barra de Postura proporcional a ~25% do HP base do monstro
    const staggerPool = Math.max(100, Math.floor(baseHp * 0.25));
    
    monster.staggerMax = staggerPool;
    monster.staggerCurrent = staggerPool;
    monster.isBreak = false;
    monster.breakUntil = 0;
    return monster;
  }

  /**
   * Aplica dano de postura (Stagger Damage) ao monstro alvo.
   * @param {Object} monster
   * @param {number} damage
   * @param {string} weaponType
   * @param {boolean} isSkill
   * @param {boolean} isCrit
   * @param {Object} callbacks — { log, floatText, playVFX }
   * @returns {{ didBreak: boolean, isBreak: boolean, mult: number }}
   */
  static applyStaggerDamage(monster, damage, weaponType = 'sword', isSkill = false, isCrit = false, callbacks = {}) {
    if (!monster || !monster.staggerMax) {
      return { didBreak: false, isBreak: false, mult: 1.0 };
    }

    const now = Date.now();

    // Se o monstro já está em BREAK, apenas retorna o multiplicador de vulnerabilidade 2.0x
    if (monster.breakUntil && monster.breakUntil > now) {
      return { didBreak: false, isBreak: true, mult: 2.0 };
    } else if (monster.isBreak && monster.breakUntil <= now) {
      // Estado de Break acabou: regenera a postura do Chefe
      monster.isBreak = false;
      monster.breakUntil = 0;
      monster.staggerCurrent = monster.staggerMax;
      if (callbacks.log) callbacks.log(`🛡️ ${monster.name} recuperou sua postura e postura defensiva!`, 'system');
    }

    // Cálculo do Dano de Postura baseado no tipo de arma e natureza do golpe
    let impactMult = 1.0;
    if (weaponType === 'blunt' || weaponType === 'twohand') impactMult = 2.2; // Maças e 2H têm impacto brutal
    else if (weaponType === 'spear' || weaponType === 'fist') impactMult = 1.6;
    else if (weaponType === 'dagger') impactMult = 1.2;
    else if (weaponType === 'bow') impactMult = 1.1;

    if (isSkill) impactMult *= 1.5;
    if (isCrit) impactMult *= 1.4;

    const staggerDmg = Math.max(5, Math.floor(damage * 0.18 * impactMult));
    monster.staggerCurrent = Math.max(0, (monster.staggerCurrent || monster.staggerMax) - staggerDmg);

    // Checagem de QUEBRA DE POSTURA (BREAK)
    if (monster.staggerCurrent <= 0 && !monster.isBreak) {
      monster.isBreak = true;
      monster.breakUntil = now + 5000; // 5 segundos de vulnerabilidade máxima

      if (callbacks.floatText) callbacks.floatText('💥 BREAK! (2.0x DANO)', 'float-jackpot');
      if (callbacks.log) callbacks.log(`🚨 QUEBRA DE POSTURA! 💥 ${monster.name} está VULNERÁVEL por 5s! Todos os ataques causam 200% de DANO!`, 'rarity-legendary');

      return { didBreak: true, isBreak: true, mult: 2.0 };
    }

    return { didBreak: false, isBreak: false, mult: 1.0 };
  }

  /**
   * Retorna o estado atual de Break do monstro.
   * @param {Object} monster
   * @returns {{ isBreak: boolean, timeLeft: number, mult: number }}
   */
  static getBreakState(monster) {
    if (!monster || !monster.breakUntil) return { isBreak: false, timeLeft: 0, mult: 1.0 };
    const now = Date.now();
    if (monster.breakUntil > now) {
      return { isBreak: true, timeLeft: Math.ceil((monster.breakUntil - now) / 1000), mult: 2.0 };
    }
    return { isBreak: false, timeLeft: 0, mult: 1.0 };
  }
}
