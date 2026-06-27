import Phaser from 'phaser';
import { IRON_TOWER } from '@malik/shared';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import type { Enemy } from './Enemy';

export class IronTower extends Phaser.GameObjects.Container {
  private lastShot = 0;
  private range = IRON_TOWER.range;
  private damage: number;
  private fireRate = IRON_TOWER.fireRateMs;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.damage = IRON_TOWER.damage + Math.floor(MissionBridge.getTowerDamage() * 0.35);

    const base = scene.add.image(0, 0, 'tower_base').setOrigin(0.5, 1).setTint(0x888899);
    const top = scene.add.image(0, -50, 'tower_top').setOrigin(0.5, 1).setTint(0xaaaacc);
    this.add([base, top]);

    scene.add.existing(this);
    this.setDepth(6);
  }

  update(time: number, enemies: Enemy[]): void {
    if (time - this.lastShot < this.fireRate) return;

    let nearest: Enemy | null = null;
    let nearestDist = this.range;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y - 40, enemy.x, enemy.y - 20);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    this.lastShot = time;
    SoundManager.play('attack');

    const bolt = this.scene.add.image(this.x, this.y - 50, 'particle_slash');
    bolt.setScale(0.6, 0.35).setTint(0xaaccff).setDepth(12);

    this.scene.tweens.add({
      targets: bolt,
      x: nearest.x,
      y: nearest.y - 20,
      duration: 180,
      onComplete: () => {
        bolt.destroy();
        if (nearest!.isAlive()) {
          nearest!.takeDamage(this.damage, nearest!.x > this.x ? 1 : -1);
        }
      },
    });
  }
}
