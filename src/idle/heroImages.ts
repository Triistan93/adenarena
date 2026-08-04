// Map hero, monster, and zone background assets to their categorized paths in public/img/

export const HERO_IMAGES: Record<string, string> = {
  // Hero Races
  "/img/human_fighter.png": "/img/Races/Human/Fighter/human_fighter.png",
  "/img/Races/Human/Fighter/human_fighter.png": "/img/Races/Human/Fighter/human_fighter.png",
  "/img/human_mage.png": "/img/Races/Human/Mage/human_mage.png",
  "/img/Races/Human/Mage/human_mage.png": "/img/Races/Human/Mage/human_mage.png",
  "/img/human_mageb.png": "/img/Races/Human/Mage/human_mageb.png",
  "/img/Races/Human/Mage/human_mageb.png": "/img/Races/Human/Mage/human_mageb.png",

  "/img/elf_fighter.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/Races/Elf/Fighter/elf_fighter.png": "/img/Races/Elf/Fighter/elf_fighter.png",
  "/img/elf_mage.png": "/img/Races/Elf/Mage/elf_mage.png",
  "/img/Races/Elf/Mage/elf_mage.png": "/img/Races/Elf/Mage/elf_mage.png",

  "/img/darkelf_fighter.png": "/img/Races/DarkElf/Fighter/darkelf_fighter.png",
  "/img/Races/DarkElf/Fighter/darkelf_fighter.png": "/img/Races/DarkElf/Fighter/darkelf_fighter.png",
  "/img/darkelf_mage.png": "/img/Races/DarkElf/Mage/darkelf_mage.png",
  "/img/Races/DarkElf/Mage/darkelf_mage.png": "/img/Races/DarkElf/Mage/darkelf_mage.png",

  "/img/orc_fighter.png": "/img/Races/Orcs/Fighter/orc_fighter.png",
  "/img/Races/Orcs/Fighter/orc_fighter.png": "/img/Races/Orcs/Fighter/orc_fighter.png",
  "/img/orc_mage.png": "/img/Races/Orcs/Mage/orc_mage.png",
  "/img/Races/Orcs/Mage/orc_mage.png": "/img/Races/Orcs/Mage/orc_mage.png",

  "/img/dwarf_artisan.png": "/img/Races/Dwarfs/Fighter/dwarf_artisan.png",
  "/img/Races/Dwarfs/Fighter/dwarf_artisan.png": "/img/Races/Dwarfs/Fighter/dwarf_artisan.png",

  "/img/kamael_soulbreaker.png": "/img/Races/Kamael/Fighter/kamael_soulbreaker.png",
  "/img/Races/Kamael/Fighter/kamael_soulbreaker.png": "/img/Races/Kamael/Fighter/kamael_soulbreaker.png",

  // Monsters per Zone
  "/img/mon_goblin.png": "/img/Monsters/TalkingIsland/mon_goblin.png",
  "/img/mon_goblinthief.png": "/img/Monsters/TalkingIsland/mon_goblinthief.png",
  "/img/mon_armoredgoblin.png": "/img/Monsters/TalkingIsland/mon_armoredgoblin.png",
  "/img/mon_goblinmage.png": "/img/Monsters/TalkingIsland/mon_goblinmage.png",

  "/img/mon_direwolf.png": "/img/Monsters/ElvenForest/mon_direwolf.png",
  "/img/mon_spider.png": "/img/Monsters/DarkForest/mon_spider.png",
  "/img/mon_orc.png": "/img/Monsters/OrcVillage/mon_orc.png",
  "/img/mon_kobold.png": "/img/Monsters/DwarvenMine/mon_kobold.png",
  "/img/mon_koboldleader.png": "/img/Monsters/DwarvenMine/mon_koboldleader.png",
  "/img/mon_scout.png": "/img/Monsters/KamaelLair/mon_scout.png",
  "/img/mon_crimsombabydragon.png": "/img/Monsters/HowlingMoor/mon_crimsombabydragon.png",
  "/img/mon_alphawolf.png": "/img/Monsters/HowlingMoor/mon_alphawolf.png",
  "/img/mon_skeleton.png": "/img/Monsters/GiranOutskirts/mon_skeleton.png",
  "/img/mon_darkmage.png": "/img/Monsters/forsakenCrypt/mon_darkmage.png",
  "/img/devilbone.png": "/img/Monsters/forsakenCrypt/devilbone.png",
  "/img/mon_deathknight.png": "/img/Monsters/blackCitadel/mon_deathknight.png",
  "/img/mon_deathwizard.png": "/img/Monsters/blackCitadel/mon_deathwizard.png",
  "/img/mon_knight.png": "/img/Monsters/gludioCastle/mon_knight.png",
  "/img/mon_voidcreature.png": "/img/Monsters/riftOfTheVoid/mon_voidcreature.png",
  "/img/mon_emereldadragon.png": "/img/Monsters/emeraldGrove/mon_emereldadragon.png",
  "/img/mon_cerberus.png": "/img/Monsters/underworldGate/mon_cerberus.png",
  "/img/mon_mage.png": "/img/Monsters/adenCity/mon_mage.png",
  "/img/mon_dragon.png": "/img/Monsters/dragonValley/mon_dragon.png",
  "/img/mon_dragonknight.png": "/img/Monsters/dragonValley/mon_dragonknight.png",
  "/img/mon_frostknight.png": "/img/Monsters/dragonValley/mon_frostknight.png",

  // Zones Backgrounds
  "/img/talkingIsland.png": "/img/Monsters/TalkingIsland/talkingIsland.png",
  "/img/orcVillage.png": "/img/Monsters/OrcVillage/orcVillage.png",
  "/img/dwarvenMine.png": "/img/Monsters/DwarvenMine/dwarvenMine.png",
  "/img/kamaelLair.png": "/img/Monsters/KamaelLair/kamaelLair.png",
  "/img/howlingMoor.png": "/img/Monsters/HowlingMoor/howlingMoor.png",
  "/img/giranOutskirts.png": "/img/Monsters/GiranOutskirts/giranOutskirts.png",
  "/img/orcenRuins.png": "/img/Monsters/orcenRuins/orcenRuins.png"
};

// Expose to the vanilla JS art module running inside the shadow DOM
(window as any).__HERO_IMGS = HERO_IMAGES;
