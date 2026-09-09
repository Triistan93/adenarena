/**
 * PrototypeSkillVfx.js
 * 
 * High-Impact 2D VFX Engine for Aden Arena Prototype V2:
 * - 16 Endgame Ultimate & Master Ultimate unique visual signatures
 * - Directional Projectiles, Ground Eruptions, Beams, Lightning, Slashes, Totems, Domes
 * - Dynamic Camera shake and screen flash/darken integration
 * - Floating Combat Text (Damage, Crits, Heals, Stagger, Ultimate callouts)
 */

export class PrototypeSkillVfx {
  constructor() {
    this.projectiles = [];
    this.groundEffects = [];
    this.meteors = [];
    this.beams = [];
    this.slashes = [];
    this.totems = [];
    this.particles = [];
    this.damageTexts = [];
    this.darkenAlpha = 0;
    this.targetDarkenAlpha = 0;
    this.screenFlashAlpha = 0;
  }

  // --- 1. PROJECTILES (Fireball, Aqua Orb, Arcane Bolt, etc.) ---
  spawnProjectile(sourcePos, targetPos, config = {}, onImpact) {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const dist = Math.hypot(dx, dy);
    const speed = config.speed || 1100;
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
      type: config.type || 'generic',
      onImpact,
      tailHistory: []
    });
  }

  // --- 2. GROUND ERUPTIONS (Magma Spike, Ice Lance, etc.) ---
  spawnGroundEruption(feetPos, config = {}, onHit) {
    this.groundEffects.push({
      x: feetPos.x,
      y: feetPos.y,
      life: 0,
      maxLife: config.duration || 850,
      spikeCount: config.spikeCount || 5,
      heights: config.heights || [60, 95, 120, 90, 50],
      spreads: config.spreads || [-40, -18, 0, 22, 42],
      color: config.color || '#ff4400',
      glowColor: config.glowColor || '#ffaa00',
      hitDispatched: false,
      onHit
    });
  }

  // --- 3. METEORS (Sorcerer Meteor & Master Meteor) ---
  spawnMeteor(centerPos, feetPos, isMaster = false, onImpact) {
    this.targetDarkenAlpha = isMaster ? 0.85 : 0.65;
    const startX = centerPos.x - (isMaster ? 280 : 220);
    const startY = -140;

    this.meteors.push({
      x: startX,
      y: startY,
      startX,
      startY,
      targetX: centerPos.x,
      targetY: centerPos.y,
      feetX: feetPos.x,
      feetY: feetPos.y,
      progress: 0,
      duration: isMaster ? 850 : 750,
      isMaster,
      trail: [],
      onImpact
    });
  }

  // --- 4. TITANBREAKER (Human Fighter Leaping Ground Fracture) ---
  spawnTitanbreaker(heroPos, targetCenter, targetFeet, isMaster = false, onImpact) {
    this.targetDarkenAlpha = isMaster ? 0.5 : 0.3;
    // Ground shockwave cracks
    this.groundEffects.push({
      x: targetFeet.x,
      y: targetFeet.y,
      life: 0,
      maxLife: isMaster ? 1100 : 800,
      isFracture: true,
      isMaster,
      color: isMaster ? '#f59e0b' : '#fbbf24',
      hitDispatched: false,
      onHit: () => {
        this.spawnBurst(targetFeet.x, targetFeet.y, isMaster ? 50 : 30, '#fef08a', 360, 5);
        if (onImpact) onImpact(targetCenter.x, targetCenter.y);
      }
    });
  }

  // --- 5. TIDAL ASCENSION (Elf Fighter Water Cyclone Geyser) ---
  spawnTidalAscension(targetCenter, targetFeet, isMaster = false, onImpact) {
    this.beams.push({
      x: targetCenter.x,
      y: targetFeet.y,
      isGeyser: true,
      isMaster,
      life: 0,
      maxLife: isMaster ? 1000 : 750,
      color: isMaster ? '#93c5fd' : '#38bdf8',
      glowColor: isMaster ? '#ffffff' : '#0284c7',
      onImpact
    });
  }

  // --- 6. GLACIAL CATACLYSM (Elf Mage Frozen Comet & Frost Monoliths) ---
  spawnGlacialCataclysm(targetCenter, targetFeet, isMaster = false, onImpact) {
    this.screenFlashAlpha = 0.5;
    this.targetDarkenAlpha = 0.5;

    this.meteors.push({
      x: targetCenter.x - 120,
      y: -120,
      startX: targetCenter.x - 120,
      startY: -120,
      targetX: targetCenter.x,
      targetY: targetCenter.y,
      feetX: targetFeet.x,
      feetY: targetFeet.y,
      progress: 0,
      duration: 700,
      isIceComet: true,
      isMaster,
      trail: [],
      onImpact: () => {
        this.spawnBurst(targetCenter.x, targetCenter.y, isMaster ? 45 : 25, '#bae6fd', 320, 5);
        if (onImpact) onImpact(targetCenter.x, targetCenter.y);
      }
    });
  }

  // --- 7. ABYSSAL RUPTURE (Dark Elf Fighter Void Tear & Shadow Flurry) ---
  spawnAbyssalRupture(targetCenter, isMaster = false, onImpact) {
    this.targetDarkenAlpha = isMaster ? 0.75 : 0.5;
    const slashCount = isMaster ? 8 : 4;

    for (let i = 0; i < slashCount; i++) {
      setTimeout(() => {
        const ang = (Math.PI / slashCount) * i;
        this.slashes.push({
          x1: targetCenter.x + Math.cos(ang) * 110,
          y1: targetCenter.y + Math.sin(ang) * 110,
          x2: targetCenter.x - Math.cos(ang) * 110,
          y2: targetCenter.y - Math.sin(ang) * 110,
          life: 0,
          maxLife: 260,
          color: isMaster ? '#a855f7' : '#c084fc',
          glowColor: isMaster ? '#4ade80' : '#22c55e' // Venomous green accent
        });
        this.spawnBurst(targetCenter.x, targetCenter.y, 10, '#22c55e', 220, 3);
        if (i === slashCount - 1 && onImpact) onImpact(targetCenter.x, targetCenter.y);
      }, i * 110);
    }
  }

  // --- 8. TEMPEST OF THE ABYSS (Dark Elf Mage Black Lightning Tornado) ---
  spawnTempestOfAbyss(targetCenter, isMaster = false, onImpact) {
    this.screenFlashAlpha = 0.8;
    this.targetDarkenAlpha = 0.6;

    this.beams.push({
      x: targetCenter.x,
      targetY: targetCenter.y,
      isVoidLightning: true,
      isMaster,
      life: 0,
      maxLife: isMaster ? 900 : 650,
      color: '#e9d5ff',
      glowColor: isMaster ? '#7e22ce' : '#3b82f6',
      onImpact
    });
  }

  // --- 9. WORLDBREAKER ROAR (Orc Fighter Primal Volcanic Roar) ---
  spawnWorldbreakerRoar(heroCenter, targetCenter, isMaster = false, onImpact) {
    this.targetDarkenAlpha = 0.4;
    this.beams.push({
      x: heroCenter.x,
      y: heroCenter.y,
      targetX: targetCenter.x,
      targetY: targetCenter.y,
      isSonicCone: true,
      isMaster,
      life: 0,
      maxLife: isMaster ? 950 : 700,
      color: '#f97316',
      glowColor: '#ef4444',
      onImpact
    });
  }

  // --- 10. APOCALYPSE TOTEM (Orc Shaman Ancestral Totem Obelisk) ---
  spawnApocalypseTotem(targetFeet, targetCenter, isMaster = false, onImpact) {
    this.targetDarkenAlpha = 0.55;
    this.totems.push({
      x: targetFeet.x,
      y: targetFeet.y - 100,
      groundY: targetFeet.y,
      isMaster,
      life: 0,
      maxLife: isMaster ? 1300 : 950,
      pulseTimer: 0,
      onImpact
    });
  }

  // --- 11. FLOATING DAMAGE TEXT ---
  spawnDamageText(text, x, y, isCrit = false, isUltimate = false, isHeal = false) {
    this.damageTexts.push({
      text: String(text),
      x: x + (Math.random() - 0.5) * 24,
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
    // Darken & Flash transitions
    this.darkenAlpha += (this.targetDarkenAlpha - this.darkenAlpha) * 0.08;
    if (this.targetDarkenAlpha > 0 && Math.random() < 0.03) {
      this.targetDarkenAlpha = 0;
    }
    if (this.screenFlashAlpha > 0) {
      this.screenFlashAlpha = Math.max(0, this.screenFlashAlpha - deltaMs * 0.0035);
    }

    // 1. Projectiles
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

    // 2. Ground Effects & Fractures
    for (let i = this.groundEffects.length - 1; i >= 0; i--) {
      const g = this.groundEffects[i];
      g.life += deltaMs;
      if (!g.hitDispatched && g.life >= 180) {
        g.hitDispatched = true;
        if (g.onHit) g.onHit(g.x, g.y);
      }
      if (g.life >= g.maxLife) {
        this.groundEffects.splice(i, 1);
      }
    }

    // 3. Meteors & Comets
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.progress += deltaMs / m.duration;
      m.x = m.startX + (m.targetX - m.startX) * m.progress;
      m.y = m.startY + (m.targetY - m.startY) * m.progress;
      m.trail.push({ x: m.x, y: m.y });
      if (m.trail.length > 10) m.trail.shift();

      if (m.progress >= 1.0) {
        if (m.isIceComet) {
          this.spawnBurst(m.targetX, m.targetY, 40, '#38bdf8', 340, 5);
        } else {
          this.spawnBurst(m.targetX, m.targetY, m.isMaster ? 60 : 40, '#ff4400', 380, 6);
        }
        if (m.onImpact) m.onImpact(m.targetX, m.targetY);
        this.meteors.splice(i, 1);
      }
    }

    // 4. Beams, Geysers, Sonic Cones
    for (let i = this.beams.length - 1; i >= 0; i--) {
      const b = this.beams[i];
      b.life += deltaMs;
      if (b.life < deltaMs * 2 && b.onImpact) {
        b.onImpact(b.x || b.targetX, b.targetY || b.y);
      }
      if (b.life >= b.maxLife) {
        this.beams.splice(i, 1);
      }
    }

    // 5. Slashes
    for (let i = this.slashes.length - 1; i >= 0; i--) {
      const s = this.slashes[i];
      s.life += deltaMs;
      if (s.life >= s.maxLife) {
        this.slashes.splice(i, 1);
      }
    }

    // 6. Totems
    for (let i = this.totems.length - 1; i >= 0; i--) {
      const t = this.totems[i];
      t.life += deltaMs;
      t.pulseTimer += deltaMs;
      if (t.pulseTimer >= 220) {
        t.pulseTimer = 0;
        this.spawnBurst(t.x, t.groundY, 12, '#ffaa00', 160, 3);
        if (t.onImpact && t.life < deltaMs * 4) t.onImpact(t.x, t.groundY);
      }
      if (t.life >= t.maxLife) {
        this.totems.splice(i, 1);
      }
    }

    // 7. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += deltaMs;
      pt.x += (pt.vx * deltaMs) / 1000;
      pt.y += (pt.vy * deltaMs) / 1000;
      pt.vy += (200 * deltaMs) / 1000;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 8. Damage Texts
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

    // C. Ground Effects & Fractures
    this.groundEffects.forEach(g => {
      ctx.save();
      const progress = g.life / g.maxLife;
      const alpha = 1 - progress;
      ctx.globalAlpha = Math.max(0, alpha);

      if (g.isFracture) {
        ctx.strokeStyle = g.color;
        ctx.lineWidth = g.isMaster ? 6 : 4;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        // Radial fissure cracks
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          const r = (g.isMaster ? 130 : 90) * Math.min(1, progress * 3);
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(g.x + Math.cos(a) * r, g.y + Math.sin(a) * r * 0.35);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.ellipse(g.x, g.y, 65, 16, 0, 0, Math.PI * 2);
        ctx.fill();

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
      }
      ctx.restore();
    });

    // D. Beams, Geysers, Sonic Cones
    this.beams.forEach(b => {
      ctx.save();
      const progress = b.life / b.maxLife;
      const alpha = 1 - progress;
      ctx.globalAlpha = Math.max(0, alpha);

      if (b.isGeyser) {
        // Ascending water cyclone
        ctx.fillStyle = b.color;
        const w = (b.isMaster ? 80 : 50) * Math.sin(progress * Math.PI);
        ctx.fillRect(b.x - w * 0.5, b.y - 280, w, 280);
      } else if (b.isSonicCone) {
        // Sonic Roar Wave
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.isMaster ? 8 : 5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, progress * 450, -0.4, 0.4);
        ctx.stroke();
      } else if (b.isVoidLightning) {
        // Dark Lightning Tornado
        ctx.strokeStyle = b.glowColor;
        ctx.lineWidth = b.isMaster ? 6 : 4;
        ctx.beginPath();
        ctx.moveTo(b.x, 0);
        ctx.lineTo(b.x - 30, b.targetY * 0.5);
        ctx.lineTo(b.x + 30, b.targetY * 0.8);
        ctx.lineTo(b.x, b.targetY);
        ctx.stroke();
      }
      ctx.restore();
    });

    // E. Slashes
    this.slashes.forEach(s => {
      ctx.save();
      const progress = s.life / s.maxLife;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 5;
      ctx.shadowColor = s.glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
      ctx.restore();
    });

    // F. Totems
    this.totems.forEach(t => {
      ctx.save();
      const progress = t.life / t.maxLife;
      ctx.globalAlpha = Math.max(0, 1 - progress);
      // Carved Totem Pillar
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.fillRect(t.x - 18, t.y - 120, 36, 120);
      ctx.strokeRect(t.x - 18, t.y - 120, 36, 120);
      // Glowing Totem Eyes
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(t.x - 8, t.y - 80, 4, 0, Math.PI * 2);
      ctx.arc(t.x + 8, t.y - 80, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // G. Projectiles
    this.projectiles.forEach(p => {
      ctx.save();
      p.tailHistory.forEach((t, idx) => {
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = (idx / p.tailHistory.length) * 0.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowColor = p.glowColor;
      ctx.shadowBlur = 16;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // H. Meteors
    this.meteors.forEach(m => {
      ctx.save();
      m.trail.forEach((t, idx) => {
        ctx.fillStyle = m.isIceComet ? '#38bdf8' : '#ff7700';
        ctx.globalAlpha = (idx / m.trail.length) * 0.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 25, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowColor = m.isIceComet ? '#bae6fd' : '#ffcc00';
      ctx.shadowBlur = 24;
      ctx.fillStyle = m.isIceComet ? '#e0f2fe' : '#ffe066';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // I. Particles
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

    // J. Floating Damage Texts
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
