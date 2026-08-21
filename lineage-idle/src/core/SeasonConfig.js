/**
 * SeasonConfig.js — Motor Central de Controle de Temporadas e Crônicas de Aden.
 *
 * Controla a liberação progressiva de sistemas, limites de nível, regras de encantamento
 * e narrativa imersiva de cada temporada.
 */

export const CURRENT_SEASON = 1;

export const SEASONS_DATA = {
  1: {
    id: 1,
    title: "Temporada 1: O Despertar de Aden",
    subtitle: "Crônica I — Os Primeiros Passos dos Escolhidos",
    maxLevel: 60,
    maxGrade: "B",
    active: true,
    releaseDate: "Ativa Agora",
    description: "Os heróis iniciam sua jornada pelo Reino de Aden. Domine as artes fundamentais da sua classe, forje seus primeiros equipamentos e dispute as riquezas iniciais.",
    unlockedTabs: [
      "zones", "character", "inventory", "warehouse", "skills",
      "shop", "craft", "alchemy", "astral", "quests", "rankings", "enchant"
    ],
    features: [
      "⚔️ Zonas de Caça Iniciais (Gludio, Dion, Giran)",
      "👤 1ª e 2ª Evoluções de Classe (Níveis 20 e 40)",
      "🎒 Equipamentos NoGrade, D-Grade, C-Grade e B-Grade inicial",
      "✦ Árvore de Habilidades Básica da Classe",
      "⚒️ Forja e Alquimia de Elixires Básica",
      "✨ Encantamento até +7 Seguro",
      "🎯 Missões Diárias & Passe de Batalha Temporada 1",
      "🏆 Rankings Globais de Nível e Riqueza"
    ]
  },
  2: {
    id: 2,
    title: "Temporada 2: A Era dos Clãs & Castelos",
    subtitle: "Crônica II — A Marcha dos Senhores de Guerra",
    maxLevel: 75,
    maxGrade: "A",
    active: false,
    releaseDate: "Em Breve",
    description: "Alianças se formam e as primeiras trombetas de guerra ecoam pelos vales. A disputa pelo domínio dos grandes castelos e pela Torre da Insolência começou!",
    unlockedTabs: [
      "clan", "tower", "dolls", "magiclamp", "expeditions", "raids"
    ],
    features: [
      "🛡️ Fundação e Evolução de Clãs (Níveis 1 a 10)",
      "🏰 Cerco aos Castelos (Gludio, Dion, Giran)",
      "🏰 Torre da Insolência (Andares 1 a 50)",
      "🧸 Boss Dolls & Monster Codex Avançado",
      "🪔 Lâmpada Mágica & Roleta de Random Craft",
      "🐉 Início das Raids Mundiais (Queen Ant, Core, Orfen)"
    ]
  },
  3: {
    id: 3,
    title: "Temporada 3: Os Sete Selos & Olimpíadas",
    subtitle: "Crônica III — O Despertar dos Selos e o Trono dos Heróis",
    maxLevel: 80,
    maxGrade: "S",
    active: false,
    releaseDate: "Temporada Futura",
    description: "As forças da Luz e da Escuridão colidem nas Catacumbas e Necrópoles. O Grande Coliseu coroa os primeiros Heróis Supremos de Aden com Armas da Infinidade.",
    unlockedTabs: [
      "sevensigns", "olympiad", "fortress", "colosseum", "codex"
    ],
    features: [
      "🏛️ Disputa dos Sete Selos (Dawn vs Dusk & Mercadores de Mammon)",
      "🏆 Grande Olimpíada Semanal & Coroação de Heróis",
      "👤 Sistema de Subclasses & Certificações",
      "✨ Augmentation com Pedras de Vida (Life Stones)",
      "✦ Encantamento de Habilidades (+1 a +30)",
      "⚔️ Fortalezas Territoriais & Talismãs",
      "🐉 Grand Bosses Intermediários (Zaken & Baium)"
    ]
  },
  4: {
    id: 4,
    title: "Temporada 4: A Fúria dos Dragões & Multiverso",
    subtitle: "Crônica IV — O Clamor dos Antigos e a Batalha Dimensional",
    maxLevel: 85,
    maxGrade: "S84",
    active: false,
    releaseDate: "Temporada Futura",
    description: "Os Dragões Lendários despertam de seu sono milenar. As barreiras dimensionais se rompem, revelando os campos de batalha 2D Pixel e 3D Arena!",
    unlockedTabs: [],
    features: [
      "🐉 World Bosses Supremos: Antharas e Valakas",
      "👾 Liberação Oficial do Modo 👾 Aden Pixel 2D",
      "⚔ Liberação Oficial do Modo ⚔ 3D Arena",
      "🏰 Cerco aos Castelos Supremos de Aden e Goddard",
      "👤 3ª e 4ª Classes Completas & Transformações Divinas"
    ]
  }
};

/**
 * Retorna as informações da temporada atual ativa.
 */
export function getCurrentSeason() {
  return SEASONS_DATA[CURRENT_SEASON] || SEASONS_DATA[1];
}

/**
 * Verifica se uma aba/recurso está desbloqueada na temporada atual.
 * @param {string} tabId
 * @returns {boolean}
 */
export function isFeatureUnlocked(tabId) {
  for (let s = 1; s <= CURRENT_SEASON; s++) {
    const season = SEASONS_DATA[s];
    if (season && season.unlockedTabs.includes(tabId)) {
      return true;
    }
  }
  return false;
}

/**
 * Retorna qual temporada desbloqueará a funcionalidade.
 * @param {string} tabId
 * @returns {Object|null}
 */
export function getSeasonForFeature(tabId) {
  for (const s of Object.values(SEASONS_DATA)) {
    if (s.unlockedTabs.includes(tabId)) {
      return s;
    }
  }
  return SEASONS_DATA[2]; // Default para próxima temporada
}

/**
 * Retorna o limite máximo de nível permitido pela temporada atual.
 * @returns {number}
 */
export function getSeasonMaxLevel() {
  return getCurrentSeason().maxLevel || 60;
}
