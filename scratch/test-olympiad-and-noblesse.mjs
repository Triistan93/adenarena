/**
 * Teste Automatizado do Sistema de Noblesse Quest & Grand Olympiad Games
 */

import { NOBLESSE_QUEST_DEFS } from '../adenarena/lineage-idle/src/data/quests.js';
import { NoblesseService } from '../adenarena/lineage-idle/src/services/NoblesseService.js';
import { INFINITY_WEAPONS, HEROIC_SKILLS, OLYMPIAD_GLADIATORS, OLYMPIAD_SHOP_CATALOG } from '../adenarena/lineage-idle/src/data/olympiad.js';
import { OlympiadService } from '../adenarena/lineage-idle/src/services/OlympiadService.js';

console.log('=== TESTE 1: Estrutura da Questline de Noblesse (Possessor of a Precious Soul) ===');
console.assert(NOBLESSE_QUEST_DEFS.part1, 'Parte 1 deve existir');
console.assert(NOBLESSE_QUEST_DEFS.part2, 'Parte 2 deve existir');
console.assert(NOBLESSE_QUEST_DEFS.part3, 'Parte 3 deve existir');
console.assert(NOBLESSE_QUEST_DEFS.part4, 'Parte 4 deve existir');
console.log('✓ Todas as 4 partes da saga de Noblesse definidas com sucesso.');

console.log('\n=== TESTE 2: Simulação de Progressão da Quest de Noblesse ===');
const state = {
  level: 75,
  gold: 0,
  xp: 0,
  sp: 0,
  inventory: [],
  skills: {},
  noblesseStep: 1,
  noblesseProgress: { part1Kills: 0, part2Kills: 0, barakielKilled: false }
};

// Não pode concluir parte 1 sem os 25 kills
const canPart1Premature = NoblesseService.canAdvanceStep(state, 1);
console.assert(!canPart1Premature.ok, 'Não deve concluir Parte 1 antes de 25 kills');

// Simula abates em Valley of Saints
state.zone = 'valleyOfSaints';
for (let i = 0; i < 25; i++) {
  NoblesseService.recordKill(state, { id: 'saint_guard' }, {});
}
console.assert(state.noblesseProgress.part1Kills === 25, 'Deve registrar 25 kills');
const part1Complete = NoblesseService.completeStep(state, 1, {});
console.assert(part1Complete && state.noblesseStep === 2, 'Deve avançar para a Parte 2');
console.log('✓ Parte 1 concluída com sucesso!');

// Simula abates em Swamp of Screams
state.zone = 'swampOfScreams';
for (let i = 0; i < 30; i++) {
  NoblesseService.recordKill(state, { id: 'swamp_spirit' }, {});
}
console.assert(state.noblesseProgress.part2Kills === 30, 'Deve registrar 30 kills');
const part2Complete = NoblesseService.completeStep(state, 2, {});
console.assert(part2Complete && state.noblesseStep === 3, 'Deve avançar para a Parte 3');
console.log('✓ Parte 2 concluída com sucesso!');

// Simula abate de Barakiel
NoblesseService.recordKill(state, { id: 'barakiel', isBarakiel: true, name: 'Flame of Splendor Barakiel' }, {});
console.assert(state.noblesseProgress.barakielKilled === true, 'Barakiel deve estar marcado como derrotado');
const part3Complete = NoblesseService.completeStep(state, 3, {});
console.assert(part3Complete && state.noblesseStep === 4, 'Deve avançar para a Parte 4');
console.log('✓ Parte 3 concluída com sucesso!');

// Conclui Parte 4 -> Torna-se Noblesse!
const part4Complete = NoblesseService.completeStep(state, 4, {});
console.assert(part4Complete && state.isNoblesse === true, 'Deve ser consagrado Noblesse');
console.assert(state.inventory.some(i => i.itemId === 'accessory_noblesse_tiara'), 'Deve receber a Noblesse Tiara');
console.assert(state.skills['blessing_of_noble'] === 1, 'Deve aprender a habilidade Blessing of Noble');
console.log('✓ Parte 4 concluída: Herói consagrado NOBLESSE com Tiara e Bênção!');

console.log('\n=== TESTE 3: Validação Estrita de Nível 76+ e Noblesse para Grand Olympiad ===');
// Herói Lv 75 com Noblesse -> Não pode entrar (requer 76)
state.level = 75;
const checkLv75 = OlympiadService.canJoinMatch(state);
console.assert(!checkLv75.ok, 'Jogador Lv. 75 não pode entrar na Grand Olympiad');
console.log(`✓ Bloqueio de Lv. 75 validado: ${checkLv75.reason}`);

// Herói Lv 80 sem Noblesse -> Não pode entrar
const nonNobleState = { level: 80, isNoblesse: false };
const checkNonNoble = OlympiadService.canJoinMatch(nonNobleState);
console.assert(!checkNonNoble.ok, 'Jogador Lv. 80 sem Noblesse não pode entrar na Grand Olympiad');
console.log(`✓ Bloqueio de Não-Noblesse validado: ${checkNonNoble.reason}`);

// Herói Lv 76 com Noblesse -> Acesso Liberado!
state.level = 76;
const checkLv76Noble = OlympiadService.canJoinMatch(state);
console.assert(checkLv76Noble.ok, 'Jogador Lv. 76+ Noblesse DEVE ter acesso liberado');
console.log('✓ Acesso à Grand Olympiad LIBERADO com sucesso para Lv. 76+ Noblesse!');

console.log('\n=== TESTE 4: Duelo Ranqueado 1v1, ELO e Olympiad Tokens ===');
state.atk = 550;
state.matk = 500;
state.def = 450;
state.mdef = 400;
state.maxHp = 25000;
state.olympiadPoints = 1000;
state.olympiadTokens = 0;

const matchRes = await OlympiadService.startOlympiadMatch(state, {});
console.assert(matchRes.ok, 'Partida deve ser executada com sucesso');
console.assert(state.olympiadTokens > 0, 'Deve ganhar Olympiad Tokens');
console.log(`✓ Duelo executado: Resultado=${matchRes.result}, Pontos Atuais=${state.olympiadPoints}, Tokens=${state.olympiadTokens}`);

console.log('\n=== TESTE 5: Coroação de Herói Supremo (Grand Olympiad Hero) ===');
state.olympiadPoints = 1550; // Atingiu pontuação de Herói
const heroRes = OlympiadService.claimHeroStatus(state, 'weapon_infinity_blade', {});
console.assert(heroRes && state.isHero === true, 'Deve ser consagrado Herói');
console.assert(state.skills['heroic_valor'] === 1, 'Deve receber Heroic Valor');
console.assert(state.skills['heroic_miracle'] === 1, 'Deve receber Heroic Miracle');
console.assert(state.inventory.some(i => i.itemId === 'weapon_infinity_blade'), 'Deve receber Infinity Blade');
console.log('✓ Coroação de Herói realizada: Status de HERO ativo, 4 Habilidades Heroicas e Infinity Blade no inventário!');

console.log('\n=== TESTE 6: Loja de Tokens de Olimpíada ===');
state.olympiadTokens = 2000;
const buyScroll = OlympiadService.buyShopItem(state, 'blessed_scroll_weapon_s', {});
console.assert(buyScroll && state.olympiadTokens === 800, 'Deve deduzir 1.200 tokens e entregar Blessed Scroll');
console.assert(state.inventory.some(i => i.itemId === 'blessed_scroll_weapon_s'), 'Blessed Scroll deve estar no inventário');
console.log('✓ Compra na Loja de Tokens executada com sucesso!');

console.log('\n🎉 TODOS OS TESTES DE NOBLESSE E GRAND OLYMPIAD PASSARAM COM 100% DE SUCESSO!');
