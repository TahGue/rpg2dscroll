import Phaser from 'phaser';
import { getBuildDefinition, type BuildChoice } from '@malik/shared';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import type { Enemy } from './Enemy';

const TOWER_TINTS: Partial<Record<BuildChoice, number>> = {
  fire_tower: 0xff6633,
  water_tower: 0x55ccff,
  relic_tower: 0xffdd88,
  ballista: 0xbb8855,
};

export class SpecialTower extends Phaser.GameObjects.Container {
  private lastShot = 0;
  private range: number;
  private damage: number;
  private fireRate: number;
  private tint: number;

  constructor(scene: Phaser.Scene, x: number, y: number, private buildId: BuildChoice) {
    super(scene, x, y);

    const def = getBuildDefinition(buildId);
    this.range = def?.range ?? 360;
    this.damage = (def?.damage ?? 10) + Math.floor(MissionBridge.getTowerDamage() * 0.4);
    this.fireRate = def?.fireRateMs ?? 1500;
    this.tint = TOWER_TINTS[buildId] ?? 0xffffff;

    const base = scene.add.image(0, 0, 'tower_base').setOrigin(0.5, 1).setTint(this.tint);
    const top = scene.add.image(0, -50, 'tower_top').setOrigin(0.5, 1).setTint(this.tint);
    this.add([base, top]);

    scene.add.existing(this);
    this.setDepth(6);
  }

  update(time: number, enemies: Enemy[]): void {
    if (time - this.lastShot < this.fireRate) return;

    const target = this.pickTarget(enemies);
    if (!target) return;

    this.lastShot = time;
    this.fireAt(target, enemies);
  }

  private pickTarget(enemies: Enemy[]): Enemy | null {
    let best: Enemy | null = null;
    let bestScore = Infinity;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y - 40, enemy.x, enemy.y - 20);
      if (dist > this.range) continue;
      const score = this.buildId === 'ballista' && enemy.isBossEnemy() ? dist - 400 : dist;
      if (score < bestScore) {
        bestScore = score;
        best = enemy;
      }
    }

    return best;
  }

  private fireAt(enemy: Enemy, enemies: Enemy[]): void {
    SoundManager.play('attack');

    const bolt = this.scene.add.image(this.x, this.y - 50, 'particle_slash');
    bolt.setScale(this.buildId === 'ballista' ? 0.9 : 0.6, 0.35).setTint(this.tint).setDepth(12);

    this.scene.tweens.add({
      targets: bolt,
      x: enemy.x,
      y: enemy.y - 20,
      duration: this.buildId === 'ballista' ? 280 : 200,
      onComplete: () => {
        bolt.destroy();
        if (!enemy.isAlive()) return;
        this.applyHit(enemy, enemies);
      },
    });
  }

  private applyHit(enemy: Enemy, enemies: Enemy[]): void {
    const dir = enemy.x > this.x ? 1 : -1;
    switch (this.buildId) {
      case 'fire_tower':
        enemy.takeDamage(this.damage, dir, 60);
        for (const nearby of enemies) {
          if (nearby.isAlive() && Math.abs(nearby.x - enemy.x) < 90) {
            nearby.applyDamageOverTime(12, 1800, 0xff6633);
          }
        }
        break;
      case 'water_tower':
        enemy.takeDamage(this.damage, dir, 40);
        enemy.applySlow(0.55, 1700);
        break;
      case 'relic_tower':
        enemy.takeDamage(enemy.isShadowEnemy() ? Math.round(this.damage * 1.8) : this.damage, dir, 70);
        break;
      case 'ballista':
        enemy.takeDamage(enemy.isBossEnemy() ? Math.round(this.damage * 1.7) : this.damage, dir, 180);
        break;
      default:
        enemy.takeDamage(this.damage, dir);
    }
  }
}
