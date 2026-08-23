// PetService.js — Gerenciador de Mascotes & Companheiros de Batalha
import { PET_CATALOG } from '../data/pets.js';

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
    if ((state.gold || 0) < cost) {
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
    if ((state.gold || 0) < feedCost) {
      if (callbacks.log) callbacks.log('Adena insuficiente para comprar Ração Especial de Pet (5.000 Adena).', 'warning');
      return { success: false, reason: 'insufficient_gold' };
    }

    state.gold -= feedCost;
    const pet = pState.pets[pState.activePetId];
    pet.hunger = 100;
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
    const reqXp = pet.level * pet.level * 400;

    if (pet.xp >= reqXp && pet.level < 60) {
      pet.xp -= reqXp;
      pet.level++;
      if (callbacks.log) callbacks.log(`🌟 Seu companheiro **${pet.name}** subiu para o **Nível ${pet.level}**!`, 'rarity-epic');
      if (callbacks.floatText) callbacks.floatText(`🐾 PET LEVEL UP! (Lv.${pet.level})`, 'float-epic');
    }
  },

  getActivePetBonus(state) {
    const pState = this.getPetState(state);
    if (!pState.activePetId || !pState.pets[pState.activePetId]) return null;

    const pet = pState.pets[pState.activePetId];
    const def = PET_CATALOG[pet.id];
    if (!def) return null;

    const lvl = pet.level || 1;
    const buffVal = def.buff.baseVal + (lvl * def.buff.valPerLvl);
    const petAtk = def.baseAtk + (lvl * def.atkPerLvl);

    return {
      id: pet.id,
      name: pet.name,
      level: lvl,
      stat: def.buff.stat,
      val: buffVal,
      atk: petAtk,
      desc: def.buff.desc
    };
  }
};
