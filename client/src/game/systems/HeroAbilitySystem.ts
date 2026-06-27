import Phaser from 'phaser';
import { getHero } from '@malik/shared';
import { MissionBridge } from './MissionBridge';
import { SoundManager } from './SoundManager';
import type { Enemy } from '../entities/Enemy';

/** Hero support abilities during defense missions. */
export class HeroAbilitySystem {
  private lastUsed = 0;

  constructor(private scene: Phaser.Scene) {}

  tryUseAbility(playerX: number, playerY: number, facing: number, enemies: Enemy[]): boolean {
    const heroId = MissionBridge.getActiveHeroId();
    if (!heroId) return false;

    const hero = getHero(heroId);
    if (!hero) return false;

    const now = this.scene.time.now;
    const cooldownMs = Math.round(hero.activeCooldownMs * MissionBridge.getHeroCooldownMultiplier());
    if (now - this.lastUsed < cooldownMs) return false;

    if (heroId === 'aisha') {
      this.fireArrowRain(playerX, playerY, facing, hero.activeRange, hero.activeDamage, enemies);
      this.lastUsed = now;
      MissionBridge.syncHeroAbilityCooldown(0);
      return true;
    }

    if (heroId === 'hamza') {
      this.fireBurningLine(playerX, playerY, facing, hero.activeRange, hero.activeDamage, enemies);
      this.lastUsed = now;
      MissionBridge.syncHeroAbilityCooldown(0);
      return true;
    }

    if (heroId === 'yusuf' && hero.activeHeal) {
      this.healingSpring(playerX, playerY, hero.activeHeal);
      this.lastUsed = now;
      MissionBridge.syncHeroAbilityCooldown(0);
      return true;
    }

    if (heroId === 'salim' && hero.activeHeal) {
      this.sentinelWard(playerX, playerY, hero.activeHeal);
      this.lastUsed = now;
      MissionBridge.syncHeroAbilityCooldown(0);
      return true;
    }

    return false;
  }

  getCooldownPct(heroId: string | null): number {
    if (!heroId) return 1;
    const hero = getHero(heroId);
    if (!hero) return 1;
    const elapsed = this.scene.time.now - this.lastUsed;
    return Math.min(1, elapsed / Math.round(hero.activeCooldownMs * MissionBridge.getHeroCooldownMultiplier()));
  }

  tickCooldownSync(heroId: string | null): void {
    MissionBridge.syncHeroAbilityCooldown(this.getCooldownPct(heroId));
  }

  private fireArrowRain(
    playerX: number,
    playerY: number,
    facing: number,
    range: number,
    damage: number,
    enemies: Enemy[],
  ): void {
    SoundManager.play('attack');
    const dir = facing >= 0 ? 1 : -1;
    const lineY = playerY - 28;

    const flash = this.scene.add
      .rectangle(playerX, lineY - 20, range, 8, 0xffcc66, 0.35)
      .setOrigin(dir > 0 ? 0 : 1, 0.5)
      .setDepth(15);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 450, onComplete: () => flash.destroy() });

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const inLine =
        dir > 0
          ? enemy.x >= playerX && enemy.x <= playerX + range
          : enemy.x <= playerX && enemy.x >= playerX - range;
      if (inLine && Math.abs(enemy.y - lineY) < 55) {
        enemy.takeDamage(damage, dir);
      }
    }

    const banner = this.scene.add
      .text(playerX + dir * 80, lineY - 70, 'ARROW RAIN', {
        fontSize: '16px',
        color: '#ffdd88',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.time.delayedCall(900, () => banner.destroy());
  }

  private fireBurningLine(
    playerX: number,
    playerY: number,
    facing: number,
    range: number,
    damage: number,
    enemies: Enemy[],
  ): void {
    SoundManager.play('attack');
    const dir = facing >= 0 ? 1 : -1;
    const lineY = playerY - 28;

    const flash = this.scene.add
      .rectangle(playerX, lineY - 20, range, 10, 0xff6622, 0.45)
      .setOrigin(dir > 0 ? 0 : 1, 0.5)
      .setDepth(15);
    this.scene.tweens.add({ targets: flash, alpha: 0, duration: 550, onComplete: () => flash.destroy() });

    for (const enemy of enemies) {
      if (!enemy.isAlive()) continue;
      const inLine =
        dir > 0
          ? enemy.x >= playerX && enemy.x <= playerX + range
          : enemy.x <= playerX && enemy.x >= playerX - range;
      if (inLine && Math.abs(enemy.y - lineY) < 55) {
        enemy.takeDamage(damage, dir);
      }
    }

    const banner = this.scene.add
      .text(playerX + dir * 80, lineY - 70, 'BURNING LINE', {
        fontSize: '16px',
        color: '#ff8844',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.time.delayedCall(900, () => banner.destroy());
  }

  private sentinelWard(playerX: number, playerY: number, amount: number): void {
    SoundManager.play('click');
    const pillar = this.scene.add
      .rectangle(playerX, playerY - 40, 36, 90, 0x88aacc, 0.55)
      .setDepth(14);
    this.scene.tweens.add({
      targets: pillar,
      alpha: 0,
      scaleY: 1.4,
      duration: 800,
      onComplete: () => pillar.destroy(),
    });
    this.scene.events.emit('hero-sentinel-ward', amount);

    const banner = this.scene.add
      .text(playerX, playerY - 100, 'SENTINEL WARD', {
        fontSize: '16px',
        color: '#aaccff',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.time.delayedCall(900, () => banner.destroy());
  }

  private healingSpring(playerX: number, playerY: number, amount: number): void {
    SoundManager.play('click');
    const ring = this.scene.add
      .circle(playerX, playerY - 28, 24, 0x66ddff, 0.45)
      .setDepth(14);
    this.scene.tweens.add({
      targets: ring,
      scale: 5,
      alpha: 0,
      duration: 700,
      onComplete: () => ring.destroy(),
    });
    this.scene.events.emit('hero-healing-spring', amount);

    const banner = this.scene.add
      .text(playerX, playerY - 90, 'HEALING SPRING', {
        fontSize: '16px',
        color: '#88ddff',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.time.delayedCall(900, () => banner.destroy());
  }
}
