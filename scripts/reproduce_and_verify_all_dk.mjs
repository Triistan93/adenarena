import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9228;
const TARGET_URL = 'http://localhost:5173/';
const tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-audit-dk4-'));

console.log('[Runner] Launching Edge on port', PORT);
const edgeArgs = [
  '--headless=new',
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${tempUserDataDir}`,
  '--window-size=1280,1600',
  TARGET_URL
];

const edgeProcess = spawn(EDGE_PATH, edgeArgs);

async function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function getWebSocketUrl() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs.find(t => t.type === 'page');
      if (pageTab && pageTab.webSocketDebuggerUrl) {
        return pageTab.webSocketDebuggerUrl;
      }
    } catch (e) {}
    await wait(500);
  }
  throw new Error('Could not connect to Edge DevTools');
}

const STARTERS = [
  {
    raceName: 'Elfo',
    raceId: 'elf',
    classId: 'elf_deathknight_0',
    className: 'Death Knight',
    desc: 'Elf Death Knight'
  },
  {
    raceName: 'Humano',
    raceId: 'human',
    classId: 'human_deathknight_0',
    className: 'Death Knight',
    desc: 'Human Death Knight'
  },
  {
    raceName: 'Elfo Negro',
    raceId: 'darkelf',
    classId: 'delf_deathknight_0',
    className: 'Death Knight',
    desc: 'Dark Elf Death Knight'
  }
];

async function main() {
  const results = [];
  try {
    const wsUrl = await getWebSocketUrl();
    console.log('[Runner] Connected to Edge CDP:', wsUrl);

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    for (const starter of STARTERS) {
      console.log(`\n=================================================================`);
      console.log(`TESTANDO STARTER: ${starter.desc} (${starter.classId})`);
      console.log(`=================================================================`);

      // 1. Limpar storage e navegar para TARGET_URL
      await send('Page.navigate', { url: TARGET_URL });
      await wait(3000);

      await send('Runtime.evaluate', {
        expression: `(() => {
          localStorage.clear();
          sessionStorage.clear();
        })()`,
        returnByValue: true
      });
      await send('Page.reload', {});
      await wait(3500);

      // 2. Selecionar Raça e Nome Aleatório
      const stepRace = await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const rndBtn = buttons.find(b => b.textContent.includes('Aleatório') || b.textContent.includes('🎲'));
          if (rndBtn) rndBtn.click();

          const raceBtn = buttons.find(b => b.textContent.includes('${starter.raceName}'));
          if (raceBtn) raceBtn.click();
          return { raceFound: !!raceBtn, raceText: raceBtn?.textContent?.trim() };
        })()`,
        returnByValue: true
      });
      console.log('1. Seleção de Raça:', stepRace.result?.value);
      await wait(1200);

      // 3. Selecionar Classe Death Knight
      const stepClass = await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const dkBtn = buttons.find(b => b.textContent.includes('${starter.className}'));
          if (dkBtn) dkBtn.click();
          return { dkFound: !!dkBtn, dkText: dkBtn?.textContent?.trim() };
        })()`,
        returnByValue: true
      });
      console.log('2. Seleção de Classe:', stepClass.result?.value);
      await wait(1200);

      // 4. Submeter formulário
      const stepSubmit = await send('Runtime.evaluate', {
        expression: `(() => {
          const submitBtn = document.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.click();
            return { clicked: true, text: submitBtn.textContent.trim() };
          }
          return { clicked: false };
        })()`,
        returnByValue: true
      });
      console.log('3. Submissão da Criação:', stepSubmit.result?.value);

      // 5. Aguardar entrada no jogo
      let gameState = null;
      for (let i = 0; i < 15; i++) {
        await wait(1000);
        const check = await send('Runtime.evaluate', {
          expression: `(() => {
            const st = window.getGameState ? window.getGameState() : window.state;
            return {
              ready: !!(st && st.class),
              class: st?.class,
              race: st?.race,
              skills: st?.skills,
              sp: st?.sp
            };
          })()`,
          returnByValue: true
        });
        if (check.result?.value?.ready) {
          gameState = check.result.value;
          console.log(`Entrou no jogo em ${i+1}s:`, gameState);
          break;
        }
      }

      // 6. Avaliar contexto V2 e todas as abas de Habilidades (Ativas, Passivas, Ultimates)
      const analysis = await send('Runtime.evaluate', {
        expression: `(() => {
          const st = window.getGameState ? window.getGameState() : window.state;
          const root = window.__SHADOW_ROOT__ || document;

          // Clicar na aba principal de Habilidades
          const skillsBtn = root.querySelector('button[data-tab="skills"]');
          if (skillsBtn) skillsBtn.click();

          const forbiddenFighterSkills = ['Ataque Poderoso', 'Golpe Mortal', 'Disparo Poderoso', 'Explosão de Energia', 'Soco de Ferro'];

          // 1. Aba Ativas
          const activeSubtab = root.querySelector('.skill-subtab-btn[data-tab="active"]');
          if (activeSubtab) activeSubtab.click();
          const activeCards = Array.from(root.querySelectorAll('.skill-card'));
          const activeNames = activeCards.map(c => c.querySelector('.skill-name, .skill-card-name, h4, h5')?.textContent?.trim() || c.textContent?.trim());

          // 2. Aba Passivas
          const passiveSubtab = root.querySelector('.skill-subtab-btn[data-tab="passive"]');
          if (passiveSubtab) passiveSubtab.click();
          const passiveCards = Array.from(root.querySelectorAll('.skill-card'));
          const passiveNames = passiveCards.map(c => c.querySelector('.skill-name, .skill-card-name, h4, h5')?.textContent?.trim() || c.textContent?.trim());

          // 3. Aba Ultimates
          const ultSubtab = root.querySelector('.skill-subtab-btn[data-tab="ultimate"]');
          if (ultSubtab) ultSubtab.click();
          const ultCards = Array.from(root.querySelectorAll('.skill-card'));
          const ultNames = ultCards.map(c => c.querySelector('.skill-name, .skill-card-name, h4, h5')?.textContent?.trim() || c.textContent?.trim());

          const allPresentedNames = [...activeNames, ...passiveNames, ...ultNames];
          const leakedSkills = allPresentedNames.filter(name => forbiddenFighterSkills.some(f => name && name.includes(f)));

          return {
            charName: st?.charName,
            persistedClass: st?.class,
            persistedRace: st?.race,
            skills: st?.skills,
            activeCount: activeCards.length,
            activeNames,
            passiveCount: passiveCards.length,
            passiveNames,
            ultCount: ultCards.length,
            ultNames,
            allPresentedCount: allPresentedNames.length,
            leakedSkills,
            hasHellfire: allPresentedNames.some(n => n && (n.includes('Hellfire') || n.includes('hellfire'))),
            hasChangeArmor: allPresentedNames.some(n => n && (n.includes('Change Armor') || n.includes('change_armor'))),
            hasSwordMastery: allPresentedNames.some(n => n && (n.includes('Sword') || n.includes('sword_blunt_mastery'))),
            hasHeavyMastery: allPresentedNames.some(n => n && (n.includes('Heavy Armor') || n.includes('heavy_armor_mastery'))),
            hasBoostHp: allPresentedNames.some(n => n && (n.includes('Boost HP') || n.includes('boost_hp')))
          };
        })()`,
        returnByValue: true
      });
      console.log('4. Análise de Habilidades & DOM:', JSON.stringify(analysis.result?.value, null, 2));

      // 7. Recarga Real (location.reload)
      console.log('5. Executando Page.reload real...');
      await send('Page.reload', {});
      await wait(4000);

      // 8. Re-entrar no jogo via LoginScreen (clique em JOGAR AGORA GRÁTIS que restaura lineageIdleSave_v2)
      const enterAfterReload = await send('Runtime.evaluate', {
        expression: `(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const guestBtn = buttons.find(b => b.textContent.includes('JOGAR AGORA GRÁTIS') || b.textContent.includes('ENTRAR NO JOGO'));
          if (guestBtn) {
            guestBtn.click();
            return { clicked: true, text: guestBtn.textContent.trim() };
          }
          return { clicked: false };
        })()`,
        returnByValue: true
      });
      console.log('6. Re-entrada após reload:', enterAfterReload.result?.value);
      await wait(3000);

      const reloadCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const st = window.getGameState ? window.getGameState() : window.state;
          const root = window.__SHADOW_ROOT__ || document;
          const skillsBtn = root.querySelector('button[data-tab="skills"]');
          if (skillsBtn) skillsBtn.click();

          const forbiddenFighterSkills = ['Ataque Poderoso', 'Golpe Mortal', 'Disparo Poderoso', 'Explosão de Energia', 'Soco de Ferro'];

          const activeSubtab = root.querySelector('.skill-subtab-btn[data-tab="active"]');
          if (activeSubtab) activeSubtab.click();
          const activeCards = Array.from(root.querySelectorAll('.skill-card'));
          const activeNames = activeCards.map(c => c.querySelector('.skill-name, .skill-card-name, h4, h5')?.textContent?.trim() || c.textContent?.trim());

          const passiveSubtab = root.querySelector('.skill-subtab-btn[data-tab="passive"]');
          if (passiveSubtab) passiveSubtab.click();
          const passiveCards = Array.from(root.querySelectorAll('.skill-card'));
          const passiveNames = passiveCards.map(c => c.querySelector('.skill-name, .skill-card-name, h4, h5')?.textContent?.trim() || c.textContent?.trim());

          const allNames = [...activeNames, ...passiveNames];
          const leakedSkills = allNames.filter(name => forbiddenFighterSkills.some(f => name && name.includes(f)));

          return {
            survivedClass: st?.class,
            survivedRace: st?.race,
            skills: st?.skills,
            activeCount: activeCards.length,
            passiveCount: passiveCards.length,
            allNames,
            leakedSkills
          };
        })()`,
        returnByValue: true
      });
      console.log('7. Estado e Habilidades após Recarga:', JSON.stringify(reloadCheck.result?.value, null, 2));

      // Screenshot
      const ss = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`public/edge_audit_${starter.classId}.png`, Buffer.from(ss.data, 'base64'));
      console.log(`Screenshot salva em public/edge_audit_${starter.classId}.png`);

      results.push({
        starter: starter.classId,
        desc: starter.desc,
        analysis: analysis.result?.value,
        reloadCheck: reloadCheck.result?.value,
        passed: (
          analysis.result?.value?.persistedClass === starter.classId &&
          analysis.result?.value?.leakedSkills?.length === 0 &&
          analysis.result?.value?.hasChangeArmor === true &&
          analysis.result?.value?.hasSwordMastery === true &&
          analysis.result?.value?.hasHeavyMastery === true &&
          analysis.result?.value?.hasBoostHp === true &&
          reloadCheck.result?.value?.survivedClass === starter.classId &&
          reloadCheck.result?.value?.leakedSkills?.length === 0
        )
      });
    }

    console.log('\n=================================================================');
    console.log('RESUMO FINAL DA REGRESSÃO DOS 3 STARTERS DEATH KNIGHT');
    console.log('=================================================================');
    console.log(JSON.stringify(results, null, 2));

    ws.close();
    edgeProcess.kill();
  } catch (err) {
    console.error('Erro na execução do runner:', err);
    edgeProcess.kill();
  }
}

main();
