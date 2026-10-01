import { MAGIC_LAMP_EXP_THRESHOLD, rollMagicLampCard } from '../data/economy/magicLampBalance.js';

/**
 * Credits the lamp share of a kill's EXP, preserving every threshold crossing.
 * @returns {{progressAdded:number,lampsEarned:number,remainingExp:number}}
 */
export function grantMagicLampProgressFromKill(state, xpGain, callbacks = {}) {
  const safeXpGain = Number(xpGain);
  if (!state || !Number.isFinite(safeXpGain) || safeXpGain <= 0) {
    return { progressAdded: 0, lampsEarned: 0, remainingExp: Math.max(0, Number(state?.magicLampExp) || 0) };
  }

  const progressAdded = Math.floor(safeXpGain * 0.4);
  const accumulated = Math.max(0, Number(state.magicLampExp) || 0) + progressAdded;
  const lampsEarned = Math.floor(accumulated / MAGIC_LAMP_EXP_THRESHOLD);
  state.magicLampExp = accumulated - lampsEarned * MAGIC_LAMP_EXP_THRESHOLD;

  if (lampsEarned > 0) {
    state.magicLamps = Math.max(0, Math.floor(Number(state.magicLamps) || 0)) + lampsEarned;
    callbacks.log?.(`🪔 NOVA LÂMPADA MÁGICA ACUMULADA! (+${lampsEarned}; total: ${state.magicLamps})`, 'rarity-legendary');
    callbacks.floatText?.(`🪔 LÂMPADA MÁGICA +${lampsEarned}!`, 'float-jackpot');
  }

  return { progressAdded, lampsEarned, remainingExp: state.magicLampExp };
}

/** Consumes exactly one lamp and credits the production reward roll. */
export function consumeMagicLamp(state, rollCard = rollMagicLampCard) {
  const available = Math.floor(Number(state?.magicLamps) || 0);
  if (!state || available < 1) return { success: false, reason: 'no_lamps' };

  const result = rollCard(state.level || 1);
  if (!result || !Number.isFinite(Number(result.expWon)) || !Number.isFinite(Number(result.spWon))) {
    return { success: false, reason: 'invalid_reward' };
  }

  state.magicLamps = available - 1;
  state.xp = (Number(state.xp) || 0) + Number(result.expWon);
  state.sp = (Number(state.sp) || 0) + Number(result.spWon);
  return { success: true, result };
}

export { MAGIC_LAMP_EXP_THRESHOLD };
