/**
 * rarities.js — Escala Expandida de 11 Raridades do Aden Arena / MMORPG Hardcore.
 */

export const RARITIES = {
  common: {
    id: 'common',
    name: 'Comum',
    color: '#9e9e9e',
    glowColor: 'rgba(158, 158, 158, 0.2)',
    badge: '⚪ Comum',
    multiplier: 1.0
  },
  uncommon: {
    id: 'uncommon',
    name: 'Incomum',
    color: '#4caf50',
    glowColor: 'rgba(76, 175, 80, 0.3)',
    badge: '🟢 Incomum',
    multiplier: 1.25
  },
  rare: {
    id: 'rare',
    name: 'Raro',
    color: '#2196f3',
    glowColor: 'rgba(33, 150, 243, 0.4)',
    badge: '🔵 Raro',
    multiplier: 1.6
  },
  epic: {
    id: 'epic',
    name: 'Épico',
    color: '#9c27b0',
    glowColor: 'rgba(156, 39, 176, 0.5)',
    badge: '🟣 Épico',
    multiplier: 2.2
  },
  legendary: {
    id: 'legendary',
    name: 'Lendário',
    color: '#ff9800',
    glowColor: 'rgba(255, 152, 0, 0.6)',
    badge: '🟡 Lendário',
    multiplier: 3.0
  },
  mythic: {
    id: 'mythic',
    name: 'Mítico',
    color: '#f44336',
    glowColor: 'rgba(244, 67, 54, 0.7)',
    badge: '🔴 Mítico',
    multiplier: 4.2
  },
  ancestral: {
    id: 'ancestral',
    name: 'Ancestral',
    color: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.75)',
    badge: '🟤 Ancestral',
    multiplier: 5.8
  },
  ascendant: {
    id: 'ascendant',
    name: 'Ascensão',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.8)',
    badge: '💠 Ascensão',
    multiplier: 8.0
  },
  primordial: {
    id: 'primordial',
    name: 'Primordial',
    color: '#e040fb',
    glowColor: 'rgba(224, 64, 251, 0.85)',
    badge: '🌌 Primordial',
    multiplier: 11.5
  },
  sovereign: {
    id: 'sovereign',
    name: 'Soberano',
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.95)',
    badge: '👑 Soberano',
    multiplier: 16.0
  },
  absolute: {
    id: 'absolute',
    name: 'Absoluto',
    color: '#ffffff',
    glowColor: 'linear-gradient(45deg, #ff0055, #00ffff, #ffff00)',
    badge: '♾️ Absoluto',
    multiplier: 24.0
  }
};

/**
 * Retorna os efeitos de brilho e aura visual baseado no nível de encantamento.
 * @param {number} enchantLevel
 * @returns {{ auraClass: string, glowColor: string, label: string }}
 */
export function getEnchantVisuals(enchantLevel) {
  const enc = Math.max(0, parseInt(enchantLevel, 10) || 0);
  if (enc >= 20) {
    return { auraClass: 'aura-cosmic-godly', glowColor: '#00ffff', label: 'Aura Cósmica Absoluta' };
  }
  if (enc >= 16) {
    return { auraClass: 'aura-crimson-fire', glowColor: '#ff1744', label: 'Chama Carmesim Ardente' };
  }
  if (enc >= 10) {
    return { auraClass: 'aura-golden-amber', glowColor: '#ffc107', label: 'Brilho Dourado Radiante' };
  }
  if (enc >= 4) {
    return { auraClass: 'aura-blue-ice', glowColor: '#29b6f6', label: 'Resplendor Azul Gélido' };
  }
  return { auraClass: 'aura-none', glowColor: 'transparent', label: 'Normal' };
}
