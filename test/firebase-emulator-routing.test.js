import test from 'node:test';
import assert from 'node:assert/strict';
import { connectFirebaseEmulators } from '../src/firebaseEmulators.js';

test('Firebase stays on normal configuration unless the local emulator flag is explicitly enabled', () => {
  const calls = [];
  const result = connectFirebaseEmulators({
    enabled: false,
    auth: { id: 'auth' },
    db: { id: 'db' },
    connectAuthEmulator: (...args) => calls.push(['auth', ...args]),
    connectFirestoreEmulator: (...args) => calls.push(['firestore', ...args]),
  });

  assert.equal(result, false);
  assert.deepEqual(calls, []);
});

test('explicit local mode connects Auth and Firestore only to loopback emulator ports', () => {
  const calls = [];
  const auth = { id: 'auth' };
  const db = { id: 'db' };
  const result = connectFirebaseEmulators({
    enabled: true,
    auth,
    db,
    connectAuthEmulator: (...args) => calls.push(['auth', ...args]),
    connectFirestoreEmulator: (...args) => calls.push(['firestore', ...args]),
  });

  assert.equal(result, true);
  assert.deepEqual(calls, [
    ['auth', auth, 'http://127.0.0.1:9099', { disableWarnings: true }],
    ['firestore', db, '127.0.0.1', 8080],
  ]);
});

test('local Firestore emulator can use a separate loopback port for isolated recovery tests', () => {
  const calls = [];
  const auth = { id: 'auth' };
  const db = { id: 'db' };
  const result = connectFirebaseEmulators({
    enabled: true,
    auth,
    db,
    firestorePort: 18280,
    connectAuthEmulator: (...args) => calls.push(['auth', ...args]),
    connectFirestoreEmulator: (...args) => calls.push(['firestore', ...args]),
  });

  assert.equal(result, true);
  assert.deepEqual(calls, [
    ['auth', auth, 'http://127.0.0.1:9099', { disableWarnings: true }],
    ['firestore', db, '127.0.0.1', 18280],
  ]);
});

test('local Firestore emulator rejects a non-loopback host and invalid custom port', () => {
  const connect = () => {};
  const options = { enabled: true, auth: {}, db: {}, connectAuthEmulator: connect, connectFirestoreEmulator: connect };

  assert.throws(() => connectFirebaseEmulators({ ...options, firestoreHost: 'firestore.example.com' }), /loopback/);
  assert.throws(() => connectFirebaseEmulators({ ...options, firestorePort: 70_000 }), /valid port/);
});

test('local emulator mode rejects missing connector dependencies instead of silently using production', () => {
  assert.throws(() => connectFirebaseEmulators({ enabled: true }), /requires Auth and Firestore emulator connectors/);
});
