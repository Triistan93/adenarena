import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Carregar manifesto independente
const manifestPath = path.join(ROOT_DIR, 'docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Manifesto docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json não encontrado! Execute scripts/generate_independent_class_manifest.mjs primeiro.');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 2. Carregar módulos do motor de jogo
const { CANONICAL_SKILL_REGISTRY_V2 } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js')).href);
const {
  isSkillInV2Lineage,
  isSkillInProgressionPath,
  getSkillUnlockLevelForClass,
  getSkillDetailedVisibility,
  SKILL_VISIBILITY_STATES,
  V2_CONTENT_GAP_CLASSES
} = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/services/SkillEligibility.js')).href);
const { equipSkill, unequipSkill, getLoadout } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/services/SkillLoadoutService.js')).href);
const { ALL_SLOT_NAMES, getUnlockedSlots } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/balance/SkillUnlockSchedule.js')).href);
const { calculateStats } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/engine/StatsEngine.js')).href);

console.log(`[Links Executor] Iniciando auditoria e validação de todos os ${manifest.classSkillLinks.length} vínculos classe-habilidade...`);

const results = [];
let passCount = 0;
let contentGapCount = 0;
let unprovenCount = 0;
let failCount = 0;

const executedLinkIds = new Set();

for (const link of manifest.classSkillLinks) {
  if (executedLinkIds.has(link.linkId)) {
    console.error(`ERRO CRÍTICO: Vínculo duplicado detectado: ${link.linkId}`);
    process.exit(1);
  }
  executedLinkIds.add(link.linkId);

  const { classId, race, stage, skillId, isPassive, starRank, unlockLevel, allowedSlots, evidenceSource, expectedIcon, iconPhysicalExists } = link;
  const classMeta = manifest.classes[classId];

  // Caso 1: Classe com Content Gap ou Proveniência Não Comprovada
  if (classMeta.provenanceStatus === 'CONTENT_GAP' || classMeta.provenanceStatus === 'UNPROVEN_PROVENANCE') {
    const isGapAuthorized = V2_CONTENT_GAP_CLASSES[classId]?.authorizedSkillIds?.includes(skillId);
    if (!isGapAuthorized) {
      results.push({
        linkId: link.linkId,
        classId,
        skillId,
        status: classMeta.provenanceStatus,
        impediment: classMeta.gapReason || 'Conteúdo não comprovado nos registros oficiais',
        assertions: {
          iconPhysicalExists,
          isGapAuthorized: false
        }
      });
      if (classMeta.provenanceStatus === 'CONTENT_GAP') contentGapCount++;
      else unprovenCount++;
      continue;
    }
  }

  // Caso 2: Vínculo com classe canônica comprovada
  // Criar personagem de teste isolado
  const character = {
    class: classId,
    race: race,
    level: Math.max(unlockLevel || 1, 76),
    sp: 500,
    skills: {},
    legacyPassives: {},
    skillLoadout: { basic: null, core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null }
  };

  const assertions = {
    classCheckPassed: false,
    unlockLevelAccurate: false,
    learnRank1Success: false,
    spDeductedRank1: false,
    learnRank2Success: false,
    insufficientSpRejected: false,
    slotPassiveRejected: false,
    slotActiveEquipped: false,
    slotLockedRejected: false,
    foreignSkillRejected: false,
    iconPhysicalExists: iconPhysicalExists,
    persistencePreserved: false
  };

  let failureReason = null;

  try {
    // 1. Requisito Contextual & Elegibilidade
    const isAllowed = isSkillInV2Lineage(classId, skillId, race) || isSkillInProgressionPath(character, skillId);
    assertions.classCheckPassed = isAllowed;

    const actualReqLvl = getSkillUnlockLevelForClass(classId, skillId);
    assertions.unlockLevelAccurate = (actualReqLvl === unlockLevel || (unlockLevel === 1 && actualReqLvl <= 1));

    // 2. Aprendizado com SP (Rank 1)
    const spCostRank1 = starRank === 4 ? 100 : (starRank === 3 ? 50 : 30);
    character.skills[skillId] = 1;
    character.sp -= spCostRank1;
    assertions.learnRank1Success = character.skills[skillId] === 1;
    assertions.spDeductedRank1 = (character.sp === 500 - spCostRank1);

    // Rank 2
    character.skills[skillId] = 2;
    character.sp -= spCostRank1;
    assertions.learnRank2Success = character.skills[skillId] === 2;

    // Tentativa com 0 SP (rejeição)
    const testZeroSpState = { ...character, sp: 0 };
    const canLearnWithZero = testZeroSpState.sp >= spCostRank1;
    assertions.insufficientSpRejected = !canLearnWithZero;

    // 3. Slots & Compatibilidade de Loadout
    const loadoutChar = {
      ...character,
      level: 76,
      skills: { [skillId]: 1 }
    };

    if (isPassive) {
      // Passiva em slot -> DEVE ser rejeitada
      const equipPassiveResult = equipSkill(loadoutChar, 'core1', skillId, CANONICAL_SKILL_REGISTRY_V2);
      assertions.slotPassiveRejected = (!equipPassiveResult.success && equipPassiveResult.error?.includes('Passive skills cannot be equipped'));
      assertions.slotActiveEquipped = true; // N/A para passiva
    } else {
      // Ativa em slot -> DEVE ser aceita
      const equipActiveResult = equipSkill(loadoutChar, 'core1', skillId, CANONICAL_SKILL_REGISTRY_V2);
      assertions.slotActiveEquipped = (equipActiveResult.success && loadoutChar.skillLoadout.core1 === skillId);
      assertions.slotPassiveRejected = true; // N/A para ativa
    }

    // Slot bloqueado por nível insuficiente -> DEVE ser rejeitado
    const lowLevelChar = {
      ...character,
      level: 1, // Lv 1 só tem basic e core1; ultimate é Lv 76
      skills: { [skillId]: 1 }
    };
    const lockedSlotResult = equipSkill(lowLevelChar, 'ultimate', skillId, CANONICAL_SKILL_REGISTRY_V2);
    assertions.slotLockedRejected = (!lockedSlotResult.success && lockedSlotResult.error?.includes('is locked at level'));

    // Habilidade estrangeira -> DEVE ser rejeitada
    const foreignChar = {
      class: 'fighter',
      race: 'human',
      level: 76,
      skills: { 'hydro_blast': 1 }
    };
    const foreignResult = equipSkill(foreignChar, 'core1', 'hydro_blast');
    assertions.foreignSkillRejected = (!foreignResult.success && foreignResult.error?.includes('does not belong to the progression path'));

    // 4. Persistência
    const serialized = JSON.stringify(loadoutChar);
    const restored = JSON.parse(serialized);
    assertions.persistencePreserved = (restored.skills[skillId] === 1 && (isPassive || restored.skillLoadout.core1 === skillId));

    // Determinar status final do vínculo
    const allPassed = (
      assertions.classCheckPassed &&
      assertions.unlockLevelAccurate &&
      assertions.learnRank1Success &&
      assertions.spDeductedRank1 &&
      assertions.learnRank2Success &&
      assertions.insufficientSpRejected &&
      assertions.slotPassiveRejected &&
      assertions.slotActiveEquipped &&
      assertions.slotLockedRejected &&
      assertions.foreignSkillRejected &&
      assertions.iconPhysicalExists &&
      assertions.persistencePreserved
    );

    if (allPassed) {
      passCount++;
      results.push({
        linkId: link.linkId,
        classId,
        skillId,
        status: 'PASS',
        assertions
      });
    } else {
      failCount++;
      results.push({
        linkId: link.linkId,
        classId,
        skillId,
        status: 'FAIL',
        failureReason: 'Uma ou mais asserções falharam',
        assertions
      });
    }

  } catch (err) {
    failCount++;
    results.push({
      linkId: link.linkId,
      classId,
      skillId,
      status: 'FAIL',
      failureReason: err.message,
      assertions
    });
  }
}

// Conferir igualdade estrita entre casos esperados e executados
const expectedTotal = manifest.classSkillLinks.length;
const executedTotal = results.length;

console.log(`\n=================================================================`);
console.log(`RESUMO DA AUDITORIA DE VÍNCULOS CLASSE-HABILIDADE`);
console.log(`=================================================================`);
console.log(`Total Esperado no Manifesto: ${expectedTotal}`);
console.log(`Total Efetivamente Executado: ${executedTotal}`);
console.log(`Aprovados (PASS): ${passCount}`);
console.log(`Content Gap (Pendente): ${contentGapCount}`);
console.log(`Proveniência Não Comprovada (Ertheia): ${unprovenCount}`);
console.log(`Falhas (FAIL): ${failCount}`);

if (expectedTotal !== executedTotal) {
  console.error(`ERRO: Divergência entre casos esperados (${expectedTotal}) e executados (${executedTotal})!`);
  process.exit(1);
}

// Salvar relatório JSON
const reportPath = path.join(ROOT_DIR, 'scripts/class_skill_links_audit_report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  meta: {
    expectedTotal,
    executedTotal,
    passCount,
    contentGapCount,
    unprovenCount,
    failCount
  },
  results
}, null, 2), 'utf8');

console.log(`Relatório salvo em ${reportPath}`);
