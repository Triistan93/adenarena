/**
 * monsterBalance.js — Curva Analítica de Atributos de Monstros Comuns, Elites e Chefes de Zona.
 *
 * Elimina multiplicadores universais descalibrados (como o antigo 4.5x HP / 2.0x Atk para qualquer chefe),
 * substituindo-os por uma curva contínua progressiva e controlada.
 */

export const MONSTER_MULTIPLIERS = {
  normal:   { hp: 1.0,  atk: 1.0,  def: 1.0,  xp: 1.0,  gold: 1.0 },
  elite:    { hp: 1.8,  atk: 1.25, def: 1.25, xp: 2.5,  gold: 2.5 },
  zoneBoss: { hp: 2.8,  atk: 1.40, def: 1.35, xp: 4.5,  gold: 4.5 },
  championBlue: { hp: 3.0, atk: 1.35, def: 1.25, xp: 4.0, gold: 4.0 },
  championRed:  { hp: 5.0, atk: 1.60, def: 1.40, xp: 8.0, gold: 8.0 }
};

/**
 * Retorna os multiplicadores de combate apropriados para um template de monstro.
 * @param {Object} template
 * @param {boolean} isBossSpawn
 * @param {Object|null} champion
 * @returns {{ hpMult: number, atkMult: number, defMult: number, xpMult: number, goldMult: number, isElite: boolean }}
 */
export function getMonsterSpawnMultipliers(template, isBossSpawn = false, champion = null) {
  if (typeof template === 'string') {
    if (template === 'zone_boss' || template === 'zoneBoss' || template === 'boss') {
      const b = MONSTER_MULTIPLIERS.zoneBoss;
      return { hpMult: b.hp, atkMult: b.atk, defMult: b.def, xpMult: b.xp, goldMult: b.gold, isElite: false, isBoss: true };
    }
    if (template === 'elite') {
      const e = MONSTER_MULTIPLIERS.elite;
      return { hpMult: e.hp, atkMult: e.atk, defMult: e.def, xpMult: e.xp, goldMult: e.gold, isElite: true, isBoss: false };
    }
    const n = MONSTER_MULTIPLIERS.normal;
    return { hpMult: n.hp, atkMult: n.atk, defMult: n.def, xpMult: n.xp, goldMult: n.gold, isElite: false, isBoss: false };
  }

  if (isBossSpawn || template?.boss) {
    const b = MONSTER_MULTIPLIERS.zoneBoss;
    return { hpMult: b.hp, atkMult: b.atk, defMult: b.def, xpMult: b.xp, goldMult: b.gold, isElite: false, isBoss: true };
  }

  if (champion) {
    const c = champion.type === 'red' ? MONSTER_MULTIPLIERS.championRed : MONSTER_MULTIPLIERS.championBlue;
    return { hpMult: c.hp, atkMult: c.atk, defMult: c.def, xpMult: c.xp, goldMult: c.gold, isElite: false, isBoss: false };
  }

  if (template.elite) {
    const e = MONSTER_MULTIPLIERS.elite;
    return { hpMult: e.hp, atkMult: e.atk, defMult: e.def, xpMult: e.xp, goldMult: e.gold, isElite: true, isBoss: false };
  }

  const n = MONSTER_MULTIPLIERS.normal;
  return { hpMult: n.hp, atkMult: n.atk, defMult: n.def, xpMult: n.xp, goldMult: n.gold, isElite: false, isBoss: false };
}
