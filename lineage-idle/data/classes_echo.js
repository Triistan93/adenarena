const RACES_ECHO = {
  human:   { name: 'Human',    desc: 'Versáteis, equilibrados em combate e magia.',     stats: { atk: 0,  def: 0,  eva: 0,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  elf:     { name: 'Elf',      desc: 'Graciosos, alta esquiva e velocidade de ataque.',  stats: { atk: 0,  def: -2, eva: 8,  matk: 0,  mdef: 0  }, startZone: 'elvenForest' },
  darkelf: { name: 'Dark Elf', desc: 'Sombrios, dano crítico e magia negra devastadora.',stats: { atk: 2,  def: -2, eva: 4,  matk: 6,  mdef: 2  }, startZone: 'darkForest' },
  orc:     { name: 'Orc',      desc: 'Resistentes, força bruta e HP elevado.',           stats: { atk: 4,  def: 6,  eva: -4, matk: -2, mdef: -2 }, startZone: 'orcVillage' },
  dwarf:   { name: 'Dwarf',    desc: 'Mestres artesãos com bônus de loot e craft.',      stats: { atk: 0,  def: 4,  eva: -2, matk: 0,  mdef: 0, lootBonus: 0.15 }, startZone: 'dwarvenMine' },
  kamael:  { name: 'Kamael',   desc: 'Ágeis e mortais, especialistas em alma e espada.', stats: { atk: 6,  def: -2, eva: 6,  matk: 0,  mdef: 0  }, startZone: 'kamaelLair' },
  ertheia: { name: 'Ertheia',  desc: 'Guerreiros do vento com alto potencial mágico.',   stats: { atk: 2,  def: 0,  eva: 10, matk: 4,  mdef: 0  }, startZone: 'talkingIsland' },
  sylph:   { name: 'Sylph',    desc: 'Atiradores elementais do vento com armas de fogo.',stats: { atk: 4,  def: -2, eva: 12, matk: 2,  mdef: 0  }, startZone: 'talkingIsland' },
  highelf: { name: 'High Elf', desc: 'Elfos supremos com magia sagrada e defesa divina.',stats: { atk: 0,  def: 2,  eva: 4,  matk: 8,  mdef: 4  }, startZone: 'elvenForest' }
};

const CLASSES_ECHO = {
  // Stage 0 (Base classes - no parent)
  fighter: { name: 'Fighter', archetype: 'fighter', stage: 0, desc: 'Lutador basico', base: {} },
  mage: { name: 'Mage', archetype: 'mage', stage: 0, desc: 'Mago basico', base: {} },
  artisan: { name: 'Artisan', archetype: 'artisan', stage: 0, race: 'dwarf', desc: 'Artesao anao', base: {} },
  soulbreaker: { name: 'Soulbreaker', archetype: 'soulbreaker', stage: 0, race: 'kamael', desc: 'Lutador kamael', base: {} },
  deathPilgrim: { name: 'Death Pilgrim', archetype: 'deathknight', stage: 0, desc: 'Peregrino das trevas, futuro Death Knight', base: {} },
  wargBase: { name: 'Warg Base', archetype: 'warg', stage: 0, race: 'human', desc: 'Lutador primitivo que desperta como Warg', base: {} },
  assassinBase: { name: 'Assassin Hunter', archetype: 'assassin', stage: 0, race: 'human', desc: 'Caçador das sombras, Assassin Hunter', base: {} },
  sylphGunner: { name: 'Sylph Gunner', archetype: 'gunner', stage: 0, race: 'sylph', desc: 'Atirador Sylph com armas de fogo elementais', base: {} },
  highElfBase: { name: 'High Elf', archetype: 'highelf', stage: 0, race: 'highelf', desc: 'Alto Elfo de poder divino', base: {} },
  bloodRoseBase: { name: 'Blood Rose', archetype: 'bloodrose', stage: 0, race: 'ertheia', desc: 'Lutadora mística Ertheia Blood Rose', base: {} },

  // Stage 1 (1st Transfer lv20)
  warrior: { name: 'Warrior', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1, base: { atk: 25, def: 12, hp: 50, mdef: 5 } },
  knight: { name: 'Knight', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1, base: { atk: 15, def: 28, hp: 120, mdef: 15 } },
  rogue: { name: 'Rogue', parent: 'fighter', race: 'human', archetype: 'fighter', stage: 1, base: { atk: 22, def: 10, eva: 12, crit: 8, mdef: 5 } },
  wizard: { name: 'Wizard', parent: 'mage', race: 'human', archetype: 'mage', stage: 1, base: { matk: 32, mdef: 18, mp: 80, atk: 5 } },
  cleric: { name: 'Cleric', parent: 'mage', race: 'human', archetype: 'mage', stage: 1, base: { matk: 20, mdef: 25, def: 18, hp: 40, mp: 60 } },
  elvenKnight: { name: 'Elven Knight', parent: 'fighter', race: 'elf', archetype: 'fighter', stage: 1, base: { atk: 18, def: 25, eva: 10, hp: 100, mdef: 12 } },
  elvenScout: { name: 'Elven Scout', parent: 'fighter', race: 'elf', archetype: 'fighter', stage: 1, base: { atk: 24, def: 8, eva: 18, crit: 10 } },
  elvenWizard: { name: 'Elven Wizard', parent: 'mage', race: 'elf', archetype: 'mage', stage: 1, base: { matk: 34, mdef: 20, mp: 90, eva: 5 } },
  oracle: { name: 'Oracle', parent: 'mage', race: 'elf', archetype: 'mage', stage: 1, base: { matk: 22, mdef: 28, def: 16, hp: 50, mp: 80 } },
  palusKnight: { name: 'Palus Knight', parent: 'fighter', race: 'darkelf', archetype: 'fighter', stage: 1, base: { atk: 24, def: 22, hp: 90, mdef: 14 } },
  deAssassin: { name: 'Assassin', parent: 'fighter', race: 'darkelf', archetype: 'fighter', stage: 1, base: { atk: 30, def: 6, eva: 14, crit: 15 } },
  darkWizard: { name: 'Dark Wizard', parent: 'mage', race: 'darkelf', archetype: 'mage', stage: 1, base: { matk: 40, mdef: 15, mp: 75, atk: 8 } },
  shillienOracle: { name: 'Shillien Oracle', parent: 'mage', race: 'darkelf', archetype: 'mage', stage: 1, base: { matk: 26, mdef: 24, def: 14, hp: 45, mp: 70 } },
  orcRaider: { name: 'Orc Raider', parent: 'fighter', race: 'orc', archetype: 'fighter', stage: 1, base: { atk: 32, def: 18, hp: 140, mdef: 4 } },
  monk: { name: 'Monk', parent: 'fighter', race: 'orc', archetype: 'fighter', stage: 1, base: { atk: 28, def: 14, eva: 8, hp: 120, crit: 6 } },
  orcRider: { name: 'Rider', parent: 'fighter', race: 'orc', archetype: 'fighter', stage: 1, desc: 'Orc montado com lanças de guerra', base: { atk: 26, def: 20, hp: 130 } },
  orcShaman: { name: 'Orc Shaman', parent: 'mage', race: 'orc', archetype: 'mage', stage: 1, base: { matk: 24, mdef: 22, def: 20, hp: 90, mp: 60 } },
  scavenger: { name: 'Scavenger', parent: 'artisan', race: 'dwarf', archetype: 'artisan', stage: 1, base: { atk: 18, def: 18, lootBonus: 0.35 } },
  artisanClass: { name: 'Artisan Master', parent: 'artisan', race: 'dwarf', archetype: 'artisan', stage: 1, base: { atk: 20, def: 22, hp: 60, lootBonus: 0.25 } },
  trooper: { name: 'Trooper', parent: 'soulbreaker', race: 'kamael', archetype: 'soulbreaker', stage: 1, base: { atk: 30, eva: 12, crit: 10 } },
  warder: { name: 'Warder', parent: 'soulbreaker', race: 'kamael', archetype: 'soulbreaker', stage: 1, base: { atk: 28, def: 8, eva: 14, crit: 12 } },
  hatamoto: { name: 'Hatamoto', parent: 'soulbreaker', race: 'kamael', archetype: 'soulbreaker', stage: 1, desc: 'Guerreiro Kamael ancestral do caminho da katana', base: { atk: 26, def: 10, eva: 10 } },
  marauder: { name: 'Marauder', parent: 'fighter', race: 'ertheia', archetype: 'fighter', stage: 1, base: { atk: 26, def: 10, eva: 16, crit: 10 } },
  sayhaSeer: { name: 'Sayha Seer', parent: 'mage', race: 'ertheia', archetype: 'mage', stage: 1, base: { matk: 36, mdef: 18, mp: 85 } },
  deathBlade: { name: 'Death Blade', parent: 'deathPilgrim', archetype: 'deathknight', stage: 1, base: { atk: 28, def: 20, hp: 100, mdef: 10 } },
  wargS1: { name: 'Warg', parent: 'wargBase', archetype: 'warg', stage: 1, base: { atk: 30, def: 8, eva: 10, crit: 8 } },
  assassinS1: { name: 'Assassin', parent: 'assassinBase', archetype: 'assassin', stage: 1, base: { atk: 32, def: 6, eva: 16, crit: 14 } },
  sharpshooter: { name: 'Sharpshooter', parent: 'sylphGunner', race: 'sylph', archetype: 'gunner', stage: 1, base: { atk: 28, def: 8, eva: 18, crit: 10 } },
  divineTemplarS1: { name: 'Divine Templar', parent: 'highElfBase', race: 'highelf', archetype: 'divinetemplar', stage: 1, base: { atk: 20, def: 30, hp: 120, mdef: 20 } },
  elementWeaverS1: { name: 'Element Weaver', parent: 'highElfBase', race: 'highelf', archetype: 'elementweaver', stage: 1, base: { matk: 36, mdef: 22, mp: 100, eva: 6 } },
  shinemakerS1: { name: 'ShineMaker', parent: 'artisan', race: 'dwarf', archetype: 'shinemaker', stage: 1, base: { matk: 24, def: 20, hp: 80, lootBonus: 0.2 } },
  bloodRoseS1: { name: 'Blood Rose', parent: 'bloodRoseBase', race: 'ertheia', archetype: 'bloodrose', stage: 1, base: { matk: 28, def: 14, eva: 12, hp: 60, mp: 80 } },

  // Stage 2 (2nd Transfer lv40)
  gladiator: { name: 'Gladiator', parent: 'warrior', stage: 2, base: { atk: 55, def: 25, hp: 150, crit: 12 } },
  warlord: { name: 'Warlord', parent: 'warrior', stage: 2, base: { atk: 48, def: 35, hp: 180, mdef: 20 } },
  paladin: { name: 'Paladin', parent: 'knight', stage: 2, base: { atk: 32, def: 60, hp: 280, mdef: 35 } },
  darkAvenger: { name: 'Dark Avenger', parent: 'knight', stage: 2, base: { atk: 45, def: 50, hp: 220, mdef: 30 } },
  treasureHunter: { name: 'Treasure Hunter', parent: 'rogue', stage: 2, base: { atk: 50, def: 18, eva: 25, crit: 20 } },
  hawkeye: { name: 'Hawkeye', parent: 'rogue', stage: 2, base: { atk: 58, def: 15, eva: 18, crit: 18 } },
  sorcerer: { name: 'Sorcerer', parent: 'wizard', stage: 2, base: { matk: 70, mdef: 40, mp: 180 } },
  necromancer: { name: 'Necromancer', parent: 'wizard', stage: 2, base: { matk: 65, mdef: 35, mp: 150, hp: 80 } },
  warlock: { name: 'Warlock', parent: 'wizard', stage: 2, desc: 'Summoner of shadow spirits', base: { matk: 60, mdef: 38, mp: 170, hp: 60 } },
  bishop: { name: 'Bishop', parent: 'cleric', stage: 2, base: { matk: 45, mdef: 55, def: 30, mp: 160 } },
  prophet: { name: 'Prophet', parent: 'cleric', stage: 2, base: { matk: 40, mdef: 45, def: 40, hp: 100 } },
  templeKnight: { name: 'Temple Knight', parent: 'elvenKnight', stage: 2, base: { atk: 35, def: 58, hp: 240, eva: 15, mdef: 32 } },
  swordsinger: { name: 'Swordsinger', parent: 'elvenKnight', stage: 2, base: { atk: 45, def: 40, hp: 200, eva: 12, crit: 10 } },
  plainsWalker: { name: 'PlainsWalker', parent: 'elvenScout', stage: 2, base: { atk: 52, def: 16, eva: 30, crit: 22 } },
  silverRanger: { name: 'Silver Ranger', parent: 'elvenScout', stage: 2, base: { atk: 60, def: 14, eva: 22, crit: 20 } },
  spellsinger: { name: 'Spellsinger', parent: 'elvenWizard', stage: 2, base: { matk: 72, mdef: 42, mp: 190, eva: 8 } },
  elementalSummoner: { name: 'Elemental Summoner', parent: 'elvenWizard', stage: 2, base: { matk: 62, mdef: 38, mp: 170, hp: 60 } },
  elder: { name: 'Elven Elder', parent: 'oracle', stage: 2, base: { matk: 48, mdef: 58, def: 28, mp: 200 } },
  shillienKnight: { name: 'Shillien Knight', parent: 'palusKnight', stage: 2, base: { atk: 48, def: 52, hp: 210, mdef: 35 } },
  bladedancer: { name: 'Bladedancer', parent: 'palusKnight', stage: 2, base: { atk: 56, def: 32, hp: 190, crit: 14 } },
  abyssWalker: { name: 'Abyss Walker', parent: 'deAssassin', stage: 2, base: { atk: 62, def: 14, eva: 20, crit: 26 } },
  phantomRanger: { name: 'Phantom Ranger', parent: 'deAssassin', stage: 2, base: { atk: 66, def: 12, eva: 16, crit: 24 } },
  spellhowler: { name: 'Spellhowler', parent: 'darkWizard', stage: 2, base: { matk: 85, mdef: 38, mp: 175 } },
  phantomSummoner: { name: 'Phantom Summoner', parent: 'darkWizard', stage: 2, base: { matk: 66, mdef: 36, mp: 160, hp: 70 } },
  shillienElder: { name: 'Shillien Elder', parent: 'shillienOracle', stage: 2, base: { matk: 52, mdef: 50, def: 26, mp: 180 } },
  destroyer: { name: 'Destroyer', parent: 'orcRaider', stage: 2, base: { atk: 68, def: 35, hp: 320, mdef: 15 } },
  tyrant: { name: 'Tyrant', parent: 'monk', stage: 2, base: { atk: 60, def: 28, eva: 14, hp: 260, crit: 12 } },
  dragoon: { name: 'Dragoon', parent: 'orcRider', stage: 2, desc: 'Orc cavaleiro de batalha com lanças de guerra pesadas', base: { atk: 72, def: 40, hp: 300, mdef: 10 } },
  overlord: { name: 'Overlord', parent: 'orcShaman', stage: 2, base: { matk: 50, mdef: 48, def: 45, hp: 180, mp: 140 } },
  warcryer: { name: 'Warcryer', parent: 'orcShaman', stage: 2, base: { matk: 46, mdef: 44, def: 40, hp: 160, mp: 150 } },
  bountyHunter: { name: 'Bounty Hunter', parent: 'scavenger', stage: 2, base: { atk: 40, def: 40, lootBonus: 0.5 } },
  warsmith: { name: 'Warsmith', parent: 'artisanClass', stage: 2, base: { atk: 44, def: 48, hp: 160, lootBonus: 0.35 } },
  berserker: { name: 'Berserker', parent: 'trooper', stage: 2, base: { atk: 64, def: 20, eva: 16, crit: 16 } },
  soulhound: { name: 'Soulhound', parent: 'trooper', stage: 2, base: { atk: 62, eva: 20, crit: 18 } },
  arbalester: { name: 'Arbalester', parent: 'warder', stage: 2, base: { atk: 60, def: 16, eva: 22, crit: 20 } },
  ronin: { name: 'Ronin', parent: 'hatamoto', stage: 2, desc: 'Espadachim Kamael do caminho do bushido', base: { atk: 58, def: 18, eva: 14, crit: 14 } },
  ertheiaWarrior: { name: 'Eviscerator', parent: 'marauder', stage: 2, base: { atk: 62, def: 22, eva: 28, crit: 18 } },
  windRiderErth: { name: 'Sayha Seeker', parent: 'sayhaSeer', stage: 2, base: { matk: 74, mdef: 40, mp: 185 } },
  deathMessenger: { name: 'Death Messenger', parent: 'deathBlade', archetype: 'deathknight', stage: 2, base: { atk: 65, def: 45, hp: 220, mdef: 25 } },
  wargS2: { name: 'Warg', parent: 'wargS1', archetype: 'warg', stage: 2, base: { atk: 68, def: 20, eva: 18, crit: 20 } },
  assassinS2: { name: 'Assassin', parent: 'assassinS1', archetype: 'assassin', stage: 2, base: { atk: 72, def: 14, eva: 28, crit: 28 } },
  windSniper: { name: 'Wind Sniper', parent: 'sharpshooter', race: 'sylph', archetype: 'gunner', stage: 2, base: { atk: 66, def: 12, eva: 26, crit: 22 } },
  divineTemplarS2: { name: 'Divine Templar', parent: 'divineTemplarS1', race: 'highelf', archetype: 'divinetemplar', stage: 2, base: { atk: 55, def: 90, hp: 380, mdef: 55 } },
  elementWeaverS2: { name: 'Element Weaver', parent: 'elementWeaverS1', race: 'highelf', archetype: 'elementweaver', stage: 2, base: { matk: 85, mdef: 50, mp: 240, eva: 10 } },
  shinemakerS2: { name: 'ShineMaker', parent: 'shinemakerS1', race: 'dwarf', archetype: 'shinemaker', stage: 2, base: { matk: 55, def: 45, hp: 180, lootBonus: 0.4 } },
  bloodRoseS2: { name: 'Blood Rose', parent: 'bloodRoseS1', race: 'ertheia', archetype: 'bloodrose', stage: 2, base: { matk: 65, def: 28, eva: 20, hp: 120, mp: 160 } },
  // Elf Death Knight line (new)
  elfDeathPilgrim: { name: 'Dark Elf Death Pilgrim', archetype: 'deathknight', stage: 0, race: 'darkelf', desc: 'Peregrino das trevas Dark Elf, futuro Death Knight das sombras', base: {} },
  elfDeathBlade: { name: 'Dark Death Blade', parent: 'elfDeathPilgrim', archetype: 'deathknight', stage: 1, race: 'darkelf', base: { atk: 30, def: 18, hp: 95, mdef: 12 } },
  elfDeathMessenger: { name: 'Dark Death Messenger', parent: 'elfDeathBlade', archetype: 'deathknight', stage: 2, race: 'darkelf', base: { atk: 68, def: 42, hp: 210, mdef: 28 } },

  // Stage 3 (3rd Transfer lv76)
  duelist: { name: 'Duelist', parent: 'gladiator', race: 'human', stage: 3, base: { atk: 110, def: 45, hp: 300, crit: 20 } },
  dreadnought: { name: 'Dreadnought', parent: 'warlord', race: 'human', stage: 3, base: { atk: 95, def: 60, hp: 380, mdef: 35 } },
  phoenixKnight: { name: 'Phoenix Knight', parent: 'paladin', race: 'human', stage: 3, base: { atk: 65, def: 110, hp: 550, mdef: 70 } },
  hellKnight: { name: 'Hell Knight', parent: 'darkAvenger', race: 'human', stage: 3, base: { atk: 90, def: 95, hp: 450, mdef: 60 } },
  adventurer: { name: 'Adventurer', parent: 'treasureHunter', race: 'human', stage: 3, base: { atk: 100, def: 35, eva: 48, crit: 35 } },
  sagittarius: { name: 'Sagittarius', parent: 'hawkeye', race: 'human', stage: 3, base: { atk: 115, def: 30, eva: 32, crit: 30 } },
  archmage: { name: 'Archmage', parent: 'sorcerer', race: 'human', stage: 3, base: { matk: 140, mdef: 80, mp: 350 } },
  soultaker: { name: 'Soultaker', parent: 'necromancer', race: 'human', stage: 3, base: { matk: 130, mdef: 70, mp: 300, hp: 160 } },
  arcanaLord: { name: 'Arcana Lord', parent: 'warlock', race: 'human', stage: 3, base: { matk: 115, mdef: 75, mp: 320 } },
  cardinal: { name: 'Cardinal', parent: 'bishop', race: 'human', stage: 3, base: { matk: 90, mdef: 110, def: 60, mp: 340 } },
  hierophant: { name: 'Hierophant', parent: 'prophet', race: 'human', stage: 3, base: { matk: 80, mdef: 90, def: 80, hp: 200 } },
  evasTemplar: { name: 'Evas Templar', parent: 'templeKnight', race: 'elf', stage: 3, base: { atk: 70, def: 105, hp: 480, eva: 30, mdef: 65 } },
  swordMuse: { name: 'Sword Muse', parent: 'swordsinger', race: 'elf', stage: 3, base: { atk: 90, def: 80, hp: 400, eva: 24, crit: 20 } },
  windRiderElven: { name: 'Wind Rider', parent: 'plainsWalker', race: 'elf', stage: 3, base: { atk: 104, def: 32, eva: 60, crit: 40 } },
  moonlightSentinel: { name: 'Moonlight Sentinel', parent: 'silverRanger', race: 'elf', stage: 3, base: { atk: 118, def: 28, eva: 42, crit: 35 } },
  mysticMuse: { name: 'Mystic Muse', parent: 'spellsinger', race: 'elf', stage: 3, base: { matk: 145, mdef: 85, mp: 380, eva: 16 } },
  elementalMaster: { name: 'Elemental Master', parent: 'elementalSummoner', race: 'elf', stage: 3, base: { matk: 120, mdef: 76, mp: 340 } },
  evasSaint: { name: 'Evas Saint', parent: 'elder', race: 'elf', stage: 3, base: { matk: 95, mdef: 115, def: 55, mp: 400 } },
  shillienTemplar: { name: 'Shillien Templar', parent: 'shillienKnight', race: 'darkelf', stage: 3, base: { atk: 96, def: 98, hp: 420, mdef: 70 } },
  spectralDancer: { name: 'Spectral Dancer', parent: 'bladedancer', race: 'darkelf', stage: 3, base: { atk: 112, def: 64, hp: 380, crit: 28 } },
  ghostHunter: { name: 'Ghost Hunter', parent: 'abyssWalker', race: 'darkelf', stage: 3, base: { atk: 124, def: 28, eva: 40, crit: 50 } },
  ghostSentinel: { name: 'Ghost Sentinel', parent: 'phantomRanger', race: 'darkelf', stage: 3, base: { atk: 132, def: 24, eva: 32, crit: 45 } },
  stormScreamer: { name: 'Storm Screamer', parent: 'spellhowler', race: 'darkelf', stage: 3, base: { matk: 170, mdef: 76, mp: 350 } },
  spectralMaster: { name: 'Spectral Master', parent: 'phantomSummoner', race: 'darkelf', stage: 3, base: { matk: 132, mdef: 72, mp: 320 } },
  shillienSaint: { name: 'Shillien Saint', parent: 'shillienElder', race: 'darkelf', stage: 3, base: { matk: 104, mdef: 100, def: 52, mp: 360 } },
  titan: { name: 'Titan', parent: 'destroyer', race: 'orc', stage: 3, base: { atk: 136, def: 70, hp: 640, mdef: 30 } },
  grandKhavatari: { name: 'Grand Khavatari', parent: 'tyrant', race: 'orc', stage: 3, base: { atk: 120, def: 56, eva: 28, hp: 520, crit: 24 } },
  vanguardRider: { name: 'Vanguard Rider', parent: 'dragoon', race: 'orc', stage: 3, desc: 'Cavaleiro Orc supremo com lanças de guerra e armadura pesada montada', base: { atk: 130, def: 80, hp: 580, mdef: 20 } },
  dominator: { name: 'Dominator', parent: 'overlord', race: 'orc', stage: 3, base: { matk: 100, mdef: 96, def: 90, hp: 360, mp: 280 } },
  doomcryer: { name: 'Doomcryer', parent: 'warcryer', race: 'orc', stage: 3, base: { matk: 92, mdef: 88, def: 80, hp: 320, mp: 300 } },
  fortuneSeeker: { name: 'Fortune Seeker', parent: 'bountyHunter', race: 'dwarf', stage: 3, base: { atk: 80, def: 80, hp: 380, lootBonus: 1.0 } },
  maestro: { name: 'Maestro', parent: 'warsmith', race: 'dwarf', stage: 3, base: { atk: 88, def: 96, hp: 420, lootBonus: 0.7 } },
  doombringer: { name: 'Doombringer', parent: 'berserker', race: 'kamael', stage: 3, base: { atk: 128, def: 40, eva: 32, crit: 32 } },
  soulHound: { name: 'Soul Hound', parent: 'soulhound', race: 'kamael', stage: 3, base: { atk: 124, eva: 40, crit: 36, matk: 100 } },
  trickster: { name: 'Trickster', parent: 'arbalester', race: 'kamael', stage: 3, base: { atk: 120, def: 32, eva: 44, crit: 40 } },
  samurai: { name: 'Samurai', parent: 'ronin', race: 'kamael', stage: 3, desc: 'Mestre Kamael da katana, bushido e do espírito do corte supremo', base: { atk: 126, def: 35, eva: 36, crit: 38 } },
  eviscerator: { name: 'Eviscerator Master', parent: 'ertheiaWarrior', race: 'ertheia', stage: 3, base: { atk: 125, def: 60, eva: 42, hp: 460, crit: 35 } },
  sayhaSeeker: { name: 'Sayha Seeker', parent: 'windRiderErth', race: 'ertheia', stage: 3, base: { atk: 122, def: 35, eva: 58, crit: 42 } },
  deathKnight: { name: 'Death Knight', parent: 'deathMessenger', race: 'human', archetype: 'deathknight', stage: 3, desc: 'Cavaleiro da Morte supremo com Death Points e poderes das trevas', base: { atk: 138, def: 85, hp: 580, mdef: 50, crit: 30 } },
  elfDeathKnight: { name: 'Dark Elf Death Knight', parent: 'elfDeathMessenger', race: 'darkelf', archetype: 'deathknight', stage: 3, desc: 'Cavaleiro da Morte Dark Elf com Dark Points e magia de sombras', base: { atk: 135, def: 82, hp: 560, mdef: 55, crit: 35 } },
  warg: { name: 'Warg', parent: 'wargS2', race: 'human', archetype: 'warg', stage: 3, desc: 'Forma final do Warg - transformação em lobo ancestral devastador', base: { atk: 148, def: 35, eva: 30, crit: 40 } },
  assassinFinal: { name: 'Assassin', parent: 'assassinS2', race: 'human', archetype: 'assassin', stage: 3, desc: 'Assassino supremo com sistema de sombras e Assassin Daggers', base: { atk: 145, def: 22, eva: 50, crit: 55 } },
  stormBlaster: { name: 'Storm Blaster', parent: 'windSniper', race: 'sylph', archetype: 'gunner', stage: 3, desc: 'Atirador supremo Sylph com armas de vento elementais e Storm Shot', base: { atk: 140, def: 28, eva: 45, crit: 38 } },
  divineTemplar: { name: 'Divine Templar', parent: 'divineTemplarS2', race: 'highelf', archetype: 'divinetemplar', stage: 3, desc: 'Tanque supremo High Elf com poder divino e Sacred Aegis', base: { atk: 90, def: 140, hp: 680, mdef: 100 } },
  elementWeaver: { name: 'Element Weaver', parent: 'elementWeaverS2', race: 'highelf', archetype: 'elementweaver', stage: 3, desc: 'Mago elemental supremo High Elf combinando Fogo, Água e Vento', base: { matk: 175, mdef: 95, mp: 420, eva: 14 } },
  shinemaker: { name: 'ShineMaker', parent: 'shinemakerS2', race: 'dwarf', archetype: 'shinemaker', stage: 3, desc: 'Mestre da luz cristalina - DPS/Suporte supremo Dwarf', base: { matk: 130, def: 70, hp: 380, lootBonus: 0.8 } },
  bloodRose: { name: 'Blood Rose', parent: 'bloodRoseS2', race: 'ertheia', archetype: 'bloodrose', stage: 3, desc: 'Mística Ertheia com ataques híbridos de espinhos e roubo de vida', base: { matk: 160, def: 55, eva: 35, hp: 320, mp: 380 } }
};

const SKILL_DEFS_ECHO = {
  // GROUP A
  fighter_will: { name: 'Fighter\'s Will Harmony', info: '+15% P.Atk, +10% Atk Speed, +15 Move Speed (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'fighter', reqLvl: 1, icon: '⚔️', tier: 0, desc: '' },
  battle_roar: { name: 'Battle Roar', info: '+20% Max HP Heal burst (60s cd)', cost: 5, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '📯', tier: 0, desc: '', baseCd: 60000, pwr: 0, effect: 'warcry' },
  power_strike_f: { name: 'Power Strike', info: 'Auto-cast: 30 Pwr Physical strike', cost: 5, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '⚔️💥', tier: 0, desc: '', baseCd: 5000, pwr: 30, effect: 'dmg' },
  weapon_mastery_f: { name: 'Weapon Mastery', info: '+2.5 ATK / lvl', cost: 5, max: 10, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '🗡️', tier: 0, desc: '' },
  light_armor_f: { name: 'Light Armor Mastery', info: '+1.5 DEF / lvl', cost: 10, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '🥋', tier: 1, desc: '' },
  heavy_armor_f: { name: 'Heavy Armor Mastery', info: '+2.5 DEF / lvl', cost: 10, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '🛡️', tier: 1, desc: '' },
  boost_hp_f: { name: 'Boost HP', info: '+40 Max HP / lvl', cost: 10, max: 5, type: 'stat', classReq: 'fighter', reqLvl: 1, icon: '❤️', tier: 1, desc: '' },
  stun_attack: { name: 'Stun Attack', info: 'Auto-cast: 28 Pwr + 3s Stun', cost: 15, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '💫', tier: 1, desc: '', baseCd: 8000, pwr: 28, effect: 'stun' },
  war_cry: { name: 'War Cry', info: '+20% ATK for 30s burst', cost: 25, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '📯', tier: 2, desc: '', baseCd: 30000, pwr: 0, effect: 'warcry' },
  lethal_blow_f: { name: 'Lethal Blow', info: 'Auto-cast: 45 Pwr critical thrust', cost: 30, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '🩸', tier: 2, desc: '', baseCd: 9000, pwr: 45, effect: 'dmg' },
  frenzy_f: { name: 'Frenzy', info: '+30% ATK when below 40% HP', cost: 25, max: 5, type: 'proc', classReq: 'fighter', reqLvl: 1, icon: '🔥💢', tier: 2, desc: '', baseCd: 60000, pwr: 0, effect: 'warcry' },

  mage_will: { name: 'Mage\'s Will Harmony', info: '+15% M.Atk, +10% Cast Speed, +50 Max MP (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'mage', reqLvl: 1, icon: '🔮', tier: 0, desc: '' },
  energy_bolt_m: { name: 'Energy Bolt', info: 'Auto-cast: 22 Pwr magic bolt', cost: 5, max: 5, type: 'proc', classReq: 'mage', reqLvl: 1, icon: '⚡🔮', tier: 0, desc: '', baseCd: 3000, pwr: 22, effect: 'dmg' },
  weapon_mastery_m: { name: 'Magical Weapon Mastery', info: '+2.5 MATK / lvl', cost: 5, max: 10, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '🔮', tier: 0, desc: '' },
  robe_mast_m: { name: 'Robe Mastery', info: '+1.7 DEF / lvl in robes', cost: 10, max: 5, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '👘', tier: 0, desc: '' },
  boost_mana_m: { name: 'Boost Mana', info: '+40 Max MP / lvl', cost: 10, max: 5, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '🌊', tier: 1, desc: '' },
  anti_magic_m: { name: 'Anti Magic', info: '+18 MDEF, +5% Magic Resist / lvl', cost: 15, max: 5, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '🛡️✨', tier: 1, desc: '' },
  higher_mana_m: { name: 'Higher Mana', info: '+2 MP regen / lvl', cost: 15, max: 5, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '💧', tier: 1, desc: '' },
  quick_recycle: { name: 'Quick Recharge', info: '-15% Skill cooldowns / lvl', cost: 25, max: 5, type: 'stat', classReq: 'mage', reqLvl: 1, icon: '⏩', tier: 2, desc: '' },

  // GROUP B
  warriors_harmony: { name: 'Warrior\'s Harmony', info: 'P.Atk +20%, Atk Speed +15%, HP Regen +30% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'warrior', reqLvl: 1, icon: '⚔️', tier: 0, desc: '' },
  triple_slash: { name: 'Triple Slash', info: 'Auto-cast: 35 Pwr triple dagger slash', cost: 15, max: 5, type: 'proc', classReq: 'gladiator', reqLvl: 1, icon: '🗡️🗡️🗡️', tier: 1, desc: '', baseCd: 4000, pwr: 35, effect: 'dmg' },
  sonicBlasterG: { name: 'Sonic Blaster', info: 'Auto-cast: 55 Pwr sonic wave', cost: 20, max: 5, type: 'proc', classReq: 'gladiator', reqLvl: 1, icon: '🔊', tier: 1, desc: '', baseCd: 6000, pwr: 55, effect: 'dmg' },
  gladiators_harmony: { name: 'Gladiator\'s Harmony', info: 'Dual P.Atk +25%, Crit Dmg +20%, Atk Speed +15% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'gladiator', reqLvl: 1, icon: '⚔️⚔️', tier: 1, desc: '' },
  dual_weapon_mast: { name: 'Dual Weapon Mastery', info: '+15% P.Atk dual weapons / lvl', cost: 20, max: 5, type: 'stat', classReq: 'gladiator', reqLvl: 1, icon: '⚔️', tier: 2, desc: '' },
  sonicRage: { name: 'Sonic Rage', info: 'Auto-cast: 55 Pwr + -15% DEF debuff 6s', cost: 25, max: 5, type: 'proc', classReq: 'gladiator', reqLvl: 1, icon: '🔊💥', tier: 2, desc: '', baseCd: 6000, pwr: 55, effect: 'dmg' },
  duelist_harmony: { name: 'Duelist\'s Harmony', info: 'Dual P.Atk +35%, 100% Crit Rate 5min (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'duelist', reqLvl: 1, icon: '🌟⚔️', tier: 3, starRank: 1, desc: '' },
  transcendent_dual_blow: { name: 'Transcendent Dual Blow', info: '1500% P.Atk Crit guaranteed, resets Sonic Rage on kill (4★)', cost: 500, max: 5, type: 'proc', classReq: 'duelist', reqLvl: 1, icon: '💥💥', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 150, effect: 'dmg' },

  // GROUP C
  knights_harmony: { name: 'Knight\'s Harmony', info: 'P.Def +25%, Shield Block +30%, Max HP +15% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'knight', reqLvl: 1, icon: '🛡️', tier: 0, desc: '' },
  shield_bash_k: { name: 'Shield Bash', info: 'Auto-cast: 25 Pwr + 3s Stun', cost: 5, max: 5, type: 'proc', classReq: 'knight', reqLvl: 1, icon: '🛡️💥', tier: 0, desc: '', baseCd: 7500, pwr: 25, effect: 'stun' },
  paladins_harmony: { name: 'Paladin\'s Harmony', info: 'P.Def +30%, M.Def +30%, Shield Block +40%, Max HP +25% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'paladin', reqLvl: 1, icon: '🛡️✨', tier: 1, desc: '' },
  holy_blade: { name: 'Holy Blade', info: 'Auto-cast: 30 Pwr Holy strike', cost: 15, max: 5, type: 'proc', classReq: 'paladin', reqLvl: 1, icon: '⚔️✨', tier: 1, desc: '', baseCd: 6000, pwr: 30, effect: 'dmg' },
  touch_of_life: { name: 'Touch of Life', info: 'Heals 50% Max HP + Debuff immunity 15s', cost: 30, max: 5, type: 'proc', classReq: 'paladin', reqLvl: 1, icon: '💚', tier: 2, desc: '', baseCd: 120000, pwr: 0, effect: 'warcry' },
  phoenix_harmony: { name: 'Phoenix Knight Harmony', info: 'P.Def +50%, M.Def +50%, 10% HP regen each 30s (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'phoenixKnight', reqLvl: 1, icon: '🦅✨', tier: 3, starRank: 1, desc: '' },
  transcendent_shield: { name: 'Transcendent Shield Charge', info: 'Absorbs 5000 dmg + reflects 20% to attackers 15s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'phoenixKnight', reqLvl: 1, icon: '🛡️👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 95, effect: 'stun' },

  // GROUP D
  dark_avengers_harmony: { name: 'Dark Avenger Harmony', info: 'P.Atk +25%, P.Def +20%, Reflect Dmg +15% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'darkAvenger', reqLvl: 1, icon: '😈🛡️', tier: 1, desc: '' },
  insane_crusher: { name: 'Insane Crusher', info: 'Auto-cast: 60 Pwr Dark AoE + removes 2 enemy buffs', cost: 25, max: 5, type: 'proc', classReq: 'darkAvenger', reqLvl: 1, icon: '😈💥', tier: 2, desc: '', baseCd: 8000, pwr: 60, effect: 'dmg' },
  hell_knights_harmony: { name: 'Hell Knight Harmony', info: 'P.Atk +40%, Reflect Dmg +25%, Lifesteal +10% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'hellKnight', reqLvl: 1, icon: '😈👑', tier: 3, starRank: 1, desc: '' },
  transcendent_dark: { name: 'Transcendent Dark Strike', info: '1400% P.Atk Dark AoE + 4s Stun (4★)', cost: 500, max: 5, type: 'proc', classReq: 'hellKnight', reqLvl: 1, icon: '💀👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 140, effect: 'dmg' },

  // GROUP E
  rogues_harmony: { name: 'Rogue\'s Harmony', info: 'Crit Rate +25%, Eva +15, Move Speed +20 (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'rogue', reqLvl: 1, icon: '🗡️', tier: 0, desc: '' },
  dagger_mastery_r: { name: 'Dagger Mastery', info: '+20% P.Atk & +25% Blow Rate / lvl', cost: 5, max: 10, type: 'stat', classReq: 'rogue', reqLvl: 1, icon: '🗡️', tier: 0, desc: '' },
  backstab_r: { name: 'Backstab', info: 'Auto-cast: 40 Pwr (+50% from behind)', cost: 15, max: 5, type: 'proc', classReq: 'rogue', reqLvl: 1, icon: '🩸', tier: 1, desc: '', baseCd: 5000, pwr: 40, effect: 'dmg' },
  treasure_hunters_harmony: { name: 'Treasure Hunter Harmony', info: 'Crit Dmg +30%, Blow Rate +20%, Eva +20 (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'treasureHunter', reqLvl: 1, icon: '🗡️✨', tier: 1, desc: '' },
  shadow_step: { name: 'Shadow Step', info: 'Teleport behind target + next Backstab +30%', cost: 20, max: 5, type: 'proc', classReq: 'treasureHunter', reqLvl: 1, icon: '👤', tier: 2, desc: '', baseCd: 6000, pwr: 15, effect: 'dmg' },
  exciting_adventure: { name: 'Exciting Adventure', info: 'Eva +25, Move Speed +30, Lethal Rate +20% for 60s', cost: 25, max: 5, type: 'proc', classReq: 'treasureHunter', reqLvl: 1, icon: '💨', tier: 2, desc: '', baseCd: 180000, pwr: 0, effect: 'warcry' },
  adventurers_harmony: { name: 'Adventurer Harmony', info: 'Crit Dmg +50%, 80% Mirage dodge chance 5min (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'adventurer', reqLvl: 1, icon: '🌌', tier: 3, starRank: 1, desc: '' },
  transcendent_deadly: { name: 'Transcendent Deadly Blow', info: '1400% P.Atk Crit + lifesteal, Crit resets Shadow Step (4★)', cost: 500, max: 5, type: 'proc', classReq: 'adventurer', reqLvl: 1, icon: '🩸👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 140, effect: 'vampiric' },

  // GROUP F
  bow_mastery_h: { name: 'Bow Mastery', info: '+18% P.Atk & +15 Accuracy with bows / lvl', cost: 5, max: 10, type: 'stat', classReq: 'rogue', reqLvl: 1, icon: '🏹', tier: 0, desc: '' },
  double_shot_h: { name: 'Double Shot', info: 'Auto-cast: 24 Pwr 2-arrow burst', cost: 5, max: 5, type: 'proc', classReq: 'rogue', reqLvl: 1, icon: '🎯', tier: 0, desc: '', baseCd: 2500, pwr: 24, effect: 'dmg' },
  hawkeyes_harmony: { name: 'Hawkeye\'s Harmony', info: 'P.Atk +20%, Bow Range +150, Crit Rate +15% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'hawkeye', reqLvl: 1, icon: '🏹✨', tier: 1, desc: '' },
  stun_shot_h: { name: 'Stun Shot', info: 'Auto-cast: 32 Pwr + 3s Stun arrow', cost: 15, max: 5, type: 'proc', classReq: 'hawkeye', reqLvl: 1, icon: '💫🏹', tier: 1, desc: '', baseCd: 10000, pwr: 32, effect: 'stun' },
  arrow_rain_h: { name: 'Arrow Rain', info: 'Auto-cast: 42 Pwr AoE arrow rain 5 targets', cost: 25, max: 5, type: 'proc', classReq: 'hawkeye', reqLvl: 1, icon: '🌧️🏹', tier: 2, desc: '', baseCd: 5000, pwr: 42, effect: 'dmg' },
  target_lock: { name: 'Target Lock', info: 'Bow Range +200, Crit Dmg +35%, skill cast 2.0s (3min)', cost: 30, max: 5, type: 'proc', classReq: 'sagittarius', reqLvl: 1, icon: '🔭', tier: 2, desc: '', baseCd: 300000, pwr: 0, effect: 'warcry' },
  sagittarius_harmony: { name: 'Sagittarius Harmony', info: 'P.Atk +40%, Range +200, Crit Rate +25% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'sagittarius', reqLvl: 1, icon: '🌟🏹', tier: 3, starRank: 1, desc: '' },
  transcendent_seven: { name: 'Transcendent Seven Arrow', info: '1350% P.Atk Ranged + 25% DEF/MDEF debuff 10s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'sagittarius', reqLvl: 1, icon: '🌟🏹👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 135, effect: 'dmg' },

  // GROUP G
  wizards_harmony: { name: 'Wizard\'s Harmony', info: 'M.Atk +20%, Cast Speed +15%, Max MP +50 (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'wizard', reqLvl: 1, icon: '🔮', tier: 0, desc: '' },
  blaze_sorc: { name: 'Blaze', info: 'Auto-cast: 23 Pwr Fire blast', cost: 5, max: 5, type: 'proc', classReq: 'wizard', reqLvl: 1, icon: '🔥', tier: 0, desc: '', baseCd: 4000, pwr: 23, effect: 'dmg' },
  fire_mastery_s: { name: 'Fire Spell Mastery', info: '+25% M.Atk & +15% Cast Speed Fire / lvl', cost: 5, max: 10, type: 'stat', classReq: 'wizard', reqLvl: 1, icon: '🔥', tier: 0, desc: '' },
  sorcerers_harmony: { name: 'Sorcerer\'s Harmony', info: 'M.Atk +30%, M.Crit Rate +20%, Cast Speed +20% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'sorcerer', reqLvl: 1, icon: '🔥✨', tier: 1, desc: '' },
  prominence: { name: 'Prominence', info: 'Auto-cast: 55 Pwr Solar Fire pillar', cost: 15, max: 5, type: 'proc', classReq: 'sorcerer', reqLvl: 1, icon: '☀️🔥', tier: 1, desc: '', baseCd: 6000, pwr: 55, effect: 'dmg' },
  flame_explosion: { name: 'Flame Explosion', info: 'Auto-cast: 2x48 Pwr Fire double hit (960% total)', cost: 25, max: 5, type: 'proc', classReq: 'sorcerer', reqLvl: 1, icon: '☄️💥', tier: 2, desc: '', baseCd: 5000, pwr: 48, effect: 'dmg' },
  magic_focus_s: { name: 'Magic Focus', info: 'M.Skill Power +5%, PvE Dmg +10%', cost: 25, max: 5, type: 'stat', classReq: 'sorcerer', reqLvl: 1, icon: '✨', tier: 2, desc: '' },
  archmages_harmony: { name: 'Archmage Harmony', info: 'M.Atk +45%, M.Crit Rate 100%, PvE Dmg +15% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'archmage', reqLvl: 1, icon: '🔥👑', tier: 3, starRank: 1, desc: '' },
  transcendent_inferno: { name: 'Transcendent Hell Inferno', info: '2x480 Pwr Fire + all targets DEF -25% 10s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'archmage', reqLvl: 1, icon: '🌋👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 200, effect: 'dmg' },

  // GROUP H
  necros_harmony: { name: 'Necromancer\'s Harmony', info: 'M.Atk +25%, Undead Dmg +20%, HP Drain +15% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'necromancer', reqLvl: 1, icon: '💀', tier: 1, desc: '' },
  death_spike_n: { name: 'Death Spike', info: 'Auto-cast: 60 Pwr Dark bone missile', cost: 15, max: 5, type: 'proc', classReq: 'necromancer', reqLvl: 1, icon: '💀🦴', tier: 1, desc: '', baseCd: 7000, pwr: 60, effect: 'dmg' },
  void_explosion: { name: 'Void Explosion', info: 'Auto-cast: 2x50 Pwr Dark double hit + Atk Speed -20% 8s', cost: 25, max: 5, type: 'proc', classReq: 'necromancer', reqLvl: 1, icon: '🌀💀', tier: 2, desc: '', baseCd: 6000, pwr: 50, effect: 'dmg' },
  soultakers_harmony: { name: 'Soultaker Harmony', info: 'M.Atk +40%, Lifesteal +15%, PvE Dmg +15% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'soultaker', reqLvl: 1, icon: '💀👑', tier: 3, starRank: 1, desc: '' },
  transcendent_soul: { name: 'Transcendent Soul Vortex', info: '1800% M.Atk Dark + 40% HP drain from all targets hit (4★)', cost: 500, max: 5, type: 'proc', classReq: 'soultaker', reqLvl: 1, icon: '🌀👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 180, effect: 'vampiric' },

  // GROUP I
  bishops_harmony: { name: 'Bishop\'s Harmony', info: 'M.Def +35%, Heal Power +30%, MP Regen +50% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'bishop', reqLvl: 1, icon: '✝️', tier: 1, desc: '' },
  greater_heal: { name: 'Greater Heal', info: 'Auto-heals self: restores 25% Max HP', cost: 15, max: 5, type: 'proc', classReq: 'bishop', reqLvl: 1, icon: '💚', tier: 1, desc: '', baseCd: 8000, pwr: 0, effect: 'warcry' },
  holy_strike_b: { name: 'Holy Strike', info: 'Auto-cast: 45 Pwr Holy magic damage', cost: 20, max: 5, type: 'proc', classReq: 'bishop', reqLvl: 1, icon: '✨⚔️', tier: 2, desc: '', baseCd: 5000, pwr: 45, effect: 'dmg' },
  dark_side: { name: 'Dark Side', info: 'Toggle: M.Atk +40%, Cast Speed +25%, Healing -50%', cost: 25, max: 5, type: 'proc', classReq: 'bishop', reqLvl: 1, icon: '🌑', tier: 2, desc: '', baseCd: 3000, pwr: 0, effect: 'warcry' },
  cardinals_harmony: { name: 'Cardinal Harmony', info: 'M.Atk +50% OR Heal +60% (based on Dark Side toggle) (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'cardinal', reqLvl: 1, icon: '✝️👑', tier: 3, starRank: 1, desc: '' },
  transcendent_holy: { name: 'Transcendent Holy Strike', info: '1600% M.Atk Holy AoE + Mass Resurrection all dead allies (4★)', cost: 500, max: 5, type: 'proc', classReq: 'cardinal', reqLvl: 1, icon: '✝️👑💫', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 160, effect: 'dmg' },

  // GROUP J
  prophets_harmony: { name: 'Prophet\'s Harmony', info: 'All stats +15%, MP Regen +30% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'prophet', reqLvl: 1, icon: '📜', tier: 1, desc: '' },
  haste_buff: { name: 'Haste', info: 'Party Atk Speed +30% for 10min', cost: 15, max: 5, type: 'proc', classReq: 'prophet', reqLvl: 1, icon: '⚡', tier: 1, desc: '', baseCd: 600000, pwr: 0, effect: 'warcry' },
  might_buff: { name: 'Might', info: 'Party P.Atk +20% for 10min', cost: 15, max: 5, type: 'proc', classReq: 'prophet', reqLvl: 1, icon: '💪', tier: 1, desc: '', baseCd: 600000, pwr: 0, effect: 'warcry' },
  hierophants_harmony: { name: 'Hierophant Harmony', info: 'Party All Stats +25% (15min party buff) (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'hierophant', reqLvl: 1, icon: '📜👑', tier: 3, starRank: 1, desc: '' },
  transcendent_prophecy: { name: 'Mass Prophecy', info: 'Party all stats +40%, elemental immunity 30s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'hierophant', reqLvl: 1, icon: '📜👑💫', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 0, effect: 'warcry' },

  // GROUP K
  orc_will: { name: 'Orc\'s Will Harmony', info: 'P.Atk +20%, Max HP +20%, P.Def +15% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'orcRaider', reqLvl: 1, icon: '💪', tier: 0, desc: '' },
  titans_harmony: { name: 'Titan\'s Harmony', info: 'P.Atk +30%, HP Regen +40%, Frenzy trigger at 50% HP (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'destroyer', reqLvl: 1, icon: '🪓', tier: 1, desc: '' },
  earthquake_t: { name: 'Earthquake', info: 'Auto-cast: 50 Pwr AoE + 2s Stun all nearby', cost: 15, max: 5, type: 'proc', classReq: 'destroyer', reqLvl: 1, icon: '🌍💥', tier: 1, desc: '', baseCd: 5000, pwr: 50, effect: 'stun' },
  blazing_strike: { name: 'Blazing Strike', info: 'Auto-cast: 850% P.Atk single target +30% Crit Rate', cost: 25, max: 5, type: 'proc', classReq: 'destroyer', reqLvl: 1, icon: '🔥⚔️', tier: 2, desc: '', baseCd: 7000, pwr: 85, effect: 'dmg' },
  titan_harmony_3: { name: 'Titan\'s Supreme Harmony', info: 'P.Atk +50%, 2H weapon range +100%, Frenzy at 60% HP (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'titan', reqLvl: 1, icon: '🪓👑', tier: 3, starRank: 1, desc: '' },
  transcendent_quake: { name: 'Transcendent Earthquake', info: 'Pulls 12 enemies + 1200% P.Atk AoE (4★)', cost: 500, max: 5, type: 'proc', classReq: 'titan', reqLvl: 1, icon: '🌍👑', tier: 4, starRank: 4, desc: '', baseCd: 120000, pwr: 160, effect: 'stun' },

  // GROUP L – Death Knight (Human + Dark Elf)
  death_knight_mastery: { name: 'Death Knight Mastery', info: '+25% P.Atk, +20% P.Def Death Knight / lvl', cost: 5, max: 10, type: 'stat', classReq: 'deathknight', reqLvl: 1, icon: '💀⚔️', tier: 0, desc: '' },
  death_spike_dk: { name: 'Death Spike', info: 'Auto-cast: 650% P.Atk Dark + gain 20 Death Points', cost: 5, max: 5, type: 'proc', classReq: 'deathknight', reqLvl: 1, icon: '💀🦴', tier: 0, desc: '', baseCd: 5000, pwr: 65, effect: 'dmg' },
  dark_armor_dk: { name: 'Dark Armor', info: 'P.Def +25%, M.Def +25%, Reflect 15% dmg (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'deathknight', reqLvl: 1, icon: '🛡️💀', tier: 1, desc: '' },
  death_storm: { name: 'Death Storm', info: 'Auto-cast: 900% Dark AoE + 4s Stun (costs 50 DP)', cost: 25, max: 5, type: 'proc', classReq: 'deathknight', reqLvl: 1, icon: '🌪️💀', tier: 2, desc: '', baseCd: 12000, pwr: 90, effect: 'stun' },
  transcendent_death: { name: 'Transcendent Death Spike', info: 'Consumes 100DP: 1400% P.Atk Dark AoE + 4s Stun (4★)', cost: 500, max: 5, type: 'proc', classReq: 'deathknight', reqLvl: 1, icon: '💀👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 140, effect: 'stun' },

  warg_will: { name: 'Warg\'s Will Harmony', info: 'P.Atk +15%, Eva +10, Move Speed +20 Human Form (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'warg', reqLvl: 1, icon: '🐺', tier: 0, desc: '' },
  wolf_transformation: { name: 'Wolf Transformation', info: 'Toggle Wolf Form: Speed +40, P.Atk +20%, Atk Speed +25%', cost: 10, max: 5, type: 'proc', classReq: 'warg', reqLvl: 1, icon: '🐺🔄', tier: 1, desc: '', baseCd: 10000, pwr: 0, effect: 'warcry' },
  double_claw: { name: 'Double Claw Strike', info: 'Wolf Form: 700% P.Atk + Bleed 50 dmg/s 6s', cost: 15, max: 5, type: 'proc', classReq: 'warg', reqLvl: 1, icon: '🐾💥', tier: 1, desc: '', baseCd: 4000, pwr: 70, effect: 'dmg' },
  vortex_claws: { name: 'Vortex of Claws', info: 'Wolf Form: Charge pulls 6 enemies + 1100% P.Atk AoE', cost: 25, max: 5, type: 'proc', classReq: 'warg', reqLvl: 1, icon: '🌀🐾', tier: 2, desc: '', baseCd: 60000, pwr: 110, effect: 'stun' },
  transcendent_claw: { name: 'Transcendent Double Claw', info: 'Wolf Form: 1600% P.Atk + Bleed + 30% lifesteal (4★)', cost: 500, max: 5, type: 'proc', classReq: 'warg', reqLvl: 1, icon: '🐺👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 160, effect: 'vampiric' },

  assassin_harmony: { name: 'Assassin\'s Harmony', info: 'Crit Dmg +30%, Eva +20, Shadow Spawn Rate +50% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'assassin', reqLvl: 1, icon: '🗡️🌑', tier: 0, desc: '' },
  assassination: { name: 'Assassination', info: 'Auto-cast: 600% P.Atk (+50% from behind)', cost: 5, max: 5, type: 'proc', classReq: 'assassin', reqLvl: 1, icon: '🗡️💀', tier: 0, desc: '', baseCd: 5000, pwr: 60, effect: 'dmg' },
  brutality_passive: { name: 'Brutality', info: 'Each kill grants 1 Assassin Dagger charge (max 3): Crit +10% each', cost: 10, max: 5, type: 'stat', classReq: 'assassin', reqLvl: 1, icon: '🗡️', tier: 1, desc: '' },
  shadow_blast: { name: 'Shadow Blast', info: 'All 3 Shadow clones explode: 3x500% P.Atk AoE', cost: 25, max: 5, type: 'proc', classReq: 'assassin', reqLvl: 1, icon: '👥💥', tier: 2, desc: '', baseCd: 75000, pwr: 50, effect: 'dmg' },
  transcendent_assassination: { name: 'Transcendent Assassination', info: '1450% P.Atk from shadows + 55% lifesteal (4★)', cost: 500, max: 5, type: 'proc', classReq: 'assassin', reqLvl: 1, icon: '🗡️👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 145, effect: 'vampiric' },

  burst_fire: { name: 'Burst Fire', info: 'Auto-cast: 3x220% P.Atk ranged burst', cost: 5, max: 5, type: 'proc', classReq: 'gunner', reqLvl: 1, icon: '🔫💨', tier: 0, desc: '', baseCd: 4000, pwr: 22, effect: 'dmg' },
  gun_mastery_sb: { name: 'Gun Mastery', info: '+20% P.Atk & +15% Atk Speed with guns / lvl', cost: 5, max: 10, type: 'stat', classReq: 'gunner', reqLvl: 1, icon: '🔫', tier: 0, desc: '' },
  storm_blaster_harmony: { name: 'Storm Blaster Harmony', info: 'P.Atk +25%, Range +200, Wind Dmg +20% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'gunner', reqLvl: 1, icon: '🔫🌪️', tier: 1, desc: '' },
  wind_barrage: { name: 'Wind Barrage', info: 'Auto-cast: 750% P.Atk Wind AoE cone', cost: 25, max: 5, type: 'proc', classReq: 'gunner', reqLvl: 1, icon: '💨💥', tier: 2, desc: '', baseCd: 12000, pwr: 75, effect: 'dmg' },
  transcendent_storm: { name: 'Transcendent Storm Shot', info: '1350% P.Atk Wind ranged + all hit -25% DEF/MDEF 10s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'stormBlaster', reqLvl: 1, icon: '🔫🌪️👑', tier: 4, starRank: 4, desc: '', baseCd: 100000, pwr: 135, effect: 'dmg' },

  divine_templar_harmony: { name: 'Divine Templar Harmony', info: 'P.Def +35%, M.Def +35%, Holy Dmg +20% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'divinetemplar', reqLvl: 1, icon: '🛡️✝️', tier: 0, desc: '' },
  lord_knight: { name: 'Lord Knight', info: 'P.Def +40%, M.Def +40%, MP Regen 15% each 10s (3min)', cost: 10, max: 5, type: 'proc', classReq: 'divinetemplar', reqLvl: 1, icon: '🏰', tier: 1, desc: '', baseCd: 300000, pwr: 0, effect: 'warcry' },
  sacred_aegis: { name: 'Sacred Aegis', info: 'Absorbs 5000 dmg shield + reflects 20% to attackers 15s', cost: 25, max: 5, type: 'proc', classReq: 'divinetemplar', reqLvl: 1, icon: '🛡️💫', tier: 2, desc: '', baseCd: 90000, pwr: 0, effect: 'warcry' },
  transcendent_divine: { name: 'Transcendent Divine Charge', info: '1200% Holy P.Atk + 5s Stun + grants 3s invulnerability (4★)', cost: 500, max: 5, type: 'proc', classReq: 'divineTemplar', reqLvl: 1, icon: '🛡️✝️👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 120, effect: 'stun' },

  element_weaver_harmony: { name: 'Element Weaver Harmony', info: 'M.Atk +30%, All Element Dmg +20%, Cast Speed +15% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'elementweaver', reqLvl: 1, icon: '🌀', tier: 0, desc: '' },
  fire_weave: { name: 'Fire Weave', info: 'Auto-cast: 55 Pwr Fire elemental magic', cost: 10, max: 5, type: 'proc', classReq: 'elementweaver', reqLvl: 1, icon: '🌀🔥', tier: 1, desc: '', baseCd: 4000, pwr: 55, effect: 'dmg' },
  ice_weave: { name: 'Ice Weave', info: 'Auto-cast: 52 Pwr Ice + 2s Freeze', cost: 10, max: 5, type: 'proc', classReq: 'elementweaver', reqLvl: 1, icon: '🌀❄️', tier: 1, desc: '', baseCd: 4000, pwr: 52, effect: 'stun' },
  elemental_convergence: { name: 'Elemental Convergence', info: 'Auto-cast: 850% M.Atk trifold (Fire+Water+Wind) AoE', cost: 25, max: 5, type: 'proc', classReq: 'elementweaver', reqLvl: 1, icon: '🌀⚡', tier: 2, desc: '', baseCd: 8000, pwr: 85, effect: 'dmg' },
  transcendent_weave: { name: 'Transcendent Elemental Overload', info: '1750% M.Atk all elements + all hit M.Def -35% 15s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'elementWeaver', reqLvl: 1, icon: '🌀👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 175, effect: 'dmg' },

  shinemaker_harmony: { name: 'ShineMaker Harmony', info: 'M.Atk +25%, Light Dmg +20%, Loot Bonus +20% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'shinemaker', reqLvl: 1, icon: '✨', tier: 1, desc: '' },
  light_burst: { name: 'Light Burst', info: 'Auto-cast: 55 Pwr Light magic', cost: 10, max: 5, type: 'proc', classReq: 'shinemaker', reqLvl: 1, icon: '💡', tier: 1, desc: '', baseCd: 4000, pwr: 55, effect: 'dmg' },
  shining_nova: { name: 'Shining Nova', info: 'Auto-cast: 720% M.Atk Light AoE + Accuracy -20 5s', cost: 25, max: 5, type: 'proc', classReq: 'shinemaker', reqLvl: 1, icon: '✨💥', tier: 2, desc: '', baseCd: 7000, pwr: 72, effect: 'stun' },
  transcendent_shine: { name: 'Transcendent Shining Bloom', info: '1500% M.Atk Light AoE + heals party 30% HP + Loot Bonus +100% 60s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'shinemaker', reqLvl: 1, icon: '✨👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 150, effect: 'dmg' },

  blood_rose_harmony: { name: 'Blood Rose Harmony', info: 'M.Atk +20%, Lifesteal +15%, Thorn Reflect 10% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'bloodrose', reqLvl: 1, icon: '🌹', tier: 0, desc: '' },
  thorn_whip: { name: 'Thorn Whip', info: 'Auto-cast: 450% Hybrid dmg + 10% lifesteal', cost: 5, max: 5, type: 'proc', classReq: 'bloodrose', reqLvl: 1, icon: '🌹⚔️', tier: 0, desc: '', baseCd: 4000, pwr: 45, effect: 'vampiric' },
  rose_tempest: { name: 'Rose Tempest', info: 'Auto-cast: 680% Hybrid AoE + steals 10% HP dealt', cost: 10, max: 5, type: 'proc', classReq: 'bloodrose', reqLvl: 1, icon: '🌹🌪️', tier: 1, desc: '', baseCd: 6000, pwr: 68, effect: 'vampiric' },
  vine_bind: { name: 'Vine Bind', info: 'Auto-cast: CC root + 400% hybrid + 3s root all targets AoE', cost: 25, max: 5, type: 'proc', classReq: 'bloodrose', reqLvl: 1, icon: '🌿🌹', tier: 2, desc: '', baseCd: 20000, pwr: 40, effect: 'stun' },
  transcendent_rose: { name: 'Transcendent Bloom of Destruction', info: '1600% Hybrid AoE + 40% HP drain + Thorn Armor +50% 30s (4★)', cost: 500, max: 5, type: 'proc', classReq: 'bloodRose', reqLvl: 1, icon: '🌹👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 160, effect: 'vampiric' },

  samurai_harmony: { name: 'Samurai\'s Harmony', info: 'Katana P.Atk +25%, Crit Dmg +20%, Atk Speed +15% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'hatamoto', reqLvl: 1, icon: '⛩️', tier: 0, desc: '' },
  iaijutsu: { name: 'Iaijutsu', info: 'Auto-cast: 750% P.Atk, ignores 20% P.Def', cost: 5, max: 5, type: 'proc', classReq: 'hatamoto', reqLvl: 1, icon: '⚔️🌸', tier: 0, desc: '', baseCd: 5000, pwr: 75, effect: 'dmg' },
  crescent_slash: { name: 'Crescent Slash', info: 'Auto-cast: 800% P.Atk + 15% DEF debuff 6s', cost: 15, max: 5, type: 'proc', classReq: 'ronin', reqLvl: 1, icon: '🌙⚔️', tier: 1, desc: '', baseCd: 6000, pwr: 80, effect: 'dmg' },
  bushido_stance: { name: 'Bushido Stance', info: 'Toggle: Crit Dmg +40%, Counter chance 30% on hit taken', cost: 20, max: 5, type: 'proc', classReq: 'ronin', reqLvl: 1, icon: '⛩️', tier: 2, desc: '', baseCd: 30000, pwr: 0, effect: 'warcry' },
  transcendent_iai: { name: 'Transcendent Final Cut', info: '1500% P.Atk execute ignoring all DEF + Bushido resets on kill (4★)', cost: 500, max: 5, type: 'proc', classReq: 'samurai', reqLvl: 1, icon: '⛩️👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 150, effect: 'dmg' },

  rider_will: { name: 'Rider\'s Will Harmony', info: 'P.Atk +20%, Max HP +25%, Move Speed +30 mounted (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'orcRider', reqLvl: 1, icon: '🐉', tier: 0, desc: '' },
  battle_mount: { name: 'Battle Mount', info: 'Toggle Mounted Form: HP +30%, P.Def +20%, Speed +35', cost: 5, max: 5, type: 'proc', classReq: 'orcRider', reqLvl: 1, icon: '🐉⚔️', tier: 0, desc: '', baseCd: 5000, pwr: 0, effect: 'warcry' },
  lance_charge: { name: 'Lance Charge', info: 'Auto-cast: 600% P.Atk lance thrust ignoring 15% P.Def', cost: 15, max: 5, type: 'proc', classReq: 'dragoon', reqLvl: 1, icon: '🏇', tier: 1, desc: '', baseCd: 8000, pwr: 60, effect: 'dmg' },
  devastating_charge: { name: 'Devastating Charge', info: 'Mounted: Charge line 800% P.Atk + 2.5s Knockdown all hit', cost: 25, max: 5, type: 'proc', classReq: 'dragoon', reqLvl: 1, icon: '🐉💥', tier: 2, desc: '', baseCd: 25000, pwr: 80, effect: 'stun' },
  transcendent_vanguard: { name: 'Transcendent War Charge', info: 'Mounted: 1500% P.Atk charge pulls 10 enemies + 5s stun + War Banner buff (4★)', cost: 500, max: 5, type: 'proc', classReq: 'vanguardRider', reqLvl: 1, icon: '🐉👑', tier: 4, starRank: 4, desc: '', baseCd: 90000, pwr: 150, effect: 'stun' },

  elvenKnight_harmony: { name: 'Elven Knight Harmony', info: 'P.Def +20%, Eva +10, Shield Block +25% (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'elvenKnight', reqLvl: 1, icon: '🧝🛡️', tier: 0, desc: '' },
  templeKnight_harmony: { name: 'Temple Knight Harmony', info: 'P.Def +30%, M.Def +25%, Eva +15, Holy Resist +20% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'templeKnight', reqLvl: 1, icon: '🧝✝️', tier: 1, desc: '' },
  eva_templar_harmony: { name: 'Eva Templar Harmony', info: 'P.Def +50%, Eva +30, Water Shield absorbs 3000 dmg (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'evasTemplar', reqLvl: 1, icon: '🧝🌊👑', tier: 3, starRank: 1, desc: '' },

  swingsong_harmony: { name: 'Sword Singer Harmony', info: 'All Songs active, P.Atk +20%, Eva +15% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'swordsinger', reqLvl: 1, icon: '🎵', tier: 1, desc: '' },
  song_of_hunter: { name: 'Song of Hunter', info: 'Crit Rate +100%, Crit Dmg +20% (10min)', cost: 15, max: 5, type: 'proc', classReq: 'swordsinger', reqLvl: 1, icon: '🎵🏹', tier: 1, desc: '', baseCd: 600000, pwr: 0, effect: 'warcry' },
  sword_muse_harmony: { name: 'Sword Muse Harmony', info: 'All Songs Power +30%, AoE party benefit (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'swordMuse', reqLvl: 1, icon: '🎵👑', tier: 3, starRank: 1, desc: '' },

  scout_harmony: { name: 'Scout\'s Harmony', info: 'Crit Rate +20%, Eva +12, Move Speed +15 (20min)', cost: 5, max: 5, type: 'harmony', classReq: 'elvenScout', reqLvl: 1, icon: '🧝🏹', tier: 0, desc: '' },
  wind_rider_harmony: { name: 'Wind Rider Harmony', info: 'Eva +40, Crit Dmg +50%, Lethal Strike Rate +25% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'windRiderElven', reqLvl: 1, icon: '💨👑', tier: 3, starRank: 1, desc: '' },

  shillienKnight_harmony: { name: 'Shillien Knight Harmony', info: 'P.Def +25%, Dark Dmg +20%, Vampiric Shield 10% (20min)', cost: 10, max: 5, type: 'harmony', classReq: 'shillienKnight', reqLvl: 1, icon: '🧝♀️🛡️', tier: 1, desc: '' },
  spectralDancer_harmony: { name: 'Spectral Dancer Harmony', info: 'All Dances Power +30%, Dual P.Atk +35%, Crit Dmg +30% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'spectralDancer', reqLvl: 1, icon: '💃👑', tier: 3, starRank: 1, desc: '' },
  dance_of_fire: { name: 'Dance of Fire', info: 'Crit Dmg +35% (10min self-buff)', cost: 15, max: 5, type: 'proc', classReq: 'bladedancer', reqLvl: 1, icon: '🔥💃', tier: 1, desc: '', baseCd: 600000, pwr: 0, effect: 'warcry' },

  storm_screamer_harmony: { name: 'Storm Screamer Harmony', info: 'M.Atk +50%, Wind/Dark Dmg +25%, PvE Dmg +15% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'stormScreamer', reqLvl: 1, icon: '🌪️👑', tier: 3, starRank: 1, desc: '' },
  thunder_explosion: { name: 'Thunder Explosion', info: 'Auto-cast: 2x550% M.Atk Wind double hit (1100% total)', cost: 25, max: 5, type: 'proc', classReq: 'spellhowler', reqLvl: 1, icon: '⚡💥', tier: 2, desc: '', baseCd: 5000, pwr: 55, effect: 'dmg' },

  shillienSaint_harmony: { name: 'Shillien Saint Harmony', info: 'M.Def +50%, Dark Heal +60% OR Dark Side M.Atk +50% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'shillienSaint', reqLvl: 1, icon: '✝️🖤👑', tier: 3, starRank: 1, desc: '' },

  grand_khavatari_harmony: { name: 'Grand Khavatari Harmony', info: 'P.Atk +45%, All Totem Spirits active, Fist Dmg +35% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'grandKhavatari', reqLvl: 1, icon: '🥊👑', tier: 3, starRank: 1, desc: '' },
  ogres_essence: { name: 'Ogre Essence', info: 'P.Atk +20%, P.Def +30%, M.Def +30%, Crit Dmg +20% (no penalties, 20min)', cost: 20, max: 5, type: 'harmony', classReq: 'tyrant', reqLvl: 1, icon: '🐗', tier: 2, desc: '' },

  dominator_harmony: { name: 'Dominator Harmony', info: 'Clan Buffs power +50%, Seal Curses AoE +50% range (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'dominator', reqLvl: 1, icon: '👑🔥', tier: 3, starRank: 1, desc: '' },
  flame_burst_dom: { name: 'Flame Burst', info: 'Auto-cast: 600% M.Atk Fire 10 targets + 30% double hit chance', cost: 25, max: 5, type: 'proc', classReq: 'overlord', reqLvl: 1, icon: '🔥💥', tier: 2, desc: '', baseCd: 12000, pwr: 60, effect: 'dmg' },

  doomcryer_harmony: { name: 'Doomcryer Harmony', info: 'Chant of Magnus active +30%, War Chant Party Buff enhanced (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'doomcryer', reqLvl: 1, icon: '📯👑', tier: 3, starRank: 1, desc: '' },

  doombringer_harmony: { name: 'Doombringer Harmony', info: 'P.Atk +40%, Soul Explosion Dmg +50%, Crit Dmg +30% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'doombringer', reqLvl: 1, icon: '😈👑', tier: 3, starRank: 1, desc: '' },
  trickster_harmony: { name: 'Trickster Harmony', info: 'Crossbow P.Atk +40%, Trap Dmg +50%, Eva +30 (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'trickster', reqLvl: 1, icon: '🎯👑', tier: 3, starRank: 1, desc: '' },

  fortune_seekers_harmony: { name: 'Fortune Seeker Harmony', info: 'Loot Bonus +100%, Spoil Rate +200%, P.Atk +30% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'fortuneSeeker', reqLvl: 1, icon: '💰👑', tier: 3, starRank: 1, desc: '' },
  maestros_harmony: { name: 'Maestro Harmony', info: 'Craft Speed +100%, Golem P.Atk +50%, P.Def +40% (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'maestro', reqLvl: 1, icon: '🔨👑', tier: 3, starRank: 1, desc: '' },

  moonlight_harmony: { name: 'Moonlight Sentinel Harmony', info: 'P.Atk +40%, Range +200, Crit Rate +30%, Atk Speed Max (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'moonlightSentinel', reqLvl: 1, icon: '🌙👑', tier: 3, starRank: 1, desc: '' },
  ghost_sentinel_harmony: { name: 'Ghost Sentinel Harmony', info: 'P.Atk +50%, Crit Dmg +50%, Bow Range +300 (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'ghostSentinel', reqLvl: 1, icon: '💀🏹👑', tier: 3, starRank: 1, desc: '' },
  water_spiral: { name: 'Water Spiral', info: 'Auto-cast: 520% M.Atk Water + M.Def -15% 6s', cost: 25, max: 5, type: 'proc', classReq: 'spellsinger', reqLvl: 1, icon: '🌊🌀', tier: 2, desc: '', baseCd: 4000, pwr: 52, effect: 'dmg' },

  eviscerator_harmony: { name: 'Eviscerator Harmony', info: 'P.Atk +40%, Wind Combo Dmg +40%, Eva +35 (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'eviscerator', reqLvl: 1, icon: '🌪️👑', tier: 3, starRank: 1, desc: '' },
  sayha_seeker_harmony: { name: 'Sayha Seeker Harmony', info: 'M.Atk +45%, Wind Dmg +35%, Move Speed +30 (1★)', cost: 20, max: 5, type: 'harmony', classReq: 'sayhaSeeker', reqLvl: 1, icon: '🌀👑', tier: 3, starRank: 1, desc: '' }
};

const SKILL_REQS_ECHO = {
  battle_roar: { fighter_will: 1 },
  power_strike_f: { fighter_will: 1 },
  weapon_mastery_f: { fighter_will: 1 },
  light_armor_f: { weapon_mastery_f: 1 },
  heavy_armor_f: { light_armor_f: 1 },
  boost_hp_f: { weapon_mastery_f: 1 },
  stun_attack: { power_strike_f: 1 },
  war_cry: { heavy_armor_f: 1 },
  lethal_blow_f: { stun_attack: 1 },
  frenzy_f: { war_cry: 1 },
  
  energy_bolt_m: { mage_will: 1 },
  weapon_mastery_m: { mage_will: 1 },
  robe_mast_m: { weapon_mastery_m: 1 },
  boost_mana_m: { robe_mast_m: 1 },
  anti_magic_m: { robe_mast_m: 1 },
  higher_mana_m: { anti_magic_m: 1 },
  quick_recycle: { higher_mana_m: 1 },

  triple_slash: { warriors_harmony: 1 },
  sonicBlasterG: { triple_slash: 1 },
  gladiators_harmony: { warriors_harmony: 1 },
  dual_weapon_mast: { gladiators_harmony: 1 },
  sonicRage: { sonicBlasterG: 1 },
  duelist_harmony: { gladiators_harmony: 1 },
  transcendent_dual_blow: { duelist_harmony: 1 },

  shield_bash_k: { knights_harmony: 1 },
  paladins_harmony: { knights_harmony: 1 },
  holy_blade: { paladins_harmony: 1 },
  touch_of_life: { paladins_harmony: 1 },
  phoenix_harmony: { paladins_harmony: 1 },
  transcendent_shield: { phoenix_harmony: 1 },

  dark_avengers_harmony: { knights_harmony: 1 },
  insane_crusher: { dark_avengers_harmony: 1 },
  hell_knights_harmony: { dark_avengers_harmony: 1 },
  transcendent_dark: { hell_knights_harmony: 1 },

  dagger_mastery_r: { rogues_harmony: 1 },
  backstab_r: { dagger_mastery_r: 1 },
  treasure_hunters_harmony: { rogues_harmony: 1 },
  shadow_step: { backstab_r: 1 },
  exciting_adventure: { treasure_hunters_harmony: 1 },
  adventurers_harmony: { treasure_hunters_harmony: 1 },
  transcendent_deadly: { adventurers_harmony: 1 },

  bow_mastery_h: { rogues_harmony: 1 },
  double_shot_h: { bow_mastery_h: 1 },
  hawkeyes_harmony: { rogues_harmony: 1 },
  stun_shot_h: { double_shot_h: 1 },
  arrow_rain_h: { stun_shot_h: 1 },
  target_lock: { hawkeyes_harmony: 1 },
  sagittarius_harmony: { hawkeyes_harmony: 1 },
  transcendent_seven: { sagittarius_harmony: 1 },

  blaze_sorc: { wizards_harmony: 1 },
  fire_mastery_s: { wizards_harmony: 1 },
  sorcerers_harmony: { wizards_harmony: 1 },
  prominence: { blaze_sorc: 1 },
  flame_explosion: { prominence: 1 },
  magic_focus_s: { sorcerers_harmony: 1 },
  archmages_harmony: { sorcerers_harmony: 1 },
  transcendent_inferno: { archmages_harmony: 1 },

  necros_harmony: { wizards_harmony: 1 },
  death_spike_n: { necros_harmony: 1 },
  void_explosion: { death_spike_n: 1 },
  soultakers_harmony: { necros_harmony: 1 },
  transcendent_soul: { soultakers_harmony: 1 },

  bishops_harmony: { wizards_harmony: 1 },
  greater_heal: { bishops_harmony: 1 },
  holy_strike_b: { bishops_harmony: 1 },
  dark_side: { greater_heal: 1 },
  cardinals_harmony: { bishops_harmony: 1 },
  transcendent_holy: { cardinals_harmony: 1 },

  prophets_harmony: { wizards_harmony: 1 },
  haste_buff: { prophets_harmony: 1 },
  might_buff: { prophets_harmony: 1 },
  hierophants_harmony: { prophets_harmony: 1 },
  transcendent_prophecy: { hierophants_harmony: 1 },
  
  titans_harmony: { orc_will: 1 },
  earthquake_t: { titans_harmony: 1 },
  blazing_strike: { earthquake_t: 1 },
  titan_harmony_3: { titans_harmony: 1 },
  transcendent_quake: { titan_harmony_3: 1 },

  death_spike_dk: { death_knight_mastery: 1 },
  dark_armor_dk: { death_knight_mastery: 1 },
  death_storm: { dark_armor_dk: 1 },
  transcendent_death: { dark_armor_dk: 1 },
  
  wolf_transformation: { warg_will: 1 },
  double_claw: { wolf_transformation: 1 },
  vortex_claws: { double_claw: 1 },
  transcendent_claw: { warg_will: 1 },

  assassination: { assassin_harmony: 1 },
  brutality_passive: { assassination: 1 },
  shadow_blast: { brutality_passive: 1 },
  transcendent_assassination: { assassin_harmony: 1 },

  gun_mastery_sb: { burst_fire: 1 },
  storm_blaster_harmony: { gun_mastery_sb: 1 },
  wind_barrage: { storm_blaster_harmony: 1 },
  transcendent_storm: { storm_blaster_harmony: 1 },

  lord_knight: { divine_templar_harmony: 1 },
  sacred_aegis: { lord_knight: 1 },
  transcendent_divine: { divine_templar_harmony: 1 },

  fire_weave: { element_weaver_harmony: 1 },
  ice_weave: { element_weaver_harmony: 1 },
  elemental_convergence: { fire_weave: 1 },
  transcendent_weave: { element_weaver_harmony: 1 },

  light_burst: { shinemaker_harmony: 1 },
  shining_nova: { light_burst: 1 },
  transcendent_shine: { shinemaker_harmony: 1 },

  thorn_whip: { blood_rose_harmony: 1 },
  rose_tempest: { thorn_whip: 1 },
  vine_bind: { rose_tempest: 1 },
  transcendent_rose: { blood_rose_harmony: 1 },

  iaijutsu: { samurai_harmony: 1 },
  crescent_slash: { iaijutsu: 1 },
  bushido_stance: { crescent_slash: 1 },
  transcendent_iai: { samurai_harmony: 1 },

  battle_mount: { rider_will: 1 },
  lance_charge: { battle_mount: 1 },
  devastating_charge: { lance_charge: 1 },
  transcendent_vanguard: { rider_will: 1 },

  templeKnight_harmony: { elvenKnight_harmony: 1 },
  eva_templar_harmony: { templeKnight_harmony: 1 },

  song_of_hunter: { swingsong_harmony: 1 },
  sword_muse_harmony: { swingsong_harmony: 1 },
  
  wind_rider_harmony: { scout_harmony: 1 },
  
  dance_of_fire: { spectralDancer_harmony: 1 },
  
  thunder_explosion: { storm_screamer_harmony: 1 },
  
  ogres_essence: { grand_khavatari_harmony: 1 },
  
  flame_burst_dom: { dominator_harmony: 1 },
  
  water_spiral: { ghost_sentinel_harmony: 1 }
};

const SKILL_TREE_LAYOUT_ECHO = {
  fighter_will: { row: 0, col: 0 },
  power_strike_f: { row: 1, col: 0 },
  weapon_mastery_f: { row: 2, col: 0 },
  battle_roar: { row: 3, col: 0 },
  light_armor_f: { row: 0, col: 1 },
  heavy_armor_f: { row: 1, col: 1 },
  boost_hp_f: { row: 2, col: 1 },
  stun_attack: { row: 3, col: 1 },
  war_cry: { row: 1, col: 2 },
  lethal_blow_f: { row: 3, col: 2 },
  frenzy_f: { row: 2, col: 2 },

  mage_will: { row: 0, col: 0 },
  energy_bolt_m: { row: 1, col: 0 },
  weapon_mastery_m: { row: 2, col: 0 },
  robe_mast_m: { row: 3, col: 0 },
  boost_mana_m: { row: 0, col: 1 },
  anti_magic_m: { row: 1, col: 1 },
  higher_mana_m: { row: 2, col: 1 },
  quick_recycle: { row: 3, col: 1 },
  
  warriors_harmony: { row: 0, col: 0 },
  triple_slash: { row: 1, col: 1 },
  sonicBlasterG: { row: 2, col: 1 },
  gladiators_harmony: { row: 0, col: 1 },
  dual_weapon_mast: { row: 1, col: 2 },
  sonicRage: { row: 2, col: 2 },
  duelist_harmony: { row: 0, col: 3 },
  transcendent_dual_blow: { row: 1, col: 4 }
};

if (typeof window !== 'undefined') {
  window.EchoData = { RACES_ECHO, CLASSES_ECHO, SKILL_DEFS_ECHO, SKILL_REQS_ECHO, SKILL_TREE_LAYOUT_ECHO };
}

// ================================================================
// Lineage 2 Essence 547 - Echo of Elements Skill Pack
// Instalado automaticamente no final de classes_echo.js
// ================================================================
(function installEssence547EchoSkills(root) {
  const E = root.EchoData || (root.EchoData = {});
  const CLASSES  = E.CLASSES_ECHO       || {};
  const SKILL_DEFS  = E.SKILL_DEFS_ECHO    || (E.SKILL_DEFS_ECHO = {});
  const SKILL_REQS  = E.SKILL_REQS_ECHO    || (E.SKILL_REQS_ECHO = {});
  const SKILL_TREE  = E.SKILL_TREE_LAYOUT_ECHO || (E.SKILL_TREE_LAYOUT_ECHO = {});
  const CLASS_SKILLS = E.CLASS_SKILLS_ECHO  || (E.CLASS_SKILLS_ECHO = {});

  const T = { active:'active', passive:'passive', buff:'buff', toggle:'toggle', debuff:'debuff', trigger:'trigger' };

  function slug(s) {
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/['']/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
  }

  function skill(name, type, note) {
    const id = slug(name);
    if (!SKILL_DEFS[id]) {
      SKILL_DEFS[id] = { id, name, type: type||T.active, note: note||'', maxLevel:1, essence547:true };
    }
    if (!SKILL_REQS[id]) SKILL_REQS[id] = { level:1, sp:0 };
    return id;
  }

  const A = (list) => list.map(([n,t,note]) => skill(n,t,note));

  // CLASS → aliases (todas as chaves que um classId pode ter no save)
  const CLASS_ALIASES = {
    humanFighter:['fighter'],
    warrior:['warrior'], gladiator:['gladiator'], duelist:['duelist'],
    warlord:['warlord'], dreadnought:['dreadnought'],
    knight:['knight'], paladin:['paladin'],
    phoenixKnight:['phoenixKnight','phoenix_knight'],
    darkAvenger:['darkAvenger','dark_avenger'],
    hellKnight:['hellKnight','hell_knight'],
    rogue:['rogue'],
    treasureHunter:['treasureHunter','treasure_hunter'],
    adventurer:['adventurer'],
    hawkeye:['hawkeye'], sagittarius:['sagittarius'],

    humanMage:['mage'], wizard:['wizard'], sorcerer:['sorcerer'],
    archmage:['archmage'], necromancer:['necromancer'], soultaker:['soultaker'],
    warlock:['warlock'], arcanaLord:['arcanaLord','arcana_lord'],
    cleric:['cleric'], bishop:['bishop'], cardinal:['cardinal'],
    prophet:['prophet'], hierophant:['hierophant'],

    elfFighter:['elfFighter','elf_fighter'],
    elvenKnight:['elvenKnight'], templeKnight:['templeKnight','temple_knight'],
    evaTemplar:['evaTemplar','evasTemplar','eva_templar'],
    swordSinger:['swordSinger','swordSinger_','sword_singer'],
    swordMuse:['swordMuse','sword_muse'],
    elvenScout:['elvenScout'], plainsWalker:['plainsWalker','plains_walker'],
    windRider:['windRider','windRiderElven','wind_rider'],
    silverRanger:['silverRanger','silver_ranger'],
    moonlightSentinel:['moonlightSentinel','moonlight_sentinel'],

    elfMage:['elfMage','elf_mage'],
    elvenWizard:['elvenWizard'], spellsinger:['spellsinger'],
    mysticMuse:['mysticMuse','mystic_muse'],
    elementalSummoner:['elementalSummoner','elemental_summoner'],
    elementalMaster:['elementalMaster','elemental_master'],
    oracle:['oracle'], elder:['elder'],
    evasSaint:['evasSaint','evaSaint','evas_saint'],

    darkElfFighter:['darkElfFighter','darkelf_fighter'],
    palusKnight:['palusKnight'],
    shillienKnight:['shillienKnight','shillien_knight'],
    shillienTemplar:['shillienTemplar','shillien_templar'],
    bladeDancer:['bladeDancer','bladedancer','blade_dancer'],
    spectralDancer:['spectralDancer','spectral_dancer'],
    deAssassin:['deAssassin','abyssWalker','abyss_walker'],
    ghostHunter:['ghostHunter','ghost_hunter'],
    phantomRanger:['phantomRanger','phantom_ranger'],
    ghostSentinel:['ghostSentinel','ghost_sentinel'],

    darkWizard:['darkWizard'], spellhowler:['spellhowler'],
    stormScreamer:['stormScreamer','storm_screamer'],
    phantomSummoner:['phantomSummoner','phantom_summoner'],
    spectralMaster:['spectralMaster','spectral_master'],
    shillienOracle:['shillienOracle'],
    shillienElder:['shillienElder','shillien_elder'],
    shillienSaint:['shillienSaint','shillien_saint'],

    orcFighter:['orcFighter','orc_fighter'],
    orcRaider:['orcRaider'], destroyer:['destroyer'],
    titan:['titan'], monk:['monk'], tyrant:['tyrant'],
    grandKhavatari:['grandKhavatari','grand_khavatari'],
    orcShaman:['orcShaman'],
    overlord:['overlord'], dominator:['dominator'],
    warcryer:['warcryer'], doomcryer:['doomcryer'],

    scavenger:['scavenger'], bountyHunter:['bountyHunter','bounty_hunter'],
    fortuneSeeker:['fortuneSeeker','fortune_seeker'],
    artisanClass:['artisanClass'],
    warsmith:['warsmith'], maestro:['maestro'],

    kamaelSoldier:['soulbreaker'], trooper:['trooper'],
    doombringer:['doombringer'], soulHound:['soulHound','soulhound','soul_hound'],
    warder:['warder'], trickster:['trickster'],

    deathKnight:['deathPilgrim','elfDeathPilgrim','deathBlade','elfDeathBlade','deathMessenger','elfDeathMessenger','deathKnight','elfDeathKnight'],
    warg:['wargBase','wargS1','wargS2','warg'],
    assassin:['assassinBase','assassinS1','assassinS2','assassinFinal'],
    vanguardRider:['orcRider','dragoon','vanguardRider'],
    samurai:['hatamoto','ronin','samurai'],
    stormBlaster:['sylphGunner','sharpshooter','windSniper','stormBlaster'],
    shinemaker:['shinemakerS1','shinemakerS2','shinemaker'],
    divineTemplar:['highElfBase','divineTemplarS1','divineTemplarS2','divineTemplar'],
    bloodRose:['bloodRoseBase','bloodRoseS1','bloodRoseS2','bloodRose'],
    elementWeaver:['elementWeaverS1','elementWeaverS2','elementWeaver'],
  };

  const DATA = {
    humanFighter: A([
      ['Power Strike',T.active,''],['Mortal Blow',T.active,''],['Power Shot',T.active,''],['Rush',T.active,''],['Bandage',T.active,''],
      ['HP Increase',T.passive,''],['Light Armor Mastery',T.passive,''],["Fighter's Will",T.buff,'Self-buff'],
    ]),
    warrior: A([
      ['Power Smash',T.active,''],['Spinning Slash',T.active,''],['Iron Will',T.active,''],
      ['Sword Blunt Mastery',T.passive,''],['Polearm Mastery',T.passive,''],['Heavy Armor Mastery',T.passive,''],
      ['HP Increase II',T.passive,''],['Weight Limit',T.passive,''],['Battle Roar',T.buff,''],
    ]),
    gladiator: A([
      ['Triple Slash',T.active,''],['Sonic Blaster',T.active,''],['Sonic Storm',T.active,''],['Sonic Buster',T.active,''],
      ['Double Sonic Slash',T.active,''],['Hammer Crush',T.active,''],['Tribunal',T.active,''],['Lionheart',T.active,''],
      ['War Frenzy',T.active,''],['Dual Weapon Mastery',T.passive,''],['Focus',T.passive,''],['Critical Power',T.passive,''],
      ['Boost HP',T.passive,''],['Vicious Stance',T.toggle,''],['Sonic Move',T.active,''],["Gladiator's Harmony",T.buff,''],
    ]),
    duelist: A([
      ['Sonic Focus',T.active,''],['Force Blaster',T.active,''],['Dual Blow',T.active,''],['Rushing Force',T.active,''],
      ['Long Blow',T.active,''],['Dual Dagger Blow',T.active,''],['Force Buster',T.active,''],['Earthquake',T.active,''],
      ['Real Target',T.active,''],['Thrill Fight',T.active,''],['Duelist Spirit',T.passive,''],['Blade of the Duelist',T.passive,''],
      ['Sonic Rage',T.active,'Echo'],['Master of Combat',T.passive,'Essence'],["Duelist's Harmony",T.buff,''],
      ['Transcendent Dual Blow',T.active,'Transcendent'],
    ]),
    warlord: A([
      ['Whirlwind',T.active,''],['Thunder Storm',T.active,''],['Howl',T.active,''],['Provoke',T.active,''],
      ['Fellswoop',T.active,''],['War Cry',T.active,''],['Freezing Strike',T.active,''],['Burning Chop',T.active,''],
      ['Shock Stomp',T.active,''],['Polearm Mastery',T.passive,''],['Vital Force',T.passive,''],['Focus',T.passive,''],
      ['Boost HP',T.passive,''],['Heavy Armor Mastery',T.passive,''],["Warlord's Harmony",T.buff,''],
    ]),
    dreadnought: A([
      ['Rush Impact',T.active,''],['War Frenzy',T.active,''],['Dread Pool',T.active,''],['Lionheart',T.active,''],
      ['Anti-Magic Armor',T.active,''],['Weapon Blockade',T.active,''],['Spike',T.active,''],
      ['Dreadnought Spirit',T.passive,''],['Body of the Dreadnought',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Dreadnought's Harmony",T.buff,''],['Transcendent Whirlwind',T.active,'Transcendent'],
    ]),
    knight: A([
      ['Shield Strike',T.active,''],['Hate',T.active,''],['Aura of Hate',T.active,''],
      ['Shield Mastery',T.passive,''],['Heavy Armor Mastery',T.passive,''],['Sword Blunt Mastery',T.passive,''],
      ['HP Increase II',T.passive,''],['Deflect Arrow',T.passive,''],["Knight's Harmony",T.buff,''],
    ]),
    paladin: A([
      ['Majesty',T.active,''],['Holy Blade',T.active,''],['Shield Stun',T.active,''],['Angelic Icon',T.active,''],
      ['Sacrifice',T.active,''],['Aegis',T.active,''],['Vengeance',T.active,''],['Provoke',T.active,''],
      ['Ultimate Defense',T.active,''],['Holy Blessing',T.active,''],['Summon Storm Cubic',T.active,''],
      ['Heavy Armor Mastery',T.passive,''],['Shield Mastery',T.passive,''],['Boost HP',T.passive,''],
      ['Resist Holy Dark',T.passive,''],["Paladin's Harmony",T.buff,''],
    ]),
    phoenixKnight: A([
      ['Touch of Life',T.active,''],['Phoenix Aura',T.active,''],['Shield of Faith',T.active,''],['Flame Icon',T.active,''],
      ['Celestial Shield',T.active,''],['Summon Imperial Phoenix',T.active,''],['Phoenix Knight Spirit',T.passive,''],
      ['Body of the Phoenix',T.passive,''],['Protection of Faith',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Phoenix Knight's Harmony",T.buff,''],['Transcendent Shield Charge',T.active,'Transcendent'],
    ]),
    darkAvenger: A([
      ['Summon Dark Panther',T.active,''],['Horror',T.active,''],['Drain Health',T.active,''],['Shield Stun',T.active,''],
      ['Judgment',T.active,''],['Doom Shield',T.active,''],['Seed of Revenge',T.active,''],['Touch of Death',T.active,''],
      ['Dark Flame',T.active,''],['Provoke',T.active,''],['Heavy Armor Mastery',T.passive,''],
      ['Shield Mastery',T.passive,''],['Boost HP',T.passive,''],['Reflect Damage',T.passive,''],["Dark Avenger's Harmony",T.buff,''],
    ]),
    hellKnight: A([
      ['Insane Crusher',T.active,''],['Panther Cancel',T.active,''],['Anthem of Hell',T.active,''],['Gehenna',T.active,''],
      ['Touch of Darkness',T.active,''],['Summon Dark Panther Enhanced',T.active,''],['Hell Knight Spirit',T.passive,''],
      ['Body of the Hell Knight',T.passive,''],['Protection of Darkness',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Hell Knight's Harmony",T.buff,''],['Transcendent Dark Strike',T.active,'Transcendent'],
    ]),
    rogue: A([
      ['Double Shot',T.active,''],['Backstab',T.active,''],['Dash',T.active,''],['Unlock',T.active,''],
      ['Light Armor Mastery',T.passive,''],['Dagger Mastery',T.passive,''],['Bow Mastery',T.passive,''],
      ['Critical Chance',T.passive,''],["Rogue's Harmony",T.buff,''],
    ]),
    treasureHunter: A([
      ['Deadly Blow',T.active,''],['Lethal Blow',T.active,''],['Sand Bomb',T.active,''],['Fake Death',T.active,''],
      ['Trick',T.active,''],['Lure',T.active,''],['Blinding Blow',T.active,''],['Mirage',T.active,''],
      ['Shadow Step',T.active,''],['Switch',T.active,''],['Detect Remove Trap',T.active,''],
      ['Evasion',T.passive,''],['Critical Power',T.passive,''],['Dagger Mastery',T.passive,''],
      ['Light Armor Mastery',T.passive,''],['Focus',T.passive,''],["Treasure Hunter's Harmony",T.buff,''],
    ]),
    adventurer: A([
      ['Exciting Adventure',T.active,''],['Shadow Sense',T.passive,''],['Wind Riding',T.active,''],
      ['Lucky Strike',T.active,''],['Detection',T.active,''],['Adventurer Spirit',T.passive,''],
      ['Body of the Adventurer',T.passive,''],['Final Frenzy',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Adventurer's Harmony",T.buff,''],['Transcendent Deadly Blow',T.active,'Transcendent'],
    ]),
    hawkeye: A([
      ['Double Shot',T.active,''],['Burst Shot',T.active,''],['Stun Shot',T.active,''],['Rapid Fire',T.active,''],
      ['Arrow Rain',T.active,''],['Cheap Shot',T.active,''],['Bow Mastery',T.passive,''],['Long Shot',T.passive,''],
      ['Focus',T.passive,''],['Critical Power',T.passive,''],['Light Armor Mastery',T.passive,''],
      ['Evasion',T.passive,''],["Hawkeye's Harmony",T.buff,''],
    ]),
    sagittarius: A([
      ['Seven Arrow',T.active,''],['Arrow Flare',T.active,''],['Dead Eye',T.active,''],['Pinpoint Shot',T.active,''],
      ['Triple Shot',T.active,'Echo'],['Thorn Shot',T.active,'Echo'],['Binding Shot',T.active,'Echo'],
      ['Incendiary Shot',T.active,'Echo'],['Freezing Shot',T.active,'Echo'],['Wind Shot',T.active,'Echo'],
      ['Flame Arrow Rain',T.active,'Echo'],['Water Arrow Rain',T.active,'Echo'],['Storm Arrow Rain',T.active,'Echo'],
      ['Spiral Shot',T.active,'Echo'],['Target Lock',T.active,'Echo'],['Sagittarius Spirit',T.passive,''],
      ['Body of the Sagittarius',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Sagittarius Harmony",T.buff,''],['Transcendent Seven Arrow',T.active,'Transcendent'],
    ]),

    humanMage: A([
      ['Wind Strike',T.active,''],['Self Heal',T.active,''],['Group Heal',T.active,''],['Flame Strike',T.active,''],
      ['Sleep',T.active,''],['Ice Bolt',T.active,''],['Robe Mastery',T.passive,''],['MP Increase',T.passive,''],
      ["Mage's Will",T.buff,''],
    ]),
    wizard: A([
      ['Blaze',T.active,''],['Aqua Swirl',T.active,''],['Twister',T.active,''],['Flame Strike',T.active,''],
      ['Surrender to Fire',T.active,''],['Surrender to Water',T.active,''],['Surrender to Wind',T.active,''],
      ['Aura Burn',T.active,''],['Life Drain',T.active,''],['Robe Mastery',T.passive,''],['Boost Mana',T.passive,''],
      ["Wizard's Harmony",T.buff,''],
    ]),
    sorcerer: A([
      ['Solar Flare',T.active,''],['Freezing Skin',T.active,''],['Arcane Power',T.active,''],['Blizzard',T.active,''],
      ['Hurricane',T.active,''],['Prominence',T.active,''],['Hydro Blast',T.active,''],['Aura Flash',T.active,''],
      ['Tempest',T.active,''],['Body to Mind',T.active,''],['Cancel',T.active,''],['Anti-Magic',T.active,''],
      ['Elemental Assault',T.passive,''],['Boost Mana',T.passive,''],['Robe Mastery',T.passive,''],["Sorcerer's Harmony",T.buff,''],
    ]),
    archmage: A([
      ['Hell Inferno',T.active,''],['Seed of Fire',T.active,''],['Seed of Water',T.active,''],['Seed of Wind',T.active,''],
      ['Elemental Burst',T.active,''],['Elemental Storm',T.active,''],['Mana Burn',T.active,''],
      ['Mystic Immunity',T.active,''],['Empowering Echo',T.active,''],['Fire Spiral',T.active,'Echo'],
      ['Flame Explosion',T.active,'Echo'],['Spell Mastery',T.passive,'Echo'],['Magic Focus',T.passive,'Echo'],
      ['Archmage Spirit',T.passive,''],['Body of the Archmage',T.passive,''],["Archmage's Harmony",T.buff,''],
      ['Transcendent Hell Inferno',T.active,'Transcendent'],
    ]),
    necromancer: A([
      ['Corpse Plague',T.active,''],['Death Spike',T.active,''],['Vampiric Claw',T.active,''],['Anchor',T.active,''],
      ['Curse Gloom',T.active,''],['Corpse Burst',T.active,''],['Summon Reanimated Man',T.active,''],
      ['Summon Cursed Bone',T.active,''],['Surrender to Unholy',T.active,''],['Curse Fear',T.active,''],
      ['Bone Armor',T.passive,''],['Boost Mana',T.passive,''],['Robe Mastery',T.passive,''],["Necromancer's Harmony",T.buff,''],
    ]),
    soultaker: A([
      ['Soul Vortex',T.active,''],['Soul Vortex Destruction',T.active,''],['Mass Curse Gloom',T.active,''],
      ['Soul Absorption',T.active,''],['Summon Dark Curse',T.active,''],['Dark Burden',T.active,''],
      ['Void Explosion',T.active,'Echo'],['Spell Mastery',T.passive,'Echo'],['Magic Focus',T.passive,'Echo'],
      ['Soultaker Spirit',T.passive,''],['Body of the Soultaker',T.passive,''],["Soultaker's Harmony",T.buff,''],
      ['Transcendent Soul Vortex',T.active,'Transcendent'],
    ]),
    warlock: A([
      ['Summon Shadow',T.active,''],['Summon Silhouette',T.active,''],['Summon Soulless',T.active,''],
      ['Summon Binding Cubic',T.active,''],['Summon Phantom Cubic',T.active,''],['Servitor Heal',T.active,''],
      ['Servitor Recharge',T.active,''],['Transfer Pain',T.active,''],['Life Cubic',T.active,''],
      ['Servitor Physical Attack',T.passive,''],['Boost Mana',T.passive,''],['Robe Mastery',T.passive,''],["Warlock's Harmony",T.buff,''],
    ]),
    arcanaLord: A([
      ['Summon Feline King',T.active,''],['Summon Magnus',T.active,''],['Servitor Barrier',T.active,''],
      ['Mass Servitor Heal',T.active,''],['Final Servitor',T.active,''],['Servitor Empowerment',T.active,''],
      ['Arcana Lord Spirit',T.passive,''],['Body of the Arcana Lord',T.passive,''],["Arcana Lord's Harmony",T.buff,''],
      ['Transcendent Summon Burst',T.active,'Transcendent'],
    ]),
    cleric: A([
      ['Heal',T.active,''],['Battle Heal',T.active,''],['Might',T.active,''],['Shield',T.buff,''],
      ['Wind Walk',T.active,''],['Cure Poison',T.active,''],['Cure Bleed',T.active,''],['Turn Undead',T.active,''],
      ['Recharge',T.active,''],['Robe Mastery',T.passive,''],["Cleric's Harmony",T.buff,''],
    ]),
    bishop: A([
      ['Greater Heal',T.active,''],['Greater Group Heal',T.active,''],['Resurrection',T.active,''],
      ['Greater Might',T.active,''],['Greater Shield',T.active,''],['Purify',T.active,''],['Cleanse',T.active,''],
      ['Blessed Body',T.active,''],['Blessed Soul',T.active,''],['Mental Shield',T.active,''],['Inquisitor',T.active,''],
      ['Major Heal',T.active,''],['Holy Weapon',T.active,''],['Party Recall',T.active,''],
      ['Mana Regeneration',T.passive,''],['Boost Mana',T.passive,''],['Robe Mastery',T.passive,''],
      ["Bishop's Harmony",T.buff,''],['Holy Strike',T.active,'Essence'],['Divine Punishment',T.active,'Essence'],
    ]),
    cardinal: A([
      ['Sublime Self-Sacrifice',T.active,''],['Balance Life',T.active,''],['Mass Resurrection',T.active,''],
      ['Miracle',T.active,''],['Lord of Vampire',T.active,''],['Blessing of Eva',T.active,''],['Trance',T.active,''],
      ['Cardinal Spirit',T.passive,''],['Body of the Cardinal',T.passive,''],["Cardinal's Harmony",T.buff,''],
      ['Dark Side',T.toggle,'Echo'],['Holy Burst',T.active,'Essence'],['Divine Nova',T.active,'Essence'],
      ['Transcendent Holy Strike',T.active,'Transcendent'],
    ]),
    prophet: A([
      ['Haste',T.buff,''],['Berserker Spirit',T.buff,''],['Bless Shield',T.active,''],
      ['Prophecy of Water',T.active,''],['Resist Fire',T.active,''],['Resist Water',T.active,''],
      ['Resist Wind',T.active,''],['Vampiric Rage',T.buff,''],['Empower',T.buff,''],['Acumen',T.buff,''],
      ['Concentration',T.buff,''],['Focus',T.buff,''],['Death Whisper',T.buff,''],['Guidance',T.buff,''],
      ['Mental Shield',T.active,''],['Heal',T.active,''],['Robe Mastery',T.passive,''],['Boost Mana',T.passive,''],
      ["Prophet's Harmony",T.buff,''],['Holy Strike',T.active,'Essence'],
    ]),
    hierophant: A([
      ['Prophecy of Fire',T.buff,''],['Prophecy of Wind',T.buff,''],['Prophecy of Water',T.buff,''],
      ['Cleanse',T.active,''],['Mystic Immunity',T.active,''],['Blessing of Nobility',T.active,''],
      ['Hierophant Spirit',T.passive,''],['Body of the Hierophant',T.passive,''],["Hierophant's Harmony",T.buff,''],
      ['Mass Prophecy',T.active,'Essence'],['Holy Punishment',T.active,'Essence'],['Transcendent Holy Burst',T.active,'Transcendent'],
    ]),

    elfFighter: A([
      ['Power Strike',T.active,''],['Mortal Blow',T.active,''],['Power Shot',T.active,''],['Bandage',T.active,''],
      ['HP Increase',T.passive,''],['Light Armor Mastery',T.passive,''],['Elven Spirit',T.buff,''],
    ]),
    elvenKnight: A([
      ['Shield Strike',T.active,''],['Hate',T.active,''],['Shield Mastery',T.passive,''],
      ['Heavy Armor Mastery',T.passive,''],['Sword Blunt Mastery',T.passive,''],
      ['HP Increase II',T.passive,''],['Deflect Arrow',T.passive,''],['Power Break',T.active,''],
    ]),
    templeKnight: A([
      ['Shield Stun',T.active,''],['Tribunal',T.active,''],['Sacrifice',T.active,''],['Aegis',T.active,''],
      ["Eva's Will",T.active,''],['Ultimate Defense',T.active,''],['Holy Blade',T.active,''],
      ['Provoke',T.active,''],['Summon Life Cubic',T.active,''],['Summon Binding Cubic',T.active,''],
      ['Summon Storm Cubic',T.active,''],['Heavy Armor Mastery',T.passive,''],
      ['Shield Mastery',T.passive,''],['Boost HP',T.passive,''],["Temple Knight's Harmony",T.buff,''],
    ]),
    evaTemplar: A([
      ["Touch of Eva",T.active,''],["Shield of Eva",T.active,''],['Celestial Shield',T.active,''],
      ['Summon Guardian Agathion',T.active,''],["Eva's Templar Spirit",T.passive,''],
      ["Body of Eva's Templar",T.passive,''],['Protection of Eva',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ["Eva's Templar Harmony",T.buff,''],['Aqua Strike',T.active,'Essence'],["Eva's Help",T.trigger,'Trigger'],
      ['Transcendent Shield Charge',T.active,'Transcendent'],
    ]),
    swordSinger: A([
      ['Song of Earth',T.buff,''],['Song of Life',T.buff,''],['Song of Water',T.buff,''],['Song of Warding',T.buff,''],
      ['Song of Wind',T.buff,''],['Song of Hunter',T.buff,''],['Song of Invocation',T.buff,''],
      ['Song of Vitality',T.buff,''],['Song of Vengeance',T.buff,''],['Song of Flame Guard',T.buff,''],
      ['Song of Champion',T.buff,''],['Song of Renewal',T.buff,''],
      ['Sword Blunt Mastery',T.passive,''],['Heavy Armor Mastery',T.passive,''],['Boost HP',T.passive,''],
    ]),
    swordMuse: A([
      ['Song of Purification',T.buff,''],['Song of Elemental',T.buff,''],['Song of Storm Guard',T.buff,''],
      ['Mass Song',T.active,''],['Final Song',T.active,''],['Sword Muse Spirit',T.passive,''],
      ['Body of Sword Muse',T.passive,''],['Sword Muse Harmony',T.buff,''],
      ['Sonic Slash',T.active,'Echo'],['Melody Strike',T.active,'Echo'],['Transcendent Melody',T.active,'Transcendent'],
    ]),
    elvenScout: A([
      ['Double Shot',T.active,''],['Backstab',T.active,''],['Dash',T.active,''],
      ['Light Armor Mastery',T.passive,''],['Dagger Mastery',T.passive,''],['Bow Mastery',T.passive,''],
      ['Critical Chance',T.passive,''],
    ]),
    plainsWalker: A([
      ['Deadly Blow',T.active,''],['Lethal Blow',T.active,''],['Sand Bomb',T.active,''],
      ['Blinding Blow',T.active,''],['Switch',T.active,''],['Shadow Step',T.active,''],
      ['Fake Death',T.active,''],['Trick',T.active,''],
      ['Evasion',T.passive,''],['Critical Power',T.passive,''],['Dagger Mastery',T.passive,''],['Focus',T.passive,''],
    ]),
    windRider: A([
      ['Wind Riding',T.active,''],['Exciting Adventure',T.active,''],['Lucky Strike',T.active,''],
      ['Shadow Sense',T.passive,''],['Final Frenzy',T.passive,''],['Wind Rider Spirit',T.passive,''],
      ['Body of Wind Rider',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ['Wind Rider Harmony',T.buff,''],['Transcendent Deadly Blow',T.active,'Transcendent'],
    ]),
    silverRanger: A([
      ['Double Shot',T.active,''],['Burst Shot',T.active,''],['Stun Shot',T.active,''],['Rapid Fire',T.active,''],
      ['Arrow Rain',T.active,''],['Bow Mastery',T.passive,''],['Long Shot',T.passive,''],
      ['Focus',T.passive,''],['Critical Power',T.passive,''],['Evasion',T.passive,''],
    ]),
    moonlightSentinel: A([
      ['Seven Arrow',T.active,''],['Dead Eye',T.active,''],['Pinpoint Shot',T.active,''],
      ['Triple Shot',T.active,'Echo'],['Thorn Shot',T.active,'Echo'],['Binding Shot',T.active,'Echo'],
      ['Incendiary Shot',T.active,'Echo'],['Freezing Shot',T.active,'Echo'],['Wind Shot',T.active,'Echo'],
      ['Elemental Arrow Rain',T.active,'Echo'],['Spiral Shot',T.active,'Echo'],['Target Lock',T.active,'Echo'],
      ['Moonlight Sentinel Spirit',T.passive,''],['Body of Moonlight Sentinel',T.passive,''],
      ['Moonlight Harmony',T.buff,''],['Transcendent Seven Arrow',T.active,'Transcendent'],
    ]),

    elfMage: A([
      ['Wind Strike',T.active,''],['Self Heal',T.active,''],['Ice Bolt',T.active,''],['Sleep',T.active,''],
      ['Robe Mastery',T.passive,''],['MP Increase',T.passive,''],
    ]),
    elvenWizard: A([
      ['Blaze',T.active,''],['Aqua Swirl',T.active,''],['Twister',T.active,''],['Aura Burn',T.active,''],
      ['Surrender to Water',T.active,''],['Surrender to Wind',T.active,''],["Elven Wizard's Harmony",T.buff,''],
    ]),
    spellsinger: A([
      ['Aqua Splash',T.active,''],['Hydro Blast',T.active,''],['Blizzard',T.active,''],['Aura Flash',T.active,''],
      ['Arcane Power',T.active,''],['Boost Mana',T.passive,''],['Robe Mastery',T.passive,''],["Spellsinger's Harmony",T.buff,''],
    ]),
    mysticMuse: A([
      ['Aqua Splash',T.active,''],['Elemental Burst',T.active,''],['Elemental Storm',T.active,''],
      ['Seed of Water',T.active,''],['Mystic Immunity',T.active,''],['Empowering Echo',T.active,''],
      ['Water Spiral',T.active,'Echo'],['Aqua Explosion',T.active,'Echo'],
      ['Spell Mastery',T.passive,'Echo'],['Magic Focus',T.passive,'Echo'],
      ['Mystic Muse Spirit',T.passive,''],['Body of the Mystic Muse',T.passive,''],['Mystic Muse Harmony',T.buff,''],
    ]),
    elementalSummoner: A([
      ['Summon Unicorn Boxer',T.active,''],['Summon Unicorn Mirage',T.active,''],['Summon Unicorn Merrow',T.active,''],
      ['Servitor Heal',T.active,''],['Servitor Recharge',T.active,''],['Transfer Pain',T.active,''],
      ['Binding Cubic',T.active,''],['Life Cubic',T.active,''],['Boost Mana',T.passive,''],
    ]),
    elementalMaster: A([
      ['Summon Feline Queen',T.active,''],['Summon Seraphim',T.active,''],['Servitor Barrier',T.active,''],
      ['Mass Servitor Heal',T.active,''],['Final Servitor',T.active,''],["Unicorn's Friendship",T.passive,'Essence'],
      ['Elemental Concentration',T.passive,'Essence'],['Elemental Master Spirit',T.passive,''],
      ['Body of the Elemental Master',T.passive,''],['Elemental Master Harmony',T.buff,''],
    ]),
    oracle: A([
      ['Heal',T.active,''],['Battle Heal',T.active,''],['Recharge',T.active,''],['Cure Poison',T.active,''],
      ['Wind Walk',T.active,''],["Oracle's Harmony",T.buff,''],
    ]),
    elder: A([
      ['Greater Heal',T.active,''],['Greater Group Heal',T.active,''],['Resurrection',T.active,''],
      ['Purify',T.active,''],['Cleanse',T.active,''],['Blessing of Eva',T.active,''],
      ['Robe Mastery',T.passive,''],['Boost Mana',T.passive,''],
    ]),
    evasSaint: A([
      ['Sublime Self-Sacrifice',T.active,''],['Balance Life',T.active,''],['Mass Resurrection',T.active,''],
      ['Blessing of Eva',T.active,''],['Miracle',T.active,''],["Eva's Saint Spirit",T.passive,''],
      ["Body of Eva's Saint",T.passive,''],["Eva's Saint Harmony",T.buff,''],
      ['Dark Side',T.toggle,'Echo'],['Aqua Strike',T.active,'Essence'],["Eva's Help",T.trigger,'Trigger'],
      ['Divine Nova',T.active,'Essence'],
    ]),

    darkElfFighter: A([
      ['Power Strike',T.active,''],['Mortal Blow',T.active,''],['Power Shot',T.active,''],['Bandage',T.active,''],
      ['HP Increase',T.passive,''],['Light Armor Mastery',T.passive,''],['Dark Elven Spirit',T.buff,''],
    ]),
    shillienKnight: A([
      ['Shield Stun',T.active,''],['Judgment',T.active,''],['Dark Flame',T.active,''],['Sacrifice',T.active,''],
      ['Aegis',T.active,''],['Ultimate Defense',T.active,''],['Drain Health',T.active,''],['Horror',T.active,''],
      ['Lightning Strike',T.active,''],['Touch of Death',T.active,''],['Provoke',T.active,''],
      ['Summon Dark Cubic',T.active,''],['Heavy Armor Mastery',T.passive,''],
      ['Shield Mastery',T.passive,''],['Boost HP',T.passive,''],
    ]),
    shillienTemplar: A([
      ['Touch of Shillien',T.active,''],['Shield of Shillien',T.active,''],['Celestial Shield',T.active,''],
      ['Summon Guardian Agathion',T.active,''],["Shillien's Curse",T.active,'Echo'],['Abyss Strike',T.active,'Essence'],
      ["Shillien's Help",T.trigger,'Trigger'],['Shillien Templar Spirit',T.passive,''],
      ['Body of Shillien Templar',T.passive,''],['Protection of Shillien',T.passive,''],
      ['Master of Combat',T.passive,'Essence'],['Shillien Templar Harmony',T.buff,''],
      ['Transcendent Abyss Strike',T.active,'Transcendent'],
    ]),
    bladeDancer: A([
      ['Dance of Fire',T.buff,''],['Dance of Fury',T.buff,''],['Dance of Concentration',T.buff,''],
      ['Dance of Light',T.buff,''],['Dance of Mystic',T.buff,''],['Dance of Warrior',T.buff,''],
      ['Dance of Aqua Guard',T.buff,''],['Dance of Inspiration',T.buff,''],['Dance of Vampire',T.buff,''],
      ['Dance of Protection',T.buff,''],['Dance of Shadow',T.buff,''],['Dance of Siren',T.buff,''],
      ['Dual Weapon Mastery',T.passive,''],['Heavy Armor Mastery',T.passive,''],['Boost HP',T.passive,''],
    ]),
    spectralDancer: A([
      ['Dance of Berserker',T.buff,''],['Dance of Blade Storm',T.buff,''],['Mass Dance',T.active,''],
      ['Final Dance',T.active,''],['Spectral Dancer Spirit',T.passive,''],['Body of Spectral Dancer',T.passive,''],
      ['Spectral Dancer Harmony',T.buff,''],['Shadow Slash',T.active,'Echo'],['Dark Dance Strike',T.active,'Echo'],
      ['Transcendent Dance',T.active,'Transcendent'],
    ]),
    ghostHunter: A([
      ['Exciting Adventure',T.active,''],['Shadow Sense',T.passive,''],['Wind Riding',T.active,''],
      ['Lucky Strike',T.active,''],['Ghost Hunter Spirit',T.passive,''],['Body of Ghost Hunter',T.passive,''],
      ['Final Frenzy',T.passive,''],['Master of Combat',T.passive,'Essence'],['Ghost Hunter Harmony',T.buff,''],
    ]),
    ghostSentinel: A([
      ['Seven Arrow',T.active,''],['Dead Eye',T.active,''],['Pinpoint Shot',T.active,''],
      ['Triple Shot',T.active,'Echo'],['Thorn Shot',T.active,'Echo'],['Binding Shot',T.active,'Echo'],
      ['Incendiary Shot',T.active,'Echo'],['Freezing Shot',T.active,'Echo'],['Wind Shot',T.active,'Echo'],
      ['Target Lock',T.active,'Echo'],['Ghost Sentinel Spirit',T.passive,''],['Body of Ghost Sentinel',T.passive,''],
      ['Ghost Sentinel Harmony',T.buff,''],['Transcendent Seven Arrow',T.active,'Transcendent'],
    ]),
    stormScreamer: A([
      ['Demon Wind',T.active,''],['Elemental Burst',T.active,''],['Elemental Storm',T.active,''],
      ['Seed of Wind',T.active,''],['Mystic Immunity',T.active,''],['Empowering Echo',T.active,''],
      ['Wind Spiral',T.active,'Echo'],['Thunder Explosion',T.active,'Echo'],
      ['Spell Mastery',T.passive,'Echo'],['Magic Focus',T.passive,'Echo'],
      ['Storm Screamer Spirit',T.passive,''],['Body of Storm Screamer',T.passive,''],['Storm Screamer Harmony',T.buff,''],
    ]),
    spectralMaster: A([
      ['Summon Spectral Lord',T.active,''],['Servitor Barrier',T.active,''],['Mass Servitor Heal',T.active,''],
      ['Final Servitor',T.active,''],['Spectral Master Spirit',T.passive,''],['Body of Spectral Master',T.passive,''],
      ['Spectral Master Harmony',T.buff,''],
    ]),
    shillienSaint: A([
      ['Dark Disruption',T.active,'Essence'],["Shillien's Help",T.trigger,'Trigger'],['Dark Side',T.toggle,'Echo'],
      ['Shillien Saint Spirit',T.passive,''],['Body of Shillien Saint',T.passive,''],['Shillien Saint Harmony',T.buff,''],
      ['Sublime Self-Sacrifice',T.active,''],['Balance Life',T.active,''],['Mass Resurrection',T.active,''],
      ['Divine Nova',T.active,'Essence'],
    ]),

    orcFighter: A([
      ['Power Strike',T.active,''],['Iron Punch',T.active,''],['Bandage',T.active,''],
      ['HP Increase',T.passive,''],['Light Armor Mastery',T.passive,''],
    ]),
    titan: A([
      ['Earthquake',T.active,''],['Real Target',T.active,''],['Frenzy',T.active,''],['Guts',T.active,''],
      ['Zealot',T.active,''],['Anti-Magic Armor',T.active,''],['Fists of Fury',T.active,''],['Soul Breaker',T.active,''],
      ['Titan Spirit',T.passive,''],['Body of the Titan',T.passive,''],['Pride of Titan',T.passive,''],
      ['Master of Combat Orc',T.passive,'Echo'],["Titan's Harmony",T.buff,''],
      ['Blazing Strike',T.active,'Echo'],['Transcendent Earthquake',T.active,'Transcendent'],
    ]),
    grandKhavatari: A([
      ['Force Focus',T.active,''],['Soul of the Phoenix',T.active,''],['Rapid Attack',T.active,''],
      ['Hurricane Assault',T.active,''],['Fist Fury',T.active,''],['Totem Spirits',T.active,''],
      ['Grand Khavatari Spirit',T.passive,''],['Body of Grand Khavatari',T.passive,''],
      ['Master of Combat Orc',T.passive,'Echo'],['Grand Khavatari Harmony',T.buff,''],
      ["Ogre's Essence",T.buff,'Echo'],['Rabbit Spirit Totem',T.active,'Echo'],
      ['Transcendent Hurricane',T.active,'Transcendent'],
    ]),
    dominator: A([
      ['Seal of Limit',T.active,''],['Clan Imperium',T.active,''],["Victoria of Pa_agrio",T.active,''],
      ["Glory of Pa_agrio",T.active,''],["Blessing of Pa_agrio",T.active,''],['Mass Seal of Gloom',T.active,''],
      ['Flame Burst',T.active,'Echo'],["Prophecy of Pa_agrio",T.buff,'Echo'],
      ['Dominator Spirit',T.passive,''],['Body of the Dominator',T.passive,''],['Dominator Harmony',T.buff,''],
      ['Transcendent Flame Burst',T.active,'Transcendent'],
    ]),
    doomcryer: A([
      ['Chant of Magnus',T.buff,''],['Chant of Berserker',T.buff,''],['Mass Chant',T.active,''],
      ['Final Chant',T.active,''],['War Chant',T.active,''],['Blood Bond',T.active,'Echo'],
      ['Prophecy of Victory',T.buff,'Echo'],['Cacophony of War',T.active,'Echo'],
      ['Doomcryer Spirit',T.passive,''],['Body of the Doomcryer',T.passive,''],['Doomcryer Harmony',T.buff,''],
    ]),
    bountyHunter: A([
      ['Spoil',T.active,''],['Sweeper',T.active,''],['Lucky Strike',T.active,''],
      ['Bounty Hunter Spirit',T.passive,''],['Body of the Bounty Hunter',T.passive,''],
      ['Bounty Hunter Harmony',T.buff,''],['Transcendent Spoil Crush',T.active,'Transcendent'],
    ]),
    fortuneSeeker: A([
      ['Spoil Crush',T.active,''],['Lucky Strike',T.active,''],
      ['Fortune Seeker Spirit',T.passive,''],['Body of the Fortune Seeker',T.passive,''],
      ['Fortune Seeker Harmony',T.buff,''],['Transcendent Spoil Crush',T.active,'Transcendent'],
    ]),
    artisanClass: A([
      ['Craft Mastery',T.passive,''],['Summon Mechanic Golem',T.active,''],['Repair Golem',T.active,''],
      ['Artisan Spirit',T.passive,''],['Artisan Harmony',T.buff,''],
    ]),
    warsmith: A([
      ['Craft Mastery',T.passive,''],['Summon Siege Golem',T.active,''],['Summon Mechanic Golem',T.active,''],
      ['Repair Golem',T.active,''],['Warsmith Spirit',T.passive,''],['Warsmith Harmony',T.buff,''],
    ]),
    maestro: A([
      ['Summon Merchant Golem',T.active,''],['Golem Armor',T.active,''],
      ['Maestro Spirit',T.passive,''],['Body of the Maestro',T.passive,''],['Maestro Harmony',T.buff,''],
      ['Transcendent Hammer Crush',T.active,'Transcendent'],
    ]),

    kamaelSoldier: A([
      ['Soul Thrust',T.active,''],['Soul Absorb',T.active,''],['Light Armor Mastery',T.passive,''],
      ['Kamael Spirit',T.buff,''],
    ]),
    trooper: A([
      ['Soul Crush',T.active,''],['Berserker',T.active,''],['Critical Power',T.passive,''],
      ['Dagger Mastery',T.passive,''],
    ]),
    doombringer: A([
      ['Doom Blade',T.active,''],['Soul Explosion',T.active,''],['Soul Rage',T.active,''],
      ['Dissonance',T.active,''],['Betrayal Mark',T.active,''],['Doombringer Spirit',T.passive,''],
      ['Body of Doombringer',T.passive,''],['Pride of Kamael',T.passive,''],['Master of Combat',T.passive,'Essence'],
      ['Doombringer Harmony',T.buff,''],
    ]),
    soulHound: A([
      ['Lightning Barrier',T.active,''],['Soul Vortex Destruction',T.active,''],['Soul Ignition',T.active,''],
      ['Dark Smash',T.active,''],['Soul Hound Spirit',T.passive,''],['Body of Soul Hound',T.passive,''],
      ['Soul Hound Harmony',T.buff,''],
    ]),
    warder: A([
      ['Crossbow Mastery',T.passive,''],['Install Trap',T.active,''],['Pinpoint Shot',T.active,''],
      ['Stun Shot',T.active,''],
    ]),
    trickster: A([
      ['Seven Arrow Crossbow',T.active,''],['Install Trap',T.active,''],['Dead Eye',T.active,''],
      ['Pinpoint Shot',T.active,''],['Trickster Spirit',T.passive,''],['Body of Trickster',T.passive,''],
      ['Trickster Harmony',T.buff,''],
    ]),

    deathKnight: A([
      ['Death Spike',T.active,''],['Death Raid',T.active,''],['Dark Explosion',T.active,''],
      ['Death Mark',T.active,''],['Soul Drain',T.active,''],['Dark Shield',T.active,''],
      ['Abyss Gaze',T.active,''],['Death Storm',T.active,'AoE'],['Deadly Counter',T.active,''],
      ['Dark Weapon',T.buff,''],['Dark Armor',T.buff,''],['Ultimate Death Knight',T.passive,''],
      ["Death Knight's Will",T.passive,''],['DP Mastery',T.passive,'Death Points'],
      ['Transcendent Death Spike',T.active,'Transcendent'],
    ]),
    warg: A([
      ['Upward Strike',T.active,'Human'],['Devastating Assault',T.active,'Human'],
      ['Powerful Fists',T.active,'Human'],['Rush',T.active,''],['Fist Mastery',T.passive,''],
      ['Light Armor Mastery',T.passive,''],["Warg's Will",T.buff,''],
      ['Double Claw Strike',T.active,'Wolf'],['Vortex of Claws',T.active,'Wolf'],
      ['Transcendent Double Claw Strike',T.active,'Transcendent'],['Wild Rush',T.active,'Wolf'],
      ['Primal Howl',T.active,'Wolf'],["Moon's Grace",T.buff,''],['Wolf Transformation',T.toggle,''],
      ['Warg Spirit',T.passive,''],['Warg Mastery',T.passive,''],
    ]),
    assassin: A([
      ['Assassination',T.active,''],['Shadow Strike',T.active,''],['Shadow Dash',T.active,''],
      ['Blade Rush',T.active,''],['Shadow Blast',T.active,''],['Phantom Strike',T.active,''],
      ['Lethal Shadow',T.active,''],['Resolve to Kill',T.active,''],["Assassin's Mark",T.debuff,''],
      ['Chain Kill',T.active,''],['Shadow Step',T.active,''],['Path of the Assassin',T.passive,''],
      ['Brutality',T.buff,''],["Assassin's Focus",T.passive,''],["Assassin's Evasion",T.passive,''],
      ['Light Armor Mastery',T.passive,''],['Dagger Mastery',T.passive,''],["Assassin's Harmony",T.buff,''],
    ]),
    vanguardRider: A([
      ['Lance Charge',T.active,''],['Mounted Thrust',T.active,''],['Trample',T.active,'AoE'],
      ['Battle Rush',T.active,''],['Mounted Whirlwind',T.active,'AoE'],['Devastating Charge',T.active,''],
      ['War Banner',T.active,''],['Beast Roar',T.active,''],['Thunder Crash',T.active,''],
      ['Mounted Slam',T.active,''],["Rider's Mastery",T.passive,''],['Lance Mastery',T.passive,''],
      ['Heavy Armor Mastery',T.passive,''],['Mounted Combat',T.passive,''],['BP Mastery',T.passive,''],
      ['Vanguard Spirit',T.passive,''],['Body of the Vanguard',T.passive,''],["Vanguard's Harmony",T.buff,''],
      ['Battle Mount',T.toggle,''],["Rider's Will",T.buff,''],
    ]),
    samurai: A([
      ['Iaijutsu',T.active,''],['Crescent Slash',T.active,''],['Whirlwind Cut',T.active,'AoE'],
      ['Katana Mastery',T.passive,''],['Piercing Strike',T.active,''],['Focused Strike',T.active,''],
      ['Wind Blade',T.active,''],['Sakura Storm',T.active,'AoE'],['Bushido Stance',T.toggle,''],
      ['Counter Slash',T.active,''],['Rising Dragon',T.active,''],['Final Cut',T.active,''],
      ['Samurai Spirit',T.passive,''],['Way of the Blade',T.passive,''],['Body of the Samurai',T.passive,''],
      ['Honor Code',T.buff,''],["Samurai's Harmony",T.buff,''],['Katana Focus',T.passive,''],
      ['Light Armor Mastery',T.passive,''],['Transcendent Iaijutsu',T.active,'Transcendent'],
    ]),
    stormBlaster: A([
      ['Quick Shot',T.active,''],['Burst Fire',T.active,''],['Snipe',T.active,''],['Rapid Fire',T.active,''],
      ['Piercing Shot',T.active,''],['Explosive Shot',T.active,'AoE'],['Chain Shot',T.active,''],
      ['Storm Shot',T.active,''],['Wind Barrage',T.active,'AoE'],['Aimed Shot',T.active,''],
      ['Evasive Shot',T.active,''],['Gun Mastery',T.passive,''],['Light Armor Mastery',T.passive,''],
      ["Sylph's Grace",T.passive,''],['Wind Walker',T.passive,''],['Storm Blaster Spirit',T.passive,''],
      ['Body of the Storm Blaster',T.passive,''],['Storm Blaster Harmony',T.buff,''],
      ['Transcendent Storm Shot',T.active,'Transcendent'],
    ]),
    shinemaker: A([
      ['Light Burst',T.active,''],['Radiant Strike',T.active,''],['Prismatic Ray',T.active,''],
      ['Shining Nova',T.active,'AoE'],['Crystal Arrow',T.active,''],['Luminous Wave',T.active,'AoE'],
      ['Star Fall',T.active,''],['Shining Barrier',T.buff,''],['Light of Creation',T.buff,''],
      ['Brilliant Aura',T.buff,''],['Purifying Light',T.active,''],
      ['ShineMaker Spirit',T.passive,''],['Body of the ShineMaker',T.passive,''],["ShineMaker's Harmony",T.buff,''],
    ]),
    divineTemplar: A([
      ['Holy Strike',T.active,''],['Shield of Light',T.active,''],['Divine Charge',T.active,''],
      ['Lord Knight',T.active,'Echo'],['Sacred Aegis',T.active,''],['Celestial Punishment',T.active,''],
      ['Holy Chain',T.active,''],['Divine Shield',T.active,''],['Ultimate Divine Defense',T.active,''],
      ['Divine Templar Spirit',T.passive,''],['Body of Divine Templar',T.passive,''],
      ['Holy Shield Mastery',T.passive,''],['Heavy Armor Mastery',T.passive,''],
      ['Divine Templar Harmony',T.buff,''],["Lord Knight's Aura",T.buff,''],
    ]),
    bloodRose: A([
      ['Thorn Whip',T.active,''],['Rose Tempest',T.active,'AoE'],['Blood Drain',T.active,''],
      ['Crimson Spike',T.active,''],['Vine Bind',T.active,'CC'],['Bloom of Destruction',T.active,''],
      ['Blood Rose Spirit',T.passive,''],['Body of the Blood Rose',T.passive,''],['Thorn Armor',T.passive,''],
      ['Blood Rose Harmony',T.buff,''],["Rose's Blessing",T.buff,''],
    ]),
    elementWeaver: A([
      ['Elemental Blast',T.active,''],['Fire Weave',T.active,''],['Ice Weave',T.active,''],
      ['Wind Weave',T.active,''],['Elemental Convergence',T.active,'AoE'],['Ultimate Dispel',T.active,''],
      ['Elemental Overload',T.active,''],['Element Weaver Spirit',T.passive,''],
      ['Body of Element Weaver',T.passive,''],['Elemental Mastery',T.passive,''],
      ['Robe Mastery',T.passive,''],['Element Weaver Harmony',T.buff,''],
    ]),
  };

  function uniq(arr) { return [...new Set(arr.filter(Boolean))]; }

  function installClassSkills(canonical, ids) {
    const aliases = CLASS_ALIASES[canonical] || [canonical];
    const merged = uniq(ids);

    CLASS_SKILLS[canonical] = uniq([...(CLASS_SKILLS[canonical]||[]), ...merged]);
    if (!SKILL_TREE[canonical]) {
      SKILL_TREE[canonical] = merged.map((id, i) => ({ id, tier: Math.floor(i/5), x: i%5, y: Math.floor(i/5) }));
    }

    aliases.forEach(classId => {
      CLASS_SKILLS[classId] = uniq([...(CLASS_SKILLS[classId]||[]), ...merged]);
      if (!SKILL_TREE[classId]) SKILL_TREE[classId] = SKILL_TREE[canonical];
      if (CLASSES[classId]) {
        CLASSES[classId].skillTree = CLASSES[classId].skillTree || canonical;
        CLASSES[classId].essence547 = true;
      }
    });
  }

  Object.entries(DATA).forEach(([canonical, ids]) => installClassSkills(canonical, ids));

  E.CLASS_NAME_TO_ID_ECHO = {
    ...(E.CLASS_NAME_TO_ID_ECHO||{}),
    'Element Weaver':'elementWeaverS1', 'Elemental Weaver':'elementWeaverS1',
    'Divine Templar':'divineTemplarS1', 'Divine Knight':'divineTemplarS1',
    'Storm Blaster':'stormBlaster', 'Vanguard Rider':'vanguardRider',
    'Blood Rose':'bloodRoseS1', 'Samurai':'samurai',
    'Assassin':'assassinBase', 'Warg':'wargBase', 'Death Knight':'deathKnight',
  };

  E.__ESSENCE_547_SKILL_PACK__ = {
    installed: true, classes: Object.keys(DATA).length,
    skills: Object.keys(SKILL_DEFS).length,
    generatedAt: 'Echo of Elements 547',
  };
  console.info('[Echo Skills] Essence 547 instalado:', E.__ESSENCE_547_SKILL_PACK__);

})(typeof window !== 'undefined' ? window : globalThis);

