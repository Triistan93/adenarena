import type { ClassDef, RaceDef } from "./data";

export interface PrototypeProgression {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
}

export const ACTION_PROTOTYPE_CAMPAIGN: Readonly<{
  zoneName: string;
  waveLimit: number;
}>;

export function createActionPrototypeConfig(race: RaceDef, cls: ClassDef): {
  race: RaceDef;
  cls: ClassDef;
  idleState: null;
  bridgeIdleProgression: false;
  zoneName: string;
  campaignWaveLimit: number;
};

export function shouldBridgeIdleProgression(config?: { bridgeIdleProgression?: boolean } | null): boolean;
export function createInitialPrototypeProgression(): PrototypeProgression;
export function awardPrototypeXp(
  progression: PrototypeProgression,
  amount: number
): PrototypeProgression;
