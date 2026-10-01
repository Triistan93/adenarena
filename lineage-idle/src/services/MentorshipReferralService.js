import { addToInventory } from './InventoryService.js';

export class MentorshipReferralService {
  static async bindStarterMentorship(state, mentorName, bridge = (typeof window !== 'undefined' ? window.FirebaseBridge : null)) {
    const cleanName = String(mentorName || '').trim();
    if (!state || !cleanName || cleanName.length > 20) {
      return { success: false, reason: 'invalid_input', message: 'Informe um nome de mentor válido.' };
    }
    if ((Number(state.level) || 1) > 20) {
      return { success: false, reason: 'level_too_high', message: 'O vínculo de mentor só pode ser feito até o nível 20.' };
    }
    if (state.referredBy || state.referralStarterGranted) {
      return { success: false, reason: 'already_linked', message: 'Este personagem já recebeu o vínculo de mentoria.' };
    }
    const ownerUid = bridge?.getCurrentUserId?.();
    if (!ownerUid || !bridge?.getPlayerByName || !bridge?.bindMentorship || !bridge?.recordReferral) {
      return { success: false, reason: 'service_unavailable', message: 'Entre em uma conta conectada para confirmar a mentoria.' };
    }
    const apprenticeCharId = state.characterId || `char_${String(ownerUid).slice(0, 16)}`;

    let mentor;
    try {
      mentor = await bridge.getPlayerByName(cleanName);
    } catch {
      return { success: false, reason: 'lookup_failed', message: 'Não foi possível verificar o mentor agora.' };
    }
    if (!mentor || mentor.playerType !== 'real') {
      return { success: false, reason: 'real_player_required', message: 'O mentor precisa ser um personagem real registrado.' };
    }
    if (mentor.characterId === apprenticeCharId || mentor.name?.toLowerCase() === (state.name || state.charName || state.heroName || '').trim().toLowerCase()) {
      return { success: false, reason: 'self_mentor', message: 'Você não pode ser seu próprio mentor.' };
    }
    if ((Number(mentor.level) || 0) < 40) {
      return { success: false, reason: 'mentor_level_low', message: 'O mentor precisa ter nível 40 ou superior.' };
    }

    const rewardState = {
      ...state,
      inventory: (Array.isArray(state.inventory) ? state.inventory : []).map(item => ({ ...item }))
    };
    if (!addToInventory(rewardState, 'soulshot_ng', 1000, null, false, {}, true) ||
        !addToInventory(rewardState, 'hp_potion_s', 10, null, false, {}, true)) {
      return { success: false, reason: 'inventory_full', message: 'Libere espaço para receber o pacote de boas-vindas antes de vincular o mentor.' };
    }

    try {
      const mentorship = await bridge.bindMentorship(apprenticeCharId, Number(state.level) || 1, mentor.name);
      if (!mentorship) return { success: false, reason: 'mentorship_rejected', message: 'O servidor não confirmou o vínculo de mentoria.' };
      const referralRecorded = await bridge.recordReferral(mentor.name, state.name || state.charName || state.heroName, Number(state.level) || 1);
      if (referralRecorded !== true) return { success: false, reason: 'referral_record_failed', message: 'O vínculo foi recebido, mas o registro de indicação não confirmou. Tente novamente.' };
    } catch (error) {
      return { success: false, reason: 'cloud_write_failed', message: error?.message || 'Não foi possível confirmar a mentoria no servidor.' };
    }

    state.inventory = rewardState.inventory;
    state.referredBy = mentor.name;
    state.referralStarterGranted = true;
    return { success: true, mentorName: mentor.name };
  }
}
