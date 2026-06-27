import Phaser from 'phaser';
import type { OverworldPOI } from '@malik/shared';
import { OverworldPlayer } from './OverworldPlayer';

type EnemyType = NonNullable<OverworldPOI['enemyType']>;

const ENEMY_TEXTURES: Record<EnemyType, string> = {
  hyena: 'hyena',
  scorpion: 'dune_scorpion',
  bandit: 'sand_bandit',
  bandit_archer: 'bandit_archer',
  rashid: 'bandit_leader',
};

const ENEMY_STATS: Record<EnemyType, { speed: number; damage: number; aggro: number; scale: number }> = {
  hyena: { speed: 105, damage: 8, aggro: 260, scale: 0.95 },
  scorpion: { speed: 70, damage: 10, aggro: 230, scale: 0.85 },
  bandit: { speed: 82, damage: 12, aggro: 280, scale: 0.9 },
  bandit_archer: { speed: 64, damage: 9, aggro: 330, scale: 0.9 },
  rashid: { speed: 58, damage: 18, aggro: 380, scale: 1.2 },
};

export class OverworldEnemy extends Phaser.Physics.Arcade.Sprite {
  readonly poi: OverworldPOI;
  readonly maxHp: number;
  private hp: number;
  private attackCooldownUntil = 0;
  private readonly hpBar: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, poi: OverworldPOI) {
    const type = poi.enemyType ?? 'bandit';
    super(scene, poi.x, poi.y, ENEMY_TEXTURES[type]);
    this.poi = poi;
    this.maxHp = poi.enemyHp ?? (poi.kind === 'boss' ? 130 : 45);
    this.hp = this.maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(poi.kind === 'boss' ? 18 : 16);
    this.setScale(ENEMY_STATS[type].scale);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(28, 24);
    body.setOffset(2, 8);

    this.hpBar = scene.add.graphics().setDepth(22);
    this.redrawHpBar();
  }

  getHpRatio(): number {
    return Math.max(0, this.hp) / this.maxHp;
  }

  takeHit(amount: number, knockbackFrom: Phaser.Math.Vector2): boolean {
    this.hp = Math.max(0, this.hp - amount);
    const dx = this.x - knockbackFrom.x;
    const dy = this.y - knockbackFrom.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    this.setVelocity((dx / dist) * 180, (dy / dist) * 180);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(90, () => this.clearTint());
    this.redrawHpBar();
    return this.hp <= 0;
  }

  updateEnemy(time: number, player: OverworldPlayer, onHitPlayer: (damage: number) => void): void {
    if (this.hp <= 0) return;
    const type = this.poi.enemyType ?? 'bandit';
    const stats = ENEMY_STATS[type];
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist <= stats.aggro) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const norm = Math.max(1, Math.hypot(dx, dy));
      this.setVelocity((dx / norm) * stats.speed, (dy / norm) * stats.speed);
      this.setFlipX(dx < 0);
    } else {
      this.setVelocity(0, 0);
    }

    if (dist <= 28 && time >= this.attackCooldownUntil) {
      this.attackCooldownUntil = time + (this.poi.kind === 'boss' ? 1300 : 1600);
      onHitPlayer(stats.damage);
    }

    this.redrawHpBar();
  }

  destroy(fromScene?: boolean): void {
    this.hpBar.destroy();
    super.destroy(fromScene);
  }

  private redrawHpBar(): void {
    this.hpBar.clear();
    const width = this.poi.kind === 'boss' ? 64 : 42;
    const x = this.x - width / 2;
    const y = this.y - (this.poi.kind === 'boss' ? 46 : 34);
    this.hpBar.fillStyle(0x1a1010, 0.85);
    this.hpBar.fillRect(x, y, width, 5);
    this.hpBar.fillStyle(this.poi.kind === 'boss' ? 0xdd3355 : 0xff6644, 0.95);
    this.hpBar.fillRect(x, y, width * this.getHpRatio(), 5);
  }
}
