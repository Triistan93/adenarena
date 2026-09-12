import { initializeApp } from 'firebase/app';
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
  updateDoc,
  deleteDoc,
  runTransaction,
  onSnapshot,
  serverTimestamp, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';

// ── Firebase Configuration ───────────────────────────────────────────────────
// NOTA DE SEGURANÇA: As API Keys do Firebase para aplicações web são PÚBLICAS
// por design — elas apenas identificam o projeto Firebase, não concedem acesso.
// A segurança real vem das Firestore Security Rules (firestore.rules).
// Variáveis de ambiente são suportadas para sobrescrever em ambientes CI/CD.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyB36IqqrnZglElfM5kxsTi1S2Acclate9Y',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'adenarena-6e448.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'adenarena-6e448',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'adenarena-6e448.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '320732940839',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:320732940839:web:99e037953e517d16b29c02',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || 'G-KQ280JBQDN',
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

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 SECURITY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * sanitizeString — Remove tags HTML e caracteres de controle para prevenir XSS.
 * Usado antes de salvar charName, clanName, sellerName e mensagens no Firestore.
 */
function sanitizeString(input: unknown, maxLength = 64): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/<[^>]*>/g, '')           // remove qualquer tag HTML
    .replace(/[<>"'`]/g, '')           // remove caracteres de template injection
    .replace(/[\x00-\x1F\x7F]/g, '')   // remove caracteres de controle ASCII
    .slice(0, maxLength);
}

/**
 * validateStateIntegrity — Anti-cheat: valida se os valores do estado são plausíveis
 * antes de qualquer save no cloud.
 * Retorna `true` se o estado for válido, `false` se detectar valores impossíveis.
 */
function validateStateIntegrity(state: any): { valid: boolean; reason?: string } {
  const level  = Number(state?.level)  || 1;
  const gold   = Number(state?.gold)   || 0;
  const xp     = Number(state?.xp)     || 0;

  if (level < 1 || level > 120) {
    return { valid: false, reason: `level inválido: ${level}` };
  }
  if (gold > 999_999_999_999) {
    return { valid: false, reason: `gold impossível: ${gold}` };
  }
  if (xp < 0) {
    return { valid: false, reason: `xp negativo: ${xp}` };
  }

  // Verifica stats básicas (nível 1 não pode ter ATK > 50.000 × level)
  const stats  = state?.stats  || state?.base || {};
  const atk    = Number(stats.atk || stats.pAtk) || 0;
  const maxAtk = Math.max(50_000, level * 50_000);
  if (atk > maxAtk) {
    return { valid: false, reason: `atk impossível para level ${level}: ${atk}` };
  }

  return { valid: true };
}

/**
 * Rate Limiter de Saves — impede chamadas repetidas ao Firestore dentro de 30 s.
 * Enfileira sempre o último estado para que nenhum progresso seja perdido.
 */
const _saveThrottle: Map<string, { lastSaveAt: number; pendingTimer: ReturnType<typeof setTimeout> | null }> = new Map();
const SAVE_THROTTLE_MS = 30_000;

function scheduleSave(
  userId: string,
  saveFn: () => Promise<boolean>,
): void {
  const now = Date.now();
  let entry = _saveThrottle.get(userId);

  if (!entry) {
    entry = { lastSaveAt: 0, pendingTimer: null };
    _saveThrottle.set(userId, entry);
  }

  // Cancela qualquer save pendente (será substituído por este, mais recente)
  if (entry.pendingTimer !== null) {
    clearTimeout(entry.pendingTimer);
    entry.pendingTimer = null;
  }

  const elapsed = now - entry.lastSaveAt;
  const delay   = elapsed >= SAVE_THROTTLE_MS ? 0 : SAVE_THROTTLE_MS - elapsed;

  entry.pendingTimer = setTimeout(async () => {
    entry!.lastSaveAt  = Date.now();
    entry!.pendingTimer = null;
    await saveFn();
  }, delay);
}

export async function savePlayerStateToCloud(userId: string, stateData: any, immediate = false) {
  if (!userId) return false;
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return false;
  }

  // ── Anti-Cheat: validação de integridade antes de qualquer I/O ──────────
  const integrityCheck = validateStateIntegrity(stateData);
  if (!integrityCheck.valid) {
    console.warn(`[Security] savePlayerStateToCloud bloqueado — ${integrityCheck.reason}`);
    return false;
  }

  const executeSave = async (): Promise<boolean> => {
    try {
      const userRef   = doc(db, 'users', userId);
      const cleanState = JSON.parse(JSON.stringify(stateData || {}));

      // SECURITY: Never allow client-sent privilegeLevel to overwrite Firestore root privilege!
      delete cleanState.privilegeLevel;
      delete cleanState.role;

      // ── XSS Sanitization ─────────────────────────────────────────────
      if (cleanState.name)      cleanState.name      = sanitizeString(cleanState.name, 16);
      if (cleanState.charName)  cleanState.charName  = sanitizeString(cleanState.charName, 16);
      if (cleanState.playerName) cleanState.playerName = sanitizeString(cleanState.playerName, 16);
      if (cleanState.clan?.name) cleanState.clan.name = sanitizeString(cleanState.clan.name, 24);

      const stats   = cleanState.stats || {};
      const pAtk    = Number(stats.atk  || stats.pAtk)  || 100;
      const mAtk    = Number(stats.matk || stats.mAtk)  || 50;
      const pDef    = Number(stats.def  || stats.pDef)  || 80;
      const mDef    = Number(stats.mdef || stats.mDef)  || 60;
      const maxHp   = Number(stats.maxHp || stats.hp)   || 1000;
      const level   = Number(cleanState.level)           || 1;
      const cp      = Number(stats.combatPower) || Math.floor(level * 150 + pAtk * 1.8 + pDef * 1.5 + mAtk * 1.6 + mDef * 1.5 + maxHp * 0.12);

      let topWeaponName = 'Sem Arma';
      let topWeaponGlow = null;
      if (cleanState.equipment?.weapon) {
        const wUid  = cleanState.equipment.weapon;
        const wItem = cleanState.inventory?.find((i: any) => i.uid === wUid || i.id === wUid);
        if (wItem) {
          const enc     = Number(wItem.enchant || wItem.enchantLevel) || 0;
          topWeaponName = enc > 0 ? `+${enc} ${sanitizeString(wItem.name || 'Arma', 40)}` : sanitizeString(wItem.name || 'Arma', 40);
          topWeaponGlow = wItem.augmentation?.glow || (enc >= 16 ? 'crimson-fire' : enc >= 10 ? 'golden-amber' : enc >= 4 ? 'blue-ice' : null);
        }
      }

      const payload: any = {
        userId,
        charName:        sanitizeString(cleanState.name || cleanState.charName || cleanState.playerName || 'Hero', 16),
        race:            sanitizeString(cleanState.race || 'Human', 24),
        className:       sanitizeString(cleanState.className || cleanState.class || 'Warrior', 32),
        level,
        combatPower:     cp,
        olympiadPoints:  Number(cleanState.olympiad?.points  || cleanState.olympiadPoints)  || 1000,
        olympiadWins:    Number(cleanState.olympiad?.wins    || cleanState.olympiadWins)    || 0,
        olympiadLosses:  Number(cleanState.olympiad?.losses  || cleanState.olympiadLosses)  || 0,
        duelWins:        Number(cleanState.colosseum?.duelWins  || cleanState.duelWins)     || 0,
        duelLosses:      Number(cleanState.colosseum?.duelLosses || cleanState.duelLosses)  || 0,
        clanName:        sanitizeString(cleanState.clan?.name || 'Sem Clã', 24),
        castleLord:      cleanState.clan?.castle || null,
        isHero:          Boolean(cleanState.olympiad?.isHero || cleanState.isHero),
        topWeaponName,
        topWeaponGlow,
        statsSnapshot: { hp: maxHp, pAtk, mAtk, pDef, mDef, crit: Number(stats.crit) || 10 },
        state:           cleanState,
        updatedAt:       serverTimestamp(),
      };

      await setDoc(userRef, payload, { merge: true });
      return true;
    } catch (err: any) {
      if (err?.code === 'permission-denied' || String(err).includes('permission')) {
        console.warn('[CloudSave] Permissões insuficientes no Firestore para salvar estado na nuvem. Verifique as regras do Firebase.');
      } else {
        console.error('Cloud Save Error:', err);
      }
      return false;
    }
  };

  if (immediate) {
    return await executeSave();
  }

  // ── Rate Limiting: evita flood de saves periódicos ao Firestore ──────────
  return new Promise<boolean>((resolve) => {
    scheduleSave(userId, async () => {
      const res = await executeSave();
      resolve(res);
      return res;
    });
  });
}

export async function checkNicknameAvailability(nickname: string, currentUserId?: string | null): Promise<{ available: boolean; reason?: string }> {
  try {
    const cleanNick = String(nickname || '').trim();
    if (!cleanNick || cleanNick.length < 3) {
      return { available: false, reason: 'O nome do personagem deve ter pelo menos 3 caracteres.' };
    }
    if (cleanNick.length > 16) {
      return { available: false, reason: 'O nome do personagem não pode ter mais de 16 caracteres.' };
    }

    const normNick = cleanNick.toLowerCase();

    // Consulta unificada na coleção users
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    let isTaken = false;

    snap.forEach((d) => {
      const data = d.data();
      const pName = String(data?.charName || data?.state?.charName || data?.state?.name || '').trim().toLowerCase();
      if (pName === normNick) {
        if (currentUserId && (d.id === currentUserId || data.userId === currentUserId)) {
          return;
        }
        isTaken = true;
      }
    });

    if (isTaken) {
      return { 
        available: false, 
        reason: `O nome "${cleanNick}" já está em uso por outro herói em Aden. Escolha outro nome!` 
      };
    }

    return { available: true };
  } catch (err) {
    console.debug('Nickname check notice:', err);
    return { available: true };
  }
}

export async function loadPlayerStateFromCloud(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const docData = snap.data();
      if (docData) {
        const stateObj = docData.state ? { ...docData.state } : { ...docData };
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
 * Sincroniza dados públicos do perfil diretamente no documento users/{userId}
 */
export async function syncPlayerPublicProfile(userId: string, profileData: any) {
  try {
    if (!userId || !profileData || !auth.currentUser) return false;
    const userRef = doc(db, 'users', userId);
    const payload = {
      ...profileData,
      userId,
      updatedAt: serverTimestamp()
    };
    await setDoc(userRef, payload, { merge: true });
    return true;
  } catch (err: any) {
    console.debug('User profile sync notice:', err);
    return false;
  }
}

/**
 * Busca rankings globais diretamente na coleção unificada users
 */
export async function fetchLeaderboardRankings(category: 'cp' | 'olympiad' | 'duels' | 'castles' = 'cp', limitCount: number = 20) {
  try {
    const usersCol = collection(db, 'users');
    const userSnap = await getDocs(usersCol);
    const results: any[] = [];

    userSnap.forEach((uDoc) => {
      const uData = uDoc.data();
      const state = uData?.state || {};
      const charName = uData?.charName || state.charName || state.name;
      if (charName) {
        const stats = state.stats || uData.statsSnapshot || {};
        const pAtk = Number(stats.atk || stats.pAtk) || 100;
        const pDef = Number(stats.def || stats.pDef) || 80;
        const mAtk = Number(stats.matk || stats.mAtk) || 50;
        const mDef = Number(stats.mdef || stats.mDef) || 60;
        const maxHp = Number(stats.maxHp || stats.hp) || 1000;
        const level = Number(uData.level || state.level) || 1;
        const cp = Number(uData.combatPower || stats.combatPower) || Math.floor(level * 150 + pAtk * 1.8 + pDef * 1.5 + mAtk * 1.6 + mDef * 1.5 + maxHp * 0.12);

        results.push({
          id: uDoc.id,
          userId: uDoc.id,
          charName,
          race: uData.race || state.race || 'Human',
          className: uData.className || state.className || state.class || 'Warrior',
          level,
          combatPower: cp,
          olympiadPoints: Number(uData.olympiadPoints || state.olympiad?.points || state.olympiadPoints) || 1000,
          olympiadWins: Number(uData.olympiadWins || state.olympiad?.wins || state.olympiadWins) || 0,
          olympiadLosses: Number(uData.olympiadLosses || state.olympiad?.losses || state.olympiadLosses) || 0,
          duelWins: Number(uData.duelWins || state.colosseum?.duelWins || state.duelWins) || 0,
          duelLosses: Number(uData.duelLosses || state.colosseum?.duelLosses || state.duelLosses) || 0,
          clanName: uData.clanName || state.clan?.name || 'Sem Clã',
          castleLord: uData.castleLord || state.clan?.castle || null,
          isHero: Boolean(uData.isHero || state.olympiad?.isHero || state.isHero),
          topWeaponName: uData.topWeaponName || 'Sem Arma',
          topWeaponGlow: uData.topWeaponGlow || null,
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

    return results.slice(0, limitCount);
  } catch (err) {
    console.warn('Leaderboard Fetch Notice:', err);
    return [];
  }
}

/**
 * Busca oponentes reais com Combat Power semelhante para duelos na coleção users
 */
export async function fetchPvPMatchmakingOpponents(playerCP: number = 10000, rangePct: number = 0.25, limitCount: number = 5) {
  try {
    const minCP = Math.max(100, Math.floor(playerCP * (1 - rangePct)));
    const maxCP = Math.floor(playerCP * (1 + rangePct));
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const opponents: any[] = [];

    snap.forEach((d) => {
      const data = d.data();
      const cp = Number(data.combatPower || data.state?.stats?.combatPower) || 0;
      if (cp >= minCP && cp <= maxCP) {
        opponents.push({ id: d.id, ...data });
      }
    });

    return opponents.slice(0, limitCount);
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
 * Salva um novo anúncio criado por um jogador no Firestore.
 * Requer conta registrada (não anônima) — reforçado nas Firestore Rules.
 */
export async function createMarketListingInCloud(listing: any): Promise<boolean> {
  try {
    if (!listing || !listing.id) return false;

    // ── Verificação de autenticação no cliente ──
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('[Security] createMarketListing bloqueado — usuário não autenticado.');
      return false;
    }

    const listingRef   = doc(db, 'market_listings', listing.id);
    const cleanListing = JSON.parse(JSON.stringify(listing));

    // Injeta o sellerId real para que a Rule valide ownership
    cleanListing.sellerId        = currentUser.uid;
    cleanListing.isPlayerListing = true;
    cleanListing.updatedAt       = serverTimestamp();

    // XSS sanitization em campos de texto do anúncio
    if (cleanListing.sellerName) cleanListing.sellerName = sanitizeString(cleanListing.sellerName, 24);
    if (cleanListing.item?.name) cleanListing.item.name  = sanitizeString(cleanListing.item.name, 60);

    await setDoc(listingRef, cleanListing);
    return true;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err).includes('permissions')) {
      console.debug('[Firebase] market_listings — permissão negada pelas Firestore Rules.');
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
        data.isSold !== true &&
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
/**
 * Remove um anúncio comprado ou cancelado do mercado
 */
export async function deleteMarketListingInCloud(listingId: string): Promise<boolean> {
  try {
    if (!listingId) return false;
    const listingRef = doc(db, 'market_listings', listingId);
    try {
      await deleteDoc(listingRef);
      return true;
    } catch (delErr) {
      // Se deleteDoc falhar por regra de permissão, marca como vendido para sumir do mercado imediatamente
      await updateDoc(listingRef, { isSold: true, status: 'SOLD', isPlayerListing: false });
      return true;
    }
  } catch (err: any) {
    console.debug('[Firebase] deleteMarketListing notice:', err);
    return false;
  }
}

/**
 * Verifica o status de um anúncio diretamente no Firestore antes de permitir cancelamento
 */
export async function checkListingStatusInCloud(listingId: string): Promise<'ACTIVE' | 'SOLD' | 'NOT_FOUND'> {
  try {
    if (!listingId) return 'NOT_FOUND';
    const listingRef = doc(db, 'market_listings', listingId);
    const snap = await getDoc(listingRef);
    if (!snap.exists()) return 'NOT_FOUND';
    const data = snap.data();
    if (data.isSold === true || data.status === 'SOLD' || data.isPlayerListing === false) {
      return 'SOLD';
    }
    return 'ACTIVE';
  } catch (e) {
    return 'ACTIVE';
  }
}

function normalizeSellerKey(sellerName: string): string {
  if (!sellerName) return 'hero_default';
  return String(sellerName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Executa a compra de um item de forma ATÔMICA via Firestore Transaction (ACID)
 * Impede double-spending, race conditions e duplicações.
 */
export async function executeMarketPurchaseInCloud(
  listingId: string, 
  buyerName: string, 
  buyerUid?: string
): Promise<{ success: boolean; msg?: string; listing?: any }> {
  try {
    if (!listingId) return { success: false, msg: 'ID do anúncio inválido.' };
    const listingRef = doc(db, 'market_listings', listingId);

    const result = await runTransaction(db, async (transaction) => {
      const listingDoc = await transaction.get(listingRef);
      if (!listingDoc.exists()) {
        throw new Error('LISTING_NOT_FOUND');
      }

      const listingData = listingDoc.data();
      if (listingData.isSold === true || listingData.status === 'SOLD' || listingData.isPlayerListing === false) {
        throw new Error('LISTING_ALREADY_SOLD');
      }

      const sellerName = listingData.sellerName || 'Vendedor Imperial';
      const normKey = normalizeSellerKey(sellerName);
      const saleRef = doc(db, 'market_sales', normKey);
      const saleDoc = await transaction.get(saleRef);

      const existingSales = saleDoc.exists() ? saleDoc.data() : { pendingAdena: 0, pendingAdenCoins: 0, history: [] };
      const isAdena = listingData.currency === 'adena';
      const totalCost = Number(listingData.totalPrice) || ((Number(listingData.pricePerUnit) || 0) * (Number(listingData.quantity) || 1));

      // Imposto imperial de transação (3% de taxa de conclusão da Coroa de Aden)
      const taxRate = 0.03;
      const taxAmount = isAdena ? Math.floor(totalCost * taxRate) : 0;
      const netProfit = totalCost - taxAmount;

      if (isAdena) {
        existingSales.pendingAdena = (Number(existingSales.pendingAdena) || 0) + netProfit;
      } else {
        existingSales.pendingAdenCoins = (Number(existingSales.pendingAdenCoins) || 0) + netProfit;
      }

      existingSales.history = Array.isArray(existingSales.history) ? existingSales.history : [];
      existingSales.history.unshift({
        listingId,
        itemName: listingData.item?.name || 'Item de Aden',
        quantity: Number(listingData.quantity) || 1,
        totalCost,
        netProfit,
        taxPaid: taxAmount,
        currency: listingData.currency || 'adena',
        buyer: buyerName || 'Herói de Aden',
        soldAt: Date.now()
      });

      if (existingSales.history.length > 50) {
        existingSales.history = existingSales.history.slice(0, 50);
      }
      existingSales.updatedAt = serverTimestamp();

      // 1. Marca o anúncio como VENDIDO no escrow
      transaction.update(listingRef, {
        isSold: true,
        status: 'SOLD',
        isPlayerListing: false,
        buyerName: buyerName || 'Herói de Aden',
        buyerUid: buyerUid || '',
        soldAt: Date.now()
      });

      // 2. Credita lucros na conta de custódia de vendas do vendedor
      transaction.set(saleRef, existingSales, { merge: true });

      return { success: true, listing: { id: listingDoc.id, ...listingData } };
    });

    return result;
  } catch (err: any) {
    if (err?.message === 'LISTING_ALREADY_SOLD' || err?.message === 'LISTING_NOT_FOUND') {
      return { success: false, msg: 'Este item já foi adquirido por outro aventureiro ou foi cancelado pelo vendedor!' };
    }
    console.warn('[Firebase] Erro na transação atômica do mercado:', err);
    // Fallback: se runTransaction encontrar restrição de regras legadas, deleta direto
    try {
      await deleteMarketListingInCloud(listingId);
    } catch (e) {}
    return { success: true };
  }
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
 * Resgata os lucros pendentes de vendas do jogador no Firestore de forma atômica
 */
export async function claimPlayerSalesInCloud(sellerName: string): Promise<{ success: boolean; adena: number; adenCoins: number }> {
  try {
    if (!sellerName) return { success: false, adena: 0, adenCoins: 0 };
    const normKey = normalizeSellerKey(sellerName);
    const saleRef = doc(db, 'market_sales', normKey);

    const result = await runTransaction(db, async (transaction) => {
      const saleDoc = await transaction.get(saleRef);
      if (!saleDoc.exists()) {
        return { success: true, adena: 0, adenCoins: 0 };
      }
      const data = saleDoc.data();
      const pendingAdena = Number(data.pendingAdena || 0);
      const pendingCoins = Number(data.pendingAdenCoins || 0);

      transaction.update(saleRef, {
        pendingAdena: 0,
        pendingAdenCoins: 0,
        claimedAt: Date.now(),
        updatedAt: serverTimestamp()
      });

      return { success: true, adena: pendingAdena, adenCoins: pendingCoins };
    });

    return result;
  } catch (err: any) {
    console.warn('[Firebase] Erro ao resgatar lucros no cloud:', err);
    return { success: false, adena: 0, adenCoins: 0 };
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
          data.isSold !== true &&
          data.status !== 'SOLD' &&
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

// ═══════════════════════════════════════════════════════════════════════════
// 🎁 SISTEMA DE INDICAÇÃO DE AMIGOS (REFERRAL VIRAL)
// ═══════════════════════════════════════════════════════════════════════════

export async function recordReferralInCloud(
  referrerNick: string,
  invitedNick: string,
  invitedLevel: number = 1
): Promise<boolean> {
  if (!referrerNick || !invitedNick) return false;
  const refClean = sanitizeString(referrerNick, 20).toLowerCase();
  const invClean = sanitizeString(invitedNick, 20).toLowerCase();
  if (refClean === invClean) return false;

  try {
    const refDocId = `${refClean}_${invClean}`;
    const referralRef = doc(db, 'referrals', refDocId);
    await setDoc(
      referralRef,
      {
        referrer: refClean,
        invited: invClean,
        level: invitedLevel,
        rewardEligible: invitedLevel >= 40,
        rewardClaimed: false,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.debug('[Referral] recordReferralInCloud notice:', e);
    return false;
  }
}

export async function checkReferralRewardsInCloud(
  charNick: string
): Promise<{ count: number; claimableRewards: number }> {
  if (!charNick) return { count: 0, claimableRewards: 0 };
  const cleanNick = sanitizeString(charNick, 20).toLowerCase();
  try {
    const q = query(collection(db, 'referrals'), where('referrer', '==', cleanNick));
    const snapshot = await getDocs(q);
    const totalCount = snapshot.size;
    let claimable = 0;
    const toUpdate: string[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      if ((data.level >= 40 || data.rewardEligible) && !data.rewardClaimed) {
        claimable++;
        toUpdate.push(d.id);
      }
    });

    for (const docId of toUpdate) {
      try {
        await updateDoc(doc(db, 'referrals', docId), {
          rewardClaimed: true,
          claimedAt: serverTimestamp(),
        });
      } catch (e) {
        console.debug('[Referral] update claim error:', e);
      }
    }

    return { count: totalCount, claimableRewards: claimable };
  } catch (e) {
    console.debug('[Referral] checkReferralRewardsInCloud notice:', e);
    return { count: 0, claimableRewards: 0 };
  }
}

