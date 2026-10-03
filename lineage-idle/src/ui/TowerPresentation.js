export function renderTowerJourney(highestFloor, getFloorDef) {
  const highest = Math.max(0, Math.min(100, Number(highestFloor) || 0));
  return Array.from({ length: 10 }, (_, index) => {
    const chapter = index + 1;
    const start = (index * 10) + 1;
    const end = chapter * 10;
    const cleared = Math.max(0, Math.min(10, highest - (start - 1)));
    const progress = Math.round((cleared / 10) * 100);
    const boss = getFloorDef(end);
    const status = cleared === 10 ? 'Concluído' : cleared > 0 ? `${cleared}/10 andares` : 'À frente';
    const bossName = boss?.name || `Guardião do ${end}º andar`;
    return `<article class="tower-chapter-card ${cleared === 10 ? 'is-complete' : cleared > 0 ? 'is-active' : ''}" data-chapter="${chapter}">
      <div class="tower-chapter-heading"><span>Capítulo ${String(chapter).padStart(2, '0')}</span><strong>${start}–${end}</strong></div>
      <div class="tower-chapter-progress" role="progressbar" aria-label="Progresso do capítulo ${chapter}" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"><span style="width:${progress}%"></span></div>
      <div class="tower-chapter-status">${status}</div>
      <div class="tower-chapter-boss"><span>👑 Chefe de marco</span><strong>${bossName}</strong></div>
    </article>`;
  }).join('');
}
