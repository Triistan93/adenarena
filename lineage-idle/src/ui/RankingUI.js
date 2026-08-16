/**
 * RankingUI.js — Interface Visual de Rankings Globais (Leaderboards & Hall of Legends)
 * 
 * Renderiza o painel de classificação por Combat Power, Grand Olympiad, Duelos de Coliseu
 * e Lordes dos Castelos, integrando dados reais do Firebase Firestore com o motor idle.
 */

import { RankingService } from '../services/RankingService.js';
import { CombatPowerService } from '../services/CombatPowerService.js';

let _activeCategory = 'cp'; // 'cp' | 'olympiad' | 'duels' | 'castles'
let _cachedList = [];
let _isLoading = false;

export function setActiveRankingTab(category) {
  _activeCategory = category;
  _cachedList = [];
  if (typeof window !== 'undefined' && window.updateRankingsUI) {
    window.updateRankingsUI();
  }
}

export function renderRankingTab(container, state) {
  if (!container) return;

  const currentCP = CombatPowerService.calculateCombatPower(state);
  const cpTier = CombatPowerService.getCombatPowerTier(currentCP);

  let html = `
    <div class="ranking-panel-wrapper" style="padding: 12px; color: #e2e8f0;">
      <!-- Header do Painel -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, rgba(20,20,35,0.9), rgba(35,25,50,0.9)); border: 1px solid rgba(212,175,55,0.3); border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;">
        <div>
          <h2 style="margin: 0; color: #fbbf24; font-size: 1.3rem; display: flex; align-items: center; gap: 8px;">
            🏆 Hall dos Campeões de Aden
          </h2>
          <div style="font-size: 0.85rem; color: #94a3b8; margin-top: 4px;">
            Classificação global sincronizada via Cloud Database
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.75rem; color: #94a3b8;">Seu Poder de Combate:</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #38bdf8; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
            <span>${cpTier.badge}</span>
            <span>${CombatPowerService.formatCombatPower(currentCP)}</span>
          </div>
          <span style="display: inline-block; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: rgba(56,189,248,0.15); color: ${cpTier.color}; border: 1px solid ${cpTier.color}40; margin-top: 2px;">
            ${cpTier.name}
          </span>
        </div>
      </div>

      <!-- Sub-Abas de Categoria -->
      <div style="display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px;">
        <button onclick="window.setRankingCategoryAction && window.setRankingCategoryAction('cp')" 
                style="flex: 1; min-width: 120px; padding: 8px 12px; border-radius: 8px; border: 1px solid ${_activeCategory === 'cp' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${_activeCategory === 'cp' ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.4)'}; color: ${_activeCategory === 'cp' ? '#fbbf24' : '#94a3b8'}; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
          👑 Combat Power
        </button>
        <button onclick="window.setRankingCategoryAction && window.setRankingCategoryAction('olympiad')" 
                style="flex: 1; min-width: 120px; padding: 8px 12px; border-radius: 8px; border: 1px solid ${_activeCategory === 'olympiad' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${_activeCategory === 'olympiad' ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.4)'}; color: ${_activeCategory === 'olympiad' ? '#fbbf24' : '#94a3b8'}; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
          🏆 Grand Olympiad
        </button>
        <button onclick="window.setRankingCategoryAction && window.setRankingCategoryAction('duels')" 
                style="flex: 1; min-width: 120px; padding: 8px 12px; border-radius: 8px; border: 1px solid ${_activeCategory === 'duels' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${_activeCategory === 'duels' ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.4)'}; color: ${_activeCategory === 'duels' ? '#fbbf24' : '#94a3b8'}; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
          ⚔️ Duelos de Coliseu
        </button>
        <button onclick="window.setRankingCategoryAction && window.setRankingCategoryAction('castles')" 
                style="flex: 1; min-width: 120px; padding: 8px 12px; border-radius: 8px; border: 1px solid ${_activeCategory === 'castles' ? '#fbbf24' : 'rgba(255,255,255,0.1)'}; background: ${_activeCategory === 'castles' ? 'rgba(251,191,36,0.2)' : 'rgba(0,0,0,0.4)'}; color: ${_activeCategory === 'castles' ? '#fbbf24' : '#94a3b8'}; cursor: pointer; font-weight: bold; font-size: 0.85rem;">
          🏰 Lordes dos Castelos
        </button>
      </div>

      <!-- Container da Tabela de Rankings -->
      <div id="ranking-list-container">
        <div style="text-align: center; padding: 30px; color: #94a3b8;">
          <div class="spinner" style="margin: 0 auto 10px auto;"></div>
          Carregando líderes do reino...
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Carrega assincronamente os dados
  loadAndRenderList(container, state, _activeCategory);
}

async function loadAndRenderList(container, state, category) {
  const listEl = container.querySelector('#ranking-list-container');
  if (!listEl) return;

  try {
    const list = await RankingService.getLeaderboard(category, state);
    if (!list || list.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: #94a3b8;">Nenhum guerreiro registrado nesta categoria ainda.</div>`;
      return;
    }

    let rowsHtml = '';
    list.forEach((player, idx) => {
      const rankNum = idx + 1;
      const isTop1 = rankNum === 1;
      const isTop2 = rankNum === 2;
      const isTop3 = rankNum === 3;
      const medal = isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${rankNum}`;
      const isMe = player.isCurrentPlayer;

      const pCP = Number(player.combatPower) || 1000;
      const tier = CombatPowerService.getCombatPowerTier(pCP);

      let statHighlight = '';
      if (category === 'olympiad') {
        statHighlight = `<span style="color: #fbbf24; font-weight: bold;">${player.olympiadPoints || 1000} Pts</span> <span style="font-size:0.75rem; color:#94a3b8;">(${player.olympiadWins || 0}V / ${player.olympiadLosses || 0}D)</span>`;
      } else if (category === 'duels') {
        statHighlight = `<span style="color: #22c55e; font-weight: bold;">${player.duelWins || 0} Vitórias</span>`;
      } else if (category === 'castles') {
        statHighlight = `<span style="color: #a855f7; font-weight: bold;">${player.castleLord || 'Lorde de Castelo'}</span>`;
      } else {
        statHighlight = `<span style="color: #38bdf8; font-weight: bold;">${CombatPowerService.formatCombatPower(pCP)}</span>`;
      }

      rowsHtml += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: ${isMe ? 'rgba(56, 189, 248, 0.12)' : (isTop1 ? 'rgba(251, 191, 36, 0.08)' : 'rgba(0,0,0,0.35)')}; border: 1px solid ${isMe ? '#38bdf8' : (isTop1 ? 'rgba(251, 191, 36, 0.4)' : 'rgba(255,255,255,0.06)')};">
          <!-- Rank & Avatar Info -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: ${rankNum <= 3 ? '1.3rem' : '0.95rem'}; font-weight: bold; width: 32px; text-align: center; color: ${isTop1 ? '#fbbf24' : isTop2 ? '#cbd5e1' : isTop3 ? '#f97316' : '#94a3b8'};">
              ${medal}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-weight: bold; color: ${isMe ? '#38bdf8' : '#f8fafc'}; font-size: 0.95rem;">${player.charName}</span>
                ${player.isHero ? '<span title="Grande Herói de Aden">👑</span>' : ''}
                ${isMe ? '<span style="font-size: 0.65rem; background: #38bdf8; color: #0f172a; padding: 1px 5px; border-radius: 3px; font-weight: bold;">VOCÊ</span>' : ''}
              </div>
              <div style="font-size: 0.75rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                <span>Lv. ${player.level} ${player.className}</span>
                <span>•</span>
                <span style="color: #cbd5e1;">🛡️ ${player.clanName || 'Sem Clã'}</span>
                ${player.topWeaponName ? `<span>•</span> <span style="color: #fbbf24;">⚔️ ${player.topWeaponName}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Stats & Ações -->
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="text-align: right;">
              <div>${statHighlight}</div>
              <div style="font-size: 0.7rem; color: ${tier.color};">${tier.badge} ${tier.name}</div>
            </div>
            ${!isMe ? `
              <button onclick="window.challengeRankingPlayerAction && window.challengeRankingPlayerAction('${player.charName}', ${pCP})" 
                      style="padding: 6px 10px; font-size: 0.75rem; font-weight: bold; border-radius: 6px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.5); color: #f87171; cursor: pointer; transition: all 0.2s;"
                      onmouseover="this.style.background='rgba(239,68,68,0.4)'"
                      onmouseout="this.style.background='rgba(239,68,68,0.2)'">
                ⚔️ Desafiar
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    listEl.innerHTML = `
      <div style="max-height: 600px; overflow-y: auto; padding-right: 4px;">
        ${rowsHtml}
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
        <span style="font-size: 0.75rem; color: #64748b;">Os rankings são recalculados e sincronizados a cada salvamento na nuvem.</span>
        <button onclick="window.refreshRankingsAction && window.refreshRankingsAction()" 
                style="padding: 6px 12px; font-size: 0.8rem; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; cursor: pointer;">
          🔄 Atualizar Lista
        </button>
      </div>
    `;
  } catch (err) {
    listEl.innerHTML = `<div style="text-align: center; padding: 30px; color: #f87171;">Erro ao carregar rankings: ${err.message}</div>`;
  }
}
