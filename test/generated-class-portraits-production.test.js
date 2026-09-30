import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import queue from '../scripts/class_portrait_queue.json' with { type: 'json' };
import registry from '../src/idle/generatedClassPortraits.json' with { type: 'json' };
import { heroImgPath } from '../lineage-idle/art.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('generated class portraits in the production resolver', () => {
  it('has one unique male and female asset for every completed race/class row', async () => {
    assert.equal(queue.completedClasses, queue.totalClasses);
    assert.ok(Object.values(registry).reduce((sum, classes) => sum + Object.keys(classes).length, 0) >= queue.totalClasses);
    const outputFiles = queue.rows.flatMap(row => [row.maleFile, row.femaleFile]);
    assert.equal(new Set(outputFiles).size, outputFiles.length, 'each class/gender must have a unique output file');

    for (const row of queue.rows) {
      const portrait = registry[row.race]?.[row.classId.toLowerCase()];
      assert.ok(portrait, `${row.race}/${row.classId} must be registered`);
      assert.equal(portrait.M, `/img/${row.maleFile}`);
      assert.equal(portrait.F, `/img/${row.femaleFile}`);
      assert.notEqual(portrait.M, portrait.F, `${row.race}/${row.classId} must have gender-specific files`);
      for (const file of [row.maleFile, row.femaleFile]) {
        const absolute = path.join(projectRoot, 'public', 'img', file);
        assert.ok(fs.existsSync(absolute), `${file} must exist`);
        const metadata = await sharp(absolute).metadata();
        assert.equal(metadata.format, 'webp', `${file} must use the compressed WebP format`);
        assert.equal(metadata.width, 512, `${file} width`);
        assert.equal(metadata.height, 600, `${file} height`);
        assert.equal(metadata.hasAlpha, true, `${file} must preserve transparency`);
      }
    }
  });

  it('resolves each racial class portrait and gender through the production hero path resolver', () => {
    const previousWindow = globalThis.window;
    globalThis.window = { __CLASS_PORTRAITS: registry };
    try {
      for (const row of queue.rows) {
        assert.equal(heroImgPath(row.race, row.classId, 'M'), `/img/${row.maleFile}`, `${row.race}/${row.classId} male`);
        assert.equal(heroImgPath(row.race, row.classId, 'F'), `/img/${row.femaleFile}`, `${row.race}/${row.classId} female`);
      }

      const initialAliases = [
        ['darkelf', 'dark_fighter', 'darkelffighter'],
        ['darkelf', 'dark_mage', 'darkelfmage'],
        ['darkelf', 'delf_deathknight_0', 'deathknightde'],
        ['darkelf', 'secret_assassin_female_0', 'assassinde'],
        ['darkelf', 'rose_vain_0', 'bloodrosebase'],
        ['orc', 'orc_fighter', 'orcfighter'],
        ['orc', 'orc_mage', 'orcmage'],
        ['orc', 'orc_rider_0', 'rider'],
        ['dwarf', 'dwarven_fighter', 'artisandwarf'],
        ['kamael', 'jin_kamael_soldier', 'kamaelsoldier'],
        ['kamael', 'crow_0', 'samuraibase'],
        ['sylph', 'sylphid', 'sylphgunner'],
        ['highelf', 'sacred_templar_0', 'divinetemplar'],
        ['highelf', 'spirit_0', 'spirit_0'],
        ['ertheia', 'marauderBase', 'marauderbase'],
        ['ertheia', 'sayhaMageBase', 'sayhamagebase']
      ];
      for (const [race, alias, source] of initialAliases) {
        assert.equal(heroImgPath(race, alias, 'M'), registry[race][source].M, `${race}/${alias} male alias`);
        assert.equal(heroImgPath(race, alias, 'F'), registry[race][source].F, `${race}/${alias} female alias`);
      }
    } finally {
      if (previousWindow === undefined) delete globalThis.window;
      else globalThis.window = previousWindow;
    }
  });
});
