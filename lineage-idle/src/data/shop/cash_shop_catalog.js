/**
 * cash_shop_catalog.js — Catálogo Oficial da Loja Comercial de Aden.
 * 
 * Contém as 5 abas da loja:
 * 1. Starter Packs (Pacotes Iniciais com Itens de Herança)
 * 2. Trajes & Skins (Armas e Trajes Cosméticos)
 * 3. Títulos & Efeitos (Títulos Coloridos, Molduras e Auras)
 * 4. Utilitários & Passes (Passe VIP, Blessed Scrolls, Tomos 4★)
 * 5. Obter Aden Coins (Pacotes de Doação Pix / Moeda AC)
 */

export const CASH_SHOP_CATALOG = {
  // ─── 1. STARTER PACKS (PACOTES INICIAIS) ──────────────────────────────────
  starter_packs: [
    {
      id: 'starter_pack_tier1',
      name: 'Pacote Aventureiro Iniciante (Tier 1)',
      priceAC: 100,
      brlEquivalent: 'R$ 7,50',
      badge: 'POPULAR',
      icon: 'graded/weapons/weapon_bastard_sword.png',
      desc: 'Kit essencial para começar sem lentidão. Adapta-se à sua classe entregando o conjunto D-Grade correspondente (Heavy, Light ou Robe) + Arma +3 + 2.000x Shots e Poções.',
      contents: {
        gearTier: 'D-Grade Verde (Auto-adaptado)',
        weaponEnchant: 3,
        items: [
          { id: 'armor_brigandine_tunic', name: 'Conjunto D-Grade (Heavy/Light/Robe)', count: 1 }
        ],
        consumables: [
          { id: 'soulshot_d', name: '2.000x Shots da Classe (Soul/Spiritshot)', count: 2000 },
          { id: 'hp_potion_l', name: '50x Poções de HP Grandes', count: 50 },
          { id: 'scroll_teleport', name: '5x Pergaminhos de Teleporte', count: 5 }
        ]
      }
    },
    {
      id: 'starter_pack_tier2',
      name: 'Pacote Campeão de Aden (Tier 2)',
      priceAC: 250,
      brlEquivalent: 'R$ 15,00',
      badge: 'RECOMENDADO',
      icon: 'graded/weapons/weapon_revolution_sword.png',
      desc: 'O melhor custo-benefício. Entrega Conjunto D-Grade completo +3 (Heavy, Light ou Robe), Arma +5 brilhante, Joias completas, 5.000x Shots e Título [Pioneiro].',
      contents: {
        gearTier: 'D-Grade Verde +3 Reforçado',
        armorEnchant: 3,
        weaponEnchant: 5,
        title: { id: 'title_pioneiro', name: 'Pioneiro', color: '#38bdf8', glow: true },
        items: [
          { id: 'armor_brigandine_tunic', name: 'Conjunto D-Grade +3 (Heavy/Light/Robe)', count: 1, enchant: 3 },
          { id: 'jewelry_necklace_d', name: 'Kit Completo de Joias D-Grade', count: 1 }
        ],
        consumables: [
          { id: 'soulshot_d', name: '5.000x Shots da Classe (Soul/Spiritshot)', count: 5000 },
          { id: 'hp_potion_xl', name: '100x Poções de HP XL', count: 100 },
          { id: 'potion_haste', name: '15x Poções de Aceleração', count: 15 },
          { id: 'scroll_teleport', name: '10x Pergaminhos de Teleporte', count: 10 }
        ]
      }
    },
    {
      id: 'starter_pack_tier3',
      name: 'Pacote Lorde Soberano (Tier 3 - Herança)',
      priceAC: 500,
      brlEquivalent: 'R$ 29,90',
      badge: 'SUPREMO',
      icon: 'acessories/noble_gold_crown.png',
      desc: 'O pacote definitivo de soberania. Inclui o conjunto completo de Equipamentos de Herança adaptados à sua classe (Heavy, Light ou Robe + Arma da Classe) que escalam do Lv. 1 ao 40, Capa, Cinto, Coroa Alada, Agathion, 15.000x Shots, Passe VIP 30D e Título Dourado [Lorde Soberano].',
      contents: {
        gearTier: 'Herança Escalonável (Lv. 1 ao 40 - Heavy/Light/Robe)',
        isHeirloomSet: true,
        title: { id: 'title_lorde_soberano', name: 'Lorde Soberano', color: '#ffd700', glow: true, animated: true },
        agathion: { id: 'agathion_golden_dragon', name: 'Agathion Dragão Dourado', desc: 'Companheiro místico que concede +5% Ouro e visual exuberante.' },
        items: [
          { id: 'armor_heirloom_chest', name: 'Conjunto de Armadura de Herança (Heavy/Light/Robe)', count: 1, isHeirloom: true },
          { id: 'jewelry_heirloom_necklace', name: 'Kit Completo de Joias de Herança', count: 1, isHeirloom: true },
          { id: 'cloak_heirloom_royal', name: 'Capa Real + Cinto do Campeão + Coroa Alada', count: 1, isHeirloom: true }
        ],
        consumables: [
          { id: 'soulshot_c', name: '15.000x Shots C-Grade (Soul/Spiritshot)', count: 15000 },
          { id: 'hp_potion_xl', name: '200x Poções de HP XL', count: 200 },
          { id: 'elixir_vigor_1h', name: '20x Elixires de Vigor (1h)', count: 20 },
          { id: 'pass_vip_teleport_30d', name: 'Passe VIP de Teleporte (30 Dias)', count: 1 }
        ]
      }
    }
  ],

  // ─── 2. TRAJES & SKINS (APARÊNCIAS VISUAIS) ───────────────────────────────
  costumes_and_skins: [
    {
      id: 'skin_weapon_frost_lord',
      category: 'weapon_skin',
      name: 'Aparência de Arma: Frost Lord',
      priceAC: 200,
      icon: 'gradespecial/weapons/weapon_frost_lord_sword.png',
      desc: 'Envolve sua arma com névoa gélida e partículas cintilantes de gelo eterno.',
      visualEffect: 'frost_aura'
    },
    {
      id: 'skin_weapon_infernal_dragon',
      category: 'weapon_skin',
      name: 'Aparência de Arma: Dragão Infernal',
      priceAC: 200,
      icon: 'gradec/weapons/weapon_samurai_longsword.png',
      desc: 'Incendeia a lâmina com fogo ardente e faíscas vulcânicas.',
      visualEffect: 'fire_aura'
    },
    {
      id: 'skin_weapon_celestial_holy',
      category: 'weapon_skin',
      name: 'Aparência de Arma: Sagrado Celestial',
      priceAC: 200,
      icon: 'gradec/weapons/weapon_crystal_staff.png',
      desc: 'Irradia raios de luz divina dourada e runas sagradas flutuantes.',
      visualEffect: 'holy_aura'
    },
    {
      id: 'costume_royal_gala',
      category: 'costume',
      name: 'Traje de Gala Real de Aden',
      priceAC: 350,
      icon: 'gradec/armors/armor_full_plate_heavy_armor.png',
      desc: 'Vestimenta cerimonial nobre confeccionada para os bailes imperiais do Castelo de Aden.',
      visualEffect: 'royal_suit'
    },
    {
      id: 'costume_death_knight',
      category: 'costume',
      name: 'Armadura do Cavaleiro da Morte',
      priceAC: 350,
      icon: 'gradec/armors/armor_full_plate_heavy_helmet.png',
      desc: 'Traje sombrio de placas negras com olhos azuis incandescentes que emana autoridade obscura.',
      visualEffect: 'death_knight_suit'
    },
    {
      id: 'costume_elven_spring',
      category: 'costume',
      name: 'Roupão Élfico da Primavera',
      priceAC: 300,
      icon: 'gradec/armors/armor_full_plate_cloack.png',
      desc: 'Túnica élfica adornada com folhas e pétalas encantadas da Floresta dos Tributos.',
      visualEffect: 'elven_spring_suit'
    }
  ],

  // ─── 3. TÍTULOS & EFEITOS (PRESTÍGIO & IDENTIDADE) ─────────────────────────
  titles_and_effects: [
    {
      id: 'title_imperador',
      category: 'title',
      name: 'Título: [Imperador]',
      priceAC: 150,
      color: '#ef4444',
      prefixIcon: '👑',
      desc: 'Exibe o título honorário [Imperador] com coroa vermelha e destaque reluzente no chat e avatar.'
    },
    {
      id: 'title_imortal',
      category: 'title',
      name: 'Título: [Imortal]',
      priceAC: 150,
      color: '#a855f7',
      prefixIcon: '⚡',
      desc: 'Exibe o título [Imortal] em púrpura mística com pulsação suave de energia arcana.'
    },
    {
      id: 'title_cacador_lendario',
      category: 'title',
      name: 'Título: [Caçador Lendário]',
      priceAC: 120,
      color: '#10b981',
      prefixIcon: '🏹',
      desc: 'Exibe o título [Caçador Lendário] em verde esmeralda para mestres do farm.'
    },
    {
      id: 'title_mestre_forja',
      category: 'title',
      name: 'Título: [Mestre da Forja]',
      priceAC: 120,
      color: '#f97316',
      prefixIcon: '🔨',
      desc: 'Exibe o título [Mestre da Forja] em laranja flamejante para mestres do encantamento.'
    },
    {
      id: 'frame_imperial_gold',
      category: 'avatar_frame',
      name: 'Moldura de Avatar: Ouro Imperial',
      priceAC: 100,
      desc: 'Borda dourada entalhada com asas que decora permanentemente o avatar do seu herói.'
    },
    {
      id: 'aura_battle_fire',
      category: 'combat_aura',
      name: 'Aura de Batalha: Chamas Vorazes',
      priceAC: 180,
      desc: 'Círculo de runas de fogo que gira aos pés do personagem durante as lutas.'
    }
  ],

  // ─── 4. UTILITÁRIOS & PASSES (CONVENIÊNCIA SAUDÁVEL) ───────────────────────
  utility_and_passes: [
    {
      id: 'pass_vip_teleport_30d',
      name: 'Passe de Teleporte VIP (30 Dias)',
      priceAC: 150,
      icon: 'gradec/jewels/jewel_blessed_necklace.png',
      desc: 'Teleportes instantâneos ilimitados para qualquer zona de caça de Aden sem custo de taxas de Adena por 30 dias.'
    },
    {
      id: 'scroll_blessed_weapon',
      name: 'Pergaminho Abençoado de Arma (Universal)',
      priceAC: 80,
      icon: 'scrolls/scroll_of_enchant_weapon_.png',
      desc: 'Encanta qualquer arma do jogo (+1). Em caso de falha, o equipamento é 100% protegido (não perde níveis nem quebra).'
    },
    {
      id: 'scroll_blessed_armor',
      name: 'Pergaminho Abençoado de Armadura (Universal)',
      priceAC: 50,
      icon: 'scrolls/scroll_of_enchant_armor.png',
      desc: 'Encanta qualquer armadura, escudo ou joia (+1). Em caso de falha, o equipamento é 100% protegido (não perde níveis nem quebra).'
    },
    {
      id: 'spellbook_4star_tome',
      name: 'Tomo Ancestral de Habilidade 4★',
      priceAC: 300,
      icon: 'spellbooks/spellbook_4star.png',
      desc: 'Tomo primordial necessário para desbloquear a Habilidade Suprema 4★ de Nível 80+ da sua 3ª Classe.'
    },
    {
      id: 'elixir_vigor_bundle_5',
      name: 'Pacote com 5x Elixires de Vigor (1h)',
      priceAC: 25,
      icon: 'consumables/berserker_elixir.png',
      desc: 'Frascos revigorantes que concedem +30% de Experiência e +30% de Adena por 1 hora cada.'
    }
  ],

  // ─── 5. OBTER ADEN COINS (TABELA DE DOAÇÃO PIX) ───────────────────────────
  donation_tiers: [
    {
      id: 'ac_pack_100',
      amountAC: 100,
      bonusAC: 0,
      priceBRL: 'R$ 7,50',
      label: 'Pacote Pequeno',
      desc: 'Ideal para adquirir o Starter Pack Tier 1 ou Passes Utilitários.'
    },
    {
      id: 'ac_pack_250',
      amountAC: 250,
      bonusAC: 0,
      priceBRL: 'R$ 15,00',
      label: 'Pacote Médio',
      desc: 'Perfeito para o Starter Pack Tier 2 Campeão ou Aparência de Arma.'
    },
    {
      id: 'ac_pack_550',
      amountAC: 500,
      bonusAC: 50,
      totalAC: 550,
      priceBRL: 'R$ 30,00',
      label: 'Pacote Lorde (+10% Bônus)',
      popular: true,
      desc: 'Suficiente para o Starter Pack Tier 3 com todo o Conjunto de Herança + Título + Agathion.'
    },
    {
      id: 'ac_pack_1200',
      amountAC: 1000,
      bonusAC: 200,
      totalAC: 1200,
      priceBRL: 'R$ 60,00',
      label: 'Cofre Real (+20% Bônus)',
      desc: 'Máximo valor por moeda com bônus generoso para quem deseja desbloquear trajes, auras e tomos.'
    }
  ]
};
