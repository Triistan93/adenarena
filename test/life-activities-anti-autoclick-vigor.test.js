import test from 'node:test';
import assert from 'node:assert/strict';

import { LifeActivityCore, VIGOR_MAX_DEFAULT, VIGOR_COST_PER_ACTION, VIGOR_REGEN_INTERVAL_MS } from '../lineage-idle/src/services/lifeActivities/LifeActivityCore.js';
import { GatheringService } from '../lineage-idle/src/services/lifeActivities/GatheringService.js';
import { MiningService } from '../lineage-idle/src/services/lifeActivities/MiningService.js';
import { HuntingService } from '../lineage-idle/src/services/HuntingService.js';
import { FishingService } from '../lineage-idle/src/services/FishingService.js';

function createMockGameState() {
  return {
    level: 25,
    gold: 500000,
    inventory: [],
    lifeActivities: {
      vigor: {
        current: 100,
        max: 100,
        lastRegen: Date.now()
      }
    }
  };
}

test('Anti-Autoclick & Vigor Suite — 1. Inicialização e limites de Vigor', () => {
  const state = createMockGameState();
  const vState = LifeActivityCore.getVigorState(state);

  assert.equal(vState.current, 100);
  assert.equal(vState.max, 100);
  assert.equal(vState.percent, 100);

  // Consome 5 vigor
  const res = LifeActivityCore.consumeVigor(state, VIGOR_COST_PER_ACTION);
  assert.equal(res.success, true);
  assert.equal(res.remaining, 95);
  assert.equal(state.lifeActivities.vigor.current, 95);

  // Consome até esgotar
  state.lifeActivities.vigor.current = 4;
  const failRes = LifeActivityCore.consumeVigor(state, VIGOR_COST_PER_ACTION);
  assert.equal(failRes.success, false);
  assert.equal(failRes.reason, 'insufficient_vigor');
});

test('Anti-Autoclick & Vigor Suite — 2. Regeneração passiva no tempo (1 ponto / 180s)', () => {
  const state = createMockGameState();
  state.lifeActivities.vigor.current = 50;
  // Avança 9 minutos (540s = 3 intervalos de 180s = +3 pontos)
  state.lifeActivities.vigor.lastRegen = Date.now() - (9 * 60 * 1000);

  LifeActivityCore.regenVigor(state);
  const updated = LifeActivityCore.getVigorState(state);
  assert.equal(updated.current, 53);

  // Não ultrapassa max (100)
  state.lifeActivities.vigor.current = 99;
  state.lifeActivities.vigor.lastRegen = Date.now() - (30 * 60 * 1000);
  LifeActivityCore.regenVigor(state);
  const capped = LifeActivityCore.getVigorState(state);
  assert.equal(capped.current, 100);
});

test('Anti-Autoclick & Vigor Suite — 3. Avaliação matemática do Sweet Spot (evaluateSweetSpot)', () => {
  // Ponto Perfeito (60% a 80%)
  const perfectRes = LifeActivityCore.evaluateSweetSpot(70);
  assert.equal(perfectRes.result, 'perfect');
  assert.equal(perfectRes.yieldMultiplier, 2.0);
  assert.equal(perfectRes.xpMultiplier, 2.0);
  assert.equal(perfectRes.durabilityWear, 1);
  assert.equal(perfectRes.hazard, false);

  // Zona Aceitável (45% a 59% e 81% a 95%)
  const goodRes1 = LifeActivityCore.evaluateSweetSpot(50);
  assert.equal(goodRes1.result, 'good');
  assert.equal(goodRes1.yieldMultiplier, 1.0);
  assert.equal(goodRes1.durabilityWear, 1);

  const goodRes2 = LifeActivityCore.evaluateSweetSpot(90);
  assert.equal(goodRes2.result, 'good');
  assert.equal(goodRes2.yieldMultiplier, 1.0);

  // Miss / Spam fora da margem (<45% ou >95%)
  const missRes1 = LifeActivityCore.evaluateSweetSpot(25);
  assert.equal(missRes1.result, 'miss');
  assert.equal(missRes1.yieldMultiplier, 0.25);
  assert.equal(missRes1.durabilityWear, 4);
  assert.equal(missRes1.hazard, true);

  const missRes2 = LifeActivityCore.evaluateSweetSpot(98);
  assert.equal(missRes2.result, 'miss');
  assert.equal(missRes2.yieldMultiplier, 0.25);
  assert.equal(missRes2.durabilityWear, 4);
});

test('Anti-Autoclick & Vigor Suite — 4. Coleta: Bloqueio por vigor esgotado e punição de Miss', () => {
  const state = createMockGameState();
  const gState = GatheringService.getGatheringState(state);
  gState.sickle = 'sickle_none';
  gState.sickleDurability = { sickle_none: 50 };

  // Bloqueio por falta de vigor
  state.lifeActivities.vigor.current = 2;
  const startFail = GatheringService.startHarvest(state, 'flora_peace_flower');
  assert.equal(startFail.success, false);
  assert.equal(startFail.reason, 'insufficient_vigor');

  // Com vigor suficiente
  state.lifeActivities.vigor.current = 100;
  const startOk = GatheringService.startHarvest(state, 'flora_peace_flower');
  assert.equal(startOk.success, true);
  assert.equal(gState.isGathering, true);

  // Finish harvest com timingPct = 20 (Miss do autoclicker)
  gState.harvestStartTime = Date.now() - 5000;
  const duraBefore = gState.sickleDurability['sickle_none'];
  const finishRes = GatheringService.finishHarvest(state, {}, 20);
  assert.equal(finishRes, true);
  // Vigor consumido (-5)
  assert.equal(state.lifeActivities.vigor.current, 95);
  // Desgaste severo na foice (-4 durabilidade por miss)
  const duraAfter = gState.sickleDurability['sickle_none'];
  assert.equal(duraBefore - duraAfter, 4);
});

test('Anti-Autoclick & Vigor Suite — 5. Mineração: Estabilidade da galeria e punição de desabamento', () => {
  const state = createMockGameState();
  const mState = MiningService.getMiningState(state);
  mState.pickaxe = 'pickaxe_none';
  mState.pickaxeDurability = { pickaxe_none: 50 };
  mState.galleryStability = 100;
  mState.veinHazard = 'none';

  // Inicia mineração
  const startOk = MiningService.startMining(state, 'vein_coal');
  assert.equal(startOk.success, true);

  // Miss (timingPct = 10) reduz estabilidade em 12 (base) + 20 (miss) = 32 pontos (100 - 32 = 68) e causa -4 desgaste
  mState.mineStartTime = Date.now() - 5000;
  const duraBefore = mState.pickaxeDurability['pickaxe_none'];
  const finishRes = MiningService.finishMining(state, {}, 10);
  assert.equal(finishRes, true);
  assert.equal(mState.galleryStability, 68);
  const duraAfter = mState.pickaxeDurability['pickaxe_none'];
  assert.equal(duraBefore - duraAfter, 4);

  // Se a estabilidade chegar a 0, ocorre desabamento que bloqueia mineração
  mState.galleryStability = 0;
  const blockedMine = MiningService.startMining(state, 'vein_coal');
  assert.equal(blockedMine.success, false);
  assert.equal(blockedMine.reason, 'gallery_collapsed');

  // Escorando a galeria com madeira recupera estabilidade (+35 com branch)
  state.inventory.push({ itemId: 'branch', count: 5 });
  const shored = MiningService.shoreUpGallery(state);
  assert.equal(shored, true);
  assert.equal(mState.galleryStability, 35);
});

test('Anti-Autoclick & Vigor Suite — 6. Caça: Alerta, fuga da presa e vigor', () => {
  const state = createMockGameState();
  const hState = HuntingService.getHuntingState(state);
  hState.knife = 'knife_none';
  hState.knifeDurability = { knife_none: 50 };

  // Bloqueio por vigor
  state.lifeActivities.vigor.current = 1;
  const startFail = HuntingService.startTracking(state, 'prey_grey_wolf');
  assert.equal(startFail.success, false);
  assert.equal(startFail.reason, 'insufficient_vigor');

  // Tracking com vigor suficiente
  state.lifeActivities.vigor.current = 100;
  const startOk = HuntingService.startTracking(state, 'prey_grey_wolf');
  assert.equal(startOk.success, true);

  // Finalização com Sweet Spot Perfeito (timingPct = 70)
  hState.trackStartTime = Date.now() - 5000;
  const perfectFinish = HuntingService.finishSkinning(state, {}, 70);
  assert.equal(perfectFinish, true);
  assert.equal(hState.awaitingButchering, true);

  // Descarne manual consome 5 Vigor
  const butcherOk = HuntingService.executeFieldButchering(state, 'pelt');
  assert.equal(butcherOk, true);
  assert.equal(state.lifeActivities.vigor.current, 95);
});

test('Anti-Autoclick & Vigor Suite — 7. Pesca: Vigor e ruptura instantânea de linha em spam', () => {
  const state = createMockGameState();
  const fState = FishingService.getFishingState(state);
  fState.rod = 'rod_none';
  fState.rodDurability = { rod_none: 50 };
  fState.baitInventory = { bait_worm: 10 };
  fState.activeBait = 'bait_worm';

  // Bloqueio por falta de vigor
  state.lifeActivities.vigor.current = 3;
  const castFail = FishingService.castLine(state);
  assert.equal(castFail.success, false);
  assert.equal(castFail.reason, 'insufficient_vigor');

  // Lança linha com vigor suficiente
  state.lifeActivities.vigor.current = 100;
  const castOk = FishingService.castLine(state);
  assert.equal(castOk.success, true);
  assert.equal(state.lifeActivities.vigor.current, 95);

  // Inicia disputa
  FishingService.startFight(state);
  assert.ok(fState.activeFight);

  // Anti-autoclick: spam de 'actionForce' com tensão já alta (>= 70) arrebenta linha imediatamente
  fState.activeFight.lineTension = 75;
  const snapRes = FishingService.actionForce(state);
  assert.equal(snapRes.status, 'line_broken');
  assert.equal(fState.isFishing, false);
  assert.equal(fState.activeFight, null);
});

test('Anti-Autoclick & Vigor Suite — 8. Modo AFK (Automático): Pausa automática em Vigor esgotado', () => {
  const state = createMockGameState();
  
  // Teste de AFK Coleta
  const gState = GatheringService.getGatheringState(state);
  gState.autoGathering = true;
  gState.lastAutoTick = Date.now() - 10000;
  state.lifeActivities.vigor.current = 3; // Menor que 5
  GatheringService.processAutoGather(state);
  assert.equal(gState.autoGathering, false, 'Coleta AFK deve pausar quando o Vigor for menor que 5');

  // Teste de AFK Mineração
  const mState = MiningService.getMiningState(state);
  mState.autoMining = true;
  mState.lastAutoTick = Date.now() - 10000;
  state.lifeActivities.vigor.current = 2;
  MiningService.processAutoMine(state);
  assert.equal(mState.autoMining, false, 'Mineração AFK deve pausar quando o Vigor for menor que 5');

  // Teste de AFK Caça
  const hState = HuntingService.getHuntingState(state);
  hState.autoHunting = true;
  hState.lastAutoTick = Date.now() - 10000;
  state.lifeActivities.vigor.current = 4;
  HuntingService.processAutoHunt(state);
  assert.equal(hState.autoHunting, false, 'Caça AFK deve pausar quando o Vigor for menor que 5');

  // Teste de AFK Pesca
  const fState = FishingService.getFishingState(state);
  fState.autoFishing = true;
  fState.lastAutoTick = Date.now() - 10000;
  fState.baitInventory = { bait_worm: 20 };
  state.lifeActivities.vigor.current = 1;
  FishingService.processAutoFish(state);
  assert.equal(fState.autoFishing, false, 'Pesca AFK deve pausar quando o Vigor for menor que 5');
});
