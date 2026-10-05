// Existing Idle character and monster artwork reused by the isolated 3D prototype.
// Keep the mapping explicit: unknown identities must not inherit unrelated art.
const HERO_PORTRAITS = Object.freeze({
  "human:warrior": "/img/m_human_warrior.webp",
  "elf:archer": "/img/m_elf_silver_ranger.webp",
  "darkelf:mystic": "/img/m_darkelf_dark_elf_mage.webp",
  "darkelf:sorcerer": "/img/m_darkelf_dark_elf_mage.webp",
});

const ENEMY_PORTRAITS = Object.freeze({
  goblin: "/img/bosses/goblinKing.webp",
  spider: "/img/bosses/queen-ant.webp",
  skeleton: "/img/bosses/deathKing.webp",
  orc: "/img/bosses/orcenOverlord.webp",
  knight: "/img/bosses/gludioCommander.webp",
  elemental: "/img/bosses/vulcanLord.webp",
  wraith: "/img/bosses/beleth.webp",
  troll: "/img/bosses/dwarvenEarthLord.webp",
});

export function getPrototypeHeroPortrait(raceId, classId) {
  return HERO_PORTRAITS[`${String(raceId || "").toLowerCase()}:${String(classId || "").toLowerCase()}`] || null;
}

export function getPrototypeEnemyPortrait(enemyId) {
  return ENEMY_PORTRAITS[String(enemyId || "").toLowerCase()] || null;
}

export function getPrototypeAnimation(raceId, classId) {
  const name = { 'human:warrior': 'warrior', 'elf:archer': 'ranger', 'darkelf:sorcerer': 'mage' }[`${raceId}:${classId}`];
  return name ? `/action-prototype/animations/${name}.webp` : null;
}

