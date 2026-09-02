// Teste de padronização completa de 5 skills (2 Dano, 2 Buffs, 1 Cura/Vampirismo) para TODAS as classes

globalThis.window = globalThis;
globalThis.window.EchoData = {};
globalThis.window.GameData = {};

await import('../lineage-idle/data/echo-adapter.js');

const E = globalThis.window.EchoData;
const defs = E.SKILL_DEFS_ECHO;
const classSkills = E.CLASS_SKILLS_ECHO;

console.log('=== TESTE DE PADRONIZAÇÃO DE TODAS AS CLASSES (EXATAMENTE 5 SKILLS: 2 DANO, 2 BUFF, 1 CURA/VAMP) ===\n');

function isSustainSkill(s) {
  if (!s) return false;
  const name = (s.name || '').toLowerCase();
  const desc = (s.desc || s.effectText || s.effect || s.info || '').toLowerCase();
  return s.type === 'heal' || 
         name.includes('heal') || name.includes('bandage') || name.includes('drain') || 
         name.includes('vampir') || name.includes('bite') || name.includes('lifesteal') || 
         name.includes('shield') || name.includes('barrier') || name.includes('aegis') || 
         name.includes('recupera') || name.includes('absorv') || name.includes('regen') ||
         (desc.includes('hp') && (desc.includes('recupera') || desc.includes('cura') || desc.includes('roubo') || desc.includes('absorve') || desc.includes('lifesteal')));
}

function isBuffSkill(s) {
  if (!s) return false;
  return (s.type === 'buff' || s.type === 'toggle' || s.type === 'passive') && !isSustainSkill(s);
}

function isDamageSkill(s) {
  if (!s) return false;
  return s.type === 'active' && !isSustainSkill(s);
}

function getFallbackSustainSkill(classId, classDef) {
  const race = (classDef?.race || '').toLowerCase();
  const arch = (classDef?.archetype || '').toLowerCase();
  const name = (classDef?.name || '').toLowerCase();

  if (name.includes('warg')) {
    return {
      id: classId + '_vampiric_feral_bite',
      name: 'Vampiric Feral Bite',
      type: 'active',
      tier: 4,
      pwr: 45,
      cost: 35,
      max: 5,
      baseCd: 12000,
      effect: 'drain',
      info: 'Mordida feral vampírica causando 220% de dano e recuperando 35% em HP.',
      desc: 'Mordida feral que drena a vitalidade do alvo.',
      icon: 'assets/skills/vampiric_blood.jpg'
    };
  }

  if (race.includes('darkelf') || name.includes('assassin') || name.includes('abyss') || name.includes('ghost')) {
    return {
      id: classId + '_vampiric_drain',
      name: 'Vampiric Touch',
      type: 'active',
      tier: 4,
      pwr: 40,
      cost: 35,
      max: 5,
      baseCd: 10000,
      effect: 'drain',
      info: 'Toque sombrio que absorve 40% do dano em HP.',
      desc: 'Drena a essência vital do inimigo.',
      icon: 'assets/skills/vampiric_blood.jpg'
    };
  }

  if (arch.includes('mage') || arch.includes('healer') || race.includes('elf') || race.includes('highelf')) {
    return {
      id: classId + '_holy_recovery',
      name: 'Blessing Recovery',
      type: 'heal',
      tier: 4,
      pwr: 0,
      cost: 35,
      max: 5,
      baseCd: 15000,
      effect: 'heal',
      info: 'Cura divina que restaura 25% do HP máximo.',
      desc: 'Abençoa o conjurador restaurando pontos de vida.',
      icon: 'assets/skills/holy_shield.jpg'
    };
  }

  // Padrão para guerreiros / orcs / anões / kamael
  return {
    id: classId + '_combat_recovery',
    name: 'Battle Bandage',
    type: 'heal',
    tier: 4,
    pwr: 0,
    cost: 35,
    max: 5,
    baseCd: 18000,
    effect: 'heal',
    info: 'Bandagem de batalha rápida que restaura 20% do HP máximo.',
    desc: 'Trata ferimentos rapidamente durante o combate.',
    icon: 'assets/skills/holy_shield.jpg'
  };
}

console.log('Testando para Warg:');
const wargSkills = classSkills['warg'];
console.log('Warg skills antes da curadoria:', wargSkills);
