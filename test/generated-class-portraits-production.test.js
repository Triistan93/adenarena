import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import queue from '../scripts/class_portrait_queue.json' with { type: 'json' };
import registry from '../src/idle/generatedClassPortraits.json' with { type: 'json' };
import { heroImgPath, heroSVG } from '../lineage-idle/art.js';
import { classPortraitAliases } from '../src/idle/portraitAliases.js';

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
        ['human', 'human_fighter', 'fighter'],
        ['human', 'human_dark_avenger', 'darkavenger'],
        ['human', 'human_treasure_hunter', 'treasurehunter'],
        ['human', 'human_phoenix_knight', 'phoenixknight'],
        ['human', 'human_assassin_s0', 'assassins0'],
        ['human', 'human_warg_s2', 'wargs2'],
        ['elf', 'elf_fighter', 'elffighter'],
        ['elf', 'elf_mystic_muse', 'mysticmuse'],
        ['elf', 'elf_elemental_master', 'elementalmaster'],
        ['elf', 'elf_evas_saint', 'evasaint'],
        ['elf', 'elven_fighter', 'elffighter'],
        ['elf', 'elven_mage', 'elfmage'],
        ['darkelf', 'dark_fighter', 'darkelffighter'],
        ['darkelf', 'dark_mage', 'darkelfmage'],
        ['darkelf', 'delf_deathknight_0', 'deathknightde'],
        ['darkelf', 'secret_assassin_female_0', 'assassinde'],
        ['darkelf', 'rose_vain_0', 'bloodrosebase'],
        ['orc', 'orc_fighter', 'orcfighter'],
        ['orc', 'orc_mage', 'orcmage'],
        ['orc', 'orc_shaman', 'shaman'],
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

  it('maps starting-screen spellings to their exact race-specific generated class portraits', () => {
    const cases = [
      ['human', 'fighter', 'fighter'],
      ['human', 'mage', 'mage'],
      ['human', 'human_deathknight_0', 'deathknight'],
      ['human', 'werewolf_0', 'wargs0'],
      ['human', 'secret_assassin_male_0', 'assassins0'],
      ['elf', 'elven_fighter', 'elffighter'],
      ['elf', 'elven_mage', 'elfmage'],
      ['elf', 'elf_mystic_muse', 'mysticmuse']
    ];
    for (const [race, input, expected] of cases) {
      assert.ok(classPortraitAliases(race, input).includes(expected), `${race}/${input} should resolve ${expected}`);
    }
  });

  it('does not register doubled public image roots in any production portrait map', () => {
    for (const file of ['lineage-idle/art.js', 'src/components/CharacterCreation.tsx', 'src/components/LoginScreen.tsx']) {
      const source = fs.readFileSync(path.join(projectRoot, file), 'utf8');
      assert.doesNotMatch(source, /\/img\/\/img\//, `${file} must use a single /img public root`);
      const assetPaths = [...source.matchAll(/['"](\/img\/[^'"\s]+\.(?:webp|png|jpe?g))['"]/g)].map(match => match[1]);
      for (const assetPath of assetPaths) {
        assert.ok(fs.existsSync(path.join(projectRoot, 'public', assetPath.slice(1))), `${file} references missing public asset ${assetPath}`);
      }
    }

    const creation = fs.readFileSync(path.join(projectRoot, 'src/components/CharacterCreation.tsx'), 'utf8');
    assert.match(creation, /elven_fighter: \{ M: '\/img\/m_elf_elf_fighter\.webp', F: '\/img\/f_elf_elf_fighter\.webp' \}/);
    assert.match(creation, /elf_deathknight_0: \{ M: '\/img\/m_elf_elf_death_knight\.webp', F: '\/img\/f_elf_elf_death_knight\.webp' \}/);
  });

  it('keeps the generated portrait available when the window registry has not initialized yet', () => {
    const previousWindow = globalThis.window;
    delete globalThis.window;
    try {
      assert.equal(heroImgPath('orc', 'orc_shaman', 'M'), '/img/m_orc_shaman.webp');
      assert.equal(heroImgPath('orc', 'orc_shaman', 'F'), '/img/f_orc_shaman.webp');
      assert.match(heroSVG({ race: 'orc', class: 'orc_shaman', gender: 'F', mode: 'portrait' }), /src="\/img\/f_orc_shaman\.webp"/);
    } finally {
      if (previousWindow !== undefined) globalThis.window = previousWindow;
    }
  });
});
