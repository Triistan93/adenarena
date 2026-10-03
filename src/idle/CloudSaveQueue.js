const DEFAULT_THROTTLE_MS = 30_000;

/** Coalesces pending cloud writes per account and settles every waiting caller. */
export function createCloudSaveQueue({
  throttleMs = DEFAULT_THROTTLE_MS,
  now = () => Date.now(),
  setTimeout: scheduleTimer = setTimeout,
  clearTimeout: cancelTimer = clearTimeout
} = {}) {
  const entries = new Map();

  function getEntry(userId) {
    let entry = entries.get(userId);
    if (!entry) {
      entry = {
        lastSaveAt: 0,
        pendingTimer: null,
        saveFn: null,
        waiters: [],
        inFlight: null,
        flushImmediately: false
      };
      entries.set(userId, entry);
    }
    return entry;
  }

  function schedulePending(userId, entry, delay) {
    if (entry.pendingTimer !== null || !entry.waiters.length) return;
    entry.pendingTimer = scheduleTimer(() => {
      entry.pendingTimer = null;
      void executePending(userId, entry);
    }, delay);
  }

  async function executePending(userId, entry) {
    if (entry.inFlight || !entry.saveFn || !entry.waiters.length) return;

    const currentSave = entry.saveFn;
    const waiters = entry.waiters;
    entry.saveFn = null;
    entry.waiters = [];
    entry.flushImmediately = false;
    entry.lastSaveAt = now();

    const inFlight = (async () => {
      let saved = false;
      try {
        saved = Boolean(await currentSave());
      } catch (error) {
        console.error('[CloudSaveQueue] Cloud save failed:', error);
      }
      return saved;
    })();
    entry.inFlight = inFlight;

    const saved = await inFlight;
    waiters.forEach((resolve) => resolve(saved));
    if (entry.inFlight === inFlight) entry.inFlight = null;

    if (entry.waiters.length && entry.pendingTimer === null) {
      if (entry.flushImmediately) {
        void executePending(userId, entry);
      } else {
        const elapsed = now() - entry.lastSaveAt;
        schedulePending(userId, entry, Math.max(0, throttleMs - elapsed));
      }
    }
  }

  function schedule(userId, saveFn) {
    if (!userId || typeof saveFn !== 'function') return Promise.resolve(false);

    const entry = getEntry(userId);

    if (entry.pendingTimer !== null) {
      cancelTimer(entry.pendingTimer);
      entry.pendingTimer = null;
    }

    entry.saveFn = saveFn;
    const result = new Promise((resolve) => entry.waiters.push(resolve));
    const elapsed = now() - entry.lastSaveAt;
    if (entry.flushImmediately) {
      if (!entry.inFlight) void executePending(userId, entry);
    } else {
      schedulePending(userId, entry, Math.max(0, throttleMs - elapsed));
    }

    return result;
  }

  function scheduleImmediate(userId, saveFn) {
    if (!userId || typeof saveFn !== 'function') return Promise.resolve(false);
    const entry = getEntry(userId);
    if (entry.pendingTimer !== null) {
      cancelTimer(entry.pendingTimer);
      entry.pendingTimer = null;
    }

    // Replace pending stale snapshots and persist only the freshest state.
    entry.saveFn = saveFn;
    entry.flushImmediately = true;
    const result = new Promise((resolve) => entry.waiters.push(resolve));
    if (!entry.inFlight) void executePending(userId, entry);
    return result;
  }

  return { schedule, scheduleImmediate };
}
