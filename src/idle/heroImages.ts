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
  "/img/elf_fighter.png": "/img/elf_fighter.png",
  "/img/darkelf_mage.png": "/img/darkelf_mage.png",
  "/img/orc_fighter.png": "/img/orc_fighter.png",
  "/img/dwarf_artisan.png": "/img/dwarf_artisan.png",
  "/img/kamael_soulbreaker.png": "/img/kamael_soulbreaker.png",
  "/img/mon_goblin.png": "/img/mon_goblin.png",
  "/img/mon_dragon.png": "/img/mon_dragon.png",
  "/img/mon_skeleton.png": "/img/mon_skeleton.png",
};

// Expose to the vanilla JS art module running inside the shadow DOM
(window as any).__HERO_IMGS = HERO_IMAGES;
