const ATLAS_POINTS = {
  fishing: [[14, 76], [15, 32], [34, 29], [50, 40], [77, 74], [88, 48]],
  hunting: [[23, 28], [35, 35], [47, 55], [67, 42], [66, 18], [74, 31]],
  gathering: [[25, 34], [48, 48], [68, 38], [66, 18], [53, 50], [72, 68]],
  mining: [[36, 52], [52, 35], [46, 46], [59, 50], [69, 23], [72, 45]]
};

function escapeText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function renderLifeActivityAtlas({
  activityId,
  title,
  subtitle,
  zones,
  activeZoneId,
  playerLevel,
  activityLevel = 1,
  selectHandler,
  resourceLabel,
  resourceNames = [],
  requirementLabel,
  requirementValue,
  cycleLabel,
  cycleValue,
  mechanicSummary,
  accent = '#d4a744'
}) {
  const activeZone = zones.find(zone => zone.id === activeZoneId) || zones[0];
  const activeNames = resourceNames.slice(0, 4).map(escapeText);
  const points = ATLAS_POINTS[activityId] || ATLAS_POINTS.gathering;
  const unlockedCount = zones.filter(zone => playerLevel >= zone.minLevel && activityLevel >= (zone.minSkillLevel || 1)).length;

  return `
    <style>
      .life-atlas-wrap{margin:0 0 18px;border:1px solid rgba(212,167,68,.36);border-radius:16px;overflow:hidden;background:linear-gradient(145deg,rgba(18,25,33,.98),rgba(10,16,23,.98));box-shadow:0 12px 34px rgba(0,0,0,.3)}
      .life-atlas-map{position:relative;height:min(43vw,590px);min-height:390px;overflow:hidden;background:linear-gradient(180deg,rgba(9,15,18,.2),transparent 28%,transparent 76%,rgba(9,15,18,.18)),url('/images/aden-expedition-map.webp') center 48%/cover no-repeat,#172026}
      .life-atlas-map:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(7,13,16,.64),transparent 18%,transparent 77%,rgba(7,13,16,.34))}
      .life-atlas-heading{position:absolute;z-index:3;top:16px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .life-atlas-node{position:absolute;z-index:2;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;min-width:82px;padding:4px;border:0;background:transparent;color:#fff4d5;cursor:pointer;text-align:center;text-shadow:0 2px 6px #000}
      .life-atlas-node:disabled{cursor:not-allowed;opacity:.62;filter:saturate(.5)}
      .life-atlas-pin{width:39px;height:39px;display:grid;place-items:center;border:1px solid color-mix(in srgb,var(--atlas-accent) 78%,white);border-radius:50%;background:radial-gradient(circle at 34% 26%,rgba(54,66,70,.98),rgba(12,21,26,.98) 76%);box-shadow:0 0 0 4px rgba(10,14,16,.36),0 4px 12px rgba(0,0,0,.6);font-size:18px;transition:transform .16s,box-shadow .16s}
      .life-atlas-node:hover .life-atlas-pin,.life-atlas-node.is-active .life-atlas-pin{transform:scale(1.13);border-color:#ffe9a3;box-shadow:0 0 0 5px rgba(10,14,16,.38),0 0 24px color-mix(in srgb,var(--atlas-accent) 75%,transparent)}
      .life-atlas-node.is-active .life-atlas-pin{background:radial-gradient(circle at 34% 26%,color-mix(in srgb,var(--atlas-accent) 55%,#354148),#111b21 78%)}
      .life-atlas-name{max-width:128px;font:600 10px/1.15 'Cinzel',serif;color:#fff4dc}
      .life-atlas-brief{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(250px,2fr) auto;gap:18px;align-items:center;padding:14px 18px;border-top:1px solid rgba(212,167,68,.28)}
      .life-atlas-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border:1px solid rgba(255,255,255,.14);border-radius:20px;background:rgba(6,12,17,.55);font-size:10px;color:#e8e4d5;margin:2px 4px 2px 0}
      @media(max-width:720px){.life-atlas-map{height:420px;min-height:420px;background-size:cover}.life-atlas-heading{top:12px;left:12px;right:12px}.life-atlas-node{min-width:58px}.life-atlas-pin{width:33px;height:33px;font-size:15px}.life-atlas-name{font-size:8px;max-width:82px}.life-atlas-brief{grid-template-columns:1fr 1fr;gap:8px;padding:12px}.life-atlas-brief .life-atlas-resources{grid-column:1/-1}.life-atlas-brief .life-atlas-action{grid-column:1/-1}}
    </style>
    <section class="life-atlas-wrap" style="--atlas-accent:${accent};">
      <div class="life-atlas-map">
        <header class="life-atlas-heading">
          <div style="max-width:min(70%,620px);padding:9px 12px;border:1px solid rgba(212,167,68,.35);border-radius:9px;background:rgba(8,14,18,.78);backdrop-filter:blur(5px);">
            <div style="font:700 9px 'Cinzel',serif;letter-spacing:1.8px;text-transform:uppercase;color:${accent};">Mapa de Aden · ${escapeText(title)}</div>
            <div style="font:600 12px/1.3 'Cinzel',serif;color:#f6e7bf;margin-top:3px;">${escapeText(subtitle)}</div>
          </div>
          <div style="padding:7px 10px;border:1px solid rgba(212,167,68,.28);border-radius:8px;background:rgba(8,14,18,.78);font-size:10px;color:#e3dfd1;text-align:right;white-space:nowrap;">${unlockedCount}/${zones.length} zonas abertas<br/><span style="color:#8de0b4;">● ${escapeText(activeZone?.name || 'Região')}</span></div>
        </header>
        ${zones.map((zone, index) => {
          const [x, y] = points[index % points.length];
          const unlocked = playerLevel >= zone.minLevel && activityLevel >= (zone.minSkillLevel || 1);
          const selected = zone.id === activeZoneId;
          const requirements = `Personagem ${zone.minLevel}+ · Maestria ${zone.minSkillLevel || 1}+`;
          return `<button class="life-atlas-node ${selected ? 'is-active' : ''}" style="left:${x}%;top:${y}%;" onclick="${unlocked ? `window.${selectHandler}('${escapeText(zone.id)}')` : ''}" ${unlocked ? '' : 'disabled'} aria-label="${escapeText(zone.name)} · ${unlocked ? 'aberta' : requirements}" title="${escapeText(zone.name)} · ${unlocked ? 'Selecionar região' : `Requer ${requirements}`}" aria-pressed="${selected}"><span class="life-atlas-pin">${unlocked ? zone.icon : '🔒'}</span><span class="life-atlas-name">${escapeText(zone.name)}</span><span style="font-size:8px;color:${selected ? '#a7f3d0' : unlocked ? '#f7e5b4' : '#fca5a5'};">${selected ? '● ATIVA' : unlocked ? `NV. ${zone.minLevel}+` : `🔒 NV. ${zone.minLevel}+ · PROF. ${zone.minSkillLevel || 1}+`}</span></button>`;
        }).join('')}
        <div style="position:absolute;z-index:2;bottom:9px;left:14px;padding:4px 7px;border-radius:4px;background:rgba(8,14,18,.62);font:8px 'Cinzel',serif;letter-spacing:1px;color:rgba(255,242,205,.7);">ADEN · CARTOGRAFIA DE EXPLORAÇÃO</div>
      </div>
      <div class="life-atlas-brief">
        <div><div style="font:700 9px 'Cinzel',serif;text-transform:uppercase;letter-spacing:1px;color:${accent};">Região selecionada</div><div style="font:600 14px 'Cinzel',serif;color:#f4dfa6;margin-top:3px;">${escapeText(activeZone?.icon || '⌖')} ${escapeText(activeZone?.name || '')}</div><div style="font-size:10px;color:#9caaba;margin-top:3px;">Nível ${activeZone?.minLevel || 1}+ · Ameaça ${'★'.repeat(activeZone?.difficulty || 1)}</div></div>
        <div class="life-atlas-resources"><div style="font-size:9px;color:#9caaba;text-transform:uppercase;letter-spacing:.7px;margin-bottom:3px;">${escapeText(resourceLabel)} nesta região</div>${activeNames.map(name => `<span class="life-atlas-chip">${name}</span>`).join('') || '<span class="life-atlas-chip">Consultar exploração</span>'}${resourceNames.length > 4 ? `<span class="life-atlas-chip">+${resourceNames.length - 4} espécies</span>` : ''}</div>
        <div class="life-atlas-action"><div style="font-size:9px;color:#9caaba;">${escapeText(requirementLabel)}</div><div style="font-size:11px;color:#f1e9d7;font-weight:700;">${escapeText(requirementValue || 'Sem requisito')}</div><div style="font-size:9px;color:#9caaba;margin-top:6px;">${escapeText(cycleLabel)} · ${escapeText(cycleValue || 'Variável')}</div></div>
        <p style="grid-column:1/-1;margin:0;font-size:11px;line-height:1.45;color:#b8c1c8;">${escapeText(activeZone?.description || '')}</p>
        ${mechanicSummary ? `<div style="grid-column:1/-1;padding:8px 10px;border-left:2px solid ${accent};background:rgba(5,11,15,.32);font-size:10px;line-height:1.4;color:#d5dfdf;"><strong style="color:${accent};">Como funciona</strong> · ${escapeText(mechanicSummary)}</div>` : ''}
      </div>
    </section>
  `;
}
