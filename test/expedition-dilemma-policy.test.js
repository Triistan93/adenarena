import { test } from 'node:test';
import assert from 'node:assert/strict';

import { EXPEDITION_DILEMMAS, RISK_DIRECTIVES } from '../lineage-idle/src/data/expeditions.js';
import { MERCENARY_SPECIALIZATIONS, MERCENARY_TRAITS } from '../lineage-idle/src/data/mercenaries.js';
import { ExpeditionService } from '../lineage-idle/src/services/ExpeditionService.js';
import { checkExpeditionDilemmaEligibility, getExpeditionDilemmaActionEligibility } from '../lineage-idle/src/services/ExpeditionDilemmaPolicy.js';
import { renderExpeditionsUI } from '../lineage-idle/src/ui/GameUI.js';

test('dilemma requirements refer only to real mercenary specializations, traits, and directives', () => {
  for (const [dilemmaId, dilemma] of Object.entries(EXPEDITION_DILEMMAS)) {
    for (const [optionId, option] of Object.entries(dilemma.options)) {
      if (option.reqSpec) assert.ok(MERCENARY_SPECIALIZATIONS[option.reqSpec], `${dilemmaId}.${optionId} references missing specialization ${option.reqSpec}`);
      for (const spec of option.reqSpecs || []) assert.ok(MERCENARY_SPECIALIZATIONS[spec], `${dilemmaId}.${optionId} references missing specialization ${spec}`);
      if (option.reqTrait) assert.ok(MERCENARY_TRAITS[option.reqTrait], `${dilemmaId}.${optionId} references missing trait ${option.reqTrait}`);
      if (option.reqDirective) assert.ok(RISK_DIRECTIVES[option.reqDirective], `${dilemmaId}.${optionId} references missing directive ${option.reqDirective}`);
    }
  }
});

test('mercenary specialization descriptions match the effects actually calculated for expeditions', () => {
  const cases = [
    ['tracker', { speedReduction: 0.20, extraMaterialChance: 0.25 }, ['-20%', '+25%']],
    ['thief', { bonusChestChance: 0.35, hazardMitigation: 0.25 }, ['+35%', '-25%']],
    ['mage', { extraShardsPct: 0.50 }, ['+50%']],
    ['healer', { extraXpPct: 0.30, hazardMitigation: 0.20 }, ['+30%', '-20%']],
    ['guardian', { goldBonusPct: 0.10, hazardMitigation: 0.35 }, ['-35%', '+10%']]
  ];

  for (const [spec, expectedEffects, descriptionValues] of cases) {
    const squad = [{ uid: `merc-${spec}`, spec, trait: null, loyalty: 0, basePower: 50 }];
    const effects = ExpeditionService.calculateSquadSynergies('no_recommended_specs', squad);
    for (const [effect, value] of Object.entries(expectedEffects)) {
      assert.equal(effects[effect], value, `${spec} must apply ${effect}`);
    }
    for (const value of descriptionValues) {
      assert.ok(MERCENARY_SPECIALIZATIONS[spec].synergyDesc.includes(value), `${spec} UI description must disclose ${value}`);
    }
  }

  assert.equal(ExpeditionService.calculateSquadSynergies('none', [{ spec: 'mage', loyalty: 0 }]).secretChamberChance, undefined,
    'no secret-chamber bonus should be advertised until a reward path exists');
  assert.equal(MERCENARY_SPECIALIZATIONS.mage.synergyDesc.includes('câmara secreta'), false);
});

test('mercenary trait descriptions do not promise expedition effects that the runtime ignores', () => {
  const cautious = ExpeditionService.calculateSquadSynergies('none', [{ spec: 'mage', trait: 'cautious', loyalty: 0 }]);
  assert.equal(cautious.hazardMitigation, 0.25);
  assert.equal(cautious.speedReduction, 0);
  assert.equal(MERCENARY_TRAITS.cautious.desc.includes('duração'), false);

  const lucky = ExpeditionService.calculateSquadSynergies('none', [{ spec: 'tracker', trait: 'lucky', loyalty: 0 }]);
  assert.equal(lucky.bonusChestChance, 0.15);
  assert.equal(MERCENARY_TRAITS.lucky.desc.includes('relíquias'), false);
});

test('dilemma eligibility enforces squad and directive requirements on every option', () => {
  const veteran = { uid: 'merc-veteran', spec: 'healer', trait: 'veteran' };
  const thief = { uid: 'merc-thief', spec: 'thief', trait: 'lucky' };
  const activeExpedition = { directive: 'balanced' };

  assert.equal(checkExpeditionDilemmaEligibility(activeExpedition, { reqTrait: 'greedy' }, [veteran]).eligible, false);
  assert.equal(checkExpeditionDilemmaEligibility(activeExpedition, { reqTrait: 'veteran' }, [veteran]).eligible, true);
  assert.equal(checkExpeditionDilemmaEligibility(activeExpedition, { reqSpecs: ['healer', 'mage'] }, [veteran]).eligible, true);
  assert.equal(checkExpeditionDilemmaEligibility(activeExpedition, { reqSpec: 'thief' }, [thief]).eligible, true);
  assert.equal(checkExpeditionDilemmaEligibility(activeExpedition, { reqDirective: 'cautious' }, [thief]).eligible, false);
  assert.equal(checkExpeditionDilemmaEligibility({ directive: 'cautious' }, { reqDirective: 'cautious' }, []).eligible, true);
});

test('the production dilemma action guard rejects ineligible and stale actions', () => {
  const state = {
    mercenaries: { owned: [{ uid: 'thief-1', spec: 'thief', trait: 'lucky' }] },
    expeditions: [{
      id: 'exp-1', destId: 'gludio_ruins', squad: ['thief-1'], directive: 'balanced',
      activeDilemmaId: 'dilemma_chest', dilemmaResolved: false, claimed: false
    }]
  };

  assert.equal(getExpeditionDilemmaActionEligibility(state, 'gludio_ruins', 'forcar').eligible, false);
  assert.equal(getExpeditionDilemmaActionEligibility(state, 'gludio_ruins', 'destrancar').eligible, true);
  assert.equal(getExpeditionDilemmaActionEligibility(state, 'gludio_ruins', 'missing-option').eligible, false);
  state.expeditions[0].dilemmaResolved = true;
  assert.equal(getExpeditionDilemmaActionEligibility(state, 'gludio_ruins', 'destrancar').eligible, false);
});

test('expedition dilemma UI renders its content without globals and disables unavailable choices', () => {
  const oldDocument = globalThis.document;
  const oldWindow = globalThis.window;
  const container = { innerHTML: '' };
  globalThis.document = {
    getElementById: () => null,
    querySelector: selector => selector === '#tab-expeditions, .tab-expeditions' ? container : null
  };
  globalThis.window = {};

  try {
    renderExpeditionsUI({
      level: 100,
      gold: 1_000_000,
      astralShards: 0,
      expeditions: [{
        id: 'exp_disposable',
        destId: 'gludio_ruins',
        startTime: Date.now(),
        duration: 3_600_000,
        squad: ['thief-1'],
        directive: 'balanced',
        activeDilemmaId: 'dilemma_chest',
        dilemmaResolved: false,
        claimed: false
      }],
      mercenaries: {
        owned: [{ uid: 'thief-1', spec: 'thief', trait: 'lucky', name: 'Batedor de Teste', level: 1, xp: 0, loyalty: 50 }],
        tavernPool: []
      }
    });

    assert.match(container.innerHTML, /Dilema de Marcha: Arca Ancestral Trancada/);
    assert.match(container.innerHTML, /disabled[^>]*title="Requer um mercenário da especialização guardian\./);
    assert.match(container.innerHTML, /Destrancar com Gazua/);
    assert.doesNotMatch(container.innerHTML, /65% chance de sucesso|90% chance de sucesso/);
  } finally {
    globalThis.document = oldDocument;
    globalThis.window = oldWindow;
  }
});
