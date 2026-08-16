/**
 * starterKits.ts — Configurações de Kits Iniciais e Equipamentos Exclusivos por Classe e Raça.
 *
 * Garante que cada arquétipo (ex: Vanguard Rider com Lança, Arqueiro com Arco, Mago com Clava Mágica)
 * comece com sua arma de maestria, armadura adequada, consumíveis e habilidades iniciais corretas.
 */

export interface StarterKitConfig {
  weapon: string;
  shield?: string;
  armorType: 'heavy' | 'light' | 'robe';
  helmet: string;
  armor: string;
  legs: string;
  gloves: string;
  boots: string;
  starterSkill: string;
  shotType: 'soulshot_ng' | 'spiritshot_ng';
  potions: { itemId: string; count: number };
  shotsCount: number;
}

export function getStarterKit(race: string, className: string): StarterKitConfig {
  const r = (race || '').toLowerCase();
  const c = (className || '').toLowerCase();

  // 1. Definições de Sets de Armadura No-Grade
  const HEAVY_SET = {
    helmet: 'bronze_helmet',
    armor: 'bronze_breastplate_heavy',
    legs: 'bronze_gaiters_heavy',
    gloves: 'bronze_gloves',
    boots: 'lether_boots'
  };

  const LIGHT_SET = {
    helmet: 'leather_helmet',
    armor: 'leather_vest_light',
    legs: 'leather_pants_light',
    gloves: 'leather_gloves',
    boots: 'lether_boots'
  };

  const ROBE_SET = {
    helmet: 'devotion_helmet',
    armor: 'devotion_armor_robe',
    legs: 'devotion_pants_robe',
    gloves: 'devotion_gloves',
    boots: 'devotion_boots'
  };

  // 2. Mapeamento Específico por Classe / Especialização

  // 🐉 Orc Vanguard Rider — Exclusivo de Lança (Spear) e Heavy Armor
  if (c === 'rider' || c === 'orcrider' || c === 'vanguard' || c === 'vanguardrider') {
    return {
      weapon: 'short_spear',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'thrust_spear',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 500
    };
  }

  // 🐺 Warg / Beast Fighter — Machados/Garras
  if (c === 'wargbase' || c === 'wargs0' || c === 'warg') {
    return {
      weapon: 'tomahawk_axe',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'warg_will',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 💀 Death Knight / Death Pilgrim — Espada de 1 Mão
  if (c === 'deathpilgrim' || c === 'elfdeathpilgrim' || c === 'deathknight' || c.includes('death')) {
    return {
      weapon: 'falchion_sword',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'death_spike_dk',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🗡️ Assassin — Adagas Ágeis e Armadura Leve
  if (c === 'assassins0' || c === 'assassinbase' || c === 'assassin' || c === 'assassinde' || c.includes('assassin')) {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'assassin_harmony',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🐺 Warg — Luvas / Garras de Combate e Armadura Leve
  if (c.includes('warg')) {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'warg_harmony',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🐉 Orc Vanguard Rider — Lança e Escudo / Armadura Pesada
  if (c.includes('rider') || c.includes('vanguard')) {
    return {
      weapon: 'falchion_sword',
      shield: 'shield_small_shield',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'power_strike_f',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🔫 Sylph Gunner / Storm Blaster — Armas de Fogo e Vento
  if (c === 'sylphgunner' || r === 'sylph') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'burst_fire',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 500
    };
  }

  // ⚒️ Anão Artesão / ShineMaker — Martelos Pesados de Forja
  if (c === 'dwarffighter' || c === 'artisan' || c === 'artisandwarf' || c === 'shinemakers1' || c === 'shinemaker') {
    return {
      weapon: 'iron_hammer',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: c.includes('shine') ? 'shinemaker_harmony' : 'power_strike_f',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🛡️ High Elf Divine Templar — Espada e Escudo Sagrado
  if (c === 'highelfbase' || c === 'divinetemplars1' || c === 'divinetemplar') {
    return {
      weapon: 'falchion_sword',
      shield: 'shield_small_shield',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'divine_templar_harmony',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🌀 High Elf Element Weaver — Mago Supremo Elemental
  if (c === 'elementweavers1' || c === 'elementweaver') {
    return {
      weapon: 'crucifix_of_blessing_magicblunt',
      armorType: 'robe',
      ...ROBE_SET,
      starterSkill: 'element_weaver_harmony',
      shotType: 'spiritshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 500
    };
  }

  // ⛩️ Kamael Soulbreaker / Samurai (Hatamoto)
  if (r === 'kamael' || c === 'soulbreaker' || c === 'hatamoto') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'samurai_harmony',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🔮 Magos Tradicionais (Human Mage, Elf Mage, Dark Mage, Orc Shaman)
  const isMageClass = c.includes('mage') || c.includes('wizard') || c.includes('cleric') || c.includes('shaman') || c.includes('oracle') || c.includes('seer');
  if (isMageClass) {
    return {
      weapon: 'crucifix_of_blessing_magicblunt',
      armorType: 'robe',
      ...ROBE_SET,
      starterSkill: 'energy_bolt_m',
      shotType: 'spiritshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 500
    };
  }

  // 🏹 Arqueiros e Caçadores (Elfo Fighter, Rogue, Scout)
  if (r === 'elf' && c === 'fighter') {
    return {
      weapon: 'hunting_bow',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'double_shot_f',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 500
    };
  }

  // 🗡️ Dark Elf Fighter (Assassino de Adaga)
  if (r === 'darkelf' && c === 'fighter') {
    return {
      weapon: 'sword_breaker',
      armorType: 'light',
      ...LIGHT_SET,
      starterSkill: 'power_strike_f',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // 🪓 Orc Fighter (Bárbaro de Machado/Martelo)
  if (r === 'orc' && c === 'fighter') {
    return {
      weapon: 'tomahawk_axe',
      armorType: 'heavy',
      ...HEAVY_SET,
      starterSkill: 'power_strike_f',
      shotType: 'soulshot_ng',
      potions: { itemId: 'hp_potion_s', count: 100 },
      shotsCount: 400
    };
  }

  // ⚔️ Human Fighter / Default
  return {
    weapon: 'knight_sword',
    shield: 'shield_small_shield',
    armorType: 'heavy',
    ...HEAVY_SET,
    starterSkill: 'power_strike_f',
    shotType: 'soulshot_ng',
    potions: { itemId: 'hp_potion_s', count: 100 },
    shotsCount: 400
  };
}
