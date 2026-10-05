// Simulation-time animation: pause and hit-stop freeze the pose and its impact event.
export class SpriteMotion {
  walkTime = 0;
  attackTime = null;
  facing = 1;
  startAttack(direction = 0) {
    if (this.attackTime !== null) return false;
    if (Math.abs(direction) > .15) this.facing = Math.sign(direction);
    this.attackTime = 0;
    return true;
  }
  update(dt, moving, direction = 0) {
    const delta = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    let released = false;
    if (this.attackTime !== null) {
      const previous = this.attackTime;
      this.attackTime += delta;
      released = previous < .18 && this.attackTime >= .18;
      if (this.attackTime >= .36) this.attackTime = null;
    } else if (Math.abs(direction) > .15) this.facing = Math.sign(direction);
    const previousStep = Math.floor(this.walkTime * 3);
    this.walkTime = moving ? this.walkTime + delta : 0;
    const attacking = this.attackTime !== null;
    return {
      frame: attacking ? 8 + Math.min(3, Math.floor(this.attackTime / .09)) : moving ? Math.floor(this.walkTime * 12) % 8 : 0,
      facing: this.facing, released, attacking,
      footstep: moving && !attacking && Math.floor(this.walkTime * 3) > previousStep,
    };
  }
}
