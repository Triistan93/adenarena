/** Resolves the presentation for the active global boss without changing combat state. */
export function resolveWorldBossScene(state, zoneBackgrounds = {}) {
  const boss = state?.activeMonster;
  if (!boss?.isWorldBoss) return null;

  const background = zoneBackgrounds[boss.bg];
  if (!background) return null;

  return {
    id: boss.id,
    background,
    label: boss.title || boss.name || 'World Boss'
  };
}
