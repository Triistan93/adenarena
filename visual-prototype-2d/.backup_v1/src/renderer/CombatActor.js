/**
 * CombatActor.js
 * 
 * Formal Actor Model for 2D animated characters in combat.
 * Manages stats, anchors, states (IDLE, ATTACKING, CASTING, HIT, DEAD), and lifecycle.
 */

export const ACTOR_CONFIG = {
  ACTOR_SCALE: 2.2,
  ACTOR_HEIGHT: 128,
  ACTOR_BASELINE_Y: 480
};

export const ActorState = {
  IDLE: 'IDLE',
  ATTACKING: 'ATTACKING',
  CASTING: 'CASTING',
  HIT: 'HIT',
  DEAD: 'DEAD'
};

export class CombatActor {
  constructor(config = {}) {
    this.id = config.id || 'actor_' + Math.random().toString(36).substr(2, 6);
    this.classId = config.classId || 'human_sorcerer';
    this.name = config.name || 'Hero';
    this.race = config.race || 'human';
    this.gender = config.gender || 'm';
    this.archetype = config.archetype || 'mage';
    this.visualProfile = config.visualProfile || 'human_sorcerer';
    this.animationSet = config.animationSet || 'mage_fire';
    this.weaponProfile = config.weaponProfile || 'staff';
    
    this.scale = config.scale || ACTOR_CONFIG.ACTOR_SCALE;
    this.width = (config.frameWidth || ACTOR_CONFIG.ACTOR_HEIGHT) * this.scale;
    this.height = (config.frameHeight || ACTOR_CONFIG.ACTOR_HEIGHT) * this.scale;
    
    this.position = config.position ? { ...config.position } : { x: 300, y: ACTOR_CONFIG.ACTOR_BASELINE_Y };
    this.flipX = Boolean(config.flipX);
    
    this.state = ActorState.IDLE;
    this.previousState = ActorState.IDLE;
    this.isCasting = false;
    this.isAttacking = false;
    this.isHit = false;
    this.isDead = false;
    this.staggerGauge = 0;
    this.maxStaggerGauge = 100;
    
    this.level = config.level || 76;
    this.hp = config.hp || 3200;
    this.maxHp = config.maxHp || 3200;
    this.mp = config.mp || 1400;
    this.maxMp = config.maxMp || 1400;

    this.hitTimer = 0;
    this.hitFlashDuration = 180;
    
    this.assets = config.assets || {};
  }

  /**
   * Precise Spatial Anchors
   * Projectile -> chest
   * Ground Effect -> feet
   * Aura -> center
   * Cast origin -> weapon / castPoint
   */
  getAnchor(name) {
    const x = this.position.x;
    const y = this.position.y;
    const facing = this.flipX ? -1 : 1;
    const halfH = this.height * 0.5;
    const halfW = this.width * 0.5;

    switch (name) {
      case 'feet':
        // Bottom boundary exactly where feet touch the ground plane
        return { x, y: y + halfH - 4 };
        
      case 'chest':
        // Sternum / center mass (target for arrows, fireballs, slashes)
        return { x: x + facing * (halfW * 0.05), y: y - halfH * 0.08 };
        
      case 'center':
        // Geometric center for surrounding auras
        return { x, y };
        
      case 'head':
        // Head / crown for overhead icons and buffs
        return { x, y: y - halfH * 0.72 };
        
      case 'weapon':
      case 'castPoint':
        // Tip of the staff / hand extending forward
        return { 
          x: x + facing * (halfW * 0.42), 
          y: y - halfH * 0.22 
        };
        
      default:
        return { x, y };
    }
  }

  setState(newState, force = false) {
    if (this.state === ActorState.DEAD && !force) {
      // Dead actors cannot act until reset
      return false;
    }
    if (this.state !== newState) {
      if (this.state !== ActorState.HIT) {
        this.previousState = this.state;
      }
      this.state = newState;
      this.isDead = (newState === ActorState.DEAD);
      this.isHit = (newState === ActorState.HIT);
      this.isAttacking = (newState === ActorState.ATTACKING);
      this.isCasting = (newState === ActorState.CASTING);
      return true;
    }
    return false;
  }

  takeDamage(amount, isStagger = false) {
    if (this.state === ActorState.DEAD) return { damage: 0, killed: false };

    this.hp = Math.max(0, this.hp - amount);
    const killed = this.hp <= 0;

    if (killed) {
      this.setState(ActorState.DEAD, true);
    } else {
      this.hitTimer = this.hitFlashDuration;
      this.setState(ActorState.HIT);
      if (isStagger) {
        this.staggerGauge = Math.min(this.maxStaggerGauge, this.staggerGauge + 45);
      }
    }

    return { damage: amount, killed };
  }

  recoverFromHit() {
    if (this.state === ActorState.HIT) {
      this.setState(this.previousState === ActorState.HIT ? ActorState.IDLE : this.previousState);
    }
  }

  heal(amount) {
    if (this.state === ActorState.DEAD) return 0;
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - oldHp;
  }

  reset() {
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.staggerGauge = 0;
    this.state = ActorState.IDLE;
    this.previousState = ActorState.IDLE;
    this.isDead = false;
    this.isHit = false;
    this.isCasting = false;
    this.isAttacking = false;
    this.hitTimer = 0;
  }

  update(deltaMs) {
    if (this.hitTimer > 0) {
      this.hitTimer -= deltaMs;
      if (this.hitTimer <= 0) {
        this.hitTimer = 0;
        this.recoverFromHit();
      }
    }
  }
}
