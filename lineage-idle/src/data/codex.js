/**
 * codex.js — Definições do Codex de Coleções e Boss Dolls do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 4748-4791, 4894-4935)
 */

/**
 * Sets do Codex de Coleções.
 * Cada set exige que o jogador registre todos os `items` para ganhar o `bonus`.
 */
export const CODEX_SETS = {
  novice_weapons: {
    name:  '⚔️ Armamento de Recruta',
    desc:  'Registre as armas iniciais de caça dos novatos.',
    items: ['knight_sword', 'crucifix_of_blessing_magicblunt', 'hunting_bow'],
    bonus: { atk: 25, matk: 25 },
    label: '+25 P. Atk & +25 M. Atk'
  },
  novice_armors: {
    name:  '🛡️ Vestimentas de Tecido & Couro',
    desc:  'Registre os trajes defensivos básicos de treino.',
    items: ['bone_breastplate', 'leather_vest_light', 'devotion_armor_robe'],
    bonus: { def: 30, mdef: 30 },
    label: '+30 P. Def & +30 M. Def'
  },
  novice_jewels: {
    name:  '📿 Joias Elegantes de Aden',
    desc:  'Registre joias de treino com propriedades místicas.',
    items: ['blue_coral_ring', 'magic_ring'],
    bonus: { hp: 100, mp: 50 },
    label: '+100 Max HP & +50 Max MP'
  },
  d_grade_champions: {
    name:  '🗡️ Equipamentos de Ordem D-Grade',
    desc:  'Registre lâminas e vestes de guerreiros comprovados.',
    items: ['crimson_sword', 'elven_bow', 'brigandine_armor_heavy'],
    bonus: { atk: 50, crit: 5 },
    label: '+50 P. Atk & +5% P. Crit Rate'
  },
  crystal_masters: {
    name:  '💎 Pedras Elementais de Aden',
    desc:  'Registre gemas extraídas das cavernas místicas.',
    items: ['fire_stone', 'water_stone', 'earth_stone'],
    bonus: { atk: 60, matk: 60, hp: 150 },
    label: '+60 P. Atk, +60 M. Atk, +150 HP'
  },
  spellbook_codex: {
    name:  '📖 Grimórios Sagrados dos Astros',
    desc:  'Registre os grimórios das estrelas de Aden.',
    items: ['spellbook_1star', 'spellbook_2star', 'spellbook_3star', 'spellbook_4star'],
    bonus: { atk: 100, matk: 100, hp: 300, def: 50 },
    label: '+100 P. Atk, +100 M. Atk, +300 HP, +50 Def'
  }
};

/**
 * Boss Dolls — Bonificações por nível e fontes de obtenção.
 */
export const BOSS_DOLLS = {
  doll_queen_ant: {
    name: '🐜 Queen Ant Doll', icon: '🐜', rarity: 'rare',
    source: '👑 Drop do Chefe Queen Ant (5%) · 🎲 Roleta Craft',
    desc: 'Espírito ancestral da Rainha Formiga. Concede bônus de ataque físico e acertos críticos.',
    statsByLvl: {
      1: { atk: 15,  crit: 3,  label: '+15 P. Atk, +3% Crit'   },
      2: { atk: 35,  crit: 6,  label: '+35 P. Atk, +6% Crit'   },
      3: { atk: 60,  crit: 10, label: '+60 P. Atk, +10% Crit'  },
      4: { atk: 100, crit: 15, label: '+100 P. Atk, +15% Crit' },
      5: { atk: 160, crit: 25, label: '+160 P. Atk, +25% Crit' }
    }
  },
  doll_orfen: {
    name: '🦋 Orfen Doll', icon: '🦋', rarity: 'rare',
    source: '👑 Drop do Chefe Orfen (5%) · 🎲 Altar de Alquimia',
    desc: 'Névoa mística de Orfen. Potencializa ataque mágico e crítico místico.',
    statsByLvl: {
      1: { matk: 20,  crit: 3,  label: '+20 M. Atk, +3% M. Crit'   },
      2: { matk: 45,  crit: 6,  label: '+45 M. Atk, +6% M. Crit'   },
      3: { matk: 80,  crit: 10, label: '+80 M. Atk, +10% M. Crit'  },
      4: { matk: 120, crit: 15, label: '+120 M. Atk, +15% M. Crit' },
      5: { matk: 180, crit: 25, label: '+180 M. Atk, +25% M. Crit' }
    }
  },
  doll_zaken: {
    name: '🏴‍☠️ Zaken Doll', icon: '🏴‍☠️', rarity: 'epic',
    source: '👑 Drop do Capitão Zaken (4%) · 🎲 Roleta Craft',
    desc: 'Alma do Capitão Pirata Zaken. Oferece defesa e vampirismo em vida.',
    statsByLvl: {
      1: { def: 25,  lifesteal: 3,  label: '+25 Def, +3% Lifesteal'   },
      2: { def: 50,  lifesteal: 5,  label: '+50 Def, +5% Lifesteal'   },
      3: { def: 85,  lifesteal: 8,  label: '+85 Def, +8% Lifesteal'   },
      4: { def: 130, lifesteal: 12, label: '+130 Def, +12% Lifesteal' },
      5: { def: 200, lifesteal: 18, label: '+200 Def, +18% Lifesteal' }
    }
  },
  doll_baium: {
    name: '⚡ Baium Doll', icon: '⚡', rarity: 'legendary',
    source: '👑 Drop do Raid Boss Baium na Torre da Insolência (3%)',
    desc: 'Essência do Imperador Baium. Aumenta velocidade de combate.',
    statsByLvl: {
      1: { speed: 5,  label: '+5% Speed'  },
      2: { speed: 10, label: '+10% Speed' },
      3: { speed: 15, label: '+15% Speed' },
      4: { speed: 22, label: '+22% Speed' },
      5: { speed: 30, label: '+30% Speed' }
    }
  },
  doll_antharas: {
    name: '🐉 Antharas Doll', icon: '🐉', rarity: 'legendary',
    source: '👑 Drop do Dragão Antharas (2%) · 🏆 Recompensa de Saga',
    desc: 'Escama sagrada de Antharas. Concede vida colossal e defesa.',
    statsByLvl: {
      1: { hp: 200, def: 40,  label: '+200 Max HP, +40 Def' },
      2: { hp: 450, def: 80,  label: '+450 Max HP, +80 Def' },
      3: { hp: 800, def: 140, label: '+800 Max HP, +140 Def' },
      4: { hp: 1300, def: 220, label: '+1300 Max HP, +220 Def' },
      5: { hp: 2000, def: 350, label: '+2000 Max HP, +350 Def' }
    }
  }
};
