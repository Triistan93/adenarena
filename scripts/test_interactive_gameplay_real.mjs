/**
 * test_interactive_gameplay_real.mjs — Homologação Interativa no Navegador Real (Edge Headless)
 *
 * Executa no contexto do navegador Edge Headless contra o servidor Vite de produção:
 *   1. Criação pelos controles reais da tela (formulário, botões, eventos, applyStarterKit)
 *   2. Aprendizado com débito real de SP via motor de produção (spendSP)
 *   3. Equipamento de habilidades no loadout com validação de slot e bloqueio de passivas (equipSkill)
 *   4. Ciclo de combate de produção (attackMonster) & auto-ataque com arma nas classes CONTENT_GAP
 *   5. Promoção de classe real pelo fluxo de produção (promoteClass & canAdvance)
 *   6. Ciclo de subclasses pelos controles de produção (switchSubclass) nas 12 dimensões
 *   7. Proteção contra execução de habilidade estrangeira e integridade de item vendido
 *   8. Salvamento pelo jogo, recarga efetiva e reconstrução pelo carregador (save -> loadGameState)
 *   9. Gating efetivo de temporada no serviço de produção (SeasonConfig.isFeatureUnlocked)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'http://localhost:5173/interactive_gameplay_suite.html';
const SCREENSHOT_PATH = path.resolve('public/edge_interactive_gameplay.png');
const REPORT_PATH = path.resolve('scripts/interactive_gameplay_report.json');

console.log('======================================================================');
console.log('ADEN ARENA — HOMOLOGAÇÃO INTERATIVA NO NAVEGADOR REAL (EDGE HEADLESS)');
console.log('======================================================================');
console.log(`[Edge Runner] Executável: ${EDGE_PATH}`);
console.log(`[Edge Runner] URL Alvo:   ${TARGET_URL}`);
console.log(`[Edge Runner] Screenshot: ${SCREENSHOT_PATH}`);

const edgeArgs = [
  '--headless=new',
  '--disable-gpu',
  '--dump-dom',
  '--window-size=1280,2400',
  `--screenshot=${SCREENSHOT_PATH}`,
  '--virtual-time-budget=10000',
  TARGET_URL
];

const child = spawn(EDGE_PATH, edgeArgs);
let stdout = '';
let stderr = '';

child.stdout.on('data', (d) => { stdout += d.toString(); });
child.stderr.on('data', (d) => { stderr += d.toString(); });

child.on('close', (code) => {
  console.log(`[Edge Runner] Microsoft Edge finalizado com código de saída: ${code}`);

  const match = stdout.match(/<pre id="gameplay-report-json">([\s\S]*?)<\/pre>/);
  if (!match) {
    console.error('ERRO: Não foi possível encontrar a tag <pre id="gameplay-report-json"> no DOM retornado.');
    console.log('Trecho do DOM:', stdout.slice(0, 1000));
    console.log('Stderr:', stderr);
    process.exit(1);
  }

  try {
    const report = JSON.parse(match[1]);
    console.log('----------------------------------------------------------------------');
    console.log(`Relatório Gerado: ${report.timestamp}`);
    console.log(`Navegador:        ${report.browser}`);
    console.log(`Total Cenários:   ${report.totalScenarios}`);
    console.log(`Aprovados (PASS): ${report.passedScenarios}`);
    console.log(`Falhas (FAIL):    ${report.failedScenarios}`);
    console.log(`Erros de Console: ${report.totalConsoleErrors}`);
    console.log('----------------------------------------------------------------------');

    for (const sc of report.scenarios) {
      const badge = sc.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
      console.log(`\n[${badge}] ${sc.scenarioId}: ${sc.title}`);
      console.log(`   Estado Inicial: ${sc.initialState}`);
      console.log(`   Ações Reais:    ${sc.actions}`);
      console.log(`   Resultado:      ${sc.observed}`);
      if (sc.details) {
        console.log(`   Sub-casos:      ${sc.details.length} avaliados`);
      }
    }

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n[Edge Runner] Relatório detalhado salvo com sucesso em: ${REPORT_PATH}`);

    if (report.failedScenarios === 0 && report.totalConsoleErrors === 0) {
      console.log('\n🎉 SUCESSO TOTAL: Todos os 9 cenários interativos foram homologados com motores de produção e ZERO erros!');
      process.exit(0);
    } else {
      console.error(`\n🚨 FALHA: ${report.failedScenarios} cenários falharam ou ${report.totalConsoleErrors} erros de console foram detectados.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('ERRO ao parsear JSON do relatório:', err);
    process.exit(1);
  }
});
