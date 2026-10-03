/**
 * test_browser_stage1.mjs — Smoke de runtime da Etapa 1 no Edge Headless
 *
 * Executa módulos reais do jogo no runtime do Edge, com perfil e estado descartáveis.
 * Não carrega a interface completa, Firebase, nem qualquer save do usuário.
 *   1. Estado inicial de personagem com combate pausado
 *   2. Combate autorizado e recompensa pelo handler de produção
 *   3. Equipamento e recálculo dinâmico de atributos
 *   4. Elegibilidade da 1ª Transferência pelo motor de progressão
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = 3459;
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function generateHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Aden Arena — Runtime Smoke: Etapa 1</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #06080f; color: #d0d7de; padding: 24px; }
    h1 { color: #f0883e; font-size: 22px; border-bottom: 1px solid #21262d; padding-bottom: 8px; margin-bottom: 16px; }
    .scenario-card { background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .scenario-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #21262d; padding-bottom: 8px; margin-bottom: 12px; }
    .scenario-title { font-weight: bold; color: #f0f6fc; font-size: 14px; }
    .scenario-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; }
    .badge-pass { background: #238636; color: #fff; }
    .badge-fail { background: #da3633; color: #fff; }
    .field-row { display: flex; font-size: 12px; margin: 4px 0; }
    .field-label { width: 180px; color: #8b949e; font-weight: bold; }
    .field-val { flex: 1; color: #c9d1d9; font-family: monospace; }
    .log-box { background: #161b22; border: 1px solid #30363d; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 11px; max-height: 120px; overflow-y: auto; margin-top: 8px; }
    #summary-panel { margin-top: 24px; padding: 16px; background: #161b22; border: 2px solid #30363d; border-radius: 8px; }
    pre { margin: 0; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <h1>Aden Arena — Runtime Smoke da Etapa 1 (Edge)</h1>
  <p>Harness técnico com módulos reais e dados descartáveis. Não representa validação visual da aplicação completa.</p>
  <div id="scenarios-container"></div>
  <div id="summary-panel">
    <h2 style="color: #58a6ff; font-size: 16px; margin-top: 0;">Relatório de Homologação da Jornada Inicial</h2>
    <pre id="stage1-report-json">Executando testes no navegador...</pre>
  </div>

  <script type="module">
    const scenarios = [];
    const consoleErrors = [];
    let gameMainForCleanup = null;

    window.addEventListener('error', (e) => {
      consoleErrors.push({ message: e.message, filename: e.filename, lineno: e.lineno });
    });

    try {
      const { DEFAULT_STATE, applyStarterKit } = await import('/lineage-idle/src/core/StateManager.js');
      const { startCombat, stopCombat, pickRandomMonster } = await import('/lineage-idle/src/engine/CombatEngine.js');
      const { equipItem, unequipItem } = await import('/lineage-idle/src/services/EquipmentService.js');
      const { getStats } = await import('/lineage-idle/src/engine/StatsEngine.js');
      const { ALL_ITEMS } = await import('/lineage-idle/src/data/items/index.js');
      const { addToInventory } = await import('/lineage-idle/src/services/InventoryService.js');
      const { ClassProgressionEngine } = await import('/lineage-idle/src/engine/ClassProgressionEngine.js');

      window.__serverSeason = 1;
      window.GameData = {
        ALL_ITEMS,
        ZONE_GOLD_MULT: {},
        rollDrop: () => [{ id: 'bone_breastplate', itemId: 'bone_breastplate', rarity: 'common', isEquipment: true, amount: 1 }]
      };

      // ──────────────────────────────────────────────────────────────────────────
      // CENÁRIO 1: Criação e Chegada com Combate Pausado (Consentimento Obrigatório)
      // ──────────────────────────────────────────────────────────────────────────
      {
        const state = DEFAULT_STATE();
        applyStarterKit(state, 'human', 'fighter', 'AdenExplorer', 'M');

        const isPaused = state.isCombatActive === false;
        const safeZone = state.zone === 'talkingIsland';
        const hasWeapon = !!state.equipment.weapon;
        const pass = isPaused && safeZone && hasWeapon && state.level === 1;

        scenarios.push({
          id: 'STAGE1-SCENARIO-01',
          title: 'Estado inicial do personagem & combate pausado no boot',
          status: pass ? 'PASS' : 'FAIL',
          observed: 'Zone=' + state.zone + ', isCombatActive=' + state.isCombatActive + ', weaponEquipped=' + hasWeapon,
          details: {
            level: state.level,
            xp: state.xp,
            zone: state.zone,
            hp: state.hp + '/' + state.maxHp,
            combatPaused: isPaused
          }
        });
      }

      // ──────────────────────────────────────────────────────────────────────────
      // CENÁRIO 2: Consentimento Explícito, Encontro na Zona e Concessão de Vitória
      // ──────────────────────────────────────────────────────────────────────────
      {
        const state = DEFAULT_STATE();
        applyStarterKit(state, 'human', 'fighter', 'AdenHero', 'M');

        const logs = [];
        const callbacks = {
          log: (m) => logs.push(m),
          updateAllUI: () => {},
          save: () => {}
        };

        // Jogador autoriza o combate
        // Use the real main-module state bridge after boot. Vite's direct test imports can
        // be a distinct ESM instance from main.js, so replacing their snapshot is insufficient.
        gameMainForCleanup = await import('/lineage-idle/main.js');
        gameMainForCleanup.init();
        window.state = state;
        const gameState = window.getRawState();
        const attackMonster = gameMainForCleanup.attackMonster;
        startCombat(gameState, callbacks);
        const combatStarted = gameState.isCombatActive === true;
        const monsterSpawned = !!gameState.activeMonster && gameState.activeMonster.hp > 0;

        // Força somente o HP do inimigo para encurtar o cenário; a vitória e a recompensa
        // devem passar pelo handler real do jogo, não por mutação direta de XP/Adena.
        gameState.activeMonster.hp = 1;
        gameState.activeMonster.maxHp = 1;
        const initialXp = gameState.xp;
        const initialGold = gameState.gold;
        const initialKills = gameState.stats?.monstersKilled || 0;
        const defeatedMonster = gameState.activeMonster;
        const defeatedMonsterName = defeatedMonster.name;
        const defeatedMonsterMaxHp = defeatedMonster._maxHp || defeatedMonster.maxHp || defeatedMonster.hp;
        const handlerStateShared = typeof window.getRawState === 'function' && window.getRawState() === gameState;
        attackMonster();
        const rewardedState = window.getRawState();
        const xpGained = rewardedState.xp > initialXp;
        const goldGained = rewardedState.gold > initialGold;
        const killRecorded = (rewardedState.stats?.monstersKilled || 0) === initialKills + 1;
        const dropReceived = rewardedState.inventory.some(item => item.itemId === 'bone_breastplate');

        stopCombat(rewardedState);
        const combatPausedAfter = rewardedState.isCombatActive === false;

        const pass = combatStarted && monsterSpawned && handlerStateShared && xpGained && goldGained && killRecorded && dropReceived && combatPausedAfter;

        scenarios.push({
          id: 'STAGE1-SCENARIO-02',
          title: 'Combate autorizado & recompensa pelo handler de produção',
          status: pass ? 'PASS' : 'FAIL',
          observed: 'Defeated=' + defeatedMonsterName + ', XP=' + xpGained + ', Adena=' + goldGained + ', Kills=' + killRecorded + ', Drop=' + dropReceived,
          details: {
            defeatedMonster: defeatedMonsterName,
            defeatedMonsterMaxHp,
            xpGained,
            goldGained,
            killRecorded,
            dropReceived,
            combatStoppedCleanly: combatPausedAfter,
            combatStarted,
            handlerStateShared,
            nextMonster: gameState.activeMonster?.name || null
          }
        });
      }

      // ──────────────────────────────────────────────────────────────────────────
      // CENÁRIO 3: Drop na Mochila, Equipamento e Recálculo de Atributos via StatsEngine
      // ──────────────────────────────────────────────────────────────────────────
      {
        const state = DEFAULT_STATE();
        applyStarterKit(state, 'human', 'fighter', 'KnightTest', 'M');

        const initialStats = getStats(state);
        const initialAtk = initialStats.atk;

        // Simula drop e adição à mochila
        addToInventory(state, 'knight_sword', 1, 'common', false, {}, true);
        const droppedItem = state.inventory.find(i => i.itemId === 'knight_sword' && !i.equipped);
        const dropUid = droppedItem ? droppedItem.uid : null;

        // Jogador equipa o novo item
        equipItem(state, dropUid, 'weapon');
        const equippedNow = droppedItem && droppedItem.equipped === true;
        const slotCorrect = state.equipment.weapon === dropUid;

        const updatedStats = getStats(state);
        const statsRecalculated = updatedStats.atk > 0 && updatedStats.combatPower > 0;

        // Desequipa para verificar integridade
        unequipItem(state, 'weapon');
        const unequipped = state.equipment.weapon === null && droppedItem.equipped === false;

        const pass = Boolean(dropUid && equippedNow && slotCorrect && statsRecalculated && unequipped);

        scenarios.push({
          id: 'STAGE1-SCENARIO-03',
          title: 'Drop na Mochila, Equipar Item & Recálculo de Atributos',
          status: pass ? 'PASS' : 'FAIL',
          observed: 'Equipped=' + equippedNow + ', P.Atk=' + updatedStats.atk + ', CP=' + updatedStats.combatPower + ', UnequippedCleanly=' + unequipped,
          details: {
            itemUid: dropUid,
            equipped: equippedNow,
            pAtk: updatedStats.atk,
            pDef: updatedStats.def,
            combatPower: updatedStats.combatPower
          }
        });
      }

      // ──────────────────────────────────────────────────────────────────────────
      // CENÁRIO 4: Progressão de Nível & Elegibilidade para 1ª Transferência (Lv 20)
      // ──────────────────────────────────────────────────────────────────────────
      {
        const state = DEFAULT_STATE();
        applyStarterKit(state, 'human', 'fighter', 'ClassTransferHero', 'M');

        // Verifica a elegibilidade real do DAG e da temporada, não somente o nível numérico.
        state.class = 'fighter';
        state.character = { ...(state.character || {}), classId: 'fighter' };
        state.race = 'human';
        state.level = 19;
        const canAdvanceAt19 = ClassProgressionEngine.getAvailablePromotions('fighter', state.level, 'human').length > 0;

        // Nível 20: desbloqueado com destinos canônicos compatíveis
        state.level = 20;
        const promotions = ClassProgressionEngine.getAvailablePromotions('fighter', state.level, 'human');
        const canAdvanceAt20 = promotions.length > 0;
        const childrenIds = promotions.map(promotion => promotion.id);
        const hasOptions = childrenIds.length >= 2;

        const pass = !canAdvanceAt19 && canAdvanceAt20 && hasOptions;

        scenarios.push({
          id: 'STAGE1-SCENARIO-04',
          title: 'Gating Canônico da 1ª Transferência de Classe no Nível 20',
          status: pass ? 'PASS' : 'FAIL',
          observed: 'Lv19 Eligible=' + canAdvanceAt19 + ', Lv20 Eligible=' + canAdvanceAt20 + ', Options=' + childrenIds.join(', '),
          details: {
            classId: state.class,
            eligibleAt20: canAdvanceAt20,
            availableClassPromotions: childrenIds
          }
        });
      }

    } catch (err) {
      consoleErrors.push({ message: err.message, stack: err.stack });
    }

    // init() installs the game's clock, autosave, and UI intervals. Stop them before
    // Chromium's virtual-time dump so the smoke page can finish deterministically.
    try {
      gameMainForCleanup?.destroy();
    } catch (err) {
      consoleErrors.push({ message: 'Game cleanup failed: ' + err.message, stack: err.stack });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Renderização dos Resultados na Interface do Navegador
    // ──────────────────────────────────────────────────────────────────────────
    const container = document.getElementById('scenarios-container');
    const passedCount = scenarios.filter(s => s.status === 'PASS').length;

    scenarios.forEach(s => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      const badgeClass = s.status === 'PASS' ? 'badge-pass' : 'badge-fail';

      card.innerHTML = \`
        <div class="scenario-header">
          <span class="scenario-title">\${s.id}: \${s.title}</span>
          <span class="scenario-badge \${badgeClass}">\${s.status}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Resultado Observado:</span>
          <span class="field-val">\${s.observed}</span>
        </div>
        <div class="log-box">
          <pre>\${JSON.stringify(s.details, null, 2)}</pre>
        </div>
      \`;
      container.appendChild(card);
    });

    const report = {
      timestamp: new Date().toISOString(),
      totalScenarios: scenarios.length,
      passedScenarios: passedCount,
      failedScenarios: scenarios.length - passedCount,
      totalConsoleErrors: consoleErrors.length,
      consoleErrors,
      scenarios
    };

    document.getElementById('stage1-report-json').textContent = JSON.stringify(report, null, 2);
  </script>
</body>
</html>`;
}

let vite;
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  let pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(generateHtml());
    return;
  }

  vite.middlewares(req, res, () => {
    res.writeHead(404);
    res.end('Not found: ' + pathname);
  });
});

vite = await createViteServer({
  configFile: path.join(ROOT_DIR, 'vite.config.ts'),
  root: ROOT_DIR,
  server: { middlewareMode: true, hmr: false },
  appType: 'custom'
});

const isolatedProfile = fs.mkdtempSync(path.join(os.tmpdir(), 'adenarena-edge-stage1-'));

server.listen(PORT, () => {
  console.log(`[Browser Stage 1 Server] Listening on http://localhost:${PORT}`);

  const screenshotPath = path.resolve('public/edge_stage1_journey.png');
  const edgeArgs = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--dump-dom',
    '--window-size=1280,1800',
    '--user-data-dir=' + isolatedProfile,
    '--screenshot=' + screenshotPath,
    '--virtual-time-budget=5000',
    `http://localhost:${PORT}/`
  ];

  console.log(`[Browser Stage 1] Spawning Edge: ${EDGE_PATH}`);
  const child = spawn(EDGE_PATH, edgeArgs);

  let stdout = '';
  let stderr = '';

  child.stdout.on('data', d => { stdout += d.toString(); });
  child.stderr.on('data', d => { stderr += d.toString(); });

  child.on('close', async code => {
    console.log(`[Browser Stage 1] Edge exited with code ${code}`);
    let exitCode = code === 0 ? 0 : 1;

    const match = stdout.match(/<pre id="stage1-report-json">([\s\S]*?)<\/pre>/);
    if (match) {
      try {
        const report = JSON.parse(match[1]);
        console.log('========================================================');
        console.log('REAL BROWSER (EDGE) ETAPA 1 RUNTIME SMOKE REPORT:');
        console.log(`Scenarios: ${report.passedScenarios}/${report.totalScenarios} PASSED`);
        console.log(`Console Errors: ${report.totalConsoleErrors}`);
        console.log('========================================================');
        for (const s of report.scenarios) {
          console.log(`[${s.status}] ${s.id}: ${s.title}`);
          console.log(`       Observed: ${s.observed}`);
        }
        console.log('========================================================');
        if (report.consoleErrors && report.consoleErrors.length > 0) {
          console.error('Console errors:', report.consoleErrors);
        }

        fs.writeFileSync('scripts/edge_stage1_homologation_report.json', JSON.stringify({
          ...report,
          testScope: 'Runtime smoke dos módulos reais com estado descartável; não valida visualmente a aplicação completa e não usa Firebase.'
        }, null, 2), 'utf-8');

        if (report.failedScenarios === 0 && report.totalConsoleErrors === 0) {
          console.log('SUCCESS: All Stage 1 runtime smoke scenarios passed in real Microsoft Edge!');
          exitCode = 0;
        } else {
          console.error(`FAILURE: ${report.failedScenarios} scenarios failed or ${report.totalConsoleErrors} console errors.`);
          exitCode = 1;
        }
      } catch (err) {
        console.error('Error parsing report JSON:', err);
        exitCode = 1;
      }
    } else {
      console.log('Stdout length:', stdout.length, 'Stderr:', stderr);
      exitCode = 1;
    }

    await new Promise(resolve => server.close(resolve));
    await vite.close();
    fs.rmSync(isolatedProfile, { recursive: true, force: true });
    process.exit(exitCode);
  });
});
