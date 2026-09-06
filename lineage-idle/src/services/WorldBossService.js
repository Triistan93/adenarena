/**
 * WorldBossService.js — Sistema de Eventos Globais Programados & Incursões de World Boss
 * 
 * Cronograma sincronizado com relógio UTC:
 * - Janelas a cada 3 horas (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00 UTC).
 * - Duração da Invasão: 45 minutos por ciclo.
 * - Rotação Canônica:
 *   1. Queen Ant dos Ermos (Lv. 45)
 *   2. Capitão Pirata Zaken (Lv. 65)
 *   3. Imperador Baium da Torre (Lv. 75)
 *   4. Dragão da Terra Antharas (Lv. 95)
 *   5. Dragão do Fogo Valakas (Lv. 100)
 */

export const WORLD_BOSS_CATALOG = {
  queen_ant_world: {
    id: 'queen_ant_world',
    name: 'Queen Ant 👑',
    title: 'Rainha dos Ermos de Gludio',
    lvl: 45,
    hp: 850000,
    maxHp: 850000,
    atk: 450,
    def: 180,
    mdef: 220,
    eva: 20,
    crit: 15,
    xpReward: 350000,
    spReward: 15000,
    goldReward: 500000,
    adenCoinsReward: 25,
    icon: 'gradespecial/jewels/jewel_ring_queen_ant.png',
    bg: 'dungeon_wastelands',
    lore: 'A rainha das formigas gigantes emergiu dos abismos dos Ermos de Gludio. Seus feromônios ácidos corroem as armaduras mais resistentes.',
    drops: [
      { itemId: 'jewel_ring_queen_ant', name: 'Ring of Queen Ant', chance: 0.35, isEpicJewel: true },
      { itemId: 'book_4star', name: 'Tomo Sagrado: 4★ (Divino)', chance: 0.20 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll Enchant Weapon', count: 3, chance: 0.60 },
      { itemId: 'adena_coins', count: 25, name: '25x Aden Coins (AC)', chance: 1.0 }
    ]
  },
  zaken_world: {
    id: 'zaken_world',
    name: 'Capitão Pirata Zaken ⚓',
    title: 'O Flagelo Imortal da Ilha do Diabo',
    lvl: 65,
    hp: 1850000,
    maxHp: 1850000,
    atk: 850,
    def: 380,
    mdef: 420,
    eva: 30,
    crit: 22,
    xpReward: 950000,
    spReward: 35000,
    goldReward: 1200000,
    adenCoinsReward: 35,
    icon: 'gradespecial/jewels/jewel_earring_zaken.png',
    bg: 'pirates_ship',
    lore: 'Amaldiçoado pela eternidade em seu galeão fantasma, Zaken drena a força vital de todos os mortais que ousam pisar em seus conveses.',
    drops: [
      { itemId: 'jewel_earring_zaken', name: 'Zaken\'s Earring', chance: 0.35, isEpicJewel: true },
      { itemId: 'book_4star', name: 'Tomo Sagrado: 4★ (Divino)', chance: 0.30 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll Enchant Weapon', count: 5, chance: 0.70 },
      { itemId: 'adena_coins', count: 35, name: '35x Aden Coins (AC)', chance: 1.0 }
    ]
  },
  baium_world: {
    id: 'baium_world',
    name: 'Imperador Baium ⚡',
    title: 'O Tirano Aprisionado de Insolence',
    lvl: 75,
    hp: 3500000,
    maxHp: 3500000,
    atk: 1650,
    def: 720,
    mdef: 810,
    eva: 40,
    crit: 28,
    xpReward: 2500000,
    spReward: 80000,
    goldReward: 2500000,
    adenCoinsReward: 50,
    icon: 'gradespecial/jewels/jewel_ring_baium.png',
    bg: 'tower_peak',
    lore: 'O imperador que desafiou os deuses ao erguer a Torre da Insolência. Seus punhos trovejantes e raios arcanos pulverizam exércitos inteiros.',
    drops: [
      { itemId: 'jewel_ring_baium', name: 'Ring of Baium', chance: 0.35, isEpicJewel: true },
      { itemId: 'book_4star', name: 'Tomo Sagrado: 4★ (Divino)', chance: 0.40 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll Enchant Weapon', count: 8, chance: 0.80 },
      { itemId: 'adena_coins', count: 50, name: '50x Aden Coins (AC)', chance: 1.0 }
    ]
  },
  antharas_world: {
    id: 'antharas_world',
    name: 'Dragão Antharas 🐉',
    title: 'O Soberano Dragão da Terra',
    lvl: 95,
    hp: 8500000,
    maxHp: 8500000,
    atk: 3200,
    def: 1450,
    mdef: 1650,
    eva: 50,
    crit: 35,
    xpReward: 8000000,
    spReward: 250000,
    goldReward: 6000000,
    adenCoinsReward: 75,
    icon: 'gradespecial/jewels/jewel_earring_antharas.png',
    bg: 'antharas_lair',
    lore: 'Cria colossal da Deusa Shilen. Quando Antharas desperta de seu sono milenar em Giran, a própria terra estremece e rochas colossais caem dos céus.',
    drops: [
      { itemId: 'jewel_earring_antharas', name: 'Earring of Antharas', chance: 0.35, isEpicJewel: true },
      { itemId: 'book_4star', name: 'Tomo Sagrado: 4★ (Divino)', chance: 0.60 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll Enchant Weapon', count: 12, chance: 0.90 },
      { itemId: 'adena_coins', count: 75, name: '75x Aden Coins (AC)', chance: 1.0 }
    ]
  },
  valakas_world: {
    id: 'valakas_world',
    name: 'Dragão Valakas 🌋',
    title: 'O Senhor Supremo do Fogo & Vulcão',
    lvl: 100,
    hp: 12500000,
    maxHp: 12500000,
    atk: 4800,
    def: 2100,
    mdef: 2400,
    eva: 60,
    crit: 40,
    xpReward: 15000000,
    spReward: 500000,
    goldReward: 10000000,
    adenCoinsReward: 100,
    icon: 'gradespecial/jewels/jewel_necklace_valakas.png',
    bg: 'valakas_volcano',
    lore: 'O mais temido dos dragões de Shilen, habitante das profundezas magmáticas da Forja dos Deuses. Seu sopro de chamas apaga civilizações.',
    drops: [
      { itemId: 'jewel_necklace_valakas', name: 'Necklace of Valakas', chance: 0.35, isEpicJewel: true },
      { itemId: 'book_4star', name: 'Tomo Sagrado: 4★ (Divino)', chance: 0.75 },
      { itemId: 'scroll_blessed_weapon', name: 'Blessed Scroll Enchant Weapon', count: 15, chance: 1.0 },
      { itemId: 'adena_coins', count: 100, name: '100x Aden Coins (AC)', chance: 1.0 }
    ]
  }
};

const BOSS_KEYS = ['queen_ant_world', 'zaken_world', 'baium_world', 'antharas_world', 'valakas_world'];
const CYCLE_MS = 3 * 60 * 60 * 1000; // 3 horas por ciclo
const ACTIVE_DURATION_MS = 45 * 60 * 1000; // 45 minutos ativo

export const WorldBossService = {
  /**
   * Retorna o status do World Boss atual e cronograma
   */
  getStatus() {
    const now = Date.now();
    const cycleIndex = Math.floor(now / CYCLE_MS);
    const cycleStart = cycleIndex * CYCLE_MS;
    const elapsedInCycle = now - cycleStart;

    const bossIndex = cycleIndex % BOSS_KEYS.length;
    const nextBossIndex = (cycleIndex + 1) % BOSS_KEYS.length;

    const activeBossKey = BOSS_KEYS[bossIndex];
    const nextBossKey = BOSS_KEYS[nextBossIndex];

    const currentBoss = WORLD_BOSS_CATALOG[activeBossKey];
    const nextBoss = WORLD_BOSS_CATALOG[nextBossKey];

    const isActive = elapsedInCycle < ACTIVE_DURATION_MS;
    const msLeftActive = isActive ? (ACTIVE_DURATION_MS - elapsedInCycle) : 0;
    const msUntilNext = isActive ? (CYCLE_MS - elapsedInCycle) : (CYCLE_MS - elapsedInCycle);

    const fmt = (ms) => {
      const s = Math.floor(ms / 1000) % 60;
      const m = Math.floor(ms / (1000 * 60)) % 60;
      const h = Math.floor(ms / (1000 * 60 * 60));
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return {
      currentBoss,
      nextBoss,
      isActive,
      msLeftActive,
      msUntilNext,
      timeFormatted: isActive ? fmt(msLeftActive) : fmt(msUntilNext)
    };
  },

  /**
   * Engaja o combate de Incursão Global contra o World Boss
   */
  joinWorldBoss(state, callbacks = {}) {
    const { log = console.log, floatText = () => {}, renderStageMonster = () => {}, attackMonster = () => {}, save = () => {} } = callbacks;
    if (!state) return { success: false };

    const status = this.getStatus();
    if (!status.isActive) {
      log(`⚠️ Nenhum World Boss ativo no momento. Próximo despertar em ${status.timeFormatted}.`, 'warning');
      return { success: false, reason: 'not_active' };
    }

    const bossDef = status.currentBoss;

    // Constrói monstro ativo de World Boss com mecânicas globais
    state.activeMonster = {
      id: bossDef.id,
      name: bossDef.name,
      title: bossDef.title,
      lvl: bossDef.lvl,
      hp: bossDef.hp,
      maxHp: bossDef.maxHp,
      atk: bossDef.atk,
      def: bossDef.def,
      mdef: bossDef.mdef,
      eva: bossDef.eva,
      crit: bossDef.crit,
      boss: true,
      isWorldBoss: true,
      bg: bossDef.bg,
      worldBossDrops: bossDef.drops,
      xpReward: bossDef.xpReward,
      spReward: bossDef.spReward,
      goldReward: bossDef.goldReward,
      adenCoinsReward: bossDef.adenCoinsReward
    };

    log(`🚨 **[INCURSÃO GLOBAL]** Você entrou no covil de **${bossDef.name}**! Prepare-se para a batalha monumental!`, 'rarity-legendary');
    floatText(`⚡ INCURSÃO: ${bossDef.name.toUpperCase()}!`, 'float-jackpot');

    renderStageMonster(state);
    if (typeof attackMonster === 'function') attackMonster();
    save();

    return { success: true, boss: bossDef };
  },

  /**
   * Processa recompensas épicas após derrota do World Boss
   */
  processWorldBossDefeat(state, callbacks = {}) {
    const { log = console.log, floatText = () => {}, addToInventory = () => {} } = callbacks;
    const m = state.activeMonster;
    if (!m || !m.isWorldBoss) return;

    const gold = m.goldReward || 1000000;
    const ac = m.adenCoinsReward || 50;

    state.gold = (state.gold || 0) + gold;
    state.adenCoins = (state.adenCoins || 0) + ac;

    log(`👑 **[VITÓRIA GLOBAL]** O terrível World Boss **${m.name}** foi derrotado! Você recebeu ${gold.toLocaleString()} Adena e ${ac} Aden Coins!`, 'rarity-legendary');
    floatText('🏆 WORLD BOSS DERROTADO!', 'float-jackpot');

    // Distribuição de drops
    if (m.worldBossDrops && Array.isArray(m.worldBossDrops)) {
      for (const drop of m.worldBossDrops) {
        if (Math.random() <= drop.chance) {
          state.inventory = state.inventory || [];
          state.inventory.push({
            uid: 'wb_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            itemId: drop.itemId,
            name: drop.name,
            count: drop.count || 1,
            rarity: drop.isEpicJewel ? 'legendary' : 'epic'
          });
          log(`✨ **[DROP ÉPICO]** Você conquistou: **${drop.name}**!`, 'rarity-legendary');
        }
      }
    }
  }
};
