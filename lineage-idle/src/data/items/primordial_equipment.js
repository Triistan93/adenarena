/**
 * Equipamentos S84 Primordiais: extensão craftável da faixa de nível 85–120.
 * As bases visuais e os arquétipos vêm dos itens de topo já existentes.
 */
import { WEAPONS } from './weapons.js';
import { ARMORS, HELMETS, BOOTS, GLOVES, LEGS, SHIELDS, CLOAKS, SIGILS } from './armors.js';

function scaled(value, multiplier) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value) * multiplier) : value;
}

function addAliases(target, item) {
  target[item.id] = item;
  target[item.id.replace(/^(weapon_|armor_)/, '')] = item;
}

export const PRIMORDIAL_EQUIPMENT = {};

const primordialWeapons = [...new Map(Object.values(WEAPONS)
  .filter(item => item.id?.startsWith('weapon_frost_lord_'))
  .map(item => [item.id, item])).values()];

for (const source of primordialWeapons) {
  const suffix = source.id.slice('weapon_frost_lord_'.length);
  const item = {
    ...source,
    id: `weapon_primordial_${suffix}`,
    name: source.name.replace(/Frost Lord/i, 'Primordial'),
    tier: 6,
    grade: 's',
    rarity: 'legendary',
    req: { ...source.req, level: 85 },
    atk: scaled(source.atk, 1.18),
    matk: scaled(source.matk, 1.18),
    crit: scaled(source.crit, 1.08),
    eva: scaled(source.eva, 1.08),
    price: Math.round((source.price || 62500) * 1.6),
    craftTier: 'primordial',
    desc: 'Arma S84 Primordial forjada com Essência Primordial e insumos das profissões de Aden.'
  };
  addAliases(PRIMORDIAL_EQUIPMENT, item);
}

const armorCatalogs = [ARMORS, HELMETS, BOOTS, GLOVES, LEGS, SHIELDS, CLOAKS, SIGILS];
const primordialArmor = [...new Map(armorCatalogs.flatMap(catalog => Object.values(catalog))
  .filter(item => item.id?.includes('dynasti_'))
  .map(item => [item.id, item])).values()];

for (const source of primordialArmor) {
  const item = {
    ...source,
    id: source.id.replace('dynasti_', 'primordial_'),
    name: source.name.replace(/Dynasti/i, 'Primordial'),
    tier: 6,
    grade: 's',
    rarity: 'legendary',
    req: { ...source.req, level: 85 },
    def: scaled(source.def, 1.18),
    mdef: scaled(source.mdef, 1.18),
    atk: scaled(source.atk, 1.12),
    matk: scaled(source.matk, 1.12),
    hp: scaled(source.hp, 1.12),
    mp: scaled(source.mp, 1.12),
    price: Math.round((source.price || 41592) * 1.6),
    craftTier: 'primordial',
    desc: 'Equipamento S84 Primordial para níveis 85–120, reforçado pela Essência Primordial.'
  };
  addAliases(PRIMORDIAL_EQUIPMENT, item);
}
