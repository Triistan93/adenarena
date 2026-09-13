/**
 * PlayerRegistry.ts — Registro Canônico Central de Identidades de Jogadores
 *
 * Responsável pela resolução de jogadores, cache inteligente anti-N+1,
 * e aplicação estrita das regras de identificação.
 */

import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  documentId
} from '../firebase';
import { EntityValidator } from './EntityValidator';

export interface CharacterEntity {
  characterId: string;
  accountId: string;
  ownerUid: string;
  name: string;
  nameLower: string;
  raceId: string;
  classId: string;
  level: number;
  experience: number;
  cp: number;
  entityType: 'player' | 'bot' | 'npc' | 'monster';
  playerType: 'real' | 'bot';
  status: 'active' | 'inactive' | 'banned' | 'deleted';
  isDiscoverable: boolean;
  clanName?: string;
  topWeaponName?: string;
  topWeaponGlow?: string | null;
  statsSnapshot?: Record<string, any>;
  lastOnlineAt?: number;
  createdAt: number;
  updatedAt: number;
}

export class PlayerRegistry {
  private static cache: Map<string, { data: CharacterEntity; cachedAt: number }> = new Map();
  private static readonly CACHE_TTL_MS = 60_000; // 60s TTL

  /**
   * Limpa ou invalida o cache
   */
  static clearCache(characterId?: string): void {
    if (characterId) {
      this.cache.delete(characterId);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Armazena no cache interno
   */
  private static setCache(char: CharacterEntity): void {
    if (!char || !char.characterId) return;
    this.cache.set(char.characterId, { data: char, cachedAt: Date.now() });
    if (char.nameLower) {
      this.cache.set(`name:${char.nameLower}`, { data: char, cachedAt: Date.now() });
    }
  }

  /**
   * Obtém um personagem pelo seu characterId
   */
  static async getPlayer(characterId: string): Promise<CharacterEntity | null> {
    if (!characterId) return null;

    // Cache hit
    const cached = this.cache.get(characterId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const charRef = doc(db, 'characters', characterId);
      const snap = await getDoc(charRef);
      if (!snap.exists()) return null;

      const data = snap.data() as CharacterEntity;
      const validation = EntityValidator.validateCharacter(data);
      if (!validation.valid) {
        console.warn(`[PlayerRegistry] Entidade inválida detectada em characters/${characterId}:`, validation.errors);
        return null;
      }

      this.setCache(data);
      return data;
    } catch (err) {
      console.warn(`[PlayerRegistry] Erro ao buscar jogador ${characterId}:`, err);
      return null;
    }
  }

  /**
   * Obtém um personagem pelo nome (insensível a maiúsculas/minúsculas)
   */
  static async getPlayerByName(name: string): Promise<CharacterEntity | null> {
    if (!name || !name.trim()) return null;
    const cleanLower = name.trim().toLowerCase();

    // Cache hit
    const cached = this.cache.get(`name:${cleanLower}`);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    try {
      const q = query(
        collection(db, 'characters'),
        where('nameLower', '==', cleanLower),
        where('status', '==', 'active'),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;

      const docSnap = snap.docs[0];
      const data = docSnap.data() as CharacterEntity;
      this.setCache(data);
      return data;
    } catch (err) {
      console.warn(`[PlayerRegistry] Erro ao buscar jogador por nome "${name}":`, err);
      return null;
    }
  }

  /**
   * Busca em batch para listas de amigos, membros de clã e rankings (Anti N+1 Queries)
   */
  static async getPlayersBatch(characterIds: string[]): Promise<CharacterEntity[]> {
    if (!Array.isArray(characterIds) || characterIds.length === 0) return [];

    const uniqueIds = [...new Set(characterIds.filter(Boolean))];
    const results: CharacterEntity[] = [];
    const missingIds: string[] = [];

    // Check cache first
    for (const id of uniqueIds) {
      const cached = this.cache.get(id);
      if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
        results.push(cached.data);
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length === 0) return results;

    // Chunk in groups of 30 for Firestore 'in' limit
    const chunkSize = 30;
    for (let i = 0; i < missingIds.length; i += chunkSize) {
      const chunk = missingIds.slice(i, i + chunkSize);
      try {
        const q = query(collection(db, 'characters'), where(documentId(), 'in', chunk));
        const snap = await getDocs(q);
        snap.forEach((d) => {
          const char = d.data() as CharacterEntity;
          if (EntityValidator.validateCharacter(char).valid) {
            this.setCache(char);
            results.push(char);
          }
        });
      } catch (err) {
        console.warn('[PlayerRegistry] Falha ao executar batch get de personagens:', err);
      }
    }

    return results;
  }

  /**
   * Retorna jogadores descobríveis reais para busca social
   * Invariante estrita: playerType === 'real' && status === 'active' && isDiscoverable === true
   */
  static async getDiscoverablePlayers(limitCount: number = 20): Promise<CharacterEntity[]> {
    try {
      const q = query(
        collection(db, 'characters'),
        where('playerType', '==', 'real'),
        where('status', '==', 'active'),
        where('isDiscoverable', '==', true),
        limit(limitCount)
      );
      const snap = await getDocs(q);
      const list: CharacterEntity[] = [];

      snap.forEach((d) => {
        const char = d.data() as CharacterEntity;
        if (EntityValidator.validateCharacter(char).valid) {
          this.setCache(char);
          list.push(char);
        }
      });

      return list;
    } catch (err) {
      console.warn('[PlayerRegistry] Falha ao consultar discoverable players:', err);
      return [];
    }
  }

  /**
   * Valida existência do jogador
   */
  static async isValidPlayer(characterId: string): Promise<boolean> {
    const player = await this.getPlayer(characterId);
    return player !== null && player.status === 'active';
  }

  /**
   * Valida se é um jogador real autêntico
   */
  static async isRealPlayer(characterId: string): Promise<boolean> {
    const player = await this.getPlayer(characterId);
    return player !== null && player.playerType === 'real';
  }

  /**
   * Valida se é um bot explícito
   */
  static async isBot(characterId: string): Promise<boolean> {
    const player = await this.getPlayer(characterId);
    return player !== null && player.playerType === 'bot';
  }

  /**
   * Exige que o jogador exista ou dispara erro
   */
  static async requireExistingPlayer(characterId: string): Promise<CharacterEntity> {
    const player = await this.getPlayer(characterId);
    if (!player) {
      const err = new Error(`Jogador com ID "${characterId}" não encontrado.`);
      (err as any).code = 'PLAYER_NOT_FOUND';
      throw err;
    }
    return player;
  }

  /**
   * Exige que seja um jogador real autêntico
   */
  static async requireRealPlayer(characterId: string): Promise<CharacterEntity> {
    const player = await this.requireExistingPlayer(characterId);
    if (player.playerType !== 'real') {
      const err = new Error(`Entidade "${characterId}" é um bot ou entidade sintética não permitida.`);
      (err as any).code = 'REAL_PLAYER_REQUIRED';
      throw err;
    }
    return player;
  }
}
