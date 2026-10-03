import { auth, db } from '../../../src/firebase.ts';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where
} from 'firebase/firestore';

const CLANS = 'clans';
const MEMBERS = 'clan_members';
const NAMES = 'clan_names';

export function normalizeClanName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateClanName(name) {
  const clean = String(name ?? '').trim();
  if (clean.length < 3) return 'name_too_short';
  if (clean.length > 24) return 'name_too_long';
  if (!/^[\p{L}\p{N}][\p{L}\p{N} _'-]*$/u.test(clean)) return 'name_invalid';
  return null;
}

function requireRegisteredUser() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) {
    const error = new Error('Entre com uma conta vinculada para usar clãs online.');
    error.code = 'clan/registered_account_required';
    throw error;
  }
  return user;
}

function cleanOptionalText(value, maxLength) {
  return String(value ?? '').trim().slice(0, maxLength);
}

export class ClanSocialService {
  static async createClan({ name, description = '', recruiting = true, displayName = '' }) {
    const user = requireRegisteredUser();
    const nameError = validateClanName(name);
    if (nameError) {
      const error = new Error('O nome do clã deve ter de 3 a 24 caracteres válidos.');
      error.code = `clan/${nameError}`;
      throw error;
    }

    const nameKey = normalizeClanName(name);
    const clanRef = doc(collection(db, CLANS));
    const nameRef = doc(db, NAMES, nameKey);
    const memberRef = doc(db, MEMBERS, user.uid);
    const cleanName = String(name).trim();

    await runTransaction(db, async transaction => {
      const [nameSnapshot, membershipSnapshot] = await Promise.all([
        transaction.get(nameRef),
        transaction.get(memberRef)
      ]);
      if (nameSnapshot.exists()) {
        const error = new Error('Esse nome de clã já foi escolhido.');
        error.code = 'clan/name_taken';
        throw error;
      }
      if (membershipSnapshot.exists()) {
        const error = new Error('Este jogador já pertence a um clã.');
        error.code = 'clan/already_member';
        throw error;
      }

      transaction.set(clanRef, {
        name: cleanName,
        nameKey,
        description: cleanOptionalText(description, 280),
        leaderUid: user.uid,
        recruitmentOpen: Boolean(recruiting),
        memberCap: 50,
        level: 1,
        allianceId: null,
        territoryIds: [],
        hallLevel: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      transaction.set(nameRef, { clanId: clanRef.id, nameKey, createdBy: user.uid });
      transaction.set(memberRef, {
        uid: user.uid,
        clanId: clanRef.id,
        role: 'leader',
        displayName: cleanOptionalText(displayName || user.displayName || 'Líder', 40),
        joinedAt: serverTimestamp()
      });
    });

    return { clanId: clanRef.id, name: cleanName };
  }

  static async listRecruitingClans(maxItems = 24) {
    requireRegisteredUser();
    const count = Math.max(1, Math.min(40, Math.floor(Number(maxItems) || 24)));
    const snapshot = await getDocs(query(
      collection(db, CLANS),
      where('recruitmentOpen', '==', true),
      limit(count)
    ));
    return snapshot.docs.map(clanDoc => ({ id: clanDoc.id, ...clanDoc.data() }));
  }

  static async joinClan(clanId, displayName = '') {
    const user = requireRegisteredUser();
    const clanRef = doc(db, CLANS, String(clanId));
    const memberRef = doc(db, MEMBERS, user.uid);
    await runTransaction(db, async transaction => {
      const [clanSnapshot, memberSnapshot] = await Promise.all([
        transaction.get(clanRef),
        transaction.get(memberRef)
      ]);
      if (!clanSnapshot.exists() || !clanSnapshot.data().recruitmentOpen) {
        const error = new Error('Este clã não está recrutando no momento.');
        error.code = 'clan/not_recruiting';
        throw error;
      }
      if (memberSnapshot.exists()) {
        const error = new Error('Este jogador já pertence a um clã.');
        error.code = 'clan/already_member';
        throw error;
      }
      transaction.set(memberRef, {
        uid: user.uid,
        clanId: clanRef.id,
        role: 'member',
        displayName: cleanOptionalText(displayName || user.displayName || 'Aventureiro', 40),
        joinedAt: serverTimestamp()
      });
    });
    return { clanId: clanRef.id };
  }

  static async leaveClan() {
    const user = requireRegisteredUser();
    const memberRef = doc(db, MEMBERS, user.uid);
    await runTransaction(db, async transaction => {
      const membership = await transaction.get(memberRef);
      if (!membership.exists()) return;
      if (membership.data().role === 'leader') {
        const error = new Error('A liderança precisa ser transferida antes de sair do clã.');
        error.code = 'clan/leader_transfer_required';
        throw error;
      }
      transaction.delete(memberRef);
    });
  }

  static async updateClanSettings({ clanId, description, recruiting }) {
    const user = requireRegisteredUser();
    const clanRef = doc(db, CLANS, String(clanId));
    await runTransaction(db, async transaction => {
      const clanSnap = await transaction.get(clanRef);
      if (!clanSnap.exists()) {
        const error = new Error('Clã não encontrado.');
        error.code = 'clan/not_found';
        throw error;
      }
      if (clanSnap.data().leaderUid !== user.uid) {
        const error = new Error('Apenas o líder pode alterar as configurações do clã.');
        error.code = 'clan/leader_permission_required';
        throw error;
      }
      transaction.update(clanRef, {
        description: cleanOptionalText(description, 280),
        recruitmentOpen: Boolean(recruiting),
        updatedAt: serverTimestamp()
      });
    });
    return { success: true };
  }

  static async kickMember({ clanId, targetUid }) {
    const user = requireRegisteredUser();
    if (user.uid === targetUid) {
      const error = new Error('O líder não pode expulsar a si mesmo.');
      error.code = 'clan/cannot_kick_self';
      throw error;
    }
    const clanRef = doc(db, CLANS, String(clanId));
    const memberRef = doc(db, MEMBERS, String(targetUid));
    await runTransaction(db, async transaction => {
      const [clanSnap, memberSnap] = await Promise.all([
        transaction.get(clanRef),
        transaction.get(memberRef)
      ]);
      if (!clanSnap.exists() || clanSnap.data().leaderUid !== user.uid) {
        const error = new Error('Apenas o líder pode expulsar integrantes.');
        error.code = 'clan/leader_permission_required';
        throw error;
      }
      if (!memberSnap.exists() || memberSnap.data().clanId !== clanRef.id) {
        const error = new Error('O integrante não pertence a este clã.');
        error.code = 'clan/member_not_found';
        throw error;
      }
      transaction.delete(memberRef);
    });
    return { success: true };
  }

  static async transferLeadership({ clanId, newLeaderUid }) {
    const user = requireRegisteredUser();
    if (user.uid === newLeaderUid) {
      const error = new Error('Você já é o líder do clã.');
      error.code = 'clan/already_leader';
      throw error;
    }
    const clanRef = doc(db, CLANS, String(clanId));
    const oldLeaderMemberRef = doc(db, MEMBERS, user.uid);
    const newLeaderMemberRef = doc(db, MEMBERS, String(newLeaderUid));
    await runTransaction(db, async transaction => {
      const [clanSnap, oldLeaderSnap, newLeaderSnap] = await Promise.all([
        transaction.get(clanRef),
        transaction.get(oldLeaderMemberRef),
        transaction.get(newLeaderMemberRef)
      ]);
      if (!clanSnap.exists() || clanSnap.data().leaderUid !== user.uid) {
        const error = new Error('Apenas o líder pode transferir a liderança.');
        error.code = 'clan/leader_permission_required';
        throw error;
      }
      if (!newLeaderSnap.exists() || newLeaderSnap.data().clanId !== clanRef.id) {
        const error = new Error('O novo líder precisa ser um membro deste clã.');
        error.code = 'clan/member_not_found';
        throw error;
      }
      transaction.update(clanRef, {
        leaderUid: newLeaderUid,
        updatedAt: serverTimestamp()
      });
      transaction.update(oldLeaderMemberRef, { role: 'member' });
      transaction.update(newLeaderMemberRef, { role: 'leader' });
    });
    return { success: true };
  }

  static async getMyClan() {
    const user = requireRegisteredUser();
    const memberSnapshot = await getDoc(doc(db, MEMBERS, user.uid));
    if (!memberSnapshot.exists()) return null;
    const membership = memberSnapshot.data();
    const clanSnapshot = await getDoc(doc(db, CLANS, membership.clanId));
    if (!clanSnapshot.exists()) return null;
    const rosterSnapshot = await getDocs(query(
      collection(db, MEMBERS),
      where('clanId', '==', membership.clanId),
      limit(50)
    ));
    return {
      id: clanSnapshot.id,
      ...clanSnapshot.data(),
      myRole: membership.role,
      members: rosterSnapshot.docs.map(member => member.data())
    };
  }

  static getCollectiveContracts() {
    return [
      {
        id: 'monster_hunt',
        name: 'Frente de Batalha de Aden',
        desc: 'Elimine monstros nas zonas do reino para abastecer a guarnição do clã.',
        target: 200,
        rewardDesc: '+10% EXP de Caça por 24h & +500 Reputação',
        rewardStats: { xpBoost: 0.10 }
      },
      {
        id: 'treasury_donation',
        name: 'Provisões do Estandarte',
        desc: 'Contribua com Adena no tesouro imperial para reforçar o clã.',
        target: 100000,
        rewardDesc: '+10% Drop de Adena por 24h & +500 Reputação',
        rewardStats: { goldBoost: 0.10 }
      },
      {
        id: 'expedition_conquest',
        name: 'Reconhecimento de Fronteira',
        desc: 'Conclua expedições cartográficas para expandir a influência da casa.',
        target: 10,
        rewardDesc: '+500 Reputação & Bênção do Estandarte',
        rewardStats: { pAtkPercent: 0.05, pDefPercent: 0.05 }
      }
    ];
  }
}
