/**
 * SeasonUI.js — Renderizador de Telas de Bloqueio e Badges de Temporadas.
 */

import { isFeatureUnlocked, getSeasonForFeature, getCurrentSeason } from '../core/SeasonConfig.js';
import { el, qsa } from '../core/DomHelpers.js';

/**
 * Renderiza o painel de bloqueio de temporada dentro do container da aba bloqueada.
 * @param {HTMLElement} paneEl
 * @param {string} tabId
 */
export function renderSeasonLockedPanel(paneEl, tabId) {
  if (!paneEl) return;
  const targetSeason = getSeasonForFeature(tabId);
  const currentSeason = getCurrentSeason();

  paneEl.innerHTML = `
    <div class="season-locked-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      text-align: center;
      min-height: 420px;
      background: radial-gradient(circle at center, rgba(30, 25, 45, 0.85) 0%, rgba(10, 8, 16, 0.95) 100%);
      border: 1px solid rgba(212, 167, 68, 0.25);
      border-radius: 16px;
      margin: 16px 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    ">
      <div style="font-size: 52px; margin-bottom: 12px; filter: drop-shadow(0 0 12px rgba(212, 167, 68, 0.5));">
        🔒
      </div>
      <div style="
        display: inline-block;
        padding: 4px 14px;
        background: rgba(212, 167, 68, 0.15);
        border: 1px solid rgba(212, 167, 68, 0.4);
        border-radius: 20px;
        color: #fef08a;
        font-family: 'Cinzel', serif;
        font-size: 12px;
        font-weight: bold;
        letter-spacing: 1px;
        margin-bottom: 12px;
        text-transform: uppercase;
      ">
        ${targetSeason.title}
      </div>
      <h3 style="
        color: #f59e0b;
        font-family: 'Cinzel', serif;
        font-size: 22px;
        margin: 0 0 8px 0;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      ">
        ${targetSeason.subtitle}
      </h3>
      <p style="
        color: rgba(255, 255, 255, 0.75);
        font-size: 13px;
        max-width: 480px;
        line-height: 1.6;
        margin: 0 0 24px 0;
      ">
        ${targetSeason.description}
      </p>

      <div style="
        background: rgba(0, 0, 0, 0.4);
        border: 1px dashed rgba(212, 167, 68, 0.3);
        border-radius: 12px;
        padding: 16px 20px;
        max-width: 440px;
        width: 100%;
        text-align: left;
        margin-bottom: 24px;
      ">
        <div style="color: #ffd700; font-family: 'Cinzel', serif; font-size: 12px; font-weight: bold; margin-bottom: 10px; text-align: center;">
          ✦ Conteúdos desta Crônica ✦
        </div>
        <ul style="margin: 0; padding-left: 20px; color: rgba(255,255,255,0.8); font-size: 12px; line-height: 1.8;">
          ${(targetSeason.features || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>

      <div style="color: rgba(255, 255, 255, 0.5); font-size: 12px;">
        Temporada Atual: <strong style="color: #60a5fa;">${currentSeason.title} (Cap Lv ${currentSeason.maxLevel})</strong>
      </div>
    </div>
  `;
}

/**
 * Atualiza a visibilidade dos botões de abas baseado na temporada ativa.
 *
 * Abas BLOQUEADAS → ficam completamente ocultas (display: none).
 *   - Jogadores não veem nem o nome da aba, evitando a curiosidade do cadeado.
 * Abas DESBLOQUEADAS → ficam visíveis normalmente.
 *
 * @param {Document|ShadowRoot} root
 */
export function updateSeasonTabBadges(root) {
  if (!root) return;
  const tabBtns = root.querySelectorAll('.tab-btn, [data-tab]');
  tabBtns.forEach(btn => {
    const tabId = btn.dataset?.tab;
    if (!tabId) return;

    // Remove ícone de cadeado legado (se existia de versão anterior)
    const oldLock = btn.querySelector('.season-lock-icon');
    if (oldLock) oldLock.remove();
    btn.classList.remove('season-locked-tab');

    const unlocked = isFeatureUnlocked(tabId);
    if (unlocked) {
      // Aba disponível — garante visibilidade
      btn.style.display = '';
      btn.removeAttribute('title');
    } else {
      // Aba bloqueada — ocultar completamente da barra de navegação
      btn.style.display = 'none';
    }
  });
}

