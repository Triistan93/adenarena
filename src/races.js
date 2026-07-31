// data/races.js
export const RACES = {
  human: {
    id: "human",
    name: "Human",
    startZone: "talkingIsland",
    stats: { atk: 5, def: 0, eva: 0, matk: 5, mdef: 0 }
  },
  elf: {
    id: "elf",
    name: "Elf",
    startZone: "elvenForest",
    stats: { atk: 0, def: -5, eva: 12, matk: 8, mdef: 5 }
  },
  darkElf: {
    id: "darkElf",
    name: "Dark Elf",
    startZone: "darkForest",
    stats: { atk: 8, def: -5, eva: 8, matk: 12, mdef: 5 }
  },
  orc: {
    id: "orc",
    name: "Orc",
    startZone: "orcVillage",
    stats: { atk: 15, def: 10, eva: -8, matk: -5, mdef: -5 }
  },
  dwarf: {
    id: "dwarf",
    name: "Dwarf",
    startZone: "dwarvenMine",
    stats: { atk: 5, def: 15, eva: -5, matk: 0, mdef: 10, lootBonus: 0.20 }
  },
  kamael: {
    id: "kamael",
    name: "Kamael",
    startZone: "kamaelLair",
    stats: { atk: 12, def: 0, eva: 10, matk: 5, mdef: 0 }
  },
  sylph: {
    id: "sylph",
    name: "Sylph",
    startZone: "talkingIsland",
    stats: { atk: 10, def: -5, eva: 15, matk: 8, mdef: 5 }
  },
  highElf: {
    id: "highElf",
    name: "High Elf",
    startZone: "elvenForest",
    stats: { atk: 0, def: 8, eva: 5, matk: 15, mdef: 12 }
  },
  ertheia: {
    id: "ertheia",
    name: "Ertheia",
    startZone: "talkingIsland",
    stats: { atk: 10, def: 5, eva: 10, matk: 10, mdef: 5 }
  }
};

export default RACES;
