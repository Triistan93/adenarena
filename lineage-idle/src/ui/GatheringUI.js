/**
 * GatheringUI.js — Interface Completa da Profissão de Coleta Botânica & Flora de Aden.
 * Estética: Dark Fantasy MMO Lineage II.
 */

import { el, qs } from '../core/DomHelpers.js';
import {
  GATHERING_ZONES,
  FLORA_NODES_CATALOG,
  SICKLES_CATALOG,
  POUCHES_CATALOG,
  GATHERING_TACTICS,
  getGatheringZonesList
} from '../data/gathering.js';
import { GatheringService } from '../services/lifeActivities/GatheringService.js';
import { LIFE_ACTIVITY_LEVEL_TABLE } from '../services/lifeActivities/LifeActivityCore.js';

export function renderGatheringUI(state) {
  if (!state) return;
  const container = el('tab-gathering') || qs('#tab-gathering, .tab-gathering');
  if (!container) return;

  const gState = GatheringService.getGatheringState(state);
  const playerLvl = Number(state.level) || 1;

  const actState = state.lifeActivities?.gathering || { level: 1, xp: 0 };
  const skillLvl = actState.level || gState.skillLevel || 1;
  const skillXp = actState.xp || gState.skillXp || 0;
  const nextLvlXp = LIFE_ACTIVITY_LEVEL_TABLE[skillLvl + 1] || (skillLvl * skillLvl * 50);
  const currentLvlBaseXp = LIFE_ACTIVITY_LEVEL_TABLE[skillLvl] || 0;
  const xpInTier = Math.max(0, skillXp - currentLvlBaseXp);
  const xpNeededInTier = Math.max(1, nextLvlXp - currentLvlBaseXp);
  const xpPct = Math.min(100, Math.floor((xpInTier / xpNeededInTier) * 100));

  const activeZoneId = gState.activeZone || 'zone_gludio_fields';
  const activeZone = GATHERING_ZONES[activeZoneId] || GATHERING_ZONES.zone_gludio_fields;

  const activeSickleId = gState.sickle || 'sickle_none';
  const activeSickle = SICKLES_CATALOG[activeSickleId] || SICKLES_CATALOG.sickle_none;
  const sickleDurability = gState.sickleDurability?.[activeSickleId] ?? 0;
  const maxSickleDurability = activeSickle.durabilityMax || 50;
  const durPct = Math.min(100, Math.max(0, Math.floor((sickleDurability / maxSickleDurability) * 100)));
  const isSickleDull = sickleDurability <= 0;

  const activePouchId = gState.activePouch;
  const activePouch = activePouchId ? POUCHES_CATALOG[activePouchId] : null;

  const speciesDiscovered = Object.keys(gState.gatheringLog || {}).length;
  const totalSpecies = Object.keys(FLORA_NODES_CATALOG).length;

  // 1. ZONAS DE COLETA
  const zonesList = getGatheringZonesList();
  let zonesHtml = '';
  for (const z of zonesList) {
    const isUnlocked = playerLvl >= z.minLevel;
    const isSelected = z.id === activeZoneId;
    const reqPouchDef = z.requiredPouch ? POUCHES_CATALOG[z.requiredPouch] : null;

    zonesHtml += `
      <div 
        onclick="${isUnlocked ? `window.selectGatheringZone('${z.id}')` : ''}"
        style="
          flex: 1 1 190px;
          min-width: 180px;
          background: ${isSelected ? 'linear-gradient(180deg, rgba(20,55,35,0.75), rgba(10,25,18,0.9))' : 'rgba(15,22,28,0.75)'};
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
          <span>Cesto: <strong style="color:#cbd5e1;">${reqPouchDef ? reqPouchDef.name : 'Qualquer'}</strong></span>
          <span style="color:#34d399; font-weight:bold;">${isSelected ? '● ATUAL' : ''}</span>
        </div>
      </div>
    `;
  }

  // 2. FOICES DE PODA
  let sicklesHtml = '';
  for (const [sId, sDef] of Object.entries(SICKLES_CATALOG)) {
    const isOwned = gState.sickleDurability?.[sId] !== undefined || sId === 'sickle_none';
    const isEquipped = sId === activeSickleId;
    const canUnlock = skillLvl >= sDef.minGatheringLevel;
    const canAfford = (state.gold || 0) >= sDef.buyPrice;

    let actionBtn = '';
    if (isEquipped) {
      actionBtn = `<span style="font-size:10px; color:#34d399; font-weight:bold; padding:4px 8px; border:1px solid #34d399; border-radius:4px; background:rgba(52,211,153,0.15);">EM USO</span>`;
    } else if (isOwned) {
      actionBtn = `
        <button 
          onclick="window.equipGatheringSickle('${sId}')"
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:pointer;"
        >
          EMPUNHAR
        </button>
      `;
    } else {
      actionBtn = `
        <button 
          onclick="window.buyGatheringSickle('${sId}')"
          ${(!canUnlock || !canAfford) ? 'disabled' : ''}
          style="padding:4px 10px; font-size:10px; font-weight:bold; background:${canUnlock && canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(50,50,50,0.4)'}; border:1px solid ${canUnlock && canAfford ? '#ffe699' : '#555'}; color:${canUnlock && canAfford ? '#000' : '#777'}; border-radius:4px; cursor:${canUnlock && canAfford ? 'pointer' : 'not-allowed'};"
        >
          ${canUnlock ? `COMPRAR (${(sDef.buyPrice / 1000).toFixed(0)}k)` : `🔒 Nv. ${sDef.minGatheringLevel}`}
        </button>
      `;
    }

    sicklesHtml += `
      <div style="background:rgba(20,24,35,0.7); border:1px solid ${isEquipped ? '#6ee7b7' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div>
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isEquipped ? '#6ee7b7' : '#f4d58a'};">${sDef.icon} ${sDef.name}</strong>
            <span style="font-size:9px; background:rgba(0,0,0,0.5); padding:1px 5px; border-radius:3px; color:#aaa; font-weight:bold;">[${sDef.grade.toUpperCase()}]</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            Durabilidade: ${sDef.durabilityMax} | Bônus Pureza: <strong style="color:#ffd877;">+${Math.round(sDef.qualityBonus * 100)}%</strong>
          </div>
        </div>
        <div>
          ${actionBtn}
        </div>
      </div>
    `;
  }

  // 3. CESTOS & BOLSAS (ISCAS BOTÂNICAS)
  let pouchesHtml = '';
  for (const [pId, pDef] of Object.entries(POUCHES_CATALOG)) {
    const count = gState.pouchInventory?.[pId] || 0;
    const isSelected = pId === activePouchId;
    const canAfford = (state.gold || 0) >= pDef.buyPrice;

    pouchesHtml += `
      <div style="background:rgba(20,24,35,0.7); border:1px solid ${isSelected ? '#34d399' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px 10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:6px;">
            <strong style="font-size:12px; color:${isSelected ? '#6ee7b7' : '#f4d58a'};">${pDef.icon} ${pDef.name}</strong>
            <span style="font-size:10px; color:#ffd877; font-weight:bold;">x${count}</span>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">
            ${pDef.desc} (${pDef.buyPrice}g cada)
          </div>
        </div>
        <div style="display:flex; gap:4px; align-items:center;">
          <button 
            onclick="window.buyGatheringPouch('${pId}', 10)"
            ${!canAfford ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.2); border:1px solid #d4a744; color:#ffd877; border-radius:4px; cursor:${canAfford ? 'pointer' : 'not-allowed'};"
          >
            +10
          </button>
          <button 
            onclick="window.selectGatheringPouch('${isSelected ? '' : pId}')"
            ${count <= 0 ? 'disabled' : ''}
            style="padding:4px 8px; font-size:10px; font-weight:bold; background:${isSelected ? 'rgba(52,211,153,0.3)' : 'rgba(70,70,70,0.3)'}; border:1px solid ${isSelected ? '#34d399' : '#666'}; color:${isSelected ? '#6ee7b7' : count > 0 ? '#cbd5e1' : '#666'}; border-radius:4px; cursor:${count > 0 ? 'pointer' : 'not-allowed'};"
          >
            ${isSelected ? 'USANDO' : 'EQUIPAR'}
          </button>
        </div>
      </div>
    `;
  }

  // 4. PALCO DE COLETA (STAGE CENTRAL)
  let stageHtml = '';
  if (gState.isGathering && gState.targetedNodeId) {
    const node = FLORA_NODES_CATALOG[gState.targetedNodeId];
    const now = Date.now();
    const elapsed = now - (gState.harvestStartTime || now);
    const needed = gState.harvestDuration || 3000;
    const isReady = elapsed >= needed;
    const progressPct = Math.min(100, Math.floor((elapsed / needed) * 100));
    const activeTacticDef = GATHERING_TACTICS[gState.activeTactic] || GATHERING_TACTICS.standard;

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(20,50,35,0.85) 0%, rgba(10,18,14,0.95) 100%); border:1px solid rgba(52,211,153,0.4); border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.7);">
        <div style="font-size:52px; margin-bottom:8px; animation:bounce 1.5s infinite;">
          ${node?.icon || '🌿'}
        </div>
        <h3 style="margin:0 0 4px 0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:18px;">
          ${node?.name || 'Flora Identificada'}
          <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(52,211,153,0.2); border:1px solid #34d399; color:#a7f3d0; margin-left:6px;">
            ${activeTacticDef.icon} ${activeTacticDef.name}
          </span>
        </h3>
        <p style="margin:0 0 6px 0; font-size:11px; color:#aaa; font-style:italic;">
          "${gState.targetedNodeSignal || 'Gotas cristalinas de orvalho ornam as pétalas perfeitas'}"
        </p>
        <div style="margin-bottom:12px; font-size:12px; font-family:'Cinzel',serif;">
          ${gState.inspected 
            ? `<span style="color:#f4d58a;">[Pureza: ${gState.targetedNodePurity}% - Perigo: ${gState.targetedNodeHazard.toUpperCase()}]</span>` 
            : `<span style="color:#94a3b8;">[Pureza: Oculta (Examinar Broto)]</span>`}
        </div>
        <p style="margin:0 0 12px 0; font-size:11px; color:#aaa;">
          Insumos: <strong style="color:#cbd5e1;">${node?.yields?.primary?.toUpperCase()}</strong> ${node?.yields?.secondary ? `+ <strong style="color:#94a3b8;">${node?.yields?.secondary?.toUpperCase()}</strong>` : ''}
        </p>

        <!-- Barra de Progresso de Poda -->
        <div style="width:100%; height:8px; background:rgba(0,0,0,0.6); border-radius:4px; overflow:hidden; border:1px solid rgba(52,211,153,0.3); margin-bottom:16px;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #34d399, #10b981); transition:width 0.2s ease;"></div>
        </div>

        ${isReady ? `
        <div style="display:flex; justify-content:center; gap:8px;">
          <button 
            onclick="window.finishGatheringHarvest()"
            style="
              padding: 10px 24px;
              font-family: 'Cinzel', serif;
              font-size: 14px;
              font-weight: bold;
              background: linear-gradient(180deg, #34d399, #059669);
              border: 1px solid #6ee7b7;
              color: #000;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 0 16px rgba(52,211,153,0.5);
              letter-spacing: 0.05em;
            "
          >
            ✂️ EXTRAIR BOTÂNICA
          </button>
        </div>
        ` : `
        <div style="display:flex; justify-content:center; gap:8px;">
          <button style="padding:10px 24px; font-family:'Cinzel',serif; font-size:14px; font-weight:bold; background:rgba(50,60,50,0.5); border:1px solid #444; color:#777; border-radius:8px; cursor:not-allowed;">🌿 PODANDO BROTOS...</button>
        </div>
        `}
      </div>
    `;
  } else {
    const node = gState.targetedNodeId ? FLORA_NODES_CATALOG[gState.targetedNodeId] : null;
    let targetCardHtml = '';
    if (node) {
      targetCardHtml = `
        <div style="background:rgba(0,0,0,0.4); border:1px solid rgba(212,167,68,0.2); border-radius:8px; padding:12px; margin-bottom:16px;">
          <div style="font-size:24px; margin-bottom:4px;">${node.icon}</div>
          <h4 style="margin:0 0 4px 0; color:#f4d58a; font-family:'Cinzel',serif;">${node.name}</h4>
          <p style="margin:0 0 6px 0; font-size:11px; color:#aaa; font-style:italic;">"${gState.targetedNodeSignal}"</p>
          <div style="font-size:11px; font-weight:bold;">
            ${gState.inspected 
              ? `<span style="color:${gState.targetedNodeHazard === 'none' ? '#6ee7b7' : gState.targetedNodeHazard === 'thorn' ? '#f87171' : gState.targetedNodeHazard === 'toxin' ? '#a78bfa' : '#fbbf24'};">[Pureza: ${gState.targetedNodePurity}% - Perigo: ${gState.targetedNodeHazard.toUpperCase()}]</span>` 
              : `<span style="color:#94a3b8;">[Pureza: Oculta (Examinar Broto)]</span>`}
          </div>
        </div>
      `;
    }

    stageHtml = `
      <div style="text-align:center; padding:20px; background:radial-gradient(circle, rgba(16,36,28,0.85) 0%, rgba(10,15,12,0.95) 100%); border:1px solid rgba(212,167,68,0.3); border-radius:12px;">
        <div style="font-size:42px; margin-bottom:8px;">
          🧺
        </div>
        <h3 style="margin:0 0 12px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:16px;">
          Clareira Botânica em ${activeZone.name}
        </h3>
        
        ${targetCardHtml || `<p style="color:#888; font-size:12px; margin-bottom:16px;">Nenhum broto na mira. Clique em Buscar Outro.</p>`}

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
          <button onclick="window.inspectGatheringNode()" style="padding:10px; background:rgba(30,40,50,0.8); border:1px solid #60a5fa; color:#93c5fd; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; font-family:'Cinzel',serif;">🔍 Examinar Broto</button>
          <button onclick="window.skipGatheringNode()" style="padding:10px; background:rgba(40,40,40,0.8); border:1px solid #aaa; color:#ddd; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px; font-family:'Cinzel',serif;">⏭️ Buscar Outro</button>
          <button onclick="window.selectGatheringTactic('delicate'); window.startGatheringHarvest()" ${isSickleDull ? 'disabled' : ''} style="padding:10px; background:rgba(20,50,30,0.8); border:1px solid #34d399; color:#6ee7b7; border-radius:6px; cursor:${isSickleDull ? 'not-allowed' : 'pointer'}; font-weight:bold; font-size:12px; font-family:'Cinzel',serif;">🌿 Poda Cirúrgica</button>
          <button onclick="window.selectGatheringTactic('cleave'); window.startGatheringHarvest()" ${isSickleDull ? 'disabled' : ''} style="padding:10px; background:rgba(50,20,20,0.8); border:1px solid #f87171; color:#fca5a5; border-radius:6px; cursor:${isSickleDull ? 'not-allowed' : 'pointer'}; font-weight:bold; font-size:12px; font-family:'Cinzel',serif;">⚡ Ceifa Rápida</button>
        </div>
      </div>
    `;
  }

  const isAfkUnlocked = skillLvl >= 5;
  const isAfkActive = gState.autoGathering;

  container.innerHTML = `
    <div style="padding:16px; font-family:sans-serif; color:#fff;">
      <!-- Header Banner -->
      <div style="background:linear-gradient(180deg, rgba(16,36,28,0.95), rgba(8,16,12,0.95)); border:1px solid rgba(52,211,153,0.35); border-radius:12px; padding:16px; margin-bottom:18px; box-shadow:0 4px 20px rgba(0,0,0,0.6);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; font-family:'Cinzel',serif; color:#6ee7b7; font-size:20px; display:flex; align-items:center; gap:8px;">
              🌿 Associação de Botânica & Herboristas de Aden
            </h3>
            <p style="margin:4px 0 0 0; font-size:12px; color:#aaa;">
              Colha plantas medicinais, galhos ancestrais, musgos e resinas botânicas para suprir os ferreiros e tecelões!
            </p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(52,211,153,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Nível de Coletor</div>
              <div style="font-size:16px; font-weight:bold; color:#6ee7b7; font-family:'Cinzel',serif;">Nv. ${skillLvl} / 40</div>
            </div>
            <div style="background:rgba(0,0,0,0.5); border:1px solid rgba(212,167,68,0.3); border-radius:8px; padding:6px 14px; text-align:center;">
              <div style="font-size:10px; color:#aaa; text-transform:uppercase;">Herbário Descoberto</div>
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

      <!-- Zonas de Coleta -->
      <div style="margin-bottom:20px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px; display:flex; align-items:center; gap:6px;">
          🧭 Bosques & Clareiras de Aden
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
            🌾 Clareira de Poda & Extração
          </h4>
          ${stageHtml}

          <!-- Painel AFK -->
          <div style="margin-top:12px; background:rgba(18,22,32,0.85); border:1px solid rgba(52,211,153,0.25); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <strong style="font-size:13px; color:#f4d58a;">🌿 Coleta Automática (AFK)</strong>
                <span style="font-size:10px; background:${isAfkUnlocked ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}; color:${isAfkUnlocked ? '#34d399' : '#fca5a5'}; padding:1px 6px; border-radius:4px; font-weight:bold;">
                  ${isAfkUnlocked ? 'DESBLOQUEADO' : 'NV. 5 COLETA REQUERIDO'}
                </span>
              </div>
              <p style="margin:2px 0 0 0; font-size:10px; color:#aaa;">
                Colhe e preserva brotos automaticamente enquanto o jogo roda ou em segundo plano.
              </p>
            </div>
            <button 
              onclick="window.toggleAutoGathering()"
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

        <!-- Coluna Direita: Foice Atual & Manutenção -->
        <div>
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
            🌾 Foice de Poda & Manutenção
          </h4>
          <div style="background:rgba(18,22,32,0.85); border:1px solid rgba(212,167,68,0.3); border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <div>
                <strong style="font-size:14px; color:#6ee7b7;">${activeSickle.icon} ${activeSickle.name}</strong>
                <div style="font-size:11px; color:#aaa; margin-top:2px;">${activeSickle.desc}</div>
              </div>
              <button 
                onclick="window.repairGatheringSickle('${activeSickleId}')"
                ${!isSickleDull && durPct >= 100 ? 'disabled' : ''}
                style="padding:6px 12px; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#fbbf24,#b45309); border:1px solid #fde047; color:#000; border-radius:6px; cursor:pointer;"
              >
                🪨 AMOLAR FOICE
              </button>
            </div>

            <!-- Barra de Durabilidade -->
            <div style="margin-top:8px;">
              <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:4px;">
                <span>Fio da Lâmina: <strong style="color:${durPct > 20 ? '#34d399' : '#ef4444'};">${sickleDurability} / ${maxSickleDurability}</strong></span>
                <span>${durPct}%</span>
              </div>
              <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border-radius:3px; overflow:hidden; border:1px solid rgba(212,167,68,0.2);">
                <div style="width:${durPct}%; height:100%; background:${durPct > 50 ? 'linear-gradient(90deg,#34d399,#10b981)' : durPct > 20 ? 'linear-gradient(90deg,#fbbf24,#d97706)' : 'linear-gradient(90deg,#ef4444,#b91c1c)'};"></div>
              </div>
            </div>
          </div>

          <!-- Arsenal de Foices -->
          <h5 style="margin:12px 0 6px 0; font-family:'Cinzel',serif; color:#ffd877; font-size:13px;">
            Oficina de Foices Botânicas
          </h5>
          <div style="max-height:180px; overflow-y:auto; padding-right:4px;">
            ${sicklesHtml}
          </div>
        </div>
      </div>

      <!-- Seção Inferior: Cestos & Bolsas de Conservação -->
      <div style="background:rgba(18,22,32,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; color:#f4d58a; font-size:15px;">
          🧺 Cestos & Bolsas de Conservação de Ervas
        </h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:10px;">
          ${pouchesHtml}
        </div>
      </div>
    </div>
  `;
}
