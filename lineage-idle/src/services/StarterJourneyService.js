/**
 * StarterJourneyService.js — Jornada dos Pioneiros de Aden (Onboarding & 7-Step Progression)
 * 
 * Guia passo a passo para iniciantes com recompensas progressivas para garantir retenção e engajamento nos primeiros 7 marcos.
 */

export const STARTER_JOURNEY_STEPS = [
  {
    id: 'step_1_first_blood',
    stepNumber: 1,
    title: 'Primeiro Sangue em Aden',
    desc: 'Derrote pelo menos 10 monstros nas zonas de caça.',
    icon: '⚔️',
    targetCount: 10,
    checkProgress: (state) => Math.min(10, state.stats?.monstersKilled || state.monstersKilled || 0),
    rewardText: '25.000 Adena + 500x Soulshots No-Grade',
    reward: { adena: 25000, itemId: 'soulshot_ng', qty: 500 }
  },
  {
    id: 'step_2_reach_lvl20',
    stepNumber: 2,
    title: 'O Despertar do Guerreiro',
    desc: 'Alcance o Nível 20 e conquiste sua 1ª Mudança de Classe.',
    icon: '⭐',
    targetCount: 20,
    checkProgress: (state) => Math.min(20, state.level || 1),
    rewardText: '50.000 Adena + 5x Scrolls Enchant Weapon (D)',
    reward: { adena: 50000, itemId: 'scrl_enchant_wp_d', qty: 5 }
  },
  {
    id: 'step_3_first_forge',
    stepNumber: 3,
    title: 'Fogo na Forja Imperial',
    desc: 'Realize seu 1º Encantamento ou Fusão de Equipamento na Forja.',
    icon: '🔨',
    targetCount: 1,
    checkProgress: (state) => {
      const enchants = state.stats?.enchantsAttempted || 0;
      const fusions = state.stats?.fusionsAttempted || 0;
      const hasEnchantedWeapon = Boolean(state.equipment?.weapon && (state.inventory?.find(i => i.uid === state.equipment.weapon)?.enchantLevel > 0));
      return (enchants > 0 || fusions > 0 || hasEnchantedWeapon) ? 1 : 0;
    },
    rewardText: '1x Life Stone (Mid-Grade) + 50.000 Adena',
    reward: { adena: 50000, itemId: 'ls_mid_76', qty: 1 }
  },
  {
    id: 'step_4_skill_mastery',
    stepNumber: 4,
    title: 'Mestria Arcana & Lâmina',
    desc: 'Evolua pelo menos uma habilidade ao nível 2 ou superior.',
    icon: '⚡',
    targetCount: 1,
    checkProgress: (state) => {
      const skills = state.skills || {};
      const hasLvl2 = Object.values(skills).some(s => (typeof s === 'number' ? s : s?.level || 0) >= 2);
      return hasLvl2 ? 1 : 0;
    },
    rewardText: '2.500 Pontos de SP + 100x Poções de Mana XL',
    reward: { sp: 2500, itemId: 'mp_potion_xl', qty: 100 }
  },
  {
    id: 'step_5_raid_boss',
    stepNumber: 5,
    title: 'Audácia Contra os Titãs',
    desc: 'Enfrente qualquer Chefe de Raid nos portais de caça de Aden.',
    icon: '👹',
    targetCount: 1,
    checkProgress: (state) => {
      const clears = Object.keys(state.dailyRaidClears || {}).length;
      const raids = state.stats?.raidsAttempted || 0;
      return (clears > 0 || raids > 0) ? 1 : 0;
    },
    rewardText: '100.000 Adena + 2x Ingressos de Raid Extras',
    reward: { adena: 100000, raidTickets: 2 }
  },
  {
    id: 'step_6_clan_brotherhood',
    stepNumber: 6,
    title: 'Irmandade de Armas',
    desc: 'Participe do Clã, realize uma doação ou visite o Clan Hall.',
    icon: '🛡️',
    targetCount: 1,
    checkProgress: (state) => {
      const clan = state.clan;
      const hasDonation = (clan?.donationsAdena || 0) > 0 || (clan?.donationsSp || 0) > 0;
      const hasCustomName = Boolean(clan?.name && clan.name !== 'Os Guardiões de Aden');
      const hasReputation = (clan?.reputation || 0) > 100;
      return (hasDonation || hasCustomName || hasReputation) ? 1 : 0;
    },
    rewardText: '100 Reputação de Clã + 100.000 Adena',
    reward: { adena: 100000, clanRep: 100 }
  },
  {
    id: 'step_7_arena_glory',
    stepNumber: 7,
    title: 'A Glória da Arena',
    desc: 'Dispute uma partida de Duelo no Coliseu ou nas Olimpíadas.',
    icon: '👑',
    targetCount: 1,
    checkProgress: (state) => {
      const oly = (state.olympiad?.wins || 0) + (state.olympiad?.losses || 0);
      const col = (state.colosseum?.duelWins || 0) + (state.colosseum?.duelLosses || 0);
      return (oly > 0 || col > 0) ? 1 : 0;
    },
    rewardText: '100 Aden Coins + Título: Pioneiro de Aden',
    reward: { adenCoins: 100, cosmeticTitle: 'Pioneiro de Aden' }
  }
];

export const StarterJourneyService = {
  getJourneyStatus(state) {
    if (!state) return { steps: [], completedCount: 0, claimedCount: 0 };
    state.starterJourney = state.starterJourney || { claimedSteps: [] };

    let completedCount = 0;
    let claimedCount = 0;

    const steps = STARTER_JOURNEY_STEPS.map(step => {
      const current = step.checkProgress(state);
      const isCompleted = current >= step.targetCount;
      const isClaimed = (state.starterJourney.claimedSteps || []).includes(step.id);
      const canClaim = isCompleted && !isClaimed;

      if (isCompleted) completedCount++;
      if (isClaimed) claimedCount++;

      return {
        ...step,
        currentProgress: current,
        isCompleted,
        isClaimed,
        canClaim
      };
    });

    return {
      steps,
      completedCount,
      claimedCount,
      allClaimed: claimedCount >= STARTER_JOURNEY_STEPS.length,
      currentActiveStep: steps.find(s => !s.isClaimed) || null
    };
  },

  claimStepReward(state, stepId, callbacks = {}) {
    const { log = console.log, floatText = () => {}, onUpdate = () => {} } = callbacks;
    if (!state) return { success: false };

    state.starterJourney = state.starterJourney || { claimedSteps: [] };
    const step = STARTER_JOURNEY_STEPS.find(s => s.id === stepId);
    if (!step) return { success: false, reason: 'invalid_step' };

    if ((state.starterJourney.claimedSteps || []).includes(stepId)) {
      log('Este marco da Jornada dos Pioneiros já foi resgatado.', 'warning');
      return { success: false, reason: 'already_claimed' };
    }

    const current = step.checkProgress(state);
    if (current < step.targetCount) {
      log(`Marco ainda incompleto: ${step.title} (${current}/${step.targetCount}).`, 'error');
      return { success: false, reason: 'incomplete' };
    }

    // Aplicar recompensas
    state.starterJourney.claimedSteps.push(stepId);
    const rew = step.reward;

    if (rew.adena) state.gold = (state.gold || 0) + rew.adena;
    if (rew.sp) state.sp = (state.sp || 0) + rew.sp;
    if (rew.adenCoins) state.adenCoins = (state.adenCoins || 0) + rew.adenCoins;
    if (rew.raidTickets) state.dailyRaidTickets = (state.dailyRaidTickets || 3) + rew.raidTickets;
    if (rew.clanRep && state.clan) state.clan.reputation = (state.clan.reputation || 100) + rew.clanRep;
    if (rew.cosmeticTitle) {
      state.cosmetics = state.cosmetics || {};
      state.cosmetics.unlockedTitles = state.cosmetics.unlockedTitles || ['Novato de Aden'];
      if (!state.cosmetics.unlockedTitles.includes(rew.cosmeticTitle)) {
        state.cosmetics.unlockedTitles.push(rew.cosmeticTitle);
      }
    }
    if (rew.itemId && rew.qty) {
      state.inventory = state.inventory || [];
      state.inventory.push({
        uid: 'sj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        itemId: rew.itemId,
        name: rew.itemId.toUpperCase(),
        qty: rew.qty,
        type: 'consumable'
      });
    }

    log(`🎉 **[Jornada dos Pioneiros - Passo ${step.stepNumber}]** Você concluiu '${step.title}'! Recompensa: ${step.rewardText}!`, 'rarity-legendary');
    floatText('✨ MARCO CONCLUÍDO!', 'float-jackpot');

    onUpdate();
    return { success: true, step };
  }
};
