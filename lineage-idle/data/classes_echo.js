// ============================================================
// LINEAGE 2 ESSENCE 547 - ECHO OF ELEMENTS
// classes_echo.js - VERSÃO COMPLETA
// Regra: Skills aprendidas nas classes anteriores PERMANECEM
// ============================================================

const RACES_ECHO = {
  human:    { name: 'Human',     desc: 'Versáteis, equilibrados em combate e magia.',       stats: { atk: 0,  def: 0,  eva: 0,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  elf:      { name: 'Elf',       desc: 'Graciosos, alta esquiva e velocidade de ataque.',    stats: { atk: 0,  def:-2,  eva: 8,  matk: 0,  mdef: 0  }, startZone: 'elvenForest' },
  darkelf:  { name: 'Dark Elf',  desc: 'Sombrios, dano crítico e magia negra devastadora.', stats: { atk: 2,  def:-2,  eva: 4,  matk: 6,  mdef: 2  }, startZone: 'darkForest' },
  orc:      { name: 'Orc',       desc: 'Resistentes, força bruta e HP elevado.',             stats: { atk: 4,  def: 6,  eva:-4,  matk:-2,  mdef:-2 }, startZone: 'orcVillage' },
  dwarf:    { name: 'Dwarf',     desc: 'Mestres artesãos com bônus de loot e craft.',        stats: { atk: 0,  def: 4,  eva:-2,  matk: 0,  mdef: 0, lootBonus: 0.15 }, startZone: 'dwarvenMine' },
  kamael:   { name: 'Kamael',    desc: 'Ágeis e mortais, especialistas em alma e espada.',   stats: { atk: 6,  def:-2,  eva: 6,  matk: 0,  mdef: 0  }, startZone: 'kamaelLair' },
  sylph:    { name: 'Sylph',     desc: 'Atiradores elementais do vento com armas de fogo.', stats: { atk: 4,  def:-2,  eva:12,  matk: 2,  mdef: 0  }, startZone: 'talkingIsland' },
  highelf:  { name: 'High Elf',  desc: 'Elfos supremos com magia sagrada e defesa divina.', stats: { atk: 0,  def: 2,  eva: 4,  matk: 8,  mdef: 4  }, startZone: 'elvenForest' },
  ertheia:  { name: 'Ertheia',   desc: 'Guerreiros do vento com alto potencial mágico.',    stats: { atk: 2,  def: 0,  eva:10,  matk: 4,  mdef: 0  }, startZone: 'talkingIsland' }
};

// ============================================================
//  FORMATO DE SKILL:
//  { name, type, rarity, effect, duration, cooldown, desc }
//  type: "Ativo" | "Passivo" | "Toggle" | "Self-Buff" | "Party-Buff"
//  rarity: "1★" | "2★" | "3★" | "4★"
//  Regra: Skills aprendidas em classes anteriores PERMANECEM
// ============================================================

const CLASSES_ECHO = {

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  //  HUMAN FIGHTER
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  fighter: {
    name: 'Human Fighter', archetype: 'fighter', race: 'human', stage: 0,
    desc: 'Classe base de combate humana.',
    base: { atk: 12, def: 10, hp: 100, mp: 30, eva: 5, crit: 5, matk: 0, mdef: 5 },
    skills: [
      { name: "Power Strike",       type: "Ativo",    rarity: "1★", effect: "Dano físico 150%",              cooldown: "8s",     desc: "Golpe concentrado no alvo." },
      { name: "Mortal Blow",         type: "Ativo",    rarity: "1★", effect: "Dano 170% + chance crit 20%",   cooldown: "10s",    desc: "Golpe com chance de crítico elevada." },
      { name: "Power Shot",          type: "Ativo",    rarity: "1★", effect: "Dano à distância 140%",         cooldown: "9s",     desc: "Disparo concentrado." },
      { name: "Rush",                type: "Ativo",    rarity: "1★", effect: "Avança ao alvo + dano 120%",    cooldown: "15s",    desc: "Investida rápida contra o inimigo." },
      { name: "Bandage",             type: "Ativo",    rarity: "1★", effect: "Cura 15% HP",                   cooldown: "30s",    desc: "Curativo de emergência." },
      { name: "Fighter's Will",      type: "Self-Buff",rarity: "1★", effect: "+10% ATK e +10% DEF por 15 min",cooldown: "30 min", desc: "Determinação do guerreiro." },
      { name: "HP Increase Lv1",     type: "Passivo",  rarity: "1★", effect: "+5% Max HP",                    cooldown: "N/A",    desc: "Constituição reforçada." },
      { name: "Light Armor Mastery", type: "Passivo",  rarity: "1★", effect: "+8% DEF com armadura leve",     cooldown: "N/A",    desc: "Maestria em armaduras leves." }
    ]
  },

  // ─── WARRIOR (1ª classe) ───
  warrior: {
    name: 'Warrior', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1,
    desc: 'Guerreiro corpo-a-corpo especializado em espadas e polearms. Skills anteriores permanecem.',
    base: { atk: 28, def: 18, hp: 180, mp: 45, eva: 6, crit: 8, mdef: 8 },
    skills: [
      { name: "Power Smash",           type: "Ativo",    rarity: "1★", effect: "Dano 190% + knockback",               cooldown: "10s",    desc: "Golpe esmagador." },
      { name: "Spinning Slash",        type: "Ativo",    rarity: "1★", effect: "Dano AoE 160% ao redor",              cooldown: "12s",    desc: "Giro cortante ao redor." },
      { name: "Stun Attack",           type: "Ativo",    rarity: "2★", effect: "Dano 175% + stun 2s",                 cooldown: "18s",    desc: "Golpe atordoante." },
      { name: "Iron Will",             type: "Ativo",    rarity: "2★", effect: "+30% DEF por 30s",                    cooldown: "45s",    desc: "Vontade de ferro temporária." },
      { name: "War Cry",               type: "Ativo",    rarity: "2★", effect: "+20% ATK para si por 60s",            cooldown: "60s",    desc: "Grito de guerra que inspira força." },
      { name: "Battle Roar",           type: "Self-Buff",rarity: "2★", effect: "+25% ATK e +15% HP por 20 min",       cooldown: "45 min", desc: "Rugido de batalha." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1★", effect: "+12% ATK com espada/blunt",           cooldown: "N/A",    desc: "Maestria em espadas e maças." },
      { name: "Polearm Mastery",       type: "Passivo",  rarity: "1★", effect: "+12% ATK com polearm",                cooldown: "N/A",    desc: "Maestria em lanças." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1★", effect: "+12% DEF com armadura pesada",        cooldown: "N/A",    desc: "Maestria em armaduras pesadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1★", effect: "+10% Max HP",                         cooldown: "N/A",    desc: "Constituição de guerreiro." },
      { name: "Weight Limit",          type: "Passivo",  rarity: "1★", effect: "+15% capacidade de carga",            cooldown: "N/A",    desc: "Corpo treinado para suportar peso." }
    ]
  },

  // ─── GLADIATOR (2ª classe) ───
  gladiator: {
    name: 'Gladiator', parent: 'warrior', stage: 2,
    desc: 'Mestre em dual wield e combos devastadores. Skills anteriores permanecem.',
    base: { atk: 58, def: 28, hp: 320, mp: 65, eva: 8, crit: 18, mdef: 12 },
    skills: [
      { name: "Triple Slash",           type: "Ativo",    rarity: "2★", effect: "3 golpes, dano total 300%",           cooldown: "14s",    desc: "Três cortes rápidos consecutivos." },
      { name: "Sonic Blaster",          type: "Ativo",    rarity: "2★", effect: "Dano 240% + stun 2s",                cooldown: "16s",    desc: "Onda sônica que atordoa." },
      { name: "Sonic Storm",            type: "Ativo",    rarity: "3★", effect: "Dano AoE 320% (8 alvos)",            cooldown: "25s",    desc: "Tempestade sônica devastadora." },
      { name: "Sonic Buster",           type: "Ativo",    rarity: "2★", effect: "Dano 260% + pushback",               cooldown: "18s",    desc: "Explosão sônica frontal." },
      { name: "Double Sonic Slash",     type: "Ativo",    rarity: "3★", effect: "Dano 350% em 2 hits",                cooldown: "22s",    desc: "Duplo corte sônico." },
      { name: "Hammer Crush",           type: "Ativo",    rarity: "2★", effect: "Dano 230% + stun 3s",                cooldown: "20s",    desc: "Esmagamento com martelo." },
      { name: "Sonic Move",             type: "Ativo",    rarity: "2★", effect: "Teleporte curto + 180% dano",        cooldown: "20s",    desc: "Movimento sônico instantâneo." },
      { name: "Lionheart",              type: "Ativo",    rarity: "3★", effect: "Imune a medo/stun por 15s",          cooldown: "120s",   desc: "Coração de leão — coragem inabalável." },
      { name: "War Frenzy",             type: "Self-Buff",rarity: "2★", effect: "+20% ATK Speed por 60s",             cooldown: "90s",    desc: "Frenesi de combate." },
      { name: "Vicious Stance",         type: "Toggle",   rarity: "2★", effect: "+25% Crit Rate, -10% DEF",           cooldown: "N/A",    desc: "Postura agressiva permanente." },
      { name: "Gladiator's Harmony",    type: "Self-Buff",rarity: "3★", effect: "+35% ATK e +20% Crit por 25 min",    cooldown: "60 min", desc: "Harmonia do gladiador." },
      { name: "Dual Weapon Mastery",    type: "Passivo",  rarity: "2★", effect: "+18% ATK com dual weapons",          cooldown: "N/A",    desc: "Maestria em armas duplas." },
      { name: "Focus",                  type: "Passivo",  rarity: "1★", effect: "+8% Crit Rate",                      cooldown: "N/A",    desc: "Concentração em pontos vitais." },
      { name: "Critical Power",         type: "Passivo",  rarity: "2★", effect: "+15% Crit Damage",                   cooldown: "N/A",    desc: "Poder crítico aumentado." },
      { name: "Boost HP",               type: "Passivo",  rarity: "1★", effect: "+12% Max HP",                        cooldown: "N/A",    desc: "HP reforçado do gladiador." }
    ]
  },

  // ─── DUELIST (3ª classe) ───
  duelist: {
    name: 'Duelist', parent: 'gladiator', stage: 3,
    desc: 'Duelista supremo, mestre do dual wield. Skills anteriores permanecem.',
    base: { atk: 105, def: 42, hp: 580, mp: 95, eva: 12, crit: 30, mdef: 18 },
    skills: [
      { name: "Sonic Focus",               type: "Ativo",    rarity: "3★", effect: "Dano 380% + ignora 30% DEF",           cooldown: "28s",    desc: "Foco sônico devastador." },
      { name: "Force Blaster",             type: "Ativo",    rarity: "3★", effect: "Dano 340% à distância",                cooldown: "20s",    desc: "Projétil de força sônica." },
      { name: "Dual Blow",                 type: "Ativo",    rarity: "3★", effect: "Dano 400% + bleed 8s",                 cooldown: "24s",    desc: "Golpe duplo sangrento." },
      { name: "Rushing Force",             type: "Ativo",    rarity: "3★", effect: "Rush + 320% dano + stun 2s",           cooldown: "22s",    desc: "Avanço forçado." },
      { name: "Long Blow",                 type: "Ativo",    rarity: "2★", effect: "Dano 280% alcance estendido",          cooldown: "16s",    desc: "Golpe de longo alcance." },
      { name: "Force Buster",              type: "Ativo",    rarity: "3★", effect: "Dano AoE 360% frontal",               cooldown: "26s",    desc: "Explosão de força frontal." },
      { name: "Earthquake",                type: "Ativo",    rarity: "3★", effect: "Dano AoE 420% + knockdown 3s",         cooldown: "35s",    desc: "Terremoto devastador." },
      { name: "Real Target",               type: "Ativo",    rarity: "2★", effect: "Marca alvo: +30% dano contra ele 10s", cooldown: "30s",    desc: "Identifica ponto fraco." },
      { name: "Thrill Fight",              type: "Ativo",    rarity: "3★", effect: "+40% ATK por 30s quando HP < 30%",     cooldown: "120s",   desc: "Adrenalina em estado crítico." },
      { name: "Sonic Rage",                type: "Ativo",    rarity: "3★", effect: "Dano 450% + AoE 5 alvos",             cooldown: "30s",    desc: "Fúria sônica descontrolada." },
      { name: "Transcendent Dual Blow",    type: "Ativo",    rarity: "4★", effect: "Dano 620% + bleed 12s + ignora DEF",   cooldown: "150s",   desc: "Golpe duplo transcendente." },
      { name: "Duelist's Harmony",         type: "Self-Buff",rarity: "4★", effect: "+55% ATK, +40% Crit, +20% Speed 30min",cooldown: "90 min", desc: "Harmonia suprema do duelista." },
      { name: "Master of Combat",          type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% Crit, +5% PvE dmg",    cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Duelist Spirit",            type: "Passivo",  rarity: "3★", effect: "+15% dual weapon ATK",                 cooldown: "N/A",    desc: "Espírito do duelista." },
      { name: "Blade of the Duelist",      type: "Passivo",  rarity: "3★", effect: "+12% P.Skill Power",                   cooldown: "N/A",    desc: "Lâmina imbuída de poder." }
    ]
  },

  // ─── WARLORD (2ª classe) ───
  warlord: {
    name: 'Warlord', parent: 'warrior', stage: 2,
    desc: 'Senhor da guerra com polearms e AoE devastador. Skills anteriores permanecem.',
    base: { atk: 52, def: 38, hp: 380, mp: 60, eva: 5, crit: 10, mdef: 18 },
    skills: [
      { name: "Whirlwind",              type: "Ativo",    rarity: "2★", effect: "Dano AoE 280% (10 alvos)",           cooldown: "18s",    desc: "Redemoinho de lança." },
      { name: "Thunder Storm",          type: "Ativo",    rarity: "3★", effect: "Dano AoE 340% + stun 2s",           cooldown: "25s",    desc: "Tempestade trovejante." },
      { name: "Howl",                   type: "Ativo",    rarity: "2★", effect: "AoE taunt + -15% ATK inimigos 10s",  cooldown: "20s",    desc: "Uivo ameaçador." },
      { name: "Provoke",               type: "Ativo",    rarity: "1★", effect: "Taunt single + dano 120%",           cooldown: "10s",    desc: "Provocação direta." },
      { name: "Fellswoop",             type: "Ativo",    rarity: "2★", effect: "Dano 250% + knockdown 2s",            cooldown: "20s",    desc: "Golpe varredor." },
      { name: "Freezing Strike",       type: "Ativo",    rarity: "2★", effect: "Dano 220% + slow 30% por 8s",         cooldown: "18s",    desc: "Golpe congelante." },
      { name: "Burning Chop",          type: "Ativo",    rarity: "2★", effect: "Dano 240% + burn 8s",                 cooldown: "18s",    desc: "Golpe flamejante." },
      { name: "Shock Stomp",           type: "Ativo",    rarity: "2★", effect: "AoE 200% + stun 2s (perto)",          cooldown: "22s",    desc: "Pisão sísmico." },
      { name: "War Cry",               type: "Self-Buff",rarity: "2★", effect: "+25% ATK por 60s",                    cooldown: "90s",    desc: "Grito de guerra do senhor." },
      { name: "Warlord's Harmony",     type: "Self-Buff",rarity: "3★", effect: "+30% ATK, +25% HP por 25 min",        cooldown: "60 min", desc: "Harmonia do senhor da guerra." },
      { name: "Vital Force",           type: "Passivo",  rarity: "1★", effect: "+10% HP Regen",                       cooldown: "N/A",    desc: "Força vital." },
      { name: "Focus",                 type: "Passivo",  rarity: "1★", effect: "+8% Crit Rate",                       cooldown: "N/A",    desc: "Concentração." },
      { name: "Boost HP",              type: "Passivo",  rarity: "1★", effect: "+15% Max HP",                         cooldown: "N/A",    desc: "HP reforçado." }
    ]
  },

  // ─── DREADNOUGHT (3ª classe) ───
  dreadnought: {
    name: 'Dreadnought', parent: 'warlord', stage: 3,
    desc: 'Encouraçado vivo, AoE massivo com polearm. Skills anteriores permanecem.',
    base: { atk: 95, def: 62, hp: 650, mp: 85, eva: 6, crit: 14, mdef: 32 },
    skills: [
      { name: "Rush Impact",               type: "Ativo",    rarity: "3★", effect: "Rush + 350% dano + stun 3s",              cooldown: "25s",    desc: "Investida devastadora." },
      { name: "Dread Pool",                type: "Ativo",    rarity: "3★", effect: "AoE contínuo 200%/s por 5s (8 alvos)",    cooldown: "35s",    desc: "Área de terror." },
      { name: "Spike",                     type: "Ativo",    rarity: "3★", effect: "Dano 380% + penetra DEF 40%",             cooldown: "28s",    desc: "Estocada penetrante." },
      { name: "Anti-Magic Armor",          type: "Ativo",    rarity: "3★", effect: "+50% M.DEF por 20s",                      cooldown: "60s",    desc: "Armadura anti-mágica." },
      { name: "Weapon Blockade",           type: "Ativo",    rarity: "3★", effect: "Desarma inimigo por 5s",                  cooldown: "45s",    desc: "Bloqueio de arma." },
      { name: "Lionheart",                 type: "Ativo",    rarity: "3★", effect: "Imune a medo/stun 15s",                   cooldown: "120s",   desc: "Coração de leão." },
      { name: "War Frenzy",                type: "Self-Buff",rarity: "3★", effect: "+30% ATK Speed por 45s",                  cooldown: "90s",    desc: "Frenesi total." },
      { name: "Transcendent Whirlwind",    type: "Ativo",    rarity: "4★", effect: "Dano AoE 600% + knockdown (12 alvos)",    cooldown: "160s",   desc: "Redemoinho transcendente." },
      { name: "Dreadnought's Harmony",     type: "Self-Buff",rarity: "4★", effect: "+50% ATK, +35% HP, +20% DEF 30min",      cooldown: "90 min", desc: "Harmonia do encouraçado." },
      { name: "Master of Combat",          type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% AoE dmg, +5% PvE",        cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Dreadnought Spirit",        type: "Passivo",  rarity: "3★", effect: "+15% Polearm ATK",                        cooldown: "N/A",    desc: "Espírito do encouraçado." },
      { name: "Body of the Dreadnought",   type: "Passivo",  rarity: "3★", effect: "+10% Max HP, +10% DEF",                  cooldown: "N/A",    desc: "Corpo indestrutível." }
    ]
  },

  // ─── KNIGHT (1ª classe) ───
  knight: {
    name: 'Knight', parent: 'fighter', race: 'human', archetype: 'tank', stage: 1,
    desc: 'Cavaleiro tanque com escudo. Skills anteriores permanecem.',
    base: { atk: 18, def: 32, hp: 250, mp: 50, eva: 4, crit: 4, mdef: 18 },
    skills: [
      { name: "Shield Strike",         type: "Ativo",    rarity: "1★", effect: "Dano 170% + taunt 5s",             cooldown: "10s",    desc: "Golpe de escudo." },
      { name: "Hate",                  type: "Ativo",    rarity: "1★", effect: "Taunt alvo + aggro máximo",        cooldown: "8s",     desc: "Gera ódio no alvo." },
      { name: "Aura of Hate",          type: "Ativo",    rarity: "2★", effect: "AoE taunt (5 alvos) 8s",           cooldown: "18s",    desc: "Aura de ódio." },
      { name: "Power Break",           type: "Ativo",    rarity: "1★", effect: "Dano 150% + -20% ATK inimigo 8s",  cooldown: "14s",    desc: "Quebra de poder." },
      { name: "Divine Heal",           type: "Ativo",    rarity: "2★", effect: "Cura 20% HP próprio",              cooldown: "25s",    desc: "Cura divina." },
      { name: "Knight's Harmony",      type: "Self-Buff",rarity: "2★", effect: "+25% DEF e +20% HP por 20 min",    cooldown: "45 min", desc: "Harmonia do cavaleiro." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1★", effect: "+15% DEF com armadura pesada",     cooldown: "N/A",    desc: "Maestria em armaduras pesadas." },
      { name: "Shield Mastery",        type: "Passivo",  rarity: "1★", effect: "+15% Block Rate",                  cooldown: "N/A",    desc: "Maestria em escudos." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1★", effect: "+10% ATK espada/blunt",            cooldown: "N/A",    desc: "Maestria em espadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1★", effect: "+12% Max HP",                      cooldown: "N/A",    desc: "Constituição reforçada." },
      { name: "Deflect Arrow",         type: "Passivo",  rarity: "1★", effect: "+10% chance desviar projéteis",    cooldown: "N/A",    desc: "Desvio de projéteis." }
    ]
  },

  // ─── PALADIN (2ª classe) ───
  paladin: {
    name: 'Paladin', parent: 'knight', stage: 2,
    desc: 'Cavaleiro sagrado, tank com cura e proteção. Skills anteriores permanecem.',
    base: { atk: 38, def: 65, hp: 520, mp: 100, eva: 5, crit: 6, mdef: 42 },
    skills: [
      { name: "Shield Stun",           type: "Ativo",    rarity: "2★", effect: "Dano 210% + stun 3s",             cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Holy Blade",            type: "Ativo",    rarity: "2★", effect: "Dano sagrado 260%",               cooldown: "16s",    desc: "Lâmina sagrada." },
      { name: "Holy Strike",           type: "Ativo",    rarity: "3★", effect: "Dano sagrado 320% + undead 2x",   cooldown: "20s",    desc: "Golpe sagrado devastador." },
      { name: "Majesty",               type: "Ativo",    rarity: "3★", effect: "Não pode morrer por 7s (HP min 1)",cooldown: "180s",  desc: "Majestade divina." },
      { name: "Angelic Icon",          type: "Self-Buff",rarity: "3★", effect: "+30% DEF, +30% M.DEF por 30s",    cooldown: "120s",   desc: "Ícone angelical." },
      { name: "Sacrifice",             type: "Ativo",    rarity: "2★", effect: "Cura aliado 30% HP (gasta 10% próprio)",cooldown: "25s",desc: "Sacrifício pelo aliado." },
      { name: "Aegis",                 type: "Ativo",    rarity: "2★", effect: "+60% Block Rate por 15s",         cooldown: "45s",    desc: "Aegis defensivo." },
      { name: "Vengeance",             type: "Ativo",    rarity: "3★", effect: "Reflete 30% dano recebido por 15s",cooldown: "60s",   desc: "Vingança sagrada." },
      { name: "Ultimate Defense",      type: "Ativo",    rarity: "3★", effect: "+80% DEF, -50% ATK por 15s",      cooldown: "120s",   desc: "Defesa absoluta." },
      { name: "Holy Blessing",         type: "Ativo",    rarity: "2★", effect: "Remove 2 debuffs",                cooldown: "30s",    desc: "Bênção purificadora." },
      { name: "Summon Storm Cubic",    type: "Ativo",    rarity: "2★", effect: "Invoca cubic de dano lightning",   cooldown: "60s",    desc: "Cubic de tempestade." },
      { name: "Provoke",               type: "Ativo",    rarity: "1★", effect: "Taunt + aggro forte",             cooldown: "8s",     desc: "Provocação." },
      { name: "Paladin's Harmony",     type: "Self-Buff",rarity: "3★", effect: "+40% DEF, +30% HP, +20% M.DEF 25min",cooldown: "60 min",desc: "Harmonia do paladino." },
      { name: "Resist Holy/Dark",      type: "Passivo",  rarity: "2★", effect: "+15% resist holy/dark",           cooldown: "N/A",    desc: "Resistência sagrada." },
      { name: "Boost HP",              type: "Passivo",  rarity: "2★", effect: "+18% Max HP",                     cooldown: "N/A",    desc: "HP expandido." }
    ]
  },

  // ─── PHOENIX KNIGHT (3ª classe) ───
  phoenixKnight: {
    name: 'Phoenix Knight', parent: 'paladin', stage: 3,
    desc: 'Cavaleiro da Fênix, tank supremo com ressurreição. Skills anteriores permanecem.',
    base: { atk: 72, def: 105, hp: 850, mp: 140, eva: 6, crit: 8, mdef: 68 },
    skills: [
      { name: "Touch of Life",                type: "Ativo",    rarity: "3★", effect: "Cura AoE 25% HP (party)",               cooldown: "35s",    desc: "Toque vital da fênix." },
      { name: "Phoenix Aura",                 type: "Self-Buff",rarity: "3★", effect: "+45% DEF, +HP Regen 3%/s por 25min",    cooldown: "60 min", desc: "Aura da fênix." },
      { name: "Shield of Faith",              type: "Ativo",    rarity: "3★", effect: "Absorve 5000 dano por 15s",             cooldown: "90s",    desc: "Escudo de fé." },
      { name: "Flame Icon",                   type: "Ativo",    rarity: "3★", effect: "+35% ATK para party por 30s",           cooldown: "120s",   desc: "Ícone de chamas." },
      { name: "Celestial Shield",             type: "Ativo",    rarity: "4★", effect: "Party imune a dano por 5s",             cooldown: "300s",   desc: "Escudo celestial absoluto." },
      { name: "Summon Imperial Phoenix",      type: "Ativo",    rarity: "4★", effect: "Invoca fênix (dano+cura contínua 30s)", cooldown: "180s",   desc: "Fênix Imperial." },
      { name: "Transcendent Shield Charge",   type: "Ativo",    rarity: "4★", effect: "Rush + 500% dano + AoE taunt 10s",     cooldown: "160s",   desc: "Investida transcendente." },
      { name: "Phoenix Knight's Harmony",     type: "Self-Buff",rarity: "4★", effect: "+60% DEF, +40% HP, +30% M.DEF 30min",  cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Spirit of Phoenix",            type: "Passivo",  rarity: "4★", effect: "Ao morrer: revive com 30% HP (1x/30min)",cooldown: "N/A",   desc: "Espírito da fênix — auto-ressurreição." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3★", effect: "+10% ATK, +15% aggro, +5% PvE",        cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Protection of Faith",          type: "Passivo",  rarity: "3★", effect: "+12% resist all",                      cooldown: "N/A",    desc: "Proteção da fé." },
      { name: "Body of the Phoenix",          type: "Passivo",  rarity: "3★", effect: "+15% Max HP, +10% DEF",                cooldown: "N/A",    desc: "Corpo da fênix." }
    ]
  },

  // ─── DARK AVENGER (2ª classe) ───
  darkAvenger: {
    name: 'Dark Avenger', parent: 'knight', stage: 2,
    desc: 'Cavaleiro sombrio com pantera e drain. Skills anteriores permanecem.',
    base: { atk: 45, def: 55, hp: 480, mp: 90, eva: 5, crit: 8, mdef: 35 },
    skills: [
      { name: "Summon Dark Panther",    type: "Ativo",    rarity: "3★", effect: "Invoca pantera (ATK 60% do dono)",    cooldown: "90s",    desc: "Pantera das trevas." },
      { name: "Drain Health",           type: "Ativo",    rarity: "2★", effect: "Dano 220% + drena 30% como HP",      cooldown: "15s",    desc: "Drena vida do inimigo." },
      { name: "Horror",                 type: "Ativo",    rarity: "2★", effect: "Medo no alvo por 5s",                cooldown: "30s",    desc: "Terror sombrio." },
      { name: "Shield Stun",            type: "Ativo",    rarity: "2★", effect: "Dano 200% + stun 3s",               cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Judgment",               type: "Ativo",    rarity: "3★", effect: "Dano dark 300% + -20% DEF 10s",     cooldown: "22s",    desc: "Julgamento sombrio." },
      { name: "Touch of Death",         type: "Ativo",    rarity: "3★", effect: "Dano 280% + poison 10s",            cooldown: "20s",    desc: "Toque mortal." },
      { name: "Dark Flame",             type: "Ativo",    rarity: "2★", effect: "Dano AoE dark 240%",                cooldown: "18s",    desc: "Chamas sombrias." },
      { name: "Doom Shield",            type: "Ativo",    rarity: "3★", effect: "Absorve 3000 dano + reflete 15%",   cooldown: "60s",    desc: "Escudo da perdição." },
      { name: "Seed of Revenge",        type: "Ativo",    rarity: "2★", effect: "Marca: ao morrer causa 500% dano",  cooldown: "120s",   desc: "Semente da vingança." },
      { name: "Dark Avenger's Harmony", type: "Self-Buff",rarity: "3★", effect: "+35% ATK, +30% DEF, +20% drain 25min",cooldown: "60 min",desc: "Harmonia sombria." },
      { name: "Reflect Damage",         type: "Passivo",  rarity: "2★", effect: "Reflete 8% dano recebido",          cooldown: "N/A",    desc: "Reflexo de dano." },
      { name: "Boost HP",               type: "Passivo",  rarity: "2★", effect: "+16% Max HP",                       cooldown: "N/A",    desc: "HP reforçado." }
    ]
  },

  // ─── HELL KNIGHT (3ª classe) ───
  hellKnight: {
    name: 'Hell Knight', parent: 'darkAvenger', stage: 3,
    desc: 'Cavaleiro infernal com aura de trevas. Skills anteriores permanecem.',
    base: { atk: 82, def: 88, hp: 780, mp: 130, eva: 6, crit: 12, mdef: 55 },
    skills: [
      { name: "Insane Crusher",               type: "Ativo",    rarity: "3★", effect: "Dano 420% + stun 4s",                    cooldown: "28s",    desc: "Esmagamento insano." },
      { name: "Panther Cancel",               type: "Ativo",    rarity: "3★", effect: "Pantera explode: AoE 350% + fear 3s",    cooldown: "60s",    desc: "Explosão da pantera." },
      { name: "Anthem of Hell",               type: "Self-Buff",rarity: "3★", effect: "+40% ATK, +20% drain HP por 30s",        cooldown: "90s",    desc: "Hino infernal." },
      { name: "Gehenna",                      type: "Ativo",    rarity: "4★", effect: "AoE dark 500% + -30% heal recebida 10s", cooldown: "120s",   desc: "Portão do inferno." },
      { name: "Touch of Darkness",            type: "Ativo",    rarity: "3★", effect: "Dano 380% + silence 5s",                 cooldown: "30s",    desc: "Toque das trevas." },
      { name: "Summon Dark Panther Enhanced",  type: "Ativo",    rarity: "4★", effect: "Pantera aprimorada (ATK 80% do dono)",   cooldown: "120s",   desc: "Pantera das trevas aprimorada." },
      { name: "Transcendent Dark Strike",     type: "Ativo",    rarity: "4★", effect: "Dano 580% dark + drain 40% como HP",     cooldown: "150s",   desc: "Golpe sombrio transcendente." },
      { name: "Hell Knight's Harmony",        type: "Self-Buff",rarity: "4★", effect: "+55% ATK, +40% DEF, +30% drain 30min",   cooldown: "90 min", desc: "Harmonia infernal." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% drain, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Hell Knight Spirit",           type: "Passivo",  rarity: "3★", effect: "+15% dark ATK",                          cooldown: "N/A",    desc: "Espírito do cavaleiro infernal." },
      { name: "Body of the Hell Knight",      type: "Passivo",  rarity: "3★", effect: "+12% Max HP, +10% DEF",                 cooldown: "N/A",    desc: "Corpo infernal." },
      { name: "Protection of Darkness",       type: "Passivo",  rarity: "3★", effect: "+15% dark resist",                       cooldown: "N/A",    desc: "Proteção das trevas." }
    ]
  },

  // ─── ROGUE (1ª classe) ───
  rogue: {
    name: 'Rogue', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1,
    desc: 'Ladino ágil, especialista em dagger e bow. Skills anteriores permanecem.',
    base: { atk: 22, def: 12, hp: 150, mp: 40, eva: 15, crit: 12, mdef: 8 },
    skills: [
      { name: "Double Shot",          type: "Ativo",    rarity: "1★", effect: "2 disparos, dano total 200%",      cooldown: "10s",    desc: "Duplo disparo." },
      { name: "Backstab",             type: "Ativo",    rarity: "2★", effect: "Dano 250% por trás + crit garantido",cooldown: "14s",  desc: "Punhalada nas costas." },
      { name: "Dash",                 type: "Ativo",    rarity: "1★", effect: "+50% Speed por 8s",                cooldown: "20s",    desc: "Corrida rápida." },
      { name: "Unlock",               type: "Ativo",    rarity: "1★", effect: "Abre baús/portas",                 cooldown: "5s",     desc: "Destravar." },
      { name: "Rogue's Harmony",      type: "Self-Buff",rarity: "2★", effect: "+20% EVA, +15% Crit por 20 min",   cooldown: "45 min", desc: "Harmonia do ladino." },
      { name: "Light Armor Mastery",  type: "Passivo",  rarity: "1★", effect: "+12% EVA com armadura leve",       cooldown: "N/A",    desc: "Maestria leve." },
      { name: "Dagger Mastery",       type: "Passivo",  rarity: "1★", effect: "+12% ATK com dagger",              cooldown: "N/A",    desc: "Maestria em adagas." },
      { name: "Bow Mastery",          type: "Passivo",  rarity: "1★", effect: "+12% ATK com arco",                cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Critical Chance",      type: "Passivo",  rarity: "1★", effect: "+8% Crit Rate",                    cooldown: "N/A",    desc: "Senso para pontos vitais." }
    ]
  },

  // ─── TREASURE HUNTER (2ª classe) ───
  treasureHunter: {
    name: 'Treasure Hunter', parent: 'rogue', stage: 2,
    desc: 'Caçador de tesouros, mestre em adagas. Skills anteriores permanecem.',
    base: { atk: 55, def: 20, hp: 300, mp: 60, eva: 28, crit: 24, mdef: 14 },
    skills: [
      { name: "Deadly Blow",           type: "Ativo",    rarity: "2★", effect: "Dano 280% + crit garantido",          cooldown: "14s",    desc: "Golpe mortal." },
      { name: "Lethal Blow",           type: "Ativo",    rarity: "3★", effect: "Dano 350% + chance kill 5%",          cooldown: "22s",    desc: "Golpe letal." },
      { name: "Sand Bomb",             type: "Ativo",    rarity: "2★", effect: "AoE blind 5s + dano 150%",            cooldown: "20s",    desc: "Bomba de areia." },
      { name: "Blinding Blow",         type: "Ativo",    rarity: "2★", effect: "Dano 240% + blind 4s",                cooldown: "18s",    desc: "Golpe cegante." },
      { name: "Shadow Step",           type: "Ativo",    rarity: "2★", effect: "Teleporta atrás do alvo",             cooldown: "15s",    desc: "Passo sombrio." },
      { name: "Switch",                type: "Ativo",    rarity: "2★", effect: "Troca posição com alvo",              cooldown: "25s",    desc: "Troca de posição." },
      { name: "Fake Death",            type: "Ativo",    rarity: "2★", effect: "Finge morte, perde aggro",            cooldown: "60s",    desc: "Morte falsa." },
      { name: "Trick",                 type: "Ativo",    rarity: "2★", effect: "Remove alvo do inimigo",              cooldown: "20s",    desc: "Truque evasivo." },
      { name: "Mirage",                type: "Ativo",    rarity: "3★", effect: "+80% EVA por 8s",                     cooldown: "45s",    desc: "Ilusão de espelhos." },
      { name: "Detect/Remove Trap",    type: "Ativo",    rarity: "1★", effect: "Detecta e remove armadilhas",         cooldown: "10s",    desc: "Detectar armadilhas." },
      { name: "TH's Harmony",          type: "Self-Buff",rarity: "3★", effect: "+35% Crit, +25% EVA, +20% ATK 25min", cooldown: "60 min", desc: "Harmonia do caçador." },
      { name: "Evasion",               type: "Passivo",  rarity: "2★", effect: "+12% EVA",                            cooldown: "N/A",    desc: "Evasão aprimorada." },
      { name: "Critical Power",        type: "Passivo",  rarity: "2★", effect: "+18% Crit Damage",                    cooldown: "N/A",    desc: "Poder crítico." },
      { name: "Focus",                 type: "Passivo",  rarity: "1★", effect: "+10% Crit Rate",                      cooldown: "N/A",    desc: "Foco em pontos vitais." }
    ]
  },

  // ─── ADVENTURER (3ª classe) ───
  adventurer: {
    name: 'Adventurer', parent: 'treasureHunter', stage: 3,
    desc: 'Aventureiro supremo, mestre da evasão e dano furtivo. Skills anteriores permanecem.',
    base: { atk: 98, def: 32, hp: 500, mp: 85, eva: 52, crit: 42, mdef: 22 },
    skills: [
      { name: "Exciting Adventure",          type: "Self-Buff",rarity: "3★", effect: "+45% EVA, +30% Crit, +20% ATK 20min",  cooldown: "55 min", desc: "Aventura emocionante." },
      { name: "Wind Riding",                 type: "Ativo",    rarity: "3★", effect: "+80% Speed + invisível por 10s",        cooldown: "60s",    desc: "Cavalgando o vento." },
      { name: "Lucky Strike",                type: "Ativo",    rarity: "3★", effect: "Dano 420% + chance loot 2x",            cooldown: "30s",    desc: "Golpe de sorte." },
      { name: "Detection",                   type: "Ativo",    rarity: "2★", effect: "Revela invisíveis em área",             cooldown: "20s",    desc: "Detecção de ocultos." },
      { name: "Transcendent Deadly Blow",    type: "Ativo",    rarity: "4★", effect: "Dano 650% + ignora EVA + bleed 12s",    cooldown: "150s",   desc: "Golpe mortal transcendente." },
      { name: "Adventurer's Harmony",        type: "Self-Buff",rarity: "4★", effect: "+55% Crit, +45% EVA, +35% ATK 30min",  cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Master of Combat",            type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% Crit, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Shadow Sense",                type: "Passivo",  rarity: "3★", effect: "+15% EVA à noite / dungeon",            cooldown: "N/A",    desc: "Sentido das sombras." },
      { name: "Adventurer Spirit",           type: "Passivo",  rarity: "3★", effect: "+12% dagger ATK",                       cooldown: "N/A",    desc: "Espírito aventureiro." },
      { name: "Body of the Adventurer",      type: "Passivo",  rarity: "3★", effect: "+10% Max HP, +8% EVA",                 cooldown: "N/A",    desc: "Corpo ágil." },
      { name: "Final Frenzy",                type: "Passivo",  rarity: "3★", effect: "+25% ATK quando HP < 30%",              cooldown: "N/A",    desc: "Frenesi final." }
    ]
  },

  // ─── HAWKEYE (2ª classe) ───
  hawkeye: {
    name: 'Hawkeye', parent: 'rogue', stage: 2,
    desc: 'Arqueiro de elite com dano à distância. Skills anteriores permanecem.',
    base: { atk: 60, def: 18, hp: 280, mp: 65, eva: 20, crit: 22, mdef: 12 },
    skills: [
      { name: "Double Shot",           type: "Ativo",    rarity: "2★", effect: "2 disparos, dano total 260%",         cooldown: "10s",    desc: "Duplo disparo aprimorado." },
      { name: "Burst Shot",            type: "Ativo",    rarity: "2★", effect: "Dano 280% + knockback",               cooldown: "14s",    desc: "Disparo explosivo." },
      { name: "Stun Shot",             type: "Ativo",    rarity: "2★", effect: "Dano 220% + stun 3s",                cooldown: "18s",    desc: "Disparo atordoante." },
      { name: "Arrow Rain",            type: "Ativo",    rarity: "3★", effect: "Dano AoE 320% (8 alvos)",            cooldown: "22s",    desc: "Chuva de flechas." },
      { name: "Rapid Fire",            type: "Ativo",    rarity: "2★", effect: "+50% ATK Speed arco por 15s",        cooldown: "45s",    desc: "Disparo rápido." },
      { name: "Cheap Shot",            type: "Ativo",    rarity: "2★", effect: "Dano 200% + slow 30% por 8s",        cooldown: "16s",    desc: "Disparo sujo." },
      { name: "Hawkeye's Harmony",     type: "Self-Buff",rarity: "3★", effect: "+35% ATK, +25% Crit, +15% Range 25min",cooldown: "60 min",desc: "Harmonia do olho de falcão." },
      { name: "Bow Mastery",           type: "Passivo",  rarity: "2★", effect: "+18% ATK com arco",                  cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Long Shot",             type: "Passivo",  rarity: "2★", effect: "+30% Range",                          cooldown: "N/A",    desc: "Tiro de longo alcance." },
      { name: "Focus",                 type: "Passivo",  rarity: "1★", effect: "+10% Crit Rate",                      cooldown: "N/A",    desc: "Concentração." },
      { name: "Critical Power",        type: "Passivo",  rarity: "2★", effect: "+18% Crit Damage",                    cooldown: "N/A",    desc: "Poder crítico." },
      { name: "Evasion",               type: "Passivo",  rarity: "1★", effect: "+10% EVA",                            cooldown: "N/A",    desc: "Evasão." }
    ]
  },

  // ─── SAGITTARIUS (3ª classe) ───
  sagittarius: {
    name: 'Sagittarius', parent: 'hawkeye', stage: 3,
    desc: 'Atirador lendário, mestre do arco. Skills anteriores permanecem.',
    base: { atk: 112, def: 25, hp: 460, mp: 95, eva: 35, crit: 45, mdef: 18 },
    skills: [
      { name: "Seven Arrow",                  type: "Ativo",    rarity: "3★", effect: "7 flechas, dano total 480%",              cooldown: "25s",    desc: "Sete flechas consecutivas." },
      { name: "Arrow Flare",                  type: "Ativo",    rarity: "3★", effect: "Dano AoE 380% + burn 8s",                cooldown: "22s",    desc: "Explosão de flechas." },
      { name: "Dead Eye",                     type: "Self-Buff",rarity: "3★", effect: "+50% ATK, +40% Range por 20min",         cooldown: "55 min", desc: "Olho mortal — mira perfeita." },
      { name: "Pinpoint Shot",                type: "Ativo",    rarity: "3★", effect: "Dano 400% + ignora 50% DEF",             cooldown: "28s",    desc: "Tiro preciso." },
      { name: "Triple Shot",                  type: "Ativo",    rarity: "3★", effect: "3 disparos, dano total 360%",             cooldown: "14s",    desc: "Tiro triplo." },
      { name: "Thorn Shot",                   type: "Ativo",    rarity: "2★", effect: "Dano 260% + bleed 10s",                  cooldown: "12s",    desc: "Flecha de espinhos." },
      { name: "Binding Shot",                 type: "Ativo",    rarity: "2★", effect: "Dano 220% + root 4s",                    cooldown: "18s",    desc: "Flecha aprisionadora." },
      { name: "Incendiary Shot",              type: "Ativo",    rarity: "2★", effect: "Dano fogo 280% + burn 8s",               cooldown: "16s",    desc: "Flecha incendiária." },
      { name: "Freezing Shot",                type: "Ativo",    rarity: "2★", effect: "Dano gelo 260% + slow 40% 6s",           cooldown: "16s",    desc: "Flecha congelante." },
      { name: "Wind Shot",                    type: "Ativo",    rarity: "2★", effect: "Dano vento 270% + knockback",            cooldown: "16s",    desc: "Flecha do vento." },
      { name: "Flame Arrow Rain",             type: "Ativo",    rarity: "3★", effect: "AoE fogo 380% (10 alvos) + burn",        cooldown: "28s",    desc: "Chuva de flechas flamejantes." },
      { name: "Water Arrow Rain",             type: "Ativo",    rarity: "3★", effect: "AoE gelo 360% (10 alvos) + slow",        cooldown: "28s",    desc: "Chuva de flechas gélidas." },
      { name: "Storm Arrow Rain",             type: "Ativo",    rarity: "3★", effect: "AoE vento 370% (10 alvos) + stun 2s",    cooldown: "28s",    desc: "Chuva de flechas tempestuosas." },
      { name: "Spiral Shot",                  type: "Ativo",    rarity: "3★", effect: "Dano 420% + penetra múltiplos alvos",    cooldown: "24s",    desc: "Tiro espiral perfurante." },
      { name: "Target Lock",                  type: "Ativo",    rarity: "3★", effect: "Marca alvo: +40% dano contra ele 12s",   cooldown: "30s",    desc: "Trava de mira." },
      { name: "Transcendent Seven Arrow",     type: "Ativo",    rarity: "4★", effect: "Dano 700% + elemental + ignora DEF",     cooldown: "180s",   desc: "Sete flechas transcendentes." },
      { name: "Sagittarius' Harmony",         type: "Self-Buff",rarity: "4★", effect: "+60% ATK, +50% Crit, +40% Range 30min",  cooldown: "90 min", desc: "Harmonia do sagitário." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% Range, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Sagittarius Spirit",            type: "Passivo",  rarity: "3★", effect: "+15% Bow ATK",                           cooldown: "N/A",    desc: "Espírito do sagitário." },
      { name: "Body of the Sagittarius",       type: "Passivo",  rarity: "3★", effect: "+10% Max HP, +8% EVA",                  cooldown: "N/A",    desc: "Corpo do sagitário." }
    ]
  },

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  //  HUMAN MAGE (skills DISTINTAS por subclasse)
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  mage: {
    name: 'Human Mage', archetype: 'mage', race: 'human', stage: 0,
    desc: 'Classe base mágica humana.',
    base: { atk: 5, def: 6, hp: 70, mp: 80, eva: 4, crit: 3, matk: 15, mdef: 12 },
    skills: [
      { name: "Wind Strike",       type: "Ativo",    rarity: "1★", effect: "Dano vento 160%",              cooldown: "8s",     desc: "Rajada de vento." },
      { name: "Flame Strike",      type: "Ativo",    rarity: "1★", effect: "Dano fogo 170%",               cooldown: "9s",     desc: "Chama ardente." },
      { name: "Ice Bolt",          type: "Ativo",    rarity: "1★", effect: "Dano gelo 155% + slow 15% 4s", cooldown: "8s",     desc: "Projétil de gelo." },
      { name: "Self Heal",         type: "Ativo",    rarity: "1★", effect: "Cura 20% HP",                  cooldown: "25s",    desc: "Autocura básica." },
      { name: "Sleep",             type: "Ativo",    rarity: "1★", effect: "Adormece alvo 8s (cancela dano)",cooldown: "30s",   desc: "Sono mágico." },
      { name: "Mage's Will",       type: "Self-Buff",rarity: "1★", effect: "+10% M.ATK, +10% M.DEF 15min", cooldown: "30 min", desc: "Vontade do mago." },
      { name: "Robe Mastery",      type: "Passivo",  rarity: "1★", effect: "+10% M.DEF, +8% Cast Speed com robe",cooldown: "N/A",desc: "Maestria em vestes." },
      { name: "MP Increase",       type: "Passivo",  rarity: "1★", effect: "+8% Max MP",                   cooldown: "N/A",    desc: "Reserva mágica." }
    ]
  },

  // ─── WIZARD (1ª classe) ───
  wizard: {
    name: 'Wizard', parent: 'mage', race: 'human', archetype: 'mage', stage: 1,
    desc: 'Mago elemental versátil. Skills anteriores permanecem.',
    base: { atk: 6, def: 8, hp: 100, mp: 140, eva: 4, crit: 4, matk: 35, mdef: 22 },
    skills: [
      { name: "Blaze",                 type: "Ativo",    rarity: "1★", effect: "Dano fogo 210%",                    cooldown: "10s",    desc: "Chamas ardentes." },
      { name: "Aqua Swirl",            type: "Ativo",    rarity: "1★", effect: "Dano água 200% + slow 20% 5s",      cooldown: "10s",    desc: "Turbilhão aquático." },
      { name: "Twister",               type: "Ativo",    rarity: "1★", effect: "Dano vento 195%",                   cooldown: "10s",    desc: "Tornado menor." },
      { name: "Aura Burn",             type: "Ativo",    rarity: "2★", effect: "AoE fogo 180% ao redor",            cooldown: "14s",    desc: "Queimadura áurica." },
      { name: "Life Drain",            type: "Ativo",    rarity: "2★", effect: "Dano dark 190% + drena 25% como HP",cooldown: "15s",    desc: "Dreno vital." },
      { name: "Surrender to Fire",     type: "Ativo",    rarity: "2★", effect: "-20% Fire Resist no alvo 15s",      cooldown: "25s",    desc: "Vulnerabilidade ao fogo." },
      { name: "Surrender to Water",    type: "Ativo",    rarity: "2★", effect: "-20% Water Resist no alvo 15s",     cooldown: "25s",    desc: "Vulnerabilidade à água." },
      { name: "Surrender to Wind",     type: "Ativo",    rarity: "2★", effect: "-20% Wind Resist no alvo 15s",      cooldown: "25s",    desc: "Vulnerabilidade ao vento." },
      { name: "Wizard's Harmony",      type: "Self-Buff",rarity: "2★", effect: "+25% M.ATK, +15% Cast Speed 20min", cooldown: "45 min", desc: "Harmonia do mago." },
      { name: "Boost Mana",            type: "Passivo",  rarity: "1★", effect: "+12% Max MP",                       cooldown: "N/A",    desc: "Reserva mágica aprimorada." }
    ]
  },

  // ─── SORCERER (2ª classe — FOGO+GELO+VENTO) ───
  sorcerer: {
    name: 'Sorcerer', parent: 'wizard', stage: 2,
    desc: 'Mestre da magia elemental ofensiva. Skills anteriores permanecem.',
    base: { atk: 8, def: 14, hp: 180, mp: 260, eva: 5, crit: 6, matk: 75, mdef: 45 },
    skills: [
      { name: "Prominence",            type: "Ativo",    rarity: "2★", effect: "Dano fogo 300%",                      cooldown: "16s",    desc: "Coluna de fogo." },
      { name: "Blizzard",              type: "Ativo",    rarity: "3★", effect: "Dano gelo AoE 340% + slow 30% 6s",    cooldown: "22s",    desc: "Nevasca arrasadora." },
      { name: "Hurricane",             type: "Ativo",    rarity: "2★", effect: "Dano vento 290%",                     cooldown: "16s",    desc: "Furacão devastador." },
      { name: "Hydro Blast",           type: "Ativo",    rarity: "2★", effect: "Dano água 280% + knockback",          cooldown: "15s",    desc: "Explosão hídrica." },
      { name: "Solar Flare",           type: "Ativo",    rarity: "3★", effect: "Dano fogo 360% + blind 4s",           cooldown: "25s",    desc: "Explosão solar." },
      { name: "Tempest",               type: "Ativo",    rarity: "3★", effect: "Dano vento AoE 350% (8 alvos)",       cooldown: "25s",    desc: "Tempestade elemental." },
      { name: "Aura Flash",            type: "Ativo",    rarity: "2★", effect: "AoE 240% + knockback ao redor",       cooldown: "18s",    desc: "Flash áurico." },
      { name: "Arcane Power",          type: "Self-Buff",rarity: "3★", effect: "+40% M.ATK por 30s",                  cooldown: "90s",    desc: "Poder arcano concentrado." },
      { name: "Freezing Skin",         type: "Self-Buff",rarity: "2★", effect: "Quem ataca recebe slow 20% por 15s",  cooldown: "45s",    desc: "Pele congelante." },
      { name: "Cancel",                type: "Ativo",    rarity: "3★", effect: "Remove 3 buffs do alvo",              cooldown: "40s",    desc: "Cancelamento mágico." },
      { name: "Body to Mind",          type: "Ativo",    rarity: "2★", effect: "Converte 15% HP em 30% MP",           cooldown: "30s",    desc: "Corpo em mente." },
      { name: "Anti-Magic",            type: "Ativo",    rarity: "3★", effect: "Silence no alvo por 8s",              cooldown: "45s",    desc: "Anti-magia." },
      { name: "Sorcerer's Harmony",    type: "Self-Buff",rarity: "3★", effect: "+35% M.ATK, +20% Cast Speed 25min",   cooldown: "60 min", desc: "Harmonia do feiticeiro." },
      { name: "Elemental Assault",     type: "Passivo",  rarity: "2★", effect: "+12% elemental damage",               cooldown: "N/A",    desc: "Assalto elemental." }
    ]
  },

  // ─── ARCHMAGE (3ª classe — FOCO EM FOGO) ───
  archmage: {
    name: 'Archmage', parent: 'sorcerer', stage: 3,
    desc: 'Arquimago do fogo, dano massivo. Skills anteriores permanecem. Foco: FOGO.',
    base: { atk: 10, def: 20, hp: 300, mp: 450, eva: 6, crit: 8, matk: 135, mdef: 72 },
    skills: [
      { name: "Meteor",                       type: "Ativo",    rarity: "4★", effect: "Dano fogo AoE 750% + burn 12s + knockdown",  cooldown: "180s",   desc: "METEORO — devastação absoluta." },
      { name: "Hell Inferno",                  type: "Ativo",    rarity: "3★", effect: "Dano fogo 450% + burn 10s",                 cooldown: "30s",    desc: "Inferno ardente." },
      { name: "Flame Explosion",               type: "Ativo",    rarity: "3★", effect: "Dano fogo 420% + 2 hits",                  cooldown: "25s",    desc: "Explosão flamejante (2 hits)." },
      { name: "Fire Spiral",                   type: "Ativo",    rarity: "3★", effect: "Dano fogo 380% + penetra alvos",           cooldown: "22s",    desc: "Espiral de fogo perfurante." },
      { name: "Blazing Circle",                type: "Ativo",    rarity: "3★", effect: "AoE fogo 400% ao redor (10 alvos)",        cooldown: "28s",    desc: "Círculo flamejante." },
      { name: "Seed of Fire",                  type: "Ativo",    rarity: "2★", effect: "Planta semente: explode 300% após 5s",     cooldown: "20s",    desc: "Semente de fogo." },
      { name: "Elemental Burst",               type: "Ativo",    rarity: "3★", effect: "Explode Seeds: dano 500%",                 cooldown: "18s",    desc: "Explosão elemental (combo com Seeds)." },
      { name: "Elemental Storm",               type: "Ativo",    rarity: "3★", effect: "AoE multi-element 440% (8 alvos)",         cooldown: "30s",    desc: "Tempestade elemental." },
      { name: "Mana Burn",                     type: "Ativo",    rarity: "2★", effect: "Drena 30% MP do alvo + dano = MP drenado", cooldown: "25s",    desc: "Queima de mana." },
      { name: "Mystic Immunity",               type: "Ativo",    rarity: "4★", effect: "Imune a magia por 8s, não pode atacar",    cooldown: "180s",   desc: "Imunidade mística." },
      { name: "Empowering Echo",               type: "Ativo",    rarity: "3★", effect: "Próxima skill: +50% dano",                 cooldown: "45s",    desc: "Eco potencializador." },
      { name: "Transcendent Hell Inferno",     type: "Ativo",    rarity: "4★", effect: "Dano fogo 800% + ignora M.DEF + burn 15s", cooldown: "200s",   desc: "Inferno transcendente." },
      { name: "Archmage's Harmony",            type: "Self-Buff",rarity: "4★", effect: "+55% M.ATK, +35% Cast Speed, +20% MP 30min",cooldown: "90 min",desc: "Harmonia do arquimago." },
      { name: "Master of Magic",               type: "Passivo",  rarity: "3★", effect: "+10% M.ATK, +10% fire dmg, +5% PvE",      cooldown: "N/A",    desc: "Mestre da magia." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3★", effect: "+12% M. Skill Power",                     cooldown: "N/A",    desc: "Maestria em feitiços." },
      { name: "Magic Focus",                    type: "Passivo",  rarity: "3★", effect: "+8% M. Crit Rate",                        cooldown: "N/A",    desc: "Foco mágico." },
      { name: "Archmage Spirit",                type: "Passivo",  rarity: "3★", effect: "+15% fire magic ATK",                     cooldown: "N/A",    desc: "Espírito do arquimago." },
      { name: "Body of the Archmage",           type: "Passivo",  rarity: "3★", effect: "+10% Max MP, +8% M.DEF",                 cooldown: "N/A",    desc: "Corpo arcano." }
    ]
  },

  // ─── NECROMANCER (2ª classe — DARK/UNHOLY — skills DIFERENTES do Sorcerer) ───
  necromancer: {
    name: 'Necromancer', parent: 'wizard', stage: 2,
    desc: 'Mago das trevas e mortos-vivos. Skills anteriores permanecem. Foco: DARK/UNDEAD.',
    base: { atk: 8, def: 16, hp: 200, mp: 240, eva: 4, crit: 5, matk: 68, mdef: 40 },
    skills: [
      { name: "Death Spike",           type: "Ativo",    rarity: "2★", effect: "Dano dark 260% + drain 25% HP",       cooldown: "12s",    desc: "Estaca mortal." },
      { name: "Corpse Plague",          type: "Ativo",    rarity: "2★", effect: "AoE dark 280% + poison 10s",          cooldown: "20s",    desc: "Praga cadavérica." },
      { name: "Vampiric Claw",         type: "Ativo",    rarity: "2★", effect: "Dano 240% + drain 35% HP",            cooldown: "14s",    desc: "Garra vampírica." },
      { name: "Anchor",                type: "Ativo",    rarity: "2★", effect: "Root no alvo 6s + dano 180%",         cooldown: "22s",    desc: "Âncora sombria." },
      { name: "Curse: Gloom",          type: "Ativo",    rarity: "2★", effect: "-25% ATK e M.ATK do alvo 12s",        cooldown: "25s",    desc: "Maldição da melancolia." },
      { name: "Corpse Burst",          type: "Ativo",    rarity: "3★", effect: "Explode cadáver: AoE 350% dark",      cooldown: "25s",    desc: "Explosão de cadáver." },
      { name: "Summon Reanimated Man", type: "Ativo",    rarity: "2★", effect: "Invoca morto-vivo (ATK 50% do dono)", cooldown: "60s",    desc: "Reanimar morto." },
      { name: "Summon Cursed Bone",    type: "Ativo",    rarity: "2★", effect: "Invoca esqueleto (ATK 40% do dono)",  cooldown: "45s",    desc: "Esqueleto amaldiçoado." },
      { name: "Dark Flame",            type: "Ativo",    rarity: "2★", effect: "AoE dark 250% ao redor",              cooldown: "18s",    desc: "Chamas sombrias." },
      { name: "Surrender to Unholy",   type: "Ativo",    rarity: "2★", effect: "-25% Dark Resist no alvo 15s",        cooldown: "25s",    desc: "Vulnerabilidade ao dark." },
      { name: "Curse Fear",            type: "Ativo",    rarity: "3★", effect: "Medo AoE 5s (3 alvos)",               cooldown: "40s",    desc: "Medo amaldiçoado." },
      { name: "Necro's Harmony",       type: "Self-Buff",rarity: "3★", effect: "+30% M.ATK, +20% drain, +15% HP 25min",cooldown: "60 min",desc: "Harmonia do necromante." },
      { name: "Bone Armor",            type: "Passivo",  rarity: "2★", effect: "+15% DEF, +10% dark resist",          cooldown: "N/A",    desc: "Armadura de ossos." }
    ]
  },

  // ─── SOULTAKER (3ª classe — DARK MEGA NUKE) ───
  soultaker: {
    name: 'Soultaker', parent: 'necromancer', stage: 3,
    desc: 'Ceifador de almas, dano dark massivo. Skills anteriores permanecem. Foco: DARK.',
    base: { atk: 10, def: 22, hp: 320, mp: 420, eva: 5, crit: 7, matk: 125, mdef: 62 },
    skills: [
      { name: "Soul Vortex",                  type: "Ativo",    rarity: "3★", effect: "Dano dark 420% + soul drain",               cooldown: "25s",    desc: "Vórtice de almas." },
      { name: "Soul Vortex Destruction",       type: "Ativo",    rarity: "4★", effect: "Dano dark AoE 650% + drain 30% HP",        cooldown: "160s",   desc: "Destruição do vórtice de almas." },
      { name: "Void Explosion",                type: "Ativo",    rarity: "4★", effect: "Dano dark 700% + 2 hits + silence 5s",     cooldown: "180s",   desc: "Explosão do vazio." },
      { name: "Mass Curse: Gloom",             type: "Ativo",    rarity: "3★", effect: "AoE -30% ATK/M.ATK (8 alvos) 12s",         cooldown: "35s",    desc: "Maldição em massa." },
      { name: "Soul Absorption",               type: "Ativo",    rarity: "3★", effect: "Drena 40% MP do alvo como MP próprio",     cooldown: "30s",    desc: "Absorção de almas." },
      { name: "Summon Dark Curse",             type: "Ativo",    rarity: "3★", effect: "Invoca entidade dark (ATK 70% do dono)",    cooldown: "90s",    desc: "Maldição sombria viva." },
      { name: "Dark Burden",                   type: "Ativo",    rarity: "3★", effect: "-40% Speed no alvo 10s + dano 300%",       cooldown: "28s",    desc: "Fardo das trevas." },
      { name: "Transcendent Soul Vortex",      type: "Ativo",    rarity: "4★", effect: "Dano dark 850% + drain todo MP + stun 4s", cooldown: "200s",   desc: "Vórtice de almas transcendente." },
      { name: "Soultaker's Harmony",           type: "Self-Buff",rarity: "4★", effect: "+55% M.ATK, +40% drain, +25% HP 30min",    cooldown: "90 min", desc: "Harmonia do ceifador." },
      { name: "Master of Dark Magic",          type: "Passivo",  rarity: "3★", effect: "+10% M.ATK, +10% dark dmg, +5% PvE",      cooldown: "N/A",    desc: "Mestre da magia negra." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3★", effect: "+12% M. Skill Power",                     cooldown: "N/A",    desc: "Maestria em feitiços." },
      { name: "Soultaker Spirit",              type: "Passivo",  rarity: "3★", effect: "+15% dark magic ATK",                      cooldown: "N/A",    desc: "Espírito do ceifador." },
      { name: "Body of the Soultaker",         type: "Passivo",  rarity: "3★", effect: "+12% Max MP, +10% HP",                    cooldown: "N/A",    desc: "Corpo do ceifador." }
    ]
  },

  // ─── WARLOCK (2ª classe — SUMMONER — skills DIFERENTES) ───
  warlock: {
    name: 'Warlock', parent: 'wizard', stage: 2,
    desc: 'Invocador de criaturas das trevas. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 7, def: 15, hp: 190, mp: 250, eva: 4, crit: 4, matk: 62, mdef: 42 },
    skills: [
      { name: "Summon Shadow",          type: "Ativo",    rarity: "2★", effect: "Invoca sombra (ATK 45% do dono)",     cooldown: "60s",    desc: "Sombra combatente." },
      { name: "Summon Silhouette",      type: "Ativo",    rarity: "2★", effect: "Invoca silhueta (tank, DEF 60%)",     cooldown: "60s",    desc: "Silhueta defensiva." },
      { name: "Summon Soulless",        type: "Ativo",    rarity: "3★", effect: "Invoca sem-alma (ATK 65% do dono)",   cooldown: "90s",    desc: "Criatura sem alma — forte." },
      { name: "Servitor Heal",          type: "Ativo",    rarity: "2★", effect: "Cura summon 35% HP",                  cooldown: "12s",    desc: "Cura do servitor." },
      { name: "Servitor Recharge",      type: "Ativo",    rarity: "2★", effect: "Restaura 30% MP do summon",           cooldown: "15s",    desc: "Recarga do servitor." },
      { name: "Transfer Pain",          type: "Toggle",   rarity: "2★", effect: "50% dano recebido vai pro summon",    cooldown: "N/A",    desc: "Transferência de dor." },
      { name: "Summon Binding Cubic",   type: "Ativo",    rarity: "2★", effect: "Cubic que causa root em inimigos",    cooldown: "45s",    desc: "Cubic aprisionador." },
      { name: "Summon Phantom Cubic",   type: "Ativo",    rarity: "2★", effect: "Cubic que causa dano dark contínuo",  cooldown: "45s",    desc: "Cubic fantasma." },
      { name: "Life Cubic",             type: "Ativo",    rarity: "2★", effect: "Cubic que cura dono 5%/5s",           cooldown: "45s",    desc: "Cubic vital." },
      { name: "Warlock's Harmony",      type: "Self-Buff",rarity: "3★", effect: "+30% M.ATK, +25% Summon ATK 25min",   cooldown: "60 min", desc: "Harmonia do warlock." },
      { name: "Servitor Physical ATK",  type: "Passivo",  rarity: "2★", effect: "+15% Summon ATK",                     cooldown: "N/A",    desc: "Poder do servitor." }
    ]
  },

  // ─── ARCANA LORD (3ª classe — MEGA SUMMONER) ───
  arcanaLord: {
    name: 'Arcana Lord', parent: 'warlock', stage: 3,
    desc: 'Senhor arcano dos invocadores. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 10, def: 22, hp: 310, mp: 430, eva: 5, crit: 5, matk: 118, mdef: 65 },
    skills: [
      { name: "Summon Feline King",            type: "Ativo",    rarity: "4★", effect: "Invoca Rei Felino (ATK 90% do dono)",       cooldown: "120s",   desc: "Rei dos felinos — summon supremo." },
      { name: "Summon Magnus",                 type: "Ativo",    rarity: "3★", effect: "Invoca Magnus (AoE ATK 70% do dono)",       cooldown: "90s",    desc: "Magnus elemental." },
      { name: "Servitor Barrier",              type: "Ativo",    rarity: "3★", effect: "Summon ganha escudo 5000 HP por 15s",       cooldown: "60s",    desc: "Barreira do servitor." },
      { name: "Mass Servitor Heal",            type: "Ativo",    rarity: "3★", effect: "Cura todos summons 40% HP",                cooldown: "25s",    desc: "Cura em massa dos servitors." },
      { name: "Servitor Empowerment",          type: "Self-Buff",rarity: "3★", effect: "+50% Summon ATK/DEF por 30s",               cooldown: "90s",    desc: "Empoderamento do servitor." },
      { name: "Final Servitor",                type: "Ativo",    rarity: "4★", effect: "Summon sacrifica: AoE 600% + cura 50% HP",  cooldown: "180s",   desc: "Sacrifício final do servitor." },
      { name: "Transcendent Summon Burst",     type: "Ativo",    rarity: "4★", effect: "Todos summons atacam: dano 800% total",     cooldown: "200s",   desc: "Explosão de invocações." },
      { name: "Arcana Lord's Harmony",         type: "Self-Buff",rarity: "4★", effect: "+50% M.ATK, +60% Summon Power 30min",       cooldown: "90 min", desc: "Harmonia do senhor arcano." },
      { name: "Master of Summoning",           type: "Passivo",  rarity: "3★", effect: "+15% Summon ATK/DEF, +5% PvE",             cooldown: "N/A",    desc: "Mestre da invocação." },
      { name: "Arcana Lord Spirit",            type: "Passivo",  rarity: "3★", effect: "+12% M.ATK, +10% Summon HP",                cooldown: "N/A",    desc: "Espírito do senhor arcano." },
      { name: "Body of the Arcana Lord",       type: "Passivo",  rarity: "3★", effect: "+10% Max MP, +8% Max HP",                  cooldown: "N/A",    desc: "Corpo arcano reforçado." }
    ]
  },

  // ─── CLERIC (1ª classe) ───
  cleric: {
    name: 'Cleric', parent: 'mage', race: 'human', archetype: 'healer', stage: 1,
    desc: 'Clérigo curador e suporte. Skills anteriores permanecem.',
    base: { atk: 8, def: 15, hp: 130, mp: 120, eva: 4, crit: 3, matk: 22, mdef: 28 },
    skills: [
      { name: "Heal",             type: "Ativo",    rarity: "1★", effect: "Cura 25% HP alvo",                 cooldown: "8s",     desc: "Cura básica." },
      { name: "Battle Heal",      type: "Ativo",    rarity: "1★", effect: "Cura 20% HP + remove 1 debuff",    cooldown: "10s",    desc: "Cura de combate." },
      { name: "Might",            type: "Party-Buff",rarity: "1★", effect: "+15% ATK para party 10 min",      cooldown: "25 min", desc: "Bênção de força." },
      { name: "Shield (Buff)",    type: "Party-Buff",rarity: "1★", effect: "+15% DEF para party 10 min",      cooldown: "25 min", desc: "Bênção de proteção." },
      { name: "Wind Walk",        type: "Party-Buff",rarity: "1★", effect: "+20% Speed para party 10 min",    cooldown: "25 min", desc: "Caminhada do vento." },
      { name: "Cure Poison",      type: "Ativo",    rarity: "1★", effect: "Remove poison",                    cooldown: "5s",     desc: "Cura veneno." },
      { name: "Cure Bleed",       type: "Ativo",    rarity: "1★", effect: "Remove bleed",                     cooldown: "5s",     desc: "Estanca sangramento." },
      { name: "Turn Undead",      type: "Ativo",    rarity: "2★", effect: "Dano holy 200% vs undead",         cooldown: "12s",    desc: "Repelir mortos-vivos." },
      { name: "Recharge",         type: "Ativo",    rarity: "1★", effect: "Restaura 20% MP do alvo",          cooldown: "12s",    desc: "Recarrega mana." },
      { name: "Cleric's Harmony", type: "Self-Buff",rarity: "2★", effect: "+20% M.ATK, +20% Heal Power 20min",cooldown: "45 min", desc: "Harmonia do clérigo." }
    ]
  },

  // ─── BISHOP (2ª classe — HEALER) ───
  bishop: {
    name: 'Bishop', parent: 'cleric', stage: 2,
    desc: 'Bispo curador poderoso. Skills anteriores permanecem.',
    base: { atk: 10, def: 28, hp: 250, mp: 220, eva: 4, crit: 4, matk: 50, mdef: 60 },
    skills: [
      { name: "Greater Heal",          type: "Ativo",      rarity: "2★", effect: "Cura 40% HP alvo",                    cooldown: "10s",    desc: "Cura avançada." },
      { name: "Greater Group Heal",    type: "Ativo",      rarity: "3★", effect: "Cura 30% HP party",                   cooldown: "18s",    desc: "Cura em grupo." },
      { name: "Resurrection",          type: "Ativo",      rarity: "3★", effect: "Ressuscita aliado com 30% HP",        cooldown: "120s",   desc: "Ressurreição." },
      { name: "Greater Might",         type: "Party-Buff", rarity: "2★", effect: "+25% ATK party 12 min",               cooldown: "30 min", desc: "Bênção de força maior." },
      { name: "Greater Shield",        type: "Party-Buff", rarity: "2★", effect: "+25% DEF party 12 min",               cooldown: "30 min", desc: "Bênção de proteção maior." },
      { name: "Blessed Body",          type: "Party-Buff", rarity: "2★", effect: "+20% Max HP party 12 min",            cooldown: "30 min", desc: "Corpo abençoado." },
      { name: "Blessed Soul",          type: "Party-Buff", rarity: "2★", effect: "+20% Max MP party 12 min",            cooldown: "30 min", desc: "Alma abençoada." },
      { name: "Holy Weapon",           type: "Party-Buff", rarity: "2★", effect: "+15% Holy ATK party 12 min",          cooldown: "30 min", desc: "Arma sagrada." },
      { name: "Purify",                type: "Ativo",      rarity: "2★", effect: "Remove 3 debuffs do alvo",            cooldown: "20s",    desc: "Purificação." },
      { name: "Cleanse",               type: "Ativo",      rarity: "3★", effect: "Remove TODOS debuffs do alvo",        cooldown: "45s",    desc: "Limpeza total." },
      { name: "Mental Shield",         type: "Party-Buff", rarity: "2★", effect: "+20% M.DEF party 12 min",             cooldown: "30 min", desc: "Escudo mental." },
      { name: "Inquisitor",            type: "Ativo",      rarity: "2★", effect: "Dano holy 250%",                      cooldown: "14s",    desc: "Poder inquisitorial." },
      { name: "Holy Strike",           type: "Ativo",      rarity: "3★", effect: "Dano holy 320% + undead 2x",          cooldown: "18s",    desc: "Golpe sagrado." },
      { name: "Divine Punishment",     type: "Ativo",      rarity: "3★", effect: "Dano holy 360% + stun 3s",            cooldown: "22s",    desc: "Punição divina." },
      { name: "Major Heal",            type: "Ativo",      rarity: "3★", effect: "Cura 55% HP alvo",                    cooldown: "15s",    desc: "Cura maior." },
      { name: "Party Recall",          type: "Ativo",      rarity: "2★", effect: "Teleporta party para cidade",         cooldown: "300s",   desc: "Recall do grupo." },
      { name: "Bishop's Harmony",      type: "Self-Buff",  rarity: "3★", effect: "+35% Heal, +25% M.ATK, +20% M.DEF 25min",cooldown: "60 min",desc: "Harmonia do bispo." },
      { name: "Mana Regeneration",     type: "Passivo",    rarity: "2★", effect: "+15% MP Regen",                       cooldown: "N/A",    desc: "Regeneração de mana." }
    ]
  },

  // ─── CARDINAL (3ª classe — MEGA HEALER + DARK SIDE) ───
  cardinal: {
    name: 'Cardinal', parent: 'bishop', stage: 3,
    desc: 'Cardeal supremo, mestre da cura E do dano sagrado (Dark Side). Skills anteriores permanecem.',
    base: { atk: 12, def: 42, hp: 420, mp: 480, eva: 5, crit: 5, matk: 95, mdef: 98 },
    skills: [
      { name: "Miracle",                      type: "Ativo",      rarity: "4★", effect: "Cura party 80% HP + ressurge mortos",      cooldown: "300s",   desc: "MILAGRE — cura suprema + ressurreição." },
      { name: "Sublime Self-Sacrifice",        type: "Ativo",      rarity: "4★", effect: "Morre para curar party 100% HP+MP",       cooldown: "300s",   desc: "Auto-sacrifício sublime." },
      { name: "Balance Life",                  type: "Ativo",      rarity: "3★", effect: "Equaliza HP de toda party",                cooldown: "60s",    desc: "Equilíbrio vital." },
      { name: "Mass Resurrection",             type: "Ativo",      rarity: "4★", effect: "Ressuscita toda party com 40% HP",        cooldown: "300s",   desc: "Ressurreição em massa." },
      { name: "Lord of Vampire",               type: "Party-Buff", rarity: "3★", effect: "+10% lifesteal para party 12 min",        cooldown: "30 min", desc: "Senhor dos vampiros." },
      { name: "Blessing of Eva",               type: "Party-Buff", rarity: "3★", effect: "+25% M.DEF e resist debuff party 12min",  cooldown: "30 min", desc: "Bênção de Eva." },
      { name: "Trance",                        type: "Ativo",      rarity: "3★", effect: "Channeling: cura 8%/s por 10s",           cooldown: "45s",    desc: "Transe curativo." },
      { name: "Dark Side",                     type: "Toggle",     rarity: "3★", effect: "Troca: -60% Heal, +80% M.ATK holy",       cooldown: "N/A",    desc: "LADO SOMBRIO — transforma healer em DPS." },
      { name: "Holy Burst",                    type: "Ativo",      rarity: "3★", effect: "Dano holy AoE 400% (Dark Side only)",     cooldown: "20s",    desc: "Explosão sagrada (apenas Dark Side)." },
      { name: "Divine Nova",                   type: "Ativo",      rarity: "3★", effect: "Dano holy AoE 450% + blind 5s",           cooldown: "25s",    desc: "Nova divina (Dark Side amplifica)." },
      { name: "Transcendent Holy Strike",      type: "Ativo",      rarity: "4★", effect: "Dano holy 750% + stun 5s",                cooldown: "180s",   desc: "Golpe sagrado transcendente." },
      { name: "Cardinal's Harmony",            type: "Self-Buff",  rarity: "4★", effect: "+55% Heal, +40% M.ATK, +30% M.DEF 30min",cooldown: "90 min", desc: "Harmonia do cardeal." },
      { name: "Master of Healing",             type: "Passivo",    rarity: "3★", effect: "+15% Heal Power, +5% PvE",               cooldown: "N/A",    desc: "Mestre da cura." },
      { name: "Cardinal Spirit",               type: "Passivo",    rarity: "3★", effect: "+12% holy magic ATK",                     cooldown: "N/A",    desc: "Espírito do cardeal." },
      { name: "Body of the Cardinal",          type: "Passivo",    rarity: "3★", effect: "+12% Max MP, +10% M.DEF",                cooldown: "N/A",    desc: "Corpo sagrado." }
    ]
  },

  // ─── PROPHET (2ª classe — BUFFER) ───
  prophet: {
    name: 'Prophet', parent: 'cleric', stage: 2,
    desc: 'Profeta, mestre dos buffs. Skills anteriores permanecem.',
    base: { atk: 12, def: 25, hp: 280, mp: 200, eva: 4, crit: 4, matk: 42, mdef: 52 },
    skills: [
      { name: "Haste",              type: "Self-Buff",  rarity: "2★", effect: "+30% ATK Speed por 20 min",            cooldown: "50 min", desc: "Aceleração." },
      { name: "Berserker Spirit",    type: "Self-Buff",  rarity: "2★", effect: "+20% ATK, +20% M.ATK, -10% DEF 20min",cooldown: "50 min", desc: "Espírito berserker." },
      { name: "Vampiric Rage",      type: "Self-Buff",  rarity: "2★", effect: "+10% lifesteal por 20 min",            cooldown: "50 min", desc: "Fúria vampírica." },
      { name: "Empower",            type: "Self-Buff",  rarity: "2★", effect: "+25% M.ATK por 20 min",                cooldown: "50 min", desc: "Empoderamento mágico." },
      { name: "Acumen",             type: "Self-Buff",  rarity: "2★", effect: "+25% Cast Speed por 20 min",           cooldown: "50 min", desc: "Acuidade mágica." },
      { name: "Concentration",      type: "Self-Buff",  rarity: "2★", effect: "+20% M.DEF por 20 min",                cooldown: "50 min", desc: "Concentração mágica." },
      { name: "Death Whisper",      type: "Self-Buff",  rarity: "2★", effect: "+20% Crit Damage por 20 min",          cooldown: "50 min", desc: "Sussurro da morte." },
      { name: "Guidance",           type: "Self-Buff",  rarity: "2★", effect: "+15% Accuracy por 20 min",             cooldown: "50 min", desc: "Guia divina." },
      { name: "Focus",              type: "Self-Buff",  rarity: "2★", effect: "+15% Crit Rate por 20 min",            cooldown: "50 min", desc: "Foco bélico." },
      { name: "Bless Shield",       type: "Self-Buff",  rarity: "2★", effect: "+25% Block Rate por 20 min",           cooldown: "50 min", desc: "Escudo abençoado." },
      { name: "Resist Fire",        type: "Self-Buff",  rarity: "2★", effect: "+20% Fire Resist por 20 min",          cooldown: "50 min", desc: "Resistência ao fogo." },
      { name: "Resist Water",       type: "Self-Buff",  rarity: "2★", effect: "+20% Water Resist por 20 min",         cooldown: "50 min", desc: "Resistência à água." },
      { name: "Resist Wind",        type: "Self-Buff",  rarity: "2★", effect: "+20% Wind Resist por 20 min",          cooldown: "50 min", desc: "Resistência ao vento." },
      { name: "Holy Strike",        type: "Ativo",      rarity: "2★", effect: "Dano holy 280%",                       cooldown: "14s",    desc: "Golpe sagrado." },
      { name: "Prophet's Harmony",  type: "Self-Buff",  rarity: "3★", effect: "+30% ATK, +25% M.ATK, +20% DEF 25min", cooldown: "60 min", desc: "Harmonia do profeta." }
    ]
  },

  // ─── HIEROPHANT (3ª classe — MEGA BUFFER + DPS) ───
  hierophant: {
    name: 'Hierophant', parent: 'prophet', stage: 3,
    desc: 'Hierofante, profeta supremo com profecias e dano. Skills anteriores permanecem.',
    base: { atk: 15, def: 38, hp: 420, mp: 380, eva: 5, crit: 5, matk: 82, mdef: 82 },
    skills: [
      { name: "Prophecy of Fire",             type: "Party-Buff", rarity: "3★", effect: "+30% ATK, +15% Crit party 12 min",        cooldown: "30 min", desc: "Profecia do fogo." },
      { name: "Prophecy of Wind",             type: "Party-Buff", rarity: "3★", effect: "+25% Speed, +20% EVA party 12 min",       cooldown: "30 min", desc: "Profecia do vento." },
      { name: "Prophecy of Water",            type: "Party-Buff", rarity: "3★", effect: "+30% M.ATK, +20% M.DEF party 12 min",     cooldown: "30 min", desc: "Profecia da água." },
      { name: "Mass Prophecy",                type: "Party-Buff", rarity: "4★", effect: "Todas profecias de uma vez 8 min",        cooldown: "60 min", desc: "Profecia em massa." },
      { name: "Holy Punishment",              type: "Ativo",      rarity: "3★", effect: "Dano holy 400% + silence 5s",              cooldown: "22s",    desc: "Punição sagrada." },
      { name: "Mystic Immunity",              type: "Ativo",      rarity: "4★", effect: "Imune a magia 8s, não pode atacar",        cooldown: "180s",   desc: "Imunidade mística." },
      { name: "Blessing of Nobility",         type: "Party-Buff", rarity: "3★", effect: "+15% all stats party 10 min",             cooldown: "30 min", desc: "Bênção da nobreza." },
      { name: "Transcendent Holy Burst",      type: "Ativo",      rarity: "4★", effect: "Dano holy AoE 650% + stun 4s + purge",    cooldown: "180s",   desc: "Explosão sagrada transcendente." },
      { name: "Hierophant's Harmony",         type: "Self-Buff",  rarity: "4★", effect: "+50% ATK, +45% M.ATK, +35% DEF 30min",    cooldown: "90 min", desc: "Harmonia do hierofante." },
      { name: "Master of Prophecy",           type: "Passivo",    rarity: "3★", effect: "+15% buff duration, +5% PvE",             cooldown: "N/A",    desc: "Mestre das profecias." },
      { name: "Hierophant Spirit",            type: "Passivo",    rarity: "3★", effect: "+12% holy ATK, +8% Heal",                  cooldown: "N/A",    desc: "Espírito do hierofante." },
      { name: "Body of the Hierophant",       type: "Passivo",    rarity: "3★", effect: "+10% Max HP, +10% Max MP",                cooldown: "N/A",    desc: "Corpo do hierofante." }
    ]
  },

    // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  //  ELF FIGHTER
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  elfFighter: {
    name: 'Elf Fighter', archetype: 'fighter', race: 'elf', stage: 0,
    desc: 'Guerreiro élfico ágil.',
    base: { atk: 10, def: 8, hp: 90, mp: 35, eva: 10, crit: 6, matk: 0, mdef: 6 },
    skills: [
      { name: "Power Strike",       type: "Ativo",    rarity: "1★", effect: "Dano físico 150%",               cooldown: "8s",     desc: "Golpe concentrado." },
      { name: "Mortal Blow",         type: "Ativo",    rarity: "1★", effect: "Dano 170% + chance crit 20%",    cooldown: "10s",    desc: "Golpe mortal." },
      { name: "Power Shot",          type: "Ativo",    rarity: "1★", effect: "Dano à distância 140%",          cooldown: "9s",     desc: "Disparo concentrado." },
      { name: "Elven Spirit",        type: "Self-Buff",rarity: "1★", effect: "+10% EVA, +10% Speed por 15 min",cooldown: "30 min", desc: "Espírito élfico." },
      { name: "HP Increase Lv1",     type: "Passivo",  rarity: "1★", effect: "+5% Max HP",                     cooldown: "N/A",    desc: "Constituição élfica." },
      { name: "Light Armor Mastery", type: "Passivo",  rarity: "1★", effect: "+8% DEF com armadura leve",      cooldown: "N/A",    desc: "Maestria em armaduras leves." }
    ]
  },

  // ─── ELVEN KNIGHT (1ª classe) ───
  elvenKnight: {
    name: 'Elven Knight', parent: 'elfFighter', race: 'elf', archetype: 'tank', stage: 1,
    desc: 'Cavaleiro élfico com escudo. Skills anteriores permanecem.',
    base: { atk: 16, def: 30, hp: 230, mp: 55, eva: 8, crit: 4, mdef: 18 },
    skills: [
      { name: "Shield Strike",         type: "Ativo",    rarity: "1★", effect: "Dano 160% + taunt 5s",         cooldown: "10s",    desc: "Golpe de escudo." },
      { name: "Hate",                  type: "Ativo",    rarity: "1★", effect: "Taunt + aggro forte",          cooldown: "8s",     desc: "Gera ódio." },
      { name: "Power Break",           type: "Ativo",    rarity: "1★", effect: "Dano 150% + -20% ATK 8s",      cooldown: "14s",    desc: "Quebra de poder." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1★", effect: "+15% DEF armadura pesada",     cooldown: "N/A",    desc: "Maestria pesada." },
      { name: "Shield Mastery",        type: "Passivo",  rarity: "1★", effect: "+15% Block Rate",              cooldown: "N/A",    desc: "Maestria em escudos." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1★", effect: "+10% ATK espada/blunt",        cooldown: "N/A",    desc: "Maestria em espadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1★", effect: "+10% Max HP",                  cooldown: "N/A",    desc: "Constituição reforçada." },
      { name: "Deflect Arrow",         type: "Passivo",  rarity: "1★", effect: "+10% desviar projéteis",       cooldown: "N/A",    desc: "Desvio de projéteis." }
    ]
  },

  // ─── TEMPLE KNIGHT (2ª classe) ───
  templeKnight: {
    name: 'Temple Knight', parent: 'elvenKnight', stage: 2,
    desc: 'Cavaleiro do templo de Eva. Skills anteriores permanecem.',
    base: { atk: 35, def: 62, hp: 500, mp: 100, eva: 8, crit: 5, mdef: 40 },
    skills: [
      { name: "Shield Stun",           type: "Ativo",    rarity: "2★", effect: "Dano 200% + stun 3s",           cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Tribunal",              type: "Ativo",    rarity: "2★", effect: "Dano 240% + -20% DEF 10s",      cooldown: "20s",    desc: "Julgamento do templo." },
      { name: "Eva's Will",            type: "Ativo",    rarity: "3★", effect: "+30% water resist + cura 15% HP",cooldown: "45s",   desc: "Vontade de Eva." },
      { name: "Sacrifice",             type: "Ativo",    rarity: "2★", effect: "Cura aliado 30% (gasta 10%)",    cooldown: "25s",    desc: "Sacrifício pelo aliado." },
      { name: "Aegis",                 type: "Ativo",    rarity: "2★", effect: "+60% Block Rate por 15s",        cooldown: "45s",    desc: "Aegis defensivo." },
      { name: "Holy Blade",            type: "Ativo",    rarity: "2★", effect: "Dano sagrado 250%",              cooldown: "16s",    desc: "Lâmina sagrada." },
      { name: "Ultimate Defense",      type: "Ativo",    rarity: "3★", effect: "+80% DEF, -50% ATK por 15s",     cooldown: "120s",   desc: "Defesa absoluta." },
      { name: "Provoke",               type: "Ativo",    rarity: "1★", effect: "Taunt + aggro",                  cooldown: "8s",     desc: "Provocação." },
      { name: "Summon Life Cubic",     type: "Ativo",    rarity: "2★", effect: "Cubic que cura 5%/5s",           cooldown: "45s",    desc: "Cubic vital." },
      { name: "Summon Storm Cubic",    type: "Ativo",    rarity: "2★", effect: "Cubic de dano lightning",        cooldown: "45s",    desc: "Cubic de tempestade." },
      { name: "TK's Harmony",          type: "Self-Buff",rarity: "3★", effect: "+35% DEF, +25% HP, +15% EVA 25min",cooldown: "60 min",desc: "Harmonia do cavaleiro do templo." },
      { name: "Boost HP",              type: "Passivo",  rarity: "2★", effect: "+15% Max HP",                    cooldown: "N/A",    desc: "HP reforçado." },
      { name: "Resist Aqua",           type: "Passivo",  rarity: "1★", effect: "+10% Water Resist",              cooldown: "N/A",    desc: "Resistência aquática." }
    ]
  },

  // ─── EVA'S TEMPLAR (3ª classe) ───
  evaTemplar: {
    name: "Eva's Templar", parent: 'templeKnight', stage: 3,
    desc: 'Templário de Eva, tank divino aquático. Skills anteriores permanecem.',
    base: { atk: 68, def: 100, hp: 820, mp: 145, eva: 10, crit: 6, mdef: 65 },
    skills: [
      { name: "Touch of Eva",                  type: "Ativo",    rarity: "3★", effect: "Cura AoE 25% HP party + cleanse 1 debuff", cooldown: "35s",    desc: "Toque de Eva." },
      { name: "Shield of Eva",                 type: "Ativo",    rarity: "3★", effect: "Absorve 5000 dano por 15s",               cooldown: "90s",    desc: "Escudo de Eva." },
      { name: "Celestial Shield",              type: "Ativo",    rarity: "4★", effect: "Party imune a dano por 5s",               cooldown: "300s",   desc: "Escudo celestial." },
      { name: "Aqua Strike",                   type: "Ativo",    rarity: "3★", effect: "Dano water 380% + slow 40% 6s",           cooldown: "22s",    desc: "Golpe aquático." },
      { name: "Summon Guardian Agathion",       type: "Ativo",    rarity: "3★", effect: "Invoca agathion protetor (+15% DEF)",     cooldown: "120s",   desc: "Agathion guardião." },
      { name: "Transcendent Shield Charge",    type: "Ativo",    rarity: "4★", effect: "Rush + 480% dano + AoE taunt 10s",        cooldown: "160s",   desc: "Investida transcendente." },
      { name: "Eva's Templar Harmony",         type: "Self-Buff",rarity: "4★", effect: "+55% DEF, +40% HP, +25% M.DEF 30min",     cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Master of Combat",              type: "Passivo",  rarity: "3★", effect: "+10% ATK, +15% aggro, +5% PvE",           cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Eva's Templar Spirit",          type: "Passivo",  rarity: "3★", effect: "+15% water ATK, +10% Block",              cooldown: "N/A",    desc: "Espírito do templário." },
      { name: "Body of Eva's Templar",         type: "Passivo",  rarity: "3★", effect: "+15% Max HP, +10% DEF",                  cooldown: "N/A",    desc: "Corpo do templário." },
      { name: "Protection of Eva",             type: "Passivo",  rarity: "3★", effect: "+15% water resist",                       cooldown: "N/A",    desc: "Proteção de Eva." },
      { name: "Eva's Help",                    type: "Passivo",  rarity: "3★", effect: "10% chance ao ser atacado: cura 5% HP",   cooldown: "N/A",    desc: "Ajuda de Eva (trigger)." }
    ]
  },

  // ─── SWORD SINGER (2ª classe — BARD) ───
  swordSinger: {
    name: 'Sword Singer', parent: 'elvenKnight', stage: 2,
    desc: 'Bardo élfico com canções de buff. Skills anteriores permanecem.',
    base: { atk: 38, def: 45, hp: 400, mp: 120, eva: 10, crit: 8, mdef: 35 },
    skills: [
      { name: "Song of Earth",         type: "Self-Buff", rarity: "2★", effect: "+20% DEF por 20 min",            cooldown: "50 min", desc: "Canção da terra." },
      { name: "Song of Life",          type: "Self-Buff", rarity: "2★", effect: "+15% HP Regen por 20 min",       cooldown: "50 min", desc: "Canção da vida." },
      { name: "Song of Water",         type: "Self-Buff", rarity: "2★", effect: "+20% Water Resist por 20 min",   cooldown: "50 min", desc: "Canção da água." },
      { name: "Song of Warding",       type: "Self-Buff", rarity: "2★", effect: "+20% M.DEF por 20 min",          cooldown: "50 min", desc: "Canção de proteção." },
      { name: "Song of Wind",          type: "Self-Buff", rarity: "2★", effect: "+20% ATK Speed por 20 min",      cooldown: "50 min", desc: "Canção do vento." },
      { name: "Song of Hunter",        type: "Self-Buff", rarity: "2★", effect: "+15% Crit Rate por 20 min",      cooldown: "50 min", desc: "Canção do caçador." },
      { name: "Song of Invocation",    type: "Self-Buff", rarity: "2★", effect: "+15% MP Regen por 20 min",       cooldown: "50 min", desc: "Canção da invocação." },
      { name: "Song of Vitality",      type: "Self-Buff", rarity: "2★", effect: "+15% Max HP por 20 min",         cooldown: "50 min", desc: "Canção da vitalidade." },
      { name: "Song of Vengeance",     type: "Self-Buff", rarity: "2★", effect: "+8% reflect damage por 20 min",  cooldown: "50 min", desc: "Canção da vingança." },
      { name: "Song of Flame Guard",   type: "Self-Buff", rarity: "2★", effect: "+20% Fire Resist por 20 min",    cooldown: "50 min", desc: "Canção da chama." },
      { name: "Song of Champion",      type: "Self-Buff", rarity: "3★", effect: "+20% ATK por 20 min",            cooldown: "50 min", desc: "Canção do campeão." },
      { name: "Song of Renewal",       type: "Self-Buff", rarity: "3★", effect: "+10% HP+MP Regen por 20 min",    cooldown: "50 min", desc: "Canção da renovação." },
      { name: "SS's Harmony",          type: "Self-Buff", rarity: "3★", effect: "+30% ATK, +20% DEF, +15% Speed 25min",cooldown: "60 min",desc: "Harmonia do bardo." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1★", effect: "+12% DEF armadura pesada",        cooldown: "N/A",    desc: "Maestria pesada." },
      { name: "Boost HP",              type: "Passivo",  rarity: "1★", effect: "+12% Max HP",                     cooldown: "N/A",    desc: "HP reforçado." }
    ]
  },

  // ─── SWORD MUSE (3ª classe — MEGA BARD + DPS) ───
  swordMuse: {
    name: 'Sword Muse', parent: 'swordSinger', stage: 3,
    desc: 'Musa da espada, bardo supremo com DPS. Skills anteriores permanecem.',
    base: { atk: 72, def: 58, hp: 580, mp: 160, eva: 14, crit: 12, mdef: 48 },
    skills: [
      { name: "Song of Purification",    type: "Self-Buff", rarity: "3★", effect: "+25% Debuff Resist por 20 min",     cooldown: "50 min", desc: "Canção de purificação." },
      { name: "Song of Elemental",       type: "Self-Buff", rarity: "3★", effect: "+20% all elemental ATK por 20 min", cooldown: "50 min", desc: "Canção elemental." },
      { name: "Song of Storm Guard",     type: "Self-Buff", rarity: "3★", effect: "+20% Wind Resist por 20 min",       cooldown: "50 min", desc: "Canção da tempestade." },
      { name: "Mass Song",               type: "Party-Buff",rarity: "3★", effect: "Aplica todas Songs na party 8 min", cooldown: "60 min", desc: "Canção em massa." },
      { name: "Final Song",              type: "Ativo",     rarity: "4★", effect: "Party +50% all stats por 20s",       cooldown: "300s",   desc: "Canção final — buff supremo." },
      { name: "Sonic Slash",             type: "Ativo",     rarity: "3★", effect: "Dano 380% + AoE 5 alvos",           cooldown: "20s",    desc: "Corte sônico." },
      { name: "Melody Strike",           type: "Ativo",     rarity: "3★", effect: "Dano 350% + stun 2s",               cooldown: "18s",    desc: "Golpe melódico." },
      { name: "Transcendent Melody",     type: "Ativo",     rarity: "4★", effect: "Dano AoE 550% + all songs refreshed",cooldown: "180s",  desc: "Melodia transcendente." },
      { name: "Sword Muse Harmony",      type: "Self-Buff", rarity: "4★", effect: "+50% ATK, +40% DEF, +30% Song Power 30min",cooldown: "90 min",desc: "Harmonia da musa." },
      { name: "Sword Muse Spirit",       type: "Passivo",   rarity: "3★", effect: "+15% Song effectiveness",           cooldown: "N/A",    desc: "Espírito da musa." },
      { name: "Body of Sword Muse",      type: "Passivo",   rarity: "3★", effect: "+10% Max HP, +10% Max MP",         cooldown: "N/A",    desc: "Corpo da musa." }
    ]
  },

  // ─── SCOUT (1ª classe — Elf) ───
  elfScout: {
    name: 'Scout', parent: 'elfFighter', race: 'elf', archetype: 'fighter', stage: 1,
    desc: 'Batedor élfico, dagger e bow. Skills anteriores permanecem.',
    base: { atk: 20, def: 10, hp: 140, mp: 40, eva: 18, crit: 12, mdef: 8 },
    skills: [
      { name: "Double Shot",          type: "Ativo",    rarity: "1★", effect: "2 disparos, dano total 200%",   cooldown: "10s",    desc: "Duplo disparo." },
      { name: "Backstab",             type: "Ativo",    rarity: "2★", effect: "Dano 250% por trás + crit",     cooldown: "14s",    desc: "Punhalada nas costas." },
      { name: "Dash",                 type: "Ativo",    rarity: "1★", effect: "+50% Speed por 8s",             cooldown: "20s",    desc: "Corrida rápida." },
      { name: "Light Armor Mastery",  type: "Passivo",  rarity: "1★", effect: "+12% EVA com armadura leve",    cooldown: "N/A",    desc: "Maestria leve." },
      { name: "Dagger Mastery",       type: "Passivo",  rarity: "1★", effect: "+12% ATK com dagger",           cooldown: "N/A",    desc: "Maestria em adagas." },
      { name: "Bow Mastery",          type: "Passivo",  rarity: "1★", effect: "+12% ATK com arco",             cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Critical Chance",      type: "Passivo",  rarity: "1★", effect: "+8% Crit Rate",                 cooldown: "N/A",    desc: "Senso crítico." }
    ]
  },

  // ─── PLAINS WALKER (2ª classe — dagger) ───
  plainsWalker: {
    name: 'Plains Walker', parent: 'elfScout', stage: 2,
    desc: 'Caminhante das planícies, dagger stealth. Skills anteriores permanecem.',
    base: { atk: 52, def: 18, hp: 290, mp: 60, eva: 30, crit: 26, mdef: 14 },
    skills: [
      { name: "Deadly Blow",       type: "Ativo",    rarity: "2★", effect: "Dano 280% + crit garantido",       cooldown: "14s",    desc: "Golpe mortal." },
      { name: "Lethal Blow",       type: "Ativo",    rarity: "3★", effect: "Dano 350% + chance kill 5%",       cooldown: "22s",    desc: "Golpe letal." },
      { name: "Sand Bomb",         type: "Ativo",    rarity: "2★", effect: "AoE blind 5s + dano 150%",         cooldown: "20s",    desc: "Bomba de areia." },
      { name: "Blinding Blow",     type: "Ativo",    rarity: "2★", effect: "Dano 240% + blind 4s",             cooldown: "18s",    desc: "Golpe cegante." },
      { name: "Shadow Step",       type: "Ativo",    rarity: "2★", effect: "Teleporta atrás do alvo",          cooldown: "15s",    desc: "Passo sombrio." },
      { name: "Switch",            type: "Ativo",    rarity: "2★", effect: "Troca posição com alvo",           cooldown: "25s",    desc: "Troca de posição." },
      { name: "Fake Death",        type: "Ativo",    rarity: "2★", effect: "Finge morte, perde aggro",         cooldown: "60s",    desc: "Morte falsa." },
      { name: "Trick",             type: "Ativo",    rarity: "2★", effect: "Remove alvo do inimigo",           cooldown: "20s",    desc: "Truque evasivo." },
      { name: "PW's Harmony",      type: "Self-Buff",rarity: "3★", effect: "+35% Crit, +25% EVA, +20% ATK 25min",cooldown: "60 min",desc: "Harmonia do caminhante." },
      { name: "Evasion",           type: "Passivo",  rarity: "2★", effect: "+12% EVA",                         cooldown: "N/A",    desc: "Evasão aprimorada." },
      { name: "Critical Power",    type: "Passivo",  rarity: "2★", effect: "+18% Crit Damage",                 cooldown: "N/A",    desc: "Poder crítico." },
      { name: "Focus",             type: "Passivo",  rarity: "1★", effect: "+10% Crit Rate",                   cooldown: "N/A",    desc: "Concentração." }
    ]
  },

  // ─── WIND RIDER (3ª classe) ───
  windRider: {
    name: 'Wind Rider', parent: 'plainsWalker', stage: 3,
    desc: 'Cavaleiro do vento, dagger supremo. Skills anteriores permanecem.',
    base: { atk: 95, def: 30, hp: 480, mp: 85, eva: 55, crit: 44, mdef: 20 },
    skills: [
      { name: "Wind Riding",                type: "Ativo",    rarity: "3★", effect: "+80% Speed + invisível 10s",         cooldown: "60s",    desc: "Cavalgando o vento." },
      { name: "Exciting Adventure",          type: "Self-Buff",rarity: "3★", effect: "+45% EVA, +30% Crit, +20% ATK 20min",cooldown: "55 min",desc: "Aventura élfica." },
      { name: "Lucky Strike",               type: "Ativo",    rarity: "3★", effect: "Dano 420% + chance loot 2x",         cooldown: "30s",    desc: "Golpe de sorte." },
      { name: "Transcendent Deadly Blow",    type: "Ativo",    rarity: "4★", effect: "Dano 650% + ignora EVA + bleed 12s", cooldown: "150s",   desc: "Golpe mortal transcendente." },
      { name: "Wind Rider Harmony",          type: "Self-Buff",rarity: "4★", effect: "+55% Crit, +45% EVA, +35% ATK 30min",cooldown: "90 min",desc: "Harmonia suprema." },
      { name: "Master of Combat",            type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% Crit, +5% PvE",      cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Shadow Sense",                type: "Passivo",  rarity: "3★", effect: "+15% EVA à noite/dungeon",           cooldown: "N/A",    desc: "Sentido das sombras." },
      { name: "Wind Rider Spirit",           type: "Passivo",  rarity: "3★", effect: "+12% dagger ATK",                    cooldown: "N/A",    desc: "Espírito do cavaleiro do vento." },
      { name: "Body of Wind Rider",          type: "Passivo",  rarity: "3★", effect: "+10% Max HP, +8% EVA",              cooldown: "N/A",    desc: "Corpo do vento." },
      { name: "Final Frenzy",                type: "Passivo",  rarity: "3★", effect: "+25% ATK quando HP < 30%",           cooldown: "N/A",    desc: "Frenesi final." }
    ]
  },

  // ─── SILVER RANGER (2ª classe — archer) ───
  silverRanger: {
    name: 'Silver Ranger', parent: 'elfScout', stage: 2,
    desc: 'Arqueiro prateado élfico. Skills anteriores permanecem.',
    base: { atk: 58, def: 16, hp: 270, mp: 60, eva: 22, crit: 24, mdef: 12 },
    skills: [
      { name: "Double Shot",       type: "Ativo",    rarity: "2★", effect: "2 disparos, dano total 260%",     cooldown: "10s",    desc: "Duplo disparo aprimorado." },
      { name: "Burst Shot",        type: "Ativo",    rarity: "2★", effect: "Dano 280% + knockback",           cooldown: "14s",    desc: "Disparo explosivo." },
      { name: "Stun Shot",         type: "Ativo",    rarity: "2★", effect: "Dano 220% + stun 3s",            cooldown: "18s",    desc: "Disparo atordoante." },
      { name: "Arrow Rain",        type: "Ativo",    rarity: "3★", effect: "AoE 320% (8 alvos)",             cooldown: "22s",    desc: "Chuva de flechas." },
      { name: "Rapid Fire",        type: "Ativo",    rarity: "2★", effect: "+50% ATK Speed arco 15s",        cooldown: "45s",    desc: "Disparo rápido." },
      { name: "SR's Harmony",      type: "Self-Buff",rarity: "3★", effect: "+35% ATK, +25% Crit, +15% Range 25min",cooldown: "60 min",desc: "Harmonia do ranger." },
      { name: "Bow Mastery",       type: "Passivo",  rarity: "2★", effect: "+18% ATK com arco",              cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Long Shot",         type: "Passivo",  rarity: "2★", effect: "+30% Range",                      cooldown: "N/A",    desc: "Longo alcance." },
      { name: "Focus",             type: "Passivo",  rarity: "1★", effect: "+10% Crit Rate",                  cooldown: "N/A",    desc: "Concentração." },
      { name: "Critical Power",    type: "Passivo",  rarity: "2★", effect: "+18% Crit Damage",                cooldown: "N/A",    desc: "Poder crítico." },
      { name: "Evasion",           type: "Passivo",  rarity: "1★", effect: "+10% EVA",                        cooldown: "N/A",    desc: "Evasão." }
    ]
  },

  // ─── MOONLIGHT SENTINEL (3ª classe) ───
  moonlightSentinel: {
    name: 'Moonlight Sentinel', parent: 'silverRanger', stage: 3,
    desc: 'Sentinela do luar, arqueiro supremo élfico. Skills anteriores permanecem.',
    base: { atk: 108, def: 24, hp: 450, mp: 95, eva: 38, crit: 46, mdef: 18 },
    skills: [
      { name: "Seven Arrow",                  type: "Ativo",    rarity: "3★", effect: "7 flechas, dano total 480%",               cooldown: "25s",    desc: "Sete flechas." },
      { name: "Dead Eye",                     type: "Self-Buff",rarity: "3★", effect: "+50% ATK, +40% Range 20min",              cooldown: "55 min", desc: "Olho mortal." },
      { name: "Pinpoint Shot",                type: "Ativo",    rarity: "3★", effect: "Dano 400% + ignora 50% DEF",              cooldown: "28s",    desc: "Tiro preciso." },
      { name: "Triple Shot",                  type: "Ativo",    rarity: "3★", effect: "3 disparos, dano total 360%",              cooldown: "14s",    desc: "Tiro triplo." },
      { name: "Thorn Shot",                   type: "Ativo",    rarity: "2★", effect: "Dano 260% + bleed 10s",                   cooldown: "12s",    desc: "Flecha de espinhos." },
      { name: "Binding Shot",                 type: "Ativo",    rarity: "2★", effect: "Dano 220% + root 4s",                     cooldown: "18s",    desc: "Flecha aprisionadora." },
      { name: "Incendiary Shot",              type: "Ativo",    rarity: "2★", effect: "Dano fogo 280% + burn 8s",                cooldown: "16s",    desc: "Flecha incendiária." },
      { name: "Freezing Shot",                type: "Ativo",    rarity: "2★", effect: "Dano gelo 260% + slow 40% 6s",            cooldown: "16s",    desc: "Flecha congelante." },
      { name: "Wind Shot",                    type: "Ativo",    rarity: "2★", effect: "Dano vento 270% + knockback",             cooldown: "16s",    desc: "Flecha do vento." },
      { name: "Flame Arrow Rain",             type: "Ativo",    rarity: "3★", effect: "AoE fogo 380% (10 alvos) + burn",         cooldown: "28s",    desc: "Chuva de flechas flamejantes." },
      { name: "Spiral Shot",                  type: "Ativo",    rarity: "3★", effect: "Dano 420% + penetra alvos",               cooldown: "24s",    desc: "Tiro espiral." },
      { name: "Target Lock",                  type: "Ativo",    rarity: "3★", effect: "Marca alvo: +40% dano 12s",                cooldown: "30s",    desc: "Trava de mira." },
      { name: "Transcendent Seven Arrow",     type: "Ativo",    rarity: "4★", effect: "Dano 700% + elemental + ignora DEF",      cooldown: "180s",   desc: "Sete flechas transcendentes." },
      { name: "Moonlight Harmony",            type: "Self-Buff",rarity: "4★", effect: "+60% ATK, +50% Crit, +40% Range 30min",   cooldown: "90 min", desc: "Harmonia do luar." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3★", effect: "+10% ATK, +10% Range, +5% PvE",          cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Moonlight Sentinel Spirit",    type: "Passivo",  rarity: "3★", effect: "+15% Bow ATK",                            cooldown: "N/A",    desc: "Espírito do sentinela." },
      { name: "Body of Moonlight Sentinel",   type: "Passivo",  rarity: "3★", effect: "+10% Max HP, +8% EVA",                   cooldown: "N/A",    desc: "Corpo do sentinela." }
    ]
  },

  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  //  ELF MAGE
  // ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

  elfMage: {
    name: 'Elf Mage', archetype: 'mage', race: 'elf', stage: 0,
    desc: 'Mago élfico da natureza.',
    base: { atk: 4, def: 5, hp: 65, mp: 85, eva: 8, crit: 3, matk: 14, mdef: 10 },
    skills: [
      { name: "Wind Strike",   type: "Ativo",    rarity: "1★", effect: "Dano vento 160%",             cooldown: "8s",     desc: "Rajada de vento." },
      { name: "Ice Bolt",      type: "Ativo",    rarity: "1★", effect: "Dano gelo 155% + slow 15% 4s",cooldown: "8s",     desc: "Projétil de gelo." },
      { name: "Self Heal",     type: "Ativo",    rarity: "1★", effect: "Cura 20% HP",                 cooldown: "25s",    desc: "Autocura." },
      { name: "Sleep",         type: "Ativo",    rarity: "1★", effect: "Adormece alvo 8s",             cooldown: "30s",    desc: "Sono mágico." },
      { name: "Robe Mastery",  type: "Passivo",  rarity: "1★", effect: "+10% M.DEF, +8% Cast Speed",   cooldown: "N/A",    desc: "Maestria em vestes." },
      { name: "MP Increase",   type: "Passivo",  rarity: "1★", effect: "+8% Max MP",                   cooldown: "N/A",    desc: "Reserva mágica." }
    ]
  },

  // ─── ELVEN WIZARD (1ª classe) ───
  elvenWizard: {
    name: 'Elven Wizard', parent: 'elfMage', race: 'elf', archetype: 'mage', stage: 1,
    desc: 'Mago élfico elemental. Skills anteriores permanecem.',
    base: { atk: 5, def: 7, hp: 95, mp: 135, eva: 6, crit: 4, matk: 33, mdef: 20 },
    skills: [
      { name: "Blaze",              type: "Ativo",    rarity: "1★", effect: "Dano fogo 210%",                 cooldown: "10s",    desc: "Chamas." },
      { name: "Aqua Swirl",         type: "Ativo",    rarity: "1★", effect: "Dano água 200% + slow 20% 5s",   cooldown: "10s",    desc: "Turbilhão aquático." },
      { name: "Twister",            type: "Ativo",    rarity: "1★", effect: "Dano vento 195%",                cooldown: "10s",    desc: "Tornado menor." },
      { name: "Aura Burn",          type: "Ativo",    rarity: "2★", effect: "AoE fogo 180% ao redor",         cooldown: "14s",    desc: "Queimadura áurica." },
      { name: "Life Drain",         type: "Ativo",    rarity: "2★", effect: "Dano 190% + drena 25% HP",       cooldown: "15s",    desc: "Dreno vital." },
      { name: "Wizard's Harmony",   type: "Self-Buff",rarity: "2★", effect: "+25% M.ATK, +15% Cast Speed 20min",cooldown: "45 min",desc: "Harmonia do mago élfico." },
      { name: "Boost Mana",         type: "Passivo",  rarity: "1★", effect: "+12% Max MP",                    cooldown: "N/A",    desc: "Reserva mágica." }
    ]
  },

  // ─── SPELLSINGER (2ª classe — WATER/WIND) ───
  spellsinger: {
    name: 'Spellsinger', parent: 'elvenWizard', stage: 2,
    desc: 'Cantor de magias, foco em água e vento. Skills anteriores permanecem.',
    base: { atk: 7, def: 13, hp: 170, mp: 250, eva: 7, crit: 5, matk: 72, mdef: 42 },
    skills: [
      { name: "Hydro Blast",          type: "Ativo",    rarity: "2★", effect: "Dano água 300% + knockback",       cooldown: "15s",    desc: "Explosão hídrica." },
      { name: "Hurricane",            type: "Ativo",    rarity: "2★", effect: "Dano vento 290%",                  cooldown: "16s",    desc: "Furacão." },
      { name: "Blizzard",             type: "Ativo",    rarity: "3★", effect: "AoE gelo 340% + slow 30% 6s",      cooldown: "22s",    desc: "Nevasca." },
      { name: "Tempest",              type: "Ativo",    rarity: "3★", effect: "AoE vento 350% (8 alvos)",         cooldown: "25s",    desc: "Tempestade." },
      { name: "Solar Flare",          type: "Ativo",    rarity: "3★", effect: "Dano fogo 360% + blind 4s",        cooldown: "25s",    desc: "Explosão solar." },
      { name: "Elemental Symphony",   type: "Ativo",    rarity: "3★", effect: "Dano multi-element 380%",          cooldown: "24s",    desc: "Sinfonia elemental." },
      { name: "Arcane Power",         type: "Self-Buff",rarity: "3★", effect: "+40% M.ATK por 30s",               cooldown: "90s",    desc: "Poder arcano." },
      { name: "Freezing Skin",        type: "Self-Buff",rarity: "2★", effect: "Atacantes recebem slow 20% 15s",   cooldown: "45s",    desc: "Pele congelante." },
      { name: "Cancel",               type: "Ativo",    rarity: "3★", effect: "Remove 3 buffs do alvo",           cooldown: "40s",    desc: "Cancelamento." },
      { name: "Body to Mind",         type: "Ativo",    rarity: "2★", effect: "Converte 15% HP em 30% MP",        cooldown: "30s",    desc: "Corpo em mente." },
      { name: "SS's Harmony",         type: "Self-Buff",rarity: "3★", effect: "+35% M.ATK, +20% Cast Speed 25min",cooldown: "60 min", desc: "Harmonia do cantor." },
      { name: "Elemental Assault",    type: "Passivo",  rarity: "2★", effect: "+12% elemental damage",            cooldown: "N/A",    desc: "Assalto elemental." }
    ]
  },

  // ─── MYSTIC MUSE (3ª classe — FOCO WATER) ───
  mysticMuse: {
    name: 'Mystic Muse', parent: 'spellsinger', stage: 3,
    desc: 'Musa mística, mestre da magia aquática. Skills anteriores permanecem. Foco: WATER.',
    base: { atk: 9, def: 18, hp: 280, mp: 440, eva: 8, crit: 7, matk: 130, mdef: 68 },
    skills: [
      { name: "Aqua Splash",                  type: "Ativo",    rarity: "3★", effect: "Dano water 420% + AoE splash",             cooldown: "22s",    desc: "Respingo aquático massivo." },
      { name: "Water Spiral",                  type: "Ativo",    rarity: "3★", effect: "Dano water 400% + penetra alvos",         cooldown: "20s",    desc: "Espiral de água perfurante." },
      { name: "Aqua Explosion",                type: "Ativo",    rarity: "4★", effect: "Dano water AoE 680% + freeze 4s",         cooldown: "160s",   desc: "EXPLOSÃO AQUÁTICA — devastação total." },
      { name: "Seed of Water",                 type: "Ativo",    rarity: "2★", effect: "Planta semente: explode 300% água após 5s",cooldown: "20s",   desc: "Semente de água." },
      { name: "Elemental Burst",               type: "Ativo",    rarity: "3★", effect: "Explode Seeds: dano 500%",                cooldown: "18s",    desc: "Explosão elemental (combo Seeds)." },
      { name: "Elemental Storm",               type: "Ativo",    rarity: "3★", effect: "AoE multi-element 440% (8 alvos)",        cooldown: "30s",    desc: "Tempestade elemental." },
      { name: "Mystic Immunity",               type: "Ativo",    rarity: "4★", effect: "Imune a magia 8s",                        cooldown: "180s",   desc: "Imunidade mística." },
      { name: "Empowering Echo",               type: "Ativo",    rarity: "3★", effect: "Próxima skill: +50% dano",                cooldown: "45s",    desc: "Eco potencializador." },
      { name: "Transcendent Aqua Explosion",   type: "Ativo",    rarity: "4★", effect: "Dano water 850% + freeze 6s + AoE",       cooldown: "200s",   desc: "Explosão aquática transcendente." },
      { name: "Mystic Muse Harmony",           type: "Self-Buff",rarity: "4★", effect: "+55% M.ATK, +35% Cast Speed, +20% MP 30min",cooldown: "90 min",desc: "Harmonia da musa." },
      { name: "Master of Magic",               type: "Passivo",  rarity: "3★", effect: "+10% M.ATK, +10% water dmg, +5% PvE",    cooldown: "N/A",    desc: "Mestre da magia." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3★", effect: "+12% M. Skill Power",                    cooldown: "N/A",    desc: "Maestria em feitiços." },
      { name: "Magic Focus",                    type: "Passivo",  rarity: "3★", effect: "+8% M. Crit Rate",                       cooldown: "N/A",    desc: "Foco mágico." },
      { name: "Mystic Muse Spirit",            type: "Passivo",  rarity: "3★", effect: "+15% water magic ATK",                    cooldown: "N/A",    desc: "Espírito da musa." },
      { name: "Body of the Mystic Muse",       type: "Passivo",  rarity: "3★", effect: "+10% Max MP, +8% M.DEF",                 cooldown: "N/A",    desc: "Corpo da musa." }
    ]
  },

  // ─── ELEMENTAL SUMMONER → ELEMENTAL MASTER ───
  elementalSummoner: {
    name: 'Elemental Summoner', parent: 'elvenWizard', stage: 2,
    desc: 'Invocador elemental élfico. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 6, def: 14, hp: 185, mp: 245, eva: 6, crit: 4, matk: 60, mdef: 40 },
    skills: [
      { name: "Summon Unicorn Boxer",   type: "Ativo",    rarity: "2★", effect: "Invoca unicórnio fighter (ATK 50%)",  cooldown: "60s",    desc: "Unicórnio lutador." },
      { name: "Summon Unicorn Mirage",  type: "Ativo",    rarity: "2★", effect: "Invoca unicórnio mago (M.ATK 50%)",  cooldown: "60s",    desc: "Unicórnio ilusório." },
      { name: "Summon Unicorn Merrow",  type: "Ativo",    rarity: "3★", effect: "Invoca merrow (ATK 65%, tank)",      cooldown: "90s",    desc: "Merrow aquático." },
      { name: "Servitor Heal",          type: "Ativo",    rarity: "2★", effect: "Cura summon 35% HP",                 cooldown: "12s",    desc: "Cura do servitor." },
      { name: "Servitor Recharge",      type: "Ativo",    rarity: "2★", effect: "Restaura 30% MP do summon",          cooldown: "15s",    desc: "Recarga do servitor." },
      { name: "Transfer Pain",          type: "Toggle",   rarity: "2★", effect: "50% dano recebido vai pro summon",   cooldown: "N/A",    desc: "Transferência de dor." },
      { name: "Summon Life Cubic",      type: "Ativo",    rarity: "2★", effect: "Cubic que cura 5%/5s",               cooldown: "45s",    desc: "Cubic vital." },
      { name: "ES's Harmony",           type: "Self-Buff",rarity: "3★", effect: "+30% M.ATK, +25% Summon ATK 25min",  cooldown: "60 min", desc: "Harmonia do invocador." },
      { name: "Servitor Physical ATK",  type: "Passivo",  rarity: "2★", effect: "+15% Summon ATK",                    cooldown: "N/A",    desc: "Poder do servitor." }
    ]
  },

  elementalMaster: {
    name: 'Elemental Master', parent: 'elementalSummoner', stage: 3,
    desc: 'Mestre elemental, invocador supremo élfico. Skills anteriores permanecem.',
    base: { atk: 9, def: 20, hp: 300, mp: 420, eva: 7, crit: 5, matk: 115, mdef: 62 },
    skills: [
      { name: "Summon Feline Queen",            type: "Ativo",    rarity: "4★", effect: "Invoca Rainha Felina (ATK 90% do dono)",    cooldown: "120s",   desc: "Rainha felina — summon supremo." },
      { name: "Summon Seraphim",                type: "Ativo",    rarity: "3★", effect: "Invoca Serafim (cura+suporte 60%)",        cooldown: "90s",    desc: "Serafim celestial." },
      { name: "Servitor Barrier",               type: "Ativo",    rarity: "3★", effect: "Summon ganha escudo 5000 HP 15s",          cooldown: "60s",    desc: "Barreira do servitor." },
      { name: "Mass Servitor Heal",             type: "Ativo",    rarity: "3★", effect: "Cura todos summons 40% HP",               cooldown: "25s",    desc: "Cura em massa." },
      { name: "Final Servitor",                 type: "Ativo",    rarity: "4★", effect: "Summon sacrifica: AoE 600% + cura 50%",    cooldown: "180s",   desc: "Sacrifício final." },
      { name: "Transcendent Summon Burst",      type: "Ativo",    rarity: "4★", effect: "Todos summons atacam: 800% total",        cooldown: "200s",   desc: "Explosão de invocações." },
      { name: "Elemental Master Harmony",       type: "Self-Buff",rarity: "4★", effect: "+50% M.ATK, +60% Summon Power 30min",     cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Unicorn's Friendship",           type: "Passivo",  rarity: "3★", effect: "+20% Summon ATK/DEF",                     cooldown: "N/A",    desc: "Amizade dos unicórnios." },
      { name: "Elemental Concentration",        type: "Passivo",  rarity: "3★", effect: "+10% M.ATK, +10% Summon HP",              cooldown: "N/A",    desc: "Concentração elemental." },
      { name: "Elemental Master Spirit",        type: "Passivo",  rarity: "3★", effect: "+12% M.ATK, +8% Summon Speed",            cooldown: "N/A",    desc: "Espírito do mestre elemental." },
      { name: "Body of the Elemental Master",   type: "Passivo",  rarity: "3★", effect: "+10% Max MP, +8% Max HP",                cooldown: "N/A",    desc: "Corpo do mestre." }
    ]
  },

  // ─── ORACLE → ELDER → EVA'S SAINT ───
  elfOracle: {
    name: 'Oracle', parent: 'elfMage', race: 'elf', archetype: 'healer', stage: 1,
    desc: 'Oráculo élfico curador. Skills anteriores permanecem.',
    base: { atk: 6, def: 12, hp: 110, mp: 115, eva: 5, crit: 3, matk: 20, mdef: 25 },
    skills: [
      { name: "Heal",          type: "Ativo",      rarity: "1★", effect: "Cura 25% HP alvo",              cooldown: "8s",     desc: "Cura básica." },
      { name: "Battle Heal",   type: "Ativo",      rarity: "1★", effect: "Cura 20% HP + remove 1 debuff", cooldown: "10s",    desc: "Cura de combate." },
      { name: "Might",         type: "Party-Buff", rarity: "1★", effect: "+15% ATK party 10 min",         cooldown: "25 min", desc: "Bênção de força." },
      { name: "Shield (Buff)", type: "Party-Buff", rarity: "1★", effect: "+15% DEF party 10 min",         cooldown: "25 min", desc: "Bênção de proteção." },
      { name: "Cure Poison",   type: "Ativo",      rarity: "1★", effect: "Remove poison",                 cooldown: "5s",     desc: "Cura veneno." },
      { name: "Cure Bleed",    type: "Ativo",      rarity: "1★", effect: "Remove bleed",                  cooldown: "5s",     desc: "Estanca sangramento." },
      { name: "Recharge",      type: "Ativo",      rarity: "1★", effect: "Restaura 20% MP alvo",          cooldown: "12s",    desc: "Recarga de mana." }
    ]
  },

  elfElder: {
    name: 'Elder', parent: 'elfOracle', stage: 2,
    desc: 'Ancião élfico, curador e buffer. Skills anteriores permanecem.',
    base: { atk: 8, def: 25, hp: 240, mp: 210, eva: 5, crit: 3, matk: 45, mdef: 55 },
    skills: [
      { name: "Greater Heal",       type: "Ativo",      rarity: "2★", effect: "Cura 40% HP alvo",                    cooldown: "10s",    desc: "Cura avançada." },
      { name: "Greater Group Heal", type: "Ativo",      rarity: "3★", effect: "Cura 30% HP party",                   cooldown: "18s",    desc: "Cura em grupo." },
      { name: "Resurrection",       type: "Ativo",      rarity: "3★", effect: "Ressuscita aliado 30% HP",            cooldown: "120s",   desc: "Ressurreição." },
      { name: "Purify",             type: "Ativo",      rarity: "2★", effect: "Remove 3 debuffs",                    cooldown: "20s",    desc: "Purificação." },
      { name: "Cleanse",            type: "Ativo",      rarity: "3★", effect: "Remove TODOS debuffs",                cooldown: "45s",    desc: "Limpeza total." },
      { name: "Empower",            type: "Self-Buff",  rarity: "2★", effect: "+25% M.ATK por 20 min",               cooldown: "50 min", desc: "Empoderamento." },
      { name: "Acumen",             type: "Self-Buff",  rarity: "2★", effect: "+25% Cast Speed por 20 min",          cooldown: "50 min", desc: "Acuidade." },
      { name: "Haste",              type: "Self-Buff",  rarity: "2★", effect: "+30% ATK Speed por 20 min",           cooldown: "50 min", desc: "Aceleração." },
      { name: "Clarity",            type: "Self-Buff",  rarity: "2★", effect: "+20% MP Regen por 20 min",            cooldown: "50 min", desc: "Clareza mágica." },
      { name: "Prophecy of Water",  type: "Party-Buff", rarity: "3★", effect: "+30% M.ATK, +20% M.DEF party 12min",  cooldown: "30 min", desc: "Profecia da água." },
      { name: "Mental Shield",      type: "Party-Buff", rarity: "2★", effect: "+20% M.DEF party 12 min",            cooldown: "30 min", desc: "Escudo mental." },
      { name: "Elder's Harmony",    type: "Self-Buff",  rarity: "3★", effect: "+35% Heal, +25% M.ATK 25min",        cooldown: "60 min", desc: "Harmonia do ancião." },
      { name: "Resist Aqua",        type: "Passivo",    rarity: "1★", effect: "+10% Water Resist",                   cooldown: "N/A",    desc: "Resistência aquática." }
    ]
  },

  evaSaint: {
    name: "Eva's Saint", parent: 'elfElder', stage: 3,
    desc: 'Santa de Eva, curadora suprema élfica. Skills anteriores permanecem.',
    base: { atk: 10, def: 40, hp: 400, mp: 470, eva: 6, crit: 4, matk: 90, mdef: 95 },
    skills: [
      { name: "Sublime Self-Sacrifice",        type: "Ativo",      rarity: "4★", effect: "Morre para curar party 100% HP+MP",    cooldown: "300s",   desc: "Auto-sacrifício." },
      { name: "Balance Life",                  type: "Ativo",      rarity: "3★", effect: "Equaliza HP de toda party",             cooldown: "60s",    desc: "Equilíbrio vital." },
      { name: "Mass Resurrection",             type: "Ativo",      rarity: "4★", effect: "Ressuscita toda party 40% HP",         cooldown: "300s",   desc: "Ressurreição em massa." },
      { name: "Miracle",                       type: "Ativo",      rarity: "4★", effect: "Cura party 80% HP + ressurge mortos",  cooldown: "300s",   desc: "Milagre." },
      { name: "Blessing of Eva",               type: "Party-Buff", rarity: "3★", effect: "+25% M.DEF + resist debuff 12min",     cooldown: "30 min", desc: "Bênção de Eva." },
      { name: "Dark Side",                     type: "Toggle",     rarity: "3★", effect: "Troca: -60% Heal, +80% M.ATK holy",    cooldown: "N/A",    desc: "Lado sombrio." },
      { name: "Aqua Strike",                   type: "Ativo",      rarity: "3★", effect: "Dano water 380% + slow 40% 6s",        cooldown: "22s",    desc: "Golpe aquático." },
      { name: "Divine Nova",                   type: "Ativo",      rarity: "3★", effect: "Dano holy AoE 450% + blind 5s",        cooldown: "25s",    desc: "Nova divina." },
      { name: "Eva's Saint Harmony",           type: "Self-Buff",  rarity: "4★", effect: "+55% Heal, +40% M.ATK, +30% M.DEF 30min",cooldown: "90 min",desc: "Harmonia suprema." },
      { name: "Master of Healing",             type: "Passivo",    rarity: "3★", effect: "+15% Heal Power, +5% PvE",            cooldown: "N/A",    desc: "Mestre da cura." },
      { name: "Eva's Saint Spirit",            type: "Passivo",    rarity: "3★", effect: "+12% holy magic ATK",                  cooldown: "N/A",    desc: "Espírito da santa." },
      { name: "Body of Eva's Saint",           type: "Passivo",    rarity: "3★", effect: "+12% Max MP, +10% M.DEF",             cooldown: "N/A",    desc: "Corpo da santa." },
      { name: "Eva's Help",                    type: "Passivo",    rarity: "3★", effect: "10% chance ao ser atacado: cura 5% HP",cooldown: "N/A",    desc: "Ajuda de Eva (trigger)." }
    ]
  },
    // ===================== DARK ELF =====================
  darkElfFighter: { name: 'Dark Elf Fighter', archetype: 'fighter', stage: 0, race: 'darkelf' },

  palusKnight: { name: 'Palus Knight', parent: 'darkElfFighter', stage: 1, base: { atk: 25, def: 28, hp: 130 } },
  shillienKnight: { name: 'Shillien Knight', parent: 'palusKnight', stage: 2, base: { atk: 52, def: 65, hp: 310 } },
  shillienTemplar: { name: 'Shillien Templar', parent: 'shillienKnight', stage: 3, base: { atk: 92, def: 108, hp: 590 },
    skills: [
      { name: "Touch of Shillien", type: "Ativo", rarity: "3★", effect: "Dano Dark 480% + Weaken", cooldown: "26s", note: "Skill permanece após trocar de classe" },
      { name: "Shillien Templar Harmony", type: "Self-Buff", rarity: "4★", effect: "+48% ATK e +40% Dark Damage por 25 min", cooldown: "70 min", note: "Skill permanece após trocar de classe" }
    ]
  },

  bladeDancer: { name: 'Blade Dancer', parent: 'palusKnight', stage: 2, base: { atk: 62, def: 52, hp: 300 } },
  spectralDancer: { name: 'Spectral Dancer', parent: 'bladeDancer', stage: 3, base: { atk: 112, def: 70, hp: 480 },
    skills: [
      { name: "Dance of Berserker", type: "Self-Buff", rarity: "4★", effect: "+55% ATK mas -15% DEF por 15 min", cooldown: "65 min", note: "Skill permanece após trocar de classe" },
      { name: "Shadow Slash", type: "Ativo", rarity: "3★", effect: "Dano Dark 420%", cooldown: "20s", note: "Skill permanece após trocar de classe" }
    ]
  },

  abyssWalker: { name: 'Abyss Walker', parent: 'darkElfFighter', stage: 2, base: { atk: 68, def: 28, eva: 42, crit: 30 } },
  ghostHunter: { name: 'Ghost Hunter', parent: 'abyssWalker', stage: 3, base: { atk: 118, def: 42, eva: 65, crit: 48 } },

  phantomRanger: { name: 'Phantom Ranger', parent: 'darkElfFighter', stage: 2, base: { atk: 72, def: 25, eva: 32, crit: 28 } },
  ghostSentinel: { name: 'Ghost Sentinel', parent: 'phantomRanger', stage: 3, base: { atk: 128, def: 35, eva: 48, crit: 52 },
    skills: [
      { name: "Seven Arrow", type: "Ativo", rarity: "3★", effect: "7 disparos sombrios 490%", cooldown: "26s", note: "Skill permanece após trocar de classe" }
    ]
  },

  darkWizard: { name: 'Dark Wizard', parent: 'mage', race: 'darkelf', stage: 1, base: { matk: 40, mdef: 22, mp: 100 } },
  spellhowler: { name: 'Spellhowler', parent: 'darkWizard', stage: 2, base: { matk: 82, mdef: 48, mp: 210 } },
  stormScreamer: { name: 'Storm Screamer', parent: 'spellhowler', stage: 3, base: { matk: 145, mdef: 75, mp: 430 },
    skills: [
      { name: "Demon Wind", type: "Ativo", rarity: "4★", effect: "Dano Vento sombrio 720%", cooldown: "160s", note: "Skill permanece após trocar de classe" },
      { name: "Storm Screamer Harmony", type: "Self-Buff", rarity: "4★", effect: "+58% M.ATK por 25 min", cooldown: "75 min", note: "Skill permanece após trocar de classe" }
    ]
  },

  shillienOracle: { name: 'Shillien Oracle', parent: 'mage', race: 'darkelf', stage: 1, base: { matk: 25, mdef: 30, mp: 75 } },
  shillienElder: { name: 'Shillien Elder', parent: 'shillienOracle', stage: 2, base: { matk: 55, mdef: 60, mp: 190 } },
  shillienSaint: { name: 'Shillien Saint', parent: 'shillienElder', stage: 3, base: { matk: 98, mdef: 98, mp: 410 },
    skills: [
      { name: "Dark Side", type: "Toggle", rarity: "3★", effect: "Modo DPS (aumenta dano mágico)", cooldown: "N/A", note: "Skill permanece após trocar de classe" }
    ]
  },

  // Export (mantenha no final do arquivo)
if (typeof window !== 'undefined') window.CLASSES_ECHO = CLASSES_ECHO;
if (typeof module !== 'undefined') module.exports = CLASSES_ECHO;

console.log("✅ Carregada com sucesso.");
