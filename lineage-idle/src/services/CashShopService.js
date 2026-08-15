/**
 * CashShopService.js — Serviço de Gestão e Processamento da Loja Comercial de Aden.
 *
 * Gerencia a moeda oficial de doação Aden Coins (AC), a compra e desempacotamento
 * inteligente dos 3 Starter Packs (adaptados por arquétipo Heavy / Light / Robe),
 * Equipamentos de Herança, Cosméticos, Títulos e Utilitários.
 */

import { CASH_SHOP_CATALOG } from '../data/shop/cash_shop_catalog.js';
import { HEIRLOOM_ITEMS } from '../data/items/heirloom_items.js';

export class CashShopService {
  /**
   * Retorna o saldo atual de Aden Coins (AC) do jogador.
   * @param {Object} state
   * @returns {number}
   */
  static getBalance(state) {
    return Number(state?.adenCoins) || 0;
  }

  /**
   * Identifica o arquétipo de armadura da classe (heavy, light ou robe).
   * @param {string} classId
   * @returns {'heavy'|'light'|'robe'}
   */
  static getArmorArchetype(classId = '') {
    const cls = String(classId).toLowerCase();
    if (
      cls.includes('mage') || cls.includes('wizard') || cls.includes('sorcerer') ||
      cls.includes('spellsinger') || cls.includes('spellhowler') || cls.includes('cleric') ||
      cls.includes('bishop') || cls.includes('prophet') || cls.includes('elder') ||
      cls.includes('shillien_e') || cls.includes('shillien_o') || cls.includes('oracle') ||
      cls.includes('warlock') || cls.includes('summoner') || cls.includes('elemental_s') ||
      cls.includes('phantom_s') || cls.includes('necromancer')
    ) {
      return 'robe';
    } else if (
      cls.includes('archer') || cls.includes('hawkeye') || cls.includes('ranger') ||
      cls.includes('silver_ran') || cls.includes('phantom_ran') || cls.includes('assassin') ||
      cls.includes('rogue') || cls.includes('dagger') || cls.includes('abyss_w') ||
      cls.includes('treasure_h') || cls.includes('plainswalker') || cls.includes('kamael') ||
      cls.includes('trooper') || cls.includes('soul_br') || cls.includes('trickster')
    ) {
      return 'light';
    }
    return 'heavy';
  }

  /**
   * Adiciona Aden Coins (AC) ao saldo do jogador (ex: após doação Pix / recarga).
   * @param {Object} state
   * @param {number} amount
   * @param {Object} callbacks
   */
  static addAdenCoins(state, amount, callbacks = {}) {
    const qty = Math.max(0, parseInt(amount, 10) || 0);
    state.adenCoins = (Number(state.adenCoins) || 0) + qty;
    if (callbacks.log) {
      callbacks.log(`🪙 **+${qty.toLocaleString()} Aden Coins (AC)** creditados com sucesso em sua conta!`, 'system');
    }
    if (callbacks.onUpdate) callbacks.onUpdate();
    return state.adenCoins;
  }

  /**
   * Processa a compra de um Starter Pack adaptando os itens ao arquétipo do herói.
   * @param {Object} state
   * @param {string} packId
   * @param {Object} callbacks
   * @returns {boolean}
   */
  static buyStarterPack(state, packId, callbacks = {}) {
    const pack = CASH_SHOP_CATALOG.starter_packs.find(p => p.id === packId);
    if (!pack) {
      if (callbacks.log) callbacks.log('❌ Pacote não encontrado no catálogo da Loja.', 'system');
      return false;
    }

    const currentBalance = this.getBalance(state);
    if (currentBalance < pack.priceAC) {
      if (callbacks.log) {
        callbacks.log(`❌ Saldo insuficiente! Você possui **${currentBalance} AC**, mas o pacote custa **${pack.priceAC} AC**.`, 'system');
      }
      return false;
    }

    // Debita o valor em AC
    state.adenCoins -= pack.priceAC;
    state.inventory = state.inventory || [];

    const archetype = this.getArmorArchetype(state.class);
    const isMage = archetype === 'robe';

    // Helper para adicionar item com UID único
    const addItem = (itemId, count = 1, enchant = 0, isHeirloom = false) => {
      for (let i = 0; i < count; i++) {
        state.inventory.push({
          uid: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          itemId: itemId,
          enchant: enchant,
          isHeirloom: isHeirloom,
          count: (itemId.includes('shot') || itemId.includes('potion') || itemId.includes('elixir')) ? count : 1
        });
        if (itemId.includes('shot') || itemId.includes('potion') || itemId.includes('elixir')) break;
      }
    };

    // 1. Pack Tier 1 (Iniciante)
    if (packId === 'starter_pack_tier1') {
      const armorSet = this.getDGradeArmorSet(archetype);
      armorSet.forEach(id => addItem(id, 1, 0));

      const starterWeapon = this.getStarterWeaponForClass(state.class);
      addItem(starterWeapon, 1, 3); // Arma D-Grade +3

      // Shots inteligentes: Spiritshots para magos, Soulshots para físicos
      const shotId = isMage ? 'spiritshot_d' : 'soulshot_d';
      addItem(shotId, 2000);
      addItem('hp_potion_l', 50);
      addItem('scroll_teleport', 5);

      if (callbacks.log) {
        callbacks.log(`🎉 **${pack.name}** resgatado! Você recebeu o Conjunto ${archetype.toUpperCase()} D-Grade, Arma +3 e 2.000x Shots adaptados à sua classe!`, 'system');
      }
    }

    // 2. Pack Tier 2 (Campeão)
    else if (packId === 'starter_pack_tier2') {
      const armorSet = this.getDGradeArmorSet(archetype);
      armorSet.forEach(id => addItem(id, 1, 3)); // Armadura +3

      const starterWeapon = this.getStarterWeaponForClass(state.class);
      addItem(starterWeapon, 1, 5); // Arma +5

      // Joias D-Grade
      addItem('jewel_elven_necklace', 1);
      addItem('jewel_elven_earring', 1);
      addItem('jewel_elven_earring', 1);
      addItem('jewel_elven_ring', 1);
      addItem('jewel_elven_ring', 1);

      // Shots inteligentes
      const shotId = isMage ? 'spiritshot_d' : 'soulshot_d';
      addItem(shotId, 5000);
      addItem('hp_potion_xl', 100);
      addItem('potion_haste', 15);
      addItem('scroll_teleport', 10);
      
      // Concede Título [Pioneiro]
      state.unlockedTitles = state.unlockedTitles || [];
      if (!state.unlockedTitles.includes('Pioneiro')) state.unlockedTitles.push('Pioneiro');
      state.title = 'Pioneiro';

      if (callbacks.log) {
        callbacks.log(`👑 **${pack.name}** ativado! Conjunto ${archetype.toUpperCase()} D-Grade +3, Arma +5, Joias, 5.000x Shots e Título **[Pioneiro]** concedidos!`, 'system');
      }
    }

    // 3. Pack Tier 3 (Lorde Soberano - Full Herança Scaling Lv 1-40)
    else if (packId === 'starter_pack_tier3') {
      // Entrega o Conjunto de Armadura de Herança específico do arquétipo
      const heirloomArmor = this.getHeirloomArmorSet(archetype);
      heirloomArmor.forEach(id => addItem(id, 1, 0, true));
      
      // Entrega a Arma de Herança correspondente à classe
      const heirloomWeapon = this.getHeirloomWeaponForClass(state.class);
      addItem(heirloomWeapon, 1, 0, true);

      // Joias de Herança
      addItem('jewelry_heirloom_necklace', 1, 0, true);
      addItem('jewelry_heirloom_earring_1', 1, 0, true);
      addItem('jewelry_heirloom_earring_2', 1, 0, true);
      addItem('jewelry_heirloom_ring_1', 1, 0, true);
      addItem('jewelry_heirloom_ring_2', 1, 0, true);

      // Capa, Cinto e Coroa Alada
      addItem('cloak_heirloom_royal', 1, 0, true);
      addItem('belt_heirloom_champion', 1, 0, true);
      addItem('hair_heirloom_crown', 1, 0, true);

      // Shots inteligentes C-Grade
      const shotId = isMage ? 'spiritshot_c' : 'soulshot_c';
      addItem(shotId, 15000);
      addItem('hp_potion_xl', 200);
      addItem('elixir_vigor_1h', 20);

      // Passe VIP 30 Dias
      state.vipTeleportUntil = Math.max(Date.now(), state.vipTeleportUntil || 0) + (30 * 24 * 3600 * 1000);

      // Título Dourado [Lorde Soberano]
      state.unlockedTitles = state.unlockedTitles || [];
      if (!state.unlockedTitles.includes('Lorde Soberano')) state.unlockedTitles.push('Lorde Soberano');
      state.title = 'Lorde Soberano';

      // Agathion Bebê Dragão Dourado
      state.activeAgathion = 'agathion_golden_dragon';

      if (callbacks.log) {
        callbacks.log(`✨ **PACOTE LORDE SOBERANO ATIVADO!** Você recebeu todo o Conjunto de Herança ${archetype.toUpperCase()} Dinâmico (Lv. 1 ao 40), Arma de Herança da Classe, Joias, Capa, Cinto, Coroa, 15.000x Shots, Passe VIP 30D, Agathion Dragão Dourado e o Título **[Lorde Soberano]**!`, 'system');
      }
    }

    state.starterPacksClaimed = state.starterPacksClaimed || [];
    state.starterPacksClaimed.push(packId);

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Retorna os IDs das 5 peças de armadura D-Grade por arquétipo.
   * @param {'heavy'|'light'|'robe'} archetype
   * @returns {string[]}
   */
  static getDGradeArmorSet(archetype = 'heavy') {
    if (archetype === 'robe') {
      return [
        'armor_mithril_tunic_robe',
        'armor_mithril_pants_robe',
        'armor_mithril_helmet_robe',
        'armor_mithril_gloves_robe',
        'armor_mithril_boots_robe'
      ];
    } else if (archetype === 'light') {
      return [
        'armor_manticore_armor_light',
        'armor_manticore_pants_light',
        'armor_manticore_helmet_light',
        'armor_manticore_gloves_light',
        'armor_manticore_boots_light'
      ];
    }
    return [
      'armor_brigandine_armor_heavy',
      'armor_brigandine_pants_heavy',
      'armor_brigandine_helmet_heavy',
      'armor_brigandine_gloves_heavy',
      'armor_brigandine_boots_heavy'
    ];
  }

  /**
   * Retorna os IDs das 5 peças de Armadura de Herança por arquétipo.
   * @param {'heavy'|'light'|'robe'} archetype
   * @returns {string[]}
   */
  static getHeirloomArmorSet(archetype = 'heavy') {
    if (archetype === 'robe') {
      return [
        'armor_heirloom_chest_robe',
        'armor_heirloom_legs_robe',
        'armor_heirloom_helmet_robe',
        'armor_heirloom_gloves_robe',
        'armor_heirloom_boots_robe'
      ];
    } else if (archetype === 'light') {
      return [
        'armor_heirloom_chest_light',
        'armor_heirloom_legs_light',
        'armor_heirloom_helmet_light',
        'armor_heirloom_gloves_light',
        'armor_heirloom_boots_light'
      ];
    }
    return [
      'armor_heirloom_chest_heavy',
      'armor_heirloom_legs_heavy',
      'armor_heirloom_helmet_heavy',
      'armor_heirloom_gloves_heavy',
      'armor_heirloom_boots_heavy'
    ];
  }

  /**
   * Retorna o ID da arma de herança apropriada para a classe do jogador.
   * @param {string} classId
   * @returns {string}
   */
  static getHeirloomWeaponForClass(classId = '') {
    const cls = String(classId).toLowerCase();
    if (cls.includes('vanguard') || cls.includes('rider') || cls.includes('spear') || cls.includes('warlord')) {
      return 'weapon_heirloom_spear';
    } else if (cls.includes('assassin') || cls.includes('rogue') || cls.includes('dagger') || cls.includes('abyss') || cls.includes('treasure')) {
      return 'weapon_heirloom_dagger';
    } else if (cls.includes('archer') || cls.includes('hawkeye') || cls.includes('phantom') || cls.includes('ranger') || cls.includes('silver')) {
      return 'weapon_heirloom_bow';
    } else if (cls.includes('mage') || cls.includes('wizard') || cls.includes('sorcerer') || cls.includes('spellsinger') || cls.includes('spellhowler') || cls.includes('cleric') || cls.includes('bishop') || cls.includes('elder') || cls.includes('shillien')) {
      return 'weapon_heirloom_staff';
    } else if (cls.includes('gladiator') || cls.includes('duelist') || cls.includes('tyrant') || cls.includes('warg')) {
      return 'weapon_heirloom_duals';
    } else if (cls.includes('artisan') || cls.includes('scavenger') || cls.includes('warsmith') || cls.includes('bounty')) {
      return 'weapon_heirloom_blunt';
    }
    return 'weapon_heirloom_sword';
  }

  /**
   * Retorna arma inicial D-Grade para os packs Tier 1 e 2.
   * @param {string} classId
   * @returns {string}
   */
  static getStarterWeaponForClass(classId = '') {
    const cls = String(classId).toLowerCase();
    if (cls.includes('vanguard') || cls.includes('spear') || cls.includes('warlord')) return 'weapon_winged_spear';
    if (cls.includes('dagger') || cls.includes('assassin') || cls.includes('rogue') || cls.includes('abyss') || cls.includes('treasure')) return 'weapon_crimson_sword';
    if (cls.includes('archer') || cls.includes('bow') || cls.includes('ranger') || cls.includes('hawkeye') || cls.includes('phantom') || cls.includes('silver')) return 'weapon_elven_bow';
    if (cls.includes('mage') || cls.includes('wizard') || cls.includes('sorcerer') || cls.includes('spellsinger') || cls.includes('spellhowler') || cls.includes('cleric') || cls.includes('bishop') || cls.includes('elder') || cls.includes('shillien')) return 'weapon_mystic_staff';
    if (cls.includes('gladiator') || cls.includes('duelist') || cls.includes('tyrant') || cls.includes('warg')) return 'weapon_dual_bastard_sword';
    if (cls.includes('dwarf') || cls.includes('artisan') || cls.includes('scavenger') || cls.includes('warsmith') || cls.includes('bounty')) return 'weapon_warhammer';
    return 'weapon_crimson_sword';
  }

  /**
   * Compra cosmético (Skin de Arma ou Traje).
   * @param {Object} state
   * @param {string} skinId
   * @param {Object} callbacks
   */
  static buyCostumeOrSkin(state, skinId, callbacks = {}) {
    const item = CASH_SHOP_CATALOG.costumes_and_skins.find(c => c.id === skinId);
    if (!item) return false;

    const currentBalance = this.getBalance(state);
    if (currentBalance < item.priceAC) {
      if (callbacks.log) callbacks.log(`❌ Saldo insuficiente para adquirir ${item.name}!`, 'system');
      return false;
    }

    state.adenCoins -= item.priceAC;
    state.unlockedCosmetics = state.unlockedCosmetics || [];
    if (!state.unlockedCosmetics.includes(skinId)) {
      state.unlockedCosmetics.push(skinId);
    }
    state.activeSkin = skinId;

    if (callbacks.log) {
      callbacks.log(`🎨 **${item.name}** adquirida e equipada com sucesso!`, 'system');
    }
    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Compra e equipa título honorário ou moldura.
   * @param {Object} state
   * @param {string} titleId
   * @param {Object} callbacks
   */
  static buyTitleOrEffect(state, titleId, callbacks = {}) {
    const item = CASH_SHOP_CATALOG.titles_and_effects.find(t => t.id === titleId);
    if (!item) return false;

    const currentBalance = this.getBalance(state);
    if (currentBalance < item.priceAC) {
      if (callbacks.log) callbacks.log(`❌ Saldo insuficiente para ${item.name}!`, 'system');
      return false;
    }

    state.adenCoins -= item.priceAC;
    state.unlockedTitles = state.unlockedTitles || [];

    if (item.category === 'title') {
      const titleClean = item.name.replace('Título: ', '').replace(/[\[\]]/g, '');
      if (!state.unlockedTitles.includes(titleClean)) state.unlockedTitles.push(titleClean);
      state.title = titleClean;
      state.titleColor = item.color;
    } else if (item.category === 'avatar_frame') {
      state.activeAvatarFrame = item.id;
    } else if (item.category === 'combat_aura') {
      state.activeCombatAura = item.id;
    }

    if (callbacks.log) {
      callbacks.log(`🏷️ **${item.name}** ativado no seu herói!`, 'system');
    }
    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }

  /**
   * Compra item utilitário (Passe VIP, Blessed Scrolls, Tomo 4★).
   * @param {Object} state
   * @param {string} utilityId
   * @param {Object} callbacks
   */
  static buyUtility(state, utilityId, callbacks = {}) {
    const item = CASH_SHOP_CATALOG.utility_and_passes.find(u => u.id === utilityId);
    if (!item) return false;

    const currentBalance = this.getBalance(state);
    if (currentBalance < item.priceAC) {
      if (callbacks.log) callbacks.log(`❌ Saldo insuficiente para ${item.name}!`, 'system');
      return false;
    }

    state.adenCoins -= item.priceAC;
    state.inventory = state.inventory || [];

    if (utilityId === 'pass_vip_teleport_30d') {
      state.vipTeleportUntil = Math.max(Date.now(), state.vipTeleportUntil || 0) + (30 * 24 * 3600 * 1000);
      if (callbacks.log) callbacks.log('🌟 **Passe VIP de Teleporte (30 Dias)** ativado! Teleportes livres liberados.', 'system');
    } else if (utilityId === 'elixir_vigor_bundle_5') {
      state.inventory.push({
        uid: `util_${Date.now()}`,
        itemId: 'elixir_vigor_1h',
        count: 5
      });
      if (callbacks.log) callbacks.log('🧪 **5x Elixires de Vigor** entregues no seu inventário!', 'system');
    } else {
      state.inventory.push({
        uid: `util_${Date.now()}`,
        itemId: utilityId,
        count: 1
      });
      if (callbacks.log) callbacks.log(`📦 **${item.name}** adicionado ao seu inventário!`, 'system');
    }

    if (callbacks.onUpdate) callbacks.onUpdate();
    return true;
  }
}
