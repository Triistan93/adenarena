/**
 * GameBootstrap.js — Orquestrador Central de Inicialização e Ciclo de Vida do Lineage Idle.
 *
 * Responsável por executar o boot em ordem determinística:
 * 1. Definir Root do Shadow DOM
 * 2. Carregar Dados de Jogo (Items, Classes, Zonas, Monstros)
 * 3. Inicializar Estado (StateManager / LocalStorage / Default)
 * 4. Inicializar Personagem e Stats
 * 5. Conectar EventBus e UI Passiva
 * 6. Iniciar Combate e Loops Globais
 */

import EventBus from './EventBus.js';
import { setRoot, _intervals, addTrackedListener, cleanupTracked, el } from './DomHelpers.js';
import { getState, setState, loadState, saveState, DEFAULT_STATE } from './StateManager.js';
import { getStats, getClass } from '../engine/StatsEngine.js';
import { RACES } from '../data/races.js';
import { startCombat, stopCombat } from '../engine/CombatEngine.js';
import { updateAllUI } from '../ui/index.js';

let isBootstrapped = false;

/**
 * Orquestra a inicialização completa do jogo no Shadow DOM.
 * @param {Document|ShadowRoot} shadowRoot
 */
export async function bootstrap(shadowRoot) {
  if (shadowRoot) {
    setRoot(shadowRoot);
  }

  try {
    // 1. Carrega o estado salvo ou inicializa padrão
    const hasSave = loadState();
    let state = getState();

    // 2. Se for novo jogador, define raça/classe padrão e calcula atributos base
    if (!hasSave || !state.race || !state.class) {
      state.race = state.race || 'human';
      state.class = state.class || 'fighter';
      
      const raceDef = RACES[state.race] || { stats: {} };
      const classDef = getClass(state.class) || { base: {} };
      state.base = { atk: 0, def: 0, eva: 0, matk: 0, mdef: 0 };
      for (const k of ['atk', 'def', 'eva', 'matk', 'mdef']) {
        state.base[k] = (raceDef.stats?.[k] || 0) + (classDef.base?.[k] || 0);
      }
      setState(state);
    }

    state.startTime = state.startTime || Date.now();

    // 3. Conecta o EventBus para reatividade da UI passiva
    EventBus.off('state:updated');
    EventBus.on('state:updated', (newState) => {
      try {
        updateAllUI(newState);
      } catch (err) {
        console.warn('[GameBootstrap] Erro na atualização reativa da UI:', err);
      }
    });

    // 4. Força renderização inicial de toda a UI
    updateAllUI(state);

    // 5. Inicia o combate se houver uma zona selecionada
    if (state.zone) {
      startCombat(state);
    }

    // 6. Registra os loops de tempo, save automático e relógio
    _intervals.push(setInterval(() => {
      const s = getState();
      const now = Date.now();
      const startTime = Number(s.startTime) || now;
      const totalPlaytime = Number(s.totalPlaytime) || 0;
      const elapsed = Math.max(0, Math.floor((now - startTime + totalPlaytime) / 1000));
      const h = Math.floor(elapsed / 3600);
      const m = Math.floor((elapsed % 3600) / 60);
      const sec = elapsed % 60;
      const clockEl = el('clock');
      if (clockEl) {
        clockEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      }
    }, 1000));

    _intervals.push(setInterval(() => {
      saveState(false);
    }, 10000));

    // 7. Configura listeners de unload para salvamento na nuvem/local
    const syncOnUnload = () => {
      saveState(true);
      if (typeof window !== 'undefined' && typeof window.saveCloudOnUnload === 'function') {
        window.saveCloudOnUnload();
      }
    };

    const targetDoc = typeof document !== 'undefined' ? document : null;
    if (targetDoc) {
      addTrackedListener(window, 'beforeunload', syncOnUnload);
      addTrackedListener(window, 'pagehide', syncOnUnload);
      addTrackedListener(targetDoc, 'visibilitychange', () => {
        if (targetDoc.visibilityState === 'hidden') syncOnUnload();
      });
    }

    isBootstrapped = true;
    console.log('[GameBootstrap] Jogo inicializado com sucesso em modo modular reativo!');
  } catch (err) {
    console.error('[GameBootstrap] Falha crítica na inicialização:', err);
  }
}

/**
 * Finaliza os loops e desfaz inscrições de evento ao desmontar o jogo.
 */
export function destroyBootstrap() {
  stopCombat();
  cleanupTracked();
  isBootstrapped = false;
  console.log('[GameBootstrap] Recursos limpos e destruídos.');
}
