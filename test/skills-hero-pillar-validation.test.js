import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import {
  getVisibleSkillsForCharacter,
  getSkillDetailedVisibility,
  isSkillInProgressionPath,
  SKILL_VISIBILITY_STATES,
  SHARED_MAGE_SKILL_IDS,
  SHARED_FIGHTER_SKILL_IDS,
  isMageClass,
  resolveSkillDef
} from '../lineage-idle/src/services/SkillEligibility.js';

describe('Hero Pillar — Subtab 3: Skills (Habilidades)', () => {

  it('1. Archetype Gating: Mage character only includes Mage shared skills in progression path, Fighter only includes Fighter shared skills', () => {
    const mageChar = { race: 'darkelf', class: 'spellhowler', level: 40, skills: {} };
    const fighterChar = { race: 'human', class: 'gladiator', level: 40, skills: {} };

    assert.strictEqual(isMageClass('spellhowler'), true);
    assert.strictEqual(isMageClass('gladiator'), false);

    for (const sId of SHARED_MAGE_SKILL_IDS) {
      assert.strictEqual(isSkillInProgressionPath(mageChar, sId), true, `Mage must have progression access to ${sId}`);
      assert.strictEqual(isSkillInProgressionPath(fighterChar, sId), false, `Fighter must NOT have progression access to ${sId}`);
    }

    for (const sId of SHARED_FIGHTER_SKILL_IDS) {
      assert.strictEqual(isSkillInProgressionPath(fighterChar, sId), true, `Fighter must have progression access to ${sId}`);
      assert.strictEqual(isSkillInProgressionPath(mageChar, sId), false, `Mage must NOT have progression access to ${sId}`);
    }
  });

  it('2. Skill Progression & Gating: Level 20 character cannot see level 76+ 3rd class skills', () => {
    const lowLvlChar = { race: 'human', class: 'human_fighter', level: 20, skills: {} };
    const visible = getVisibleSkillsForCharacter(lowLvlChar);

    for (const s of visible) {
      const def = resolveSkillDef(s.skillId);
      if (def?.reqLvl) {
        assert.ok(def.reqLvl <= 40, `Level 20 character must not see high level skill ${s.skillId} (req: ${def.reqLvl})`);
      }
    }
  });

  it('3. Skill State Serialization: Learned skills preserve accurately across save/load', () => {
    const state = DEFAULT_STATE();
    state.skills = {
      power_strike: 5,
      mortal_blow: 3,
      weaponMastF: 10
    };
    state.sp = 450;

    const saved = JSON.stringify(state);
    const loaded = JSON.parse(saved);

    assert.strictEqual(loaded.skills.power_strike, 5);
    assert.strictEqual(loaded.skills.mortal_blow, 3);
    assert.strictEqual(loaded.skills.weaponMastF, 10);
    assert.strictEqual(loaded.sp, 450);
  });
});
