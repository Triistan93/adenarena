import { getStarterKit } from '../src/data/starterKits.ts';

console.log('🧪 INICIANDO AUDITORIA DOS KITS INICIAIS EXCLUSIVOS POR CLASSE...\n');

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

// 1. Orc Vanguard Rider (Exclusivo Spear)
const vanguardKit = getStarterKit('orc', 'orcRider');
assert(vanguardKit.weapon === 'short_spear', 'Vanguard Rider inicia com Lança (short_spear)');
assert(vanguardKit.armorType === 'heavy', 'Vanguard Rider inicia com Armadura Pesada (Heavy)');
assert(vanguardKit.shotType === 'soulshot_ng', 'Vanguard Rider recebe Soulshots No-Grade');

// 2. Elf Fighter (Arqueiro Ágil)
const elfKit = getStarterKit('elf', 'fighter');
assert(elfKit.weapon === 'hunting_bow', 'Elfo Fighter inicia com Arco (hunting_bow)');
assert(elfKit.armorType === 'light', 'Elfo Fighter inicia com Armadura Leve (Light)');

// 3. Human Mage (Mago Tradicional)
const mageKit = getStarterKit('human', 'mage');
assert(mageKit.weapon === 'crucifix_of_blessing_magicblunt', 'Mago inicia com Clava Mágica (crucifix_of_blessing)');
assert(mageKit.armorType === 'robe', 'Mago inicia com Conjunto de Robe (devotion)');
assert(mageKit.shotType === 'spiritshot_ng', 'Mago recebe Spiritshots No-Grade');

// 4. High Elf Divine Templar (Espada + Escudo)
const templarKit = getStarterKit('highelf', 'divineTemplarS1');
assert(templarKit.weapon === 'falchion_sword', 'Divine Templar inicia com Espada (falchion_sword)');
assert(templarKit.shield === 'shield_small_shield', 'Divine Templar inicia com Escudo (shield_small_shield)');
assert(templarKit.armorType === 'heavy', 'Divine Templar inicia com Armadura Pesada');

// 5. Kamael Soulbreaker (Rapieira/Adaga Leve)
const kamaelKit = getStarterKit('kamael', 'soulbreaker');
assert(kamaelKit.weapon === 'sword_breaker', 'Kamael inicia com Rapieira/Adaga (sword_breaker)');
assert(kamaelKit.armorType === 'light', 'Kamael inicia com Armadura Leve');

// 6. Dwarf Artisan (Martelo de Forja)
const dwarfKit = getStarterKit('dwarf', 'artisan');
assert(dwarfKit.weapon === 'iron_hammer', 'Anão Artesão inicia com Martelo de Forja (iron_hammer)');
assert(dwarfKit.armorType === 'heavy', 'Anão Artesão inicia com Armadura Pesada');

// 7. Assassin Dark Elf (Adaga e Veneno)
const assassinKit = getStarterKit('darkelf', 'assassinBase');
assert(assassinKit.weapon === 'sword_breaker', 'Assassino Dark Elf inicia com Adaga (sword_breaker)');
assert(assassinKit.armorType === 'light', 'Assassino Dark Elf inicia com Armadura Leve');

console.log(`\n========================================`);
console.log(`RESULTADO DOS KITS: ${passed} PASSARAM, ${failed} FALHARAM`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
