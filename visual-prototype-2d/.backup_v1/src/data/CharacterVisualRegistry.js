/**
 * CharacterVisualRegistry.js
 * 
 * Formal registry that maps classId -> visual profile -> animation set -> weapon profile.
 * Supports:
 * - Heroes: Human Sorcerer, Paladin, Assassin, Spellsinger, Death Knight (plus Archmage & Duelist aliases)
 * - Monsters: Shadow Wraith, Corrupted Knight, Arch Necromancer
 */

export const CHARACTER_VISUAL_REGISTRY = {
  // --- HEROES ---
  human_sorcerer: {
    visualProfile: 'human_sorcerer',
    animationSet: 'mage_fire',
    weaponProfile: 'staff',
    name: 'Human Sorcerer',
    archetype: 'mage',
    race: 'human',
    gender: 'm',
    skills: ['fire_attack', 'fireball', 'magma_spike', 'meteor'],
    assets: {
      idle: 'public/assets/hero/Idle.png',
      attack: 'public/assets/hero/Attack_1.png',
      cast: 'public/assets/hero/Fireball.png',
      cast_ultimate: 'public/assets/hero/Flame_jet.png',
      hit: 'public/assets/hero/Hurt.png',
      dead: 'public/assets/hero/Dead.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  paladin: {
    visualProfile: 'paladin',
    animationSet: 'knight_holy',
    weaponProfile: 'sword_shield',
    name: 'Paladin (Phoenix Knight)',
    archetype: 'knight',
    race: 'human',
    gender: 'm',
    skills: ['sword_strike', 'shield_bash', 'holy_blade', 'sanctuary_aegis'],
    assets: {
      idle: 'public/assets/paladin/Idle.png',
      attack: 'public/assets/paladin/Attack 1.png',
      cast: 'public/assets/paladin/Attack 2.png',
      cast_ultimate: 'public/assets/paladin/Attack 3.png',
      defend: 'public/assets/paladin/Defend.png',
      hit: 'public/assets/paladin/Hurt.png',
      dead: 'public/assets/paladin/Dead.png',
      staticPortrait: 'public/assets/static/m_paladin.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  assassin: {
    visualProfile: 'assassin',
    animationSet: 'shinobi_shadow',
    weaponProfile: 'dagger',
    name: 'Ghost Hunter (Assassin)',
    archetype: 'rogue',
    race: 'darkelf',
    gender: 'm',
    skills: ['dagger_slash', 'shadow_step', 'backstab', 'shadow_tempest'],
    assets: {
      idle: 'public/assets/assassin/Idle.png',
      attack: 'public/assets/assassin/Attack_1.png',
      cast: 'public/assets/assassin/Attack_2.png',
      cast_ultimate: 'public/assets/assassin/Attack_3.png',
      defend: 'public/assets/assassin/Shield.png',
      hit: 'public/assets/assassin/Hurt.png',
      dead: 'public/assets/assassin/Dead.png',
      staticPortrait: 'public/assets/static/m_treasurehunter.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  spellsinger: {
    visualProfile: 'spellsinger',
    animationSet: 'mage_lightning',
    weaponProfile: 'staff',
    name: 'Spellsinger (Storm Archmage)',
    archetype: 'mage',
    race: 'elf',
    gender: 'm',
    skills: ['lightning_spark', 'chain_lightning', 'thunder_orb', 'judgement_thor'],
    assets: {
      idle: 'public/assets/spellsinger/Idle.png',
      attack: 'public/assets/spellsinger/Attack_2.png',
      cast: 'public/assets/spellsinger/Light_ball.png',
      cast_ultimate: 'public/assets/spellsinger/Light_charge.png',
      hit: 'public/assets/spellsinger/Hurt.png',
      dead: 'public/assets/spellsinger/Dead.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  death_knight: {
    visualProfile: 'death_knight',
    animationSet: 'vampire_blood',
    weaponProfile: 'dark_blade',
    name: 'Death Knight (Vampiric Lord)',
    archetype: 'fighter',
    race: 'human',
    gender: 'm',
    skills: ['dark_strike', 'vampiric_slash', 'blood_barrier', 'crimson_supernova'],
    assets: {
      idle: 'public/assets/death_knight/Idle.png',
      attack: 'public/assets/death_knight/Attack_1.png',
      cast: 'public/assets/death_knight/Attack_2.png',
      cast_ultimate: 'public/assets/death_knight/Attack_3.png',
      defend: 'public/assets/death_knight/Protect.png',
      hit: 'public/assets/death_knight/Hurt.png',
      dead: 'public/assets/death_knight/Dead.png',
      staticPortrait: 'public/assets/static/m_deathknight.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // Aliases for compatibility
  archmage: {
    visualProfile: 'archmage',
    animationSet: 'mage_fire_transcendent',
    weaponProfile: 'staff',
    name: 'Archmage Supreme',
    archetype: 'mage',
    race: 'human',
    gender: 'm',
    skills: ['fire_attack', 'fireball', 'magma_spike', 'meteor'],
    assets: {
      idle: 'public/assets/hero/Idle.png',
      attack: 'public/assets/hero/Attack_2.png',
      cast: 'public/assets/hero/Fireball.png',
      cast_ultimate: 'public/assets/hero/Flame_jet.png',
      hit: 'public/assets/hero/Hurt.png',
      dead: 'public/assets/hero/Dead.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.3, originX: 0.5, originY: 0.85 }
  },

  duelist: {
    visualProfile: 'duelist',
    animationSet: 'fighter_dual_swords',
    weaponProfile: 'dual_sword',
    name: 'Duelist Gladiator',
    archetype: 'fighter',
    race: 'human',
    gender: 'm',
    skills: ['sword_strike', 'shield_bash', 'holy_blade', 'sanctuary_aegis'],
    assets: {
      idle: 'public/assets/paladin/Idle.png',
      attack: 'public/assets/paladin/Attack 1.png',
      cast: 'public/assets/paladin/Attack 2.png',
      cast_ultimate: 'public/assets/paladin/Attack 3.png',
      defend: 'public/assets/paladin/Defend.png',
      hit: 'public/assets/paladin/Hurt.png',
      dead: 'public/assets/paladin/Dead.png',
      staticPortrait: 'public/assets/static/m_paladin.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // --- MONSTERS / BOSSES ---
  shadow_wraith: {
    visualProfile: 'shadow_wraith',
    animationSet: 'undead_wraith',
    weaponProfile: 'scythe',
    name: 'Shadow Wraith',
    archetype: 'monster',
    race: 'undead',
    gender: 'none',
    assets: {
      idle: 'public/assets/monster/soul - Idle.png',
      attack: 'public/assets/monster/Soul - Attack.png',
      cast: 'public/assets/monster/Soul - Attack.png',
      hit: 'public/assets/monster/Soul - Hurt.png',
      dead: 'public/assets/monster/Soul - Dead.png',
      staticPortrait: 'public/assets/static/monster_static.png'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  corrupted_knight: {
    visualProfile: 'corrupted_knight',
    animationSet: 'monster_knight',
    weaponProfile: 'cursed_greatsword',
    name: 'Corrupted Knight (Boss)',
    archetype: 'monster',
    race: 'undead_knight',
    gender: 'none',
    assets: {
      idle: 'public/assets/monsters/corrupted_knight/Idle.png',
      attack: 'public/assets/monsters/corrupted_knight/Attack 1.png',
      cast: 'public/assets/monsters/corrupted_knight/Attack 2.png',
      hit: 'public/assets/monsters/corrupted_knight/Hurt.png',
      dead: 'public/assets/monsters/corrupted_knight/Dead.png',
      staticPortrait: 'public/assets/static/mon_cursedknight.png'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.4, originX: 0.5, originY: 0.85 }
  },

  arch_necromancer: {
    visualProfile: 'arch_necromancer',
    animationSet: 'monster_necromancer',
    weaponProfile: 'death_staff',
    name: 'Arch Necromancer (Lich Lord)',
    archetype: 'monster',
    race: 'lich',
    gender: 'none',
    assets: {
      idle: 'public/assets/monsters/necromancer/Idle.png',
      attack: 'public/assets/monsters/necromancer/Magic Arrow.png',
      cast: 'public/assets/monsters/necromancer/Desiccation.png',
      cast_ultimate: 'public/assets/monsters/necromancer/Wave of souls.png',
      hit: 'public/assets/monsters/necromancer/Soul - Hurt.png',
      dead: 'public/assets/monsters/necromancer/Soul - Dead.png',
      staticPortrait: 'public/assets/static/monster_static.png'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.3, originX: 0.5, originY: 0.85 }
  }
};

export function getCharacterVisualProfile(classId) {
  if (!classId || typeof classId !== 'string') return null;
  const normalized = classId.trim().toLowerCase();
  return CHARACTER_VISUAL_REGISTRY[normalized] || null;
}
