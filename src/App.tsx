import { Component, useEffect, useState, lazy, Suspense, useRef, type ReactNode } from "react";
import { cn } from "./utils/cn";
import IdleGame from "./idle/IdleGame";
import { AuthModal } from "./components/AuthModal";
import { LoginScreen } from "./components/LoginScreen";
import { auth } from "./firebase";

const ArenaApp = lazy(() => import("./ArenaApp"));
const Aden2DGame = lazy(() => import("./pixel2d/Aden2DGame"));

// ---------- Mode switch (top-left collapsible hamburger menu) ----------
type Mode = "idle" | "arena" | "pixel2d";

function ModeSwitch({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const selectMode = (m: Mode) => {
    setMode(m);
    if (typeof (window as any).setGameMode === "function") {
      (window as any).setGameMode(m);
    }
    setIsOpen(false);
  };

  const getModeBadge = () => {
    switch (mode) {
      case "idle": return "📜 Idle Chronicle";
      case "arena": return "⚔ 3D Arena";
      case "pixel2d": return "👾 Aden Pixel 2D";
    }
  };

  return (
    <div className="mode-menu-container" ref={menuRef}>
      <button
        type="button"
        aria-label="Toggle game mode menu"
        className={cn("hamburger-btn", isOpen && "is-active")}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="hamburger-icon">
          <span />
          <span />
          <span />
        </span>
        <span className="hamburger-mode-badge">
          {getModeBadge()}
        </span>
      </button>

      {isOpen && (
        <div className="mode-dropdown">
          <div className="mode-dropdown__header">Modo de Jogo (Temporada 1)</div>
          <button
            type="button"
            className={cn("mode-dropdown__item", mode === "idle" && "is-active")}
            onClick={() => selectMode("idle")}
          >
            <span className="mode-dropdown__icon">📜</span>
            <div className="mode-dropdown__info">
              <div className="mode-dropdown__title">Idle Chronicle</div>
              <div className="mode-dropdown__desc">RPG de progressão e conquistas de Aden</div>
            </div>
            {mode === "idle" && <span className="mode-dropdown__check">✓</span>}
          </button>
          
          {/* Modos 2D e 3D preservados no código, ocultos para temporadas futuras */}
          {/*
          <button
            type="button"
            className={cn("mode-dropdown__item", mode === "pixel2d" && "is-active")}
            onClick={() => selectMode("pixel2d")}
          >
            <span className="mode-dropdown__icon">👾</span>
            <div className="mode-dropdown__info">
              <div className="mode-dropdown__title">Aden Pixel 2D</div>
              <div className="mode-dropdown__desc">Combate retrô 2D com pixel art & animações</div>
            </div>
            {mode === "pixel2d" && <span className="mode-dropdown__check">✓</span>}
          </button>
          <button
            type="button"
            className={cn("mode-dropdown__item", mode === "arena" && "is-active")}
            onClick={() => selectMode("arena")}
          >
            <span className="mode-dropdown__icon">⚔</span>
            <div className="mode-dropdown__info">
              <div className="mode-dropdown__title">3D Arena</div>
              <div className="mode-dropdown__desc">Combate de ação 3D em tempo real</div>
            </div>
            {mode === "arena" && <span className="mode-dropdown__check">✓</span>}
          </button>
          */}
        </div>
      )}
    </div>
  );
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#06080f] text-white p-6 text-center z-50">
          <h2 className="text-2xl font-bold text-amber-300 mb-2">Ops! Ocorreu um erro inesperado.</h2>
          <p className="text-sm text-white/60 mb-4">{this.state.error?.message || "Erro de execução."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition"
          >
            Recarregar Jogo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- Shell: picks which experience is on screen ----------
export default function Shell() {
  const [mode, setMode] = useState<Mode>("idle");
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    (window as any).onReactSetMode = (m: Mode) => {
      setMode(m);
    };
    return () => {
      delete (window as any).onReactSetMode;
    };
  }, []);

  const handleEnterGame = (cloudState?: any) => {
    if (cloudState && typeof cloudState === 'object') {
      try {
        const email = (auth.currentUser?.email || '').toLowerCase().trim();
        const adminEmails = ['duuh.alaminos@gmail.com', 'eduardol.alaminos@gmail.com'];
        const isAdmin = Boolean(adminEmails.includes(email) || (window as any).currentUserIsAdmin);
        const priv = isAdmin ? (Number(cloudState.privilegeLevel) || 1) : 0;
        (window as any).currentUserIsAdmin = isAdmin;
        (window as any).currentUserEmail = email;
        (window as any).currentUserPrivilege = priv;
        cloudState.privilegeLevel = priv;
        if (!isAdmin && cloudState.role === 'admin') {
          cloudState.role = 'player';
        }
        localStorage.setItem('lineageIdleSave_v2', JSON.stringify(cloudState));
      } catch (e) {
        console.error('Error saving cloudState to localStorage:', e);
      }
      if (typeof window !== 'undefined' && typeof (window as any).loadGameState === 'function') {
        (window as any).loadGameState(cloudState);
      }
    }
    setHasEntered(true);
  };

  return (
    <ErrorBoundary>
      {!hasEntered ? (
        <LoginScreen onEnterGame={handleEnterGame} />
      ) : (
        <>
          {mode === "arena" ? (
            <Suspense fallback={<div className="loading-spinner">Carregando arena...</div>}>
              <ArenaApp />
            </Suspense>
          ) : mode === "pixel2d" ? (
            <Suspense fallback={<div className="loading-spinner">Carregando arena...</div>}>
              <Aden2DGame />
            </Suspense>
          ) : (
            <div className="w-full h-full min-h-[100dvh] max-h-[100dvh] relative overflow-hidden">
              <IdleGame />
            </div>
          )}
          {/* Modos alternativos desativados temporariamente; seletor removido para não cobrir o logotipo do jogo */}
          {/* <ModeSwitch mode={mode} setMode={setMode} /> */}
          <div className="fixed top-[4px] sm:top-[5px] left-[106px] sm:left-[118px] z-40 flex items-center h-[28px]">
            <AuthModal 
              onCloudDataLoaded={(cloudState) => {
                if (typeof window !== 'undefined' && (window as any).loadGameState) {
                  (window as any).loadGameState(cloudState);
                }
              }}
              getCurrentState={() => {
                if (typeof window !== 'undefined' && (window as any).getGameState) {
                  return (window as any).getGameState();
                }
                return null;
              }}
            />
          </div>
        </>
      )}
    </ErrorBoundary>
  );
}
