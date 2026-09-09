/**
 * CharacterVisualRegistry.js
 *
 * Canonical registry mapping classId -> visual profile -> character assets -> animation set -> weapon profile.
 * Asset paths corrected to match real sprite files available in public/assets/.
 */

import { CLASS_IDENTITIES } from '../classes/ClassIdentity.js';
import { CLASS_WEAPON_MAP } from './WeaponRegistry.js';

export const CHARACTER_VISUAL_REGISTRY = {
  // 1. Human Fighter -> Paladin sprites
  human_fighter: {
    classId: 'human_fighter',
    visualProfile: 'human_fighter',
    animationSet: 'anim_human_fighter',
    weaponProfile: 'sword',
    name: 'Human Fighter',
    race: 'Human',
    gender: 'm',
    archetype: 'fighter',
    assets: {
      master: 'public/assets/paladin/Idle.png',
      idle: 'public/assets/paladin/Idle.png',
      attack: 'public/assets/paladin/Attack 1.png',
      cast: 'public/assets/paladin/Attack 2.png',
      hit: 'public/assets/paladin/Hurt.png',
      death: 'public/assets/paladin/Dead.png',
      ultimate: 'public/assets/paladin/Attack 3.png',
      staticPortrait: 'public/assets/static/m_paladin.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 2. Human Sorcerer -> Spellsinger sprites
  human_sorcerer: {
    classId: 'human_sorcerer',
    visualProfile: 'human_sorcerer',
    animationSet: 'anim_human_sorcerer',
    weaponProfile: 'staff',
    name: 'Human Sorcerer',
    race: 'Human',
    gender: 'm',
    archetype: 'mage',
    assets: {
      master: 'public/assets/spellsinger/Idle.png',
      idle: 'public/assets/spellsinger/Idle.png',
      attack: 'public/assets/spellsinger/Attack_1.png',
      cast: 'public/assets/spellsinger/Attack_2.png',
      hit: 'public/assets/spellsinger/Hurt.png',
      death: 'public/assets/spellsinger/Dead.png',
      ultimate: 'public/assets/spellsinger/Light_ball.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 3. Elf Fighter -> Assassin sprites
  elf_fighter: {
    classId: 'elf_fighter',
    visualProfile: 'elf_fighter',
    animationSet: 'anim_elf_fighter',
    weaponProfile: 'light_blade',
    name: 'Elf Fighter',
    race: 'Elf',
    gender: 'f',
    archetype: 'fighter',
    assets: {
      master: 'public/assets/assassin/Idle.png',
      idle: 'public/assets/assassin/Idle.png',
      attack: 'public/assets/assassin/Attack_1.png',
      cast: 'public/assets/assassin/Attack_2.png',
      hit: 'public/assets/assassin/Hurt.png',
      death: 'public/assets/assassin/Dead.png',
      ultimate: 'public/assets/assassin/Attack_3.png',
      staticPortrait: 'public/assets/static/m_treasurehunter.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 4. Elf Mage -> Spellsinger sprites (light/water themed)
  elf_mage: {
    classId: 'elf_mage',
    visualProfile: 'elf_mage',
    animationSet: 'anim_elf_mage',
    weaponProfile: 'staff',
    name: 'Elf Mage',
    race: 'Elf',
    gender: 'f',
    archetype: 'mage',
    assets: {
      master: 'public/assets/spellsinger/Idle.png',
      idle: 'public/assets/spellsinger/Idle.png',
      attack: 'public/assets/spellsinger/Attack_1.png',
      cast: 'public/assets/spellsinger/Light_charge.png',
      hit: 'public/assets/spellsinger/Hurt.png',
      death: 'public/assets/spellsinger/Dead.png',
      ultimate: 'public/assets/spellsinger/Light_ball.png',
      staticPortrait: 'public/assets/static/f_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 5. Dark Elf Fighter -> Assassin sprites
  dark_elf_fighter: {
    classId: 'dark_elf_fighter',
    visualProfile: 'dark_elf_fighter',
    animationSet: 'anim_dark_elf_fighter',
    weaponProfile: 'light_blade',
    name: 'Dark Elf Fighter',
    race: 'Dark Elf',
    gender: 'm',
    archetype: 'fighter',
    assets: {
      master: 'public/assets/assassin/Idle.png',
      idle: 'public/assets/assassin/Idle.png',
      attack: 'public/assets/assassin/Attack_2.png',
      cast: 'public/assets/assassin/Attack_3.png',
      hit: 'public/assets/assassin/Hurt.png',
      death: 'public/assets/assassin/Dead.png',
      ultimate: 'public/assets/assassin/Attack_1.png',
      staticPortrait: 'public/assets/static/m_treasurehunter.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 6. Dark Elf Mage -> Spellsinger sprites
  dark_elf_mage: {
    classId: 'dark_elf_mage',
    visualProfile: 'dark_elf_mage',
    animationSet: 'anim_dark_elf_mage',
    weaponProfile: 'staff',
    name: 'Dark Elf Mage',
    race: 'Dark Elf',
    gender: 'm',
    archetype: 'mage',
    assets: {
      master: 'public/assets/spellsinger/Idle.png',
      idle: 'public/assets/spellsinger/Idle.png',
      attack: 'public/assets/spellsinger/Attack_2.png',
      cast: 'public/assets/spellsinger/Attack_1.png',
      hit: 'public/assets/spellsinger/Hurt.png',
      death: 'public/assets/spellsinger/Dead.png',
      ultimate: 'public/assets/spellsinger/Light_ball.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  },

  // 7. Orc Fighter -> Paladin sprites (heavy armored)
  orc_fighter: {
    classId: 'orc_fighter',
    visualProfile: 'orc_fighter',
    animationSet: 'anim_orc_fighter',
    weaponProfile: 'heavy_weapon',
    name: 'Orc Fighter',
    race: 'Orc',
    gender: 'm',
    archetype: 'fighter',
    assets: {
      master: 'public/assets/paladin/Idle.png',
      idle: 'public/assets/paladin/Idle.png',
      attack: 'public/assets/paladin/Attack 2.png',
      cast: 'public/assets/paladin/Attack 3.png',
      hit: 'public/assets/paladin/Hurt.png',
      death: 'public/assets/paladin/Dead.png',
      ultimate: 'public/assets/paladin/Run+Attack.png',
      staticPortrait: 'public/assets/static/m_deathknight.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.35, originX: 0.5, originY: 0.85 }
  },

  // 8. Orc Shaman -> Spellsinger sprites
  orc_shaman: {
    classId: 'orc_shaman',
    visualProfile: 'orc_shaman',
    animationSet: 'anim_orc_shaman',
    weaponProfile: 'ritual_staff',
    name: 'Orc Shaman',
    race: 'Orc',
    gender: 'm',
    archetype: 'mage',
    assets: {
      master: 'public/assets/spellsinger/Idle.png',
      idle: 'public/assets/spellsinger/Idle.png',
      attack: 'public/assets/spellsinger/Attack_2.png',
      cast: 'public/assets/spellsinger/Attack_1.png',
      hit: 'public/assets/spellsinger/Hurt.png',
      death: 'public/assets/spellsinger/Dead.png',
      ultimate: 'public/assets/spellsinger/Light_ball.png',
      staticPortrait: 'public/assets/static/m_sorcerer.jpg'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.3, originX: 0.5, originY: 0.85 }
  },

  // Monster: Shadow Wraith
  shadow_wraith: {
    classId: 'shadow_wraith',
    visualProfile: 'shadow_wraith',
    animationSet: 'anim_shadow_wraith',
    weaponProfile: 'scythe',
    name: 'Shadow Wraith',
    race: 'Undead',
    gender: 'none',
    archetype: 'monster',
    assets: {
      master: 'public/assets/static/monster_static.png',
      idle: 'public/assets/monsters/shadow_wraith/soul - Idle.png',
      attack: 'public/assets/monsters/shadow_wraith/Soul - Attack.png',
      cast: 'public/assets/monsters/shadow_wraith/Soul - Attack.png',
      hit: 'public/assets/monsters/shadow_wraith/Soul - Hurt.png',
      death: 'public/assets/monsters/shadow_wraith/Soul - Dead.png',
      ultimate: 'public/assets/monsters/shadow_wraith/Soul - Attack.png',
      staticPortrait: 'public/assets/static/monster_static.png'
    },
    metrics: { frameWidth: 128, frameHeight: 128, scale: 2.2, originX: 0.5, originY: 0.85 }
  }
};

// Aliases for compatibility
CHARACTER_VISUAL_REGISTRY.paladin = CHARACTER_VISUAL_REGISTRY.human_fighter;
CHARACTER_VISUAL_REGISTRY.archmage = CHARACTER_VISUAL_REGISTRY.human_sorcerer;
CHARACTER_VISUAL_REGISTRY.duelist = CHARACTER_VISUAL_REGISTRY.human_fighter;
CHARACTER_VISUAL_REGISTRY.assassin = CHARACTER_VISUAL_REGISTRY.dark_elf_fighter;
CHARACTER_VISUAL_REGISTRY.spellsinger = CHARACTER_VISUAL_REGISTRY.dark_elf_mage;
CHARACTER_VISUAL_REGISTRY.death_knight = CHARACTER_VISUAL_REGISTRY.orc_fighter;

export function getCharacterVisualProfile(classId) {
  if (!classId || typeof classId !== 'string') return null;
  const normalized = classId.trim().toLowerCase();
  return CHARACTER_VISUAL_REGISTRY[normalized] || null;
}


