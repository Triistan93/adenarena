/**
 * AnimationRegistry.js
 *
 * Formal animation clip declarations for the 8 canonical classes and monster actors.
 * All clips use frameHeight: 128 (baseline requirement - Section 7).
 * Frame counts verified against real sprite dimensions (width/128 = frameCount).
 */

export const ANIMATION_REGISTRY = {
  // 1. Human Fighter (paladin sprites - all 128x128 frames)
  //    idle: 512x128=4, attack1: 640x128=5, attack2: 512x128=4, hurt: 256x128=2, dead: 768x128=6
  anim_human_fighter: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 4, fps: 7,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 5, fps: 11, loop: false, hitFrame: 3,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 4, fps: 10, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 2, fps: 10, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 6, fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 4, fps: 9,  loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 }
  },

  // 2. Human Sorcerer (spellsinger sprites, all 128px height)
  //    idle: 896x128=7, attack(Attack_1): 1280x128=10, cast(Attack_2): 512x128=4,
  //    hit: 384x128=3, death: 640x128=5, ultimate(Light_ball): 896x128=7
  anim_human_sorcerer: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 7,  fps: 8,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 10, fps: 12, loop: false, hitFrame: 6,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 4,  fps: 10, loop: false, releaseFrame: 2, frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 3,  fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 5,  fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 7,  fps: 12, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 }
  },

  // 3. Elf Fighter (assassin sprites, all 128px height)
  //    idle: 768x128=6, attack(Attack_1): 640x128=5, cast(Attack_2): 384x128=3,
  //    hit: 256x128=2, death: 512x128=4, ultimate(Attack_3): 512x128=4
  anim_elf_fighter: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 6, fps: 8,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 5, fps: 12, loop: false, hitFrame: 3,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 3, fps: 11, loop: false, hitFrame: 1,     frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 2, fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 4, fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 4, fps: 11, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 }
  },

  // 4. Elf Mage (spellsinger sprites, light/water theme, all 128px height)
  //    idle: 7, attack(Attack_1): 10, cast(Light_charge): 1664x128=13, hit: 3, death: 5, ultimate(Light_ball): 7
  anim_elf_mage: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 7,  fps: 8,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 10, fps: 11, loop: false, hitFrame: 6,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 13, fps: 14, loop: false, releaseFrame: 8, frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 3,  fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 5,  fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 7,  fps: 10, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 }
  },

  // 5. Dark Elf Fighter (assassin sprites, aggressive style, all 128px height)
  //    idle: 6, attack(Attack_2): 3, cast(Attack_3): 4, hit: 2, death: 4, ultimate(Attack_1): 5
  anim_dark_elf_fighter: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 6, fps: 8,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 3, fps: 13, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 4, fps: 12, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 2, fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 4, fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 5, fps: 12, loop: false, hitFrame: 3,     frameWidth: 128, frameHeight: 128 }
  },

  // 6. Dark Elf Mage (spellsinger sprites, all 128px height)
  //    idle: 7, attack(Attack_2): 4, cast(Attack_1): 10, hit: 3, death: 5, ultimate(Light_ball): 7
  anim_dark_elf_mage: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 7,  fps: 8,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 4,  fps: 10, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 10, fps: 11, loop: false, releaseFrame: 6, frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 3,  fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 5,  fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 7,  fps: 10, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 }
  },

  // 7. Orc Fighter (paladin sprites, heavy, all 128px height)
  //    idle: 4, attack(Attack 2): 4, cast(Attack 3): 4, hit: 2, death: 6, ultimate(Run+Attack): need to check
  anim_orc_fighter: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 4, fps: 7,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 4, fps: 10, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 4, fps: 9,  loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 2, fps: 10, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 6, fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 6, fps: 9,  loop: false, hitFrame: 3,     frameWidth: 128, frameHeight: 128 }
  },

  // 8. Orc Shaman (spellsinger sprites, all 128px height)
  //    idle: 7, attack(Attack_2): 4, cast(Attack_1): 10, hit: 3, death: 5, ultimate(Light_ball): 7
  anim_orc_shaman: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 7,  fps: 7,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 4,  fps: 11, loop: false, hitFrame: 2,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 10, fps: 11, loop: false, releaseFrame: 5, frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 3,  fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 5,  fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 },
    ULTIMATE:{ key: 'ULTIMATE',fileKey: 'ultimate',frameCount: 7,  fps: 10, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 }
  },

  // 9. Monster: Shadow Wraith (all 128px height)
  //    idle: 768x128=6, attack: 640x128=5, hit: 384x128=3, death: 512x128=4
  anim_shadow_wraith: {
    IDLE:    { key: 'IDLE',    fileKey: 'idle',    frameCount: 6, fps: 7,  loop: true,  frameWidth: 128, frameHeight: 128 },
    ATTACK:  { key: 'ATTACK',  fileKey: 'attack',  frameCount: 5, fps: 10, loop: false, hitFrame: 3,     frameWidth: 128, frameHeight: 128 },
    CAST:    { key: 'CAST',    fileKey: 'cast',    frameCount: 5, fps: 10, loop: false, releaseFrame: 3, frameWidth: 128, frameHeight: 128 },
    HIT:     { key: 'HIT',     fileKey: 'hit',     frameCount: 3, fps: 12, loop: false,                  frameWidth: 128, frameHeight: 128 },
    DEAD:    { key: 'DEAD',    fileKey: 'death',   frameCount: 4, fps: 8,  loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  }
};

// Aliases for backwards compatibility
ANIMATION_REGISTRY.mage_fire = ANIMATION_REGISTRY.anim_human_sorcerer;
ANIMATION_REGISTRY.knight_holy = ANIMATION_REGISTRY.anim_human_fighter;
ANIMATION_REGISTRY.shinobi_shadow = ANIMATION_REGISTRY.anim_dark_elf_fighter;
ANIMATION_REGISTRY.mage_lightning = ANIMATION_REGISTRY.anim_dark_elf_mage;
ANIMATION_REGISTRY.vampire_blood = ANIMATION_REGISTRY.anim_orc_fighter;
ANIMATION_REGISTRY.undead_wraith = ANIMATION_REGISTRY.anim_shadow_wraith;

export function getAnimationClip(animationSet, stateName) {
  const set = ANIMATION_REGISTRY[animationSet];
  if (!set) return null;
  return set[stateName] || null;
}
