/** Resolves the canonical equipment grade code used by the UI and Pushkin exchange. */
export function getItemGradeCode(itemDef) {
  if (!itemDef) return 'ng';
  const explicit = String(itemDef.grade || itemDef.tierGrade || '').toLowerCase();
  if (['none', 'no grade', 'nograde', 'ng'].includes(explicit)) return 'ng';
  if (['d', 'c', 'b', 'a', 's'].includes(explicit)) return explicit;
  if (['boss', 'special'].includes(explicit)) return 'boss';
  if (['frostlord', 'frost'].includes(explicit)) return 'frostlord';

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
