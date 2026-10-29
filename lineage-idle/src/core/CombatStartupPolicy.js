export function shouldStartCombatAtStartup(state) {
  return Boolean(state?.zone) && state.isDead !== true && state.isCombatActive !== false;
}

/** Personagem derrotado não acumula progresso offline. */
export function canAccrueOfflineProgress(state) {
  return state?.isDead !== true && Number(state?.hp) > 0;
}
