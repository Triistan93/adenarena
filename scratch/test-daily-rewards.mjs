import { DAILY_REWARDS_TABLE, getDailyRewardStatus, claimDailyReward, getTodayDateString, ensureDailyRewardsState } from '../lineage-idle/src/services/DailyRewardService.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

console.log('🧪 INICIANDO TESTES DO SISTEMA DE RECOMPENSAS DIÁRIAS (DAILY CHECK-IN)...\n');

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FALHA: ${name}`);
    failed++;
  }
}

// 1. Validação da Tabela de 28 Dias
assert(DAILY_REWARDS_TABLE.length === 28, 'Calendário possui exatamente 28 dias configurados');
assert(DAILY_REWARDS_TABLE[6].isMilestone === true, 'Dia 7 é um Grande Marco (Milestone)');
assert(DAILY_REWARDS_TABLE[13].isMilestone === true, 'Dia 14 é um Grande Marco (Milestone)');
assert(DAILY_REWARDS_TABLE[20].isMilestone === true, 'Dia 21 é um Grande Marco (Milestone)');
assert(DAILY_REWARDS_TABLE[27].isMilestone === true, 'Dia 28 é a Coroa Suprema de Aden (Milestone)');

// 2. Teste de Estado Inicial
const state = DEFAULT_STATE();
const initialStatus = getDailyRewardStatus(state);
assert(initialStatus.canClaim === true, 'Primeiro acesso: Recompensa disponível para resgate');
assert(initialStatus.currentDay === 1, 'Inicia no Dia 1');
assert(initialStatus.streak === 0, 'Sequência inicial é 0');

// 3. Teste de Primeiro Resgate
let itemsAdded = [];
const helpers = {
  log: (msg) => {},
  floatText: (msg) => {},
  addToInventory: (itemId, count) => {
    itemsAdded.push({ itemId, count });
  }
};

const initialGold = state.gold;
const claim1 = claimDailyReward(state, helpers);
assert(claim1.success === true, 'Resgate do Dia 1 executado com sucesso');
assert(state.gold === initialGold + 50000, '50.000 Adena creditadas corretamente no Dia 1');
assert(state.dailyRewards.currentDay === 2, 'Avançou automaticamente para o Dia 2');
assert(state.dailyRewards.streak === 1, 'Sequência incrementada para 1 dia');
assert(state.dailyRewards.lastClaimDate === getTodayDateString(), 'Data de hoje registrada no lastClaimDate');

// 4. Teste de Prevenção de Resgate Duplo no Mesmo Dia
const claimAgain = claimDailyReward(state, helpers);
assert(claimAgain.success === false, 'Resgate duplo no mesmo dia bloqueado com sucesso');

const statusAfterClaim = getDailyRewardStatus(state);
assert(statusAfterClaim.canClaim === false, 'canClaim agora é false para o dia de hoje');

// 5. Teste de Resgate de Marcos Especiais (Dia 7 e Dia 28)
state.dailyRewards.lastClaimDate = '2026-08-01'; // Simula dia seguinte
state.dailyRewards.currentDay = 7;
const claimDay7 = claimDailyReward(state, helpers);
assert(claimDay7.success === true, 'Resgate do Marco do Dia 7 executado com sucesso');
assert(itemsAdded.some(i => i.itemId === 'scroll_enchant_weapon_d'), 'Pergaminhos de Encantamento D entregues no Dia 7');

// 6. Teste de Loop do Ciclo de 28 Dias
state.dailyRewards.lastClaimDate = '2026-08-02';
state.dailyRewards.currentDay = 28;
const claimDay28 = claimDailyReward(state, helpers);
assert(claimDay28.success === true, 'Resgate do Dia 28 (Coroa Suprema) executado com sucesso');
assert(state.dailyRewards.currentDay === 1, 'Após o Dia 28, o calendário reinicia suavemente no Dia 1');
assert(state.dailyRewards.streak === 3, 'Sequência total preservada e incrementada');

console.log(`\n========================================`);
console.log(`RESULTADO DOS TESTES DIÁRIOS: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
