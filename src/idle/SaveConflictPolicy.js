/**
 * Avoid replacing a newer local snapshot with an older cloud snapshot, while
 * keeping saves from other accounts isolated on shared browsers.
 */
export function preferLocalPlayerSave({ localState, cloudState, userId } = {}) {
  if (!localState || !cloudState || !userId) return false;
  if (localState.ownerUid !== userId) return false;
  if (cloudState.ownerUid && cloudState.ownerUid !== userId) return false;

  const localSavedAt = Number(localState.lastSaveTime);
  const cloudSavedAt = Number(cloudState.lastSaveTime);
  if (!Number.isFinite(localSavedAt) || localSavedAt <= 0) return false;
  if (!Number.isFinite(cloudSavedAt) || cloudSavedAt <= 0) return false;

  return localSavedAt > cloudSavedAt;
}
