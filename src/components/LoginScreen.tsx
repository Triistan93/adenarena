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
  deletePlayerStateFromCloud,
  reserveCharacterNameAndCreate,
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
    return gender === 'F' ? '/img/dwarfmaestroF.png' : '/img/dwarfmaestroM.png';
  }
  if (race === 'kamael' || cls.includes('kamael')) {
    return gender === 'F' ? '/img/kamaelshF.png' : '/img/kamaelDM.png';
  }
  if (cls.includes('mage') || cls.includes('wizard') || cls.includes('cleric')) {
    return gender === 'F' ? '/img/f_humanwizard.jpg' : '/img/m_humanwizard.jpg';
  }
  return gender === 'F' ? '/img/f_humanwarrior.jpg' : '/img/m_humanfighter.jpg';
}

// Motor de Brasas & Fuligem de Forja em Canvas 2D
function EmberCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Ember {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      maxAlpha: number;
      decay: number;
      swayFreq: number;
      swayOffset: number;
    }

    const embers: Ember[] = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 80,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.7 + 0.35,
      speedX: (Math.random() - 0.5) * 0.35,
      alpha: 0,
      maxAlpha: Math.random() * 0.65 + 0.25,
      decay: Math.random() * 0.003 + 0.001,
      swayFreq: Math.random() * 0.02 + 0.01,
      swayOffset: Math.random() * Math.PI * 2,
    }));

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (const e of embers) {
        e.y -= e.speedY * 60 * dt;
        e.x += Math.sin(time * 0.001 * e.swayFreq * 60 + e.swayOffset) * 0.5;

        if (e.y > height * 0.7) {
          e.alpha = Math.min(e.maxAlpha, e.alpha + dt * 0.8);
        } else {
          e.alpha = Math.max(0, e.alpha - e.decay * 60 * dt);
        }

        if (e.y < -20 || e.alpha <= 0) {
          e.y = height + Math.random() * 40;
          e.x = Math.random() * width;
          e.alpha = 0;
          e.maxAlpha = Math.random() * 0.65 + 0.25;
        }

        ctx.fillStyle = `rgba(245, 165, 35, ${e.alpha})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();

        if (e.size > 1.4) {
          ctx.fillStyle = `rgba(255, 230, 140, ${e.alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-1"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

export function LoginScreen({ onEnterGame }: LoginScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showCloudLogin, setShowCloudLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cloudState, setCloudState] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showCreation, setShowCreation] = useState(false);

  // Monitorar autenticação no Firebase e carregar os dados reais do jogador em nuvem
  useEffect(() => {
    const isPendingCreation = typeof localStorage !== 'undefined' && localStorage.getItem('aden_pending_char_creation') === '1';

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          if (isPendingCreation) {
            // Jogador solicitou reiniciar/criar novo herói explicitamente
            setCloudState(null);
            setShowCreation(true);
          } else {
            const stateData = await loadPlayerStateFromCloud(currentUser.uid);
            if (stateData) {
              setCloudState(stateData);
            } else {
              setShowCreation(true);
            }
          }
        } catch (err) {
          console.error('Error fetching cloud state on login screen:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setCloudState(null);
        if (isPendingCreation) {
          setShowCreation(true);
        }
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCharacterCreated = async (data: CharacterCreationData) => {
    const kit = getStarterKit(data.race, data.className);

    const inventoryItems: any[] = [
      { uid: 'init_w', itemId: kit.weapon, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_a', itemId: kit.armor, count: 1, rarity: 'common', enchant: 0 },
      { uid: 'init_pot', itemId: kit.potions.itemId, count: kit.potions.count },
      { uid: 'init_shots', itemId: kit.shotType, count: kit.shotsCount }
    ];

    const equipmentMap: Record<string, string | null> = {
      weapon: 'init_w',
      weapon2: null,
      helmet: null,
      armor: 'init_a',
      legs: null,
      gloves: null,
      boots: null,
      shield: null
    };

    if (kit.shield) {
      inventoryItems.push({ uid: 'init_sh', itemId: kit.shield, count: 1, rarity: 'common', enchant: 0 });
      equipmentMap.shield = 'init_sh';
    }

    const savedRef = typeof localStorage !== 'undefined' ? localStorage.getItem('aden_referred_by') : null;
    const cleanRef = savedRef ? savedRef.trim().slice(0, 30) : null;
    const isSelfRef = cleanRef && cleanRef.toLowerCase() === data.charName.toLowerCase();
    const effectiveRef = (cleanRef && !isSelfRef) ? cleanRef : null;

    if (effectiveRef) {
      const shotsItem = inventoryItems.find(i => i.uid === 'init_shots');
      if (shotsItem) shotsItem.count = (shotsItem.count || 0) + 1000;
      const potItem = inventoryItems.find(i => i.uid === 'init_pot');
      if (potItem) potItem.count = (potItem.count || 0) + 10;
    }

    let reservedCharId = `char_${user ? user.uid.slice(0, 16) : Date.now().toString(36)}`;
    let reservedAccId = user ? `acc_${user.uid.slice(0, 16)}` : null;

    if (user) {
      const reservation = await reserveCharacterNameAndCreate(user.uid, {
        charName: data.charName,
        race: data.race,
        className: data.className,
        gender: data.gender,
      });
      if (reservation.success && reservation.characterId) {
        reservedCharId = reservation.characterId;
        if (reservation.accountId) reservedAccId = reservation.accountId;
      } else {
        console.error('[CharacterCreation] Falha ao registrar personagem canônico:', reservation.reason);
        alert(
          `❌ Não foi possível criar o personagem no Firestore:\n\n${reservation.reason}\n\n` +
          `Aviso de Segurança: Certifique-se de que as Regras do Firestore (firestore.rules) foram publicadas na aba "Regras" do Firebase Console.`
        );
        return;
      }
    }

    const newCharState: any = {
      characterId: reservedCharId,
      accountId: reservedAccId,
      ownerUid: user ? user.uid : null,
      entityType: 'player',
      playerType: 'real',
      status: 'active',
      isDiscoverable: true,
      friends: [],
      blocked: [],
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
      base: { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 },
      zone: 'talkingIsland',
      inventory: inventoryItems,
      equipment: equipmentMap,
      skills: {
        [kit.starterSkill]: 1
      },
      selectedSkill: kit.starterSkill,
      lastSaveTime: Date.now(),
      referredBy: effectiveRef || null,
      referralStarterGranted: Boolean(effectiveRef)
    };

    if (effectiveRef && typeof window !== 'undefined' && (window as any).lineageIdleCloud?.recordReferral) {
      try {
        (window as any).lineageIdleCloud.recordReferral(effectiveRef, data.charName, 1);
      } catch (e) {
        console.debug('Cloud record referral notice:', e);
      }
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('aden_pending_char_creation');
    }

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
    try {
      const localSave = localStorage.getItem('aden_idle_save') || localStorage.getItem('lineage_idle_save');
      if (localSave) {
        const parsed = JSON.parse(localSave);
        if (parsed && (parsed.level || parsed.name || parsed.charName)) {
          onEnterGame(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Falha ao restaurar save local de convidado:', e);
    }
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden select-none p-3 sm:p-4 bg-[#07090e]">
      {/* Imagem de Fundo (Castelo de Aden com Tratamento de Vinheta e Luz Fria) */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: `url('/images/castle-bg.jpg')`,
        }}
      />
      
      {/* Overlay Escuro com Vinheta de Obsidiana e Névoa Fria */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06080d] via-[#090d16]/75 to-[#06080d]/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(4,6,10,0.85)_100%)]" />

      {/* Motor de Brasas e Fuligem de Alta Performance */}
      <EmberCanvas />

      {/* Container Principal do Monólito */}
      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Monólito de Obsidiana */}
        <div className="obsidian-monolith overflow-hidden">
          {/* Cabeçalho Decorativo de Bronze Forjado */}
          <div className="bg-gradient-to-b from-[#1c2230] to-[#10141d] p-4 text-center relative border-b border-[#c5a059]/30">
            <div className="relative z-10">
              <div className="text-[#c5a059] text-[10px] sm:text-xs font-bold tracking-[0.28em] mb-1 uppercase font-serif">
                ✦ CHRONICLES OF ADEN · TEMPORADA 1 ✦
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#f5df93] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] tracking-wider" style={{ fontFamily: 'Cinzel, serif' }}>
                ADEN ARENA
              </h1>
              <div className="text-[#c5a059] text-xs sm:text-sm font-black tracking-[0.25em] uppercase font-serif mt-0.5">
                IDLE CHRONICLES
              </div>
              <div className="text-[#94a3b8] text-[10px] sm:text-[11px] mt-1 font-sans">
                Aventura Épica no Universo Clássico de Aden
              </div>

              {/* Badges de Destaque */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[10px]">
                <span className="bg-[#0b0e14]/90 border border-[#c5a059]/40 text-[#f5df93] px-2.5 py-0.5 rounded font-semibold shadow-sm font-serif">
                  ⚡ 100% Navegador
                </span>
                <span className="bg-[#0b0e14]/90 border border-[#c5a059]/40 text-[#f5df93] px-2.5 py-0.5 rounded font-semibold shadow-sm font-serif">
                  🛡️ 20+ Classes & Forja
                </span>
                <span className="bg-[#0b0e14]/90 border border-[#c5a059]/40 text-[#f5df93] px-2.5 py-0.5 rounded font-semibold shadow-sm font-serif">
                  🌙 Caça Offline
                </span>
              </div>
            </div>
          </div>

          {/* Conteúdo Central */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0e121a]/95 via-[#0a0d13]/98 to-[#07090e]">
            {user ? (
              /* ESTADO 1: LOGADO - HERO CAMEO NOBRE */
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block p-1 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/30 text-[#f5df93] text-xs px-3 font-serif">
                    👑 BEM-VINDO DE VOLTA
                  </div>
                  <p className="text-xs text-[#94a3b8] font-mono truncate mt-1">
                    {user.email}
                  </p>
                </div>

                {/* Vitrine do Herói com Cameo Heráldico Nobre */}
                <div className="bg-[#0d1017] border border-[#c5a059]/30 rounded-xl p-3.5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] flex items-center gap-3.5 text-left">
                  {/* Cameo Oval/Circular */}
                  <div className="heraldic-cameo">
                    <div className="heraldic-cameo-inner">
                      <img 
                        src={getHeroAvatar(cloudState)} 
                        alt="Avatar do Herói" 
                      />
                    </div>
                  </div>

                  {/* Informações da Conta */}
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="truncate">
                      <span className="text-[#94a3b8] text-[11px] font-sans">Herói: </span>
                      <span className="text-[#f5df93] font-bold font-serif text-sm">
                        {heroName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#c5a059] font-medium font-serif">
                      <span>Nv. {heroLevel} · {heroClass}</span>
                      <span className={isPrivileged ? "text-amber-400 font-bold" : "text-[#94a3b8]"}>
                        {isPrivileged ? "👑 Admin" : "👤 Jogador"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-0.5">
                      <div>
                        <span className="text-[#64748b]">Adena: </span>
                        <span className="text-amber-400 font-bold font-mono">
                          🪙 {heroGold.toLocaleString()}
                        </span>
                      </div>
                      {highestFloor > 0 && (
                        <div>
                          <span className="text-[#64748b]">Torre: </span>
                          <span className="text-sky-300 font-bold font-mono">
                            🏰 F{highestFloor}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Entrar Forjado em Ouro */}
                <button
                  onClick={handleStartLoggedGame}
                  className="w-full forged-gold-btn py-3.5 px-6 rounded-lg font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <span>⚔️ ENTRAR NO JOGO ▶</span>
                </button>

                {/* Botões Secundários */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Deseja criar um novo personagem ou escolher uma nova classe? O personagem atual será substituído após concluir a criação.')) {
                        setShowCreation(true);
                      }
                    }}
                    className="flex-1 bg-[#1a1710] hover:bg-[#2a2416] text-[#e8c870] hover:text-[#fde047] font-semibold py-2 px-3 rounded-lg text-xs border border-[#c5a059]/30 transition-all cursor-pointer font-serif flex items-center justify-center gap-1.5"
                    title="Escolha uma nova raça e classe criando um novo herói"
                  >
                    <span>✨</span>
                    <span>Novo Personagem</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex-1 bg-[#121620] hover:bg-[#1a202d] text-[#94a3b8] hover:text-[#ece4d3] font-semibold py-2 px-3 rounded-lg text-xs border border-white/5 transition-all cursor-pointer font-serif"
                  >
                    Trocar de Conta
                  </button>
                </div>

                {/* Botão Discord Oficial */}
                <div className="pt-2 border-t border-white/5">
                  <a
                    href="https://discord.gg/R7rwB5uCc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#c7d2fe] hover:text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-all cursor-pointer text-decoration-none"
                  >
                    <span>💬</span>
                    <span>Comunidade no Discord Oficial</span>
                  </a>
                </div>
              </div>
            ) : (
              /* ESTADO 2: NÃO LOGADO (ZERO ATRITO COM FORGED GOLD BTN) */
              <div className="space-y-4">
                {/* CTA PRIMÁRIO: ZERO ATRITO (JOGAR AGORA GRÁTIS) */}
                <div className="bg-[#121722]/80 border border-[#c5a059]/40 rounded-xl p-3.5 sm:p-4 text-center shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] relative overflow-hidden">
                  <button
                    onClick={handlePlayGuest}
                    className="w-full forged-gold-btn py-3.5 px-6 rounded-lg font-black text-base sm:text-lg tracking-wider uppercase flex items-center justify-center gap-2"
                  >
                    <span>⚔️ JOGAR AGORA GRÁTIS ▶</span>
                  </button>
                  <p className="text-[11px] text-[#94a3b8] font-medium mt-2.5">
                    Sem cadastro · Jogue direto no navegador · Salva automaticamente
                  </p>
                </div>

                {/* Separador Nobre */}
                <div className="flex items-center justify-center py-0.5">
                  <div className="h-px bg-[#c5a059]/25 flex-1"></div>
                  <div className="mx-3 text-[#c5a059]/80 text-[10px] font-bold uppercase tracking-widest font-serif">
                    Ou sincronize em Nuvem
                  </div>
                  <div className="h-px bg-[#c5a059]/25 flex-1"></div>
                </div>

                {/* Botão Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-[#141924] hover:bg-[#1c2333] text-[#e2e8f0] font-semibold py-2.5 px-4 rounded-lg border border-[#c5a059]/30 hover:border-[#c5a059]/60 flex items-center justify-center gap-2.5 text-xs transition-all duration-200 cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.3 7.37 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 10.03 0 12s.46 3.83 1.26 5.42l4.02-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span className="font-serif">Sincronizar com Google</span>
                </button>

                {/* Alternar login com E-mail / Senha */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCloudLogin(!showCloudLogin)}
                    className="w-full text-center text-xs text-[#94a3b8] hover:text-[#f5df93] font-medium py-1 flex items-center justify-center gap-1 cursor-pointer transition font-serif"
                  >
                    <span>{showCloudLogin ? '▲ Ocultar login por E-mail' : '▼ Entrar ou criar conta com E-mail / Senha'}</span>
                  </button>

                  {showCloudLogin && (
                    <div className="mt-3 pt-3 border-t border-[#c5a059]/20 space-y-3">
                      {/* Abas Entrar / Criar Conta */}
                      <div className="flex border-b border-[#c5a059]/30 mb-2">
                        <button
                          className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition font-serif ${tab === 'login' ? 'border-[#c5a059] text-[#f5df93]' : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'}`}
                          onClick={() => { setTab('login'); setError(null); }}
                        >
                          Entrar
                        </button>
                        <button
                          className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition font-serif ${tab === 'register' ? 'border-[#c5a059] text-[#f5df93]' : 'border-transparent text-[#64748b] hover:text-[#94a3b8]'}`}
                          onClick={() => { setTab('register'); setError(null); }}
                        >
                          Criar Conta
                        </button>
                      </div>

                      {error && (
                        <div className="bg-red-950/80 border border-red-700/80 text-red-200 p-2 rounded-lg text-xs text-center font-medium">
                          {error}
                        </div>
                      )}

                      {/* Formulário de Email e Senha com Inputs Escuros */}
                      <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-2.5 text-left">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#94a3b8] mb-1 font-serif">
                            📧 E-mail
                          </label>
                          <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com"
                            className="w-full px-3 py-2 rounded-md login-dark-input text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#94a3b8] mb-1 font-serif">
                            🔒 Senha
                          </label>
                          <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2 rounded-md login-dark-input text-xs font-mono"
                          />
                        </div>

                        {tab === 'register' && (
                          <div>
                            <label className="block text-[11px] font-semibold text-[#94a3b8] mb-1 font-serif">
                              🔒 Confirmar Senha
                            </label>
                            <input 
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full px-3 py-2 rounded-md login-dark-input text-xs font-mono"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-[#1c2436] hover:bg-[#253046] text-[#f5df93] border border-[#c5a059]/50 hover:border-[#c5a059] font-bold py-2.5 px-4 rounded-lg shadow disabled:opacity-50 text-xs cursor-pointer mt-2 font-serif uppercase tracking-wider transition-all"
                        >
                          {loading ? 'PROCESSANDO...' : (tab === 'login' ? 'ENTRAR COM E-MAIL' : 'CRIAR CONTA')}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Botão Discord Oficial */}
                <div className="pt-2 border-t border-white/5">
                  <a
                    href="https://discord.gg/R7rwB5uCc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/40 text-[#c7d2fe] hover:text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-all cursor-pointer text-decoration-none"
                  >
                    <span>💬</span>
                    <span>Comunidade no Discord Oficial</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Pedestal Arquitetônico com Runas Entalhadas */}
          <div className="runic-pedestal py-2.5 px-4 text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs opacity-85 select-none overflow-x-hidden">
              <span className="runic-glyph">ᚠ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚱ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚦ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚨ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚲ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚷ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚹ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚺ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᚾ</span>
              <span className="text-[#8a6d3b]/50 text-[10px]">·</span>
              <span className="runic-glyph">ᛁ</span>
            </div>
            <div className="text-[#64748b] text-[9px] mt-1 font-serif">
              © 2026 Aden Arena: Idle Chronicles · Aventura Clássica
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
