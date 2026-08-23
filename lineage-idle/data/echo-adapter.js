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
import { CASH_SHOP_CATALOG } from "../src/data/shop/cash_shop_catalog.js";
import { HEIRLOOM_ITEMS } from "../src/data/items/heirloom_items.js";


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
      const type = mapType(sk.type);
      const pwr  = effectToPwr(sk.effect, sk.type);
      const cd   = cdToMs(sk.cooldown);

      let reqWeapon = sk.requiredWeapon || null;
      let reqShield = sk.requiredShield || false;

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
      if (!skillIcon || skillIcon === '✦' || skillIcon.length <= 4 || skillIcon.endsWith('.jpg') || skillIcon.startsWith('/assets/2d/icons/swordsman')) {
        const sName = (rawName || '').toLowerCase();
        const sDesc = (sk.desc || sk.effect || '').toLowerCase();
        const arch = (classDef.archetype || classId || '').toLowerCase();
        const race = (classDef.race || '').toLowerCase();
        const combined = `${sName} ${sDesc} ${arch} ${classId}`;

        // 1. Exact semantic mappings from Custom Skill Atlas
        if (sName.includes('transcendent')) {
          skillIcon = '/assets/skills/icons/transcendence.png';
        } else if (sName.includes('mastery of') || sName.includes('mastery')) {
          if (sName.includes('gun')) skillIcon = '/assets/skills/icons/gun_mastery.png';
          else if (sName.includes('katana') || sName.includes('blade')) skillIcon = '/assets/skills/icons/samurai_harmony.png';
          else if (sName.includes('robe')) skillIcon = '/assets/skills/icons/robe_mastery.png';
          else if (sName.includes('heavy armor')) skillIcon = '/assets/skills/icons/heavy_armor_mastery_icon.png';
          else if (sName.includes('light armor') || sName.includes('shield')) skillIcon = '/assets/skills/icons/shield_mastery.png';
          else if (sName.includes('dp')) skillIcon = '/assets/skills/icons/dp_mastery.png';
          else skillIcon = '/assets/skills/icons/mastery_buff.png';
        } else if (sName.includes('ultimate') || sName.includes('force')) {
          skillIcon = '/assets/skills/icons/ultimate_force.png';
        } else if (sName.includes('power strike')) {
          if (race.includes('orc')) skillIcon = '/assets/skills/icons/orc_power_strike.png';
          else if (race.includes('dwarf')) skillIcon = '/assets/skills/icons/dwarf_forge.png';
          else skillIcon = '/assets/skills/icons/power_strike.png';
        } else if (sName.includes('mortal blow') || sName.includes('deadly blow')) {
          skillIcon = '/assets/skills/icons/mortal_blow.png';
        } else if (sName.includes('heavy slash')) {
          skillIcon = '/assets/skills/icons/heavy_slash.png';
        } else if (sName.includes('holy strike') || sName.includes('holy slash')) {
          skillIcon = '/assets/skills/icons/holy_strike.png';
        } else if (sName.includes('holy light') || sName.includes('divine light')) {
          skillIcon = '/assets/skills/icons/holy_light.png';
        } else if (sName.includes('ice bolt') || sName.includes('ice weave') || sName.includes('frost')) {
          skillIcon = '/assets/skills/icons/ice_bolt.png';
        } else if (sName.includes('flame strike') || sName.includes('fire strike') || sName.includes('blaze')) {
          skillIcon = '/assets/skills/icons/flame_strike.png';
        } else if (sName.includes('wind strike') || sName.includes('cyclone')) {
          skillIcon = '/assets/skills/icons/tornado_vortex.png';
        } else if (sName.includes('sayha') && sName.includes('wind')) {
          skillIcon = '/assets/skills/icons/sayha_wind.png';
        } else if (sName.includes('sayha wind step') || sName.includes('wind step')) {
          skillIcon = '/assets/skills/icons/sayha_wind_step.png';
        } else if (sName.includes('pummel strike')) {
          skillIcon = '/assets/skills/icons/pummel_strike.png';
        } else if (sName.includes('distortion punch')) {
          skillIcon = '/assets/skills/icons/distortion_punch.png';
        } else if (sName.includes('iron punch')) {
          skillIcon = '/assets/skills/icons/iron_punch.png';
        } else if (sName.includes('orc spirit')) {
          skillIcon = '/assets/skills/icons/orc_spirit.png';
        } else if (sName.includes('mystic burst')) {
          skillIcon = '/assets/skills/icons/mystic_burst.png';
        } else if (sName.includes('focus')) {
          skillIcon = '/assets/skills/icons/focus.png';
        } else if (sName.includes('battle mount')) {
          skillIcon = '/assets/skills/icons/battle_mount.png';
        } else if (sName.includes('spoil')) {
          skillIcon = '/assets/skills/icons/spoil.png';
        } else if (sName.includes('golem power') || sName.includes('construct') || sName.includes('golem')) {
          skillIcon = '/assets/skills/icons/golem_power.png';
        } else if (sName.includes('assassination')) {
          skillIcon = '/assets/skills/icons/assassination.png';
        } else if (sName.includes('shadow dash') || sName.includes('shadow step')) {
          skillIcon = '/assets/skills/icons/shadow_dash.png';
        } else if (sName.includes('soul strike')) {
          skillIcon = '/assets/skills/icons/soul_strike.png';
        } else if (sName.includes('energy blast')) {
          skillIcon = '/assets/skills/icons/energy_shield.png';
        } else if (sName.includes('iaijutsu slash') || sName.includes('crescent blade')) {
          skillIcon = '/assets/skills/icons/iaijutsu_slash.png';
        } else if (sName.includes('quick shot')) {
          skillIcon = '/assets/skills/icons/quick_shot.png';
        } else if (sName.includes('burst fire') || sName.includes('evasive shot')) {
          skillIcon = '/assets/skills/icons/burst_fire.png';
        } else if (sName.includes('gun mastery')) {
          skillIcon = '/assets/skills/icons/gun_mastery.png';
        } else if (sName.includes('rose petal strike') || sName.includes('dark thorn')) {
          skillIcon = '/assets/skills/icons/rose_petal_strike.png';
        } else if (sName.includes('vampiric pulse') || sName.includes('sanguine pulse')) {
          skillIcon = '/assets/skills/icons/vampiric_pulse.png';
        } else if (sName.includes('beast claw') || sName.includes('feral strike') || sName.includes('vampiric feral') || sName.includes('ancestral wolf')) {
          skillIcon = '/assets/skills/icons/beast_claw.png';
        } else if (sName.includes('death spike')) {
          skillIcon = '/assets/skills/icons/death_spike.png';
        } else if (sName.includes('death raid')) {
          skillIcon = '/assets/skills/icons/death_raid.png';
        } else if (sName.includes('dark weapon')) {
          skillIcon = '/assets/skills/icons/dark_weapon.png';
        } else if (sName.includes('soul drain') || sName.includes('vampiric touch')) {
          skillIcon = '/assets/skills/icons/dark_drain.png';
        } else if (sName.includes('heroic spirit') || sName.includes("fighter's will")) {
          skillIcon = '/assets/skills/icons/heroic_spirit.png';
        } else if (sName.includes('elven spirit')) {
          skillIcon = '/assets/skills/icons/elven_spirit.png';
        } else if (sName.includes('might')) {
          skillIcon = '/assets/skills/icons/might.png';
        } else if (sName.includes('critical chance') || sName.includes('eagle eye')) {
          skillIcon = '/assets/skills/icons/critical_chance.png';
        } else if (sName.includes('deflect arrow')) {
          skillIcon = '/assets/skills/icons/deflect_arrow.png';
        } else if (sName.includes('evasion') || sName.includes('dodge') || sName.includes('retaliation')) {
          skillIcon = '/assets/skills/icons/scout_dodge.png';
        } else if (sName.includes('blessing of recovery')) {
          skillIcon = '/assets/skills/icons/blessing_of_recovery.png';
        } else if (sName.includes('self heal')) {
          skillIcon = '/assets/skills/icons/self_heal.png';
        } else if (sName.includes('bandage') || sName.includes('battle recovery')) {
          skillIcon = '/assets/skills/icons/bandage.png';
        } else if (sName.includes('cure poison') || sName.includes('cure bleed')) {
          skillIcon = '/assets/skills/icons/cure_poison.png';
        } else if (sName.includes('hp increase') || sName.includes('boost hp')) {
          skillIcon = '/assets/skills/icons/hp_increase.png';
        } else if (sName.includes('mp increase') || sName.includes('boost mana')) {
          skillIcon = '/assets/skills/icons/mp_increase.png';
        } else if (sName.includes('shield of light') || sName.includes('holy shield')) {
          skillIcon = '/assets/skills/icons/shield_of_light.png';
        } else if (sName.includes('lightning barrier')) {
          skillIcon = '/assets/skills/icons/lightning_barrier.png';
        } else if (sName.includes('spirit of phoenix')) {
          skillIcon = '/assets/skills/icons/spirit_of_phoenix.png';
        } else if (sName.includes('harmony')) {
          if (sName.includes('shillien saint') || sName.includes('shillien')) skillIcon = '/assets/skills/icons/shillien_saint_harmony.png';
          else if (sName.includes('storm screamer')) skillIcon = '/assets/skills/icons/storm_screamer_harmony.png';
          else if (sName.includes('divine templar') || sName.includes('templar')) skillIcon = '/assets/skills/icons/divine_templar_harmony.png';
          else if (sName.includes('samurai')) skillIcon = '/assets/skills/icons/samurai_harmony.png';
          else if (sName.includes('maestro') || sName.includes('warsmith')) skillIcon = '/assets/skills/icons/maestro_harmony.png';
          else if (sName.includes('bounty hunter') || sName.includes('fortune seeker')) skillIcon = '/assets/skills/icons/fortune_seeker_harmony.png';
          else if (sName.includes('wind sniper') || sName.includes('storm blaster')) skillIcon = '/assets/skills/icons/wind_sniper_harmony.png';
          else if (sName.includes('sayha')) skillIcon = '/assets/skills/icons/sayha_seeker_harmony.png';
          else if (sName.includes('ghost hunter') || sName.includes('assassin')) skillIcon = '/assets/skills/icons/ninja_dash.png';
          else if (sName.includes('gladiator') || sName.includes('duelist')) skillIcon = '/assets/skills/icons/dual_daggers.png';
          else if (sName.includes('titan') || sName.includes('destroyer') || sName.includes('tyrant') || sName.includes('grand khavatari')) skillIcon = '/assets/skills/icons/tyrant_harmony.png';
          else if (sName.includes('sorcerer') || sName.includes('archmage')) skillIcon = '/assets/skills/icons/flame_strike.png';
          else if (sName.includes('prophet') || sName.includes('hierophant')) skillIcon = '/assets/skills/icons/prophet_harmony.png';
          else if (sName.includes('cardinal') || sName.includes('bishop') || sName.includes('cleric')) skillIcon = '/assets/skills/icons/resurrection.png';
          else if (sName.includes('eva')) skillIcon = '/assets/skills/icons/tree_of_life.png';
          else skillIcon = '/assets/skills/icons/group_blessing.png';
        } else {
          // Fallback based on category
          if (/bow|arrow|archer|snipe/.test(combined)) skillIcon = '/assets/skills/icons/archery_bow.png';
          else if (/shield|guard|defense|iron wall|barrier|block/.test(combined)) skillIcon = '/assets/skills/icons/shield_mastery.png';
          else if (/buff|warcry|spirit|stance|might|haste/.test(combined)) skillIcon = '/assets/skills/icons/might.png';
          else if (/magic|mage|cast|spell|mana/.test(combined)) skillIcon = '/assets/skills/icons/robe_mastery.png';
          else skillIcon = '/assets/skills/icons/power_strike.png';
        }
      }

      const stage = Number(classDef.stage) || 0;
      const sNameLower = (rawName || '').toLowerCase();
      const is4Star = (sk.rarity === '4★' || (stage >= 3 && sk.rarity === '4★') || sNameLower.includes('transcendent') || sNameLower.includes('ancestral wolf') || sNameLower.includes('apex force'));
      const tier = is4Star ? 4 : stage;
      const reqLvl = tier === 0 ? 1 : tier === 1 ? 20 : tier === 2 ? 40 : tier === 3 ? 76 : 80;
      const cost = tier === 0 ? 5 : tier === 1 ? 15 : tier === 2 ? 30 : tier === 3 ? 60 : 100;
      const starRank = is4Star ? 4 : (tier + 1);

      SKILL_DEFS_ECHO[skillId] = {
        id:                   skillId,
        name:                 rawName,
        type:                 type,
        tier:                 tier,
        cost:                 cost,
        max:                  5,
        pwr:                  pwr,
        baseCd:               cd,
        effect:               type === 'buff' ? 'warcry' : (type === 'passive' ? 'stat' : (sNameLower.includes('heal') || sNameLower.includes('bandage') ? 'heal' : 'dmg')),
        info:                 sk.desc || sk.effect || rawName,
        desc:                 sk.desc || '',
        effectText:           sk.effect || '',
        icon:                 skillIcon,
        classReq:             classId,
        reqLvl:               reqLvl,
        requiredWeapon:       reqWeapon,
        requiredShield:       reqShield,
        requiredItemToUnlock: is4Star ? 'spellbook_4star' : null,
        isUltimate:           is4Star,
        starRank:             starRank
      };

      SKILL_REQS_ECHO[skillId] = {};

      if (!CLASS_SKILLS_ECHO[classId].includes(skillId)) {
        CLASS_SKILLS_ECHO[classId].push(skillId);
      }
    }
  }

  // Herança completa de skills: Percorre árvore genealógica [ancestral_raiz -> ... -> classe_atual]
  const ownSkillsByClass = {};
  for (const [cId, list] of Object.entries(CLASS_SKILLS_ECHO)) {
    ownSkillsByClass[cId] = [...list];
  }

  for (const [classId, classDef] of Object.entries(CLASSES_ECHO)) {
    const chain = [];
    let curr = classId;
    const visited = new Set();
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      chain.unshift(curr);
      curr = CLASSES_ECHO[curr]?.parent;
    }

    const merged = [];
    for (const c of chain) {
      for (const sid of (ownSkillsByClass[c] || [])) {
        if (!merged.includes(sid)) merged.push(sid);
      }
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
    'elvenScout': 'elfScout',
    'elfScout': 'elfScout',
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

  // ─── LAYOUT DA ÁRVORE DE HABILIDADES (Organizado por Tiers / Colunas 0 a 4) ───
  const SKILL_TREE_LAYOUT_ECHO = {};
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const layout = {};
    const tierBuckets = { 0: [], 1: [], 2: [], 3: [], 4: [] };

    for (const sid of skillIds) {
      const def = SKILL_DEFS_ECHO[sid];
      const t = (def && def.tier !== undefined) ? def.tier : 0;
      if (tierBuckets[t]) tierBuckets[t].push(sid);
      else tierBuckets[0].push(sid);
    }

    for (let c = 0; c < 5; c++) {
      const list = tierBuckets[c] || [];
      list.forEach((sid, row) => {
        layout[sid] = { col: c, row };
        if (!SKILL_TREE_LAYOUT_ECHO[sid]) {
          SKILL_TREE_LAYOUT_ECHO[sid] = { col: c, row };
        }
      });
    }

    SKILL_TREE_LAYOUT_ECHO[classId] = layout;
  }

  for (const [alias, target] of Object.entries(CLASS_ALIASES)) {
    if (SKILL_TREE_LAYOUT_ECHO[target] && !SKILL_TREE_LAYOUT_ECHO[alias]) {
      SKILL_TREE_LAYOUT_ECHO[alias] = SKILL_TREE_LAYOUT_ECHO[target];
    }
  }

  // Publica em window.EchoData (o que main.js lê)
  E.SKILL_DEFS_ECHO        = SKILL_DEFS_ECHO;
  E.SKILL_REQS_ECHO        = SKILL_REQS_ECHO;
  E.CLASS_SKILLS_ECHO      = CLASS_SKILLS_ECHO;
  E.SKILL_TREE_LAYOUT_ECHO = SKILL_TREE_LAYOUT_ECHO;
  E.CASH_SHOP_CATALOG      = CASH_SHOP_CATALOG;
  E.HEIRLOOM_ITEMS         = HEIRLOOM_ITEMS;

  console.log(
    '[echo-adapter] Skills autênticas geradas:', Object.keys(SKILL_DEFS_ECHO).length,
    '| Classes com árvore completa:', Object.keys(CLASS_SKILLS_ECHO).length
  );
}

buildEchoAdapter();
