import { EXPEDITION_DILEMMAS } from '../data/expeditions.js';

export function checkExpeditionDilemmaEligibility(expedition, option, squad = []) {
  if (!expedition || !option) return { eligible: false, reason: 'Dilema indisponível.' };
  const specs = new Set(squad.filter(Boolean).map(merc => merc.spec).filter(Boolean));
  const traits = new Set(squad.filter(Boolean).map(merc => merc.trait).filter(Boolean));

  if (option.reqDirective && expedition.directive !== option.reqDirective) {
    return { eligible: false, reason: `Requer a diretriz ${option.reqDirective}.` };
  }
  if (option.reqSpec && !specs.has(option.reqSpec)) {
    return { eligible: false, reason: `Requer um mercenário da especialização ${option.reqSpec}.` };
  }
  if (Array.isArray(option.reqSpecs) && option.reqSpecs.length && !option.reqSpecs.some(spec => specs.has(spec))) {
    return { eligible: false, reason: `Requer um mercenário de: ${option.reqSpecs.join(' ou ')}.` };
  }
  if (option.reqTrait && !traits.has(option.reqTrait)) {
    return { eligible: false, reason: `Requer o traço ${option.reqTrait}.` };
  }
  return { eligible: true, reason: '' };
}

export function getExpeditionDilemmaActionEligibility(state, destId, optionKey) {
  const expedition = Array.isArray(state?.expeditions)
    ? state.expeditions.find(exp => exp.destId === destId && !exp.claimed)
    : null;
  const option = expedition && EXPEDITION_DILEMMAS[expedition.activeDilemmaId]?.options?.[optionKey];
  if (!expedition || !option || expedition.dilemmaResolved) {
    return { eligible: false, reason: 'Dilema indisponível.' };
  }

  const owned = Array.isArray(state?.mercenaries?.owned) ? state.mercenaries.owned : [];
  const mercenariesByUid = new Map(owned.map(merc => [merc.uid, merc]));
  const squad = (Array.isArray(expedition.squad) ? expedition.squad : [])
    .map(uid => mercenariesByUid.get(uid))
    .filter(Boolean);

  return checkExpeditionDilemmaEligibility(expedition, option, squad);
}
