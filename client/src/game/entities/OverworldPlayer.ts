import Phaser from 'phaser';
import { OverworldInput } from '../systems/OverworldInput';

const WALK_SPEED = 220;
const PLAYER_RADIUS = 12;

export class OverworldPlayer extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'malik_overworld');
    scene.add.existing(this);
    this.setDepth(20);
  }

  wantsInteract(): boolean {
    return OverworldInput.consumeInteract();
  }

  updateMovement(
    deltaMs: number,
    worldWidth: number,
    worldHeight: number,
    isBlocked: (x: number, y: number) => boolean,
  ): void {
    let vx = 0;
    let vy = 0;

    if (OverworldInput.isHeld('left')) vx -= 1;
    if (OverworldInput.isHeld('right')) vx += 1;
    if (OverworldInput.isHeld('up')) vy -= 1;
    if (OverworldInput.isHeld('down')) vy += 1;

    if (vx === 0 && vy === 0) return;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    const step = WALK_SPEED * (deltaMs / 1000);
    const margin = PLAYER_RADIUS + 4;

    const tryX = Phaser.Math.Clamp(this.x + vx * step, margin, worldWidth - margin);
    if (!isBlocked(tryX, this.y)) {
      this.x = tryX;
    }

    const tryY = Phaser.Math.Clamp(this.y + vy * step, margin, worldHeight - margin);
    if (!isBlocked(this.x, tryY)) {
      this.y = tryY;
    }

    if (vx < 0) this.setFlipX(true);
    else if (vx > 0) this.setFlipX(false);
  }
}
