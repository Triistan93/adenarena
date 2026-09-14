/**
 * MiningUI.js — Interface Completa da Profissão de Mineração de Aden.
 * Estética: Dark Fantasy MMO Lineage II.
 */

import { el, qs } from '../core/DomHelpers.js';
import {
  MINING_ZONES,
  MINERAL_NODES_CATALOG,
  PICKAXES_CATALOG,
  LAMPS_CATALOG,
  MINING_TACTICS,
  getMiningZonesList
} from '../data/mining.js';
import { MiningService } from '../services/lifeActivities/MiningService.js';
import { LIFE_ACTIVITY_LEVEL_TABLE } from '../services/lifeActivities/LifeActivityCore.js';

export function renderMiningUI(state) {
  if (!state) return;
  const container = el('tab-mining') || qs('#tab-mining, .tab-mining');
  if (!container) return;

  const mState = MiningService.getMiningState(state);
  const playerLvl = Number(state.level) || 1;

  const actState = state.lifeActivities?.mining || { level: 1, xp: 0 };
  const skillLvl = actState.level || mState.skillLevel || 1;
  const skillXp = actState.xp || mState.skillXp || 0;
  const nextLvlXp = LIFE_ACTIVITY_LEVEL_TABLE[skillLvl + 1] || (skillLvl * skillLvl * 50);
  const currentLvlBaseXp = LIFE_ACTIVITY_LEVEL_TABLE[skillLvl] || 0;
  const xpInTier = Math.max(0, skillXp - currentLvlBaseXp);
  const xpNeededInTier = Math.max(1, nextLvlXp - currentLvlBaseXp);
  const xpPct = Math.min(100, Math.floor((xpInTier / xpNeededInTier) * 100));

  const activeZoneId = mState.activeZone || 'zone_abandoned_coal';
  const activeZone = MINING_ZONES[activeZoneId] || MINING_ZONES.zone_abandoned_coal;

  const activePickaxeId = mState.pickaxe || 'pickaxe_none';
  const activePickaxe = PICKAXES_CATALOG[activePickaxeId] || PICKAXES_CATALOG.pickaxe_none;
  const pickaxeDurability = mState.pickaxeDurability?.[activePickaxeId] ?? 0;
  const maxPickaxeDurability = activePickaxe.durabilityMax || 50;
  const durPct = Math.min(100, Math.max(0, Math.floor((pickaxeDurability / maxPickaxeDurability) * 100)));
  const isPickaxeDull = pickaxeDurability <= 0;

  const activeLampId = mState.activeLamp;
  const activeLamp = activeLampId ? LAMPS_CATALOG[activeLampId] : null;

  const speciesDiscovered = Object.keys(mState.miningLog || {}).length;
  const totalSpecies = Object.keys(MINERAL_NODES_CATALOG).length;

  // 1. ZONAS DE MINERAÇÃO
  const zonesList = getMiningZonesList();
  let zonesHtml = '';
  for (const z of zonesList) {
    const isUnlocked = playerLvl >= z.minLevel;
    const isSelected = z.id === activeZoneId;
    const reqLampDef = z.requiredLamp ? LAMPS_CATALOG[z.requiredLamp] : null;

    zonesHtml += `
      <div 
        onclick="${isUnlocked ? `window.selectMiningZone('${z.id}')` : ''}"
        style="
          flex: 1 1 190px;
          min-width: 180px;
          background: ${isSelected ? 'linear-gradient(180deg, rgba(60,40,20,0.75), rgba(25,15,10,0.9))' : 'rgba(25,20,18,0.75)'};
          border: 1px solid ${isSelected ? '#f59e0b' : isUnlocked ? 'rgba(212,167,68,0.25)' : 'rgba(100,100,100,0.2)'};
          border-radius: 8px;
          padding: 10px;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          opacity: ${isUnlocked ? '1' : '0.55'};
          position: relative;
          transition: all 0.2s ease;
          box-shadow: ${isSelected ? '0 0 12px rgba(245,158,11,0.3)' : 'none'};
        "
      >
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-family:'Cinzel',serif; font-size:13px; color:${isSelected ? '#fbbf24' : isUnlocked ? '#f4d58a' : '#888'};">
            ${z.icon} ${z.name}
          </strong>
          <span style="font-size:10px; color:${isUnlocked ? '#ffd877' : '#ef4444'}; font-weight:bold;">
            ${isUnlocked ? '★'.repeat(z.difficulty) : `🔒 Lv. ${z.minLevel}`}
          </span>
        </div>
        <p style="font-size:11px; color:#94a3b8; margin:0 0 6px 0; line-height:1.3;">
          ${z.description}
        </p>
        <div style="display:flex; justify-content:space-between; font-size:10px; color:#aaa;">
          <span>Lanterna: <strong style="color:#cbd5e1;">${reqLampDef ? reqLampDef.name : 'Qualquer'}</strong></span>
          <span style="color:#f59e0b; font-weight:bold;">${isSelected ? '● ATUAL' : ''}</span>
        </div>
      </div>
    `;
  }

  // 2. PICARETAS
  let pickaxesHtml = '';
  for (const [pId, pDef] of Object.entries(PICKAXES_CATALOG)) {
    const isOwned = mState.pickaxeDurability?.[pId] !== undefined || pId === 'pickaxe_none';
    const isEquipped = pId === activePickaxeId;
    const canUnlock = skillLvl >= pDef.minMiningLevel;
    const canAfford = (state.gold || 0) >= pDef.buyPrice;

    let actionBtn = '';
    if (isEquipped) {
      actionBtn = `<span style="font-size:10px; color:#34d399; font-weight:bold; padding:4px 8px; border:1px solid #34d399; border-radius:4px; background:rgba(52,211,153,0.15);">EM USO</span>`;
    } else if (isOwned) {
      actionBtn = `
        <button 
          onclick="window.equipMiningPickaxe('${pId}')"
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:pointer;"
        >
          EMPUNHAR
        </button>
      `;
    } else {
      actionBtn = `
        <button 
          onclick="window.buyMiningPickaxe('${pId}')"
          ${(!canUnlock || !canAfford) ? 'disabled' : ''}
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:${canUnlock && canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(50,50,50,0.4)'}; border:1px solid ${canUnlock && canAfford ? '#ffe699' : '#555'}; color:${canUnlock && canAfford ? '#000' : '#777'}; border-radius:4px; cursor:${canUnlock && canAfford ? 'pointer' : 'not-allowed'};"
        >
          ${canUnlock ? `COMPRAR (${(pDef.buyPrice / 1000).toFixed(0)}k)` : `🔒 Nv. ${pDef.minMiningLevel}`}
        </button>
      `;
    }

    pickaxesHtml += `
      <div style="background:rgba(24,20,18,0.7); border:1px solid ${isEquipped ? '#fbbf24' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isEquipped ? '#fbbf24' : '#f4d58a'};">${pDef.icon} ${pDef.name}</strong>
            <span style="font-size:9px; background:rgba(0,0,0,0.5); padding:1px 5px; border-radius:3px; color:#aaa; font-weight:bold;">[${pDef.grade.toUpperCase()}]</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            Durabilidade: ${pDef.durabilityMax} | Bônus Pureza: <strong style="color:#ffd877;">+${Math.round(pDef.qualityBonus * 100)}%</strong>
          </div>
        </div>
        <div>
          ${actionBtn}
        </div>
      </div>
    `;
  }

  // 3. LAMPARINAS & LANTERNAS
  let lampsHtml = '';
  for (const [lId, lDef] of Object.entries(LAMPS_CATALOG)) {
    const count = mState.lampInventory?.[lId] || 0;
    const isSelected = lId === activeLampId;
    const canAfford = (state.gold || 0) >= lDef.buyPrice;

    lampsHtml += `
      <div style="background:rgba(24,20,18,0.7); border:1px solid ${isSelected ? '#f59e0b' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isSelected ? '#fbbf24' : '#f4d58a'};">${lDef.icon} ${lDef.name}</strong>
            <span style="font-size:10px; color:#ffd877; font-weight:bold;">x${count}</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            ${lDef.desc} (${lDef.buyPrice}g cada)
          </div>
        </div>
        <div style="display:flex; gap:4px; align-items:center;">
          <button 
            onclick="window.buyMiningLamp('${lId}', 10)"
            ${!canAfford ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
          >
            +10
          </button>
          <button 
            onclick="window.selectMiningLamp('${isSelected ? '' : lId}')"
            ${count <= 0 ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:${isSelected ? 'rgba(245,158,11,0.3)' : 'rgba(70,70,70,0.3)'}; border:1px solid ${isSelected ? '#f59e0b' : '#666'}; color:${isSelected ? '#fbbf24' : count > 0 ? '#cbd5e1' : '#666'}; border-radius:4px; cursor:${count > 0 ? 'pointer' : 'not-allowed'};"
          >
            ${isSelected ? 'ACESA' : 'EQUIPAR'}
          </button>
        </div>
      </div>
    `;
  }

  // 4. PALCO DE MINERAÇÃO (STAGE CENTRAL)
  let stageHtml = '';
  if (mState.isMining && mState.targetedNodeId) {
    const node = MINERAL_NODES_CATALOG[mState.targetedNodeId];
    const now = Date.now();
    const elapsed = now - (mState.mineStartTime || now);
    const needed = mState.mineDuration || 3300;
    const isReady = elapsed >= needed;
    const progressPct = Math.min(100, Math.floor((elapsed / needed) * 100));
    const activeTacticDef = MINING_TACTICS[mState.activeTactic] || MINING_TACTICS.standard;

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(50,30,15,0.85) 0%, rgba(18,12,10,0.95) 100%); border:1px solid rgba(245,158,11,0.4); border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.7);">
        <div style="font-size:52px; margin-bottom:8px; animation:bounce 1.5s infinite;">
          ${node?.icon || '⛏️'}
        </div>
        <h3 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#fbbf24; font-size:18px;">
          ${node?.name || 'Veio Mineral Localizado'}
          <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(245,158,11,0.2); border:1px solid #f59e0b; color:#fde68a; margin-left:6px;">
            ${activeTacticDef.icon} ${activeTacticDef.name}
          </span>
        </h3>
        <p style="margin:0 0 12px 0; font-size:11px; color:#aaa;">
          Minérios: <strong style="color:#cbd5e1;">${node?.yields?.primary?.toUpperCase()}</strong> ${node?.yields?.secondary ? `+ <strong style="color:#94a3b8;">${node?.yields?.secondary?.toUpperCase()}</strong>` : ''}
        </p>

        <!-- Barra de Progresso de Escavação -->
        <div style="width:100%; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden; border:1px solid rgba(245,158,11,0.3); margin-bottom:16px;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #f59e0b, #d97706); transition:width 0.2s ease;"></div>
        </div>

        <div>
          <button 
            onclick="window.finishMiningHarvest()"
            ${!isReady ? 'disabled' : ''}
            style="
              padding: 10px 24px;
              font-family: 'Cinzel', serif;
              font-size: 14px;
              font-weight: bold;
              background: ${isReady ? 'linear-gradient(180deg, #f59e0b, #b45309)' : 'rgba(50,40,30,0.5)'};
              border: 1px solid ${isReady ? '#fde68a' : '#444'};
              color: ${isReady ? '#000' : '#777'};
              border-radius: 8px;
              cursor: ${isReady ? 'pointer' : 'not-allowed'};
              box-shadow: ${isReady ? '0 0 16px rgba(245,158,11,0.5)' : 'none'};
              letter-spacing: 0.05em;
            "
          >
            ${isReady ? '⛏️ EXTRAIR MINÉRIOS' : '🪨 QUEBRANDO A ROCHA...'}
          </button>
        </div>
      </div>
    `;
  } else {
    let tacticsHtml = '';
    for (const [tId, tDef] of Object.entries(MINING_TACTICS)) {
      const isSelected = (mState.selectedTactic || 'standard') === tId;
      tacticsHtml += `
        <button 
          onclick="window.selectMiningTactic('${tId}')"
          style="
            flex: 1; min-width: 130px; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-align: left;
            background: ${isSelected ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'};
            border: 1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.1)'};
            color: ${isSelected ? '#fbbf24' : '#cbd5e1'};
            transition: all 0.2s ease;
          "
        >
          <div style="font-size: 11px; font-weight: bold; font-family:'Cinzel',serif;">${tDef.icon} ${tDef.name}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${tDef.desc}</div>
        </button>
      `;
    }

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(35,20,12,0.85) 0%, rgba(15,10,8,0.95) 100%); border:1px solid rgba(212,167,68,0.3); border-radius:12px;">
        <div style="font-size:42px; margin-bottom:8px;">
          ⚒️
        </div>
        <h3 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:16px;">
          Frente de Extração em ${activeZone.name}
        </h3>
        <p style="margin:0 0 14px 0; font-size:11px; color:#aaa; max-width:400px; margin-left:auto; margin-right:auto; line-height:1.4;">
          ${activeZone.description} Escolha a intensidade do golpe de picareta e extraia minérios preciosos.
        </p>

        <!-- Táticas de Mineração -->
        <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
          ${tacticsHtml}
        </div>

        <button 
          onclick="window.startMiningHarvest()"
          ${isPickaxeDull ? 'disabled' : ''}
          style="
            padding: 12px 28px;
            font-family: 'Cinzel', serif;
            font-size: 14px;
            font-weight: bold;
            background: ${!isPickaxeDull ? 'linear-gradient(180deg, #d4a744, #8a641c)' : 'rgba(60,50,40,0.5)'};
            border: 1px solid ${!isPickaxeDull ? '#ffe699' : '#555'};
            color: ${!isPickaxeDull ? '#000' : '#777'};
            border-radius: 8px;
            cursor: ${!isPickaxeDull ? 'pointer' : 'not-allowed'};
            box-shadow: ${!isPickaxeDull ? '0 0 16px rgba(212,167,68,0.4)' : 'none'};
            letter-spacing: 0.05em;
          "
        >
          ${isPickaxeDull ? '⚠️ PICARETA CEGA (REFORJAR PRIMEIRO)' : '⛏️ ESCAVAR VEIO'}
        </button>
      </div>
    `;
  }

  const isAfkUnlocked = skillLvl >= 5;
  const isAfkActive = mState.autoMining;

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(180deg, rgba(35,20,12,0.95), rgba(15,8,6,0.95)); border:1px solid rgba(245,158,11,0.35); border-radius:12px; padding:16px; margin-bottom:18px; box-shadow:0 4px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; font-family:'Cinzel',serif; color:#fbbf24; font-size:20px; display:flex; align-items:center; gap:8px;">
              ⛏️ Corporação de Mineração dos Anões de Aden
            </h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
              Desça aos subterrâneos mais profundos, parta rochas ancestrais e extraia Ferro, Prata, Mithril, Oriharukon e Adamantite!
            </p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Nível de Mineiro</div>
              <div style="font-size:16px; font-weight:bold; color:#fbbf24; font-family:'Cinzel',serif;">Nv. ${skillLvl} / 40</div>
            </div>
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Veios Catalogados</div>
              <div style="font-size:16px; font-weight:bold; color:#f4d58a; font-family:'Cinzel',serif;">${speciesDiscovered} / ${totalSpecies}</div>
            </div>
          </div>
        </div>

        <!-- Barra de Maestria -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
            <span>Progresso da Maestria: <strong style="color:#fbbf24;">${skillXp.toLocaleString()} / ${nextLvlXp.toLocaleString()} XP</strong></span>
            <span>${xpPct}%</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(245,158,11,0.2);">
            <div style="width:${xpPct}%; height:100%; background:linear-gradient(90deg, #f59e0b, #d97706);"></div>
          </div>
        </div>
      </div>

      <!-- Zonas de Mineração -->
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:6px;">
          🧭 Galerias & Jazidas Minerais de Aden
        </h4>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${zonesHtml}
        </div>
      </div>

      <!-- Layout 2 Colunas: Ação & Ferramental -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <!-- Coluna Esquerda: Palco de Ação -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#fbbf24; font-size:15px;">
            ⛏️ Frente de Lavra & Extração
          </h4>
          ${stageHtml}

          <!-- Painel AFK -->
          <div style="margin-top:12px; background:rgba(24,20,18,0.85); border:1px solid rgba(245,158,11,0.25); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <strong style="font-size:13px; color:#f4d58a;">⛏️ Mineração Automática (AFK)</strong>
                <span style="font-size:10px; background:${isAfkUnlocked ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}; color:${isAfkUnlocked ? '#fbbf24' : '#fca5a5'}; padding:1px 6px; border-radius:4px; font-weight:bold;">
                  ${isAfkUnlocked ? 'DESBLOQUEADO' : 'NV. 5 MINERAÇÃO REQUERIDO'}
                </span>
              </div>
              <p style="margin:2px 0 0 0; font-size:10px; color:#aaa;">
                Extrai minérios pesados continuamente enquanto o jogo roda ou em segundo plano.
              </p>
            </div>
            <button 
              onclick="window.toggleAutoMining()"
              ${!isAfkUnlocked ? 'disabled' : ''}
              style="
                padding: 8px 16px;
                font-family: 'Cinzel', serif;
                font-size: 11px;
                font-weight: bold;
                background: ${isAfkActive ? 'linear-gradient(180deg,#ef4444,#991b1b)' : isAfkUnlocked ? 'linear-gradient(180deg,#f59e0b,#b45309)' : 'rgba(60,60,60,0.5)'};
                border: 1px solid ${isAfkActive ? '#fca5a5' : isAfkUnlocked ? '#fde68a' : '#555'};
                color: ${isAfkActive ? '#fff' : isAfkUnlocked ? '#000' : '#777'};
                border-radius: 6px;
                cursor: ${isAfkUnlocked ? 'pointer' : 'not-allowed'};
              "
            >
              ${isAfkActive ? '⏸️ PAUSAR AFK' : '▶️ ATIVAR AFK'}
            </button>
          </div>
        </div>

        <!-- Coluna Direita: Picareta Atual & Manutenção -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
            ⛏️ Picareta de Mineração & Manutenção
          </h4>
          <div style="background:rgba(24,20,18,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong style="font-size:14px; color:#fbbf24;">${activePickaxe.icon} ${activePickaxe.name}</strong>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${activePickaxe.desc}</div>
              </div>
              <button 
                onclick="window.repairMiningPickaxe('${activePickaxeId}')"
                ${!isPickaxeDull && durPct >= 100 ? 'disabled' : ''}
                style="padding:6px 12px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#fbbf24,#b45309); border:1px solid #fde047; color:#000; border-radius:6px; cursor:pointer;"
              >
                ⚒️ REFORJAR PONTA
              </button>
            </div>

            <!-- Barra de Durabilidade -->
            <div style="margin-top:8px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
                <span>Fio da Broca: <strong style="color:${durPct > 20 ? '#34d399' : '#ef4444'};">${pickaxeDurability} / ${maxPickaxeDurability}</strong></span>
                <span>${durPct}%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(212,167,68,0.2);">
                <div style="width:${durPct}%; height:100%; background:${durPct > 50 ? 'linear-gradient(90deg,#34d399,#10b981)' : durPct > 20 ? 'linear-gradient(90deg,#fbbf24,#d97706)' : 'linear-gradient(90deg,#ef4444,#b91c1c)'};"></div>
              </div>
            </div>
          </div>

          <!-- Arsenal de Picaretas -->
          <h5 style="margin:12px 0 6px 0; font-family:'Cinzel',serif; color:#ffd877; font-size:13px;">
            Ferraria dos Anões (Coleção de Picaretas)
          </h5>
          <div style="max-height:180px; overflow-y:auto; padding-right:4px;">
            ${pickaxesHtml}
          </div>
        </div>
      </div>

      <!-- Seção Inferior: Lamparinas & Lanternas de Galeria -->
      <div style="background:rgba(24,20,18,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🏮 Lamparinas & Lanternas de Galeria Subterrânea
        </h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
          ${lampsHtml}
        </div>
      </div>
    </div>
  `;
}
