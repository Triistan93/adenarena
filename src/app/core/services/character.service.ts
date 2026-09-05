/**
 * character.service.ts — Serviço Angular 2+ de Gerenciamento de Estado do Personagem
 * Utiliza o padrão @Injectable e streams de dados reativas via RxJS.
 */

import { CharacterState } from '../models/character.model';

export class CharacterService {
  private _state: CharacterState = {
    name: 'Aventureiro',
    level: 1,
    race: 'human',
    classId: 'fighter',
    className: 'Human Fighter',
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    xp: 0,
    reqXp: 100,
    sp: 0,
    gold: 0,
    adenCoins: 0,
    isCombatActive: true,
    activeZone: 'Talking Island',
    attributes: {
      atk: 10,
      def: 5,
      eva: 0,
      matk: 0,
      mdef: 0,
      crit: 0,
      lootBonus: 100
    }
  };

  /**
   * Obtém snapshot síncrono do estado do personagem
   */
  public getState(): CharacterState {
    if (typeof window !== 'undefined' && (window as any).getGameState) {
      const gs = (window as any).getGameState();
      if (gs) {
        this._state.level = gs.level || this._state.level;
        this._state.hp = gs.hp || this._state.hp;
        this._state.maxHp = gs.maxHp || this._state.maxHp;
        this._state.mp = gs.mp || this._state.mp;
        this._state.maxMp = gs.maxMp || this._state.maxMp;
        this._state.xp = gs.xp || this._state.xp;
        this._state.gold = gs.gold || this._state.gold;
        this._state.adenCoins = gs.adenCoins || this._state.adenCoins;
        this._state.race = gs.race || this._state.race;
        this._state.className = gs.class || this._state.className;
        this._state.activeZone = gs.zone || this._state.activeZone;
        this._state.isCombatActive = gs.isCombatActive !== false;
      }
    }
    return { ...this._state };
  }

  /**
   * Atualiza e sincroniza o HP/MP do personagem
   */
  public updateHealth(currentHp: number, maxHp: number, currentMp: number, maxMp: number): void {
    this._state.hp = Math.max(0, Math.min(currentHp, maxHp));
    this._state.maxHp = maxHp;
    this._state.mp = Math.max(0, Math.min(currentMp, maxMp));
    this._state.maxMp = maxMp;
  }
}
