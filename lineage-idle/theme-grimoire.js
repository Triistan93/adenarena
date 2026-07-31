// ================================================================
// theme-grimoire.js — helpers vanilla JS para o tema "O Grimório"
// Salve como lineage-idle/theme-grimoire.js e inclua depois do CSS:
// <script src="./theme-grimoire.js"></script>
// ================================================================
(function (root) {
  const GrimoireFX = {};

  // ---- 1) Sparks/embers subindo dentro de um container ----------
  // Uso: GrimoireFX.mountEmbers(document.getElementById('emberField'))
  GrimoireFX.mountEmbers = function (container, opts = {}) {
    if (!container) return () => {};
    const count = opts.count ?? 22;
    const colors = opts.colors ?? ['#f0883e', '#539bf5', '#f0cd7e'];

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.className = 'ember';
      const size = 2 + ((i * 7) % 4);
      const dur = 8 + ((i * 13) % 9);
      const delay = -((i * 17) % 12);
      const drift = ((i % 5) - 2) * 26;
      const opacity = 0.25 + ((i * 11) % 50) / 100;
      const color = colors[i % colors.length];

      span.style.left = ((i * 37 + 13) % 100) + '%';
      span.style.setProperty('--es', size + 'px');
      span.style.setProperty('--ed', dur + 's');
      span.style.setProperty('--edel', delay + 's');
      span.style.setProperty('--ex', drift + 'px');
      span.style.setProperty('--eo', String(opacity));
      span.style.setProperty('--ec', color);
      frag.appendChild(span);
    }
    container.classList.add('ember-field');
    container.appendChild(frag);
    return () => { container.innerHTML = ''; };
  };

  // ---- 2) Reveal on scroll (adiciona .is-in quando entra na tela) --
  // Uso: GrimoireFX.observeReveals('.reveal, .mask-line')
  GrimoireFX.observeReveals = function (selector = '.reveal', opts = {}) {
    const els = document.querySelectorAll(selector);
    if (!('IntersectionObserver' in root)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: opts.threshold ?? 0.15, rootMargin: opts.rootMargin ?? '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
  };

  // ---- 3) Dispara/reinicia o carimbo (útil quando o item aparece) --
  // Uso: GrimoireFX.stamp(document.querySelector('.stamp'))
  GrimoireFX.stamp = function (el) {
    if (!el) return;
    el.style.animation = 'none';
    // força reflow pra poder tocar a animação de novo
    void el.offsetWidth;
    el.style.animation = '';
  };

  // ---- 4) Cria um carimbo dinamicamente (ex: ao lootar item raro) --
  // Uso: GrimoireFX.spawnStamp(container, { text: 'LENDÁRIO', sub: 'dragon slayer', rarity: 'legendary' })
  GrimoireFX.spawnStamp = function (container, { text = 'CORRIGIDO', sub = '', rarity = 'uncommon', duration = 2400 } = {}) {
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'stamp stamp-' + rarity;
    el.innerHTML =
      '<p class="stamp-text">' + text + '</p>' +
      (sub ? '<p class="stamp-sub">' + sub + '</p>' : '');
    container.appendChild(el);
    if (duration > 0) {
      setTimeout(() => el.remove(), duration);
    }
    return el;
  };

  // ---- 5) Efeito de scramble de texto (tipo terminal decodificando) --
  // Uso: GrimoireFX.scramble(document.querySelector('#path'), '~/lineage-idle/save.json')
  GrimoireFX.scramble = function (el, text, opts = {}) {
    if (!el) return;
    const glyphs = '!<>-_\\\\/[]{}—=+*^?#$%&@';
    const total = opts.frames ?? 34;
    const startDelay = opts.startDelay ?? 200;
    let frame = 0;
    setTimeout(function tick() {
      frame++;
      const progress = frame / total;
      const settled = Math.floor(progress * text.length);
      let out = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') out += ' ';
        else if (i < settled) out += text[i];
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(() => setTimeout(tick, 16));
      else el.textContent = text;
    }, startDelay);
  };

  // ---- 6) Count-up numérico (ex: gold ganho, xp, dano total) ------
  // Uso: GrimoireFX.countUp(document.querySelector('#gold'), 15230)
  GrimoireFX.countUp = function (el, target, opts = {}) {
    if (!el) return;
    const duration = opts.duration ?? 1300;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  root.GrimoireFX = GrimoireFX;
})(typeof window !== 'undefined' ? window : globalThis);
