export function shouldStartCombatAtStartup(state) {
  return Boolean(state?.zone) && state.isCombatActive !== false;
}
