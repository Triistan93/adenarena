// ========================================
// Items Database - Lineage Idle
// ---- REVISADO ----
// 13 correcoes aplicadas (procure por [FIX n])
// API publica preservada: nenhuma chave foi renomeada
// ========================================

const RARITY = {
  common: { name: 'Common', color: '#b0b0b0', mult: 1.0 },
  uncommon: { name: 'Uncommon', color: '#48bb78', mult: 1.4 },
  rare: { name: 'Rare', color: '#539bf5', mult: 1.8 },
  epic: { name: 'Epic', color: '#b180f8', mult: 2.4 },
  legendary: { name: 'Legendary', color: '#f0883e', mult: 3.2 }
};

// [FIX 5] SLOT nao cobria 11 slots usados pelos dados
// (legs, shield, necklace, earring, belt, cloak, talisman,
//  hair, hair2, agathion, powerup) -> UI/validacao recebia undefined
const SLOT = {
  weapon: 'Weapon', armor: 'Armor', helmet: 'Helmet', boots: 'Boots',
  gloves: 'Gloves', ring: 'Ring', consumable: 'Consumable', material: 'Material',
  scroll: 'Scroll', legs: 'Legs', shield: 'Shield', necklace: 'Necklace',
  earring: 'Earring', belt: 'Belt', cloak: 'Cloak', talisman: 'Talisman',
  hair: 'Hair Accessory', hair2: 'Face Accessory', agathion: 'Agathion',
  powerup: 'Power-Up'
};

const WEAPONS = {
  wooden_sword: { name: 'Wooden Sword', slot: 'weapon', tier: 1, atk: 3, matk: 0, req: { level: 1 }, price: 30 },
  training_dagger: { name: 'Training Dagger', slot: 'weapon', tier: 1, atk: 4, matk: 0, speed: 5, req: { level: 1 }, price: 40 },
  oak_staff: { name: 'Oak Staff', slot: 'weapon', tier: 1, atk: 1, matk: 5, req: { level: 1 }, price: 50 },
  short_bow: { name: 'Short Bow', slot: 'weapon', tier: 1, atk: 4, matk: 0, range: 'ranged', req: { level: 1 }, price: 50 },
  bronze_mace: { name: 'Bronze Mace', slot: 'weapon', tier: 1, atk: 5, matk: 0, req: { level: 3 }, price: 80 },
  iron_sword: { name: 'Iron Sword', slot: 'weapon', tier: 2, atk: 8, matk: 0, req: { level: 10 }, price: 150 },
  steel_dagger: { name: 'Steel Dagger', slot: 'weapon', tier: 2, atk: 9, matk: 0, speed: 5, req: { level: 10 }, price: 180 },
  crystal_staff: { name: 'Crystal Staff', slot: 'weapon', tier: 2, atk: 2, matk: 12, req: { level: 12 }, price: 250 },
  composite_bow: { name: 'Composite Bow', slot: 'weapon', tier: 2, atk: 10, matk: 0, range: 'ranged', req: { level: 10 }, price: 200 },
  war_mace: { name: 'War Mace', slot: 'weapon', tier: 2, atk: 11, matk: 0, req: { level: 12 }, price: 280 },
  orcish_axe: { name: 'Orcish Axe', slot: 'weapon', tier: 2, atk: 12, matk: 0, req: { level: 15 }, price: 320 },
  knight_sword: { name: 'Knight Sword', slot: 'weapon', tier: 3, atk: 18, matk: 0, def: 3, req: { level: 20 }, price: 800 },
  assassins_blade: { name: "Assassin's Blade", slot: 'weapon', tier: 3, atk: 16, matk: 0, eva: 5, speed: 5, req: { level: 20 }, price: 900 },
  archmage_staff: { name: 'Archmage Staff', slot: 'weapon', tier: 3, atk: 3, matk: 25, mdef: 5, req: { level: 22 }, price: 1200 },
  elven_bow: { name: 'Elven Bow', slot: 'weapon', tier: 3, atk: 22, matk: 0, eva: 3, range: 'ranged', req: { level: 25 }, price: 1500 },
  warhammer: { name: 'Warhammer', slot: 'weapon', tier: 3, atk: 25, matk: 0, speed: -3, req: { level: 28 }, price: 1800 },
  dark_katana: { name: 'Dark Katana', slot: 'weapon', tier: 3, atk: 24, matk: 5, speed: 5, req: { level: 30 }, price: 2200 },
  blade_of_doom: { name: 'Blade of Doom', slot: 'weapon', tier: 4, atk: 40, matk: 0, crit: 5, req: { level: 40 }, price: 5000 },
  soul_seeker: { name: 'Soul Seeker', slot: 'weapon', tier: 4, atk: 35, matk: 15, lifesteal: 3, req: { level: 42 }, price: 5500 },
  staff_of_magic: { name: 'Staff of Magic', slot: 'weapon', tier: 4, atk: 5, matk: 45, mdef: 10, req: { level: 40 }, price: 6000 },
  dragon_bow: { name: 'Dragon Bow', slot: 'weapon', tier: 4, atk: 45, matk: 0, crit: 5, range: 'ranged', req: { level: 45 }, price: 7000 },
  titan_hammer: { name: 'Titan Hammer', slot: 'weapon', tier: 4, atk: 55, matk: 0, speed: -5, req: { level: 48 }, price: 8000 },
  dual_swords: { name: 'Dual Swords', slot: 'weapon', tier: 4, atk: 38, matk: 0, eva: 8, speed: 8, req: { level: 50 }, price: 8500 },
  divine_sword: { name: 'Divine Sword', slot: 'weapon', tier: 5, atk: 80, matk: 10, crit: 10, lifesteal: 5, req: { level: 76 }, price: 25000 },
  staff_of_eternity: { name: 'Staff of Eternity', slot: 'weapon', tier: 5, atk: 8, matk: 95, mdef: 20, req: { level: 76 }, price: 28000 },
  bow_of_silence: { name: 'Bow of Silence', slot: 'weapon', tier: 5, atk: 85, matk: 0, eva: 10, crit: 15, range: 'ranged', req: { level: 80 }, price: 32000 },
  dragon_slayer: { name: 'Dragon Slayer', slot: 'weapon', tier: 5, atk: 150, matk: 0, crit: 15, speed: -5, req: { level: 76 }, price: 35000, desc: 'Espada lendária de 2 mãos de grau S. (+150 ATK, +15% Crit)' },
  angel_slayer: { name: 'Angel Slayer', slot: 'weapon', tier: 5, atk: 135, eva: 20, speed: 12, crit: 10, req: { level: 76 }, price: 38000, desc: 'Adaga suprema de grau S. (+135 ATK, +20 EVA, +12% Speed, +10% Crit)' },
  arcana_mace: { name: 'Arcana Mace', slot: 'weapon', tier: 5, atk: 15, matk: 160, mdef: 40, mp: 200, req: { level: 76 }, price: 42000, desc: 'Cajado supremo de grau S. (+160 MATK, +40 MDEF, +200 MP)' },
  draconic_bow: { name: 'Draconic Bow', slot: 'weapon', tier: 5, atk: 165, matk: 0, crit: 15, eva: 10, range: 'ranged', req: { level: 76 }, price: 45000, desc: 'Arco supremo de grau S. (+165 ATK, +15% Crit, +10 EVA)' },
  chaos_blade: { name: 'Chaos Blade', slot: 'weapon', tier: 5, atk: 90, matk: 30, crit: 8, lifesteal: 5, req: { level: 80 }, price: 40000 },
  dynasty_blade: { name: 'Dynasty Blade', slot: 'weapon', tier: 6, atk: 140, matk: 0, crit: 15, req: { level: 80 }, price: 60000 },
  dynasty_bow: { name: 'Dynasty Bow', slot: 'weapon', tier: 6, atk: 155, matk: 0, crit: 20, range: 'ranged', req: { level: 80 }, price: 65000 },
  dynasty_phantom: { name: 'Dynasty Phantom Staff', slot: 'weapon', tier: 6, atk: 12, matk: 135, mdef: 25, req: { level: 80 }, price: 70000 },
  vesper_cutter: { name: 'Vesper Cutter', slot: 'weapon', tier: 7, atk: 185, matk: 0, crit: 20, speed: 10, req: { level: 84 }, price: 120000 },
  vesper_thrower: { name: 'Vesper Thrower', slot: 'weapon', tier: 7, atk: 200, matk: 0, crit: 25, range: 'ranged', req: { level: 84 }, price: 130000 },
  vesper_buster: { name: 'Vesper Buster', slot: 'weapon', tier: 7, atk: 15, matk: 165, mdef: 35, req: { level: 84 }, price: 140000 },
  elegia_cutters: { name: 'Elegia Dual Cutters', slot: 'weapon', tier: 8, atk: 240, matk: 0, crit: 30, lifesteal: 8, req: { level: 85 }, price: 250000 },
  elegia_bow: { name: 'Elegia Bow', slot: 'weapon', tier: 8, atk: 260, matk: 0, crit: 35, range: 'ranged', req: { level: 85 }, price: 280000 }
};

const ARMORS = {
  cloth_robe: { name: 'Cloth Robe', slot: 'armor', tier: 1, def: 3, mdef: 3, req: { level: 1 }, price: 50 },
  leather_vest: { name: 'Leather Vest', slot: 'armor', tier: 1, def: 5, mdef: 1, req: { level: 1 }, price: 80 },
  bronze_chest: { name: 'Bronze Chestplate', slot: 'armor', tier: 1, def: 8, mdef: 1, req: { level: 5 }, price: 150 },
  iron_armor: { name: 'Iron Armor', slot: 'armor', tier: 2, def: 15, mdef: 5, req: { level: 10 }, price: 500 },
  mage_robe: { name: 'Mage Robe', slot: 'armor', tier: 2, def: 5, mdef: 18, matk: 5, req: { level: 12 }, price: 600, icon: 'karmian_robe_armor' },
  steel_plate: { name: 'Steel Plate', slot: 'armor', tier: 3, def: 28, mdef: 12, req: { level: 20 }, price: 2000, icon: 'full_plate_heavy_armor' },
  shadow_cloak: { name: 'Shadow Cloak', slot: 'armor', tier: 3, def: 12, mdef: 18, eva: 8, req: { level: 20 }, price: 2200, icon: 'demon_cloack' },
  elven_garb: { name: 'Elven Garb', slot: 'armor', tier: 3, def: 15, mdef: 20, matk: 10, req: { level: 22 }, price: 2500, icon: 'avadon_light_armor' },
  knight_armor: { name: 'Knight Armor', slot: 'armor', tier: 4, def: 50, mdef: 25, hp: 50, req: { level: 40 }, price: 8000, icon: 'doom_light_armor' },
  arcane_robe: { name: 'Arcane Robe', slot: 'armor', tier: 4, def: 20, mdef: 55, matk: 20, req: { level: 40 }, price: 9000, icon: 'devotion_armor_robe' },
  blue_wolf_breastplate: { name: 'Blue Wolf Breastplate', slot: 'armor', tier: 4, def: 65, mdef: 30, hp: 120, req: { level: 52 }, price: 15000, icon: 'blue_wolf_heavy_armor', desc: 'Peitoral da armadura pesada Blue Wolf (B-Grade).' },
  blue_wolf_leather_armor: { name: 'Blue Wolf Leather Armor', slot: 'armor', tier: 4, def: 52, mdef: 40, eva: 10, speed: 5, req: { level: 52 }, price: 15000, icon: 'blue_wolf_leather_armor', desc: 'Armadura leve Blue Wolf (B-Grade).' },
  blue_wolf_tunic: { name: 'Blue Wolf Tunic', slot: 'armor', tier: 4, def: 35, mdef: 70, matk: 25, mp: 100, req: { level: 52 }, price: 15000, icon: 'blue_wolf_tunic', desc: 'Túnica mística Blue Wolf (B-Grade).' },
  divine_robe: { name: 'Divine Robe', slot: 'armor', tier: 5, def: 80, mdef: 90, matk: 35, req: { level: 76 }, price: 30000 },
  dragon_scale_armor: { name: 'Dragon Scale Armor', slot: 'armor', tier: 5, def: 110, mdef: 50, hp: 200, req: { level: 76 }, price: 35000 },
  // [FIX 6] icon tinha '.png' embutido (unico do arquivo) -> o resolver
  // gerava '....png.png' (404) e ainda apontava para a arte errada (Blue Wolf)
  imperial_crusader_breastplate: { name: 'Imperial Crusader Breastplate', slot: 'armor', tier: 5, def: 220, mdef: 120, hp: 650, req: { level: 76 }, price: 45000, icon: 'imperial_crusader_armor', desc: 'Peitoral da lendária armadura pesada Imperial Crusader de Grau S.' },
  draconic_leather_armor: { name: 'Draconic Leather Armor', slot: 'armor', tier: 5, def: 160, mdef: 140, eva: 25, speed: 10, req: { level: 76 }, price: 45000, desc: 'Armadura leve suprema feita de escamas de dragão de Grau S.' },
  major_arcana_robe: { name: 'Major Arcana Robe', slot: 'armor', tier: 5, def: 110, mdef: 220, matk: 90, mp: 200, req: { level: 76 }, price: 45000, icon: 'major_arcana_robe_armor', desc: 'Manto arcano supremo de grau S.' },
  dynasty_breastplate: { name: 'Dynasty Breastplate', slot: 'armor', tier: 6, def: 140, mdef: 70, hp: 350, req: { level: 80 }, price: 60000 },
  dynasty_leather: { name: 'Dynasty Leather Armor', slot: 'armor', tier: 6, def: 100, mdef: 90, eva: 15, req: { level: 80 }, price: 60000 },
  dynasty_tunic: { name: 'Dynasty Tunic', slot: 'armor', tier: 6, def: 70, mdef: 140, matk: 50, req: { level: 80 }, price: 60000 },
  vesper_breastplate: { name: 'Vesper Noble Breastplate', slot: 'armor', tier: 7, def: 180, mdef: 90, hp: 500, req: { level: 84 }, price: 120000 },
  vesper_leather: { name: 'Vesper Noble Leather Armor', slot: 'armor', tier: 7, def: 140, mdef: 120, eva: 20, req: { level: 84 }, price: 120000 },
  vesper_robe: { name: 'Vesper Noble Robe', slot: 'armor', tier: 7, def: 90, mdef: 180, matk: 75, req: { level: 84 }, price: 120000 },
  elegia_breastplate: { name: 'Elegia Breastplate', slot: 'armor', tier: 8, def: 240, mdef: 120, hp: 750, req: { level: 85 }, price: 250000 },
  elegia_robe: { name: 'Elegia Robe', slot: 'armor', tier: 8, def: 120, mdef: 240, matk: 110, req: { level: 85 }, price: 250000 }
};

const HELMETS = {
  cloth_cap: { name: 'Cloth Cap', slot: 'helmet', tier: 1, def: 1, mdef: 1, req: { level: 1 }, price: 30 },
  leather_helm: { name: 'Leather Helm', slot: 'helmet', tier: 1, def: 2, mdef: 1, req: { level: 3 }, price: 60 },
  iron_helm: { name: 'Iron Helm', slot: 'helmet', tier: 2, def: 5, mdef: 2, req: { level: 10 }, price: 200 },
  mage_hood: { name: 'Mage Hood', slot: 'helmet', tier: 2, def: 1, mdef: 6, matk: 2, req: { level: 12 }, price: 250 },
  steel_helm: { name: 'Steel Helm', slot: 'helmet', tier: 3, def: 10, mdef: 5, req: { level: 20 }, price: 800 },
  shadow_mask: { name: 'Shadow Mask', slot: 'helmet', tier: 3, def: 4, mdef: 8, eva: 3, req: { level: 22 }, price: 900 },
  knight_helm: { name: 'Knight Helm', slot: 'helmet', tier: 4, def: 18, mdef: 10, req: { level: 40 }, price: 3500 },
  arcane_circlet: { name: 'Arcane Circlet', slot: 'helmet', tier: 4, def: 5, mdef: 20, matk: 8, req: { level: 42 }, price: 4000 },
  divine_crown: { name: 'Divine Crown', slot: 'helmet', tier: 5, def: 30, mdef: 35, matk: 15, req: { level: 76 }, price: 15000 },
  dragon_circlet: { name: 'Dragon Circlet', slot: 'helmet', tier: 5, def: 40, mdef: 20, hp: 100, req: { level: 76 }, price: 18000 }
};

const BOOTS = {
  cloth_boots: { name: 'Cloth Boots', slot: 'boots', tier: 1, def: 1, mdef: 1, req: { level: 1 }, price: 25 },
  leather_boots: { name: 'Leather Boots', slot: 'boots', tier: 1, def: 2, mdef: 1, speed: 2, req: { level: 3 }, price: 50 },
  iron_boots: { name: 'Iron Boots', slot: 'boots', tier: 2, def: 4, mdef: 2, req: { level: 10 }, price: 150 },
  mage_sandals: { name: 'Mage Sandals', slot: 'boots', tier: 2, def: 1, mdef: 5, matk: 2, req: { level: 12 }, price: 200 },
  steel_boots: { name: 'Steel Boots', slot: 'boots', tier: 3, def: 8, mdef: 4, req: { level: 20 }, price: 600 },
  shadow_boots: { name: 'Shadow Boots', slot: 'boots', tier: 3, def: 4, mdef: 6, eva: 5, speed: 3, req: { level: 22 }, price: 700 },
  knight_boots: { name: 'Knight Boots', slot: 'boots', tier: 4, def: 15, mdef: 8, req: { level: 40 }, price: 2500 },
  arcane_boots: { name: 'Arcane Boots', slot: 'boots', tier: 4, def: 6, mdef: 18, matk: 6, req: { level: 42 }, price: 3000 },
  divine_boots: { name: 'Divine Boots', slot: 'boots', tier: 5, def: 25, mdef: 30, req: { level: 76 }, price: 12000 },
  dragon_boots: { name: 'Dragon Boots', slot: 'boots', tier: 5, def: 35, mdef: 15, hp: 80, req: { level: 76 }, price: 15000 }
};

const GLOVES = {
  cloth_gloves: { name: 'Cloth Gloves', slot: 'gloves', tier: 1, def: 1, mdef: 1, req: { level: 1 }, price: 20 },
  leather_gloves: { name: 'Leather Gloves', slot: 'gloves', tier: 1, def: 2, mdef: 1, atk: 1, req: { level: 3 }, price: 40 },
  iron_gauntlets: { name: 'Iron Gauntlets', slot: 'gloves', tier: 2, def: 4, mdef: 2, atk: 2, req: { level: 10 }, price: 130 },
  mage_gloves: { name: 'Mage Gloves', slot: 'gloves', tier: 2, def: 1, mdef: 5, matk: 3, req: { level: 12 }, price: 180 },
  steel_gauntlets: { name: 'Steel Gauntlets', slot: 'gloves', tier: 3, def: 8, mdef: 4, atk: 4, req: { level: 20 }, price: 550 },
  shadow_gloves: { name: 'Shadow Gloves', slot: 'gloves', tier: 3, def: 4, mdef: 6, eva: 3, atk: 3, req: { level: 22 }, price: 650 },
  knight_gauntlets: { name: 'Knight Gauntlets', slot: 'gloves', tier: 4, def: 15, mdef: 8, atk: 8, req: { level: 40 }, price: 2200 },
  arcane_gloves: { name: 'Arcane Gloves', slot: 'gloves', tier: 4, def: 6, mdef: 18, matk: 10, req: { level: 42 }, price: 2700 },
  divine_gloves: { name: 'Divine Gloves', slot: 'gloves', tier: 5, def: 25, mdef: 30, matk: 15, req: { level: 76 }, price: 11000 },
  dragon_gauntlets: { name: 'Dragon Gauntlets', slot: 'gloves', tier: 5, def: 35, mdef: 15, atk: 20, req: { level: 76 }, price: 14000 }
};

const RINGS = {
  copper_ring: { name: 'Copper Ring', slot: 'ring', tier: 1, hp: 10, mp: 5, req: { level: 1 }, price: 100 },
  silver_ring: { name: 'Silver Ring', slot: 'ring', tier: 2, hp: 25, mp: 15, atk: 1, req: { level: 10 }, price: 500 },
  gold_ring: { name: 'Gold Ring', slot: 'ring', tier: 3, hp: 50, mp: 30, atk: 2, matk: 2, req: { level: 20 }, price: 2000 },
  ruby_ring: { name: 'Ruby Ring', slot: 'ring', tier: 3, hp: 30, mp: 50, matk: 5, req: { level: 25 }, price: 3000 },
  emerald_ring: { name: 'Emerald Ring', slot: 'ring', tier: 3, hp: 80, mp: 20, def: 3, req: { level: 25 }, price: 3000 },
  sapphire_ring: { name: 'Sapphire Ring', slot: 'ring', tier: 3, hp: 40, mp: 40, eva: 5, req: { level: 25 }, price: 3000 },
  diamond_ring: { name: 'Diamond Ring', slot: 'ring', tier: 4, hp: 120, mp: 80, atk: 4, matk: 4, req: { level: 40 }, price: 8000 },
  onyx_ring: { name: 'Onyx Ring', slot: 'ring', tier: 4, hp: 100, mp: 100, matk: 8, crit: 3, req: { level: 45 }, price: 10000 },
  amethyst_ring: { name: 'Amethyst Ring', slot: 'ring', tier: 4, hp: 150, mp: 50, def: 6, mdef: 6, req: { level: 45 }, price: 10000 },
  dragon_eye_ring: { name: 'Dragon Eye Ring', slot: 'ring', tier: 5, hp: 250, mp: 150, atk: 8, matk: 8, crit: 5, req: { level: 76 }, price: 25000 },
  eternity_ring: { name: 'Ring of Eternity', slot: 'ring', tier: 5, hp: 200, mp: 200, atk: 5, matk: 5, def: 10, mdef: 10, req: { level: 80 }, price: 30000 },
  ring_of_baium: { name: 'Ring of Baium', slot: 'ring', tier: 5, hp: 300, mp: 150, atk: 25, matk: 25, speed: 10, crit: 10, req: { level: 80 }, price: 100000 },
  ring_of_queen_ant: { name: 'Ring of Queen Ant', slot: 'ring', tier: 4, hp: 150, mp: 80, atk: 15, crit: 8, req: { level: 60 }, price: 40000, icon: 'accessory_ring_of_queen_ant_i03' },
  ring_of_core: { name: 'Ring of Core', slot: 'ring', tier: 5, hp: 180, mp: 90, def: 20, req: { level: 76 }, price: 65000, icon: 'accessory_ring_of_core_i03' },
  // [FIX 11] movidos de EARRINGS para RINGS (eram aneis declarados no
  // objeto errado; chaves e stats preservados). Atencao: coexistem com
  // ring_of_queen_ant / ring_of_baium — itens distintos com mesmo nome,
  // candidatos a consolidacao futura.
  ring_queen_ant: { name: 'Ring of Queen Ant', slot: 'ring', tier: 5, crit: 15, atk: 50, req: { level: 40 }, price: 50000, desc: 'Anel épico da Rainha Formiga. (+15% Crit Rate, +50 ATK)' },
  ring_baium: { name: 'Ring of Baium', slot: 'ring', tier: 5, speed: 15, matk: 100, req: { level: 80 }, price: 120000, desc: 'Anel épico do Imperador Baium. (+15% Atk Speed, +100 MATK)' }
};

const NEW_ARMORS = {
  // Dark Crystal Armor Set (Grade A - Req Lv.60)
  // [FIX 7] heavy armor usava o icon da light armor (copy/paste)
  dark_crystal_heavy_armor: { name: 'Dark Crystal Heavy Armor', slot: 'armor', tier: 4, def: 110, mdef: 60, hp: 250, req: { level: 60 }, price: 25000, icon: 'dark_crystal_heavy_armor' },
  dark_crystal_heavy_pants: { name: 'Dark Crystal Heavy Pants', slot: 'legs', tier: 4, def: 65, mdef: 35, hp: 150, req: { level: 60 }, price: 15000, icon: 'dark_crystal_heavy_pants' },
  dark_crystal_heavy_glove: { name: 'Dark Crystal Heavy Gloves', slot: 'gloves', tier: 4, def: 25, mdef: 12, atk: 15, req: { level: 60 }, price: 10000, icon: 'dark_crystal_heavy_glove' },
  dark_crystal_heavy_boots: { name: 'Dark Crystal Heavy Boots', slot: 'boots', tier: 4, def: 25, mdef: 12, speed: 5, req: { level: 60 }, price: 10000, icon: 'dark_crystal_heavy_boots' },

  dark_crystal_light_armor: { name: 'Dark Crystal Light Armor', slot: 'armor', tier: 4, def: 85, mdef: 75, eva: 15, req: { level: 60 }, price: 25000, icon: 'dark_crystal_light_armor' },
  dark_crystal_light_pants: { name: 'Dark Crystal Light Pants', slot: 'legs', tier: 4, def: 55, mdef: 45, eva: 10, req: { level: 60 }, price: 15000, icon: 'dark_crystal_light_pants' },
  dark_crystal_light_glove: { name: 'Dark Crystal Light Gloves', slot: 'gloves', tier: 4, def: 20, mdef: 16, atk: 12, req: { level: 60 }, price: 10000, icon: 'dark_crystal_light_glove' },
  dark_crystal_light_boots: { name: 'Dark Crystal Light Boots', slot: 'boots', tier: 4, def: 20, mdef: 16, speed: 6, req: { level: 60 }, price: 10000, icon: 'dark_crystal_light_boots' },

  dark_crystal_robe_armor: { name: 'Dark Crystal Robe', slot: 'armor', tier: 4, def: 60, mdef: 120, matk: 45, req: { level: 60 }, price: 25000, icon: 'dark_crystal_robe_armor' },
  dark_crystal_robe_glove: { name: 'Dark Crystal Robe Gloves', slot: 'gloves', tier: 4, def: 15, mdef: 30, matk: 12, req: { level: 60 }, price: 10000, icon: 'dark_crystal_robe_glove' },
  dark_crystal_robe_boots: { name: 'Dark Crystal Robe Boots', slot: 'boots', tier: 4, def: 15, mdef: 30, matk: 10, req: { level: 60 }, price: 10000, icon: 'dark_crystal_robe_boots' },

  // Tallum Armor Set (Grade A - Req Lv.60)
  tallum_heavy_armor: { name: 'Tallum Heavy Armor', slot: 'armor', tier: 4, def: 115, mdef: 62, hp: 280, req: { level: 60 }, price: 26000, icon: 'tallum_heavy_armor' },
  tallum_heavy_glove: { name: 'Tallum Heavy Gloves', slot: 'gloves', tier: 4, def: 26, mdef: 14, atk: 16, req: { level: 60 }, price: 11000, icon: 'tallum_heavy_glove' },
  tallum_heavy_boots: { name: 'Tallum Heavy Boots', slot: 'boots', tier: 4, def: 26, mdef: 14, speed: 5, req: { level: 60 }, price: 11000, icon: 'tallum_heavy_boots' },
  tallum_light_armor: { name: 'Tallum Light Armor', slot: 'armor', tier: 4, def: 90, mdef: 78, eva: 16, req: { level: 60 }, price: 26000, icon: 'tallum_light_armor' },
  tallum_light_glove: { name: 'Tallum Light Gloves', slot: 'gloves', tier: 4, def: 22, mdef: 18, atk: 14, req: { level: 60 }, price: 11000, icon: 'tallum_light_glove' },
  tallum_light_boots: { name: 'Tallum Light Boots', slot: 'boots', tier: 4, def: 22, mdef: 18, speed: 7, req: { level: 60 }, price: 11000, icon: 'tallum_light_boots' },
  tallum_robe_armor: { name: 'Tallum Robe', slot: 'armor', tier: 4, def: 65, mdef: 125, matk: 50, req: { level: 60 }, price: 26000, icon: 'tallum_robe_armor' },
  tallum_robe_glove: { name: 'Tallum Robe Gloves', slot: 'gloves', tier: 4, def: 16, mdef: 32, matk: 14, req: { level: 60 }, price: 11000, icon: 'tallum_robe_glove' },
  tallum_robe_boots: { name: 'Tallum Robe Boots', slot: 'boots', tier: 4, def: 16, mdef: 32, matk: 12, req: { level: 60 }, price: 11000, icon: 'tallum_robe_boots' },

  // Majestic Armor Set (Grade A - Req Lv.60)
  majestic_heavy_armor: { name: 'Majestic Heavy Armor', slot: 'armor', tier: 4, def: 120, mdef: 65, hp: 300, req: { level: 60 }, price: 28000, icon: 'majestic_heavy_armor' },
  majestic_heavy_glove: { name: 'Majestic Heavy Gloves', slot: 'gloves', tier: 4, def: 28, mdef: 15, atk: 18, req: { level: 60 }, price: 12000, icon: 'majestic_heavy_glove' },
  majestic_heavy_boots: { name: 'Majestic Heavy Boots', slot: 'boots', tier: 4, def: 28, mdef: 15, speed: 6, req: { level: 60 }, price: 12000, icon: 'majestic_heavy_boots' },
  majestic_light_armor: { name: 'Majestic Light Armor', slot: 'armor', tier: 4, def: 95, mdef: 82, eva: 18, req: { level: 60 }, price: 28000, icon: 'majestic_light_armor' },
  majestic_light_glove: { name: 'Majestic Light Gloves', slot: 'gloves', tier: 4, def: 24, mdef: 20, atk: 16, req: { level: 60 }, price: 12000, icon: 'majestic_light_glove' },
  majestic_light_boots: { name: 'Majestic Light Boots', slot: 'boots', tier: 4, def: 24, mdef: 20, speed: 8, req: { level: 60 }, price: 12000, icon: 'majestic_light_boots' },
  majestic_robe_armor: { name: 'Majestic Robe', slot: 'armor', tier: 4, def: 70, mdef: 130, matk: 55, req: { level: 60 }, price: 28000, icon: 'majestic_robe_armor' },
  majestic_robe_glove: { name: 'Majestic Robe Gloves', slot: 'gloves', tier: 4, def: 18, mdef: 34, matk: 16, req: { level: 60 }, price: 12000, icon: 'majestic_robe_glove' },
  majestic_robe_boots: { name: 'Majestic Robe Boots', slot: 'boots', tier: 4, def: 18, mdef: 34, matk: 14, req: { level: 60 }, price: 12000, icon: 'majestic_robe_boots' },

  // Nightmare Armor Set (Grade A - Req Lv.60)
  nightmare_heavy_armor: { name: 'Nightmare Heavy Armor', slot: 'armor', tier: 4, def: 125, mdef: 68, hp: 320, req: { level: 60 }, price: 30000, icon: 'nightmare_heavy_armor' },
  nightmare_heavy_glove: { name: 'Nightmare Heavy Gloves', slot: 'gloves', tier: 4, def: 30, mdef: 16, atk: 20, req: { level: 60 }, price: 13000, icon: 'nightmare_heavy_glove' },
  nightmare_heavy_boots: { name: 'Nightmare Heavy Boots', slot: 'boots', tier: 4, def: 30, mdef: 16, speed: 6, req: { level: 60 }, price: 13000, icon: 'nightmare_heavy_boots' },
  nightmare_light_armor: { name: 'Nightmare Light Armor', slot: 'armor', tier: 4, def: 100, mdef: 85, eva: 20, req: { level: 60 }, price: 30000, icon: 'nightmare_light_armor' },
  nightmare_light_glove: { name: 'Nightmare Light Gloves', slot: 'gloves', tier: 4, def: 26, mdef: 22, atk: 18, req: { level: 60 }, price: 13000, icon: 'nightmare_light_glove' },
  nightmare_light_boots: { name: 'Nightmare Light Boots', slot: 'boots', tier: 4, def: 26, mdef: 22, speed: 9, req: { level: 60 }, price: 13000, icon: 'nightmare_light_boots' },
  nightmare_robe_armor: { name: 'Nightmare Robe', slot: 'armor', tier: 4, def: 75, mdef: 135, matk: 60, req: { level: 60 }, price: 30000, icon: 'nightmare_robe_armor' },
  nightmare_robe_glove: { name: 'Nightmare Robe Gloves', slot: 'gloves', tier: 4, def: 20, mdef: 36, matk: 18, req: { level: 60 }, price: 13000, icon: 'nightmare_robe_glove' },
  nightmare_robe_boots: { name: 'Nightmare Robe Boots', slot: 'boots', tier: 4, def: 20, mdef: 36, matk: 16, req: { level: 60 }, price: 13000, icon: 'nightmare_robe_boots' },

  // Elemental Armor Sets
  flame_armor: { name: 'Flame Breastplate', slot: 'armor', tier: 6, def: 160, mdef: 80, hp: 400, req: { level: 80 }, price: 55000, icon: 'flame_armor' },
  flame_pants: { name: 'Flame Gaiters', slot: 'legs', tier: 6, def: 95, mdef: 50, hp: 200, req: { level: 80 }, price: 35000, icon: 'flame_pants' },
  flame_gloves: { name: 'Flame Gloves', slot: 'gloves', tier: 6, def: 40, mdef: 25, atk: 25, req: { level: 80 }, price: 20000, icon: 'flame_gloves' },
  icy_armor: { name: 'Icy Robe', slot: 'armor', tier: 6, def: 85, mdef: 170, matk: 65, req: { level: 80 }, price: 55000, icon: 'icy_armor' },
  icy_gaiters: { name: 'Icy Stockings', slot: 'legs', tier: 6, def: 50, mdef: 100, matk: 35, req: { level: 80 }, price: 35000, icon: 'icy_gaiters' },
  lightning_armor: { name: 'Lightning Armor', slot: 'armor', tier: 6, def: 120, mdef: 110, eva: 18, req: { level: 80 }, price: 55000, icon: 'lightning_armor' },
  lightning_pants: { name: 'Lightning Pants', slot: 'legs', tier: 6, def: 75, mdef: 70, eva: 10, req: { level: 80 }, price: 35000, icon: 'lightning_pants' },

  protection_heavy_armor: { name: 'Protection Heavy Armor', slot: 'armor', tier: 6, def: 175, mdef: 85, hp: 450, req: { level: 82 }, price: 65000, icon: 'protection_heavy_armor' },
  protection_heavy_pants: { name: 'Protection Heavy Pants', slot: 'legs', tier: 6, def: 105, mdef: 55, hp: 250, req: { level: 82 }, price: 40000, icon: 'protection_heavy_pants' },
  protection_light_armor: { name: 'Protection Light Armor', slot: 'armor', tier: 6, def: 135, mdef: 115, eva: 20, req: { level: 82 }, price: 65000, icon: 'protection_light_armor' },
  protection_light_pants: { name: 'Protection Light Pants', slot: 'legs', tier: 6, def: 85, mdef: 75, eva: 12, req: { level: 82 }, price: 40000, icon: 'protection_light_pants' },
  protection_robe_armor: { name: 'Protection Robe', slot: 'armor', tier: 6, def: 90, mdef: 180, matk: 70, req: { level: 82 }, price: 65000, icon: 'protection_robe_armor' },
  protection_robe_pants: { name: 'Protection Robe Pants', slot: 'legs', tier: 6, def: 55, mdef: 110, matk: 40, req: { level: 82 }, price: 40000, icon: 'protection_robe_pants' },
  protection_boots: { name: 'Protection Boots', slot: 'boots', tier: 6, def: 42, mdef: 30, speed: 6, req: { level: 82 }, price: 22000, icon: 'protection_boots' },
  protection_gloves: { name: 'Protection Gloves', slot: 'gloves', tier: 6, def: 42, mdef: 30, atk: 20, req: { level: 82 }, price: 22000, icon: 'protection_gloves' },

  red_dragon_glove: { name: 'Red Dragon Gauntlets', slot: 'gloves', tier: 7, def: 55, atk: 45, crit: 5, req: { level: 84 }, price: 45000, icon: 'red_dragon_glove' },
  sea_boots: { name: 'Sea Dragon Boots', slot: 'boots', tier: 7, def: 50, speed: 12, eva: 10, req: { level: 84 }, price: 45000, icon: 'sea_boots' },
  silence_gloves: { name: 'Gloves of Silence', slot: 'gloves', tier: 7, def: 35, matk: 50, mp: 100, req: { level: 84 }, price: 45000, icon: 'silence_gloves' },
  boots_evasion: { name: 'Boots of Evasion', slot: 'boots', tier: 6, def: 30, eva: 15, speed: 8, req: { level: 80 }, price: 28000, icon: 'boots_evasion' },

  // Boss & Epic Weapons
  zaken_sword: { name: 'Zaken Blood Sword', slot: 'weapon', tier: 6, atk: 150, crit: 18, lifesteal: 10, req: { level: 80 }, price: 85000, icon: 'zaken_sword' },
  orfen_twohanded_sword: { name: 'Orfen Greatsword', slot: 'weapon', tier: 6, atk: 170, crit: 15, def: 20, req: { level: 80 }, price: 90000, icon: 'orfen_twohanded_sword' },
  queenant_twohanded_blunt: { name: 'Queen Ant Smasher', slot: 'weapon', tier: 5, atk: 125, crit: 12, hp: 300, req: { level: 76 }, price: 60000, icon: 'queenant_twohanded_blunt' },
  core_bow: { name: 'Core Sentinel Bow', slot: 'weapon', tier: 6, atk: 160, crit: 22, range: 'ranged', req: { level: 80 }, price: 90000, icon: 'core_bow' },
  beleth_staff: { name: 'Beleth Archon Staff', slot: 'weapon', tier: 7, atk: 20, matk: 180, mdef: 50, req: { level: 84 }, price: 150000, icon: 'beleth_staff' },
  anakim_pistols: { name: 'Anakim Divine Dual Pistols', slot: 'weapon', tier: 7, atk: 175, crit: 25, speed: 15, req: { level: 84 }, price: 160000, icon: 'anakim_pistols' },
  anais_first: { name: 'Anais Holy Fist', slot: 'weapon', tier: 7, atk: 165, crit: 20, speed: 18, req: { level: 84 }, price: 140000, icon: 'anais_first' },
  galaxias_ancient_sword: { name: 'Galaxias Ancient Sword', slot: 'weapon', tier: 7, atk: 190, crit: 22, lifesteal: 8, req: { level: 84 }, price: 170000, icon: 'galaxias_ancient_sword' },
  gorde_spear: { name: 'Gorde Demonic Spear', slot: 'weapon', tier: 6, atk: 155, crit: 15, range: 'ranged', req: { level: 80 }, price: 85000, icon: 'gorde_spear' },
  juriel_dual_sword: { name: 'Juriel Dual Blades', slot: 'weapon', tier: 7, atk: 180, crit: 25, speed: 12, req: { level: 84 }, price: 160000, icon: 'juriel_dual_sword' },
  phiriel_rapier: { name: 'Phiriel Silver Rapier', slot: 'weapon', tier: 6, atk: 145, eva: 15, speed: 15, req: { level: 80 }, price: 80000, icon: 'phiriel_rapier' },

  // Epic Accessories & Boss Jewels
  earring_of_orfen: { name: 'Earring of Orfen', slot: 'earring', tier: 5, mdef: 75, mp: 100, healBonus: 0.15, req: { level: 76 }, price: 65000, icon: 'accessory_earring_of_orfen_i03' },
  cat_ears: { name: 'Cute Cat Ears', slot: 'hair', tier: 3, eva: 5, speed: 3, req: { level: 20 }, price: 5000, icon: 'accessory_cat_ear_i00' },
  golden_crown: { name: 'Golden Sovereign Crown', slot: 'hair', tier: 5, atk: 25, matk: 25, def: 25, req: { level: 76 }, price: 45000, icon: 'accessory_crown_i00' },

  // Shields & Sigils
  shield_of_protection: { name: 'Shield of Protection', slot: 'shield', tier: 5, def: 55, mdef: 25, hp: 200, req: { level: 76 }, price: 22000, icon: 'imgi_23_shield_of_protection' },
  shield_of_revenge: { name: 'Shield of Revenge', slot: 'shield', tier: 6, def: 75, mdef: 35, hp: 350, req: { level: 80 }, price: 45000, icon: 'imgi_25_shield_of_revenge' },
  sigil_of_protection: { name: 'Sigil of Protection', slot: 'shield', tier: 5, def: 20, mdef: 50, matk: 35, req: { level: 76 }, price: 22000, icon: 'imgi_27_sigil_of_protection' },
  sigil_of_immortal: { name: 'Sigil of Immortal', slot: 'shield', tier: 7, def: 35, mdef: 80, matk: 60, req: { level: 84 }, price: 90000, icon: 'imgi_41_sigil_of_immortal' },
  shield_of_immortal: { name: 'Shield of Immortal', slot: 'shield', tier: 7, def: 95, mdef: 45, hp: 500, req: { level: 84 }, price: 90000, icon: 'imgi_42_shield_of_immortal' },
  nightmare_shield: { name: 'Nightmare Shield', slot: 'shield', tier: 6, def: 70, mdef: 30, hp: 300, req: { level: 80 }, price: 40000, icon: 'imgi_2_shield_shield_of_nightmare_i00' },
  dark_crystal_shield: { name: 'Dark Crystal Shield', slot: 'shield', tier: 5, def: 50, mdef: 20, hp: 180, req: { level: 76 }, price: 20000, icon: 'imgi_5_shield_dark_crystal_shield_i00' },

  // Boss Box
  bossweapon_box: { name: 'Boss Weapon Chest', slot: 'consumable', type: 'box', price: 100000, stack: 99, desc: 'Unlocks a random S-Grade Boss Weapon', icon: 'bossweapon_box' }
};

const CONSUMABLES = {
  hp_potion_s: { name: 'Small HP Potion', slot: 'consumable', type: 'heal', amount: 50, price: 20, stack: 99, desc: 'Restores 50 HP' },
  hp_potion_m: { name: 'Medium HP Potion', slot: 'consumable', type: 'heal', amount: 200, price: 80, stack: 99, desc: 'Restores 200 HP' },
  hp_potion_l: { name: 'Large HP Potion', slot: 'consumable', type: 'heal', amount: 500, price: 250, stack: 99, desc: 'Restores 500 HP' },
  hp_potion_xl: { name: 'Greater HP Potion', slot: 'consumable', type: 'heal', amount: 1500, price: 800, stack: 99, desc: 'Restores 1500 HP' },
  mp_potion_s: { name: 'Small MP Potion', slot: 'consumable', type: 'mana', amount: 30, price: 25, stack: 99, desc: 'Restores 30 MP' },
  mp_potion_m: { name: 'Medium MP Potion', slot: 'consumable', type: 'mana', amount: 100, price: 90, stack: 99, desc: 'Restores 100 MP' },
  mp_potion_l: { name: 'Large MP Potion', slot: 'consumable', type: 'mana', amount: 300, price: 300, stack: 99, desc: 'Restores 300 MP' },
  mp_potion_xl: { name: 'Greater MP Potion', slot: 'consumable', type: 'mana', amount: 800, price: 900, stack: 99, desc: 'Restores 800 MP' },
  antidote: { name: 'Antidote', slot: 'consumable', type: 'cure', price: 50, stack: 99, desc: 'Cures poison' },
  scroll_of_resurrection: { name: 'Scroll of Resurrection', slot: 'scroll', type: 'resurrect', loss: 0.1, price: 500, stack: 99, desc: 'Restore 90% XP on death' },
  scroll_of_rebirth: { name: 'Scroll of Rebirth', slot: 'scroll', type: 'resurrect', loss: 0.0, price: 2000, stack: 99, desc: 'No XP loss on death' },
  attack_potion: { name: 'Attack Potion', slot: 'consumable', type: 'buff', stat: 'atk', amount: 10, duration: 300, price: 150, stack: 99, desc: '+10 ATK for 5 min' },
  defense_potion: { name: 'Defense Potion', slot: 'consumable', type: 'buff', stat: 'def', amount: 10, duration: 300, price: 150, stack: 99, desc: '+10 DEF for 5 min' },
  speed_potion: { name: 'Speed Potion', slot: 'consumable', type: 'buff', stat: 'speed', amount: 15, duration: 300, price: 200, stack: 99, desc: '+15% Speed for 5 min' },
  soulshot_ng: { name: 'Soulshot (No-Grade)', slot: 'consumable', type: 'soulshot', price: 10, stack: 9999, desc: 'Increases physical attack damage by +100% on hit.' },
  spiritshot_ng: { name: 'Spiritshot (No-Grade)', slot: 'consumable', type: 'spiritshot', price: 15, stack: 9999, desc: 'Increases magic attack damage by +100% on spell.' },
  enchant_weapon_scroll: { name: 'Scroll: Enchant Weapon', slot: 'scroll', type: 'enchant_weapon', price: 1500, stack: 99, desc: 'Enchants a weapon (+10% stats per +1). Safe up to +3.' },
  enchant_armor_scroll: { name: 'Scroll: Enchant Armor', slot: 'scroll', type: 'enchant_armor', price: 1000, stack: 99, desc: 'Enchants armor (+10% stats per +1). Safe up to +3.' },
  spellbook_1star: { name: 'Spellbook: 1-Star ⭐', slot: 'scroll', type: 'spellbook', price: 5000, stack: 99, desc: 'Ancient L-Coin spellbook required to learn 1-Star ⭐ Essence skills.' },
  spellbook_2star: { name: 'Spellbook: 2-Star ⭐⭐', slot: 'scroll', type: 'spellbook', price: 25000, stack: 99, desc: 'Mastery spellbook required to learn 2-Star ⭐⭐ Essence mastery skills.' },
  spellbook_3star: { name: 'Spellbook: 3-Star ⭐⭐⭐', slot: 'scroll', type: 'spellbook', price: 100000, stack: 99, desc: 'High-rank spellbook required to learn 3-Star ⭐⭐⭐ Essence ultimate skills.' },
  spellbook_4star: { name: 'Spellbook: 4-Star ⭐⭐⭐⭐', slot: 'scroll', type: 'spellbook', price: 500000, stack: 99, desc: 'Mythic 4-Star ⭐⭐⭐⭐ spellbook unlocking supreme class aura transformations.' },
  scroll_race_class_change: { name: 'Scroll of Race & Class Change', slot: 'scroll', type: 'raceClassChange', price: 10000, stack: 99, desc: 'Permite trocar a Raça e Classe do personagem. Reseta todas as habilidades, devolve todo o SP e desequipa os itens para o inventário.', icon: 'exp_scroll' }
};

const LEGS = {
  cloth_pants: { name: 'Cloth Pants', slot: 'legs', tier: 1, def: 2, mdef: 2, req: { level: 1 }, price: 30 },
  leather_gaiters: { name: 'Leather Gaiters', slot: 'legs', tier: 1, def: 4, mdef: 1, req: { level: 3 }, price: 70 },
  iron_gaiters: { name: 'Iron Gaiters', slot: 'legs', tier: 2, def: 10, mdef: 4, req: { level: 10 }, price: 300 },
  mage_stockings: { name: 'Mage Stockings', slot: 'legs', tier: 2, def: 4, mdef: 12, matk: 3, req: { level: 12 }, price: 350 },
  steel_gaiters: { name: 'Steel Gaiters', slot: 'legs', tier: 3, def: 20, mdef: 8, req: { level: 20 }, price: 1200 },
  shadow_pants: { name: 'Shadow Pants', slot: 'legs', tier: 3, def: 8, mdef: 14, eva: 5, req: { level: 22 }, price: 1400 },
  knight_gaiters: { name: 'Knight Gaiters', slot: 'legs', tier: 4, def: 35, mdef: 18, hp: 35, req: { level: 40 }, price: 5000 },
  arcane_stockings: { name: 'Arcane Stockings', slot: 'legs', tier: 4, def: 14, mdef: 40, matk: 15, req: { level: 42 }, price: 6000 },
  divine_gaiters: { name: 'Divine Gaiters', slot: 'legs', tier: 5, def: 60, mdef: 65, matk: 25, req: { level: 76 }, price: 20000 },
  dragon_scale_gaiters: { name: 'Dragon Scale Gaiters', slot: 'legs', tier: 5, def: 80, mdef: 35, hp: 150, req: { level: 76 }, price: 24000 }
};

const SHIELDS = {
  wooden_shield: { name: 'Wooden Shield', slot: 'shield', tier: 1, def: 3, mdef: 1, req: { level: 1 }, price: 40 },
  bronze_shield: { name: 'Bronze Shield', slot: 'shield', tier: 2, def: 8, mdef: 3, hp: 20, req: { level: 10 }, price: 250 },
  sigil_of_devotion: { name: 'Sigil of Devotion', slot: 'shield', tier: 2, def: 2, mdef: 8, matk: 5, req: { level: 12 }, price: 300 },
  steel_shield: { name: 'Steel Shield', slot: 'shield', tier: 3, def: 16, mdef: 6, hp: 50, req: { level: 20 }, price: 1000 },
  sigil_of_grace: { name: 'Sigil of Grace', slot: 'shield', tier: 3, def: 5, mdef: 15, matk: 10, req: { level: 22 }, price: 1200 },
  knight_shield: { name: 'Knight Shield', slot: 'shield', tier: 4, def: 30, mdef: 15, hp: 100, req: { level: 40 }, price: 4500 },
  sigil_of_mastery: { name: 'Sigil of Mastery', slot: 'shield', tier: 4, def: 10, mdef: 35, matk: 20, req: { level: 42 }, price: 5000 },
  imperial_shield: { name: 'Imperial Crusader Shield', slot: 'shield', tier: 5, def: 65, mdef: 30, hp: 250, req: { level: 76 }, price: 18000 },
  sigil_of_arcana: { name: 'Sigil of Arcana', slot: 'shield', tier: 5, def: 25, mdef: 60, matk: 40, req: { level: 76 }, price: 20000 }
};

const NECKLACES = {
  oak_necklace: { name: 'Oak Necklace', slot: 'necklace', tier: 1, mdef: 3, hp: 10, mp: 10, req: { level: 1 }, price: 50 },
  elven_necklace: { name: 'Elven Necklace', slot: 'necklace', tier: 2, mdef: 10, mp: 30, speed: 2, req: { level: 20 }, price: 800 },
  necklace_of_grace: { name: 'Necklace of Grace', slot: 'necklace', tier: 3, mdef: 25, matk: 10, crit: 3, req: { level: 40 }, price: 3500 },
  black_ore_necklace: { name: 'Black Ore Necklace', slot: 'necklace', tier: 4, mdef: 45, hp: 80, matk: 20, req: { level: 60 }, price: 12000 },
  necklace_of_valakas: { name: 'Necklace of Valakas', slot: 'necklace', tier: 5, mdef: 90, atk: 50, matk: 50, crit: 15, req: { level: 85 }, price: 150000 },
  necklace_of_antharas: { name: 'Necklace of Antharas', slot: 'necklace', tier: 5, mdef: 85, hp: 350, def: 40, lifesteal: 6, req: { level: 85 }, price: 150000 },
  necklace_of_frintezza: { name: 'Necklace of Frintezza', slot: 'necklace', tier: 5, mdef: 70, speed: 12, matk: 35, req: { level: 82 }, price: 90000 }
};

const EARRINGS = {
  // [FIX 11] ring_queen_ant e ring_baium foram movidos para RINGS
  oak_earring: { name: 'Oak Earring', slot: 'earring', tier: 1, mdef: 2, mp: 5, req: { level: 1 }, price: 40 },
  elven_earring: { name: 'Elven Earring', slot: 'earring', tier: 2, mdef: 8, mp: 20, eva: 2, req: { level: 20 }, price: 600 },
  earring_of_grace: { name: 'Earring of Grace', slot: 'earring', tier: 3, mdef: 20, matk: 8, req: { level: 40 }, price: 2500 },
  black_ore_earring: { name: 'Black Ore Earring', slot: 'earring', tier: 4, mdef: 35, mp: 50, eva: 5, req: { level: 60 }, price: 8000 },
  earring_of_antharas: { name: 'Earring of Antharas', slot: 'earring', tier: 5, mdef: 150, def: 150, hp: 300, lifesteal: 8, req: { level: 85 }, price: 200000, desc: 'Brinco lendário do Dragão Antharas. (+150 DEF/MDEF, +300 HP)' },
  earring_of_zaken: { name: 'Earring of Zaken', slot: 'earring', tier: 5, mdef: 60, lifesteal: 12, hp: 150, req: { level: 60 }, price: 80000, desc: 'Brinco épico de Zaken. (+12% Lifesteal, +150 HP)' }
};

const BELTS = {
  novice_belt: { name: 'Novice Leather Belt', slot: 'belt', tier: 1, def: 2, hp: 15, req: { level: 1 }, price: 60 },
  mithril_belt: { name: 'Mithril Belt', slot: 'belt', tier: 2, def: 8, hp: 50, lootBonus: 0.05, req: { level: 20 }, price: 1000 },
  belt_of_power: { name: 'Belt of Power', slot: 'belt', tier: 3, def: 18, atk: 10, hp: 100, req: { level: 40 }, price: 4000 },
  champion_belt: { name: 'Champion Belt', slot: 'belt', tier: 4, def: 35, atk: 20, hp: 200, req: { level: 60 }, price: 15000 },
  dragon_belt: { name: 'Dragon Belt', slot: 'belt', tier: 5, def: 55, atk: 40, matk: 40, hp: 350, req: { level: 76 }, price: 30000 }
};

const CLOAKS = {
  adventurer_cloak: { name: 'Adventurer Cloak', slot: 'cloak', tier: 1, def: 2, mdef: 2, speed: 3, req: { level: 1 }, price: 100 },
  cloak_of_valor: { name: 'Cloak of Valor', slot: 'cloak', tier: 2, def: 6, mdef: 8, speed: 5, req: { level: 20 }, price: 1200 },
  cloak_of_freedom: { name: 'Cloak of Freedom', slot: 'cloak', tier: 3, def: 14, mdef: 18, speed: 8, eva: 4, req: { level: 40 }, price: 5000 },
  cloak_of_shadows_gear: { name: 'Cloak of Shadows', slot: 'cloak', tier: 4, def: 25, mdef: 30, eva: 8, crit: 5, req: { level: 60 }, price: 18000 },
  ancient_cloak_of_aden: { name: 'Ancient Cloak of Aden', slot: 'cloak', tier: 5, def: 45, mdef: 55, speed: 12, atk: 25, matk: 25, req: { level: 76 }, price: 40000 }
};

const TALISMANS = {
  talisman_novice: { name: 'Talisman of Novice', slot: 'talisman', tier: 1, atk: 2, matk: 2, req: { level: 1 }, price: 80 },
  talisman_protection: { name: 'Talisman of Protection', slot: 'talisman', tier: 2, def: 10, mdef: 10, req: { level: 20 }, price: 1500 },
  talisman_of_power: { name: 'Talisman of Power', slot: 'talisman', tier: 3, atk: 15, matk: 20, crit: 4, req: { level: 40 }, price: 6000 },
  talisman_of_eva: { name: 'Talisman of Eva', slot: 'talisman', tier: 4, mp: 100, matk: 35, speed: 5, req: { level: 60 }, price: 20000 },
  venir_talisman: { name: "Venir's Talisman", slot: 'talisman', tier: 5, atk: 45, matk: 55, crit: 8, lifesteal: 5, req: { level: 76 }, price: 45000 }
};

const HAIR = {
  apprentice_circlet: { name: 'Apprentice Circlet', slot: 'hair', tier: 1, mdef: 2, mp: 10, req: { level: 1 }, price: 50 },
  bronze_feather_circlet: { name: 'Bronze Feather Circlet', slot: 'hair', tier: 2, def: 4, mdef: 8, speed: 3, req: { level: 20 }, price: 900 },
  silver_tiara: { name: 'Silver Tiara', slot: 'hair', tier: 3, def: 8, mdef: 16, matk: 10, req: { level: 40 }, price: 4000 },
  noble_gold_crown: { name: 'Noble Gold Crown', slot: 'hair', tier: 4, def: 18, mdef: 30, atk: 15, matk: 20, req: { level: 60 }, price: 16000 },
  essence_crown_of_aden: { name: 'Essence Crown of Aden', slot: 'hair', tier: 5, def: 30, mdef: 50, atk: 35, matk: 45, req: { level: 76 }, price: 38000 }
};

const HAIR2 = {
  novice_mask: { name: 'Novice Mask', slot: 'hair2', tier: 1, eva: 2, req: { level: 1 }, price: 50 },
  assassin_mask: { name: 'Assassin Mask', slot: 'hair2', tier: 2, eva: 5, atk: 5, req: { level: 20 }, price: 900 },
  phantom_mask_gear: { name: 'Phantom Mask', slot: 'hair2', tier: 3, eva: 8, crit: 4, req: { level: 40 }, price: 4000 },
  executioner_mask: { name: 'Executioner Mask', slot: 'hair2', tier: 4, eva: 12, crit: 8, atk: 18, req: { level: 60 }, price: 16000 },
  boss_facemask_valakas: { name: 'Facemask of Valakas', slot: 'hair2', tier: 5, eva: 18, crit: 12, atk: 40, matk: 40, req: { level: 76 }, price: 38000 }
};

const MATERIALS = {
  crystal_d: { name: 'Crystal: D Grade', slot: 'material', price: 50, stack: 999, desc: 'Used for D Grade crafting' },
  crystal_c: { name: 'Crystal: C Grade', slot: 'material', price: 150, stack: 999, desc: 'Used for C Grade crafting' },
  crystal_b: { name: 'Crystal: B Grade', slot: 'material', price: 450, stack: 999, desc: 'Used for B Grade crafting' },
  crystal_a: { name: 'Crystal: A Grade', slot: 'material', price: 1350, stack: 999, desc: 'Used for A Grade crafting' },
  crystal_s: { name: 'Crystal: S Grade', slot: 'material', price: 4000, stack: 999, desc: 'Used for S Grade crafting' },
  iron_ore: { name: 'Iron Ore', slot: 'material', price: 15, stack: 999, desc: 'Common crafting material', icon: 'ironore' },
  steel_ingot: { name: 'Steel Ingot', slot: 'material', price: 80, stack: 999, desc: 'Used in tier 3+ crafting' },
  mithril_ore: { name: 'Mithril Ore', slot: 'material', price: 300, stack: 999, desc: 'Rare crafting material' },
  oriharukon: { name: 'Oriharukon', slot: 'material', price: 1500, stack: 999, desc: 'Legendary crafting material' },
  magic_powder: { name: 'Magic Powder', slot: 'material', price: 50, stack: 999, desc: 'Used in magical crafting' },
  crystal_fragment: { name: 'Crystal Fragment', slot: 'material', price: 200, stack: 999, desc: 'Required for staves' },
  leather: { name: 'Leather', slot: 'material', price: 25, stack: 999, desc: 'Basic leather material', icon: 'leather' },
  cloth: { name: 'Cloth', slot: 'material', price: 10, stack: 999, desc: 'Basic cloth material', icon: 'cloth' },
  suede: { name: 'Suede', slot: 'material', price: 30, stack: 999, desc: 'Soft processed leather material', icon: 'suede' },
  branch: { name: 'Wood Branch', slot: 'material', price: 12, stack: 999, desc: 'Sturdy wooden branch', icon: 'branch' },
  ancient_adena: { name: 'Ancient Adena', slot: 'material', price: 100, stack: 9999, desc: 'Currency from ancient catacombs', icon: 'ancient_adena' },
  material_pouch: { name: 'Material Pouch', slot: 'material', price: 250, stack: 99, desc: 'Contains random crafting supplies', icon: 'material_pouch' },
  beast_blood: { name: 'Beast Blood', slot: 'material', price: 40, stack: 999, desc: 'Dropped by beasts' },
  goblin_ear: { name: 'Goblin Ear', slot: 'material', price: 20, stack: 999, desc: 'Quest item / trophy' },
  wolf_fang: { name: 'Wolf Fang', slot: 'material', price: 60, stack: 999, desc: 'Sharp material' },
  dragon_scale: { name: 'Dragon Scale', slot: 'material', price: 1000, stack: 999, desc: 'Legendary scale' },
  dragon_bone: { name: 'Dragon Bone', slot: 'material', price: 1500, stack: 999, desc: 'Precious crafting material' },
  ancient_relic: { name: 'Ancient Relic', slot: 'material', price: 5000, stack: 999, desc: 'Mysterious artifact' },
  report_piece: { name: 'Report Piece', slot: 'material', price: 300, stack: 99, desc: 'Fragment of ancient reports', icon: 'report_piece' }
};

const AGATHIONS = {
  agathion_pegasus: { name: 'Agathion Pegasus', slot: 'agathion', tier: 5, price: 50000, desc: 'Companheiro celestial (+10% EXP, +10% Speed)' },
  agathion_valakas_mini: { name: 'Agathion Baby Valakas', slot: 'agathion', tier: 5, price: 100000, desc: 'Dragão de fogo miniatura (+15% PAtk, +15% MAtk)' },
  agathion_rudolph: { name: 'Agathion Rudolph', slot: 'agathion', tier: 5, price: 50000, desc: 'Servo festivo (+20% Ouro, +10% Regen HP)' },
  agathion_angel: { name: 'Agathion Holy Angel', slot: 'agathion', tier: 5, price: 75000, desc: 'Anjo da luz (+20% Def, +20% MDef)' },
  agathion_dragon_child: { name: 'Agathion Sovereign Dragon', slot: 'agathion', tier: 5, price: 150000, desc: 'Dragão soberano (+25% Dano Total)' }
};

const ALL_ITEMS = {
  ...WEAPONS, ...ARMORS, ...LEGS, ...HELMETS, ...BOOTS, ...GLOVES,
  ...SHIELDS, ...NECKLACES, ...EARRINGS, ...BELTS, ...CLOAKS, ...TALISMANS,
  ...HAIR, ...HAIR2, ...RINGS, ...CONSUMABLES, ...MATERIALS, ...AGATHIONS,
  ...NEW_ARMORS
};
// Explicit PNG Icon File Mappings
if (ALL_ITEMS.dynasty_breastplate) ALL_ITEMS.dynasty_breastplate.icon = 'dynasti_heavey_armor';
if (ALL_ITEMS.dynasty_leather) ALL_ITEMS.dynasty_leather.icon = 'dynasti_light_armor';
if (ALL_ITEMS.dynasty_tunic) ALL_ITEMS.dynasty_tunic.icon = 'dynasti_robe_armor';
if (ALL_ITEMS.enchant_weapon_scroll) ALL_ITEMS.enchant_weapon_scroll.icon = 'scroll_of_enchant_weapon_';
if (ALL_ITEMS.enchant_armor_scroll) ALL_ITEMS.enchant_armor_scroll.icon = 'scroll_of_enchant_armor';
if (ALL_ITEMS.novice_belt) ALL_ITEMS.novice_belt.icon = 'belt';
if (ALL_ITEMS.champion_belt) ALL_ITEMS.champion_belt.icon = 'blessed_belt';
if (ALL_ITEMS.adventurer_cloak) ALL_ITEMS.adventurer_cloak.icon = 'capared';
if (ALL_ITEMS.cloak_of_valor) ALL_ITEMS.cloak_of_valor.icon = 'capawhite';
if (ALL_ITEMS.mage_hood) ALL_ITEMS.mage_hood.icon = 'helmet_of_mana';
if (ALL_ITEMS.ring_of_queen_ant) ALL_ITEMS.ring_of_queen_ant.icon = 'accessory_ring_of_queen_ant_i03';
if (ALL_ITEMS.ring_queen_ant) ALL_ITEMS.ring_queen_ant.icon = 'accessory_ring_of_queen_ant_i03';
if (ALL_ITEMS.necklace_of_valakas) ALL_ITEMS.necklace_of_valakas.icon = 'ring_of_valakas';

// [FIX 10] aliases agora sao copias rasas: mutacoes (enchant, upgrade)
// em um alias nao vazam mais para o item canonico nem para outros aliases
ALL_ITEMS.novice_cloak = { ...ALL_ITEMS.adventurer_cloak };
ALL_ITEMS.novice_talisman = { ...ALL_ITEMS.talisman_novice };
ALL_ITEMS.novice_circlet = { ...ALL_ITEMS.apprentice_circlet };
ALL_ITEMS.sigil_devotion = { ...ALL_ITEMS.sigil_of_devotion };
ALL_ITEMS.sigil_grace = { ...ALL_ITEMS.sigil_of_grace };
ALL_ITEMS.sigil_mastery = { ...ALL_ITEMS.sigil_of_mastery };
ALL_ITEMS.sigil_arcana = { ...ALL_ITEMS.sigil_of_arcana };
ALL_ITEMS.phantom_mask_item = { ...ALL_ITEMS.phantom_mask_gear };
ALL_ITEMS.valakas_mask = { ...ALL_ITEMS.boss_facemask_valakas };
ALL_ITEMS.noble_crown = { ...ALL_ITEMS.noble_gold_crown };
ALL_ITEMS.essence_crown = { ...ALL_ITEMS.essence_crown_of_aden };

// ======================================
// MONSTER DROPS (Loot rebalanceado)
// ======================================
const MONSTER_DROPS = {
  goblin: {
    items: [{ id: 'iron_ore', chance: 0.15, amount: [1, 2] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }, { id: 'goblin_ear', chance: 0.2, amount: [1, 1] }, { id: 'hp_potion_s', chance: 0.05, amount: [1, 1] }],
    equipment: [{ pool: ['wooden_sword', 'training_dagger', 'oak_staff', 'short_bow', 'leather_vest', 'cloth_robe', 'cloth_pants', 'wooden_shield', 'leather_helm', 'cloth_boots', 'leather_gloves', 'oak_necklace', 'oak_earring', 'copper_ring', 'novice_belt', 'adventurer_cloak', 'talisman_novice', 'apprentice_circlet', 'novice_mask'], chance: 0.10 }]
  },
  wolf: {
    items: [{ id: 'beast_blood', chance: 0.15, amount: [1, 2] }, { id: 'wolf_fang', chance: 0.15, amount: [1, 2] }, { id: 'leather', chance: 0.15, amount: [1, 2] }],
    equipment: [{ pool: ['training_dagger', 'short_bow', 'leather_vest', 'leather_gaiters', 'leather_helm', 'leather_boots', 'leather_gloves', 'oak_necklace', 'oak_earring', 'copper_ring', 'novice_belt', 'adventurer_cloak', 'talisman_novice'], chance: 0.10 }]
  },
  spider: {
    items: [{ id: 'beast_blood', chance: 0.15, amount: [1, 2] }, { id: 'magic_powder', chance: 0.15, amount: [1, 1] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }],
    equipment: [{ pool: ['oak_staff', 'cloth_robe', 'cloth_pants', 'cloth_boots', 'oak_necklace', 'oak_earring', 'copper_ring', 'apprentice_circlet', 'talisman_novice'], chance: 0.10 }]
  },
  orc: {
    items: [{ id: 'iron_ore', chance: 0.2, amount: [2, 4] }, { id: 'leather', chance: 0.15, amount: [1, 3] }, { id: 'hp_potion_m', chance: 0.05, amount: [1, 1] }],
    equipment: [{ pool: ['iron_sword', 'bronze_mace', 'iron_gaiters', 'bronze_shield', 'iron_boots', 'iron_gauntlets', 'iron_helm', 'silver_ring', 'elven_necklace', 'elven_earring', 'mithril_belt', 'cloak_of_valor', 'talisman_protection'], chance: 0.12 }]
  },
  kobold: {
    items: [{ id: 'iron_ore', chance: 0.2, amount: [1, 3] }, { id: 'steel_ingot', chance: 0.1, amount: [1, 1] }, { id: 'mp_potion_s', chance: 0.05, amount: [1, 1] }],
    equipment: [{ pool: ['iron_sword', 'steel_dagger', 'composite_bow', 'iron_armor', 'iron_gaiters', 'bronze_shield', 'iron_boots', 'iron_helm', 'silver_ring', 'mithril_belt'], chance: 0.12 }]
  },
  kamaelScout: {
    items: [{ id: 'magic_powder', chance: 0.15, amount: [1, 3] }, { id: 'crystal_fragment', chance: 0.15, amount: [1, 2] }],
    equipment: [{ pool: ['crystal_staff', 'assassins_blade', 'mage_stockings', 'sigil_of_devotion', 'cloak_of_valor', 'assassin_mask', 'shadow_boots', 'silver_ring', 'elven_earring'], chance: 0.12 }]
  },
  skeleton: {
    items: [{ id: 'iron_ore', chance: 0.2, amount: [1, 2] }, { id: 'steel_ingot', chance: 0.1, amount: [1, 1] }],
    equipment: [{ pool: ['iron_sword', 'crystal_staff', 'iron_armor', 'mage_robe', 'mage_stockings', 'iron_gaiters', 'bronze_shield', 'mage_hood', 'iron_helm', 'talisman_protection'], chance: 0.12 }]
  },
  goblinKing: {
    items: [{ id: 'steel_ingot', chance: 0.3, amount: [2, 4] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }, { id: 'scroll_of_resurrection', chance: 0.2, amount: [1, 1] }],
    equipment: [{ pool: ['knight_sword', 'archmage_staff', 'elven_bow', 'warhammer', 'dark_katana', 'steel_plate', 'steel_gaiters', 'steel_shield', 'sigil_of_grace', 'steel_helm', 'steel_boots', 'gold_ring', 'necklace_of_grace', 'earring_of_grace', 'belt_of_power', 'cloak_of_freedom', 'talisman_of_power', 'silver_tiara'], chance: 0.22, rarityBoost: 1 }]
  },
  wolfAlpha: {
    items: [{ id: 'wolf_fang', chance: 0.3, amount: [3, 6] }, { id: 'beast_blood', chance: 0.3, amount: [2, 4] }, { id: 'leather', chance: 0.3, amount: [3, 5] }],
    equipment: [{ pool: ['steel_dagger', 'composite_bow', 'iron_armor', 'shadow_pants', 'cloak_of_valor', 'steel_boots', 'silver_ring', 'mithril_belt'], chance: 0.20 }]
  },
  knight: {
    items: [{ id: 'steel_ingot', chance: 0.2, amount: [2, 4] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }],
    equipment: [{ pool: ['blade_of_doom', 'soul_seeker', 'staff_of_magic', 'dragon_bow', 'titan_hammer', 'dual_swords', 'knight_armor', 'arcane_robe', 'knight_gaiters', 'arcane_stockings', 'knight_shield', 'sigil_of_mastery', 'knight_helm', 'arcane_circlet', 'diamond_ring', 'onyx_ring', 'amethyst_ring', 'black_ore_necklace', 'black_ore_earring', 'champion_belt', 'cloak_of_shadows_gear', 'talisman_of_eva', 'noble_gold_crown', 'executioner_mask'], chance: 0.15, rarityBoost: 1 }]
  },
  mage: {
    items: [{ id: 'magic_powder', chance: 0.2, amount: [2, 4] }, { id: 'crystal_fragment', chance: 0.2, amount: [2, 3] }, { id: 'mithril_ore', chance: 0.1, amount: [1, 2] }],
    equipment: [{ pool: ['archmage_staff', 'staff_of_magic', 'arcane_robe', 'arcane_stockings', 'sigil_of_mastery', 'arcane_circlet', 'arcane_boots', 'arcane_gloves', 'ruby_ring', 'sapphire_ring', 'black_ore_necklace', 'black_ore_earring', 'talisman_of_eva'], chance: 0.15, rarityBoost: 1 }]
  },
  dragon: {
    items: [{ id: 'dragon_scale', chance: 0.4, amount: [2, 4] }, { id: 'dragon_bone', chance: 0.3, amount: [1, 3] }, { id: 'oriharukon', chance: 0.2, amount: [1, 2] }, { id: 'ancient_relic', chance: 0.1, amount: [1, 1] }, { id: 'scroll_of_rebirth', chance: 0.3, amount: [1, 1] }],
    equipment: [{ pool: ['divine_sword', 'staff_of_eternity', 'bow_of_silence', 'dragon_slayer', 'chaos_blade', 'divine_robe', 'dragon_scale_armor', 'divine_gaiters', 'dragon_scale_gaiters', 'imperial_shield', 'sigil_of_arcana', 'divine_crown', 'dragon_circlet', 'divine_boots', 'divine_gloves', 'dragon_boots', 'dragon_gauntlets', 'necklace_of_valakas', 'earring_of_antharas', 'earring_of_zaken', 'dragon_eye_ring', 'eternity_ring', 'dragon_belt', 'ancient_cloak_of_aden', 'venir_talisman', 'essence_crown_of_aden', 'boss_facemask_valakas'], chance: 0.30, rarityBoost: 2 }]
  },
  dragonKnight: {
    items: [{ id: 'dragon_scale', chance: 0.5, amount: [3, 5] }, { id: 'dragon_bone', chance: 0.4, amount: [2, 4] }, { id: 'oriharukon', chance: 0.3, amount: [2, 3] }, { id: 'ancient_relic', chance: 0.15, amount: [1, 2] }],
    equipment: [{ pool: ['divine_sword', 'staff_of_eternity', 'bow_of_silence', 'dragon_slayer', 'chaos_blade', 'divine_robe', 'dragon_scale_armor', 'divine_gaiters', 'dragon_scale_gaiters', 'imperial_shield', 'sigil_of_arcana', 'divine_crown', 'dragon_eye_ring', 'eternity_ring', 'dragon_belt', 'ancient_cloak_of_aden', 'venir_talisman'], chance: 0.35, rarityBoost: 3 }]
  },

  goblinThief: { items: [{ id: 'iron_ore', chance: 0.15, amount: [1, 3] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['wooden_sword', 'training_dagger', 'short_bow', 'leather_vest', 'cloth_pants', 'wooden_shield', 'cloth_boots', 'oak_necklace', 'oak_earring', 'novice_belt', 'adventurer_cloak'], chance: 0.10 }] },
  koboldLeader: { items: [{ id: 'steel_ingot', chance: 0.2, amount: [1, 2] }, { id: 'iron_ore', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['iron_sword', 'composite_bow', 'iron_armor', 'iron_gaiters', 'bronze_shield', 'iron_boots', 'elven_necklace', 'mithril_belt'], chance: 0.15 }] },
  direWolf: { items: [{ id: 'beast_blood', chance: 0.2, amount: [2, 4] }, { id: 'wolf_fang', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['steel_dagger', 'composite_bow', 'shadow_pants', 'cloak_of_valor', 'shadow_boots'], chance: 0.10 }] },
  crimsonBabyDragon: { items: [{ id: 'dragon_scale', chance: 0.15, amount: [1, 1] }, { id: 'dragon_bone', chance: 0.15, amount: [1, 1] }], equipment: [{ pool: ['knight_sword', 'elven_bow', 'steel_plate', 'steel_gaiters', 'steel_shield', 'gold_ring', 'necklace_of_grace'], chance: 0.12 }] },
  alphaWolf: { items: [{ id: 'wolf_fang', chance: 0.3, amount: [3, 6] }, { id: 'beast_blood', chance: 0.3, amount: [2, 5] }], equipment: [{ pool: ['steel_dagger', 'cloak_of_valor', 'shadow_boots', 'silver_ring', 'elven_earring'], chance: 0.15 }] },
  darkMage: { items: [{ id: 'magic_powder', chance: 0.2, amount: [3, 5] }, { id: 'crystal_fragment', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['archmage_staff', 'arcane_robe', 'arcane_stockings', 'sigil_of_mastery', 'arcane_circlet', 'ruby_ring'], chance: 0.12 }] },
  devilBone: { items: [{ id: 'steel_ingot', chance: 0.2, amount: [3, 5] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['warhammer', 'blade_of_doom', 'knight_armor', 'knight_gaiters', 'knight_shield', 'knight_helm'], chance: 0.12 }] },
  deathKnight: { items: [{ id: 'mithril_ore', chance: 0.3, amount: [2, 4] }, { id: 'oriharukon', chance: 0.2, amount: [1, 2] }], equipment: [{ pool: ['soul_seeker', 'blade_of_doom', 'titan_hammer', 'knight_armor', 'knight_gaiters', 'knight_shield', 'diamond_ring', 'black_ore_necklace'], chance: 0.25, rarityBoost: 1 }] },
  voidCreature: { items: [{ id: 'ancient_relic', chance: 0.2, amount: [1, 2] }, { id: 'oriharukon', chance: 0.2, amount: [1, 3] }], equipment: [{ pool: ['staff_of_magic', 'dragon_bow', 'arcane_robe', 'arcane_stockings', 'sigil_of_mastery', 'onyx_ring'], chance: 0.25, rarityBoost: 1 }] },
  emeraldDragon: { items: [{ id: 'dragon_scale', chance: 0.4, amount: [3, 5] }, { id: 'dragon_bone', chance: 0.3, amount: [2, 4] }], equipment: [{ pool: ['divine_sword', 'bow_of_silence', 'dragon_scale_armor', 'dragon_scale_gaiters', 'imperial_shield', 'dragon_eye_ring', 'necklace_of_valakas'], chance: 0.30, rarityBoost: 2 }] },
  cerberus: { items: [{ id: 'ancient_relic', chance: 0.3, amount: [2, 4] }, { id: 'dragon_bone', chance: 0.3, amount: [3, 5] }], equipment: [{ pool: ['chaos_blade', 'dragon_slayer', 'divine_robe', 'divine_gaiters', 'sigil_of_arcana', 'eternity_ring', 'venir_talisman'], chance: 0.35, rarityBoost: 3 }] },

  // World Bosses
  // [FIX 1] chance: 1.0 aqui era reduzida para 3% pelo cap antigo em rollDrop()
  queen_ant: { items: [{ id: 'crystal_c', chance: 1.0, amount: [3, 5] }], equipment: [{ pool: ['ring_queen_ant'], chance: 1.0, rarityBoost: 3 }] },
  zaken: { items: [{ id: 'crystal_b', chance: 1.0, amount: [3, 5] }], equipment: [{ pool: ['earring_of_zaken'], chance: 1.0, rarityBoost: 3 }] },
  baium: { items: [{ id: 'crystal_a', chance: 1.0, amount: [3, 5] }], equipment: [{ pool: ['ring_baium'], chance: 1.0, rarityBoost: 3 }] },
  antharas: { items: [{ id: 'crystal_s', chance: 1.0, amount: [5, 10] }, { id: 'dragon_scale', chance: 1.0, amount: [3, 5] }], equipment: [{ pool: ['earring_of_antharas', 'dragon_slayer'], chance: 1.0, rarityBoost: 4 }] },
  valakas: { items: [{ id: 'crystal_s', chance: 1.0, amount: [8, 15] }, { id: 'dragon_bone', chance: 1.0, amount: [5, 10] }], equipment: [{ pool: ['boss_facemask_valakas', 'necklace_of_valakas'], chance: 1.0, rarityBoost: 4 }] },

  // End-Game Hunting Zones (Imperial Tomb, Antharas Lair, Forge of Gods)
  tombGuardian: { items: [{ id: 'mithril_ore', chance: 0.3, amount: [2, 4] }], equipment: [{ pool: ['knight_armor', 'knight_gaiters', 'black_ore_earring'], chance: 0.20 }] },
  sepulcherArchon: { items: [{ id: 'magic_powder', chance: 0.4, amount: [5, 10] }, { id: 'crystal_c', chance: 0.3, amount: [1, 3] }], equipment: [{ pool: ['arcane_robe', 'arcane_stockings', 'sigil_of_mastery'], chance: 0.22 }] },
  undeadKnight: { items: [{ id: 'oriharukon', chance: 0.25, amount: [1, 2] }, { id: 'crystal_b', chance: 0.2, amount: [1, 2] }], equipment: [{ pool: ['blade_of_doom', 'titan_hammer', 'knight_shield'], chance: 0.25 }] },
  caveDrake: { items: [{ id: 'dragon_scale', chance: 0.3, amount: [1, 3] }], equipment: [{ pool: ['dragon_bow', 'steel_plate'], chance: 0.25 }] },
  magmaBeast: { items: [{ id: 'dragon_bone', chance: 0.3, amount: [1, 2] }, { id: 'crystal_b', chance: 0.3, amount: [2, 4] }], equipment: [{ pool: ['staff_of_magic', 'dragon_scale_armor'], chance: 0.28 }] },
  earthDrake: { items: [{ id: 'dragon_scale', chance: 0.5, amount: [3, 5] }, { id: 'crystal_a', chance: 0.4, amount: [2, 4] }], equipment: [{ pool: ['divine_sword', 'dragon_scale_armor', 'imperial_shield'], chance: 0.35, rarityBoost: 2 }] },
  lavaGolem: { items: [{ id: 'oriharukon', chance: 0.4, amount: [2, 4] }, { id: 'crystal_a', chance: 0.3, amount: [3, 5] }], equipment: [{ pool: ['divine_gaiters', 'dragon_circlet'], chance: 0.30 }] },
  flameArchon: { items: [{ id: 'ancient_relic', chance: 0.3, amount: [1, 3] }, { id: 'crystal_s', chance: 0.2, amount: [1, 2] }], equipment: [{ pool: ['staff_of_eternity', 'divine_robe'], chance: 0.32 }] },
  vulcanLord: { items: [{ id: 'ancient_relic', chance: 0.5, amount: [3, 6] }, { id: 'crystal_s', chance: 0.4, amount: [3, 6] }], equipment: [{ pool: ['dragon_slayer', 'chaos_blade', 'venir_talisman'], chance: 0.45, rarityBoost: 3 }] }
};

// ======================================
// CLASS-RESTRICTED GEAR (per-class exclusive)
// ======================================
const CLASS_WEAPONS = {
  warlords_greataxe: { name: "Warlord's Greataxe", slot: 'weapon', tier: 3, atk: 28, def: 4, speed: -2, req: { level: 25 }, price: 2500, classReq: 'fighter', desc: 'A brutal axe reserved for warlords.' },
  champion_blade: { name: 'Champion Blade', slot: 'weapon', tier: 4, atk: 48, crit: 6, def: 5, req: { level: 45 }, price: 9000, classReq: 'fighter', desc: 'Forged for arena champions.' },
  gladius_of_iron: { name: 'Gladius of Iron Will', slot: 'weapon', tier: 5, atk: 95, def: 15, lifesteal: 4, req: { level: 78 }, price: 32000, classReq: 'fighter', desc: 'The blade of the Iron Legion.' },
  arcane_wand: { name: 'Arcane Wand', slot: 'weapon', tier: 3, atk: 2, matk: 30, mdef: 6, req: { level: 25 }, price: 2500, classReq: 'mage', desc: 'A wand humming with arcane power.' },
  council_staff: { name: 'Staff of the Council', slot: 'weapon', tier: 4, atk: 4, matk: 55, mdef: 15, req: { level: 45 }, price: 9500, classReq: 'mage', desc: 'Bestowed upon the high council.' },
  starfall_staff: { name: 'Starfall Staff', slot: 'weapon', tier: 5, atk: 6, matk: 110, mdef: 25, crit: 8, req: { level: 78 }, price: 34000, classReq: 'mage', desc: 'Channels falling stars.' },
  master_hammer: { name: "Master's Forge Hammer", slot: 'weapon', tier: 3, atk: 20, def: 6, craftBonus: 0.25, lootBonus: 0.1, req: { level: 22 }, price: 2200, classReq: 'artisan', desc: '+25% craft XP, +10% loot.' },
  runic_anvil_mace: { name: 'Runic Anvil Mace', slot: 'weapon', tier: 4, atk: 42, def: 12, craftBonus: 0.4, req: { level: 45 }, price: 8500, classReq: 'artisan', desc: '+40% craft XP.' },
  shadow_fangs: { name: 'Shadow Fangs', slot: 'weapon', tier: 3, atk: 26, eva: 8, speed: 6, crit: 4, req: { level: 25 }, price: 2500, classReq: 'soulbreaker', desc: 'Twin blades of the shadow order.' },
  wraith_reavers: { name: 'Wraith Reavers', slot: 'weapon', tier: 4, atk: 44, eva: 12, speed: 8, lifesteal: 3, req: { level: 45 }, price: 9500, classReq: 'soulbreaker', desc: 'Drain the soul with each strike.' },
  void_talons: { name: 'Void Talons', slot: 'weapon', tier: 5, atk: 105, eva: 15, speed: 10, crit: 12, lifesteal: 6, req: { level: 78 }, price: 38000, classReq: 'soulbreaker', desc: 'Claws torn from the void itself.' }
};

const CLASS_ARMORS = {
  warlords_plate: { name: "Warlord's Plate", slot: 'armor', tier: 4, def: 55, mdef: 20, hp: 80, req: { level: 42 }, price: 9000, classReq: 'fighter', desc: 'Heavy plate forged for war.' },
  arcane_vestments: { name: 'Arcane Vestments', slot: 'armor', tier: 4, def: 18, mdef: 65, matk: 25, mp: 60, req: { level: 42 }, price: 9000, classReq: 'mage', desc: 'Silk woven with arcane thread.' },
  forge_apron: { name: 'Forge Apron', slot: 'armor', tier: 3, def: 22, mdef: 8, lootBonus: 0.15, craftBonus: 0.2, req: { level: 22 }, price: 2300, classReq: 'artisan', desc: '+15% loot, +20% craft XP.' },
  wraith_cloak: { name: 'Wraith Cloak', slot: 'armor', tier: 4, def: 20, mdef: 30, eva: 14, speed: 5, req: { level: 42 }, price: 9000, classReq: 'soulbreaker', desc: 'Phase through strikes.' },
  gladiator_helm: { name: 'Gladiator Helm', slot: 'helmet', tier: 4, def: 22, mdef: 8, hp: 40, req: { level: 40 }, price: 4000, classReq: 'fighter', desc: 'Crest of the arena victor.' },
  seers_circlet: { name: "Seer's Circlet", slot: 'helmet', tier: 4, def: 4, mdef: 25, matk: 12, mp: 40, req: { level: 40 }, price: 4500, classReq: 'mage', desc: 'Visions of the future.' },
  smiths_mask: { name: "Smith's Visor", slot: 'helmet', tier: 3, def: 12, mdef: 6, craftBonus: 0.15, req: { level: 22 }, price: 2000, classReq: 'artisan', desc: '+15% craft XP.' },
  phantom_mask: { name: 'Phantom Mask', slot: 'helmet', tier: 4, def: 8, mdef: 15, eva: 10, crit: 4, req: { level: 40 }, price: 4200, classReq: 'soulbreaker', desc: 'Hide in plain sight.' }
};

// ======================================
// POWERUPS (timed premium-style buffs)
// ======================================
const POWERUPS = {
  xp_boost_1h: { name: 'XP Tome (1h)', slot: 'powerup', type: 'xpBoost', amount: 0.5, duration: 3600, price: 500, stack: 9, desc: '+50% XP gain for 1 hour.' },
  xp_boost_4h: { name: 'XP Tome (4h)', slot: 'powerup', type: 'xpBoost', amount: 0.75, duration: 14400, price: 1600, stack: 9, desc: '+75% XP gain for 4 hours.' },
  gold_boost_1h: { name: 'Midas Coin (1h)', slot: 'powerup', type: 'goldBoost', amount: 0.5, duration: 3600, price: 500, stack: 9, desc: '+50% gold from kills for 1 hour.' },
  gold_boost_4h: { name: 'Midas Coin (4h)', slot: 'powerup', type: 'goldBoost', amount: 0.75, duration: 14400, price: 1600, stack: 9, desc: '+75% gold from kills for 4 hours.' },
  luck_boost_1h: { name: "Fortune's Eye (1h)", slot: 'powerup', type: 'luckBoost', amount: 0.3, duration: 3600, price: 750, stack: 9, desc: '+30% loot & rarity chance for 1 hour.' },
  auto_potion_1h: { name: 'Auto-Potion Charm (1h)', slot: 'powerup', type: 'autoPotion', amount: 1, duration: 3600, price: 1000, stack: 9, desc: 'Auto-uses best HP potion below 30% HP.' },
  teleport_scroll: { name: 'Teleport Scroll', slot: 'powerup', type: 'teleport', amount: 1, duration: 0, price: 200, stack: 99, desc: 'Instant zone change, no combat pause.' },
  berserker_elixir: { name: 'Berserker Elixir', slot: 'powerup', type: 'buff', stat: 'atk', amount: 25, duration: 600, price: 400, stack: 9, desc: '+25 ATK for 10 minutes.' },
  aegis_draught: { name: 'Aegis Draught', slot: 'powerup', type: 'buff', stat: 'def', amount: 25, duration: 600, price: 400, stack: 9, desc: '+25 DEF for 10 minutes.' },
  sages_tea: { name: "Sage's Tea", slot: 'powerup', type: 'buff', stat: 'matk', amount: 25, duration: 600, price: 400, stack: 9, desc: '+25 MATK for 10 minutes.' }
};

const ZONE_GOLD_MULT = {
  talkingIsland: 1, elvenForest: 1.2, darkForest: 1.4, orcVillage: 1.6,
  dwarvenMine: 1.8, kamaelLair: 2, giranOutskirts: 2.5, orcenRuins: 3,
  gludioCastle: 4, wolfMountain: 4.5, adenCity: 6, dragonValley: 8
};

const MYSTIC_POOL = [
  'knight_sword','assassins_blade','archmage_staff','elven_bow','warhammer','dark_katana',
  'blade_of_doom','soul_seeker','staff_of_magic','dragon_bow','titan_hammer','dual_swords',
  'knight_armor','arcane_robe','knight_helm','arcane_circlet','diamond_ring','onyx_ring','amethyst_ring',
  'warlords_greataxe','champion_blade','arcane_wand','council_staff','shadow_fangs','wraith_reavers',
  'forge_apron','wraith_cloak','gladiator_helm','seers_circlet','phantom_mask'
];

Object.assign(ALL_ITEMS, CLASS_WEAPONS, CLASS_ARMORS, POWERUPS);

const SHOP_INVENTORY = {
  talkingIsland: [
    { id: 'hp_potion_s', stock: 99 }, { id: 'mp_potion_s', stock: 99 },
    { id: 'soulshot_ng', stock: 999 }, { id: 'spiritshot_ng', stock: 999 },
    { id: 'wooden_sword', stock: 1 }, { id: 'training_dagger', stock: 1 },
    { id: 'oak_staff', stock: 1 }, { id: 'short_bow', stock: 1 },
    { id: 'cloth_robe', stock: 1 }, { id: 'leather_vest', stock: 1 },
    { id: 'cloth_pants', stock: 1 }, { id: 'leather_gaiters', stock: 1 },
    { id: 'wooden_shield', stock: 1 },
    { id: 'cloth_cap', stock: 1 }, { id: 'leather_helm', stock: 1 },
    { id: 'cloth_boots', stock: 1 }, { id: 'leather_boots', stock: 1 },
    { id: 'cloth_gloves', stock: 1 }, { id: 'leather_gloves', stock: 1 },
    { id: 'oak_necklace', stock: 1 }, { id: 'oak_earring', stock: 1 },
    { id: 'copper_ring', stock: 1 }, { id: 'novice_belt', stock: 1 },
    { id: 'adventurer_cloak', stock: 1 }, { id: 'talisman_novice', stock: 1 },
    { id: 'apprentice_circlet', stock: 1 }, { id: 'novice_mask', stock: 1 },
    { id: 'scroll_of_resurrection', stock: 99 },
    { id: 'scroll_race_class_change', stock: 99 }
  ],
  giranOutskirts: [
    { id: 'hp_potion_m', stock: 99 }, { id: 'mp_potion_m', stock: 99 },
    { id: 'soulshot_ng', stock: 999 }, { id: 'spiritshot_ng', stock: 999 },
    { id: 'enchant_weapon_scroll', stock: 99 }, { id: 'enchant_armor_scroll', stock: 99 },
    { id: 'iron_sword', stock: 1 }, { id: 'steel_dagger', stock: 1 },
    { id: 'crystal_staff', stock: 1 }, { id: 'composite_bow', stock: 1 },
    { id: 'iron_armor', stock: 1 }, { id: 'mage_robe', stock: 1 },
    { id: 'iron_gaiters', stock: 1 }, { id: 'mage_stockings', stock: 1 },
    { id: 'bronze_shield', stock: 1 }, { id: 'sigil_of_devotion', stock: 1 },
    { id: 'iron_helm', stock: 1 }, { id: 'mage_hood', stock: 1 },
    { id: 'iron_boots', stock: 1 }, { id: 'mage_sandals', stock: 1 },
    { id: 'iron_gauntlets', stock: 1 }, { id: 'mage_gloves', stock: 1 },
    { id: 'elven_necklace', stock: 1 }, { id: 'elven_earring', stock: 1 },
    { id: 'silver_ring', stock: 1 }, { id: 'mithril_belt', stock: 1 },
    { id: 'cloak_of_valor', stock: 1 }, { id: 'talisman_protection', stock: 1 },
    { id: 'bronze_feather_circlet', stock: 1 }, { id: 'assassin_mask', stock: 1 },
    { id: 'attack_potion', stock: 99 }, { id: 'defense_potion', stock: 99 },
    { id: 'scroll_of_resurrection', stock: 99 }
  ],
  gludioCastle: [
    { id: 'hp_potion_l', stock: 99 }, { id: 'mp_potion_l', stock: 99 },
    { id: 'knight_sword', stock: 1 }, { id: 'assassins_blade', stock: 1 },
    { id: 'archmage_staff', stock: 1 }, { id: 'elven_bow', stock: 1 },
    { id: 'steel_plate', stock: 1 }, { id: 'shadow_cloak', stock: 1 }, { id: 'elven_garb', stock: 1 },
    { id: 'steel_gaiters', stock: 1 }, { id: 'shadow_pants', stock: 1 },
    { id: 'steel_shield', stock: 1 }, { id: 'sigil_of_grace', stock: 1 },
    { id: 'steel_helm', stock: 1 }, { id: 'shadow_mask', stock: 1 },
    { id: 'steel_boots', stock: 1 }, { id: 'shadow_boots', stock: 1 },
    { id: 'steel_gauntlets', stock: 1 }, { id: 'shadow_gloves', stock: 1 },
    { id: 'necklace_of_grace', stock: 1 }, { id: 'earring_of_grace', stock: 1 },
    { id: 'gold_ring', stock: 1 }, { id: 'ruby_ring', stock: 1 },
    { id: 'emerald_ring', stock: 1 }, { id: 'sapphire_ring', stock: 1 },
    { id: 'belt_of_power', stock: 1 }, { id: 'cloak_of_freedom', stock: 1 },
    { id: 'talisman_of_power', stock: 1 }, { id: 'silver_tiara', stock: 1 },
    { id: 'phantom_mask_gear', stock: 1 },
    { id: 'speed_potion', stock: 99 }, { id: 'scroll_of_rebirth', stock: 99 }
  ],
  adenCity: [
    { id: 'hp_potion_xl', stock: 99 }, { id: 'mp_potion_xl', stock: 99 },
    { id: 'blade_of_doom', stock: 1 }, { id: 'soul_seeker', stock: 1 },
    { id: 'staff_of_magic', stock: 1 }, { id: 'dragon_bow', stock: 1 },
    { id: 'titan_hammer', stock: 1 }, { id: 'dual_swords', stock: 1 },
    { id: 'knight_armor', stock: 1 }, { id: 'arcane_robe', stock: 1 },
    { id: 'knight_gaiters', stock: 1 }, { id: 'arcane_stockings', stock: 1 },
    { id: 'knight_shield', stock: 1 }, { id: 'sigil_of_mastery', stock: 1 },
    { id: 'knight_helm', stock: 1 }, { id: 'arcane_circlet', stock: 1 },
    { id: 'knight_boots', stock: 1 }, { id: 'arcane_boots', stock: 1 },
    { id: 'knight_gauntlets', stock: 1 }, { id: 'arcane_gloves', stock: 1 },
    { id: 'black_ore_necklace', stock: 1 }, { id: 'black_ore_earring', stock: 1 },
    { id: 'diamond_ring', stock: 1 }, { id: 'onyx_ring', stock: 1 }, { id: 'amethyst_ring', stock: 1 },
    { id: 'champion_belt', stock: 1 }, { id: 'cloak_of_shadows_gear', stock: 1 },
    { id: 'talisman_of_eva', stock: 1 }, { id: 'noble_gold_crown', stock: 1 },
    { id: 'executioner_mask', stock: 1 },
    { id: 'scroll_of_rebirth', stock: 99 }
  ],
  dragonValley: [
    { id: 'divine_sword', stock: 1 }, { id: 'staff_of_eternity', stock: 1 },
    { id: 'bow_of_silence', stock: 1 }, { id: 'dragon_slayer', stock: 1 },
    { id: 'chaos_blade', stock: 1 },
    { id: 'divine_robe', stock: 1 }, { id: 'dragon_scale_armor', stock: 1 },
    { id: 'divine_gaiters', stock: 1 }, { id: 'dragon_scale_gaiters', stock: 1 },
    { id: 'imperial_shield', stock: 1 }, { id: 'sigil_of_arcana', stock: 1 },
    { id: 'divine_crown', stock: 1 }, { id: 'dragon_circlet', stock: 1 },
    { id: 'divine_boots', stock: 1 }, { id: 'dragon_boots', stock: 1 },
    { id: 'divine_gloves', stock: 1 }, { id: 'dragon_gauntlets', stock: 1 },
    { id: 'necklace_of_valakas', stock: 1 }, { id: 'earring_of_antharas', stock: 1 },
    { id: 'earring_of_zaken', stock: 1 }, { id: 'dragon_eye_ring', stock: 1 },
    { id: 'eternity_ring', stock: 1 }, { id: 'dragon_belt', stock: 1 },
    { id: 'ancient_cloak_of_aden', stock: 1 }, { id: 'venir_talisman', stock: 1 },
    { id: 'essence_crown_of_aden', stock: 1 }, { id: 'boss_facemask_valakas', stock: 1 },
    { id: 'ancient_relic', stock: 99 }
  ]
};

const CRAFTING_RECIPES = {
  // Weapons
  iron_sword: { id: 'iron_sword', materials: { iron_ore: 5, cloth: 2 }, level: 1 },
  steel_dagger: { id: 'steel_dagger', materials: { iron_ore: 4, leather: 2 }, level: 1 },
  crystal_staff: { id: 'crystal_staff', materials: { iron_ore: 3, crystal_fragment: 5, magic_powder: 2 }, level: 1 },
  composite_bow: { id: 'composite_bow', materials: { iron_ore: 3, leather: 4, beast_blood: 2 }, level: 1 },
  bronze_mace: { id: 'bronze_mace', materials: { iron_ore: 6 }, level: 1 },
  orcish_axe: { id: 'orcish_axe', materials: { iron_ore: 8, steel_ingot: 2 }, level: 1 },

  // Armors & Legs
  iron_armor: { id: 'iron_armor', materials: { iron_ore: 10, leather: 5 }, level: 1 },
  mage_robe: { id: 'mage_robe', materials: { cloth: 15, magic_powder: 5 }, level: 1 },
  cloth_pants: { id: 'cloth_pants', materials: { cloth: 4 }, level: 1 },
  leather_gaiters: { id: 'leather_gaiters', materials: { leather: 4, iron_ore: 2 }, level: 1 },
  iron_gaiters: { id: 'iron_gaiters', materials: { iron_ore: 8, leather: 3 }, level: 10 },
  mage_stockings: { id: 'mage_stockings', materials: { cloth: 10, magic_powder: 3 }, level: 12 },

  // Shields & Sigils
  wooden_shield: { id: 'wooden_shield', materials: { iron_ore: 3, cloth: 2 }, level: 1 },
  bronze_shield: { id: 'bronze_shield', materials: { iron_ore: 6 }, level: 10 },
  sigil_of_devotion: { id: 'sigil_of_devotion', materials: { cloth: 8, magic_powder: 4 }, level: 12 },

  // Accessories (Necklace, Earring, Belt, Cloak, Talisman, Hair, Mask)
  oak_necklace: { id: 'oak_necklace', materials: { cloth: 3, magic_powder: 1 }, level: 1 },
  oak_earring: { id: 'oak_earring', materials: { iron_ore: 2, cloth: 2 }, level: 1 },
  novice_belt: { id: 'novice_belt', materials: { leather: 3, iron_ore: 1 }, level: 1 },
  adventurer_cloak: { id: 'adventurer_cloak', materials: { cloth: 5 }, level: 1 },
  talisman_novice: { id: 'talisman_novice', materials: { magic_powder: 2, cloth: 2 }, level: 1 },
  apprentice_circlet: { id: 'apprentice_circlet', materials: { cloth: 3 }, level: 1 },
  novice_mask: { id: 'novice_mask', materials: { leather: 2, cloth: 2 }, level: 1 },

  // Mid Tier Gear (Lv. 20-40)
  knight_sword: { id: 'knight_sword', materials: { steel_ingot: 8, mithril_ore: 2, crystal_d: 15 }, level: 20 },
  steel_plate: { id: 'steel_plate', materials: { steel_ingot: 15, mithril_ore: 3, leather: 8, crystal_d: 20 }, level: 20 },
  steel_gaiters: { id: 'steel_gaiters', materials: { steel_ingot: 10, mithril_ore: 2, crystal_d: 15 }, level: 20 },
  steel_shield: { id: 'steel_shield', materials: { steel_ingot: 10, crystal_d: 15 }, level: 20 },
  shadow_cloak: { id: 'shadow_cloak', materials: { cloth: 20, beast_blood: 10, magic_powder: 5, crystal_d: 20 }, level: 20 },
  archmage_staff: { id: 'archmage_staff', materials: { steel_ingot: 5, crystal_fragment: 15, magic_powder: 10, crystal_d: 25 }, level: 22 },
  elven_necklace: { id: 'elven_necklace', materials: { magic_powder: 6, crystal_d: 10 }, level: 20 },
  elven_earring: { id: 'elven_earring', materials: { magic_powder: 4, crystal_d: 10 }, level: 20 },
  mithril_belt: { id: 'mithril_belt', materials: { mithril_ore: 3, leather: 8, crystal_d: 10 }, level: 20 },
  cloak_of_valor: { id: 'cloak_of_valor', materials: { cloth: 15, beast_blood: 5, crystal_d: 10 }, level: 20 },
  talisman_protection: { id: 'talisman_protection', materials: { magic_powder: 10, crystal_d: 10 }, level: 20 },

  // High Tier Gear (Lv. 40-76)
  blade_of_doom: { id: 'blade_of_doom', materials: { steel_ingot: 20, mithril_ore: 8, oriharukon: 2, crystal_c: 30 }, level: 40 },
  knight_armor: { id: 'knight_armor', materials: { steel_ingot: 25, mithril_ore: 10, oriharukon: 3, crystal_c: 40 }, level: 40 },
  knight_gaiters: { id: 'knight_gaiters', materials: { steel_ingot: 18, mithril_ore: 6, crystal_c: 30 }, level: 40 },
  knight_shield: { id: 'knight_shield', materials: { steel_ingot: 18, mithril_ore: 5, crystal_c: 25 }, level: 40 },
  arcane_robe: { id: 'arcane_robe', materials: { cloth: 30, crystal_fragment: 25, magic_powder: 20, crystal_c: 40 }, level: 40 },
  arcane_stockings: { id: 'arcane_stockings', materials: { cloth: 25, magic_powder: 15, crystal_c: 30 }, level: 42 },
  sigil_of_mastery: { id: 'sigil_of_mastery', materials: { cloth: 20, magic_powder: 15, crystal_c: 25 }, level: 42 },
  black_ore_necklace: { id: 'black_ore_necklace', materials: { mithril_ore: 5, magic_powder: 15, crystal_c: 20 }, level: 60 },
  black_ore_earring: { id: 'black_ore_earring', materials: { mithril_ore: 4, magic_powder: 10, crystal_c: 20 }, level: 60 },
  champion_belt: { id: 'champion_belt', materials: { leather: 20, steel_ingot: 10, crystal_c: 20 }, level: 60 },
  cloak_of_shadows_gear: { id: 'cloak_of_shadows_gear', materials: { cloth: 25, beast_blood: 15, crystal_c: 20 }, level: 60 },
  talisman_of_eva: { id: 'talisman_of_eva', materials: { magic_powder: 25, crystal_fragment: 15, crystal_c: 20 }, level: 60 },
  noble_gold_crown: { id: 'noble_gold_crown', materials: { steel_ingot: 15, mithril_ore: 5, crystal_c: 20 }, level: 60 },
  executioner_mask: { id: 'executioner_mask', materials: { leather: 20, beast_blood: 10, crystal_c: 20 }, level: 60 },

  titan_hammer: { id: 'titan_hammer', materials: { steel_ingot: 30, mithril_ore: 15, oriharukon: 5, crystal_b: 20 }, level: 48 },
  dual_swords: { id: 'dual_swords', materials: { steel_ingot: 35, mithril_ore: 15, oriharukon: 5, crystal_b: 40 }, level: 50 },

  divine_sword: { id: 'divine_sword', materials: { steel_ingot: 40, oriharukon: 8, dragon_scale: 5, ancient_relic: 1, crystal_a: 50, crystal_s: 10 }, level: 76 },
  dragon_slayer: { id: 'dragon_slayer', materials: { steel_ingot: 50, oriharukon: 15, dragon_scale: 20, crystal_s: 30 }, level: 76 },
  angel_slayer: { id: 'angel_slayer', materials: { steel_ingot: 45, oriharukon: 12, dragon_scale: 15, crystal_s: 25 }, level: 76 },
  arcana_mace: { id: 'arcana_mace', materials: { magic_powder: 40, crystal_fragment: 30, ancient_relic: 3, crystal_s: 30 }, level: 76 },
  draconic_bow: { id: 'draconic_bow', materials: { steel_ingot: 45, leather: 30, dragon_bone: 15, crystal_s: 28 }, level: 76 },
  imperial_crusader_breastplate: { id: 'imperial_crusader_breastplate', materials: { steel_ingot: 60, oriharukon: 20, dragon_scale: 20, crystal_s: 35 }, level: 76 },
  draconic_leather_armor: { id: 'draconic_leather_armor', materials: { leather: 60, dragon_scale: 25, crystal_s: 35 }, level: 76 },
  major_arcana_robe: { id: 'major_arcana_robe', materials: { cloth: 60, magic_powder: 40, ancient_relic: 4, crystal_s: 35 }, level: 76 },
  dragon_scale_armor: { id: 'dragon_scale_armor', materials: { steel_ingot: 50, oriharukon: 10, dragon_scale: 15, dragon_bone: 5, crystal_a: 60, crystal_s: 20 }, level: 76 },
  divine_gaiters: { id: 'divine_gaiters', materials: { steel_ingot: 35, oriharukon: 6, dragon_scale: 10, crystal_a: 40, crystal_s: 15 }, level: 76 },
  imperial_shield: { id: 'imperial_shield', materials: { steel_ingot: 35, dragon_scale: 8, crystal_a: 35, crystal_s: 10 }, level: 76 },
  sigil_of_arcana: { id: 'sigil_of_arcana', materials: { cloth: 35, magic_powder: 25, crystal_a: 35, crystal_s: 10 }, level: 76 },
  necklace_of_valakas: { id: 'necklace_of_valakas', materials: { oriharukon: 10, dragon_scale: 15, ancient_relic: 2, crystal_s: 30 }, level: 76 },
  earring_of_antharas: { id: 'earring_of_antharas', materials: { oriharukon: 8, dragon_bone: 10, crystal_s: 25 }, level: 76 }
};

// ROLETA DE RARIDADE E REBALANÇO DE DROPS:
// Equipamentos completos tem apenas 3% de chance de drop direto (mobs comuns).
// Dentro desses 3%, a chance de ser Lendário é de apenas 0.5% (0.005).
// 97% do foco dos drops é em Materiais de Craft para alimentar a Forja.
// World bosses com chance >= 1.0 continuam com drop garantido. [FIX 1]
function rollRarity(bonus = 0) {
  const r = Math.random();
  if (r < 0.005 + bonus * 0.005) return 'legendary'; // 0.5% Lendário
  if (r < 0.045 + bonus * 0.01) return 'epic';       // 4% Épico
  if (r < 0.15 + bonus * 0.02) return 'rare';        // 10.5% Raro
  if (r < 0.45 + bonus * 0.03) return 'uncommon';    // 30% Incomum
  return 'common';                                   // ~55% Comum
}

function rollDrop(target, lootBonus = 1) {
  const monsterDrops = MONSTER_DROPS[target];
  if (!monsterDrops) return [];

  const drops = [];
  const chanceMultiplier = Math.max(0.1, lootBonus || 1);

  // 1. Materiais de Craft e Consumíveis (Foco Principal ~97%)
  for (const itemDrop of monsterDrops.items || []) {
    // [FIX 12] chance nunca passa de 100% mesmo com lootBonus alto
    const boostedChance = Math.min(1, Math.min(0.95, (itemDrop.chance || 0.2) * 1.8) * chanceMultiplier);
    if (Math.random() < boostedChance) {
      const baseAmount = Array.isArray(itemDrop.amount) && itemDrop.amount.length === 2
        ? itemDrop.amount[0] + Math.floor(Math.random() * (itemDrop.amount[1] - itemDrop.amount[0] + 1))
        : (itemDrop.amount ?? 1);
      const amount = Math.max(1, Math.floor(baseAmount * 1.5));
      drops.push({ id: itemDrop.id, amount, isEquipment: false });
    }
  }

  // 2. Equipamentos Completos (Armas, Armaduras, Joias)
  for (const equipmentDrop of monsterDrops.equipment || []) {
    const rawChance = equipmentDrop.chance || 0.03;
    // [FIX 1] cap de 3% valia só para mobs comuns no design original;
    // o Math.min(0.03, ...) antigo esmagava drops garantidos de world
    // bosses (chance: 1.0 virava 3%). Agora: mobs comuns seguem capped
    // em 3%, chance >= 1 (boss) permanece garantida.
    const cap = rawChance >= 1 ? 1 : 0.03;
    const cappedChance = Math.min(cap, rawChance) * chanceMultiplier;
    if (Math.random() < cappedChance) {
      const pool = equipmentDrop.pool || [];
      if (!pool.length) continue;
      const id = pool[Math.floor(Math.random() * pool.length)];
      if (!ALL_ITEMS[id]) continue; // [FIX 12] id inválido no pool não vira drop fantasma
      const rarity = rollRarity(equipmentDrop.rarityBoost || 0);
      drops.push({ id, rarity, isEquipment: true });
    }
  }

  return drops;
}

function getMysticRotation() {
  const cycleMs = 5 * 60 * 1000;
  const cycle = Math.floor(Date.now() / cycleMs);
  const msLeft = cycleMs - (Date.now() % cycleMs);
  // [FIX 2] cycle * 2654435761 estoura 2^53 em float64 e perde os bits
  // baixos -> ciclos vizinhos geravam seeds iguais. Math.imul multiplica
  // em 32 bits exatos.
  let seed = Math.imul(cycle, 2654435761) >>> 0;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const picks = [];
  const pool = [...MYSTIC_POOL];
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(rnd() * pool.length);
    const id = pool.splice(idx, 1)[0];
    const rarityRoll = rnd();
    const rarity = rarityRoll < 0.1 ? 'legendary' : rarityRoll < 0.35 ? 'epic' : 'rare';
    picks.push({ id, rarity, msLeft });
  }
  return picks;
}

function rollItemWithRarity(itemId, rarity) {
  // [FIX 4] ALL_ITEMS[itemId] undefined -> JSON.parse("undefined") lançava
  // SyntaxError e derrubava o loop de loot inteiro. Agora valida antes.
  const source = ALL_ITEMS[itemId];
  if (!source) {
    console.warn('[items] rollItemWithRarity: id desconhecido ignorado ->', itemId);
    return null;
  }
  const base = JSON.parse(JSON.stringify(source));
  base.rarity = RARITY[rarity] ? rarity : 'common'; // [FIX 4] raridade inválida vira common
  const mult = RARITY[base.rarity].mult;
  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (base[k]) {
      // [FIX 3] Math.floor em negativo piorava penalidades:
      // floor(-3 * 2.4) = -8 (e não -7). Round simétrico preserva o tamanho
      // real da penalidade de speed (warhammer, titan_hammer, dragon_slayer...)
      base[k] = base[k] < 0
        ? -Math.round(Math.abs(base[k]) * mult)
        : Math.floor(base[k] * mult);
    }
  });
  return base;
}

const ICON_MAP = {
  "accessory_cat_ear_i00": "accessory_cat_ear_i00.png",
  "accessory_crown_i00": "accessory_crown_i00.png",
  "accessory_earring_of_orfen_i03": "accessory_earring_of_orfen_i03.png",
  "accessory_ring_of_core_i03": "accessory_ring_of_core_i03.png",
  "accessory_ring_of_queen_ant_i03": "accessory_ring_of_queen_ant_i03.png",
  "adena": "adena.png",
  "aegis_draught": "aegis_draught.png",
  "agathion_angel": "agathion_angel.png",
  "agathion_aquarius": "agathion_aquarius.png",
  "agathion_capricorn": "agathion_capricorn.png",
  "agathion_dragon_child": "agathion_dragon_child.png",
  "agathion_gemini": "agathion_gemini.png",
  "agathion_leo": "agathion_leo.png",
  "agathion_pegasus": "agathion_pegasus.png",
  "agathion_rudolph": "agathion_rudolph.png",
  "agathion_sagitarius": "agathion_sagitarius.png",
  "agathion_scorpion": "agathion_scorpion.png",
  "agathion_taurus": "agathion_taurus.png",
  "agathion_valakas_mini": "agathion_valakas_mini.png",
  "agathion_virgo": "agathion_virgo.png",
  "aghation_libra": "aghation_libra.png",
  "amethyst_ring": "amethyst_ring.png",
  "anais_first": "anais_first.png",
  "anakim_pistols": "anakim_pistols.png",
  "ancient_adena": "ancient_adena.png",
  "ancient_cloak_of_aden": "ancient_cloak_of_aden.png",
  "ancient_relic": "ancient_relic.png",
  "angel_slayer": "angel_slayer.png",
  "antidote": "antidote.png",
  "apprentice_circlet": "apprentice_circlet.png",
  "arcana_mace": "arcana_mace.png",
  "arcane_boots": "arcane_boots.png",
  "arcane_circlet": "divine_crown.png",
  "arcane_gloves": "arcane_gloves.png",
  "arcane_robe": "arcane_robe.png",
  "arcane_stockings": "devotion_pants_robe.png",
  "arcane_vestments": "arcane_vestments.png",
  "arcane_wand": "arcane_wand.png",
  "archmage_staff": "archmage_staff.png",
  "assassins_blade": "assassins_blade.png",
  "assassin_mask": "assassin_mask.png",
  "attack_potion": "attack_potion.png",
  "auto_potion_1h": "auto_potion_1h.png",
  "avadon_heavy_armor": "avadon_heavy_armor.png",
  "avadon_heavy_boots": "avadon_heavy_boots.png",
  "avadon_heavy_gloves": "avadon_heavy_gloves.png",
  "avadon_heavy_helmet": "avadon_heavy_helmet.png",
  "avadon_heavy_pants": "avadon_heavy_pants.png",
  "avadon_helmet": "avadon_helmet.png",
  "avadon_light_armor": "avadon_light_armor.png",
  "avadon_light_boots": "avadon_light_boots.png",
  "avadon_light_gloves": "avadon_light_gloves.png",
  "avadon_robe_armor": "avadon_robe_armor.png",
  "avadon_robe_gloves": "avadon_robe_gloves.png",
  "avadon_shield": "avadon_shield.png",
  "baium_dagger": "baium_dagger.png",
  "beast_blood": "beast_blood.png",
  "beleth_staff": "beleth_staff.png",
  "belt": "belt.png",
  "belt_of_power": "belt_of_power.png",
  "berserker_elixir": "berserker_elixir.png",
  "black_ore_earring": "black_ore_earring.png",
  "black_ore_necklace": "black_ore_necklace.png",
  "blade_of_doom": "blade_of_doom.png",
  "blessed_belt": "blessed_belt.png",
  "blue wolf_heavy_armor": "blue wolf_heavy_armor.png",
  "bluewolf_heavy_armor": "blue wolf_heavy_armor.png",
  "blue wolf_heavy_boots": "blue wolf_heavy_boots.png",
  "bluewolf_heavy_boots": "blue wolf_heavy_boots.png",
  "blue wolf_heavy_gloves": "blue wolf_heavy_gloves.png",
  "bluewolf_heavy_gloves": "blue wolf_heavy_gloves.png",
  "blue wolf_heavy_pants": "blue wolf_heavy_pants.png",
  "bluewolf_heavy_pants": "blue wolf_heavy_pants.png",
  "blue wolf_helmet": "blue wolf_helmet.png",
  "bluewolf_helmet": "blue wolf_helmet.png",
  "blue wolf_light_armor": "blue wolf_light_armor.png",
  "bluewolf_light_armor": "blue wolf_light_armor.png",
  "blue wolf_light_boots": "blue wolf_light_boots.png",
  "bluewolf_light_boots": "blue wolf_light_boots.png",
  "blue wolf_light_gloves": "blue wolf_light_gloves.png",
  "bluewolf_light_gloves": "blue wolf_light_gloves.png",
  "blue wolf_robe_armor": "blue wolf_robe_armor.png",
  "bluewolf_robe_armor": "blue wolf_robe_armor.png",
  "blue wolf_robe_boots": "blue wolf_robe_boots.png",
  "bluewolf_robe_boots": "blue wolf_robe_boots.png",
  "blue wolf_robe_gloves": "blue wolf_robe_gloves.png",
  "bluewolf_robe_gloves": "blue wolf_robe_gloves.png",
  "blue wolf_robe_pants": "blue wolf_robe_pants.png",
  "bluewolf_robe_pants": "blue wolf_robe_pants.png",
  "blue_wolf_boots": "blue_wolf_boots.png",
  "blue_wolf_breastplate": "blue_wolf_breastplate.png",
  "blue_wolf_gaiters": "blue_wolf_gaiters.png",
  "blue_wolf_gloves": "blue_wolf_gloves.png",
  "blue_wolf_heavy_armor": "blue_wolf_heavy_armor.png",
  "blue_wolf_heavy_boots": "blue_wolf_heavy_boots.png",
  "blue_wolf_heavy_gloves": "blue_wolf_heavy_gloves.png",
  "blue_wolf_heavy_pants": "blue_wolf_heavy_pants.png",
  "blue_wolf_helmet": "blue_wolf_helmet.png",
  "blue_wolf_leather_armor": "blue_wolf_light_armor.png",
  "blue_wolf_light_armor": "blue_wolf_light_armor.png",
  "blue_wolf_light_boots": "blue_wolf_light_boots.png",
  "blue_wolf_light_gloves": "blue_wolf_light_gloves.png",
  "blue_wolf_robe_boots": "blue_wolf_robe_boots.png",
  "blue_wolf_robe_gloves": "blue_wolf_robe_gloves.png",
  "blue_wolf_tunic": "blue_wolf_tunic.png",
  "boots_evasion": "boots_evasion.png",
  "bossweapon_box": "bossweapon_box.png",
  "boss_facemask_valakas": "boss_facemask_valakas.png",
  "bow_of_silence": "bow_of_silence.png",
  "branch": "branch.png",
  "brigandine_armor_heavy": "brigandine_armor_heavy.png",
  "brigandine_pants_heavy": "brigandine_pants_heavy.png",
  "bronze_chest": "bronze_chest.png",
  "bronze_feather_circlet": "bronze_feather_circlet.png",
  "bronze_mace": "bronze_mace.png",
  "bronze_shield": "bronze_shield.png",
  "capared": "capared.png",
  "capawhite": "capawhite.png",
  "chain_belt": "chain_belt.png",
  "champion_blade": "champion_blade.png",
  "chaos_blade": "chaos_blade.png",
  "cloak_of_freedom": "cloak_of_freedom.png",
  "cloak_of_shadows_gear": "cloak_of_shadows_gear.png",
  "cloth": "cloth.png",
  "cloth_boots": "cloth_boots.png",
  "cloth_cap": "cloth_cap.png",
  "cloth_gloves": "cloth_gloves.png",
  "cloth_pants": "cloth_pants.png",
  "cloth_robe": "cloth_robe.png",
  "composite_bow": "composite_bow.png",
  "copper_ring": "copper_ring.png",
  "core_bow": "core_bow.png",
  "council_staff": "council_staff.png",
  "crystal_a": "crystal_a.png",
  "crystal_b": "crystal_b.png",
  "crystal_c": "crystal_c.png",
  "crystal_d": "crystal_d.png",
  "crystal_fragment": "crystal_fragment.png",
  "crystal_s": "crystal_s.png",
  "crystal_staff": "crystal_staff.png",
  "darkelf_fighter": "darkelf_fighter.png",
  "darkelf_mage": "darkelf_mage.png",
  "dark_crystal_heavy_armor": "dark_crystal_heavy_armor.png",
  "dark_crystal_heavy_boots": "dark_crystal_heavy_boots.png",
  "dark_crystal_heavy_glove": "dark_crystal_heavy_glove.png",
  "dark_crystal_heavy_pants": "dark_crystal_heavy_pants.png",
  "dark_crystal_light_armor": "dark_crystal_light_armor.png",
  "dark_crystal_light_boots": "dark_crystal_light_boots.png",
  "dark_crystal_light_glove": "dark_crystal_light_glove.png",
  "dark_crystal_light_pants": "dark_crystal_light_pants.png",
  "dark_crystal_robe_armor": "dark_crystal_robe_armor.png",
  "dark_crystal_robe_boots": "dark_crystal_robe_boots.png",
  "dark_crystal_robe_glove": "dark_crystal_robe_glove.png",
  "dark_crystal_shield": "dark_crystal_shield.png",
  "dark_katana": "dark_katana.png",
  "defense_potion": "defense_potion.png",
  "demon_cloack": "demon_cloack.png",
  "devilbone": "devilbone.png",
  "devotion_armor_robe": "devotion_armor_robe.png",
  "devotion_pants_robe": "devotion_pants_robe.png",
  "diamond_ring": "diamond_ring.png",
  "divine_boots": "divine_boots.png",
  "divine_crown": "divine_crown.png",
  "divine_gaiters": "divine_gaiters.png",
  "divine_gloves": "divine_gloves.png",
  "divine_robe": "divine_robe.png",
  "divine_sword": "divine_sword.png",
  "doom_light_armor": "doom_light_armor.png",
  "doom_light_boots": "doom_light_boots.png",
  "doom_light_gloves": "doom_light_gloves.png",
  "doom_light_helmet": "doom_light_helmet.png",
  "doom_shield": "doom_shield.png",
  "draconic_armor": "draconic_armor.png",
  "draconic_boots": "draconic_boots.png",
  "draconic_bow": "draconic_bow.png",
  "draconic_bow_sa": "draconic_bow_sa.png",
  "draconic_gloves": "draconic_gloves.png",
  "draconic_helmet": "draconic_helmet.png",
  "draconic_leather_armor": "draconic_leather_armor.png",
  "dragon_belt": "dragon_belt.png",
  "dragon_bone": "dragon_bone.png",
  "dragon_boots": "dragon_boots.png",
  "dragon_bow": "dragon_bow.png",
  "dragon_circlet": "dragon_circlet.png",
  "dragon_eye_ring": "dragon_eye_ring.png",
  "dragon_gauntlets": "dragon_gauntlets.png",
  "dragon_scale": "dragon_scale.png",
  "dragon_scale_armor": "dragon_scale_armor.png",
  "dragon_scale_gaiters": "dragon_scale_gaiters.png",
  "dragon_slayer": "dragon_slayer.png",
  "dual_swords": "dual_swords.png",
  "dwarf_artisan": "dwarf_artisan.png",
  "dwarvenmine": "dwarvenmine.png",
  "dynasti_heavey_armor": "dynasti_heavey_armor.png",
  "dynasti_heavy_pants": "dynasti_heavy_pants.png",
  "dynasti_light_armor": "dynasti_light_armor.png",
  "dynasti_light_pants": "dynasti_light_pants.png",
  "dynasti_robe_armor": "dynasti_robe_armor.png",
  "dynasti_robe_pants": "dynasti_robe_pants.png",
  "dynasty_blade": "dynasty_blade.png",
  "dynasty_bow": "dynasty_bow.png",
  "dynasty_leather": "dynasty_leather.png",
  "dynasty_phantom": "dynasty_phantom.png",
  "earring_of_antharas": "earring_of_antharas.png",
  "earring_of_grace": "earring_of_grace.png",
  "earring_of_zaken": "earring_of_zaken.png",
  "elegia_bow": "elegia_bow.png",
  "elegia_breastplate": "elegia_breastplate.png",
  "elegia_cutters": "elegia_cutters.png",
  "elegia_robe": "elegia_robe.png",
  "elf_fighter": "elf_fighter.png",
  "elf_mage": "elf_mage.png",
  "elven_bow": "elven_bow.png",
  "elven_earring": "elven_earring.png",
  "elven_garb": "elven_garb.png",
  "elven_necklace": "elven_necklace.png",
  "emerald_cloack": "emerald_cloack.png",
  "emerald_ring": "emerald_ring.png",
  "essence_crown": "essence_crown.png",
  "essence_crown_of_aden": "essence_crown_of_aden.png",
  "etc_key": "etc_key.png",
  "etc_party_mask_i00": "etc_party_mask_i00.png",
  "etc_party_mask_i01": "etc_party_mask_i01.png",
  "etc_recipe_grades": "etc_recipe_grades.png",
  "etc_red_letter": "etc_red_letter.png",
  "eternity_ring": "eternity_ring.png",
  "executioner_mask": "executioner_mask.png",
  "exp_scroll": "exp_scroll.png",
  "flame_armor": "flame_armor.png",
  "flame_gloves": "flame_gloves.png",
  "flame_pants": "flame_pants.png",
  "forge_apron": "forge_apron.png",
  "full plate_heavy_armor": "full plate_heavy_armor.png",
  "fullplate_heavy_armor": "full plate_heavy_armor.png",
  "full plate_heavy_boots": "full plate_heavy_boots.png",
  "fullplate_heavy_boots": "full plate_heavy_boots.png",
  "full plate_heavy_gloves": "full plate_heavy_gloves.png",
  "fullplate_heavy_gloves": "full plate_heavy_gloves.png",
  "full plate_heavy_helmet": "full plate_heavy_helmet.png",
  "fullplate_heavy_helmet": "full plate_heavy_helmet.png",
  "full plate_shield": "full plate_shield.png",
  "fullplate_shield": "full plate_shield.png",
  "full_plate_heavy_armor": "full_plate_heavy_armor.png",
  "full_plate_heavy_boots": "full_plate_heavy_boots.png",
  "full_plate_heavy_gloves": "full_plate_heavy_gloves.png",
  "full_plate_heavy_helmet": "full_plate_heavy_helmet.png",
  "full_plate_shield": "full_plate_shield.png",
  "fur_cloack": "fur_cloack.png",
  "galaxias_ancient_sword": "galaxias_ancient_sword.png",
  "ghost_cloack": "ghost_cloack.png",
  "giranoutskirts": "giranoutskirts.png",
  "gladiator_helm": "gladiator_helm.png",
  "gladius_of_iron": "gladius_of_iron.png",
  "goblin_ear": "goblin_ear.png",
  "gold_boost_1h": "gold_boost_1h.png",
  "gold_boost_4h": "gold_boost_4h.png",
  "gold_panel": "gold_panel.png",
  "gold_ring": "gold_ring.png",
  "gorde_spear": "gorde_spear.png",
  "helmet_of_mana": "helmet_of_mana.png",
  "howlingmoor": "howlingmoor.png",
  "hp_potion_l": "hp_potion_l.png",
  "hp_potion_m": "hp_potion_m.png",
  "hp_potion_s": "hp_potion_s.png",
  "hp_potion_xl": "hp_potion_xl.png",
  "human_fighter": "human_fighter.png",
  "human_mage": "human_mage.png",
  "human_mageb": "human_mageb.png",
  "icy_armor": "icy_armor.png",
  "icy_gaiters": "icy_gaiters.png",
  "imgi_10_accessory_explorer_hat_i00": "imgi_10_accessory_explorer_hat_i00.png",
  "imgi_10_accessory_eye_bandage_i00": "imgi_10_accessory_eye_bandage_i00.png",
  "imgi_10_etc_pouch_yellow_i00_0": "imgi_10_etc_pouch_yellow_i00_0.png",
  "imgi_11_accessary_mage_earing_i00": "imgi_11_accessary_mage_earing_i00.png",
  "imgi_11_accessory_archer_hat2_i00": "imgi_11_accessory_archer_hat2_i00.png",
  "imgi_11_accessory_archer_hat_i00": "imgi_11_accessory_archer_hat_i00.png",
  "imgi_11_etc_oil_pot_black_i00_0": "imgi_11_etc_oil_pot_black_i00_0.png",
  "imgi_12_accessary_ring_of_knowledge_i00": "imgi_12_accessary_ring_of_knowledge_i00.png",
  "imgi_12_accessory_dwarf_goggle_i00": "imgi_12_accessory_dwarf_goggle_i00.png",
  "imgi_12_accessory_jjoro_masj_i00": "imgi_12_accessory_jjoro_masj_i00.png",
  "imgi_12_etc_suede_i00_0": "imgi_12_etc_suede_i00_0.png",
  "imgi_13_accessory_hair_cornu_i00": "imgi_13_accessory_hair_cornu_i00.png",
  "imgi_13_accessory_nose_of_rudolph_mask_i00": "imgi_13_accessory_nose_of_rudolph_mask_i00.png",
  "imgi_13_etc_oriharukon_ore_i00_0": "imgi_13_etc_oriharukon_ore_i00_0.png",
  "imgi_13_etc_party_mask_i00": "imgi_13_etc_party_mask_i00.png",
  "imgi_14_accessory_hair_ring_i00": "imgi_14_accessory_hair_ring_i00.png",
  "imgi_14_accessory_sheep_cap_white_i00": "imgi_14_accessory_sheep_cap_white_i00.png",
  "imgi_14_etc_leather_brown_i00_0": "imgi_14_etc_leather_brown_i00_0.png",
  "imgi_15_accessory_archer_hat2_i00": "imgi_15_accessory_archer_hat2_i00.png",
  "imgi_15_accessory_hair_feeler_i00": "imgi_15_accessory_hair_feeler_i00.png",
  "imgi_15_etc_crafted_leather_i00_0": "imgi_15_etc_crafted_leather_i00_0.png",
  "imgi_15_panel_2": "imgi_15_panel_2.png",
  "imgi_16_accessory_flower_cap_i00": "imgi_16_accessory_flower_cap_i00.png",
  "imgi_16_arrows_red_pannel": "imgi_16_arrows_red_pannel.png",
  "imgi_16_etc_skein_white_i00_0": "imgi_16_etc_skein_white_i00_0.png",
  "imgi_16_g_graduation_cap_gold": "imgi_16_g_graduation_cap_gold.png",
  "imgi_17_accessory_bear_cap_i00": "imgi_17_accessory_bear_cap_i00.png",
  "imgi_17_accessory_mining_cap_i00": "imgi_17_accessory_mining_cap_i00.png",
  "imgi_17_etc_mithril_ore_i00_0": "imgi_17_etc_mithril_ore_i00_0.png",
  "imgi_17_zaken_hair_accessary": "imgi_17_zaken_hair_accessary.png",
  "imgi_18_accessary_demon_circlet_i00": "imgi_18_accessary_demon_circlet_i00.png",
  "imgi_18_accessory_pig_cap_i00": "imgi_18_accessory_pig_cap_i00.png",
  "imgi_18_armor_leather_helmet_i00": "imgi_18_armor_leather_helmet_i00.png",
  "imgi_18_etc_lump_gray_i00_0": "imgi_18_etc_lump_gray_i00_0.png",
  "imgi_18_nc_hair_acc": "imgi_18_nc_hair_acc.png",
  "imgi_19_accessary_angel_circlet_i00": "imgi_19_accessary_angel_circlet_i00.png",
  "imgi_19_accessory_jester_cap_i00": "imgi_19_accessory_jester_cap_i00.png",
  "imgi_19_bm_romantic_chaperon_gold": "imgi_19_bm_romantic_chaperon_gold.png",
  "imgi_19_etc_metallic_fiber_i00_0": "imgi_19_etc_metallic_fiber_i00_0.png",
  "imgi_1_accessory_dandy_cap_i00": "imgi_1_accessory_dandy_cap_i00.png",
  "imgi_1_agathion_lib_star_1": "imgi_1_agathion_lib_star_1.png",
  "imgi_20_accessory_magic_cap_i00": "imgi_20_accessory_magic_cap_i00.png",
  "imgi_20_accessory_ring_of_queen_ant_i02": "imgi_20_accessory_ring_of_queen_ant_i02.png",
  "imgi_20_bm_romantic_chaperon_yellow": "imgi_20_bm_romantic_chaperon_yellow.png",
  "imgi_20_etc_coal_i00_0": "imgi_20_etc_coal_i00_0.png",
  "imgi_21_accessory_earring_of_orfen_i02": "imgi_21_accessory_earring_of_orfen_i02.png",
  "imgi_21_agathion_virgo_star_1": "imgi_21_agathion_virgo_star_1.png",
  "imgi_21_etc_adamantite_i00_0": "imgi_21_etc_adamantite_i00_0.png",
  "imgi_22_accessory_ring_of_core_i02": "imgi_22_accessory_ring_of_core_i02.png",
  "imgi_22_agathion_capr_star_1": "imgi_22_agathion_capr_star_1.png",
  "imgi_22_etc_charcoal_i00_0": "imgi_22_etc_charcoal_i00_0.png",
  "imgi_23_accessory_ring_of_queen_ant_i03": "imgi_23_accessory_ring_of_queen_ant_i03.png",
  "imgi_23_etc_gem_red_i00_0": "imgi_23_etc_gem_red_i00_0.png",
  "imgi_23_shield_of_protection": "imgi_23_shield_of_protection.png",
  "imgi_25_etc_piece_bone_white_i00_0": "imgi_25_etc_piece_bone_white_i00_0.png",
  "imgi_25_shield_of_revenge": "imgi_25_shield_of_revenge.png",
  "imgi_26_etc_lump_black_i00_0": "imgi_26_etc_lump_black_i00_0.png",
  "imgi_27_etc_silver_i00_0": "imgi_27_etc_silver_i00_0.png",
  "imgi_27_sigil_of_protection": "imgi_27_sigil_of_protection.png",
  "imgi_28_etc_gem_clear_i00_0": "imgi_28_etc_gem_clear_i00_0.png",
  "imgi_29_elos_i00": "imgi_29_elos_i00.png",
  "imgi_29_etc_skein_gray_i00_0": "imgi_29_etc_skein_gray_i00_0.png",
  "imgi_2_accessory_half_face_i00": "imgi_2_accessory_half_face_i00.png",
  "imgi_2_agathion_tau_star_1": "imgi_2_agathion_tau_star_1.png",
  "imgi_2_shield_shield_of_nightmare_i00": "imgi_2_shield_shield_of_nightmare_i00.png",
  "imgi_30_etc_reagent_red_i00_0": "imgi_30_etc_reagent_red_i00_0.png",
  "imgi_31_etc_gem_blue_i00_0": "imgi_31_etc_gem_blue_i00_0.png",
  "imgi_33_etc_reagent_blue_i00_0": "imgi_33_etc_reagent_blue_i00_0.png",
  "imgi_34_etc_leather_i00_0": "imgi_34_etc_leather_i00_0.png",
  "imgi_35_etc_reagent_gold_i00_0": "imgi_35_etc_reagent_gold_i00_0.png",
  "imgi_36_etc_powder_white_i00_0": "imgi_36_etc_powder_white_i00_0.png",
  "imgi_37_etc_squares_wood_i00_0": "imgi_37_etc_squares_wood_i00_0.png",
  "imgi_3_accessory_santas_cap_i00": "imgi_3_accessory_santas_cap_i00.png",
  "imgi_3_agathion_leo_star_1": "imgi_3_agathion_leo_star_1.png",
  "imgi_41_etc_potion_clear_i00_0": "imgi_41_etc_potion_clear_i00_0.png",
  "imgi_41_sigil_of_immortal": "imgi_41_sigil_of_immortal.png",
  "imgi_42_shield_of_immortal": "imgi_42_shield_of_immortal.png",
  "imgi_43_etc_lump_white_i00_0": "imgi_43_etc_lump_white_i00_0.png",
  "imgi_46_etc_oriharukon_i00_0": "imgi_46_etc_oriharukon_i00_0.png",
  "imgi_4_agathion_gem_star_1": "imgi_4_agathion_gem_star_1.png",
  "imgi_4_armor_helmet_i00": "imgi_4_armor_helmet_i00.png",
  "imgi_4_dimension_bracelet_i00": "imgi_4_dimension_bracelet_i00.png",
  "imgi_5_agathion_sco_star_1": "imgi_5_agathion_sco_star_1.png",
  "imgi_5_shield_dark_crystal_shield_i00": "imgi_5_shield_dark_crystal_shield_i00.png",
  "imgi_6_accessory_pledge_cap2_i07": "imgi_6_accessory_pledge_cap2_i07.png",
  "imgi_6_agathion_aqu_star_1": "imgi_6_agathion_aqu_star_1.png",
  "imgi_6_dimension_bracelet_i01": "imgi_6_dimension_bracelet_i01.png",
  "imgi_7_accessory_crown_i00": "imgi_7_accessory_crown_i00.png",
  "imgi_7_agathion_sag_star_1": "imgi_7_agathion_sag_star_1.png",
  "imgi_7_etc_branch_gold_i00_0": "imgi_7_etc_branch_gold_i00_0.png",
  "imgi_8_accessory_hero_cap_i00": "imgi_8_accessory_hero_cap_i00.png",
  "imgi_8_bm_soaring_bird": "imgi_8_bm_soaring_bird.png",
  "imgi_8_dimension_bracelet_i02": "imgi_8_dimension_bracelet_i02.png",
  "imgi_8_etc_braided_hemp_i00_0": "imgi_8_etc_braided_hemp_i00_0.png",
  "imgi_9_accessary_necklace_of_knowledge_i00": "imgi_9_accessary_necklace_of_knowledge_i00.png",
  "imgi_9_accessory_cat_ear_i00": "imgi_9_accessory_cat_ear_i00.png",
  "imperial_crusader_armor": "imperial_crusader_armor.png",
  "imperial_crusader_boots": "imperial_crusader_boots.png",
  "imperial_crusader_breastplate": "imperial_crusader_breastplate.png",
  "imperial_crusader_gloves": "imperial_crusader_gloves.png",
  "imperial_crusader_helmet": "imperial_crusader_helmet.png",
  "imperial_crusader_pants": "imperial_crusader_pants.png",
  "imperial_crusader_shield": "imperial_crusader_shield.png",
  "imperial_shield": "imperial_crusader_shield.png",
  "imperial_staff": "imperial_staff.png",
  "imperial_staff_sa": "imperial_staff_sa.png",
  "ironore": "ironore.png",
  "iron_armor": "iron_armor.png",
  "iron_boots": "iron_boots.png",
  "iron_gaiters": "iron_gaiters.png",
  "iron_gauntlets": "iron_gauntlets.png",
  "iron_helm": "iron_helm.png",
  "iron_sword": "iron_sword.png",
  "juriel_dual_sword": "juriel_dual_sword.png",
  "kamaellair": "kamaellair.png",
  "kamael_soulbreaker": "kamael_soulbreaker.png",
  "karmian_robe_armor": "karmian_robe_armor.png",
  "karmian_robe_boots": "karmian_robe_boots.png",
  "karmian_robe_gloves": "karmian_robe_gloves.png",
  "karmian_robe_pants": "karmian_robe_pants.png",
  "knight_armor": "knight_armor.png",
  "knight_boots": "doom_light_boots.png",
  "knight_gaiters": "doom_light_pants.png",
  "knight_gauntlets": "doom_light_gloves.png",
  "knight_helm": "doom_light_helmet.png",
  "knight_shield": "doom_shield.png",
  "knight_sword": "knight_sword.png",
  "leather": "leather.png",
  "leather_armor_light": "leather_armor_light.png",
  "leather_belt": "leather_belt.png",
  "leather_boots": "leather_boots.png",
  "leather_gaiters": "leather_gaiters.png",
  "leather_gloves": "leather_gloves.png",
  "leather_helm": "leather_helm.png",
  "leather_helmet": "leather_helmet.png",
  "leather_pants_light": "leather_pants_light.png",
  "leather_vest": "leather_vest.png",
  "lightning_armor": "lightning_armor.png",
  "lightning_pants": "lightning_pants.png",
  "luck_boost_1h": "luck_boost_1h.png",
  "mage_gloves": "karmian_robe_gloves.png",
  "mage_robe": "mage_robe.png",
  "mage_sandals": "karmian_robe_boots.png",
  "mage_stockings": "karmian_robe_pants.png",
  "magic_powder": "magic_powder.png",
  "majestic_heavy_armor": "majestic_heavy_armor.png",
  "majestic_heavy_boots": "majestic_heavy_boots.png",
  "majestic_heavy_glove": "majestic_heavy_glove.png",
  "majestic_light_armor": "majestic_light_armor.png",
  "majestic_light_boots": "majestic_light_boots.png",
  "majestic_light_glove": "majestic_light_glove.png",
  "majestic_robe_armor": "majestic_robe_armor.png",
  "majestic_robe_boots": "majestic_robe_boots.png",
  "majestic_robe_glove": "majestic_robe_glove.png",
  "major_arcana_robe": "major_arcana_robe.png",
  "major_arcana_robe_armor": "major_arcana_robe_armor.png",
  "major_arcana_robe_boots": "major_arcana_robe_boots.png",
  "major_arcana_robe_gloves": "major_arcana_robe_gloves.png",
  "major_arcana_robe_helmet": "major_arcana_robe_helmet.png",
  "manticore_armor_light": "manticore_armor_light.png",
  "manticore_pants_light": "manticore_pants_light.png",
  "map": "map.png",
  "marsh_cloack": "marsh_cloack.png",
  "master_hammer": "master_hammer.png",
  "material_pouch": "material_pouch.png",
  "mithirl_belt": "mithirl_belt.png",
  "mithril_armor_heavy": "mithril_armor_heavy.png",
  "mithril_belt": "mithril_belt.png",
  "mithril_gaiters_heavy": "mithril_gaiters_heavy.png",
  "mithril_ore": "mithril_ore.png",
  "mithril_pants_robe": "mithril_pants_robe.png",
  "mithril_tunic_robe": "mithril_tunic_robe.png",
  "mon_alphawolf": "mon_alphawolf.png",
  "mon_ancientsathyr": "mon_ancientsathyr.png",
  "mon_antharas": "mon_antharas.png",
  "mon_armoredgoblin": "mon_armoredgoblin.png",
  "mon_babytiamat": "mon_babytiamat.png",
  "mon_beholder": "mon_beholder.png",
  "mon_blackdragon": "mon_blackdragon.png",
  "mon_blazingwerefolf": "mon_blazingwerefolf.png",
  "mon_cerberus": "mon_cerberus.png",
  "mon_corpseworm": "mon_corpseworm.png",
  "mon_crimsombabydragon": "mon_crimsombabydragon.png",
  "mon_cryptlord": "mon_cryptlord.png",
  "mon_cryptvampire": "mon_cryptvampire.png",
  "mon_cursedknight": "mon_cursedknight.png",
  "mon_cursedwarior": "mon_cursedwarior.png",
  "mon_darkmage": "mon_darkmage.png",
  "mon_deathking": "mon_deathking.png",
  "mon_deathknight": "mon_deathknight.png",
  "mon_deathrider": "mon_deathrider.png",
  "mon_deathtrent": "mon_deathtrent.png",
  "mon_deathwizard": "mon_deathwizard.png",
  "mon_direwolf": "mon_direwolf.png",
  "mon_dragon": "mon_dragon.png",
  "mon_dragonknight": "mon_dragonknight.png",
  "mon_emeraldsnake": "mon_emeraldsnake.png",
  "mon_emereldadragon": "mon_emereldadragon.png",
  "mon_fafurion": "mon_fafurion.png",
  "mon_flamegiantdragom": "mon_flamegiantdragom.png",
  "mon_flamingdemonglord": "mon_flamingdemonglord.png",
  "mon_frostknight": "mon_frostknight.png",
  "mon_frostlorddragon": "mon_frostlorddragon.png",
  "mon_furioussouls": "mon_furioussouls.png",
  "mon_goblin": "mon_goblin.png",
  "mon_goblinmage": "mon_goblinmage.png",
  "mon_goblinthief": "mon_goblinthief.png",
  "mon_knight": "mon_knight.png",
  "mon_kobold": "mon_kobold.png",
  "mon_koboldleader": "mon_koboldleader.png",
  "mon_lichlord": "mon_lichlord.png",
  "mon_lidivior": "mon_lidivior.png",
  "mon_mage": "mon_mage.png",
  "mon_minotaurknight": "mon_minotaurknight.png",
  "mon_orc": "mon_orc.png",
  "mon_rootwitch": "mon_rootwitch.png",
  "mon_scout": "mon_scout.png",
  "mon_shadowmercenary": "mon_shadowmercenary.png",
  "mon_skeleton": "mon_skeleton.png",
  "mon_spider": "mon_spider.png",
  "mon_swampwalker": "mon_swampwalker.png",
  "mon_swiftblaze": "mon_swiftblaze.png",
  "mon_valakas": "mon_valakas.png",
  "mon_valakasminion": "mon_valakasminion.png",
  "mon_voidbrute": "mon_voidbrute.png",
  "mon_voidcreature": "mon_voidcreature.png",
  "mon_voiddragonlord": "mon_voiddragonlord.png",
  "mon_voidstalker": "mon_voidstalker.png",
  "mp_potion_l": "mp_potion_l.png",
  "mp_potion_m": "mp_potion_m.png",
  "mp_potion_s": "mp_potion_s.png",
  "mp_potion_xl": "mp_potion_xl.png",
  "necklace_of_antharas": "necklace_of_antharas.png",
  "necklace_of_frintezza": "necklace_of_frintezza.png",
  "necklace_of_grace": "necklace_of_grace.png",
  "nightmare_heavy_armor": "nightmare_heavy_armor.png",
  "nightmare_heavy_boots": "nightmare_heavy_boots.png",
  "nightmare_heavy_glove": "nightmare_heavy_glove.png",
  "nightmare_light_armor": "nightmare_light_armor.png",
  "nightmare_light_boots": "nightmare_light_boots.png",
  "nightmare_light_boots.png": "nightmare_light_boots.png.png",
  "nightmare_light_bootspng": "nightmare_light_boots.png.png",
  "nightmare_light_glove": "nightmare_light_glove.png",
  "nightmare_robe_armor": "nightmare_robe_armor.png",
  "nightmare_robe_boots": "nightmare_robe_boots.png",
  "nightmare_robe_boots.png": "nightmare_robe_boots.png.png",
  "nightmare_robe_bootspng": "nightmare_robe_boots.png.png",
  "nightmare_robe_glove": "nightmare_robe_glove.png",
  "nobless_belt": "nobless_belt.png",
  "noble_crown": "noble_crown.png",
  "noble_gold_crown": "noble_gold_crown.png",
  "novice_circlet": "novice_circlet.png",
  "novice_mask": "novice_mask.png",
  "novice_talisman": "novice_talisman.png",
  "oak_earring": "oak_earring.png",
  "oak_necklace": "oak_necklace.png",
  "oak_staff": "oak_staff.png",
  "onyx_ring": "onyx_ring.png",
  "orcenruins": "orcenruins.png",
  "orcish_axe": "orcish_axe.png",
  "orcvillage": "orcvillage.png",
  "orc_fighter": "orc_fighter.png",
  "orc_mage": "orc_mage.png",
  "orfen_twohanded_sword": "orfen_twohanded_sword.png",
  "oriharukon": "oriharukon.png",
  "phantom_mask": "phantom_mask.png",
  "phantom_mask_gear": "phantom_mask_gear.png",
  "phantom_mask_item": "phantom_mask_item.png",
  "phiriel_rapier": "phiriel_rapier.png",
  "plated_leather_light_armor": "plated_leather_light_armor.png",
  "plated_leather_light_boots": "plated_leather_light_boots.png",
  "plated_leather_light_gloves": "plated_leather_light_gloves.png",
  "plated_leather_light_pants": "plated_leather_light_pants.png",
  "protection_boots": "protection_boots.png",
  "protection_gloves": "protection_gloves.png",
  "protection_heavy_armor": "protection_heavy_armor.png",
  "protection_heavy_pants": "protection_heavy_pants.png",
  "protection_light_armor": "protection_light_armor.png",
  "protection_light_pants": "protection_light_pants.png",
  "protection_robe_armor": "protection_robe_armor.png",
  "protection_robe_pants": "protection_robe_pants.png",
  "queenant_twohanded_blunt": "queenant_twohanded_blunt.png",
  "red_dragon_glove": "red_dragon_glove.png",
  "red_nobless_cloackk": "red_nobless_cloackk.png",
  "report_piece": "report_piece.png",
  "ring_baium": "ring_baium.png",
  "ring_of_baium": "ring_of_baium.png",
  "ring_of_valakas": "ring_of_valakas.png",
  "ruby_ring": "ruby_ring.png",
  "runic_anvil_mace": "runic_anvil_mace.png",
  "sages_tea": "sages_tea.png",
  "sapphire_ring": "sapphire_ring.png",
  "scroll_of_enchant_armor": "scroll_of_enchant_armor.png",
  "scroll_of_enchant_weapon_": "scroll_of_enchant_weapon_.png",
  "scroll_of_rebirth": "scroll_of_rebirth.png",
  "scroll_of_resurrection": "scroll_of_resurrection.png",
  "sea_boots": "sea_boots.png",
  "seers_circlet": "seers_circlet.png",
  "shadow_boots": "doom_light_boots.png",
  "shadow_cloak": "shadow_cloak.png",
  "shadow_fangs": "shadow_fangs.png",
  "shadow_gloves": "doom_light_gloves.png",
  "shadow_mask": "doom_light_helmet.png",
  "shadow_pants": "doom_light_pants.png",
  "shield_of_immortal": "shield_of_immortal.png",
  "shield_of_protection": "shield_of_protection.png",
  "shield_of_revenge": "shield_of_revenge.png",
  "short_bow": "short_bow.png",
  "sigil_arcana": "sigil_arcana.png",
  "sigil_devotion": "sigil_devotion.png",
  "sigil_grace": "sigil_grace.png",
  "sigil_mastery": "sigil_mastery.png",
  "sigil_of_arcana": "sigil_of_arcana.png",
  "sigil_of_devotion": "sigil_of_devotion.png",
  "sigil_of_grace": "sigil_of_grace.png",
  "sigil_of_immortal": "sigil_of_immortal.png",
  "sigil_of_mastery": "sigil_of_mastery.png",
  "sigil_of_protection": "sigil_of_protection.png",
  "silence_gloves": "silence_gloves.png",
  "silver_ring": "silver_ring.png",
  "silver_tiara": "silver_tiara.png",
  "smiths_mask": "smiths_mask.png",
  "soulshot_ng": "soulshot_ng.png",
  "soul_seeker": "soul_seeker.png",
  "speed_potion": "speed_potion.png",
  "spellbook_1star": "spellbook_1star.png",
  "spellbook_2star": "spellbook_2star.png",
  "spellbook_3star": "spellbook_3star.png",
  "spellbook_4star": "spellbook_4star.png",
  "spiritshot_ng": "spiritshot_ng.png",
  "staff_of_eternity": "staff_of_eternity.png",
  "staff_of_magic": "staff_of_magic.png",
  "starfall_staff": "starfall_staff.png",
  "steel_boots": "full_plate_heavy_boots.png",
  "steel_dagger": "steel_dagger.png",
  "steel_gaiters": "full_plate_heavy_pants.png",
  "steel_gauntlets": "full_plate_heavy_gloves.png",
  "steel_helm": "full_plate_heavy_helmet.png",
  "steel_ingot": "steel_ingot.png",
  "steel_plate": "steel_plate.png",
  "steel_shield": "full_plate_shield.png",
  "suede": "suede.png",
  "talisman_novice": "talisman_novice.png",
  "talisman_of_eva": "talisman_of_eva.png",
  "talisman_of_power": "talisman_of_power.png",
  "talisman_protection": "talisman_protection.png",
  "talkingisland": "talkingisland.png",
  "tallum_heavy_armor": "tallum_heavy_armor.png",
  "tallum_heavy_boots": "tallum_heavy_boots.png",
  "tallum_heavy_glove": "tallum_heavy_glove.png",
  "tallum_light_armor": "tallum_light_armor.png",
  "tallum_light_boots": "tallum_light_boots.png",
  "tallum_light_glove": "tallum_light_glove.png",
  "tallum_robe_armor": "tallum_robe_armor.png",
  "tallum_robe_boots": "tallum_robe_boots.png",
  "tallum_robe_boots.png": "tallum_robe_boots.png.png",
  "tallum_robe_bootspng": "tallum_robe_boots.png.png",
  "tallum_robe_glove": "tallum_robe_glove.png",
  "tallum_robe_pants": "tallum_robe_pants.png",
  "teleport_scroll": "teleport_scroll.png",
  "theca_light_armor": "theca_light_armor.png",
  "theca_light_boots": "theca_light_boots.png",
  "theca_light_gloves": "theca_light_gloves.png",
  "theca_light_pants": "theca_light_pants.png",
  "titan_hammer": "titan_hammer.png",
  "training_dagger": "training_dagger.png",
  "valakas_mask": "valakas_mask.png",
  "venir_talisman": "venir_talisman.png",
  "vesper_breastplate": "vesper_breastplate.png",
  "vesper_buster": "vesper_buster.png",
  "vesper_cloack": "vesper_cloack.png",
  "vesper_cutter": "vesper_cutter.png",
  "vesper_leather": "vesper_leather.png",
  "vesper_robe": "vesper_robe.png",
  "vesper_thrower": "vesper_thrower.png",
  "void_talons": "void_talons.png",
  "warhammer": "warhammer.png",
  "warlords_greataxe": "warlords_greataxe.png",
  "warlords_plate": "warlords_plate.png",
  "war_mace": "war_mace.png",
  "whitenobless_cloack": "whitenobless_cloack.png",
  "wolf_fang": "wolf_fang.png",
  "wooden_shield": "wooden_shield.png",
  "wooden_sword": "wooden_sword.png",
  "wraith_cloak": "wraith_cloak.png",
  "wraith_reavers": "wraith_reavers.png",
  "xp_boost_1h": "xp_boost_1h.png",
  "xp_boost_4h": "xp_boost_4h.png",
  "zaken_sword": "zaken_sword.png"
};

// ---- Starter & Armor Icon Overrides --------------------------
if (ALL_ITEMS.leather_vest)                ALL_ITEMS.leather_vest.icon                = 'Armors/leather_armor_light';
if (ALL_ITEMS.leather_gaiters)             ALL_ITEMS.leather_gaiters.icon             = 'Armors/leather_pants_light';
if (ALL_ITEMS.leather_gloves)              ALL_ITEMS.leather_gloves.icon              = 'Armors/plated_leather_light_gloves';
if (ALL_ITEMS.leather_boots)               ALL_ITEMS.leather_boots.icon               = 'Armors/plated_leather_light_boots';
if (ALL_ITEMS.leather_helm)                ALL_ITEMS.leather_helm.icon                = 'Armors/leather_helm';
if (ALL_ITEMS.short_bow)                   ALL_ITEMS.short_bow.icon                   = 'Weapons/short_bow';
if (ALL_ITEMS.training_dagger)             ALL_ITEMS.training_dagger.icon             = 'Weapons/training_dagger';
if (ALL_ITEMS.wooden_sword)                ALL_ITEMS.wooden_sword.icon                = 'Weapons/wooden_sword';

if (ALL_ITEMS.blue_wolf_breastplate)       ALL_ITEMS.blue_wolf_breastplate.icon       = 'blue_wolf_heavy_armor';
if (ALL_ITEMS.blue_wolf_leather_armor)     ALL_ITEMS.blue_wolf_leather_armor.icon     = 'blue_wolf_light_armor';
if (ALL_ITEMS.blue_wolf_tunic)             ALL_ITEMS.blue_wolf_tunic.icon             = 'blue_wolf_tunic';
if (ALL_ITEMS.major_arcana_robe)           ALL_ITEMS.major_arcana_robe.icon           = 'major_arcana_robe_armor';

if (typeof window !== 'undefined') {
  window.GameData = {
    ICON_MAP,
    RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    LEGS, SHIELDS, NECKLACES, EARRINGS, BELTS, CLOAKS, TALISMANS,
    HAIR, HAIR2, AGATHIONS, NEW_ARMORS,
    CONSUMABLES, MATERIALS, POWERUPS, CLASS_WEAPONS, CLASS_ARMORS,
    ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL,
    rollRarity, rollDrop, getMysticRotation, rollItemWithRarity
  };
}
