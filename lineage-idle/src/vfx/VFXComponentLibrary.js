/**
 * VFXComponentLibrary.js — Reusable VFX Primitives & Elemental Modules for Aden Arena Idle.
 * 
 * Provides modular visual building blocks:
 * 1. Core: SlashArc, Projectile, ImpactBurst, GroundPillar, GroundRune
 * 2. Elemental: Fire/Magma, Water/Ice, Wind, Earth, Holy, Dark
 * 3. Combat Feedback: CriticalImpactSparks, StaggerBreakRing, FloaterDamage
 * 4. Master Ultimate Setups: Titanbreaker, Meteor, Prismatic Genesis, etc.
 * 
 * All components respect strict particle budgets and use ObjectPool.
 */

import { globalVFXPool } from './ObjectPool.js';

export const VFXComponentLibrary = {
  /**
   * Spawns a directional curved slash arc
   */
  spawnSlashArc(x, y, options = {}) {
    const angle = options.angle !== undefined ? options.angle : 0;
    const radius = options.radius || 60;
    const color = options.color || '#e2e8f0';
    const count = Math.min(24, options.particleCount || 16);

    for (let i = 0; i < count; i++) {
      const offsetAngle = angle - 0.6 + (1.2 * (i / count));
      const speed = 150 + Math.random() * 80;
      globalVFXPool.particles.acquire({
        x: x + Math.cos(offsetAngle) * (radius * 0.5),
        y: y + Math.sin(offsetAngle) * (radius * 0.5),
        vx: Math.cos(offsetAngle) * speed,
        vy: Math.sin(offsetAngle) * speed,
        color,
        size: options.size || (3 + Math.random() * 3),
        maxLife: options.duration || 300,
        blendMode: options.blendMode || 'lighter'
      });
    }
  },

  /**
   * Spawns an impact burst of directional sparks and particles
   */
  spawnImpactBurst(x, y, options = {}) {
    const color = options.color || '#ffd700';
    const count = Math.min(32, options.particleCount || 20);
    const speedBase = options.speed || 240;

    for (let i = 0; i < count; i++) {
      const dirAngle = Math.random() * Math.PI * 2;
      const speed = (speedBase * 0.4) + Math.random() * speedBase;
      globalVFXPool.particles.acquire({
        x,
        y,
        vx: Math.cos(dirAngle) * speed,
        vy: Math.sin(dirAngle) * speed - 40, // slight upward bias
        ay: 300, // gravity
        color,
        size: 2 + Math.random() * 4,
        maxLife: 350 + Math.random() * 250,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Spawns a linear/curved projectile towards a target point
   */
  spawnProjectile(startX, startY, targetX, targetY, options = {}) {
    return globalVFXPool.projectiles.acquire({
      x: startX,
      y: startY,
      targetX,
      targetY,
      speed: options.speed || 750,
      type: options.type || 'arrow',
      color: options.color || '#ffd700',
      onHit: options.onHit || null
    });
  },

  /**
   * Spawns a vertical ground pillar / beam effect
   */
  spawnGroundPillar(x, y, options = {}) {
    const height = options.height || 220;
    const width = options.width || 40;
    const color = options.color || '#ef4444';
    const count = Math.min(30, options.particleCount || 24);

    for (let i = 0; i < count; i++) {
      const pY = y - Math.random() * height;
      const pX = x + (Math.random() - 0.5) * width;
      globalVFXPool.particles.acquire({
        x: pX,
        y: pY,
        vx: (Math.random() - 0.5) * 40,
        vy: -200 - Math.random() * 150, // fast upward surge
        color,
        size: 4 + Math.random() * 5,
        maxLife: 400 + Math.random() * 300,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Spawns a rotating ground magic rune / circle
   */
  spawnGroundRune(x, y, options = {}) {
    const radius = options.radius || 50;
    const color = options.color || '#a855f7';
    const count = Math.min(24, options.particleCount || 16);

    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2;
      globalVFXPool.particles.acquire({
        x: x + Math.cos(theta) * radius,
        y: y + Math.sin(theta) * (radius * 0.4), // perspective elliptical
        vx: -Math.sin(theta) * 30, // tangential rotation
        vy: Math.cos(theta) * 12,
        color,
        size: 3 + Math.random() * 2,
        maxLife: options.duration || 600,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Critical Impact Sparks (layered star flash + outward spark shower)
   */
  spawnCriticalHitFeedback(x, y, options = {}) {
    const tier = options.critTier || 'normal'; // 'normal' | 'heavy' | 'colossal'
    const sparkCount = tier === 'colossal' ? 36 : (tier === 'heavy' ? 24 : 16);
    const color = tier === 'colossal' ? '#ff3b30' : (tier === 'heavy' ? '#ff9500' : '#ffcc00');

    // 1. Shockwave ring
    globalVFXPool.shockwaves.acquire({
      x,
      y,
      radius: 5,
      maxRadius: tier === 'colossal' ? 140 : 80,
      width: tier === 'colossal' ? 8 : 4,
      color,
      duration: 250
    });

    // 2. High-speed spark burst
    this.spawnImpactBurst(x, y, {
      color,
      particleCount: sparkCount,
      speed: tier === 'colossal' ? 350 : 250
    });
  },

  /**
   * Stagger Break Shatter (posture collapse effect)
   */
  spawnStaggerBreakEffect(x, y) {
    // 1. Double shockwave
    globalVFXPool.shockwaves.acquire({
      x, y,
      maxRadius: 160,
      width: 6,
      color: '#38bdf8',
      duration: 350
    });

    // 2. Crystalline shatter shards
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 180 + Math.random() * 160;
      globalVFXPool.particles.acquire({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ay: 200,
        color: i % 2 === 0 ? '#e0f2fe' : '#38bdf8',
        size: 3 + Math.random() * 4,
        maxLife: 450,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Cinematic Master Ultimate: Titanbreaker & Elemental Ground Breakers
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  spawnTitanbreakerVFX(x, y, options = {}) {
    const primaryColor = options.color || '#f59e0b';
    const radius = options.radius || 260;
    const count = options.particleCount || 40;

    // Colossal impact shockwave
    globalVFXPool.shockwaves.acquire({
      x, y,
      maxRadius: radius,
      width: 10,
      color: primaryColor,
      duration: 500
    });

    // Upward elemental rock/debris shower
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 250 + Math.random() * 300;
      globalVFXPool.particles.acquire({
        x: x + (Math.random() - 0.5) * 80,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ay: 450,
        color: Math.random() > 0.35 ? primaryColor : '#ffffff',
        size: 4 + Math.random() * 6,
        maxLife: 700,
        blendMode: options.blendMode || 'source-over'
      });
    }
  },

  /**
   * Cinematic Master Ultimate: Meteor
   */
  spawnMeteorVFX(startX, startY, groundX, groundY) {
    // 1. Descending meteor projectile
    globalVFXPool.projectiles.acquire({
      x: startX,
      y: startY,
      targetX: groundX,
      targetY: groundY,
      speed: 950,
      type: 'fireball',
      color: '#ef4444',
      onHit: () => {
        // Ground crater explosion
        globalVFXPool.shockwaves.acquire({
          x: groundX, y: groundY,
          maxRadius: 280,
          width: 12,
          color: '#f97316',
          duration: 600
        });
        VFXComponentLibrary.spawnGroundPillar(groundX, groundY, {
          color: '#ef4444',
          height: 320,
          width: 80,
          particleCount: 45
        });
      }
    });
  },

  /**
   * Cinematic Master Ultimate: Prismatic Genesis
   */
  spawnPrismaticGenesisVFX(x, y) {
    const rainbowColors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];
    globalVFXPool.shockwaves.acquire({
      x, y,
      maxRadius: 300,
      width: 14,
      color: '#c084fc',
      duration: 650
    });
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const speed = 180 + Math.random() * 220;
      globalVFXPool.particles.acquire({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: rainbowColors[i % rainbowColors.length],
        size: 3 + Math.random() * 4,
        maxLife: 600,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Spawns an Enrage Flame Aura burst around the boss
   * @param {number} x 
   * @param {number} y 
   * @param {Object} [options] 
   */
  spawnEnrageAura(x, y, options = {}) {
    const color = options.color || '#ef4444';
    const count = options.particleCount || 32;

    // Red expanding pulse
    globalVFXPool.shockwaves.acquire({
      x, y,
      maxRadius: 180,
      width: 8,
      color,
      duration: 450
    });

    // Rising embers
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const speed = 120 + Math.random() * 180;
      globalVFXPool.particles.acquire({
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ay: -150, // gentle float upward
        color: Math.random() > 0.4 ? color : '#fbbf24',
        size: 3 + Math.random() * 4,
        maxLife: 600 + Math.random() * 400,
        blendMode: 'lighter'
      });
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ─── DEPLOY 3.3: ADVANCED VFX ARSENAL ─────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  /**
   * Meteor Rain: Multiple angled meteors falling sequentially with fiery trails and crater explosions
   */
  spawnMeteorRain(targetX, targetY, options = {}) {
    const count = Math.min(6, options.count || 4);
    const color = options.color || '#ff4500';
    const secondaryColor = options.secondaryColor || '#ffaa00';

    // Ambient heat pulse on ground
    globalVFXPool.environmentalFields.acquire({
      x: targetX, y: targetY,
      type: 'burning',
      radius: 90,
      color,
      secondaryColor,
      duration: 1800
    });

    for (let i = 0; i < count; i++) {
      const startX = targetX - 160 + (Math.random() - 0.5) * 60 + (i * 35);
      const startY = targetY - 320 - (i * 50);
      const tX = targetX + (Math.random() - 0.5) * 70;
      const tY = targetY + (Math.random() - 0.5) * 25;
      const delay = i * 140;

      globalVFXPool.fallingProjectiles.acquire({
        startX, startY,
        targetX: tX, targetY: tY,
        type: 'meteor',
        color,
        secondaryColor,
        speed: 900,
        delay,
        scale: 1.0 + (i === count - 1 ? 0.4 : 0), // final meteor is largest
        onImpact: (p) => {
          globalVFXPool.shockwaves.acquire({
            x: p.targetX, y: p.targetY,
            maxRadius: 110 + (p.scale * 20),
            width: 7,
            color,
            duration: 350
          });
          VFXComponentLibrary.spawnImpactBurst(p.targetX, p.targetY, {
            color: secondaryColor,
            particleCount: 16,
            speed: 260
          });
          VFXComponentLibrary.spawnGroundFissure(p.targetX, p.targetY, {
            radius: 55,
            color: '#b91c1c',
            duration: 1200
          });
        }
      });
    }
  },

  /**
   * Arrow Rain: Ballistic volley of arrows arching down into the target area
   */
  spawnArrowRain(sourceX, sourceY, targetX, targetY, count = 18) {
    const total = Math.min(24, Math.max(12, count));
    for (let i = 0; i < total; i++) {
      const delay = Math.random() * 220;
      const startX = sourceX + (Math.random() - 0.5) * 60;
      const startY = sourceY - 260 - Math.random() * 80;
      const tX = targetX + (Math.random() - 0.5) * 110;
      const tY = targetY + (Math.random() - 0.5) * 35;

      globalVFXPool.fallingProjectiles.acquire({
        startX, startY,
        targetX: tX, targetY: tY,
        type: 'arrow',
        color: '#f8fafc',
        secondaryColor: '#94a3b8',
        speed: 1100,
        delay,
        maxStuckTime: 400 + Math.random() * 300,
        onImpact: (p) => {
          VFXComponentLibrary.spawnImpactBurst(p.targetX, p.targetY, {
            color: '#cbd5e1',
            particleCount: 4,
            speed: 90
          });
        }
      });
    }
  },

  /**
   * Holy Sword Rain: Celestial golden swords materialize in the heavens and plunge into the earth
   */
  spawnHolySwordRain(targetX, targetY, count = 8) {
    const total = Math.min(10, Math.max(6, count));
    const color = '#fef08a';
    const secondaryColor = '#eab308';

    // Sacred mandala on the floor
    VFXComponentLibrary.spawnHolyMandala(targetX, targetY, {
      radius: 95,
      color: secondaryColor,
      duration: 1600
    });

    for (let i = 0; i < total; i++) {
      const angle = (i / total) * Math.PI - (Math.PI / 2);
      const startX = targetX + Math.cos(angle) * 110;
      const startY = targetY - 240 + Math.sin(angle) * 35;
      const tX = targetX + (Math.random() - 0.5) * 70;
      const tY = targetY + (Math.random() - 0.5) * 25;
      const delay = 80 + i * 90;

      globalVFXPool.fallingProjectiles.acquire({
        startX, startY,
        targetX: tX, targetY: tY,
        type: 'holy_sword',
        color,
        secondaryColor,
        speed: 1250,
        delay,
        scale: 1.1,
        onImpact: (p) => {
          globalVFXPool.shockwaves.acquire({
            x: p.targetX, y: p.targetY,
            maxRadius: 75,
            width: 5,
            color: secondaryColor,
            duration: 250
          });
          globalVFXPool.lights.acquire({
            x: p.targetX, y: p.targetY,
            radius: 120,
            color,
            intensity: 0.9,
            duration: 300
          });
          VFXComponentLibrary.spawnImpactBurst(p.targetX, p.targetY, {
            color,
            particleCount: 12,
            speed: 200
          });
        }
      });
    }
  },

  /**
   * Ice Shard Rain: Faceted diamond frost shards cascading down and shattering
   */
  spawnIceShardRain(targetX, targetY, count = 10) {
    const total = Math.min(14, Math.max(8, count));
    const color = '#93c5fd';
    const secondaryColor = '#38bdf8';

    // Frozen ground field
    globalVFXPool.environmentalFields.acquire({
      x: targetX, y: targetY,
      type: 'frozen',
      radius: 80,
      color,
      secondaryColor,
      duration: 1400
    });

    for (let i = 0; i < total; i++) {
      const startX = targetX - 60 + (Math.random() - 0.5) * 120;
      const startY = targetY - 260 - Math.random() * 80;
      const tX = targetX + (Math.random() - 0.5) * 80;
      const tY = targetY + (Math.random() - 0.5) * 30;
      const delay = Math.random() * 260;

      globalVFXPool.fallingProjectiles.acquire({
        startX, startY,
        targetX: tX, targetY: tY,
        type: 'ice_shard',
        color: '#e0f2fe',
        secondaryColor: color,
        speed: 1050,
        delay,
        onImpact: (p) => {
          globalVFXPool.shockwaves.acquire({
            x: p.targetX, y: p.targetY,
            maxRadius: 60,
            width: 4,
            color,
            duration: 200
          });
          VFXComponentLibrary.spawnStaggerBreakEffect(p.targetX, p.targetY);
        }
      });
    }
  },

  /**
   * Dark Spear Rain: Abyssal void spears plunging into target area
   */
  spawnDarkSpearRain(targetX, targetY, count = 8) {
    const total = Math.min(10, Math.max(6, count));
    const color = '#c084fc';
    const secondaryColor = '#7e22ce';

    VFXComponentLibrary.spawnDarkShadowRift(targetX, targetY, {
      radius: 85,
      duration: 1500
    });

    for (let i = 0; i < total; i++) {
      const startX = targetX + (Math.random() - 0.5) * 100;
      const startY = targetY - 280 - Math.random() * 60;
      const tX = targetX + (Math.random() - 0.5) * 70;
      const tY = targetY + (Math.random() - 0.5) * 25;
      const delay = Math.random() * 240;

      globalVFXPool.fallingProjectiles.acquire({
        startX, startY,
        targetX: tX, targetY: tY,
        type: 'dark_spear',
        color,
        secondaryColor,
        speed: 1200,
        delay,
        onImpact: (p) => {
          globalVFXPool.shockwaves.acquire({
            x: p.targetX, y: p.targetY,
            maxRadius: 80,
            width: 5,
            color: secondaryColor,
            duration: 260
          });
        }
      });
    }
  },

  /**
   * Energy Beam: Celestial/Dark/Lightning laser stream with inner core and terminal impact
   */
  spawnEnergyBeam(startX, startY, endX, endY, type = 'holy', options = {}) {
    const width = options.width || (type === 'lightning' ? 18 : 28);
    const color = options.color || (type === 'holy' ? '#ffffff' : (type === 'dark' ? '#f3e8ff' : '#ffffff'));
    const outerColor = options.outerColor || (type === 'holy' ? '#fde047' : (type === 'dark' ? '#7e22ce' : '#38bdf8'));
    const duration = options.duration || 450;

    let segments = [];
    if (type === 'lightning') {
      const steps = 6;
      segments.push({ x: startX, y: startY });
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const lx = startX + (endX - startX) * t + (Math.random() - 0.5) * 35;
        const ly = startY + (endY - startY) * t + (Math.random() - 0.5) * 20;
        segments.push({ x: lx, y: ly });
      }
      segments.push({ x: endX, y: endY });
    }

    globalVFXPool.beams.acquire({
      startX, startY, endX, endY,
      width,
      coreWidth: Math.max(4, Math.floor(width * 0.35)),
      type,
      color,
      outerColor,
      segments,
      duration
    });

    // Terminal impact blast
    globalVFXPool.shockwaves.acquire({
      x: endX, y: endY,
      maxRadius: width * 3.5,
      width: 6,
      color: outerColor,
      duration: 300
    });
  },

  /**
   * Tornado Vortex: Swirling conical wind funnel
   */
  spawnTornadoVortex(x, y, options = {}) {
    const radius = options.radius || 75;
    const color = options.color || '#67e8f9';
    const secondaryColor = options.secondaryColor || '#0891b2';
    const duration = options.duration || 1400;

    globalVFXPool.environmentalFields.acquire({
      x, y,
      type: 'tornado',
      radius,
      maxRadius: radius * 1.25,
      color,
      secondaryColor,
      vRot: 6.5,
      duration
    });

    // Rising wind ribbon particles
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.7;
      globalVFXPool.particles.acquire({
        x: x + Math.cos(angle) * r,
        y: y + Math.sin(angle) * (r * 0.4),
        vx: -Math.sin(angle) * 80,
        vy: -140 - Math.random() * 120,
        color,
        size: 3 + Math.random() * 3,
        maxLife: 600 + Math.random() * 300,
        blendMode: 'lighter'
      });
    }
  },

  /**
   * Ground Fissure: Earth shatter crack lines radiating outward
   */
  spawnGroundFissure(x, y, options = {}) {
    const radius = options.radius || 100;
    const color = options.color || '#ea580c';
    const secondaryColor = options.secondaryColor || '#451a03';
    const duration = options.duration || 1500;

    const fractures = [];
    const arms = 4 + Math.floor(Math.random() * 3);
    for (let a = 0; a < arms; a++) {
      const baseAngle = (a / arms) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const pts = [{ x: 0, y: 0 }];
      const segs = 3;
      for (let s = 1; s <= segs; s++) {
        const segDist = (radius / segs) * s;
        const segAngle = baseAngle + (Math.random() - 0.5) * 0.4;
        pts.push({
          x: Math.cos(segAngle) * segDist,
          y: Math.sin(segAngle) * (segDist * 0.45) // perspective flattening
        });
      }
      fractures.push(pts);
    }

    globalVFXPool.environmentalFields.acquire({
      x, y,
      type: 'fissure',
      radius,
      color,
      secondaryColor,
      fractures,
      duration
    });
  },

  /**
   * Holy Mandala: Concentric sacred geometry circle with divine runes
   */
  spawnHolyMandala(x, y, options = {}) {
    const radius = options.radius || 90;
    const color = options.color || '#fef08a';
    const secondaryColor = options.secondaryColor || '#ca8a04';
    const duration = options.duration || 1800;

    globalVFXPool.environmentalFields.acquire({
      x, y,
      type: 'mandala',
      radius,
      color,
      secondaryColor,
      vRot: 0.6,
      duration
    });
  },

  /**
   * Dark Shadow Rift: Void anomaly with dark tentacles
   */
  spawnDarkShadowRift(x, y, options = {}) {
    const radius = options.radius || 80;
    const color = options.color || '#a855f7';
    const secondaryColor = options.secondaryColor || '#1e1b4b';
    const duration = options.duration || 1500;

    globalVFXPool.environmentalFields.acquire({
      x, y,
      type: 'rift',
      radius,
      color,
      secondaryColor,
      vRot: -1.0,
      duration
    });
  },

  /**
   * Blade Slash: Sharp crescent slash blade with taper and glow
   */
  spawnBladeSlash(x, y, options = {}) {
    const radius = options.radius || 75;
    const arc = options.arc || Math.PI * 0.75;
    const rotation = options.angle !== undefined ? options.angle : 0;
    const color = options.color || '#f8fafc';
    const glowColor = options.glowColor || '#38bdf8';
    const thickness = options.thickness || 14;
    const duration = options.duration || 220;

    globalVFXPool.slashes.acquire({
      x, y,
      radius,
      arc,
      rotation,
      color,
      glowColor,
      thickness,
      duration
    });
  },

  /**
   * Orbital Blades: Floating spectral swords circling character
   */
  spawnOrbitalBlades(centerX, centerY, count = 4, options = {}) {
    const total = Math.min(6, Math.max(3, count));
    const orbitRadius = options.orbitRadius || 55;
    const orbitSpeed = options.orbitSpeed || 3.5;
    const color = options.color || '#ffd700';
    const duration = options.duration || 2200;

    for (let i = 0; i < total; i++) {
      globalVFXPool.spectralWeapons.acquire({
        orbitCenterX: centerX,
        orbitCenterY: centerY,
        orbitRadius,
        orbitSpeed,
        orbitAngle: (i / total) * Math.PI * 2,
        color,
        duration
      });
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ─── RENDERING DELEGATES (CALLED BY VFXORCHESTRATOR) ──────────────────────
  // ═════════════════════════════════════════════════════════════════════════

  renderEnvironmentalFields(ctx, fields) {
    for (const ef of fields) {
      if (!ef.active) continue;
      ctx.save();
      ctx.globalAlpha = ef.alpha * (ef.intensity !== undefined ? ef.intensity : 1.0);
      ctx.translate(ef.x, ef.y);

      if (ef.type === 'mandala') {
        ctx.scale(1.0, 0.45);
        ctx.rotate(ef.rotation);

        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ef.secondaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner star
        ctx.beginPath();
        const pts = 8;
        for (let p = 0; p < pts * 2; p++) {
          const r = p % 2 === 0 ? ef.radius * 0.9 : ef.radius * 0.45;
          const a = (p / (pts * 2)) * Math.PI * 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Center ring
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = ef.color;
        ctx.globalAlpha *= 0.3;
        ctx.fill();

      } else if (ef.type === 'fissure') {
        if (ef.fractures && ef.fractures.length > 0) {
          ctx.strokeStyle = ef.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = ef.color;
          ctx.shadowBlur = 8;
          for (const pts of ef.fractures) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
              ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.stroke();
          }
        }
      } else if (ef.type === 'tornado') {
        ctx.rotate(ef.rotation);
        ctx.scale(1.0, 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Spiral arms
        for (let a = 0; a < 3; a++) {
          ctx.beginPath();
          const startA = (a / 3) * Math.PI * 2;
          for (let r = 10; r <= ef.radius; r += 10) {
            const curA = startA + (r / ef.radius) * 1.5;
            const px = Math.cos(curA) * r;
            const py = Math.sin(curA) * r;
            if (r === 10) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = ef.secondaryColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (ef.type === 'frozen' || ef.type === 'burning') {
        ctx.scale(1.0, 0.45);
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius, 0, Math.PI * 2);
        ctx.fillStyle = ef.color;
        ctx.globalAlpha *= 0.35;
        ctx.fill();
        ctx.strokeStyle = ef.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (ef.type === 'rift') {
        ctx.scale(1.0, 0.4);
        ctx.rotate(ef.rotation);
        ctx.beginPath();
        ctx.arc(0, 0, ef.radius, 0, Math.PI * 2);
        ctx.fillStyle = ef.secondaryColor;
        ctx.globalAlpha *= 0.7;
        ctx.fill();
        ctx.strokeStyle = ef.color;
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      ctx.restore();
    }
  },

  renderSlashes(ctx, slashes) {
    for (const sl of slashes) {
      if (!sl.active) continue;
      const alpha = Math.max(0, 1 - sl.progress);
      ctx.save();
      ctx.translate(sl.x, sl.y);
      ctx.rotate(sl.rotation);
      ctx.globalAlpha = alpha;

      // Crescent blade
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, -sl.arc / 2, sl.arc / 2);
      ctx.strokeStyle = sl.glowColor;
      ctx.lineWidth = sl.thickness;
      ctx.shadowColor = sl.glowColor;
      ctx.shadowBlur = 10;
      ctx.stroke();

      // Sharp inner blade edge
      ctx.beginPath();
      ctx.arc(0, 0, sl.radius, -sl.arc / 2, sl.arc / 2);
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = Math.max(2, sl.thickness * 0.35);
      ctx.stroke();

      ctx.restore();
    }
  },

  renderBeams(ctx, beams) {
    for (const b of beams) {
      if (!b.active) continue;
      ctx.save();
      ctx.globalAlpha = b.alpha;

      if (b.segments && b.segments.length > 1) {
        // Lightning fractal beam
        ctx.beginPath();
        ctx.moveTo(b.segments[0].x, b.segments[0].y);
        for (let i = 1; i < b.segments.length; i++) {
          ctx.lineTo(b.segments[i].x, b.segments[i].y);
        }
        ctx.strokeStyle = b.outerColor;
        ctx.lineWidth = b.width;
        ctx.shadowColor = b.outerColor;
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.segments[0].x, b.segments[0].y);
        for (let i = 1; i < b.segments.length; i++) {
          ctx.lineTo(b.segments[i].x, b.segments[i].y);
        }
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.coreWidth;
        ctx.stroke();
      } else {
        // Continuous beam
        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.strokeStyle = b.outerColor;
        ctx.lineWidth = b.width;
        ctx.shadowColor = b.outerColor;
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(b.startX, b.startY);
        ctx.lineTo(b.endX, b.endY);
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.coreWidth;
        ctx.stroke();
      }

      ctx.restore();
    }
  },

  renderFallingProjectiles(ctx, projectiles) {
    for (const fp of projectiles) {
      if (!fp.active || fp.delay > 0) continue;

      ctx.save();
      ctx.translate(fp.x, fp.y);
      ctx.rotate(fp.angle);

      if (fp.type === 'meteor') {
        // Fiery tail
        ctx.beginPath();
        ctx.moveTo(-45 * fp.scale, 0);
        ctx.lineTo(0, -12 * fp.scale);
        ctx.lineTo(15 * fp.scale, 0);
        ctx.lineTo(0, 12 * fp.scale);
        ctx.closePath();
        ctx.fillStyle = fp.secondaryColor;
        ctx.shadowColor = fp.color;
        ctx.shadowBlur = 15;
        ctx.fill();

        // Fiery nucleus
        ctx.beginPath();
        ctx.arc(0, 0, 10 * fp.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

      } else if (fp.type === 'arrow') {
        // Wooden/steel shaft
        ctx.beginPath();
        ctx.moveTo(-18, 0);
        ctx.lineTo(12, 0);
        ctx.strokeStyle = fp.secondaryColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(12, -4);
        ctx.lineTo(18, 0);
        ctx.lineTo(12, 4);
        ctx.closePath();
        ctx.fillStyle = fp.color;
        ctx.fill();

        // Fletching
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-18, 4);
        ctx.strokeStyle = fp.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (fp.type === 'holy_sword') {
        // Golden blade
        ctx.beginPath();
        ctx.moveTo(22 * fp.scale, 0);
        ctx.lineTo(-15 * fp.scale, -6 * fp.scale);
        ctx.lineTo(-15 * fp.scale, 6 * fp.scale);
        ctx.closePath();
        ctx.fillStyle = fp.color;
        ctx.shadowColor = fp.secondaryColor;
        ctx.shadowBlur = 10;
        ctx.fill();

        // Crossguard
        ctx.beginPath();
        ctx.moveTo(-15 * fp.scale, -10 * fp.scale);
        ctx.lineTo(-15 * fp.scale, 10 * fp.scale);
        ctx.strokeStyle = fp.secondaryColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Hilt
        ctx.beginPath();
        ctx.moveTo(-15 * fp.scale, 0);
        ctx.lineTo(-24 * fp.scale, 0);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

      } else if (fp.type === 'ice_shard') {
        // Faceted crystal diamond
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(0, -7);
        ctx.lineTo(-18, 0);
        ctx.lineTo(0, 7);
        ctx.closePath();
        ctx.fillStyle = fp.color;
        ctx.shadowColor = fp.secondaryColor;
        ctx.shadowBlur = 8;
        ctx.fill();

      } else if (fp.type === 'dark_spear') {
        // Dark void spear
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(-15, -5);
        ctx.lineTo(-25, 0);
        ctx.lineTo(-15, 5);
        ctx.closePath();
        ctx.fillStyle = fp.secondaryColor;
        ctx.shadowColor = fp.color;
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      ctx.restore();
    }
  },

  renderSpectralWeapons(ctx, weapons) {
    for (const sw of weapons) {
      if (!sw.active) continue;
      ctx.save();
      ctx.translate(sw.x, sw.y);
      ctx.rotate(sw.angle);

      // Glowing spectral dagger/blade
      ctx.beginPath();
      ctx.moveTo(16 * sw.scale, 0);
      ctx.lineTo(-12 * sw.scale, -5 * sw.scale);
      ctx.lineTo(-8 * sw.scale, 0);
      ctx.lineTo(-12 * sw.scale, 5 * sw.scale);
      ctx.closePath();
      ctx.fillStyle = sw.color;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.restore();
    }
  }
};
