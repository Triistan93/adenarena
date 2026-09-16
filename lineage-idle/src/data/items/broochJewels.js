/**
 * broochJewels.js — Definição Canônica de Broches e Joias de Broche (Lineage II Essence Style).
 * 
 * Joias de Broche:
 * - Ruby: P.Atk e bônus de dano de Soulshots.
 * - Sapphire: M.Atk e bônus de dano de Spiritshots.
 * - Diamond: P.Def e resistência a acertos críticos físicos.
 * - Pearl: M.Def e resistência a acertos críticos mágicos.
 * - Opal: Atributos gerais e poder de habilidades.
 */

export const BROOCHES = {
  brooch_d: {
    id: 'brooch_d',
    itemId: 'brooch_d',
    name: 'Broche de Bronze [D-Grade]',
    slot: 'brooch',
    tier: 2,
    grade: 'D',
    slots: 2,
    price: 35000,
    icon: 'acessories/brooch_bronze.png',
    desc: 'Broche de bronze com 2 engastes para Joias de Broche mágicas.'
  },
  brooch_c: {
    id: 'brooch_c',
    itemId: 'brooch_c',
    name: 'Broche de Prata [C-Grade]',
    slot: 'brooch',
    tier: 3,
    grade: 'C',
    slots: 3,
    price: 90000,
    icon: 'acessories/brooch_silver.png',
    desc: 'Broche refinado de prata com 3 engastes para Joias de Broche mágicas.'
  }
};

export const BROOCH_JEWELS = {
  // ─── RUBY (Rubi: Dano Físico e Soulshots) ───
  jewel_ruby_1: { id: 'jewel_ruby_1', itemId: 'jewel_ruby_1', name: 'Rubi de Broche - Nível 1', jewelType: 'ruby', level: 1, slot: 'jewel', atk: 15, ssBonusPct: 3, price: 15000, icon: 'acessories/jewel_ruby.png', desc: '+15 P.Atk e +3% no bônus de dano de Soulshots.' },
  jewel_ruby_2: { id: 'jewel_ruby_2', itemId: 'jewel_ruby_2', name: 'Rubi de Broche - Nível 2', jewelType: 'ruby', level: 2, slot: 'jewel', atk: 30, ssBonusPct: 6, price: 35000, icon: 'acessories/jewel_ruby.png', desc: '+30 P.Atk e +6% no bônus de dano de Soulshots.' },
  jewel_ruby_3: { id: 'jewel_ruby_3', itemId: 'jewel_ruby_3', name: 'Rubi de Broche - Nível 3', jewelType: 'ruby', level: 3, slot: 'jewel', atk: 55, ssBonusPct: 10, price: 80000, icon: 'acessories/jewel_ruby.png', desc: '+55 P.Atk e +10% no bônus de dano de Soulshots.' },
  jewel_ruby_4: { id: 'jewel_ruby_4', itemId: 'jewel_ruby_4', name: 'Rubi de Broche - Nível 4', jewelType: 'ruby', level: 4, slot: 'jewel', atk: 90, ssBonusPct: 15, price: 180000, icon: 'acessories/jewel_ruby.png', desc: '+90 P.Atk e +15% no bônus de dano de Soulshots.' },
  jewel_ruby_5: { id: 'jewel_ruby_5', itemId: 'jewel_ruby_5', name: 'Rubi de Broche - Nível 5 (MÁXIMO)', jewelType: 'ruby', level: 5, slot: 'jewel', atk: 140, ssBonusPct: 22, price: 450000, icon: 'acessories/jewel_ruby.png', desc: '+140 P.Atk e +22% no bônus de dano de Soulshots.' },

  // ─── SAPPHIRE (Safira: Dano Mágico e Spiritshots) ───
  jewel_sapphire_1: { id: 'jewel_sapphire_1', itemId: 'jewel_sapphire_1', name: 'Safira de Broche - Nível 1', jewelType: 'sapphire', level: 1, slot: 'jewel', matk: 20, spsBonusPct: 3, price: 15000, icon: 'acessories/jewel_sapphire.png', desc: '+20 M.Atk e +3% no bônus de dano de Spiritshots.' },
  jewel_sapphire_2: { id: 'jewel_sapphire_2', itemId: 'jewel_sapphire_2', name: 'Safira de Broche - Nível 2', jewelType: 'sapphire', level: 2, slot: 'jewel', matk: 40, spsBonusPct: 6, price: 35000, icon: 'acessories/jewel_sapphire.png', desc: '+40 M.Atk e +6% no bônus de dano de Spiritshots.' },
  jewel_sapphire_3: { id: 'jewel_sapphire_3', itemId: 'jewel_sapphire_3', name: 'Safira de Broche - Nível 3', jewelType: 'sapphire', level: 3, slot: 'jewel', matk: 75, spsBonusPct: 10, price: 80000, icon: 'acessories/jewel_sapphire.png', desc: '+75 M.Atk e +10% no bônus de dano de Spiritshots.' },
  jewel_sapphire_4: { id: 'jewel_sapphire_4', itemId: 'jewel_sapphire_4', name: 'Safira de Broche - Nível 4', jewelType: 'sapphire', level: 4, slot: 'jewel', matk: 120, spsBonusPct: 15, price: 180000, icon: 'acessories/jewel_sapphire.png', desc: '+120 M.Atk e +15% no bônus de dano de Spiritshots.' },
  jewel_sapphire_5: { id: 'jewel_sapphire_5', itemId: 'jewel_sapphire_5', name: 'Safira de Broche - Nível 5 (MÁXIMO)', jewelType: 'sapphire', level: 5, slot: 'jewel', matk: 180, spsBonusPct: 22, price: 450000, icon: 'acessories/jewel_sapphire.png', desc: '+180 M.Atk e +22% no bônus de dano de Spiritshots.' },

  // ─── DIAMOND (Diamante: Defesa Física) ───
  jewel_diamond_1: { id: 'jewel_diamond_1', itemId: 'jewel_diamond_1', name: 'Diamante de Broche - Nível 1', jewelType: 'diamond', level: 1, slot: 'jewel', def: 15, price: 15000, icon: 'acessories/jewel_diamond.png', desc: '+15 P.Def e proteção contra impactos.' },
  jewel_diamond_2: { id: 'jewel_diamond_2', itemId: 'jewel_diamond_2', name: 'Diamante de Broche - Nível 2', jewelType: 'diamond', level: 2, slot: 'jewel', def: 30, price: 35000, icon: 'acessories/jewel_diamond.png', desc: '+30 P.Def e proteção contra impactos.' },
  jewel_diamond_3: { id: 'jewel_diamond_3', itemId: 'jewel_diamond_3', name: 'Diamante de Broche - Nível 3', jewelType: 'diamond', level: 3, slot: 'jewel', def: 55, price: 80000, icon: 'acessories/jewel_diamond.png', desc: '+55 P.Def e proteção contra impactos.' },
  jewel_diamond_4: { id: 'jewel_diamond_4', itemId: 'jewel_diamond_4', name: 'Diamante de Broche - Nível 4', jewelType: 'diamond', level: 4, slot: 'jewel', def: 90, price: 180000, icon: 'acessories/jewel_diamond.png', desc: '+90 P.Def e proteção contra impactos.' },
  jewel_diamond_5: { id: 'jewel_diamond_5', itemId: 'jewel_diamond_5', name: 'Diamante de Broche - Nível 5 (MÁXIMO)', jewelType: 'diamond', level: 5, slot: 'jewel', def: 140, price: 450000, icon: 'acessories/jewel_diamond.png', desc: '+140 P.Def e proteção suprema contra impactos.' },

  // ─── PEARL (Pérola: Defesa Mágica) ───
  jewel_pearl_1: { id: 'jewel_pearl_1', itemId: 'jewel_pearl_1', name: 'Pérola de Broche - Nível 1', jewelType: 'pearl', level: 1, slot: 'jewel', mdef: 18, price: 15000, icon: 'acessories/jewel_pearl.png', desc: '+18 M.Def e dissipação mágica.' },
  jewel_pearl_2: { id: 'jewel_pearl_2', itemId: 'jewel_pearl_2', name: 'Pérola de Broche - Nível 2', jewelType: 'pearl', level: 2, slot: 'jewel', mdef: 35, price: 35000, icon: 'acessories/jewel_pearl.png', desc: '+35 M.Def e dissipação mágica.' },
  jewel_pearl_3: { id: 'jewel_pearl_3', itemId: 'jewel_pearl_3', name: 'Pérola de Broche - Nível 3', jewelType: 'pearl', level: 3, slot: 'jewel', mdef: 65, price: 80000, icon: 'acessories/jewel_pearl.png', desc: '+65 M.Def e dissipação mágica.' },
  jewel_pearl_4: { id: 'jewel_pearl_4', itemId: 'jewel_pearl_4', name: 'Pérola de Broche - Nível 4', jewelType: 'pearl', level: 4, slot: 'jewel', mdef: 105, price: 180000, icon: 'acessories/jewel_pearl.png', desc: '+105 M.Def e dissipação mágica.' },
  jewel_pearl_5: { id: 'jewel_pearl_5', itemId: 'jewel_pearl_5', name: 'Pérola de Broche - Nível 5 (MÁXIMO)', jewelType: 'pearl', level: 5, slot: 'jewel', mdef: 160, price: 450000, icon: 'acessories/jewel_pearl.png', desc: '+160 M.Def e dissipação suprema mágica.' },

  // ─── OPAL (Opala: Atributos Gerais e Poder de Habilidades) ───
  jewel_opal_1: { id: 'jewel_opal_1', itemId: 'jewel_opal_1', name: 'Opala de Broche - Nível 1', jewelType: 'opal', level: 1, slot: 'jewel', atk: 8, matk: 8, def: 8, mdef: 8, price: 20000, icon: 'acessories/jewel_opal.png', desc: '+8 em todos os atributos e +2% poder de habilidade.' },
  jewel_opal_2: { id: 'jewel_opal_2', itemId: 'jewel_opal_2', name: 'Opala de Broche - Nível 2', jewelType: 'opal', level: 2, slot: 'jewel', atk: 18, matk: 18, def: 18, mdef: 18, price: 45000, icon: 'acessories/jewel_opal.png', desc: '+18 em todos os atributos e +4% poder de habilidade.' },
  jewel_opal_3: { id: 'jewel_opal_3', itemId: 'jewel_opal_3', name: 'Opala de Broche - Nível 3', jewelType: 'opal', level: 3, slot: 'jewel', atk: 32, matk: 32, def: 32, mdef: 32, price: 100000, icon: 'acessories/jewel_opal.png', desc: '+32 em todos os atributos e +7% poder de habilidade.' },
  jewel_opal_4: { id: 'jewel_opal_4', itemId: 'jewel_opal_4', name: 'Opala de Broche - Nível 4', jewelType: 'opal', level: 4, slot: 'jewel', atk: 52, matk: 52, def: 52, mdef: 52, price: 220000, icon: 'acessories/jewel_opal.png', desc: '+52 em todos os atributos e +11% poder de habilidade.' },
  jewel_opal_5: { id: 'jewel_opal_5', itemId: 'jewel_opal_5', name: 'Opala de Broche - Nível 5 (MÁXIMO)', jewelType: 'opal', level: 5, slot: 'jewel', atk: 80, matk: 80, def: 80, mdef: 80, price: 500000, icon: 'acessories/jewel_opal.png', desc: '+80 em todos os atributos e +16% poder de habilidade.' }
};
