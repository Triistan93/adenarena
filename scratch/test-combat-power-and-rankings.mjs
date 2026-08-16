import assert from 'assert';

import { CombatPowerService } from '../adenarena/lineage-idle/src/services/CombatPowerService.js';
import { RankingService, DEFAULT_LEGEND_PROFILES } from '../adenarena/lineage-idle/src/services/RankingService.js';
import { ColosseumService } from '../adenarena/lineage-idle/src/services/ColosseumService.js';
import { getStats } from '../adenarena/lineage-idle/src/engine/StatsEngine.js';

console.log('=== TESTE 1: Motor de Cálculo de Combat Power (CP) ===');

// 1.1 Personagem Iniciante Lv. 1
const stateNovice = {
  name: 'NoviceTristan',
  level: 1,
  classTier: 0,
  stats: { atk: 60, matk: 40, def: 50, mdef: 40, maxHp: 350, maxMp: 180, crit: 10, speed: 110, eva: 15 },
  equipment: {},
  inventory: []
};

const cpNovice = CombatPowerService.calculateCombatPower(stateNovice);
assert(cpNovice >= 500 && cpNovice <= 3000, `CP de Iniciante deve ser razoável (obtido: ${cpNovice})`);
console.log(`✓ Personagem Iniciante Lv. 1 calculado com: ${CombatPowerService.formatCombatPower(cpNovice)} (${CombatPowerService.getCombatPowerTier(cpNovice).name})`);

// 1.2 Personagem Veterano Lv. 80 S-Grade com Encantamentos +16, SA, Augmentação e Joias Épicas
const stateVeteran = {
  name: 'LordTristan',
  level: 80,
  classTier: 3,
  stats: { atk: 8500, matk: 4200, def: 6400, mdef: 5800, maxHp: 14000, maxMp: 4500, crit: 380, speed: 175, eva: 110 },
  equipment: {
    weapon: 'wpn_infinity_sword',
    armor: 'arm_draconic',
    necklace: 'jewel_valakas'
  },
  inventory: [
    {
      uid: 'wpn_infinity_sword',
      id: 'weapon_infinity_blade',
      name: 'Infinity Blade',
      tier: 6,
      enchant: 16,
      sa: true,
      augmentation: { stats: { pAtk: 120, crit: 30 }, glow: 'golden-amber' },
      isHeroWeapon: true
    },
    {
      uid: 'arm_draconic',
      id: 'armor_draconic_leather',
      name: 'Draconic Leather Armor',
      tier: 5,
      enchant: 10,
      isUnsealed: true
    },
    {
      uid: 'jewel_valakas',
      id: 'jewel_necklace_valakas',
      name: 'Necklace of Valakas',
      tier: 6,
      isEpic: true
    }
  ],
  skillEnchantments: {
    'triple_slash': { level: 20 },
    'sonic_buster': { level: 15 }
  },
  clan: { name: 'DragonKnights', level: 5, castle: 'Giran Castle' },
  fortresses: {
    owned: ['aaru_fortress'],
    equippedBracelet: 'bracelet_dynasty',
    equippedTalismans: ['talisman_power', 'talisman_defense', 'talisman_haste', 'talisman_crit']
  },
  noblesse: { isNoblesse: true },
  olympiad: { isHero: true, points: 2150, wins: 85, losses: 12 }
};

const cpVeteran = CombatPowerService.calculateCombatPower(stateVeteran);
assert(cpVeteran > 100000, `CP de Veterano deve ultrapassar 100k (obtido: ${cpVeteran})`);
const tierVeteran = CombatPowerService.getCombatPowerTier(cpVeteran);
console.log(`✓ Personagem Veterano End-Game calculado com: ${CombatPowerService.formatCombatPower(cpVeteran)} [${tierVeteran.badge} ${tierVeteran.name}]`);

console.log('\n=== TESTE 2: Perfil Público e Sincronização de Dados ===');
const publicProfile = RankingService.buildPublicProfile(stateVeteran);
assert.strictEqual(publicProfile.charName, 'LordTristan');
assert.strictEqual(publicProfile.combatPower, cpVeteran);
assert.strictEqual(publicProfile.clanName, 'DragonKnights');
assert.strictEqual(publicProfile.isHero, true);
assert(publicProfile.topWeaponName.includes('Infinity Blade'));
console.log('✓ Perfil público gerado com sucesso:', {
  charName: publicProfile.charName,
  combatPower: publicProfile.combatPower,
  topWeapon: publicProfile.topWeaponName,
  isHero: publicProfile.isHero
});

console.log('\n=== TESTE 3: Leaderboards e Ordenação de Categorias ===');
async function testLeaderboards() {
  const cpRankings = await RankingService.getLeaderboard('cp', stateVeteran);
  assert(cpRankings.length >= 6, 'Deve retornar rankings com os líderes');
  // Verifica ordem decrescente de CP
  for (let i = 0; i < cpRankings.length - 1; i++) {
    assert(cpRankings[i].combatPower >= cpRankings[i + 1].combatPower, 'Rankings de CP devem estar ordenados');
  }
  console.log(`✓ Ranking de Combat Power validado com ${cpRankings.length} competidores (Top 1: ${cpRankings[0].charName} - ${CombatPowerService.formatCombatPower(cpRankings[0].combatPower)})`);

  const olyRankings = await RankingService.getLeaderboard('olympiad', stateVeteran);
  for (let i = 0; i < olyRankings.length - 1; i++) {
    assert(olyRankings[i].olympiadPoints >= olyRankings[i + 1].olympiadPoints, 'Rankings de Olimpíada devem estar ordenados por pontos');
  }
  console.log(`✓ Ranking de Grand Olympiad validado (Top 1: ${olyRankings[0].charName} com ${olyRankings[0].olympiadPoints} pts)`);
}
await testLeaderboards();

console.log('\n=== TESTE 4: Matchmaking Balanceado por Combat Power ===');
async function testMatchmaking() {
  const opponents = await RankingService.getMatchmakingOpponents(stateVeteran, 3);
  assert.strictEqual(opponents.length, 3, 'Deve encontrar 3 desafiantes balanceados');
  
  opponents.forEach((opp, i) => {
    const cpRatio = opp.combatPower / cpVeteran;
    assert(cpRatio >= 0.65 && cpRatio <= 1.45, `Oponente #${i+1} deve estar em faixa aceitável de CP (ratio: ${cpRatio.toFixed(2)})`);
    console.log(`  - Oponente #${i + 1}: ${opp.charName} (${opp.className}) | CP: ${CombatPowerService.formatCombatPower(opp.combatPower)} | Arma: ${opp.topWeaponName}`);
  });
  console.log('✓ Matchmaking por Combat Power gerou desafiantes perfeitamente calibrados!');
}
await testMatchmaking();

console.log('\n=== TESTE 5: Duelo Customizado contra Rival de Ranking ===');
const stateRivalry = {
  level: 80,
  gold: 10000000,
  stats: { atk: 8000, def: 6000, maxHp: 12000 },
  colosseum: { badges: 50, duelWins: 0, duelLosses: 0 }
};

const rivalOpponent = {
  charName: 'ArchmageEva',
  className: 'Mystic Muse',
  combatPower: 228900,
  statsSnapshot: { hp: 11000, pAtk: 7500, pDef: 5500 }
};

const duelRes = ColosseumService.startDuel(stateRivalry, 'bet_500k', { log: () => {} }, rivalOpponent);
assert.strictEqual(duelRes.success, true);
assert.strictEqual(stateRivalry.colosseum.activeDuel.opponentName, 'ArchmageEva');
assert.strictEqual(stateRivalry.colosseum.activeDuel.hp, 11000);

while (stateRivalry.colosseum.activeDuel) {
  ColosseumService.executeDuelTurn(stateRivalry, { log: () => {} });
}
assert.strictEqual(stateRivalry.colosseum.duelWins, 1);
console.log('✓ Duelo contra rival de ranking resolvido com vitória e recompensas!');

console.log('\n=== TESTE 6: StatsEngine retorna combatPower ===');
const calculatedStats = getStats(stateVeteran);
assert(calculatedStats.combatPower > 0, 'StatsEngine deve incluir combatPower');
console.log(`✓ StatsEngine.getStats retornou combatPower: ${calculatedStats.combatPower}`);

console.log('\n🎉 TODOS OS TESTES DE COMBAT POWER, RANKINGS E MATCHMAKING PASSARAM COM 100% DE SUCESSO!');
