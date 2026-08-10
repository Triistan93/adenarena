/**
 * codex.js ÔÇö Defini├º├Áes do Codex de Cole├º├Áes e Boss Dolls do Lineage Idle.
 * Extra├¡do de lineage-idle/main.js (linhas 4748-4791, 4894-4935)
 */

/**
 * Sets do Codex de Cole├º├Áes.
 * Cada set exige que o jogador registre todos os `items` para ganhar o `bonus`.
 */
export const CODEX_SETS = {
  novice_weapons: {
    name:  'ÔÜö´©Å Armamento de Recruta',
    desc:  'Registre as armas iniciais de ca├ºa dos novatos.',
    items: ['wooden_sword', 'apprentice_staff', 'short_bow'],
    bonus: { atk: 25, matk: 25 },
    label: '+25 P. Atk & +25 M. Atk'
  },
  novice_armors: {
    name:  '­ƒøí´©Å Vestimentas de Tecido & Couro',
    desc:  'Registre os trajes defensivos b├ísicos de treino.',
    items: ['cloth_shirt', 'leather_armor', 'cloth_pants'],
    bonus: { def: 30, mdef: 30 },
    label: '+30 P. Def & +30 M. Def'
  },
  novice_jewels: {
    name:  '­ƒô┐ Joias de Carvalho de Elmore',
    desc:  'Registre joias ancestrais de madeira m├¡stica.',
    items: ['oak_necklace', 'oak_earring'],
    bonus: { hp: 100, mp: 50 },
    label: '+100 Max HP & +50 Max MP'
  },
  d_grade_champions: {
    name:  '­ƒùí´©Å Equipamentos de Ordem D-Grade',
    desc:  'Registre l├óminas e vestes de guerreiros comprovados.',
    items: ['bastard_sword', 'elven_bow', 'mithril_gaiters'],
    bonus: { atk: 50, crit: 5 },
    label: '+50 P. Atk & +5% P. Crit Rate'
  },
  crystal_masters: {
    name:  '­ƒÆÄ Cristais das Cavernas de Aden',
    desc:  'Registre cristais extra├¡dos do desmanche nobre.',
    items: ['crystal_d', 'crystal_c', 'crystal_b'],
    bonus: { atk: 60, matk: 60, hp: 150 },
    label: '+60 P. Atk, +60 M. Atk, +150 HP'
  },
  spellbook_codex: {
    name:  '­ƒôû Livros Sagrados dos Astros',
    desc:  'Registre os grim├│rios das estrelas de Aden.',
    items: ['spellbook_1star', 'spellbook_2star', 'spellbook_3star', 'spellbook_4star'],
    bonus: { atk: 100, matk: 100, hp: 300, def: 50 },
    label: '+100 P. Atk, +100 M. Atk, +300 HP, +50 Def'
  }
};

/**
 * Boss Dolls ÔÇö Bonifica├º├Áes por n├¡vel das Dolls de Raid Boss.
 * O jogador obt├®m dolls ao derrotar raids e pode sintetiz├í-las para subir de n├¡vel.
 */
export const BOSS_DOLLS = {
  doll_queen_ant: {
    name: '­ƒÉ£ Queen Ant Doll', icon: '­ƒÉ£',
    statsByLvl: {
      1: { atk: 15,  crit: 3,  label: '+15 P. Atk, +3% Crit'   },
      2: { atk: 35,  crit: 6,  label: '+35 P. Atk, +6% Crit'   },
      3: { atk: 60,  crit: 10, label: '+60 P. Atk, +10% Crit'  },
      4: { atk: 100, crit: 15, label: '+100 P. Atk, +15% Crit' },
      5: { atk: 160, crit: 25, label: '+160 P. Atk, +25% Crit' }
    }
  },
  doll_baium: {
    name: 'ÔÜí Baium Doll', icon: 'ÔÜí',
    statsByLvl: {
      1: { speed: 5,  label: '+5% Speed'  },
      2: { speed: 10, label: '+10% Speed' },
      3: { speed: 15, label: '+15% Speed' },
      4: { speed: 22, label: '+22% Speed' },
      5: { speed: 30, label: '+30% Speed' }
    }
  },
  doll_orfen: {
    name: '­ƒªï Orfen Doll', icon: '­ƒªï',
    statsByLvl: {
      1: { matk: 20,  crit: 3,  label: '+20 M. Atk, +3% M. Crit'   },
      2: { matk: 45,  crit: 6,  label: '+45 M. Atk, +6% M. Crit'   },
      3: { matk: 80,  crit: 10, label: '+80 M. Atk, +10% M. Crit'  },
      4: { matk: 120, crit: 15, label: '+120 M. Atk, +15% M. Crit' },
      5: { matk: 180, crit: 25, label: '+180 M. Atk, +25% M. Crit' }
    }
  },
  doll_zaken: {
    name: '­ƒÅ┤ÔÇìÔÿá´©Å Zaken Doll', icon: '­ƒÅ┤ÔÇìÔÿá´©Å',
    statsByLvl: {
      1: { def: 25,  lifesteal: 3,  label: '+25 Def, +3% Lifesteal'   },
      2: { def: 50,  lifesteal: 5,  label: '+50 Def, +5% Lifesteal'   },
      3: { def: 85,  lifesteal: 8,  label: '+85 Def, +8% Lifesteal'   },
      4: { def: 130, lifesteal: 12, label: '+130 Def, +12% Lifesteal' },
      5: { def: 200, lifesteal: 18, label: '+200 Def, +18% Lifesteal' }
    }
  }
};