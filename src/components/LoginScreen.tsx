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

// Helper para selecionar o retrato visual do herói (elfa ranger com arco ou classe atual)
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
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center text-white bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/img/login/aden_login_clean_bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0b0c16]/95 border border-amber-500/40 shadow-2xl login-portal-glow">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-amber-300">Conectando a Aden...</p>
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

  // Dados do herói (especificações do prompt)
  const heroName = cloudState?.charName || 'Aethelgard';
  const heroLevel = cloudState?.level || 12;
  const heroClass = (cloudState?.class || 'ELFFIGHTER').toUpperCase();
  const heroGold = cloudState?.gold !== undefined ? cloudState.gold : 154022;
  const isPrivileged = (cloudState?.privilegeLevel || 0) >= 1;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 select-none bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/img/login/aden_login_clean_bg.jpg')" }}
    >
      {/* Vinheta Noturna Suave para Foco no Portal */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04060c]/70 via-transparent to-[#070812]/50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_35%,rgba(3,5,10,0.65)_100%)]" />

      {/* Manopla de Armadura de Metal no Canto Inferior Direito (Conforme Prompt) */}
      <div className="fixed bottom-4 sm:bottom-6 right-6 sm:right-10 pointer-events-none z-40 hidden sm:block drop-shadow-[0_4px_14px_rgba(0,0,0,0.9)] opacity-90">
        <img 
          src="/img/login/gauntlet_cursor.png" 
          alt="Manopla de Metal" 
          className="w-12 sm:w-14 h-auto object-contain"
        />
      </div>

      {/* ========================================================================= */}
      {/* PORTAL MÍSTICO COM RUNAS REATIVAS, BRASÕES E PERGAMINHO NATIVO           */}
      {/* ========================================================================= */}
      <div className="relative w-full max-w-[480px] my-auto login-portal-glow rounded-3xl z-10">
        
        {/* Brasão Imperial Superior Alado com Cristal Sagrado (Flutuante & Reativo) */}
        <div className="absolute -top-11 sm:-top-12 left-1/2 -translate-x-1/2 w-44 sm:w-48 z-30 pointer-events-none crest-reactive">
          <img 
            src="/img/login/top_crest_clean.png" 
            alt="Brasão Real de Aden" 
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Cristal Inferior de Ametista (Brilho e Pulsação Mágica Reativa) */}
        <div className="absolute -bottom-9 sm:-bottom-10 left-1/2 -translate-x-1/2 w-32 sm:w-36 z-30 pointer-events-none crystal-reactive">
          <img 
            src="/img/login/bottom_gem_clean.png" 
            alt="Gema Sagrada" 
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Estrutura de Pedra Rúnica Forjada em Metal e Ouro */}
        <div className="relative flex rounded-2xl border-2 border-[#54402a] bg-[#110e15] shadow-2xl overflow-hidden">
          
          {/* Pilar Rúnico Esquerdo (Runas Reativas com Efeitos Visuais ao Passar o Mouse) */}
          <div className="w-8 sm:w-9 shrink-0 bg-gradient-to-b from-[#1b1523] via-[#241c2e] to-[#130f19] border-r border-[#4c3a28] flex flex-col items-center justify-around py-8 text-xs select-none shadow-inner">
            <span className="text-sky-400 drop-shadow-[0_0_10px_#38bdf8] font-serif font-bold text-sm crystal-reactive">💠</span>
            <span className="text-amber-400 drop-shadow-[0_0_6px_#f59e0b] font-serif font-bold rune-interactive animate-[runeShimmer_3s_infinite_ease-in-out]">ᚱ</span>
            <span className="text-purple-400 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive">ᛉ</span>
            <span className="text-sky-300 drop-shadow-[0_0_6px_#38bdf8] font-serif font-bold rune-interactive animate-[runeShimmer_4s_infinite_ease-in-out]">ᚲ</span>
            <span className="text-amber-300 drop-shadow-[0_0_6px_#f59e0b] font-serif font-bold rune-interactive">ᛗ</span>
            <span className="text-purple-300 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive animate-[runeShimmer_3.5s_infinite_ease-in-out]">ᛋ</span>
            <span className="text-sky-400 drop-shadow-[0_0_6px_#38bdf8] font-serif font-bold rune-interactive">ᚦ</span>
            <span className="text-amber-400 drop-shadow-[0_0_6px_#f59e0b] font-serif font-bold rune-interactive">ᚨ</span>
            <span className="text-purple-400 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive animate-[runeShimmer_4.5s_infinite_ease-in-out]">ᛏ</span>
            <span className="text-amber-400 drop-shadow-[0_0_10px_#f59e0b] font-serif font-bold text-sm crystal-reactive">ᛟ</span>
          </div>

          {/* Painel Interno de Pergaminho Envelhecido */}
          <div className="parchment-scroll flex-1 px-4 sm:px-6 py-8 sm:py-9 relative text-center">
            
            {/* Linha de Ouro Fina Interna */}
            <div className="pointer-events-none absolute inset-2 sm:inset-2.5 border border-[#8a6833]/35 rounded-lg"></div>

            {/* Cabeçalho do Jogo */}
            <div className="mb-3.5 sm:mb-4">
              <p className="font-display text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#5e3e1c] drop-shadow-sm">
                Lineage Chronicle
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-black tracking-wider gold-emboss-title leading-tight my-0.5">
                ADEN ARENA
              </h1>
              <p className="text-[10px] sm:text-[11px] text-[#664621] font-semibold tracking-wide">
                Portal de Autenticação & Progresso em Nuvem
              </p>

              {/* Divisor Ornamental */}
              <div className="flex items-center justify-center gap-2 mt-2 opacity-60">
                <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#755026]"></div>
                <span className="text-[9px] text-[#755026]">✦</span>
                <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#755026]"></div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* ESTADO 1: USUÁRIO JÁ CONECTADO (PERFIL EM NUVEM)                  */}
            {/* ================================================================= */}
            {user ? (
              <div className="space-y-3 sm:space-y-3.5">
                
                {/* Ícone de Coroa Dourada & Saudação */}
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.6)] animate-bounce duration-1000">
                    👑
                  </span>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#251508] mt-0.5 leading-tight">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-xs font-semibold text-[#543b27] truncate max-w-full">
                    {user.email}
                  </p>
                </div>

                {/* Card de Detalhes do Personagem (Conforme Especificação Exata do Prompt) */}
                <div className="bg-[#181410]/95 border border-[#8e6e38] rounded-xl p-3 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),0_2px_6px_rgba(0,0,0,0.3)] flex items-center gap-3">
                  
                  {/* Retrato da Elfa Ranger com Arco */}
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-lg border border-[#a18146] bg-black/80 shrink-0 overflow-hidden shadow-inner flex items-center justify-center p-0.5">
                    <img 
                      src={getHeroAvatar(cloudState)} 
                      alt="Elfa Ranger" 
                      className="w-full h-full object-cover object-top rounded"
                    />
                  </div>

                  {/* Detalhes Formatados com Cores Específicas do Prompt */}
                  <div className="flex-1 min-w-0 text-[11px] sm:text-xs space-y-0.5">
                    <div className="truncate">
                      <span className="text-[#a89278] font-semibold">Herói: </span>
                      <span className="text-[#4ade80] font-bold">
                        {heroName} - Nv. {heroLevel} ({heroClass})
                      </span>
                    </div>

                    <div>
                      <span className="text-[#a89278] font-semibold">Gold: </span>
                      <span className="text-[#4ade80] font-bold font-mono">
                        🪙 {heroGold.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[#a89278] font-semibold">Privilégio: </span>
                      <span className={isPrivileged ? "text-amber-400 font-bold" : "text-[#c084fc] font-bold"}>
                        {isPrivileged ? "👑 Admin (Nv. 1)" : "👤 Jogador (Nv. 0)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL GILDED (COM ESPADAS CRUZADAS E CRISTAIS ROXOS) */}
                <button
                  onClick={handleStartLoggedGame}
                  className="w-full login-gold-btn text-[#1c1002] font-display font-black text-base sm:text-lg rounded-xl py-2.5 sm:py-3 px-2 flex items-center justify-between transition-all duration-150 active:scale-[0.98] group cursor-pointer shadow-lg relative overflow-hidden"
                >
                  <img 
                    src="/img/login/swords_left_clean.png" 
                    alt="Espadas Cruzadas" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 filter drop-shadow group-hover:rotate-6 transition-transform" 
                  />
                  <span className="flex-1 text-center tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    ✕ ENTRAR NO JOGO ▶
                  </span>
                  <img 
                    src="/img/login/swords_right_clean.png" 
                    alt="Espadas Cruzadas" 
                    className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 filter drop-shadow group-hover:-rotate-6 transition-transform" 
                  />
                </button>

                {/* BOTÕES SECUNDÁRIOS ESCUROS */}
                <div className="space-y-1.5 sm:space-y-2">
                  <button
                    onClick={() => setShowCreation(true)}
                    className="w-full login-stone-btn text-amber-200 font-display font-semibold text-xs sm:text-sm rounded-xl py-2 transition active:scale-[0.98] cursor-pointer"
                  >
                    ✨ Criar Novo Personagem / Recustomizar ✨
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-[#16120e]/85 hover:bg-[#251d16] border border-[#52412b]/70 text-[#a38b70] hover:text-[#f0e4d6] font-semibold text-xs rounded-xl py-1.5 transition cursor-pointer"
                  >
                    Trocar de Conta / Sair
                  </button>
                </div>
              </div>
            ) : (
              /* ================================================================= */
              /* ESTADO 2: FORMULÁRIO DE LOGIN / CADASTRO (NÃO CONECTADO)          */
              /* ================================================================= */
              <div className="space-y-2.5">
                {/* Abas Entrar / Criar Conta */}
                <div className="flex border-b border-[#73522c]/40 mb-3">
                  <button
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-display font-bold border-b-2 transition ${tab === 'login' ? 'border-[#8f6e35] text-[#2a1705]' : 'border-transparent text-[#7c5f3f] hover:text-[#2a1705]'}`}
                    onClick={() => { setTab('login'); setError(null); }}
                  >
                    Entrar
                  </button>
                  <button
                    className={`flex-1 py-1.5 text-xs sm:text-sm font-display font-bold border-b-2 transition ${tab === 'register' ? 'border-[#8f6e35] text-[#2a1705]' : 'border-transparent text-[#7c5f3f] hover:text-[#2a1705]'}`}
                    onClick={() => { setTab('register'); setError(null); }}
                  >
                    Criar Conta
                  </button>
                </div>

                {error && (
                  <div className="bg-red-950/85 border border-red-700/60 text-red-200 p-2 rounded-lg text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Botão Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full login-stone-btn text-[#eddcc3] font-semibold flex items-center justify-center gap-2 rounded-xl py-2 text-xs transition cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.3 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 10.03 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Entrar com o Google</span>
                </button>

                <div className="flex items-center my-1.5 opacity-50">
                  <div className="flex-1 border-t border-[#73522c]"></div>
                  <span className="px-2 text-[10px] text-[#543b27] font-bold uppercase">ou e-mail</span>
                  <div className="flex-1 border-t border-[#73522c]"></div>
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-2 text-left">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#543b27] mb-0.5">E-mail</label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-3 py-2 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#543b27] mb-0.5">Senha</label>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-3 py-2 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {tab === 'register' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[#543b27] mb-0.5">Confirmar Senha</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar senha"
                        className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-3 py-2 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full login-gold-btn text-[#1c1002] font-display font-black text-sm sm:text-base rounded-xl py-2.5 sm:py-3 px-2 flex items-center justify-between transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-lg mt-2"
                  >
                    <img 
                      src="/img/login/swords_left_clean.png" 
                      alt="Espadas" 
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 filter drop-shadow" 
                    />
                    <span className="flex-1 text-center tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                      {loading ? 'Aguarde...' : (tab === 'login' ? 'ENTRAR EM ADEN ▶' : 'CRIAR CONTA E JOGAR ▶')}
                    </span>
                    <img 
                      src="/img/login/swords_right_clean.png" 
                      alt="Espadas" 
                      className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 filter drop-shadow" 
                    />
                  </button>
                </form>

                {/* Opção Convidado */}
                <div className="pt-2 text-center">
                  <button
                    onClick={handlePlayGuest}
                    className="text-[11px] text-[#634726] hover:text-[#251508] underline underline-offset-4 transition font-bold cursor-pointer"
                  >
                    🗡️ Jogar como Convidado (Save Local)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pilar Rúnico Direito (Runas Reativas com Efeitos Visuais ao Passar o Mouse) */}
          <div className="w-8 sm:w-9 shrink-0 bg-gradient-to-b from-[#1b1523] via-[#241c2e] to-[#130f19] border-l border-[#4c3a28] flex flex-col items-center justify-around py-8 text-xs select-none shadow-inner">
            <span className="text-amber-400 drop-shadow-[0_0_10px_#f59e0b] font-serif font-bold text-sm crystal-reactive">ᛟ</span>
            <span className="text-purple-400 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive animate-[runeShimmer_4s_infinite_ease-in-out]">ᚱ</span>
            <span className="text-sky-400 drop-shadow-[0_0_6px_#38bdf8] font-serif font-bold rune-interactive">ᛉ</span>
            <span className="text-amber-300 drop-shadow-[0_0_6px_#f59e0b] font-serif font-bold rune-interactive animate-[runeShimmer_3s_infinite_ease-in-out]">ᚲ</span>
            <span className="text-purple-300 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive">ᛗ</span>
            <span className="text-sky-300 drop-shadow-[0_0_6px_#38bdf8] font-serif font-bold rune-interactive animate-[runeShimmer_4.5s_infinite_ease-in-out]">ᛋ</span>
            <span className="text-amber-400 drop-shadow-[0_0_6px_#f59e0b] font-serif font-bold rune-interactive">ᚦ</span>
            <span className="text-purple-400 drop-shadow-[0_0_6px_#c084fc] font-serif font-bold rune-interactive">ᚨ</span>
            <span className="text-sky-400 drop-shadow-[0_0_6px_#38bdf8] font-serif font-bold rune-interactive animate-[runeShimmer_3.5s_infinite_ease-in-out]">ᛏ</span>
            <span className="text-sky-400 drop-shadow-[0_0_10px_#38bdf8] font-serif font-bold text-sm crystal-reactive">💠</span>
          </div>

        </div>
      </div>
    </div>
  );
}
