import Phaser from 'phaser';
import { SPIKE_TRAP, getHero } from '@malik/shared';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import type { Enemy } from './Enemy';

export class SpikeTrap extends Phaser.GameObjects.Container {
  private lastTrigger = 0;
  private range = SPIKE_TRAP.range;
  private damage: number;
  private fireRate = SPIKE_TRAP.fireRateMs;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const heroId = MissionBridge.getActiveHeroId();
    const hero = heroId ? getHero(heroId) : undefined;
    this.damage = Math.round(SPIKE_TRAP.damage * (hero?.spikeTrapDamageMult ?? 1));

    const base = scene.add.image(0, 0, 'spike_trap').setOrigin(0.5, 1);
    this.add(base);

    scene.add.existing(this);
    this.setDepth(6);
  }

  update(time: number, enemies: Enemy[]): void {
    if (time - this.lastTrigger < this.fireRate) return;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const dist = Phaser.Math.Distance.Between(this.x, this.y - 10, enemy.x, enemy.y - 20);
      if (dist < this.range) {
        this.lastTrigger = time;
        this.trigger(enemy);
        break;
      }
    }
  }

  private trigger(enemy: Enemy): void {
    SoundManager.play('hit');
    this.setScale(1.1, 0.9);
    this.scene.time.delayedCall(80, () => this.setScale(1));
    enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1, 60);
  }
}
