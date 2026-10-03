/** Opt-in connection to loopback Firebase emulators for disposable local testing. */
export function connectFirebaseEmulators({
  enabled,
  auth,
  db,
  connectAuthEmulator,
  connectFirestoreEmulator,
} = {}) {
  if (enabled !== true) return false;

  if (!auth || !db || typeof connectAuthEmulator !== 'function' || typeof connectFirestoreEmulator !== 'function') {
    throw new Error('Local Firebase emulator mode requires Auth and Firestore emulator connectors.');
  }

  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return true;
}
