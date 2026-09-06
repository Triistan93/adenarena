/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TOOLS / ECONOMY SIMULATOR — NÍVEL 6.3: SIMULADOR DE ECONOMIA OFFLINE
 * ═══════════════════════════════════════════════════════════════════════════
 * Executável via Node.js: `node tools/economy-sim.js`
 *
 * Simula 24 horas, 7 dias e 30 dias de progressão idle ininterrupta:
 * - Valida influxo bruto de Adena por faixa de nível (Tier 1 a Tier 7)
 * - Projeta despesas operacionais (Soulshots, Poções, Consumíveis)
 * - Simula Sorvedouros de Adena Estruturais (Forja, Encantamento, Síntese,
 *   Atributos Elementais, Selos do Pushkin, Dyes e Impostos de Mercado)
 * - Diagnostica o Coeficiente de Inflação e a Estabilidade Monetária.
 */

// 1. Definições de Zonas e Multiplicadores Econômicos
const SIMULATION_TIERS = [
  {
    tier: 'Tier 1 (No-Grade · Lv 1-19)',
    zoneName: 'Talking Island / Elven Forest',
    avgMonsterHp: 180,
    killsPerHour: 1800,
    baseAdenaPerKill: 22,
    soulshotGrade: 'NG',
    shotCostPerHit: 2,
    potionCostPerHour: 600,
    forgeUpgradesPerHour: 400
  },
  {
    tier: 'Tier 2 (D-Grade · Lv 20-39)',
    zoneName: 'Dion Hills / Execution Ground',
    avgMonsterHp: 550,
    killsPerHour: 1400,
    baseAdenaPerKill: 85,
    soulshotGrade: 'D',
    shotCostPerHit: 7,
    potionCostPerHour: 2500,
    forgeUpgradesPerHour: 5000
  },
  {
    tier: 'Tier 3 (C-Grade · Lv 40-51)',
    zoneName: 'Giran Outskirts / Death Pass',
    avgMonsterHp: 1600,
    killsPerHour: 1100,
    baseAdenaPerKill: 280,
    soulshotGrade: 'C',
    shotCostPerHit: 18,
    potionCostPerHour: 8000,
    forgeUpgradesPerHour: 22000
  },
  {
    tier: 'Tier 4 (B-Grade · Lv 52-61)',
    zoneName: 'Dragon Valley / Cemetery',
    avgMonsterHp: 4200,
    killsPerHour: 850,
    baseAdenaPerKill: 750,
    soulshotGrade: 'B',
    shotCostPerHit: 45,
    potionCostPerHour: 22000,
    forgeUpgradesPerHour: 80000
  },
  {
    tier: 'Tier 5 (A-Grade · Lv 62-75)',
    zoneName: 'Wall of Argos / Blazing Swamp',
    avgMonsterHp: 11000,
    killsPerHour: 650,
    baseAdenaPerKill: 2100,
    soulshotGrade: 'A',
    shotCostPerHit: 110,
    potionCostPerHour: 55000,
    forgeUpgradesPerHour: 250000
  },
  {
    tier: 'Tier 6 (S-Grade · Lv 76-84)',
    zoneName: 'Forge of the Gods / Imperial Tomb',
    avgMonsterHp: 28000,
    killsPerHour: 480,
    baseAdenaPerKill: 5400,
    soulshotGrade: 'S',
    shotCostPerHit: 260,
    potionCostPerHour: 140000,
    forgeUpgradesPerHour: 850000
  },
  {
    tier: 'Tier 7 (Endgame / Frostlord · Lv 85+)',
    zoneName: 'Lair of Antharas / Monastery',
    avgMonsterHp: 65000,
    killsPerHour: 360,
    baseAdenaPerKill: 12500,
    soulshotGrade: 'S',
    shotCostPerHit: 320,
    potionCostPerHour: 320000,
    forgeUpgradesPerHour: 2400000
  }
];

function formatNumber(num) {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return Math.round(num).toLocaleString('en-US');
}

function runSimulation(hours = 24) {
  const periodLabel = hours === 24 ? '24 HORAS' : (hours === 168 ? '7 DIAS' : '30 DIAS (1 MÊS)');
  console.log(`\n================================================================================`);
  console.log(`📊 SIMULAÇÃO ECONÔMICA ADEN ARENA — PROJEÇÃO DE ${periodLabel} (${hours} Horas)`);
  console.log(`================================================================================`);
  console.log(
    `| ${'Faixa / Zona'.padEnd(32)} | ${'Monstros'.padStart(9)} | ${'Adena Bruta'.padStart(12)} | ${'Sorvedouros'.padStart(12)} | ${'Saldo Líq.'.padStart(12)} | ${'Retenção'.padStart(9)} |`
  );
  console.log(`|${'-'.repeat(34)}|${'-'.repeat(11)}|${'-'.repeat(14)}|${'-'.repeat(14)}|${'-'.repeat(14)}|${'-'.repeat(11)}|`);

  let totalSimKills = 0;
  let totalSimGross = 0;
  let totalSimSinks = 0;

  for (const tier of SIMULATION_TIERS) {
    const kills = tier.killsPerHour * hours;
    
    // Influxo Bruto (Adena dropada pelos monstros)
    const grossAdena = kills * tier.baseAdenaPerKill;

    // Sorvedouros (Sinks):
    // 1. Soulshots: 1 por ataque, média de 2.2 hits por monstro
    const shotCost = kills * 2.2 * tier.shotCostPerHit;
    // 2. Poções e Consumíveis
    const potionCost = tier.potionCostPerHour * hours;
    // 3. Forja / Aprimoramento / Síntese / Elementos
    const forgeCost = tier.forgeUpgradesPerHour * hours;
    // 4. Taxas de Mercado e Teleporte (5% da renda bruta)
    const marketTaxes = grossAdena * 0.05;

    const totalSinks = shotCost + potionCost + forgeCost + marketTaxes;
    const netAdena = grossAdena - totalSinks;
    const retentionRate = Math.max(0, (netAdena / grossAdena) * 100);

    totalSimKills += kills;
    totalSimGross += grossAdena;
    totalSimSinks += totalSinks;

    const rowTier = tier.tier.padEnd(32);
    const rowKills = formatNumber(kills).padStart(9);
    const rowGross = formatNumber(grossAdena).padStart(12);
    const rowSinks = formatNumber(totalSinks).padStart(12);
    const rowNet = formatNumber(netAdena).padStart(12);
    const rowRet = (retentionRate.toFixed(1) + '%').padStart(9);

    console.log(`| ${rowTier} | ${rowKills} | ${rowGross} | ${rowSinks} | ${rowNet} | ${rowRet} |`);
  }

  const overallNet = totalSimGross - totalSimSinks;
  const overallRetention = (overallNet / totalSimGross) * 100;

  console.log(`|${'-'.repeat(34)}|${'-'.repeat(11)}|${'-'.repeat(14)}|${'-'.repeat(14)}|${'-'.repeat(14)}|${'-'.repeat(11)}|`);
  console.log(
    `| ${'MÉDIA GLOBAL CONSOLIDADA'.padEnd(32)} | ${formatNumber(totalSimKills).padStart(9)} | ${formatNumber(totalSimGross).padStart(12)} | ${formatNumber(totalSimSinks).padStart(12)} | ${formatNumber(overallNet).padStart(12)} | ${(overallRetention.toFixed(1) + '%').padStart(9)} |`
  );
  console.log(`================================================================================`);

  // Análise de Estabilidade Anti-Inflação
  console.log(`🔍 DIAGNÓSTICO ECONÔMICO:`);
  if (overallRetention >= 25 && overallRetention <= 55) {
    console.log(`   ✅ ESTABILIDADE PERFEITA: Retenção média de ${overallRetention.toFixed(1)}% está dentro da janela de ouro (25% - 55%).`);
    console.log(`   ✅ Os sorvedouros de Forja, Soulshots e Taxas drenam ~${(100 - overallRetention).toFixed(1)}% da Adena gerada, impedindo hiperinflação.`);
  } else if (overallRetention > 55) {
    console.log(`   ⚠️ RISCO DE INFLAÇÃO: Retenção de ${overallRetention.toFixed(1)}% é alta. Considere aumentar custos de Forja ou taxas de mercado.`);
  } else {
    console.log(`   ⚠️ ECONOMIA RESTRITIVA: Retenção de ${overallRetention.toFixed(1)}% pode frustrar jogadores. Ajuste custos de consumíveis.`);
  }
}

// Executa simulações para 24 Horas, 7 Dias e 30 Dias
console.log('🏛️ INICIANDO SIMULADOR DE ECONOMIA — ADEN ARENA ENGINE v2.5');
runSimulation(24);
runSimulation(168);
runSimulation(720);
