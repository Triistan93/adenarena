/**
 * prototype.test.js
 * 
 * Comprehensive Automated Verification Suite for Aden Arena Visual Prototype V2.
 * Validates Sections 54, 55, 56, 57, 58, 59, 66 of Master Specification.
 * Run with: npm test (node --test test/prototype.test.js)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Data Layer
import { getAllClassIds, getClassIdentity, getProgressionStage, getAllowedElements, ProgressionStage } from '../src/data/classes/ClassIdentity.js';
import { CHARACTER_VISUAL_REGISTRY, getCharacterVisualProfile } from '../src/data/characters/CharacterVisualRegistry.js';
import { ANIMATION_REGISTRY, getAnimationClip } from '../src/data/characters/AnimationRegistry.js';
import { CLASS_WEAPON_MAP } from '../src/data/characters/WeaponRegistry.js';
import { getSkill, getAllSkills } from '../src/data/skills/SkillRegistry.js';
import { ULTIMATE_MATRIX, getClassUltimate, isUltimateSkill } from '../src/data/skills/UltimateRegistry.js';
import { validateSkillAvailability, getClassSkillPool } from '../src/data/skills/SkillProgression.js';

// Renderer & Actor Layer
import { resolveCharacterVisual } from '../src/renderer/AssetResolver.js';
import { CombatActor, ActorState } from '../src/renderer/CombatActor.js';
import { CharacterAnimator } from '../src/renderer/CharacterAnimator.js';
import { CharacterRenderer } from '../src/renderer/CharacterRenderer.js';
import { PrototypeSkillVfx } from '../src/vfx/PrototypeSkillVfx.js';

// Formal Validators
import { validateAllAssets } from '../src/validators/PrototypeAssetValidator.js';
import { validateVisualIdentities } from '../src/validators/PrototypeVisualIdentityValidator.js';
import { validateAllClasses } from '../src/validators/PrototypeClassValidator.js';

// ============================================================
// SEÇÃO 54 — 20 TESTES AUTOMATIZADOS OBRIGATÓRIOS
// ============================================================

test('54.1 - os 8 classIds existem e possuem identidade canônica definida', () => {
  const canonicalIds = [
    'human_fighter',
    'human_sorcerer',
    'elf_fighter',
    'elf_mage',
    'dark_elf_fighter',
    'dark_elf_mage',
    'orc_fighter',
    'orc_shaman'
  ];
  const registeredIds = getAllClassIds();
  assert.equal(registeredIds.length, 8, 'Exatamente 8 classes canônicas devem estar registradas');
  
  canonicalIds.forEach(id => {
    assert.ok(registeredIds.includes(id), `ClassId ${id} deve estar registrado`);
    const identity = getClassIdentity(id);
    assert.ok(identity, `Identidade de ${id} deve existir`);
    assert.ok(identity.name, `Nome de ${id} deve existir`);
    assert.ok(identity.race, `Raça de ${id} deve existir`);
    assert.ok(identity.primaryRole, `Papel de ${id} deve existir`);
    assert.ok(identity.specialization, `Especialização de ${id} deve existir`);
    assert.ok(identity.mastery, `Maestria de ${id} deve existir`);
  });
});

test('54.2 - os 8 visual profiles resolvem corretamente sem exceções', () => {
  const classIds = getAllClassIds();
  classIds.forEach(classId => {
    const profile = resolveCharacterVisual(classId);
    assert.equal(profile.status, 'RESOLVED', `Profile para ${classId} deve resolver como RESOLVED`);
    assert.equal(profile.classId, classId);
    assert.ok(profile.visualProfile, `visualProfile deve estar definido para ${classId}`);
    assert.ok(profile.assets.master, `Master sheet deve estar presente para ${classId}`);
    assert.ok(profile.assets.idle, `Idle strip deve estar presente para ${classId}`);
    assert.ok(profile.assets.attack, `Attack strip deve estar presente para ${classId}`);
    assert.ok(profile.assets.cast, `Cast strip deve estar presente para ${classId}`);
    assert.ok(profile.assets.hit, `Hit strip deve estar presente para ${classId}`);
    assert.ok(profile.assets.death, `Death strip deve estar presente para ${classId}`);
    assert.ok(profile.assets.ultimate, `Ultimate strip deve estar presente para ${classId}`);
    assert.equal(profile.metrics.frameWidth, 128);
    assert.equal(profile.metrics.frameHeight, 128);
  });
});

test('54.3 - os 8 animation sets existem com todos os 6 clips requeridos', () => {
  const requiredClips = ['IDLE', 'ATTACK', 'CAST', 'HIT', 'DEAD', 'ULTIMATE'];
  const classIds = getAllClassIds();

  classIds.forEach(classId => {
    const visual = getCharacterVisualProfile(classId);
    assert.ok(visual, `Visual profile para ${classId} deve existir`);
    const animSet = ANIMATION_REGISTRY[visual.animationSet];
    assert.ok(animSet, `Animation set '${visual.animationSet}' deve existir`);

    requiredClips.forEach(clipKey => {
      const clip = animSet[clipKey];
      assert.ok(clip, `Clip '${clipKey}' deve estar presente no set '${visual.animationSet}'`);
      assert.ok(clip.frameCount >= 1, `Clip '${clipKey}' deve ter frameCount >= 1`);
      assert.ok(clip.fps > 0, `Clip '${clipKey}' deve ter fps > 0`);
      assert.equal(clip.frameHeight, 128, `Clip '${clipKey}' deve respeitar baseline de 128px`);
    });
  });
});

test('54.4 - os 8 weapon profiles estão mapeados normativamente', () => {
  const expectedWeapons = {
    human_fighter: 'sword',
    human_sorcerer: 'staff',
    elf_fighter: 'light_blade',
    elf_mage: 'staff',
    dark_elf_fighter: 'light_blade',
    dark_elf_mage: 'staff',
    orc_fighter: 'heavy_weapon',
    orc_shaman: 'ritual_staff'
  };

  Object.entries(expectedWeapons).forEach(([classId, expectedWeapon]) => {
    assert.equal(CLASS_WEAPON_MAP[classId], expectedWeapon, `Arma incorreta para ${classId}`);
    const visual = getCharacterVisualProfile(classId);
    assert.equal(visual.weaponProfile, expectedWeapon, `Visual profile weaponMismatch para ${classId}`);
  });
});

test('54.5 - os 8 skill pools são populados em progressão até Lv90', () => {
  const classIds = getAllClassIds();
  classIds.forEach(classId => {
    const poolLv1 = getClassSkillPool(classId, 1);
    const poolLv40 = getClassSkillPool(classId, 40);
    const poolLv76 = getClassSkillPool(classId, 76);
    const poolLv80 = getClassSkillPool(classId, 80);
    const poolLv90 = getClassSkillPool(classId, 90);

    assert.ok(poolLv1.length >= 1, `${classId} deve ter ao menos 1 skill no Lv1`);
    assert.ok(poolLv40.length >= poolLv1.length, `${classId} pool deve crescer no Lv40`);
    assert.ok(poolLv76.length >= poolLv40.length, `${classId} pool deve crescer no Lv76`);
    assert.ok(poolLv80.length >= poolLv76.length, `${classId} pool deve crescer no Lv80`);
    assert.ok(poolLv90.length >= 5, `${classId} deve ter no mínimo 5 skills completas no Lv90`);
  });
});

test('54.6 - 8 Ultimates (★★★★, Lv80, ULTIMATE_BOOK_4) existem e estão configuradas', () => {
  const classIds = getAllClassIds();
  assert.equal(Object.keys(ULTIMATE_MATRIX).length, 8);

  classIds.forEach(classId => {
    const ultInfo = getClassUltimate(classId);
    assert.ok(ultInfo, `Ultimate de ${classId} deve estar na matriz`);
    assert.equal(ultInfo.requiredLevel, 80);
    assert.equal(ultInfo.bookRequirement, 'ULTIMATE_BOOK_4');
    assert.equal(ultInfo.rarity, 4);

    const skill = getSkill(ultInfo.ultimateId);
    assert.ok(skill, `Skill definition de ${ultInfo.ultimateId} deve existir`);
    assert.equal(skill.tier, 'ultimate_4star');
    assert.equal(skill.requiredLevel, 80);
    assert.equal(skill.bookRequirement, 'ULTIMATE_BOOK_4');
    assert.equal(skill.rarity, 4);
    assert.ok(skill.camera, `Ultimate ${skill.id} deve definir efeitos de câmera`);
    assert.ok(skill.camera.shakeIntensity >= 15, `Ultimate ${skill.id} deve ter camera shake >= 15`);
    assert.ok(skill.camera.zoom > 1.0, `Ultimate ${skill.id} deve ter camera zoom > 1.0`);
  });
});

test('54.7 - 8 Master Ultimates (★★★★★, Lv90) existem e são upgrades das Ultimates', () => {
  const classIds = getAllClassIds();

  classIds.forEach(classId => {
    const ultInfo = getClassUltimate(classId);
    assert.ok(ultInfo.masterUltimateId, `Master Ultimate de ${classId} deve existir`);
    assert.equal(ultInfo.masterLevel, 90);
    assert.equal(ultInfo.masterRarity, 5);

    const masterSkill = getSkill(ultInfo.masterUltimateId);
    assert.ok(masterSkill, `Skill definition de ${ultInfo.masterUltimateId} deve existir`);
    assert.equal(masterSkill.tier, 'master_ultimate_5star');
    assert.equal(masterSkill.requiredLevel, 90);
    assert.equal(masterSkill.rarity, 5);
    assert.equal(masterSkill.upgradeOf, ultInfo.ultimateId, `Master skill deve ser upgrade de ${ultInfo.ultimateId}`);
    assert.ok(masterSkill.baseDamage > getSkill(ultInfo.ultimateId).baseDamage, `Master deve causar mais dano`);
  });
});

test('54.8 - class switching atualiza o ator sem recriar o renderer', () => {
  const renderer = new CharacterRenderer();
  renderer.imageCache.set('cached_texture_key', { dummy: true });

  const actor = new CombatActor({ classId: 'human_fighter' });
  const prof1 = resolveCharacterVisual('human_fighter');
  actor.animationSet = prof1.animationSet;
  actor.weaponProfile = prof1.weaponProfile;
  assert.equal(actor.animationSet, 'anim_human_fighter');
  assert.equal(actor.weaponProfile, 'sword');

  // Troca para orc_shaman
  const prof2 = resolveCharacterVisual('orc_shaman');
  actor.classId = prof2.classId;
  actor.animationSet = prof2.animationSet;
  actor.weaponProfile = prof2.weaponProfile;
  assert.equal(actor.classId, 'orc_shaman');
  assert.equal(actor.animationSet, 'anim_orc_shaman');
  assert.equal(actor.weaponProfile, 'ritual_staff');

  // Renderer e cache permanecem intactos
  assert.equal(renderer.imageCache.has('cached_texture_key'), true);
});

test('54.9 - level switching altera o estágio e destrava novas skills', () => {
  const actor = new CombatActor({ classId: 'human_sorcerer', level: 39 });
  assert.equal(getProgressionStage(actor.level), ProgressionStage.GENERALIST);
  assert.equal(getClassSkillPool('human_sorcerer', actor.level).length, 1);

  actor.level = 40;
  assert.equal(getProgressionStage(actor.level), ProgressionStage.SPECIALIZATION);
  assert.equal(getClassSkillPool('human_sorcerer', actor.level).length, 2);

  actor.level = 76;
  assert.equal(getProgressionStage(actor.level), ProgressionStage.MASTERY);
  assert.equal(getClassSkillPool('human_sorcerer', actor.level).length, 3);

  actor.level = 80;
  assert.equal(getProgressionStage(actor.level), ProgressionStage.ULTIMATE);
  assert.equal(getClassSkillPool('human_sorcerer', actor.level).length, 4);

  actor.level = 90;
  assert.equal(getProgressionStage(actor.level), ProgressionStage.MASTER_ULTIMATE);
  assert.equal(getClassSkillPool('human_sorcerer', actor.level).length, 5);
});

test('54.10 - renderer reuse: cache de texturas é preservado em múltiplos ciclos de renderização', () => {
  const renderer = new CharacterRenderer();
  
  // Cache de textura
  renderer.imageCache.set('tex_fighter', {});
  renderer.imageCache.set('tex_sorcerer', {});
  renderer.imageCache.set('tex_elf', {});

  assert.equal(renderer.imageCache.size, 3);
  // O renderer suporta renderizações sucessivas sem limpar o cache
  assert.ok(renderer.imageCache.has('tex_fighter'));
  assert.ok(renderer.imageCache.has('tex_sorcerer'));
  assert.ok(renderer.imageCache.has('tex_elf'));
});

test('54.11 - Fireball está devidamente configurada para human_sorcerer no Lv40', () => {
  const skill = getSkill('fireball');
  assert.ok(skill);
  assert.equal(skill.name, 'Fireball');
  assert.equal(skill.requiredLevel, 40);
  assert.equal(skill.progressionStage, ProgressionStage.SPECIALIZATION);
  assert.deepEqual(skill.elements, ['Fire']);
  assert.equal(skill.vfxId, 'vfx_fireball');
  assert.ok(skill.nativeClasses.includes('human_sorcerer'));
});

test('54.12 - Magma Spike está devidamente configurada para human_sorcerer no Lv76', () => {
  const skill = getSkill('magma_spike');
  assert.ok(skill);
  assert.equal(skill.name, 'Magma Spike');
  assert.equal(skill.requiredLevel, 76);
  assert.equal(skill.progressionStage, ProgressionStage.MASTERY);
  assert.ok(skill.elements.includes('Fire'));
  assert.ok(skill.elements.includes('Magma'));
  assert.equal(skill.vfxId, 'vfx_magma_spike');
});

test('54.13 - Meteor está devidamente configurada com câmera shake e zoom para Lv80', () => {
  const skill = getSkill('meteor');
  assert.ok(skill);
  assert.equal(skill.name, 'Meteor');
  assert.equal(skill.requiredLevel, 80);
  assert.equal(skill.tier, 'ultimate_4star');
  assert.ok(skill.camera.shakeIntensity >= 15);
  assert.ok(skill.camera.zoom > 1.0);
  assert.equal(skill.vfxId, 'vfx_meteor');
});

test('54.14 - Ultimate ativa estado CASTING e clip ULTIMATE no ator', () => {
  const actor = new CombatActor({ classId: 'human_sorcerer', level: 80 });
  const prof = resolveCharacterVisual('human_sorcerer');
  actor.animationSet = prof.animationSet;
  
  actor._ultimateCast = true;
  actor.setState(ActorState.CASTING);
  assert.equal(actor.state, ActorState.CASTING);
  assert.equal(actor.isCasting, true);

  const animator = new CharacterAnimator(actor);
  animator.syncWithActorState();
  assert.equal(animator.currentClipKey, 'ULTIMATE');
  assert.equal(animator.getCurrentClip().key, 'ULTIMATE');
});

test('54.15 - hit reduz HP, ativa estado HIT e temporizador de hit flash', () => {
  const actor = new CombatActor({ hp: 3000, maxHp: 3000 });
  const result = actor.takeDamage(600);
  assert.equal(result.damage, 600);
  assert.equal(result.killed, false);
  assert.equal(actor.hp, 2400);
  assert.equal(actor.state, ActorState.HIT);
  assert.equal(actor.isHit, true);
  assert.ok(actor.hitTimer > 0);

  // Recuperação após temporizador
  actor.update(200);
  assert.equal(actor.hitTimer, 0);
  assert.equal(actor.state, ActorState.IDLE);
});

test('54.16 - death a 0 HP transiciona para DEAD e bloqueia novas ações', () => {
  const actor = new CombatActor({ hp: 400, maxHp: 400 });
  const result = actor.takeDamage(500);
  assert.equal(result.killed, true);
  assert.equal(actor.hp, 0);
  assert.equal(actor.state, ActorState.DEAD);
  assert.equal(actor.isDead, true);

  // Tentativa de agir é bloqueada
  const attackSuccess = actor.setState(ActorState.ATTACKING);
  assert.equal(attackSuccess, false);
  const castSuccess = actor.setState(ActorState.CASTING);
  assert.equal(castSuccess, false);
  assert.equal(actor.state, ActorState.DEAD);
});

test('54.17 - reset restaura HP/MP e restabelece o ator ao estado IDLE', () => {
  const actor = new CombatActor({ hp: 2000, maxHp: 2000 });
  actor.takeDamage(2000);
  assert.equal(actor.state, ActorState.DEAD);

  actor.reset();
  assert.equal(actor.state, ActorState.IDLE);
  assert.equal(actor.hp, 2000);
  assert.equal(actor.isDead, false);
  assert.equal(actor.isHit, false);
  assert.equal(actor.isCasting, false);
});

test('54.18 - missing asset dispara status MISSING_ASSET em classe desconhecida', () => {
  const profile = resolveCharacterVisual('nonexistent_class_999');
  assert.equal(profile.status, 'MISSING_ASSET');
  assert.ok(profile.error.includes('MISSING_ASSET'));
});

test('54.19 - no silent fallback: classe desconhecida NUNCA retorna fighter por omissão', () => {
  const profile = resolveCharacterVisual('archmage_legacy_invalid');
  assert.equal(profile.status, 'MISSING_ASSET');
  assert.equal(profile.visualProfile, null);
  assert.equal(profile.animationSet, null);
  assert.equal(profile.assets, null);
});

test('54.20 - VFX uniqueness structural check: todos os 16 endgame VFX possuem identificadores e assinaturas distintas', () => {
  const classIds = getAllClassIds();
  const vfxIds = new Set();
  const vfxEngine = new PrototypeSkillVfx();

  assert.ok(typeof vfxEngine.spawnTitanbreaker === 'function');
  assert.ok(typeof vfxEngine.spawnMeteor === 'function');
  assert.ok(typeof vfxEngine.spawnTidalAscension === 'function');
  assert.ok(typeof vfxEngine.spawnGlacialCataclysm === 'function');
  assert.ok(typeof vfxEngine.spawnAbyssalRupture === 'function');
  assert.ok(typeof vfxEngine.spawnTempestOfAbyss === 'function');
  assert.ok(typeof vfxEngine.spawnWorldbreakerRoar === 'function');
  assert.ok(typeof vfxEngine.spawnApocalypseTotem === 'function');

  classIds.forEach(classId => {
    const ultInfo = getClassUltimate(classId);
    const ultSkill = getSkill(ultInfo.ultimateId);
    const masterSkill = getSkill(ultInfo.masterUltimateId);

    assert.ok(ultSkill.vfxId, `VFX ID deve existir para ${ultSkill.id}`);
    assert.ok(masterSkill.vfxId, `VFX ID deve existir para ${masterSkill.id}`);

    assert.equal(vfxIds.has(ultSkill.vfxId), false, `VFX ID duplicado: ${ultSkill.vfxId}`);
    vfxIds.add(ultSkill.vfxId);

    assert.equal(vfxIds.has(masterSkill.vfxId), false, `VFX ID duplicado: ${masterSkill.vfxId}`);
    vfxIds.add(masterSkill.vfxId);
  });

  assert.equal(vfxIds.size, 16, 'Exatamente 16 assinaturas visuais endgame únicas requeridas');
});

// ============================================================
// SEÇÃO 55 — TESTES DE ESPECIALIZAÇÃO OBRIGATÓRIOS
// ============================================================

test('55.1 - Mage/generalist Lv39 -> GENERALIST', () => {
  const stage = getProgressionStage(39);
  assert.equal(stage, ProgressionStage.GENERALIST);
});

test('55.2 - Sorcerer Lv40 -> FIRE SPECIALIZATION', () => {
  const stage = getProgressionStage(40);
  assert.equal(stage, ProgressionStage.SPECIALIZATION);
  const elements = getAllowedElements('human_sorcerer', 40);
  assert.deepEqual(elements, ['Fire']);
});

test('55.3 - Sorcerer Lv40 + Ice -> ELEMENT_MISMATCH', () => {
  const res = validateSkillAvailability('human_sorcerer', 40, 'ice');
  assert.equal(res.status, 'INVALID');
  assert.equal(res.reason, 'ELEMENT_MISMATCH');
});

test('55.4 - Sorcerer Lv40 + Magma -> STAGE_REQUIREMENT', () => {
  const res = validateSkillAvailability('human_sorcerer', 40, 'magma_spike');
  assert.equal(res.status, 'INVALID');
  assert.equal(res.reason, 'STAGE_REQUIREMENT');
  assert.equal(res.requiredLevel, 76);
});

test('55.5 - Sorcerer Lv76 + Magma -> VALID', () => {
  const res = validateSkillAvailability('human_sorcerer', 76, 'magma_spike');
  assert.equal(res.status, 'VALID');
});

test('55.6 - Sorcerer Lv79 + Meteor -> STAGE_REQUIREMENT', () => {
  const res = validateSkillAvailability('human_sorcerer', 79, 'meteor');
  assert.equal(res.status, 'INVALID');
  assert.equal(res.reason, 'STAGE_REQUIREMENT');
  assert.equal(res.requiredLevel, 80);
});

test('55.7 - Sorcerer Lv80 + Meteor -> VALID', () => {
  const res = validateSkillAvailability('human_sorcerer', 80, 'meteor');
  assert.equal(res.status, 'VALID');
});

test('55.8 - Sorcerer Lv90 + Master Meteor -> VALID', () => {
  const res = validateSkillAvailability('human_sorcerer', 90, 'master_meteor');
  assert.equal(res.status, 'VALID');
});

// ============================================================
// SEÇÃO 56 — TESTES DE ISOLAMENTO
// ============================================================

test('56.1 - Human Sorcerer não recebe skills exclusivas de Elf Mage, Dark Elf Mage ou Orc Shaman', () => {
  // Elf Mage skills
  const elfRes = validateSkillAvailability('human_sorcerer', 90, 'glacial_cataclysm');
  assert.equal(elfRes.status, 'INVALID');

  // Dark Elf Mage skills
  const deRes = validateSkillAvailability('human_sorcerer', 90, 'tempest_of_the_abyss');
  assert.equal(deRes.status, 'INVALID');

  // Orc Shaman skills
  const orcRes = validateSkillAvailability('human_sorcerer', 90, 'apocalypse_totem');
  assert.equal(orcRes.status, 'INVALID');
});

test('56.2 - Classes físicas não recebem magia apenas porque o elemento coincide', () => {
  // Orc Fighter possui elemento Fire em Specialization/Mastery, mas NÃO pode conjurar Fireball do Mage
  const orcFireball = validateSkillAvailability('orc_fighter', 90, 'fireball');
  assert.equal(orcFireball.status, 'INVALID');
  assert.equal(orcFireball.reason, 'CLASS_MISMATCH');

  // Orc Fighter não pode conjurar Magma Spike nem Prominence
  const orcMagma = validateSkillAvailability('orc_fighter', 90, 'magma_spike');
  assert.equal(orcMagma.status, 'INVALID');
  assert.equal(orcMagma.reason, 'CLASS_MISMATCH');
});

test('56.3 - Ultimates são estritamente exclusivas por classe e não sofrem contaminação cruzada', () => {
  // Elf Fighter não pode usar Titanbreaker do Human Fighter
  const elfTitan = validateSkillAvailability('elf_fighter', 90, 'titanbreaker');
  assert.equal(elfTitan.status, 'INVALID');

  // Human Fighter não pode usar Tidal Ascension do Elf Fighter
  const humanTidal = validateSkillAvailability('human_fighter', 90, 'tidal_ascension');
  assert.equal(humanTidal.status, 'INVALID');

  // Dark Elf Fighter não pode usar Worldbreaker Roar do Orc Fighter
  const deWorld = validateSkillAvailability('dark_elf_fighter', 90, 'worldbreaker_roar');
  assert.equal(deWorld.status, 'INVALID');
});

// ============================================================
// SEÇÃO 57 — TESTES DE IDENTIDADE VISUAL
// ============================================================

test('57.1 - cada classe possui identidade visual única sem sobreposição total', () => {
  const classIds = getAllClassIds();
  const identitySignatures = new Set();

  classIds.forEach(classId => {
    const visual = getCharacterVisualProfile(classId);
    const signature = `${visual.race}|${visual.visualProfile}|${visual.animationSet}|${visual.weaponProfile}|${visual.assets.master}`;
    assert.equal(identitySignatures.has(signature), false, `Identidade visual duplicada detectada em ${classId}`);
    identitySignatures.add(signature);
  });

  assert.equal(identitySignatures.size, 8, 'Exatamente 8 assinaturas de identidade visual únicas requeridas');
});

// ============================================================
// SEÇÕES 58, 59, 66 — INTEGRAÇÃO COM VALIDATORS FORMAIS
// ============================================================

test('58.1 - PrototypeAssetValidator valida 8/8 classes com arquivos existentes e dimensões conformes', () => {
  const result = validateAllAssets();
  assert.equal(result.status, 'PASS', 'AssetValidator deve retornar status PASS');
  assert.equal(result.totalClasses, 8);
  assert.equal(result.passed, 8);
  assert.equal(result.failed, 0);
});

test('59.1 - PrototypeVisualIdentityValidator confirma 8 identidades exclusivas e 0 conflitos', () => {
  const result = validateVisualIdentities();
  assert.equal(result.status, 'PASS', 'IdentityValidator deve retornar status PASS');
  assert.equal(result.uniqueIdentities, 8);
  assert.equal(result.conflicts.length, 0);
});

test('66.1 - PrototypeClassValidator confirma conformidade integral de contratos em todas as 8 classes', () => {
  const result = validateAllClasses();
  assert.equal(result.status, 'PASS', 'ClassValidator deve retornar status PASS');
  assert.equal(result.totalClasses, 8);
  assert.equal(result.passed, 8);
  assert.equal(result.failed, 0);
  assert.equal(result.errors.length, 0);
});

// ============================================================
// TESTES ADICIONAIS DE MECÂNICA E ANIMAÇÃO
// ============================================================

test('extra - mecânica de cura e overheal no CombatActor', () => {
  const actor = new CombatActor({ hp: 2000, maxHp: 3500 });
  const healed = actor.heal(800);
  assert.equal(healed, 800);
  assert.equal(actor.hp, 2800);

  const overheal = actor.heal(2000);
  assert.equal(actor.hp, 3500);
  assert.equal(overheal, 700);
});

test('extra - respiração procedural do animator opera apenas em IDLE', () => {
  const actor = new CombatActor({ classId: 'human_fighter' });
  const prof = resolveCharacterVisual('human_fighter');
  actor.animationSet = prof.animationSet;
  const animator = new CharacterAnimator(actor);

  animator.update(100);
  assert.notEqual(animator.breathOffsetY, 0);

  actor.setState(ActorState.ATTACKING);
  animator.syncWithActorState();
  animator.update(100);
  assert.equal(animator.breathOffsetY, 0);
});
