/**
 * EntityValidator.js — Validador Estrito de Entidades, Invariantes e Imutabilidade
 * Versão do motor lineage-idle.
 */

export class EntityValidator {
  static IMMUTABLE_CHARACTER_FIELDS = [
    'ownerUid',
    'accountId',
    'characterId',
    'entityType',
    'playerType',
    'createdAt'
  ];

  static validateEntityType(entityType) {
    return ['player', 'bot', 'npc', 'monster'].includes(String(entityType));
  }

  static validatePlayerType(playerType) {
    return ['real', 'bot'].includes(String(playerType));
  }

  static validateCharacter(char) {
    const errors = [];
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

  static assertImmutableFields(currentData, updateData) {
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

  static validateRelationship(charAId, charBId) {
    if (!charAId || !charBId) {
      return { valid: false, reason: 'Identificadores de relacionamento não podem ser nulos.' };
    }
    if (charAId === charBId) {
      return { valid: false, reason: 'Auto-relacionamento proibido: um personagem não pode se relacionar consigo mesmo.' };
    }
    return { valid: true };
  }

  static validateOwnership(char, authUid) {
    if (!char || !authUid) return false;
    return char.ownerUid === authUid;
  }
}
