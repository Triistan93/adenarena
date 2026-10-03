import test from 'node:test';
import assert from 'node:assert/strict';

test('guide category navigation wraps all topics instead of clipping a horizontal strip', async () => {
  const previousDocument = globalThis.document;
  let overlay = null;
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#tutorial-guide-modal' ? overlay : null,
    createElement: () => ({ style: {}, className: '', id: '', innerHTML: '' }),
    body: { appendChild: element => { overlay = element; } }
  };

  try {
    const { openTabGuideModal } = await import('../lineage-idle/src/ui/TutorialGuide.js');
    openTabGuideModal('inventory');

    const nav = overlay.innerHTML.match(/<nav class="tutorial-guide-category-tabs"[^>]*>/)?.[0];
    assert.ok(nav, 'the category selector has a stable class for responsive layout');
    assert.match(nav, /flex-wrap:\s*wrap/i);
    assert.doesNotMatch(nav, /overflow-x:\s*auto/i);

    const buttons = overlay.innerHTML.match(/<button onclick="window\.openTabGuideModal\('/g) || [];
    assert.equal(buttons.length, 17, 'all guide categories remain available after wrapping');
    assert.match(overlay.innerHTML, /white-space:\s*normal/i, 'long topic names can wrap inside their buttons');
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});

test('expedition guide describes the current camp and Manor loops without removed castle taxes', async () => {
  const previousDocument = globalThis.document;
  let overlay = null;
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#tutorial-guide-modal' ? overlay : null,
    createElement: () => ({ style: {}, className: '', id: '', innerHTML: '' }),
    body: { appendChild: element => { overlay = element; } }
  };

  try {
    const { openTabGuideModal } = await import('../lineage-idle/src/ui/TutorialGuide.js');
    openTabGuideModal('expeditions');

    assert.match(overlay.innerHTML, /Mural de ordens|Companhia de Aden/i);
    assert.match(overlay.innerHTML, /Manor/i);
    assert.doesNotMatch(overlay.innerHTML, /impostos diários|coletados de todo o servidor|painel do Castelo/i);
    assert.doesNotMatch(overlay.innerHTML, /\*\*/);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
  }
});
