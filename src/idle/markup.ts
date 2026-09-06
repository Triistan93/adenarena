// The idle game's DOM, injected verbatim into a Shadow Root so its styles
// and IDs cannot collide with the 3D arena that shares the page.
export const IDLE_MARKUP = `
  <div id="game">
    <div class="ambient-layer" aria-hidden="true"></div>
    <div id="float-layer" class="float-layer" aria-hidden="true"></div>
    <!-- Top Bar -->
    <header class="top-bar" style="padding-right: clamp(84px, 7vw, 110px);">
      <span id="game-title">ADEN ARENA <span class="title-idle-stamp"><span class="stamp-idle"><span class="stamp-idle-text">IDLE</span><span class="stamp-idle-sub">CHRONICLES</span></span></span></span>
      <div class="top-stats" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:12px;">
        <div class="top-stats-left" style="display:flex; align-items:center; gap:8px;">
          <span class="ts-zone">
            <span class="ts-label">Região</span>
            <span id="zone-name">Talking Island</span>
            <span id="zone-kill-progress" style="font-size:11px; color:#f59e0b; margin-left:8px; font-weight:800; background:rgba(0,0,0,0.5); padding:2px 8px; border-radius:4px; border:1px solid rgba(245,158,11,0.4);"><span style="color:#d4af37;">⚔</span> 0/50 Caçados</span>
            <span id="season-badge" style="font-size:10px; color:#93c5fd; margin-left:6px; font-weight:bold; background:rgba(30,58,138,0.25); padding:2px 8px; border-radius:4px; border:1px solid rgba(147,197,253,0.35); font-family:'Cinzel',serif;" title="Temporada 1: O Despertar de Aden (Cap Lv 60)">✦ Temp 1: Cap Lv 60</span>
          </span>
          <div id="top-bar-guide-container" style="display:inline-flex;">
            <button id="top-bar-guide-btn" class="top-guide-btn" style="background:linear-gradient(180deg, rgba(70,55,25,0.7), rgba(30,22,10,0.9)); border:1px solid rgba(212, 167, 68, 0.6); color:#ffd877; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;" onclick="window.openCurrentTabGuide && window.openCurrentTabGuide()">📜 Guia</button>
          </div>
        </div>
        <div class="top-stats-right" style="display:flex; align-items:center; gap:10px; margin-left:auto;">
          <button id="admin-top-btn" class="admin-top-btn" onclick="window.openAdminModal && window.openAdminModal()" style="display:none; background:linear-gradient(180deg, rgba(160,30,30,0.85), rgba(90,15,15,0.98)); border:1px solid #ef4444; color:#fee2e2; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; align-items:center; gap:5px; transition:all 0.2s; box-shadow:0 0 10px rgba(239,68,68,0.35);">
            👑 Admin
          </button>
          <button id="top-referral-btn" onclick="window.openReferralModal && window.openReferralModal()" style="background:linear-gradient(180deg, rgba(16,185,129,0.7), rgba(5,150,105,0.95)); border:1px solid #10b981; color:#ecfdf5; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s; box-shadow:0 0 10px rgba(16,185,129,0.25);" title="Indique amigos e ganhe 50 Aden Coins + 5x Blessed Scrolls!">
            🎁 Indicar Amigos
          </button>
          <button id="top-market-btn" onclick="window.openMarketTab ? window.openMarketTab() : (window.openPanel && window.openPanel('market'))" style="background:linear-gradient(180deg, rgba(30,40,60,0.8), rgba(15,20,30,0.95)); border:1px solid #60a5fa; color:#93c5fd; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s; box-shadow:0 0 10px rgba(96,165,250,0.25);">
            🏛️ Mercado
          </button>
          <button id="cash-shop-btn" onclick="window.openCashShopModal && window.openCashShopModal()" style="background:linear-gradient(180deg, rgba(138,106,36,0.6), rgba(48,35,15,0.95)); border:1px solid #ffd700; color:#fde047; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s; box-shadow:0 0 10px rgba(255,215,0,0.25);">
            <span style="color:#ffd700; font-size:12px;">⚜</span> <span id="top-ac-amount" style="font-weight:bold; color:#ffd700;">0 AC</span> <span style="background:rgba(212,175,55,0.3); border:1px solid rgba(255,215,0,0.6); border-radius:3px; padding:1px 5px; font-size:9px; color:#fef08a; text-transform:uppercase; font-weight:700;">Loja</span>
          </button>
          <button id="daily-reward-btn" onclick="window.openDailyRewardModal && window.openDailyRewardModal()" style="background:linear-gradient(180deg, rgba(80,55,20,0.7), rgba(35,22,10,0.9)); border:1px solid rgba(234, 179, 8, 0.6); color:#fef08a; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; cursor:pointer; display:inline-flex; align-items:center; gap:6px; transition:all 0.2s; position:relative;">
            🎁 Check-in
            <span id="daily-reward-dot" style="display:none; width:8px; height:8px; background:#ef4444; border-radius:50%; box-shadow:0 0 8px #ef4444; position:absolute; top:-2px; right:-2px;"></span>
          </button>
          <a href="https://discord.gg/adenarena" target="_blank" rel="noopener noreferrer" id="top-discord-btn" style="background:linear-gradient(180deg, rgba(88,101,242,0.8), rgba(60,70,180,0.95)); border:1px solid #5865F2; color:#fff; border-radius:4px; padding:3px 10px; font-size:11px; font-weight:bold; font-family:'Cinzel',serif; text-decoration:none; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s; box-shadow:0 0 10px rgba(88,101,242,0.35);">
            💬 Discord
          </a>
          <span class="ts-clock" style="display:inline-flex; align-items:center; gap:4px;"><span class="ts-label">Sessão</span><span id="clock">00:00:00</span></span>
          <span id="save-status-badge" style="font-size:10px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); color:#34d399; padding:2px 8px; border-radius:4px; font-weight:bold;">● Salvo</span>
          <button id="audio-mute-btn" onclick="window.toggleMuteAudio && window.toggleMuteAudio()" style="background:rgba(30,35,45,0.8);border:1px solid rgba(255,255,255,0.15);color:#ece4d3;border-radius:4px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;transition:background 0.2s;" onmouseover="this.style.background='rgba(50,55,70,0.9)'" onmouseout="this.style.background='rgba(30,35,45,0.8)'">♫ Audio</button>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <main class="main-grid">
      <!-- Left: Character Stats -->
      <aside class="panel stats-panel l2-gold-frame">
        <!-- Header Nobre -->
        <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(212,169,78,0.35); padding-bottom:6px; margin-bottom:8px;">
          <h2 style="font-family:'Cinzel',serif; font-size:12px; font-weight:900; color:#f5df93; margin:0; letter-spacing:0.12em; text-transform:uppercase; text-shadow:0 0 8px rgba(212,167,68,0.3);">⚔️ Status de Aden</h2>
          <span id="char-combat-power" style="font-family:'Cinzel',serif; font-size:10px; color:#60a5fa; font-weight:bold; background:rgba(30,58,138,0.4); border:1px solid rgba(96,165,250,0.4); padding:1px 6px; border-radius:4px;">CP: 120</span>
        </div>

        <!-- Identidade Resumida do Herói -->
        <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(212,167,68,0.2); border-radius:6px; padding:6px 8px; margin-bottom:6px; display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; color:#94a3b8; font-family:'Cinzel',serif;">NÍVEL</span>
            <span id="level-text" class="stat-value" style="color:#ffd700; font-weight:bold; font-size:13px;">1</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
            <span id="race-text" class="stat-value" style="color:#e2e8f0; font-weight:600;">Human</span>
            <span id="class-text" class="stat-value" style="color:#c5a059; font-weight:600;">Fighter</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; color:#64748b; border-top:1px dashed rgba(255,255,255,0.06); padding-top:2px; margin-top:2px;">
            <span>Crônica</span>
            <span id="saga-text" class="stat-value" style="color:#94a3b8;">Interlude</span>
          </div>
        </div>

        <!-- Medidores Nobres (HP / MP / XP) -->
        <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(212,167,68,0.15); border-radius:6px; padding:6px 8px; margin-bottom:6px; display:flex; flex-direction:column; gap:5px;">
          <div class="stat-row l2-gauge-slot" style="padding:0; margin:0;">
            <label style="color:#ef4444; font-weight:bold; font-family:'Cinzel',serif; font-size:10px; width:22px;">HP</label>
            <div class="bar-container l2-gauge-bezel">
              <div id="hp-bar" class="bar hp l2-gauge-hp-fill" style="width:100%"></div>
              <span id="hp-text" style="font-weight:700; text-shadow:1px 1px 2px #000; font-size:9px;">100 / 100</span>
            </div>
          </div>
          <div class="stat-row l2-gauge-slot" style="padding:0; margin:0;">
            <label style="color:#3b82f6; font-weight:bold; font-family:'Cinzel',serif; font-size:10px; width:22px;">MP</label>
            <div class="bar-container l2-gauge-bezel">
              <div id="mp-bar" class="bar mp l2-gauge-mp-fill" style="width:100%"></div>
              <span id="mp-text" style="font-weight:700; text-shadow:1px 1px 2px #000; font-size:9px;">50 / 50</span>
            </div>
          </div>
          <div class="stat-row l2-gauge-slot" style="padding:0; margin:0;">
            <label style="color:#c084fc; font-weight:bold; font-family:'Cinzel',serif; font-size:10px; width:22px;">XP</label>
            <div class="bar-container l2-gauge-bezel">
              <div id="xp-bar" class="bar xp l2-gauge-xp-fill" style="width:0%"></div>
              <span id="xp-text" style="font-weight:700; text-shadow:1px 1px 2px #000; font-size:9px;">0 / 100</span>
            </div>
          </div>
        </div>

        <!-- Bloco de Combate Físico -->
        <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(212,167,68,0.15); border-radius:6px; padding:6px 8px; margin-bottom:6px;">
          <div style="font-size:9px; font-weight:bold; color:#d4a744; font-family:'Cinzel',serif; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">⚔️ Combate Físico</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">ATK</label><span id="atk-text" class="stat-value" style="color:#f87171; font-weight:bold;">10</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">DEF</label><span id="def-text" class="stat-value" style="color:#60a5fa; font-weight:bold;">5</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">CRIT</label><span id="crit-text" class="stat-value" style="color:#fde047; font-weight:bold;">0%</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">EVA</label><span id="eva-text" class="stat-value" style="color:#a7f3d0; font-weight:bold;">0</span></div>
          </div>
        </div>

        <!-- Bloco de Poder Mágico & Sorte -->
        <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(212,167,68,0.15); border-radius:6px; padding:6px 8px; margin-bottom:6px;">
          <div style="font-size:9px; font-weight:bold; color:#d4a744; font-family:'Cinzel',serif; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">🔮 Magia &amp; Forja</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">M.ATK</label><span id="matk-text" class="stat-value" style="color:#c084fc; font-weight:bold;">0</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">M.DEF</label><span id="mdef-text" class="stat-value" style="color:#818cf8; font-weight:bold;">0</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">Drop</label><span id="loot-text" class="stat-value" style="color:#34d399; font-weight:bold;">100%</span></div>
            <div class="stat-row" style="padding:2px 4px;"><label style="font-size:9px;">Forja</label><span id="craft-level-stat" class="stat-value" style="color:#fbbf24; font-weight:bold;">Nv 1</span></div>
          </div>
        </div>

        <!-- Bloco de Tesouro & Recursos -->
        <div style="background:rgba(0,0,0,0.45); border:1px solid rgba(212,167,68,0.25); border-radius:6px; padding:6px 8px; margin-bottom:6px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; color:#ffd700; font-family:'Cinzel',serif; font-weight:bold;">🪙 ADENA</span>
            <span id="gold-text-stat" class="stat-value gold" style="color:#f59e0b; font-weight:bold; font-size:13px;">0</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; margin-top:2px;">
            <span style="color:#64748b;">Renda/s:</span>
            <span id="gps-text" class="stat-value gold-dim" style="font-size:10px;">—</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; margin-top:2px; border-top:1px dashed rgba(255,255,255,0.06); padding-top:2px;">
            <span style="color:#67e8f9;">✦ SP:</span>
            <span id="sp-text" class="stat-value" style="color:#67e8f9; font-weight:bold;">0</span>
          </div>
        </div>

        <!-- Efeitos & Bênçãos Ativas -->
        <div style="margin-top:auto;">
          <div style="font-size:9px; font-weight:bold; color:#94a3b8; font-family:'Cinzel',serif; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:3px;">✨ Bênçãos Ativas</div>
          <div class="active-buffs" id="active-buffs"><span class="ab-empty">Nenhum buff ativo</span></div>
        </div>
      </aside>

      <div class="grid-resizer grid-resizer-v" id="resizer-col-1" title="Arrastre para redimensionar painel de atributos"></div>

      <!-- Center: live battle stage + combat ticker (compact & centered) -->
      <section class="panel log-panel center-panel l2-gold-frame" id="center-panel">
        <div class="stage" id="stage" data-state="idle">
          <div class="stage-bg stage-bg-a" id="stage-bg-a"></div>
          <div class="stage-bg stage-bg-b" id="stage-bg-b"></div>
          <div class="stage-header-bar">
            <div class="stage-zone" id="stage-zone">—</div>
            <div class="combat-controls-bar">
              <button id="combat-toggle-btn" class="combat-ctrl-btn active" title="Pausar ou Iniciar Caça Automática (Tecla P)"><span class="combat-stance-gem"></span> <span>⚔️ Caçando</span></button>
              <button id="soulshot-toggle-btn" class="combat-ctrl-btn" title="Ativar Soulshot no combate (+100% dano)"><span>⚡ SS</span> <span style="font-size:9px; color:#ffd877;">(OFF)</span></button>
              <button id="autopotion-toggle-btn" class="combat-ctrl-btn" title="Usar poções de HP automaticamente quando HP < 50%"><span>🧪 Auto-HP</span> <span style="font-size:9px; color:#ffd877;">(OFF)</span></button>
              <button id="speed-toggle-btn" class="combat-ctrl-btn" title="Velocidade do combate (1x Normal ou 2x Turbo)"><span>⏩ 1x</span></button>
              <label class="combat-ctrl-btn combat-ctrl-vfx" style="display:inline-flex; align-items:center; gap:4px; cursor:pointer;" title="Qualidade dos efeitos visuais">
                <span>VFX</span>
                <select id="vfx-quality-select" title="Qualidade dos efeitos visuais">
                  <option value="low">Baixo</option>
                  <option value="medium" selected>Médio</option>
                  <option value="high">Alto</option>
                </select>
              </label>
            </div>
          </div>
          <div class="stage-vs" aria-hidden="true">&#9876;</div>
          <div class="stage-hero" id="stage-hero">
            <div class="stage-entity-name stage-hero-name" id="hero-name">Tristan</div>
            <div class="stage-entity-level stage-hero-level" id="hero-level">Level 1</div>
            <div class="stage-hp-bar stage-hp-bar-hero" id="hero-hp-bar">
              <div class="stage-hp-fill stage-hp-fill-hero" id="hero-hp-fill"></div>
              <span class="stage-hp-text stage-hp-text-hero" id="hero-hp-text">HP: 100 / 100</span>
            </div>
            <div class="stage-mp-bar stage-mp-bar-hero" id="hero-mp-bar">
              <div class="stage-mp-fill stage-mp-fill-hero" id="hero-mp-fill"></div>
              <span class="stage-mp-text stage-mp-text-hero" id="hero-mp-text">MP: 50 / 50</span>
            </div>
            <div class="hero-sprite-host" id="hero-sprite-container"></div>
          </div>
          <div class="stage-monster" id="stage-monster">
            <div class="stage-entity-name" id="monster-name">Procurando Inimigo...</div>
            <div class="stage-entity-level stage-monster-level" id="monster-level">Level 1</div>
            <div class="stage-hp-bar" id="monster-hp-bar">
              <div class="stage-hp-fill" id="monster-hp-fill"></div>
              <span class="stage-hp-text" id="monster-hp-text">HP: 0 / 0</span>
            </div>
            <div class="stage-stagger-bar" id="monster-stagger-bar" style="display:none;">
              <div class="stage-stagger-fill" id="monster-stagger-fill"></div>
              <span class="stage-stagger-text" id="monster-stagger-text">POSTURA: 100%</span>
            </div>
            <div class="monster-sprite-host" id="monster-sprite-container"></div>
          </div>
          <div class="stage-floats" id="stage-floats"></div>
        </div>
        <div class="grid-resizer grid-resizer-h" id="resizer-row-stage" title="Arrastre para redimensionar janela de combate"></div>
        <div class="log-controls-bar">
          <div class="log-filters">
            <button class="log-filter-btn active" data-logfilter="all">✨ Todos</button>
            <button class="log-filter-btn" data-logfilter="loot">📦 Drops &amp; Itens</button>
            <button class="log-filter-btn" data-logfilter="gold_xp">💰 XP &amp; Ouro</button>
            <button class="log-filter-btn" data-logfilter="combat">⚔️ Combate</button>
            <button class="log-filter-btn" data-logfilter="system">⚙️ Sistema</button>
          </div>
          <button id="clear-log-btn" class="log-clear-btn" title="Limpar histórico de log">🧹 Limpar</button>
        </div>
        <div style="position:relative; height:100%; min-height:0; display:flex; flex-direction:column; overflow:hidden;">
          <div id="log" class="log">
            <p class="log-entry system"><span class="log-time">[00:00:00]</span> <span class="log-badge badge-sys">SISTEMA</span> Bem-vindo ao Aden Arena.</p>
            <p class="log-entry system"><span class="log-time">[00:00:00]</span> <span class="log-badge badge-sys">SISTEMA</span> Selecione sua Raça &amp; Classe para iniciar sua jornada.</p>
          </div>
          <button id="log-scroll-down-btn" style="display:none; position:absolute; bottom:12px; left:50%; transform:translateX(-50%); background:rgba(30,35,45,0.92); border:1px solid rgba(212,167,68,0.6); color:#fef08a; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; padding:4px 14px; border-radius:20px; cursor:pointer; box-shadow:0 4px 14px rgba(0,0,0,0.6); z-index:10; animation:bounce 1.5s infinite;" onclick="window.scrollLogToBottom && window.scrollLogToBottom()">
            ⬇️ Novas Mensagens
          </button>
        </div>
        <form id="chat-form" class="chat-input-bar">
          <label for="chat-input" class="sr-only" style="display:none;">Mensagem do Chat</label>
          <input type="text" id="chat-input" name="chatInput" class="chat-input" placeholder="Digite uma mensagem..." autocomplete="off" aria-label="Digite uma mensagem no chat" />
          <button type="submit" class="chat-send-btn">Enviar</button>
        </form>
      </section>

      <div class="grid-resizer grid-resizer-v" id="resizer-col-2" title="Arrastre para redimensionar inventário e abas"></div>

      <!-- Right: Main Menu Workspace (Expanded with Master 4-Pillar Dock) -->
      <aside class="panel tabs-panel l2-gold-frame">
        <!-- Master Navigation Dock: 4 Pillars of Aden -->
        <div class="pillar-dock-container" id="pillar-dock-container">
          <div class="pillar-master-tabs">
            <button type="button" class="pillar-tab-btn active" data-pillar="combat" onclick="window.switchPillar && window.switchPillar('combat')">
              <span class="pillar-icon">⚔️</span>
              <span class="pillar-title">Combate</span>
            </button>
            <button type="button" class="pillar-tab-btn" data-pillar="character" onclick="window.switchPillar && window.switchPillar('character')">
              <span class="pillar-icon">🛡️</span>
              <span class="pillar-title">Herói</span>
            </button>
            <button type="button" class="pillar-tab-btn" data-pillar="economy" onclick="window.switchPillar && window.switchPillar('economy')">
              <span class="pillar-icon">🏛️</span>
              <span class="pillar-title">Império</span>
            </button>
            <button type="button" class="pillar-tab-btn" data-pillar="glory" onclick="window.switchPillar && window.switchPillar('glory')">
              <span class="pillar-icon">👑</span>
              <span class="pillar-title">Glória</span>
            </button>
          </div>

          <!-- Pillar 1 Subtabs: Combate -->
          <div class="pillar-subtabs-strip" id="pillar-strip-combat">
            <button class="tab-btn active subtab-pill-btn" data-tab="zones">⚔ Caça &amp; Zonas</button>
            <button class="tab-btn subtab-pill-btn" data-tab="raids">🐉 Raids &amp; Bosses</button>
            <button class="tab-btn subtab-pill-btn" data-tab="tower">🏰 Torre da Insolência</button>
            <button class="tab-btn subtab-pill-btn" data-tab="colosseum">⚔ Coliseu PvP</button>
            <button class="tab-btn subtab-pill-btn" data-tab="expeditions">🏰 Expedições</button>
          </div>

          <!-- Pillar 2 Subtabs: Herói -->
          <div class="pillar-subtabs-strip" id="pillar-strip-character" style="display:none;">
            <button class="tab-btn subtab-pill-btn" data-tab="character">🛡 Personagem</button>
            <button class="tab-btn subtab-pill-btn" data-tab="inventory">🎒 Mochila <span id="tab-badge-inventory" class="tab-badge" style="display:none">!</span></button>
            <button class="tab-btn subtab-pill-btn" data-tab="skills">✦ Habilidades <span id="tab-badge-skills" class="tab-badge" style="display:none">!</span></button>
            <button class="tab-btn subtab-pill-btn" data-tab="astral">★ Maestria</button>
            <button class="tab-btn subtab-pill-btn" data-tab="dolls">🧸 Dolls &amp; Pets</button>
            <button class="tab-btn subtab-pill-btn" data-tab="quests">🎯 Missões <span id="tab-badge-quests" class="tab-badge" style="display:none">!</span></button>
          </div>

          <!-- Pillar 3 Subtabs: Império & Economia -->
          <div class="pillar-subtabs-strip" id="pillar-strip-economy" style="display:none;">
            <button class="tab-btn subtab-pill-btn" data-tab="market" style="border-color:#ffd700; color:#fde047; font-weight:bold;">🏛 Mercado Giran (P2P)</button>
            <button class="tab-btn subtab-pill-btn" data-tab="shop">⚜ Mercador</button>
            <button class="tab-btn subtab-pill-btn" data-tab="craft">⚒ Forja Imperial <span id="tab-badge-craft" class="tab-badge" style="display:none">!</span></button>
            <button class="tab-btn subtab-pill-btn" data-tab="alchemy">🧪 Alquimia</button>
            <button class="tab-btn subtab-pill-btn" data-tab="warehouse">📦 Baú Privado</button>
            <button class="tab-btn subtab-pill-btn" data-tab="magiclamp">🪔 Lâmpada Mágica</button>
          </div>

          <!-- Pillar 4 Subtabs: Glória & Sociedade -->
          <div class="pillar-subtabs-strip" id="pillar-strip-glory" style="display:none;">
            <button class="tab-btn subtab-pill-btn" data-tab="clan">🛡 Clã &amp; Castelos</button>
            <button class="tab-btn subtab-pill-btn" data-tab="olympiad">🏆 Olimpíadas</button>
            <button class="tab-btn subtab-pill-btn" data-tab="rankings">🏆 Rankings Mundiais</button>
            <button class="tab-btn subtab-pill-btn" data-tab="sevensigns">🏛 Sete Selos</button>
            <button class="tab-btn subtab-pill-btn" data-tab="fortress">⚔ Fortalezas</button>
            <button class="tab-btn subtab-pill-btn" data-tab="enchant">✦ Encantamento</button>
            <button class="tab-btn subtab-pill-btn" data-tab="codex">📜 Codex</button>
          </div>
        </div>
        <div class="tab-content">
          <!-- Character Tab — Ficha Real de Aden -->
          <div id="tab-character" class="tab-pane">
            
            <!-- 1. Santuário do Herói: Vitrine & Identidade Integrada -->
            <!-- 1. Santuário do Herói: Vitrine & Identidade Centralizada -->
            <div class="l2-hero-dossier" id="portrait">
              <!-- Retrato Real Centralizado com Moldura Nobre -->
              <div class="l2-hero-avatar-frame">
                <div class="portrait-aura" id="portrait-aura"></div>
                <div class="l2-hero-avatar-viewport">
                  <div class="portrait-art" id="portrait-art"></div>
                </div>
                <div class="l2-hero-avatar-shade"></div>
              </div>

              <!-- Identidade, Poder de Combate & Vitals Centralizados -->
              <div class="l2-hero-identity-box">
                <div class="l2-hero-header-row">
                  <div>
                    <div class="l2-hero-title-group">
                      <h2 class="l2-hero-name" id="portrait-name">Tristan</h2>
                      <span class="l2-hero-level-tag">Nv. <span id="hero-sheet-level">1</span></span>
                    </div>
                    <div class="l2-hero-lineage" style="margin-top: 4px;">
                      <span id="hero-race-class-display">Humano · Human Fighter</span>
                      <span class="l2-hero-tier-badge" id="hero-tier-badge">Tier 1 · Iniciado</span>
                    </div>
                  </div>
                </div>

                <!-- CP Plaque de Alto Prestígio -->
                <div class="l2-cp-plaque">
                  <div class="l2-cp-main">
                    <span class="l2-cp-rune">⚡</span>
                    <div class="l2-cp-data">
                      <span class="l2-cp-caption">PODER DE COMBATE</span>
                      <span class="l2-cp-num" id="hero-cp-val">0 CP</span>
                    </div>
                  </div>
                  <div id="hero-cp-badge-wrap" class="l2-cp-badge-wrap">
                    <span id="portrait-sub" class="portrait-sub"></span>
                  </div>
                </div>

                <!-- Medidores Vitais Reais (HP / MP / CP) -->
                <div class="l2-vitals-container">
                  <div class="l2-vital-meter">
                    <div class="l2-vital-head">
                      <span class="l2-vital-title hp">❤️ HP</span>
                      <span class="l2-vital-val" id="hero-vital-hp">0 / 0</span>
                    </div>
                    <div class="l2-vital-track">
                      <div class="l2-vital-bar hp" id="hero-vital-bar-hp" style="width: 100%;"></div>
                    </div>
                  </div>
                  <div class="l2-vital-meter">
                    <div class="l2-vital-head">
                      <span class="l2-vital-title mp">💙 MP</span>
                      <span class="l2-vital-val" id="hero-vital-mp">0 / 0</span>
                    </div>
                    <div class="l2-vital-track">
                      <div class="l2-vital-bar mp" id="hero-vital-bar-mp" style="width: 100%;"></div>
                    </div>
                  </div>
                  <div class="l2-vital-meter">
                    <div class="l2-vital-head">
                      <span class="l2-vital-title cp">🛡️ CP</span>
                      <span class="l2-vital-val" id="hero-vital-cp">0 / 0</span>
                    </div>
                    <div class="l2-vital-track">
                      <div class="l2-vital-bar cp" id="hero-vital-bar-cp" style="width: 100%;"></div>
                    </div>
                  </div>
                </div>

                <!-- Placeholder oculto para evitar erros de scripts legados -->
                <div id="class-advancement-banner" style="display:none !important;">
                  <span id="class-advancement-title"></span>
                  <span id="class-advancement-sub"></span>
                  <button id="class-advancement-btn"></button>
                </div>
              </div>
            </div>

            <!-- 2. Os Seis Pilares Raciais (Atributos Primários Sagrados) -->
            <div class="l2-char-section">
              <div class="l2-section-header">
                <span class="l2-section-icon">🏛️</span>
                <h3>Atributos Primários de Aden (Linhagem &amp; Dyes)</h3>
                <span class="l2-section-tag">Base + Bônus</span>
              </div>
              <div id="char-primary-stats-grid" class="l2-primary-stats-grid"></div>
            </div>

            <!-- 3. Matriz Tática de Combate (Ofensiva & Defensiva) -->
            <div class="l2-char-section">
              <div class="l2-section-header">
                <span class="l2-section-icon">⚔️</span>
                <h3>Matriz Tática de Combate</h3>
                <span class="l2-section-tag">Status em Tempo Real</span>
              </div>
              <div id="char-tab-stats-summary" class="l2-combat-matrix-grid"></div>
            </div>

            <!-- 4. Subclasses & Certificações de Aden -->
            <div class="l2-char-section subclass-section">
              <div class="l2-section-header">
                <span class="l2-section-icon">📜</span>
                <h3>Subclasses &amp; Certificações de Aden</h3>
                <span id="subclass-count-badge" class="l2-section-tag">Lv. 75 Requerido</span>
              </div>
              <p class="l2-section-desc">Evolua até 3 subclasses nobres para desbloquear poderes de Certificação passivos permanentes para sua Classe Principal.</p>
              
              <div id="subclass-list-container" class="subclass-list-container" style="display:flex; flex-direction:column; gap:8px;"></div>
              
              <div style="display:flex; gap:8px; margin-top:10px;">
                <button id="add-subclass-btn" class="action-btn action-btn--primary" style="flex:1; font-size:11px;">➕ Adicionar Subclasse (Lv 75+)</button>
              </div>

              <!-- Certificações -->
              <div class="l2-certifications-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h4 style="margin:0 0 4px 0; font-size:12px; color:#f5df93; font-family:'Cinzel',serif;">✨ Certificações Passivas Adquiridas</h4>
                  <span id="cert-total-cp-badge" style="font-size:11px; font-weight:bold; color:#fde047;">+0 CP</span>
                </div>
                <div id="certifications-summary" style="font-size:11px; color:#94a3b8;">Nenhuma certificação aprendida ainda. Suba suas subclasses aos Lvs. 65, 70, 75 e 80!</div>
              </div>
            </div>

            <!-- Rodapé de Ações do Herói -->
            <div class="char-actions" style="margin-top: 20px;">
              <button id="save-btn" class="action-btn">💾 Salvar Progresso</button>
              <button id="start-btn" class="action-btn action-btn--primary">⚔️ Entrar na Caçada</button>
              <button id="reset-btn" class="action-btn action-btn--danger">⚠️ Reiniciar Herói</button>
            </div>
          </div>

          <!-- Skills Tab -->
          <div id="tab-skills" class="tab-pane">
            <div class="skills-head">
              <h3>Árvore de Habilidades &amp; Talentos</h3>
              <div style="display:flex; gap:10px; align-items:center;">
                <span class="sp-pill"><span class="sp-icon">✦</span> <span id="sp-available">0</span> SP Disponível</span>
                <button id="reset-sp-btn" class="inv-batch-btn" title="Redistribuir todos os pontos de habilidade investidos">🔄 Resetar SP</button>
              </div>
            </div>
            <!-- Passivas de Linhagem de Classes Passadas -->
            <div id="legacy-passives-container" style="display:none; background:rgba(0,0,0,0.4); border:1px solid rgba(212,175,55,0.25); border-radius:8px; padding:10px 14px; margin-bottom:10px;"></div>
            <div class="skills-body">
              <div class="skill-tree-scroll">
                <div class="skill-tree" id="skill-tree"></div>
              </div>
              <aside class="skill-info-panel" id="skill-info-panel"></aside>
            </div>
          </div>

          <!-- Authentic Lineage 2 Inventory & Equipment Window Tab -->
          <div id="tab-inventory" class="tab-pane">
            <!-- Window Header matching L2 frame -->
            <div class="l2inv-header-frame">
              <div class="l2inv-title-group">
                <span class="l2inv-window-icon">🎒</span>
                <span class="l2inv-window-title">Inventory</span>
                <span class="l2inv-counter" id="l2inv-counter">(<span id="inv-slots-count">0</span>/<span id="max-inv-slots">150</span>)</span>
              </div>
              <div class="l2inv-window-controls">
                <button class="l2inv-win-btn" title="Ajuda">?</button>
                <button class="l2inv-win-btn" title="Gênero">♂</button>
                <button class="l2inv-win-btn" title="Minimizar">_</button>
                <button class="l2inv-win-btn close" title="Fechar">✕</button>
              </div>
            </div>

            <!-- Two-panel layout -->
            <div class="l2inv-main-container">
              <!-- Left Panel: 3-column Paperdoll Equipment Grid + Stats -->
              <div class="l2inv-left-paperdoll">
                <!-- Dual Weapon Resonance HUD Bar & Orb -->
                <div class="dual-resonance-hud-container" id="dual-resonance-hud-container" style="display:flex; align-items:center; justify-content:center; gap:8px; padding:6px; margin-bottom:8px; background:rgba(15,23,42,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:6px;">
                  <div class="dual-resonance-orb" id="dual-resonance-orb" title="Ressonância Dupla: Equipe duas armas compatíveis para ativar sinergia!">
                    <div class="resonance-orb-core" id="resonance-orb-core">⚔️</div>
                  </div>
                  <div class="resonance-hud-info" style="flex:1; min-width:0;">
                    <div class="resonance-hud-title" id="resonance-hud-title" style="font-size:11px; font-weight:bold; color:var(--gilt); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Ressonância: Inativa</div>
                    <div class="resonance-hud-desc" id="resonance-hud-desc" style="font-size:10px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Equipe Arma 1 e Arma 2 para sinergia</div>
                  </div>
                </div>

                <div class="l2inv-paperdoll-grid">
                  <!-- Column 1 (Left - 7 slots) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="hair1" title="Acessório / Cabelo 1">
                      <span class="l2inv-pd-icon">👒</span>
                      <span class="l2inv-pd-item" id="pd-item-hair1"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="earring1" title="Brinco 1">
                      <span class="l2inv-pd-icon">💎</span>
                      <span class="l2inv-pd-item" id="pd-item-earring1"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="necklace" title="Colar">
                      <span class="l2inv-pd-icon">📿</span>
                      <span class="l2inv-pd-item" id="pd-item-necklace"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="weapon" title="Arma Principal">
                      <span class="l2inv-pd-icon">⚔️</span>
                      <span class="l2inv-pd-item" id="pd-item-weapon"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="ring1" title="Anel 1">
                      <span class="l2inv-pd-icon">💍</span>
                      <span class="l2inv-pd-item" id="pd-item-ring1"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="belt" title="Cinto">
                      <span class="l2inv-pd-icon">🪢</span>
                      <span class="l2inv-pd-item" id="pd-item-belt"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="brooch" title="Broche (Estojo de Joias)">
                      <span class="l2inv-pd-icon">❇️</span>
                      <span class="l2inv-pd-item" id="pd-item-brooch"></span>
                    </div>
                  </div>

                  <!-- Column 2 (Center - 6 slots) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="helmet" title="Capacete">
                      <span class="l2inv-pd-icon">⛑️</span>
                      <span class="l2inv-pd-item" id="pd-item-helmet"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="armor" title="Armadura / Peito">
                      <span class="l2inv-pd-icon">🛡️</span>
                      <span class="l2inv-pd-item" id="pd-item-armor"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="legs" title="Calças / Perneiras">
                      <span class="l2inv-pd-icon">👖</span>
                      <span class="l2inv-pd-item" id="pd-item-legs"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="gloves" title="Luvas">
                      <span class="l2inv-pd-icon">🧤</span>
                      <span class="l2inv-pd-item" id="pd-item-gloves"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="boots" title="Botas">
                      <span class="l2inv-pd-icon">👢</span>
                      <span class="l2inv-pd-item" id="pd-item-boots"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="agathion_bracelet" title="Bracelete de Agathion">
                      <span class="l2inv-pd-icon">🧚‍♂️</span>
                      <span class="l2inv-pd-item" id="pd-item-agathion_bracelet"></span>
                    </div>
                  </div>

                  <!-- Column 3 (Right - 6 slots) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="hair2" title="Acessório / Cabelo 2">
                      <span class="l2inv-pd-icon">🎭</span>
                      <span class="l2inv-pd-item" id="pd-item-hair2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="earring2" title="Brinco 2">
                      <span class="l2inv-pd-icon">💎</span>
                      <span class="l2inv-pd-item" id="pd-item-earring2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="cloak" title="Capa">
                      <span class="l2inv-pd-icon">🧥</span>
                      <span class="l2inv-pd-item" id="pd-item-cloak"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="shield" title="Escudo / Secundária">
                      <span class="l2inv-pd-icon">🛡️</span>
                      <span class="l2inv-pd-item" id="pd-item-shield"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="weapon2" title="Arma 2 (Dual Arsenal / Slot Secundário)">
                      <span class="l2inv-pd-icon">🗡️</span>
                      <span class="l2inv-pd-item" id="pd-item-weapon2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="ring2" title="Anel 2">
                      <span class="l2inv-pd-icon">💍</span>
                      <span class="l2inv-pd-item" id="pd-item-ring2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="talisman_bracelet" title="Bracelete de Talismã">
                      <span class="l2inv-pd-icon">🔮</span>
                      <span class="l2inv-pd-item" id="pd-item-talisman_bracelet"></span>
                    </div>
                  </div>
                </div>

                <!-- Paperdoll Stats Summary -->
                <div class="l2inv-stats-box">
                  <div class="l2inv-stat-row">
                    <span>P.Atk: <strong id="l2stat-atk">0</strong></span>
                    <span>P.Def: <strong id="l2stat-def">0</strong></span>
                  </div>
                  <div class="l2inv-stat-row">
                    <span>M.Atk: <strong id="l2stat-matk">0</strong></span>
                    <span>M.Def: <strong id="l2stat-mdef">0</strong></span>
                  </div>
                  <div class="l2inv-stat-row">
                    <span>Crit: <strong id="l2stat-crit">0%</strong></span>
                    <span>Speed: <strong id="l2stat-speed">0</strong></span>
                  </div>
                  <button class="l2inv-unequip-all" id="unequip-all-btn" title="Desequipar todos os itens">Desequipar Tudo</button>
                </div>

                <!-- Primary Attributes Section (STR/DEX/CON/INT/WIT/MEN) -->
                <div class="l2inv-primary-box" id="l2inv-primary-box" style="margin-top:6px; padding:6px 8px; background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:4px;">
                  <div style="font-size:10px; font-weight:bold; color:var(--gilt-bright); text-transform:uppercase; margin-bottom:4px; letter-spacing:0.5px;">Atributos Primários</div>
                  <div class="l2inv-stat-row" style="font-size:10px;">
                    <span>STR: <strong id="l2stat-str" style="color:#10b981;">0</strong></span>
                    <span>DEX: <strong id="l2stat-dex" style="color:#10b981;">0</strong></span>
                    <span>CON: <strong id="l2stat-con" style="color:#10b981;">0</strong></span>
                  </div>
                  <div class="l2inv-stat-row" style="font-size:10px; margin-top:2px;">
                    <span>INT: <strong id="l2stat-int" style="color:#3b82f6;">0</strong></span>
                    <span>WIT: <strong id="l2stat-wit" style="color:#3b82f6;">0</strong></span>
                    <span>MEN: <strong id="l2stat-men" style="color:#3b82f6;">0</strong></span>
                  </div>
                </div>
              </div>

              <!-- Right Panel: Items Grid and Tabs -->
              <div class="l2inv-right-grid-area">
                <!-- L2 Metallic Filter Tabs -->
                <!-- L2 Metallic Filter Tabs (4 Abas Nobres) -->
                <div class="l2inv-tabs-header">
                  <button class="l2inv-tab-btn filter-btn active" data-filter="all">✨ Todos</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="gear">⚔️ Equipamentos</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="consumable">🧪 Consumíveis</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="material">💎 Materiais</button>
                </div>

                <!-- Subbar Reestruturada em 2 Linhas Elegantes sem Sobreposição -->
                <div class="l2inv-subbar" style="display:flex; flex-direction:column; gap:6px; padding:8px; background:rgba(10,12,18,0.95); border:1px solid rgba(212,167,68,0.25); border-radius:6px; margin-bottom:8px;">
                  <!-- Linha 1: Busca em Destaque + Auto-Venda + Filtro AFK -->
                  <div style="display:flex; align-items:center; gap:8px; width:100%;">
                    <div style="flex:1; position:relative;">
                      <label for="inv-search-input" class="sr-only" style="display:none;">Buscar no inventário</label>
                      <input type="text" id="inv-search-input" name="invSearch" aria-label="Filtrar inventário por nome de item" placeholder="🔍 Buscar no inventário..." style="width:100%; background:#090c12; color:#ece4d3; border:1px solid rgba(212,167,68,0.4); border-radius:4px; padding:5px 8px; font-size:11px; box-sizing:border-box;" title="Filtrar por nome de item" />
                    </div>
                    <div style="display:flex; align-items:center; gap:4px; font-size:10px; color:#fde047; flex-shrink:0;">
                      <label for="auto-sell-rarity-select" style="font-weight:600; cursor:pointer;">Auto-Venda:</label>
                      <select id="auto-sell-rarity-select" name="autoSellRarity" aria-label="Filtro de Auto-Venda por Raridade" style="background:#090b10; color:#fff; border:1px solid rgba(212,167,68,0.3); border-radius:4px; padding:3px 6px; font-size:10px; cursor:pointer;">
                        <option value="off">OFF</option>
                        <option value="common">≤ Comum</option>
                        <option value="uncommon">≤ Incomum</option>
                        <option value="rare">≤ Raro</option>
                      </select>
                    </div>
                    <button id="open-auto-recycle-btn" class="l2inv-pill-btn" style="background:rgba(212,167,68,0.2); border-color:#fde047; color:#fef08a; font-weight:bold; flex-shrink:0; padding:4px 8px;" title="Configurar Filtro de Loot AFK & Auto-Recycle">⚙️ Filtro AFK</button>
                  </div>

                  <!-- Linha 2: Raridades + Seleção em Massa -->
                  <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap;">
                    <div class="l2inv-rarity-pills" style="display:flex; gap:3px;">
                      <button class="rarity-filter-btn active" data-rarity="all">Todos</button>
                      <button class="rarity-filter-btn r-common" data-rarity="common">C</button>
                      <button class="rarity-filter-btn r-uncommon" data-rarity="uncommon">I</button>
                      <button class="rarity-filter-btn r-rare" data-rarity="rare">R</button>
                      <button class="rarity-filter-btn r-epic" data-rarity="epic">É</button>
                      <button class="rarity-filter-btn r-legendary" data-rarity="legendary">L</button>
                    </div>
                    <div class="l2inv-batch-pills" style="display:flex; gap:3px;">
                      <button id="select-commons-btn" class="l2inv-pill-btn" title="Selecionar comuns">✓ Comum</button>
                      <button id="select-uncommons-btn" class="l2inv-pill-btn" title="Selecionar incomuns">✓ Incomum</button>
                      <button id="select-all-btn" class="l2inv-pill-btn" title="Selecionar todos">✓ Todos</button>
                      <button id="clear-selection-btn" class="l2inv-pill-btn" title="Limpar seleções">✕</button>
                    </div>
                  </div>

                  <!-- Linha 3: Filtro por Grau (NG, D, C, B, A, S) -->
                  <div class="l2inv-grade-pills" style="display:flex; align-items:center; gap:3px; padding-top:2px; border-top:1px solid rgba(212,167,68,0.15); flex-wrap:wrap;">
                    <span style="font-size:10px; color:var(--gilt); font-weight:600; margin-right:4px;">Grau:</span>
                    <button class="grade-filter-btn active" data-grade="all" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#1e293b; color:#cbd5e1; border:1px solid rgba(212,167,68,0.3);">Todos</button>
                    <button class="grade-filter-btn" data-grade="ng" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#94a3b8; border:1px solid rgba(148,163,184,0.3);">NG</button>
                    <button class="grade-filter-btn" data-grade="d" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#38bdf8; border:1px solid rgba(56,189,248,0.3);">D</button>
                    <button class="grade-filter-btn" data-grade="c" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#4ade80; border:1px solid rgba(74,222,128,0.3);">C</button>
                    <button class="grade-filter-btn" data-grade="b" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#f87171; border:1px solid rgba(248,113,113,0.3);">B</button>
                    <button class="grade-filter-btn" data-grade="a" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#e2e8f0; border:1px solid rgba(226,232,240,0.4);">A</button>
                    <button class="grade-filter-btn" data-grade="s" style="padding:2px 7px; font-size:10px; border-radius:3px; cursor:pointer; background:#0f172a; color:#facc15; border:1px solid rgba(250,204,21,0.5); font-weight:bold;">S</button>
                  </div>
                </div>

                <!-- Item Slots Grid (8 columns x 7 rows dark reddish-brown slots) -->
                <div class="l2inv-slots-grid" id="inventory-grid"></div>

                <div class="l2inv-trash-actions" style="display:flex; gap:6px; flex-wrap:wrap;">
                  <button id="sell-selected-btn" class="l2inv-trash-btn sell" disabled title="Vender Itens Selecionados">💰 Vender</button>
                  <button id="salvage-selected-btn" class="l2inv-trash-btn salvage" disabled title="Desmontar Selecionados">🔨 Desmontar</button>
                  <button id="crystallize-selected-btn" class="l2inv-trash-btn crystallize" style="background:linear-gradient(135deg, #1e3a8a, #2563eb); border:1px solid #60a5fa; color:#fff; border-radius:4px; padding:4px 10px; font-size:11px; cursor:pointer; font-weight:600;" title="Cristalizar Equipamentos Selecionados de Grau D a S">💎 Cristalizar Lote</button>
                </div>
              </div>
            </div>

            <!-- Bottom Bar matching L2 UI -->
            <div class="l2inv-bottom-bar">
              <div class="l2inv-bottom-left-actions">
                <button class="l2inv-icon-btn" id="nav-craft-btn" title="Abrir Forja / Crafting">⚒️</button>
                <button class="l2inv-icon-btn" id="auto-equip-btn" title="Equipar Melhores Itens">⚡</button>
                <button class="l2inv-icon-btn" id="organize-inv-btn" title="Organizar Mochila (Fundir Pilhas e Ordenar)">🧹</button>
                <button class="l2inv-icon-btn" id="open-compound-btn" onclick="window.openCompoundModal()" title="🔮 Síntese &amp; Fusão de Joias e Talismãs" style="color:#c084fc;">🔮</button>
                <button class="l2inv-icon-btn" id="open-symbol-maker-btn" onclick="window.openSymbolMakerModal()" title="🎭 Gravador de Símbolos &amp; Tatuagens de Henna" style="color:#fde047;">🎭</button>
                <button class="l2inv-icon-btn" id="open-pet-btn" onclick="window.openPetModal()" title="🐾 Companheiros &amp; Mascotes de Batalha" style="color:#6ee7b7;">🐾</button>
                <button class="l2inv-icon-btn" id="open-manor-btn" onclick="window.openManorModal()" title="🌾 Administrador de Manor &amp; Colheita Agrícola" style="color:#86efac;">🌾</button>
              </div>

              <div class="l2inv-bottom-right-info">
                <div class="l2inv-gold-counter">
                  <span class="l2inv-gold-icon">🪙</span>
                  <span class="l2inv-gold-val" id="gold-text">0</span>
                </div>
                <div class="l2inv-weight-gauge" title="Capacidade da Mochila">
                  <span class="l2inv-weight-icon">🎒</span>
                  <span id="inv-slots">0/150</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Shop Tab -->
          <div id="tab-shop" class="tab-pane">
            <div class="shop-head">
              <div>
                <h3 style="margin:0; font-family:'Cinzel',serif; color:var(--gilt-bright);">Guilda dos Mercadores de Aden</h3>
                <p style="margin:2px 0 0 0; font-size:11px; color:var(--text-muted);">Comércio imperial de equipamentos, consumíveis, tomos arcanos e relíquias místicas</p>
              </div>
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                <span class="shop-gold-pill">🪙 <span id="shop-gold">0</span> Adena</span>
                <span id="mystic-shop-timer" class="mystic-timer-pill" style="display:none;">⏳ Restoque Místico: <strong id="mystic-timer-countdown">03:00:00</strong></span>
              </div>
            </div>

            <!-- Subtabs: Main Category Tabs -->
            <div class="shop-subtabs">
              <button class="shop-subtab active" data-shoptab="gear">⚔️ Armaria Imperial</button>
              <button class="shop-subtab" data-shoptab="potions">🧪 Mercearia &amp; Shots</button>
              <button class="shop-subtab" data-shoptab="spellbooks">📜 Livraria Arcana</button>
              <button class="shop-subtab" data-shoptab="mystic">🌟 Empório Místico</button>
              <button class="shop-subtab" data-shoptab="currencies">💎 Câmbio de Moedas</button>
              <button class="shop-subtab" data-shoptab="sell" style="border-color:rgba(239,68,68,0.4); color:#fca5a5;">💰 Venda &amp; Recompra</button>
            </div>

            <!-- Search & Filters Bar -->
            <div class="shop-filter-bar" id="shop-filter-bar" style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
              <!-- Global Real-Time Search Bar -->
              <div style="display:flex; gap:8px; align-items:center; width:100%;">
                <input type="text" id="shop-search-input" placeholder="🔍 Buscar por nome (ex: Bow, Potion, Soulshot, Zubei, Spellbook)..." style="flex:1; min-width:200px; padding:8px 14px; border-radius:6px; border:1px solid rgba(212,175,55,0.3); background:rgba(0,0,0,0.6); color:#fff; font-size:13px;" />
                <button id="shop-clear-search-btn" class="inv-batch-btn" style="display:none; padding:7px 12px;">✕ Limpar</button>
              </div>

              <!-- Grade Filter Row -->
              <div class="filter-row" id="shop-grade-filter-row">
                <span class="filter-label">Nível / Grau:</span>
                <div class="filter-group" id="shop-grade-filters">
                  <button class="shop-filter-btn active" data-shopgrade="all">Todos</button>
                  <button class="shop-filter-btn grade-btn-ng" data-shopgrade="ng">No-Grade (1-19)</button>
                  <button class="shop-filter-btn grade-btn-d" data-shopgrade="d">D-Grade (20-39)</button>
                  <button class="shop-filter-btn grade-btn-c" data-shopgrade="c">C-Grade (40-51)</button>
                  <button class="shop-filter-btn grade-btn-b" data-shopgrade="b">B-Grade (52-60)</button>
                  <button class="shop-filter-btn grade-btn-a" data-shopgrade="a">A-Grade (61-75)</button>
                  <button class="shop-filter-btn grade-btn-s" data-shopgrade="s">S-Grade (76+)</button>
                </div>
              </div>

              <!-- Slot Filter Row -->
              <div class="filter-row" id="shop-slot-filter-row">
                <span class="filter-label">Tipo de Item:</span>
                <div class="filter-group" id="shop-slot-filters">
                  <button class="shop-filter-btn active" data-shopslot="all">Todos os Tipos</button>
                  <button class="shop-filter-btn" data-shopslot="weapon">⚔️ Armas Físicas</button>
                  <button class="shop-filter-btn" data-shopslot="mweapon">🔮 Armas Mágicas</button>
                  <button class="shop-filter-btn" data-shopslot="heavy">🛡️ Pesada</button>
                  <button class="shop-filter-btn" data-shopslot="light">🥋 Leve</button>
                  <button class="shop-filter-btn" data-shopslot="robe">👘 Robe Mágico</button>
                  <button class="shop-filter-btn" data-shopslot="helmet">🪖 Capacetes</button>
                  <button class="shop-filter-btn" data-shopslot="gloves">🥊 Luvas</button>
                  <button class="shop-filter-btn" data-shopslot="boots">🥾 Botas</button>
                  <button class="shop-filter-btn" data-shopslot="legs">👖 Calças</button>
                  <button class="shop-filter-btn" data-shopslot="shield">🛡️ Escudos</button>
                  <button class="shop-filter-btn" data-shopslot="jewel">📿 Joias &amp; Acessórios</button>
                </div>
              </div>

              <!-- Batch Quantity Row for Potions & Consumables -->
              <div class="filter-row" id="shop-batch-row" style="display:none;">
                <span class="filter-label">Quantidade:</span>
                <div class="filter-group" id="shop-batch-filters" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                  <button class="shop-filter-btn active" data-shopqty="1">1x</button>
                  <button class="shop-filter-btn" data-shopqty="10">10x</button>
                  <button class="shop-filter-btn" data-shopqty="100">100x</button>
                  <button class="shop-filter-btn" data-shopqty="1000">1000x</button>
                  <button class="shop-filter-btn" data-shopqty="5000">5000x</button>
                </div>
              </div>
            </div>

            <!-- Merchant Content List Container -->
            <div class="shop-list" id="shop-list"></div>
          </div>

          <!-- Market Tab (Mercado de Giran) -->
          <div id="tab-market" class="tab-pane"></div>

          <!-- Craft Tab -->
          <div id="tab-craft" class="tab-pane">
            <div class="craft-head" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px; background:radial-gradient(circle at 50% 0%, #1c2333 0%, #0c0f16 100%); border:1px solid #5a4625; border-radius:10px; padding:14px 16px; box-shadow:inset 0 1px 0 rgba(255,215,0,0.15), 0 4px 16px rgba(0,0,0,0.6);">
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:22px;">⚒️</span>
                  <h3 style="margin:0; font-family:'Cinzel',serif; font-size:17px; font-weight:800; color:#f5df93; letter-spacing:0.06em;">Bigorna Imperial de Aden</h3>
                </div>
                <p style="margin:4px 0 0 0; font-size:11px; color:#94a3b8;">Oficina Ancestral de Armamentos, Aprimoramento de Almas e Engastes Místicos.</p>
              </div>
              <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <div class="stat-value" style="font-size:12px; font-family:'Cinzel',serif; background:rgba(18,24,36,0.9); border:1px solid #8a6d3b; padding:6px 14px; border-radius:6px; box-shadow:inset 0 1px 0 rgba(255,255,255,0.06);">
                  🔨 Forja: <strong id="craft-level" style="color:#ffd877;">1</strong>
                  <div style="width:110px; height:5px; background:rgba(0,0,0,0.6); border-radius:3px; margin-top:4px; overflow:hidden; border:1px solid rgba(212,167,68,0.3);">
                    <div id="craft-forge-exp-bar" style="height:100%; width:0%; background:linear-gradient(90deg, #d4a744, #10b981); transition:width 0.3s;"></div>
                  </div>
                </div>
                <button onclick="window.openMarketTab ? window.openMarketTab() : (window.openPanel && window.openPanel('market'))" style="font-size:11px; font-weight:bold; padding:7px 14px; border-radius:6px; background:linear-gradient(180deg, #261f10 0%, #141008 100%); border:1px solid #d4a744; color:#fde047; cursor:pointer; font-family:'Cinzel',serif; display:flex; align-items:center; gap:6px; box-shadow:0 0 10px rgba(212,167,68,0.25);">
                  🏛️ Mercado P2P ➔
                </button>
              </div>

              <div style="display:flex; gap:5px; flex-wrap:wrap; margin-top:10px; width:100%; border-top:1px solid rgba(212,167,68,0.2); padding-top:10px;" id="forge-subtab-buttons">
                <button onclick="window.setForgeSubTab('craft')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="craft" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">⚒️ Criação Geral</button>
                <button onclick="window.setForgeSubTab('soulcrystal')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="soulcrystal" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">🔮 Soul Crystals (SA)</button>
                <button onclick="window.setForgeSubTab('masterwork')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="masterwork" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">✨ Pushkin MW</button>
                <button onclick="window.setForgeSubTab('tattoos')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="tattoos" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">🖊️ Tatuagens &amp; Dyes</button>
                <button onclick="window.setForgeSubTab('elemental')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="elemental" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">🔥 Atributos Elementais</button>
                <button onclick="window.setForgeSubTab('belts')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="belts" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">🎗️ Síntese de Cintos</button>
                <button onclick="window.setForgeSubTab('lifestones')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="lifestones" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px;">💎 Life Stones</button>
                <button onclick="window.setForgeSubTab('randomcraft')" class="inv-batch-btn forge-subtab-btn" data-forge-tab="randomcraft" style="font-family:'Cinzel',serif; font-weight:700; font-size:11px; color:#e9d5ff;">🎲 Random Craft</button>
              </div>
            </div>

            <div class="craft-filters-bar" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; align-items:center;">
              <input type="text" id="craft-search-input" placeholder="🔍 Buscar receita por nome ou grau..." style="flex:1; min-width:200px; padding:7px 12px; border-radius:6px; border:1px solid rgba(212,167,68,0.35); background:#0c0f16; color:#ece4d3; font-size:12px; font-family:'Cinzel',serif;" />
              <div style="display:flex; gap:5px; flex-wrap:wrap;" id="craft-category-filters">
                <button class="inv-batch-btn active" data-craft-cat="all">🌟 Todos</button>
                <button class="inv-batch-btn" data-craft-cat="weapon">⚔ Armas</button>
                <button class="inv-batch-btn" data-craft-cat="armor">🛡 Armaduras</button>
                <button class="inv-batch-btn" data-craft-cat="jewel">💍 Joias</button>
                <button class="inv-batch-btn" data-craft-cat="relic">🧚 Agathions</button>
                <button class="inv-batch-btn" data-craft-cat="consumable">🧪 Consumíveis</button>
              </div>
            </div>

            <div id="craft-subcategory-filters" style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:12px; padding:6px 10px; background:rgba(12,15,22,0.85); border-radius:6px; border:1px solid rgba(212,167,68,0.15);"></div>

            <div id="craft-recipes-view" class="craft-view active">
              <div class="craft-list" id="craft-list"></div>
            </div>
          </div>

          <!-- Alchemy Tab -->
          <div id="tab-alchemy" class="tab-pane"></div>

          <!-- Astral Mastery Tab -->
          <div id="tab-astral" class="tab-pane"></div>

          <!-- Expeditions & Manor Tab -->
          <div id="tab-expeditions" class="tab-pane"></div>

          <!-- Raids & Bosses Tab -->
          <div id="tab-raids" class="tab-pane"></div>

          <!-- Grand Olympiad & Heroes Tab -->
          <div id="tab-olympiad" class="tab-pane"></div>

          <!-- Clan, Castles & Siege Tab -->
          <div id="tab-clan" class="tab-pane"></div>

          <!-- Seven Signs Tab -->
          <div id="tab-sevensigns" class="tab-pane"></div>

          <!-- Fortresses & Talismans Tab -->
          <div id="tab-fortress" class="tab-pane"></div>

          <!-- Colosseum & Duels Tab -->
          <div id="tab-colosseum" class="tab-pane"></div>

          <!-- Global Rankings & Leaderboards Tab -->
          <div id="tab-rankings" class="tab-pane"></div>

          <!-- Dedicated Enchantment Tab -->
          <div id="tab-enchant" class="tab-pane">
            <div class="craft-head">
              <h3>Oficina de Encantamento (+1 a +16)</h3>
              <p class="stat-value">Reforço com Pergaminhos Ancestrais</p>
            </div>
            <p class="shop-info">Encante seus equipamentos usando Pergaminhos de Encantamento (+10% de atributos adicionais por nível de encantamento).</p>
            <div class="enchant-workspace" id="enchant-workspace-dedicated"></div>
          </div>

          <!-- Zones & Raids Tab -->
          <div id="tab-zones" class="tab-pane active">
            <div class="zone-head-tabs" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <div style="display:flex; gap:6px;">
                <button class="zone-subtab active" data-zonetab="map">🗺️ Zonas de Caça</button>
                <button class="zone-subtab" data-zonetab="raids">🐉 Raids de Chefões Epicos</button>
              </div>
              <button class="action-btn" onclick="window.openInstancesModal()" style="padding:4px 10px; font-size:11px; background:linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border:1px solid #818cf8; color:#e0e7ff; font-weight:bold;">🌀 Instâncias Solo (Kamaloka &amp; Pailaka)</button>
            </div>

            <div id="zone-map-view" class="zone-view active">
              <div class="zone-list" id="zone-list"></div>
              <div class="zone-info-card" id="zone-info-card"></div>
            </div>

            <div id="zone-raids-view" class="zone-view">
              <p class="shop-info">Desafie Chefões Épicos de Aden para obter recompensas e itens lendários!</p>
              <div class="raid-boss-list" id="raid-boss-list"></div>
            </div>
          </div>

          <!-- Codex Tab -->
          <div id="tab-codex" class="tab-pane">
            <div class="codex-header">
              <h3>📜 Codex de Coleções de Aden</h3>
              <p class="shop-info">Registre e destrua itens específicos para desbloquear bônus de atributos permanentes em sua conta!</p>
              <div class="codex-summary" id="codex-summary"></div>
            </div>
            <div class="codex-grid" id="codex-grid"></div>
          </div>

          <!-- Dolls Tab -->
          <div id="tab-dolls" class="tab-pane">
            <div class="dolls-header">
              <h3>🧸 Coleção &amp; Síntese de Boss Dolls</h3>
              <p class="shop-info">Mantenha Bonecos de Chefões em sua coleção para obter grandes bônus. Combine 2 Dolls idênticas do mesmo nível para tentar elevar seu nível!</p>
              <div class="dolls-summary" id="dolls-summary"></div>
            </div>
            <div class="dolls-synthesis-box">
              <h4>🔮 Altar de Síntese de Dolls</h4>
              <div class="synthesis-slots" style="display: flex; gap: 12px; align-items: center; justify-content: center; margin: 12px 0;">
                <div class="synth-slot" id="synth-slot-1" style="border: 2px dashed var(--border-gilt); padding: 12px; border-radius: 8px; min-width: 140px; text-align: center; background: rgba(0,0,0,0.3);">Doll Base</div>
                <span class="synth-plus" style="font-size: 20px; color: var(--gilt-bright);">+</span>
                <div class="synth-slot" id="synth-slot-2" style="border: 2px dashed var(--border-gilt); padding: 12px; border-radius: 8px; min-width: 140px; text-align: center; background: rgba(0,0,0,0.3);">Doll Material</div>
              </div>
              <button class="action-btn action-btn--primary" id="start-doll-synth-btn">Combinar &amp; Sintetizar ✨</button>
            </div>
            <div class="dolls-grid" id="dolls-grid" style="margin-top: 16px;"></div>
            <div id="dolls-encyclopedia" style="margin-top: 20px;"></div>
          </div>

          <!-- Magic Lamp & Special Craft Tab -->
          <div id="tab-magiclamp" class="tab-pane">
            <div class="lamp-box">
              <h3>🪔 Lâmpada Mágica &amp; Cartas de EXP</h3>
              <p class="shop-info">Ao derrotar monstros, a barra da Lâmpada Mágica acumula experiência. Use lâmpadas para sortear cartas mágicas e receber EXP &amp; SP massivos!</p>
              <div class="lamp-gauge-container" style="margin: 12px 0;">
                <div class="lamp-progress-bar" id="lamp-progress-bar" style="height: 10px; background: linear-gradient(90deg, #3b82f6, #8b5cf6); width: 0%; border-radius: 5px; transition: width 0.3s;"></div>
                <span class="lamp-count-label" id="lamp-count-label" style="display: block; font-weight: bold; margin-top: 6px; color: var(--gilt-bright);">0 Lâmpadas Mágicas Disponíveis</span>
              </div>
              <button class="action-btn action-btn--primary" id="use-magic-lamp-btn">Sortear Carta Mágica 🪔</button>
              <div class="lamp-result-card" id="lamp-result-card" style="margin-top: 12px;"></div>
            </div>

            <hr style="border-color: var(--border-gilt); margin: 20px 0;" />

            <div class="craft-box">
              <h3>🛠️ Random Craft &amp; Special Craft</h3>
              <div class="craft-gauge-container" style="margin: 12px 0;">
                <div class="craft-progress-bar" id="craft-progress-bar" style="height: 10px; background: linear-gradient(90deg, #10b981, #f59e0b); width: 0%; border-radius: 5px; transition: width 0.3s;"></div>
                <span class="craft-count-label" id="craft-count-label" style="display: block; font-weight: bold; margin-top: 6px; color: var(--gilt-bright);">0 Pontos / Cargas de Craft</span>
              </div>

              <!-- Random Craft Section -->
              <div class="random-craft-section">
                <h4>🎰 Roleta Random Craft (5 Slot Wheel)</h4>
                <div class="random-wheel-slots" id="random-wheel-slots" style="display: flex; gap: 8px; margin: 12px 0; overflow-x: auto;"></div>
                <div class="random-craft-actions" style="display: flex; gap: 10px;">
                  <button class="action-btn" id="refresh-random-craft-btn">Recarregar Roleta 🔄</button>
                  <button class="action-btn action-btn--primary" id="spin-random-craft-btn">Crafting! (1 Carga) ⚡</button>
                </div>
              </div>

              <!-- Special Craft Section -->
              <div class="special-craft-section" style="margin-top: 20px;">
                <h4>✨ Special Crafting Recipes</h4>
                <div class="special-craft-grid" id="special-craft-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 10px;"></div>
              </div>
            </div>
          </div>

          <!-- Quests & Battle Pass Tab -->
          <div id="tab-quests" class="tab-pane">
            <div class="quests-header-frame">
              <div class="quests-title-group">
                <span class="quests-window-icon">🎯</span>
                <span class="quests-window-title">Quadro de Missões &amp; Passe de Adena</span>
              </div>
              <div class="quests-reset-info">
                <span id="daily-quest-timer" class="reset-badge">⏰ Renovação Diária</span>
              </div>
            </div>

            <!-- Battle Pass Banner & XP Bar -->
            <div class="pass-banner-container">
              <div class="pass-header-info">
                <div class="pass-level-badge">
                  <span class="pass-lvl-num" id="pass-level-text">Nível 1</span>
                  <span class="pass-title" id="pass-status-text">Passe de Batalha Grátis</span>
                </div>
                <div class="pass-xp-info">
                  <span id="pass-xp-text">0 / 100 XP do Passe</span>
                  <button id="unlock-premium-pass-btn" class="inv-batch-btn gold-glow-btn" title="Adquirir o Passe Premium Oficial da Temporada">👑 Obter Passe Premium (R$ 15,00)</button>
                </div>
              </div>
              <div class="bar-container pass-bar-container">
                <div id="pass-xp-bar" class="bar xp" style="width:0%"></div>
              </div>
            </div>

            <!-- Battle Pass Rewards Track -->
            <div class="pane-section" style="margin-top: 10px;">
              <h3>🎟️ Trilha de Recompensas da Temporada</h3>
              <div id="pass-track-list" class="pass-track-list"></div>
            </div>

            <!-- Daily Quests Section -->
            <div class="pane-section">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>📜 Missões Diárias (Renovação a cada 24h)</h3>
                <span id="daily-progress-badge" class="sp-pill" style="font-size:11px;">0/4 Concluídas</span>
              </div>
              <div id="daily-quests-list" class="quests-list" style="margin-top:10px;"></div>
            </div>

            <!-- Weekly Quests Section -->
            <div class="pane-section">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>📅 Missões Semanais (Renovação às Segundas)</h3>
                <span id="weekly-progress-badge" class="sp-pill" style="font-size:11px;">0/3 Concluídas</span>
              </div>
              <div id="weekly-quests-list" class="quests-list" style="margin-top:10px;"></div>
            </div>
          </div>

          <!-- Tower of Insolence Tab -->
          <div id="tab-tower" class="tab-pane">
            <div class="tower-header-frame">
              <div class="tower-title-group">
                <span class="tower-window-icon">🏰</span>
                <span class="tower-window-title">Torre da Insolência (Tower of Insolence)</span>
              </div>
              <div class="tower-reset-info">
                <button id="tower-sweep-btn" class="inv-batch-btn gold-glow-btn" title="Reclamar 50% de todas as recompensas dos andares conquistados">🧹 Varredura Diária</button>
              </div>
            </div>

            <!-- Tower Stats & Passive Bonus Banner -->
            <div class="tower-banner-container">
              <div class="tower-header-info">
                <div class="tower-level-badge">
                  <span class="tower-lvl-num" id="tower-highest-floor-text">Andar Atual: 0 / 100</span>
                  <span class="tower-title" id="tower-bonus-text">Bônus Passivo: +0% ATK, DEF &amp; MATK</span>
                </div>
                <div class="tower-action-group">
                  <button id="tower-challenge-btn" class="action-btn action-btn--primary" style="font-size:12px; font-weight:bold;">⚔️ Desafiar Andar <span id="tower-next-floor-num">1</span></button>
                </div>
              </div>
            </div>

            <!-- Current Floor Challenge Preview Card -->
            <div class="pane-section">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>🗡️ Detalhes do Próximo Desafio</h3>
                <span id="tower-floor-recommend" class="sp-pill" style="font-size:11px;">Lv. Requerido: 10</span>
              </div>
              <div id="tower-floor-details-card" class="tower-details-card" style="margin-top:10px;"></div>
            </div>

            <!-- Floors Map Grid (1 to 100) -->
            <div class="pane-section" style="margin-top: 10px;">
              <h3>🏰 Progresso da Escalada (1 a 100 Andares)</h3>
              <div id="tower-floors-grid" class="tower-floors-grid" style="margin-top:10px;"></div>
            </div>
          </div>

          <!-- Warehouse Tab Pane (50/50 Split View: Mochila ↔ Baú) -->
          <div id="tab-warehouse" class="tab-pane">
            <div class="warehouse-split-view" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; max-width: 1200px; margin: 0 auto;">
              <!-- Left Side: Inventory (Mochila) -->
              <div class="wh-side-panel" style="background: rgba(18, 22, 32, 0.95); border: 1px solid rgba(212,167,68,0.4); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(212,167,68,0.25);">
                  <div>
                    <h4 style="margin: 0; color: var(--gilt-bright); font-size: 14px; font-weight: bold;">🎒 Mochila (Inventário)</h4>
                    <span id="wh-inv-count" style="font-size: 11px; color: var(--text-muted);">0/150 slots</span>
                  </div>
                  <button id="deposit-all-btn" class="action-btn action-btn--primary" style="font-size: 11px; padding: 4px 12px; font-weight: bold;" onclick="depositAllToWarehouse()">📥 Guardar Tudo</button>
                </div>
                <div id="wh-inventory-grid" class="l2inv-slots-grid" style="flex: 1; max-height: 480px; min-height: 320px; overflow-y: auto;"></div>
              </div>

              <!-- Right Side: Warehouse (Baú) -->
              <div class="wh-side-panel" style="background: rgba(18, 22, 32, 0.95); border: 1px solid rgba(212,167,68,0.4); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(212,167,68,0.25);">
                  <div>
                    <h4 style="margin: 0; color: var(--gilt-bright); font-size: 14px; font-weight: bold;">📦 Baú do Personagem</h4>
                    <span id="wh-storage-count" style="font-size: 11px; color: var(--text-muted);">0/100 slots</span>
                  </div>
                  <button id="withdraw-all-btn" class="action-btn action-btn--primary" style="font-size: 11px; padding: 4px 12px; font-weight: bold;" onclick="withdrawAllFromWarehouse()">📤 Retirar Tudo</button>
                </div>
                <div id="wh-storage-grid" class="l2inv-slots-grid" style="flex: 1; max-height: 480px; min-height: 320px; overflow-y: auto;"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>

    <!-- Death Modal -->
    <div id="death-modal" class="modal">
      <div class="modal-content">
        <h2>Você foi derrotado em combate!</h2>
        <p id="death-penalty">Você perderá <span id="xp-loss">0</span> XP.</p>
        <div class="modal-actions">
          <button id="res-free" class="action-btn">Ressuscitar (Grátis, -20% XP)</button>
          <button id="res-scroll" class="action-btn">Usar Pergaminho (-10% XP)</button>
        </div>
      </div>
    </div>

    <!-- Saga Unlock Modal -->
    <div id="saga-modal" class="modal">
      <div class="modal-content">
        <h2 id="saga-title">Nova Saga Desbloqueada!</h2>
        <p id="saga-desc">Novas áreas e perigos aguardam.</p>
        <button id="saga-ok" class="action-btn">Continuar</button>
      </div>
    </div>

    <!-- Offline Progress Modal -->
    <div id="offline-modal" class="modal">
      <div class="modal-content">
        <h2 id="offline-title">⌛ Bem-vindo de Volta!</h2>
        <p id="offline-desc">Enquanto esteve ausente, seu herói continuou o treinamento em Aden.</p>
        <div id="offline-rewards" style="margin: 14px 0; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--gilt-bright);"></div>
        <button id="offline-ok" class="action-btn action-btn--primary" onclick="window.closeOfflineModal && window.closeOfflineModal()">Coletar Recompensas ⚔️</button>
      </div>
    </div>

    <!-- Daily Check-in Rewards Modal (28 Days) -->
    <div id="daily-reward-modal" class="modal">
      <div class="modal-content" style="max-width:720px; width:95%; max-height:90vh; overflow-y:auto; background:linear-gradient(180deg, #181410 0%, #0d0a08 100%); border:2px solid rgba(212, 167, 68, 0.4); box-shadow:0 10px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,167,68,0.15); border-radius:12px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; border-bottom:1px solid rgba(212,167,68,0.2); padding-bottom:10px;">
          <div>
            <h2 style="margin:0; font-family:'Cinzel',serif; color:#fef08a; font-size:20px; display:flex; align-items:center; gap:8px;">
              🎁 Calendário de Presença — Recompensas Diárias
            </h2>
            <p style="margin:4px 0 0 0; font-size:12px; color:#d1d5db;">Faça login todos os dias para desbloquear pergaminhos, itens de boss e fortunas de Aden!</p>
          </div>
          <button id="close-daily-reward-btn" style="background:transparent; border:none; color:#9ca3af; font-size:20px; cursor:pointer; padding:0 6px;" onclick="window.closeDailyRewardModal && window.closeDailyRewardModal()">✕</button>
        </div>

        <!-- Streak & Milestone Info Bar -->
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:10px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">🔥</span>
            <div>
              <div style="font-size:11px; color:#9ca3af; text-transform:uppercase; font-weight:bold;">Sequência Consecutiva</div>
              <div id="daily-streak-text" style="font-size:14px; font-weight:bold; color:#f59e0b;">1 Dia de Glória</div>
            </div>
          </div>
          <div id="daily-status-badge" style="font-size:12px; font-weight:bold; padding:4px 12px; border-radius:12px; background:rgba(34,197,94,0.2); border:1px solid rgba(34,197,94,0.5); color:#4ade80;">
            ✨ Recompensa de Hoje Disponível!
          </div>
        </div>

        <!-- 28-Day Grid -->
        <div id="daily-rewards-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(85px, 1fr)); gap:8px; margin-bottom:16px;">
          <!-- Rendered dynamically -->
        </div>

        <!-- Modal Footer Actions -->
        <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid rgba(212,167,68,0.2); padding-top:14px;">
          <button id="daily-claim-btn" class="action-btn action-btn--primary" style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; padding:8px 24px;" onclick="window.claimDailyRewardAction && window.claimDailyRewardAction()">
            ✨ Resgatar Presente do Dia
          </button>
        </div>
      </div>
    </div>

    <!-- Game Progression & Systems Guide Modal -->
    <div id="guide-modal" class="modal">
      <div class="modal-content guide-modal-box" style="max-width:780px; max-height:85vh; overflow-y:auto; background:#0f1219; border:1px solid #d4a744; border-radius:12px; padding:20px; box-shadow:0 0 30px rgba(0,0,0,0.85); color:#f8fafc; font-family:'Cinzel',serif;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px;">
          <h2 style="margin:0; color:#ffd700; font-size:18px; display:flex; align-items:center; gap:8px;">
            <span>📖 Guia Oficial do Aventureiro &amp; Progressão de Aden</span>
          </h2>
          <button id="close-guide-modal-btn" class="modal-close-x" style="background:transparent; border:none; color:#94a3b8; font-size:20px; cursor:pointer;" onclick="window.closeGuideModal && window.closeGuideModal()">✕</button>
        </div>
        
        <!-- Guide Tabs -->
        <div style="display:flex; gap:8px; margin:14px 0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; flex-wrap:wrap;">
          <button class="inv-batch-btn active" id="guide-tab-btn-journey" onclick="window.switchGuideTab('journey')">🗺️ Jornada por Nível</button>
          <button class="inv-batch-btn" id="guide-tab-btn-forge" onclick="window.switchGuideTab('forge')">🔨 Forja &amp; Mercado</button>
          <button class="inv-batch-btn" id="guide-tab-btn-codex" onclick="window.switchGuideTab('codex')">🃏 Cartas &amp; Dolls</button>
          <button class="inv-batch-btn" id="guide-tab-btn-combat" onclick="window.switchGuideTab('combat')">⚔️ Movesets &amp; 4★</button>
          <button class="inv-batch-btn" id="guide-tab-btn-sevensigns" onclick="window.switchGuideTab('sevensigns')">🏛️ Sete Selos &amp; Noblesse</button>
        </div>

        <div id="guide-content" style="font-size:13px; line-height:1.6; color:#cbd5e1;"></div>

        <div class="modal-actions" style="margin-top:20px; text-align:right; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
          <button class="action-btn action-btn--primary" onclick="window.closeGuideModal && window.closeGuideModal()">Entendido! ⚔️</button>
        </div>
      </div>
    </div>

    <!-- Class Transfer Modal -->
    <div id="class-transfer-modal" class="modal">
      <div class="modal-content class-transfer-box">
        <h2 id="class-modal-heading">📜 Cerimônia de Avanço de Classe</h2>
        <p class="modal-sub">Escolha o seu caminho definitivo de evolução em Aden. Esta promoção concederá novos atributos, bônus passivos e desbloqueará habilidades de ordem nobre!</p>
        <div id="class-options-container" class="class-options-container"></div>
        <div class="modal-actions" style="margin-top: 16px;">
          <button id="close-class-modal-btn" class="action-btn">Fechar</button>
        </div>
      </div>
    </div>

    <!-- Symbol Maker (Dyes & Henna Tattoos) Modal -->
    <div id="symbol-maker-modal" class="modal">
      <div class="modal-content" style="max-width: 680px; background: linear-gradient(180deg, #140e0a 0%, #0a0705 100%); border: 2px solid var(--border-gilt); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); padding: 20px;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px; margin-bottom:16px;">
          <h2 style="margin:0; font-family:'Cinzel',serif; color:#ffd877; font-size:18px; display:flex; align-items:center; gap:8px;">
            <span>🎭 Gravador de Símbolos &amp; Tatuagens de Henna</span>
          </h2>
          <button id="close-symbol-modal-btn" class="modal-close-x" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
        </div>
        <p style="font-size:12px; color:#cbd5e1; margin-bottom:14px; line-height:1.4;">
          Grave até <strong>3 Símbolos Sagrados de Henna</strong> no seu herói para transferir atributos primários (STR, DEX, CON, INT, WIT, MEN). <em>Regra de Aden: nenhum atributo pode receber mais de +5 de bônus líquido.</em>
        </p>

        <!-- Current Tattoos Slots -->
        <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#fde047; margin-bottom:8px;">✨ Seus Símbolos Gravados (Slots de Linhagem)</div>
        <div id="symbol-slots-container" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:10px; margin-bottom:16px;"></div>

        <!-- Net Modifiers Summary Bar -->
        <div id="symbol-net-summary" style="background:rgba(0,0,0,0.6); border:1px solid rgba(212,175,55,0.3); border-radius:8px; padding:10px 14px; margin-bottom:16px; font-size:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;"></div>

        <!-- Available Hennas for Inscription -->
        <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#93c5fd; margin-bottom:8px;">📜 Hennas Maiores Disponíveis no Inventário / Mercado</div>
        <div id="symbol-hennas-list" style="display:flex; flex-direction:column; gap:8px; max-height:220px; overflow-y:auto; padding-right:4px;"></div>
      </div>
    </div>

    <!-- Pet Manager Modal -->
    <div id="pet-manager-modal" class="modal">
      <div class="modal-content" style="max-width: 680px; background: linear-gradient(180deg, #140e0a 0%, #0a0705 100%); border: 2px solid var(--border-gilt); border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); padding: 20px;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:12px; margin-bottom:16px;">
          <h2 style="margin:0; font-family:'Cinzel',serif; color:#ffd877; font-size:18px; display:flex; align-items:center; gap:8px;">
            <span>🐾 Santuário de Companheiros &amp; Mascotes de Aden</span>
          </h2>
          <button id="close-pet-modal-btn" class="modal-close-x" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
        </div>
        <p style="font-size:12px; color:#cbd5e1; margin-bottom:14px; line-height:1.4;">
          Adote e invoque companheiros leais para lutar ao seu lado! Os pets sobem de nível ao seu lado (Lv. 1 a 60), atacam nos turnos de batalha e concedem bônus passivos e habilidades de suporte exclusivas.
        </p>

        <!-- Active Pet Overview -->
        <div id="pet-active-container" style="margin-bottom:16px;"></div>

        <!-- Available / Owned Pets List -->
        <div style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#93c5fd; margin-bottom:8px;">📜 Catálogo de Companheiros de Aden</div>
        <div id="pet-list-container" style="display:flex; flex-direction:column; gap:10px; max-height:260px; overflow-y:auto; padding-right:4px;"></div>
      </div>
    </div>

    <!-- Solo Instances (Kamaloka & Pailaka) Modal -->
    <div id="solo-instances-modal" class="modal">
      <div class="modal-content" style="max-width: 720px; background: linear-gradient(180deg, #0e121e 0%, #060913 100%); border: 2px solid #6366f1; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); padding: 20px;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(99,102,241,0.3); padding-bottom:12px; margin-bottom:16px;">
          <h2 style="margin:0; font-family:'Cinzel',serif; color:#a5b4fc; font-size:18px; display:flex; align-items:center; gap:8px;">
            <span>🌀 Fendas Dimensionais: Kamaloka &amp; Pailaka</span>
          </h2>
          <button id="close-instances-modal-btn" class="modal-close-x" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
        </div>
        <p style="font-size:12px; color:#cbd5e1; margin-bottom:14px; line-height:1.4;">
          Desafie chefes dimensionais em masmorras solo diárias. Cada fenda concede <strong>1 entrada diária gratuita</strong> com saltos acelerados de XP, grandes recompensas em Adena, SP e itens de grau garantidos!
        </p>

        <div id="instances-list-container" style="display:flex; flex-direction:column; gap:10px; max-height:360px; overflow-y:auto; padding-right:4px;"></div>
      </div>
    </div>

    <!-- Manor Manager Modal -->
    <div id="manor-manager-modal" class="modal">
      <div class="modal-content" style="max-width: 680px; background: linear-gradient(180deg, #101c13 0%, #07100a 100%); border: 2px solid #22c55e; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.85); padding: 20px;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(34,197,94,0.3); padding-bottom:12px; margin-bottom:16px;">
          <h2 style="margin:0; font-family:'Cinzel',serif; color:#86efac; font-size:18px; display:flex; align-items:center; gap:8px;">
            <span>🌾 Administrador de Manor &amp; Colheita Agrícola</span>
          </h2>
          <button id="close-manor-modal-btn" class="modal-close-x" style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;">✕</button>
        </div>
        <p style="font-size:12px; color:#cbd5e1; margin-bottom:14px; line-height:1.4;">
          Compre sementes nas províncias de Aden (Gludio, Dion, Giran). Ao caçar monstros na região, seu herói semeará e colherá colheitas agrícolas para trocar por <strong>Materiais Raros de Forja (Enria, Mithril Alloy, Varnish of Purity)</strong> no Castelo!
        </p>

        <div id="manor-provinces-list" style="display:flex; flex-direction:column; gap:12px; max-height:360px; overflow-y:auto; padding-right:4px;"></div>
      </div>
    </div>

    <!-- GM Admin Control Panel Modal -->
    <div id="admin-modal" class="modal">
      <div class="modal-content admin-modal-box">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(212,167,68,0.4); padding-bottom:8px; margin-bottom:10px;">
          <div>
            <h2 style="margin:0; font-family:'Cinzel',serif; font-size:16px; color:#ffd700; display:flex; align-items:center; gap:8px;">
              👑 GM Admin Command Center
            </h2>
            <div id="admin-live-rates-summary" style="font-size:11px; color:#38bdf8; font-weight:600; margin-top:3px;">
              Rates Ativas: XP x1.0 · SP x1.0 · Adena x1.0 · Drop x1.0 · Spoil x1.0 · Enchant x1.0
            </div>
          </div>
          <button id="close-admin-modal-btn" class="modal-close-x">✕</button>
        </div>

        <!-- Admin Navigation Tabs -->
        <nav class="admin-nav-tabs" style="display:flex; gap:4px; margin-bottom:12px; border-bottom:1px solid rgba(212,167,68,0.2); padding-bottom:6px; overflow-x:auto; -webkit-overflow-scrolling:touch;">
          <button class="admin-tab-btn active" data-admin-tab="rates">⚡ Rates do Servidor</button>
          <button class="admin-tab-btn" data-admin-tab="cap">⏳ Cap &amp; Temporadas</button>
          <button class="admin-tab-btn" data-admin-tab="spawner">🎁 Gerador de Itens</button>
          <button class="admin-tab-btn" data-admin-tab="player">📊 Recursos &amp; Nível</button>
          <button class="admin-tab-btn" data-admin-tab="cheats">⚔️ Cheats &amp; Combate</button>
        </nav>

        <div class="admin-tabs-container">
          <!-- TAB 1: SERVER RATES CONTROLLER -->
          <div id="admin-tab-rates" class="admin-tab-panel active">
            <!-- Quick Rate Presets -->
            <div style="background:rgba(20,24,35,0.7); border:1px solid rgba(212,167,68,0.3); border-radius:6px; padding:10px; margin-bottom:12px;">
              <div style="font-size:12px; font-weight:bold; color:#ffd877; margin-bottom:8px; font-family:'Cinzel',serif;">
                🚀 Presets Rápidos de Servidor (1 Clique)
              </div>
              <div class="admin-btn-group" style="display:flex; flex-wrap:wrap; gap:6px;">
                <button class="admin-preset-btn" data-rate-preset="classic">🛡️ Retail Classic (1x)</button>
                <button class="admin-preset-btn" data-rate-preset="aden">⚔️ Aden Dynamic (3x)</button>
                <button class="admin-preset-btn" data-rate-preset="mid">🔥 Mid-Rate (10x)</button>
                <button class="admin-preset-btn" data-rate-preset="high">👑 High-Rate (50x)</button>
                <button class="admin-preset-btn" data-rate-preset="turbo">⚡ Turbo PvP (100x)</button>
                <button class="admin-preset-btn danger" data-rate-preset="reset" style="margin-left:auto;">🔄 Resetar (1x)</button>
              </div>
            </div>

            <!-- Detailed Rates Grid -->
            <div class="admin-rates-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
              <!-- 1. XP Rate -->
              <div class="admin-rate-card" data-rate-key="xp">
                <div class="rate-card-header">
                  <span class="rate-title">🌟 Rate de Experiência (XP)</span>
                  <span id="rate-val-xp" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="xp:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:20">20x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:50">50x</button>
                  <button class="rate-pill-btn" data-rate-set="xp:100">100x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-xp" class="admin-num-input" placeholder="Multiplicador (ex: 15)" min="0.1" max="1000" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="xp">Aplicar</button>
                </div>
              </div>

              <!-- 2. SP Rate -->
              <div class="admin-rate-card" data-rate-key="sp">
                <div class="rate-card-header">
                  <span class="rate-title">✦ Rate de Skill Points (SP)</span>
                  <span id="rate-val-sp" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="sp:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:20">20x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:50">50x</button>
                  <button class="rate-pill-btn" data-rate-set="sp:100">100x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-sp" class="admin-num-input" placeholder="Multiplicador (ex: 15)" min="0.1" max="1000" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="sp">Aplicar</button>
                </div>
              </div>

              <!-- 3. Adena Rate -->
              <div class="admin-rate-card" data-rate-key="adena">
                <div class="rate-card-header">
                  <span class="rate-title">🪙 Rate de Adena (Gold)</span>
                  <span id="rate-val-adena" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="adena:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:25">25x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:50">50x</button>
                  <button class="rate-pill-btn" data-rate-set="adena:100">100x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-adena" class="admin-num-input" placeholder="Multiplicador (ex: 20)" min="0.1" max="1000" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="adena">Aplicar</button>
                </div>
              </div>

              <!-- 4. Drop Rate -->
              <div class="admin-rate-card" data-rate-key="drop">
                <div class="rate-card-header">
                  <span class="rate-title">📦 Rate de Drop (Itens &amp; Equips)</span>
                  <span id="rate-val-drop" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="drop:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:3">3x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:20">20x</button>
                  <button class="rate-pill-btn" data-rate-set="drop:50">50x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-drop" class="admin-num-input" placeholder="Multiplicador (ex: 5)" min="0.1" max="1000" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="drop">Aplicar</button>
                </div>
              </div>

              <!-- 5. Spoil & Craft Rate -->
              <div class="admin-rate-card" data-rate-key="spoil">
                <div class="rate-card-header">
                  <span class="rate-title">⚒️ Rate de Spoil &amp; Craft Points</span>
                  <span id="rate-val-spoil" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="spoil:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="spoil:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="spoil:3">3x</button>
                  <button class="rate-pill-btn" data-rate-set="spoil:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="spoil:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="spoil:20">20x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-spoil" class="admin-num-input" placeholder="Multiplicador (ex: 5)" min="0.1" max="1000" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="spoil">Aplicar</button>
                </div>
              </div>

              <!-- 6. Enchant Success Rate -->
              <div class="admin-rate-card" data-rate-key="enchant">
                <div class="rate-card-header">
                  <span class="rate-title">✨ Rate de Encantamento (Enchant)</span>
                  <span id="rate-val-enchant" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="enchant:1">1.0x (Padrão)</button>
                  <button class="rate-pill-btn" data-rate-set="enchant:1.2">1.2x (+20%)</button>
                  <button class="rate-pill-btn" data-rate-set="enchant:1.5">1.5x (+50%)</button>
                  <button class="rate-pill-btn" data-rate-set="enchant:2">2.0x (2x)</button>
                  <button class="rate-pill-btn" data-rate-set="enchant:3">3.0x (Ultra)</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-enchant" class="admin-num-input" placeholder="Multiplicador (ex: 1.5)" min="0.1" max="10" step="0.1" />
                  <button class="admin-apply-btn" data-rate-apply="enchant">Aplicar</button>
                </div>
              </div>

              <!-- 7. Spellbooks Drop Rate -->
              <div class="admin-rate-card" data-rate-key="book">
                <div class="rate-card-header">
                  <span class="rate-title">📖 Rate de Drop de Grimórios (1★ a 4★)</span>
                  <span id="rate-val-book" class="rate-badge">x1.0</span>
                </div>
                <div class="rate-btn-row">
                  <button class="rate-pill-btn" data-rate-set="book:1">1x</button>
                  <button class="rate-pill-btn" data-rate-set="book:2">2x</button>
                  <button class="rate-pill-btn" data-rate-set="book:5">5x</button>
                  <button class="rate-pill-btn" data-rate-set="book:10">10x</button>
                  <button class="rate-pill-btn" data-rate-set="book:20">20x</button>
                </div>
                <div class="rate-custom-row">
                  <input type="number" id="admin-rate-inp-book" class="admin-num-input" placeholder="Multiplicador (ex: 5)" min="0.1" max="100" step="0.5" />
                  <button class="admin-apply-btn" data-rate-apply="book">Aplicar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: LEVEL CAP & SEASONS -->
          <div id="admin-tab-cap" class="admin-tab-panel">
            <div class="admin-section" style="background: rgba(30, 20, 10, 0.6); border: 1px solid var(--border-gilt); border-radius: 8px; padding: 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <h3 style="margin:0; color:#ffd877; font-family:'Cinzel',serif; font-size:14px;">⏳ Gestão de Cap de Servidor &amp; Temporadas</h3>
                <span id="admin-current-cap-badge" style="font-size:11px; padding:3px 8px; border-radius:4px; background:rgba(212,167,68,0.2); border:1px solid var(--border-gilt); color:#ffd877; font-weight:bold;">Cap Atual: Nível 60 (Fase 1)</span>
              </div>
              <p style="font-size:11px; color:#cbd5e1; margin-bottom:12px;">Defina o teto de nível máximo acessível para todos os jogadores do servidor:</p>
              <div class="admin-btn-group" style="display:flex; flex-wrap:wrap; gap:8px;">
                <button class="admin-btn" data-admin-cmd="setcap40">Cap Lv. 40 (Prelúdio)</button>
                <button class="admin-btn primary" data-admin-cmd="setcap60">Cap Lv. 60 (Fase 1)</button>
                <button class="admin-btn" data-admin-cmd="setcap75">Cap Lv. 75 (Fase 2)</button>
                <button class="admin-btn" data-admin-cmd="setcap85">Cap Lv. 85 (Fase 3 - Noblesse)</button>
                <button class="admin-btn" data-admin-cmd="setcap100">Cap Lv. 100 (Fase 4 - Imperial)</button>
                <button class="admin-btn" data-admin-cmd="setcap120" style="background:#7c2d12; border-color:#f59e0b; color:#fbbf24; font-weight:bold;">👑 Cap Lv. 120 (Supremo)</button>
              </div>
            </div>
          </div>

          <!-- TAB 3: ITEM SPAWNER -->
          <div id="admin-tab-spawner" class="admin-tab-panel">
            <div class="admin-section admin-spawner">
              <h3>🎁 Gerador de Itens &amp; Relíquias</h3>
              <div class="spawner-fields">
                <div class="admin-search-wrapper" style="margin-bottom:8px; display:flex; gap:6px;">
                  <input 
                    type="text" 
                    id="admin-item-search" 
                    class="admin-num-input" 
                    placeholder="🔍 Pesquisar item por nome, tipo ou slot (ex: bow, katana, dagger, ring)..." 
                    style="flex:1; padding:8px 12px; font-size:13px; border-radius:6px; background:rgba(0,0,0,0.5); border:1px solid #4a5568; color:#f8fafc;" 
                  />
                  <button type="button" id="admin-item-search-clear" class="admin-btn" style="padding:4px 10px; font-size:12px;" title="Limpar busca">Limpar</button>
                </div>
                <label for="admin-item-select" class="sr-only" style="display:none;">Item para Gerar</label>
                <select id="admin-item-select" name="adminItemSelect" class="admin-select" aria-label="Item para Gerar" style="width:100%; margin-bottom:8px;"></select>
                <div class="spawner-row">
                  <label for="admin-item-qty">Qtd: <input type="number" id="admin-item-qty" name="adminItemQty" value="1" min="1" max="999" class="admin-num-input" aria-label="Quantidade" style="width:65px;" /></label>
                  <label for="admin-item-rarity">Raridade: 
                    <select id="admin-item-rarity" name="adminItemRarity" class="admin-select" aria-label="Raridade do Item">
                      <option value="common">Comum</option>
                      <option value="uncommon">Incomum</option>
                      <option value="rare">Raro</option>
                      <option value="epic">Épico (Roxo)</option>
                      <option value="legendary">Lendário (Dourado)</option>
                      <option value="mythic">Místico (Vermelho)</option>
                      <option value="s">Grau S Divine</option>
                    </select>
                  </label>
                  <label for="admin-item-enchant">Encanto: 
                    <select id="admin-item-enchant" name="adminItemEnchant" class="admin-select" aria-label="Nível de Encanto">
                      <option value="0">+0</option>
                      <option value="3">+3</option>
                      <option value="7">+7</option>
                      <option value="10">+10</option>
                      <option value="16">+16 (L2 Classic)</option>
                      <option value="20">+20</option>
                      <option value="30">+30 (Godlike)</option>
                    </select>
                  </label>
                  <label for="admin-item-affix">Afixo: 
                    <select id="admin-item-affix" name="adminItemAffix" class="admin-select" aria-label="Afixo do Item">
                      <option value="roll">🎲 Sortear da Raridade</option>
                      <option value="none">Nenhum Afixo</option>
                      <option value="crit_boost">✦ +% Crítico</option>
                      <option value="eva_boost">✦ +% Evasão</option>
                      <option value="lifesteal_boost">✦ +% Roubo de Vida</option>
                      <option value="atk_boost">✦ +% Ataque</option>
                      <option value="speed_boost">✦ +% Vel. de Ataque</option>
                      <option value="boss_dmg">✦ +% Dano vs Chefes</option>
                      <option value="on_kill_heal">✦ +% Cura ao Matar</option>
                      <option value="stun_chance">✦ % Chance de Stun</option>
                    </select>
                  </label>
                </div>
                <div class="spawner-check-row" style="margin-top:6px; display:flex; align-items:center; gap:8px;">
                  <label style="font-size:12px; color:var(--gilt-bright); cursor:pointer; display:flex; align-items:center; gap:6px;">
                    <input type="checkbox" id="admin-item-foundation" style="accent-color:#d4a744; width:15px; height:15px; cursor:pointer;" />
                    ✨ <strong>Item Foundation</strong> (Bônus Místico de Raridade &amp; Afixo Exclusivo)
                  </label>
                </div>
                <button id="admin-spawn-btn" class="admin-btn primary" style="margin-top:10px; width:100%; padding:10px; font-weight:bold;">✨ Gerar Item na Mochila</button>
              </div>
            </div>
          </div>

          <!-- TAB 4: PLAYER RESOURCES & LEVEL -->
          <div id="admin-tab-player" class="admin-tab-panel">
            <div class="admin-grid">
              <!-- Section 1: Level & XP Controls -->
              <div class="admin-section">
                <h3>📊 Nível &amp; Experiência (XP)</h3>
                <div class="admin-btn-group">
                  <button class="admin-btn" data-admin-cmd="level20">Set Lv.20</button>
                  <button class="admin-btn" data-admin-cmd="level40">Set Lv.40</button>
                  <button class="admin-btn" data-admin-cmd="level76">Set Lv.76</button>
                  <button class="admin-btn" data-admin-cmd="level85">Set Lv.85</button>
                  <button class="admin-btn" data-admin-cmd="add1level">+1 Nível</button>
                  <button class="admin-btn" data-admin-cmd="add5levels">+5 Níveis</button>
                </div>
                <div class="admin-input-row" style="margin-top:8px; display:flex; gap:6px;">
                  <input type="number" id="admin-xp-custom" class="admin-num-input" placeholder="Qtd. XP (ex: 100000)" style="flex:1;" />
                  <button id="admin-add-xp-btn" class="admin-btn primary">+ Conceder XP</button>
                </div>
              </div>

              <!-- Section 2: Currency & Skill Points -->
              <div class="admin-section">
                <h3>🪙 Economia (Adena, SP &amp; Aden Coins)</h3>
                <div class="admin-btn-group">
                  <button class="admin-btn" data-admin-cmd="gold1m">+1M Adena</button>
                  <button class="admin-btn" data-admin-cmd="gold10m">+10M Adena</button>
                  <button class="admin-btn" data-admin-cmd="sp5k">+5K SP</button>
                  <button class="admin-btn" data-admin-cmd="sp50k">+50K SP</button>
                  <button class="admin-btn" data-admin-cmd="ac500" style="background:#7c2d12; border-color:#f59e0b; color:#fbbf24;">+500 AC</button>
                  <button class="admin-btn" data-admin-cmd="ac2000" style="background:#7c2d12; border-color:#f59e0b; color:#fbbf24;">+2.000 AC</button>
                </div>
                <div class="admin-input-row" style="margin-top:8px; display:flex; gap:6px;">
                  <input type="number" id="admin-gold-custom" class="admin-num-input" placeholder="Qtd. Adena (ex: 5000000)" style="flex:1;" />
                  <button id="admin-add-gold-btn" class="admin-btn primary">+ Ouro</button>
                </div>
                <div class="admin-input-row" style="margin-top:6px; display:flex; gap:6px;">
                  <input type="number" id="admin-sp-custom" class="admin-num-input" placeholder="Qtd. SP (ex: 25000)" style="flex:1;" />
                  <button id="admin-add-sp-btn" class="admin-btn primary">+ SP</button>
                </div>
                <div class="admin-input-row" style="margin-top:6px; display:flex; gap:6px;">
                  <input type="number" id="admin-ac-custom" class="admin-num-input" placeholder="Qtd. Aden Coins (ex: 1000)" style="flex:1;" />
                  <button id="admin-add-ac-btn" class="admin-btn primary" style="background:linear-gradient(135deg,#b45309,#d97706); border-color:#f59e0b;">+ Aden Coins</button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: CHEATS & PROGRESSION -->
          <div id="admin-tab-cheats" class="admin-tab-panel">
            <div class="admin-section">
              <h3>⚡ Cheats de Jogo &amp; Progressão Imediata</h3>
              <div class="admin-btn-group">
                <button class="admin-btn" data-admin-cmd="godmode">🛡️ Invencibilidade (God Mode)</button>
                <button class="admin-btn" data-admin-cmd="healfull">❤️ Recuperar HP/MP Full</button>
                <button class="admin-btn" data-admin-cmd="unlocksagas">📜 Desbloquear Sagas</button>
                <button class="admin-btn" data-admin-cmd="completequest">✅ Concluir Missão</button>
                <button class="admin-btn" data-admin-cmd="maxcraft">⚒️ Level Máx Crafting</button>
                <button class="admin-btn" data-admin-cmd="maxskills">📖 Max Skills</button>
                <button class="admin-btn" data-admin-cmd="killmonster">⚡ Derrotar Monstro</button>
                <button class="admin-btn" data-admin-cmd="autoequip">⚔️ Auto-Equipar</button>
                <button class="admin-btn danger" data-admin-cmd="resetsave">🗑️ Resetar Progresso</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criação da Forja -->
    <div id="craft-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:9999; justify-content:center; align-items:center;">
      <div class="craft-modal-content" style="background:linear-gradient(145deg, rgba(26,20,15,0.98), rgba(12,8,6,0.99)); border:1px solid rgba(212,175,55,0.5); border-radius:12px; width:92%; max-width:480px; padding:20px; box-shadow:0 10px 30px rgba(0,0,0,0.8); position:relative;">
        <button id="craft-modal-close" style="position:absolute; top:12px; right:14px; background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;">✖</button>
        <div id="craft-modal-body"></div>
      </div>
    </div>

    <!-- Modal de Certificação de Subclasses -->
    <div id="cert-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(6px); z-index:9999; justify-content:center; align-items:center;">
      <div class="craft-modal-content" style="background:linear-gradient(145deg, rgba(20,24,35,0.98), rgba(10,12,18,0.99)); border:1px solid rgba(212,175,55,0.6); border-radius:12px; width:92%; max-width:520px; padding:20px; box-shadow:0 10px 35px rgba(0,0,0,0.85); position:relative;">
        <button id="cert-modal-close" style="position:absolute; top:12px; right:14px; background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;">✖</button>
        <div id="cert-modal-body"></div>
      </div>
    </div>

    <!-- Modal de Filtro de Loot AFK & Auto-Recycle -->
    <div id="auto-recycle-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); z-index:99999; justify-content:center; align-items:center;">
      <div class="craft-modal-content" style="background:linear-gradient(145deg, rgba(20,24,35,0.98), rgba(10,12,18,0.99)); border:1px solid #d4a744; border-radius:12px; width:92%; max-width:540px; padding:22px; box-shadow:0 10px 40px rgba(0,0,0,0.9); position:relative; font-family:'Cinzel',serif; color:#f8fafc;">
        <button id="close-auto-recycle-modal-btn" style="position:absolute; top:12px; right:14px; background:none; border:none; color:#aaa; font-size:20px; cursor:pointer;" onclick="const m=document.getElementById('auto-recycle-modal'); if(m) m.style.display='none';">✖</button>
        <div id="auto-recycle-modal-body"></div>
      </div>
    </div>

    <!-- Item Tooltip -->
    <div id="item-tooltip" class="item-tooltip"></div>

    <!-- Mobile Bottom Dock Navigation -->
    <nav class="mobile-bottom-nav">
      <button class="mobile-nav-btn active" data-tab="battle"><span class="icon">⚔️</span><span>Batalha</span></button>
      <button class="mobile-nav-btn" data-tab="inventory"><span class="icon">🎒</span><span>Mochila</span></button>
      <button class="mobile-nav-btn" data-tab="hero"><span class="icon">👤</span><span>Herói</span></button>
      <button class="mobile-nav-btn" data-tab="skills"><span class="icon">✦</span><span>Skills</span></button>
      <button class="mobile-nav-btn" data-tab="codex"><span class="icon">📜</span><span>Codex</span></button>
      <button class="mobile-nav-btn" data-tab="shop"><span class="icon">🛒</span><span>Loja</span></button>
    </nav>
  </div>
`;

