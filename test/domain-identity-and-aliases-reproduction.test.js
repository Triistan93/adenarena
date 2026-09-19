import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCanonicalClassId } from '../lineage-idle/src/data/classes/class_aliases.js';
import { resolveV2ClassContext } from '../lineage-idle/src/services/SkillEligibility.js';

// ─── REPRO 5: CONTAMINAÇÃO RACIAL EM RESOLVECANONICALCLASSID ─────────────────
test('REPRO-5: elven_knight e ertheiaWarrior não podem sofrer contaminação racial para human', () => {
  const elvenKnightId = resolveCanonicalClassId('elven_knight', 'elf');
  console.log('resolveCanonicalClassId("elven_knight", "elf"):', elvenKnightId);
  
  const ertheiaWarriorId = resolveCanonicalClassId('ertheiaWarrior', 'ertheia');
  console.log('resolveCanonicalClassId("ertheiaWarrior", "ertheia"):', ertheiaWarriorId);

  // O comportamento esperado é preservar o ID do elfo e da ertheia, e NUNCA virar human_knight ou human_warrior!
  assert.equal(elvenKnightId.startsWith('human_'), false, 'elven_knight NÃO pode ser resolvido com prefixo human_');
  assert.equal(ertheiaWarriorId.startsWith('human_'), false, 'ertheiaWarrior NÃO pode ser resolvido com prefixo human_');
});

// ─── REPRO 6: REGRESSÃO DE ESTÁGIO EM ELVEN_WIZARD E ASSASSIN ────────────────
test('REPRO-6: elven_wizard e darkelf assassin devem resolver para seus estágios canônicos corretos no V2', () => {
  const wizardCtx = resolveV2ClassContext('elven_wizard', 'elf');
  console.log('resolveV2ClassContext("elven_wizard", "elf") v2ClassId:', wizardCtx.v2ClassId, 'stage:', wizardCtx.v2ClassDef?.stage);
  
  // elven_wizard é estágio 1 (Lv 20-39). Não pode resolver para elfMage (estágio 0)!
  assert.equal(wizardCtx.status, 'RESOLVED');
  assert.equal(wizardCtx.v2ClassId, 'elvenWizard', 'elven_wizard deve mapear para elvenWizard');
  assert.equal(wizardCtx.v2ClassDef?.stage, 1, 'elvenWizard deve ser estágio 1');

  // Dark Elf assassin é estágio 1 (Lv 20-39). Não pode resolver para assassinS0 (estágio 0)!
  const assassinCtx = resolveV2ClassContext('assassin', 'darkelf');
  console.log('resolveV2ClassContext("assassin", "darkelf") v2ClassId:', assassinCtx.v2ClassId, 'stage:', assassinCtx.v2ClassDef?.stage);
  assert.equal(assassinCtx.status, 'RESOLVED');
  assert.equal(assassinCtx.v2ClassId, 'assassinDE', 'Dark Elf assassin deve mapear para assassinDE');
  assert.equal(assassinCtx.v2ClassDef?.stage, 1, 'assassinDE deve ser estágio 1');
});

// ─── REPRO 7: 16 CLASSES CANÔNICAS DO V1 NÃO PODEM FICAR UNRESOLVED NO V2 ────
test('REPRO-7: As 16 classes canônicas do V1 que existem no catálogo V2 devem resolver com sucesso', () => {
  const checkClasses = [
    { id: 'arcana_lord', race: 'human', expectedV2: 'arcanaLord' },
    { id: 'elven_knight', race: 'elf', expectedV2: 'elvenKnight' },
    { id: 'elven_scout', race: 'elf', expectedV2: 'elfScout' },
    { id: 'plain_walker', race: 'elf', expectedV2: 'plainsWalker' },
    { id: 'oracle', race: 'elf', expectedV2: 'elfOracle' },
    { id: 'elder', race: 'elf', expectedV2: 'elfElder' },
    { id: 'palus_knight', race: 'darkelf', expectedV2: 'palusKnight' },
    { id: 'dark_wizard', race: 'darkelf', expectedV2: 'darkWizard' },
    { id: 'shillien_oracle', race: 'darkelf', expectedV2: 'shillienOracle' },
    { id: 'orc_raider', race: 'orc', expectedV2: 'raider' },
    { id: 'orc_monk', race: 'orc', expectedV2: 'monk' },
    { id: 'orc_shaman', race: 'orc', expectedV2: 'shaman' },
    { id: 'soul_finder', race: 'kamael', expectedV2: 'soulFinder' },
    { id: 'soul_breaker', race: 'kamael', expectedV2: 'soulBreakerKamael' },
    { id: 'soul_hound', race: 'kamael', expectedV2: 'soulHound' },
    { id: 'arbalester', race: 'kamael', expectedV2: 'soulRanger' }
  ];

  for (const item of checkClasses) {
    const ctx = resolveV2ClassContext(item.id, item.race);
    assert.equal(ctx.status, 'RESOLVED', `${item.id} deve ser RESOLVED`);
    assert.equal(ctx.v2ClassId, item.expectedV2, `${item.id} deve mapear para ${item.expectedV2}`);
    assert.equal(ctx.v2ClassDef.skillIds.length, 5, `${item.id} deve conter exatamente 5 habilidades próprias na evolução`);
    assert.ok(ctx.authorizedSkillIds.length >= 5, `${item.id} deve acumular habilidades autorizadas da linhagem`);
  }
});
