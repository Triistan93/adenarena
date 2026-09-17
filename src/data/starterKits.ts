/**
 * starterKits.ts — Configurações de Kits Iniciais e Equipamentos Exclusivos por Classe e Raça.
 *
 * Garante que cada arquétipo (ex: Vanguard Rider com Lança, Arqueiro com Arco, Mago com Clava Mágica)
 * comece com sua arma de maestria, armadura adequada, consumíveis e habilidades iniciais corretas.
 */

export interface StarterKitConfig {
  weapon: string;
  shield?: string | null;
  armorType: 'heavy' | 'light' | 'robe';
  helmet?: string | null;
  armor: string;
  legs?: string | null;
  gloves?: string | null;
  boots?: string | null;
  starterSkill: string;
  shotType: 'soulshot_ng' | 'spiritshot_ng';
  potions: { itemId: string; count: number };
  shotsCount: number;
}

export function getStarterKit(race: string, className: string): StarterKitConfig {
  const r = (race || '').toLowerCase();
  const c = (className || '').toLowerCase();

  // 1. Definições Canônicas de Armadura No-Grade (Nível 1 clássico: apenas peito/veste)
  const HEAVY_STARTER = {
    armor: 'bronze_breastplate_heavy',
    helmet: null,
    legs: null,
    gloves: null,
    boots: null,
    shield: null
  };

  const LIGHT_STARTER = {
    armor: 'leather_vest_light',
    helmet: null,
    legs: null,
    gloves: null,
    boots: null,
    shield: null
  };

  const ROBE_STARTER = {
    armor: 'devotion_armor_robe',
    helmet: null,
    legs: null,
    gloves: null,
    boots: null,
    shield: null
  };

  // 2. Mapeamento Específico por Classe / Especialização

  // 🐉 Orc Vanguard Rider — Exclusivo de Lança (Spear) e Heavy Armor
  if (c === 'rider' || c === 'orcrider' || c === 'vanguard' || c === 'vanguardrider' || c === 'orc_rider_0') {
    return {
      weapon: 'short_spear',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'flaming_charge',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🐺 Warg / Beast Fighter — Machados/Garras
  if (c === 'wargbase' || c === 'wargs0' || c === 'warg' || c === 'werewolf_0') {
    return {
      weapon: 'tomahawk_axe',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'savage_bite',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 💀 Death Knight / Death Pilgrim — Espada de 1 Mão
  if (c === 'deathpilgrim' || c === 'elfdeathpilgrim' || c === 'deathknight' || c.includes('death')) {
    return {
      weapon: 'falchion_sword',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'cinderblade',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🗡️ Assassin — Adagas Ágeis e Armadura Leve
  if (c === 'assassins0' || c === 'assassinbase' || c === 'assassin' || c === 'assassinde' || c.includes('assassin')) {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'gloom_strike',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🐺 Warg — Luvas / Garras de Combate e Armadura Leve
  if (c.includes('warg')) {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'savage_bite',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🐉 Orc Vanguard Rider — Lança e Armadura Pesada
  if (c.includes('rider') || c.includes('vanguard')) {
    return {
      weapon: 'short_spear',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'flaming_charge',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🔫 Sylph Gunner / Storm Blaster — Armas de Fogo e Vento
  if (c === 'sylphgunner' || r === 'sylph' || c === 'sylphid') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'gale_shot',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // ⚒️ Anão Artesão / ShineMaker — Martelos Pesados de Forja
  if (c === 'dwarffighter' || c === 'dwarven_fighter' || c === 'artisan' || c === 'artisandwarf' || c.includes('shine')) {
    return {
      weapon: 'iron_hammer',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: c.includes('shine') ? 'radiant_hammer' : 'hammer_slam',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🌹 Dark Elf Blood Rose — Magia de Rosas e Espinhos
  if (c.includes('bloodrose') || c.includes('blood_rose') || c === 'rose_vain_0') {
    return {
      weapon: 'crucifix_of_blessing_magicblunt',
      armorType: 'robe',
      ...ROBE_STARTER,
      starterSkill: 'thorned_hex',
      shotType: 'spiritshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🌪️ Ertheia Marauder / Eviscerator — Brawler e Punhos de Vento
  if (c.includes('marauder') || c.includes('eviscerator') || (r === 'ertheia' && !c.includes('mage') && !c.includes('seer'))) {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'whirlwind_dash',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🛡️ High Elf Divine Templar — Espada Sagrada
  if (c === 'highelfbase' || c === 'divinetemplars1' || c === 'divinetemplar' || c === 'sacred_templar_0') {
    return {
      weapon: 'falchion_sword',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'divine_bulwark',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🌀 High Elf Element Weaver — Mago Supremo Elemental
  if (c === 'elementweavers1' || c === 'elementweaver' || c === 'spirit_0') {
    return {
      weapon: 'crucifix_of_blessing_magicblunt',
      armorType: 'robe',
      ...ROBE_STARTER,
      starterSkill: 'triad_combo',
      shotType: 'spiritshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // ⛩️ Kamael Soulbreaker / Samurai
  if (r === 'kamael' || c.includes('samurai') || c.includes('hatamoto') || c === 'soulbreaker' || c === 'jin_kamael_soldier' || c === 'crow_0') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'iaijutsu_strike',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🔮 Magos Tradicionais (Human Mage, Elf Mage, Dark Mage, Orc Shaman)
  const isMageClass = c.includes('mage') || c.includes('wizard') || c.includes('cleric') || c.includes('shaman') || c.includes('oracle') || c.includes('seer');
  if (isMageClass) {
    return {
      weapon: 'crucifix_of_blessing_magicblunt',
      armorType: 'robe',
      ...ROBE_STARTER,
      starterSkill: 'wind_strike',
      shotType: 'spiritshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🏹 Arqueiros e Caçadores (Elfo Fighter, Rogue, Scout)
  if (r === 'elf' && c === 'fighter') {
    return {
      weapon: 'hunting_bow',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'aqua_arrow',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🗡️ Dark Elf Fighter (Assassino de Adaga)
  if (r === 'darkelf' && c === 'fighter') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_STARTER,
      starterSkill: 'venom_fang',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // 🪓 Orc Fighter (Bárbaro de Machado/Martelo)
  if (r === 'orc' && c === 'fighter') {
    return {
      weapon: 'tomahawk_axe',
      armorType: 'heavy',
      ...HEAVY_STARTER,
      starterSkill: 'brutal_cleave',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 20 },
      shotsCount: 500
    };
  }

  // ⚔️ Human Fighter / Default
  return {
    weapon: 'knight_sword',
    armorType: 'heavy',
    ...HEAVY_STARTER,
    starterSkill: 'power_strike',
    shotType: 'soulshot_ng',
    potions: { itemId: 'hp_potion_s', count: 20 },
    shotsCount: 500
  };
}
