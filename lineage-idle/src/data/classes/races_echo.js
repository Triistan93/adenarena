/**
 * races_echo.js ÔÇö Atributos e b├┤nus das ra├ºas no sistema Echo of Elements (L2 Essence 547).
 */

export const RACES_ECHO = {
  human:    { name: 'Human',     desc: 'Vers├íteis, equilibrados em combate e magia.',       stats: { atk: 0,  def: 0,  eva: 0,  matk: 0,  mdef: 0  }, startZone: 'talkingIsland' },
  elf:      { name: 'Elf',       desc: 'Graciosos, alta esquiva e velocidade de ataque.',    stats: { atk: 0,  def:-2,  eva: 8,  matk: 0,  mdef: 0  }, startZone: 'elvenForest' },
  darkelf:  { name: 'Dark Elf',  desc: 'Sombrios, dano cr├¡tico e magia negra devastadora.', stats: { atk: 2,  def:-2,  eva: 4,  matk: 6,  mdef: 2  }, startZone: 'darkForest' },
  orc:      { name: 'Orc',       desc: 'Resistentes, for├ºa bruta e HP elevado.',             stats: { atk: 4,  def: 6,  eva:-4,  matk:-2,  mdef:-2 }, startZone: 'orcVillage' },
  dwarf:    { name: 'Dwarf',     desc: 'Mestres artes├úos com b├┤nus de loot e craft.',        stats: { atk: 0,  def: 4,  eva:-2,  matk: 0,  mdef: 0, lootBonus: 0.15 }, startZone: 'dwarvenMine' },
  kamael:   { name: 'Kamael',    desc: '├ügeis e mortais, especialistas em alma e espada.',   stats: { atk: 6,  def:-2,  eva: 6,  matk: 0,  mdef: 0  }, startZone: 'kamaelLair' },
  sylph:    { name: 'Sylph',     desc: 'Atiradores elementais do vento com armas de fogo.', stats: { atk: 4,  def:-2,  eva:12,  matk: 2,  mdef: 0  }, startZone: 'talkingIsland' },
  highelf:  { name: 'High Elf',  desc: 'Elfos supremos com magia sagrada e defesa divina.', stats: { atk: 0,  def: 2,  eva: 4,  matk: 8,  mdef: 4  }, startZone: 'elvenForest' },
  ertheia:  { name: 'Ertheia',   desc: 'Guerreiros do vento com alto potencial m├ígico.',    stats: { atk: 2,  def: 0,  eva:10,  matk: 4,  mdef: 0  }, startZone: 'talkingIsland' }
};