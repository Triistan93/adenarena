/**
 * main.js
 * 
 * Master Entry Point for Aden Arena 2D Visual Prototype V2.
 * Features:
 * - 8 Canonical Classes Selection in Runtime
 * - Level Selector (Lv39, Lv40, Lv75, Lv76, Lv79, Lv80, Lv89, Lv90)
 * - Level-Aware Dynamic Skill Bar & Dedicated Ultimate/Master Buttons
 * - Comprehensive Telemetry (Name, Race, Class, Level, Stage, Elements, Skill Pool, HP, FPS)
 * - Hotkeys (1-4, U for Ultimate, M for Master, C for A/B, Space for Auto-loop, R for Reset)
 */

import { CombatScene, MAP_CONFIGS } from './scenes/CombatScene.js';
import { resolveCharacterVisual } from './renderer/AssetResolver.js';
import { getClassIdentity, getProgressionStage, getAllowedElements } from './data/classes/ClassIdentity.js';
import { getClassSkillPool } from './data/skills/SkillProgression.js';
import { getClassUltimate } from './data/skills/UltimateRegistry.js';
import { getSkill } from './data/skills/SkillRegistry.js';

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
  console.log('[VisualPrototype2D V2] Initialized successfully with 8 classes and multi-stage skills.');
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

  const classId = scene.currentHeroClassId;
  const level = scene.heroLevel;
  const skillPool = getClassSkillPool(classId, level);
  const ultimateInfo = getClassUltimate(classId);

  actionBar.innerHTML = '';

  // 1. Regular/Core Skills (up to 4 non-ultimate skills)
  const coreSkills = skillPool.filter(s => s.progressionStage !== 'ULTIMATE' && s.progressionStage !== 'MASTER_ULTIMATE');
  coreSkills.slice(0, 4).forEach((skill, index) => {
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    btn.id = `btn-skill-${index}`;
    btn.title = `[${skill.elements.join('/')}] ${skill.name} (Lv.${skill.requiredLevel}+) - Tecla ${index + 1}`;

    btn.innerHTML = `
      <span class="btn-icon">${skill.icon}</span>
      <span>${skill.name}</span>
      <span class="btn-sub">${skill.elements.join('/')} [${index + 1}]</span>
    `;

    btn.addEventListener('click', () => scene.executeSkill(skill.id));
    actionBar.appendChild(btn);
  });

  // 2. Ultimate Button (Lv80+)
  if (ultimateInfo) {
    const ultSkill = getSkill(ultimateInfo.ultimateId);
    if (ultSkill) {
      const isUltUnlocked = level >= 80;
      const btnUlt = document.createElement('button');
      btnUlt.className = `skill-btn ultimate ${isUltUnlocked ? '' : 'locked'}`;
      btnUlt.id = 'btn-ultimate';
      btnUlt.disabled = !isUltUnlocked;
      btnUlt.title = isUltUnlocked ? `Ultimate ★★★★ (Lv.80+) - Tecla U` : `Requer Nível 80+ e Livro ★★★★`;

      btnUlt.innerHTML = `
        <span class="btn-icon">${ultSkill.icon}</span>
        <span>${ultSkill.name}</span>
        <span class="btn-sub">${isUltUnlocked ? 'ULTIMATE ★★★★ [U]' : '🔒 REQUER LV.80'}</span>
      `;

      btnUlt.addEventListener('click', () => scene.executeSkill(ultSkill.id));
      actionBar.appendChild(btnUlt);
    }

    // 3. Master Ultimate Button (Lv90+)
    const masterSkill = getSkill(ultimateInfo.masterUltimateId);
    if (masterSkill) {
      const isMasterUnlocked = level >= 90;
      const btnMaster = document.createElement('button');
      btnMaster.className = `skill-btn master-ultimate ${isMasterUnlocked ? '' : 'locked'}`;
      btnMaster.id = 'btn-master-ultimate';
      btnMaster.disabled = !isMasterUnlocked;
      btnMaster.title = isMasterUnlocked ? `Master Ultimate ★★★★★ (Lv.90+) - Tecla M` : `Requer Nível 90+`;

      btnMaster.innerHTML = `
        <span class="btn-icon">${masterSkill.icon}</span>
        <span>${masterSkill.name}</span>
        <span class="btn-sub">${isMasterUnlocked ? 'MASTER ★★★★★ [M]' : '🔒 REQUER LV.90'}</span>
      `;

      btnMaster.addEventListener('click', () => scene.executeSkill(masterSkill.id));
      actionBar.appendChild(btnMaster);
    }
  }
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
  const selectLevel = document.getElementById('select-level');
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

  // 1. Class Selector (Section 44 & 45)
  if (selectClass) {
    selectClass.addEventListener('change', async (e) => {
      const newClassId = e.target.value;
      await scene.init(newClassId, scene.currentMonsterId, scene.currentMapId);
      renderActionBar();
      updateHudStats();
    });
  }

  // 2. Level Selector (Section 47)
  if (selectLevel) {
    selectLevel.addEventListener('change', async (e) => {
      const newLvl = Number(e.target.value);
      await scene.setHeroLevel(newLvl);
      renderActionBar();
      updateHudStats();
    });
  }

  // 3. Monster Selector
  if (selectMonster) {
    selectMonster.addEventListener('change', async (e) => {
      const newMonsterId = e.target.value;
      await scene.init(scene.currentHeroClassId, newMonsterId, scene.currentMapId);
    });
  }

  // 4. Map Selector
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

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    if (e.key >= '1' && e.key <= '4') {
      const idx = parseInt(e.key, 10) - 1;
      const btn = document.getElementById(`btn-skill-${idx}`);
      if (btn) btn.click();
    } else if (e.key === 'u' || e.key === 'U') {
      document.getElementById('btn-ultimate')?.click();
    } else if (e.key === 'm' || e.key === 'M') {
      document.getElementById('btn-master-ultimate')?.click();
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

  const identity = getClassIdentity(scene.currentHeroClassId);
  const stage = getProgressionStage(scene.heroLevel);
  const elements = getAllowedElements(scene.currentHeroClassId, scene.heroLevel);
  const pool = getClassSkillPool(scene.currentHeroClassId, scene.heroLevel);

  // Hero HUD
  const heroHpBar = document.getElementById('hero-hp-bar');
  const heroHpText = document.getElementById('hero-hp-text');
  const heroNameText = document.getElementById('hero-name');
  const heroClassText = document.getElementById('hero-class');
  const heroStageBadge = document.getElementById('hero-stage-badge');
  const heroElementsText = document.getElementById('hero-elements');
  const heroPoolCount = document.getElementById('hero-pool-count');

  if (heroHpBar && scene.hero) {
    const pct = Math.max(0, (scene.hero.hp / scene.hero.maxHp) * 100);
    heroHpBar.style.width = pct + '%';
    if (heroHpText) heroHpText.textContent = `${scene.hero.hp} / ${scene.hero.maxHp}`;
    if (heroNameText) heroNameText.textContent = `${scene.hero.name} (${identity?.race || 'Hero'})`;
    if (heroClassText) heroClassText.textContent = `Lv. ${scene.hero.level} · ${identity?.primaryRole?.toUpperCase() || ''}`;
    if (heroStageBadge) heroStageBadge.textContent = stage;
    if (heroElementsText) heroElementsText.textContent = `Elementos: ${elements.join(', ')}`;
    if (heroPoolCount) heroPoolCount.textContent = `Skills Válidas: ${pool.length}`;
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
    if (monsterNameText) monsterNameText.textContent = `${scene.monster.name} (Lv. ${scene.monster.level})`;
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
