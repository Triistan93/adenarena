globalThis.window = globalThis;
globalThis.EchoData = {};

import fs from 'fs';
import path from 'path';

async function generatePrompts() {
  await import('../adenarena/lineage-idle/data/echo-adapter.js');
  const { HEROIC_SKILLS } = await import('../adenarena/lineage-idle/src/data/olympiad.js');

  const echoDefs = globalThis.EchoData?.SKILL_DEFS_ECHO || {};
  const skillEntries = Object.entries(echoDefs);

  const uniqueSkillsMap = new Map();

  for (const [id, def] of skillEntries) {
    const rawName = def.name || id;
    // Normalize clean name by stripping generic level suffixes like Lv1, Lv2
    const cleanName = rawName.replace(/\s+Lv\d+/i, '').trim();
    if (!uniqueSkillsMap.has(cleanName)) {
      uniqueSkillsMap.set(cleanName, {
        id,
        name: cleanName,
        type: def.type || (def.passive ? 'passive' : 'active'),
        desc: def.desc || ''
      });
    }
  }

  // Add Heroic and Noblesse skills
  for (const [id, def] of Object.entries(HEROIC_SKILLS)) {
    const cleanName = def.name.replace(/[👑🛡️⚡💥]/g, '').trim();
    uniqueSkillsMap.set(cleanName, {
      id,
      name: def.name,
      type: def.type,
      desc: def.desc,
      category: 'Habilidades Heroicas & Noblesse'
    });
  }

  uniqueSkillsMap.set('Blessing of Noble', {
    id: 'blessing_of_noble',
    name: 'Blessing of Noble 👑',
    type: 'buff',
    desc: 'Bênção Sagrada da Nobreza de Aden: Preserva todos os buffs ao renascer.',
    category: 'Habilidades Heroicas & Noblesse'
  });

  const skillsList = Array.from(uniqueSkillsMap.values());

  // Function to create tailored prompt based on skill name and context
  function createPrompt(skill) {
    const nameLower = skill.name.toLowerCase();
    const baseStyle = "RPG game skill icon, Lineage 2 aesthetic, square icon, vibrant glow, dark fantasy background, high detail, centered asset";

    // Specific classifications
    if (nameLower.includes('heroic valor')) {
      return `A majestic golden crest with glowing wings and radiant lion head, shimmering gold and amber aura, ${baseStyle}`;
    }
    if (nameLower.includes('heroic miracle')) {
      return `An impenetrable glowing diamond shield surrounded by heavenly light barriers and divine runes, ${baseStyle}`;
    }
    if (nameLower.includes('heroic berserker')) {
      return `A raging golden warrior silhouette engulfed in celestial lightning and blazing aura, ${baseStyle}`;
    }
    if (nameLower.includes('heroic grandeur')) {
      return `A golden shockwave expanding from an imperial crown, shattering enemy armor with radiant force, ${baseStyle}`;
    }
    if (nameLower.includes('blessing of noble')) {
      return `An ornate glowing gold noblesse tiara floating with angel feather sparkles and divine blessing rays, ${baseStyle}`;
    }
    if (nameLower.includes('soulshot') || nameLower.includes('spiritshot')) {
      return `A magical glowing crystal bullet emitting powerful energy trails, ${baseStyle}`;
    }
    if (nameLower.includes('fire') || nameLower.includes('flame') || nameLower.includes('burn') || nameLower.includes('blaze') || nameLower.includes('prominence')) {
      return `Swirling infernal flames and blazing fiery vortex bursting outward with orange and red embers, ${baseStyle}`;
    }
    if (nameLower.includes('ice') || nameLower.includes('frost') || nameLower.includes('freeze') || nameLower.includes('hydro') || nameLower.includes('aqua')) {
      return `Sharp crystalline ice shards and frosted glacial spikes bursting with cyan water magic and frost mist, ${baseStyle}`;
    }
    if (nameLower.includes('lightning') || nameLower.includes('thunder') || nameLower.includes('shock') || nameLower.includes('spark')) {
      return `Violent electric lightning bolts crackling across a stormy dark sphere, bright cyan and purple sparks, ${baseStyle}`;
    }
    if (nameLower.includes('wind') || nameLower.includes('gust') || nameLower.includes('cyclone') || nameLower.includes('tempest')) {
      return `A razor-sharp swirling green wind cyclone slicing through air with aerodynamic trails, ${baseStyle}`;
    }
    if (nameLower.includes('death') || nameLower.includes('corpse') || nameLower.includes('vampir') || nameLower.includes('drain') || nameLower.includes('shadow') || nameLower.includes('dark')) {
      return `Ominous glowing skull silhouette and dark purple necrotic smoke with vampiric blood energy tendrils, ${baseStyle}`;
    }
    if (nameLower.includes('heal') || nameLower.includes('cure') || nameLower.includes('restoration') || nameLower.includes('vitality') || nameLower.includes('bless')) {
      return `Radiant golden and emerald healing light cross with gentle glowing sparkles and soothing aura, ${baseStyle}`;
    }
    if (nameLower.includes('shield') || nameLower.includes('aegis') || nameLower.includes('guard') || nameLower.includes('defend') || nameLower.includes('barrier')) {
      return `An ornate reinforced steel and gold paladin shield glowing with protective blue magical runes, ${baseStyle}`;
    }
    if (nameLower.includes('sword') || nameLower.includes('blade') || nameLower.includes('slash') || nameLower.includes('strike') || nameLower.includes('smash') || nameLower.includes('cleave')) {
      return `A gleaming enchanted broadsword cutting through air with luminous trail sparks and dynamic motion, ${baseStyle}`;
    }
    if (nameLower.includes('bow') || nameLower.includes('arrow') || nameLower.includes('shot') || nameLower.includes('snipe') || nameLower.includes('pierce')) {
      return `A magical glowing arrow nocked on an elven wooden bow aiming with concentrated energy beam, ${baseStyle}`;
    }
    if (nameLower.includes('dagger') || nameLower.includes('stab') || nameLower.includes('blow') || nameLower.includes('stealth') || nameLower.includes('assassin')) {
      return `A lethal curved assassin dagger dripping with emerald poison and cloaked in dark smoke trails, ${baseStyle}`;
    }
    if (nameLower.includes('spear') || nameLower.includes('polearm') || nameLower.includes('whirlwind') || nameLower.includes('sweep')) {
      return `A heavy ornate halberd spear spinning in a wide sweeping arc with red dynamic wind trails, ${baseStyle}`;
    }
    if (nameLower.includes('blunt') || nameLower.includes('hammer') || nameLower.includes('crush') || nameLower.includes('stun') || nameLower.includes('earthquake')) {
      return `A massive warhammer smashing downward, causing ground fissures and kinetic impact shockwaves, ${baseStyle}`;
    }
    if (nameLower.includes('song') || nameLower.includes('dance') || nameLower.includes('rhythm') || nameLower.includes('melody')) {
      return `Twin elegant glowing swords surrounded by rhythmic musical note aura and swirling harmonic light, ${baseStyle}`;
    }
    if (nameLower.includes('haste') || nameLower.includes('speed') || nameLower.includes('fury') || nameLower.includes('rush') || nameLower.includes('dash')) {
      return `A blazing winged boot or speeding warrior silhouette with fiery motion blur and lightning trails, ${baseStyle}`;
    }
    if (nameLower.includes('might') || nameLower.includes('empower') || nameLower.includes('berserk') || nameLower.includes('frenzy') || nameLower.includes('power')) {
      return `A glowing muscular fist surrounded by raging crimson and golden combat aura with raw energy flares, ${baseStyle}`;
    }
    if (nameLower.includes('acumen') || nameLower.includes('clarity') || nameLower.includes('intellect') || nameLower.includes('wisdom') || nameLower.includes('focus')) {
      return `A glowing mystical eye inside an arcane tome with sapphire blue magical runes orbiting around, ${baseStyle}`;
    }
    if (nameLower.includes('mastery') || nameLower.includes('expertise') || nameLower.includes('boost') || nameLower.includes('passive')) {
      return `An intricate golden rune crest representing combat mastery and inner strength, ${baseStyle}`;
    }
    if (nameLower.includes('golem') || nameLower.includes('craft') || nameLower.includes('crystallize') || nameLower.includes('forge')) {
      return `A dwarven golden anvil with glowing runes and mechanical gears emitting forge embers, ${baseStyle}`;
    }
    if (nameLower.includes('soul') || nameLower.includes('kamael') || nameLower.includes('wing')) {
      return `A single majestic dark winged feather surrounded by iridescent purple soul orbs, ${baseStyle}`;
    }

    // Default fallback
    return `An enchanted glowing RPG magic emblem representing ${skill.name}, ${baseStyle}`;
  }

  // Group skills by category
  const categories = {
    "👑 Habilidades Heroicas, Noblesse & Especiais": [],
    "⚔️ Guerreiros, Cavaleiros & Tanques (Heavy Melee)": [],
    "🗡️ Assassinos, Arqueiros & Caçadores (Light & Dagger/Bow)": [],
    "🔮 Magos Elementais & Arcanos (Fire, Water, Wind, Earth)": [],
    "☠️ Necromantes, Bruxos & Trevas (Dark, Curses & Vampiric)": [],
    "✨ Clérigos, Bispos & Curandeiros (Holy, Heals & Resurrection)": [],
    "🎶 Bardos, Dançarinos & Buffers (Songs, Dances & Chants)": [],
    "🖤 Kamael & Caçadores de Almas (Souls, Rapiers & Crossbows)": [],
    "⚒️ Anões, Forja, Golens & Economia (Craft, Spoil & Golems)": [],
    "📜 Maestrias Passivas & Aumentos de Atributos (Passives)": []
  };

  for (const skill of skillsList) {
    const prompt = createPrompt(skill);
    const item = { ...skill, prompt };
    const nameLower = skill.name.toLowerCase();

    if (nameLower.includes('heroic') || nameLower.includes('noble') || skill.category?.includes('Noblesse')) {
      categories["👑 Habilidades Heroicas, Noblesse & Especiais"].push(item);
    } else if (nameLower.includes('heal') || nameLower.includes('cure') || nameLower.includes('resurrection') || nameLower.includes('greater battle heal') || nameLower.includes('mass resurrection') || nameLower.includes('body of avatar') || nameLower.includes('prayer')) {
      categories["✨ Clérigos, Bispos & Curandeiros (Holy, Heals & Resurrection)"].push(item);
    } else if (nameLower.includes('song of') || nameLower.includes('dance of') || nameLower.includes('chant of') || nameLower.includes('haste') || nameLower.includes('acumen') || nameLower.includes('might') || nameLower.includes('shield') || nameLower.includes('death whisper') || nameLower.includes('focus') || nameLower.includes('guidance') || nameLower.includes('bless the body') || nameLower.includes('bless the soul') || nameLower.includes('empower') || nameLower.includes('wild magic') || nameLower.includes('vampiric rage') || nameLower.includes('berserker spirit')) {
      categories["🎶 Bardos, Dançarinos & Buffers (Songs, Dances & Chants)"].push(item);
    } else if (nameLower.includes('dagger') || nameLower.includes('bow') || nameLower.includes('arrow') || nameLower.includes('mortal blow') || nameLower.includes('deadly blow') || nameLower.includes('backstab') || nameLower.includes('double shot') || nameLower.includes('snipe') || nameLower.includes('lethal shot') || nameLower.includes('bleed') || nameLower.includes('shadow step') || nameLower.includes('hide') || nameLower.includes('trick') || nameLower.includes('dash') || nameLower.includes('ultimate evasion')) {
      categories["🗡️ Assassinos, Arqueiros & Caçadores (Light & Dagger/Bow)"].push(item);
    } else if (nameLower.includes('corpse') || nameLower.includes('vampiric claw') || nameLower.includes('death spike') || nameLower.includes('anchor') || nameLower.includes('curse') || nameLower.includes('fear') || nameLower.includes('silence') || nameLower.includes('decay') || nameLower.includes('mass slow') || nameLower.includes('gloom') || nameLower.includes('abyss')) {
      categories["☠️ Necromantes, Bruxos & Trevas (Dark, Curses & Vampiric)"].push(item);
    } else if (nameLower.includes('fire') || nameLower.includes('prominence') || nameLower.includes('hydro blast') || nameLower.includes('ice') || nameLower.includes('frost') || nameLower.includes('wind') || nameLower.includes('tempest') || nameLower.includes('blazing') || nameLower.includes('aura flare') || nameLower.includes('solar flare') || nameLower.includes('volcano') || nameLower.includes('cyclone') || nameLower.includes('meteor') || nameLower.includes('vortex')) {
      categories["🔮 Magos Elementais & Arcanos (Fire, Water, Wind, Earth)"].push(item);
    } else if (nameLower.includes('spoil') || nameLower.includes('sweep') || nameLower.includes('craft') || nameLower.includes('crystallize') || nameLower.includes('golem') || nameLower.includes('hammer crush') || nameLower.includes('armor crush') || nameLower.includes('crush of doom') || nameLower.includes('fatal strike') || nameLower.includes('earthquake')) {
      categories["⚒️ Anões, Forja, Golens & Economia (Craft, Spoil & Golems)"].push(item);
    } else if (nameLower.includes('soul') || nameLower.includes('spread wing') || nameLower.includes('soul barrier') || nameLower.includes('dark smash') || nameLower.includes('shining edge') || nameLower.includes('twin shot') || nameLower.includes('soul clean') || nameLower.includes('hard march')) {
      categories["🖤 Kamael & Caçadores de Almas (Souls, Rapiers & Crossbows)"].push(item);
    } else if (nameLower.includes('mastery') || nameLower.includes('boost') || nameLower.includes('increase') || nameLower.includes('fast') || nameLower.includes('magic resistance') || nameLower.includes('toughness') || nameLower.includes('acrobatics') || nameLower.includes('iron body') || nameLower.includes('esprit')) {
      categories["📜 Maestrias Passivas & Aumentos de Atributos (Passives)"].push(item);
    } else {
      categories["⚔️ Guerreiros, Cavaleiros & Tanques (Heavy Melee)"].push(item);
    }
  }

  let mdContent = `# Catálogo de Prompts de IA para Ícones de Habilidades — Lineage II\n\n`;
  mdContent += `Guia completo com o nome de todas as habilidades do jogo e prompts otimizados em inglês para geração de ícones em IAs generativas (Midjourney, DALL-E 3, Stable Diffusion, Recraft ou Gemini).\n\n`;
  mdContent += `### 🎨 Dica de Parâmetros Recomendados para Midjourney / SD:\n`;
  mdContent += `> \`--ar 1:1 --v 6.1 --style raw\` (ou formato quadrado 512x512 / 1024x1024 com fundo escuro e borda de ícone)\n\n---\n\n`;

  for (const [catName, list] of Object.entries(categories)) {
    if (list.length === 0) continue;
    mdContent += `## ${catName} (${list.length} Habilidades)\n\n`;
    mdContent += `| Habilidade | Tipo | Prompt para IA Generativa |\n`;
    mdContent += `|---|---|---|\n`;
    for (const item of list) {
      mdContent += `| **${item.name}** | \`${item.type}\` | \`${item.prompt}\` |\n`;
    }
    mdContent += `\n---\n\n`;
  }

  fs.writeFileSync('C:/Users/duuha/.gemini/antigravity/brain/8e324eab-38b4-43e5-81fb-a8d8b4ca1124/skills_prompt_catalog.md', mdContent, 'utf8');
  console.log('Successfully written skills_prompt_catalog.md artifact!');
}

generatePrompts();
