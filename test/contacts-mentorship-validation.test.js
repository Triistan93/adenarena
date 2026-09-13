import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

describe('👥 Contatos, Amigos & Mentoria Integration Validation', () => {
  it('1. Markup.ts exposes top bar Contatos button, Pillar 4 subtab button and referral-modal in DOM', () => {
    const markupPath = path.join(rootDir, 'src', 'idle', 'markup.ts');
    const content = fs.readFileSync(markupPath, 'utf8');

    assert.ok(content.includes('id="top-referral-btn"'), 'Top referral button ID must exist');
    assert.ok(content.includes('<span>Contatos</span>'), 'Top button must display Contatos text');
    assert.ok(content.includes('window.openContactsModal'), 'Top button must call window.openContactsModal');
    assert.ok(content.includes('id="pillar-contacts-btn"'), 'Pillar 4 must have a contacts button');
    assert.ok(content.includes('👥 Contatos &amp; Mentoria'), 'Pillar 4 button must be labeled Contatos & Mentoria');
    assert.ok(content.includes('id="referral-modal" class="modal"'), 'referral-modal must exist in markup.ts as a modal');
  });

  it('2. GameUI.js exports uiOpenReferralModal and closeContactsModal with robust Shadow DOM lookup', () => {
    const gameUIPath = path.join(rootDir, 'lineage-idle', 'src', 'ui', 'GameUI.js');
    const content = fs.readFileSync(gameUIPath, 'utf8');

    assert.ok(content.includes('export function uiOpenReferralModal'), 'uiOpenReferralModal must be exported');
    assert.ok(content.includes('export function closeContactsModal'), 'closeContactsModal must be exported');
    assert.ok(content.includes('👥 Contatos, Amigos &amp; Mentoria') || content.includes('👥 Contatos, Amigos & Mentoria'), 'Modal title must be Contatos, Amigos & Mentoria');
    assert.ok(content.includes('Lista de Amigos'), 'Friends tab must show Lista de Amigos');
    assert.ok(content.includes('Lista de Bloqueados'), 'Block tab must show Lista de Bloqueados');
    assert.ok(content.includes('Programa de Mentoria de Aden'), 'Mentorship tab must show Programa de Mentoria de Aden');
    assert.ok(content.includes('btn-friend-make-mentor'), 'Make mentor action button must exist');
    assert.ok(content.includes('window.openContactsModal ='), 'window.openContactsModal must be defined');
    assert.ok(content.includes('window.closeContactsModal ='), 'window.closeContactsModal must be defined');
  });

  it('3. main.js binds topReferralBtn and pillarContactsBtn in bindEvents and exposes global handlers', () => {
    const mainPath = path.join(rootDir, 'lineage-idle', 'main.js');
    const content = fs.readFileSync(mainPath, 'utf8');

    assert.ok(content.includes("const topReferralBtn = el('top-referral-btn');"), 'main.js must query top-referral-btn');
    assert.ok(content.includes("const pillarContactsBtn = el('pillar-contacts-btn');"), 'main.js must query pillar-contacts-btn');
    assert.ok(content.includes('window.openContactsModal ='), 'main.js must define window.openContactsModal');
    assert.ok(content.includes('window.openReferralModal ='), 'main.js must define window.openReferralModal');
    assert.ok(content.includes('window.closeContactsModal ='), 'main.js must define window.closeContactsModal');
    assert.ok(content.includes('window.submitReferralCodeAction'), 'main.js must define submitReferralCodeAction');
    assert.ok(content.includes('window.claimReferralRewardsAction'), 'main.js must define claimReferralRewardsAction');
  });

  it('4. style.css contains fixed overlay and styling for #referral-modal and .l2contacts', () => {
    const cssPath = path.join(rootDir, 'lineage-idle', 'style.css');
    const content = fs.readFileSync(cssPath, 'utf8');

    assert.ok(content.includes('#referral-modal'), '#referral-modal must be styled in style.css');
    assert.ok(content.includes('.l2contacts-window-frame'), '.l2contacts-window-frame must be styled in style.css');
    assert.ok(content.includes('z-index: 999999;'), 'Modal must have high z-index to overlay canvas');
  });

  it('5. TutorialGuide.js has updated referral guide and aliases for contacts, friends, and mentorship', async () => {
    const guideModule = await import('../lineage-idle/src/ui/TutorialGuide.js');
    const guides = guideModule.GUIDES_DATA;

    assert.ok(guides.referral, 'referral guide must exist');
    assert.ok(guides.referral.title.includes('Contatos'), 'Title must include Contatos');
    assert.ok(guides.referral.title.includes('Mentoria'), 'Title must include Mentoria');
    assert.strictEqual(guides.contacts, guides.referral, 'GUIDES_DATA.contacts must map to referral');
    assert.strictEqual(guides.friends, guides.referral, 'GUIDES_DATA.friends must map to referral');
    assert.strictEqual(guides.mentorship, guides.referral, 'GUIDES_DATA.mentorship must map to referral');
    assert.strictEqual(guides.mentoria, guides.referral, 'GUIDES_DATA.mentoria must map to referral');
    assert.strictEqual(guides.amigos, guides.referral, 'GUIDES_DATA.amigos must map to referral');
    assert.strictEqual(guides.referral.sections.length, 3, 'Must contain 3 comprehensive sections');
  });
});
