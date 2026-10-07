/** Offline profession yield is capped to 30% of active cycles over at most 8h. */
export const LIFE_ACTIVITY_OFFLINE_BALANCE = Object.freeze({
  MAX_MINUTES: 480,
  EFFICIENCY: 0.30
});

export function getOfflineActionBudget(minutesOffline, activeCycleMs) {
  const minutes = Math.min(
    LIFE_ACTIVITY_OFFLINE_BALANCE.MAX_MINUTES,
    Math.max(0, Number(minutesOffline) || 0)
  );
  const cycleMs = Math.max(1, Number(activeCycleMs) || 1);
  return Math.floor((minutes * 60 * 1000 / cycleMs) * LIFE_ACTIVITY_OFFLINE_BALANCE.EFFICIENCY);
}
