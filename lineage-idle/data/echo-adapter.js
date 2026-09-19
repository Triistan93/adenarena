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
import { ALL_LOADED_SKILLS } from "../src/data/skills/index.js";
import { CLASS_ALIASES as UNIVERSAL_CLASS_ALIASES, resolveCanonicalClassId } from "../src/data/classes/index.js";
import { getSkillIcon } from "../src/services/SkillIconRegistry.js";
import { getSkillMpCost } from "../src/data/balance/skillBalance.js";
import { calculateHealAmount } from "../src/data/balance/combatBalance.js";
import { CANONICAL_SKILL_REGISTRY_V2 } from "../src/data/skills/CanonicalSkillRegistryV2.js";
import { CANONICAL_CLASS_REGISTRY_V2 } from "../src/data/classes/CanonicalClassRegistryV2.js";
import { isPurgedSkill } from "../src/services/SkillTagService.js";


/** Transforma string em slug snake_case */
function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/** Converte nome de skill em snake_case único por classe */
function toSkillId(classId, skillName) {
  return classId + '_' + slugify(skillName);
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
  if (match) return Math.round(parseInt(match[1], 10) / 10); // 210% → 21 (2.1x dano)
  if (type === 'Passivo' || type === 'passive') return 0;
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
 * Integra com calculateHealAmount (M.Atk + MaxHP%) e respeita cap estrito em maxHp.
 */
function getSkillHealAtLevel(maxHp, lvl, matk = 0) {
  const heal = calculateHealAmount({ maxHp, matk, skillLvl: lvl });
  return Math.min(Math.max(1, Number(maxHp) || 100), heal);
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
if (typeof window !== 'undefined') {
  window.SkillScaling = {
    getSkillPwrAtLevel,
    getSkillHealAtLevel,
    getSkillBuffAtLevel,
    buildSkillEffectText
  };
} else if (typeof globalThis !== 'undefined') {
  globalThis.SkillScaling = {
    getSkillPwrAtLevel,
    getSkillHealAtLevel,
    getSkillBuffAtLevel,
    buildSkillEffectText
  };
}

/**
 * Curadoria de Habilidades da Classe:
 * Cada classe possui um arsenal focado de 5 a 6 habilidades de assinatura (ataques, buffs, cura e ultimate 4★).
 */
function curateClassSkills(skills) {
  if (!skills || skills.length <= 6) return skills || [];

  const ultimates = skills.filter(s => s.rarity === '4★' || (s.name || '').toLowerCase().includes('transcendent') || (s.name || '').toLowerCase().includes('ancestral') || (s.name || '').toLowerCase().includes('apex'));
  const harmonies = skills.filter(s => (s.name || '').includes('Harmony') || (s.name || '').includes('Will') || (s.name || '').includes('Aura') || (s.name || '').includes('Roar') || (s.name || '').includes('Icon'));
  const actives = skills.filter(s => s.type === 'Ativo' && !ultimates.includes(s) && !harmonies.includes(s));
  const sustainsAndPassives = skills.filter(s => !ultimates.includes(s) && !harmonies.includes(s) && !actives.includes(s));

  const result = [];
  // Prioriza até 3 ataques ativos
  for (let i = 0; i < Math.min(3, actives.length); i++) result.push(actives[i]);
  // Prioriza 1 habilidade de controle / área / sustain
  for (let i = 3; i < Math.min(4, actives.length); i++) result.push(actives[i]);
  // Prioriza buffs de assinatura / harmonia
  for (let i = 0; i < Math.min(2, harmonies.length); i++) {
    if (!result.includes(harmonies[i])) result.push(harmonies[i]);
  }
  // Adiciona ultimate 4★ se houver
  for (const u of ultimates) {
    if (!result.includes(u)) result.push(u);
  }
  // Completa até 6 com passivas ou sustentos restantes
  for (const sp of sustainsAndPassives) {
    if (result.length >= 6) break;
    if (!result.includes(sp)) result.push(sp);
  }
  for (const act of actives) {
    if (result.length >= 6) break;
    if (!result.includes(act)) result.push(act);
  }

  return result.slice(0, 6);
}

/**
 * Resolução Semântica de Ícones para Habilidades
 * Garante que NENHUMA habilidade caia em ícones genéricos repetidos.
 */
function resolveSkillIcon(rawName, sk, classDef, classId) {
  const sId = sk?.id || sk?.identity?.id || (classId && rawName ? toSkillId(classId, rawName) : null);
  if (sId) {
    const regIcon = getSkillIcon(sId, sk);
    if (regIcon && regIcon.iconPath) return regIcon.iconPath;
  }
  if (rawName) {
    const nameHit = getSkillIcon(slugify(rawName), sk);
    if (nameHit && nameHit.iconPath && nameHit.iconId !== 'power_strike') return nameHit.iconPath;
  }

  const name = (rawName || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const arch = (classDef?.archetype || classId || '').toLowerCase();
  const race = (classDef?.race || '').toLowerCase();

  // 1. Water / Aqua / Hydro / Wave / Ocean / Swirl / Rain / Freeze
  if (/aqua|hydro|water|wave|bubble|stream|frost_tide|tsunami|swirl|ocean|splash|ice_bolt/.test(name)) {
    return '/assets/skills/icons/ice_bolt.png';
  }
  // 2. Ice / Frost / Freeze / Cold / Blizzard / Glacier
  if (/ice|frost|blizzard|freez|cold|glacier/.test(name)) {
    return '/assets/skills/icons/ice_bolt.png';
  }
  // 3. Fire / Flame / Blaze / Burn / Flare / Volcano / Meteor / Prominence / Inferno
  if (/meteor|inferno|prominence|volcano|blaze|flame|fire|burn|flare|blazing|sun|solar|aura_burn/.test(name)) {
    if (/prominence|volcano|inferno|meteor/.test(name)) return '/assets/skills/icons/phoenix_flame.png';
    return '/assets/skills/icons/flame_strike.png';
  }
  // 4. Wind / Tornado / Cyclone / Twister / Vortex / Air / Storm / Gale
  if (/tornado|cyclone|twister|vortex|wind|tempest|gale|hurricane/.test(name)) {
    if (/sayha/.test(name)) return '/assets/skills/icons/sayha_wind.png';
    return '/assets/skills/icons/tornado_vortex.png';
  }
  // 5. Earth / Stone / Rock / Quake / Golem / Construct / Hammer
  if (/earth|quake|ground|stone|rock|golem|construct|forge|hammer/.test(name)) {
    if (/golem/.test(name)) return '/assets/skills/icons/golem_power.png';
    if (/forge|craft/.test(name)) return '/assets/skills/icons/dwarf_forge.png';
    return '/assets/skills/icons/distortion_punch.png';
  }
  // 6. Holy / Divine / Light / Angel / Saint / Healing / Purify / Miracle / Resurrection
  if (/resurrection|revive|miracle|sublime/.test(name)) {
    return '/assets/skills/icons/resurrection.png';
  }
  if (/cure|purify|cleanse|antidote|bandage|recovery/.test(name)) {
    return '/assets/skills/icons/cure_poison.png';
  }
  if (/heal|blessing|touch_of_life|balance_life|tree_of_life|life/.test(name) && !/drain/.test(name)) {
    return '/assets/skills/icons/blessing_of_recovery.png';
  }
  if (/holy|divine|light|angel|sanctuary|sacred/.test(name)) {
    if (/strike|slash|attack|blade/.test(name)) return '/assets/skills/icons/holy_strike.png';
    if (/barrier|shield|aegis/.test(name)) return '/assets/skills/icons/divine_barrier.png';
    return '/assets/skills/icons/holy_light.png';
  }
  // 7. Dark / Shadow / Death / Drain / Vampiric / Necro / Gloom / Corpse / Poison / Blood
  if (/drain|vampir|lifesteal|touch_of_death|sanguine/.test(name)) {
    if (/claw|bite|feral/.test(name)) return '/assets/skills/icons/beast_claw.png';
    return '/assets/skills/icons/dark_drain.png';
  }
  if (/death|corpse|unholy|doom|dark|shadow|curse|poison|bleed|spoil/.test(name)) {
    if (/death_spike|death_raid/.test(name)) return '/assets/skills/icons/death_spike.png';
    if (/shadow_step|shadow_dash/.test(name)) return '/assets/skills/icons/shadow_dash.png';
    if (/spoil/.test(name)) return '/assets/skills/icons/spoil.png';
    return '/assets/skills/icons/dark_weapon.png';
  }
  // 8. Sleep / Trance / Fear / Horror / Silence / Cancel / Mind / Confusion
  if (/sleep|trance|drowse/.test(name)) {
    return '/assets/2d/icons/undead-skills/PNG/Icon24.png';
  }
  if (/fear|horror|terror/.test(name)) {
    return '/assets/2d/icons/undead-skills/PNG/Icon31.png';
  }
  if (/silence|cancel|anti_magic|dispel|mute/.test(name)) {
    return '/assets/2d/icons/undead-skills/PNG/Icon29.png';
  }
  // 9. Dagger / Stealth / Assassination / Backstab / Critical Blows
  if (/backstab|deadly_blow|mortal_blow|lethal_blow|blinding_blow|assassin|stealth/.test(name)) {
    return '/assets/skills/icons/deadly_blow.png';
  }
  // 10. Bow / Crossbow / Arrow / Shot / Snipe
  if (/arrow|bow|shot|snipe|burst_shot|rain|gun/.test(name)) {
    if (/gun|rifle/.test(name)) return '/assets/skills/icons/gun_mastery.png';
    if (/double_shot|quick_shot|burst_fire/.test(name)) return '/assets/skills/icons/quick_shot.png';
    return '/assets/skills/icons/archery_bow.png';
  }
  // 11. Dual Swords / Combos / Sonic
  if (/sonic|dual|triple_slash|double_sonic/.test(name)) {
    return '/assets/skills/icons/dual_daggers.png';
  }
  // 12. Spear / Polearm / Whirlwind / Sweep
  if (/polearm|spear|whirlwind|sweep|spin/.test(name)) {
    return '/assets/skills/icons/spear_mastery.png';
  }
  // 13. Shield / Defense / Taunt / Stun / Block / Barrier
  if (/shield|defend|defense|block|barrier|iron_will|majesty|aegis|wall/.test(name)) {
    if (/stun|strike/.test(name)) return '/assets/skills/icons/cross_shield.png';
    return '/assets/skills/icons/aegis_shield.png';
  }
  if (/taunt|hate|provoke|roar|cry|shout|frenzy|might|berserk|fury/.test(name)) {
    return '/assets/skills/icons/might.png';
  }
  // 14. Speed / Agility / Dash / Evasion / Dodge / Haste
  if (/speed|dash|step|evasion|dodge|haste|quick|sprint/.test(name)) {
    return '/assets/skills/icons/haste.png';
  }
  // 15. Focus / Crit / Eye / Accuracy / Precision
  if (/focus|crit|accuracy|eye|precision|target/.test(name)) {
    return '/assets/skills/icons/focus.png';
  }
  // 16. Mana / Robe / Staff / Magic Mastery
  if (/mana|mp|recharge|mind|intellect/.test(name)) {
    return '/assets/skills/icons/mp_increase.png';
  }
  if (/hp|health|vitality|body/.test(name)) {
    return '/assets/skills/icons/hp_increase.png';
  }
  if (/robe/.test(name)) {
    return '/assets/skills/icons/robe_mastery.png';
  }
  if (/armor/.test(name)) {
    return '/assets/skills/icons/heavy_armor_mastery_icon.png';
  }
  if (/harmony/.test(name)) {
    return '/assets/skills/icons/group_blessing.png';
  }
  if (/transcendent/.test(name)) {
    return '/assets/skills/icons/transcendence.png';
  }

  // Fallback por arquétipo
  if (arch.includes('mage') || arch.includes('wizard') || arch.includes('sorcerer')) {
    return '/assets/skills/icons/mystic_burst.png';
  }
  if (arch.includes('cleric') || arch.includes('healer') || arch.includes('bishop')) {
    return '/assets/skills/icons/holy_light.png';
  }
  if (arch.includes('assassin') || arch.includes('rogue')) {
    return '/assets/skills/icons/curved_dagger.png';
  }
  if (arch.includes('archer')) {
    return '/assets/skills/icons/archery_bow.png';
  }
  return null;
}

/**
 * Converte strings canônicas de recarga (ex: "15 sec.", "1 min.", "0.5 sec.") em milissegundos sem fabricação.
 * Retorna 0 para passivas/sem recarga ('N/A', 'none', '-', ':'), e null para ausência de dado.
 */
export function parseCooldownToMs(cdStr) {
  if (typeof cdStr === 'number') return cdStr;
  if (!cdStr || typeof cdStr !== 'string') return null;
  const s = cdStr.trim().toLowerCase();
  if (s === 'n/a' || s === 'none' || s === '-' || s === ':') return 0;
  const matchSec = s.match(/([\d.]+)\s*sec/);
  if (matchSec) return Math.round(parseFloat(matchSec[1]) * 1000);
  const matchMin = s.match(/([\d.]+)\s*min/);
  if (matchMin) return Math.round(parseFloat(matchMin[1]) * 60000);
  const matchMs = s.match(/([\d.]+)\s*ms/);
  if (matchMs) return Math.round(parseFloat(matchMs[1]));
  const num = parseFloat(s);
  return !isNaN(num) ? Math.round(num * 1000) : null;
}

/**
 * Transforms a V2 canonical skill definition to Echo runtime format without fabricating stats.
 * Preserva zeros legítimos, deixa campos ausentes como null e converte recarga com precisão.
 */
export function transformV2SkillToEcho(sId, s, existingDef = null) {
  const starRank = s.starRank || 1;
  const isUlt = starRank >= 4;
  let reqBook = null;
  if (starRank === 2) reqBook = 'book_2star';
  else if (starRank === 3) reqBook = 'book_3star';
  else if (starRank === 4) reqBook = 'book_4star';
  else if (starRank >= 5) reqBook = 'book_5star';

  const spCost = starRank >= 4 ? 100 : (starRank === 3 ? 60 : (starRank === 2 ? 30 : 15));
  const isBuff = s.type === 'buff';
  const isPassive = s.type === 'passive';
  const isToggle = s.type === 'toggle';
  const sNameLower = String(s.name || '').toLowerCase();
  const isHeal = sNameLower.includes('heal') || sNameLower.includes('bandage') || sNameLower.includes('recovery');
  const isVampiric = sNameLower.includes('drain') || sNameLower.includes('vampir') || sNameLower.includes('siphon');

  let reqWeapon = 'any';
  let reqShield = false;
  if (/shot|arrow|bow|snipe/.test(sNameLower)) reqWeapon = 'bow';
  else if (/dagger|backstab|mortal_blow|deadly_blow/.test(sNameLower)) reqWeapon = 'dagger';
  else if (/dual|sonic/.test(sNameLower)) reqWeapon = 'dual';
  else if (/spear|polearm|whirlwind/.test(sNameLower)) reqWeapon = 'spear';
  else if (/blunt|hammer|crush|spoil/.test(sNameLower)) reqWeapon = 'blunt';
  else if (/twohand|greatsword/.test(sNameLower)) reqWeapon = 'twohand';
  else if (/fist|claw|punch/.test(sNameLower)) reqWeapon = 'fist';
  if (/shield|shield_stun|shield_bash/.test(sNameLower)) reqShield = true;

  const pwr = s.balance?.pwr !== undefined ? s.balance.pwr : (isPassive || isBuff || isToggle ? 0 : null);
  const mpCost = s.balance?.mpCost !== undefined ? s.balance.mpCost : (isPassive ? 0 : null);
  const baseCd = s.canonicalCooldownMs !== undefined ? s.canonicalCooldownMs : (parseCooldownToMs(s.canonicalCooldown) ?? (isPassive ? 0 : null));

  if (!existingDef) {
    return {
      id: sId,
      name: s.name,
      type: s.type,
      tier: starRank,
      cost: spCost,
      max: 5,
      pwr,
      baseCd,
      mpCost,
      effect: isBuff ? 'warcry' : (isPassive ? 'stat' : (isToggle ? 'toggle' : (isHeal ? 'heal' : (isVampiric ? 'vampiric' : 'dmg')))),
      info: s.desc || s.canonicalEffect || s.name,
      desc: s.desc || '',
      effectText: s.canonicalEffect || '',
      icon: s.icon,
      iconGap: s.iconGap,
      iconGapReason: s.iconGapReason,
      vfxGap: s.vfxGap,
      sfxGap: s.sfxGap,
      classes: s.classes || [],
      classReq: s.classes?.[0] || 'any',
      reqLvl: 1,
      requiredWeapon: reqWeapon,
      requiredShield: reqShield,
      requiredItemToUnlock: reqBook,
      isUltimate: isUlt,
      starRank,
      overhit: true,
      toggle: isToggle
    };
  }

  return Object.assign(existingDef, {
    iconGap: s.iconGap,
    iconGapReason: s.iconGapReason,
    vfxGap: s.vfxGap,
    sfxGap: s.sfxGap,
    canonicalEffect: s.canonicalEffect,
    canonicalCooldown: s.canonicalCooldown,
    canonicalCooldownMs: s.canonicalCooldownMs,
    classes: s.classes || existingDef.classes || []
  });
}

// ─── Construção ─────────────────────────────────────────────────────────

function buildEchoAdapter() {
  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  const E = root ? root.EchoData : null;
  if (!E || !E.CLASSES_ECHO) {
    // Retorna de forma segura em ambiente Node ou antes do EchoData carregar
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

    const curatedSkills = curateClassSkills(classDef.skills);

    for (let idx = 0; idx < curatedSkills.length; idx++) {
      const sk = curatedSkills[idx];
      const rawName = sk.name || `Skill_${idx + 1}`;
      const skillId = toSkillId(classId, rawName);

      const type = (sk.type === 'Passivo' || sk.type === 'passive') ? 'passive'
                 : ((sk.type || '').toLowerCase().includes('buff') || (sk.type || '').toLowerCase().includes('toggle')) ? 'buff'
                 : 'active';

      const pwr = effectToPwr(sk.effect, sk.type);
      const cd  = cdToMs(sk.cooldown);

      let reqWeapon = null;
      let reqShield = false;
      if (sk.reqWeapon) {
        reqWeapon = sk.reqWeapon;
      } else {
        const sName = (rawName || '').toLowerCase();
        const sEff = (sk.effect || '').toLowerCase();
        const arch = (classDef.archetype || classId || '').toLowerCase();
        const isGenericBuff = type === 'buff' || (sk.type || '').toLowerCase().includes('buff') || (sk.type || '').toLowerCase().includes('toggle');
        const isPassive = type === 'passive' || (sk.type || '').toLowerCase().includes('passive');

        // Buffs corporais universais (podem ser usados com qualquer arma)
        const isUniversalBuff = /sprint|dash|iron body|battle roar|war cry|warcry|lionheart|guts|frenzy|ultimate defense|guidance|death whisper|focus|haste|acumen|empower|berserker|blessing|prayer|chant|song of|dance of|aura|rage|vigor|majesty|noble|holy light/.test(sName);

        if (isUniversalBuff && !sName.includes('mastery') && !sName.includes('stance') && !sName.includes('snipe')) {
          reqWeapon = null;
        } else if (sName.includes('shot') || sName.includes('arrow') || sName.includes('bow') || sName.includes('snipe') || sName.includes('archery')) {
          reqWeapon = 'bow';
        } else if (sName.includes('stab') || sName.includes('blow') || sName.includes('dagger') || sName.includes('backstab') || sName.includes('shadow step') || sName.includes('blinding')) {
          reqWeapon = 'dagger';
        } else if (sName.includes('spear') || sName.includes('polearm') || sName.includes('whirlwind') || sName.includes('thunder storm') || sName.includes('wild sweep') || sName.includes('earth tremor') || sName.includes('wrath')) {
          reqWeapon = 'spear';
        } else if (sName.includes('dual') || sName.includes('sonic') || sName.includes('triple slash') || sName.includes('double sonic')) {
          reqWeapon = 'dual';
        } else if (sName.includes('shield') || (sName.includes('stun') && !sName.includes('shot') && arch.includes('knight'))) {
          reqShield = true;
        } else if (sName.includes('twohand') || sName.includes('greatsword') || sName.includes('crush of doom') || sName.includes('power smash') || sName.includes('demolition')) {
          reqWeapon = 'twohand';
        } else if (sName.includes('fist') || sName.includes('punch') || sName.includes('bison') || sName.includes('pummel') || sName.includes('force blaster') || sName.includes('hurricane fist')) {
          reqWeapon = 'fist';
        } else if (sName.includes('ancientsword') || sName.includes('rush impact') || sName.includes('slashing blade')) {
          reqWeapon = 'ancientsword';
        } else if (sName.includes('hammer') || sName.includes('blunt') || sName.includes('armor crush') || sName.includes('spoil')) {
          reqWeapon = 'blunt';
        } else if (sName.includes('staff') || sName.includes('hydro') || sName.includes('prominence') || sName.includes('hurricane') || sName.includes('solar flare') || sName.includes('vampiric')) {
          reqWeapon = 'staff';
        } else if (!isGenericBuff && !isPassive) {
          // Se for ataque ativo de arquétipo especializado
          if (arch.includes('archer')) reqWeapon = 'bow';
          else if (arch.includes('dagger') || arch.includes('assassin')) reqWeapon = 'dagger';
          else if (arch.includes('warlord')) reqWeapon = 'spear';
          else if (arch.includes('gladiator')) reqWeapon = 'dual';
          else if (arch.includes('titan') || arch.includes('destroyer') || arch.includes('berserker')) reqWeapon = 'twohand';
          else if (arch.includes('tyrant')) reqWeapon = 'fist';
          else if (arch.includes('mage') || arch.includes('wizard')) reqWeapon = 'staff';
        }
      }

      const skillIcon = resolveSkillIcon(rawName, sk, classDef, classId);

      const stage = Number(classDef.stage) || 0;
      const sNameLower = (rawName || '').toLowerCase();
      const is4Star = (sk.rarity === '4★' || (stage >= 3 && sk.rarity === '4★') || sNameLower.includes('transcendent') || sNameLower.includes('ancestral wolf') || sNameLower.includes('apex force'));
      const tier = is4Star ? 4 : stage;
      const reqLvl = tier === 0 ? 1 : tier === 1 ? 20 : tier === 2 ? 40 : tier === 3 ? 76 : 80;
      const cost = tier === 0 ? 5 : tier === 1 ? 15 : tier === 2 ? 30 : tier === 3 ? 60 : 100;

      let requiredBook = null;
      let starRank = 1;
      if (is4Star || tier >= 4) {
        starRank = 4;
        requiredBook = 'book_4star';
      } else if (tier === 3 || sk.rarity === '3★') {
        starRank = 3;
        requiredBook = 'book_3star';
      } else if (tier === 2) {
        // 2ª Classe (Nível 40+)
        if (sk.rarity === '2★' || sNameLower.includes('mastery') || sNameLower.includes('frenzy') || sNameLower.includes('roar') || sNameLower.includes('stance')) {
          starRank = 2;
          requiredBook = 'book_2star';
        } else {
          starRank = 1;
          requiredBook = 'book_1star';
        }
      } else {
        // Níveis 1 a 39 (habilidades básicas sem livros para onboarding fluido)
        starRank = 1;
        requiredBook = null;
      }

      const isOverhitEligible = (type === 'active' && !sNameLower.includes('heal') && !sNameLower.includes('bandage')) &&
        (is4Star || /blow|strike|crush|slam|shot|blast|prominence|hurricane|flare|spike|hydro|drain|judgment|sonic|force|fatal|mortal|backstab|deadly|smash|burst|hammer|break|shock|double|triple|penetration|puncture|sweep|cleave/i.test(sNameLower));

      let mpCost = 0;
      if (type !== 'passive') {
        const canonical = ALL_LOADED_SKILLS.get(skillId) || ALL_LOADED_SKILLS.get(slugify(rawName));
        if (typeof sk.mpCost === 'number' && sk.mpCost > 0) {
          mpCost = sk.mpCost;
        } else if (canonical && typeof canonical.gameplay?.mpCost === 'number' && canonical.gameplay.mpCost > 0) {
          mpCost = canonical.gameplay.mpCost;
        } else {
          mpCost = getSkillMpCost({ tier, isUltimate: is4Star, starRank, type });
        }
      }

      SKILL_DEFS_ECHO[skillId] = {
        id:                   skillId,
        name:                 rawName,
        type:                 type,
        tier:                 tier,
        cost:                 cost,
        max:                  5,
        pwr:                  pwr,
        baseCd:               cd,
        mpCost:               mpCost,
        effect:               type === 'buff' ? 'warcry' : (type === 'passive' ? 'stat' : (sNameLower.includes('heal') || sNameLower.includes('bandage') ? 'heal' : 'dmg')),
        info:                 sk.desc || sk.effect || rawName,
        desc:                 sk.desc || '',
        effectText:           sk.effect || '',
        icon:                 skillIcon,
        classReq:             classId,
        reqLvl:               reqLvl,
        requiredWeapon:       reqWeapon,
        requiredShield:       reqShield,
        requiredItemToUnlock: requiredBook,
        isUltimate:           is4Star,
        starRank:             starRank,
        overhit:              isOverhitEligible
      };

      SKILL_REQS_ECHO[skillId] = {};

      if (!CLASS_SKILLS_ECHO[classId].includes(skillId)) {
        CLASS_SKILLS_ECHO[classId].push(skillId);
      }
    }
  }

  // ─── MAPEAMENTO & NORMALIZAÇÃO DE ALIASES DE CLASSES ─────────────────
  const CLASS_ALIASES = {
    // Orc
    'orcRaider': 'raider',
    'orc_raider': 'raider',
    'orcRider': 'rider',
    'orc_rider': 'rider',
    'rider': 'rider',
    'vanguard': 'rider',
    'vanguardbase': 'rider',
    'vanguardBase': 'rider',
    'dragoon': 'dragoon',
    'orcDragoon': 'dragoon',
    'vanguardRider': 'vanguardRider',
    'vanguard_rider': 'vanguardRider',
    'vanguardrider': 'vanguardRider',
    'grandVanguard': 'grandVanguard',
    'grandvanguard': 'grandVanguard',
    'vanguardLord': 'grandVanguard',
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

  const MERGED_ALIASES = { ...(UNIVERSAL_CLASS_ALIASES || {}), ...CLASS_ALIASES };

  for (const [alias, target] of Object.entries(MERGED_ALIASES)) {
    if (CLASS_SKILLS_ECHO[target] && !CLASS_SKILLS_ECHO[alias]) {
      CLASS_SKILLS_ECHO[alias] = [...CLASS_SKILLS_ECHO[target]];
    }
    if (CLASSES_ECHO[target] && !CLASSES_ECHO[alias]) {
      CLASSES_ECHO[alias] = { ...CLASSES_ECHO[target], id: alias };
    }
  }

  // ─── INTEGRAÇÃO DAS 158 HABILIDADES OFICIAIS (25 Classes Ativas + Shared) ───
  if (ALL_LOADED_SKILLS && ALL_LOADED_SKILLS.size > 0) {
    for (const [skillId, s] of ALL_LOADED_SKILLS.entries()) {
      const id = s.identity?.id || skillId;
      const classId = s.identity?.classId;
      const tierStr = s.identity?.tier;
      const unlockLvl = s.identity?.unlockLevel || 40;

      let tierNum = 1;
      let reqBook = null;
      let starRank = 1;
      let isUlt = false;

      if (tierStr === 'core_1') {
        tierNum = 1;
        reqBook = null;
        starRank = 1;
      } else if (tierStr === 'core_2') {
        tierNum = 2;
        reqBook = 'book_1star';
        starRank = 1;
      } else if (tierStr === 'specialization_1' || tierStr === 'specialization') {
        tierNum = 2;
        reqBook = 'book_2star';
        starRank = 2;
      } else if (tierStr === 'specialization_2' || tierStr === 'elemental_specialization') {
        tierNum = 3;
        reqBook = 'book_3star';
        starRank = 3;
      } else if (tierStr === 'ultimate') {
        tierNum = 4;
        reqBook = 'book_4star';
        starRank = 4;
        isUlt = true;
      } else if (tierStr === 'master_ultimate') {
        tierNum = 5;
        reqBook = 'book_5star';
        starRank = 5;
        isUlt = true;
      }

      const rawName = s.identity?.name || id;
      const icon = resolveSkillIcon(rawName, s, null, classId);
      const isBuff = s.identity?.role === 'buff' || s.identity?.role === 'tank';
      const isHeal = s.identity?.role === 'heal' || /heal|cura|curativa/i.test(rawName);
      const isVampiric = /drain|dreno|siphon|sifão|vampir/i.test(id) || /drain|dreno|siphon|sifão|vampir/i.test(rawName);
      const dmgMult = s.gameplay?.damageMultiplier || 1.4;
      const staggerDmg = s.gameplay?.staggerDamage || 25;
      const cd = s.gameplay?.cooldown || 5000;
      const spCost = isUlt ? (tierNum === 5 ? 150 : 100) : (tierNum >= 3 ? 60 : 30);

      let mpCost = 0;
      if (s.identity?.role !== 'passive') {
        if (typeof s.gameplay?.mpCost === 'number' && s.gameplay.mpCost > 0) {
          mpCost = s.gameplay.mpCost;
        } else {
          mpCost = getSkillMpCost({ tier: tierNum, isUltimate: isUlt, starRank, type: isBuff ? 'buff' : 'active' });
        }
      }

      SKILL_DEFS_ECHO[id] = {
        id,
        name: rawName,
        type: isBuff ? 'buff' : 'active',
        tier: tierNum,
        cost: spCost,
        max: 5,
        pwr: Math.round(dmgMult * 10),
        baseCd: cd,
        mpCost,
        effect: isBuff ? 'warcry' : (isHeal ? 'heal' : (isVampiric ? 'vampiric' : 'dmg')),
        info: s.identity?.description || rawName,
        desc: s.identity?.description || '',
        effectText: `Multiplicador: ${dmgMult.toFixed(1)}x | Stagger: ${staggerDmg}`,
        icon,
        classReq: classId,
        reqLvl: unlockLvl,
        requiredWeapon: s.gameplay?.requiredWeapon?.[0] || 'any',
        requiredShield: s.gameplay?.requiredWeapon?.includes('shield') || false,
        requiredItemToUnlock: reqBook,
        isUltimate: isUlt,
        starRank,
        overhit: true
      };

      SKILL_REQS_ECHO[id] = { reqLvl: unlockLvl };

      if (classId) {
        CLASS_SKILLS_ECHO[classId] = CLASS_SKILLS_ECHO[classId] || [];
        if (!CLASS_SKILLS_ECHO[classId].includes(id)) {
          CLASS_SKILLS_ECHO[classId].push(id);
        }

        const canonicalTarget = MERGED_ALIASES[classId] || (typeof resolveCanonicalClassId === 'function' ? resolveCanonicalClassId(classId) : null);
        if (canonicalTarget) {
          CLASS_SKILLS_ECHO[canonicalTarget] = CLASS_SKILLS_ECHO[canonicalTarget] || [];
          if (!CLASS_SKILLS_ECHO[canonicalTarget].includes(id)) {
            CLASS_SKILLS_ECHO[canonicalTarget].push(id);
          }
        }
        for (const [alias, target] of Object.entries(MERGED_ALIASES)) {
          if (target === classId || alias === classId) {
            CLASS_SKILLS_ECHO[alias] = CLASS_SKILLS_ECHO[alias] || [];
            if (!CLASS_SKILLS_ECHO[alias].includes(id)) {
              CLASS_SKILLS_ECHO[alias].push(id);
            }
          }
        }
      }
    }

    // Anti-pollution strict enforcement: each active class must contain ONLY its canonical skills
    for (const [skillId, s] of ALL_LOADED_SKILLS.entries()) {
      const cid = s.identity?.classId;
      if (cid && Array.isArray(CLASS_SKILLS_ECHO[cid])) {
        CLASS_SKILLS_ECHO[cid] = CLASS_SKILLS_ECHO[cid].filter(sid => {
          const def = ALL_LOADED_SKILLS.get(sid);
          return def && def.identity?.classId === cid;
        });
      }
    }
  }

  // ─── LAYOUT E ORDENAÇÃO DE HABILIDADES (2 Colunas Limpas e Elegantes) ───
  const TIER_ORDER = {
    core_1: 0,
    core_2: 1,
    specialization: 2,
    specialization_1: 2,
    elemental_specialization: 3,
    specialization_2: 3,
    ultimate: 4,
    master_ultimate: 5
  };
  const TIER_COORDS = {
    core_1: { col: 0, row: 0 },
    core_2: { col: 1, row: 0 },
    specialization: { col: 0, row: 1 },
    specialization_1: { col: 0, row: 1 },
    elemental_specialization: { col: 1, row: 1 },
    specialization_2: { col: 1, row: 1 },
    ultimate: { col: 0, row: 2 },
    master_ultimate: { col: 1, row: 2 }
  };

  const SKILL_TREE_LAYOUT_ECHO = {};

  // 1. Coordenadas fixas para as 150 skills oficiais
  if (ALL_LOADED_SKILLS && ALL_LOADED_SKILLS.size > 0) {
    for (const [skillId, s] of ALL_LOADED_SKILLS.entries()) {
      const coords = TIER_COORDS[s.identity?.tier];
      if (coords) {
        SKILL_TREE_LAYOUT_ECHO[skillId] = { ...coords };
      }
    }
  }

  // 2. Mapeamento canônico estrito para as 25 classes ativas (EXATAMENTE 6 habilidades por classe)
  const ACTIVE_CLASS_SKILLS = {};
  if (ALL_LOADED_SKILLS && ALL_LOADED_SKILLS.size > 0) {
    for (const [skillId, s] of ALL_LOADED_SKILLS.entries()) {
      const classId = s.identity?.classId;
      if (classId && classId !== 'shared') {
        if (!ACTIVE_CLASS_SKILLS[classId]) ACTIVE_CLASS_SKILLS[classId] = [];
        ACTIVE_CLASS_SKILLS[classId].push(skillId);
      }
    }
  }

  for (const [classId, skills] of Object.entries(ACTIVE_CLASS_SKILLS)) {
    // Ordenação canônica estrita: Core 1, Core 2, Spec 1, Spec 2, Ultimate, Master Ultimate
    skills.sort((a, b) => {
      const sA = ALL_LOADED_SKILLS.get(a);
      const sB = ALL_LOADED_SKILLS.get(b);
      const orderA = sA?.identity?.tier && TIER_ORDER[sA.identity.tier] !== undefined ? TIER_ORDER[sA.identity.tier] : 99;
      const orderB = sB?.identity?.tier && TIER_ORDER[sB.identity.tier] !== undefined ? TIER_ORDER[sB.identity.tier] : 99;
      return orderA - orderB;
    });

    // Sobrescreve com exatamente as 6 habilidades canônicas (elimina poluição legada)
    CLASS_SKILLS_ECHO[classId] = [...skills];
    const canonicalTarget = MERGED_ALIASES[classId] || (typeof resolveCanonicalClassId === 'function' ? resolveCanonicalClassId(classId) : null);
    if (canonicalTarget && !ACTIVE_CLASS_SKILLS[canonicalTarget]) {
      // Proteção rigorosa: dwarf_mage nunca pode sobrescrever classes da linhagem de magos humanos
      if (classId === 'dwarf_mage' && ['mage', 'human_mage', 'sorcerer', 'archmage', 'wizard'].includes(canonicalTarget)) {
        // não sobrescreve
      } else {
        CLASS_SKILLS_ECHO[canonicalTarget] = [...skills];
      }
    }
    for (const [alias, target] of Object.entries(MERGED_ALIASES)) {
      // Nunca sobrescrever outra classe ativa distinta
      if (ACTIVE_CLASS_SKILLS[alias] && alias !== classId) continue;
      // Proteção rigorosa: dwarf_mage nunca pode sobrescrever classes da linhagem de magos humanos
      if (classId === 'dwarf_mage' && ['mage', 'human_mage', 'sorcerer', 'archmage', 'wizard'].includes(alias)) continue;

      if (target === classId || alias === classId) {
        CLASS_SKILLS_ECHO[alias] = [...skills];
      }
    }
  }

  // Garantia canônica da linhagem do Mago Humano (Sorcerer / Archmage)
  if (ACTIVE_CLASS_SKILLS['human_sorcerer']) {
    const sorcererSkills = [...ACTIVE_CLASS_SKILLS['human_sorcerer']];
    ['human_sorcerer'].forEach(alias => {
      CLASS_SKILLS_ECHO[alias] = [...sorcererSkills];
    });
    const baseMageSkills = (typeof CANONICAL_CLASS_REGISTRY_V2 !== 'undefined' && CANONICAL_CLASS_REGISTRY_V2?.mage?.skillIds)
      ? [...CANONICAL_CLASS_REGISTRY_V2.mage.skillIds]
      : ['wind_strike', 'flame_strike', 'ice_bolt', 'self_heal', 'sleep', 'mages_will', 'robe_mastery', 'mp_increase'];
    CLASS_SKILLS_ECHO['mage'] = [...baseMageSkills];
    CLASS_SKILLS_ECHO['human_mage'] = [...baseMageSkills];
    // Reconstrução dinâmica do pool de Wizard a partir dos dados canônicos existentes (CLASSES_ECHO)
    if (CLASS_SKILLS_ECHO['wizard'] && CLASS_SKILLS_ECHO['wizard'].length > 0) {
      CLASS_SKILLS_ECHO['human_wizard'] = [...CLASS_SKILLS_ECHO['wizard']];
    }
  }

  // Registro explícito do pool compartilhado por Arquétipo (Lv 1–39)
  const SHARED_MAGE_SKILL_IDS = [
    'wind_strike', 'flame_strike', 'hydro_strike', 'heal_light', 'ice_bolt'
  ];
  const SHARED_FIGHTER_SKILL_IDS = [
    'power_strike', 'mortal_blow', 'iron_punch', 'energy_burst', 'power_shot'
  ];
  const SHARED_SKILL_IDS = [
    ...SHARED_MAGE_SKILL_IDS,
    ...SHARED_FIGHTER_SKILL_IDS
  ];
  CLASS_SKILLS_ECHO['shared'] = [...SHARED_SKILL_IDS];
  CLASS_SKILLS_ECHO['shared_mage'] = [...SHARED_MAGE_SKILL_IDS];
  CLASS_SKILLS_ECHO['shared_fighter'] = [...SHARED_FIGHTER_SKILL_IDS];

  // ─── CANONICAL V2 INTEGRATION (46 Lineages, 142 Class Stages, 825 Skills) ───
  if (CANONICAL_SKILL_REGISTRY_V2) {
    for (const [sId, s] of Object.entries(CANONICAL_SKILL_REGISTRY_V2)) {
      if (s.disabled || isPurgedSkill(sId) || s.removalReason === 'cosmetic_mount_purge') {
        continue;
      }
      if (!SKILL_DEFS_ECHO[sId]) {
        SKILL_DEFS_ECHO[sId] = transformV2SkillToEcho(sId, s);
        if (!SKILL_REQS_ECHO[sId]) {
          SKILL_REQS_ECHO[sId] = { reqLvl: 1 };
        }
      } else {
        transformV2SkillToEcho(sId, s, SKILL_DEFS_ECHO[sId]);
      }
    }
  }

  const CLASS_SKILLS_V2_ECHO = {};
  if (CANONICAL_CLASS_REGISTRY_V2) {
    for (const [classId, classDef] of Object.entries(CANONICAL_CLASS_REGISTRY_V2)) {
      if (Array.isArray(classDef.skillIds)) {
        CLASS_SKILLS_V2_ECHO[classId] = [...classDef.skillIds];
        CLASS_SKILLS_ECHO[classId] = [...classDef.skillIds];

        for (const sid of classDef.skillIds) {
          if (SHARED_SKILL_IDS.includes(sid)) continue;
          if (SKILL_DEFS_ECHO[sid]) {
            const sDef = SKILL_DEFS_ECHO[sid];
            const currentReq = sDef.reqLvl;
            const isMasterUlt = sDef.starRank === 5 || sDef.tier === 5 || currentReq >= 90;
            const isUlt = sDef.isUltimate || sDef.starRank === 4 || sDef.tier === 4 || currentReq >= 80;

            let targetReq = classDef.minLevel;
            if (isMasterUlt) {
              targetReq = 90;
            } else if (isUlt) {
              targetReq = 80;
            } else if (classDef.stage === 0) {
              targetReq = 1;
            } else if (currentReq && currentReq > 1 && currentReq < classDef.minLevel) {
              targetReq = currentReq;
            }

            sDef.reqLvl = targetReq;
            SKILL_REQS_ECHO[sid] = { reqLvl: targetReq };
          }
        }
      }
      if (classDef.lineageId && !CLASS_SKILLS_ECHO[classDef.lineageId]) {
        CLASS_SKILLS_ECHO[classDef.lineageId] = [...classDef.skillIds];
      }
    }

    // Ensure all Stage 0 (Base class) skills have strictly reqLvl = 1
    for (const classDef of Object.values(CANONICAL_CLASS_REGISTRY_V2)) {
      if (classDef.stage === 0 && Array.isArray(classDef.skillIds)) {
        for (const sid of classDef.skillIds) {
          if (SKILL_DEFS_ECHO[sid]) {
            SKILL_DEFS_ECHO[sid].reqLvl = 1;
            SKILL_REQS_ECHO[sid] = { reqLvl: 1 };
          }
        }
      }
    }
  }

  // Ensure all shared generalist skills remain strictly Lv 1
  for (const sid of SHARED_SKILL_IDS) {
    if (SKILL_DEFS_ECHO[sid]) {
      SKILL_DEFS_ECHO[sid].reqLvl = 1;
      SKILL_REQS_ECHO[sid] = { reqLvl: 1 };
    }
  }

  if (CLASS_SKILLS_ECHO['mage']) {
    CLASS_SKILLS_ECHO['human_mage'] = [...CLASS_SKILLS_ECHO['mage']];
  }
  if (CLASS_SKILLS_ECHO['wizard']) {
    CLASS_SKILLS_ECHO['human_wizard'] = [...CLASS_SKILLS_ECHO['wizard']];
  }

  // Coordenadas fixas para as 10 shared skills (Grid 5x2)
  SHARED_SKILL_IDS.forEach((sid, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    SKILL_TREE_LAYOUT_ECHO[sid] = { col, row };
  });

  // 3. Monta layouts para todas as classes
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const layout = {};
    skillIds.forEach((sid, idx) => {
      const explicit = SKILL_TREE_LAYOUT_ECHO[sid];
      if (explicit) {
        layout[sid] = explicit;
      } else {
        const col = idx % 2;
        const row = Math.floor(idx / 2) + 3;
        layout[sid] = { col, row };
        if (!SKILL_TREE_LAYOUT_ECHO[sid]) {
          SKILL_TREE_LAYOUT_ECHO[sid] = { col, row };
        }
      }
    });

    SKILL_TREE_LAYOUT_ECHO[classId] = layout;
  }

  // 4. Propaga layouts para todos os aliases
  for (const [alias, target] of Object.entries(MERGED_ALIASES)) {
    if (SKILL_TREE_LAYOUT_ECHO[target] && !SKILL_TREE_LAYOUT_ECHO[alias]) {
      SKILL_TREE_LAYOUT_ECHO[alias] = SKILL_TREE_LAYOUT_ECHO[target];
    }
  }

  // Propagação explícita de layouts para a linhagem do Mago Humano (Sorcerer / Archmage)
  if (SKILL_TREE_LAYOUT_ECHO['human_sorcerer']) {
    ['sorcerer', 'archmage'].forEach(alias => {
      SKILL_TREE_LAYOUT_ECHO[alias] = SKILL_TREE_LAYOUT_ECHO['human_sorcerer'];
    });
  }

  // Limpeza definitiva de habilidades cosméticas, montarias e transformações
  for (const sId of Object.keys(SKILL_DEFS_ECHO)) {
    if (isPurgedSkill(sId) || SKILL_DEFS_ECHO[sId]?.disabled) {
      delete SKILL_DEFS_ECHO[sId];
      delete SKILL_REQS_ECHO[sId];
    }
  }
  for (const [cId, skills] of Object.entries(CLASS_SKILLS_ECHO)) {
    CLASS_SKILLS_ECHO[cId] = skills.filter(sid => !isPurgedSkill(sid));
  }

  // Publica em window.EchoData (o que main.js lê)
  E.SKILL_DEFS_ECHO        = SKILL_DEFS_ECHO;
  E.SKILL_REQS_ECHO        = SKILL_REQS_ECHO;
  E.CLASS_SKILLS_ECHO      = CLASS_SKILLS_ECHO;
  E.SKILL_TREE_LAYOUT_ECHO = SKILL_TREE_LAYOUT_ECHO;
  E.CASH_SHOP_CATALOG      = CASH_SHOP_CATALOG;
  E.HEIRLOOM_ITEMS         = HEIRLOOM_ITEMS;
  E.SHARED_SKILL_IDS         = SHARED_SKILL_IDS;
  E.SHARED_MAGE_SKILL_IDS    = SHARED_MAGE_SKILL_IDS;
  E.SHARED_FIGHTER_SKILL_IDS = SHARED_FIGHTER_SKILL_IDS;
  E.CANONICAL_SKILL_REGISTRY_V2 = CANONICAL_SKILL_REGISTRY_V2;
  E.CANONICAL_CLASS_REGISTRY_V2 = CANONICAL_CLASS_REGISTRY_V2;
  E.CLASS_SKILLS_V2_ECHO        = CLASS_SKILLS_V2_ECHO;

  console.log(
    '[echo-adapter] Skills autênticas geradas:', Object.keys(SKILL_DEFS_ECHO).length,
    '| Classes com árvore completa:', Object.keys(CLASS_SKILLS_ECHO).length
  );
}

buildEchoAdapter();
