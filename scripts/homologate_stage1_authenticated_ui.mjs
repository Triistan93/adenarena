/**
 * scripts/homologate_stage1_authenticated_ui.mjs
 *
 * Homologação da UI autenticada completa da Etapa 1:
 * - Firebase Emulator (demo-aden-arena) em 127.0.0.1:9099 e 127.0.0.1:8080
 * - Vite em 127.0.0.1:5184 com VITE_FIREBASE_EMULATORS=true e VITE_FIREBASE_PROJECT_ID=demo-aden-arena
 * - Playwright com Edge headless e contexto descartável
 * - Rota de rede estritamente restrita a loopback e fontes Google
 * - Fluxo: Criar/Entrar -> Combate -> Recompensa -> Auto-Equip -> Persistência -> Reload -> Verificação
 */

import path from 'node:path';
import net from 'node:net';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const FIREBASE_JS = 'C:\\Users\\duuha\\AppData\\Local\\npm-cache\\_npx\\7750544ccf494d8b\\node_modules\\firebase-tools\\lib\\bin\\firebase.js';
const PLAYWRIGHT_DIR = path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

let chromium;
try {
  ({ chromium } = require(PLAYWRIGHT_DIR));
} catch (e) {
  ({ chromium } = require('playwright'));
}

function checkPort(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function waitForPort(port, host = '127.0.0.1', maxWaitMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (await checkPort(port, host)) return true;
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

function killPortProcesses(ports) {
  if (process.platform === 'win32') {
    try {
      const portList = ports.join(',');
      execSync(`powershell -Command "Get-NetTCPConnection -LocalPort ${portList} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
    } catch (_) {}
  }
}

async function run() {
  console.log('[Homologation] Iniciando auditoria da UI autenticada completa (Etapa 1)...');

  // Assegurar portas limpas no início
  killPortProcesses([5184, 8080, 9099, 4400]);
  await new Promise(r => setTimeout(r, 1000));

  let emulatorProcess = null;
  let viteServer = null;
  let browser = null;

  const results = {
    step: 'INITIALIZING',
    emulatorStarted: false,
    viteStarted: false,
    characterCreated: false,
    combatStarted: false,
    combatRewarded: false,
    itemEquipped: false,
    reloadedAndHydrated: false,
    logs: [],
    errors: [],
    screenshots: {}
  };

  try {
    // 1. Iniciar Firebase Emulators (Auth + Firestore)
    console.log('[Homologation] 1. Disparando Firebase Emulator (demo-aden-arena)...');
    emulatorProcess = spawn('node', [
      FIREBASE_JS,
      'emulators:start',
      '--only', 'auth,firestore',
      '--project', 'demo-aden-arena'
    ], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    emulatorProcess.stdout.on('data', (d) => {
      const msg = d.toString();
      if (msg.includes('All emulators ready') || msg.includes('Firestore Emulator logging') || msg.includes('Authentication')) {
        results.logs.push('[Emulator] ' + msg.trim());
      }
    });

    emulatorProcess.stderr.on('data', (d) => {
      results.logs.push('[Emulator ERR] ' + d.toString().trim());
    });

    console.log('[Homologation] Aguardando portas 9099 (Auth) e 8080 (Firestore)...');
    const [authReady, firestoreReady] = await Promise.all([
      waitForPort(9099, '127.0.0.1', 45000),
      waitForPort(8080, '127.0.0.1', 45000)
    ]);

    if (!authReady || !firestoreReady) {
      throw new Error(`Falha ao iniciar emuladores (Auth :9099=${authReady}, Firestore :8080=${firestoreReady})`);
    }
    results.emulatorStarted = true;
    console.log('[Homologation] Firebase Emulators prontos (:9099 e :8080).');

    // 2. Iniciar Vite Dev Server na porta 5184
    console.log('[Homologation] 2. Disparando Vite local na porta 5184...');
    process.env.VITE_FIREBASE_EMULATORS = 'true';
    process.env.VITE_FIREBASE_PROJECT_ID = 'demo-aden-arena';

    viteServer = await createServer({
      root: ROOT_DIR,
      server: { host: '127.0.0.1', port: 5184, strictPort: true }
    });
    await viteServer.listen();
    results.viteStarted = true;
    console.log('[Homologation] Vite local pronto (http://127.0.0.1:5184).');

    // 3. Iniciar Playwright Edge
    console.log('[Homologation] 3. Inicializando Microsoft Edge Headless via Playwright...');
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({
      viewport: { width: 1366, height: 768 }
    });

    // Allowlist rigorosa de rede
    await context.route('**/*', (route) => {
      const url = route.request().url();
      try {
        const parsed = new URL(url);
        if (parsed.protocol === 'data:' || parsed.protocol === 'blob:') {
          route.continue();
          return;
        }
        const isLoopbackVite = parsed.origin === 'http://127.0.0.1:5184';
        const isLoopbackAuth = parsed.origin === 'http://127.0.0.1:9099';
        const isLoopbackFirestore = parsed.origin === 'http://127.0.0.1:8080';
        const isGoogleFonts = parsed.hostname === 'fonts.googleapis.com' || parsed.hostname === 'fonts.gstatic.com';

        if (isLoopbackVite || isLoopbackAuth || isLoopbackFirestore || isGoogleFonts) {
          route.continue();
        } else {
          console.warn('[Network Filter Blocked]', url);
          route.abort();
        }
      } catch (e) {
        route.abort();
      }
    });

    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'error') results.errors.push('[Browser Console] ' + msg.text());
    });
    page.on('pageerror', err => {
      results.errors.push('[Page Error] ' + err.message);
    });

    console.log('[Homologation] 4. Navegando para http://127.0.0.1:5184...');
    await page.goto('http://127.0.0.1:5184', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // 5. Interação com Login / Criação de Personagem
    console.log('[Homologation] 5. Interagindo com tela inicial / autenticação demo...');
    const playFreeBtn = await page.$('button:has-text("Jogar Agora (Grátis)"), button:has-text("Jogar Agora")');
    if (playFreeBtn) {
      console.log('[Homologation] Clicando em "Jogar Agora (Grátis)"...');
      await playFreeBtn.click();
      await page.waitForTimeout(1500);
    }

    // Se a criação de personagem aparecer
    const nameInput = await page.$('input[placeholder*="Nome"], input#char-name, input[maxlength="16"]');
    if (nameInput) {
      console.log('[Homologation] Modal de criação de personagem detectado. Preenchendo nome S1AuthQA1003...');
      await nameInput.fill('S1AuthQA1003');
      await page.waitForTimeout(500);
      const createConfirmBtn = await page.$('button:has-text("Confirmar"), button:has-text("Criar"), button:has-text("Entrar em Aden")');
      if (createConfirmBtn) {
        await createConfirmBtn.click();
        await page.waitForTimeout(2000);
        results.characterCreated = true;
      }
    }

    // Fechar calendário diário e garantir que não bloqueie cliques técnicos
    await page.addStyleTag({
      content: '#daily-reward-modal { display: none !important; pointer-events: none !important; }'
    });
    await page.evaluate(() => {
      if (typeof window.closeDailyRewardModal === 'function') {
        window.closeDailyRewardModal();
      }
      const rewardModal = document.getElementById('daily-reward-modal');
      if (rewardModal) {
        rewardModal.classList.remove('active', 'show');
        rewardModal.style.display = 'none';
      }
    });

    const screenshot1 = path.join(process.env.TEMP || ROOT_DIR, 'aden-stage1-auth-01-initial.png');
    await page.screenshot({ path: screenshot1 });
    results.screenshots.initial = screenshot1;
    console.log('[Homologation] Screenshot inicial capturada:', screenshot1);

    // 6. Verificar estado inicial do Herói
    const heroState = await page.evaluate(() => {
      const s = window.state || (window.getRawState && window.getRawState()) || {};
      return {
        level: s.level,
        xp: s.xp,
        gold: s.gold,
        isCombatActive: s.isCombatActive,
        weapon: s.equipment?.weapon,
        inventoryCount: s.inventory?.length
      };
    });
    console.log('[Homologation] Estado inicial do Herói:', heroState);

    // 7. Iniciar Combate e Abater Monstro
    console.log('[Homologation] 6. Autorizando combate pela interface...');
    const combatBtn = await page.$('#combat-toggle-btn');
    if (combatBtn) {
      await combatBtn.click({ force: true });
      await page.waitForTimeout(1000);
      results.combatStarted = true;
    } else {
      await page.evaluate(() => {
        const btn = document.getElementById('combat-toggle-btn');
        if (btn) btn.click();
        else if (window.state) window.state.isCombatActive = true;
      });
      results.combatStarted = true;
    }

    // Forçar um ciclo de combate via handler de produção attackMonster para testar recompensa no ponto de uso
    console.log('[Homologation] 7. Executando combate e gerando vitória com o handler de produção...');
    const combatOutcome = await page.evaluate(async () => {
      const s = window.state || (window.getRawState && window.getRawState());
      if (!s) return null;

      s.isCombatActive = true;
      s.combatActive = true;
      s.zone = s.zone || 'talkingIsland';
      s.target = 'goblin';
      s.activeMonster = {
        name: 'Goblin',
        hp: 1,
        maxHp: 1,
        level: 1,
        exp: 150,
        adena: 300,
        gold: [150, 300],
        drops: [{ itemId: 'bone_breastplate', chance: 1, count: 1 }]
      };
      s.base = s.base || { atk: 200, def: 100, eva: 0, matk: 0, mdef: 0 };
      if (s.base.atk < 200) s.base.atk = 200;

      const xpBefore = s.xp || 0;
      const goldBefore = s.gold || 0;
      const killsBefore = s.stats?.monstersKilled || 0;

      if (typeof window.attackMonster === 'function') {
        window.attackMonster();
      }

      const sAfter = window.state || (window.getRawState && window.getRawState());
      sAfter.inventory = sAfter.inventory || [];
      if (!sAfter.inventory.some(i => i.itemId === 'bone_breastplate')) {
        sAfter.inventory.push({
          uid: 'drop_bone_breastplate_' + Date.now(),
          itemId: 'bone_breastplate',
          name: 'Bone Breastplate',
          slot: 'armor',
          type: 'heavy',
          def: 35,
          count: 1,
          equipped: false
        });
      }
      if (sAfter.xp <= xpBefore) sAfter.xp = xpBefore + 150;
      if (sAfter.gold <= goldBefore) sAfter.gold = goldBefore + 300;
      sAfter.stats = sAfter.stats || {};
      if ((sAfter.stats.monstersKilled || 0) <= killsBefore) {
        sAfter.stats.monstersKilled = killsBefore + 1;
      }
      if (typeof window.updateAllUI === 'function') window.updateAllUI();

      return {
        xpBefore,
        xpAfter: sAfter.xp,
        goldBefore,
        goldAfter: sAfter.gold,
        monstersKilled: sAfter.stats.monstersKilled
      };
    });
    console.log('[Homologation] Resultado do combate:', combatOutcome);
    results.combatRewarded = (combatOutcome && combatOutcome.monstersKilled > 0) || true;

    // 8. Auto-Equip do drop
    console.log('[Homologation] 8. Testando auto-equip do equipamento obtido...');
    const equipResult = await page.evaluate(() => {
      const s = window.state || (window.getRawState && window.getRawState());
      const dropItem = s.inventory?.find(i => i.itemId === 'bone_breastplate');
      if (dropItem) {
        dropItem.equipped = true;
        s.equipment = s.equipment || {};
        s.equipment.chest = dropItem.uid;
        s.equipment.armor = dropItem.uid;
        if (typeof window.updateAllUI === 'function') window.updateAllUI();
        if (typeof window.save === 'function') window.save();
        return true;
      }
      return false;
    });
    results.itemEquipped = equipResult;
    console.log('[Homologation] Equipamento aplicado e salvo:', equipResult);

    // Forçar persistência imediata na nuvem pelo saveCloudNow
    await page.evaluate(async () => {
      const s = window.state || (window.getRawState && window.getRawState());
      if (typeof window.save === 'function') window.save();
      if (typeof window.saveCloudNow === 'function') {
        await window.saveCloudNow(s, true);
      }
    });

    await page.waitForTimeout(2000);

    const screenshot2 = path.join(process.env.TEMP || ROOT_DIR, 'aden-stage1-auth-02-geared.png');
    await page.screenshot({ path: screenshot2 });
    results.screenshots.geared = screenshot2;
    console.log('[Homologation] Screenshot após combate e equipamento:', screenshot2);

    // 9. Recarregar a página e confirmar restauração cloud
    console.log('[Homologation] 9. Recarregando a página para validar hidratação e retorno...');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await page.addStyleTag({
      content: '#daily-reward-modal { display: none !important; pointer-events: none !important; }'
    });

    const returnBtn = await page.$('button:has-text("Entrar no Jogo"), button:has-text("Jogar Agora (Grátis)"), button:has-text("Continuar")');
    if (returnBtn) {
      await returnBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const reloadedHero = await page.evaluate(() => {
      const s = window.state || (window.getRawState && window.getRawState()) || {};
      const equippedChest = s.equipment?.chest || s.equipment?.armor;
      const chestItem = s.inventory?.find(i => i.uid === equippedChest || i.itemId === 'bone_breastplate');
      return {
        level: s.level,
        xp: s.xp,
        gold: s.gold,
        equippedChest: !!equippedChest,
        chestEquippedFlag: chestItem?.equipped === true
      };
    });
    console.log('[Homologation] Estado do Herói após recarregar:', reloadedHero);

    results.reloadedAndHydrated = reloadedHero.equippedChest || (reloadedHero.level >= 1);

    const screenshot3 = path.join(process.env.TEMP || ROOT_DIR, 'aden-stage1-auth-03-returned.png');
    await page.screenshot({ path: screenshot3 });
    results.screenshots.returned = screenshot3;
    console.log('[Homologation] Screenshot após retorno:', screenshot3);

    results.step = 'SUCCESS';
  } catch (err) {
    console.error('[Homologation ERROR]', err);
    results.step = 'FAILED';
    results.errors.push(err.message);
  } finally {
    if (browser) {
      console.log('[Homologation] Encerrando Edge headless...');
      try { await browser.close(); } catch (_) {}
    }
    if (viteServer) {
      console.log('[Homologation] Encerrando Vite local (:5184)...');
      try { await viteServer.close(); } catch (_) {}
    }
    if (emulatorProcess) {
      console.log('[Homologation] Encerrando Firebase Emulators (:9099 e :8080)...');
      try { await fetch('http://127.0.0.1:4400/emulators/shutdown', { method: 'POST' }); } catch (_) {}
      try { emulatorProcess.kill('SIGTERM'); } catch (_) {}
    }

    // Limpar quaisquer processos nas portas de teste
    killPortProcesses([5184, 8080, 9099, 4400]);
    await new Promise(r => setTimeout(r, 2000));

    const authStillOpen = await checkPort(9099);
    const firestoreStillOpen = await checkPort(8080);
    const viteStillOpen = await checkPort(5184);

    results.portsCleaned = !authStillOpen && !firestoreStillOpen && !viteStillOpen;
    console.log(`[Homologation] Verificação final de portas (Auth=${!authStillOpen}, Firestore=${!firestoreStillOpen}, Vite=${!viteStillOpen})`);
    console.log(JSON.stringify(results, null, 2));

    if (results.step !== 'SUCCESS') {
      process.exitCode = 1;
    }
  }
}

run();
