/**
 * CameraFX.js — Camera Juice & Game Feel Engine for Aden Arena Idle 2D.
 * 
 * Implements:
 * - Decaying trauma-based screen shake (quadratic curve shake = trauma^2)
 * - Real-time hit-stop / freeze frames (unaffected by simulation time_scale)
 * - Camera zoom / punch / FOV pulse
 * - Screen flash and slow-mo time dilation
 * - Accessibility controls (shake toggle, flash toggle, intensity sliders)
 */

export class CameraFX {
  constructor(options = {}) {
    // Accessibility & Settings
    this.shakeEnabled = options.shakeEnabled !== false;
    this.shakeMultiplier = options.shakeMultiplier !== undefined ? options.shakeMultiplier : 1.0;
    this.flashEnabled = options.flashEnabled !== false;

    // Shake trauma state
    this.trauma = 0.0;
    this.decay = options.decay || 1.8; // trauma lost per second
    this.maxOffsetX = options.maxOffsetX || 18.0; // pixels
    this.maxOffsetY = options.maxOffsetY || 12.0; // pixels
    this.maxRoll = options.maxRoll || 0.04; // radians
    this._time = 0.0;

    // Output visual transform
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0;

    // Camera Zoom / Punch
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this._zoomDuration = 0;
    this._zoomElapsed = 0;
    this._zoomStart = 1.0;

    // Hit-stop state
    this.isFrozen = false;
    this._freezeEndTime = 0;
    this.timeScale = 1.0;

    // Screen flash state
    this.flashColor = '#ffffff';
    this.flashAlpha = 0.0;
    this._flashDuration = 0;
    this._flashElapsed = 0;
    this._flashStartAlpha = 0.0;
  }

  /**
   * Add shake trauma (0.0 to 1.0). Trauma stacks additively up to 1.0.
   * @param {number} amount 
   */
  addTrauma(amount) {
    if (!this.shakeEnabled || this.shakeMultiplier <= 0) return;
    const added = Math.max(0, Number(amount) || 0) * this.shakeMultiplier;
    this.trauma = Math.min(1.0, this.trauma + added);
  }

  /**
   * Triggers a real-time hit-stop (freeze frame).
   * Uses real-time timestamps (performance.now()) so it elapses even if simulation scale is 0.
   * @param {number} durationMs - Duration in milliseconds (e.g. 50ms - 150ms)
   * @param {number} [targetTimeScale=0.0] - Target time scale during freeze
   * @returns {Promise<void>}
   */
  hitStop(durationMs = 80, targetTimeScale = 0.0) {
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this.isFrozen = true;
    this.timeScale = Math.max(0, Math.min(1, targetTimeScale));
    this._freezeEndTime = Math.max(this._freezeEndTime, now + durationMs);

    return new Promise(resolve => {
      const checkResume = () => {
        const cur = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (cur >= this._freezeEndTime) {
          this.isFrozen = false;
          this.timeScale = 1.0;
          resolve();
        } else {
          setTimeout(checkResume, 10);
        }
      };
      setTimeout(checkResume, durationMs);
    });
  }

  /**
   * Quick camera zoom punch with ease-out settle.
   * @param {number} factor - Zoom scale, e.g. 1.08 (8% zoom in)
   * @param {number} durationMs - Duration in milliseconds
   */
  punchZoom(factor = 1.06, durationMs = 220) {
    this._zoomStart = factor;
    this.zoom = factor;
    this.targetZoom = 1.0;
    this._zoomDuration = Math.max(1, durationMs);
    this._zoomElapsed = 0;
  }

  /**
   * Screen flash with color and opacity.
   * @param {string} color 
   * @param {number} durationMs 
   * @param {number} opacity 
   */
  flash(color = '#ffffff', durationMs = 120, opacity = 0.35) {
    if (!this.flashEnabled) return;
    this.flashColor = color;
    this._flashStartAlpha = Math.max(0, Math.min(1, opacity));
    this.flashAlpha = this._flashStartAlpha;
    this._flashDuration = Math.max(1, durationMs);
    this._flashElapsed = 0;
  }

  /**
   * Triggers an anime/action RPG impact frame (1-2 frames of high contrast flash + micro hit-stop freeze).
   * @param {number} [durationMs=35] - Duration in milliseconds (approx 2 frames at 60fps)
   * @param {string} [flashColor='#ffffff'] - High contrast flash color
   */
  triggerImpactFrame(durationMs = 35, flashColor = '#ffffff') {
    this.flash(flashColor, durationMs, 0.85);
    this.hitStop(durationMs, 0.0);
    this.addTrauma(0.15);
  }

  /**
   * Update camera state per frame.
   * @param {number} dtMs - Elapsed milliseconds
   */
  update(dtMs) {
    const dt = Math.max(0, dtMs) / 1000.0; // seconds

    // 1. Update Hit-Stop real-time status
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (this.isFrozen && now >= this._freezeEndTime) {
      this.isFrozen = false;
      this.timeScale = 1.0;
    }

    // 2. Update Shake Trauma (quadratic curve)
    if (this.trauma > 0 && this.shakeEnabled) {
      this.trauma = Math.max(0.0, this.trauma - this.decay * dt);
      const shake = this.trauma * this.trauma; // Quadratic: subtle at low trauma, punchy at high
      this._time += dt * 32.0;

      // Smooth harmonics via sin waves (no harsh random jitter)
      this.offsetX = this.maxOffsetX * shake * Math.sin(this._time * 1.73);
      this.offsetY = this.maxOffsetY * shake * Math.sin(this._time * 2.37);
      this.rotation = this.maxRoll * shake * Math.sin(this._time * 1.15);
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
      this.rotation = 0;
    }

    // 3. Update Camera Zoom punch
    if (this._zoomElapsed < this._zoomDuration) {
      this._zoomElapsed += dtMs;
      const progress = Math.min(1.0, this._zoomElapsed / this._zoomDuration);
      // Ease out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.zoom = this._zoomStart + (this.targetZoom - this._zoomStart) * easeOut;
    } else {
      this.zoom = this.targetZoom;
    }

    // 4. Update Screen Flash decay
    if (this._flashElapsed < this._flashDuration && this.flashAlpha > 0) {
      this._flashElapsed += dtMs;
      const flashProgress = Math.min(1.0, this._flashElapsed / this._flashDuration);
      this.flashAlpha = this._flashStartAlpha * (1.0 - flashProgress);
    } else {
      this.flashAlpha = 0.0;
    }
  }

  /**
   * Reset all camera transforms to neutral rest
   */
  reset() {
    this.trauma = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.rotation = 0;
    this.zoom = 1.0;
    this.targetZoom = 1.0;
    this._zoomDuration = 0;
    this._zoomElapsed = 0;
    this.isFrozen = false;
    this.timeScale = 1.0;
    this.flashAlpha = 0;
  }
}

export const globalCameraFX = new CameraFX();
