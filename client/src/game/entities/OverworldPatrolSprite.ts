import Phaser from 'phaser';
import type { OverworldPatrol } from '@malik/shared';

export class OverworldPatrolSprite extends Phaser.Physics.Arcade.Sprite {
  private pathIndex = 0;
  private waitMs = 0;

  constructor(
    scene: Phaser.Scene,
    patrol: OverworldPatrol,
    startIndex = 0,
  ) {
    super(scene, patrol.path[startIndex]?.x ?? 0, patrol.path[startIndex]?.y ?? 0, patrol.texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.pathIndex = startIndex;
    this.setDepth(15);
    this.setScale(0.85);
    this.setFlipX(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(24, 18);
    body.setOffset(4, 8);

    this.setData('patrol', patrol);
    this.setData('speed', patrol.speed);
  }

  updatePatrol(_time: number, delta: number): void {
    const patrol = this.getData('patrol') as OverworldPatrol;
    const speed = this.getData('speed') as number;
    if (this.waitMs > 0) {
      this.waitMs -= delta;
      this.setVelocity(0, 0);
      return;
    }

    const target = patrol.path[this.pathIndex];
    if (!target) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      this.pathIndex = (this.pathIndex + 1) % patrol.path.length;
      this.waitMs = 400;
      this.setVelocity(0, 0);
      return;
    }

    this.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    if (dx < 0) this.setFlipX(false);
    else if (dx > 0) this.setFlipX(true);
  }
}
