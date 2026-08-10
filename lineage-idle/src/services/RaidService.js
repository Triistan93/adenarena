/**
 * RaidService.js ÔÇö Gest├úo de Chefes de Raid ├ëpicos do Lineage Idle.
 *
 * Respons├ível pela valida├º├úo e inicializa├º├úo de batalhas contra Raids ├ëpicos (Antaras, Valakas, Baium, etc).
 */

import { RAID_BOSSES } from '../data/raids.js';
import { MONSTERS } from '../data/monsters.js';
import { stopCombat, startCombat } from '../engine/CombatEngine.js';

/**
 * Inicia o combate de Raid ├ëpico contra o chefe escolhido.
 * @param {Object} state
 * @param {string} raidId
 * @param {Object} [callbacks] ÔÇö { log, el, renderStageMonster, attackMonster }
 */
export function startRaidBoss(state, raidId, callbacks = {}) {
  const bossTemplate = RAID_BOSSES[raidId];
  if (!bossTemplate) return;

  if (state.level < bossTemplate.reqLvl) {
    if (callbacks.log) callbacks.log(`Level ${bossTemplate.reqLvl} required for this Raid!`, 'system');
    return;
  }

  state.zone = null;
  state.target = raidId;
  MONSTERS[raidId] = bossTemplate;

  state.activeMonster = {
    ...bossTemplate,
    _maxHp: bossTemplate.hp,
    hp: bossTemplate.hp,
    _stunnedUntil: 0
  };

  if (callbacks.el) {
    const sz = callbacks.el('stage-zone');
    if (sz) sz.textContent = `­ƒÉë RAID ┬À ${bossTemplate.name}`;
  }

  stopCombat(state);
  startCombat(state, callbacks);

  if (callbacks.log) callbacks.log(`ÔÜö´©Å EPIC RAID: Challenge against ${bossTemplate.name} initiated!`, 'rarity-legendary');
  if (callbacks.renderStageMonster) callbacks.renderStageMonster();
}