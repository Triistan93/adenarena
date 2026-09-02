import { generateStateChecksum, validateStateIntegrity, sanitizeGameState, validateOfflineTime } from '../lineage-idle/src/engine/SecurityEngine.js';
import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';

console.log('🧪 INICIANDO TESTES DE SEGURANÇA, PERFORMANCE E INTEGRIDADE DE SAVE...\n');

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

// 1. Teste de Checksum e Integridade
const testState = DEFAULT_STATE();
testState.level = 45;
testState.gold = 50000;
testState.xp = 1200000;
testState.sp = 350;
testState.race = 'human';
testState.class = 'gladiator';

const chk = generateStateChecksum(testState);
assert(typeof chk === 'string' && chk.length > 0, 'Checksum gerado com sucesso');

testState._chk = chk;
const validCheck = validateStateIntegrity(testState);
assert(validCheck.valid === true, 'Save legítimo validado com sucesso');

// 2. Teste de Detecção de Trapaça / Adulteração
const tamperedState = { ...testState, gold: 999999999 };
const tamperedCheck = validateStateIntegrity(tamperedState);
assert(tamperedCheck.valid === false, 'Adulteração de Ouro detectada via Checksum');

const illegalLevelState = { ...testState, level: 999, _chk: undefined };
const illegalLevelCheck = validateStateIntegrity(illegalLevelState);
assert(illegalLevelCheck.valid === false, 'Nível acima do teto (100) rejeitado na validação');

// 3. Teste de Sanitização de Estado
const dirtyState = {
  level: -5,
  gold: -1000,
  xp: -50,
  hp: 999999,
  maxHp: 100,
  inventory: [
    { itemId: 'weapon_sword', count: -10, enchant: 50 },
    null,
    { itemId: null, count: 5 },
    { itemId: 'hp_potion', count: 10, enchant: 0 }
  ]
};

const cleanState = sanitizeGameState(dirtyState);
assert(cleanState.level === 1, 'Nível negativo sanitizado para 1');
assert(cleanState.gold === 0, 'Ouro negativo sanitizado para 0');
assert(cleanState.hp <= cleanState.maxHp, 'HP clampado ao MaxHP');
assert(cleanState.inventory.length === 2, 'Itens nulos ou sem itemId removidos do inventário');
assert(cleanState.inventory[0].count === 1, 'Contagem negativa de item sanitizada para 1');
assert(cleanState.inventory[0].enchant <= 30, 'Encantamento absurdo sanitizado para teto seguro');

// 4. Teste de Validação de Tempo Offline
const now = Date.now();
const past2Hours = now - (2 * 60 * 60 * 1000);
const offline2h = validateOfflineTime(past2Hours);
assert(offline2h.valid === true && offline2h.minutesOffline === 120, '2 horas offline validadas corretamente (120 min)');

const past10Days = now - (10 * 24 * 60 * 60 * 1000);
const offline10d = validateOfflineTime(past10Days);
assert(offline10d.valid === true && offline10d.minutesOffline === 720, 'Tempo excessivo limitado ao teto máximo de 12 horas (720 min)');

const futureTime = now + (24 * 60 * 60 * 1000); // Relógio adiantado
const offlineCheat = validateOfflineTime(futureTime);
assert(offlineCheat.valid === false && offlineCheat.minutesOffline === 0, 'Viagem no tempo / Relógio no futuro rejeitado');

console.log(`\n========================================`);
console.log(`RESULTADO: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
