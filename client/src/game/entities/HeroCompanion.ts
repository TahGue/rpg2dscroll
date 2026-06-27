import Phaser from 'phaser';
import { getHero } from '@malik/shared';

const HERO_COLORS: Record<string, number> = {
  aisha: 0x66ccff,
  yusuf: 0x4488dd,
  hamza: 0xff8844,
  salim: 0xaa88ff,
};

/** Assigned hero visible on the defense battlefield. */
export class HeroCompanion extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, heroId: string) {
    super(scene, x, y);

    const hero = getHero(heroId);
    const color = HERO_COLORS[heroId] ?? 0xcccccc;

    const body = scene.add.rectangle(0, -28, 20, 34, color, 1).setStrokeStyle(2, 0xffffff, 0.5);
    const cloak = scene.add.triangle(0, -42, -12, -8, 12, -8, 0, -22, color, 0.65);
    this.add([body, cloak]);

    if (hero) {
      const label = scene.add
        .text(0, -58, hero.name, {
          fontSize: '10px',
          color: '#ffffff',
          fontFamily: 'Georgia, serif',
        })
        .setOrigin(0.5);
      this.add(label);
    }

    scene.add.existing(this);
    this.setDepth(8);
  }
}
