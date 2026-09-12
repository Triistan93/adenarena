import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WeaponResonanceService, RESONANCE_STATES, RESONANCE_DEFINITIONS } from '../lineage-idle/src/services/WeaponResonanceService.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';

describe('P0-RES: Real Weapon Resonance & Tactical Fracture Validation', () => {
  it('3.1 Resonance Contract retorna todos os campos obrigatórios e ciclo de vida', () => {
    // Estado sem armas -> LOCKED
    const emptyState = { equipment: {} };
    const emptyContract = WeaponResonanceService.getResonanceContract(emptyState);
    assert.strictEqual(emptyContract.state, RESONANCE_STATES.LOCKED);
    assert.ok(emptyContract.requirements);
    assert.ok(emptyContract.activationRule);

    // Estado com Lança + Espada 1H
    const state = {
      equipment: { weapon: 'spear_1', weapon2: 'sword_1' },
      inventory: [
        { uid: 'spear_1', itemId: 'lance', slot: 'weapon', type: 'spear', atk: 150 },
        { uid: 'sword_1', itemId: 'katana', slot: 'weapon2', type: 'sword', atk: 110 }
      ],
      resonanceState: {}
    };

    const activeRes = WeaponResonanceService.getActiveResonance(state);
    assert.ok(activeRes, 'Deveria ativar ressonância Comandante de Falange');
    assert.strictEqual(activeRes.id, 'phalanx_warlord');

    const contract = WeaponResonanceService.getResonanceContract(state);
    assert.strictEqual(contract.id, 'phalanx_warlord');
    assert.strictEqual(contract.name, 'Comandante de Falange');
    assert.deepStrictEqual(contract.requirements, ['spear', 'sword']);
    assert.ok(contract.activationRule.length > 0);
    assert.ok(contract.passiveEffects.pDefPct === 20);
    assert.ok(contract.triggerEffects.length >= 2);
    assert.ok(contract.visual.icon);
    assert.ok(contract.description);
    assert.strictEqual(contract.state, RESONANCE_STATES.ACTIVE);
  });

  it('3.2 Comandante de Falange: Sword hit arma Fratura Tática e Spear hit consome com Cleave = BaseSpearDamage * 1.45', () => {
    const state = {
      equipment: { weapon: 'spear_1', weapon2: 'sword_1' },
      inventory: [
        { uid: 'spear_1', itemId: 'lance', slot: 'weapon', type: 'spear', atk: 150 },
        { uid: 'sword_1', itemId: 'katana', slot: 'weapon2', type: 'sword', atk: 110 }
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

    // 1. Estado inicial
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ACTIVE);
    assert.strictEqual(state.resonanceState.tacticalFracture, undefined);

    // 2. Ataque de Espada (Golpe de espada arma Fratura Tática)
    const swordImpact = WeaponResonanceService.processAttackImpact(state, monster, 'sword', 500, callbacks);
    assert.strictEqual(swordImpact.finalDamage, 500, 'Dano da espada em si não deve ser alterado');
    assert.strictEqual(state.resonanceState.tacticalFracture, 'ARMED', 'tacticalFracture deve estar ARMED');
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ARMED, 'Estado deve ser ARMED');
    assert.ok(floatTexts.some(t => t.includes('TACTICAL FRACTURE (ARMED)')));

    // 3. Ataque de Lança consome o proc: CleaveDamage = BaseSpearDamage * 1.45
    const baseSpearDmg = 1000;
    const spearImpact1 = WeaponResonanceService.processAttackImpact(state, monster, 'spear', baseSpearDmg, callbacks);
    const expectedCleave = Math.floor(baseSpearDmg * 1.45); // 1450
    assert.strictEqual(spearImpact1.finalDamage, expectedCleave, 'CleaveDamage deve ser exatamente BaseSpearDamage * 1.45');
    assert.ok(spearImpact1.extraEffects.includes('phalanx_cleave'));
    assert.strictEqual(state.resonanceState.tacticalFracture, 'INACTIVE', 'Fratura deve ser consumida e voltar para INACTIVE');
    assert.strictEqual(WeaponResonanceService.getResonanceState(state), RESONANCE_STATES.ACTIVE, 'Estado deve voltar para ACTIVE');
    assert.ok(floatTexts.some(t => t.includes('CLEAVE (+45%)')));

    // 4. Próximo ataque de Lança SEM armar Fratura Tática NÃO tem bônus (consumido exatamente 1x)
    const spearImpact2 = WeaponResonanceService.processAttackImpact(state, monster, 'spear', baseSpearDmg, callbacks);
    assert.strictEqual(spearImpact2.finalDamage, baseSpearDmg, 'Sem proc armado, o dano da lança deve ser exatamente o base');
    assert.strictEqual(spearImpact2.extraEffects.length, 0, 'Nenhum efeito extra deve ser gerado');
  });

  it('3.3 P.Def da Ressonância respeita rigorosamente o baseline: PDef_with / PDef_without == 1.20', () => {
    // Estado Base sem ressonância (apenas uma espada no weapon, weapon2 vazio)
    const baseState = {
      charName: 'FalangeWarrior',
      level: 40,
      race: 'human',
      class: 'warlord',
      base: { def: 100 },
      equipment: { weapon: 'sword_1' },
      inventory: [
        { uid: 'sword_1', itemId: 'katana', slot: 'weapon', type: 'sword', def: 0 },
        { uid: 'spear_1', itemId: 'lance', slot: 'weapon2', type: 'spear', def: 0 }
      ],
      skills: {},
      buffs: {}
    };

    const statsWithout = getStats(baseState);
    const pDefWithout = statsWithout.def;
    assert.ok(pDefWithout > 0, 'P.Def base deve ser maior que 0');

    // Agora equipamos a lança no slot 2 para ativar a Ressonância do Comandante de Falange (+20% P.Def)
    // Mantendo TODOS os outros atributos, itens e bônus rigorosamente idênticos
    const resonanceState = {
      ...baseState,
      equipment: { weapon: 'sword_1', weapon2: 'spear_1' }
    };

    const statsWith = getStats(resonanceState);
    const pDefWith = statsWith.def;

    const ratio = pDefWith / pDefWithout;
    // O ratio deve ser 1.20 (com tolerância estrita de arredondamento inteiro de floor)
    assert.ok(Math.abs(ratio - 1.20) < 0.015, `PDef_with (${pDefWith}) / PDef_without (${pDefWithout}) = ${ratio}, esperado 1.20`);
  });

  it('3.4 getResonanceIcon nunca retorna undefined ou imagem quebrada', () => {
    assert.ok(WeaponResonanceService.getResonanceIcon(null));
    for (const [key, def] of Object.entries(RESONANCE_DEFINITIONS)) {
      const icon = WeaponResonanceService.getResonanceIcon(def);
      assert.ok(icon, `Ressonância ${key} deve ter ícone não-vazio`);
      assert.strictEqual(typeof icon, 'string');
    }
  });
});
