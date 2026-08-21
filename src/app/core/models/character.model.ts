/**
 * character.model.ts — Modelo de Dados do Personagem (Padrão Angular 2+)
 */

export interface CharacterAttributes {
  atk: number;
  def: number;
  eva: number;
  matk: number;
  mdef: number;
  crit: number;
  lootBonus: number;
}

export interface CharacterState {
  name: string;
  level: number;
  race: 'human' | 'elf' | 'darkelf' | 'orc' | 'dwarf' | 'kamael';
  classId: string;
  className: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  xp: number;
  reqXp: number;
  sp: number;
  gold: number;
  adenCoins: number;
  isCombatActive: boolean;
  activeZone: string;
  attributes: CharacterAttributes;
}
