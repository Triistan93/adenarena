// Teste do Ciclo de Vida de Habilidades na Troca de Classe (Herança 20% Buffs -> Passivas, Apaga Ataque, Desbloqueio Lv 80)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const { promoteClass } = await import('../lineage-idle/src/services/CharacterService.js');
const { getStats } = await import('../lineage-idle/src/engine/StatsEngine.js');

console.log('=== TESTE DO CICLO DE VIDA DE HABILIDADES NA TROCA DE CLASSE ===\n');

const E = globalThis.window.EchoData;
const fighterSkills = E.CLASS_SKILLS_ECHO['fighter'];
console.log('Skills do Human Fighter:', fighterSkills);

// 1. Cria um personagem no Level 19 com a classe base 'fighter'
const state = {
  level: 19,
  class: 'fighter',
  race: 'human',
  sp: 100,
  skills: {},
  legacyPassives: {},
  buffs: {},
  inventory: []
};

// Aprende as skills reais do fighter no Lv 19 (nível 5 cada)
fighterSkills.forEach(sId => {
  state.skills[sId] = 5;
});

console.log('Estado inicial no Lv 19 (Humano Fighter):');
console.log('  Skills ativas aprendidas:', Object.keys(state.skills));
console.log('  Passivas de herança:', Object.keys(state.legacyPassives));

// 2. Sobe para o Lv 20 e faz a 1ª Troca de Classe para 'warrior'
state.level = 20;
console.log('\n--- Realizando 1ª Troca de Classe: fighter -> warrior (Lv. 20) ---');

promoteClass(state, 'warrior', {
  log: (msg) => console.log('  [LOG]', msg)
});

console.log('\nEstado após 1ª Troca (Warrior):');
const activeSkills = Object.keys(state.skills).filter(k => state.skills[k] > 0);
console.log('  Skills ativas mantidas (deve ser 0):', activeSkills.length);
console.log('  Passivas de Linhagem convertidas com 20% eficácia:', state.legacyPassives);
console.log('  SP do jogador (reembolsado das skills anteriores):', state.sp);

// 3. Testa atributos com as passivas de herança
const stats = getStats(state);
console.log('\nAtributos do Warrior com Herança Passiva:');
console.log(`  P.ATK: ${stats.atk} | P.DEF: ${stats.def} | M.ATK: ${stats.matk}`);

// 4. Verificação de Warg no Lv 76 e Lv 80
const wargSkills = E.CLASS_SKILLS_ECHO['warg'];
console.log('\nSkills do Warg (3ª Classe / Lv 76+ e Lv 80+):');
wargSkills.forEach(id => {
  const def = E.SKILL_DEFS_ECHO[id];
  console.log(`  - [Tier ${def.tier} / Req Lv ${def.reqLvl}] ${def.starRank}★ "${def.name}" (${def.type}) - Ultimate: ${def.isUltimate ? 'SIM' : 'NÃO'}`);
});
