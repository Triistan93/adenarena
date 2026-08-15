// Protótipo do Novo Sistema de Árvores Progressivas por Faixa de Nível (1-19, 20-39, 40-75, 76-79, 80+)

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

import { CLASSES_ECHO } from '../lineage-idle/src/data/classes/classes_echo_defs.js';

console.log('=== TESTE DO NOVO SISTEMA PROGRESSIVO POR FAIXA DE NÍVEL ===\n');

// Definição dos Tiers / Faixas de Nível
const LEVEL_TIERS = [
  { tier: 0, minLvl: 1,  maxLvl: 19, name: 'Lv. 1 - 19 (Básico)',          count: 5, spCost: 5,  star: 1 },
  { tier: 1, minLvl: 20, maxLvl: 39, name: 'Lv. 20 - 39 (1ª Troca)',       count: 5, spCost: 15, star: 2 },
  { tier: 2, minLvl: 40, maxLvl: 75, name: 'Lv. 40 - 75 (2ª Troca)',       count: 5, spCost: 25, star: 3 },
  { tier: 3, minLvl: 76, maxLvl: 79, name: 'Lv. 76 - 79 (3ª Troca)',       count: 5, spCost: 35, star: 3 },
  { tier: 4, minLvl: 80, maxLvl: 100, name: 'Lv. 80+ (Endgame & Ultimate)', count: 3, spCost: 50, star: 4 }
];

console.log('Faixas de Níveis configuradas:');
LEVEL_TIERS.forEach(t => console.log(`  Tier ${t.tier}: ${t.name} -> ${t.count} skills (Req Lv. ${t.minLvl}+, Custo: ${t.spCost} SP)`));
