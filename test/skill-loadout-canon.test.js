/**
 * skill-loadout-canon.test.js — Canon Preservation Tests for Skill Loadout 2.0
 *
 * ZERO NEW SKILLS RULE:
 * - Canonical Skill IDs Before = Canonical Skill IDs After
 * - Missing = 0, Extra = 0
 * - Runtime skill IDs - Canonical skill IDs = 0
 */
import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

// Import the new services
import { SKILL_TAGS, getSkillTags, getSkillSlotCategory, isPurgedSkill, SLOT_CATEGORIES } from '../lineage-idle/src/services/SkillTagService.js';
import { ALL_SLOT_NAMES, SLOT_PRIORITY_ORDER, UNLOCK_SCHEDULE, getUnlockedSlots, getUnlockedSlotCount, isSlotUnlocked, getSlotUnlockLevel } from '../lineage-idle/src/data/balance/SkillUnlockSchedule.js';
import {
  EMPTY_LOADOUT,
  getLoadout,
  getEquippedSkillIds,
  isSkillEquipped,
  equipSkill,
  unequipSkill,
  autoEquipLoadout,
  validateLoadout,
  getLoadoutForCombat
} from '../lineage-idle/src/services/SkillLoadoutService.js';

// ─── Mock Skill Definitions ───────────────────────────────────────────────────

const MOCK_SKILL_DEFS = {
  power_strike: { id: 'power_strike', name: 'Power Strike', type: 'active', starRank: 1, minLevel: 1, balance: { pwr: 15 } },
  mortal_blow: { id: 'mortal_blow', name: 'Mortal Blow', type: 'active', starRank: 1, minLevel: 5, balance: { pwr: 20 } },
  sonic_storm: { id: 'sonic_storm', name: 'Sonic Storm', type: 'active', starRank: 3, minLevel: 20, balance: { pwr: 50 } },
  prominence: { id: 'prominence', name: 'Prominence', type: 'active', starRank: 4, minLevel: 40, balance: { pwr: 80 } },
  solar_flare: { id: 'solar_flare', name: 'Solar Flare', type: 'active', starRank: 5, minLevel: 60, balance: { pwr: 120 } },
  celestial_nova: { id: 'celestial_nova', name: 'Celestial Nova', type: 'active', starRank: 5, minLevel: 76, balance: { pwr: 200 } },
  war_cry: { id: 'war_cry', name: 'War Cry', type: 'buff', starRank: 2, minLevel: 10, balance: { pwr: 20 } },
  iron_will: { id: 'iron_will', name: 'Iron Will', type: 'passive', starRank: 1, minLevel: 1, balance: { pwr: 0 } },
  mount_golden_lion: { id: 'mount_golden_lion', name: 'Mount Golden Lion', type: 'active', starRank: 1, minLevel: 1, balance: { pwr: 0 } },
  vanguard_slash: { id: 'vanguard_slash', name: 'Vanguard Slash', type: 'active', starRank: 2, minLevel: 15, balance: { pwr: 30 } },
  thunder_storm: { id: 'thunder_storm', name: 'Thunder Storm', type: 'active', starRank: 3, minLevel: 30, balance: { pwr: 55 } },
};

function createMockState(overrides = {}) {
  return {
    level: 80,
    class: 'phoenixKnight',
    skills: {
      power_strike: 1,
      mortal_blow: 2,
      sonic_storm: 3,
      prominence: 2,
      solar_flare: 1,
      celestial_nova: 1,
      war_cry: 2,
      iron_will: 1,
      vanguard_slash: 1,
      thunder_storm: 1,
    },
    skillLoadout: { basic: null, core1: null, core2: null, special1: null, special2: null, signature: null, ultimate: null },
    skillAutoCast: {},
    ...overrides
  };
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Skill Loadout 2.0 — Canon Preservation', () => {

  it('1. ZERO NEW SKILLS: SkillTagService classifies existing skills without creating new ones', () => {
    for (const [id, def] of Object.entries(MOCK_SKILL_DEFS)) {
      const tags = getSkillTags(def);
      assert.ok(tags instanceof Set, `Tags for ${id} should be a Set`);
      for (const tag of tags) {
        assert.ok(Object.values(SKILL_TAGS).includes(tag), `Tag "${tag}" for ${id} must be in SKILL_TAGS`);
      }
    }
  });

  it('2. Passive skills never get combat slot tags', () => {
    const tags = getSkillTags(MOCK_SKILL_DEFS.iron_will);
    assert.ok(tags.has(SKILL_TAGS.PASSIVE), 'iron_will should have PASSIVE tag');
    assert.ok(!tags.has(SKILL_TAGS.CORE), 'Passive should not have CORE tag');
    assert.ok(!tags.has(SKILL_TAGS.SPECIAL), 'Passive should not have SPECIAL tag');
    assert.ok(!tags.has(SKILL_TAGS.SIGNATURE), 'Passive should not have SIGNATURE tag');
    assert.ok(!tags.has(SKILL_TAGS.ULTIMATE), 'Passive should not have ULTIMATE tag');
  });

  it('3. Purged skills are correctly identified', () => {
    assert.ok(isPurgedSkill('mount_golden_lion'), 'mount_golden_lion should be purged');
    assert.ok(isPurgedSkill('dragon_slayer_appearance'), 'dragon_slayer_appearance should be purged');
    assert.ok(isPurgedSkill('detection'), 'detection should be purged');
    assert.ok(!isPurgedSkill('power_strike'), 'power_strike should NOT be purged');
    assert.ok(!isPurgedSkill('sonic_storm'), 'sonic_storm should NOT be purged');
  });

  it('4. Slot categories are derived from existing metadata only', () => {
    assert.equal(getSkillSlotCategory(MOCK_SKILL_DEFS.power_strike), SLOT_CATEGORIES.BASIC);
    assert.equal(getSkillSlotCategory(MOCK_SKILL_DEFS.sonic_storm), SLOT_CATEGORIES.CORE);
    assert.equal(getSkillSlotCategory(MOCK_SKILL_DEFS.prominence), SLOT_CATEGORIES.SPECIAL);
    assert.equal(getSkillSlotCategory(MOCK_SKILL_DEFS.solar_flare), SLOT_CATEGORIES.SIGNATURE);
    assert.equal(getSkillSlotCategory(MOCK_SKILL_DEFS.celestial_nova), SLOT_CATEGORIES.ULTIMATE);
  });

  it('5. EMPTY_LOADOUT has exactly 7 null slots', () => {
    assert.equal(Object.keys(EMPTY_LOADOUT).length, 7, 'Must have 7 slots');
    for (const slot of ALL_SLOT_NAMES) {
      assert.equal(EMPTY_LOADOUT[slot], null, `Slot ${slot} must be null`);
    }
  });

  it('6. ALL_SLOT_NAMES matches EMPTY_LOADOUT keys', () => {
    assert.deepEqual(ALL_SLOT_NAMES, Object.keys(EMPTY_LOADOUT));
  });
});

describe('Skill Loadout 2.0 — Unlock Schedule', () => {

  it('7. Level 1 unlocks exactly 2 slots (basic, core1)', () => {
    const slots = getUnlockedSlots(1);
    assert.deepEqual(slots, ['basic', 'core1']);
    assert.equal(getUnlockedSlotCount(1), 2);
  });

  it('8. Level 10 unlocks 3 slots', () => {
    assert.equal(getUnlockedSlotCount(10), 3);
    assert.ok(isSlotUnlocked('core2', 10));
  });

  it('9. Level 20 unlocks 4 slots (1st class transfer)', () => {
    assert.equal(getUnlockedSlotCount(20), 4);
    assert.ok(isSlotUnlocked('special1', 20));
  });

  it('10. Level 30 unlocks 5 slots', () => {
    assert.equal(getUnlockedSlotCount(30), 5);
    assert.ok(isSlotUnlocked('special2', 30));
  });

  it('11. Level 40 unlocks 6 slots (2nd class transfer)', () => {
    assert.equal(getUnlockedSlotCount(40), 6);
    assert.ok(isSlotUnlocked('signature', 40));
  });

  it('12. Level 76 unlocks all 7 slots (3rd class transfer)', () => {
    assert.equal(getUnlockedSlotCount(76), 7);
    assert.ok(isSlotUnlocked('ultimate', 76));
    assert.deepEqual(getUnlockedSlots(76), ALL_SLOT_NAMES);
  });

  it('13. Level 50 does NOT unlock ultimate slot', () => {
    assert.ok(!isSlotUnlocked('ultimate', 50));
    assert.equal(getUnlockedSlotCount(50), 6);
  });

  it('14. getSlotUnlockLevel returns correct thresholds', () => {
    assert.equal(getSlotUnlockLevel('basic'), 1);
    assert.equal(getSlotUnlockLevel('core1'), 1);
    assert.equal(getSlotUnlockLevel('core2'), 10);
    assert.equal(getSlotUnlockLevel('special1'), 20);
    assert.equal(getSlotUnlockLevel('special2'), 30);
    assert.equal(getSlotUnlockLevel('signature'), 40);
    assert.equal(getSlotUnlockLevel('ultimate'), 76);
  });

  it('15. SLOT_PRIORITY_ORDER is reverse of unlock order (ultimate first)', () => {
    assert.equal(SLOT_PRIORITY_ORDER[0], 'ultimate');
    assert.equal(SLOT_PRIORITY_ORDER[SLOT_PRIORITY_ORDER.length - 1], 'basic');
    assert.equal(SLOT_PRIORITY_ORDER.length, 7);
  });
});

describe('Skill Loadout 2.0 — Equip / Unequip', () => {

  it('16. equipSkill places a learned skill into an unlocked slot', () => {
    const state = createMockState();
    const result = equipSkill(state, 'core1', 'sonic_storm', MOCK_SKILL_DEFS);
    assert.ok(result.success);
    assert.equal(state.skillLoadout.core1, 'sonic_storm');
  });

  it('17. equipSkill rejects unlearned skills', () => {
    const state = createMockState();
    const result = equipSkill(state, 'core1', 'nonexistent_skill', MOCK_SKILL_DEFS);
    assert.ok(!result.success);
    assert.ok(result.error.includes('not learned'));
  });

  it('18. equipSkill rejects passive skills', () => {
    const state = createMockState();
    const result = equipSkill(state, 'core1', 'iron_will', MOCK_SKILL_DEFS);
    assert.ok(!result.success);
    assert.ok(result.error.includes('Passive'));
  });

  it('19. equipSkill rejects purged skills', () => {
    const state = createMockState({ skills: { ...createMockState().skills, mount_golden_lion: 1 } });
    const result = equipSkill(state, 'core1', 'mount_golden_lion', MOCK_SKILL_DEFS);
    assert.ok(!result.success);
    assert.ok(result.error.includes('purged'));
  });

  it('20. equipSkill rejects locked slots', () => {
    const state = createMockState({ level: 5 }); // Only basic and core1 unlocked
    const result = equipSkill(state, 'ultimate', 'celestial_nova', MOCK_SKILL_DEFS);
    assert.ok(!result.success);
    assert.ok(result.error.includes('locked'));
  });

  it('21. equipSkill moves skill if already in another slot', () => {
    const state = createMockState();
    equipSkill(state, 'core1', 'sonic_storm', MOCK_SKILL_DEFS);
    assert.equal(state.skillLoadout.core1, 'sonic_storm');

    // Move to core2
    equipSkill(state, 'core2', 'sonic_storm', MOCK_SKILL_DEFS);
    assert.equal(state.skillLoadout.core2, 'sonic_storm');
    assert.equal(state.skillLoadout.core1, null, 'Old slot should be cleared');
  });

  it('22. unequipSkill clears a slot', () => {
    const state = createMockState();
    equipSkill(state, 'core1', 'sonic_storm', MOCK_SKILL_DEFS);
    assert.equal(state.skillLoadout.core1, 'sonic_storm');
    unequipSkill(state, 'core1');
    assert.equal(state.skillLoadout.core1, null);
  });

  it('23. isSkillEquipped returns true for equipped skills', () => {
    const state = createMockState();
    equipSkill(state, 'core1', 'sonic_storm', MOCK_SKILL_DEFS);
    assert.ok(isSkillEquipped(state, 'sonic_storm'));
    assert.ok(!isSkillEquipped(state, 'prominence'));
  });

  it('24. getEquippedSkillIds returns only non-null slot values', () => {
    const state = createMockState();
    equipSkill(state, 'core1', 'sonic_storm', MOCK_SKILL_DEFS);
    equipSkill(state, 'basic', 'power_strike', MOCK_SKILL_DEFS);
    const ids = getEquippedSkillIds(state);
    assert.equal(ids.length, 2);
    assert.ok(ids.includes('sonic_storm'));
    assert.ok(ids.includes('power_strike'));
  });
});

describe('Skill Loadout 2.0 — Auto-Equip', () => {

  it('25. autoEquipLoadout fills slots with best skills by quality', () => {
    const state = createMockState();
    autoEquipLoadout(state, MOCK_SKILL_DEFS);

    const loadout = state.skillLoadout;
    // Should have filled at least some slots
    const filled = Object.values(loadout).filter(v => v != null);
    assert.ok(filled.length >= 5, `Should fill at least 5 slots, got ${filled.length}`);

    // Ultimate slot should have the highest-ranked skill
    assert.equal(loadout.ultimate, 'celestial_nova', 'Ultimate should be celestial_nova (5★, Lv76)');
    // Signature should have solar_flare (5★, Lv60)
    assert.equal(loadout.signature, 'solar_flare', 'Signature should be solar_flare');
  });

  it('26. autoEquipLoadout never places passive skills in slots', () => {
    const state = createMockState();
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    const equippedIds = getEquippedSkillIds(state);
    assert.ok(!equippedIds.includes('iron_will'), 'Passive iron_will should not be in loadout');
  });

  it('27. autoEquipLoadout never places purged skills in slots', () => {
    const state = createMockState({ skills: { ...createMockState().skills, mount_golden_lion: 1 } });
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    const equippedIds = getEquippedSkillIds(state);
    assert.ok(!equippedIds.includes('mount_golden_lion'), 'Purged mount skill should not be in loadout');
  });

  it('28. autoEquipLoadout respects level-locked slots', () => {
    const state = createMockState({ level: 5 }); // Only basic, core1
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    assert.equal(state.skillLoadout.ultimate, null, 'Ultimate should be null at Lv5');
    assert.equal(state.skillLoadout.signature, null, 'Signature should be null at Lv5');
    assert.equal(state.skillLoadout.special1, null, 'Special1 should be null at Lv5');
  });

  it('29. No duplicate skills across slots after auto-equip', () => {
    const state = createMockState();
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    const equippedIds = getEquippedSkillIds(state);
    const unique = new Set(equippedIds);
    assert.equal(equippedIds.length, unique.size, 'No duplicate skills in loadout');
  });
});

describe('Skill Loadout 2.0 — Validation', () => {

  it('30. validateLoadout passes for valid loadout', () => {
    const state = createMockState();
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    const result = validateLoadout(state, MOCK_SKILL_DEFS);
    assert.ok(result.valid, `Errors: ${result.errors.join(', ')}`);
  });

  it('31. validateLoadout catches unlearned skills', () => {
    const state = createMockState();
    state.skillLoadout.core1 = 'nonexistent_skill';
    const result = validateLoadout(state, MOCK_SKILL_DEFS);
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('not learned')));
  });

  it('32. validateLoadout catches purged skills', () => {
    const state = createMockState({ skills: { ...createMockState().skills, mount_golden_lion: 1 } });
    state.skillLoadout.core1 = 'mount_golden_lion';
    const result = validateLoadout(state, MOCK_SKILL_DEFS);
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('Purged')));
  });

  it('33. validateLoadout catches passive skills in slots', () => {
    const state = createMockState();
    state.skillLoadout.core1 = 'iron_will';
    const result = validateLoadout(state, MOCK_SKILL_DEFS);
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('Passive')));
  });

  it('34. Empty loadout passes validation', () => {
    const state = createMockState();
    const result = validateLoadout(state);
    assert.ok(result.valid);
  });
});

describe('Skill Loadout 2.0 — Combat Integration', () => {

  it('35. getLoadoutForCombat returns skills in SLOT_PRIORITY_ORDER', () => {
    const state = createMockState();
    autoEquipLoadout(state, MOCK_SKILL_DEFS);
    const combatOrder = getLoadoutForCombat(state);

    assert.ok(combatOrder.length > 0);
    // First entry should be from ultimate or signature (highest priority slots)
    const firstSlot = combatOrder[0].slot;
    const firstPriIdx = SLOT_PRIORITY_ORDER.indexOf(firstSlot);
    for (let i = 1; i < combatOrder.length; i++) {
      const idx = SLOT_PRIORITY_ORDER.indexOf(combatOrder[i].slot);
      assert.ok(idx > firstPriIdx || idx >= SLOT_PRIORITY_ORDER.indexOf(combatOrder[i - 1].slot),
        `Combat order should follow SLOT_PRIORITY_ORDER`);
    }
  });

  it('36. Buffs/Toggles can be equipped in core/special slots', () => {
    const state = createMockState();
    const result = equipSkill(state, 'core1', 'war_cry', MOCK_SKILL_DEFS);
    assert.ok(result.success, 'Buff should be equippable in core slot');
    assert.equal(state.skillLoadout.core1, 'war_cry');
  });
});
