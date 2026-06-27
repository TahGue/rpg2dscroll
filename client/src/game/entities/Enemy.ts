import Phaser from 'phaser';
import { getEnemyDefinition, isBossType } from '@malik/shared';
import type { DefenseTarget } from './DefenseTarget';
import type { Player } from './Player';
import type { AttackableObstacle } from './AttackableObstacle';
import { MissionBridge } from '../systems/MissionBridge';
import { SoundManager } from '../systems/SoundManager';
import { applyKnockback, flashSprite, showDamageNumber, spawnDust, spawnGoldPickup, spawnHealthPickup } from '../utils/combatFeedback';

const ENEMY_TEXTURES: Record<string, string> = {
  hyena: 'hyena',
  sand_bandit: 'sand_bandit',
  bandit_leader: 'bandit_leader',
  bandit_archer: 'bandit_archer',
  bandit_warlord: 'bandit_warlord',
  camel_raider: 'camel_raider',
  sand_wisp: 'sand_wisp',
  dune_scorpion: 'dune_scorpion',
  scorpion_skitter: 'scorpion_skitter',
  spitting_scorpion: 'spitting_scorpion',
  iron_vanguard: 'iron_vanguard',
  sand_wraith: 'sand_wraith',
  shadow_emir: 'shadow_emir',
};

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private health: number;
  private maxHealth: number;
  private damage: number;
  private moveSpeed: number;
  private attackRange: number;
  private attackCooldownMs: number;
  private goldDrop: number;
  private xpDrop: number;
  private armor: number;
  private poisonDps: number;
  private behavior: 'melee' | 'ranged' | 'flying' | 'boss';
  private enemyType: string;
  private lastAttackTime = 0;
  private isDead = false;
  private projectileHitUntil = 0;
  private stunnedUntil = 0;
  private flyingPhase = 0;
  private baseY: number;
  private target: DefenseTarget | null;
  private player: Player;
  private ambush: boolean;
  private barricades: AttackableObstacle[] = [];
  private isBoss = false;
  private enraged = false;
  private emirPhase = 0;
  private emirSummoned = false;
  private lastShadowDash = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    enemyType: string,
    target: DefenseTarget | null,
    player: Player,
    options?: { ambush?: boolean; statMultiplier?: number },
  ) {
    const def = getEnemyDefinition(enemyType)!;
    const texture = ENEMY_TEXTURES[enemyType] ?? 'hyena';
    super(scene, x, y, texture);

    const mult = options?.statMultiplier ?? 1;
    this.target = target;
    this.player = player;
    this.ambush = options?.ambush ?? false;
    this.maxHealth = Math.round(def.health * mult);
    this.health = this.maxHealth;
    this.damage = Math.round(def.damage * mult);
    this.moveSpeed = def.speed;
    this.attackRange = def.attackRange;
    this.attackCooldownMs = def.attackCooldownMs;
    this.goldDrop = def.goldDrop;
    this.xpDrop = def.xpDrop;
    this.armor = def.armor ?? 0;
    this.poisonDps = def.poisonDps ?? 0;
    this.enemyType = enemyType;
    this.behavior = def.behavior;
    this.isBoss = def.isBoss === true;
    this.baseY = y;
    this.flyingPhase = Math.random() * Math.PI * 2;

    this.setOrigin(0.5, 1);
    this.setDepth(8);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const isLeader = enemyType === 'bandit_leader' || enemyType === 'bandit_warlord';
    const isArcher = enemyType === 'bandit_archer';
    const isScorpion = enemyType === 'dune_scorpion';
    const isSkitter = enemyType === 'scorpion_skitter';
    const isSpitter = enemyType === 'spitting_scorpion';
    const isIron = enemyType === 'iron_vanguard';
    const isWraith = enemyType === 'sand_wraith';
    const isEmir = enemyType === 'shadow_emir';
    body.setSize(
      isEmir ? 46 : isScorpion ? 44 : isIron ? 38 : isSpitter ? 30 : isSkitter ? 24 : isLeader ? 34 : isArcher ? 26 : isWraith ? 24 : 28,
      isEmir ? 40 : isScorpion ? 36 : isIron ? 34 : isSpitter ? 26 : isSkitter ? 20 : isLeader ? 30 : isArcher ? 28 : isWraith ? 26 : 24,
    );
    body.setOffset(isScorpion ? 2 : isSkitter ? 6 : isSpitter ? 4 : isIron ? 3 : isLeader ? 3 : isWraith ? 6 : 4, isScorpion ? 4 : isSkitter ? 8 : isLeader ? 6 : 4);
    body.setCollideWorldBounds(false);
    if (this.behavior === 'flying') {
      body.setAllowGravity(false);
    }
  }

  getEnemyType(): string {
    return this.enemyType;
  }

  getBossHudInfo(): { hp: number; maxHp: number; name: string; phase: number } | null {
    if (!this.isBoss || this.isDead) return null;
    const def = getEnemyDefinition(this.enemyType);
    return {
      hp: this.health,
      maxHp: this.maxHealth,
      name: def?.name ?? this.enemyType,
      phase: this.emirPhase,
    };
  }

  setBarricades(barricades: AttackableObstacle[]): void {
    this.barricades = barricades;
  }

  isStunned(time: number): boolean {
    return time < this.stunnedUntil;
  }

  applyStun(durationMs: number): void {
    this.stunnedUntil = Math.max(this.stunnedUntil, this.scene.time.now + durationMs);
    this.setTint(0xaaaaff);
    this.scene.time.delayedCall(durationMs, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  update(time: number): void {
    if (this.isDead || !this.active) return;

    if (this.behavior === 'flying') {
      this.flyingPhase += 0.04;
      this.y = this.baseY - 40 + Math.sin(this.flyingPhase) * 12;
    }

    if (this.isStunned(time)) {
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
      return;
    }

    if (this.ambush) {
      this.updateAmbush(time);
      return;
    }

    if (this.enemyType === 'shadow_emir') {
      this.updateShadowEmir(time);
      return;
    }

    if (this.behavior === 'ranged' || this.behavior === 'flying') {
      this.updateRanged(time);
    } else {
      this.updateMelee(time);
    }
  }

  private updateAmbush(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.player.isDead()) {
      body.setVelocityX(0);
      return;
    }

    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y - 20, this.player.x, this.player.y - 20);
    const ranged = this.behavior === 'ranged' || this.behavior === 'flying';

    if (distToPlayer < this.attackRange + (ranged ? 0 : 15)) {
      body.setVelocityX(0);
      this.setFlipX(this.player.x < this.x);
      this.tryAttackPlayer(time, ranged);
      return;
    }

    if (this.player.x > this.x) {
      body.setVelocityX(this.moveSpeed);
      this.setFlipX(false);
    } else {
      body.setVelocityX(-this.moveSpeed);
      this.setFlipX(true);
    }
  }

  private updateShadowEmir(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y - 20, this.player.x, this.player.y - 20);
    const distToGate = this.target ? Math.abs(this.target.x - this.x) : Infinity;

    if (this.emirPhase >= 2 && time - this.lastShadowDash > 5500 && !this.player.isDead()) {
      this.lastShadowDash = time;
      this.performShadowDash();
      return;
    }

    const preferPlayer = distToPlayer < 420 || this.emirPhase >= 1;
    if (preferPlayer && distToPlayer > this.attackRange + 10 && !this.player.isDead()) {
      body.setVelocityX(this.player.x > this.x ? this.moveSpeed : -this.moveSpeed);
      this.setFlipX(this.player.x < this.x);
      return;
    }

    if (preferPlayer && distToPlayer <= this.attackRange + 20 && !this.player.isDead()) {
      body.setVelocityX(0);
      this.tryAttackPlayer(time, this.enraged || this.emirPhase >= 1);
      return;
    }

    if (this.target && distToGate > this.attackRange) {
      body.setVelocityX(this.target.x > this.x ? this.moveSpeed * 0.85 : -this.moveSpeed * 0.85);
      this.setFlipX(this.target.x < this.x);
    } else if (this.target) {
      body.setVelocityX(0);
      this.tryAttackGate(time, this.emirPhase >= 1);
    }
  }

  private performShadowDash(): void {
    if (this.player.isDead()) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir = this.player.x >= this.x ? 1 : -1;
    SoundManager.play('hit');

    const trail = this.scene.add.image(this.x, this.y - 20, 'shadow_emir');
    trail.setAlpha(0.35).setTint(0x8844ff).setDepth(7);
    this.scene.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });

    this.x += dir * Phaser.Math.Between(140, 200);
    body.setVelocity(0, 0);
    this.setTint(0xaa66ff);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  private checkEmirPhaseTransitions(): void {
    if (this.isDead) return;
    const pct = this.health / this.maxHealth;

    if (!this.emirSummoned && pct <= 0.66) {
      this.emirSummoned = true;
      this.emirPhase = 1;
      this.attackCooldownMs = Math.round(this.attackCooldownMs * 0.82);
      this.showPhaseBanner('Shadow wraiths answer the Emir!');
      this.scene.events.emit('boss-summon', {
        type: 'sand_wraith',
        count: 2,
        x: this.x,
        y: this.y,
      });
    }

    if (pct <= 0.33 && this.emirPhase < 2) {
      this.emirPhase = 2;
      this.moveSpeed = Math.round(this.moveSpeed * 1.3);
      this.showPhaseBanner('The Emir becomes living shadow!');
    }
  }

  private showPhaseBanner(message: string): void {
    const cam = this.scene.cameras.main;
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 80, message, {
        fontSize: '18px',
        color: '#cc88ff',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    this.scene.tweens.add({ targets: text, alpha: 0, duration: 2200, onComplete: () => text.destroy() });
  }

  private updateMelee(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const distToGate = this.target!.x - this.x;
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y - 20, this.player.x, this.player.y - 20);

    if (distToPlayer < this.attackRange + 20 && !this.player.isDead()) {
      body.setVelocityX(0);
      this.tryAttackPlayer(time);
      return;
    }

    const barricade = this.findBlockingBarricade();
    if (barricade) {
      const distToBarricade = Math.abs(barricade.x - this.x);
      if (distToBarricade <= this.attackRange + 10) {
        body.setVelocityX(0);
        this.setFlipX(barricade.x < this.x);
        this.tryAttackBarricade(time, barricade);
        return;
      }
      body.setVelocityX(barricade.x > this.x ? this.moveSpeed : -this.moveSpeed);
      this.setFlipX(barricade.x < this.x);
      return;
    }

    if (Math.abs(distToGate) > this.attackRange) {
      body.setVelocityX(distToGate > 0 ? this.moveSpeed : -this.moveSpeed);
      this.setFlipX(distToGate < 0);
    } else {
      body.setVelocityX(0);
      this.tryAttackGate(time);
    }
  }

  private updateRanged(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const distToGate = this.target!.x - this.x;
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y - 20, this.player.x, this.player.y - 20);
    const preferredRange = this.attackRange * 0.85;

    if (distToPlayer < this.attackRange && distToPlayer < Math.abs(distToGate) && !this.player.isDead()) {
      body.setVelocityX(0);
      this.setFlipX(this.player.x < this.x);
      this.tryAttackPlayer(time, true);
      return;
    }

    const barricade = this.findBlockingBarricade();
    if (barricade && Math.abs(barricade.x - this.x) < this.attackRange + 40) {
      body.setVelocityX(0);
      this.setFlipX(barricade.x < this.x);
      this.tryAttackBarricade(time, barricade);
      return;
    }

    if (Math.abs(distToGate) > preferredRange) {
      body.setVelocityX(distToGate > 0 ? this.moveSpeed : -this.moveSpeed);
      this.setFlipX(distToGate < 0);
    } else if (Math.abs(distToGate) < preferredRange - 40) {
      body.setVelocityX(distToGate > 0 ? -this.moveSpeed * 0.5 : this.moveSpeed * 0.5);
      this.setFlipX(distToGate > 0);
    } else {
      body.setVelocityX(0);
      this.setFlipX(distToGate < 0);
      this.tryAttackGate(time, true);
    }
  }

  takeDamage(amount: number, knockbackDir: number, knockbackForce = 120): void {
    if (this.isDead) return;

    if (this.armor > 0) {
      amount = Math.floor(amount * (1 - this.armor));
    }

    this.health -= amount;
    flashSprite(this);
    SoundManager.play('hit');
    showDamageNumber(this.scene, this.x, this.y - 30, amount);
    applyKnockback(this.body as Phaser.Physics.Arcade.Body, knockbackDir, knockbackForce);

    if (this.isBoss && !this.enraged && this.health > 0 && this.health / this.maxHealth <= 0.5) {
      this.enterEnrage();
    }

    if (this.enemyType === 'shadow_emir') {
      this.checkEmirPhaseTransitions();
    }

    if (this.health <= 0) {
      this.die();
    }
  }

  private enterEnrage(): void {
    this.enraged = true;
    this.damage = Math.round(this.damage * 1.35);
    this.moveSpeed = Math.round(this.moveSpeed * 1.2);
    this.attackCooldownMs = Math.round(this.attackCooldownMs * 0.7);
    if (this.poisonDps > 0) this.poisonDps = Math.round(this.poisonDps * 1.5);

    this.setTint(0xff4444);
    SoundManager.play('wave');

    const label =
      this.enemyType === 'shadow_emir'
        ? 'The Emir unleashes shadow fury!'
        : this.enemyType === 'dune_scorpion'
          ? 'The scorpion enrages!'
          : 'BOSS ENRAGED';

    const cam = this.scene.cameras.main;
    const text = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 100, label, {
        fontSize: '20px',
        color: '#ff6666',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1800,
      onComplete: () => text.destroy(),
    });

    if (this.enemyType === 'shadow_emir') {
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.15,
        scaleY: 1.15,
        yoyo: true,
        duration: 400,
        repeat: 2,
      });
    }
  }

  takeProjectileDamage(amount: number, knockbackDir: number, time: number): void {
    if (time < this.projectileHitUntil) return;
    this.projectileHitUntil = time + 200;
    this.takeDamage(amount, knockbackDir, 80);
  }

  private findBlockingBarricade(): AttackableObstacle | null {
    if (!this.target || this.barricades.length === 0) return null;

    const towardGate = this.target.x >= this.x ? 1 : -1;
    let nearest: AttackableObstacle | null = null;
    let nearestDist = Infinity;

    for (const barricade of this.barricades) {
      if (barricade.isDestroyed()) continue;
      const dx = (barricade.x - this.x) * towardGate;
      if (dx <= 8 || dx > 130) continue;
      if (dx < nearestDist) {
        nearestDist = dx;
        nearest = barricade;
      }
    }

    return nearest;
  }

  private tryAttackBarricade(time: number, barricade: AttackableObstacle): void {
    if (time - this.lastAttackTime < this.attackCooldownMs) return;
    if (barricade.isDestroyed()) return;
    this.lastAttackTime = time;
    barricade.takeDamage(this.damage);
    this.playAttackAnim();
  }

  private tryAttackGate(time: number, ranged = false): void {
    const target = this.target;
    if (!target) return;
    if (time - this.lastAttackTime < this.attackCooldownMs) return;
    this.lastAttackTime = time;
    if (ranged) this.fireProjectile(target.x, target.y - 60, () => target.takeDamage(this.damage));
    else {
      target.takeDamage(this.damage);
      this.playAttackAnim();
    }
  }

  private tryAttackPlayer(time: number, ranged = false): void {
    if (time - this.lastAttackTime < this.attackCooldownMs) return;
    if (this.player.isDead()) return;
    this.lastAttackTime = time;

    const useRanged =
      ranged || (this.enraged && this.enemyType === 'shadow_emir' && Math.random() < 0.45);

    if (useRanged) {
      const tint = this.enemyType === 'shadow_emir' ? 0x8844ff : 0xffaa44;
      this.fireProjectile(this.player.x, this.player.y - 30, () => {
        this.player.takeDamage(this.damage);
        if (this.poisonDps > 0) this.player.applyPoison(this.poisonDps);
      }, tint);
    } else {
      this.player.takeDamage(this.damage);
      if (this.poisonDps > 0) this.player.applyPoison(this.poisonDps);
      this.setFlipX(this.player.x < this.x);
      this.playAttackAnim();
    }
  }

  private fireProjectile(
    targetX: number,
    targetY: number,
    onHit: () => void,
    tint = 0xffaa44,
  ): void {
    SoundManager.play('attack');
    const arrow = this.scene.add.image(this.x, this.y - 25, 'particle_slash');
    arrow.setScale(0.4, 0.2).setTint(tint).setDepth(12);

    this.scene.tweens.add({
      targets: arrow,
      x: targetX,
      y: targetY,
      duration: 250,
      onComplete: () => {
        arrow.destroy();
        onHit();
      },
    });
  }

  private playAttackAnim(): void {
    this.setTint(0xffaa88);
    this.scene.time.delayedCall(150, () => {
      if (!this.isDead) this.clearTint();
    });
  }

  private die(): void {
    if (this.isDead) return;
    this.isDead = true;

    MissionBridge.addGold(this.goldDrop);
    MissionBridge.addKill();
    spawnGoldPickup(this.scene, this.x, this.y - 20, this.goldDrop);
    spawnHealthPickup(this.scene, this.x, this.y - 20, 15, () => this.player);
    spawnDust(this.scene, this.x, this.y);
    SoundManager.play('death');

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 10,
      duration: 300,
      onComplete: () => {
        this.scene.events.emit('enemy-died', { xp: this.xpDrop, enemyType: this.enemyType });
        if (isBossType(this.enemyType)) {
          MissionBridge.addBossKill(this.enemyType);
        }
        this.destroy();
      },
    });
  }

  isAlive(): boolean {
    return !this.isDead && this.active;
  }
}
