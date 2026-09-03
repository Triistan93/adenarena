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
import { getStarterKit } from '../data/starterKits';

interface LoginScreenProps {
  onEnterGame: (cloudState?: any) => void;
}

// Helper para selecionar o retrato da classe/raça do herói
function getHeroAvatar(state: any): string {
  if (!state) return '/img/elfswsF.png';
  const race = (state.race || 'elf').toLowerCase();
  const cls = (state.class || 'elfFighter').toLowerCase();
  const gender = (state.gender || 'F').toUpperCase();

  if (race === 'elf' || cls.includes('elf')) {
    return gender === 'F' ? '/img/elfswsF.png' : '/img/elfwswM.png';
  }
  if (race === 'darkelf' || cls.includes('darkelf')) {
    return gender === 'F' ? '/img/darkelfskF.png' : '/img/darkelfskM.png';
  }
  if (race === 'orc' || cls.includes('orc')) {
    return gender === 'F' ? '/img/orcmageF.png' : '/img/orcmageM.png';
  }
  if (race === 'dwarf' || cls.includes('dwarf')) {
    return gender === 'F' ? '/img/f_bountyhunter.jpg' : '/img/m_warsmith.jpg';
  }
  if (race === 'kamael' || cls.includes('kamael')) {
    return gender === 'F' ? '/img/f_soultaker.jpg' : '/img/m_berserker.jpg';
  }
  if (cls.includes('mage') || cls.includes('wizard') || cls.includes('cleric')) {
    return gender === 'F' ? '/img/f_humanwizard.jpg' : '/img/m_humanwizard.jpg';
  }
  return gender === 'F' ? '/img/f_humanwarrior.jpg' : '/img/m_humanfighter.jpg';
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
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; size: number; delay: number }[]>([]);

  // Gerar partículas mágicas flutuantes
  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  // Monitorar autenticação no Firebase e carregar os dados reais do jogador em nuvem
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
    const kit = getStarterKit(data.race, data.className);

    const inventoryItems: any[] = [
      { uid: 'init_w', itemId: kit.weapon, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_h', itemId: kit.helmet, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_a', itemId: kit.armor, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_l', itemId: kit.legs, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_g', itemId: kit.gloves, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_b', itemId: kit.boots, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_pot', itemId: kit.potions.itemId, count: kit.potions.count },
      { uid: 'init_shots', itemId: kit.shotType, count: kit.shotsCount }
    ];

    const equipmentMap: Record<string, string | null> = {
      weapon: 'init_w',
      weapon2: null,
      helmet: 'init_h',
      armor: 'init_a',
      legs: 'init_l',
      gloves: 'init_g',
      boots: 'init_b',
      shield: null
    };

    if (kit.shield) {
      inventoryItems.push({ uid: 'init_sh', itemId: kit.shield, count: 1, rarity: 'common', enchant: 0 });
      equipmentMap.shield = 'init_sh';
    }

    const newCharState: any = {
      charName: data.charName,
      heroName: data.charName,
      playerName: data.charName,
      name: data.charName,
      race: data.race,
      class: data.className,
      gender: data.gender || 'F',
      level: 1,
      xp: 0,
      sp: 10,
      gold: 2000,
      zone: 'talkingIsland',
      inventory: inventoryItems,
      equipment: equipmentMap,
      skills: {
        [kit.starterSkill]: 1
      },
      selectedSkill: kit.starterSkill,
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
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-white">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 blur-sm"
          style={{ backgroundImage: `url('/images/castle-bg.jpg')` }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3 p-6 rounded-2xl bg-amber-950/80 border-2 border-amber-600 shadow-2xl backdrop-blur-md">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-serif text-sm font-bold uppercase tracking-widest text-amber-300">Conectando a Aden...</p>
        </div>
      </div>
    );
  }

  if (showCreation) {
    return (
      <CharacterCreation
        onComplete={handleCharacterCreated}
        onCancel={cloudState ? () => setShowCreation(false) : undefined}
      />
    );
  }

  // Dados reais do herói extraídos diretamente do Firebase
  const heroName = cloudState?.charName || cloudState?.heroName || cloudState?.name || 'Aventureiro';
  const heroLevel = cloudState?.level || 1;
  const heroClass = (cloudState?.class || 'FIGHTER').toUpperCase();
  const heroGold = cloudState?.gold !== undefined ? cloudState.gold : 0;
  const isPrivileged = (cloudState?.privilegeLevel || 0) >= 1;
  const highestFloor = cloudState?.tower?.highestFloor || 0;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden select-none p-3 sm:p-4">
      {/* Imagem de Fundo (Castelo de Aden em Alta Definição) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/castle-bg.jpg')`,
        }}
      />
      
      {/* Overlay com gradiente místico */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950/55 via-blue-950/35 to-indigo-950/55" />

      {/* Partículas mágicas flutuantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="magic-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              background: p.id % 2 === 0 
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.9), transparent)' 
                : 'radial-gradient(circle, rgba(251, 191, 36, 0.9), transparent)',
            }}
          />
        ))}
      </div>

      {/* Container Principal do Login com ornamentos laterais */}
      <div className="relative z-10 w-full max-w-md my-auto">
        
        {/* Ornamento esquerdo */}
        <div className="side-ornament -left-10 hidden md:flex">
          {['◆', '⚔', '◈', '✦', '◆', '⚔'].map((icon, i) => (
            <div 
              key={i}
              className={`text-2xl animate-twinkle ${
                i % 3 === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 
                i % 3 === 1 ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 
                'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              }`}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Ornamento direito */}
        <div className="side-ornament -right-10 hidden md:flex">
          {['◆', '⚔', '◈', '✦', '◆', '⚔'].map((icon, i) => (
            <div 
              key={i}
              className={`text-2xl animate-twinkle ${
                i % 3 === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 
                i % 3 === 1 ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]' : 
                'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]'
              }`}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Card Principal */}
        <div className="bg-gradient-to-b from-[#fdfbf5] via-[#f7f1e3] to-[#ebdcc2] rounded-xl shadow-2xl border-4 border-amber-600 overflow-hidden relative">
          
          {/* Brilho no topo do card */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-shimmer" />

          {/* Cabeçalho decorativo superior */}
          <div className="bg-gradient-to-r from-[#5a3615] via-[#94551a] to-[#5a3615] p-4 text-center relative overflow-hidden border-b-2 border-amber-800">
            {/* Efeito de brilho contínuo */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/25 to-transparent animate-shimmer" />
            
            <div className="relative z-10">
              <div className="text-amber-200 text-[10px] sm:text-xs font-bold tracking-[0.35em] mb-1 animate-pulse-glow inline-block uppercase">
                Lineage Chronicle
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-md leading-tight" style={{ fontFamily: 'serif' }}>
                ADEN ARENA
              </h1>
              <div className="text-amber-100/90 text-[10px] sm:text-[11px] mt-1 font-medium">
                Portal de Autenticação & Progresso em Nuvem
              </div>
            </div>
          </div>

          {/* Separador decorativo */}
          <div className="flex items-center justify-center py-1.5 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent">
            <div className="h-px bg-amber-600 w-16"></div>
            <div className="mx-2 text-amber-600 text-sm animate-twinkle">✦</div>
            <div className="h-px bg-amber-600 w-16"></div>
          </div>

          {/* Conteúdo Central */}
          <div className="p-4 sm:p-6">
            
            {user ? (
              /* =============================================================== */
              /* ESTADO 1: USUÁRIO LOGADO - DADOS REAIS DO FIREBASE               */
              /* =============================================================== */
              <div className="space-y-4">
                <div className="text-center">
                  <span className="text-3xl filter drop-shadow">👑</span>
                  <h2 className="text-xl font-bold text-gray-900 mt-1 leading-tight" style={{ fontFamily: 'serif' }}>
                    BEM-VINDO DE VOLTA!
                  </h2>
                  <p className="text-xs text-amber-900/70 font-semibold truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Card de Detalhes Reais do Herói Salvo no Firebase */}
                <div className="bg-[#1a1410] border-2 border-amber-600/60 rounded-xl p-3 shadow-inner flex items-center gap-3 text-left">
                  {/* Retrato do Herói */}
                  <div className="w-14 h-14 rounded-lg border border-amber-500/50 bg-black/60 shrink-0 overflow-hidden shadow flex items-center justify-center p-0.5">
                    <img 
                      src={getHeroAvatar(cloudState)} 
                      alt="Avatar do Herói" 
                      className="w-full h-full object-cover object-top rounded"
                    />
                  </div>

                  {/* Informações da Conta no Firebase */}
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="truncate">
                      <span className="text-amber-200/60 font-medium">Herói: </span>
                      <span className="text-amber-300 font-bold">
                        {heroName} · Nv. {heroLevel} ({heroClass})
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <div>
                        <span className="text-amber-200/60">Gold: </span>
                        <span className="text-emerald-400 font-bold font-mono">
                          🪙 {heroGold.toLocaleString()}
                        </span>
                      </div>
                      {highestFloor > 0 && (
                        <div>
                          <span className="text-amber-200/60">Torre: </span>
                          <span className="text-purple-300 font-bold">
                            🏰 Andar {highestFloor}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px]">
                      <span className="text-amber-200/60">Privilégio: </span>
                      <span className={isPrivileged ? "text-amber-400 font-bold" : "text-purple-300 font-semibold"}>
                        {isPrivileged ? "👑 Admin (Nv. 1)" : "👤 Jogador (Nv. 0)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botão Entrar no Jogo com Shimmer Metálico */}
                <button
                  onClick={handleStartLoggedGame}
                  className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-gray-950 font-black py-3.5 px-6 rounded-lg shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all duration-200 border-2 border-amber-800 relative overflow-hidden group cursor-pointer"
                  style={{ fontFamily: 'serif' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="text-lg relative z-10 flex items-center justify-center gap-2 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    ⚔️ ENTRAR NO JOGO ▶
                  </span>
                </button>

                {/* Botão Trocar de Conta / Sair */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-gray-300 hover:text-white font-semibold py-2.5 px-6 rounded-lg shadow transition-all duration-200 text-xs border border-gray-700 cursor-pointer"
                >
                  Trocar de Conta / Sair
                </button>
              </div>
            ) : (
              /* =============================================================== */
              /* ESTADO 2: NÃO LOGADO (ABAS, GOOGLE LOGIN, EMAIL/SENHA)           */
              /* =============================================================== */
              <div className="space-y-3.5">
                {/* Abas Entrar / Criar Conta */}
                <div className="flex border-b-2 border-amber-600/30 mb-2">
                  <button
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition ${tab === 'login' ? 'border-amber-700 text-amber-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    onClick={() => { setTab('login'); setError(null); }}
                  >
                    Entrar
                  </button>
                  <button
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-bold border-b-2 transition ${tab === 'register' ? 'border-amber-700 text-amber-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    onClick={() => { setTab('register'); setError(null); }}
                  >
                    Criar Conta
                  </button>
                </div>

                {error && (
                  <div className="bg-red-950/80 border border-red-700 text-red-200 p-2.5 rounded-lg text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Botão Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white hover:bg-amber-50 text-gray-800 font-bold py-2.5 px-4 rounded-lg shadow border-2 border-amber-600/50 flex items-center justify-center gap-2 text-xs transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.3 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 10.03 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Entrar com o Google</span>
                </button>

                {/* Separador */}
                <div className="flex items-center justify-center py-0.5">
                  <div className="h-px bg-amber-600/30 flex-1"></div>
                  <div className="mx-3 text-amber-800/60 text-[10px] font-bold uppercase">ou e-mail</div>
                  <div className="h-px bg-amber-600/30 flex-1"></div>
                </div>

                {/* Formulário de Email e Senha */}
                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-2.5 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      📧 E-mail
                    </label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-3.5 py-2 border-2 border-amber-600 rounded-md bg-white focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-500 transition-all text-gray-900 placeholder-gray-400 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      🔒 Senha
                    </label>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 border-2 border-amber-600 rounded-md bg-white focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-500 transition-all text-gray-900 placeholder-gray-400 text-xs"
                    />
                  </div>

                  {tab === 'register' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        🔒 Confirmar Senha
                      </label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 border-2 border-amber-600 rounded-md bg-white focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-500 transition-all text-gray-900 placeholder-gray-400 text-xs"
                      />
                    </div>
                  )}

                  {/* Botão de Ação com Brilho Shimmer */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-700 hover:via-yellow-600 hover:to-amber-700 text-gray-950 font-black py-3 px-6 rounded-lg shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all duration-200 border-2 border-amber-800 disabled:opacity-50 relative overflow-hidden group cursor-pointer mt-3"
                    style={{ fontFamily: 'serif' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    {loading ? (
                      <span className="flex items-center justify-center relative z-10 text-xs sm:text-sm">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        PROCESSANDO...
                      </span>
                    ) : (
                      <span className="text-sm sm:text-base relative z-10">
                        {tab === 'login' ? '⚔️ ENTRAR EM ADEN ▶' : '⚔️ CRIAR CONTA E JOGAR ▶'}
                      </span>
                    )}
                  </button>
                </form>

                {/* Opção Convidado */}
                <div className="pt-2 text-center border-t border-amber-600/20">
                  <button
                    onClick={handlePlayGuest}
                    className="text-xs text-amber-900 hover:text-amber-950 underline underline-offset-4 transition font-bold cursor-pointer"
                  >
                    🗡️ Jogar como Convidado (Save Local)
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Rodapé decorativo */}
          <div className="bg-gradient-to-r from-[#5a3615] via-[#94551a] to-[#5a3615] p-2.5 text-center relative overflow-hidden border-t-2 border-amber-800">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
            <div className="text-amber-200/90 text-[10px] relative z-10 font-serif">
              © 2024 Lineage Chronicle - Aden Arena
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
