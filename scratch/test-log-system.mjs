console.log('🧪 INICIANDO TESTES DO SISTEMA DE LOGS & FILTROS...\n');

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

function resolveLogCategory(type, msg) {
  if (type === 'boss' || type === 'system' || msg.includes('surgiu') || msg.includes('apareceu') || msg.includes('DESPERTADO') || msg.includes('desbloqueada') || msg.includes('DESBLOQUEADA') || msg.includes('Salvo') || msg.includes('carregado') || msg.includes('Élite') || msg.includes('CHEFÃO') || msg.includes('Miniboss')) {
    return 'system';
  }
  if (type === 'xp' || type === 'gold' || msg.includes('XP') || msg.includes('SP') || msg.includes('Adena') || msg.includes('JACKPOT') || msg.includes('Level Up')) {
    return 'gold_xp';
  }
  if (type === 'loot' || type.startsWith('rarity-') || msg.includes('Drop') || msg.includes('Obteve') || msg.includes('✦')) {
    return 'loot';
  }
  if (type === 'combat' || type === 'damage' || type === 'heal' || msg.includes('hit') || msg.includes('missed') || msg.includes('DODGE') || msg.includes('Curou') || msg.includes('dano')) {
    return 'combat';
  }
  return 'system';
}

// 1. Spawns de Boss e Elite (Devem ser Sistema / Boss)
assert(resolveLogCategory('boss', '⚡ Monstro Élite Armored Goblin (Miniboss) surgiu!') === 'system', 'Miniboss Élite categorizado como system');
assert(resolveLogCategory('boss', '🚨 CHEFÃO DA ZONA DESPERTADO! 👑 Queen Ant apareceu!') === 'system', 'Chefão de Zona categorizado como system');
assert(resolveLogCategory('system', '🗺️ NOVA SAGA DESBLOQUEADA: Era dos Titãs!') === 'system', 'Desbloqueio de Saga categorizado como system');

// 2. Categorias de Itens & Drops
assert(resolveLogCategory('rarity-epic', '✦ Obteve Sirra\'s Blade [Épico]!') === 'loot', 'Item épico categorizado como loot');
assert(resolveLogCategory('loot', '📦 Obteve 5x Animal Bone') === 'loot', 'Material de drop categorizado como loot');
assert(resolveLogCategory('rarity-legendary', '✦ Obteve Dragon Slayer [Lendário]!') === 'loot', 'Item lendário categorizado como loot');

// 3. Categorias de Ouro e Experiência
assert(resolveLogCategory('xp', 'Derrotou Orc Archer! Recebeu +1500 XP e +50 SP') === 'gold_xp', 'XP/SP categorizado como gold_xp');
assert(resolveLogCategory('gold', 'Coletou +450 Adena de Orc Archer') === 'gold_xp', 'Adena comum categorizada como gold_xp');
assert(resolveLogCategory('rarity-legendary', '🪙 JACKPOT! Coletou +45,000 Adena (×10)!') === 'gold_xp', 'Jackpot de Adena categorizado como gold_xp');

// 4. Categorias de Combate
assert(resolveLogCategory('combat', 'You hit Goblin for 240 damage') === 'combat', 'Dano físico categorizado como combat');
assert(resolveLogCategory('combat', 'Goblin missed!') === 'combat', 'Esquiva categorizada como combat');
assert(resolveLogCategory('heal', 'Curou 120 HP ao derrotar Goblin') === 'combat', 'Cura de combate categorizada como combat');

// 5. Categorias de Sistema Básicas
assert(resolveLogCategory('system', 'Bem-vindo ao Aden Arena.') === 'system', 'Mensagem de boas vindas categorizada como system');
assert(resolveLogCategory('system', 'Histórico de log limpo.') === 'system', 'Limpeza de log categorizada como system');

console.log(`\n========================================`);
console.log(`RESULTADO DOS TESTES DE LOG: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
