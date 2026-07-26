// The idle game's DOM, injected verbatim into a Shadow Root so its styles
// and IDs cannot collide with the 3D arena that shares the page.
export const IDLE_MARKUP = `
  <div id="game">
    <div class="ambient-layer" aria-hidden="true"></div>
    <div id="float-layer" class="float-layer" aria-hidden="true"></div>
    <!-- Top Bar -->
    <header class="top-bar">
      <span id="game-title">LINEAGE <em>IDLE</em></span>
      <div class="top-stats">
        <span class="ts-zone"><span class="ts-label">Zone</span><span id="zone-name">Talking Island</span></span>
        <span class="ts-clock"><span class="ts-label">Session</span><span id="clock">00:00:00</span></span>
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

      <!-- Center: live battle stage + combat ticker (compact & centered) -->
      <section class="panel log-panel center-panel">
        <div class="combat-controls-bar">
          <button id="soulshot-toggle-btn" class="combat-ctrl-btn" title="Ativar Soulshot no combate (+100% dano físico/mágico por golpe)">⚡ Soulshot: OFF</button>
          <button id="speed-toggle-btn" class="combat-ctrl-btn" title="Velocidade do combate (1x Normal ou 2x Turbo)">⏩ Velocidade: 1x</button>
        </div>
        <div class="stage" id="stage" data-state="idle">
          <div class="st-layer st-sky"></div>
          <div class="st-layer st-sun"></div>
          <div class="st-layer st-mountains"></div>
          <div class="st-layer st-trees"></div>
          <div class="st-layer st-ground"></div>
          <div class="st-layer st-embers" aria-hidden="true"></div>
          <div class="st-layer st-fog"></div>
          <div class="stage-zone" id="stage-zone">—</div>
          <div class="stage-vs" aria-hidden="true">&#9876;</div>
          <div class="stage-hero" id="stage-hero"></div>
          <div class="stage-monster" id="stage-monster">
            <div class="m-name" id="m-name"></div>
            <div class="m-hp"><div class="m-hp-fill" id="m-hp-fill"></div></div>
            <div class="m-art" id="m-art"></div>
          </div>
          <div class="stage-floats" id="stage-floats"></div>
        </div>
        <div id="log" class="log">
          <p class="log-entry system">Welcome to Lineage Idle.</p>
          <p class="log-entry system">Select your Race &amp; Class to begin.</p>
        </div>
      </section>

      <!-- Right: Main Menu Workspace (Expanded) -->
      <aside class="panel tabs-panel">
        <div class="tab-buttons">
          <button class="tab-btn active" data-tab="character">👤 Personagem</button>
          <button class="tab-btn" data-tab="equipment">⚔️ Equipamento</button>
          <button class="tab-btn" data-tab="skills">✦ Habilidades</button>
          <button class="tab-btn" data-tab="inventory">🎒 Inventário</button>
          <button class="tab-btn" data-tab="shop">🛒 Mercador</button>
          <button class="tab-btn" data-tab="craft">⚒️ Forja</button>
          <button class="tab-btn" data-tab="zones">🗺️ Caça</button>
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
            <div class="pane-section">
              <h3>Raça (Race)</h3>
              <div class="race-grid">
                <button class="race-btn" data-race="human">Human</button>
                <button class="race-btn" data-race="elf">Elf</button>
                <button class="race-btn" data-race="darkelf">Dark Elf</button>
                <button class="race-btn" data-race="orc">Orc</button>
                <button class="race-btn" data-race="dwarf">Dwarf</button>
                <button class="race-btn" data-race="kamael">Kamael</button>
                <button class="race-btn" data-race="ertheia">Ertheia</button>
              </div>
              <p class="race-desc">Select a race.</p>
            </div>
            <div class="pane-section">
              <h3>Classe (Class)</h3>
              <div class="class-grid" id="class-grid">
                <button class="class-btn" data-class="fighter">Fighter</button>
                <button class="class-btn" data-class="mage">Mage</button>
              </div>
              <p class="class-desc">Select a class.</p>
            </div>
            <div class="char-actions">
              <button id="save-btn" class="action-btn">Salvar Jogo</button>
              <button id="start-btn" class="action-btn action-btn--primary">Iniciar Saga</button>
              <button id="reset-btn" class="action-btn action-btn--danger">Reiniciar Personagem</button>
            </div>
          </div>

          <!-- Equipment Tab -->
          <div id="tab-equipment" class="tab-pane">
            <h3>Equipamentos Ativos</h3>
            <div class="equipment-workspace">
              <div class="paperdoll">
                <div class="doll-art" id="doll-art"></div>
                <div class="doll-slots equipment-grid">
                  <div class="equip-slot" data-slot="weapon"><span class="slot-label">⚔</span><span class="slot-item" id="equip-weapon">Empty</span></div>
                  <div class="equip-slot" data-slot="helmet"><span class="slot-label">⛑</span><span class="slot-item" id="equip-helmet">Empty</span></div>
                  <div class="equip-slot" data-slot="armor"><span class="slot-label">🛡</span><span class="slot-item" id="equip-armor">Empty</span></div>
                  <div class="equip-slot" data-slot="gloves"><span class="slot-label">🧤</span><span class="slot-item" id="equip-gloves">Empty</span></div>
                  <div class="equip-slot" data-slot="boots"><span class="slot-label">👢</span><span class="slot-item" id="equip-boots">Empty</span></div>
                  <div class="equip-slot" data-slot="ring"><span class="slot-label">💍</span><span class="slot-item" id="equip-ring">Empty</span></div>
                </div>
              </div>
              <div class="equip-details">
                <div class="equip-bonuses">
                  <h4>Bônus Conjuntos de Equipamentos</h4>
                  <div id="bonus-list"></div>
                </div>
                <button class="action-btn action-btn--ghost" id="unequip-all-btn">Desequipar Tudo</button>
              </div>
            </div>
          </div>

          <!-- Skills Tab -->
          <div id="tab-skills" class="tab-pane">
            <div class="skills-head">
              <h3>Árvore de Habilidades &amp; Talentos</h3>
              <span class="sp-pill"><span class="sp-icon">✦</span> <span id="sp-available">0</span> SP Disponível</span>
            </div>
            <div class="skills-body">
              <div class="skill-tree-scroll">
                <div class="skill-tree" id="skill-tree"></div>
              </div>
              <aside class="skill-info-panel" id="skill-info-panel"></aside>
            </div>
          </div>

          <!-- Inventory Tab -->
          <div id="tab-inventory" class="tab-pane">
            <div class="inv-tab-header">
              <h3>Mochila &amp; Inventário</h3>
              <div class="inv-summary">
                <span class="inv-badge">Slots: <span id="inv-slots">0/50</span></span>
                <span class="inv-badge gold">Ouro: <span id="gold-text">0</span>g</span>
              </div>
            </div>

            <div class="inv-filter-container">
              <!-- Slot Filter -->
              <div class="inv-filter-row">
                <span class="filter-label">Tipo:</span>
                <div class="inv-filters">
                  <button class="filter-btn active" data-filter="all">Todos</button>
                  <button class="filter-btn" data-filter="weapon">⚔️ Armas</button>
                  <button class="filter-btn" data-filter="armor">🛡️ Armaduras</button>
                  <button class="filter-btn" data-filter="helmet">⛑️ Capacetes</button>
                  <button class="filter-btn" data-filter="boots">👢 Botas</button>
                  <button class="filter-btn" data-filter="gloves">🧤 Luvas</button>
                  <button class="filter-btn" data-filter="ring">💍 Anéis</button>
                  <button class="filter-btn" data-filter="consumable">🧪 Consumíveis</button>
                  <button class="filter-btn" data-filter="material">💎 Materiais</button>
                </div>
              </div>

              <!-- Rarity & Equip Filter Row -->
              <div class="inv-filter-row inv-subfilters">
                <div class="filter-group">
                  <span class="filter-label">Raridade:</span>
                  <div class="rarity-filters">
                    <button class="rarity-filter-btn active" data-rarity="all">Todas</button>
                    <button class="rarity-filter-btn r-common" data-rarity="common">Comum</button>
                    <button class="rarity-filter-btn r-uncommon" data-rarity="uncommon">Incomum</button>
                    <button class="rarity-filter-btn r-rare" data-rarity="rare">Raro</button>
                    <button class="rarity-filter-btn r-epic" data-rarity="epic">Épico</button>
                    <button class="rarity-filter-btn r-legendary" data-rarity="legendary">Lendário</button>
                  </div>
                </div>

                <div class="filter-group">
                  <span class="filter-label">Estado:</span>
                  <div class="equip-filters">
                    <button class="equip-filter-btn active" data-equipfilter="all">Todos</button>
                    <button class="equip-filter-btn" data-equipfilter="equipped">Equipados</button>
                    <button class="equip-filter-btn" data-equipfilter="bag">No Alforge</button>
                  </div>
                </div>
              </div>

              <!-- Batch Actions Row -->
              <div class="inv-filter-row inv-batch-actions">
                <span class="filter-label">Ações em Lote:</span>
                <div class="batch-btn-group">
                  <button id="sell-commons-btn" class="inv-batch-btn" title="Vender todos os itens comuns não equipados">💰 Vender Comuns</button>
                  <button id="salvage-commons-btn" class="inv-batch-btn" title="Desmontar todos os equipamentos comuns em materiais">🔨 Desmontar Comuns</button>
                </div>
              </div>
            </div>

            <div class="inventory-grid" id="inventory-grid"></div>
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

          <!-- Craft & Enchant Tab -->
          <div id="tab-craft" class="tab-pane">
            <div class="craft-head">
              <h3>Forja &amp; Encantamento (+1 a +16)</h3>
              <p class="stat-value">Nível de Forja: <span id="craft-level">1</span></p>
            </div>
            
            <div class="craft-subtabs">
              <button class="craft-subtab active" data-crafttab="recipes">⚒️ Receitas de Criação</button>
              <button class="craft-subtab" data-crafttab="enchant">✨ Encantar Equipamento</button>
            </div>

            <div id="craft-recipes-view" class="craft-view active">
              <p class="shop-info">Combine materiais para forjar armas e armaduras poderosas.</p>
              <div class="craft-list" id="craft-list"></div>
            </div>

            <div id="craft-enchant-view" class="craft-view">
              <p class="shop-info">Encante seus equipamentos usando Pergaminhos de Encantamento (+10% status por +1).</p>
              <div class="enchant-workspace" id="enchant-workspace"></div>
            </div>
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

    <!-- Item Tooltip -->
    <div id="item-tooltip" class="item-tooltip"></div>
  </div>
`;

