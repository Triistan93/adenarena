import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_STATE } from '../lineage-idle/src/core/StateManager.js';
import { getStats } from '../lineage-idle/src/engine/StatsEngine.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { getItemGradeCode } from '../lineage-idle/src/data/items/item_grade.js';
import { calculatePhysicalDamage, calculateMagicDamage, calculateIncomingDamageMitigation } from '../lineage-idle/src/data/balance/combatBalance.js';

function statsWithItem(itemId, slot) {
  const def = ALL_ITEMS[itemId];
  assert.ok(def, `catalog item missing: ${itemId}`);
  const state = DEFAULT_STATE();
  state.race = 'human';
  state.class = 'fighter';
  state.level = 90;
  const uid = `tier-${itemId}`;
  state.inventory = [{ ...def, uid, itemId, slot }];
  const equipmentSlot = slot === 'ring' ? 'ring1' : slot === 'earring' ? 'earring1' : slot;
  state.equipment = { ...state.equipment, [equipmentSlot]: uid };
  const previous = globalThis.GameData;
  globalThis.GameData = { ...(previous || {}), ALL_ITEMS };
  try {
    return getStats(state);
  } finally {
    if (previous === undefined) delete globalThis.GameData;
    else globalThis.GameData = previous;
  }
}

describe('Balance between S grade and Aden Arena endgame equipment', () => {
  it('Frost Lord weapons outperform every ordinary S weapon in final combat damage', () => {
    const uniqueItems = [...new Map(Object.values(ALL_ITEMS).map(item => [item.id, item])).values()];
    const sPhysicalAttack = uniqueItems
      .filter(item => item.slot === 'weapon' && getItemGradeCode(item) === 's' && Number(item.atk) > 0)
      .map(item => statsWithItem(item.id, 'weapon').atk);
    const sMagicAttack = uniqueItems
      .filter(item => item.slot === 'weapon' && getItemGradeCode(item) === 's' && Number(item.matk) > 0)
      .map(item => statsWithItem(item.id, 'weapon').matk);
    const strongestSPhysicalDamage = Math.max(...sPhysicalAttack.map(atk => calculatePhysicalDamage({ atk, def: 120, applyVariance: false })));
    const strongestSMagicDamage = Math.max(...sMagicAttack.map(matk => calculateMagicDamage({ matk, mdef: 120, applyVariance: false })));
    const frostLordWeapons = uniqueItems.filter(item => item.slot === 'weapon' && getItemGradeCode(item) === 'frostlord');

    assert.ok(frostLordWeapons.length > 0, 'Frost Lord weapon catalog must exist');
    for (const weapon of frostLordWeapons) {
      const actual = statsWithItem(weapon.id, 'weapon');
      if (Number(weapon.matk) > 0) {
        assert.ok(actual.matk > Math.max(...sMagicAttack), `${weapon.name} must beat every ordinary S weapon in final M. Atk`);
        assert.ok(calculateMagicDamage({ matk: actual.matk, mdef: 120, applyVariance: false }) > strongestSMagicDamage,
          `${weapon.name} must deal more damage than every ordinary S weapon through the final magic formula`);
      } else {
        assert.ok(actual.atk > Math.max(...sPhysicalAttack), `${weapon.name} must beat every ordinary S weapon in final P. Atk`);
        assert.ok(calculatePhysicalDamage({ atk: actual.atk, def: 120, applyVariance: false }) > strongestSPhysicalDamage,
          `${weapon.name} must deal more damage than every ordinary S weapon through the final physical formula`);
      }
    }
  });

  it('endgame armor and boss jewelry reach effective defense, damage, and utility stats', () => {
    const sCloak = statsWithItem('armor_protection_cloack', 'cloak');
    const castleCloak = statsWithItem('castle_cloak', 'cloak');
    const sNecklace = statsWithItem('jewel_tateossian_necklace', 'necklace');
    const valakasNecklace = statsWithItem('jewel_necklace_of_valakas', 'necklace');

    assert.ok(castleCloak.def > sCloak.def && castleCloak.mdef > sCloak.mdef);
    assert.ok(calculateIncomingDamageMitigation(1_000, castleCloak, 'physical') < calculateIncomingDamageMitigation(1_000, sCloak, 'physical'));
    assert.ok(calculateIncomingDamageMitigation(1_000, castleCloak, 'magic') < calculateIncomingDamageMitigation(1_000, sCloak, 'magic'));
    assert.ok(valakasNecklace.matk > sNecklace.matk);
    assert.ok(valakasNecklace.maxHp > sNecklace.maxHp);
    assert.ok(valakasNecklace.mdef > sNecklace.mdef);

    const sRing = statsWithItem('jewel_tateossian_ring', 'ring');
    const valakasRing = statsWithItem('jewel_ring_of_valakas', 'ring');
    assert.ok(valakasRing.atk > sRing.atk);
    assert.ok(valakasRing.matk > sRing.matk);
    assert.ok(valakasRing.def > sRing.def);
    assert.ok(valakasRing.mdef > sRing.mdef);
    assert.ok(valakasRing.maxHp > sRing.maxHp);
    assert.ok(valakasRing.crit > sRing.crit);

    const antharasEarring = statsWithItem('jewel_earring_of_antharas', 'earring');
    const sEarringBaseline = DEFAULT_STATE();
    sEarringBaseline.race = 'human';
    sEarringBaseline.class = 'fighter';
    sEarringBaseline.level = 90;
    const sEarringStats = getStats(sEarringBaseline);
    assert.ok(antharasEarring.lifeDrain > sEarringStats.lifeDrain);
    assert.ok(antharasEarring.xpBoost > sEarringStats.xpBoost);
    assert.ok(antharasEarring.goldBoost > sEarringStats.goldBoost);
    assert.ok(antharasEarring.maxHp > sEarringStats.maxHp);
  });
});
