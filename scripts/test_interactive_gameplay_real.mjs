/**
 * test_interactive_gameplay_real.mjs — Homologação Interativa no Navegador Real (Edge Headless)
 *
 * Executa no contexto do navegador Edge Headless contra o servidor Vite de produção:
 *   1. Criação pelos controles reais da tela (formulário, botões, eventos, applyStarterKit) e validação contra CANONICAL_CLASS_REGISTRY
 *   2. Aprendizado com débito real de SP via motor de produção (spendSP)
 *   3. Equipamento de habilidades no loadout com validação de slot desbloqueado e bloqueio de passivas e estrangeiras
 *   4. Ciclo de combate de produção (attackMonster) & auto-ataque com arma nas classes CONTENT_GAP com recompensas reais
 *   5. Promoção de classe real pelo fluxo de produção (promoteClass & canAdvance)
 *   6. Ciclo de subclasses pelos controles de produção (switchSubclass) nas 12 dimensões com asserções individuais
 *   7. Proteção contra execução de habilidade estrangeira (com registro de skills executadas) e venda de item no fluxo de produção
 *   8. Salvamento pelo jogo, recarga efetiva da página pelo navegador e reconstrução pelo carregador
 *   9. Gating efetivo de subclasses por temporada (controles reais e tentativa com nível 75)
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const TARGET_URL = 'http://localhost:5173/interactive_gameplay_suite.html';
const SCREENSHOT_PATH = path.resolve('public/edge_interactive_gameplay.png');
const REPORT_PATH = path.resolve('scripts/interactive_gameplay_report.json');

const REQUIRED_SCENARIOS = [
  'SCENARIO_1_INTERACTIVE_CREATION',
  'SCENARIO_2_PRODUCTION_SKILL_LEARNING',
  'SCENARIO_3_PRODUCTION_LOADOUT_EQUIP',
  'SCENARIO_4_PRODUCTION_COMBAT_CONTENT_GAP',
  'SCENARIO_5_PRODUCTION_CLASS_PROMOTION',
  'SCENARIO_6_SUBCLASS_12_DIMENSIONS_LIFECYCLE',
  'SCENARIO_7_FOREIGN_SKILL_AND_SOLD_ITEM_INTEGRITY',
  'SCENARIO_8_PRODUCTION_SAVE_AND_RELOAD',
  'SCENARIO_9_SEASON_GATING_SERVICE_AND_UI'
];

console.log('======================================================================');
console.log('ADEN ARENA — HOMOLOGAÇÃO DE GAMEPLAY NO NAVEGADOR REAL (EDGE HEADLESS)');
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
  '--virtual-time-budget=15000',
  TARGET_URL
];

const child = spawn(EDGE_PATH, edgeArgs);
let stdout = '';
let stderr = '';

child.stdout.on('data', (d) => { stdout += d.toString(); });
child.stderr.on('data', (d) => { stderr += d.toString(); });

child.on('close', (code) => {
  console.log(`[Edge Runner] Processo Microsoft Edge encerrado com código: ${code}`);

  if (code !== 0) {
    console.error(`[Edge Runner] FALHA FATAL: Navegador encerrou com código de erro ${code}.`);
    if (stderr) console.error('Stderr:', stderr);
    process.exit(1);
  }

  const match = stdout.match(/<pre id="gameplay-report-json">([\s\S]*?)<\/pre>/);
  if (!match) {
    console.error('[Edge Runner] FALHA FATAL: Tag <pre id="gameplay-report-json"> não encontrada no DOM retornado.');
    console.log('Trecho do DOM:', stdout.slice(0, 1000));
    if (stderr) console.error('Stderr:', stderr);
    process.exit(1);
  }

  let report;
  try {
    report = JSON.parse(match[1]);
  } catch (err) {
    console.error('[Edge Runner] FALHA FATAL: Erro ao parsear JSON do relatório:', err.message);
    process.exit(1);
  }

  console.log('----------------------------------------------------------------------');
  console.log(`Relatório Gerado: ${report.timestamp}`);
  console.log(`Navegador:        ${report.browser}`);
  console.log(`Total Cenários:   ${report.totalScenarios}`);
  console.log(`Aprovados (PASS): ${report.passedScenarios}`);
  console.log(`Falhas (FAIL):    ${report.failedScenarios}`);
  console.log(`Erros de Console: ${report.totalConsoleErrors}`);
  console.log('----------------------------------------------------------------------');

  // Validação 1: Cenários obrigatórios
  const presentScenarioIds = new Set((report.scenarios || []).map(s => s.scenarioId));
  const missingScenarios = REQUIRED_SCENARIOS.filter(id => !presentScenarioIds.has(id));
  if (missingScenarios.length > 0) {
    console.error(`[Edge Runner] FALHA: Faltam cenários obrigatórios no relatório: ${missingScenarios.join(', ')}`);
    process.exit(1);
  }

  // Validação 2: Coerência de totais
  const actualScenarioCount = (report.scenarios || []).length;
  const actualPassCount = (report.scenarios || []).filter(s => s.status === 'PASS').length;
  const actualFailCount = (report.scenarios || []).filter(s => s.status !== 'PASS').length;

  if (report.totalScenarios !== actualScenarioCount || report.passedScenarios !== actualPassCount || report.failedScenarios !== actualFailCount) {
    console.error(`[Edge Runner] FALHA: Divergência nos totais do relatório. Declarados: ${report.totalScenarios} total, ${report.passedScenarios} pass, ${report.failedScenarios} fail. Reais: ${actualScenarioCount} total, ${actualPassCount} pass, ${actualFailCount} fail.`);
    process.exit(1);
  }

  // Exibição detalhada dos cenários
  for (const sc of report.scenarios) {
    const badge = sc.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    console.log(`\n[${badge}] [${sc.type || 'TEST'}] ${sc.scenarioId}: ${sc.title}`);
    console.log(`   Estado Inicial: ${sc.initialState}`);
    console.log(`   Ações Reais:    ${sc.actions}`);
    console.log(`   Resultado:      ${sc.observed}`);
    if (sc.details) {
      if (Array.isArray(sc.details)) {
        console.log(`   Sub-casos:      ${sc.details.length} avaliados`);
      } else {
        console.log(`   Detalhes:       ${JSON.stringify(sc.details)}`);
      }
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n[Edge Runner] Relatório detalhado salvo com sucesso em: ${REPORT_PATH}`);

  // Validação 3: Aprovação estrita de todos os critérios
  if (report.failedScenarios === 0 && report.totalConsoleErrors === 0 && missingScenarios.length === 0) {
    console.log(`\n✅ RESULTADO: Todos os ${report.passedScenarios} cenários obrigatórios foram aprovados com sucesso no navegador Edge.`);
    process.exit(0);
  } else {
    console.error(`\n🚨 FALHA NA HOMOLOGAÇÃO: ${report.failedScenarios} cenários falharam ou ${report.totalConsoleErrors} erros de console foram detectados.`);
    process.exit(1);
  }
});
