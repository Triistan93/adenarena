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
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';

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
    
    // SECURITY: Never allow client-sent privilegeLevel to be written to Firestore!
    delete cleanState.privilegeLevel;
    
    const payload: any = {
      state: cleanState,
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, payload, { merge: true });
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
    if (snap.exists()) {
      const docData = snap.data();
      if (docData && docData.state) {
        const stateObj = docData.state;
        // SECURITY: privilegeLevel is strictly authorized from root document in Firestore
        const rootPrivilege = Number(docData.privilegeLevel) || (docData.role === 'admin' ? 1 : 0);
        stateObj.privilegeLevel = rootPrivilege;
        return stateObj;
      }
    }
    return null;
  } catch (err) {
    console.error('Cloud Load Error:', err);
    return null;
  }
}

export async function deletePlayerStateFromCloud(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { state: null, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Cloud Reset Error:', err);
    return false;
  }
}

/**
 * Sincroniza o perfil público do jogador para o ranking global e duelos assíncronos
 */
export async function syncPlayerPublicProfile(userId: string, profileData: any) {
  try {
    if (!userId || !profileData) return false;
    const profileRef = doc(db, 'public_profiles', userId);
    const payload = {
      ...profileData,
      userId,
      updatedAt: serverTimestamp()
    };
    await setDoc(profileRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('Public Profile Sync Error:', err);
    return false;
  }
}

/**
 * Busca rankings globais no Firestore (Combat Power, Olimpíadas, Duelos, Castelos)
 */
export async function fetchLeaderboardRankings(category: 'cp' | 'olympiad' | 'duels' | 'castles' = 'cp', limitCount: number = 20) {
  try {
    const profilesCol = collection(db, 'public_profiles');
    let q;
    if (category === 'olympiad') {
      q = query(profilesCol, orderBy('olympiadPoints', 'desc'), limit(limitCount));
    } else if (category === 'duels') {
      q = query(profilesCol, orderBy('duelWins', 'desc'), limit(limitCount));
    } else {
      q = query(profilesCol, orderBy('combatPower', 'desc'), limit(limitCount));
    }

    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((d) => {
      results.push({ id: d.id, ...d.data() });
    });
    return results;
  } catch (err) {
    console.warn('Leaderboard Fetch Notice (using local cache if available):', err);
    return [];
  }
}

/**
 * Busca oponentes reais com Combat Power semelhante para duelos equilibrados
 */
export async function fetchPvPMatchmakingOpponents(playerCP: number = 10000, rangePct: number = 0.25, limitCount: number = 5) {
  try {
    const minCP = Math.max(100, Math.floor(playerCP * (1 - rangePct)));
    const maxCP = Math.floor(playerCP * (1 + rangePct));
    const profilesCol = collection(db, 'public_profiles');
    const q = query(
      profilesCol, 
      where('combatPower', '>=', minCP),
      where('combatPower', '<=', maxCP),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const opponents: any[] = [];
    snap.forEach((d) => {
      opponents.push({ id: d.id, ...d.data() });
    });
    return opponents;
  } catch (err) {
    console.warn('Matchmaking Opponents Fetch Notice:', err);
    return [];
  }
}

