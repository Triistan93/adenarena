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

    // Sincroniza automaticamente o perfil público para o Ranking com os dados REAIS
    try {
      const stats = cleanState.stats || {};
      const pAtk = Number(stats.atk || stats.pAtk) || 100;
      const mAtk = Number(stats.matk || stats.mAtk) || 50;
      const pDef = Number(stats.def || stats.pDef) || 80;
      const mDef = Number(stats.mdef || stats.mDef) || 60;
      const maxHp = Number(stats.maxHp || stats.hp) || 1000;
      const level = Number(cleanState.level) || 1;
      const cp = Number(stats.combatPower) || Math.floor(level * 150 + pAtk * 1.8 + pDef * 1.5 + mAtk * 1.6 + mDef * 1.5 + maxHp * 0.12);

      let topWeaponName = 'Sem Arma';
      let topWeaponGlow = null;
      if (cleanState.equipment?.weapon) {
        const wUid = cleanState.equipment.weapon;
        const wItem = cleanState.inventory?.find((i: any) => i.uid === wUid || i.id === wUid);
        if (wItem) {
          const enc = Number(wItem.enchant || wItem.enchantLevel) || 0;
          topWeaponName = enc > 0 ? `+${enc} ${wItem.name || 'Arma'}` : (wItem.name || 'Arma');
          topWeaponGlow = wItem.augmentation?.glow || (enc >= 16 ? 'crimson-fire' : enc >= 10 ? 'golden-amber' : enc >= 4 ? 'blue-ice' : null);
        }
      }

      const publicData = {
        userId,
        charName: cleanState.name || cleanState.charName || cleanState.playerName || 'Hero',
        race: cleanState.race || 'Human',
        className: cleanState.className || cleanState.class || 'Warrior',
        level,
        combatPower: cp,
        olympiadPoints: Number(cleanState.olympiad?.points || cleanState.olympiadPoints) || 1000,
        olympiadWins: Number(cleanState.olympiad?.wins || cleanState.olympiadWins) || 0,
        olympiadLosses: Number(cleanState.olympiad?.losses || cleanState.olympiadLosses) || 0,
        duelWins: Number(cleanState.colosseum?.duelWins || cleanState.duelWins) || 0,
        duelLosses: Number(cleanState.colosseum?.duelLosses || cleanState.duelLosses) || 0,
        clanName: cleanState.clan?.name || 'Sem Clã',
        castleLord: cleanState.clan?.castle || null,
        isHero: Boolean(cleanState.olympiad?.isHero || cleanState.isHero),
        topWeaponName,
        topWeaponGlow,
        statsSnapshot: {
          hp: maxHp,
          pAtk,
          mAtk,
          pDef,
          mDef,
          crit: Number(stats.crit) || 10
        },
        updatedAt: serverTimestamp()
      };

      if (auth.currentUser && auth.currentUser.uid === userId) {
        const profileRef = doc(db, 'public_profiles', userId);
        await setDoc(profileRef, publicData, { merge: true });
      }
    } catch (profErr: any) {
      if (profErr?.code === 'permission-denied' || String(profErr).includes('permissions')) {
        // Permissão do Firestore requer atualização da regra da coleção public_profiles no console
        console.debug('Firebase public_profiles sync requer permissão no Firestore Rules.');
      } else {
        console.warn('Auto Public Profile Sync warning:', profErr);
      }
    }

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
    if (!userId || !profileData || !auth.currentUser) return false;
    const profileRef = doc(db, 'public_profiles', userId);
    const payload = {
      ...profileData,
      userId,
      updatedAt: serverTimestamp()
    };
    await setDoc(profileRef, payload, { merge: true });
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('Firebase public_profiles sync requer permissão no Firestore Rules.');
    } else {
      console.warn('Public Profile Sync Warning:', err);
    }
    return false;
  }
}

/**
 * Busca rankings globais no Firestore (Combat Power, Olimpíadas, Duelos, Castelos)
 * Consulta exclusivamente os perfis reais dos jogadores salvos no banco de dados.
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
      const data = d.data();
      if (data && (data.charName || data.name)) {
        results.push({ id: d.id, ...data });
      }
    });

    // Se public_profiles ainda estiver vazio, consulta a coleção users para recuperar os jogadores reais
    if (results.length === 0) {
      const usersCol = collection(db, 'users');
      const userSnap = await getDocs(usersCol);
      userSnap.forEach((uDoc) => {
        const uData = uDoc.data();
        const state = uData?.state;
        if (state && (state.name || state.charName)) {
          const stats = state.stats || {};
          const pAtk = Number(stats.atk || stats.pAtk) || 100;
          const pDef = Number(stats.def || stats.pDef) || 80;
          const mAtk = Number(stats.matk || stats.mAtk) || 50;
          const mDef = Number(stats.mdef || stats.mDef) || 60;
          const maxHp = Number(stats.maxHp || stats.hp) || 1000;
          const level = Number(state.level) || 1;
          const cp = Number(stats.combatPower) || Math.floor(level * 150 + pAtk * 1.8 + pDef * 1.5 + mAtk * 1.6 + mDef * 1.5 + maxHp * 0.12);

          results.push({
            id: uDoc.id,
            userId: uDoc.id,
            charName: state.name || state.charName || 'Hero',
            race: state.race || 'Human',
            className: state.className || state.class || 'Warrior',
            level,
            combatPower: cp,
            olympiadPoints: Number(state.olympiad?.points || state.olympiadPoints) || 1000,
            olympiadWins: Number(state.olympiad?.wins || state.olympiadWins) || 0,
            olympiadLosses: Number(state.olympiad?.losses || state.olympiadLosses) || 0,
            duelWins: Number(state.colosseum?.duelWins || state.duelWins) || 0,
            duelLosses: Number(state.colosseum?.duelLosses || state.duelLosses) || 0,
            clanName: state.clan?.name || 'Sem Clã',
            castleLord: state.clan?.castle || null,
            isHero: Boolean(state.olympiad?.isHero || state.isHero),
            statsSnapshot: {
              hp: maxHp,
              pAtk,
              mAtk,
              pDef,
              mDef,
              crit: Number(stats.crit) || 10
            }
          });
        }
      });

      if (category === 'olympiad') {
        results.sort((a, b) => (b.olympiadPoints || 0) - (a.olympiadPoints || 0));
      } else if (category === 'duels') {
        results.sort((a, b) => (b.duelWins || 0) - (a.duelWins || 0));
      } else {
        results.sort((a, b) => (b.combatPower || 0) - (a.combatPower || 0));
      }
    }

    return results;
  } catch (err) {
    console.warn('Leaderboard Fetch Notice:', err);
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

