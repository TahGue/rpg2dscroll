import Phaser from 'phaser';
import type { HazardZoneDef } from '@malik/shared';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import { SoundManager } from './SoundManager';
import { shakeCamera, showDamageNumber } from '../utils/combatFeedback';

const SOFT_SAND_SPEED = 0.65;
const OASIS_HEAL_PER_SEC = 8;
const POISON_DPS = 6;

export class HazardManager {
  private zones: Array<{
    def: HazardZoneDef;
    xStart: number;
    xEnd: number;
    gfx: Phaser.GameObjects.Rectangle;
  }> = [];

  constructor(
    private scene: Phaser.Scene,
    hazards: HazardZoneDef[],
    private worldWidth: number,
    private groundY: number,
  ) {
    for (const def of hazards) {
      this.addZone(def);
    }
  }

  addPoisonPool(xStartRatio: number, xEndRatio: number): void {
    this.addZone({ type: 'poison_pool', xStartRatio, xEndRatio });
  }

  private addZone(def: HazardZoneDef): void {
    const xStart = this.worldWidth * def.xStartRatio;
    const xEnd = this.worldWidth * def.xEndRatio;
    const width = xEnd - xStart;
      const color =
        def.type === 'soft_sand'
          ? 0xc4a35a
          : def.type === 'poison_pool'
            ? 0x44aa44
            : def.type === 'wind_gust'
              ? 0xd4b86a
              : 0x2a8090;
      const alpha =
        def.type === 'oasis_heal' ? 0.15 : def.type === 'soft_sand' ? 0.2 : def.type === 'wind_gust' ? 0.12 : 0.25;

    const gfx = this.scene.add
      .rectangle(xStart + width / 2, this.groundY - 8, width, 28, color, alpha)
      .setDepth(1);

    this.zones.push({ def, xStart, xEnd, gfx });
  }

  update(player: Player, deltaMs: number): void {
    if (player.isDead()) {
      player.setSpeedMultiplier(1);
      return;
    }

    const px = player.x;
    let inSoftSand = false;
    let inOasisHeal = false;
    let inPoison = false;
    let windForce = 0;

    for (const zone of this.zones) {
      if (px < zone.xStart || px > zone.xEnd) continue;
      if (zone.def.type === 'soft_sand') inSoftSand = true;
      if (zone.def.type === 'oasis_heal') inOasisHeal = true;
      if (zone.def.type === 'poison_pool') inPoison = true;
      if (zone.def.type === 'wind_gust' && zone.def.windPush) windForce += zone.def.windPush;
    }

    player.setSpeedMultiplier(inSoftSand ? SOFT_SAND_SPEED : 1);

    if (windForce !== 0) {
      player.applyWindForce(windForce, deltaMs);
    }

    if (inOasisHeal && player.hp < player.maxHp) {
      player.heal((OASIS_HEAL_PER_SEC * deltaMs) / 1000);
    }

    if (inPoison) {
      player.applyEnvironmentalPoison(POISON_DPS, deltaMs);
    }
  }

  triggerRelicPulse(gateX: number, groundY: number, enemies: Phaser.GameObjects.Group): void {
    const cam = this.scene.cameras.main;
    SoundManager.play('wave');

    const pulse = this.scene.add
      .circle(gateX, groundY - 60, 20, 0x88ccff, 0.7)
      .setDepth(15);

    this.scene.tweens.add({
      targets: pulse,
      scaleX: 18,
      scaleY: 12,
      alpha: 0,
      duration: 900,
      ease: 'Sine.easeOut',
      onComplete: () => pulse.destroy(),
    });

    const banner = this.scene.add
      .text(cam.width / 2, cam.height / 2 - 120, 'Sentinel Light!', {
        fontSize: '24px',
        color: '#88ccff',
        fontFamily: 'Georgia, serif',
        stroke: '#1a1428',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);

    this.scene.time.delayedCall(1500, () => banner.destroy());
    shakeCamera(this.scene, 0.012, 300);

    const radius = 420;
    enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (!enemy.isAlive()) return;
      const d = Phaser.Math.Distance.Between(gateX, groundY - 40, enemy.x, enemy.y - 20);
      if (d <= radius) {
        const damage = 45;
        const knockbackDir = enemy.x > gateX ? 1 : -1;
        enemy.takeDamage(damage, knockbackDir, 180);
        showDamageNumber(this.scene, enemy.x, enemy.y - 30, damage, '#88ccff');
      }
    });
  }
}
