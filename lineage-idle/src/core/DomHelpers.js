/**
 * DomHelpers — Utilitários de manipulação do Shadow DOM do Lineage Idle.
 *
 * Centraliza as referências ao ROOT (Shadow Root), funções de query,
 * criação de elementos e rastreamento de event listeners/intervals.
 *
 * O ROOT é injetado pelo IdleGame.tsx via setRoot() antes de init() ser chamado.
 */

/** @type {Document|ShadowRoot} Root do Shadow DOM */
let ROOT = document;

/** @type {number[]} IDs de setInterval rastreados para limpeza no destroy() */
export const _intervals = [];

/** @type {Array<{target, event, handler, opts}>} Event listeners rastreados */
export const _listeners = [];

/**
 * Define o root do Shadow DOM.
 * Chamado por IdleGame.tsx antes de init().
 * @param {Document|ShadowRoot} r
 */
export function setRoot(r) {
  ROOT = r;
}

/**
 * Registra e adiciona um event listener rastreado (removido no destroy()).
 * @param {EventTarget} target
 * @param {string} event
 * @param {Function} handler
 * @param {AddEventListenerOptions} [opts]
 */
export function addTrackedListener(target, event, handler, opts) {
  target.addEventListener(event, handler, opts);
  _listeners.push({ target, event, handler, opts });
}

/** Retorna o elemento pelo ID dentro do Shadow DOM */
export const el  = id  => ROOT.getElementById(id);

/** querySelector no Shadow DOM */
export const qs  = sel => ROOT.querySelector(sel);

/** querySelectorAll no Shadow DOM */
export const qsa = sel => ROOT.querySelectorAll(sel);

/** Retorna o documento raiz (para eventos globais) */
export const doc = ()  => ROOT.ownerDocument || document;

/** Cria um elemento HTML */
export const mkEl = tag => document.createElement(tag);

/** Cria um elemento SVG/namespace */
export const mkNS = (ns, tag) => document.createElementNS(ns, tag);

/**
 * Atualiza a barra de progresso (HP, MP, XP).
 * @param {string} id   — ID do elemento .bar-fill
 * @param {number} cur  — Valor atual
 * @param {number} max  — Valor máximo
 */
export function updateBar(id, cur, max) {
  let el_ = el(id);
  if (el_ && (id.endsWith('-bar') || el_.classList.contains('stage-hp-bar') || el_.classList.contains('bar-container'))) {
    const fill = el_.querySelector('.stage-hp-fill, .stage-mp-fill, .m-hp-fill, .bar-fill, .bar, [id$="-fill"]');
    if (fill) el_ = fill;
  }
  if (!el_) return;
  const pct = max > 0 ? Math.min(100, Math.max(0, (cur / max) * 100)) : 0;
  el_.style.width = pct + '%';
  el_.setAttribute('aria-valuenow', Math.round(cur));
  el_.setAttribute('aria-valuemax', Math.round(max));
}

/**
 * Wrapper de segurança para atualizações de UI — captura erros sem travar o jogo.
 * @param {string}   label — Nome do módulo (para logging)
 * @param {Function} fn    — Função de atualização
 */
export function safeUiUpdate(label, fn) {
  try {
    fn();
  } catch (err) {
    console.warn(`UI update failed (${label}):`, err);
  }
}

/**
 * Remove todos os intervals e event listeners rastreados.
 * Chamado por destroy() em main.js.
 */
export function cleanupTracked() {
  _intervals.forEach(id => clearInterval(id));
  _intervals.length = 0;
  _listeners.forEach(({ target, event, handler, opts }) => {
    target.removeEventListener(event, handler, opts);
  });
  _listeners.length = 0;
}
