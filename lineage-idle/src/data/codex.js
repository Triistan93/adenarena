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
  c_grade_legion: {
    name:  '🛡️ Legião de Ferro C-Grade',
    desc:  'Registre armas e armaduras dos veteranos de Gludio.',
    items: ['berserker_blade', 'composite_armor_heavy', 'eminence_bow'],
    bonus: { atk: 75, def: 50, hp: 200 },
    label: '+75 P. Atk, +50 Def, +200 HP'
  },
  b_grade_knights: {
    name:  '⚔️ Cavaleiros da Ordem B-Grade',
    desc:  'Registre armaduras e lâminas nobres de Giran.',
    items: ['great_sword', 'blue_wolf_breastplate_heavy', 'bow_of_peril'],
    bonus: { atk: 120, def: 80, crit: 8 },
    label: '+120 P. Atk, +80 Def, +8% Crit'
  },
  a_grade_sovereign: {
    name:  '👑 Soberania Real A-Grade',
    desc:  'Registre o poder majestoso das tropas reais de Aden.',
    items: ['dragon_slayer', 'dark_crystal_breastplate_heavy', 'carnage_bow'],
    bonus: { atk: 200, matk: 200, hp: 500, def: 120 },
    label: '+200 P. Atk, +200 M. Atk, +500 HP, +120 Def'
  },
  s_grade_immortals: {
    name:  '🌌 Relíquias dos Imortais S-Grade',
    desc:  'Registre o poder supremo forjado pelos deuses de Elmore-Aden.',
    items: ['draconic_bow', 'imperial_crusader_breastplate', 'arcana_mace_staff'],
    bonus: { atk: 350, matk: 350, hp: 1000, def: 200, crit: 15 },
    label: '+350 P. Atk, +350 M. Atk, +1000 HP, +200 Def, +15% Crit'
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
  doll_goblin: {
    name: '👺 Goblin Doll', icon: '👺', rarity: 'common',
    source: '🌲 Drop de Caçadas em Talking Island (0.8%) · 🎲 Altar de Síntese',
    desc: 'Totem rústico esculpido por Goblins. Concede bônus inicial de P. Atk e Pontos de Vida.',
    statsByLvl: {
      1: { atk: 5,  hp: 30,  label: '+5 P. Atk, +30 Max HP'   },
      2: { atk: 12, hp: 70,  label: '+12 P. Atk, +70 Max HP'  },
      3: { atk: 22, hp: 130, label: '+22 P. Atk, +130 Max HP' },
      4: { atk: 35, hp: 220, label: '+35 P. Atk, +220 Max HP' },
      5: { atk: 55, hp: 350, label: '+55 P. Atk, +350 Max HP' }
    }
  },
  doll_wolf: {
    name: '🐺 Dire Wolf Doll', icon: '🐺', rarity: 'common',
    source: '🌲 Drop de Caçadas em Elven Forest & Gludio (0.8%) · 🎲 Altar de Síntese',
    desc: 'Amuleto talhado com presas de lobo alfa. Concede taxa crítica e velocidade de movimento.',
    statsByLvl: {
      1: { crit: 2, speed: 2,  label: '+2% Crit, +2% Speed'   },
      2: { crit: 4, speed: 4,  label: '+4% Crit, +4% Speed'   },
      3: { crit: 7, speed: 6,  label: '+7% Crit, +6% Speed'   },
      4: { crit: 11, speed: 9, label: '+11% Crit, +9% Speed'  },
      5: { crit: 16, speed: 12, label: '+16% Crit, +12% Speed' }
    }
  },
  doll_skeleton: {
    name: '💀 Skeleton Archer Doll', icon: '💀', rarity: 'common',
    source: '🌲 Drop de Caçadas nas Ruínas de Despair (0.8%) · 🎲 Altar de Síntese',
    desc: 'Crânio imbuído de energia profana. Aumenta poder de precisão, ataque e esquiva.',
    statsByLvl: {
      1: { atk: 6,  eva: 2,  label: '+6 P. Atk, +2 Eva'   },
      2: { atk: 14, eva: 4,  label: '+14 P. Atk, +4 Eva'  },
      3: { atk: 25, eva: 7,  label: '+25 P. Atk, +7 Eva'  },
      4: { atk: 40, eva: 11, label: '+40 P. Atk, +11 Eva' },
      5: { atk: 60, eva: 16, label: '+60 P. Atk, +16 Eva' }
    }
  },
  doll_orc: {
    name: '🧌 Orc Raider Doll', icon: '🧌', rarity: 'common',
    source: '🌲 Drop de Caçadas em Orc Village & Gludin (0.8%) · 🎲 Altar de Síntese',
    desc: 'Efigie de guerra da tribo Orc. Concede robustez defensiva e vida reforçada.',
    statsByLvl: {
      1: { def: 8,  hp: 40,  label: '+8 Def, +40 Max HP'   },
      2: { def: 18, hp: 90,  label: '+18 Def, +90 Max HP'  },
      3: { def: 32, hp: 170, label: '+32 Def, +170 Max HP' },
      4: { def: 50, hp: 280, label: '+50 Def, +280 Max HP' },
      5: { def: 75, hp: 420, label: '+75 Def, +420 Max HP' }
    }
  },
  doll_dryad: {
    name: '🌿 Forest Dryad Doll', icon: '🌿', rarity: 'common',
    source: '🌲 Drop de Caçadas em Florestas & Pântanos (0.8%) · 🎲 Altar de Síntese',
    desc: 'Ramo vivo de dríade milenar. Potencializa poder mágico místico e reserva de MP.',
    statsByLvl: {
      1: { matk: 8,  mp: 30,  label: '+8 M. Atk, +30 MP'   },
      2: { matk: 18, mp: 70,  label: '+18 M. Atk, +70 MP'  },
      3: { matk: 32, mp: 130, label: '+32 M. Atk, +130 MP' },
      4: { matk: 50, mp: 210, label: '+50 M. Atk, +210 MP' },
      5: { matk: 75, mp: 320, label: '+75 M. Atk, +320 MP' }
    }
  },
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
  doll_core: {
    name: '🔮 Core Doll', icon: '🔮', rarity: 'rare',
    source: '👑 Drop do Chefe Core em Cruma (5%) · 🎲 Altar de Alquimia',
    desc: 'Núcleo condensado de Cruma. Concede poder mágico e velocidade de conjuração.',
    statsByLvl: {
      1: { matk: 20, mp: 50,  label: '+20 M. Atk, +50 MP'   },
      2: { matk: 45, mp: 100, label: '+45 M. Atk, +100 MP'  },
      3: { matk: 80, mp: 180, label: '+80 M. Atk, +180 MP'  },
      4: { matk: 130, mp: 300, label: '+130 M. Atk, +300 MP' },
      5: { matk: 200, mp: 500, label: '+200 M. Atk, +500 MP' }
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
  },
  doll_valakas: {
    name: '🔥 Valakas Doll', icon: '🔥', rarity: 'legendary',
    source: '👑 Drop do Dragão Soberano Valakas (1%) · 🏆 Recompensa Suprema',
    desc: 'Coração em chamas de Valakas. Concede poder de ataque e crítico esmagadores.',
    statsByLvl: {
      1: { atk: 80,  matk: 80,  crit: 5,  label: '+80 P/M.Atk, +5% Crit' },
      2: { atk: 180, matk: 180, crit: 10, label: '+180 P/M.Atk, +10% Crit' },
      3: { atk: 320, matk: 320, crit: 18, label: '+320 P/M.Atk, +18% Crit' },
      4: { atk: 500, matk: 500, crit: 25, label: '+500 P/M.Atk, +25% Crit' },
      5: { atk: 800, matk: 800, crit: 40, label: '+800 P/M.Atk, +40% Crit' }
    }
  }
};
