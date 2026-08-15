// Simula ambiente de browser para echo-adapter
globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

console.log('🧪 VERIFICANDO ARVORES GERADAS PELO ECHO-ADAPTER (CICLO DE VIDA & NÍVEIS 1-19, 20-39, 40-75, 76-79, 80+)...\n');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;
const classes = E.CLASSES_ECHO;

console.log(`Total de skills no jogo: ${Object.keys(defs).length}`);
console.log(`Total de classes com árvore de skills: ${Object.keys(classSkills).length}\n`);

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

// 1. Stage 0 (Lv 1 - 19)
const fighterSkills = classSkills['fighter'] || [];
assert(fighterSkills.length === 5, `Classe Base (Fighter Lv 1-19) possui exatamente 5 skills (Atual: ${fighterSkills.length})`);

// 2. Stage 1 (Lv 20 - 39)
const warriorSkills = classSkills['warrior'] || [];
assert(warriorSkills.length === 5, `1ª Troca (Warrior Lv 20-39) possui exatamente 5 skills (Atual: ${warriorSkills.length})`);

// 3. Stage 2 (Lv 40 - 75)
const gladiatorSkills = classSkills['gladiator'] || [];
assert(gladiatorSkills.length === 5, `2ª Troca (Gladiator Lv 40-75) possui exatamente 5 skills (Atual: ${gladiatorSkills.length})`);

// 4. Stage 3 (Lv 76+) & Lv 80+ Ultimates
const duelistSkills = classSkills['duelist'] || [];
const wargSkills = classSkills['warg'] || [];
assert(duelistSkills.length === 8, `3ª Troca (Duelist Lv 76+ e Lv 80+) possui 8 skills (5 do Lv 76 + 3 do Lv 80+)`);
assert(wargSkills.length === 8, `3ª Troca (Warg Lv 76+ e Lv 80+) possui 8 skills (5 do Lv 76 + 3 do Lv 80+)`);

// 5. Validação de 4★ Ultimate no Lv 80+
const wargUltId = wargSkills.find(id => defs[id]?.starRank === 4);
const wargUlt = defs[wargUltId];
assert(wargUlt != null, `Warg possui 1 Habilidade 4★ Ultimate`);
assert(wargUlt?.reqLvl === 80, `4★ Ultimate do Warg exige Lv. 80+`);

// 6. Auditoria de todas as 181 classes:
let invalidCount = 0;
for (const [cls, list] of Object.entries(classSkills)) {
  const cDef = classes[cls];
  const stage = Number(cDef?.stage) || 0;
  const expectedCount = (stage >= 3 || cls === 'warg' || cls === 'duelist' || cls === 'titan') ? 8 : 5;
  if (!list || list.length !== expectedCount) {
    console.error(`Classe [${cls}] (Stage ${stage}) tem contagem inesperada: ${list?.length} (esperado: ${expectedCount})`);
    invalidCount++;
  }
}

assert(invalidCount === 0, `100% das 181 classes seguem rigorosamente a regra de progressão por estágio`);

console.log(`\n========================================`);
console.log(`RESULTADO DO ECHO ADAPTER: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
