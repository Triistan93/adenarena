/**
 * heirloom_items.js — Catálogo de Equipamentos de Herança (Heirloom Scaling Gear).
 * 
 * Itens que escalam dinamicamente com o nível do jogador (Lv. 1 ao 40):
 * - Lv. 1 ao 19 (Fase 1): +50% de poder relativo ao No-Grade Verde de topo.
 * - Lv. 20 ao 39 (Fase 2): +50% de poder relativo ao D-Grade Verde de topo.
 * - Lv. 40+ (Fase 3): 100% dos atributos de um C-Grade Azul (+4/+6 com Glow).
 */

export const HEIRLOOM_ITEMS = {
  // ─── ARMAS DE HERANÇA (HEIRLOOM WEAPONS) ───────────────────────────────────
  weapon_heirloom_sword: {
    id: 'weapon_heirloom_sword',
    name: 'Espada de Herança do Lorde',
    slot: 'weapon',
    weaponType: 'sword',
    rarity: 'heirloom',
    tier: 3, // Grade C na maturidade plena
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Espada ancestral que evolui em poder com o crescimento do seu portador do Nível 1 ao 40.',
    icon: 'gradec/weapons/weapon_samurai_longsword.png',
    base: { atk: 138, crit: 8, hit: 12 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 38, crit: 5, hit: 5 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 85, crit: 7, hit: 8 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 138, crit: 8, hit: 12, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_spear: {
    id: 'weapon_heirloom_spear',
    name: 'Lança de Herança do Vanguarda',
    slot: 'weapon',
    weaponType: 'spear',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Lança lendária de montaria que se fortalece conforme o herói avança de nível (Lv. 1 ao 40).',
    icon: 'gradec/weapons/weapon_spiked_spear.png',
    base: { atk: 138, crit: 6, hit: 10, aoeTargets: 4 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 38, crit: 4, hit: 4, aoeTargets: 2 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 85, crit: 5, hit: 7, aoeTargets: 3 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 138, crit: 6, hit: 10, aoeTargets: 4, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_dagger: {
    id: 'weapon_heirloom_dagger',
    name: 'Adaga de Herança das Sombras',
    slot: 'weapon',
    weaponType: 'dagger',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Lâmina precisa forjada em aço estelar que amplia a letalidade do portador (Lv. 1 ao 40).',
    icon: 'gradec/weapons/weapon_darkelven_dagger.png',
    base: { atk: 118, crit: 18, hit: 15, eva: 8 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 32, crit: 10, hit: 6, eva: 3 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 72, crit: 14, hit: 10, eva: 5 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 118, crit: 18, hit: 15, eva: 8, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_bow: {
    id: 'weapon_heirloom_bow',
    name: 'Arco de Herança da Floresta',
    slot: 'weapon',
    weaponType: 'bow',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Arco flexível entalhado em madeira élfica sagrada que dispara flechas com força crescente.',
    icon: 'gradec/weapons/weapon_eminence_bow.png',
    base: { atk: 168, crit: 15, hit: 14 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 45, crit: 8, hit: 5 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 105, crit: 12, hit: 9 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 168, crit: 15, hit: 14, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_staff: {
    id: 'weapon_heirloom_staff',
    name: 'Cajado de Herança do Arcano',
    slot: 'weapon',
    weaponType: 'staff',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Cajado ornado com cristal arcano que amplifica a potência dos feitiços mágicos.',
    icon: 'gradec/weapons/weapon_crystal_staff.png',
    base: { atk: 68, matk: 165, mdef: 18, mp: 80 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 18, matk: 45, mdef: 6, mp: 20 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 42, matk: 102, mdef: 12, mp: 45 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 68, matk: 165, mdef: 18, mp: 80, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_duals: {
    id: 'weapon_heirloom_duals',
    name: 'Espadas Duplas de Herança do Gladiador',
    slot: 'weapon',
    weaponType: 'dual_sword',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Par de lâminas forjadas para guerreiros velozes que desferem golpes duplos mortais.',
    icon: 'gradec/weapons/weapon_dual_revolution_sword.png',
    base: { atk: 148, crit: 10, hit: 12 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 40, crit: 6, hit: 5 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 92, crit: 8, hit: 8 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 148, crit: 10, hit: 12, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },
  weapon_heirloom_blunt: {
    id: 'weapon_heirloom_blunt',
    name: 'Martelo de Herança do Artífice',
    slot: 'weapon',
    weaponType: 'blunt',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Martelo pesado de forja que esmaga armaduras inimigas com grande impacto.',
    icon: 'gradec/weapons/weapon_big_hammer.png',
    base: { atk: 142, crit: 6, hit: 10, stunChance: 0.15 },
    heirloomScaling: {
      phase1: { maxLvl: 19, baseMult: 1.5, stats: { atk: 39, crit: 4, hit: 4, stunChance: 0.05 }, label: 'No-Grade Superior (+50%)' },
      phase2: { maxLvl: 39, baseMult: 1.5, stats: { atk: 88, crit: 5, hit: 7, stunChance: 0.10 }, label: 'D-Grade Superior (+50%)' },
      phase3: { maxLvl: 40, baseMult: 1.0, stats: { atk: 142, crit: 6, hit: 10, stunChance: 0.15, enchantGlow: true }, label: 'C-Grade Pleno (+4 Glow)' }
    }
  },

  // ─── ARMADURAS DE HERANÇA POR ARQUÉTIPO (HEAVY, LIGHT, ROBE) ─────────────
  
  // 1. CONJUNTO PESADO (HEAVY - GUERREIROS, TANKS, VANGUARD)
  armor_heirloom_chest_heavy: {
    id: 'armor_heirloom_chest_heavy',
    name: 'Armadura de Placas de Herança',
    slot: 'armor',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Peitoral de placas forjado para suportar o impacto de investidas e monstros colossais.',
    icon: 'gradec/armors/armor_full_plate_heavy_armor.png',
    base: { def: 98, hp: 280, mdef: 36, weightBonus: 2000 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 28, hp: 70, mdef: 10, weightBonus: 500 } },
      phase2: { maxLvl: 39, stats: { def: 60, hp: 160, mdef: 22, weightBonus: 1200 } },
      phase3: { maxLvl: 40, stats: { def: 98, hp: 280, mdef: 36, weightBonus: 2000 } }
    }
  },
  armor_heirloom_legs_heavy: {
    id: 'armor_heirloom_legs_heavy',
    name: 'Grevas de Placas de Herança',
    slot: 'legs',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Proteção articulada para as pernas de guerreiros de linha de frente.',
    icon: 'gradec/armors/armor_plated_leather_light_pants.png',
    base: { def: 62, hp: 180, mdef: 24 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 18, hp: 45, mdef: 7 } },
      phase2: { maxLvl: 39, stats: { def: 38, hp: 100, mdef: 15 } },
      phase3: { maxLvl: 40, stats: { def: 62, hp: 180, mdef: 24 } }
    }
  },
  armor_heirloom_helmet_heavy: {
    id: 'armor_heirloom_helmet_heavy',
    name: 'Elmo de Placas de Herança',
    slot: 'helmet',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Elmo de ferro polido com viseira protetora.',
    icon: 'gradec/armors/armor_full_plate_heavy_helmet.png',
    base: { def: 42, hp: 120, mdef: 18 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 12, hp: 30, mdef: 5 } },
      phase2: { maxLvl: 39, stats: { def: 26, hp: 70, mdef: 11 } },
      phase3: { maxLvl: 40, stats: { def: 42, hp: 120, mdef: 18 } }
    }
  },
  armor_heirloom_gloves_heavy: {
    id: 'armor_heirloom_gloves_heavy',
    name: 'Manoplas de Ferro de Herança',
    slot: 'gloves',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Manoplas sólidas para empunhar armas pesadas com firmeza.',
    icon: 'gradec/armors/armor_full_plate_heavy_gloves.png',
    base: { def: 32, atkSpeed: 5, hit: 6, mdef: 14 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 9, atkSpeed: 2, hit: 2, mdef: 4 } },
      phase2: { maxLvl: 39, stats: { def: 20, atkSpeed: 3, hit: 4, mdef: 8 } },
      phase3: { maxLvl: 40, stats: { def: 32, atkSpeed: 5, hit: 6, mdef: 14 } }
    }
  },
  armor_heirloom_boots_heavy: {
    id: 'armor_heirloom_boots_heavy',
    name: 'Botas de Ferro de Herança',
    slot: 'boots',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Botas reforçadas para máxima estabilidade em combate corpo-a-corpo.',
    icon: 'gradec/armors/armor_full_plate_heavy_boots.png',
    base: { def: 32, speed: 6, mdef: 14 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 9, speed: 2, mdef: 4 } },
      phase2: { maxLvl: 39, stats: { def: 20, speed: 4, mdef: 8 } },
      phase3: { maxLvl: 40, stats: { def: 32, speed: 6, mdef: 14 } }
    }
  },

  // 2. CONJUNTO LEVE (LIGHT - ARQUEIROS, ASSASSINOS, KAMAEL)
  armor_heirloom_chest_light: {
    id: 'armor_heirloom_chest_light',
    name: 'Colete de Couro de Herança',
    slot: 'armor',
    armorType: 'light',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Colete de couro flexível reforçado que permite movimentação ágil e esquiva refinada.',
    icon: 'gradec/armors/armor_theca_light_armor.png',
    base: { def: 78, eva: 8, crit: 6, mdef: 32 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 22, eva: 3, crit: 2, mdef: 8 } },
      phase2: { maxLvl: 39, stats: { def: 48, eva: 5, crit: 4, mdef: 18 } },
      phase3: { maxLvl: 40, stats: { def: 78, eva: 8, crit: 6, mdef: 32 } }
    }
  },
  armor_heirloom_legs_light: {
    id: 'armor_heirloom_legs_light',
    name: 'Calças de Couro de Herança',
    slot: 'legs',
    armorType: 'light',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Calças leves de caçador que não restringem passos furtivos.',
    icon: 'gradec/armors/armor_theca_light_pants.png',
    base: { def: 50, eva: 6, speed: 4, mdef: 20 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 14, eva: 2, speed: 1, mdef: 6 } },
      phase2: { maxLvl: 39, stats: { def: 30, eva: 4, speed: 2, mdef: 12 } },
      phase3: { maxLvl: 40, stats: { def: 50, eva: 6, speed: 4, mdef: 20 } }
    }
  },
  armor_heirloom_helmet_light: {
    id: 'armor_heirloom_helmet_light',
    name: 'Boina de Couro de Herança',
    slot: 'helmet',
    armorType: 'light',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Proteção de cabeça leve com visor aberto para máxima precisão de mira.',
    icon: 'gradec/armors/armor_theca_light_helmet.png',
    base: { def: 34, hit: 6, mdef: 16 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 10, hit: 2, mdef: 4 } },
      phase2: { maxLvl: 39, stats: { def: 20, hit: 4, mdef: 10 } },
      phase3: { maxLvl: 40, stats: { def: 34, hit: 6, mdef: 16 } }
    }
  },
  armor_heirloom_gloves_light: {
    id: 'armor_heirloom_gloves_light',
    name: 'Luvas de Couro de Herança',
    slot: 'gloves',
    armorType: 'light',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Luvas de couro de dragão que aumentam a velocidade de ataque e disparo de flechas.',
    icon: 'gradec/armors/armor_theca_light_gloves.png',
    base: { def: 26, atkSpeed: 8, crit: 4, mdef: 12 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 8, atkSpeed: 3, crit: 1, mdef: 3 } },
      phase2: { maxLvl: 39, stats: { def: 16, atkSpeed: 5, crit: 2, mdef: 7 } },
      phase3: { maxLvl: 40, stats: { def: 26, atkSpeed: 8, crit: 4, mdef: 12 } }
    }
  },
  armor_heirloom_boots_light: {
    id: 'armor_heirloom_boots_light',
    name: 'Botas de Couro de Herança',
    slot: 'boots',
    armorType: 'light',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Botas macias que silenciam passos e conferem velocidade de corrida.',
    icon: 'gradec/armors/armor_theca_light_boots.png',
    base: { def: 26, speed: 10, eva: 6, mdef: 12 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 8, speed: 4, eva: 2, mdef: 3 } },
      phase2: { maxLvl: 39, stats: { def: 16, speed: 7, eva: 4, mdef: 7 } },
      phase3: { maxLvl: 40, stats: { def: 26, speed: 10, eva: 6, mdef: 12 } }
    }
  },

  // 3. CONJUNTO MÁGICO (ROBE - MAGOS, FEITICEIROS, HEALERS)
  armor_heirloom_chest_robe: {
    id: 'armor_heirloom_chest_robe',
    name: 'Túnica Arcana de Herança',
    slot: 'armor',
    armorType: 'robe',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Manto tecido com fios etéreos que potencializa o poder mágico e regeneração de mana.',
    icon: 'gradec/armors/armor_karmian_robe_armor.png',
    base: { def: 56, matk: 35, mp: 250, mdef: 58, mpRegen: 8 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 16, matk: 10, mp: 60, mdef: 16, mpRegen: 2 } },
      phase2: { maxLvl: 39, stats: { def: 34, matk: 22, mp: 140, mdef: 35, mpRegen: 5 } },
      phase3: { maxLvl: 40, stats: { def: 56, matk: 35, mp: 250, mdef: 58, mpRegen: 8 } }
    }
  },
  armor_heirloom_legs_robe: {
    id: 'armor_heirloom_legs_robe',
    name: 'Calças Arcanas de Herança',
    slot: 'legs',
    armorType: 'robe',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Vestimenta inferior mágica que estabiliza o fluxo de mana.',
    icon: 'gradec/armors/armor_karmian_robe_pants.png',
    base: { def: 38, mp: 160, mdef: 40 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 10, mp: 40, mdef: 12 } },
      phase2: { maxLvl: 39, stats: { def: 24, mp: 90, mdef: 24 } },
      phase3: { maxLvl: 40, stats: { def: 38, mp: 160, mdef: 40 } }
    }
  },
  armor_heirloom_helmet_robe: {
    id: 'armor_heirloom_helmet_robe',
    name: 'Tiara Arcana de Herança',
    slot: 'helmet',
    armorType: 'robe',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Diadema de prata com safira que clareia a mente durante a conjuração de magias.',
    icon: 'gradec/armors/armor_karmian_helmet.png',
    base: { def: 26, matk: 15, mdef: 32 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 8, matk: 4, mdef: 10 } },
      phase2: { maxLvl: 39, stats: { def: 16, matk: 9, mdef: 20 } },
      phase3: { maxLvl: 40, stats: { def: 26, matk: 15, mdef: 32 } }
    }
  },
  armor_heirloom_gloves_robe: {
    id: 'armor_heirloom_gloves_robe',
    name: 'Luvas de Seda de Herança',
    slot: 'gloves',
    armorType: 'robe',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Luvas de seda pura encantada que aceleram a velocidade de conjuração mágica (Cast Speed).',
    icon: 'gradec/armors/armor_karmian_robe_gloves.png',
    base: { def: 20, castSpeed: 15, mdef: 24 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 6, castSpeed: 5, mdef: 8 } },
      phase2: { maxLvl: 39, stats: { def: 12, castSpeed: 10, mdef: 15 } },
      phase3: { maxLvl: 40, stats: { def: 20, castSpeed: 15, mdef: 24 } }
    }
  },
  armor_heirloom_boots_robe: {
    id: 'armor_heirloom_boots_robe',
    name: 'Sandálias Arcanas de Herança',
    slot: 'boots',
    armorType: 'robe',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Sandálias leves que canalizam mana da terra para o conjurador.',
    icon: 'gradec/armors/armor_karmian_robe_boots.png',
    base: { def: 20, speed: 7, mpRegen: 4, mdef: 24 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 6, speed: 3, mpRegen: 1, mdef: 8 } },
      phase2: { maxLvl: 39, stats: { def: 12, speed: 5, mpRegen: 2, mdef: 15 } },
      phase3: { maxLvl: 40, stats: { def: 20, speed: 7, mpRegen: 4, mdef: 24 } }
    }
  },

  // Aliases de compatibilidade
  armor_heirloom_chest: {
    id: 'armor_heirloom_chest_heavy',
    name: 'Armadura de Placas de Herança',
    slot: 'armor',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Peitoral de placas forjado para suportar o impacto de investidas e monstros colossais.',
    icon: 'gradec/armors/armor_full_plate_heavy_armor.png',
    base: { def: 98, hp: 280, mdef: 36, weightBonus: 2000 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 28, hp: 70, mdef: 10, weightBonus: 500 } },
      phase2: { maxLvl: 39, stats: { def: 60, hp: 160, mdef: 22, weightBonus: 1200 } },
      phase3: { maxLvl: 40, stats: { def: 98, hp: 280, mdef: 36, weightBonus: 2000 } }
    }
  },
  armor_heirloom_legs: {
    id: 'armor_heirloom_legs_heavy',
    name: 'Grevas de Placas de Herança',
    slot: 'legs',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Proteção articulada para as pernas de guerreiros de linha de frente.',
    icon: 'gradec/armors/armor_plated_leather_light_pants.png',
    base: { def: 62, hp: 180, mdef: 24 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 18, hp: 45, mdef: 7 } },
      phase2: { maxLvl: 39, stats: { def: 38, hp: 100, mdef: 15 } },
      phase3: { maxLvl: 40, stats: { def: 62, hp: 180, mdef: 24 } }
    }
  },
  armor_heirloom_helmet: {
    id: 'armor_heirloom_helmet_heavy',
    name: 'Elmo de Placas de Herança',
    slot: 'helmet',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Elmo de ferro polido com viseira protetora.',
    icon: 'gradec/armors/armor_full_plate_heavy_helmet.png',
    base: { def: 42, hp: 120, mdef: 18 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 12, hp: 30, mdef: 5 } },
      phase2: { maxLvl: 39, stats: { def: 26, hp: 70, mdef: 11 } },
      phase3: { maxLvl: 40, stats: { def: 42, hp: 120, mdef: 18 } }
    }
  },
  armor_heirloom_gloves: {
    id: 'armor_heirloom_gloves_heavy',
    name: 'Manoplas de Ferro de Herança',
    slot: 'gloves',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Manoplas sólidas para empunhar armas pesadas com firmeza.',
    icon: 'gradec/armors/armor_full_plate_heavy_gloves.png',
    base: { def: 32, atkSpeed: 5, hit: 6, mdef: 14 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 9, atkSpeed: 2, hit: 2, mdef: 4 } },
      phase2: { maxLvl: 39, stats: { def: 20, atkSpeed: 3, hit: 4, mdef: 8 } },
      phase3: { maxLvl: 40, stats: { def: 32, atkSpeed: 5, hit: 6, mdef: 14 } }
    }
  },
  armor_heirloom_boots: {
    id: 'armor_heirloom_boots_heavy',
    name: 'Botas de Ferro de Herança',
    slot: 'boots',
    armorType: 'heavy',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Botas reforçadas para máxima estabilidade em combate corpo-a-corpo.',
    icon: 'gradec/armors/armor_full_plate_heavy_boots.png',
    base: { def: 32, speed: 6, mdef: 14 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 9, speed: 2, mdef: 4 } },
      phase2: { maxLvl: 39, stats: { def: 20, speed: 4, mdef: 8 } },
      phase3: { maxLvl: 40, stats: { def: 32, speed: 6, mdef: 14 } }
    }
  },
  shield_heirloom_aegis: {
    id: 'shield_heirloom_aegis',
    name: 'Escudo de Herança da Égide',
    slot: 'shield',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Escudo guardião que bloqueia projéteis e ataques contundentes.',
    icon: 'gradec/armors/armor_full_plate_shield.png',
    base: { def: 74, blockRate: 25, hp: 150 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 22, blockRate: 15, hp: 40 } },
      phase2: { maxLvl: 39, stats: { def: 46, blockRate: 20, hp: 90 } },
      phase3: { maxLvl: 40, stats: { def: 74, blockRate: 25, hp: 150 } }
    }
  },

  // ─── JOIAS DE HERANÇA (HEIRLOOM JEWELRY) ───────────────────────────────────
  jewelry_heirloom_necklace: {
    id: 'jewelry_heirloom_necklace',
    name: 'Colar de Herança de Aden',
    slot: 'necklace',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Amuleto real que concede proteção mágica superior e vitalidade.',
    icon: 'gradec/jewels/jewel_blessed_necklace.png',
    base: { mdef: 48, hp: 160, mp: 80 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { mdef: 14, hp: 40, mp: 20 } },
      phase2: { maxLvl: 39, stats: { mdef: 29, hp: 90, mp: 45 } },
      phase3: { maxLvl: 40, stats: { mdef: 48, hp: 160, mp: 80 } }
    }
  },
  jewelry_heirloom_earring_1: {
    id: 'jewelry_heirloom_earring_1',
    name: 'Brinco de Herança da Lua',
    slot: 'earring1',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Brinco místico banhado pela luz da lua conferindo defesa e resistência.',
    icon: 'gradec/jewels/jewel_blessed_earing.png',
    base: { mdef: 36, hp: 90, stunResist: 0.10 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { mdef: 10, hp: 25, stunResist: 0.03 } },
      phase2: { maxLvl: 39, stats: { mdef: 22, hp: 50, stunResist: 0.06 } },
      phase3: { maxLvl: 40, stats: { mdef: 36, hp: 90, stunResist: 0.10 } }
    }
  },
  jewelry_heirloom_earring_2: {
    id: 'jewelry_heirloom_earring_2',
    name: 'Brinco de Herança do Sol',
    slot: 'earring2',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Brinco brilhante banhado pela energia solar conferindo regeneração.',
    icon: 'gradec/jewels/jewel_blessed_earing.png',
    base: { mdef: 36, hp: 90, hpRegen: 5 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { mdef: 10, hp: 25, hpRegen: 1 } },
      phase2: { maxLvl: 39, stats: { mdef: 22, hp: 50, hpRegen: 3 } },
      phase3: { maxLvl: 40, stats: { mdef: 36, hp: 90, hpRegen: 5 } }
    }
  },
  jewelry_heirloom_ring_1: {
    id: 'jewelry_heirloom_ring_1',
    name: 'Anel de Herança do Destino',
    slot: 'ring1',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Anel cravado com safira ancestral que aumenta o poder de ataque.',
    icon: 'gradec/jewels/jewel_blessed_ring.png',
    base: { mdef: 24, atk: 12, critDmg: 0.05 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { mdef: 7, atk: 3, critDmg: 0.01 } },
      phase2: { maxLvl: 39, stats: { mdef: 15, atk: 7, critDmg: 0.03 } },
      phase3: { maxLvl: 40, stats: { mdef: 24, atk: 12, critDmg: 0.05 } }
    }
  },
  jewelry_heirloom_ring_2: {
    id: 'jewelry_heirloom_ring_2',
    name: 'Anel de Herança da Glória',
    slot: 'ring2',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Anel cravado com rubi ancestral que eleva a taxa de acerto crítico.',
    icon: 'gradec/jewels/jewel_blessed_ring.png',
    base: { mdef: 24, crit: 5, matk: 15 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { mdef: 7, crit: 1, matk: 4 } },
      phase2: { maxLvl: 39, stats: { mdef: 15, crit: 3, matk: 9 } },
      phase3: { maxLvl: 40, stats: { mdef: 24, crit: 5, matk: 15 } }
    }
  },

  // ─── ACESSÓRIOS ESPECIAIS DE HERANÇA (CLOAK, BELT, CROWN) ─────────────────
  cloak_heirloom_royal: {
    id: 'cloak_heirloom_royal',
    name: 'Capa Real de Herança',
    slot: 'cloak',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Capa de veludo bordada com fios de ouro que protege contra todos os elementos.',
    icon: 'gradec/armors/armor_full_plate_cloack.png',
    base: { def: 18, mdef: 22, hp: 100 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 5, mdef: 6, hp: 30 } },
      phase2: { maxLvl: 39, stats: { def: 11, mdef: 14, hp: 60 } },
      phase3: { maxLvl: 40, stats: { def: 18, mdef: 22, hp: 100 } }
    }
  },
  belt_heirloom_champion: {
    id: 'belt_heirloom_champion',
    name: 'Cinto de Herança do Campeão',
    slot: 'belt',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Cinto de couro de dragão que expande a capacidade de carga e inventário.',
    icon: 'gradec/armors/armor_full_plate_belt.png',
    base: { def: 14, hp: 80, weightBonus: 3000, invSlots: 20 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 4, hp: 20, weightBonus: 1000, invSlots: 10 } },
      phase2: { maxLvl: 39, stats: { def: 8, hp: 50, weightBonus: 2000, invSlots: 15 } },
      phase3: { maxLvl: 40, stats: { def: 14, hp: 80, weightBonus: 3000, invSlots: 20 } }
    }
  },
  hair_heirloom_crown: {
    id: 'hair_heirloom_crown',
    name: 'Coroa Alada do Lorde Soberano',
    slot: 'hair1',
    rarity: 'heirloom',
    tier: 3,
    isHeirloom: true,
    maxHeirloomLevel: 40,
    desc: 'Diadema dourado brilhante com asas laterais que irradia majestade e autoridade.',
    icon: 'acessories/noble_gold_crown.png',
    base: { def: 10, mdef: 15, hp: 100, xpBoost: 0.10 },
    heirloomScaling: {
      phase1: { maxLvl: 19, stats: { def: 3, mdef: 5, hp: 30, xpBoost: 0.05 } },
      phase2: { maxLvl: 39, stats: { def: 6, mdef: 10, hp: 60, xpBoost: 0.08 } },
      phase3: { maxLvl: 40, stats: { def: 10, mdef: 15, hp: 100, xpBoost: 0.10 } }
    }
  }
};
