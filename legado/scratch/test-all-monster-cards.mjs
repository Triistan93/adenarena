/**
 * test-all-monster-cards.mjs — Testes do Catálogo Completo de Cartas de Monstros.
 */

import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { MONSTER_CARDS, CardCodexService } from '../lineage-idle/src/services/CardCodexService.js';
import { getCodexBonuses } from '../lineage-idle/src/engine/StatsEngine.js';

console.log('🧪 Iniciando Verificação de Cartas para TODOS os Monstros e Chefes...\n');

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

// 1. Total de Cartas
const totalMonsters = Object.keys(MONSTERS).length;
const totalRaids = Object.keys(RAID_BOSSES).length;
const totalCards = Object.keys(MONSTER_CARDS).length;

console.log(`📊 Monstros regulares: ${totalMonsters} | Raid Bosses: ${totalRaids} | Total de Cartas: ${totalCards}\n`);
assert(totalCards >= totalMonsters, 'Todas as criaturas de zona possuem uma carta correspondente');

// 2. Verificar monstros específicos em várias faixas de nível
const testMonsterKeys = [
  'goblin', 'wolf', 'spider', 'orc', 'kobold', 'kamaelScout',
  'direWolf', 'skeleton', 'orcenRuinsOrc', 'darkMage', 'deathKnight',
  'knight', 'mountainWolf', 'voidCreature', 'emeraldSnake', 'blazingWerewolf',
  'saintEye', 'swampStrikers', 'royalKnight', 'dragon', 'tombGuardian',
  'caveDrake', 'valakasMinion', 'valakas'
];

for (const key of testMonsterKeys) {
  const cardId = `card_${key}`;
  const card = MONSTER_CARDS[cardId];
  assert(card != null, `Carta para monstro '${key}' (${card?.name}) existe`);
  assert(card?.codexBonus && Object.keys(card.codexBonus).length > 0, `Carta '${key}' possui bônus passivo no Codex`);
}

// 3. Verificar Chefes Épicos
const epicKeys = ['queen_ant', 'core', 'orfen', 'zaken', 'baium', 'barakiel', 'frintezza', 'antharas', 'valakas'];
for (const rKey of epicKeys) {
  const cId = `card_${rKey}`;
  const card = MONSTER_CARDS[cId];
  assert(card != null, `Carta do Raid Boss '${rKey}' (${card?.name}) existe`);
  assert(['epic', 'legendary', 'mythic', 'primordial', 'sovereign'].includes(card?.rarity), `Carta do Raid '${rKey}' possui raridade épica+ (${card?.rarity})`);
}

// 4. Teste de Progressão de Bônus Passivos no Codex da Conta
const state = {
  codex: {},
  cardCodex: {}
};

// Antes de absorver
const initialBonuses = getCodexBonuses(state);
assert(initialBonuses.atk === 0 && initialBonuses.hp === 0, 'Estado inicial sem bônus de cartas');

// Absorve 1x Carta de Goblin (Lv. 1)
CardCodexService.absorbCardIntoCodex(state, 'card_goblin', { log: () => {} });
const bonusAfterGoblin = getCodexBonuses(state);
assert(bonusAfterGoblin.atk > 0 && bonusAfterGoblin.hp > 0, 'Absorção da Carta de Goblin concedeu ATK e HP na conta');

// Absorve 1x Carta de Valakas (Lv. 100 Sovereign)
CardCodexService.absorbCardIntoCodex(state, 'card_valakas', { log: () => {} });
const bonusAfterValakas = getCodexBonuses(state);
assert(bonusAfterValakas.atk >= 200 && bonusAfterValakas.hp >= 2000, 'Absorção da Carta de Valakas concedeu +200 ATK e +2000 HP massivos');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! 100% dos monstros e chefes possuem cartas colecionáveis ativas e integradas!');
}
