/**
 * Web Audio API Synthesizer for Lineage Idle RPG.
 * Zero external assets required — procedurally generates retro & modern SFX.
 * Features:
 * - Master bus with DynamicsCompressorNode (anti-clipping / soft-knee headroom)
 * - Micro-pitch detune randomization (anti-machine-gun effect)
 * - Elemental anticipation & impact soundscapes (Fire, Water, Wind, Earth, Dark, Holy, Physical)
 * - Cinematic fanfare for Lv80 Ultimates & Lv90 Master Ultimates
 * - Crystal shatter & resonant gong for Stagger BREAK
 */

class IdleAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private muted: boolean = false;
  private volume: number = 0.35;

  constructor() {
    const savedMute = typeof localStorage !== "undefined" ? localStorage.getItem("aden_idle_muted") : null;
    if (savedMute !== null) {
      this.muted = savedMute === "true";
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      this.ensureMasterBus(this.ctx);
    }
    return this.ctx;
  }

  private ensureMasterBus(ctx: AudioContext): void {
    if (!this.compressor) {
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      this.compressor.knee.setValueAtTime(24, ctx.currentTime);
      this.compressor.ratio.setValueAtTime(5, ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      this.compressor.release.setValueAtTime(0.2, ctx.currentTime);
    }
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, ctx.currentTime);
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);
    }
  }

  private duckTimeout: ReturnType<typeof setTimeout> | null = null;

  private getDestination(): AudioNode | null {
    const ctx = this.getContext();
    if (!ctx || !this.compressor) return null;
    return this.compressor;
  }

  private getDetune(cents: number = 35): number {
    return (Math.random() * 2 - 1) * cents;
  }

  /**
   * Deterministic seed hash helper
   */
  public hashSeed(skillId: string, eventIndex: number = 0): number {
    let hash = 0;
    const str = `${skillId}_${eventIndex}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return (x - Math.floor(x)) * 2 - 1;
  }

  /**
   * Deterministic micro-pitch variation based on category
   * Normal attack: +- 1-2% (~15-30 cents)
   * Heavy skill: +- 2-3% (~30-50 cents)
   * Ultimate: +- 1% (~15 cents)
   * Impact: 0-2% (~0-30 cents)
   */
  public getCategoryDetune(category: 'normal' | 'heavy' | 'ultimate' | 'impact', seedFactor: number = 0): number {
    const factor = seedFactor !== 0 ? seedFactor : (Math.random() * 2 - 1);
    switch (category) {
      case 'normal': return factor * 25;
      case 'heavy': return factor * 45;
      case 'ultimate': return factor * 15;
      case 'impact': return Math.abs(factor) * 30;
      default: return factor * 30;
    }
  }

  /**
   * Duck audio bus by -6dB (approx 50% gain) during Ultimates and Boss Roars
   */
  public duckAudio(durationMs: number = 800): void {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.muted) return;
    try {
      const now = ctx.currentTime;
      const duckGain = this.volume * 0.5; // -6dB attenuation
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(duckGain, now + 0.05);

      if (this.duckTimeout) clearTimeout(this.duckTimeout);
      this.duckTimeout = setTimeout(() => {
        if (!this.ctx || !this.masterGain || this.muted) return;
        const curNow = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(curNow);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, curNow);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, curNow + 0.25);
      }, durationMs);
    } catch {}
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("aden_idle_muted", String(this.muted));
    }
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, now);
    }
    return this.muted;
  }

  public setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI & BASIC RETRO SFX
  // ═══════════════════════════════════════════════════════════════════════════

  public playClick() {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {}
  }

  public playUpgrade() {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.06);
      osc.frequency.setValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playHit() {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 800 + this.getDetune(150);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      noise.start(now);
    } catch {}
  }

  public playCritical() {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160 + this.getDetune(20), now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  public playDrop(rarity = "common") {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const freqs = rarity === "legendary" || rarity === "epic"
        ? [523.25, 659.25, 783.99, 1046.50]
        : [440, 554.37, 659.25];

      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = f;

        const startTime = now + idx * 0.05;
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {}
  }

  public playLevelUp() {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = f;

        const st = now + i * 0.08;
        gain.gain.setValueAtTime(0.45, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(st);
        osc.stop(st + 0.3);
      });
    } catch {}
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADVANCED COMBAT PROCEDURAL SOUNDSCAPE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Procedural cast charging / windup hum tailored to elemental affinity
   */
  public playWindup(element = "Physical", durationMs = 250): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const durSec = Math.max(0.12, Math.min(0.6, durationMs / 1000));
      const elemLower = String(element).toLowerCase();

      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (elemLower.includes("fire") || elemLower.includes("magma")) {
        osc.type = "sawtooth";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, now);
        filter.frequency.exponentialRampToValueAtTime(900, now + durSec);
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(240, now + durSec);
      } else if (elemLower.includes("water") || elemLower.includes("ice")) {
        osc.type = "sine";
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(500, now);
        filter.frequency.exponentialRampToValueAtTime(1600, now + durSec);
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + durSec);
      } else if (elemLower.includes("wind")) {
        osc.type = "triangle";
        filter.type = "highpass";
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + durSec);
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + durSec);
      } else if (elemLower.includes("earth")) {
        osc.type = "square";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(80, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + durSec);
        osc.frequency.setValueAtTime(55, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + durSec);
      } else if (elemLower.includes("dark")) {
        osc.type = "sawtooth";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + durSec);
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + durSec);
      } else if (elemLower.includes("holy")) {
        osc.type = "sine";
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(1400, now + durSec);
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + durSec);
      } else {
        // Physical / default: sharp sword drawing / windup swoosh
        osc.type = "triangle";
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(900, now + durSec);
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + durSec);
      }

      osc.detune.setValueAtTime(this.getDetune(25), now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.28, now + durSec * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + durSec);
    } catch {}
  }

  /**
   * Procedural elemental impact on hit or projectile collision
   */
  public playElementalImpact(element = "Physical", isCrit = false): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;
      const elemLower = String(element).toLowerCase();
      const volMult = isCrit ? 1.4 : 1.0;

      if (elemLower.includes("fire") || elemLower.includes("magma")) {
        // Fire: Low thump + broadband burning noise explosion
        const noiseSize = Math.floor(ctx.sampleRate * 0.18);
        const buffer = ctx.createBuffer(1, noiseSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < noiseSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(950, now);
        filter.frequency.exponentialRampToValueAtTime(140, now + 0.18);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.45 * volMult, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(now);

        // Sub bass body
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(90, now);
        sub.frequency.exponentialRampToValueAtTime(35, now + 0.15);
        subGain.gain.setValueAtTime(0.4 * volMult, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        sub.connect(subGain);
        subGain.connect(dest);
        sub.start(now);
        sub.stop(now + 0.15);

      } else if (elemLower.includes("water") || elemLower.includes("ice")) {
        // Ice/Water: Glassy dual sine ping + sharp transient
        [1174, 2349].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq + this.getDetune(20), now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.22);
          gain.gain.setValueAtTime((0.35 / (i + 1)) * volMult, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.22);
        });

      } else if (elemLower.includes("wind")) {
        // Wind: Fast whip whoosh + electric snap
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
        filter.type = "highpass";
        filter.frequency.value = 400;

        gain.gain.setValueAtTime(0.4 * volMult, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.12);

      } else if (elemLower.includes("earth")) {
        // Earth: Heavy stone crunch and sub-punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(110 + this.getDetune(15), now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 220;

        gain.gain.setValueAtTime(0.5 * volMult, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.2);

      } else if (elemLower.includes("dark")) {
        // Dark: Ominous low dissonant pulse
        [65, 92].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq + this.getDetune(10), now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.25);
          gain.gain.setValueAtTime(0.3 * volMult, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.25);
        });

      } else if (elemLower.includes("holy")) {
        // Holy: Luminous chord bell shimmer (C5, E5, G5)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.02);
          gain.gain.setValueAtTime(0.3 * volMult, now + i * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(now + i * 0.02);
          osc.stop(now + 0.35);
        });

      } else {
        // Physical: Crisp metallic slash / punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(280 + this.getDetune(30), now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.4 * volMult, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {}
  }

  /**
   * Heroic or Transcendental Fanfare for Ultimates (Lv80) & Master Ultimates (Lv90)
   */
  public playUltimateFanfare(isMaster = false): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      this.duckAudio(isMaster ? 1500 : 950);
      const now = ctx.currentTime;

      if (!isMaster) {
        // Lv80 Ultimate (★★★★): Heroic brass arpeggio (D4 -> F#4 -> A4 -> D5)
        const notes = [293.66, 369.99, 440.00, 587.33];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(1200, now + idx * 0.06);

          const st = now + idx * 0.06;
          gain.gain.setValueAtTime(0.32, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.45);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);
          osc.start(st);
          osc.stop(st + 0.45);
        });
      } else {
        // Lv90 Master Ultimate (★★★★★): Transcendental multi-voice celestial chord + sub boom
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(60, now);
        sub.frequency.exponentialRampToValueAtTime(28, now + 0.6);
        subGain.gain.setValueAtTime(0.6, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        sub.connect(subGain);
        subGain.connect(dest);
        sub.start(now);
        sub.stop(now + 0.6);

        // Grand celestial ascending open fifths & shimmer
        const masterNotes = [261.63, 392.00, 523.25, 783.99, 1046.50, 1567.98];
        masterNotes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i < 3 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, now + i * 0.05);

          const st = now + i * 0.05;
          gain.gain.setValueAtTime(0.35, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + 0.65);

          osc.connect(dest);
          gain.connect(dest);
          osc.start(st);
          osc.stop(st + 0.65);
        });
      }
    } catch {}
  }

  /**
   * Dramatic posture shatter and resonant gong when Stagger BREAK triggers
   */
  public playStaggerBreak(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      const now = ctx.currentTime;

      // 1. Crystal shatter highpass noise
      const shatterSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, shatterSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < shatterSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(3200, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(dest);
      noise.start(now);

      // 2. Metallic posture gong (110Hz triangle + 880Hz overtone)
      const gong = ctx.createOscillator();
      const gongGain = ctx.createGain();
      gong.type = "triangle";
      gong.frequency.setValueAtTime(110, now);
      gong.frequency.exponentialRampToValueAtTime(75, now + 0.55);

      gongGain.gain.setValueAtTime(0.55, now);
      gongGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      gong.connect(gongGain);
      gongGain.connect(dest);
      gong.start(now);
      gong.stop(now + 0.55);

      // 3. Shimmer overtone
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = "sine";
      chime.frequency.setValueAtTime(880, now);
      chimeGain.gain.setValueAtTime(0.3, now);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      chime.connect(chimeGain);
      chimeGain.connect(dest);
      chime.start(now);
      chime.stop(now + 0.4);
    } catch {}
  }

  /**
   * Menacing boss roar / enrage sound
   */
  public playBossRoar(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;

    try {
      this.duckAudio(1200);
      const now = ctx.currentTime;
      [75, 78].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.5);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    } catch {}
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ADVANCED VFX ARSENAL AUDIO SYNTHESIS
  // ═════════════════════════════════════════════════════════════════════════

  public playMeteorRainSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.65);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.65);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  public playArrowRainSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const t = now + i * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1100 - i * 150, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.07);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.07);
      }
    } catch {}
  }

  public playHolySwordRainSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const t = now + i * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {}
  }

  public playBeamSound(type = 'holy'): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'dark' ? "sawtooth" : (type === 'lightning' ? "square" : "triangle");
      osc.frequency.setValueAtTime(type === 'lightning' ? 180 : 320, now);
      osc.frequency.linearRampToValueAtTime(type === 'lightning' ? 360 : 540, now + 0.35);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(type === 'dark' ? 600 : 1200, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playTornadoSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.3);
      osc.frequency.linearRampToValueAtTime(120, now + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(550, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  public playFissureSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(24, now + 0.55);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, now);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {}
  }

  public playIceShardSound(): void {
    if (this.muted) return;
    const ctx = this.getContext();
    const dest = this.getDestination();
    if (!ctx || !dest) return;
    try {
      const now = ctx.currentTime;
      [1480, 1820, 2200].forEach((freq, i) => {
        const t = now + i * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch {}
  }
}

export const idleAudio = new IdleAudioManager();
if (typeof window !== "undefined") {
  (window as unknown as { idleAudio: IdleAudioManager }).idleAudio = idleAudio;
}
export default idleAudio;
