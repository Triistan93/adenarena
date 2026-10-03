/** Opt-in connection to loopback Firebase emulators for disposable local testing. */
export function connectFirebaseEmulators({
  enabled,
  auth,
  db,
  firestoreHost = '127.0.0.1',
  firestorePort = 8080,
  connectAuthEmulator,
  connectFirestoreEmulator,
} = {}) {
  if (enabled !== true) return false;

  if (!auth || !db || typeof connectAuthEmulator !== 'function' || typeof connectFirestoreEmulator !== 'function') {
    throw new Error('Local Firebase emulator mode requires Auth and Firestore emulator connectors.');
  }

  if (firestoreHost !== '127.0.0.1') {
    throw new Error('Local Firestore emulator host must use loopback (127.0.0.1).');
  }
  if (!Number.isInteger(firestorePort) || firestorePort < 1 || firestorePort > 65_535) {
    throw new Error('Local Firestore emulator requires a valid port between 1 and 65535.');
  }

  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, firestoreHost, firestorePort);
  return true;
}
