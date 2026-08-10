// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ
// echo-adapter.js ÔÇö Adapta o novo CLASSES_ECHO para o formato que o engine
//                   de lineage-idle/main.js precisa.
//
// O engine (main.js) l├¬ via window.EchoData:
//   SKILL_DEFS_ECHO        ÔÇö defini├º├Áes de skill (id ÔåÆ def)
//   SKILL_REQS_ECHO        ÔÇö pr├®-requisitos (id ÔåÆ { reqLvl })
//   SKILL_TREE_LAYOUT_ECHO ÔÇö layout da ├írvore (classKey ÔåÆ { [skillId]: {col,row} })
//   CLASS_SKILLS_ECHO      ÔÇö classe ÔåÆ [skillId, ...]
//
// Esse m├│dulo gera esses objetos a partir do campo "skills: [...]" de cada
// entrada em CLASSES_ECHO e os publica em window.EchoData.
//
// Fun├º├Áes de escalamento por n├¡vel s├úo publicadas em window.SkillScaling.
// ÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉÔòÉ

import "../src/data/classes/index.js";


// ÔöÇÔöÇÔöÇ Helpers ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

/** Converte nome de skill em snake_case ├║nico por classe */
function toSkillId(classId, skillName) {
  return classId + '_' + skillName
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Mapeia raridade textual para tier num├®rico */
function rarityToTier(rarity) {
  if (!rarity) return 0;
  if (rarity === '1Ôÿà' || rarity === '1') return 0;
  if (rarity === '2Ôÿà' || rarity === '2') return 1;
  if (rarity === '3Ôÿà' || rarity === '3') return 2;
  if (rarity === '4Ôÿà' || rarity === '4') return 3;
  return 0;
}

/** Converte cooldown string ("8s", "30 min") para ms */
function cdToMs(cd) {
  if (!cd || cd === 'N/A') return 8000;
  const s = String(cd).trim();
  if (s.includes('min')) return parseFloat(s) * 60000;
  if (s.includes('h'))   return parseFloat(s) * 3600000;
  return parseFloat(s) * 1000 || 8000;
}

/** Extrai poder num├®rico da string de efeito */
function effectToPwr(effect, type) {
  if (!effect) return 20;
  const match = effect.match(/(\d+)%/);
  if (match) return Math.round(parseInt(match[1]) / 5); // 150% ÔåÆ 30
  if (type === 'Passivo') return 0;
  return 20;
}

/** Mapa tipo textual ÔåÆ tipo interno do engine */
function mapType(t) {
  if (!t) return 'active';
  const lower = t.toLowerCase();
  if (lower === 'passivo' || lower === 'passive') return 'passive';
  if (lower === 'toggle') return 'toggle';
  if (lower === 'self-buff' || lower === 'party-buff') return 'buff';
  return 'active';
}

// ÔöÇÔöÇÔöÇ Fun├º├Áes de Escalamento por N├¡vel ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

/**
 * Calcula poder da skill no n├¡vel investido.
 * F├│rmula: basePwr * (1 + 0.10 * (lvl - 1))
 * N├¡vel 1 = 100%, N├¡vel 5 = 140% do poder base.
 * Crescimento moderado: +10% por n├¡vel.
 */
function getSkillPwrAtLevel(def, lvl) {
  const basePwr = Number(def.pwr) || 30;
  const level = Math.max(1, lvl);
  return Math.round(basePwr * (1 + 0.10 * (level - 1)));
}

/**
 * Calcula heal amount no n├¡vel investido.
 * F├│rmula mantida do original: maxHp * (0.25 + lvl * 0.05)
 */
function getSkillHealAtLevel(maxHp, lvl) {
  return Math.floor(maxHp * (0.25 + Math.max(1, lvl) * 0.05));
}

/**
 * Calcula buff amount no n├¡vel investido.
 * F├│rmula mantida do original: 0.20 + (lvl * 0.05)
 */
function getSkillBuffAtLevel(lvl) {
  return 0.20 + (Math.max(1, lvl) * 0.05);
}

/**
 * Gera texto din├ómico do efeito da skill baseado no n├¡vel atual.
 * Mostra valor atual e pr├®via do pr├│ximo n├¡vel quando aplic├ível.
 */
function buildSkillEffectText(def, lvl) {
  if (!def) return '';
  const type = def.type;
  const currentLvl = Math.max(1, lvl || 0);
  const max = def.max || 5;
  const effectBase = def.effectText || def.info || def.name;

  // Passivas: mostrar texto est├ítico original
  if (type === 'passive' || type === 'stat') {
    return effectBase;
  }

  // Buffs/Warcry
  if (def.effect === 'warcry' || type === 'buff') {
    const current = getSkillBuffAtLevel(currentLvl);
    let text = `Buff: +${Math.round(current * 100)}% por 60s`;
    if (currentLvl < max) {
      const next = getSkillBuffAtLevel(currentLvl + 1);
      text += ` (Lv.${currentLvl + 1} ÔåÆ +${Math.round(next * 100)}%)`;
    }
    return text;
  }

  // Heals
  if (def.effect === 'heal' || type === 'heal') {
    let text = `Cura: 25% + ${currentLvl * 5}% do HP m├íximo`;
    if (currentLvl < max) {
      text += ` (Lv.${currentLvl + 1} ÔåÆ ${25 + (currentLvl + 1) * 5}%)`;
    }
    return text;
  }

  // Skills de dano (active)
  const currentPwr = getSkillPwrAtLevel(def, currentLvl);
  let text = `${effectBase} ÔÇö Poder: ${currentPwr}`;
  if (currentLvl < max) {
    const nextPwr = getSkillPwrAtLevel(def, currentLvl + 1);
    text += ` (Lv.${currentLvl + 1} ÔåÆ ${nextPwr})`;
  }
  return text;
}

// Publica fun├º├Áes de escalamento globalmente
window.SkillScaling = {
  getSkillPwrAtLevel,
  getSkillHealAtLevel,
  getSkillBuffAtLevel,
  buildSkillEffectText
};

// ÔöÇÔöÇÔöÇ Constru├º├úo ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ

function buildEchoAdapter() {
  const E = window.EchoData;
  if (!E || !E.CLASSES_ECHO) {
    console.warn('[echo-adapter] window.EchoData.CLASSES_ECHO n├úo encontrado.');
    return;
  }

  const CLASSES_ECHO = E.CLASSES_ECHO;

  const SKILL_DEFS_ECHO        = {};
  const SKILL_REQS_ECHO        = {};
  const CLASS_SKILLS_ECHO      = {};

  for (const [classId, classDef] of Object.entries(CLASSES_ECHO)) {
    const skillList = classDef.skills;
    if (!Array.isArray(skillList) || skillList.length === 0) continue;

    CLASS_SKILLS_ECHO[classId] = CLASS_SKILLS_ECHO[classId] || [];

    for (let i = 0; i < skillList.length; i++) {
      const sk = skillList[i];
      const rawName = sk.name || ('skill_' + i);

      // Gera ID ├║nico por classe ÔÇö sem cache/dedup
      const skillId = toSkillId(classId, rawName);

      const tier = rarityToTier(sk.rarity);
      const type = mapType(sk.type);
      const pwr  = effectToPwr(sk.effect, sk.type);
      const cd   = cdToMs(sk.cooldown);

      SKILL_DEFS_ECHO[skillId] = {
        id:         skillId,
        name:       rawName,
        type:       type,
        tier:       tier,
        cost:       tier === 0 ? 5 : tier === 1 ? 15 : tier === 2 ? 25 : 35,
        max:        5,
        pwr:        pwr,
        baseCd:     cd,
        effect:     type === 'buff' ? 'warcry' : (type === 'passive' ? 'stat' : 'dmg'),
        info:       sk.desc || sk.effect || rawName,
        desc:       sk.desc || '',
        effectText: sk.effect || '',
        icon:       sk.icon || '',
        classReq:   classId
      };

      // Skills tier > 0 exigem n├¡vel m├¡nimo
      if (tier > 0) {
        SKILL_REQS_ECHO[skillId] = { reqLvl: tier * 20 };
      }

      if (!CLASS_SKILLS_ECHO[classId].includes(skillId)) {
        CLASS_SKILLS_ECHO[classId].push(skillId);
      }
    }
  }

  // Heran├ºa de skills: filho inclui skills do pai
  for (const [classId, def] of Object.entries(CLASSES_ECHO)) {
    if (!def.parent) continue;
    const parentList = CLASS_SKILLS_ECHO[def.parent] || [];
    const ownList    = CLASS_SKILLS_ECHO[classId]    || [];
    const merged = [];
    for (const id of parentList) {
      if (!merged.includes(id)) merged.push(id);
    }
    for (const id of ownList) {
      if (!merged.includes(id)) merged.push(id);
    }
    CLASS_SKILLS_ECHO[classId] = merged;
  }

  // Layout autom├ítico por tier ÔåÆ coluna
  const SKILL_TREE_LAYOUT_ECHO = {};
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const layout = {};
    const colCounters = [0, 0, 0, 0, 0];
    for (const sid of skillIds) {
      const def = SKILL_DEFS_ECHO[sid];
      if (!def) continue;
      const col = Math.min(def.tier, 4);
      const row = colCounters[col]++;
      layout[sid] = { col, row };
    }
    SKILL_TREE_LAYOUT_ECHO[classId] = layout;
  }

  // Publica em window.EchoData (o que main.js l├¬)
  E.SKILL_DEFS_ECHO        = SKILL_DEFS_ECHO;
  E.SKILL_REQS_ECHO        = SKILL_REQS_ECHO;
  E.CLASS_SKILLS_ECHO      = CLASS_SKILLS_ECHO;
  E.SKILL_TREE_LAYOUT_ECHO = SKILL_TREE_LAYOUT_ECHO;

  console.log(
    '[echo-adapter] Skills geradas:', Object.keys(SKILL_DEFS_ECHO).length,
    '| Classes com skills:', Object.keys(CLASS_SKILLS_ECHO).length
  );
}

buildEchoAdapter();