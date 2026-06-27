import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { Player } from './Player';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import { flashSprite, showDamageNumber, spawnDust } from '../utils/combatFeedback';

export class Lion extends Phaser.Physics.Arcade.Sprite {
  private damage: number;
  private maxHp: number;
  private hp: number;
  private lastAttackTime = 0;
  private attackCooldown = 1200;
  private attackRange = 55;
  private dead = false;
  private respawnTime = 0;
  private lastRoarTime = -20000;
  private roarCooldown: number;
  private player: Player;
  private mode: 'follow' | 'guard' | 'guard_left' | 'guard_right' | 'aggressive';

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y, 'lion');

    this.player = player;
    this.damage = MissionBridge.getLionDamage();
    this.maxHp = MissionBridge.getLionMaxHp();
    this.hp = this.maxHp;
    this.roarCooldown = MissionBridge.getLionRoarCooldownMs();
    this.mode = MissionBridge.getLionMode();

    this.setOrigin(0.5, 1);
    this.setDepth(9);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(30, 22);
    body.setOffset(3, 6);
    body.setCollideWorldBounds(true);
  }

  update(time: number, enemies: Enemy[], defenseX?: number): void {
    if (this.dead) {
      if (time > this.respawnTime) this.respawn();
      return;
    }

    this.mode = MissionBridge.getLionMode();
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.mode === 'aggressive') {
      const target = this.findAggressiveTarget(enemies);
      if (target) {
        const dist = target.x - this.x;
        if (Math.abs(dist) > 25) {
          body.setVelocityX(dist > 0 ? 180 : -180);
          this.setFlipX(dist < 0);
        } else {
          body.setVelocityX(0);
        }
      } else {
        this.followPlayer(body);
      }
    } else if (
      (this.mode === 'guard' || this.mode === 'guard_left' || this.mode === 'guard_right') &&
      defenseX !== undefined
    ) {
      const anchorX = defenseX - 80;
      const dist = anchorX - this.x;
      if (Math.abs(dist) > 30) {
        body.setVelocityX(dist > 0 ? 120 : -120);
        this.setFlipX(dist < 0);
      } else {
        body.setVelocityX(0);
      }
    } else {
      this.followPlayer(body);
    }

    const nearest = this.findNearestEnemy(enemies, defenseX);
    if (nearest && time - this.lastAttackTime > this.attackCooldown) {
      const d = Phaser.Math.Distance.Between(this.x, this.y - 15, nearest.x, nearest.y - 15);
      if (d < this.attackRange) {
        this.lungeAttack(nearest, time);
      }
    }
  }

  private followPlayer(body: Phaser.Physics.Arcade.Body): void {
    const targetX = this.player.x - 60;
    const dist = targetX - this.x;
    if (Math.abs(dist) > 20) {
      body.setVelocityX(dist > 0 ? 140 : -140);
      this.setFlipX(dist < 0);
    } else {
      body.setVelocityX(0);
    }
  }

  takeDamage(amount: number): void {
    if (this.dead) return;
    this.hp -= amount;
    flashSprite(this);
    showDamageNumber(this.scene, this.x, this.y - 30, amount, '#ffaa44');

    if (this.hp <= 0) {
      this.dead = true;
      this.setAlpha(0.3);
      this.respawnTime = this.scene.time.now + MissionBridge.getLionRespawnMs();
      spawnDust(this.scene, this.x, this.y);
    }
  }

  private findAggressiveTarget(enemies: Enemy[]): Enemy | null {
    let furthest: Enemy | null = null;
    let maxDist = 0;
    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d > maxDist) {
        maxDist = d;
        furthest = enemy;
      }
    }
    return furthest;
  }

  private findNearestEnemy(enemies: Enemy[], defenseX?: number): Enemy | null {
    if (defenseX !== undefined && (this.mode === 'guard' || this.mode === 'guard_left' || this.mode === 'guard_right' || this.mode === 'follow')) {
      let gateThreat: Enemy | null = null;
      let minGateDist = Infinity;
      for (const enemy of enemies) {
        if (!enemy.isAlive()) continue;
        const isArcher = enemy.getEnemyType() === 'bandit_archer';
        const dGate = Math.abs(enemy.x - defenseX);
        const dLion = Phaser.Math.Distance.Between(this.x, this.y - 15, enemy.x, enemy.y - 15);
        const threatRange = isArcher ? 280 : 220;
        if (dGate < threatRange && dLion < 150 && dGate < minGateDist) {
          minGateDist = dGate;
          gateThreat = enemy;
        }
      }
      if (gateThreat) return gateThreat;
    }

    let nearest: Enemy | null = null;
    let minDist = this.attackRange + 40;

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y - 15, enemy.x, enemy.y - 15);
      if (d < minDist) {
        minDist = d;
        nearest = enemy;
      }
    }
    return nearest;
  }

  private lungeAttack(enemy: Enemy, time: number): void {
    this.lastAttackTime = time;
    SoundManager.play('attack');

    this.scene.tweens.add({
      targets: this,
      x: enemy.x + (this.x > enemy.x ? 30 : -30),
      duration: 150,
      yoyo: true,
      onYoyo: () => {
        if (enemy.isAlive()) {
          enemy.takeDamage(this.damage, enemy.x > this.x ? 1 : -1);
        }
      },
    });
  }

  private respawn(): void {
    this.dead = false;
    this.hp = this.maxHp;
    this.setAlpha(1);
    this.x = this.player.x - 40;
    spawnDust(this.scene, this.x, this.y);
  }

  isActive(): boolean {
    return !this.dead;
  }

  tryRoar(enemies: Enemy[]): boolean {
    const time = this.scene.time.now;
    if (this.dead || time - this.lastRoarTime < this.roarCooldown) return false;

    this.lastRoarTime = time;
    SoundManager.play('wave');

    this.setTint(0xffdd88);
    this.scene.time.delayedCall(300, () => this.clearTint());

    const roar = this.scene.add.circle(this.x, this.y - 20, 10, 0xffaa44, 0.5).setDepth(15);
    this.scene.tweens.add({
      targets: roar,
      scale: 15,
      alpha: 0,
      duration: 500,
      onComplete: () => roar.destroy(),
    });

    const roarDamage = this.damage * 2;
    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y - 15, enemy.x, enemy.y - 15);
      if (d < 150) {
        enemy.applyStun(1800);
        enemy.takeDamage(roarDamage, enemy.x > this.x ? 1 : -1);
      }
    }
    return true;
  }

  getRoarCooldownPct(): number {
    const elapsed = this.scene.time.now - this.lastRoarTime;
    return Math.min(1, elapsed / this.roarCooldown);
  }
}
