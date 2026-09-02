/**
 * test-audit-master-suite.mjs — Suíte Mestra de Sanidade e Auditoria das 23 Abas do Jogo.
 */

import { execSync } from 'child_process';

console.log('🏛️ ================================================================');
console.log('👑 LINEAGE IDLE — SUÍTE MESTRA DE AUDITORIA DAS 23 ABAS DO JOGO');
console.log('🏛️ ================================================================\n');

const batches = [
  { name: 'LOTE 1: Núcleo do Personagem (Abas 1 a 4 e 23)', script: 'scratch/test-audit-batch1.mjs' },
  { name: 'LOTE 2: Economia, Forja & Progressão (Abas 5, 6, 7, 10 e 20)', script: 'scratch/test-audit-batch2.mjs' },
  { name: 'LOTE 3: Coleções, Dolls & Expansão (Abas 8, 9, 11 e 12)', script: 'scratch/test-audit-batch3.mjs' },
  { name: 'LOTE 4: Chefes, Desafios & Endgame (Abas 13, 14, 21 e 22)', script: 'scratch/test-audit-batch4.mjs' },
  { name: 'LOTE 5: Territórios, PvP, Factions & Rankings (Abas 15, 16, 17, 18 e 19)', script: 'scratch/test-audit-batch5.mjs' },
  { name: 'TESTE EXTRA: 94 Cartas de Monstros & Drop Loop', script: 'scratch/test-all-monster-cards.mjs' }
];

let totalSuccess = true;

for (const b of batches) {
  console.log(`\n▶️ Executando: ${b.name}...`);
  try {
    const out = execSync(`node ${b.script}`, { encoding: 'utf-8' });
    console.log(out);
  } catch (err) {
    console.error(`❌ Falha no lote: ${b.name}`);
    console.error(err.stdout || err.message);
    totalSuccess = false;
    break;
  }
}

if (totalSuccess) {
  console.log('\n🌟 ================================================================');
  console.log('🏆 AUDITORIA TOTAL CONCLUÍDA COM 100% DE APROVAÇÃO!');
  console.log('Todas as 23 abas do Lineage Idle funcionam perfeitamente e com harmonia sistêmica.');
  console.log('🌟 ================================================================\n');
} else {
  process.exit(1);
}
