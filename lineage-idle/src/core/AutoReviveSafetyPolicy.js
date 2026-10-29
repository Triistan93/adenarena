export const AUTO_REVIVE_BRAKE_DEATHS = 3;
export const AUTO_REVIVE_BRAKE_WINDOW_MS = 120000;

/** Mantém apenas mortes recentes do Auto-Reviver e informa quando desarmar a automação. */
export function createAutoReviveDeathTracker({
  threshold = AUTO_REVIVE_BRAKE_DEATHS,
  windowMs = AUTO_REVIVE_BRAKE_WINDOW_MS
} = {}) {
  let timestamps = [];

  return {
    record(now = Date.now()) {
      timestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
      timestamps.push(now);
      return timestamps.length >= threshold;
    },
    reset() { timestamps = []; },
    count(now = Date.now()) {
      timestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
      return timestamps.length;
    }
  };
}
