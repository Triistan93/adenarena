export const ACTION_PROTOTYPE_CAMPAIGN = Object.freeze({
  zoneName: "Ruínas de Aden",
  waveLimit: 5,
});

export function createActionPrototypeConfig(race, cls) {
  return {
    race,
    cls,
    idleState: null,
    bridgeIdleProgression: false,
    zoneName: ACTION_PROTOTYPE_CAMPAIGN.zoneName,
    campaignWaveLimit: ACTION_PROTOTYPE_CAMPAIGN.waveLimit,
  };
}

export function shouldBridgeIdleProgression(config) {
  return config?.bridgeIdleProgression !== false;
}

export function createInitialPrototypeProgression() {
  return { level: 1, xp: 0, xpToNext: 100, totalXp: 0 };
}

export function awardPrototypeXp(progression, amount) {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
  let level = Math.max(1, Math.floor(progression?.level || 1));
  let totalXp = Math.max(0, Math.floor(progression?.totalXp || 0)) + safeAmount;
  let xp = Math.max(0, Math.floor(progression?.xp || 0)) + safeAmount;
  let xpToNext = Math.max(100, Math.floor(progression?.xpToNext || 100));

  while (xp >= xpToNext) {
    xp -= xpToNext;
    level += 1;
    xpToNext = 100 + (level - 1) * 50;
  }

  return { level, xp, xpToNext, totalXp };
}
