/**
 * character-panel.component.ts — Componente de Painel de Status (Padrão Angular 2+)
 */

import { CharacterService } from '../../core/services/character.service';
import { CharacterState } from '../../core/models/character.model';

export class CharacterPanelComponent {
  public character: CharacterState;

  constructor(private characterService: CharacterService) {
    this.character = this.characterService.getState();
  }

  public get hpPercentage(): number {
    return (this.character.hp / (this.character.maxHp || 1)) * 100;
  }

  public get mpPercentage(): number {
    return (this.character.mp / (this.character.maxMp || 1)) * 100;
  }

  public get xpPercentage(): number {
    return (this.character.xp / (this.character.reqXp || 1)) * 100;
  }

  public refresh(): void {
    this.character = this.characterService.getState();
  }
}
