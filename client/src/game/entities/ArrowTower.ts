import Phaser from 'phaser';
import { ARROW_TOWER, getHero } from '@malik/shared';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import type { Enemy } from './Enemy';

export class ArrowTower extends Phaser.GameObjects.Container {
  private lastShot = 0;
  private range = ARROW_TOWER.range;
  private damage: number;
  private fireRate: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.damage = MissionBridge.getTowerDamage();
    const heroId = MissionBridge.getActiveHeroId();
    const hero = heroId ? getHero(heroId) : undefined;
    this.fireRate = Math.round(ARROW_TOWER.fireRateMs * (hero?.arrowTowerFireRateMult ?? 1));

    const base = scene.add.image(0, 0, 'tower_base').setOrigin(0.5, 1);
    const top = scene.add.image(0, -50, 'tower_top').setOrigin(0.5, 1);
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
    this.fireAt(nearest);
  }

  private fireAt(enemy: Enemy): void {
    SoundManager.play('attack');

    const arrow = this.scene.add.image(this.x, this.y - 50, 'particle_slash');
    arrow.setScale(0.5, 0.3).setTint(0xffcc66).setDepth(12);

    this.scene.tweens.add({
      targets: arrow,
      x: enemy.x,
      y: enemy.y - 20,
      duration: 200,
      onComplete: () => {
        arrow.destroy();
        if (enemy.isAlive()) {
          enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1);
        }
      },
    });
  }
}
