/**
 * codex.js — Definições do Codex de Coleções e Boss Dolls do Lineage Idle.
 * Extraído de lineage-idle/main.js (linhas 4748-4791, 4894-4935)
 */

/**
 * Sets do Codex de Coleções.
 * Cada set exige que o jogador registre todos os `items` para ganhar o `bonus`.
 */
export const CODEX_SETS = {
  // ─── COLEÇÕES INICIAIS (NO-GRADE) ───
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
  novice_heavy: {
    name:  '🛡️ Infantaria Básica de Gludio',
    desc:  'Armaduras pesadas dos primeiros combatentes.',
    items: ['bone_breastplate', 'bronze_breastplate_heavy'],
    bonus: { def: 20, hp: 50 },
    label: '+20 P. Def & +50 Max HP'
  },
  novice_light: {
    name:  '🥋 Caçadores da Floresta',
    desc:  'Trajes leves e machados rústicos dos caçadores novatos.',
    items: ['leather_vest_light', 'tomahawk_axe'],
    bonus: { def: 15, eva: 6 },
    label: '+15 P. Def & +6 Evasion'
  },
  novice_robe: {
    name:  '🔮 Discípulos de Einhovant',
    desc:  'Túnicas e maças sagradas dos noviços dos templos.',
    items: ['devotion_armor_robe', 'crucifix_of_blessing_magicblunt'],
    bonus: { mdef: 25, mp: 60 },
    label: '+25 M. Def & +60 Max MP'
  },
  novice_jewels: {
    name:  '📿 Joias Elegantes de Aden',
    desc:  'Registre joias de treino com propriedades místicas.',
    items: ['blue_coral_ring', 'magic_ring'],
    bonus: { hp: 100, mp: 50 },
    label: '+100 Max HP & +50 Max MP'
  },

  // ─── COLEÇÕES D-GRADE (Season 1 Core) ───
  d_grade_infantry: {
    name:  '🛡️ Legião de Ferro Brigandine',
    desc:  'O conjunto pesado completo dos defensores de Dion.',
    items: ['brigandine_armor_heavy', 'brigandine_pants_heavy', 'brigandine_helmet_heavy'],
    bonus: { def: 45, hp: 120 },
    label: '+45 P. Def & +120 Max HP'
  },
  d_grade_scouts: {
    name:  '🏹 Patrulheiros Manticore',
    desc:  'Armaduras de couro reforçado para batedores rápidos.',
    items: ['manticore_armor_light', 'manticore_pants_light'],
    bonus: { def: 30, eva: 10, crit: 4 },
    label: '+30 P. Def, +10 Eva & +4% Crit'
  },
  d_grade_scholars: {
    name:  '✨ Círculo Arcano de Mithril',
    desc:  'Vestes mágicas tecidas com fios de mithril e prata.',
    items: ['mithril_tunic_robe', 'mithril_pants_robe'],
    bonus: { mdef: 40, matk: 25, mp: 100 },
    label: '+40 M. Def, +25 M. Atk & +100 Max MP'
  },
  d_grade_swords: {
    name:  '⚔️ Mestres da Espada D-Grade',
    desc:  'Lâminas consagradas dos cavaleiros de Gludio.',
    items: ['crimson_sword', 'saber_sword', 'dual_bastard_sword'],
    bonus: { atk: 50, crit: 6 },
    label: '+50 P. Atk & +6% Crit Rate'
  },
  d_grade_archery: {
    name:  '🎯 Arquearia Élfica dos Ermos',
    desc:  'Arcos nobres empregados nas patrulhas de Talking Island.',
    items: ['elven_bow', 'bow_of_silence'],
    bonus: { atk: 45, crit: 8 },
    label: '+45 P. Atk & +8% Ranged Crit'
  },
  d_grade_mystic: {
    name:  '🔮 Bastões de Poder Elemental',
    desc:  'Armamentos dos feiticeiros e sacerdotes de Dion.',
    items: ['mystic_staff', 'staff_of_magic', 'bronze_mace'],
    bonus: { matk: 55, mp: 80 },
    label: '+55 M. Atk & +80 Max MP'
  },
  d_grade_blunt: {
    name:  '🔨 Martelos de Guerra Anões',
    desc:  'Pesadas armas de impacto forjadas nas cavernas de Mithril.',
    items: ['warhammer', 'titan_hammer', 'wepoan_war_mace'],
    bonus: { atk: 45, hp: 140 },
    label: '+45 P. Atk & +140 Max HP'
  },
  d_grade_jewelry: {
    name:  '💎 Conjunto de Joias Élficas',
    desc:  'Amuletos ornamentados que amplificam a resistência mágica.',
    items: ['jewel_elven_ring', 'jewel_elven_earring', 'jewel_elven_necklace'],
    bonus: { mdef: 50, hp: 100, mp: 60 },
    label: '+50 M. Def, +100 Max HP & +60 Max MP'
  },
  d_grade_champions: {
    name:  '🗡️ Campeões Comprovados D-Grade',
    desc:  'Registre lâminas e vestes de guerreiros comprovados.',
    items: ['crimson_sword', 'elven_bow', 'brigandine_armor_heavy'],
    bonus: { atk: 50, crit: 5 },
    label: '+50 P. Atk & +5% P. Crit Rate'
  },

  // ─── COLEÇÕES C-GRADE (Season 1 Pinnacle) ───
  c_grade_guardians: {
    name:  '🛡️ Guardiões da Placa Completa',
    desc:  'Armadura pesada suprema de Grau C e joia abençoada.',
    items: ['full_plate_heavy_armor', 'jewel_blessed_ring'],
    bonus: { def: 60, hp: 200 },
    label: '+60 P. Def & +200 Max HP'
  },
  c_grade_assassins: {
    name:  '🩸 Lâminas das Sombras de Theca',
    desc:  'Equipamentos de alta mobilidade e corte fatal.',
    items: ['theca_light_armor', 'darkelven_dagger'],
    bonus: { def: 40, crit: 8, eva: 12 },
    label: '+40 P. Def, +8% Crit & +12 Eva'
  },
  c_grade_magisters: {
    name:  '🌟 Magistério Carmesim de Dion',
    desc:  'O manto arcano Karmian empunhando o gládio de Homúnculo.',
    items: ['karmian_robe_armor', 'homunkuluss_magic_sword'],
    bonus: { matk: 70, mdef: 45, mp: 150 },
    label: '+70 M. Atk, +45 M. Def & +150 Max MP'
  },
  c_grade_arsenal: {
    name:  '⚡ Arsenal Veterano de Cruma',
    desc:  'Espadas nobres e arcos de longo alcance de veteranos.',
    items: ['samurai_longsword', 'katana', 'eminence_bow'],
    bonus: { atk: 75, crit: 10 },
    label: '+75 P. Atk & +10% Crit Rate'
  },
  c_grade_legion: {
    name:  '🛡️ Legião de Ferro C-Grade',
    desc:  'Registre armas e armaduras dos veteranos de Gludio.',
    items: ['battle_axe', 'full_plate_heavy_armor', 'eminence_bow'],
    bonus: { atk: 75, def: 50, hp: 200 },
    label: '+75 P. Atk, +50 Def, +200 HP'
  },

  // ─── COLEÇÕES ESPECIAIS & META ───
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
