// PetService.js — Gerenciador de Mascotes & Companheiros de Batalha
import { PET_CATALOG } from '../data/pets.js';

const PET_HUNGER_POINT_INTERVAL_MS = 10 * 60 * 1000;

function getPetHunger(pet) {
  if (pet?.hunger == null) return 100;
  const hunger = Number(pet.hunger);
  return Number.isFinite(hunger) ? Math.max(0, Math.min(100, hunger)) : 100;
}

export const PetService = {
  getPetState(state) {
    if (!state.petData) {
      state.petData = {
        activePetId: null,
        pets: {},
        lastFeedTime: Date.now()
      };
    }
    return state.petData;
  },

  adoptPet(state, petId, callbacks = {}) {
    const petDef = PET_CATALOG[petId];
    if (!petDef) return { success: false, reason: 'invalid_pet' };

    const pState = this.getPetState(state);
    if (pState.pets[petId]) {
      if (callbacks.log) callbacks.log(`Você já possui o ${petDef.name}!`, 'warning');
      return { success: false, reason: 'already_owned' };
    }

    const cost = petDef.cost || 50000;
    const gold = state.gold ?? 0;
    if (!Number.isSafeInteger(gold) || !Number.isSafeInteger(cost) || cost < 0 || gold < cost) {
      if (callbacks.log) callbacks.log(`Adena insuficiente! Custo para adotar: ${cost.toLocaleString()} Adena.`, 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    if ((state.level || 1) < petDef.unlockLvl) {
      if (callbacks.log) callbacks.log(`Nível insuficiente! O ${petDef.name} exige Nível ${petDef.unlockLvl}+.`, 'warning');
      return { success: false, reason: 'level_locked' };
    }

    state.gold -= cost;
    pState.pets[petId] = {
      id: petId,
      name: petDef.name,
      level: 1,
      xp: 0,
      hunger: 100, // 0 a 100%
      hungerElapsedMs: 0,
      adoptedAt: Date.now()
    };

    if (!pState.activePetId) {
      pState.activePetId = petId;
    }

    if (callbacks.log) callbacks.log(`🎉 Você adotou o companheiro **${petDef.name}**!`, 'rarity-epic');
    if (callbacks.floatText) callbacks.floatText(`🐾 NOVO PET: ${petDef.name}!`, 'float-jackpot');

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  summonPet(state, petId, callbacks = {}) {
    const pState = this.getPetState(state);
    if (petId && !pState.pets[petId]) return { success: false, reason: 'not_owned' };

    pState.activePetId = pState.activePetId === petId ? null : petId;
    const active = pState.pets[pState.activePetId];

    if (callbacks.log) {
      if (active) callbacks.log(`🐾 Você invocou **${active.name}** (Lv. ${active.level}) para lutar ao seu lado!`, 'gain');
      else callbacks.log('🐾 Mascote recolhido para o descanso.', 'system');
    }

    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true, activePetId: pState.activePetId };
  },

  feedPet(state, callbacks = {}) {
    const pState = this.getPetState(state);
    if (!pState.activePetId || !pState.pets[pState.activePetId]) {
      if (callbacks.log) callbacks.log('Nenhum mascote ativo para alimentar.', 'warning');
      return { success: false, reason: 'no_active_pet' };
    }

    const feedCost = 5000;
    const gold = state.gold ?? 0;
    if (!Number.isSafeInteger(gold) || gold < feedCost) {
      if (callbacks.log) callbacks.log('Adena insuficiente para comprar Ração Especial de Pet (5.000 Adena).', 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    const pet = pState.pets[pState.activePetId];
    if (getPetHunger(pet) >= 100) {
      if (callbacks.log) callbacks.log(`${pet.name} já está completamente saciado.`, 'system');
      return { success: false, reason: 'already_fed' };
    }
    state.gold -= feedCost;
    pet.hunger = 100;
    pet.hungerElapsedMs = 0;
    pState.lastFeedTime = Date.now();

    if (callbacks.log) callbacks.log(`🍖 Você alimentou **${pet.name}**! Saciedade 100% restaurada.`, 'gain');
    if (callbacks.updateAllUI) callbacks.updateAllUI();
    if (callbacks.save) callbacks.save();
    return { success: true };
  },

  addPetXp(state, xpAmount, callbacks = {}) {
    const pState = this.getPetState(state);
    if (!pState.activePetId || !pState.pets[pState.activePetId]) return;

    const pet = pState.pets[pState.activePetId];
    if (pet.level >= 60) return; // Cap 60

    pet.xp = (pet.xp || 0) + Math.floor(xpAmount * 0.25); // 25% do XP do herói
    while (pet.level < 60) {
      const reqXp = pet.level * pet.level * 400;
      if (pet.xp < reqXp) break;
      pet.xp -= reqXp;
      pet.level++;
      if (callbacks.log) callbacks.log(`🌟 Seu companheiro **${pet.name}** subiu para o **Nível ${pet.level}**!`, 'rarity-epic');
      if (callbacks.floatText) callbacks.floatText(`🐾 PET LEVEL UP! (Lv.${pet.level})`, 'float-epic');
    }
  },

  tickPetHunger(state, elapsedMs) {
    const pState = state?.petData;
    if (!pState?.pets || typeof pState.pets !== 'object') return;
    const pet = pState.activePetId ? pState.pets[pState.activePetId] : null;
    const elapsed = Number(elapsedMs);
    if (!pet || !Number.isFinite(elapsed) || elapsed <= 0) return;

    const hunger = getPetHunger(pet);
    if (hunger === 0) {
      pet.hunger = 0;
      pet.hungerElapsedMs = 0;
      return;
    }

    const previousElapsed = Math.max(0, Number(pet.hungerElapsedMs) || 0);
    const totalElapsed = previousElapsed + elapsed;
    const consumedPoints = Math.floor(totalElapsed / PET_HUNGER_POINT_INTERVAL_MS);
    pet.hunger = Math.max(0, hunger - consumedPoints);
    pet.hungerElapsedMs = pet.hunger === 0 ? 0 : totalElapsed % PET_HUNGER_POINT_INTERVAL_MS;
  },

  getActivePetBonus(state) {
    const pState = this.getPetState(state);
    if (!pState.activePetId || !pState.pets[pState.activePetId]) return null;

    const pet = pState.pets[pState.activePetId];
    const def = PET_CATALOG[pet.id];
    if (!def) return null;

    const lvl = pet.level || 1;
    const hungerRatio = getPetHunger(pet) / 100;
    if (hungerRatio <= 0) return null;
    const buffVal = (def.buff.baseVal + (lvl * def.buff.valPerLvl)) * hungerRatio;
    const petAtk = (def.baseAtk + (lvl * def.atkPerLvl)) * hungerRatio;

    return {
      id: pet.id,
      name: pet.name,
      level: lvl,
      stat: def.buff.stat,
      val: buffVal,
      atk: petAtk,
      hunger: Math.round(hungerRatio * 100),
      desc: def.buff.desc
    };
  }
};
