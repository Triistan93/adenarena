/**
 * PrototypeSkillRegistry.js
 * 
 * Formal Skill Catalog for all vertical slice hero classes:
 * - Fire Sorcerer (Fireball, Magma Spike, Meteor)
 * - Paladin (Sword Strike, Shield Bash, Holy Blade, Sanctuary Aegis)
 * - Assassin (Dagger Slash, Shadow Step, Backstab, Shadow Tempest)
 * - Spellsinger (Lightning Spark, Chain Lightning, Thunder Orb, Judgement of Thor)
 * - Death Knight (Dark Strike, Vampiric Slash, Blood Barrier, Crimson Supernova)
 */

export const PROTOTYPE_SKILL_REGISTRY = {
  // === 1. FIRE SORCERER SKILLS ===
  fire_attack: {
    id: 'fire_attack',
    name: 'Ataque Físico',
    icon: '⚔️',
    description: 'Golpe físico básico com o cajado',
    tier: 'basic',
    element: 'Physical',
    castAnimation: 'ATTACK',
    castDurationMs: 250,
    sourceAnchor: 'castPoint',
    targetAnchor: 'chest',
    damageMultiplier: 1.0,
    baseDamage: 220,
    vfx: { family: 'melee_spark', coreColor: '#ffaa00' },
    camera: { shakeIntensity: 2, shakeDurationMs: 150 }
  },

  fireball: {
    id: 'fireball',
    name: 'Fireball',
    icon: '🔥',
    description: 'Projétil incandescente disparado da ponta do cajado visando o tórax',
    tier: 'basic',
    element: 'Fire',
    castAnimation: 'CAST',
    castDurationMs: 450,
    sourceAnchor: 'castPoint',
    targetAnchor: 'chest',
    damageMultiplier: 1.8,
    baseDamage: 450,
    vfx: {
      family: 'projectile',
      coreColor: '#ff7700',
      glowColor: '#ffcc00',
      smokeColor: 'rgba(50, 20, 10, 0.6)',
      speed: 1150,
      radius: 14,
      impactRadius: 42
    },
    camera: { shakeIntensity: 5, shakeDurationMs: 220 }
  },

  magma_spike: {
    id: 'magma_spike',
    name: 'Magma Spike',
    icon: '🌋',
    description: 'Fissura vulcânica sísmica irrompendo diretamente sob os pés',
    tier: 'specialization',
    element: 'Fire',
    castAnimation: 'CAST',
    castDurationMs: 550,
    sourceAnchor: 'castPoint',
    targetAnchor: 'feet',
    damageMultiplier: 2.6,
    baseDamage: 880,
    staggerBonus: 45,
    vfx: {
      family: 'ground_eruption',
      coreColor: '#ff4400',
      glowColor: '#ffaa00',
      fissureWidth: 120,
      spikeCount: 5
    },
    camera: { shakeIntensity: 7, shakeDurationMs: 300 }
  },

  meteor: {
    id: 'meteor',
    name: 'Meteor',
    icon: '☄️',
    description: 'Cataclismo 4★: Zoom dinâmico, tela escurecida e impacto estelar devastador',
    tier: 'ultimate_4star',
    element: 'Fire',
    castAnimation: 'CAST_ULTIMATE',
    castDurationMs: 1100,
    sourceAnchor: 'sky',
    targetAnchor: 'center',
    groundAnchor: 'feet',
    damageMultiplier: 6.8,
    baseDamage: 2900,
    staggerBonus: 70,
    vfx: {
      family: 'skyfall_ultimate',
      darkenIntensity: 0.65,
      shockwaveRings: 3,
      fireGlowColor: '#ff3300'
    },
    camera: { zoom: 1.08, zoomDurationMs: 800, shakeIntensity: 16, shakeDurationMs: 650 }
  },

  // === 2. PALADIN SKILLS ===
  sword_strike: {
    id: 'sword_strike',
    name: 'Corte de Espada',
    icon: '⚔️',
    description: 'Golpe pesado de espada bastarda',
    tier: 'basic',
    element: 'Physical',
    castAnimation: 'ATTACK',
    castDurationMs: 300,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 1.1,
    baseDamage: 280,
    vfx: { family: 'slash_spark', coreColor: '#ffd700' },
    camera: { shakeIntensity: 3, shakeDurationMs: 160 }
  },

  shield_bash: {
    id: 'shield_bash',
    name: 'Shield Bash',
    icon: '🛡️',
    description: 'Investida esmagadora com o escudo que atordoa o inimigo por 3s',
    tier: 'specialization',
    element: 'Physical',
    castAnimation: 'DEFEND',
    castDurationMs: 400,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 1.9,
    baseDamage: 620,
    staggerBonus: 60,
    isStun: true,
    vfx: { family: 'shield_impact', coreColor: '#eab308' },
    camera: { shakeIntensity: 8, shakeDurationMs: 250 }
  },

  holy_blade: {
    id: 'holy_blade',
    name: 'Holy Blade',
    icon: '✨',
    description: 'Lâmina sagrada envolta em luz dourada que desce dos céus',
    tier: 'specialization',
    element: 'Holy',
    castAnimation: 'CAST',
    castDurationMs: 600,
    sourceAnchor: 'sky',
    targetAnchor: 'chest',
    damageMultiplier: 2.8,
    baseDamage: 980,
    vfx: { family: 'holy_ray', coreColor: '#fef08a', glowColor: '#eab308' },
    camera: { shakeIntensity: 7, shakeDurationMs: 300 }
  },

  sanctuary_aegis: {
    id: 'sanctuary_aegis',
    name: 'Sanctuary Aegis',
    icon: '🏰',
    description: 'Ultimate 4★: Domo sagrado celestial, colunas de luz divina e restauração total de vida',
    tier: 'ultimate_4star',
    element: 'Holy',
    castAnimation: 'CAST_ULTIMATE',
    castDurationMs: 1000,
    sourceAnchor: 'center',
    targetAnchor: 'center',
    damageMultiplier: 5.5,
    baseDamage: 2400,
    healHeroPct: 40,
    vfx: { family: 'holy_sanctuary', coreColor: '#ffffff', glowColor: '#fbbf24' },
    camera: { zoom: 1.06, zoomDurationMs: 700, shakeIntensity: 12, shakeDurationMs: 500 }
  },

  // === 3. ASSASSIN SKILLS ===
  dagger_slash: {
    id: 'dagger_slash',
    name: 'Corte Rápido',
    icon: '🗡️',
    description: 'Corte ágil de adagas duplas com alta taxa de acerto crítico',
    tier: 'basic',
    element: 'Physical',
    castAnimation: 'ATTACK',
    castDurationMs: 220,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 1.2,
    baseDamage: 310,
    vfx: { family: 'dagger_slice', coreColor: '#9333ea' },
    camera: { shakeIntensity: 2, shakeDurationMs: 120 }
  },

  shadow_step: {
    id: 'shadow_step',
    name: 'Shadow Step',
    icon: '👤',
    description: 'Dissolve-se em fumaça escura e ressurge instantaneamente nas costas do alvo',
    tier: 'specialization',
    element: 'Dark',
    castAnimation: 'DEFEND',
    castDurationMs: 350,
    sourceAnchor: 'center',
    targetAnchor: 'center',
    damageMultiplier: 1.4,
    baseDamage: 450,
    vfx: { family: 'shadow_teleport', coreColor: '#581c87', smokeColor: '#1e1b4b' },
    camera: { shakeIntensity: 4, shakeDurationMs: 180 }
  },

  backstab: {
    id: 'backstab',
    name: 'Backstab Mortal',
    icon: '🩸',
    description: 'Perfuração letal de ponto fraco com dispersão de sangue e dano crítico vermelho',
    tier: 'specialization',
    element: 'Physical',
    castAnimation: 'CAST',
    castDurationMs: 400,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 3.2,
    baseDamage: 1250,
    isCritGuaranteed: true,
    vfx: { family: 'blood_splatter', coreColor: '#dc2626' },
    camera: { shakeIntensity: 9, shakeDurationMs: 260 }
  },

  shadow_tempest: {
    id: 'shadow_tempest',
    name: 'Shadow Tempest',
    icon: '🌪️',
    description: 'Ultimate 4★: 4 clones de sombra atacam o alvo em direções cruzadas em alta velocidade',
    tier: 'ultimate_4star',
    element: 'Dark',
    castAnimation: 'CAST_ULTIMATE',
    castDurationMs: 900,
    sourceAnchor: 'center',
    targetAnchor: 'center',
    damageMultiplier: 7.2,
    baseDamage: 3200,
    vfx: { family: 'shadow_clones_frenzy', coreColor: '#7e22ce', slashColor: '#c084fc' },
    camera: { zoom: 1.07, zoomDurationMs: 650, shakeIntensity: 14, shakeDurationMs: 550 }
  },

  // === 4. SPELLSINGER SKILLS ===
  lightning_spark: {
    id: 'lightning_spark',
    name: 'Faísca Elétrica',
    icon: '⚡',
    description: 'Descarga elétrica rápida concentrada no tórax',
    tier: 'basic',
    element: 'Wind',
    castAnimation: 'ATTACK',
    castDurationMs: 250,
    sourceAnchor: 'castPoint',
    targetAnchor: 'chest',
    damageMultiplier: 1.1,
    baseDamage: 260,
    vfx: { family: 'lightning_spark', coreColor: '#38bdf8' },
    camera: { shakeIntensity: 3, shakeDurationMs: 140 }
  },

  chain_lightning: {
    id: 'chain_lightning',
    name: 'Chain Lightning',
    icon: '🌩️',
    description: 'Feixe elétrico ramificado em zigue-zague com faíscas azuis',
    tier: 'specialization',
    element: 'Wind',
    castAnimation: 'CAST',
    castDurationMs: 500,
    sourceAnchor: 'castPoint',
    targetAnchor: 'chest',
    damageMultiplier: 2.3,
    baseDamage: 780,
    vfx: { family: 'chain_lightning', coreColor: '#67e8f9', glowColor: '#0284c7' },
    camera: { shakeIntensity: 6, shakeDurationMs: 240 }
  },

  thunder_orb: {
    id: 'thunder_orb',
    name: 'Thunder Orb',
    icon: '🔮',
    description: 'Esfera densa de plasma voltaico que avança e explode com choque elétrico',
    tier: 'specialization',
    element: 'Wind',
    castAnimation: 'CAST',
    castDurationMs: 600,
    sourceAnchor: 'castPoint',
    targetAnchor: 'chest',
    damageMultiplier: 2.7,
    baseDamage: 940,
    vfx: { family: 'plasma_orb', coreColor: '#38bdf8', glowColor: '#818cf8', speed: 850 },
    camera: { shakeIntensity: 8, shakeDurationMs: 280 }
  },

  judgement_thor: {
    id: 'judgement_thor',
    name: 'Judgement of Thor',
    icon: '⚡',
    description: 'Ultimate 4★: Trovão colossal rasgando o céu com relâmpago titânico e clarão estroboscópico',
    tier: 'ultimate_4star',
    element: 'Wind',
    castAnimation: 'CAST_ULTIMATE',
    castDurationMs: 1100,
    sourceAnchor: 'sky',
    targetAnchor: 'center',
    damageMultiplier: 7.0,
    baseDamage: 3100,
    vfx: { family: 'mega_lightning_strike', coreColor: '#ffffff', glowColor: '#38bdf8' },
    camera: { zoom: 1.09, zoomDurationMs: 750, shakeIntensity: 18, shakeDurationMs: 700 }
  },

  // === 5. DEATH KNIGHT SKILLS ===
  dark_strike: {
    id: 'dark_strike',
    name: 'Dark Strike',
    icon: '💀',
    description: 'Golpe espadachim corrompido com rastro arroxeado',
    tier: 'basic',
    element: 'Dark',
    castAnimation: 'ATTACK',
    castDurationMs: 280,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 1.1,
    baseDamage: 270,
    vfx: { family: 'dark_slash', coreColor: '#701a75' },
    camera: { shakeIntensity: 3, shakeDurationMs: 150 }
  },

  vampiric_slash: {
    id: 'vampiric_slash',
    name: 'Vampiric Slash',
    icon: '🩸',
    description: 'Corte sanguinário que drena vitalidade e cura o herói com orbes vermelhos de sangue',
    tier: 'specialization',
    element: 'Dark',
    castAnimation: 'CAST',
    castDurationMs: 450,
    sourceAnchor: 'weapon',
    targetAnchor: 'chest',
    damageMultiplier: 2.2,
    baseDamage: 750,
    lifestealPct: 0.5,
    vfx: { family: 'vampiric_drain', coreColor: '#ef4444', glowColor: '#991b1b' },
    camera: { shakeIntensity: 6, shakeDurationMs: 240 }
  },

  blood_barrier: {
    id: 'blood_barrier',
    name: 'Blood Barrier',
    icon: '🛡️',
    description: 'Escudo esférico de plasma sanguíneo que absorve dano e cura o cavaleiro',
    tier: 'specialization',
    element: 'Dark',
    castAnimation: 'DEFEND',
    castDurationMs: 380,
    sourceAnchor: 'center',
    targetAnchor: 'center',
    damageMultiplier: 1.5,
    baseDamage: 480,
    healHeroPct: 20,
    vfx: { family: 'blood_shield', coreColor: '#b91c1c' },
    camera: { shakeIntensity: 4, shakeDurationMs: 200 }
  },

  crimson_supernova: {
    id: 'crimson_supernova',
    name: 'Crimson Supernova',
    icon: '🩸',
    description: 'Ultimate 4★: Estacas de sangue e fogo negro irrompem do solo drenando vida de todos ao redor',
    tier: 'ultimate_4star',
    element: 'Dark',
    castAnimation: 'CAST_ULTIMATE',
    castDurationMs: 1050,
    sourceAnchor: 'center',
    targetAnchor: 'center',
    groundAnchor: 'feet',
    damageMultiplier: 6.9,
    baseDamage: 3000,
    lifestealPct: 0.4,
    vfx: { family: 'crimson_eruption', coreColor: '#ef4444', darkSmokeColor: '#450a0a' },
    camera: { zoom: 1.08, zoomDurationMs: 700, shakeIntensity: 16, shakeDurationMs: 600 }
  }
};

export function getPrototypeSkill(skillId) {
  if (!skillId) return null;
  return PROTOTYPE_SKILL_REGISTRY[skillId] || null;
}
