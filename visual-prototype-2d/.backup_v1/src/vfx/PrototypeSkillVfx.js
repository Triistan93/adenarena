/**
 * PrototypeSkillVfx.js
 * 
 * High-impact VFX engine for 2D prototype skills:
 * - Fireball & Thunder Orb Projectiles
 * - Ground Eruptions (Magma Spike & Crimson Supernova)
 * - Skyfall Ultimates (Meteor & Judgement of Thor)
 * - Holy Rays & Sanctuary Divine Domes
 * - Chain Lightning & Electric Arcs
 * - Blood Siphon / Vampiric Drainage Particles (Enemy -> Hero)
 * - Shadow Step & Assassin Clones
 * - Floating Numbers (Damage, Crits, Heals, Stun labels)
 */

export class PrototypeSkillVfx {
  constructor() {
    this.projectiles = [];
    this.groundEffects = [];
    this.meteors = [];
    this.particles = [];
    this.beams = [];
    this.damageTexts = [];
    this.shadowClones = [];
    this.darkenAlpha = 0;
    this.targetDarkenAlpha = 0;
    this.screenFlashAlpha = 0;
  }

  // --- 1. LINEAR PROJECTILE (Fireball, Thunder Orb) ---
  spawnProjectile(sourcePos, targetPos, config = {}, onImpact) {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const dist = Math.hypot(dx, dy);
    const speed = config.speed || 1050;
    const duration = (dist / speed) * 1000;

    this.projectiles.push({
      x: sourcePos.x,
      y: sourcePos.y,
      startX: sourcePos.x,
      startY: sourcePos.y,
      targetX: targetPos.x,
      targetY: targetPos.y,
      progress: 0,
      duration,
      radius: config.radius || 14,
      color: config.coreColor || '#ff7700',
      glowColor: config.glowColor || '#ffcc00',
      type: config.type || 'fire',
      onImpact,
      tailHistory: []
    });
  }

  // --- 2. MAGMA SPIKE GROUND ERUPTION ---
  spawnMagmaSpike(feetPos, onHit) {
    this.groundEffects.push({
      x: feetPos.x,
      y: feetPos.y,
      life: 0,
      maxLife: 850,
      spikeCount: 5,
      heights: [60, 95, 120, 90, 50],
      spreads: [-40, -18, 0, 22, 42],
      color: '#ff4400',
      glowColor: '#ffaa00',
      hitDispatched: false,
      onHit
    });
  }

  // --- 3. CRIMSON SUPERNOVA (Death Knight Ground Eruption) ---
  spawnCrimsonEruption(feetPos, onHit) {
    this.groundEffects.push({
      x: feetPos.x,
      y: feetPos.y,
      life: 0,
      maxLife: 950,
      spikeCount: 7,
      heights: [80, 130, 160, 140, 110, 85, 50],
      spreads: [-60, -40, -15, 10, 35, 55, 75],
      color: '#dc2626',
      glowColor: '#7f1d1d',
      hitDispatched: false,
      onHit
    });
  }

  // --- 4. METEOR ULTIMATE ---
  spawnMeteor(centerPos, feetPos, onImpact) {
    this.targetDarkenAlpha = 0.65;

    const startX = centerPos.x - 220;
    const startY = -120;
    const targetX = centerPos.x;
    const targetY = centerPos.y;

    this.meteors.push({
      x: startX,
      y: startY,
      startX,
      startY,
      targetX,
      targetY,
      feetX: feetPos.x,
      feetY: feetPos.y,
      progress: 0,
      duration: 750,
      trail: [],
      onImpact
    });
  }

  // --- 5. HOLY RAY / BEAM (Paladin) ---
  spawnHolyRay(targetPos, onImpact) {
    this.beams.push({
      x: targetPos.x,
      targetY: targetPos.y,
      width: 48,
      life: 0,
      maxLife: 450,
      color: '#fef08a',
      glowColor: '#eab308',
      onImpact
    });
  }

  // --- 6. MEGA LIGHTNING STRIKE (Spellsinger Ultimate) ---
  spawnMegaLightning(targetPos, onImpact) {
    this.screenFlashAlpha = 0.85; // White flash
    this.targetDarkenAlpha = 0.5;

    // Generate jagged lightning bolts
    const segments = [];
    let curX = targetPos.x;
    let curY = 0;
    while (curY < targetPos.y) {
      const nextY = Math.min(targetPos.y, curY + 25 + Math.random() * 20);
      const nextX = curX + (Math.random() - 0.5) * 45;
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
      curX = nextX;
      curY = nextY;
    }

    this.beams.push({
      segments,
      x: targetPos.x,
      targetY: targetPos.y,
      isLightning: true,
      life: 0,
      maxLife: 400,
      color: '#ffffff',
      glowColor: '#38bdf8',
      onImpact
    });
  }

  // --- 7. CHAIN LIGHTNING ARC ---
  spawnChainLightning(sourcePos, targetPos, onImpact) {
    const segments = [];
    let curX = sourcePos.x;
    let curY = sourcePos.y;
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const targetInterpX = sourcePos.x + (targetPos.x - sourcePos.x) * t;
      const targetInterpY = sourcePos.y + (targetPos.y - sourcePos.y) * t;
      const nextX = targetInterpX + (i === steps ? 0 : (Math.random() - 0.5) * 35);
      const nextY = targetInterpY + (i === steps ? 0 : (Math.random() - 0.5) * 30);
      segments.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });
      curX = nextX;
      curY = nextY;
    }

    this.beams.push({
      segments,
      isLightning: true,
      life: 0,
      maxLife: 280,
      color: '#67e8f9',
      glowColor: '#0284c7',
      onImpact
    });
  }

  // --- 8. VAMPIRIC DRAIN ORBS (Monster -> Hero) ---
  spawnVampiricDrain(monsterPos, heroPos, onHit) {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6;
      const dist = 30 + Math.random() * 25;
      this.projectiles.push({
        x: monsterPos.x + Math.cos(angle) * dist,
        y: monsterPos.y + Math.sin(angle) * dist,
        startX: monsterPos.x,
        startY: monsterPos.y,
        targetX: heroPos.x,
        targetY: heroPos.y,
        progress: 0,
        duration: 550 + i * 60,
        radius: 6,
        color: '#ef4444',
        glowColor: '#991b1b',
        type: 'vampiric',
        onImpact: i === 0 ? onHit : null,
        tailHistory: []
      });
    }
  }

  // --- 9. SHADOW CLONES FRENZY (Assassin Ultimate) ---
  spawnShadowClones(targetPos, onImpact) {
    const angles = [0.2, 1.8, 3.4, 4.9];
    angles.forEach((ang, idx) => {
      setTimeout(() => {
        this.spawnBurst(targetPos.x, targetPos.y, 14, '#a855f7', 260, 4);
        this.beams.push({
          x1: targetPos.x + Math.cos(ang) * 90,
          y1: targetPos.y + Math.sin(ang) * 90,
          x2: targetPos.x - Math.cos(ang) * 90,
          y2: targetPos.y - Math.sin(ang) * 90,
          isSlash: true,
          life: 0,
          maxLife: 220,
          color: '#e9d5ff',
          glowColor: '#7e22ce',
          onImpact: idx === angles.length - 1 ? onImpact : null
        });
      }, idx * 120);
    });
  }

  // --- 10. SANCTUARY DOME (Paladin Ultimate) ---
  spawnSanctuary(heroPos, onImpact) {
    this.targetDarkenAlpha = 0.4;
    this.beams.push({
      isDome: true,
      x: heroPos.x,
      y: heroPos.y,
      radius: 90,
      life: 0,
      maxLife: 700,
      color: '#fef08a',
      glowColor: '#fbbf24',
      onImpact
    });
  }

  // --- 11. FLOATING COMBAT TEXT ---
  spawnDamageText(text, x, y, isCrit = false, isUltimate = false, isHeal = false) {
    this.damageTexts.push({
      text: String(text),
      x: x + (Math.random() - 0.5) * 20,
      y: y - 10,
      vy: isHeal ? -1.8 : -2.8,
      life: 0,
      maxLife: 950,
      isCrit,
      isUltimate,
      isHeal
    });
  }

  // --- 12. PARTICLE BURST ---
  spawnBurst(x, y, count, color, speedMax = 220, size = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * speedMax;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 300 + Math.random() * 400,
        size: 1 + Math.random() * size,
        color
      });
    }
  }

  update(deltaMs) {
    // 1. Darken interpolation
    this.darkenAlpha += (this.targetDarkenAlpha - this.darkenAlpha) * 0.08;
    if (this.targetDarkenAlpha > 0 && Math.random() < 0.03) {
      this.targetDarkenAlpha = 0;
    }

    // Flash fade
    if (this.screenFlashAlpha > 0) {
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - deltaMs * 0.0035);
    }

    // 2. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += deltaMs / p.duration;

      p.x = p.startX + (p.targetX - p.startX) * p.progress;
      p.y = p.startY + (p.targetY - p.startY) * p.progress;

      p.tailHistory.push({ x: p.x, y: p.y });
      if (p.tailHistory.length > 8) p.tailHistory.shift();

      if (p.progress >= 1.0) {
        this.spawnBurst(p.targetX, p.targetY, 20, p.glowColor, 200, 4);
        if (p.onImpact) p.onImpact(p.targetX, p.targetY);
        this.projectiles.splice(i, 1);
      }
    }

    // 3. Update Ground Effects
    for (let i = this.groundEffects.length - 1; i >= 0; i--) {
      const g = this.groundEffects[i];
      g.life += deltaMs;

      if (!g.hitDispatched && g.life >= 180) {
        g.hitDispatched = true;
        this.spawnBurst(g.x, g.y, 22, g.color, 240, 4);
        if (g.onHit) g.onHit(g.x, g.y);
      }

      if (g.life >= g.maxLife) {
        this.groundEffects.splice(i, 1);
      }
    }

    // 4. Update Meteors
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.progress += deltaMs / m.duration;
      m.x = m.startX + (m.targetX - m.startX) * m.progress;
      m.y = m.startY + (m.targetY - m.startY) * m.progress;

      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 10) m.trail.shift();

      if (m.progress >= 1.0) {
        this.spawnBurst(m.targetX, m.targetY, 45, '#ff4400', 380, 6);
        this.spawnBurst(m.feetX, m.feetY, 35, '#ffcc00', 300, 5);
        if (m.onImpact) m.onImpact(m.targetX, m.targetY);
        this.meteors.splice(i, 1);
      }
    }

    // 5. Update Beams & Slashes
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.life += deltaMs;

      if (b.life < deltaMs * 2 && b.onImpact) {
        b.onImpact(b.x || b.x1, b.targetY || b.y1);
      }

      if (b.life >= b.maxLife) {
        this.beams.splice(i, 1);
      }
    }

    // 6. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += deltaMs;
      pt.x += (pt.vx * deltaMs) / 1000;
      pt.y += (pt.vy * deltaMs) / 1000;
      pt.vy += (200 * deltaMs) / 1000; // gravity
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 7. Update Damage Texts
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const dt = this.damageTexts[i];
      dt.life += deltaMs;
      dt.y += (dt.vy * deltaMs) / 16;
      dt.vy *= 0.94;
      if (dt.life >= dt.maxLife) {
        this.damageTexts.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // A. Darken Overlay
    if (this.darkenAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(0, 0, 0, ${this.darkenAlpha})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // B. Screen Flash
    if (this.screenFlashAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${this.screenFlashAlpha})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    // C. Ground Effects
    this.groundEffects.forEach(g => {
      ctx.save();
      const progress = g.life / g.maxLife;
      const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Fissure base glow
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.ellipse(g.x, g.y, 65, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rock / Magma Spikes
      for (let i = 0; i < g.spikeCount; i++) {
        const sx = g.x + g.spreads[i];
        const sh = g.heights[i] * Math.sin(Math.min(1, g.life / 200) * Math.PI * 0.5);
        ctx.fillStyle = i % 2 === 0 ? g.color : g.glowColor;
        ctx.beginPath();
        ctx.moveTo(sx - 12, g.y);
        ctx.lineTo(sx, g.y - sh);
        ctx.lineTo(sx + 12, g.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    // D. Beams, Lightning, Slashes, Domes
    this.beams.forEach(b => {
      ctx.save();
      const progress = b.life / b.maxLife;
      const alpha = 1 - progress;
      ctx.globalAlpha = Math.max(0, alpha);

      if (b.isDome) {
        ctx.strokeStyle = b.glowColor;
        ctx.lineWidth = 4;
        ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * (0.8 + progress * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (b.isSlash) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(b.x1, b.y1);
        ctx.lineTo(b.x2, b.y2);
        ctx.stroke();
      } else if (b.isLightning && b.segments) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = b.glowColor;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        b.segments.forEach(s => {
          ctx.moveTo(s.x1, s.y1);
          ctx.lineTo(s.x2, s.y2);
        });
        ctx.stroke();
      } else {
        // Vertical Holy Ray
        ctx.fillStyle = b.glowColor;
        ctx.fillRect(b.x - b.width * 0.5, 0, b.width, b.targetY);
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - b.width * 0.25, 0, b.width * 0.5, b.targetY);
      }
      ctx.restore();
    });

    // E. Projectiles
    this.projectiles.forEach(p => {
      ctx.save();
      // Glow trail
      p.tailHistory.forEach((t, idx) => {
        const trAlpha = (idx / p.tailHistory.length) * 0.4;
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = trAlpha;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Core
      ctx.globalAlpha = 1;
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = 16;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // F. Meteors
    this.meteors.forEach(m => {
      ctx.save();
      m.trail.forEach((t, idx) => {
        ctx.fillStyle = '#ff7700';
        ctx.globalAlpha = (idx / m.trail.length) * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 25, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 24;
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // G. Particles
    this.particles.forEach(pt => {
      ctx.save();
      const alpha = 1 - pt.life / pt.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // H. Floating Damage / Heal Numbers
    this.damageTexts.forEach(dt => {
      ctx.save();
      const alpha = 1 - dt.life / dt.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.textAlign = 'center';

      if (dt.isHeal) {
        ctx.font = 'bold 22px Cinzel, sans-serif';
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#15803d';
        ctx.shadowBlur = 8;
        ctx.fillText(`+${dt.text}`, dt.x, dt.y);
      } else if (dt.isUltimate) {
        ctx.font = '900 32px Cinzel, sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 14;
        ctx.fillText(dt.text, dt.x, dt.y);
      } else if (dt.isCrit) {
        ctx.font = 'bold 26px Cinzel, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#991b1b';
        ctx.shadowBlur = 10;
        ctx.fillText(`CRIT ${dt.text}`, dt.x, dt.y);
      } else {
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.fillText(dt.text, dt.x, dt.y);
      }
      ctx.restore();
    });
  }
}
