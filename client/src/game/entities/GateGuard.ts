import Phaser from 'phaser';
import { GATE_GUARD } from '@malik/shared';
import type { Enemy } from './Enemy';

/** Local NPC defender — holds near the gate during prep and combat. */
export class GateGuard extends Phaser.GameObjects.Container {
  private hp: number;
  private maxHp: number;
  private damage: number;
  private attackRange: number;
  private attackInterval: number;
  private lastAttack = 0;
  private bodySprite: Phaser.GameObjects.Rectangle;
  private alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.maxHp = GATE_GUARD.hp;
    this.hp = this.maxHp;
    this.damage = GATE_GUARD.damage;
    this.attackRange = GATE_GUARD.attackRange;
    this.attackInterval = GATE_GUARD.attackIntervalMs;

    this.bodySprite = scene.add
      .rectangle(0, -28, 22, 36, 0x4466aa, 1)
      .setStrokeStyle(2, 0xaaccff);
    const helm = scene.add.rectangle(0, -48, 16, 10, 0x8899cc);
    const spear = scene.add.rectangle(14, -32, 4, 28, 0xcccccc);
    this.add([this.bodySprite, helm, spear]);

    scene.add.existing(this);
    this.setDepth(8);
  }

  isAlive(): boolean {
    return this.alive && this.hp > 0;
  }

  update(time: number, enemies: Enemy[]): void {
    if (!this.isAlive()) return;

    let nearest: Enemy | null = null;
    let nearestDist = this.attackRange;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y - 28, enemy.x, enemy.y - 20);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest || time - this.lastAttack < this.attackInterval) return;

    this.lastAttack = time;
    nearest.takeDamage(this.damage, nearest.x > this.x ? 1 : -1);

    this.scene.tweens.add({
      targets: this.bodySprite,
      x: nearest.x > this.x ? 6 : -6,
      duration: 80,
      yoyo: true,
    });
  }

  heal(amount: number): void {
    if (!this.isAlive()) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  takeDamage(amount: number): void {
    if (!this.isAlive()) return;
    this.hp -= amount;
    this.bodySprite.setFillStyle(0xff6666);
    this.scene.time.delayedCall(120, () => {
      if (this.isAlive()) this.bodySprite.setFillStyle(0x4466aa);
    });
    if (this.hp <= 0) {
      this.alive = false;
      this.setAlpha(0.35);
    }
  }
}
