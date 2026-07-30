// ================================================================
//  iconLoader.js  ·  SUBSTITUA o conteúdo inteiro do arquivo por este
//  (mantém a API pública: loadIconIndex() e getIcon())
//
//  Correções:
//    · fallback para itemId quando item.icon não existe
//    · aliases embutidos para renomeações conhecidas (blue_wolf_*,
//      major_arcana_robe, steel_plate, elven_garb, etc.)
//    · 3 tentativas: index.json → nome normalizado → lower_case
//    · aviso no console quando um ícone não é encontrado (ajuda a
//      debugar novos itens)
// ================================================================

let iconIndex = {};

// ---- aliases manuais: nome do item -> nome real do PNG --------
const ALIASES = {
  // Blue Wolf set
  blue_wolf_breastplate:        'blue_wolf_heavy_armor',
  blue_wolf_leather_armor:      'blue_wolf_leather_armor',
  blue_wolf_tunic:              'blue_wolf_tunic',
  // S-grade arcane set
  major_arcana_robe:            'major_arcana_robe_armor',
  imperial_crusader_breastplate: 'imperial_crusader_armor',
  imperial_shield:              'imperial_crusader_shield',
  // Mid/low tier renomeados para os assets que existem
  mage_robe:                    'karmian_robe_armor',
  mage_stockings:               'karmian_robe_pants',
  mage_gloves:                  'karmian_robe_gloves',
  mage_sandals:                 'karmian_robe_boots',
  steel_plate:                  'full_plate_heavy_armor',
  steel_gaiters:                'full_plate_heavy_pants',
  steel_helm:                   'full_plate_heavy_helmet',
  steel_boots:                  'full_plate_heavy_boots',
  steel_gauntlets:              'full_plate_heavy_gloves',
  steel_shield:                 'full_plate_shield',
  shadow_cloak:                 'demon_cloack',
  shadow_pants:                 'doom_light_pants',
  shadow_mask:                  'doom_light_helmet',
  shadow_boots:                 'doom_light_boots',
  shadow_gloves:                'doom_light_gloves',
  knight_armor:                 'doom_light_armor',
  knight_gaiters:               'doom_light_pants',
  knight_helm:                  'doom_light_helmet',
  knight_boots:                 'doom_light_boots',
  knight_gauntlets:             'doom_light_gloves',
  knight_shield:                'doom_shield',
  arcane_robe:                  'devotion_armor_robe',
  arcane_stockings:             'devotion_pants_robe',
  elven_garb:                   'avadon_light_armor',
  arcane_circlet:               'divine_crown',
};

// nomes que, normalizados, sempre batem com o que está na pasta
function normalize(key) {
  if (!key) return null;
  let k = String(key).trim().toLowerCase();
  if (ALIASES[k]) return ALIASES[k];
  // remove extensão se veio com .png embutido
  k = k.replace(/\.png$/i, '');
  // troca espaços por underscore
  k = k.replace(/\s+/g, '_');
  return k;
}

export async function loadIconIndex() {
  if (Object.keys(iconIndex).length) return;
  try {
    const response = await fetch("./img/icons/icon_index.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    iconIndex = await response.json() || {};
  } catch (err) {
    console.warn("[iconLoader] não foi possível carregar icon_index.json — usando fallback direto para .png:", err?.message || err);
    iconIndex = {};
  }
}

export function getIcon(iconName, { itemId } = {}) {
  // 1) nenhum nome informado: tenta o id do item, senão default
  if (!iconName && !itemId) return "./img/icons/default.png";

  const candidates = new Set();
  const raw = iconName || itemId;
  const norm = normalize(raw);
  if (norm) candidates.add(norm);
  if (itemId) {
    const n2 = normalize(itemId);
    if (n2) candidates.add(n2);
  }

  // 2) procura no icon_index.json
  for (const key of candidates) {
    const path = iconIndex[key];
    if (path) return "./img/icons/" + path;
  }

  // 3) fallback direto para o arquivo png
  for (const key of candidates) {
    return "./img/icons/" + key + ".png";
  }

  return "./img/icons/default.png";
}

// helper opcional: varre os itens e avisa no console quem está sem ícone
// (chame depois que os itens estiverem carregados)
export function auditItems(d) {
  const missing = [];
  Object.entries(d.ALL_ITEMS).forEach(([id, item]) => {
    if (!item || item.slot === "consumable" || item.slot === "material") return;
    const path = getIcon(item.icon, { itemId: id });
    if (path.endsWith("default.png") && item.slot !== "powerup") {
      missing.push(id);
    }
  });
  if (missing.length) {
    console.warn("[iconLoader] itens sem ícone resolvido:", missing);
  }
  return missing;
}
