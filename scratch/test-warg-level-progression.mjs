// Teste da progressão completa por estágio do Warg (Base -> S1 -> S2 -> 3rd Job / Warg)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;

console.log('=== TESTE DE PROGRESSÃO DE NÍVEIS DAS HABILIDADES DO WARG POR ESTÁGIO ===\n');

// 1. Stage 0: Warg Base (Lv 1-19)
console.log('🐺 Warg Base (Lv 1 - 19):');
const s0Skills = classSkills['wargBase'] || [];
s0Skills.forEach(id => {
  const s = defs[id];
  console.log(`  [Stage ${s.tier}] ${s.starRank}★ "${s.name}" (Req Lv: ${s.reqLvl}, Tipo: ${s.type})`);
});
const s0_first = defs[s0Skills[0]];
console.log(`  -> Req Level é 1: ${s0_first.reqLvl === 1 ? '✅ SIM' : '❌ NÃO'}`);
console.log(`  -> Rarity é 1★: ${s0_first.starRank === 1 ? '✅ SIM' : '❌ NÃO'}`);

// 2. Stage 1: Warg S1 (Lv 20 - 39)
console.log('\n🐺 Warg S1 (1ª Troca - Lv 20 - 39):');
const s1Skills = classSkills['wargS1'] || [];
s1Skills.forEach(id => {
  const s = defs[id];
  console.log(`  [Stage ${s.tier}] ${s.starRank}★ "${s.name}" (Req Lv: ${s.reqLvl}, Tipo: ${s.type})`);
});
const s1_first = defs[s1Skills[0]];
console.log(`  -> Req Level é 20: ${s1_first.reqLvl === 20 ? '✅ SIM' : '❌ NÃO'}`);
console.log(`  -> Rarity é 2★: ${s1_first.starRank === 2 ? '✅ SIM' : '❌ NÃO'}`);

// 3. Stage 2: Warg S2 (Lv 40 - 75)
console.log('\n🐺 Warg S2 (2ª Troca - Lv 40 - 75):');
const s2Skills = classSkills['wargS2'] || [];
s2Skills.forEach(id => {
  const s = defs[id];
  console.log(`  [Stage ${s.tier}] ${s.starRank}★ "${s.name}" (Req Lv: ${s.reqLvl}, Tipo: ${s.type})`);
});
const s2_first = defs[s2Skills[0]];
console.log(`  -> Req Level é 40: ${s2_first.reqLvl === 40 ? '✅ SIM' : '❌ NÃO'}`);

// 4. Stage 3: Warg Final (3ª Troca - Lv 76+ e Lv 80+ Ultimates)
console.log('\n🐺 Warg 3ª Troca (Lv 76+ e Lv 80+):');
const wargSkills = classSkills['warg'] || [];
wargSkills.forEach(id => {
  const s = defs[id];
  console.log(`  [Stage ${s.tier}] ${s.starRank}★ "${s.name}" (Req Lv: ${s.reqLvl}, Tipo: ${s.type}) - Ultimate: ${s.isUltimate ? 'SIM' : 'NÃO'}`);
});
const wargUlt = defs[wargSkills.find(id => defs[id]?.starRank === 4)];
console.log(`  -> 4★ Ultimate requer Lv. 80+: ${wargUlt?.reqLvl === 80 ? '✅ SIM' : '❌ NÃO'}`);
console.log(`  -> 4★ Ultimate isUltimate: ${wargUlt?.isUltimate ? '✅ SIM' : '❌ NÃO'}`);
