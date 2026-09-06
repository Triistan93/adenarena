/**
 * RankingUI.js — Interface Completa de Rankings Globais e Leaderboards
 * 
 * Exibe Top Combat Power (CP), Top Nível, Top Olympiad PvP e Lordes de Castelos
 * com sistema de inspeção de equipamentos e desafio assíncrono.
 */

import { RankingService } from '../services/RankingService.js';
import { CombatPowerService } from '../services/CombatPowerService.js';

let _activeTab = 'cp'; // 'cp' | 'level' | 'olympiad' | 'castles'

export function setActiveRankingTab(tab) {
  _activeTab = tab;
}

export function renderRankingTab(container, state) {
  if (!container || !state) return;

  const playerCP = CombatPowerService.calculateCombatPower(state);
  const rankings = RankingService.getLeaderboards(state);
  const playerProfile = RankingService.buildPublicProfile(state);

  let currentList = [];
  if (_activeTab === 'cp') currentList = rankings.cp || [];
  else if (_activeTab === 'level') currentList = rankings.level || [];
  else if (_activeTab === 'olympiad') currentList = rankings.olympiad || [];
  else if (_activeTab === 'wealth') currentList = rankings.wealth || [];
  else if (_activeTab === 'clans') currentList = rankings.clans || [];
  else if (_activeTab === 'castles') currentList = rankings.castles || [];

  // Garante que o jogador local esteja inserido no topo proporcional
  const playerRankIndex = currentList.findIndex(p => p.charName === playerProfile.charName || (_activeTab === 'clans' && p.isCurrentPlayer));
  const playerRankDisplay = playerRankIndex !== -1 ? `#${playerRankIndex + 1}` : '#12';

  // Cooldown de Recompensa Diária de Ranking
  const now = Date.now();
  const cooldownMs = 24 * 60 * 60 * 1000;
  const lastClaim = state.lastRankingRewardClaim || 0;
  const isRewardReady = now - lastClaim >= cooldownMs;
  const remainingHours = isRewardReady ? 0 : Math.ceil((cooldownMs - (now - lastClaim)) / (60 * 60 * 1000));

  let html = `
    <div style="padding: 10px; max-width: 1000px; margin: 0 auto; font-family: 'Cinzel', serif;">
      
      <!-- Top Banner & Player Standing & Recompensa Diária -->
      <div style="background: linear-gradient(135deg, rgba(30,20,10,0.95), rgba(15,12,8,0.98)); border: 1px solid rgba(212,167,68,0.5); border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 36px; background: rgba(0,0,0,0.4); border: 1px solid #ffd877; border-radius: 10px; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(253,224,71,0.3);">
            🏆
          </div>
          <div>
            <h2 style="margin: 0; color: #f4d58a; font-size: 20px; font-weight: bold;">Quadro de Honra Mundial de Aden</h2>
            <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 12px; font-family: 'Inter', sans-serif;">Classificação Oficial dos Maiores Guerreiros e Clãs</p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
          <div style="background: rgba(0,0,0,0.6); border: 1px solid rgba(212,167,68,0.4); border-radius: 8px; padding: 8px 16px; display: flex; align-items: center; gap: 14px;">
            <div style="text-align: right;">
              <div style="font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif;">Sua Posição:</div>
              <div style="font-size: 16px; font-weight: bold; color: #ffd877; font-family: 'IBM Plex Mono', monospace;">${playerRankDisplay}</div>
            </div>
            <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 12px;">
              <div style="font-size: 11px; color: #94a3b8; font-family: 'Inter', sans-serif;">Seu Poder (CP):</div>
              <div style="font-size: 16px; font-weight: bold; color: #60a5fa; font-family: 'IBM Plex Mono', monospace;">⚔️ ${playerCP.toLocaleString()}</div>
            </div>
          </div>

          <!-- Recompensa Diária de Rank -->
          <div>
            ${isRewardReady ? `
              <button
                onclick="window.claimRankingRewardAction()"
                style="padding: 10px 16px; font-family: 'Cinzel', serif; font-size: 11.5px; font-weight: bold; background: linear-gradient(180deg, #ca8a04, #a16207); border: 1px solid #fde047; color: #fff; border-radius: 8px; cursor: pointer; box-shadow: 0 0 12px rgba(234,179,8,0.4);"
              >
                🎁 Reivindicar Tributo Diário
              </button>
            ` : `
              <button
                disabled
                style="padding: 10px 16px; font-family: 'Inter', sans-serif; font-size: 11px; background: rgba(0,0,0,0.4); border: 1px solid #3f3f46; color: #94a3b8; border-radius: 8px; cursor: not-allowed;"
              >
                ⏳ Tributo Coletado (${remainingHours}h)
              </button>
            `}
          </div>
        </div>
      </div>

      <!-- Categories Tabs -->
      <div style="display: flex; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid rgba(212,167,68,0.2); padding-bottom: 8px; flex-wrap: wrap;">
        <button class="rank-cat-btn ${_activeTab === 'cp' ? 'active' : ''}" data-cat="cp" style="background: ${_activeTab === 'cp' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'cp' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'cp' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          ⚔️ Top Combat Power (CP)
        </button>
        <button class="rank-cat-btn ${_activeTab === 'level' ? 'active' : ''}" data-cat="level" style="background: ${_activeTab === 'level' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'level' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'level' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          ⭐ Top Nível &amp; XP
        </button>
        <button class="rank-cat-btn ${_activeTab === 'olympiad' ? 'active' : ''}" data-cat="olympiad" style="background: ${_activeTab === 'olympiad' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'olympiad' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'olympiad' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          👑 Top Olimpíadas (PvP)
        </button>
        <button class="rank-cat-btn ${_activeTab === 'wealth' ? 'active' : ''}" data-cat="wealth" style="background: ${_activeTab === 'wealth' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'wealth' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'wealth' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          💰 Fortuna (Adena)
        </button>
        <button class="rank-cat-btn ${_activeTab === 'clans' ? 'active' : ''}" data-cat="clans" style="background: ${_activeTab === 'clans' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'clans' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'clans' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          🛡️ Melhores Clãs
        </button>
        <button class="rank-cat-btn ${_activeTab === 'castles' ? 'active' : ''}" data-cat="castles" style="background: ${_activeTab === 'castles' ? '#ca8a04' : 'rgba(0,0,0,0.4)'}; color: ${_activeTab === 'castles' ? '#000' : '#cbd5e1'}; border: 1px solid ${_activeTab === 'castles' ? '#fde047' : 'rgba(255,255,255,0.1)'}; padding: 7px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 11.5px;">
          🏰 Castelos
        </button>
      </div>

      <!-- Leaderboard List -->
      <div style="display: flex; flex-direction: column; gap: 8px; font-family: 'Inter', sans-serif;">
        ${currentList.slice(0, 50).map((p, idx) => {
          const rank = idx + 1;
          const isTop1 = rank === 1;
          const isTop3 = rank <= 3;
          const badgeColor = isTop1 ? '#fbbf24' : (rank === 2 ? '#94a3b8' : (rank === 3 ? '#b45309' : '#475569'));
          const isSelf = p.charName === playerProfile.charName || p.isCurrentPlayer;
          const isVerified = p.isVerified || (p.level || 0) >= 20;

          // Se for aba de Clãs
          if (_activeTab === 'clans') {
            return `
              <div style="background: ${isSelf ? 'rgba(59,130,246,0.15)' : 'rgba(18,24,36,0.85)'}; border: 1px solid ${isSelf ? '#3b82f6' : (isTop3 ? 'rgba(212,167,68,0.4)' : 'rgba(255,255,255,0.06)')}; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 32px; height: 32px; border-radius: 50%; background: ${badgeColor}; color: #000; font-weight: bold; font-family: 'Cinzel', serif; font-size: 14px; display: flex; align-items: center; justify-content: center;">
                    ${isTop1 ? '👑' : rank}
                  </div>
                  <div>
                    <div style="font-weight: bold; color: ${isTop1 ? '#fde047' : '#fff'}; font-size: 14px; font-family: 'Cinzel', serif; display: flex; align-items: center; gap: 6px;">
                      🛡️ ${p.clanName} ${isSelf ? '<span style="color:#60a5fa; font-size:10px;">(Seu Clã)</span>' : ''}
                      ${isVerified ? '<span style="background:rgba(34,197,94,0.15); border:1px solid #22c55e; color:#4ade80; font-size:10px; padding:1px 5px; border-radius:4px;">🛡️ Verificado</span>' : ''}
                    </div>
                    <div style="font-size: 11px; color: #94a3b8;">
                      Líder: <strong>${p.charName}</strong> · Nível ${p.level} · Membros: ${p.membersCount || 6} ${p.castleLord ? `· 🏰 ${p.castleLord}` : ''}
                    </div>
                  </div>
                </div>

                <div style="text-align: right; font-family: 'IBM Plex Mono', monospace;">
                  <div style="font-size: 13px; font-weight: bold; color: #fde047;">
                    ${(p.reputation || 0).toLocaleString()} CRP
                  </div>
                  <div style="font-size: 10px; color: #94a3b8;">Reputação de Clã</div>
                </div>
              </div>
            `;
          }

          // Se for aba de Castelos
          if (_activeTab === 'castles') {
            return `
              <div style="background: rgba(18,24,36,0.85); border: 1px solid rgba(212,167,68,0.4); border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="font-size: 24px;">🏰</div>
                  <div>
                    <div style="font-weight: bold; color: #fde047; font-size: 14px; font-family: 'Cinzel', serif;">
                      ${p.castle}
                    </div>
                    <div style="font-size: 11px; color: #cbd5e1;">
                      Lorde Soberano: <strong style="color:#fff;">${p.lord}</strong> (${p.clan})
                    </div>
                  </div>
                </div>
                <div style="text-align: right; font-family: 'IBM Plex Mono', monospace;">
                  <div style="font-size: 13px; font-weight: bold; color: #4ade80;">Taxa: ${p.tax}</div>
                  <div style="font-size: 10px; color: #94a3b8;">Tributo de Adena</div>
                </div>
              </div>
            `;
          }

          // Demais abas: CP, Nível, Olimpíadas, Riqueza
          return `
            <div style="background: ${isSelf ? 'rgba(59,130,246,0.15)' : 'rgba(18,24,36,0.85)'}; border: 1px solid ${isSelf ? '#3b82f6' : (isTop3 ? 'rgba(212,167,68,0.4)' : 'rgba(255,255,255,0.06)')}; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
              
              <!-- Rank & Avatar & Name -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 32px; height: 32px; border-radius: 50%; background: ${badgeColor}; color: #000; font-weight: bold; font-family: 'Cinzel', serif; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${badgeColor}88;">
                  ${isTop1 ? '👑' : rank}
                </div>
                <div>
                  <div style="font-weight: bold; color: ${isTop1 ? '#fde047' : '#fff'}; font-size: 14px; font-family: 'Cinzel', serif; display: flex; align-items: center; gap: 6px;">
                    ${p.charName} ${p.isHero ? '<span style="color:#fde047; font-size:11px;">[HERO 👑]</span>' : ''} ${isSelf ? '<span style="color:#60a5fa; font-size:10px;">(Você)</span>' : ''}
                    ${isVerified ? '<span style="background:rgba(34,197,94,0.15); border:1px solid #22c55e; color:#4ade80; font-size:10px; padding:1px 5px; border-radius:4px;">🛡️ Verificado</span>' : ''}
                  </div>
                  <div style="font-size: 11px; color: #94a3b8;">
                    Lv. ${p.level} · ${p.className} · ${p.topWeaponName || 'Arma Lendária'}
                  </div>
                </div>
              </div>

              <!-- Stats & Actions -->
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="text-align: right; font-family: 'IBM Plex Mono', monospace;">
                  ${_activeTab === 'wealth' ? `
                    <div style="font-size: 13px; font-weight: bold; color: #a3e635;">
                      💰 ${(p.gold || 0).toLocaleString()} Adena
                    </div>
                    <div style="font-size: 10px; color: #94a3b8;">Fortuna Acumulada</div>
                  ` : _activeTab === 'olympiad' ? `
                    <div style="font-size: 13px; font-weight: bold; color: #fde047;">
                      🏆 ${(p.olympiadPoints || 1000).toLocaleString()} pts
                    </div>
                    <div style="font-size: 10px; color: #94a3b8;">Olimpíadas PvP</div>
                  ` : _activeTab === 'level' ? `
                    <div style="font-size: 13px; font-weight: bold; color: #38bdf8;">
                      ⭐ Nível ${p.level}
                    </div>
                    <div style="font-size: 10px; color: #94a3b8;">⚔️ ${(p.combatPower || 1000).toLocaleString()} CP</div>
                  ` : `
                    <div style="font-size: 13px; font-weight: bold; color: #60a5fa;">
                      ⚔️ ${(p.combatPower || 1000).toLocaleString()} CP
                    </div>
                    <div style="font-size: 10px; color: #94a3b8;">Clã: ${p.clanName || 'Sem Clã'}</div>
                  `}
                </div>

                ${!isSelf ? `
                  <button onclick="window.challengeRankingPlayerAction('${p.charName}', ${p.combatPower || 1000})" style="background: rgba(220,38,38,0.2); border: 1px solid #ef4444; color: #fca5a5; border-radius: 6px; padding: 6px 12px; font-size: 11px; cursor: pointer; font-weight: bold;">
                    ⚔️ Desafiar
                  </button>
                ` : ''}
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;

  container.innerHTML = html;

  // Event Listeners de Categoria
  container.querySelectorAll('.rank-cat-btn').forEach(btn => {
    btn.onclick = () => {
      _activeTab = btn.dataset.cat;
      renderRankingTab(container, state);
    };
  });
}
