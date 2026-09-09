/**
 * AnimationRegistry.js
 * 
 * Formal animation clip definitions for all hero and monster character sets.
 * Declares frame dimensions, frame counts, timing, looping, and keyframe events.
 */

export const ANIMATION_REGISTRY = {
  // 1. Fire Mage (Human Sorcerer / Archmage)
  mage_fire: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 7, fps: 8, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 4, fps: 10, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 8, fps: 12, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 14, fps: 12, loop: false, releaseFrame: 7, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 3, fps: 12, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 6, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 2. Holy Knight (Paladin / Phoenix Knight)
  knight_holy: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 4, fps: 7, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 5, fps: 11, loop: false, hitFrame: 3, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 4, fps: 10, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 4, fps: 9, loop: false, releaseFrame: 2, frameWidth: 128, frameHeight: 128 },
    DEFEND: { key: 'DEFEND', fileKey: 'defend', frameCount: 5, fps: 10, loop: false, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 2, fps: 10, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 6, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 3. Shadow Shinobi (Assassin / Ghost Hunter)
  shinobi_shadow: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 6, fps: 8, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 5, fps: 13, loop: false, hitFrame: 3, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 3, fps: 12, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 4, fps: 12, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    DEFEND: { key: 'DEFEND', fileKey: 'defend', frameCount: 4, fps: 10, loop: false, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 2, fps: 12, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 4, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 4. Lightning Mage (Spellsinger / Storm Screamer)
  mage_lightning: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 7, fps: 8, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 4, fps: 10, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 7, fps: 11, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 13, fps: 12, loop: false, releaseFrame: 7, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 3, fps: 12, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 5, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 5. Blood Vampire (Death Knight / Vampiric Knight)
  vampire_blood: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 5, fps: 7, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 5, fps: 11, loop: false, hitFrame: 3, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 3, fps: 10, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 4, fps: 10, loop: false, releaseFrame: 2, frameWidth: 128, frameHeight: 128 },
    DEFEND: { key: 'DEFEND', fileKey: 'defend', frameCount: 2, fps: 8, loop: false, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 1, fps: 8, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 8, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 6. Monster: Undead Shadow Wraith
  undead_wraith: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 6, fps: 7, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 5, fps: 10, loop: false, hitFrame: 3, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 5, fps: 10, loop: false, releaseFrame: 3, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 3, fps: 12, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 4, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 7. Monster: Corrupted Knight Boss
  monster_knight: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 4, fps: 7, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 5, fps: 10, loop: false, hitFrame: 3, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 4, fps: 10, loop: false, hitFrame: 2, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 2, fps: 10, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 6, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  },

  // 8. Monster: Arch Necromancer Lich Boss
  monster_necromancer: {
    IDLE: { key: 'IDLE', fileKey: 'idle', frameCount: 6, fps: 7, loop: true, frameWidth: 128, frameHeight: 128 },
    ATTACK: { key: 'ATTACK', fileKey: 'attack', frameCount: 9, fps: 11, loop: false, hitFrame: 5, frameWidth: 128, frameHeight: 128 },
    CAST: { key: 'CAST', fileKey: 'cast', frameCount: 10, fps: 11, loop: false, releaseFrame: 6, frameWidth: 128, frameHeight: 128 },
    CAST_ULTIMATE: { key: 'CAST_ULTIMATE', fileKey: 'cast_ultimate', frameCount: 7, fps: 10, loop: false, releaseFrame: 4, frameWidth: 128, frameHeight: 128 },
    HIT: { key: 'HIT', fileKey: 'hit', frameCount: 3, fps: 12, loop: false, frameWidth: 128, frameHeight: 128 },
    DEAD: { key: 'DEAD', fileKey: 'dead', frameCount: 4, fps: 8, loop: false, holdLastFrame: true, frameWidth: 128, frameHeight: 128 }
  }
};

// Aliases for compatibility
ANIMATION_REGISTRY.mage_fire_transcendent = ANIMATION_REGISTRY.mage_fire;
ANIMATION_REGISTRY.fighter_dual_swords = ANIMATION_REGISTRY.knight_holy;

export function getAnimationClip(animationSet, stateName) {
  const set = ANIMATION_REGISTRY[animationSet];
  if (!set) return null;
  return set[stateName] || null;
}
