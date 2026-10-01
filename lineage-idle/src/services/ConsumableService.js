import { ALL_ITEMS } from '../data/items/index.js';

const BUFF_STAT_ALIASES = Object.freeze({
  pAtkPct: 'pAtkPercent',
  mAtkPct: 'mAtkPercent',
  pDefPct: 'pDefPercent',
  mDefPct: 'mDefPercent'
});

const SUPPORTED_BUFF_STATS = new Set([
  'con', 'men', 'movementSpeedPercent', 'atk', 'pAtkPercent', 'matk', 'mAtkPercent',
  'def', 'pDefPercent', 'mdef', 'mDefPercent', 'crit', 'cdr', 'atkSpdPercent',
  'castSpdPercent', 'atkSpd', 'castSpd', 'pSkillCdr', 'mSkillCdr', 'mpCostReduction',
  'pSkillMpCostReduction', 'mSkillMpCostReduction', 'eva', 'pAccuracy', 'mAccuracy',
  'blockRate', 'shieldDefPercent', 'pveDamagePercent', 'damageTakenReductionPercent',
  'healingReceivedPercent', 'critDmgPercent', 'pSkillPowerPercent', 'mSkillPowerPercent',
  'lifeDrain', 'pSkillEvasionPercent', 'mSkillEvasionPercent', 'buffCancelResistancePercent',
  'debuffResistancePercent', 'maxHpFlat', 'maxHpPercent', 'maxMpFlat', 'maxMpPercent',
  'mpRegen', 'maxCpFlat', 'maxCpPercent'
]);

/** Returns the catalog's restore amount for HP/MP potions, keeping combat paths data-driven. */
export function getConsumableRestoreAmount(itemOrId, resource) {
  const item = typeof itemOrId === 'string' ? ALL_ITEMS[itemOrId] : itemOrId;
  if (!item || typeof item !== 'object') return 0;

  const itemId = String(item.id || item.itemId || (typeof itemOrId === 'string' ? itemOrId : '')).toLowerCase();
  const isHpPotion = resource === 'hp' && (itemId.startsWith('hp_potion_') || itemId === 'greater_healing_potion');
  const isMpPotion = resource === 'mp' && itemId.startsWith('mp_potion_');
  if (!isHpPotion && !isMpPotion) return 0;

  const amount = Number(item.amount ?? item.healAmt);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

/** Applies a catalog item's timed combat stat buff to the player's live state. */
export function applyConsumableStatBuff(state, itemDefinition, now = Date.now()) {
  const declaredStats = itemDefinition?.buffStats;
  if (!state || !declaredStats || typeof declaredStats !== 'object' || Array.isArray(declaredStats)) return false;

  const stats = {};
  for (const [declaredKey, rawValue] of Object.entries(declaredStats)) {
    const key = BUFF_STAT_ALIASES[declaredKey] || declaredKey;
    const value = Number(rawValue);
    if (!SUPPORTED_BUFF_STATS.has(key) || !Number.isFinite(value) || value === 0) continue;
    stats[key] = (Number(stats[key]) || 0) + value;
  }
  if (!Object.keys(stats).length) return false;

  const durationSeconds = Math.max(1, Number(itemDefinition.buffDuration) || Number(itemDefinition.duration) || 1800);
  const durationMs = durationSeconds * 1000;
  const buffId = String(itemDefinition.id || itemDefinition.itemId || '').trim();
  if (!buffId) return false;

  state.buffs = state.buffs && typeof state.buffs === 'object' ? state.buffs : {};
  const existing = state.buffs[buffId];
  const existingIsActive = Number(existing?.until) > now;
  const until = existingIsActive
    ? Math.min(Number(existing.until) + durationMs, now + 8 * 60 * 60 * 1000)
    : now + durationMs;
  const previousStats = existingIsActive && existing.skillBuffStats && typeof existing.skillBuffStats === 'object'
    ? existing.skillBuffStats
    : {};

  state.buffs[buffId] = {
    ...(existingIsActive ? existing : {}),
    skillBuffStats: Object.fromEntries(Object.entries({ ...previousStats, ...stats }).map(([key, value]) => [
      key,
      Object.prototype.hasOwnProperty.call(previousStats, key) && Math.abs(Number(previousStats[key]) || 0) > Math.abs(Number(value) || 0)
        ? Number(previousStats[key])
        : Number(value)
    ])),
    until
  };
  return true;
}

/** Restores CP up to the current character cap, without consuming a full-CP potion. */
export function restoreCharacterCp(state, amount, maxCp) {
  if (!state || typeof state !== 'object') return { success: false, restored: 0 };

  const currentCp = Math.max(0, Number(state.cp) || 0);
  const cpCap = Math.max(0, Number(maxCp) || Number(state.maxCp) || 0);
  const restoreAmount = Math.max(0, Number(amount) || 0);
  const restored = Math.min(restoreAmount, Math.max(0, cpCap - currentCp));
  if (restored <= 0) return { success: false, restored: 0, currentCp };

  state.cp = currentCp + restored;
  return { success: true, restored, currentCp: state.cp };
}
