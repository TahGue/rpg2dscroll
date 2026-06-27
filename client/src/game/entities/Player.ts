import Phaser from 'phaser';
import { MissionBridge } from '../systems/MissionBridge';
import { InputBridge } from '../systems/InputBridge';
import { bindKey } from '../systems/KeyBindingManager';
import { SoundManager } from '../systems/SoundManager';
import { flashSprite, shakeCamera, showDamageNumber, spawnDust } from '../utils/combatFeedback';

export type AttackHitCallback = (
  hitbox: Phaser.Geom.Rectangle,
  damage: number,
  knockbackForce: number,
  aoe?: { x: number; y: number; radius: number },
) => void;

export type ProjectileHitCallback = (x: number, y: number, damage: number) => void;

export class Player extends Phaser.GameObjects.Sprite {
  hp: number;
  maxHp: number;
  private swordDamage: number;
  private facing: 'left' | 'right' = 'right';
  private isAttacking = false;
  private blocking = false;
  private dead = false;
  private invincibleUntil = 0;
  private wasOnGround = true;
  private dustTimer = 0;
  private attackKey?: Phaser.Input.Keyboard.Key;
  private blockKey?: Phaser.Input.Keyboard.Key;
  private bashKey?: Phaser.Input.Keyboard.Key;
  private slashKey?: Phaser.Input.Keyboard.Key;
  private dodgeKey?: Phaser.Input.Keyboard.Key;
  private bowKey?: Phaser.Input.Keyboard.Key;
  private spearKey?: Phaser.Input.Keyboard.Key;
  private warCryKey?: Phaser.Input.Keyboard.Key;
  private sentinelKey?: Phaser.Input.Keyboard.Key;
  private jumpKey?: Phaser.Input.Keyboard.Key;
  private spaceFallbackKey?: Phaser.Input.Keyboard.Key;
  private lastShieldBashTime = -10000;
  private lastSandSlashTime = -20000;
  private lastDodgeTime = -5000;
  private lastBowTime = -1000;
  private lastSpearTime = -1000;
  private shieldBashCooldownMs = 8000;
  private sandSlashCooldownMs = 12000;
  private dodgeCooldownMs = 600;
  private bowCooldownMs = 700;
  private spearCooldownMs = 950;
  private warCryCooldownMs = 14000;
  private sentinelCooldownMs = 18000;
  private isBashing = false;
  private isSlashing = false;
  private isDodging = false;
  private isSpearing = false;
  private poisonDps = 0;
  private poisonUntil = 0;
  private isRepairing = false;
  private speedMultiplier = 1;
  private onAttackHit?: AttackHitCallback;
  private onProjectileHit?: ProjectileHitCallback;
  private onWarCryHit?: (centerX: number, centerY: number, damage: number) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number, swordDamage: number) {
    super(scene, x, y, 'malik');

    this.maxHp = maxHp;
    this.hp = maxHp;
    this.swordDamage = swordDamage;

    this.setOrigin(0.5, 1);
    this.setDepth(10);

    if (scene.input.keyboard) {
      this.attackKey = bindKey(scene, 'attack');
      this.blockKey = bindKey(scene, 'block');
      this.bashKey = bindKey(scene, 'shield_bash');
      this.slashKey = bindKey(scene, 'sand_slash');
      this.dodgeKey = bindKey(scene, 'dodge');
      this.bowKey = bindKey(scene, 'bow');
      this.spearKey = bindKey(scene, 'spear');
      this.warCryKey = bindKey(scene, 'war_cry');
      this.sentinelKey = bindKey(scene, 'sentinel');
      this.jumpKey = bindKey(scene, 'jump');
      this.spaceFallbackKey = scene.input.keyboard.addKey('SPACE');
    }

    MissionBridge.syncPlayer(this.hp, this.maxHp);
  }

  setAttackCallback(callback: AttackHitCallback): void {
    this.onAttackHit = callback;
  }

  setProjectileCallback(callback: ProjectileHitCallback): void {
    this.onProjectileHit = callback;
  }

  setWarCryCallback(callback: (centerX: number, centerY: number, damage: number) => void): void {
    this.onWarCryHit = callback;
  }

  applyPoison(dps: number, durationMs = 4000): void {
    this.poisonDps = Math.max(this.poisonDps, dps);
    this.poisonUntil = this.scene.time.now + durationMs;
  }

  getSwordDamage(): number {
    return this.swordDamage;
  }

  isDead(): boolean {
    return this.dead;
  }

  setRepairing(repairing: boolean): void {
    this.isRepairing = repairing;
    if (repairing) {
      this.setTint(0x88ff88);
    } else if (!this.blocking) {
      this.clearTint();
    }
  }

  setSpeedMultiplier(mult: number): void {
    this.speedMultiplier = mult;
  }

  heal(amount: number): void {
    if (this.dead || amount <= 0) return;
    const prev = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    if (this.hp > prev) {
      MissionBridge.syncPlayer(this.hp, this.maxHp);
    }
  }

  applyWindForce(forcePerSec: number, deltaMs: number): void {
    if (this.dead || this.isRepairing || this.blocking) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return;
    body.setVelocityX(body.velocity.x + forcePerSec * (deltaMs / 1000) * 0.4);
  }

  applyEnvironmentalPoison(dps: number, deltaMs: number): void {
    if (this.dead) return;
    this.hp = Math.max(0, this.hp - (dps * deltaMs) / 1000);
    MissionBridge.syncPlayer(this.hp, this.maxHp);
    if (this.hp <= 0 && !this.dead) {
      this.dead = true;
      this.setTint(0x666666);
      this.scene.events.emit('mission-defeat', 'player');
    }
  }

  isBlocking(): boolean {
    return this.blocking;
  }

  isDodgeActive(): boolean {
    return this.isDodging;
  }

  getShieldBashCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastShieldBashTime) / this.shieldBashCooldownMs);
  }

  getSandSlashCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastSandSlashTime) / this.sandSlashCooldownMs);
  }

  getDodgeCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastDodgeTime) / this.dodgeCooldownMs);
  }

  getBowCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastBowTime) / this.bowCooldownMs);
  }

  getSpearCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastSpearTime) / this.spearCooldownMs);
  }

  getWarCryCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastWarCryTime) / this.warCryCooldownMs);
  }

  getSentinelCooldownPct(): number {
    return Math.min(1, (this.scene.time.now - this.lastSentinelTime) / this.sentinelCooldownMs);
  }

  private lastWarCryTime = -20000;
  private lastSentinelTime = -30000;

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key },
    delta: number,
  ): void {
    if (this.dead) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = MissionBridge.getPlayerSpeed() * this.speedMultiplier;
    const onGround = body.blocked.down || body.touching.down;

    if (this.scene.time.now < this.poisonUntil && this.poisonDps > 0) {
      this.hp = Math.max(0, this.hp - (this.poisonDps * delta) / 1000);
      MissionBridge.syncPlayer(this.hp, this.maxHp);
      if (this.hp <= 0 && !this.dead) {
        this.dead = true;
        this.setTint(0x666666);
        this.scene.events.emit('mission-defeat', 'player');
      }
    } else if (this.poisonUntil <= this.scene.time.now) {
      this.poisonDps = 0;
    }

    const wantBlock = (this.blockKey?.isDown ?? false) || InputBridge.isHeld('block');
    this.blocking = wantBlock && !this.isDodging;

    if (this.blocking && MissionBridge.getHealingWindRegen() > 0) {
      this.hp = Math.min(this.maxHp, this.hp + (MissionBridge.getHealingWindRegen() * delta) / 1000);
      MissionBridge.syncPlayer(this.hp, this.maxHp);
    }

    if (this.isRepairing) {
      body.setVelocityX(0);
      this.setTexture('malik');
      this.setTint(0x88ff88);
    } else if (this.blocking) {
      body.setVelocityX(0);
      this.setTexture('malik_block');
      this.setTint(0xaaccff);
    } else if (!this.isDodging) {
      this.clearTint();
    }

    let moving = false;
    const wantLeft = cursors.left.isDown || wasd.A.isDown || InputBridge.isHeld('left');
    const wantRight = cursors.right.isDown || wasd.D.isDown || InputBridge.isHeld('right');
    const wantJump =
      Phaser.Input.Keyboard.JustDown(cursors.up) ||
      (this.jumpKey ? Phaser.Input.Keyboard.JustDown(this.jumpKey) : false) ||
      (this.spaceFallbackKey &&
        this.jumpKey?.keyCode !== Phaser.Input.Keyboard.KeyCodes.SPACE &&
        Phaser.Input.Keyboard.JustDown(this.spaceFallbackKey)) ||
      InputBridge.consumePulse('jump');

    if (!this.isAttacking && !this.blocking && !this.isRepairing && !this.isBashing && !this.isSlashing && !this.isDodging && !this.isSpearing) {
      if (wantLeft && !wantRight) {
        body.setVelocityX(-speed);
        this.setFlipX(true);
        this.facing = 'left';
        moving = true;
      } else if (wantRight && !wantLeft) {
        body.setVelocityX(speed);
        this.setFlipX(false);
        this.facing = 'right';
        moving = true;
      } else if (!this.isDodging) {
        body.setVelocityX(0);
      }

      if (wantJump && onGround) {
        body.setVelocityY(-420);
        SoundManager.play('jump');
      }
    } else if (this.isAttacking) {
      body.setVelocityX(this.facing === 'right' ? speed * 0.3 : -speed * 0.3);
    }

    if (onGround && !this.wasOnGround) {
      spawnDust(this.scene, this.x, this.y);
    }
    this.wasOnGround = onGround;

    if (moving && onGround) {
      this.dustTimer += delta;
      if (this.dustTimer > 200) {
        spawnDust(this.scene, this.x - (this.facing === 'right' ? 8 : -8), this.y);
        this.dustTimer = 0;
      }
      this.setScale(1, 1 + Math.sin(this.scene.time.now / 80) * 0.02);
    } else if (!this.blocking && !this.isDodging) {
      this.dustTimer = 0;
      this.setScale(1);
    }

    const canAct =
      !this.blocking &&
      !this.isRepairing &&
      !this.isAttacking &&
      !this.isBashing &&
      !this.isSlashing &&
      !this.isDodging &&
      !this.isSpearing;

    if (canAct && (Phaser.Input.Keyboard.JustDown(this.attackKey!) || InputBridge.consumePulse('attack'))) {
      this.performAttack();
    }

    if (canAct && (Phaser.Input.Keyboard.JustDown(this.bashKey!) || InputBridge.consumePulse('bash'))) {
      this.performShieldBash();
    }

    if (
      canAct &&
      MissionBridge.isSandSlashUnlocked() &&
      (Phaser.Input.Keyboard.JustDown(this.slashKey!) || InputBridge.consumePulse('slash'))
    ) {
      this.performSandSlash();
    }

    if (canAct && (Phaser.Input.Keyboard.JustDown(this.dodgeKey!) || InputBridge.consumePulse('dodge'))) {
      this.performDodge();
    }

    if (
      !this.blocking &&
      !this.isDodging &&
      MissionBridge.isBowUnlocked() &&
      (Phaser.Input.Keyboard.JustDown(this.bowKey!) || InputBridge.consumePulse('bow'))
    ) {
      this.performBowShot();
    }

    if (
      canAct &&
      MissionBridge.isSpearUnlocked() &&
      (Phaser.Input.Keyboard.JustDown(this.spearKey!) || InputBridge.consumePulse('spear'))
    ) {
      this.performSpearThrust();
    }

    if (
      canAct &&
      MissionBridge.isWarCryUnlocked() &&
      (Phaser.Input.Keyboard.JustDown(this.warCryKey!) || InputBridge.consumePulse('war_cry'))
    ) {
      this.performWarCry();
    }

    if (
      canAct &&
      MissionBridge.isSentinelShieldUnlocked() &&
      (Phaser.Input.Keyboard.JustDown(this.sentinelKey!) || InputBridge.consumePulse('sentinel'))
    ) {
      this.performSentinelShield();
    }

    MissionBridge.syncShieldBashCooldown(this.getShieldBashCooldownPct());
    MissionBridge.syncSandSlashCooldown(this.getSandSlashCooldownPct());
    MissionBridge.syncDodgeCooldown(this.getDodgeCooldownPct());
    MissionBridge.syncBowCooldown(this.getBowCooldownPct());
    MissionBridge.syncSpearCooldown(this.getSpearCooldownPct());
    MissionBridge.syncWarCryCooldown(this.getWarCryCooldownPct());
    MissionBridge.syncSentinelCooldown(this.getSentinelCooldownPct());
  }

  takeDamage(amount: number): void {
    if (this.dead || this.isDodging || this.scene.time.now < this.invincibleUntil) return;

    const eclipseReduction = MissionBridge.getEclipseDamageReduction();
    if (eclipseReduction > 0) {
      amount = Math.floor(amount * (1 - eclipseReduction));
    }

    if (this.blocking) {
      amount = Math.floor(amount * (1 - MissionBridge.getBlockReduction()));
      SoundManager.play('hit');
      this.scene.cameras.main.flash(100, 100, 150, 255, false, undefined, 0.15);
    }

    this.hp = Math.max(0, this.hp - amount);
    MissionBridge.syncPlayer(this.hp, this.maxHp);

    if (amount > 0) {
      flashSprite(this);
      showDamageNumber(this.scene, this.x, this.y - 40, amount, '#ff8888');
      if (!this.blocking) shakeCamera(this.scene, 0.006, 120);
      if (!this.blocking) SoundManager.play('hit');
      this.invincibleUntil = this.scene.time.now + 800;
    }

    if (this.hp <= 0) {
      this.dead = true;
      this.setTint(0x666666);
      this.scene.events.emit('mission-defeat', 'player');
    }
  }

  private performAttack(): void {
    this.isAttacking = true;
    this.setTexture('malik_attack');
    SoundManager.play('attack');

    const offsetX = this.facing === 'right' ? 35 : -35;
    const slash = this.scene.add.image(this.x + offsetX, this.y - 24, 'particle_slash');
    slash.setAlpha(0.8);
    slash.setAngle(this.facing === 'right' ? 0 : 180);
    slash.setDepth(15);

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 2,
      duration: 200,
      onComplete: () => slash.destroy(),
    });

    const hitbox = new Phaser.Geom.Rectangle(
      this.facing === 'right' ? this.x : this.x - 50,
      this.y - 48,
      50,
      40,
    );
    this.onAttackHit?.(hitbox, this.swordDamage, 150);

    this.scene.time.delayedCall(300, () => {
      if (!this.dead && !this.blocking) this.setTexture('malik');
      this.isAttacking = false;
    });
  }

  private performShieldBash(): void {
    if (this.scene.time.now - this.lastShieldBashTime < this.shieldBashCooldownMs) return;

    this.lastShieldBashTime = this.scene.time.now;
    this.isBashing = true;
    this.setTexture('malik_block');
    SoundManager.play('attack');
    shakeCamera(this.scene, 0.008, 100);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.facing === 'right' ? 280 : -280);

    const hitbox = new Phaser.Geom.Rectangle(
      this.facing === 'right' ? this.x : this.x - 70,
      this.y - 48,
      70,
      44,
    );
    this.onAttackHit?.(hitbox, Math.round(this.swordDamage * 0.85), 320);

    spawnDust(this.scene, this.x + (this.facing === 'right' ? 45 : -45), this.y);

    this.scene.time.delayedCall(350, () => {
      if (!this.dead) this.setTexture('malik');
      this.isBashing = false;
      body.setVelocityX(0);
    });
  }

  private performSandSlash(): void {
    if (this.scene.time.now - this.lastSandSlashTime < this.sandSlashCooldownMs) return;

    this.lastSandSlashTime = this.scene.time.now;
    this.isSlashing = true;
    this.setTexture('malik_attack');
    SoundManager.play('wave');
    shakeCamera(this.scene, 0.01, 150);

    const level = MissionBridge.getSandSlashLevel();
    const damage = Math.round(this.swordDamage * (1.2 + (level - 1) * 0.25));
    const centerX = this.x + (this.facing === 'right' ? 40 : -40);
    const centerY = this.y - 24;

    const wave = this.scene.add.ellipse(centerX, centerY, 20, 20, 0xd4a843, 0.45).setDepth(14);
    this.scene.tweens.add({
      targets: wave,
      scaleX: 8,
      scaleY: 3,
      alpha: 0,
      duration: 400,
      onComplete: () => wave.destroy(),
    });

    for (let i = 0; i < 5; i++) {
      this.scene.time.delayedCall(i * 40, () => spawnDust(this.scene, centerX + (i - 2) * 20, this.y));
    }

    this.onAttackHit?.(
      new Phaser.Geom.Rectangle(0, 0, 0, 0),
      damage,
      180,
      { x: centerX, y: centerY, radius: 130 },
    );

    this.scene.time.delayedCall(450, () => {
      if (!this.dead && !this.blocking) this.setTexture('malik');
      this.isSlashing = false;
    });
  }

  private performDodge(): void {
    if (this.scene.time.now - this.lastDodgeTime < this.dodgeCooldownMs) return;

    this.lastDodgeTime = this.scene.time.now;
    this.isDodging = true;
    this.invincibleUntil = this.scene.time.now + 320;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.facing === 'right' ? 460 : -460);
    this.setAlpha(0.55);
    spawnDust(this.scene, this.x, this.y);

    this.scene.time.delayedCall(280, () => {
      this.isDodging = false;
      this.setAlpha(1);
      if (!this.dead) body.setVelocityX(0);
    });
  }

  private performSpearThrust(): void {
    if (this.scene.time.now - this.lastSpearTime < this.spearCooldownMs) return;

    this.lastSpearTime = this.scene.time.now;
    this.isSpearing = true;
    this.setTexture('malik_attack');
    SoundManager.play('attack');

    const reach = 90;
    const offsetX = this.facing === 'right' ? 45 : -45;
    const thrust = this.scene.add.rectangle(this.x + offsetX, this.y - 28, reach, 6, 0xcccccc, 0.85);
    thrust.setDepth(15);
    thrust.setAngle(this.facing === 'right' ? 0 : 180);

    this.scene.tweens.add({
      targets: thrust,
      alpha: 0,
      scaleX: 1.4,
      duration: 280,
      onComplete: () => thrust.destroy(),
    });

    const hitbox = new Phaser.Geom.Rectangle(
      this.facing === 'right' ? this.x : this.x - reach,
      this.y - 52,
      reach,
      36,
    );
    this.onAttackHit?.(hitbox, MissionBridge.getSpearDamage(), 220);

    this.scene.time.delayedCall(420, () => {
      if (!this.dead && !this.blocking) this.setTexture('malik');
      this.isSpearing = false;
    });
  }

  private performBowShot(): void {
    if (this.scene.time.now - this.lastBowTime < this.bowCooldownMs) return;

    this.lastBowTime = this.scene.time.now;
    SoundManager.play('attack');

    const damage = MissionBridge.getBowDamage();
    const arrow = this.scene.add.image(this.x, this.y - 32, 'arrow');
    arrow.setDepth(14);
    arrow.setFlipX(this.facing === 'left');
    if (this.facing === 'right') arrow.setAngle(-10);
    else arrow.setAngle(190);

    const targetX = this.x + (this.facing === 'right' ? 520 : -520);

    this.scene.tweens.add({
      targets: arrow,
      x: targetX,
      duration: 300,
      onUpdate: () => {
        this.onProjectileHit?.(arrow.x, arrow.y, damage);
      },
      onComplete: () => arrow.destroy(),
    });
  }

  private performWarCry(): void {
    if (this.scene.time.now - this.lastWarCryTime < this.warCryCooldownMs) return;

    this.lastWarCryTime = this.scene.time.now;
    SoundManager.play('wave');
    shakeCamera(this.scene, 0.012, 200);

    const centerX = this.x + (this.facing === 'right' ? 20 : -20);
    const centerY = this.y - 30;
    const ring = this.scene.add.circle(centerX, centerY, 8, 0xffcc44, 0.5).setDepth(15);
    this.scene.tweens.add({
      targets: ring,
      scale: 12,
      alpha: 0,
      duration: 450,
      onComplete: () => ring.destroy(),
    });

    this.onWarCryHit?.(centerX, centerY, MissionBridge.getWarCryDamage());
  }

  private performSentinelShield(): void {
    if (this.scene.time.now - this.lastSentinelTime < this.sentinelCooldownMs) return;

    this.lastSentinelTime = this.scene.time.now;
    this.invincibleUntil = this.scene.time.now + 2200;
    SoundManager.play('click');
    this.setTint(0x88ddff);
    const aura = this.scene.add.circle(this.x, this.y - 30, 20, 0x88ccff, 0.35).setDepth(14);
    this.scene.tweens.add({
      targets: aura,
      scale: 2.5,
      alpha: 0,
      duration: 2200,
      onComplete: () => aura.destroy(),
    });
    this.scene.time.delayedCall(2200, () => {
      if (!this.dead) this.clearTint();
    });
  }
}
