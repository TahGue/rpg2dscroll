import Phaser from 'phaser';
import { useGameStore } from '@/store/gameStore';
import { SoundManager } from '../systems/SoundManager';

export function showDamageNumber(scene: Phaser.Scene, x: number, y: number, damage: number, color = '#ff6b6b'): void {
  if (!useGameStore.getState().save.settings.showDamageNumbers) return;
  const text = scene.add
    .text(x, y - 20, String(Math.round(damage)), {
      fontSize: '16px',
      color,
      fontStyle: 'bold',
      stroke: '#1a1428',
      strokeThickness: 3,
    })
    .setOrigin(0.5)
    .setDepth(100);

  scene.tweens.add({
    targets: text,
    y: y - 50,
    alpha: 0,
    duration: 600,
    onComplete: () => text.destroy(),
  });
}

export function flashSprite(sprite: Phaser.GameObjects.Sprite, duration = 100): void {
  sprite.setTint(0xffffff);
  sprite.scene.time.delayedCall(duration, () => sprite.clearTint());
}

export function applyKnockback(body: Phaser.Physics.Arcade.Body, direction: number, force = 150): void {
  body.setVelocityX(direction * force);
}

export function shakeCamera(scene: Phaser.Scene, intensity = 0.005, duration = 150): void {
  scene.cameras.main.shake(duration, intensity);
}

export function spawnDust(scene: Phaser.Scene, x: number, y: number): void {
  const dust = scene.add.image(x, y, 'particle_dust').setAlpha(0.6).setDepth(50);
  scene.tweens.add({
    targets: dust,
    y: y - 20,
    alpha: 0,
    scale: 1.5,
    duration: 400,
    onComplete: () => dust.destroy(),
  });
}

export function spawnGoldPickup(scene: Phaser.Scene, x: number, y: number, amount: number): void {
  SoundManager.play('gold');

  const coin = scene.add.image(x, y, 'gold_coin').setDepth(20);
  const label = scene.add
    .text(x, y - 16, `+${amount}g`, { fontSize: '12px', color: '#d4a843', fontStyle: 'bold' })
    .setOrigin(0.5)
    .setDepth(20);

  scene.tweens.add({
    targets: [coin, label],
    y: y - 40,
    alpha: 0,
    duration: 800,
    ease: 'Sine.easeOut',
    onComplete: () => {
      coin.destroy();
      label.destroy();
    },
  });
}

export function spawnHealthPickup(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number,
  getPlayer: () => { x: number; y: number; heal: (n: number) => void; isDead: () => boolean },
): void {
  if (Math.random() > 0.18) return;

  const pickupY = y - 18;
  const heart = scene.add.circle(x, pickupY, 9, 0x44ff88, 0.9).setDepth(20);
  const label = scene.add
    .text(x, pickupY - 14, `+${amount}`, { fontSize: '11px', color: '#88ffaa', fontStyle: 'bold' })
    .setOrigin(0.5)
    .setDepth(20);

  const collect = () => {
    heart.destroy();
    label.destroy();
    timer.destroy();
    SoundManager.play('click');
  };

  const timer = scene.time.addEvent({
    delay: 80,
    loop: true,
    callback: () => {
      if (!heart.active) return;
      const player = getPlayer();
      if (player.isDead()) return;
      const d = Phaser.Math.Distance.Between(x, pickupY, player.x, player.y - 20);
      if (d < 40) {
        player.heal(amount);
        collect();
      }
    },
  });

  scene.time.delayedCall(10000, () => {
    if (heart.active) collect();
  });
}
