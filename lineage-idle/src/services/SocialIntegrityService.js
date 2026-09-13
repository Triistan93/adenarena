/**
 * SocialIntegrityService.js — Camada de Integridade Social do Aden Arena
 * Versão do motor lineage-idle, consumindo window.FirebaseBridge.
 */

export class SocialIntegrityService {
  static async addFriend(myCharId, targetName) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.addFriend) {
      return await window.FirebaseBridge.addFriend(myCharId, targetName);
    }
    throw new Error('Serviço social offline.');
  }

  static async removeFriend(myCharId, targetCharId) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.removeFriend) {
      return await window.FirebaseBridge.removeFriend(myCharId, targetCharId);
    }
    return false;
  }

  static async getFriends(myCharId) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.getFriends) {
      return await window.FirebaseBridge.getFriends(myCharId);
    }
    return [];
  }

  static async bindMentorship(apprenticeCharId, apprenticeLevel, mentorName) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.bindMentorship) {
      return await window.FirebaseBridge.bindMentorship(apprenticeCharId, apprenticeLevel, mentorName);
    }
    throw new Error('Serviço de mentoria offline.');
  }

  static async blockPlayer(myCharId, myOwnerUid, targetName) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.blockPlayer) {
      return await window.FirebaseBridge.blockPlayer(myCharId, myOwnerUid, targetName);
    }
    throw new Error('Serviço de bloqueio offline.');
  }

  static async unblockPlayer(myCharId, blockedName) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.unblockPlayer) {
      return await window.FirebaseBridge.unblockPlayer(myCharId, blockedName);
    }
    return false;
  }

  static async getBlocked(myCharId) {
    if (typeof window !== 'undefined' && window.FirebaseBridge?.getBlocked) {
      return await window.FirebaseBridge.getBlocked(myCharId);
    }
    return [];
  }
}
