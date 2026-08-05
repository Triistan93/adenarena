/**
 * StageUI.js — Palco Principal (Hero vs Monster) e Mapa de Zonas.
 */

import { ZONES, SAGAS, ZONE_BACKGROUNDS } from '../data/zones.js';
import { MONSTERS, MONSTER_BY_NAME } from '../data/monsters.js';
import { el, updateBar } from '../core/DomHelpers.js';
import { getClass } from '../engine/StatsEngine.js';
import { heroSVG, monsterSVG, MON_IMG } from '../../art.js';

/* ═══════════════════ DIAGNÓSTICO FORÇADO - renderStageMonster ═══════════════════ */

export function renderStageMonster(state) {
  console.group("🔍 [StageUI] renderStageMonster()");

  const m = state?.activeMonster;
  console.log("Monster data received:", m);

  // === 1. Tenta encontrar o container de todas as formas possíveis ===
  let container = getMonsterHost();

  if (!container) {
    console.error("❌ Nenhum container encontrado com getMonsterHost(). Criando fallback...");
    container = createMonsterContainerFallback();
  }

  if (!container) {
    console.error("💥 IMPOSSÍVEL renderizar monstro - container não existe nem pode ser criado.");
    console.groupEnd();
    return;
  }

  console.log("✅ Container encontrado/criado:", container.id || container.className);

  // === 2. Sem monstro ativo ===
  if (!m) {
    container.innerHTML = `
      <div style="height:180px;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;">
        ⚔️ Selecione uma zona para caçar
      </div>`;
    console.warn("⚠️ state.activeMonster está vazio");
    console.groupEnd();
    return;
  }

  // === 3. Resolve a chave do monstro (melhorada) ===
  const monsterKey = resolveMonsterKey(m);
  console.log(`Monster key resolved → "${monsterKey}"`);

  // === 4. Gera o conteúdo visual ===
  let contentHTML = '';
  try {
    contentHTML = monsterSVG(monsterKey, {
      crown: Boolean(m.boss || m.isTower),
      elite: Boolean(m.isElite),
      element: m.element
    });

    if (!contentHTML) throw new Error("monsterSVG retornou vazio");
  } catch (err) {
    console.error("Erro no monsterSVG:", err);
    contentHTML = getEmergencyPlaceholder(m, monsterKey);
  }

  // Aplica com transição para evitar flicker
  container.style.transition = 'opacity 0.2s';
  container.style.opacity = '0';

  setTimeout(() => {
    container.innerHTML = contentHTML;
    container.style.opacity = '1';
  }, 10);

  // === 5. Atualiza a barra de HP (mesmo se o monstro for placeholder) ===
  updateMonsterHPBar(m);

  console.log("✅ Monstro renderizado com sucesso");
  console.groupEnd();
}

/* ====================== FUNÇÕES AUXILIARES ====================== */

function getMonsterHost() {
  const root = document.getElementById('idle-host')?.shadowRoot || document;

  const selectors = [
    '#monster-sprite-container',
    '#stage-monster',
    '#monster-sprite',
    '#mob-sprite',
    '.stage-monster',
    '.monster-container',
    '[id*="monster"]',
    '[class*="monster"]'
  ];

  for (const sel of selectors) {
    const elFound = root.querySelector(sel);
    if (elFound) {
      console.log(`Encontrado via: ${sel}`);
      return elFound;
    }
  }
  return null;
}

function createMonsterContainerFallback() {
  const root = document.getElementById('idle-host')?.shadowRoot || document;

  let container = root.querySelector('#stage-monster');
  if (!container) {
    container = document.createElement('div');
    container.id = 'stage-monster';
    container.style.cssText = `
      min-height: 180px; 
      position: relative; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      border: 2px dashed #f59e0b;
      border-radius: 8px;
      background: rgba(15,15,20,0.6);
    `;
    // Tenta inserir no lugar correto do palco
    const stage = root.querySelector('#main-stage, #stage, .stage');
    if (stage) stage.appendChild(container);
    else root.appendChild(container); // último recurso
  }
  return container;
}

export function resolveMonsterKey(m) {
  if (!m) return 'unknown';

  // Prioridade de chaves
  for (const key of [m.id, m.key, m.itemId, m.name]) {
    if (!key) continue;
    let k = String(key).trim();

    // Normalizações fortes
    k = k.replace(/\s+/g, '');           // "Goblin Mage" → "GoblinMage"
    const lower = k.toLowerCase();

    if (MON_IMG[k]) return k;
    if (MON_IMG[lower]) return lower;
    if (MON_IMG[`mon_${lower}`]) return `mon_${lower}`;
    if (MON_IMG[`mon_${k}`]) return `mon_${k}`;
  }
  return m.name || 'goblin'; // fallback seguro
}

function getEmergencyPlaceholder(m, key) {
  const isBoss = m.boss || m.isTower;
  return `
    <div style="
      width:100%; height:180px; display:flex; flex-direction:column; 
      align-items:center; justify-content:center; gap:8px;
      background: repeating-linear-gradient(45deg, #1f2937, #1f2937 10px, #374151 10px, #374151 20px);
      border: 3px dashed ${isBoss ? '#eab308' : '#f97316'};
      border-radius: 12px; color: white; font-family: monospace;
    ">
      <div style="font-size: ${isBoss ? '62px' : '48px'};">${isBoss ? '👑' : '👹'}</div>
      <strong style="font-size:15px; color:#fbbf24;">${m.name || 'Monstro Desconhecido'}</strong>
      <small style="color:#94a3b8; font-size:11px;">ID: ${key}</small>
      <small style="color:#ef4444; font-size:10px;">SPRITE NÃO ENCONTRADO</small>
    </div>`;
}

function updateMonsterHPBar(m) {
  const maxHp = m._maxHp || m.maxHp || m.hp || 100;
  const currentHp = Math.max(0, m.hp || 0);

  console.log(`Atualizando HP: ${currentHp}/${maxHp}`);

  updateBar('monster-hp-bar', currentHp, maxHp, 'monster-hp-text');

  // Backup direto no Shadow DOM caso updateBar falhe
  const root = document.getElementById('idle-host')?.shadowRoot || document;
  if (root) {
    const bar = root.querySelector('#monster-hp-bar, .monster-hp-bar');
    const text = root.querySelector('#monster-hp-text, .monster-hp-text');
    if (bar) {
      const percent = Math.min(100, Math.max(0, (currentHp / maxHp) * 100));
      bar.style.width = percent + '%';
    }
    if (text) text.textContent = `${Math.floor(currentHp)} / ${Math.floor(maxHp)}`;
  }
}

/* ═══════════════════ HERÓI ═══════════════════ */

export function renderStageHero(state) {
  const nameEl = el('hero-name');
  if (nameEl) {
    const cls = getClass(state.class);
    nameEl.textContent = `${cls?.name ?? state.class ?? 'Aventureiro'} (Lv. ${state.level})`;
  }

  const box = el('stage-hero');
  if (box) {
    box.innerHTML = heroSVG(state.race || 'human', state.class || 'fighter');
  }

  updateBar('hero-hp-bar', state.hp, state.maxHp, 'hero-hp-text');
  updateBar('hero-mp-bar', state.mp, state.maxMp, 'hero-mp-text');
}

/* ═══════════════════ ZONAS ═══════════════════ */

export function updateZoneUI(state, callbacks = {}) {
  const z = ZONES[state.zone];
  const nameEl = el('zone-name');
  if (nameEl && z) nameEl.textContent = z.name;
  renderZoneMap(state, callbacks);
}

/** Última saga visível: respeita currentSaga OU o nível do jogador. */
function maxVisibleSaga(state) {
  const byLevel = SAGAS.reduce(
    (acc, s, i) => ((state.level ?? 1) >= s.unlocksAt ? i : acc), 0);
  return Math.max(state.currentSaga ?? 0, byLevel);
}

export function renderZoneMap(state, callbacks = {}) {
  const container = el('zone-map-container') || el('zone-list');
  if (!container) { console.warn('[StageUI] container de zonas não encontrado'); return; }

  ensureStageStyles();
  container.innerHTML = '';
  container.classList.add('zone-map-root');

  const last = maxVisibleSaga(state);

  for (let i = 0; i <= last; i++) {
    const saga = SAGAS[i];
    if (!saga) continue;

    let cards = '';
    for (const zId of saga.zones) {
      const z = ZONES[zId];
      if (!z) { console.warn(`[StageUI] zona "${zId}" ausente em ZONES`); continue; }

      const current = state.zone === zId;
      const locked  = (state.level ?? 1) < z.level;
      const thumb   = ZONE_BACKGROUNDS[zId] || '';
      const mobs    = z.monsters?.length ?? 0;
      const bossNm  = MONSTERS[z.boss]?.name ?? null;

      cards += `
        <div class="zone-card${current ? ' active' : ''}${locked ? ' locked' : ''}"
             data-zone="${zId}" data-locked="${locked}" data-current="${current}"
             role="button" tabindex="${locked || current ? -1 : 0}">
          <div class="zone-card-thumb"${thumb ? ` style="background-image:url('${thumb}')"` : ''}>
            ${z.town ? '<span class="zone-flag town">🏠 Vila</span>' : ''}
            ${locked ? '<span class="zone-flag lock">🔒</span>' : ''}
            ${current ? '<span class="zone-flag here">★</span>' : ''}
          </div>
          <div class="zone-card-body">
            <div class="zone-card-header">
              <span class="zone-card-title">${z.name}</span>
              <span class="zone-card-lvl">Lv.${z.level}+</span>
            </div>
            <div class="zone-card-desc">${mobs} espécie${mobs === 1 ? '' : 's'}${bossNm ? ` · 👑 ${bossNm}` : ''}</div>
            <button class="select-zone-btn" ${locked || current ? 'disabled' : ''}>
              ${current ? '★ Caçando Aqui' : (locked ? `🔒 Requer Lv.${z.level}` : 'Caçar nesta Área')}
            </button>
          </div>
        </div>`;
    }

    const block = document.createElement('div');
    block.className = 'saga-map-block';
    block.innerHTML = `
      <div class="saga-header">
        <span class="saga-title">🗺️ ${saga.name}</span>
        <span class="saga-req">Lv. ${saga.unlocksAt}+</span>
      </div>
      <div class="saga-zones-grid">${cards}</div>`;
    container.appendChild(block);
  }

  // Delegação de evento: 1 listener, respeita locked/current
  container.onclick = (ev) => {
    const card = ev.target.closest?.('.zone-card');
    if (!card || card.dataset.locked === 'true' || card.dataset.current === 'true') return;
    const zId = card.dataset.zone;
    if (callbacks.selectZone) callbacks.selectZone(zId);
    else if (typeof window?.setZone === 'function') window.setZone(zId);
    else console.warn('[StageUI] nenhum handler de selectZone registrado');
  };
}

/* ═══════════════════ CSS (injetado 1x no Shadow Root) ═══════════════════ */

const STYLE_ID = 'stage-ui-styles';

function styleTarget() {
  const host = document.getElementById('idle-host');
  return host?.shadowRoot || document.head;
}

export function ensureStageStyles() {
  const root = styleTarget();
  if (!root || root.getElementById?.(STYLE_ID) || root.querySelector?.(`#${STYLE_ID}`)) return;
  const tag = document.createElement('style');
  tag.id = STYLE_ID;
  tag.textContent = STAGE_CSS;
  root.appendChild(tag);
}

const STAGE_CSS = `
.zone-map-root { display:flex; flex-direction:column; gap:16px; }

.saga-map-block { border:1px solid rgba(212,175,55,.18); border-radius:10px;
  background:linear-gradient(180deg,rgba(28,34,48,.72),rgba(16,20,30,.72)); padding:10px 10px 12px; }

.saga-header { display:flex; align-items:center; justify-content:space-between;
  padding:2px 4px 9px; margin-bottom:9px; border-bottom:1px solid rgba(212,175,55,.16); }
.saga-title { font-weight:700; font-size:.86rem; letter-spacing:.04em; color:#e8c37a; }
.saga-req   { font-size:.68rem; color:#8b93a7; border:1px solid rgba(139,147,167,.28);
  border-radius:999px; padding:2px 8px; }

.saga-zones-grid { display:grid; gap:10px;
  grid-template-columns:repeat(auto-fill,minmax(158px,1fr)); }

.zone-card { position:relative; display:flex; flex-direction:column; overflow:hidden;
  border:1px solid rgba(212,175,55,.22); border-radius:9px; background:#131824;
  cursor:pointer; transition:transform .16s, border-color .16s, box-shadow .16s; }
.zone-card:hover:not(.locked):not(.active) { transform:translateY(-3px);
  border-color:rgba(232,195,122,.65); box-shadow:0 6px 18px rgba(0,0,0,.5); }

.zone-card.active { border-color:#e8c37a; box-shadow:0 0 0 1px rgba(232,195,122,.45),0 0 18px rgba(232,195,122,.18); }
.zone-card.locked { opacity:.45; filter:grayscale(.85); cursor:not-allowed; }

.zone-card-thumb { position:relative; height:64px;
  background-color:#0d1018; background-size:cover; background-position:center;
  background-image:linear-gradient(135deg,#232b3d,#12161f); }
.zone-card-thumb::after { content:''; position:absolute; inset:0;
  background:linear-gradient(180deg,transparent 35%,rgba(10,13,20,.92)); }

.zone-flag { position:absolute; top:5px; z-index:2; font-size:.6rem; line-height:1;
  padding:3px 6px; border-radius:999px; background:rgba(8,10,16,.82); }
.zone-flag.town { left:5px; color:#7fd4a8; border:1px solid rgba(127,212,168,.4); }
.zone-flag.lock { right:5px; color:#ff8080; border:1px solid rgba(255,128,128,.4); }
.zone-flag.here { right:5px; color:#0d1018; background:#e8c37a; font-weight:800; }

.zone-card-body { padding:8px; display:flex; flex-direction:column; gap:6px; }
.zone-card-header { display:flex; align-items:baseline; justify-content:space-between; gap:6px; }
.zone-card-title { font-size:.76rem; font-weight:700; color:#e6e9f2; line-height:1.15; }
.zone-card-lvl   { font-size:.62rem; color:#e8c37a; white-space:nowrap; }
.zone-card-desc  { font-size:.62rem; color:#8b93a7; line-height:1.3; }

.select-zone-btn { width:100%; padding:6px 8px; font-size:.66rem; font-weight:700;
  font-family:inherit; letter-spacing:.02em; cursor:pointer; border-radius:6px;
  border:1px solid rgba(212,175,55,.5); color:#e8c37a; background:rgba(212,175,55,.09);
  transition:background .15s,color .15s; }
.select-zone-btn:hover:not(:disabled) { background:#e8c37a; color:#12161f; }
.select-zone-btn:disabled { cursor:default; opacity:.6;
  border-color:rgba(139,147,167,.3); color:#8b93a7; background:transparent; }
.zone-card.active .select-zone-btn { border-color:#e8c37a; color:#e8c37a; background:rgba(232,195,122,.14); opacity:1; }

#stage-monster, #monster-sprite-container, .monster-sprite-host { position:relative; display:block; width:100%; height:100%; min-height:180px; pointer-events:none; }
#stage-monster svg, #monster-sprite-container svg, .monster-sprite-host svg { width:100%; height:100%; }
#stage-monster.is-boss, #monster-sprite-container.is-boss { filter:drop-shadow(0 0 12px rgba(255,80,80,.55)); }
#stage-monster.is-elite, #monster-sprite-container.is-elite { filter:drop-shadow(0 0 10px rgba(150,120,255,.5)); }
`;
