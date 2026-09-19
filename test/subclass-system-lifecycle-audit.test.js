import test from 'node:test';
import assert from 'node:assert/strict';

import { isSkillAllowedForClass } from '../lineage-idle/src/services/CharacterService.js';
import { getCertificationsBonuses } from '../lineage-idle/src/engine/StatsEngine.js';
import { SubclassCertificationService } from '../lineage-idle/src/services/SubclassCertificationService.js';

// ─── 1. CICLO COMPLETO DE SUBCLASSES: MAIN -> SUB A -> SUB B -> MAIN -> SAVE -> RELOAD ────
test('1. Subclass Lifecycle: Main -> Sub A -> Sub B -> Main com isolamento de SP, skills e loadout', () => {
  // Estado inicial: Main Class = Gladiator (Lv 76)
  const state = {
    class: 'gladiator',
    level: 76,
    xp: 50000,
    sp: 12000,
    skills: { triple_sonic_slash: 1, dual_weapon_mastery: 5 },
    skillLoadout: {
      basic: 'triple_sonic_slash',
      core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null
    },
    inventory: [
      { uid: 'dual-kesh-1', itemId: 'keshanberk_dual', name: 'Dual Keshanberk' },
      { uid: 'bow-carn-1', itemId: 'carnage_bow', name: 'Carnage Bow' },
      { uid: 'staff-homu-1', itemId: 'homunkulus_sword', name: 'Homunkulus Sword' }
    ],
    equipment: {
      weapon: 'dual-kesh-1',
      armor: null
    },
    activeSubclassIndex: null, // Main Class ativa
    subclasses: [
      {
        id: 'sub_sagittarius',
        classId: 'sagittarius',
        level: 75,
        xp: 30000,
        sp: 8000,
        skills: { double_shot: 1, bow_mastery: 4 },
        skillLoadout: {
          basic: 'double_shot',
          core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null
        },
        equipment: {
          weapon: 'bow-carn-1',
          armor: null
        }
      },
      {
        id: 'sub_spellsinger',
        classId: 'spellsinger',
        level: 60,
        xp: 15000,
        sp: 3500,
        skills: { hydro_blast: 1, robe_mastery: 3 },
        skillLoadout: {
          basic: 'hydro_blast',
          core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null
        },
        equipment: {
          weapon: 'staff-homu-1',
          armor: null
        }
      }
    ]
  };

  // Função auxiliar simulando switchSubclass de main.js com as correções
  function executeSwitchSubclass(st, targetIdx) {
    const subCount = Array.isArray(st.subclasses) ? st.subclasses.length : 0;
    const isTargetValidSub = typeof targetIdx === 'number'
      && Number.isInteger(targetIdx)
      && targetIdx >= 0
      && targetIdx < subCount;
    const resolvedTarget = isTargetValidSub ? targetIdx : null;

    const isCurrentSubActive = typeof st.activeSubclassIndex === 'number'
      && Number.isInteger(st.activeSubclassIndex)
      && st.activeSubclassIndex >= 0
      && st.activeSubclassIndex < subCount;
    const currentEffective = isCurrentSubActive ? st.activeSubclassIndex : null;

    if (currentEffective === resolvedTarget) return;

    // Snapshot classe de saída
    const outgoing = {
      level: st.level,
      xp: st.xp,
      sp: st.sp,
      class: st.class,
      skills: JSON.parse(JSON.stringify(st.skills || {})),
      skillLoadout: JSON.parse(JSON.stringify(st.skillLoadout || {})),
      equipment: { ...(st.equipment || {}) }
    };

    if (currentEffective === null) {
      st.mainClassData = outgoing;
    } else {
      const activeSub = st.subclasses[currentEffective];
      if (activeSub) {
        activeSub.level = outgoing.level;
        activeSub.xp = outgoing.xp;
        activeSub.sp = outgoing.sp;
        activeSub.skills = outgoing.skills;
        activeSub.skillLoadout = outgoing.skillLoadout;
        activeSub.equipment = outgoing.equipment;
      }
    }

    // Restaura classe de destino
    if (resolvedTarget === null) {
      st.activeSubclassIndex = null;
      const m = st.mainClassData;
      st.level = m.level; st.xp = m.xp; st.sp = m.sp; st.class = m.class;
      st.skills = JSON.parse(JSON.stringify(m.skills || {}));
      st.skillLoadout = JSON.parse(JSON.stringify(m.skillLoadout || {}));
      if (m.equipment) {
        const invUids = new Set((st.inventory || []).map(i => i.uid));
        const resEquip = {};
        for (const slot of Object.keys(m.equipment)) {
          const u = m.equipment[slot];
          resEquip[slot] = (u && invUids.has(u)) ? u : null;
        }
        st.equipment = resEquip;
      }
    } else {
      const tSub = st.subclasses[resolvedTarget];
      st.activeSubclassIndex = resolvedTarget;
      st.level = tSub.level; st.xp = tSub.xp; st.sp = tSub.sp; st.class = tSub.classId;
      st.skills = JSON.parse(JSON.stringify(tSub.skills || {}));
      st.skillLoadout = JSON.parse(JSON.stringify(tSub.skillLoadout || {}));
      if (tSub.equipment) {
        const invUids = new Set((st.inventory || []).map(i => i.uid));
        const resEquip = {};
        for (const slot of Object.keys(tSub.equipment)) {
          const u = tSub.equipment[slot];
          resEquip[slot] = (u && invUids.has(u)) ? u : null;
        }
        st.equipment = resEquip;
      }
    }
  }

  // 1. Alterna para Sub A (Sagittarius Lv 75)
  executeSwitchSubclass(state, 0);
  assert.equal(state.class, 'sagittarius');
  assert.equal(state.level, 75);
  assert.equal(state.sp, 8000);
  assert.equal(state.skillLoadout.basic, 'double_shot');
  assert.equal(state.equipment.weapon, 'bow-carn-1');

  // Ganhos em Sub A: sobe XP, SP e aprende skill
  state.sp += 500;
  state.skills.lethal_shot = 1;

  // 2. Alterna para Sub B (Spellsinger Lv 60)
  executeSwitchSubclass(state, 1);
  assert.equal(state.class, 'spellsinger');
  assert.equal(state.level, 60);
  assert.equal(state.sp, 3500);
  assert.equal(state.skillLoadout.basic, 'hydro_blast');
  assert.equal(state.equipment.weapon, 'staff-homu-1');

  // Vende o arco do Sagittarius enquanto joga de Spellsinger
  const bowIdx = state.inventory.findIndex(i => i.uid === 'bow-carn-1');
  state.inventory.splice(bowIdx, 1);

  // 3. Alterna de volta para Main (Gladiator Lv 76)
  executeSwitchSubclass(state, null);
  assert.equal(state.class, 'gladiator');
  assert.equal(state.level, 76);
  assert.equal(state.sp, 12000, 'SP da Main Class deve ser preservado sem alterações da Sub');
  assert.equal(state.skillLoadout.basic, 'triple_sonic_slash');
  assert.equal(state.equipment.weapon, 'dual-kesh-1');

  // 4. Alterna de volta para Sub A (Sagittarius) para verificar arco vendido
  executeSwitchSubclass(state, 0);
  assert.equal(state.class, 'sagittarius');
  assert.equal(state.sp, 8500, 'SP ganho na Sub A foi preservado');
  assert.equal(state.skills.lethal_shot, 1, 'Habilidade aprendida na Sub A foi preservada');
  assert.equal(state.equipment.weapon, null, 'Arma vendida no inventário foi graciosamente desequipada (zero item fantasma)');

  // 5. Salva e recarrega
  const serialized = JSON.stringify(state);
  const reloaded = JSON.parse(serialized);
  assert.equal(reloaded.class, 'sagittarius');
  assert.equal(reloaded.subclasses[0].skills.lethal_shot, 1);
});

// ─── 2. CERTIFICAÇÕES DE SUBCLASSE RESTRINGIDAS À MAIN CLASS ───────────────
test('2. Subclass Certifications: bônus aplicam exclusivamente quando a Main Class está ativa', () => {
  const state = {
    class: 'gladiator',
    activeSubclassIndex: null, // Main Class
    subclasses: [
      { id: 'sub1', classId: 'paladin', level: 75 },
      { id: 'sub2', classId: 'bishop', level: 75 }
    ],
    subclassCertifications: {
      sub1: { lv65: 'emergent_patk', lv70: 'emergent_pdef', lv75: 'master_defence' },
      sub2: { lv65: 'emergent_matk', lv70: 'emergent_mdef', lv75: 'master_heal' }
    }
  };

  // Main ativa: bônus calculados
  const bonusesMain = getCertificationsBonuses(state);
  assert.ok(bonusesMain.atk > 0, 'P.Atk deve ser positivo na Main');
  assert.ok(bonusesMain.def > 0, 'P.Def deve ser positivo na Main');

  // Alterna para Subclasse 0: certificações devem zerar
  state.activeSubclassIndex = 0;
  const bonusesSub = getCertificationsBonuses(state);
  assert.equal(bonusesSub.atk, 0, 'P.Atk de certificação deve ser 0 na Subclasse');
  assert.equal(bonusesSub.def, 0, 'P.Def de certificação deve ser 0 na Subclasse');
  assert.equal(bonusesSub.matk, 0, 'M.Atk de certificação deve ser 0 na Subclasse');
  assert.equal(bonusesSub.mdef, 0, 'M.Def de certificação deve ser 0 na Subclasse');

  // Índice inválido ou normalizado:
  state.activeSubclassIndex = undefined;
  const bonusesNorm = getCertificationsBonuses(state);
  assert.ok(bonusesNorm.atk > 0, 'activeSubclassIndex undefined é normalizado como Main Class');
});
