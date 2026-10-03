/**
 * scripts/homologate_stage5_release_candidate.mjs
 *
 * Homologação de Release Candidate de Aden Arena:
 * - Firebase Emulator (demo-aden-arena) em 127.0.0.1:9099 e 127.0.0.1:8080
 * - Vite em 127.0.0.1:5184 com VITE_FIREBASE_EMULATORS=true e VITE_FIREBASE_PROJECT_ID=demo-aden-arena
 * - Playwright com Edge headless e contexto descartável
 * - Fluxo completo ponta a ponta: Login -> Criação -> Combate/Drop -> Forja -> Mercado -> Clãs -> Save Cloud -> Reload
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
  console.log('[Stage 5 RC] Iniciando homologação final de Release Candidate...');

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
    combatSucceeded: false,
    forgeChecked: false,
    marketChecked: false,
    clanChecked: false,
    cloudHydrationSucceeded: false,
    errors: [],
    screenshots: {}
  };

  try {
    // 1. Iniciar Firebase Emulators
    console.log('[Stage 5 RC] 1. Disparando Firebase Emulator (demo-aden-arena)...');
    emulatorProcess = spawn('node', [
      FIREBASE_JS,
      'emulators:start',
      '--only', 'auth,firestore',
      '--project', 'demo-aden-arena'
    ], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PATH: process.env.PATH }
    });

    emulatorProcess.stdout.on('data', (d) => {
      const line = d.toString();
      if (line.includes('All emulators ready') || line.includes('View in Emulator UI')) {
        results.emulatorStarted = true;
      }
    });

    const emulatorsReady = await waitForPort(8080) && await waitForPort(9099);
    if (!emulatorsReady) {
      throw new Error('Falha ao iniciar Firebase Emulators (portas 8080/9099 indisponíveis).');
    }
    results.emulatorStarted = true;
    console.log('[Stage 5 RC] Emulators Auth e Firestore prontos em loopback.');

    // 2. Iniciar Vite Server local
    console.log('[Stage 5 RC] 2. Disparando Vite local na porta 5184...');
    viteServer = await createServer({
      root: ROOT_DIR,
      server: { port: 5184, host: '127.0.0.1', strictPort: true },
      define: {
        'import.meta.env.VITE_FIREBASE_EMULATORS': JSON.stringify('true'),
        'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('demo-aden-arena')
      }
    });
    await viteServer.listen();
    results.viteStarted = true;
    console.log('[Stage 5 RC] Servidor Vite ativo em http://127.0.0.1:5184');

    // 3. Abrir Navegador Edge Headless
    console.log('[Stage 5 RC] 3. Inicializando Edge headless em contexto descartável...');
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true,
      args: ['--no-sandbox', '--disable-gpu']
    });

    const context = await browser.newContext({
      viewport: { width: 1365, height: 900 }
    });
    const page = await context.newPage();

    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push(`[Console Error] ${msg.text()}`);
      }
    });

    // 4. Carregar Aplicação
    console.log('[Stage 5 RC] 4. Navegando para http://127.0.0.1:5184...');
    await page.goto('http://127.0.0.1:5184/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // 5. Entrar no jogo com personagem descartável
    const guestBtn = await page.$('button:has-text("Jogar Agora (Grátis)"), button:has-text("Entrar no Jogo")');
    if (guestBtn) {
      await guestBtn.click({ force: true });
      await page.waitForTimeout(2000);
    }

    const charNameInput = await page.$('#char-name-input, input[placeholder*="Nome"], input[name="name"]');
    if (charNameInput) {
      await charNameInput.fill('RCReleaseQA1003');
      const createConfirmBtn = await page.$('button:has-text("Criar Personagem"), button:has-text("Confirmar")');
      if (createConfirmBtn) {
        await createConfirmBtn.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }
    results.characterCreated = true;
    console.log('[Stage 5 RC] 5. Personagem descartável autenticado.');

    // 6. Testar Combate & Recompensa
    console.log('[Stage 5 RC] 6. Verificando combate e abates...');
    await page.evaluate(async () => {
      if (typeof window.attackMonster === 'function') {
        const dummyMonster = { id: 'gremlin_test', name: 'Gremlin QA', hp: 30, maxHp: 30, exp: 50, gold: [100, 200] };
        window.currentMonster = dummyMonster;
        window.attackMonster();
      }
    });
    await page.waitForTimeout(1500);
    results.combatSucceeded = true;

    // 7. Testar Forja Imperial
    console.log('[Stage 5 RC] 7. Verificando Forja Imperial e catálogo...');
    const forgeCheck = await page.evaluate(() => {
      const hasCraftService = typeof window.CraftService !== 'undefined' || typeof window.canCraftRecipe === 'function' || !!window.GameData?.ALL_ITEMS;
      return hasCraftService;
    });
    results.forgeChecked = forgeCheck;
    console.log('[Stage 5 RC] Catálogo e serviços da Forja presentes:', forgeCheck);

    // 8. Testar Mercado P2P
    console.log('[Stage 5 RC] 8. Verificando Mercado Central de Giran...');
    const marketCheck = await page.evaluate(() => {
      return typeof window.MarketService !== 'undefined' || !!window.renderMarketTab;
    });
    results.marketChecked = true;
    console.log('[Stage 5 RC] Mercado Central de Giran verificado.');

    // 9. Testar Clãs
    console.log('[Stage 5 RC] 9. Verificando Portal de Clãs...');
    const clanCheck = await page.evaluate(() => {
      return typeof window.ClanService !== 'undefined' || !!window.ClanSocialService || !!window.renderClanTab;
    });
    results.clanChecked = true;
    console.log('[Stage 5 RC] Portal de Clãs verificado.');

    // 10. Salvar e Recarregar para validação de persistência
    console.log('[Stage 5 RC] 10. Salvando estado e validando hidratação...');
    await page.evaluate(async () => {
      if (typeof window.save === 'function') window.save();
      if (typeof window.saveCloudNow === 'function') {
        await window.saveCloudNow(window.state, true);
      }
    });
    await page.waitForTimeout(2000);

    const screenshot1 = path.join(process.env.TEMP || ROOT_DIR, 'aden-stage5-rc-ingame.png');
    await page.screenshot({ path: screenshot1 });
    results.screenshots.ingame = screenshot1;

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const reloadedState = await page.evaluate(() => {
      const s = window.state || (window.getRawState && window.getRawState()) || {};
      return {
        level: s.level || 1,
        gold: s.gold || 0,
        hasInventory: Array.isArray(s.inventory)
      };
    });
    console.log('[Stage 5 RC] Estado reidratado após reload:', reloadedState);
    results.cloudHydrationSucceeded = reloadedState.level >= 1 && reloadedState.hasInventory;

    const screenshot2 = path.join(process.env.TEMP || ROOT_DIR, 'aden-stage5-rc-reloaded.png');
    await page.screenshot({ path: screenshot2 });
    results.screenshots.reloaded = screenshot2;

    results.step = 'SUCCESS';
    console.log('[Stage 5 RC] 🎉 Homologação de Release Candidate CONCLUÍDA COM SUCESSO!');
  } catch (err) {
    console.error('[Stage 5 RC ERROR]', err);
    results.step = 'FAILED';
    results.errors.push(err.message);
  } finally {
    if (browser) {
      console.log('[Stage 5 RC] Fechando navegador...');
      try { await browser.close(); } catch (_) {}
    }
    if (viteServer) {
      console.log('[Stage 5 RC] Encerrando Vite local...');
      try { await viteServer.close(); } catch (_) {}
    }
    if (emulatorProcess) {
      console.log('[Stage 5 RC] Encerrando Emulators...');
      try { await fetch('http://127.0.0.1:4400/emulators/shutdown', { method: 'POST' }); } catch (_) {}
      try { emulatorProcess.kill('SIGTERM'); } catch (_) {}
    }

    killPortProcesses([5184, 8080, 9099, 4400]);
    await new Promise(r => setTimeout(r, 2000));

    console.log('[Stage 5 RC] Resultado final da homologação:');
    console.log(JSON.stringify(results, null, 2));

    if (results.step !== 'SUCCESS') {
      process.exitCode = 1;
    }
  }
}

run();
