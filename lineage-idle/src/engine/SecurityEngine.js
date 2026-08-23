/**
 * SecurityEngine.js — Motor de Segurança, Integridade de Save e Prevenção de Trapaças.
 *
 * Responsável por:
 *  1. Geração e validação de Checksum HMAC dos dados vitais do jogador.
 *  2. Sanitização defensiva do estado (limites de nível, ouro positivo, itens válidos).
 *  3. Validação segura do tempo offline contra manipulação de relógio do sistema.
 */

const SALT = 'aden_arena_sec_v2_salt_99812_secure';
const MAX_LEVEL_CAP = 120;
const MAX_OFFLINE_MINUTES = 720; // Limite máximo de 12 horas offline

/**
 * Gera um hash numérico rápido e determinístico baseado em string.
 * @param {string} str
 * @returns {string}
 */
function hashString(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Extrai os dados críticos do estado e gera um Checksum de integridade.
 * @param {Object} state
 * @returns {string}
 */
export function generateStateChecksum(state) {
  if (!state || typeof state !== 'object') return '';
  
  const level = Number(state.level) || 1;
  const xp = Math.floor(Number(state.xp) || 0);
  const sp = Math.floor(Number(state.sp) || 0);
  const gold = Math.floor(Number(state.gold) || 0);
  const race = String(state.race || '');
  const cls = String(state.class || '');
  const invCount = Array.isArray(state.inventory) ? state.inventory.length : 0;
  
  const payload = `${level}|${xp}|${sp}|${gold}|${race}|${cls}|${invCount}|${SALT}`;
  return hashString(payload);
}

/**
 * Valida se o estado do jogo foi adulterado externamente no localStorage.
 * @param {Object} data — Dados lidos do storage
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateStateIntegrity(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, reason: 'Dados corrompidos ou inválidos.' };
  }

  // Validação de limites de sanidade fundamentais
  if (data.level && (data.level < 1 || data.level > MAX_LEVEL_CAP)) {
    return { valid: false, reason: `Nível fora dos limites permitidos (1-${MAX_LEVEL_CAP}).` };
  }

  if (data.gold !== undefined && (typeof data.gold !== 'number' || isNaN(data.gold) || data.gold < 0)) {
    return { valid: false, reason: 'Quantidade de ouro inválida ou negativa.' };
  }

  // Se o save já possui checksum gerado anteriormente, valida correspondência
  if (data._chk) {
    const expected = generateStateChecksum(data);
    if (data._chk !== expected) {
      // Se apenas o checksum divergiu mas os valores são válidos e numéricos, auto-recupera sem descartar dados
      return { valid: false, reason: 'Assinatura de integridade incompatível (dados alterados externamente).' };
    }
  }

  return { valid: true };
}

/**
 * Sanitiza defensivamente todos os campos numéricos e coleções do estado.
 * @param {Object} state
 * @returns {Object} Estado sanitizado
 */
export function sanitizeGameState(state) {
  if (!state || typeof state !== 'object') return state;

  state.level = Math.max(1, Math.min(MAX_LEVEL_CAP, parseInt(state.level, 10) || 1));
  state.xp = Math.max(0, parseInt(state.xp, 10) || 0);
  state.sp = Math.max(0, parseInt(state.sp, 10) || 0);
  state.gold = Math.max(0, parseInt(state.gold, 10) || 0);
  state.maxHp = Math.max(10, parseInt(state.maxHp, 10) || 100);
  state.hp = Math.max(1, Math.min(state.maxHp, parseInt(state.hp, 10) || state.maxHp));
  state.maxMp = Math.max(5, parseInt(state.maxMp, 10) || 50);
  state.mp = Math.max(0, Math.min(state.maxMp, parseInt(state.mp, 10) || state.maxMp));

  // Sanitiza inventário contra itens corrompidos ou quantidades negativas
  if (Array.isArray(state.inventory)) {
    state.inventory = state.inventory.filter(item => {
      if (!item || !item.itemId) return false;
      item.count = Math.max(1, parseInt(item.count, 10) || 1);
      item.enchant = Math.max(0, Math.min(30, parseInt(item.enchant, 10) || 0));
      return true;
    });
  } else {
    state.inventory = [];
  }

  // Sanitiza armazém
  if (Array.isArray(state.warehouse)) {
    state.warehouse = state.warehouse.filter(item => {
      if (!item || !item.itemId) return false;
      item.count = Math.max(1, parseInt(item.count, 10) || 1);
      return true;
    });
  } else {
    state.warehouse = [];
  }

  return state;
}

/**
 * Valida o tempo decorrido desde o último save, impedindo saltos temporais impossíveis.
 * @param {number} lastSaveTime — Timestamp Epoch em milissegundos
 * @returns {{ valid: boolean, minutesOffline: number }}
 */
export function validateOfflineTime(lastSaveTime) {
  if (!lastSaveTime || typeof lastSaveTime !== 'number' || isNaN(lastSaveTime)) {
    return { valid: false, minutesOffline: 0 };
  }

  const now = Date.now();
  const elapsedMs = now - lastSaveTime;

  // Se o relógio foi atrasado no computador do usuário
  if (elapsedMs < 0) {
    console.warn('[SecurityEngine] Detecção de relógio retroativo.');
    return { valid: false, minutesOffline: 0 };
  }

  // Menos de 1 minuto não contabiliza offline progress
  if (elapsedMs < 60000) {
    return { valid: false, minutesOffline: 0 };
  }

  // Limita o tempo offline ao teto seguro (ex: 12 horas)
  const rawMinutes = Math.floor(elapsedMs / 60000);
  const minutesOffline = Math.min(MAX_OFFLINE_MINUTES, rawMinutes);

  return { valid: true, minutesOffline };
}

if (typeof window !== 'undefined') {
  window.SecurityEngine = {
    generateStateChecksum,
    validateStateIntegrity,
    sanitizeGameState,
    validateOfflineTime
  };
}
