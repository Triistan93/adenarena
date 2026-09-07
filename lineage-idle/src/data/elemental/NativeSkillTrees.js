/**
 * NativeSkillTrees.js — Game Data Contract 3.2: Native Skill Trees for Active Classes
 * 
 * Defines exactly 100 skill slots (25 active classes × 4 slots), with formal roles,
 * structured elemental tags, unambiguous ownership, and unique identifiers.
 */

export const NATIVE_SKILL_TREES = {
  // ─── Human (5 classes = 20 skills) ─────────────────────────────────────────
  human_fighter: [
    { id: 'shield_bash', classId: 'human_fighter', slot: 1, name: 'Investida de Escudo', tier: 1, role: 'Crowd Control', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_shield_bash' },
    { id: 'cleave_strike', classId: 'human_fighter', slot: 2, name: 'Golpe Ceifador', tier: 1, role: 'Area Damage', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_cleave_strike' },
    { id: 'iron_stance', classId: 'human_fighter', slot: 3, name: 'Postura de Ferro', tier: 1, role: 'Defensive / Shield', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_iron_stance' },
    { id: 'concussive_stun', classId: 'human_fighter', slot: 4, name: 'Pancada Atordoante', tier: 1, role: 'Finisher / Execution', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_concussive_stun' }
  ],
  human_sorcerer: [
    { id: 'fireball', classId: 'human_sorcerer', slot: 1, name: 'Bola de Fogo', tier: 1, role: 'Burst Damage', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_fireball' },
    { id: 'magma_spike', classId: 'human_sorcerer', slot: 2, name: 'Espinho de Magma', tier: 1, role: 'Area Damage', tags: ['Magma'], elements: ['Magma'], vfxId: 'vfx_magma_spike' },
    { id: 'holy_bolt', classId: 'human_sorcerer', slot: 3, name: 'Raio Sagrado', tier: 1, role: 'Burst Damage', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_holy_bolt' },
    { id: 'flame_nova', classId: 'human_sorcerer', slot: 4, name: 'Nova Flamejante', tier: 1, role: 'Area Damage', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_flame_nova' }
  ],
  human_death_knight: [
    { id: 'cinderblade', classId: 'human_death_knight', slot: 1, name: 'Lâmina de Cinzas', tier: 1, role: 'Burst Damage', tags: ['Fire', 'Dark'], elements: ['Fire', 'Dark'], vfxId: 'vfx_cinderblade' },
    { id: 'hellfire_grasp', classId: 'human_death_knight', slot: 2, name: 'Garra Infernal', tier: 1, role: 'Crowd Control', tags: ['Fire', 'Dark'], elements: ['Fire', 'Dark'], vfxId: 'vfx_hellfire_grasp' },
    { id: 'ashen_shroud', classId: 'human_death_knight', slot: 3, name: 'Véu de Cinzas', tier: 1, role: 'Defensive / Shield', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_ashen_shroud' },
    { id: 'infernal_judgment', classId: 'human_death_knight', slot: 4, name: 'Julgamento Infernal', tier: 1, role: 'Finisher / Execution', tags: ['Fire', 'Dark'], elements: ['Fire', 'Dark'], vfxId: 'vfx_infernal_judgment' }
  ],
  human_warg: [
    { id: 'savage_bite', classId: 'human_warg', slot: 1, name: 'Mordida Selvagem', tier: 1, role: 'Burst Damage', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_savage_bite' },
    { id: 'pack_howl', classId: 'human_warg', slot: 2, name: 'Uivo de Matilha', tier: 1, role: 'Buff / Support', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_pack_howl' },
    { id: 'feral_pounce', classId: 'human_warg', slot: 3, name: 'Salto Feral', tier: 1, role: 'Mobility / Engage', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_feral_pounce' },
    { id: 'beast_form', classId: 'human_warg', slot: 4, name: 'Forma Bestial', tier: 1, role: 'Buff / Support', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_beast_form' }
  ],
  human_assassin: [
    { id: 'shadow_clone', classId: 'human_assassin', slot: 1, name: 'Clone de Sombra', tier: 1, role: 'Buff / Support', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_shadow_clone' },
    { id: 'gloom_strike', classId: 'human_assassin', slot: 2, name: 'Golpe Sombrio', tier: 1, role: 'Burst Damage', tags: ['Dark', 'Physical'], elements: ['Dark', 'Physical'], vfxId: 'vfx_gloom_strike' },
    { id: 'veil_step', classId: 'human_assassin', slot: 3, name: 'Passo do Véu', tier: 1, role: 'Mobility / Engage', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_veil_step' },
    { id: 'night_execution', classId: 'human_assassin', slot: 4, name: 'Execução Noturna', tier: 1, role: 'Finisher / Execution', tags: ['Dark', 'Physical'], elements: ['Dark', 'Physical'], vfxId: 'vfx_night_execution' }
  ],

  // ─── Elf (3 classes = 12 skills) ───────────────────────────────────────────
  elf_fighter: [
    { id: 'aqua_arrow', classId: 'elf_fighter', slot: 1, name: 'Flecha Aquática', tier: 1, role: 'Burst Damage', tags: ['Water', 'Physical'], elements: ['Water', 'Physical'], vfxId: 'vfx_aqua_arrow' },
    { id: 'tide_step', classId: 'elf_fighter', slot: 2, name: 'Passo da Maré', tier: 1, role: 'Mobility / Engage', tags: ['Water'], elements: ['Water'], vfxId: 'vfx_tide_step' },
    { id: 'mist_guard', classId: 'elf_fighter', slot: 3, name: 'Guarda de Névoa', tier: 1, role: 'Defensive / Shield', tags: ['Water'], elements: ['Water'], vfxId: 'vfx_mist_guard' },
    { id: 'riptide_volley', classId: 'elf_fighter', slot: 4, name: 'Rajada de Correnteza', tier: 1, role: 'Area Damage', tags: ['Water', 'Physical'], elements: ['Water', 'Physical'], vfxId: 'vfx_riptide_volley' }
  ],
  elf_mage: [
    { id: 'hydro_blast', classId: 'elf_mage', slot: 1, name: 'Explosão Hídrica', tier: 1, role: 'Burst Damage', tags: ['Water'], elements: ['Water'], vfxId: 'vfx_hydro_blast' },
    { id: 'blizzard', classId: 'elf_mage', slot: 2, name: 'Nevasca', tier: 1, role: 'Area Damage', tags: ['Ice'], elements: ['Ice'], vfxId: 'vfx_blizzard' },
    { id: 'healing_wave', classId: 'elf_mage', slot: 3, name: 'Onda Curativa', tier: 1, role: 'Sustain / Heal', tags: ['Holy', 'Water'], elements: ['Holy', 'Water'], vfxId: 'vfx_healing_wave' },
    { id: 'tidal_surge', classId: 'elf_mage', slot: 4, name: 'Surto de Maré', tier: 1, role: 'Finisher / Execution', tags: ['Water'], elements: ['Water'], vfxId: 'vfx_tidal_surge' }
  ],
  elf_death_knight: [
    { id: 'frost_edge', classId: 'elf_death_knight', slot: 1, name: 'Fio de Gelo', tier: 1, role: 'Burst Damage', tags: ['Ice', 'Dark'], elements: ['Ice', 'Dark'], vfxId: 'vfx_frost_edge' },
    { id: 'shattering_gaze', classId: 'elf_death_knight', slot: 2, name: 'Olhar Estilhaçante', tier: 1, role: 'Crowd Control', tags: ['Ice', 'Dark'], elements: ['Ice', 'Dark'], vfxId: 'vfx_shattering_gaze' },
    { id: 'cursed_frost_veil', classId: 'elf_death_knight', slot: 3, name: 'Véu de Gelo Amaldiçoado', tier: 1, role: 'Defensive / Shield', tags: ['Ice', 'Dark'], elements: ['Ice', 'Dark'], vfxId: 'vfx_cursed_frost_veil' },
    { id: 'glacial_judgment', classId: 'elf_death_knight', slot: 4, name: 'Julgamento Glacial', tier: 1, role: 'Finisher / Execution', tags: ['Ice', 'Dark'], elements: ['Ice', 'Dark'], vfxId: 'vfx_glacial_judgment' }
  ],

  // ─── Dark Elf (5 classes = 20 skills) ──────────────────────────────────────
  dark_elf_fighter: [
    { id: 'venom_edge', classId: 'dark_elf_fighter', slot: 1, name: 'Fio Venenoso', tier: 1, role: 'Burst Damage', tags: ['Dark', 'Poison'], elements: ['Dark', 'Poison'], vfxId: 'vfx_venom_edge' },
    { id: 'life_siphon', classId: 'dark_elf_fighter', slot: 2, name: 'Sifão de Vida', tier: 1, role: 'Sustain / Heal', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_life_siphon' },
    { id: 'umbral_dash', classId: 'dark_elf_fighter', slot: 3, name: 'Investida Umbral', tier: 1, role: 'Mobility / Engage', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_umbral_dash' },
    { id: 'crippling_slash', classId: 'dark_elf_fighter', slot: 4, name: 'Corte Mutilante', tier: 1, role: 'Debuff / Hex', tags: ['Dark', 'Physical'], elements: ['Dark', 'Physical'], vfxId: 'vfx_crippling_slash' }
  ],
  dark_elf_mage: [
    { id: 'hurricane', classId: 'dark_elf_mage', slot: 1, name: 'Furacão', tier: 1, role: 'Area Damage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_hurricane' },
    { id: 'chain_lightning', classId: 'dark_elf_mage', slot: 2, name: 'Corrente de Raios', tier: 1, role: 'Burst Damage', tags: ['Lightning'], elements: ['Lightning'], vfxId: 'vfx_chain_lightning' },
    { id: 'curse_of_shadow', classId: 'dark_elf_mage', slot: 3, name: 'Maldição das Sombras', tier: 1, role: 'Debuff / Hex', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_curse_of_shadow' },
    { id: 'gale_slash', classId: 'dark_elf_mage', slot: 4, name: 'Corte de Rajada', tier: 1, role: 'Burst Damage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_gale_slash' }
  ],
  dark_elf_death_knight: [
    { id: 'voltaic_edge', classId: 'dark_elf_death_knight', slot: 1, name: 'Fio Voltaico', tier: 1, role: 'Burst Damage', tags: ['Lightning', 'Dark'], elements: ['Lightning', 'Dark'], vfxId: 'vfx_voltaic_edge' },
    { id: 'storm_judgment', classId: 'dark_elf_death_knight', slot: 2, name: 'Julgamento da Tempestade', tier: 1, role: 'Finisher / Execution', tags: ['Lightning', 'Dark'], elements: ['Lightning', 'Dark'], vfxId: 'vfx_storm_judgment' },
    { id: 'thunder_veil', classId: 'dark_elf_death_knight', slot: 3, name: 'Véu de Trovão', tier: 1, role: 'Defensive / Shield', tags: ['Lightning', 'Dark'], elements: ['Lightning', 'Dark'], vfxId: 'vfx_thunder_veil' },
    { id: 'shocking_grasp', classId: 'dark_elf_death_knight', slot: 4, name: 'Garra Eletrizante', tier: 1, role: 'Crowd Control', tags: ['Lightning', 'Dark'], elements: ['Lightning', 'Dark'], vfxId: 'vfx_shocking_grasp' }
  ],
  dark_elf_assassin: [
    { id: 'toxic_flurry', classId: 'dark_elf_assassin', slot: 1, name: 'Rajada Tóxica', tier: 1, role: 'Area Damage', tags: ['Poison', 'Dark'], elements: ['Poison', 'Dark'], vfxId: 'vfx_toxic_flurry' },
    { id: 'venom_fang', classId: 'dark_elf_assassin', slot: 2, name: 'Presa Venenosa', tier: 1, role: 'Burst Damage', tags: ['Poison'], elements: ['Poison'], vfxId: 'vfx_venom_fang' },
    { id: 'shadow_toxin', classId: 'dark_elf_assassin', slot: 3, name: 'Toxina Sombria', tier: 1, role: 'Debuff / Hex', tags: ['Dark', 'Poison'], elements: ['Dark', 'Poison'], vfxId: 'vfx_shadow_toxin' },
    { id: 'lethal_dose', classId: 'dark_elf_assassin', slot: 4, name: 'Dose Letal', tier: 1, role: 'Finisher / Execution', tags: ['Poison', 'Dark'], elements: ['Poison', 'Dark'], vfxId: 'vfx_lethal_dose' }
  ],
  dark_elf_blood_rose: [
    { id: 'thorned_hex', classId: 'dark_elf_blood_rose', slot: 1, name: 'Maldição Espinhosa', tier: 1, role: 'Debuff / Hex', tags: ['Dark', 'Blood'], elements: ['Dark', 'Blood'], vfxId: 'vfx_thorned_hex' },
    { id: 'crimson_drain', classId: 'dark_elf_blood_rose', slot: 2, name: 'Dreno Carmesim', tier: 1, role: 'Sustain / Heal', tags: ['Blood'], elements: ['Blood'], vfxId: 'vfx_crimson_drain' },
    { id: 'wilting_touch', classId: 'dark_elf_blood_rose', slot: 3, name: 'Toque Murchante', tier: 1, role: 'Debuff / Hex', tags: ['Dark', 'Blood'], elements: ['Dark', 'Blood'], vfxId: 'vfx_wilting_touch' },
    { id: 'rose_requiem', classId: 'dark_elf_blood_rose', slot: 4, name: 'Réquiem da Rosa', tier: 1, role: 'Finisher / Execution', tags: ['Dark', 'Blood'], elements: ['Dark', 'Blood'], vfxId: 'vfx_rose_requiem' }
  ],

  // ─── Orc (3 classes = 12 skills) ───────────────────────────────────────────
  orc_fighter: [
    { id: 'totem_rage', classId: 'orc_fighter', slot: 1, name: 'Fúria do Totem', tier: 1, role: 'Buff / Support', tags: ['Fire', 'Physical'], elements: ['Fire', 'Physical'], vfxId: 'vfx_totem_rage' },
    { id: 'brutal_cleave', classId: 'orc_fighter', slot: 2, name: 'Talho Brutal', tier: 1, role: 'Area Damage', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_brutal_cleave' },
    { id: 'war_stomp', classId: 'orc_fighter', slot: 3, name: 'Pisão de Guerra', tier: 1, role: 'Crowd Control', tags: ['Physical', 'Fire'], elements: ['Physical', 'Fire'], vfxId: 'vfx_war_stomp' },
    { id: 'blood_frenzy', classId: 'orc_fighter', slot: 4, name: 'Frenesi Sanguinário', tier: 1, role: 'Buff / Support', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_blood_frenzy' }
  ],
  orc_shaman: [
    { id: 'flame_totem', classId: 'orc_shaman', slot: 1, name: 'Totem de Chamas', tier: 1, role: 'Buff / Support', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_flame_totem' },
    { id: 'war_chant', classId: 'orc_shaman', slot: 2, name: 'Cântico de Guerra', tier: 1, role: 'Buff / Support', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_war_chant' },
    { id: 'ember_bolt', classId: 'orc_shaman', slot: 3, name: 'Raio de Brasa', tier: 1, role: 'Burst Damage', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_ember_bolt' },
    { id: 'scorching_ground', classId: 'orc_shaman', slot: 4, name: 'Solo Escaldante', tier: 1, role: 'Area Damage', tags: ['Fire'], elements: ['Fire'], vfxId: 'vfx_scorching_ground' }
  ],
  orc_vanguard_rider: [
    { id: 'flaming_charge', classId: 'orc_vanguard_rider', slot: 1, name: 'Investida Flamejante', tier: 1, role: 'Mobility / Engage', tags: ['Physical', 'Fire'], elements: ['Physical', 'Fire'], vfxId: 'vfx_flaming_charge' },
    { id: 'spear_of_embers', classId: 'orc_vanguard_rider', slot: 2, name: 'Lança de Brasas', tier: 1, role: 'Burst Damage', tags: ['Physical', 'Fire'], elements: ['Physical', 'Fire'], vfxId: 'vfx_spear_of_embers' },
    { id: 'trample', classId: 'orc_vanguard_rider', slot: 3, name: 'Atropelamento', tier: 1, role: 'Crowd Control', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_trample' },
    { id: 'wildfire_lance', classId: 'orc_vanguard_rider', slot: 4, name: 'Lança de Fogo Selvagem', tier: 1, role: 'Finisher / Execution', tags: ['Fire', 'Physical'], elements: ['Fire', 'Physical'], vfxId: 'vfx_wildfire_lance' }
  ],

  // ─── Dwarf (3 classes = 12 skills) ─────────────────────────────────────────
  dwarf_artisan: [
    { id: 'hammer_slam', classId: 'dwarf_artisan', slot: 1, name: 'Martelada', tier: 1, role: 'Burst Damage', tags: ['Earth', 'Physical'], elements: ['Earth', 'Physical'], vfxId: 'vfx_hammer_slam' },
    { id: 'construct_summon', classId: 'dwarf_artisan', slot: 2, name: 'Invocar Construto', tier: 1, role: 'Buff / Support', tags: ['Earth', 'Metal'], elements: ['Earth', 'Metal'], vfxId: 'vfx_construct_summon' },
    { id: 'reinforced_plating', classId: 'dwarf_artisan', slot: 3, name: 'Blindagem Reforçada', tier: 1, role: 'Defensive / Shield', tags: ['Metal'], elements: ['Metal'], vfxId: 'vfx_reinforced_plating' },
    { id: 'seismic_stun', classId: 'dwarf_artisan', slot: 4, name: 'Atordoamento Sísmico', tier: 1, role: 'Crowd Control', tags: ['Earth', 'Physical'], elements: ['Earth', 'Physical'], vfxId: 'vfx_seismic_stun' }
  ],
  dwarf_mage: [
    { id: 'terremoto', classId: 'dwarf_mage', slot: 1, name: 'Terremoto', tier: 1, role: 'Area Damage', tags: ['Earth'], elements: ['Earth'], vfxId: 'vfx_terremoto' },
    { id: 'rochedo', classId: 'dwarf_mage', slot: 2, name: 'Rochedo', tier: 1, role: 'Burst Damage', tags: ['Earth'], elements: ['Earth'], vfxId: 'vfx_rochedo' },
    { id: 'golem_de_metal', classId: 'dwarf_mage', slot: 3, name: 'Golem de Metal', tier: 1, role: 'Buff / Support', tags: ['Metal'], elements: ['Metal'], vfxId: 'vfx_golem_de_metal' },
    { id: 'garra_metalica', classId: 'dwarf_mage', slot: 4, name: 'Garra Metálica', tier: 1, role: 'Burst Damage', tags: ['Metal'], elements: ['Metal'], vfxId: 'vfx_garra_metalica' }
  ],
  dwarf_shinemaker: [
    { id: 'radiant_hammer', classId: 'dwarf_shinemaker', slot: 1, name: 'Martelo Radiante', tier: 1, role: 'Burst Damage', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_radiant_hammer' },
    { id: 'guiding_light', classId: 'dwarf_shinemaker', slot: 2, name: 'Luz Guia', tier: 1, role: 'Buff / Support', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_guiding_light' },
    { id: 'celestial_forge', classId: 'dwarf_shinemaker', slot: 3, name: 'Forja Celestial', tier: 1, role: 'Buff / Support', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_celestial_forge' },
    { id: 'sunfall_smash', classId: 'dwarf_shinemaker', slot: 4, name: 'Golpe do Sol Poente', tier: 1, role: 'Finisher / Execution', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_sunfall_smash' }
  ],

  // ─── Kamael (2 classes = 8 skills) ─────────────────────────────────────────
  kamael_soulbreaker: [
    { id: 'soul_rend', classId: 'kamael_soulbreaker', slot: 1, name: 'Ruptura da Alma', tier: 1, role: 'Burst Damage', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_soul_rend' },
    { id: 'abyssal_pierce', classId: 'kamael_soulbreaker', slot: 2, name: 'Perfuração Abissal', tier: 1, role: 'Burst Damage', tags: ['Dark', 'Physical'], elements: ['Dark', 'Physical'], vfxId: 'vfx_abyssal_pierce' },
    { id: 'essence_drain', classId: 'kamael_soulbreaker', slot: 3, name: 'Dreno de Essência', tier: 1, role: 'Sustain / Heal', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_essence_drain' },
    { id: 'shadowmark', classId: 'kamael_soulbreaker', slot: 4, name: 'Marca Sombria', tier: 1, role: 'Debuff / Hex', tags: ['Dark'], elements: ['Dark'], vfxId: 'vfx_shadowmark' }
  ],
  kamael_samurai: [
    { id: 'iaijutsu_strike', classId: 'kamael_samurai', slot: 1, name: 'Golpe Iaijutsu', tier: 1, role: 'Burst Damage', tags: ['Physical', 'Wind'], elements: ['Physical', 'Wind'], vfxId: 'vfx_iaijutsu_strike' },
    { id: 'gale_step', classId: 'kamael_samurai', slot: 2, name: 'Passo de Rajada', tier: 1, role: 'Mobility / Engage', tags: ['Wind', 'Physical'], elements: ['Wind', 'Physical'], vfxId: 'vfx_gale_step' },
    { id: 'silent_edge', classId: 'kamael_samurai', slot: 3, name: 'Fio Silencioso', tier: 1, role: 'Burst Damage', tags: ['Physical'], elements: ['Physical'], vfxId: 'vfx_silent_edge' },
    { id: 'tempest_form', classId: 'kamael_samurai', slot: 4, name: 'Forma da Tempestade', tier: 1, role: 'Buff / Support', tags: ['Wind', 'Physical'], elements: ['Wind', 'Physical'], vfxId: 'vfx_tempest_form' }
  ],

  // ─── Ertheia / Sylph (2 classes = 8 skills) ────────────────────────────────
  ertheia_storm_blaster: [
    { id: 'gale_shot', classId: 'ertheia_storm_blaster', slot: 1, name: 'Disparo de Rajada', tier: 1, role: 'Burst Damage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_gale_shot' },
    { id: 'cyclone_trap', classId: 'ertheia_storm_blaster', slot: 2, name: 'Armadilha Ciclone', tier: 1, role: 'Crowd Control', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_cyclone_trap' },
    { id: 'sky_dance', classId: 'ertheia_storm_blaster', slot: 3, name: 'Dança dos Céus', tier: 1, role: 'Mobility / Engage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_sky_dance' },
    { id: 'tempest_barrage', classId: 'ertheia_storm_blaster', slot: 4, name: 'Rajada de Tempestade', tier: 1, role: 'Area Damage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_tempest_barrage' }
  ],
  ertheia_marauder: [
    { id: 'whirlwind_dash', classId: 'ertheia_marauder', slot: 1, name: 'Investida Redemoinho', tier: 1, role: 'Mobility / Engage', tags: ['Wind', 'Physical'], elements: ['Wind', 'Physical'], vfxId: 'vfx_whirlwind_dash' },
    { id: 'spirit_gale', classId: 'ertheia_marauder', slot: 2, name: 'Rajada Espiritual', tier: 1, role: 'Burst Damage', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_spirit_gale' },
    { id: 'twin_gust_slash', classId: 'ertheia_marauder', slot: 3, name: 'Corte Duplo de Rajada', tier: 1, role: 'Burst Damage', tags: ['Wind', 'Physical'], elements: ['Wind', 'Physical'], vfxId: 'vfx_twin_gust_slash' },
    { id: 'tempest_veil', classId: 'ertheia_marauder', slot: 4, name: 'Véu da Tempestade', tier: 1, role: 'Buff / Support', tags: ['Wind'], elements: ['Wind'], vfxId: 'vfx_tempest_veil' }
  ],

  // ─── High Elf (2 classes = 8 skills) ───────────────────────────────────────
  high_elf_divine_templar: [
    { id: 'divine_bulwark', classId: 'high_elf_divine_templar', slot: 1, name: 'Baluarte Divino', tier: 1, role: 'Defensive / Shield', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_divine_bulwark' },
    { id: 'retribution_flare', classId: 'high_elf_divine_templar', slot: 2, name: 'Labareda da Retribuição', tier: 1, role: 'Burst Damage', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_retribution_flare' },
    { id: 'sacred_ward', classId: 'high_elf_divine_templar', slot: 3, name: 'Proteção Sagrada', tier: 1, role: 'Defensive / Shield', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_sacred_ward' },
    { id: 'light_point_judgment', classId: 'high_elf_divine_templar', slot: 4, name: 'Julgamento de Light Point', tier: 1, role: 'Finisher / Execution', tags: ['Holy'], elements: ['Holy'], vfxId: 'vfx_light_point_judgment' }
  ],
  high_elf_element_weaver: [
    { id: 'triad_combo', classId: 'high_elf_element_weaver', slot: 1, name: 'Combo da Tríade', tier: 1, role: 'Burst Damage', tags: ['Fire', 'Water', 'Wind'], elements: ['Fire', 'Water', 'Wind'], isException: true, vfxId: 'vfx_triad_combo' },
    { id: 'elemental_fusion', classId: 'high_elf_element_weaver', slot: 2, name: 'Fusão Elemental', tier: 1, role: 'Area Damage', tags: ['Fire', 'Water', 'Wind'], elements: ['Fire', 'Water', 'Wind'], isException: true, vfxId: 'vfx_elemental_fusion' },
    { id: 'cascading_storm', classId: 'high_elf_element_weaver', slot: 3, name: 'Tempestade em Cascata', tier: 1, role: 'Area Damage', tags: ['Water', 'Wind'], elements: ['Water', 'Wind'], isException: true, vfxId: 'vfx_cascading_storm' },
    { id: 'phoenix_tide', classId: 'high_elf_element_weaver', slot: 4, name: 'Maré da Fênix', tier: 1, role: 'Finisher / Execution', tags: ['Fire', 'Water'], elements: ['Fire', 'Water'], isException: true, vfxId: 'vfx_phoenix_tide' }
  ]
};

/**
 * Flat list of all 100 native skill definitions.
 */
export const ALL_NATIVE_SKILLS = Object.values(NATIVE_SKILL_TREES).flat();

/**
 * Fast lookup map from skillId -> SkillDefinition.
 */
export const NATIVE_SKILLS_BY_ID = new Map(ALL_NATIVE_SKILLS.map(s => [s.id, s]));

/**
 * Retrieves native skills for a given class ID.
 * @param {string} classId
 * @returns {object[]}
 */
export function getNativeSkillsByClass(classId) {
  return NATIVE_SKILL_TREES[classId] || [];
}

/**
 * Retrieves a single native skill definition by ID.
 * @param {string} skillId
 * @returns {object|null}
 */
export function getNativeSkillById(skillId) {
  return NATIVE_SKILLS_BY_ID.get(skillId) || null;
}

/**
 * Formal canonical skill roles taxonomy.
 */
export const CANONICAL_SKILL_ROLES = [
  'Burst Damage',
  'Area Damage',
  'Crowd Control',
  'Defensive / Shield',
  'Finisher / Execution',
  'Buff / Support',
  'Mobility / Engage',
  'Sustain / Heal',
  'Debuff / Hex'
];

/**
 * Checks if a skill natively belongs to a given active class.
 * @param {string} skillId
 * @param {string} classId
 * @returns {boolean}
 */
export function isNativeToClass(skillId, classId) {
  const skill = getNativeSkillById(skillId);
  return Boolean(skill && skill.classId === classId);
}
