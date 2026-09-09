/**
 * CombatScene.js
 * 
 * Orchestrates the Expanded 2D Combat Vertical Slice:
 * - Dynamic Hero Selection (Human Sorcerer, Paladin, Assassin, Spellsinger, Death Knight)
 * - Dynamic Monster / Boss Selection (Shadow Wraith, Corrupted Knight, Arch Necromancer)
 * - Dynamic Battlefield Map Selection (Forge of the Gods, Dragon Valley, Antharas Lair, Valley of Saints)
 * - Universal Skill Dispatcher supporting unique animations, anchors, VFX, and camera effects per class
 * - Dynamic Auto-Combate loop adapted to the current hero's skillset
 */

import { CombatActor, ACTOR_CONFIG, ActorState } from '../renderer/CombatActor.js';
import { CharacterAnimator } from '../renderer/CharacterAnimator.js';
import { CharacterRenderer } from '../renderer/CharacterRenderer.js';
import { PrototypeSkillVfx } from '../vfx/PrototypeSkillVfx.js';
import { resolveCharacterVisual } from '../renderer/AssetResolver.js';
import { getPrototypeSkill } from '../data/PrototypeSkillRegistry.js';

export const MAP_CONFIGS = {
  forgeofgods: { id: 'forgeofgods', name: 'Forge of the Gods', src: 'public/assets/bg/forgeofgods.jpg' },
  dragonvalley: { id: 'dragonvalley', name: 'Dragon Valley', src: 'public/assets/bg/dragonvalley.jpg' },
  antharaslair: { id: 'antharaslair', name: "Antharas' Lair", src: 'public/assets/bg/antharaslair.jpg' },
  valleyofsaints: { id: 'valleyofsaints', name: 'Valley of Saints', src: 'public/assets/bg/valleyofsaints.jpg' },
  baium: { id: 'baium', name: 'Tower of Insolence (Baium)', src: 'public/assets/bg/baium.jpg' }
};

export class CombatScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.renderer = new CharacterRenderer();
    this.vfx = new PrototypeSkillVfx();

    this.currentHeroClassId = 'human_sorcerer';
    this.currentMonsterId = 'shadow_wraith';
    this.currentMapId = 'forgeofgods';

    this.bgImage = null;
    this.bgLoaded = false;
    this.ambientEmbers = [];

    // Camera System
    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetZoom: 1.0,
      shakeIntensity: 0,
      shakeDurationMs: 0
    };

    // Actors & Animators
    this.hero = null;
    this.heroAnimator = null;
    this.monster = null;
    this.monsterAnimator = null;

    this.isActionLocked = false;
    this.scriptedLoopRunning = false;
    this.scriptedStep = 0;
    this.scriptTimerMs = 0;

    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
  }

  async init(heroClassId = 'human_sorcerer', monsterId = 'shadow_wraith', mapId = 'forgeofgods') {
    this.currentHeroClassId = heroClassId;
    this.currentMonsterId = monsterId;
    this.currentMapId = mapId;

    // 1. Resolve Profiles
    const heroProfile = resolveCharacterVisual(heroClassId);
    if (!heroProfile || heroProfile.status !== 'RESOLVED') {
      console.error(`[CombatScene] Unknown hero class: ${heroClassId}`);
      return false;
    }

    const monsterProfile = resolveCharacterVisual(monsterId);
    if (!monsterProfile || monsterProfile.status !== 'RESOLVED') {
      console.error(`[CombatScene] Unknown monster: ${monsterId}`);
      return false;
    }

    // 2. Instantiate Hero
    this.hero = new CombatActor({
      id: 'hero',
      classId: heroProfile.classId,
      name: heroProfile.name,
      race: heroProfile.race,
      archetype: heroProfile.archetype,
      visualProfile: heroProfile.visualProfile,
      animationSet: heroProfile.animationSet,
      weaponProfile: heroProfile.weaponProfile,
      position: { x: 360, y: ACTOR_CONFIG.ACTOR_BASELINE_Y },
      scale: heroProfile.metrics.scale,
      assets: heroProfile.assets,
      hp: 3600,
      maxHp: 3600,
      mp: 1800,
      maxMp: 1800,
      level: 76
    });

    // 3. Instantiate Monster
    const isBoss = monsterId !== 'shadow_wraith';
    this.monster = new CombatActor({
      id: 'monster',
      classId: monsterProfile.classId,
      name: monsterProfile.name,
      race: monsterProfile.race,
      archetype: monsterProfile.archetype,
      visualProfile: monsterProfile.visualProfile,
      animationSet: monsterProfile.animationSet,
      weaponProfile: monsterProfile.weaponProfile,
      position: { x: 920, y: ACTOR_CONFIG.ACTOR_BASELINE_Y },
      flipX: true,
      scale: monsterProfile.metrics.scale,
      assets: monsterProfile.assets,
      hp: isBoss ? 8000 : 5500,
      maxHp: isBoss ? 8000 : 5500,
      mp: 800,
      maxMp: 800,
      level: isBoss ? 80 : 78
    });

    // 4. Animators
    this.heroAnimator = new CharacterAnimator(this.hero);
    this.monsterAnimator = new CharacterAnimator(this.monster);

    // 5. Preload Assets
    await this.preloadAssets(heroProfile, monsterProfile, mapId);

    // 6. Ambient Atmosphere
    this.setupAmbientAtmosphere(mapId);

    return true;
  }

  async preloadAssets(heroProfile, monsterProfile, mapId) {
    const assetsToLoad = [];

    // Background
    const mapConf = MAP_CONFIGS[mapId] || MAP_CONFIGS.forgeofgods;
    assetsToLoad.push(mapConf.src);

    // Hero & Monster Sprites
    Object.values(heroProfile.assets).forEach(src => assetsToLoad.push(src));
    Object.values(monsterProfile.assets).forEach(src => assetsToLoad.push(src));

    await Promise.all(assetsToLoad.map(src => this.renderer.loadImage(src)));

    this.bgImage = this.renderer.imageCache.get(mapConf.src);
    this.bgLoaded = Boolean(this.bgImage);
  }

  setupAmbientAtmosphere(mapId) {
    this.ambientEmbers = [];
    const count = mapId === 'forgeofgods' ? 40 : 25;
    const color = mapId === 'valleyofsaints' ? '#fef08a' : (mapId === 'dragonvalley' ? '#94a3b8' : '#ff7700');

    for (let i = 0; i < count; i++) {
      this.ambientEmbers.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vy: -0.3 - Math.random() * 0.7,
        vx: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.6,
        color,
        life: Math.random() * 1000
      });
    }
  }

  // --- CAMERA CONTROLS ---
  shakeCamera(intensity = 10, durationMs = 400) {
    this.camera.shakeIntensity = intensity;
    this.camera.shakeDurationMs = durationMs;
  }

  zoomCamera(targetZoom = 1.06, durationMs = 600) {
    this.camera.targetZoom = targetZoom;
    setTimeout(() => {
      this.camera.targetZoom = 1.0;
    }, durationMs);
  }

  // --- UNIVERSAL SKILL EXECUTION PIPELINE ---
  executeSkill(skillId) {
    if (this.isActionLocked || this.hero.isDead) return false;
    const skill = getPrototypeSkill(skillId);
    if (!skill) {
      console.warn(`[CombatScene] Skill not found: ${skillId}`);
      return false;
    }

    this.isActionLocked = true;

    // Set Hero Animation State
    const isUltimate = skill.tier === 'ultimate_4star';
    if (isUltimate) this.hero._ultimateCast = true;

    const animState = skill.castAnimation === 'ATTACK' ? ActorState.ATTACKING : ActorState.CASTING;
    this.hero.setState(animState);
    this.heroAnimator.syncWithActorState();

    // Camera feedback
    if (skill.camera) {
      if (skill.camera.zoom) this.zoomCamera(skill.camera.zoom, skill.camera.zoomDurationMs || 600);
      if (skill.camera.shakeIntensity) this.shakeCamera(skill.camera.shakeIntensity, skill.camera.shakeDurationMs || 300);
    }

    const castAnchor = this.hero.getAnchor(skill.sourceAnchor === 'weapon' ? 'castPoint' : skill.sourceAnchor || 'castPoint');
    const targetChest = this.monster.getAnchor('chest');
    const targetFeet = this.monster.getAnchor('feet');
    const targetCenter = this.monster.getAnchor('center');
    const heroCenter = this.hero.getAnchor('center');

    // Charge flare at start
    this.vfx.spawnBurst(castAnchor.x, castAnchor.y, 10, skill.vfx.coreColor || '#ffaa00', 80, 3);

    // After cast delay, dispatch the VFX and damage
    setTimeout(() => {
      const onImpactCallback = () => {
        const dmg = Math.floor(skill.baseDamage * (0.92 + Math.random() * 0.2));
        const isCrit = Boolean(skill.isCritGuaranteed || Math.random() < 0.35);
        const finalDmg = isCrit ? Math.floor(dmg * 1.5) : dmg;

        this.monster.takeDamage(finalDmg, Boolean(skill.staggerBonus));
        this.vfx.spawnDamageText(finalDmg, targetChest.x, targetChest.y, isCrit, isUltimate);
        this.monsterAnimator.syncWithActorState();

        // Healing mechanics (Paladin Sanctuary / Vampiric)
        if (skill.healHeroPct) {
          const healAmount = Math.floor(this.hero.maxHp * (skill.healHeroPct / 100));
          this.hero.heal(healAmount);
          this.vfx.spawnDamageText(healAmount, heroCenter.x, heroCenter.y - 30, false, false, true);
        } else if (skill.lifestealPct) {
          const drain = Math.floor(finalDmg * skill.lifestealPct);
          this.hero.heal(drain);
          this.vfx.spawnDamageText(drain, heroCenter.x, heroCenter.y - 30, false, false, true);
        }

        if (isUltimate) this.hero._ultimateCast = false;

        setTimeout(() => {
          this.isActionLocked = false;
        }, 200);
      };

      // Dispatch specific VFX Family
      switch (skill.vfx.family) {
        case 'projectile':
          this.vfx.spawnProjectile(castAnchor, targetChest, skill.vfx, onImpactCallback);
          break;

        case 'ground_eruption':
          this.vfx.spawnMagmaSpike(targetFeet, onImpactCallback);
          break;

        case 'crimson_eruption':
          this.vfx.spawnCrimsonEruption(targetFeet, onImpactCallback);
          break;

        case 'skyfall_ultimate':
          this.vfx.spawnMeteor(targetCenter, targetFeet, onImpactCallback);
          break;

        case 'holy_ray':
          this.vfx.spawnHolyRay(targetChest, onImpactCallback);
          break;

        case 'holy_sanctuary':
          this.vfx.spawnSanctuary(heroCenter, onImpactCallback);
          break;

        case 'chain_lightning':
          this.vfx.spawnChainLightning(castAnchor, targetChest, onImpactCallback);
          break;

        case 'plasma_orb':
          this.vfx.spawnProjectile(castAnchor, targetChest, { ...skill.vfx, type: 'electric' }, onImpactCallback);
          break;

        case 'mega_lightning_strike':
          this.vfx.spawnMegaLightning(targetCenter, onImpactCallback);
          break;

        case 'shadow_clones_frenzy':
          this.vfx.spawnShadowClones(targetCenter, onImpactCallback);
          break;

        case 'vampiric_drain':
          this.vfx.spawnVampiricDrain(targetChest, castAnchor, onImpactCallback);
          break;

        case 'melee_spark':
        case 'slash_spark':
        case 'dagger_slice':
        case 'shield_impact':
        case 'dark_slash':
        case 'blood_splatter':
        case 'blood_shield':
        case 'lightning_spark':
        case 'shadow_teleport':
        default:
          this.vfx.spawnBurst(targetChest.x, targetChest.y, 20, skill.vfx.coreColor, 200, 4);
          onImpactCallback();
          break;
      }
    }, skill.castDurationMs);

    return true;
  }

  triggerMonsterAttack() {
    if (this.monster.isDead) return;
    this.monster.setState(ActorState.ATTACKING);
    this.monsterAnimator.syncWithActorState();

    const mChest = this.monster.getAnchor('chest');
    const hChest = this.hero.getAnchor('chest');

    setTimeout(() => {
      this.vfx.spawnBurst(hChest.x, hChest.y, 18, '#a855f7', 180, 4);
      const dmg = 260 + Math.floor(Math.random() * 90);
      this.hero.takeDamage(dmg);
      this.vfx.spawnDamageText(dmg, hChest.x, hChest.y, false);
      this.heroAnimator.syncWithActorState();
      this.shakeCamera(5, 200);
    }, 300);
  }

  killMonster() {
    this.monster.takeDamage(99999);
    this.monsterAnimator.syncWithActorState();
  }

  reset() {
    this.hero.reset();
    this.heroAnimator.syncWithActorState();
    this.monster.reset();
    this.monsterAnimator.syncWithActorState();
    this.vfx.damageTexts = [];
    this.vfx.projectiles = [];
    this.vfx.groundEffects = [];
    this.vfx.meteors = [];
    this.vfx.beams = [];
    this.vfx.darkenAlpha = 0;
    this.vfx.targetDarkenAlpha = 0;
    this.vfx.screenFlashAlpha = 0;
    this.isActionLocked = false;
  }

  toggleStaticComparison() {
    this.renderer.staticComparisonMode = !this.renderer.staticComparisonMode;
    return this.renderer.staticComparisonMode;
  }

  toggleDebugAnchors() {
    this.renderer.debugAnchors = !this.renderer.debugAnchors;
    return this.renderer.debugAnchors;
  }

  // --- SCRIPTED DEMO LOOP ---
  startScriptedLoop() {
    this.scriptedLoopRunning = true;
    this.scriptedStep = 0;
    this.scriptTimerMs = 0;
  }

  stopScriptedLoop() {
    this.scriptedLoopRunning = false;
  }

  update(deltaMs) {
    // 1. Scripted Demo Sequence
    if (this.scriptedLoopRunning && !this.isActionLocked) {
      this.scriptTimerMs += deltaMs;
      if (this.scriptTimerMs >= 1600) {
        this.scriptTimerMs = 0;
        this.scriptedStep = (this.scriptedStep + 1) % 5;

        const profile = resolveCharacterVisual(this.currentHeroClassId);
        const heroSkills = profile?.skills || ['fire_attack', 'fireball', 'magma_spike', 'meteor'];

        if (this.scriptedStep === 2) {
          this.triggerMonsterAttack();
        } else {
          const skillIndex = this.scriptedStep > 2 ? this.scriptedStep - 1 : this.scriptedStep;
          const targetSkill = heroSkills[skillIndex] || heroSkills[0];
          this.executeSkill(targetSkill);
        }

        if (this.monster.isDead) {
          setTimeout(() => this.reset(), 1500);
        }
      }
    }

    // 2. Camera Interpolation
    if (this.camera.shakeDurationMs > 0) {
      this.camera.shakeDurationMs -= deltaMs;
      const progress = Math.max(0, this.camera.shakeDurationMs / 400);
      const intensity = this.camera.shakeIntensity * progress;
      this.camera.x = (Math.random() - 0.5) * intensity;
      this.camera.y = (Math.random() - 0.5) * intensity;
    } else {
      this.camera.x = 0;
      this.camera.y = 0;
    }

    this.camera.zoom += (this.camera.targetZoom - this.camera.zoom) * 0.08;

    // 3. Update Animators & Actors
    if (this.heroAnimator) this.heroAnimator.update(deltaMs);
    if (this.monsterAnimator) this.monsterAnimator.update(deltaMs);
    if (this.hero) this.hero.update(deltaMs);
    if (this.monster) this.monster.update(deltaMs);

    // 4. Update VFX
    this.vfx.update(deltaMs);

    // 5. Ambient Atmosphere Particles
    this.ambientEmbers.forEach(e => {
      e.y += e.vy;
      e.x += e.vx;
      e.life += deltaMs;
      if (e.y < -10) {
        e.y = this.canvas.height + 10;
        e.x = Math.random() * this.canvas.width;
      }
    });

    // 6. FPS Counter
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Camera Transform
    ctx.save();
    ctx.translate(w * 0.5 + this.camera.x, h * 0.5 + this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-w * 0.5, -h * 0.5);

    // A. Background
    if (this.bgLoaded && this.bgImage) {
      ctx.drawImage(this.bgImage, 0, 0, w, h);
    } else {
      ctx.fillStyle = '#0f0b18';
      ctx.fillRect(0, 0, w, h);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.3, w * 0.5, h * 0.5, w * 0.65);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Ground Plane Shadow
    ctx.fillStyle = 'rgba(15, 8, 25, 0.5)';
    ctx.fillRect(0, ACTOR_CONFIG.ACTOR_BASELINE_Y + 70, w, h);

    // B. Ambient Embers
    this.ambientEmbers.forEach(e => {
      ctx.save();
      ctx.fillStyle = e.color || '#ff7700';
      ctx.globalAlpha = e.alpha;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // C. Actors
    if (this.hero) this.renderer.render(ctx, this.hero, this.heroAnimator);
    if (this.monster) this.renderer.render(ctx, this.monster, this.monsterAnimator);

    // D. VFX
    this.vfx.render(ctx);

    ctx.restore();
  }
}
