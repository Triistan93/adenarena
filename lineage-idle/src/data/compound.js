/**
 * compound.js ÔÇö M├│dulo do Sistema de Compound (Lineage 2 Essence Standard)
 *
 * Permite a s├¡ntese de Talism├ús, Pedras de Broche, Agathions, Capas e Cintos.
 * Fus├úo de 2 itens iguais do mesmo n├¡vel.
 */

export const COMPOUND_RATES = {
  1: { rate: 0.75, cost: 100000, label: '75%' },
  2: { rate: 0.65, cost: 250000, label: '65%' },
  3: { rate: 0.50, cost: 500000, label: '50%' },
  4: { rate: 0.40, cost: 1000000, label: '40%' },
  5: { rate: 0.30, cost: 2500000, label: '30%' },
  6: { rate: 0.25, cost: 5000000, label: '25%' },
  7: { rate: 0.20, cost: 10000000, label: '20%' },
  8: { rate: 0.15, cost: 20000000, label: '15%' },
  9: { rate: 0.10, cost: 50000000, label: '10%' }
};

export function getCompoundLevel(item) {
  if (!item) return 1;
  if (item.compoundLevel) return item.compoundLevel;
  if (item.enchant) return item.enchant;
  
  // Try extracting level from itemId or name (e.g. talisman_aden_lv2)
  const match = (item.itemId || '').match(/lv(\d+)/i) || (item.name || '').match(/Lv\.?(\d+)/i);
  if (match) return parseInt(match[1], 10);
  return 1;
}

export function isCompoundable(item) {
  if (!item) return false;
  const id = (item.itemId || '').toLowerCase();
  const slot = (item.slot || '').toLowerCase();
  
  return (
    id.includes('talisman') ||
    id.includes('jewel') ||
    id.includes('ruby') ||
    id.includes('sapphire') ||
    id.includes('emerald') ||
    id.includes('opal') ||
    id.includes('diamond') ||
    id.includes('aquamarine') ||
    id.includes('pearl') ||
    id.includes('agathion') ||
    id.includes('cloak') ||
    id.includes('belt') ||
    slot === 'talisman' ||
    slot === 'agathion' ||
    slot === 'cloak' ||
    slot === 'belt'
  );
}

export function getCompoundSuccessRate(level = 1) {
  const conf = COMPOUND_RATES[level] || COMPOUND_RATES[1];
  return conf.rate;
}

export function getCompoundCost(level = 1) {
  const conf = COMPOUND_RATES[level] || COMPOUND_RATES[1];
  return conf.cost;
}