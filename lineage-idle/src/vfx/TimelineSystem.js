/**
 * TimelineSystem.js — Multi-Phase Choreography & Timeline Engine for Aden Arena Idle.
 * 
 * Drives the cinematic timing of skills:
 * - Anticipation -> Charge -> Release -> Impact -> Recovery
 * - Executes timed actions (vfx, camera_fx, lighting, shader, animation, sfx)
 * - Supports cancel, pause, speed/timeScale modifications, and async completion
 */

export class TimelineAction {
  /**
   * @param {number} timeMs - Trigger timestamp in ms relative to timeline start
   * @param {string} type - Action type ('vfx'|'camera_fx'|'lighting'|'shader'|'animation'|'sfx'|'hitbox_activate')
   * @param {Object} params - Action configuration parameters
   */
  constructor(timeMs, type, params = {}) {
    this.time = Math.max(0, timeMs);
    this.type = type;
    this.params = params;
    this.executed = false;
  }

  reset() {
    this.executed = false;
  }
}

export class SkillTimeline {
  /**
   * @param {string} skillId 
   * @param {Object} timelineDef - Timeline definition from skill schema
   * @param {Object} context - Execution context { caster, target, sourcePos, targetPos, dispatcher }
   */
  constructor(skillId, timelineDef = {}, context = {}) {
    this.skillId = skillId;
    this.totalDuration = timelineDef.totalDuration || 600;
    this.phases = timelineDef.phases || [];
    this.context = context;

    this.elapsed = 0;
    this.timeScale = 1.0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = false;

    this._actions = [];
    this._parsePhases();

    this._onCompleteCallbacks = [];
    this._onActionCallbacks = [];
  }

  _parsePhases() {
    this._actions = [];
    for (const phase of this.phases) {
      const phaseStart = phase.start || 0;
      if (Array.isArray(phase.actions)) {
        for (const act of phase.actions) {
          const actTime = phaseStart + (act.time || 0);
          this._actions.push(new TimelineAction(actTime, act.type, act.params));
        }
      }
    }
    // Sort chronologically
    this._actions.sort((a, b) => a.time - b.time);
  }

  /**
   * Starts playing the timeline
   */
  play() {
    this.elapsed = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.isCompleted = false;
    for (const act of this._actions) {
      act.reset();
    }
    return this;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  cancel() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = true;
  }

  setTimeScale(scale) {
    this.timeScale = Math.max(0.1, Number(scale) || 1.0);
  }

  onAction(callback) {
    if (typeof callback === 'function') {
      this._onActionCallbacks.push(callback);
    }
    return this;
  }

  onComplete(callback) {
    if (typeof callback === 'function') {
      this._onCompleteCallbacks.push(callback);
    }
    return this;
  }

  /**
   * Updates timeline by delta time in milliseconds
   * @param {number} dtMs 
   */
  update(dtMs) {
    if (!this.isPlaying || this.isPaused || this.isCompleted) return;

    const scaledDt = dtMs * this.timeScale;
    this.elapsed += scaledDt;

    // Check all actions up to current elapsed time
    for (const action of this._actions) {
      if (!action.executed && this.elapsed >= action.time) {
        action.executed = true;
        this._dispatchAction(action);
      }
    }

    if (this.elapsed >= this.totalDuration) {
      this.isPlaying = false;
      this.isCompleted = true;
      for (const cb of this._onCompleteCallbacks) {
        try {
          cb(this);
        } catch (err) {
          console.error('[SkillTimeline] Error in onComplete callback:', err);
        }
      }
    }
  }

  _dispatchAction(action) {
    for (const cb of this._onActionCallbacks) {
      try {
        cb(action, this.context);
      } catch (err) {
        console.error('[SkillTimeline] Error in onAction callback:', err);
      }
    }
  }
}

/**
 * Timeline Manager to run and update active skill timelines
 */
export class TimelineManager {
  constructor() {
    this.activeTimelines = [];
  }

  /**
   * Start and register a new skill timeline
   * @param {string} skillId 
   * @param {Object} timelineDef 
   * @param {Object} context 
   * @returns {SkillTimeline}
   */
  start(skillId, timelineDef, context = {}) {
    const tl = new SkillTimeline(skillId, timelineDef, context);
    tl.play();
    this.activeTimelines.push(tl);
    return tl;
  }

  /**
   * Update all running timelines
   * @param {number} dtMs 
   */
  update(dtMs) {
    for (let i = this.activeTimelines.length - 1; i >= 0; i--) {
      const tl = this.activeTimelines[i];
      tl.update(dtMs);
      if (tl.isCompleted) {
        this.activeTimelines.splice(i, 1);
      }
    }
  }

  /**
   * Cancel all running timelines
   */
  cancelAll() {
    for (const tl of this.activeTimelines) {
      tl.cancel();
    }
    this.activeTimelines = [];
  }

  get activeCount() {
    return this.activeTimelines.length;
  }
}

export const globalTimelineManager = new TimelineManager();
