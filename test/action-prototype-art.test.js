import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getPrototypeAnimation, getPrototypeEnemyPortrait, getPrototypeHeroPortrait } from "../src/game/prototypeArt.js";

const REPO_ROOT = new URL("../", import.meta.url);

test("all playable prototype builds use existing transparent Idle hero portraits", () => {
  const builds = [
    ["human", "warrior", "/img/m_human_warrior.webp"],
    ["elf", "archer", "/img/m_elf_silver_ranger.webp"],
    ["darkelf", "sorcerer", "/img/m_darkelf_dark_elf_mage.webp"],
  ];

  for (const [race, cls, expected] of builds) {
    const path = getPrototypeHeroPortrait(race, cls);
    assert.equal(path, expected);
    assert.equal(existsSync(new URL(`public${path}`, REPO_ROOT)), true, `${path} exists`);
  }
});

test("playable animations contain twelve distinct complete poses with safe transparent borders", async () => {
  for (const [race, cls] of [["human", "warrior"], ["elf", "archer"], ["darkelf", "sorcerer"]]) {
    const file = fileURLToPath(new URL(`public${getPrototypeAnimation(race, cls)}`, REPO_ROOT));
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    assert.equal(info.width, 1536);
    assert.equal(info.height, 864);
    const poses = new Set();
    for (let frame = 0; frame < 12; frame++) {
      const left = (frame % 4) * 384, top = Math.floor(frame / 4) * 288;
      let opaque = 0;
      const silhouette = [];
      for (let y = 0; y < 288; y++) for (let x = 0; x < 384; x++) {
        const alpha = data[((top + y) * info.width + left + x) * 4 + 3];
        if (alpha > 32) opaque++;
        if (x === 0 || x === 383 || y === 0 || y === 287) assert.equal(alpha, 0, `${cls} frame ${frame} crosses cell edge`);
        if (x % 8 === 0 && y % 8 === 0) silhouette.push(alpha > 32 ? 1 : 0);
      }
      assert.ok(opaque > 2000, `${cls} frame ${frame} is populated`);
      poses.add(silhouette.join(''));
    }
    assert.equal(poses.size, 12, `${cls} has distinct animation poses`);
  }
});

test("prototype enemy art maps each combat archetype to an existing Idle monster cutout", () => {
  for (const enemyId of ["goblin", "spider", "skeleton", "orc", "knight", "elemental", "wraith", "troll"]) {
    const path = getPrototypeEnemyPortrait(enemyId);
    assert.ok(path, `${enemyId} has an explicit art choice`);
    assert.match(path, /^\/img\/bosses\//, `${enemyId} uses a transparent Idle monster cutout`);
    assert.equal(existsSync(new URL(`public${path}`, REPO_ROOT)), true, `${path} exists`);
  }
});

test("all selected prototype portraits preserve real transparent backgrounds", async () => {
  const sources = [
    ...["human:warrior", "elf:archer", "darkelf:mystic"].map((key) => {
      const [race, cls] = key.split(":");
      return getPrototypeHeroPortrait(race, cls);
    }),
    ...["goblin", "spider", "skeleton", "orc", "knight", "elemental", "wraith", "troll"].map(getPrototypeEnemyPortrait),
  ];

  for (const source of sources) {
    const file = fileURLToPath(new URL(`public${source}`, REPO_ROOT));
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let transparentPixels = 0;
    for (let index = 3; index < data.length; index += info.channels) {
      if (data[index] < 250) transparentPixels += 1;
    }
    assert.ok(transparentPixels / (info.width * info.height) > 0.05, `${source} has a usable alpha channel`);
  }
});

test("prototype art resolver does not silently reuse one generic portrait", () => {
  assert.equal(getPrototypeHeroPortrait("unknown", "unknown"), null);
  assert.equal(getPrototypeEnemyPortrait("unknown"), null);
});
