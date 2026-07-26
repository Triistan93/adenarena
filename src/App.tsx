import { useCallback, useEffect, useRef, useState } from "react";
import { Game, type GameResult } from "./game/Game";
import {
  RACES,
  SKILLS,
  type RaceDef,
  type ClassDef,
  type RaceId,
} from "./game/data";
import { cn } from "./utils/cn";
import IdleGame from "./idle/IdleGame";

type Phase = "menu" | "playing" | "paused" | "gameover";

interface ScoreEntry {
  score: number;
  race: string;
  cls: string;
  time: number;
  date: number;
}

const HS_KEY = "aden_arena_highscores_v1";

function loadHS(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(HS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function commitScore(r: GameResult): {
  list: ScoreEntry[];
  rank: number;
  isNew: boolean;
} {
  const entry: ScoreEntry = {
    score: r.score,
    race: r.race,
    cls: r.cls,
    time: Math.floor(r.time),
    date: Date.now(),
  };
  const list = loadHS();
  list.push(entry);
  list.sort((a, b) => b.score - a.score);
  const trimmed = list.slice(0, 8);
  const rank = trimmed.indexOf(entry);
  localStorage.setItem(HS_KEY, JSON.stringify(trimmed));
  return { list: trimmed, rank: rank >= 0 ? rank + 1 : -1, isNew: rank >= 0 };
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// ---------- High Score Table ----------
function HighScoreTable({
  scores,
  highlightDate,
}: {
  scores: ScoreEntry[];
  highlightDate?: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-3 font-display text-lg font-bold tracking-wide text-amber-200">
        ⚜ Hall of Legends
      </h3>
      {scores.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/40">
          No champions yet. Be the first.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {scores.map((s, i) => (
            <li
              key={s.date}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                s.date === highlightDate
                  ? "bg-amber-400/15 ring-1 ring-amber-300/50"
                  : "bg-white/[0.02]"
              )}
            >
              <span
                className={cn(
                  "w-6 text-center font-display text-base font-bold",
                  i === 0
                    ? "text-amber-300"
                    : i === 1
                    ? "text-slate-300"
                    : i === 2
                    ? "text-orange-300"
                    : "text-white/40"
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1 truncate font-semibold text-white/90">
                {s.cls}{" "}
                <span className="font-normal text-white/40">· {s.race}</span>
              </span>
              <span className="tabular-nums font-bold text-amber-200">
                {s.score.toLocaleString()}
              </span>
              <span className="w-12 text-right tabular-nums text-white/40">
                {fmtTime(s.time)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ---------- Menu ----------
function MenuScreen({
  raceId,
  clsId,
  highscores,
  onRace,
  onClass,
  onPlay,
}: {
  raceId: RaceId;
  clsId: string;
  highscores: ScoreEntry[];
  onRace: (id: RaceId) => void;
  onClass: (id: string) => void;
  onPlay: () => void;
}) {
  const race = RACES.find((r) => r.id === raceId) as RaceDef;
  const cls = race.classes.find((c) => c.id === clsId) ?? race.classes[0];
  const w = cls.weapon;
  const aps = (1000 / w.cooldown).toFixed(1);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-[#06080f] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full blur-3xl"
          style={{ background: race.color, opacity: 0.18 }}
        />
        <div
          className="absolute -right-10 bottom-0 h-96 w-96 rounded-full blur-3xl"
          style={{ background: "#5b3ea8", opacity: 0.18 }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6 text-center animate-float">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300/80">
            Lineage-inspired Browser RPG
          </p>
          <h1 className="font-display text-5xl font-black tracking-tight text-transparent sm:text-6xl"
            style={{
              backgroundImage:
                "linear-gradient(180deg,#fff 0%,#f4d58a 60%,#c9962f 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            ADEN ARENA
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/50">
            Choose your lineage, master its exclusive class and weapon, and
            survive the endless swarm. Auto-aims the nearest foe — just move and
            strike.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* selection */}
          <div className="space-y-6 lg:col-span-2">
            <section>
              <h2 className="mb-2 font-display text-xl font-bold text-white/90">
                1 · Choose your Race
              </h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {RACES.map((r) => {
                  const active = r.id === raceId;
                  return (
                    <button
                      key={r.id}
                      onClick={() => onRace(r.id)}
                      className={cn(
                        "group flex flex-col items-center gap-1 rounded-xl border p-3 transition",
                        active
                          ? "border-white/60 bg-white/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                      )}
                      style={
                        active
                          ? { boxShadow: `0 0 22px -4px ${r.color}` }
                          : undefined
                      }
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ background: r.color }}
                      />
                      <span className="text-xs font-semibold text-white/90">
                        {r.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-white/40">{race.blurb}</p>
            </section>

            <section>
              <h2 className="mb-2 font-display text-xl font-bold text-white/90">
                2 · Choose your Class &amp; Weapon
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {race.classes.map((c) => {
                  const active = c.id === clsId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onClass(c.id)}
                      className={cn(
                        "flex flex-col rounded-2xl border p-4 text-left transition",
                        active
                          ? "border-white/70 bg-white/10"
                          : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                      )}
                      style={
                        active
                          ? {
                              boxShadow: `0 0 26px -6px ${c.color}`,
                              borderColor: c.color,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-3xl"
                          style={{ filter: `drop-shadow(0 0 8px ${c.weapon.color})` }}
                        >
                          {c.weapon.emoji}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: `${c.weapon.color}22`,
                            color: c.weapon.color,
                          }}
                        >
                          {c.weapon.kind}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold text-white">
                        {c.name}
                      </h3>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                        {c.role}
                      </p>
                      <p className="mt-1 text-xs leading-snug text-white/50">
                        {c.desc}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                        <Stat label="HP" value={String(c.hp)} />
                        <Stat label="SPD" value={(c.speed / 10).toFixed(1)} />
                        <Stat label="DMG" value={String(c.weapon.damage)} />
                        <Stat label="RATE" value={`${aps}/s`} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {SKILLS[c.id]?.map((s) => (
                          <span
                            key={s.id}
                            title={`${s.name} — ${s.desc}`}
                            className="inline-flex items-center gap-1 rounded-md bg-black/30 px-1.5 py-0.5 text-[10px] text-white/75"
                          >
                            <span>{s.emoji}</span>
                            {s.name}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 truncate text-xs font-semibold text-white/70">
                        <span style={{ color: c.weapon.color }}>
                          {c.weapon.name}
                        </span>
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* info column */}
          <div className="space-y-4">
            <div
              className="rounded-2xl border p-5 animate-pulseGlow"
              style={{
                borderColor: cls.color,
                background: `linear-gradient(160deg, ${cls.color}1a, rgba(255,255,255,0.02))`,
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
                Your Champion
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-4xl" style={{ filter: `drop-shadow(0 0 10px ${cls.weapon.color})` }}>
                  {cls.weapon.emoji}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-black text-white">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    {race.name} · {cls.role}
                  </p>
                </div>
              </div>
              <button
                onClick={onPlay}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 text-center font-display text-lg font-black tracking-wide text-[#2a1c00] shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-[0.98]"
              >
                ENTER THE ARENA ▶
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/50">
              <h4 className="mb-2 font-display text-sm font-bold text-white/80">
                Controls
              </h4>
              <ul className="space-y-1">
                <li>
                  <span className="text-white/80">Move</span> — WASD / Arrows or
                  left thumbstick
                </li>
                <li>
                  <span className="text-white/80">Aim</span> — Mouse, or right
                  thumbstick
                </li>
                <li>
                  <span className="text-white/80">Attack</span> — Click / Space,
                  or hold right side
                </li>
                <li>
                  <span className="text-white/80">Pause</span> — Esc or the
                  pause button
                </li>
              </ul>
            </div>

            <HighScoreTable scores={highscores} />
          </div>
        </div>

        <footer className="mt-8 text-center text-[11px] text-white/30">
          Built with React · Canvas · Tailwind — runs at 60fps on desktop &amp;
          mobile.
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-black/30 px-2 py-1">
      <span className="text-white/40">{label}</span>
      <span className="font-bold tabular-nums text-white/90">{value}</span>
    </div>
  );
}

// ---------- Pause ----------
function PauseOverlay({
  onResume,
  onRestart,
  onQuit,
}: {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[min(92vw,420px)] rounded-3xl border border-white/15 bg-[#0b0f1c]/95 p-8 text-center shadow-2xl">
        <h2 className="font-display text-4xl font-black tracking-widest text-amber-200">
          PAUSED
        </h2>
        <p className="mt-1 text-sm text-white/40">The battle awaits your return.</p>
        <div className="mt-6 space-y-3">
          <button
            onClick={onResume}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-display text-lg font-black text-[#2a1c00] transition hover:brightness-110 active:scale-[0.98]"
          >
            RESUME
          </button>
          <button
            onClick={onRestart}
            className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            RESTART
          </button>
          <button
            onClick={onQuit}
            className="w-full rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/60 transition hover:bg-white/5"
          >
            QUIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Game Over ----------
function GameOverOverlay({
  result,
  rank,
  isNew,
  highscores,
  onAgain,
  onMenu,
}: {
  result: GameResult;
  rank: number;
  isNew: boolean;
  highscores: ScoreEntry[];
  onAgain: () => void;
  onMenu: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="w-[min(94vw,460px)] rounded-3xl border border-red-500/30 bg-[#0b0f1c]/95 p-7 text-center shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400/80">
          You have fallen
        </p>
        <h2 className="mt-1 font-display text-5xl font-black tracking-tight text-white">
          GAME OVER
        </h2>

        {isNew && (
          <div className="mx-auto mt-3 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-300/50">
            ★ New High Score · Rank #{rank}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Score
            </p>
            <p className="font-display text-3xl font-black text-amber-200">
              {result.score.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Class
            </p>
            <p className="truncate font-bold text-white">
              {result.cls}
            </p>
            <p className="text-xs text-white/40">{result.race}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Survived
            </p>
            <p className="font-bold text-white">{fmtTime(result.time)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.04] p-3">
            <p className="text-[11px] uppercase tracking-wider text-white/40">
              Kills · Combo
            </p>
            <p className="font-bold text-white">
              {result.kills} · x{result.bestCombo}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <HighScoreTable scores={highscores} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onAgain}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-display text-base font-black text-[#2a1c00] transition hover:brightness-110 active:scale-[0.98]"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={onMenu}
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            CHANGE CHARACTER
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Arena (the 3D action-RPG; mounts only in Arena mode) ----------
function ArenaApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [raceId, setRaceId] = useState<RaceId>("human");
  const [clsId, setClsId] = useState<string>("warrior");
  const [highscores, setHighscores] = useState<ScoreEntry[]>(() => loadHS());
  const [result, setResult] = useState<
    (GameResult & { rank: number; isNew: boolean }) | null
  >(null);

  const race = RACES.find((r) => r.id === raceId) as RaceDef;
  const cls =
    (race.classes.find((c) => c.id === clsId) as ClassDef) ?? race.classes[0];

  // Tear down the 3D engine cleanly when this view unmounts (mode switch).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    if (gameRef.current) {
      gameRef.current.destroy();
      gameRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    const hud = hudRef.current;
    if (!canvas || !hud) return;
    if (gameRef.current) gameRef.current.destroy();
    const game = new Game(
      canvas,
      hud,
      { race, cls },
      {
        onPaused: () => setPhase("paused"),
        onResumed: () => setPhase("playing"),
        onGameOver: (r: GameResult) => {
          const { list, rank, isNew } = commitScore(r);
          setHighscores(list);
          setResult({ ...r, rank, isNew });
          setPhase("gameover");
        },
      }
    );
    gameRef.current = game;
    game.start();
    setPhase("playing");
  }, [race, cls]);

  const handleRace = (id: RaceId) => {
    setRaceId(id);
    const r = RACES.find((x) => x.id === id) as RaceDef;
    setClsId(r.classes[0].id);
  };

  const handleResume = () => gameRef.current?.resume();
  const handleRestart = () => startGame();
  const handleQuit = () => {
    gameRef.current?.destroy();
    gameRef.current = null;
    setPhase("menu");
  };

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 block" />
      <canvas
        ref={hudRef}
        className="fixed inset-0 z-10 block pointer-events-none"
      />

      {phase === "menu" && (
        <MenuScreen
          raceId={raceId}
          clsId={clsId}
          highscores={highscores}
          onRace={handleRace}
          onClass={setClsId}
          onPlay={startGame}
        />
      )}

      {phase === "paused" && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      {phase === "gameover" && result && (
        <GameOverOverlay
          result={result}
          rank={result.rank}
          isNew={result.isNew}
          highscores={highscores}
          onAgain={handleRestart}
          onMenu={handleQuit}
        />
      )}
    </>
  );
}

// ---------- Mode switch (top-left collapsible hamburger menu) ----------
type Mode = "idle" | "arena";

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
    setIsOpen(false);
  };

  return (
    <div className="mode-menu-container" ref={menuRef}>
      <button
        type="button"
        aria-label="Toggle game mode menu"
        aria-expanded={isOpen}
        className={cn("hamburger-btn", isOpen && "is-active")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="hamburger-icon">
          <span />
          <span />
          <span />
        </div>
        <span className="hamburger-mode-badge">
          {mode === "idle" ? "📜 Idle Chronicle" : "⚔ 3D Arena"}
        </span>
        <span className="hamburger-chevron">▾</span>
      </button>

      {isOpen && (
        <div className="mode-dropdown">
          <div className="mode-dropdown__header">
            <span>MODO DE JOGO</span>
          </div>
          <button
            type="button"
            className={cn("mode-dropdown__item", mode === "idle" && "is-active")}
            onClick={() => selectMode("idle")}
          >
            <span className="mode-dropdown__icon">📜</span>
            <div className="mode-dropdown__info">
              <div className="mode-dropdown__title">Idle Chronicle</div>
              <div className="mode-dropdown__desc">RPG de texto e progressão automática</div>
            </div>
            {mode === "idle" && <span className="mode-dropdown__check">✓</span>}
          </button>
          <button
            type="button"
            className={cn("mode-dropdown__item", mode === "arena" && "is-active")}
            onClick={() => selectMode("arena")}
          >
            <span className="mode-dropdown__icon">⚔</span>
            <div className="mode-dropdown__info">
              <div className="mode-dropdown__title">3D Arena</div>
              <div className="mode-dropdown__desc">Combate de ação em tempo real</div>
            </div>
            {mode === "arena" && <span className="mode-dropdown__check">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Shell: picks which experience is on screen ----------
export default function Shell() {
  const [mode, setMode] = useState<Mode>("idle");
  return (
    <>
      {mode === "arena" ? <ArenaApp /> : <IdleGame />}
      <ModeSwitch mode={mode} setMode={setMode} />
    </>
  );
}

