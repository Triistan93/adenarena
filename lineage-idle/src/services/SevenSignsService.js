import { FACTIONS, SEAL_STONES, SEVEN_SIGNS_BOSSES, MAMMON_BLACKSMITH_SERVICES, MAMMON_MERCHANT_CATALOG, NECROPOLIS_ZONES } from '../data/seven_signs.js';
import { addToInventory } from './InventoryService.js';
import { ALL_ITEMS } from '../data/items/index.js';
import { getItemGradeCode } from '../data/items/item_grade.js';
import { SA_RUNES } from './ElementalService.js';

const SEVEN_SIGNS_PHASE_MS = 7 * 24 * 60 * 60 * 1000;

export class SevenSignsService {
  /**
   * Inicializa o estado de Seven Signs se necessário
   */
  static ensureState(state) {
    if (!state.sevenSigns || typeof state.sevenSigns !== 'object') {
      state.sevenSigns = {
        faction: null, // 'dawn' | 'dusk'
        playerScore: 0,
        dawnScore: 250000,
        duskScore: 240000,
        ancientAdena: 0,
        stonesDeposited: { seal_stone_blue: 0, seal_stone_green: 0, seal_stone_red: 0 },
        activeBossFight: null,
        bossDefeats: { lilith: 0, anakim: 0 }
      };
    }
    if (typeof state.sevenSigns.ancientAdena !== 'number') {
      state.sevenSigns.ancientAdena = 0;
    }
    return state.sevenSigns;
  }

  /**
   * Escolhe a facção (Dawn ou Dusk)
   */
  static joinFaction(state, factionId, hooks = {}) {
    const ss = this.ensureState(state);
    if (!FACTIONS[factionId]) {
      return { success: false, message: 'Facção inválida.' };
    }
    ss.faction = factionId;
    hooks.log?.(`🏛️ Você jurou fidelidade à facção **${FACTIONS[factionId].name}** na competição dos Sete Selos!`, 'system');
    hooks.onUpdate?.();
    return { success: true, faction: factionId };
  }

  /**
   * Deposita pedras de selo para pontuar e converter em Ancient Adena
   */
  static depositStones(state, stoneId, count = 1, hooks = {}) {
    const ss = this.ensureState(state);
    if (!Number.isSafeInteger(count) || count <= 0) {
      return { success: false, message: 'Informe uma quantidade inteira positiva de pedras.' };
    }
    if (!ss.faction) {
      return { success: false, message: 'Você precisa escolher uma facção primeiro.' };
    }
    const def = SEAL_STONES[stoneId];
    if (!def) return { success: false, message: 'Pedra de selo inválida.' };

    const inv = state.inventory || [];
    const invItem = inv.find(i => (i.id === stoneId || i.itemId === stoneId));
    const available = invItem ? (invItem.count || 1) : 0;
    if (available < count) {
      return { success: false, message: `Você não tem ${count}x ${def.name}.` };
    }

    // Deduz do inventário
    if (invItem.count && invItem.count > count) {
      invItem.count -= count;
    } else {
      const idx = inv.indexOf(invItem);
      if (idx !== -1) inv.splice(idx, 1);
    }

    const aaGained = count * def.aaValue;
    ss.ancientAdena += aaGained;
    ss.playerScore += aaGained;
    ss.stonesDeposited[stoneId] = (ss.stonesDeposited[stoneId] || 0) + count;

    if (ss.faction === 'dawn') {
      ss.dawnScore += aaGained;
    } else {
      ss.duskScore += aaGained;
    }

    hooks.log?.(`🏛️ Você entregou **${count}x ${def.name}** e recebeu **+${aaGained.toLocaleString()} Ancient Adena**!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, aaGained, totalAA: ss.ancientAdena };
  }

  /**
   * Inicia o confronto contra Lilith ou Anakim
   */
  static startBossFight(state, bossId, hooks = {}) {
    const ss = this.ensureState(state);
    const boss = SEVEN_SIGNS_BOSSES[bossId];
    if (!boss) return { success: false, message: 'Chefe de selo não encontrado.' };

    if (state.level < boss.level) {
      return { success: false, message: `Nível ${boss.level}+ necessário para desafiar ${boss.name}.` };
    }

    if (ss.activeBossFight) {
      return { success: false, reason: 'fight_in_progress', message: 'Conclua o confronto de selo ativo antes de abrir outro portal.' };
    }

    if (ss.ancientAdena < boss.reqAA) {
      return { success: false, message: `Requer ${boss.reqAA.toLocaleString()} Ancient Adena para abrir o portal do santuário.` };
    }

    ss.ancientAdena -= boss.reqAA;
    ss.activeBossFight = {
      bossId,
      bossName: boss.name,
      bossHp: boss.hp,
      maxHp: boss.hp,
      pAtk: boss.pAtk,
      pDef: boss.pDef,
      turn: 1
    };

    hooks.log?.(`⚡ O portal selado se abriu! Você adentrou o santuário sagrado de **${boss.name}**!`, 'warning');
    hooks.onUpdate?.();
    return { success: true, fight: ss.activeBossFight };
  }

  /**
   * Executa um turno no confronto contra o Chefe de Selo
   */
  static executeBossTurn(state, hooks = {}) {
    const ss = this.ensureState(state);
    const fight = ss.activeBossFight;
    if (!fight) return { success: false, message: 'Nenhum confronto de selo ativo.' };

    const boss = SEVEN_SIGNS_BOSSES[fight.bossId];
    const playerStats = state.stats || { atk: 2500, matk: 2500, def: 2000, mdef: 2000 };
    const playerDmg = Math.max(100, Math.floor((playerStats.atk || 1500) * 1.5 - fight.pDef * 0.4));
    const remainingBossHp = Math.max(0, fight.bossHp - playerDmg);
    let victoryInventory = null;
    if (remainingBossHp === 0) {
      victoryInventory = {
        ...state,
        inventory: (Array.isArray(state.inventory) ? state.inventory : []).map(item => ({ ...item }))
      };
      for (const itemId of boss.rewards.items) {
        if (!addToInventory(victoryInventory, itemId, 1, null, false, {}, true)) {
          return { success: false, reason: 'inventory_full', message: 'Libere espaço na mochila para receber as recompensas do chefe.' };
        }
      }
    }
    fight.bossHp = remainingBossHp;

    hooks.log?.(`⚔️ Você desferiu **${playerDmg.toLocaleString()}** de dano em **${boss.name}** (HP: ${fight.bossHp.toLocaleString()} / ${fight.maxHp.toLocaleString()})`, 'combat');

    if (fight.bossHp <= 0) {
      // Vitória!
      ss.bossDefeats[fight.bossId] = (ss.bossDefeats[fight.bossId] || 0) + 1;
      ss.ancientAdena += boss.rewards.aa;
      state.xp = (state.xp || 0) + boss.rewards.xp;
      state.sp = (state.sp || 0) + boss.rewards.sp;

      state.inventory = victoryInventory.inventory;

      ss.activeBossFight = null;
      hooks.log?.(`🏆 VITÓRIA GLORIOSA! Você derrotou **${boss.name}**! Recompensas: +${boss.rewards.aa.toLocaleString()} AA, +${boss.rewards.xp.toLocaleString()} XP e Itens Supremos!`, 'victory');
      hooks.onUpdate?.();
      return { success: true, isVictory: true, rewards: boss.rewards };
    }

    // Contra-ataque do Chefe
    const bossDmg = Math.max(50, Math.floor(fight.pAtk * 1.2 - (playerStats.def || 1000) * 0.2));
    state.hp = Math.max(1, (state.hp || 5000) - bossDmg);
    hooks.log?.(`⚠️ **${boss.name}** conjurou um golpe devastador causando **${bossDmg.toLocaleString()}** de dano no jogador!`, 'danger');

    fight.turn++;
    hooks.onUpdate?.();
    return { success: true, isVictory: false, fight };
  }

  /**
   * Comprar item do Mercador de Mammon
   */
  static buyMammonItem(state, itemId, hooks = {}) {
    const ss = this.ensureState(state);
    const item = MAMMON_MERCHANT_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Item de Mammon não encontrado.' };

    if (ss.ancientAdena < item.costAA) {
      return { success: false, message: `Ancient Adena insuficiente. Requer ${item.costAA.toLocaleString()} AA.` };
    }

    const purchaseState = {
      ...state,
      inventory: (Array.isArray(state.inventory) ? state.inventory : []).map(entry => ({ ...entry }))
    };
    if (!addToInventory(purchaseState, item.id, 1, null, false, {}, true)) {
      return { success: false, reason: 'inventory_full', message: 'Libere espaço na mochila antes de comprar este item.' };
    }

    state.inventory = purchaseState.inventory;
    ss.ancientAdena -= item.costAA;

    hooks.log?.(`🛒 Você adquiriu **${item.name}** do Merchant of Mammon por **${item.costAA.toLocaleString()} AA**!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, item };
  }

  /**
   * Deselar armadura com o Blacksmith of Mammon
   */
  static unsealArmor(state, armorItem, hooks = {}) {
    const accessCheck = this.canAccessExclusiveBlacksmith(state);
    if (!accessCheck.allowed) {
      return { success: false, message: accessCheck.message };
    }

    const ss = this.ensureState(state);
    const cost = 50000;
    const inventoryItem = armorItem && (state.inventory || []).find(item =>
      item === armorItem || (armorItem.uid && item.uid === armorItem.uid)
    );
    const definition = inventoryItem && ALL_ITEMS[inventoryItem.itemId || inventoryItem.id];
    if (!inventoryItem || (definition?.slot || inventoryItem.slot) !== 'armor') {
      return { success: false, reason: 'armor_not_owned', message: 'A armadura precisa estar na mochila ou equipada.' };
    }
    if (!['a', 's'].includes(getItemGradeCode({ ...definition, ...inventoryItem }))) {
      return { success: false, reason: 'ineligible_armor_grade', message: 'O Blacksmith de Mammon só desela armaduras A ou S Grade.' };
    }
    if (inventoryItem.isUnsealed === true) {
      return { success: false, reason: 'armor_not_sealed', message: 'Esta armadura não está selada.' };
    }
    if (ss.ancientAdena < cost) {
      return { success: false, message: `Ancient Adena insuficiente. Requer ${cost.toLocaleString()} AA para deselar armadura.` };
    }
    ss.ancientAdena -= cost;
    inventoryItem.isUnsealed = true;
    inventoryItem.name = inventoryItem.name ? inventoryItem.name.replace(/\s*\(Sealed\)|\s*\(Selada\)/ig, '').trim() + ' (Unsealed ✨' + ')' : 'Armadura Deselada ✨';
    
    hooks.log?.(`⚒️ O Blacksmith of Mammon removeu o selo ancestral de **${armorItem.name}**! O conjunto liberou seu potencial total!`, 'gain');
    hooks.onUpdate?.();
    return { success: true, armor: inventoryItem };
  }

  /** Troca apenas armas A/S sem investimentos, preservando UID e vínculo de equipamento. */
  static exchangeWeapon(state, weaponUid, targetItemId, hooks = {}) {
    const access = this.canAccessExclusiveBlacksmith(state);
    if (!access.allowed) return { success: false, reason: 'access_denied', message: access.message };
    const inventory = Array.isArray(state.inventory) ? state.inventory : [];
    const index = inventory.findIndex(item => item?.uid === weaponUid || item?.id === weaponUid);
    if (index < 0) return { success: false, reason: 'weapon_not_owned', message: 'A arma escolhida não está na mochila.' };
    const weapon = inventory[index];
    const sourceDef = ALL_ITEMS[weapon.itemId || weapon.id];
    const targetDef = ALL_ITEMS[targetItemId];
    if ((sourceDef?.slot || weapon.slot) !== 'weapon' || !targetDef || targetDef.slot !== 'weapon') {
      return { success: false, reason: 'invalid_weapon', message: 'Escolha armas válidas.' };
    }
    const sourceGrade = getItemGradeCode({ ...sourceDef, ...weapon });
    const targetGrade = getItemGradeCode(targetDef);
    if (!['a', 's'].includes(sourceGrade) || sourceGrade !== targetGrade) {
      return { success: false, reason: 'grade_mismatch', message: 'A troca exige outra arma da mesma graduação A ou S.' };
    }
    if (weapon.itemId === targetDef.id || weapon.id === targetDef.id) {
      return { success: false, reason: 'same_weapon', message: 'Escolha uma arma diferente.' };
    }
    const instanceOnlyKeys = new Set(['uid', 'itemId', 'count', 'equipped', 'isEquipped', 'locked', 'favorite']);
    const hasUnknownInstanceData = Object.keys(weapon).some(key =>
      !instanceOnlyKeys.has(key) && !Object.hasOwn(sourceDef || {}, key)
    );
    const invested = hasUnknownInstanceData || Number(weapon.enchant || 0) > 0 || Boolean(
      weapon.soulCrystal || weapon.augmentation || weapon.augment || weapon.foundation ||
      weapon.elementalAttribute || weapon.attribute || weapon.affixes?.length || weapon.randomStats
    );
    if (invested) return { success: false, reason: 'weapon_has_investments', message: 'Remova ou preserve os aprimoramentos antes de trocar esta arma.' };
    const ss = this.ensureState(state);
    const cost = 25000;
    if (ss.ancientAdena < cost) return { success: false, reason: 'insufficient_aa', message: 'Ancient Adena insuficiente. Requer 25.000 AA.' };

    const uid = weapon.uid;
    const count = weapon.count;
    inventory[index] = { ...targetDef, itemId: targetDef.id, ...(uid ? { uid } : {}), ...(count !== undefined ? { count } : {}) };
    ss.ancientAdena -= cost;
    hooks.log?.(`⚒️ Blacksmith of Mammon trocou a arma por **${targetDef.name}**.`, 'gain');
    hooks.onUpdate?.();
    return { success: true, weapon: inventory[index] };
  }

  /** Infusão direta de SA nível 13 por Ancient Adena, conforme serviço local de Mammon. */
  static infuseMammonSoulCrystal(state, weaponUid, saKey, hooks = {}) {
    const access = this.canAccessExclusiveBlacksmith(state);
    if (!access.allowed) return { success: false, reason: 'access_denied', message: access.message };
    const equippedUid = state.equipment?.weapon;
    const resolvedUid = typeof equippedUid === 'object' ? equippedUid.uid || equippedUid.id : equippedUid;
    if (!resolvedUid || resolvedUid !== weaponUid) {
      return { success: false, reason: 'weapon_not_equipped', message: 'Equipe a arma que receberá a SA.' };
    }
    const weapon = (state.inventory || []).find(item => item?.uid === weaponUid || item?.id === weaponUid);
    const definition = weapon && ALL_ITEMS[weapon.itemId || weapon.id];
    if (!weapon || (definition?.slot || weapon.slot) !== 'weapon') {
      return { success: false, reason: 'invalid_weapon', message: 'A arma equipada não foi encontrada.' };
    }
    if (weapon.soulCrystal) return { success: false, reason: 'sa_exists', message: 'Remova a SA atual antes de infundir outra.' };
    const choices = {
      focus: SA_RUNES.red.focus,
      acumen: SA_RUNES.green.acumen,
      haste: { key: 'haste', name: 'Haste', stat: 'atkSpd', baseVal: 0.15, desc: 'Reduz o tempo de recarga das habilidades' }
    };
    const rune = choices[saKey];
    if (!rune) return { success: false, reason: 'invalid_sa', message: 'Escolha Focus, Haste ou Acumen.' };
    const ss = this.ensureState(state);
    const cost = 100000;
    if (ss.ancientAdena < cost) return { success: false, reason: 'insufficient_aa', message: 'Ancient Adena insuficiente. Requer 100.000 AA.' };
    const level = 13;
    const scale = 0.5 + level * 0.05;
    const value = rune.baseVal > 1 ? Math.round(rune.baseVal * scale) : Number((rune.baseVal * scale).toFixed(3));
    weapon.soulCrystal = {
      color: saKey === 'focus' ? 'red' : 'green', key: saKey, name: rune.name, level,
      desc: `${rune.desc} (+${value < 1 ? `${Math.round(value * 100)}%` : value})`, stat: rune.stat, val: value
    };
    ss.ancientAdena -= cost;
    hooks.log?.(`🔮 Blacksmith of Mammon infundiu **${rune.name} Lv. 13** em ${weapon.name || definition.name}.`, 'gain');
    hooks.onUpdate?.();
    return { success: true, weapon, soulCrystal: weapon.soulCrystal };
  }

  /**
   * Gatekeeper de Acesso ao Ferreiro / Mercador Oculto dos Selos.
   * Regra: Apenas a facção vencedora ganha acesso durante o período de validação dos selos.
   * @param {Object} state
   * @returns {{ allowed: boolean, message: string }}
   */
  static canAccessExclusiveBlacksmith(state) {
    const ss = this.ensureState(state);
    const phase = ss.phase || 'seal_validation'; // 'competition' | 'seal_validation'
    const winner = ss.winnerFaction || (ss.dawnScore >= ss.duskScore ? 'dawn' : 'dusk');

    if (phase === 'competition') {
      return {
        allowed: false,
        message: 'O Ferreiro dos Selos está em transe sagrado durante o período de competição das Seven Signs.'
      };
    }

    if (!ss.faction) {
      return {
        allowed: false,
        message: 'Acesso Negado: Você não jurou fidelidade a nenhuma facção das Seven Signs.'
      };
    }

    if (ss.faction !== winner) {
      return {
        allowed: false,
        message: `Acesso Restrito: Apenas membros da facção vitoriosa [${winner.toUpperCase()}] têm a bênção do Ferreiro Oculto de Mammon nesta semana.`
      };
    }

    return {
      allowed: true,
      message: `Acesso Concedido: Bem-vindo à Forja Oculta de Mammon, nobre campeão de [${winner.toUpperCase()}].`
    };
  }

  /**
   * Resolução do Ciclo Semanal das Seven Signs (Cron/Loop de Servidor).
   * @param {Object} state
   * @param {'dawn'|'dusk'|'tie'|null} overrideWinner
   * @returns {Object}
   */
  static resolveWeeklyCycle(state, overrideWinner = null, now = Date.now()) {
    const ss = this.ensureState(state);
    ss.cycleNumber = (ss.cycleNumber || 1);
    const transitionAt = Number.isFinite(Number(now)) ? Number(now) : Date.now();

    if (ss.phase === 'competition' || !ss.phase) {
      let winner = ['dawn', 'dusk', 'tie'].includes(overrideWinner) ? overrideWinner : null;
      if (!winner) {
        winner = ss.dawnScore > ss.duskScore ? 'dawn' : ss.duskScore > ss.dawnScore ? 'dusk' : 'tie';
      }
      ss.phase = 'seal_validation';
      ss.winnerFaction = winner;
      ss.cycleEndsAt = transitionAt + SEVEN_SIGNS_PHASE_MS;
    } else {
      ss.cycleNumber += 1;
      ss.phase = 'competition';
      ss.winnerFaction = null;
      ss.dawnScore = 250000;
      ss.duskScore = 240000;
      ss.cycleEndsAt = transitionAt + SEVEN_SIGNS_PHASE_MS;
    }

    return ss;
  }

  /** Inicializa e avança períodos vencidos no tick normal, inclusive após retorno offline. */
  static advanceWeeklyCycle(state, now = Date.now()) {
    const ss = this.ensureState(state);
    const timestamp = Number.isFinite(Number(now)) ? Number(now) : Date.now();
    if (!['competition', 'seal_validation'].includes(ss.phase)) {
      ss.phase = ss.winnerFaction ? 'seal_validation' : 'competition';
    }
    if (!Number.isSafeInteger(Number(ss.cycleNumber)) || Number(ss.cycleNumber) < 1) ss.cycleNumber = 1;
    else ss.cycleNumber = Number(ss.cycleNumber);
    if (!Number.isFinite(Number(ss.cycleEndsAt)) || Number(ss.cycleEndsAt) <= 0) {
      ss.cycleEndsAt = timestamp + SEVEN_SIGNS_PHASE_MS;
      return { initialized: true, transitions: [], phase: ss.phase, cycleEndsAt: ss.cycleEndsAt };
    }

    const transitions = [];
    // 20 anos de atraso ainda são processáveis; evita laço sem limite em saves corrompidos.
    while (timestamp >= Number(ss.cycleEndsAt) && transitions.length < 1040) {
      const boundary = Number(ss.cycleEndsAt);
      const previousPhase = ss.phase;
      this.resolveWeeklyCycle(state, null, boundary);
      transitions.push({ from: previousPhase, to: ss.phase, winnerFaction: ss.winnerFaction, at: boundary });
    }
    return { initialized: false, transitions, phase: ss.phase, cycleEndsAt: ss.cycleEndsAt };
  }

  /**
   * Cálculo de Penalidade de Morte no Mundo Aberto (Open World Death Penalty).
   * - Inocente: Perde 4% de EXP e 2% chance de drop de item da mochila.
   * - PK / Assassino (Karma > 0): Perde 10% de EXP e 60% chance de drop de item valioso.
   * @param {Object} state
   * @param {Object} hooks
   * @returns {{ expLost: number, droppedItem: Object|null }}
   */
  static applyDeathPenalty(state, hooks = {}) {
    const karma = state.karma || 0;
    const isPk = karma > 0;
    const currentXp = state.xp || 0;
    
    // Perda de EXP
    const expLossRate = isPk ? 0.10 : 0.04;
    const expLost = Math.floor(currentXp * expLossRate);
    state.xp = Math.max(0, currentXp - expLost);

    // Chance de Drop de Item
    let droppedItem = null;
    const dropChance = isPk ? 0.60 : 0.02;
    const inv = state.inventory || [];

    if (Math.random() <= dropChance && inv.length > 0) {
      // Prioriza itens não equipados
      const eligibleIndices = [];
      inv.forEach((item, index) => {
        if (!item.isEquipped || isPk) eligibleIndices.push(index);
      });

      if (eligibleIndices.length > 0) {
        const pickedIndex = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
        droppedItem = inv.splice(pickedIndex, 1)[0];
      }
    }

    hooks.log?.(
      `💀 **PENALIDADE DE MORTE:** Você perdeu -${expLost.toLocaleString()} EXP! ${droppedItem ? `💥 Um item [${droppedItem.name || droppedItem.id}] caiu no chão!` : ''}`,
      'danger'
    );
    hooks.onUpdate?.();

    return { expLost, droppedItem };
  }
}
