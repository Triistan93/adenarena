const TOWER_BOSS_PORTRAITS = Object.freeze({
  10: '/img/bosses/tower_hallate.webp',
  20: '/img/bosses/tower_kernea.webp',
  30: '/img/bosses/tower_varan.webp',
  40: '/img/bosses/tower_kavatan.webp',
  50: '/img/bosses/baium.webp',
  60: '/img/bosses/tower_galaxia.webp',
  70: '/img/bosses/tower_shielhead.webp',
  80: '/img/bosses/tower_golkonda.webp',
  90: '/img/bosses/tower_verdelet.webp',
  100: '/img/bosses/tower_arcanjo.webp'
});

export function getTowerBossPortrait(floor) {
  return TOWER_BOSS_PORTRAITS[Number(floor)] || null;
}

export function renderTowerJourney(highestFloor, getFloorDef) {
  const highest = Math.max(0, Math.min(100, Number(highestFloor) || 0));
  return Array.from({ length: 10 }, (_, index) => {
    const chapter = index + 1;
    const start = (index * 10) + 1;
    const end = chapter * 10;
    const cleared = Math.max(0, Math.min(10, highest - (start - 1)));
    const progress = Math.round((cleared / 10) * 100);
    const boss = getFloorDef(end);
    const chapterIsCurrent = highest + 1 >= start && highest + 1 <= end;
    const status = cleared === 10
      ? 'Concluído'
      : chapterIsCurrent
        ? `Próximo: andar ${highest - start + 2}`
        : cleared > 0
          ? `${cleared}/10 conquistados`
          : 'Bloqueado';
    const bossName = boss?.name || `Guardião do ${end}º andar`;
    const portrait = getTowerBossPortrait(end);
    const chapterState = cleared === 10 ? 'is-complete' : cleared > 0 || highest + 1 >= start ? 'is-active' : 'is-locked';
    return `<article class="tower-chapter-card ${chapterState}" data-chapter="${chapter}" aria-label="Capítulo ${chapter}, andares ${start} a ${end}. ${status}.">
      <div class="tower-chapter-art">
        <img src="${portrait}" alt="${bossName}" loading="lazy" decoding="async">
        <span class="tower-chapter-floor-range">${String(start).padStart(2, '0')}–${String(end).padStart(2, '0')}</span>
        <span class="tower-chapter-state">${status}</span>
      </div>
      <div class="tower-chapter-copy">
        <div class="tower-chapter-heading"><span>CAPÍTULO ${String(chapter).padStart(2, '0')}</span><strong>${progress}%</strong></div>
        <div class="tower-chapter-progress" role="progressbar" aria-label="Progresso do capítulo ${chapter}" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
        <div class="tower-chapter-boss"><span>GUARDIÃO DE MARCO</span><strong>${bossName}</strong></div>
      </div>
    </article>`;
  }).join('');
}
