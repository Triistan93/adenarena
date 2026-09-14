/**
 * HuntingUI.js — Interface Completa da Profissão de Caça Silvestre & Curtume de Aden.
 * Estética: Dark Fantasy MMO Lineage II.
 */

import { el, qs } from '../core/DomHelpers.js';
import {
  HUNTING_ZONES,
  PREY_CATALOG,
  KNIVES_CATALOG,
  LURES_CATALOG,
  APPROACH_TACTICS,
  getHuntingZonesList,
  getHuntingXpForLevel
} from '../data/hunting.js';
import { HuntingService } from '../services/HuntingService.js';

export function renderHuntingUI(state) {
  if (!state) return;
  const container = el('tab-hunting') || qs('#tab-hunting, .tab-hunting');
  if (!container) return;

  const hState = HuntingService.getHuntingState(state);
  const playerLvl = Number(state.level) || 1;

  const skillLvl = hState.skillLevel || 1;
  const skillXp = hState.skillXp || 0;
  const nextLvlXp = getHuntingXpForLevel(skillLvl);
  const xpPct = Math.min(100, Math.floor((skillXp / nextLvlXp) * 100));

  const activeZoneId = hState.activeZone || 'zone_talking_forest';
  const activeZone = HUNTING_ZONES[activeZoneId] || HUNTING_ZONES.zone_talking_forest;

  const activeKnifeId = hState.knife || 'knife_none';
  const activeKnife = KNIVES_CATALOG[activeKnifeId] || KNIVES_CATALOG.knife_none;
  const knifeDurability = hState.knifeDurability?.[activeKnifeId] ?? 0;
  const maxKnifeDurability = activeKnife.durabilityMax || 50;
  const durPct = Math.min(100, Math.max(0, Math.floor((knifeDurability / maxKnifeDurability) * 100)));
  const isKnifeDull = knifeDurability <= 0;

  const activeLureId = hState.activeLure;
  const activeLure = activeLureId ? LURES_CATALOG[activeLureId] : null;
  const activeLureCount = activeLureId ? (hState.lureInventory?.[activeLureId] || 0) : 0;

  const speciesDiscovered = Object.keys(hState.huntingLog || {}).length;
  const totalSpecies = Object.keys(PREY_CATALOG).length;

  // 1. ZONAS DE CAÇA
  const zonesList = getHuntingZonesList();
  let zonesHtml = '';
  for (const z of zonesList) {
    const isUnlocked = playerLvl >= z.minLevel;
    const isSelected = z.id === activeZoneId;
    const reqLureDef = z.requiredLure ? LURES_CATALOG[z.requiredLure] : null;

    zonesHtml += `
      <div 
        onclick="${isUnlocked ? `window.selectHuntingZone('${z.id}')` : ''}"
        style="
          flex: 1 1 200px;
          min-width: 190px;
          background: ${isSelected ? 'linear-gradient(180deg, rgba(35,60,40,0.7), rgba(15,25,18,0.9))' : 'rgba(15,20,28,0.75)'};
          border: 1px solid ${isSelected ? '#34d399' : isUnlocked ? 'rgba(212,167,68,0.25)' : 'rgba(100,100,100,0.2)'};
          border-radius: 8px;
          padding: 10px;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          opacity: ${isUnlocked ? '1' : '0.55'};
          position: relative;
          transition: all 0.2s ease;
          box-shadow: ${isSelected ? '0 0 12px rgba(52,211,153,0.3)' : 'none'};
        "
      >
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-family:'Cinzel',serif; font-size:13px; color:${isSelected ? '#6ee7b7' : isUnlocked ? '#f4d58a' : '#888'};">
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
          <span>Atrativo: <strong style="color:#cbd5e1;">${reqLureDef ? reqLureDef.name : 'Qualquer'}</strong></span>
          <span style="color:#34d399; font-weight:bold;">${isSelected ? '● ACAMPAMENTO' : ''}</span>
        </div>
      </div>
    `;
  }

  // 2. FACAS DE ESFOLAR
  let knivesHtml = '';
  for (const [kId, kDef] of Object.entries(KNIVES_CATALOG)) {
    const isOwned = hState.knifeDurability?.[kId] !== undefined || kId === 'knife_none';
    const isEquipped = kId === activeKnifeId;
    const canUnlock = skillLvl >= kDef.minHuntingLevel;
    const canAfford = (state.gold || 0) >= kDef.buyPrice;

    let actionBtn = '';
    if (isEquipped) {
      actionBtn = `<span style="font-size:10px; color:#34d399; font-weight:bold; padding:4px 8px; border:1px solid #34d399; border-radius:4px; background:rgba(52,211,153,0.15);">EM USO</span>`;
    } else if (isOwned) {
      actionBtn = `
        <button 
          onclick="window.equipHuntingKnife('${kId}')"
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:pointer;"
        >
          EMPUNHAR
        </button>
      `;
    } else {
      actionBtn = `
        <button 
          onclick="window.buyHuntingKnife('${kId}')"
          ${(!canUnlock || !canAfford) ? 'disabled' : ''}
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:${canUnlock && canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(50,50,50,0.4)'}; border:1px solid ${canUnlock && canAfford ? '#ffe699' : '#555'}; color:${canUnlock && canAfford ? '#000' : '#777'}; border-radius:4px; cursor:${canUnlock && canAfford ? 'pointer' : 'not-allowed'};"
        >
          ${canUnlock ? `COMPRAR (${(kDef.buyPrice / 1000).toFixed(0)}k)` : `🔒 Nv. ${kDef.minHuntingLevel}`}
        </button>
      `;
    }

    knivesHtml += `
      <div style="background:rgba(20,24,35,0.7); border:1px solid ${isEquipped ? '#6ee7b7' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isEquipped ? '#6ee7b7' : '#f4d58a'};">${kDef.icon} ${kDef.name}</strong>
            <span style="font-size:9px; background:rgba(0,0,0,0.5); padding:1px 5px; border-radius:3px; color:#aaa; font-weight:bold;">[${kDef.grade.toUpperCase()}]</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            Durabilidade: ${kDef.durabilityMax} | Bônus Pele Perfeita: <strong style="color:#ffd877;">+${Math.round(kDef.perfectSkinBonus * 100)}%</strong>
          </div>
        </div>
        <div>
          ${actionBtn}
        </div>
      </div>
    `;
  }

  // 3. ATRATIVOS (ISCAS)
  let luresHtml = '';
  for (const [lId, lDef] of Object.entries(LURES_CATALOG)) {
    const count = hState.lureInventory?.[lId] || 0;
    const isSelected = lId === activeLureId;
    const canAfford = (state.gold || 0) >= lDef.buyPrice;

    luresHtml += `
      <div style="background:rgba(20,24,35,0.7); border:1px solid ${isSelected ? '#34d399' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isSelected ? '#6ee7b7' : '#f4d58a'};">${lDef.icon} ${lDef.name}</strong>
            <span style="font-size:10px; color:#ffd877; font-weight:bold;">x${count}</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            ${lDef.desc} (${lDef.buyPrice}g cada)
          </div>
        </div>
        <div style="display:flex; gap:4px; align-items:center;">
          <button 
            onclick="window.buyHuntingLure('${lId}', 10)"
            ${!canAfford ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
          >
            +10
          </button>
          <button 
            onclick="window.selectHuntingLure('${isSelected ? '' : lId}')"
            ${count <= 0 ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:${isSelected ? 'rgba(52,211,153,0.3)' : 'rgba(70,70,70,0.3)'}; border:1px solid ${isSelected ? '#34d399' : '#666'}; color:${isSelected ? '#6ee7b7' : count > 0 ? '#cbd5e1' : '#666'}; border-radius:4px; cursor:${count > 0 ? 'pointer' : 'not-allowed'};"
          >
            ${isSelected ? 'SELECIONADA' : 'USAR'}
          </button>
        </div>
      </div>
    `;
  }

  // 4. PALCO DE CAÇA (STAGE CENTRAL)
  let stageHtml = '';
  if (hState.isHunting && hState.trackedPreyId) {
    const prey = PREY_CATALOG[hState.trackedPreyId];
    const now = Date.now();
    const elapsed = now - (hState.trackStartTime || now);
    const needed = hState.trackDuration || 3000;
    const isReady = elapsed >= needed;
    const progressPct = Math.min(100, Math.floor((elapsed / needed) * 100));
    const activeTacticDef = APPROACH_TACTICS[hState.activeTactic] || APPROACH_TACTICS.ambush;

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(30,50,40,0.85) 0%, rgba(12,18,24,0.95) 100%); border:1px solid rgba(52,211,153,0.4); border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.7);">
        <div style="font-size:52px; margin-bottom:8px; animation:bounce 1.5s infinite;">
          ${prey?.icon || '🐾'}
        </div>
        <h3 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:18px;">
          ${prey?.name || 'Presa Rastreada'}
          <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(52,211,153,0.2); border:1px solid #34d399; color:#a7f3d0; margin-left:6px;">
            ${activeTacticDef.icon} ${activeTacticDef.name}
          </span>
        </h3>
        <p style="margin:0 0 12px 0; font-size:11px; color:#aaa;">
          Peso estimado: <strong style="color:#f4d58a;">${prey?.weightRange}</strong> | Rendimento: <strong style="color:#cbd5e1;">${prey?.skinYield?.primary?.toUpperCase()}</strong>
        </p>

        <!-- Barra de Progresso de Rastreio -->
        <div style="width:100%; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden; border:1px solid rgba(52,211,153,0.3); margin-bottom:16px;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #34d399, #10b981); transition:width 0.2s ease;"></div>
        </div>

        <div>
          <button 
            onclick="window.skinHuntingPrey()"
            ${!isReady ? 'disabled' : ''}
            style="
              padding: 10px 24px;
              font-family: 'Cinzel', serif;
              font-size: 14px;
              font-weight: bold;
              background: ${isReady ? 'linear-gradient(180deg, #34d399, #059669)' : 'rgba(50,60,50,0.5)'};
              border: 1px solid ${isReady ? '#6ee7b7' : '#444'};
              color: ${isReady ? '#000' : '#777'};
              border-radius: 8px;
              cursor: ${isReady ? 'pointer' : 'not-allowed'};
              box-shadow: ${isReady ? '0 0 16px rgba(52,211,153,0.5)' : 'none'};
              letter-spacing: 0.05em;
            "
          >
            ${isReady ? '🔪 ESFOLAR CARCAÇA' : '🐾 ENCURRALANDO A PRESA...'}
          </button>
        </div>
      </div>
    `;
  } else {
    let tacticsHtml = '';
    for (const [tId, tDef] of Object.entries(APPROACH_TACTICS)) {
      const isSelected = (hState.selectedTactic || 'ambush') === tId;
      tacticsHtml += `
        <button 
          onclick="window.selectHuntingTactic('${tId}')"
          style="
            flex: 1; min-width: 130px; padding: 6px 10px; border-radius: 6px; cursor: pointer; text-align: left;
            background: ${isSelected ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)'};
            border: 1px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.1)'};
            color: ${isSelected ? '#6ee7b7' : '#cbd5e1'};
            transition: all 0.2s ease;
          "
        >
          <div style="font-size: 11px; font-weight: bold; font-family:'Cinzel',serif;">${tDef.icon} ${tDef.name}</div>
          <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">${tDef.desc}</div>
        </button>
      `;
    }

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(20,30,42,0.85) 0%, rgba(10,14,20,0.95) 100%); border:1px solid rgba(212,167,68,0.3); border-radius:12px;">
        <div style="font-size:42px; margin-bottom:8px;">
          🏕️
        </div>
        <h3 style="margin:0 0 6px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:16px;">
          Acampamento em ${activeZone.name}
        </h3>
        <p style="margin:0 0 14px 0; font-size:11px; color:#aaa; max-width:400px; margin-left:auto; margin-right:auto; line-height:1.4;">
          ${activeZone.description} Escolha sua abordagem e rastreie feras para coletar insumos.
        </p>

        <!-- Táticas de Abordagem -->
        <div style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
          ${tacticsHtml}
        </div>

        <button 
          onclick="window.startHuntingTrack()"
          ${isKnifeDull ? 'disabled' : ''}
          style="
            padding: 12px 28px;
            font-family: 'Cinzel', serif;
            font-size: 14px;
            font-weight: bold;
            background: ${!isKnifeDull ? 'linear-gradient(180deg, #d4a744, #8a641c)' : 'rgba(60,50,40,0.5)'};
            border: 1px solid ${!isKnifeDull ? '#ffe699' : '#555'};
            color: ${!isKnifeDull ? '#000' : '#777'};
            border-radius: 8px;
            cursor: ${!isKnifeDull ? 'pointer' : 'not-allowed'};
            box-shadow: ${!isKnifeDull ? '0 0 16px rgba(212,167,68,0.4)' : 'none'};
            letter-spacing: 0.05em;
          "
        >
          ${isKnifeDull ? '⚠️ FACA CEGA (AFIAR PRIMEIRO)' : '🐾 RASTREAR PRESA'}
        </button>
      </div>
    `;
  }

  // 5. MERCADO DE CURTUME (FEIRA DE PELES)
  let curtumeHtml = '';
  for (const [pId, pDef] of Object.entries(PREY_CATALOG)) {
    const huntedCount = hState.huntingLog?.[pId] || 0;
    const canExchange = huntedCount >= pDef.exchangeRate;

    curtumeHtml += `
      <div style="background:rgba(18,22,32,0.8); border:1px solid rgba(212,167,68,0.2); border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:#f4d58a;">${pDef.icon} ${pDef.name}</strong>
            <span style="font-size:10px; color:#34d399; font-weight:bold;">Abates: ${huntedCount}x</span>
          </div>
          <div style="font-size:10px; color:#aaa; margin-top:2px;">
            Troca: <strong>${pDef.exchangeRate}x</strong> presas ➔ +1 <strong style="color:#ffd877;">${pDef.exchangeRewardName}</strong>
          </div>
        </div>
        <button 
          onclick="window.exchangeHuntingPelts('${pId}', 1)"
          ${!canExchange ? 'disabled' : ''}
          style="padding:5px 10px; font-size:10px; font-weight:bold; background:${canExchange ? 'rgba(52,211,153,0.2)' : 'rgba(50,50,50,0.3)'}; border:1px solid ${canExchange ? '#34d399' : '#555'}; color:${canExchange ? '#6ee7b7' : '#666'}; border-radius:4px; cursor:${canExchange ? 'pointer' : 'not-allowed'};"
        >
          CURTIR PELE
        </button>
      </div>
    `;
  }

  // AUTO-HUNT (AFK)
  const isAfkUnlocked = skillLvl >= 5;
  const isAfkActive = hState.autoHunting;

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(180deg, rgba(20,28,24,0.95), rgba(10,14,12,0.95)); border:1px solid rgba(52,211,153,0.35); border-radius:12px; padding:16px; margin-bottom:18px; box-shadow:0 4px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:20px; display:flex; align-items:center; gap:8px;">
              🐾 Profissão de Caça Silvestre & Curtume
            </h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
              Rastreie feras ancestrais pelos ermos de Aden, esfolando couros e ossos nobres para a Forja Imperial!
            </p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(52,211,153,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Nível de Caçador</div>
              <div style="font-size:16px; font-weight:bold; color:#6ee7b7; font-family:'Cinzel',serif;">Nv. ${skillLvl} / 30</div>
            </div>
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Bestiário Catalogado</div>
              <div style="font-size:16px; font-weight:bold; color:#f4d58a; font-family:'Cinzel',serif;">${speciesDiscovered} / ${totalSpecies}</div>
            </div>
          </div>
        </div>

        <!-- Barra de Maestria -->
        <div>
          <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
            <span>Progresso da Maestria: <strong style="color:#6ee7b7;">${skillXp.toLocaleString()} / ${nextLvlXp.toLocaleString()} XP</strong></span>
            <span>${xpPct}%</span>
          </div>
          <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(52,211,153,0.2);">
            <div style="width:${xpPct}%; height:100%; background:linear-gradient(90deg, #34d399, #10b981);"></div>
          </div>
        </div>
      </div>

      <!-- Zonas de Caça -->
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:6px;">
          🧭 Ermos & Acampamentos de Caça de Aden
        </h4>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          ${zonesHtml}
        </div>
      </div>

      <!-- Layout 2 Colunas: Ação & Ferramental -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <!-- Coluna Esquerda: Palco de Ação -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:15px;">
            🎯 Pista de Rastreamento & Esfolação
          </h4>
          ${stageHtml}

          <!-- Painel AFK -->
          <div style="margin-top:12px; background:rgba(18,22,32,0.85); border:1px solid rgba(52,211,153,0.25); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <strong style="font-size:13px; color:#f4d58a;">🐾 Caça Automática (AFK)</strong>
                <span style="font-size:10px; background:${isAfkUnlocked ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}; color:${isAfkUnlocked ? '#34d399' : '#fca5a5'}; padding:1px 6px; border-radius:4px; font-weight:bold;">
                  ${isAfkUnlocked ? 'DESBLOQUEADO' : 'NV. 5 CAÇA REQUERIDO'}
                </span>
              </div>
              <p style="margin:2px 0 0 0; font-size:10px; color:#aaa;">
                Rastreia e esfola presas automaticamente enquanto o jogo roda ou em segundo plano.
              </p>
            </div>
            <button 
              onclick="window.toggleAutoHunting()"
              ${!isAfkUnlocked ? 'disabled' : ''}
              style="
                padding: 8px 16px;
                font-family: 'Cinzel', serif;
                font-size: 11px;
                font-weight: bold;
                background: ${isAfkActive ? 'linear-gradient(180deg,#ef4444,#991b1b)' : isAfkUnlocked ? 'linear-gradient(180deg,#34d399,#059669)' : 'rgba(60,60,60,0.5)'};
                border: 1px solid ${isAfkActive ? '#fca5a5' : isAfkUnlocked ? '#6ee7b7' : '#555'};
                color: ${isAfkActive ? '#fff' : isAfkUnlocked ? '#000' : '#777'};
                border-radius: 6px;
                cursor: ${isAfkUnlocked ? 'pointer' : 'not-allowed'};
              "
            >
              ${isAfkActive ? '⏸️ PAUSAR AFK' : '▶️ ATIVAR AFK'}
            </button>
          </div>
        </div>

        <!-- Coluna Direita: Faca Atual & Durabilidade -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
            🔪 Faca Empunhada & Manutenção
          </h4>
          <div style="background:rgba(18,22,32,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong style="font-size:14px; color:#6ee7b7;">${activeKnife.icon} ${activeKnife.name}</strong>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${activeKnife.desc}</div>
              </div>
              <button 
                onclick="window.repairHuntingKnife('${activeKnifeId}')"
                ${!isKnifeDull && durPct >= 100 ? 'disabled' : ''}
                style="padding:6px 12px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#fbbf24,#b45309); border:1px solid #fde047; color:#000; border-radius:6px; cursor:pointer;"
              >
                🪨 AFIAR FACA
              </button>
            </div>

            <!-- Barra de Durabilidade -->
            <div style="margin-top:8px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
                <span>Fio da Lâmina: <strong style="color:${durPct > 20 ? '#34d399' : '#ef4444'};">${knifeDurability} / ${maxKnifeDurability}</strong></span>
                <span>${durPct}%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(212,167,68,0.2);">
                <div style="width:${durPct}%; height:100%; background:${durPct > 50 ? 'linear-gradient(90deg,#34d399,#10b981)' : durPct > 20 ? 'linear-gradient(90deg,#fbbf24,#d97706)' : 'linear-gradient(90deg,#ef4444,#b91c1c)'};"></div>
              </div>
            </div>
          </div>

          <!-- Arsenal de Facas -->
          <h5 style="margin:12px 0 6px 0; font-family:'Cinzel',serif; color:#ffd877; font-size:13px;">
            Oficina de Cutelaria (Coleção de Facas)
          </h5>
          <div style="max-height:180px; overflow-y:auto; padding-right:4px;">
            ${knivesHtml}
          </div>
        </div>
      </div>

      <!-- Seção Inferior: Atrativos & Curtume -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <!-- Atrativos -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
            🥩 Atrativos Silvestres (Iscas de Caça)
          </h4>
          <div style="max-height:220px; overflow-y:auto; padding-right:4px;">
            ${luresHtml}
          </div>
        </div>

        <!-- Feira de Peles / Curtume -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:15px;">
            💼 Mercado de Curtume (Troca de Peles por Materiais)
          </h4>
          <div style="max-height:220px; overflow-y:auto; padding-right:4px;">
            ${curtumeHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
