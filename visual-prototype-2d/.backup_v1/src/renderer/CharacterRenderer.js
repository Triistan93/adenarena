/**
 * CharacterRenderer.js
 * 
 * High-performance 2D Canvas Renderer for animated combat actors.
 * Handles sprite extraction, drop shadows, hit flash, procedural hover, and anchor debug markers.
 */

export class CharacterRenderer {
  constructor() {
    this.imageCache = new Map();
    this.debugAnchors = false;
    this.staticComparisonMode = false;
  }

  /**
   * Preload an image asset and cache it
   */
  async loadImage(src) {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[CharacterRenderer] Failed to load image: ${src}`);
        resolve(null);
      };
    });
  }

  /**
   * Render Actor onto Canvas Context
   */
  render(ctx, actor, animator) {
    if (!actor || !ctx) return;

    ctx.save();

    const pos = actor.position;
    const halfW = actor.width * 0.5;
    const halfH = actor.height * 0.5;
    const breathY = animator ? animator.breathOffsetY : 0;

    // 1. Soft Dynamic Drop Shadow at Feet
    const feetAnchor = actor.getAnchor('feet');
    ctx.save();
    ctx.translate(feetAnchor.x, feetAnchor.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, halfW * 0.38, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.filter = 'blur(3px)';
    ctx.fill();
    ctx.restore();

    // 2. Static Card Comparison Mode
    if (this.staticComparisonMode) {
      this.renderStaticCard(ctx, actor, pos, breathY);
      ctx.restore();
      return;
    }

    // 3. 2D Animated Character Sprite Render
    const clip = animator ? animator.getCurrentClip() : null;
    const frameIndex = animator ? animator.getCurrentFrame() : 0;

    let spriteImg = null;
    if (clip && actor.assets) {
      const assetPath = actor.assets[clip.fileKey] || actor.assets.idle;
      spriteImg = this.imageCache.get(assetPath);
    }

    if (spriteImg) {
      const fw = clip.frameWidth || 128;
      const fh = clip.frameHeight || 128;
      const sx = frameIndex * fw;
      const sy = 0;

      ctx.save();
      ctx.translate(pos.x, pos.y + breathY);
      if (actor.flipX) {
        ctx.scale(-1, 1);
      }

      // Draw Sprite Frame Centered
      const dw = actor.width;
      const dh = actor.height;
      const dx = -dw * 0.5;
      const dy = -dh * 0.5;

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(spriteImg, sx, sy, fw, fh, dx, dy, dw, dh);

      // Hit Flash (White / Crimson Overlay)
      if (actor.hitTimer > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = `rgba(255, 230, 230, ${Math.min(0.75, actor.hitTimer / 150)})`;
        ctx.fillRect(dx, dy, dw, dh);
        ctx.restore();
      }

      // Casting Power Aura Glow
      if (actor.isCasting) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const castGlow = ctx.createRadialGradient(0, -dh * 0.1, 10, 0, -dh * 0.1, dw * 0.45);
        castGlow.addColorStop(0, 'rgba(255, 140, 0, 0.55)');
        castGlow.addColorStop(0.6, 'rgba(255, 60, 0, 0.25)');
        castGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = castGlow;
        ctx.beginPath();
        ctx.arc(0, -dh * 0.1, dw * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    } else {
      // Procedural Vector Placeholder if image not loaded yet
      this.renderProceduralSilhouette(ctx, actor, pos, breathY);
    }

    // 4. Debug Anchors Overlay
    if (this.debugAnchors) {
      this.renderDebugAnchors(ctx, actor);
    }

    ctx.restore();
  }

  renderStaticCard(ctx, actor, pos, breathY) {
    const cardW = 140;
    const cardH = 190;
    const x = pos.x - cardW * 0.5;
    const y = pos.y - cardH * 0.5 + breathY * 0.3;

    ctx.save();
    // Card Border & Glow
    ctx.strokeStyle = '#cda434';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#110e19';
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 8);
    ctx.fill();
    ctx.stroke();

    // Static Portrait Image
    const portraitPath = actor.assets?.staticPortrait;
    const portraitImg = portraitPath ? this.imageCache.get(portraitPath) : null;
    if (portraitImg) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 4, cardW - 8, cardH - 8, 6);
      ctx.clip();
      ctx.drawImage(portraitImg, x + 4, y + 4, cardW - 8, cardH - 8);
      ctx.restore();
    }

    // Label: Static
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[STATIC CARD]', pos.x, y + cardH + 16);
    ctx.restore();
  }

  renderProceduralSilhouette(ctx, actor, pos, breathY) {
    ctx.save();
    ctx.translate(pos.x, pos.y + breathY);
    ctx.fillStyle = actor.id === 'hero' ? '#38bdf8' : '#e11d48';
    ctx.beginPath();
    ctx.arc(0, -actor.height * 0.2, actor.width * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(actor.name, 0, -actor.height * 0.45);
    ctx.restore();
  }

  renderDebugAnchors(ctx, actor) {
    const anchors = ['feet', 'chest', 'center', 'head', 'castPoint'];
    const colors = {
      feet: '#10b981',
      chest: '#ef4444',
      center: '#3b82f6',
      head: '#f59e0b',
      castPoint: '#ec4899'
    };

    ctx.save();
    anchors.forEach(a => {
      const pt = actor.getAnchor(a);
      ctx.fillStyle = colors[a] || '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = colors[a] || '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(a, pt.x + 7, pt.y + 3);
    });
    ctx.restore();
  }
}
