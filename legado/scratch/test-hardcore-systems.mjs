/**
 * test-hardcore-systems.mjs — Suíte de Testes Automatizados dos 4 Módulos de Engenharia de Jogo.
 */

import { CombatValidatorEngine, MilestoneBossValidator } from '../lineage-idle/src/engine/CombatValidatorEngine.js';
import { CardCodexService, MONSTER_CARDS } from '../lineage-idle/src/services/CardCodexService.js';
import { ResetService } from '../lineage-idle/src/services/ResetService.js';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { executeMassiveItemSink, checkAccountForgeLevel } from '../lineage-idle/src/services/CraftService.js';
import { RARITIES, getEnchantVisuals } from '../lineage-idle/src/data/rarities.js';

console.log('🧪 Iniciando Verificação dos 4 Módulos de Engenharia de Jogo Hardcore...\n');

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

// ─────────────────────────────────────────────────────────────
// MÓDULO 1: COMBATE, MOVESETS, BARREIRA 4★ E HARD DPS CHECK
// ─────────────────────────────────────────────────────────────
console.log('--- 1. MÓDULO 1: COMBATE & RESTRIÇÕES RÍGIDAS ---');

// 1.1 Movesets por Arma
const bowWeapon = { id: 'hunting_bow', name: 'Arco de Caça', weaponType: 'bow' };
const swordWeapon = { id: 'katana_blade', name: 'Katana Ancestral', weaponType: 'katana' };
const bowSkill = { name: 'Double Shot', requiredWeaponType: 'bow', rarity: '1★', mpCost: 15 };
const katanaSkill = { name: 'Iaijutsu Slash', requiredWeaponType: 'katana', rarity: '1★', mpCost: 20 };

const bowValidationOk = CombatValidatorEngine.validateWeaponMoveset(bowWeapon, bowSkill);
assert(bowValidationOk.valid === true, 'Arco pode disparar habilidade de Arco (Double Shot)');

const bowValidationFail = CombatValidatorEngine.validateWeaponMoveset(swordWeapon, bowSkill);
assert(bowValidationFail.valid === false, 'Katana NÃO pode disparar habilidade de Arco (bloqueio de moveset)');

// 1.2 Barreira de Ultimate 4★ (Spellbook como Consumo no Aprendizado)
const ultimateSkill = {
  id: 'ultimate_sakura_storm',
  name: 'Sakura Storm',
  rarity: '4★',
  isUltimate: true,
  requiredWeaponType: 'katana',
  requiredSpellbookId: 'spellbook_4star_sakura',
  mpCost: 80
};

const playerState = {
  level: 80,
  mp: 200,
  skills: {},
  inventory: []
};

// Tentativa de aprender sem o livro -> Deve FALHAR
const learnFail = CombatValidatorEngine.checkSkillLearnRequirements(playerState, ultimateSkill);
assert(learnFail.canLearn === false, 'Bloqueado aprendizado de Ultimate 4★ sem possuir o Spellbook 4★ na mochila');

// Adiciona o livro na mochila e aprende
playerState.inventory.push({ id: 'spellbook_4star_sakura', name: 'Spellbook 4★ Sakura Storm', count: 1 });
const learnResult = CombatValidatorEngine.learnSkill(playerState, ultimateSkill, { log: () => {} });
assert(learnResult.success === true, 'Habilidade 4★ aprendida com sucesso com consumo do Spellbook');
assert(playerState.skills['ultimate_sakura_storm']?.learned === true, 'Habilidade 4★ marcada permanentemente como aprendida');
assert(playerState.inventory.length === 0, 'Spellbook 4★ foi consumido da mochila como Item Sink no aprendizado');

// Conjuração após aprendida: NÃO exige mais o livro na mochila
const castValidation = CombatValidatorEngine.validateSkillCast(playerState, swordWeapon, ultimateSkill);
assert(castValidation.canCast === true, 'Habilidade 4★ aprendida pode ser conjurada livremente sem exigir o Spellbook na mochila');

// 1.3 Hard DPS Check & Milestone Boss Enrage
const bossState = {
  name: 'Antharas o Dragão da Terra',
  currentHp: 500000,
  maxHp: 1000000,
  enrageTimerSeconds: 120,
  requiredElement: 'fire',
  requiredElementDmgThreshold: 50000
};

const okFight = MilestoneBossValidator.evaluateBossFight(bossState, 60, 5000, { fire: 30000 });
assert(okFight.isWiped === false, 'Boss dentro do tempo de combate (60s / 120s) não causa wipe');

const enrageWipe = MilestoneBossValidator.evaluateBossFight(bossState, 120, 5000, { fire: 60000 });
assert(enrageWipe.isWiped === true && enrageWipe.reason.includes('Hard Enrage'), 'Tempo esgotado (120s) ativa Hard Enrage e aniquila o grupo');

const barrierWipe = MilestoneBossValidator.evaluateBossFight(bossState, 110, 5000, { fire: 10000 });
assert(barrierWipe.isWiped === true && barrierWipe.reason.includes('BARREIRA ELEMENTAL'), 'Barreira Elemental não rompida a 10s do fim causa wipe imediato');

// ─────────────────────────────────────────────────────────────
// MÓDULO 2: FORJA, ITEM SINKS E CARTAS DE MONSTROS
// ─────────────────────────────────────────────────────────────
console.log('\n--- 2. MÓDULO 2: ECONOMIA, ITEM SINKS & CARTAS ---');

const craftState = {
  accountForgeLevel: 10,
  accountForgeExp: 0,
  inventory: [
    { id: 'iron_ore', name: 'Minério de Ferro', count: 500 },
    { id: 'dragon_scale', name: 'Escama de Dragão', count: 100 }
  ]
};

// Item Sink Massivo
const sinkResult = executeMassiveItemSink(
  craftState,
  'primordial_blade',
  [
    { itemId: 'iron_ore', count: 300 },
    { itemId: 'dragon_scale', count: 50 }
  ],
  { log: () => {} }
);

assert(sinkResult.success === true, 'Item Sink Massivo destruiu 350 itens e forjou relíquia com sucesso');
assert(craftState.inventory.find(i => i.id === 'iron_ore').count === 200, 'Estoque de Minério de Ferro reduzido corretamente para 200');
assert(craftState.inventory.find(i => i.id === 'primordial_blade') != null, 'Item Primordial criado no inventário');
assert(craftState.accountForgeExp > 0, 'EXP da Forja da Conta acumulada através da destruição de itens');

// Barreira de Forja < 10
const lowLevelCraftState = { accountForgeLevel: 5 };
const blockLowLevel = checkAccountForgeLevel(lowLevelCraftState, 10);
assert(blockLowLevel.allowed === false, 'Acesso a forjas de alto tier e mercado bloqueado para Nível de Forja < 10 (Anti-Bot)');

// Cartas e Codex
const codexState = { cardCodex: {} };
const cardAbsorb = CardCodexService.absorbCardIntoCodex(codexState, 'card_baium', { log: () => {} });
assert(cardAbsorb.success === true && codexState.cardCodex['card_baium']?.rank === 1, 'Carta de Baium absorvida com sucesso no Codex da Conta');

const weaponInstance = { id: 'weapon_1', socketsMax: 2, slottedCards: [] };
const socketResult = CardCodexService.socketCardToItem(weaponInstance, 'card_valakas');
assert(socketResult.success === true && weaponInstance.slottedCards.length === 1, 'Carta engastada no slot de equipamento com sucesso');

// ─────────────────────────────────────────────────────────────
// MÓDULO 3: SEVEN SIGNS, FERREIRO EXCLUSIVO E PENALIDADE DE MORTE
// ─────────────────────────────────────────────────────────────
console.log('\n--- 3. MÓDULO 3: SEVEN SIGNS & PENALIDADE DE MORTE ---');

const ssState = {
  sevenSigns: {
    faction: 'dawn',
    dawnScore: 500000,
    duskScore: 300000,
    phase: 'competition',
    ancientAdena: 100000
  },
  xp: 1000000,
  karma: 0,
  inventory: [{ id: 'gem_d', name: 'Gema D', isEquipped: false }]
};

// Resolução de Ciclo
SevenSignsService.resolveWeeklyCycle(ssState);
assert(ssState.sevenSigns.phase === 'seal_validation', 'Ciclo semanal alterou fase para Validação dos Selos');
assert(ssState.sevenSigns.winnerFaction === 'dawn', 'Facção Dawn sagrou-se vencedora com 500.000 pontos');

// Acesso ao Ferreiro de Mammon
const dawnAccess = SevenSignsService.canAccessExclusiveBlacksmith(ssState);
assert(dawnAccess.allowed === true, 'Membro da facção vencedora (Dawn) tem acesso autorizado ao Ferreiro de Mammon');

const duskState = {
  sevenSigns: { ...ssState.sevenSigns, faction: 'dusk' }
};
const duskAccess = SevenSignsService.canAccessExclusiveBlacksmith(duskState);
assert(duskAccess.allowed === false, 'Membro da facção perdedora (Dusk) tem acesso REJEITADO ao Ferreiro');

// Penalidade de Morte
const deathInnocent = SevenSignsService.applyDeathPenalty(ssState, { log: () => {} });
assert(deathInnocent.expLost === 40000, 'Morte de inocente perde 4% de EXP (40.000 EXP)');

const pkState = { xp: 1000000, karma: 500, inventory: [{ id: 'rare_sword', name: 'Espada Rara', isEquipped: false }] };
const deathPk = SevenSignsService.applyDeathPenalty(pkState, { log: () => {} });
assert(deathPk.expLost === 100000, 'Morte de PK perde 10% de EXP (100.000 EXP)');

// ─────────────────────────────────────────────────────────────
// MÓDULO 4: PROGRESSÃO DE LONGO PRAZO, 11 RARIDADES & RESETS
// ─────────────────────────────────────────────────────────────
console.log('\n--- 4. MÓDULO 4: PROGRESSÃO, 11 RARIDADES & RESETS ---');

// 11 Raridades
const rarityKeys = Object.keys(RARITIES);
assert(rarityKeys.length === 11, `Existem exatamente 11 raridades configuradas: ${rarityKeys.join(', ')}`);
assert(RARITIES['absolute'] != null && RARITIES['sovereign'] != null, 'Raridades Soberano e Absoluto configuradas com multiplicadores supremos');

const visual20 = getEnchantVisuals(20);
assert(visual20.auraClass === 'aura-cosmic-godly', 'Encantamento +20 exibe Aura Cósmica Absoluta');

// Sistema de Resets
const maxLevelChar = {
  level: 85,
  xp: 5000000,
  resetsCount: 0,
  bonusStatPoints: 0,
  statPoints: 0
};

const resetCheck = ResetService.canPerformReset(maxLevelChar);
assert(resetCheck.canReset === true, 'Personagem no Lv. 85 habilitado para realizar Reset');

const resetExec = ResetService.executeReset(maxLevelChar, { log: () => {} });
assert(resetExec.success === true, 'Reset executado com sucesso');
assert(maxLevelChar.level === 1 && maxLevelChar.xp === 0, 'Personagem retornou ao Nível 1 com 0 XP');
assert(maxLevelChar.resetsCount === 1, 'Contador de resets incrementado para 1');
assert(maxLevelChar.bonusStatPoints === 60, 'Recebeu +60 Pontos de Atributos Permanentes');

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO TOTAL! Todos os 4 Módulos de Engenharia foram validados com 100% de conformidade!');
}
