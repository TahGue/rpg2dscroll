import Phaser from 'phaser';
import { GATE_GUARD, getDefender, type DefenderChoice } from '@malik/shared';
import type { Enemy } from './Enemy';
import type { DefenseTarget } from './DefenseTarget';

/** Local NPC defender — holds near the gate during prep and combat. */
export class GateGuard extends Phaser.GameObjects.Container {
  private hp: number;
  private maxHp: number;
  private damage: number;
  private attackRange: number;
  private attackInterval: number;
  private lastAttack = 0;
  private lastRepair = 0;
  private role: string;
  private bodySprite: Phaser.GameObjects.Rectangle;
  private alive = true;

  constructor(scene: Phaser.Scene, x: number, y: number, defenderId: DefenderChoice = 'gate_guard') {
    super(scene, x, y);
    const def = getDefender(defenderId) ?? GATE_GUARD;
    this.maxHp = def.hp;
    this.hp = this.maxHp;
    this.damage = def.damage;
    this.attackRange = def.attackRange;
    this.attackInterval = def.attackIntervalMs;
    this.role = def.role;

    this.bodySprite = scene.add
      .rectangle(0, -28, 22, 36, this.getColor(defenderId), 1)
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

  update(time: number, enemies: Enemy[], target?: DefenseTarget | null): void {
    if (!this.isAlive()) return;

    if ((this.role === 'repair' || this.role === 'support') && target) {
      this.tryRepair(time, target);
      if (this.role === 'support') return;
    }

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
    const damage = this.role === 'anti_shadow' && nearest.isShadowEnemy() ? Math.round(this.damage * 2) : this.damage;
    nearest.takeDamage(damage, nearest.x > this.x ? 1 : -1, this.role === 'ranged' ? 50 : 90);
    if (this.role === 'ranged') nearest.applySlow(0.8, 650);

    this.scene.tweens.add({
      targets: this.bodySprite,
      x: nearest.x > this.x ? 6 : -6,
      duration: 80,
      yoyo: true,
    });
  }

  private tryRepair(time: number, target: DefenseTarget): void {
    if (time - this.lastRepair < 1400 || target.hp >= target.maxHp) return;
    this.lastRepair = time;
    const repair = this.role === 'support' ? 7 : 11;
    const repairable = target as DefenseTarget & { repair?: (amount: number) => void };
    if (repairable.repair) {
      repairable.repair(repair);
    } else {
      target.hp = Math.min(target.maxHp, target.hp + repair);
    }
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

  private getColor(defenderId: DefenderChoice): number {
    switch (defenderId) {
      case 'archer':
        return 0x55aaff;
      case 'repair_worker':
        return 0x88dd88;
      case 'hunter':
        return 0xcc8844;
      case 'shield_guard':
        return 0x7788aa;
      case 'water_carrier':
        return 0x44bbdd;
      case 'torch_bearer':
        return 0xff8844;
      default:
        return 0x4466aa;
    }
  }
}
