import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  loadPlayerStateFromCloud,
  savePlayerStateToCloud,
  type User 
} from '../firebase';
import { CharacterCreation, CharacterCreationData } from './CharacterCreation';

interface LoginScreenProps {
  onEnterGame: (cloudState?: any) => void;
}

export function LoginScreen({ onEnterGame }: LoginScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cloudState, setCloudState] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showCreation, setShowCreation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const stateData = await loadPlayerStateFromCloud(currentUser.uid);
          if (stateData) {
            setCloudState(stateData);
          } else {
            setShowCreation(true);
          }
        } catch (err) {
          console.error('Error fetching cloud state on login screen:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setCloudState(null);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCharacterCreated = async (data: CharacterCreationData) => {
    const startZoneMap: Record<string, string> = {
      human: 'talkingIsland',
      elf: 'elvenForest',
      darkelf: 'darkForest',
      orc: 'orcVillage',
      dwarf: 'dwarvenMine',
      kamael: 'kamaelLair'
    };
    const startZone = startZoneMap[data.race] || 'talkingIsland';

    const startWeapon = data.className === 'mage' ? 'oak_staff' : data.className === 'artisan' ? 'bronze_mace' : data.className === 'soulbreaker' ? 'training_dagger' : 'wooden_sword';
    const startArmor = data.className === 'mage' ? 'cloth_robe' : 'leather_vest';

    const newCharState: any = {
      charName: data.charName,
      race: data.race,
      class: data.className,
      level: 1,
      xp: 0,
      sp: 0,
      gold: 1000,
      zone: startZone,
      inventory: [
        { uid: 'init_w', itemId: startWeapon, count: 1, rarity: 'common', enchant: 0 },
        { uid: 'init_a', itemId: startArmor, count: 1, rarity: 'common', enchant: 0 },
        { uid: 'init_pot', itemId: 'hp_potion_s', count: 15 }
      ],
      equipment: {
        weapon: 'init_w',
        armor: 'init_a'
      },
      lastSaveTime: Date.now()
    };

    if (user) {
      await savePlayerStateToCloud(user.uid, newCharState);
    }
    onEnterGame(newCharState);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const stateData = await loadPlayerStateFromCloud(cred.user.uid);
      if (stateData && stateData.level) {
        onEnterGame(stateData);
      } else {
        setShowCreation(true);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido.');
      } else {
        setError(err.message || 'Erro ao realizar login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowCreation(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/weak-password') {
        setError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const stateData = await loadPlayerStateFromCloud(cred.user.uid);
      if (stateData && stateData.level) {
        onEnterGame(stateData);
      } else {
        setShowCreation(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCloudState(null);
    setShowCreation(false);
  };

  const handleStartLoggedGame = () => {
    if (cloudState) {
      onEnterGame(cloudState);
    } else {
      setShowCreation(true);
    }
  };

  const handlePlayGuest = () => {
    setShowCreation(true);
  };

  if (checkingAuth) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06080f] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">Conectando a Aden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06080f] text-white flex items-center justify-center p-4">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-[#0b0f1c]/95 border border-amber-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Game Title Header */}
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-400/80 mb-1">
            Lineage Chronicle
          </p>
          <h1 
            className="font-display text-4xl font-black tracking-tight text-transparent"
            style={{
              backgroundImage: "linear-gradient(180deg,#fff 0%,#f4d58a 60%,#c9962f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            ADEN ARENA
          </h1>
          <p className="text-xs text-white/40 mt-1">Portal de Autenticação & Progresso em Nuvem</p>
        </div>

        {/* User Already Logged In State */}
        {user ? (
          <div className="space-y-4 text-center">
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4">
              <span className="text-3xl">👑</span>
              <h2 className="font-bold text-lg text-amber-300 mt-1">Bem-vindo de volta!</h2>
              <p className="text-xs text-white/70 font-semibold">{user.email}</p>
              
              {cloudState ? (
                <div className="mt-3 bg-white/5 rounded-xl p-2.5 text-xs text-left space-y-1 border border-white/10">
                  <div className="flex justify-between font-bold">
                    <span className="text-white/60">Personagem:</span>
                    <span className="text-amber-200">Nv. {cloudState.level || 1} {(cloudState.class || '').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Gold:</span>
                    <span className="text-emerald-300 font-bold">🪙 {(cloudState.gold || 0).toLocaleString()}</span>
                  </div>
                  {cloudState.tower?.highestFloor > 0 && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-white/40">Torre:</span>
                      <span className="text-purple-300 font-bold">🏰 Andar {cloudState.tower.highestFloor}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white/40">Privilégio:</span>
                    <span className={cloudState.privilegeLevel >= 1 ? "text-red-400 font-bold" : "text-slate-400 font-semibold"}>
                      {cloudState.privilegeLevel >= 1 ? "👑 Admin (Nv. 1)" : "👤 Jogador (Nv. 0)"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-200/60 mt-2">Nenhum save prévio encontrado. Um novo save será criado!</p>
              )}
            </div>

            <button
              onClick={handleStartLoggedGame}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-display font-black text-lg rounded-2xl py-3 shadow-lg shadow-amber-500/25 transition active:scale-95"
            >
              ⚔ ENTRAR NO JOGO ▶
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white font-semibold text-xs rounded-xl py-2 transition"
            >
              Trocar de Conta / Sair
            </button>
          </div>
        ) : (
          /* Login & Register Forms */
          <div>
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-5">
              <button
                className={`flex-1 py-2 text-sm font-bold border-b-2 transition ${tab === 'login' ? 'border-amber-400 text-amber-300' : 'border-transparent text-white/40 hover:text-white'}`}
                onClick={() => { setTab('login'); setError(null); }}
              >
                Entrar
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold border-b-2 transition ${tab === 'register' ? 'border-amber-400 text-amber-300' : 'border-transparent text-white/40 hover:text-white'}`}
                onClick={() => { setTab('register'); setError(null); }}
              >
                Criar Conta
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/40 text-red-300 p-2.5 rounded-xl text-xs text-center">
                {error}
              </div>
            )}

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl py-2.5 text-xs font-bold transition mb-4"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.3 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 10.03 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Entrar com o Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-2 text-[10px] text-white/30 font-bold uppercase">ou e-mail</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">E-mail</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">Senha</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
                />
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-1">Confirmar Senha</label>
                  <input 
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-display font-black text-sm rounded-xl py-3 shadow-lg shadow-amber-500/20 transition mt-2 active:scale-95"
              >
                {loading ? 'Aguarde...' : (tab === 'login' ? 'Entrar e Carregar Save' : 'Criar Conta e Jogar')}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <button
                onClick={handlePlayGuest}
                className="text-xs text-white/50 hover:text-amber-300 underline underline-offset-4 transition font-semibold"
              >
                🗡️ Jogar como Convidado (Save Local)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
