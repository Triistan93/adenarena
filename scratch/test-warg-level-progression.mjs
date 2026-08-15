// Teste de progressão de níveis e estrelas nas habilidades

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;

console.log('=== TESTE DE PROGRESSÃO DE NÍVEIS DAS HABILIDADES ===\n');

const wargSkillIds = classSkills['warg'];
console.log('Habilidades do Warg:');
wargSkillIds.forEach((id, idx) => {
  const s = defs[id];
  console.log(`  [Tier ${s.tier} / Col ${s.col}] ${s.starRank}★ "${s.name}" (Req Lv: ${s.reqLvl}, Tipo: ${s.type}, Custo: ${s.cost} SP)`);
});

const s0 = defs[wargSkillIds[0]];
const s4 = defs[wargSkillIds[4]];

console.log('\nValidações:');
console.log(`- Tier 0 é nível 1: ${s0.reqLvl === 1 ? '✅ SIM' : '❌ NÃO (' + s0.reqLvl + ')'}`);
console.log(`- Tier 0 é 1★: ${s0.starRank === 1 ? '✅ SIM' : '❌ NÃO (' + s0.starRank + ')'}`);
console.log(`- Tier 4 é nível 76+: ${s4.reqLvl >= 76 ? '✅ SIM' : '❌ NÃO (' + s4.reqLvl + ')'}`);
console.log(`- Tier 4 é 4★: ${s4.starRank === 4 ? '✅ SIM' : '❌ NÃO (' + s4.starRank + ')'}`);
console.log(`- Tier 4 é Ultimate: ${s4.isUltimate ? '✅ SIM' : '❌ NÃO'}`);
