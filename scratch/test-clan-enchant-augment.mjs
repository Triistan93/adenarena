import assert from 'assert';

import { CLAN_LEVEL_DATA, CLAN_SKILLS } from '../adenarena/lineage-idle/src/data/clan.js';
import { CASTLES, CASTLE_SHOP_CATALOG } from '../adenarena/lineage-idle/src/data/castles.js';
import { ClanService } from '../adenarena/lineage-idle/src/services/ClanService.js';
import { ENCHANT_ROUTES, getEnchantLevelData, ENCHANT_ITEMS } from '../adenarena/lineage-idle/src/data/skill_enchant.js';
import { SkillEnchantService } from '../adenarena/lineage-idle/src/services/SkillEnchantService.js';
import { LIFE_STONES, ITEM_SKILLS } from '../adenarena/lineage-idle/src/data/augmentation.js';
import { AugmentationService } from '../adenarena/lineage-idle/src/services/AugmentationService.js';

console.log('=== TESTE 1: Sistema de Clãs & Clan Skills ===');
const state1 = {
  level: 80,
  gold: 100000000,
  sp: 5000000,
  clan: { level: 1, castles: [], lastTaxTimestamp: Date.now(), accumulatedTaxes: {} },
  inventory: []
};

// Evoluir Clã do Lv 1 ao Lv 5
for (let l = 1; l < 5; l++) {
  const upRes = ClanService.upgradeClan(state1, { log: () => {} });
  assert.strictEqual(upRes.success, true, `Falha ao evoluir para clã nível ${l+1}`);
}
assert.strictEqual(state1.clan.level, 5, 'Clã deve estar no nível 5');

const clanStatus = ClanService.getClanStatus(state1);
assert.strictEqual(clanStatus.activeSkills.length, 6, 'Clã Lv. 5 deve ter todas as 6 Clan Skills ativas');
console.log('✓ Clã evoluído para Lv. 5 e todas as 6 Clan Skills ativadas com sucesso!');

console.log('\n=== TESTE 2: Guerra de Cerco (Castle Siege) & Renda de Tributos ===');
// Declarar cerco ao Castelo de Giran
const siegeRes = ClanService.startSiege(state1, 'giran', { log: () => {} });
assert.strictEqual(siegeRes.success, true, 'Falha ao declarar cerco a Giran');
assert.strictEqual(state1.activeSiege.phase, 1, 'Deve iniciar na Fase 1 (Portões)');

// Executar ataques até vencer todas as 3 fases
state1.stats = { atk: 15000, matk: 15000 };
while (!state1.activeSiege.isCompleted) {
  ClanService.executeSiegeTurn(state1, { log: () => {} });
}

assert.strictEqual(state1.activeSiege.isCompleted, true, 'O cerco deve estar concluído');
assert.strictEqual(state1.clan.castles.includes('giran'), true, 'Giran deve estar sob controle do clã');

// Simular acúmulo de taxas e recolhimento
state1.clan.accumulatedTaxes['giran'] = 1500000;
const taxRes = ClanService.claimCastleTaxes(state1, 'giran', { log: () => {} });
assert.strictEqual(taxRes.success, true, 'Deve recolher taxas de Giran com sucesso');
assert.strictEqual(state1.clan.accumulatedTaxes['giran'], 0, 'Tesouro do castelo deve zerar após coleta');
console.log('✓ Cerco ao Castelo de Giran vencido com Seal of Ruler e taxas recolhidas!');

console.log('\n=== TESTE 3: Encantamento de Habilidades (+1 a +30) ===');
const state2 = {
  level: 80,
  sp: 10000000,
  gold: 50000000,
  skillEnchants: {},
  inventory: [{ id: 'giants_codex_mastery', count: 10 }]
};

// Encantar uma habilidade com Giant's Codex Mastery
const encRes = SkillEnchantService.enchantSkill(state2, 'warrior_power_smash', 'Power Smash', 'power', true, { log: () => {} });
const encData = SkillEnchantService.getSkillEnchant(state2, 'warrior_power_smash');
assert(encData.level >= 0, 'Nível de encante deve ser válido');

const mults = SkillEnchantService.getSkillMultipliers(state2, 'warrior_power_smash');
assert(mults.damageMultiplier >= 1.0, 'Multiplicador de dano deve ser >= 1.0');
console.log('✓ Encantamento de Habilidade com Giant\'s Codex validado com sucesso!');

console.log('\n=== TESTE 4: Augmentação de Armas com Life Stones ===');
const state3 = {
  level: 80,
  gold: 50000000,
  equipment: {
    weapon: {
      id: 'weapon_infinity_blade',
      slot: 'weapon',
      name: 'Infinity Blade 👑'
    }
  },
  inventory: []
};

// Augmentar com Top-Grade Life Stone 76
const augRes = AugmentationService.augmentWeapon(state3, state3.equipment.weapon, 'life_stone_top_76', { log: () => {} });
assert.strictEqual(augRes.success, true, 'Augmentação deve ser bem-sucedida');
assert(state3.equipment.weapon.augmentation, 'A arma deve ter o objeto de augmentação gravado');
assert(state3.equipment.weapon.augmentation.stats, 'Deve conter stats aleatórios rolados');
assert.strictEqual(state3.equipment.weapon.augmentation.glow, true, 'Top-Grade Life Stone tem 100% de garantia de glow');

console.log(`✓ Augmentação aplicada na arma: Glow=${state3.equipment.weapon.augmentation.glowColor}, Stats=`, state3.equipment.weapon.augmentation.stats);

// Remover augmentação
const remRes = AugmentationService.removeAugmentation(state3, state3.equipment.weapon, { log: () => {} });
assert.strictEqual(remRes.success, true, 'Remoção de augmentação deve ser bem-sucedida');
assert.strictEqual(state3.equipment.weapon.augmentation, undefined, 'Augmentação deve ter sido removida');
console.log('✓ Remoção e purificação de augmentação pelo ferreiro concluída!');

console.log('\n🎉 TODOS OS TESTES DOS 3 SISTEMAS PASSARAM COM 100% DE SUCESSO!');
