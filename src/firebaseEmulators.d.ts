import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseEmulatorConnectors = {
  enabled?: boolean;
  auth?: Auth;
  db?: Firestore;
  connectAuthEmulator?: (auth: Auth, url: string, options?: { disableWarnings: boolean }) => void;
  connectFirestoreEmulator?: (db: Firestore, host: string, port: number) => void;
};

export function connectFirebaseEmulators(options?: FirebaseEmulatorConnectors): boolean;
