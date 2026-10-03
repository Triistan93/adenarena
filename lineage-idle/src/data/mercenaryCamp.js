export const MERCENARY_CAMP_WORK = {
  training: {
    id: 'training', name: 'Treinamento de Campo', icon: '🥋', durationMs: 30 * 60 * 1000,
    wage: 1000, mercenaryXp: 120, trust: 2, renown: 1, description: 'Exercícios de formação e combate elevam o nível e a disciplina.'
  },
  hunting: {
    id: 'hunting', name: 'Caçada de Provisões', icon: '🏹', durationMs: 45 * 60 * 1000,
    wage: 250, mercenaryXp: 70, trust: 2, renown: 2, description: 'Rastreador e caçador retornam com couro e materiais das presas locais.'
  },
  fishing: {
    id: 'fishing', name: 'Pesca de Suprimentos', icon: '🎣', durationMs: 45 * 60 * 1000,
    wage: 200, mercenaryXp: 70, trust: 2, renown: 2, description: 'Uma jornada tranquila às águas adequadas ao nível da guilda.'
  },
  mining: {
    id: 'mining', name: 'Extração de Minério', icon: '⛏️', durationMs: 60 * 60 * 1000,
    wage: 350, mercenaryXp: 85, trust: 2, renown: 2, description: 'O trabalhador extrai minério e subprodutos de uma galeria segura.'
  }
};

export const MERCENARY_CAMP_UPGRADES = {
  2: { renown: 5, gold: 50000, materials: [{ itemId: 'iron_ore', count: 40 }, { itemId: 'coal', count: 20 }] },
  3: { renown: 20, gold: 250000, materials: [{ itemId: 'steel', count: 40 }, { itemId: 'synthetic_cokes', count: 30 }] }
};

export const MAX_MERCENARY_CAMP_LEVEL = 3;
