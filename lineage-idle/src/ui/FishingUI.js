/**
 * FishingUI.js — Interface Completa do Sistema de Pesca de Aden.
 * Estética: Dark Fantasy MMO Lineage II.
 */

import { el, qs } from '../core/DomHelpers.js';
import { FISHING_ZONES, FISH_CATALOG, RODS_CATALOG, BAIT_CATALOG, getFishingZonesList } from '../data/fishing.js';
import { FishingService } from '../services/FishingService.js';
import { getInventoryCount } from '../services/InventoryService.js';

export function renderFishingUI(state) {
  if (!state) return;
  const container = el('tab-fishing') || qs('#tab-fishing, .tab-fishing');
  if (!container) return;

  const fState = FishingService.getFishingState(state);
  const prog = FishingService.getSkillProgress(state);
  const stats = FishingService.getFishingStats(state);
  const playerLvl = Number(state.level) || 1;

  const activeZoneId = fState.activeZone || 'zone_talking_island';
  const activeZone = FISHING_ZONES[activeZoneId] || FISHING_ZONES.zone_talking_island;
  const activeRodId = fState.rod || 'rod_none';
  const activeRod = RODS_CATALOG[activeRodId] || RODS_CATALOG.rod_none;
  const rodDurability = fState.rodDurability?.[activeRodId] ?? 0;
  const maxRodDurability = activeRod.durability || 50;
  const isRodBroken = rodDurability <= 0;

  const activeBaitId = fState.activeBait;
  const activeBait = activeBaitId ? BAIT_CATALOG[activeBaitId] : null;
  const activeBaitCount = activeBaitId ? (fState.baitInventory?.[activeBaitId] || 0) : 0;

  // --- ZONAS DE PESCA ---
  const zonesList = getFishingZonesList();
  let zonesHtml = '';
  for (const z of zonesList) {
    const isUnlocked = playerLvl >= z.minLevel;
    const isSelected = z.id === activeZoneId;
    const reqBaitName = z.requiredBait ? (BAIT_CATALOG[z.requiredBait]?.name || z.requiredBait) : 'Qualquer Isca';

    let diffStars = '⭐'.repeat(z.difficulty);

    zonesHtml += `
      <div 
        onclick="${isUnlocked ? `window.selectFishingZone('${z.id}')` : ''}"
        style="
          flex: 1 1 200px;
          min-width: 190px;
          background: ${isSelected ? 'linear-gradient(180deg, rgba(30,58,138,0.5), rgba(15,23,42,0.85))' : 'rgba(15,20,32,0.7)'};
          border: 1px solid ${isSelected ? '#60a5fa' : isUnlocked ? 'rgba(212,167,68,0.25)' : 'rgba(100,100,100,0.2)'};
          border-radius: 8px;
          padding: 10px;
          cursor: ${isUnlocked ? 'pointer' : 'not-allowed'};
          opacity: ${isUnlocked ? '1' : '0.55'};
          position: relative;
          transition: all 0.2s ease;
          box-shadow: ${isSelected ? '0 0 12px rgba(96,165,250,0.3)' : 'none'};
        "
      >
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="font-family:'Cinzel',serif; font-weight:bold; font-size:12px; color:${isSelected ? '#93c5fd' : '#f5df93'};">
            ${z.icon} ${z.name}
          </div>
          <span style="font-size:10px; color:#ffd700;">${diffStars}</span>
        </div>
        <div style="font-size:11px; color:#aaa; margin-bottom:6px; line-height:1.2;">
          ${z.description}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px; border-top:1px solid rgba(255,255,255,0.06); padding-top:4px;">
          <span style="color:${isUnlocked ? '#34d399' : '#f87171'}; font-weight:bold;">
            ${isUnlocked ? '✓ Liberado' : `🔒 Lv. ${z.minLevel}+`}
          </span>
          <span style="color:#cbd5e1;">🪱 ${reqBaitName}</span>
        </div>
        ${isSelected ? `<div style="position:absolute; top:-6px; right:-6px; background:#2563eb; color:#fff; font-size:9px; font-weight:bold; padding:1px 6px; border-radius:10px; border:1px solid #93c5fd;">ATIVO</div>` : ''}
      </div>
    `;
  }

  // --- VARAS & REPARO ---
  let rodOptionsHtml = '';
  for (const [rId, rDef] of Object.entries(RODS_CATALOG)) {
    const isOwned = fState.rodDurability?.[rId] !== undefined;
    const isEquipped = activeRodId === rId;
    const canUse = fState.skillLevel >= rDef.minFishingLevel;
    const canAfford = (state.gold || 0) >= rDef.buyPrice;

    let rodActionBtn = '';
    if (isEquipped) {
      rodActionBtn = `<span style="font-size:10px; color:#34d399; font-weight:bold;">✓ Equipada</span>`;
    } else if (isOwned) {
      rodActionBtn = `
        <button onclick="window.equipFishingRod('${rId}')" style="padding:3px 8px; font-size:10px; font-weight:bold; background:#1e293b; border:1px solid #64748b; color:#e2e8f0; border-radius:4px; cursor:pointer;">
          Equipar
        </button>
      `;
    } else {
      rodActionBtn = `
        <button 
          onclick="window.buyFishingRod('${rId}')"
          ${(!canUse || !canAfford) ? 'disabled' : ''}
          style="padding:3px 8px; font-size:10px; font-weight:bold; background:${canUse && canAfford ? 'linear-gradient(180deg,#d4a744,#8a641c)' : '#27272a'}; border:1px solid ${canUse && canAfford ? '#ffe699' : '#52525b'}; color:${canUse && canAfford ? '#000' : '#71717a'}; border-radius:4px; cursor:${canUse && canAfford ? 'pointer' : 'not-allowed'};"
        >
          ${canUse ? `🪙 ${(rDef.buyPrice/1000).toFixed(0)}k` : `🔒 Nv.${rDef.minFishingLevel}`}
        </button>
      `;
    }

    rodOptionsHtml += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; background:rgba(0,0,0,0.3); border-radius:6px; margin-bottom:4px; border:1px solid ${isEquipped ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.05)'};">
        <div>
          <span style="font-size:11px; font-weight:bold; color:${isEquipped ? '#93c5fd' : '#e2e8f0'};">${rDef.icon} ${rDef.name}</span>
          <span style="font-size:9px; color:#94a3b8; margin-left:4px;">(Bônus: +${Math.round((rDef.catchBonus - 1) * 100)}%)</span>
        </div>
        <div>${rodActionBtn}</div>
      </div>
    `;
  }

  // --- ISCAS (COMPRA E SELEÇÃO) ---
  let baitOptionsHtml = '';
  for (const [bId, bDef] of Object.entries(BAIT_CATALOG)) {
    const count = fState.baitInventory?.[bId] || 0;
    const isSelected = activeBaitId === bId;
    const canAfford10 = (state.gold || 0) >= (bDef.buyPrice * 10);

    baitOptionsHtml += `
      <div style="flex:1 1 160px; min-width:150px; background:rgba(18,24,38,0.75); border:1px solid ${isSelected ? '#facc15' : 'rgba(212,167,68,0.2)'}; border-radius:6px; padding:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11px; font-weight:bold; color:${isSelected ? '#fef08a' : '#f8fafc'};">${bDef.icon} ${bDef.name}</span>
          <span style="font-size:11px; font-family:monospace; font-weight:bold; color:#38bdf8;">×${count}</span>
        </div>
        <div style="font-size:9px; color:#94a3b8; margin:3px 0 6px 0; min-height:22px;">
          ${bDef.effectDescription}
        </div>
        <div style="display:flex; gap:4px;">
          <button 
            onclick="window.selectFishingBait('${bId}')"
            ${count <= 0 ? 'disabled' : ''}
            style="flex:1; padding:3px 6px; font-size:10px; font-weight:bold; background:${isSelected ? '#22c55e' : count > 0 ? '#334155' : '#1e293b'}; border:1px solid ${isSelected ? '#86efac' : '#475569'}; color:${isSelected ? '#000' : '#f1f5f9'}; border-radius:4px; cursor:${count > 0 ? 'pointer' : 'not-allowed'};"
          >
            ${isSelected ? '✓ Em Uso' : 'Usar'}
          </button>
          <button 
            onclick="window.buyFishingBait('${bId}', 10)"
            ${!canAfford10 ? 'disabled' : ''}
            style="flex:1; padding:3px 6px; font-size:10px; font-weight:bold; background:${canAfford10 ? 'linear-gradient(180deg,#eab308,#a16207)' : '#27272a'}; border:1px solid ${canAfford10 ? '#fde047' : '#52525b'}; color:${canAfford10 ? '#000' : '#71717a'}; border-radius:4px; cursor:${canAfford10 ? 'pointer' : 'not-allowed'};"
            title="Comprar 10x por ${(bDef.buyPrice * 10).toLocaleString()} Adena"
          >
            +10 (${(bDef.buyPrice * 10).toLocaleString()}a)
          </button>
        </div>
      </div>
    `;
  }

  // --- STAGE DE PESCA (ANIMAÇÃO / BOTÃO FISGAR) ---
  const isFishingNow = fState.isFishing;
  const isAutoFishing = fState.autoFishing;
  const canAutoFish = fState.skillLevel >= 5;

  let fishingActionContent = '';
  if (isFishingNow && fState.activeFight && fState.activeFight.status === 'fighting') {
    const fight = fState.activeFight;
    const fDef = fight.fishDef || {};
    const profile = fight.profile || {};

    const staminaPct = Math.max(0, Math.min(100, Math.round((fight.fishStamina / (fight.maxStamina || 1)) * 100)));
    const tensionPct = Math.max(0, Math.min(100, fight.lineTension));
    const controlPct = Math.max(0, Math.min(100, fight.playerControl));

    let tensionColor = '#22c55e';
    let tensionStatus = 'Segura';
    let tensionPulse = '';
    if (tensionPct >= 90) {
      tensionColor = '#ef4444';
      tensionStatus = '⚠️ PERIGO CRÍTICO DE QUEBRA!';
      tensionPulse = 'animation: pulse 0.6s infinite;';
    } else if (tensionPct >= 75) {
      tensionColor = '#f97316';
      tensionStatus = 'Tensão Elevada';
    } else if (tensionPct >= 50) {
      tensionColor = '#eab308';
      tensionStatus = 'Moderada';
    }

    let controlColor = controlPct > 50 ? '#3b82f6' : controlPct >= 25 ? '#eab308' : '#ef4444';
    let controlStatus = controlPct > 50 ? 'Firme' : controlPct >= 25 ? 'Sob Disputa' : '⚠️ PEIXE ESCAPANDO!';
    let controlPulse = controlPct < 25 ? 'animation: pulse 0.6s infinite;' : '';

    fishingActionContent = `
      <div style="padding:16px; background:linear-gradient(180deg, rgba(15,23,42,0.9), rgba(10,14,26,0.98)); border-radius:12px; border:1px solid #3b82f6; box-shadow:0 0 20px rgba(59,130,246,0.3);">
        <!-- Top info bar do peixe fisgado -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:32px; filter:drop-shadow(0 0 8px rgba(96,165,250,0.5));">${fDef.icon || '🐟'}</div>
            <div>
              <div style="font-family:'Cinzel',serif; font-size:15px; font-weight:bold; color:#f8fafc;">
                ${fDef.name || 'Peixe Misterioso'} <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(59,130,246,0.2); border:1px solid #60a5fa; color:#93c5fd;">${profile.name || 'Padrão'}</span>
              </div>
              <div style="font-size:11px; color:#94a3b8;">${profile.desc || 'Comportamento aquático sob análise'}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; color:#94a3b8;">Turno de Disputa</div>
            <div style="font-size:14px; font-weight:bold; color:#ffd700; font-family:monospace;">#${(fight.turns || 0) + 1}</div>
          </div>
        </div>

        <!-- Gauges & Barras de Combate Aquático -->
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <!-- 1. Stamina do Peixe -->
          <div style="background:rgba(0,0,0,0.4); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span style="color:#f87171; font-weight:bold;">🐟 Resistência / Stamina do Peixe:</span>
              <span style="font-family:monospace; color:#fca5a5; font-weight:bold;">${fight.fishStamina} / ${fight.maxStamina} (${staminaPct}%)</span>
            </div>
            <div style="background:#1e293b; height:10px; border-radius:5px; overflow:hidden;">
              <div style="background:linear-gradient(90deg, #ef4444, #f87171); width:${staminaPct}%; height:100%; transition:width 0.2s ease;"></div>
            </div>
          </div>

          <!-- 2. Tensão da Linha -->
          <div style="background:rgba(0,0,0,0.4); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span style="color:${tensionColor}; font-weight:bold; ${tensionPulse}">⚡ Tensão da Linha: ${tensionStatus}</span>
              <span style="font-family:monospace; color:${tensionColor}; font-weight:bold;">${tensionPct} / 100%</span>
            </div>
            <div style="background:#1e293b; height:10px; border-radius:5px; overflow:hidden;">
              <div style="background:${tensionColor}; width:${tensionPct}%; height:100%; transition:width 0.2s ease; ${tensionPulse}"></div>
            </div>
          </div>

          <!-- 3. Controle do Pescador -->
          <div style="background:rgba(0,0,0,0.4); padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span style="color:${controlColor}; font-weight:bold; ${controlPulse}">🎯 Controle da Carretilha: ${controlStatus}</span>
              <span style="font-family:monospace; color:${controlColor}; font-weight:bold;">${controlPct} / 100%</span>
            </div>
            <div style="background:#1e293b; height:10px; border-radius:5px; overflow:hidden;">
              <div style="background:${controlColor}; width:${controlPct}%; height:100%; transition:width 0.2s ease; ${controlPulse}"></div>
            </div>
          </div>
        </div>

        <!-- 4 Ações Táticas da Luta -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:8px;">
          <button 
            onclick="window.fishingAction('reel')"
            style="padding:10px 8px; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#2563eb,#1d4ed8); border:1px solid #93c5fd; color:#fff; border-radius:6px; cursor:pointer; text-align:center;"
          >
            🎣 Recolher (Reel)
            <div style="font-size:9px; color:#cbd5e1; font-family:sans-serif; margin-top:2px; font-weight:normal;">+Controle, +Tensão</div>
          </button>

          <button 
            onclick="window.fishingAction('yield')"
            style="padding:10px 8px; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#0891b2,#0e7490); border:1px solid #67e8f9; color:#fff; border-radius:6px; cursor:pointer; text-align:center;"
          >
            🌊 Ceder Linha (Yield)
            <div style="font-size:9px; color:#cffafe; font-family:sans-serif; margin-top:2px; font-weight:normal;">-Tensão drástica, -Controle</div>
          </button>

          <button 
            onclick="window.fishingAction('force')"
            style="padding:10px 8px; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#dc2626,#991b1b); border:1px solid #fca5a5; color:#fff; border-radius:6px; cursor:pointer; text-align:center;"
          >
            ⚡ Puxão Forte (Force)
            <div style="font-size:9px; color:#fee2e2; font-family:sans-serif; margin-top:2px; font-weight:normal;">--Stamina, ++Tensão Alta!</div>
          </button>

          <button 
            onclick="window.fishingAction('rest')"
            style="padding:10px 8px; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; background:linear-gradient(180deg,#059669,#047857); border:1px solid #6ee7b7; color:#fff; border-radius:6px; cursor:pointer; text-align:center;"
          >
            🧘 Estabilizar (Rest)
            <div style="font-size:9px; color:#d1fae5; font-family:sans-serif; margin-top:2px; font-weight:normal;">-Tensão moderada</div>
          </button>
        </div>
      </div>
    `;
  } else if (isFishingNow) {
    const elapsed = Date.now() - (fState.castStartTime || Date.now());
    const catchTime = activeZone.baseCatchTime || 4000;
    const isBiting = elapsed >= (catchTime * 0.5);

    fishingActionContent = `
      <div style="text-align:center; padding:20px 10px;">
        <div style="font-size:42px; margin-bottom:8px; animation:bounce 1s infinite;">
          ${isBiting ? '🌊🐟 💥 FISGOU!' : '🌊🎣 ... Aguardando ...'}
        </div>
        <div style="font-family:'Cinzel',serif; font-size:14px; font-weight:bold; color:${isBiting ? '#fde047' : '#93c5fd'}; margin-bottom:12px;">
          ${isBiting ? 'A BOIA AFUNDOU! INICIE A DISPUTA AGORA!' : 'A linha repousa sobre a correnteza...'}
        </div>
        <button 
          onclick="window.reelInFishingLine(1.0)"
          style="
            padding:12px 36px;
            font-family:'Cinzel',serif;
            font-size:16px;
            font-weight:900;
            letter-spacing:0.08em;
            background:linear-gradient(180deg, #ef4444 0%, #991b1b 100%);
            border:2px solid #fca5a5;
            color:#fff;
            border-radius:8px;
            cursor:pointer;
            box-shadow:0 0 20px rgba(239,68,68,0.6);
            animation:pulse 0.8s infinite;
          "
        >
          🎣 FISGAR COM FORÇA!
        </button>
      </div>
    `;
  } else {
    fishingActionContent = `
      <div style="text-align:center; padding:16px 10px;">
        <div style="font-size:32px; margin-bottom:6px;">
          🌊🎣
        </div>
        <div style="font-family:'Cinzel',serif; font-size:13px; color:#cbd5e1; margin-bottom:14px;">
          Local Atual: <strong style="color:#f5df93;">${activeZone.name}</strong> | Vara: <strong style="color:#93c5fd;">${activeRod.name}</strong> | Isca: <strong style="color:#fde047;">${activeBait ? activeBait.name : 'Nenhuma'}</strong>
        </div>
        <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
          <button 
            onclick="window.castFishingLine()"
            style="
              padding:12px 28px;
              font-family:'Cinzel',serif;
              font-size:14px;
              font-weight:bold;
              background:linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
              border:2px solid #93c5fd;
              color:#fff;
              border-radius:8px;
              cursor:pointer;
              box-shadow:0 4px 14px rgba(59,130,246,0.4);
              transition:transform 0.1s ease;
            "
            onmousedown="this.style.transform='scale(0.97)'"
            onmouseup="this.style.transform='none'"
          >
            🎣 LANÇAR ANZOL (MANUAL)
          </button>
          
          <button 
            onclick="window.toggleAutoFishing()"
            ${!canAutoFish ? 'disabled' : ''}
            style="
              padding:12px 24px;
              font-family:'Cinzel',serif;
              font-size:13px;
              font-weight:bold;
              background:${!canAutoFish ? '#27272a' : isAutoFishing ? 'linear-gradient(180deg, #22c55e, #15803d)' : 'linear-gradient(180deg, #475569, #1e293b)'};
              border:2px solid ${!canAutoFish ? '#52525b' : isAutoFishing ? '#86efac' : '#94a3b8'};
              color:${!canAutoFish ? '#71717a' : '#fff'};
              border-radius:8px;
              cursor:${canAutoFish ? 'pointer' : 'not-allowed'};
              box-shadow:${isAutoFishing ? '0 0 16px rgba(34,197,94,0.5)' : 'none'};
            "
          >
            ${!canAutoFish ? '🔒 AFK (Nv. 5+)' : isAutoFishing ? '🤖 AFK ATIVO (PARAR)' : '🤖 ATIVAR AFK'}
          </button>
        </div>
      </div>
    `;
  }

  // --- TROCA DE PEIXES POR MATERIAIS ---
  let ownedFishCards = '';
  let hasAnyFish = false;

  for (const [fId, fDef] of Object.entries(FISH_CATALOG)) {
    const count = getInventoryCount(state, fId);
    if (count <= 0) continue;
    hasAnyFish = true;

    const rate = fDef.exchangeRate || 5;
    const canExchange = count >= rate;
    const packages = Math.floor(count / rate);

    const rarityBadgeColor = fDef.rarity === 'legendary' ? '#f59e0b'
      : fDef.rarity === 'epic' ? '#a855f7'
      : fDef.rarity === 'rare' ? '#3b82f6'
      : fDef.rarity === 'uncommon' ? '#10b981'
      : '#94a3b8';

    ownedFishCards += `
      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        background:rgba(20,26,42,0.8);
        border:1px solid ${rarityBadgeColor}55;
        border-radius:8px;
        padding:8px 12px;
        margin-bottom:6px;
        gap:8px;
      ">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">${fDef.icon}</span>
          <div>
            <div style="font-family:'Cinzel',serif; font-size:12px; font-weight:bold; color:#f8fafc;">
              ${fDef.name} <span style="font-size:10px; color:${rarityBadgeColor}; text-transform:uppercase;">[${fDef.rarity}]</span>
            </div>
            <div style="font-size:10px; color:#cbd5e1;">
              Em posse: <strong style="color:#38bdf8;">${count}x</strong> | Troca: <strong>${rate}x</strong> ➔ <span style="color:#ffd700; font-weight:bold;">1x ${fDef.materialName}</span>
            </div>
          </div>
        </div>
        <button 
          onclick="window.exchangeFishForMaterials('${fId}', ${packages * rate})"
          ${!canExchange ? 'disabled' : ''}
          style="
            padding:6px 12px;
            font-size:11px;
            font-weight:bold;
            font-family:'Cinzel',serif;
            background:${canExchange ? 'linear-gradient(180deg, #10b981 0%, #047857 100%)' : '#27272a'};
            border:1px solid ${canExchange ? '#6ee7b7' : '#52525b'};
            color:${canExchange ? '#fff' : '#71717a'};
            border-radius:6px;
            cursor:${canExchange ? 'pointer' : 'not-allowed'};
          "
        >
          ${canExchange ? `📦 Trocar (${packages}x)` : `Faltam ${rate - count}`}
        </button>
      </div>
    `;
  }

  if (!hasAnyFish) {
    ownedFishCards = `
      <div style="text-align:center; padding:24px; color:#94a3b8; font-size:12px; border:1px dashed rgba(212,167,68,0.25); border-radius:8px;">
        <div style="font-size:32px; margin-bottom:6px;">🐟</div>
        Você ainda não possui pescados em sua mochila.<br>
        Lance sua linha nas águas de Aden para obter peixes e trocá-los por valiosos insumos de Forja e Alquimia!
      </div>
    `;
  }

  // --- MONTAGEM GERAL DO TAB ---
  container.innerHTML = `
    <div style="padding:16px; color:#fff; font-family:'Inter',sans-serif;">
      <!-- Header do Pescador -->
      <div style="
        background:linear-gradient(180deg, rgba(20,26,46,0.95), rgba(10,14,24,0.98));
        border:1px solid rgba(212,167,68,0.4);
        border-radius:12px;
        padding:16px;
        margin-bottom:16px;
        box-shadow:0 4px 20px rgba(0,0,0,0.5);
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
          <div>
            <h3 style="margin:0; font-family:'Cinzel',serif; color:#f4d58a; font-size:18px; display:flex; align-items:center; gap:8px;">
              🎣 Associação de Pescadores de Aden
            </h3>
            <p style="margin:2px 0 0 0; font-size:11px; color:#94a3b8;">
              Domine as correntes aquáticas de Elmore-Aden, fisgue espécies lendárias e abasteça os artífices com matérias-primas nobres!
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px; color:#aaa;">Pescados Totais: <strong style="color:#ffd877;">${stats.totalCaught}</strong></div>
            <div style="font-size:11px; color:#aaa;">Espécies Descobertas: <strong style="color:#60a5fa;">${stats.speciesDiscovered} / ${stats.totalSpecies}</strong></div>
          </div>
        </div>

        <!-- Barra de Progresso de Habilidade -->
        <div style="background:rgba(0,0,0,0.5); border-radius:8px; padding:8px 12px; border:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; margin-bottom:4px;">
            <span style="color:#fde047;">★ Nível de Pesca: ${prog.level}</span>
            <span style="color:#94a3b8; font-family:monospace;">${prog.xp} / ${prog.nextXp} XP (${prog.percent}%)</span>
          </div>
          <div style="background:#1e293b; border-radius:4px; height:8px; overflow:hidden;">
            <div style="background:linear-gradient(90deg, #3b82f6, #60a5fa); width:${prog.percent}%; height:100%; transition:width 0.3s ease;"></div>
          </div>
        </div>
      </div>

      <!-- Stage Interativo de Pesca -->
      <div style="
        background:radial-gradient(circle at center, rgba(30,58,138,0.3) 0%, rgba(10,15,30,0.95) 100%);
        border:1px solid rgba(96,165,250,0.3);
        border-radius:12px;
        margin-bottom:16px;
        box-shadow:inset 0 0 20px rgba(0,0,0,0.6);
      ">
        ${fishingActionContent}
      </div>

      <!-- Grid de Equipamento & Iscas -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:12px; margin-bottom:16px;">
        <!-- Card da Vara -->
        <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="margin:0; font-family:'Cinzel',serif; font-size:12px; color:#f4d58a;">🎣 Varas de Pesca</h4>
            <div style="font-size:10px; color:${isRodBroken ? '#f87171' : '#34d399'}; font-weight:bold;">
              Durabilidade: ${rodDurability} / ${maxRodDurability}
            </div>
          </div>
          ${rodOptionsHtml}
          ${rodDurability < maxRodDurability ? `
            <button 
              onclick="window.repairFishingRod('${activeRodId}')"
              style="width:100%; margin-top:6px; padding:6px; font-size:10px; font-weight:bold; background:rgba(212,167,68,0.15); border:1px solid #d4a744; color:#ffd700; border-radius:4px; cursor:pointer;"
            >
              🔨 Restaurar Durabilidade (${activeRod.name})
            </button>
          ` : ''}
        </div>

        <!-- Card de Iscas -->
        <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px;">
          <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; font-size:12px; color:#f4d58a;">🪱 Caixas de Iscas</h4>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${baitOptionsHtml}
          </div>
        </div>
      </div>

      <!-- Seletor de Zonas -->
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px; margin-bottom:16px;">
        <h4 style="margin:0 0 8px 0; font-family:'Cinzel',serif; font-size:12px; color:#f4d58a;">🗺️ Zonas de Pesca de Aden</h4>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${zonesHtml}
        </div>
      </div>

      <!-- Mercador dos Mares: Troca de Pescados -->
      <div style="background:rgba(18,22,34,0.85); border:1px solid rgba(212,167,68,0.25); border-radius:10px; padding:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; font-family:'Cinzel',serif; font-size:12px; color:#f4d58a;">⚖️ Feira de Pescados (Troca por Materiais de Forja)</h4>
          <span style="font-size:10px; color:#94a3b8;">Entregue seus cardumes aos artesãos locais</span>
        </div>
        ${ownedFishCards}
      </div>
    </div>
  `;
}
