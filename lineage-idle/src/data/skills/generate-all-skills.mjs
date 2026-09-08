import fs from 'fs';
import {
  NATIVE_SKILL_TREES,
  ULTIMATE_SKILLS,
  MASTER_ULTIMATE_SKILLS
} from '../elemental/NativeSkillTrees.js';

const raceDirMap = {
  human_fighter: 'human',
  human_sorcerer: 'human',
  human_death_knight: 'human',
  human_warg: 'human',
  human_assassin: 'human',
  elf_fighter: 'elf',
  elf_mage: 'elf',
  elf_death_knight: 'elf',
  dark_elf_fighter: 'dark_elf',
  dark_elf_mage: 'dark_elf',
  dark_elf_death_knight: 'dark_elf',
  dark_elf_assassin: 'dark_elf',
  dark_elf_blood_rose: 'dark_elf',
  orc_fighter: 'orc',
  orc_shaman: 'orc',
  orc_vanguard_rider: 'orc',
  dwarf_artisan: 'dwarf',
  dwarf_mage: 'dwarf',
  dwarf_shinemaker: 'dwarf',
  kamael_soulbreaker: 'kamael',
  kamael_samurai: 'kamael',
  ertheia_storm_blaster: 'ertheia',
  ertheia_marauder: 'ertheia',
  high_elf_divine_templar: 'high_elf',
  high_elf_element_weaver: 'high_elf'
};

const raceSlugMap = {
  human: 'human',
  elf: 'elf',
  dark_elf: 'dark_elf',
  orc: 'orc',
  dwarf: 'dwarf',
  kamael: 'kamael',
  ertheia: 'ertheia',
  high_elf: 'high_elf'
};

const elementColorMap = {
  Physical: { main: '#fbbf24', light: '#fef08a', flash: '#fef3c7' },
  Fire: { main: '#ef4444', light: '#f97316', flash: '#fde047' },
  Magma: { main: '#ea580c', light: '#f97316', flash: '#fed7aa' },
  Water: { main: '#0284c7', light: '#38bdf8', flash: '#e0f2fe' },
  Wind: { main: '#10b981', light: '#6ee7b7', flash: '#d1fae5' },
  Earth: { main: '#b45309', light: '#d97706', flash: '#fef3c7' },
  Holy: { main: '#eab308', light: '#fde047', flash: '#ffffff' },
  Dark: { main: '#7c3aed', light: '#a855f7', flash: '#f3e8ff' },
  Neutral: { main: '#64748b', light: '#94a3b8', flash: '#f1f5f9' }
};

const roleMap = {
  burst_damage: 'burst',
  aoe_damage: 'area',
  crowd_control: 'control',
  defensive_shield: 'tank',
  finisher: 'finisher',
  buff_support: 'buff',
  mobility: 'mobility',
  sustain_heal: 'heal',
  debuff_hex: 'debuff',
  dot: 'damage'
};

const classWeaponMap = {
  human_fighter: ['sword', 'blunt', 'shield'],
  human_sorcerer: ['staff', 'wand'],
  human_death_knight: ['two_handed_sword', 'sword'],
  human_warg: ['fist', 'claws', 'any'],
  human_assassin: ['dagger', 'dual_daggers'],
  elf_fighter: ['bow', 'dagger'],
  elf_mage: ['staff', 'wand'],
  elf_death_knight: ['sword', 'rapier'],
  dark_elf_fighter: ['dual_swords', 'dagger'],
  dark_elf_mage: ['staff', 'spellbook'],
  dark_elf_death_knight: ['two_handed_sword', 'sword'],
  dark_elf_assassin: ['dual_daggers', 'dagger'],
  dark_elf_blood_rose: ['whip', 'rapier', 'wand'],
  orc_fighter: ['two_handed_axe', 'blunt', 'fist'],
  orc_shaman: ['totem', 'staff', 'blunt'],
  orc_vanguard_rider: ['spear', 'lance', 'blunt'],
  dwarf_artisan: ['hammer', 'blunt', 'wrench'],
  dwarf_mage: ['earth_staff', 'hammer', 'blunt'],
  dwarf_shinemaker: ['radiant_hammer', 'shield', 'blunt'],
  kamael_soulbreaker: ['rapier', 'ancient_sword'],
  kamael_samurai: ['katana', 'dual_swords'],
  ertheia_storm_blaster: ['magic_cannon', 'fist', 'staff'],
  ertheia_marauder: ['wind_daggers', 'fist', 'dual_swords'],
  high_elf_divine_templar: ['divine_shield', 'sword', 'mace'],
  high_elf_element_weaver: ['prism_staff', 'orb', 'wand']
};

let totalGenerated = 0;

for (const [classId, raceDir] of Object.entries(raceDirMap)) {
  const baseSkills = NATIVE_SKILL_TREES[classId] || [];
  const ult = ULTIMATE_SKILLS.find(s => s.classId === classId);
  const master = MASTER_ULTIMATE_SKILLS.find(s => s.classId === classId);

  const fullClassSkills = [...baseSkills, ult, master].filter(Boolean);

  const mappedSkills = fullClassSkills.map((s, idx) => {
    const isUlt = idx === 4;
    const isMaster = idx === 5;
    const tier = isMaster ? 'master_ultimate' : (isUlt ? 'ultimate' : (idx === 0 ? 'core_1' : (idx === 1 ? 'core_2' : (idx === 2 ? 'specialization' : 'elemental_specialization'))));
    const unlockLevel = isMaster ? 90 : (isUlt ? 80 : (idx === 3 && s.requiredLevel ? s.requiredLevel : 40));
    
    const primaryElement = s.elements?.[0] || 'Physical';
    const colors = elementColorMap[primaryElement] || elementColorMap.Physical;
    const normalizedRole = roleMap[s.role] || 'damage';
    const weapons = classWeaponMap[classId] || ['any'];

    // Timeline phases
    const totalDuration = isMaster ? 1500 : (isUlt ? 1100 : (450 + idx * 40));
    const anticipationDuration = isMaster ? 400 : (isUlt ? 300 : (100 + idx * 20));
    const impactDuration = totalDuration - anticipationDuration;

    const anticipationActions = [
      { time: 0, type: 'animation', params: { trigger: isMaster ? 'genesis_channel' : (isUlt ? 'ultimate_charge' : 'skill_windup') } },
      { time: 30, type: 'lighting', params: { type: 'cast_glow', color: colors.light, radius: isMaster ? 220 : (isUlt ? 150 : 80), intensity: isMaster ? 1.8 : (isUlt ? 1.2 : 0.7) } }
    ];

    if (isMaster || isUlt) {
      anticipationActions.unshift({
        time: 0,
        type: 'lighting',
        params: {
          type: 'ambient_dim',
          color: isMaster ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.65)',
          duration: isMaster ? 900 : 600,
          restoreDuration: isMaster ? 500 : 400
        }
      });
      anticipationActions.push({
        time: 100,
        type: 'shader',
        params: { type: 'bloom', intensity: isMaster ? 2.0 : 1.2, duration: 400 }
      });
    }

    const impactActions = [
      {
        time: 0,
        type: 'vfx',
        params: {
          type: isMaster ? 'titanbreaker' : (isUlt ? 'impact_burst' : (normalizedRole === 'area' ? 'slash_arc' : 'impact_burst')),
          color: colors.main,
          particleCount: isMaster ? 50 : (isUlt ? 35 : (16 + idx * 3)),
          radius: isMaster ? 200 : (isUlt ? 140 : 70)
        }
      },
      {
        time: 0,
        type: 'camera_fx',
        params: {
          shake: isMaster ? 1.0 : (isUlt ? 0.8 : (0.25 + idx * 0.08)),
          hitStop: isMaster ? 160 : (isUlt ? 120 : (50 + idx * 10)),
          zoom: isMaster ? 1.12 : (isUlt ? 1.08 : 1.03)
        }
      },
      {
        time: 0,
        type: 'lighting',
        params: {
          type: 'impact_flash',
          color: colors.flash,
          radius: isMaster ? 300 : (isUlt ? 220 : (120 + idx * 15)),
          intensity: isMaster ? 2.0 : (isUlt ? 1.5 : 1.0),
          duration: isMaster ? 350 : 200
        }
      }
    ];

    if (isMaster || isUlt || idx === 3) {
      impactActions.push({
        time: 20,
        type: 'shader',
        params: {
          type: 'shockwave',
          maxRadius: isMaster ? 320 : (isUlt ? 220 : 120),
          speed: isMaster ? 800 : (isUlt ? 650 : 550)
        }
      });
      impactActions.push({
        time: 20,
        type: 'shader',
        params: {
          type: 'chromatic',
          offset: isMaster ? 14 : (isUlt ? 9 : 5),
          duration: isMaster ? 350 : 200
        }
      });
    }

    const phases = [
      {
        name: 'anticipation',
        start: 0,
        duration: anticipationDuration,
        actions: anticipationActions
      },
      {
        name: 'impact',
        start: anticipationDuration,
        duration: impactDuration,
        actions: impactActions
      }
    ];

    const particleBudget = isMaster ? 220 : (isUlt ? 160 : (45 + idx * 10));
    const drawCalls = isMaster ? 8 : (isUlt ? 6 : (3 + (idx > 2 ? 1 : 0)));
    const layerPriority = isMaster ? 10 : (isUlt ? 8 : (3 + idx));

    return {
      identity: {
        id: s.id,
        name: s.name,
        classId,
        race: raceSlugMap[raceDir] || raceDir,
        tier,
        unlockLevel,
        element: primaryElement,
        role: normalizedRole,
        tags: s.tags || [primaryElement],
        description: `${s.name} — Habilidade ${isMaster ? 'Master Ultimate (★★★★★)' : (isUlt ? 'Ultimate (★★★★)' : 'Especialista')} de ${classId}.`
      },
      gameplay: {
        castTime: isMaster ? 600 : (isUlt ? 450 : (200 + idx * 40)),
        cooldown: isMaster ? 40000 : (isUlt ? 25000 : (4000 + idx * 1000)),
        mpCost: isMaster ? 90 : (isUlt ? 60 : (15 + idx * 4)),
        damageMultiplier: isMaster ? 5.2 : (isUlt ? 3.6 : (1.4 + idx * 0.2)),
        hitCount: isMaster ? 5 : (isUlt ? 3 : 1),
        staggerDamage: isMaster ? 180 : (isUlt ? 100 : (25 + idx * 8)),
        critModifier: isMaster ? 2.5 : (isUlt ? 2.0 : (1.4 + idx * 0.1)),
        targetType: isMaster ? 'all_enemies' : (isUlt ? 'aoe_circle' : (normalizedRole === 'area' ? 'aoe_circle' : 'single')),
        range: normalizedRole === 'area' || isUlt ? 220 : 130,
        requiredWeapon: weapons,
        statusEffects: isMaster ? [{ effect: 'obliterate', chance: 1.0, duration: 6000, value: 0.4 }] : (isUlt ? [{ effect: 'stun', chance: 0.9, duration: 3000, value: 1 }] : [])
      },
      hitbox: {
        type: isMaster ? 'screen' : (isUlt || normalizedRole === 'area' ? 'circle' : 'point'),
        radius: isMaster ? undefined : (isUlt || normalizedRole === 'area' ? 90 : 35),
        width: isMaster ? 600 : undefined,
        height: isMaster ? 400 : undefined,
        offset: { x: 20, y: 0 }
      },
      timeline: {
        totalDuration,
        phases
      },
      game_feel: {
        hitStop: {
          duration: isMaster ? 160 : (isUlt ? 120 : (50 + idx * 10)),
          timeScale: isMaster ? 0.01 : (isUlt ? 0.03 : 0.05),
          target: 'all'
        },
        cameraShake: {
          intensity: isMaster ? 1.0 : (isUlt ? 0.8 : (0.25 + idx * 0.08)),
          decay: 1.8,
          duration: isMaster ? 400 : (isUlt ? 300 : 180),
          direction: isMaster || isUlt ? 'omni' : 'horizontal'
        },
        cameraZoom: {
          factor: isMaster ? 1.12 : (isUlt ? 1.08 : 1.03),
          duration: isMaster ? 400 : (isUlt ? 300 : 180),
          ease: 'ease-out'
        },
        screenFlash: {
          color: colors.flash,
          duration: isMaster ? 220 : (isUlt ? 160 : 90),
          opacity: isMaster ? 0.55 : (isUlt ? 0.4 : 0.2)
        }
      },
      lighting: {
        ambientDim: (isMaster || isUlt) ? {
          targetColor: isMaster ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.65)',
          duration: isMaster ? 900 : 600,
          restoreDuration: isMaster ? 500 : 400
        } : undefined,
        castGlow: {
          color: colors.light,
          radius: isMaster ? 220 : (isUlt ? 150 : 80),
          intensity: isMaster ? 1.8 : (isUlt ? 1.2 : 0.7)
        },
        impactFlash: {
          color: colors.flash,
          radius: isMaster ? 300 : (isUlt ? 220 : 120),
          intensity: isMaster ? 2.0 : (isUlt ? 1.5 : 1.0)
        }
      },
      hud: {
        damageNumbers: {
          style: isMaster || isUlt ? 'colossal' : 'heavy',
          scale: isMaster ? 1.8 : (isUlt ? 1.5 : 1.1),
          animation: isMaster || isUlt ? 'slam_explode' : 'bounce',
          color: colors.main
        },
        statusIcons: [],
        announcement: (isMaster || isUlt) ? {
          text: `${s.name.toUpperCase()}!`,
          style: isMaster ? 'mythic_banner' : 'gold_banner',
          banner: true
        } : undefined
      },
      performance: {
        particleBudget,
        drawCalls,
        layerPriority,
        poolKey: `pool_${s.id}`,
        allowConcurrent: !isMaster && !isUlt
      },
      signature: {
        author: 'AdenArenaEngine',
        version: '1.0.0',
        uniqueVfxSignature: `vfx_sig_${classId}_${s.id}_${idx}`
      }
    };
  });

  const filePath = `lineage-idle/src/data/skills/${raceDir}/${classId}.json`;
  fs.writeFileSync(filePath, JSON.stringify({ classId, skills: mappedSkills }, null, 2));
  totalGenerated += mappedSkills.length;
}

console.log(`Successfully generated ${totalGenerated} skills across 25 class files!`);
