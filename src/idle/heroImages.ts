// Map the art module's path keys to the actual URLs where the
// images are served from public/img/. In dev these are served
// directly; in production the singlefile plugin doesn't inline
// public/ assets, but they'll be available at the same paths.
// For a true single-file build we'd need to move them into src/
// and import them — but the public/ approach works for any
// server that serves the dist folder.

export const HERO_IMAGES: Record<string, string> = {
  "/img/human_fighter.png": "/img/human_fighter.png",
  "/img/human_mage.png": "/img/human_mage.png",
  "/img/human_mageb.png": "/img/human_mageb.png",
  "/img/elf_fighter.png": "/img/elf_fighter.png",
  "/img/elf_mage.png": "/img/elf_mage.png",
  "/img/darkelf_fighter.png": "/img/darkelf_fighter.png",
  "/img/darkelf_mage.png": "/img/darkelf_mage.png",
  "/img/orc_fighter.png": "/img/orc_fighter.png",
  "/img/orc_mage.png": "/img/orc_mage.png",
  "/img/dwarf_artisan.png": "/img/dwarf_artisan.png",
  "/img/kamael_soulbreaker.png": "/img/kamael_soulbreaker.png",
  "/img/mon_goblin.png": "/img/mon_goblin.png",
  "/img/mon_dragon.png": "/img/mon_dragon.png",
  "/img/mon_skeleton.png": "/img/mon_skeleton.png",
  "/img/mon_alphawolf.png": "/img/mon_alphawolf.png",
  "/img/mon_armoredgoblin.png": "/img/mon_armoredgoblin.png",
  "/img/mon_cerberus.png": "/img/mon_cerberus.png",
  "/img/mon_crimsombabydragon.png": "/img/mon_crimsombabydragon.png",
  "/img/mon_darkmage.png": "/img/mon_darkmage.png",
  "/img/mon_deathknight.png": "/img/mon_deathknight.png",
  "/img/mon_deathwizard.png": "/img/mon_deathwizard.png",
  "/img/mon_direwolf.png": "/img/mon_direwolf.png",
  "/img/mon_dragonknight.png": "/img/mon_dragonknight.png",
  "/img/mon_emereldadragon.png": "/img/mon_emereldadragon.png",
  "/img/mon_frostknight.png": "/img/mon_frostknight.png",
  "/img/mon_goblinmage.png": "/img/mon_goblinmage.png",
  "/img/mon_goblinthief.png": "/img/mon_goblinthief.png",
  "/img/mon_knight.png": "/img/mon_knight.png",
  "/img/mon_kobold.png": "/img/mon_kobold.png",
  "/img/mon_koboldleader.png": "/img/mon_koboldleader.png",
  "/img/mon_mage.png": "/img/mon_mage.png",
  "/img/mon_orc.png": "/img/mon_orc.png",
  "/img/mon_scout.png": "/img/mon_scout.png",
  "/img/mon_spider.png": "/img/mon_spider.png",
  "/img/mon_voidcreature.png": "/img/mon_voidcreature.png",
  "/img/devilbone.png": "/img/devilbone.png",
  "/img/map.png": "/img/map.png",
};

// Expose to the vanilla JS art module running inside the shadow DOM
(window as any).__HERO_IMGS = HERO_IMAGES;
