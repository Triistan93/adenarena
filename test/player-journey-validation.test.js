import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextActionAdvisor, ADVISOR_PRIORITIES } from '../lineage-idle/src/services/NextActionAdvisor.js';
import { generateAutoEquipProposal, commitAutoEquipProposal } from '../lineage-idle/src/services/EquipmentService.js';
import { executeAtomicEnchant, getEnchantPreview } from '../lineage-idle/src/services/EnchantmentService.js';
import { WeaponResonanceService, RESONANCE_STATES } from '../lineage-idle/src/services/WeaponResonanceService.js';
import { parseEnchantScroll } from '../lineage-idle/src/services/ItemClassificationService.js';
import { getCraftLevelReq } from '../lineage-idle/src/services/CraftService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { CombatPowerService } from '../lineage-idle/src/services/CombatPowerService.js';

describe('MASTER UX: Player Journey, Equipment, Enchantment, Resonance & Auto-Equip', () => {
  it('Jornada 1: Jogador Lv.1 recém-criado recebe orientação imediata de Auto-Equip e equipa starter gear', () => {
    // Estado inicial: Humano Guerreiro Lv.1 sem conhecimento prévio do jogo
    const state = {
      charName: 'AdenRookie',
      race: 'human',
      class: 'fighter',
      level: 1,
      xp: 0,
      sp: 0,
      adena: 500,
      equipment: {}, // Sem nada equipado
      inventory: [
        { uid: 'starter_wpn', itemId: 'short_sword', name: 'Short Sword', slot: 'weapon', type: 'sword', atk: 18, count: 1, grade: 'NG' },
        { uid: 'starter_chest', itemId: 'wooden_breastplate', name: 'Wooden Breastplate', slot: 'armor', type: 'light', def: 12, count: 1, grade: 'NG' },
        { uid: 'starter_pants', itemId: 'wooden_gaiters', name: 'Wooden Gaiters', slot: 'legs', type: 'light', def: 8, count: 1, grade: 'NG' }
      ]
    };

    // 1. Advisor detecta slots vazios e orienta o jogador sem deixá-lo perdido
    const initialAdvice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(initialAdvice.priority, ADVISOR_PRIORITIES.AUTO_EQUIP, 'Deve priorizar AUTO_EQUIP com slots vazios');
    assert.strictEqual(initialAdvice.category, 'AUTO_EQUIP');
    assert.strictEqual(initialAdvice.actionTab, 'inventory');
    assert.ok(initialAdvice.actionText.includes('Auto-Equipar'));

    const cpBefore = CombatPowerService.calculateCombatPower(state);
    const statsBefore = getStats(state);

    // 2. Jogador clica na ação recomendada: Proposta ERS gerada
    const proposal = generateAutoEquipProposal(state);
    assert.ok(proposal.changes.length >= 2, 'Proposta deve equipar arma e armadura disponíveis');
    assert.ok(proposal.deltas.cpDelta > 0, 'CP delta deve ser positivo');

    // 3. Aplicação atômica do loadout
    let statsCallbackFired = false;
    const commitResult = commitAutoEquipProposal(state, proposal, {
      onStatsChanged: () => { statsCallbackFired = true; }
    });

    assert.strictEqual(commitResult.success, true);
    assert.strictEqual(state.equipment.weapon, 'starter_wpn');
    assert.strictEqual(state.equipment.armor, 'starter_chest');

    const cpAfter = CombatPowerService.calculateCombatPower(state);
    const statsAfter = getStats(state);

    assert.ok(cpAfter > cpBefore, `CP deve subir após equipar: de ${cpBefore} para ${cpAfter}`);
    assert.ok(statsAfter.atk > statsBefore.atk, 'P.Atk deve subir com a arma equipada');
    assert.ok(statsAfter.def > statsBefore.def, 'P.Def deve subir com as armaduras');
  });

  it('Jornada 2: Com equipamentos básicos equipados, Advisor orienta Power Milestone e progressão de zona', () => {
    const state = {
      charName: 'AdenRookie',
      race: 'human',
      class: 'fighter',
      level: 1,
      equipment: {
        weapon: 'starter_wpn',
        armor: 'starter_chest'
      },
      inventory: [
        { uid: 'starter_wpn', itemId: 'short_sword', slot: 'weapon', atk: 18, count: 1, equipped: true },
        { uid: 'starter_chest', itemId: 'wooden_breastplate', slot: 'armor', def: 12, count: 1, equipped: true }
      ]
    };

    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.MILESTONE, 'Sem upgrades na mochila, direciona para o Power Milestone');
    assert.strictEqual(advice.category, 'MILESTONE');
    assert.ok(advice.progressPercent >= 0 && advice.progressPercent <= 100, 'Progresso de milestone deve estar normalizado');
    assert.ok(advice.targetCp > 0, 'Meta de CP deve ser clara e tangível');
  });

  it('Jornada 3: Ao obter Scroll de Enchant, sistema orienta Encantar, previne consumo prematuro e executa com sucesso', () => {
    const state = {
      charName: 'AdenRookie',
      race: 'human',
      class: 'fighter',
      level: 20,
      equipment: {
        weapon: 'd_sword'
      },
      inventory: [
        { uid: 'd_sword', itemId: 'sword_of_revolution', name: 'Sword of Revolution', slot: 'weapon', grade: 'D', atk: 79, count: 1, equipped: true, enchant: 0 },
        { uid: 'scrl_d', itemId: 'scroll_enchant_weapon_d', name: 'Scroll: Enchant Weapon (Grade D)', slot: 'scroll', count: 2 }
      ]
    };

    // 1. Advisor detecta compatibilidade imediata e prioriza ENCHANT
    const advice = NextActionAdvisor.getAdvice(state);
    assert.strictEqual(advice.priority, ADVISOR_PRIORITIES.ENCHANT);
    assert.strictEqual(advice.actionPayload.targetUid, 'd_sword');
    assert.strictEqual(advice.actionPayload.scrollUid, 'scrl_d');

    // 2. Contrato inviolável: parseEnchantScroll identifica o scroll antes de qualquer consumo
    const scrollDef = state.inventory.find(i => i.uid === 'scrl_d');
    const scrollMeta = parseEnchantScroll(scrollDef);
    assert.strictEqual(scrollMeta.isScroll, true);
    assert.strictEqual(scrollMeta.targetType, 'WEAPON');
    assert.strictEqual(scrollMeta.grade, 'D');

    // 3. Preview canônico não altera estado nem consome pergaminho
    const preview = getEnchantPreview(state, 'd_sword', 'scrl_d');
    assert.strictEqual(preview.ok, true);
    assert.strictEqual(preview.targetItem.currentEnchant, 0);
    assert.strictEqual(preview.targetItem.targetEnchant, 1);
    assert.strictEqual(preview.successChance, 1.0, '+0 -> +1 deve ser 100% seguro');
    assert.strictEqual(scrollDef.count, 2, 'Preview não pode deduzir o scroll');

    // 4. Execução Atômica
    const cpBefore = CombatPowerService.calculateCombatPower(state);
    const result = executeAtomicEnchant(state, 'd_sword', 'scrl_d', {});

    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.result, 'SUCCESS');
    assert.strictEqual(state.inventory.find(i => i.uid === 'd_sword').enchant, 1);
    assert.strictEqual(state.inventory.find(i => i.uid === 'scrl_d').count, 1, 'Consome exatamente 1 scroll');

    const cpAfter = CombatPowerService.calculateCombatPower(state);
    assert.ok(cpAfter > cpBefore, `CP do jogador deve subir após encantamento: de ${cpBefore} para ${cpAfter}`);
  });

  it('Jornada 4: Equipa arma secundária e ativa Ressonância de Falange (+20% P.Def, Fratura Tática e Cleave +45%)', () => {
    const state = {
      charName: 'Commander',
      race: 'human',
      class: 'warlord',
      level: 40,
      equipment: {
        weapon: 'wpn_spear',
        weapon2: 'wpn_sword'
      },
      inventory: [
        { uid: 'wpn_spear', itemId: 'winged_spear', name: 'Winged Spear', slot: 'weapon', type: 'spear', atk: 92, equipped: true, count: 1 },
        { uid: 'wpn_sword', itemId: 'bastard_sword', name: 'Bastard Sword', slot: 'weapon2', type: 'sword', atk: 85, equipped: true, count: 1 }
      ],
      resonanceState: {}
    };
    const monster = { name: 'Bugbear', hp: 10000 };
    const floatTexts = [];
    const logs = [];
    const callbacks = {
      floatText: (txt) => floatTexts.push(txt),
      log: (msg) => logs.push(msg)
    };

    // 1. Ressonância detectada
    const activeRes = WeaponResonanceService.getActiveResonance(state);
    assert.strictEqual(activeRes.id, 'phalanx_warlord');
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ACTIVE);

    // 2. Contrato e Metadados para UI
    const contract = WeaponResonanceService.getResonanceContract(state);
    assert.strictEqual(contract.id, 'phalanx_warlord');
    assert.strictEqual(contract.passiveEffects.pDefPct, 20, 'Bônus passivo de P.Def deve ser 20%');

    // 3. Baseline de P.Def no StatsEngine: PDef_with / PDef_without == 1.20
    const stateWithoutRes = {
      ...state,
      equipment: { weapon: 'wpn_spear' } // Apenas a lança, sem espada na secundária
    };
    const pdefWith = getStats(state).def;
    const pdefWithout = getStats(stateWithoutRes).def;
    const pdefRatio = pdefWith / pdefWithout;
    assert.ok(Math.abs(pdefRatio - 1.20) < 0.015, `Ratio deve ser 1.20, obtido: ${pdefRatio}`);

    // 4. Ciclo de Combate: Ataque de Espada arma Fratura Tática
    const swordImpact = WeaponResonanceService.processAttackImpact(state, monster, 'sword', 500, callbacks);
    assert.strictEqual(swordImpact.finalDamage, 500);
    assert.strictEqual(state.resonanceState.tacticalFracture, 'ARMED', 'Ataque de espada deve armar Fratura Tática');
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ARMED);

    // 5. Próximo ataque elegível de Lança consome com CleaveDamage = floor(BaseSpearDamage * 1.45)
    const baseSpearDamage = 1000;
    const spearImpact1 = WeaponResonanceService.processAttackImpact(state, monster, 'spear', baseSpearDamage, callbacks);
    const expectedCleave = Math.floor(baseSpearDamage * 1.45); // 1450
    assert.strictEqual(spearImpact1.finalDamage, expectedCleave, `Dano deve ser exatamente ${expectedCleave}`);
    assert.ok(spearImpact1.extraEffects.includes('phalanx_cleave'));
    assert.strictEqual(state.resonanceState.tacticalFracture, 'INACTIVE', 'Fratura Tática deve ser consumida e resetada');
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ACTIVE);

    // 6. Próximo ataque de lança NÃO deve receber bônus repetido (consumido exatamente uma vez)
    const spearImpact2 = WeaponResonanceService.processAttackImpact(state, monster, 'spear', baseSpearDamage, callbacks);
    assert.strictEqual(spearImpact2.finalDamage, baseSpearDamage, 'Sem o buff armado, dano deve ser o base normal');
    assert.strictEqual(spearImpact2.extraEffects.length, 0);
  });

  it('Jornada 5: Forja Imperial e Crafting estão acessíveis desde o Nível 1 sem bloqueio artificial', () => {
    // Jogador Lv.1 quer forjar itens iniciais
    const levelReqLevel1Recipe = getCraftLevelReq(1);
    assert.strictEqual(levelReqLevel1Recipe, 1, 'Receitas básicas de rank 1 devem requerer Lv. 1');

    const levelReqLevel10Recipe = getCraftLevelReq(10);
    assert.strictEqual(levelReqLevel10Recipe, 2, 'Receitas de rank 10 requerem Lv. 2');

    // Jogador Lv.1 com materiais pode craftar
    const playerState = {
      level: 1,
      class: 'fighter',
      inventory: [
        { uid: 'mat_iron', itemId: 'iron_ore', count: 10 },
        { uid: 'mat_stem', itemId: 'stem', count: 5 }
      ]
    };

    assert.ok(playerState.level >= levelReqLevel1Recipe, 'Jogador Lv. 1 tem nível suficiente para forjar itens iniciais');
  });
});
