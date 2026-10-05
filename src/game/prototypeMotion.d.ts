export interface MotionPose { frame: number; facing: number; released: boolean; attacking: boolean; footstep: boolean }
export class SpriteMotion {
  walkTime: number;
  attackTime: number | null;
  facing: number;
  startAttack(direction?: number): boolean;
  update(dt: number, moving: boolean, direction?: number): MotionPose;
}
