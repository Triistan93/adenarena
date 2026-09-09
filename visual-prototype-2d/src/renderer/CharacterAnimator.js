/**
 * CharacterAnimator.js
 * 
 * Drives frame playback, timing, procedural idle breathing, and state transitions.
 */

import { getAnimationClip } from '../data/AnimationRegistry.js';
import { ActorState } from './CombatActor.js';

export class CharacterAnimator {
  constructor(actor) {
    this.actor = actor;
    this.currentClip = null;
    this.currentClipKey = null;
    this.frameIndex = 0;
    this.elapsedTimeMs = 0;
    this.totalAnimTimeMs = 0;
    
    this.onCompleteCallback = null;
    this.onKeyframeCallback = null;
    this.hitDispatched = false;
    
    // Procedural life motion (breathing & fabric hover)
    this.breathCycle = Math.random() * Math.PI * 2;
    this.breathSpeed = 0.0035;
    this.breathOffsetY = 0;

    this.syncWithActorState();
  }

  syncWithActorState(onComplete = null) {
    let clipKey = 'IDLE';
    switch (this.actor.state) {
      case ActorState.ATTACKING:
        clipKey = 'ATTACK';
        break;
      case ActorState.CASTING:
        clipKey = this.actor._ultimateCast ? 'ULTIMATE' : 'CAST';
        break;
      case ActorState.HIT:
        clipKey = 'HIT';
        break;
      case ActorState.DEAD:
        clipKey = 'DEAD';
        break;
      case ActorState.IDLE:
      default:
        clipKey = 'IDLE';
        break;
    }

    if (this.currentClipKey !== clipKey) {
      this.play(clipKey, onComplete);
    }
  }

  play(clipKey, onComplete = null) {
    const clip = getAnimationClip(this.actor.animationSet, clipKey);
    if (!clip) {
      console.warn(`[CharacterAnimator] No clip '${clipKey}' for set '${this.actor.animationSet}'`);
      return;
    }

    this.currentClipKey = clipKey;
    this.currentClip = clip;
    this.frameIndex = 0;
    this.elapsedTimeMs = 0;
    this.hitDispatched = false;
    this.onCompleteCallback = onComplete;
  }

  update(deltaMs) {
    // 1. Procedural breathing during IDLE
    this.totalAnimTimeMs += deltaMs;
    this.breathCycle += deltaMs * this.breathSpeed;
    if (this.actor.state === ActorState.IDLE) {
      this.breathOffsetY = Math.sin(this.breathCycle) * 3.5;
    } else {
      this.breathOffsetY = 0;
    }

    if (!this.currentClip) {
      this.syncWithActorState();
      return;
    }

    // 2. Advance frame
    const frameDurationMs = 1000 / this.currentClip.fps;
    this.elapsedTimeMs += deltaMs;

    if (this.elapsedTimeMs >= frameDurationMs) {
      const advancedFrames = Math.floor(this.elapsedTimeMs / frameDurationMs);
      this.elapsedTimeMs %= frameDurationMs;
      
      const prevFrame = this.frameIndex;
      this.frameIndex += advancedFrames;

      // Keyframe trigger (e.g. hit or projectile release)
      if (this.currentClip.hitFrame !== undefined && !this.hitDispatched) {
        if (prevFrame < this.currentClip.hitFrame && this.frameIndex >= this.currentClip.hitFrame) {
          this.hitDispatched = true;
          if (this.onKeyframeCallback) this.onKeyframeCallback('hit', this.actor);
        }
      }
      if (this.currentClip.releaseFrame !== undefined && !this.hitDispatched) {
        if (prevFrame < this.currentClip.releaseFrame && this.frameIndex >= this.currentClip.releaseFrame) {
          this.hitDispatched = true;
          if (this.onKeyframeCallback) this.onKeyframeCallback('release', this.actor);
        }
      }

      // 3. Completion / Loop handling
      if (this.frameIndex >= this.currentClip.frameCount) {
        if (this.currentClip.loop) {
          this.frameIndex %= this.currentClip.frameCount;
        } else {
          if (this.currentClip.holdLastFrame) {
            this.frameIndex = this.currentClip.frameCount - 1;
          } else {
            this.frameIndex = 0;
          }

          const cb = this.onCompleteCallback;
          this.onCompleteCallback = null;
          
          if (cb) {
            cb(this.actor);
          } else {
            // Default state recovery
            if (this.actor.state === ActorState.ATTACKING || this.actor.state === ActorState.CASTING) {
              this.actor.setState(ActorState.IDLE);
              this.syncWithActorState();
            } else if (this.actor.state === ActorState.HIT) {
              this.actor.recoverFromHit();
              this.syncWithActorState();
            }
          }
        }
      }
    }
  }

  getCurrentFrame() {
    return this.frameIndex;
  }

  getCurrentClip() {
    return this.currentClip;
  }
}
