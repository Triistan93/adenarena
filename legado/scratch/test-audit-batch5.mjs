/**
 * test-audit-batch5.mjs — Bateria de Testes e Auditoria do LOTE 5 (Abas 15, 16, 17, 18 e 19).
 */

import { CASTLES } from '../lineage-idle/src/data/castles.js';
import { ClanService } from '../lineage-idle/src/services/ClanService.js';
import { SevenSignsService } from '../lineage-idle/src/services/SevenSignsService.js';
import { FACTIONS, SEAL_STONES } from '../lineage-idle/src/data/seven_signs.js';
import { FortressService } from '../lineage-idle/src/services/FortressService.js';
import { ColosseumService } from '../lineage-idle/src/services/ColosseumService.js';
import { RankingService } from '../lineage-idle/src/services/RankingService.js';

console.log('🧪 Iniciando Auditoria e Testes de Sanidade do LOTE 5 (Abas 15, 16, 17, 18 e 19)...\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. AUDITORIA DA ABA 15: CLÃ & CASTELOS (tab-clan)
// ═════════════════════════════════════════════════════════════════════════════
console.log('--- 🛡️ ABA 15: Clã Imperial, Habilidades & Cercos ---');
assert(Object.keys(CASTLES).length >= 4, `Existem 4+ Castelos mapeados no continente (${Object.keys(CASTLES).length} encontrados)`);

const clanState = {
  level: 80,
  gold: 10000000,
  sp: 500000,
  clan: {
    name: 'Os Guardiões de Aden',
    crestId: 'lion_gold',
    level: 1,
    joined: true,
    role: 'leader',
    castles: []
  }
};

const clanStatus = ClanService.getClanStatus(clanState);
assert(clanStatus && clanStatus.levelData != null, 'Status de Clã obtido com sucesso');

// Upgrade de Nível do Clã
const upRes = ClanService.upgradeClan(clanState, { log: () => {} });
assert(upRes.success === true, 'Clã evoluído para Nível 2 com sucesso');
assert(clanState.clan.level === 2, 'Nível 2 de Clã registrado');

// ═════════════════════════════════════════════════════════════════════════════
// 2. AUDITORIA DA ABA 16: SETE SELOS & MAMMON (tab-sevensigns)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🏛️ ABA 16: Sete Selos (Seven Signs) & Ferreiro de Mammon ---');
assert(Object.keys(FACTIONS).length === 2, 'Existem as 2 Facções Canônicas (Dawn e Dusk)');
assert(Object.keys(SEAL_STONES).length === 3, 'Existem as 3 Pedras de Selo (Blue, Green, Red)');

const sevenSignsState = {
  sevenSigns: {
    faction: null,
    ancientAdena: 0,
    stonesDeposited: { seal_stone_blue: 0, seal_stone_green: 0, seal_stone_red: 0 }
  },
  inventory: [
    { uid: 's1', itemId: 'seal_stone_blue', count: 50, equipped: false }
  ]
};

// Adesão a Faction
const joinRes = SevenSignsService.joinFaction(sevenSignsState, 'dawn', { log: () => {} });
assert(joinRes.success === true, 'Jogador ingressou na Faction Lords of Dawn');
assert(sevenSignsState.sevenSigns.faction === 'dawn', 'Faction Dawn ativa');

// Depósito de Seal Stones e conversão em Ancient Adena
const depRes = SevenSignsService.depositStones(sevenSignsState, 'seal_stone_blue', 20, { log: () => {} });
assert(depRes.success === true, 'Depósito de 20 Pedras Seladas Azuis concluído');
assert(sevenSignsState.sevenSigns.ancientAdena === 60, `Ancient Adena creditada (+${sevenSignsState.sevenSigns.ancientAdena} AA)`);

// ═════════════════════════════════════════════════════════════════════════════
// 3. AUDITORIA DA ABA 17: FORTALEZAS DE FRONTEIRA (tab-fortress)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🏰 ABA 17: Fortalezas de Fronteira & Talismãs ---');
const fortState = {
  fortresses: {
    owned: ['shanty_fortress'],
    epaulettes: 500,
    equippedBracelet: 'bracelet_steel',
    equippedTalismans: []
  },
  inventory: []
};

// Compra e engaste de Talismã com Epaulettes
const buyTalisman = FortressService.equipTalisman(fortState, 'talisman_power', { log: () => {} });
assert(buyTalisman.success === true, 'Talismã de Poder equipado com sucesso no bracelete');
assert(fortState.fortresses.equippedTalismans.includes('talisman_power'), 'Talismã registrado nos slots ativos');
assert(fortState.fortresses.epaulettes < 500, 'Knight Epaulettes consumidas na forja do talismã');

// ═════════════════════════════════════════════════════════════════════════════
// 4. AUDITORIA DA ABA 18: COLISEU DOS GLADIADORES (tab-colosseum)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- ⚔️ ABA 18: Coliseu dos Gladiadores & Apostas de Ouro ---');
const colosseumState = {
  gold: 200000,
  stats: { atk: 1500, def: 1000, maxHp: 25000 },
  colosseum: {
    badges: 0,
    duelWins: 0,
    duelLosses: 0,
    activeDuel: null
  }
};

const startDuel = ColosseumService.startDuel(colosseumState, 'bet_100k', { log: () => {} });
assert(startDuel.success === true, 'Duelo de apostas iniciado no Coliseu');
assert(colosseumState.gold === 100000, 'Aposta deduzida com sucesso (100.000g)');
assert(colosseumState.colosseum.activeDuel != null, 'Duelo ativo registrado no estado');

// ═════════════════════════════════════════════════════════════════════════════
// 5. AUDITORIA DA ABA 19: RANKINGS GLOBAIS (tab-rankings)
// ═════════════════════════════════════════════════════════════════════════════
console.log('\n--- 🏆 ABA 19: Rankings Globais & Perfil Público ---');
const playerProfileState = {
  name: 'Tristan Hero',
  level: 85,
  class: 'hawkeye',
  stats: { atk: 3500, def: 2200, maxHp: 30000 },
  equipment: { weapon: 'w1' },
  inventory: [{ uid: 'w1', name: 'Draconic Bow', enchant: 16 }]
};

const profile = RankingService.buildPublicProfile(playerProfileState);
assert(profile != null, 'Perfil público seguro gerado com sucesso');
assert(profile.charName === 'Tristan Hero', 'Nome do personagem preservado no perfil');
assert(profile.combatPower > 0, `Combat Power público calculado com sucesso (${profile.combatPower} CP)`);

console.log('\n========================================');
console.log(`Total: ${passed + failed} | Passaram: ${passed} | Falharam: ${failed}`);
console.log('========================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 SUCESSO! LOTE 5 (Abas 15, 16, 17, 18 e 19) 100% auditado e aprovado com excelência!');
}
