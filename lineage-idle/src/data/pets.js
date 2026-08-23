// pets.js — Sistema de Companheiros e Mascotes de Batalha de Aden
export const PET_CATALOG = {
  pet_wolf: {
    id: 'pet_wolf',
    name: 'Lobo de Batalha (Great Wolf)',
    archetype: 'fighter',
    icon: '🐺',
    unlockLvl: 15,
    cost: 50000,
    desc: 'Lobo feroz focado em combate físico. Desfere mordidas mortais e concede Fúria Lupina (+P.Atk e +Crit).',
    baseAtk: 45,
    atkPerLvl: 4,
    buff: {
      stat: 'patkMult',
      baseVal: 0.05,
      valPerLvl: 0.002, // +5% a +17% P.Atk
      desc: 'Fúria Lupina: Aumenta o Poder de Ataque Físico'
    },
    skillName: 'Presa Dilacerante',
    skillDesc: 'Ataque extra físico de sangramento nos turnos de combate.'
  },
  pet_kookaburra: {
    id: 'pet_kookaburra',
    name: 'Baby Kookaburra',
    archetype: 'mage_support',
    icon: '🦉',
    unlockLvl: 25,
    cost: 100000,
    desc: 'Ave mística e companheira dos magos. Restaura Mana (MP) continuamente e concede Sabedoria Arcana (+M.Atk).',
    baseAtk: 25,
    atkPerLvl: 2,
    buff: {
      stat: 'matkMult',
      baseVal: 0.06,
      valPerLvl: 0.0025, // +6% a +21% M.Atk
      desc: 'Sabedoria Arcana: Aumenta o Poder de Ataque Mágico'
    },
    skillName: 'Éter Restaurador',
    skillDesc: 'Restaura 20 a 100 de MP periodicamente durante a batalha.'
  },
  pet_buffalo: {
    id: 'pet_buffalo',
    name: 'Baby Buffalo',
    archetype: 'tank_support',
    icon: '🐂',
    unlockLvl: 25,
    cost: 100000,
    desc: 'Búfalo robusto focado em sustento. Restaura Vida (HP) com ervas curativas e aumenta a Vitalidade Máxima.',
    baseAtk: 30,
    atkPerLvl: 3,
    buff: {
      stat: 'hpMult',
      baseVal: 0.08,
      valPerLvl: 0.003, // +8% a +26% HP
      desc: 'Vitalidade Selvagem: Aumenta o HP Máximo e Defesa'
    },
    skillName: 'Bênção do Rebanho',
    skillDesc: 'Restaura 5% do HP máximo periodicamente.'
  },
  pet_hatchling: {
    id: 'pet_hatchling',
    name: 'Dragon Hatchling (Strider)',
    archetype: 'draconic',
    icon: '🐉',
    unlockLvl: 35,
    cost: 250000,
    desc: 'Filhote de Dragão ancestral. Dispara Baforadas de Fogo em área e aumenta a Velocidade de Ataque e Exploração.',
    baseAtk: 60,
    atkPerLvl: 5,
    buff: {
      stat: 'speedBoost',
      baseVal: 0.05,
      valPerLvl: 0.002, // +5% a +17% Spd & AtkSpd
      desc: 'Sopro Dracônico: Aumenta a Velocidade de Movimento e Ataque'
    },
    skillName: 'Chama Ancestral',
    skillDesc: 'Causa dano de fogo massivo que queima o monstro ativo.'
  }
};
