import Phaser from 'phaser';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import { shakeCamera, showDamageNumber } from '../utils/combatFeedback';

export class Gate extends Phaser.GameObjects.Container {
  hp: number;
  maxHp: number;
  readonly gateX: number;
  private sprite: Phaser.GameObjects.Image;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private destroyed = false;
  private regenRate: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxHp: number,
    label = 'CAMP GATE',
    texture = 'gate',
    regenRate = 0,
  ) {
    super(scene, x, y);
    this.gateX = x;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.regenRate = regenRate;

    this.sprite = scene.add.image(0, 0, texture).setOrigin(0.5, 1);
    this.add(this.sprite);

    this.hpBarBg = scene.add.rectangle(0, -110, 60, 8, 0x000000, 0.6);
    this.hpBarFill = scene.add.rectangle(-30, -110, 60, 8, 0xd4a843).setOrigin(0, 0.5);
    this.add([this.hpBarBg, this.hpBarFill]);

    const labelText = scene.add
      .text(0, -125, label, { fontSize: '12px', color: '#d4a843', fontFamily: 'Georgia, serif' })
      .setOrigin(0.5);
    this.add(labelText);

    scene.add.existing(this);
    this.setDepth(5);
    MissionBridge.syncGate(this.hp, this.maxHp);
  }

  takeDamage(amount: number): void {
    if (this.destroyed) return;

    this.hp = Math.max(0, this.hp - amount);
    this.updateHpBar();
    MissionBridge.syncGate(this.hp, this.maxHp);

    this.sprite.setTint(0xff4444);
    this.scene.time.delayedCall(100, () => this.sprite.clearTint());
    shakeCamera(this.scene, 0.008, 200);
    SoundManager.play('gate_hit');
    showDamageNumber(this.scene, this.x, this.y - 80, amount, '#ff4444');

    for (let i = 0; i < 3; i++) {
      const spark = this.scene.add.circle(
        this.x + Phaser.Math.Between(-20, 20),
        this.y - Phaser.Math.Between(40, 80),
        3,
        0xffaa00,
      );
      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 20,
        alpha: 0,
        duration: 300,
        onComplete: () => spark.destroy(),
      });
    }

    if (this.hp <= 0) {
      this.destroyed = true;
      this.sprite.setAlpha(0.4);
      this.scene.events.emit('mission-defeat', 'gate');
    }
  }

  private updateHpBar(): void {
    const pct = this.hp / this.maxHp;
    this.hpBarFill.width = 60 * pct;
  }

  repair(amount: number): void {
    if (this.destroyed || this.hp >= this.maxHp) return;

    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.updateHpBar();
    MissionBridge.syncGate(this.hp, this.maxHp);

    if (Math.random() < 0.3) {
      const spark = this.scene.add.circle(
        this.x + Phaser.Math.Between(-15, 15),
        this.y - Phaser.Math.Between(50, 90),
        2,
        0x88ff88,
      );
      this.scene.tweens.add({
        targets: spark,
        y: spark.y - 15,
        alpha: 0,
        duration: 250,
        onComplete: () => spark.destroy(),
      });
    }
  }

  isDestroyed(): boolean {
    return this.destroyed;
  }

  tickRegen(deltaMs: number): void {
    if (this.regenRate <= 0 || this.destroyed || this.hp >= this.maxHp) return;
    this.repair(this.regenRate * (deltaMs / 1000));
  }
}
