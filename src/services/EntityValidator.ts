/**
 * EntityValidator.ts — Validador Estrito de Entidades, Invariantes e Imutabilidade
 *
 * Garante que nenhuma entidade sintética/corrompida ingresse no sistema e que
 * os campos de identidade permaneçam imutáveis.
 */

export interface CharacterValidationResult {
  valid: boolean;
  errors: string[];
}

export class EntityValidator {
  static IMMUTABLE_CHARACTER_FIELDS = [
    'ownerUid',
    'accountId',
    'characterId',
    'entityType',
    'playerType',
    'createdAt'
  ] as const;

  /**
   * Valida o tipo de entidade (player, bot, npc, monster)
   */
  static validateEntityType(entityType: unknown): boolean {
    return ['player', 'bot', 'npc', 'monster'].includes(String(entityType));
  }

  /**
   * Valida o tipo de jogador (real, bot)
   */
  static validatePlayerType(playerType: unknown): boolean {
    return ['real', 'bot'].includes(String(playerType));
  }

  /**
   * Valida a integridade completa de um documento de personagem
   */
  static validateCharacter(char: any): CharacterValidationResult {
    const errors: string[] = [];

    if (!char || typeof char !== 'object') {
      return { valid: false, errors: ['Entidade de personagem nula ou inválida.'] };
    }

    if (!char.characterId || typeof char.characterId !== 'string' || !char.characterId.trim()) {
      errors.push('characterId obrigatório e não pode ser vazio.');
    }

    if (!char.ownerUid || typeof char.ownerUid !== 'string' || !char.ownerUid.trim()) {
      errors.push('ownerUid obrigatório.');
    }

    if (!char.name || typeof char.name !== 'string' || char.name.trim().length < 3) {
      errors.push('name deve ter no mínimo 3 caracteres.');
    }

    if (char.entityType !== 'player') {
      errors.push(`entityType inválido: ${char.entityType}. Esperado 'player'.`);
    }

    if (char.playerType !== 'real' && char.playerType !== 'bot') {
      errors.push(`playerType inválido: ${char.playerType}. Esperado 'real' ou 'bot'.`);
    }

    const level = Number(char.level);
    if (isNaN(level) || level < 1 || level > 120) {
      errors.push(`level inválido: ${char.level}. Esperado entre 1 e 120.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Garante que campos imutáveis não foram alterados durante um UPDATE
   */
  static assertImmutableFields(currentData: any, updateData: any): { allowed: boolean; violation?: string } {
    if (!currentData || !updateData) return { allowed: true };

    for (const field of this.IMMUTABLE_CHARACTER_FIELDS) {
      if (field in updateData && updateData[field] !== undefined) {
        if (currentData[field] !== undefined && String(updateData[field]) !== String(currentData[field])) {
          return {
            allowed: false,
            violation: `Tentativa ilegal de modificar campo imutável: '${field}' de '${currentData[field]}' para '${updateData[field]}'`
          };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Valida relacionamentos entre dois personagens (amizade, mentoria, duelo)
   */
  static validateRelationship(charAId: string, charBId: string): { valid: boolean; reason?: string } {
    if (!charAId || !charBId) {
      return { valid: false, reason: 'Identificadores de relacionamento não podem ser nulos.' };
    }
    if (charAId === charBId) {
      return { valid: false, reason: 'Auto-relacionamento proibido: um personagem não pode se relacionar consigo mesmo.' };
    }
    return { valid: true };
  }

  /**
   * Valida que o personagem pertence ao usuário autenticado
   */
  static validateOwnership(char: any, authUid: string | null): boolean {
    if (!char || !authUid) return false;
    return char.ownerUid === authUid;
  }
}
