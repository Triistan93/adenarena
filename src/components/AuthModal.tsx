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

  return (
    <div className="relative inline-block text-left">
      {/* Header Account Badge */}
      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold truncate max-w-[140px] text-amber-200">{user.email?.split('@')[0]}</span>
            <button 
              onClick={handleManualSync} 
              disabled={syncing}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded border border-amber-500/40 text-[10px] font-bold transition"
              title="Salvar progresso atual no Firebase"
            >
              {syncing ? '⌛...' : '☁️ Salvar'}
            </button>
            <button 
              onClick={handleManualLoad} 
              disabled={syncing}
              className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-500/40 text-[10px] font-bold transition"
              title="Carregar progresso salvo da nuvem"
            >
              {syncing ? '⌛...' : '📥 Carregar'}
            </button>
            <button 
              onClick={handleLogout} 
              className="px-1.5 py-0.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-[10px] transition"
              title="Sair da conta"
            >
              🚪
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl px-3 py-1.5 text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <span>☁️</span>
            <span>Entrar / Salvar na Nuvem</span>
          </button>
        )}
      </div>

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
              <span>🌐</span>
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
