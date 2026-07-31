// ═══════════════════════════════════════════
// UTILIDADES — Herança de skills entre classes
// ═══════════════════════════════════════════

/**
 * Retorna todas as skills de uma classe, incluindo herdadas dos parents.
 * Exemplo: getClassSkills("duelist", CLASSES) retorna skills de
 *   fighter → warrior → gladiator → duelist
 */
export function getClassSkills(classId, allClasses) {
  const cls = allClasses[classId];
  if (!cls) return [];

  const parentSkills = cls.parent
    ? getClassSkills(cls.parent, allClasses)
    : [];

  const ownSkills = cls.skills || [];

  return [...parentSkills, ...ownSkills];
}

/**
 * Retorna a cadeia de classes (lineage) de uma classe.
 * Exemplo: getClassLineage("duelist", CLASSES)
 *   → ["fighter", "warrior", "gladiator", "duelist"]
 */
export function getClassLineage(classId, allClasses) {
  const cls = allClasses[classId];
  if (!cls) return [];

  const parentLineage = cls.parent
    ? getClassLineage(cls.parent, allClasses)
    : [];

  return [...parentLineage, classId];
}

/**
 * Calcula stats acumulados (base de cada stage somada).
 */
export function getAccumulatedStats(classId, allClasses) {
  const lineage = getClassLineage(classId, allClasses);
  const accumulated = { atk: 0, def: 0, hp: 0, mp: 0, eva: 0, crit: 0, matk: 0, mdef: 0 };

  for (const id of lineage) {
    const cls = allClasses[id];
    if (cls && cls.base) {
      for (const stat in cls.base) {
        if (accumulated[stat] !== undefined) {
          accumulated[stat] += cls.base[stat] || 0;
        }
      }
    }
  }

  return accumulated;
}

/**
 * Busca uma skill por ID em todas as classes.
 */
export function findSkillById(skillId, allClasses) {
  for (const classId in allClasses) {
    const cls = allClasses[classId];
    if (cls.skills) {
      const skill = cls.skills.find(s => s.id === skillId);
      if (skill) return { ...skill, sourceClass: classId };
    }
  }
  return null;
}
