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
  if (!state) return '/img/elfwswM.png';
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
        style={{ backgroundImage: "url('/img/login/aden_panorama_hd.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div className="relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-[#0b0c16]/90 border border-amber-500/40 shadow-2xl login-portal-glow">
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

  // Nome e dados do herói formatados fielmente ao layout do prompt
  const heroName = cloudState?.charName || 'Aethelgard';
  const heroLevel = cloudState?.level || 12;
  const heroClass = (cloudState?.class || 'ELFFIGHTER').toUpperCase();
  const heroGold = cloudState?.gold !== undefined ? cloudState.gold : 154022;
  const isPrivileged = (cloudState?.privilegeLevel || 0) >= 1;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4 min-h-[100dvh] bg-cover bg-center bg-no-repeat select-none"
      style={{ backgroundImage: "url('/img/login/aden_panorama_hd.jpg')" }}
    >
      {/* Vinheta de Iluminação Noturna & Partículas Especiais */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060810]/70 via-transparent to-[#080914]/60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,rgba(5,7,15,0.65)_100%)]" />

      {/* Manopla de Armadura Flutuando no Canto Inferior Direito (Conforme Prompt) */}
      <div className="fixed bottom-4 sm:bottom-6 right-6 sm:right-10 pointer-events-none z-40 hidden sm:block drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] opacity-85">
        <img 
          src="/img/login/gauntlet_cursor.png" 
          alt="Manopla de Metal" 
          className="w-11 sm:w-13 h-auto object-contain"
        />
      </div>

      {/* ========================================================================= */}
      {/* O PORTAL CENTRAL DE ADEN (MOLDURA ORNAMENTADA EM ALTA RESOLUÇÃO 4K)       */}
      {/* ========================================================================= */}
      <div 
        className="relative w-[480px] max-w-[96vw] my-auto bg-contain bg-center bg-no-repeat rounded-2xl shadow-2xl transition-all"
        style={{ 
          backgroundImage: "url('/img/login/portal_frame_alpha.png')",
          aspectRatio: "520 / 735"
        }}
      >
        {/* Painel Interno de Pergaminho (Posicionado Cirurgicamente Dentro dos Limites da Moldura) */}
        <div 
          className="absolute inset-0 flex flex-col justify-between text-center"
          style={{
            paddingTop: "14.5%",
            paddingBottom: "11%",
            paddingLeft: "14.5%",
            paddingRight: "14%"
          }}
        >
          {/* TOPO: Cabeçalho com Títulos Dourados & Subtítulo */}
          <div className="shrink-0 mb-1">
            <p className="font-display text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] text-[#5a3e1c] drop-shadow-sm">
              Lineage Chronicle
            </p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-[32px] font-black tracking-wider gold-emboss-title leading-tight my-0.5">
              ADEN ARENA
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#634421] font-semibold tracking-wide">
              Portal de Autenticação & Progresso em Nuvem
            </p>
          </div>

          {/* CENTRO: CONTEÚDO PRINCIPAL (LOGADO OU FORMULÁRIO) */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            {user ? (
              /* =============================================================== */
              /* ESTADO 1: USUÁRIO CONECTADO (BEM-VINDO + HERÓI)                 */
              /* =============================================================== */
              <div className="space-y-2 sm:space-y-2.5">
                {/* Ícone de Coroa Dourada & Saudação */}
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl filter drop-shadow-[0_2px_4px_rgba(217,119,6,0.5)]">
                    👑
                  </span>
                  <h2 className="font-display font-bold text-sm sm:text-base text-[#251508] leading-tight">
                    Bem-vindo de volta!
                  </h2>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-[#543b27] truncate max-w-full">
                    {user.email}
                  </p>
                </div>

                {/* Card de Detalhes do Personagem (Conforme Especificado no Prompt) */}
                <div className="bg-[#181410]/95 border border-[#8e6e38] rounded-xl p-2 sm:p-2.5 text-left shadow-[inset_0_2px_6px_rgba(0,0,0,0.85),0_2px_6px_rgba(0,0,0,0.3)] flex items-center gap-2.5">
                  {/* Retrato do Herói (Elfa Ranger com Arco) */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border border-[#a18146] bg-black/80 shrink-0 overflow-hidden shadow-inner flex items-center justify-center p-0.5">
                    <img 
                      src={getHeroAvatar(cloudState)} 
                      alt="Elfa Ranger" 
                      className="w-full h-full object-cover object-top rounded"
                    />
                  </div>

                  {/* Informações Formatadas com as Cores Exatas do Prompt */}
                  <div className="flex-1 min-w-0 text-[10px] sm:text-[11px] space-y-0.5">
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
                  className="w-full login-gold-btn text-[#1c1002] font-display font-black text-sm sm:text-base rounded-xl py-2 px-1.5 flex items-center justify-between transition-all duration-150 active:scale-[0.98] group cursor-pointer shadow-lg relative overflow-hidden"
                >
                  <img 
                    src="/img/login/swords_left_clean.png" 
                    alt="Espadas Cruzadas" 
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 filter drop-shadow group-hover:rotate-6 transition-transform" 
                  />
                  <span className="flex-1 text-center tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    ✕ ENTRAR NO JOGO ▶
                  </span>
                  <img 
                    src="/img/login/swords_right_clean.png" 
                    alt="Espadas Cruzadas" 
                    className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0 filter drop-shadow group-hover:-rotate-6 transition-transform" 
                  />
                </button>

                {/* BOTÕES SECUNDÁRIOS ESCUROS */}
                <div className="space-y-1 sm:space-y-1.5">
                  <button
                    onClick={() => setShowCreation(true)}
                    className="w-full login-stone-btn text-amber-200 font-display font-semibold text-[11px] sm:text-xs rounded-lg py-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    ✨ Criar Novo Personagem / Recustomizar ✨
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full bg-[#16120e]/80 hover:bg-[#251d16] border border-[#52412b]/60 text-[#8f755a] hover:text-[#d4c3ad] font-semibold text-[10px] sm:text-[11px] rounded-lg py-1 transition cursor-pointer"
                  >
                    Trocar de Conta / Sair
                  </button>
                </div>
              </div>
            ) : (
              /* =============================================================== */
              /* ESTADO 2: FORMULÁRIO DE LOGIN / CADASTRO                        */
              /* =============================================================== */
              <div className="space-y-2">
                {/* Abas Entrar / Criar Conta */}
                <div className="flex border-b border-[#73522c]/40 mb-2">
                  <button
                    className={`flex-1 py-1 text-xs font-display font-bold border-b-2 transition ${tab === 'login' ? 'border-[#8f6e35] text-[#2a1705]' : 'border-transparent text-[#7c5f3f] hover:text-[#2a1705]'}`}
                    onClick={() => { setTab('login'); setError(null); }}
                  >
                    Entrar
                  </button>
                  <button
                    className={`flex-1 py-1 text-xs font-display font-bold border-b-2 transition ${tab === 'register' ? 'border-[#8f6e35] text-[#2a1705]' : 'border-transparent text-[#7c5f3f] hover:text-[#2a1705]'}`}
                    onClick={() => { setTab('register'); setError(null); }}
                  >
                    Criar Conta
                  </button>
                </div>

                {error && (
                  <div className="bg-red-950/85 border border-red-700/60 text-red-200 p-1.5 rounded-lg text-[10px] text-center font-medium">
                    {error}
                  </div>
                )}

                {/* Botão Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full login-stone-btn text-[#eddcc3] font-semibold flex items-center justify-center gap-2 rounded-lg py-1.5 text-[11px] transition cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.3 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 10.03 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Entrar com o Google</span>
                </button>

                <div className="flex items-center my-1 opacity-50">
                  <div className="flex-1 border-t border-[#73522c]"></div>
                  <span className="px-2 text-[9px] text-[#543b27] font-bold uppercase">ou e-mail</span>
                  <div className="flex-1 border-t border-[#73522c]"></div>
                </div>

                <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-1.5 text-left">
                  <div>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-2.5 py-1.5 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <input 
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-2.5 py-1.5 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {tab === 'register' && (
                    <div>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar senha"
                        className="w-full bg-[#18130e] border border-[#694d29] rounded-lg px-2.5 py-1.5 text-xs text-[#faede1] placeholder-[#806548] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full login-gold-btn text-[#1c1002] font-display font-black text-xs sm:text-sm rounded-xl py-2 px-1.5 flex items-center justify-between transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-lg mt-2"
                  >
                    <img 
                      src="/img/login/swords_left_clean.png" 
                      alt="Espadas" 
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow" 
                    />
                    <span className="flex-1 text-center tracking-wider drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                      {loading ? 'Aguarde...' : (tab === 'login' ? 'ENTRAR EM ADEN ▶' : 'CRIAR CONTA E JOGAR ▶')}
                    </span>
                    <img 
                      src="/img/login/swords_right_clean.png" 
                      alt="Espadas" 
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow" 
                    />
                  </button>
                </form>

                {/* Opção Convidado */}
                <div className="pt-1 text-center">
                  <button
                    onClick={handlePlayGuest}
                    className="text-[10px] text-[#634726] hover:text-[#251508] underline underline-offset-4 transition font-bold cursor-pointer"
                  >
                    🗡️ Jogar como Convidado (Save Local)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
