import assert from 'assert';

import { FACTIONS, SEAL_STONES, SEVEN_SIGNS_BOSSES, MAMMON_BLACKSMITH_SERVICES, MAMMON_MERCHANT_CATALOG } from '../adenarena/lineage-idle/src/data/seven_signs.js';
import { SevenSignsService } from '../adenarena/lineage-idle/src/services/SevenSignsService.js';
import { FORTRESSES } from '../adenarena/lineage-idle/src/data/fortresses.js';
import { BRACELETS, TALISMANS } from '../adenarena/lineage-idle/src/data/talismans.js';
import { FortressService } from '../adenarena/lineage-idle/src/services/FortressService.js';
import { DUEL_BET_TIERS, DUEL_OPPONENT_ARCHETYPES, SURVIVAL_WAVES, COLOSSEUM_SHOP_CATALOG } from '../adenarena/lineage-idle/src/data/colosseum.js';
import { ColosseumService } from '../adenarena/lineage-idle/src/services/ColosseumService.js';
import { getStats } from '../adenarena/lineage-idle/src/engine/StatsEngine.js';

console.log('=== TESTE 1: Sistema de Seven Signs & Mercadores de Mammon ===');
const state1 = {
  level: 80,
  gold: 10000000,
  inventory: [
    { id: 'seal_stone_blue', itemId: 'seal_stone_blue', count: 100 },
    { id: 'seal_stone_green', itemId: 'seal_stone_green', count: 50 },
    { id: 'seal_stone_red', itemId: 'seal_stone_red', count: 20 },
    { id: 'armor_draconic_leather', itemId: 'armor_draconic_leather', name: 'Draconic Leather Armor (Sealed)' }
  ]
};

// 1.1 Alistar-se na facção Lords of Dawn
const joinRes = SevenSignsService.joinFaction(state1, 'dawn', { log: () => {} });
assert.strictEqual(joinRes.success, true, 'Deve alistar-se em Dawn com sucesso');
assert.strictEqual(state1.sevenSigns.faction, 'dawn');

// 1.2 Entregar Seal Stones e converter em Ancient Adena (100*3 + 50*5 + 20*10 = 300 + 250 + 200 = 750 AA)
SevenSignsService.depositStones(state1, 'seal_stone_blue', 100, { log: () => {} });
SevenSignsService.depositStones(state1, 'seal_stone_green', 50, { log: () => {} });
SevenSignsService.depositStones(state1, 'seal_stone_red', 20, { log: () => {} });

assert.strictEqual(state1.sevenSigns.ancientAdena, 750, 'Deve acumular exatamente 750 Ancient Adena');
console.log(`✓ 170 Seal Stones depositadas gerando ${state1.sevenSigns.ancientAdena} Ancient Adena.`);

// 1.3 Combate de Raide de Selo (Lilith)
state1.sevenSigns.ancientAdena = 100000;
state1.stats = { atk: 15000, def: 10000 };
const raidRes = SevenSignsService.startBossFight(state1, 'lilith', { log: () => {} });
assert.strictEqual(raidRes.success, true, 'Deve abrir portal para Lilith');

while (state1.sevenSigns.activeBossFight) {
  SevenSignsService.executeBossTurn(state1, { log: () => {} });
}
assert.strictEqual(state1.sevenSigns.bossDefeats.lilith, 1, 'Lilith deve ter sido derrotada 1 vez');
console.log('✓ Raide de Selo contra Lilith concluída com vitória e recompensas entregues!');

// 1.4 Unseal de Armadura e Compra de Mammon
const armorItem = state1.inventory.find(i => i.id === 'armor_draconic_leather');
const unsealRes = SevenSignsService.unsealArmor(state1, armorItem, { log: () => {} });
assert.strictEqual(unsealRes.success, true, 'Deve deselar a armadura com sucesso');
assert.strictEqual(armorItem.isUnsealed, true);

const buyRes = SevenSignsService.buyMammonItem(state1, 'giants_codex', { log: () => {} });
assert.strictEqual(buyRes.success, true, 'Deve comprar Giant\'s Codex com AA');
console.log('✓ Serviços e compras do Blacksmith & Merchant de Mammon validados com sucesso!');

console.log('\n=== TESTE 2: Sistema de Fortalezas & Braceletes com Talismãs ===');
const state2 = {
  level: 80,
  fortresses: {
    owned: [],
    epaulettes: 5000,
    equippedBracelet: 'bracelet_steel',
    equippedTalismans: []
  },
  stats: { atk: 10000, def: 8000 }
};

// 2.1 Conquistar a Aaru Fortress
const fortRes = FortressService.startFortressSiege(state2, 'aaru_fortress', { log: () => {} });
assert.strictEqual(fortRes.success, true, 'Deve iniciar cerco à Aaru Fortress');

while (state2.fortresses.activeSiege) {
  FortressService.executeSiegeTurn(state2, { log: () => {} });
}
assert(state2.fortresses.owned.includes('aaru_fortress'), 'Aaru Fortress deve estar conquistada');
console.log('✓ Aaru Fortress conquistada com sucesso!');

// 2.2 Forjar Bracelete Dynasty (S-Grade) e equipar 4 talismãs
const bRes = FortressService.buyBracelet(state2, 'bracelet_dynasty', { log: () => {} });
assert.strictEqual(bRes.success, true);
assert.strictEqual(state2.fortresses.equippedBracelet, 'bracelet_dynasty');

FortressService.equipTalisman(state2, 'talisman_power', { log: () => {} });
FortressService.equipTalisman(state2, 'talisman_defense', { log: () => {} });
FortressService.equipTalisman(state2, 'talisman_haste', { log: () => {} });
FortressService.equipTalisman(state2, 'talisman_crit', { log: () => {} });

assert.strictEqual(state2.fortresses.equippedTalismans.length, 4, 'Deve equipar 4 talismãs');

const bonuses = FortressService.getBonuses(state2);
assert(bonuses.pAtkMult > 0, 'Deve conceder bônus de P.Atk');
assert(bonuses.pDefMult > 0, 'Deve conceder bônus de P.Def');
assert(bonuses.crit > 0, 'Deve conceder bônus de Crit');
console.log('✓ Bracelete Dynasty e 4 Talismãs equipados com bônus calculados:', bonuses);

console.log('\n=== TESTE 3: Arena de Coliseu & Modo Sobrevivência 10 Ondas ===');
const state3 = {
  level: 80,
  gold: 50000000,
  stats: { atk: 12000, def: 9000, maxHp: 10000 },
  colosseum: { badges: 100, duelWins: 0, duelLosses: 0, highestWave: 0 }
};

// 3.1 Duelo 1v1 com aposta de 500k
const duelRes = ColosseumService.startDuel(state3, 'bet_500k', { log: () => {} });
assert.strictEqual(duelRes.success, true, 'Deve iniciar duelo 1v1');

while (state3.colosseum.activeDuel) {
  ColosseumService.executeDuelTurn(state3, { log: () => {} });
}
assert.strictEqual(state3.colosseum.duelWins, 1, 'Deve registrar 1 vitória em duelo');
console.log('✓ Duelo 1v1 no Coliseu vencido com sucesso!');

// 3.2 Desafio das 10 Ondas de Sobrevivência
const survRes = ColosseumService.startSurvival(state3, { log: () => {} });
assert.strictEqual(survRes.success, true);

while (state3.colosseum.activeSurvival) {
  ColosseumService.executeSurvivalTurn(state3, { log: () => {} });
}
assert.strictEqual(state3.colosseum.highestWave, 10, 'Deve concluir todas as 10 ondas de sobrevivência');
console.log(`✓ Desafio das 10 Ondas do Coliseu superado! Badges totais: ${state3.colosseum.badges}`);

// 3.3 Comprar Tiara do Campeão do Coliseu
const colBuyRes = ColosseumService.buyShopItem(state3, 'gladiator_circlet', { log: () => {} });
assert.strictEqual(colBuyRes.success, true, 'Deve comprar Gladiator Champion Circlet');
console.log('✓ Gladiator Champion Circlet resgatado com Badges do Coliseu!');

console.log('\n🎉 TODOS OS TESTES DE SEVEN SIGNS, FORTALEZAS E COLISEU PASSARAM COM 100% DE SUCESSO!');
