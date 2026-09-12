/**
 * NextActionAdvisor.js — Conselheiro Inteligente de Ação e Progressão Comercial.
 *
 * Guia o jogador proativamente através do loop comercial de Aden:
 * ENTENDER → EQUIPAR → MELHORAR → ENCANTAR → CUSTOMIZAR → AUMENTAR CP → LIBERAR CONTEÚDO
 *
 * Nunca deixa o jogador sem saber: "O que eu posso fazer agora?"
 */

import { D } from '../core/GameConfig.js';
import { CombatPowerService } from './CombatPowerService.js';
import { generateAutoEquipProposal, commitAutoEquipProposal } from './EquipmentService.js';
import { parseEnchantScroll, isItemCompatibleWithScroll, isEquippableItem } from './ItemClassificationService.js';
import { getEnchantSuccessChance, getSafeEnchantLimit } from './EnchantmentService.js';

export const ADVISOR_PRIORITIES = {
  AUTO_EQUIP: 1,
  UPGRADE: 2,
  ENCHANT: 3,
  FORGE: 4,
  MILESTONE: 5
};

export class NextActionAdvisor {
  /**
   * Avalia holisticamente o estado do jogador e retorna a ação de maior impacto imediato.
   * @param {Object} state
   * @returns {Object} { priority, category, title, description, actionText, actionTab, actionType, actionPayload, currentCp, targetCp, cpRemaining, targetName, icon, badge }
   */
  static getAdvice(state) {
    if (!state) {
      return {
        priority: ADVISOR_PRIORITIES.MILESTONE,
        category: 'MILESTONE',
        title: 'Boas-vindas a Aden',
        description: 'Explore as zonas de caça e inicie sua jornada épica.',
        actionText: '⚔️ Explorar Zonas',
        actionTab: 'zones',
        actionType: 'NAVIGATE',
        currentCp: 0,
        icon: '⚔️',
        badge: 'Jornada'
      };
    }

    const currentCp = CombatPowerService.calculateCombatPower(state);
    const allItems = D()?.ALL_ITEMS || {};
    const inventory = state.inventory || [];
    const equipment = state.equipment || {};

    // 1. PRIORIDADE 1 & 2: AUTO-EQUIP & UPGRADE DE EQUIPAMENTOS
    try {
      const proposal = generateAutoEquipProposal(state);
      if (proposal && proposal.changes && proposal.changes.length > 0 && proposal.deltas?.cpDelta > 0) {
        const hasReplacement = proposal.changes.some(c => c.currentUid && c.proposedUid && c.currentUid !== c.proposedUid);
        if (hasReplacement) {
          return {
            priority: ADVISOR_PRIORITIES.UPGRADE,
            category: 'UPGRADE',
            title: '⬆️ Melhoria de Equipamento Disponível',
            description: 'Equipamentos superiores encontrados na mochila! Substitua itens inferiores para maximizar o CP.',
            actionText: `⬆️ Equipar Melhoria (+${proposal.deltas.cpDelta.toLocaleString()} CP)`,
            actionTab: 'inventory',
            actionType: 'AUTO_EQUIP',
            actionPayload: proposal,
            currentCp,
            icon: '⬆️',
            badge: 'Upgrade'
          };
        } else {
          return {
            priority: ADVISOR_PRIORITIES.AUTO_EQUIP,
            category: 'AUTO_EQUIP',
            title: '⚡ Equipamento Pendente Detectado',
            description: 'Você possui equipamentos na mochila prontos para ocupar slots vazios e fortalecer o herói.',
            actionText: `⚡ Auto-Equipar Agora (+${proposal.deltas.cpDelta.toLocaleString()} CP)`,
            actionTab: 'inventory',
            actionType: 'AUTO_EQUIP',
            actionPayload: proposal,
            currentCp,
            icon: '⚡',
            badge: 'P0 Auto-Equip'
          };
        }
      }
    } catch (e) {
      console.warn('Advisor Auto-Equip check error:', e);
    }

    // 2. PRIORIDADE 3: OPORTUNIDADE DE ENCANTAMENTO
    try {
      const scrollsInInv = inventory.filter(i => {
        if (!i || (i.count || 1) <= 0) return false;
        const def = allItems[i.itemId] || i;
        const sMeta = parseEnchantScroll(def);
        return sMeta && sMeta.isScroll === true;
      });

      if (scrollsInInv.length > 0) {
        // Busca alvos equipados compatíveis com os scrolls disponíveis
        for (const scrollItem of scrollsInInv) {
          const scrollDef = allItems[scrollItem.itemId] || scrollItem;

          for (const [slot, eqUid] of Object.entries(equipment)) {
            if (!eqUid) continue;
            const eqItem = inventory.find(i => i.uid === eqUid);
            if (!eqItem) continue;
            const eqDef = allItems[eqItem.itemId] || eqItem;

            const compat = isItemCompatibleWithScroll(eqDef, scrollDef);
            if (compat && compat.ok) {
              const currentEnc = Number(eqItem.enchant || eqItem.enchantLevel) || 0;
              const safeLimit = getSafeEnchantLimit(eqDef);
              const chance = Math.round(getEnchantSuccessChance(eqDef.grade, currentEnc, safeLimit) * 100);

              return {
                priority: ADVISOR_PRIORITIES.ENCHANT,
                category: 'ENCHANT',
                title: '✨ Oportunidade de Encantamento',
                description: `Você possui ${scrollDef.name || 'Scroll'} pronto para reforçar ${eqDef.name} (+${currentEnc} → +${currentEnc + 1}).`,
                actionText: `✨ Encantar ${eqDef.name} (${chance}% Chance)`,
                actionTab: 'inventory',
                actionType: 'ENCHANT',
                actionPayload: { scrollUid: scrollItem.uid, targetUid: eqItem.uid },
                currentCp,
                icon: '✨',
                badge: 'Refino'
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Advisor Enchant check error:', e);
    }

    // 3. PRIORIDADE 4: FORJA IMPERIAL (CRAFTING DE MATERIAIS)
    try {
      const recipes = D()?.CRAFTING_RECIPES || {};
      const invCounts = new Map();
      for (const item of inventory) {
        if (item && item.itemId) {
          invCounts.set(item.itemId, (invCounts.get(item.itemId) || 0) + (item.count || 1));
        }
      }

      for (const rec of Object.values(recipes)) {
        if (!rec || !rec.materials) continue;
        const targetDef = allItems[rec.itemId || rec.id];
        if (!targetDef || !isEquippableItem(targetDef)) continue;

        let hasAll = true;
        for (const [matId, reqQty] of Object.entries(rec.materials)) {
          if ((invCounts.get(matId) || 0) < reqQty) {
            hasAll = false;
            break;
          }
        }

        if (hasAll) {
          return {
            priority: ADVISOR_PRIORITIES.FORGE,
            category: 'FORGE',
            title: '⚒️ Forja Imperial: Criação Pronta',
            description: `Você coletou materiais suficientes para criar ${targetDef.name}!`,
            actionText: `⚒️ Criar ${targetDef.name} na Forja`,
            actionTab: 'craft',
            actionType: 'NAVIGATE',
            actionPayload: { itemId: targetDef.id || rec.itemId },
            currentCp,
            icon: '⚒️',
            badge: 'Forja'
          };
        }
      }
    } catch (e) {
      console.warn('Advisor Forge check error:', e);
    }

    // 4. PRIORIDADE 5: POWER MILESTONE & DESBLOQUEIO DE CONTEÚDO
    const level = Number(state.level) || 1;
    let targetCp = 1500;
    let targetName = '1ª Transferência de Classe (Lv. 20)';
    let actionTab = 'zones';

    if (level < 20) {
      targetCp = 1500;
      targetName = '1ª Troca de Classe & Armas D-Grade';
      actionTab = 'zones';
    } else if (level < 40) {
      targetCp = 6000;
      targetName = '2ª Troca de Classe & Armas C-Grade';
      actionTab = 'zones';
    } else if (level < 76) {
      targetCp = 25000;
      targetName = '3ª Troca de Classe & Despertar Ancestral';
      actionTab = 'zones';
    } else {
      const towerFloor = (state.tower?.highestFloor || 0) + 1;
      targetCp = towerFloor * 850 + 20000;
      targetName = `Torre da Insolência: Andar ${towerFloor}`;
      actionTab = 'tower';
    }

    const cpRemaining = Math.max(0, targetCp - currentCp);
    const progressPct = Math.min(100, Math.floor((currentCp / targetCp) * 100));

    return {
      priority: ADVISOR_PRIORITIES.MILESTONE,
      category: 'MILESTONE',
      title: `🎯 Próximo Marco: ${targetName}`,
      description: cpRemaining > 0
        ? `Faltam ${cpRemaining.toLocaleString()} CP para atingir o marco de poder com segurança (${progressPct}% Concluído).`
        : `Você atingiu o Poder de Combate recomendado (${currentCp.toLocaleString()} CP)! Avance para o próximo desafio.`,
      actionText: cpRemaining > 0 ? '⚔️ Caçar & Subir Nível' : '🏆 Desafiar Conteúdo',
      actionTab,
      actionType: 'NAVIGATE',
      currentCp,
      targetCp,
      cpRemaining,
      progressPercent: progressPct,
      targetName,
      icon: '🎯',
      badge: 'Progresso'
    };
  }

  /**
   * Renderiza visualmente o NextActionAdvisor card em um container DOM.
   * @param {Object} state
   * @param {HTMLElement} containerEl
   * @param {Object} callbacks
   */
  static render(state, containerEl, callbacks = {}) {
    if (!containerEl) return;
    const advice = this.getAdvice(state);
    if (!advice) {
      containerEl.style.display = 'none';
      return;
    }

    containerEl.style.display = 'block';

    const isMilestone = advice.category === 'MILESTONE';
    const progressPct = advice.targetCp ? Math.min(100, Math.floor((advice.currentCp / advice.targetCp) * 100)) : 100;

    containerEl.innerHTML = `
      <div class="next-action-advisor-box" style="background:linear-gradient(135deg, rgba(20,24,35,0.95), rgba(12,15,22,0.98)); border:1px solid rgba(212,167,68,0.4); border-radius:8px; padding:12px 16px; margin-bottom:14px; box-shadow:0 4px 16px rgba(0,0,0,0.6); display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:18px;">${advice.icon}</span>
            <span style="font-family:'Cinzel',serif; font-size:13px; font-weight:bold; color:#ffd700; letter-spacing:0.04em;">${advice.title}</span>
          </div>
          <span style="background:rgba(212,167,68,0.15); color:#f5df93; border:1px solid rgba(212,167,68,0.3); padding:2px 8px; border-radius:4px; font-size:10px; font-weight:bold;">${advice.badge}</span>
        </div>

        <p style="font-size:11px; color:#cbd5e1; margin:0; line-height:1.4;">${advice.description}</p>

        ${isMilestone && advice.targetCp ? `
          <div style="margin-top:2px;">
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#94a3b8; margin-bottom:3px;">
              <span>CP Atual: <strong style="color:#ffd700;">${advice.currentCp.toLocaleString()}</strong></span>
              <span>Meta: <strong style="color:#38bdf8;">${advice.targetCp.toLocaleString()}</strong></span>
            </div>
            <div style="width:100%; height:6px; background:rgba(0,0,0,0.6); border:1px solid rgba(212,167,68,0.25); border-radius:3px; overflow:hidden;">
              <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg, #d97706, #eab308, #38bdf8); transition:width 0.3s ease;"></div>
            </div>
          </div>
        ` : ''}

        <div style="display:flex; justify-content:flex-end; margin-top:4px;">
          <button id="advisor-action-btn" style="background:linear-gradient(180deg, #d4a744, #8a641c); color:#000; font-family:'Cinzel',serif; font-size:11px; font-weight:bold; padding:6px 14px; border:1px solid #ffe699; border-radius:4px; cursor:pointer; box-shadow:0 0 10px rgba(212,167,68,0.3); transition:all 0.15s ease;">
            ${advice.actionText}
          </button>
        </div>
      </div>
    `;

    const btn = containerEl.querySelector('#advisor-action-btn');
    if (btn) {
      btn.onclick = (e) => {
        e.preventDefault();
        if (advice.actionType === 'AUTO_EQUIP') {
          const proposal = advice.actionPayload || generateAutoEquipProposal(state);
          commitAutoEquipProposal(state, proposal, callbacks);
          if (callbacks.updateAllUI) callbacks.updateAllUI();
        } else if (advice.actionType === 'ENCHANT') {
          if (typeof window !== 'undefined' && typeof window.openEnchantFlowModal === 'function') {
            window.openEnchantFlowModal(advice.actionPayload?.targetUid, advice.actionPayload?.scrollUid, state, callbacks);
          } else if (typeof window !== 'undefined' && typeof window.openEnchantModalWithScroll === 'function') {
            window.openEnchantModalWithScroll(advice.actionPayload?.scrollUid);
          } else if (callbacks.switchTab) {
            callbacks.switchTab('inventory');
          }
        } else if (advice.actionType === 'NAVIGATE') {
          if (callbacks.switchTab) {
            callbacks.switchTab(advice.actionTab);
          } else if (typeof window !== 'undefined' && typeof window.switchTab === 'function') {
            window.switchTab(advice.actionTab);
          }
        }
      };
    }
  }
}
