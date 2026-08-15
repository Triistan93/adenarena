// ═══════════════════════════════════════════════════════════════════════════
// echo-adapter.js — Adapta o novo CLASSES_ECHO para o formato que o engine
//                   de lineage-idle/main.js precisa.
//
// O engine (main.js) lê via window.EchoData:
//   SKILL_DEFS_ECHO        — definições de skill (id → def)
//   SKILL_REQS_ECHO        — pré-requisitos (id → { reqLvl })
//   SKILL_TREE_LAYOUT_ECHO — layout da árvore (classKey → { [skillId]: {col,row} })
//   CLASS_SKILLS_ECHO      — classe → [skillId, ...]
//
// Esse módulo gera esses objetos a partir do campo "skills: [...]" de cada
// entrada em CLASSES_ECHO e os publica em window.EchoData.
//
// Funções de escalamento por nível são publicadas em window.SkillScaling.
// ═══════════════════════════════════════════════════════════════════════════

import "../src/data/classes/index.js";


// ─── Helpers ──────────────────────────────────────────────────────────────

/** Converte nome de skill em snake_case único por classe */
function toSkillId(classId, skillName) {
  return classId + '_' + skillName
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Mapeia raridade textual para tier numérico */
function rarityToTier(rarity) {
  if (!rarity) return 0;
  if (rarity === '1★' || rarity === '1') return 0;
  if (rarity === '2★' || rarity === '2') return 1;
  if (rarity === '3★' || rarity === '3') return 2;
  if (rarity === '4★' || rarity === '4') return 3;
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

/** Extrai poder numérico da string de efeito */
function effectToPwr(effect, type) {
  if (!effect) return 20;
  const match = effect.match(/(\d+)%/);
  if (match) return Math.round(parseInt(match[1]) / 5); // 150% → 30
  if (type === 'Passivo') return 0;
  return 20;
}

/** Mapa tipo textual → tipo interno do engine */
function mapType(t) {
  if (!t) return 'active';
  const lower = t.toLowerCase();
  if (lower === 'passivo' || lower === 'passive') return 'passive';
  if (lower === 'toggle') return 'toggle';
  if (lower === 'self-buff' || lower === 'party-buff') return 'buff';
  return 'active';
}

// ─── Funções de Escalamento por Nível ──────────────────────────────────

/**
 * Calcula poder da skill no nível investido.
 * Fórmula: basePwr * (1 + 0.10 * (lvl - 1))
 * Nível 1 = 100%, Nível 5 = 140% do poder base.
 * Crescimento moderado: +10% por nível.
 */
function getSkillPwrAtLevel(def, lvl) {
  const basePwr = Number(def.pwr) || 30;
  const level = Math.max(1, lvl);
  return Math.round(basePwr * (1 + 0.10 * (level - 1)));
}

/**
 * Calcula heal amount no nível investido.
 * Fórmula mantida do original: maxHp * (0.25 + lvl * 0.05)
 */
function getSkillHealAtLevel(maxHp, lvl) {
  return Math.floor(maxHp * (0.25 + Math.max(1, lvl) * 0.05));
}

/**
 * Calcula buff amount no nível investido.
 * Fórmula mantida do original: 0.20 + (lvl * 0.05)
 */
function getSkillBuffAtLevel(lvl) {
  return 0.20 + (Math.max(1, lvl) * 0.05);
}

/**
 * Gera texto dinâmico do efeito da skill baseado no nível atual.
 * Mostra valor atual e prévia do próximo nível quando aplicável.
 */
function buildSkillEffectText(def, lvl) {
  if (!def) return '';
  const type = def.type;
  const currentLvl = Math.max(1, lvl || 0);
  const max = def.max || 5;
  const effectBase = def.effectText || def.info || def.name;

  // Passivas: mostrar texto estático original
  if (type === 'passive' || type === 'stat') {
    return effectBase;
  }

  // Buffs/Warcry
  if (def.effect === 'warcry' || type === 'buff') {
    const current = getSkillBuffAtLevel(currentLvl);
    let text = `Buff: +${Math.round(current * 100)}% por 60s`;
    if (currentLvl < max) {
      const next = getSkillBuffAtLevel(currentLvl + 1);
      text += ` (Lv.${currentLvl + 1} → +${Math.round(next * 100)}%)`;
    }
    return text;
  }

  // Heals
  if (def.effect === 'heal' || type === 'heal') {
    let text = `Cura: 25% + ${currentLvl * 5}% do HP máximo`;
    if (currentLvl < max) {
      text += ` (Lv.${currentLvl + 1} → ${25 + (currentLvl + 1) * 5}%)`;
    }
    return text;
  }

  // Skills de dano (active)
  const currentPwr = getSkillPwrAtLevel(def, currentLvl);
  let text = `${effectBase} — Poder: ${currentPwr}`;
  if (currentLvl < max) {
    const nextPwr = getSkillPwrAtLevel(def, currentLvl + 1);
    text += ` (Lv.${currentLvl + 1} → ${nextPwr})`;
  }
  return text;
}

// Publica funções de escalamento globalmente
window.SkillScaling = {
  getSkillPwrAtLevel,
  getSkillHealAtLevel,
  getSkillBuffAtLevel,
  buildSkillEffectText
};

// ─── Construção ─────────────────────────────────────────────────────────

function buildEchoAdapter() {
  const E = window.EchoData;
  if (!E || !E.CLASSES_ECHO) {
    console.warn('[echo-adapter] window.EchoData.CLASSES_ECHO não encontrado.');
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

      // Gera ID único por classe — sem cache/dedup
      const skillId = toSkillId(classId, rawName);

      const tier = rarityToTier(sk.rarity);
      const type = mapType(sk.type);
      const pwr  = effectToPwr(sk.effect, sk.type);
      const cd   = cdToMs(sk.cooldown);

      let reqWeapon = sk.requiredWeapon || null;
      let reqShield = sk.requiredShield || false;
      const isUltimate = (sk.rarity === '4★' || tier === 3);
      const reqItem = (sk.rarity === '4★') ? 'spellbook_4star' : null;

      if (!reqWeapon) {
        const arch = (classDef.archetype || classId || '').toLowerCase();
        const sName = (rawName || '').toLowerCase();
        const sDesc = (sk.desc || sk.effect || '').toLowerCase();

        if (arch.includes('archer') || sName.includes('bow') || sName.includes('shot') || sName.includes('arrow')) {
          reqWeapon = 'bow';
        } else if (arch.includes('assassin') || arch.includes('rogue') || sName.includes('dagger') || sName.includes('backstab') || sName.includes('blow')) {
          reqWeapon = 'dagger';
        } else if (arch.includes('knight') || arch.includes('paladin') || sName.includes('shield')) {
          reqWeapon = 'sword';
          if (sName.includes('shield') || arch.includes('knight')) reqShield = true;
        } else if (arch.includes('mage') || arch.includes('healer') || arch.includes('summoner') || sName.includes('staff') || sName.includes('spell') || sName.includes('hydro') || sName.includes('prominence')) {
          reqWeapon = 'staff';
        } else if (sName.includes('dual') || sName.includes('sonic')) {
          reqWeapon = 'dual';
        } else if (sName.includes('spear') || sName.includes('polearm')) {
          reqWeapon = 'spear';
        } else if (sName.includes('twohand') || sName.includes('crush_of_doom')) {
          reqWeapon = 'twohand';
        } else if (sName.includes('fist') || sName.includes('punch') || sName.includes('bison')) {
          reqWeapon = 'fist';
        } else if (sName.includes('ancientsword') || sName.includes('rush_impact')) {
          reqWeapon = 'ancientsword';
        }
      }

      let skillIcon = sk.icon || '';
      if (!skillIcon || skillIcon === '✦' || skillIcon.length <= 4) {
        const sName = (rawName || '').toLowerCase();
        const sDesc = (sk.desc || sk.effect || '').toLowerCase();

        if (/fire|flame|burn|blaze|prominence|burst/.test(sName + sDesc)) {
          skillIcon = 'assets/skills/fire_strike.jpg';
        } else if (/water|hydro|aqua|ice|freeze|frost|ocean/.test(sName + sDesc)) {
          skillIcon = 'assets/skills/water_wave.jpg';
        } else if (/wind|gale|air|cyclone|storm|typhoon|breeze/.test(sName + sDesc)) {
          skillIcon = 'assets/skills/wind_blade.jpg';
        } else if (/holy|light|sacred|divine|aegis|shield|bless|templar/.test(sName + sDesc)) {
          skillIcon = 'assets/skills/holy_shield.jpg';
        } else if (/vampiric|blood|drain|dark|shadow|curse|rose/.test(sName + sDesc)) {
          skillIcon = 'assets/skills/vampiric_blood.jpg';
        } else {
          skillIcon = 'assets/skills/fire_strike.jpg';
        }
      }

      SKILL_DEFS_ECHO[skillId] = {
        id:                   skillId,
        name:                 rawName,
        type:                 type,
        tier:                 tier,
        cost:                 tier === 0 ? 5 : tier === 1 ? 15 : tier === 2 ? 25 : 35,
        max:                  5,
        pwr:                  pwr,
        baseCd:               cd,
        effect:               type === 'buff' ? 'warcry' : (type === 'passive' ? 'stat' : 'dmg'),
        info:                 sk.desc || sk.effect || rawName,
        desc:                 sk.desc || '',
        effectText:           sk.effect || '',
        icon:                 skillIcon,
        classReq:             classId,
        reqLvl:               tier * 20,
        requiredWeapon:       reqWeapon,
        requiredShield:       reqShield,
        requiredItemToUnlock: reqItem,
        isUltimate:           isUltimate,
        starRank:             sk.rarity === '4★' ? 4 : (tier + 1)
      };

      // Limpa pré-requisitos fictícios em SKILL_REQS_ECHO
      SKILL_REQS_ECHO[skillId] = {};

      if (!CLASS_SKILLS_ECHO[classId].includes(skillId)) {
        CLASS_SKILLS_ECHO[classId].push(skillId);
      }
    }
  }

  // Herança de skills: filho inclui skills do pai
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

  // ─── MAPEAMENTO & NORMALIZAÇÃO DE ALIASES DE CLASSES ─────────────────
  const CLASS_ALIASES = {
    // Orc
    'orcRaider': 'raider',
    'orc_raider': 'raider',
    'orcRider': 'rider',
    'orc_rider': 'rider',
    'vanguardRider': 'vanguardRider',
    'vanguard_rider': 'vanguardRider',
    'vanguardrider': 'vanguardRider',
    'vanguard': 'vanguardRider',
    'orcShaman': 'orcShaman',
    'shaman': 'orcShaman',
    'orcMage': 'orcMage',
    'orcFighter': 'orcFighter',

    // Dark Elf
    'darkFighter': 'darkElfFighter',
    'dark_fighter': 'darkElfFighter',
    'darkElfFighter': 'darkElfFighter',
    'darkMage': 'darkElfMage',
    'dark_mage': 'darkElfMage',
    'darkElfMage': 'darkElfMage',
    'assassin': 'assassinDE',
    'deAssassin': 'assassinDE',
    'assassinDE': 'assassinDE',
    'bladedancer': 'bladeDancer',
    'bladeDancer': 'bladeDancer',

    // Elf
    'elfFighter': 'elfFighter',
    'elfMage': 'elfMage',
    'evasTemplar': 'evaTemplar',
    'evaTemplar': 'evaTemplar',
    'swordsinger': 'swordSinger',
    'swordSinger': 'swordSinger',
    'elvenScout': 'elvenScout',
    'windRiderElven': 'windRider',
    'windRider': 'windRider',
    'oracle': 'elvenOracle',
    'elvenOracle': 'elvenOracle',
    'elder': 'elvenElder',
    'elvenElder': 'elvenElder',
    'evasSaint': 'evaSaint',
    'evaSaint': 'evaSaint',

    // Dwarf
    'artisan': 'artisanDwarf',
    'artisanClass': 'artisanDwarf',
    'artisanDwarf': 'artisanDwarf',
    'scavenger': 'scavenger',
    'bountyHunter': 'bountyHunter',
    'warsmith': 'warsmith',
    'maestro': 'maestro',

    // Kamael
    'soulbreaker': 'soulBreakerKamael',
    'soulBreaker': 'soulBreakerKamael',
    'soulhound': 'soulHound',
    'soulHound': 'soulHound',
    'arbalester': 'arbalesterKamael',
    'arbalesterKamael': 'arbalesterKamael',
    'trickster': 'trickster',

    // High Elf
    'highElf': 'highElfBase',
    'highElfBase': 'highElfBase',
    'spiritMaster': 'elementWeaver',
    'elementWeaver': 'elementWeaver',
    'divineTemplar': 'divineTemplar',
    'shinemaker': 'shinemaker',
    'shinemakerS1': 'shinemakerS1',
    'shinemakerS2': 'shinemakerS2',
    'shinemakerS3': 'shinemakerS3',

    // Ertheia
    'ertheia': 'marauder',
    'ertheiaFighter': 'marauder',
    'ertheiaMage': 'sayhaSeer',
    'bloodRose': 'bloodRoseBase',
    'bloodRoseBase': 'bloodRoseBase',
    'marauder': 'marauder',
    'cloudBreaker': 'sayhaSeer',
    'sayhaSeer': 'sayhaSeer',
    'eviscerator': 'eviscerator'
  };

  for (const [alias, target] of Object.entries(CLASS_ALIASES)) {
    if (CLASS_SKILLS_ECHO[target] && !CLASS_SKILLS_ECHO[alias]) {
      CLASS_SKILLS_ECHO[alias] = [...CLASS_SKILLS_ECHO[target]];
    }
    if (CLASSES_ECHO[target] && !CLASSES_ECHO[alias]) {
      CLASSES_ECHO[alias] = { ...CLASSES_ECHO[target], id: alias };
    }
  }

  // ─── PADRONIZAÇÃO UNIVERSAL: 5 SKILLS POR CLASSE (2 DANO, 2 BUFFS, 1 CURA/VAMP) ───
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

  function createSignatureSustain(classId, classDef) {
    const race = (classDef?.race || '').toLowerCase();
    const arch = (classDef?.archetype || '').toLowerCase();
    const name = (classDef?.name || '').toLowerCase();
    const sid = classId + '_signature_sustain';

    if (name.includes('warg') || arch.includes('beast')) {
      return {
        id: sid,
        name: 'Vampiric Feral Bite',
        type: 'active',
        tier: 4,
        cost: 35,
        max: 5,
        pwr: 45,
        baseCd: 12000,
        effect: 'drain',
        info: 'Mordida feral vampírica causando 220% de dano e recuperando 35% em HP.',
        desc: 'Mordida feral que drena a vitalidade do alvo.',
        icon: 'assets/skills/vampiric_blood.jpg',
        classReq: classId,
        reqLvl: 76,
        starRank: 4
      };
    }

    if (race.includes('darkelf') || name.includes('assassin') || name.includes('abyss') || name.includes('ghost') || name.includes('blood')) {
      return {
        id: sid,
        name: 'Vampiric Touch',
        type: 'active',
        tier: 4,
        cost: 35,
        max: 5,
        pwr: 40,
        baseCd: 10000,
        effect: 'drain',
        info: 'Toque sombrio que absorve 40% do dano causado diretamente em HP.',
        desc: 'Drena a essência vital do inimigo.',
        icon: 'assets/skills/vampiric_blood.jpg',
        classReq: classId,
        reqLvl: 76,
        starRank: 4
      };
    }

    if (arch.includes('mage') || arch.includes('healer') || race.includes('elf') || race.includes('highelf')) {
      return {
        id: sid,
        name: 'Blessing of Recovery',
        type: 'heal',
        tier: 4,
        cost: 35,
        max: 5,
        pwr: 0,
        baseCd: 15000,
        effect: 'heal',
        info: 'Cura divina que restaura 25% do HP máximo do herói.',
        desc: 'Abençoa o conjurador restaurando pontos de vida.',
        icon: 'assets/skills/holy_shield.jpg',
        classReq: classId,
        reqLvl: 76,
        starRank: 4
      };
    }

    return {
      id: sid,
      name: 'Battle Recovery',
      type: 'heal',
      tier: 4,
      cost: 35,
      max: 5,
      pwr: 0,
      baseCd: 18000,
      effect: 'heal',
      info: 'Bandagem de batalha que restaura 20% do HP máximo.',
      desc: 'Trata ferimentos rapidamente durante o combate.',
      icon: 'assets/skills/holy_shield.jpg',
      classReq: classId,
      reqLvl: 76,
      starRank: 4
    };
  }

  function createSignatureDamage(classId, classDef, idx) {
    const arch = (classDef?.archetype || '').toLowerCase();
    const sid = `${classId}_sig_dmg_${idx}`;
    if (arch.includes('mage') || arch.includes('healer') || arch.includes('summoner')) {
      return {
        id: sid,
        name: idx === 1 ? 'Elemental Bolt' : 'Mystic Burst',
        type: 'active',
        tier: idx - 1,
        cost: idx === 1 ? 5 : 15,
        max: 5,
        pwr: idx === 1 ? 25 : 38,
        baseCd: idx === 1 ? 4000 : 7000,
        effect: 'dmg',
        info: idx === 1 ? 'Disparo de energia arcana causando 160% de dano mágico.' : 'Explosão de magia pura causando 220% de dano mágico.',
        desc: 'Ataque mágico focado.',
        icon: 'assets/skills/fire_strike.jpg',
        classReq: classId,
        reqLvl: idx === 1 ? 1 : 20,
        starRank: idx
      };
    }
    return {
      id: sid,
      name: idx === 1 ? 'Power Strike' : 'Heavy Slash',
      type: 'active',
      tier: idx - 1,
      cost: idx === 1 ? 5 : 15,
      max: 5,
      pwr: idx === 1 ? 30 : 45,
      baseCd: idx === 1 ? 5000 : 8000,
      effect: 'dmg',
      info: idx === 1 ? 'Golpe físico concentrado causando 150% de dano.' : 'Corte poderoso causando 200% de dano físico.',
      desc: 'Ataque marcial contundente.',
      icon: 'assets/skills/fire_strike.jpg',
      classReq: classId,
      reqLvl: idx === 1 ? 1 : 20,
      starRank: idx
    };
  }

  function createSignatureBuff(classId, classDef, idx) {
    const sid = `${classId}_sig_buff_${idx}`;
    return {
      id: sid,
      name: idx === 1 ? 'Battle Stance' : 'Heroic Spirit',
      type: 'buff',
      tier: idx + 1,
      cost: idx === 1 ? 25 : 35,
      max: 5,
      pwr: 0,
      baseCd: 45000,
      effect: 'warcry',
      info: idx === 1 ? '+15% ATK / M.ATK por 120s.' : '+20% Defesa e +15% Chance Crítica por 120s.',
      desc: 'Fortalecimento de combate.',
      icon: 'assets/skills/holy_shield.jpg',
      classReq: classId,
      reqLvl: idx === 1 ? 40 : 60,
      starRank: idx + 2
    };
  }

  // Padroniza cada classe para exatamente 5 habilidades (2 Dano, 2 Buffs, 1 Sustentação)
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const classDef = CLASSES_ECHO[classId];
    const skills = skillIds.map(id => SKILL_DEFS_ECHO[id]).filter(Boolean);

    const dmgPool = skills.filter(isDamageSkill);
    const buffPool = skills.filter(isBuffSkill);
    const sustainPool = skills.filter(isSustainSkill);

    // Prioriza as habilidades mais fortes / de maior estágio
    dmgPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));
    buffPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));
    sustainPool.sort((a, b) => (b.starRank || b.tier || 0) - (a.starRank || a.tier || 0));

    const selectedDmg = dmgPool.slice(0, 2);
    const selectedBuff = buffPool.slice(0, 2);
    let selectedSustain = sustainPool.slice(0, 1);

    if (selectedSustain.length === 0) {
      const fallback = createSignatureSustain(classId, classDef);
      SKILL_DEFS_ECHO[fallback.id] = fallback;
      selectedSustain = [fallback];
    }

    while (selectedDmg.length < 2) {
      const sigDmg = createSignatureDamage(classId, classDef, selectedDmg.length + 1);
      SKILL_DEFS_ECHO[sigDmg.id] = sigDmg;
      selectedDmg.push(sigDmg);
    }
    while (selectedBuff.length < 2) {
      const sigBuff = createSignatureBuff(classId, classDef, selectedBuff.length + 1);
      SKILL_DEFS_ECHO[sigBuff.id] = sigBuff;
      selectedBuff.push(sigBuff);
    }

    const curated5 = [
      ...selectedDmg,
      ...selectedBuff,
      ...selectedSustain
    ];

    // Ajusta tiers e posições para 5 colunas perfeitas:
    // [0]: Dano 1 (Tier 0, Col 0)
    // [1]: Dano 2 (Tier 1, Col 1)
    // [2]: Buff 1 (Tier 2, Col 2)
    // [3]: Buff 2 (Tier 3, Col 3)
    // [4]: Sustentação (Tier 4, Col 4)
    const normalizedIds = [];
    curated5.forEach((s, idx) => {
      s.tier = idx;
      s.col = idx;
      s.reqLvl = idx === 0 ? 1 : idx * 20;
      s.cost = idx === 0 ? 5 : (idx * 10 + 5);
      normalizedIds.push(s.id);
    });

    CLASS_SKILLS_ECHO[classId] = normalizedIds;
  }

  // Layout automático por tier → coluna
  const SKILL_TREE_LAYOUT_ECHO = {};
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const layout = {};
    skillIds.forEach((sid, idx) => {
      layout[sid] = { col: idx, row: 0 };
    });
    SKILL_TREE_LAYOUT_ECHO[classId] = layout;
  }

  // Publica em window.EchoData (o que main.js lê)
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
