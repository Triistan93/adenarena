const RAID_SCENES = Object.freeze({
  queen_ant: { background: '/img/Maps/queenant.jpg', portrait: '/img/bosses/queen-ant.webp', location: 'Ermos de Gludio' },
  core: { background: '/img/Maps/blackcitaddel.jpg', portrait: '/img/bosses/core.webp', location: 'Torre Cruma' },
  orfen: { background: '/img/Maps/swampofscreams.jpg', portrait: '/img/bosses/orfen.webp', location: 'Mar de Esporos' },
  zaken: { background: '/img/Maps/zaken.jpg', portrait: '/img/bosses/zaken.webp', location: 'Ilha do Diabo' },
  baium: { background: '/img/Maps/baium.jpg', portrait: '/img/bosses/baium.webp', location: 'Torre da Insolência' },
  frintezza: { background: '/img/Maps/frintezza.jpg', portrait: '/img/bosses/frintezza.webp', location: 'Sepulcro Imperial' },
  antharas: { background: '/img/Maps/antharaslair.jpg', portrait: '/img/bosses/antharas.webp', location: 'Covil de Antharas' },
  valakas: { background: '/img/Maps/forgeofgods.jpg', portrait: '/img/bosses/valakas.webp', location: 'Forja dos Deuses' },
  lindvior: { background: '/img/Maps/dragonvalley.jpg', portrait: '/img/bosses/lindvior.webp', location: 'Vale do Dragão' },
  // Original portrait generated for Aden Arena; exported as alpha WebP for the lair overlay.
  barakiel: { background: '/img/Maps/valleyofsaints.jpg', portrait: '/img/mon_barakiel.webp', location: 'Vale dos Santos' }
});

export function getRaidScene(bossId) {
  const scene = RAID_SCENES[bossId];
  return scene ? { ...scene } : null;
}
