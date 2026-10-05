import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Game, type GameResult } from "./Game";
import { RACES, type ClassDef, type RaceDef, type RaceId } from "./data";
import {
  ACTION_PROTOTYPE_CAMPAIGN,
  awardPrototypeXp,
  createActionPrototypeConfig,
  createInitialPrototypeProgression,
} from "./actionPrototype.js";
import "./hybrid-action-prototype.css";

type Phase = "menu" | "playing" | "paused" | "failed" | "complete";

const BUILDS: { raceId: RaceId; classId: string; label: string; fantasy: string }[] = [
  { raceId: "human", classId: "warrior", label: "Guerreiro", fantasy: "Combate corpo a corpo · alabarda" },
  { raceId: "elf", classId: "archer", label: "Arqueiro Élfico", fantasy: "Ataque à distância · arco" },
  { raceId: "darkelf", classId: "sorcerer", label: "Feiticeiro Sombrio", fantasy: "Magia de área · cajado" },
];

function resolveBuild(build: (typeof BUILDS)[number]): { race: RaceDef; cls: ClassDef } {
  const race = RACES.find((entry) => entry.id === build.raceId) ?? RACES[0];
  const cls = race.classes.find((entry) => entry.id === build.classId) ?? race.classes[0];
  const weapon = build.classId === 'warrior'
    ? { ...cls.weapon, shape: 'spear' as const, name: 'Alabarda de Aden' }
    : build.classId === 'sorcerer'
      ? { ...cls.weapon, shape: 'staff' as const, name: 'Cajado Sombrio' } : cls.weapon;
  return { race, cls: { ...cls, weapon } };
}

export default function HybridActionPrototype() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hudRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [phase, setPhase] = useState<Phase>("menu");
  const [buildIndex, setBuildIndex] = useState(0);
  const [wave, setWave] = useState(0);
  const [kills, setKills] = useState(0);
  const [progression, setProgression] = useState(createInitialPrototypeProgression);
  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState("");

  const build = BUILDS[buildIndex] ?? BUILDS[0];
  const { race, cls } = useMemo(() => resolveBuild(build), [build]);

  const teardown = useCallback(() => {
    gameRef.current?.destroy();
    gameRef.current = null;
  }, []);

  useEffect(() => teardown, [teardown]);

  useEffect(() => {
    gameRef.current?.applyPrototypeLevel(progression.level);
  }, [progression.level]);

  const startRun = useCallback(() => {
    const canvas = canvasRef.current;
    const hud = hudRef.current;
    if (!canvas || !hud) return;

    teardown();
    setError("");
    setWave(0);
    setKills(0);
    setResult(null);
    setProgression(createInitialPrototypeProgression());

    try {
      const game = new Game(canvas, hud, createActionPrototypeConfig(race, cls), {
        onPaused: () => setPhase("paused"),
        onResumed: () => setPhase("playing"),
        onGameOver: (runResult) => {
          setResult(runResult);
          setPhase("failed");
        },
        onEnemyDefeated: (_name, xp) => {
          setKills((count) => count + 1);
          setProgression((current) => awardPrototypeXp(current, xp));
        },
        onWaveChanged: setWave,
        onWaveCleared: (_clearedWave, xp) => {
          setProgression((current) => awardPrototypeXp(current, xp));
        },
        onCampaignComplete: (runResult) => {
          setResult(runResult);
          setPhase("complete");
        },
      });
      gameRef.current = game;
      game.start();
      setPhase("playing");
    } catch (cause) {
      console.error("Falha ao iniciar a expedição 3D:", cause);
      setError("Não foi possível iniciar a cena 3D neste navegador.");
      setPhase("menu");
    }
  }, [cls, race, teardown]);

  const resume = () => gameRef.current?.resume();
  const returnToMenu = () => {
    teardown();
    setPhase("menu");
  };

  const campaignPercent = Math.min(100, (wave / ACTION_PROTOTYPE_CAMPAIGN.waveLimit) * 100);

  return (
    <main className="action-prototype" aria-label="Protótipo de ação 3D de Aden">
      <canvas ref={canvasRef} className="action-prototype__world" aria-label="Mundo 3D" />
      <canvas ref={hudRef} className="action-prototype__canvas-hud" aria-hidden="true" />

      {phase === "menu" && (
        <section className="action-prototype__intro">
          <a className="action-prototype__back" href="/">‹ Voltar ao jogo Idle</a>
          <div className="action-prototype__eyebrow">ADEN ARENA · PROTÓTIPO JOGÁVEL</div>
          <h1>Uma nova forma<br />de viver Aden.</h1>
          <p className="action-prototype__lead">
            Entre nas ruínas, lute em tempo real e cresça com cada batalha. Esta expedição usa
            progressão própria e não altera seu personagem Idle.
          </p>

          <div className="action-prototype__mission">
            <span className="action-prototype__mission-mark">I</span>
            <div>
              <small>PRIMEIRA EXPEDIÇÃO · CAPÍTULO I</small>
              <strong>As Ruínas de Aden</strong>
              <p>Sobreviva a quatro investidas e derrote o guardião que desperta na quinta onda.</p>
            </div>
          </div>

          <div className="action-prototype__build-label">ESCOLHA SEU ESTILO DE COMBATE</div>
          <div className="action-prototype__builds" role="group" aria-label="Arquétipo">
            {BUILDS.map((entry, index) => {
              const selected = index === buildIndex;
              const currentClass = resolveBuild(entry).cls;
              return (
                <button
                  key={entry.classId}
                  type="button"
                  className={`action-prototype__build${selected ? " is-selected" : ""}`}
                  onClick={() => setBuildIndex(index)}
                  aria-pressed={selected}
                >
                  <span className="action-prototype__build-icon" style={{ color: currentClass.color }}>
                    {currentClass.weapon.emoji}
                  </span>
                  <span><strong>{entry.label}</strong><small>{entry.fantasy}</small></span>
                  {selected && <span className="action-prototype__check">✓</span>}
                </button>
              );
            })}
          </div>

          {error && <p className="action-prototype__error" role="alert">{error}</p>}
          <button className="action-prototype__enter" type="button" onClick={startRun}>
            INICIAR EXPEDIÇÃO <span>→</span>
          </button>
          <p className="action-prototype__controls">WASD mover · Shift correr · clique atacar · 1–2 habilidades · 3 poção · 4 comida · Esc pausa</p>
        </section>
      )}

      {(phase === "playing" || phase === "paused") && (
        <>
          <aside className="action-prototype__quest" aria-label="Objetivo da expedição">
            <div className="action-prototype__quest-top"><span>EXPEDIÇÃO ATIVA</span><span>CAP. I</span></div>
            <h2>{ACTION_PROTOTYPE_CAMPAIGN.zoneName}</h2>
            <p>Encontre o guardião nas profundezas e sobreviva ao encontro.</p>
            <div className="action-prototype__quest-progress">
              <div><span>Investida {Math.max(1, wave)} / {ACTION_PROTOTYPE_CAMPAIGN.waveLimit}</span><strong>{Math.round(campaignPercent)}%</strong></div>
              <i><b style={{ width: `${campaignPercent}%` }} /></i>
            </div>
            <div className="action-prototype__quest-stats">
              <span>HERÓI <strong>NV. {progression.level}</strong></span>
              <span>DERROTADOS <strong>{kills}</strong></span>
            </div>
            <div className="action-prototype__xp"><span>EXPERIÊNCIA</span><strong>{progression.xp} / {progression.xpToNext}</strong><i><b style={{ width: `${Math.min(100, progression.xp / progression.xpToNext * 100)}%` }} /></i></div>
          </aside>
          <div className="action-prototype__controls-hint">MOVER <b>W A S D</b><span /> MIRAR E ATACAR <b>CLIQUE</b></div>
        </>
      )}

      {phase === "paused" && (
        <section className="action-prototype__modal" role="dialog" aria-modal="true" aria-labelledby="action-pause-title">
          <small>EXPEDIÇÃO INTERROMPIDA</small><h2 id="action-pause-title">Respire, herói.</h2>
          <p>Seu progresso desta expedição permanece enquanto você decide o próximo passo.</p>
          <button type="button" onClick={resume}>RETOMAR A BATALHA</button>
          <button type="button" className="action-prototype__secondary" onClick={returnToMenu}>ABANDONAR EXPEDIÇÃO</button>
        </section>
      )}

      {(phase === "failed" || phase === "complete") && result && (
        <section className="action-prototype__modal" role="dialog" aria-modal="true" aria-labelledby="action-result-title">
          <small>{phase === "complete" ? "CAPÍTULO CONCLUÍDO" : "FIM DA EXPEDIÇÃO"}</small>
          <h2 id="action-result-title">{phase === "complete" ? "O guardião caiu." : "A jornada continua."}</h2>
          <p>{phase === "complete" ? "Você abriu caminho para a próxima região de Aden." : "Reúna forças e tente novamente. A experiência deste protótipo é local."}</p>
          <div className="action-prototype__result-grid">
            <span>Nível alcançado<strong>{progression.level}</strong></span>
            <span>Inimigos derrotados<strong>{result.kills}</strong></span>
            <span>Tempo na expedição<strong>{Math.floor(result.time / 60)}:{String(Math.floor(result.time % 60)).padStart(2, "0")}</strong></span>
            <span>Equipamentos<strong>{Object.keys(gameRef.current?.equipped ?? {}).length} / 3</strong></span>
          </div>
          <button type="button" onClick={startRun}>JOGAR NOVAMENTE</button>
          <button type="button" className="action-prototype__secondary" onClick={returnToMenu}>VOLTAR À ENTRADA</button>
        </section>
      )}
    </main>
  );
}
