/**
 * PlayerRegistry.js — Registro Canônico Central de Identidades de Jogadores
 * Versão do motor lineage-idle, consumindo window.FirebaseBridge.
 */

import { EntityValidator } from './EntityValidator.js';

export class PlayerRegistry {
  static _cache = new Map();
  static CACHE_TTL_MS = 60000;

  static clearCache(characterId) {
    if (characterId) {
      this._cache.delete(characterId);
    } else {
      this._cache.clear();
    }
  }

  static _setCache(char) {
    if (!char || !char.characterId) return;
    this._cache.set(char.characterId, { data: char, cachedAt: Date.now() });
    if (char.nameLower) {
      this._cache.set(`name:${char.nameLower}`, { data: char, cachedAt: Date.now() });
    }
  }

  static async getPlayer(characterId) {
    if (!characterId) return null;
    const cached = this._cache.get(characterId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (typeof window !== 'undefined' && window.FirebaseBridge?.getPlayer) {
      try {
        const char = await window.FirebaseBridge.getPlayer(characterId);
        if (char && EntityValidator.validateCharacter(char).valid) {
          this._setCache(char);
          return char;
        }
      } catch (err) {
        console.warn(`[PlayerRegistry] Erro ao buscar ${characterId}:`, err);
      }
    }
    return null;
  }

  static async getPlayerByName(name) {
    if (!name || !name.trim()) return null;
    const cleanLower = name.trim().toLowerCase();
    const cached = this._cache.get(`name:${cleanLower}`);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.data;
    }

    if (typeof window !== 'undefined' && window.FirebaseBridge?.getPlayerByName) {
      try {
        const char = await window.FirebaseBridge.getPlayerByName(cleanLower);
        if (char && EntityValidator.validateCharacter(char).valid) {
          this._setCache(char);
          return char;
        }
      } catch (err) {
        console.warn(`[PlayerRegistry] Erro ao buscar por nome "${name}":`, err);
      }
    }
    return null;
  }

  static async getPlayersBatch(characterIds) {
    if (!Array.isArray(characterIds) || characterIds.length === 0) return [];
    if (typeof window !== 'undefined' && window.FirebaseBridge?.getPlayersBatch) {
      try {
        return await window.FirebaseBridge.getPlayersBatch(characterIds);
      } catch (err) {
        console.warn('[PlayerRegistry] Erro em batch get:', err);
      }
    }
    return [];
  }

  static async isValidPlayer(characterId) {
    const p = await this.getPlayer(characterId);
    return p !== null && p.status === 'active';
  }

  static async isRealPlayer(characterId) {
    const p = await this.getPlayer(characterId);
    return p !== null && p.playerType === 'real';
  }

  static async isBot(characterId) {
    const p = await this.getPlayer(characterId);
    return p !== null && p.playerType === 'bot';
  }

  static async requireExistingPlayer(characterId) {
    const p = await this.getPlayer(characterId);
    if (!p) {
      const err = new Error(`Jogador "${characterId}" não encontrado.`);
      err.code = 'PLAYER_NOT_FOUND';
      throw err;
    }
    return p;
  }

  static async requireRealPlayer(characterId) {
    const p = await this.requireExistingPlayer(characterId);
    if (p.playerType !== 'real') {
      const err = new Error(`Jogador "${characterId}" não é um jogador real.`);
      err.code = 'REAL_PLAYER_REQUIRED';
      throw err;
    }
    return p;
  }
}
