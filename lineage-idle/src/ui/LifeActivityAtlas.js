import { getLifeActivityScene } from './LifeActivityAtlasScenes.js';

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
  const scene = getLifeActivityScene(activityId, activeZone?.id);
  const unlockedCount = zones.filter(zone => playerLevel >= zone.minLevel && activityLevel >= (zone.minSkillLevel || 1)).length;

  return `
    <style>
      .life-atlas-wrap{margin:0 0 18px;border:1px solid rgba(212,167,68,.36);border-radius:16px;overflow:hidden;background:linear-gradient(145deg,rgba(18,25,33,.98),rgba(10,16,23,.98));box-shadow:0 12px 34px rgba(0,0,0,.3)}
      .life-atlas-map{position:relative;height:min(43vw,590px);min-height:390px;overflow:hidden;background-image:linear-gradient(180deg,rgba(9,15,18,.12),rgba(9,15,18,.05) 38%,rgba(9,15,18,.24)),url('${scene?.background || '/img/Maps/emeraldgrove.jpg'}');background-position:center 48%;background-size:cover;background-repeat:no-repeat;background-color:#172026;transition:background-image .2s ease}
      .life-atlas-map:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(7,13,16,.64),transparent 18%,transparent 77%,rgba(7,13,16,.34))}
      .life-atlas-heading{position:absolute;z-index:3;top:16px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .life-atlas-location{position:absolute;z-index:2;left:18px;bottom:20px;display:grid;gap:3px;max-width:min(72%,360px);padding:9px 12px;border:1px solid color-mix(in srgb,var(--atlas-accent) 58%,transparent);border-radius:10px;background:rgba(7,12,17,.78);box-shadow:0 6px 20px rgba(0,0,0,.35);backdrop-filter:blur(5px)}
      .life-atlas-location span{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--atlas-accent)}
      .life-atlas-location strong{font:700 15px/1.2 'Cinzel',serif;color:#fff0cb}
      .life-atlas-zone-picker{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,165px),1fr));gap:7px;padding:10px 12px;border-top:1px solid rgba(212,167,68,.2);background:rgba(7,11,16,.75)}
      .life-atlas-zone-option{min-width:0;display:grid;grid-template-columns:30px 1fr;align-items:center;gap:7px;padding:7px 9px;border:1px solid rgba(255,255,255,.09);border-radius:8px;background:rgba(15,20,27,.82);color:#d7dce0;text-align:left;cursor:pointer;transition:border-color .16s,background .16s,transform .16s}
      .life-atlas-zone-option:hover:not(:disabled){transform:translateY(-1px);border-color:color-mix(in srgb,var(--atlas-accent) 60%,transparent)}
      .life-atlas-zone-option.is-active{border-color:color-mix(in srgb,var(--atlas-accent) 75%,white);background:color-mix(in srgb,var(--atlas-accent) 15%,#101722);color:#fff2cf}
      .life-atlas-zone-option:disabled{cursor:not-allowed;opacity:.55}
      .life-atlas-zone-icon{display:grid;place-items:center;width:29px;height:29px;border-radius:7px;background:rgba(0,0,0,.28);font-size:16px}
      .life-atlas-zone-copy{min-width:0;display:grid;gap:2px}
      .life-atlas-zone-copy strong{overflow:hidden;font:600 10px/1.2 'Cinzel',serif;text-overflow:ellipsis;white-space:nowrap}
      .life-atlas-zone-copy small{font-size:8px;color:#aab3bd}
      .life-atlas-brief{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(250px,2fr) auto;gap:18px;align-items:center;padding:14px 18px;border-top:1px solid rgba(212,167,68,.28)}
      .life-atlas-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 8px;border:1px solid rgba(255,255,255,.14);border-radius:20px;background:rgba(6,12,17,.55);font-size:10px;color:#e8e4d5;margin:2px 4px 2px 0}
      @media(max-width:720px){.life-atlas-map{height:360px;min-height:360px;background-size:cover}.life-atlas-heading{top:12px;left:12px;right:12px}.life-atlas-location{left:12px;bottom:12px}.life-atlas-zone-picker{grid-template-columns:repeat(2,minmax(0,1fr));padding:8px}.life-atlas-brief{grid-template-columns:1fr 1fr;gap:8px;padding:12px}.life-atlas-brief .life-atlas-resources{grid-column:1/-1}.life-atlas-brief .life-atlas-action{grid-column:1/-1}}
    </style>
    <section class="life-atlas-wrap" style="--atlas-accent:${accent};">
      <div class="life-atlas-map">
        <header class="life-atlas-heading">
          <div style="max-width:min(70%,620px);padding:9px 12px;border:1px solid rgba(212,167,68,.35);border-radius:9px;background:rgba(8,14,18,.78);backdrop-filter:blur(5px);">
            <div style="font:700 9px 'Cinzel',serif;letter-spacing:1.8px;text-transform:uppercase;color:${accent};">Atlas da profissão · ${escapeText(title)}</div>
            <div style="font:600 12px/1.3 'Cinzel',serif;color:#f6e7bf;margin-top:3px;">${escapeText(subtitle)}</div>
          </div>
          <div style="padding:7px 10px;border:1px solid rgba(212,167,68,.28);border-radius:8px;background:rgba(8,14,18,.78);font-size:10px;color:#e3dfd1;text-align:right;white-space:nowrap;">${unlockedCount}/${zones.length} zonas abertas<br/><span style="color:#8de0b4;">● ${escapeText(activeZone?.name || 'Região')}</span></div>
        </header>
        <div class="life-atlas-location"><span>Região ativa</span><strong>${escapeText(activeZone?.icon || '⌖')} ${escapeText(activeZone?.name || 'Aden')}</strong></div>
      </div>
      <nav class="life-atlas-zone-picker" aria-label="Escolher região de ${escapeText(title)}">
        ${zones.map(zone => {
          const unlocked = playerLevel >= zone.minLevel && activityLevel >= (zone.minSkillLevel || 1);
          const selected = zone.id === activeZoneId;
          const requirements = `Requer Nv. ${zone.minLevel}+ · Prof. ${zone.minSkillLevel || 1}+`;
          return `<button class="life-atlas-zone-option ${selected ? 'is-active' : ''}" onclick="${unlocked ? `window.${selectHandler}('${escapeText(zone.id)}')` : ''}" ${unlocked ? '' : 'disabled'} aria-label="${escapeText(zone.name)} · ${unlocked ? 'disponível' : requirements}" title="${escapeText(zone.name)} · ${unlocked ? 'Selecionar região' : requirements}" aria-pressed="${selected}"><span class="life-atlas-zone-icon">${unlocked ? escapeText(zone.icon) : '🔒'}</span><span class="life-atlas-zone-copy"><strong>${escapeText(zone.name)}</strong><small>${selected ? 'REGIÃO ATIVA' : unlocked ? `NÍVEL ${zone.minLevel}+` : requirements}</small></span></button>`;
        }).join('')}
      </nav>
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
