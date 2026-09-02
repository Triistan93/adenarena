/**
 * test-subclass-certification-system.mjs — Testes Automatizados do Subclass Certification System
 */

import { SubclassCertificationService, SUBCLASS_ARCHETYPES } from '../lineage-idle/src/services/SubclassCertificationService.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';
import { getCertificationsBonuses, getStats } from '../lineage-idle/src/engine/StatsEngine.js';

console.log('🧪 Iniciando Testes Automatizados do Subclass Certification System...');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failed++;
  }
}

// 1. Teste de Resolução de Arquétipos
console.log('\n1. Teste de Resolução de Arquétipos Canônicos:');
assert(SubclassCertificationService.getArchetypeForClass('fighter') === SUBCLASS_ARCHETYPES.WARRIOR, 'fighter -> warrior');
assert(SubclassCertificationService.getArchetypeForClass('gladiator') === SUBCLASS_ARCHETYPES.WARRIOR, 'gladiator -> warrior');
assert(SubclassCertificationService.getArchetypeForClass('paladin') === SUBCLASS_ARCHETYPES.KNIGHT, 'paladin -> knight');
assert(SubclassCertificationService.getArchetypeForClass('darkAvenger') === SUBCLASS_ARCHETYPES.KNIGHT, 'darkAvenger -> knight');
assert(SubclassCertificationService.getArchetypeForClass('hawkeye') === SUBCLASS_ARCHETYPES.ROGUE, 'hawkeye -> rogue');
assert(SubclassCertificationService.getArchetypeForClass('treasureHunter') === SUBCLASS_ARCHETYPES.ROGUE, 'treasureHunter -> rogue');
assert(SubclassCertificationService.getArchetypeForClass('archmage') === SUBCLASS_ARCHETYPES.WIZARD, 'archmage -> wizard');
assert(SubclassCertificationService.getArchetypeForClass('warlock') === SUBCLASS_ARCHETYPES.SUMMONER, 'warlock -> summoner');
assert(SubclassCertificationService.getArchetypeForClass('cardinal') === SUBCLASS_ARCHETYPES.HEALER, 'cardinal -> healer');
assert(SubclassCertificationService.getArchetypeForClass('swordMuse') === SUBCLASS_ARCHETYPES.ENCHANTER, 'swordMuse -> enchanter');

// 2. Teste de Marcos e Requisitos de Nível
console.log('\n2. Teste de Obtenção de Marcos por Nível:');
const mockState = {
  level: 80,
  class: 'fighter',
  race: 'human',
  subclasses: [
    { id: 'sub_1', classId: 'paladin', level: 60 },
    { id: 'sub_2', classId: 'hawkeye', level: 75 },
    { id: 'sub_3', classId: 'swordMuse', level: 80 }
  ],
  subclassCertifications: {},
  gold: 5000000
};

const mSub1 = SubclassCertificationService.getSubclassMilestones(mockState, 'sub_1');
assert(mSub1.length === 4, 'Sub 1 tem 4 marcos');
assert(mSub1[0].isUnlocked === false, 'Sub 1 Lv 60: Lv 65 Bloqueado');

const mSub2 = SubclassCertificationService.getSubclassMilestones(mockState, 'sub_2');
assert(mSub2[0].isUnlocked === true, 'Sub 2 Lv 75: Lv 65 Desbloqueado');
assert(mSub2[1].isUnlocked === true, 'Sub 2 Lv 75: Lv 70 Desbloqueado');
assert(mSub2[2].isUnlocked === true, 'Sub 2 Lv 75: Lv 75 Desbloqueado');
assert(mSub2[3].isUnlocked === false, 'Sub 2 Lv 75: Lv 80 Bloqueado');

const mSub3 = SubclassCertificationService.getSubclassMilestones(mockState, 'sub_3');
assert(mSub3[3].isUnlocked === true, 'Sub 3 Lv 80: Lv 80 Desbloqueado');

// 3. Teste de Aprendizado de Certificações
console.log('\n3. Teste de Aprendizado de Habilidades de Certificação:');
const learn1 = SubclassCertificationService.learnCertification(mockState, 'sub_2', 'lv65', 'emergent_patk');
assert(learn1 === true, 'Aprendeu Emergent P.Atk no Lv 65');
assert(mockState.subclassCertifications['sub_2']?.lv65 === 'emergent_patk', 'Registrado no estado sub_2');

const learn2 = SubclassCertificationService.learnCertification(mockState, 'sub_2', 'lv70', 'emergent_pdef');
assert(learn2 === true, 'Aprendeu Emergent P.Def no Lv 70');

const learn3 = SubclassCertificationService.learnCertification(mockState, 'sub_2', 'lv75', 'master_critical');
assert(learn3 === true, 'Aprendeu Master Critical no Lv 75 (Rogue)');

const learn4 = SubclassCertificationService.learnCertification(mockState, 'sub_3', 'lv80', 'divine_enchanter');
assert(learn4 === true, 'Aprendeu Transform Divine Enchanter no Lv 80 (Enchanter)');

// Tentativa de aprender marco bloqueado
const failLearn = SubclassCertificationService.learnCertification(mockState, 'sub_1', 'lv75', 'master_defense');
assert(failLearn === false, 'Falhou ao tentar aprender habilidade em nível insuficiente');

// 4. Teste de Acúmulo de Bônus de Atributos e CP
console.log('\n4. Teste de Consolidação de Bônus e Combat Power:');
const bonuses = SubclassCertificationService.calculateTotalCertificationBonuses(mockState);
assert(bonuses.pAtk === 35, 'Bônus P.Atk = 35');
assert(bonuses.pDef === 30, 'Bônus P.Def = 30');
assert(bonuses.pAtkPercent > 0.05, 'Bônus P.Atk% acumulado de Emergent e Divine Enchanter');
assert(bonuses.critProc === true, 'Proc de Chance Critical ativo');
assert(bonuses.totalCertCount === 4, 'Total de 4 certificações ativas');

const certCp = SubclassCertificationService.calculateCertificationCP(mockState);
console.log(`  📊 CP derivado de certificações: +${certCp.toLocaleString()} CP`);
assert(certCp >= 13000, 'CP de certificações >= 13.000 CP');

const totalCp = CombatPowerService.calculateCombatPower(mockState);
console.log(`  🏆 CP Total do Personagem: ${totalCp.toLocaleString()} CP`);
assert(totalCp > 25000, 'CP Total com certificações > 25.000');

// 5. Teste de Integração com StatsEngine
console.log('\n5. Teste de Integração com StatsEngine:');
const statsEngineCerts = getCertificationsBonuses(mockState);
assert(statsEngineCerts.atk === 35, 'StatsEngine leu atk = 35');
assert(statsEngineCerts.def === 30, 'StatsEngine leu def = 30');
assert(statsEngineCerts.critProc === true, 'StatsEngine leu critProc');

// 6. Teste de Redefinição (Reset) de Certificações
console.log('\n6. Teste de Redefinição de Certificações:');
const initialGold = mockState.gold;
const resetRes = SubclassCertificationService.resetSubclassCertifications(mockState, 'sub_2');
assert(resetRes === true, 'Reset efetuado com sucesso');
assert(mockState.gold === initialGold - 1000000, 'Taxa de 1.000.000 Adena cobrada');
assert(!mockState.subclassCertifications['sub_2'], 'Certificações da sub_2 limpas para redistribuição');

console.log(`\n========================================`);
console.log(`Resultados dos Testes: ${passed} Passaram | ${failed} Falharam`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 Todos os testes do Subclass Certification System foram concluídos com 100% de sucesso!');
}
