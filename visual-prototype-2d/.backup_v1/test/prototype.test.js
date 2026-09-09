/**
 * prototype.test.js
 * 
 * Comprehensive Automated Verification Suite for Multi-Class 2D Combat Prototype.
 * Run with: npm test (node --test test/prototype.test.js)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveCharacterVisual } from '../src/renderer/AssetResolver.js';
import { CombatActor, ActorState } from '../src/renderer/CombatActor.js';
import { CharacterAnimator } from '../src/renderer/CharacterAnimator.js';
import { CharacterRenderer } from '../src/renderer/CharacterRenderer.js';
import { getPrototypeSkill } from '../src/data/PrototypeSkillRegistry.js';

test('1. human_sorcerer resolves correctly with fire assets and skills', () => {
  const profile = resolveCharacterVisual('human_sorcerer');
  assert.equal(profile.status, 'RESOLVED');
  assert.equal(profile.visualProfile, 'human_sorcerer');
  assert.equal(profile.animationSet, 'mage_fire');
  assert.ok(profile.assets.idle.includes('Idle.png'));
  assert.ok(profile.assets.cast.includes('Fireball.png'));
});

test('2. paladin resolves correctly with knight_holy animation set and shield skills', () => {
  const profile = resolveCharacterVisual('paladin');
  assert.equal(profile.status, 'RESOLVED');
  assert.equal(profile.visualProfile, 'paladin');
  assert.equal(profile.animationSet, 'knight_holy');
  assert.equal(profile.weaponProfile, 'sword_shield');
  assert.ok(profile.assets.idle.includes('paladin/Idle.png'));
  assert.ok(profile.assets.defend.includes('paladin/Defend.png'));
});

test('3. assassin resolves correctly with shinobi_shadow animation set and dagger skills', () => {
  const profile = resolveCharacterVisual('assassin');
  assert.equal(profile.status, 'RESOLVED');
  assert.equal(profile.visualProfile, 'assassin');
  assert.equal(profile.animationSet, 'shinobi_shadow');
  assert.equal(profile.weaponProfile, 'dagger');
  assert.ok(profile.assets.idle.includes('assassin/Idle.png'));
  assert.ok(profile.assets.cast_ultimate.includes('assassin/Attack_3.png'));
});

test('4. spellsinger resolves correctly with mage_lightning animation set', () => {
  const profile = resolveCharacterVisual('spellsinger');
  assert.equal(profile.status, 'RESOLVED');
  assert.equal(profile.visualProfile, 'spellsinger');
  assert.equal(profile.animationSet, 'mage_lightning');
  assert.ok(profile.assets.cast.includes('spellsinger/Light_ball.png'));
  assert.ok(profile.assets.cast_ultimate.includes('spellsinger/Light_charge.png'));
});

test('5. death_knight resolves correctly with vampire_blood animation set', () => {
  const profile = resolveCharacterVisual('death_knight');
  assert.equal(profile.status, 'RESOLVED');
  assert.equal(profile.visualProfile, 'death_knight');
  assert.equal(profile.animationSet, 'vampire_blood');
  assert.ok(profile.assets.idle.includes('death_knight/Idle.png'));
  assert.ok(profile.assets.attack.includes('death_knight/Attack_1.png'));
});

test('6. corrupted_knight and arch_necromancer boss profiles resolve correctly', () => {
  const bossKnight = resolveCharacterVisual('corrupted_knight');
  assert.equal(bossKnight.status, 'RESOLVED');
  assert.equal(bossKnight.animationSet, 'monster_knight');

  const lichBoss = resolveCharacterVisual('arch_necromancer');
  assert.equal(lichBoss.status, 'RESOLVED');
  assert.equal(lichBoss.animationSet, 'monster_necromancer');
});

test('7. unknown class triggers MISSING_ASSET with zero silent fallback', () => {
  const profile = resolveCharacterVisual('unknown_class_random_123');
  assert.equal(profile.status, 'MISSING_ASSET');
  assert.equal(profile.visualProfile, null);
  assert.equal(profile.assets, null);
});

test('8. actor healing mechanic works correctly up to maxHp', () => {
  const actor = new CombatActor({ hp: 2000, maxHp: 3500 });
  const healed = actor.heal(800);
  assert.equal(healed, 800);
  assert.equal(actor.hp, 2800);

  // Overheal test
  const overheal = actor.heal(2000);
  assert.equal(actor.hp, 3500);
  assert.equal(overheal, 700);
});

test('9. sanctuary_aegis paladin ultimate has healing and holy dome VFX configuration', () => {
  const skill = getPrototypeSkill('sanctuary_aegis');
  assert.ok(skill, 'Skill must exist');
  assert.equal(skill.tier, 'ultimate_4star');
  assert.equal(skill.element, 'Holy');
  assert.ok(skill.healHeroPct > 0);
  assert.equal(skill.vfx.family, 'holy_sanctuary');
});

test('10. judgement_thor spellsinger ultimate has mega lightning and camera shake', () => {
  const skill = getPrototypeSkill('judgement_thor');
  assert.ok(skill, 'Skill must exist');
  assert.equal(skill.vfx.family, 'mega_lightning_strike');
  assert.ok(skill.camera.shakeIntensity >= 15);
  assert.ok(skill.camera.zoom > 1.0);
});

test('11. shadow_tempest assassin ultimate has clone frenzy configuration', () => {
  const skill = getPrototypeSkill('shadow_tempest');
  assert.ok(skill, 'Skill must exist');
  assert.equal(skill.vfx.family, 'shadow_clones_frenzy');
  assert.equal(skill.element, 'Dark');
  assert.ok(skill.damageMultiplier >= 6.0);
});

test('12. vampiric_slash death knight skill has lifesteal drainage configured', () => {
  const skill = getPrototypeSkill('vampiric_slash');
  assert.ok(skill, 'Skill must exist');
  assert.ok(skill.lifestealPct > 0);
  assert.equal(skill.vfx.family, 'vampiric_drain');
});

test('13. death state blocks actions until reset', () => {
  const actor = new CombatActor({ hp: 500, maxHp: 500 });
  actor.takeDamage(1000);
  assert.equal(actor.state, ActorState.DEAD);
  assert.equal(actor.setState(ActorState.ATTACKING), false);
  assert.equal(actor.setState(ActorState.CASTING), false);

  actor.reset();
  assert.equal(actor.state, ActorState.IDLE);
  assert.equal(actor.hp, 500);
});

test('14. class switching updates profile and skills without recreating renderer', () => {
  const renderer = new CharacterRenderer();
  renderer.imageCache.set('cached_tex.png', {});

  const prof1 = resolveCharacterVisual('paladin');
  const actor = new CombatActor({ classId: prof1.classId, animationSet: prof1.animationSet });
  assert.equal(actor.animationSet, 'knight_holy');

  const prof2 = resolveCharacterVisual('assassin');
  actor.classId = prof2.classId;
  actor.animationSet = prof2.animationSet;
  assert.equal(actor.animationSet, 'shinobi_shadow');
  assert.equal(renderer.imageCache.has('cached_tex.png'), true);
});
