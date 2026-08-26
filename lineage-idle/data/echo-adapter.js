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
  return '/assets/skills/icons/power_strike.png';
}

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
        const arch = (classDef.archetype || classId || '').toLowerCase();
        if (arch.includes('archer') || sName.includes('shot') || sName.includes('arrow') || sName.includes('bow')) {
          reqWeapon = 'bow';
        } else if (arch.includes('dagger') || arch.includes('assassin') || sName.includes('stab') || sName.includes('blow') || sName.includes('dagger')) {
          reqWeapon = 'dagger';
        } else if (arch.includes('tank') || arch.includes('knight') || arch.includes('paladin') || sName.includes('shield') || sName.includes('stun')) {
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
        requiredItemToUnlock: requiredBook,
        isUltimate:           is4Star,
        starRank:             starRank
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

  for (const [alias, target] of Object.entries(CLASS_ALIASES)) {
    if (CLASS_SKILLS_ECHO[target] && !CLASS_SKILLS_ECHO[alias]) {
      CLASS_SKILLS_ECHO[alias] = [...CLASS_SKILLS_ECHO[target]];
    }
    if (CLASSES_ECHO[target] && !CLASSES_ECHO[alias]) {
      CLASSES_ECHO[alias] = { ...CLASSES_ECHO[target], id: alias };
    }
  }

  // ─── LAYOUT DA ÁRVORE DE HABILIDADES (2 Colunas Limpas e Elegantes) ───
  const SKILL_TREE_LAYOUT_ECHO = {};
  for (const [classId, skillIds] of Object.entries(CLASS_SKILLS_ECHO)) {
    const layout = {};
    skillIds.forEach((sid, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      layout[sid] = { col, row };
      if (!SKILL_TREE_LAYOUT_ECHO[sid]) {
        SKILL_TREE_LAYOUT_ECHO[sid] = { col, row };
      }
    });

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
