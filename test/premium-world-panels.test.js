import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { FISHING_ZONES } from '../lineage-idle/src/data/fishing.js';
import { HUNTING_ZONES } from '../lineage-idle/src/data/hunting.js';
import { GATHERING_ZONES } from '../lineage-idle/src/data/gathering.js';
import { MINING_ZONES } from '../lineage-idle/src/data/mining.js';
import { getLifeActivityBaseScene, getLifeActivityScene } from '../lineage-idle/src/ui/LifeActivityAtlasScenes.js';
import { getRaidScene } from '../lineage-idle/src/ui/RaidSceneRegistry.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { MON_IMG, monsterSVG } from '../lineage-idle/art.js';
import { renderTowerJourney } from '../lineage-idle/src/ui/TowerPresentation.js';
import { renderLifeActivityAtlas } from '../lineage-idle/src/ui/LifeActivityAtlas.js';
import { renderRaidsTab, renderColosseumTab } from '../lineage-idle/src/ui/GameUI.js';
import { InstanceService } from '../lineage-idle/src/services/InstanceService.js';
import { SOLO_INSTANCES } from '../lineage-idle/src/data/instances.js';
import { MONSTERS } from '../lineage-idle/src/data/monsters.js';
import { WorldBossService, WORLD_BOSS_CATALOG } from '../lineage-idle/src/services/WorldBossService.js';
import { challengeTowerFloor } from '../lineage-idle/src/services/TowerService.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetExists = (publicPath) => existsSync(path.join(repoRoot, 'public', publicPath.replace(/^\//, '')));
const fullBodyBossPortraits = new Map([
  ['tiron.webp', [640, 960, true]],
  ['glakias-dreadful.webp', [640, 640, true]],
  ['darion.webp', [640, 960, true]],
  ['demon_prince.webp', [640, 960, true]],
  ['cryptLord.webp', [640, 960, true]],
  ['beleth.webp', [640, 640, true]],
  ['deathKing.webp', [640, 640, true]],
  ['kamaloka_25.webp', [640, 640, true]],
  ['necro_martyr_boss.webp', [640, 640, true]],
  ['necro_patriot_boss.webp', [640, 640, true]],
  ['necro_pilgrim_boss.webp', [640, 640, true]],
  ['necro_worship_boss.webp', [640, 960, true]],
  ['necro_sacrifice_boss.webp', [640, 640, true]],
  ['kashaOrcOverlord.webp', [640, 640, true]],
  ['outpostFallenCaptain.webp', [640, 960, true]],
  ['reggiesys.webp', [640, 960, true]],
  ['deathTrent.webp', [640, 640, true]],
  ['tower_galaxia.webp', [640, 960, true]]
]);
const expectedBossPortraitDimensions = (publicPath) =>
  fullBodyBossPortraits.get(path.basename(publicPath)) || [640, 427, true];

test('life activity scenes are distinct from expeditions and match their activity', () => {
  const activities = [
    ['fishing', FISHING_ZONES, /talkingIsland|giranOutskirts|emeraldgrove/i],
    ['hunting', HUNTING_ZONES, /forest|moor|mountain|forge/i],
    ['gathering', GATHERING_ZONES, /emerald|swamp|valley|forge/i],
    ['mining', MINING_ZONES, /mine|rift|orc|mountain|forge/i]
  ];
  const backgrounds = new Set();

  for (const [activityId, zones, semanticPath] of activities) {
    const scene = getLifeActivityBaseScene(activityId);
    assert.ok(scene?.background, `${activityId} needs a dedicated scene`);
    assert.doesNotMatch(scene.background, /aden-expedition-map/i);
    assert.match(scene.background, semanticPath, `${activityId} should use a fitting world region`);
    assert.ok(assetExists(scene.background), `${scene.background} must exist in public assets`);
    backgrounds.add(scene.background);
    for (const zone of Object.values(zones)) {
      const zoneScene = getLifeActivityScene(activityId, zone.id);
      assert.ok(zoneScene?.background, `${activityId}/${zone.id} needs a regional scene`);
      assert.ok(assetExists(zoneScene.background), `${activityId}/${zone.id} map ${zoneScene.background} must exist`);
      assert.doesNotMatch(zoneScene.background, /aden-expedition-map/i);
    }
  }
  assert.equal(backgrounds.size, activities.length, 'each activity should have its own opening scene');

  const fishingView = renderLifeActivityAtlas({
    activityId: 'fishing', title: 'Pesca', subtitle: 'Lago', zones: Object.values(FISHING_ZONES),
    activeZoneId: 'zone_innadril', playerLevel: 100, activityLevel: 30,
    selectHandler: 'selectFishingZone', resourceLabel: 'Peixes', resourceNames: [],
    requirementLabel: 'Isca', requirementValue: 'Qualquer', cycleLabel: 'Ciclo', cycleValue: '6s'
  });
  assert.match(fishingView, /url\('\/img\/Maps\/emeraldgrove\.jpg'\)/);
  assert.doesNotMatch(fishingView, /aden-expedition-map\.webp/);
  assert.match(fishingView, /life-atlas-zone-picker/);
  assert.match(fishingView, /life-atlas-location/);
  assert.doesNotMatch(fishingView, /life-atlas-node/);
});

test('each raid has its own verified lair and portrait art', async () => {
  const scenePairs = new Set();
  const portraits = new Set();
  for (const [id, boss] of Object.entries(RAID_BOSSES)) {
    const scene = getRaidScene(id);
    assert.ok(scene, `${id} needs a scene`);
    assert.ok(assetExists(scene.background), `${id} background ${scene.background} must exist`);
    assert.ok(assetExists(scene.portrait), `${id} portrait ${scene.portrait} must exist`);
    assert.notEqual(scene.background, '/images/aden-expedition-map.webp');
    assert.ok(scene.location, `${id} scene should identify its actual lair`);
    scenePairs.add(`${scene.background}|${scene.portrait}`);
    portraits.add(scene.portrait);
  }
  assert.equal(scenePairs.size, Object.keys(RAID_BOSSES).length, 'raid art must not silently reuse another boss composition');
  assert.equal(portraits.size, Object.keys(RAID_BOSSES).length, 'each raid must have its own portrait');
  const barakielPath = path.join(repoRoot, 'public', 'img', 'mon_barakiel.webp');
  assert.ok(statSync(barakielPath).size < 300_000, 'new portrait stays within the compressed game-asset budget');
  const portraitMetadata = await sharp(barakielPath).metadata();
  assert.deepEqual([portraitMetadata.width, portraitMetadata.height, portraitMetadata.hasAlpha], [640, 960, true]);
});

test('every boss portrait registered for combat exists, keeps transparency, and stays within the asset budget', async () => {
  const portraitPaths = [...new Set(Object.values(MON_IMG).filter(assetPath => assetPath?.startsWith('/img/bosses/')))];
  assert.ok(portraitPaths.length > 0, 'combat registers boss portrait assets');

  for (const portraitPath of portraitPaths) {
    const assetPath = path.join(repoRoot, 'public', portraitPath.replace(/^\//, ''));
    assert.ok(existsSync(assetPath), `${portraitPath} exists`);
    assert.ok(statSync(assetPath).size < 300_000, `${portraitPath} stays within the compressed asset budget`);
    const metadata = await sharp(assetPath).metadata();
    assert.ok(metadata.hasAlpha, `${portraitPath} retains its transparent cutout`);
    assert.ok(metadata.width > 0 && metadata.height > 0, `${portraitPath} has valid image dimensions`);
  }
});

test('reframed boss portraits preserve the complete cutout inside a safe transparent margin', async () => {
  for (const [filename, expectedDimensions] of fullBodyBossPortraits) {
    const assetPath = path.join(repoRoot, 'public', 'img', 'bosses', filename);
    assert.ok(existsSync(assetPath), `${filename} exists`);
    assert.ok(statSync(assetPath).size < 300_000, `${filename} stays within the compressed asset budget`);
    assert.equal((await sharp(assetPath).metadata()).hasAlpha, true, `${filename} keeps real transparency`);
    const { data, info } = await sharp(assetPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.deepEqual([info.width, info.height, true], expectedDimensions, `${filename} has its intended full-figure canvas`);

    let left = info.width;
    let top = info.height;
    let right = -1;
    let bottom = -1;
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        if (data[(y * info.width + x) * info.channels + 3] > 32) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    }
    assert.ok(left >= 16 && top >= 16, `${filename} has transparent breathing room at the top and left`);
    assert.ok(info.width - 1 - right >= 16 && info.height - 1 - bottom >= 16, `${filename} has transparent breathing room at the right and bottom`);
  }
});

test('every configured raid boss uses its scene portrait during live combat', () => {
  for (const bossId of Object.keys(RAID_BOSSES)) {
    const scene = getRaidScene(bossId);
    assert.ok(scene?.portrait, `${bossId} has a configured raid scene`);
    assert.equal(MON_IMG[bossId], scene.portrait, `${bossId} live combat uses the raid portrait`);
    assert.ok(assetExists(scene.portrait), `${bossId} raid portrait exists`);
  }
});

test('scheduled world bosses render their dedicated canonical art through the live join flow', () => {
  const originalGetStatus = WorldBossService.getStatus;
  try {
    for (const [bossId, bossDef] of Object.entries(WORLD_BOSS_CATALOG)) {
      WorldBossService.getStatus = () => ({ isActive: true, currentBoss: bossDef });
      const state = {};
      const result = WorldBossService.joinWorldBoss(state, { log() {}, renderStageMonster() {}, attackMonster() {}, save() {} });
      assert.equal(result.success, true);
      assert.equal(state.activeMonster.id, bossId);
      const art = MON_IMG[state.activeMonster.id];
      assert.ok(art?.startsWith('/img/bosses/'), `${bossId} resolves a premium boss portrait`);
      assert.ok(assetExists(art));
      assert.ok(monsterSVG(state.activeMonster.id, { crown: true }).includes(`<img src="${art}"`));
    }
  } finally {
    WorldBossService.getStatus = originalGetStatus;
  }
});

test('every named Tower of Insolence boss uses a dedicated portrait through the live challenge flow', async () => {
  const expectedArt = {
    10: '/img/bosses/tower_hallate.webp',
    20: '/img/bosses/tower_kernea.webp',
    30: '/img/bosses/tower_varan.webp',
    40: '/img/bosses/tower_kavatan.webp',
    50: '/img/bosses/baium.webp',
    60: '/img/bosses/tower_galaxia.webp',
    70: '/img/bosses/tower_shielhead.webp',
    80: '/img/bosses/tower_golkonda.webp',
    90: '/img/bosses/tower_verdelet.webp',
    100: '/img/bosses/tower_arcanjo.webp'
  };
  const ids = Object.keys(expectedArt).map((floor) => `tower_floor_${floor}`);
  const originalEntries = new Map(ids.map((id) => [id, MONSTERS[id]]));
  try {
    for (const [floorText, expected] of Object.entries(expectedArt)) {
      const floor = Number(floorText);
      const state = { level: 100, tower: { highestFloor: floor - 1 }, stats: { combatPower: 1e15 } };
      const result = challengeTowerFloor(state, { getCombatPower: () => 1e15, log() {} });
      assert.equal(result.success, true, `floor ${floor} starts`);
      const boss = state.activeMonster;
      const art = MON_IMG[boss.id];
      assert.equal(art, expected, `${boss.id} resolves the portrait for its named Tower boss`);
      assert.ok(assetExists(art), `${boss.id} portrait ${art} exists`);
      assert.ok(monsterSVG(boss.id, { crown: true }).includes(`<img src="${art}"`));
      if (floor !== 50) {
        const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
        assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
        assert.ok(statSync(path.join(repoRoot, 'public', art)).size < 300_000, `${boss.id} stays within the compressed art budget`);
      }
    }
  } finally {
    for (const id of ids) {
      const original = originalEntries.get(id);
      if (original) MONSTERS[id] = original;
      else delete MONSTERS[id];
    }
  }
});

test('Queen Ant raid and combat use the same premium boss cutout', async () => {
  const art = '/img/bosses/queen-ant.webp';
  assert.equal(MON_IMG.queenAnt, art);
  assert.equal(MON_IMG.queen_ant, art);
  assert.equal(getRaidScene('queen_ant')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
});

test('Core raid and combat use an exclusive ancient-machine portrait', async () => {
  const art = '/img/bosses/core.webp';
  assert.equal(MON_IMG.core, art);
  assert.equal(getRaidScene('core')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
});

test('Orfen raid and combat use an exclusive Sea of Spores boss cutout', async () => {
  const art = '/img/bosses/orfen.webp';
  assert.equal(MON_IMG.orfen, art);
  assert.equal(getRaidScene('orfen')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 427, true]);
});

test('Zaken raid and combat use an exclusive cursed-pirate portrait', async () => {
  const art = '/img/bosses/zaken.webp';
  assert.equal(MON_IMG.zaken, art);
  assert.equal(getRaidScene('zaken')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 427, true]);
});

test('Baium raid and combat use an exclusive colossal-emperor portrait', async () => {
  const art = '/img/bosses/baium.webp';
  assert.equal(MON_IMG.baium, art);
  assert.equal(getRaidScene('baium')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 960, true]);
  assert.ok(statSync(path.join(repoRoot, 'public', art)).size < 300_000, 'full-body portrait stays compressed for deployment');
});

test('Frintezza raid and combat use an exclusive Imperial Tomb portrait', async () => {
  const art = '/img/bosses/frintezza.webp';
  assert.equal(MON_IMG.frintezza, art);
  assert.equal(getRaidScene('frintezza')?.portrait, art);
  assert.ok(assetExists(art));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 960, true]);
  assert.ok(statSync(path.join(repoRoot, 'public', art)).size < 300_000, 'full-body portrait stays compressed for deployment');
});

test('Ferion instance stage renders its dedicated Celestial Tower portrait', async () => {
  const art = '/img/bosses/ferion.webp';
  const instance = SOLO_INSTANCES.celestial_tower_event;
  const boss = InstanceService.createInstanceBoss(instance, 1, false);
  assert.equal(boss.visualId, 'ferion');
  assert.equal(MON_IMG.ferion, art);
  assert.ok(assetExists(art));
  assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 427, true]);
});

test('Ferion Praetorian resolves its own art from the first live instance stage', async () => {
  const instance = SOLO_INSTANCES.celestial_tower_event;
  const stageIndex = instance.stages.findIndex(stage => stage.id === 'ferion_praetorian');
  const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
  const art = '/img/bosses/ferion_praetorian.webp';
  assert.equal(boss.visualId, 'ferion_praetorian');
  assert.equal(MON_IMG[boss.visualId], art);
  assert.ok(assetExists(art));
  assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 427, true]);
});

test('Beleth instance stage renders its dedicated Steel Citadel portrait', async () => {
  const art = '/img/bosses/beleth.webp';
  const instance = SOLO_INSTANCES.steel_citadel;
  const stageIndex = instance.stages.findIndex(stage => stage.id === 'beleth');
  const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
  assert.equal(boss.visualId, 'beleth');
  assert.equal(MON_IMG.beleth, art);
  assert.ok(assetExists(art));
  assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
  const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
});

test('Steel Citadel minibosses resolve dedicated art through the production instance stages', async () => {
  const instance = SOLO_INSTANCES.steel_citadel;
  for (const stageId of ['demon_prince', 'ranku', 'darion', 'epidos']) {
    const stageIndex = instance.stages.findIndex(stage => stage.id === stageId);
    const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
    const art = `/img/bosses/${stageId}.webp`;
    assert.equal(boss.visualId, stageId);
    assert.equal(MON_IMG[stageId], art);
    assert.ok(assetExists(art), `${stageId} has a compressed portrait`);
    assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
});

test('Frost Lord Castle sentinels resolve dedicated art through the production instance stages', async () => {
  const instance = SOLO_INSTANCES.frost_lords_castle;
  for (const stageId of ['reggiesys', 'tiron']) {
    const stageIndex = instance.stages.findIndex(stage => stage.id === stageId);
    const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
    const art = `/img/bosses/${stageId}.webp`;
    assert.equal(boss.visualId, stageId);
    assert.equal(MON_IMG[stageId], art);
    assert.ok(assetExists(art));
    assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
});

test('Pailaka journey bosses resolve dedicated art through the production instance stages', async () => {
  for (const [instanceId, stageId] of [
    ['pailaka_36', 'pailaka_fire_sprite_king'],
    ['pailaka_36', 'pailaka_ice_guardian'],
    ['pailaka_36', 'pailaka_gargoyle_lord'],
    ['pailaka_58', 'pailaka_infernal_sentinel'],
    ['pailaka_58', 'pailaka_corrupted_drake'],
    ['pailaka_58', 'pailaka_lesser_drake_lord']
  ]) {
    const instance = SOLO_INSTANCES[instanceId];
    const stageIndex = instance.stages.findIndex(stage => stage.id === stageId);
    const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
    const art = `/img/bosses/${stageId}.webp`;
    assert.equal(boss.visualId, stageId);
    assert.equal(MON_IMG[stageId], art);
    assert.ok(assetExists(art));
    assert.ok(monsterSVG(boss.visualId, { crown: true }).includes(`<img src="${art}"`));
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
});

test('Necropolis bosses no longer use the generic goblin art fallback', async () => {
  for (const bossId of [
    'necro_sacrifice_boss', 'necro_pilgrim_boss', 'necro_worship_boss', 'necro_patriot_boss',
    'necro_ascetic_boss', 'necro_martyr_boss', 'necro_apostle_boss', 'necro_disciple_boss'
  ]) {
    const art = `/img/bosses/${bossId}.webp`;
    assert.equal(MON_IMG[bossId], art);
    assert.ok(assetExists(art));
    assert.ok(monsterSVG(bossId, { crown: true }).includes(`<img src="${art}"`));
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
});

test('Kamaloka and Fafurion Nest guardians resolve their own production instance portraits', async () => {
  const encounters = [
    ['kamaloka_25', 0, 'kamaloka_25'],
    ['kamaloka_49', 0, 'kamaloka_49'],
    ['fafurion_nest', 0, 'guarding_stone']
  ];
  for (const [instanceId, stageIndex, visualId] of encounters) {
    const boss = InstanceService.createInstanceBoss(SOLO_INSTANCES[instanceId], stageIndex, false);
    const resolvedId = boss.visualId || boss.id;
    const art = `/img/bosses/${visualId}.webp`;
    assert.equal(resolvedId, visualId);
    assert.equal(MON_IMG[resolvedId], art);
    assert.ok(assetExists(art), `${visualId} has a dedicated compressed portrait`);
    assert.ok(monsterSVG(resolvedId, { crown: true }).includes(`<img src="${art}"`));
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
});

test('every registered solo-instance stage resolves a dedicated portrait through the production factory', async () => {
  let stageCount = 0;
  for (const instance of Object.values(SOLO_INSTANCES)) {
    for (const [stageIndex, stage] of (instance.stages || []).entries()) {
      stageCount++;
      const boss = InstanceService.createInstanceBoss(instance, stageIndex, false);
      const art = MON_IMG[boss.visualId || boss.id];
      assert.ok(art?.startsWith('/img/bosses/'), `${instance.id}/${stage.id} uses a boss-specific asset`);
      assert.ok(assetExists(art), `${instance.id}/${stage.id} portrait ${art} exists`);
      assert.ok(monsterSVG(boss.visualId || boss.id, { crown: true }).includes(`<img src="${art}"`));
      const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
      assert.equal(metadata.hasAlpha, true, `${art} preserves transparent compositing`);
    }
  }
  assert.ok(stageCount > 0, 'the registered instances expose stage bosses for audit');
});

test('every zone boss resolves a dedicated premium portrait instead of reused mob art', async () => {
  const bosses = Object.entries(MONSTERS).filter(([, monster]) => monster.boss);
  const portraits = bosses.map(([bossId]) => {
    const art = MON_IMG[bossId];
    assert.ok(art?.startsWith('/img/bosses/'), `${bossId} must use a premium boss asset`);
    assert.ok(assetExists(art), `${bossId} portrait ${art} must exist`);
    return art;
  });
  assert.equal(new Set(portraits).size, bosses.length, 'distinct boss records should not share portraits');
  for (const art of portraits) {
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art), `${art} uses the compressed alpha format`);
  }
});

test('Antharas raid art and live combat art use the same colossal left-facing cutout', async () => {
  const scene = getRaidScene('antharas');
  assert.equal(scene.portrait, '/img/bosses/antharas.webp');
  assert.equal(MON_IMG.antharas, scene.portrait);
  assert.equal(MON_IMG.antharasBehemoth, '/img/bosses/antharasBehemoth.webp', 'the lair guardian has distinct behemoth art');
  assert.ok(assetExists(MON_IMG.antharasBehemoth));
  assert.ok(assetExists(scene.portrait));
  const metadata = await sharp(path.join(repoRoot, 'public', scene.portrait)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(scene.portrait));
});

test('Valakas has a distinct matched-frame raid and live combat cutout', async () => {
  const scene = getRaidScene('valakas');
  assert.equal(scene.portrait, '/img/bosses/valakas.webp');
  assert.equal(MON_IMG.valakas, scene.portrait);
  assert.notEqual(scene.portrait, getRaidScene('antharas').portrait);
  assert.ok(assetExists(scene.portrait));
  const metadata = await sharp(path.join(repoRoot, 'public', scene.portrait)).metadata();
  assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], [640, 427, true]);
});

test('Lindvior and Fafurion use their own storm and aquatic boss cutouts', async () => {
  const lindviorScene = getRaidScene('lindvior');
  assert.equal(lindviorScene.portrait, '/img/bosses/lindvior.webp');
  assert.equal(MON_IMG.lindvior, lindviorScene.portrait, 'Lindvior combat art must match its raid portrait');
  assert.ok(assetExists(lindviorScene.portrait));

  const fafurionArt = '/img/bosses/fafurion.webp';
  assert.equal(MON_IMG.fafurion, fafurionArt, 'the Fafurion instance must use its aquatic cutout');
  assert.equal(MON_IMG.fafurionWaterSovereign, fafurionArt, 'Fafurion title alias must resolve to the same creature art');
  assert.ok(assetExists(fafurionArt));

  for (const asset of [lindviorScene.portrait, fafurionArt]) {
    const metadata = await sharp(path.join(repoRoot, 'public', asset)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(asset));
  }
  assert.equal(new Set(['antharas', 'valakas', 'lindvior'].map(id => getRaidScene(id).portrait)).size, 3);
  assert.ok(![MON_IMG.antharas, MON_IMG.valakas, MON_IMG.lindvior].includes(fafurionArt));
});

test('Glakias normal and hard-mode instance forms render their own Frost Lord art', async () => {
  const normalArt = '/img/bosses/glakias.webp';
  const hardArt = '/img/bosses/glakias-dreadful.webp';
  const instance = SOLO_INSTANCES.frost_lords_castle;
  assert.ok(instance, 'Ice Castle instance is registered');
  const normalBoss = InstanceService.createInstanceBoss(instance, 2, false);
  const hardBoss = InstanceService.createInstanceBoss(instance, 2, true);
  assert.equal(normalBoss.id, 'frost_lords_castle_glakias');
  assert.equal(hardBoss.id, 'frost_lords_castle_glakias_dreadful');
  assert.equal(normalBoss.visualId, 'glakias');
  assert.equal(hardBoss.visualId, 'glakiasDreadful');
  assert.equal(MON_IMG.glakias, normalArt);
  assert.equal(MON_IMG.glakiasDreadful, hardArt);
  assert.ok(assetExists(normalArt));
  assert.ok(assetExists(hardArt));
  for (const [boss, art] of [[normalBoss, normalArt], [hardBoss, hardArt]]) {
    const markup = monsterSVG(boss.visualId, { crown: true });
    assert.ok(markup.includes(`<img src="${art}"`), `${boss.visualId} uses its mapped artwork`);
    assert.doesNotMatch(markup, /<img src="\/img\/mon_goblin\.jpg"/);
    const metadata = await sharp(path.join(repoRoot, 'public', art)).metadata();
    assert.deepEqual([metadata.width, metadata.height, metadata.hasAlpha], expectedBossPortraitDimensions(art));
  }
  assert.notEqual(normalArt, hardArt, 'hard mode has a more aggressive, ice-aura portrait');
});

test('tower progress is presented as ten chapters, not one hundred floor buttons', () => {
  const markup = renderTowerJourney(27, floor => ({ name: `Floor ${floor}`, isBoss: floor % 10 === 0 }));
  assert.equal((markup.match(/class="tower-chapter-card/g) || []).length, 10);
  assert.match(markup, /1–10/);
  assert.match(markup, /21–30/);
  assert.match(markup, /data-chapter="3"/);
  assert.match(markup, /70%/);
  assert.match(markup, /Floor 30/);
  assert.doesNotMatch(markup, /button/i, 'chapter overview is informative, with one real next-floor action elsewhere');
});

test('raid cards render each boss over its lair backdrop and monster portrait', () => {
  const container = { innerHTML: '' };
  renderRaidsTab(container, {
    level: 120, stats: { combatPower: Number.MAX_SAFE_INTEGER }, dailyRaidTickets: 3,
    isRaidActive: false, activeRaidId: null
  });
  assert.match(container.innerHTML, /class="raid-lair-grid"/);
  for (const id of Object.keys(RAID_BOSSES)) {
    const scene = getRaidScene(id);
    assert.ok(container.innerHTML.includes(scene.background), `${id} background reaches the renderer`);
    assert.ok(container.innerHTML.includes(scene.portrait), `${id} portrait reaches the renderer`);
  }
});

test('Colosseum presentation uses its arena scene rather than expedition cartography', () => {
  const container = { innerHTML: '' };
  renderColosseumTab(container, { colosseum: { badges: 0 } });
  assert.match(container.innerHTML, /class="colosseum-arena-hero"/);
  assert.doesNotMatch(container.innerHTML, /aden-expedition-map\.webp/);
});
