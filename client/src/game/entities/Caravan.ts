import Phaser from 'phaser';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import { shakeCamera, showDamageNumber } from '../utils/combatFeedback';

export class Caravan extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  readonly exitX: number;
  private moveSpeed: number;
  private destroyed = false;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    exitX: number,
    maxHp: number,
  ) {
    super(scene, x, y, 'caravan');

    this.exitX = exitX;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.moveSpeed = 42;

    this.setOrigin(0.5, 1);
    this.setDepth(6);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setSize(70, 40);
    body.setOffset(5, 8);

    this.hpBarBg = scene.add.rectangle(x, y - 95, 70, 8, 0x000000, 0.6).setDepth(7);
    this.hpBarFill = scene.add.rectangle(x - 35, y - 95, 70, 8, 0xd4a843).setOrigin(0, 0.5).setDepth(7);

    const label = scene.add
      .text(x, y - 110, 'TRADE CARAVAN', { fontSize: '11px', color: '#d4a843', fontFamily: 'Georgia, serif' })
      .setOrigin(0.5)
      .setDepth(7);

    this.setData('label', label);
    MissionBridge.syncGate(this.hp, this.maxHp);
  }

  update(_delta: number, shouldMove: boolean): boolean {
    if (this.destroyed) return false;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(shouldMove ? this.moveSpeed : 0);

    if (shouldMove && Math.random() < 0.04) {
      const dust = this.scene.add.image(this.x - 20, this.y - 4, 'particle_dust');
      dust.setAlpha(0.35).setDepth(3).setScale(1.2);
      this.scene.tweens.add({
        targets: dust,
        x: dust.x - 30,
        alpha: 0,
        duration: 500,
        onComplete: () => dust.destroy(),
      });
    }

    const label = this.getData('label') as Phaser.GameObjects.Text;
    this.hpBarBg.setPosition(this.x, this.y - 95);
    this.hpBarFill.setPosition(this.x - 35, this.y - 95);
    label.setPosition(this.x, this.y - 110);

    return this.x >= this.exitX;
  }

  takeDamage(amount: number): void {
    if (this.destroyed) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();
    MissionBridge.syncGate(this.hp, this.maxHp);

    this.setTint(0xff8888);
    this.scene.time.delayedCall(100, () => this.clearTint());
    shakeCamera(this.scene, 0.008, 200);
    SoundManager.play('gate_hit');
    showDamageNumber(this.scene, this.x, this.y - 80, amount, '#ff4444');

    if (this.hp <= 0) {
      this.destroyed = true;
      this.setAlpha(0.4);
      this.scene.events.emit('mission-defeat', 'caravan');
    }
  }

  repair(amount: number): void {
    if (this.destroyed || this.hp >= this.maxHp) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateHpBar();
    MissionBridge.syncGate(this.hp, this.maxHp);
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  destroy(fromScene?: boolean): void {
    const label = this.getData('label') as Phaser.GameObjects.Text;
    label?.destroy();
    this.hpBarBg.destroy();
    this.hpBarFill.destroy();
    super.destroy(fromScene);
  }

  private updateHpBar(): void {
    const pct = this.hp / this.maxHp;
    this.hpBarFill.width = 70 * pct;
  }
}
