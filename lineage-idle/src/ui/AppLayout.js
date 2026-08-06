/**
 * AppLayout.js — Layout Split Batalha | Painel
 * Esquerda: #stage + log rolando
 * Direita: Inventário / Baú / Habilidades / etc (só 1 visível por vez)
 * Funciona dentro do Shadow DOM #idle-host
 */
const STYLE_ID = 'app-split-layout-styles';

export function ensureAppLayout() {
  const host = document.getElementById('idle-host');
  const root = host?.shadowRoot || document;
  if (!root || root.querySelector(`#${STYLE_ID}`)) return;

  // injetar CSS do split
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = LAYOUT_CSS;
  (host?.shadowRoot || document.head).appendChild(style);

  // tenta achar o main onde estão #stage e os painéis
  const stage = root.querySelector('#stage');
  if (!stage) return;

  const main = stage.parentElement;
  if (!main || main.id === 'app-split-layout') return;

  // cria wrapper split
  const wrapper = document.createElement('div');
  wrapper.id = 'app-split-layout';

  const left = document.createElement('div');
  left.id = 'app-battle-col';
  
  const right = document.createElement('div');
  right.id = 'app-panel-col';

  // move stage + elementos de batalha pra esquerda
  const battleEls = [
    stage,
    root.querySelector('#battle-log'),
    root.querySelector('#combat-log'),
    root.querySelector('.battle-log'),
  ].filter(Boolean);
  
  // se não achou log, pega o irmão direto do stage
  if(battleEls.length === 1) {
     // tenta pegar o que vem depois do stage (log)
     let next = stage.nextElementSibling;
     if(next) battleEls.push(next);
  }

  // move painéis pra direita (tudo que parece painel de menu)
  const panels = [...root.querySelectorAll('[id*="inventory"], [id*="warehouse"], [id*="skill"], [id*="shop"], [id*="forge"], [id*="codex"], #inventory-panel')];
  // fallback: pega todos os filhos do main que não são battle
  const allMainChildren = [...main.children];
  const otherPanels = allMainChildren.filter(el => !battleEls.includes(el) && el.id !== 'app-split-layout');

  wrapper.appendChild(left);
  wrapper.appendChild(right);
  main.appendChild(wrapper);

  battleEls.forEach(el => left.appendChild(el));
  // se não achamos painéis específicos, move o resto
  const toRight = panels.length ? panels : otherPanels;
  toRight.forEach(el => {
    if(el !== wrapper && el.parentElement !== right) right.appendChild(el);
  });
}

const LAYOUT_CSS = `
#app-split-layout {
  display: grid !important;
  grid-template-columns: 480px 1fr !important;
  gap: 12px !important;
  width: 100% !important;
  height: calc(100vh - 105px) !important; /* desconta top bar + nav */
  padding: 10px !important;
  box-sizing: border-box !important;
  align-items: start !important;
  overflow: hidden !important;
}
#app-battle-col {
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
}
#app-battle-col #stage {
  flex: 0 0 380px !important;
  height: 380px !important;
  min-height: 380px !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}
#app-battle-col #battle-log, #app-battle-col #combat-log, #app-battle-col .battle-log {
  flex: 1 !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  background: rgba(0,0,0,0.4) !important;
  border: 1px solid #3a2a1a !important;
  border-radius: 6px !important;
}
#app-panel-col {
  height: 100% !important;
  min-height: 0 !important;
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
}
/* todos os painéis da direita ocupam 100% da coluna */
#app-panel-col > * {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  margin: 0 !important;
  flex: 1 !important;
  min-height: 0 !important;
}
/* esconde painéis inativos - seu sistema já faz via display:none, só garante */
#app-panel-col > [hidden], #app-panel-col > .hidden { display: none !important; }

/* RESPONSIVO */
@media (max-width: 1250px) {
  #app-split-layout { grid-template-columns: 420px 1fr !important; }
}
@media (max-width: 980px) {
  #app-split-layout { 
    grid-template-columns: 1fr !important; 
    height: auto !important;
    overflow: visible !important;
  }
  #app-battle-col #stage { height: 320px !important; min-height: 320px !important; }
}
`;
