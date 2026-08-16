/**
 * FirebaseGameService.ts — Serviços de Integração do MMORPG Hardcore com Firebase & Firestore.
 *
 * Provê sincronização em tempo real do evento global das Seven Signs,
 * transações atômicas de forja com Item Sinks e controle de nível de forja da conta.
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  runTransaction, 
  serverTimestamp, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';

export interface SevenSignsDoc {
  cycleNumber: number;
  phase: 'COMPETITION' | 'SEAL_VALIDATION';
  winnerFaction: 'DAWN' | 'DUSK' | 'TIE';
  dawnScore: number;
  duskScore: number;
  updatedAt?: any;
}

export interface AccountForgeData {
  forgeLevel: number;
  forgeExp: number;
  isMarketUnlocked: boolean;
}

export class FirebaseGameService {
  /**
   * Ouve em tempo real as atualizações do placar global das Seven Signs no Firestore.
   */
  static subscribeToSevenSigns(callback: (data: SevenSignsDoc | null) => void) {
    const docRef = doc(db, 'world_events', 'seven_signs');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SevenSignsDoc);
      } else {
        callback(null);
      }
    }, (error) => {
      console.warn('Erro ao escutar Seven Signs no Firestore:', error);
      callback(null);
    });
  }

  /**
   * Carrega os dados de Forja da Conta do Firestore.
   */
  static async getAccountForgeData(accountId: string): Promise<AccountForgeData> {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      const snap = await getDoc(accountRef);
      if (snap.exists()) {
        const data = snap.data();
        const forgeLevel = Number(data.forgeLevel) || 1;
        return {
          forgeLevel,
          forgeExp: Number(data.forgeExp) || 0,
          isMarketUnlocked: forgeLevel >= 10
        };
      }
    } catch (e) {
      console.warn('Falha ao carregar conta no Firestore:', e);
    }
    return { forgeLevel: 1, forgeExp: 0, isMarketUnlocked: false };
  }

  /**
   * Envia contribuição de Seal Stones para o Firestore de forma atômica.
   */
  static async submitSealStones(
    faction: 'dawn' | 'dusk',
    scorePoints: number
  ): Promise<boolean> {
    try {
      const eventRef = doc(db, 'world_events', 'seven_signs');
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(eventRef);
        if (!snap.exists()) {
          transaction.set(eventRef, {
            cycleNumber: 1,
            phase: 'COMPETITION',
            winnerFaction: 'TIE',
            dawnScore: faction === 'dawn' ? scorePoints : 0,
            duskScore: faction === 'dusk' ? scorePoints : 0,
            updatedAt: serverTimestamp()
          });
        } else {
          const field = faction === 'dawn' ? 'dawnScore' : 'duskScore';
          transaction.update(eventRef, {
            [field]: increment(scorePoints),
            updatedAt: serverTimestamp()
          });
        }
      });
      return true;
    } catch (e) {
      console.error('Erro na transação de Seven Signs:', e);
      return false;
    }
  }

  /**
   * Executa a transação de Item Sink Massivo no Firestore.
   */
  static async executeFirestoreForgeSink(
    accountId: string,
    characterId: string,
    targetTemplateId: string,
    sacrificedItemCount: number
  ): Promise<{ success: boolean; expGained: number; error?: string }> {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      const expGained = sacrificedItemCount * 15;

      await runTransaction(db, async (transaction) => {
        const accountSnap = await transaction.get(accountRef);
        if (!accountSnap.exists()) {
          transaction.set(accountRef, {
            forgeLevel: 1,
            forgeExp: expGained,
            isMarketUnlocked: false,
            updatedAt: serverTimestamp()
          });
        } else {
          const currentExp = Number(accountSnap.data()?.forgeExp || 0) + expGained;
          const currentLevel = Number(accountSnap.data()?.forgeLevel || 1);
          const nextLevelExp = currentLevel * 250;
          
          let newLevel = currentLevel;
          let remainingExp = currentExp;
          if (remainingExp >= nextLevelExp) {
            newLevel += 1;
            remainingExp -= nextLevelExp;
          }

          transaction.update(accountRef, {
            forgeLevel: newLevel,
            forgeExp: remainingExp,
            isMarketUnlocked: newLevel >= 10,
            updatedAt: serverTimestamp()
          });
        }
      });

      return { success: true, expGained };
    } catch (e: any) {
      console.error('Erro ao executar Forja no Firestore:', e);
      return { success: false, expGained: 0, error: e?.message || 'Falha na forja.' };
    }
  }
}
