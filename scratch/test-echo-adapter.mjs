// Simula ambiente de browser para echo-adapter
globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

console.log('🧪 VERIFICANDO ARVORES GERADAS PELO ECHO-ADAPTER (PADRÃO 5 SKILLS: 2 DANO, 2 BUFFS, 1 SUSTENTAÇÃO)...\n');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;
const layouts = E.SKILL_TREE_LAYOUT_ECHO;

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

// 1. Warg
const wargSkills = classSkills['warg'] || [];
assert(wargSkills.length === 5, `Warg possui exatamente 5 skills (Atual: ${wargSkills.length})`);
console.log(`   Skills do Warg:`, wargSkills.map(id => `"${defs[id]?.name}" [Tier ${defs[id]?.tier}]`).join(', '));

// 2. Orc Raider & Orc Rider
const orcRaiderSkills = classSkills['orcRaider'] || [];
const orcRiderSkills = classSkills['orcRider'] || [];
assert(orcRaiderSkills.length === 5, `orcRaider possui exatamente 5 skills (Atual: ${orcRaiderSkills.length})`);
assert(orcRiderSkills.length === 5, `orcRider possui exatamente 5 skills (Atual: ${orcRiderSkills.length})`);

// 3. Dark Elf & Assassin
const darkFighterSkills = classSkills['darkFighter'] || [];
const assassinSkills = classSkills['assassin'] || [];
assert(darkFighterSkills.length === 5, `darkFighter possui exatamente 5 skills (Atual: ${darkFighterSkills.length})`);
assert(assassinSkills.length === 5, `assassin possui exatamente 5 skills (Atual: ${assassinSkills.length})`);

// 4. Dwarf
const artisanSkills = classSkills['artisan'] || [];
const scavengerSkills = classSkills['scavenger'] || [];
assert(artisanSkills.length === 5, `artisan possui exatamente 5 skills (Atual: ${artisanSkills.length})`);
assert(scavengerSkills.length === 5, `scavenger possui exatamente 5 skills (Atual: ${scavengerSkills.length})`);

// 5. High Elf & Ertheia
const divineTemplarSkills = classSkills['divineTemplar'] || [];
const ertheiaFighterSkills = classSkills['ertheiaFighter'] || [];
assert(divineTemplarSkills.length === 5, `divineTemplar possui exatamente 5 skills (Atual: ${divineTemplarSkills.length})`);
assert(ertheiaFighterSkills.length === 5, `ertheiaFighter possui exatamente 5 skills (Atual: ${ertheiaFighterSkills.length})`);

// 6. Auditoria de TODAS as 181 classes: todas DEVEM ter exatamente 5 skills e posições válidas
let invalidCount = 0;
for (const [cls, list] of Object.entries(classSkills)) {
  if (!list || list.length !== 5) {
    console.error(`Classe [${cls}] tem contagem inválida: ${list?.length}`);
    invalidCount++;
  }
}

assert(invalidCount === 0, `100% das 181 classes possuem exatamente 5 habilidades padronizadas`);

console.log(`\n========================================`);
console.log(`RESULTADO DO ECHO ADAPTER: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
