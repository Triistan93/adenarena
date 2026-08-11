// ============================================================
// LINEAGE 2 ESSENCE 547 - ECHO OF ELEMENTS
// classes_echo.js - VERS├âO COMPLETA
// Regra: Skills aprendidas nas classes anteriores PERMANECEM
// ============================================================

const RACES_ECHO = {
  human:    { name: 'Human',     desc: 'Versáteis, equilibrados em combate e magia.',       stats: { atk: 0,  def: 0,  eva: 0,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  elf:      { name: 'Elf',       desc: 'Graciosos, alta esquiva e velocidade de ataque.',    stats: { atk: 0,  def:-2,  eva: 8,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  darkelf:  { name: 'Dark Elf',  desc: 'Sombrios, dano crítico e magia negra devastadora.', stats: { atk: 2,  def:-2,  eva: 4,  matk: 6,  mdef: 2  }, startZone: 'talkingIsland' },
  orc:      { name: 'Orc',       desc: 'Resistentes, força bruta e HP elevado.',             stats: { atk: 4,  def: 6,  eva:-4,  matk:-2,  mdef:-2 }, startZone: 'talkingIsland' },
  dwarf:    { name: 'Dwarf',     desc: 'Mestres artesãos com bônus de loot e craft.',        stats: { atk: 0,  def: 4,  eva:-2,  matk: 0,  mdef: 0, lootBonus: 0.15 }, startZone: 'talkingIsland' },
  kamael:   { name: 'Kamael',    desc: 'Ágeis e mortais, especialistas em alma e espada.',   stats: { atk: 6,  def:-2,  eva: 6,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  sylph:    { name: 'Sylph',     desc: 'Atiradores elementais do vento com armas de fogo.', stats: { atk: 4,  def:-2,  eva:12,  matk: 2,  mdef: 0  }, startZone: 'talkingIsland' },
  highelf:  { name: 'High Elf',  desc: 'Elfos supremos com magia sagrada e defesa divina.', stats: { atk: 0,  def: 2,  eva: 4,  matk: 8,  mdef: 4  }, startZone: 'talkingIsland' },
  ertheia:  { name: 'Ertheia',   desc: 'Guerreiros do vento com alto potencial mágico.',    stats: { atk: 2,  def: 0,  eva:10,  matk: 4,  mdef: 0  }, startZone: 'talkingIsland' }
};

// ============================================================
//  FORMATO DE SKILL:
//  { name, type, rarity, effect, duration, cooldown, desc }
//  type: "Ativo" | "Passivo" | "Toggle" | "Self-Buff" | "Party-Buff"
//  rarity: "1Ôÿà" | "2Ôÿà" | "3Ôÿà" | "4Ôÿà"
//  Regra: Skills aprendidas em classes anteriores PERMANECEM
// ============================================================

const CLASSES_ECHO = {

  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  HUMAN FIGHTER
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô

  fighter: {
    name: 'Human Fighter', archetype: 'fighter', race: 'human', stage: 0,
    desc: 'Classe base de combate humana.',
    base: { atk: 12, def: 10, hp: 100, mp: 30, eva: 5, crit: 5, matk: 0, mdef: 5 },
    skills: [
      { name: "Power Strike",       type: "Ativo",    rarity: "1Ôÿà", effect: "Dano f├¡sico 150%",              cooldown: "8s",     desc: "Golpe concentrado no alvo." },
      { name: "Mortal Blow",         type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 170% + chance crit 20%",   cooldown: "10s",    desc: "Golpe com chance de cr├¡tico elevada." },
      { name: "Power Shot",          type: "Ativo",    rarity: "1Ôÿà", effect: "Dano ├á dist├óncia 140%",         cooldown: "9s",     desc: "Disparo concentrado." },
      { name: "Rush",                type: "Ativo",    rarity: "1Ôÿà", effect: "Avan├ºa ao alvo + dano 120%",    cooldown: "15s",    desc: "Investida r├ípida contra o inimigo." },
      { name: "Bandage",             type: "Ativo",    rarity: "1Ôÿà", effect: "Cura 15% HP",                   cooldown: "30s",    desc: "Curativo de emerg├¬ncia." },
      { name: "Fighter's Will",      type: "Self-Buff",rarity: "1Ôÿà", effect: "+10% ATK e +10% DEF por 15 min",cooldown: "30 min", desc: "Determina├º├úo do guerreiro." },
      { name: "HP Increase Lv1",     type: "Passivo",  rarity: "1Ôÿà", effect: "+5% Max HP",                    cooldown: "N/A",    desc: "Constitui├º├úo refor├ºada." },
      { name: "Light Armor Mastery", type: "Passivo",  rarity: "1Ôÿà", effect: "+8% DEF com armadura leve",     cooldown: "N/A",    desc: "Maestria em armaduras leves." }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARRIOR (1┬¬ classe) ÔöÇÔöÇÔöÇ
  warrior: {
    name: 'Warrior', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1,
    desc: 'Guerreiro corpo-a-corpo especializado em espadas e polearms. Skills anteriores permanecem.',
    base: { atk: 28, def: 18, hp: 180, mp: 45, eva: 6, crit: 8, mdef: 8 },
    skills: [
      { name: "Power Smash",           type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 190% + knockback",               cooldown: "10s",    desc: "Golpe esmagador." },
      { name: "Spinning Slash",        type: "Ativo",    rarity: "1Ôÿà", effect: "Dano AoE 160% ao redor",              cooldown: "12s",    desc: "Giro cortante ao redor." },
      { name: "Stun Attack",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 175% + stun 2s",                 cooldown: "18s",    desc: "Golpe atordoante." },
      { name: "Iron Will",             type: "Ativo",    rarity: "2Ôÿà", effect: "+30% DEF por 30s",                    cooldown: "45s",    desc: "Vontade de ferro tempor├íria." },
      { name: "War Cry",               type: "Ativo",    rarity: "2Ôÿà", effect: "+20% ATK para si por 60s",            cooldown: "60s",    desc: "Grito de guerra que inspira for├ºa." },
      { name: "Battle Roar",           type: "Self-Buff",rarity: "2Ôÿà", effect: "+25% ATK e +15% HP por 20 min",       cooldown: "45 min", desc: "Rugido de batalha." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com espada/blunt",           cooldown: "N/A",    desc: "Maestria em espadas e ma├ºas." },
      { name: "Polearm Mastery",       type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com polearm",                cooldown: "N/A",    desc: "Maestria em lan├ºas." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+12% DEF com armadura pesada",        cooldown: "N/A",    desc: "Maestria em armaduras pesadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Max HP",                         cooldown: "N/A",    desc: "Constitui├º├úo de guerreiro." },
      { name: "Weight Limit",          type: "Passivo",  rarity: "1Ôÿà", effect: "+15% capacidade de carga",            cooldown: "N/A",    desc: "Corpo treinado para suportar peso." }
    ]
  },

  // ÔöÇÔöÇÔöÇ GLADIATOR (2┬¬ classe) ÔöÇÔöÇÔöÇ
  gladiator: {
    name: 'Gladiator', parent: 'warrior', stage: 2,
    desc: 'Mestre em dual wield e combos devastadores. Skills anteriores permanecem.',
    base: { atk: 58, def: 28, hp: 320, mp: 65, eva: 8, crit: 18, mdef: 12 },
    skills: [
      { name: "Triple Slash",           type: "Ativo",    rarity: "2Ôÿà", effect: "3 golpes, dano total 300%",           cooldown: "14s",    desc: "Tr├¬s cortes r├ípidos consecutivos." },
      { name: "Sonic Blaster",          type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + stun 2s",                cooldown: "16s",    desc: "Onda s├┤nica que atordoa." },
      { name: "Sonic Storm",            type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 320% (8 alvos)",            cooldown: "25s",    desc: "Tempestade s├┤nica devastadora." },
      { name: "Sonic Buster",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 260% + pushback",               cooldown: "18s",    desc: "Explos├úo s├┤nica frontal." },
      { name: "Double Sonic Slash",     type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 350% em 2 hits",                cooldown: "22s",    desc: "Duplo corte s├┤nico." },
      { name: "Hammer Crush",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 230% + stun 3s",                cooldown: "20s",    desc: "Esmagamento com martelo." },
      { name: "Sonic Move",             type: "Ativo",    rarity: "2Ôÿà", effect: "Teleporte curto + 180% dano",        cooldown: "20s",    desc: "Movimento s├┤nico instant├óneo." },
      { name: "Lionheart",              type: "Ativo",    rarity: "3Ôÿà", effect: "Imune a medo/stun por 15s",          cooldown: "120s",   desc: "Cora├º├úo de le├úo ÔÇö coragem inabal├ível." },
      { name: "War Frenzy",             type: "Self-Buff",rarity: "2Ôÿà", effect: "+20% ATK Speed por 60s",             cooldown: "90s",    desc: "Frenesi de combate." },
      { name: "Vicious Stance",         type: "Toggle",   rarity: "2Ôÿà", effect: "+25% Crit Rate, -10% DEF",           cooldown: "N/A",    desc: "Postura agressiva permanente." },
      { name: "Gladiator's Harmony",    type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% ATK e +20% Crit por 25 min",    cooldown: "60 min", desc: "Harmonia do gladiador." },
      { name: "Dual Weapon Mastery",    type: "Passivo",  rarity: "2Ôÿà", effect: "+18% ATK com dual weapons",          cooldown: "N/A",    desc: "Maestria em armas duplas." },
      { name: "Focus",                  type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Crit Rate",                      cooldown: "N/A",    desc: "Concentra├º├úo em pontos vitais." },
      { name: "Critical Power",         type: "Passivo",  rarity: "2Ôÿà", effect: "+15% Crit Damage",                   cooldown: "N/A",    desc: "Poder cr├¡tico aumentado." },
      { name: "Boost HP",               type: "Passivo",  rarity: "1Ôÿà", effect: "+12% Max HP",                        cooldown: "N/A",    desc: "HP refor├ºado do gladiador." }
    ]
  },

  // ÔöÇÔöÇÔöÇ DUELIST (3┬¬ classe) ÔöÇÔöÇÔöÇ
  duelist: {
    name: 'Duelist', parent: 'gladiator', stage: 3,
    desc: 'Duelista supremo, mestre do dual wield. Skills anteriores permanecem.',
    base: { atk: 105, def: 42, hp: 580, mp: 95, eva: 12, crit: 30, mdef: 18 },
    skills: [
      { name: "Sonic Focus",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 380% + ignora 30% DEF",           cooldown: "28s",    desc: "Foco s├┤nico devastador." },
      { name: "Force Blaster",             type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 340% ├á dist├óncia",                cooldown: "20s",    desc: "Proj├®til de for├ºa s├┤nica." },
      { name: "Dual Blow",                 type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 400% + bleed 8s",                 cooldown: "24s",    desc: "Golpe duplo sangrento." },
      { name: "Rushing Force",             type: "Ativo",    rarity: "3Ôÿà", effect: "Rush + 320% dano + stun 2s",           cooldown: "22s",    desc: "Avan├ºo for├ºado." },
      { name: "Long Blow",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 280% alcance estendido",          cooldown: "16s",    desc: "Golpe de longo alcance." },
      { name: "Force Buster",              type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 360% frontal",               cooldown: "26s",    desc: "Explos├úo de for├ºa frontal." },
      { name: "Earthquake",                type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 420% + knockdown 3s",         cooldown: "35s",    desc: "Terremoto devastador." },
      { name: "Real Target",               type: "Ativo",    rarity: "2Ôÿà", effect: "Marca alvo: +30% dano contra ele 10s", cooldown: "30s",    desc: "Identifica ponto fraco." },
      { name: "Thrill Fight",              type: "Ativo",    rarity: "3Ôÿà", effect: "+40% ATK por 30s quando HP < 30%",     cooldown: "120s",   desc: "Adrenalina em estado cr├¡tico." },
      { name: "Sonic Rage",                type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 450% + AoE 5 alvos",             cooldown: "30s",    desc: "F├║ria s├┤nica descontrolada." },
      { name: "Transcendent Dual Blow",    type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 620% + bleed 12s + ignora DEF",   cooldown: "150s",   desc: "Golpe duplo transcendente." },
      { name: "Duelist's Harmony",         type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% ATK, +40% Crit, +20% Speed 30min",cooldown: "90 min", desc: "Harmonia suprema do duelista." },
      { name: "Master of Combat",          type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% Crit, +5% PvE dmg",    cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Duelist Spirit",            type: "Passivo",  rarity: "3Ôÿà", effect: "+15% dual weapon ATK",                 cooldown: "N/A",    desc: "Esp├¡rito do duelista." },
      { name: "Blade of the Duelist",      type: "Passivo",  rarity: "3Ôÿà", effect: "+12% P.Skill Power",                   cooldown: "N/A",    desc: "L├ómina imbu├¡da de poder." }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARLORD (2┬¬ classe) ÔöÇÔöÇÔöÇ
  warlord: {
    name: 'Warlord', parent: 'warrior', stage: 2,
    desc: 'Senhor da guerra com polearms e AoE devastador. Skills anteriores permanecem.',
    base: { atk: 52, def: 38, hp: 380, mp: 60, eva: 5, crit: 10, mdef: 18 },
    skills: [
      { name: "Whirlwind",              type: "Ativo",    rarity: "2Ôÿà", effect: "Dano AoE 280% (10 alvos)",           cooldown: "18s",    desc: "Redemoinho de lan├ºa." },
      { name: "Thunder Storm",          type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 340% + stun 2s",           cooldown: "25s",    desc: "Tempestade trovejante." },
      { name: "Howl",                   type: "Ativo",    rarity: "2Ôÿà", effect: "AoE taunt + -15% ATK inimigos 10s",  cooldown: "20s",    desc: "Uivo amea├ºador." },
      { name: "Provoke",               type: "Ativo",    rarity: "1Ôÿà", effect: "Taunt single + dano 120%",           cooldown: "10s",    desc: "Provoca├º├úo direta." },
      { name: "Fellswoop",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 250% + knockdown 2s",            cooldown: "20s",    desc: "Golpe varredor." },
      { name: "Freezing Strike",       type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + slow 30% por 8s",         cooldown: "18s",    desc: "Golpe congelante." },
      { name: "Burning Chop",          type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + burn 8s",                 cooldown: "18s",    desc: "Golpe flamejante." },
      { name: "Shock Stomp",           type: "Ativo",    rarity: "2Ôÿà", effect: "AoE 200% + stun 2s (perto)",          cooldown: "22s",    desc: "Pis├úo s├¡smico." },
      { name: "War Cry",               type: "Self-Buff",rarity: "2Ôÿà", effect: "+25% ATK por 60s",                    cooldown: "90s",    desc: "Grito de guerra do senhor." },
      { name: "Warlord's Harmony",     type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% ATK, +25% HP por 25 min",        cooldown: "60 min", desc: "Harmonia do senhor da guerra." },
      { name: "Vital Force",           type: "Passivo",  rarity: "1Ôÿà", effect: "+10% HP Regen",                       cooldown: "N/A",    desc: "For├ºa vital." },
      { name: "Focus",                 type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Crit Rate",                       cooldown: "N/A",    desc: "Concentra├º├úo." },
      { name: "Boost HP",              type: "Passivo",  rarity: "1Ôÿà", effect: "+15% Max HP",                         cooldown: "N/A",    desc: "HP refor├ºado." }
    ]
  },

  // ÔöÇÔöÇÔöÇ DREADNOUGHT (3┬¬ classe) ÔöÇÔöÇÔöÇ
  dreadnought: {
    name: 'Dreadnought', parent: 'warlord', stage: 3,
    desc: 'Encoura├ºado vivo, AoE massivo com polearm. Skills anteriores permanecem.',
    base: { atk: 95, def: 62, hp: 650, mp: 85, eva: 6, crit: 14, mdef: 32 },
    skills: [
      { name: "Rush Impact",               type: "Ativo",    rarity: "3Ôÿà", effect: "Rush + 350% dano + stun 3s",              cooldown: "25s",    desc: "Investida devastadora." },
      { name: "Dread Pool",                type: "Ativo",    rarity: "3Ôÿà", effect: "AoE cont├¡nuo 200%/s por 5s (8 alvos)",    cooldown: "35s",    desc: "├ürea de terror." },
      { name: "Spike",                     type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 380% + penetra DEF 40%",             cooldown: "28s",    desc: "Estocada penetrante." },
      { name: "Anti-Magic Armor",          type: "Ativo",    rarity: "3Ôÿà", effect: "+50% M.DEF por 20s",                      cooldown: "60s",    desc: "Armadura anti-m├ígica." },
      { name: "Weapon Blockade",           type: "Ativo",    rarity: "3Ôÿà", effect: "Desarma inimigo por 5s",                  cooldown: "45s",    desc: "Bloqueio de arma." },
      { name: "Lionheart",                 type: "Ativo",    rarity: "3Ôÿà", effect: "Imune a medo/stun 15s",                   cooldown: "120s",   desc: "Cora├º├úo de le├úo." },
      { name: "War Frenzy",                type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% ATK Speed por 45s",                  cooldown: "90s",    desc: "Frenesi total." },
      { name: "Transcendent Whirlwind",    type: "Ativo",    rarity: "4Ôÿà", effect: "Dano AoE 600% + knockdown (12 alvos)",    cooldown: "160s",   desc: "Redemoinho transcendente." },
      { name: "Dreadnought's Harmony",     type: "Self-Buff",rarity: "4Ôÿà", effect: "+50% ATK, +35% HP, +20% DEF 30min",      cooldown: "90 min", desc: "Harmonia do encoura├ºado." },
      { name: "Master of Combat",          type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% AoE dmg, +5% PvE",        cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Dreadnought Spirit",        type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Polearm ATK",                        cooldown: "N/A",    desc: "Esp├¡rito do encoura├ºado." },
      { name: "Body of the Dreadnought",   type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max HP, +10% DEF",                  cooldown: "N/A",    desc: "Corpo indestrut├¡vel." }
    ]
  },

  // ÔöÇÔöÇÔöÇ KNIGHT (1┬¬ classe) ÔöÇÔöÇÔöÇ
  knight: {
    name: 'Knight', parent: 'fighter', race: 'human', archetype: 'tank', stage: 1,
    desc: 'Cavaleiro tanque com escudo. Skills anteriores permanecem.',
    base: { atk: 18, def: 32, hp: 250, mp: 50, eva: 4, crit: 4, mdef: 18 },
    skills: [
      { name: "Shield Strike",         type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 170% + taunt 5s",             cooldown: "10s",    desc: "Golpe de escudo." },
      { name: "Hate",                  type: "Ativo",    rarity: "1Ôÿà", effect: "Taunt alvo + aggro m├íximo",        cooldown: "8s",     desc: "Gera ├│dio no alvo." },
      { name: "Aura of Hate",          type: "Ativo",    rarity: "2Ôÿà", effect: "AoE taunt (5 alvos) 8s",           cooldown: "18s",    desc: "Aura de ├│dio." },
      { name: "Power Break",           type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 150% + -20% ATK inimigo 8s",  cooldown: "14s",    desc: "Quebra de poder." },
      { name: "Divine Heal",           type: "Ativo",    rarity: "2Ôÿà", effect: "Cura 20% HP pr├│prio",              cooldown: "25s",    desc: "Cura divina." },
      { name: "Knight's Harmony",      type: "Self-Buff",rarity: "2Ôÿà", effect: "+25% DEF e +20% HP por 20 min",    cooldown: "45 min", desc: "Harmonia do cavaleiro." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada",     cooldown: "N/A",    desc: "Maestria em armaduras pesadas." },
      { name: "Shield Mastery",        type: "Passivo",  rarity: "1Ôÿà", effect: "+15% Block Rate",                  cooldown: "N/A",    desc: "Maestria em escudos." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+10% ATK espada/blunt",            cooldown: "N/A",    desc: "Maestria em espadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1Ôÿà", effect: "+12% Max HP",                      cooldown: "N/A",    desc: "Constitui├º├úo refor├ºada." },
      { name: "Deflect Arrow",         type: "Passivo",  rarity: "1Ôÿà", effect: "+10% chance desviar proj├®teis",    cooldown: "N/A",    desc: "Desvio de proj├®teis." }
    ]
  },

  // ÔöÇÔöÇÔöÇ PALADIN (2┬¬ classe) ÔöÇÔöÇÔöÇ
  paladin: {
    name: 'Paladin', parent: 'knight', stage: 2,
    desc: 'Cavaleiro sagrado, tank com cura e prote├º├úo. Skills anteriores permanecem.',
    base: { atk: 38, def: 65, hp: 520, mp: 100, eva: 5, crit: 6, mdef: 42 },
    skills: [
      { name: "Shield Stun",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 210% + stun 3s",             cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Holy Blade",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano sagrado 260%",               cooldown: "16s",    desc: "L├ómina sagrada." },
      { name: "Holy Strike",           type: "Ativo",    rarity: "3Ôÿà", effect: "Dano sagrado 320% + undead 2x",   cooldown: "20s",    desc: "Golpe sagrado devastador." },
      { name: "Majesty",               type: "Ativo",    rarity: "3Ôÿà", effect: "N├úo pode morrer por 7s (HP min 1)",cooldown: "180s",  desc: "Majestade divina." },
      { name: "Angelic Icon",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% DEF, +30% M.DEF por 30s",    cooldown: "120s",   desc: "├ìcone angelical." },
      { name: "Sacrifice",             type: "Ativo",    rarity: "2Ôÿà", effect: "Cura aliado 30% HP (gasta 10% pr├│prio)",cooldown: "25s",desc: "Sacrif├¡cio pelo aliado." },
      { name: "Aegis",                 type: "Ativo",    rarity: "2Ôÿà", effect: "+60% Block Rate por 15s",         cooldown: "45s",    desc: "Aegis defensivo." },
      { name: "Vengeance",             type: "Ativo",    rarity: "3Ôÿà", effect: "Reflete 30% dano recebido por 15s",cooldown: "60s",   desc: "Vingan├ºa sagrada." },
      { name: "Ultimate Defense",      type: "Ativo",    rarity: "3Ôÿà", effect: "+80% DEF, -50% ATK por 15s",      cooldown: "120s",   desc: "Defesa absoluta." },
      { name: "Holy Blessing",         type: "Ativo",    rarity: "2Ôÿà", effect: "Remove 2 debuffs",                cooldown: "30s",    desc: "B├¬n├º├úo purificadora." },
      { name: "Summon Storm Cubic",    type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca cubic de dano lightning",   cooldown: "60s",    desc: "Cubic de tempestade." },
      { name: "Provoke",               type: "Ativo",    rarity: "1Ôÿà", effect: "Taunt + aggro forte",             cooldown: "8s",     desc: "Provoca├º├úo." },
      { name: "Paladin's Harmony",     type: "Self-Buff",rarity: "3Ôÿà", effect: "+40% DEF, +30% HP, +20% M.DEF 25min",cooldown: "60 min",desc: "Harmonia do paladino." },
      { name: "Resist Holy/Dark",      type: "Passivo",  rarity: "2Ôÿà", effect: "+15% resist holy/dark",           cooldown: "N/A",    desc: "Resist├¬ncia sagrada." },
      { name: "Boost HP",              type: "Passivo",  rarity: "2Ôÿà", effect: "+18% Max HP",                     cooldown: "N/A",    desc: "HP expandido." }
    ]
  },

  // ÔöÇÔöÇÔöÇ PHOENIX KNIGHT (3┬¬ classe) ÔöÇÔöÇÔöÇ
  phoenixKnight: {
    name: 'Phoenix Knight', parent: 'paladin', stage: 3,
    desc: 'Cavaleiro da F├¬nix, tank supremo com ressurrei├º├úo. Skills anteriores permanecem.',
    base: { atk: 72, def: 105, hp: 850, mp: 140, eva: 6, crit: 8, mdef: 68 },
    skills: [
      { name: "Touch of Life",                type: "Ativo",    rarity: "3Ôÿà", effect: "Cura AoE 25% HP (party)",               cooldown: "35s",    desc: "Toque vital da f├¬nix." },
      { name: "Phoenix Aura",                 type: "Self-Buff",rarity: "3Ôÿà", effect: "+45% DEF, +HP Regen 3%/s por 25min",    cooldown: "60 min", desc: "Aura da f├¬nix." },
      { name: "Shield of Faith",              type: "Ativo",    rarity: "3Ôÿà", effect: "Absorve 5000 dano por 15s",             cooldown: "90s",    desc: "Escudo de f├®." },
      { name: "Flame Icon",                   type: "Ativo",    rarity: "3Ôÿà", effect: "+35% ATK para party por 30s",           cooldown: "120s",   desc: "├ìcone de chamas." },
      { name: "Celestial Shield",             type: "Ativo",    rarity: "4Ôÿà", effect: "Party imune a dano por 5s",             cooldown: "300s",   desc: "Escudo celestial absoluto." },
      { name: "Summon Imperial Phoenix",      type: "Ativo",    rarity: "4Ôÿà", effect: "Invoca f├¬nix (dano+cura cont├¡nua 30s)", cooldown: "180s",   desc: "F├¬nix Imperial." },
      { name: "Transcendent Shield Charge",   type: "Ativo",    rarity: "4Ôÿà", effect: "Rush + 500% dano + AoE taunt 10s",     cooldown: "160s",   desc: "Investida transcendente." },
      { name: "Phoenix Knight's Harmony",     type: "Self-Buff",rarity: "4Ôÿà", effect: "+60% DEF, +40% HP, +30% M.DEF 30min",  cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Spirit of Phoenix",            type: "Passivo",  rarity: "4Ôÿà", effect: "Ao morrer: revive com 30% HP (1x/30min)",cooldown: "N/A",   desc: "Esp├¡rito da f├¬nix ÔÇö auto-ressurrei├º├úo." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +15% aggro, +5% PvE",        cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Protection of Faith",          type: "Passivo",  rarity: "3Ôÿà", effect: "+12% resist all",                      cooldown: "N/A",    desc: "Prote├º├úo da f├®." },
      { name: "Body of the Phoenix",          type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Max HP, +10% DEF",                cooldown: "N/A",    desc: "Corpo da f├¬nix." }
    ]
  },

  // ÔöÇÔöÇÔöÇ DARK AVENGER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  darkAvenger: {
    name: 'Dark Avenger', parent: 'knight', stage: 2,
    desc: 'Cavaleiro sombrio com pantera e drain. Skills anteriores permanecem.',
    base: { atk: 45, def: 55, hp: 480, mp: 90, eva: 5, crit: 8, mdef: 35 },
    skills: [
      { name: "Summon Dark Panther",    type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca pantera (ATK 60% do dono)",    cooldown: "90s",    desc: "Pantera das trevas." },
      { name: "Drain Health",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + drena 30% como HP",      cooldown: "15s",    desc: "Drena vida do inimigo." },
      { name: "Horror",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Medo no alvo por 5s",                cooldown: "30s",    desc: "Terror sombrio." },
      { name: "Shield Stun",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 200% + stun 3s",               cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Judgment",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano dark 300% + -20% DEF 10s",     cooldown: "22s",    desc: "Julgamento sombrio." },
      { name: "Touch of Death",         type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 280% + poison 10s",            cooldown: "20s",    desc: "Toque mortal." },
      { name: "Dark Flame",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano AoE dark 240%",                cooldown: "18s",    desc: "Chamas sombrias." },
      { name: "Doom Shield",            type: "Ativo",    rarity: "3Ôÿà", effect: "Absorve 3000 dano + reflete 15%",   cooldown: "60s",    desc: "Escudo da perdi├º├úo." },
      { name: "Seed of Revenge",        type: "Ativo",    rarity: "2Ôÿà", effect: "Marca: ao morrer causa 500% dano",  cooldown: "120s",   desc: "Semente da vingan├ºa." },
      { name: "Dark Avenger's Harmony", type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% ATK, +30% DEF, +20% drain 25min",cooldown: "60 min",desc: "Harmonia sombria." },
      { name: "Reflect Damage",         type: "Passivo",  rarity: "2Ôÿà", effect: "Reflete 8% dano recebido",          cooldown: "N/A",    desc: "Reflexo de dano." },
      { name: "Boost HP",               type: "Passivo",  rarity: "2Ôÿà", effect: "+16% Max HP",                       cooldown: "N/A",    desc: "HP refor├ºado." }
    ]
  },

  // ÔöÇÔöÇÔöÇ HELL KNIGHT (3┬¬ classe) ÔöÇÔöÇÔöÇ
  hellKnight: {
    name: 'Hell Knight', parent: 'darkAvenger', stage: 3,
    desc: 'Cavaleiro infernal com aura de trevas. Skills anteriores permanecem.',
    base: { atk: 82, def: 88, hp: 780, mp: 130, eva: 6, crit: 12, mdef: 55 },
    skills: [
      { name: "Insane Crusher",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + stun 4s",                    cooldown: "28s",    desc: "Esmagamento insano." },
      { name: "Panther Cancel",               type: "Ativo",    rarity: "3Ôÿà", effect: "Pantera explode: AoE 350% + fear 3s",    cooldown: "60s",    desc: "Explos├úo da pantera." },
      { name: "Anthem of Hell",               type: "Self-Buff",rarity: "3Ôÿà", effect: "+40% ATK, +20% drain HP por 30s",        cooldown: "90s",    desc: "Hino infernal." },
      { name: "Gehenna",                      type: "Ativo",    rarity: "4Ôÿà", effect: "AoE dark 500% + -30% heal recebida 10s", cooldown: "120s",   desc: "Port├úo do inferno." },
      { name: "Touch of Darkness",            type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 380% + silence 5s",                 cooldown: "30s",    desc: "Toque das trevas." },
      { name: "Summon Dark Panther Enhanced",  type: "Ativo",    rarity: "4Ôÿà", effect: "Pantera aprimorada (ATK 80% do dono)",   cooldown: "120s",   desc: "Pantera das trevas aprimorada." },
      { name: "Transcendent Dark Strike",     type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 580% dark + drain 40% como HP",     cooldown: "150s",   desc: "Golpe sombrio transcendente." },
      { name: "Hell Knight's Harmony",        type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% ATK, +40% DEF, +30% drain 30min",   cooldown: "90 min", desc: "Harmonia infernal." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% drain, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Hell Knight Spirit",           type: "Passivo",  rarity: "3Ôÿà", effect: "+15% dark ATK",                          cooldown: "N/A",    desc: "Esp├¡rito do cavaleiro infernal." },
      { name: "Body of the Hell Knight",      type: "Passivo",  rarity: "3Ôÿà", effect: "+12% Max HP, +10% DEF",                 cooldown: "N/A",    desc: "Corpo infernal." },
      { name: "Protection of Darkness",       type: "Passivo",  rarity: "3Ôÿà", effect: "+15% dark resist",                       cooldown: "N/A",    desc: "Prote├º├úo das trevas." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ROGUE (1┬¬ classe) ÔöÇÔöÇÔöÇ
  rogue: {
    name: 'Rogue', parent: 'fighter', race: 'human', archetype: 'assassin', stage: 1,
    desc: 'Ladino ├ígil, especialista em dagger e bow. Skills anteriores permanecem.',
    base: { atk: 22, def: 12, hp: 150, mp: 40, eva: 15, crit: 12, mdef: 8 },
    skills: [
      { name: "Double Shot",          type: "Ativo",    rarity: "1Ôÿà", effect: "2 disparos, dano total 200%",      cooldown: "10s",    desc: "Duplo disparo." },
      { name: "Backstab",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 250% por tr├ís + crit garantido",cooldown: "14s",  desc: "Punhalada nas costas." },
      { name: "Dash",                 type: "Ativo",    rarity: "1Ôÿà", effect: "+50% Speed por 8s",                cooldown: "20s",    desc: "Corrida r├ípida." },
      { name: "Unlock",               type: "Ativo",    rarity: "1Ôÿà", effect: "Abre ba├║s/portas",                 cooldown: "5s",     desc: "Destravar." },
      { name: "Rogue's Harmony",      type: "Self-Buff",rarity: "2Ôÿà", effect: "+20% EVA, +15% Crit por 20 min",   cooldown: "45 min", desc: "Harmonia do ladino." },
      { name: "Light Armor Mastery",  type: "Passivo",  rarity: "1Ôÿà", effect: "+12% EVA com armadura leve",       cooldown: "N/A",    desc: "Maestria leve." },
      { name: "Dagger Mastery",       type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com dagger",              cooldown: "N/A",    desc: "Maestria em adagas." },
      { name: "Bow Mastery",          type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com arco",                cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Critical Chance",      type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Crit Rate",                    cooldown: "N/A",    desc: "Senso para pontos vitais." }
    ]
  },

  // ÔöÇÔöÇÔöÇ TREASURE HUNTER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  treasureHunter: {
    name: 'Treasure Hunter', parent: 'rogue', stage: 2,
    desc: 'Ca├ºador de tesouros, mestre em adagas. Skills anteriores permanecem.',
    base: { atk: 55, def: 20, hp: 300, mp: 60, eva: 28, crit: 24, mdef: 14 },
    skills: [
      { name: "Deadly Blow",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 280% + crit garantido",          cooldown: "14s",    desc: "Golpe mortal." },
      { name: "Lethal Blow",           type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 350% + chance kill 5%",          cooldown: "22s",    desc: "Golpe letal." },
      { name: "Sand Bomb",             type: "Ativo",    rarity: "2Ôÿà", effect: "AoE blind 5s + dano 150%",            cooldown: "20s",    desc: "Bomba de areia." },
      { name: "Blinding Blow",         type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + blind 4s",                cooldown: "18s",    desc: "Golpe cegante." },
      { name: "Shadow Step",           type: "Ativo",    rarity: "2Ôÿà", effect: "Teleporta atr├ís do alvo",             cooldown: "15s",    desc: "Passo sombrio." },
      { name: "Switch",                type: "Ativo",    rarity: "2Ôÿà", effect: "Troca posi├º├úo com alvo",              cooldown: "25s",    desc: "Troca de posi├º├úo." },
      { name: "Fake Death",            type: "Ativo",    rarity: "2Ôÿà", effect: "Finge morte, perde aggro",            cooldown: "60s",    desc: "Morte falsa." },
      { name: "Trick",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Remove alvo do inimigo",              cooldown: "20s",    desc: "Truque evasivo." },
      { name: "Mirage",                type: "Ativo",    rarity: "3Ôÿà", effect: "+80% EVA por 8s",                     cooldown: "45s",    desc: "Ilus├úo de espelhos." },
      { name: "Detect/Remove Trap",    type: "Ativo",    rarity: "1Ôÿà", effect: "Detecta e remove armadilhas",         cooldown: "10s",    desc: "Detectar armadilhas." },
      { name: "TH's Harmony",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% Crit, +25% EVA, +20% ATK 25min", cooldown: "60 min", desc: "Harmonia do ca├ºador." },
      { name: "Evasion",               type: "Passivo",  rarity: "2Ôÿà", effect: "+12% EVA",                            cooldown: "N/A",    desc: "Evas├úo aprimorada." },
      { name: "Critical Power",        type: "Passivo",  rarity: "2Ôÿà", effect: "+18% Crit Damage",                    cooldown: "N/A",    desc: "Poder cr├¡tico." },
      { name: "Focus",                 type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Crit Rate",                      cooldown: "N/A",    desc: "Foco em pontos vitais." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ADVENTURER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  adventurer: {
    name: 'Adventurer', parent: 'treasureHunter', stage: 3,
    desc: 'Aventureiro supremo, mestre da evas├úo e dano furtivo. Skills anteriores permanecem.',
    base: { atk: 98, def: 32, hp: 500, mp: 85, eva: 52, crit: 42, mdef: 22 },
    skills: [
      { name: "Exciting Adventure",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+45% EVA, +30% Crit, +20% ATK 20min",  cooldown: "55 min", desc: "Aventura emocionante." },
      { name: "Wind Riding",                 type: "Ativo",    rarity: "3Ôÿà", effect: "+80% Speed + invis├¡vel por 10s",        cooldown: "60s",    desc: "Cavalgando o vento." },
      { name: "Lucky Strike",                type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + chance loot 2x",            cooldown: "30s",    desc: "Golpe de sorte." },
      { name: "Detection",                   type: "Ativo",    rarity: "2Ôÿà", effect: "Revela invis├¡veis em ├írea",             cooldown: "20s",    desc: "Detec├º├úo de ocultos." },
      { name: "Transcendent Deadly Blow",    type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 650% + ignora EVA + bleed 12s",    cooldown: "150s",   desc: "Golpe mortal transcendente." },
      { name: "Adventurer's Harmony",        type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% Crit, +45% EVA, +35% ATK 30min",  cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Master of Combat",            type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% Crit, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Shadow Sense",                type: "Passivo",  rarity: "3Ôÿà", effect: "+15% EVA ├á noite / dungeon",            cooldown: "N/A",    desc: "Sentido das sombras." },
      { name: "Adventurer Spirit",           type: "Passivo",  rarity: "3Ôÿà", effect: "+12% dagger ATK",                       cooldown: "N/A",    desc: "Esp├¡rito aventureiro." },
      { name: "Body of the Adventurer",      type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max HP, +8% EVA",                 cooldown: "N/A",    desc: "Corpo ├ígil." },
      { name: "Final Frenzy",                type: "Passivo",  rarity: "3Ôÿà", effect: "+25% ATK quando HP < 30%",              cooldown: "N/A",    desc: "Frenesi final." }
    ]
  },

  // ÔöÇÔöÇÔöÇ HAWKEYE (2┬¬ classe) ÔöÇÔöÇÔöÇ
  hawkeye: {
    name: 'Hawkeye', parent: 'rogue', stage: 2,
    desc: 'Arqueiro de elite com dano ├á dist├óncia. Skills anteriores permanecem.',
    base: { atk: 60, def: 18, hp: 280, mp: 65, eva: 20, crit: 22, mdef: 12 },
    skills: [
      { name: "Double Shot",           type: "Ativo",    rarity: "2Ôÿà", effect: "2 disparos, dano total 260%",         cooldown: "10s",    desc: "Duplo disparo aprimorado." },
      { name: "Burst Shot",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 280% + knockback",               cooldown: "14s",    desc: "Disparo explosivo." },
      { name: "Stun Shot",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + stun 3s",                cooldown: "18s",    desc: "Disparo atordoante." },
      { name: "Arrow Rain",            type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 320% (8 alvos)",            cooldown: "22s",    desc: "Chuva de flechas." },
      { name: "Rapid Fire",            type: "Ativo",    rarity: "2Ôÿà", effect: "+50% ATK Speed arco por 15s",        cooldown: "45s",    desc: "Disparo r├ípido." },
      { name: "Cheap Shot",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 200% + slow 30% por 8s",        cooldown: "16s",    desc: "Disparo sujo." },
      { name: "Hawkeye's Harmony",     type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +15% Range 25min",cooldown: "60 min",desc: "Harmonia do olho de falc├úo." },
      { name: "Bow Mastery",           type: "Passivo",  rarity: "2Ôÿà", effect: "+18% ATK com arco",                  cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Long Shot",             type: "Passivo",  rarity: "2Ôÿà", effect: "+30% Range",                          cooldown: "N/A",    desc: "Tiro de longo alcance." },
      { name: "Focus",                 type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Crit Rate",                      cooldown: "N/A",    desc: "Concentra├º├úo." },
      { name: "Critical Power",        type: "Passivo",  rarity: "2Ôÿà", effect: "+18% Crit Damage",                    cooldown: "N/A",    desc: "Poder cr├¡tico." },
      { name: "Evasion",               type: "Passivo",  rarity: "1Ôÿà", effect: "+10% EVA",                            cooldown: "N/A",    desc: "Evas├úo." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SAGITTARIUS (3┬¬ classe) ÔöÇÔöÇÔöÇ
  sagittarius: {
    name: 'Sagittarius', parent: 'hawkeye', stage: 3,
    desc: 'Atirador lend├írio, mestre do arco. Skills anteriores permanecem.',
    base: { atk: 112, def: 25, hp: 460, mp: 95, eva: 35, crit: 45, mdef: 18 },
    skills: [
      { name: "Seven Arrow",                  type: "Ativo",    rarity: "3Ôÿà", effect: "7 flechas, dano total 480%",              cooldown: "25s",    desc: "Sete flechas consecutivas." },
      { name: "Arrow Flare",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano AoE 380% + burn 8s",                cooldown: "22s",    desc: "Explos├úo de flechas." },
      { name: "Dead Eye",                     type: "Self-Buff",rarity: "3Ôÿà", effect: "+50% ATK, +40% Range por 20min",         cooldown: "55 min", desc: "Olho mortal ÔÇö mira perfeita." },
      { name: "Pinpoint Shot",                type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 400% + ignora 50% DEF",             cooldown: "28s",    desc: "Tiro preciso." },
      { name: "Triple Shot",                  type: "Ativo",    rarity: "3Ôÿà", effect: "3 disparos, dano total 360%",             cooldown: "14s",    desc: "Tiro triplo." },
      { name: "Thorn Shot",                   type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 260% + bleed 10s",                  cooldown: "12s",    desc: "Flecha de espinhos." },
      { name: "Binding Shot",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + root 4s",                    cooldown: "18s",    desc: "Flecha aprisionadora." },
      { name: "Incendiary Shot",              type: "Ativo",    rarity: "2Ôÿà", effect: "Dano fogo 280% + burn 8s",               cooldown: "16s",    desc: "Flecha incendi├íria." },
      { name: "Freezing Shot",                type: "Ativo",    rarity: "2Ôÿà", effect: "Dano gelo 260% + slow 40% 6s",           cooldown: "16s",    desc: "Flecha congelante." },
      { name: "Wind Shot",                    type: "Ativo",    rarity: "2Ôÿà", effect: "Dano vento 270% + knockback",            cooldown: "16s",    desc: "Flecha do vento." },
      { name: "Flame Arrow Rain",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE fogo 380% (10 alvos) + burn",        cooldown: "28s",    desc: "Chuva de flechas flamejantes." },
      { name: "Water Arrow Rain",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE gelo 360% (10 alvos) + slow",        cooldown: "28s",    desc: "Chuva de flechas g├®lidas." },
      { name: "Storm Arrow Rain",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE vento 370% (10 alvos) + stun 2s",    cooldown: "28s",    desc: "Chuva de flechas tempestuosas." },
      { name: "Spiral Shot",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + penetra m├║ltiplos alvos",    cooldown: "24s",    desc: "Tiro espiral perfurante." },
      { name: "Target Lock",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Marca alvo: +40% dano contra ele 12s",   cooldown: "30s",    desc: "Trava de mira." },
      { name: "Transcendent Seven Arrow",     type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 700% + elemental + ignora DEF",     cooldown: "180s",   desc: "Sete flechas transcendentes." },
      { name: "Sagittarius' Harmony",         type: "Self-Buff",rarity: "4Ôÿà", effect: "+60% ATK, +50% Crit, +40% Range 30min",  cooldown: "90 min", desc: "Harmonia do sagit├írio." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% Range, +5% PvE",         cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Sagittarius Spirit",            type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Bow ATK",                           cooldown: "N/A",    desc: "Esp├¡rito do sagit├írio." },
      { name: "Body of the Sagittarius",       type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max HP, +8% EVA",                  cooldown: "N/A",    desc: "Corpo do sagit├írio." }
    ]
  },

  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  HUMAN MAGE (skills DISTINTAS por subclasse)
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô

  mage: {
    name: 'Human Mage', archetype: 'mage', race: 'human', stage: 0,
    desc: 'Classe base m├ígica humana.',
    base: { atk: 5, def: 6, hp: 70, mp: 80, eva: 4, crit: 3, matk: 15, mdef: 12 },
    skills: [
      { name: "Wind Strike",       type: "Ativo",    rarity: "1Ôÿà", effect: "Dano vento 160%",              cooldown: "8s",     desc: "Rajada de vento." },
      { name: "Flame Strike",      type: "Ativo",    rarity: "1Ôÿà", effect: "Dano fogo 170%",               cooldown: "9s",     desc: "Chama ardente." },
      { name: "Ice Bolt",          type: "Ativo",    rarity: "1Ôÿà", effect: "Dano gelo 155% + slow 15% 4s", cooldown: "8s",     desc: "Proj├®til de gelo." },
      { name: "Self Heal",         type: "Ativo",    rarity: "1Ôÿà", effect: "Cura 20% HP",                  cooldown: "25s",    desc: "Autocura b├ísica." },
      { name: "Sleep",             type: "Ativo",    rarity: "1Ôÿà", effect: "Adormece alvo 8s (cancela dano)",cooldown: "30s",   desc: "Sono m├ígico." },
      { name: "Mage's Will",       type: "Self-Buff",rarity: "1Ôÿà", effect: "+10% M.ATK, +10% M.DEF 15min", cooldown: "30 min", desc: "Vontade do mago." },
      { name: "Robe Mastery",      type: "Passivo",  rarity: "1Ôÿà", effect: "+10% M.DEF, +8% Cast Speed com robe",cooldown: "N/A",desc: "Maestria em vestes." },
      { name: "MP Increase",       type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Max MP",                   cooldown: "N/A",    desc: "Reserva m├ígica." }
    ]
  },

  // ÔöÇÔöÇÔöÇ WIZARD (1┬¬ classe) ÔöÇÔöÇÔöÇ
  wizard: {
    name: 'Wizard', parent: 'mage', race: 'human', archetype: 'mage', stage: 1,
    desc: 'Mago elemental vers├ítil. Skills anteriores permanecem.',
    base: { atk: 6, def: 8, hp: 100, mp: 140, eva: 4, crit: 4, matk: 35, mdef: 22 },
    skills: [
      { name: "Blaze",                 type: "Ativo",    rarity: "1Ôÿà", effect: "Dano fogo 210%",                    cooldown: "10s",    desc: "Chamas ardentes." },
      { name: "Aqua Swirl",            type: "Ativo",    rarity: "1Ôÿà", effect: "Dano ├ígua 200% + slow 20% 5s",      cooldown: "10s",    desc: "Turbilh├úo aqu├ítico." },
      { name: "Twister",               type: "Ativo",    rarity: "1Ôÿà", effect: "Dano vento 195%",                   cooldown: "10s",    desc: "Tornado menor." },
      { name: "Aura Burn",             type: "Ativo",    rarity: "2Ôÿà", effect: "AoE fogo 180% ao redor",            cooldown: "14s",    desc: "Queimadura ├íurica." },
      { name: "Life Drain",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano dark 190% + drena 25% como HP",cooldown: "15s",    desc: "Dreno vital." },
      { name: "Surrender to Fire",     type: "Ativo",    rarity: "2Ôÿà", effect: "-20% Fire Resist no alvo 15s",      cooldown: "25s",    desc: "Vulnerabilidade ao fogo." },
      { name: "Surrender to Water",    type: "Ativo",    rarity: "2Ôÿà", effect: "-20% Water Resist no alvo 15s",     cooldown: "25s",    desc: "Vulnerabilidade ├á ├ígua." },
      { name: "Surrender to Wind",     type: "Ativo",    rarity: "2Ôÿà", effect: "-20% Wind Resist no alvo 15s",      cooldown: "25s",    desc: "Vulnerabilidade ao vento." },
      { name: "Wizard's Harmony",      type: "Self-Buff",rarity: "2Ôÿà", effect: "+25% M.ATK, +15% Cast Speed 20min", cooldown: "45 min", desc: "Harmonia do mago." },
      { name: "Boost Mana",            type: "Passivo",  rarity: "1Ôÿà", effect: "+12% Max MP",                       cooldown: "N/A",    desc: "Reserva m├ígica aprimorada." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SORCERER (2┬¬ classe ÔÇö FOGO+GELO+VENTO) ÔöÇÔöÇÔöÇ
  sorcerer: {
    name: 'Sorcerer', parent: 'wizard', stage: 2,
    desc: 'Mestre da magia elemental ofensiva. Skills anteriores permanecem.',
    base: { atk: 8, def: 14, hp: 180, mp: 260, eva: 5, crit: 6, matk: 75, mdef: 45 },
    skills: [
      { name: "Prominence",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano fogo 300%",                      cooldown: "16s",    desc: "Coluna de fogo." },
      { name: "Blizzard",              type: "Ativo",    rarity: "3Ôÿà", effect: "Dano gelo AoE 340% + slow 30% 6s",    cooldown: "22s",    desc: "Nevasca arrasadora." },
      { name: "Hurricane",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano vento 290%",                     cooldown: "16s",    desc: "Furac├úo devastador." },
      { name: "Hydro Blast",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano ├ígua 280% + knockback",          cooldown: "15s",    desc: "Explos├úo h├¡drica." },
      { name: "Solar Flare",           type: "Ativo",    rarity: "3Ôÿà", effect: "Dano fogo 360% + blind 4s",           cooldown: "25s",    desc: "Explos├úo solar." },
      { name: "Tempest",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano vento AoE 350% (8 alvos)",       cooldown: "25s",    desc: "Tempestade elemental." },
      { name: "Aura Flash",            type: "Ativo",    rarity: "2Ôÿà", effect: "AoE 240% + knockback ao redor",       cooldown: "18s",    desc: "Flash ├íurico." },
      { name: "Arcane Power",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+40% M.ATK por 30s",                  cooldown: "90s",    desc: "Poder arcano concentrado." },
      { name: "Freezing Skin",         type: "Self-Buff",rarity: "2Ôÿà", effect: "Quem ataca recebe slow 20% por 15s",  cooldown: "45s",    desc: "Pele congelante." },
      { name: "Cancel",                type: "Ativo",    rarity: "3Ôÿà", effect: "Remove 3 buffs do alvo",              cooldown: "40s",    desc: "Cancelamento m├ígico." },
      { name: "Body to Mind",          type: "Ativo",    rarity: "2Ôÿà", effect: "Converte 15% HP em 30% MP",           cooldown: "30s",    desc: "Corpo em mente." },
      { name: "Anti-Magic",            type: "Ativo",    rarity: "3Ôÿà", effect: "Silence no alvo por 8s",              cooldown: "45s",    desc: "Anti-magia." },
      { name: "Sorcerer's Harmony",    type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% M.ATK, +20% Cast Speed 25min",   cooldown: "60 min", desc: "Harmonia do feiticeiro." },
      { name: "Elemental Assault",     type: "Passivo",  rarity: "2Ôÿà", effect: "+12% elemental damage",               cooldown: "N/A",    desc: "Assalto elemental." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ARCHMAGE (3┬¬ classe ÔÇö FOCO EM FOGO) ÔöÇÔöÇÔöÇ
  archmage: {
    name: 'Archmage', parent: 'sorcerer', stage: 3,
    desc: 'Arquimago do fogo, dano massivo. Skills anteriores permanecem. Foco: FOGO.',
    base: { atk: 10, def: 20, hp: 300, mp: 450, eva: 6, crit: 8, matk: 135, mdef: 72 },
    skills: [
      { name: "Meteor",                       type: "Ativo",    rarity: "4Ôÿà", effect: "Dano fogo AoE 750% + burn 12s + knockdown",  cooldown: "180s",   desc: "METEORO ÔÇö devasta├º├úo absoluta." },
      { name: "Hell Inferno",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano fogo 450% + burn 10s",                 cooldown: "30s",    desc: "Inferno ardente." },
      { name: "Flame Explosion",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano fogo 420% + 2 hits",                  cooldown: "25s",    desc: "Explos├úo flamejante (2 hits)." },
      { name: "Fire Spiral",                   type: "Ativo",    rarity: "3Ôÿà", effect: "Dano fogo 380% + penetra alvos",           cooldown: "22s",    desc: "Espiral de fogo perfurante." },
      { name: "Blazing Circle",                type: "Ativo",    rarity: "3Ôÿà", effect: "AoE fogo 400% ao redor (10 alvos)",        cooldown: "28s",    desc: "C├¡rculo flamejante." },
      { name: "Seed of Fire",                  type: "Ativo",    rarity: "2Ôÿà", effect: "Planta semente: explode 300% ap├│s 5s",     cooldown: "20s",    desc: "Semente de fogo." },
      { name: "Elemental Burst",               type: "Ativo",    rarity: "3Ôÿà", effect: "Explode Seeds: dano 500%",                 cooldown: "18s",    desc: "Explos├úo elemental (combo com Seeds)." },
      { name: "Elemental Storm",               type: "Ativo",    rarity: "3Ôÿà", effect: "AoE multi-element 440% (8 alvos)",         cooldown: "30s",    desc: "Tempestade elemental." },
      { name: "Mana Burn",                     type: "Ativo",    rarity: "2Ôÿà", effect: "Drena 30% MP do alvo + dano = MP drenado", cooldown: "25s",    desc: "Queima de mana." },
      { name: "Mystic Immunity",               type: "Ativo",    rarity: "4Ôÿà", effect: "Imune a magia por 8s, n├úo pode atacar",    cooldown: "180s",   desc: "Imunidade m├¡stica." },
      { name: "Empowering Echo",               type: "Ativo",    rarity: "3Ôÿà", effect: "Pr├│xima skill: +50% dano",                 cooldown: "45s",    desc: "Eco potencializador." },
      { name: "Transcendent Hell Inferno",     type: "Ativo",    rarity: "4Ôÿà", effect: "Dano fogo 800% + ignora M.DEF + burn 15s", cooldown: "200s",   desc: "Inferno transcendente." },
      { name: "Archmage's Harmony",            type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% M.ATK, +35% Cast Speed, +20% MP 30min",cooldown: "90 min",desc: "Harmonia do arquimago." },
      { name: "Master of Magic",               type: "Passivo",  rarity: "3Ôÿà", effect: "+10% M.ATK, +10% fire dmg, +5% PvE",      cooldown: "N/A",    desc: "Mestre da magia." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3Ôÿà", effect: "+12% M. Skill Power",                     cooldown: "N/A",    desc: "Maestria em feiti├ºos." },
      { name: "Magic Focus",                    type: "Passivo",  rarity: "3Ôÿà", effect: "+8% M. Crit Rate",                        cooldown: "N/A",    desc: "Foco m├ígico." },
      { name: "Archmage Spirit",                type: "Passivo",  rarity: "3Ôÿà", effect: "+15% fire magic ATK",                     cooldown: "N/A",    desc: "Esp├¡rito do arquimago." },
      { name: "Body of the Archmage",           type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max MP, +8% M.DEF",                 cooldown: "N/A",    desc: "Corpo arcano." }
    ]
  },

  // ÔöÇÔöÇÔöÇ NECROMANCER (2┬¬ classe ÔÇö DARK/UNHOLY ÔÇö skills DIFERENTES do Sorcerer) ÔöÇÔöÇÔöÇ
  necromancer: {
    name: 'Necromancer', parent: 'wizard', stage: 2,
    desc: 'Mago das trevas e mortos-vivos. Skills anteriores permanecem. Foco: DARK/UNDEAD.',
    base: { atk: 8, def: 16, hp: 200, mp: 240, eva: 4, crit: 5, matk: 68, mdef: 40 },
    skills: [
      { name: "Death Spike",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano dark 260% + drain 25% HP",       cooldown: "12s",    desc: "Estaca mortal." },
      { name: "Corpse Plague",          type: "Ativo",    rarity: "2Ôÿà", effect: "AoE dark 280% + poison 10s",          cooldown: "20s",    desc: "Praga cadav├®rica." },
      { name: "Vampiric Claw",         type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + drain 35% HP",            cooldown: "14s",    desc: "Garra vamp├¡rica." },
      { name: "Anchor",                type: "Ativo",    rarity: "2Ôÿà", effect: "Root no alvo 6s + dano 180%",         cooldown: "22s",    desc: "├éncora sombria." },
      { name: "Curse: Gloom",          type: "Ativo",    rarity: "2Ôÿà", effect: "-25% ATK e M.ATK do alvo 12s",        cooldown: "25s",    desc: "Maldi├º├úo da melancolia." },
      { name: "Corpse Burst",          type: "Ativo",    rarity: "3Ôÿà", effect: "Explode cad├íver: AoE 350% dark",      cooldown: "25s",    desc: "Explos├úo de cad├íver." },
      { name: "Summon Reanimated Man", type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca morto-vivo (ATK 50% do dono)", cooldown: "60s",    desc: "Reanimar morto." },
      { name: "Summon Cursed Bone",    type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca esqueleto (ATK 40% do dono)",  cooldown: "45s",    desc: "Esqueleto amaldi├ºoado." },
      { name: "Dark Flame",            type: "Ativo",    rarity: "2Ôÿà", effect: "AoE dark 250% ao redor",              cooldown: "18s",    desc: "Chamas sombrias." },
      { name: "Surrender to Unholy",   type: "Ativo",    rarity: "2Ôÿà", effect: "-25% Dark Resist no alvo 15s",        cooldown: "25s",    desc: "Vulnerabilidade ao dark." },
      { name: "Curse Fear",            type: "Ativo",    rarity: "3Ôÿà", effect: "Medo AoE 5s (3 alvos)",               cooldown: "40s",    desc: "Medo amaldi├ºoado." },
      { name: "Necro's Harmony",       type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% M.ATK, +20% drain, +15% HP 25min",cooldown: "60 min",desc: "Harmonia do necromante." },
      { name: "Bone Armor",            type: "Passivo",  rarity: "2Ôÿà", effect: "+15% DEF, +10% dark resist",          cooldown: "N/A",    desc: "Armadura de ossos." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SOULTAKER (3┬¬ classe ÔÇö DARK MEGA NUKE) ÔöÇÔöÇÔöÇ
  soultaker: {
    name: 'Soultaker', parent: 'necromancer', stage: 3,
    desc: 'Ceifador de almas, dano dark massivo. Skills anteriores permanecem. Foco: DARK.',
    base: { atk: 10, def: 22, hp: 320, mp: 420, eva: 5, crit: 7, matk: 125, mdef: 62 },
    skills: [
      { name: "Soul Vortex",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano dark 420% + soul drain",               cooldown: "25s",    desc: "V├│rtice de almas." },
      { name: "Soul Vortex Destruction",       type: "Ativo",    rarity: "4Ôÿà", effect: "Dano dark AoE 650% + drain 30% HP",        cooldown: "160s",   desc: "Destrui├º├úo do v├│rtice de almas." },
      { name: "Void Explosion",                type: "Ativo",    rarity: "4Ôÿà", effect: "Dano dark 700% + 2 hits + silence 5s",     cooldown: "180s",   desc: "Explos├úo do vazio." },
      { name: "Mass Curse: Gloom",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE -30% ATK/M.ATK (8 alvos) 12s",         cooldown: "35s",    desc: "Maldi├º├úo em massa." },
      { name: "Soul Absorption",               type: "Ativo",    rarity: "3Ôÿà", effect: "Drena 40% MP do alvo como MP pr├│prio",     cooldown: "30s",    desc: "Absor├º├úo de almas." },
      { name: "Summon Dark Curse",             type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca entidade dark (ATK 70% do dono)",    cooldown: "90s",    desc: "Maldi├º├úo sombria viva." },
      { name: "Dark Burden",                   type: "Ativo",    rarity: "3Ôÿà", effect: "-40% Speed no alvo 10s + dano 300%",       cooldown: "28s",    desc: "Fardo das trevas." },
      { name: "Transcendent Soul Vortex",      type: "Ativo",    rarity: "4Ôÿà", effect: "Dano dark 850% + drain todo MP + stun 4s", cooldown: "200s",   desc: "V├│rtice de almas transcendente." },
      { name: "Soultaker's Harmony",           type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% M.ATK, +40% drain, +25% HP 30min",    cooldown: "90 min", desc: "Harmonia do ceifador." },
      { name: "Master of Dark Magic",          type: "Passivo",  rarity: "3Ôÿà", effect: "+10% M.ATK, +10% dark dmg, +5% PvE",      cooldown: "N/A",    desc: "Mestre da magia negra." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3Ôÿà", effect: "+12% M. Skill Power",                     cooldown: "N/A",    desc: "Maestria em feiti├ºos." },
      { name: "Soultaker Spirit",              type: "Passivo",  rarity: "3Ôÿà", effect: "+15% dark magic ATK",                      cooldown: "N/A",    desc: "Esp├¡rito do ceifador." },
      { name: "Body of the Soultaker",         type: "Passivo",  rarity: "3Ôÿà", effect: "+12% Max MP, +10% HP",                    cooldown: "N/A",    desc: "Corpo do ceifador." }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARLOCK (2┬¬ classe ÔÇö SUMMONER ÔÇö skills DIFERENTES) ÔöÇÔöÇÔöÇ
  warlock: {
    name: 'Warlock', parent: 'wizard', stage: 2,
    desc: 'Invocador de criaturas das trevas. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 7, def: 15, hp: 190, mp: 250, eva: 4, crit: 4, matk: 62, mdef: 42 },
    skills: [
      { name: "Summon Shadow",          type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca sombra (ATK 45% do dono)",     cooldown: "60s",    desc: "Sombra combatente." },
      { name: "Summon Silhouette",      type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca silhueta (tank, DEF 60%)",     cooldown: "60s",    desc: "Silhueta defensiva." },
      { name: "Summon Soulless",        type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca sem-alma (ATK 65% do dono)",   cooldown: "90s",    desc: "Criatura sem alma ÔÇö forte." },
      { name: "Servitor Heal",          type: "Ativo",    rarity: "2Ôÿà", effect: "Cura summon 35% HP",                  cooldown: "12s",    desc: "Cura do servitor." },
      { name: "Servitor Recharge",      type: "Ativo",    rarity: "2Ôÿà", effect: "Restaura 30% MP do summon",           cooldown: "15s",    desc: "Recarga do servitor." },
      { name: "Transfer Pain",          type: "Toggle",   rarity: "2Ôÿà", effect: "50% dano recebido vai pro summon",    cooldown: "N/A",    desc: "Transfer├¬ncia de dor." },
      { name: "Summon Binding Cubic",   type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic que causa root em inimigos",    cooldown: "45s",    desc: "Cubic aprisionador." },
      { name: "Summon Phantom Cubic",   type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic que causa dano dark cont├¡nuo",  cooldown: "45s",    desc: "Cubic fantasma." },
      { name: "Life Cubic",             type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic que cura dono 5%/5s",           cooldown: "45s",    desc: "Cubic vital." },
      { name: "Warlock's Harmony",      type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% M.ATK, +25% Summon ATK 25min",   cooldown: "60 min", desc: "Harmonia do warlock." },
      { name: "Servitor Physical ATK",  type: "Passivo",  rarity: "2Ôÿà", effect: "+15% Summon ATK",                     cooldown: "N/A",    desc: "Poder do servitor." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ARCANA LORD (3┬¬ classe ÔÇö MEGA SUMMONER) ÔöÇÔöÇÔöÇ
  arcanaLord: {
    name: 'Arcana Lord', parent: 'warlock', stage: 3,
    desc: 'Senhor arcano dos invocadores. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 10, def: 22, hp: 310, mp: 430, eva: 5, crit: 5, matk: 118, mdef: 65 },
    skills: [
      { name: "Summon Feline King",            type: "Ativo",    rarity: "4Ôÿà", effect: "Invoca Rei Felino (ATK 90% do dono)",       cooldown: "120s",   desc: "Rei dos felinos ÔÇö summon supremo." },
      { name: "Summon Magnus",                 type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca Magnus (AoE ATK 70% do dono)",       cooldown: "90s",    desc: "Magnus elemental." },
      { name: "Servitor Barrier",              type: "Ativo",    rarity: "3Ôÿà", effect: "Summon ganha escudo 5000 HP por 15s",       cooldown: "60s",    desc: "Barreira do servitor." },
      { name: "Mass Servitor Heal",            type: "Ativo",    rarity: "3Ôÿà", effect: "Cura todos summons 40% HP",                cooldown: "25s",    desc: "Cura em massa dos servitors." },
      { name: "Servitor Empowerment",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+50% Summon ATK/DEF por 30s",               cooldown: "90s",    desc: "Empoderamento do servitor." },
      { name: "Final Servitor",                type: "Ativo",    rarity: "4Ôÿà", effect: "Summon sacrifica: AoE 600% + cura 50% HP",  cooldown: "180s",   desc: "Sacrif├¡cio final do servitor." },
      { name: "Transcendent Summon Burst",     type: "Ativo",    rarity: "4Ôÿà", effect: "Todos summons atacam: dano 800% total",     cooldown: "200s",   desc: "Explos├úo de invoca├º├Áes." },
      { name: "Arcana Lord's Harmony",         type: "Self-Buff",rarity: "4Ôÿà", effect: "+50% M.ATK, +60% Summon Power 30min",       cooldown: "90 min", desc: "Harmonia do senhor arcano." },
      { name: "Master of Summoning",           type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Summon ATK/DEF, +5% PvE",             cooldown: "N/A",    desc: "Mestre da invoca├º├úo." },
      { name: "Arcana Lord Spirit",            type: "Passivo",  rarity: "3Ôÿà", effect: "+12% M.ATK, +10% Summon HP",                cooldown: "N/A",    desc: "Esp├¡rito do senhor arcano." },
      { name: "Body of the Arcana Lord",       type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max MP, +8% Max HP",                  cooldown: "N/A",    desc: "Corpo arcano refor├ºado." }
    ]
  },

  // ÔöÇÔöÇÔöÇ CLERIC (1┬¬ classe) ÔöÇÔöÇÔöÇ
  cleric: {
    name: 'Cleric', parent: 'mage', race: 'human', archetype: 'healer', stage: 1,
    desc: 'Cl├®rigo curador e suporte. Skills anteriores permanecem.',
    base: { atk: 8, def: 15, hp: 130, mp: 120, eva: 4, crit: 3, matk: 22, mdef: 28 },
    skills: [
      { name: "Heal",             type: "Ativo",    rarity: "1Ôÿà", effect: "Cura 25% HP alvo",                 cooldown: "8s",     desc: "Cura b├ísica." },
      { name: "Battle Heal",      type: "Ativo",    rarity: "1Ôÿà", effect: "Cura 20% HP + remove 1 debuff",    cooldown: "10s",    desc: "Cura de combate." },
      { name: "Might",            type: "Party-Buff",rarity: "1Ôÿà", effect: "+15% ATK para party 10 min",      cooldown: "25 min", desc: "B├¬n├º├úo de for├ºa." },
      { name: "Shield (Buff)",    type: "Party-Buff",rarity: "1Ôÿà", effect: "+15% DEF para party 10 min",      cooldown: "25 min", desc: "B├¬n├º├úo de prote├º├úo." },
      { name: "Wind Walk",        type: "Party-Buff",rarity: "1Ôÿà", effect: "+20% Speed para party 10 min",    cooldown: "25 min", desc: "Caminhada do vento." },
      { name: "Cure Poison",      type: "Ativo",    rarity: "1Ôÿà", effect: "Remove poison",                    cooldown: "5s",     desc: "Cura veneno." },
      { name: "Cure Bleed",       type: "Ativo",    rarity: "1Ôÿà", effect: "Remove bleed",                     cooldown: "5s",     desc: "Estanca sangramento." },
      { name: "Turn Undead",      type: "Ativo",    rarity: "2Ôÿà", effect: "Dano holy 200% vs undead",         cooldown: "12s",    desc: "Repelir mortos-vivos." },
      { name: "Recharge",         type: "Ativo",    rarity: "1Ôÿà", effect: "Restaura 20% MP do alvo",          cooldown: "12s",    desc: "Recarrega mana." },
      { name: "Cleric's Harmony", type: "Self-Buff",rarity: "2Ôÿà", effect: "+20% M.ATK, +20% Heal Power 20min",cooldown: "45 min", desc: "Harmonia do cl├®rigo." }
    ]
  },

  // ÔöÇÔöÇÔöÇ BISHOP (2┬¬ classe ÔÇö HEALER) ÔöÇÔöÇÔöÇ
  bishop: {
    name: 'Bishop', parent: 'cleric', stage: 2,
    desc: 'Bispo curador poderoso. Skills anteriores permanecem.',
    base: { atk: 10, def: 28, hp: 250, mp: 220, eva: 4, crit: 4, matk: 50, mdef: 60 },
    skills: [
      { name: "Greater Heal",          type: "Ativo",      rarity: "2Ôÿà", effect: "Cura 40% HP alvo",                    cooldown: "10s",    desc: "Cura avan├ºada." },
      { name: "Greater Group Heal",    type: "Ativo",      rarity: "3Ôÿà", effect: "Cura 30% HP party",                   cooldown: "18s",    desc: "Cura em grupo." },
      { name: "Resurrection",          type: "Ativo",      rarity: "3Ôÿà", effect: "Ressuscita aliado com 30% HP",        cooldown: "120s",   desc: "Ressurrei├º├úo." },
      { name: "Greater Might",         type: "Party-Buff", rarity: "2Ôÿà", effect: "+25% ATK party 12 min",               cooldown: "30 min", desc: "B├¬n├º├úo de for├ºa maior." },
      { name: "Greater Shield",        type: "Party-Buff", rarity: "2Ôÿà", effect: "+25% DEF party 12 min",               cooldown: "30 min", desc: "B├¬n├º├úo de prote├º├úo maior." },
      { name: "Blessed Body",          type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% Max HP party 12 min",            cooldown: "30 min", desc: "Corpo aben├ºoado." },
      { name: "Blessed Soul",          type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% Max MP party 12 min",            cooldown: "30 min", desc: "Alma aben├ºoada." },
      { name: "Holy Weapon",           type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Holy ATK party 12 min",          cooldown: "30 min", desc: "Arma sagrada." },
      { name: "Purify",                type: "Ativo",      rarity: "2Ôÿà", effect: "Remove 3 debuffs do alvo",            cooldown: "20s",    desc: "Purifica├º├úo." },
      { name: "Cleanse",               type: "Ativo",      rarity: "3Ôÿà", effect: "Remove TODOS debuffs do alvo",        cooldown: "45s",    desc: "Limpeza total." },
      { name: "Mental Shield",         type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% M.DEF party 12 min",             cooldown: "30 min", desc: "Escudo mental." },
      { name: "Inquisitor",            type: "Ativo",      rarity: "2Ôÿà", effect: "Dano holy 250%",                      cooldown: "14s",    desc: "Poder inquisitorial." },
      { name: "Holy Strike",           type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy 320% + undead 2x",          cooldown: "18s",    desc: "Golpe sagrado." },
      { name: "Divine Punishment",     type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy 360% + stun 3s",            cooldown: "22s",    desc: "Puni├º├úo divina." },
      { name: "Major Heal",            type: "Ativo",      rarity: "3Ôÿà", effect: "Cura 55% HP alvo",                    cooldown: "15s",    desc: "Cura maior." },
      { name: "Party Recall",          type: "Ativo",      rarity: "2Ôÿà", effect: "Teleporta party para cidade",         cooldown: "300s",   desc: "Recall do grupo." },
      { name: "Bishop's Harmony",      type: "Self-Buff",  rarity: "3Ôÿà", effect: "+35% Heal, +25% M.ATK, +20% M.DEF 25min",cooldown: "60 min",desc: "Harmonia do bispo." },
      { name: "Mana Regeneration",     type: "Passivo",    rarity: "2Ôÿà", effect: "+15% MP Regen",                       cooldown: "N/A",    desc: "Regenera├º├úo de mana." }
    ]
  },

  // ÔöÇÔöÇÔöÇ CARDINAL (3┬¬ classe ÔÇö MEGA HEALER + DARK SIDE) ÔöÇÔöÇÔöÇ
  cardinal: {
    name: 'Cardinal', parent: 'bishop', stage: 3,
    desc: 'Cardeal supremo, mestre da cura E do dano sagrado (Dark Side). Skills anteriores permanecem.',
    base: { atk: 12, def: 42, hp: 420, mp: 480, eva: 5, crit: 5, matk: 95, mdef: 98 },
    skills: [
      { name: "Miracle",                      type: "Ativo",      rarity: "4Ôÿà", effect: "Cura party 80% HP + ressurge mortos",      cooldown: "300s",   desc: "MILAGRE ÔÇö cura suprema + ressurrei├º├úo." },
      { name: "Sublime Self-Sacrifice",        type: "Ativo",      rarity: "4Ôÿà", effect: "Morre para curar party 100% HP+MP",       cooldown: "300s",   desc: "Auto-sacrif├¡cio sublime." },
      { name: "Balance Life",                  type: "Ativo",      rarity: "3Ôÿà", effect: "Equaliza HP de toda party",                cooldown: "60s",    desc: "Equil├¡brio vital." },
      { name: "Mass Resurrection",             type: "Ativo",      rarity: "4Ôÿà", effect: "Ressuscita toda party com 40% HP",        cooldown: "300s",   desc: "Ressurrei├º├úo em massa." },
      { name: "Lord of Vampire",               type: "Party-Buff", rarity: "3Ôÿà", effect: "+10% lifesteal para party 12 min",        cooldown: "30 min", desc: "Senhor dos vampiros." },
      { name: "Blessing of Eva",               type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% M.DEF e resist debuff party 12min",  cooldown: "30 min", desc: "B├¬n├º├úo de Eva." },
      { name: "Trance",                        type: "Ativo",      rarity: "3Ôÿà", effect: "Channeling: cura 8%/s por 10s",           cooldown: "45s",    desc: "Transe curativo." },
      { name: "Dark Side",                     type: "Toggle",     rarity: "3Ôÿà", effect: "Troca: -60% Heal, +80% M.ATK holy",       cooldown: "N/A",    desc: "LADO SOMBRIO ÔÇö transforma healer em DPS." },
      { name: "Holy Burst",                    type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy AoE 400% (Dark Side only)",     cooldown: "20s",    desc: "Explos├úo sagrada (apenas Dark Side)." },
      { name: "Divine Nova",                   type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy AoE 450% + blind 5s",           cooldown: "25s",    desc: "Nova divina (Dark Side amplifica)." },
      { name: "Transcendent Holy Strike",      type: "Ativo",      rarity: "4Ôÿà", effect: "Dano holy 750% + stun 5s",                cooldown: "180s",   desc: "Golpe sagrado transcendente." },
      { name: "Cardinal's Harmony",            type: "Self-Buff",  rarity: "4Ôÿà", effect: "+55% Heal, +40% M.ATK, +30% M.DEF 30min",cooldown: "90 min", desc: "Harmonia do cardeal." },
      { name: "Master of Healing",             type: "Passivo",    rarity: "3Ôÿà", effect: "+15% Heal Power, +5% PvE",               cooldown: "N/A",    desc: "Mestre da cura." },
      { name: "Cardinal Spirit",               type: "Passivo",    rarity: "3Ôÿà", effect: "+12% holy magic ATK",                     cooldown: "N/A",    desc: "Esp├¡rito do cardeal." },
      { name: "Body of the Cardinal",          type: "Passivo",    rarity: "3Ôÿà", effect: "+12% Max MP, +10% M.DEF",                cooldown: "N/A",    desc: "Corpo sagrado." }
    ]
  },

  // ÔöÇÔöÇÔöÇ PROPHET (2┬¬ classe ÔÇö BUFFER) ÔöÇÔöÇÔöÇ
  prophet: {
    name: 'Prophet', parent: 'cleric', stage: 2,
    desc: 'Profeta, mestre dos buffs. Skills anteriores permanecem.',
    base: { atk: 12, def: 25, hp: 280, mp: 200, eva: 4, crit: 4, matk: 42, mdef: 52 },
    skills: [
      { name: "Haste",              type: "Self-Buff",  rarity: "2Ôÿà", effect: "+30% ATK Speed por 20 min",            cooldown: "50 min", desc: "Acelera├º├úo." },
      { name: "Berserker Spirit",    type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% ATK, +20% M.ATK, -10% DEF 20min",cooldown: "50 min", desc: "Esp├¡rito berserker." },
      { name: "Vampiric Rage",      type: "Self-Buff",  rarity: "2Ôÿà", effect: "+10% lifesteal por 20 min",            cooldown: "50 min", desc: "F├║ria vamp├¡rica." },
      { name: "Empower",            type: "Self-Buff",  rarity: "2Ôÿà", effect: "+25% M.ATK por 20 min",                cooldown: "50 min", desc: "Empoderamento m├ígico." },
      { name: "Acumen",             type: "Self-Buff",  rarity: "2Ôÿà", effect: "+25% Cast Speed por 20 min",           cooldown: "50 min", desc: "Acuidade m├ígica." },
      { name: "Concentration",      type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% M.DEF por 20 min",                cooldown: "50 min", desc: "Concentra├º├úo m├ígica." },
      { name: "Death Whisper",      type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% Crit Damage por 20 min",          cooldown: "50 min", desc: "Sussurro da morte." },
      { name: "Guidance",           type: "Self-Buff",  rarity: "2Ôÿà", effect: "+15% Accuracy por 20 min",             cooldown: "50 min", desc: "Guia divina." },
      { name: "Focus",              type: "Self-Buff",  rarity: "2Ôÿà", effect: "+15% Crit Rate por 20 min",            cooldown: "50 min", desc: "Foco b├®lico." },
      { name: "Bless Shield",       type: "Self-Buff",  rarity: "2Ôÿà", effect: "+25% Block Rate por 20 min",           cooldown: "50 min", desc: "Escudo aben├ºoado." },
      { name: "Resist Fire",        type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% Fire Resist por 20 min",          cooldown: "50 min", desc: "Resist├¬ncia ao fogo." },
      { name: "Resist Water",       type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% Water Resist por 20 min",         cooldown: "50 min", desc: "Resist├¬ncia ├á ├ígua." },
      { name: "Resist Wind",        type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% Wind Resist por 20 min",          cooldown: "50 min", desc: "Resist├¬ncia ao vento." },
      { name: "Holy Strike",        type: "Ativo",      rarity: "2Ôÿà", effect: "Dano holy 280%",                       cooldown: "14s",    desc: "Golpe sagrado." },
      { name: "Prophet's Harmony",  type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% ATK, +25% M.ATK, +20% DEF 25min", cooldown: "60 min", desc: "Harmonia do profeta." }
    ]
  },

  // ÔöÇÔöÇÔöÇ HIEROPHANT (3┬¬ classe ÔÇö MEGA BUFFER + DPS) ÔöÇÔöÇÔöÇ
  hierophant: {
    name: 'Hierophant', parent: 'prophet', stage: 3,
    desc: 'Hierofante, profeta supremo com profecias e dano. Skills anteriores permanecem.',
    base: { atk: 15, def: 38, hp: 420, mp: 380, eva: 5, crit: 5, matk: 82, mdef: 82 },
    skills: [
      { name: "Prophecy of Fire",             type: "Party-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +15% Crit party 12 min",        cooldown: "30 min", desc: "Profecia do fogo." },
      { name: "Prophecy of Wind",             type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% Speed, +20% EVA party 12 min",       cooldown: "30 min", desc: "Profecia do vento." },
      { name: "Prophecy of Water",            type: "Party-Buff", rarity: "3Ôÿà", effect: "+30% M.ATK, +20% M.DEF party 12 min",     cooldown: "30 min", desc: "Profecia da ├ígua." },
      { name: "Mass Prophecy",                type: "Party-Buff", rarity: "4Ôÿà", effect: "Todas profecias de uma vez 8 min",        cooldown: "60 min", desc: "Profecia em massa." },
      { name: "Holy Punishment",              type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy 400% + silence 5s",              cooldown: "22s",    desc: "Puni├º├úo sagrada." },
      { name: "Mystic Immunity",              type: "Ativo",      rarity: "4Ôÿà", effect: "Imune a magia 8s, n├úo pode atacar",        cooldown: "180s",   desc: "Imunidade m├¡stica." },
      { name: "Blessing of Nobility",         type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% all stats party 10 min",             cooldown: "30 min", desc: "B├¬n├º├úo da nobreza." },
      { name: "Transcendent Holy Burst",      type: "Ativo",      rarity: "4Ôÿà", effect: "Dano holy AoE 650% + stun 4s + purge",    cooldown: "180s",   desc: "Explos├úo sagrada transcendente." },
      { name: "Hierophant's Harmony",         type: "Self-Buff",  rarity: "4Ôÿà", effect: "+50% ATK, +45% M.ATK, +35% DEF 30min",    cooldown: "90 min", desc: "Harmonia do hierofante." },
      { name: "Master of Prophecy",           type: "Passivo",    rarity: "3Ôÿà", effect: "+15% buff duration, +5% PvE",             cooldown: "N/A",    desc: "Mestre das profecias." },
      { name: "Hierophant Spirit",            type: "Passivo",    rarity: "3Ôÿà", effect: "+12% holy ATK, +8% Heal",                  cooldown: "N/A",    desc: "Esp├¡rito do hierofante." },
      { name: "Body of the Hierophant",       type: "Passivo",    rarity: "3Ôÿà", effect: "+10% Max HP, +10% Max MP",                cooldown: "N/A",    desc: "Corpo do hierofante." }
    ]
  },

  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  ELF FIGHTER
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô

  elfFighter: {
    name: 'Elf Fighter', archetype: 'fighter', race: 'elf', stage: 0,
    desc: 'Guerreiro ├®lfico ├ígil.',
    base: { atk: 10, def: 8, hp: 90, mp: 35, eva: 10, crit: 6, matk: 0, mdef: 6 },
    skills: [
      { name: "Power Strike",       type: "Ativo",    rarity: "1Ôÿà", effect: "Dano f├¡sico 150%",               cooldown: "8s",     desc: "Golpe concentrado." },
      { name: "Mortal Blow",         type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 170% + chance crit 20%",    cooldown: "10s",    desc: "Golpe mortal." },
      { name: "Power Shot",          type: "Ativo",    rarity: "1Ôÿà", effect: "Dano ├á dist├óncia 140%",          cooldown: "9s",     desc: "Disparo concentrado." },
      { name: "Elven Spirit",        type: "Self-Buff",rarity: "1Ôÿà", effect: "+10% EVA, +10% Speed por 15 min",cooldown: "30 min", desc: "Esp├¡rito ├®lfico." },
      { name: "HP Increase Lv1",     type: "Passivo",  rarity: "1Ôÿà", effect: "+5% Max HP",                     cooldown: "N/A",    desc: "Constitui├º├úo ├®lfica." },
      { name: "Light Armor Mastery", type: "Passivo",  rarity: "1Ôÿà", effect: "+8% DEF com armadura leve",      cooldown: "N/A",    desc: "Maestria em armaduras leves." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ELVEN KNIGHT (1┬¬ classe) ÔöÇÔöÇÔöÇ
  elvenKnight: {
    name: 'Elven Knight', parent: 'elfFighter', race: 'elf', archetype: 'tank', stage: 1,
    desc: 'Cavaleiro ├®lfico com escudo. Skills anteriores permanecem.',
    base: { atk: 16, def: 30, hp: 230, mp: 55, eva: 8, crit: 4, mdef: 18 },
    skills: [
      { name: "Shield Strike",         type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 160% + taunt 5s",         cooldown: "10s",    desc: "Golpe de escudo." },
      { name: "Hate",                  type: "Ativo",    rarity: "1Ôÿà", effect: "Taunt + aggro forte",          cooldown: "8s",     desc: "Gera ├│dio." },
      { name: "Power Break",           type: "Ativo",    rarity: "1Ôÿà", effect: "Dano 150% + -20% ATK 8s",      cooldown: "14s",    desc: "Quebra de poder." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+15% DEF armadura pesada",     cooldown: "N/A",    desc: "Maestria pesada." },
      { name: "Shield Mastery",        type: "Passivo",  rarity: "1Ôÿà", effect: "+15% Block Rate",              cooldown: "N/A",    desc: "Maestria em escudos." },
      { name: "Sword/Blunt Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+10% ATK espada/blunt",        cooldown: "N/A",    desc: "Maestria em espadas." },
      { name: "HP Increase Lv2",       type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Max HP",                  cooldown: "N/A",    desc: "Constitui├º├úo refor├ºada." },
      { name: "Deflect Arrow",         type: "Passivo",  rarity: "1Ôÿà", effect: "+10% desviar proj├®teis",       cooldown: "N/A",    desc: "Desvio de proj├®teis." }
    ]
  },

  // ÔöÇÔöÇÔöÇ TEMPLE KNIGHT (2┬¬ classe) ÔöÇÔöÇÔöÇ
  templeKnight: {
    name: 'Temple Knight', parent: 'elvenKnight', stage: 2,
    desc: 'Cavaleiro do templo de Eva. Skills anteriores permanecem.',
    base: { atk: 35, def: 62, hp: 500, mp: 100, eva: 8, crit: 5, mdef: 40 },
    skills: [
      { name: "Shield Stun",           type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 200% + stun 3s",           cooldown: "18s",    desc: "Escudada atordoante." },
      { name: "Tribunal",              type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + -20% DEF 10s",      cooldown: "20s",    desc: "Julgamento do templo." },
      { name: "Eva's Will",            type: "Ativo",    rarity: "3Ôÿà", effect: "+30% water resist + cura 15% HP",cooldown: "45s",   desc: "Vontade de Eva." },
      { name: "Sacrifice",             type: "Ativo",    rarity: "2Ôÿà", effect: "Cura aliado 30% (gasta 10%)",    cooldown: "25s",    desc: "Sacrif├¡cio pelo aliado." },
      { name: "Aegis",                 type: "Ativo",    rarity: "2Ôÿà", effect: "+60% Block Rate por 15s",        cooldown: "45s",    desc: "Aegis defensivo." },
      { name: "Holy Blade",            type: "Ativo",    rarity: "2Ôÿà", effect: "Dano sagrado 250%",              cooldown: "16s",    desc: "L├ómina sagrada." },
      { name: "Ultimate Defense",      type: "Ativo",    rarity: "3Ôÿà", effect: "+80% DEF, -50% ATK por 15s",     cooldown: "120s",   desc: "Defesa absoluta." },
      { name: "Provoke",               type: "Ativo",    rarity: "1Ôÿà", effect: "Taunt + aggro",                  cooldown: "8s",     desc: "Provoca├º├úo." },
      { name: "Summon Life Cubic",     type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic que cura 5%/5s",           cooldown: "45s",    desc: "Cubic vital." },
      { name: "Summon Storm Cubic",    type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic de dano lightning",        cooldown: "45s",    desc: "Cubic de tempestade." },
      { name: "TK's Harmony",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% DEF, +25% HP, +15% EVA 25min",cooldown: "60 min",desc: "Harmonia do cavaleiro do templo." },
      { name: "Boost HP",              type: "Passivo",  rarity: "2Ôÿà", effect: "+15% Max HP",                    cooldown: "N/A",    desc: "HP refor├ºado." },
      { name: "Resist Aqua",           type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Water Resist",              cooldown: "N/A",    desc: "Resist├¬ncia aqu├ítica." }
    ]
  },

  // ÔöÇÔöÇÔöÇ EVA'S TEMPLAR (3┬¬ classe) ÔöÇÔöÇÔöÇ
  evaTemplar: {
    name: "Eva's Templar", parent: 'templeKnight', stage: 3,
    desc: 'Templ├írio de Eva, tank divino aqu├ítico. Skills anteriores permanecem.',
    base: { atk: 68, def: 100, hp: 820, mp: 145, eva: 10, crit: 6, mdef: 65 },
    skills: [
      { name: "Touch of Eva",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Cura AoE 25% HP party + cleanse 1 debuff", cooldown: "35s",    desc: "Toque de Eva." },
      { name: "Shield of Eva",                 type: "Ativo",    rarity: "3Ôÿà", effect: "Absorve 5000 dano por 15s",               cooldown: "90s",    desc: "Escudo de Eva." },
      { name: "Celestial Shield",              type: "Ativo",    rarity: "4Ôÿà", effect: "Party imune a dano por 5s",               cooldown: "300s",   desc: "Escudo celestial." },
      { name: "Aqua Strike",                   type: "Ativo",    rarity: "3Ôÿà", effect: "Dano water 380% + slow 40% 6s",           cooldown: "22s",    desc: "Golpe aqu├ítico." },
      { name: "Summon Guardian Agathion",       type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca agathion protetor (+15% DEF)",     cooldown: "120s",   desc: "Agathion guardi├úo." },
      { name: "Transcendent Shield Charge",    type: "Ativo",    rarity: "4Ôÿà", effect: "Rush + 480% dano + AoE taunt 10s",        cooldown: "160s",   desc: "Investida transcendente." },
      { name: "Eva's Templar Harmony",         type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% DEF, +40% HP, +25% M.DEF 30min",     cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Master of Combat",              type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +15% aggro, +5% PvE",           cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Eva's Templar Spirit",          type: "Passivo",  rarity: "3Ôÿà", effect: "+15% water ATK, +10% Block",              cooldown: "N/A",    desc: "Esp├¡rito do templ├írio." },
      { name: "Body of Eva's Templar",         type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Max HP, +10% DEF",                  cooldown: "N/A",    desc: "Corpo do templ├írio." },
      { name: "Protection of Eva",             type: "Passivo",  rarity: "3Ôÿà", effect: "+15% water resist",                       cooldown: "N/A",    desc: "Prote├º├úo de Eva." },
      { name: "Eva's Help",                    type: "Passivo",  rarity: "3Ôÿà", effect: "10% chance ao ser atacado: cura 5% HP",   cooldown: "N/A",    desc: "Ajuda de Eva (trigger)." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SWORD SINGER (2┬¬ classe ÔÇö BARD) ÔöÇÔöÇÔöÇ
  swordSinger: {
    name: 'Sword Singer', parent: 'elvenKnight', stage: 2,
    desc: 'Bardo ├®lfico com can├º├Áes de buff. Skills anteriores permanecem.',
    base: { atk: 38, def: 45, hp: 400, mp: 120, eva: 10, crit: 8, mdef: 35 },
    skills: [
      { name: "Song of Earth",         type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% DEF por 20 min",            cooldown: "50 min", desc: "Can├º├úo da terra." },
      { name: "Song of Life",          type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% HP Regen por 20 min",       cooldown: "50 min", desc: "Can├º├úo da vida." },
      { name: "Song of Water",         type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% Water Resist por 20 min",   cooldown: "50 min", desc: "Can├º├úo da ├ígua." },
      { name: "Song of Warding",       type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% M.DEF por 20 min",          cooldown: "50 min", desc: "Can├º├úo de prote├º├úo." },
      { name: "Song of Wind",          type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% ATK Speed por 20 min",      cooldown: "50 min", desc: "Can├º├úo do vento." },
      { name: "Song of Hunter",        type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% Crit Rate por 20 min",      cooldown: "50 min", desc: "Can├º├úo do ca├ºador." },
      { name: "Song of Invocation",    type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% MP Regen por 20 min",       cooldown: "50 min", desc: "Can├º├úo da invoca├º├úo." },
      { name: "Song of Vitality",      type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% Max HP por 20 min",         cooldown: "50 min", desc: "Can├º├úo da vitalidade." },
      { name: "Song of Vengeance",     type: "Self-Buff", rarity: "2Ôÿà", effect: "+8% reflect damage por 20 min",  cooldown: "50 min", desc: "Can├º├úo da vingan├ºa." },
      { name: "Song of Flame Guard",   type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% Fire Resist por 20 min",    cooldown: "50 min", desc: "Can├º├úo da chama." },
      { name: "Song of Champion",      type: "Self-Buff", rarity: "3Ôÿà", effect: "+20% ATK por 20 min",            cooldown: "50 min", desc: "Can├º├úo do campe├úo." },
      { name: "Song of Renewal",       type: "Self-Buff", rarity: "3Ôÿà", effect: "+10% HP+MP Regen por 20 min",    cooldown: "50 min", desc: "Can├º├úo da renova├º├úo." },
      { name: "SS's Harmony",          type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +20% DEF, +15% Speed 25min",cooldown: "60 min",desc: "Harmonia do bardo." },
      { name: "Heavy Armor Mastery",   type: "Passivo",  rarity: "1Ôÿà", effect: "+12% DEF armadura pesada",        cooldown: "N/A",    desc: "Maestria pesada." },
      { name: "Boost HP",              type: "Passivo",  rarity: "1Ôÿà", effect: "+12% Max HP",                     cooldown: "N/A",    desc: "HP refor├ºado." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SWORD MUSE (3┬¬ classe ÔÇö MEGA BARD + DPS) ÔöÇÔöÇÔöÇ
  swordMuse: {
    name: 'Sword Muse', parent: 'swordSinger', stage: 3,
    desc: 'Musa da espada, bardo supremo com DPS. Skills anteriores permanecem.',
    base: { atk: 72, def: 58, hp: 580, mp: 160, eva: 14, crit: 12, mdef: 48 },
    skills: [
      { name: "Song of Purification",    type: "Self-Buff", rarity: "3Ôÿà", effect: "+25% Debuff Resist por 20 min",     cooldown: "50 min", desc: "Can├º├úo de purifica├º├úo." },
      { name: "Song of Elemental",       type: "Self-Buff", rarity: "3Ôÿà", effect: "+20% all elemental ATK por 20 min", cooldown: "50 min", desc: "Can├º├úo elemental." },
      { name: "Song of Storm Guard",     type: "Self-Buff", rarity: "3Ôÿà", effect: "+20% Wind Resist por 20 min",       cooldown: "50 min", desc: "Can├º├úo da tempestade." },
      { name: "Mass Song",               type: "Party-Buff",rarity: "3Ôÿà", effect: "Aplica todas Songs na party 8 min", cooldown: "60 min", desc: "Can├º├úo em massa." },
      { name: "Final Song",              type: "Ativo",     rarity: "4Ôÿà", effect: "Party +50% all stats por 20s",       cooldown: "300s",   desc: "Can├º├úo final ÔÇö buff supremo." },
      { name: "Sonic Slash",             type: "Ativo",     rarity: "3Ôÿà", effect: "Dano 380% + AoE 5 alvos",           cooldown: "20s",    desc: "Corte s├┤nico." },
      { name: "Melody Strike",           type: "Ativo",     rarity: "3Ôÿà", effect: "Dano 350% + stun 2s",               cooldown: "18s",    desc: "Golpe mel├│dico." },
      { name: "Transcendent Melody",     type: "Ativo",     rarity: "4Ôÿà", effect: "Dano AoE 550% + all songs refreshed",cooldown: "180s",  desc: "Melodia transcendente." },
      { name: "Sword Muse Harmony",      type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% ATK, +40% DEF, +30% Song Power 30min",cooldown: "90 min",desc: "Harmonia da musa." },
      { name: "Sword Muse Spirit",       type: "Passivo",   rarity: "3Ôÿà", effect: "+15% Song effectiveness",           cooldown: "N/A",    desc: "Esp├¡rito da musa." },
      { name: "Body of Sword Muse",      type: "Passivo",   rarity: "3Ôÿà", effect: "+10% Max HP, +10% Max MP",         cooldown: "N/A",    desc: "Corpo da musa." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SCOUT (1┬¬ classe ÔÇö Elf) ÔöÇÔöÇÔöÇ
  elfScout: {
    name: 'Scout', parent: 'elfFighter', race: 'elf', archetype: 'assassin', stage: 1,
    desc: 'Batedor ├®lfico, dagger e bow. Skills anteriores permanecem.',
    base: { atk: 20, def: 10, hp: 140, mp: 40, eva: 18, crit: 12, mdef: 8 },
    skills: [
      { name: "Double Shot",          type: "Ativo",    rarity: "1Ôÿà", effect: "2 disparos, dano total 200%",   cooldown: "10s",    desc: "Duplo disparo." },
      { name: "Backstab",             type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 250% por tr├ís + crit",     cooldown: "14s",    desc: "Punhalada nas costas." },
      { name: "Dash",                 type: "Ativo",    rarity: "1Ôÿà", effect: "+50% Speed por 8s",             cooldown: "20s",    desc: "Corrida r├ípida." },
      { name: "Light Armor Mastery",  type: "Passivo",  rarity: "1Ôÿà", effect: "+12% EVA com armadura leve",    cooldown: "N/A",    desc: "Maestria leve." },
      { name: "Dagger Mastery",       type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com dagger",           cooldown: "N/A",    desc: "Maestria em adagas." },
      { name: "Bow Mastery",          type: "Passivo",  rarity: "1Ôÿà", effect: "+12% ATK com arco",             cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Critical Chance",      type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Crit Rate",                 cooldown: "N/A",    desc: "Senso cr├¡tico." }
    ]
  },

  // ÔöÇÔöÇÔöÇ PLAINS WALKER (2┬¬ classe ÔÇö dagger) ÔöÇÔöÇÔöÇ
  plainsWalker: {
    name: 'Plains Walker', parent: 'elfScout', stage: 2,
    desc: 'Caminhante das plan├¡cies, dagger stealth. Skills anteriores permanecem.',
    base: { atk: 52, def: 18, hp: 290, mp: 60, eva: 30, crit: 26, mdef: 14 },
    skills: [
      { name: "Deadly Blow",       type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 280% + crit garantido",       cooldown: "14s",    desc: "Golpe mortal." },
      { name: "Lethal Blow",       type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 350% + chance kill 5%",       cooldown: "22s",    desc: "Golpe letal." },
      { name: "Sand Bomb",         type: "Ativo",    rarity: "2Ôÿà", effect: "AoE blind 5s + dano 150%",         cooldown: "20s",    desc: "Bomba de areia." },
      { name: "Blinding Blow",     type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 240% + blind 4s",             cooldown: "18s",    desc: "Golpe cegante." },
      { name: "Shadow Step",       type: "Ativo",    rarity: "2Ôÿà", effect: "Teleporta atr├ís do alvo",          cooldown: "15s",    desc: "Passo sombrio." },
      { name: "Switch",            type: "Ativo",    rarity: "2Ôÿà", effect: "Troca posi├º├úo com alvo",           cooldown: "25s",    desc: "Troca de posi├º├úo." },
      { name: "Fake Death",        type: "Ativo",    rarity: "2Ôÿà", effect: "Finge morte, perde aggro",         cooldown: "60s",    desc: "Morte falsa." },
      { name: "Trick",             type: "Ativo",    rarity: "2Ôÿà", effect: "Remove alvo do inimigo",           cooldown: "20s",    desc: "Truque evasivo." },
      { name: "PW's Harmony",      type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% Crit, +25% EVA, +20% ATK 25min",cooldown: "60 min",desc: "Harmonia do caminhante." },
      { name: "Evasion",           type: "Passivo",  rarity: "2Ôÿà", effect: "+12% EVA",                         cooldown: "N/A",    desc: "Evas├úo aprimorada." },
      { name: "Critical Power",    type: "Passivo",  rarity: "2Ôÿà", effect: "+18% Crit Damage",                 cooldown: "N/A",    desc: "Poder cr├¡tico." },
      { name: "Focus",             type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Crit Rate",                   cooldown: "N/A",    desc: "Concentra├º├úo." }
    ]
  },

  // ÔöÇÔöÇÔöÇ WIND RIDER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  windRider: {
    name: 'Wind Rider', parent: 'plainsWalker', stage: 3,
    desc: 'Cavaleiro do vento, dagger supremo. Skills anteriores permanecem.',
    base: { atk: 95, def: 30, hp: 480, mp: 85, eva: 55, crit: 44, mdef: 20 },
    skills: [
      { name: "Wind Riding",                type: "Ativo",    rarity: "3Ôÿà", effect: "+80% Speed + invis├¡vel 10s",         cooldown: "60s",    desc: "Cavalgando o vento." },
      { name: "Exciting Adventure",          type: "Self-Buff",rarity: "3Ôÿà", effect: "+45% EVA, +30% Crit, +20% ATK 20min",cooldown: "55 min",desc: "Aventura ├®lfica." },
      { name: "Lucky Strike",               type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + chance loot 2x",         cooldown: "30s",    desc: "Golpe de sorte." },
      { name: "Transcendent Deadly Blow",    type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 650% + ignora EVA + bleed 12s", cooldown: "150s",   desc: "Golpe mortal transcendente." },
      { name: "Wind Rider Harmony",          type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% Crit, +45% EVA, +35% ATK 30min",cooldown: "90 min",desc: "Harmonia suprema." },
      { name: "Master of Combat",            type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% Crit, +5% PvE",      cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Shadow Sense",                type: "Passivo",  rarity: "3Ôÿà", effect: "+15% EVA ├á noite/dungeon",           cooldown: "N/A",    desc: "Sentido das sombras." },
      { name: "Wind Rider Spirit",           type: "Passivo",  rarity: "3Ôÿà", effect: "+12% dagger ATK",                    cooldown: "N/A",    desc: "Esp├¡rito do cavaleiro do vento." },
      { name: "Body of Wind Rider",          type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max HP, +8% EVA",              cooldown: "N/A",    desc: "Corpo do vento." },
      { name: "Final Frenzy",                type: "Passivo",  rarity: "3Ôÿà", effect: "+25% ATK quando HP < 30%",           cooldown: "N/A",    desc: "Frenesi final." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SILVER RANGER (2┬¬ classe ÔÇö archer) ÔöÇÔöÇÔöÇ
  silverRanger: {
    name: 'Silver Ranger', parent: 'elfScout', stage: 2,
    desc: 'Arqueiro prateado ├®lfico. Skills anteriores permanecem.',
    base: { atk: 58, def: 16, hp: 270, mp: 60, eva: 22, crit: 24, mdef: 12 },
    skills: [
      { name: "Double Shot",       type: "Ativo",    rarity: "2Ôÿà", effect: "2 disparos, dano total 260%",     cooldown: "10s",    desc: "Duplo disparo aprimorado." },
      { name: "Burst Shot",        type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 280% + knockback",           cooldown: "14s",    desc: "Disparo explosivo." },
      { name: "Stun Shot",         type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + stun 3s",            cooldown: "18s",    desc: "Disparo atordoante." },
      { name: "Arrow Rain",        type: "Ativo",    rarity: "3Ôÿà", effect: "AoE 320% (8 alvos)",             cooldown: "22s",    desc: "Chuva de flechas." },
      { name: "Rapid Fire",        type: "Ativo",    rarity: "2Ôÿà", effect: "+50% ATK Speed arco 15s",        cooldown: "45s",    desc: "Disparo r├ípido." },
      { name: "SR's Harmony",      type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +15% Range 25min",cooldown: "60 min",desc: "Harmonia do ranger." },
      { name: "Bow Mastery",       type: "Passivo",  rarity: "2Ôÿà", effect: "+18% ATK com arco",              cooldown: "N/A",    desc: "Maestria em arcos." },
      { name: "Long Shot",         type: "Passivo",  rarity: "2Ôÿà", effect: "+30% Range",                      cooldown: "N/A",    desc: "Longo alcance." },
      { name: "Focus",             type: "Passivo",  rarity: "1Ôÿà", effect: "+10% Crit Rate",                  cooldown: "N/A",    desc: "Concentra├º├úo." },
      { name: "Critical Power",    type: "Passivo",  rarity: "2Ôÿà", effect: "+18% Crit Damage",                cooldown: "N/A",    desc: "Poder cr├¡tico." },
      { name: "Evasion",           type: "Passivo",  rarity: "1Ôÿà", effect: "+10% EVA",                        cooldown: "N/A",    desc: "Evas├úo." }
    ]
  },

  // ÔöÇÔöÇÔöÇ MOONLIGHT SENTINEL (3┬¬ classe) ÔöÇÔöÇÔöÇ
  moonlightSentinel: {
    name: 'Moonlight Sentinel', parent: 'silverRanger', stage: 3,
    desc: 'Sentinela do luar, arqueiro supremo ├®lfico. Skills anteriores permanecem.',
    base: { atk: 108, def: 24, hp: 450, mp: 95, eva: 38, crit: 46, mdef: 18 },
    skills: [
      { name: "Seven Arrow",                  type: "Ativo",    rarity: "3Ôÿà", effect: "7 flechas, dano total 480%",               cooldown: "25s",    desc: "Sete flechas." },
      { name: "Dead Eye",                     type: "Self-Buff",rarity: "3Ôÿà", effect: "+50% ATK, +40% Range 20min",              cooldown: "55 min", desc: "Olho mortal." },
      { name: "Pinpoint Shot",                type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 400% + ignora 50% DEF",              cooldown: "28s",    desc: "Tiro preciso." },
      { name: "Triple Shot",                  type: "Ativo",    rarity: "3Ôÿà", effect: "3 disparos, dano total 360%",              cooldown: "14s",    desc: "Tiro triplo." },
      { name: "Thorn Shot",                   type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 260% + bleed 10s",                   cooldown: "12s",    desc: "Flecha de espinhos." },
      { name: "Binding Shot",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 220% + root 4s",                     cooldown: "18s",    desc: "Flecha aprisionadora." },
      { name: "Freezing Shot",                type: "Ativo",    rarity: "2Ôÿà", effect: "Dano gelo 260% + slow 40% 6s",            cooldown: "16s",    desc: "Flecha congelante." },
      { name: "Ice Arrow Rain",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE GELO 380% (10 alvos) + freeze",         cooldown: "28s",    desc: "Condensa o ar em volta das flechas congelando-as." },
      { name: "Spiral Shot",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + penetra alvos",               cooldown: "24s",    desc: "Tiro espiral." },
      { name: "Target Lock",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Marca alvo: +40% dano 12s",                cooldown: "30s",    desc: "Trava de mira." },
      { name: "Transcendent Seven Arrow",     type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 700% + elemental + ignora DEF",      cooldown: "180s",   desc: "Sete flechas transcendentes." },
      { name: "Moonlight Harmony",            type: "Self-Buff",rarity: "4Ôÿà", effect: "+60% ATK, +50% Crit, +40% Range 30min",   cooldown: "90 min", desc: "Harmonia do luar." },
      { name: "Master of Combat",             type: "Passivo",  rarity: "3Ôÿà", effect: "+10% ATK, +10% Range, +5% PvE",          cooldown: "N/A",    desc: "Mestre do combate." },
      { name: "Moonlight Sentinel Spirit",    type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Bow ATK",                            cooldown: "N/A",    desc: "Esp├¡rito do sentinela." },
      { name: "Body of Moonlight Sentinel",   type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max HP, +8% EVA",                   cooldown: "N/A",    desc: "Corpo do sentinela." }
    ]
  },

  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  ELF MAGE
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô

  elfMage: {
    name: 'Elf Mage', archetype: 'mage', race: 'elf', stage: 0,
    desc: 'Mago ├®lfico da natureza.',
    base: { atk: 4, def: 5, hp: 65, mp: 85, eva: 8, crit: 3, matk: 14, mdef: 10 },
    skills: [
      { name: "Wind Strike",   type: "Ativo",    rarity: "1Ôÿà", effect: "Dano vento 160%",             cooldown: "8s",     desc: "Rajada de vento." },
      { name: "Ice Bolt",      type: "Ativo",    rarity: "1Ôÿà", effect: "Dano gelo 155% + slow 15% 4s",cooldown: "8s",     desc: "Proj├®til de gelo." },
      { name: "Self Heal",     type: "Ativo",    rarity: "1Ôÿà", effect: "Cura 20% HP",                 cooldown: "25s",    desc: "Autocura." },
      { name: "Sleep",         type: "Ativo",    rarity: "1Ôÿà", effect: "Adormece alvo 8s",             cooldown: "30s",    desc: "Sono m├ígico." },
      { name: "Robe Mastery",  type: "Passivo",  rarity: "1Ôÿà", effect: "+10% M.DEF, +8% Cast Speed",   cooldown: "N/A",    desc: "Maestria em vestes." },
      { name: "MP Increase",   type: "Passivo",  rarity: "1Ôÿà", effect: "+8% Max MP",                   cooldown: "N/A",    desc: "Reserva m├ígica." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ELVEN WIZARD (1┬¬ classe) ÔöÇÔöÇÔöÇ
  elvenWizard: {
    name: 'Elven Wizard', parent: 'elfMage', race: 'elf', archetype: 'mage', stage: 1,
    desc: 'Mago ├®lfico elemental. Skills anteriores permanecem.',
    base: { atk: 5, def: 7, hp: 95, mp: 135, eva: 6, crit: 4, matk: 33, mdef: 20 },
    skills: [
      { name: "Blaze",              type: "Ativo",    rarity: "1Ôÿà", effect: "Dano fogo 210%",                 cooldown: "10s",    desc: "Chamas." },
      { name: "Aqua Swirl",         type: "Ativo",    rarity: "1Ôÿà", effect: "Dano ├ígua 200% + slow 20% 5s",   cooldown: "10s",    desc: "Turbilh├úo aqu├ítico." },
      { name: "Aura Burn",          type: "Ativo",    rarity: "2Ôÿà", effect: "AoE fogo 180% ao redor",         cooldown: "14s",    desc: "Queimadura ├íurica." },
      { name: "Life Drain",         type: "Ativo",    rarity: "2Ôÿà", effect: "Dano 190% + drena 25% HP",       cooldown: "15s",    desc: "Dreno vital." },
      { name: "Wizard's Harmony",   type: "Self-Buff",rarity: "2Ôÿà", effect: "+25% M.ATK, +15% Cast Speed 20min",cooldown: "45 min",desc: "Harmonia do mago ├®lfico." },
      { name: "Boost Mana",         type: "Passivo",  rarity: "1Ôÿà", effect: "+12% Max MP",                    cooldown: "N/A",    desc: "Reserva m├ígica." }
    ]
  },

  // ÔöÇÔöÇÔöÇ SPELLSINGER (2┬¬ classe ÔÇö WATER/WIND) ÔöÇÔöÇÔöÇ
  spellsinger: {
    name: 'Spellsinger', parent: 'elvenWizard', stage: 2,
    desc: 'Cantor de magias, foco em ├ígua e vento. Skills anteriores permanecem.',
    base: { atk: 7, def: 13, hp: 170, mp: 250, eva: 7, crit: 5, matk: 72, mdef: 42 },
    skills: [
      { name: "Hydro Blast",          type: "Ativo",    rarity: "2Ôÿà", effect: "Dano ├ígua 300% + knockback",       cooldown: "15s",    desc: "Explos├úo h├¡drica." },
      { name: "Blizzard",             type: "Ativo",    rarity: "3Ôÿà", effect: "AoE gelo 340% + slow 30% 6s",      cooldown: "22s",    desc: "Nevasca." },
      { name: "Solar Flare",          type: "Ativo",    rarity: "3Ôÿà", effect: "Dano fogo 360% + blind 4s",        cooldown: "25s",    desc: "Explos├úo solar." },
      { name: "Elemental Symphony",   type: "Ativo",    rarity: "3Ôÿà", effect: "Dano multi-element 380%",          cooldown: "24s",    desc: "Sinfonia elemental." },
      { name: "Arcane Power",         type: "Self-Buff",rarity: "3Ôÿà", effect: "+40% M.ATK por 30s",               cooldown: "90s",    desc: "Poder arcano." },
      { name: "Freezing Skin",        type: "Self-Buff",rarity: "2Ôÿà", effect: "Atacantes recebem slow 20% 15s",   cooldown: "45s",    desc: "Pele congelante." },
      { name: "Cancel",               type: "Ativo",    rarity: "3Ôÿà", effect: "Remove 3 buffs do alvo",           cooldown: "40s",    desc: "Cancelamento." },
      { name: "Body to Mind",         type: "Ativo",    rarity: "2Ôÿà", effect: "Converte 15% HP em 30% MP",        cooldown: "30s",    desc: "Corpo em mente." },
      { name: "SS's Harmony",         type: "Self-Buff",rarity: "3Ôÿà", effect: "+35% M.ATK, +20% Cast Speed 25min",cooldown: "60 min", desc: "Harmonia do cantor." },
      { name: "Elemental Assault",    type: "Passivo",  rarity: "2Ôÿà", effect: "+12% elemental damage",            cooldown: "N/A",    desc: "Assalto elemental." }
    ]
  },

  // ÔöÇÔöÇÔöÇ MYSTIC MUSE (3┬¬ classe ÔÇö FOCO WATER) ÔöÇÔöÇÔöÇ
  mysticMuse: {
    name: 'Mystic Muse', parent: 'spellsinger', stage: 3,
    desc: 'Musa m├¡stica, mestre da magia aqu├ítica. Skills anteriores permanecem. Foco: WATER.',
    base: { atk: 9, def: 18, hp: 280, mp: 440, eva: 8, crit: 7, matk: 130, mdef: 68 },
    skills: [
      { name: "Aqua Splash",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano water 420% + AoE splash",             cooldown: "22s",    desc: "Respingo aqu├ítico massivo." },
      { name: "Water Spiral",                  type: "Ativo",    rarity: "3Ôÿà", effect: "Dano water 400% + penetra alvos",         cooldown: "20s",    desc: "Espiral de ├ígua perfurante." },
      { name: "Aqua Explosion",                type: "Ativo",    rarity: "4Ôÿà", effect: "Dano water AoE 680% + freeze 4s",         cooldown: "160s",   desc: "EXPLOS├âO AQU├üTICA ÔÇö devasta├º├úo total." },
      { name: "Seed of Water",                 type: "Ativo",    rarity: "2Ôÿà", effect: "Planta semente: explode 300% ├ígua ap├│s 5s",cooldown: "20s",   desc: "Semente de ├ígua." },
      { name: "Elemental Burst",               type: "Ativo",    rarity: "3Ôÿà", effect: "Explode Seeds: dano 500%",                cooldown: "18s",    desc: "Explos├úo elemental (combo Seeds)." },
      { name: "Elemental Storm",               type: "Ativo",    rarity: "3Ôÿà", effect: "AoE multi-element 440% (8 alvos)",        cooldown: "30s",    desc: "Tempestade elemental." },
      { name: "Mystic Immunity",               type: "Ativo",    rarity: "4Ôÿà", effect: "Imune a magia 8s",                        cooldown: "180s",   desc: "Imunidade m├¡stica." },
      { name: "Empowering Echo",               type: "Ativo",    rarity: "3Ôÿà", effect: "Pr├│xima skill: +50% dano",                cooldown: "45s",    desc: "Eco potencializador." },
      { name: "Transcendent Aqua Explosion",   type: "Ativo",    rarity: "4Ôÿà", effect: "Dano water 850% + freeze 6s + AoE",       cooldown: "200s",   desc: "Explos├úo aqu├ítica transcendente." },
      { name: "Mystic Muse Harmony",           type: "Self-Buff",rarity: "4Ôÿà", effect: "+55% M.ATK, +35% Cast Speed, +20% MP 30min",cooldown: "90 min",desc: "Harmonia da musa." },
      { name: "Master of Magic",               type: "Passivo",  rarity: "3Ôÿà", effect: "+10% M.ATK, +10% water dmg, +5% PvE",    cooldown: "N/A",    desc: "Mestre da magia." },
      { name: "Spell Mastery",                  type: "Passivo",  rarity: "3Ôÿà", effect: "+12% M. Skill Power",                    cooldown: "N/A",    desc: "Maestria em feiti├ºos." },
      { name: "Magic Focus",                    type: "Passivo",  rarity: "3Ôÿà", effect: "+8% M. Crit Rate",                       cooldown: "N/A",    desc: "Foco m├ígico." },
      { name: "Mystic Muse Spirit",            type: "Passivo",  rarity: "3Ôÿà", effect: "+15% water magic ATK",                    cooldown: "N/A",    desc: "Esp├¡rito da musa." },
      { name: "Body of the Mystic Muse",       type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max MP, +8% M.DEF",                 cooldown: "N/A",    desc: "Corpo da musa." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ELEMENTAL SUMMONER ÔåÆ ELEMENTAL MASTER ÔöÇÔöÇÔöÇ
  elementalSummoner: {
    name: 'Elemental Summoner', parent: 'elvenWizard', stage: 2,
    desc: 'Invocador elemental ├®lfico. Skills anteriores permanecem. Foco: SUMMON.',
    base: { atk: 6, def: 14, hp: 185, mp: 245, eva: 6, crit: 4, matk: 60, mdef: 40 },
    skills: [
      { name: "Summon Unicorn Boxer",   type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca unic├│rnio fighter (ATK 50%)",  cooldown: "60s",    desc: "Unic├│rnio lutador." },
      { name: "Summon Unicorn Mirage",  type: "Ativo",    rarity: "2Ôÿà", effect: "Invoca unic├│rnio mago (M.ATK 50%)",  cooldown: "60s",    desc: "Unic├│rnio ilus├│rio." },
      { name: "Summon Unicorn Merrow",  type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca merrow (ATK 65%, tank)",      cooldown: "90s",    desc: "Merrow aqu├ítico." },
      { name: "Servitor Heal",          type: "Ativo",    rarity: "2Ôÿà", effect: "Cura summon 35% HP",                 cooldown: "12s",    desc: "Cura do servitor." },
      { name: "Servitor Recharge",      type: "Ativo",    rarity: "2Ôÿà", effect: "Restaura 30% MP do summon",          cooldown: "15s",    desc: "Recarga do servitor." },
      { name: "Transfer Pain",          type: "Toggle",   rarity: "2Ôÿà", effect: "50% dano recebido vai pro summon",   cooldown: "N/A",    desc: "Transfer├¬ncia de dor." },
      { name: "Summon Life Cubic",      type: "Ativo",    rarity: "2Ôÿà", effect: "Cubic que cura 5%/5s",               cooldown: "45s",    desc: "Cubic vital." },
      { name: "ES's Harmony",           type: "Self-Buff",rarity: "3Ôÿà", effect: "+30% M.ATK, +25% Summon ATK 25min",  cooldown: "60 min", desc: "Harmonia do invocador." },
      { name: "Servitor Physical ATK",  type: "Passivo",  rarity: "2Ôÿà", effect: "+15% Summon ATK",                    cooldown: "N/A",    desc: "Poder do servitor." }
    ]
  },

  elementalMaster: {
    name: 'Elemental Master', parent: 'elementalSummoner', stage: 3,
    desc: 'Mestre elemental, invocador supremo ├®lfico. Skills anteriores permanecem.',
    base: { atk: 9, def: 20, hp: 300, mp: 420, eva: 7, crit: 5, matk: 115, mdef: 62 },
    skills: [
      { name: "Summon Seraphim",                type: "Ativo",    rarity: "3Ôÿà", effect: "Invoca Serafim (cura+suporte 60%)",        cooldown: "90s",    desc: "Serafim celestial." },
      { name: "Servitor Barrier",               type: "Ativo",    rarity: "3Ôÿà", effect: "Summon ganha escudo 5000 HP 15s",          cooldown: "60s",    desc: "Barreira do servitor." },
      { name: "Mass Servitor Heal",             type: "Ativo",    rarity: "3Ôÿà", effect: "Cura todos summons 40% HP",               cooldown: "25s",    desc: "Cura em massa." },
      { name: "Final Servitor",                 type: "Ativo",    rarity: "4Ôÿà", effect: "Summon sacrifica: AoE 600% + cura 50%",    cooldown: "180s",   desc: "Sacrif├¡cio final." },
      { name: "Transcendent Summon Burst",      type: "Ativo",    rarity: "4Ôÿà", effect: "Todos summons atacam: 800% total",        cooldown: "200s",   desc: "Explos├úo de invoca├º├Áes." },
      { name: "Elemental Master Harmony",       type: "Self-Buff",rarity: "4Ôÿà", effect: "+50% M.ATK, +60% Summon Power 30min",     cooldown: "90 min", desc: "Harmonia suprema." },
      { name: "Unicorn's Friendship",           type: "Passivo",  rarity: "3Ôÿà", effect: "+20% Summon ATK/DEF",                     cooldown: "N/A",    desc: "Amizade dos unic├│rnios." },
      { name: "Elemental Concentration",        type: "Passivo",  rarity: "3Ôÿà", effect: "+10% M.ATK, +10% Summon HP",              cooldown: "N/A",    desc: "Concentra├º├úo elemental." },
      { name: "Elemental Master Spirit",        type: "Passivo",  rarity: "3Ôÿà", effect: "+12% M.ATK, +8% Summon Speed",            cooldown: "N/A",    desc: "Esp├¡rito do mestre elemental." },
      { name: "Body of the Elemental Master",   type: "Passivo",  rarity: "3Ôÿà", effect: "+10% Max MP, +8% Max HP",                cooldown: "N/A",    desc: "Corpo do mestre." }
    ]
  },

  // ÔöÇÔöÇÔöÇ ORACLE ÔåÆ ELDER ÔåÆ EVA'S SAINT ÔöÇÔöÇÔöÇ
  elfOracle: {
    name: 'Oracle', parent: 'elfMage', race: 'elf', archetype: 'healer', stage: 1,
    desc: 'Or├ículo ├®lfico curador. Skills anteriores permanecem.',
    base: { atk: 6, def: 12, hp: 110, mp: 115, eva: 5, crit: 3, matk: 20, mdef: 25 },
    skills: [
      { name: "Heal",          type: "Ativo",      rarity: "1Ôÿà", effect: "Cura 25% HP alvo",              cooldown: "8s",     desc: "Cura b├ísica." },
      { name: "Battle Heal",   type: "Ativo",      rarity: "1Ôÿà", effect: "Cura 20% HP + remove 1 debuff", cooldown: "10s",    desc: "Cura de combate." },
      { name: "Might",         type: "Party-Buff", rarity: "1Ôÿà", effect: "+15% ATK party 10 min",         cooldown: "25 min", desc: "B├¬n├º├úo de for├ºa." },
      { name: "Shield (Buff)", type: "Party-Buff", rarity: "1Ôÿà", effect: "+15% DEF party 10 min",         cooldown: "25 min", desc: "B├¬n├º├úo de prote├º├úo." },
      { name: "Cure Poison",   type: "Ativo",      rarity: "1Ôÿà", effect: "Remove poison",                 cooldown: "5s",     desc: "Cura veneno." },
      { name: "Cure Bleed",    type: "Ativo",      rarity: "1Ôÿà", effect: "Remove bleed",                  cooldown: "5s",     desc: "Estanca sangramento." },
      { name: "Recharge",      type: "Ativo",      rarity: "1Ôÿà", effect: "Restaura 20% MP alvo",          cooldown: "12s",    desc: "Recarga de mana." }
    ]
  },

  elfElder: {
    name: 'Elder', parent: 'elfOracle', stage: 2,
    desc: 'Anci├úo ├®lfico, curador e buffer. Skills anteriores permanecem.',
    base: { atk: 8, def: 25, hp: 240, mp: 210, eva: 5, crit: 3, matk: 45, mdef: 55 },
    skills: [
      { name: "Greater Heal",       type: "Ativo",      rarity: "2Ôÿà", effect: "Cura 40% HP alvo",                    cooldown: "10s",    desc: "Cura avan├ºada." },
      { name: "Greater Group Heal", type: "Ativo",      rarity: "3Ôÿà", effect: "Cura 30% HP party",                   cooldown: "18s",    desc: "Cura em grupo." },
      { name: "Resurrection",       type: "Ativo",      rarity: "3Ôÿà", effect: "Ressuscita aliado 30% HP",            cooldown: "120s",   desc: "Ressurrei├º├úo." },
      { name: "Purify",             type: "Ativo",      rarity: "2Ôÿà", effect: "Remove 3 debuffs",                    cooldown: "20s",    desc: "Purifica├º├úo." },
      { name: "Cleanse",            type: "Ativo",      rarity: "3Ôÿà", effect: "Remove TODOS debuffs",                cooldown: "45s",    desc: "Limpeza total." },
      { name: "Empower",            type: "Self-Buff",  rarity: "2Ôÿà", effect: "+25% M.ATK por 20 min",               cooldown: "50 min", desc: "Empoderamento." },
      { name: "Acumen",             type: "Self-Buff",  rarity: "2Ôÿà", effect: "+25% Cast Speed por 20 min",          cooldown: "50 min", desc: "Acuidade." },
      { name: "Haste",              type: "Self-Buff",  rarity: "2Ôÿà", effect: "+30% ATK Speed por 20 min",           cooldown: "50 min", desc: "Acelera├º├úo." },
      { name: "Clarity",            type: "Self-Buff",  rarity: "2Ôÿà", effect: "+20% MP Regen por 20 min",            cooldown: "50 min", desc: "Clareza m├ígica." },
      { name: "Prophecy of Water",  type: "Party-Buff", rarity: "3Ôÿà", effect: "+30% M.ATK, +20% M.DEF party 12min",  cooldown: "30 min", desc: "Profecia da ├ígua." },
      { name: "Mental Shield",      type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% M.DEF party 12 min",            cooldown: "30 min", desc: "Escudo mental." },
      { name: "Elder's Harmony",    type: "Self-Buff",  rarity: "3Ôÿà", effect: "+35% Heal, +25% M.ATK 25min",        cooldown: "60 min", desc: "Harmonia do anci├úo." },
      { name: "Resist Aqua",        type: "Passivo",    rarity: "1Ôÿà", effect: "+10% Water Resist",                   cooldown: "N/A",    desc: "Resist├¬ncia aqu├ítica." }
    ]
  },

  evaSaint: {
    name: "Eva's Saint", parent: 'elfElder', stage: 3,
    desc: 'Santa de Eva, curadora suprema ├®lfica. Skills anteriores permanecem.',
    base: { atk: 10, def: 40, hp: 400, mp: 470, eva: 6, crit: 4, matk: 90, mdef: 95 },
    skills: [
      { name: "Sublime Self-Sacrifice",        type: "Ativo",      rarity: "4Ôÿà", effect: "Morre para curar party 100% HP+MP",    cooldown: "300s",   desc: "Auto-sacrif├¡cio." },
      { name: "Balance Life",                  type: "Ativo",      rarity: "3Ôÿà", effect: "Equaliza HP de toda party",             cooldown: "60s",    desc: "Equil├¡brio vital." },
      { name: "Mass Resurrection",             type: "Ativo",      rarity: "4Ôÿà", effect: "Ressuscita toda party 40% HP",         cooldown: "300s",   desc: "Ressurrei├º├úo em massa." },
      { name: "Miracle",                       type: "Ativo",      rarity: "4Ôÿà", effect: "Cura party 80% HP + ressurge mortos",  cooldown: "300s",   desc: "Milagre." },
      { name: "Blessing of Eva",               type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% M.DEF + resist debuff 12min",     cooldown: "30 min", desc: "B├¬n├º├úo de Eva." },
      { name: "Dark Side",                     type: "Toggle",     rarity: "3Ôÿà", effect: "Troca: -60% Heal, +80% M.ATK holy",    cooldown: "N/A",    desc: "Lado sombrio." },
      { name: "Aqua Strike",                   type: "Ativo",      rarity: "3Ôÿà", effect: "Dano water 380% + slow 40% 6s",        cooldown: "22s",    desc: "Golpe aqu├ítico." },
      { name: "Divine Nova",                   type: "Ativo",      rarity: "3Ôÿà", effect: "Dano holy AoE 450% + blind 5s",        cooldown: "25s",    desc: "Nova divina." },
      { name: "Eva's Saint Harmony",           type: "Self-Buff",  rarity: "4Ôÿà", effect: "+55% Heal, +40% M.ATK, +30% M.DEF 30min",cooldown: "90 min",desc: "Harmonia suprema." },
      { name: "Master of Healing",             type: "Passivo",    rarity: "3Ôÿà", effect: "+15% Heal Power, +5% PvE",            cooldown: "N/A",    desc: "Mestre da cura." },
      { name: "Eva's Saint Spirit",            type: "Passivo",    rarity: "3Ôÿà", effect: "+12% holy magic ATK",                  cooldown: "N/A",    desc: "Esp├¡rito da santa." },
      { name: "Body of Eva's Saint",           type: "Passivo",    rarity: "3Ôÿà", effect: "+12% Max MP, +10% M.DEF",             cooldown: "N/A",    desc: "Corpo da santa." },
      { name: "Eva's Help",                    type: "Passivo",    rarity: "3Ôÿà", effect: "10% chance ao ser atacado: cura 5% HP",cooldown: "N/A",    desc: "Ajuda de Eva (trigger)." }
    ]
  },


  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  DARK ELF FIGHTER
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
darkElfFighter: {
name: 'Dark Elf Fighter', race: 'darkelf', archetype: 'fighter', stage: 0,
desc: 'Lutador sombrio com afinidade natural para dano cr├¡tico.',
base: { atk: 11, def: 6, hp: 85, mp: 32, eva: 8, crit: 8, mdef: 5 },
skills: [
{ name: "Power Strike", type: "Ativo", rarity: "1Ôÿà", effect: "Dano f├¡sico 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Mortal Blow", type: "Ativo", rarity: "1Ôÿà", effect: "Dano 130% + 20% crit b├┤nus", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Power Shot", type: "Ativo", rarity: "1Ôÿà", effect: "Dano ├á dist├óncia 140%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Bandage", type: "Ativo", rarity: "1Ôÿà", effect: "Recupera 15% HP", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "HP Increase", type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% DEF com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Dark Spirit", type: "Self-Buff", rarity: "1Ôÿà", effect: "+10% ATK e +8% Crit por 15 min", cooldown: "30 min", duration: "15 min", note: "Skill permanece ap├│s trocar de classe" }
]
},

// ÔöÇÔöÇÔöÇ PALUS KNIGHT (1┬¬ classe) ÔöÇÔöÇÔöÇ
palusKnight: {
name: 'Palus Knight', parent: 'darkElfFighter', race: 'darkelf', archetype: 'tank', stage: 1,
desc: 'Cavaleiro sombrio com escudo e poder dark.',
base: { atk: 18, def: 26, hp: 210, mp: 52, eva: 10, crit: 6, mdef: 14 },
skills: [
{ name: "Shield Strike", type: "Ativo", rarity: "1Ôÿà", effect: "Dano 160% + taunt 8s", cooldown: "12s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Hate", type: "Ativo", rarity: "1Ôÿà", effect: "Taunt alvo + aggro m├íximo", cooldown: "10s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Power Break", type: "Ativo", rarity: "1Ôÿà", effect: "Dano 140% + reduz ATK 15%", cooldown: "14s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shield Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com escudo", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Heavy Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Sword/Blunt Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com espada/ma├ºa", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Deflect Arrow", type: "Passivo", rarity: "1Ôÿà", effect: "+15% chance esquivar proj├®teis", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
]
},

// ÔöÇÔöÇÔöÇ SHILLIEN KNIGHT (2┬¬ classe) ÔöÇÔöÇÔöÇ
shillienKnight: {
name: 'Shillien Knight', parent: 'palusKnight', race: 'darkelf', archetype: 'tank', stage: 2,
desc: 'Cavaleiro de Shillien com dreno e terror.',
base: { atk: 38, def: 58, hp: 430, mp: 82, eva: 12, crit: 8, mdef: 36 },
skills: [
{ name: "Shield Stun", type: "Ativo", rarity: "2Ôÿà", effect: "Dano 200% + stun 3s", cooldown: "20s", duration: "3s stun", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Judgment", type: "Ativo", rarity: "3Ôÿà", effect: "Dano dark 300% + reduz heal 50%", cooldown: "28s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Dark Flame", type: "Ativo", rarity: "2Ôÿà", effect: "Dano AoE dark 260%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Drain Health", type: "Ativo", rarity: "2Ôÿà", effect: "Dano 220% + drain 30% HP", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Horror", type: "Ativo", rarity: "2Ôÿà", effect: "Medo alvo 4s", cooldown: "30s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Lightning Strike", type: "Ativo", rarity: "2Ôÿà", effect: "Dano el├®trico 240% + stun 1s", cooldown: "16s", duration: "1s stun", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Touch of Death", type: "Ativo", rarity: "2Ôÿà", effect: "Dano dark 240% + poison", cooldown: "18s", duration: "6s poison", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Sacrifice", type: "Ativo", rarity: "2Ôÿà", effect: "Transfere 30% HP para aliado", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Aegis", type: "Ativo", rarity: "2Ôÿà", effect: "+50% Block Rate por 15s", cooldown: "45s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Ultimate Defense", type: "Ativo", rarity: "3Ôÿà", effect: "+80% DEF, im├│vel, 10s", cooldown: "120s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Provoke", type: "Ativo", rarity: "1Ôÿà", effect: "Taunt 10s", cooldown: "15s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Summon Dark Cubic", type: "Ativo", rarity: "2Ôÿà", effect: "Cubo dark que ataca 130%/6s", cooldown: "45s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Boost HP", type: "Passivo", rarity: "1Ôÿà", effect: "+15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shillien Knight's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% DEF, +25% ATK, +20% Dark Damage por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
]
},

// ÔöÇÔöÇÔöÇ SHILLIEN TEMPLAR (3┬¬ classe) ÔöÇÔöÇÔöÇ
shillienTemplar: {
name: 'Shillien Templar', parent: 'shillienKnight', race: 'darkelf', archetype: 'tank', stage: 3,
desc: 'Templ├írio de Shillien ÔÇö tanque sombrio com AoE devastador.',
base: { atk: 70, def: 92, hp: 720, mp: 120, eva: 16, crit: 10, mdef: 60 },
skills: [
{ name: "Touch of Shillien", type: "Ativo", rarity: "3Ôÿà", effect: "Dano dark 350% + drain 35% HP", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shield of Shillien", type: "Ativo", rarity: "3Ôÿà", effect: "Absorve 5000 dano + reflete 20% dark por 15s", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Celestial Shield", type: "Ativo", rarity: "4Ôÿà", effect: "Imunidade total 7s + taunt AoE", cooldown: "180s", duration: "7s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Abyss Strike", type: "Ativo", rarity: "3Ôÿà", effect: "Dano dark AoE 400% + slow 40%", cooldown: "25s", duration: "5s slow", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shillien's Curse", type: "Ativo", rarity: "3Ôÿà", effect: "Dano dark AoE 360% + reduz DEF 20%", cooldown: "28s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Summon Guardian Agathion", type: "Ativo", rarity: "3Ôÿà", effect: "Agathion protetor (+15% DEF party)", cooldown: "90s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Transcendent Abyss Strike", type: "Ativo", rarity: "4Ôÿà", effect: "Dano dark AoE 600% + fear 3s + drain 30%", cooldown: "160s", duration: "3s fear", note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shillien's Help", type: "Passivo", rarity: "3Ôÿà", effect: "Ao bloquear: 20% chance contra-ataque dark 200%", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shillien Templar Spirit", type: "Passivo", rarity: "3Ôÿà", effect: "+25% DEF, +20% Max HP, +15% Dark Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Body of Shillien Templar", type: "Passivo", rarity: "3Ôÿà", effect: "+20% Dark Resist, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Protection of Shillien", type: "Passivo", rarity: "3Ôÿà", effect: "+15% All Resist", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Master of Combat", type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
{ name: "Shillien Templar Harmony", type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% DEF, +40% Max HP, +30% Dark Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
]
},

  // ÔöÇÔöÇÔöÇ BLADE DANCER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  bladeDancer: {
    name: 'Blade Dancer', parent: 'palusKnight', race: 'darkelf', archetype: 'bard', stage: 2,
    desc: 'Dan├ºarino de l├óminas ÔÇö dan├ºas que fortalecem aliados.',
    base: { atk: 42, def: 38, hp: 340, mp: 115, eva: 14, crit: 10, mdef: 28 },
    skills: [
      { name: "Dance of Fire",          type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% ATK para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Fury",          type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% ATK Speed para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Concentration", type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% Cast Speed para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Light",         type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Crit Rate para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Mystic",        type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% M.ATK para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Warrior",       type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% P.ATK e DEF para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Aqua Guard",    type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% Water Resist para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Inspiration",   type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% All Stats para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Vampire",       type: "Party-Buff", rarity: "3Ôÿà", effect: "Drain 8% dano causado como HP para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Protection",    type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% DEF para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Shadow",        type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% EVA para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Siren",         type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% MP Regen para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dual Weapon Mastery",    type: "Passivo",    rarity: "1Ôÿà", effect: "+15% ATK com dual swords", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Heavy Armor Mastery",    type: "Passivo",    rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",               type: "Passivo",    rarity: "1Ôÿà", effect: "+15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blade Dancer's Harmony", type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% ATK, +20% ATK Speed, +15% EVA por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SPECTRAL DANCER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  spectralDancer: {
    name: 'Spectral Dancer', parent: 'bladeDancer', race: 'darkelf', archetype: 'bard', stage: 3,
    desc: 'Dan├ºarina espectral ÔÇö dan├ºas supremas e ataques devastadores.',
    base: { atk: 78, def: 55, hp: 520, mp: 180, eva: 22, crit: 16, mdef: 42 },
    skills: [
      { name: "Dance of Berserker",          type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% ATK, +20% ATK Speed, -10% DEF para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dance of Blade Storm",        type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% Crit Power para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Dance",                  type: "Ativo",      rarity: "3Ôÿà", effect: "Ativa todas as dan├ºas ativas por 60s", cooldown: "120s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Dance",                 type: "Ativo",      rarity: "4Ôÿà", effect: "Todas as dan├ºas em pot├¬ncia m├íxima por 30s + imunidade debuff", cooldown: "300s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shadow Slash",                type: "Ativo",      rarity: "3Ôÿà", effect: "Dano dark 380% + bleed 6s", cooldown: "18s", duration: "6s bleed", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Dance Strike",           type: "Ativo",      rarity: "3Ôÿà", effect: "Dano AoE dark 420% + slow 40% 5s", cooldown: "25s", duration: "5s slow", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Dance",          type: "Ativo",      rarity: "4Ôÿà", effect: "Dano AoE dark 580% + silence 4s", cooldown: "160s", duration: "4s silence", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spectral Dancer Spirit",      type: "Passivo",    rarity: "3Ôÿà", effect: "+20% ATK, +15% EVA, +15% Dark Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Spectral Dancer",     type: "Passivo",    rarity: "3Ôÿà", effect: "+15% Crit Rate, +10% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo",    rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spectral Dancer Harmony",     type: "Self-Buff",  rarity: "4Ôÿà", effect: "+50% ATK, +35% ATK Speed, +30% EVA por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ ASSASSIN DE (1┬¬ classe ÔÇö Dark Elf) ÔöÇÔöÇÔöÇ
  assassinDE: {
    name: 'Assassin', parent: 'darkElfFighter', race: 'darkelf', archetype: 'dagger', stage: 1,
    desc: 'Assassino das sombras ÔÇö mestre em emboscadas e venenos.',
    base: { atk: 24, def: 10, hp: 140, mp: 42, eva: 18, crit: 14, mdef: 6 },
    skills: [
      { name: "Double Strike",           type: "Ativo",   rarity: "1Ôÿà", effect: "Dano duplo 170% (2 hits)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Backstab",              type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 200% por tr├ís + crit garantido", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dash",                  type: "Ativo",   rarity: "1Ôÿà", effect: "+60% Move Speed por 6s", cooldown: "20s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery",   type: "Passivo", rarity: "1Ôÿà", effect: "+10% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dagger Mastery",        type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com adagas", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Critical Chance",       type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ ABYSS WALKER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  abyssWalker: {
    name: 'Abyss Walker', parent: 'assassinDE', race: 'darkelf', archetype: 'dagger', stage: 2,
    desc: 'Caminhante do Abismo ÔÇö golpes fatais nas sombras.',
    base: { atk: 52, def: 18, hp: 260, mp: 68, eva: 32, crit: 26, mdef: 14 },
    skills: [
      { name: "Deadly Blow",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 280% + crit garantido por tr├ís", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lethal Blow",      type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 350% + 10% chance kill instant├óneo (PvE)", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sand Bomb",        type: "Ativo",   rarity: "2Ôÿà", effect: "Blind AoE 5s", cooldown: "25s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blinding Blow",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 240% + blind 4s", cooldown: "18s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Switch",           type: "Ativo",   rarity: "2Ôÿà", effect: "Teleporta atr├ís do alvo", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shadow Step",      type: "Ativo",   rarity: "2Ôÿà", effect: "Teleporta para alvo + dano 180%", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Trick",            type: "Ativo",   rarity: "2Ôÿà", effect: "Remove alvo de mob + reduz aggro", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Silent Move",      type: "Toggle",  rarity: "2Ôÿà", effect: "Invisibilidade (move lento), cancela ao atacar", cooldown: "5s", duration: "Toggle", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Evasion",          type: "Passivo", rarity: "1Ôÿà", effect: "+12% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Critical Power",   type: "Passivo", rarity: "2Ôÿà", effect: "+20% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",            type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Abyss Walker's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% EVA por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ GHOST HUNTER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  ghostHunter: {
    name: 'Ghost Hunter', parent: 'abyssWalker', race: 'darkelf', archetype: 'dagger', stage: 3,
    desc: 'Ca├ºador fantasma ÔÇö o assassino definitivo das sombras.',
    base: { atk: 98, def: 28, hp: 420, mp: 105, eva: 52, crit: 42, mdef: 22 },
    skills: [
      { name: "Exciting Adventure",       type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 380% + reset cooldown de Deadly Blow", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Riding",              type: "Ativo",    rarity: "3Ôÿà", effect: "+80% Move Speed + invisibilidade 8s", cooldown: "60s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lucky Strike",             type: "Ativo",    rarity: "3Ôÿà", effect: "Dano 420% + 20% chance drop extra", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Deadly Blow",  type: "Ativo",    rarity: "4Ôÿà", effect: "Dano 620% + ignore DEF + bleed 8s", cooldown: "160s", duration: "8s bleed", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shadow Sense",             type: "Passivo",  rarity: "3Ôÿà", effect: "+25% Crit Rate ├á noite ou em dungeon", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Frenzy",             type: "Passivo",  rarity: "3Ôÿà", effect: "+30% ATK quando HP < 30%", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ghost Hunter Spirit",      type: "Passivo",  rarity: "3Ôÿà", effect: "+20% ATK, +20% Crit Power, +15% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Ghost Hunter",     type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Max HP, +10% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",         type: "Passivo",  rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ghost Hunter Harmony",     type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +35% EVA por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ PHANTOM RANGER (2┬¬ classe ÔÇö Archer) ÔöÇÔöÇÔöÇ
  phantomRanger: {
    name: 'Phantom Ranger', parent: 'assassinDE', race: 'darkelf', archetype: 'archer', stage: 2,
    desc: 'Atirador fantasma ÔÇö flechas envenenadas e precisas.',
    base: { atk: 58, def: 15, hp: 230, mp: 62, eva: 22, crit: 22, mdef: 10 },
    skills: [
      { name: "Double Shot",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% (2 hits)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Burst Shot",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + knockback", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stun Shot",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 200% + stun 2s", cooldown: "18s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rapid Fire",       type: "Ativo",   rarity: "2Ôÿà", effect: "+50% ATK Speed por 15s", cooldown: "45s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Arrow Rain",       type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 300%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Hex Shot",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% + curse (reduz DEF 20%)", cooldown: "16s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bow Mastery",      type: "Passivo", rarity: "1Ôÿà", effect: "+15% ATK com arco", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Long Shot",        type: "Passivo", rarity: "2Ôÿà", effect: "+30% Range", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",            type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Critical Power",   type: "Passivo", rarity: "2Ôÿà", effect: "+20% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Evasion",          type: "Passivo", rarity: "1Ôÿà", effect: "+12% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Phantom Ranger's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% Range por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ GHOST SENTINEL (3┬¬ classe) ÔöÇÔöÇÔöÇ
  ghostSentinel: {
    name: 'Ghost Sentinel', parent: 'phantomRanger', race: 'darkelf', archetype: 'archer', stage: 3,
    desc: 'Sentinela fantasma ÔÇö atirador de elite com flechas elementais.',
    base: { atk: 108, def: 22, hp: 380, mp: 95, eva: 38, crit: 45, mdef: 18 },
    skills: [
      { name: "Seven Arrow",                   type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 420% (7 hits)", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dead Eye",                      type: "Self-Buff", rarity: "3Ôÿà", effect: "+50% ATK, +40% Range por 18 min", cooldown: "55 min", duration: "18 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Pinpoint Shot",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% + ignore DEF", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Triple Shot",                   type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 340% (3 hits r├ípidos)", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Thorn Shot",                    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + bleed 6s", cooldown: "12s", duration: "6s bleed", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Binding Shot",                  type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% + root 4s", cooldown: "18s", duration: "4s root", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Shot",                     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano vento 280% + knockback", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spiral Shot",                   type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 400% + penetra m├║ltiplos alvos", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Target Lock",                   type: "Ativo",   rarity: "3Ôÿà", effect: "Marca alvo: +30% dano contra ele por 10s", cooldown: "35s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Seven Arrow",      type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 650% (7 hits) + elemental AoE", cooldown: "160s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ghost Sentinel Spirit",         type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +20% Crit Power, +15% Range", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Ghost Sentinel",        type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP, +10% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",              type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ghost Sentinel Harmony",        type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +35% Range por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  //  DARK ELF MAGE
  // ÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûôÔûô
  darkElfMage: {
    name: 'Dark Elf Mage', race: 'darkelf', archetype: 'mage', stage: 0,
    desc: 'Mago sombrio com magia negra poderosa.',
    base: { atk: 5, def: 5, hp: 65, mp: 95, matk: 14, mdef: 8, eva: 4, crit: 4 },
    skills: [
      { name: "Wind Strike",    type: "Ativo",   rarity: "1Ôÿà", effect: "Dano vento m├ígico 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Self Heal",      type: "Ativo",   rarity: "1Ôÿà", effect: "Recupera 20% HP", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ice Bolt",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano gelo 140% + slow 15% 3s", cooldown: "10s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sleep",          type: "Ativo",   rarity: "1Ôÿà", effect: "Adormece alvo 8s (cancela ao tomar dano)", cooldown: "25s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Robe Mastery",   type: "Passivo", rarity: "1Ôÿà", effect: "+10% M.ATK com robe", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "MP Increase",    type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Mage's Will", type: "Self-Buff", rarity: "1Ôÿà", effect: "+10% M.ATK e +8% Cast Speed por 15 min", cooldown: "30 min", duration: "15 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DARK WIZARD (1┬¬ classe) ÔöÇÔöÇÔöÇ
  darkWizard: {
    name: 'Dark Wizard', parent: 'darkElfMage', race: 'darkelf', archetype: 'mage', stage: 1,
    desc: 'Mago sombrio com magia elemental e dreno de vida.',
    base: { atk: 6, def: 8, hp: 95, mp: 145, matk: 28, mdef: 16, eva: 5, crit: 4 },
    skills: [
      { name: "Twister",          type: "Ativo",   rarity: "1Ôÿà", effect: "Dano vento 190%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Flame Strike",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano fogo 240%", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Life Drain",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano dark 200% + drain 25% como HP", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost Mana",       type: "Passivo", rarity: "1Ôÿà", effect: "+15% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Wizard's Harmony", type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% M.ATK, +15% Cast Speed por 20 min", cooldown: "50 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SPELLHOWLER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  spellhowler: {
    name: 'Spellhowler', parent: 'darkWizard', race: 'darkelf', archetype: 'mage', stage: 2,
    desc: 'Mago do vento sombrio ÔÇö devasta├º├úo elemental com foco em Wind.',
    base: { atk: 8, def: 14, hp: 160, mp: 260, matk: 68, mdef: 38, eva: 8, crit: 6 },
    skills: [
      { name: "Tempest",          type: "Ativo",   rarity: "3Ôÿà", effect: "Dano vento AoE 320%", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Hurricane",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano vento 280%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Arcane Power",     type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% M.ATK, -15% Cast Time por 60s", cooldown: "120s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cancel",           type: "Ativo",   rarity: "3Ôÿà", effect: "Remove 3 buffs do alvo", cooldown: "45s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body to Mind",     type: "Ativo",   rarity: "2Ôÿà", effect: "Converte 20% HP em MP", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Elemental Assault",type: "Passivo", rarity: "2Ôÿà", effect: "+15% Elemental Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spellhowler's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% M.ATK, +25% Cast Speed, +15% Wind Damage por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ STORM SCREAMER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  stormScreamer: {
    name: 'Storm Screamer', parent: 'spellhowler', race: 'darkelf', archetype: 'mage', stage: 3,
    desc: 'Arauto da tempestade ÔÇö mago devastador com foco em vento e trov├úo.',
    base: { atk: 12, def: 22, hp: 280, mp: 420, matk: 122, mdef: 62, eva: 12, crit: 8 },
    skills: [
      { name: "Demon Wind",                  type: "Ativo",   rarity: "3Ôÿà", effect: "Dano vento 400% + knockback", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Elemental Burst",              type: "Ativo",   rarity: "3Ôÿà", effect: "Dano elemental 380% + explode seed", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Elemental Storm",              type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE 480% + all elements", cooldown: "45s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seed of Wind",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Marca alvo: +25% Wind Damage recebido 10s", cooldown: "20s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Spiral",                  type: "Ativo",   rarity: "3Ôÿà", effect: "Dano vento 360% + penetra alvos em linha", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Thunder Explosion",            type: "Ativo",   rarity: "4Ôÿà", effect: "Dano trov├úo AoE 520% (2 hits) + stun 2s", cooldown: "35s", duration: "2s stun", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mystic Immunity",              type: "Ativo",   rarity: "4Ôÿà", effect: "Imunidade a magia 8s", cooldown: "180s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Empowering Echo",              type: "Ativo",   rarity: "3Ôÿà", effect: "+40% M.ATK por 20s ap├│s kill", cooldown: "60s", duration: "20s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Thunder Explosion", type: "Ativo", rarity: "4Ôÿà", effect: "Dano trov├úo AoE 720% (3 hits) + paralysis 3s", cooldown: "180s", duration: "3s paralysis", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spell Mastery",                type: "Passivo", rarity: "3Ôÿà", effect: "+15% M.ATK, +10% Magic Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Magic Focus",                  type: "Passivo", rarity: "3Ôÿà", effect: "+5% M.Skill Power, +10% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mastery (Rare)",               type: "Passivo", rarity: "4Ôÿà", effect: "+10% M.Skill Power, +15% PvE Damage, +15% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Storm Screamer Spirit",        type: "Passivo", rarity: "3Ôÿà", effect: "+20% M.ATK, +15% Wind Damage, +10% Cast Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Storm Screamer",       type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max MP, +10% MP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Storm Screamer Harmony",       type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% M.ATK, +40% Cast Speed, +30% Wind Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ PHANTOM SUMMONER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  phantomSummoner: {
    name: 'Phantom Summoner', parent: 'darkWizard', race: 'darkelf', archetype: 'summoner', stage: 2,
    desc: 'Invocador sombrio ÔÇö invoca criaturas das trevas para lutar.',
    base: { atk: 8, def: 16, hp: 180, mp: 240, matk: 58, mdef: 35, eva: 6, crit: 4 },
    skills: [
      { name: "Summon Nightmare",       type: "Ativo",   rarity: "2Ôÿà", effect: "Invoca Nightmare (ATK alto, tanque m├®dio)", cooldown: "45s", duration: "Permanente", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Wraith",          type: "Ativo",   rarity: "2Ôÿà", effect: "Invoca Wraith (ATK m├®dio, drain HP)", cooldown: "45s", duration: "Permanente", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Spectral Lord",   type: "Ativo",   rarity: "3Ôÿà", effect: "Invoca Spectral Lord (AoE + tanque)", cooldown: "60s", duration: "Permanente", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Servitor Heal",          type: "Ativo",   rarity: "1Ôÿà", effect: "Cura summon 30% HP", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Servitor Recharge",      type: "Ativo",   rarity: "1Ôÿà", effect: "Restaura MP do summon", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transfer Pain",          type: "Toggle",  rarity: "2Ôÿà", effect: "50% dano recebido transferido ao summon", cooldown: "5s", duration: "Toggle", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Binding Cubic",   type: "Ativo",   rarity: "2Ôÿà", effect: "Cubo que d├í root 3s a cada 10s", cooldown: "45s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Phantom Cubic",   type: "Ativo",   rarity: "2Ôÿà", effect: "Cubo dark que ataca 150%/8s", cooldown: "45s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Servitor Physical Attack", type: "Passivo", rarity: "2Ôÿà", effect: "+20% ATK dos summons", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Phantom Summoner's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% Summon Power, +20% M.ATK por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SPECTRAL MASTER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  spectralMaster: {
    name: 'Spectral Master', parent: 'phantomSummoner', race: 'darkelf', archetype: 'summoner', stage: 3,
    desc: 'Mestre espectral ÔÇö summons supremos das trevas.',
    base: { atk: 12, def: 24, hp: 300, mp: 380, matk: 105, mdef: 58, eva: 10, crit: 6 },
    skills: [
      { name: "Summon Spectral Lord (Enhanced)", type: "Ativo", rarity: "3Ôÿà", effect: "Spectral Lord aprimorado (+50% ATK/HP)", cooldown: "90s", duration: "Permanente", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Servitor Barrier",            type: "Ativo",    rarity: "3Ôÿà", effect: "Escudo no summon: absorve 3000 dano", cooldown: "45s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Servitor Heal",          type: "Ativo",    rarity: "3Ôÿà", effect: "Cura todos os summons 40%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Servitor",              type: "Ativo",    rarity: "4Ôÿà", effect: "Summon sacrifica-se: dano AoE 600% + heal dono 50%", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Summon Burst",   type: "Ativo",    rarity: "4Ôÿà", effect: "Todos os summons atacam juntos: dano 700% AoE", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spectral Master Spirit",      type: "Passivo",  rarity: "3Ôÿà", effect: "+25% Summon Power, +15% M.ATK", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Spectral Master", type: "Passivo",  rarity: "3Ôÿà", effect: "+15% Max HP/MP, +10% MP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo",  rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spectral Master Harmony",     type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% Summon Power, +40% M.ATK por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SHILLIEN ORACLE (1┬¬ classe) ÔöÇÔöÇÔöÇ
  shillienOracle: {
    name: 'Shillien Oracle', parent: 'darkElfMage', race: 'darkelf', archetype: 'healer', stage: 1,
    desc: 'Or├ículo de Shillien ÔÇö cura e prote├º├úo sombria.',
    base: { atk: 6, def: 12, hp: 110, mp: 130, matk: 22, mdef: 22, eva: 5, crit: 4 },
    skills: [
      { name: "Heal",            type: "Ativo",   rarity: "1Ôÿà", effect: "Cura 250% M.ATK", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Battle Heal",     type: "Ativo",   rarity: "1Ôÿà", effect: "Cura r├ípida 180% M.ATK", cooldown: "5s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Might",           type: "Party-Buff", rarity: "1Ôÿà", effect: "+10% ATK para o grupo", cooldown: "20s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shield",          type: "Party-Buff", rarity: "1Ôÿà", effect: "+10% DEF para o grupo", cooldown: "20s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cure Poison",     type: "Ativo",   rarity: "1Ôÿà", effect: "Remove poison", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cure Bleed",      type: "Ativo",   rarity: "1Ôÿà", effect: "Remove bleed", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Recharge",        type: "Ativo",   rarity: "1Ôÿà", effect: "Restaura 20% MP do alvo", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SHILLIEN ELDER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  shillienElder: {
    name: 'Shillien Elder', parent: 'shillienOracle', race: 'darkelf', archetype: 'healer', stage: 2,
    desc: 'Anci├ú de Shillien ÔÇö cura, buffs e magia dark ofensiva.',
    base: { atk: 8, def: 22, hp: 200, mp: 260, matk: 48, mdef: 50, eva: 8, crit: 4 },
    skills: [
      { name: "Greater Heal",     type: "Ativo",     rarity: "2Ôÿà", effect: "Cura forte 400% M.ATK", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Greater Group Heal", type: "Ativo",   rarity: "3Ôÿà", effect: "Cura grupo 300% M.ATK", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Resurrection",     type: "Ativo",     rarity: "3Ôÿà", effect: "Ressuscita aliado com 30% HP/MP", cooldown: "120s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Purify",           type: "Ativo",     rarity: "2Ôÿà", effect: "Remove 2 debuffs", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cleanse",          type: "Ativo",     rarity: "3Ôÿà", effect: "Remove todos os debuffs", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Empower",          type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% M.ATK para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Acumen",           type: "Party-Buff", rarity: "2Ôÿà", effect: "+20% Cast Speed para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Vampiric Rage",    type: "Party-Buff", rarity: "2Ôÿà", effect: "Drain 8% dano como HP para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bless Shield",     type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Block Rate para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mental Shield",    type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% M.DEF para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stigma of Shillien", type: "Ativo",   rarity: "3Ôÿà", effect: "Marca alvo: recebe +25% dano por 10s", cooldown: "30s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Prophecy of Water", type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% M.ATK, +10% Cast Speed, +10% M.DEF para o grupo", cooldown: "60s", duration: "600s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shillien Elder's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% Heal Power, +25% M.ATK, +20% M.DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SHILLIEN SAINT (3┬¬ classe) ÔöÇÔöÇÔöÇ
  shillienSaint: {
    name: 'Shillien Saint', parent: 'shillienElder', race: 'darkelf', archetype: 'healer', stage: 3,
    desc: 'Santa de Shillien ÔÇö cura suprema + modo ofensivo Dark Side.',
    base: { atk: 14, def: 38, hp: 340, mp: 420, matk: 88, mdef: 92, eva: 12, crit: 6 },
    skills: [
      { name: "Sublime Self-Sacrifice",      type: "Ativo",    rarity: "4Ôÿà", effect: "Sacrifica 90% HP pr├│prio: cura total + remove debuffs de todo o grupo", cooldown: "300s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Balance Life",                type: "Ativo",    rarity: "3Ôÿà", effect: "Equaliza HP do grupo (m├®dia)", cooldown: "60s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Resurrection",           type: "Ativo",    rarity: "4Ôÿà", effect: "Ressuscita todos aliados mortos com 40% HP/MP", cooldown: "300s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blessing of Shillien",        type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% All Stats para o grupo por 10 min", cooldown: "60s", duration: "600s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lord of Vampire",             type: "Party-Buff", rarity: "3Ôÿà", effect: "Drain 12% dano como HP para o grupo", cooldown: "60s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Miracle",                     type: "Ativo",    rarity: "4Ôÿà", effect: "Invencibilidade grupo 7s + cura 30%", cooldown: "300s", duration: "7s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Side",                   type: "Toggle",   rarity: "3Ôÿà", effect: "ON: -50% Heal, +80% M.ATK dark, skills mudam para ofensivo", cooldown: "10s toggle", duration: "Toggle", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Disruption",             type: "Ativo",    rarity: "3Ôÿà", effect: "Dano dark 360% (s├│ em Dark Side)", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shillien's Help",             type: "Passivo",  rarity: "3Ôÿà", effect: "Ao curar: 15% chance buff +10% ATK ao curado 10s", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Divine Nova",                 type: "Ativo",    rarity: "3Ôÿà", effect: "Dano dark AoE 320% + heal aliados 15%", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shillien Saint Spirit",       type: "Passivo",  rarity: "3Ôÿà", effect: "+25% Heal Power, +20% M.ATK, +15% M.DEF", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Shillien Saint",      type: "Passivo",  rarity: "3Ôÿà", effect: "+20% Max MP, +15% MP Regen, +10% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shillien Saint Harmony",      type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% Heal Power, +40% M.ATK, +30% M.DEF por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // ORC FIGHTER ÔÇö CLASSE BASE
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  orcFighter: {
    name: 'Orc Fighter', race: 'orc', archetype: 'fighter', stage: 0,
    desc: 'Lutador orc ÔÇö for├ºa bruta e HP elevado.',
    base: { atk: 14, def: 10, hp: 110, mp: 28, eva: 3, crit: 6, mdef: 4 },
    skills: [
      { name: "Power Strike",   type: "Ativo",   rarity: "1Ôÿà", effect: "Dano f├¡sico 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Iron Punch",     type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 140% + stun 1s", cooldown: "10s", duration: "1s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bandage",        type: "Ativo",   rarity: "1Ôÿà", effect: "Recupera 15% HP", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "HP Increase",    type: "Passivo", rarity: "1Ôÿà", effect: "+12% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% DEF com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Orc Spirit",     type: "Self-Buff", rarity: "1Ôÿà", effect: "+12% ATK e +10% HP por 15 min", cooldown: "30 min", duration: "15 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ RAIDER (1┬¬ classe) ÔöÇÔöÇÔöÇ
  raider: {
    name: 'Raider', parent: 'orcFighter', race: 'orc', archetype: 'fighter', stage: 1,
    desc: 'Saqueador orc ÔÇö ataques devastadores com armas pesadas.',
    base: { atk: 28, def: 16, hp: 190, mp: 38, eva: 4, crit: 8, mdef: 6 },
    skills: [
      { name: "Power Smash",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 180%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spinning Slash",      type: "Ativo",   rarity: "1Ôÿà", effect: "Dano AoE 160%", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stun Attack",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 160% + stun 2s", cooldown: "14s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Iron Will",           type: "Ativo",   rarity: "1Ôÿà", effect: "+30% M.DEF por 30s", cooldown: "45s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Polearm Mastery",     type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com polearm", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sword/Blunt Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com espada/ma├ºa", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Heavy Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DESTROYER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  destroyer: {
    name: 'Destroyer', parent: 'raider', race: 'orc', archetype: 'fighter', stage: 2,
    desc: 'Destruidor ÔÇö f├║ria descontrolada com dano massivo.',
    base: { atk: 58, def: 32, hp: 420, mp: 55, eva: 5, crit: 12, mdef: 15 },
    skills: [
      { name: "Frenzy",            type: "Ativo",   rarity: "3Ôÿà", effect: "+100% ATK quando HP < 30%, dura 30s", cooldown: "120s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Guts",              type: "Ativo",   rarity: "3Ôÿà", effect: "Sobrevive com 1 HP por 10s (n├úo pode morrer)", cooldown: "180s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Whirlwind",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 260%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Zealot",           type: "Ativo",   rarity: "3Ôÿà", effect: "+50% ATK Speed por 15s, -20% DEF", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "War Cry",          type: "Self-Buff", rarity: "2Ôÿà", effect: "+25% ATK por 120s", cooldown: "60s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Hammer Crush",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 280% + stun 3s", cooldown: "20s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rush",             type: "Ativo",   rarity: "1Ôÿà", effect: "Avan├ºa para o alvo + dano 150%", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Thunder Storm",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 240% + knockdown", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Howl",             type: "Ativo",   rarity: "2Ôÿà", effect: "Reduz DEF inimigos AoE -20% 10s", cooldown: "25s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Burning Chop",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano fogo 240% + burn 5s", cooldown: "16s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",            type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",         type: "Passivo", rarity: "1Ôÿà", effect: "+15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Destroyer's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +20% HP, +15% ATK Speed por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ TITAN (3┬¬ classe) ÔöÇÔöÇÔöÇ
  titan: {
    name: 'Titan', parent: 'destroyer', race: 'orc', archetype: 'fighter', stage: 3,
    desc: 'Tit├ú ÔÇö devasta├º├úo absoluta com f├║ria impar├ível.',
    base: { atk: 108, def: 52, hp: 720, mp: 82, eva: 8, crit: 18, mdef: 28 },
    skills: [
      { name: "Earthquake",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 400% + knockback + stun 2s", cooldown: "35s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Real Target",                type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% + ignore DEF", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fists of Fury",              type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 350% (5 hits r├ípidos)", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Breaker",               type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 360% + drain MP alvo", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blazing Strike",             type: "Ativo",   rarity: "3Ôÿà", effect: "Dano fogo 420% single target", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Anti-Magic Armor",           type: "Ativo",   rarity: "3Ôÿà", effect: "+80% M.DEF por 15s", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Earthquake",    type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE 680% + knockdown + stun 4s", cooldown: "180s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Pride of Titan",             type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +15% Max HP, +100% Crit Power com 2H sword", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Titan Spirit",               type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% HP, +10% ATK Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Titan",          type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat: Orc",      type: "Passivo", rarity: "4Ôÿà", effect: "+12% All Stats, +18% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Titan's Harmony",            type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% ATK, +40% HP, +30% ATK Speed por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ MONK (1┬¬ classe) ÔöÇÔöÇÔöÇ
  monk: {
    name: 'Monk', parent: 'orcFighter', race: 'orc', archetype: 'fighter', stage: 1,
    desc: 'Monge orc ÔÇö mestre em combate desarmado.',
    base: { atk: 24, def: 12, hp: 165, mp: 35, eva: 8, crit: 12, mdef: 6 },
    skills: [
      { name: "Punch of Doom",    type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 190% + stun 2s", cooldown: "14s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Iron Punch",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 170% + knockback", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fist Mastery",     type: "Passivo", rarity: "1Ôÿà", effect: "+15% ATK com fist weapons", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+10% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",            type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ TYRANT (2┬¬ classe) ÔöÇÔöÇÔöÇ
  tyrant: {
    name: 'Tyrant', parent: 'monk', race: 'orc', archetype: 'fighter', stage: 2,
    desc: 'Tirano ÔÇö combate desarmado com f├║ria elemental.',
    base: { atk: 55, def: 22, hp: 350, mp: 65, eva: 16, crit: 22, mdef: 14 },
    skills: [
      { name: "Force Blaster",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + knockback", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Force Buster",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 280%", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Force Storm",       type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 320%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Burning Fist",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano fogo 250% + burn 5s", cooldown: "14s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Hurricane Assault", type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 340% (combo 4 hits)", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cripple",           type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% + slow 40% 6s", cooldown: "18s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Totem Spirit",      type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% ATK, +15% ATK Speed por 120s", cooldown: "60s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fist Fury",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 240% + cancel target", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Zealot",            type: "Ativo",   rarity: "3Ôÿà", effect: "+50% ATK Speed por 15s, -20% DEF", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Frenzy",            type: "Ativo",   rarity: "3Ôÿà", effect: "+100% ATK quando HP < 30%, dura 30s", cooldown: "120s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Tyrant's Harmony",  type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% ATK Speed por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ GRAND KHAVATARI (3┬¬ classe) ÔöÇÔöÇÔöÇ
  grandKhavatari: {
    name: 'Grand Khavatari', parent: 'tyrant', race: 'orc', archetype: 'fighter', stage: 3,
    desc: 'Grande Khavatari ÔÇö mestre supremo do combate desarmado.',
    base: { atk: 102, def: 38, hp: 580, mp: 95, eva: 28, crit: 38, mdef: 25 },
    skills: [
      { name: "Force Focus",                  type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 400% + crit garantido", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul of the Phoenix",          type: "Ativo",   rarity: "4Ôÿà", effect: "Revive com 50% HP ao morrer (1x)", cooldown: "300s", duration: "300s (1 uso)", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rapid Attack",                 type: "Ativo",   rarity: "3Ôÿà", effect: "5 hits r├ípidos 80% cada", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ogre's Essence",               type: "Self-Buff", rarity: "3Ôÿà", effect: "+40% ATK, +30% Max HP por 60s", cooldown: "120s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rabbit Spirit Totem",          type: "Self-Buff", rarity: "3Ôÿà", effect: "+60% ATK Speed por 30s", cooldown: "90s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Hurricane",       type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 650% (8 hits) + knockdown", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Grand Khavatari Spirit",       type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +15% Crit Rate, +15% ATK Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Grand Khavatari",      type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Frenzy",                 type: "Passivo", rarity: "3Ôÿà", effect: "+30% ATK quando HP < 30%", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat: Orc",        type: "Passivo", rarity: "4Ôÿà", effect: "+12% All Stats, +18% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Grand Khavatari Harmony",      type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +40% Crit, +35% ATK Speed por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ RIDER (1┬¬ classe ÔÇö Vanguard Rider line) ÔöÇÔöÇÔöÇ
  rider: {
    name: 'Rider', parent: 'orcFighter', race: 'orc', archetype: 'rider', stage: 1,
    desc: 'Cavaleiro orc ÔÇö combate montado com lan├ºa.',
    base: { atk: 26, def: 18, hp: 200, mp: 40, eva: 5, crit: 8, mdef: 8 },
    skills: [
      { name: "Lance Charge",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 190% + avan├ºa montado", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mounted Thrust",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 170%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lance Mastery",        type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com lan├ºa", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Battle Mount",         type: "Toggle",  rarity: "1Ôÿà", effect: "Monta na criatura (+20% Move Speed, muda skills)", cooldown: "10s", duration: "Toggle", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DRAGOON (2┬¬ classe) ÔöÇÔöÇÔöÇ
  dragoon: {
    name: 'Dragoon', parent: 'rider', race: 'orc', archetype: 'rider', stage: 2,
    desc: 'Drag├úo montado ÔÇö ataques montados devastadores.',
    base: { atk: 55, def: 38, hp: 400, mp: 62, eva: 8, crit: 10, mdef: 18 },
    skills: [
      { name: "Trample",              type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE montado 260%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Battle Rush",          type: "Ativo",   rarity: "2Ôÿà", effect: "Charge 240% + stun 2s", cooldown: "16s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mounted Whirlwind",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 280%", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Beast Roar",           type: "Ativo",   rarity: "2Ôÿà", effect: "Reduz ATK inimigos AoE -20% 8s + taunt", cooldown: "25s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Devastating Charge",   type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 340% + knockdown", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rider's Mastery",      type: "Passivo", rarity: "2Ôÿà", effect: "+20% ATK montado, +15% DEF montado", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mounted Combat",       type: "Passivo", rarity: "2Ôÿà", effect: "+15% ATK Speed enquanto montado", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dragoon's Harmony",    type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +25% DEF, +20% HP por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ VANGUARD RIDER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  vanguardRider: {
    name: 'Vanguard Rider', parent: 'dragoon', race: 'orc', archetype: 'rider', stage: 3,
    desc: 'Cavaleiro de vanguarda ÔÇö devasta├º├úo montada com poder de drag├úo.',
    base: { atk: 98, def: 62, hp: 680, mp: 95, eva: 12, crit: 14, mdef: 32 },
    skills: [
      { name: "Thunder Crash",                type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 420% + stun 3s", cooldown: "30s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mounted Slam",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% + knockdown + bleed 6s", cooldown: "25s", duration: "6s bleed", note: "Skill permanece ap├│s trocar de classe" },
      { name: "War Banner",                   type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% ATK e DEF para o grupo por 120s", cooldown: "60s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dragon's Breath",              type: "Ativo",   rarity: "4Ôÿà", effect: "Dano fogo AoE 550% + burn 8s", cooldown: "60s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Charge",          type: "Ativo",   rarity: "4Ôÿà", effect: "Charge dano 680% + knockback + stun 4s", cooldown: "180s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "BP Mastery",                   type: "Passivo", rarity: "3Ôÿà", effect: "Gera Battle Points ao atacar, +5% ATK por BP (max 5)", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Vanguard Spirit",              type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% DEF, +15% HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Vanguard",         type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% HP Regen, +10% Move Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat: Orc",        type: "Passivo", rarity: "4Ôÿà", effect: "+12% All Stats, +18% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Vanguard's Harmony",           type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% DEF, +35% HP por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rider's Will",                 type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK Speed montado, +20% Move Speed por 20 min", cooldown: "55 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // ORC MAGE ÔÇö CLASSE BASE
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  orcMage: {
    name: 'Orc Mage', race: 'orc', archetype: 'mage', stage: 0,
    desc: 'Mago orc ÔÇö magia tribal e suporte.',
    base: { atk: 8, def: 6, hp: 85, mp: 80, matk: 10, mdef: 6, eva: 3, crit: 3 },
    skills: [
      { name: "Wind Strike",  type: "Ativo",   rarity: "1Ôÿà", effect: "Dano vento m├ígico 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Self Heal",    type: "Ativo",   rarity: "1Ôÿà", effect: "Recupera 20% HP", cooldown: "15s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Robe Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+10% M.ATK com robe", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "MP Increase",  type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SHAMAN (1┬¬ classe) ÔöÇÔöÇÔöÇ
  shaman: {
    name: 'Shaman', parent: 'orcMage', race: 'orc', archetype: 'support', stage: 1,
    desc: 'Xam├ú orc ÔÇö cura e buffs tribais.',
    base: { atk: 10, def: 10, hp: 125, mp: 120, matk: 22, mdef: 18, eva: 4, crit: 4 },
    skills: [
      { name: "Heal",         type: "Ativo",     rarity: "1Ôÿà", effect: "Cura 250% M.ATK", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Might",        type: "Party-Buff", rarity: "1Ôÿà", effect: "+10% ATK para o grupo", cooldown: "20s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shield",       type: "Party-Buff", rarity: "1Ôÿà", effect: "+10% DEF para o grupo", cooldown: "20s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cure Poison",  type: "Ativo",     rarity: "1Ôÿà", effect: "Remove poison", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cure Bleed",   type: "Ativo",     rarity: "1Ôÿà", effect: "Remove bleed", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Flame Strike", type: "Ativo",     rarity: "1Ôÿà", effect: "Dano fogo 200%", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost Mana",   type: "Passivo",   rarity: "1Ôÿà", effect: "+15% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ OVERLORD (2┬¬ classe) ÔöÇÔöÇÔöÇ
  overlord: {
    name: 'Overlord', parent: 'shaman', race: 'orc', archetype: 'support', stage: 2,
    desc: 'Senhor da guerra ÔÇö buffs de cl├ú e debuffs massivos.',
    base: { atk: 18, def: 28, hp: 300, mp: 220, matk: 48, mdef: 42, eva: 6, crit: 6 },
    skills: [
      { name: "Clan Might",            type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% ATK para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Clan Shield",           type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% DEF para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Clan Body",             type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Max HP para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Clan Soul",             type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Max MP para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Clan Spirit",           type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% M.ATK para o grupo", cooldown: "30s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seal of Winter",        type: "Ativo",      rarity: "2Ôÿà", effect: "Reduz ATK Speed alvo -30% 10s", cooldown: "20s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seal of Flame",         type: "Ativo",      rarity: "2Ôÿà", effect: "Dano fogo 220% + burn 8s", cooldown: "15s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seal of Gloom",         type: "Ativo",      rarity: "2Ôÿà", effect: "Reduz M.DEF alvo -25% 10s", cooldown: "20s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seal of Silence",       type: "Ativo",      rarity: "3Ôÿà", effect: "Silence alvo 5s", cooldown: "30s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Seal of Slow",          type: "Ativo",      rarity: "2Ôÿà", effect: "Slow alvo -40% 8s", cooldown: "18s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Provoke",               type: "Ativo",      rarity: "1Ôÿà", effect: "Taunt 10s", cooldown: "15s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",              type: "Passivo",    rarity: "1Ôÿà", effect: "+15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Overlord's Harmony",    type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% M.ATK, +25% HP, +20% M.DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DOMINATOR (3┬¬ classe) ÔöÇÔöÇÔöÇ
  dominator: {
    name: 'Dominator', parent: 'overlord', race: 'orc', archetype: 'support', stage: 3,
    desc: 'Dominador ÔÇö l├¡der absoluto com buffs supremos e dano ofensivo.',
    base: { atk: 32, def: 48, hp: 480, mp: 380, matk: 85, mdef: 72, eva: 10, crit: 8 },
    skills: [
      { name: "Seal of Limit",              type: "Ativo",      rarity: "3Ôÿà", effect: "Reduz All Stats alvo -15% 12s", cooldown: "35s", duration: "12s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Clan Imperium",              type: "Ativo",      rarity: "4Ôÿà", effect: "Buff supremo: +25% All Stats para o grupo 120s", cooldown: "120s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Victoria of Pa'agrio",       type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% ATK e +15% Crit para o grupo", cooldown: "60s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Glory of Pa'agrio",          type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% DEF e +15% M.DEF para o grupo", cooldown: "60s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blessing of Pa'agrio",       type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% Max HP/MP para o grupo", cooldown: "60s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Seal of Gloom",         type: "Ativo",      rarity: "3Ôÿà", effect: "Reduz M.DEF inimigos AoE -25% 10s", cooldown: "35s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Flame Burst",                type: "Ativo",      rarity: "3Ôÿà", effect: "Dano fogo AoE 380% + burn 6s", cooldown: "22s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Prophecy of Pa'agrio",       type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% ATK, +25% M.ATK, +20% PvE Damage por 20 min", cooldown: "55 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Flame Burst",   type: "Ativo",      rarity: "4Ôÿà", effect: "Dano fogo AoE 620% (10 alvos) + burn 10s", cooldown: "160s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dominator Spirit",           type: "Passivo",    rarity: "3Ôÿà", effect: "+20% M.ATK, +15% HP, +10% All Resist", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Dominator",      type: "Passivo",    rarity: "3Ôÿà", effect: "+15% Max MP, +15% HP Regen, +10% MP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dominator Harmony",          type: "Self-Buff",  rarity: "4Ôÿà", effect: "+50% M.ATK, +40% HP, +30% All Resist por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARCRYER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  warcryer: {
    name: 'Warcryer', parent: 'shaman', race: 'orc', archetype: 'bard', stage: 2,
    desc: 'Cantor de guerra ÔÇö c├ónticos que empoderam aliados.',
    base: { atk: 14, def: 22, hp: 280, mp: 200, matk: 42, mdef: 38, eva: 5, crit: 5 },
    skills: [
      { name: "Chant of Fire",       type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% ATK para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Battle",     type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% ATK Speed para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Shielding",  type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% DEF para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Vampire",    type: "Party-Buff", rarity: "3Ôÿà", effect: "Drain 8% dano como HP para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Fury",       type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Crit Rate para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Evasion",    type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% EVA para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Rage",       type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% Crit Power para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Predator",   type: "Party-Buff", rarity: "2Ôÿà", effect: "+10% ATK e Accuracy para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Eagle",      type: "Party-Buff", rarity: "2Ôÿà", effect: "+15% Crit Rate para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Victory",    type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% All Stats para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Revenge",    type: "Party-Buff", rarity: "2Ôÿà", effect: "+10% Reflect Damage para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warcryer's Harmony",  type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% M.ATK, +25% HP, +20% M.DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DOOMCRYER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  doomcryer: {
    name: 'Doomcryer', parent: 'warcryer', race: 'orc', archetype: 'bard', stage: 3,
    desc: 'Arauto da perdi├º├úo ÔÇö c├ónticos supremos e dano de guerra.',
    base: { atk: 22, def: 38, hp: 440, mp: 340, matk: 75, mdef: 65, eva: 8, crit: 8 },
    skills: [
      { name: "Chant of Magnus",            type: "Party-Buff", rarity: "3Ôÿà", effect: "+20% M.ATK e +15% Cast Speed para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chant of Berserker",         type: "Party-Buff", rarity: "3Ôÿà", effect: "+25% ATK, +20% ATK Speed, -10% DEF para o grupo", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Chant",                 type: "Ativo",      rarity: "3Ôÿà", effect: "Ativa todos os c├ónticos por 60s", cooldown: "120s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Chant",                type: "Ativo",      rarity: "4Ôÿà", effect: "Todos os c├ónticos em pot├¬ncia m├íxima por 30s + imunidade debuff", cooldown: "300s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "War Chant",                  type: "Ativo",      rarity: "3Ôÿà", effect: "Dano AoE 340% + taunt AoE", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blood Bond",                 type: "Ativo",      rarity: "3Ôÿà", effect: "Dano AoE dark 380% + drain HP para grupo", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Prophecy of Victory",        type: "Self-Buff",  rarity: "3Ôÿà", effect: "+30% ATK, +25% Crit, +20% PvE Damage por 20 min", cooldown: "55 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Cacophony of War",           type: "Ativo",      rarity: "3Ôÿà", effect: "Dano AoE 320% + reduz HP/MP inimigos -15%", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Doomcryer Spirit",           type: "Passivo",    rarity: "3Ôÿà", effect: "+20% M.ATK, +15% HP, +10% All Resist", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Doomcryer",      type: "Passivo",    rarity: "3Ôÿà", effect: "+15% Max MP, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Doomcryer Harmony",          type: "Self-Buff",  rarity: "4Ôÿà", effect: "+50% M.ATK, +40% HP, +30% All Resist por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // DWARF FIGHTER ÔÇö CLASSE BASE
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  dwarfFighter: {
    name: 'Dwarf Fighter', race: 'dwarf', archetype: 'fighter', stage: 0,
    desc: 'Lutador an├úo ÔÇö forte, resistente e com b├┤nus de loot.',
    base: { atk: 12, def: 10, hp: 100, mp: 30, eva: 3, crit: 6, mdef: 5 },
    skills: [
      { name: "Power Strike",   type: "Ativo",   rarity: "1Ôÿà", effect: "Dano f├¡sico 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spoil",           type: "Ativo",   rarity: "1Ôÿà", effect: "Marca alvo para loot extra", cooldown: "10s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bandage",         type: "Ativo",   rarity: "1Ôÿà", effect: "Recupera 15% HP", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "HP Increase",     type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% DEF com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SCAVENGER (1┬¬ classe) ÔöÇÔöÇÔöÇ
  scavenger: {
    name: 'Scavenger', parent: 'dwarfFighter', race: 'dwarf', archetype: 'dagger', stage: 1,
    desc: 'Sucateiro ÔÇö mestre em obter loot extra dos inimigos.',
    base: { atk: 22, def: 14, hp: 160, mp: 38, eva: 10, crit: 10, mdef: 6 },
    skills: [
      { name: "Spoil",            type: "Ativo",   rarity: "1Ôÿà", effect: "Marca alvo para loot extra ao morrer", cooldown: "8s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sweeper",          type: "Ativo",   rarity: "1Ôÿà", effect: "Coleta loot de alvo marcado com Spoil", cooldown: "3s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Plunder",          type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 160% + chance loot direto", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stun Attack",      type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 160% + stun 2s", cooldown: "14s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dagger Mastery",   type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com adagas", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Evasion",          type: "Passivo", rarity: "1Ôÿà", effect: "+10% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ BOUNTY HUNTER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  bountyHunter: {
    name: 'Bounty Hunter', parent: 'scavenger', race: 'dwarf', archetype: 'dagger', stage: 2,
    desc: 'Ca├ºador de recompensas ÔÇö combate e loot supremo.',
    base: { atk: 48, def: 28, hp: 320, mp: 55, eva: 18, crit: 18, mdef: 14 },
    skills: [
      { name: "Spoil Festival",    type: "Ativo",   rarity: "2Ôÿà", effect: "Marca todos inimigos AoE para loot", cooldown: "25s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Spoil Crush",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 240% + Spoil + Sweep autom├ítico", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Backstab",          type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% por tr├ís + crit garantido", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blinding Blow",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% + blind 4s", cooldown: "18s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sand Bomb",         type: "Ativo",   rarity: "2Ôÿà", effect: "Blind AoE 5s", cooldown: "25s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Switch",            type: "Ativo",   rarity: "2Ôÿà", effect: "Teleporta atr├ís do alvo", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fake Death",        type: "Ativo",   rarity: "2Ôÿà", effect: "Finge morte, remove aggro", cooldown: "60s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Critical Power",    type: "Passivo", rarity: "2Ôÿà", effect: "+20% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",             type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",          type: "Passivo", rarity: "1Ôÿà", effect: "+15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bounty Hunter's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +25% Crit, +20% Loot Bonus por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ FORTUNE SEEKER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  fortuneSeeker: {
    name: 'Fortune Seeker', parent: 'bountyHunter', race: 'dwarf', archetype: 'dagger', stage: 3,
    desc: 'Buscador de fortuna ÔÇö loot m├íximo e combate eficiente.',
    base: { atk: 88, def: 42, hp: 520, mp: 85, eva: 30, crit: 32, mdef: 22 },
    skills: [
      { name: "Mass Spoil",                  type: "Ativo",   rarity: "3Ôÿà", effect: "Marca todos inimigos em tela para loot", cooldown: "35s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Aura of Fortune",             type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% Loot Rate, +20% Adena Drop por 30 min", cooldown: "60 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Artisan's Golem",             type: "Ativo",   rarity: "3Ôÿà", effect: "Invoca golem que luta (ATK 200%)", cooldown: "60s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Spoil Crush",    type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE 500% + Spoil + Sweep todos", cooldown: "160s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lucky",                       type: "Passivo", rarity: "4Ôÿà", effect: "+15% chance loot raro, +10% chance loot ├®pico", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fortune Seeker Spirit",       type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +15% Crit, +20% Loot Bonus", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Fortune Seeker",      type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP, +10% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fortune Seeker Harmony",      type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% ATK, +40% Crit, +35% Loot Bonus por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ ARTISAN (1┬¬ classe ÔÇö Craft line) ÔöÇÔöÇÔöÇ
  artisanDwarf: {
    name: 'Artisan', parent: 'dwarfFighter', race: 'dwarf', archetype: 'crafter', stage: 1,
    desc: 'Artes├úo an├úo ÔÇö mestre em criar itens e golems.',
    base: { atk: 20, def: 16, hp: 175, mp: 42, eva: 4, crit: 6, mdef: 8 },
    skills: [
      { name: "Create Item",          type: "Ativo",   rarity: "1Ôÿà", effect: "Crafta item do recipe", cooldown: "5s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Golem",         type: "Ativo",   rarity: "1Ôÿà", effect: "Invoca golem de combate b├ísico", cooldown: "30s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stun Attack",          type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 160% + stun 2s", cooldown: "14s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sword/Blunt Mastery",  type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com espada/ma├ºa", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Heavy Armor Mastery",  type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARSMITH (2┬¬ classe) ÔöÇÔöÇÔöÇ
  warsmith: {
    name: 'Warsmith', parent: 'artisanDwarf', race: 'dwarf', archetype: 'crafter', stage: 2,
    desc: 'Ferreiro de guerra ÔÇö golems poderosos e craft avan├ºado.',
    base: { atk: 40, def: 35, hp: 340, mp: 65, eva: 6, crit: 8, mdef: 18 },
    skills: [
      { name: "Create Item Lv2-7",        type: "Ativo",   rarity: "2Ôÿà", effect: "Crafta itens avan├ºados", cooldown: "5s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Siege Golem",        type: "Ativo",   rarity: "2Ôÿà", effect: "Golem forte (ATK 250%, HP alto)", cooldown: "60s", duration: "180s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Mechanic Golem",     type: "Ativo",   rarity: "2Ôÿà", effect: "Golem mec├ónico (ATK ranged 200%)", cooldown: "60s", duration: "180s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Wild Hog Cannon",    type: "Ativo",   rarity: "3Ôÿà", effect: "Canh├úo AoE (dano 300%/10s)", cooldown: "90s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Share Craft",              type: "Ativo",   rarity: "2Ôÿà", effect: "Permite craftar para outros jogadores", cooldown: "5s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Crystal Mastery",          type: "Passivo", rarity: "2Ôÿà", effect: "+20% chance cristaliza├º├úo bem-sucedida", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Golem Armor",              type: "Ativo",   rarity: "2Ôÿà", effect: "+30% DEF do golem por 60s", cooldown: "60s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warsmith's Harmony",       type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +25% Golem Power, +20% Craft Success por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ MAESTRO (3┬¬ classe) ÔöÇÔöÇÔöÇ
  maestro: {
    name: 'Maestro', parent: 'warsmith', race: 'dwarf', archetype: 'crafter', stage: 3,
    desc: 'Maestro ÔÇö mestre supremo da forja e dos golems.',
    base: { atk: 72, def: 58, hp: 560, mp: 98, eva: 10, crit: 12, mdef: 30 },
    skills: [
      { name: "Summon Enhanced Golem",      type: "Ativo",   rarity: "3Ôÿà", effect: "Golem aprimorado (ATK 400%, AoE)", cooldown: "90s", duration: "180s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Summon Big Boom",            type: "Ativo",   rarity: "4Ôÿà", effect: "Explosivo: dano AoE 550%", cooldown: "120s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Mass Crystal",               type: "Ativo",   rarity: "3Ôÿà", effect: "Cristaliza v├írios itens de uma vez", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Form",                 type: "Ativo",   rarity: "4Ôÿà", effect: "Golem evolui: +100% ATK/HP por 60s", cooldown: "180s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Craft Mastery",              type: "Passivo", rarity: "3Ôÿà", effect: "+30% Craft Success Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Maestro Spirit",             type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +15% Golem Power, +15% DEF", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Maestro",        type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP, +10% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",           type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Maestro Harmony",            type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% ATK, +40% Golem Power, +30% Craft Success por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // KAMAEL ÔÇö CLASSE BASE
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  kamaelSoldier: {
    name: 'Kamael Soldier', race: 'kamael', archetype: 'fighter', stage: 0,
    desc: 'Soldado Kamael ÔÇö guerreiro com poder da alma.',
    base: { atk: 13, def: 7, hp: 90, mp: 40, eva: 8, crit: 8, mdef: 5 },
    skills: [
      { name: "Soul Strike",        type: "Ativo",   rarity: "1Ôÿà", effect: "Dano soul 160%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Energy Blast",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano AoE soul 140%", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Steal Divinity",     type: "Ativo",   rarity: "1Ôÿà", effect: "Absorve buff inimigo", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ancient Sword Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com ancient sword", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Mastery",       type: "Passivo", rarity: "1Ôÿà", effect: "+10% Soul Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ TROOPER (1┬¬ classe) ÔöÇÔöÇÔöÇ
  trooper: {
    name: 'Trooper', parent: 'kamaelSoldier', race: 'kamael', archetype: 'fighter', stage: 1,
    desc: 'Combatente de linha ÔÇö espada antiga e poder soul.',
    base: { atk: 26, def: 14, hp: 170, mp: 52, eva: 10, crit: 10, mdef: 8 },
    skills: [
      { name: "Soul Charge",         type: "Ativo",   rarity: "1Ôÿà", effect: "Carrega Soul Points (+1 SP)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lightning Shock",     type: "Ativo",   rarity: "1Ôÿà", effect: "Dano el├®trico 190% + stun 1s", cooldown: "12s", duration: "1s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rush",                type: "Ativo",   rarity: "1Ôÿà", effect: "Avan├ºa para alvo + dano 150%", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Triple Thrust",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 180% (3 hits)", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Heavy Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",            type: "Passivo", rarity: "1Ôÿà", effect: "+12% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ BERSERKER (2┬¬ classe) ÔöÇÔöÇÔöÇ
  berserker: {
    name: 'Berserker', parent: 'trooper', race: 'kamael', archetype: 'fighter', stage: 2,
    desc: 'Berserker Kamael ÔÇö f├║ria soul com dano devastador.',
    base: { atk: 55, def: 28, hp: 380, mp: 72, eva: 14, crit: 16, mdef: 16 },
    skills: [
      { name: "Soul Breaker",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano soul 280% + drain MP", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Rage",          type: "Ativo",   rarity: "3Ôÿà", effect: "+60% ATK por 20s, consume Soul Points", cooldown: "60s", duration: "20s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rush Impact",        type: "Ativo",   rarity: "2Ôÿà", effect: "Charge 240% + stun 2s", cooldown: "18s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Decimate",           type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 260%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Hurricane Rush",     type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 320% + knockback", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Piercing",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 250% + ignore DEF", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Frenzy",             type: "Ativo",   rarity: "3Ôÿà", effect: "+100% ATK quando HP < 30%, dura 30s", cooldown: "120s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Guts",               type: "Ativo",   rarity: "3Ôÿà", effect: "Sobrevive com 1 HP por 10s", cooldown: "180s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",              type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Berserker's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% Soul Damage por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ DOOMBRINGER (3┬¬ classe) ÔöÇÔöÇÔöÇ
  doombringer: {
    name: 'Doombringer', parent: 'berserker', race: 'kamael', archetype: 'fighter', stage: 3,
    desc: 'Portador da ru├¡na ÔÇö devasta├º├úo soul absoluta.',
    base: { atk: 102, def: 45, hp: 620, mp: 105, eva: 20, crit: 28, mdef: 28 },
    skills: [
      { name: "Doom Blade",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Dano soul 420% + bleed 8s", cooldown: "25s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Explosion",             type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE soul 550% + consume todos Soul Points", cooldown: "90s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dissonance",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Silence AoE 5s", cooldown: "40s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Betrayal Mark",              type: "Ativo",   rarity: "3Ôÿà", effect: "Marca alvo: +30% dano contra ele 12s", cooldown: "35s", duration: "12s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Rage (Enhanced)",       type: "Ativo",   rarity: "4Ôÿà", effect: "+80% ATK por 25s", cooldown: "90s", duration: "25s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Doom Blade",    type: "Ativo",   rarity: "4Ôÿà", effect: "Dano soul 680% + ignore DEF + drain soul", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Pride of Kamael",            type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +15% Soul Damage, +10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Doombringer Spirit",         type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Doombringer",        type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",           type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Doombringer Harmony",        type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +35% Soul Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ SOUL FINDER ÔåÆ SOUL BREAKER ÔåÆ SOUL HOUND ÔöÇÔöÇÔöÇ
  soulFinder: {
    name: 'Soul Finder', parent: 'kamaelSoldier', race: 'kamael', archetype: 'hybrid', stage: 1,
    desc: 'Buscador de almas ÔÇö combate misto f├¡sico/m├ígico.',
    base: { atk: 18, def: 10, hp: 130, mp: 65, eva: 10, crit: 10, matk: 15, mdef: 10 },
    skills: [
      { name: "Soul Strike (Enhanced)", type: "Ativo", rarity: "1Ôÿà", effect: "Dano soul 180%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Double Thrust",         type: "Ativo", rarity: "1Ôÿà", effect: "Dano 170% (2 hits)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rapier Mastery",        type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com rapier", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost Mana",            type: "Passivo", rarity: "1Ôÿà", effect: "+12% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  soulBreakerKamael: {
    name: 'Soul Breaker', parent: 'soulFinder', race: 'kamael', archetype: 'hybrid', stage: 2,
    desc: 'Quebrador de almas ÔÇö misto combate/magia soul.',
    base: { atk: 42, def: 18, hp: 250, mp: 120, eva: 16, crit: 16, matk: 38, mdef: 22 },
    skills: [
      { name: "Soul Vortex",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano soul m├ígico 280%", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Curse",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano dark 240% + reduz M.DEF 20%", cooldown: "18s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Insane Crusher",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano f├¡sico 260% + stun 2s", cooldown: "18s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Breaker's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +25% M.ATK, +20% Soul Damage por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  soulHound: {
    name: 'Soul Hound', parent: 'soulBreakerKamael', race: 'kamael', archetype: 'hybrid', stage: 3,
    desc: 'C├úo da alma ÔÇö mestre do combate h├¡brido.',
    base: { atk: 82, def: 32, hp: 420, mp: 200, eva: 26, crit: 28, matk: 72, mdef: 38 },
    skills: [
      { name: "Lightning Barrier",            type: "Ativo",   rarity: "3Ôÿà", effect: "Escudo el├®trico: absorve 3000 + reflete 25%", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Vortex Destruction",      type: "Ativo",   rarity: "4Ôÿà", effect: "Dano soul AoE 520%", cooldown: "45s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Ignition",                type: "Ativo",   rarity: "3Ôÿà", effect: "+50% ATK e M.ATK por 20s (drena HP 3%/s)", cooldown: "90s", duration: "20s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Smash",                   type: "Ativo",   rarity: "3Ôÿà", effect: "Dano dark 380% + silence 3s", cooldown: "22s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Soul Vortex",     type: "Ativo",   rarity: "4Ôÿà", effect: "Dano soul AoE 700% + drain soul", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Hound Spirit",            type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +20% M.ATK, +15% Soul Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Soul Hound",           type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP/MP, +10% Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",             type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Hound Harmony",           type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% ATK, +45% M.ATK, +35% Soul Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ WARDER ÔåÆ SOUL RANGER ÔåÆ TRICKSTER ÔöÇÔöÇÔöÇ
  warder: {
    name: 'Warder', parent: 'kamaelSoldier', race: 'kamael', archetype: 'archer', stage: 1,
    desc: 'Guardi├ú Kamael ÔÇö especialista em crossbow.',
    base: { atk: 22, def: 10, hp: 130, mp: 45, eva: 12, crit: 12, mdef: 6 },
    skills: [
      { name: "Rapid Shot",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 170% r├ípido", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Crossbow Mastery",   type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com crossbow", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Boost HP",           type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  soulRanger: {
    name: 'Soul Ranger', parent: 'warder', race: 'kamael', archetype: 'archer', stage: 2,
    desc: 'Ranger soul ÔÇö crossbow com poder da alma.',
    base: { atk: 52, def: 18, hp: 250, mp: 65, eva: 20, crit: 22, mdef: 12 },
    skills: [
      { name: "Double Shot",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% (2 hits)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Burst Shot",       type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + knockback", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Stun Shot",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 200% + stun 2s", cooldown: "18s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Arrow Rain",       type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 300%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rapid Fire",       type: "Ativo",   rarity: "2Ôÿà", effect: "+50% ATK Speed por 15s", cooldown: "45s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Charge",      type: "Ativo",   rarity: "1Ôÿà", effect: "Carrega Soul Points (+1 SP)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Long Shot",        type: "Passivo", rarity: "2Ôÿà", effect: "+30% Range", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focus",            type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Critical Power",   type: "Passivo", rarity: "2Ôÿà", effect: "+20% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Ranger's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% Range por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  trickster: {
    name: 'Trickster', parent: 'soulRanger', race: 'kamael', archetype: 'archer', stage: 3,
    desc: 'Trapaceiro ÔÇö crossbow com armadilhas e truques.',
    base: { atk: 98, def: 25, hp: 400, mp: 98, eva: 35, crit: 42, mdef: 20 },
    skills: [
      { name: "Seven Arrow (Crossbow)",     type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 420% (7 hits crossbow)", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Install Trap",               type: "Ativo",   rarity: "3Ôÿà", effect: "Instala armadilha: dano AoE 300% + stun 3s quando ativada", cooldown: "30s", duration: "60s ou ativa├º├úo", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dead Eye",                   type: "Self-Buff", rarity: "3Ôÿà", effect: "+50% ATK, +40% Range por 18 min", cooldown: "55 min", duration: "18 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Pinpoint Shot",              type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% + ignore DEF", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul of the Trickster",      type: "Ativo",   rarity: "4Ôÿà", effect: "+40% EVA e invisibilidade 8s", cooldown: "90s", duration: "8s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Seven Arrow",   type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 650% (7 hits) + elemental AoE", cooldown: "160s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Trickster Spirit",           type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK, +20% Crit, +15% Range", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Trickster",          type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP, +10% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",           type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Trickster Harmony",          type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +35% Range por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔöÇÔöÇÔöÇ HATAMOTO ÔåÆ RONIN ÔåÆ SAMURAI ÔöÇÔöÇÔöÇ
  hatamoto: {
    name: 'Hatamoto', parent: 'kamaelSoldier', race: 'kamael', archetype: 'samurai', stage: 1,
    desc: 'Hatamoto ÔÇö guerreiro da l├ómina com disciplina marcial.',
    base: { atk: 26, def: 12, hp: 160, mp: 48, eva: 10, crit: 12, mdef: 8 },
    skills: [
      { name: "Iaijutsu",           type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 200% draw-slash", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Crescent Slash",     type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 180% + bleed 4s", cooldown: "12s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Katana Mastery",     type: "Passivo", rarity: "1Ôÿà", effect: "+15% ATK com katana", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+10% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  ronin: {
    name: 'Ronin', parent: 'hatamoto', race: 'kamael', archetype: 'samurai', stage: 2,
    desc: 'Ronin ÔÇö espadachim solit├írio com t├®cnicas devastadoras.',
    base: { atk: 55, def: 22, hp: 320, mp: 72, eva: 18, crit: 22, mdef: 15 },
    skills: [
      { name: "Whirlwind Cut",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 280%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Piercing Strike",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + ignore DEF parcial", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Focused Strike",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 300% + crit b├┤nus +30%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Blade",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano vento 240% ranged", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Bushido Stance",     type: "Toggle",  rarity: "2Ôÿà", effect: "+20% ATK, +15% Crit, -10% DEF", cooldown: "5s", duration: "Toggle", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Counter Slash",      type: "Ativo",   rarity: "3Ôÿà", effect: "Contra-ataque: dano 320% quando bloqueia", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Katana Focus",       type: "Passivo", rarity: "2Ôÿà", effect: "+15% Crit Rate com katana", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ronin's Harmony",    type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% ATK Speed por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  samurai: {
    name: 'Samurai', parent: 'ronin', race: 'kamael', archetype: 'samurai', stage: 3,
    desc: 'Samurai ÔÇö mestre supremo da l├ómina com t├®cnicas lend├írias.',
    base: { atk: 105, def: 38, hp: 540, mp: 108, eva: 30, crit: 38, mdef: 25 },
    skills: [
      { name: "Sakura Storm",                type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 420% + bleed 6s", cooldown: "25s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rising Dragon",               type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% + launch (knockup)", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Final Cut",                    type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 550% execute (dano dobra se alvo < 25% HP)", cooldown: "60s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Honor Code",                   type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% ATK, +20% Crit, +15% EVA por 120s", cooldown: "120s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Iaijutsu",        type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 700% + ignore DEF + bleed 10s", cooldown: "180s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Way of the Blade",             type: "Passivo", rarity: "3Ôÿà", effect: "+15% ATK, +15% Crit Rate, +10% ATK Speed com katana", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Samurai Spirit",               type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% Crit Power, +15% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Samurai",          type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",             type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Samurai's Harmony",            type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +30% ATK Speed por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },
    // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // DEATH KNIGHT (Human / Dark Elf)
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  deathPilgrim: {
    name: 'Death Pilgrim', race: 'human', archetype: 'deathknight', stage: 0,
    desc: 'Peregrino da morte ÔÇö come├ºo da jornada dark.',
    base: { atk: 12, def: 8, hp: 90, mp: 45, eva: 5, crit: 6, mdef: 6 },
    skills: [
      { name: "Death Spike",     type: "Ativo",   rarity: "1Ôÿà", effect: "Dano dark 160%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Soul Drain",      type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 140% + drain 20% HP", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "DP Mastery",      type: "Passivo", rarity: "1Ôÿà", effect: "Gera Death Points ao atacar/matar", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  deathBlade: {
    name: 'Death Blade', parent: 'deathPilgrim', archetype: 'deathknight', stage: 1,
    desc: 'L├ómina da morte ÔÇö combate dark agressivo.',
    base: { atk: 26, def: 14, hp: 165, mp: 62, eva: 8, crit: 10, mdef: 10 },
    skills: [
      { name: "Death Raid",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano dark 200% + knockback", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Shield",      type: "Ativo",   rarity: "2Ôÿà", effect: "Absorve 2000 dano dark por 12s", cooldown: "30s", duration: "12s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Weapon",      type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% Dark Damage por 20 min", cooldown: "45 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  deathMessenger: {
    name: 'Death Messenger', parent: 'deathBlade', archetype: 'deathknight', stage: 2,
    desc: 'Mensageiro da morte ÔÇö ataques dark devastadores.',
    base: { atk: 55, def: 30, hp: 380, mp: 95, eva: 12, crit: 16, mdef: 22 },
    skills: [
      { name: "Dark Explosion",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE dark 300% + poison 6s", cooldown: "22s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Death Mark",        type: "Ativo",   rarity: "3Ôÿà", effect: "Marca alvo: +30% Dark Damage recebido 10s", cooldown: "30s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Abyss Gaze",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano dark 260% + fear 3s", cooldown: "25s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dark Armor",        type: "Self-Buff", rarity: "2Ôÿà", effect: "+25% DEF e +15% Dark Resist por 20 min", cooldown: "50 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Death Messenger's Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Dark Damage, +20% DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  deathKnight: {
    name: 'Death Knight', parent: 'deathMessenger', archetype: 'deathknight', stage: 3,
    desc: 'Cavaleiro da Morte ÔÇö devasta├º├úo dark absoluta com Death Points.',
    base: { atk: 105, def: 52, hp: 650, mp: 140, eva: 18, crit: 22, mdef: 38 },
    skills: [
      { name: "Death Storm",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE dark 450% + drain HP AoE 20%", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Deadly Counter",              type: "Ativo",   rarity: "3Ôÿà", effect: "Contra-ataque dark 400% quando bloqueado", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ultimate Death Knight",        type: "Ativo",   rarity: "4Ôÿà", effect: "+80% ATK e Dark Damage por 30s (consume todos DP)", cooldown: "120s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Death Spike",     type: "Ativo",   rarity: "4Ôÿà", effect: "Dano dark 720% + ignore DEF + drain 40% HP", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Death Knight's Will",          type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% Dark Damage, +15% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",             type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Death Knight Harmony",         type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% ATK, +50% Dark Damage, +35% DEF por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // WARG (Human Male)
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  wargS0: {
    name: 'Warg', race: 'human', archetype: 'warg', stage: 0,
    desc: 'Lutador primitivo que pode se transformar em lobo.',
    base: { atk: 12, def: 8, hp: 95, mp: 35, eva: 8, crit: 8, mdef: 4 },
    skills: [
      { name: "Upward Strike",      type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 160% + knockup", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Fist Mastery",        type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com fist weapons", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  wargS1: {
    name: 'Warg', parent: 'wargS0', archetype: 'warg', stage: 1,
    base: { atk: 26, def: 14, hp: 170, mp: 48, eva: 14, crit: 14, mdef: 8 },
    skills: [
      { name: "Devastating Assault", type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 200% (2 hits)", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Powerful Fists",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 240% + stun 2s", cooldown: "16s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warg's Will",         type: "Self-Buff", rarity: "2Ôÿà", effect: "+20% ATK e +15% Crit por 20 min", cooldown: "50 min", duration: "20 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  wargS2: {
    name: 'Warg', parent: 'wargS1', archetype: 'warg', stage: 2,
    desc: 'Warg com transforma├º├úo de lobo desbloqueada.',
    base: { atk: 55, def: 25, hp: 360, mp: 72, eva: 22, crit: 22, mdef: 16 },
    skills: [
      { name: "Wolf Transformation",        type: "Toggle",  rarity: "3Ôÿà", effect: "Transforma em lobo: muda skills, +30% ATK/Speed", cooldown: "10s", duration: "60s max", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Double Claw Strike",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 280% (lobo) (2 garras)", cooldown: "12s", duration: null, note: "Forma Lobo. Skill permanece ap├│s trocar de classe" },
      { name: "Vortex of Claws",            type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE 340% + puxa inimigos (lobo)", cooldown: "22s", duration: null, note: "Forma Lobo. Skill permanece ap├│s trocar de classe" },
      { name: "Wild Rush",                  type: "Ativo",   rarity: "2Ôÿà", effect: "Charge 220% + stun 2s (lobo)", cooldown: "15s", duration: "2s", note: "Forma Lobo. Skill permanece ap├│s trocar de classe" },
      { name: "Primal Howl",                type: "Ativo",   rarity: "2Ôÿà", effect: "Reduz DEF inimigos AoE -25% 8s (lobo)", cooldown: "25s", duration: "8s", note: "Forma Lobo. Skill permanece ap├│s trocar de classe" },
      { name: "Moon's Grace",               type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% All Stats por 120s", cooldown: "120s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Confused Mind",              type: "Ativo",   rarity: "2Ôÿà", effect: "Ativa transforma├º├úo instant├ónea", cooldown: "30s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Tough Skin",                 type: "Passivo", rarity: "2Ôÿà", effect: "+20% Debuff Resist", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warg Harmony (Stage 2)",     type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% EVA por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  wargS3: {
    name: 'Warg', parent: 'wargS2', archetype: 'warg', stage: 3,
    desc: 'Warg completo ÔÇö forma lobo aprimorada com poder lunar.',
    base: { atk: 105, def: 42, hp: 580, mp: 108, eva: 38, crit: 38, mdef: 28 },
    skills: [
      { name: "Transcendent Double Claw Strike", type: "Ativo", rarity: "4Ôÿà", effect: "Dano 620% (lobo) + bleed 8s", cooldown: "160s", duration: "8s", note: "Forma Lobo. Skill permanece ap├│s trocar de classe" },
      { name: "Full Moon",                       type: "Self-Buff", rarity: "4Ôÿà", effect: "+50% All Stats em forma lobo por 30s", cooldown: "180s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ancient Might",                   type: "Self-Buff", rarity: "3Ôÿà", effect: "+40% ATK e DEF por 60s", cooldown: "120s", duration: "60s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warg Spirit",                     type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% Crit, +15% EVA", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warg Mastery",                    type: "Passivo", rarity: "3Ôÿà", effect: "+20% ATK em forma lobo, +15% dura├º├úo transforma├º├úo", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",                type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Warg Harmony",                    type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% ATK, +45% Crit, +35% EVA por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // ASSASSIN (Human Male / Dark Elf Female)
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  assassinS0: {
    name: 'Assassin', race: 'human', archetype: 'assassin', stage: 0,
    desc: 'Ca├ºador das sombras com adagas.',
    base: { atk: 13, def: 6, hp: 80, mp: 40, eva: 12, crit: 12, mdef: 4 },
    skills: [
      { name: "Assassination",      type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 170% + gera 1 Assassin Dagger", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shadow Dash",        type: "Ativo",   rarity: "1Ôÿà", effect: "Teleporta curta dist├óncia + invisibilidade 2s", cooldown: "15s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Dagger Mastery",     type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com adagas", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  assassinS1: {
    name: 'Assassin', parent: 'assassinS0', archetype: 'assassin', stage: 1,
    base: { atk: 26, def: 10, hp: 140, mp: 55, eva: 20, crit: 18, mdef: 6 },
    skills: [
      { name: "Shadow Strike",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 240% por tr├ís + crit garantido", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Blade Rush",         type: "Ativo",   rarity: "1Ôÿà", effect: "Avan├ºa 200% + gera 1 Assassin Dagger", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Path of the Assassin", type: "Passivo", rarity: "2Ôÿà", effect: "Gera Assassin Daggers ao matar (max 5)", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Assassin's Focus",   type: "Passivo", rarity: "1Ôÿà", effect: "+10% Crit Rate, +10% Crit Power", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  assassinS2: {
    name: 'Assassin', parent: 'assassinS1', archetype: 'assassin', stage: 2,
    desc: 'Assassino com sistema de sombras desbloqueado.',
    base: { atk: 55, def: 18, hp: 280, mp: 82, eva: 35, crit: 30, mdef: 14 },
    skills: [
      { name: "Phantom Strike",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 280% + invoca sombra no local", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lethal Shadow",      type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 340% + sombra ataca junto (340%)", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Resolve to Kill",    type: "Self-Buff", rarity: "3Ôÿà", effect: "Ativa Brutality: +40% ATK por 20s (requer 3 Daggers)", cooldown: "60s", duration: "20s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chain Kill",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + reset Assassination CD se matar", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shadow Step",        type: "Ativo",   rarity: "2Ôÿà", effect: "Teleporta atr├ís do alvo", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Assassin's Mark",    type: "Ativo",   rarity: "2Ôÿà", effect: "Marca alvo: +25% dano contra ele 10s", cooldown: "25s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Brutality",          type: "Passivo", rarity: "2Ôÿà", effect: "Auto-buff +15% ATK quando tem 5 Daggers", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Assassin's Evasion", type: "Passivo", rarity: "2Ôÿà", effect: "+15% EVA, +10% Debuff Resist", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Assassin Harmony (Stage 2)", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +30% Crit, +25% EVA por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  assassinS3: {
    name: 'Assassin', parent: 'assassinS2', archetype: 'assassin', stage: 3,
    desc: 'Assassino supremo ÔÇö sombras letais e execu├º├Áes instant├óneas.',
    base: { atk: 108, def: 28, hp: 440, mp: 120, eva: 55, crit: 48, mdef: 22 },
    skills: [
      { name: "Shadow Blast",                type: "Ativo",   rarity: "3Ôÿà", effect: "Todas as sombras explodem: dano AoE 450% cada", cooldown: "35s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Assassination",  type: "Ativo",   rarity: "4Ôÿà", effect: "Dano 700% + invoca 3 sombras + crit garantido", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Change Appearance",           type: "Ativo",   rarity: "3Ôÿà", effect: "Visual exclusivo + invisibilidade 10s", cooldown: "120s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Shadows",           type: "Passivo", rarity: "4Ôÿà", effect: "+25% ATK, +20% Crit, sombras ganham +50% dano", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Assassin's Harmony",          type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% ATK, +50% Crit, +40% EVA por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // STORM BLASTER (Sylph)
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  sylphGunner: {
    name: 'Sylph Gunner', race: 'sylph', archetype: 'gunner', stage: 0,
    desc: 'Atirador elemental Sylph.',
    base: { atk: 12, def: 5, hp: 75, mp: 45, eva: 14, crit: 10, mdef: 4 },
    skills: [
      { name: "Quick Shot",          type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 150% r├ípido", cooldown: "6s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Gun Mastery",         type: "Passivo", rarity: "1Ôÿà", effect: "+12% ATK com arma de fogo", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+8% EVA com armadura leve", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  sharpshooter: {
    name: 'Sharpshooter', parent: 'sylphGunner', race: 'sylph', archetype: 'gunner', stage: 1,
    base: { atk: 26, def: 10, hp: 130, mp: 58, eva: 20, crit: 16, mdef: 6 },
    skills: [
      { name: "Burst Fire",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 200% (3 tiros r├ípidos)", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Piercing Shot",      type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 220% + penetra alvos em linha", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Evasive Shot",       type: "Ativo",   rarity: "1Ôÿà", effect: "Dano 170% + esquiva para tr├ís", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Walker",        type: "Passivo", rarity: "1Ôÿà", effect: "+15% Move Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  windSniper: {
    name: 'Wind Sniper', parent: 'sharpshooter', race: 'sylph', archetype: 'gunner', stage: 2,
    base: { atk: 58, def: 18, hp: 260, mp: 85, eva: 32, crit: 28, mdef: 14 },
    skills: [
      { name: "Snipe",              type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 380% long range + crit b├┤nus", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Rapid Fire",         type: "Ativo",   rarity: "2Ôÿà", effect: "+50% ATK Speed por 15s", cooldown: "45s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Explosive Shot",     type: "Ativo",   rarity: "2Ôÿà", effect: "Dano AoE 280%", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Chain Shot",         type: "Ativo",   rarity: "2Ôÿà", effect: "Dano 260% + reset Quick Shot CD", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Aimed Shot",         type: "Ativo",   rarity: "3Ôÿà", effect: "Dano 340% + ignore DEF", cooldown: "20s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sylph's Grace",      type: "Passivo", rarity: "2Ôÿà", effect: "+15% EVA, +10% Move Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Sniper Harmony", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% ATK, +25% Crit, +20% Range por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  stormBlaster: {
    name: 'Storm Blaster', parent: 'windSniper', race: 'sylph', archetype: 'gunner', stage: 3,
    desc: 'Atirador da tempestade ÔÇö devasta├º├úo ├á dist├óncia com armas de fogo.',
    base: { atk: 110, def: 28, hp: 420, mp: 125, eva: 48, crit: 48, mdef: 22 },
    skills: [
      { name: "Storm Shot",                  type: "Ativo",   rarity: "3Ôÿà", effect: "Dano vento 420% + knockback", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Barrage",                type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE vento 380%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Storm Shot",     type: "Ativo",   rarity: "4Ôÿà", effect: "Dano vento 680% + stun 3s + AoE", cooldown: "180s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Storm Blaster Spirit",        type: "Passivo", rarity: "3Ôÿà", effect: "+25% ATK, +20% Crit, +15% Wind Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the Storm Blaster",   type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max HP, +10% EVA, +10% Move Speed", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Storm Blaster Harmony",       type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% ATK, +50% Crit, +35% Wind Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  // HIGH ELF ÔÇö DIVINE TEMPLAR / ELEMENT WEAVER / SHINEMAKER
  // ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
  highElfBase: {
    name: 'High Elf', race: 'highelf', archetype: 'highelf', stage: 0,
    desc: 'Alto Elfo ÔÇö poder divino e elementar.',
    base: { atk: 8, def: 8, hp: 80, mp: 70, matk: 10, mdef: 8, eva: 6, crit: 4 },
    skills: [
      { name: "Holy Light",         type: "Ativo",   rarity: "1Ôÿà", effect: "Dano sagrado 150%", cooldown: "8s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "MP Increase",        type: "Passivo", rarity: "1Ôÿà", effect: "+10% Max MP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // Divine Templar (stages 1-3 mant├®m mesmo nome)
  divineTemplarS1: {
    name: 'Divine Templar', parent: 'highElfBase', race: 'highelf', archetype: 'tank', stage: 1,
    base: { atk: 18, def: 28, hp: 200, mp: 65, eva: 6, crit: 4, mdef: 18 },
    skills: [
      { name: "Holy Strike",        type: "Ativo",   rarity: "1Ôÿà", effect: "Dano sagrado 190%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shield of Light",    type: "Ativo",   rarity: "2Ôÿà", effect: "Absorve 2500 dano + reflete holy", cooldown: "30s", duration: "12s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Holy Shield Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com escudo", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Heavy Armor Mastery", type: "Passivo", rarity: "1Ôÿà", effect: "+15% DEF com armadura pesada", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  divineTemplarS2: {
    name: 'Divine Templar', parent: 'divineTemplarS1', race: 'highelf', archetype: 'tank', stage: 2,
    base: { atk: 38, def: 62, hp: 450, mp: 98, eva: 10, crit: 6, mdef: 38 },
    skills: [
      { name: "Divine Charge",           type: "Ativo",   rarity: "2Ôÿà", effect: "Charge 260% + taunt AoE", cooldown: "18s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Sacred Aegis",            type: "Ativo",   rarity: "3Ôÿà", effect: "+60% Block Rate + reflete holy 15s", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Celestial Punishment",    type: "Ativo",   rarity: "2Ôÿà", effect: "Dano sagrado 280% + silence 3s", cooldown: "20s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Holy Chain",              type: "Ativo",   rarity: "2Ôÿà", effect: "Taunt + root alvo 4s", cooldown: "22s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Divine Templar Harmony (S2)", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% DEF, +25% ATK, +20% M.DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  divineTemplarS3: {
    name: 'Divine Templar', parent: 'divineTemplarS2', race: 'highelf', archetype: 'tank', stage: 3,
    desc: 'Templ├írio Divino ÔÇö tanque sagrado com poder ofensivo e defesa suprema.',
    base: { atk: 72, def: 98, hp: 750, mp: 145, eva: 14, crit: 8, mdef: 68 },
    skills: [
      { name: "Lord Knight",                   type: "Ativo",   rarity: "4Ôÿà", effect: "Forma divina: +50% DEF e ATK por 30s + regen MP", cooldown: "120s", duration: "30s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Divine Shield",                 type: "Ativo",   rarity: "3Ôÿà", effect: "Absorve 8000 dano + cura 20% ao expirar", cooldown: "60s", duration: "15s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ultimate Divine Defense",       type: "Ativo",   rarity: "4Ôÿà", effect: "Imunidade total 10s + taunt AoE massivo", cooldown: "300s", duration: "10s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Holy Charge",      type: "Ativo",   rarity: "4Ôÿà", effect: "Charge dano sagrado 650% + stun 4s + AoE", cooldown: "180s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Lord Knight's Aura",            type: "Self-Buff", rarity: "3Ôÿà", effect: "+30% DEF e +20% ATK para grupo por 120s", cooldown: "120s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Divine Templar Spirit",         type: "Passivo", rarity: "3Ôÿà", effect: "+25% DEF, +20% Max HP, +15% Holy Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Divine Templar",        type: "Passivo", rarity: "3Ôÿà", effect: "+20% Max HP, +15% M.DEF, +15% HP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",              type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Divine Templar Harmony",        type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% DEF, +45% Max HP, +35% Holy Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // Element Weaver (stages 1-3)
  elementWeaverS1: {
    name: 'Element Weaver', parent: 'highElfBase', race: 'highelf', archetype: 'mage', stage: 1,
    base: { atk: 6, def: 8, hp: 100, mp: 120, matk: 28, mdef: 16, eva: 5, crit: 4 },
    skills: [
      { name: "Fire Weave",    type: "Ativo", rarity: "1Ôÿà", effect: "Dano fogo 200%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ice Weave",     type: "Ativo", rarity: "1Ôÿà", effect: "Dano gelo 190% + slow 20% 3s", cooldown: "10s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Wind Weave",    type: "Ativo", rarity: "1Ôÿà", effect: "Dano vento 190%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Robe Mastery",  type: "Passivo", rarity: "1Ôÿà", effect: "+10% M.ATK com robe", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  elementWeaverS2: {
    name: 'Element Weaver', parent: 'elementWeaverS1', race: 'highelf', archetype: 'mage', stage: 2,
    base: { atk: 8, def: 14, hp: 170, mp: 260, matk: 68, mdef: 38, eva: 8, crit: 6 },
    skills: [
      { name: "Elemental Blast",        type: "Ativo",   rarity: "2Ôÿà", effect: "Dano elemental 280%", cooldown: "16s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Elemental Convergence",  type: "Ativo",   rarity: "3Ôÿà", effect: "Dano AoE all-element 340%", cooldown: "25s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Ultimate Dispel",        type: "Ativo",   rarity: "3Ôÿà", effect: "Remove todos os buffs do alvo", cooldown: "60s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Elemental Mastery",      type: "Passivo", rarity: "2Ôÿà", effect: "+15% All Elemental Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Element Weaver Harmony (S2)", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% M.ATK, +25% Cast Speed, +20% Elemental Damage por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  elementWeaverS3: {
    name: 'Element Weaver', parent: 'elementWeaverS2', race: 'highelf', archetype: 'mage', stage: 3,
    desc: 'Tecel├úo elemental ÔÇö mestre supremo dos elementos.',
    base: { atk: 12, def: 22, hp: 290, mp: 440, matk: 128, mdef: 65, eva: 12, crit: 8 },
    skills: [
      { name: "Elemental Overload",          type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE all-element 580% + burn/freeze/shock 6s", cooldown: "60s", duration: "6s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Tri-Element Storm",           type: "Ativo",   rarity: "4Ôÿà", effect: "Dano AoE 650% (fire+ice+wind combo)", cooldown: "120s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Elemental Burst", type: "Ativo",  rarity: "4Ôÿà", effect: "Dano AoE 750% + all debuffs elementais", cooldown: "180s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Element Weaver Spirit",       type: "Passivo", rarity: "3Ôÿà", effect: "+25% M.ATK, +20% All Elemental Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of Element Weaver",      type: "Passivo", rarity: "3Ôÿà", effect: "+15% Max MP, +15% MP Regen", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",            type: "Passivo", rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Element Weaver Harmony",      type: "Self-Buff", rarity: "4Ôÿà", effect: "+60% M.ATK, +50% Elemental Damage, +35% Cast Speed por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  // ShineMaker (stages 1-3)
  shineMakerS1: {
    name: 'ShineMaker', parent: 'highElfBase', race: 'highelf', archetype: 'support', stage: 1,
    base: { atk: 8, def: 10, hp: 110, mp: 110, matk: 24, mdef: 18, eva: 6, crit: 4 },
    skills: [
      { name: "Light Burst",        type: "Ativo",     rarity: "1Ôÿà", effect: "Dano sagrado 190%", cooldown: "10s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Radiant Strike",     type: "Ativo",     rarity: "1Ôÿà", effect: "Dano sagrado 170% + blind 2s", cooldown: "12s", duration: "2s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Purifying Light",    type: "Ativo",     rarity: "1Ôÿà", effect: "Remove 1 debuff do aliado", cooldown: "12s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shining Barrier",    type: "Self-Buff", rarity: "2Ôÿà", effect: "+15% DEF e M.DEF por 120s", cooldown: "60s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  shineMakerS2: {
    name: 'ShineMaker', parent: 'shineMakerS1', race: 'highelf', archetype: 'support', stage: 2,
    base: { atk: 14, def: 22, hp: 210, mp: 220, matk: 52, mdef: 42, eva: 10, crit: 6 },
    skills: [
      { name: "Prismatic Ray",       type: "Ativo",     rarity: "2Ôÿà", effect: "Dano sagrado 280% + slow 30% 4s", cooldown: "16s", duration: "4s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Shining Nova",        type: "Ativo",     rarity: "3Ôÿà", effect: "Dano AoE sagrado 320% + heal aliados 10%", cooldown: "22s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Crystal Arrow",       type: "Ativo",     rarity: "2Ôÿà", effect: "Dano sagrado 260%", cooldown: "14s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Light of Creation",   type: "Self-Buff", rarity: "3Ôÿà", effect: "+25% M.ATK, +15% Heal Power por 120s", cooldown: "120s", duration: "120s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Brilliant Aura",      type: "Party-Buff", rarity: "3Ôÿà", effect: "+15% All Stats para o grupo por 300s", cooldown: "60s", duration: "300s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "ShineMaker Harmony (S2)", type: "Self-Buff", rarity: "3Ôÿà", effect: "+35% M.ATK, +25% Heal Power, +20% M.DEF por 25 min", cooldown: "60 min", duration: "25 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  },

  shineMakerS3: {
    name: 'ShineMaker', parent: 'shineMakerS2', race: 'highelf', archetype: 'support', stage: 3,
    desc: 'Criadora de luz ÔÇö suporte sagrado com dano ofensivo.',
    base: { atk: 22, def: 38, hp: 350, mp: 400, matk: 98, mdef: 78, eva: 14, crit: 8 },
    skills: [
      { name: "Luminous Wave",               type: "Ativo",     rarity: "3Ôÿà", effect: "Dano AoE sagrado 400% + heal aliados 20%", cooldown: "28s", duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Star Fall",                    type: "Ativo",     rarity: "4Ôÿà", effect: "Dano AoE sagrado 580% + stun 3s", cooldown: "60s", duration: "3s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "Transcendent Star Fall",       type: "Ativo",     rarity: "4Ôÿà", effect: "Dano AoE sagrado 750% + blind 5s + heal grupo 30%", cooldown: "180s", duration: "5s", note: "Skill permanece ap├│s trocar de classe" },
      { name: "ShineMaker Spirit",            type: "Passivo",   rarity: "3Ôÿà", effect: "+25% M.ATK, +20% Heal Power, +15% Holy Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Body of the ShineMaker",       type: "Passivo",   rarity: "3Ôÿà", effect: "+15% Max MP, +15% MP Regen, +10% Max HP", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "Master of Combat",             type: "Passivo",   rarity: "4Ôÿà", effect: "+10% All Stats, +15% PvE Damage", cooldown: null, duration: null, note: "Skill permanece ap├│s trocar de classe" },
      { name: "ShineMaker's Harmony", type: "Self-Buff", rarity: "4Ôÿà", effect: "+55% M.ATK, +45% Heal Power, +35% Holy Damage por 30 min", cooldown: "90 min", duration: "30 min", note: "Skill permanece ap├│s trocar de classe" }
    ]
  }
};

if (typeof window !== 'undefined') {
  window.EchoData = { RACES_ECHO, CLASSES_ECHO };
  window.GameData = window.GameData || {};
  window.GameData.RACES_ECHO = RACES_ECHO;
  window.GameData.CLASSES_ECHO = CLASSES_ECHO;
}

export { RACES_ECHO, CLASSES_ECHO };

