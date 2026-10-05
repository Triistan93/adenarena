import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CONSUMABLES } from '../lineage-idle/src/data/items/consumables.js';
import { ALL_ITEMS } from '../lineage-idle/src/data/items/index.js';
import { ZONE_CONSUMABLES } from '../lineage-idle/src/data/items/recipes_drops.js';
import { RAID_BOSSES } from '../lineage-idle/src/data/raids.js';
import { matchesShopCategory, SHOP_CATEGORY_TREE, buildShopStatsSummary } from '../lineage-idle/src/ui/GameUI.js';

describe('Merchant Store Refinement & Catalog Integrity', () => {
  it('1. HP & MP Potions have scaled prices, healing values, grade badges and descriptions', () => {
    // HP Potions
    const hpS = CONSUMABLES.hp_potion_s;
    assert.equal(hpS.price, 25);
    assert.equal(hpS.healAmt, 100);
    assert.equal(hpS.grade, 'ng');
    assert.ok(hpS.desc.includes('100'));

    const hpM = CONSUMABLES.hp_potion_m;
    assert.equal(hpM.price, 65);
    assert.equal(hpM.healAmt, 150);
    assert.equal(hpM.grade, 'd');
    assert.ok(hpM.desc.includes('150'));

    const hpL = CONSUMABLES.hp_potion_l;
    assert.equal(hpL.price, 160);
    assert.equal(hpL.healAmt, 300);
    assert.equal(hpL.grade, 'c');
    assert.ok(hpL.desc.includes('300'));

    const hpXL = CONSUMABLES.hp_potion_xl;
    assert.equal(hpXL.price, 350);
    assert.equal(hpXL.healAmt, 500);
    assert.equal(hpXL.grade, 'b');
    assert.ok(hpXL.desc.includes('500'));

    const greaterHp = CONSUMABLES.greater_healing_potion;
    assert.equal(greaterHp.price, 750);
    assert.equal(greaterHp.healAmt, 850);
    assert.equal(greaterHp.grade, 'a');
    assert.ok(greaterHp.desc.includes('850'));

    // MP Potions
    const mpS = CONSUMABLES.mp_potion_s;
    assert.equal(mpS.price, 30);
    assert.equal(mpS.healAmt, 80);
    assert.equal(mpS.grade, 'ng');
    assert.ok(mpS.desc.includes('80'));

    const mpM = CONSUMABLES.mp_potion_m;
    assert.equal(mpM.price, 90);
    assert.equal(mpM.healAmt, 150);
    assert.equal(mpM.grade, 'd');
    assert.ok(mpM.desc.includes('150'));

    const mpL = CONSUMABLES.mp_potion_l;
    assert.equal(mpL.price, 220);
    assert.equal(mpL.healAmt, 300);
    assert.equal(mpL.grade, 'c');
    assert.ok(mpL.desc.includes('300'));

    const mpXL = CONSUMABLES.mp_potion_xl;
    assert.equal(mpXL.price, 450);
    assert.equal(mpXL.healAmt, 500);
    assert.equal(mpXL.grade, 'b');
    assert.ok(mpXL.desc.includes('500'));

    // buildShopStatsSummary verification
    assert.ok(buildShopStatsSummary(hpM).includes('150 HP'));
    assert.ok(buildShopStatsSummary(mpL).includes('300 MP'));
  });

  it('2. Soulshots and Spiritshots have distinct authentic Lineage II icons per grade', () => {
    // Soulshots
    assert.equal(CONSUMABLES.soulshot_ng.icon, 'icons/etc_spirit_bullet_white_i00.webp');
    assert.equal(CONSUMABLES.soulshot_d.icon, 'icons/etc_spirit_bullet_blue_i00.webp');
    assert.equal(CONSUMABLES.soulshot_c.icon, 'icons/etc_spirit_bullet_green_i00.webp');
    assert.equal(CONSUMABLES.soulshot_b.icon, 'icons/etc_spirit_bullet_red_i00.webp');
    assert.equal(CONSUMABLES.soulshot_a.icon, 'icons/etc_spirit_bullet_silver_i00.webp');
    assert.equal(CONSUMABLES.soulshot_s.icon, 'icons/etc_spirit_bullet_gold_i00.webp');

    assert.equal(CONSUMABLES.soulshot_ng.grade, 'ng');
    assert.equal(CONSUMABLES.soulshot_d.grade, 'd');
    assert.equal(CONSUMABLES.soulshot_c.grade, 'c');
    assert.equal(CONSUMABLES.soulshot_b.grade, 'b');
    assert.equal(CONSUMABLES.soulshot_a.grade, 'a');
    assert.equal(CONSUMABLES.soulshot_s.grade, 's');

    // Spiritshots
    assert.equal(CONSUMABLES.spiritshot_ng.icon, 'icons/etc_spell_shot_white_i00.webp');
    assert.equal(CONSUMABLES.spiritshot_d.icon, 'icons/etc_spell_shot_blue_i00.webp');
    assert.equal(CONSUMABLES.spiritshot_c.icon, 'icons/etc_spell_shot_green_i00.webp');
    assert.equal(CONSUMABLES.spiritshot_b.icon, 'icons/etc_spell_shot_red_i00.webp');
    assert.equal(CONSUMABLES.spiritshot_a.icon, 'icons/etc_spell_shot_silver_i00.webp');
    assert.equal(CONSUMABLES.spiritshot_s.icon, 'icons/etc_spell_shot_gold_i00.webp');

    assert.equal(CONSUMABLES.spiritshot_ng.grade, 'ng');
    assert.equal(CONSUMABLES.spiritshot_d.grade, 'd');
    assert.equal(CONSUMABLES.spiritshot_c.grade, 'c');
    assert.equal(CONSUMABLES.spiritshot_b.grade, 'b');
    assert.equal(CONSUMABLES.spiritshot_a.grade, 'a');
    assert.equal(CONSUMABLES.spiritshot_s.grade, 's');
  });

  it('3. Enchant Scrolls use authentic icons, only D/C/B are sold in store, and A/S are reserved for drops', () => {
    // Icons
    assert.equal(CONSUMABLES.scroll_enchant_weapon_d.icon, 'icons/etc_scroll_of_enchant_weapon_i01.webp');
    assert.equal(CONSUMABLES.scroll_enchant_armor_d.icon, 'icons/etc_scroll_of_enchant_armor_i01.webp');
    assert.equal(CONSUMABLES.scroll_enchant_weapon_c.icon, 'icons/etc_scroll_of_enchant_weapon_i01.webp');
    assert.equal(CONSUMABLES.scroll_enchant_armor_c.icon, 'icons/etc_scroll_of_enchant_armor_i02.webp');
    assert.equal(CONSUMABLES.scroll_enchant_weapon_b.icon, 'icons/etc_scroll_of_enchant_weapon_i02.webp');
    assert.equal(CONSUMABLES.scroll_enchant_armor_b.icon, 'icons/etc_scroll_of_enchant_armor_i03.webp');
    assert.equal(CONSUMABLES.scroll_enchant_weapon_a.icon, 'icons/etc_scroll_of_enchant_weapon_i02.webp');
    assert.equal(CONSUMABLES.scroll_enchant_armor_a.icon, 'icons/etc_scroll_of_enchant_armor_i03.webp');
    assert.equal(CONSUMABLES.scroll_enchant_weapon_s.icon, 'icons/etc_scroll_of_enchant_weapon_i03.webp');
    assert.equal(CONSUMABLES.scroll_enchant_armor_s.icon, 'icons/etc_scroll_of_enchant_armor_i04.webp');

    // Store Gating
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_weapon_d, 'consumables', 'scrolls'), true);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_armor_d, 'consumables', 'scrolls'), true);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_weapon_c, 'consumables', 'scrolls'), true);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_armor_c, 'consumables', 'scrolls'), true);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_weapon_b, 'consumables', 'scrolls'), true);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_armor_b, 'consumables', 'scrolls'), true);

    // Grade A and Grade S MUST NOT appear in the merchant shop
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_weapon_a, 'consumables', 'scrolls'), false);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_armor_a, 'consumables', 'scrolls'), false);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_weapon_s, 'consumables', 'scrolls'), false);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_enchant_armor_s, 'consumables', 'scrolls'), false);

    // Redundant legacy aliases MUST NOT appear in the merchant shop
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_universal, 'consumables', 'scrolls'), false);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_of_enchant_weapon_, 'consumables', 'scrolls'), false);
    assert.equal(matchesShopCategory(ALL_ITEMS.scroll_of_enchant_armor, 'consumables', 'scrolls'), false);

    // Drops: Grade A and S present in high zones and raid bosses
    assert.ok(ZONE_CONSUMABLES.emeraldGrove.includes('scroll_enchant_weapon_a'));
    assert.ok(ZONE_CONSUMABLES.forgeOfGods.includes('scroll_enchant_weapon_s'));
    assert.ok(RAID_BOSSES.zaken.drops.some(d => d.itemId === 'scroll_enchant_weapon_a'));
    assert.ok(RAID_BOSSES.antharas.drops.some(d => d.itemId === 'scroll_enchant_weapon_s'));
  });

  it('4. Spellbooks (1★ to 4★) are strictly excluded from the merchant shop inventory', () => {
    const starBooks = [
      'spellbook_1star', 'spellbook_2star', 'spellbook_3star', 'spellbook_4star',
      'book_1star', 'book_2star', 'book_3star', 'book_4star'
    ];

    for (const bookId of starBooks) {
      const def = ALL_ITEMS[bookId] || { id: bookId, slot: 'spellbook', name: `Spellbook ${bookId}` };
      assert.equal(matchesShopCategory(def, 'consumables', 'all'), false, `${bookId} should not match shop consumables`);
      assert.equal(matchesShopCategory(def, 'consumables', 'scrolls'), false, `${bookId} should not match shop scrolls`);
      assert.equal(matchesShopCategory(def, 'others', 'all'), false, `${bookId} should not match shop others`);
    }

    // Books subcategory removed from consumables
    const subcats = SHOP_CATEGORY_TREE.consumables.subcategories;
    assert.equal(subcats.some(s => s.id === 'books'), false, 'books subcategory should be removed from consumables');
  });
});
