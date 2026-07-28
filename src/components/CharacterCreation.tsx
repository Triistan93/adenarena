import React, { useState } from 'react';

export interface CharacterCreationData {
  charName: string;
  race: string;
  className: string;
}

interface CharacterCreationProps {
  onComplete: (data: CharacterCreationData) => void;
  onCancel?: () => void;
}

const RACES_INFO: Record<string, {
  id: string;
  name: string;
  icon: string;
  desc: string;
  perks: string[];
  allowedClasses: { id: string; name: string; desc: string; icon: string }[];
  image: Record<string, string>;
  startZoneName: string;
}> = {
  human: {
    id: 'human',
    name: 'Humano',
    icon: '🧑‍🌾',
    desc: 'Versáteis e equilibrados em todas as disciplinas de combate e magia.',
    perks: ['⚔️ Status Físicos Equilibrados', '🛡️ Excelente Adaptabilidade', '🏰 Inicia na Ilha de Falar'],
    allowedClasses: [
      { id: 'fighter', name: 'Guerreiro (Fighter)', desc: 'Combate corpo a corpo com espada e escudo.', icon: '⚔️' },
      { id: 'mage', name: 'Mago (Mage)', desc: 'Dominador de magia elemental e mana elevado.', icon: '🔮' }
    ],
    image: {
      fighter: '/img/human_fighter.png',
      mage: '/img/human_mage.png'
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  elf: {
    id: 'elf',
    name: 'Elfo',
    icon: '🧝‍♂️',
    desc: 'Graciosos e extremamente ágeis, abençoados pela deusa Eva.',
    perks: ['🍃 +8 Esquiva Nativa', '⚡ Alta Velocidade de Movimento', '🌲 Inicia na Floresta Elfica'],
    allowedClasses: [
      { id: 'fighter', name: 'Guerreiro Elfo (Fighter)', desc: 'Defensor gracioso e arqueiro veloz.', icon: '🏹' },
      { id: 'mage', name: 'Mago Elfo (Mage)', desc: 'Dominador de magia de água e cura sagrada.', icon: '🌊' }
    ],
    image: {
      fighter: '/img/elf_fighter.png',
      mage: '/img/elf_mage.png'
    },
    startZoneName: 'Floresta dos Elfos (Elven Forest)'
  },
  darkelf: {
    id: 'darkelf',
    name: 'Elfo Negro',
    icon: '🧝‍♀️',
    desc: 'Seguidores de Shillien, mestres do dano crítico e feitiços sombrios.',
    perks: ['🔥 +6 Ataque Mágico & +2 Atq. Físico', '💥 Alta Taxa de Dano Crítico', '🌑 Inicia na Floresta Sombria'],
    allowedClasses: [
      { id: 'fighter', name: 'Guerreiro Sombrio (Fighter)', desc: 'Assassino mortal e cavaleiro sombrio.', icon: '🗡️' },
      { id: 'mage', name: 'Mago Negro (Dark Mage)', desc: 'Feiticeiro devastador do vento e maldições.', icon: '💀' }
    ],
    image: {
      fighter: '/img/darkelf_fighter.png',
      mage: '/img/darkelf_mage.png'
    },
    startZoneName: 'Floresta Sombria (Dark Forest)'
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    icon: '👹',
    desc: 'Guerreiros de força física incomparável e resistência implacável.',
    perks: ['💪 +6 Defesa & +4 Ataque Físico', '❤️ Vida (HP) e Tenacidade Elevados', '🌋 Inicia na Vila dos Orcs'],
    allowedClasses: [
      { id: 'fighter', name: 'Guerreiro Orc (Fighter)', desc: 'Lutador com armas de duas mãos e garras.', icon: '🪓' },
      { id: 'mage', name: 'Xamã Orc (Shaman)', desc: 'Místico tribal que evoca totens e maldições.', icon: '🔥' }
    ],
    image: {
      fighter: '/img/orc_fighter.png',
      mage: '/img/orc_mage.png'
    },
    startZoneName: 'Vila dos Orcs (Orc Village)'
  },
  dwarf: {
    id: 'dwarf',
    name: 'Anão',
    icon: '🧔',
    desc: 'Mestres forjadores de Aden com grande capacidade de armazenamento.',
    perks: ['🎒 +100 Slots de Inventário (250 Slots Cap.)', '💎 +15% Bônus de Drop de Materiais', '⛏️ Inicia na Mina dos Anões'],
    allowedClasses: [
      { id: 'artisan', name: 'Artesão (Artisan)', desc: 'Especialista em manufatura e forja de armaduras.', icon: '⚒️' },
      { id: 'fighter', name: 'Guerreiro Anão (Fighter)', desc: 'Combatente resistente com marretas e machados.', icon: '🔨' }
    ],
    image: {
      artisan: '/img/dwarf_artisan.png',
      fighter: '/img/dwarf_artisan.png'
    },
    startZoneName: 'Mina dos Anões (Dwarven Mine)'
  },
  kamael: {
    id: 'kamael',
    name: 'Kamael',
    icon: '🪶',
    desc: 'Guerreiros de uma asa só, especializados em lâminas duplas e almas.',
    perks: ['🦅 +6 Ataque & +6 Esquiva', '🗡️ Especialista em Lâminas e Bestas', '🏛️ Inicia no Refúgio Kamael'],
    allowedClasses: [
      { id: 'soulbreaker', name: 'Soulbreaker', desc: 'Mestre em lâminas duplas e absorção de almas.', icon: '⚡' },
      { id: 'fighter', name: 'Guerreiro Kamael (Fighter)', desc: 'Combatente veloz de espadas de uma mão.', icon: '🗡️' }
    ],
    image: {
      soulbreaker: '/img/kamael_soulbreaker.png',
      fighter: '/img/kamael_soulbreaker.png'
    },
    startZoneName: 'Refúgio Kamael (Kamael Village)'
  }
};

const RANDOM_NAMES = [
  'Aethelgard', 'Sylvana', 'Varian', 'Kaela', 'Thorin', 'Elyndra', 'Bronn', 
  'Malakor', 'Zarek', 'Valerius', 'Sylas', 'Aerith', 'Durgrim', 'Kaelen', 
  'Lucian', 'Morgana', 'Garrick', 'Freya', 'Darian', 'Valerya', 'Oberon'
];

export function CharacterCreation({ onComplete, onCancel }: CharacterCreationProps) {
  const [charName, setCharName] = useState('SirVarian');
  const [selectedRace, setSelectedRace] = useState('human');
  const [selectedClass, setSelectedClass] = useState('fighter');

  const currentRaceObj = RACES_INFO[selectedRace] || RACES_INFO.human;

  const handleSelectRace = (raceId: string) => {
    setSelectedRace(raceId);
    const raceData = RACES_INFO[raceId];
    if (raceData && raceData.allowedClasses.length > 0) {
      setSelectedClass(raceData.allowedClasses[0].id);
    }
  };

  const handleGenerateRandomName = () => {
    const idx = Math.floor(Math.random() * RANDOM_NAMES.length);
    setCharName(RANDOM_NAMES[idx]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = charName.trim() || 'Herói de Aden';
    onComplete({
      charName: finalName,
      race: selectedRace,
      className: selectedClass
    });
  };

  const currentImg = currentRaceObj.image[selectedClass] || currentRaceObj.image.fighter || '/img/human_fighter.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-amber-500/30 bg-[#0b0e17] p-6 shadow-2xl text-white">
        
        {/* Banner Header */}
        <div className="mb-6 text-center border-b border-amber-500/20 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
            ✨ Lineage II · Aden Arena
          </div>
          <h2 className="font-display text-2xl font-bold tracking-wide text-amber-100">
            Criação & Customização de Personagem
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Escolha seu nome, raça e classe inicial para iniciar sua jornada no mundo de Aden.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Character Details & Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Nome do Personagem */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                1. Nome do Personagem
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  placeholder="Digite o nome do seu herói..."
                  className="flex-1 rounded-xl border border-amber-500/30 bg-black/50 px-4 py-2.5 text-sm font-semibold text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateRandomName}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5"
                  title="Gerar nome aleatório"
                >
                  🎲 Aleatório
                </button>
              </div>
            </div>

            {/* 2. Escolha da Raça */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                2. Escolha a Raça ({currentRaceObj.name})
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(RACES_INFO).map((r) => {
                  const isSelected = selectedRace === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRace(r.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/50 shadow-lg'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl mb-1">{r.icon}</span>
                      <span className="text-xs font-bold">{r.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Escolha da Classe Inicial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                3. Classe Inicial
              </label>
              <div className="grid grid-cols-2 gap-3">
                {currentRaceObj.allowedClasses.map((cls) => {
                  const isSelected = selectedClass === cls.id;
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClass(cls.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/50'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-amber-500/40 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{cls.icon}</span>
                        <span className="text-xs font-bold text-amber-300">{cls.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight">
                        {cls.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Race Perks Summary */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
              <span className="font-bold text-amber-300 block mb-1">✨ Bônus Raciais de {currentRaceObj.name}:</span>
              {currentRaceObj.perks.map((perk, idx) => (
                <div key={idx} className="text-slate-300 text-[11px]">
                  • {perk}
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Hero Live Portrait & Summary (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center">
            
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">
                Preview do Herói
              </div>

              {/* Character Card / Artwork */}
              <div className="relative mx-auto w-48 h-56 rounded-xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-black/60 to-black p-2 flex flex-col items-center justify-center shadow-xl overflow-hidden group">
                <img
                  src={currentImg}
                  alt={currentRaceObj.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2 inset-x-2 text-center">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide drop-shadow">
                    {charName || 'Herói'}
                  </span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-4 text-xs space-y-1.5 border-t border-white/10 pt-3 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Raça:</span>
                  <span className="font-bold text-amber-200">{currentRaceObj.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Classe:</span>
                  <span className="font-bold text-amber-200">
                    {currentRaceObj.allowedClasses.find(c => c.id === selectedClass)?.name || selectedClass}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Zona Inicial:</span>
                  <span className="font-bold text-slate-200">{currentRaceObj.startZoneName}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-lg hover:from-amber-500 hover:to-yellow-400 transition transform active:scale-95"
              >
                ✨ Criar Personagem & Entrar em Aden
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 hover:text-white transition"
                >
                  Cancelar
                </button>
              )}
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
