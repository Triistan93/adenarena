// Activity atlases use landscapes that fit their profession, never the expedition atlas.
const SCENES = Object.freeze({
  fishing: {
    background: '/img/Maps/talkingIsland.png',
    points: [[15, 63], [33, 48], [51, 68], [68, 46], [82, 62], [48, 34]],
    zones: {
      zone_talking_island: '/img/Maps/talkingIsland.png',
      zone_gludin: '/img/Maps/zaken.jpg',
      zone_elven_village: '/img/Maps/elvenForest.png',
      zone_dion: '/img/Maps/emeraldgrove.jpg',
      zone_giran: '/img/Maps/talkingIsland.png',
      zone_innadril: '/img/Maps/emeraldgrove.jpg'
    }
  },
  hunting: {
    background: '/img/Maps/howlingmoor.jpg',
    points: [[21, 30], [41, 41], [62, 34], [76, 53], [35, 68], [68, 72]],
    zones: {
      zone_talking_forest: '/img/Maps/elvenForest.png',
      zone_gludio_plains: '/img/Maps/howlingmoor.jpg',
      zone_dion_hills: '/img/Maps/emeraldgrove.jpg',
      zone_giran_wilderness: '/img/Maps/emeraldgrove.jpg',
      zone_oren_snowlands: '/img/Maps/wolfMountain.jpg',
      zone_goddard_peaks: '/img/Maps/forgeofgods.jpg'
    }
  },
  gathering: {
    background: '/img/Maps/emeraldgrove.jpg',
    points: [[25, 35], [43, 59], [64, 34], [77, 57], [49, 28], [30, 71]],
    zones: {
      zone_gludio_fields: '/img/Maps/giraoutskirts.jpg',
      zone_dion_marsh: '/img/Maps/swampofscreams.jpg',
      zone_giran_hills: '/img/Maps/emeraldgrove.jpg',
      zone_oren_woods: '/img/Maps/wolfMountain.jpg',
      zone_aden_plateau: '/img/Maps/valleyofsaints.jpg',
      zone_goddard_valley: '/img/Maps/forgeofgods.jpg'
    }
  },
  mining: {
    background: '/img/Maps/dwarvenMine.png',
    points: [[24, 56], [42, 34], [59, 53], [75, 37], [37, 72], [65, 72]],
    zones: {
      zone_abandoned_coal: '/img/Maps/dwarvenMine.png',
      zone_mithril_mines: '/img/Maps/dwarvenMine.png',
      zone_plains_quarry: '/img/Maps/orcenRuins.png',
      zone_giran_deep_vein: '/img/Maps/riftofthevoid.jpg',
      zone_iron_stronghold: '/img/Maps/wolfMountain.jpg',
      zone_forge_of_gods: '/img/Maps/forgeofgods.jpg'
    }
  }
});

export function getLifeActivityScene(activityId, zoneId) {
  const activity = SCENES[activityId];
  if (!activity) return null;
  return {
    background: activity.zones[zoneId] || activity.background,
    points: activity.points
  };
}

export function getLifeActivityBaseScene(activityId) {
  const activity = SCENES[activityId];
  return activity ? { background: activity.background, points: activity.points } : null;
}
