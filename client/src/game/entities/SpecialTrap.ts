import Phaser from 'phaser';
import { getBuildDefinition, type BuildChoice } from '@malik/shared';
import { SoundManager } from '../systems/SoundManager';
import type { Enemy } from './Enemy';

const TRAP_TINTS: Partial<Record<BuildChoice, number>> = {
  fire_pot: 0xff6633,
  water_slow_trap: 0x55ccff,
  poison_trap: 0x66dd66,
  sand_pit: 0xc2a45f,
  light_trap: 0xffee99,
  rolling_stone: 0x999999,
};

export class SpecialTrap extends Phaser.GameObjects.Container {
  private lastTrigger = 0;
  private range: number;
  private damage: number;
  private fireRate: number;
  private tint: number;

  constructor(scene: Phaser.Scene, x: number, y: number, private buildId: BuildChoice) {
    super(scene, x, y);

    const def = getBuildDefinition(buildId);
    this.range = def?.range ?? 110;
    this.damage = def?.damage ?? 10;
    this.fireRate = def?.fireRateMs ?? 1300;
    this.tint = TRAP_TINTS[buildId] ?? 0xffffff;

    const base = scene.add.image(0, 0, 'spike_trap').setOrigin(0.5, 1).setTint(this.tint);
    this.add(base);

    scene.add.existing(this);
    this.setDepth(6);
  }

  update(time: number, enemies: Enemy[]): void {
    if (time - this.lastTrigger < this.fireRate) return;

    const targets = enemies.filter(
      (enemy) =>
        enemy.isAlive() &&
        Phaser.Math.Distance.Between(this.x, this.y - 10, enemy.x, enemy.y - 20) < this.range,
    );
    if (targets.length === 0) return;

    this.lastTrigger = time;
    this.trigger(targets);
  }

  private trigger(enemies: Enemy[]): void {
    SoundManager.play('hit');
    this.setScale(1.12, 0.9);
    this.scene.time.delayedCall(80, () => this.setScale(1));

    switch (this.buildId) {
      case 'fire_pot':
        enemies.forEach((enemy) => {
          enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1, 40);
          enemy.applyDamageOverTime(18, 1800, 0xff6633);
        });
        break;
      case 'water_slow_trap':
        enemies.forEach((enemy) => {
          enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1, 20);
          enemy.applySlow(0.45, 1800);
        });
        break;
      case 'poison_trap':
        enemies.forEach((enemy) => enemy.applyDamageOverTime(24, 2400, 0x66dd66));
        break;
      case 'sand_pit':
        enemies.forEach((enemy) => {
          enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1, 10);
          enemy.applySlow(0.35, 2200);
        });
        break;
      case 'light_trap':
        enemies.forEach((enemy) => {
          const damage = enemy.isShadowEnemy() ? Math.round(this.damage * 2) : this.damage;
          enemy.takeDamage(damage, enemy.x > this.x ? 1 : -1, 70);
        });
        break;
      case 'rolling_stone':
        enemies.forEach((enemy) => enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1, 220));
        break;
      default:
        enemies[0]?.takeDamage(this.damage, enemies[0].x > this.x ? 1 : -1, 60);
    }
  }
}
