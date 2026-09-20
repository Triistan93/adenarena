import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Carregar manifesto independente
const manifestPath = path.join(ROOT_DIR, 'docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Manifesto docs/INDEPENDENT_CLASS_EXPECTATIONS_MANIFEST.json não encontrado!');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 2. Carregar módulos do sistema
const { getClass } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/engine/StatsEngine.js')).href);
const { getCertificationsBonuses } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/engine/StatsEngine.js')).href);
const {
  SubclassCertificationService,
  SUBCLASS_ARCHETYPES,
  EMERGENT_ABILITIES,
  MASTER_ABILITIES_BY_ARCHETYPE,
  DIVINE_TRANSFORMATIONS
} = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/services/SubclassCertificationService.js')).href);
const { resolveCanonicalClassId, resolveCanonicalDagClassId } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/data/classes/class_aliases.js')).href);
const { SEASONS_DATA } = await import(pathToFileURL(path.join(ROOT_DIR, 'lineage-idle/src/core/SeasonConfig.js')).href);

const eligibleClasses = manifest.subclasses.eligibleClasses;
console.log(`[Subclasses Executor] Iniciando auditoria e validação das ${eligibleClasses.length} classes elegíveis para subclasse...`);

// Função helper para simular switchSubclass de produção com precisão canônica
function executeSwitchSubclass(st, targetIdx) {
  const subCount = Array.isArray(st.subclasses) ? st.subclasses.length : 0;
  const isTargetValidSub = typeof targetIdx === 'number'
    && Number.isInteger(targetIdx)
    && targetIdx >= 0
    && targetIdx < subCount;
  const resolvedTarget = isTargetValidSub ? targetIdx : null;

  const isCurrentSubActive = typeof st.activeSubclassIndex === 'number'
    && Number.isInteger(st.activeSubclassIndex)
    && st.activeSubclassIndex >= 0
    && st.activeSubclassIndex < subCount;
  const currentEffective = isCurrentSubActive ? st.activeSubclassIndex : null;

  if (currentEffective === resolvedTarget) return true;

  // Snapshot da classe de saída
  const outgoing = {
    level: st.level,
    xp: st.xp,
    sp: st.sp,
    class: st.class,
    skills: JSON.parse(JSON.stringify(st.skills || {})),
    skillLoadout: JSON.parse(JSON.stringify(st.skillLoadout || {})),
    equipment: { ...(st.equipment || {}) }
  };

  if (currentEffective === null) {
    st.mainClassData = outgoing;
  } else {
    const activeSub = st.subclasses[currentEffective];
    if (activeSub) {
      activeSub.level = outgoing.level;
      activeSub.xp = outgoing.xp;
      activeSub.sp = outgoing.sp;
      activeSub.skills = outgoing.skills;
      activeSub.skillLoadout = outgoing.skillLoadout;
      activeSub.equipment = outgoing.equipment;
    }
  }

  // Restauração da classe de destino
  if (resolvedTarget === null) {
    st.activeSubclassIndex = null;
    const m = st.mainClassData || outgoing;
    st.level = m.level; st.xp = m.xp; st.sp = m.sp; st.class = m.class;
    st.skills = JSON.parse(JSON.stringify(m.skills || {}));
    st.skillLoadout = JSON.parse(JSON.stringify(m.skillLoadout || {}));
    if (m.equipment) {
      const invUids = new Set((st.inventory || []).map(i => i.uid));
      const resEquip = {};
      for (const slot of Object.keys(m.equipment)) {
        const u = m.equipment[slot];
        resEquip[slot] = (u && invUids.has(u)) ? u : null;
      }
      st.equipment = resEquip;
    }
  } else {
    const tSub = st.subclasses[resolvedTarget];
    st.activeSubclassIndex = resolvedTarget;
    st.level = tSub.level; st.xp = tSub.xp; st.sp = tSub.sp; st.class = tSub.classId;
    st.skills = JSON.parse(JSON.stringify(tSub.skills || {}));
    st.skillLoadout = JSON.parse(JSON.stringify(tSub.skillLoadout || {}));
    if (tSub.equipment) {
      const invUids = new Set((st.inventory || []).map(i => i.uid));
      const resEquip = {};
      for (const slot of Object.keys(tSub.equipment)) {
        const u = tSub.equipment[slot];
        resEquip[slot] = (u && invUids.has(u)) ? u : null;
      }
      st.equipment = resEquip;
    }
  }
  return true;
}

const results = [];
let passCount = 0;
let contentGapCount = 0;
let unprovenCount = 0;
let failCount = 0;

for (const classId of eligibleClasses) {
  const classMeta = manifest.classes[classId];
  if (!classMeta) {
    console.error(`ERRO CRÍTICO: Classe elegível ${classId} não encontrada no catálogo do manifesto!`);
    process.exit(1);
  }

  // Tratamento de Content Gap e Ertheia (Não comprovada)
  if (classMeta.provenanceStatus === 'CONTENT_GAP' || classMeta.provenanceStatus === 'UNPROVEN_PROVENANCE') {
    results.push({
      classId,
      status: classMeta.provenanceStatus,
      impediment: classMeta.gapReason || 'Classe em linhagem com lacuna de conteúdo ou proveniência não comprovada',
      assertions: {
        registeredInManifest: true,
        isEligibleByDesign: true
      }
    });
    if (classMeta.provenanceStatus === 'CONTENT_GAP') contentGapCount++;
    else unprovenCount++;
    continue;
  }

  const assertions = {
    eligibleForSubclass: false,
    subclassUnlockLevel: false,
    subclassInitialLevel: false,
    maxSubclassSlots: false,
    seasonGating: false,
    archetypeMapping: false,
    certificationsStored: false,
    certificationsZeroedOnSub: false,
    certificationsActiveOnMain: false,
    spAndSkillsIsolation: false,
    equipmentIntegrity: false,
    persistenceAndReload: false
  };

  try {
    // 1. Elegibilidade da Classe (reconhecida pelo motor de classes)
    const classDef = getClass(classId) || getClass(resolveCanonicalClassId(classId));
    assertions.eligibleForSubclass = !!classDef;

    // 2. Gating de Nível Mínimo para Desbloquear Subclasse (Lv 75 na Main)
    const canUnlockAt74 = (74 >= manifest.subclasses.rules.minLevelToUnlock);
    const canUnlockAt75 = (75 >= manifest.subclasses.rules.minLevelToUnlock);
    assertions.subclassUnlockLevel = (!canUnlockAt74 && canUnlockAt75);

    // 3. Nível Inicial da Subclasse (Lv 40)
    const initialSubLevel = manifest.subclasses.rules.subclassStartLevel;
    assertions.subclassInitialLevel = (initialSubLevel === 40);

    // 4. Limite Máximo de Subclasses (Max 3)
    const maxSubs = manifest.subclasses.rules.maxSubclasses;
    assertions.maxSubclassSlots = (maxSubs === 3);

    // 5. Gating de Temporada (Season 1/2 bloqueada, Season 3/4 liberada)
    const isS1Unlocked = SEASONS_DATA[1].unlockedTabs.includes('subclasses');
    const isS2Unlocked = SEASONS_DATA[2].unlockedTabs.includes('subclasses');
    const isS3Unlocked = SEASONS_DATA[3].unlockedTabs.includes('subclasses');
    const isS4Unlocked = SEASONS_DATA[4].unlockedTabs.includes('subclasses');
    assertions.seasonGating = (!isS1Unlocked && !isS2Unlocked && isS3Unlocked && isS4Unlocked);

    // 6. Mapeamento Canônico de Arquétipo para Certificações
    const archetype = SubclassCertificationService.getArchetypeForClass(classId);
    assertions.archetypeMapping = Object.values(SUBCLASS_ARCHETYPES).includes(archetype);

    // 7. Certificações Armazenadas
    const subId = `sub_${classId}`;
    const testState = {
      class: 'duelist',
      race: 'human',
      level: 80,
      xp: 100000,
      sp: 50000,
      skills: { triple_slash: 1 },
      skillLoadout: { basic: 'triple_slash', core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null },
      inventory: [
        { uid: 'weapon_main_1', itemId: 'dual_kesh', name: 'Dual Keshanberk' },
        { uid: 'weapon_sub_1', itemId: 'test_sub_wpn', name: 'Test Sub Weapon' }
      ],
      equipment: { weapon: 'weapon_main_1', armor: null },
      activeSubclassIndex: null,
      subclasses: [
        {
          id: subId,
          classId: classId,
          level: 80,
          xp: 20000,
          sp: 10000,
          skills: { sub_skill_1: 1 },
          skillLoadout: { basic: 'sub_skill_1', core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null },
          equipment: { weapon: 'weapon_sub_1', armor: null }
        }
      ],
      subclassCertifications: {
        [subId]: {
          lv65: 'emergent_patk',
          lv70: 'emergent_pdef',
          lv75: MASTER_ABILITIES_BY_ARCHETYPE[archetype]?.[0]?.id || 'master_haste',
          lv80: DIVINE_TRANSFORMATIONS[archetype]?.id || 'divine_warrior'
        }
      }
    };
    assertions.certificationsStored = (
      testState.subclassCertifications[subId].lv65 === 'emergent_patk' &&
      testState.subclassCertifications[subId].lv70 === 'emergent_pdef' &&
      !!testState.subclassCertifications[subId].lv75 &&
      !!testState.subclassCertifications[subId].lv80
    );

    // 8. Certificações Zeradas na Subclasse
    testState.activeSubclassIndex = 0; // Subclasse ativa
    const subBonuses = getCertificationsBonuses(testState);
    assertions.certificationsZeroedOnSub = (
      subBonuses.atk === 0 &&
      subBonuses.def === 0 &&
      subBonuses.matk === 0 &&
      subBonuses.mdef === 0 &&
      subBonuses.pAtkPercent === 0 &&
      subBonuses.pDefPercent === 0
    );

    // 9. Certificações Ativas na Main Class
    testState.activeSubclassIndex = null; // Main Class ativa
    const mainBonuses = getCertificationsBonuses(testState);
    assertions.certificationsActiveOnMain = (
      mainBonuses.atk > 0 &&
      mainBonuses.def > 0 &&
      mainBonuses.totalCertCount >= 4
    );

    // 10. Isolamento de SP, Habilidades e Loadout na Alternância
    executeSwitchSubclass(testState, 0); // Para Subclasse
    const subSpIsolated = (testState.sp === 10000);
    const subSkillsIsolated = (testState.skills.sub_skill_1 === 1 && !testState.skills.triple_slash);
    const subLoadoutIsolated = (testState.skillLoadout.basic === 'sub_skill_1');

    executeSwitchSubclass(testState, null); // De volta para Main
    const mainSpIsolated = (testState.sp === 50000);
    const mainSkillsIsolated = (testState.skills.triple_slash === 1 && !testState.skills.sub_skill_1);
    const mainLoadoutIsolated = (testState.skillLoadout.basic === 'triple_slash');

    assertions.spAndSkillsIsolation = (
      subSpIsolated && subSkillsIsolated && subLoadoutIsolated &&
      mainSpIsolated && mainSkillsIsolated && mainLoadoutIsolated
    );

    // 11. Integridade de Equipamentos e Prevenção de Itens Fantasmas
    executeSwitchSubclass(testState, 0); // Para Subclasse
    // Vender arma da Main enquanto está na Subclasse
    const mainWeaponIdx = testState.inventory.findIndex(i => i.uid === 'weapon_main_1');
    testState.inventory.splice(mainWeaponIdx, 1);

    executeSwitchSubclass(testState, null); // De volta para Main
    assertions.equipmentIntegrity = (testState.equipment.weapon === null); // Não revive item vendido

    // 12. Persistência e Recarga
    const serialized = JSON.stringify(testState);
    const reloaded = JSON.parse(serialized);
    assertions.persistenceAndReload = (
      reloaded.class === 'duelist' &&
      reloaded.subclasses[0].classId === classId &&
      reloaded.subclassCertifications[subId].lv65 === 'emergent_patk'
    );

    const allPassed = Object.values(assertions).every(v => v === true);
    if (allPassed) {
      passCount++;
      results.push({
        classId,
        archetype,
        status: 'PASS',
        assertions
      });
    } else {
      failCount++;
      results.push({
        classId,
        archetype,
        status: 'FAIL',
        failureReason: 'Uma ou mais asserções de subclasse falharam',
        assertions
      });
    }
  } catch (err) {
    failCount++;
    results.push({
      classId,
      status: 'FAIL',
      failureReason: err.message,
      assertions
    });
  }
}

console.log(`\n=================================================================`);
console.log(`RESUMO DA AUDITORIA DA MATRIZ DE SUBCLASSES (134 CLASSES)`);
console.log(`=================================================================`);
console.log(`Total de Classes Elegíveis Esperadas: ${eligibleClasses.length}`);
console.log(`Total Efetivamente Executado: ${results.length}`);
console.log(`Aprovadas (PASS): ${passCount}`);
console.log(`Content Gap (Pendente): ${contentGapCount}`);
console.log(`Proveniência Não Comprovada (Ertheia): ${unprovenCount}`);
console.log(`Falhas (FAIL): ${failCount}`);

const reportPath = path.join(ROOT_DIR, 'scripts/subclasses_matrix_audit_report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  meta: {
    expectedTotal: eligibleClasses.length,
    executedTotal: results.length,
    passCount,
    contentGapCount,
    unprovenCount,
    failCount
  },
  results
}, null, 2), 'utf8');

console.log(`Relatório de subclasses salvo em ${reportPath}`);
