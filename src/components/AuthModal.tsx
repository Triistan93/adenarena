import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  savePlayerStateToCloud,
  loadPlayerStateFromCloud,
  deletePlayerStateFromCloud,
  type User 
} from '../firebase';

interface AuthModalProps {
  onCloudDataLoaded?: (cloudState: any) => void;
  getCurrentState?: () => any;
}

export function AuthModal({ onCloudDataLoaded, getCurrentState }: AuthModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setSyncing(true);
        try {
          const cloudState = await loadPlayerStateFromCloud(currentUser.uid);
          if (cloudState && typeof cloudState === 'object' && cloudState.level !== undefined && onCloudDataLoaded) {
            onCloudDataLoaded(cloudState);
            setMsg(`💾 Progresso de Nível ${cloudState.level} carregado da nuvem!`);
            setTimeout(() => setMsg(null), 5000);
          } else if (getCurrentState) {
            const currentState = getCurrentState();
            if (currentState && currentState.level > 1) {
              await savePlayerStateToCloud(currentUser.uid, currentState);
              setMsg('☁️ Novo progresso sincronizado com a nuvem!');
              setTimeout(() => setMsg(null), 5000);
            }
          }
        } catch (err) {
          console.error("Error auto-loading cloud save:", err);
        } finally {
          setSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Expose global window helpers for cloud reset and unload save
  useEffect(() => {
    (window as any).resetCloudSave = async () => {
      if (user) {
        await deletePlayerStateFromCloud(user.uid);
      }
    };
    (window as any).saveCloudOnUnload = async () => {
      if (user && getCurrentState) {
        const currentState = getCurrentState();
        if (currentState && currentState.level) {
          currentState.lastSaveTime = Date.now();
          await savePlayerStateToCloud(user.uid, currentState);
        }
      }
    };
  }, [user, getCurrentState]);

  // Background Auto Cloud Save every 15 seconds for logged in users
  useEffect(() => {
    if (!user || !getCurrentState) return;
    const interval = setInterval(async () => {
      try {
        const currentState = getCurrentState();
        if (currentState && currentState.level) {
          await savePlayerStateToCloud(user.uid, currentState);
        }
      } catch (err) {
        console.warn("Auto cloud save background sync notice:", err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user, getCurrentState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsOpen(false);
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
    setMsg(null);

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
      setIsOpen(false);
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
    setMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMsg('Sessão encerrada.');
    setTimeout(() => setMsg(null), 3000);
  };

  const handleManualSync = async () => {
    if (!user || !getCurrentState) return;
    setSyncing(true);
    const currentState = getCurrentState();
    const ok = await savePlayerStateToCloud(user.uid, currentState);
    setSyncing(false);
    if (ok) {
      setMsg('☁️ Jogo salvo com sucesso no Firebase!');
      setTimeout(() => setMsg(null), 4000);
    } else {
      setError('Falha ao salvar na nuvem.');
    }
  };

  const handleManualLoad = async () => {
    if (!user || !onCloudDataLoaded) return;
    setSyncing(true);
    const cloudState = await loadPlayerStateFromCloud(user.uid);
    setSyncing(false);
    if (cloudState && cloudState.level !== undefined) {
      onCloudDataLoaded(cloudState);
      setMsg(`💾 Progresso de Nível ${cloudState.level} carregado da nuvem!`);
      setTimeout(() => setMsg(null), 4000);
    } else {
      setError('Nenhum save encontrado na nuvem para este e-mail.');
      setTimeout(() => setError(null), 4000);
    }
  };

  const [showPopover, setShowPopover] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Compact Floppy Disk Button */}
      <button
        onClick={() => setShowPopover(!showPopover)}
        className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 shadow-lg shadow-black/60 transition cursor-pointer"
        title="Menu de Salvamento na Nuvem (Clique para expandir)"
      >
        <span className="text-base">💾</span>
        {user && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
      </button>

      {/* Popover Dropdown Menu */}
      {showPopover && (
        <div className="absolute right-0 mt-2 w-64 bg-[#0b0f1c] border border-amber-500/40 rounded-2xl p-3 shadow-2xl z-50 text-xs text-white space-y-2">
          {user ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                <span className="font-bold text-amber-300 truncate max-w-[170px]">{user.email?.split('@')[0]}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Conectado"></span>
              </div>
              <button
                onClick={() => { setShowPopover(false); handleManualSync(); }}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl border border-amber-500/40 font-semibold transition cursor-pointer"
              >
                <span>☁️</span>
                <span>{syncing ? 'Salvando...' : 'Salvar Progresso'}</span>
              </button>
              <button
                onClick={() => { setShowPopover(false); handleManualLoad(); }}
                disabled={syncing}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl border border-blue-500/40 font-semibold transition cursor-pointer"
              >
                <span>📥</span>
                <span>{syncing ? 'Carregando...' : 'Carregar Save'}</span>
              </button>
              <button
                onClick={() => { setShowPopover(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 font-semibold transition cursor-pointer"
              >
                <span>🚪</span>
                <span>Sair da Conta</span>
              </button>
            </>
          ) : (
            <>
              <div className="text-amber-200 font-semibold text-center py-1">
                Salvamento na Nuvem
              </div>
              <button
                onClick={() => { setShowPopover(false); setIsOpen(true); }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl shadow transition cursor-pointer"
              >
                <span>🔑</span>
                <span>Entrar / Criar Conta</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Cloud Status Toast Notification */}
      {msg && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span>{msg}</span>
        </div>
      )}

      {/* Auth Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0b0f1c] border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-4xl">🏰</span>
              <h2 className="font-display text-2xl font-black text-amber-300 mt-1">Conta Aden Arena</h2>
              <p className="text-xs text-white/50">Salve seu progresso na nuvem Firebase para não perder nada!</p>
            </div>

            {/* Auth Tabs */}
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

            {/* Google OAuth Button */}
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
              <span>Continuar com Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-2 text-[10px] text-white/30 font-bold uppercase">ou e-mail</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            {/* Login / Register Forms */}
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-1">E-mail</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
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
                  className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
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
                    className="w-full bg-slate-900/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold rounded-xl py-2.5 text-xs shadow-lg shadow-amber-500/20 transition mt-2"
              >
                {loading ? 'Aguarde...' : (tab === 'login' ? 'Entrar no Jogo' : 'Criar Conta e Salvar')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
