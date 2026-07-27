import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB36IqqrnZglElfM5kxsTi1S2Acclate9Y",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "adenarena-6e448.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "adenarena-6e448",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "adenarena-6e448.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "320732940839",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:320732940839:web:99e037953e517d16b29c02",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KQ280JBQDN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
};

export async function savePlayerStateToCloud(userId: string, stateData: any) {
  try {
    const userRef = doc(db, 'users', userId);
    const cleanState = JSON.parse(JSON.stringify(stateData));
    await setDoc(userRef, {
      state: cleanState,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Cloud Save Error:', err);
    return false;
  }
}

export async function loadPlayerStateFromCloud(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists() && snap.data()?.state) {
      return snap.data().state;
    }
    return null;
  } catch (err) {
    console.error('Cloud Load Error:', err);
    return null;
  }
}
