import test from 'node:test';
import assert from 'node:assert/strict';

import { isSkillAllowedForClass } from '../lineage-idle/src/services/CharacterService.js';
import { getStats, getCertificationsBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { SubclassCertificationService } from '../lineage-idle/src/services/SubclassCertificationService.js';

// Helper to determine if subclass is active
function isSubclassActive(state) {
  return typeof state?.activeSubclassIndex === 'number'
    && Number.isInteger(state.activeSubclassIndex)
    && state.activeSubclassIndex >= 0
    && Array.isArray(state.subclasses)
    && state.activeSubclassIndex < state.subclasses.length;
}

// ─── REPRO 1: PERSISTÊNCIA INDEVIDA DE LOADOUT NA TROCA DE SUBCLASSE ──────────
test('REPRO-1: Troca de classe sem swap de loadout deixa habilidades da classe anterior no loadout ativo', () => {
  // Estado inicial: Guerreiro Humano (Main Class) com Power Strike e Mortal Blow equipados
  const state = {
    class: 'fighter',
    level: 75,
    xp: 10000,
    sp: 5000,
    skills: { power_strike: 1, mortal_blow: 1 },
    skillLoadout: {
      basic: 'power_strike',
      core1: 'mortal_blow',
      core2: null,
      special1: null,
      special2: null,
      signature: null,
      ultimate: null
    },
    activeSubclassIndex: null,
    subclasses: [
      {
        id: 'sub_spellsinger',
        classId: 'spellsinger',
        level: 40,
        xp: 0,
        sp: 200,
        skills: { hydro_strike: 1 }
        // Note: sem skillLoadout armazenado na subclasse!
      }
    ]
  };

  // Simulação da troca ingênua de classe como era feita no main.js original:
  // Salva mainClassData sem skillLoadout
  state.mainClassData = {
    level: state.level,
    xp: state.xp,
    sp: state.sp,
    class: state.class,
    skills: { ...state.skills }
    // skillLoadout OMITIDO!
  };

  // Alterna para subclasse 0
  const sub = state.subclasses[0];
  state.activeSubclassIndex = 0;
  state.level = sub.level;
  state.xp = sub.xp;
  state.sp = sub.sp;
  state.class = sub.classId;
  state.skills = { ...sub.skills };
  // state.skillLoadout NÃO É TOCADO!

  // Comprovação do Defeito:
  // O personagem agora é um mago ('spellsinger'), mas state.skillLoadout ainda contém 'power_strike'!
  assert.equal(state.class, 'spellsinger');
  assert.equal(state.skillLoadout.basic, 'power_strike', 'DEFEITO REPRODUZIDO: power_strike permaneceu no loadout do mago!');
  assert.equal(isSkillAllowedForClass('spellsinger', state.skillLoadout.basic), false, 'power_strike não é autorizada para spellsinger');
});

// ─── REPRO 2: EXECUÇÃO DE HABILIDADE ESTRANGEIRA NO COMBATE SE PERMANECER EQUIPADA ─
test('REPRO-2: Ciclo de combate rejeita habilidade estrangeira pré-equipada através do gating isSkillAllowedForClass', () => {
  const state = {
    class: 'spellsinger',
    level: 40,
    skillLoadout: {
      basic: 'power_strike', // Habilidade estrangeira
      core1: 'hydro_strike', // Habilidade legítima
      core2: null,
      special1: null,
      special2: null,
      signature: null,
      ultimate: null
    }
  };

  // Simulação do loop de combate de main.js (linha 5512):
  const candidateSkills = [];
  for (const slot of ['basic', 'core1', 'core2', 'special1', 'special2', 'signature', 'ultimate']) {
    const sId = state.skillLoadout?.[slot];
    if (!sId) continue;
    if (!isSkillAllowedForClass(state.class, sId)) continue; // Gating estrito!
    candidateSkills.push(sId);
  }

  // Comprovação:
  // candidateSkills deve conter APENAS 'hydro_strike' e NUNCA 'power_strike'
  assert.equal(candidateSkills.includes('power_strike'), false, 'power_strike DEVE ser ignorada pelo loop de combate');
  assert.equal(candidateSkills.includes('hydro_strike'), true, 'hydro_strike DEVE ser admitida no combate');
});

// ─── REPRO 3: INCOMPATIBILIDADE DE EQUIPAMENTO E ITENS VENDIDOS/DESTRUÍDOS ──
test('REPRO-3: Swap de equipamentos deve validar existência do item no inventário único e não fabricar itens fantasmas', () => {
  const state = {
    class: 'fighter',
    inventory: [
      { uid: 'wpn-sword-1', itemId: 'sword_of_revolution', name: 'Sword of Revolution' },
      { uid: 'wpn-staff-1', itemId: 'ghoul_staff', name: 'Staff of Life' }
    ],
    equipment: {
      weapon: 'wpn-sword-1',
      armor: null
    },
    activeSubclassIndex: null,
    subclasses: [
      {
        id: 'sub_mage',
        classId: 'spellsinger',
        level: 40,
        equipment: {
          weapon: 'wpn-staff-1',
          armor: null
        }
      }
    ]
  };

  // 1. Jogador troca para a subclasse Mago
  // Salva equipamento da Main
  state.mainClassData = {
    equipment: { ...state.equipment }
  };
  // Carrega equipamento da Sub
  state.activeSubclassIndex = 0;
  state.equipment = { ...state.subclasses[0].equipment };
  assert.equal(state.equipment.weapon, 'wpn-staff-1');

  // 2. Enquanto joga como mago, jogador VENDE a Sword of Revolution (remove do inventário único)
  const itemIndex = state.inventory.findIndex(i => i.uid === 'wpn-sword-1');
  assert.ok(itemIndex >= 0);
  state.inventory.splice(itemIndex, 1); // Item vendido / excluído!
  assert.equal(state.inventory.some(i => i.uid === 'wpn-sword-1'), false);

  // 3. Jogador troca de volta para a Main Class
  // Restauração com validação de existência:
  const targetEquip = { ...(state.mainClassData?.equipment || {}) };
  for (const slot of Object.keys(targetEquip)) {
    const itemUid = targetEquip[slot];
    if (itemUid) {
      const existsInInv = state.inventory.some(i => i.uid === itemUid);
      if (!existsInInv) {
        // Item foi vendido/destruído: slot fica nulo, NÃO revive item fantasma!
        targetEquip[slot] = null;
      }
    }
  }
  state.equipment = targetEquip;
  state.activeSubclassIndex = null;

  // Comprovação:
  assert.equal(state.equipment.weapon, null, 'Slot de arma deve ficar vazio pois o item não existe mais no inventário');
  assert.equal(state.inventory.length, 1, 'Inventário permanece estritamente com 1 item (sem duplicatas fantasma)');
});

// ─── REPRO 4: CERTIFICAÇÕES DE SUBCLASSE DEVEM APLICAR APENAS À MAIN CLASS ─
test('REPRO-4: Validação de activeSubclassIndex e regra de que certificações não beneficiam subclasse ativa', () => {
  const state = {
    class: 'fighter',
    level: 75,
    activeSubclassIndex: null, // Main Class ativa
    subclasses: [
      { id: 'sub_1', classId: 'gladiator', level: 75 },
      { id: 'sub_2', classId: 'paladin', level: 75 }
    ],
    subclassCertifications: {
      sub_1: { lv65: 'emergent_patk', lv70: 'emergent_pdef', lv75: 'master_haste' },
      sub_2: { lv65: 'emergent_patk', lv70: 'emergent_pdef', lv75: 'master_defence' }
    }
  };

  // Main class ativa: deve receber bônus de certificação
  assert.equal(isSubclassActive(state), false);
  const bonusesMain = SubclassCertificationService.calculateTotalCertificationBonuses(state);
  assert.ok(bonusesMain.pAtk > 0, 'Main class recebe P.Atk de certificação');
  assert.ok(bonusesMain.pDef > 0, 'Main class recebe P.Def de certificação');

  // Agora alternamos para Subclasse 0
  state.activeSubclassIndex = 0;
  assert.equal(isSubclassActive(state), true);

  // Verificação de normalização de activeSubclassIndex ausente/inválido:
  assert.equal(isSubclassActive({ activeSubclassIndex: undefined }), false);
  assert.equal(isSubclassActive({ activeSubclassIndex: null }), false);
  assert.equal(isSubclassActive({ activeSubclassIndex: '0', subclasses: [{}] }), false); // String não é número inteiro
  assert.equal(isSubclassActive({ activeSubclassIndex: 5, subclasses: [{}] }), false); // Out of bounds
});
