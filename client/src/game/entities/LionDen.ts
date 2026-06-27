import Phaser from 'phaser';

/** Built den — Sahar anchors here when constructed. */
export class LionDen extends Phaser.GameObjects.Container {
  readonly denX: number;
  readonly denY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.denX = x;
    this.denY = y;

    const cave = scene.add.ellipse(0, -12, 70, 36, 0x5c4033, 0.9);
    const opening = scene.add.ellipse(0, -8, 40, 22, 0x1a1008, 0.95);
    this.add([cave, opening]);

    scene.add
      .text(0, -48, 'LION DEN', {
        fontSize: '10px',
        color: '#d4a843',
        fontFamily: 'Georgia, serif',
      })
      .setOrigin(0.5);

    scene.add.existing(this);
    this.setDepth(5);
  }
}
