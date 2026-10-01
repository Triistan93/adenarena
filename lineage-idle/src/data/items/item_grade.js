/** Resolves the canonical equipment grade code used by the UI and Pushkin exchange. */
export function getItemGradeCode(itemDef) {
  if (!itemDef) return 'ng';
  const explicit = String(itemDef.grade || itemDef.tierGrade || '').toLowerCase();
  if (['none', 'no grade', 'nograde', 'ng'].includes(explicit)) return 'ng';
  if (['d', 'c', 'b', 'a', 's'].includes(explicit)) return explicit;
  if (['boss', 'special'].includes(explicit)) return 'boss';
  if (['frostlord', 'frost'].includes(explicit)) return 'frostlord';

  const desc = String(itemDef.desc || itemDef.info || itemDef.name || '').toLowerCase();
  const identity = `${String(itemDef.name || '').toLowerCase()} ${desc}`;
  const icon = String(itemDef.icon || '').toLowerCase();
  if (desc.includes('no grade') || desc.includes('(no grade)') || icon.includes('nograde/')) return 'ng';
  if (identity.includes('frost lord')) return 'frostlord';
  // Item art is frequently reused between unrelated grades (for example
  // ordinary S weapons use `gradespecial/`, and Infinity Axe uses Frost Lord art).
  // Resolve declared identity and required status before consulting visual paths.
  if (desc.includes('(s grade)')) return 's';
  if (desc.includes('(a grade)')) return 'a';
  if (desc.includes('(b grade)')) return 'b';
  if (desc.includes('(c grade)')) return 'c';
  if (desc.includes('(d grade)')) return 'd';
  if (itemDef.req?.isHero || desc.includes('(special') || desc.includes('(boss')) return 'boss';
  if (icon.includes('gradespecial/')) return 'boss';
  if (icon.includes('grades/')) return 's';
  if (icon.includes('gradea/')) return 'a';
  if (icon.includes('gradeb/')) return 'b';
  if (icon.includes('gradec/')) return 'c';
  if (icon.includes('graded/')) return 'd';

  const tier = Number(itemDef.tier) || 0;
  const reqLevel = Number(itemDef.req?.level || itemDef.reqLvl || 0);
  if (tier === 1 || reqLevel < 20) return 'ng';
  if (tier === 2 || (reqLevel >= 20 && reqLevel < 40)) return 'd';
  if (tier === 3 || (reqLevel >= 40 && reqLevel < 52)) return 'c';
  if (tier === 4 || (reqLevel >= 52 && reqLevel < 61)) return 'b';
  if (tier === 5 || (reqLevel >= 61 && reqLevel < 76)) return 'a';
  if (tier === 6 || (reqLevel >= 76 && reqLevel < 80)) return 's';
  if (tier >= 7 || reqLevel >= 80) return 'frostlord';
  return 'ng';
}

/** Exact-grade filter used by the inventory selector; Frost Lord is not S grade. */
export function matchesItemGradeFilter(itemDef, gradeFilter = 'all') {
  const filter = String(gradeFilter || 'all').trim().toLowerCase();
  return filter === 'all' || getItemGradeCode(itemDef) === filter;
}

/** Maps unique boss grades to the existing S progression band used by upgrades. */
export function getEquipmentProgressionGradeCode(itemDef) {
  const grade = getItemGradeCode(itemDef);
  return grade === 'boss' || grade === 'frostlord' ? 's' : grade;
}

/** Dedicated Soulshot/Spiritshot items exist through S grade only. */
export const getShotGradeCode = getEquipmentProgressionGradeCode;
