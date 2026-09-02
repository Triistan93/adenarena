/**
 * test-noblesse-zones.mjs — Testes de Validação das Zonas e Boss da Quest de Noblesse.
 */

import { ZONES, SAGAS } from '../lineage-idle/src/data/zones.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { NoblesseService } from '../lineage-idle/src/services/NoblesseService.js';
import { NOBLESSE_QUEST_DEFS } from '../lineage-idle/src/data/quests.js';

console.log('🧪 Testando Integração Real da Quest de Noblesse com Zonas e Raid Bosses...\n');

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

// 1. Verificação da Zona Valley of Saints
const valleyZone = ZONES['valleyOfSaints'];
assert(valleyZone != null, 'Zona Valley of Saints existe em ZONES');
assert(valleyZone?.level === 72, 'Valley of Saints possui nível 72');
assert(Array.isArray(valleyZone?.monsters) && valleyZone.monsters.every(m => MONSTERS[m] != null), 'Todos os monstros de Valley of Saints existem em MONSTERS');

// 2. Verificação da Zona Swamp of Screams
const swampZone = ZONES['swampOfScreams'];
assert(swampZone != null, 'Zona Swamp of Screams existe em ZONES');
assert(swampZone?.level === 74, 'Swamp of Screams possui nível 74');
assert(Array.isArray(swampZone?.monsters) && swampZone.monsters.every(m => MONSTERS[m] != null), 'Todos os monstros de Swamp of Screams existem em MONSTERS');

// 3. Verificação do Raid Boss Barakiel
const barakielRaid = RAID_BOSSES['barakiel'];
assert(barakielRaid != null, 'Raid Boss Flame of Splendor Barakiel existe em RAID_BOSSES');
assert(barakielRaid?.lvl === 75, 'Barakiel é nível 75');
assert(barakielRaid?.drops?.some(d => d.itemId === 'staff_goddess_rain_song'), 'Barakiel dropa o Staff of Goddess: Rain Song');

// 4. Teste de Fluxo da Quest de Noblesse
const testState = {
  level: 76,
  isNoblesse: false,
  noblesseStep: 1,
  noblesseProgress: { part1Kills: 0, part2Kills: 0, barakielKilled: false },
  zone: 'valleyOfSaints'
};

// Parte 1: 25 kills em Valley of Saints
for (let i = 0; i < 25; i++) {
  NoblesseService.recordKill(testState, { id: 'saintEye' });
}
assert(testState.noblesseProgress.part1Kills === 25, '25 monstros abatidos em Valley of Saints');
const part1Complete = NoblesseService.completeStep(testState, 1, { log: () => {} });
assert(part1Complete === true && testState.noblesseStep === 2, 'Parte 1 de Noblesse concluída com sucesso');

// Parte 2: 30 kills em Swamp of Screams
testState.zone = 'swampOfScreams';
for (let i = 0; i < 30; i++) {
  NoblesseService.recordKill(testState, { id: 'swampStrikers' });
}
assert(testState.noblesseProgress.part2Kills === 30, '30 almas purificadas em Swamp of Screams');
const part2Complete = NoblesseService.completeStep(testState, 2, { log: () => {} });
assert(part2Complete === true && testState.noblesseStep === 3, 'Parte 2 de Noblesse concluída com sucesso');

// Parte 3: Abate do Barakiel
NoblesseService.recordKill(testState, { id: 'barakiel', name: 'Flame of Splendor Barakiel' });
assert(testState.noblesseProgress.barakielKilled === true, 'Barakiel abatido registrado no progresso');
const part3Complete = NoblesseService.completeStep(testState, 3, { log: () => {} });
assert(part3Complete === true && testState.noblesseStep === 4, 'Parte 3 de Noblesse concluída com sucesso');

// Parte 4: Consagração
const part4Complete = NoblesseService.completeStep(testState, 4, { log: () => {} });
assert(part4Complete === true && testState.isNoblesse === true, 'Consagração final: Personagem agora é NOBLESSE oficial de Aden!');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! Quest de Noblesse, Zonas reais e Barakiel integrados e validados!');
}
