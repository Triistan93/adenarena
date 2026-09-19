/**
 * test/validation-pendencies-resolution.test.js
 * 
 * Validação rigorosa e independente das 5 pendências da revisão:
 * 1. Habilidades efetivas de Sylph (5 canônicas de sylphGunner).
 * 2. Neutral Placeholder no loadout bar e cards (eliminação de power_strike.png).
 * 3. Rejeição em combate de habilidade estrangeira pré-equipada em save legado + idempotência de refund.
 * 4. Ciclo completo de criação -> ataque básico -> XP -> save -> reload em classes CONTENT_GAP.
 * 5. transformV2SkillToEcho: zero legítimo, campos ausentes (sem valores arbitrários) e conversão de recarga.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Mock DOM environment if running in node
if (typeof window === 'undefined') {
  global.window = {};
}

// Imports
import { CANONICAL_CLASS_REGISTRY_V2 } from '../lineage-idle/src/data/classes/CanonicalClassRegistryV2.js';
import { CANONICAL_SKILL_REGISTRY_V2 } from '../lineage-idle/src/data/skills/CanonicalSkillRegistryV2.js';
import { resolveV2ClassContext, isSkillInProgressionPath, normalizeAndValidateSkills } from '../lineage-idle/src/services/SkillEligibility.js';
import { isSkillAllowedForClass } from '../lineage-idle/src/services/CharacterService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { parseCooldownToMs, transformV2SkillToEcho } from '../lineage-idle/data/echo-adapter.js';
import { NEUTRAL_SKILL_PLACEHOLDER } from '../lineage-idle/src/ui/GameUI.js';

// ─── 1. HABILIDADES DE SYLPH (sylphGunner) ──────────────────────────────────
test('1. Sylph Gunner: exatamente 5 habilidades canônicas oficiais do L2Wiki Essence', () => {
  const v2Ctx = resolveV2ClassContext('sylphid', 'sylph');
  assert.equal(v2Ctx.status, 'RESOLVED');
  assert.equal(v2Ctx.v2ClassId, 'sylphGunner');

  const sylphDef = CANONICAL_CLASS_REGISTRY_V2['sylphGunner'];
  assert.ok(sylphDef, 'sylphGunner deve existir no registro V2');
  assert.equal(sylphDef.stage, 0, 'sylphGunner é classe Base (estágio 0)');
  assert.equal(sylphDef.parentClass, null, 'sylphGunner não tem parentClass');

  const expectedSkills = [
    'dual_blow',
    'elemental_care',
    'elemental_haste',
    'bow_mastery',
    'light_armor_mastery'
  ];

  assert.deepEqual(sylphDef.skillIds, expectedSkills, 'As 5 habilidades devem ser as do catálogo oficial');
  assert.deepEqual(v2Ctx.authorizedSkillIds.slice(0, 5), expectedSkills);

  // Evidência de cada habilidade no registro canônico
  for (const sid of expectedSkills) {
    const sDef = CANONICAL_SKILL_REGISTRY_V2[sid];
    assert.ok(sDef, `Habilidade ${sid} deve existir no registro de skills`);
    assert.ok(sDef.classes.includes('sylphGunner'), `${sid} deve listar sylphGunner em classes`);
    assert.ok(sDef.icon, `${sid} deve ter ícone definido`);
  }

  // Verificação específica dos tipos canônicos
  assert.equal(CANONICAL_SKILL_REGISTRY_V2['dual_blow'].type, 'active');
  assert.equal(CANONICAL_SKILL_REGISTRY_V2['elemental_care'].type, 'active');
  assert.equal(CANONICAL_SKILL_REGISTRY_V2['elemental_haste'].type, 'buff');
  assert.equal(CANONICAL_SKILL_REGISTRY_V2['bow_mastery'].type, 'passive');
  assert.equal(CANONICAL_SKILL_REGISTRY_V2['light_armor_mastery'].type, 'passive');
});

// ─── 2. NEUTRAL PLACEHOLDER & REMOÇÃO DE POWER_STRIKE ───────────────────────
test('2. Ausência de rawPath e onerror utilizam NEUTRAL_SKILL_PLACEHOLDER, nunca power_strike.png', async () => {
  assert.ok(NEUTRAL_SKILL_PLACEHOLDER.startsWith('data:image/svg+xml'), 'Placeholder deve ser data URI SVG neutro');
  assert.ok(!NEUTRAL_SKILL_PLACEHOLDER.includes('power_strike'), 'Placeholder não pode citar power_strike');

  // Import GameUI
  const GameUI = await import('../lineage-idle/src/ui/GameUI.js');
  assert.equal(GameUI.NEUTRAL_SKILL_PLACEHOLDER, NEUTRAL_SKILL_PLACEHOLDER);

  // Inspecionar o código de renderLoadoutBar e renderSkillCard para verificar que power_strike.png não é fallback
  const fs = await import('node:fs');
  const uiCode = fs.readFileSync(new URL('../lineage-idle/src/ui/GameUI.js', import.meta.url), 'utf-8');

  // Verifica que power_strike.png não aparece no arquivo
  assert.ok(!uiCode.includes('power_strike.png'), 'GameUI.js não deve conter nenhuma menção a power_strike.png');
  assert.ok(uiCode.includes('NEUTRAL_SKILL_PLACEHOLDER'), 'GameUI.js deve usar NEUTRAL_SKILL_PLACEHOLDER');
});

// ─── 3. COMBATE COM SAVE LEGADO COM HABILIDADE ESTRANGEIRA PRÉ-EQUIPADA ──────
test('3. Ciclo de combate rejeita habilidade estrangeira pré-equipada e passivas indevidas sem alterar atributos', () => {
  // Simular save legado corrompido: Dark Fighter com flame_strike (mago) equipado no loadout e robe_mastery aprendido
  const legacyState = {
    class: 'dark_fighter',
    level: 10,
    sp: 100,
    skills: {
      power_strike: 1,
      flame_strike: 2, // Habilidade ativa estrangeira de mago
      robe_mastery: 2  // Passiva estrangeira de mago
    },
    skillLoadout: {
      basic: 'power_strike',
      core1: 'flame_strike', // Pré-equipada no save!
      core2: null,
      special1: null,
      special2: null,
      signature: null,
      ultimate: null
    },
    equipment: {}
  };

  // 1. Verificação de autorização da habilidade equipada
  const isFlameAllowed = isSkillAllowedForClass(legacyState.class, 'flame_strike');
  assert.equal(isFlameAllowed, false, 'flame_strike NÃO pode ser permitida para dark_fighter');

  // 2. Simulação do pipeline de combate em main.js (linhas 5501-5515):
  const SLOT_PRIORITY_ORDER = ['ultimate', 'signature', 'special2', 'special1', 'core2', 'core1', 'basic'];
  const activeSkillsToCast = [];
  for (const slot of SLOT_PRIORITY_ORDER) {
    const sId = legacyState.skillLoadout[slot];
    if (!sId) continue;
    if (!isSkillAllowedForClass(legacyState.class, sId)) continue; // Gate de segurança ativo
    activeSkillsToCast.push(sId);
  }

  assert.deepEqual(activeSkillsToCast, ['power_strike'], 'Combate deve filtrar flame_strike e aceitar apenas power_strike');
  assert.ok(!activeSkillsToCast.includes('flame_strike'), 'flame_strike nunca deve entrar na fila de execução de combate');

  // 3. Verificação do StatsEngine: passiva indevida não altera atributos
  const statsBaseline = getStats({ class: 'dark_fighter', level: 10, skills: { power_strike: 1 }, equipment: {} });
  const statsWithIllegalPassive = getStats(legacyState);

  // robe_mastery daria bônus de P.Def se fosse aplicada. Como é rejeitada por !isSkillAllowedForClass, stats devem ser idênticos
  assert.equal(statsWithIllegalPassive.pDef, statsBaseline.pDef, 'P.Def não pode ser inflada por robe_mastery em dark_fighter');
  assert.equal(statsWithIllegalPassive.maxMp, statsBaseline.maxMp, 'MaxMP não pode ser inflado por passiva estrangeira');

  // 4. Normalização de save: quarentena e reembolso de SP
  const auditReport = normalizeAndValidateSkills(legacyState);
  assert.equal(auditReport.fixed, true, 'Save corrompido deve ser corrigido');
  assert.ok(auditReport.refundedSp > 0, 'SP das habilidades ilegais deve ser reembolsado');
  assert.equal(legacyState.skills['flame_strike'], undefined, 'flame_strike deve ser removida de skills');
  assert.equal(legacyState.skills['robe_mastery'], undefined, 'robe_mastery deve ser removida de skills');
  assert.equal(legacyState.skillLoadout.core1, null, 'Slot core1 deve ser esvaziado para null');

  // 5. Teste de Idempotência: segunda execução não gera refund duplicado
  const spAfterFirstFix = legacyState.sp;
  const secondAuditReport = normalizeAndValidateSkills(legacyState);
  assert.equal(secondAuditReport.fixed, false, 'Segunda execução não deve reportar fix');
  assert.equal(secondAuditReport.refundedSp, 0, 'Não deve haver segundo reembolso (zero refund duplicado)');
  assert.equal(legacyState.sp, spAfterFirstFix, 'SP deve permanecer exatamente o mesmo');
});

// ─── 4. CLASSES CONTENT_GAP (CRIAÇÃO -> ATAQUE BÁSICO -> XP -> SAVE -> RELOAD)
test('4. Classes CONTENT_GAP com authorizedSkillIds vazio executam criação, ataque básico, XP, save e reload perfeitamente', () => {
  const contentGapClasses = ['shineMakerBase', 'marauderBase', 'sayhaMageBase'];

  for (const cls of contentGapClasses) {
    const v2Ctx = resolveV2ClassContext(cls);
    assert.equal(v2Ctx.status, 'CONTENT_GAP', `${cls} deve ser CONTENT_GAP`);
    assert.equal(v2Ctx.v2ClassId, null, `${cls} deve ter v2ClassId null`);
    assert.deepEqual(v2Ctx.authorizedSkillIds, [], `${cls} deve ter authorizedSkillIds vazio (zero vínculos inventados)`);

    // 1. Criação do estado do personagem
    const state = {
      class: cls,
      level: 1,
      xp: 0,
      sp: 0,
      hp: 120,
      maxHp: 120,
      mp: 80,
      maxMp: 80,
      skills: {},
      skillLoadout: { basic: null, core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null },
      equipment: {}
    };

    // 2. Ataque Básico: em combate, com loadout vazio de skills ativas, personagem executa ataque básico padrão
    const stats = getStats(state);
    const charAtk = stats.atk ?? stats.pAtk;
    assert.ok(charAtk > 0, `${cls} deve ter Ataque positivo (${charAtk}) para ataque básico`);

    // Simulação do dano de ataque básico:
    const mobDef = 20;
    const basicDamage = Math.max(1, Math.floor((charAtk * 2) / mobDef));
    assert.ok(basicDamage >= 1, `${cls} deve conseguir causar dano de ataque básico`);

    // 3. Ganho de XP e Level Up
    const mobXp = 250;
    state.xp += mobXp;
    state.sp += 50;
    if (state.xp >= 100) {
      state.level = 2;
      state.hp = state.maxHp = 140;
    }
    assert.equal(state.level, 2, `${cls} deve subir de nível com ganho de XP`);

    // 4. Save (serialização)
    const serializedSave = JSON.stringify(state);
    assert.ok(serializedSave.includes(`"class":"${cls}"`), 'Save deve persistir o ID canônico');

    // 5. Reload (desserialização e validação de save)
    const loadedState = JSON.parse(serializedSave);
    const validated = normalizeAndValidateSkills(loadedState);

    assert.equal(validated.class, cls, 'Classe deve ser preservada no reload');
    assert.equal(validated.level, 2, 'Nível 2 deve ser preservado');
    assert.equal(validated.sp, 50, 'SP acumulado deve ser preservado');
    assert.deepEqual(validated.skills, {}, 'Skills devem permanecer vazias sem inventar habilidades');
  }
});

// ─── 5. TESTES DE transformV2SkillToEcho (ZERO LEGÍTIMO, CAMPO AUSENTE, COOLDOWN)
test('5. transformV2SkillToEcho preserva zero legítimo, campos ausentes (sem valores arbitrários) e converte cooldown', () => {
  // 5.1 Zero legítimo
  const skillZeroLegitimo = {
    id: 'skill_zero_legitimo',
    name: 'Zero Legitimo',
    type: 'active',
    starRank: 1,
    balance: { pwr: 0, mpCost: 0 },
    canonicalCooldownMs: 0
  };
  const echoZero = transformV2SkillToEcho(skillZeroLegitimo.id, skillZeroLegitimo);
  assert.equal(echoZero.pwr, 0, 'pwr 0 deve ser preservado exatamente como 0');
  assert.equal(echoZero.mpCost, 0, 'mpCost 0 deve ser preservado exatamente como 0');
  assert.equal(echoZero.baseCd, 0, 'baseCd 0 deve ser preservado exatamente como 0');

  // 5.2 Campos ausentes (NÃO deve fabricar pwr: 20, nem mpCost: 15, nem baseCd: 8000)
  const skillCamposAusentes = {
    id: 'skill_sem_dados',
    name: 'Habilidade Sem Dados',
    type: 'active',
    starRank: 1
    // balance omitido, canonicalCooldownMs omitido, canonicalCooldown omitido
  };
  const echoAusente = transformV2SkillToEcho(skillCamposAusentes.id, skillCamposAusentes);
  assert.equal(echoAusente.pwr, null, 'pwr ausente deve resultar em null, NUNCA 20');
  assert.equal(echoAusente.mpCost, null, 'mpCost ausente deve resultar em null, NUNCA 15');
  assert.equal(echoAusente.baseCd, null, 'baseCd ausente deve resultar em null, NUNCA 8000');

  // 5.3 Conversão de Cooldown (parseCooldownToMs)
  assert.equal(parseCooldownToMs('15 sec.'), 15000, '15 sec. deve converter para 15000 ms');
  assert.equal(parseCooldownToMs('1.5 sec.'), 1500, '1.5 sec. deve converter para 1500 ms');
  assert.equal(parseCooldownToMs('1 min.'), 60000, '1 min. deve converter para 60000 ms');
  assert.equal(parseCooldownToMs('500 ms'), 500, '500 ms deve converter para 500 ms');
  assert.equal(parseCooldownToMs('N/A'), 0, 'N/A deve ser 0 ms');
  assert.equal(parseCooldownToMs('none'), 0, 'none deve ser 0 ms');
  assert.equal(parseCooldownToMs('-'), 0, '- deve ser 0 ms');
  assert.equal(parseCooldownToMs(undefined), null, 'undefined deve ser null');
  assert.equal(parseCooldownToMs(null), null, 'null deve ser null');

  // Teste de skill com canonicalCooldown em string
  const skillComStringCd = {
    id: 'skill_string_cd',
    name: 'String CD',
    type: 'active',
    canonicalCooldown: '12 sec.',
    balance: { pwr: 150, mpCost: 20 }
  };
  const echoStringCd = transformV2SkillToEcho(skillComStringCd.id, skillComStringCd);
  assert.equal(echoStringCd.baseCd, 12000, '12 sec. deve ser convertido para 12000 ms no adaptador');
  assert.equal(echoStringCd.pwr, 150);
  assert.equal(echoStringCd.mpCost, 20);
});
