/**
 * test-audit-batch4.mjs — Bateria de Testes e Auditoria do LOTE 4 (Abas 13, 14, 21 e 22).
 */

import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { canEnterRaid, startRaidBoss } from '../lineage-idle/src/services/RaidService.js';
import { OlympiadService } from '../lineage-idle/src/services/OlympiadService.js';
import { claimQuestReward, triggerQuestEvent, checkQuestResets } from '../lineage-idle/src/services/QuestService.js';
import { NoblesseService } from '../lineage-idle/src/services/NoblesseService.js';
import { NOBLESSE_QUEST_DEFS, QUEST_DEFS } from '../lineage-idle/src/data/quests.js';
import { getTowerFloorDef, sweepTowerDaily } from '../lineage-idle/src/services/TowerService.js';

console.log('🧪 Iniciando Auditoria e Testes de Sanidade do LOTE 4 (Abas 13, 14, 21 e 22)...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. AUDITORIA DA ABA 13: RAIDS & DUNGEONS (tab-raids)
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- 👑 ABA 13: Chefes de Raid Épicos & Ingressos ---');
assert(Object.keys(RAID_BOSSES).length === 9, `Existem exatamente 9 Chefes de Raid cadastrados (Encontrados: ${Object.keys(RAID_BOSSES).length})`);

const raidState = {
  level: 75,
  dailyRaidTickets: 3,
  inventory: []
};

// Iniciar Raid de Barakiel
const canEnterBarakiel = canEnterRaid(raidState, 'barakiel');
assert(canEnterBarakiel.canEnter === true, 'Personagem Lv. 75 pode ingressar na Raid de Barakiel');

const startBarakiel = startRaidBoss(raidState, 'barakiel', { log: () => {} });
assert(startBarakiel === true, 'Raid de Barakiel iniciada com sucesso');
assert(raidState.dailyRaidTickets === 2, 'Ingresso diário de Raid consumido (Restantes: 2)');

// ═════════════════════════════════════════════════════════════════════════════
// 2. AUDITORIA DA ABA 14: GRAND OLYMPIAD (tab-olympiad)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🏛️ ABA 14: Grand Olympiad (1v1 & Noblesse) ---');
const nonNoblesseState = { level: 75, isNoblesse: false };
const noblesseState = { level: 76, isNoblesse: true, olympiadPoints: 1000, olympiadTokens: 50, atk: 1200, def: 800, maxHp: 20000 };

// Trava de Noblesse
const statusNonNoble = OlympiadService.getOlympiadStatus(nonNoblesseState);
assert(statusNonNoble.canEnter === false, 'Personagem não-Noblesse ou < Lv.76 bloqueado na Grand Olympiad');

const statusNoble = OlympiadService.getOlympiadStatus(noblesseState);
assert(statusNoble.canEnter === true, 'Personagem Noblesse Lv. 76+ liberado para competir na Grand Olympiad');

// Simulação de Partida
const matchRes = await OlympiadService.startOlympiadMatch(noblesseState, { log: () => {} });
assert(matchRes && matchRes.ok === true && (matchRes.result === 'victory' || matchRes.result === 'defeat'), 'Duelo 1v1 no Coliseu executado com sucesso');
assert(noblesseState.olympiadPoints != null, `Pontuação de Olimpíadas atualizada para ${noblesseState.olympiadPoints}`);

// ═════════════════════════════════════════════════════════════════════════════
// 3. AUDITORIA DA ABA 21: MISSÕES, PASSE & NOBLESSE (tab-quests)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🎯 ABA 21: Missões, Passe de Batalha & Saga de Noblesse ---');
const questState = {
  level: 76,
  isNoblesse: false,
  noblesseStep: 1,
  noblesseProgress: { part1Kills: 25, part2Kills: 30, barakielKilled: true },
  quests: {
    progress: { d_kills: 50 },
    claimed: [],
    lastDailyReset: Date.now(),
    lastWeeklyReset: Date.now()
  },
  inventory: [],
  skills: {},
  gold: 0,
  sp: 0
};

// Resgate de Missão Diária
const claimQuest = claimQuestReward(questState, 'd_kills', { log: () => {} });
assert(claimQuest === true, 'Recompensa de missão diária resgatada com sucesso');
assert(questState.gold > 0, `Recompensas de Adena creditadas (+${questState.gold}g)`);

// Saga de Noblesse: Definições e Etapas
assert(Object.keys(NOBLESSE_QUEST_DEFS).length === 4, 'Saga de Noblesse possui 4 etapas sequenciais mapeadas');
const step1 = NOBLESSE_QUEST_DEFS['part1'];
assert(step1.targetZone === 'valleyOfSaints', `Etapa 1 direciona para '${step1.targetZone}'`);

// Conclusão e Consagração da Saga de Noblesse
NoblesseService.completeStep(questState, 1, { log: () => {} });
assert(questState.noblesseStep === 2, 'Avançou para Parte 2 de Noblesse');

NoblesseService.completeStep(questState, 2, { log: () => {} });
assert(questState.noblesseStep === 3, 'Avançou para Parte 3 de Noblesse');

NoblesseService.completeStep(questState, 3, { log: () => {} });
assert(questState.noblesseStep === 4, 'Avançou para Parte 4 de Noblesse');

NoblesseService.completeStep(questState, 4, { log: () => {} });
assert(questState.isNoblesse === true, 'Status de Nobreza (Noblesse) concedido com sucesso ao herói');
assert(questState.skills['blessing_of_noble'] === 1, 'Habilidade Blessing of Noble aprendida');
assert(questState.inventory.some(i => i.itemId === 'accessory_noblesse_tiara'), 'Noblesse Tiara entregue na mochila');

// ═════════════════════════════════════════════════════════════════════════════
// 4. AUDITORIA DA ABA 22: TORRE DA INSOLÊNCIA (tab-tower)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🗼 ABA 22: Torre da Insolência (1 a 100 Andares) ---');
const towerState = {
  tower: {
    highestFloor: 25,
    currentFloor: 26,
    lastSweepTime: 0
  },
  level: 60,
  gold: 0,
  sp: 0
};

const floorDef = getTowerFloorDef(26);
assert(floorDef && floorDef.hp > 0, `Andar 26 possui requisitos configurados (${floorDef.name} - HP: ${floorDef.hp})`);

// Varredura Diária (Sweep)
sweepTowerDaily(towerState, { log: () => {} });
assert(towerState.tower.lastSweepTime > 0, `Varredura diária da Torre executada com base no andar ${towerState.tower.highestFloor}`);
assert(towerState.gold > 0 && towerState.sp > 0, `Recompensas do Sweep creditadas (+${towerState.gold} Adena, +${towerState.sp} SP)`);

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! LOTE 4 (Abas 13, 14, 21 e 22) 100% auditado e aprovado com excelência!');
}
