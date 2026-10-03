import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloudSaveQueue } from '../src/idle/CloudSaveQueue.js';

function createFakeTimers() {
  let nextId = 0;
  const timers = new Map();
  return {
    setTimeout(callback, delay) {
      const id = ++nextId;
      timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    async runNext() {
      const [id, timer] = timers.entries().next().value || [];
      if (!timer) return false;
      timers.delete(id);
      await timer.callback();
      return true;
    },
    get pendingCount() { return timers.size; },
    get nextDelay() { return timers.values().next().value?.delay; }
  };
}

test('coalesced cloud saves settle every caller with the result of the newest snapshot', async () => {
  const timers = createFakeTimers();
  const queue = createCloudSaveQueue({
    throttleMs: 30_000,
    now: () => 100_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout
  });
  const writes = [];
  const first = queue.schedule('account-a', async () => { writes.push('old'); return false; });
  const second = queue.schedule('account-a', async () => { writes.push('new'); return true; });

  assert.equal(timers.pendingCount, 1);
  assert.equal(await timers.runNext(), true);
  assert.deepEqual(await Promise.all([first, second]), [true, true]);
  assert.deepEqual(writes, ['new']);
});

test('cloud save queue isolates accounts and resolves failed writes as false', async () => {
  const timers = createFakeTimers();
  const queue = createCloudSaveQueue({
    throttleMs: 30_000,
    now: () => 100_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout
  });
  const first = queue.schedule('account-a', async () => { throw new Error('offline'); });
  const second = queue.schedule('account-b', async () => true);

  assert.equal(timers.pendingCount, 2);
  await timers.runNext();
  await timers.runNext();
  assert.deepEqual(await Promise.all([first, second]), [false, true]);
});

test('a later autosave can retry after the previous network write failed', async () => {
  const timers = createFakeTimers();
  const queue = createCloudSaveQueue({
    throttleMs: 30_000,
    now: () => 100_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout
  });
  let online = false;
  const first = queue.schedule('account-a', async () => online);
  await timers.runNext();
  assert.equal(await first, false);

  online = true;
  const retry = queue.schedule('account-a', async () => online);
  assert.equal(timers.nextDelay, 30_000);
  await timers.runNext();
  assert.equal(await retry, true);
});

test('an immediate save supersedes an older queued snapshot and settles its callers', async () => {
  const timers = createFakeTimers();
  const queue = createCloudSaveQueue({
    throttleMs: 30_000,
    now: () => 100_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout
  });
  const writes = [];
  const autosave = queue.schedule('account-a', async () => { writes.push('stale'); return true; });
  const immediate = queue.scheduleImmediate('account-a', async () => { writes.push('latest'); return true; });

  assert.equal(timers.pendingCount, 0, 'save imediato cancela o timer do snapshot antigo');
  assert.deepEqual(await Promise.all([autosave, immediate]), [true, true]);
  assert.deepEqual(writes, ['latest']);
});

test('immediate snapshots wait for an in-flight write before saving the latest state', async () => {
  const timers = createFakeTimers();
  const queue = createCloudSaveQueue({
    throttleMs: 30_000,
    now: () => 100_000,
    setTimeout: timers.setTimeout,
    clearTimeout: timers.clearTimeout
  });
  const writes = [];
  let releaseOld;
  const oldGate = new Promise(resolve => { releaseOld = resolve; });
  const autosave = queue.schedule('account-a', async () => {
    writes.push('old-start');
    await oldGate;
    writes.push('old-end');
    return true;
  });

  const oldRun = timers.runNext();
  await Promise.resolve();
  const immediate = queue.scheduleImmediate('account-a', async () => {
    writes.push('latest');
    return true;
  });
  const newerSnapshot = queue.schedule('account-a', async () => {
    writes.push('latest-after-immediate-request');
    return true;
  });
  assert.equal(timers.pendingCount, 0, 'autosave não deve atrasar uma gravação imediata já aguardando');
  assert.deepEqual(writes, ['old-start']);

  releaseOld();
  await oldRun;
  assert.deepEqual(await Promise.all([autosave, immediate, newerSnapshot]), [true, true, true]);
  assert.deepEqual(writes, ['old-start', 'old-end', 'latest-after-immediate-request']);
});
