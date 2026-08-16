import React, { useState } from 'react';

export interface CharacterCreationData {
  charName: string;
  race: string;
  className: string;
  gender: 'M' | 'F';
}

interface CharacterCreationProps {
  onComplete: (data: CharacterCreationData) => void;
  onCancel?: () => void;
  isChangeScroll?: boolean;
  initialCharName?: string;
  initialRace?: string;
  initialClass?: string;
  initialGender?: 'M' | 'F';
}

const RACES_INFO: Record<string, {
  id: string;
  name: string;
  icon: string;
  desc: string;
  perks: string[];
  allowedClasses: { id: string; name: string; desc: string; icon: string }[];
  image: Record<string, { M: string; F: string }>;
  startZoneName: string;
}> = {
  human: {
    id: 'human',
    name: 'Humano',
    icon: '🧑‍🌾',
    desc: 'Versáteis e equilibrados em todas as disciplinas de combate e magia.',
    perks: ['⚔️ Status Físicos Equilibrados', '🛡️ Excelente Adaptabilidade', '🏰 Inicia na Ilha de Falar'],
    allowedClasses: [
      { id: 'fighter', name: 'Guerreiro (Fighter)', desc: 'Combate corpo a corpo com espada, escudo e alta vitalidade.', icon: '⚔️' },
      { id: 'mage', name: 'Mago (Mage)', desc: 'Dominador de magia elemental e grande reserva de mana.', icon: '🔮' },
      { id: 'deathPilgrim', name: 'Death Knight 💀', desc: 'Cavaleiro da Morte alimentado por Dark Points e golpes gélidos.', icon: '💀' },
      { id: 'wargBase', name: 'Warg 🐺', desc: 'Lutador primitivo e feroz com instintos lupinos e regeneração.', icon: '🐺' },
      { id: 'assassinS0', name: 'Assassin 🗡️', desc: 'Caçador das sombras mortal com adagas velozes e clones sombrios.', icon: '🗡️' }
    ],
    image: {
      fighter: { M: '/img/humanpalaM.png', F: '/img/humanpalaF.png' },
      mage: { M: '/img/humanmageM.png', F: '/img/humanmageF.png' },
      deathPilgrim: { M: '/img/humanpalaM.png', F: '/img/humanpalaF.png' },
      wargBase: { M: '/img/humanpalaM.png', F: '/img/humanpalaF.png' },
      assassinS0: { M: '/img/humanpalaM.png', F: '/img/humanpalaF.png' },
      assassinBase: { M: '/img/humanpalaM.png', F: '/img/humanpalaF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  elf: {
    id: 'elf',
    name: 'Elfo',
    icon: '🧝‍♂️',
    desc: 'Graciosos e extremamente ágeis, abençoados pela deusa Eva.',
    perks: ['🍃 +8 Esquiva Nativa', '⚡ Alta Velocidade de Movimento', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'elfFighter', name: 'Guerreiro Elfo (Fighter)', desc: 'Defensor gracioso e arqueiro veloz com precisão letal.', icon: '🏹' },
      { id: 'elfMage', name: 'Mago Elfo (Mage)', desc: 'Dominador de magia de água, luz sagrada e suporte rápido.', icon: '🌊' }
    ],
    image: {
      elfFighter: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      elfMage: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' },
      fighter: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      mage: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  darkelf: {
    id: 'darkelf',
    name: 'Elfo Negro',
    icon: '🧝‍♀️',
    desc: 'Mestres de magia negra e ataques críticos devastadores de Shillien.',
    perks: ['🔥 +15 Poder de Ataque & Magia', '🗡️ Alto Poder Crítico', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'darkElfFighter', name: 'Guerreiro Negro (Fighter)', desc: 'Assassino mortal e cavaleiro sombrio focado em dano crítico.', icon: '🗡️' },
      { id: 'darkElfMage', name: 'Mago Negro (Mage)', desc: 'Invocador de maldições e magia de fogo/trevas de alto impacto.', icon: '🔮' },
      { id: 'deathPilgrim', name: 'Death Knight 💀', desc: 'Cavaleiro da Morte Dark Elf com maestria em magias sombrias.', icon: '💀' },
      { id: 'assassinS0', name: 'Assassin 🗡️', desc: 'Assassina mortal das sombras com venenos e golpes críticos.', icon: '🗡️' },
      { id: 'bloodRoseBase', name: 'Blood Rose 🌹', desc: 'Mística devota de Shillien com magia de espinhos negros e drenagem de sangue.', icon: '🌹' }
    ],
    image: {
      darkElfFighter: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      darkElfMage: { M: '/img/darkelfmageM.png', F: '/img/darkelfmageF.png' },
      deathPilgrim: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      elfDeathPilgrim: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      assassinS0: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      assassinBase: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      bloodRoseBase: { M: '/img/darkelfmageM.png', F: '/img/darkelfmageF.png' },
      bloodRoseS1: { M: '/img/darkelfmageM.png', F: '/img/darkelfmageF.png' },
      fighter: { M: '/img/darkelfskM.png', F: '/img/darkelfskF.png' },
      mage: { M: '/img/darkelfmageM.png', F: '/img/darkelfmageF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  orc: {
    id: 'orc',
    name: 'Orc',
    icon: '👹',
    desc: 'Guerreiros de força bruta descomunal e constituição vital superior.',
    perks: ['💪 +100 Vida Máxima (HP)', '🛡️ Resiliência em Batalha Prolongada', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'orcFighter', name: 'Guerreiro Orc (Fighter)', desc: 'Destruidor com machados de duas mãos e fúria guerreira.', icon: '🪓' },
      { id: 'orcMage', name: 'Xamã Orc (Shaman)', desc: 'Mago de combate e buffs tribais de sangue e resistência.', icon: '🔥' },
      { id: 'rider', name: 'Vanguard Rider 🐉', desc: 'Cavaleiro Orc montado especialista em investidas e estocadas de lança.', icon: '🐉' }
    ],
    image: {
      orcFighter: { M: '/img/orcfighterM.png', F: '/img/orcfighterF.png' },
      orcMage: { M: '/img/orc_mage.png', F: '/img/orc_mage.png' },
      rider: { M: '/img/orcfighterM.png', F: '/img/orcfighterF.png' },
      orcRider: { M: '/img/orcfighterM.png', F: '/img/orcfighterF.png' },
      fighter: { M: '/img/orcfighterM.png', F: '/img/orcfighterF.png' },
      mage: { M: '/img/orc_mage.png', F: '/img/orc_mage.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  dwarf: {
    id: 'dwarf',
    name: 'Anão',
    icon: '⚒️',
    desc: 'Mestres da forja, especialistas em mineração e criação de itens.',
    perks: ['🎒 +100 Espaços de Inventário', '⚒️ Bônus de Craft & Drop de Materiais', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'dwarfFighter', name: 'Artesão (Artisan)', desc: 'Especialista em forja de armas, armaduras pesadas e martelos.', icon: '⚒️' },
      { id: 'shinemakerS1', name: 'ShineMaker ✨', desc: 'Mestre da luz cristalina, suporte celestial e martelo luminoso.', icon: '✨' }
    ],
    image: {
      dwarfFighter: { M: '/img/dwarfmaestroM.png', F: '/img/dwarfmaestroF.png' },
      artisan: { M: '/img/dwarfmaestroM.png', F: '/img/dwarfmaestroF.png' },
      fighter: { M: '/img/dwarfmaestroM.png', F: '/img/dwarfmaestroF.png' },
      shinemakerS1: { M: '/img/dwarfmaestroM.png', F: '/img/dwarfmaestroF.png' },
      shineMakerBase: { M: '/img/dwarfmaestroM.png', F: '/img/dwarfmaestroF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  kamael: {
    id: 'kamael',
    name: 'Kamael',
    icon: '🪶',
    desc: 'Raça de uma asa só com maestria lendária em lâminas rápidas e rapieiras.',
    perks: ['⚡ Usam Armaduras LEVES por Lore', '🗡️ Ataques Físicos Ultrarrápidos', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'kamaelSoldier', name: 'Soldier / Soulbreaker', desc: 'Espadachim das sombras especializado em rapieiras e absorção de almas.', icon: '🗡️' },
      { id: 'samuraiBase', name: 'Samurai ⛩️', desc: 'Mestre da katana ancestral e técnica de corte veloz Iaijutsu.', icon: '⛩️' }
    ],
    image: {
      kamaelSoldier: { M: '/img/kamaelshM.png', F: '/img/kamaelshF.png' },
      soulbreaker: { M: '/img/kamaelshM.png', F: '/img/kamaelshF.png' },
      fighter: { M: '/img/kamaelDM.png', F: '/img/kamaelDF.png' },
      samuraiBase: { M: '/img/kamaelDM.png', F: '/img/kamaelDF.png' },
      hatamoto: { M: '/img/kamaelDM.png', F: '/img/kamaelDF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  sylph: {
    id: 'sylph',
    name: 'Sylph',
    icon: '🔫',
    desc: 'Atiradores elementais dos ventos com armas de fogo.',
    perks: ['💨 +12 Esquiva & Velocidade', '🔫 Atiradores Elementais Ranged', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'sylphGunner', name: 'Storm Blaster 🔫', desc: 'Atirador elemental com armas de fogo rápidas e tiros de vento.', icon: '🔫' }
    ],
    image: {
      sylphGunner: { M: '/img/sylphM.png', F: '/img/sylphF.png' },
      fighter: { M: '/img/sylphM.png', F: '/img/sylphF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  highelf: {
    id: 'highelf',
    name: 'High Elf',
    icon: '✨',
    desc: 'Elfos supremos detentores da luz divina e maestria elemental.',
    perks: ['🌟 +8 Magia & Defesa Divina', '🛡️ Guardiões Sagrados de Aden', '🏝️ Inicia na Ilha de Falar (Lv. 1)'],
    allowedClasses: [
      { id: 'divineTemplarS1', name: 'Divine Templar 🛡️', desc: 'Guardião sagrado supremo e tanque inabalável com Sacred Aegis.', icon: '🛡️' },
      { id: 'elementWeaverS1', name: 'Element Weaver 🌀', desc: 'Mago supremo combinando os três pilares de Fogo, Água e Vento.', icon: '🌀' }
    ],
    image: {
      divineTemplarS1: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      elementWeaverS1: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' },
      fighter: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      mage: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  },
  ertheia: {
    id: 'ertheia',
    name: 'Ertheia',
    icon: '🌪️',
    desc: 'Guerreiras e místicas ágeis tocadas pelos ventos e espíritos de Sayha.',
    perks: ['🌪️ +10 Esquiva Nativa', '🥊 Combate Marcial e Artes Corporais', '🏰 Inicia na Ilha de Falar'],
    allowedClasses: [
      { id: 'marauderBase', name: 'Marauder / Eviscerator 🌪️', desc: 'Lutadora com garras, punhos velozes e combos de furacão.', icon: '🥊' },
      { id: 'sayhaSeer', name: 'Sayha Seeker 🌀', desc: 'Invocadora de vendavais e espíritos protetores de Sayha.', icon: '🌀' }
    ],
    image: {
      marauderBase: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      marauder: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      sayhaMageBase: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' },
      sayhaSeer: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' },
      fighter: { M: '/img/elfwswM.png', F: '/img/elfswsF.png' },
      mage: { M: '/img/elfmageM.png', F: '/img/elfmageF.png' }
    },
    startZoneName: 'Ilha de Falar (Talking Island)'
  }
};

const RANDOM_NAMES = [
  'Astaroth', 'Valerius', 'Kaelen', 'Sylas', 'Lyrion',
  'Ignis', 'Morgana', 'Vaelin', 'Darian', 'Balthazar',
  'Thorne', 'Elysia', 'Gideon', 'Zephyr', 'Orion',
  'Aethelgard', 'Aerion', 'Caelum', 'Elowen', 'Fenris',
  'Galadriel', 'Isolden', 'Malakor', 'Naelis', 'Thalor',
  'Azrael', 'Belial', 'Kaelen', 'Malakor', 'Moros',
  'Nocturna', 'Oberon', 'Ravena', 'Soren', 'Vesper',
  'Aethelstan', 'Boran', 'Cassian', 'Draven', 'Eldrin',
  'Garrick', 'Kaelith', 'Ragnar', 'Valen', 'Varian',
  'Astraea', 'Celestia', 'Eridanus', 'Hesperos', 'Lyra',
  'Nebula', 'Solon', 'Tenebris', 'Vael', 'Zorion'
];

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onComplete,
  onCancel,
  isChangeScroll = false,
  initialCharName = '',
  initialRace = 'human',
  initialClass = 'fighter',
  initialGender = 'M'
}) => {
  const [charName, setCharName] = useState(initialCharName);
  const [selectedRace, setSelectedRace] = useState(initialRace);
  const [selectedClass, setSelectedClass] = useState(initialClass);
  const [gender, setGender] = useState<'M' | 'F'>(initialGender);

  const currentRaceObj = RACES_INFO[selectedRace] || RACES_INFO.human;

  const handleSelectRace = (raceId: string) => {
    setSelectedRace(raceId);
    const rInfo = RACES_INFO[raceId];
    if (rInfo && rInfo.allowedClasses.length > 0) {
      if (!rInfo.allowedClasses.some(c => c.id === selectedClass)) {
        setSelectedClass(rInfo.allowedClasses[0].id);
      }
    }
  };

  const handleGenerateRandomName = () => {
    if (isChangeScroll) return;
    const idx = Math.floor(Math.random() * RANDOM_NAMES.length);
    setCharName(RANDOM_NAMES[idx]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = charName.trim() || 'Herói de Aden';
    onComplete({
      charName: finalName,
      race: selectedRace,
      className: selectedClass,
      gender: gender
    });
  };

  // Pega a imagem baseada na classe e no gênero (com fallbacks de segurança)
  const currentImgObj = currentRaceObj.image[selectedClass] || currentRaceObj.image.fighter;
  const currentImg = currentImgObj?.[gender] || '/img/human_fighter.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-amber-500/30 bg-[#0b0e17] p-6 shadow-2xl text-white">
        
        {/* Banner Header */}
        <div className="mb-6 text-center border-b border-amber-500/20 pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
            {isChangeScroll ? '📜 Scroll of Race & Class Change' : '✨ Lineage II · Aden Arena'}
          </div>
          <h2 className="font-display text-2xl font-bold tracking-wide text-amber-100">
            {isChangeScroll ? 'Troca de Raça & Classe' : 'Criação & Customização de Personagem'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isChangeScroll
              ? 'Selecione a nova raça e classe. O nome do personagem permanece inalterado.'
              : 'Escolha seu nome, gênero, raça e classe inicial para iniciar sua jornada.'}
          </p>
        </div>

        {isChangeScroll && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-200 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-300">AVISO DE REESPECIALIZAÇÃO:</p>
              <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                Ao confirmar a troca de Raça &amp; Classe, <strong>todas as suas habilidades serão resetadas</strong>, todo o <strong>SP gasto será totalmente devolvido</strong> e seus <strong>equipamentos atuais serão desequipados</strong> com segurança para o seu inventário.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Character Details & Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Nome do Personagem */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                1. Nome do Personagem {isChangeScroll && '(🔒 Fixo)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={charName}
                  onChange={(e) => !isChangeScroll && setCharName(e.target.value)}
                  disabled={isChangeScroll}
                  placeholder="Digite o nome do seu herói..."
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    isChangeScroll
                      ? 'bg-slate-900/90 border-slate-700 text-amber-300/80 cursor-not-allowed'
                      : 'bg-black/50 border-amber-500/30 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400'
                  }`}
                  required
                />
                {!isChangeScroll && (
                  <button
                    type="button"
                    onClick={handleGenerateRandomName}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-3 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1.5"
                    title="Gerar nome aleatório"
                  >
                    🎲 Aleatório
                  </button>
                )}
              </div>
            </div>

            {/* 2. Escolha do Gênero */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                2. Gênero
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`flex-1 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                    gender === 'M'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-200 ring-1 ring-blue-500/50'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-blue-500/40 hover:bg-blue-500/10'
                  }`}
                >
                  ♂️ Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`flex-1 py-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition ${
                    gender === 'F'
                      ? 'border-pink-500 bg-pink-500/20 text-pink-200 ring-1 ring-pink-500/50'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-pink-500/40 hover:bg-pink-500/10'
                  }`}
                >
                  ♀️ Feminino
                </button>
              </div>
            </div>

            {/* 3. Escolha da Raça */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                3. Escolha a Raça ({currentRaceObj.name})
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

            {/* 4. Escolha da Classe Inicial */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                4. Classe Inicial
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
                  key={`${selectedRace}_${selectedClass}_${gender}_${currentImg}`}
                  src={currentImg}
                  alt={currentRaceObj.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.onerror = null;
                    img.src = '/img/humanpalaM.png';
                    img.style.display = 'block';
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
                  <span className="text-slate-400">Gênero:</span>
                  <span className="font-bold text-amber-200">{gender === 'M' ? 'Masculino ♂️' : 'Feminino ♀️'}</span>
                </div>
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

export default function App() {
  const [created, setCreated] = useState<CharacterCreationData | null>(null);

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0e17] p-4 text-white text-center">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-black/50 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Personagem Criado!</h2>
          <pre className="text-left text-amber-100 bg-black/80 p-4 rounded-xl border border-white/10 text-sm overflow-x-auto">
            {JSON.stringify(created, null, 2)}
          </pre>
          <button 
            onClick={() => setCreated(null)}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold uppercase tracking-wider rounded-xl transition shadow-lg"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <CharacterCreation 
      onComplete={(data) => setCreated(data)} 
    />
  );
}
