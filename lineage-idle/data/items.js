// ========================================
// Items Database - Lineage Idle
// ========================================

const RARITY = {
  common: { name: 'Common', color: '#b0b0b0', mult: 1.0 },
  uncommon: { name: 'Uncommon', color: '#48bb78', mult: 1.4 },
  rare: { name: 'Rare', color: '#539bf5', mult: 1.8 },
  epic: { name: 'Epic', color: '#b180f8', mult: 2.4 },
  legendary: { name: 'Legendary', color: '#f0883e', mult: 3.2 }
};

const SLOT = {
  weapon: 'Weapon', armor: 'Armor', helmet: 'Helmet', boots: 'Boots',
  gloves: 'Gloves', ring: 'Ring', consumable: 'Consumable', material: 'Material', scroll: 'Scroll'
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
  dragon_slayer: { name: 'Dragon Slayer', slot: 'weapon', tier: 5, atk: 120, matk: 0, speed: -5, req: { level: 76 }, price: 35000 },
  chaos_blade: { name: 'Chaos Blade', slot: 'weapon', tier: 5, atk: 90, matk: 30, crit: 8, lifesteal: 5, req: { level: 80 }, price: 40000 }
};

const ARMORS = {
  cloth_robe: { name: 'Cloth Robe', slot: 'armor', tier: 1, def: 3, mdef: 3, req: { level: 1 }, price: 50 },
  leather_vest: { name: 'Leather Vest', slot: 'armor', tier: 1, def: 5, mdef: 1, req: { level: 1 }, price: 80 },
  bronze_chest: { name: 'Bronze Chestplate', slot: 'armor', tier: 1, def: 8, mdef: 1, req: { level: 5 }, price: 150 },
  iron_armor: { name: 'Iron Armor', slot: 'armor', tier: 2, def: 15, mdef: 5, req: { level: 10 }, price: 500 },
  mage_robe: { name: 'Mage Robe', slot: 'armor', tier: 2, def: 5, mdef: 18, matk: 5, req: { level: 12 }, price: 600 },
  steel_plate: { name: 'Steel Plate', slot: 'armor', tier: 3, def: 28, mdef: 12, req: { level: 20 }, price: 2000 },
  shadow_cloak: { name: 'Shadow Cloak', slot: 'armor', tier: 3, def: 12, mdef: 18, eva: 8, req: { level: 20 }, price: 2200 },
  elven_garb: { name: 'Elven Garb', slot: 'armor', tier: 3, def: 15, mdef: 20, matk: 10, req: { level: 22 }, price: 2500 },
  knight_armor: { name: 'Knight Armor', slot: 'armor', tier: 4, def: 50, mdef: 25, hp: 50, req: { level: 40 }, price: 8000 },
  arcane_robe: { name: 'Arcane Robe', slot: 'armor', tier: 4, def: 20, mdef: 55, matk: 20, req: { level: 40 }, price: 9000 },
  divine_robe: { name: 'Divine Robe', slot: 'armor', tier: 5, def: 80, mdef: 90, matk: 35, req: { level: 76 }, price: 30000 },
  dragon_scale_armor: { name: 'Dragon Scale Armor', slot: 'armor', tier: 5, def: 110, mdef: 50, hp: 200, req: { level: 76 }, price: 35000 }
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
  eternity_ring: { name: 'Ring of Eternity', slot: 'ring', tier: 5, hp: 200, mp: 200, atk: 5, matk: 5, def: 10, mdef: 10, req: { level: 80 }, price: 30000 }
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
  enchant_armor_scroll: { name: 'Scroll: Enchant Armor', slot: 'scroll', type: 'enchant_armor', price: 1000, stack: 99, desc: 'Enchants armor (+10% stats per +1). Safe up to +3.' }
};

const MATERIALS = {
  crystal_d: { name: 'Crystal: D Grade', slot: 'material', price: 50, stack: 999, desc: 'Used for D Grade crafting' },
  crystal_c: { name: 'Crystal: C Grade', slot: 'material', price: 150, stack: 999, desc: 'Used for C Grade crafting' },
  crystal_b: { name: 'Crystal: B Grade', slot: 'material', price: 450, stack: 999, desc: 'Used for B Grade crafting' },
  crystal_a: { name: 'Crystal: A Grade', slot: 'material', price: 1350, stack: 999, desc: 'Used for A Grade crafting' },
  crystal_s: { name: 'Crystal: S Grade', slot: 'material', price: 4000, stack: 999, desc: 'Used for S Grade crafting' },
  iron_ore: { name: 'Iron Ore', slot: 'material', price: 15, stack: 999, desc: 'Common crafting material' },
  steel_ingot: { name: 'Steel Ingot', slot: 'material', price: 80, stack: 999, desc: 'Used in tier 3+ crafting' },
  mithril_ore: { name: 'Mithril Ore', slot: 'material', price: 300, stack: 999, desc: 'Rare crafting material' },
  oriharukon: { name: 'Oriharukon', slot: 'material', price: 1500, stack: 999, desc: 'Legendary crafting material' },
  magic_powder: { name: 'Magic Powder', slot: 'material', price: 50, stack: 999, desc: 'Used in magical crafting' },
  crystal_fragment: { name: 'Crystal Fragment', slot: 'material', price: 200, stack: 999, desc: 'Required for staves' },
  leather: { name: 'Leather', slot: 'material', price: 25, stack: 999, desc: 'Basic leather material' },
  cloth: { name: 'Cloth', slot: 'material', price: 10, stack: 999, desc: 'Basic cloth material' },
  beast_blood: { name: 'Beast Blood', slot: 'material', price: 40, stack: 999, desc: 'Dropped by beasts' },
  goblin_ear: { name: 'Goblin Ear', slot: 'material', price: 20, stack: 999, desc: 'Quest item / trophy' },
  wolf_fang: { name: 'Wolf Fang', slot: 'material', price: 60, stack: 999, desc: 'Sharp material' },
  dragon_scale: { name: 'Dragon Scale', slot: 'material', price: 1000, stack: 999, desc: 'Legendary scale' },
  dragon_bone: { name: 'Dragon Bone', slot: 'material', price: 1500, stack: 999, desc: 'Precious crafting material' },
  ancient_relic: { name: 'Ancient Relic', slot: 'material', price: 5000, stack: 999, desc: 'Mysterious artifact' }
};

const ALL_ITEMS = { ...WEAPONS, ...ARMORS, ...HELMETS, ...BOOTS, ...GLOVES, ...RINGS, ...CONSUMABLES, ...MATERIALS };

// ======================================
// MONSTER DROPS (Loot rebalanceado)
// ======================================
const MONSTER_DROPS = {
  goblin: { items: [{ id: 'iron_ore', chance: 0.15, amount: [1, 2] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }, { id: 'goblin_ear', chance: 0.2, amount: [1, 1] }, { id: 'hp_potion_s', chance: 0.05, amount: [1, 1] }], equipment: [{ pool: ['wooden_sword', 'training_dagger', 'oak_staff', 'short_bow', 'leather_vest', 'cloth_robe', 'leather_helm', 'cloth_boots', 'leather_gloves', 'copper_ring'], chance: 0.08 }] },
  wolf: { items: [{ id: 'beast_blood', chance: 0.15, amount: [1, 2] }, { id: 'wolf_fang', chance: 0.15, amount: [1, 2] }, { id: 'leather', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['training_dagger', 'short_bow', 'leather_vest', 'leather_helm', 'leather_boots', 'leather_gloves', 'copper_ring'], chance: 0.08 }] },
  spider: { items: [{ id: 'beast_blood', chance: 0.15, amount: [1, 2] }, { id: 'magic_powder', chance: 0.15, amount: [1, 1] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['oak_staff', 'leather_vest', 'cloth_robe', 'cloth_boots', 'copper_ring'], chance: 0.08 }] },
  orc: { items: [{ id: 'iron_ore', chance: 0.2, amount: [2, 4] }, { id: 'leather', chance: 0.15, amount: [1, 3] }, { id: 'hp_potion_m', chance: 0.05, amount: [1, 1] }], equipment: [{ pool: ['iron_sword', 'bronze_mace', 'iron_boots', 'iron_gauntlets', 'iron_helm', 'silver_ring'], chance: 0.1 }] },
  kobold: { items: [{ id: 'iron_ore', chance: 0.2, amount: [1, 3] }, { id: 'steel_ingot', chance: 0.1, amount: [1, 1] }, { id: 'mp_potion_s', chance: 0.05, amount: [1, 1] }], equipment: [{ pool: ['iron_sword', 'steel_dagger', 'composite_bow', 'iron_armor', 'iron_boots', 'iron_helm'], chance: 0.1 }] },
  kamaelScout: { items: [{ id: 'magic_powder', chance: 0.15, amount: [1, 3] }, { id: 'crystal_fragment', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['crystal_staff', 'assassins_blade', 'shadow_cloak', 'shadow_mask', 'shadow_boots', 'silver_ring'], chance: 0.1 }] },
  skeleton: { items: [{ id: 'iron_ore', chance: 0.2, amount: [1, 2] }, { id: 'steel_ingot', chance: 0.1, amount: [1, 1] }], equipment: [{ pool: ['iron_sword', 'crystal_staff', 'iron_armor', 'mage_robe', 'mage_hood', 'iron_helm'], chance: 0.1 }] },
  goblinKing: { items: [{ id: 'steel_ingot', chance: 0.3, amount: [2, 4] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }, { id: 'scroll_of_resurrection', chance: 0.2, amount: [1, 1] }], equipment: [{ pool: ['knight_sword', 'archmage_staff', 'elven_bow', 'warhammer', 'dark_katana', 'steel_plate', 'steel_helm', 'steel_boots', 'gold_ring'], chance: 0.2, rarityBoost: 1 }] },
  wolfAlpha: { items: [{ id: 'wolf_fang', chance: 0.3, amount: [3, 6] }, { id: 'beast_blood', chance: 0.3, amount: [2, 4] }, { id: 'leather', chance: 0.3, amount: [3, 5] }], equipment: [{ pool: ['steel_dagger', 'composite_bow', 'iron_armor', 'shadow_cloak', 'steel_boots', 'silver_ring'], chance: 0.2 }] },
  knight: { items: [{ id: 'steel_ingot', chance: 0.2, amount: [2, 4] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['blade_of_doom', 'soul_seeker', 'staff_of_magic', 'dragon_bow', 'titan_hammer', 'dual_swords', 'knight_armor', 'arcane_robe', 'knight_helm', 'arcane_circlet', 'diamond_ring', 'onyx_ring', 'amethyst_ring'], chance: 0.1, rarityBoost: 1 }] },
  mage: { items: [{ id: 'magic_powder', chance: 0.2, amount: [2, 4] }, { id: 'crystal_fragment', chance: 0.2, amount: [2, 3] }, { id: 'mithril_ore', chance: 0.1, amount: [1, 2] }], equipment: [{ pool: ['archmage_staff', 'staff_of_magic', 'arcane_robe', 'arcane_circlet', 'arcane_boots', 'arcane_gloves', 'ruby_ring', 'sapphire_ring'], chance: 0.1, rarityBoost: 1 }] },
  dragon: { items: [{ id: 'dragon_scale', chance: 0.4, amount: [2, 4] }, { id: 'dragon_bone', chance: 0.3, amount: [1, 3] }, { id: 'oriharukon', chance: 0.2, amount: [1, 2] }, { id: 'ancient_relic', chance: 0.1, amount: [1, 1] }, { id: 'scroll_of_rebirth', chance: 0.3, amount: [1, 1] }], equipment: [{ pool: ['divine_sword', 'staff_of_eternity', 'bow_of_silence', 'dragon_slayer', 'chaos_blade', 'divine_robe', 'dragon_scale_armor', 'divine_crown', 'dragon_circlet', 'divine_boots', 'divine_gloves', 'dragon_boots', 'dragon_gauntlets', 'dragon_eye_ring', 'eternity_ring'], chance: 0.25, rarityBoost: 2 }] },
  dragonKnight: { items: [{ id: 'dragon_scale', chance: 0.5, amount: [3, 5] }, { id: 'dragon_bone', chance: 0.4, amount: [2, 4] }, { id: 'oriharukon', chance: 0.3, amount: [2, 3] }, { id: 'ancient_relic', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['divine_sword', 'staff_of_eternity', 'bow_of_silence', 'dragon_slayer', 'chaos_blade', 'divine_robe', 'dragon_scale_armor', 'divine_crown', 'dragon_eye_ring', 'eternity_ring'], chance: 0.3, rarityBoost: 3 }] },
  
  goblinThief: { items: [{ id: 'iron_ore', chance: 0.15, amount: [1, 3] }, { id: 'cloth', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['wooden_sword', 'training_dagger', 'short_bow', 'leather_vest', 'cloth_boots'], chance: 0.08 }] },
  koboldLeader: { items: [{ id: 'steel_ingot', chance: 0.2, amount: [1, 2] }, { id: 'iron_ore', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['iron_sword', 'composite_bow', 'iron_armor', 'iron_boots'], chance: 0.15 }] },
  direWolf: { items: [{ id: 'beast_blood', chance: 0.2, amount: [2, 4] }, { id: 'wolf_fang', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['steel_dagger', 'composite_bow', 'shadow_cloak', 'shadow_boots'], chance: 0.08 }] },
  crimsonBabyDragon: { items: [{ id: 'dragon_scale', chance: 0.15, amount: [1, 1] }, { id: 'dragon_bone', chance: 0.15, amount: [1, 1] }], equipment: [{ pool: ['knight_sword', 'elven_bow', 'steel_plate', 'gold_ring'], chance: 0.1 }] },
  alphaWolf: { items: [{ id: 'wolf_fang', chance: 0.3, amount: [3, 6] }, { id: 'beast_blood', chance: 0.3, amount: [2, 5] }], equipment: [{ pool: ['steel_dagger', 'shadow_cloak', 'shadow_boots', 'silver_ring'], chance: 0.15 }] },
  darkMage: { items: [{ id: 'magic_powder', chance: 0.2, amount: [3, 5] }, { id: 'crystal_fragment', chance: 0.2, amount: [2, 4] }], equipment: [{ pool: ['archmage_staff', 'arcane_robe', 'arcane_circlet', 'ruby_ring'], chance: 0.1 }] },
  devilBone: { items: [{ id: 'steel_ingot', chance: 0.2, amount: [3, 5] }, { id: 'mithril_ore', chance: 0.15, amount: [1, 2] }], equipment: [{ pool: ['warhammer', 'blade_of_doom', 'knight_armor', 'knight_helm'], chance: 0.1 }] },
  deathKnight: { items: [{ id: 'mithril_ore', chance: 0.3, amount: [2, 4] }, { id: 'oriharukon', chance: 0.2, amount: [1, 2] }], equipment: [{ pool: ['soul_seeker', 'blade_of_doom', 'titan_hammer', 'knight_armor', 'diamond_ring'], chance: 0.25, rarityBoost: 1 }] },
  voidCreature: { items: [{ id: 'ancient_relic', chance: 0.2, amount: [1, 2] }, { id: 'oriharukon', chance: 0.2, amount: [1, 3] }], equipment: [{ pool: ['staff_of_magic', 'dragon_bow', 'arcane_robe', 'onyx_ring'], chance: 0.25, rarityBoost: 1 }] },
  emeraldDragon: { items: [{ id: 'dragon_scale', chance: 0.4, amount: [3, 5] }, { id: 'dragon_bone', chance: 0.3, amount: [2, 4] }], equipment: [{ pool: ['divine_sword', 'bow_of_silence', 'dragon_scale_armor', 'dragon_eye_ring'], chance: 0.3, rarityBoost: 2 }] },
  cerberus: { items: [{ id: 'ancient_relic', chance: 0.3, amount: [2, 4] }, { id: 'dragon_bone', chance: 0.3, amount: [3, 5] }], equipment: [{ pool: ['chaos_blade', 'dragon_slayer', 'divine_robe', 'eternity_ring'], chance: 0.35, rarityBoost: 3 }] }
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
    { id: 'cloth_cap', stock: 1 }, { id: 'leather_helm', stock: 1 },
    { id: 'cloth_boots', stock: 1 }, { id: 'leather_boots', stock: 1 },
    { id: 'cloth_gloves', stock: 1 }, { id: 'leather_gloves', stock: 1 },
    { id: 'copper_ring', stock: 1 }, { id: 'scroll_of_resurrection', stock: 99 }
  ],
  giranOutskirts: [
    { id: 'hp_potion_m', stock: 99 }, { id: 'mp_potion_m', stock: 99 },
    { id: 'soulshot_ng', stock: 999 }, { id: 'spiritshot_ng', stock: 999 },
    { id: 'enchant_weapon_scroll', stock: 99 }, { id: 'enchant_armor_scroll', stock: 99 },
    { id: 'iron_sword', stock: 1 }, { id: 'steel_dagger', stock: 1 },
    { id: 'crystal_staff', stock: 1 }, { id: 'composite_bow', stock: 1 },
    { id: 'iron_armor', stock: 1 }, { id: 'mage_robe', stock: 1 },
    { id: 'iron_helm', stock: 1 }, { id: 'mage_hood', stock: 1 },
    { id: 'iron_boots', stock: 1 }, { id: 'mage_sandals', stock: 1 },
    { id: 'iron_gauntlets', stock: 1 }, { id: 'mage_gloves', stock: 1 },
    { id: 'silver_ring', stock: 1 },
    { id: 'attack_potion', stock: 99 }, { id: 'defense_potion', stock: 99 },
    { id: 'scroll_of_resurrection', stock: 99 }
  ],
  gludioCastle: [
    { id: 'hp_potion_l', stock: 99 }, { id: 'mp_potion_l', stock: 99 },
    { id: 'knight_sword', stock: 1 }, { id: 'assassins_blade', stock: 1 },
    { id: 'archmage_staff', stock: 1 }, { id: 'elven_bow', stock: 1 },
    { id: 'steel_plate', stock: 1 }, { id: 'shadow_cloak', stock: 1 }, { id: 'elven_garb', stock: 1 },
    { id: 'steel_helm', stock: 1 }, { id: 'shadow_mask', stock: 1 },
    { id: 'steel_boots', stock: 1 }, { id: 'shadow_boots', stock: 1 },
    { id: 'steel_gauntlets', stock: 1 }, { id: 'shadow_gloves', stock: 1 },
    { id: 'gold_ring', stock: 1 }, { id: 'ruby_ring', stock: 1 },
    { id: 'emerald_ring', stock: 1 }, { id: 'sapphire_ring', stock: 1 },
    { id: 'speed_potion', stock: 99 }, { id: 'scroll_of_rebirth', stock: 99 }
  ],
  adenCity: [
    { id: 'hp_potion_xl', stock: 99 }, { id: 'mp_potion_xl', stock: 99 },
    { id: 'blade_of_doom', stock: 1 }, { id: 'soul_seeker', stock: 1 },
    { id: 'staff_of_magic', stock: 1 }, { id: 'dragon_bow', stock: 1 },
    { id: 'titan_hammer', stock: 1 }, { id: 'dual_swords', stock: 1 },
    { id: 'knight_armor', stock: 1 }, { id: 'arcane_robe', stock: 1 },
    { id: 'knight_helm', stock: 1 }, { id: 'arcane_circlet', stock: 1 },
    { id: 'knight_boots', stock: 1 }, { id: 'arcane_boots', stock: 1 },
    { id: 'knight_gauntlets', stock: 1 }, { id: 'arcane_gloves', stock: 1 },
    { id: 'diamond_ring', stock: 1 }, { id: 'onyx_ring', stock: 1 }, { id: 'amethyst_ring', stock: 1 },
    { id: 'scroll_of_rebirth', stock: 99 }
  ],
  dragonValley: [
    { id: 'divine_sword', stock: 1 }, { id: 'staff_of_eternity', stock: 1 },
    { id: 'bow_of_silence', stock: 1 }, { id: 'dragon_slayer', stock: 1 },
    { id: 'chaos_blade', stock: 1 },
    { id: 'divine_robe', stock: 1 }, { id: 'dragon_scale_armor', stock: 1 },
    { id: 'divine_crown', stock: 1 }, { id: 'dragon_circlet', stock: 1 },
    { id: 'divine_boots', stock: 1 }, { id: 'dragon_boots', stock: 1 },
    { id: 'divine_gloves', stock: 1 }, { id: 'dragon_gauntlets', stock: 1 },
    { id: 'dragon_eye_ring', stock: 1 }, { id: 'eternity_ring', stock: 1 },
    { id: 'ancient_relic', stock: 99 }
  ]
};

const CRAFTING_RECIPES = {
  iron_sword: { id: 'iron_sword', materials: { iron_ore: 5, cloth: 2 }, level: 1 },
  steel_dagger: { id: 'steel_dagger', materials: { iron_ore: 4, leather: 2 }, level: 1 },
  crystal_staff: { id: 'crystal_staff', materials: { iron_ore: 3, crystal_fragment: 5, magic_powder: 2 }, level: 1 },
  composite_bow: { id: 'composite_bow', materials: { iron_ore: 3, leather: 4, beast_blood: 2 }, level: 1 },
  bronze_mace: { id: 'bronze_mace', materials: { iron_ore: 6 }, level: 1 },
  orcish_axe: { id: 'orcish_axe', materials: { iron_ore: 8, steel_ingot: 2 }, level: 1 },
  iron_armor: { id: 'iron_armor', materials: { iron_ore: 10, leather: 5 }, level: 1 },
  mage_robe: { id: 'mage_robe', materials: { cloth: 15, magic_powder: 5 }, level: 1 },
  
  knight_sword: { id: 'knight_sword', materials: { steel_ingot: 8, mithril_ore: 2, crystal_d: 15 }, level: 20 },
  steel_plate: { id: 'steel_plate', materials: { steel_ingot: 15, mithril_ore: 3, leather: 8, crystal_d: 20 }, level: 20 },
  shadow_cloak: { id: 'shadow_cloak', materials: { cloth: 20, beast_blood: 10, magic_powder: 5, crystal_d: 20 }, level: 20 },
  archmage_staff: { id: 'archmage_staff', materials: { steel_ingot: 5, crystal_fragment: 15, magic_powder: 10, crystal_d: 25 }, level: 22 },
  
  blade_of_doom: { id: 'blade_of_doom', materials: { steel_ingot: 20, mithril_ore: 8, oriharukon: 2, crystal_c: 30 }, level: 40 },
  knight_armor: { id: 'knight_armor', materials: { steel_ingot: 25, mithril_ore: 10, oriharukon: 3, crystal_c: 40 }, level: 40 },
  arcane_robe: { id: 'arcane_robe', materials: { cloth: 30, crystal_fragment: 25, magic_powder: 20, crystal_c: 40 }, level: 40 },
  
  titan_hammer: { id: 'titan_hammer', materials: { steel_ingot: 30, mithril_ore: 15, oriharukon: 5, crystal_b: 20 }, level: 48 },
  dual_swords: { id: 'dual_swords', materials: { steel_ingot: 35, mithril_ore: 15, oriharukon: 5, crystal_b: 40 }, level: 50 },

  divine_sword: { id: 'divine_sword', materials: { steel_ingot: 40, oriharukon: 8, dragon_scale: 5, ancient_relic: 1, crystal_a: 50, crystal_s: 10 }, level: 76 },
  dragon_scale_armor: { id: 'dragon_scale_armor', materials: { steel_ingot: 50, oriharukon: 10, dragon_scale: 15, dragon_bone: 5, crystal_a: 60, crystal_s: 20 }, level: 76 }
};

// ROLETA DE RARIDADE HARDCORE: 
// A cada drop que ocorre (equipamento), a chance de ser Lendário é 2% (0.02).
// Com 5% a 10% de chance geral de drop, a chance absoluta de pegar um Lendário num mob comum é ~0.2%.
function rollRarity(bonus = 0) {
  const r = Math.random();
  if (r < 0.02 + bonus * 0.02) return 'legendary'; 
  if (r < 0.08 + bonus * 0.03) return 'epic';      
  if (r < 0.25 + bonus * 0.04) return 'rare';      
  if (r < 0.55 + bonus * 0.05) return 'uncommon';  
  return 'common';                                 
}

function rollDrop(target, lootBonus = 1) {
  const monsterDrops = MONSTER_DROPS[target];
  if (!monsterDrops) return [];

  const drops = [];
  const chanceMultiplier = Math.max(0.1, lootBonus || 1);

  for (const itemDrop of monsterDrops.items || []) {
    const chance = (itemDrop.chance || 0) * chanceMultiplier;
    if (Math.random() < chance) {
      const amount = Array.isArray(itemDrop.amount) && itemDrop.amount.length === 2
        ? itemDrop.amount[0] + Math.floor(Math.random() * (itemDrop.amount[1] - itemDrop.amount[0] + 1))
        : (itemDrop.amount ?? 1);
      drops.push({ id: itemDrop.id, amount, isEquipment: false });
    }
  }

  for (const equipmentDrop of monsterDrops.equipment || []) {
    const chance = (equipmentDrop.chance || 0) * chanceMultiplier;
    if (Math.random() < chance) {
      const pool = equipmentDrop.pool || [];
      if (!pool.length) continue;
      const id = pool[Math.floor(Math.random() * pool.length)];
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
  let seed = cycle * 2654435761 >>> 0;
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
  const base = JSON.parse(JSON.stringify(ALL_ITEMS[itemId]));
  base.rarity = rarity;
  const mult = RARITY[rarity].mult;
  ['atk','def','matk','mdef','hp','mp','eva','crit','speed','lifesteal'].forEach(k => {
    if (base[k]) base[k] = Math.floor(base[k] * mult);
  });
  return base;
}

if (typeof window !== 'undefined') {
  window.GameData = {
    RARITY, SLOT, WEAPONS, ARMORS, HELMETS, BOOTS, GLOVES, RINGS,
    CONSUMABLES, MATERIALS, POWERUPS, CLASS_WEAPONS, CLASS_ARMORS,
    ALL_ITEMS, MONSTER_DROPS, SHOP_INVENTORY, CRAFTING_RECIPES,
    ZONE_GOLD_MULT, MYSTIC_POOL,
    rollRarity, rollDrop, getMysticRotation, rollItemWithRarity
  };
}