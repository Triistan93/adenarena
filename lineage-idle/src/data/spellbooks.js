// spellbooks.js — Catálogo de Livros de Habilidade (1★ a 4★) e Cristais de Grau
export const SPELLBOOK_ITEMS = {
  book_1star: {
    id: 'book_1star',
    name: 'Tomo Sagrado: 1★ (Comum)',
    slot: 'consumable',
    category: 'spellbook',
    grade: 'D',
    stars: 1,
    icon: 'spellbooks/spellbook_1star.png',
    desc: 'Livro sagrado de magia fundamental. Necessário para desbloquear e aprimorar habilidades iniciais da 2ª Classe (Nível 40+).',
    price: 25000,
    stackable: true
  },
  book_2star: {
    id: 'book_2star',
    name: 'Tomo Sagrado: 2★ (Raro)',
    slot: 'consumable',
    category: 'spellbook',
    grade: 'C',
    stars: 2,
    icon: 'spellbooks/spellbook_2star.png',
    desc: 'Tomo ancestral de magia refinada. Necessário para habilidades nobres e buffs avançados da 2ª Classe (Nível 48+).',
    price: 75000,
    stackable: true
  },
  book_3star: {
    id: 'book_3star',
    name: 'Tomo Sagrado: 3★ (Épico)',
    slot: 'consumable',
    category: 'spellbook',
    grade: 'B',
    stars: 3,
    icon: 'spellbooks/spellbook_3star.png',
    desc: 'Grimório lendário das grandes lendas de Aden. Necessário para habilidades de assinatura de B-Grade (Nível 56+).',
    price: 250000,
    stackable: true
  },
  book_4star: {
    id: 'book_4star',
    name: 'Tomo Sagrado: 4★ (Lendário Divino)',
    slot: 'consumable',
    category: 'spellbook',
    grade: 'A',
    stars: 4,
    icon: 'spellbooks/spellbook_4star.png',
    desc: 'Tomo dos Deuses Antigos de Einhasad e Gran Kain. Necessário para habilidades supremas da 3ª e 4ª Classe.',
    price: 1000000,
    stackable: true
  }
};

export const CRYSTAL_ITEMS = {
  crystal_d: {
    id: 'crystal_d',
    name: 'Cristal: D-Grade',
    slot: 'material',
    category: 'material',
    grade: 'D',
    icon: '💎',
    desc: 'Fragmento cristalino puro obtido da quebra de itens D-Grade. Usado na confecção de Soulshots D e Tomos 1★.',
    price: 600,
    stackable: true
  },
  crystal_c: {
    id: 'crystal_c',
    name: 'Cristal: C-Grade',
    slot: 'material',
    category: 'material',
    grade: 'C',
    icon: '🔷',
    desc: 'Fragmento cristalino puro obtido da quebra de itens C-Grade. Usado na confecção de Soulshots C e Tomos 2★.',
    price: 2500,
    stackable: true
  },
  crystal_b: {
    id: 'crystal_b',
    name: 'Cristal: B-Grade',
    slot: 'material',
    category: 'material',
    grade: 'B',
    icon: '🔴',
    desc: 'Fragmento cristalino puro obtido da quebra de itens B-Grade. Usado na confecção de Soulshots B e Tomos 3★.',
    price: 7500,
    stackable: true
  },
  crystal_a: {
    id: 'crystal_a',
    name: 'Cristal: A-Grade',
    slot: 'material',
    category: 'material',
    grade: 'A',
    icon: '💠',
    desc: 'Fragmento cristalino nobre obtido da quebra de itens A-Grade. Usado na confecção de Soulshots A e Tomos 4★.',
    price: 25000,
    stackable: true
  },
  crystal_s: {
    id: 'crystal_s',
    name: 'Cristal: S-Grade',
    slot: 'material',
    category: 'material',
    grade: 'S',
    icon: '🌟',
    desc: 'Fragmento cristalino divino de itens S-Grade. Usado na forja de armas sagradas e relíquias supremas.',
    price: 75000,
    stackable: true
  }
};
