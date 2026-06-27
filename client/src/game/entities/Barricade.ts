import Phaser from 'phaser';
import { BARRICADE } from '@malik/shared';
import { SoundManager } from '../systems/SoundManager';
import { showDamageNumber } from '../utils/combatFeedback';
import type { AttackableObstacle } from './AttackableObstacle';

export class Barricade extends Phaser.Physics.Arcade.Sprite implements AttackableObstacle {
  private hp: number;
  private maxHp: number;
  private destroyed = false;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'barricade');

    this.maxHp = BARRICADE.maxHp ?? 140;
    this.hp = this.maxHp;

    this.setOrigin(0.5, 1);
    this.setDepth(6);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(52, 38);
    body.setOffset(6, 6);

    this.hpBarBg = scene.add.rectangle(x, y - 58, 50, 6, 0x000000, 0.5).setDepth(7);
    this.hpBarFill = scene.add.rectangle(x - 25, y - 58, 50, 6, 0x8b6914).setOrigin(0, 0.5).setDepth(7);
  }

  takeDamage(amount: number): void {
    if (this.destroyed) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();
    SoundManager.play('hit');
    showDamageNumber(this.scene, this.x, this.y - 45, amount, '#cc8844');
    this.setTint(0xffaa66);
    this.scene.time.delayedCall(80, () => {
      if (!this.destroyed) this.clearTint();
    });

    if (this.hp <= 0) {
      this.destroyed = true;
      SoundManager.play('death');
      this.scene.events.emit('barricade-destroyed');
      this.scene.tweens.add({
        targets: [this, this.hpBarBg, this.hpBarFill],
        alpha: 0,
        y: this.y + 8,
        duration: 350,
        onComplete: () => this.destroy(true),
      });
    }
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(fromScene?: boolean): void {
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    super.destroy(fromScene);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.destroyed) return;
    this.hpBarBg.setPosition(this.x, this.y - 58);
    this.hpBarFill.setPosition(this.x - 25, this.y - 58);
  }

  private updateHpBar(): void {
    this.hpBarFill.width = 50 * (this.hp / this.maxHp);
  }
}
