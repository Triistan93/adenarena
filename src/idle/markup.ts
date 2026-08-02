// The idle game's DOM, injected verbatim into a Shadow Root so its styles
// and IDs cannot collide with the 3D arena that shares the page.
export const IDLE_MARKUP = `
  <div id="game">
    <div class="ambient-layer" aria-hidden="true"></div>
    <div id="float-layer" class="float-layer" aria-hidden="true"></div>
    <!-- Top Bar -->
    <header class="top-bar">
      <span id="game-title">LINEAGE <span class="title-idle-stamp"><span class="stamp-idle"><span class="stamp-idle-text">IDLE</span><span class="stamp-idle-sub">CHRONICLE</span></span></span></span>
      <div class="top-stats">
        <span class="ts-zone">
          <span class="ts-label">Zone</span>
          <span id="zone-name">Talking Island</span>
          <span id="zone-kill-progress" style="font-size:11px; color:#f59e0b; margin-left:8px; font-weight:800; background:rgba(0,0,0,0.4); padding:2px 8px; border-radius:10px; border:1px solid rgba(245,158,11,0.3);">⚔️ 0/15 Caçados</span>
        </span>
        <span class="ts-clock"><span class="ts-label">Session</span><span id="clock">00:00:00</span></span>
        <button id="audio-mute-btn" onclick="window.toggleMuteAudio && window.toggleMuteAudio()" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;margin-left:8px;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">🔊 Audio</button>
      </div>
    </header>

    <!-- Main Layout -->
    <main class="main-grid">
      <!-- Left: Character Stats -->
      <aside class="panel stats-panel">
        <div class="stat-row">
          <label>HP</label>
          <div class="bar-container">
            <div id="hp-bar" class="bar hp" style="width:100%"></div>
            <span id="hp-text">100 / 100</span>
          </div>
        </div>
        <div class="stat-row">
          <label>MP</label>
          <div class="bar-container">
            <div id="mp-bar" class="bar mp" style="width:100%"></div>
            <span id="mp-text">50 / 50</span>
          </div>
        </div>
        <div class="stat-row">
          <label>XP</label>
          <div class="bar-container">
            <div id="xp-bar" class="bar xp" style="width:0%"></div>
            <span id="xp-text">0 / 100</span>
          </div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-row"><label>Level</label><span id="level-text" class="stat-value">1</span></div>
        <div class="stat-row"><label>Saga</label><span id="saga-text" class="stat-value">Interlude</span></div>
        <div class="stat-row"><label>Race</label><span id="race-text" class="stat-value">Human</span></div>
        <div class="stat-row"><label>Class</label><span id="class-text" class="stat-value">Fighter</span></div>
        <div class="stat-divider"></div>
        <div class="stat-row"><label>ATK</label><span id="atk-text" class="stat-value">10</span></div>
        <div class="stat-row"><label>DEF</label><span id="def-text" class="stat-value">5</span></div>
        <div class="stat-row"><label>EVA</label><span id="eva-text" class="stat-value">0</span></div>
        <div class="stat-row"><label>MATK</label><span id="matk-text" class="stat-value">0</span></div>
        <div class="stat-row"><label>MDEF</label><span id="mdef-text" class="stat-value">0</span></div>
        <div class="stat-row"><label>CRIT</label><span id="crit-text" class="stat-value">0%</span></div>
        <div class="stat-row"><label>Loot</label><span id="loot-text" class="stat-value">100%</span></div>
        <div class="stat-divider"></div>
        <div class="stat-row"><label>SP</label><span id="sp-text" class="stat-value">0</span></div>
        <div class="stat-row"><label>Gold</label><span id="gold-text-stat" class="stat-value gold">0</span></div>
        <div class="stat-row"><label>Gold/s</label><span id="gps-text" class="stat-value gold-dim">—</span></div>
        <div class="stat-row"><label>Craft Lv</label><span id="craft-level-stat" class="stat-value">1</span></div>
        <div class="stat-divider"></div>
        <div class="active-buffs" id="active-buffs"><span class="ab-empty">No active buffs</span></div>
      </aside>

      <div class="grid-resizer grid-resizer-v" id="resizer-col-1" title="Arrastre para redimensionar painel de atributos"></div>

      <!-- Center: live battle stage + combat ticker (compact & centered) -->
      <section class="panel log-panel center-panel" id="center-panel">
        <div class="stage" id="stage" data-state="idle">
          <div class="stage-bg stage-bg-a" id="stage-bg-a"></div>
          <div class="stage-bg stage-bg-b" id="stage-bg-b"></div>
          <div class="stage-zone" id="stage-zone">—</div>
          <div class="combat-controls-bar">
            <button id="soulshot-toggle-btn" class="combat-ctrl-btn" title="Ativar Soulshot no combate (+100% dano físico/mágico por golpe)">⚡ Soulshot: OFF</button>
            <button id="autopotion-toggle-btn" class="combat-ctrl-btn" title="Usar poções de HP automaticamente quando HP < 50%">🧪 Auto-Poção: OFF</button>
            <button id="speed-toggle-btn" class="combat-ctrl-btn" title="Velocidade do combate (1x Normal ou 2x Turbo)">⏩ Velocidade: 1x</button>
          </div>
          <div class="stage-vs" aria-hidden="true">&#9876;</div>
          <div class="stage-hero" id="stage-hero"></div>
          <div class="stage-monster" id="stage-monster">
            <div class="m-name" id="m-name"></div>
            <div class="m-hp"><div class="m-hp-fill" id="m-hp-fill"></div></div>
            <div class="m-art" id="m-art"></div>
          </div>
          <div class="stage-floats" id="stage-floats"></div>
        </div>
        <div class="grid-resizer grid-resizer-h" id="resizer-row-stage" title="Arrastre para redimensionar janela de combate"></div>
        <div class="log-controls-bar">
          <div class="log-filters">
            <button class="log-filter-btn active" data-logfilter="all">Todos</button>
            <button class="log-filter-btn" data-logfilter="combat">⚔️ Combate</button>
            <button class="log-filter-btn" data-logfilter="loot">💰 Loot</button>
            <button class="log-filter-btn" data-logfilter="system">⚙️ Sistema</button>
          </div>
          <button id="clear-log-btn" class="log-clear-btn" title="Limpar histórico de log">🧹 Limpar Log</button>
        </div>
        <div id="log" class="log">
          <p class="log-entry system">Welcome to Lineage Idle.</p>
          <p class="log-entry system">Select your Race &amp; Class to begin.</p>
        </div>
        <form id="chat-form" class="chat-input-bar">
          <input type="text" id="chat-input" class="chat-input" placeholder="Digite uma mensagem ou comando (ex: //admin)..." autocomplete="off" />
          <button type="submit" class="chat-send-btn">Enviar</button>
        </form>
      </section>

      <div class="grid-resizer grid-resizer-v" id="resizer-col-2" title="Arrastre para redimensionar inventário e abas"></div>

      <!-- Right: Main Menu Workspace (Expanded) -->
      <aside class="panel tabs-panel">
        <div class="tab-buttons">
          <button class="tab-btn active" data-tab="character">👤 Personagem</button>
          <button class="tab-btn" data-tab="inventory">🎒 Inventário <span id="tab-badge-inventory" class="tab-badge" style="display:none">!</span></button>
          <button class="tab-btn" data-tab="skills">✦ Habilidades <span id="tab-badge-skills" class="tab-badge" style="display:none">!</span></button>
          <button class="tab-btn" data-tab="shop">🛒 Mercador</button>
          <button class="tab-btn" data-tab="craft">⚒️ Forja <span id="tab-badge-craft" class="tab-badge" style="display:none">!</span></button>
          <button class="tab-btn" data-tab="enchant">✨ Encantamento</button>
          <button class="tab-btn" data-tab="zones">🗺️ Caça &amp; Raids</button>
          <button class="tab-btn" data-tab="codex">📜 Codex</button>
          <button class="tab-btn" data-tab="dolls">🧸 Dolls</button>
          <button class="tab-btn" data-tab="magiclamp">🪔 Lâmpada &amp; Craft</button>
          <button class="tab-btn" data-tab="quests">🎯 Missões <span id="tab-badge-quests" class="tab-badge" style="display:none">!</span></button>
          <button class="tab-btn" data-tab="tower">🏰 Torre Insolência</button>
        </div>
        <div class="tab-content">
          <!-- Character Tab -->
          <div id="tab-character" class="tab-pane active">
            <div class="portrait" id="portrait">
              <div class="portrait-aura" id="portrait-aura"></div>
              <div class="portrait-art" id="portrait-art"></div>
              <div class="portrait-meta">
                <div class="portrait-name" id="portrait-name">Adventurer</div>
                <div class="portrait-sub" id="portrait-sub">Choose your lineage</div>
              </div>
            </div>

            <!-- Class Advancement Promotion Banner -->
            <div id="class-advancement-banner" class="class-advancement-banner" style="display:none;">
              <div class="banner-icon">⚔️</div>
              <div class="banner-info">
                <h4 id="class-advancement-title">1ª Troca de Classe Disponível!</h4>
                <p id="class-advancement-sub">Atingiu Nível 20! Escolha a evolução da sua Ordem de Aden.</p>
              </div>
              <button id="class-advancement-btn" class="class-adv-action-btn">🎖️ Avançar Classe</button>
            </div>
            <div class="pane-section">
              <h3>Raça &amp; Classe Atual</h3>
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,167,68,0.25); border-radius: 14px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div>
                  <div id="hero-race-class-display" style="font-weight: 800; color: var(--gilt-bright); font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Aventureiro de Aden</div>
                  <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.4;">Para trocar sua Raça e Classe, adquira e utilize o <strong>Scroll of Race &amp; Class Change</strong> no Inventário.</p>
                </div>
                <div style="font-size: 28px; background: rgba(212,167,68,0.1); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(212,167,68,0.2);">📜</div>
              </div>
            </div>

            <!-- Subclass & Certification Management Panel -->
            <div class="pane-section subclass-section" style="margin-top: 14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>📜 Subclasses &amp; Certificações de Aden</h3>
                <span id="subclass-count-badge" style="font-size:11px; background:rgba(212,167,68,0.2); padding:2px 8px; border-radius:10px; color:var(--gilt-bright);">Lv. 75 Requerido</span>
              </div>
              <p style="font-size:11px; color:var(--text-muted); margin:4px 0 10px 0;">Alterne livremente entre sua Classe Principal e até 3 Subclasses para acumular bônus de Certificação passivos!</p>
              
              <div id="subclass-list-container" class="subclass-list-container" style="display:flex; flex-direction:column; gap:8px;"></div>
              
              <div style="display:flex; gap:8px; margin-top:10px;">
                <button id="add-subclass-btn" class="action-btn action-btn--primary" style="flex:1; font-size:11px;">➕ Adicionar Subclasse (Lv 75+)</button>
              </div>

              <!-- Certifications Tree -->
              <div style="margin-top: 14px; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; border: 1px solid var(--line);">
                <h4 style="margin:0 0 6px 0; font-size:12px; color:var(--gilt-bright);">✨ Certificações Passivas Adquiridas</h4>
                <div id="certifications-summary" style="font-size:11px; color:var(--ink-dim);">Nenhuma certificação aprendida ainda. Suba suas subclasses aos Lvs. 65, 70 e 75!</div>
              </div>
            </div>

            <div class="char-actions">
              <button id="save-btn" class="action-btn">Salvar Jogo</button>
              <button id="start-btn" class="action-btn action-btn--primary">Iniciar Saga</button>
              <button id="reset-btn" class="action-btn action-btn--danger">Reiniciar Personagem</button>
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
                <span class="l2inv-counter" id="l2inv-counter">(<span id="inv-slots-count">0</span>/50)</span>
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
                <div class="l2inv-paperdoll-grid">
                  <!-- Column 1 (Left) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="hair" title="Acessório de Cabeça">
                      <span class="l2inv-pd-icon">👒</span>
                      <span class="l2inv-pd-item" id="pd-item-hair"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="gloves" title="Luvas">
                      <span class="l2inv-pd-icon">🧤</span>
                      <span class="l2inv-pd-item" id="pd-item-gloves"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="weapon" title="Arma Principal">
                      <span class="l2inv-pd-icon">⚔️</span>
                      <span class="l2inv-pd-item" id="pd-item-weapon"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="necklace" title="Colar">
                      <span class="l2inv-pd-icon">📿</span>
                      <span class="l2inv-pd-item" id="pd-item-necklace"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="ring" title="Anel 1">
                      <span class="l2inv-pd-icon">💍</span>
                      <span class="l2inv-pd-item" id="pd-item-ring"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="belt" title="Cinto">
                      <span class="l2inv-pd-icon">🪢</span>
                      <span class="l2inv-pd-item" id="pd-item-belt"></span>
                    </div>
                  </div>

                  <!-- Column 2 (Center) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="helmet" title="Capacete">
                      <span class="l2inv-pd-icon">⛑️</span>
                      <span class="l2inv-pd-item" id="pd-item-helmet"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="armor" title="Armadura / Peito">
                      <span class="l2inv-pd-icon">🛡️</span>
                      <span class="l2inv-pd-item" id="pd-item-armor"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="legs" title="Perneiras">
                      <span class="l2inv-pd-icon">👖</span>
                      <span class="l2inv-pd-item" id="pd-item-legs"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="shield" title="Escudo / Secundária">
                      <span class="l2inv-pd-icon">🛡️</span>
                      <span class="l2inv-pd-item" id="pd-item-shield"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="boots" title="Botas">
                      <span class="l2inv-pd-icon">👢</span>
                      <span class="l2inv-pd-item" id="pd-item-boots"></span>
                    </div>
                  </div>

                  <!-- Column 3 (Right) -->
                  <div class="l2inv-doll-col">
                    <div class="l2inv-pd-slot equip-slot" data-slot="hair2" title="Máscara">
                      <span class="l2inv-pd-icon">🎭</span>
                      <span class="l2inv-pd-item" id="pd-item-hair2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="earring1" title="Brinco 1">
                      <span class="l2inv-pd-icon">💎</span>
                      <span class="l2inv-pd-item" id="pd-item-earring1"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="earring2" title="Brinco 2">
                      <span class="l2inv-pd-icon">💎</span>
                      <span class="l2inv-pd-item" id="pd-item-earring2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="ring2" title="Anel 2">
                      <span class="l2inv-pd-icon">💍</span>
                      <span class="l2inv-pd-item" id="pd-item-ring2"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="cloak" title="Capa">
                      <span class="l2inv-pd-icon">🧥</span>
                      <span class="l2inv-pd-item" id="pd-item-cloak"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="talisman" title="Talismã">
                      <span class="l2inv-pd-icon">🔮</span>
                      <span class="l2inv-pd-item" id="pd-item-talisman"></span>
                    </div>
                    <div class="l2inv-pd-slot equip-slot" data-slot="agathion" title="Agathion / Mascot">
                      <span class="l2inv-pd-icon">🧚‍♂️</span>
                      <span class="l2inv-pd-item" id="pd-item-agathion"></span>
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
              </div>

              <!-- Right Panel: Items Grid and Tabs -->
              <div class="l2inv-right-grid-area">
                <!-- L2 Metallic Filter Tabs -->
                <div class="l2inv-tabs-header">
                  <button class="l2inv-tab-btn filter-btn active" data-filter="all">All</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="gear">Equip</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="consumable">Supplies</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="material">Crafting</button>
                  <button class="l2inv-tab-btn filter-btn" data-filter="scroll">Quest</button>
                </div>

                <!-- Sub-filters Bar (Rarity & Batch Selection) -->
                <div class="l2inv-subbar">
                  <div class="l2inv-rarity-pills">
                    <button class="rarity-filter-btn active" data-rarity="all">All</button>
                    <button class="rarity-filter-btn r-common" data-rarity="common">C</button>
                    <button class="rarity-filter-btn r-uncommon" data-rarity="uncommon">I</button>
                    <button class="rarity-filter-btn r-rare" data-rarity="rare">R</button>
                    <button class="rarity-filter-btn r-epic" data-rarity="epic">É</button>
                    <button class="rarity-filter-btn r-legendary" data-rarity="legendary">L</button>
                  </div>
                  <div style="display:flex; align-items:center; gap:4px; font-size:10px; color:var(--gilt-bright);">
                    <span style="font-weight:600;">Auto-Venda:</span>
                    <select id="auto-sell-rarity-select" style="background:#090b10; color:#fff; border:1px solid rgba(212,167,68,0.3); border-radius:4px; padding:2px 4px; font-size:10px; cursor:pointer;">
                      <option value="off">Desativado</option>
                      <option value="common">≤ Comum</option>
                      <option value="uncommon">≤ Incomum</option>
                      <option value="rare">≤ Raro</option>
                    </select>
                  </div>
                  <input type="text" id="inv-search-input" placeholder="🔍 Buscar..." style="background:#090b10; color:#fff; border:1px solid rgba(212,167,68,0.3); border-radius:4px; padding:2px 6px; font-size:10px; width:80px;" title="Filtrar por nome de item" />
                  <div class="l2inv-batch-pills">
                    <button id="select-commons-btn" class="l2inv-pill-btn" title="Selecionar comuns">✓ Comum</button>
                    <button id="select-uncommons-btn" class="l2inv-pill-btn" title="Selecionar incomuns">✓ Incomum</button>
                    <button id="select-all-btn" class="l2inv-pill-btn" title="Selecionar todos">✓ Todos</button>
                    <button id="clear-selection-btn" class="l2inv-pill-btn" title="Limpar seleções">✕</button>
                  </div>
                </div>

                <!-- Item Slots Grid (8 columns x 7 rows dark reddish-brown slots) -->
                <div class="l2inv-slots-grid" id="inventory-grid"></div>
              </div>
            </div>

            <!-- Bottom Bar matching L2 UI -->
            <div class="l2inv-bottom-bar">
              <div class="l2inv-bottom-left-actions">
                <button class="l2inv-icon-btn" id="nav-craft-btn" title="Abrir Forja / Crafting">⚒️</button>
                <button class="l2inv-icon-btn" id="auto-equip-btn" title="Equipar Melhores Itens">⚡</button>
              </div>

              <div class="l2inv-bottom-right-info">
                <div class="l2inv-gold-counter">
                  <span class="l2inv-gold-icon">🪙</span>
                  <span class="l2inv-gold-val" id="gold-text">0</span>
                </div>
                <div class="l2inv-weight-gauge" title="Capacidade do Alforge">
                  <span class="l2inv-weight-icon">🎒</span>
                  <span id="inv-slots">0/50</span>
                </div>
                <div class="l2inv-trash-actions">
                  <button id="sell-selected-btn" class="l2inv-trash-btn sell" disabled title="Vender Itens Selecionados">💰 Vender</button>
                  <button id="salvage-selected-btn" class="l2inv-trash-btn salvage" disabled title="Desmontar Selecionados">🔨 Desmontar</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Shop Tab -->
          <div id="tab-shop" class="tab-pane">
            <div class="shop-head">
              <h3>Guilda dos Mercadores de Aden</h3>
              <span class="shop-gold-pill">🪙 <span id="shop-gold">0</span></span>
            </div>
            <div class="shop-subtabs">
              <button class="shop-subtab active" data-shoptab="gear">⚔ Equipamentos</button>
              <button class="shop-subtab" data-shoptab="potions">🧪 Porções</button>
              <button class="shop-subtab" data-shoptab="powerups">✨ Encantamentos</button>
              <button class="shop-subtab" data-shoptab="class">🎖 Classe</button>
              <button class="shop-subtab" data-shoptab="mystic">✦ Místico</button>
            </div>
            <div class="shop-list" id="shop-list"></div>
          </div>

          <!-- Craft Tab -->
          <div id="tab-craft" class="tab-pane">
            <div class="craft-head">
              <h3>Forja &amp; Criação de Itens</h3>
              <p class="stat-value">Nível de Forja: <span id="craft-level">1</span></p>
            </div>
            <div id="craft-recipes-view" class="craft-view active">
              <p class="shop-info">Combine materiais para forjar armas, armaduras e relíquias poderosas.</p>
              <div class="craft-list" id="craft-list"></div>
            </div>
          </div>

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
          <div id="tab-zones" class="tab-pane">
            <div class="zone-head-tabs">
              <button class="zone-subtab active" data-zonetab="map">🗺️ Zonas de Caça</button>
              <button class="zone-subtab" data-zonetab="raids">🐉 Raids de Chefões Epicos</button>
            </div>

            <div id="zone-map-view" class="zone-view active">
              <div class="zone-list" id="zone-list"></div>
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
                  <button id="unlock-premium-pass-btn" class="inv-batch-btn gold-glow-btn" title="Ativar o Passe Premium com Gold do Jogo">👑 Ativar Passe Premium (100.000g)</button>
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
        <button id="offline-ok" class="action-btn action-btn--primary">Coletar Recompensas ⚔️</button>
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

    <!-- GM Admin Control Panel Modal -->
    <div id="admin-modal" class="modal">
      <div class="modal-content admin-modal-box">
        <div class="modal-header">
          <h2>🛡️ GM Admin Command Panel</h2>
          <button id="close-admin-modal-btn" class="modal-close-x">✕</button>
        </div>
        <div class="admin-grid">
          <!-- Section 1: Level & Stats Cheats -->
          <div class="admin-section">
            <h3>📊 Nível &amp; Atributos</h3>
            <div class="admin-btn-group">
              <button class="admin-btn" data-admin-cmd="level20">Set Level 20</button>
              <button class="admin-btn" data-admin-cmd="level40">Set Level 40</button>
              <button class="admin-btn" data-admin-cmd="level76">Set Level 76</button>
              <button class="admin-btn" data-admin-cmd="level85">Set Level 85</button>
              <button class="admin-btn" data-admin-cmd="add5levels">+5 Níveis</button>
            </div>
          </div>

          <!-- Section 2: Currency & Points -->
          <div class="admin-section">
            <h3>🪙 Ouro &amp; Skill Points</h3>
            <div class="admin-btn-group">
              <button class="admin-btn" data-admin-cmd="gold1m">+1.000.000 Gold</button>
              <button class="admin-btn" data-admin-cmd="gold10m">+10.000.000 Gold</button>
              <button class="admin-btn" data-admin-cmd="sp5k">+5.000 SP</button>
              <button class="admin-btn" data-admin-cmd="sp50k">+50.000 SP</button>
            </div>
          </div>

          <!-- Section 3: Item Spawner -->
          <div class="admin-section admin-spawner">
            <h3>🎁 Spawner de Itens</h3>
            <div class="spawner-fields">
              <select id="admin-item-select" class="admin-select"></select>
              <div class="spawner-row">
                <label>Qtd: <input type="number" id="admin-item-qty" value="1" min="1" max="999" class="admin-num-input" /></label>
                <label>Raridade: 
                  <select id="admin-item-rarity" class="admin-select">
                    <option value="common">Comum</option>
                    <option value="uncommon">Incomum</option>
                    <option value="rare">Raro</option>
                    <option value="epic">Épico (Roxo)</option>
                    <option value="legendary">Lendário (Dourado)</option>
                  </select>
                </label>
                <label>Encanto: 
                  <select id="admin-item-enchant" class="admin-select">
                    <option value="0">+0</option>
                    <option value="3">+3</option>
                    <option value="7">+7</option>
                    <option value="10">+10</option>
                    <option value="16">+16 (Máx)</option>
                  </select>
                </label>
                <label>Afixo: 
                  <select id="admin-item-affix" class="admin-select">
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
                    <option value="undead_dmg">✦ +% Dano vs Mortos-Vivos</option>
                    <option value="dragon_dmg">✦ +% Dano vs Dragões</option>
                    <option value="beast_dmg">✦ +% Dano vs Bestas</option>
                    <option value="demon_dmg">✦ +% Dano vs Demônios</option>
                    <option value="humanoid_dmg">✦ +% Dano vs Humanoides</option>
                  </select>
                </label>
              </div>
              <button id="admin-spawn-btn" class="admin-btn primary">✨ Gerar Item na Mochila</button>
            </div>
          </div>

          <!-- Section 4: Utility Cheats -->
          <div class="admin-section">
            <h3>⚡ Utilitários &amp; Deuses</h3>
            <div class="admin-btn-group">
              <button class="admin-btn" data-admin-cmd="godmode">🛡️ Invencibilidade (God Mode)</button>
              <button class="admin-btn" data-admin-cmd="healfull">❤️ Recuperar HP/MP Full</button>
              <button class="admin-btn" data-admin-cmd="autoequip">⚔️ Auto-Equipar Melhores</button>
              <button class="admin-btn danger" data-admin-cmd="resetsave">🗑️ Resetar Progresso</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Item Tooltip -->
    <div id="item-tooltip" class="item-tooltip"></div>

    <!-- Mobile Bottom Dock Navigation -->
    <nav class="mobile-bottom-nav">
      <button class="mobile-nav-btn active" data-tab="character"><span class="icon">👤</span><span>Hero</span></button>
      <button class="mobile-nav-btn" data-tab="inventory"><span class="icon">🎒</span><span>Mochila</span></button>
      <button class="mobile-nav-btn" data-tab="skills"><span class="icon">✦</span><span>Skills</span></button>
      <button class="mobile-nav-btn" data-tab="codex"><span class="icon">📜</span><span>Codex</span></button>
      <button class="mobile-nav-btn" data-tab="dolls"><span class="icon">🧸</span><span>Dolls</span></button>
      <button class="mobile-nav-btn" data-tab="magiclamp"><span class="icon">🪔</span><span>Lâmpada</span></button>
      <button class="mobile-nav-btn" data-tab="shop"><span class="icon">🛒</span><span>Loja</span></button>
    </nav>
  </div>
`;

