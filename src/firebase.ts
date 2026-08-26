import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  onSnapshot,
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

// Autenticação anônima automática para jogadores convidados
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch(() => {});
    }
  });
}

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
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

/**
 * =========================================================================
 * MERCADO GLOBAL P2P DE GIRAN — SINCRONIZAÇÃO EM TEMPO REAL NO FIRESTORE
 * =========================================================================
 */

/**
 * Salva um novo anúncio criado por um jogador no Firestore
 */
export async function createMarketListingInCloud(listing: any): Promise<boolean> {
  try {
    if (!listing || !listing.id) return false;
    const listingRef = doc(db, 'market_listings', listing.id);
    const cleanListing = JSON.parse(JSON.stringify(listing));
    cleanListing.isPlayerListing = true;
    cleanListing.updatedAt = serverTimestamp();
    await setDoc(listingRef, cleanListing);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] market_listings requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao criar anúncio no mercado:', err);
    }
    return false;
  }
}

/**
 * Busca todos os anúncios REAIS de jogadores ativos no mercado
 */
export async function fetchMarketListingsFromCloud(): Promise<any[]> {
  try {
    const listingsCol = collection(db, 'market_listings');
    const snap = await getDocs(listingsCol);
    const list: any[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (
        data && 
        data.item && 
        data.isPlayerListing !== false && 
        !String(data.id || '').startsWith('seed_') &&
        !['Merchant Katrina', 'Blacksmith Pushkin', 'Trader Woody', 'Shadow Walker Ren', 'Priestess Chloe', 'Dwarf Master Bronze'].includes(data.sellerName)
      ) {
        list.push({ id: d.id, ...data });
      }
    });
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return list;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] market_listings requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao buscar anúncios do mercado:', err);
    }
    return [];
  }
}

/**
 * Remove um anúncio comprado ou cancelado do mercado
 */
export async function deleteMarketListingInCloud(listingId: string): Promise<boolean> {
  try {
    if (!listingId) return false;
    const listingRef = doc(db, 'market_listings', listingId);
    await deleteDoc(listingRef);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] deleteMarketListing requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao deletar anúncio:', err);
    }
    return false;
  }
}

function normalizeSellerKey(sellerName: string): string {
  if (!sellerName) return 'hero_default';
  return String(sellerName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Registra a venda de um item e credita o saldo pendente para o vendedor
 */
export async function recordMarketSaleInCloud(sellerName: string, saleData: any): Promise<boolean> {
  try {
    if (!sellerName || !saleData) return false;
    const normKey = normalizeSellerKey(sellerName);
    const saleRef = doc(db, 'market_sales', normKey);
    const snap = await getDoc(saleRef);
    const existing = snap.exists() ? snap.data() : { pendingAdena: 0, pendingAdenCoins: 0, history: [] };

    const isAdena = saleData.currency === 'adena';
    const amount = Number(saleData.totalCost) || 0;

    if (isAdena) {
      existing.pendingAdena = (existing.pendingAdena || 0) + amount;
    } else {
      existing.pendingAdenCoins = (existing.pendingAdenCoins || 0) + amount;
    }

    existing.history = existing.history || [];
    existing.history.unshift({
      itemName: saleData.itemName || 'Item de Aden',
      quantity: Number(saleData.quantity) || 1,
      totalCost: amount,
      currency: saleData.currency || 'adena',
      buyer: saleData.buyer || 'Outro Jogador',
      soldAt: Date.now()
    });

    if (existing.history.length > 30) {
      existing.history = existing.history.slice(0, 30);
    }
    existing.updatedAt = serverTimestamp();

    await setDoc(saleRef, existing, { merge: true });
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] market_sales requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao registrar venda no mercado:', err);
    }
    return false;
  }
}

/**
 * Consulta os lucros e histórico de vendas de um jogador
 */
export async function fetchPlayerSalesFromCloud(sellerName: string): Promise<any> {
  try {
    if (!sellerName) return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
    const normKey = normalizeSellerKey(sellerName);
    const saleRef = doc(db, 'market_sales', normKey);
    const snap = await getDoc(saleRef);
    if (snap.exists()) {
      return snap.data();
    }
    return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] fetchPlayerSales requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao buscar vendas do jogador:', err);
    }
    return { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
  }
}

/**
 * Resgata os lucros pendentes de vendas do jogador no Firestore
 */
export async function claimPlayerSalesInCloud(sellerName: string): Promise<boolean> {
  try {
    if (!sellerName) return false;
    const normKey = normalizeSellerKey(sellerName);
    const saleRef = doc(db, 'market_sales', normKey);
    await setDoc(saleRef, { pendingAdena: 0, pendingAdenCoins: 0, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] claimPlayerSales requer permissão no Firestore Rules.');
    } else {
      console.warn('[Firebase] Erro ao limpar lucros no cloud:', err);
    }
    return false;
  }
}

/**
 * Escuta atualizações do mercado em tempo real via Firestore onSnapshot
 */
export function subscribeToMarketListings(onUpdate: (listings: any[]) => void): () => void {
  try {
    const listingsCol = collection(db, 'market_listings');
    const unsubscribe = onSnapshot(listingsCol, (snap) => {
      const list: any[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (
          data && 
          data.item && 
          data.isPlayerListing !== false && 
          !String(data.id || '').startsWith('seed_') &&
          !['Merchant Katrina', 'Blacksmith Pushkin', 'Trader Woody', 'Shadow Walker Ren', 'Priestess Chloe', 'Dwarf Master Bronze'].includes(data.sellerName)
        ) {
          list.push({ id: d.id, ...data });
        }
      });
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      onUpdate(list);
    }, (err) => {
      console.debug('[Firebase] subscribeToMarketListings notice:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.debug('[Firebase] Falha ao assinar atualizações do mercado:', err);
    return () => {};
  }
}

/**
 * Escuta atualizações de vendas e lucros do jogador em tempo real
 */
export function subscribeToPlayerSales(sellerName: string, onUpdate: (sales: any) => void): () => void {
  try {
    if (!sellerName) return () => {};
    const normKey = normalizeSellerKey(sellerName);
    const saleRef = doc(db, 'market_sales', normKey);
    const unsubscribe = onSnapshot(saleRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      } else {
        onUpdate({ pendingAdena: 0, pendingAdenCoins: 0, history: [] });
      }
    }, (err) => {
      console.debug('[Firebase] subscribeToPlayerSales notice:', err);
    });
    return unsubscribe;
  } catch (err) {
    console.debug('[Firebase] Falha ao assinar vendas do jogador:', err);
    return () => {};
  }
}

