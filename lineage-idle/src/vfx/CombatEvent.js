/**
 * CombatEvent.js — Decoupled Event-Driven Presentation Pipeline for Aden Arena Idle.
 * 
 * Defines standard combat event types and event emitter to bridge
 * CombatEngine (simulation) and Presentation Engine (VFX, PixiJS, Shaders, Camera, Audio, HUD).
 * 
 * Zero game simulation logic is coupled to rendering here.
 */

/**
 * Enumeration of standard combat event types
 */
export const CombatEventType = Object.freeze({
  SKILL_CAST: 'SkillCast',
  SKILL_HIT: 'SkillHit',
  SKILL_CRIT: 'SkillCrit',
  SKILL_DAMAGE: 'SkillDamage',
  SKILL_STAGGER: 'SkillStagger',
  SKILL_KILL: 'SkillKill',
  SKILL_COMPLETE: 'SkillComplete',
  SKILL_INTERRUPT: 'SkillInterrupt',
  CAMERA_SHAKE: 'CameraShake',
  TIME_DILATION: 'TimeDilation'
});

/**
 * Event Dispatcher for decoupled combat presentation
 */
export class CombatEventEmitter {
  constructor(options = {}) {
    this._listeners = new Map();
    this._history = [];
    this._maxHistory = options.maxHistory || 100;
    this._recording = options.recording !== false;
  }

  /**
   * Register a listener for an event type
   * @param {string} eventType 
   * @param {Function} handler 
   * @param {Object} [options] { once, priority }
   * @returns {Function} Unsubscribe function
   */
  on(eventType, handler, options = {}) {
    if (typeof handler !== 'function') {
      throw new TypeError(`Handler for ${eventType} must be a function`);
    }
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, []);
    }
    const entry = {
      handler,
      once: !!options.once,
      priority: Number(options.priority) || 0
    };

    const list = this._listeners.get(eventType);
    list.push(entry);
    list.sort((a, b) => b.priority - a.priority);

    return () => this.off(eventType, handler);
  }

  /**
   * Register a one-time listener
   */
  once(eventType, handler, options = {}) {
    return this.on(eventType, handler, { ...options, once: true });
  }

  /**
   * Remove a listener
   */
  off(eventType, handler) {
    if (!this._listeners.has(eventType)) return false;
    const list = this._listeners.get(eventType);
    const idx = list.findIndex(e => e.handler === handler);
    if (idx !== -1) {
      list.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Clear all listeners for a given event type, or all event types
   */
  clearListeners(eventType) {
    if (eventType) {
      this._listeners.delete(eventType);
    } else {
      this._listeners.clear();
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param {string} eventType 
   * @param {Object} payload 
   * @returns {boolean} Whether any listeners were invoked
   */
  emit(eventType, payload = {}) {
    const timestamp = payload.timestamp || Date.now();
    const event = {
      type: eventType,
      timestamp,
      ...payload
    };

    if (this._recording) {
      this._history.push(event);
      if (this._history.length > this._maxHistory) {
        this._history.shift();
      }
    }

    if (!this._listeners.has(eventType)) return false;

    const list = [...this._listeners.get(eventType)];
    for (const entry of list) {
      try {
        entry.handler(event);
      } catch (err) {
        console.error(`[CombatEventEmitter] Error in handler for ${eventType}:`, err);
      }
      if (entry.once) {
        this.off(eventType, entry.handler);
      }
    }
    return true;
  }

  /**
   * Emit multiple events in sequence
   * @param {Array<{type: string, payload: Object}>} events 
   */
  emitBatch(events) {
    if (!Array.isArray(events)) return;
    for (const { type, payload } of events) {
      this.emit(type, payload);
    }
  }

  /**
   * Retrieve recent event history
   */
  getHistory(filterType) {
    if (!filterType) return [...this._history];
    return this._history.filter(e => e.type === filterType);
  }

  /**
   * Clear history
   */
  clearHistory() {
    this._history = [];
  }
}

/**
 * Factory helpers to construct strongly-typed payloads
 */
export const CombatEventFactory = {
  createSkillCast(skillId, caster, target, position = { x: 0, y: 0 }, meta = {}) {
    return {
      skillId,
      caster: typeof caster === 'string' ? { id: caster } : caster,
      target: typeof target === 'string' ? { id: target } : target,
      position,
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillHit(skillId, hitIndex, totalHits, target, damage, isCrit = false, isStaggerBreak = false, meta = {}) {
    return {
      skillId,
      hitIndex,
      totalHits,
      target: typeof target === 'string' ? { id: target } : target,
      damage: Number(damage) || 0,
      isCrit: !!isCrit,
      isStaggerBreak: !!isStaggerBreak,
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillCrit(skillId, target, damage, critTier = 'normal', meta = {}) {
    return {
      skillId,
      target: typeof target === 'string' ? { id: target } : target,
      damage: Number(damage) || 0,
      critTier, // 'normal' | 'heavy' | 'colossal'
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillDamage(skillId, target, damage, element = 'Physical', isCrit = false, isMiss = false, isOverkill = false, meta = {}) {
    return {
      skillId,
      target: typeof target === 'string' ? { id: target } : target,
      damage: Number(damage) || 0,
      element,
      isCrit: !!isCrit,
      isMiss: !!isMiss,
      isOverkill: !!isOverkill,
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillStagger(skillId, target, staggerDamage, isBreak = false, postureRatio = 1.0, meta = {}) {
    return {
      skillId,
      target: typeof target === 'string' ? { id: target } : target,
      staggerDamage: Number(staggerDamage) || 0,
      isBreak: !!isBreak,
      postureRatio: Math.max(0, Math.min(1, postureRatio)),
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillKill(skillId, target, overkillDmg = 0, isBoss = false, meta = {}) {
    return {
      skillId,
      target: typeof target === 'string' ? { id: target } : target,
      overkillDmg: Math.max(0, Number(overkillDmg) || 0),
      isBoss: !!isBoss,
      timestamp: Date.now(),
      ...meta
    };
  },

  createSkillComplete(skillId, duration, totalDamage = 0, meta = {}) {
    return {
      skillId,
      duration: Number(duration) || 0,
      totalDamage: Number(totalDamage) || 0,
      timestamp: Date.now(),
      ...meta
    };
  }
};

/**
 * Global shared combat events singleton
 */
export const combatEvents = new CombatEventEmitter();
