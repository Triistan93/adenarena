const RACE_PREFIXES = {
  human: ['human_'],
  elf: ['elf_', 'elven_'],
  darkelf: ['dark_elf_', 'darkelf_'],
  highelf: ['high_elf_', 'highelf_'],
  orc: ['orc_'],
  dwarf: ['dwarf_'],
  kamael: ['kamael_'],
  sylph: ['sylph_'],
  ertheia: ['ertheia_']
};

export function classPortraitAliases(race, classId) {
  const r = String(race || '').toLowerCase().replace(/[\s_-]+/g, '');
  const c = String(classId || '').toLowerCase().replace(/[\s-]+/g, '_');
  const candidates = [c, c.replaceAll('_', '')];

  for (const prefix of RACE_PREFIXES[r] || []) {
    if (c.startsWith(prefix)) {
      const stripped = c.slice(prefix.length);
      candidates.push(stripped, stripped.replaceAll('_', ''));
    }
    const compactPrefix = prefix.replaceAll('_', '');
    if (c.startsWith(compactPrefix)) candidates.push(c.slice(compactPrefix.length));
  }

  const strippedStage = c.replace(/_?s?\d+$/, '');
  candidates.push(strippedStage, strippedStage.replaceAll('_', ''));

  if (r === 'human') {
    if (/^(?:werewolf|warg)(?:_|$)/.test(c) || c === 'wargbase') candidates.push('wargs0', 'warg');
    if (c.includes('assassin')) candidates.push('assassins0', 'assassin');
    if (c.includes('deathknight')) candidates.push('deathknight');
  }
  if (r === 'elf') {
    if (c.startsWith('elven_fighter')) candidates.push('elffighter');
    if (c.startsWith('elven_mage')) candidates.push('elfmage');
    if (c.includes('deathknight')) candidates.push('elfdeathknight');
    if (c.includes('evassaint')) candidates.push('evasaint');
  }
  if (candidates.includes('evassaint')) candidates.push('evasaint');

  return [...new Set(candidates.filter(Boolean))];
}
