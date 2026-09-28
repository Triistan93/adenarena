import React from 'react';
import { createRoot } from 'react-dom/client';
import { CharacterCreation } from '/src/components/CharacterCreation.tsx';
import { CANONICAL_CLASS_REGISTRY } from '/lineage-idle/src/data/classes/CanonicalClassRegistry.js';
import { CANONICAL_RACES } from '/lineage-idle/src/data/classes/CanonicalRaceRegistry.js';
import { DEFAULT_STATE, applyStarterKit } from '/lineage-idle/src/core/StateManager.js';

const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const waitForImage = async getImage => {
  let image = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    image = getImage();
    if (image?.complete && image.naturalWidth > 0) {
      return { src: image.getAttribute('src'), loaded: true };
    }
    // Allow the production onError handler to replace a missing portrait with
    // its fallback before recording the settled URL.
    await new Promise(resolve => setTimeout(resolve, 40));
  }
  image = getImage();
  return { src: image?.getAttribute('src') || null, loaded: Boolean(image?.complete && image.naturalWidth > 0) };
};

export async function run() {
  let submitted = null;
  let host = document.getElementById('audit-root');
  if (!host) {
    host = document.createElement('main');
    host.id = 'audit-root';
    document.body.append(host);
  }
  const reactRoot = createRoot(host);
  reactRoot.render(React.createElement(CharacterCreation, {
    initialCharName: 'Auditoria UI',
    initialRace: 'human',
    initialClass: 'fighter',
    initialGender: 'M',
    onComplete: data => { submitted = data; }
  }));
  await nextPaint();

  const raceNameToId = {
    'Humano': 'human', 'Elfo': 'elf', 'Elfo Negro': 'darkelf', 'Orc': 'orc',
    'Anão': 'dwarf', 'Kamael': 'kamael', 'Sylph': 'sylph', 'High Elf': 'highelf', 'Ertheia': 'ertheia'
  };
  const raceButton = name => [...host.querySelectorAll('button[data-race-id]')].find(button => button.textContent.trim().endsWith(name));
  const rows = [];
  const failures = [];
  const contentGaps = new Set(['marauderBase', 'sayhaMageBase']);

  for (const [raceName, raceId] of Object.entries(raceNameToId)) {
    const button = raceButton(raceName);
    if (!button) {
      failures.push({ raceId, issue: 'race option not rendered' });
      continue;
    }
    button.click();
    await nextPaint();
    const canonicalRace = CANONICAL_RACES[raceId];
    const classButtons = [...host.querySelectorAll('button[data-class-id]')];
    const initiallySelected = classButtons.filter(candidate => candidate.getAttribute('aria-pressed') === 'true');
    if (initiallySelected.length !== 1 || !canonicalRace?.baseClassIds.includes(initiallySelected[0]?.dataset.classId)) {
      failures.push({ raceId, issue: 'race change did not choose exactly one valid initial class', selectedClassIds: initiallySelected.map(candidate => candidate.dataset.classId) });
    }
    const options = [];
    for (const classButton of classButtons) {
      classButton.click();
      await nextPaint();
      const id = classButton.dataset.classId;
      const canonical = CANONICAL_CLASS_REGISTRY[id];
      const classLabel = classButton.querySelector('span.text-xs.font-bold')?.textContent.trim() || '';
      const identityMatchesRace = canonicalRace?.baseClassIds.includes(id) === true;
      const currentPreview = () => host.querySelector('.group > img');
      const malePreview = await waitForImage(currentPreview);
      host.querySelector('button[data-gender="F"]')?.click();
      await nextPaint();
      const femalePreview = await waitForImage(currentPreview);
      host.querySelector('button[data-gender="M"]')?.click();
      await nextPaint();
      const selectedSummaryMatches = [...host.querySelectorAll('span')].some(span => span.textContent.trim() === classLabel);
      const row = {
        raceId,
        classId: id,
        canonicalRoot: canonical?.stage === 0,
        identityMatchesRace,
        selectedStateMatches: classButton.getAttribute('aria-pressed') === 'true' && button.getAttribute('aria-pressed') === 'true',
        contentStatus: contentGaps.has(id) ? 'BLOCKED_CONTENT_GAP' : 'ACTIVE',
        malePreview,
        femalePreview,
        previewFallback: malePreview.src === '/img/humanpalaM.png' || femalePreview.src === '/img/humanpalaM.png',
        selectedSummaryMatches
      };
      options.push(row);
      if (!row.canonicalRoot) failures.push({ raceId, classId: id, issue: 'class option does not resolve to canonical stage-0 class' });
      if (!row.identityMatchesRace) failures.push({ raceId, classId: id, issue: 'class is not registered as a base class of the selected race' });
      if (!row.selectedStateMatches) failures.push({ raceId, classId: id, issue: 'selected state did not match the active race/class option' });
      if (!malePreview.loaded || !femalePreview.loaded) failures.push({ raceId, classId: id, issue: 'character preview image did not load for both genders', malePreview, femalePreview });
      if (row.previewFallback) failures.push({ raceId, classId: id, issue: 'class portrait silently fell back to generic Human Paladin artwork', malePreview, femalePreview });
      if (!row.selectedSummaryMatches) failures.push({ raceId, classId: id, issue: 'selected class summary did not follow selection' });
    }
    rows.push({ raceId, expectedClasses: canonicalRace?.baseClassIds || [], renderedClasses: options });
    const expected = [...(canonicalRace?.baseClassIds || [])].sort();
    const rendered = options.map(option => option.classId).sort();
    if (JSON.stringify(expected) !== JSON.stringify(rendered)) failures.push({ raceId, issue: 'rendered class options differ from canonical base classes', expected, rendered });
  }

  const allClassRows = rows.flatMap(row => row.renderedClasses);
  const uniqueIds = [...new Set(allClassRows.map(row => row.classId))];
  const creationInitialization = allClassRows.map(({ raceId, classId }) => {
    const state = DEFAULT_STATE();
    applyStarterKit(state, raceId, classId, 'Auditoria UI', 'M');
    const starterWeapon = state.inventory.find(item => item.uid === state.equipment.weapon);
    const initialized = state.race === raceId && state.class === classId && state.level === 1 &&
      state.charName === 'Auditoria UI' && state.gender === 'M' && Boolean(starterWeapon);
    const result = { raceId, classId, savedClassId: state.class, savedRaceId: state.race, starterWeaponId: starterWeapon?.itemId || null, initialized };
    if (!initialized) failures.push({ raceId, classId, issue: 'production starter-kit initialization changed identity or failed to equip a starter weapon', result });
    return result;
  });
  raceButton('Humano')?.click();
  await nextPaint();
  raceButton('Elfo')?.click();
  await nextPaint();
  const elfClassButton = host.querySelector('button[data-class-id="elven_fighter"]');
  elfClassButton?.click();
  host.querySelector('button[data-gender="F"]')?.click();
  await nextPaint();
  const genderSwitch = {
    genderLabelUpdated: host.textContent.includes('Feminino ♀️'),
    pressedStateUpdated: host.querySelector('button[data-gender="F"]')?.getAttribute('aria-pressed') === 'true',
    previewSrc: (await waitForImage(() => host.querySelector('.group > img'))).src,
    previewLoaded: (await waitForImage(() => host.querySelector('.group > img'))).loaded
  };
  if (!genderSwitch.genderLabelUpdated || !genderSwitch.pressedStateUpdated || !genderSwitch.previewLoaded) failures.push({ issue: 'gender switch failed to update its state or loaded portrait' });

  host.querySelector('button[type="submit"]')?.click();
  for (let attempt = 0; attempt < 40 && !submitted; attempt++) await new Promise(resolve => setTimeout(resolve, 100));
  const confirmation = submitted ? {
    ...submitted,
    passedSelection: submitted.race === 'elf' && submitted.className === 'elven_fighter' && submitted.gender === 'F' && submitted.charName === 'Auditoria UI'
  } : null;
  if (!confirmation?.passedSelection) failures.push({ issue: 'confirmation returned values different from the selected creation options', confirmation });

  const desktopModal = host.querySelector('.fixed.inset-0 > div');
  const desktopGeometry = desktopModal ? {
    width: Math.round(desktopModal.getBoundingClientRect().width),
    height: Math.round(desktopModal.getBoundingClientRect().height),
    scrollHeight: desktopModal.scrollHeight,
    clientHeight: desktopModal.clientHeight,
    horizontalOverflow: desktopModal.scrollWidth > desktopModal.clientWidth
  } : null;
  return {
    raceCount: rows.length,
    classOptionCount: allClassRows.length,
    uniqueClassCount: uniqueIds.length,
    activeClassCount: uniqueIds.filter(id => !contentGaps.has(id)).length,
    blockedContentGapCount: uniqueIds.filter(id => contentGaps.has(id)).length,
    rows,
    productionInitializations: creationInitialization,
    productionInitializationCount: creationInitialization.filter(result => result.initialized).length,
    genderSwitch,
    confirmation,
    desktopGeometry,
    failures,
    conciseRows: rows.map(row => ({
      raceId: row.raceId,
      classIds: row.renderedClasses.map(classRow => classRow.classId),
      portraitFallbacks: row.renderedClasses.filter(classRow => classRow.previewFallback).map(classRow => ({
        classId: classRow.classId,
        male: classRow.malePreview.src,
        female: classRow.femalePreview.src
      }))
    }))
  };
}
