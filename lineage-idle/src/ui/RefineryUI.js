// RefineryUI.js — Interface da Bancada de Refino da Forja Imperial
import { RefineryService, REFINERY_RECIPES } from '../services/lifeActivities/RefineryService.js';
import { RESOURCE_DICTIONARY } from '../services/lifeActivities/ResourceDictionary.js';

let _activeRefineryCategory = 'all';

export function renderForgeRefinery(container, state, callbacks = {}) {
  if (!container || !state) return;

  const categories = [
    { id: 'all', name: 'Todos os Refinos', icon: '⚗️' },
    { id: 'wood', name: 'Madeira & Fibras', icon: '🪵' },
    { id: 'leather', name: 'Curtume & Peles', icon: '🛡️' },
    { id: 'metal', name: 'Metalurgia Imperial', icon: '⛏️' },
    { id: 'alchemy', name: 'Alquimia & Reagentes', icon: '🧪' }
  ];

  const recipes = RefineryService.getRecipes(_activeRefineryCategory);

  let filterButtonsHtml = '';
  for (const cat of categories) {
    const isActive = _activeRefineryCategory === cat.id;
    filterButtonsHtml += `
      <button
        onclick="window.setRefineryCategory('${cat.id}')"
        style="
          padding: 6px 12px;
          font-family: 'Cinzel', serif;
          font-size: 11px;
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: ${isActive ? 'linear-gradient(180deg,#34d399,#059669)' : 'rgba(18,22,34,0.8)'};
          border: 1px solid ${isActive ? '#6ee7b7' : 'rgba(52,211,153,0.3)'};
          color: ${isActive ? '#000' : '#a7f3d0'};
          box-shadow: ${isActive ? '0 0 10px rgba(52,211,153,0.4)' : 'none'};
        "
      >
        ${cat.icon} ${cat.name}
      </button>
    `;
  }

  let recipesCardsHtml = '';
  if (recipes.length === 0) {
    recipesCardsHtml = `
      <div style="grid-column: 1 / -1; padding: 24px; text-align: center; color: #94a3b8; font-style: italic;">
        Nenhuma receita nesta categoria.
      </div>
    `;
  } else {
    for (const rec of recipes) {
      const maxPossible = RefineryService.calculateMaxRefinements(state, rec.id);
      const outDef = RESOURCE_DICTIONARY[rec.output.matId] || { name: rec.name, icon: rec.icon };
      const currentOutputCount = RefineryService.getMaterialCount(state, rec.output.matId);

      let inputsHtml = '';
      for (const inp of rec.inputs) {
        const matDef = RESOURCE_DICTIONARY[inp.matId] || { name: inp.matId, icon: 'materials/stem.png' };
        const have = RefineryService.getMaterialCount(state, inp.matId);
        const hasEnough = have >= inp.qty;

        inputsHtml += `
          <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(0,0,0,0.4);
            border: 1px solid ${hasEnough ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'};
            border-radius: 6px;
            padding: 4px 8px;
          ">
            <img src="/img/icons/${matDef.icon}" style="width:20px; height:20px; object-fit:contain; border-radius:3px;" onerror="this.src='/img/icons/materials/stem.png'" />
            <div style="font-size: 10px;">
              <span style="color: #cbd5e1;">${matDef.name}</span>
              <div style="font-weight: bold; color: ${hasEnough ? '#34d399' : '#f87171'};">
                ${have} / ${inp.qty}
              </div>
            </div>
          </div>
        `;
      }

      recipesCardsHtml += `
        <div style="
          background: rgba(18, 22, 34, 0.9);
          border: 1px solid rgba(212,167,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          transition: border-color 0.2s;
        ">
          <div>
            <!-- Cabeçalho da Receita -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="/img/icons/${outDef.icon}" style="width:28px; height:28px; object-fit:contain; border:1px solid rgba(212,167,68,0.4); border-radius:4px; background:rgba(0,0,0,0.5); padding:2px;" onerror="this.src='/img/icons/materials/steel.png'" />
                <div>
                  <h4 style="margin: 0; font-family: 'Cinzel', serif; font-size: 13px; color: #f4d58a;">${rec.name}</h4>
                  <div style="font-size: 9px; color: #94a3b8;">Estoque: <strong style="color:#ffd877;">${currentOutputCount}</strong> | +${rec.forgeExp} EXP Forja</div>
                </div>
              </div>
              <span style="font-size: 10px; color: #ffd877; background: rgba(212,167,68,0.15); border: 1px solid rgba(212,167,68,0.3); border-radius: 4px; padding: 2px 6px; font-weight: bold;">
                🪙 ${rec.adenaCost.toLocaleString()} Adena
              </span>
            </div>

            <p style="margin: 0 0 10px 0; font-size: 10px; color: #aaa; line-height: 1.3;">
              ${rec.desc}
            </p>

            <!-- Materiais Requeridos ➔ Saída -->
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              ${inputsHtml}
              <span style="color: #6ee7b7; font-size: 14px; font-weight: bold;">➔</span>
              <div style="
                display: flex;
                align-items: center;
                gap: 6px;
                background: rgba(52,211,153,0.1);
                border: 1px solid rgba(52,211,153,0.4);
                border-radius: 6px;
                padding: 4px 8px;
              ">
                <img src="/img/icons/${outDef.icon}" style="width:20px; height:20px; object-fit:contain;" onerror="this.src='/img/icons/materials/steel.png'" />
                <span style="font-size: 10px; font-weight: bold; color: #6ee7b7;">+${rec.output.qty} ${outDef.name}</span>
              </div>
            </div>
          </div>

          <!-- Botões de Ação de Refino -->
          <div style="display: flex; gap: 6px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 10px;">
            <button
              onclick="window.refineMaterial('${rec.id}', 1)"
              ${maxPossible < 1 ? 'disabled' : ''}
              style="
                flex: 1;
                padding: 6px 4px;
                font-size: 10px;
                font-weight: bold;
                background: ${maxPossible >= 1 ? 'linear-gradient(180deg,#34d399,#059669)' : 'rgba(50,50,50,0.4)'};
                border: 1px solid ${maxPossible >= 1 ? '#6ee7b7' : '#555'};
                color: ${maxPossible >= 1 ? '#000' : '#777'};
                border-radius: 6px;
                cursor: ${maxPossible >= 1 ? 'pointer' : 'not-allowed'};
              "
            >
              Refinar x1
            </button>
            <button
              onclick="window.refineMaterial('${rec.id}', 10)"
              ${maxPossible < 10 ? 'disabled' : ''}
              style="
                flex: 1;
                padding: 6px 4px;
                font-size: 10px;
                font-weight: bold;
                background: ${maxPossible >= 10 ? 'linear-gradient(180deg,#3b82f6,#1d4ed8)' : 'rgba(50,50,50,0.4)'};
                border: 1px solid ${maxPossible >= 10 ? '#93c5fd' : '#555'};
                color: ${maxPossible >= 10 ? '#fff' : '#777'};
                border-radius: 6px;
                cursor: ${maxPossible >= 10 ? 'pointer' : 'not-allowed'};
              "
            >
              Refinar x10
            </button>
            <button
              onclick="window.refineMaterialMax('${rec.id}')"
              ${maxPossible <= 0 ? 'disabled' : ''}
              style="
                flex: 1.3;
                padding: 6px 6px;
                font-size: 10px;
                font-weight: bold;
                font-family: 'Cinzel', serif;
                background: ${maxPossible > 0 ? 'linear-gradient(180deg,#d4a744,#8a641c)' : 'rgba(50,50,50,0.4)'};
                border: 1px solid ${maxPossible > 0 ? '#ffe699' : '#555'};
                color: ${maxPossible > 0 ? '#000' : '#777'};
                border-radius: 6px;
                cursor: ${maxPossible > 0 ? 'pointer' : 'not-allowed'};
              "
            >
              Refinar Máx (${maxPossible})
            </button>
          </div>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <!-- Banner Informativo -->
      <div style="
        background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(18,22,34,0.95));
        border: 1px solid rgba(52,211,153,0.35);
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      ">
        <div>
          <h3 style="margin: 0; font-family: 'Cinzel', serif; color: #6ee7b7; font-size: 16px;">
            ⚗️ Bancada de Refino de Materiais (Life Activities 2.0)
          </h3>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">
            Transforme madeira, peles, ossos, minérios e ervas colhidos nas atividades de vida em materiais nobres para a Forja Imperial.
          </p>
        </div>
        <div style="font-size: 11px; color: #ffd877; background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(212,167,68,0.3);">
          🪙 Ouro: <strong style="color:#fde047;">${(state.gold || 0).toLocaleString()} Adena</strong>
        </div>
      </div>

      <!-- Filtros de Categoria -->
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${filterButtonsHtml}
      </div>

      <!-- Grid de Receitas de Refino -->
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 12px;
      ">
        ${recipesCardsHtml}
      </div>
    </div>
  `;
}

export function setRefineryCategory(category) {
  _activeRefineryCategory = category;
  if (typeof window !== 'undefined' && typeof window.updateCraftUI === 'function') {
    window.updateCraftUI(window.state);
  }
}
