/**
 * SoundFX.js — Audio Bridge for Aden Arena Idle VFX & Combat Presentation Engine.
 * 
 * Safely delegates procedural SFX synthesis to window.idleAudio when present in the browser,
 * and remains 100% no-op and silent in headless environments, SSR, or Node test runners.
 */

export class SoundFX {
  /**
   * Sound effects toggle (disabled for maximum performance as requested)
   */
  static enabled = false;

  /**
   * Retrieves window.idleAudio safely
   */
  static get audio() {
    if (!this.enabled) return null;
    if (typeof window !== 'undefined' && window.idleAudio) {
      return window.idleAudio;
    }
    return null;
  }

  /**
   * Triggers a cast charging / windup hum based on skill element and duration
   * @param {string} element - Physical, Fire, Water, Wind, Earth, Dark, Holy
   * @param {number} durationMs - Cast duration in ms
   */
  static playWindup(element = 'Physical', durationMs = 250) {
    try {
      this.audio?.playWindup?.(element, durationMs);
    } catch {}
  }

  /**
   * Triggers an elemental impact sound (hit or projectile explosion)
   * @param {string} element - Physical, Fire, Water, Wind, Earth, Dark, Holy
   * @param {boolean} isCrit - Whether this impact is a critical strike
   */
  static playElementalImpact(element = 'Physical', isCrit = false) {
    try {
      this.audio?.playElementalImpact?.(element, isCrit);
    } catch {}
  }

  /**
   * Triggers an Ultimate fanfare
   * @param {boolean} isMaster - true for Lv90 Master Ultimate, false for Lv80 Ultimate
   */
  static playUltimateFanfare(isMaster = false) {
    try {
      this.audio?.playUltimateFanfare?.(isMaster);
    } catch {}
  }

  /**
   * Triggers the crystal shatter & posture gong on Stagger BREAK
   */
  static playStaggerBreak() {
    try {
      this.audio?.playStaggerBreak?.();
    } catch {}
  }

  /**
   * Triggers standard weapon hit
   */
  static playHit() {
    try {
      this.audio?.playHit?.();
    } catch {}
  }

  /**
   * Triggers heavy critical strike
   */
  static playCritical() {
    try {
      this.audio?.playCritical?.();
    } catch {}
  }

  /**
   * Triggers boss roar or enrage phase sound
   */
  static playBossRoar() {
    try {
      this.audio?.playBossRoar?.();
    } catch {}
  }

  static playMeteorRain() {
    try {
      this.audio?.playMeteorRainSound?.();
    } catch {}
  }

  static playArrowRain() {
    try {
      this.audio?.playArrowRainSound?.();
    } catch {}
  }

  static playHolySwordRain() {
    try {
      this.audio?.playHolySwordRainSound?.();
    } catch {}
  }

  static playBeam(type = 'holy') {
    try {
      this.audio?.playBeamSound?.(type);
    } catch {}
  }

  static playTornado() {
    try {
      this.audio?.playTornadoSound?.();
    } catch {}
  }

  static playFissure() {
    try {
      this.audio?.playFissureSound?.();
    } catch {}
  }

  static playIceShard() {
    try {
      this.audio?.playIceShardSound?.();
    } catch {}
  }
}

export default SoundFX;
