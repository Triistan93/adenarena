/**
 * main.js
 * 
 * Dynamic Entry Point for the 2D Animated Combat Visual Prototype.
 * Features:
 * - Dynamic Action Bar generated from selected hero's skill catalogue
 * - Live selectors for Hero Class, Enemy/Boss, and Battlefield Map
 * - Hotkeys (1-4, C, Space, R)
 * - HUD Telemetry (HP, MP, Stagger, States, FPS)
 */

import { CombatScene, MAP_CONFIGS } from './scenes/CombatScene.js';
import { resolveCharacterVisual } from './renderer/AssetResolver.js';
import { getPrototypeSkill } from './data/PrototypeSkillRegistry.js';

let scene = null;
let lastTime = performance.now();

async function initPrototype() {
  const canvas = document.getElementById('combat-canvas');
  if (!canvas) {
    console.error('Canvas #combat-canvas not found!');
    return;
  }

  canvas.width = 1280;
  canvas.height = 720;

  scene = new CombatScene(canvas);
  await scene.init('human_sorcerer', 'shadow_wraith', 'forgeofgods');

  renderActionBar();
  setupControls();
  setupHud();

  requestAnimationFrame(gameLoop);
  console.log('[VisualPrototype2D] Multi-Class 2D Combat Prototype initialized.');
}

function gameLoop(currentTime) {
  const deltaMs = Math.min(100, currentTime - lastTime);
  lastTime = currentTime;

  if (scene) {
    scene.update(deltaMs);
    scene.render();
    updateHudStats();
  }

  requestAnimationFrame(gameLoop);
}

function renderActionBar() {
  const actionBar = document.getElementById('action-bar');
  if (!actionBar || !scene || !scene.hero) return;

  const profile = resolveCharacterVisual(scene.currentHeroClassId);
  const skills = profile?.skills || ['fire_attack', 'fireball', 'magma_spike', 'meteor'];

  actionBar.innerHTML = '';

  skills.forEach((skillId, index) => {
    const skill = getPrototypeSkill(skillId);
    if (!skill) return;

    const btn = document.createElement('button');
    btn.className = `skill-btn ${skill.tier === 'ultimate_4star' ? 'ultimate' : ''}`;
    btn.id = `btn-skill-${index}`;
    btn.title = `${skill.description} (Tecla ${index + 1})`;

    btn.innerHTML = `
      <span class="btn-icon">${skill.icon}</span>
      <span>${skill.name}</span>
      <span class="btn-sub">${skill.element} [${index + 1}]</span>
    `;

    btn.addEventListener('click', () => {
      scene.executeSkill(skillId);
    });

    actionBar.appendChild(btn);
  });
}

function setupControls() {
  const btnIdle = document.getElementById('btn-idle');
  const btnMonsterAtk = document.getElementById('btn-monster-atk');
  const btnKill = document.getElementById('btn-kill');
  const btnReset = document.getElementById('btn-reset');
  const btnToggleStatic = document.getElementById('btn-toggle-static');
  const btnToggleAnchors = document.getElementById('btn-toggle-anchors');
  const btnAutoLoop = document.getElementById('btn-auto-loop');

  const selectClass = document.getElementById('select-class');
  const selectMonster = document.getElementById('select-monster');
  const selectMap = document.getElementById('select-map');

  if (btnIdle) btnIdle.addEventListener('click', () => {
    scene.hero.setState('IDLE');
    scene.heroAnimator.syncWithActorState();
  });

  if (btnMonsterAtk) btnMonsterAtk.addEventListener('click', () => scene.triggerMonsterAttack());
  if (btnKill) btnKill.addEventListener('click', () => scene.killMonster());
  if (btnReset) btnReset.addEventListener('click', () => scene.reset());

  if (btnToggleStatic) {
    btnToggleStatic.addEventListener('click', () => {
      const isStatic = scene.toggleStaticComparison();
      btnToggleStatic.textContent = isStatic ? '🎭 Modo: Imagem Estática (Card)' : '✨ Modo: Personagem 2D Animado';
      btnToggleStatic.classList.toggle('active', isStatic);
    });
  }

  if (btnToggleAnchors) {
    btnToggleAnchors.addEventListener('click', () => {
      const active = scene.toggleDebugAnchors();
      btnToggleAnchors.classList.toggle('active', active);
    });
  }

  if (btnAutoLoop) {
    btnAutoLoop.addEventListener('click', () => {
      if (scene.scriptedLoopRunning) {
        scene.stopScriptedLoop();
        btnAutoLoop.textContent = '▶ Iniciar Auto-Combate';
        btnAutoLoop.classList.remove('active');
      } else {
        scene.startScriptedLoop();
        btnAutoLoop.textContent = '⏸ Pausar Auto-Combate';
        btnAutoLoop.classList.add('active');
      }
    });
  }

  // Live Selectors
  if (selectClass) {
    selectClass.addEventListener('change', async (e) => {
      const newClassId = e.target.value;
      await scene.init(newClassId, scene.currentMonsterId, scene.currentMapId);
      renderActionBar();
    });
  }

  if (selectMonster) {
    selectMonster.addEventListener('change', async (e) => {
      const newMonsterId = e.target.value;
      await scene.init(scene.currentHeroClassId, newMonsterId, scene.currentMapId);
    });
  }

  if (selectMap) {
    selectMap.addEventListener('change', async (e) => {
      const newMapId = e.target.value;
      await scene.init(scene.currentHeroClassId, scene.currentMonsterId, newMapId);
      const stageZone = document.getElementById('stage-zone');
      if (stageZone && MAP_CONFIGS[newMapId]) {
        stageZone.textContent = MAP_CONFIGS[newMapId].name;
      }
    });
  }

  // Keyboard Hotkeys
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key >= '1' && e.key <= '4') {
      const idx = parseInt(e.key, 10) - 1;
      const btn = document.getElementById(`btn-skill-${idx}`);
      if (btn) btn.click();
    } else if (e.key === 'c' || e.key === 'C') {
      btnToggleStatic?.click();
    } else if (e.key === ' ') {
      e.preventDefault();
      btnAutoLoop?.click();
    } else if (e.key === 'r' || e.key === 'R') {
      btnReset?.click();
    }
  });
}

function setupHud() {
  updateHudStats();
}

function updateHudStats() {
  if (!scene) return;

  // Hero HUD
  const heroHpBar = document.getElementById('hero-hp-bar');
  const heroHpText = document.getElementById('hero-hp-text');
  const heroNameText = document.getElementById('hero-name');
  const heroClassText = document.getElementById('hero-class');
  const heroStateBadge = document.getElementById('hero-state-badge');

  if (heroHpBar && scene.hero) {
    const pct = Math.max(0, (scene.hero.hp / scene.hero.maxHp) * 100);
    heroHpBar.style.width = pct + '%';
    if (heroHpText) heroHpText.textContent = `${scene.hero.hp} / ${scene.hero.maxHp}`;
    if (heroNameText) heroNameText.textContent = scene.hero.name;
    if (heroClassText) heroClassText.textContent = `Lv. ${scene.hero.level} · ${scene.hero.archetype.toUpperCase()}`;
    if (heroStateBadge) {
      heroStateBadge.textContent = scene.hero.state;
      heroStateBadge.className = `state-badge state-${scene.hero.state.toLowerCase()}`;
    }
  }

  // Monster HUD
  const monsterHpBar = document.getElementById('monster-hp-bar');
  const monsterHpText = document.getElementById('monster-hp-text');
  const monsterStaggerBar = document.getElementById('monster-stagger-bar');
  const monsterNameText = document.getElementById('monster-name');
  const monsterStateBadge = document.getElementById('monster-state-badge');

  if (monsterHpBar && scene.monster) {
    const pct = Math.max(0, (scene.monster.hp / scene.monster.maxHp) * 100);
    monsterHpBar.style.width = pct + '%';
    if (monsterHpText) monsterHpText.textContent = `${scene.monster.hp} / ${scene.monster.maxHp}`;
    if (monsterNameText) monsterNameText.textContent = scene.monster.name;
    if (monsterStaggerBar) {
      const stgPct = Math.min(100, (scene.monster.staggerGauge / scene.monster.maxStaggerGauge) * 100);
      monsterStaggerBar.style.width = stgPct + '%';
    }
    if (monsterStateBadge) {
      monsterStateBadge.textContent = scene.monster.state;
      monsterStateBadge.className = `state-badge state-${scene.monster.state.toLowerCase()}`;
    }
  }

  // FPS Telemetry
  const fpsElement = document.getElementById('fps-counter');
  if (fpsElement) {
    fpsElement.textContent = `${scene.fps} FPS`;
  }
}

window.addEventListener('DOMContentLoaded', initPrototype);
